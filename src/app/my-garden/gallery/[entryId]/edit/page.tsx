"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const MAX_PHOTOS = 5;

type PlantPickerItem = {
  id: string;
  name: string;
  species: string;
  imageUrl: string | null;
  identified: boolean;
};

type GalleryEntryDetail = {
  id: number;
  title: string;
  note: string;
  photos: string[];
  plants: Array<{ plantId: number; commonName: string | null; scientificName: string | null }>;
};

const DRAFT_ATTACHMENTS_STORAGE_KEY = "ggEditDraftGalleryAttachments";
const DRAFT_PHOTOS_STORAGE_KEY = "ggEditDraftGalleryPhotos";

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 text-[#737373]" fill="none" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M13.5 13.5L17 17" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
    </svg>
  );
}

export default function EditGardenGalleryPhotoPage() {
  const router = useRouter();
  const params = useParams<{ entryId: string }>();
  const entryId = params?.entryId;

  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submitError, setSubmitError] = useState("");
  const [isPlantDrawerOpen, setIsPlantDrawerOpen] = useState(false);
  const [plantSearch, setPlantSearch] = useState("");
  const [pendingPlantId, setPendingPlantId] = useState<string | null>(null);
  const [attachedPlants, setAttachedPlants] = useState<PlantPickerItem[]>([]);
  const [availablePlants, setAvailablePlants] = useState<PlantPickerItem[]>([]);
  const drawerSwipeStartYRef = useRef<number | null>(null);
  const drawerSwipeEndYRef = useRef<number | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [isHydratingDraft, setIsHydratingDraft] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadPlants = async () => {
      try {
        const response = await fetch("/api/plants");
        if (!response.ok) return;
        const payload = (await response.json()) as { plants?: Array<{ id: number; commonName: string; scientificName: string | null; coverPhotoUrl: string | null }> };
        if (!Array.isArray(payload.plants) || cancelled) return;
        const deduped = new Map<string, PlantPickerItem>();
        payload.plants.forEach((plant) => {
          const id = String(plant.id);
          if (deduped.has(id)) return;
          deduped.set(id, {
            id,
            name: plant.commonName || "Unnamed plant",
            species: plant.scientificName || "Unidentified",
            imageUrl: plant.coverPhotoUrl,
            identified: Boolean(plant.scientificName),
          });
        });
        setAvailablePlants(Array.from(deduped.values()));
      } catch {}
    };
    void loadPlants();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!entryId) return;
    let cancelled = false;
    const loadEntry = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/garden-gallery/${entryId}`);
        if (!response.ok) return;
        const payload = (await response.json()) as { entry?: GalleryEntryDetail };
        if (!payload.entry || cancelled) return;
        setTitle(payload.entry.title || "");
        setNote(payload.entry.note || "");
        setPhotoUrls((payload.entry.photos || []).slice(0, MAX_PHOTOS));
        setAttachedPlants(payload.entry.plants.map((plant) => ({ id: String(plant.plantId), name: plant.commonName || "Unnamed plant", species: plant.scientificName || "Unidentified", imageUrl: null, identified: Boolean(plant.scientificName) })));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    void loadEntry();
    return () => { cancelled = true; };
  }, [entryId]);

  useEffect(() => {
    if (typeof window === "undefined" || isLoading) return;
    try {
      const p = sessionStorage.getItem(DRAFT_PHOTOS_STORAGE_KEY);
      if (p) setPhotoUrls((JSON.parse(p) as string[]).slice(0, MAX_PHOTOS));
      const a = sessionStorage.getItem(DRAFT_ATTACHMENTS_STORAGE_KEY);
      if (a) {
        const parsed = JSON.parse(a) as { attachedPlants?: PlantPickerItem[] };
        if (Array.isArray(parsed.attachedPlants)) setAttachedPlants(parsed.attachedPlants.slice(0, 2));
      }
    } catch {}
    setIsHydratingDraft(false);
  }, [isLoading]);

  useEffect(() => {
    if (typeof window === "undefined" || isHydratingDraft) return;
    sessionStorage.setItem(DRAFT_PHOTOS_STORAGE_KEY, JSON.stringify(photoUrls));
    sessionStorage.setItem(DRAFT_ATTACHMENTS_STORAGE_KEY, JSON.stringify({ attachedPlants }));
  }, [photoUrls, attachedPlants, isHydratingDraft]);

  const handleSave = async () => {
    if (!entryId || !photoUrls.length || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const response = await fetch(`/api/garden-gallery/${entryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, note, photos: photoUrls, attachedPlantIds: attachedPlants.map((plant) => plant.id) }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) { setSubmitError(result.error ?? "Unable to update photo."); return; }
      sessionStorage.removeItem(DRAFT_PHOTOS_STORAGE_KEY);
      sessionStorage.removeItem(DRAFT_ATTACHMENTS_STORAGE_KEY);
      router.push(`/my-garden/gallery/${entryId}`);
    } catch {
      setSubmitError("Unable to update photo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removePhotoAtIndex = (indexToRemove: number) => setPhotoUrls((prev) => prev.filter((_, index) => index !== indexToRemove));
  const handleAttachPlant = () => {
    if (!pendingPlantId) return;
    const match = availablePlants.find((plant) => plant.id === pendingPlantId);
    if (!match || attachedPlants.some((plant) => plant.id === match.id) || attachedPlants.length >= 2) { return; }
    setAttachedPlants((prev) => [...prev, match]);
    setPendingPlantId(null);
    setPlantSearch("");
    setIsPlantDrawerOpen(false);
  };
  const removeAttachedPlant = (plantId: string) => setAttachedPlants((prev) => prev.filter((plant) => plant.id !== plantId));

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") resolve(reader.result);
        else reject(new Error("Unable to read file."));
      };
      reader.onerror = () => reject(new Error("Unable to read file."));
      reader.readAsDataURL(file);
    });

  const compressDataUrl = (sourceDataUrl: string) =>
    new Promise<string>((resolve) => {
      const image = new window.Image();
      image.onload = () => {
        const maxDimension = 1440;
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
        const targetWidth = Math.max(1, Math.round(image.width * scale));
        const targetHeight = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const context = canvas.getContext("2d");
        if (!context) {
          resolve(sourceDataUrl);
          return;
        }
        context.drawImage(image, 0, 0, targetWidth, targetHeight);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      image.onerror = () => resolve(sourceDataUrl);
      image.src = sourceDataUrl;
    });

  const handleGallerySelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (!files.length) return;
    try {
      const dataUrls = await Promise.all(
        files.map(async (file) => compressDataUrl(await readFileAsDataUrl(file)))
      );
      setPhotoUrls((prev) => [...prev, ...dataUrls].slice(0, MAX_PHOTOS));
    } catch {
      setSubmitError("Unable to load selected photos.");
    } finally {
      event.target.value = "";
    }
  };

  const filteredPlants = availablePlants.filter((plant) => {
    const term = plantSearch.trim().toLowerCase();
    if (!term) return true;
    return plant.name.toLowerCase().includes(term) || plant.species.toLowerCase().includes(term);
  });

  return <main className="client-main min-h-screen bg-[#f8f6f1] px-0 text-[#182a17]"><section className="client-shell mx-auto flex min-h-screen w-full max-w-[390px] flex-col overflow-hidden border border-[#e7e0d2] bg-[#f8f6f1]"><header className="client-header sticky top-0 z-10 flex items-center border-b border-black/10 bg-white p-4"><Link href="#" aria-label="Back" className="inline-flex h-10 w-10 items-center justify-center" onClick={(e) => { e.preventDefault(); router.back(); }}><Image src="/icons/back-button.svg" alt="" aria-hidden="true" width={40} height={40} className="h-10 w-10" /></Link><h1 className="flex-1 pr-10 text-center text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-[#457941]">Edit photo</h1></header><div className="flex flex-1 flex-col overflow-y-auto px-4 pb-4 pt-8"><div className="space-y-6 pb-4"><div className="space-y-2"><p className="text-[14px] font-semibold leading-5 text-[#333333]">Add a photo</p><div className="grid gap-4" style={{ gridTemplateColumns: photoUrls.length ? "repeat(2, minmax(0, 1fr))" : "repeat(1, minmax(0, 1fr))" }}>{photoUrls.length < MAX_PHOTOS ? <button type="button" onClick={() => galleryInputRef.current?.click()} className="flex w-full flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-[#d4d4d4] bg-white/10 px-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.05)]" style={photoUrls.length ? { aspectRatio: "1 / 1" } : { minHeight: 144 }}><span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#31674c] text-white">+</span><span className="block"><span className="block text-[16px] font-medium leading-6 text-[#182a17]">Add a photo</span><span className="block text-[12px] leading-4 text-[#333333cc]">Choose photos to add.</span></span></button> : null}{photoUrls.map((u, i) => <div key={`${u}-${i}`} className="relative overflow-hidden rounded-lg" style={{ aspectRatio: "1 / 1" }}><img src={u} alt="Selected" className="h-full w-full object-cover" /><button type="button" onClick={() => removePhotoAtIndex(i)} className="absolute right-2 top-2"><Image src="/icons/remove-photo-badge.svg" alt="" aria-hidden="true" width={32} height={32} /></button></div>)}</div><input ref={galleryInputRef} type="file" accept="image/*" multiple onChange={handleGallerySelect} className="hidden" /></div><div className="space-y-2"><label htmlFor="photo-title" className="text-[14px] font-semibold leading-5 text-[#333333]">Photo title</label><input id="photo-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Name this photo..." className="h-[44px] w-full rounded-lg border border-black/10 bg-white p-2 text-[14px]" /></div><div className="space-y-2"><label htmlFor="caption" className="text-[14px] font-semibold leading-5 text-[#333333]">Note</label><textarea id="caption" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Write a caption..." className="h-[76px] w-full resize rounded-lg border border-black/10 bg-white p-2 text-[14px]" /></div><div className="space-y-3"><p className="text-[14px] font-semibold leading-5 text-[#333333]">Attach plant (optional)</p><button type="button" onClick={() => setIsPlantDrawerOpen(true)} className="flex h-[40px] w-full items-center justify-center gap-2 rounded-lg bg-[#171717] px-6 text-[14px] font-medium leading-5 text-white"><Image src="/icons/attach-plant.svg" alt="" aria-hidden="true" width={16} height={16} className="h-4 w-4" /><span>Attach a plant</span></button>{attachedPlants.map((plant) => <div key={plant.id} className="flex items-center gap-3 rounded-xl bg-white p-3"><img src={plant.imageUrl ?? "/images/figma/placeholder-expired.png"} alt={plant.name} className="h-11 w-11 rounded-md object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-[14px] font-medium leading-5 text-[#333333]">{plant.name}</p><p className="truncate text-[12px] leading-4 text-[#333333cc]">{plant.species}</p></div><button type="button" onClick={() => removeAttachedPlant(plant.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#525252]">x</button></div>)}</div></div></div><div className="border-t border-black/10 bg-[#f8f6f1] p-4"><button type="button" disabled={!photoUrls.length || isSubmitting || isLoading} onClick={() => { void handleSave(); }} className="h-[52px] w-full rounded-full bg-[#457941] text-[14px] font-medium leading-5 text-[#fafafa] disabled:opacity-50">{isSubmitting ? "Saving..." : "Save"}</button>{submitError ? <p className="mt-2 text-[12px] leading-4 text-[#ef4444]">{submitError}</p> : null}</div></section>{isPlantDrawerOpen ? <div className="fixed inset-0 z-40 flex items-end"><button type="button" className="absolute inset-0 bg-black/50" onClick={() => setIsPlantDrawerOpen(false)} /><section className="relative z-10 w-full rounded-t-[24px] border border-[#d4d4d480] bg-[#f8f6f1] px-4 pb-4 pt-6"><div className="mx-auto mb-6 h-[3px] w-20 rounded-[2px] bg-black/10 touch-none" onTouchStart={(e) => { drawerSwipeStartYRef.current = e.touches[0]?.clientY ?? 0; drawerSwipeEndYRef.current = drawerSwipeStartYRef.current; }} onTouchMove={(e) => { if (drawerSwipeStartYRef.current !== null) drawerSwipeEndYRef.current = e.touches[0]?.clientY ?? 0; }} onTouchEnd={() => { if (drawerSwipeStartYRef.current !== null && drawerSwipeEndYRef.current !== null && drawerSwipeEndYRef.current - drawerSwipeStartYRef.current > 56) setIsPlantDrawerOpen(false); drawerSwipeStartYRef.current = null; drawerSwipeEndYRef.current = null; }} /><h2 className="text-center text-[32px] font-semibold leading-9 tracking-[-1.2px] text-[#182a17]">Select plant</h2><div className="mt-6 space-y-6"><div className="rounded-full border border-black/5 bg-white px-3 py-2"><div className="flex items-center gap-3"><SearchIcon /><input value={plantSearch} onChange={(e) => setPlantSearch(e.target.value)} placeholder="Search for a specific plant" className="w-full bg-transparent text-[14px] leading-5 text-[#333333] focus:outline-none" /></div></div><div className="max-h-[370px] overflow-y-auto border-y border-black/10">{filteredPlants.map((plant) => { const isSelected = pendingPlantId === plant.id; const isAttached = attachedPlants.some((attached) => attached.id === plant.id); return <button key={plant.id} type="button" onClick={() => { if (isAttached) return; setPendingPlantId(plant.id); }} className={`flex w-full items-center gap-4 border-b border-black/10 p-3 text-left ${isSelected ? "bg-black/[0.03]" : ""} ${isAttached ? "opacity-60" : ""}`}><img src={plant.imageUrl ?? "/images/figma/placeholder-expired.png"} alt={plant.name} className="h-11 w-11 rounded-md object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-[14px] font-medium leading-5 text-[#333333]">{plant.name}</p><p className="truncate text-[12px] leading-4 text-[#333333cc]">{plant.species}</p></div><span className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${isSelected ? "border-[#457941] bg-[#457941] text-white" : "border-[#d4d4d4] bg-white text-transparent"}`}>✓</span></button>; })}</div><button type="button" onClick={handleAttachPlant} disabled={!pendingPlantId} className="h-[52px] w-full rounded-full bg-[#457941] text-[14px] font-medium leading-5 text-[#fafafa] disabled:opacity-50">Attach plant</button></div></section></div> : null}</main>;
}
