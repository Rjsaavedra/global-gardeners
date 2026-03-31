import type { NextResponse } from "next/server";
import { createAuthedSupabaseClient, getAccessTokenFromCookieHeader } from "@/lib/supabase/authed-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { setAuthCookies } from "@/lib/supabase/auth-cookies";

type AuthenticatedRequestContext = {
  accessToken: string;
  userId: string;
  applyRefreshedCookies: (response: NextResponse) => void;
};

function getCookieValue(cookieHeader: string | null, name: string) {
  const match = cookieHeader
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`));

  return match ? match.slice(name.length + 1) : undefined;
}

export async function resolveAuthenticatedRequest(
  request: Request,
): Promise<AuthenticatedRequestContext | null> {
  const cookieHeader = request.headers.get("cookie");
  const accessToken = getAccessTokenFromCookieHeader(cookieHeader);
  const refreshTokenRaw = getCookieValue(cookieHeader, "gg_refresh_token");
  const persistentRaw = getCookieValue(cookieHeader, "gg_persistent");
  const persistent = persistentRaw === "1";
  const refreshToken = refreshTokenRaw ? decodeURIComponent(refreshTokenRaw) : null;

  if (accessToken) {
    const supabase = createAuthedSupabaseClient(accessToken);
    const { data } = await supabase.auth.getUser();
    if (data.user?.id) {
      return {
        accessToken,
        userId: data.user.id,
        applyRefreshedCookies: () => {},
      };
    }
  }

  if (!refreshToken) {
    return null;
  }

  const supabaseServer = createSupabaseServerClient();
  const { data, error } = await supabaseServer.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data.session || !data.user) {
    return null;
  }
  const session = data.session;
  const user = data.user;

  return {
    accessToken: session.access_token,
    userId: user.id,
    applyRefreshedCookies: (response) => {
      setAuthCookies(response, session, { persistent });
    },
  };
}
