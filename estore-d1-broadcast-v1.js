/* App eStore CE+PI — Comunicados D-1 aos supervisores.
   Geracao em massa de fila e legendas; nenhum envio automatico. */
(function(){
"use strict";
if(window.__estoreDailyCommV1)return;window.__estoreDailyCommV1=true;
const API="https://fndkjgveeojlywkdrtxe.supabase.co/functions/v1/estore-d1-daily";
const ID=x=>document.getElementById(x);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const money=n=>n==null?"—":Number(n).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const pct=n=>n==null?"—":(100*Number(n)).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})+"%";
const br=d=>String(d||"").split("-").reverse().join("/");
const R={data:null,loading:false};
function admin(){try{return typeof U!=="undefined"&&String(U?.u?.id||U?.u?.matricula||"")==="2457695"&&!ID("app")?.classList.contains("hide")}catch(_){return false}}
function status(t,error=false){const el=ID("dcStatus");if(el){el.textContent=t;el.style.color=error?"#9c3030":"#345c4d"}}
function weeklyRadar(p,d){
 const w=p.weekly_radar||p.weeklyRadar||d?.weekly_radar?.[p.store]||null;
 if(!w||w.risk!==true)return null;
 const gap=Number(w.gap_to_avoid_priority),ticket=Number(w.average_ticket);
 const days=Array.isArray(w.days)?w.days:[];
 if(!Number.isFinite(gap)||gap<0||!Number.isFinite(ticket)||ticket<=0||days.length!==3)return {incomplete:true};
 const val=x=>x===null||x===undefined||x===''?null:Number.isFinite(Number(x))?Number(x):null;
 return {
   risk:true,gap,ticket,partial:!!w.partial,paceGap:val(w.pace_gap),
   deviation_pp:val(w.partial_deviation_pp),projected_pp:val(w.deviation_pp),
   days:days.map((x,i)=>({
     label:x.label||['Sex','Sáb','Dom'][i],date:x.date||'',
     planned:val(x.programmed_goal),extra:val(x.additional_goal),
     final:val(x.adjusted_goal),orders:val(x.goal_orders),
     missing:x.source==='sem_meta_programada'||x.adjusted_goal===null
   }))
 };
}
function caption(p,data){
 const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'America/Fortaleza',hour:'2-digit',hourCycle:'h23'}).formatToParts(new Date()).map(x=>[x.type,x.value]));
 const hour=Number(parts.hour);
 const greeting=hour>=5&&hour<12?'Bom dia':hour>=12&&hour<18?'Boa tarde':'Boa noite';
 const name=String(p.name||'Supervisão').trim().split(/\s+/)[0];
 const weekday=new Intl.DateTimeFormat('en-US',{timeZone:'America/Fortaleza',weekday:'short'}).format(new Date());
 const radar=weekday==='Thu'?weeklyRadar(p,data):null;
 const hasWeeklyRisk=!!(radar&&!radar.incomplete);
 const zeroD1=p.category==='zero';
 // Uma zeragem confirmada no D-1 sempre tem prioridade sobre o alerta de share semanal.
 const direction=zeroD1
   ?'🚨 *Alerta D-1:* Sua operação encerrou ontem sem captação eStore. Hoje, a prioridade é reverter a zeragem e mobilizar o time.'
   :hasWeeklyRisk
   ?'📡 Sua operação apresenta retração no share nesta semana. Mobilize o time e siga o plano de recuperação do card.'
   :p.category==='excellent'
   ?'🏆 Parabéns pela entrega de ontem! Reconheça a equipe e mantenha o ritmo.'
   :'🤝 Obrigado pela contribuição de ontem! Vamos buscar uma entrega ainda melhor hoje.';
 const weeklyReminder=zeroD1&&hasWeeklyRisk
   ?'📡 Há também retração semanal. Confira no card o plano para recuperar o share.'
   :null;
 return [
   greeting+', *'+name+'*!',
   '',
   direction,
   ...(weeklyReminder?['',weeklyReminder]:[]),
   '',
   '🎯 Alinhe as metas com a equipe em *Metas > Distribuição diária por HC*.',
   '',
   'Conte comigo para apoiar! 💪',
   '🚀 *Vamos girar o ponteiro!*',
   '',
   '📲 Detalhes em *Minha Filial > Dia*:',
   'https://frannlima.github.io/app-estore-cepi/'
 ].join('\n');
}
function priority(p){return p.category==='zero'?0:p.category==='excellent'?2:1}
function priorityTitle(k){return ['🚨 PRIORIDADE MÁXIMA • LOJAS ZERADAS NO D-1','⚡ ALTO POTENCIAL • BAIXO DESEMPENHO NO D-1','🏆 RECONHECIMENTO • BOA PERFORMANCE'][k]}

