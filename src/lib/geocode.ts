import type { GeoPoint } from "../data/types";

// Resolve a free-text address to coordinates via OpenStreetMap's Nominatim
// search API (the same service used by the address autocomplete + reverse
// geocode). Used as a fallback at order time: when a delivery address was typed
// by hand rather than picked from the suggestion dropdown, it has no captured
// coordinates — geocoding the text here keeps the delivery map on the real
// location instead of falling back to a fixed default.

/** Best-effort lat/lng for an address string. Returns null on no match / error. */
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
