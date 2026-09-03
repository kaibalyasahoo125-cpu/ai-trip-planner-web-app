import { NextRequest, NextResponse } from "next/server";

type CacheEntry = { photoUrl: string | null; time: number };
const HIT_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days for hits
const MAX_CACHE = 1000;

const photoCache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<CacheEntry>>();

function normalize(q: string) {
  return q.replace(/\s+/g, " ").trim().toLowerCase();
}

function cacheGet(key: string): string | null | undefined {
  const entry = photoCache.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.time > HIT_CACHE_TTL_MS) {
    photoCache.delete(key);
    return undefined;
  }
  return entry.photoUrl;
}

function cacheSet(key: string, photoUrl: string | null) {
  if (photoCache.size >= MAX_CACHE) {
    const toDelete = Math.ceil(MAX_CACHE / 4);
    let i = 0;
    for (const k of photoCache.keys()) {
      photoCache.delete(k);
      if (++i >= toDelete) break;
    }
  }
  photoCache.set(key, { photoUrl, time: Date.now() });
}

// Curated high-resolution Unsplash collections for travel & hospitality
const CITY_PHOTOS: Record<string, string[]> = {
  paris: [
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1509299349698-dd22323b5963?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80",
  ],
  tokyo: [
    "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=800&q=80",
  ],
  "new york": [
    "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=800&q=80",
  ],
  london: [
    "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&w=800&q=80",
  ],
  rome: [
    "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=800&q=80",
  ],
  bali: [
    "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80",
  ],
  dubai: [
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80",
  ],
  delhi: [
    "https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
  ],
  goa: [
    "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?auto=format&fit=crop&w=800&q=80",
  ],
  mumbai: [
    "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=800&q=80",
  ],
  amsterdam: [
    "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=800&q=80",
  ],
  bangkok: [
    "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=800&q=80",
  ],
  barcelona: [
    "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80",
  ],
  sydney: [
    "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1523428096881-5cb79943098f?auto=format&fit=crop&w=800&q=80",
  ],
  singapore: [
    "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=800&q=80",
  ],
};

const CATEGORY_PHOTOS: Record<string, string[]> = {
  hotelLuxury: [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80",
  ],
  hotelBoutique: [
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80",
  ],
  museum: [
    "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=800&q=80",
  ],
  dining: [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80",
  ],
  market: [
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=800&q=80",
  ],
  park: [
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800&q=80",
  ],
  nightlife: [
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
  ],
  landmark: [
    "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80",
  ],
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getContextualPhoto(placeName: string): string {
  const lower = placeName.toLowerCase();
  const hash = hashString(placeName);

  // Check if it's a hotel
  if (lower.includes("hotel") || lower.includes("suite") || lower.includes("resort") || lower.includes("palace") || lower.includes("inn") || lower.includes("lodge")) {
    if (lower.includes("grand") || lower.includes("luxury") || lower.includes("palace") || lower.includes("royal") || lower.includes("ritz")) {
      return CATEGORY_PHOTOS.hotelLuxury[hash % CATEGORY_PHOTOS.hotelLuxury.length];
    }
    return CATEGORY_PHOTOS.hotelBoutique[hash % CATEGORY_PHOTOS.hotelBoutique.length];
  }

  // Check city match
  for (const [city, photos] of Object.entries(CITY_PHOTOS)) {
    if (lower.includes(city)) {
      return photos[hash % photos.length];
    }
  }

  // Check category matches
  if (lower.includes("museum") || lower.includes("gallery") || lower.includes("art") || lower.includes("heritage")) {
    return CATEGORY_PHOTOS.museum[hash % CATEGORY_PHOTOS.museum.length];
  }
  if (lower.includes("dining") || lower.includes("restaurant") || lower.includes("sunset") || lower.includes("cuisine") || lower.includes("food") || lower.includes("cafe")) {
    return CATEGORY_PHOTOS.dining[hash % CATEGORY_PHOTOS.dining.length];
  }
  if (lower.includes("market") || lower.includes("bazaar") || lower.includes("street food") || lower.includes("shopping")) {
    return CATEGORY_PHOTOS.market[hash % CATEGORY_PHOTOS.market.length];
  }
  if (lower.includes("park") || lower.includes("river") || lower.includes("garden") || lower.includes("nature") || lower.includes("promenade") || lower.includes("beach")) {
    return CATEGORY_PHOTOS.park[hash % CATEGORY_PHOTOS.park.length];
  }
  if (lower.includes("night") || lower.includes("club") || lower.includes("lounge") || lower.includes("bar") || lower.includes("music")) {
    return CATEGORY_PHOTOS.nightlife[hash % CATEGORY_PHOTOS.nightlife.length];
  }

  return CATEGORY_PHOTOS.landmark[hash % CATEGORY_PHOTOS.landmark.length];
}

function isInvalidWikiPhoto(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.endsWith(".svg.png") ||
    lower.endsWith(".svg") ||
    lower.includes("logo") ||
    lower.includes("icon") ||
    lower.includes("flag") ||
    lower.includes("coat_of_arms") ||
    lower.includes("symbol") ||
    lower.includes("map") ||
    lower.includes("diagram")
  );
}

