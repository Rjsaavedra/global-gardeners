"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const MAX_PHOTOS = 5;

function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-[18px] w-[18px]"
      fill="none"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M9 3V15" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path d="M3 9H15" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 text-[#737373]" fill="none" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M13.5 13.5L17 17" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
    </svg>
  );
}

function XIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
    </svg>
  );
}

type PlantPickerItem = {
  id: string;
  name: string;
  species: string;
  imageUrl: string | null;
  identified: boolean;
};

const DRAFT_ATTACHMENTS_STORAGE_KEY = "ggDraftGalleryAttachments";
const DRAFT_PHOTOS_STORAGE_KEY = "ggDraftGalleryPhotos";
const DRAFT_CAPTURED_PHOTO_STORAGE_KEY = "ggCapturedGalleryPhoto";

export default function NewGardenGalleryPhotoPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isPlantDrawerOpen, setIsPlantDrawerOpen] = useState(false);
  const [plantSearch, setPlantSearch] = useState("");
  const [plantFilter, setPlantFilter] = useState<"all" | "identified" | "unidentified">("all");
  const [pendingPlantId, setPendingPlantId] = useState<string | null>(null);
  const [attachedPlants, setAttachedPlants] = useState<PlantPickerItem[]>([]);
  const [availablePlants, setAvailablePlants] = useState<PlantPickerItem[]>([]);
  const [timelineSelections, setTimelineSelections] = useState<Record<string, boolean>>({});
  const drawerSwipeStartYRef = useRef<number | null>(null);
  const drawerSwipeEndYRef = useRef<number | null>(null);
  const [attachmentsDraftHydrated, setAttachmentsDraftHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = sessionStorage.getItem(DRAFT_PHOTOS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return;
      const valid = parsed.filter((value): value is string => typeof value === "string");
      setPhotoUrls(valid.slice(0, MAX_PHOTOS));
    } catch {
      setPhotoUrls([]);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = sessionStorage.getItem(DRAFT_ATTACHMENTS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (!parsed || typeof parsed !== "object") return;

      const attached =
        Array.isArray((parsed as { attachedPlants?: unknown }).attachedPlants)
          ? (parsed as { attachedPlants: unknown[] }).attachedPlants
              .map((item) => {
                if (!item || typeof item !== "object") return null;
                const candidate = item as Partial<PlantPickerItem>;
                if (typeof candidate.id !== "string" || typeof candidate.name !== "string" || typeof candidate.species !== "string") {
                  return null;
                }
                return {
                  id: candidate.id,
                  name: candidate.name,
                  species: candidate.species,
                  imageUrl: typeof candidate.imageUrl === "string" ? candidate.imageUrl : null,
                  identified: Boolean(candidate.identified),
                } satisfies PlantPickerItem;
              })
              .filter((item): item is PlantPickerItem => item !== null)
          : [];

      const timeline =
        (parsed as { timelineSelections?: unknown }).timelineSelections &&
        typeof (parsed as { timelineSelections?: unknown }).timelineSelections === "object"
          ? Object.fromEntries(
              Object.entries((parsed as { timelineSelections: Record<string, unknown> }).timelineSelections).map(([key, value]) => [
                key,
                Boolean(value),
              ])
            )
          : {};

      setAttachedPlants(attached.slice(0, 2));
      setTimelineSelections(timeline);
    } catch {
      // Ignore malformed cached attachment state.
    } finally {
      setAttachmentsDraftHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!attachmentsDraftHydrated) return;
    const payload = {
      attachedPlants,
      timelineSelections,
    };
    sessionStorage.setItem(DRAFT_ATTACHMENTS_STORAGE_KEY, JSON.stringify(payload));
  }, [attachedPlants, timelineSelections, attachmentsDraftHydrated]);

  useEffect(() => {
    let cancelled = false;

    const loadPlants = async () => {
      try {
        const response = await fetch("/api/plants");
        if (!response.ok) return;
        const payload = (await response.json()) as {
          plants?: Array<{ id: number; commonName: string; scientificName: string | null; coverPhotoUrl: string | null }>;
        };
        if (!Array.isArray(payload.plants) || cancelled) return;

        const normalized = payload.plants.map((plant) => {
          const name = plant.commonName?.trim() || "Unnamed plant";
          const species = plant.scientificName?.trim() || "Unidentified";
          return {
            id: String(plant.id),
            name,
            species,
            imageUrl: plant.coverPhotoUrl,
            identified: Boolean(plant.scientificName?.trim()),
          };
        });
        setAvailablePlants(normalized);
      } catch {
        // Keep plant picker usable even if fetching fails.
      }
    };

    void loadPlants();
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePost = async () => {
    if (!photoUrls.length || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/garden-gallery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          note,
          photos: photoUrls,
          attachedPlantIds: attachedPlants.map((plant) => plant.id),
        }),
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setSubmitError(result.error ?? "Unable to create post.");
        return;
      }

      sessionStorage.removeItem(DRAFT_PHOTOS_STORAGE_KEY);
      sessionStorage.removeItem(DRAFT_CAPTURED_PHOTO_STORAGE_KEY);
      sessionStorage.removeItem(DRAFT_ATTACHMENTS_STORAGE_KEY);
      router.push("/my-garden/gallery");
    } catch {
      setSubmitError("Unable to create post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removePhotoAtIndex = (indexToRemove: number) => {
    setPhotoUrls((prev) => {
      const next = prev.filter((_, index) => index !== indexToRemove);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(DRAFT_PHOTOS_STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  };

  const hasPhotos = photoUrls.length > 0;
  const filteredPlants = availablePlants.filter((plant) => {
    if (plantFilter === "identified" && !plant.identified) return false;
    if (plantFilter === "unidentified" && plant.identified) return false;
    const term = plantSearch.trim().toLowerCase();
    if (!term) return true;
    return plant.name.toLowerCase().includes(term) || plant.species.toLowerCase().includes(term);
  });

  const handleAttachPlant = () => {
    if (!pendingPlantId) return;
    const match = availablePlants.find((plant) => plant.id === pendingPlantId);
    if (!match) return;
    if (attachedPlants.some((plant) => plant.id === match.id)) {
      setIsPlantDrawerOpen(false);
      return;
    }
    if (attachedPlants.length >= 2) {
      setIsPlantDrawerOpen(false);
      return;
    }
    setAttachedPlants((prev) => [...prev, match]);
    setTimelineSelections((prev) => ({ ...prev, [match.id]: false }));
    setPendingPlantId(null);
    setPlantSearch("");
    setPlantFilter("all");
    setIsPlantDrawerOpen(false);
  };

  const removeAttachedPlant = (plantId: string) => {
    setAttachedPlants((prev) => prev.filter((plant) => plant.id !== plantId));
    setTimelineSelections((prev) => {
      const next = { ...prev };
      delete next[plantId];
      return next;
    });
    if (pendingPlantId === plantId) setPendingPlantId(null);
  };

  const handleDrawerSwipeStart = (y: number) => {
    drawerSwipeStartYRef.current = y;
    drawerSwipeEndYRef.current = y;
  };

  const handleDrawerSwipeMove = (y: number) => {
    if (drawerSwipeStartYRef.current === null) return;
    drawerSwipeEndYRef.current = y;
  };

  const handleDrawerSwipeEnd = () => {
    if (drawerSwipeStartYRef.current === null || drawerSwipeEndYRef.current === null) {
      drawerSwipeStartYRef.current = null;
      drawerSwipeEndYRef.current = null;
      return;
    }

    const swipeDistance = drawerSwipeEndYRef.current - drawerSwipeStartYRef.current;
    if (swipeDistance > 56) {
      setIsPlantDrawerOpen(false);
    }

    drawerSwipeStartYRef.current = null;
    drawerSwipeEndYRef.current = null;
  };

  return (
    <main className="client-main min-h-screen bg-[radial-gradient(circle_at_top,_#fffdf7_0%,_#f8f6f1_50%,_#efe9dc_100%)] px-0 text-[#182a17] sm:grid sm:place-items-center sm:px-8">
      <section className="client-shell mx-auto flex min-h-screen w-full max-w-[390px] flex-col overflow-hidden border border-[#e7e0d2] bg-[#f8f6f1] shadow-[0_24px_80px_rgba(56,71,45,0.12)]">
        <header className="client-header sticky top-0 z-10 flex items-center border-b border-black/10 bg-white p-4">
          <Link
            href="#"
            aria-label="Back"
            className="inline-flex h-10 w-10 items-center justify-center transition"
            onClick={(event) => {
              event.preventDefault();
              router.back();
            }}
          >
            <Image src="/icons/back-button.svg" alt="" aria-hidden="true" width={40} height={40} className="h-10 w-10" />
          </Link>
          <h1 className="flex-1 pr-10 text-center text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-[#457941]">
            Add photo
          </h1>
        </header>

        <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-4 pt-8">
          <div className="space-y-6 pb-4">
            <div className="space-y-2">
              <p className="text-[14px] font-semibold leading-5 text-[#333333]">Add a photo</p>
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: hasPhotos ? "repeat(2, minmax(0, 1fr))" : "repeat(1, minmax(0, 1fr))" }}
              >
                {photoUrls.length < MAX_PHOTOS ? (
                  <Link
                    href="/my-garden/gallery/new/camera"
                    className="flex w-full flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-[#d4d4d4] bg-white/10 px-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                    style={hasPhotos ? { aspectRatio: "1 / 1" } : { minHeight: 144 }}
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#31674c] text-white">
                      <PlusIcon />
                    </span>
                    <span className="block">
                      <span className="block text-[16px] font-medium leading-6 text-[#182a17]">Add a photo</span>
                      <span className="block text-[12px] leading-4 text-[#333333cc]">Take or choose a photo to share.</span>
                    </span>
                  </Link>
                ) : null}

                {photoUrls.map((photoUrl, index) => (
                  <div
                    key={`${photoUrl.slice(0, 20)}-${index}`}
                    className="relative w-full overflow-hidden rounded-lg bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                    style={{ aspectRatio: "1 / 1" }}
                  >
                    <div className="relative h-full w-full">
                      <img src={photoUrl} alt={`Selected photo ${index + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        aria-label={`Remove photo ${index + 1}`}
                        onClick={() => removePhotoAtIndex(index)}
                        className="z-20 inline-flex h-8 w-8 items-center justify-center transition"
                        style={{ position: "absolute", top: 8, right: 8 }}
                      >
                        <Image
                          src="/icons/remove-photo-badge.svg"
                          alt=""
                          aria-hidden="true"
                          width={32}
                          height={32}
                          className="h-8 w-8"
                          priority={false}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="photo-title" className="text-[14px] font-semibold leading-5 text-[#333333]">
                Photo title
              </label>
              <input
                id="photo-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Name this photo..."
                className="h-[44px] w-full rounded-lg border border-black/10 bg-white p-2 text-[14px] leading-5 text-[#333333] placeholder:text-[#33333380] shadow-[0_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-[#457941]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="caption" className="text-[14px] font-semibold leading-5 text-[#333333]">
                Note
              </label>
              <textarea
                id="caption"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Write a caption..."
                className="h-[76px] w-full resize rounded-lg border border-black/10 bg-white p-2 text-[14px] leading-5 text-[#333333] placeholder:text-[#33333380] shadow-[0_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-[#457941]"
              />
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
              <p className="text-[14px] font-semibold leading-5 text-[#333333]">Attach plant (optional)</p>
                <button
                  type="button"
                  onClick={() => setIsPlantDrawerOpen(true)}
                  className="flex h-[40px] w-full items-center justify-center gap-2 rounded-lg bg-[#171717] px-6 text-[14px] font-medium leading-5 text-white"
                >
                  <Image src="/icons/attach-plant.svg" alt="" aria-hidden="true" width={16} height={16} className="h-4 w-4" />
                  <span>Attach a plant</span>
                </button>
              </div>

              {attachedPlants.map((plant) => (
                <div
                  key={plant.id}
                  className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                >
                  <img src={plant.imageUrl ?? "/images/figma/placeholder-expired.png"} alt={plant.name} className="h-11 w-11 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium leading-5 text-[#333333]">{plant.name}</p>
                    <p className="truncate text-[12px] leading-4 text-[#333333cc]">{plant.species}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove attached ${plant.name}`}
                    onClick={() => removeAttachedPlant(plant.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#525252] transition hover:bg-black/5"
                  >
                    <XIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>

            {attachedPlants.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[14px] font-semibold leading-5 text-[#333333]">Linked plants:</p>
                <div className="space-y-3">
                  {attachedPlants.map((plant) => (
                    <span key={`linked-${plant.id}`} className="inline-flex w-fit max-w-full items-center gap-3 rounded-[10px] border border-black/10 bg-white px-3 py-3 text-[14px] font-medium leading-5 text-[#404040]">
                      {plant.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="border-t border-black/10 bg-[#f8f6f1] p-4">
          <button
            type="button"
            disabled={!photoUrls.length || isSubmitting}
            onClick={() => {
              void handlePost();
            }}
            className="h-[52px] w-full rounded-full bg-[#457941] text-[14px] font-medium leading-5 text-[#fafafa] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
          {submitError ? <p className="mt-2 text-[12px] leading-4 text-[#ef4444]">{submitError}</p> : null}
        </div>
      </section>

      {isPlantDrawerOpen ? (
        <div className="fixed inset-0 z-40 flex items-end sm:mx-auto sm:max-w-[390px]">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close plant selection"
            onClick={() => setIsPlantDrawerOpen(false)}
          />
          <section className="relative z-10 w-full rounded-t-[24px] border border-[#d4d4d480] bg-[#f8f6f1] px-4 pb-4 pt-6 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]">
            <div
              className="mx-auto mb-6 h-[3px] w-20 rounded-[2px] bg-black/10 touch-none"
              onTouchStart={(event) => handleDrawerSwipeStart(event.touches[0]?.clientY ?? 0)}
              onTouchMove={(event) => handleDrawerSwipeMove(event.touches[0]?.clientY ?? 0)}
              onTouchEnd={handleDrawerSwipeEnd}
              onPointerDown={(event) => handleDrawerSwipeStart(event.clientY)}
              onPointerMove={(event) => handleDrawerSwipeMove(event.clientY)}
              onPointerUp={handleDrawerSwipeEnd}
            />
            <h2 className="text-center text-[32px] font-semibold leading-9 tracking-[-1.2px] text-[#182a17]">Select plant</h2>

            <div className="mt-6 space-y-6">
              <div className="rounded-full border border-black/5 bg-white px-3 py-2">
                <div className="flex items-center gap-3">
                  <SearchIcon />
                  <input
                    value={plantSearch}
                    onChange={(event) => setPlantSearch(event.target.value)}
                    placeholder="Search for a specific plant"
                    className="w-full bg-transparent text-[14px] leading-5 text-[#333333] placeholder:text-[#33333380] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 overflow-hidden rounded-full border border-black/10">
                {(["all", "identified", "unidentified"] as const).map((tab) => {
                  const active = plantFilter === tab;
                  const label = tab === "all" ? "All" : tab === "identified" ? "Identified" : "Unidentified";
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setPlantFilter(tab)}
                      className={`h-10 text-[14px] font-medium leading-5 ${
                        active ? "border-[#559550] bg-[#5fa659] text-white" : "bg-white text-[#333333cc]"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <div className="max-h-[370px] overflow-y-auto border-y border-black/10 bg-transparent">
                {filteredPlants.map((plant) => {
                  const selected = pendingPlantId === plant.id;
                  return (
                    <button
                      key={plant.id}
                      type="button"
                      onClick={() => setPendingPlantId(plant.id)}
                      className={`flex w-full items-center gap-4 border-b border-black/10 p-3 text-left last:border-b-0 ${
                        selected ? "bg-black/[0.02]" : "bg-transparent"
                      }`}
                    >
                      <img src={plant.imageUrl ?? "/images/figma/placeholder-expired.png"} alt={plant.name} className="h-11 w-11 rounded-md object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-medium leading-5 text-[#333333]">{plant.name}</p>
                        <p className="truncate text-[12px] leading-4 text-[#333333cc]">{plant.species}</p>
                      </div>
                      <span
                        className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${
                          selected ? "border-[#457941] bg-[#457941] text-white" : "border-[#d4d4d4] bg-white text-transparent"
                        }`}
                      >
                        <svg aria-hidden="true" className="h-3 w-3" fill="none" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2.5 6.4L5 9L9.5 3.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
                        </svg>
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleAttachPlant}
                disabled={!pendingPlantId}
                className="h-[52px] w-full rounded-full bg-[#457941] text-[14px] font-medium leading-5 text-[#fafafa] disabled:opacity-50"
              >
                Attach plant
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

