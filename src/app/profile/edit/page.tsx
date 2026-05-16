"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEventHandler, useEffect, useRef, useState } from "react";
import { mutate } from "swr";

type ProfileMeResponse = {
  fullName: string;
  nickname: string;
  profilePhotoUrl: string | null;
};

type NameCheckResponse = {
  hasConflict: boolean;
  similarNames: string[];
  error?: string;
};

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [removeCurrentPhoto, setRemoveCurrentPhoto] = useState(false);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [similarNames, setSimilarNames] = useState<string[]>([]);
  const [nameCheckError, setNameCheckError] = useState("");
  const [initialFullName, setInitialFullName] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setLoadError("");
      try {
        const response = await fetch("/api/profile/me");
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        if (!response.ok) {
          setLoadError("Unable to load profile.");
          return;
        }
        const result = (await response.json()) as ProfileMeResponse;
        if (cancelled) return;
        setFullName(result.fullName ?? "");
        setInitialFullName(result.fullName ?? "");
        setUsername((result.nickname ?? "").replace(/^@/, ""));
        setProfilePhotoUrl(result.profilePhotoUrl ?? null);
      } catch {
        if (!cancelled) setLoadError("Unable to load profile.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    };
  }, [photoPreviewUrl]);

  useEffect(() => {
    if (isLoading) return;
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setSimilarNames([]);
      setNameCheckError("");
      setIsCheckingName(false);
      return;
    }

    if (trimmedName.toLowerCase() === initialFullName.trim().toLowerCase()) {
      setSimilarNames([]);
      setNameCheckError("");
      setIsCheckingName(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      setIsCheckingName(true);
      setNameCheckError("");
      try {
        const response = await fetch(`/api/profile/name-check?name=${encodeURIComponent(trimmedName)}`);
        if (!response.ok) {
          setNameCheckError("Unable to validate name right now.");
          setSimilarNames([]);
          return;
        }
        const result = (await response.json()) as NameCheckResponse;
        setSimilarNames(Array.isArray(result.similarNames) ? result.similarNames : []);
      } catch {
        setNameCheckError("Unable to validate name right now.");
        setSimilarNames([]);
      } finally {
        setIsCheckingName(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, [fullName, initialFullName, isLoading]);

  const onChoosePhoto = () => {
    fileInputRef.current?.click();
  };

  const onPhotoChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    const preview = URL.createObjectURL(file);
    setRemoveCurrentPhoto(false);
    setSelectedPhotoFile(file);
    setPhotoPreviewUrl(preview);
    setSaveError("");
  };

  const onRemovePhoto = () => {
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
    }
    setPhotoPreviewUrl(null);
    setSelectedPhotoFile(null);
    setProfilePhotoUrl(null);
    setRemoveCurrentPhoto(true);
    setSaveError("");
  };

  const handleSave = async () => {
    if (isSaving) return;
    setSaveError("");
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("fullName", fullName.trim());
      formData.append("username", username.trim());
      if (removeCurrentPhoto) {
        formData.append("removePhoto", "true");
      }
      if (selectedPhotoFile) {
        formData.append("photo", selectedPhotoFile);
      }

      const response = await fetch("/api/profile/me", {
        method: "PATCH",
        body: formData,
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      const result = (await response.json()) as ProfileMeResponse & {
        error?: string;
        similarNames?: unknown;
      };
      if (!response.ok) {
        setSaveError(result.error ?? "Unable to save profile.");
        if (Array.isArray(result.similarNames)) {
          setSimilarNames(result.similarNames.filter((name): name is string => typeof name === "string"));
        } else {
          setSimilarNames([]);
        }
        return;
      }

      setFullName(result.fullName ?? "");
      setUsername((result.nickname ?? "").replace(/^@/, ""));
      setProfilePhotoUrl(result.profilePhotoUrl ?? null);
      setRemoveCurrentPhoto(false);
      setSelectedPhotoFile(null);
      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
        setPhotoPreviewUrl(null);
      }
      // Keep profile screen in sync when navigating back immediately after save.
      await mutate("/api/profile/me", result, false);
      router.push("/profile");
    } catch {
      setSaveError("Unable to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const displayedPhotoUrl = photoPreviewUrl || profilePhotoUrl;
  const hasSimilarNameConflict = similarNames.length > 0;
  const disableSave = isLoading || isSaving || isCheckingName || !fullName.trim() || hasSimilarNameConflict;

  return (
    <main className="client-main min-h-screen bg-[radial-gradient(circle_at_top,_#fffdf7_0%,_#f8f6f1_50%,_#efe9dc_100%)] px-0 text-[#182a17] sm:grid sm:place-items-center sm:px-8">
      <section className="client-shell mx-auto flex min-h-screen w-full max-w-[390px] flex-col overflow-hidden border border-[#e7e0d2] bg-[#f8f6f1] shadow-[0_24px_80px_rgba(56,71,45,0.12)]">
        <header className="client-header sticky top-0 z-10 flex items-center border-b border-black/10 bg-white p-4">
          <button type="button" aria-label="Back" className="inline-flex h-10 w-10 items-center justify-center transition" onClick={() => router.back()}>
            <Image src="/icons/back-button.svg" alt="" aria-hidden="true" width={40} height={40} className="h-10 w-10" />
          </button>
          <h1 className="flex-1 pr-10 text-center text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-[#457941]">Edit profile</h1>
        </header>

        <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-4 pt-8">
          {isLoading ? <p className="text-[14px] text-[#525252]">Loading profile...</p> : null}
          {!isLoading && loadError ? <p className="text-[14px] text-[#dc2626]">{loadError}</p> : null}

          {!isLoading && !loadError ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-[14px] font-semibold leading-5 text-[#333333]">Add a photo</p>
                <div className="flex items-center gap-4">
                  {displayedPhotoUrl ? (
                    <Image
                      src={displayedPhotoUrl}
                      alt={fullName || "Profile photo"}
                      width={94}
                      height={94}
                      unoptimized
                      loader={({ src }) => src}
                      className="h-[94px] w-[94px] rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-[94px] w-[94px] rounded-full bg-[#0ea5e9]" />
                  )}
                  <button type="button" onClick={onChoosePhoto} className="h-8 rounded-lg bg-[#171717] px-3 text-[14px] font-medium leading-5 text-[#fafafa]">
                    Change photo
                  </button>
                  {displayedPhotoUrl ? (
                    <button type="button" onClick={onRemovePhoto} className="h-8 rounded-lg border border-[#171717] bg-white px-3 text-[14px] font-medium leading-5 text-[#171717]">
                      Remove
                    </button>
                  ) : null}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                    className="hidden"
                    onChange={onPhotoChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-name" className="text-[14px] font-semibold leading-5 text-[#333333]">
                  Name
                </label>
                <input
                  id="edit-name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="h-11 w-full rounded-lg border border-black/5 bg-white px-4 text-[14px] leading-5 text-[#333333] outline-none"
                />
                {isCheckingName ? <p className="text-[12px] leading-4 text-[#525252]">Checking name availability...</p> : null}
                {!isCheckingName && hasSimilarNameConflict ? (
                  <p className="text-[12px] leading-4 text-[#dc2626]">
                    Similar name already exists: {similarNames.join(", ")}. Please choose a different name.
                  </p>
                ) : null}
                {!isCheckingName && nameCheckError ? <p className="text-[12px] leading-4 text-[#dc2626]">{nameCheckError}</p> : null}
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-username" className="text-[14px] font-semibold leading-5 text-[#333333]">
                  Username
                </label>
                <div className="flex h-11 items-center rounded-lg border border-black/5 bg-white px-4">
                  <span className="text-[14px] leading-5 text-[#33333380]">@</span>
                  <input
                    id="edit-username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="ml-1 w-full bg-transparent text-[14px] leading-5 text-[#333333] outline-none"
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="border-t border-black/10 bg-[#f8f6f1] p-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={disableSave}
            className="h-[52px] w-full rounded-full bg-[#457941] text-[14px] font-medium leading-5 text-[#fafafa] disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
          {saveError ? <p className="mt-2 text-[12px] leading-4 text-[#dc2626]">{saveError}</p> : null}
        </div>
      </section>
    </main>
  );
}
