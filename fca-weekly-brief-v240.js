/* FCA | eStore CE+PI • V240 • Mensagem e card por filial priorizada */
(function(){
"use strict";
if(window.__ESTORE_FCA_BRIEF_V240__)return;
window.__ESTORE_FCA_BRIEF_V240__=true;
const CONTACT_API="https://fndkjgveeojlywkdrtxe.supabase.co/functions/v1/estore-alert-center";
const nf=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:2});
const pc=new Intl.NumberFormat("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const num=x=>x===null||x===undefined||x===""?null:(Number.isFinite(Number(x))?Number(x):null);
const money=x=>num(x)===null?"—":nf.format(num(x));
const count=x=>num(x)===null?"—":num(x).toLocaleString("pt-BR");
const rate=x=>num(x)===null?"—":pc.format(num(x)*100)+"%";
const diffPp=x=>num(x)===null?"—":(num(x)>0?"+":"")+pc.format(num(x)*100)+" p.p.";
const diffMoney=x=>num(x)===null?"—":(num(x)>0?"+":"")+(num(x)<0?"-":"")+nf.format(Math.abs(num(x)));
const diffCount=x=>num(x)===null?"—":(num(x)>0?"+":"")+count(x);
const stCode=x=>String(x||"").padStart(3,"0");
const data=()=>window.__FCA_CEPI_DATA_V240;
const prettyDay=x=>/^\d{4}-\d{2}-\d{2}$/.test(String(x||""))?x.slice(8)+"/"+x.slice(5,7)+"/"+x.slice(0,4):"—";
const weekday=x=>!x?"—":new Intl.DateTimeFormat("pt-BR",{weekday:"long",day:"2-digit",month:"2-digit",timeZone:"UTC"}).format(new Date(String(x)+"T12:00:00Z"));
const stores=(d)=>Array.isArray(d?.prioritized)?d.prioritized.slice(0,5):[];
const locate=(st)=>{const d=data();return stores(d).find(x=>stCode(x.st)===stCode(st))||null;};
const urlFor=(st,d)=>{const u=new URL("./",location.href);u.search="";u.hash="";u.searchParams.set("fca_store",stCode(st));u.searchParams.set("fca_week",String(d.weekStart||""));return u.href;};
const negative=x=>num(x)!==null&&num(x)<0;
const change=(v,type)=>type==="money"?diffMoney(v):type==="pp"?diffPp(v):diffCount(v);
const nameStore=x=>String(x.name||("Filial "+stCode(x.st))).replace(/^\d{3}\s*[-–•]\s*/,"");
let current=null,contacts=[],selected=null,adminPassword="",sending=false;

function summary(x,d){
 const areas=x.dispersion_by_front||{},op=areas.operacoes||{},ca=areas.caixa_atendimento||{};
 return [
 {key:"Share eStore",value:rate(x.share),delta:diffPp(x.share_delta),type:"share"},
 {key:"Venda captada",value:money(x.captured),delta:x.previous_captured_covered===false?"—":diffMoney(x.captured_delta),type:"money"},
 {key:"Pedidos",value:count(x.orders),delta:diffCount(x.orders_delta)+" pedidos",type:"orders"},
 {key:"Ticket médio",value:money(x.ticket),delta:num(x.previous_ticket)>0?diffMoney(x.ticket_delta):"—",type:"ticket"},
 {key:"Dias zerados",value:x.zero_days===null?"—":count(x.zero_days),delta:x.zero_days===null?"Cobertura diária incompleta":(x.biggest_zero_day?"Maior impacto: "+weekday(x.biggest_zero_day):"Sem dias zerados"),type:"zeros"},
 {key:"Dispersão geral",value:rate(x.dispersion),delta:"Operações: "+rate(op.rate)+" ("+count(op.zero)+"/"+count(op.total)+") | Caixa/Atendimento: "+rate(ca.rate)+" ("+count(ca.zero)+"/"+count(ca.total)+")",type:"areas"},
 {key:"Vendedores ativos",value:count(x.active_sellers),delta:"Zerados: "+count(x.zero_sellers)+" | Δ vs semana anterior: "+diffCount(x.zero_sellers_delta),type:"people"}
 ];
}
function recurring(x){
 const w=num(x.priority_consecutive_weeks);
 return w!==null&&w>=2&&x.priority_history_verified!==false?"📡 "+count(w)+"ª semana consecutiva entre as priorizadas por retração do share.":"";
}
function makeText(x,d,person){
 const greet=person?String(person.name||"").trim().split(/\s+/)[0]:"";
 const op=x.dispersion_by_front?.operacoes||{},ca=x.dispersion_by_front?.caixa_atendimento||{};
 const first="Bom dia"+(greet?", "+greet:"")+"! Espero que esteja bem.";
 const lines=[
 "*FCA eSTORE | FILIAL "+stCode(x.st)+" • SEMANA "+String(d.weekNumber||"")+"*",
 "",
 first,
 "Sua operação está entre as 5 filiais priorizadas da semana por retração do share eStore.",
 ...(recurring(x)?["",recurring(x)]:[]),
 "",
 "📊 *Share:* "+rate(x.share)+" | Δ: "+diffPp(x.share_delta),
 "💰 *Venda captada:* "+money(x.captured)+" | Δ: "+(x.previous_captured_covered===false?"—":diffMoney(x.captured_delta)),
 "🛍️ *Pedidos:* "+count(x.orders)+" | Δ: "+diffCount(x.orders_delta)+" pedidos",
 "🏷️ *Ticket médio:* "+money(x.ticket)+" | Δ: "+(num(x.previous_ticket)>0?diffMoney(x.ticket_delta):"—"),
 "⚠️ *Dias zerados:* "+(x.zero_days===null?"não apurado":count(x.zero_days))+" | maior impacto: "+(x.zero_days===null?"base diária incompleta":weekday(x.biggest_zero_day)),
 "📉 *Dispersão geral:* "+rate(x.dispersion),
 "   • Operações: "+rate(op.rate)+" | "+count(op.zero)+" zerados / "+count(op.total)+" elegíveis",
 "   • Caixa/Atendimento: "+rate(ca.rate)+" | "+count(ca.zero)+" zerados / "+count(ca.total)+" elegíveis",
 "👥 *Vendedores ativos:* "+count(x.active_sellers)+" | Zerados: "+count(x.zero_sellers)+" (Δ "+diffCount(x.zero_sellers_delta)+" vs sem. anterior)",
 "",
 "Peço que analise os fatores do desvio, identifique a causa raiz e registre no FCA um plano de reversão com ações, responsáveis e prazos.",
 "Fico à disposição para apoiar, caso precise de suporte.",
 "",
 "🔗 *Acesse a FCA da sua loja:*",
 urlFor(x.st,d)
 ];
 if(x.zero_days===null)lines.push("_Dias zerados: fechamento diário incompleto; não interpretar ausência de input como venda zero._");
 if(x.zero_sellers_delta===null)lines.push("_Vendedores zerados vs semana anterior: dados insuficientes para comparação._");
 return lines.join("\n");
}
function kpiHtml(m){
 const ds=m.type==="areas"?" fcaBriefWideV240":"";
 return '<div class="fcaBriefMetricV240'+ds+'"><small>'+esc(m.key)+'</small><strong>'+esc(m.value)+'</strong><span>'+esc(m.type==="areas"?"Frentes (denominadores próprios)":m.type==="zeros"?"Leitura da semana":"Δ vs semana anterior")+'</span><em>'+esc(m.delta)+'</em></div>';
}
function modalHtml(x,d){
 const rec=recurring(x),sum=summary(x,d);
 const noHistory=(!d.comparisonReady||!x.has_verified_compare);
 return '<div class="fcaBriefOverlayV240" role="presentation">'+
 '<div class="fcaBriefDialogV240" role="dialog" aria-modal="true" aria-label="FCA da filial '+esc(x.st)+'">'+
 '<div class="fcaBriefToolbarV240"><strong>FCA • eStore CE+PI</strong><button type="button" data-fca-action="close" aria-label="Fechar">×</button></div>'+
 '<header class="fcaBriefHeadV240"><span>SEMANA '+esc(d.weekNumber)+' vs '+esc(d.previousWeekNumber)+'</span><h2>Filial '+esc(x.st)+' • '+esc(nameStore(x))+'</h2><p>'+esc(prettyDay(d.weekStart))+' a '+esc(prettyDay(d.weekEnd))+' • '+esc(x.priority_rank)+'ª maior retração de share</p>'+
 (rec?'<div class="fcaBriefRadarV240">'+esc(rec)+'</div>':'')+'</header>'+
 (noHistory?'<p class="fcaBriefWarningV240">Share semanal ainda não homologado. Não enviar FCA sem comparação validada.</p>':'')+
 '<section class="fcaBriefStatsV240"><h3>Dashboard operacional da semana</h3><div class="fcaBriefGridV240">'+sum.map(kpiHtml).join('')+'</div>'+
 '<p class="fcaBriefFootnoteV240">Operações e Caixa/Atendimento usam percentuais calculados sobre o HC elegível de cada frente. A soma dos percentuais não representa o índice geral.</p></section>'+
 '<section class="fcaBriefTextAreaV240"><h3>Mensagem ao supervisor</h3><p>Bom dia! Espero que esteja bem. O resumo abaixo será personalizado com o nome do supervisor selecionado.</p><pre id="fcaBriefMessageV240">'+esc(makeText(x,d,null))+'</pre></section>'+
 '<section class="fcaBriefContactsV240"><h3>Enviar FCA ao supervisor responsável</h3>'+
 '<p>O contato será usado somente quando cadastro, matrícula, telefone e autorização estiverem confirmados. Não existe disparo automático.</p>'+
 '<button class="fcaBriefPrimaryV240" type="button" data-fca-action="contacts">Consultar supervisores validados</button>'+
 '<div id="fcaBriefPeopleV240" aria-live="polite"></div>'+
 '<label class="fcaBriefDutyV240"><input type="checkbox" id="fcaBriefConfirmV240"> Confirmei que o supervisor selecionado está em expediente e autorizado a receber a mensagem.</label>'+
 '<div class="fcaBriefButtonsV240">'+
 '<button type="button" data-fca-action="native" '+(noHistory?'disabled':'')+'>Compartilhar card + mensagem</button>'+
 '<button type="button" data-fca-action="wa" '+(noHistory?'disabled':'')+'>Abrir WhatsApp do supervisor</button>'+
 '<button type="button" data-fca-action="copy">Copiar mensagem</button>'+
 '<button type="button" data-fca-action="preview">Visualizar card</button>'+
 '</div><p class="fcaBriefHelpV240">O WhatsApp não permite anexar uma imagem automaticamente por link direto. “Compartilhar card + mensagem” abre o compartilhamento do aparelho para você selecionar o contato. “Abrir WhatsApp” direciona ao contato validado com o texto pronto.</p>'+
 '<div id="fcaBriefNoticeV240" role="status"></div>'+
 '</section></div></div>';
}
function notice(t){const v=document.getElementById("fcaBriefNoticeV240");if(v)v.textContent=t;}
function close(){document.querySelector(".fcaBriefOverlayV240")?.remove();current=null;contacts=[];selected=null;adminPassword="";sending=false;}
function currentContact(){return contacts.find(p=>String(p.id)===String(selected))||null;}
function validated(c,st){
 const phone=String(c.phone_suggested_e164||"").replace(/\D/g,"");
 const person=c.person||{};
 return c.verification_status==="confirmado" && stCode(c.store_code_original)===st &&
  stCode(c.store_code_confirmed)===st && String(c.matricula_confirmed||"")===String(person.matricula||"") &&
  person.eligible_supervisor===true && !/gerente|servicos|solucoes/i.test(String(person.cargo||"")) &&
  !/férias|ferias|afast|deslig|inativ/i.test(String(person.situacao||"")) &&
  /^55[1-9]\d9\d{8}$/.test(phone)&&/consentimento:/i.test(String(c.review_notes||""));
}
async function getContacts(){
 const d=data(),x=current;
 if(!d?.ctx?.admin||String(d?.ctx?.id)==="0000000")return notice("Somente o administrador pode acessar os contatos validados da regional.");
 let pwd=adminPassword;
 if(!pwd){pwd=window.prompt("Informe a senha administrativa para consultar os contatos validados:")||"";if(!pwd)return notice("Consulta de contatos cancelada.");}
 notice("Consultando diretório protegido...");
 try{
  const date=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Fortaleza",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
  const r=await fetch(CONTACT_API,{method:"POST",headers:{"Content-Type":"application/json"},cache:"no-store",
   body:JSON.stringify({action:"dashboard",matricula:String(d.ctx.id),password:pwd,date})});
  const j=await r.json();if(!r.ok||!j.ok)throw Error(j.error||"Consulta não autorizada.");
  adminPassword=pwd;
  contacts=(j.contacts||[]).filter(c=>validated(c,stCode(x.st))).map(c=>({...c,phone:String(c.phone_suggested_e164).replace(/\D/g,""),name:String(c.person?.nome||c.name_original||"Supervisor")}));
  const root=document.getElementById("fcaBriefPeopleV240");
  if(root)root.innerHTML=contacts.length?contacts.map((c,i)=>'<label class="fcaBriefPersonV240"><input type="radio" name="fcaBriefPersonV240" value="'+esc(c.id)+'" '+(i===0?'checked':'')+'><span><b>'+esc(c.name)+'</b><small>'+esc(c.person?.cargo||"Supervisor")+' • Filial '+esc(x.st)+'</small></span></label>').join(""):'<p class="fcaBriefWarningV240">Nenhum contato elegível e validado para esta filial. Confira o cadastro e a autorização na Central de Alertas.</p>';
  selected=contacts[0]?.id||null;
  updateMessage();
  notice(contacts.length?contacts.length+" contato(s) validado(s). Selecione o supervisor e confirme o expediente.":"Envio não habilitado: contato pendente.");
 }catch(e){adminPassword="";contacts=[];selected=null;notice(String(e.message||e));}
}
function updateMessage(){
 const area=document.getElementById("fcaBriefMessageV240");
 if(area&&current)area.textContent=makeText(current,data(),currentContact());
}
function readyForSend(){
 if(!current||!data()?.comparisonReady||!current.has_verified_compare){notice("Não é possível enviar antes da comparação semanal homologada.");return false}
 if(!currentContact()){notice("Selecione um contato validado. Se a lista estiver vazia, atualize a Central de Alertas.");return false}
 if(!document.getElementById("fcaBriefConfirmV240")?.checked){notice("Confirme o expediente e a autorização antes do compartilhamento.");return false}
 return true;
}
function wrapText(ctx,value,maxWidth){
 const words=String(value).split(/\s+/),out=[];let line="";
 for(const w of words){const next=line?line+" "+w:w;if(ctx.measureText(next).width<=maxWidth)line=next;else{if(line)out.push(line);line=w}}
 if(line)out.push(line);return out;
}
function makeCard(x,d){
 const cv=document.createElement("canvas"),ctx=cv.getContext("2d");
 cv.width=1080;cv.height=1530;
 const G="#173F35",P="#F7F5EF",GOLD="#F5C264",BEIGE="#FFF9ED",RED="#C43B32";
 function rect(px,py,w,h,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(px,py,w,h,r);ctx.fill()}
 function t(value,px,py,size,color=G,bold=false){ctx.fillStyle=color;ctx.font=(bold?"bold ":"")+size+"px Arial, sans-serif";ctx.fillText(String(value),px,py)}
 function box(label,value,delta,xx,yy,wide=false){
  rect(xx,yy,wide?984:474,178,23,BEIGE);
  t(label,xx+24,yy+39,20,"#587269");
  t(value,xx+24,yy+94,38,G,true);
  ctx.font="19px Arial, sans-serif";
  const lines=wrapText(ctx,delta,wide?930:425).slice(0,3);
  lines.forEach((line,k)=>t(line,xx+24,yy+131+k*22,18,negative(delta)?RED:"#465D56"));
 }
 ctx.fillStyle=P;ctx.fillRect(0,0,1080,1530);
 rect(24,24,1032,175,28,G);t("eStore CE+PI   •   FCA SEMANAL",58,85,31,GOLD,true);
 t("Filial "+stCode(x.st)+" — "+nameStore(x),58,139,32,"#FFFFFF",true);
 t("Sem. "+d.weekNumber+" vs "+d.previousWeekNumber+"  •  "+prettyDay(d.weekStart)+" a "+prettyDay(d.weekEnd),58,177,20,"#DFEDE7");
 if(recurring(x)){rect(35,215,1010,62,16,"#FFE7C0");t(recurring(x),53,254,22,"#9D3C25",true)}
 const top=recurring(x)?292:223;
 box("SHARE eSTORE",rate(x.share),"Δ "+diffPp(x.share_delta),35,top);
 box("VENDA CAPTADA",money(x.captured),"Δ "+(x.previous_captured_covered===false?"—":diffMoney(x.captured_delta)),545,top);
 box("PEDIDOS",count(x.orders),"Δ "+diffCount(x.orders_delta)+" pedidos",35,top+192);
 box("TICKET MÉDIO",money(x.ticket),"Δ "+(num(x.previous_ticket)>0?diffMoney(x.ticket_delta):"—"),545,top+192);
 const zero=x.zero_days===null?"Dados incompletos":count(x.zero_days)+" dia(s)";
 box("DIAS ZERADOS",zero,"Maior impacto: "+(x.zero_days===null?"—":weekday(x.biggest_zero_day)),35,top+384);
 box("EQUIPE eSTORE",count(x.active_sellers)+" ativos","Zerados "+count(x.zero_sellers)+" | Δ "+diffCount(x.zero_sellers_delta),545,top+384);
 const area=x.dispersion_by_front||{},op=area.operacoes||{},ca=area.caixa_atendimento||{};
 box("DISPERSÃO GERAL",rate(x.dispersion),"Frentes com base elegível própria",35,top+576,true);
 rect(35,top+764,984,130,20,BEIGE);
 t("OPERAÇÕES",57,top+808,20,G,true);t(rate(op.rate)+"  |  "+count(op.zero)+"/"+count(op.total)+" zerados",260,top+808,20,G);
 t("CAIXA / ATENDIMENTO",57,top+860,20,G,true);t(rate(ca.rate)+"  |  "+count(ca.zero)+"/"+count(ca.total)+" zerados",360,top+860,20,G);
 t("Percentuais por frente não são aditivos.",57,top+931,18,"#566D64");
 rect(35,top+958,984,128,18,G);
 t("FCA • Analise causa raiz e registre seu plano de ação",57,top+1008,24,GOLD,true);
 t("Responsáveis, prazos e acompanhamento da reversão semanal.",57,top+1050,18,"#F2F5F2");
 const link=urlFor(x.st,d);
 ctx.font="18px Arial, sans-serif";
 wrapText(ctx,link,985).slice(0,2).forEach((line,i)=>t(line,52,top+1133+i*24,18,G));
 t("Moda que inspira o Brasil",52,1498,20,G,true);
 return cv;
}
async function nativeShare(){
 if(sending||!readyForSend())return;
 sending=true;notice("Preparando dashboard FCA para compartilhar...");
 try{
  const x=current,d=data(),person=currentContact(),message=makeText(x,d,person),canvas=makeCard(x,d);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/png"));
  if(!blob)throw Error("Não foi possível gerar a imagem.");
  const file=new File([blob],"FCA_L"+stCode(x.st)+"_SEM"+d.weekNumber+".png",{type:"image/png"});
  if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
   await navigator.share({title:"FCA • Loja "+stCode(x.st),text:message,files:[file]});
   notice("Compartilhamento solicitado. Confirme o contato e o envio no WhatsApp; o aplicativo não confirma a entrega.");
  }else{
   const href=URL.createObjectURL(blob),a=document.createElement("a");a.href=href;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(href),2000);
   try{await navigator.clipboard.writeText(message)}catch(_){}
   notice("Card salvo e mensagem copiada quando permitido. Abra o WhatsApp do supervisor e anexe a imagem manualmente.");
  }
 }catch(e){notice(e?.name==="AbortError"?"Compartilhamento cancelado.":String(e.message||e))}
 finally{sending=false}
}
function whatsappText(){
 if(!readyForSend())return;
 const c=currentContact(),msg=makeText(current,data(),c);
 const phone=String(c.phone||"");
 const url="https://wa.me/"+phone+"?text="+encodeURIComponent(msg);
 const a=document.createElement("a");a.href=url;a.target="_blank";a.rel="noopener noreferrer";a.click();
 notice("Conversa aberta para "+c.name+". O texto está pronto; anexe o card caso queira enviar também a imagem.");
}
async function copyMessage(){
 if(!current)return;
 try{await navigator.clipboard.writeText(makeText(current,data(),currentContact()));notice("Mensagem FCA copiada.")}catch(e){notice("Não foi possível copiar automaticamente.");}
}
function previewCard(){
 if(!current)return;
 const canvas=makeCard(current,data());const root=document.getElementById("fcaBriefNoticeV240");
 if(root){root.innerHTML='<p>Prévia do card dashboard:</p><img alt="Card FCA da filial" style="max-width:100%;height:auto;border-radius:12px" src="'+canvas.toDataURL("image/png")+'">';}
}
window.fcaOpenBriefV240=function(st){
 const d=data(),x=locate(st);
 if(!d||!x||d.comparisonReady!==true){window.alert("Aguardando consolidação oficial do share semanal para esta filial.");return;}
 close();current=x;
 document.body.insertAdjacentHTML("beforeend",modalHtml(x,d));
 const root=document.querySelector(".fcaBriefOverlayV240");if(!root)return;
 root.addEventListener("click",function(ev){
  if(ev.target===root){close();return}
  const b=ev.target.closest("[data-fca-action]");if(!b)return;
  const action=b.dataset.fcaAction;
  if(action==="close")close();
  else if(action==="contacts")getContacts();
  else if(action==="native")nativeShare();
  else if(action==="wa")whatsappText();
  else if(action==="copy")copyMessage();
  else if(action==="preview")previewCard();
 });
 root.addEventListener("change",function(ev){if(ev.target.matches('input[name="fcaBriefPersonV240"]')){selected=ev.target.value;updateMessage();}});
 document.addEventListener("keydown",function key(ev){if(ev.key==="Escape"){document.removeEventListener("keydown",key);close()}},{once:true});
 root.querySelector(".fcaBriefDialogV240")?.scrollTo(0,0);
};
let deepLinkUsed=false;
function deepLink(){
 const qs=new URLSearchParams(location.search),st=qs.get("fca_store"),wk=qs.get("fca_week");
 if(deepLinkUsed||!st||!wk||!/^\d{3}$/.test(st)||!/^\d{4}-\d{2}-\d{2}$/.test(wk))return;
 if(typeof U!=="undefined"&&U?.u&&typeof go==="function"&&document.getElementById("view")){
  deepLinkUsed=true;go("fca");
 }
}
window.addEventListener("estore:fca-loaded",function(){
 const q=new URLSearchParams(location.search),st=q.get("fca_store"),wk=q.get("fca_week");
 const d=data();
 if(!st||!d||wk!==d.weekStart)return;
 if(typeof FCA_TAB_V61!=="undefined"&&typeof fcaRenderV61==="function"){
  FCA_TAB_V61="priority";fcaRenderV61();
 }
 if(typeof openFcaV60==="function"&&stores(d).some(x=>stCode(x.st)===stCode(st))){
  openFcaV60(st);
 }
});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",deepLink,{once:true});
else deepLink();
setInterval(deepLink,1800);
})();
