"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDrawerProfileData, useNotificationsData } from "@/lib/swr-hooks";
import Image from "next/image";
import { getDrawerItems } from "@/components/drawer-items";
import { DrawerItem, DrawerProfile, SideDrawer } from "@/components/feed-side-drawer";

const guideImageBase = "/images/figma/placeholder-expired.png";
const guideImageOverlay = "/images/figma/placeholder-expired.png";

type GuideCard = {
  id: string;
  title: string;
  subtitle: string;
  readTime: string;
};

const guideCards: GuideCard[] = [];

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
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path d="M13.0823 20.625C13.2894 20.2663 13.7481 20.1435 14.1067 20.3506C14.4655 20.5577 14.5883 21.0163 14.3812 21.375C14.1398 21.7929 13.7932 22.1405 13.3753 22.3818C12.9574 22.6231 12.4829 22.7499 12.0003 22.75C11.5178 22.75 11.0432 22.623 10.6253 22.3818C10.2073 22.1405 9.85984 21.793 9.61847 21.375C9.41134 21.0163 9.53418 20.5577 9.89288 20.3506C10.2516 20.1435 10.7102 20.2663 10.9173 20.625C11.027 20.815 11.1853 20.9723 11.3753 21.082C11.5653 21.1917 11.7809 21.25 12.0003 21.25C12.2196 21.2499 12.4354 21.1917 12.6253 21.082C12.8151 20.9724 12.9727 20.8148 13.0823 20.625Z" fill="currentColor" />
      <path d="M17.2496 8C17.2496 6.60779 16.6969 5.27262 15.7125 4.28809C14.728 3.30352 13.392 2.75 11.9996 2.75C10.6073 2.75007 9.27223 3.30358 8.28772 4.28809C7.30323 5.27264 6.74963 6.60767 6.74963 8C6.74963 10.3279 6.38421 11.9327 5.80628 13.1562C5.2337 14.3683 4.47511 15.1507 3.81604 15.8311L3.776 15.8906C3.76542 15.9124 3.75748 15.9359 3.75354 15.96C3.74582 16.0076 3.75265 16.0564 3.7721 16.1006C3.7916 16.1448 3.82343 16.1825 3.86389 16.209C3.90447 16.2355 3.95216 16.25 4.00061 16.25H20.0006C20.0487 16.2499 20.096 16.2361 20.1364 16.21C20.1769 16.1836 20.2095 16.1458 20.2291 16.1016C20.2487 16.0573 20.2545 16.0078 20.2467 15.96C20.239 15.9122 20.2177 15.8678 20.1852 15.832C19.5247 15.1513 18.7654 14.3687 18.193 13.1572C17.6148 11.9335 17.2496 10.328 17.2496 8ZM18.7496 8C18.7496 10.171 19.0901 11.5444 19.5494 12.5166C20.0095 13.4902 20.6126 14.1188 21.278 14.8047C21.2835 14.8104 21.2892 14.8164 21.2946 14.8223C21.5228 15.0731 21.6728 15.385 21.7272 15.7197C21.7815 16.0545 21.7374 16.3979 21.6002 16.708C21.463 17.0181 21.2389 17.2818 20.9547 17.4668C20.7061 17.6286 20.421 17.7238 20.1266 17.7451L19.9996 17.75H3.99963C3.66057 17.7498 3.32855 17.6511 3.04456 17.4658C2.7605 17.2805 2.53588 17.0164 2.39905 16.7061C2.26226 16.3958 2.21935 16.0524 2.27405 15.7178C2.32882 15.383 2.47903 15.0709 2.70764 14.8203L2.72327 14.8037C3.38742 14.118 3.9908 13.4894 4.45081 12.5156C4.90993 11.5435 5.24963 10.1706 5.24963 8C5.24963 6.20979 5.9613 4.49243 7.22717 3.22656C8.49295 1.96098 10.2097 1.25007 11.9996 1.25C13.7898 1.25 15.5072 1.96077 16.7731 3.22656C18.0389 4.49243 18.7496 6.20979 18.7496 8Z" fill="currentColor" />
    </svg>
  );
}

export default function GuidesPage() {
  const router = useRouter();
  const { data: notificationsData } = useNotificationsData();
  const unreadNotifications = Math.max(0, notificationsData?.unreadCount ?? 0);
  const [isDrawerMounted, setIsDrawerMounted] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { data: drawerProfileData } = useDrawerProfileData();
  const [drawerProfile, setDrawerProfile] = useState<DrawerProfile>({
    fullName: "Global Gardener",
    nickname: "@Global Gardener",
    profilePhotoUrl: null,
  });
  const [cards, setCards] = useState<GuideCard[]>(guideCards);

  const drawerCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLElement | null>(null);

  const drawerItems: DrawerItem[] = getDrawerItems("Guides");  useEffect(() => {
    const fullName = typeof drawerProfileData?.fullName === "string" && drawerProfileData.fullName.trim() ? drawerProfileData.fullName.trim() : "Global Gardener";
    const nickname = typeof drawerProfileData?.nickname === "string" && drawerProfileData.nickname.trim() ? drawerProfileData.nickname.trim() : `@${fullName}`;
    const profilePhotoUrl = typeof drawerProfileData?.profilePhotoUrl === "string" && drawerProfileData.profilePhotoUrl.trim() ? drawerProfileData.profilePhotoUrl.trim() : null;
    setDrawerProfile({ fullName, nickname, profilePhotoUrl });
  }, [drawerProfileData]);

  useEffect(() => {
    let cancelled = false;
    const loadGuides = async () => {
      try {
        const response = await fetch("/api/guides");
        if (!response.ok) return;
        const payload = (await response.json()) as { guides?: GuideCard[] };
        if (cancelled || !Array.isArray(payload.guides)) return;
        setCards(payload.guides);
      } catch {
        // no-op
      }
    };
    void loadGuides();
    return () => {
      cancelled = true;
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

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
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
    if (item.label === "Influencer Spotlight") {
      router.push("/influencer-spotlight");
      return;
    }
    if (item.label === "Notifications") {
      router.push("/notifications");
      return;
    }
    if (item.label === "Settings") {
      router.push("/settings");
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

        <div className="flex flex-col gap-2 px-4 pb-8 pt-[104px]">
          {cards.map((guide) => (
            <button
              key={guide.id}
              type="button"
              onClick={() => router.push(`/guides/${guide.id}`)}
              className="w-full rounded-[16px] border border-black/10 bg-white p-3 text-left"
            >
              <div className="flex gap-4">
                <div className="relative h-[106px] w-[134px] shrink-0 overflow-hidden rounded-[12px]">
                  <Image
                    src={guideImageBase}
                    alt=""
                    width={134}
                    height={106}
                    unoptimized
                    className="absolute inset-0 h-full w-full rounded-[12px] object-cover"
                  />
                  <Image
                    src={guideImageOverlay}
                    alt=""
                    width={134}
                    height={106}
                    unoptimized
                    className="absolute inset-0 h-full w-full rounded-[12px] object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div className="flex flex-col gap-1">
                    <p className="line-clamp-2 text-[16px] font-semibold leading-[1.2] text-[#333333]">{guide.title}</p>
                    <p className="text-[12px] font-medium leading-4 text-[#333333cc]">{guide.subtitle}</p>
                  </div>
                  <p className="text-[12px] leading-4 text-[#33333399]">{guide.readTime}</p>
                </div>
              </div>
            </button>
          ))}
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




