// src/lib/cvClient.js
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const CV_SERVICE_URL = process.env.CV_SERVICE_URL;
const CV_SERVICE_SECRET = process.env.CV_SERVICE_SECRET;

if (!CV_SERVICE_URL) {
  throw new Error('CV_SERVICE_URL missing');
}

export async function checkCVHealth() {
  const res = await fetch(`${CV_SERVICE_URL}/health`, {
    headers: { 'x-cv-secret': CV_SERVICE_SECRET },
  });
  return res.ok;
}

export async function detectPothole(imageBuffer, filename) {
  
  const form = new FormData();
  form.append('file', new Blob([imageBuffer], { type: 'image/jpeg' }), filename);
  for (const [key, value] of form.entries()) {
  console.log({
    key,
    value,
    type: value?.type,
    size: value?.size,
    name: value?.name,
    file: value?.file
  });
}
  const res = await fetch(`${CV_SERVICE_URL}/detect`, {
    method: 'POST',
    headers: {
      'x-cv-secret': CV_SERVICE_SECRET,
    },
    body: form,
  });

  if (!res.ok) {
  let errorBody;

  try {
    errorBody = await res.text();
  } catch (e) {
    errorBody = "Failed to read error body";
  }

  console.error("CV service error:", {
    status: res.status,
    statusText: res.statusText,
    body: errorBody,
  });

  throw new Error(
    `CV service error: ${res.status} ${res.statusText} - ${errorBody}`
  );
}

  console.log('CV service response status:', res.status);
  return res.json();
}

// Self-test — runs only via: node src/lib/cvClient.js

  