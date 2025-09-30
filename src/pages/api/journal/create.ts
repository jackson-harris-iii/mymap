import type { NextApiRequest, NextApiResponse } from 'next';
import { JournalCreateSchema } from '@/src/lib/zod';
import { requireUser } from '@/src/lib/auth';
import { getServerSupabase } from '@/src/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = await requireUser(req, res);
  if (!user) return;

  const parse = JournalCreateSchema.safeParse(req.body ?? {});
  if (!parse.success) return res.status(400).json({ error: 'Invalid payload' });

  const supabase = getServerSupabase();
  const { error } = await supabase
    .from('journal_entries')
    .upsert({ owner: user.id, ...parse.data }, { onConflict: 'owner,entry_date' });
  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ ok: true });
}
