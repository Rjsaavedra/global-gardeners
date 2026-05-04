"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type NotificationItem = {
  id: string;
  name: string;
  time: string;
  message: string;
  type?: "follow" | "post_like" | "post_comment";
  actorUserId?: string;
  postId?: string;
  avatarUrl?: string;
  thumbnailUrl?: string;
  isGrowMate?: boolean;
  canFollowBack?: boolean;
  isRead?: boolean;
};

const emptyBellIcon = "/icons/notification-bell.svg";

function SproutIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6 text-[#457941]" fill="none" viewBox="0 0 24 24">
      <path
        d="M17.5469 3.32812C17.7348 3.32047 17.9187 3.38459 18.0615 3.50781C18.2044 3.63103 18.2954 3.80422 18.3164 3.98926C18.3432 4.22516 18.9558 9.80731 15.7754 12.9883C14.9895 13.7738 13.9214 14.2151 12.8105 14.2158C12.1238 14.2158 11.4532 14.0466 10.8535 13.7305C10.7682 13.8362 10.6795 13.9435 10.5879 14.0518C10.0877 14.6421 9.4999 15.2671 9.01953 15.7773C8.80053 16.0098 8.60376 16.2188 8.45508 16.3818C8.38074 16.4634 8.31895 16.5326 8.27051 16.5879C8.25787 16.6023 8.24646 16.6158 8.23633 16.6279V20.999C8.23633 21.4132 7.90055 21.749 7.48633 21.749C7.07212 21.749 6.73633 21.4132 6.73633 20.999V17.5781C6.34253 17.6044 5.9469 17.5525 5.57324 17.4258C5.08989 17.262 4.65134 16.9886 4.29199 16.6279C2.19081 14.5267 2.62565 10.956 2.65039 10.8047C2.70258 10.4853 2.95186 10.2359 3.27148 10.1836C3.42361 10.1588 6.99194 9.7246 9.09473 11.8262C9.62452 12.3555 9.96108 13.0122 10.0596 13.7119C10.0736 13.6975 10.0872 13.6834 10.1006 13.6699C10.6163 13.1545 11.2121 12.6486 11.7744 12.1865L11.9736 12.0234C11.6709 11.4285 11.5089 10.7708 11.5 10.1025C11.484 8.89871 11.9645 7.74092 12.8262 6.90039C16.0056 3.71977 17.5469 3.32812 17.5469 3.32812ZM16.8535 4.99512C16.2191 5.26903 15.1145 5.91685 13.8867 7.14453C13.3188 7.69838 13.002 8.46039 13.0127 9.19824C13.0146 9.32654 13.0273 9.45433 13.0508 9.58008L15.1934 7.4375C15.4863 7.14461 15.961 7.14461 16.2539 7.4375C16.5468 7.73039 16.5468 8.20516 16.2539 8.49805L14.1113 10.6406C14.2374 10.6646 14.3656 10.6773 14.4941 10.6797C15.2322 10.6903 15.9942 10.3733 16.5479 9.80566C17.7754 8.57826 17.9886 5.83398 16.8535 4.99512ZM8.08105 12.8867C7.20323 12.0084 5.69768 11.7041 4.72461 11.6025C4.73111 12.566 4.88961 14.1692 5.35254 15.0352C5.47577 15.2668 5.63197 15.4688 5.81738 15.6543C6.02913 15.8667 6.29439 16.0182 6.58594 16.0928C6.44578 15.5978 6.47259 15.0705 6.66113 14.5918C6.84739 14.1196 7.17733 13.7178 7.60449 13.4434C7.9529 13.2197 8.417 13.3212 8.64062 13.6699C8.86431 14.0183 8.7628 14.4824 8.41406 14.7061C8.26435 14.8023 8.14917 14.9429 8.08496 15.1084C8.02076 15.2739 8.01085 15.4554 8.05664 15.626C8.14258 15.9463 8.46777 16.126 8.78711 16.04C8.9555 15.995 9.1029 15.886 9.20508 15.7363C9.42206 15.3826 9.88417 15.2712 10.2373 15.4873C10.5908 15.7044 10.7024 16.1674 10.4863 16.5205C10.2177 16.9558 9.82095 17.2976 9.35059 17.5C9.18163 17.5727 9.00767 17.6253 8.83105 17.6582C8.51654 17.7167 8.19329 17.7114 7.87988 17.6426C7.9735 17.5389 8.08051 17.4202 8.2002 17.2891C8.34959 17.1252 8.54628 16.9169 8.76562 16.6836C9.24591 16.1737 9.82972 15.5538 10.3281 14.9658C11.1731 13.9687 11.9184 13.3438 12.7246 12.6836C11.9464 12.3287 10.8806 12.1242 9.94727 12.21C9.29153 12.2703 8.61926 12.4268 8.08105 12.8867Z"
        fill="currentColor"
      />
    </svg>
  );
}

