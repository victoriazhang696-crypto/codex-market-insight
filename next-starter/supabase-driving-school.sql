-- 环球驾校专属 / 定向内容模块
-- 在 Supabase SQL Editor 执行一次即可。

alter table if exists public.profiles
  add column if not exists feature_permissions jsonb default '["market_today","market_history","member_notice"]'::jsonb,
  add column if not exists feature_expiries jsonb default '{}'::jsonb,
  add column if not exists compute_credits integer not null default 0;

alter table if exists public.articles
  add column if not exists content_category text not null default 'market_today';

create index if not exists articles_content_category_idx
  on public.articles(content_category, status, published_at desc);

create table if not exists public.personal_contents (
  id uuid primary key default gen_random_uuid(),
  service_key text not null default 'driving_school',
  target_user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  content_type text not null default '定制内容',
  attachment_url text,
  compute_cost integer not null default 0,
  status text not null default 'published' check (status in ('draft', 'published', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.personal_contents
  add column if not exists compute_cost integer not null default 0;

create index if not exists personal_contents_target_idx
  on public.personal_contents(target_user_id, service_key, status, created_at desc);

alter table public.personal_contents enable row level security;

drop policy if exists "Members can read own published personal contents" on public.personal_contents;
create policy "Members can read own published personal contents"
  on public.personal_contents
  for select
  to authenticated
  using (
    target_user_id = auth.uid()
    and status = 'published'
  );

drop policy if exists "Admins can manage personal contents" on public.personal_contents;
create policy "Admins can manage personal contents"
  on public.personal_contents
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );
