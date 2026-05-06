"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Conversation = {
  id: number;
  title: string;
  plant: string;
  type: "identified" | "unidentified";
  excerpt: string;
};

const conversations: Conversation[] = [
  { id: 1, title: "Title of conversation", plant: "Monstera", type: "identified", excerpt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed neque felis, tincidunt placerat lectus euismod, accumsan dapibus orci." },
  { id: 2, title: "Title of conversation", plant: "Unidentified", type: "unidentified", excerpt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed neque felis, tincidunt placerat lectus euismod, accumsan dapibus orci." },
  { id: 3, title: "Title of conversation", plant: "Monstera", type: "identified", excerpt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed neque felis, tincidunt placerat lectus euismod, accumsan dapibus orci." },
  { id: 4, title: "Title of conversation", plant: "Unidentified", type: "unidentified", excerpt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed neque felis, tincidunt placerat lectus euismod, accumsan dapibus orci." },
  { id: 5, title: "Title of conversation", plant: "Monstera", type: "identified", excerpt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed neque felis, tincidunt placerat lectus euismod, accumsan dapibus orci." },
  { id: 6, title: "Title of conversation", plant: "Monstera", type: "identified", excerpt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed neque felis, tincidunt placerat lectus euismod, accumsan dapibus orci." },
  { id: 7, title: "Title of conversation", plant: "Unidentified", type: "unidentified", excerpt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed neque felis, tincidunt placerat lectus euismod, accumsan dapibus orci." }
];

export default function RecentConversationsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"all" | "identified" | "unidentified">("all");

  const filtered = useMemo(() => {
    const byTab = conversations.filter((c) => tab === "all" || c.type === tab);
    const q = query.trim().toLowerCase();
    if (!q) return byTab;
    return byTab.filter((c) => (c.title + " " + c.plant + " " + c.excerpt).toLowerCase().includes(q));
  }, [query, tab]);

  return (
    <main className="client-main min-h-screen bg-[radial-gradient(circle_at_top,_#fffdf7_0%,_#f8f6f1_50%,_#efe9dc_100%)] text-[#182a17]">
      <section className="client-shell mx-auto min-h-screen w-full overflow-x-hidden border border-[#e7e0d2] bg-[#f8f6f1] shadow-[0_24px_80px_rgba(56,71,45,0.12)]">
        <header className="sticky top-0 z-20 flex w-full items-center border-b border-black/10 bg-white p-4">
          <button type="button" onClick={() => router.push("/my-grow-mate")} aria-label="Back" className="shrink-0">
            <Image src="/icons/back-button.svg" alt="" aria-hidden="true" width={40} height={40} className="h-10 w-10" />
          </button>
          <div className="flex min-w-0 flex-1 items-center justify-center pr-10">
            <h1 className="text-center text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-[#457941]">Conversations</h1>
          </div>
        </header>

        <div className="px-4 pb-8 pt-8">
          <div className="rounded-full border border-black/5 bg-white px-3 py-2">
            <div className="flex min-h-[32px] items-center gap-2 rounded-lg bg-white px-2 py-[5.5px]">
              <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5 text-[#737373]" fill="none">
                <path d="M9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333C10.8698 15.8333 12.4239 15.1948 13.6038 14.143L17.5226 18.0618C17.7667 18.3059 18.1624 18.3059 18.4065 18.0618C18.6507 17.8177 18.6507 17.422 18.4065 17.1778L14.4877 13.259C15.5395 12.0792 16.178 10.5251 16.178 8.82198C16.178 5.14008 13.1932 2.15531 9.51131 2.15531H9.16667Z" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search conversations"
                className="w-full bg-transparent text-[14px] font-normal leading-5 text-[#333333] placeholder:text-[#33333380] outline-none"
              />
            </div>
          </div>

          <div className="mt-6 flex w-full overflow-hidden rounded-full border border-black/10">
            <button type="button" onClick={() => setTab("all")} className={`h-10 flex-1 text-[14px] font-medium leading-5 ${tab === "all" ? "bg-[#457941] text-white" : "bg-white text-[#333333cc]"}`}>All</button>
            <button type="button" onClick={() => setTab("identified")} className={`h-10 flex-1 border-x border-black/10 text-[14px] font-medium leading-5 ${tab === "identified" ? "bg-[#457941] text-white" : "bg-white text-[#333333cc]"}`}>Identified</button>
            <button type="button" onClick={() => setTab("unidentified")} className={`h-10 flex-1 text-[14px] font-medium leading-5 ${tab === "unidentified" ? "bg-[#457941] text-white" : "bg-white text-[#333333cc]"}`}>Unidentified</button>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            {filtered.map((item) => (
              <button key={item.id} type="button" onClick={() => router.push(`/my-grow-mate/chat?fromConversation=${item.id}`)} className="flex w-full items-center gap-4 rounded-[100px] border border-black/10 bg-white px-8 py-4 text-left">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium leading-5 text-[#333333]">{item.title} <span className="text-[#33333380]">- {item.plant}</span></p>
                  <p className="mt-[2px] truncate text-[12px] font-medium leading-4 text-[#333333cc]">{item.excerpt}</p>
                </div>
                <Image src="/icons/my-garden-chevron-right.svg" alt="" aria-hidden="true" width={24} height={24} className="h-6 w-6 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
