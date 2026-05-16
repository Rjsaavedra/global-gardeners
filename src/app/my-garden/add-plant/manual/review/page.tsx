"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PlantDetailsContent } from "@/components/plant/PlantDetailsContent";

type Draft = {
  photos: string[];
  nickname: string;
  continueWithoutSelecting: boolean;
  selectedPlantId: number | null;
  selectedPlantName: string;
};

type PlantDetails = {
  id: number;
  commonName: string;
  scientificName: string | null;
  description: string | null;
  careProfile: {
    light_level: string | null;
    watering_interval_days: number | null;
    temperature_min_c: number | null;
    temperature_max_c: number | null;
    humidity_percent: number | null;
  } | null;
  photos?: Array<{ photo_url: string; sort_order: number | null }>;
  careSections: Array<{ section_key: string; title: string; content: string; sort_order: number }>;
};

export default function AddPlantManualReviewPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [sourcePlant, setSourcePlant] = useState<PlantDetails | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem("ggManualAddDraft");
    if (!raw) {
      router.replace("/my-garden/add-plant/manual");
      return;
    }
    try {
      const parsed = JSON.parse(raw) as Draft;
      if (!Array.isArray(parsed.photos)) {
        router.replace("/my-garden/add-plant/manual");
        return;
      }
      setDraft(parsed);
    } catch {
      router.replace("/my-garden/add-plant/manual");
    }
  }, [router]);

  useEffect(() => {
    const run = async () => {
      if (!draft || draft.continueWithoutSelecting || !draft.selectedPlantId) return;
      try {
        const response = await fetch(`/api/plants/${draft.selectedPlantId}`);
        if (!response.ok) return;
        const payload = (await response.json()) as {
          plant?: {
            id: number;
            commonName: string;
            scientificName: string | null;
            description: string | null;
            careProfile: PlantDetails["careProfile"];
            photos?: Array<{ photo_url: string; sort_order: number | null }>;
            careSections: PlantDetails["careSections"];
          };
        };
        if (!payload.plant) return;
        setSourcePlant(payload.plant);
      } catch {
        // keep fallback
      }
    };
    void run();
  }, [draft]);

  const isIdentified = useMemo(() => Boolean(draft && !draft.continueWithoutSelecting && draft.selectedPlantId), [draft]);

  const handleFinalSave = async () => {
    if (!draft || isSaving) return;
    setIsSaving(true);
    setError("");
    const commonName = draft.nickname.trim() || sourcePlant?.commonName || draft.selectedPlantName || "Unnamed plant";
    const scientificName = isIdentified ? sourcePlant?.scientificName || null : null;
    const description = isIdentified
      ? sourcePlant?.description || "Plant added manually and matched from your plant database."
      : "Unidentified plant added manually.";
    const careSections = isIdentified
      ? (sourcePlant?.careSections || []).map((section, index) => ({
          sectionKey: section.section_key,
          title: section.title,
          content: section.content,
          sortOrder: typeof section.sort_order === "number" ? section.sort_order : index,
        }))
      : [];

    try {
      const response = await fetch("/api/plants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commonName,
          scientificName,
          description,
          photos: draft.photos,
          lightLevel: sourcePlant?.careProfile?.light_level ?? null,
          wateringIntervalDays: sourcePlant?.careProfile?.watering_interval_days ?? null,
          temperatureMinC: sourcePlant?.careProfile?.temperature_min_c ?? null,
          temperatureMaxC: sourcePlant?.careProfile?.temperature_max_c ?? null,
          humidityPercent: sourcePlant?.careProfile?.humidity_percent ?? null,
          careSections,
        }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Unable to save plant.");
        return;
      }
      sessionStorage.removeItem("ggManualAddDraft");
      router.push("/my-garden");
    } catch {
      setError("Unable to save plant.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!draft) return null;
  const heroImage = draft.photos[0] || sourcePlant?.photos?.[0]?.photo_url || "/images/figma/placeholder-expired.png";

  return (
    <main className="client-main min-h-screen bg-[#f8f6f1] px-0 sm:grid sm:place-items-center sm:px-8">
      <section className="client-shell relative mx-auto flex min-h-screen w-full max-w-[390px] flex-col overflow-hidden border border-[#e7e0d2] bg-[#f8f6f1]">
        <div className="relative h-[357px] w-full overflow-hidden">
          <img src={heroImage} alt="Selected plant" className="h-full w-full object-cover" />
          <div className="absolute left-4 top-4 z-20">
            <button type="button" aria-label="Close" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white" onClick={() => router.back()}>
              <Image src="/icons/my-garden-x.svg" alt="" aria-hidden="true" width={24} height={24} className="h-6 w-6" />
            </button>
          </div>
        </div>
        <div className="px-4 pb-[120px] pt-6">
          <div className="flex flex-col gap-8">
            <div>
              <p className="text-[30px] font-semibold leading-[30px] tracking-[-1px] text-[#182a17]">{draft.nickname.trim() || sourcePlant?.commonName || draft.selectedPlantName || "Unnamed plant"}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f0fdf4]">
                  <Image src="/icons/logs/leaf.svg" alt="" aria-hidden="true" width={16} height={16} className="h-4 w-4" />
                </span>
                <p className="text-[16px] font-medium leading-6 tracking-[0px] text-[#333333cc]">{isIdentified ? sourcePlant?.scientificName || "Scientific name unavailable" : "Unidentified plant"}</p>
              </div>
            </div>

            {!isIdentified ? (
              <div className="flex flex-col gap-3">
                <button type="button" disabled className="flex min-h-10 w-full items-center justify-between rounded-full border border-black/10 bg-white py-4 pl-6 pr-4 text-left opacity-60">
                  <span className="text-[14px] font-medium leading-5 text-[#333333]">View growth timeline</span>
                  <Image src="/icons/my-garden-chevron-right.svg" alt="" aria-hidden="true" width={24} height={24} className="h-6 w-6" />
                </button>
                <button type="button" disabled className="flex min-h-10 w-full items-center justify-between rounded-full border border-black/10 bg-white py-4 pl-6 pr-4 text-left opacity-60">
                  <span>
                    <span className="block text-[14px] font-medium leading-5 text-[#333333]">Ask Grow Mate</span>
                    <span className="block text-[12px] leading-4 text-[#333333cc]">Get personalized care tips for this plant.</span>
                  </span>
                  <Image src="/icons/my-garden-chevron-right.svg" alt="" aria-hidden="true" width={24} height={24} className="h-6 w-6" />
                </button>
              </div>
            ) : null}

            {isIdentified ? (
              <PlantDetailsContent
                lightValue={sourcePlant?.careProfile?.light_level || "Medium Light"}
                waterValue={typeof sourcePlant?.careProfile?.watering_interval_days === "number" ? `Every ${sourcePlant.careProfile.watering_interval_days} days` : "Average"}
                temperatureValue={
                  typeof sourcePlant?.careProfile?.temperature_min_c === "number" && typeof sourcePlant?.careProfile?.temperature_max_c === "number"
                    ? `${sourcePlant.careProfile.temperature_min_c} - ${sourcePlant.careProfile.temperature_max_c}`
                    : "18 - 24"
                }
                humidityValue={typeof sourcePlant?.careProfile?.humidity_percent === "number" ? `${sourcePlant.careProfile.humidity_percent}%` : "70%"}
                description={sourcePlant?.description?.trim() || "Plant details will be available after adding this plant."}
                careSections={(sourcePlant?.careSections || []).map((section) => ({ title: section.title, content: section.content }))}
                disableActions
              />
            ) : null}
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 z-40 w-full bg-[#f8f6f1] px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-4 sm:px-6">
          <button
            type="button"
            onClick={() => {
              void handleFinalSave();
            }}
            disabled={isSaving}
            className="mx-auto block h-[52px] w-full rounded-[1000px] bg-[#457941] text-[14px] font-medium leading-5 text-[#fafafa] disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Add To My Garden"}
          </button>
          {error ? <p className="mt-2 text-center text-[12px] font-medium text-[#b91c1c]">{error}</p> : null}
        </div>
      </section>
    </main>
  );
}
