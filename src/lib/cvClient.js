export async function detectPothole(imageBuffer, filename) {
  const { FormData, Blob } = await import('node-fetch');
  const form = new FormData();
  form.append('file', new Blob([imageBuffer], { type: 'image/jpeg' }), filename);

  const res = await fetch(`${process.env.CV_SERVICE_URL}/detect`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error(`CV service error: ${res.status}`);
  return res.json();
}