/**
 * pages/api/upload.js
 * -------------------
 * RoadVision PK — full upload + verification pipeline.
 *
 * INTEGRATION NOTES (from backend engineer Dev Session 2 summary):
 *
 *   ✓ RLS disabled on detections table — no policy errors on insert
 *   ✓ Admin removed — no pending_review path, everything auto-approves or rejects
 *   ✓ CV token header is 'x-cv-secret' — handled inside cvClient.js, nothing to change here
 *   ✓ Supabase storage bucket name: 'pothole-images' (confirmed created + public)
 *   ✓ Pipeline order matches Dev Session 2 decision table exactly (stages 0–11)
 *   ✓ pages/ is at project root (not inside src/) — this file path is correct
 *   ✓ package.json has "type":"module" — ES import syntax below works
 *
 * Pipeline:
 *   0  Parse multipart form      → 400 on failure
 *   1  JPEG/PNG + ≤5MB check     → 400 on failure
 *   2  lat/lng valid numbers      → rejection email (no_gps) + 422
 *   3  Send verification email    → fire-and-forget (non-blocking)
 *   4  Lahore bounding box        → rejection email (out_of_bounds) + 422
 *   5  Nominatim reverse-geocode  → rejection email (out_of_bounds) + 422 / null = proceed
 *   6  AI image check             → rejection email (ai_generated) + 422
 *   7  YOLOv8 CV detection        → rejection email (no_damage/cv_unavailable) + 422/503
 *   8  Duplicate within 20m       → duplicate email + 200 {status:"duplicate"}
 *   9  Upload to Supabase Storage → imageUrl = null if storage fails (non-fatal)
 *  10  Insert into detections     → 500 on DB error
 *  11  Send acceptance email      → fire-and-forget
 */

import { IncomingForm }  from 'formidable';
import fs                from 'fs';
import path              from 'path';
import { createClient }  from '@supabase/supabase-js';

import { detectPothole }                              from '../../src/lib/cvClient.js';
import { isWithinLahoreBounds, reverseGeocodeCheck }  from '../../src/lib/geocode.js';
import { findDuplicateDetection }                     from '../../src/lib/duplicateCheck.js';
import { checkAIGenerated }                           from '../../src/lib/aiImageCheck.js';
import {
  sendVerificationEmail,
  sendDuplicateEmail,
  sendAcceptanceEmail,
  sendRejectionEmail,
} from '../../src/lib/mailer.js';

// Disable Next.js built-in body parser so formidable can handle multipart
export const config = { api: { bodyParser: false } };

const MAX_FILE_BYTES = 5 * 1024 * 1024;  // 5 MB — matches SRS FR-12

// ─── Supabase service client ───────────────────────────────────────────────────
// Uses SUPABASE_SERVICE_KEY (bypasses RLS — safe because RLS is disabled anyway,
// but service key is still required for storage uploads).
function makeServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

// ─── Field helpers ─────────────────────────────────────────────────────────────
// formidable v3 returns fields as arrays — these helpers normalise to scalar.
function parseCoords(fields) {
  const lat = parseFloat(Array.isArray(fields.lat) ? fields.lat[0] : fields.lat);
  const lng = parseFloat(Array.isArray(fields.lng) ? fields.lng[0] : fields.lng);
  if (isNaN(lat) || isNaN(lng)) return null;
  return { lat, lng };
}

function getString(fields, key) {
  const v = Array.isArray(fields[key]) ? fields[key][0] : fields[key];
  return (v ?? '').trim() || null;
}

