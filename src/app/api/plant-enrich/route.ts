import { NextResponse } from "next/server";

type EnrichBody = {
  commonName?: string;
  scientificName?: string;
};

type CareSection = { title: string; content: string };

type EnrichResponse = {
  commonName: string;
  scientificName: string;
  description: string;
  light: string;
  water: string;
  temperature: string;
  humidity: string;
  careSections: CareSection[];
};

const DEFAULT_RESPONSE: EnrichResponse = {
  commonName: "Unknown plant",
  scientificName: "Unknown species",
  description: "Care data provider is rate-limited, retry in a minute.",
  light: "Medium Light",
  water: "Every 5 days",
  temperature: "65 deg - 75 deg",
  humidity: "70%",
  careSections: [
    { title: "Watering & Moisture", content: "Keep soil lightly moist and avoid complete dry-out." },
    { title: "Light", content: "Provide bright, indirect light and avoid harsh midday direct sun." },
    { title: "Temperature", content: "Best growth occurs in warm, stable indoor temperatures." },
    { title: "Humidity", content: "Prefers moderate-to-high humidity, especially in dry climates." },
    { title: "Soil", content: "Use airy, moisture-retentive soil with good drainage." },
  ],
};

const CACHE_TTL_MS = 5 * 60 * 1000;
const enrichCache = new Map<string, { expiresAt: number; value: EnrichResponse }>();

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function buildSimpleCarePlan(input: { light: string; water: string; temperature: string; humidity: string }): string {
  return [
    `1. Place in ${input.light || "bright, indirect light"}.`,
    `2. Water ${input.water || "when the top inch of soil starts to dry"}, and avoid soggy soil.`,
    `3. Keep temperature around ${input.temperature || "18-24 deg C"} and avoid sudden drafts.`,
    `4. Maintain humidity near ${input.humidity || "60-80%"}; use a pebble tray or humidifier if needed.`,
    "5. Remove yellowing leaves and check weekly for pests.",
  ].join("\n");
}

function buildExpandedSectionContent(input: { light: string; water: string; temperature: string; humidity: string; weatherNote: string }) {
  return {
    watering: [
      `Watering level: ${input.water}.`,
      "Keep the soil evenly moist but not waterlogged, and let the top layer dry slightly before the next watering.",
      input.weatherNote || "In warmer weather, check moisture more often to prevent stress.",
    ]
      .filter(Boolean)
      .join(" "),
    light: [
      `Recommended light exposure: ${input.light}.`,
      "Aim for bright, filtered light for most of the day and avoid long periods of harsh midday sun on the leaves.",
      "If growth slows or leaves fade, move the plant slightly closer to indirect light.",
    ].join(" "),
    temperature: [
      `Preferred temperature range: ${input.temperature}.`,
      "Keep conditions stable and avoid sudden hot/cold drafts from doors, windows, or AC vents.",
      "If temperatures swing frequently, growth and leaf quality can decline.",
    ].join(" "),
    humidity: [
      `Target humidity: around ${input.humidity}.`,
      "If indoor air is dry, use a humidifier or pebble tray and group plants to maintain a more consistent microclimate.",
      "Low humidity may cause leaf edge browning or curling over time.",
    ].join(" "),
  };
}

type PerenualDetails = {
  description?: unknown;
  other_name?: unknown;
  sunlight?: unknown;
  watering?: unknown;
  watering_general_benchmark?: { value?: unknown };
  hardiness?: { min?: unknown; max?: unknown };
};

async function queryPerenual(query: string): Promise<PerenualDetails | null> {
  const key = process.env.PERENUAL_API_KEY;
  if (!key || !query) return null;
  try {
    const searchUrl = `https://perenual.com/api/species-list?key=${encodeURIComponent(key)}&q=${encodeURIComponent(query)}&page=1`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return null;
    const searchPayload = (await searchRes.json()) as { data?: Array<{ id?: number }> };
    const id = searchPayload.data?.[0]?.id;
    if (!id) return null;

    const detailUrl = `https://perenual.com/api/v2/species/details/${id}?key=${encodeURIComponent(key)}`;
    const detailRes = await fetch(detailUrl);
    if (!detailRes.ok) return null;
    return await detailRes.json();
  } catch {
    return null;
  }
}

