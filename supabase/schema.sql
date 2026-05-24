create extension if not exists pgcrypto;
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  long_description text,
  tech_stack text[],
  category text check (category in ('ai', 'web', 'mobile', 'data')),
  thumbnail_url text,
  demo_url text,
  github_url text,
  is_featured boolean default false,
  order_index int default 0,
  created_at timestamptz default now()
);
create table if not exists guestbook (
  id uuid primary key default gen_random_uuid(),
  sender_name text not null,
  message text not null,
  is_approved boolean default false,
  created_at timestamptz default now()
);
alter table projects enable row level security;
alter table guestbook enable row level security;
create policy "projects read public" on projects for select using (true);
create policy "guestbook insert public" on guestbook for insert with check (true);
create policy "guestbook approved read public" on guestbook for select using (is_approved = true);
