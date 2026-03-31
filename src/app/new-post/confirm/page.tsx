"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const fallbackConfirmationImage =
  "https://www.figma.com/api/mcp/asset/628cc9d2-a1d5-43e3-95e1-197b36610fb1";

export default function PhotoConfirmationPage() {
  const router = useRouter();
  const capturedPhoto =
    typeof window === "undefined"
      ? null
      : sessionStorage.getItem("ggCapturedPhoto");
  const photoSrc = capturedPhoto || fallbackConfirmationImage;

  const handleContinue = () => {
    try {
      if (capturedPhoto) {
        const rawDraftPhotos = sessionStorage.getItem("ggDraftPostPhotos");
        let existing: string[] = [];

        if (rawDraftPhotos) {
          const draftPhotos = JSON.parse(rawDraftPhotos) as unknown;
          if (Array.isArray(draftPhotos)) {
            existing = draftPhotos.filter((value): value is string => typeof value === "string");
          }
        }

        const merged = [...existing, capturedPhoto].slice(0, 5);
        sessionStorage.setItem("ggDraftPostPhotos", JSON.stringify(merged));
      }
    } catch {
      // Keep navigation resilient even if storage data is corrupted.
    } finally {
      router.push("/new-post");
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fffdf7_0%,_#f8f6f1_50%,_#efe9dc_100%)] px-0 sm:grid sm:place-items-center sm:px-8">
      <section className="relative mx-auto flex min-h-screen w-full max-w-[390px] flex-col overflow-hidden border border-[#e7e0d2] bg-white shadow-[0_24px_80px_rgba(56,71,45,0.12)]">
        <header className="relative z-10 flex items-center border-b border-black/10 bg-white p-4">
          <Link
            href="/new-post/camera"
            aria-label="Close confirmation"
            className="inline-flex h-10 w-10 items-center justify-center transition"
          >
            <Image src="/icons/back-button.svg" alt="" aria-hidden="true" width={40} height={40} className="h-10 w-10" />
          </Link>
        </header>

        <div className="relative flex-1 bg-black">
          <Image
            alt="Captured photo"
            className="object-cover"
            fill
            priority
            sizes="(max-width: 390px) 100vw, 390px"
            src={photoSrc}
            unoptimized={photoSrc.startsWith("data:")}
          />
        </div>

        <footer className="h-24 border-t border-[#e5e5e5] bg-white px-4 py-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
          <button
            type="button"
            onClick={() => {
              handleContinue();
            }}
            className="flex h-[52px] w-full items-center justify-center rounded-full bg-[#457941] text-[14px] font-medium leading-5 text-[#fafafa] transition hover:bg-[#3b6838] focus:outline-none focus:ring-2 focus:ring-[#457941] focus:ring-offset-2 focus:ring-offset-white"
          >
            Continue
          </button>
        </footer>
      </section>
    </main>
  );
}