function buildPerenualQueryVariants(commonName: string, scientificName: string): string[] {
  const variants: string[] = [];
  const addVariant = (value: string) => {
    const normalized = normalizeText(value);
    if (!normalized) return;
    if (!variants.some((entry) => entry.toLowerCase() === normalized.toLowerCase())) {
      variants.push(normalized);
    }
  };

  addVariant(scientificName);
  addVariant(scientificName.replace("×", "x"));
  addVariant(scientificName.replace(" x ", " "));
  addVariant(scientificName.replace(" × ", " "));

  const scientificParts = scientificName.split(/\s+/).filter(Boolean);
  if (scientificParts[0]) addVariant(scientificParts[0]);
  if (scientificParts.length >= 2) addVariant(`${scientificParts[0]} ${scientificParts[1]}`);

  addVariant(commonName);
  const commonParts = commonName.split(/\s+/).filter(Boolean);
  if (commonParts[0]) addVariant(commonParts[0]);
  if (commonParts.length >= 2) addVariant(`${commonParts[0]} ${commonParts[1]}`);

  return variants;
}

async function queryPerenualWithFallback(commonName: string, scientificName: string): Promise<PerenualDetails | null> {
  const variants = buildPerenualQueryVariants(commonName, scientificName);
  for (const variant of variants) {
    const result = await queryPerenual(variant);
    if (result) return result;
  }
  return null;
}

async function queryWeather(): Promise<{ tempC?: number; humidity?: number } | null> {
  const key = process.env.OPENWEATHERMAP_API_KEY;
  if (!key) return null;
  try {
    const lat = 1.3521;
    const lon = 103.8198;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${encodeURIComponent(key)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const payload = (await res.json()) as { main?: { temp?: number; humidity?: number } };
    return {
      tempC: typeof payload.main?.temp === "number" ? payload.main.temp : undefined,
      humidity: typeof payload.main?.humidity === "number" ? payload.main.humidity : undefined,
    };
  } catch {
    return null;
  }
}

async function enhanceWithGrok(input: EnrichResponse): Promise<EnrichResponse> {
  const key = process.env.GROK_API_KEY;
  if (!key) return input;

  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-2-latest",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You are a gardening assistant. Rewrite plant care copy to be concise, practical, and friendly. Return strict JSON only with keys: description, careSections where careSections is an array of {title, content}. Expand each care section with actionable detail (2-4 sentences). Ensure the 'General Care' section is a numbered simple care plan, not a duplicate of description.",
          },
          {
            role: "user",
            content: JSON.stringify({ description: input.description, careSections: input.careSections }),
          },
        ],
      }),
    });

    if (!res.ok) return input;
    const payload = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) return input;

    const parsed = JSON.parse(content) as { description?: unknown; careSections?: unknown };
    const description = normalizeText(parsed.description) || input.description;
    const careSectionsRaw = Array.isArray(parsed.careSections) ? parsed.careSections : [];
    const careSections = careSectionsRaw
      .map((entry) => ({
        title: normalizeText((entry as { title?: unknown }).title),
        content: normalizeText((entry as { content?: unknown }).content),
      }))
      .filter((entry) => entry.title && entry.content);

    return {
      ...input,
      description,
      careSections: careSections.length ? careSections : input.careSections,
    };
  } catch {
    return input;
  }
}

