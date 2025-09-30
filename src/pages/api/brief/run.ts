import type { NextApiRequest, NextApiResponse } from 'next';
import { DailyBriefSchema } from '@/src/lib/zod';
import { requireUser } from '@/src/lib/auth';
import { getServerSupabase } from '@/src/lib/supabase';
import { callLLMJson } from '@/src/lib/llm';
import { INTEREST_ANALYZER_SYSTEM, NEWS_CURATOR_SYSTEM } from '@/src/lib/prompts';
import { searchTavily } from '@/src/lib/tavily';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const method = req.method || 'POST';
  if (method !== 'POST') return res.status(405).end();
  const user = await requireUser(req, res);
  if (!user) return;

  const parse = DailyBriefSchema.safeParse(req.body ?? {});
  if (!parse.success) return res.status(400).json({ error: 'Invalid payload' });

  const supabase = getServerSupabase();
  const brief_date = parse.data.brief_date || new Date().toISOString().slice(0, 10);

  const { data: profile } = await supabase.from('profiles').select('interests, project_type').eq('id', user.id).maybeSingle();
  const { data: metrics } = await supabase
    .from('metrics_catalog')
    .select('label')
    .eq('owner', user.id);

  const interestTags = await callLLMJson<{ tags: string[] }>(
    INTEREST_ANALYZER_SYSTEM,
    JSON.stringify({ interests: profile?.interests ?? [], metrics: metrics?.map((m) => m.label) ?? [] })
  );

  const tavilyResults: any[] = [];
  for (const tag of interestTags.tags.slice(0, 5)) {
    const results = await searchTavily(tag, interestTags.tags);
    tavilyResults.push(...results);
  }

  if (!tavilyResults.length) {
    return res.status(200).json({ items: [] });
  }

  const curated = await callLLMJson<{ title: string; url: string; published_at: string; why_it_matters: string; action: string }[]>(
    NEWS_CURATOR_SYSTEM,
    JSON.stringify({ results: tavilyResults, interests: interestTags.tags })
  );

  const { error } = await supabase
    .from('daily_briefs')
    .upsert(
      {
        owner: user.id,
        brief_date,
        items: curated,
      },
      { onConflict: 'owner,brief_date' }
    );
  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ items: curated });
}
