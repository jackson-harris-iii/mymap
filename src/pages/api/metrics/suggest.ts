import type { NextApiRequest, NextApiResponse } from 'next';
import { requireUser } from '@/src/lib/auth';
import { MetricSuggestSchema } from '@/src/lib/zod';

const BASE_METRICS: Record<string, { key: string; label: string; unit?: string }[]> = {
  creator: [
    { key: 'followers', label: 'Followers' },
    { key: 'views', label: 'Views' },
    { key: 'subs', label: 'Subscribers' },
    { key: 'revenue', label: 'Revenue', unit: '$' },
  ],
  saas: [
    { key: 'mrr', label: 'MRR', unit: '$' },
    { key: 'active_users', label: 'Active Users' },
    { key: 'churn_rate', label: 'Churn Rate', unit: '%' },
    { key: 'growth_rate', label: 'Growth Rate', unit: '%' },
  ],
  developer: [
    { key: 'commits', label: 'Commits' },
    { key: 'prs_merged', label: 'PRs Merged' },
    { key: 'stars', label: 'Repo Stars' },
    { key: 'downloads', label: 'Package Downloads' },
  ],
  student: [
    { key: 'courses_completed', label: 'Courses Completed' },
    { key: 'hours_studied', label: 'Hours Studied' },
    { key: 'grades_avg', label: 'Grade Average' },
    { key: 'projects_done', label: 'Projects Completed' },
  ],
  custom: [],
};

const KEYWORD_RULES: { keyword: string; metric: { key: string; label: string; unit?: string } }[] = [
  { keyword: 'revenue', metric: { key: 'revenue', label: 'Revenue', unit: '$' } },
  { keyword: 'youtube', metric: { key: 'views', label: 'YouTube Views' } },
  { keyword: 'youtube', metric: { key: 'subs', label: 'YouTube Subscribers' } },
  { keyword: 'open source', metric: { key: 'stars', label: 'Stars' } },
  { keyword: 'open source', metric: { key: 'forks', label: 'Forks' } },
  { keyword: 'fitness', metric: { key: 'workouts', label: 'Workouts' } },
  { keyword: 'fitness', metric: { key: 'minutes', label: 'Active Minutes' } },
  { keyword: 'fitness', metric: { key: 'weight', label: 'Weight', unit: 'lbs' } },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = await requireUser(req, res);
  if (!user) return;

  const parse = MetricSuggestSchema.safeParse(req.body ?? {});
  if (!parse.success) return res.status(400).json({ error: 'Invalid payload' });

  const { project_type = 'developer', context_blurb = '' } = parse.data;
  const base = [...(BASE_METRICS[project_type] ?? [])];
  const text = context_blurb.toLowerCase();
  const extras = KEYWORD_RULES.filter((rule) => text.includes(rule.keyword)).map((rule) => rule.metric);
  const deduped = [...base];
  extras.forEach((metric) => {
    if (!deduped.find((m) => m.key === metric.key)) deduped.push(metric);
  });

  res.status(200).json({ suggested: deduped });
}
