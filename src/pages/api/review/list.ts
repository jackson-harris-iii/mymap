import type { NextApiRequest, NextApiResponse } from 'next';
import { requireUser } from '@/src/lib/auth';
import { getServerSupabase } from '@/src/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') return res.status(405).end();
  const user = await requireUser(req, res);
  if (!user) return;

  const { week } = req.query;
  if (!week || typeof week !== 'string') {
    return res.status(400).json({ error: 'Missing week parameter' });
  }

  const supabase = getServerSupabase(req, res);

  const { data: reviews, error } = await supabase
    .from('weekly_activity_reviews')
    .select('source, summary_md, toplines, created_at')
    .eq('owner', user.id)
    .eq('period_week', week);

  if (error) return res.status(500).json({ error: error.message });

  const result: any = {};
  reviews?.forEach((review) => {
    result[review.source] = review;
  });

  res.status(200).json(result);
}
