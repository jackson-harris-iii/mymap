import type { NextApiRequest, NextApiResponse } from 'next';
import { MetricReportSchema } from '@/src/lib/zod';
import { requireUser } from '@/src/lib/auth';
import { getServerSupabase } from '@/src/lib/supabase';
import { callLLM } from '@/src/lib/llm';
import { METRICS_ANALYST_SYSTEM } from '@/src/lib/prompts';
import { endOfIsoWeekSunday, startOfIsoWeekMondayFromEnd } from '@/src/lib/reports';

function formatSunday(date?: string) {
  if (date) return new Date(date + 'T00:00:00Z');
  const now = new Date();
  return endOfIsoWeekSunday(now);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = await requireUser(req, res);
  if (!user) return;

  const parse = MetricReportSchema.safeParse(req.body ?? {});
  if (!parse.success) return res.status(400).json({ error: 'Invalid payload' });

  const supabase = getServerSupabase();
  const periodSunday = formatSunday(parse.data.period_date);
  const start = startOfIsoWeekMondayFromEnd(periodSunday).toISOString().slice(0, 10);
  const end = periodSunday.toISOString().slice(0, 10);

  const { data: currentValues, error: currentError } = await supabase
    .from('metrics_values')
    .select('value, period_date, metrics_catalog(id,key,label,unit)')
    .eq('owner', user.id)
    .eq('period_date', end);
  if (currentError) return res.status(500).json({ error: currentError.message });
  if (!currentValues?.length) {
    return res.status(400).json({ error: 'No metrics recorded for this period' });
  }

  const prevSunday = new Date(periodSunday);
  prevSunday.setDate(prevSunday.getDate() - 7);
  const prevEnd = prevSunday.toISOString().slice(0, 10);

  const { data: prevValues } = await supabase
    .from('metrics_values')
    .select('value, metrics_catalog(id,key,label,unit)')
    .eq('owner', user.id)
    .eq('period_date', prevEnd);

  const metrics = currentValues.map((row) => {
    const key = row.metrics_catalog?.key ?? '';
    const previous = prevValues?.find((prev) => prev.metrics_catalog?.key === key)?.value ?? 0;
    return {
      key,
      label: row.metrics_catalog?.label ?? key,
      unit: row.metrics_catalog?.unit ?? '',
      thisWeek: row.value,
      lastWeek: previous,
    };
  });

  const report_md = await callLLM(
    METRICS_ANALYST_SYSTEM,
    JSON.stringify({ metrics, period: end })
  );

  const { error: upsertError } = await supabase.from('weekly_reports').upsert(
    {
      owner: user.id,
      period_date: end,
      report_md,
    },
    { onConflict: 'owner,period_date' }
  );
  if (upsertError) return res.status(500).json({ error: upsertError.message });

  res.status(200).json({ report_md });
}
