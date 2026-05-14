"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const closeIcon = "/icons/new-plant/x.svg";
const moreIcon = "/icons/new-plant/ellipsis-vertical.svg";
const leafIcon = "/icons/logs/leaf.svg";
const rightIcon = "/icons/my-garden-chevron-right.svg";
const sunIcon = "/icons/new-plant/sun.svg";
const dropletIcon = "/icons/new-plant/droplet.svg";
const thermoIcon = "/icons/new-plant/thermometer.svg";
const cloudyIcon = "/icons/new-plant/cloudy.svg";
const chevronUpIcon = "/icons/new-plant/chevron-up.svg";
const chevronDownIcon = "/icons/new-plant/chevron-down.svg";

function DetailTile({ label, value, icon, tone }: { label: string; value: string; icon: string; tone: "yellow" | "blue" | "orange" | "teal" }) {
  const toneClass =
    tone === "yellow"
      ? "bg-[rgba(212,167,44,0.1)] text-[#d4a72c]"
      : tone === "blue"
        ? "bg-[rgba(47,128,197,0.1)] text-[#2f80c5]"
        : tone === "orange"
          ? "bg-[rgba(224,107,79,0.1)] text-[#e06b4f]"
          : "bg-[rgba(95,168,154,0.1)] text-[#5fa89a]";
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[8px] bg-white p-3">
      <div className={`rounded-[6px] p-2 ${toneClass}`}>
        <img src={icon} alt="" aria-hidden="true" className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p className={`text-[14px] font-medium leading-5 ${toneClass.split(" ")[1]}`}>{label}</p>
        <p className="text-[14px] font-medium leading-5 text-[#333333]">{value}</p>
      </div>
    </div>
  );
}

