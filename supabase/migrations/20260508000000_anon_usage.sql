-- Anonymous user usage tracking (no FK to auth.users — keyed by localStorage UUID)
create table if not exists anon_usage (
  user_id text not null,
  month   text not null,
  count   integer default 0 not null,
  primary key (user_id, month)
);

alter table anon_usage enable row level security;
