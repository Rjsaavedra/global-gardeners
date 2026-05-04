"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getDrawerItems } from "@/components/drawer-items";
import { DrawerItem, DrawerProfile, SideDrawer } from "@/components/feed-side-drawer";

const iconUser = "/icons/settings-edit-profile.svg";
const iconKey = "/icons/settings-change-password.svg";
const iconSparkles = "/icons/settings-setup-your-experience.svg";
const iconBellRing = "/icons/settings-plant-care-reminders.svg";
const iconLanguages = "/icons/settings-language.svg";
const iconThermometer = "/icons/settings-temperature-unit.svg";
const iconAlert = "/icons/settings-report-a-problem.svg";
const iconSprout = "/icons/settings-about-global-gardener.svg";
const iconLogout = "/icons/logout.svg";
const iconChevron = "/icons/settings-chevron-right.svg";

function MenuIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path d="M20 11.25C20.4142 11.25 20.75 11.5858 20.75 12C20.75 12.4142 20.4142 12.75 20 12.75H4C3.58579 12.75 3.25 12.4142 3.25 12C3.25 11.5858 3.58579 11.25 4 11.25H20Z" fill="currentColor" />
      <path d="M20 17.25C20.4142 17.25 20.75 17.5858 20.75 18C20.75 18.4142 20.4142 18.75 20 18.75H4C3.58579 18.75 3.25 18.4142 3.25 18C3.25 17.5858 3.58579 17.25 4 17.25H20Z" fill="currentColor" />
      <path d="M20 5.25C20.4142 5.25 20.75 5.58579 20.75 6C20.75 6.41421 20.4142 6.75 20 6.75H4C3.58579 6.75 3.25 6.41421 3.25 6C3.25 5.58579 3.58579 5.25 4 5.25H20Z" fill="currentColor" />
    </svg>
  );
}

function BellIcon() {
  return <img src="/icons/settings-bell.svg" alt="" aria-hidden="true" className="h-6 w-6" />;
}

type SettingRow = { label: string; icon: string };
type SettingSection = { title: string; rows: SettingRow[] };

