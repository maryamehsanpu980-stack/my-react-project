// src/lib/geocode.js

const LAHORE_BOUNDS = {
  latMin: 31.35, latMax: 31.70,
  lngMin: 74.15, lngMax: 74.55,
};

export function isWithinLahoreBounds(lat, lng) {
  return (
    lat >= LAHORE_BOUNDS.latMin && lat <= LAHORE_BOUNDS.latMax &&
    lng >= LAHORE_BOUNDS.lngMin && lng <= LAHORE_BOUNDS.lngMax
  );
}

export async function reverseGeocodeCheck(lat, lng) {
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=json` +
      `&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'RoadVisionPK/1.0 (hello@roadvision.pk)' },
    });

    if (!res.ok) return { valid: null, area: null };

    const data = await res.json();
    const addr = data?.address || {};
console.log('[geocode]', JSON.stringify(addr));

    const countryCode = (addr.country_code || '').toLowerCase();
    const isoCode = (addr['ISO3166-2-lvl4'] || '').toLowerCase();

    // Not Pakistan → reject
    if (countryCode && countryCode !== 'pk') return { valid: false, area: null };

    // Not Punjab → reject
    if (isoCode && !isoCode.includes('pk-pb')) return { valid: false, area: null };

    // Pakistan + Punjab + bounding box passed → approve
    const area = addr.suburb || addr.neighbourhood || addr.road || 'Lahore';
    return { valid: true, area };

  } catch {
    return { valid: null, area: null };
  }
}