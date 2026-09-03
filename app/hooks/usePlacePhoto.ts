import { useEffect, useState, useRef } from "react";

const MAX = 500;
const resultCache = new Map<string, string | null>();
const promiseCache = new Map<string, Promise<string | null>>();

function normalizeKey(q: string) {
  return q.replace(/\s+/g, " ").trim().toLowerCase();
}

function evictIfNeeded() {
  if (resultCache.size > MAX) {
    const toDelete = Math.ceil(MAX / 4);
    let i = 0;
    for (const k of resultCache.keys()) {
      resultCache.delete(k);
      if (++i >= toDelete) break;
    }
  }
}

async function fetchPhotoUrl(placeName: string): Promise<string | null> {
  try {
    const res = await fetch("/api/google-place-detail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placeName }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { photoUrl?: string; error?: unknown };
    return data?.photoUrl ?? null;
  } catch {
    return null;
  }
}

export function usePlacePhoto(placeName: string | undefined | null) {
  const [url, setUrl] = useState<string | null>(null);
  const placeRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!placeName) {
      placeRef.current = undefined;
      return;
    }
    const key = normalizeKey(placeName);
    if (!key) return;

    if (placeRef.current === key) {
      return;
    }
    placeRef.current = key;

    if (resultCache.has(key)) {
      setUrl(resultCache.get(key) ?? null);
      return;
    }

    let cancelled = false;

    const existing = promiseCache.get(key);
    if (existing) {
      existing.then((v) => {
        if (cancelled) return;
        resultCache.set(key, v);
        evictIfNeeded();
        setUrl(v);
      });
      return () => {
        cancelled = true;
      };
    }

    const p = fetchPhotoUrl(placeName);
    promiseCache.set(key, p);
    p.then((v) => {
      promiseCache.delete(key);
      if (cancelled) return;
      resultCache.set(key, v);
      evictIfNeeded();
      setUrl(v);
    });
    return () => {
      cancelled = true;
    };
  }, [placeName]);

  return url;
}
