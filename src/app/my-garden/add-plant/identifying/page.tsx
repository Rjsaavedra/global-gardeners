"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import loaderAnimation from "../../../../../public/lottie/green-circle-loader.json";

type IdentifyResponse = {
  candidates: Array<{
    commonName: string;
    scientificName: string;
    confidence: number;
    sources: string[];
  }>;
  consensusStatus: "confirmed" | "needs_review" | "no_match";
};

export default function IdentifyLoadingPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const imageDataUrl = sessionStorage.getItem("ggPlantIdentifyPhoto")?.trim();
      if (!imageDataUrl) {
        if (!cancelled) router.replace("/my-garden/add-plant");
        return;
      }

      try {
        const response = await fetch("/api/plant-identify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageDataUrl }),
        });

        const payload = (await response.json().catch(() => null)) as IdentifyResponse | { error?: string } | null;

        if (!response.ok || !payload || !("candidates" in payload)) {
          const message = payload && "error" in payload && payload.error ? payload.error : "Unable to identify this plant right now.";
          throw new Error(message);
        }

        sessionStorage.setItem("ggPlantIdentifyResult", JSON.stringify(payload));

        if (!cancelled) {
          if (!payload.candidates.length || payload.consensusStatus === "no_match") {
            router.replace("/my-garden/add-plant/results?state=empty");
          } else {
            router.replace("/my-garden/add-plant/results");
          }
        }
      } catch (error) {
        if (cancelled) return;
        setErrorMessage(error instanceof Error ? error.message : "Unable to identify this plant right now.");
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="client-main min-h-screen bg-[#f8f6f1] px-0 sm:grid sm:place-items-center sm:px-8">
      <section className="client-shell relative mx-auto flex min-h-screen w-full flex-col overflow-hidden border border-[#e7e0d2] bg-[#f8f6f1]">
        <div className="absolute left-1/2 top-[calc(50%-69px)] flex w-[358px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-10">
          <div className="relative h-[120px] w-[120px] overflow-hidden">
            <Lottie animationData={loaderAnimation} autoplay loop />
          </div>
          <div className="flex h-[66px] w-full flex-col items-center gap-2">
            <p className="w-full text-center text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-[#182a17]">
              Finding possible matches
            </p>
            <p className="w-[268px] text-center text-[16px] font-medium leading-6 text-[#333333cc]">This may take a few seconds.</p>
            {errorMessage ? <p className="w-[268px] text-center text-[12px] font-medium leading-4 text-[#b91c1c]">{errorMessage}</p> : null}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-40 w-full bg-[#f8f6f1] px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-4">
          <button
            type="button"
            onClick={() => router.push("/my-garden/add-plant")}
            className="h-[52px] w-full rounded-[100px] bg-[#457941] text-center text-[14px] font-medium leading-5 text-[#fafafa]"
          >
            Cancel
          </button>
        </div>
      </section>
    </main>
  );
}