function render(){
 const d=R.data;if(!d)return;
 const counts=d.counts||{},locked=!d.complete;
 const note=locked?"⚠️ D-1 "+br(d.reference_date)+" ainda não foi carregado completamente. Comunicação bloqueada para não usar dados antigos.":
  "Resultado oficial de "+br(d.reference_date)+" confirmado. Confira a lista e prepare os comunicados.";
 const riskStores=Array.isArray(d.weekly_risk_stores)?d.weekly_risk_stores:[];
 const riskMap=new Map(riskStores.map(x=>[String(x.store).padStart(3,'0'),x.radar]));
 const weeklyPanel=riskStores.length?
   '<section class="dcRiskPanel"><h3>🚨 RADAR DE POSSÍVEL PRIORIZAÇÃO • SEMANA EM CURSO</h3>'+
   '<p>Projeção parcial de quinta-feira, com base no histórico da semana anterior e nos resultados D-1. O domingo ainda pode depender de programação.</p>'+
   riskStores.map(x=>'<div class="dcRiskRow"><b>L'+esc(x.store)+'</b><span>Retração parcial: '+esc(Number(x.radar?.partial_deviation_pp||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}))+' p.p.</span><span>Desvio de ritmo: '+esc(money(x.radar?.pace_gap||0))+'</span><span>Reforço extra estimado: '+esc(money(x.radar?.gap_to_avoid_priority||0))+'</span></div>').join('')+
   '</section>':
   '<section class="dcRiskPanel dcRiskInfo"><b>📡 Radar semanal:</b> '+(new Date(d.goal_date+'T12:00:00Z').getUTCDay()===4?'Nenhuma loja em risco identificada nos dados disponíveis ou projeção ainda insuficiente.':'Ativado nas quintas-feiras, utilizando a parcial até quarta-feira.')+'</section>';
 const sorted=d.supervisors.map((p,i)=>({p,i})).sort((a,b)=>priority(a.p)-priority(b.p)||String(a.p.store).localeCompare(String(b.p.store)));
 const cards=sorted.map(({p,i},position)=>{
  const group=priority(p);
  const riskHere=riskMap.has(String(p.store).padStart(3,'0'));
  const groupCount=sorted.filter(x=>priority(x.p)===group).length;
  const groupHeader=position===0||priority(sorted[position-1].p)!==group?'<h3 class="dcPriority dcPriority'+group+'"><span>'+priorityTitle(group).split(' • ')[0]+'</span><small>'+groupCount+' '+(groupCount===1?'supervisor':'supervisores')+' · '+priorityTitle(group).split(' • ').slice(1).join(' • ')+'</small></h3>':'';
  const canPrepare=!locked&&p.ready&&p.active_store;
  const canSend=canPrepare&&!!p.phone;
  const sendHelp=locked?"Complete o D-1 antes de preparar qualquer comunicado":
    !p.active_store?"Filial fora do escopo ativo":
    !p.ready?"Aguardando D-1 e metas oficiais":!p.phone?"Contato ainda não validado para compartilhamento":"Compartilhamento manual; confirme o destinatário";
  const enrollment=p.matricula??p.registration??p.employee_id??p.employeeId??p.id??p.user_id??p.userId??"";
  const cleanMat=String(enrollment).trim();
  const role=String(p.role??p.cargo??p.position??"Supervisão").trim();
  const title=group===0?"Prioridade máxima":group===1?"Atenção":"Reconhecimento";
  return groupHeader+'<article class="dcPerson dcCategory'+group+'">'+
   '<div class="dcName"><div class="dcIdentity"><b class="dcPersonName">'+esc(p.name)+'</b>'+
   '<span class="dcPersonMeta">'+(cleanMat?'Mat. '+esc(cleanMat)+' · ':'')+esc(role)+'</span></div>'+
   '<b class="dcStoreBadge">L'+esc(p.store)+'</b></div>'+
   (p.ready?'<div class="dcKpis">'+
     '<div class="dcKpi dcKpiAlert"><span>Captado</span><strong>'+esc(money(p.captured))+'</strong></div>'+
     '<div class="dcKpi dcKpiAlert"><span>Share</span><strong>'+esc(pct(p.share))+'</strong></div>'+
     '<div class="dcKpi"><span>Meta hoje</span><strong>'+esc(money(p.goal))+'</strong></div>'+
     '<div class="dcKpi"><span>Pedidos</span><strong>'+esc(p.goal_orders)+'</strong></div>'+
   '</div>':'<p class="dcPending">Dados oficiais ainda não disponíveis.</p>')+
   (riskHere?'<span class="dcRiskChip">⚠ Risco semanal</span>':'')+
   '<div class="dcActions"><div class="dcSecondaryActions">'+
     '<button data-view="'+i+'" '+(!canPrepare?"disabled":"")+'>Legenda</button>'+
     '<button data-copy="'+i+'" '+(!canPrepare?"disabled":"")+'>Copiar</button>'+
     '<button data-card="'+i+'" '+(!canPrepare?"disabled":"")+'>Gerar card</button>'+
   '</div><button class="dcMain dcSend" data-send="'+i+'" '+(!canSend?'disabled title="'+esc(sendHelp)+'"':'title="Preparar card PNG e mensagem para compartilhar com este supervisor"')+'>Enviar no WhatsApp</button></div></article>';
 }).join("");
 ID("dcBody").innerHTML='<p class="dcNote">'+esc(note)+'</p>'+
  weeklyPanel+'<div class="dcCount"><span><b>'+counts.total+'</b> supervisores</span><span><b>'+counts.prepared+'</b> prontos com dados</span><span><b>'+counts.contact_verified+'</b> contatos liberados</span><span><b>'+counts.outside_active_scope+'</b> fora do escopo ativo</span></div>'+
  '<div class="dcBtns"><button id="dcRefresh">Atualizar dados</button><button id="dcCopyAll" '+(locked?"disabled":"")+'>Copiar todas as legendas</button></div>'+
  '<div class="dcList">'+cards+'</div>';
 ID("dcRefresh").addEventListener("click",load);
 ID("dcCopyAll").addEventListener("click",async()=>{
  const messages=d.supervisors.filter(p=>p.ready).map(p=>"L"+p.store+" | "+p.name+"\n"+caption(p,d));
  try{await navigator.clipboard.writeText(messages.join("\n\n---------\n\n"));status(messages.length+" legendas copiadas. Confira cada destinatário.");}
  catch(_){status("Não foi possível copiar.",true)}
 });
 ID("dcBody").querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>{
  const p=d.supervisors[Number(b.dataset.view)];
  ID("dcPreview").value=caption(p,d);ID("dcPreview").hidden=false;status("Legenda de "+p.name+" | L"+p.store);
 }));
 ID("dcBody").querySelectorAll("[data-copy]").forEach(b=>b.addEventListener("click",async()=>{
  const p=d.supervisors[Number(b.dataset.copy)];
  try{await navigator.clipboard.writeText(caption(p,d));status("Mensagem de "+p.name+" copiada.");}
  catch(_){status("Cópia indisponível.",true)}
 }));
 ID("dcBody").querySelectorAll("[data-card]").forEach(b=>b.addEventListener("click",()=>downloadCard(Number(b.dataset.card),b)));
 ID("dcBody").querySelectorAll("[data-send]").forEach(b=>b.addEventListener("click",()=>share(Number(b.dataset.send),b)));
}
function canPrepare(p,d){return !!(d?.complete&&p?.ready&&p?.active_store)}
async function prepareMyFilialCard(p,d,options={}){
 if(typeof shareStoreResultV40!=='function')throw Error('O painel Minha Filial ainda está carregando. Reabra o comunicado.');
 return shareStoreResultV40({
   store:p.store,period:'day',referenceDate:d.reference_date,
   expectedCaptured:p.captured,expectedOrders:p.orders,
   caption:caption(p,d),phone:p.phone,radarData:weeklyRadar(p,d),...options
 });
}
async function enrichedD1Card(result,p,d){
 const radar=weeklyRadar(p,d);
 if(!radar||radar.incomplete||!result?.file)return result;
 const bitmap=await createImageBitmap(result.file);
 const width=1080,scale=width/bitmap.width,topHeight=Math.ceil(bitmap.height*scale),bottomHeight=750;
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=topHeight+bottomHeight;
 const ctx=canvas.getContext('2d');if(!ctx)return result;
 ctx.fillStyle='#fff';ctx.fillRect(0,0,width,canvas.height);
 ctx.drawImage(bitmap,0,0,width,topHeight);bitmap.close?.();
 const y=topHeight;ctx.fillStyle='#173f35';ctx.fillRect(0,y,width,95);
 ctx.fillStyle='#fff';ctx.font='bold 39px Arial';ctx.fillText('🚨 RADAR PARCIAL DA SEMANA',45,y+59);
 ctx.fillStyle='#fff5f2';ctx.fillRect(0,y+95,width,655);
 ctx.fillStyle='#932a24';ctx.font='bold 29px Arial';ctx.fillText('Projeção de recuperação • não é fechamento oficial',45,y+148);
 ctx.font='bold 44px Arial';ctx.fillText('Gap adicional estimado: '+money(radar.gap),45,y+218);
 ctx.fillStyle='#173f35';ctx.font='25px Arial';ctx.fillText('Meta programada + oportunidade de recuperação = meta ajustada',45,y+267);
 radar.days.forEach((v,i)=>{
   const yy=y+310+i*102;
   ctx.fillStyle='#fff';ctx.fillRect(40,yy,width-80,90);
   ctx.strokeStyle='#cbded5';ctx.strokeRect(40,yy,width-80,90);
   ctx.fillStyle='#173f35';ctx.font='bold 31px Arial';ctx.fillText(v.label,60,yy+53);
   ctx.font='24px Arial';ctx.fillText(money(v.planned)+' + '+money(v.extra),175,yy+35);
   ctx.font='bold 27px Arial';ctx.fillText('= '+money(v.final)+' | '+v.orders+' pedidos',175,yy+70);
 });
 ctx.fillStyle='#173f35';ctx.font='bold 30px Arial';ctx.fillText('Seu time tem potencial para girar o ponteiro!',45,y+662);
 ctx.font='23px Arial';ctx.fillText('Mobilize, distribua as metas e transforme o desafio em entrega.',45,y+706);
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
 if(!blob)return result;
 return {...result,file:new File([blob],'eStore_D1_Radar_L'+p.store+'.png',{type:'image/png'})};
}
async function downloadCard(index,button){
 const d=R.data,p=d?.supervisors?.[index];
 if(!canPrepare(p,d)){status('Complete o D-1 oficial antes de gerar o card.',true);return;}
 const old=button.textContent;button.disabled=true;button.textContent='Preparando card...';
 try{
  const result=await prepareMyFilialCard(p,d,{downloadOnly:true});
  if(result?.mode==='saved')status('Card original Minha Filial → Dia salvo para L'+p.store+'. Nenhuma mensagem foi enviada.');
  else status('Não foi possível salvar o card; atualize os dados e tente novamente.',true);
 }catch(e){status(String(e?.message||'Falha ao gerar card.'),true)}
 finally{button.disabled=false;button.textContent=old}
}
function showPreparedShare(result,person){
 const previous=ID('dcShareOverlay');
 if(previous)previous.remove();
 if(!ID('dcShareStyle')){
   const style=document.createElement('style');style.id='dcShareStyle';
   style.textContent=[
     '#dcShareOverlay{position:fixed;inset:0;z-index:2147481800;background:#0a241edb;display:flex;justify-content:center;align-items:center;padding:12px;box-sizing:border-box}',
     '#dcShareDialog{background:#faf8f3;color:#173f35;border-radius:16px;width:min(640px,100%);max-height:94dvh;overflow:auto;padding:17px;font:14px/1.45 Arial,sans-serif;box-sizing:border-box;box-shadow:0 15px 50px #0006}',
     '#dcShareDialog h3{margin:0 0 8px;font-size:18px}#dcShareDialog p{margin:7px 0 12px}',
     '#dcShareDialog img{width:min(100%,330px);max-height:36dvh;object-fit:contain;background:#fff;border:1px solid #d3ddd4;border-radius:9px;display:block;margin:8px auto}',
     '#dcShareDialog .dcShareSteps{background:#ebeee7;border-radius:10px;padding:10px 14px;margin:12px 0}',
     '#dcShareDialog .dcShareActions{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}',
     '#dcShareDialog button{cursor:pointer;padding:10px 13px;border-radius:8px;border:1px solid #9fb7a6;background:#fff;color:#173f35;font-weight:700}',
     '#dcShareDialog button.dcSharePrimary{background:#173f35;color:#fff}',
     '#dcShareDialog .dcShareStatus{min-height:20px;font-size:12px;color:#285a45}#dcShareDialog small{display:block;color:#61786d}'
   ].join('');
   document.head.append(style);
 }
 const url=URL.createObjectURL(result.file);
 const overlay=document.createElement('div');
 overlay.id='dcShareOverlay';
 overlay.innerHTML='<section id="dcShareDialog" role="dialog" aria-modal="true" aria-label="Compartilhar card D-1 pelo WhatsApp">'+
 '<h3>Card + legenda prontos para o WhatsApp</h3>'+
 '<p id="dcShareRecipient"></p>'+
 '<img id="dcShareImage" alt="Prévia do card oficial da filial no período D-1">'+
 '<div class="dcShareSteps"><b>Para enviar o card junto com a legenda no computador:</b>'+
 '<ol><li>Baixe o PNG.</li><li>Abra o WhatsApp Business e confira o supervisor correto.</li>'+
 '<li>Use o clipe para anexar a imagem; cole a legenda na descrição da foto.</li>'+
 '<li>Confira imagem e legenda e confirme Enviar.</li></ol></div>'+
 '<div class="dcShareActions">'+
 '<button type="button" id="dcShareDownload">1. Baixar card PNG</button>'+
 '<button type="button" id="dcShareCopy">2. Copiar legenda</button>'+
 '<button type="button" class="dcSharePrimary" id="dcShareOpen">3. Abrir WhatsApp</button>'+
 '<button type="button" id="dcShareClose">Fechar</button></div>'+
 '<small>O link do WhatsApp preenche apenas texto. Nesta etapa, o PNG é anexado manualmente; nenhum envio é automático.</small>'+
 '<p class="dcShareStatus" id="dcShareInfo" role="status" aria-live="polite"></p></section>';
 document.body.append(overlay);
 ID('dcShareRecipient').textContent='Destinatário: '+person.name+' | Filial L'+person.store;
 ID('dcShareImage').src=url;
 const info=msg=>{const v=ID('dcShareInfo');if(v)v.textContent=msg};
 const close=()=>{
   document.removeEventListener('keydown',onKey);
   URL.revokeObjectURL(url);
   overlay.remove();
 };
 const onKey=e=>{if(e.key==='Escape')close()};
 document.addEventListener('keydown',onKey);
 overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
 ID('dcShareClose').addEventListener('click',close);
 ID('dcShareDownload').addEventListener('click',()=>{
   const a=document.createElement('a');a.href=url;a.download=result.file.name;
   document.body.append(a);a.click();a.remove();
   info('Card salvo. Agora copie a legenda e anexe o PNG na conversa antes de enviar.');
 });
 ID('dcShareCopy').addEventListener('click',async()=>{
   try{await navigator.clipboard.writeText(result.caption);info('Legenda copiada. Cole no campo de descrição da imagem no WhatsApp.')}
   catch(_){info('Cópia automática indisponível. Use o botão Ver legenda no comunicado.')}
 });
 ID('dcShareOpen').addEventListener('click',()=>{
   // Abrir a conversa sem texto evita disparar mensagem sem imagem por engano.
   const a=document.createElement('a');a.href=result.waUrl;
   a.target='_blank';a.rel='noopener noreferrer';
   document.body.append(a);a.click();a.remove();
   info('Anexe o PNG e cole a legenda na foto. Somente depois confirme Enviar.');
 });
 ID('dcShareDownload').focus();
}
async function share(index,button){
 const d=R.data,p=d?.supervisors?.[index];
 if(!canPrepare(p,d)){status('D-1 e metas oficiais precisam estar completos antes do compartilhamento.',true);return;}
 const old=button.textContent;
 button.disabled=true;button.textContent='Preparando resultado...';
 try{
  const result=await prepareMyFilialCard(p,d);
  if(result?.mode==='native'){
   status('Compartilhamento aberto: confira se o WhatsApp Business mostra o card e a legenda antes de enviar.');
  }else if(result?.mode==='cancelled'){
   status('Compartilhamento cancelado. Nenhuma mensagem enviada.');
  }else if(result?.mode==='manual'){
   showPreparedShare(result,p);
   status('Card oficial e legenda prontos. Siga as etapas na janela para anexar os dois no WhatsApp.');
  }else{
   status('Não foi possível preparar o compartilhamento completo.',true);
  }
 }catch(e){status(String(e?.message||'Falha ao compartilhar card da filial.'),true)}
 finally{button.disabled=false;button.textContent=old;}
}

