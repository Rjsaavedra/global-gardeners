import { NextResponse } from "next/server";

type IdentifyRequestBody = {
  imageDataUrl?: string;
};

type Candidate = {
  commonName: string;
  scientificName: string;
  confidence: number;
  sources: string[];
  imageUrls: string[];
};

type IdentifyResponse = {
  candidates: Candidate[];
  consensusStatus: "confirmed" | "needs_review" | "no_match";
};

const MIN_CONFIDENCE_FOR_CONFIRMATION = 0.75;
const COMMON_NAME_ALIASES: Record<string, string> = {
  "coleus amboinicus": "Oregano",
};

function parseDataUrl(dataUrl: string): { mimeType: string; base64Data: string } | null {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  return { mimeType: match[1], base64Data: match[2] };
}

function normalizeName(value: string | null | undefined): string {
  return (value ?? "").trim().replace(/\s+/g, " ");
}

function titleFromScientific(scientificName: string): string {
  const base = scientificName.split(" ").slice(0, 2).join(" ").trim();
  if (!base) return "Unknown plant";
  return base
    .split(" ")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1).toLowerCase() : part))
    .join(" ");
}

function resolveCommonName(scientificName: string, candidates: Array<string | null | undefined>): string {
  const normalizedScientific = normalizeName(scientificName);
  const scientificLower = normalizedScientific.toLowerCase();
  for (const candidate of candidates) {
    const normalizedCandidate = normalizeName(candidate);
    if (!normalizedCandidate) continue;
    if (normalizedCandidate.toLowerCase() !== scientificLower) return normalizedCandidate;
  }
  const alias = COMMON_NAME_ALIASES[scientificLower];
  if (alias) return alias;
  return titleFromScientific(normalizedScientific);
}

async function identifyWithPlantId(parsed: { mimeType: string; base64Data: string }): Promise<Candidate[]> {
  const apiKey = process.env.PLANT_ID_API_KEY;
  if (!apiKey) return [];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch("https://api.plant.id/v3/identification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": apiKey,
      },
      body: JSON.stringify({
        images: [parsed.base64Data],
        similar_images: true,
      }),
      signal: controller.signal,
    });

    if (!response.ok) return [];

    const payload = (await response.json()) as {
      result?: {
        classification?: {
          suggestions?: Array<{
            name?: string;
            probability?: number;
            details?: { common_names?: string[] };
            similar_images?: Array<{ url?: string }>;
          }>;
        };
      };
    };

    const suggestions = payload.result?.classification?.suggestions ?? [];

    return suggestions
      .slice(0, 5)
      .map((item) => {
        const scientificName = normalizeName(item.name);
        const commonName = resolveCommonName(scientificName, item.details?.common_names ?? []);
        const confidence = typeof item.probability === "number" ? item.probability : 0;
        if (!scientificName && !commonName) return null;
        return {
          commonName: commonName || "Unknown plant",
          scientificName: scientificName || commonName || "Unknown species",
          confidence: Math.max(0, Math.min(1, confidence)),
          sources: ["plant.id"],
          imageUrls: (item.similar_images ?? [])
            .map((image) => normalizeName(image.url))
            .filter((url) => /^https?:\/\//i.test(url))
            .slice(0, 5),
        } satisfies Candidate;
      })
      .filter((item): item is Candidate => Boolean(item));
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

async function identifyWithPlantNet(parsed: { mimeType: string; base64Data: string }): Promise<Candidate[]> {
  const apiKey = process.env.PLANTNET_API_KEY;
  if (!apiKey) return [];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const body = new FormData();
    body.append("images", new Blob([Buffer.from(parsed.base64Data, "base64")], { type: parsed.mimeType }), "plant.jpg");
    body.append("organs", "leaf");

    const response = await fetch(`https://my-api.plantnet.org/v2/identify/all?api-key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      body,
      signal: controller.signal,
    });

    if (!response.ok) return [];

    const payload = (await response.json()) as {
      results?: Array<{
        score?: number;
        species?: {
          scientificNameWithoutAuthor?: string;
          commonNames?: string[];
          images?: Array<{ url?: { o?: string; m?: string; s?: string } }>;
        };
      }>;
    };

    return (payload.results ?? [])
      .slice(0, 5)
      .map((item) => {
        const scientificName = normalizeName(item.species?.scientificNameWithoutAuthor);
        const commonName = resolveCommonName(scientificName, item.species?.commonNames ?? []);
        const confidence = typeof item.score === "number" ? item.score : 0;
        if (!scientificName && !commonName) return null;
        return {
          commonName: commonName || "Unknown plant",
          scientificName: scientificName || commonName || "Unknown species",
          confidence: Math.max(0, Math.min(1, confidence)),
          sources: ["plantnet"],
          imageUrls: (item.species?.images ?? [])
            .map((image) => normalizeName(image.url?.o || image.url?.m || image.url?.s))
            .filter((url) => /^https?:\/\//i.test(url))
            .slice(0, 5),
        } satisfies Candidate;
      })
      .filter((item): item is Candidate => Boolean(item));
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

function mergeCandidates(primary: Candidate[], secondary: Candidate[]): Candidate[] {
  const map = new Map<string, Candidate>();

  for (const candidate of [...primary, ...secondary]) {
    const key = normalizeName(candidate.scientificName || candidate.commonName).toLowerCase();
    if (!key) continue;

    const existing = map.get(key);
    if (!existing) {
      map.set(key, candidate);
      continue;
    }

    map.set(key, {
      commonName: existing.commonName.length >= candidate.commonName.length ? existing.commonName : candidate.commonName,
      scientificName: existing.scientificName.length >= candidate.scientificName.length ? existing.scientificName : candidate.scientificName,
      confidence: Math.max(existing.confidence, candidate.confidence),
      sources: Array.from(new Set([...existing.sources, ...candidate.sources])),
      imageUrls: Array.from(new Set([...existing.imageUrls, ...candidate.imageUrls])).slice(0, 5),
    });
  }

  return Array.from(map.values()).sort((a, b) => b.confidence - a.confidence).slice(0, 5);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as IdentifyRequestBody | null;
  const imageDataUrl = body?.imageDataUrl?.trim() ?? "";
  if (!imageDataUrl) {
    return NextResponse.json({ error: "Image is required." }, { status: 400 });
  }

  const parsed = parseDataUrl(imageDataUrl);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid image format." }, { status: 400 });
  }

  const approxBytes = Math.ceil((parsed.base64Data.length * 3) / 4);
  if (approxBytes > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Image is too large." }, { status: 413 });
  }

  const primary = await identifyWithPlantId(parsed);
  const topPrimary = primary[0];

  let secondary: Candidate[] = [];
  const shouldCrossCheck = !topPrimary || topPrimary.confidence < MIN_CONFIDENCE_FOR_CONFIRMATION;
  if (shouldCrossCheck) {
    secondary = await identifyWithPlantNet(parsed);
  }

  const merged = mergeCandidates(primary, secondary);
  const top = merged[0];

  const response: IdentifyResponse = {
    candidates: merged,
    consensusStatus: !top ? "no_match" : top.confidence >= MIN_CONFIDENCE_FOR_CONFIRMATION ? "confirmed" : "needs_review",
  };

  return NextResponse.json(response);
}
