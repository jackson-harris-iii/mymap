import type { NextApiRequest, NextApiResponse } from 'next';
import { BraindumpIngestSchema } from '@/src/lib/zod';
import { requireUser } from '@/src/lib/auth';
import { getServerSupabase } from '@/src/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = await requireUser(req, res);
  if (!user) return;

  const parse = BraindumpIngestSchema.safeParse(req.body ?? {});
  if (!parse.success) return res.status(400).json({ error: 'Invalid payload' });

  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from('braindumps')
    .insert({ owner: user.id, ...parse.data })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ braindump: data });
}
