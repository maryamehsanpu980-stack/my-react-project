import { getServiceClient } from '../../../src/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = getServiceClient();
  const { id } = req.query;

  const { data, error } = await supabase
    .from('detections')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return res.status(404).json({ error: 'Report not found' });
  return res.status(200).json(data);
}