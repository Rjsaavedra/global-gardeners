import { createClient } from "@supabase/supabase-js";

const configuredSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const configuredSupabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!configuredSupabaseUrl || !configuredSupabasePublishableKey) {
  throw new Error("Missing Supabase environment variables.");
}
const supabaseUrl: string = configuredSupabaseUrl;
const supabasePublishableKey: string = configuredSupabasePublishableKey;

export function createSupabaseServerClient() {
  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
