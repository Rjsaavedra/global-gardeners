"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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

function HelpIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9.8 9.4C10.05 8.33 10.95 7.6 12.12 7.6C13.47 7.6 14.4 8.47 14.4 9.66C14.4 10.54 13.97 11.1 13.08 11.67C12.25 12.2 11.96 12.64 11.96 13.6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
      <circle cx="12" cy="16.8" r="0.9" fill="currentColor" />
    </svg>
  );
}

export default function AddPlantPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const startCamera = async () => {
      setCameraReady(false);
      setErrorMessage("");

      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setErrorMessage("Camera is not supported on this device/browser.");
        return;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraReady(true);
        }
      } catch {
        setErrorMessage("Camera permission denied or unavailable.");
      }
    };

    void startCamera();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [facingMode]);

  const identifyWithImage = (imageDataUrl: string) => {
    sessionStorage.setItem("ggPlantIdentifyPhoto", imageDataUrl);
    router.push("/my-garden/add-plant/identifying");
  };

  const handleGallerySelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setSelectedImage(reader.result);
        setErrorMessage("");
      }
    };
    reader.onerror = () => setErrorMessage("Unable to load selected image.");
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleIdentifyPlant = () => {
    if (selectedImage) {
      identifyWithImage(selectedImage);
      return;
    }

    const video = videoRef.current;
    if (!video || !cameraReady) {
      setErrorMessage("Camera is not ready yet.");
      return;
    }

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) {
      setErrorMessage("Unable to capture photo.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      setErrorMessage("Unable to capture photo.");
      return;
    }

    context.drawImage(video, 0, 0, width, height);
    identifyWithImage(canvas.toDataURL("image/jpeg", 0.92));
  };

  return (
    <main className="client-main min-h-screen bg-[radial-gradient(circle_at_top,_#fffdf7_0%,_#f8f6f1_50%,_#efe9dc_100%)] px-0 sm:grid sm:place-items-center sm:px-8">
      <section className="client-shell relative mx-auto flex min-h-screen w-full max-w-[390px] flex-col overflow-hidden border border-[#e7e0d2] bg-[#f8f6f1] shadow-[0_24px_80px_rgba(56,71,45,0.12)]">
        <header className="client-header fixed left-0 right-0 top-0 z-30 flex w-full items-center justify-between border-b border-black/10 bg-white p-4">
          <CircleButton label="Close add plant camera" onClick={() => router.back()}>
            <Image src="/icons/back-button.svg" alt="" aria-hidden="true" width={40} height={40} className="h-10 w-10" />
          </CircleButton>
          <div className="flex items-center gap-4">
            <CircleButton label={flashOn ? "Flash on" : "Flash off"} onClick={() => setFlashOn((current) => !current)}>
              <Image src="/icons/flash-off.svg" alt="" aria-hidden="true" width={24} height={24} className="h-6 w-6" />
            </CircleButton>
            <CircleButton
              label={facingMode === "environment" ? "Switch to front camera" : "Switch to back camera"}
              onClick={() => setFacingMode((current) => (current === "environment" ? "user" : "environment"))}
            >
              <Image src="/icons/toggle-camera.svg" alt="" aria-hidden="true" width={24} height={24} className="h-6 w-6" />
            </CircleButton>
          </div>
        </header>

        <div className="relative flex-1 bg-black pt-[72px]">
          <img src={backgroundImage} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
          {selectedImage ? (
            <img src={selectedImage} alt="Selected plant" className="absolute inset-0 h-full w-full object-cover" />
          ) : null}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`absolute inset-0 block h-full w-full min-h-full min-w-full object-cover transition-opacity duration-300 ${cameraReady && !selectedImage ? "opacity-100" : "opacity-0"}`}
          />
          {!cameraReady && !selectedImage ? (
            <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-[14px] font-medium text-white/90">
              {errorMessage || "Starting camera..."}
            </div>
          ) : null}

          <div className="absolute bottom-[158px] left-1/2 -translate-x-1/2 rounded-lg border border-black/10 bg-white px-4 py-3 text-center text-[14px] font-medium leading-5 text-[#333333] shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
            Make sure the plant is clearly visible.
          </div>
        </div>

        <footer className="relative z-10 h-32 border-t border-[#e5e5e5] bg-white px-4 py-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
          <p className="pb-3 text-center text-[16px] font-medium leading-6 text-[#457941]">Identify plant</p>
          <div className="grid h-[52px] grid-cols-3 items-center">
            <button
              type="button"
              className="justify-self-start rounded-lg px-1 py-1 text-[#333333]"
              onClick={() => galleryInputRef.current?.click()}
            >
              <span className="flex flex-col items-center gap-1 text-[12px] font-medium leading-4">
                <Image src="/icons/gallery.svg" alt="" aria-hidden="true" width={24} height={24} className="h-6 w-6" />
                Gallery
              </span>
            </button>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handleGallerySelect}
              className="hidden"
            />

            <button type="button" aria-label="Identify plant" className="justify-self-center" onClick={handleIdentifyPlant}>
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#457941] ring-4 ring-[#e9efe8]">
                <span className="h-[52px] w-[52px] rounded-full border-[3px] border-[#d7ead9]" />
              </span>
            </button>

            <button type="button" className="justify-self-end rounded-lg px-1 py-1 text-[#333333]">
              <span className="flex flex-col items-center gap-1 text-[12px] font-medium leading-4">
                <HelpIcon />
                How to use
              </span>
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}
