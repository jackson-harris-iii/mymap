import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'node:fs/promises';
import { parse } from 'csv-parse/sync';
import { requireUser } from '@/src/lib/auth';
import { getServerSupabase } from '@/src/lib/supabase';
import { domainToCategory, toHostname } from '@/src/lib/reports';

export const config = { api: { bodyParser: false } };

type ChromeHistoryRow = {
  // CSV format from Chrome History export
  order?: string | number;
  id?: string | number;
  date?: string; // e.g., "10/1/2025"
  time?: string; // e.g., "1:33:56"
  title?: string;
  url?: string;
  visitCount?: string | number;
  typedCount?: string | number;
  transition?: string;
  // JSON format (Chrome WebExtensions API)
  visitTime?: number;
  // Generic fallback format
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
  // Handle formats like "10/1/2025" and "1:33:56"
  // or "10/1/2025" and "01:33:56"
  try {
    const dateTimeStr = `${date} ${time}`;
    const parsed = new Date(dateTimeStr);

    if (!isNaN(parsed.getTime())) {
      return parsed;
    }

    // Try parsing manually if native parsing fails
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

    // Handle formidable v3 array format
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

    let inserted = 0;
    let skipped = 0;
    const errors: { row: number; reason: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      // Extract URL
      const url = row.url?.trim();
      if (!url || url === '') {
        errors.push({ row: i, reason: 'Missing URL' });
        skipped++;
        continue;
      }

      // Skip invalid URLs
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        errors.push({ row: i, reason: 'Invalid URL protocol' });
        skipped++;
        continue;
      }

      // Extract visit time from various formats
      let visitedAt: Date;

      if (row.visitTime) {
        // Chrome JSON format: milliseconds since epoch or microseconds
        const timestamp = row.visitTime;
        // Chrome uses microseconds since Jan 1, 1601, we need milliseconds since Jan 1, 1970
        if (timestamp > 10000000000000) {
          // Likely Chrome's microseconds format
          const CHROME_EPOCH_OFFSET = 11644473600000; // milliseconds between 1601 and 1970
          visitedAt = new Date(timestamp / 1000 - CHROME_EPOCH_OFFSET);
        } else {
          visitedAt = new Date(timestamp);
        }
      } else if (row.date && row.time) {
        // CSV format: separate date and time columns
        visitedAt = parseDateTime(row.date, row.time);
      } else if (row.last_visit_time) {
        // Generic format
        visitedAt = new Date(row.last_visit_time);
      } else {
        errors.push({ row: i, reason: 'Missing timestamp' });
        skipped++;
        continue;
      }

      // Validate date
      if (isNaN(visitedAt.getTime())) {
        errors.push({ row: i, reason: 'Invalid date' });
        skipped++;
        continue;
      }

      // Skip items older than cutoff (14 days)
      if (visitedAt < cutoff) {
        skipped++;
        continue;
      }

      // Extract domain
      const domain = toHostname(url);
      if (!domain) {
        errors.push({ row: i, reason: 'Invalid domain' });
        skipped++;
        continue;
      }

      // Extract visit count
      const visits = Number(row.visitCount || row.visit_count || 1) || 1;

      // Categorize
      const category = domainToCategory(domain, row.title || '');

      // Insert into database
      const { error } = await supabase.from('browser_history_items').insert({
        owner: user.id,
        visited_at: visitedAt.toISOString(),
        url: url,
        title: row.title?.trim() || null,
        domain,
        visits,
        category,
      });

      if (!error) {
        inserted++;
      } else {
        console.error(`Insert error at row ${i}:`, error);
        errors.push({ row: i, reason: error.message });
        skipped++;
      }
    }

    console.log(
      `Processed: ${rows.length} total, ${inserted} inserted, ${skipped} skipped`
    );

    if (errors.length > 0 && errors.length <= 10) {
      console.log('Sample errors:', errors);
    }

    res.status(200).json({
      inserted,
      skipped,
      total: rows.length,
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
