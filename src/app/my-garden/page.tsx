"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDrawerProfileData, useNotificationsData } from "@/lib/swr-hooks";
import { getDrawerItems } from "@/components/drawer-items";
import { DrawerItem, DrawerProfile, SideDrawer } from "@/components/feed-side-drawer";

const imgFrame1111 = "/images/figma/placeholder-expired.png";
const imgFrame1112 = "/images/figma/placeholder-expired.png";
const imgFrame1113 = "/images/figma/placeholder-expired.png";
const imgFrame1114 = "/images/figma/placeholder-expired.png";
const imgSproutIcon = "/icons/my-garden-plants.svg";
const imgSpeciesIcon = "/icons/my-garden-species.svg";
const imgLogsIcon = "/icons/my-garden-care-logs.svg";
const imgCameraIcon = "/icons/my-garden-posts.svg";
const imgCloseIcon = "/icons/my-garden-x.svg";
const imgChevronRight = "/icons/my-garden-chevron-right.svg";
const imgAddIcon = "/icons/my-garden-plus.svg";
const imgDot = "/images/figma/placeholder-expired.png";
const imgCareIcon = "/icons/my-garden-care-logs.svg";

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

export default function MyGardenPage() {
  const router = useRouter();
  const { data: notificationsData } = useNotificationsData();
  const unreadNotifications = Math.max(0, notificationsData?.unreadCount ?? 0);
  const [isDrawerMounted, setIsDrawerMounted] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isBuildGardenDismissed, setIsBuildGardenDismissed] = useState(false);
  const { data: drawerProfileData } = useDrawerProfileData();
  const [drawerProfile, setDrawerProfile] = useState<DrawerProfile>({
    fullName: "Global Gardener",
    nickname: "@Global Gardener",
    profilePhotoUrl: null,
  });

  const drawerCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLElement | null>(null);

  const drawerItems: DrawerItem[] = getDrawerItems("My Garden");

  const firstName = useMemo(() => {
    const trimmed = drawerProfile.fullName.trim();
    if (!trimmed) return "Mario";
    return trimmed.split(/\s+/)[0] || "Mario";
  }, [drawerProfile.fullName]);  useEffect(() => {
    const fullName = typeof drawerProfileData?.fullName === "string" && drawerProfileData.fullName.trim() ? drawerProfileData.fullName.trim() : "Global Gardener";
    const nickname = typeof drawerProfileData?.nickname === "string" && drawerProfileData.nickname.trim() ? drawerProfileData.nickname.trim() : `@${fullName}`;
    const profilePhotoUrl = typeof drawerProfileData?.profilePhotoUrl === "string" && drawerProfileData.profilePhotoUrl.trim() ? drawerProfileData.profilePhotoUrl.trim() : null;
    setDrawerProfile({ fullName, nickname, profilePhotoUrl });
  }, [drawerProfileData]);

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
    if (item.label === "Plant ID") {
      router.push("/my-garden/add-plant");
      return;
    }
    if (item.label === "Guides") {
      router.push("/guides");
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

        <div className="flex w-full flex-col gap-16 px-4 pb-10 pt-[104px]">
          <section className="flex w-full flex-col gap-8">
            <div className="flex w-full items-center">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="text-[30px] font-semibold leading-[30px] tracking-[-1px] text-[#182a17]">{`Olá, ${firstName}!`}</p>
                <p className="text-[16px] font-medium leading-6 text-[#333333cc]">Here&apos;s how your garden is growing</p>
              </div>
            </div>
            <div className="grid w-full grid-cols-2 gap-2">
              <article className="flex w-full items-center gap-4 rounded-full border border-[#e5e5e5] bg-white px-3 py-3">
                  <div className="rounded-full bg-[#f0fdf4cc] p-2"><img src={imgSproutIcon} alt="" className="h-6 w-6" /></div>
                  <div>
                    <p className="text-[16px] font-semibold leading-6 text-[#333333]">45</p>
                    <p className="text-[14px] font-medium leading-5 text-[#333333cc]">Plants</p>
                  </div>
              </article>
              <article className="flex w-full items-center gap-4 rounded-full border border-[#e5e5e5] bg-white px-3 py-3">
                  <div className="rounded-full bg-[#f0fdf4cc] p-2"><img src={imgSpeciesIcon} alt="" className="h-6 w-6" /></div>
                  <div>
                    <p className="text-[16px] font-semibold leading-6 text-[#333333]">12</p>
                    <p className="text-[14px] font-medium leading-5 text-[#333333cc]">Species</p>
                  </div>
              </article>
              <article className="flex w-full items-center gap-4 rounded-full border border-[#e5e5e5] bg-white px-3 py-3">
                  <div className="rounded-full bg-[#f0fdf4cc] p-2"><img src={imgLogsIcon} alt="" className="h-6 w-6" /></div>
                  <div>
                    <p className="text-[16px] font-semibold leading-6 text-[#333333]">6</p>
                    <p className="text-[14px] font-medium leading-5 text-[#333333cc]">Care logs</p>
                  </div>
              </article>
              <article className="flex w-full items-center gap-4 rounded-full border border-[#e5e5e5] bg-white px-3 py-3">
                  <div className="rounded-full bg-[#f0fdf4cc] p-2"><img src={imgCameraIcon} alt="" className="h-6 w-6" /></div>
                  <div>
                    <p className="text-[16px] font-semibold leading-6 text-[#333333]">34</p>
                    <p className="text-[14px] font-medium leading-5 text-[#333333cc]">Posts</p>
                  </div>
              </article>
            </div>
          </section>

          {isBuildGardenDismissed ? null : (
            <section className="relative flex w-full flex-col items-start justify-center gap-8 rounded-[18px] border border-black/10 bg-white p-6">
              <button
                type="button"
                aria-label="Dismiss build your garden"
                className="absolute right-[6px] top-[6px] rounded-full bg-[#f5f5f5] p-2"
                onClick={() => setIsBuildGardenDismissed(true)}
              >
                <img src={imgCloseIcon} alt="" className="h-5 w-5" />
              </button>
              <div className="flex w-full flex-col items-center justify-center gap-4">
                <p className="bg-[linear-gradient(90deg,_#182a17_0%,_#3c6838_20%,_#5fa659_70%)] bg-clip-text text-center text-[20px] font-semibold leading-6 text-transparent">
                  Build your garden
                </p>
                <p className="w-[254px] text-center text-[14px] font-medium leading-5 text-[#333333cc]">
                  Add plants to unlock insights and track your growth.
                </p>
              </div>
              <button
                type="button"
                className="h-9 w-full rounded-[1000px] bg-[#457941] px-4 py-2 text-[14px] font-medium leading-5 text-[#fafafa]"
                onClick={() => router.push("/my-garden/add-plant")}
              >
                Add plant
              </button>
            </section>
          )}

          <section className="flex w-full flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <p className="text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-[#182a17]">My Garden</p>
                <p className="text-[16px] font-medium leading-6 text-[#333333cc]">Your saved plants</p>
              </div>
              <button type="button" className="flex items-center gap-[2px]" onClick={() => router.push("/my-garden/view-all")}>
                <span className="text-[14px] font-medium leading-5 text-[#737373]">View all</span>
                <img src={imgChevronRight} alt="" className="h-6 w-6" />
              </button>
            </div>
            <div className="flex items-center gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <article
                className="flex h-[231px] w-[160px] shrink-0 cursor-pointer flex-col items-center justify-center gap-4 rounded-[12px] border border-black/10 bg-white p-4"
                role="button"
                tabIndex={0}
                onClick={() => router.push("/my-garden/add-plant")}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    router.push("/my-garden/add-plant");
                  }
                }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-[132px] bg-[#31674c] p-[10.667px]">
                  <img src={imgAddIcon} alt="" className="h-[21.33px] w-[21.33px]" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-center text-[16px] font-medium leading-6 text-[#182a17]">Add a plant</p>
                  <p className="text-center text-[12px] font-normal leading-4 text-[#333333cc]">Identify and save it to your garden.</p>
                </div>
              </article>

              {[imgFrame1111, imgFrame1112].map((image, index) => (
                <article
                  key={`${image}-${index}`}
                  className="flex h-[231px] w-[171px] shrink-0 cursor-pointer flex-col"
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push("/plant")}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      router.push("/plant");
                    }
                  }}
                >
                  <img src={image} alt="" className="h-[153px] w-full rounded-t-[16px] object-cover shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.1)]" />
                  <div className="flex-1 rounded-b-[16px] border-x border-b border-black/5 bg-white px-3 pb-3 pt-2">
                    <p className="text-[14px] font-medium leading-5 text-[#333333]">Plant name</p>
                    <p className="text-[12px] font-normal leading-4 text-[#333333cc]">Species name</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="flex w-full flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <p className="text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-[#182a17]">MyGrowMate Logs</p>
                <p className="text-[16px] font-medium leading-6 text-[#333333cc]">AI care insights for your plants</p>
              </div>
              <button type="button" className="flex items-center gap-[2px]" onClick={() => router.push("/my-grow-mate/logs")}>
                <span className="text-[14px] font-medium leading-5 text-[#737373]">View all</span>
                <img src={imgChevronRight} alt="" className="h-6 w-6" />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { title: "Title of log", plant: "Plant name", topic: "Topic", icon: imgSproutIcon, slug: "title-of-log-1" },
                { title: "Montera Care Plan", plant: "Monstera", topic: "Care Plan", icon: imgCareIcon, slug: "montera-care-plan" },
                { title: "Title of log", plant: "Plant name", topic: "Topic", icon: imgSproutIcon, slug: "title-of-log-2" },
              ].map((row, index) => (
                <article
                  key={`${row.title}-${row.plant}-${index}`}
                  className="flex w-full cursor-pointer items-center gap-4 rounded-full border border-black/10 bg-white p-4"
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/my-grow-mate/logs/${row.slug}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      router.push(`/my-grow-mate/logs/${row.slug}`);
                    }
                  }}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="rounded-full bg-[#f0fdf4cc] p-2"><img src={row.icon} alt="" className="h-6 w-6" /></div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium leading-5 text-[#333333]">{row.title}</p>
                      <div className="flex items-center gap-[6px]">
                        <p className="text-[12px] font-normal leading-4 text-[#333333cc]">{row.plant}</p>
                        <img src={imgDot} alt="" className="h-1 w-1" />
                        <p className="text-[12px] font-normal leading-4 text-[#333333cc]">{row.topic}</p>
                      </div>
                    </div>
                  </div>
                  <img src={imgChevronRight} alt="" className="h-6 w-6" />
                </article>
              ))}
            </div>
          </section>

          <section className="flex w-full flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <p className="text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-[#182a17]">Garden Gallery</p>
                <p className="text-[16px] font-medium leading-6 text-[#333333cc]">Your garden moments</p>
              </div>
              <button type="button" className="flex items-center gap-[2px]" onClick={() => router.push("/my-garden/gallery")}>
                <span className="text-[14px] font-medium leading-5 text-[#737373]">View all</span>
                <img src={imgChevronRight} alt="" className="h-6 w-6" />
              </button>
            </div>
            <div className="flex items-center gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <article className="flex h-[231px] w-[160px] shrink-0 flex-col items-center justify-center gap-4 rounded-[12px] border border-black/10 bg-white p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[132px] bg-[#31674c] p-[10.667px]">
                  <img src={imgAddIcon} alt="" className="h-[21.33px] w-[21.33px]" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-center text-[16px] font-medium leading-6 text-[#333333]">Add garden photo</p>
                  <p className="text-center text-[12px] font-normal leading-4 text-[#333333cc]">Save a moment from your garden.</p>
                </div>
              </article>

              {[imgFrame1113, imgFrame1114].map((image, index) => (
                <article key={`${image}-${index}`} className="flex h-[231px] w-[171px] shrink-0 flex-col">
                  <img src={image} alt="" className="h-[153px] w-full rounded-t-[16px] object-cover shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.1)]" />
                  <div className="flex-1 rounded-b-[16px] border-x border-b border-black/5 bg-white px-3 pb-3 pt-2">
                    <p className="text-[14px] font-medium leading-5 text-[#333333]">Plant name</p>
                    <p className="text-[12px] font-normal leading-4 text-[#333333cc]">Species name</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="flex w-full flex-col gap-6">
            <div className="flex h-[57px] w-full items-start">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <p className="text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-[#182a17]">Data &amp; Backup</p>
                <p className="text-[16px] font-medium leading-6 text-[#333333cc]">Your garden data is always yours.</p>
              </div>
            </div>
            <div className="flex w-full flex-col gap-3">
              {[
                { title: "Import My Garden", subtitle: "CSV or JSON files" },
                { title: "Export My Garden", subtitle: "CSV or JSON files" },
              ].map((item) => (
                <button
                  key={item.title}
                  type="button"
                  className="flex min-h-10 w-full items-center justify-between rounded-full border border-black/10 bg-white py-4 pl-8 pr-4"
                >
                  <span className="text-left">
                    <p className="text-[14px] font-medium leading-5 text-[#333333]">{item.title}</p>
                    <p className="text-[12px] font-medium leading-4 text-[#333333cc]">{item.subtitle}</p>
                  </span>
                  <img src={imgChevronRight} alt="" className="h-6 w-6" />
                </button>
              ))}
            </div>
          </section>
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




