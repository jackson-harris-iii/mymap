import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'node:fs/promises';
import { parse } from 'csv-parse/sync';
import { requireUser } from '@/src/lib/auth';
import { getServerSupabase } from '@/src/lib/supabase';
import { domainToCategory, toHostname } from '@/src/lib/reports';

export const config = { api: { bodyParser: false } };

type Row = { url: string; title?: string; last_visit_time: string; visit_count?: string | number };

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

    const buffer = await fs.readFile(file.filepath);
    const text = buffer.toString('utf8');
    let rows: Row[] = [];
    if ((file.mimetype ?? '').includes('json') || (file.originalFilename ?? '').endsWith('.json')) {
      rows = JSON.parse(text);
    } else {
      rows = parse(text, { columns: true, skip_empty_lines: true }) as Row[];
    }

    const supabase = getServerSupabase();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 14);
    let inserted = 0;

    for (const row of rows) {
      if (!row.url || !row.last_visit_time) continue;
      const visitedAt = new Date(row.last_visit_time);
      if (isNaN(visitedAt.getTime()) || visitedAt < cutoff) continue;
      const domain = toHostname(row.url);
      if (!domain) continue;
      const visits = Number(row.visit_count ?? 1) || 1;
      const category = domainToCategory(domain, row.title);

      const { error } = await supabase.from('browser_history_items').insert({
        owner: user.id,
        visited_at: visitedAt.toISOString(),
        url: row.url,
        title: row.title ?? null,
        domain,
        visits,
        category,
      });
      if (!error) inserted++;
    }

    res.status(200).json({ inserted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to ingest browser history' });
  }
}
