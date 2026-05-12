"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type LogDetail = {
  id: string;
  title: string;
  topic: string;
  plant: string;
  conversationId: string | null;
  conversationTitle: string;
  logType: string;
  date: string;
  body: string;
};

export default function LogDetailPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const [isActionsDrawerOpen, setIsActionsDrawerOpen] = useState(false);
  const [isRenameDrawerOpen, setIsRenameDrawerOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [isSavingRename, setIsSavingRename] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [log, setLog] = useState<LogDetail | null>(null);
  const slug = params?.slug ?? "";
  const matchedId = slug.match(/log-detail-(\d+)/)?.[1] ?? slug;
  const formattedDate = !log?.date
    ? ""
    : new Date(log.date).toLocaleString(undefined, {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });

  useEffect(() => {
    let cancelled = false;
    const loadLog = async () => {
      const response = await fetch("/api/my-grow-mate/logs");
      if (!response.ok) return;
      const payload = (await response.json()) as {
        logs?: Array<{
          id: string;
          title: string;
          plant: string;
          topic: string;
          logType: string;
          content: string;
          createdAt: string | null;
          conversationId: string | null;
          conversationTitle: string;
        }>;
      };
      const logs = payload.logs ?? [];
      const current = logs.find((item) => item.id === matchedId);
      if (cancelled || !current) return;
      setLog({
        id: current.id,
        title: current.title || "Saved log",
        topic: current.topic || "Care Plan",
        plant: current.plant || "Plant name",
        conversationId: current.conversationId ?? null,
        conversationTitle: current.conversationTitle || "Global Gardeners",
        logType: current.logType || current.topic || "Care Plan",
        date: current.createdAt ?? "",
        body: current.content || "",
      });
      setRenameValue(current.title || "Saved log");
    };
    void loadLog();
    return () => {
      cancelled = true;
    };
  }, [matchedId]);

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
              <h2 className="text-[30px] font-semibold leading-[1.2] tracking-[-1px] text-[#182a17]">{log?.title ?? "Loading log..."}</h2>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0fdf4] p-[6px]">
                    <Image src="/icons/logs/calendar.svg" alt="" aria-hidden="true" width={16} height={16} className="h-4 w-4" />
                  </span>
                  <p className="text-[16px] font-medium leading-6 text-[#333333cc]">{formattedDate || "No date"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0fdf4] p-[6px]">
                    <Image src="/icons/logs/leaf.svg" alt="" aria-hidden="true" width={16} height={16} className="h-4 w-4" />
                  </span>
                  <p className="text-[16px] font-medium leading-6 text-[#333333cc]">Conversation: {log?.conversationTitle ?? "Global Gardeners"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0fdf4] p-[6px]">
                    <Image src="/icons/logs/stethoscope.svg" alt="" aria-hidden="true" width={16} height={16} className="h-4 w-4" />
                  </span>
                  <p className="text-[16px] font-medium leading-6 text-[#333333cc]">Type: {log?.logType ?? "Care Plan"}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-[14px] font-medium leading-[1.5] text-[#333333cc]">{log?.body ?? ""}</p>
            </div>
          </div>
        </div>

        <div className="fixed bottom-[max(20px,env(safe-area-inset-bottom))] left-4 right-4 z-20 w-auto print:hidden">
          <button
            type="button"
            onClick={() => router.push(log?.conversationId ? `/my-grow-mate/chat?conversationId=${log.conversationId}` : `/my-grow-mate/chat?fromLog=${matchedId}`)}
            className="h-[52px] w-full rounded-[100px] bg-[#457941] px-6 text-center text-[14px] font-medium leading-5 text-[#f8f6f1]"
          >
            Open conversation
          </button>
        </div>

        <div className={`fixed bottom-0 left-0 right-0 z-40 w-full rounded-tl-[24px] rounded-tr-[24px] border border-[rgba(212,212,212,0.5)] bg-[#f8f6f1] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] transition-transform duration-300 print:hidden ${isActionsDrawerOpen ? "translate-y-0" : "translate-y-full"}`}>
          <div className="mx-auto mt-[7px] h-[3px] w-20 rounded-[2px] bg-[rgba(0,0,0,0.1)]" />
          <div className="mx-auto w-full max-w-[390px] px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-6">
            <div className="flex flex-col items-center gap-8 px-0 py-5">
              <h3 className="w-[266px] text-center text-[20px] font-semibold leading-6 text-[#182a17]">Log actions</h3>
              <div className="w-full">
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsActionsDrawerOpen(false);
                      setRenameValue(log?.title ?? "Saved log");
                      setIsRenameDrawerOpen(true);
                    }}
                    className="h-[52px] w-full rounded-[100px] bg-white px-6 text-center text-[14px] font-medium leading-5 text-[#171717]"
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!log || isSharing) return;
                      setIsSharing(true);
                      try {
                        const sharedLogPayload = `[[LOG_TITLE]]${log.title}\n[[LOG_BODY]]${log.body}`;
                        await fetch("/api/posts", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            note: sharedLogPayload,
                            photos: [],
                          }),
                        });
                        setIsActionsDrawerOpen(false);
                        router.push("/feed");
                      } finally {
                        setIsSharing(false);
                      }
                    }}
                    className="h-[52px] w-full rounded-[100px] bg-white px-6 text-center text-[14px] font-medium leading-5 text-[#171717]"
                  >
                    {isSharing ? "Sharing..." : "Share"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsActionsDrawerOpen(false);
                      window.print();
                    }}
                    className="h-[52px] w-full rounded-[100px] bg-white px-6 text-center text-[14px] font-medium leading-5 text-[#171717]"
                  >
                    Print
                  </button>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (!log?.id) return;
                    await fetch(`/api/my-grow-mate/logs/${log.id}`, { method: "DELETE" });
                    router.push("/my-grow-mate/logs");
                  }}
                  className="mt-8 h-[52px] w-full rounded-[100px] bg-[#ef4444] px-6 text-center text-[14px] font-medium leading-5 text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        {isRenameDrawerOpen ? <button type="button" aria-label="Close rename drawer" onClick={() => setIsRenameDrawerOpen(false)} className="fixed inset-0 z-30 bg-[rgba(23,23,23,0.5)] print:hidden" /> : null}
        <div className={`fixed bottom-0 left-0 right-0 z-40 w-full rounded-tl-[24px] rounded-tr-[24px] border border-[rgba(212,212,212,0.5)] bg-[#f8f6f1] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] transition-transform duration-300 print:hidden ${isRenameDrawerOpen ? "translate-y-0" : "translate-y-full"}`}>
          <div className="mx-auto mt-[7px] h-[3px] w-20 rounded-[2px] bg-[rgba(0,0,0,0.1)]" />
          <div className="px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-6">
            <div className="flex w-full flex-col items-center gap-6 py-5">
              <h3 className="w-[266px] text-center text-[20px] font-semibold leading-6 text-[#182a17]">Edit log title</h3>
              <div className="w-full">
                <div className="rounded-[8px] border border-black/5 bg-white px-4 py-3">
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    className="w-full bg-transparent text-[14px] font-normal leading-5 text-[#0a0a0a] outline-none"
                  />
                </div>
                <p className="mt-2 text-[12px] font-normal leading-4 text-[#333333cc]">At least 3 characters</p>
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <button
                type="button"
                disabled={renameValue.trim().length < 3 || isSavingRename}
                onClick={async () => {
                  if (!log?.id || renameValue.trim().length < 3) return;
                  setIsSavingRename(true);
                  try {
                    const nextTitle = renameValue.trim();
                    await fetch(`/api/my-grow-mate/logs/${log.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ title: nextTitle }),
                    });
                    setLog((prev) => (prev ? { ...prev, title: nextTitle } : prev));
                    setIsRenameDrawerOpen(false);
                  } finally {
                    setIsSavingRename(false);
                  }
                }}
                className={`h-[52px] w-full rounded-[1000px] px-6 text-center text-[14px] font-medium leading-5 text-[#fafafa] ${
                  renameValue.trim().length < 3 || isSavingRename ? "bg-[#457941] opacity-50" : "bg-[#457941] opacity-100"
                }`}
              >
                {isSavingRename ? "Saving..." : "Save"}
              </button>
              <button type="button" onClick={() => setIsRenameDrawerOpen(false)} className="h-[52px] w-full rounded-[100px] bg-white px-6 text-center text-[14px] font-medium leading-5 text-[#333333]">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
