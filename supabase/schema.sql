-- Core tables
create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  interests text[],
  project_type text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.metrics_catalog (
  id bigint generated always as identity primary key,
  owner uuid references auth.users(id) on delete cascade,
  key text not null,
  label text not null,
  unit text,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.metrics_values (
  id bigint generated always as identity primary key,
  owner uuid references auth.users(id) on delete cascade,
  metric_id bigint references public.metrics_catalog(id) on delete cascade,
  period_date date not null,
  value numeric not null,
  created_at timestamptz default now(),
  unique (owner, metric_id, period_date)
);

create table if not exists public.weekly_reports (
  id bigint generated always as identity primary key,
  owner uuid references auth.users(id) on delete cascade,
  period_date date not null,
  report_md text not null,
  created_at timestamptz default now(),
  unique (owner, period_date)
);

create table if not exists public.journal_entries (
  id bigint generated always as identity primary key,
  owner uuid references auth.users(id) on delete cascade,
  entry_date date not null,
  mood int,
  mood_desc text,
  energy int,
  accomplishments text[],
  priority text,
  blockers text,
  gratitude text,
  notes text,
  created_at timestamptz default now(),
  unique(owner, entry_date)
);

create table if not exists public.journal_reflections (
  id bigint generated always as identity primary key,
  owner uuid references auth.users(id) on delete cascade,
  entry_id bigint references public.journal_entries(id) on delete cascade,
  reflection_md text not null,
  created_at timestamptz default now(),
  unique(owner, entry_id)
);

create table if not exists public.braindumps (
  id bigint generated always as identity primary key,
  owner uuid references auth.users(id) on delete cascade,
  title text,
  content text,
  created_at timestamptz default now()
);

create table if not exists public.braindump_analyses (
  id bigint generated always as identity primary key,
  owner uuid references auth.users(id) on delete cascade,
  braindump_id bigint references public.braindumps(id) on delete cascade,
  analysis_md text not null,
  created_at timestamptz default now(),
  unique(owner, braindump_id)
);

create table if not exists public.newsletter_sources (
  id bigint generated always as identity primary key,
  owner uuid references auth.users(id) on delete cascade,
  title text,
  url text not null,
  created_at timestamptz default now(),
  unique(owner, url)
);

create table if not exists public.newsletter_posts (
  id bigint generated always as identity primary key,
  owner uuid references auth.users(id) on delete cascade,
  source_id bigint references public.newsletter_sources(id) on delete cascade,
  title text,
  link text,
  published_at timestamptz,
  summary text,
  created_at timestamptz default now(),
  unique(owner, source_id, link)
);

create table if not exists public.newsletter_drafts (
  id bigint generated always as identity primary key,
  owner uuid references auth.users(id) on delete cascade,
  period_week date not null,
  subject_options text[],
  draft_md text not null,
  created_at timestamptz default now(),
  unique(owner, period_week)
);

create table if not exists public.daily_briefs (
  id bigint generated always as identity primary key,
  owner uuid references auth.users(id) on delete cascade,
  brief_date date not null,
  items jsonb not null,
  created_at timestamptz default now(),
  unique(owner, brief_date)
);

create table if not exists public.youtube_history_items (
  id bigint generated always as identity primary key,
  owner uuid references auth.users(id) on delete cascade,
  watched_at timestamptz not null,
  video_url text not null,
  video_title text,
  channel_title text,
  channel_url text,
  duration_seconds int,
  categories text[],
  created_at timestamptz default now()
);

create table if not exists public.weekly_activity_reviews (
  id bigint generated always as identity primary key,
  owner uuid references auth.users(id) on delete cascade,
  period_week date not null,
  source text not null,
  summary_md text not null,
  toplines jsonb not null,
  created_at timestamptz default now(),
  unique(owner, period_week, source)
);

create table if not exists public.browser_history_items (
  id bigint generated always as identity primary key,
  owner uuid references auth.users(id) on delete cascade,
  visited_at timestamptz not null,
  url text not null,
  title text,
  domain text not null,
  visits int default 1,
  category text,
  created_at timestamptz default now()
);
