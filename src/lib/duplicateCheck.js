// src/lib/duplicateCheck.js
import { getServiceClient } from './supabase.js';

const DUPLICATE_RADIUS_METRES = 20;

/**
 * Checks whether an approved detection already exists within
 * DUPLICATE_RADIUS_METRES of (lat, lng) using PostGIS ST_DWithin.
 *
 * Returns the existing detection row, or null if no duplicate.
 */
export async function findDuplicateDetection(lat, lng) {
  const supabase = getServiceClient();

  // ST_DWithin on geography type uses metres directly
  const { data, error } = await supabase.rpc('find_nearby_detection', {
    p_lat: lat,
    p_lng: lng,
    p_radius: DUPLICATE_RADIUS_METRES,
  });

  if (error) {
    console.error('[duplicateCheck] RPC error:', error.message);
    return null;
  }

  return data?.[0] ?? null;
}