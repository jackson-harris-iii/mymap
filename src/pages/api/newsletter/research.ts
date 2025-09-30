import type { NextApiRequest, NextApiResponse } from 'next';
import { NewsletterResearchSchema } from '@/src/lib/zod';
import { requireUser } from '@/src/lib/auth';
import { getServerSupabase } from '@/src/lib/supabase';
import { callLLMJson } from '@/src/lib/llm';
import { CONTENT_RESEARCHER_SYSTEM } from '@/src/lib/prompts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = await requireUser(req, res);
  if (!user) return;

  const parse = NewsletterResearchSchema.safeParse(req.body ?? {});
  if (!parse.success) return res.status(400).json({ error: 'Invalid payload' });

  const supabase = getServerSupabase();
  const period = parse.data.period_week;
  const periodDate = new Date(period + 'T00:00:00Z');
  const since = new Date(periodDate);
  since.setDate(periodDate.getDate() - 21);

  const { data: posts } = await supabase
    .from('newsletter_posts')
    .select('*')
    .eq('owner', user.id)
    .gte('published_at', since.toISOString())
    .order('published_at', { ascending: false });

  const research = await callLLMJson<{ trends: string[]; gaps: string[]; angles: string[] }>(
    CONTENT_RESEARCHER_SYSTEM,
    JSON.stringify({ period, posts: posts ?? [] })
  );

  res.status(200).json({ research });
}
