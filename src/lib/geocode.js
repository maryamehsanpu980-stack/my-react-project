// src/lib/geocode.js

const LAHORE_BOUNDS = {
  latMin: 31.35, latMax: 31.70,
  lngMin: 74.15, lngMax: 74.55,
};

/**
 * Fast bounding-box check — no API call needed.
 * Use this as Stage 1 before the slower Nominatim call.
 */
export function isWithinLahoreBounds(lat, lng) {
  return (
    lat >= LAHORE_BOUNDS.latMin && lat <= LAHORE_BOUNDS.latMax &&
    lng >= LAHORE_BOUNDS.lngMin && lng <= LAHORE_BOUNDS.lngMax
  );
}

/**
 * Stage 2 — reverse geocode via Nominatim to confirm the city name.
 * Returns { valid: true, area } on success or { valid: false, area: null }.
 */
export async function reverseGeocodeCheck(lat, lng) {
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=json` +
      `&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'RoadVisionPK/1.0 (hello@roadvision.pk)' },
    });

    if (!res.ok) return { valid: false, area: null };

    const data = await res.json();
    const addr = data?.address || {};

    // Accept if city, town, or state_district mentions Lahore
    const cityField = (addr.city || addr.town || addr.state_district || '').toLowerCase();
    const valid = cityField.includes('lahore');

    const area =
      addr.suburb ||
      addr.neighbourhood ||
      addr.road ||
      addr.city ||
      'Lahore';

    return { valid, area };
  } catch {
    // Nominatim failure — treat as ambiguous, not rejected
    return { valid: null, area: null };
  }
}