export default function PlantByIdPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const plantId = params?.id;
  const [plant, setPlant] = useState<any>(null);
  const [error, setError] = useState("");
  const [isPlantLoading, setIsPlantLoading] = useState(true);
  const [openAccordion, setOpenAccordion] = useState<string>("Watering & Moisture");
  const [isActionsDrawerMounted, setIsActionsDrawerMounted] = useState(false);
  const [isActionsDrawerVisible, setIsActionsDrawerVisible] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingPlant, setIsDeletingPlant] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!plantId) return;
      setIsPlantLoading(true);
      try {
        const cachedRaw = sessionStorage.getItem(`ggPlantDetailCache:${plantId}`);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw) as { plant?: any };
          if (!cancelled && cached?.plant) {
            setPlant(cached.plant);
            const firstTitle = cached.plant?.careSections?.[0]?.title;
            if (firstTitle) setOpenAccordion(firstTitle);
            setIsPlantLoading(false);
          }
        }
      } catch {
        // Ignore cache parse issues.
      }

      const response = await fetch(`/api/plants/${plantId}`);
      if (!response.ok) {
        if (!cancelled) {
          setError("Unable to load plant.");
          setIsPlantLoading(false);
        }
        return;
      }
      const payload = (await response.json()) as { plant?: any };
      if (!cancelled) {
        setPlant(payload.plant ?? null);
        const firstTitle = payload.plant?.careSections?.[0]?.title;
        if (firstTitle) setOpenAccordion(firstTitle);
        setIsPlantLoading(false);
        try {
          sessionStorage.setItem(`ggPlantDetailCache:${plantId}`, JSON.stringify({ plant: payload.plant ?? null }));
        } catch {
          // Ignore cache write failures.
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [plantId]);

  useEffect(() => {
    if (!plantId) return;
    try {
      sessionStorage.setItem("ggCurrentPlantId", plantId);
    } catch {
      // Ignore storage write failures.
    }
  }, [plantId]);

  const heroImage = useMemo(() => plant?.photos?.[0]?.photo_url ?? "/images/figma/placeholder-expired.png", [plant]);

  const careProfile = plant?.careProfile ?? {};
  const sections = Array.isArray(plant?.careSections) ? plant.careSections : [];
  const description = plant?.description || "No care description added yet.";

  const openActionsDrawer = () => {
    if (isActionsDrawerMounted) return;
    setIsActionsDrawerMounted(true);
    requestAnimationFrame(() => setIsActionsDrawerVisible(true));
  };

  const closeActionsDrawer = () => {
    setIsActionsDrawerVisible(false);
    setTimeout(() => setIsActionsDrawerMounted(false), 300);
  };

  const handleDeletePlant = async () => {
    if (!plantId || isDeletingPlant) return;
    setIsDeletingPlant(true);
    setError("");
    try {
      const response = await fetch(`/api/plants/${plantId}`, { method: "DELETE" });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "Unable to delete plant.");
        return;
      }
      setIsDeleteDialogOpen(false);
      closeActionsDrawer();
      router.push("/my-garden");
    } catch {
      setError("Unable to delete plant.");
    } finally {
      setIsDeletingPlant(false);
    }
  };

  useEffect(() => {
    if (!isActionsDrawerMounted) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isActionsDrawerMounted]);

  return (
    <main className="client-main min-h-screen bg-[#f8f6f1] px-0 sm:grid sm:place-items-center sm:px-8">
      <section className="client-shell relative mx-auto flex min-h-screen w-full max-w-[390px] flex-col overflow-hidden border border-[#e7e0d2] bg-[#f8f6f1]">
        <div className="relative h-[357px] w-full overflow-hidden">
          <img src={heroImage} alt={plant?.commonName ?? "Plant"} className="h-full w-full object-cover" />
          <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-4">
            <button type="button" onClick={() => router.push("/my-garden")} className="flex min-h-10 min-w-10 items-center justify-center rounded-full border-[1.111px] border-[rgba(146,146,146,0.24)] bg-white p-[8.889px]">
              <img src={closeIcon} alt="" aria-hidden="true" className="h-6 w-6" />
            </button>
            <button
              type="button"
              aria-label="More actions"
              onClick={openActionsDrawer}
              className="flex min-h-10 min-w-10 items-center justify-center rounded-full border border-black/10 bg-white p-[8.889px]"
            >
              <img src={moreIcon} alt="" aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>
        </div>
        <div className="px-4 pb-[104px] pt-6">
          <h1 className="text-[30px] font-semibold leading-[30px] tracking-[-1px] text-[#182a17]">{plant?.commonName ?? "Plant"}</h1>
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-full bg-[#f0fdf4] p-1.5"><img src={leafIcon} alt="" aria-hidden="true" className="h-4 w-4" /></span>
            <p className="text-[16px] font-medium leading-6 text-[#333333cc]">{plant?.scientificName ?? "Unknown species"}</p>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            <button type="button" onClick={() => router.push(`/plant/growth-timeline?plantId=${plantId}&returnTo=/plant/${plantId}`)} className="flex min-h-10 items-center justify-between rounded-[100px] border border-black/10 bg-white py-4 pl-6 pr-4 text-[14px] font-medium leading-5 text-[#333333]">
              View growth timeline
              <img src={rightIcon} alt="" aria-hidden="true" className="h-6 w-6" />
            </button>
            <button type="button" className="flex min-h-10 items-center justify-between rounded-[100px] border border-black/10 bg-white py-4 pl-6 pr-4 text-left">
              <span>
                <span className="block text-[14px] font-medium leading-5 text-[#333333]">Ask Grow Mate</span>
                <span className="block text-[12px] font-medium leading-4 text-[#333333cc]">Get personalized care tips for this plant.</span>
              </span>
              <img src={rightIcon} alt="" aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>
          <div className="mt-8 space-y-2">
            <div className="flex gap-2">
              <DetailTile label="Light" value={careProfile.light_level ?? "Unknown"} icon={sunIcon} tone="yellow" />
              <DetailTile label="Water" value={typeof careProfile.watering_interval_days === "number" ? `Every ${careProfile.watering_interval_days} days` : "Unknown"} icon={dropletIcon} tone="blue" />
            </div>
            <div className="flex gap-2">
              <DetailTile label="Temperature" value={typeof careProfile.temperature_min_c === "number" && typeof careProfile.temperature_max_c === "number" ? `${careProfile.temperature_min_c} deg - ${careProfile.temperature_max_c} deg` : "Unknown"} icon={thermoIcon} tone="orange" />
              <DetailTile label="Humidity" value={typeof careProfile.humidity_percent === "number" ? `${careProfile.humidity_percent}%` : "Unknown"} icon={cloudyIcon} tone="teal" />
            </div>
          </div>
          <div className="mt-8">
            <p className="text-[14px] font-medium leading-5 text-[#333333]">Description and Care Details</p>
            <p className="mt-2 text-[14px] font-medium leading-5 text-[#333333cc]">{description}</p>
          </div>
          <div className="mt-8 bg-[#f8f6f1]">
            {sections.map((section: any) => (
              <div key={section.section_key} className="border-t border-black/10">
                <button type="button" onClick={() => setOpenAccordion((current) => (current === section.title ? "" : section.title))} className="flex w-full items-center justify-between py-4 text-left">
                  <p className="text-[14px] font-medium leading-5 text-[#333333]">{section.title}</p>
                  <img src={openAccordion === section.title ? chevronUpIcon : chevronDownIcon} alt="" aria-hidden="true" className="h-4 w-4" />
                </button>
                {openAccordion === section.title ? <div className="pb-4"><p className="text-[14px] font-medium leading-5 text-[#333333cc]">{section.content}</p></div> : null}
              </div>
            ))}
            {!sections.length ? <p className="pt-4 text-[14px] font-medium leading-5 text-[#333333cc]">No care sections yet.</p> : null}
          </div>
          {isPlantLoading ? <p className="mt-4 text-[12px] font-medium text-[#737373]">Loading plant details...</p> : null}
          {error ? <p className="mt-4 text-[12px] font-medium text-[#b91c1c]">{error}</p> : null}
        </div>
        {isActionsDrawerMounted ? (
          <div className="fixed inset-0 z-50">
            <button
              type="button"
              aria-label="Close actions drawer"
              onClick={closeActionsDrawer}
              className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isActionsDrawerVisible ? "opacity-100" : "opacity-0"}`}
            />
            <section
              className={`absolute bottom-0 left-0 right-0 rounded-t-[24px] border border-[rgba(212,212,212,0.5)] bg-[#f8f6f1] px-4 pb-5 pt-6 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] transition-transform duration-300 ${isActionsDrawerVisible ? "translate-y-0" : "translate-y-full"}`}
            >
              <div className="mx-auto mb-8 h-[3px] w-20 rounded-[2px] bg-[rgba(0,0,0,0.1)]" />
              <div className="mb-8 space-y-4 text-center">
                <p className="text-[32px] font-semibold leading-6 tracking-[-1px] text-[#182a17]">Wrong plant?</p>
                <p className="text-[14px] font-medium leading-5 text-[#333333cc]">Try taking another photo for a more accurate result.</p>
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    closeActionsDrawer();
                    try {
                      if (plantId) {
                        sessionStorage.setItem("ggRetakePlantId", String(plantId));
                      }
                    } catch {
                      // Ignore session storage failures.
                    }
                    router.push("/my-garden/add-plant");
                  }}
                  className="h-[52px] w-full rounded-[1000px] bg-[#457941] px-6 text-[14px] font-medium leading-5 text-white"
                >
                  Retake photo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteDialogOpen(true);
                  }}
                  className="h-[52px] w-full rounded-[1000px] bg-[#dc2626] px-6 text-[14px] font-medium leading-5 text-white"
                >
                  Delete plant
                </button>
                <button type="button" onClick={closeActionsDrawer} className="h-[52px] w-full rounded-[100px] bg-white px-6 text-[14px] font-medium leading-5 text-[#333333]">
                  Cancel
                </button>
              </div>
            </section>
            {isDeleteDialogOpen ? (
              <div className="absolute inset-0 z-[60] flex items-center justify-center px-4">
                <button type="button" aria-label="Close delete confirmation" className="absolute inset-0 bg-black/40" onClick={() => setIsDeleteDialogOpen(false)} />
                <section className="relative w-full max-w-[358px] rounded-[12px] border border-[#e5e5e5] bg-[#f8f6f1] p-8 text-center shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]">
                  <div className="space-y-4">
                    <p className="text-[32px] font-semibold leading-6 tracking-[-1px] text-[#182a17]">Delete plant?</p>
                    <p className="text-[14px] font-medium leading-5 text-[#333333cc]">This action cannot be undone.</p>
                  </div>
                  <div className="mt-8 space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        void handleDeletePlant();
                      }}
                      disabled={isDeletingPlant}
                      className="min-h-9 w-full rounded-[100px] bg-[#ef4444] px-4 py-2 text-[14px] font-medium leading-5 text-white disabled:opacity-60"
                    >
                      {isDeletingPlant ? "Deleting..." : "Delete"}
                    </button>
                    <button type="button" onClick={() => setIsDeleteDialogOpen(false)} className="min-h-9 w-full rounded-[100px] bg-white px-4 py-2 text-[14px] font-medium leading-5 text-[#0a0a0a]">
                      Cancel
                    </button>
                  </div>
                </section>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </main>
  );
}
