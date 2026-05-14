"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DrawerItem, DrawerProfile, SideDrawer } from "@/components/feed-side-drawer";
import { getDrawerItems } from "@/components/drawer-items";

const heroAvatar = "/images/figma/placeholder-expired.png";
const heroVideoA = "/images/figma/placeholder-expired.png";
const heroVideoB = "/images/figma/placeholder-expired.png";
const playOverlay = "/icons/gallery.svg";
const voteAvatar = "/images/figma/placeholder-expired.png";
const pastAvatar = "/images/figma/placeholder-expired.png";
const ellipsisIcon = "/icons/new-plant/ellipsis-vertical.svg";
const checkIcon = "/icons/onboarding-check.svg";

function MenuIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path d="M20 11.25C20.4142 11.25 20.75 11.5858 20.75 12C20.75 12.4142 20.4142 12.75 20 12.75H4C3.58579 12.75 3.25 12.4142 3.25 12C3.25 11.5858 3.58579 11.25 4 11.25H20Z" fill="currentColor" />
      <path d="M20 17.25C20.4142 17.25 20.75 17.5858 20.75 18C20.75 18.4142 20.4142 18.75 20 18.75H4C3.58579 18.75 3.25 18.4142 3.25 18C3.25 17.5858 3.58579 17.25 4 17.25H20Z" fill="currentColor" />
      <path d="M20 5.25C20.4142 5.25 20.75 5.58579 20.75 6C20.75 6.41421 20.4142 6.75 20 6.75H4C3.58579 6.75 3.25 6.41421 3.25 6C3.25 5.58579 3.58579 5.25 4 5.25H20Z" fill="currentColor" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path d="M13.0823 20.625C13.2894 20.2663 13.7481 20.1435 14.1067 20.3506C14.4655 20.5577 14.5883 21.0163 14.3812 21.375C14.1398 21.7929 13.7932 22.1405 13.3753 22.3818C12.9574 22.6231 12.4829 22.7499 12.0003 22.75C11.5178 22.75 11.0432 22.623 10.6253 22.3818C10.2073 22.1405 9.85984 21.793 9.61847 21.375C9.41134 21.0163 9.53418 20.5577 9.89288 20.3506C10.2516 20.1435 10.7102 20.2663 10.9173 20.625C11.027 20.815 11.1853 20.9723 11.3753 21.082C11.5653 21.1917 11.7809 21.25 12.0003 21.25C12.2196 21.2499 12.4354 21.1917 12.6253 21.082C12.8151 20.9724 12.9727 20.8148 13.0823 20.625Z" fill="currentColor" />
      <path d="M17.2496 8C17.2496 6.60779 16.6969 5.27262 15.7125 4.28809C14.728 3.30352 13.392 2.75 11.9996 2.75C10.6073 2.75007 9.27223 3.30358 8.28772 4.28809C7.30323 5.27264 6.74963 6.60767 6.74963 8C6.74963 10.3279 6.38421 11.9327 5.80628 13.1562C5.2337 14.3683 4.47511 15.1507 3.81604 15.8311L3.776 15.8906C3.76542 15.9124 3.75748 15.9359 3.75354 15.96C3.74582 16.0076 3.75265 16.0564 3.7721 16.1006C3.7916 16.1448 3.82343 16.1825 3.86389 16.209C3.90447 16.2355 3.95216 16.25 4.00061 16.25H20.0006C20.0487 16.2499 20.096 16.2361 20.1364 16.21C20.1769 16.1836 20.2095 16.1458 20.2291 16.1016C20.2487 16.0573 20.2545 16.0078 20.2467 15.96C20.239 15.9122 20.2177 15.8678 20.1852 15.832C19.5247 15.1513 18.7654 14.3687 18.193 13.1572C17.6148 11.9335 17.2496 10.328 17.2496 8ZM18.7496 8C18.7496 10.171 19.0901 11.5444 19.5494 12.5166C20.0095 13.4902 20.6126 14.1188 21.278 14.8047C21.2835 14.8104 21.2892 14.8164 21.2946 14.8223C21.5228 15.0731 21.6728 15.385 21.7272 15.7197C21.7815 16.0545 21.7374 16.3979 21.6002 16.708C21.463 17.0181 21.2389 17.2818 20.9547 17.4668C20.7061 17.6286 20.421 17.7238 20.1266 17.7451L19.9996 17.75H3.99963C3.66057 17.7498 3.32855 17.6511 3.04456 17.4658C2.7605 17.2805 2.53588 17.0164 2.39905 16.7061C2.26226 16.3958 2.21935 16.0524 2.27405 15.7178C2.32882 15.383 2.47903 15.0709 2.70764 14.8203L2.72327 14.8037C3.38742 14.118 3.9908 13.4894 4.45081 12.5156C4.90993 11.5435 5.24963 10.1706 5.24963 8C5.24963 6.20979 5.9613 4.49243 7.22717 3.22656C8.49295 1.96098 10.2097 1.25007 11.9996 1.25C13.7898 1.25 15.5072 1.96077 16.7731 3.22656C18.0389 4.49243 18.7496 6.20979 18.7496 8Z" fill="currentColor" />
    </svg>
  );
}

