import type { NextApiRequest, NextApiResponse } from 'next';
import { JournalAnalyzeSchema } from '@/src/lib/zod';
import { requireUser } from '@/src/lib/auth';
import { getServerSupabase } from '@/src/lib/supabase';
import { callLLM } from '@/src/lib/llm';
import { DAILY_REFLECTION_SYSTEM } from '@/src/lib/prompts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = await requireUser(req, res);
  if (!user) return;

  const parse = JournalAnalyzeSchema.safeParse(req.body ?? {});
  if (!parse.success) return res.status(400).json({ error: 'Invalid payload' });

  const supabase = getServerSupabase();
  const { entry_date } = parse.data;

  const { data: today, error: todayError } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('owner', user.id)
    .eq('entry_date', entry_date)
    .single();
  if (todayError || !today) return res.status(404).json({ error: 'Entry not found' });

  const { data: previous } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('owner', user.id)
    .lt('entry_date', entry_date)
    .order('entry_date', { ascending: false })
    .limit(3);

  const reflection_md = await callLLM(
    DAILY_REFLECTION_SYSTEM,
    JSON.stringify({ today, history: previous ?? [] })
  );

  const { error } = await supabase
    .from('journal_reflections')
    .upsert(
      {
        owner: user.id,
        entry_id: today.id,
        reflection_md,
      },
      { onConflict: 'owner,entry_id' }
    );
  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ reflection_md });
}
