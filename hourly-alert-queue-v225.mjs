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
   '<span class="hourPriorityLockedV225">Indisponível</span>')+'<small class="hourPriorityInlineV229" role="status" aria-live="polite" data-qa-inline></small></div>';
  }).join(''):'<p class="hourPriorityHintV225">Não há supervisor com contato validado para esta loja.</p>';
  return '<article class="hourPriorityStoreV225"><header><div><strong>L'+esc(st)+'</strong><b>'+esc(label)+'</b></div><span>'+money(row.captured)+'</span></header>'+
   '<p>'+esc(detail)+' • Meta: '+money(row.metaValue)+' • '+Number(row.orderTarget||0)+' pedidos previstos</p>'+
   personRows+'</article>';
 }).join('');
 target.innerHTML='<section class="hourPriorityQueueV225">'+
  '<div class="hourPriorityHeadV225"><div><strong>🚨 Alertas prontos | Lojas sem venda informada</strong><small>Resultado '+fmtDate(data.result_date)+' • '+today.time+' • Contatos validados dos supervisores</small></div>'+
  '<div class="hourPriorityKpisV225"><span><b>'+selling+'</b> com venda</span><span><b>'+pending.length+'</b> sem venda</span><span><b>'+available+'</b> contatos aptos</span></div></div>'+
  (dated?(pending.length?'<div class="hourPriorityStoresV225">'+cards+'</div>':'<p class="hourPriorityHintV225">Nenhuma loja exige alerta por ausência de venda neste momento.</p>'):'<p class="hourPriorityHintV225">Referência histórica: a lista de contatos é liberada somente para o dia atual.</p>')+
  '<p class="hourPriorityFootV225">Antes de preparar cada alerta, confirme individualmente que o supervisor está em expediente e autorizado a receber a mensagem.</p>'+
  '<p class="hourPriorityFootV225">Um botão prepara o card PNG com a legenda personalizada. No celular, escolha o WhatsApp e confira o supervisor correto e a legenda antes de enviar. No computador, o PNG será baixado e a conversa correta será aberta com o texto pronto; anexe o PNG manualmente. Nenhum alerta é enviado automaticamente.</p>'+
  '<p class="hourPriorityResponseV225" data-qa-response aria-live="polite" role="status"></p></section>';
 const msg=target.querySelector('[data-qa-response]');
 const statusAt=button=>button?.closest?.('.hourPriorityPersonV225')?.querySelector?.('[data-qa-inline]')||msg;
 const notify=(button,text)=>{
  const local=statusAt(button);
  if(local)local.textContent=text;
  if(msg&&local!==msg)msg.textContent='Última ação: '+text;
 };
 const validate=button=>{
  const st=button.dataset.qaSend;
  const row=pending.find(r=>String(r.st).padStart(3,'0')===st);
  const person=contacts.find(c=>c.st===st)?.people?.[Number(button.dataset.qaP)];
  if(!row||Number(row.captured||0)>0){notify(button,'A venda desta filial mudou. Atualize o painel antes de preparar o alerta.');return null}
  if(!person?.phone||person.onLeave||!validPhone(person.phone)||!openHour(st,clock().hour)){
   notify(button,'Contato indisponível ou fora do horário de alertas.');return null;
  }
  return {row,person,st};
 };
 target.querySelectorAll('[data-qa-send]').forEach(button=>{
  button.addEventListener('click',async()=>{
   notify(button,'Botão acionado. Verificando o supervisor e a filial…');
   const obj=validate(button);if(!obj)return;
   // A confirmação é solicitada AO LADO DO SUPERVISOR, sem depender de checkbox no fim da lista.
   const approved=window.confirm('Enviar alerta para '+obj.person.name+' (filial '+obj.st+')?\n\nConfirme que está em expediente e autorizou receber a mensagem.\n\nO WhatsApp exigirá sua confirmação final de envio.');
   if(!approved){notify(button,'Preparação cancelada; nenhuma mensagem foi enviada.');return}
   const originalLabel=button.textContent;
   const phone=String(obj.person.phone).replace(/\D/g,'');
   let chatWindow=null;
   try{
    // Reserva a janela ainda dentro do clique no desktop para impedir bloqueio após criar o PNG.
    const nativeShare=canNativeFileShare();
    if(!nativeShare){
     try{chatWindow=window.open('about:blank','_blank');}catch(_){chatWindow=null}
    }
    const caption=alertMessage(obj.row,obj.person,data.result_date,groupStatuses[obj.st]||'unknown',new Date());
    button.disabled=true;
    button.textContent='Preparando card…';
    notify(button,'Gerando card PNG e mensagem para '+obj.person.name+'…');
    const lastTime=obj.row.updated_at?new Date(obj.row.updated_at).toLocaleTimeString('pt-BR',{timeZone:'America/Fortaleza',hour:'2-digit',minute:'2-digit'}):null;
    const kind=groupStatuses[obj.st]==='zero'?'zero':'missing';
    const file=await createAlertImage(
     {person:{nome:obj.person.name},name_original:obj.person.name,store_code_original:obj.st},
     {st:obj.st,meta:Number(obj.row.metaValue),orders:Number(obj.row.orderTarget),
      condition:kind,first_check_time:lastTime,last_sale_change_time:lastTime,
      closing:clock().hour===21,link:LINK}
    );
    // O WhatsApp não tem API do navegador para enviar PNG a um número de forma silenciosa.
    const shared=await sharePreparedAlert({
     file,caption,phone,store:obj.st,name:obj.person.name,preopenedWindow:chatWindow
    });
    if(shared.mode==='native'){
     notify(button,'Card e legenda preparados. Selecione o WhatsApp, confira '+obj.person.name+' e toque em Enviar. A entrega não é confirmada pelo app.');
    }else{
     notify(button,'PNG baixado e mensagem pronta para '+obj.person.name+'. Anexe a imagem na conversa e confirme Enviar.');
     if(!shared.chatOpened&&shared.url){
      const local=statusAt(button);
      if(local){
       const a=document.createElement('a');a.href=shared.url;a.target='_blank';a.rel='noopener noreferrer';
       a.textContent='Abrir WhatsApp de '+obj.person.name+' ↗';
       local.append(document.createTextNode(' '));local.append(a);
      }
     }
    }
   }catch(err){
    if(chatWindow&&!chatWindow.closed)try{chatWindow.close()}catch(_){}
    notify(button,err?.name==='AbortError'?'Compartilhamento cancelado. Nenhum envio confirmado.':
      'Falha ao preparar o alerta: '+String(err?.message||err)+'. Nenhum envio confirmado.');
   }finally{
    button.disabled=false;button.textContent=originalLabel;
   }
  });
 });
 return {total:pending.length,eligible:available};
}