function VideoCard({ image, mutedAgo }: { image: string; mutedAgo?: boolean }) {
  return (
    <article className="w-[min(265px,calc(100vw-80px))] shrink-0 rounded-[12px] bg-[#f7f7f7] p-4">
      <div className="relative aspect-[295/166] w-full overflow-hidden rounded-[8px]">
        <img src={image} alt="" className="h-full w-full rounded-[8px] object-cover" />
        <div className="absolute right-2 top-2 flex h-[40px] w-[40px] items-center justify-center">
          <img src={playOverlay} alt="" className="h-[40px] w-[40px]" />
        </div>
        <span className="absolute bottom-2 right-2 rounded-[6px] bg-black px-2 py-1 text-[12px] font-medium leading-[1.2] text-white">12:00</span>
      </div>
      <div className="mt-4 flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-medium leading-[1.2] text-[#333333]">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          <div className="mt-2 flex items-center gap-[6px]">
            <span className="text-[12px] font-medium leading-4 text-[#333333cc]">3.5k views</span>
            <span aria-hidden="true" className="inline-block h-1 w-1 rounded-full bg-[#33333380]" />
            <span className={`text-[12px] leading-4 ${mutedAgo ? "font-normal text-[#33333380]" : "font-medium text-[#33333380]"}`}>1 day ago</span>
          </div>
        </div>
        <img src={ellipsisIcon} alt="" className="mt-1 h-4 w-4" />
      </div>
    </article>
  );
}

