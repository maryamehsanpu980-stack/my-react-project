// src/lib/aiImageCheck.js

const HF_MODEL = 'umm-maybe/AI-image-detector';
const HF_API   = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

/**
 * Sends image bytes to Hugging Face to detect AI-generated content.
 *
 * Returns:
 *   { isAI: false }           — authentic photo, safe to continue
 *   { isAI: true,  score }    — AI-generated, reject
 *   { isAI: null }            — API unavailable, skip check (don't reject)
 */
export async function checkAIGenerated(imageBuffer) {
  const key = process.env.HUGGINGFACE_API_KEY;
  if (!key) return { isAI: null }; // skip if no key configured

  try {
    const res = await fetch(HF_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/octet-stream',
      },
      body: imageBuffer,
    });

    if (!res.ok) return { isAI: null }; // API down — don't block submission

    const results = await res.json();

    // Response is an array: [{ label: 'artificial', score: 0.9 }, { label: 'human', score: 0.1 }]
    const aiEntry = results.find((r) =>
      r.label?.toLowerCase().includes('artificial') ||
      r.label?.toLowerCase().includes('ai')
    );

    if (!aiEntry) return { isAI: null };

    // Reject if AI confidence exceeds 85%
    const isAI = aiEntry.score >= 0.85;
    return { isAI, score: aiEntry.score };
  } catch (err) {
    console.error('[aiImageCheck] Error:', err.message);
    return { isAI: null }; // fail open — don't block legitimate uploads
  }
}