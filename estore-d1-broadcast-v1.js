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
 const intro="Bom dia, *"+String(p.name||"Supervisão").trim().split(/\s+/)[0]+"*! Espero que esteja bem.";
 const stats="📊 *eStore D-1 | L"+p.store+" • "+br(data.reference_date)+"*\n💰 Venda captada: *"+money(p.captured)+"*\n🛍️ Pedidos: *"+p.orders+"*\n📈 Share: *"+pct(p.share)+"*";
 const tone=p.category==="zero"?"🚨 *RADAR DE ATENÇÃO* — Ontem encerramos sem venda eStore registrada na filial. Hoje temos uma nova oportunidade de fazer uma entrega diferente. Conte com meu apoio!":
 p.category==="excellent"?"👏 *Parabéns pela entrega!* A filial alcançou share acima de 0,30%. Excelente contribuição! Vamos sustentar esse ritmo e inspirar o time.":
 "🤝 Obrigado pela contribuição de ontem! Cada venda fortalece CEPI e o resultado da empresa. Vamos continuar colocando em prática que *Talento é Conquista*.";
 return [intro,"",stats,"",tone,"","🎯 *Metas eStore da filial hoje • "+br(data.goal_date)+"*","💰 *Meta de vendas:* "+money(p.goal),"🛍️ *Meta de pedidos:* "+p.goal_orders+" pedidos","",
 "👥 Faça o rateio conforme a equipe disponível: *App → Metas → Distribuição diária por HC → Salvar*.","🔗 "+p.rateio_url,"",
 "📍 Mais detalhes: *Minha Filial*","🔗 "+p.detail_url,"",
 "Fico à disposição para apoiar, caso precise. Vamos girar o ponteiro! 🚀"].join("\n");
}
function createCard(p,d){
 const c=document.createElement("canvas");c.width=1080;c.height=1110;
 const g=c.getContext("2d");if(!g)throw Error("Falha na geração do card.");
 const dark="#173F35",cream="#F8F6F0",orange="#DE7C00";
 function bg(x,y,w,h,color){g.fillStyle=color;g.fillRect(x,y,w,h)}
 function line(s,x,y,size,color=dark,bold=false,maxWidth){
  g.font=(bold?"700 ":"500 ")+size+"px Larsseit,Arial,sans-serif";g.fillStyle=color;
  g.fillText(s,x,y,maxWidth);
 }
 bg(0,0,1080,1110,cream);bg(0,0,1080,217,dark);bg(0,0,280,9,orange);
 line("APP eSTORE | CE+PI",48,59,29,"#E8BD79",true);
 line("MINHA FILIAL | D-1",48,125,53,"white",true);
 line("L"+p.store+" • "+br(d.reference_date),48,188,33,"white",true);
 function cell(x,y,title,value){
  bg(x,y,474,166,"white");
  line(title,x+20,y+45,26,"#617269",true,430);
  line(String(value),x+20,y+110,40,dark,true,430);
 }
 cell(46,255,"VENDA CAPTADA D-1",money(p.captured));
 cell(557,255,"SHARE D-1",pct(p.share));
 cell(46,447,"PEDIDOS D-1",p.orders);
 cell(557,447,"META DE VENDAS HOJE",money(p.goal));
 bg(46,643,988,154,"#E5EEE8");
 line("META DE PEDIDOS HOJE • "+br(d.goal_date),66,695,29,dark,true,925);
 line(String(p.goal_orders)+" PEDIDOS",66,763,49,dark,true,910);
 const zero=p.category==="zero";
 bg(46,822,988,121,zero?"#FEE5E1":"#E4F0E8");
 line(zero?"RADAR DE ATENÇÃO":p.category==="excellent"?"PARABÉNS PELA ENTREGA!":"SUA CONTRIBUIÇÃO CONTA",64,891,38,zero?"#A52A2A":dark,true,920);
 bg(0,977,1080,133,dark);
 line("RATEIE A META DE HOJE COM SUA EQUIPE",46,1030,31,"#E8BD79",true,965);
 line("App eStore CEPI → Metas → Distribuição diária por HC",46,1080,27,"white",false,990);
 return window.RiachueloBrandCards?.decorateCanvas?.(c)||c;
}
function fileCard(p,d){return new Promise((resolve,reject)=>{
 const canvas=createCard(p,d);
 canvas.toBlob(b=>b?resolve(new File([b],"eStore-D1-L"+p.store+".png",{type:"image/png"})):reject(Error("PNG indisponível")),"image/png");
})}
function render(){
 const d=R.data;if(!d)return;
 const counts=d.counts||{},locked=!d.complete;
 const note=locked?"⚠️ D-1 "+br(d.reference_date)+" ainda não foi carregado completamente. Comunicação bloqueada para não usar dados antigos.":
  "Resultado oficial de "+br(d.reference_date)+" confirmado. Confira a lista e prepare os comunicados.";
 const cards=d.supervisors.map((p,i)=>{
  const reason=!p.active_store?"Loja fora da base ativa de resultados":
    locked?"D-1 oficial ainda incompleto — envio bloqueado":
    !p.ready?"Sem D-1 oficial ou meta do dia":
    !p.phone?"Telefone do supervisor não validado: é possível gerar o card":"Contato habilitado • compartilhamento sujeito à confirmação";
  const kind=p.category==="zero"?"🚨 Radar":p.category==="excellent"?"🏆 Acima de 0,30%":p.category==="contribution"?"🤝 Contribuição":"Aguardando D-1";
  const canPrepare=!locked&&p.ready&&p.active_store;
  const canSend=canPrepare&&!!p.phone;
  const sendHelp=locked?"Complete o D-1 antes de preparar qualquer comunicado":
    !p.active_store?"Filial fora do escopo ativo":
    !p.ready?"Aguardando D-1 e metas oficiais":"Telefone do supervisor não validado";
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
function downloadFile(file){
 const url=URL.createObjectURL(file),a=document.createElement("a");
 a.href=url;a.download=file.name;document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),60000);
}
function canPrepare(p,d){return !!(d?.complete&&p?.ready&&p?.active_store)}
async function downloadCard(index,button){
 const d=R.data,p=d?.supervisors?.[index];
 if(!canPrepare(p,d)){status("D-1 e metas oficiais precisam estar completos para gerar o card.",true);return;}
 const previous=button.textContent;button.disabled=true;button.textContent="Gerando card...";
 try{
  const file=await fileCard(p,d);
  downloadFile(file);
  status("Card D-1 da filial L"+p.store+" salvo. O arquivo não foi enviado.");
 }catch(e){status(String(e?.message||"Falha ao gerar card."),true)}
 finally{button.disabled=false;button.textContent=previous;}
}
async function share(index,button){
 const d=R.data,p=d?.supervisors?.[index];
 if(!canPrepare(p,d)){status("D-1 e metas oficiais precisam estar completos antes do envio.",true);return;}
 if(!p.phone){status("Confirme o número do WhatsApp Business do supervisor antes de compartilhar.",true);return;}
 const digits=String(p.phone).replace(/\D/g,"");
 if(!/^55[1-9]\d9\d{8}$/.test(digits)){status("Telefone do supervisor inválido ou sem DDD: envio bloqueado.",true);return;}
 const mobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent||"");
 const message=caption(p,d);
 const waUrl="https://wa.me/"+digits+"?text="+encodeURIComponent(message);
 // Reservar a aba enquanto ainda estamos no gesto do usuário (desktop).
 let chat=null;
 if(!mobile){
  try{chat=window.open("about:blank","_blank");}catch(_){}
 }
 const previous=button.textContent;button.disabled=true;button.textContent="Preparando...";
 try{
  const file=await fileCard(p,d);
  if(mobile&&typeof navigator.share==="function"&&navigator.canShare?.({files:[file]})){
   try{
    await navigator.share({files:[file],text:message,title:"App eStore CE+PI • D-1 L"+p.store});
    status("Compartilhamento aberto: selecione o WhatsApp Business e confira "+p.name+" (L"+p.store+"), a imagem e a legenda. O aplicativo não confirma o envio.");
    return;
   }catch(e){if(e?.name==="AbortError"){status("Compartilhamento cancelado. Nenhuma mensagem enviada.");return}}
  }
  // WhatsApp Web permite preencher a conversa, mas NÃO pré-anexa o PNG.
  downloadFile(file);
  try{await navigator.clipboard?.writeText(message)}catch(_){}
  let opened=false;
  if(chat&&!chat.closed){try{chat.location.replace(waUrl);opened=true}catch(_){}}
  if(!opened){
   const a=document.createElement("a");a.href=waUrl;a.target="_blank";a.rel="noopener noreferrer";
   a.textContent="Abrir conversa do supervisor no WhatsApp";
   const box=ID("dcStatus");box?.append(document.createTextNode(" "));
   box?.append(a);
   status("Card salvo; clique no link disponível para abrir a conversa e anexe o PNG manualmente. A entrega não é confirmada.");
   return;
  }
  status("Conversa de "+p.name+" aberta com a legenda pronta. O PNG foi baixado: anexe o card e confirme o envio no WhatsApp.");
 }catch(e){
  if(chat&&!chat.closed)try{chat.close()}catch(_){}
  status(String(e?.message||"Falha ao preparar o card."),true);
 }finally{button.disabled=false;button.textContent=previous;}
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
