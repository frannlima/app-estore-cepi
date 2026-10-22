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
     ['📊','Share',rr.storeSales?rr.sales/rr.storeSales:null,'percent'],
     ['📉','Desvio',rr.sales-rr.meta,'money']
   ];
   const fmt=(v,type)=>type==='money'?Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}):type==='percent'?(v==null?'—':(v*100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'%'):String(v);
   const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
   const panel=document.querySelector('#hourPanel');
   if(panel)panel.innerHTML='<div class="hourV200Grid">'+values.map(([ic,title,v,type])=>'<div class="hourV200Metric"><span><i>'+ic+'</i> '+title+'</span><b class="'+(title==='Desvio'?(v<0?'hourV200Negative':'hourV200Positive'):'')+'">'+fmt(v,type)+'</b></div>').join('')+'</div>';
   const details=document.querySelector('#hourDetails');
   if(details)details.innerHTML='<div class="hourV200TableWrap"><table class="hourV200Table"><thead><tr><th>Filial</th><th>Meta</th><th>Captado</th><th>Pedidos</th><th>Ating.</th><th>Share</th><th>Desvio</th><th>Status</th></tr></thead><tbody>'+rows.map(r=>{
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
let alertTemplateV198=null;
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
 if(groupStatusesDate===j?.result_date&&groupStatuses[String(r.st).padStart(3,'0')]==='sale'&&!update)return{code:'course',label:'Em curso • informada no grupo',miss:0};
 if(!update)return{code:'missing',label:miss+' parciais sem input de venda',miss};
 if(sales>0&&miss<=1)return{code:'spinning',label:'Girando ponteiro',miss:0};
 if(miss>=2)return{code:'missing',label:miss+' parciais sem input de venda',miss};
 return{code:'course',label:'Em curso',miss:0};
}
function noInput(j){
 return(j?.stores||[]).filter(r=>status(r,j).code==='missing').map(r=>String(r.st).padStart(3,'0'));
}
function statusCounts(j){
 const all=j?.stores||[];
 return{spinning:all.filter(r=>status(r,j).code==='spinning').length,course:all.filter(r=>status(r,j).code==='course').length,missing:noInput(j).length};
}
function parse(text){
 const parsed=new Map();
 const lines=String(text||'').replace(/\r/g,'').split(/\n/);
 for(const ln of lines){
  const line=ln.replace(/[ \t]+/g,' ').trim();
  // Necessário formato "LOJA ➜ META DE PEDIDOS [VALORES DE VENDA]".
  const m=line.match(/^(?:[•·*]\s*)?(?:L\s*)?(\d{3})\s*(?:➜|➔|➡|→|➤|➞|->|:)\s*(.+)$/u);
  if(!m||!STORES.includes(m[1]))continue;
  const tail=m[2].trim();
  const goal=tail.match(/^\*{0,2}\s*(\d{1,3})\s*\*{0,2}/);
  if(!goal)continue;
  const after=tail.slice(goal[0].length);
  const tokens=[...after.matchAll(/(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2}|\d+[.,]\d{2})(?!\d)/g)].map(x=>x[1]);
  const amounts=tokens.map(moneyVal).filter(x=>Number.isFinite(x)&&x>0&&x<1e6);
  parsed.set(m[1],{st:m[1],goal:Number(goal[1]),amounts,source:line});
 }
 return [...parsed.values()];
}
window.hourlyParsedPrintV198=parse;
function seedMarkup(){
 return '<section class="card hourImportCardV198"><div class="hourNewHeadV198"><div><b>📥 Consolidar print do grupo</b><small>Importe vendas citadas no WhatsApp, confira valores e lance várias filiais de uma vez.</small></div></div>'+
 (isMain()?'<button type="button" class="btn" onclick="hourPrintOpenV198()">Importar print / texto</button><span class="hourSmallV198">Somente administrador; exige senha e revisão de cada lançamento.</span>':'<p class="muted">A importação regional é feita pelo administrador. Sua filial continua atualizando pelo formulário acima.</p>')+
 '</section><section class="card hourAlertsCardV198" id="hourAlertsSectionV198"><div class="hourNewHeadV198"><div><b>🚨 Mobilização | Lojas sem input</b><small>Sem atualização não significa venda zerada. Acompanhe pendências por parcial.</small></div></div><div id="hourRadarV198" class="hourRadarV198">Carregando situação...</div>'+
 (isMain()?'<button type="button" class="btn alt" onclick="hourAlertDirectoryV198()">Ver supervisores e preparar alertas no WhatsApp</button>':'<p class="hourSmallV198">Alertas com contatos são restritos ao administrador.</p>')+
 '<div id="hourSupervisorListV198"></div></section>';
}
function decorateScreen(){
 const j=curr(),root=document.getElementById('hourlyDashboardV5'),radar=document.getElementById('hourRadarV198');
 if(!j||!root)return;
 const rowBase=root.querySelector('.hourTableV6 table');
 if(rowBase){
  const rows=[...(j.stores||[])].sort((a,b)=>Number(b.captured||0)-Number(a.captured||0));
  rowBase.innerHTML='<thead><tr><th>Filial</th><th>Meta eStore</th><th>Captado</th><th>Pedidos</th><th>Ating.</th><th>Share</th><th>Desvio</th><th>Status</th></tr></thead><tbody>'+rows.map(r=>{
   const st=status(r,j),dev=Number(r.captured||0)-Number(r.metaValue||0);
   return '<tr class="hourRowV6 hourDynamicV198 '+st.code+'"><td><b>L'+esc(r.st)+'</b></td>'+
   '<td>'+moneyBR(r.metaValue)+'</td><td>'+moneyBR(r.captured)+'</td>'+
   '<td>'+Number(r.orders||0)+' / '+Number(r.orderTarget||0)+'</td>'+
   '<td>'+fmtPercent(r.att)+'</td><td>'+fmtPercent(r.share)+'</td>'+
   '<td class="'+(dev>=0?'devPosV6':'devNegV6')+'">'+(dev>0?'▲ ':'▼ ')+moneyBR(dev)+'</td>'+
   '<td><span class="hourStatusV198 '+st.code+'">'+(st.code==='spinning'?'🟢':st.code==='course'?'🟠':'🔴')+' '+esc(st.label)+'</span></td></tr>';
  }).join('')+'</tbody>';
 }
 const old=root.querySelector('.hourAlertV6');if(old)old.remove();
 const nf=noInput(j),counts=statusCounts(j);
 if(radar)radar.innerHTML='<div class="hourRadarCountersV198"><span>🟢 Girando ponteiro <b>'+counts.spinning+'</b></span><span>🟠 Em curso <b>'+counts.course+'</b></span><span>🔴 Sem input <b>'+counts.missing+'</b></span></div>'+
 '<p><b>Filiais pendentes:</b> '+(nf.length?nf.map(x=>'L'+x).join(' • '):'Nenhuma')+'</p><small>Contagem por intervalo desde o último lançamento. Mensagens do grupo não são lidas automaticamente: importe o print para considerar as vendas. Após validar a Central, as lojas com venda confirmada no grupo ficam fora dos alertas.</small>';
 if(supervisors)showDirectory();
}
function shortName(s){return String(s||'').trim().split(/\s+/).slice(0,2).join(' ')}
function caption(j){
 if(!j)return '';
 const arr=j.stores||[],r={captured:0,meta:0,orders:0,orderTarget:0,storeSales:0};
 for(const x of arr){r.captured+=Number(x.captured||0);r.meta+=Number(x.metaValue||0);r.orders+=Number(x.orders||0);r.orderTarget+=Number(x.orderTarget||0);r.storeSales+=Number(x.storeSales||0)}
 const n=arr.filter(x=>Number(x.captured||0)>0).length,miss=noInput(j),desvio=r.captured-r.meta;
 const t=clock(),latestTime=j.result_date===t.date?t.time:'Fechamento';
 const lines=[
  '📊 *PARCIAL eSTORE | CE+PI* • '+dateBR(j.result_date)+' '+latestTime,
  '🎯 *Meta:* '+moneyBR(r.meta)+' | 💰 *Captado:* '+moneyBR(r.captured),
  '🛍️ *Pedidos:* '+r.orders+'/'+r.orderTarget+' | 📈 *Ating.:* '+fmtPercent(r.meta>0?r.captured/r.meta:null),
  '📊 *Share:* '+fmtPercent(r.storeSales>0?r.captured/r.storeSales:null)+' | '+(desvio<0?'🔻':'🔺')+' *Desvio:* '+moneyBR(desvio),
  '🏬 *Lojas com venda:* '+n+'/'+arr.length,
  '⚠️ *Sem input:* '+miss.length+' loja'+(miss.length===1?'':'s')+(miss.length?' • '+miss.slice(0,8).map(st=>'L'+st).join(', ')+(miss.length>8?' +'+(miss.length-8):''):'')
 ];
 if(miss.length){
  const sup=(supervisors||[]).filter(x=>miss.includes(x.st)).flatMap(x=>x.people.map(y=>({st:x.st,name:y.name})));
  lines.push('🚨 *Supervisores:* '+(sup.length?sup.slice(0,5).map(x=>'L'+x.st+' '+shortName(x.name)).join(' • ')+(sup.length>5?' +'+(sup.length-5)+' no app':''):'consulte a relação de alertas no app'));
 }
 lines.push('','🔗 *Atualize a venda da sua loja:*',APP_URL,'','_Moda que inspira o Brasil_');
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
function showDirectory(){
 const target=document.getElementById('hourSupervisorListV198'),j=curr();
 if(!target||!j||!supervisors)return;
 const miss=noInput(j),map=new Map((j.stores||[]).map(x=>[x.st,x]));
 target.innerHTML='<div class="hourDirTitleV198">Supervisores responsáveis • '+miss.length+' lojas pendentes</div>'+
 (miss.length?miss.map(st=>{
  const row=map.get(st),entry=supervisors.find(x=>x.st===st);
  const people=entry?.people||[];
  if(!people.length)return '<div class="hourDirRowV198"><b>L'+st+'</b><span>Sem supervisor ativo elegível cadastrado</span></div>';
  return people.map((p,i)=>'<div class="hourDirRowV198"><b>L'+st+'</b><span>'+esc(p.name)+'<small>'+esc(p.role)+'</small></span>'+
   (p.phone?'<button class="btn" data-hwa="'+st+'" data-hsup="'+i+'">WhatsApp ↗</button>':'<small>Contato pendente de validação</small>')+'</div>').join('');
 }).join(''):'<p class="muted">Nenhuma loja pendente.</p>')+
 '<label class="hourConfirmV198"><input type="checkbox" id="hourWorkingV198"> Confirmei que os destinatários estão em expediente e autorizados a receber contato agora.</label>'+
 '<p class="hourSmallV198">Abre uma mensagem individual para envio manual. Não envia em massa automaticamente. Contatos sem validação não são liberados.</p>';
 target.querySelectorAll('[data-hwa]').forEach(btn=>btn.onclick=()=>{
  if(!target.querySelector('#hourWorkingV198')?.checked){alert('Confirme a jornada de trabalho dos supervisores antes de abrir o WhatsApp.');return}
  const st=btn.dataset.hwa,entry=supervisors.find(x=>x.st===st),p=entry?.people?.[Number(btn.dataset.hsup)],row=map.get(st);
  if(!p?.phone||!row)return;
  window.open('https://wa.me/'+p.phone.replace(/\D/g,'')+'?text='+encodeURIComponent(alertMessage(row,p)),'_blank','noopener,noreferrer');
 });
}
window.hourAlertDirectoryV198=async function(){const host=document.getElementById('hourSupervisorListV198');try{if(host)host.innerHTML='<p class="muted">Consultando contatos protegidos...</p>';await directory();showDirectory();}catch(e){if(host)host.textContent=String(e.message||e)}};
function showModal(){
 document.getElementById('hourPrintModalV198')?.remove();
 const modal=document.createElement('div');modal.id='hourPrintModalV198';modal.className='hourPrintOverlayV198';
 const t=clock(),date=document.getElementById('hourDateV5')?.value||t.date;
 modal.innerHTML='<div class="hourPrintBoxV198" role="dialog" aria-modal="true" aria-label="Importar print conferido do WhatsApp">'+
 '<div class="hourNewHeadV198"><div><h3>📥 Importar print do WhatsApp</h3><small>Metas após as setas não são vendas. Somente valores financeiros informados podem ser lançados.</small></div><button type="button" class="btn ghost" id="hourPrintCloseV198">✕</button></div>'+
 '<div class="hourPrintDatesV198"><label>Data do resultado<input type="date" id="hourImportDateV198" value="'+date+'"></label><label>Horário do print<input type="time" id="hourImportTimeV198" value="'+t.time+'"></label></div>'+
 '<label class="hourUploadV198">📷 Anexar print do grupo (PNG/JPG/WEBP, até 8 MB)<input type="file" id="hourImportFileV198" accept="image/*"></label>'+
 '<label class="hourPasteLabelV198">Ou cole o texto da mensagem para leitura mais precisa<textarea rows="6" id="hourImportTextV198" placeholder="073 ➜ 5&#10;108 ➜ 8 159,98&#10;177 ➜ *4* 209,98 / 161,99"></textarea></label>'+
 '<div class="hourPrintActionsV198"><button class="btn alt" id="hourRunOCRV198">Ler print e preparar conferência</button><button class="btn ghost" id="hourRunTextV198">Analisar texto</button></div>'+
 '<div id="hourParseStateV198" role="status" class="hourSmallV198"></div><div id="hourImportRowsV198"></div>'+
 '<label class="hourConfirmV198"><input type="checkbox" id="hourImportReviewedV198"> Conferi data, horário e cada venda marcada. Os números após a seta representam a meta de pedidos.</label>'+
 '<label class="hourPasteLabelV198">Senha administrativa<input type="password" class="field" autocomplete="off" id="hourImportPwdV198" placeholder="Obrigatória para salvar"></label>'+
 '<button type="button" class="btn" id="hourImportCommitV198">Conferir e salvar lançamentos selecionados</button><div id="hourImportResultV198" role="status"></div>'+
 '</div>';
 document.body.appendChild(modal);document.body.style.overflow='hidden';
 const close=()=>{modal.remove();document.body.style.overflow='';fileRef=null;rawText='';parsed=[];};
 modal.querySelector('#hourPrintCloseV198').onclick=close;
 modal.addEventListener('click',e=>{if(e.target===modal)close()});
 modal.querySelector('#hourRunTextV198').onclick=()=>analyzeText(modal,false);
 modal.querySelector('#hourRunOCRV198').onclick=()=>readOCR(modal);
 modal.querySelector('#hourImportCommitV198').onclick=()=>commit(modal);
}
window.hourPrintOpenV198=function(){if(!isMain())return;showModal()};
async function hashFor(file,text){
 const bytes=file?await file.arrayBuffer():new TextEncoder().encode('WhatsApp:text:'+text);
 const arr=new Uint8Array(await crypto.subtle.digest('SHA-256',bytes));
 return [...arr].map(v=>v.toString(16).padStart(2,'0')).join('');
}
function analyzeText(modal,fromOCR){
 const text=modal.querySelector('#hourImportTextV198').value;
 if(!text.trim())return modal.querySelector('#hourParseStateV198').textContent='Cole uma mensagem ou envie um print para reconhecimento.';
 parsed=parse(text);
 rawText=text;
 const statusEl=modal.querySelector('#hourParseStateV198');
 statusEl.textContent=parsed.length+' filiais reconhecidas; '+parsed.filter(x=>x.amounts.length).length+' com indicação de valor. '+(fromOCR?'Verifique cuidadosamente a leitura OCR.':'');
 renderReview(modal);
}
async function readOCR(modal){
 const state=modal.querySelector('#hourParseStateV198'),file=modal.querySelector('#hourImportFileV198')?.files?.[0];
 if(!file)return analyzeText(modal,false);
 if(!file.type.startsWith('image/')||file.size>8e6){state.textContent='Selecione uma imagem de até 8 MB.';return}
 if(busy)return;busy=true;fileRef=file;
 state.textContent='Reconhecendo texto da imagem no dispositivo...';
 try{
  if(!window.Tesseract){
   const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
   await new Promise((resolve,reject)=>{s.onload=resolve;s.onerror=reject;document.head.appendChild(s)});
  }
  let r;try{r=await window.Tesseract.recognize(file,'por+eng')}catch(_){r=await window.Tesseract.recognize(file,'eng')}
  modal.querySelector('#hourImportTextV198').value=r?.data?.text||'';
  analyzeText(modal,true);
 }catch(e){state.textContent='A leitura do print não foi possível. Cole ou corrija manualmente o texto. '+String(e.message||e)}
 finally{busy=false}
}
function renderReview(modal){
 const host=modal.querySelector('#hourImportRowsV198');
 const candidates=parsed.filter(x=>x.amounts.length>0);
 host.innerHTML='<h4>Conferência de vendas por filial</h4>'+
 '<p class="hourSmallV198">Valores reconhecidos não entram automaticamente. Confira cada filial. Indique se a quantia é venda incremental ou acumulado do dia. Pedidos são opcionais quando não constam da mensagem.</p>'+
 (candidates.length?candidates.map(x=>{
  const multi=x.amounts.length>1;
  return '<div class="hourImportRowV198" data-hir="'+x.st+'"><label class="hourCheckV198"><input type="checkbox" data-hi-check> <strong>L'+x.st+'</strong></label>'+
   '<small>Meta de pedidos: '+x.goal+'</small>'+
   (multi?'<small class="hourMultiV198">Múltiplos valores encontrados: '+x.amounts.map(moneyBR).join(' / ')+'. Confirme o total manualmente.</small>':'')+
   '<label>Venda (R$)<input class="field" data-hi-captured type="text" inputmode="decimal" value="'+(multi?'':x.amounts[0].toFixed(2).replace('.',','))+'" placeholder="0,00"></label>'+
   '<label>Pedidos reais<input class="field" data-hi-orders type="number" min="0" max="10000" step="1" value="0"></label>'+
   '<label>Tipo<select class="field" data-hi-mode><option value="incremental">Venda incremental</option><option value="cumulative">Total acumulado do dia</option></select></label></div>';
 }).join(''):'<p class="hourMultiV198">Nenhuma venda identificada com segurança. Os números após as setas são metas de pedidos, não vendas realizadas.</p>');
}
async function commit(modal){
 const result=modal.querySelector('#hourImportResultV198'),date=modal.querySelector('#hourImportDateV198').value,time=modal.querySelector('#hourImportTimeV198').value,password=modal.querySelector('#hourImportPwdV198').value;
 if(!modal.querySelector('#hourImportReviewedV198').checked)return result.textContent='Confirme a revisão dos lançamentos.';
 if(!password)return result.textContent='Informe a senha administrativa.';
 const rows=[];
 for(const el of modal.querySelectorAll('[data-hir]')){
  if(!el.querySelector('[data-hi-check]')?.checked)continue;
  const captured=moneyVal(el.querySelector('[data-hi-captured]')?.value),orders=Number(el.querySelector('[data-hi-orders]')?.value);
  if(!Number.isFinite(captured)||captured<=0||!Number.isInteger(orders)||orders<0)return result.textContent='Valor ou pedidos inválidos na filial '+el.dataset.hir;
  rows.push({st:el.dataset.hir,captured,orders,mode:el.querySelector('[data-hi-mode]').value});
 }
 if(!rows.length)return result.textContent='Selecione ao menos uma loja com venda confirmada.';
 const btn=modal.querySelector('#hourImportCommitV198');
 if(btn.disabled)return;btn.disabled=true;result.textContent='Verificando duplicidades e salvando lojas conferidas...';
 try{
  const text=modal.querySelector('#hourImportTextV198').value;
  const source_hash=await hashFor(fileRef,text);
  const res=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',body:JSON.stringify({action:'commit',matricula:String(user().id),password,date,time,source_hash,rows,reviewed:true})});
  const json=await res.json();
  if(!res.ok||!json.ok)throw Error(json.error||'Falha ao salvar');
  result.innerHTML='<div class="hourResultV198">✅ '+json.imported+' loja(s) adicionadas ao acumulado. '+json.skipped+' ignorada(s) para evitar duplicidade ou parcial desatualizada.<ul>'+
   (json.rows||[]).map(x=>'<li>L'+esc(x.st)+' — '+(x.status==='imported'?'Adicionado '+moneyBR(x.captured):x.status==='stale'?'Parcial anterior ao lançamento já existente':x.status==='duplicate'?'Print já importado':'Sem novo valor')+'</li>').join('')+'</ul></div>';
  adminPassword=password;
  await loadHourlyV5();
 }catch(e){result.textContent=String(e.message||e)}
 finally{btn.disabled=false}
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
 ['📊','SHARE REGIONAL',total.storeSales>0?percent(total.captured/total.storeSales):'—'],
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
 put(ctx,'Meta: '+money(total.meta)+'   •   Captação: '+money(total.captured)+'   •   Lojas com venda: '+active+'/'+n,54,fb+111,18,GREEN,true);
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