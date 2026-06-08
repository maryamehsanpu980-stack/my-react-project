#!/usr/bin/env node
// lib/mapillary.js
// Mapillary tiled image fetcher with recursive fallback

import { config } from "dotenv";
config({ path: ".env.local" });

const MAPILLARY_API = "https://graph.mapillary.com/images";
const ACCESS_TOKEN = "MLY|26920797204272321|e390c763435653970c5413c2e9671a0f"; // set in .env.local

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

/**
 * Fetch images across a large bounding box by dividing it into a grid of tiles.
 */
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
  const allImages = [];
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

      for (const img of images) {
        if (!seenIds.has(img.id)) {
          seenIds.add(img.id);
          allImages.push(img);
        }
      }

      if (delayMs > 0) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }

  return allImages;
}

// --- CLI entry point ---
// Usage: node mapillary.js <minLng> <minLat> <maxLng> <maxLat> [tileSize] [minSize] [delayMs]
// Example: node mapillary.js -122.42 37.77 -122.40 37.79

  if (!ACCESS_TOKEN) {
    console.error("Error: MAPILLARY_ACCESS_TOKEN is not set. Add it to .env.local or export it as an env variable.");
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
    .then((images) => {
      console.log(`\nDone. Found ${images.length} unique images.`);
      console.log(JSON.stringify(images, null, 2));
    })
    .catch((err) => {
      console.error("Error:", err.message);
      process.exit(1);
    });

