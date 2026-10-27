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
function admin(){try{return typeof U!=="undefined"&&U?.u?.id==="2457695"&&!!U?.admin&&!ID("app")?.classList.contains("hide")}catch(_){return false}}
function status(t,error=false){const el=ID("dcStatus");if(el){el.textContent=t;el.style.color=error?"#9c3030":"#345c4d"}}
function caption(p,data){
 const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'America/Fortaleza',hour:'2-digit',hourCycle:'h23'}).formatToParts(new Date()).map(x=>[x.type,x.value]));
 const hour=Number(parts.hour);
 const greeting=hour>=5&&hour<12?'Bom dia':hour>=12&&hour<18?'Boa tarde':'Boa noite';
 const name=String(p.name||'Supervisão').trim().split(/\s+/)[0];
 const intro=greeting+', *'+name+'*! Espero que esteja bem! 👋';
 const tone=p.category==='zero'
   ?'🚨 *Radar de atenção:* ontem a filial encerrou sem venda eStore registrada. Hoje podemos mudar esse resultado!'
   :p.category==='excellent'
   ?'👏 *Parabéns pela entrega de ontem!* A filial L'+p.store+' alcançou *'+pct(p.share)+' de share*. Vamos manter esse ritmo!'
   :'🤝 *Obrigado pela contribuição de ontem!* Cada venda faz diferença. Vamos avançar hoje!';
 return [
   intro,'',tone,'',
   '🎯 *Desafio de hoje:*',
   '💰 Meta: *'+money(p.goal)+'*',
   '🛍️ Pedidos: *'+p.goal_orders+'*','',
   '👥 Distribua a meta com o time: *Metas → Distribuição diária por HC*.','',
   '📊 Mais detalhes do D-1: *Minha Filial → Dia*.',
   '🔗 https://frannlima.github.io/app-estore-cepi/','',
   'Conte comigo para apoiar! 🚀'
 ].join('\n');
}


