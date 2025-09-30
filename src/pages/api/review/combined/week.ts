import type { NextApiRequest, NextApiResponse } from 'next';
import { CombinedWeekRequestSchema } from '@/src/lib/zod';
import { requireUser } from '@/src/lib/auth';
import { getServerSupabase } from '@/src/lib/supabase';
import { callLLM } from '@/src/lib/llm';
import { COMBINED_WEEK_ANALYST_SYSTEM } from '@/src/lib/prompts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = await requireUser(req, res);
  if (!user) return;

  const parse = CombinedWeekRequestSchema.safeParse(req.body ?? {});
  if (!parse.success) return res.status(400).json({ error: 'Invalid payload' });

  const supabase = getServerSupabase();

  const { data: youtube } = await supabase
    .from('weekly_activity_reviews')
    .select('toplines')
    .eq('owner', user.id)
    .eq('period_week', parse.data.period_week)
    .eq('source', 'youtube')
    .maybeSingle();

  const { data: browser } = await supabase
    .from('weekly_activity_reviews')
    .select('toplines')
    .eq('owner', user.id)
    .eq('period_week', parse.data.period_week)
    .eq('source', 'browser')
    .maybeSingle();

  if (!youtube && !browser) return res.status(400).json({ error: 'Missing source reviews' });

  const summary_md = await callLLM(
    COMBINED_WEEK_ANALYST_SYSTEM,
    JSON.stringify({ youtube: youtube?.toplines ?? null, browser: browser?.toplines ?? null })
  );

  const { error: upsertError } = await supabase
    .from('weekly_activity_reviews')
    .upsert(
      {
        owner: user.id,
        period_week: parse.data.period_week,
        source: 'combined',
        summary_md,
        toplines: { youtube: youtube?.toplines ?? null, browser: browser?.toplines ?? null },
      },
      { onConflict: 'owner,period_week,source' }
    );
  if (upsertError) return res.status(500).json({ error: upsertError.message });

  res.status(200).json({ summary_md });
}
