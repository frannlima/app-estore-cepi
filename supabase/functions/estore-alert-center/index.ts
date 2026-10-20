import {createClient} from 'npm:@supabase/supabase-js@2.57.4';
import {STORES,clock,classify,recipientBlock,message} from '../../../alert-center-core.mjs';
const headers={'Access-Control-Allow-Origin':'https://frannlima.github.io','Access-Control-Allow-Headers':'content-type,authorization,apikey,x-client-info','Access-Control-Allow-Methods':'POST,OPTIONS','Content-Type':'application/json','Cache-Control':'no-store'};
const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
const digest=async(s:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(x=>x.toString(16).padStart(2,'0')).join('');
const checked=async(q:any)=>{const r=await q;if(r.error)throw new Error(r.error.code==='23505'?'Parcial já registrada. Não foi duplicada.':'Não foi possível consultar ou salvar os dados.');return r.data;};
export async function handle(req:Request){
 if(req.method==='OPTIONS')return new Response(null,{headers});
 if(req.method!=='POST')return reply({error:'Método inválido'},405);
 if(Number(req.headers.get('content-length')||0)>25000)return reply({error:'Conteúdo muito grande'},413);
 try{
  const raw=await req.text();if(raw.length>25000)return reply({error:'Conteúdo muito grande'},413);
  const b=JSON.parse(raw),now=new Date(),local=clock(now);
  if(typeof b.password!=='string'||!b.password||b.password.length>256)return reply({error:'Informe a senha administrativa no app.'},401);
  const config=await checked(db.from('app_state').select('value').eq('key','config').maybeSingle());
  const cfg=config?.value||{};
  // Matrícula alone is never authentication. Use the configured master password.
  if(String(b.matricula)!==String(cfg.admin_matricula)||!cfg.admin_hash||(await digest(b.password))!==cfg.admin_hash)return reply({error:'Acesso administrativo inválido.'},403);
  const batch='supervisores_20261020_texto';
  const date=typeof b.date==='string'?b.date:local.date;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return reply({error:'Data inválida'},400);
  if(b.action==='partial_save'){
   if(date!==local.date||local.hour<14||local.hour>21||!/^((1[4-9])|(2[01])):[0-5]\d$/.test(b.time)||b.time>local.time)return reply({error:'Use uma parcial de hoje, entre 14h e 21h59, sem horário futuro.'},400);
   if(!b.reviewed||!Array.isArray(b.rows)||!b.rows.length||b.rows.length>18||!/^[a-f0-9]{64}$/.test(b.source_hash))return reply({error:'Revise as lojas e o horário antes de confirmar.'},400);
   const seen=new Set();for(const row of b.rows){if(!STORES.includes(row.st)||seen.has(row.st)||!['sale','zero','missing','unknown'].includes(row.status))return reply({error:'Linhas inválidas ou repetidas'},400);seen.add(row.st);}
   const rows=b.rows.map((x:any)=>({st:x.st,status:x.status})).sort((a:any,b:any)=>a.st.localeCompare(b.st));
   const saved=await checked(db.from('estore_alert_center_partials').insert({result_date:date,check_time:b.time,source_hash:b.source_hash,reviewed_rows:rows,created_by:String(b.matricula)}).select('id').single());
   return reply({ok:true,id:saved.id});
  }
  if(b.action==='contact_save'){
   const contact=await checked(db.from('estore_alert_wa_contact_review').select('*').eq('id',b.id).eq('import_batch',batch).single());
   const person=await checked(db.from('collaborators').select('matricula,nome,store_code,cargo,eligible_supervisor,situacao').eq('matricula',String(b.person_id)).single());
   if(!person.eligible_supervisor||!STORES.includes(person.store_code)||person.store_code!==contact.store_code_original||/gerente/i.test(person.cargo)||!/^\+55[1-9]\d9\d{8}$/.test(b.phone)||!b.phone_confirmed)return reply({error:'Confirme matrícula, filial e telefone completo do supervisor.'},400);
   // Verification is recorded only with an explicit consent source; it does not enable any sender.
   const consent=String(b.consent_source||'').trim();
   if(consent.length<8)return reply({error:'Registre como e quando o supervisor consentiu.'},400);
   await checked(db.from('estore_alert_wa_contact_review').update({matricula_confirmed:person.matricula,store_code_confirmed:person.store_code,phone_suggested_e164:b.phone,verification_status:'confirmado',review_notes:'Conferido pelo administrador; consentimento: '+consent.slice(0,300)+'. Jornada e ativação regional pendentes.',updated_at:now.toISOString()}).eq('id',contact.id));
   return reply({ok:true});
  }
  if(b.action!=='dashboard'&&b.action!=='preview')return reply({error:'Ação indisponível. Envios permanecem desativados.'},403);
  const [contacts,people,entries,partials,state]=await Promise.all([
   checked(db.from('estore_alert_wa_contact_review').select('*').eq('import_batch',batch).order('source_row')),
   checked(db.from('collaborators').select('matricula,nome,store_code,cargo,situacao,eligible_supervisor').eq('eligible_supervisor',true)),
   checked(db.from('hourly_estore').select('store_code,captured,created_at,updated_at,status,deleted_at').eq('result_date',date)),
   checked(db.from('estore_alert_center_partials').select('*').eq('result_date',date).order('check_time',{ascending:false}).limit(20)),
   checked(db.from('app_state').select('key,value').in('key',['meta_schedule','historical_ticket_ytd']))
  ]);
  const states=Object.fromEntries(state.map((x:any)=>[x.key,x.value]));
  const rows=STORES.map(st=>{
   const ee=entries.filter((e:any)=>e.store_code===st&&e.status!=='deleted'&&!e.deleted_at);
   const latest=ee.map((x:any)=>x.updated_at||x.created_at).sort().at(-1)||null;
   const row={st,captured:ee.reduce((s:number,e:any)=>s+Number(e.captured||0),0),updated_at:latest};
   const p=partials[0],group=p?.reviewed_rows?.find((x:any)=>x.st===st)?.status;
   const meta=Number(states.meta_schedule?.[date]?.[st]?.metaEstore||0);
   const ticket=Number(states.historical_ticket_ytd?.[st]?.ticket||states.historical_ticket_ytd?.[st]||0);
   return {...row,meta,orders:ticket>0&&meta>0?Math.ceil(meta/ticket):0,condition:classify(row,group,now),active:date===local.date&&local.hour>=14&&local.hour<=21,partial_id:p?.id||null,check_time:p?.check_time||local.time};
  });
  const mapped=contacts.map((c:any)=>{const person=people.find((p:any)=>p.matricula===c.matricula_confirmed);return {...c,person,block:recipientBlock(c,person)};});
  if(b.action==='preview'){
   const contact=mapped.find((c:any)=>c.id===Number(b.id)),row=rows.find(r=>r.st===contact?.store_code_original);
   if(!contact||!row)return reply({error:'Contato não encontrado'},404);
   return reply({ok:true,text:message({name:contact.person?.nome||contact.name_original,st:row.st,meta:row.meta,orders:row.orders,condition:row.condition,date,time:row.check_time}),blocked:contact.block,whatsapp_enabled:false});
  }
  return reply({ok:true,contacts:mapped,people:people.filter((p:any)=>STORES.includes(p.store_code)),rows,partials:partials.map((p:any)=>({id:p.id,time:p.check_time,created_at:p.created_at})),date,local,whatsapp_enabled:false,notice:'Preparação e revisão. Nenhum envio externo está habilitado.'});
 }catch(e){return reply({error:e instanceof SyntaxError?'Solicitação inválida':String(e.message||'Falha na central')},400);}
}
Deno.serve(handle);
