"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

const backIcon = "/icons/back-button.svg";
const calendarIcon = "/icons/logs/calendar.svg";
const toLocalIsoDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

function AddPlantUpdatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plantId = searchParams.get("plantId");
  const todayIso = useMemo(() => toLocalIsoDate(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());

  const displayDate = useMemo(() => {
    const parsed = new Date(`${selectedDate}T00:00:00`);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(parsed);
  }, [selectedDate]);

  useEffect(() => {
    const storedBatch = sessionStorage.getItem("ggPlantUpdatePhotos");
    if (storedBatch) {
      try {
        const photos = JSON.parse(storedBatch) as string[];
        setSelectedPhotos((prev) => {
          const incoming = Array.isArray(photos) ? photos : [];
          return Array.from(new Set([...prev, ...incoming]));
        });
      } catch {
        // no-op
      }
      sessionStorage.removeItem("ggPlantUpdatePhotos");
      sessionStorage.removeItem("ggPlantUpdatePhoto");
      return;
    }
    const stored = sessionStorage.getItem("ggPlantUpdatePhoto");
    if (stored) {
      setSelectedPhotos((prev) => Array.from(new Set([...prev, stored])));
      sessionStorage.removeItem("ggPlantUpdatePhoto");
    }
  }, []);

  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date(viewYear, viewMonth, 1));
  }, [viewYear, viewMonth]);

  const dayCells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const start = new Date(firstDay);
    start.setDate(1 - firstDay.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [viewYear, viewMonth]);

  const changeMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };
  const canPost = note.trim().length > 0;
  const resolvedPlantId = useMemo(() => {
    if (plantId) return plantId;
    try {
      const stored = sessionStorage.getItem("ggCurrentPlantId");
      return stored && stored.trim() ? stored.trim() : null;
    } catch {
      return null;
    }
  }, [plantId]);

  return (
    <main className="client-main h-screen overflow-hidden bg-[#f8f6f1] px-0 sm:grid sm:place-items-center sm:px-8">
      <section className="client-shell relative mx-auto flex h-screen w-full max-w-[390px] flex-col overflow-hidden border border-[#e7e0d2] bg-[#f8f6f1]">
        <header className="fixed left-0 right-0 top-0 z-30 flex items-center border-b border-black/10 bg-white p-4">
          <button type="button" onClick={() => router.back()} className="inline-flex h-10 w-10 items-center justify-center" aria-label="Go back">
            <img src={backIcon} alt="" aria-hidden="true" className="h-10 w-10" />
          </button>
          <div className="min-w-0 flex-1 pr-10 text-center">
            <h1 className="text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-[#457941]">New post</h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 pb-[120px] pt-[104px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-[14px] font-semibold leading-5 tracking-[0px] text-[#333333]">Add a photo</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      sessionStorage.setItem("ggPlantUpdatePhotos", JSON.stringify(selectedPhotos));
                    } catch {
                      // Ignore storage write failures.
                    }
                    router.push(`/plant/growth-timeline/add-update/camera${resolvedPlantId ? `?plantId=${resolvedPlantId}` : ""}`);
                  }}
                  className={`relative flex w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-[8px] border border-dashed border-[#d4d4d4] bg-[rgba(255,255,255,0.1)] px-6 py-6 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] ${
                    selectedPhotos.length === 0 ? "col-span-2 min-h-[254px]" : "aspect-square"
                  }`}
                >
                  <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-[110px] bg-[#31674c]">
                    <span className="text-[24px] leading-none text-white">+</span>
                  </span>
                  <span className="relative z-10 text-center">
                    <span className="block text-[16px] font-medium leading-6 tracking-[0px] text-[#182a17]">Add a photo</span>
                    <span className="mx-auto block w-[115px] text-[12px] font-normal leading-4 tracking-[0px] text-[#333333cc]">Take or choose a photo to share.</span>
                  </span>
                </button>

                {selectedPhotos.map((photo, index) => (
                  <div key={`${photo}-${index}`} className="relative aspect-square w-full overflow-hidden rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
                    <img src={photo} alt={`Selected update photo ${index + 1}`} className="absolute inset-0 h-full w-full object-cover" />
                    <button
                      type="button"
                      aria-label={`Remove selected photo ${index + 1}`}
                      onClick={() => setSelectedPhotos((prev) => prev.filter((_, i) => i !== index))}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white"
                    >
                      <span className="text-[16px] leading-none">�</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[14px] font-semibold leading-5 tracking-[0px] text-[#333333]">Note (optional)</p>
              <textarea
                placeholder="Write a caption..."
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="h-[76px] w-full resize-none rounded-[8px] border border-[#e5e5e5] bg-white p-2 text-[14px] font-normal leading-5 tracking-[0px] text-[#333333] placeholder:text-[#33333380] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline-none"
              />
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setCalendarOpen((v) => !v)}
                className={`flex min-h-[36px] w-full items-center gap-2 rounded-[8px] px-3 py-[7.5px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] ${calendarOpen ? "border border-[#a3a3a3] bg-[#f5f5f5] shadow-[0_0_0_3px_#d4d4d4]" : "border border-[#e5e5e5] bg-white"}`}
              >
              <span className="flex w-5 items-center justify-center p-0.5">
                <img src={calendarIcon} alt="" aria-hidden="true" className="h-4 w-4" />
              </span>
                <span className="text-[14px] font-medium leading-5 tracking-[0px] text-[#333333]">{displayDate}</span>
              </button>

              {calendarOpen ? (
                <div className="rounded-[8px] border border-[#e5e5e5] bg-white p-4 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]">
                  <div className="mb-4 flex items-center justify-between">
                    <button
                      type="button"
                      aria-label="Previous month"
                      onClick={() => changeMonth(-1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e5e5e5] text-[#737373]"
                    >
                      <span aria-hidden="true" className="text-[16px] leading-none">‹</span>
                    </button>
                    <p className="text-[14px] font-medium leading-5 text-[#0a0a0a]">{monthLabel}</p>
                    <button
                      type="button"
                      aria-label="Next month"
                      onClick={() => changeMonth(1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e5e5e5] text-[#737373]"
                    >
                      <span aria-hidden="true" className="text-[16px] leading-none">›</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-7 text-center text-[12px] text-[#737373]">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => <div key={d} className="h-8 leading-8">{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7">
                    {dayCells.map((d) => {
                      const iso = toLocalIsoDate(d);
                      const inMonth = d.getMonth() === viewMonth;
                      const active = iso === selectedDate;
                      return (
                        <button
                          key={iso}
                          type="button"
                          onClick={() => {
                            setSelectedDate(iso);
                            setCalendarOpen(false);
                          }}
                          className={`h-12 rounded-[4px] text-[14px] ${inMonth ? "text-[#0a0a0a]" : "text-[#0a0a0a]/50"} ${active ? "bg-[#457941] text-white" : ""}`}
                        >
                          {d.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-40 w-full bg-[#f8f6f1] px-4 pb-4 pt-5">
          <button
            type="button"
            onClick={() => {
              if (!canPost) return;
              void (async () => {
                setSubmitError("");
                if (!resolvedPlantId) {
                  setSubmitError("Missing plant context. Open this from a plant page and try again.");
                  return;
                }
                setIsPosting(true);
                try {
                  const response = await fetch(`/api/plants/${resolvedPlantId}/timeline`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      photos: selectedPhotos,
                      note: note.trim(),
                      date: selectedDate,
                    }),
                  });
                  if (!response.ok) {
                    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
                    setSubmitError(payload?.error ?? "Unable to post update.");
                    return;
                  }
                  router.push(`/plant/growth-timeline?plantId=${resolvedPlantId}`);
                } finally {
                  setIsPosting(false);
                }
              })();
            }}
            disabled={!canPost || isPosting}
            className={`h-[52px] w-full rounded-[1000px] text-[14px] font-medium leading-5 tracking-[0px] text-[#fafafa] ${canPost && !isPosting ? "bg-[#457941]" : "bg-[#457941]/50"}`}
          >
            {isPosting ? "Posting..." : "Post"}
          </button>
          {submitError ? <p className="mt-2 text-center text-[12px] font-medium text-[#b91c1c]">{submitError}</p> : null}
        </div>
      </section>
    </main>
  );
}

export default function AddPlantUpdatePage() {
  return (
    <Suspense
      fallback={
        <main className="client-main min-h-screen bg-[#f8f6f1] px-0 sm:grid sm:place-items-center sm:px-8">
          <section className="client-shell relative mx-auto flex min-h-screen w-full items-center justify-center border border-[#e7e0d2] bg-[#f8f6f1]">
            <p className="text-[14px] text-[#525252]">Loading...</p>
          </section>
        </main>
      }
    >
      <AddPlantUpdatePageContent />
    </Suspense>
  );
}


