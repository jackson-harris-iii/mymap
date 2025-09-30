# My Map

My Map is a productivity co-pilot that helps operators run weekly check-ins, daily journals, newsletter research, brain dump analyses, and daily briefs with AI assistance.

## Tech Stack
- Next.js 14 (pages router) with TypeScript
- Tailwind CSS, Headless UI, Radix Icons
- Supabase (Postgres, Auth, Storage)
- OpenAI GPT-5 Codex primary, GPT-4o-mini fallback
- Tavily Search API for fresh news
- rss-parser for newsletter ingestion
- Resend (optional email delivery)
- SWR, server actions, Zod validation
- ESLint, Prettier, Husky

## Getting Started

```bash
npm install
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill values:

```
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
TAVILY_API_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=
```

## Supabase Setup
1. Create a Supabase project.
2. Run `supabase/schema.sql`, `supabase/policies.sql`, and `supabase/seed.sql` in the SQL editor.
3. Create a private storage bucket named `uploads` with owner-only RLS.

## Vercel Deployment
1. Connect repository to Vercel.
2. Add environment variables from `.env.example`.
3. Configure cron via `vercel.json` (daily brief at 07:00 PT, weekly metrics at Monday 09:00 PT).
4. Deploy and monitor cron execution.

## Scripts
- `npm run dev` – start development server
- `npm run build` – production build
- `npm run start` – start production server
- `npm run lint` – run ESLint

## Privacy
Uploads are processed server-side and stored in user-owned tables protected by Supabase RLS. Users can delete their data at any time.

