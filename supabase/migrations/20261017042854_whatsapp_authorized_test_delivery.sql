-- Private pilot only. Does not activate the regional WhatsApp dispatcher.
create table public.estore_whatsapp_test_config (
  id smallint primary key default 1 check (id=1),
  manual_test_enabled boolean not null default false,
  contact_id bigint not null references public.estore_alert_wa_contacts(id),
  expected_phone_e164 text not null check (expected_phone_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  updated_at timestamptz not null default now()
);

create table public.estore_whatsapp_tests (
  request_id uuid primary key,
  contact_id bigint not null references public.estore_alert_wa_contacts(id),
  recipient_e164 text not null check (recipient_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  canonical_recipient_id text,
  provider_phone_number_id text not null check (provider_phone_number_id ~ '^[0-9]+$'),
  status text not null check (status in ('sending','accepted','sent','delivered','read','failed','uncertain')),
  provider_message_id text unique,
  provider_error_code integer,
  provider_error_message text,
  provider_error_details text,
  delivered_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index estore_whatsapp_tests_recent_idx on public.estore_whatsapp_tests(created_at desc);
create index estore_whatsapp_tests_contact_idx on public.estore_whatsapp_tests(contact_id);

create table public.estore_whatsapp_test_events (
  provider_message_id text not null,
  status text not null check (status in ('sent','delivered','read','failed')),
  provider_at timestamptz not null,
  request_id uuid not null references public.estore_whatsapp_tests(request_id),
  error_code integer,
  error_message text,
  error_details text,
  received_at timestamptz not null default now(),
  primary key (provider_message_id,status,provider_at)
);
create index estore_whatsapp_test_events_request_idx on public.estore_whatsapp_test_events(request_id);

alter table public.estore_whatsapp_test_config enable row level security;
alter table public.estore_whatsapp_tests enable row level security;
alter table public.estore_whatsapp_test_events enable row level security;
revoke all on public.estore_whatsapp_test_config,public.estore_whatsapp_tests,public.estore_whatsapp_test_events from public,anon,authenticated;
grant select,insert,update on public.estore_whatsapp_test_config,public.estore_whatsapp_tests,public.estore_whatsapp_test_events to service_role;

create function public.estore_begin_whatsapp_test(p_request_id uuid,p_phone_number_id text)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare
  cfg public.estore_whatsapp_test_config%rowtype;
  c public.estore_alert_wa_contacts%rowtype;
  existing public.estore_whatsapp_tests%rowtype;
  regional_enabled boolean;
begin
  select * into cfg from public.estore_whatsapp_test_config where id=1 for update;
  if not found or not cfg.manual_test_enabled then
    return jsonb_build_object('created',false,'status','manual_test_disabled');
  end if;
  select whatsapp_enabled into regional_enabled from public.estore_alert_config where id=1 for share;
  if regional_enabled is distinct from false then
    return jsonb_build_object('created',false,'status','regional_channel_must_remain_disabled');
  end if;
  select * into c from public.estore_alert_wa_contacts where id=cfg.contact_id;
  if c.id is null or not c.enabled or c.opt_in_at is null or c.validated_at is null
     or c.phone_e164 is distinct from cfg.expected_phone_e164
     or c.store_code in ('089','090','109','519') then
    return jsonb_build_object('created',false,'status','authorized_contact_not_valid');
  end if;
  if p_request_id is null or p_phone_number_id is null or p_phone_number_id !~ '^[0-9]+$' then
    raise exception 'Invalid test request';
  end if;
  select * into existing from public.estore_whatsapp_tests where request_id=p_request_id;
  if found then
    return jsonb_build_object('created',false,'status',existing.status);
  end if;
  if exists (select 1 from public.estore_whatsapp_tests where created_at>now()-interval '60 seconds') then
    return jsonb_build_object('created',false,'status','rate_limited');
  end if;
  insert into public.estore_whatsapp_tests(request_id,contact_id,recipient_e164,provider_phone_number_id,status)
  values(p_request_id,c.id,cfg.expected_phone_e164,p_phone_number_id,'sending');
  return jsonb_build_object('created',true,'status','sending','recipient_e164',cfg.expected_phone_e164);
end $$;
revoke all on function public.estore_begin_whatsapp_test(uuid,text) from public,anon,authenticated;
grant execute on function public.estore_begin_whatsapp_test(uuid,text) to service_role;

create function public.estore_record_whatsapp_test_status(
  p_message_id text,p_phone_number_id text,p_recipient_id text,p_status text,p_provider_at timestamptz,
  p_error_code integer default null,p_error_message text default null,p_error_details text default null
) returns text language plpgsql security invoker set search_path=public,pg_temp as $$
declare
  t public.estore_whatsapp_tests%rowtype;
  expected text;
  new_status text;
begin
  if p_status is null or p_status not in ('sent','delivered','read','failed') or p_provider_at is null
     or coalesce(p_recipient_id,'') !~ '^[1-9][0-9]{7,14}$' then return 'ignored'; end if;
  select * into t from public.estore_whatsapp_tests where provider_message_id=p_message_id for update;
  if not found then
    -- A status can arrive before the send response has been committed. Ask Meta to retry.
    if exists(select 1 from public.estore_whatsapp_tests where provider_phone_number_id=p_phone_number_id
      and status='sending' and created_at>now()-interval '2 minutes') then return 'awaiting_api_response'; end if;
    return 'ignored';
  end if;
  select expected_phone_e164 into expected from public.estore_whatsapp_test_config where id=1 and contact_id=t.contact_id;
  if expected is distinct from t.recipient_e164 or p_phone_number_id is distinct from t.provider_phone_number_id
     or (p_recipient_id is distinct from substring(t.recipient_e164 from 2)
       and p_recipient_id is distinct from t.canonical_recipient_id) then return 'ignored'; end if;
  insert into public.estore_whatsapp_test_events(provider_message_id,status,provider_at,request_id,error_code,error_message,error_details)
  values(p_message_id,p_status,p_provider_at,t.request_id,p_error_code,left(p_error_message,1000),left(p_error_details,1000))
  on conflict do nothing;

  new_status:=t.status;
  if p_status='read' then new_status:='read';
  elsif p_status='delivered' and t.status<>'read' then new_status:='delivered';
  elsif p_status='failed' and t.status not in ('delivered','read') then new_status:='failed';
  elsif p_status='sent' and t.status in ('sending','uncertain','accepted') then new_status:='sent'; end if;
  update public.estore_whatsapp_tests set status=new_status,
    delivered_at=case when p_status in ('delivered','read') then coalesce(delivered_at,p_provider_at) else delivered_at end,
    read_at=case when p_status='read' then coalesce(read_at,p_provider_at) else read_at end,
    provider_error_code=case when p_status='failed' then p_error_code else provider_error_code end,
    provider_error_message=case when p_status='failed' then left(p_error_message,1000) else provider_error_message end,
    provider_error_details=case when p_status='failed' then left(p_error_details,1000) else provider_error_details end,
    updated_at=now()
  where request_id=t.request_id;
  return 'recorded';
end $$;
revoke all on function public.estore_record_whatsapp_test_status(text,text,text,text,timestamptz,integer,text,text) from public,anon,authenticated;
grant execute on function public.estore_record_whatsapp_test_status(text,text,text,text,timestamptz,integer,text,text) to service_role;
