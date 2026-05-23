const BOUNDS = { latMin: 31.35, latMax: 31.70, lngMin: 74.15, lngMax: 74.55 };
export function isWithinLahore(lat, lng) {
  return lat >= BOUNDS.latMin && lat <= BOUNDS.latMax &&
         lng >= BOUNDS.lngMin && lng <= BOUNDS.lngMax;
}