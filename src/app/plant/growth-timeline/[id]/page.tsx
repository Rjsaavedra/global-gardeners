"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const backIcon = "/icons/back-button.svg";

type PlantUpdate = {
  id: string;
  photo: string;
  photos?: string[];
  note: string;
  date: string;
};

export default function TimelineUpdateDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [update, setUpdate] = useState<PlantUpdate | null>(null);
  const [isDeleteDrawerOpen, setIsDeleteDrawerOpen] = useState(false);

  const handleBack = () => {
    if (!update) {
      router.push("/plant/growth-timeline");
      return;
    }
    router.back();
  };

  useEffect(() => {
    const raw = localStorage.getItem("ggPlantUpdates");
    if (!raw) return;
    try {
      const list = JSON.parse(raw) as PlantUpdate[];
      const found = list.find((item) => item.id === params.id) ?? null;
      setUpdate(found);
    } catch {
      setUpdate(null);
    }
  }, [params.id]);

  const dateLabel = useMemo(() => {
    if (!update?.date) return "";
    const [y, m, d] = update.date.split("-").map(Number);
    const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
    const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(dt);
    const day = String(dt.getDate()).padStart(2, "0");
    const week = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(dt);
    return `${month} ${day} ${week}`;
  }, [update]);
  const hasPhoto = useMemo(() => {
    const value = update?.photo;
    if (!value) return false;
    const normalized = value.trim();
    if (!normalized) return false;
    if (normalized === "null" || normalized === "undefined") return false;
    return normalized.startsWith("data:image/") || normalized.startsWith("blob:") || normalized.startsWith("http");
  }, [update?.photo]);
  const photoItems = useMemo(() => {
    if (!update) return [] as string[];
    if (Array.isArray(update.photos) && update.photos.length > 0) return update.photos.filter(Boolean);
    return update.photo ? [update.photo] : [];
  }, [update]);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  useEffect(() => {
    setActivePhotoIndex(0);
  }, [update?.id]);

  const goPrevPhoto = () => {
    if (!photoItems.length) return;
    setActivePhotoIndex((prev) => (prev - 1 + photoItems.length) % photoItems.length);
  };

  const goNextPhoto = () => {
    if (!photoItems.length) return;
    setActivePhotoIndex((prev) => (prev + 1) % photoItems.length);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.touches[0]?.clientX ?? null);
    setTouchEndX(null);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    setTouchEndX(event.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = () => {
    if (touchStartX == null || touchEndX == null) return;
    const delta = touchStartX - touchEndX;
    if (Math.abs(delta) < 40) return;
    if (delta > 0) goNextPhoto();
    else goPrevPhoto();
  };

  const handleDelete = () => {
    const raw = localStorage.getItem("ggPlantUpdates");
    if (!raw) {
      router.push("/plant/growth-timeline");
      return;
    }
    try {
      const list = JSON.parse(raw) as PlantUpdate[];
      const next = list.filter((item) => item.id !== params.id);
      localStorage.setItem("ggPlantUpdates", JSON.stringify(next));
    } catch {
      localStorage.removeItem("ggPlantUpdates");
    }
    router.push("/plant/growth-timeline");
  };

  return (
    <main className="client-main min-h-screen bg-[#f8f6f1] px-0 sm:grid sm:place-items-center sm:px-8">
      <section className="client-shell relative mx-auto flex min-h-screen w-full max-w-[390px] flex-col overflow-hidden border border-[#e7e0d2] bg-[#f8f6f1]">
        <header className="fixed left-0 right-0 top-0 z-30 flex w-full items-center border-b border-black/10 bg-white p-4">
          <button type="button" onClick={handleBack} className="inline-flex h-10 w-10 items-center justify-center" aria-label="Go back">
            <img src={backIcon} alt="" aria-hidden="true" className="h-10 w-10" />
          </button>
          <div className="min-w-0 flex-1 pr-10 text-center">
            <h1 className="text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-[#457941]">Note details</h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pt-[72px] pb-[136px]">
          {hasPhoto && photoItems.length > 0 ? (
            <div className="relative w-full">
              <div
                className="relative h-[285px] w-full overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img src={photoItems[activePhotoIndex] || ""} alt="Update image" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute right-4 top-4 rounded-[8px] bg-[#171717] px-2 py-1 text-[12px] font-semibold leading-4 text-white">{`${activePhotoIndex + 1}/${photoItems.length}`}</div>
              </div>
              <div className="mx-auto mt-3 flex w-[50px] items-center justify-center gap-2">
                {photoItems.map((_, index) => (
                  <button
                    key={`dot-${index}`}
                    type="button"
                    aria-label={`Go to photo ${index + 1}`}
                    onClick={() => setActivePhotoIndex(index)}
                    className={`h-2 w-2 rounded-full ${index === activePhotoIndex ? "bg-[#457941]" : "bg-[#d4e5d2]"}`}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div className="px-4 pt-6">
            <h2 className="text-[30px] font-semibold leading-[30px] tracking-[-1px] text-[#182a17]">{dateLabel}</h2>
            <p className="mt-4 text-[16px] font-medium leading-6 text-[#333333cc]">{update?.note || "No note added."}</p>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-40 w-full bg-[#f8f6f1] px-4 pb-4 pt-2">
          <button type="button" onClick={() => router.push(`/plant/growth-timeline/${params.id}/edit`)} className="h-[52px] w-full rounded-[1000px] bg-[#457941] text-[14px] font-medium leading-5 text-[#fafafa]">Edit</button>
          <button type="button" onClick={() => setIsDeleteDrawerOpen(true)} className="mt-2 h-[52px] w-full rounded-[1000px] bg-[#ef4444] text-[14px] font-medium leading-5 text-white">Delete</button>
        </div>

        <div
          className={`fixed inset-0 z-50 bg-black/30 transition-opacity duration-200 ${isDeleteDrawerOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
          onClick={() => setIsDeleteDrawerOpen(false)}
          aria-hidden={!isDeleteDrawerOpen}
        />
        <div
          className={`fixed bottom-0 left-0 right-0 z-[60] w-full rounded-t-[20px] bg-white px-4 pb-6 pt-3 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] transition-transform duration-200 ${isDeleteDrawerOpen ? "translate-y-0" : "translate-y-full"}`}
          role="dialog"
          aria-modal="true"
          aria-hidden={!isDeleteDrawerOpen}
        >
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#d4d4d4]" />
          <h3 className="text-center text-[20px] font-semibold leading-6 text-[#182a17]">Delete update?</h3>
          <p className="mt-2 text-center text-[14px] font-medium leading-5 text-[#333333cc]">This action canâ€™t be undone.</p>
          <button
            type="button"
            onClick={handleDelete}
            className="mt-6 h-[52px] w-full rounded-[1000px] bg-[#ef4444] text-[14px] font-medium leading-5 text-white"
          >
            Delete update
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteDrawerOpen(false)}
            className="mt-2 h-[52px] w-full rounded-[1000px] border border-[#d4d4d4] bg-white text-[14px] font-medium leading-5 text-[#182a17]"
          >
            Cancel
          </button>
        </div>
      </section>
    </main>
  );
}

