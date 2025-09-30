import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'node:fs/promises';
import { requireUser } from '@/src/lib/auth';
import { getServerSupabase } from '@/src/lib/supabase';

export const config = { api: { bodyParser: false } };

type TakeoutItem = {
  title?: string;
  titleUrl?: string;
  time?: string;
  subtitles?: { name?: string; url?: string }[];
};

function parseForm(req: NextApiRequest) {
  const form = formidable({ multiples: false });
  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = await requireUser(req, res);
  if (!user) return;

  try {
    const { files } = await parseForm(req);
    const file = files.file as formidable.File | undefined;
    if (!file) return res.status(400).json({ error: 'Missing file' });

    const raw = await fs.readFile(file.filepath, 'utf8');
    const data = JSON.parse(raw) as TakeoutItem[];

    const supabase = getServerSupabase();
    let inserted = 0;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 14);

    for (const item of data) {
      const time = item.time ? new Date(item.time) : null;
      if (!time || time < cutoff) continue;
      if (!item.titleUrl) continue;
      const { error } = await supabase.from('youtube_history_items').insert({
        owner: user.id,
        watched_at: time.toISOString(),
        video_url: item.titleUrl,
        video_title: item.title ?? null,
        channel_title: item.subtitles?.[0]?.name ?? null,
        channel_url: item.subtitles?.[0]?.url ?? null,
      });
      if (!error) inserted++;
    }

    res.status(200).json({ inserted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to ingest history' });
  }
}
