import { getServiceClient } from '../../src/lib/supabase';

export default async function handler(req, res) {
  const supabase = getServiceClient();

  // Radius search: GET /api/reports?lat=31.5&lng=74.3&radius=500
  if (req.method === 'GET' && req.query.lat && req.query.lng) {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = parseInt(req.query.radius) || 500;

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'Invalid lat/lng' });
    }

    const { data, error } = await supabase.rpc('search_detections_radius', {
      p_lat: lat,
      p_lng: lng,
      p_radius: radius,
      p_status: 'approved',
    });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // GET all approved detections for map
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('detections')
      .select('id, lat, lng, location_text, severity, confidence, source, contributor_name, created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ error: 'Method not allowed' });
}