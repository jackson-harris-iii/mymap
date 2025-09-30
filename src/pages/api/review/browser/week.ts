import type { NextApiRequest, NextApiResponse } from 'next';
import { BrowserWeekRequestSchema } from '@/src/lib/zod';
import { requireUser } from '@/src/lib/auth';
import { getServerSupabase } from '@/src/lib/supabase';
import { bucketDaypart, startOfIsoWeekMondayFromEnd } from '@/src/lib/reports';
import { callLLM } from '@/src/lib/llm';
import { BROWSER_WEEK_ANALYST_SYSTEM } from '@/src/lib/prompts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = await requireUser(req, res);
  if (!user) return;

  const parse = BrowserWeekRequestSchema.safeParse(req.body ?? {});
  if (!parse.success) return res.status(400).json({ error: 'Invalid payload' });

  const supabase = getServerSupabase();
  const sunday = new Date(parse.data.period_week + 'T00:00:00Z');
  const start = startOfIsoWeekMondayFromEnd(sunday).toISOString();
  const end = new Date(sunday);
  end.setDate(end.getDate() + 1);

  const { data, error } = await supabase
    .from('browser_history_items')
    .select('domain, category, visited_at, visits')
    .eq('owner', user.id)
    .gte('visited_at', start)
    .lt('visited_at', end.toISOString());
  if (error) return res.status(500).json({ error: error.message });

  const domainCounts: Record<string, number> = {};
  const categories: Record<string, number> = {};
  const dayparts: Record<string, number> = { morning: 0, afternoon: 0, evening: 0, late: 0 };
  let totalVisits = 0;

  for (const row of data ?? []) {
    const visits = row.visits ?? 1;
    totalVisits += visits;
    domainCounts[row.domain] = (domainCounts[row.domain] || 0) + visits;
    const cat = row.category ?? 'other';
    categories[cat] = (categories[cat] || 0) + visits;
    const dp = bucketDaypart(new Date(row.visited_at));
    dayparts[dp] += visits;
  }

  const focus = (categories['work'] ?? 0) + (categories['learn'] ?? 0);
  const focusRatio = totalVisits ? Math.round((focus / totalVisits) * 100) : 0;

  const summary_md = await callLLM(
    BROWSER_WEEK_ANALYST_SYSTEM,
    JSON.stringify({ totalVisits, totalDomains: Object.keys(domainCounts).length, focusRatio, dayparts, domainCounts, categories })
  );

  const { error: upsertError } = await supabase
    .from('weekly_activity_reviews')
    .upsert(
      {
        owner: user.id,
        period_week: parse.data.period_week,
        source: 'browser',
        summary_md,
        toplines: { totalVisits, domainCounts, categories, dayparts, focusRatio },
      },
      { onConflict: 'owner,period_week,source' }
    );
  if (upsertError) return res.status(500).json({ error: upsertError.message });

  res.status(200).json({ summary_md });
}
