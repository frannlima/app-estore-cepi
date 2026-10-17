-- Existing configured project only. No HTTP requests or real messages.
begin;
do $$
declare
  r uuid:=gen_random_uuid();
  c jsonb;
  digits text;
  mid text:='wamid.validation.'||gen_random_uuid()::text;
  event_at timestamptz:=now();
begin
  c:=public.estore_begin_whatsapp_test(r,'999999991');
  assert c->>'created'='true','Authorized test could not be claimed';
  digits:=substring(c->>'recipient_e164' from 2);
  assert public.estore_begin_whatsapp_test(r,'999999991')->>'created'='false','Duplicate test was claimed';
  assert public.estore_begin_whatsapp_test(gen_random_uuid(),'999999991')->>'status'='rate_limited','Rate limit missing';
  assert public.estore_record_whatsapp_test_status(mid,'999999991',digits,'sent',event_at)='awaiting_api_response','Early callback was lost';
  update public.estore_whatsapp_tests set status='accepted',provider_message_id=mid,canonical_recipient_id=digits where request_id=r;
  assert public.estore_record_whatsapp_test_status(mid,'999999991','15550000002','failed',event_at,131026,'Synthetic error',null)='ignored','Wrong recipient accepted';
  assert public.estore_record_whatsapp_test_status(mid,'999999991',null,'failed',event_at,131026,'Synthetic error',null)='ignored','Null recipient accepted';
  assert public.estore_record_whatsapp_test_status(mid,'999999992',digits,'failed',event_at)='ignored','Wrong sender accepted';
  perform public.estore_record_whatsapp_test_status(mid,'999999991',digits,'delivered',event_at);
  perform public.estore_record_whatsapp_test_status(mid,'999999991',digits,'delivered',event_at);
  perform public.estore_record_whatsapp_test_status(mid,'999999991',digits,'sent',event_at-interval '1 second');
  perform public.estore_record_whatsapp_test_status(mid,'999999991',digits,'failed',event_at,131026,'Synthetic error','Synthetic detail');
  assert (select status='delivered' from public.estore_whatsapp_tests where request_id=r),'Delivery status regressed';
  assert (select count(*)=3 from public.estore_whatsapp_test_events where request_id=r),'Webhook events were duplicated';
  perform public.estore_record_whatsapp_test_status(mid,'999999991',digits,'read',event_at);
  assert (select status='read' and delivered_at is not null and read_at is not null from public.estore_whatsapp_tests where request_id=r),'Read status missing';
  assert not has_table_privilege('anon','public.estore_whatsapp_test_config','select'),'Anonymous contact access';
  assert not has_table_privilege('authenticated','public.estore_whatsapp_tests','select'),'Client test log access';
  assert not has_function_privilege('anon','public.estore_begin_whatsapp_test(uuid,text)','execute'),'Anonymous send access';
  assert (select whatsapp_enabled=false from public.estore_alert_config where id=1),'Regional channel activated';
end $$;
rollback;
