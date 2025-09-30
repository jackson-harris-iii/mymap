import type { NextApiRequest, NextApiResponse } from 'next';
import { YouTubeWeekRequestSchema } from '@/src/lib/zod';
import { requireUser } from '@/src/lib/auth';
import { getServerSupabase } from '@/src/lib/supabase';
import { callLLM } from '@/src/lib/llm';
import { YOUTUBE_WEEK_ANALYST_SYSTEM } from '@/src/lib/prompts';
import { startOfIsoWeekMondayFromEnd } from '@/src/lib/reports';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = await requireUser(req, res);
  if (!user) return;

  const parse = YouTubeWeekRequestSchema.safeParse(req.body ?? {});
  if (!parse.success) return res.status(400).json({ error: 'Invalid payload' });

  const supabase = getServerSupabase();
  const sunday = new Date(parse.data.period_week + 'T00:00:00Z');
  const start = startOfIsoWeekMondayFromEnd(sunday).toISOString();
  const end = new Date(sunday);
  end.setDate(end.getDate() + 1);

  const { data, error } = await supabase
    .from('youtube_history_items')
    .select('video_title, channel_title, watched_at')
    .eq('owner', user.id)
    .gte('watched_at', start)
    .lt('watched_at', end.toISOString());
  if (error) return res.status(500).json({ error: error.message });

  const totalVideos = data?.length ?? 0;
  const estMinutes = totalVideos * 8;
  const channelCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};

  for (const item of data ?? []) {
    const channel = item.channel_title || 'Unknown';
    channelCounts[channel] = (channelCounts[channel] || 0) + 1;
    const title = (item.video_title ?? '').toLowerCase();
    const category = /(tutorial|how to|course|learn|code|build)/.test(title)
      ? 'education'
      : /(news|update|explained)/.test(title)
      ? 'news'
      : /(music|vlog|gaming|highlight)/.test(title)
      ? 'entertainment'
      : 'other';
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  }

  const summary_md = await callLLM(
    YOUTUBE_WEEK_ANALYST_SYSTEM,
    JSON.stringify({ totalVideos, estMinutes, topChannels: channelCounts, categories: categoryCounts })
  );

  const { error: upsertError } = await supabase
    .from('weekly_activity_reviews')
    .upsert(
      {
        owner: user.id,
        period_week: parse.data.period_week,
        source: 'youtube',
        summary_md,
        toplines: { totalVideos, estMinutes, channelCounts, categoryCounts },
      },
      { onConflict: 'owner,period_week,source' }
    );
  if (upsertError) return res.status(500).json({ error: upsertError.message });

  res.status(200).json({ summary_md });
}
