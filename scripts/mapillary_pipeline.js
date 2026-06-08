#!/usr/bin/env node
// lib/mapillary.js
// Mapillary tiled image fetcher with recursive fallback

import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, "../.env.local") });
import { detectPothole } from '../src/lib/cvClient.js';
import { findDuplicateDetection } from '../src/lib/duplicateCheck.js';

const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

import { createClient } from "@supabase/supabase-js";

const MAPILLARY_API = "https://graph.mapillary.com/images";
const ACCESS_TOKEN = process.env.MAPILLARY_TOKEN;

if (!NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
}

if (!SUPABASE_SERVICE_KEY) {
  throw new Error("SUPABASE_SERVICE_KEY is not set");
}

if (!ACCESS_TOKEN) {
  throw new Error("MAPILLARY_TOKEN is not set");
}

const supabase = createClient(
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_KEY
);

/**
 * Fetch images for a single tile (bounding box).
 * Returns { data: [...] } or throws on non-500 errors.
 */
async function fetchTile(minLng, minLat, maxLng, maxLat, fields = "id,thumb_2048_url,captured_at,geometry") {
  const params = new URLSearchParams({
    access_token: ACCESS_TOKEN,
    fields,
    bbox: `${minLng},${minLat},${maxLng},${maxLat}`,
  });

  const res = await fetch(`${MAPILLARY_API}?${params}`);

  if (res.status === 500) {
    // Signal to the caller that this tile is too large
    return { tooBig: true };
  }

  if (!res.ok) {
    throw new Error(`Mapillary API error: ${res.status} ${res.statusText}`);
  }

  const response = await res.json();

  console.log("Mapillary API response:", {
    status: res.status,
    statusText: res.statusText,
    json: JSON.stringify(response),
  });
  return response;
}

/**
 * Recursively fetch images for a bounding box.
 * If a tile returns 500 (too big), splits into 4 quadrants and retries.
 */
export async function fetchImagesRecursive(
  minLng,
  minLat,
  maxLng,
  maxLat,
  minSize = 0.0001,
  fields = "id,thumb_2048_url,captured_at,geometry"
) {
  const result = await fetchTile(minLng, minLat, maxLng, maxLat, fields);

  if (!result.tooBig) {
    return result.data ?? [];
  }

  const tileWidth = maxLng - minLng;
  const tileHeight = maxLat - minLat;

  if (tileWidth <= minSize || tileHeight <= minSize) {
    console.warn(`Tile too small to split further (${minLng},${minLat} → ${maxLng},${maxLat}), skipping.`);
    return [];
  }

  const midLng = (minLng + maxLng) / 2;
  const midLat = (minLat + maxLat) / 2;

  const quadrants = [
    [minLng, minLat, midLng, midLat],
    [midLng, minLat, maxLng, midLat],
    [minLng, midLat, midLng, maxLat],
    [midLng, midLat, maxLng, maxLat],
  ];

  const results = await Promise.all(
    quadrants.map(([lo, la, hi, ha]) =>
      fetchImagesRecursive(lo, la, hi, ha, minSize, fields)
    )
  );

  return results.flat();
}

