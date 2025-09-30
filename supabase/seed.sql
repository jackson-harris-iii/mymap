insert into public.profiles (id, full_name, interests, project_type)
values
  ('00000000-0000-0000-0000-000000000001', 'Demo Operator', '{"ai","productivity","news"}', 'developer')
on conflict (id) do update set
  full_name = excluded.full_name,
  interests = excluded.interests,
  project_type = excluded.project_type;

insert into public.newsletter_sources (owner, title, url)
values
  ('00000000-0000-0000-0000-000000000001', 'Example Tech', 'https://example.com/feed'),
  ('00000000-0000-0000-0000-000000000001', 'Example Creator', 'https://creator.example.com/rss')
on conflict (owner, url) do nothing;
