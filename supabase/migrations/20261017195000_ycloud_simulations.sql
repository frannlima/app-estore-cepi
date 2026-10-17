-- No changes to existing Meta functions, contacts, schedules or dispatch flags.
create table public.estore_ycloud_simulations (
  request_id uuid primary key,
  scenario text not null check (scenario in ('accepted','rejected','rate_limited','timeout')),
  result jsonb not null check (result->>'mode' = 'simulation' and result->>'delivery_confirmed' = 'false' and result->>'real_messages_sent' = '0'),
  created_at timestamptz not null default now()
);
alter table public.estore_ycloud_simulations enable row level security;
revoke all on table public.estore_ycloud_simulations from public, anon, authenticated;
grant select, insert on table public.estore_ycloud_simulations to service_role;
comment on table public.estore_ycloud_simulations is 'Synthetic YCloud tests only. Never evidence of real acceptance or delivery.';
