/* Adapter para o aplicativo real (index.html), que usa hourly(), loadHourly() e shareHourly().
 * Não depende de app-v2.js, que não é usado nesta página. */
(function(){
 'use strict';
 if(window.__HOURA_HORA_LIVE_V200)return;
 window.__HOURA_HORA_LIVE_V200=true;
 let HOURLY_CACHE=null;
 let hourlyV5=hourly,shareHourlyV5=shareHourly,hourlyCaptionV6=()=>'',admV3=isAdmin;
 let renderHourlyV5=function(j){
   if(!j)return;
   const rows=(j.stores||[]).filter(x=>Number(x.metaValue||0)>0).sort((a,b)=>Number(b.captured||0)-Number(a.captured||0));
   const rr=rows.reduce((s,r)=>({meta:s.meta+Number(r.metaValue||0),sales:s.sales+Number(r.captured||0),orders:s.orders+Number(r.orders||0),goal:s.goal+Number(r.orderTarget||0),storeSales:s.storeSales+Number(r.storeSales||0)}),{meta:0,sales:0,orders:0,goal:0,storeSales:0});
   const values=[
     ['🎯','Meta eStore',rr.meta,'money'],
     ['💰','Captado',rr.sales,'money'],
     ['🛍️','Pedidos',rr.orders+' / '+rr.goal,'text'],
     ['📈','Atingimento',rr.meta?rr.sales/rr.meta:null,'percent'],
     ['📊','Share Flash',j.regionalFlash?.complete?j.regionalFlash.share:null,'percent'],
     ['📉','Desvio',rr.sales-rr.meta,'money']
   ];
   const fmt=(v,type)=>type==='money'?Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}):type==='percent'?(v==null?'—':(v*100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'%'):String(v);
   const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
   const panel=document.querySelector('#hourPanel');
   if(panel)panel.innerHTML='<div class="hourV200Grid">'+values.map(([ic,title,v,type])=>'<div class="hourV200Metric"><span><i>'+ic+'</i> '+title+'</span><b class="'+(title==='Desvio'?(v<0?'hourV200Negative':'hourV200Positive'):'')+'">'+fmt(v,type)+'</b></div>').join('')+'</div>'+'<p class="hourV200FlashSource">Share eStore ÷ Total Flash • '+Number(j.regionalFlash?.covered_stores||0)+'/18 lojas • '+(j.regionalFlash?.complete?'Base completa':'Share regional indisponível até concluir a coleta')+'</p>';
   const details=document.querySelector('#hourDetails');
   if(details)details.innerHTML='<div class="hourV200TableWrap"><table class="hourV200Table"><thead><tr><th>Filial</th><th>Meta</th><th>Captado</th><th>Pedidos</th><th>Ating.</th><th>Share Flash</th><th>Desvio</th><th>Status</th></tr></thead><tbody>'+rows.map(r=>{
    const st=window.hourlyStatusV198?.(r,j)||{label:r.updated_at?'Em curso':'Sem input',code:r.updated_at?'course':'missing'};
    const delta=Number(r.captured||0)-Number(r.metaValue||0);
    return '<tr class="'+(st.code==='missing'?'hourV200Pending':'')+'"><td>L'+safe(r.st)+'</td><td>'+fmt(r.metaValue,'money')+'</td><td>'+fmt(r.captured,'money')+'</td><td>'+Number(r.orders||0)+'/'+Number(r.orderTarget||0)+'</td><td>'+fmt(r.att,'percent')+'</td><td>'+fmt(r.share,'percent')+'</td><td class="'+(delta<0?'hourV200Negative':'hourV200Positive')+'">'+fmt(delta,'money')+'</td><td><span class="hourV200Status '+st.code+'">'+safe(st.label)+'</span></td></tr>';
   }).join('')+'</tbody></table></div>';
 };
 const nativeLoadHourly=loadHourly;

/* eStore CE+PI | Hora a Hora v198: print revisado, radar por parcial e alertas assistidos.
 * Sem ler WhatsApp diretamente; nenhum disparo automático ou venda inferida da meta.
 */
(function(){
'use strict';
if(window.__hourlyWorkflowV198)return;
window.__hourlyWorkflowV198=true;
const STORES=['073','084','108','113','138','142','146','175','177','222','238','258','262','314','318','344','350','552'];
const API='https://fndkjgveeojlywkdrtxe.supabase.co/functions/v1/estore-hourly-import';
const APP_URL='https://frannlima.github.io/app-estore-cepi/?menu=hourly';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const curr=()=>typeof HOURLY_CACHE!=='undefined'?HOURLY_CACHE:null;
const user=()=>typeof U!=='undefined'?U?.u:null;
const moneyBR=v=>v==null||!Number.isFinite(Number(v))?'—':Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const moneyVal=t=>{let s=String(t||'').replace(/[^\d.,]/g,'');if(!s)return NaN;if(s.includes(','))s=s.replace(/\./g,'').replace(',','.');return Number(s)};
const fmtPercent=v=>v==null||!Number.isFinite(Number(v))?'—':(Number(v)*100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'%';
const clock=()=>{const a=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'America/Fortaleza',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date()).map(x=>[x.type,x.value]));return{date:a.year+'-'+a.month+'-'+a.day,time:a.hour+':'+a.minute,hour:Number(a.hour),minute:Number(a.minute)}};
const dateBR=v=>/^\d{4}-\d\d-\d\d$/.test(v)?v.slice(8)+'/'+v.slice(5,7)+'/'+v.slice(0,4):'—';
const localHour=stamp=>{try{return Number(new Intl.DateTimeFormat('en-GB',{timeZone:'America/Fortaleza',hour:'2-digit',hourCycle:'h23'}).format(new Date(stamp)))}catch(_){return 0}};
const isMain=()=>typeof admV3==='function'&&admV3()&&user()?.id!=='0000000';
let adminPassword='',supervisors=null,groupStatuses={},groupStatusesDate='',parsed=[],fileRef=null,rawText='',busy=false;
let alertTemplateV198=null,priorityQueueV225=null;
const queueImportV225=import('./hourly-alert-queue-v225.mjs?build=v230').then(m=>{priorityQueueV225=m;if(supervisors&&curr())showDirectory();return m}).catch(e=>{console.warn('[eStore] Fila de contatos indisponível',e);return null});
import('./alert-center-core.mjs').then(m=>{alertTemplateV198=typeof m.message==='function'?m.message:null}).catch(()=>{});
function reference(j){
 const t=clock(),selected=String(j?.result_date||t.date);
 return {date:selected,hour:selected===t.date?t.hour:21,minute:selected===t.date?t.minute:59};
}
function missingCount(r,ref){
 const st=String(r.st).padStart(3,'0');
 const street=['084','113','146'].includes(st);
 const opening=street?8:10,closing=street?18:22;
 const updatedDay=r.updated_at?new Intl.DateTimeFormat('en-CA',{timeZone:'America/Fortaleza',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(r.updated_at)):'';
 const until=Math.min(ref.hour,closing),base=r.updated_at&&updatedDay===ref.date?Math.max(opening,localHour(r.updated_at)):opening;
 // Conta janelas horárias vencidas, não vendas zeradas.
 return Math.max(0,until-base-(ref.minute<5&&until===ref.hour?1:0));
}
function status(r,j){
 const ref=reference(j),update=Boolean(r.updated_at),sales=Number(r.captured||0),miss=missingCount(r,ref);
 const checkin=r.last_entry_kind==='no_sales_update',imported=Number(r.captured_imported||0)>0;
 if(!update){
  if(sales>0)return{code:'missing',label:'Venda consolidada • aguardando parcial da loja',miss:Math.max(1,miss)};
  if(groupStatusesDate===j?.result_date&&groupStatuses[String(r.st).padStart(3,'0')]==='sale')return{code:'missing',label:'Venda no grupo • aguardando parcial da loja',miss:Math.max(1,miss)};
  return{code:'missing',label:'Sem parcial da loja'+(miss>0?' • '+miss+' intervalos':''),miss};
 }
 if(miss>=2)return{code:'stale',label:miss+' parciais sem atualização • '+(sales>0?'venda registrada':'sem vendas confirmadas'),miss};
 if(checkin)return{code:'course',label:sales>0?'Sem novos pedidos • parcial confirmada':'Sem vendas • parcial confirmada',miss:0};
 if(sales>0)return{code:'spinning',label:imported?'Girando ponteiro • inclui consolidado':'Girando ponteiro',miss:0};
 return{code:'course',label:'Em curso • sem venda registrada',miss:0};
}
function noInput(j){
 return(j?.stores||[]).filter(r=>['missing','stale'].includes(status(r,j).code)).map(r=>String(r.st).padStart(3,'0'));
}
function statusCounts(j){
 const codes=(j?.stores||[]).map(r=>status(r,j).code);
 return{spinning:codes.filter(x=>x==='spinning').length,course:codes.filter(x=>x==='course').length,missing:codes.filter(x=>x==='missing').length,stale:codes.filter(x=>x==='stale').length};
}
function parse(text){
 const found=new Map(),lines=String(text||'').replace(/\r/g,'').split(/\n/);
 const clean=line=>String(line||'').normalize('NFKC').replace(/[\u200b-\u200f\uFEFF]/g,'').replace(/[\t\u00a0]/g,' ').trim();
 const valueMatcher=/(?:R\s*[$＄]\s*)?(\d{1,3}(?:[.\s]\d{3})*,\s*\d{2}|\d{1,6}[.,]\s*\d{2})(?!\d)/g;
 const amounts=tail=>[...String(tail).matchAll(valueMatcher)].map(x=>moneyVal(x[1].replace(/\s/g,''))).filter(n=>Number.isFinite(n)&&n>0&&n<1000000);
 let prior=null;
 for(const raw of lines){
  const line=clean(raw).replace(/^[•·*.\-]\s*/,'').replace(/^\d{1,2}[).]\s*/,'');
  if(!line)continue;
  // Número inteiro após a seta = meta de pedidos, jamais uma venda.
  const m=line.match(/^(?:L\s*)?(\d{3})\s*(?:➜|➔|➡|→|➤|➞|[-=]+>|[>»›:：]|A(?=\s*\*?\d))\s*\*{0,2}\s*(\d{1,3})\s*\*{0,2}(.*)$/iu);
  if(m&&STORES.includes(m[1])){
   const st=m[1],goal=Number(m[2]);
   if(goal>200){prior=null;continue}
   const items=amounts(m[3]||'');
   const existing=found.get(st);
   found.set(st,{st,goal,amounts:existing?[...existing.amounts,...items]:items,source:line.slice(0,400)});
   prior=st;continue;
  }
  // Aceita a continuação do WhatsApp: "+195.99 + 305,98" ou "/79,99".
  // Somente tokens financeiros e separadores, jamais texto solto ou outra filial.
  const listed=amounts(line);
  const remaining=line.replace(valueMatcher,'').replace(/[\s+\/|;,R$]/g,'');
  if(prior&&listed.length&&remaining.length===0){
   const row=found.get(prior);
   if(row){
    row.amounts.push(...listed);
    row.source+=' | '+line.slice(0,120);
   }
   continue;
  }
  prior=null;
 }
 return [...found.values()];
}
window.hourlyParsedPrintV198=parse;
function seedMarkup(){
 return '<section class="card hourCheckinCardV209"><div class="hourNewHeadV198"><div><b>✅ Atualizar parcial da minha loja</b><small>Sem novos pedidos? Confirme a parcial sem somar valores ou pedidos ao resultado.</small></div></div><button type="button" class="btn alt" onclick="hourlyConfirmNoSalesV209(this)">Confirmar sem novas vendas</button><small class="hourSmallV198" id="hourCheckinFeedbackV209" aria-live="polite"></small></section>'+
 '<section class="card hourImportCardV198"><div class="hourNewHeadV198"><div><b>📋 Consolidar vendas do WhatsApp</b><small>Cole a mensagem, confira as vendas e salve. A mesma parcial alimentará a Central de Alertas.</small></div></div>'+
 (isMain()?'<button type="button" class="btn" onclick="hourPrintOpenV198()">Colar mensagem / importar print</button><span class="hourSmallV198">Somente administrador; exige senha e revisão de cada lançamento.</span>':'<p class="muted">A importação regional é feita pelo administrador. Sua filial continua atualizando pelo formulário acima.</p>')+
 '</section><section class="card hourAlertsCardV198" id="hourAlertsSectionV198"><div class="hourNewHeadV198"><div><b>🚨 Mobilização | Filiais sem venda informada</b><small>Após consolidar, a lista de supervisores elegíveis aparece automaticamente abaixo. Sem informação não significa venda zero confirmada.</small></div></div><div id="hourRadarV198" class="hourRadarV198">Carregando situação...</div>'+
 (isMain()?'<div style="display:flex;flex-wrap:wrap;gap:8px"><button type="button" class="btn alt" onclick="hourAlertDirectoryV198()">Ver supervisores e preparar alertas no WhatsApp</button><button type="button" class="btn ghost" onclick="openAlertCenter()">Gerenciar parciais e contatos</button></div>':'<p class="hourSmallV198">Alertas com contatos são restritos ao administrador.</p>')+
 '<div id="hourSupervisorListV198"></div></section>';
}
function decorateScreen(){
 const j=curr(),root=document.getElementById('hourlyDashboardV5'),radar=document.getElementById('hourRadarV198');
 if(!j||!root)return;
 const rowBase=root.querySelector('.hourTableV6 table');
 if(rowBase){
  const rows=[...(j.stores||[])].sort((a,b)=>Number(b.captured||0)-Number(a.captured||0));
  rowBase.innerHTML='<thead><tr><th>Filial</th><th>Meta eStore</th><th>Captado</th><th>Pedidos</th><th>Ating.</th><th>Share Flash</th><th>Desvio</th><th>Status</th></tr></thead><tbody>'+rows.map(r=>{
   const st=status(r,j),dev=Number(r.captured||0)-Number(r.metaValue||0);
   return '<tr class="hourRowV6 hourDynamicV198 '+st.code+'"><td><b>L'+esc(r.st)+'</b></td>'+
   '<td>'+moneyBR(r.metaValue)+'</td><td>'+moneyBR(r.captured)+'</td>'+
   '<td>'+Number(r.orders||0)+' / '+Number(r.orderTarget||0)+'</td>'+
   '<td>'+fmtPercent(r.att)+'</td><td>'+fmtPercent(r.share)+'</td>'+
   '<td class="'+(dev>=0?'devPosV6':'devNegV6')+'">'+(dev>0?'▲ ':'▼ ')+moneyBR(dev)+'</td>'+
   '<td><span class="hourStatusV198 '+st.code+'">'+(st.code==='spinning'?'🟢':st.code==='course'?'🟠':st.code==='stale'?'🟡':'🔴')+' '+esc(st.label)+'</span></td></tr>';
  }).join('')+'</tbody>';
 }
 const old=root.querySelector('.hourAlertV6');if(old)old.remove();
 const nf=noInput(j),counts=statusCounts(j);
 if(radar)radar.innerHTML='<div class="hourRadarCountersV198"><span>🟢 Girando ponteiro <b>'+counts.spinning+'</b></span><span>🟠 Em curso <b>'+counts.course+'</b></span><span>🟡 Parcial atrasada <b>'+counts.stale+'</b></span><span>🔴 Sem parcial <b>'+counts.missing+'</b></span></div>'+
 '<p><b>Filiais que precisam atualizar a parcial:</b> '+(nf.length?nf.map(x=>'L'+x).join(' • '):'Nenhuma')+'</p><small>Vendas de loja e consolidado são contabilizadas. O radar acompanha a atualização feita pelo supervisor, sem confundir atraso com ausência de venda.</small>';
 if(supervisors)showDirectory();
}
function caption(j){
 if(!j)return '';
 const arr=j.stores||[],r={captured:0,meta:0,orders:0,orderTarget:0,storeSales:0};
 for(const x of arr){r.captured+=Number(x.captured||0);r.meta+=Number(x.metaValue||0);r.orders+=Number(x.orders||0);r.orderTarget+=Number(x.orderTarget||0);r.storeSales+=Number(x.storeSales||0)}
 const n=arr.filter(x=>Number(x.captured||0)>0).length,miss=noInput(j),desvio=r.captured-r.meta;
 const t=clock(),latestTime=j.result_date===t.date?t.time:'Fechamento';
 const lines=[
  '📊 *PARCIAL eSTORE | CE+PI*',
  '📅 '+dateBR(j.result_date)+' • '+latestTime,
  '',
  '🎯 *Meta:* '+moneyBR(r.meta),
  '💰 *Captado:* '+moneyBR(r.captured),
  '🛍️ *Pedidos:* '+r.orders+'/'+r.orderTarget,
  '📈 *Atingimento:* '+fmtPercent(r.meta>0?r.captured/r.meta:null),
  '📊 *Share Flash:* '+(j.regionalFlash?.complete?fmtPercent(j.regionalFlash.share):'— • coleta '+Number(j.regionalFlash?.covered_stores||0)+'/18 lojas'),
  (desvio<0?'🔻':'🔺')+' *Desvio:* '+moneyBR(desvio),
  '🏬 *Lojas com venda:* '+n+'/'+arr.length,
  '⚠️ *Lojas sem venda informada:* - '+miss.length,
  '',
  '📍 *Filiais sem venda informada:*',
  ' '+(miss.length?miss.join(', '):'Nenhuma'),
  '',
  '🔗 *Atualize a venda da sua loja*',
  '',
  '📲  *Menu → Hora a Hora → Registrar incremento*',
  '',
  APP_URL,
  '',
  '',
  '_Moda que inspira o Brasil_'
 ];
 return lines.join('\n');
}
async function directory(){
 if(!isMain())throw Error('Acesso restrito ao administrador.');
 if(!adminPassword){const s=window.prompt('Senha administrativa para consultar supervisores e contatos:');if(!s)return;adminPassword=s}
 const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',body:JSON.stringify({action:'dashboard',matricula:String(user()?.id||''),password:adminPassword,date:curr()?.result_date||clock().date})});
 const j=await r.json();
 if(!r.ok||!j.ok){adminPassword='';throw Error(j.error||'Consulta indisponível')}
 supervisors=j.contacts||[];
 groupStatuses=j.groupStatus||{};
 groupStatusesDate=curr()?.result_date||clock().date;
 try{decorateScreen()}catch(_){}
 return supervisors;
}
function alertMessage(row,person){
 const first=String(person.name||'Liderança').split(' ')[0],d=curr()?.result_date||clock().date;
 if(alertTemplateV198){const msg=alertTemplateV198({name:person.name,st:row.st,meta:row.metaValue,orders:row.orderTarget,condition:'missing',date:d,time:clock().time});return clock().hour===21?msg+'\n\n⏰ Fechamento: informe a captação eStore acumulada do dia no Hora a Hora.':msg;}
 return '🚨 *ALERTA eSTORE CONNECT | HORA A HORA*\n\nOlá, '+first+'! Precisamos atualizar a captação da *filial '+row.st+'*.\n\n🎯 *Meta eStore:* '+moneyBR(row.metaValue)+'\n🛍️ *Meta de pedidos:* '+Number(row.orderTarget||0)+'\n⏱️ *Situação:* '+status(row,curr()).label+'\n📅 *Parcial:* '+dateBR(d)+'\n\n📲 Já teve vendas? Atualize o Hora a Hora: '+APP_URL+'\n\nCaso exista alguma dificuldade, sinalize para alinharmos o apoio. Contamos com você!';
}
function showLegacyDirectory(){
 const target=document.getElementById('hourSupervisorListV198'),j=curr();
 if(!target||!j||!supervisors)return;
 const missing=noInput(j),byStore=new Map((j.stores||[]).map(x=>[String(x.st),x]));
 target.innerHTML='<div class="hourDirTitleV198">🚨 Cards de alerta • '+missing.length+' lojas sem input</div>'+
 (missing.length?missing.map(st=>{
  const entry=supervisors.find(x=>x.st===st),people=entry?.people||[];
  if(!people.length)return '<div class="hourDirRowV198"><b>L'+st+'</b><span>Supervisor ativo não identificado na base.</span></div>';
  return people.map((person,index)=>'<div class="hourDirRowV198"><b>L'+st+'</b><span>'+esc(person.name)+'<small>'+esc(person.role)+'</small>'+(person.onLeave?'<small class="hourLeaveV209">⚠ Cadastro de RH: férias. Confirme o retorno e a jornada antes de enviar.</small>':'')+'</span>'+
   (person.phone?'<button class="btn" data-hour-card="'+st+'" data-hour-person="'+index+'">Compartilhar card <span aria-hidden="true">↗</span></button>':
    '<small>Contato não validado</small>')+'</div>').join('');
 }).join(''):'<p class="muted">Nenhuma filial pendente nesta parcial.</p>')+
 '<label class="hourConfirmV198"><input type="checkbox" id="hourWorkingV198"> Confirmei que o supervisor está em expediente e autorizado a receber o alerta.</label>'+
 '<p class="hourSmallV198">O botão gera um card PNG individual com metas, ação imediata e link do app para o Hora a Hora. Selecione o supervisor no WhatsApp para compartilhar. Nenhum envio é automático.</p>'+
 '<p id="hourCardStatusV205" class="hourSmallV198" role="status" aria-live="polite"></p>';
 target.querySelectorAll('[data-hour-card]').forEach(button=>button.onclick=async()=>{
  const notice=target.querySelector('#hourCardStatusV205');
  if(!target.querySelector('#hourWorkingV198')?.checked){
   notice.textContent='Confirme o expediente e a autorização para contato antes de compartilhar.';return;
  }
  const st=button.dataset.hourCard,entry=supervisors.find(x=>x.st===st);
  const person=entry?.people?.[Number(button.dataset.hourPerson)],row=byStore.get(st);
  if(!person?.phone||!row)return;
  if(person.onLeave&&!window.confirm('A base de RH registra férias para '+person.name+'. Ela já retornou e está em expediente, autorizada a receber este alerta?')){notice.textContent='Envio não iniciado: supervisora consta em férias na base de RH.';return;}
  button.disabled=true;notice.textContent='Gerando card de alerta da filial L'+st+'...';
  try{
   const lib=await import('./alert-card-share.mjs?build=v205');
   const current=status(row,j),lastTime=row.updated_at?
     new Date(row.updated_at).toLocaleTimeString('pt-BR',{timeZone:'America/Fortaleza',hour:'2-digit',minute:'2-digit'}):null;
   const png=await lib.createAlertImage(
    {person:{nome:person.name},name_original:person.name,store_code_original:st},
    {st,meta:Number(row.metaValue),orders:Number(row.orderTarget),condition:'missing',
     closing:clock().hour===21,first_check_time:lastTime,last_sale_change_time:lastTime,
     missing_partials:current.miss,link:APP_URL}
   );
   const message=await lib.shareAlertImage(png,person.phone,clock().hour===21);
   notice.textContent=message+' Destinatário: '+person.name+' (L'+st+').';
  }catch(err){
   notice.textContent='Não foi possível gerar ou compartilhar o card: '+String(err?.message||err);
  }finally{button.disabled=false}
 });
}
function showDirectory(target=document.getElementById('hourSupervisorListV198')){
 const j=curr();if(!j||!target||!supervisors)return;
 if(priorityQueueV225)return priorityQueueV225.renderPriorityQueue({
  target,data:j,contacts:supervisors,
  groupStatuses:groupStatusesDate===j.result_date?groupStatuses:{}
 });
 if(target.id==='hourSupervisorListV198')return showLegacyDirectory();
 target.textContent='Preparando os contatos validados...';
}
window.hourAlertDirectoryV198=async function(){const host=document.getElementById('hourSupervisorListV198');try{if(host)host.innerHTML='<p class="muted">Consultando contatos protegidos...</p>';await directory();showDirectory();}catch(e){if(host)host.textContent=String(e.message||e)}};
window.hourlyConfirmNoSalesV209=async function(button){
 const u=user(),st=String(u?.st||'').padStart(3,'0'),today=clock().date;
 const feedback=document.getElementById('hourCheckinFeedbackV209');
 if(!u?.id||u.id==='0000000'||!STORES.includes(st)){if(feedback)feedback.textContent='A confirmação exige supervisor logado e filial identificada.';return}
 if(!window.confirm('Confirmar que a filial '+st+' não teve novos pedidos desde a última parcial? O total permanece inalterado.'))return;
 if(button?.disabled)return;
 button.disabled=true;if(feedback)feedback.textContent='Registrando a confirmação...';
 try{
  const out=await api({action:'hourly_submit',matricula:String(u.id),store_code:st,result_date:today,captured:0,orders:0,store_sales:0,confirm_no_sales:true});
  if(!out?.ok||out?.error)throw Error(out?.error||'Não foi possível confirmar.');
  await loadHourly();
  if(feedback)feedback.textContent=out.already_confirmed?'✅ Esta parcial já foi confirmada.':'✅ Parcial confirmada. Captação e pedidos preservados.';
 }catch(e){if(feedback)feedback.textContent='Não foi possível confirmar: '+String(e.message||e)}
 finally{button.disabled=false}
};
function showModal(){
 document.getElementById('hourPrintModalV198')?.remove();
 const modal=document.createElement('div');
 modal.id='hourPrintModalV198';modal.className='hourPrintOverlayV198 hourQuickOverlayV202';
 const t=clock(),date=t.date;
 modal.innerHTML='<div class="hourPrintBoxV198 hourQuickBoxV202" role="dialog" aria-modal="true" aria-label="Importação rápida de vendas do WhatsApp">'+
 '<div class="hourNewHeadV198"><div><h3>📋 Importar vendas por texto</h3><small>Cole a mensagem completa do WhatsApp. As metas não serão registradas como venda.</small></div><button type="button" class="btn ghost" id="hourPrintCloseV198" aria-label="Fechar">✕</button></div>'+
 '<details class="hourQuickFallbackV202 hourPastePrimaryV208" id="hourQuickFallbackV202" open>'+
 '<summary>1. Cole aqui a mensagem de metas e vendas</summary>'+
 '<textarea rows="9" id="hourImportTextV198" placeholder="Cole a mensagem completa. Ex.:&#10;073 ➜ *5*159,99/79,99&#10;108 ➜ *8* 159.98 +69.98+165.99 +195.99 +305,98"></textarea>'+
 '<button type="button" class="btn hourPasteAnalyzeV208" id="hourRunTextV198">Identificar vendas por loja</button></details>'+
 '<details class="hourImageOptionalV208"><summary>📷 Ou anexar print (leitura opcional)</summary>'+
 '<label class="hourQuickDropV202"><span class="hourQuickCameraV202">📷</span><strong>Escolher print do WhatsApp</strong><small>JPG, PNG ou WEBP</small><input type="file" id="hourImportFileV198" accept="image/png,image/jpeg,image/webp,image/*"></label></details>'+
 '<div id="hourParseStateV198" role="status" aria-live="polite" class="hourQuickStateV202">Cole a mensagem e toque em Identificar vendas por loja.</div>'+
 '<div id="hourImportRowsV198"></div>'+
 '<details class="hourQuickManualV205" id="hourQuickManualV205"><summary>Adicionar venda que não foi reconhecida</summary>'+
 '<div class="hourQuickManualFieldsV205"><label>Filial<select id="hourManualStoreV205">'+STORES.map(st=>'<option value="'+st+'">L'+st+'</option>').join('')+'</select></label>'+
 '<label>Valor captado (R$)<input id="hourManualValueV205" inputmode="decimal" placeholder="Ex.: 159,98"></label></div>'+
 '<button type="button" class="btn alt" id="hourManualAddV205">Adicionar para conferência</button></details>'+
 '<details class="hourQuickAdvancedV202"><summary>Alterar data ou horário do print</summary><div class="hourPrintDatesV198">'+
 '<label>Data do resultado<input type="date" id="hourImportDateV198" value="'+date+'"></label>'+
 '<label>Horário do print<input type="time" id="hourImportTimeV198" value="'+t.time+'"></label></div></details>'+
 '<div class="hourQuickConfirmV202" id="hourQuickConfirmV202" hidden>'+
 '<p class="hourSmallV198">Somente as vendas assinaladas serão registradas. Confira o valor de cada loja. Meta de pedidos não é venda.</p>'+
 '<label class="hourPasteLabelV198" id="hourPwdLabelV202">Senha administrativa<input type="password" class="field" autocomplete="off" id="hourImportPwdV198" placeholder="Informe para confirmar"></label>'+
 '<button type="button" class="btn hourQuickSaveV202" id="hourImportCommitV198">Confirmar e salvar vendas</button></div>'+
 '<div id="hourImportResultV198" role="status" aria-live="polite"></div><div id="hourImportQueueV225" class="hourImportQueueV225" hidden></div></div>';
 document.body.appendChild(modal);document.body.style.overflow='hidden';
 const close=()=>{modal.remove();document.body.style.overflow='';fileRef=null;parsed=[];busy=false};
 modal.querySelector('#hourPrintCloseV198').onclick=close;
 modal.addEventListener('click',e=>{if(e.target===modal)close()});
 modal.querySelector('#hourImportFileV198').addEventListener('change',async()=>{
   const chosen=modal.querySelector('#hourImportFileV198').files?.[0];
   if(!chosen)return;
   fileRef=chosen;parsed=[];modal.querySelector('#hourImportRowsV198').innerHTML='';
   modal.querySelector('#hourImportTextV198').value='';
   modal.querySelector('#hourQuickFallbackV202').open=false;
   modal.querySelector('#hourQuickConfirmV202').hidden=true;
   modal.querySelector('#hourImportResultV198').textContent='';
   await readOCR(modal);
 });
 modal.querySelector('#hourRunTextV198').onclick=()=>{fileRef=null;analyzeText(modal,false)};
 modal.querySelector('#hourManualAddV205').onclick=()=>{
  const st=modal.querySelector('#hourManualStoreV205').value,amount=moneyVal(modal.querySelector('#hourManualValueV205').value);
  const info=modal.querySelector('#hourParseStateV198');
  if(!STORES.includes(st)||!Number.isFinite(amount)||amount<=0||amount>=1000000){info.textContent='Informe uma filial válida e um valor maior que zero.';return}
  parsed=parsed.filter(x=>x.st!==st);
  parsed.push({st,goal:0,amounts:[amount],source:'Venda informada manualmente para revisão'});
  renderReview(modal);
  info.textContent='✅ Venda da L'+st+' adicionada para conferência.';
  modal.querySelector('#hourQuickManualV205').open=false;
  modal.querySelector('#hourManualValueV205').value='';
 };
 modal.querySelector('#hourImportCommitV198').onclick=()=>commit(modal);
 if(adminPassword)modal.querySelector('#hourPwdLabelV202').hidden=true;
}
window.hourPrintOpenV198=function(){if(!isMain())return;showModal()};
async function hashFor(file,text){
 const bytes=file?await file.arrayBuffer():new TextEncoder().encode('WhatsApp:text:'+text);
 const arr=new Uint8Array(await crypto.subtle.digest('SHA-256',bytes));
 return [...arr].map(v=>v.toString(16).padStart(2,'0')).join('');
}
function analyzeText(modal,fromOCR){
 if(!modal.isConnected)return;
 const txt=modal.querySelector('#hourImportTextV198').value;
 if(!txt.trim()){
   modal.querySelector('#hourParseStateV198').textContent='Não há texto reconhecido. Cole a mensagem recebida no WhatsApp.';
   modal.querySelector('#hourQuickFallbackV202').open=true;
   return;
 }
 parsed=parse(txt);rawText=txt;
 if(!fromOCR){
  fileRef=null;
  const match=txt.match(/\b(\d{2})\/(\d{2})\/(\d{4})\b/);
  if(match){
   const parsedDate=match[3]+'-'+match[2]+'-'+match[1];
   const d=new Date(parsedDate+'T12:00:00Z');
   if(!Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===parsedDate){
    modal.querySelector('#hourImportDateV198').value=parsedDate;
   }
  }
 }
 const withSale=parsed.filter(x=>x.amounts.length).length;
 const total=parsed.reduce((acc,row)=>acc+row.amounts.reduce((p,v)=>p+Math.round(v*100),0),0)/100;
 modal.querySelector('#hourParseStateV198').textContent=withSale?
  '✅ '+parsed.length+' filiais reconhecidas • '+withSale+' com venda • '+dateBR(modal.querySelector('#hourImportDateV198')?.value)+' • Total: '+moneyBR(total)+'. Confira antes de salvar.':
  'Ainda não identifiquei valores de vendas. Confira o texto colado. Somente metas não geram lançamento.';
 renderReview(modal);
 if(!withSale){modal.querySelector('#hourQuickFallbackV202').open=true;modal.querySelector('#hourQuickManualV205').open=true;}
}
const quickImportAssetV202=(path)=>new URL('./vendor/ocr/'+path,new URL('./',window.location.href)).href;
async function loadLocalOcrV202(){
 if(window.Tesseract)return;
 const s=document.createElement('script');
 s.src=quickImportAssetV202('tesseract.min.js');
 s.async=true;
 await new Promise((resolve,reject)=>{
  let settled=false;
  const done=(err)=>{if(settled)return;settled=true;clearTimeout(timeout);s.onload=null;s.onerror=null;err?reject(err):resolve()};
  const timeout=setTimeout(()=>done(new Error('O leitor de imagens não carregou.')),12000);
  s.onload=()=>done();s.onerror=()=>done(new Error('Leitor de imagem indisponível.'));
  document.head.appendChild(s);
 });
 if(!window.Tesseract)throw new Error('O reconhecimento de texto não está disponível no navegador.');
}
async function preparePrintForOcr(file){
 // Recorta automaticamente a barra de status/navegação e amplia as linhas pequenas
 // do WhatsApp. Não faz upload do print para serviços externos.
 let bmp=null,objectUrl=null,img=null;
 try{
  if(typeof createImageBitmap==='function')bmp=await createImageBitmap(file);
  else{
   objectUrl=URL.createObjectURL(file);
   img=new Image();
   await new Promise((ok,no)=>{img.onload=ok;img.onerror=no;img.src=objectUrl});
  }
  const w=bmp?.width||img?.naturalWidth,h=bmp?.height||img?.naturalHeight;
  if(!(w>0&&h>0))throw Error('Imagem inválida');
  const cropTop=Math.round(h*.045),cropBottom=Math.round(h*.025);
  const sourceH=h-cropTop-cropBottom;
  const scale=Math.min(2.4,1900/w,3500/sourceH);
  const canvas=document.createElement('canvas');
  canvas.width=Math.max(600,Math.round(w*scale));canvas.height=Math.max(700,Math.round(sourceH*scale));
  const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw Error('Canvas indisponível');
  ctx.fillStyle='#FFFFFF';ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(bmp||img,0,cropTop,w,sourceH,0,0,canvas.width,canvas.height);
  const pix=ctx.getImageData(0,0,canvas.width,canvas.height),a=pix.data;
  for(let i=0;i<a.length;i+=4){
   const v=.299*a[i]+.587*a[i+1]+.114*a[i+2];
   // Contraste adaptado: preservar o texto escuro sobre balões verdes ou brancos.
   const n=Math.max(0,Math.min(255,(v-126)*1.6+147));
   a[i]=a[i+1]=a[i+2]=n;a[i+3]=255;
  }
  ctx.putImageData(pix,0,0);
  return canvas;
 }finally{bmp?.close?.();if(objectUrl)URL.revokeObjectURL(objectUrl)}
}
async function readOCR(modal){
 const statusEl=modal.querySelector('#hourParseStateV198');
 const file=modal.querySelector('#hourImportFileV198')?.files?.[0];
 if(!file)return;
 if(!(/^image\/(jpeg|png|webp)$/i.test(file.type))||file.size>8000000){
  statusEl.textContent='Selecione um print JPG, PNG ou WEBP de até 8 MB.';return;
 }
 if(busy)return;
 busy=true;fileRef=file;
 const input=modal.querySelector('#hourImportFileV198');input.disabled=true;
 let worker=null,timer=null;
 const timeoutPromise=new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('A leitura demorou além do esperado.')),52000)});
 statusEl.textContent='⏳ Lendo e ampliando o print...';
 try{
  const recognize=async()=>{
   await loadLocalOcrV202();
   const opts={
    workerPath:quickImportAssetV202('worker.min.js'),
    corePath:quickImportAssetV202('core/'),
    langPath:quickImportAssetV202('lang/'),
    workerBlobURL:false,
    logger:p=>{
     if(!modal.isConnected)return;
     if(p?.status==='recognizing text'&&typeof p.progress==='number')
       statusEl.textContent='🔎 Identificando lojas e valores... '+Math.round(p.progress*100)+'%';
     else if(p?.status==='loading language traineddata'||p?.status==='loading tesseract core')
       statusEl.textContent='⏳ Preparando reconhecimento do texto...';
    }
   };
   worker=await window.Tesseract.createWorker('eng',1,opts);
   let first='';
   try{
    statusEl.textContent='🔎 Ampliando números da imagem...';
    const prepared=await preparePrintForOcr(file);
    await worker.setParameters({tessedit_pageseg_mode:'6',preserve_interword_spaces:'1'});
    first=String((await worker.recognize(prepared))?.data?.text||'');
   }catch(err){console.warn('[Hora a Hora] Pré-processamento indisponível:',String(err))}
   const saleCount=raw=>parse(raw).filter(x=>x.amounts.length).length;
   if(saleCount(first)>0)return first;
   statusEl.textContent='🔎 Segunda leitura de valores menores...';
   await worker.setParameters({tessedit_pageseg_mode:'11',preserve_interword_spaces:'1'});
   const second=String((await worker.recognize(file))?.data?.text||'');
   const best=saleCount(second)>saleCount(first)?second:first;
   return best||second;
  };
  const raw=await Promise.race([recognize(),timeoutPromise]);
  if(!modal.isConnected)return;
  modal.querySelector('#hourImportTextV198').value=raw;
  analyzeText(modal,true);
 }catch(err){
  if(!modal.isConnected)return;
  statusEl.textContent='Não consegui identificar as vendas com segurança. Você pode colar a mensagem ou informar somente a filial e o valor.';
  modal.querySelector('#hourQuickFallbackV202').open=true;
  console.warn('[Hora a Hora] OCR:',String(err?.message||err));
 }finally{
  clearTimeout(timer);
  if(worker)try{await worker.terminate()}catch(_){}
  busy=false;if(modal.isConnected)input.disabled=false;
 }
}
function renderReview(modal){
 const host=modal.querySelector('#hourImportRowsV198');
 const rows=parsed.filter(x=>x.amounts.length>0);
 const cents=arr=>arr.reduce((sum,n)=>sum+Math.round(n*100),0);
 const total=cents(rows.flatMap(x=>x.amounts))/100;
 host.innerHTML='<div class="hourQuickReviewHeaderV202"><b>2. Confira o consolidado</b>'+
 '<small>'+rows.length+' lojas • '+moneyBR(total)+' em vendas identificadas</small></div>'+
 '<p class="hourImportRulesV208">Os valores após a meta foram somados por filial. <b>Cada valor informado conta como um pedido sugerido</b> (confira antes de salvar); a meta de pedidos não é venda. O padrão é <b>acumulado do dia</b>, descontando o que já foi registrado no app. Para informar somente vendas novas, altere o tipo da filial.</p>'+
 (rows.length?rows.map(x=>{
  const amount=cents(x.amounts)/100;
  const details=x.amounts.map(moneyBR).join(' + ');
  return '<div class="hourQuickSaleV202" data-hir="'+x.st+'">'+
   '<div class="hourQuickSaleHeaderV202"><label><input type="checkbox" data-hi-check checked><b>L'+x.st+'</b></label>'+
   '<small>'+(x.goal>0?'Meta: '+x.goal+' pedidos':'Venda adicionada manualmente')+'</small></div>'+
   '<div class="hourSaleBreakdownV208">'+x.amounts.length+' valor'+(x.amounts.length===1?'':'es')+': '+esc(details)+'</div>'+
   '<label class="hourQuickAmountV202">Total captado (R$)<input class="field" data-hi-captured inputmode="decimal" value="'+amount.toFixed(2).replace('.',',')+'" placeholder="Confira o total"></label>'+
   '<details class="hourQuickSaleAdvancedV202"><summary>Pedidos reais e tipo de lançamento</summary>'+
   '<div class="hourQuickEditFieldsV202"><label>Pedidos identificados (conferir)<input class="field" data-hi-orders type="number" min="0" max="10000" value="'+x.amounts.length+'" step="1"></label>'+
   '<label>Como registrar<select class="field" data-hi-mode><option value="cumulative" selected>Acumulado do dia (recomendado)</option><option value="incremental">Somente novas vendas</option></select></label></div></details>'+
   '</div>';
 }).join(''):'<p class="hourQuickNoSaleV202">Nenhuma venda identificada. Valores como “073 ➜ 5” são apenas metas de pedidos e não geram lançamentos.</p>');
 const preview=STORES.filter(st=>!parsed.some(x=>x.st===st&&x.amounts.length>0));
 host.innerHTML+='<p class="hourPriorityPreviewV225"><b>📍 Prévia:</b> '+preview.length+' filiais sem valores de venda nesta mensagem ('+preview.map(st=>'L'+st).join(' • ')+'). Após salvar, o painel descontará as lojas com vendas já informadas no Hora a Hora e apresentará os supervisores validados.</p>';
 modal.querySelector('#hourQuickConfirmV202').hidden=!parsed.length;
 host.querySelectorAll('[data-hi-check]').forEach(c=>c.onchange=()=>refreshReviewV202(modal));
 host.querySelectorAll('[data-hi-captured]').forEach(inp=>inp.oninput=()=>refreshReviewV202(modal));
 refreshReviewV202(modal);
}
function refreshReviewV202(modal){
 const count=[...modal.querySelectorAll('[data-hir]')].filter(el=>el.querySelector('[data-hi-check]')?.checked&&moneyVal(el.querySelector('[data-hi-captured]')?.value)>0).length;
 const b=modal.querySelector('#hourImportCommitV198');
 if(b){const noSale=parsed.length>0&&parsed.every(x=>x.amounts.length===0);b.disabled=count===0&&!noSale;b.textContent=count?'Conferir e salvar '+count+' '+(count===1?'filial':'filiais'):noSale?'Salvar parcial sem vendas':'Selecione as lojas para salvar';}
}
async function commit(modal){
 const result=modal.querySelector('#hourImportResultV198');
 const date=modal.querySelector('#hourImportDateV198')?.value;
 const time=modal.querySelector('#hourImportTimeV198')?.value;
 const password=modal.querySelector('#hourImportPwdV198')?.value||adminPassword;
 if(!password){
  result.textContent='Informe a senha administrativa para concluir o lançamento.';
  modal.querySelector('#hourPwdLabelV202').hidden=false;
  modal.querySelector('#hourImportPwdV198').focus();
  return;
 }
 const rows=[];
 for(const el of modal.querySelectorAll('[data-hir]')){
  if(!el.querySelector('[data-hi-check]')?.checked)continue;
  const captured=moneyVal(el.querySelector('[data-hi-captured]')?.value);
  const orders=Number(el.querySelector('[data-hi-orders]')?.value);
  if(!Number.isFinite(captured)||captured<=0||!Number.isInteger(orders)||orders<0){
   result.textContent='Confira o valor e os pedidos da filial L'+el.dataset.hir+'.';
   return;
  }
  rows.push({st:el.dataset.hir,captured,orders,mode:el.querySelector('[data-hi-mode]').value});
 }
 if(!rows.length&&!(parsed.length>0&&parsed.every(x=>x.amounts.length===0))){result.textContent='Selecione uma venda ou revise uma parcial sem vendas.';return}
 const btn=modal.querySelector('#hourImportCommitV198');
 if(btn.disabled)return;
 btn.disabled=true;result.textContent='Salvando '+rows.length+' filial(is)...';
 try{
  const text=modal.querySelector('#hourImportTextV198')?.value||'';
  const source_hash=await hashFor(fileRef,text);
  const response=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',body:JSON.stringify({
   action:'commit',matricula:String(user()?.id||''),password,date,time,source_hash,rows,reviewed:true,
   partial_reviewed:true,partial_rows:parsed.map(x=>({st:x.st,status:x.amounts.length?'sale':'missing',
    sale_signature:x.amounts.length?x.amounts.slice(0,9).map(v=>String(Math.round(v*100))).join('|'):null}))
  })});
  const data=await response.json();
  if(!response.ok||!data.ok)throw Error(data.error||'Não foi possível salvar as vendas.');
  adminPassword=password;
  const imported=data.imported||0,ignored=data.skipped||0;
  const classified=data.partial_recorded?' • referência registrada na Central de Alertas':data.partial_notice?' • '+esc(data.partial_notice):'';
  result.innerHTML='<div class="hourResultV198"><strong>✅ Importação concluída!</strong><p>'+imported+' loja(s) com novo incremento'+(ignored?' • '+ignored+' preservada(s) sem duplicidade':'')+classified+'.</p>'+
   '<ul>'+(data.rows||[]).map(x=>'<li>L'+esc(x.st)+' — '+(x.status==='imported'?'Registrado '+moneyBR(x.captured):x.status==='stale'?'Lançamento mais recente preservado':x.status==='duplicate'?'Print já utilizado':'Nenhum incremento')+'</li>').join('')+'</ul></div>';
  modal.querySelector('#hourQuickConfirmV202').hidden=true;
  modal.querySelector('#hourPrintCloseV198').textContent='Concluir ✕';
  await loadHourly();
  const queue=modal.querySelector('#hourImportQueueV225');
  if(queue){
   queue.hidden=false;queue.innerHTML='<p class="hourSmallV198">Consultando os supervisores e preparando a fila do WhatsApp...</p>';
   try{
    await directory();await queueImportV225;
    showDirectory();showDirectory(queue);
    result.insertAdjacentHTML('beforeend','<p class="hourSmallV198">📲 Supervisores das lojas sem venda informada listados abaixo, com WhatsApp direto.</p>');
   }catch(queueError){
    queue.innerHTML='<p class="hourSmallV198">Resultado salvo, mas os contatos não foram carregados: '+esc(String(queueError?.message||queueError))+'. Consulte Mobilização.</p>';
   }
  }
 }catch(err){
  result.textContent='Não foi possível salvar: '+String(err?.message||err);
  btn.disabled=false;
 }
}
// Decorar componentes depois que o dashboard original termina de renderizar.
const legacyHourly=hourlyV5;
hourlyV5=function(){const html=legacyHourly();return html.replace('Ver 19 filiais','Ver 18 filiais')+seedMarkup()+'<div id=hourlyDashboardV5 hidden></div>';};
const legacyRender=renderHourlyV5;
renderHourlyV5=function(...args){const result=legacyRender(args[0]||curr());try{decorateScreen()}catch(e){console.warn('[Hora v198] Falha no radar',e)}return result};
hourlyCaptionV6=caption;
window.hourlyStatusV198=status;
window.hourlyRadarV198=decorateScreen;
const prevLogout=typeof logoutApp==='function'?logoutApp:null;
if(prevLogout)logoutApp=function(...args){adminPassword='';supervisors=null;groupStatuses={};groupStatusesDate='';return prevLogout(...args)};
window.addEventListener('pagehide',()=>{adminPassword='';supervisors=null;groupStatuses={};groupStatusesDate=''});
console.info('[eStore] Hora a Hora v198: importação revisada e alertas assistidos');
})();
/* Card regional Hora a Hora • v198 */
(function(){
'use strict';
if(window.__hourlyCardV198)return;
window.__hourlyCardV198=true;
const logoPath='./assets/ria-vertical-header-light-v195.svg';
const BLUE='#1A688C',GREEN='#173F35',ORANGE='#DE7C00',MUTED='#64776D',RED='#AF2939',PALE='#F8F7F3';
const money=v=>Number.isFinite(Number(v))?Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}):'—';
const percent=v=>Number.isFinite(Number(v))?(Number(v)*100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'%':'—';
const count=v=>Math.round(Number(v)||0).toLocaleString('pt-BR');
const dateBR=v=>/^\d{4}-\d\d-\d\d$/.test(v)?v.slice(8)+'/'+v.slice(5,7)+'/'+v.slice(0,4):'—';
const clock=()=>new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Fortaleza',hour:'2-digit',minute:'2-digit'}).format(new Date());
const rrect=(ctx,x,y,w,h,r,fill,stroke)=>{ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}};
const put=(ctx,str,x,y,size,color=GREEN,bold=true,align='left')=>{ctx.textBaseline='middle';ctx.textAlign=align;ctx.fillStyle=color;ctx.font=(bold?'800 ':'500 ')+size+'px Larsseit,Arial,sans-serif';ctx.fillText(String(str),x,y);ctx.textAlign='left'};
const fit=(ctx,val,x,y,width,size,color=GREEN,bold=true,align='left')=>{const t=String(val??'—');let z=size;while(z>11){ctx.font=(bold?'800 ':'500 ')+z+'px Larsseit,Arial,sans-serif';if(ctx.measureText(t).width<=width)break;z--}put(ctx,t,x,y,z,color,bold,align)};
const image=src=>new Promise(done=>{const im=new Image();im.onload=()=>done(im);im.onerror=()=>done(null);im.src=src;setTimeout(()=>done(null),4000)});
const status=(r,j)=>window.hourlyStatusV198?.(r,j)||{code:r.updated_at?'course':'missing',label:r.updated_at?'Em curso':'Sem input'};
async function createPoster(j){
 const data=[...(j.stores||[])].sort((a,b)=>Number(b.captured||0)-Number(a.captured||0));
 const n=data.length,total={meta:0,captured:0,orders:0,orderTarget:0,storeSales:0};
 for(const r of data){total.meta+=Number(r.metaValue||0);total.captured+=Number(r.captured||0);total.orders+=Number(r.orders||0);total.orderTarget+=Number(r.orderTarget||0);total.storeSales+=Number(r.storeSales||0)}
 const active=data.filter(r=>Number(r.captured||0)>0).length,counts={spinning:0,course:0,missing:0};
 data.forEach(r=>{const st=status(r,j);counts[st.code]=(counts[st.code]||0)+1});
 const colW=315,gap=22,x0=45,header=185,kpiY=215,kpiH=130,topY=530,
       tableStart=813,rowH=50,footerY=tableStart+47+n*rowH+22,footH=188;
 const c=document.createElement('canvas');c.width=1080;c.height=footerY+footH;
 const ctx=c.getContext('2d',{alpha:false});if(!ctx)throw Error('Canvas indisponível');
 ctx.fillStyle=PALE;ctx.fillRect(0,0,c.width,c.height);
 const grad=ctx.createLinearGradient(0,0,1080,0);grad.addColorStop(0,GREEN);grad.addColorStop(.75,'#275A4D');grad.addColorStop(1,'#173F35');ctx.fillStyle=grad;ctx.fillRect(0,0,1080,header);
 ctx.fillStyle=ORANGE;ctx.fillRect(0,header-7,1080,7);
 const log=await image(logoPath);
 if(log){const ratio=(log.naturalWidth||950)/(log.naturalHeight||1268),h=137,w=h*ratio;ctx.drawImage(log,51,23,w,h)}
 else{['RIA','CHU','ELO'].forEach((t,i)=>put(ctx,t,101,55+i*44,29,'#F9F8F2',true,'center'))}
 ctx.fillStyle='#FFFFFF55';ctx.fillRect(169,33,2,117);
 put(ctx,'eStore • CE+PI',195,71,48,'#FFFFFF',true);
 put(ctx,'PAINEL REGIONAL DE PERFORMANCE',195,116,24,'#E7F2EB',true);
 put(ctx,'Moda que inspira o Brasil',1023,33,17,'#E7F2EB',false,'right');
 rrect(ctx,743,115,280,45,23,'#336456','#88AB9C');
 put(ctx,dateBR(j.result_date)+'  •  '+clock(),883,138,19,'#FFFFFF',true,'center');
 const delta=total.captured-total.meta;
 const kpis=[
 ['🏷️','META eSTORE',money(total.meta)],
 ['💰','CAPTAÇÃO',money(total.captured)],
 ['🛍️','PEDIDOS',count(total.orders)+' / '+count(total.orderTarget)],
 ['🎯','ATINGIMENTO',percent(total.meta>0?total.captured/total.meta:null)],
 ['📊','SHARE FLASH',j.regionalFlash?.complete?percent(j.regionalFlash.share):'—'],
 ['↕️','DESVIO PARA META',(delta>0?'+':'')+money(delta)]
 ];
 kpis.forEach(([icon,title,val],i)=>{
  const col=i%3,row=Math.floor(i/3),x=x0+col*(colW+gap),y=kpiY+row*(kpiH+15);
  rrect(ctx,x,y,colW,kpiH,19,row===0?'#FFFFFF':'#EDF4EE','#E3E6E0');
  const palette=[['#315F50','#EBF3E8'],['#DAD9D6','#FDF6ED'],['#F3E0DB','#FCEFEA']][col];
  rrect(ctx,x+15,y+15,47,45,12,palette[1]);
  put(ctx,icon,x+38,y+38,25,GREEN,true,'center');
  fit(ctx,title,x+72,y+37,colW-90,18,MUTED,true);
  fit(ctx,val,x+15,y+95,colW-30,34,title==='DESVIO PARA META'?(delta<0?RED:'#167748'):BLUE,true);
 });
 put(ctx,'🏆 TOP DO MOMENTO',x0,topY,25,GREEN,true);
 const sellers=data.filter(r=>Number(r.captured||0)>0).slice(0,3);
 for(let i=0;i<3;i++){
  const r=sellers[i],x=x0+i*(colW+gap),y=topY+28;
  rrect(ctx,x,y,colW,91,15,['#F4E3B9','#E9F0EA','#F0DFD5'][i]);
  rrect(ctx,x+13,y+17,48,48,24,['#D58B16','#557E6C','#A36C4A'][i]);
  put(ctx,(i+1)+'º',x+37,y+42,20,'#FFFFFF',true,'center');
  if(r){put(ctx,'L '+r.st,x+75,y+27,18,GREEN,true);fit(ctx,money(r.captured),x+75,y+64,colW-90,27,BLUE,true)}
  else put(ctx,'Aguardando venda',x+77,y+49,17,MUTED,false);
 }
 put(ctx,'PULSO DA REGIONAL',x0,topY+163,22,GREEN,true);
 const pulses=[
 ['🟢 Girando ponteiro',counts.spinning,'#E2F3E8'],
 ['🟠 Em curso',counts.course,'#FFF3E1'],
 ['🔴 Sem input',counts.missing,'#FBE5E4']
 ];
 pulses.forEach(([title,val,bg],i)=>{
  const x=x0+i*(colW+gap),y=topY+178;
  rrect(ctx,x,y,colW,64,12,bg);
  fit(ctx,title,x+12,y+26,colW-78,17,GREEN,true);
  put(ctx,String(val),x+colW-19,y+34,27,GREEN,true,'right');
 });
 put(ctx,'DESEMPENHO POR FILIAL',x0,tableStart-30,24,GREEN,true);
 rrect(ctx,45,tableStart,990,48,10,GREEN);
 const columns=[['FILIAL',57],['META',150],['CAPTADO',285],['PED.',418],['ATING.',514],['SHARE',613],['DESVIO',709],['STATUS',852]];
 for(const [title,x] of columns)put(ctx,title,x,tableStart+24,15,'#FFFFFF',true);
 data.forEach((r,i)=>{
  const y=tableStart+48+i*rowH,st=status(r,j);
  rrect(ctx,45,y,990,rowH-2,4,st.code==='missing'?'#FFEDEA':i%2===0?'#FFFFFF':'#F0F4F0');
  const delta=Number(r.captured||0)-Number(r.metaValue||0);
  put(ctx,'L'+r.st,57,y+24,16,GREEN,true);
  fit(ctx,money(r.metaValue),150,y+24,125,15,BLUE,true);
  fit(ctx,money(r.captured),285,y+24,128,15,BLUE,true);
  put(ctx,Number(r.orders||0)+'/'+Number(r.orderTarget||0),418,y+24,15,BLUE,true);
  fit(ctx,percent(r.att),514,y+24,88,15,BLUE,true);
  fit(ctx,percent(r.share),613,y+24,91,15,BLUE,true);
  fit(ctx,money(delta),709,y+24,136,15,delta<0?RED:'#167748',true);
  if(st.code==='missing'){
   fit(ctx,st.miss+' parciais sem input',852,y+16,165,13,RED,true);
   put(ctx,'de venda',852,y+34,12,RED,false);
  }else fit(ctx,st.label,852,y+24,175,15,st.code==='spinning'?'#177548':'#97621B',true);
 });
 const pending=data.filter(r=>status(r,j).code==='missing').map(r=>r.st);
 const fb=footerY;ctx.fillStyle='#FFEAD8';rrect(ctx,45,fb,990,80,14,'#FFF2E8');
 put(ctx,'⚠️ LOJAS SEM INPUT DE VENDAS • '+pending.length,66,fb+25,19,RED,true);
 fit(ctx,pending.map(x=>'L'+x).join('  •  ')||'Nenhuma filial pendente',66,fb+55,940,19,GREEN,true);
 put(ctx,'Meta: '+money(total.meta)+'   •   Captação: '+money(total.captured)+'   •   Flash: '+Number(j.regionalFlash?.covered_stores||0)+'/18 lojas',54,fb+111,18,GREEN,true);
 ctx.fillStyle=GREEN;ctx.fillRect(0,c.height-54,1080,54);
 put(ctx,'Moda que inspira o Brasil  •  App eStore CE+PI',55,c.height-26,18,'#FFFFFF',true);
 return c;
}
shareHourlyV5=async function(){
 const j=typeof HOURLY_CACHE!=='undefined'?HOURLY_CACHE:null;
 if(!j)return alert('Carregue a parcial antes de compartilhar.');
 try{
  const c=await createPoster(j),branded=window.RiachueloBrandCards?.decorateCanvas?.(c)||c;
  const blob=await new Promise(resolve=>branded.toBlob(resolve,'image/png',.97));
  if(!blob)throw Error('Não foi possível gerar a imagem');
  const caption=hourlyCaptionV6(j),file=new File([blob],'Painel_Hora_a_Hora_CEPI_'+j.result_date+'.png',{type:'image/png'});
  if(navigator.share&&navigator.canShare?.({files:[file]})){
   try{await navigator.share({title:'Hora a Hora eStore | CE+PI',files:[file],text:caption});return}catch(e){if(e?.name==='AbortError')return}
  }
  const object=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=object;anchor.download=file.name;document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(object),6000);
  try{await navigator.clipboard.writeText(caption);alert('Card salvo e legenda copiada. Cole a legenda no WhatsApp.')}catch(_){alert('Card salvo. A legenda está disponível no aplicativo.')}
 }catch(e){alert(String(e.message||e))}
};
window.hourCardPosterV198=createPoster;
console.info('[eStore] Card Hora a Hora regional v198');
})();

 // O painel é alimentado pelo backend existente, sem simular ou substituir vendas.
 hourly=hourlyV5;
 shareHourly=shareHourlyV5;
 loadHourly=async function(...args){
   await nativeLoadHourly(...args);
   if(!document.getElementById('hourAlertsSectionV198'))return;
   try{
     const d=new Date().toLocaleDateString('en-CA',{timeZone:'America/Fortaleza'});
     const j=await api({action:'hourly_get',matricula:U.u.id,result_date:d});
     const ticket=typeof HISTORICAL_TICKETS_V97==='object'?HISTORICAL_TICKETS_V97:{};
     HOURLY_CACHE={...j,stores:(j.stores||[]).map(r=>{
       const st=String(r.st||'');
       const meta=Number(r.metaValue||0);
       return {...r,st,orderTarget:meta>0?Math.max(1,Math.ceil(meta/Number(ticket[st]||188))):0};
     })};
     renderHourlyV5(HOURLY_CACHE);
   }catch(e){const host=document.getElementById('hourRadarV198');if(host)host.textContent='Não foi possível consultar o radar. '+String(e.message||e)}
 };
 console.info('[eStore] Hora a Hora do aplicativo ativo • v200');
})();

