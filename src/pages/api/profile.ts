import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSupabase } from '@/src/lib/supabase';
import { requireUser } from '@/src/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res);
  if (!user) return;
  const supabase = getServerSupabase();

  if (req.method === 'GET') {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    res.status(200).json({ profile: data });
    return;
  }

  if (req.method === 'POST') {
    const { project_type, interests, full_name } = req.body ?? {};
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      project_type,
      interests,
      full_name,
      updated_at: new Date().toISOString(),
    });
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).end();
}
