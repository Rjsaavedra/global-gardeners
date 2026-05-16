"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const avatar = "/images/figma/placeholder-expired.png";
const videoThumb = "/images/figma/placeholder-expired.png";
const playOverlay = "/icons/gallery.svg";

function formatDuration(durationSeconds: number) {
  const total = Math.max(0, Math.floor(durationSeconds));
  const min = Math.floor(total / 60);
  const sec = total % 60;
  return `${min}:${String(sec).padStart(2, "0")}`;
}

function formatViews(viewsCount: number) {
  if (viewsCount >= 1_000_000) return `${(viewsCount / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (viewsCount >= 1_000) return `${(viewsCount / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${viewsCount}`;
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
  } catch {}
  return null;
}

function toEmbedUrl(videoUrl?: string | null) {
  const videoId = extractYouTubeVideoId(videoUrl);
  if (!videoId) return null;
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=1&rel=0&playsinline=1`;
}

function VideoItem({
  title,
  thumbnailUrl,
  durationSeconds,
  viewsCount,
  onOpen,
}: {
  title: string;
  thumbnailUrl: string | null;
  durationSeconds: number;
  viewsCount: number;
  onOpen?: () => void;
}) {
  return (
    <article className="w-full rounded-[12px] border border-black/10 bg-white p-4" onClick={onOpen}>
      <div className="relative aspect-[295/166] w-full overflow-hidden rounded-[8px]">
        <img src={thumbnailUrl || videoThumb} alt="" className="h-full w-full object-cover" />
        <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2">
          <img src={playOverlay} alt="" className="h-10 w-10" />
        </div>
        <span className="absolute bottom-2 right-2 rounded-[6px] bg-black px-2 py-1 text-[12px] font-medium leading-[1.2] text-white">{formatDuration(durationSeconds)}</span>
      </div>
      <p className="mt-4 text-[14px] font-medium leading-5 text-[#333333]">{title}</p>
      <div className="mt-2 flex items-center gap-[7px] text-[12px] font-medium leading-4 text-[#333333cc]">
        <span>{formatViews(viewsCount)} views</span>
        <span aria-hidden="true" className="inline-block h-1 w-1 rounded-full bg-[#33333380]" />
        <span className="text-[#33333380]">1 day ago</span>
      </div>
    </article>
  );
}

function InfluencerProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = (searchParams.get("slug") ?? "").trim();
  const [profile, setProfile] = useState<{ name: string; description: string; avatarUrl: string | null; featuredMonth: string | null } | null>(null);
  const [videos, setVideos] = useState<Array<{ id: number; title: string; videoUrl?: string | null; thumbnailUrl: string | null; durationSeconds: number; viewsCount: number }>>([]);
  const [videoModalUrl, setVideoModalUrl] = useState<string | null>(null);
  const [videoModalWatchUrl, setVideoModalWatchUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!slug) return;
      const response = await fetch(`/api/influencer-spotlight/profile?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
      if (!response.ok || !isMounted) return;
      const payload = (await response.json()) as {
        profile: { name: string; description: string; avatarUrl: string | null; featuredMonth: string | null };
        videos: Array<{ id: number; title: string; videoUrl?: string | null; thumbnailUrl: string | null; durationSeconds: number; viewsCount: number }>;
      };
      if (!isMounted) return;
      setProfile(payload.profile);
      setVideos(Array.isArray(payload.videos) ? payload.videos : []);
    };
    void load();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  return (
    <main className="client-main min-h-screen bg-[#f8f6f1] px-0">
      <section className="client-shell relative mx-auto flex min-h-screen w-full max-w-[390px] flex-col overflow-hidden border border-[#e7e0d2] bg-[#f8f6f1]">
        <header className="client-header fixed left-0 right-0 top-0 z-30 flex w-full items-center border-b border-black/10 bg-white p-4">
          <button type="button" aria-label="Back" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f5f5]" onClick={() => router.back()}>
            <Image src="/icons/back-button.svg" alt="" aria-hidden="true" width={40} height={40} className="h-10 w-10" />
          </button>
          <h1 className="flex-1 pr-10 text-center text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-[#31674c]">Influencer Profile</h1>
        </header>

        <div className="flex flex-1 flex-col gap-6 px-4 pb-8 pt-[104px]">
          <section className="space-y-2">
            <div className="flex flex-col items-center gap-1.5">
              <img src={profile?.avatarUrl || avatar} alt={profile?.name || "Influencer"} className="h-16 w-16 rounded-full object-cover" />
              <p className="text-[18px] font-semibold leading-[27px] text-[#333333]">{profile?.name || "Influencer Name"}</p>
            </div>
            <p className="text-center text-[14px] font-medium leading-5 text-[#333333cc]">{profile?.description || "No description yet."}</p>
          </section>

          <section className="space-y-4">
            {videos.length > 0 ? videos.map((video) => (
              <VideoItem
                key={video.id}
                title={video.title}
                thumbnailUrl={video.thumbnailUrl}
                durationSeconds={video.durationSeconds}
                viewsCount={video.viewsCount}
                onOpen={() => {
                  setVideoModalUrl(toEmbedUrl(video.videoUrl));
                  setVideoModalWatchUrl(video.videoUrl ?? null);
                }}
              />
            )) : <VideoItem title="No videos yet." thumbnailUrl={null} durationSeconds={0} viewsCount={0} />}
          </section>
        </div>

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
                <a href={videoModalWatchUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block rounded-full bg-white/90 px-3 py-1 text-[13px] font-medium text-[#171717]">
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

export default function InfluencerProfilePage() {
  return (
    <Suspense
      fallback={
        <main className="client-main min-h-screen bg-[#f8f6f1] px-0">
          <section className="client-shell relative mx-auto flex min-h-screen w-full max-w-[390px] items-center justify-center overflow-hidden border border-[#e7e0d2] bg-[#f8f6f1]">
            <p className="text-[14px] text-[#525252]">Loading...</p>
          </section>
        </main>
      }
    >
      <InfluencerProfilePageContent />
    </Suspense>
  );
}
