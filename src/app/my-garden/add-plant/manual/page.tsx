"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

export default function AddPlantManualPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoDataUrls, setPhotoDataUrls] = useState<string[]>([]);
  const [selectedPlantName, setSelectedPlantName] = useState("");
  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);
  const [selectedPlantSpecies, setSelectedPlantSpecies] = useState("");
  const [selectedPlantImageUrl, setSelectedPlantImageUrl] = useState("");
  const [continueWithoutSelecting, setContinueWithoutSelecting] = useState(false);
  const [nickname, setNickname] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isPlantDrawerOpen, setIsPlantDrawerOpen] = useState(false);
  const [isPlantDrawerVisible, setIsPlantDrawerVisible] = useState(false);
  const [plantSearch, setPlantSearch] = useState("");
  const [plantOptions, setPlantOptions] = useState<Array<{ id: number; name: string; species: string; imageUrl: string; identified: boolean }>>([]);
  const [pendingPlantId, setPendingPlantId] = useState<number | null>(null);

  const canContinue = Boolean((selectedPlantName.trim() && selectedPlantId) || continueWithoutSelecting);
  const filteredPlants = useMemo(() => {
    const term = plantSearch.trim().toLowerCase();
    if (!term) return plantOptions;
    return plantOptions.filter((plant) => plant.name.toLowerCase().includes(term) || plant.species.toLowerCase().includes(term));
  }, [plantOptions, plantSearch]);

  useEffect(() => {
    if (isPlantDrawerOpen) {
      setIsPlantDrawerVisible(true);
      return;
    }
    const timer = window.setTimeout(() => setIsPlantDrawerVisible(false), 280);
    return () => window.clearTimeout(timer);
  }, [isPlantDrawerOpen]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const response = await fetch("/api/plants");
        if (!response.ok) return;
        const payload = (await response.json()) as {
          plants?: Array<{ id: number; commonName: string; scientificName: string | null; coverPhotoUrl: string | null }>;
        };
        if (cancelled || !Array.isArray(payload.plants)) return;
        const next = payload.plants.map((plant) => ({
          id: plant.id,
          name: plant.commonName?.trim() || "Unnamed plant",
          species: plant.scientificName?.trim() || "Unidentified",
          imageUrl: plant.coverPhotoUrl || "/images/figma/placeholder-expired.png",
          identified: Boolean(plant.scientificName?.trim()),
        }));
        setPlantOptions(next);
      } catch {
        // Silent fallback
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChoosePhoto = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setPhotoDataUrls((current) => {
            if (current.includes(reader.result as string)) return current;
            return [...current, reader.result as string].slice(0, 6);
          });
        }
      };
      reader.readAsDataURL(file);
    });
    event.target.value = "";
  };

  const removePhotoAt = (index: number) => {
    setPhotoDataUrls((current) => current.filter((_, idx) => idx !== index));
  };

  const handleAttachPlant = () => {
    if (pendingPlantId == null) return;
    const selected = plantOptions.find((plant) => plant.id === pendingPlantId);
    if (!selected) return;
    setSelectedPlantName(selected.name);
    setSelectedPlantId(selected.id);
    setSelectedPlantSpecies(selected.species);
    setSelectedPlantImageUrl(selected.imageUrl);
    setContinueWithoutSelecting(false);
    setPendingPlantId(null);
    setIsPlantDrawerOpen(false);
  };

  const handleContinue = async () => {
    if (!canContinue || isSubmitting) return;
    setIsSubmitting(true);
    setError("");

    try {
      sessionStorage.setItem(
        "ggManualAddDraft",
        JSON.stringify({
          photos: photoDataUrls,
          nickname: nickname.trim(),
          continueWithoutSelecting,
          selectedPlantId,
          selectedPlantName: selectedPlantName.trim(),
        }),
      );
      router.push("/my-garden/add-plant/manual/review");
    } catch {
      setError("Unable to continue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="client-main min-h-screen bg-[#f8f6f1] px-0 sm:grid sm:place-items-center sm:px-8">
      <section className="client-shell relative mx-auto flex min-h-screen w-full max-w-[390px] flex-col overflow-hidden border border-[#e7e0d2] bg-[#f8f6f1]">
        <header className="client-header fixed left-0 right-0 top-0 z-30 flex w-full items-center border-b border-black/10 bg-white p-4">
          <button
            type="button"
            aria-label="Back"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f5f5]"
            onClick={() => router.back()}
          >
            <Image src="/icons/back-button.svg" alt="" aria-hidden="true" width={40} height={40} className="h-10 w-10" />
          </button>
          <div className="flex min-w-0 flex-1 items-center justify-center pr-10">
            <h1 className="text-center text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-[#457941]">Add plant manually</h1>
          </div>
        </header>

        <div className="flex-1 px-4 pt-[104px] pb-[120px] sm:px-6">
          <div className="mx-auto flex w-full flex-col gap-6">
            <div>
              <p className="text-[14px] font-semibold leading-5 text-[#333333]">Add a photo</p>
              {photoDataUrls.length === 0 ? (
                <button
                  type="button"
                  onClick={handleChoosePhoto}
                  className="mt-2 flex w-full flex-col items-center justify-center gap-4 rounded-[8px] border border-dashed border-black/10 bg-white/10 p-6"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#31674c] text-white text-[24px] leading-none">+</span>
                  <span className="text-center">
                    <span className="block text-[16px] font-medium leading-6 text-[#182a17]">Add a photo</span>
                    <span className="block text-[12px] leading-4 text-[#333333cc]">Take or choose a photo to share.</span>
                  </span>
                </button>
              ) : (
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={handleChoosePhoto}
                    className="aspect-square flex w-full flex-col items-center justify-center gap-4 rounded-[8px] border border-dashed border-[#d4d4d4] bg-white/10 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#31674c] text-white text-[24px] leading-none">+</span>
                    <span className="text-center">
                      <span className="block text-[32px]"></span>
                      <span className="block text-[16px] font-medium leading-6 text-[#182a17]">Add a photo</span>
                      <span className="block text-[12px] leading-4 text-[#333333cc]">Take or choose a photo to share.</span>
                    </span>
                  </button>
                  {photoDataUrls.map((photoUrl, index) => (
                    <div key={`manual-photo-${index}`} className="relative aspect-square overflow-hidden rounded-[8px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                      <img src={photoUrl} alt={`Added plant ${index + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        aria-label={`Remove photo ${index + 1}`}
                        onClick={() => removePhotoAt(index)}
                        className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoChange} className="hidden" />
            </div>

            <div>
              <p className="text-[14px] font-semibold leading-5 text-[#333333]">Search for a plant</p>
              <button
                type="button"
                onClick={() => {
                  if (continueWithoutSelecting) return;
                  setIsPlantDrawerOpen(true);
                }}
                disabled={continueWithoutSelecting}
                className="mt-2 flex h-[40px] w-full items-center justify-center gap-2 rounded-[100px] bg-[#171717] px-6 text-white disabled:opacity-50"
              >
                <Image src="/icons/left-icon-15.svg" alt="" aria-hidden="true" width={16} height={16} className="h-4 w-4" />
                <span className="text-[14px] font-medium leading-5">Select a plant</span>
              </button>
              <label className="mt-3 inline-flex items-center gap-2 text-[14px] font-medium leading-5 text-[#333333]">
                <input
                  type="checkbox"
                  checked={continueWithoutSelecting}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setContinueWithoutSelecting(checked);
                    if (checked) {
                      setSelectedPlantName("");
                      setSelectedPlantId(null);
                      setSelectedPlantSpecies("");
                      setSelectedPlantImageUrl("");
                      setPendingPlantId(null);
                      setIsPlantDrawerOpen(false);
                    }
                  }}
                  className="h-4 w-4 rounded-[4px] border border-black/10 bg-white"
                />
                Can&apos;t find your plant? Continue without selecting.
              </label>
              {selectedPlantId ? (
                <div className="mt-3 flex items-center justify-between gap-3 rounded-[10px] border border-black/10 bg-white px-3 py-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-[6px] bg-[#d9d9d9]">
                      <img src={selectedPlantImageUrl || "/images/figma/placeholder-expired.png"} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-normal leading-5 text-[#111827]">{selectedPlantName}</p>
                      <p className="truncate text-[12px] font-normal leading-5 text-[#6b7280]">{selectedPlantSpecies || "Unidentified"}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Remove selected plant"
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#404040]"
                    onClick={() => {
                      setSelectedPlantId(null);
                      setSelectedPlantName("");
                      setSelectedPlantSpecies("");
                      setSelectedPlantImageUrl("");
                      setPendingPlantId(null);
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : null}
            </div>

            <div>
              <p className="text-[14px] font-semibold leading-5 text-[#333333]">Give your plant a name (optional)</p>
              <input
                type="text"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="e.g. Living room plant"
                className="mt-2 h-[48px] w-full rounded-[8px] border border-black/10 bg-white px-4 py-3 text-[14px] leading-5 text-[#333333] placeholder:text-[#737373]"
              />
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-40 w-full bg-[#f8f6f1] px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-4 sm:px-6">
          <button
            type="button"
            onClick={() => {
              void handleContinue();
            }}
            disabled={!canContinue || isSubmitting}
            className="mx-auto block h-[52px] w-full rounded-[1000px] bg-[#457941] text-[14px] font-medium leading-5 text-[#fafafa] disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Continue"}
          </button>
          {error ? <p className="mt-2 text-center text-[12px] font-medium text-[#b91c1c]">{error}</p> : null}
        </div>

        {isPlantDrawerVisible ? (
          <div className="fixed inset-0 z-40 flex items-end">
            <button type="button" aria-label="Close plant drawer" onClick={() => setIsPlantDrawerOpen(false)} className="absolute inset-0 bg-[rgba(23,23,23,0.5)]" />
            <section
              className={`relative z-10 w-full rounded-t-[24px] border border-[rgba(212,212,212,0.5)] bg-[#f8f6f1] px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-6 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] transition-transform duration-300 ${
                isPlantDrawerOpen ? "translate-y-0" : "translate-y-full"
              }`}
            >
              <div className="mx-auto mb-6 h-[3px] w-20 rounded-[2px] bg-[rgba(0,0,0,0.1)]" />
              <h2 className="text-center text-[20px] font-semibold leading-6 text-[#182a17]">Select plant</h2>

              <div className="mt-6 rounded-full border border-black/5 bg-white px-3 py-2">
                <div className="flex min-h-[32px] items-center gap-3 rounded-lg px-2">
                  <input
                    type="text"
                    value={plantSearch}
                    onChange={(event) => setPlantSearch(event.target.value)}
                    placeholder="Search for a specific plant"
                    className="w-full bg-transparent text-[14px] font-normal leading-5 text-[#333333] placeholder:text-[#33333380] outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 max-h-[min(44vh,370px)] overflow-y-auto border-y border-black/10 bg-[#f8f6f1] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {filteredPlants.map((plant, idx) => {
                  const isSelected = pendingPlantId === plant.id;
                  return (
                    <button
                      key={plant.id}
                      type="button"
                      onClick={() => setPendingPlantId(plant.id)}
                      className={`flex w-full items-center gap-4 px-3 py-3 text-left ${idx < filteredPlants.length - 1 ? "border-b border-black/10" : ""}`}
                    >
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[6px] bg-[#d9d9d9]">
                        <img src={plant.imageUrl} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-medium leading-5 text-[#333333]">{plant.name}</p>
                        <p className="truncate text-[12px] leading-4 text-[#333333cc]">{plant.species}</p>
                      </div>
                      <span
                        aria-hidden="true"
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${isSelected ? "border-[#2f6b3a] bg-[#457941]" : "border-black/10 bg-[#f2f2f2]"}`}
                      >
                        {isSelected ? (
                          <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3 w-3 text-white">
                            <path d="M5 10.2L8.2 13.4L15 6.6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
                {filteredPlants.length === 0 ? (
                  <div className="px-3 py-6 text-center text-[12px] font-medium text-[#737373]">No plants found.</div>
                ) : null}
              </div>

              <button
                type="button"
                disabled={pendingPlantId == null}
                onClick={handleAttachPlant}
                className={`mt-6 h-[52px] w-full rounded-full text-[14px] font-medium leading-5 text-[#fafafa] ${pendingPlantId == null ? "bg-[#457941] opacity-50" : "bg-[#457941]"}`}
              >
                Select plant
              </button>
            </section>
          </div>
        ) : null}
      </section>
    </main>
  );
}
