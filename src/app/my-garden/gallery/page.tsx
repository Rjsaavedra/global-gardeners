"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const fallbackGalleryImage = "/images/figma/placeholder-expired.png";

type GalleryStatus = "identified" | "unidentified";

type GalleryItem = {
  id: string;
  image: string;
  name: string;
  note: string;
  status: GalleryStatus;
};

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 20 20">
      <path
        d="M8.75 2.91699C5.52834 2.91699 2.91667 5.52866 2.91667 8.75033C2.91667 11.972 5.52834 14.5837 8.75 14.5837C10.2394 14.5837 11.5985 14.0259 12.6293 13.1083L16.5939 17.0729C16.838 17.317 17.2337 17.317 17.4778 17.0729C17.722 16.8288 17.722 16.433 17.4778 16.1889L13.5132 12.2243C14.4308 11.1935 14.9887 9.83442 14.9887 8.34506C14.9887 5.1234 12.377 2.51172 9.15533 2.51172H8.75ZM4.16667 8.75033C4.16667 6.21899 6.21867 4.16699 8.75 4.16699C11.2813 4.16699 13.3333 6.21899 13.3333 8.75033C13.3333 11.2817 11.2813 13.3337 8.75 13.3337C6.21867 13.3337 4.16667 11.2817 4.16667 8.75033Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function GardenGalleryViewAllPage() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "identified" | "unidentified">("all");
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    const loadGallery = async () => {
      try {
        const response = await fetch("/api/garden-gallery");
        if (!response.ok) return;
        const payload = (await response.json()) as {
          entries?: Array<{
            id: number;
            title?: string | null;
            note?: string | null;
            coverPhotoUrl: string | null;
            plants?: Array<{ commonName: string | null; scientificName: string | null }>;
          }>;
        };
        if (cancelled || !Array.isArray(payload.entries)) return;
        setGalleryItems(
          payload.entries.map((entry) => {
            const photoTitle = entry.title?.trim() || "Garden photo";
            const note = entry.note?.trim() || "";
            return {
              id: String(entry.id),
              image: entry.coverPhotoUrl ?? fallbackGalleryImage,
              name: photoTitle,
              note,
              status: entry.plants?.[0]?.scientificName?.trim() ? "identified" : "unidentified",
            } satisfies GalleryItem;
          })
        );
      } catch {
        // no-op
      }
    };
    void loadGallery();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredItems = useMemo(() => {
    const normalized = searchValue.trim().toLowerCase();
    return galleryItems.filter((item) => {
      const matchesFilter = activeFilter === "all" ? true : item.status === activeFilter;
      const matchesSearch = normalized
        ? item.name.toLowerCase().includes(normalized) || item.note.toLowerCase().includes(normalized)
        : true;
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchValue, galleryItems]);

  return (
    <main className="client-main min-h-screen bg-[radial-gradient(circle_at_top,_#fffdf7_0%,_#f8f6f1_50%,_#efe9dc_100%)] px-0 text-[#182a17]">
      <section className="client-shell relative flex min-h-screen w-full flex-col overflow-x-hidden border border-[#e7e0d2] bg-[#f8f6f1] shadow-[0_24px_80px_rgba(56,71,45,0.12)]">
        <header className="client-header fixed left-0 right-0 top-0 z-30 flex w-full items-center border-b border-black/10 bg-white p-4">
          <button
            type="button"
            aria-label="Back to My Garden"
            className="inline-flex h-10 w-10 items-center justify-center transition"
            onClick={() => router.push("/my-garden")}
          >
            <Image src="/icons/back-button.svg" alt="" aria-hidden="true" width={40} height={40} className="h-10 w-10" />
          </button>
          <div className="flex min-w-0 flex-1 items-center justify-center pr-10">
            <h1 className="text-center text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-[#457941]">Garden Gallery</h1>
          </div>
        </header>

        <div className="flex flex-col gap-8 px-4 pb-8 pt-[104px]">
          <section className="flex flex-col gap-6">
            <div className="rounded-full border border-black/5 bg-white px-3 py-2">
              <div className="flex min-h-[32px] items-center gap-2 rounded-lg px-2">
                <span className="text-[#33333380]">
                  <SearchIcon />
                </span>
                <input
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search for a specific plant"
                  aria-label="Search for a specific plant"
                  className="w-full bg-transparent text-[14px] font-normal leading-5 text-[#333333] placeholder:text-[#33333380] outline-none"
                />
              </div>
            </div>

            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={`min-h-10 flex-1 rounded-l-[100px] border px-3 py-[9.5px] text-[14px] font-medium leading-5 ${
                  activeFilter === "all"
                    ? "border-[#3e6d3b] bg-[#457941] text-white"
                    : "border-black/10 bg-white text-[#333333cc]"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("identified")}
                className={`min-h-10 flex-1 border-y border-r px-3 py-[9.5px] text-[14px] font-medium leading-5 ${
                  activeFilter === "identified"
                    ? "border-[#3e6d3b] bg-[#457941] text-white"
                    : "border-black/10 bg-white text-[#333333cc]"
                }`}
              >
                Identified
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("unidentified")}
                className={`min-h-10 flex-1 rounded-r-[100px] border-y border-r px-3 py-[9.5px] text-[14px] font-medium leading-5 ${
                  activeFilter === "unidentified"
                    ? "border-[#3e6d3b] bg-[#457941] text-white"
                    : "border-black/10 bg-white text-[#333333cc]"
                }`}
              >
                Unidentified
              </button>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <article key={item.id} className="flex min-w-0 cursor-pointer flex-col" role="button" tabIndex={0} onClick={() => router.push(`/my-garden/gallery/${item.id}`)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); router.push(`/my-garden/gallery/${item.id}`); } }}>
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-[153px] w-full rounded-t-[16px] object-cover shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.1)]"
                />
                <div className="rounded-b-[16px] border-x border-b border-black/5 bg-white px-3 pb-3 pt-2">
                  <p className="text-[14px] font-medium leading-5 text-[#333333]">{item.name}</p>
                  <p className="line-clamp-2 text-[12px] font-normal leading-4 text-[#333333cc]">{item.note || "No note"}</p>
                </div>
              </article>
            ))}
          </section>
        </div>
      </section>
    </main>
  );
}
