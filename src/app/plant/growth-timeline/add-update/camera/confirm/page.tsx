"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const backgroundImage = "/images/figma/placeholder-expired.png";

function CircleButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f5f5] text-[#333333]"
    >
      {children}
    </button>
  );
}

function AddUpdatePhotoConfirmPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plantId = searchParams.get("plantId");
  const [flashOn, setFlashOn] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("ggPlantUpdatePhoto");
    if (stored) setSelectedImage(stored);
  }, []);

  return (
    <main className="client-main min-h-screen bg-[radial-gradient(circle_at_top,_#fffdf7_0%,_#f8f6f1_50%,_#efe9dc_100%)] px-0 sm:grid sm:place-items-center sm:px-8">
      <section className="client-shell relative mx-auto flex min-h-screen w-full max-w-[390px] flex-col overflow-hidden border border-[#e7e0d2] bg-[#f8f6f1] shadow-[0_24px_80px_rgba(56,71,45,0.12)]">
        <header className="client-header fixed left-0 right-0 top-0 z-30 flex w-full items-center justify-between border-b border-black/10 bg-white p-4">
          <CircleButton label="Close camera" onClick={() => router.back()}>
            <Image src="/icons/back-button.svg" alt="" aria-hidden="true" width={40} height={40} className="h-10 w-10" />
          </CircleButton>
          <div className="flex items-center gap-4">
            <CircleButton label={flashOn ? "Flash on" : "Flash off"} onClick={() => setFlashOn((current) => !current)}>
              <Image src="/icons/flash-off.svg" alt="" aria-hidden="true" width={24} height={24} className="h-6 w-6" />
            </CircleButton>
            <CircleButton label="Switch camera" onClick={() => {}}>
              <Image src="/icons/toggle-camera.svg" alt="" aria-hidden="true" width={24} height={24} className="h-6 w-6" />
            </CircleButton>
          </div>
        </header>

        <div className="relative flex-1 bg-black pt-[72px]">
          <img src={backgroundImage} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
          {selectedImage ? <img src={selectedImage} alt="Selected plant update" className="absolute inset-0 h-full w-full object-cover" /> : null}
        </div>

        <footer className="relative z-10 h-24 border-t border-[#e5e5e5] bg-white px-4 py-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
          <button
            type="button"
            onClick={() => router.push(`/plant/growth-timeline/add-update${plantId ? `?plantId=${plantId}` : ""}`)}
            className="h-[52px] w-full rounded-[1000px] bg-[#457941] text-[14px] font-medium leading-5 tracking-[0px] text-[#fafafa]"
          >
            Continue
          </button>
        </footer>
      </section>
    </main>
  );
}

export default function AddUpdatePhotoConfirmPage() {
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
      <AddUpdatePhotoConfirmPageContent />
    </Suspense>
  );
}