async function fetchWikipediaPhoto(query: string): Promise<string | null> {
  try {
    const cleanQuery = query.replace(/^.*-\s*/, "").replace(/\(.*?\)/g, "").trim();
    if (!cleanQuery) return null;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanQuery)}&format=json&origin=*`;
    const searchRes = await fetch(searchUrl, {
      headers: { "User-Agent": "AiTripPlanner/1.0 (contact@aitripplanner.dev)" },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const firstTitle = searchData?.query?.search?.[0]?.title;
    if (!firstTitle) return null;

    const pageController = new AbortController();
    const pageTimeout = setTimeout(() => pageController.abort(), 2000);

    const pageUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(firstTitle)}`;
    const pageRes = await fetch(pageUrl, {
      headers: { "User-Agent": "AiTripPlanner/1.0 (contact@aitripplanner.dev)" },
      signal: pageController.signal,
    });
    clearTimeout(pageTimeout);

    if (!pageRes.ok) return null;
    const pageData = await pageRes.json();
    const imgUrl = pageData?.thumbnail?.source || pageData?.originalimage?.source;
    if (imgUrl && typeof imgUrl === "string" && !isInvalidWikiPhoto(imgUrl)) {
      return imgUrl;
    }
    return null;
  } catch {
    return null;
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let placeName: string;
  try {
    const body = await req.json();
    placeName = String(body?.placeName ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!placeName) {
    return NextResponse.json({ error: "placeName is required" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACE_API_KEY;
  const cacheKey = `v3:${normalize(placeName)}`;

  // 1. In-memory cache hit
  const cached = cacheGet(cacheKey);
  if (cached !== undefined && cached !== null) {
    return NextResponse.json({ photoUrl: cached, cached: true });
  }

  // 2. In-flight deduplication
  const existing = inflight.get(cacheKey);
  if (existing) {
    const entry = await existing;
    if (entry.photoUrl) return NextResponse.json({ photoUrl: entry.photoUrl, cached: true });
  }

  const doCall: Promise<CacheEntry> = (async () => {
    // 3. Try Google Places API if key provided
    if (apiKey) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const BASE_URL = "https://places.googleapis.com/v1/places:searchText";
        const res = await fetch(BASE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "places.photos,places.id",
          },
          body: JSON.stringify({ textQuery: placeName }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const places: any[] = data?.places ?? [];
          const placeWithPhoto = places.find((p) => p?.photos && p.photos.length > 0);
          if (placeWithPhoto) {
            const photo = placeWithPhoto.photos[0];
            const photoUrl = `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=800&maxWidthPx=800&key=${apiKey}`;
            cacheSet(cacheKey, photoUrl);
            return { photoUrl, time: Date.now() };
          }
        }
      } catch {
        // Fall through to next tier
      }
    }

    // 4. Try Wikipedia image for landmark/place name (if not a generic hotel)
    if (!/hotel|suite|inn|lodge/i.test(placeName)) {
      const wikiPhoto = await fetchWikipediaPhoto(placeName);
      if (wikiPhoto) {
        cacheSet(cacheKey, wikiPhoto);
        return { photoUrl: wikiPhoto, time: Date.now() };
      }
    }

    // 5. High-resolution contextual travel/hotel photography engine
    const contextualPhoto = getContextualPhoto(placeName);
    cacheSet(cacheKey, contextualPhoto);
    return { photoUrl: contextualPhoto, time: Date.now() };
  })();

  inflight.set(cacheKey, doCall);
  try {
    const entry = await doCall;
    return NextResponse.json({ photoUrl: entry.photoUrl });
  } finally {
    inflight.delete(cacheKey);
  }
}

