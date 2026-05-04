import { NextResponse } from "next/server";
import { createAuthedSupabaseClient } from "@/lib/supabase/authed-client";
import { resolveAuthenticatedRequest } from "@/lib/supabase/request-session";

type NotificationPreferenceMap = Record<string, boolean>;

const defaultNotificationPreferences: NotificationPreferenceMap = {
  watering: true,
  fertilizing: false,
  repotting: false,
  "care-suggestions": true,
  "care-follow-ups": true,
  "new-followers": true,
  likes: true,
  comments: true,
  push: true,
  email: false,
};

function sanitizeNotificationPreferences(value: unknown): NotificationPreferenceMap {
  if (!value || typeof value !== "object") {
    return {};
  }

  const source = value as Record<string, unknown>;
  const sanitized: NotificationPreferenceMap = {};
  for (const [key, raw] of Object.entries(source)) {
    if (typeof raw === "boolean") {
      sanitized[key] = raw;
    }
  }
  return sanitized;
}

export async function GET(request: Request) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { data, error } = await supabase.from("profiles").select("user_settings").eq("user_id", auth.userId).single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const settings = (data?.user_settings ?? {}) as Record<string, unknown>;
  const persisted = sanitizeNotificationPreferences(
    (settings.notifications ?? {}) as unknown,
  );
  const notificationPreferences = {
    ...defaultNotificationPreferences,
    ...persisted,
  };

  const response = NextResponse.json({ notificationPreferences });
  auth.applyRefreshedCookies(response);
  return response;
}

export async function POST(request: Request) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as { notificationPreferences?: unknown };
  const patch = sanitizeNotificationPreferences(body.notificationPreferences);

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { data, error } = await supabase.from("profiles").select("user_settings").eq("user_id", auth.userId).single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const existingSettings = (data?.user_settings ?? {}) as Record<string, unknown>;
  const existingNotifications = sanitizeNotificationPreferences(
    (existingSettings.notifications ?? {}) as unknown,
  );

  const notificationPreferences = {
    ...defaultNotificationPreferences,
    ...existingNotifications,
    ...patch,
  };

  const userSettings = {
    ...existingSettings,
    notifications: notificationPreferences,
  };

  const { error: updateError } = await supabase.from("profiles").update({ user_settings: userSettings }).eq("user_id", auth.userId);
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  const response = NextResponse.json({ notificationPreferences });
  auth.applyRefreshedCookies(response);
  return response;
}

