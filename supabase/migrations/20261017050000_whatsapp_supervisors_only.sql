-- Política de envio WhatsApp eStore CE+PI: somente supervisores ativos da própria filial.
-- Gerentes permanecem no cadastro, sem elegibilidade para alertas.
-- O WhatsApp regional deve continuar desativado até teste e validação da jornada.
CREATE OR REPLACE FUNCTION public.estore_queue_whatsapp_incident(p_incident_id bigint)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare v_total integer := 0;
begin
 insert into public.estore_alert_wa_outbox (incident_id,contact_id,status,template_name)
 select i.id,c.id,'approved','estore_cepi_alerta_parcial'
 from public.estore_alert_incidents i
 join public.estore_alert_wa_contacts c on c.store_code=i.store_code
 join public.collaborators u
   on u.matricula=c.matricula and u.store_code=c.store_code
 cross join public.estore_alert_config cfg
 where i.id=p_incident_id
   and cfg.id=1 and cfg.whatsapp_enabled=true
   and i.resolved_at is null
   and i.opened_at >= now()-interval '2 hours'
   and c.enabled=true
   and c.validated_at is not null
   and c.opt_in_at is not null
   and c.phone_e164 is not null
   and c.phone_e164 ~ '^\+[1-9][0-9]{7,14}$'
   and lower(trim(coalesce(u.profile_type,'')))='supervisor'
   and lower(trim(coalesce(u.situacao,'')))='atividade normal'
 on conflict (incident_id,contact_id) do nothing;
 get diagnostics v_total=row_count;
 return v_total;
end
$function$
;

revoke all on function public.estore_queue_whatsapp_incident(bigint) from public,anon,authenticated;

CREATE OR REPLACE FUNCTION public.estore_claim_whatsapp_alerts(p_limit integer DEFAULT 10)
 RETURNS TABLE(outbox_id bigint, phone_e164 text, filial text, problem text, check_time text, template text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
 if not (select cfg.whatsapp_enabled from public.estore_alert_config cfg where cfg.id=1) then return; end if;
 return query
 with eligible as (
    select o.id
    from public.estore_alert_wa_outbox o
    join public.estore_alert_incidents i on i.id=o.incident_id
    join public.estore_alert_wa_contacts c on c.id=o.contact_id
    join public.collaborators u
      on u.matricula=c.matricula and u.store_code=c.store_code
    where o.status='approved'
      and o.attempts=0
      and i.resolved_at is null
      and i.opened_at >= now()-interval '2 hours'
      and c.enabled=true and c.opt_in_at is not null
      and c.validated_at is not null and c.phone_e164 is not null
      and lower(trim(coalesce(u.profile_type,'')))='supervisor'
      and lower(trim(coalesce(u.situacao,'')))='atividade normal'
    order by o.created_at asc
    limit least(greatest(p_limit,1),20)
    for update of o skip locked
 ),claimed as (
    update public.estore_alert_wa_outbox o
    set status='sending',attempts=o.attempts+1,last_attempt_at=now()
    from eligible e where o.id=e.id
    returning o.id,o.incident_id,o.contact_id,o.template_name
 )
 select d.id,c.phone_e164,i.store_code,
   case i.condition when 'sem_alimentacao' then 'Sem alimentação'
     when 'zerada' then 'Venda zerada'
     else 'Atualização atrasada' end,
   to_char(i.opened_at at time zone 'America/Fortaleza','DD/MM/YYYY HH24:MI'),
   d.template_name
 from claimed d
 join public.estore_alert_incidents i on i.id=d.incident_id
 join public.estore_alert_wa_contacts c on c.id=d.contact_id;
end
$function$
;

revoke all on function public.estore_claim_whatsapp_alerts(integer) from public,anon,authenticated;
grant execute on function public.estore_claim_whatsapp_alerts(integer) to service_role;

update public.estore_alert_wa_outbox o
set status='cancelled',last_error='Destinatário não elegível: alertas exclusivos de supervisores ativos'
where o.status in ('draft','approved')
  and not exists (
    select 1 from public.estore_alert_wa_contacts c
    join public.collaborators u
      on u.matricula=c.matricula and u.store_code=c.store_code
    where c.id=o.contact_id
      and lower(trim(coalesce(u.profile_type,'')))='supervisor'
      and lower(trim(coalesce(u.situacao,'')))='atividade normal'
  );
