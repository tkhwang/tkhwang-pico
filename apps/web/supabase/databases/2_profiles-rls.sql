alter table public.profiles enable row level security;

-- 본인만 자신의 프로필 조회/수정
create policy "profiles_select_own"
on public.profiles
for select
using (user_id = auth.jwt() ->> 'sub');

create policy "profiles_update_own"
on public.profiles
for update
using (user_id = auth.jwt() ->> 'sub');

-- 필요 시, 처음 생성 허용(본인만)
create policy "profiles_insert_self"
on public.profiles
for insert
with check (user_id = auth.jwt() ->> 'sub');
