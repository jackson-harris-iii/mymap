import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSupabase } from '@/src/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const supabase = getServerSupabase(req, res);
  await supabase.auth.signOut();
  res.status(200).json({ ok: true });
}