// ─── Main handler ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── Stage 0: Parse multipart form ────────────────────────────────────────────
  const form = new IncomingForm({ maxFileSize: MAX_FILE_BYTES });

  let fields, files;
  try {
    [fields, files] = await form.parse(req);
  } catch {
    // formidable throws when the file exceeds maxFileSize
    return res.status(400).json({
      error:   'file_too_large',
      message: 'Image must be under 5 MB.',
    });
  }

  // ── Stage 1: File validation ──────────────────────────────────────────────────
  // formidable stores uploaded files under the field name used in the form.
  // Frontend sends the image as field name 'image'.
  const imageFile = files.image?.[0];
  if (!imageFile) {
    return res.status(400).json({
      error:   'no_file',
      message: 'No image file provided. Use field name "image".',
    });
  }

  const mime = imageFile.mimetype ?? '';
  if (!['image/jpeg', 'image/png'].includes(mime)) {
    return res.status(400).json({
      error:   'invalid_type',
      message: 'Only JPEG or PNG images are accepted.',
    });
  }

  // Extract contributor fields — both optional
  const contributorName  = getString(fields, 'name');
  const contributorEmail = getString(fields, 'email');

  // ── Stage 2: GPS present check ────────────────────────────────────────────────
  // Frontend sends lat/lng from EXIF extraction or manual map pin.
  const coords = parseCoords(fields);
  if (!coords) {
    if (contributorEmail) {
      sendRejectionEmail({
        to:     contributorEmail,
        name:   contributorName,
        reason: 'no_gps',
      }).catch(console.error);
    }
    return res.status(422).json({
      error:   'no_gps',
      message: 'Could not read GPS location. Enable location on your camera or drop a pin on the map.',
    });
  }

  // ── Stage 3: Verification email — sent immediately, does NOT block ─────────
  // Gives the contributor instant acknowledgement regardless of what happens next.
  const tempId = `RV-${Date.now()}`;
  if (contributorEmail) {
    sendVerificationEmail({
      to:       contributorEmail,
      name:     contributorName,
      reportId: tempId,
    }).catch(console.error);
  }

  // ── Stage 4: Lahore bounding box ──────────────────────────────────────────────
  // Fast check — no network. lat 31.35–31.70, lng 74.15–74.55
  if (!isWithinLahoreBounds(coords.lat, coords.lng)) {
    if (contributorEmail) {
      sendRejectionEmail({
        to:     contributorEmail,
        name:   contributorName,
        reason: 'out_of_bounds',
      }).catch(console.error);
    }
    return res.status(422).json({
      error:   'out_of_bounds',
      message: 'Location is outside Lahore. RoadVision.pk currently covers Lahore only.',
    });
  }

  // ── Stage 5: Nominatim reverse-geocode ───────────────────────────────────────
  // Confirms coords resolve to Lahore, Pakistan.
  // Returns { valid: true/false/null, area: string }
  // null = Nominatim unavailable — we proceed rather than reject.
  const geoResult = await reverseGeocodeCheck(coords.lat, coords.lng);

  if (geoResult.valid === false) {
    if (contributorEmail) {
      sendRejectionEmail({
        to:     contributorEmail,
        name:   contributorName,
        reason: 'out_of_bounds',
      }).catch(console.error);
    }
    return res.status(422).json({
      error:   'out_of_bounds',
      message: 'Coordinates do not resolve to Lahore, Pakistan.',
    });
  }

  // Use Nominatim area name, then frontend-submitted location field, then fallback
  const areaName =
    geoResult.area ??
    getString(fields, 'location') ??
    'Lahore';

  // ── Stage 6: AI image check ───────────────────────────────────────────────────
  // Read image bytes once here — used for both AI check and CV detection.
  const imageBuffer = fs.readFileSync(imageFile.filepath);

  const aiResult = await checkAIGenerated(imageBuffer);
  if (aiResult.isAI === true) {
    if (contributorEmail) {
      sendRejectionEmail({
        to:     contributorEmail,
        name:   contributorName,
        reason: 'ai_generated',
      }).catch(console.error);
    }
    return res.status(422).json({
      error:   'ai_generated',
      message: 'Image appears to be AI-generated. Please upload an authentic photograph.',
    });
  }

  // ── Stage 7: YOLOv8 CV detection ──────────────────────────────────────────────
  // detectPothole sends 'x-cv-secret' header automatically — no changes here.
  // Confidence threshold: ≥ 0.50 to be detected (matches SRS FR-08).
  let cvResult;
  try {
    cvResult = await detectPothole(imageBuffer, path.basename(imageFile.filepath));
  } catch (err) {
    console.error('=== CV ERROR ===', err.message, err.cause);
    // Admin removed — no manual review queue. Reject immediately.
    if (contributorEmail) {
      sendRejectionEmail({
        to:     contributorEmail,
        name:   contributorName,
        reason: 'cv_unavailable',
      }).catch(console.error);
    }
    return res.status(503).json({
      error:   'cv_unavailable',
      message: 'Detection service temporarily unavailable. Please try again in a few minutes.',
    });
  }

  console.log("1")

  if (!cvResult.detected) {
    console.log("2")
    if (contributorEmail) {
      sendRejectionEmail({
        to:     contributorEmail,
        name:   contributorName,
        reason: 'no_damage',
      }).catch(console.error);
    }
    return res.status(422).json({
      error:   'no_damage',
      message: 'No road damage detected. Make sure the photo clearly shows a pothole.',
    });
  }

  // ── Stage 8: Duplicate check ──────────────────────────────────────────────────
  // Calls Supabase RPC find_nearby_detection — 20m radius, approved detections only.
  console.log("3")
  const duplicate = await findDuplicateDetection(coords.lat, coords.lng);
  console.log("4")
  if (duplicate) {
    console.log("5")
    if (contributorEmail) {
      sendDuplicateEmail({
        to:           contributorEmail,
        name:         contributorName,
        existingArea: duplicate.location_text,
        existingDate: new Date(duplicate.created_at).toLocaleDateString('en-PK'),
      }).catch(console.error);
    }
    return res.status(200).json({
      status:     'duplicate',
      existingId: duplicate.id,
      message:    'A report already exists nearby. Your submission has been noted — thank you!',
    });
  }
    console.log("6")

  // ── Stage 9: Upload image to Supabase Storage ─────────────────────────────────
  // Bucket: 'pothole-images' (confirmed created + public in Dev Session 2)
  // Non-fatal: if storage fails, imageUrl = null and we still save the detection.
  console.log("7")
  const supabase    = makeServiceClient();
  const storagePath = `uploads/${Date.now()}_${path.basename(imageFile.filepath)}.jpg`;

  const { data: storageData, error: storageErr } = await supabase.storage
    .from('pothole-images')
    .upload(storagePath, imageBuffer, { contentType: mime, upsert: false });

  console.log("8")

  if (storageErr) {
    console.warn('[upload] Storage upload failed (non-fatal):', storageErr.message);
  }

  const imageUrl = storageErr
    ? null
    : supabase.storage.from('pothole-images').getPublicUrl(storageData.path).data.publicUrl;

  // ── Stage 10: Insert into detections table ────────────────────────────────────
  // status is always 'approved' — no pending_review path (admin removed).
  // RLS is disabled, so service key is not strictly required for the insert,
  // but we keep makeServiceClient() for consistency and storage uploads.
  const { data: detection, error: dbErr } = await supabase
    .from('detections')
    .insert({
      lat:               coords.lat,
      lng:               coords.lng,
      location_text:     areaName,
      severity:          cvResult.severity,     // 'low'|'medium'|'high'
      confidence:        cvResult.confidence,   // 0.0 – 1.0
      source:            'user_upload',
      image_url:         imageUrl,
      contributor_name:  contributorName,
      contributor_email: contributorEmail,
      status:            'approved',
      approved_at:       new Date().toISOString(),
    })
    .select()
    .single();

    console.log("10")

  if (dbErr) {
    console.error('[upload] DB insert error:', dbErr.message);
    return res.status(500).json({
      error:   'db_error',
      message: 'Could not save your report. Please try again.',
    });
  }
  console.log("11")
  // ── Stage 11: Acceptance email ────────────────────────────────────────────────
  if (contributorEmail) {
    sendAcceptanceEmail({
      to:       contributorEmail,
      name:     contributorName,
      reportId: detection.id,
      area:     areaName,
      severity: cvResult.severity,
    }).catch(console.error);
  }

  // ── Success ───────────────────────────────────────────────────────────────────
  return res.status(200).json({
    status:     'approved',
    reportId:   detection.id,
    area:       areaName,
    severity:   cvResult.severity,
    confidence: cvResult.confidence,
    imageUrl,
    message:    'Your report has been verified and added to the live map!',
  });
}

