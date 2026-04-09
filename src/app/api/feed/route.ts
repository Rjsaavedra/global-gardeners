import { NextResponse } from "next/server";
import { createAuthedSupabaseClient } from "@/lib/supabase/authed-client";
import { resolveAuthenticatedRequest } from "@/lib/supabase/request-session";

type PostRow = {
  id: number;
  user_id: string;
  content: string | null;
  note: string | null;
  heart_count: number | null;
  comment_count: number | null;
  created_at: string;
};

type PostPhotoRow = {
  post_id: number;
  photo_url: string;
  sort_order: number;
};

type PostHeartRow = {
  post_id: number;
  user_id: string;
};

type PostCommentRow = {
  post_id: number;
  user_id: string;
  created_at: string;
  comment_text: string;
};

type OwnProfileRow = {
  user_id?: string;
  full_name: string | null;
  nickname: string | null;
  profile_photo_url: string | null;
  interests?: string[] | null;
};

type FeedSource = "you" | "following" | "interest";

type FeedPostModel = {
  id: number;
  authorId: string;
  createdAt: string;
  caption: string;
  tags: string[];
  mediaUrls: string[];
  mediaType: "image" | "video" | "carousel";
  likeCount: number;
  commentCount: number;
  saveCount: number;
  shareCount: number;
  viewCount: number;
  source: FeedSource;
};

type InteractionHistory = {
  likedPostIds: Set<number>;
  commentedPostIds: Set<number>;
  viewedPostIds: Set<number>;
  searchTags: Set<string>;
  authorEngagementCounts: Map<string, number>;
};

type PersonalizedUserProfile = {
  id: string;
  followingIds: Set<string>;
  interests: Set<string>;
  interactionHistory: InteractionHistory;
  dmInteractions: Map<string, number>;
  preferredMediaTypeWeights: {
    image: number;
    video: number;
    carousel: number;
  };
};

type RankingBreakdown = {
  interestScore: number;
  relationshipScore: number;
  engagementScore: number;
  recencyScore: number;
  contentPreferenceScore: number;
};

type RankedPost = {
  post: FeedPostModel;
  score: number;
  breakdown: RankingBreakdown;
  reason: string;
};

const INITIAL_POOL_LIMIT = 500;
const FINAL_FEED_LIMIT = 50;
const DEFAULT_FOLLOWING_AUTHOR_IDS = new Set<string>();
const TAG_STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "this",
  "that",
  "from",
  "your",
  "about",
  "have",
  "has",
  "new",
  "our",
]);

const WEIGHTS = {
  interest: 0.35,
  relationship: 0.25,
  engagement: 0.2,
  recency: 0.15,
  contentPreference: 0.05,
};

function toTimeAgo(createdAt: string) {
  const date = new Date(createdAt);
  const seconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));

  if (seconds < 60) return "just now";
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  const days = Math.floor(seconds / 86400);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function usernameFromUserId(userId: string) {
  return `gardener_${userId.replaceAll("-", "").slice(0, 8)}`;
}

function toNickname(fullName: string) {
  const normalized = fullName.trim().replace(/\s+/g, "").toLowerCase();
  return normalized ? `@${normalized}` : "";
}

function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function hoursSince(timestamp: string) {
  return Math.max(0, (Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60));
}

function normalizeTag(raw: string) {
  return raw.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
}

