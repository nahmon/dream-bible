-- Daily event tracking for retention analytics
create table if not exists user_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  event_type  text not null, -- 'interpret' | 'counsel'
  lang        text not null default 'ko',
  created_at  timestamptz default now()
);

create index if not exists idx_user_events_user_id   on user_events(user_id);
create index if not exists idx_user_events_created_at on user_events(created_at desc);
create index if not exists idx_user_events_date       on user_events(date(created_at at time zone 'Asia/Seoul'));

-- Service role bypasses RLS; no end-user access needed
alter table user_events enable row level security;
