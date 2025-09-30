import type { NextApiRequest, NextApiResponse } from 'next';
import { NewsletterDraftSchema } from '@/src/lib/zod';
import { requireUser } from '@/src/lib/auth';
import { getServerSupabase } from '@/src/lib/supabase';
import { callLLM } from '@/src/lib/llm';
import { NEWSLETTER_WRITER_SYSTEM } from '@/src/lib/prompts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = await requireUser(req, res);
  if (!user) return;

  const parse = NewsletterDraftSchema.safeParse(req.body ?? {});
  if (!parse.success) return res.status(400).json({ error: 'Invalid payload' });

  const supabase = getServerSupabase();
  const period = parse.data.period_week;

  const { data: posts } = await supabase
    .from('newsletter_posts')
    .select('title, summary, published_at, link')
    .eq('owner', user.id)
    .gte('published_at', new Date(new Date(period).getTime() - 21 * 86400000).toISOString())
    .order('published_at', { ascending: false });

  const { data: previousDrafts } = await supabase
    .from('newsletter_drafts')
    .select('draft_md')
    .eq('owner', user.id)
    .order('created_at', { ascending: false })
    .limit(2);

  const userVoiceSample = previousDrafts?.map((draft) => draft.draft_md).join('\n\n') ?? '';

  const draft = await callLLM(
    NEWSLETTER_WRITER_SYSTEM,
    JSON.stringify({ period, posts: posts ?? [], sample: userVoiceSample })
  );

  const subjects = draft
    .split('\n')
    .filter((line) => line.trim().startsWith('-'))
    .map((line) => line.replace(/^-\s*/, '').trim())
    .slice(0, 3);

  const bodyIndex = draft.indexOf('DRAFT:');
  const body = bodyIndex >= 0 ? draft.slice(bodyIndex + 6).trim() : draft.trim();

  const { error: upsertError } = await supabase
    .from('newsletter_drafts')
    .upsert(
      {
        owner: user.id,
        period_week: period,
        subject_options: subjects,
        draft_md: body,
      },
      { onConflict: 'owner,period_week' }
    );

  if (upsertError) return res.status(500).json({ error: upsertError.message });

  res.status(200).json({ subjects, draft_md: body });
}
