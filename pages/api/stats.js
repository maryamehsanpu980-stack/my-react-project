import { getServiceClient } from '../../src/lib/supabase';

export default async function handler(req, res) {
  const supabase = getServiceClient();
  
  const { count: total } = await supabase
    .from('detections')
    .select('*', { count: 'exact', head: true });

  const { count: approved } = await supabase
    .from('detections')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  const { data: contribData } = await supabase
    .from('detections')
    .select('contributor_email, contributor_name')
    .eq('status', 'approved')
    .not('contributor_name', 'is', null);

  const uniqueContributors = new Set(
    contribData?.map(r => r.contributor_email || r.contributor_name)
  ).size;

  return res.status(200).json({ 
    total: total || 0, 
    approved: approved || 0,
    contributors: uniqueContributors || 0
  });
}