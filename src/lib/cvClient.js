// src/lib/cvClient.js

const CV_SERVICE_URL = process.env.CV_SERVICE_URL;
const CV_SERVICE_SECRET = process.env.CV_SERVICE_SECRET;

export async function checkCVHealth() {
  const res = await fetch(`${CV_SERVICE_URL}/health`, {
    headers: { 'x-cv-secret': CV_SERVICE_SECRET },
  });
  return res.ok;
}

export async function detectPothole(imageBuffer, filename) {
  const { FormData, Blob } = await import('node-fetch');
  const form = new FormData();
  form.append('file', new Blob([imageBuffer], { type: 'image/jpeg' }), filename);

  const res = await fetch(`${CV_SERVICE_URL}/detect`, {
    method: 'POST',
    headers: {
      'x-cv-secret': CV_SERVICE_SECRET,
    },
    body: form,
  });

  if (!res.ok) throw new Error(`CV service error: ${res.status}`);
  return res.json();
}

// Self-test — runs only via: node src/lib/cvClient.js
if (process.argv[1].includes('cvClient')) {
  (async () => {
    console.log('--- cvClient self-test ---');

    const healthy = await checkCVHealth();
    console.log('Health check:', healthy ? 'PASS' : 'FAIL');
    if (!healthy) { console.error('CV service unreachable'); process.exit(1); }

    const fs = await import('fs');
    const imagePath = process.argv[2] || './tests/fixtures/pothole-real.jpg';
    const imageBuffer = fs.readFileSync(imagePath);
    const result = await detectPothole(imageBuffer, 'test.jpg');
    console.log('Detection result:', JSON.stringify(result, null, 2));
  })();
}