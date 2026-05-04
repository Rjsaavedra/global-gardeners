"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type ToggleRow = {
  key: string;
  label: string;
  defaultEnabled: boolean;
};

type ToggleSection = {
  key: string;
  title: string;
  rows: ToggleRow[];
};

const sections: ToggleSection[] = [
  {
    key: "plant-care",
    title: "Plant care reminders",
    rows: [
      { key: "watering", label: "Watering reminders", defaultEnabled: true },
      { key: "fertilizing", label: "Fertilizing reminders", defaultEnabled: false },
      { key: "repotting", label: "Repotting reminders", defaultEnabled: false },
    ],
  },
  {
    key: "my-grow-mate",
    title: "MyGrowMate updates",
    rows: [
      { key: "care-suggestions", label: "New care suggestions", defaultEnabled: true },
      { key: "care-follow-ups", label: "Care follow-ups", defaultEnabled: true },
    ],
  },
  {
    key: "community",
    title: "Community activity",
    rows: [
      { key: "new-followers", label: "New followers", defaultEnabled: true },
      { key: "likes", label: "Likes on your posts", defaultEnabled: true },
      { key: "comments", label: "Comments on your posts", defaultEnabled: true },
    ],
  },
  {
    key: "delivery",
    title: "Delivery",
    rows: [
      { key: "push", label: "Push notifications", defaultEnabled: true },
      { key: "email", label: "Email notifications", defaultEnabled: false },
    ],
  },
];

function Toggle({
  checked,
  onClick,
  ariaLabel,
}: {
  checked: boolean;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      className={`relative h-[18px] w-[33px] shrink-0 rounded-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-colors ${
        checked ? "bg-[#171717]" : "bg-[#e5e5e5]"
      }`}
      onClick={onClick}
    >
      <span
        className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-black/10 bg-[#f8f6f1] transition-all ${
          checked ? "left-[16px]" : "left-[1px]"
        }`}
      />
    </button>
  );
}

export default function NotificationSettingsPage() {
  const router = useRouter();
  const [allNotifications, setAllNotifications] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const section of sections) {
      for (const row of section.rows) {
        initial[row.key] = row.defaultEnabled;
      }
    }
    return initial;
  });
  const allToggleKeys = useMemo(() => Object.keys(toggles), [toggles]);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setErrorMessage(null);
        const response = await fetch("/api/profile/notifications", { method: "GET" });
        const payload = (await response.json()) as {
          error?: string;
          notificationPreferences?: Record<string, boolean>;
        };
        if (!response.ok || !payload.notificationPreferences) {
          throw new Error(payload.error ?? "Unable to load notification preferences.");
        }

        setToggles((current) => ({ ...current, ...payload.notificationPreferences }));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load notification preferences.";
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadPreferences();
  }, []);

  useEffect(() => {
    if (allToggleKeys.length === 0) return;
    setAllNotifications(allToggleKeys.every((key) => toggles[key]));
  }, [allToggleKeys, toggles]);

  const savePreferences = async (nextToggles: Record<string, boolean>) => {
    try {
      setIsSaving(true);
      setErrorMessage(null);
      const response = await fetch("/api/profile/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationPreferences: nextToggles }),
      });

      const payload = (await response.json()) as {
        error?: string;
        notificationPreferences?: Record<string, boolean>;
      };

      if (!response.ok || !payload.notificationPreferences) {
        throw new Error(payload.error ?? "Unable to save notification preferences.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save notification preferences.";
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleChange = (key: string) => {
    setToggles((current) => {
      const nextToggles = { ...current, [key]: !current[key] };
      void savePreferences(nextToggles);
      return nextToggles;
    });
  };

  const handleToggleAll = () => {
    const targetValue = !allNotifications;
    setAllNotifications(targetValue);
    setToggles((current) => {
      const nextToggles = Object.fromEntries(Object.keys(current).map((key) => [key, targetValue]));
      void savePreferences(nextToggles);
      return nextToggles;
    });
  };

  return (
    <main className="client-main min-h-screen bg-[radial-gradient(circle_at_top,_#fffdf7_0%,_#f8f6f1_50%,_#efe9dc_100%)] px-0 text-[#182a17] sm:grid sm:place-items-center sm:px-8">
      <section className="client-shell mx-auto flex min-h-screen w-full max-w-[390px] flex-col overflow-hidden border border-[#e7e0d2] bg-[#f8f6f1] shadow-[0_24px_80px_rgba(56,71,45,0.12)]">
        <header className="client-header sticky top-0 z-20 flex items-center border-b border-black/10 bg-white p-4">
          <button type="button" aria-label="Go back to settings" className="inline-flex h-10 w-10 items-center justify-center" onClick={() => router.push("/settings")}>
            <Image src="/icons/back-button.svg" alt="" aria-hidden="true" width={40} height={40} className="h-10 w-10" />
          </button>
          <h1 className="flex-1 pl-4 pr-10 text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-[#457941]">Notifications</h1>
        </header>

        <div className="flex flex-1 flex-col px-4 pb-8 pt-8">
          <div className="flex h-6 items-center gap-2">
            <Toggle checked={allNotifications} onClick={handleToggleAll} ariaLabel="Toggle all notifications" />
            <p className="text-[16px] font-semibold leading-6 tracking-[0px] text-[#333333]">All notifications</p>
          </div>
          {isLoading ? <p className="mt-2 text-[12px] text-[#5c5c5c]">Loading preferences...</p> : null}
          {isSaving ? <p className="mt-2 text-[12px] text-[#5c5c5c]">Saving changes...</p> : null}
          {errorMessage ? <p className="mt-2 text-[12px] text-[#b42318]">{errorMessage}</p> : null}

          <div className="mt-8 h-px w-full bg-[#e5e5e5]" />

          <div className="mt-8 flex flex-col">
            {sections.map((section, index) => (
              <section key={section.key} className="flex flex-col gap-4">
                <h2 className="text-[14px] font-semibold leading-5 tracking-[0px] text-[#333333]">{section.title}</h2>
                <div className="flex flex-col gap-4">
                  {section.rows.map((row) => (
                    <div key={row.key} className="flex h-6 items-center gap-2">
                      <Toggle
                        checked={toggles[row.key]}
                        onClick={() => handleToggleChange(row.key)}
                        ariaLabel={`Toggle ${row.label}`}
                      />
                      <p className="text-[14px] font-normal leading-5 tracking-[0px] text-[#404040]">{row.label}</p>
                    </div>
                  ))}
                </div>
                {index < sections.length - 1 ? <div className="my-8 h-px w-full bg-[#e5e5e5]" /> : null}
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
