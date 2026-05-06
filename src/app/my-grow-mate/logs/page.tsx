"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type LogItem = {
  id: number;
  title: string;
  plant: string;
  topic: string;
  kind: "leaf" | "care" | "sprout";
};

const logs: LogItem[] = [
  { id: 1, title: "Title of log", plant: "Plant name", topic: "Topic", kind: "leaf" },
  { id: 2, title: "Monstera care plan outside of my house", plant: "Monstera", topic: "Care Plan", kind: "care" },
  { id: 3, title: "Title of log", plant: "Plant name", topic: "Topic", kind: "sprout" },
  { id: 4, title: "Title of log", plant: "Plant name", topic: "Topic", kind: "leaf" },
  { id: 5, title: "Montera Care Plan", plant: "Monstera", topic: "Care Plan", kind: "care" },
  { id: 6, title: "Title of log", plant: "Plant name", topic: "Topic", kind: "sprout" },
  { id: 7, title: "Title of log", plant: "Plant name", topic: "Topic", kind: "leaf" },
];

const chipOptions = ["All", "Care Plan", "Topic 1", "Topic 2", "Topic 3"] as const;
type LogFilter = (typeof chipOptions)[number];

export default function MyGrowMateLogsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<LogFilter>("All");

  const filtered = useMemo(() => {
    const byFilter = logs.filter((log) => filter === "All" || log.topic === filter);
    const q = query.trim().toLowerCase();
    if (!q) return byFilter;
    return byFilter.filter((log) => `${log.title} ${log.plant} ${log.topic}`.toLowerCase().includes(q));
  }, [query, filter]);

  return (
    <main className="client-main min-h-screen bg-[radial-gradient(circle_at_top,_#fffdf7_0%,_#f8f6f1_50%,_#efe9dc_100%)] text-[#182a17]">
      <section className="client-shell mx-auto min-h-screen w-full overflow-x-hidden border border-[#e7e0d2] bg-[#f8f6f1] shadow-[0_24px_80px_rgba(56,71,45,0.12)]">
        <header className="sticky top-0 z-20 flex w-full items-center border-b border-black/10 bg-white p-4">
          <button type="button" onClick={() => router.push("/my-grow-mate")} aria-label="Back" className="shrink-0">
            <Image src="/icons/back-button.svg" alt="" aria-hidden="true" width={40} height={40} className="h-10 w-10" />
          </button>
          <div className="flex min-w-0 flex-1 items-center justify-center pr-10">
            <h1 className="text-center text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-[#457941]">MyGrowMate Logs</h1>
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
                placeholder="Search by plant or topic"
                className="w-full bg-transparent text-[14px] font-normal leading-5 text-[#333333] placeholder:text-[#33333380] outline-none"
              />
            </div>
          </div>

          <div className="-mx-4 mt-6 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max gap-2">
              {chipOptions.map((chip) => {
                const active = chip === filter;
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setFilter(chip)}
                    className={`min-h-[40px] rounded-full px-4 py-[9.5px] text-[14px] font-medium leading-5 whitespace-nowrap ${
                      active ? "border border-[#3e6d3b] bg-[#457941] text-white" : "border border-black/10 bg-white text-[#333333cc]"
                    }`}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            {filtered.map((log) => (
              <button
                key={log.id}
                type="button"
                onClick={() => router.push(`/my-grow-mate/logs/log-detail-${log.id}`)}
                className="flex w-full items-center gap-4 rounded-[100px] border border-black/10 bg-white p-4 text-left"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0fdf4cc] p-2">
                  {log.kind === "leaf" ? <Image src="/icons/chat-menus/leaf.svg" alt="" aria-hidden="true" width={24} height={24} className="h-6 w-6" /> : null}
                  {log.kind === "care" ? <Image src="/icons/my-garden-care-logs.svg" alt="" aria-hidden="true" width={24} height={24} className="h-6 w-6" /> : null}
                  {log.kind === "sprout" ? <Image src="/icons/chat-menus/select-plant.svg" alt="" aria-hidden="true" width={24} height={24} className="h-6 w-6" /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-medium leading-5 text-[#333333]">{log.title}</span>
                  <span className="mt-[2px] flex items-center gap-[6px] text-[12px] font-normal leading-4 text-[#333333cc]">
                    <span className="truncate">{log.plant}</span>
                    <span aria-hidden="true" className="h-1 w-1 shrink-0 rounded-full bg-[#333333cc]" />
                    <span className="truncate">{log.topic}</span>
                  </span>
                </span>
                <Image src="/icons/my-garden-chevron-right.svg" alt="" aria-hidden="true" width={24} height={24} className="h-6 w-6 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