const settingsSections: SettingSection[] = [
  {
    title: "Account",
    rows: [
      { label: "Edit profile", icon: iconUser },
      { label: "Change password", icon: iconKey },
    ],
  },
  {
    title: "Preferences",
    rows: [
      { label: "Personalize your experience", icon: iconSparkles },
      { label: "Language", icon: iconLanguages },
      { label: "Units & measurements", icon: iconThermometer },
    ],
  },
  {
    title: "Notifications",
    rows: [{ label: "Notifications", icon: iconBellRing }],
  },
  {
    title: "Support",
    rows: [
      { label: "Report a problem", icon: iconAlert },
      { label: "About Global Gardeners", icon: iconSprout },
    ],
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isDrawerMounted, setIsDrawerMounted] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [drawerProfile, setDrawerProfile] = useState<DrawerProfile>({
    fullName: "Global Gardener",
    nickname: "@Global Gardener",
    profilePhotoUrl: null,
  });

  const drawerCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLElement | null>(null);

  const drawerItems: DrawerItem[] = getDrawerItems("Settings");

  useEffect(() => {
    let isMounted = true;
    async function loadDrawerProfile() {
      const response = await fetch("/api/profile/me");
      if (!response.ok) return;
      const profile = (await response.json()) as Partial<DrawerProfile>;
      if (!isMounted) return;
      const fullName = typeof profile.fullName === "string" && profile.fullName.trim() ? profile.fullName.trim() : "Global Gardener";
      const nickname = typeof profile.nickname === "string" && profile.nickname.trim() ? profile.nickname.trim() : `@${fullName}`;
      const profilePhotoUrl = typeof profile.profilePhotoUrl === "string" && profile.profilePhotoUrl.trim() ? profile.profilePhotoUrl.trim() : null;
      setDrawerProfile({ fullName, nickname, profilePhotoUrl });
    }
    void loadDrawerProfile();
    const refreshUnreadNotifications = async () => {
      try {
        const response = await fetch("/api/notifications", { cache: "no-store" });
        if (!response.ok || !isMounted) return;
        const payload = (await response.json()) as { unreadCount?: number };
        if (!isMounted) return;
        setUnreadNotifications(Math.max(0, payload.unreadCount ?? 0));
      } catch {}
    };
    void refreshUnreadNotifications();
    const intervalId = setInterval(() => {
      void refreshUnreadNotifications();
    }, 20000);
    const handleFocus = () => {
      void refreshUnreadNotifications();
    };
    window.addEventListener("focus", handleFocus);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const openDrawer = () => {
    if (drawerCloseTimerRef.current) {
      clearTimeout(drawerCloseTimerRef.current);
      drawerCloseTimerRef.current = null;
    }
    if (isDrawerMounted) return;
    menuTriggerRef.current = document.activeElement as HTMLButtonElement | null;
    setIsDrawerMounted(true);
    requestAnimationFrame(() => setIsDrawerVisible(true));
  };

  const closeDrawer = () => {
    setIsDrawerVisible(false);
    drawerCloseTimerRef.current = setTimeout(() => {
      setIsDrawerMounted(false);
      menuTriggerRef.current?.focus();
      drawerCloseTimerRef.current = null;
    }, 300);
  };

  useEffect(() => {
    if (!isDrawerVisible) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", handleKeyDown);
    drawerRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerVisible]);

  useEffect(() => {
    if (isDrawerMounted) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
    document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerMounted]);

  const handleCreatePost = () => {
    closeDrawer();
    router.push("/new-post");
  };

  const handleOpenProfile = () => {
    closeDrawer();
    router.push("/profile");
  };

  const handleSelectDrawerItem = (item: DrawerItem) => {
    closeDrawer();
    if (item.label === "Stream") {
      router.push("/feed");
      return;
    }
    if (item.label === "My Garden") {
      router.push("/my-garden");
      return;
    }
    if (item.label === "Plant ID") {
      router.push("/my-garden/add-plant");
      return;
    }
    if (item.label === "MyGrowMate") {
      router.push("/my-grow-mate");
      return;
    }
    if (item.label === "Guides") {
      router.push("/guides");
      return;
    }
    if (item.label === "Influencer Spotlight") {
      router.push("/influencer-spotlight");
      return;
    }
    if (item.label === "Notifications") {
      router.push("/notifications");
      return;
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
      setIsLoggingOut(false);
    }
  };

  return (
    <main className="client-main min-h-screen bg-[radial-gradient(circle_at_top,_#fffdf7_0%,_#f8f6f1_50%,_#efe9dc_100%)] px-0 text-[#182a17]">
      <section className="client-shell relative flex min-h-screen w-full flex-col overflow-x-hidden border border-[#e7e0d2] bg-[#f8f6f1] shadow-[0_24px_80px_rgba(56,71,45,0.12)]">
        <header className="client-header fixed left-0 right-0 top-0 z-30 flex w-full items-center justify-between border-b border-black/10 bg-white p-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              ref={menuTriggerRef}
              className="rounded-full bg-[#f5f5f5] p-2 text-[#7a7a7a]"
              aria-label="Open menu"
              onClick={openDrawer}
            >
              <MenuIcon />
            </button>
            <h1 className="text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-[#31674c]">Global Gardeners</h1>
          </div>
          <button
            type="button"
            className="relative rounded-full bg-[#f5f5f5] p-2 text-[#7a7a7a]"
            aria-label="Notifications"
            onClick={() => router.push("/notifications")}
          >
            <BellIcon />
            {unreadNotifications > 0 ? <span aria-hidden="true" className="absolute right-0 top-0 h-2.5 w-2.5 -translate-y-1/4 translate-x-1/4 rounded-full bg-[#ef4444] ring-2 ring-white" /> : null}
          </button>
        </header>

        <div className="flex flex-1 flex-col px-4 pb-8 pt-[104px]">
          {settingsSections.map((section) => (
            <section key={section.title} className="mb-8">
              <h2 className="py-2 text-[16px] font-medium leading-6 text-[#333333]">{section.title}</h2>
              {section.rows.map((row) => (
                <button
                  key={row.label}
                  type="button"
                  className="flex w-full items-center gap-2 border-b border-[#e5e5e5] py-2 text-left"
                  onClick={() => {
                    if (row.label === "Edit profile") {
                      router.push("/profile/edit");
                      return;
                    }
                    if (row.label === "Change password") {
                      router.push("/settings/change-password");
                      return;
                    }
                    if (row.label === "Personalize your experience") {
                      router.push("/settings/experience");
                      return;
                    }
                    if (row.label === "Language") {
                      router.push("/settings/language");
                      return;
                    }
                    if (row.label === "Notifications") {
                      router.push("/settings/notifications");
                      return;
                    }
                    if (row.label === "Report a problem") {
                      router.push("/settings/report-problem");
                      return;
                    }
                    if (row.label === "About Global Gardeners") {
                      router.push("/settings/about");
                      return;
                    }
                    if (row.label === "Units & measurements") {
                      router.push("/settings/units-measurements");
                    }
                  }}
                >
                  <img src={row.icon} alt="" className="h-5 w-5 shrink-0" />
                  <span className="flex-1 text-[14px] font-medium leading-5 text-[#333333cc]">{row.label}</span>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg">
                    <img src={iconChevron} alt="" className="h-4 w-4 shrink-0" />
                  </span>
                </button>
              ))}
            </section>
          ))}

          <div className="mt-auto rounded-full bg-white px-4 py-3">
            <button
              type="button"
              className="mx-auto flex items-center justify-center gap-2 text-[14px] font-medium leading-5 text-[#dc2626]"
              onClick={() => {
                void handleLogout();
              }}
            >
              <img src={iconLogout} alt="" className="h-5 w-5" />
              <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
            </button>
          </div>
        </div>

        {isDrawerMounted ? (
          <SideDrawer
            drawerRef={drawerRef}
            isLoggingOut={isLoggingOut}
            isVisible={isDrawerVisible}
            items={drawerItems}
            onClose={closeDrawer}
            onCreatePost={handleCreatePost}
            onLogout={() => {
              void handleLogout();
            }}
            onOpenProfile={handleOpenProfile}
            onSelectItem={handleSelectDrawerItem}
            profile={drawerProfile}
          />
        ) : null}
      </section>
    </main>
  );
}