function NotificationMedia({ item }: { item: NotificationItem }) {
  if (item.isGrowMate) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
        <SproutIcon />
      </div>
    );
  }

  if (item.thumbnailUrl) {
    return <Image alt="" src={item.thumbnailUrl} width={40} height={40} unoptimized className="h-10 w-10 rounded-lg object-cover" />;
  }

  if (!item.avatarUrl) {
    const initials = item.name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "GG";
    return (
      <div aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e7e0d2] text-[12px] font-semibold text-[#5e5a50]">
        {initials}
      </div>
    );
  }

  return (
    <Image
      alt=""
      src={item.avatarUrl}
      width={40}
      height={40}
      unoptimized
      className="h-10 w-10 rounded-full object-cover"
    />
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [followBackPendingIds, setFollowBackPendingIds] = useState<string[]>([]);
  const [followedActorIds, setFollowedActorIds] = useState<string[]>([]);
  const hasNotifications = notifications.length > 0;

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setErrorMessage(null);
        const response = await fetch("/api/notifications", { method: "GET", cache: "no-store" });
        const payload = (await response.json()) as {
          error?: string;
          notifications?: NotificationItem[];
        };

        if (!response.ok || !payload.notifications) {
          throw new Error(payload.error ?? "Unable to load notifications.");
        }
        setNotifications(payload.notifications);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load notifications.";
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadNotifications();
  }, []);

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.isRead) {
      setNotifications((current) => current.map((entry) => (entry.id === item.id ? { ...entry, isRead: true } : entry)));
      void fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: item.id }),
      });
    }

    if (item.postId) {
      const openComments = item.type === "post_comment" ? "&openComments=1" : "";
      router.push(`/feed?postId=${encodeURIComponent(item.postId)}${openComments}`);
      return;
    }
    if (item.type === "follow" && item.actorUserId) {
      router.push("/feed");
    }
  };

  const handleFollowBack = async (item: NotificationItem) => {
    if (!item.actorUserId || followBackPendingIds.includes(item.id) || followedActorIds.includes(item.actorUserId)) {
      return;
    }

    setFollowBackPendingIds((current) => [...current, item.id]);
    try {
      const response = await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: item.actorUserId }),
      });
      if (response.ok) {
        setFollowedActorIds((current) => [...current, item.actorUserId as string]);
      }
    } finally {
      setFollowBackPendingIds((current) => current.filter((id) => id !== item.id));
    }
  };

  return (
    <main className="client-main min-h-screen bg-[radial-gradient(circle_at_top,_#fffdf7_0%,_#f8f6f1_50%,_#efe9dc_100%)] px-0 text-[#182a17]">
      <section className="client-shell relative flex min-h-screen w-full flex-col overflow-x-hidden border border-[#e7e0d2] bg-[#f8f6f1] shadow-[0_24px_80px_rgba(56,71,45,0.12)]">
        <header className="client-header fixed left-0 right-0 top-0 z-30 flex w-full items-center border-b border-black/10 bg-white p-4">
          <button type="button" aria-label="Back" className="inline-flex h-10 w-10 items-center justify-center transition" onClick={() => router.back()}>
            <Image src="/icons/back-button.svg" alt="" aria-hidden="true" width={40} height={40} className="h-10 w-10" />
          </button>
          <div className="flex min-w-0 flex-1 items-center justify-center pr-10">
            <h1 className="text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-[#457941]">Notifications</h1>
          </div>
        </header>

        {isLoading ? (
          <div className="px-4 pb-8 pt-[92px] text-[14px] text-[#5c5c5c]">Loading notifications...</div>
        ) : errorMessage ? (
          <div className="px-4 pb-8 pt-[92px] text-[14px] text-[#b42318]">{errorMessage}</div>
        ) : hasNotifications ? (
          <div className="flex flex-col gap-2 px-4 pb-8 pt-[92px]">
            {notifications.map((item) => (
              <article
                key={item.id}
                className={`flex items-center gap-3 py-3 ${item.postId || item.type === "follow" ? "cursor-pointer" : ""}`}
                onClick={() => handleNotificationClick(item)}
              >
                <NotificationMedia item={item} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[14px] font-semibold leading-5 text-[#333333]">{item.name}</p>
                    <p className="shrink-0 text-[14px] leading-5 text-[#333333cc]">{item.time}</p>
                    {!item.isRead ? <span className="h-2 w-2 shrink-0 rounded-full bg-[#457941]" /> : null}
                  </div>
                  <p className="truncate text-[14px] font-medium leading-5 text-[#333333cc]">{item.message}</p>
                </div>
                {item.canFollowBack ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleFollowBack(item);
                    }}
                    disabled={!item.actorUserId || followBackPendingIds.includes(item.id) || followedActorIds.includes(item.actorUserId)}
                    className="shrink-0 rounded-lg bg-[#171717] px-3 py-2 text-[12px] font-semibold leading-4 text-[#fafafa]"
                  >
                    {item.actorUserId && followedActorIds.includes(item.actorUserId)
                      ? "Following"
                      : followBackPendingIds.includes(item.id)
                        ? "Following..."
                        : "Follow back"}
                  </button>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 pt-[73px]">
            <div className="w-full max-w-[358px] text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fefce8] p-3">
                <Image alt="" src={emptyBellIcon} width={40} height={40} unoptimized />
              </div>
              <h2 className="mt-4 text-[20px] font-semibold leading-6 text-[#333333]">No notifications yet</h2>
              <p className="mt-2 text-[14px] font-medium leading-5 text-[#333333cc]">
                Likes, comments, follows, and plant updates will appear here.
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