function formatViews(viewsCount: number) {
  if (viewsCount >= 1_000_000) return `${(viewsCount / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (viewsCount >= 1_000) return `${(viewsCount / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${viewsCount}`;
}

function formatDuration(durationSeconds: number) {
  const total = Math.max(0, Math.floor(durationSeconds));
  const min = Math.floor(total / 60);
  const sec = total % 60;
  return `${min}:${String(sec).padStart(2, "0")}`;
}

function extractYouTubeVideoId(videoUrl?: string | null) {
  if (!videoUrl) return null;
  try {
    const parsed = new URL(videoUrl);
    if (parsed.hostname.includes("youtu.be")) {
      const fromPath = parsed.pathname.replace("/", "").trim();
      if (fromPath) return fromPath;
    }
    const fromQuery = parsed.searchParams.get("v");
    if (fromQuery) return fromQuery;
  } catch {
    // ignore malformed video url and fallback below
  }
  return null;
}

function resolveVideoThumbnail(thumbnailUrl: string | null, videoUrl?: string | null) {
  if (thumbnailUrl && thumbnailUrl.trim().length > 0) return thumbnailUrl;
  const videoId = extractYouTubeVideoId(videoUrl);
  if (videoId) return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  return heroVideoA;
}

function formatSpotlightMonth(value: string) {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function toEmbedUrl(videoUrl?: string | null) {
  const videoId = extractYouTubeVideoId(videoUrl);
  if (!videoId) return null;
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=1&rel=0&playsinline=1`;
}

export default function InfluencerSpotlightPage() {
  const router = useRouter();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [featuredInfluencer, setFeaturedInfluencer] = useState<{
    id: number;
    name: string;
    shortDescription: string;
    description: string;
    avatarUrl: string | null;
  } | null>(null);
  const [featuredVideos, setFeaturedVideos] = useState<
    Array<{ id: number; title: string; thumbnailUrl: string | null; durationSeconds: number; viewsCount: number; publishedAt: string | null }>
  >([]);
  const [nominees, setNominees] = useState<
    Array<{ id: number; votesCount: number; percentage?: number; influencer: { id: number; slug: string; name: string; shortDescription: string; avatarUrl: string | null } }>
  >([]);
  const [pastCreators, setPastCreators] = useState<
    Array<{ id: number; spotlightMonth: string; influencer: { slug: string; name: string; shortDescription: string; avatarUrl: string | null } }>
  >([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>("");
  const [votedNomineeId, setVotedNomineeId] = useState<string>("");
  const [hasVotedThisCycle, setHasVotedThisCycle] = useState(false);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [flowState, setFlowState] = useState<"none" | "vote-confirm" | "suggest" | "suggest-confirm">("none");
  const [suggestText, setSuggestText] = useState("");
  const [isSubmittingSuggestion, setIsSubmittingSuggestion] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const [videoModalUrl, setVideoModalUrl] = useState<string | null>(null);
  const [videoModalWatchUrl, setVideoModalWatchUrl] = useState<string | null>(null);
  const [isDrawerMounted, setIsDrawerMounted] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [drawerProfile, setDrawerProfile] = useState<DrawerProfile>({
    fullName: "Global Gardener",
    nickname: "@Global Gardener",
    profilePhotoUrl: null,
  });

  const drawerCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLElement | null>(null);

  const drawerItems: DrawerItem[] = getDrawerItems("Influencer Spotlight");

  useEffect(() => {
    let isMounted = true;

    async function loadDrawerProfile() {
      const response = await fetch("/api/profile/me");
      if (!response.ok) return;

      const profile = (await response.json()) as Partial<DrawerProfile>;
      if (!isMounted) return;

      const fullName = typeof profile.fullName === "string" && profile.fullName.trim() ? profile.fullName.trim() : "Global Gardener";
      const nickname = typeof profile.nickname === "string" && profile.nickname.trim() ? profile.nickname.trim() : `@${fullName}`;
      const profilePhotoUrl = typeof profile.profilePhotoUrl === "string" && profile.profilePhotoUrl.trim() ? profile.profilePhotoUrl.trim() : null;

      setDrawerProfile({ fullName, nickname, profilePhotoUrl });
    }

    void loadDrawerProfile();
    const refreshUnreadNotifications = async () => {
      try {
        const response = await fetch("/api/notifications", { cache: "no-store" });
        if (!response.ok || !isMounted) return;
        const payload = (await response.json()) as { unreadCount?: number };
        if (!isMounted) return;
        setUnreadNotifications(Math.max(0, payload.unreadCount ?? 0));
      } catch {}
    };
    void refreshUnreadNotifications();
    const intervalId = setInterval(() => {
      void refreshUnreadNotifications();
    }, 20000);
    const handleFocus = () => {
      void refreshUnreadNotifications();
    };
    window.addEventListener("focus", handleFocus);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadFeatured = async () => {
      try {
        const response = await fetch("/api/influencer-spotlight", { cache: "no-store" });
        if (!response.ok || !isMounted) return;
        const payload = (await response.json()) as {
          featured: { id: number; name: string; shortDescription: string; description: string; avatarUrl: string | null } | null;
          videos: Array<{ id: number; title: string; thumbnailUrl: string | null; durationSeconds: number; viewsCount: number; publishedAt: string | null }>;
          nominees?: Array<{ id: number; votesCount: number; percentage?: number; influencer: { id: number; slug: string; name: string; shortDescription: string; avatarUrl: string | null } }>;
          pastCreators?: Array<{ id: number; spotlightMonth: string; influencer: { slug: string; name: string; shortDescription: string; avatarUrl: string | null } }>;
          currentUserVote?: { nomineeId: number } | null;
          hasVoted?: boolean;
        };
        if (!isMounted) return;
        setFeaturedInfluencer(payload.featured);
        setFeaturedVideos(Array.isArray(payload.videos) ? payload.videos : []);
        setPastCreators(Array.isArray(payload.pastCreators) ? payload.pastCreators : []);
        const nomineeRows = Array.isArray(payload.nominees) ? payload.nominees : [];
        setNominees(nomineeRows);
        if (nomineeRows.length > 0) {
          setSelectedCandidateId(String(nomineeRows[0].id));
        }
        const userVoted = Boolean(payload.hasVoted);
        setHasVotedThisCycle(userVoted);
        if (userVoted && payload.currentUserVote?.nomineeId) {
          const votedId = String(payload.currentUserVote.nomineeId);
          setVotedNomineeId(votedId);
          setSelectedCandidateId(votedId);
        }
      } catch {}
    };
    void loadFeatured();
    return () => {
      isMounted = false;
    };
  }, []);

  const openDrawer = () => {
    if (drawerCloseTimerRef.current) {
      clearTimeout(drawerCloseTimerRef.current);
      drawerCloseTimerRef.current = null;
    }
    if (isDrawerMounted) return;

    menuTriggerRef.current = document.activeElement as HTMLButtonElement | null;
    setIsDrawerMounted(true);
    requestAnimationFrame(() => setIsDrawerVisible(true));
  };

  const closeDrawer = () => {
    setIsDrawerVisible(false);
    drawerCloseTimerRef.current = setTimeout(() => {
      setIsDrawerMounted(false);
      menuTriggerRef.current?.focus();
      drawerCloseTimerRef.current = null;
    }, 300);
  };

  useEffect(() => {
    if (!isDrawerVisible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };

    window.addEventListener("keydown", handleKeyDown);
    drawerRef.current?.querySelector<HTMLButtonElement>("button")?.focus();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDrawerVisible]);

  useEffect(() => {
    if (isDrawerMounted) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }

    document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerMounted]);

  const handleCreatePost = () => {
    closeDrawer();
    router.push("/new-post");
  };

  const handleOpenProfile = () => {
    closeDrawer();
    router.push("/profile");
  };

  const handleSelectDrawerItem = (item: DrawerItem) => {
    closeDrawer();
    if (item.label === "Stream") {
      router.push("/feed");
      return;
    }
    if (item.label === "My Garden") {
      router.push("/my-garden");
      return;
    }
    if (item.label === "Plant ID") {
      router.push("/my-garden/add-plant");
      return;
    }
    if (item.label === "MyGrowMate") {
      router.push("/my-grow-mate");
      return;
    }
    if (item.label === "Guides") {
      router.push("/guides");
      return;
    }
    if (item.label === "Notifications") {
      router.push("/notifications");
      return;
    }
    if (item.label === "Settings") {
      router.push("/settings");
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
      setIsLoggingOut(false);
    }
  };

  const closeFlow = () => {
    setFlowState("none");
    setSuggestText("");
    setSuggestError(null);
  };

  const handleSubmitSuggestion = async () => {
    if (isSubmittingSuggestion) return;
    const text = suggestText.trim();
    if (text.length < 3) {
      setSuggestError("Please enter at least 3 characters.");
      return;
    }
    setIsSubmittingSuggestion(true);
    setSuggestError(null);
    try {
      const response = await fetch("/api/influencer-spotlight/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestionText: text }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setSuggestError(payload?.error ?? "Unable to send suggestion.");
        return;
      }
      setFlowState("suggest-confirm");
    } finally {
      setIsSubmittingSuggestion(false);
    }
  };

  const handleSubmitVote = async () => {
    if (!selectedCandidateId || isSubmittingVote) return;
    setIsSubmittingVote(true);
    try {
      const response = await fetch("/api/influencer-spotlight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nomineeId: Number(selectedCandidateId) }),
      });
      if (!response.ok) return;
      const votePayload = (await response.json()) as { votedNomineeId?: number };
      const votedId = String(votePayload.votedNomineeId ?? selectedCandidateId);
      setNominees((prev) =>
        prev.map((n) => (String(n.id) === selectedCandidateId ? { ...n, votesCount: n.votesCount + 1 } : n))
      );
      const nextNominees = nominees.map((n) =>
        String(n.id) === selectedCandidateId ? { ...n, votesCount: n.votesCount + 1 } : n
      );
      const totalVotes = nextNominees.reduce((sum, n) => sum + Math.max(0, n.votesCount), 0);
      setNominees(
        nextNominees.map((n) => ({
          ...n,
          percentage: totalVotes > 0 ? Math.round((n.votesCount / totalVotes) * 100) : 0,
        }))
      );
      setVotedNomineeId(votedId);
      setHasVotedThisCycle(true);
      setFlowState("vote-confirm");
    } finally {
      setIsSubmittingVote(false);
    }
  };

  return (
    <main className="client-main min-h-screen bg-[radial-gradient(circle_at_top,_#fffdf7_0%,_#f8f6f1_50%,_#efe9dc_100%)] px-0 text-[#182a17]">
      <section className="client-shell relative flex min-h-screen w-full flex-col border border-[#e7e0d2] bg-[#f8f6f1] shadow-[0_24px_80px_rgba(56,71,45,0.12)]">
        <header className="client-header fixed left-0 right-0 top-0 z-30 flex w-full items-center justify-between border-b border-black/10 bg-white p-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              ref={menuTriggerRef}
              className="rounded-full bg-[#f5f5f5] p-2 text-[#7a7a7a]"
              aria-label="Open menu"
              onClick={openDrawer}
            >
              <MenuIcon />
            </button>
            <h1 className="text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-[#31674c]">Global Gardeners</h1>
          </div>

          <button
            type="button"
            className="relative rounded-full bg-[#f5f5f5] p-2 text-[#7a7a7a]"
            aria-label="Notifications"
            onClick={() => router.push("/notifications")}
          >
            <BellIcon />
            {unreadNotifications > 0 ? <span aria-hidden="true" className="absolute right-0 top-0 h-2.5 w-2.5 -translate-y-1/4 translate-x-1/4 rounded-full bg-[#ef4444] ring-2 ring-white" /> : null}
          </button>
        </header>

        <div className="flex w-full flex-col gap-[64px] px-4 pb-8 pt-[104px]">
          <section className="w-full rounded-[16px] border border-black/10 bg-white p-6">
            <div className="mx-auto flex h-[53px] items-center justify-center rounded-[100px] border border-[#d4d4d4] bg-[rgba(255,255,255,0.2)] px-4 py-3">
              <h2 className="bg-gradient-to-r from-[#182a17] via-[#3c6838] to-[#5fa659] bg-clip-text text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-transparent">
                Influencer of the Month
              </h2>
            </div>

            <div className="mt-6">
                <div className="flex flex-col gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (!featuredInfluencer?.slug) return;
                      router.push(`/influencer-spotlight/profile?slug=${encodeURIComponent(featuredInfluencer.slug)}`);
                    }}
                    className="flex items-center justify-center gap-3"
                  >
                  <img src={featuredInfluencer?.avatarUrl || heroAvatar} alt={featuredInfluencer?.name || "Influencer"} className="h-12 w-12 rounded-full object-cover" />
                  <div>
                    <p className="text-[18px] font-semibold leading-[27px] text-[#333333]">{featuredInfluencer?.name || "Influencer Name"}</p>
                    <p className="text-[12px] font-medium leading-4 text-[#333333cc]">{featuredInfluencer?.shortDescription || "Indoor plant specialist"}</p>
                  </div>
                </button>
                <p className="text-center text-[14px] font-medium leading-5 text-[#333333cc]">
                  {featuredInfluencer?.description || "Mario shares practical tips on indoor plant care, propagation, and plant health for beginner and experienced gardeners."}
                </p>
              </div>

              <div className="mt-6 w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex gap-3">
                  {featuredVideos.length > 0
                    ? featuredVideos.map((video) => (
                        <article
                          key={video.id}
                          className="w-[min(265px,calc(100vw-80px))] shrink-0 rounded-[12px] bg-[#f7f7f7] p-4"
                          onClick={() => {
                            const rawUrl = (video as { videoUrl?: string | null }).videoUrl ?? null;
                            setVideoModalUrl(toEmbedUrl(rawUrl));
                            setVideoModalWatchUrl(rawUrl);
                          }}
                        >
                          <div className="relative aspect-[295/166] w-full overflow-hidden rounded-[8px]">
                            <img
                              src={resolveVideoThumbnail(video.thumbnailUrl, (video as { videoUrl?: string | null }).videoUrl)}
                              alt=""
                              className="h-full w-full rounded-[8px] object-cover"
                              onError={(event) => {
                                const target = event.currentTarget;
                                if (target.src !== heroVideoA) target.src = heroVideoA;
                              }}
                            />
                            <div className="absolute right-2 top-2 flex h-[40px] w-[40px] items-center justify-center">
                              <img src={playOverlay} alt="" className="h-[40px] w-[40px]" />
                            </div>
                            <span className="absolute bottom-2 right-2 rounded-[6px] bg-black px-2 py-1 text-[12px] font-medium leading-[1.2] text-white">{formatDuration(video.durationSeconds)}</span>
                          </div>
                          <div className="mt-4 flex items-start gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-[14px] font-medium leading-[1.2] text-[#333333]">{video.title}</p>
                              <div className="mt-2 flex items-center gap-[6px]">
                                <span className="text-[12px] font-medium leading-4 text-[#333333cc]">{formatViews(video.viewsCount)} views</span>
                                <span aria-hidden="true" className="inline-block h-1 w-1 rounded-full bg-[#33333380]" />
                                <span className="text-[12px] font-medium leading-4 text-[#33333380]">1 day ago</span>
                              </div>
                            </div>
                            <img src={ellipsisIcon} alt="" className="mt-1 h-4 w-4" />
                          </div>
                        </article>
                      ))
                    : (
                      <>
                        <VideoCard image={heroVideoA} />
                        <VideoCard image={heroVideoB} mutedAgo />
                      </>
                    )}
                </div>
              </div>
            </div>
          </section>

          <section className="w-full rounded-[16px] border border-black/10 bg-white p-6">
            <h3 className="mx-auto w-[244px] text-center text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-[#182a17]">
              {hasVotedThisCycle ? "Thanks for voting!" : "Who should we feature next month?"}
            </h3>
            <p className="mt-[18px] text-center text-[16px] font-medium leading-6 text-[#333333cc]">
              {hasVotedThisCycle ? "Your vote has been recorded." : "Which creator should we feature next?"}
            </p>

            <div className="mt-8 flex w-full flex-col gap-2">
              {nominees.map((nominee) => {
                const id = nominee.id;
                const selected = selectedCandidateId === String(id);
                const isVoted = votedNomineeId === String(id);
                return (
                  <div key={id} className={`flex ${hasVotedThisCycle ? "min-h-[68px]" : "h-[68px]"} gap-3`}>
                    <button
                      type="button"
                      onClick={() => {
                        if (!hasVotedThisCycle) {
                          setSelectedCandidateId(String(id));
                          return;
                        }
                        router.push(`/influencer-spotlight/profile?slug=${encodeURIComponent(nominee.influencer.slug)}`);
                      }}
                      className={`relative flex flex-1 items-center overflow-hidden rounded-[10px] border p-4 text-left ${selected ? "border-[#171717] bg-[#f8fafc]" : "border-[#e5e5e5] bg-white"}`}
                    >
                      {hasVotedThisCycle ? (
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-0 left-0 rounded-l-[10px] bg-[#5fa659]/25"
                          style={{ width: `${Math.min(100, Math.max(isVoted ? 44 : 18, nominee.percentage ?? 0))}%` }}
                        />
                      ) : null}
                      {hasVotedThisCycle ? null : (
                        <span className={`relative h-4 w-4 shrink-0 rounded-full border ${selected ? "border-[#171717]" : "border-[#d4d4d4]"}`}>
                          {selected ? <span className="absolute left-[3px] top-[3px] h-2 w-2 rounded-full bg-[#171717]" /> : null}
                        </span>
                      )}
                      <img src={nominee.influencer.avatarUrl || voteAvatar} alt={nominee.influencer.name} className="ml-3 h-9 w-9 rounded-full object-cover" />
                      <span className="ml-3 min-w-0">
                        <p className="text-[14px] font-medium leading-5 text-[#333333]">{nominee.influencer.name}</p>
                        <p className={`text-[12px] font-medium leading-4 text-[#333333cc] ${hasVotedThisCycle ? "truncate whitespace-nowrap" : ""}`}>{nominee.influencer.shortDescription}</p>
                      </span>
                      {hasVotedThisCycle ? (
                        <span className="ml-auto flex shrink-0 items-center gap-2 pl-2">
                          {isVoted ? <span className="rounded-full border border-[#5fa659] bg-[#f0fdf4] px-2 py-[2px] text-[10px] font-medium leading-4 text-[#5fa659]">Your vote</span> : null}
                          <span className="text-[14px] font-semibold leading-5 text-[#333333]">{nominee.percentage ?? 0}%</span>
                        </span>
                      ) : null}
                    </button>
                    {!hasVotedThisCycle ? (
                      <button
                        type="button"
                        onClick={() => router.push(`/influencer-spotlight/profile?slug=${encodeURIComponent(nominee.influencer.slug)}`)}
                        className="w-[62px] rounded-[10px] bg-[#f7f7f7] p-3 text-[12px] font-medium leading-[1.2] text-black"
                      >
                        View profile
                      </button>
                    ) : null}
                  </div>
                );
              })}
              {nominees.length === 0 ? <p className="text-center text-[14px] text-[#33333399]">No nominees available yet.</p> : null}
            </div>

            <button
              type="button"
              onClick={() => void handleSubmitVote()}
              disabled={!selectedCandidateId || nominees.length === 0 || isSubmittingVote || hasVotedThisCycle}
              className="mt-8 h-[52px] w-full rounded-[1000px] bg-[#457941] text-[14px] font-medium leading-5 text-[#fafafa] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {hasVotedThisCycle ? "Vote submitted" : isSubmittingVote ? "Submitting..." : "Submit vote"}
            </button>
            <p className="mt-3 text-center text-[12px] font-normal leading-4 text-[#333333cc]">
              {hasVotedThisCycle ? "A confirmation email has been sent." : "A confirmation email will be sent after voting."}
            </p>
          </section>

          <section className="w-full">
            <h3 className="text-[20px] font-semibold leading-6 text-[#333333]">Past Spotlight Creators</h3>
            <div className="mt-6">
              <div className="flex gap-3 overflow-x-auto pr-4">
                {pastCreators.map((creator) => (
                  <article key={creator.id} className="w-[min(265px,calc(100vw-64px))] shrink-0 rounded-[16px] border border-black/10 bg-white p-6">
                    <div className="flex flex-col items-center gap-6">
                      <div className="flex flex-col items-center gap-3">
                        <img src={creator.influencer.avatarUrl || pastAvatar} alt={creator.influencer.name} className="h-16 w-16 rounded-full object-cover" />
                        <p className="text-[14px] font-semibold leading-5 text-[#182a17]">{creator.influencer.name}</p>
                        <div className="w-full rounded-[100px] border border-[#333333] bg-[rgba(255,255,255,0.2)] px-2 py-1">
                          <p className="bg-gradient-to-r from-[#182a17] via-[#3c6838] to-[#5fa659] bg-clip-text text-center text-[12px] font-semibold leading-4 text-transparent">{formatSpotlightMonth(creator.spotlightMonth)}</p>
                        </div>
                        <p className="line-clamp-2 text-center text-[12px] font-medium leading-4 text-[#333333cc]">{creator.influencer.shortDescription}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => router.push(`/influencer-spotlight/profile?slug=${encodeURIComponent(creator.influencer.slug)}`)}
                        className="h-8 w-full rounded-[100px] bg-[#f5f5f5] text-[14px] font-medium leading-5 text-black"
                      >
                        View videos
                      </button>
                    </div>
                  </article>
                ))}
                {pastCreators.length === 0 ? <p className="text-[14px] text-[#33333399]">No past spotlight creators yet.</p> : null}
              </div>
            </div>
          </section>
        </div>

        {isDrawerMounted ? (
          <SideDrawer
            drawerRef={drawerRef}
            isLoggingOut={isLoggingOut}
            isVisible={isDrawerVisible}
            items={drawerItems}
            onClose={closeDrawer}
            onCreatePost={handleCreatePost}
            onLogout={() => {
              void handleLogout();
            }}
            onOpenProfile={handleOpenProfile}
            onSelectItem={handleSelectDrawerItem}
            profile={drawerProfile}
          />
        ) : null}

        {flowState !== "none" ? (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0a0d12]/60 px-4">
            <section className="flex h-[512px] w-[358px] flex-col rounded-[16px] border border-[#e5e5e5] bg-white px-4 py-6 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.1)]">
              {flowState === "vote-confirm" ? (
                <>
                  <div className="flex flex-1 flex-col items-center justify-center gap-6">
                    <div className="relative">
                      <div className="h-[120px] w-[120px] rounded-full bg-[#edf8ec]" />
                      <div className="absolute left-4 top-4 flex h-[88px] w-[88px] items-center justify-center rounded-full bg-[#5fa659]">
                        <img src={checkIcon} alt="" className="h-[37.33px] w-[37.33px]" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-[#182a17]">Thanks for your vote!</p>
                      <p className="mt-2 text-[16px] font-medium leading-6 text-[#333333cc]">A confirmation email has been sent.</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-center text-[16px] font-medium leading-6 text-[#333333]">Want to suggest a creator for future spotlights?</p>
                    <button
                      type="button"
                      onClick={() => setFlowState("suggest")}
                      className="h-[52px] w-full rounded-[1000px] bg-[#457941] text-[14px] font-medium leading-5 text-[#fafafa]"
                    >
                      Suggest a creator
                    </button>
                    <button
                      type="button"
                      onClick={closeFlow}
                      className="h-[52px] w-full rounded-[100px] bg-[#f7f7f7] text-[14px] font-medium leading-5 text-[#171717]"
                    >
                      No, thanks!
                    </button>
                  </div>
                </>
              ) : null}

              {flowState === "suggest" ? (
                <>
                  <div className="flex flex-1 flex-col justify-center gap-6">
                    <p className="text-center text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-[#182a17]">Suggest a creator</p>
                    <div className="space-y-4">
                      <p className="text-center text-[16px] font-medium leading-6 text-[#333333]">
                        Know a great gardening creator?
                        <br />
                        Suggest them for future spotlights.
                      </p>
                      <textarea
                        value={suggestText}
                        onChange={(event) => {
                          setSuggestText(event.target.value);
                          if (suggestError) setSuggestError(null);
                        }}
                        placeholder="Share a creator you'd like to see featured..."
                        className="h-[120px] w-full resize-none rounded-[8px] border border-[#e5e5e5] p-2 text-[14px] leading-5 text-[#333333] placeholder:text-[#33333380] outline-none"
                      />
                      {suggestError ? <p className="text-center text-[12px] text-[#b42318]">{suggestError}</p> : null}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => void handleSubmitSuggestion()}
                      disabled={isSubmittingSuggestion}
                      className="h-[52px] w-full rounded-[1000px] bg-[#457941] text-[14px] font-medium leading-5 text-[#fafafa] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmittingSuggestion ? "Sending..." : "Send"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFlowState("vote-confirm")}
                      className="h-[52px] w-full rounded-[100px] bg-[#f7f7f7] text-[14px] font-medium leading-5 text-[#171717]"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : null}

              {flowState === "suggest-confirm" ? (
                <>
                  <div className="flex flex-1 flex-col items-center justify-center gap-6">
                    <div className="relative">
                      <div className="h-[120px] w-[120px] rounded-full bg-[#edf8ec]" />
                      <div className="absolute left-4 top-4 flex h-[88px] w-[88px] items-center justify-center rounded-full bg-[#5fa659]">
                        <img src={checkIcon} alt="" className="h-[37.33px] w-[37.33px]" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-[#182a17]">Thanks for your suggestion!</p>
                      <p className="mt-2 text-[16px] font-medium leading-6 text-[#333333cc]">Our team will review it for future spotlight features.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeFlow}
                    className="h-[52px] w-full rounded-[1000px] bg-[#457941] text-[14px] font-medium leading-5 text-[#fafafa]"
                  >
                    Back to Influencer Spotlight
                  </button>
                </>
              ) : null}
            </section>
          </div>
        ) : null}
        {videoModalUrl ? (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4" onClick={() => setVideoModalUrl(null)}>
            <div className="relative w-full max-w-[720px]" onClick={(event) => event.stopPropagation()}>
              <button
                type="button"
                aria-label="Close video"
                className="absolute -top-10 right-0 rounded-full bg-white/90 px-3 py-1 text-[14px] font-medium text-[#171717]"
                onClick={() => setVideoModalUrl(null)}
              >
                Close
              </button>
              <div className="aspect-video w-full overflow-hidden rounded-[12px] bg-black">
                <iframe
                  src={videoModalUrl}
                  title="Influencer video"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              </div>
              {videoModalWatchUrl ? (
                <a
                  href={videoModalWatchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block rounded-full bg-white/90 px-3 py-1 text-[13px] font-medium text-[#171717]"
                >
                  Open in YouTube
                </a>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}


