"use client";

import Image from "next/image";
import { ReactNode, RefObject } from "react";

export type DrawerItem = {
  label: string;
  active?: boolean;
  icon: ReactNode;
};

export type DrawerProfile = {
  fullName: string;
  nickname: string;
  profilePhotoUrl: string | null;
};

type SideDrawerProps = {
  drawerRef: RefObject<HTMLElement | null>;
  isLoggingOut: boolean;
  isVisible: boolean;
  items: DrawerItem[];
  onClose: () => void;
  onCreatePost: () => void;
  onLogout: () => void;
  onOpenProfile: () => void;
  onOpenStream?: () => void;
  onSelectItem?: (item: DrawerItem) => void;
  profile: DrawerProfile;
};

function getInitials(fullName: string) {
  const trimmedName = fullName.trim();
  if (!trimmedName) {
    return "GG";
  }

  const [first = "", second = ""] = trimmedName.split(/\s+/);
  return `${first[0] ?? ""}${second[0] ?? first[1] ?? ""}`.toUpperCase();
}

function DrawerCloseIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.75" />
    </svg>
  );
}

function DrawerLogoutIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path
        d="M15.4697 6.46973C15.7626 6.17683 16.2374 6.17683 16.5303 6.46973L21.5303 11.4697C21.8232 11.7626 21.8232 12.2374 21.5303 12.5303L16.5303 17.5303C16.2374 17.8232 15.7626 17.8232 15.4697 17.5303C15.1768 17.2374 15.1768 16.7626 15.4697 16.4697L19.9395 12L15.4697 7.53027C15.1768 7.23738 15.1768 6.76262 15.4697 6.46973Z"
        fill="currentColor"
      />
      <path
        d="M21 11.25C21.4142 11.25 21.75 11.5858 21.75 12C21.75 12.4142 21.4142 12.75 21 12.75H9C8.58579 12.75 8.25 12.4142 8.25 12C8.25 11.5858 8.58579 11.25 9 11.25H21Z"
        fill="currentColor"
      />
      <path
        d="M2.25 19V5C2.25 4.27065 2.53994 3.57139 3.05566 3.05566C3.57139 2.53994 4.27065 2.25 5 2.25H9C9.41421 2.25 9.75 2.58579 9.75 3C9.75 3.41421 9.41421 3.75 9 3.75H5C4.66848 3.75 4.35063 3.88179 4.11621 4.11621C3.88179 4.35063 3.75 4.66848 3.75 5V19C3.75 19.3315 3.88179 19.6494 4.11621 19.8838C4.35063 20.1182 4.66848 20.25 5 20.25H9C9.41421 20.25 9.75 20.5858 9.75 21C9.75 21.4142 9.41421 21.75 9 21.75H5C4.27065 21.75 3.57139 21.4601 3.05566 20.9443C2.53994 20.4286 2.25 19.7293 2.25 19Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SideDrawer({
  drawerRef,
  isLoggingOut,
  isVisible,
  items,
  onClose,
  onCreatePost,
  onLogout,
  onOpenProfile,
  onOpenStream,
  onSelectItem,
  profile,
}: SideDrawerProps) {
  return (
    <div className="fixed inset-0 z-40 flex h-screen w-full sm:mx-auto sm:max-w-[390px]" aria-hidden={!isVisible}>
      <div className="relative h-screen w-full">
        <button
          type="button"
          className={`absolute inset-0 bg-[#0a0d12] transition-opacity duration-300 ${isVisible ? "opacity-70" : "opacity-0"}`}
          aria-label="Close menu"
          onClick={onClose}
        />

        <div className="pointer-events-none absolute inset-y-0 left-0 flex">
          <aside
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="menu-drawer-title"
            className={`pointer-events-auto relative z-10 flex h-screen w-[calc(100%-64px)] min-w-[326px] max-w-[326px] flex-col bg-white p-4 shadow-[0_20px_24px_rgba(10,13,18,0.08),0_8px_8px_rgba(10,13,18,0.03),0_3px_3px_rgba(10,13,18,0.04)] transition-transform duration-300 ${
              isVisible ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="rounded-full bg-[#f5f5f5] p-2 text-[#737373]"
                  aria-label="Close menu"
                  onClick={onClose}
                >
                  <DrawerCloseIcon />
                </button>
                <p id="menu-drawer-title" className="text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-[#31674c]">
                  Global Gardeners
                </p>
              </div>

              <button type="button" onClick={onOpenProfile} className="mt-14 flex items-center gap-3 text-left" aria-label="Open your profile">
                {profile.profilePhotoUrl ? (
                  <Image
                    alt={profile.fullName}
                    className="h-12 w-12 rounded-full object-cover"
                    height={48}
                    loader={({ src }) => src}
                    src={profile.profilePhotoUrl}
                    unoptimized
                    width={48}
                  />
                ) : (
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#31674c] text-[16px] font-semibold text-[#fafafa]">
                    {getInitials(profile.fullName)}
                  </div>
                )}
                <div>
                  <p className="text-[16px] font-semibold leading-6 text-black">{profile.fullName}</p>
                  <p className="mt-1 text-[14px] font-medium leading-5 text-[#525252]">{profile.nickname}</p>
                </div>
              </button>

              <nav className="mt-8 flex flex-col gap-1">
                {items.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      if (onSelectItem) {
                        onSelectItem(item);
                        return;
                      }
                      if (item.label === "Stream" && onOpenStream) {
                        onOpenStream();
                      }
                    }}
                    className={`flex h-[52px] items-center gap-4 rounded-[100px] px-4 text-left text-[16px] font-medium leading-6 ${
                      item.active ? "bg-[#f8fafc] text-[#457941]" : "text-[#333333cc]"
                    }`}
                  >
                    <span className="h-6 w-6 shrink-0">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>

              <button
                type="button"
                onClick={onCreatePost}
                className="mt-8 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#171717] text-[14px] font-medium leading-5 text-[#fafafa]"
              >
                <span className="text-[22px] leading-none">+</span>
                <span>Create Post</span>
              </button>

              <button
                type="button"
                onClick={onLogout}
                disabled={isLoggingOut}
                className="mt-auto mb-2 inline-flex h-[52px] items-center gap-4 rounded-full px-4 text-[16px] font-medium leading-6 text-[#dc2626]"
              >
                <DrawerLogoutIcon />
                <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
