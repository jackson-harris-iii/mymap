import type { NextApiRequest, NextApiResponse } from 'next';
import { MetricSubmitSchema } from '@/src/lib/zod';
import { requireUser } from '@/src/lib/auth';
import { getServerSupabase } from '@/src/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = await requireUser(req, res);
  if (!user) return;
  const parse = MetricSubmitSchema.safeParse(req.body ?? {});
  if (!parse.success) return res.status(400).json({ error: 'Invalid payload' });

  const supabase = getServerSupabase();
  const { period_date, values } = parse.data;
  const saved: any[] = [];

  for (const value of values) {
    const { data: existing } = await supabase
      .from('metrics_catalog')
      .select('id')
      .eq('owner', user.id)
      .eq('key', value.key)
      .maybeSingle();

    let metricId = existing?.id;
    if (!metricId) {
      const { data: inserted, error: insertError } = await supabase
        .from('metrics_catalog')
        .insert({ owner: user.id, key: value.key, label: value.label ?? value.key, unit: value.unit })
        .select('id')
        .single();
      if (insertError) return res.status(500).json({ error: insertError.message });
      metricId = inserted.id;
    }

    const { data: upserted, error } = await supabase
      .from('metrics_values')
      .upsert(
        {
          owner: user.id,
          metric_id: metricId,
          period_date,
          value: value.value,
        },
        { onConflict: 'owner,metric_id,period_date' }
      )
      .select();

    if (error) return res.status(500).json({ error: error.message });
    saved.push(...(upserted ?? []));
  }

  res.status(200).json({ values: saved });
}
