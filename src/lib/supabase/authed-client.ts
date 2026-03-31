import { createClient } from "@supabase/supabase-js";

const configuredSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const configuredSupabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!configuredSupabaseUrl || !configuredSupabasePublishableKey) {
  throw new Error("Missing Supabase environment variables.");
}
const supabaseUrl: string = configuredSupabaseUrl;
const supabasePublishableKey: string = configuredSupabasePublishableKey;

export function createAuthedSupabaseClient(accessToken: string) {
  return createClient(supabaseUrl, supabasePublishableKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export function getAccessTokenFromCookieHeader(cookieHeader: string | null): string | null {
  const accessCookie = cookieHeader
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith("gg_access_token="));
  const raw = accessCookie ? accessCookie.slice("gg_access_token=".length) : null;

  return raw ? decodeURIComponent(raw) : null;
}
