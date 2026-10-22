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
let adminPassword='',supervisors=null,groupStatuses={},parsed=[],fileRef=null,rawText='',photoHash='',busy=false;
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
 const until=Math.min(ref.hour,closing),base=r.updated_at&&ref.date===clock().date?Math.max(opening,localHour(r.updated_at)):opening;
 // Conta janelas horárias vencidas, não vendas zeradas.
 return Math.max(0,until-base-(ref.minute<5&&until===ref.hour?1:0));
}
function status(r,j){
 const ref=reference(j),update=Boolean(r.updated_at),sales=Number(r.captured||0),miss=missingCount(r,ref);
 if(!update)return{code:'missing',label:miss+' parciais sem input de venda',miss};
 if(sales>0&&miss<=1)return{code:'spinning',label:'Girando ponteiro',miss:0};
 if(miss>=2)return{code:'missing',label:miss+' parciais sem input de venda',miss};
 return{code:'course',label:'Em curso',miss:0};
}
function noInput(j){
 return(j?.stores||[]).filter(r=>status(r,j).code==='missing'&&groupStatuses[String(r.st).padStart(3,'0')]!=='sale').map(r=>String(r.st).padStart(3,'0'));
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
 try{decorateScreen()}catch(_){}
 return supervisors;
}
function alertMessage(row,person){
 const first=String(person.name||'Liderança').split(' ')[0],d=curr()?.result_date||clock().date;
 if(alertTemplateV198)return alertTemplateV198({name:person.name,st:row.st,meta:row.metaValue,orders:row.orderTarget,condition:'missing',date:d,time:clock().time});
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
hourlyV5=function(){const html=legacyHourly();return html.replace('<div id=hourlyDashboardV5>',seedMarkup()+'<div id=hourlyDashboardV5>')};
const legacyRender=renderHourlyV5;
renderHourlyV5=function(){const result=legacyRender();try{decorateScreen()}catch(e){console.warn('[Hora v198] Falha no radar',e)}return result};
hourlyCaptionV6=caption;
window.hourlyStatusV198=status;
window.hourlyRadarV198=decorateScreen;
const prevLogout=typeof logoutApp==='function'?logoutApp:null;
if(prevLogout)logoutApp=function(...args){adminPassword='';supervisors=null;groupStatuses={};return prevLogout(...args)};
window.addEventListener('pagehide',()=>{adminPassword='';supervisors=null;groupStatuses={}});
console.info('[eStore] Hora a Hora v198: importação revisada e alertas assistidos');
})();