async function generateCareWithOpenAI(input: EnrichResponse): Promise<EnrichResponse> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return input;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a plant care assistant. Return strict JSON with keys description and careSections. careSections must be an array of {title, content}. Keep language concise and practical. Expand each care section with actionable detail (2-4 sentences). Ensure 'General Care' is a numbered simple care plan.",
          },
          {
            role: "user",
            content: JSON.stringify({
              commonName: input.commonName,
              scientificName: input.scientificName,
              light: input.light,
              water: input.water,
              temperature: input.temperature,
              humidity: input.humidity,
              existingSections: input.careSections,
            }),
          },
        ],
      }),
    });

    if (!res.ok) return input;
    const payload = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) return input;

    const parsed = JSON.parse(content) as { description?: unknown; careSections?: unknown };
    const description = normalizeText(parsed.description);
    const careSectionsRaw = Array.isArray(parsed.careSections) ? parsed.careSections : [];
    const careSections = careSectionsRaw
      .map((entry) => ({
        title: normalizeText((entry as { title?: unknown }).title),
        content: normalizeText((entry as { content?: unknown }).content),
      }))
      .filter((entry) => entry.title && entry.content);

    if (!description && !careSections.length) return input;

    return {
      ...input,
      description: description || input.description,
      careSections: careSections.length ? careSections : input.careSections,
    };
  } catch {
    return input;
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as EnrichBody | null;
  const commonName = normalizeText(body?.commonName) || DEFAULT_RESPONSE.commonName;
  const scientificName = normalizeText(body?.scientificName) || DEFAULT_RESPONSE.scientificName;
  const cacheKey = `${commonName.toLowerCase()}::${scientificName.toLowerCase()}`;
  const cached = enrichCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.value);
  }

  const [perenual, weather] = await Promise.all([
    queryPerenualWithFallback(commonName, scientificName),
    queryWeather(),
  ]);

  const description =
    normalizeText(perenual?.description) ||
    normalizeText(Array.isArray(perenual?.other_name) ? perenual.other_name.join(". ") : "") ||
    DEFAULT_RESPONSE.description;

  const sunlightValues = Array.isArray(perenual?.sunlight) ? perenual.sunlight.map((value: unknown) => normalizeText(value)).filter(Boolean) : [];
  const light = sunlightValues.length ? sunlightValues.join(", ") : DEFAULT_RESPONSE.light;

  const wateringRaw = normalizeText(perenual?.watering) || normalizeText(perenual?.watering_general_benchmark?.value);
  const water = wateringRaw || DEFAULT_RESPONSE.water;

  const tempMin = typeof perenual?.hardiness?.min === "string" ? perenual.hardiness.min : null;
  const tempMax = typeof perenual?.hardiness?.max === "string" ? perenual.hardiness.max : null;
  const temperature = tempMin && tempMax ? `${tempMin} - ${tempMax}` : DEFAULT_RESPONSE.temperature;

  const humidity = typeof weather?.humidity === "number" ? `${weather.humidity}%` : DEFAULT_RESPONSE.humidity;

  const weatherNote =
    typeof weather?.tempC === "number"
      ? `Current local temperature is ${Math.round(weather.tempC)} deg C, so monitor watering frequency based on heat and airflow.`
      : "";
  const expanded = buildExpandedSectionContent({ light, water, temperature, humidity, weatherNote });

  let response: EnrichResponse = {
    commonName,
    scientificName,
    description,
    light,
    water,
    temperature,
    humidity,
    careSections: [
      {
        title: "Watering & Moisture",
        content: expanded.watering,
      },
      {
        title: "Light",
        content: expanded.light,
      },
      {
        title: "Temperature",
        content: expanded.temperature,
      },
      {
        title: "Humidity",
        content: expanded.humidity,
      },
      {
        title: "General Care",
        content: buildSimpleCarePlan({ light, water, temperature, humidity }),
      },
    ],
  };

  const isPerenualFallback = response.description === DEFAULT_RESPONSE.description;
  if (isPerenualFallback) {
    response = await generateCareWithOpenAI(response);
  }

  response = await enhanceWithGrok(response);
  response = {
    ...response,
    careSections: response.careSections.map((section) =>
      section.title.toLowerCase() === "general care"
        ? {
            ...section,
            content:
              (section.content.includes("1.") && section.content.includes("2."))
                ? section.content
                : buildSimpleCarePlan({
                    light: response.light,
                    water: response.water,
                    temperature: response.temperature,
                    humidity: response.humidity,
                  }),
          }
        : section,
    ),
  };
  enrichCache.set(cacheKey, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    value: response,
  });

  return NextResponse.json(response);
}