function render(){
 const d=R.data;if(!d)return;
 const counts=d.counts||{},locked=!d.complete;
 const note=locked?"⚠️ D-1 "+br(d.reference_date)+" ainda não foi carregado completamente. Comunicação bloqueada para não usar dados antigos.":
  "Resultado oficial de "+br(d.reference_date)+" confirmado. Confira a lista e prepare os comunicados.";
 const cards=d.supervisors.map((p,i)=>{
  const reason=!p.active_store?"Loja fora da base ativa de resultados":
    locked?"D-1 oficial ainda incompleto — envio bloqueado":
    !p.ready?"Sem D-1 oficial ou meta do dia":
    !p.phone?"Sem telefone vinculado: selecione o supervisor manualmente no WhatsApp Business":"Contato validado • envio sujeito à sua confirmação";
  const kind=p.category==="zero"?"🚨 Radar":p.category==="excellent"?"🏆 Acima de 0,30%":p.category==="contribution"?"🤝 Contribuição":"Aguardando D-1";
  const canPrepare=!locked&&p.ready&&p.active_store;
  const canSend=canPrepare;
  const sendHelp=locked?"Complete o D-1 antes de preparar qualquer comunicado":
    !p.active_store?"Filial fora do escopo ativo":
    !p.ready?"Aguardando D-1 e metas oficiais":"Compartilhamento manual; confirme o destinatário";
  return '<article class="dcPerson"><div class="dcName"><b>'+esc(p.name)+'</b><b>L'+esc(p.store)+'</b></div>'+
   '<small>'+esc(kind)+' • '+esc(reason)+'</small>'+
   (p.ready?'<p>Captado: '+esc(money(p.captured))+' • Share: '+esc(pct(p.share))+' • Meta vendas hoje: '+esc(money(p.goal))+' • Meta pedidos hoje: '+esc(p.goal_orders)+'</p>':'')+
   '<div class="dcBtns"><button data-view="'+i+'" '+(!canPrepare?"disabled":"")+'>Ver legenda</button>'+
   '<button data-copy="'+i+'" '+(!canPrepare?"disabled":"")+'>Copiar mensagem</button>'+
   '<button data-card="'+i+'" '+(!canPrepare?"disabled":"")+'>Gerar card</button>'+
   '<button class="dcMain dcSend" data-send="'+i+'" '+(!canSend?'disabled title="'+esc(sendHelp)+'"':'title="Preparar card PNG e mensagem para compartilhar com este supervisor"')+'>📲 Enviar card WhatsApp</button></div></article>';
 }).join("");
 ID("dcBody").innerHTML='<p class="dcNote">'+esc(note)+'</p>'+
  '<div class="dcCount"><span><b>'+counts.total+'</b> supervisores</span><span><b>'+counts.prepared+'</b> prontos com dados</span><span><b>'+counts.contact_verified+'</b> contatos liberados</span><span><b>'+counts.outside_active_scope+'</b> fora do escopo ativo</span></div>'+
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
   caption:caption(p,d),phone:p.phone,...options
 });
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
async function share(index,button){
 const d=R.data,p=d?.supervisors?.[index];
 if(!canPrepare(p,d)){status('D-1 e metas oficiais precisam estar completos antes do compartilhamento.',true);return;}
 const mobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent||'');
 // Reservar aba no gesto do clique antes de consultar resultado e ranking oficiais.
 let chat=null;
 if(!mobile){try{chat=window.open('about:blank','_blank')}catch(_){}}
 const old=button.textContent;button.disabled=true;button.textContent='Preparando resultado...';
 try{
  const result=await prepareMyFilialCard(p,d,{chatWindow:chat});
  if(result?.mode==='native'){
   if(chat&&!chat.closed)chat.close();
   status('Card oficial Minha Filial e legenda preparados. Escolha o WhatsApp Business, confirme o supervisor e envie.');
  }else if(result?.mode==='cancelled'){
   if(chat&&!chat.closed)chat.close();
   status('Compartilhamento cancelado. Nenhuma mensagem enviada.');
  }else if(result?.mode==='manual'){
   if(result.opened){
    status('WhatsApp aberto com a legenda. Anexe o PNG do Resumo da Filial, confira '+p.name+' e confirme o envio.');
   }else{
    if(chat&&!chat.closed)chat.close();
    status('PNG salvo. Use o link a seguir para abrir o WhatsApp; anexe a imagem e confirme o destinatário.');
    const a=document.createElement('a');a.href=result.waUrl;a.target='_blank';a.rel='noopener noreferrer';
    a.textContent='Abrir WhatsApp de '+p.name+' ↗';
    ID('dcStatus')?.append(document.createTextNode(' '),a);
   }
  }else{
   if(chat&&!chat.closed)chat.close();
   status('Não foi possível concluir o compartilhamento. Nenhuma mensagem enviada.',true);
  }
 }catch(e){
  if(chat&&!chat.closed)chat.close();
  status(String(e?.message||'Falha ao compartilhar card da filial.'),true);
 }finally{button.disabled=false;button.textContent=old;}
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
 "#dcLaunch{position:fixed;bottom:calc(93px + env(safe-area-inset-bottom,0px));left:12px;z-index:2147480050;background:#173f35;color:white;border:2px solid #deae62;border-radius:30px;padding:12px 14px;font:700 13px Arial;box-shadow:0 6px 18px #0004;cursor:pointer}",
 "#dcOverlay[hidden]{display:none}#dcOverlay{position:fixed;inset:0;z-index:2147481000;background:#081b17d9;display:grid;place-items:center;padding:10px;box-sizing:border-box}",
 "#dcModal{background:#faf8f3;color:#173f35;width:min(760px,100%);max-height:94dvh;overflow:auto;border-radius:17px;padding:18px;font:14px/1.5 Arial,sans-serif;box-sizing:border-box}",
 "#dcModal *{box-sizing:border-box}.dcTop,.dcName{display:flex;justify-content:space-between;gap:12px}.dcTop h2{margin:0;font-size:19px}.dcTop small{display:block;color:#587267}",
 "#dcModal button{cursor:pointer;background:#fff;border:1px solid #b6c9be;border-radius:8px;padding:9px;font-weight:700;color:#173f35}#dcModal button:disabled{opacity:.4;cursor:not-allowed}",
 "#dcModal button.dcMain{background:#173f35;color:#fff}.dcCount{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:12px 0}.dcCount span{background:#e8eee8;padding:10px;border-radius:9px;font-size:12px}.dcCount b{display:block;font-size:19px}",
 ".dcNote{background:#f3ecd9;padding:12px;border-left:4px solid #de7c00}.dcBtns{display:flex;gap:8px;flex-wrap:wrap}.dcList{display:grid;gap:10px;margin:13px 0}.dcPerson{background:white;border:1px solid #d6e1d6;border-radius:11px;padding:12px}.dcPerson small{display:block;color:#667569;margin:7px 0}.dcPerson p{font-size:12px}",
 "#dcStatus{font-size:12px;margin-top:10px}#dcPreview{width:100%;height:200px;font:13px/1.5 Arial;padding:10px;border:1px solid #b6c9be;border-radius:8px;white-space:pre-wrap}#dcPreview[hidden]{display:none}",
 "@media(max-width:500px){#dcModal{padding:13px}.dcBtns button{flex:1;font-size:11px}}"
 ].join("");
 document.head.appendChild(style);
 const launch=document.createElement("button");launch.id="dcLaunch";launch.type="button";launch.textContent="📣 Comunicados D-1";
 launch.addEventListener("click",()=>{ID("dcOverlay").hidden=false;if(R.data)render();else load()});document.body.append(launch);
 const overlay=document.createElement("div");overlay.id="dcOverlay";overlay.hidden=true;
 overlay.innerHTML='<section id="dcModal" role="dialog" aria-modal="true" aria-label="Comunicados D-1">'+
 '<div class="dcTop"><div><h2>📣 Comunicado D-1 | Supervisores</h2><small>Fila por filial. Confira os destinatários e confirme o envio no WhatsApp.</small></div><button id="dcClose" aria-label="Fechar">×</button></div>'+
 '<div id="dcBody"></div><textarea id="dcPreview" readonly hidden></textarea><div id="dcStatus" role="status" aria-live="polite"></div></section>';
 document.body.append(overlay);ID("dcClose").addEventListener("click",()=>overlay.hidden=true);
 overlay.addEventListener("click",e=>{if(e.target===overlay)overlay.hidden=true});
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!overlay.hidden)overlay.hidden=true});
}
function sync(){const can=admin(),el=ID("dcLaunch");if(can&&!el)makeUI();else if(el)el.hidden=!can;
 if(!can&&ID("dcOverlay"))ID("dcOverlay").hidden=true;}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",sync,{once:true});else sync();
setInterval(sync,2000);
})();
