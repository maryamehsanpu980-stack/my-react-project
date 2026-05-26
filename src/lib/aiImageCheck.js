// src/lib/aiImageCheck.js

import { readFileSync } from 'fs';

const HF_MODEL = 'umm-maybe/AI-image-detector';
const HF_API   = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

/**
 * Sends image bytes to Hugging Face to detect AI-generated content.
 *
 * Returns:
 *   { isAI: false }        — authentic photo, safe to continue
 *   { isAI: true, score }  — AI-generated, reject
 *   { isAI: null }         — API unavailable, skip check (don't reject)
 */
export async function checkAIGenerated(imageBuffer) {
  const key = process.env.HUGGINGFACE_API_KEY;
  if (!key) return { isAI: null };

  try {
    const res = await fetch(HF_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/octet-stream',
      },
      body: imageBuffer,
    });

    if (!res.ok) return { isAI: null };

    const results = await res.json();

    const aiEntry = results.find((r) =>
      r.label?.toLowerCase().includes('artificial') ||
      r.label?.toLowerCase().includes('ai')
    );

    if (!aiEntry) return { isAI: null };

    const isAI = aiEntry.score >= 0.85;
    return { isAI, score: aiEntry.score };
  } catch (err) {
    console.error('[aiImageCheck] Error:', err.message);
    return { isAI: null };
  }
}

// ─── run: node src/lib/aiImageCheck.js ───────────────────────────────────────
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log('\n══════════════════════════════════════════');
console.log('  AI Image Check Test');
console.log('══════════════════════════════════════════\n');

const key = process.env.HUGGINGFACE_API_KEY;
console.log('HUGGINGFACE_API_KEY:', key ? `SET ✓  (${key.slice(0,6)}...)` : 'NOT SET ✗');

// Test 1 — fake buffer
console.log('\nTest 1 — fake buffer (should return null, not crash)');
const t1 = await checkAIGenerated(Buffer.from('not-an-image'));
console.log('  isAI  :', t1.isAI);
console.log('  result:', t1.isAI === null ? '✓ PASS' : '✗ FAIL');

// Test 2 — real pothole photo
console.log('\nTest 2 — real road photo (should return isAI: false)');
const buffer = readFileSync('E:/pothole.jpg');  // forward slash works on Windows
console.log('  File size:', buffer.length, 'bytes');
const t2 = await checkAIGenerated(buffer);
console.log('  isAI  :', t2.isAI);
console.log('  score :', t2.score);
console.log('  label :', t2.label);

if (t2.isAI === null) {
  console.log('  result: ⚠  API key missing or Hugging Face unavailable');
  console.log('          Try mobile hotspot if on university/office WiFi');
} else if (t2.isAI === false) {
  console.log('  result: ✓ PASS — real photo correctly identified as authentic');
} else {
  console.log('  result: ✗ FAIL — real photo wrongly flagged as AI-generated');
}

console.log('\n══════════════════════════════════════════\n');