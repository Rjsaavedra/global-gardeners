import { createAuthedSupabaseClient } from "@/lib/supabase/authed-client";

export type OnboardingStatus = {
  pricingCompleted: boolean;
  interestsCompleted: boolean;
  firstPostCompleted: boolean;
  fullNameCompleted: boolean;
  profilePhotoCompleted: boolean;
  nicknameCompleted: boolean;
  dismissedAt: string | null;
  completedAt: string | null;
  checklist: Array<{ key: string; label: string; done: boolean }>;
  percent: number;
  nextStep: "/feed" | "/pricing" | "/interests" | "/onboarding";
};

export async function getOnboardingStatus(accessToken: string): Promise<OnboardingStatus> {
  const supabase = createAuthedSupabaseClient(accessToken);
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  if (!userId) {
    return {
      pricingCompleted: false,
      interestsCompleted: false,
      firstPostCompleted: false,
      fullNameCompleted: false,
      profilePhotoCompleted: false,
      nicknameCompleted: false,
      dismissedAt: null,
      completedAt: null,
      checklist: [],
      percent: 0,
      nextStep: "/pricing",
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_selected_at, interests, full_name, nickname, profile_photo_url, user_settings")
    .eq("user_id", userId)
    .single();

  const [{ count: postCount }, { count: plantCount }] = await Promise.all([
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("plants").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("is_archived", false),
  ]);

  const interests = Array.isArray(profile?.interests) ? profile.interests : [];
  const pricingCompleted = Boolean(profile?.subscription_selected_at);
  const interestsCompleted = interests.length >= 3;
  const firstPostCompleted = (postCount ?? 0) > 0;
  const fullNameCompleted = Boolean(profile?.full_name && String(profile.full_name).trim().length > 0);
  const profilePhotoCompleted = Boolean(profile?.profile_photo_url && String(profile.profile_photo_url).trim().length > 0);
  const nicknameCompleted = Boolean(profile?.nickname && String(profile.nickname).trim().length > 0);

  const setupState =
    profile?.user_settings && typeof profile.user_settings === "object"
      ? (profile.user_settings as { profileSetup?: { dismissedAt?: string | null; completedAt?: string | null } }).profileSetup
      : undefined;
  const dismissedAt = typeof setupState?.dismissedAt === "string" ? setupState.dismissedAt : null;
  let completedAt = typeof setupState?.completedAt === "string" ? setupState.completedAt : null;

  const addFirstPlantCompleted = (plantCount ?? 0) > 0;
  const checklist = [
    { key: "personalize_experience", label: "Personalize your experience", done: pricingCompleted },
    { key: "add_first_plant", label: "Add your first plant", done: addFirstPlantCompleted },
    { key: "create_first_post", label: "Create your first post", done: firstPostCompleted },
    { key: "select_interests", label: "Select your interests", done: interestsCompleted },
  ];
  const doneCount = checklist.filter((item) => item.done).length;
  const percent = checklist.length ? Math.round((doneCount / checklist.length) * 100) : 0;
  const fullyComplete = doneCount === checklist.length;

  if (fullyComplete && !completedAt) {
    completedAt = new Date().toISOString();
    const existingSettings =
      profile?.user_settings && typeof profile.user_settings === "object"
        ? (profile.user_settings as Record<string, unknown>)
        : {};
    const existingSetup =
      existingSettings.profileSetup && typeof existingSettings.profileSetup === "object"
        ? (existingSettings.profileSetup as Record<string, unknown>)
        : {};
    const mergedSettings = {
      ...existingSettings,
      profileSetup: {
        ...existingSetup,
        completedAt,
      },
    };
    await supabase.from("profiles").update({ user_settings: mergedSettings }).eq("user_id", userId);
  }

  if (!pricingCompleted) {
    return { pricingCompleted, interestsCompleted, firstPostCompleted, fullNameCompleted, profilePhotoCompleted, nicknameCompleted, dismissedAt, completedAt, checklist, percent, nextStep: "/pricing" };
  }
  if (!interestsCompleted) {
    return { pricingCompleted, interestsCompleted, firstPostCompleted, fullNameCompleted, profilePhotoCompleted, nicknameCompleted, dismissedAt, completedAt, checklist, percent, nextStep: "/interests" };
  }
  if (!firstPostCompleted) {
    return { pricingCompleted, interestsCompleted, firstPostCompleted, fullNameCompleted, profilePhotoCompleted, nicknameCompleted, dismissedAt, completedAt, checklist, percent, nextStep: "/onboarding" };
  }
  return { pricingCompleted, interestsCompleted, firstPostCompleted, fullNameCompleted, profilePhotoCompleted, nicknameCompleted, dismissedAt, completedAt, checklist, percent, nextStep: "/feed" };
}
