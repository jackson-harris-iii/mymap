import type { NextApiRequest, NextApiResponse } from 'next';
import { BraindumpAnalyzeSchema } from '@/src/lib/zod';
import { requireUser } from '@/src/lib/auth';
import { getServerSupabase } from '@/src/lib/supabase';
import { callLLM, callLLMJson } from '@/src/lib/llm';
import { BRAIN_DUMP_ANALYST_SYSTEM, INSIGHT_EXTRACTOR_SYSTEM } from '@/src/lib/prompts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = await requireUser(req, res);
  if (!user) return;

  const parse = BraindumpAnalyzeSchema.safeParse(req.body ?? {});
  if (!parse.success) return res.status(400).json({ error: 'Invalid payload' });

  const supabase = getServerSupabase();
  const { data: braindump, error } = await supabase
    .from('braindumps')
    .select('id, title, content')
    .eq('owner', user.id)
    .eq('id', parse.data.braindump_id)
    .single();
  if (error || !braindump) return res.status(404).json({ error: 'Brain dump not found' });

  const insights = await callLLMJson<{ themes: string[]; questions: string[]; connections: string[]; breakthroughs: string[] }>(
    INSIGHT_EXTRACTOR_SYSTEM,
    JSON.stringify({ content: braindump.content })
  );

  const analysis_md = await callLLM(
    BRAIN_DUMP_ANALYST_SYSTEM,
    JSON.stringify({ braindump, insights })
  );

  const { error: upsertError } = await supabase
    .from('braindump_analyses')
    .upsert(
      {
        owner: user.id,
        braindump_id: braindump.id,
        analysis_md,
      },
      { onConflict: 'owner,braindump_id' }
    );
  if (upsertError) return res.status(500).json({ error: upsertError.message });

  res.status(200).json({ analysis_md, insights });
}