function extractTagsFromPost(caption: string, interests: Set<string>) {
  const hashtagMatches = Array.from(caption.matchAll(/#([a-zA-Z0-9_-]{2,32})/g)).map((m) => normalizeTag(m[1]));
  const interestMatches = Array.from(interests).filter((interest) => new RegExp(`\\b${interest}\\b`, "i").test(caption));
  const wordMatches = caption
    .toLowerCase()
    .split(/[^a-z0-9_-]+/)
    .map(normalizeTag)
    .filter((word) => word.length >= 3 && !TAG_STOPWORDS.has(word));

  return [...new Set([...hashtagMatches, ...interestMatches, ...wordMatches].filter(Boolean))].slice(0, 12);
}

function getTopSearchTagsFromHistory(likedCaptions: string[], commentedCaptions: string[]) {
  const counts = new Map<string, number>();
  for (const caption of [...likedCaptions, ...commentedCaptions]) {
    const tags = Array.from(caption.matchAll(/#([a-zA-Z0-9_-]{2,32})/g)).map((m) => normalizeTag(m[1]));
    for (const tag of tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return new Set(Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([tag]) => tag));
}

function buildUserProfile(params: {
  authUserId: string;
  ownProfile: OwnProfileRow | null;
  followingIds?: Set<string>;
  likedPostIds: Set<number>;
  commentedPostIds: Set<number>;
  likedPosts: FeedPostModel[];
  commentedPosts: FeedPostModel[];
  commentsByUserId: Map<string, number>;
}) {
  const interestSet = new Set((params.ownProfile?.interests ?? []).map(normalizeTag).filter(Boolean));

  const likedCaptions = params.likedPosts.map((post) => post.caption);
  const commentedCaptions = params.commentedPosts.map((post) => post.caption);
  const searchTags = getTopSearchTagsFromHistory(likedCaptions, commentedCaptions);

  const preferredMediaTypeWeights = {
    image: 0.33,
    video: 0.33,
    carousel: 0.34,
  };

  const mediaTypeCounts = { image: 0, video: 0, carousel: 0 };
  for (const post of [...params.likedPosts, ...params.commentedPosts]) {
    mediaTypeCounts[post.mediaType] += 1;
  }

  const mediaTotal = mediaTypeCounts.image + mediaTypeCounts.video + mediaTypeCounts.carousel;
  if (mediaTotal > 0) {
    preferredMediaTypeWeights.image = mediaTypeCounts.image / mediaTotal;
    preferredMediaTypeWeights.video = mediaTypeCounts.video / mediaTotal;
    preferredMediaTypeWeights.carousel = mediaTypeCounts.carousel / mediaTotal;
  }

  return {
    id: params.authUserId,
    followingIds: params.followingIds ?? DEFAULT_FOLLOWING_AUTHOR_IDS,
    interests: interestSet,
    dmInteractions: new Map<string, number>(),
    preferredMediaTypeWeights,
    interactionHistory: {
      likedPostIds: params.likedPostIds,
      commentedPostIds: params.commentedPostIds,
      viewedPostIds: new Set<number>(),
      searchTags,
      authorEngagementCounts: params.commentsByUserId,
    },
  } satisfies PersonalizedUserProfile;
}

function getInterestScore(user: PersonalizedUserProfile, post: FeedPostModel) {
  if (!post.tags.length && user.interests.size === 0) return 0.2;

  const userInterestMatches = post.tags.filter((tag) => user.interests.has(tag)).length;
  const searchTagMatches = post.tags.filter((tag) => user.interactionHistory.searchTags.has(tag)).length;
  const directHistoryMatch =
    user.interactionHistory.likedPostIds.has(post.id) || user.interactionHistory.commentedPostIds.has(post.id) ? 1 : 0;

  const tagCoverage = post.tags.length > 0 ? userInterestMatches / post.tags.length : 0;
  const searchCoverage = post.tags.length > 0 ? searchTagMatches / post.tags.length : 0;

  return clamp(tagCoverage * 0.6 + searchCoverage * 0.3 + directHistoryMatch * 0.1);
}

function getRelationshipScore(user: PersonalizedUserProfile, post: FeedPostModel) {
  const followedBoost = user.followingIds.has(post.authorId) ? 1 : 0;
  const authorInteractionCount = user.interactionHistory.authorEngagementCounts.get(post.authorId) ?? 0;
  const interactionBoost = clamp(authorInteractionCount / 10);
  const dmBoost = clamp((user.dmInteractions.get(post.authorId) ?? 0) / 10);

  return clamp(followedBoost * 0.6 + interactionBoost * 0.3 + dmBoost * 0.1);
}

function getEngagementScore(post: FeedPostModel) {
  const weightedInteractions = post.likeCount + post.commentCount * 2 + post.saveCount * 3 + post.shareCount * 3;
  return clamp(weightedInteractions / Math.max(1, post.viewCount));
}

function getRecencyScore(post: FeedPostModel) {
  return clamp(Math.exp(-hoursSince(post.createdAt) / 24));
}

function getContentPreferenceScore(user: PersonalizedUserProfile, post: FeedPostModel) {
  return clamp(user.preferredMediaTypeWeights[post.mediaType]);
}

function getRankReason(post: FeedPostModel, breakdown: RankingBreakdown, user: PersonalizedUserProfile) {
  if (breakdown.relationshipScore >= 0.65 && user.followingIds.has(post.authorId)) {
    return "Because you follow this creator and engage with their posts.";
  }

  if (breakdown.interestScore >= 0.6 && post.tags.length > 0) {
    return `Because you liked similar ${post.tags.slice(0, 2).join("/")} content.`;
  }

  if (breakdown.engagementScore >= 0.5) {
    return "Trending post with strong community engagement.";
  }

  if (breakdown.recencyScore >= 0.7) {
    return "Fresh post from your community.";
  }

  return "Recommended based on your activity.";
}

function scorePost(user: PersonalizedUserProfile, post: FeedPostModel): RankedPost {
  const breakdown: RankingBreakdown = {
    interestScore: getInterestScore(user, post),
    relationshipScore: getRelationshipScore(user, post),
    engagementScore: getEngagementScore(post),
    recencyScore: getRecencyScore(post),
    contentPreferenceScore: getContentPreferenceScore(user, post),
  };

  const score =
    breakdown.interestScore * WEIGHTS.interest +
    breakdown.relationshipScore * WEIGHTS.relationship +
    breakdown.engagementScore * WEIGHTS.engagement +
    breakdown.recencyScore * WEIGHTS.recency +
    breakdown.contentPreferenceScore * WEIGHTS.contentPreference;

  return {
    post,
    score,
    breakdown,
    reason: getRankReason(post, breakdown, user),
  };
}

function buildCandidatePool(posts: FeedPostModel[], user: PersonalizedUserProfile) {
  const followingPosts = posts.filter((post) => user.followingIds.has(post.authorId));
  const recommendedPosts = posts.filter((post) => !user.followingIds.has(post.authorId));

  const interestRecommended = recommendedPosts.filter((post) => post.tags.some((tag) => user.interests.has(tag)));
  const highEngagementRecommended = recommendedPosts
    .slice()
    .sort((a, b) => getEngagementScore(b) - getEngagementScore(a))
    .slice(0, 200);

  const trendingRecommended = recommendedPosts
    .slice()
    .sort((a, b) => getEngagementScore(b) * getRecencyScore(b) - getEngagementScore(a) * getRecencyScore(a))
    .slice(0, 150);

  const deduped = new Map<number, FeedPostModel>();
  for (const post of [...followingPosts, ...interestRecommended, ...highEngagementRecommended, ...trendingRecommended]) {
    if (!deduped.has(post.id)) deduped.set(post.id, post);
    if (deduped.size >= INITIAL_POOL_LIMIT) break;
  }

  return Array.from(deduped.values());
}

function enforceDiversity(ranked: RankedPost[]) {
  const deduped = new Map<number, RankedPost>();
  for (const entry of ranked) {
    if (!deduped.has(entry.post.id)) {
      deduped.set(entry.post.id, entry);
    }
  }

  const ordered = Array.from(deduped.values());
  const primary: RankedPost[] = [];
  const deferredByAuthor = new Map<string, RankedPost[]>();

  for (const entry of ordered) {
    const authorRecentCount = primary.slice(-3).filter((item) => item.post.authorId === entry.post.authorId).length;
    if (authorRecentCount >= 3) {
      const list = deferredByAuthor.get(entry.post.authorId) ?? [];
      list.push(entry);
      deferredByAuthor.set(entry.post.authorId, list);
      continue;
    }
    primary.push(entry);
  }

  if (primary.length < ordered.length) {
    for (const entry of ordered) {
      if (primary.some((item) => item.post.id === entry.post.id)) continue;
      primary.push(entry);
    }
  }

  return primary;
}

function injectRecommendedCadence(ranked: RankedPost[]) {
  const following = ranked.filter((entry) => entry.post.source === "following" || entry.post.source === "you");
  const recommended = ranked.filter((entry) => entry.post.source === "interest");

  const output: RankedPost[] = [];
  let followIndex = 0;
  let recommendationIndex = 0;
  let sinceLastRecommendation = 0;
  let nextRecommendationGap = 5;

  while (output.length < ranked.length && (followIndex < following.length || recommendationIndex < recommended.length)) {
    const shouldInjectRecommendation =
      recommendationIndex < recommended.length &&
      (sinceLastRecommendation >= nextRecommendationGap || followIndex >= following.length);

    if (shouldInjectRecommendation) {
      output.push(recommended[recommendationIndex]);
      recommendationIndex += 1;
      sinceLastRecommendation = 0;
      nextRecommendationGap = nextRecommendationGap === 5 ? 7 : 5;
      continue;
    }

    if (followIndex < following.length) {
      output.push(following[followIndex]);
      followIndex += 1;
      sinceLastRecommendation += 1;
      continue;
    }

    output.push(recommended[recommendationIndex]);
    recommendationIndex += 1;
    sinceLastRecommendation = 0;
  }

  return output;
}

function buildFeed(posts: FeedPostModel[], user: PersonalizedUserProfile) {
  const candidatePool = buildCandidatePool(posts, user);
  const ranked = candidatePool.map((post) => scorePost(user, post)).sort((a, b) => b.score - a.score);
  const diversified = enforceDiversity(ranked);
  const withCadence = injectRecommendedCadence(diversified);
  return withCadence.slice(0, FINAL_FEED_LIMIT);
}

export async function GET(request: Request) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createAuthedSupabaseClient(auth.accessToken);

  const postsQuery = await supabase
    .from("posts")
    .select("id, user_id, content, note, heart_count, comment_count, created_at")
    .order("created_at", { ascending: false })
    .limit(INITIAL_POOL_LIMIT);

  let postRows: PostRow[] = [];
  if (!postsQuery.error) {
    postRows = (postsQuery.data ?? []) as PostRow[];
  } else {
    const fallbackQuery = await supabase
      .from("posts")
      .select("id, user_id, content, note, heart_count, created_at")
      .order("created_at", { ascending: false })
      .limit(INITIAL_POOL_LIMIT);

    if (fallbackQuery.error) {
      return NextResponse.json({ error: fallbackQuery.error.message }, { status: 400 });
    }

    postRows = ((fallbackQuery.data ?? []) as Omit<PostRow, "comment_count">[]).map((post) => ({
      ...post,
      comment_count: null,
    }));
  }

  const postIds = postRows.map((post) => post.id);
  const postUserIds = [...new Set(postRows.map((post) => post.user_id))];

  const [
    { data: photos },
    { data: authorProfiles },
    commentsFallbackResult,
    postHeartsResult,
    { data: authUserData },
    ownProfileResult,
    ownLikedHeartsResult,
    ownCommentsResult,
  ] = await Promise.all([
    postIds.length
      ? supabase.from("post_photos").select("post_id, photo_url, sort_order").in("post_id", postIds).order("sort_order", { ascending: true })
      : Promise.resolve({ data: [] as PostPhotoRow[] }),
    postUserIds.length
      ? supabase.from("profiles").select("user_id, full_name, nickname, profile_photo_url").in("user_id", postUserIds)
      : Promise.resolve({ data: [] as OwnProfileRow[] }),
    postIds.length ? supabase.from("post_comments").select("post_id, user_id, created_at, comment_text").in("post_id", postIds) : Promise.resolve({ data: [] as PostCommentRow[] }),
    postIds.length ? supabase.from("post_hearts").select("post_id, user_id").in("post_id", postIds) : Promise.resolve({ data: [] as PostHeartRow[] }),
    supabase.auth.getUser(),
    supabase.from("profiles").select("user_id, full_name, nickname, profile_photo_url, interests").eq("user_id", auth.userId).maybeSingle(),
    supabase.from("post_hearts").select("post_id").eq("user_id", auth.userId),
    supabase.from("post_comments").select("post_id").eq("user_id", auth.userId),
  ]);

  const photosByPostId = new Map<number, PostPhotoRow[]>();
  for (const photo of (photos ?? []) as PostPhotoRow[]) {
    const list = photosByPostId.get(photo.post_id) ?? [];
    list.push(photo);
    photosByPostId.set(photo.post_id, list);
  }

  const commentsCountByPostId = new Map<number, number>();
  const commentsByAuthorId = new Map<string, number>();
  const commentRows = (commentsFallbackResult.data ?? []) as PostCommentRow[];
  for (const comment of commentRows) {
    commentsCountByPostId.set(comment.post_id, (commentsCountByPostId.get(comment.post_id) ?? 0) + 1);
    commentsByAuthorId.set(comment.user_id, (commentsByAuthorId.get(comment.user_id) ?? 0) + 1);
  }

  const heartsCountByPostId = new Map<number, number>();
  const likedPostIdsByMe = new Set<number>();
  for (const heart of (postHeartsResult.data ?? []) as PostHeartRow[]) {
    heartsCountByPostId.set(heart.post_id, (heartsCountByPostId.get(heart.post_id) ?? 0) + 1);
    if (heart.user_id === auth.userId) likedPostIdsByMe.add(heart.post_id);
  }

  for (const ownHeart of (ownLikedHeartsResult.data ?? []) as { post_id: number }[]) {
    likedPostIdsByMe.add(ownHeart.post_id);
  }

  const commentedPostIdsByMe = new Set<number>();
  for (const ownComment of (ownCommentsResult.data ?? []) as { post_id: number }[]) {
    commentedPostIdsByMe.add(ownComment.post_id);
  }

  const profilesByUserId = new Map<string, OwnProfileRow>();
  for (const profile of (authorProfiles ?? []) as OwnProfileRow[]) {
    if (typeof profile.user_id === "string") profilesByUserId.set(profile.user_id, profile);
  }

  const ownProfileRow = (ownProfileResult.data as OwnProfileRow | null) ?? profilesByUserId.get(auth.userId) ?? null;

  const metadataName = typeof authUserData?.user?.user_metadata?.full_name === "string" ? authUserData.user.user_metadata.full_name.trim() : "";
  const emailName = authUserData?.user?.email?.split("@")[0]?.trim() ?? "";
  const ownFallbackName = metadataName || emailName || "Global Gardener";
  const ownFallbackNickname = ownFallbackName ? toNickname(ownFallbackName) : "";
  const ownName = ownProfileRow?.full_name?.trim() || ownFallbackName;
  const ownNickname = ownProfileRow?.nickname?.trim() || ownFallbackNickname;
  const ownAvatarUrl = ownProfileRow?.profile_photo_url?.trim() || null;
  const fallbackFullName = "Global Gardener";

  const feedModels: FeedPostModel[] = postRows.map((post) => {
    const postPhotos = photosByPostId.get(post.id) ?? [];
    const caption = post.note?.trim() || post.content?.trim() || "Shared a new update.";

    const likeCount = Math.max(0, heartsCountByPostId.get(post.id) ?? post.heart_count ?? 0);
    const commentCount = Math.max(0, post.comment_count ?? commentsCountByPostId.get(post.id) ?? 0);
    const mediaType: FeedPostModel["mediaType"] = postPhotos.length > 1 ? "carousel" : "image";

    return {
      id: post.id,
      authorId: post.user_id,
      createdAt: post.created_at,
      caption,
      tags: extractTagsFromPost(caption, new Set((ownProfileRow?.interests ?? []).map(normalizeTag).filter(Boolean))),
      mediaUrls: postPhotos.map((photo) => photo.photo_url),
      mediaType,
      likeCount,
      commentCount,
      saveCount: 0,
      shareCount: 0,
      viewCount: Math.max(1, likeCount * 6 + commentCount * 4 + 25),
      source: post.user_id === auth.userId ? "you" : "interest",
    };
  });

  const followedAuthorIds = new Set<string>();
  for (const post of feedModels) {
    const engagement = commentsByAuthorId.get(post.authorId) ?? 0;
    if (engagement >= 2) followedAuthorIds.add(post.authorId);
  }

  const likedPosts = feedModels.filter((post) => likedPostIdsByMe.has(post.id));
  const commentedPosts = feedModels.filter((post) => commentedPostIdsByMe.has(post.id));

  const userProfile = buildUserProfile({
    authUserId: auth.userId,
    ownProfile: ownProfileRow,
    followingIds: followedAuthorIds,
    likedPostIds: likedPostIdsByMe,
    commentedPostIds: commentedPostIdsByMe,
    likedPosts,
    commentedPosts,
    commentsByUserId: commentsByAuthorId,
  });

  for (const post of feedModels) {
    if (post.authorId === auth.userId || userProfile.followingIds.has(post.authorId)) {
      post.source = post.authorId === auth.userId ? "you" : "following";
    }
  }

  const rankedFeed = buildFeed(feedModels, userProfile);

  const feed = rankedFeed.map((entry) => {
    const post = entry.post;
    const firstPhoto = post.mediaUrls[0];
    const isOwnPost = post.authorId === auth.userId;
    const authorProfile = profilesByUserId.get(post.authorId);
    const authorName = isOwnPost ? ownName : authorProfile?.full_name?.trim() || fallbackFullName;
    const authorNickname = isOwnPost
      ? ownNickname || toNickname(authorName)
      : authorProfile?.nickname?.trim() || toNickname(authorName);
    const authorProfilePhotoUrl = isOwnPost ? ownAvatarUrl : authorProfile?.profile_photo_url?.trim() || null;

    return {
      id: `post-${post.id}`,
      source: post.source,
      authorName,
      username: authorNickname ? authorNickname.replace(/^@/, "") : usernameFromUserId(post.authorId),
      avatarUrl: authorProfilePhotoUrl,
      speciesName: undefined,
      mediaUrl: firstPhoto,
      mediaUrls: post.mediaUrls,
      caption: post.caption,
      hearts: post.likeCount,
      likedByMe: likedPostIdsByMe.has(post.id),
      comments: post.commentCount,
      publishedAgo: toTimeAgo(post.createdAt),
      score: Number(entry.score.toFixed(4)),
      reason: entry.reason,
      scoreBreakdown: {
        interestScore: Number(entry.breakdown.interestScore.toFixed(4)),
        relationshipScore: Number(entry.breakdown.relationshipScore.toFixed(4)),
        engagementScore: Number(entry.breakdown.engagementScore.toFixed(4)),
        recencyScore: Number(entry.breakdown.recencyScore.toFixed(4)),
        contentPreferenceScore: Number(entry.breakdown.contentPreferenceScore.toFixed(4)),
      },
    };
  });

  const response = NextResponse.json({ posts: feed });
  auth.applyRefreshedCookies(response);
  return response;
}