// Fetch images across a large bounding box by dividing it into a grid of tiles
export async function fetchImagesForArea({
  minLng,
  minLat,
  maxLng,
  maxLat,
  tileSize = 0.001,
  minSize = 0.0001,
  fields = "id,thumb_2048_url,captured_at,geometry",
  delayMs = 150,
}) {
  const seenIds = new Set();

  const lngSteps = Math.ceil((maxLng - minLng) / tileSize);
  const latSteps = Math.ceil((maxLat - minLat) / tileSize);

  for (let i = 0; i < latSteps; i++) {
    for (let j = 0; j < lngSteps; j++) {
      const tilMinLng = minLng + j * tileSize;
      const tilMinLat = minLat + i * tileSize;
      const tilMaxLng = Math.min(tilMinLng + tileSize, maxLng);
      const tilMaxLat = Math.min(tilMinLat + tileSize, maxLat);

      const images = await fetchImagesRecursive(tilMinLng, tilMinLat, tilMaxLng, tilMaxLat, minSize, fields);

      const newImages = images.filter(img => !seenIds.has(img.id));
      newImages.forEach(img => seenIds.add(img.id));

      await processImages(newImages);

      if (delayMs > 0) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }
}

// --- Pipeline helpers (using imported implementations) ---

// Note: `findDuplicateDetection` and `detectPothole` are imported at the
// top of this file from the project's `src/lib` implementations. Keep any
// custom pipeline helpers here (e.g. reverseGeocodeCheck) if needed.

// --- Pipeline ---

async function processImages(images) {
  for (const img of images) {
    try {
      const [lng, lat] = img.geometry.coordinates;

      // 1. Duplicate check
      const duplicate = await findDuplicateDetection(lat, lng);
      if (duplicate) {
        console.log(`✗ Duplicate at ${lat}, ${lng} — skipping`);
        continue;
      }

      // 2. Download image
      const res = await fetch(img.thumb_2048_url);
      if (!res.ok) {
        console.log(`✗ Failed image download ${img.id}`);
        continue;
      }

      const buffer = Buffer.from(await res.arrayBuffer());

      // 3. CV pothole detection
      const cvResult = await detectPothole(buffer, `${img.id}.jpg`);
      if (!cvResult.detected) {
        console.log(`✗ No damage at ${lat}, ${lng}`);
        continue;
      }
      const rawSeverity = String(cvResult.severity ?? "").trim().toLowerCase();
      const severity = ["low", "medium", "high"].includes(rawSeverity)
        ? rawSeverity
        : "low";
      if (rawSeverity !== severity) {
        console.warn(`Unexpected severity '${cvResult.severity}' from CV service; using '${severity}' instead.`);
      }
      // 4. Reverse geocode check  Skipping
    //   const geoResult = await reverseGeocodeCheck(lat, lng);
    //   if (geoResult.valid === false) {
    //     console.log(`✗ Outside Lahore at ${lat}, ${lng}`);
    //     continue;
    //   }

    //   const areaName = geoResult.area ?? "Lahore";
      const areaName = "Lahore";

      // 5. Save to DB
      const { error } = await supabase.from("detections").insert({
        lat,
        lng,
        location_text: areaName,
        severity,
        confidence: cvResult.confidence,
        source: "mapillary",
        status: "approved",
        image_url: null,
        approved_at: new Date().toISOString(),
      });

      if (error) {
        console.error("DB error:", error.message);
      } else {
        console.log(`✓ Saved (${severity}) at ${areaName}`);
      }
    } catch (err) {
      console.error(`Failed on image ${img.id}:`, err.message);
    }
  }
}

// --- CLI entry point ---
// Usage: node mapillary.js <minLng> <minLat> <maxLng> <maxLat> [tileSize] [minSize] [delayMs]
// Example: node mapillary.js -122.42 37.77 -122.40 37.79

  if (!ACCESS_TOKEN) {
    console.error("Error: MAPILLARY_TOKEN is not set. Add it to .env.local or export it as an env variable.");
    process.exit(1);
  }

  const [, , minLng, minLat, maxLng, maxLat, tileSize, minSize, delayMs] = process.argv;

  if (!minLng || !minLat || !maxLng || !maxLat) {
    console.error("Usage: node mapillary.js <minLng> <minLat> <maxLng> <maxLat> [tileSize] [minSize] [delayMs]");
    console.error("Example: node mapillary.js -122.42 37.77 -122.40 37.79");
    process.exit(1);
  }

  const bbox = {
    minLng: parseFloat(minLng),
    minLat: parseFloat(minLat),
    maxLng: parseFloat(maxLng),
    maxLat: parseFloat(maxLat),
    tileSize: tileSize ? parseFloat(tileSize) : 0.001,
    minSize: minSize ? parseFloat(minSize) : 0.0001,
    delayMs: delayMs ? parseInt(delayMs) : 150,
  };

  console.log("Fetching images for area:", bbox);

  fetchImagesForArea(bbox)
    .then(async () => {
      console.log("\nDone.");
    })
    .catch((err) => {
      console.error("Error:", err.message);
      process.exit(1);
    });