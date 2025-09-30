import type { NextApiRequest, NextApiResponse } from 'next';
import { NewsletterFetchSchema } from '@/src/lib/zod';
import { requireUser } from '@/src/lib/auth';
import { getServerSupabase } from '@/src/lib/supabase';
import { fetchFeed } from '@/src/lib/rss';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = await requireUser(req, res);
  if (!user) return;

  const parse = NewsletterFetchSchema.safeParse(req.body ?? {});
  if (!parse.success) return res.status(400).json({ error: 'Invalid payload' });

  const supabase = getServerSupabase();
  const { data: sources } = await supabase.from('newsletter_sources').select('*').eq('owner', user.id);
  const inserted: any[] = [];

  for (const source of sources ?? []) {
    if (!source.url) continue;
    const feed = await fetchFeed(source.url);
    for (const item of feed?.items ?? []) {
      const link = item.link ?? item.guid;
      if (!link) continue;
      const { error } = await supabase
        .from('newsletter_posts')
        .upsert(
          {
            owner: user.id,
            source_id: source.id,
            title: item.title ?? 'Untitled',
            link,
            summary: item.contentSnippet ?? item.content ?? '',
            published_at: item.isoDate ?? item.pubDate ?? null,
          },
          { onConflict: 'owner,source_id,link' }
        );
      if (!error) inserted.push(link);
    }
  }

  res.status(200).json({ inserted: inserted.length });
}
