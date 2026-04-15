-- 꿈 기록 테이블
create table dreams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  dream_text text not null,
  interpretation text not null,
  created_at timestamptz default now()
);

alter table dreams enable row level security;

create policy "Users can read own dreams"
  on dreams for select
  using (auth.uid() = user_id);

create policy "Users can insert own dreams"
  on dreams for insert
  with check (auth.uid() = user_id);

-- 월별 사용량 추적 (무료 플랜 3회 제한)
create table dream_usage (
  user_id uuid references auth.users(id) on delete cascade not null,
  month text not null,
  count integer default 0 not null,
  primary key (user_id, month)
);

alter table dream_usage enable row level security;

create policy "Users can read own usage"
  on dream_usage for select
  using (auth.uid() = user_id);

-- Service role bypasses RLS by default (used in api/interpret.js for upsert)

create index idx_dreams_user_id on dreams(user_id);
