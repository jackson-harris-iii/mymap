export function endOfIsoWeekSunday(d: Date) {
  const day = d.getDay();
  const diffToSun = (7 - day) % 7;
  const out = new Date(d);
  out.setDate(d.getDate() + diffToSun);
  out.setHours(0, 0, 0, 0);
  return out;
}

export function startOfIsoWeekMondayFromEnd(endSunday: Date) {
  const out = new Date(endSunday);
  out.setDate(endSunday.getDate() - 6);
  out.setHours(0, 0, 0, 0);
  return out;
}

export function parseJsonSafe<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    return null;
  }
}

const DOMAIN_MAP: Record<string, string> = {
  github: 'work',
  stackoverflow: 'work',
  supabase: 'work',
  vercel: 'work',
  notion: 'work',
  figma: 'work',
  google: 'work',
  medium: 'learn',
  devto: 'learn',
  freecodecamp: 'learn',
  coursera: 'learn',
  udemy: 'learn',
  youtube: 'learn',
  cnn: 'news',
  nytimes: 'news',
  bloomberg: 'news',
  wsj: 'news',
  reddit: 'social',
  twitter: 'social',
  x: 'social',
  instagram: 'social',
  tiktok: 'social',
  netflix: 'entertainment',
  hulu: 'entertainment',
  primevideo: 'entertainment',
  amazon: 'shopping',
  ebay: 'shopping',
  etsy: 'shopping',
};

export function domainToCategory(host: string, title?: string) {
  const core = host.replace(/^www\./, '').split('.')[0];
  let cat = DOMAIN_MAP[core] ?? 'other';
  if (core === 'youtube') {
    const t = (title || '').toLowerCase();
    if (/(how to|tutorial|course|learn|guide|coding|programming)/.test(t)) cat = 'learn';
    else if (/(music|trailer|highlights|gaming|reaction|vlog)/.test(t)) cat = 'entertainment';
  }
  return cat;
}

export function toHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch (error) {
    return '';
  }
}

export type TopLine = { name: string; count: number };

export function topN<T extends string | number>(items: Record<string, number>, n = 5): TopLine[] {
  return Object.entries(items)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, count]) => ({ name, count }));
}

export function bucketDaypart(date: Date): 'morning' | 'afternoon' | 'evening' | 'late' {
  const h = date.getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 22) return 'evening';
  return 'late';
}
