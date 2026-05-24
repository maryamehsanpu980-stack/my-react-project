import { getServiceClient } from '../../src/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = getServiceClient();

  // Get contributors who have at least one approved detection
  // Groups by name+email, counts reports, orders by most reports
  const { data, error } = await supabase
    .from('detections')
    .select('contributor_name, contributor_email, created_at')
    .eq('status', 'approved')
    .not('contributor_name', 'is', null);

  if (error) return res.status(500).json({ error: error.message });

  // Aggregate by email
  const map = {};
  for (const row of data) {
    const key = row.contributor_email || row.contributor_name;
    if (!map[key]) {
      map[key] = {
        name: row.contributor_name,
        report_count: 0,
      };
    }
    map[key].report_count++;
  }

  const contributors = Object.values(map)
    .sort((a, b) => b.report_count - a.report_count);

  return res.status(200).json(contributors);
}