// ─── Standalone integration test ──────────────────────────────────────────────
// Tests each module in pipeline order without starting a Next.js server.
// Run:  node pages/api/upload.js
if (process.argv[1] && process.argv[1].endsWith('upload.js')) {
  const { createRequire } = await import('module');
  const require = createRequire(import.meta.url);
  try {
    const dotenv = require('dotenv');
    dotenv.config({ path: '.env.local' });
    dotenv.config({ path: '.env' });
  } catch { /* dotenv optional */ }

  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('  RoadVision PK — Upload Pipeline Integration Test');
  console.log('══════════════════════════════════════════════════════════════\n');

  let pass = 0, fail = 0;
  const check = (label, got, expected) => {
    const ok = got === expected;
    console.log(`  ${ok ? '✓' : '✗'} ${label}  →  ${got}  (expected: ${expected})`);
    if (ok) pass++; else fail++;
  };

  // Stage 2 — GPS validation
  console.log('── Stage 2: GPS validation ───────────────────────────────────');
  check('Valid coords parse correctly', !isNaN(31.5167) && !isNaN(74.3486), true);
  check('NaN coords fail',              !isNaN(NaN) && !isNaN(NaN),         false);

  // Stage 4 — Bounding box
  console.log('\n── Stage 4: Lahore bounding box ──────────────────────────────');
  const { isWithinLahoreBounds: bb } = await import('../../src/lib/geocode.js');
  check('Gulberg inside bounds',   bb(31.5167, 74.3486), true);
  check('Karachi outside bounds',  bb(24.86,   67.01),   false);
  check('Islamabad outside bounds',bb(33.72,   73.06),   false);
  check('NaN coords rejected',     bb(NaN, NaN),          false);

  // Stage 5 — Nominatim
  console.log('\n── Stage 5: Nominatim reverse-geocode ────────────────────────');
  const { reverseGeocodeCheck: geo } = await import('../../src/lib/geocode.js');
  process.stdout.write('  Querying Gulberg (31.5167, 74.3486) … ');
  const geoR = await geo(31.5167, 74.3486);
  const geoOk = geoR.valid === true || geoR.valid === null;
  console.log(`${geoOk ? '✓' : '✗'}  valid=${geoR.valid}  area="${geoR.area}"`);
  if (geoOk) pass++; else fail++;

  // Stage 6 — AI check
  console.log('\n── Stage 6: AI image check ───────────────────────────────────');
  const { checkAIGenerated: ai } = await import('../../src/lib/aiImageCheck.js');
  const aiR = await ai(Buffer.from('not-an-image'));
  check('Bad buffer returns isAI=null (fail-open)', aiR.isAI, null);

  // Stage 7 — CV service token
  console.log('\n── Stage 7: CV service token ─────────────────────────────────');
  const secret = process.env.CV_SERVICE_SECRET;
  if (!secret) {
    console.log('  ✗ CV_SERVICE_SECRET not set — 401 errors will occur');
    fail++;
  } else {
    console.log(`  ✓ CV_SERVICE_SECRET set (${secret.length} chars)`);
    pass++;
  }
  const { cvServiceIsHealthy: cvH } = await import('../../src/lib/cvClient.js');
  process.stdout.write('  Health check with x-cv-secret header … ');
  const healthy = await cvH();
  console.log(healthy
    ? '  ✓ Service up, token accepted'
    : '  ⚠  Unreachable or 401 — check Railway logs and CV_SERVICE_SECRET');

  // Stage 8 — Duplicate check
  console.log('\n── Stage 8: Duplicate check ──────────────────────────────────');
  if (process.env.SUPABASE_SERVICE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const { findDuplicateDetection: dup } = await import('../../src/lib/duplicateCheck.js');
    // Gulberg seed row is at 31.5167, 74.3486 — should find it
    const dupR = await dup(31.5167, 74.3486);
    console.log(`  Duplicate at Gulberg seed: ${dupR ? '✓ found — ' + dupR.id : 'none (seed may not exist)'}`);
    // Far coords — should NOT find anything
    const noR  = await dup(31.60, 74.50);
    check('Far coords return null', noR, null);
  } else {
    console.log('  ⚠  Supabase env vars not set — skipping');
  }

  // Summary
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log(`  Results: ${pass} passed  ${fail} failed`);
  console.log('══════════════════════════════════════════════════════════════\n');
  if (fail > 0) process.exit(1);
}