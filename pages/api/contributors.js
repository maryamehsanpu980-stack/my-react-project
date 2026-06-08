import { getServiceClient } from '../../src/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from('contributors')
    .select('id, name, email, report_count')
    .order('report_count', { ascending: false })
    .order('name', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json(data ?? []);
}