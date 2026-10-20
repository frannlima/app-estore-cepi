create table public.estore_alert_center_partials (
 id bigint generated always as identity primary key,
 result_date date not null,
 check_time text not null check(check_time ~ '^(1[4-9]|2[0-1]):[0-5][0-9]$'),
 source_hash text not null check(length(source_hash)=64),
 reviewed_rows jsonb not null check(jsonb_typeof(reviewed_rows)='array'),
 created_by text not null,
 created_at timestamptz not null default now(),
 unique(result_date,check_time),unique(result_date,source_hash)
);
alter table public.estore_alert_center_partials enable row level security;
revoke all on public.estore_alert_center_partials from public,anon,authenticated;
grant select,insert on public.estore_alert_center_partials to service_role;
grant usage,select on sequence public.estore_alert_center_partials_id_seq to service_role;
create table public.estore_alert_center_events (
 id bigint generated always as identity primary key,
 partial_id bigint not null references public.estore_alert_center_partials(id),
 contact_review_id bigint not null references public.estore_alert_wa_contact_review(id),
 channel text not null check(channel in ('whatsapp_opened','in_app_created')),
 created_by text not null,
 created_at timestamptz not null default now(),
 unique(partial_id,contact_review_id,channel)
);
alter table public.estore_alert_center_events enable row level security;
revoke all on public.estore_alert_center_events from public,anon,authenticated;
grant select,insert on public.estore_alert_center_events to service_role;
grant usage,select on sequence public.estore_alert_center_events_id_seq to service_role;
update public.estore_alert_config set first_hour=14,whatsapp_enabled=false,updated_at=now() where id=1;
