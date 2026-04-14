"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

const detailHeroImage = "https://www.figma.com/api/mcp/asset/27088c29-69b2-4900-b14b-a95560a1aa61";

const guideDetailBody = [
  "This little guide was created to bring gardeners together - beginners, experts, and everyone in between. Gardening is a shared journey, shaped by the people who teach us, inspire us, and remind us to slow down and notice the small, beautiful things. Global Gardeners was built with that spirit in mind: a place where knowledge is shared freely, where stories matter, and where community comes first.",
  "Inside these pages, you'll find gentle guidance, practical tips, and wisdom from some of the creators who have shaped our own gardening paths. They are part of the foundation of this community, and we're grateful to share their voices with you.",
  "Whether you're tending a single houseplant or a full backyard garden, we're glad you're here. Take what resonates, return to it as the seasons change, and let it be a companion as you grow.",
  "Welcome to our world. We're so happy to have you with us.",
  "- Vicki, Founder of Global Gardeners",
];

const guideSections = [
  "How to Use This Guide",
  "Scott A. Wilson (Gardener Scott)",
  "Brian Lowell (Next Level Gardening)",
  "Luke Marion (MIGardener)",
  "What Global Gardeners Stands For",
  "What You'll Find Inside Global Gardeners",
  "Spotlight Gardeners",
  "How Spotlight Gardeners Work",
  "Closing Reflection",
  "Join the Community / Stay Connected",
  "Thank You",
  "Dedication",
  "Notes & Reflections",
  "Plant Memory Log",
  "Seasonal Goals & Intentions",
  "Global Gardeners",
];

function DownloadIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path d="M12 3.25C12.4142 3.25 12.75 3.58579 12.75 4V13.1895L16.2197 9.71973C16.5126 9.42684 16.9874 9.42684 17.2803 9.71973C17.5732 10.0126 17.5732 10.4874 17.2803 10.7803L12.5303 15.5303C12.2374 15.8232 11.7626 15.8232 11.4697 15.5303L6.71973 10.7803C6.42684 10.4874 6.42684 10.0126 6.71973 9.71973C7.01262 9.42684 7.48738 9.42684 7.78027 9.71973L11.25 13.1895V4C11.25 3.58579 11.5858 3.25 12 3.25Z" fill="currentColor" />
      <path d="M4.25 18C4.25 17.5858 4.58579 17.25 5 17.25H19C19.4142 17.25 19.75 17.5858 19.75 18C19.75 18.4142 19.4142 18.75 19 18.75H5C4.58579 18.75 4.25 18.4142 4.25 18Z" fill="currentColor" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 text-[#8f8f8f]" fill="none" viewBox="0 0 24 24">
      <path d="M7.21973 9.71973C7.51262 9.42684 7.98738 9.42684 8.28027 9.71973L12 13.4395L15.7197 9.71973C16.0126 9.42684 16.4874 9.42684 16.7803 9.71973C17.0732 10.0126 17.0732 10.4874 16.7803 10.7803L12.5303 15.0303C12.2374 15.3232 11.7626 15.3232 11.4697 15.0303L7.21973 10.7803C6.92684 10.4874 6.92684 10.0126 7.21973 9.71973Z" fill="currentColor" />
    </svg>
  );
}

export default function GuideDetailPage() {
  const router = useRouter();

  return (
    <main className="client-main min-h-screen bg-[radial-gradient(circle_at_top,_#fffdf7_0%,_#f8f6f1_50%,_#efe9dc_100%)] px-0 text-[#182a17]">
      <section className="client-shell relative flex min-h-screen w-full flex-col overflow-x-hidden border border-[#e7e0d2] bg-[#f8f6f1] shadow-[0_24px_80px_rgba(56,71,45,0.12)]">
        <div className="flex flex-1 flex-col px-4 pb-[140px] pt-4">
          <button
            type="button"
            onClick={() => router.push("/guides")}
            className="mb-6 inline-flex w-fit items-center gap-3 text-[#333333cc]"
          >
            <Image src="/icons/back-button.svg" alt="" aria-hidden="true" width={40} height={40} className="h-10 w-10" />
            <span className="text-[18px] font-medium leading-[27px]">Back</span>
          </button>

          <div className="relative h-[160px] w-full overflow-hidden rounded-[16px] border border-[#3333331a]">
            <Image
              src={detailHeroImage}
              alt=""
              fill
              unoptimized
              className="object-cover"
              style={{ objectPosition: "48% 50%", transform: "scale(1.15)" }}
            />
          </div>

          <p className="mt-2 text-[14px] font-medium leading-5 text-[#33333399]">10 min read</p>
          <h1 className="mt-2 text-[30px] font-semibold leading-[1.2] tracking-[-1px] text-[#182a17]">Global Gardeners Mini Guide ~ 1</h1>
          <p className="mt-2 text-[16px] font-medium leading-6 text-[#333333cc]">A gentle guide for everyday gardeners</p>

          <h2 className="mt-10 text-[18px] font-medium leading-[27px] text-[#333333]">Welcome to Global Gardeners</h2>
          <div className="mt-4 space-y-[14px] text-[14px] font-medium leading-5 text-[#333333cc]">
            {guideDetailBody.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-4 border-y border-[#0000001a]">
            {guideSections.map((section) => (
              <button
                key={section}
                type="button"
                className="flex w-full items-center justify-between border-b border-[#0000001a] py-4 text-left last:border-b-0"
              >
                <span className="text-[14px] font-medium leading-5 text-[#333333]">{section}</span>
                <ChevronDownIcon />
              </button>
            ))}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-[390px] bg-[#f8f6f1] px-4 pb-4 pt-5">
          <button
            type="button"
            className="inline-flex h-[52px] w-full items-center justify-center gap-[6px] rounded-[1000px] bg-[#457941] text-[14px] font-medium leading-5 text-[#fafafa]"
          >
            <DownloadIcon />
            <span>Download full guide</span>
          </button>
        </div>
      </section>
    </main>
  );
}
