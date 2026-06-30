import type { GeoPoint } from "../data/types";

export async function geocodeAddress(query: string): Promise<GeoPoint | null> {
  const term = query.trim();
  if (term.length < 3) return null;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(
        term,
      )}`,
      { headers: { Accept: "application/json" } },
    );
    const data: unknown = await res.json();
    const row = Array.isArray(data) ? (data[0] as { lat?: string; lon?: string }) : null;
    if (!row) return null;
    const lat = Number(row.lat);
    const lng = Number(row.lon);
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
  } catch {
    return null;
  }
}
