import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'node:fs/promises';
import { parse } from 'csv-parse/sync';
import { requireUser } from '@/src/lib/auth';
import { getServerSupabase } from '@/src/lib/supabase';
import { domainToCategory, toHostname } from '@/src/lib/reports';

export const config = { api: { bodyParser: false } };

type ChromeHistoryRow = {
  order?: string | number;
  id?: string | number;
  date?: string;
  time?: string;
  title?: string;
  url?: string;
  visitCount?: string | number;
  typedCount?: string | number;
  transition?: string;
  visitTime?: number;
  last_visit_time?: string;
  visit_count?: string | number;
};

function parseForm(req: NextApiRequest) {
  const form = formidable({ multiples: false });
  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>(
    (resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    }
  );
}

function parseDateTime(date: string, time: string): Date {
  try {
    const dateTimeStr = `${date} ${time}`;
    const parsed = new Date(dateTimeStr);

    if (!isNaN(parsed.getTime())) {
      return parsed;
    }

    const [month, day, year] = date.split('/').map(Number);
    const timeParts = time.split(':');
    const hour = parseInt(timeParts[0]);
    const minute = parseInt(timeParts[1]);
    const second = timeParts[2] ? parseInt(timeParts[2]) : 0;

    return new Date(year, month - 1, day, hour, minute, second);
  } catch (e) {
    return new Date(NaN);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = await requireUser(req, res);
  if (!user) return;

  try {
    const { files } = await parseForm(req);

    const fileArray = files.file as
      | formidable.File
      | formidable.File[]
      | undefined;
    const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;

    if (!file || !file.filepath) {
      return res.status(400).json({ error: 'Missing file' });
    }

    const buffer = await fs.readFile(file.filepath);
    const text = buffer.toString('utf8');

    let rows: ChromeHistoryRow[] = [];
    const isJson =
      (file.mimetype ?? '').includes('json') ||
      (file.originalFilename ?? '').endsWith('.json');

    if (isJson) {
      rows = JSON.parse(text);
    } else {
      rows = parse(text, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }) as ChromeHistoryRow[];
    }

    console.log(
      `Processing ${rows.length} rows from ${isJson ? 'JSON' : 'CSV'}`
    );

    const supabase = getServerSupabase(req, res);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 14);

    // Deduplicate by URL + timestamp to avoid counting the same visit multiple times
    const seen = new Set<string>();
    const uniqueRows: Array<ChromeHistoryRow & { visitedAt: Date }> = [];

    for (const row of rows) {
      const url = row.url?.trim();
      if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
        continue;
      }

      let visitedAt: Date;

      if (row.visitTime) {
        const timestamp = row.visitTime;
        if (timestamp > 10000000000000) {
          const CHROME_EPOCH_OFFSET = 11644473600000;
          visitedAt = new Date(timestamp / 1000 - CHROME_EPOCH_OFFSET);
        } else {
          visitedAt = new Date(timestamp);
        }
      } else if (row.date && row.time) {
        visitedAt = parseDateTime(row.date, row.time);
      } else if (row.last_visit_time) {
        visitedAt = new Date(row.last_visit_time);
      } else {
        continue;
      }

      if (isNaN(visitedAt.getTime()) || visitedAt < cutoff) {
        continue;
      }

      // Create unique key: URL + rounded timestamp (to nearest minute)
      const roundedTime = new Date(visitedAt);
      roundedTime.setSeconds(0, 0);
      const uniqueKey = `${url}|${roundedTime.toISOString()}`;

      if (seen.has(uniqueKey)) {
        continue; // Skip duplicate
      }

      seen.add(uniqueKey);
      uniqueRows.push({ ...row, visitedAt });
    }

    console.log(
      `Deduplicated: ${rows.length} → ${uniqueRows.length} unique entries`
    );

    let inserted = 0;
    let skipped = 0;

    for (const row of uniqueRows) {
      const domain = toHostname(row.url!);
      if (!domain) {
        skipped++;
        continue;
      }

      // For more accurate analytics, count each row as 1 visit
      // instead of using the cumulative visitCount from Chrome
      const visits = 1;
      const category = domainToCategory(domain, row.title || '');

      const { error } = await supabase.from('browser_history_items').insert({
        owner: user.id,
        visited_at: row.visitedAt.toISOString(),
        url: row.url!,
        title: row.title?.trim() || null,
        domain,
        visits,
        category,
      });

      if (!error) {
        inserted++;
      } else {
        console.error('Insert error:', error.message);
        skipped++;
      }
    }

    console.log(`Result: ${inserted} inserted, ${skipped} skipped`);

    res.status(200).json({
      inserted,
      skipped,
      total: rows.length,
      unique: uniqueRows.length,
      cutoffDate: cutoff.toISOString(),
    });
  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({
      error: 'Failed to ingest browser history',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
