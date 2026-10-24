// eStore CE+PI — fila de mobilização após consolidar a parcial do WhatsApp.
// O WhatsApp exige a confirmação de envio pelo usuário; abrir a conversa NÃO é entrega.
import {createAlertImage,sharePreparedAlert,canNativeFileShare} from './alert-card-share.mjs';
const LINK='https://frannlima.github.io/app-estore-cepi/?menu=hourly';
const STREETS=new Set(['084','113','146']);
const STORES=new Set(['073','084','108','113','138','142','146','175','177','222','238','258','262','314','318','344','350','552']);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const clock=(now=new Date())=>{
 const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'America/Fortaleza',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now).map(x=>[x.type,x.value]));
 return{date:p.year+'-'+p.month+'-'+p.day,time:p.hour+':'+p.minute,hour:Number(p.hour)};
};
const fmtDate=d=>/^\d{4}-\d{2}-\d{2}$/.test(d)?d.slice(8)+'/'+d.slice(5,7)+'/'+d.slice(0,4):'—';
const openHour=(st,hour)=>hour>=14&&hour<=21&&(!STREETS.has(st)||hour<18);
const validPhone=phone=>/^55[1-9]\d9\d{8}$/.test(String(phone||'').replace(/\D/g,''));
export function pendingNoSale(stores,referenceDate,at=new Date(),groupStatuses={}){
 const today=clock(at).date;
 if(referenceDate!==today)return[];
 return (stores||[]).filter(r=>{
  const st=String(r.st||'').padStart(3,'0');
  if(!STORES.has(st)||!(Number(r.metaValue)>0)||Number(r.captured||0)>0)return false;
  if(groupStatuses[st]==='sale')return false;
  const updated=r.updated_at?Date.parse(r.updated_at):NaN;
  return !Number.isFinite(updated)||at.getTime()-updated>=60*60*1000;
 }).sort((a,b)=>String(a.st).localeCompare(String(b.st)));
}
function reason(row,group){
 if(group==='zero')return['Venda zero confirmada','Zero confirmado na parcial; validar a situação com a filial.'];
 if(group==='missing')return['Sem venda no grupo','A parcial do grupo não trouxe pedidos. Isso não comprova venda zero.'];
 if(row.updated_at)return['Parcial anterior sem venda','A confirmação da filial está atrasada há mais de uma hora.'];
 return ['Sem informação de venda','Nenhuma captação registrada até esta consulta.'];
}
export function alertMessage(row,person,date,group,now){
 const [label]=reason(row,group);
 const first=String(person.name||'Supervisor').trim().split(/\s+/)[0];
 return [
  '🚨 *ALERTA eSTORE | CE+PI*',
  '📅 '+fmtDate(date)+' • '+clock(now).time,
  '',
  'Olá, *'+first+'*! Precisamos atualizar o resultado da *filial '+row.st+'*.',
  '',
  '🎯 *Meta eStore:* '+money(row.metaValue),
  '🛍️ *Meta de pedidos:* '+Number(row.orderTarget||0),
  '💰 *Captação registrada:* '+money(row.captured),
  '⚠️ *Situação:* '+label,
  '',
  clock(now).hour===21?
   '⏰ *Fechamento:* informe a venda eStore captada no dia ou confirme que não houve pedidos.':
   '📲 Se houve vendas, registre apenas pedidos novos. Se não houve, confirme a parcial sem novas vendas.',
  '',
  '*Menu → Hora a Hora → Registrar incremento / Confirmar sem novas vendas*',
  LINK,
  '',
  '_Moda que inspira o Brasil_'
 ].join('\n');
}
export function renderPriorityQueue({target,data,contacts,groupStatuses={},at=new Date()}){
 if(!target||!data)return{total:0,eligible:0};
 const today=clock(at),dated=data.result_date===today.date;
 const pending=pendingNoSale(data.stores,data.result_date,at,groupStatuses);
 const active=(data.stores||[]).filter(r=>Number(r.metaValue||0)>0);
 const selling=active.filter(r=>Number(r.captured||0)>0).length;
 const available=pending.flatMap(r=>{
  const store=String(r.st).padStart(3,'0');
  return(contacts.find(c=>c.st===store)?.people||[]).filter(p=>p.phone&&!p.onLeave&&validPhone(p.phone)&&openHour(store,today.hour));
 }).length;
 const cards=pending.map(row=>{
  const st=String(row.st).padStart(3,'0'),group=groupStatuses[st]||'unknown';
  const [label,detail]=reason(row,group),people=contacts.find(c=>c.st===st)?.people||[];
  const personRows=people.length?people.map((p,index)=>{
   const ready=!!p.phone&&!p.onLeave&&validPhone(p.phone)&&openHour(st,today.hour);
   const explanation=p.onLeave?'Férias ou afastamento: bloqueado':!p.phone?'Contato/consentimento pendente':!openHour(st,today.hour)?'Fora do horário de contato':'Contato validado';
   return '<div class="hourPriorityPersonV225"><div class="hourPriorityIdentityV225"><b>'+esc(p.name)+'</b><small>'+esc(p.role)+'</small><small>'+esc(explanation)+'</small></div>'+
   (ready?'<div class="hourPriorityActionsV225"><button type="button" class="btn hourPrioritySendV227" data-qa-send="'+esc(st)+'" data-qa-p="'+index+'">📲 Enviar alerta</button></div>':
   '<span class="hourPriorityLockedV225">Indisponível</span>')+'</div>';
  }).join(''):'<p class="hourPriorityHintV225">Não há supervisor com contato validado para esta loja.</p>';
  return '<article class="hourPriorityStoreV225"><header><div><strong>L'+esc(st)+'</strong><b>'+esc(label)+'</b></div><span>'+money(row.captured)+'</span></header>'+
   '<p>'+esc(detail)+' • Meta: '+money(row.metaValue)+' • '+Number(row.orderTarget||0)+' pedidos previstos</p>'+
   personRows+'</article>';
 }).join('');
 target.innerHTML='<section class="hourPriorityQueueV225">'+
  '<div class="hourPriorityHeadV225"><div><strong>🚨 Alertas prontos | Lojas sem venda informada</strong><small>Resultado '+fmtDate(data.result_date)+' • '+today.time+' • Contatos validados dos supervisores</small></div>'+
  '<div class="hourPriorityKpisV225"><span><b>'+selling+'</b> com venda</span><span><b>'+pending.length+'</b> sem venda</span><span><b>'+available+'</b> contatos aptos</span></div></div>'+
  (dated?(pending.length?'<div class="hourPriorityStoresV225">'+cards+'</div>':'<p class="hourPriorityHintV225">Nenhuma loja exige alerta por ausência de venda neste momento.</p>'):'<p class="hourPriorityHintV225">Referência histórica: a lista de contatos é liberada somente para o dia atual.</p>')+
  '<label class="hourPriorityConfirmV225"><input type="checkbox" data-qa-check> Confirmei que o supervisor está em expediente e autorizado a receber esta mensagem.</label>'+
  '<p class="hourPriorityFootV225">Um botão prepara o card PNG com a legenda personalizada. No celular, escolha o WhatsApp e confira o supervisor correto e a legenda antes de enviar. No computador, o PNG será baixado e a conversa correta será aberta com o texto pronto; anexe o PNG manualmente. Nenhum alerta é enviado automaticamente.</p>'+
  '<p class="hourPriorityResponseV225" data-qa-response aria-live="polite" role="status"></p></section>';
 const msg=target.querySelector('[data-qa-response]');
 const validate=button=>{
  if(!target.querySelector('[data-qa-check]')?.checked){msg.textContent='Confirme expediente e autorização antes de preparar o alerta.';return null}
  const st=button.dataset.qaSend;
  const row=pending.find(r=>r.st===st),person=contacts.find(c=>c.st===st)?.people?.[Number(button.dataset.qaP)];
  if(!row||Number(row.captured||0)>0){msg.textContent='Filial já possui venda registrada. Atualize o painel.';return null}
  if(!person?.phone||person.onLeave||!validPhone(person.phone)||!openHour(st,clock().hour)){msg.textContent='Contato indisponível ou fora do horário de alerta.';return null}
  return {row,person,st};
 };
 target.querySelectorAll('[data-qa-send]').forEach(btn=>btn.onclick=async()=>{
  const obj=validate(btn);if(!obj)return;
  const selectedData=data;
  const originalLabel=btn.textContent,phone=String(obj.person.phone||'').replace(/\D/g,'');
  const shareSupported=canNativeFileShare();
  // O desktop reserva a aba durante o clique para evitar bloqueio de popup após renderizar o PNG.
  const chatWindow=!shareSupported?window.open('about:blank','_blank'):null;
  const contactName=String(obj.person.name||'Supervisor');
  const caption=alertMessage(obj.row,obj.person,selectedData.result_date,groupStatuses[obj.st]||'unknown',new Date());
  btn.disabled=true;btn.textContent='Preparando alerta…';
  msg.textContent='Gerando card PNG + mensagem para '+contactName+' (L'+obj.st+')…';
  try{
   const lastTime=obj.row.updated_at?new Date(obj.row.updated_at).toLocaleTimeString('pt-BR',{timeZone:'America/Fortaleza',hour:'2-digit',minute:'2-digit'}):null;
   const kind=groupStatuses[obj.st]==='zero'?'zero':'missing';
   const file=await createAlertImage(
     {person:{nome:contactName},name_original:contactName,store_code_original:obj.st},
     {st:obj.st,meta:Number(obj.row.metaValue),orders:Number(obj.row.orderTarget),
      condition:kind,first_check_time:lastTime,last_sale_change_time:lastTime,
      closing:clock().hour===21,link:LINK}
   );
   const result=await sharePreparedAlert({
    file,caption,phone,store:obj.st,name:contactName,preopenedWindow:chatWindow
   });
   if(result.mode==='native'){
    // O compartilhamento nativo não informa qual destinatário foi realmente escolhido.
    msg.textContent='Card e legenda preparados no compartilhamento. Confira que o destino é '+contactName+' (L'+obj.st+') e confirme a legenda no WhatsApp. O app não confirma entrega.';
   }else{
    msg.textContent='Card PNG baixado e mensagem preparada para '+contactName+'. '+(result.chatOpened?'A conversa do WhatsApp foi aberta.':'Use o link abaixo para abrir a conversa.')+' Anexe o PNG na conversa e confirme o envio. A imagem não é anexada automaticamente.';
    if(!result.chatOpened&&result.url){
     const a=document.createElement('a');a.href=result.url;a.target='_blank';a.rel='noopener noreferrer';
     a.textContent='Abrir WhatsApp de '+contactName+' ↗';
     const holder=document.createElement('span');holder.append(' ');holder.append(a);msg.append(holder);
    }
   }
  }catch(e){
   if(chatWindow&&!chatWindow.closed)chatWindow.close();
   if(e?.name==='AbortError'){msg.textContent='Compartilhamento cancelado. Nenhum envio foi confirmado.';}
   else{msg.textContent='Não foi possível preparar o alerta: '+String(e?.message||e)+'. Nenhum envio foi confirmado.';}
  }finally{
   btn.disabled=false;btn.textContent=originalLabel;
  }
 });

 return {total:pending.length,eligible:available};
}
