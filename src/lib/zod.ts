import { z } from 'zod';

export const IsoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const MetricSuggestSchema = z.object({
  project_type: z.enum(['creator', 'saas', 'developer', 'student', 'custom']).optional(),
  context_blurb: z.string().max(500).optional(),
});

export const MetricSubmitSchema = z.object({
  period_date: IsoDate,
  values: z
    .array(
      z.object({
        key: z.string().min(1),
        value: z.number(),
        label: z.string().optional(),
        unit: z.string().optional(),
      })
    )
    .min(1),
});

export const MetricReportSchema = z.object({
  period_date: IsoDate.optional(),
});

export const JournalCreateSchema = z.object({
  entry_date: IsoDate,
  mood: z.number().min(1).max(10).optional(),
  mood_desc: z.string().max(280).optional(),
  energy: z.number().min(1).max(10).optional(),
  accomplishments: z.array(z.string().max(200)).max(5).optional(),
  priority: z.string().max(280).optional(),
  blockers: z.string().max(280).optional(),
  gratitude: z.string().max(280).optional(),
  notes: z.string().max(2000).optional(),
});

export const JournalAnalyzeSchema = z.object({
  entry_date: IsoDate,
});

export const BraindumpIngestSchema = z.object({
  title: z.string().max(120).optional(),
  content: z.string().min(1),
});

export const BraindumpAnalyzeSchema = z.object({
  braindump_id: z.number().int().positive(),
});

export const NewsletterSourcesSchema = z.object({
  add: z
    .array(
      z.object({
        title: z.string().max(120).optional(),
        url: z.string().url(),
      })
    )
    .optional(),
  remove_ids: z.array(z.number().int().positive()).optional(),
});

export const NewsletterFetchSchema = z.object({});

export const NewsletterResearchSchema = z.object({
  period_week: IsoDate,
});

export const NewsletterDraftSchema = z.object({
  period_week: IsoDate,
});

export const DailyBriefSchema = z.object({
  brief_date: IsoDate.optional(),
});

export const YouTubeWeekRequestSchema = z.object({
  period_week: IsoDate,
});

export type YouTubeWeekRequest = z.infer<typeof YouTubeWeekRequestSchema>;

export const BrowserWeekRequestSchema = z.object({
  period_week: IsoDate,
});

export type BrowserWeekRequest = z.infer<typeof BrowserWeekRequestSchema>;

export const CombinedWeekRequestSchema = z.object({
  period_week: IsoDate,
});

export type CombinedWeekRequest = z.infer<typeof CombinedWeekRequestSchema>;
