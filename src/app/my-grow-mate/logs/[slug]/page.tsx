"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

type LogDetail = {
  title: string;
  plant: string;
  topic: string;
  date: string;
  paragraphs: string[];
};

const logDetails: Record<string, LogDetail> = {
  "1": {
    title: "Monstera Care Plan Outside My House",
    plant: "Monstera",
    topic: "Care Plan",
    date: "04/15/2026",
    paragraphs: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed neque felis, tincidunt placerat.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed neque felis, tincidunt placerat lectus euismod, accumsan dapibus orci. Sed felis orci, consequat eget mi quis, facilisis facilisis metus.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed neque felis, tincidunt placerat lectus euismod, accumsan dapibus orci. Sed felis orci, consequat eget mi quis, facilisis facilisis metus.",
    ],
  },
  "2": {
    title: "Monstera Care Plan Outside My House",
    plant: "Monstera",
    topic: "Care Plan",
    date: "04/15/2026",
    paragraphs: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed neque felis, tincidunt placerat.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed neque felis, tincidunt placerat lectus euismod, accumsan dapibus orci. Sed felis orci, consequat eget mi quis, facilisis facilisis metus.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed neque felis, tincidunt placerat lectus euismod, accumsan dapibus orci. Sed felis orci, consequat eget mi quis, facilisis facilisis metus.",
    ],
  },
  "3": {
    title: "Monstera Care Plan Outside My House",
    plant: "Plant name",
    topic: "Topic",
    date: "04/15/2026",
    paragraphs: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed neque felis, tincidunt placerat.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed neque felis, tincidunt placerat lectus euismod, accumsan dapibus orci. Sed felis orci, consequat eget mi quis, facilisis facilisis metus.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed neque felis, tincidunt placerat lectus euismod, accumsan dapibus orci. Sed felis orci, consequat eget mi quis, facilisis facilisis metus.",
    ],
  },
  "4": {
    title: "Monstera Care Plan Outside My House",
    plant: "Plant name",
    topic: "Topic",
    date: "04/15/2026",
    paragraphs: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed neque felis, tincidunt placerat.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed neque felis, tincidunt placerat lectus euismod, accumsan dapibus orci. Sed felis orci, consequat eget mi quis, facilisis facilisis metus.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed neque felis, tincidunt placerat lectus euismod, accumsan dapibus orci. Sed felis orci, consequat eget mi quis, facilisis facilisis metus.",
    ],
  },
  "5": {
    title: "Monstera Care Plan Outside My House",
    plant: "Monstera",
    topic: "Care Plan",
    date: "04/15/2026",
    paragraphs: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed neque felis, tincidunt placerat.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed neque felis, tincidunt placerat lectus euismod, accumsan dapibus orci. Sed felis orci, consequat eget mi quis, facilisis facilisis metus.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed neque felis, tincidunt placerat lectus euismod, accumsan dapibus orci. Sed felis orci, consequat eget mi quis, facilisis facilisis metus.",
    ],
  },
};

