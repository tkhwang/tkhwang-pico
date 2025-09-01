create table if not exists public.profiles (
  user_id text primary key,           -- Clerk user.id (ex: "user_abc123")
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_profiles_email on public.profiles (email);

-- updated_at 자동 갱신
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function set_updated_at();
