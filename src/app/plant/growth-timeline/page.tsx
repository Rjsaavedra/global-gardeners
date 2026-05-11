"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

const backIcon = "/icons/back-button.svg";
const sproutIcon = "/icons/sprout-inactive.svg";

function PlantGrowthTimelinePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<Array<{ id: string; photo: string; note: string; date: string }>>([]);
  const returnTo = searchParams.get("returnTo");

  useEffect(() => {
    const raw = localStorage.getItem("ggPlantUpdates");
    if (!raw) return;
    try {
      setPosts(JSON.parse(raw));
    } catch {
      setPosts([]);
    }
  }, []);

  const timelineItems = useMemo(
    () =>
      [...posts]
        .sort((a, b) => {
          const aTime = new Date(`${a.date}T00:00:00`).getTime();
          const bTime = new Date(`${b.date}T00:00:00`).getTime();
          return bTime - aTime;
        })
        .map((post) => {
        const [y, m, d] = post.date.split("-").map(Number);
        const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
        return {
          ...post,
          month: new Intl.DateTimeFormat("en-US", { month: "short" }).format(dt),
          day: String(dt.getDate()).padStart(2, "0"),
          week: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(dt),
        };
        }),
    [posts],
  );

  return (
    <main className="client-main min-h-screen bg-[#f8f6f1] px-0 sm:grid sm:place-items-center sm:px-8">
      <section className="client-shell relative mx-auto flex min-h-screen w-full max-w-[390px] flex-col overflow-hidden border border-[#e7e0d2] bg-[#f8f6f1]">
        <header className="flex items-center border-b border-black/10 bg-white p-4">
          <button
            type="button"
            onClick={() => {
              if (returnTo) {
                router.push(returnTo);
                return;
              }
              router.back();
            }}
            className="inline-flex h-10 w-10 items-center justify-center"
            aria-label="Go back"
          >
            <img src={backIcon} alt="" aria-hidden="true" className="h-10 w-10" />
          </button>
          <div className="min-w-0 flex-1 pr-10 text-center">
            <h1 className="text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-[#457941]">Growth timeline</h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 pb-[120px]">
          {timelineItems.length > 0 ? (
            <div className="pt-7">
              <p className="mx-auto w-[270px] text-center text-[20px] font-semibold leading-6 text-[#182a17]">Track your plant&apos;s growth over time</p>
              <div className="relative mt-8 min-h-[calc(100vh-280px)] pb-10">
                <div className="absolute left-[65px] top-0 bottom-0 z-0 w-[4px] bg-[#e5e5e5]" />
                {timelineItems.length > 0 ? (
                  <div
                    className="absolute left-[65px] top-0 z-10 w-[4px] bg-[#1f3b1f]"
                    style={{ height: `${Math.max(90, 90 + (timelineItems.length - 1) * 222)}px` }}
                  />
                ) : null}
                {timelineItems.map((item, index) => {
                  const hasPhoto = Boolean(item.photo);
                  const rowHeight = hasPhoto ? 190 : 92;
                  const dotTop = hasPhoto ? 83 : 38;
                  const dateTop = hasPhoto ? 50 : 5;
                  return (
                  <div
                    key={item.id}
                    className={`relative mb-8 ${hasPhoto ? "" : "flex items-center"}`}
                    style={{ minHeight: `${rowHeight}px` }}
                  >
                    <div className="absolute left-[65px] z-20 h-3 w-3 -translate-x-[4px] rounded-full bg-[#457941]" style={{ top: `${dotTop}px` }} />

                    <div className="absolute left-0 w-[44px] text-center" style={{ top: `${dateTop}px` }}>
                      <p className="text-[16px] font-medium leading-[24px] text-[#333333cc]">{item.month}</p>
                      <p className="text-[30px] font-semibold leading-[30px] tracking-[-1px] text-[#182a17]">{item.day}</p>
                      <p className="text-[16px] font-medium leading-6 text-[#333333cc]">{item.week}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => router.push(`/plant/growth-timeline/${item.id}`)}
                      className={`ml-[90px] w-[calc(100%-90px)] rounded-[16px] border border-[#d4d4d4] bg-[#fafafa] p-2 text-left ${hasPhoto ? "" : "my-auto"}`}
                    >
                      {item.photo ? (
                        <div className="relative h-[136px] w-full overflow-hidden rounded-[12px]">
                          <img src={item.photo} alt="Plant update" className="absolute inset-0 h-full w-full object-cover" />
                        </div>
                      ) : null}
                      <p className="p-2 text-[14px] font-medium leading-5 text-[#333333cc]">
                        {item.note || "Plant update added."}
                      </p>
                    </button>
                  </div>
                )})}
                <div className="h-10" />
              </div>
            </div>
          ) : (
            <div className="flex min-h-[calc(100vh-73px-120px)] flex-col justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-[#fefce8] p-3">
                  <img src={sproutIcon} alt="" aria-hidden="true" className="h-10 w-10" />
                </div>
                <div className="text-center">
                  <p className="text-[20px] font-semibold leading-6 text-[#333333]">No updates yet</p>
                  <p className="mt-2 text-[14px] font-medium leading-5 text-[#333333cc]">Start tracking your plant&apos;s growth over time.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-40 w-full bg-[#f8f6f1] px-4 pb-4 pt-5">
          <button
            type="button"
            onClick={() => router.push("/plant/growth-timeline/add-update")}
            className="h-[52px] w-full rounded-[1000px] bg-[#457941] text-[14px] font-medium leading-5 text-[#fafafa]"
          >
            {timelineItems.length > 0 ? "Add your plant update" : "Add your first update"}
          </button>
        </div>
      </section>
    </main>
  );
}

export default function PlantGrowthTimelinePage() {
  return (
    <Suspense
      fallback={
        <main className="client-main min-h-screen bg-[#f8f6f1] px-0 sm:grid sm:place-items-center sm:px-8">
          <section className="client-shell relative mx-auto flex min-h-screen w-full items-center justify-center border border-[#e7e0d2] bg-[#f8f6f1]">
            <p className="text-[14px] text-[#525252]">Loading timeline...</p>
          </section>
        </main>
      }
    >
      <PlantGrowthTimelinePageContent />
    </Suspense>
  );
}