async function load(){
 if(R.loading)return;
 R.loading=true;ID("dcBody").textContent="Consultando D-1, metas e supervisores...";
 const password=prompt("Senha administrativa para consultar a comunicação D-1:");
 if(!password){ID("dcBody").textContent="Consulta cancelada.";R.loading=false;return}
 try{
  const r=await fetch(API,{method:"POST",headers:{"content-type":"application/json"},cache:"no-store",
   body:JSON.stringify({action:"preview",matricula:String(U.u.id),password})});
  const j=await r.json().catch(()=>({error:"Resposta inválida."}));
  if(!r.ok||!j.ok)throw Error(j.error||"Falha de consulta");
  R.data=j;render();status("Fila preparada; nenhum envio automático foi realizado.");
 }catch(e){ID("dcBody").textContent="Não foi possível obter o D-1.";status(e.message||"Falha de consulta.",true)}
 finally{R.loading=false}
}
function makeUI(){
 if(ID("dcLaunch"))return;
 const style=document.createElement("style");
 style.textContent=[
 "#dcLaunch{position:static!important;inset:auto!important;z-index:auto!important;flex:0 0 43px;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:0;width:43px;height:43px;min-width:43px;margin:0;padding:3px 0;color:#775117;background:#fff6e6;border:1px solid #e4c693;border-radius:12px;font:800 10px/1.1 Arial,sans-serif;box-shadow:none;cursor:pointer;touch-action:manipulation}",
 "#dcLaunch svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}#dcLaunch small{font-size:9px;letter-spacing:.1px;color:#725019}#dcLaunch[hidden]{display:none!important}",
 "#ecHeaderActions{display:flex;align-items:center;justify-content:flex-end;gap:5px;flex-shrink:0;margin-left:auto;min-width:0}",
 "#dcLaunch:focus-visible{outline:3px solid #de7c00;outline-offset:2px}",
 "#dcOverlay[hidden]{display:none}#dcOverlay{position:fixed;inset:0;z-index:2147481000;background:#081b17d9;display:grid;place-items:center;padding:10px;box-sizing:border-box}",
 "#dcModal{background:#faf8f3;color:#173f35;width:min(760px,100%);max-height:94dvh;overflow:auto;border-radius:17px;padding:18px;font:14px/1.5 Arial,sans-serif;box-sizing:border-box}",
 "#dcModal *{box-sizing:border-box}.dcTop,.dcName{display:flex;justify-content:space-between;gap:12px}.dcTop h2{margin:0;font-size:19px}.dcTop small{display:block;color:#587267}",
 "#dcModal button{cursor:pointer;background:#fff;border:1px solid #b6c9be;border-radius:8px;padding:9px;font-weight:700;color:#173f35}#dcModal button:disabled{opacity:.4;cursor:not-allowed}",
 "#dcModal button.dcMain{background:#173f35;color:#fff}.dcCount{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:12px 0}.dcCount span{background:#e8eee8;padding:10px;border-radius:9px;font-size:12px}.dcCount b{display:block;font-size:19px}",
 ".dcNote{background:#f3ecd9;padding:12px;border-left:4px solid #de7c00}.dcBtns{display:flex;gap:8px;flex-wrap:wrap}.dcList{display:grid;gap:10px;margin:13px 0}.dcPerson{background:white;border:1px solid #d6e1d6;border-radius:11px;padding:12px}.dcPerson small{display:block;color:#667569;margin:7px 0}.dcPerson p{font-size:12px}",
 " .dcPriority{margin:12px 0 0;padding:12px;border-radius:10px;font-size:13px}.dcPriority0{background:#ffe5e5;color:#9b1919}.dcPriority1{background:#fff0d5;color:#9b5300}.dcPriority2{background:#ddf8e8;color:#12653a}.dcStoreBadge{padding:4px 8px;border-radius:7px;background:#edf0ee}.dcBlink{background:#ca1c26;color:#fff;animation:dcPulse 1.1s infinite alternate}@keyframes dcPulse{to{box-shadow:0 0 14px #f22929;opacity:.7}}@media(prefers-reduced-motion:reduce){.dcBlink{animation:none}}",
 "#dcModal .dcRiskPanel{background:#fff1ef;border:1px solid #edaaa2;border-radius:11px;padding:12px;margin:12px 0;color:#77322b}#dcModal .dcRiskPanel h3{font-size:14px;margin:0 0 8px}#dcModal .dcRiskPanel p{font-size:12px;margin:0 0 8px}#dcModal .dcRiskRow{padding:7px 4px;border-top:1px solid #eed1ce;display:flex;flex-wrap:wrap;gap:7px 14px;font-size:12px}#dcModal .dcRiskRow b{font-size:14px;color:#a21c16}#dcModal .dcRiskInfo{background:#f5f2e8;border-color:#ded7ca;color:#365e4f}",
 "#dcStatus{font-size:12px;margin-top:10px}#dcPreview{width:100%;height:200px;font:13px/1.5 Arial;padding:10px;border:1px solid #b6c9be;border-radius:8px;white-space:pre-wrap}#dcPreview[hidden]{display:none}",
 "@media(max-width:500px){#dcModal{padding:13px}.dcBtns button{flex:1;font-size:11px}}",
 "/* Layout executivo compacto dos comunicados D-1 — mobile first */",
 "#dcModal{width:min(860px,100%);padding:clamp(12px,3vw,20px)}#dcModal .dcTop{align-items:flex-start}#dcModal .dcTop h2{font-size:18px}",
 "#dcModal .dcList{gap:12px}#dcModal .dcPriority{display:flex;flex-direction:column;gap:4px;padding:13px 15px;margin:18px 0 2px;border-radius:12px;font-size:14px;line-height:1.25}#dcModal .dcPriority small{font-size:11px;font-weight:500;opacity:.85}",
 "#dcModal .dcPerson{border:1px solid #d9e1dc;border-left:5px solid #d1d8d4;border-radius:16px;padding:14px;box-shadow:0 2px 12px #173f350c;min-width:0}",
 "#dcModal .dcCategory0{border-left-color:#e45059}#dcModal .dcCategory1{border-left-color:#e4a632}#dcModal .dcCategory2{border-left-color:#279c69}",
 "#dcModal .dcName{display:flex;align-items:flex-start;gap:8px}#dcModal .dcIdentity{min-width:0;flex:1;display:flex;flex-direction:column;gap:4px}",
 "#dcModal .dcPersonName{color:#173f35;font-size:clamp(13px,3.8vw,17px);line-height:1.27;overflow-wrap:anywhere}",
 "#dcModal .dcPersonMeta{color:#66746c;font-size:12px;line-height:1.35;overflow-wrap:anywhere}",
 "#dcModal .dcStoreBadge{background:#e9eeeb;color:#173f35;border-radius:9px;padding:7px 9px;flex-shrink:0;font-size:12px;box-shadow:none;animation:none!important}",
 "#dcModal .dcCategory0 .dcStoreBadge{background:#ffe1e1;color:#a41d28}#dcModal .dcCategory1 .dcStoreBadge{background:#fff0d5;color:#86540a}#dcModal .dcCategory2 .dcStoreBadge{background:#ddf6e8;color:#12653a}",
 "#dcModal .dcKpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;margin:14px 0 12px}",
 "#dcModal .dcKpi{display:flex;flex-direction:column;justify-content:center;gap:5px;min-width:0;padding:11px 8px;border-radius:11px;background:#f1f4f2;color:#173f35}",
 "#dcModal .dcKpi span{font-size:11px;line-height:1.2;color:#637169}#dcModal .dcKpi strong{font-size:clamp(12px,3.3vw,17px);line-height:1.3;overflow-wrap:anywhere}",
 "#dcModal .dcCategory0 .dcKpiAlert{background:#fff0f0}#dcModal .dcCategory0 .dcKpiAlert strong{color:#a21c26}",
 "#dcModal .dcRiskChip{display:inline-flex;background:#fff0dd;color:#8c5100;font-size:11px;font-weight:700;padding:5px 9px;border-radius:8px;margin-bottom:10px}",
 "#dcModal .dcActions{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);gap:8px;align-items:stretch}",
 "#dcModal .dcSecondaryActions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;min-width:0}",
 "#dcModal .dcSecondaryActions button{font-size:11px;padding:10px 5px;min-width:0;white-space:normal;line-height:1.3;border:1px solid #d4dcd7;background:#f7f9f7}",
 "#dcModal .dcActions .dcSend{font-size:12px;min-height:44px;padding:10px 8px;line-height:1.25;background:#173f35;color:#fff;border:1px solid #173f35}",
 "#dcModal .dcPending{margin:12px 0;font-size:12px;color:#8d5d26}",
 "@media(max-width:600px){#dcModal .dcActions{grid-template-columns:1fr}#dcModal .dcSecondaryActions button{min-height:40px}#dcModal .dcActions .dcSend{min-height:44px}#dcModal .dcKpis{grid-template-columns:repeat(2,minmax(0,1fr))}#dcModal .dcKpi{padding:10px}#dcModal .dcKpi strong{font-size:15px}#dcModal .dcPerson{padding:12px}#dcModal .dcCount{gap:5px}}",
 "@media(max-width:350px){#dcModal .dcKpi strong{font-size:13px}#dcModal .dcPersonName{font-size:13px}}",
 "@media(prefers-reduced-motion:reduce){#dcModal *{animation:none!important}}"
 ].join("");
 document.head.appendChild(style);
 const launch=document.createElement("button");launch.id="dcLaunch";launch.type="button";
 launch.setAttribute("aria-label","Abrir Comunicados D-1 para supervisores");
 launch.title="Comunicados D-1";
 launch.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg><small>D-1</small>';
 launch.addEventListener("click",()=>window.estoreOpenD1());
 launch.hidden=true;document.body.append(launch);
 const overlay=document.createElement("div");overlay.id="dcOverlay";overlay.hidden=true;
 overlay.innerHTML='<section id="dcModal" role="dialog" aria-modal="true" aria-label="Comunicados D-1">'+
 '<div class="dcTop"><div><h2>📣 Comunicado D-1 | Supervisores</h2><small>Fila por filial. Confira os destinatários e confirme o envio no WhatsApp.</small></div><button id="dcClose" aria-label="Fechar">×</button></div>'+
 '<div id="dcBody"></div><textarea id="dcPreview" readonly hidden></textarea><div id="dcStatus" role="status" aria-live="polite"></div></section>';
 document.body.append(overlay);ID("dcClose").addEventListener("click",()=>overlay.hidden=true);
 overlay.addEventListener("click",e=>{if(e.target===overlay)overlay.hidden=true});
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!overlay.hidden)overlay.hidden=true});
}
window.estoreOpenD1=function(){
 if(!admin()){alert("Comunicados D-1 disponíveis apenas para o administrador.");return;}
 if(!ID("dcLaunch"))makeUI();
 const overlay=ID("dcOverlay");
 if(!overlay){alert("Não foi possível abrir Comunicados D-1.");return;}
 overlay.hidden=false;
 if(R.data)render();else load();
};
function sync(){
 const can=admin();
 if(can&&!ID("dcLaunch"))makeUI();
 const el=ID("dcLaunch");
 if(el){
   const header=document.querySelector("#shell > header.top");
   if(header){
     let bar=header.querySelector("#ecHeaderActions");
     if(!bar){
       bar=document.createElement("div");
       bar.id="ecHeaderActions";
       bar.setAttribute("role","group");
       bar.setAttribute("aria-label","Atalhos de ajuda e comunicados");
       header.appendChild(bar);
     }
     if(el.parentElement!==bar)bar.insertBefore(el,bar.firstChild);
     el.hidden=!can;
   }else{
     el.hidden=true;
   }
 }
 if(!can&&ID("dcOverlay"))ID("dcOverlay").hidden=true;
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",sync,{once:true});else sync();
setInterval(sync,2000);
})();
