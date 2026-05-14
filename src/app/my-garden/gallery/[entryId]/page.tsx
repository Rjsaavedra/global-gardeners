"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const fallbackGalleryImage = "/images/figma/placeholder-expired.png";

type GalleryEntryDetail = {
  id: number;
  title: string;
  note: string;
  createdAt: string;
  coverPhotoUrl: string | null;
  photos: string[];
  plants: Array<{ plantId: number; commonName: string | null; scientificName: string | null }>;
};

export default function GardenGalleryDetailPage() {
  const router = useRouter();
  const params = useParams<{ entryId: string }>();
  const [entry, setEntry] = useState<GalleryEntryDetail | null>(null);
  const [isDeleteDrawerMounted, setIsDeleteDrawerMounted] = useState(false);
  const [isDeleteDrawerVisible, setIsDeleteDrawerVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  useEffect(() => {
    const entryId = params?.entryId;
    if (!entryId) return;

    let cancelled = false;
    const loadEntry = async () => {
      const response = await fetch(`/api/garden-gallery/${entryId}`);
      if (!response.ok) return;
      const payload = (await response.json()) as { entry?: GalleryEntryDetail };
      if (cancelled || !payload.entry) return;
      setEntry(payload.entry);
    };

    void loadEntry();
    return () => {
      cancelled = true;
    };
  }, [params?.entryId]);

  const photos = entry?.photos?.length ? entry.photos : [entry?.coverPhotoUrl ?? fallbackGalleryImage];
  const photoCount = Math.max(1, photos.length);
  const safeActivePhotoIndex = Math.min(activePhotoIndex, photoCount - 1);
  const photoSrc = photos[safeActivePhotoIndex] ?? fallbackGalleryImage;
  const createdAtLabel = entry?.createdAt
    ? new Date(entry.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : "";

  const handleDelete = async () => {
    if (!entry || isDeleting) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      const response = await fetch(`/api/garden-gallery/${entry.id}`, { method: "DELETE" });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setDeleteError(payload.error ?? "Unable to delete photo.");
        return;
      }
      router.push("/my-garden/gallery");
    } catch {
      setDeleteError("Unable to delete photo.");
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDrawer = () => {
    setIsDeleteDrawerMounted(true);
    requestAnimationFrame(() => setIsDeleteDrawerVisible(true));
  };

  const closeDeleteDrawer = () => {
    if (isDeleting) return;
    setIsDeleteDrawerVisible(false);
    setDeleteError("");
    setTimeout(() => setIsDeleteDrawerMounted(false), 220);
  };

  useEffect(() => {
    setActivePhotoIndex(0);
  }, [entry?.id]);

  return (
    <main className="client-main min-h-screen bg-[radial-gradient(circle_at_top,_#fffdf7_0%,_#f8f6f1_50%,_#efe9dc_100%)] px-0 text-[#182a17]">
      <section className="client-shell relative flex min-h-screen w-full flex-col overflow-x-hidden border border-[#e7e0d2] bg-[#f8f6f1] shadow-[0_24px_80px_rgba(56,71,45,0.12)]">
        <header className="client-header fixed left-0 right-0 top-0 z-30 flex w-full items-center border-b border-black/10 bg-white p-4">
          <button type="button" aria-label="Back to Garden Gallery" className="inline-flex h-10 w-10 items-center justify-center transition" onClick={() => router.push("/my-garden/gallery")}>
            <Image src="/icons/back-button.svg" alt="" aria-hidden="true" width={40} height={40} className="h-10 w-10" />
          </button>
          <div className="flex min-w-0 flex-1 items-center justify-center">
            <h1 className="text-center text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-[#457941]">Gallery Photo</h1>
          </div>
          <button type="button" aria-label="Delete photo" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f5f5] text-[#737373]" onClick={openDeleteDrawer}>
            <Image src="/icons/trash-2.svg" alt="" aria-hidden="true" width={24} height={24} className="h-6 w-6" />
          </button>
        </header>

        <div className="flex flex-1 flex-col gap-6 pb-[104px] pt-[72px]">
          <div className="relative -mx-px w-[calc(100%+2px)]">
            <img src={photoSrc} alt={entry?.title || "Garden photo"} className="h-[285px] w-full object-cover" />
            <span className="absolute right-4 top-4 rounded-lg bg-[#171717] px-2 py-1 text-[12px] font-semibold leading-4 text-[#fafafa]">{`${safeActivePhotoIndex + 1}/${photoCount}`}</span>
          </div>
          <div className="mx-auto flex items-center gap-2">
            {Array.from({ length: photoCount }).map((_, index) => (
              <button
                key={`dot-${index}`}
                type="button"
                aria-label={`View photo ${index + 1}`}
                onClick={() => setActivePhotoIndex(index)}
                className={`h-2 w-2 rounded-full ${index === safeActivePhotoIndex ? "bg-[#457941]" : "bg-[#a8c9a6]"}`}
              />
            ))}
          </div>

          <section className="flex w-full flex-col gap-4 px-4">
            {entry?.plants?.length ? (
              <button
                type="button"
                className="inline-flex items-center gap-2 text-left"
                onClick={() => router.push(`/plant/${entry.plants[0].plantId}`)}
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f0fdf4]">
                  <Image src="/icons/chat-menus/leaf.svg" alt="" aria-hidden="true" width={16} height={16} className="h-4 w-4" />
                </span>
                <span className="text-[16px] font-medium leading-6 text-[#333333]">
                  {`Plant: ${entry.plants[0].commonName || "Linked plant"}`}
                </span>
              </button>
            ) : null}
            <div>
              <p className="text-[36px] font-semibold leading-[1.05] tracking-[-1px] text-[#111111]">{entry?.title || "Garden photo"}</p>
              {createdAtLabel ? <p className="mt-1 text-[12px] leading-4 text-[#333333cc]">{createdAtLabel}</p> : null}
            </div>
            <p className="whitespace-pre-wrap text-[16px] font-normal leading-5 text-[#333333cc]">{entry?.note || "No note"}</p>
          </section>

          <div className="fixed bottom-0 left-0 right-0 border-t border-black/10 bg-[#f8f6f1] p-4">
            <button
              type="button"
              onClick={() => {
                if (!entry) return;
                router.push(`/my-garden/gallery/${entry.id}/edit`);
              }}
              className="h-[52px] w-full rounded-full bg-[#457941] text-[14px] font-medium leading-5 text-[#fafafa]"
            >
              Edit
            </button>
          </div>
        </div>

        {isDeleteDrawerMounted ? (
          <div className="fixed inset-0 z-50 flex items-end">
            <button
              type="button"
              className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${isDeleteDrawerVisible ? "opacity-100" : "opacity-0"}`}
              aria-label="Close delete drawer"
              onClick={closeDeleteDrawer}
            />
            <section className={`relative z-10 w-full rounded-t-[24px] border border-[#d4d4d480] bg-[#f8f6f1] px-4 pb-5 pt-6 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] transition-transform duration-200 ease-out ${isDeleteDrawerVisible ? "translate-y-0" : "translate-y-full"}`}>
              <div className="absolute left-1/2 top-[7px] h-[3px] w-20 -translate-x-1/2 rounded-[2px] bg-black/10" />
              <div className="pt-5">
                <h2 className="text-center text-[20px] font-semibold leading-6 text-[#182a17]">Delete photo?</h2>
                <p className="mt-4 text-center text-[14px] font-medium leading-5 text-[#333333cc]">This action cannot be undone.</p>
                {deleteError ? <p className="mt-3 text-center text-[12px] leading-4 text-[#ef4444]">{deleteError}</p> : null}
              </div>
              <div className="mt-8 space-y-2">
                <button type="button" disabled={isDeleting} className="h-[52px] w-full rounded-full bg-[#ef4444] text-[14px] font-medium leading-5 text-white disabled:opacity-50" onClick={() => { void handleDelete(); }}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
                <button type="button" disabled={isDeleting} className="h-[52px] w-full rounded-full bg-white text-[14px] font-medium leading-5 text-[#333333] disabled:opacity-50" onClick={closeDeleteDrawer}>
                  Cancel
                </button>
              </div>
            </section>
          </div>
        ) : null}
      </section>
    </main>
  );
}