/* eStore CE+PI | Lembrete visual por falta de duas parciais da filial.
   Não gera vendas, não altera metas e não dispara WhatsApp/push automaticamente. */
(function(){
  'use strict';
  if(window.__estoreVisualAlertV1)return;
  window.__estoreVisualAlertV1=true;
  const STREETS=new Set(['084','113','146']);
  const API_DATE_ZONE='America/Fortaleza';
  const EVERY=15*60*1000;
  let loading=false,lastStore='',lastDate='',latest=null,shakeTimeout=0,sampleTimeout=0;
  const el=id=>document.getElementById(id);
  function timestamp(){
    const o=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{
      timeZone:API_DATE_ZONE,year:'numeric',month:'2-digit',day:'2-digit',
      hour:'2-digit',minute:'2-digit',weekday:'short',hourCycle:'h23'
    }).formatToParts(new Date()).map(x=>[x.type,x.value]));
    return {date:o.year+'-'+o.month+'-'+o.day,minute:(Number(o.hour)%24)*60+Number(o.minute),weekday:o.weekday};
  }
  function identity(){
    const u=typeof U!=='undefined'?U?.u:null;
    const store=String(u?.st||u?.store_code||'').padStart(3,'0');
    return u?.id&&u.id!=='0000000'&&/^\\d{3}$/.test(store)?{id:String(u.id),store}:null;
  }
  function operating(t,store){
    const street=STREETS.has(store),opening=street?480:600,closing=street?1080:1320;
    return t.minute>=opening&&t.minute<closing&&!(street&&t.weekday==='Sun')?{opening,closing}:null;
  }
  const elapsed=n=>Math.floor(n/60)+'h '+String(n%60).padStart(2,'0')+'min';
  const key=(store,date)=>'estore_visual_alert_'+store+'_'+date;
  function saved(k){try{return JSON.parse(localStorage.getItem(k)||'{}')||{}}catch(_){return{}}}
  function save(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}}
  function ensure(){
    let node=el('estoreVisualDelayAlert');
    if(node)return node;
    const style=document.createElement('style');
    style.textContent=`
      #estoreVisualDelayAlert[hidden]{display:none!important}
      #estoreVisualDelayAlert{position:fixed;right:20px;bottom:24px;z-index:99999;box-sizing:border-box;
        width:min(490px,calc(100vw - 40px));padding:18px;background:#fff5f6;color:#8a1e35;
        border:3px solid #c52e41;border-radius:18px;box-shadow:0 18px 54px #87172d5c;font-family:inherit}
      #estoreVisualDelayAlert strong{display:block;font-size:16px;line-height:1.3;margin-bottom:7px}
      #estoreVisualDelayAlert p{font-size:13px;line-height:1.5;margin:0 0 13px}
      #estoreVisualDelayAlert .estore-delay-actions{display:flex;flex-wrap:wrap;gap:8px}
      #estoreVisualDelayAlert button{border:1px solid #d6a0aa;border-radius:10px;padding:10px 12px;cursor:pointer;font-weight:750}
      #estoreVisualDelayAlert [data-do=update]{background:#b91f39;color:white}
      #estoreVisualDelayAlert [data-do=snooze]{background:white;color:#8a1e35}
      @keyframes estore-visual-tremor{0%,100%{transform:translate3d(0,0,0)}
        7%,21%,35%,49%,63%,77%,91%{transform:translate3d(-7px,0,0)}
        14%,28%,42%,56%,70%,84%{transform:translate3d(7px,0,0)}}
      @keyframes estore-visual-flash{0%,100%{opacity:0}10%,90%{opacity:1}}
      @media(min-width:900px) and (pointer:fine) and (prefers-reduced-motion:no-preference){
        body.estore-visual-shaking{animation:estore-visual-tremor 2s ease-in-out 1!important;will-change:transform}
        body.estore-visual-shaking:after{content:"";position:fixed;inset:0;z-index:100000;
          pointer-events:none;box-sizing:border-box;border:6px solid #c52e41;
          animation:estore-visual-flash 2s linear 1}}
      @media(max-width:700px){#estoreVisualDelayAlert{right:10px;bottom:80px;width:calc(100vw - 20px)}}
      @media(prefers-reduced-motion:reduce){body.estore-visual-shaking{animation:none!important}}
    `;
    document.head.appendChild(style);
    node=document.createElement('aside');
    node.id='estoreVisualDelayAlert';node.hidden=true;
    node.setAttribute('role','status');node.setAttribute('aria-live','polite');
    node.innerHTML='<strong id="estoreVisualDelayTitle"></strong><p id="estoreVisualDelayMessage"></p>'+
      '<div class="estore-delay-actions"><button type="button" data-do="update">ATUALIZAR PARCIAL AGORA</button>'+
      '<button type="button" data-do="snooze">Lembrar em 10 minutos</button></div>';
    node.querySelector('[data-do=update]').addEventListener('click',()=>{
      clearShake();
      if(typeof go==='function')go('hourly');
      else location.href='./?menu=hourly';
    });
    node.querySelector('[data-do=snooze]').addEventListener('click',()=>{
      if(latest)save(key(latest.store,latest.date),{...saved(key(latest.store,latest.date)),snoozeUntil:Date.now()+600000});
      hide();
    });
    document.body.appendChild(node);
    return node;
  }
  function clearShake(){
    if(shakeTimeout){clearTimeout(shakeTimeout);shakeTimeout=0}
    document.body.classList.remove('estore-visual-shaking');
  }
  function hide(){
    const node=el('estoreVisualDelayAlert');
    if(node)node.hidden=true;
    clearShake();
    document.title=document.title.replace(/^🔴 PARCIAL eSTORE ATRASADA • /,'');
  }
  function canShake(){
    return document.visibilityState==='visible' &&
      matchMedia('(min-width: 900px) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches &&
      !document.activeElement?.matches('input,textarea,select,[contenteditable=true]') &&
      ![...document.querySelectorAll('[role=dialog]')].some(n=>n.getClientRects().length>0);
  }
  function render(){
    const node=ensure();
    if(!latest?.overdue){hide();return}
    const state=saved(key(latest.store,latest.date));
    if(Number(state.snoozeUntil||0)>Date.now()){hide();return}
    node.hidden=false;
    el('estoreVisualDelayTitle').textContent='⚠ PARCIAL eSTORE ATRASADA • LOJA '+latest.store;
    el('estoreVisualDelayMessage').textContent=latest.message;
    if(!canShake())return;
    const token=latest.store+'|'+latest.date+'|'+latest.stamp;
    if(state.shakeToken===token&&Date.now()-Number(state.shookAt||0)<EVERY)return;
    save(key(latest.store,latest.date),{...state,shakeToken:token,shookAt:Date.now()});
    clearShake();
    void document.body.offsetWidth;
    document.body.classList.add('estore-visual-shaking');
    shakeTimeout=setTimeout(clearShake,2000);
  }
  async function check(){
    if(loading)return;
    const user=identity(),now=timestamp(),hours=user?operating(now,user.store):null;
    if(!user||!hours){latest=null;hide();return}
    loading=true;
    try{
      const data=await api({action:'hourly_get',matricula:user.id,result_date:now.date});
      if(user.store!==identity()?.store||now.date!==timestamp().date)return;
      const row=(data?.stores||[]).find(r=>String(r.st).padStart(3,'0')===user.store);
      if(!row||!(Number(row.metaValue)>0)){latest=null;hide();return}
      let minute=hours.opening,valid=false,stamp='';
      if(row.updated_at){
        const at=new Date(row.updated_at),local=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{
          timeZone:API_DATE_ZONE,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'
        }).formatToParts(at).map(x=>[x.type,x.value]));
        const sameDate=local.year+'-'+local.month+'-'+local.day===now.date;
        if(sameDate&&at.getTime()<=Date.now()){
          minute=Math.max(hours.opening,(Number(local.hour)%24)*60+Number(local.minute));valid=true;stamp=row.updated_at;
        }
      }
      const minutes=Math.max(0,now.minute-minute);
      const status=typeof window.hourlyStatusV198==='function'?window.hourlyStatusV198(row,data):null;
      const missed=status&&Number.isFinite(Number(status.miss))?Number(status.miss):Math.floor(minutes/60);
      const overdue=missed>=2&&(status?['missing','stale'].includes(status.code):true);
      latest={store:user.store,date:now.date,stamp,overdue,minutes,
        message:(valid?'Última parcial há ':'Sem primeira parcial há ')+elapsed(minutes)+
          '. São '+missed+' parciais pendentes. Registre a venda ou confirme que não houve novos pedidos.'};
      render();
    }catch(error){console.warn('[eStore] Consulta do alerta visual indisponível:',error?.message||error)}
    finally{loading=false}
  }
  window.testarTremorEstore=function(){
    const user=identity();if(!user)return;
    const today=timestamp().date;
    latest={store:user.store,date:today,stamp:'teste',overdue:true,
      message:'Simulação de alerta. Nenhum valor ou pedido será alterado.'};
    const k=key(user.store,today),old=saved(k);save(k,{...old,shakeToken:'',shookAt:0,snoozeUntil:0});
    render();
    clearTimeout(sampleTimeout);
    sampleTimeout=setTimeout(()=>{save(k,old);latest=null;hide();check()},8000);
  };
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clearShake();else check()});
  window.addEventListener('storage',event=>{if(event.key?.includes('estore_hourly_changed'))check()});
  window.addEventListener('focus',check);
  setInterval(()=>{if(!document.hidden)check()},120000);
  setInterval(render,30000);
  setTimeout(check,3500);
})();
