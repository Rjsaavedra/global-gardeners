"use client";

import { Bean, Bug, Droplets, Flower2, FlaskRound, GraduationCap, Hammer, Recycle, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { ComponentType, SVGProps, useEffect, useRef, useState } from "react";
import { getDrawerItems } from "@/components/drawer-items";
import { DrawerItem, DrawerProfile, SideDrawer } from "@/components/feed-side-drawer";

const iconChevronRight = "/icons/my-garden-chevron-right.svg";
const iconBell = "/icons/settings-bell.svg";
const iconSparkles = "/icons/my-garden-care-logs.svg";
const iconSavedLogLeaf = "/icons/my-garden-plants.svg";

type QuickAction = {
  title: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement> & { strokeWidth?: number }>;
};

type Conversation = {
  title: string;
  excerpt: string;
};

type SavedLog = {
  title: string;
  plant: string;
  topic: string;
  icon: string;
};

const quickActions: QuickAction[] = [
  {
    title: "Indoor Plant Recommendations",
    description: "Get indoor plant suggestions based on your space and preferences.",
    icon: Flower2,
  },
  {
    title: "Pest & Disease Diagnosis",
    description: "Describe symptoms to identify and treat common plant pests and diseases.",
    icon: Bug,
  },
  {
    title: "Soil & Fertilizer Guide",
    description: "Find the best soil mix and fertilizer for your plants.",
    icon: Bean,
  },
  {
    title: "Watering Schedule Creator",
    description: "Create a watering schedule tailored to your plant and environment.",
    icon: Droplets,
  },
  {
    title: "Plant Companion Finder",
    description: "Discover plants that grow well together and support healthy growth.",
    icon: UsersRound,
  },
  {
    title: "DIY Project Ideas",
    description: "Explore creative and practical DIY gardening projects.",
    icon: Hammer,
  },
  {
    title: "Gardening for Beginners",
    description: "Learn the basics with simple, step-by-step gardening guidance.",
    icon: GraduationCap,
  },
  {
    title: "Advanced Gardener's Hub",
    description: "Dive into advanced topics like grafting, breeding, and hydroponics.",
    icon: FlaskRound,
  },
  {
    title: "Sustainable Gardening",
    description: "Learn eco-friendly practices that support soil, water, and wildlife.",
    icon: Recycle,
  },
];

const conversations: Conversation[] = [
  {
    title: "Title of conversation",
    excerpt:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed neque felis, tincidunt placerat lectus euismod, accumsan dapibus orci. Sed felis orci, consequat eget mi quis, facilisis facilisis metus.",
  },
  {
    title: "Title of conversation",
    excerpt:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed neque felis, tincidunt placerat lectus euismod, accumsan dapibus orci. Sed felis orci, consequat eget mi quis, facilisis facilisis metus.",
  },
  {
    title: "Title of conversation",
    excerpt:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed neque felis, tincidunt placerat lectus euismod, accumsan dapibus orci. Sed felis orci, consequat eget mi quis, facilisis facilisis metus.",
  },
];

const savedLogs: SavedLog[] = [
  { title: "Title of log", plant: "Plant name", topic: "Topic", icon: iconSavedLogLeaf },
  { title: "Montera Care Plan", plant: "Monstera", topic: "Care Plan", icon: iconSparkles },
  { title: "Title of log", plant: "Plant name", topic: "Topic", icon: iconSavedLogLeaf },
];

function MenuIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path d="M20 11.25C20.4142 11.25 20.75 11.5858 20.75 12C20.75 12.4142 20.4142 12.75 20 12.75H4C3.58579 12.75 3.25 12.4142 3.25 12C3.25 11.5858 3.58579 11.25 4 11.25H20Z" fill="currentColor" />
      <path d="M20 17.25C20.4142 17.25 20.75 17.5858 20.75 18C20.75 18.4142 20.4142 18.75 20 18.75H4C3.58579 18.75 3.25 18.4142 3.25 18C3.25 17.5858 3.58579 17.25 4 17.25H20Z" fill="currentColor" />
      <path d="M20 5.25C20.4142 5.25 20.75 5.58579 20.75 6C20.75 6.41421 20.4142 6.75 20 6.75H4C3.58579 6.75 3.25 6.41421 3.25 6C3.25 5.58579 3.58579 5.25 4 5.25H20Z" fill="currentColor" />
    </svg>
  );
}

function AiAssistantIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
      <path
        d="M8.07 1.74a.64.64 0 0 1 .58.48l.91 3.53c.04.16.13.3.24.42.12.11.26.2.42.24l3.54.91a.64.64 0 0 1 0 1.24l-3.54.91a.75.75 0 0 0-.42.24.75.75 0 0 0-.24.42l-.91 3.54a.64.64 0 0 1-1.24 0l-.91-3.54a.75.75 0 0 0-.24-.42.75.75 0 0 0-.42-.24l-3.54-.91a.64.64 0 0 1 0-1.24l3.54-.91a.75.75 0 0 0 .42-.24.75.75 0 0 0 .24-.42l.91-3.53a.64.64 0 0 1 .66-.48Zm-.62 4.36a2.1 2.1 0 0 1-1.35 1.35L3.96 8l2.14.55A2.1 2.1 0 0 1 7.45 9.9L8 12.04l.55-2.14A2.1 2.1 0 0 1 9.9 8.55L12.04 8 9.9 7.45A2.1 2.1 0 0 1 8.55 6.1L8 3.96 7.45 6.1Z"
        fill="currentColor"
      />
      <path d="M13 4.67V2.67a.5.5 0 0 1 1 0v2a.5.5 0 0 1-1 0ZM15 3.17a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1h2ZM2 13.33V12a.5.5 0 0 1 1 0v1.33a.5.5 0 0 1-1 0ZM3.33 12.5a.5.5 0 0 1 0 1H2a.5.5 0 0 1 0-1h1.33Z" fill="currentColor" />
    </svg>
  );
}

function BellButton({ unreadNotifications, onClick }: { unreadNotifications: number; onClick: () => void }) {
  return (
    <button
      type="button"
      className="relative rounded-full border border-black/5 bg-[#f5f5f526] p-2 text-[#737373]"
      aria-label="Notifications"
      onClick={onClick}
    >
      <img src={iconBell} alt="" aria-hidden="true" className="h-6 w-6" />
      {unreadNotifications > 0 ? <span aria-hidden="true" className="absolute right-0 top-0 h-2.5 w-2.5 -translate-y-1/4 translate-x-1/4 rounded-full bg-[#ef4444] ring-2 ring-white" /> : null}
    </button>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex h-6 w-full items-center justify-between gap-3">
      <h2 className="min-w-0 flex-1 text-[14px] font-medium leading-5 tracking-[0] text-[#333333]">{title}</h2>
      <button type="button" className="flex shrink-0 items-center gap-[2px]" aria-label={`View all ${title.toLowerCase()}`}>
        <span className="text-[14px] font-medium leading-5 text-[#737373]">View&nbsp; all</span>
        <img src={iconChevronRight} alt="" aria-hidden="true" className="h-6 w-6" />
      </button>
    </div>
  );
}

