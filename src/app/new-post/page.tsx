"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

export default function NewPostPage() {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = sessionStorage.getItem("ggDraftPostPhotos");
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return;
      const valid = parsed.filter((value): value is string => typeof value === "string");
      setPhotoUrls(valid.slice(0, MAX_PHOTOS));
    } catch {
      setPhotoUrls([]);
    }
  }, []);

  const handlePost = async () => {
    if (!photoUrls.length || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          note,
          photos: photoUrls,
        }),
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setSubmitError(result.error ?? "Unable to create post.");
        return;
      }

      sessionStorage.removeItem("ggDraftPostPhotos");
      sessionStorage.removeItem("ggCapturedPhoto");
      router.push("/feed");
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
        sessionStorage.setItem("ggDraftPostPhotos", JSON.stringify(next));
      }
      return next;
    });
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fffdf7_0%,_#f8f6f1_50%,_#efe9dc_100%)] px-0 text-[#182a17] sm:grid sm:place-items-center sm:px-8">
      <section className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col overflow-hidden border border-[#e7e0d2] bg-[#f8f6f1] shadow-[0_24px_80px_rgba(56,71,45,0.12)]">
        <header className="flex items-center border-b border-black/10 bg-white p-4">
          <Link
            href="/feed"
            aria-label="Back"
            className="inline-flex h-10 w-10 items-center justify-center transition"
          >
            <Image src="/icons/back-button.svg" alt="" aria-hidden="true" width={40} height={40} className="h-10 w-10" />
          </Link>
          <h1 className="flex-1 pr-10 text-center text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-[#457941]">
            New post
          </h1>
        </header>

        <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-4 pt-8">
          <div className="space-y-6 pb-4">
            <div className="space-y-2">
              <p className="text-[14px] font-semibold leading-5 text-[#333333]">Add a photo</p>
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}
              >
                {photoUrls.length < MAX_PHOTOS ? (
                  <Link
                    href="/new-post/camera"
                    className="flex w-full flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-[#d4d4d4] bg-white/10 px-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                    style={{ aspectRatio: "1 / 1" }}
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
            {isSubmitting ? "Posting..." : "Post"}
          </button>
          {submitError ? <p className="mt-2 text-[12px] leading-4 text-[#ef4444]">{submitError}</p> : null}
        </div>
      </section>
    </main>
  );
}

