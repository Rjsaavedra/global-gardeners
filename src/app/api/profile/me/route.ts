import { NextResponse } from "next/server";
import { createAuthedSupabaseClient } from "@/lib/supabase/authed-client";
import { resolveAuthenticatedRequest } from "@/lib/supabase/request-session";

function toNickname(fullName: string) {
  const normalized = fullName.trim().replace(/\s+/g, "").toLowerCase();
  return normalized ? `@${normalized}` : "";
}

function toSafeNickname(username: string, fallbackFullName: string) {
  const normalized = username
    .trim()
    .replace(/^@+/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .slice(0, 32)
    .toLowerCase();
  if (!normalized) return toNickname(fallbackFullName);
  return `@${normalized}`;
}

function extensionFromFileName(fileName: string) {
  const fromName = fileName.split(".").pop()?.trim().toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName;
  return "jpg";
}

async function fileToDataUrl(file: File) {
  const mimeType = file.type && file.type.trim() ? file.type : "image/jpeg";
  const bytes = Buffer.from(await file.arrayBuffer());
  return `data:${mimeType};base64,${bytes.toString("base64")}`;
}

async function getOrCreateProfile(request: Request) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) return null;

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return { auth, supabase, errorResponse: NextResponse.json({ error: "Unable to resolve authenticated user." }, { status: 400 }) };
  }

  const metadataName =
    typeof authData.user.user_metadata?.full_name === "string" ? authData.user.user_metadata.full_name.trim() : "";
  const emailName = authData.user.email?.split("@")[0]?.trim() ?? "";
  const fallbackFullName = metadataName || emailName || "Global Gardener";

  const { data, error } = await supabase.from("profiles").select("*").eq("user_id", auth.userId).single();

  if (error && error.code !== "PGRST116") {
    return { auth, supabase, errorResponse: NextResponse.json({ error: error.message }, { status: 400 }) };
  }

  let profile = data;
  if (!profile) {
    const { data: inserted, error: insertError } = await supabase
      .from("profiles")
      .insert({
        user_id: auth.userId,
        full_name: fallbackFullName,
      })
      .select("*")
      .single();

    if (insertError) {
      return { auth, supabase, errorResponse: NextResponse.json({ error: insertError.message }, { status: 400 }) };
    }
    profile = inserted;
  }

  return { auth, supabase, profile, fallbackFullName };
}

export async function GET(request: Request) {
  const context = await getOrCreateProfile(request);
  if (!context) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if ("errorResponse" in context && context.errorResponse) return context.errorResponse;

  const { auth, profile, fallbackFullName } = context;

  const fullNameValue = typeof profile.full_name === "string" ? profile.full_name : "";
  const nicknameValue = typeof profile.nickname === "string" ? profile.nickname : "";
  const photoValue = typeof profile.profile_photo_url === "string" ? profile.profile_photo_url : null;

  const normalizedFullName = fullNameValue.trim() || fallbackFullName;
  const normalizedNickname = nicknameValue.trim() || toNickname(normalizedFullName);

  const response = NextResponse.json({
    fullName: normalizedFullName,
    nickname: normalizedNickname,
    profilePhotoUrl: photoValue,
  });
  auth.applyRefreshedCookies(response);
  return response;
}

export async function PATCH(request: Request) {
  const context = await getOrCreateProfile(request);
  if (!context) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if ("errorResponse" in context && context.errorResponse) return context.errorResponse;

  const { auth, supabase, profile, fallbackFullName } = context;

  const form = await request.formData();
  const rawFullName = String(form.get("fullName") ?? "").trim();
  const rawUsername = String(form.get("username") ?? "").trim();
  const photo = form.get("photo");

  const nextFullName = rawFullName || (typeof profile.full_name === "string" && profile.full_name.trim()) || fallbackFullName;
  const nextNickname = toSafeNickname(rawUsername, nextFullName);

  const { data: similarNameRows, error: similarNameError } = await supabase
    .from("profiles")
    .select("full_name")
    .neq("user_id", auth.userId)
    .ilike("full_name", `%${nextFullName}%`)
    .limit(5);

  if (similarNameError) {
    return NextResponse.json({ error: similarNameError.message }, { status: 400 });
  }

  const similarNames = (similarNameRows ?? [])
    .map((row) => (typeof row.full_name === "string" ? row.full_name.trim() : ""))
    .filter(Boolean);

  if (similarNames.length > 0) {
    return NextResponse.json(
      { error: "A similar name already exists. Please choose a different name.", similarNames },
      { status: 409 },
    );
  }

  let nextPhotoUrl: string | null = typeof profile.profile_photo_url === "string" ? profile.profile_photo_url : null;

  if (photo instanceof File && photo.size > 0) {
    const allowedTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]);
    if (!allowedTypes.has(photo.type)) {
      return NextResponse.json({ error: "Unsupported image format. Please use JPG, PNG, WEBP, or GIF." }, { status: 400 });
    }

    const extension = extensionFromFileName(photo.name);
    const objectPath = `${auth.userId}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
    const bucketName = process.env.SUPABASE_PROFILE_PHOTOS_BUCKET || "profile-photos";

    const { error: uploadError } = await supabase.storage.from(bucketName).upload(objectPath, photo, {
      contentType: photo.type || "image/jpeg",
      upsert: true,
    });

    if (uploadError) {
      // Fallback: if storage bucket is not provisioned, still persist the photo for now.
      if (/bucket.*not\s+found/i.test(uploadError.message)) {
        nextPhotoUrl = await fileToDataUrl(photo);
      } else {
        return NextResponse.json({ error: uploadError.message }, { status: 400 });
      }
    } else {
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucketName).getPublicUrl(objectPath);
      nextPhotoUrl = publicUrl || null;
    }
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      full_name: nextFullName,
      nickname: nextNickname,
      profile_photo_url: nextPhotoUrl,
    })
    .eq("user_id", auth.userId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  const response = NextResponse.json({
    fullName: nextFullName,
    nickname: nextNickname,
    profilePhotoUrl: nextPhotoUrl,
  });
  auth.applyRefreshedCookies(response);
  return response;
}
