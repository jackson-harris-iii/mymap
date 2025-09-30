import type { NextApiRequest, NextApiResponse } from 'next';
import { NewsletterSourcesSchema } from '@/src/lib/zod';
import { requireUser } from '@/src/lib/auth';
import { getServerSupabase } from '@/src/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = await requireUser(req, res);
  if (!user) return;

  const parse = NewsletterSourcesSchema.safeParse(req.body ?? {});
  if (!parse.success) return res.status(400).json({ error: 'Invalid payload' });

  const supabase = getServerSupabase();

  if (parse.data.add) {
    for (const source of parse.data.add) {
      const { error } = await supabase
        .from('newsletter_sources')
        .upsert({ owner: user.id, ...source }, { onConflict: 'owner,url' });
      if (error) return res.status(500).json({ error: error.message });
    }
  }

  if (parse.data.remove_ids) {
    const { error } = await supabase
      .from('newsletter_sources')
      .delete()
      .eq('owner', user.id)
      .in('id', parse.data.remove_ids);
    if (error) return res.status(500).json({ error: error.message });
  }

  const { data } = await supabase.from('newsletter_sources').select('*').eq('owner', user.id);
  res.status(200).json({ sources: data ?? [] });
}
