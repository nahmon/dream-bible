create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  order_id text not null unique,
  purchased_at timestamptz default now(),
  expires_at timestamptz not null
);

create index if not exists idx_purchases_user_id on purchases(user_id);
create index if not exists idx_purchases_expires_at on purchases(expires_at);
