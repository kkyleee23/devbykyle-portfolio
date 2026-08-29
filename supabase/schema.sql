create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 60),
  role text check (char_length(role) <= 80),
  body text not null check (char_length(body) between 20 and 600),
  contact text check (char_length(contact) <= 120),
  approved boolean not null default false,
  ip_hash text
);

create index if not exists recommendations_approved_idx
  on public.recommendations (approved, created_at desc);

create index if not exists recommendations_iphash_idx
  on public.recommendations (ip_hash, created_at desc);

alter table public.recommendations enable row level security;

drop policy if exists "public reads approved" on public.recommendations;
create policy "public reads approved"
  on public.recommendations
  for select
  to anon
  using (approved = true);
