alter table public.profiles enable row level security;
create policy "own profile" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

alter table public.metrics_catalog enable row level security;
create policy "owner read write" on public.metrics_catalog
  for all using (owner = auth.uid()) with check (owner = auth.uid());

alter table public.metrics_values enable row level security;
create policy "owner read write" on public.metrics_values
  for all using (owner = auth.uid()) with check (owner = auth.uid());

alter table public.weekly_reports enable row level security;
create policy "owner read write" on public.weekly_reports
  for all using (owner = auth.uid()) with check (owner = auth.uid());

alter table public.journal_entries enable row level security;
create policy "owner read write" on public.journal_entries
  for all using (owner = auth.uid()) with check (owner = auth.uid());

alter table public.journal_reflections enable row level security;
create policy "owner read write" on public.journal_reflections
  for all using (owner = auth.uid()) with check (owner = auth.uid());

alter table public.braindumps enable row level security;
create policy "owner read write" on public.braindumps
  for all using (owner = auth.uid()) with check (owner = auth.uid());

alter table public.braindump_analyses enable row level security;
create policy "owner read write" on public.braindump_analyses
  for all using (owner = auth.uid()) with check (owner = auth.uid());

alter table public.newsletter_sources enable row level security;
create policy "owner read write" on public.newsletter_sources
  for all using (owner = auth.uid()) with check (owner = auth.uid());

alter table public.newsletter_posts enable row level security;
create policy "owner read write" on public.newsletter_posts
  for all using (owner = auth.uid()) with check (owner = auth.uid());

alter table public.newsletter_drafts enable row level security;
create policy "owner read write" on public.newsletter_drafts
  for all using (owner = auth.uid()) with check (owner = auth.uid());

alter table public.daily_briefs enable row level security;
create policy "owner read write" on public.daily_briefs
  for all using (owner = auth.uid()) with check (owner = auth.uid());

alter table public.youtube_history_items enable row level security;
create policy "owner read write" on public.youtube_history_items
  for all using (owner = auth.uid()) with check (owner = auth.uid());

alter table public.weekly_activity_reviews enable row level security;
create policy "owner read write" on public.weekly_activity_reviews
  for all using (owner = auth.uid()) with check (owner = auth.uid());

alter table public.browser_history_items enable row level security;
create policy "owner read write" on public.browser_history_items
  for all using (owner = auth.uid()) with check (owner = auth.uid());
