"use client";

import useSWR from "swr";

export type NotificationsPayload = {
  notifications?: Array<{
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
  }>;
  unreadCount?: number;
};

export function useNotificationsData() {
  return useSWR<NotificationsPayload>("/api/notifications", {
    refreshInterval: 15_000,
  });
}

export function useDrawerProfileData() {
  return useSWR<{
    fullName?: string;
    nickname?: string;
    profilePhotoUrl?: string | null;
  }>("/api/profile/me", {
    dedupingInterval: 60_000,
  });
}

export function useFeedData() {
  return useSWR<{ posts?: unknown[] }>("/api/feed", {
    revalidateIfStale: true,
    dedupingInterval: 20_000,
  });
}

export function useOnboardingStatusData() {
  return useSWR<{
    pricingCompleted: boolean;
    interestsCompleted: boolean;
    firstPostCompleted: boolean;
    nextStep: "/feed" | "/pricing" | "/interests" | "/onboarding";
  }>("/api/profile/onboarding-status", {
    dedupingInterval: 30_000,
  });
}

export type PlantsPayload = {
  plants?: Array<{
    id: number;
    commonName: string;
    scientificName: string | null;
    coverPhotoUrl: string | null;
    createdAt: string;
  }>;
};

export function usePlantsData() {
  return useSWR<PlantsPayload>("/api/plants", {
    dedupingInterval: 20_000,
  });
}