function QuickActionCard({ action }: { action: QuickAction }) {
  const Icon = action.icon;
  return (
    <button
      type="button"
      className="relative flex h-[155px] w-[160px] shrink-0 overflow-hidden rounded-[12px] border border-black/10 bg-white p-4 text-left"
    >
      <span className="flex min-h-0 flex-1 flex-col gap-2 pr-4 pb-7">
        <span className="text-[14px] font-medium leading-5 tracking-[0] text-[#333333]">{action.title}</span>
        <span className="text-[12px] font-medium leading-4 tracking-[0] text-[#333333cc]">{action.description}</span>
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none"
        style={{
          position: "absolute",
          right: 12,
          bottom: 12,
          width: 24,
          height: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon
          strokeWidth={1.75}
          style={{
            width: 24,
            height: 24,
            color: "#457941",
            display: "block",
            position: "static",
            flexShrink: 0,
          }}
        />
      </span>
    </button>
  );
}

function ConversationRow({ conversation, compact }: { conversation: Conversation; compact?: boolean }) {
  return (
    <button
      type="button"
      className={`flex w-full items-center gap-4 overflow-hidden rounded-full border border-black/10 bg-white py-4 pl-6 pr-4 text-left ${
        compact ? "h-[70px]" : "h-[72px]"
      }`}
    >
      <span className="flex min-w-0 flex-1 flex-col justify-center">
        <span className="truncate text-[14px] font-medium leading-5 tracking-[0] text-[#333333]">{conversation.title}</span>
        <span className="mt-[2px] block truncate pr-4 text-[12px] font-medium leading-4 tracking-[0] text-[#333333cc]">{conversation.excerpt}</span>
      </span>
      <img src={iconChevronRight} alt="" aria-hidden="true" className="h-6 w-6 shrink-0" />
    </button>
  );
}

function SavedLogRow({ log }: { log: SavedLog }) {
  return (
    <button type="button" className="flex h-[72px] w-full items-center gap-4 overflow-hidden rounded-full border border-black/10 bg-white p-4 text-left">
      <span className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0fdf4cc] p-2">
          <img src={log.icon} alt="" aria-hidden="true" className="h-6 w-6" />
        </span>
        <span className="min-w-0 pr-4">
          <span className="block truncate text-[14px] font-medium leading-5 tracking-[0] text-[#333333]">{log.title}</span>
          <span className="flex items-center gap-[6px] text-[12px] font-normal leading-4 tracking-[0] text-[#333333cc]">
            <span className="truncate">{log.plant}</span>
            <span aria-hidden="true" className="h-1 w-1 shrink-0 rounded-full bg-[#333333cc]" />
            <span className="truncate">{log.topic}</span>
          </span>
        </span>
      </span>
      <img src={iconChevronRight} alt="" aria-hidden="true" className="h-6 w-6 shrink-0" />
    </button>
  );
}

export default function MyGrowMatePage() {
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

  const drawerItems: DrawerItem[] = getDrawerItems("MyGrowMate");

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
        <header className="client-header fixed left-0 right-0 top-0 z-30 flex h-[72px] w-full items-center justify-between border-b border-black/10 bg-white p-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              ref={menuTriggerRef}
              className="rounded-full border border-black/5 bg-[#f5f5f526] p-2 text-[#737373]"
              aria-label="Open menu"
              onClick={openDrawer}
            >
              <MenuIcon />
            </button>
            <h1 className="text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-[#31674c]">Global Gardeners</h1>
          </div>
          <BellButton unreadNotifications={unreadNotifications} onClick={() => router.push("/notifications")} />
        </header>

        <div className="flex w-full flex-col gap-16 px-4 pb-20 pt-[104px]">
          <section className="flex w-full flex-col">
            <div className="inline-flex h-6 w-fit items-center gap-1 rounded-full border border-black/5 bg-white px-2 py-1 text-[#9c793e]">
              <AiAssistantIcon />
              <span className="text-[12px] font-medium leading-4 tracking-[0]">AI Assistant</span>
            </div>
            <h2 className="mt-4 text-[30px] font-semibold leading-[30px] tracking-[-1px] text-[#182a17]">MyGrowMate</h2>
            <p className="mt-2 text-[16px] font-medium leading-6 tracking-[0] text-[#333333cc]">Smart plant care powered by conversation.</p>
            <button
              type="button"
              onClick={() => router.push("/my-grow-mate/chat")}
              className="mt-6 flex h-14 w-full items-center justify-center rounded-full bg-[#457941] text-[16px] font-medium leading-6 text-white"
            >
              Start Conversation
            </button>
          </section>

          <section className="flex w-full flex-col">
            <h2 className="text-[14px] font-medium leading-5 tracking-[0] text-[#333333]">Quick Actions</h2>
            <div className="-mx-4 mt-4 h-[155px] overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex w-max gap-3">
                {quickActions.map((action) => (
                  <QuickActionCard key={action.title} action={action} />
                ))}
              </div>
            </div>
          </section>

          <section className="flex w-full flex-col">
            <SectionHeader title="Recent Conversations" />
            <div className="mt-6 flex w-full flex-col gap-3 pt-3">
              {conversations.map((conversation, index) => (
                <ConversationRow key={`${conversation.title}-${index}`} conversation={conversation} compact={index === 0} />
              ))}
            </div>
          </section>

          <section className="flex w-full flex-col">
            <SectionHeader title="Your Saved Logs" />
            <div className="mt-6 flex w-full flex-col gap-3 pt-3">
              {savedLogs.map((log, index) => (
                <SavedLogRow key={`${log.title}-${log.plant}-${index}`} log={log} />
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