export default function LogDetailPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const [isActionsDrawerOpen, setIsActionsDrawerOpen] = useState(false);
  const slug = params?.slug ?? "";
  const matchedId = slug.match(/log-detail-(\d+)/)?.[1] ?? slug;
  const log = logDetails[matchedId] ?? logDetails["1"];

  return (
    <main className="client-main min-h-screen bg-[radial-gradient(circle_at_top,_#fffdf7_0%,_#f8f6f1_50%,_#efe9dc_100%)] text-[#182a17]">
      <section className="client-shell mx-auto min-h-screen w-full overflow-x-hidden border border-[#e7e0d2] bg-[#f8f6f1] shadow-[0_24px_80px_rgba(56,71,45,0.12)]">
        {isActionsDrawerOpen ? <button type="button" aria-label="Close actions drawer" onClick={() => setIsActionsDrawerOpen(false)} className="fixed inset-0 z-30 bg-[rgba(23,23,23,0.5)]" /> : null}

        <header className="sticky top-0 z-20 flex w-full items-center border-b border-black/10 bg-white p-4">
          <Link href="/my-grow-mate/logs" aria-label="Back" className="shrink-0">
            <Image src="/icons/back-button.svg" alt="" aria-hidden="true" width={40} height={40} className="h-10 w-10" />
          </Link>
          <div className="flex min-w-0 flex-1 items-center justify-center">
            <h1 className="text-center text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-[#457941]">MyGrowMate Logs</h1>
          </div>
          <button type="button" aria-label="More options" onClick={() => setIsActionsDrawerOpen(true)} className="shrink-0 rounded-full bg-[#f5f5f5] p-2">
            <Image src="/icons/new-plant/ellipsis-vertical.svg" alt="" aria-hidden="true" width={24} height={24} className="h-6 w-6" />
          </button>
        </header>

        <div className="px-4 pb-[120px] pt-8">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-6">
              <h2 className="text-[30px] font-semibold leading-[1.2] tracking-[-1px] text-[#182a17]">{log.title}</h2>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0fdf4] p-[6px]">
                    <Image src="/icons/logs/calendar.svg" alt="" aria-hidden="true" width={16} height={16} className="h-4 w-4" />
                  </span>
                  <p className="text-[16px] font-medium leading-6 text-[#333333cc]">{log.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0fdf4] p-[6px]">
                    <Image src="/icons/logs/leaf.svg" alt="" aria-hidden="true" width={16} height={16} className="h-4 w-4" />
                  </span>
                  <p className="text-[16px] font-medium leading-6 text-[#333333cc]">Plant: {log.plant}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0fdf4] p-[6px]">
                    <Image src="/icons/logs/stethoscope.svg" alt="" aria-hidden="true" width={16} height={16} className="h-4 w-4" />
                  </span>
                  <p className="text-[16px] font-medium leading-6 text-[#333333cc]">Type: {log.topic}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {log.paragraphs.map((paragraph, idx) => (
                <p key={idx} className="text-[14px] font-medium leading-[1.5] text-[#333333cc]">{paragraph}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="fixed bottom-[max(20px,env(safe-area-inset-bottom))] left-4 right-4 z-20 w-auto">
          <button
            type="button"
            onClick={() => router.push(`/my-grow-mate/chat?fromLog=${matchedId}`)}
            className="h-[52px] w-full rounded-[100px] bg-[#457941] px-6 text-center text-[14px] font-medium leading-5 text-[#f8f6f1]"
          >
            Open conversation
          </button>
        </div>

        <div className={`fixed bottom-0 left-0 right-0 z-40 w-full rounded-tl-[24px] rounded-tr-[24px] border border-[rgba(212,212,212,0.5)] bg-[#f8f6f1] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] transition-transform duration-300 ${isActionsDrawerOpen ? "translate-y-0" : "translate-y-full"}`}>
          <div className="mx-auto mt-[7px] h-[3px] w-20 rounded-[2px] bg-[rgba(0,0,0,0.1)]" />
          <div className="mx-auto w-full max-w-[390px] px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-6">
            <div className="flex flex-col items-center gap-8 px-0 py-5">
              <h3 className="w-[266px] text-center text-[20px] font-semibold leading-6 text-[#182a17]">Log actions</h3>
              <div className="w-full">
                <div className="flex flex-col gap-2">
                  <button type="button" className="h-[52px] w-full rounded-[100px] bg-white px-6 text-center text-[14px] font-medium leading-5 text-[#171717]">Rename</button>
                  <button type="button" className="h-[52px] w-full rounded-[100px] bg-white px-6 text-center text-[14px] font-medium leading-5 text-[#171717]">Share</button>
                  <button type="button" className="h-[52px] w-full rounded-[100px] bg-white px-6 text-center text-[14px] font-medium leading-5 text-[#171717]">Print</button>
                </div>
                <button type="button" className="mt-8 h-[52px] w-full rounded-[100px] bg-[#ef4444] px-6 text-center text-[14px] font-medium leading-5 text-white">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
