import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSupabase } from '@/src/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { code } = req.query;

  if (code) {
    const supabase = getServerSupabase(req, res);
    await supabase.auth.exchangeCodeForSession(String(code));
  }

  res.redirect('/dashboard');
}
