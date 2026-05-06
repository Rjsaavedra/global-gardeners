"use client";

import { useRouter } from "next/navigation";

const creatorAvatar = "/images/figma/placeholder-expired.png";
const creatorVideo = "/images/figma/placeholder-expired.png";
const playOverlay = "/icons/gallery.svg";

function ArrowLeftIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path d="M10.78 5.47a.75.75 0 0 1 0 1.06L6.31 11h12.94a.75.75 0 0 1 0 1.5H6.31l4.47 4.47a.75.75 0 1 1-1.06 1.06L4 12.31a.75.75 0 0 1 0-1.06l5.72-5.78a.75.75 0 0 1 1.06 0Z" fill="currentColor" />
    </svg>
  );
}

function VideoCard() {
  return (
    <article className="w-full rounded-[12px] border border-black/10 bg-white p-4">
      <div className="relative aspect-[295/166] w-full overflow-hidden rounded-[8px]">
        <img src={creatorVideo} alt="" className="h-full w-full rounded-[8px] object-cover" />
        <div className="absolute inset-0 flex items-center justify-center">
          <img src={playOverlay} alt="" className="h-10 w-10" />
        </div>
        <span className="absolute bottom-2 right-2 rounded-[6px] bg-black px-2 py-1 text-[12px] font-medium leading-[1.2] text-white">12:00</span>
      </div>

      <div className="mt-4">
        <p className="text-[14px] font-medium leading-[1.2] text-[#333333]">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <div className="mt-2 flex items-center gap-[6px]">
          <span className="text-[12px] font-medium leading-4 text-[#333333cc]">3.5k views</span>
          <span aria-hidden="true" className="inline-block h-1 w-1 rounded-full bg-[#33333380]" />
          <span className="text-[12px] font-medium leading-4 text-[#33333380]">1 day ago</span>
        </div>
      </div>
    </article>
  );
}

export default function PastCreatorPage() {
  const router = useRouter();

  return (
    <main className="client-main min-h-screen bg-[radial-gradient(circle_at_top,_#fffdf7_0%,_#f8f6f1_50%,_#efe9dc_100%)] px-0 text-[#182a17]">
      <section className="client-shell relative flex min-h-screen w-full flex-col border border-[#e7e0d2] bg-[#f8f6f1] shadow-[0_24px_80px_rgba(56,71,45,0.12)]">
        <header className="client-header fixed left-0 right-0 top-0 z-30 flex w-full items-center justify-between border-b border-black/10 bg-white p-4">
          <div className="flex flex-1 items-center gap-3">
            <button
              type="button"
              className="rounded-full bg-[#f5f5f5] p-2 text-[#7a7a7a]"
              aria-label="Go back"
              onClick={() => router.push("/influencer-spotlight")}
            >
              <ArrowLeftIcon />
            </button>
            <h1 className="flex-1 text-center text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-[#31674c]">March 2025 Creator</h1>
          </div>
          <div className="h-10 w-10" />
        </header>

        <div className="flex w-full flex-col gap-6 px-4 pb-8 pt-[104px]">
          <section className="flex flex-col items-center gap-2">
            <img src={creatorAvatar} alt="Creator avatar" className="h-16 w-16 rounded-full object-cover" />
            <p className="text-[18px] font-semibold leading-[27px] text-[#333333]">Influencer Name</p>
            <p className="text-center text-[14px] font-medium leading-5 text-[#333333cc]">
              Mario shares practical tips on indoor plant care,
              <br />
              propagation and plant health.
            </p>
          </section>

          <section className="flex flex-col gap-4">
            <VideoCard />
            <VideoCard />
          </section>
        </div>
      </section>
    </main>
  );
}
