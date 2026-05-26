// src/lib/aiImageCheck.js

const HF_MODEL = 'umm-maybe/AI-image-detector';
const HF_API   = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

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