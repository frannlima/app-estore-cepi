/* Painel Executivo eStore CE+PI
 * Fonte: Gestão/Lojas (COMMON.regional + daily_updates.management), FCA existente,
 * ranking_period (colaboradores) e benchmark oficial importado.
 * A exportação usa o MESMO nó HTML e gráficos da tela, sem redesenho paralelo.
 */
(function(w){
"use strict";
const API_EXEC="https://fndkjgveeojlywkdrtxe.supabase.co/functions/v1/estore-executive";
const STORES=["073","084","108","113","138","142","146","175","177","222","238","258","262","314","318","344","350","552"];
const EX={
 period:"day",data:null,loading:false,error:"",fca:null,ranking:null,highlight:null,date:null,
 draft:null,ocrText:"",active:false
};
const e=(v)=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const n=(v)=>Number.isFinite(Number(v))?Number(v):0;
const money=(v)=>v==null?"—":new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0}).format(v);
const money2=(v)=>v==null?"—":new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v);
const count=(v)=>v==null?"—":new Intl.NumberFormat("pt-BR").format(Math.round(v));
const percent=(v)=>v==null?"—":(n(v)*100).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})+"%";
const pp=(v)=>v==null?"—":(v>0?"+":"")+(n(v)*100).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})+" p.p.";
const dia=(v)=>v?String(v).split("-").reverse().join("/"):"—";
const isoWeek=(d)=>{let x=new Date(d+"T12:00:00Z"),z=x.getUTCDay()||7;x.setUTCDate(x.getUTCDate()-z+1);return x.toISOString().slice(0,10)};
function weekNumber(d){const x=new Date(d+"T12:00:00Z"),t=new Date(Date.UTC(x.getUTCFullYear(),x.getUTCMonth(),x.getUTCDate()));const day=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-day);const first=new Date(Date.UTC(t.getUTCFullYear(),0,1));return Math.ceil((((t-first)/86400000)+1)/7)}
const firstMonth=(d)=>d.slice(0,7)+"-01";
const same=(a,b)=>String(a||"")===String(b||"");
const logo="./assets/riachuelo-logo-horizontal-oficial-white-v133.svg";
const riaLogo="./assets/ria-marca-executivo.svg";
const verticalLogo="./assets/ria-vertical-anexo-v188.svg";
function notify(msg){let el=document.createElement("div");el.className="execToastV1";el.textContent=msg;document.body.append(el);setTimeout(()=>el.remove(),4700)}
async function exApi(body){const r=await fetch(API_EXEC,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});const j=await r.json().catch(()=>({}));if(!r.ok||j.error)throw Error(j.error||"Falha de comunicação");return j}
function storeName(st){try{return typeof storeDisplayName==="function"?storeDisplayName(st):""}catch(_){return""}}
function mat(){return w.U?.u?.id||typeof U!=="undefined"&&U?.u?.id||""}
function isLeader(){try{return typeof isLead==="function"&&isLead()}catch(_){return false}}
function isMain(){try{return typeof isMasterAdmin==="function"&&isMasterAdmin()&&!isDemo()}catch(_){return false}}
function isGuest(){try{return typeof isDemo==="function"&&isDemo()}catch(_){return true}}
function currentAsOf(){return String(w.COMMON?.asof||w.DB?.asof||"")}
function latestDate(){return EX.date||EX.data?.daily?.at(-1)?.date||currentAsOf()}
function periodBounds(period,date){return {period,start_date:period==="day"?date:period==="week"?isoWeek(date):firstMonth(date),end_date:date}}
function rawBenchmark(){const b=periodBounds(EX.period,latestDate());return (EX.data?.benchmarks||[]).find(x=>x.period===b.period&&same(x.start_date,b.start_date)&&same(x.end_date,b.end_date))||null}
function validBenchmark(b,regionalCap){
 if(!b)return false;
 // Evitar que OCR incorreto publique 45,00% no lugar de 0,45% ou capture LY como captado.
 const share=Number(b.company_share),cap=Number(b.company_captured);
 return Number.isFinite(share)&&share>=0&&share<=.05&&Number.isFinite(cap)&&cap>=0
   &&!(regionalCap>0&&cap+.01<regionalCap);
}
function matchBenchmark(){const b=rawBenchmark();const regional=EX.data?.daily?.filter(x=>x.date>=periodBounds(EX.period,latestDate()).start_date&&x.date<=latestDate()).reduce((s,x)=>s+x.stores.filter(y=>STORES.includes(y.st)).reduce((q,y)=>q+n(y.c),0),0)||0;return validBenchmark(b,regional)?b:null}
function numeric(v){if(v==null||v==="")return null;const c=String(v).trim().replace(/R\$|%|\s/g,"");if(!c)return null;let s=c;if(c.includes(","))s=c.replace(/\./g,"").replace(",",".");else if((c.match(/\./g)||[]).length>1)s=c.replace(/\./g,"");const x=Number(s);return Number.isFinite(x)?x:null}
function dailyRows(date){const d=(EX.data?.daily||[]).find(x=>x.date===date);return d?d.stores.filter(x=>STORES.includes(x.st)):[]}
function baseRows(period){const rows=w.COMMON?.regional?.[period]||[];return rows.filter(x=>STORES.includes(String(x.st||"").padStart(3,"0"))).map(x=>({...x,st:String(x.st).padStart(3,"0")}))}
function regionalData(){
 const dt=latestDate(),b=matchBenchmark(),sameCurrent=same(dt,currentAsOf());
 let rows=[],strict=false;
 if(EX.period==="day"){
   const daily=EX.data?.daily?.find(x=>same(x.date,dt));
   if(daily){rows=dailyRows(dt).map(x=>{const z=baseRows("day").find(y=>y.st===x.st);return {...x,ee:sameCurrent?z?.ee:null,ge:sameCurrent?z?.ge:null,share:x.share!=null?x.share:z?.share}});strict=rows.length===STORES.length;}
   else if(sameCurrent){rows=baseRows("day");strict=rows.length===STORES.length;}
 }else if(sameCurrent){rows=baseRows(EX.period);strict=rows.length===STORES.length;}
 const total=rows.reduce((acc,x)=>({captured:acc.captured+n(x.c),orders:acc.orders+n(x.o),approved:acc.approved+n(x.a),base:acc.base+n(x.ge),target:acc.target+n(x.ee)}),{captured:0,orders:0,approved:0,base:0,target:0});
 let share=total.base>0?total.captured/total.base:null,delta=null;
 const f=EX.fca;
 if(EX.period==="week"&&f){
  const p=f.showPartial&&f.currentPartial&&same(f.currentPartial.end,dt)?f.currentPartial:null;
  if(p?.regional){share=p.regional.share==null?share:n(p.regional.share);delta=p.share_delta==null?null:n(p.share_delta)}
  else if(!p&&same(f.closedWeekEnd,dt)&&f.summary?.share!=null){share=n(f.summary.share);delta=f.summary.share_delta==null?null:n(f.summary.share_delta)}
 }
 // Quando há a linha oficial CE+PI na imagem, ela prevalece para o período selecionado.
 if(b?.regional_share!=null)share=n(b.regional_share);
 if(!rows.length&&b?.regional_captured!=null){total.captured=n(b.regional_captured);total.orders=b.regional_orders==null?null:n(b.regional_orders)}
 return {rows,strict,total,share,delta,benchmark:b};
}
function activeStores(){const day=dailyRows(latestDate());const r=regionalData();return EX.period==="day"?(day.length?day:r.rows):r.rows}
function topRows(type){return [...activeStores()].sort((a,b)=>n(b[type])-n(a[type])||a.st.localeCompare(b.st)).filter(x=>type==="share"?x.share!=null:n(x[type])>0).slice(0,3)}
function topCollaborators(){return (EX.ranking?.regional||[]).filter(x=>n(x.c)>0).sort((a,b)=>n(b.c)-n(a.c)).slice(0,3)}
function opportunities(){
 const day=EX.data?.daily?.find(x=>x.date===latestDate());
 if(EX.period!=="day"||!day)return {zeros:[],missing:[],potential:null,ratio:null};
 const present=new Set(day.stores.map(x=>x.st));
 const missing=STORES.filter(x=>!present.has(x));
 const zeros=day.stores.filter(x=>STORES.includes(x.st)&&n(x.c)===0&&n(x.o)===0);
 // Meta é extraída de Gestão/Lojas para a data. Não substituímos meta ausente por valores inventados.
 const base=same(currentAsOf(),latestDate())?baseRows("day"):[];
 const v=zeros.map(x=>({st:x.st,target:base.find(y=>y.st===x.st)?.ee??null}));
 const have=v.every(x=>x.target!=null);
 const potential=have?v.reduce((s,x)=>s+n(x.target),0):null;
 const regTarget=base.reduce((s,x)=>s+n(x.ee),0);
 return {zeros:v,missing,potential,ratio:have&&regTarget>0?potential/regTarget:null};
}
function shareMovements(){
 const ref=latestDate(),p=EX.period,valid=x=>x&&STORES.includes(String(x.st||"").padStart(3,"0"))&&x.share_delta!=null&&Number.isFinite(Number(x.share_delta));
 const normalize=(arr,kind)=>[...(arr||[])].filter(valid).map(x=>({st:String(x.st).padStart(3,"0"),delta:Number(x.share_delta)})).filter(x=>kind==="up"?x.delta>0:x.delta<0).sort((a,b)=>kind==="up"?b.delta-a.delta:a.delta-b.delta);
 if(p==="week"){
  const f=EX.fca||{},cur=f.showPartial&&f.currentPartial&&f.currentPartial.end===ref?f.currentPartial:null;
  const closed=!cur&&f.closedWeekEnd===ref?f:null;
  return {available:!!(cur||closed),up:normalize(cur?.growth||closed?.growth,"up"),down:normalize(cur?.retractions||closed?.prioritized,"down"),source:"FCA semanal",reason:cur||closed?"":"Comparativo FCA não disponível para o intervalo"};
 }
 if(p==="month"){
  const ym=ref.slice(0,7),d=new Date(ym+"-01T12:00:00Z");d.setUTCMonth(d.getUTCMonth()-1);const before=d.toISOString().slice(0,7);
  const all=EX.data?.official_months||[],curr=all.find(x=>x.month===ym),previous=all.find(x=>x.month===before);
  if(!curr||!previous||!curr.stores||!previous.stores)return {available:false,up:[],down:[],source:"Share mensal oficial",reason:"Aguardando shares oficiais dos dois meses comparados"};
  const list=STORES.filter(st=>curr.stores[st]!=null&&previous.stores[st]!=null&&Number.isFinite(Number(curr.stores[st]))&&Number.isFinite(Number(previous.stores[st]))).map(st=>({st,delta:Number(curr.stores[st])-Number(previous.stores[st])}));
  if(!list.length)return {available:false,up:[],down:[],source:"Share mensal oficial",reason:"Sem histórico mensal comparável por filial"};
  return {available:true,up:list.filter(x=>x.delta>0).sort((a,b)=>b.delta-a.delta),down:list.filter(x=>x.delta<0).sort((a,b)=>a.delta-b.delta),source:"Share mensal oficial",reason:""};
 }
 return {available:false,up:[],down:[],source:"",reason:""};
}
function trendData(){
 const end=latestDate(),start=periodBounds(EX.period,end).start_date;
 const days=(EX.data?.daily||[]).filter(x=>x.date>=start&&x.date<=end);
 const grouped=new Map();
 for(const d of days){
  const key=EX.period==="month"?isoWeek(d.date):d.date;
  const item=grouped.get(key)||{date:d.date,until:d.date,captured:0,coverage:0};
  item.captured+=d.stores.filter(x=>STORES.includes(x.st)).reduce((sum,x)=>sum+n(x.c),0);
  item.until=d.date;item.coverage++;
  grouped.set(key,item);
 }
 return [...grouped.values()].sort((a,b)=>a.date.localeCompare(b.date));
}
function firstTwoNames(name){
 const parts=String(name||"").replace(/\s+/g," ").trim().split(" ").filter(Boolean);
 return parts.slice(0,2).join(" ")||"Colaborador";
}
function displayColName(p){
 try{return firstTwoNames(typeof preferredName==="function"?preferredName(p.id,p.name):p.name)}
 catch(_){return firstTwoNames(p.name)}
}
function colPhoto(p){
 const id=String(p?.id||"");
 try{
  if(typeof APP_PROFILE_PHOTOS!=="undefined"&&APP_PROFILE_PHOTOS[id])return APP_PROFILE_PHOTOS[id];
  if(typeof CONTENT!=="undefined"&&CONTENT?.profilePhotos?.[id])return CONTENT.profilePhotos[id];
  if(typeof U!=="undefined"&&String(U?.u?.id||"")===id&&typeof profilePhotoV3==="function")return profilePhotoV3()||"";
 }catch(_){}
 return "";
}
function podiumItem(p,pos){
 if(!p)return '<div class="execPodiumPersonV2 empty">Sem resultado confirmado</div>';
 const photo=colPhoto(p),name=displayColName(p),initials=name.split(" ").slice(0,2).map(x=>x[0]).join("");
 const mark='<span class="execStoreMarkV2"><img src="'+riaLogo+'" alt="RIA"><b>'+e(p.st)+'</b></span>';
 return '<div class="execPodiumPersonV2 place'+pos+'"><span class="execPlaceV2">'+pos+'º</span>'+
 '<div class="execPhotoV2">'+(photo?'<img src="'+e(photo)+'" alt="Foto do colaborador" loading="lazy" referrerpolicy="no-referrer">':'<span>'+e(initials)+'</span>')+'</div>'+
 '<b class="execNameV2">'+e(name)+'</b>'+mark+'<strong class="execAmountV2">'+money(p.c)+'</strong></div>';
}
function top3HTML(title,rows,key,format){
 return '<div class="execMiniV1"><h4>'+e(title)+'</h4><div class="execMiniListV2">'+(
 rows.length?rows.map((x,i)=>'<div class="execMiniRowV1"><span class="execMedalV1">'+(i+1)+'</span><b class="execStoreV2">L'+e(x.st)+'</b><strong>'+format(x[key])+'</strong></div>').join(""):'<span class="execHelpV1">Aguardando dados</span>'
 )+'</div></div>';
}
function drawChart(rows){
 if(!rows.length)return '<p class="execHelpV1">Ainda não há histórico gerencial suficiente para o período.</p>';
 const W=700,H=224,left=45,right=12,top=25,bottom=37,plot=H-top-bottom,max=Math.max(1,...rows.map(x=>x.captured))*1.18;
 const bw=(W-left-right)/rows.length;
 let a='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" class="execChartV1" role="img" aria-label="Captação regional oficial por '+(EX.period==="week"?"dia":"semana")+'">';
 for(let i=0;i<4;i++){let y=top+i*plot/3,unit=max*(3-i)/3;a+='<line x1="'+left+'" x2="'+(W-right)+'" y1="'+y+'" y2="'+y+'" stroke="#e5e8e4"/><text x="'+(left-6)+'" y="'+(y+5)+'" text-anchor="end" fill="#66746b" font-size="13">'+(unit>=1000?(unit/1000).toFixed(1)+"k":Math.round(unit))+'</text>'}
 rows.forEach((x,i)=>{const bx=left+i*bw+bw*.15,w=bw*.68,h=plot*x.captured/max,y=top+plot-h;
 a+='<rect x="'+bx+'" y="'+y+'" width="'+w+'" height="'+Math.max(0,h)+'" rx="5" fill="'+(i===rows.length-1?"#DE7C00":"#173F35")+'"/>'+
 '<text x="'+(bx+w/2)+'" y="'+(H-10)+'" text-anchor="middle" font-size="13" fill="#51635b">'+(EX.period==="month"?"Sem. "+weekNumber(x.date):x.date.slice(8))+'</text>';
 if(i===rows.length-1)a+='<text x="'+(bx+w/2)+'" y="'+Math.max(14,y-7)+'" font-size="14" font-weight="bold" text-anchor="middle" fill="#b96200">'+count(x.captured)+'</text>';
 });
 return a+"</svg>";
}
function dailyStoreChart(rows){
 const items=[...rows].filter(x=>n(x.c)>0).sort((a,b)=>n(b.c)-n(a.c)).slice(0,5);
 if(!items.length)return '<div class="execHelpV1">Sem captação registrada no período diário.</div>';
 const max=Math.max(1,...items.map(x=>n(x.c)));
 return '<div class="execTopStoreChartV2">'+items.map((x,i)=>'<div class="execStoreBarV2"><span class="execStoreRankV2">'+(i+1)+'º</span><strong>L'+e(x.st)+'</strong><div class="execStoreBarTrackV2"><i style="width:'+Math.max(2,n(x.c)/max*100)+'%;background:'+(i===0?"#DE7C00":"#173F35")+'"></i></div><b>'+money(x.c)+'</b></div>').join("")+'</div>';
}
function executivePanelViewV1(){
 if(!isLeader())return '<div class="notice">Painel Executivo disponível para supervisores e gestores.</div>';
 EX.active=true;
 return '<div class="execPageV1"><div class="execToolbarV1"><div class="execSegmentV1"><button class="'+(EX.period==="day"?"on":"")+'" onclick="execSetPeriodV1(\'day\')">D-1</button><button class="'+(EX.period==="week"?"on":"")+'" onclick="execSetPeriodV1(\'week\')">Semana</button><button class="'+(EX.period==="month"?"on":"")+'" onclick="execSetPeriodV1(\'month\')">Mês</button></div><div style="display:flex;flex-wrap:wrap;gap:7px"><button class="light" onclick="execRefreshV1()">↻ Atualizar</button>'+(isMain()?'<button class="orange" onclick="execShowAdminV1()">＋ Benchmark</button>':'')+'<button onclick="execShareV1()">↗ Compartilhar</button></div></div><div id="execMessageV1"></div><div id="execVisualV1"><div class="execSectionV1">Consolidando relatórios oficiais e o FCA...</div></div><div id="execAdminSlotV1"></div></div>';
}
function render(){
 const root=document.getElementById("execVisualV1");if(!root)return;
 if(!EX.data){root.innerHTML='<div class="execSectionV1">Consultando as fontes oficiais...</div>';return}
 const d=regionalData(),bench=d.benchmark,raw=rawBenchmark(),bad=raw&&!bench;
 const share=d.share,company=bench?.company_share==null?null:n(bench.company_share);
 const gap=share==null||company==null?null:share-company,cap=d.rows.length?d.total.captured:(bench?.regional_captured??null);
 const orders=d.rows.length?d.total.orders:(bench?.regional_orders??null),target=d.total.target||null;
 const reach=cap!=null&&target>0?cap/target:null;
 const ref=latestDate(),bounds=periodBounds(EX.period,ref),periodName=EX.period==="day"?"D-1":EX.period==="week"?"SEMANA":"MÊS";
 const dateText=EX.period==="day"?dia(ref):dia(bounds.start_date)+" – "+dia(ref);
 const maxCompare=Math.max(.00001,share||0,company||0);
 const bar=(v)=>v==null?"0%":Math.min(100,v/maxCompare*100)+"%";
 const trend=d.delta,opp=opportunities(),recs=topCollaborators(),ordered=[recs[1],recs[0],recs[2]];
 const stamps=(EX.data?.daily||[]).filter(x=>x.date>=bounds.start_date&&x.date<=ref);
 const f=EX.fca;
 const fcaRows=EX.period==="week"?(f?.currentPartial?.end===ref?f.currentPartial.retractions||[]:f?.prioritized||[]):[];
 let attention=[];
 if(EX.period==="day"){
  attention=[
   ...opp.zeros.map(x=>({st:x.st,tag:"ZERADA",amount:x.target,kind:"zero"})),
   ...opp.missing.map(st=>({st,tag:"SEM INPUT",amount:null,kind:"pending"}))
  ].slice(0,8);
 }else if(EX.period==="week"){
  attention=fcaRows.slice(0,5).map(x=>({st:x.st,tag:pp(x.share_delta),kind:n(x.share_delta)<0?"down":"up",amount:null}));
 }else{
  attention=[...d.rows].filter(x=>x.share!=null).sort((a,b)=>n(a.share)-n(b.share)).slice(0,5).map(x=>({st:x.st,tag:percent(x.share),kind:"share",amount:null}));
 }
 const benchmarkMessage=bad?'<div class="execErrorV1">⚠ Benchmark inconsistente para '+e(dateText)+'. O share da empresa foi ocultado até a conferência da captação e do percentual no print oficial.</div>':
 !bench?'<p class="execNoticeV2">Benchmark nacional pendente neste intervalo. Importe o print oficial para habilitar a comparação em p.p.</p>':"";
 const regionLine='<div class="execCompareLineV2"><span>CE+PI</span><b>'+percent(share)+'</b><div class="execMeterV1"><i style="width:'+bar(share)+'"></i></div></div>';
 const companyLine='<div class="execCompareLineV2"><span>Empresa</span><b>'+percent(company)+'</b><div class="execMeterV1 national"><i style="width:'+bar(company)+'"></i></div></div>';
 const mini=[
  top3HTML("TOP 3 | CAPTAÇÃO",topRows("c"),"c",money),
  top3HTML("TOP 3 | PEDIDOS",topRows("o"),"o",count),
  top3HTML("TOP 3 | SHARE",topRows("share"),"share",percent)
 ].join("");
 const daily=EX.period==="day";
 const chart='<section class="execSectionV1"><div class="execSectionHeadV2"><h3>'+ (daily?"MAIORES CAPTAÇÕES | D-1":EX.period==="week"?"EVOLUÇÃO DIÁRIA DA CAPTAÇÃO":"EVOLUÇÃO SEMANAL DA CAPTAÇÃO")+'</h3>'+
 (daily?'<span class="execTinyV2">5 maiores filiais</span>':'<span class="execTinyV2">Fonte: Gestão/Lojas</span>')+'</div>'+
 (daily?dailyStoreChart(d.rows):drawChart(trendData()))+
 (daily?'<button type="button" class="execSecondaryV2" onclick="execToggleStoresV2()">Ver todas as lojas ▾</button><div id="execAllStoresV2" class="execAllStoresV2" hidden>'+[...d.rows].sort((a,b)=>n(b.c)-n(a.c)).map(x=>'<div><b>L'+e(x.st)+'</b><span>'+money(x.c)+'</span></div>').join("")+'</div>':"")+'</section>';
 const zeroCard=daily?'<div class="execZeroV1"><h4>LOJAS ZERADAS</h4><strong class="execNumBigV2">'+opp.zeros.length+'</strong><small>Com captação igual a zero</small><div class="execZeroStatsV2"><span>Potencial de recuperação</span><b>'+money(opp.potential)+'</b><span>% da meta regional</span><b>'+percent(opp.ratio)+'</b><span>Sem atualização</span><b>'+opp.missing.length+'</b></div></div>':
 '<div class="execZeroV1"><h4>SHARE REGIONAL</h4><strong class="execNumBigV2">'+percent(share)+'</strong><small>'+(EX.period==="week"?"Evolução frente à semana anterior":"Acumulado do mês")+'</small><div class="execShareDeltaV2 '+(trend!=null&&trend<0?"negative":"positive")+'">'+(trend==null?"Sem comparativo FCA":pp(trend))+'</div></div>';
 const attentionTitle=daily?"SITUAÇÃO DAS LOJAS":EX.period==="week"?"MAIORES RETRAÇÕES | FCA":"MENOR SHARE | MÊS";
 const rightCard='<div class="execPriorityV1"><h4>'+attentionTitle+'</h4>'+
 (attention.length?'<div class="execStoreAttentionV2">'+attention.map(x=>'<div class="execAttRowV2"><span><b>L'+e(x.st)+'</b></span><strong class="'+(x.kind==="down"||x.kind==="zero"?"execDangerV1":"")+'">'+e(x.tag)+'</strong></div>').join("")+'</div>':'<div class="execHelpV1">Sem lojas para este critério.</div>')+
 '<small class="execTinyV2">'+(daily?"Sem informação não é loja zerada.":EX.period==="week"?"Comparativo do FCA semanal.":"Lojas ordenadas pelo share do mês.")+'</small></div>';
 const moves=shareMovements();
 const lines=(list,cls)=>list.length?list.map(x=>'<div class="execMoveRowV188"><strong>L'+e(x.st)+'</strong><b class="'+cls+'">'+pp(x.delta)+'</b></div>').join(""):'<div class="execHelpV1">Nenhuma filial neste critério.</div>';
 const movementPanel=daily?"":'<section class="execSectionV1"><div class="execSectionHeadV2"><h3>EVOLUÇÃO DO SHARE | '+(EX.period==="week"?"SEMANA":"MÊS")+'</h3><span class="execTinyV2">'+e(moves.source)+'</span></div>'+
 (moves.available?'<div class="execMovementGridV188"><div><h4 class="execSuccessV1">▲ EVOLUÍRAM</h4>'+lines(moves.up,"execSuccessV1")+'</div><div><h4 class="execDangerV1">▼ RETRAÍRAM</h4>'+lines(moves.down,"execDangerV1")+'</div></div>':'<p class="execHelpV1">'+e(moves.reason||"Comparativo oficial indisponível")+'</p>')+'</section>';
 const podium='<section class="execSectionV1"><div class="execSectionHeadV2"><h3>TOP 3 COLABORADORES | REGIONAL</h3><span class="execTinyV2">Venda captada • '+periodName+'</span></div>'+
 '<div class="execPodiumV1">'+ordered.map((x,i)=>podiumItem(x,[2,1,3][i])).join("")+'</div></section>';
 const warning=!same(ref,currentAsOf())&&EX.period!=="day"?'<p class="execNoticeV2">Referência histórica: os rankings por loja refletem o último acumulado gerencial disponível.</p>':"";
 root.innerHTML=benchmarkMessage+warning+
 '<div class="execReportV1" id="execShareCardV1"><header class="execHeaderV1">'+
 '<div class="execHeadTopV1"><img src="'+logo+'" alt="Riachuelo"><span>Moda que inspira o Brasil</span></div>'+
 '<h1 class="execTitleV1">eStore | CE+PI</h1><p class="execSubV1">PAINEL EXECUTIVO DE RESULTADOS</p>'+
 '<div class="execDateBandV1">'+periodName+' • '+dateText+'</div></header>'+
 '<div class="execBodyV1"><section class="execSectionV1"><div class="execSectionHeadV2"><h3>VISÃO GERAL | CE+PI × EMPRESA</h3></div>'+
 '<div class="execKpisV1"><div class="execKpiV1"><label>CAPTAÇÃO CE+PI</label><strong>'+money(cap)+'</strong><small>Gerencial</small></div>'+
 '<div class="execKpiV1"><label>PEDIDOS</label><strong>'+count(orders)+'</strong><small>CE+PI</small></div>'+
 '<div class="execKpiV1"><label>SHARE REGIONAL</label><strong>'+percent(share)+'</strong><small>Oficial / gerencial</small></div>'+
 '<div class="execKpiV1"><label>ATING. META</label><strong>'+percent(reach)+'</strong><small>Meta eStore</small></div></div>'+
 '<div class="execCompareV1"><div class="execCompareRowsV2">'+regionLine+companyLine+'</div><div class="execDiffV1"><b class="'+(gap!=null&&gap>=0?"execSuccessV1":"")+'">'+pp(gap)+'</b><small>Desvio vs empresa</small></div></div></section>'+
 chart+
 '<section class="execSectionV1"><div class="execSectionHeadV2"><h3>DESTAQUES POR FILIAL</h3></div><div class="execTriGridV1">'+mini+'</div></section>'+
 '<section class="execPairV1">'+zeroCard+rightCard+'</section>'+
 movementPanel+podium+
 '<p class="execSourceV1">Fonte: Gerencial eStore / FCA'+(bench?" • Benchmark empresa importado":" • Empresa pendente")+' • '+dateText+'</p>'+
 '</div><footer class="execFootV1"><img src="'+logo+'" alt="Riachuelo"><span>Moda que inspira o Brasil</span></footer></div>';
}
function toggleStores(){
 const el=document.getElementById("execAllStoresV2");if(!el)return;
 el.hidden=!el.hidden;
}

async function loadExecutiveV1(){
 if(EX.loading)return;
 const root=document.getElementById("execVisualV1");if(!root)return;
 EX.loading=true;EX.error="";
 try{
  const id=mat();
  if(!id)return;
  const [db,fca,ranking,highlights]=await Promise.allSettled([
   exApi({action:"get",matricula:id}),
   (typeof api==="function"?api({action:"fca_dashboard",matricula:id}):Promise.reject(Error("FCA indisponível"))),
   (typeof api==="function"?api({action:"ranking_period",matricula:id,period:EX.period,month:EX.period==="month"?currentAsOf().slice(0,7):undefined,store:w.U?.u?.st}):Promise.reject(Error("Ranking indisponível"))),
   (typeof api==="function"?api({action:"supervisor_highlights",matricula:id,period:EX.period}):Promise.reject(Error("Destaques indisponíveis")))
  ]);
  if(db.status==="rejected")throw db.reason;
  EX.data=db.value;
  EX.fca=fca.status==="fulfilled"?fca.value:null;
  EX.ranking=ranking.status==="fulfilled"?ranking.value:null;
  EX.highlight=highlights.status==="fulfilled"?highlights.value:null;
  const dates=EX.data.daily||[];if(!EX.date||!dates.some(x=>x.date===EX.date))EX.date=dates.at(-1)?.date||currentAsOf();
  render();
 }catch(err){EX.error=String(err.message||err);if(root)root.innerHTML='<div class="execErrorV1">Não foi possível obter o histórico do painel: '+e(EX.error)+' <button onclick="execRefreshV1()">Tentar novamente</button></div>'}
 finally{EX.loading=false}
}
function setPeriod(period){if(!["day","week","month"].includes(period))return;EX.period=period;const view=document.getElementById("view");if(view&&typeof go==="function"){go("executive")}else render()}
function showAdmin(){
 if(!isMain())return notify("Importação restrita ao administrador principal.");
 const slot=document.getElementById("execAdminSlotV1");if(!slot)return;
 const b=periodBounds(EX.period,latestDate());
 const fields=[["company_captured","Captação empresa (R$)"],["company_approved","Aprovado empresa (R$)"],["company_orders","Pedidos empresa"],["company_share","Share empresa (%)"],["regional_captured","Captação CE+PI (R$)"],["regional_orders","Pedidos CE+PI"],["regional_share","Share CE+PI (%)"]];
 EX.draft={period:EX.period,start_date:b.start_date,end_date:b.end_date,company_captured:"",company_approved:"",company_orders:"",company_share:"",regional_captured:"",regional_orders:"",regional_share:""};
 slot.innerHTML='<section class="execAdminV1" id="execBenchmarkAdminV1"><h3>Benchmark oficial | Empresa</h3>'+
 '<p class="execHelpV1">Anexe o print do relatório por regional. A leitura é feita no dispositivo, e os campos precisam ser conferidos antes de salvar. O intervalo do print deve coincidir com as datas abaixo.</p>'+
 '<div class="execInputsV1"><div class="execFieldV1"><label>Período</label><select id="exIn_period"><option value="day">D-1</option><option value="week">Semana</option><option value="month">Mês</option></select></div>'+
 '<div class="execFieldV1"><label>De</label><input id="exIn_start_date" type="date"></div><div class="execFieldV1"><label>Até</label><input id="exIn_end_date" type="date"></div>'+
 fields.map(([key,label])=>'<div class="execFieldV1"><label>'+label+'</label><input id="exIn_'+key+'" inputmode="decimal" placeholder="—"></div>').join("")+'</div>'+
 '<div style="display:flex;flex-wrap:wrap;gap:9px;align-items:center;margin-top:14px"><label class="execActionV1 orange" style="background:#DE7C00"><input id="exPrintFileV1" accept="image/*" type="file" onchange="execReadPrintV1(event)" hidden>▤ Ler print</label><button class="execActionV1" onclick="execSaveBenchmarkV1()">✓ Conferir e salvar</button><button class="execActionV1" style="background:#e2e5df;color:#173F35" onclick="document.getElementById(\'execAdminSlotV1\').innerHTML=\'\'">Fechar</button></div>'+
 '<p class="execHelpV1" id="exOcrStatusV1">Obrigatório: captação e share empresa. Nenhum número é preenchido por estimativa.</p></section>';
 document.getElementById("exIn_period").value=EX.period;
 Object.entries(EX.draft).forEach(([k,v])=>{const x=document.getElementById("exIn_"+k);if(x)x.value=v});
 slot.scrollIntoView({behavior:"smooth",block:"start"});
}
async function loadLib(url,global){if(w[global])return w[global];await new Promise((resolve,reject)=>{const script=document.createElement("script");script.src=url;script.onload=resolve;script.onerror=()=>reject(Error("Biblioteca indisponível."));document.head.appendChild(script)});return w[global]}
function ocrParse(text){
 const lines=String(text||"").split(/\n/).map(x=>x.replace(/\s+/g," ").trim()).filter(Boolean);
 const find=(re)=>lines.find(x=>re.test(x))||"";
 const extract=(line)=>{const cap=(line.match(/R\$\s*[\d.,]+/)||[])[0];const pct=(line.match(/\d+(?:[.,]\d+)?\s*%/g)||[]).at(-1);const od=(line.match(/\s(\d{1,6})\s+R\$\s*[0.,]+/)||[])[1];
 return {captured:cap?numeric(cap):null,share:pct?numeric(pct):null,orders:od?Number(od):null}};
 return {company:extract(find(/^Total\b|^TOTAL\b/i)),regional:extract(find(/^CE\s*\+?\s*PI\b|^CE\s*PI\b/i))};
}
async function readPrint(ev){
 const file=ev?.target?.files?.[0],status=document.getElementById("exOcrStatusV1");
 if(!file)return;if(!file.type.startsWith("image/")||file.size>8e6){notify("Envie uma imagem de até 8 MB.");return}
 if(status)status.textContent="Lendo imagem no dispositivo. A primeira leitura pode levar alguns segundos...";
 try{
  const t=await loadLib("https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js","Tesseract");
  const result=await t.recognize(file,"por+eng");const parsed=ocrParse(result?.data?.text);
  const fields=[["company_captured",parsed.company.captured],["company_orders",parsed.company.orders],["company_share",parsed.company.share],["regional_captured",parsed.regional.captured],["regional_orders",parsed.regional.orders],["regional_share",parsed.regional.share]];
  let found=0;
  fields.forEach(([key,v])=>{const el=document.getElementById("exIn_"+key);if(el&&v!=null){el.value=String(v).replace(".",",");found++}});
  if(status)status.textContent=found?"Leitura preliminar: "+found+" campos identificados. Confira TODOS com o print original antes de salvar.":"Não foi possível identificar as linhas. Digite os campos do relatório manualmente.";
 }catch(err){if(status)status.textContent="Leitura automática indisponível ("+String(err.message||err)+"). Informe os valores manualmente."}
}
async function saveBenchmark(){
 if(!isMain())return notify("Importação não autorizada.");
 const get=(k)=>document.getElementById("exIn_"+k)?.value??"";
 const period=get("period"),start=get("start_date"),end=get("end_date");
 const nr=(key)=>numeric(get(key));const regionalShare=nr("regional_share"),companyShare=nr("company_share");
 if(!start||!end||end<start||companyShare==null||nr("company_captured")==null)return notify("Informe o período, captação e share oficial da empresa.");
 if((period==="day"&&start!==end)||(period==="month"&&start.slice(0,7)!==end.slice(0,7)))return notify("Verifique as datas do período selecionado.");
 const record={period,start_date:start,end_date:end,company_captured:nr("company_captured"),
 company_approved:nr("company_approved"),company_orders:nr("company_orders"),company_share:companyShare/100,
 regional_captured:nr("regional_captured"),regional_orders:nr("regional_orders"),regional_share:regionalShare==null?null:regionalShare/100};
 const promptText="Confirme os dados do print oficial: "+period+" de "+dia(start)+" a "+dia(end)+"; empresa "+money2(record.company_captured)+" • share "+percent(record.company_share)+"; CE+PI "+percent(record.regional_share)+". Publicar?";
 if(!confirm(promptText))return;
 let pwd="";
 try{pwd=typeof adminPwd==="function"?adminPwd():""}catch(_){}
 if(!pwd)pwd=prompt("Senha do administrador principal para publicar o benchmark:")||"";
 if(!pwd)return;
 try{
  const r=await exApi({action:"save",matricula:mat(),password:pwd,record});
  if(!r.ok)throw Error("Importação não confirmada.");
  notify("Benchmark validado e publicado para a regional.");
  document.getElementById("execAdminSlotV1").innerHTML="";
  await loadExecutiveV1();
 }catch(err){alert("Não foi possível salvar: "+String(err.message||err))}
}
function caption(){
 const r=regionalData(),b=r.benchmark,z=opportunities(),ref=latestDate(),period=EX.period==="day"?"D-1":EX.period==="week"?"SEMANA":"MÊS";
 const begin=periodBounds(EX.period,ref).start_date,cap=r.rows.length?r.total.captured:b?.regional_captured??null;
 const orders=r.rows.length?r.total.orders:b?.regional_orders??null,company=b?.company_share??null,desvio=r.share!=null&&company!=null?r.share-n(company):null;
 const lines=[
  "📊 *PAINEL eSTORE | CE+PI • "+period+"*",
  "📅 "+dia(begin)+(EX.period==="day"?"":" a "+dia(ref)),
  "",
  "💰 *Captação:* "+money2(cap),
  "🛍️ *Pedidos:* "+count(orders),
  "📈 *Share CE+PI:* "+percent(r.share),
  "🏢 *Share empresa:* "+percent(company),
  "↕️ *Desvio:* "+pp(desvio)
 ];
 if(EX.period==="day")lines.push("🎯 *Lojas zeradas:* "+z.zeros.length+" • potencial "+money2(z.potential));
 lines.push("","Moda que inspira o Brasil");
 return lines.join("\n");
}

async function imageForCanvas(src){
 if(!src)return null;
 return await new Promise(resolve=>{
  const im=new Image();
  if(!/^data:/i.test(src))im.crossOrigin="anonymous";
  let finished=false;const done=(value)=>{if(finished)return;finished=true;resolve(value)};
  im.onload=()=>done(im);im.onerror=()=>done(null);im.src=src;
  setTimeout(()=>done(null),3500);
 });
}
function paintShare(ctx,data){
 const G="#173F35", O="#DE7C00", S="#F7F5EF", W="#FFFFFF", R="#AB2630",M="#687770", L="#E5E9E4";
 const box=(x,y,w,h,color,rad=18,border=null)=>{
   ctx.beginPath();ctx.roundRect(x,y,w,h,rad);ctx.fillStyle=color;ctx.fill();
   if(border){ctx.lineWidth=1.2;ctx.strokeStyle=border;ctx.stroke()}
 };
 const print=(value,x,y,size=26,bold=false,color=G,align="left")=>{
   ctx.font=(bold?"800 ":"500 ")+size+"px Larsseit,Arial,sans-serif";
   ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline="middle";
   ctx.fillText(String(value??"—"),x,y);ctx.textAlign="left";
 };
 const fit=(value,x,y,size,maxWidth,bold=true,color=G,align="left")=>{
   const v=String(value??"—");let s=size;
   while(s>17){ctx.font=(bold?"800 ":"500 ")+s+"px Larsseit,Arial,sans-serif";
     if(ctx.measureText(v).width<=maxWidth)break;s--}
   print(v,x,y,s,bold,color,align);
 };
 const period=data.period==="day"?"D-1":data.period==="week"?"SEMANA":"MÊS";
 const bottom=data.detailBottom, podiumY=bottom+70;
 ctx.fillStyle=S;ctx.fillRect(0,0,1080,data.height);
 ctx.fillStyle=G;ctx.fillRect(0,0,1080,206);
 box(45,13,143,180,"#F7F5EF",16); // marca vertical do anexo é desenhada sobre essa área no final
 fit("eStore | CE+PI",245,69,54,790,true,W);
 print("PAINEL EXECUTIVO DE RESULTADOS",247,118,25,true,"#D3E4DC");
 box(245,151,575,41,O,9);fit(period+" • "+data.dateLabel,268,171,27,530,true,W);
 ctx.fillStyle=O;ctx.fillRect(0,206,1080,6);

 const metrics=[["CAPTAÇÃO CE+PI",money2(data.captured)],["PEDIDOS",count(data.orders)],["SHARE REGIONAL",percent(data.regionalShare)]];
 metrics.forEach(([title,val],i)=>{
  const x=46+i*335;box(x,239,321,137,W,16,L);
  print(title,x+17,266,22,true,M);
  fit(val,x+17,331,48,280,true,i===2?O:G);
 });
 box(46,397,988,156,W,16,L);
 print("SHARE EMPRESA",71,434,24,true,M);
 fit(percent(data.companyShare),71,496,51,275,true,G);
 ctx.fillStyle=L;ctx.fillRect(394,421,2,108);
 print("DESVIO CE+PI × EMPRESA",424,435,24,true,M);
 fit(pp(data.gap),424,496,57,560,true,data.gap!=null&&data.gap>=0?"#188257":R);

 print("DESTAQUES DA REGIONAL",52,595,29,true,G);
 const cats=[["CAPTAÇÃO",data.topCap,"c",money],["PEDIDOS",data.topOrders,"o",count],["SHARE",data.topShare,"share",percent]];
 cats.forEach(([title,items,key,fmt],i)=>{
  const x=46+i*335;box(x,628,321,278,W,16,L);
  ctx.fillStyle=O;ctx.fillRect(x+18,654,5,30);
  print("TOP 3 "+title,x+34,669,22,true,G);
  for(let j=0;j<3;j++){
   const item=items[j],y=722+j*58;
   box(x+18,y-20,38,38,j===0?O:j===1?"#969F9B":"#B78759",19);
   print(j+1,x+37,y,20,true,W,"center");
   if(item){fit("L"+item.st,x+68,y,23,91,true,G);fit(fmt(item[key]),x+306,y,23,133,true,G,"right")}
   else print("—",x+68,y,24,false,M);
  }
 });

 box(46,927,988,data.detailHeight,W,18,L);
 if(data.period==="day"){
  print("LOJAS ZERADAS | D-1",71,959,28,true,G);
  print("Zeradas:",73,1001,23,false,M);
  print(String(data.zeros),200,1001,31,true,R);
  print("Potencial:",312,1001,23,false,M);
  fit(money2(data.potential),455,1001,29,235,true,G);
  print("Impacto:",724,1001,23,false,M);
  fit(percent(data.ratio),840,1001,29,155,true,R);
  print("% da meta regional não contribuída",71,1041,21,false,M);
  print("RELAÇÃO DAS FILIAIS",71,1081,21,true,G);
  const parts=data.zeroStores.map(x=>"L"+x);
  if(parts.length){
   const maxPer=9;
   for(let i=0;i<parts.length;i+=maxPer)fit(parts.slice(i,i+maxPer).join("  •  "),71,1114+(i/maxPer)*28,22,929,false,G);
  }else print("Nenhuma loja zerada com input confirmado",71,1114,20,false,M);
  if(data.pending>0)fit(data.pending+" filial(is) sem input, não classificadas como zeradas",71,data.detailBottom-20,19,921,false,R);
 }else{
  const mv=data.movements||{available:false,up:[],down:[],reason:"Comparativo indisponível"};
  print("EVOLUÇÃO DO SHARE | "+(data.period==="week"?"SEMANA":"MÊS"),72,959,28,true,G);
  print(mv.source||"Comparação oficial",73,994,20,false,M);
  if(!mv.available){
    fit(mv.reason||"Aguardando dados oficiais comparáveis",73,1050,25,918,false,M);
  }else{
    print("▲ EVOLUÍRAM",73,1042,24,true,"#14835C");
    print("▼ RETRAÍRAM",562,1042,24,true,R);
    const countRows=Math.max(mv.up.length,mv.down.length,1);
    for(let k=0;k<countRows;k++){
      const y=1080+k*29,u=mv.up[k],d=mv.down[k];
      if(u){print("L"+u.st,77,y,22,true,G);fit(pp(u.delta),485,y,22,305,true,"#14835C","right")}
      if(d){print("L"+d.st,566,y,22,true,G);fit(pp(d.delta),1015,y,22,290,true,R,"right")}
    }
    if(!mv.up.length)print("Nenhuma evolução registrada",75,1080,20,false,M);
    if(!mv.down.length)print("Nenhuma retração registrada",565,1080,20,false,M);
  }
 }

 print("TOP 3 VENDEDORES | CE+PI",52,bottom+37,28,true,G);
 const order=[data.collabs[1],data.collabs[0],data.collabs[2]],no=[2,1,3];
 for(let i=0;i<3;i++){
  const x=46+335*i,person=order[i];
  box(x,podiumY,321,302,i===1?"#FBE1AB":"#EFF0EC",19);
  box(x+134,podiumY+16,52,39,i===1?O:"#466964",17);
  print(no[i]+"º",x+160,podiumY+36,24,true,W,"center");
  if(!person)continue;
  const avatar=data.avatars?.[i];
  ctx.save();ctx.beginPath();ctx.arc(x+160,podiumY+112,48,0,Math.PI*2);ctx.clip();
  if(avatar)ctx.drawImage(avatar,x+112,podiumY+64,96,96);
  else{ctx.fillStyle="#D4E3D9";ctx.fillRect(x+112,podiumY+64,96,96);print(displayColName(person).slice(0,1),x+160,podiumY+113,37,true,G,"center")}
  ctx.restore();
  fit(displayColName(person),x+160,podiumY+192,29,292,true,G,"center");
  fit("RIA "+person.st,x+160,podiumY+236,25,281,true,"#466964","center");
  fit(money2(person.c),x+160,podiumY+280,35,293,true,G,"center");
 }
 ctx.fillStyle=G;ctx.fillRect(0,data.height-90,1080,90);
 print("MODA QUE INSPIRA O BRASIL",58,data.height-56,26,true,W);
 print("eStore CE+PI • "+period,58,data.height-22,19,false,"#C5DAD0");
}
async function shareCard(){
 if(!EX.data)return notify("Aguarde o carregamento dos indicadores.");
 const d=regionalData(),b=d.benchmark,cap=d.rows.length?d.total.captured:b?.regional_captured??null;
 const orders=d.rows.length?d.total.orders:b?.regional_orders??null,opp=opportunities();
 const movements=shareMovements();
 const detailHeight=EX.period==="day"?246:(movements.available?Math.max(235,140+Math.max(movements.up.length,movements.down.length,1)*29):225);
 const detailBottom=927+detailHeight,cardHeight=detailBottom+70+302+118;
 const model={period:EX.period,dateLabel:EX.period==="day"?dia(latestDate()):dia(periodBounds(EX.period,latestDate()).start_date)+" a "+dia(latestDate()),
  captured:cap,orders,regionalShare:d.share,companyShare:b?.company_share??null,
  gap:d.share!=null&&b?.company_share!=null?d.share-n(b.company_share):null,
  topCap:topRows("c"),topOrders:topRows("o"),topShare:topRows("share"),
  zeros:opp.zeros.length,zeroStores:opp.zeros.map(x=>x.st),ratio:opp.ratio,pending:opp.missing.length,potential:opp.potential,
  movements,detailHeight,detailBottom,height:cardHeight,collabs:topCollaborators()};
 const ordered=[model.collabs[1],model.collabs[0],model.collabs[2]];
 try{
  const canvas=document.createElement("canvas");canvas.width=1080;canvas.height=model.height;
  const ctx=canvas.getContext("2d",{alpha:false});if(!ctx)throw Error("Canvas indisponível");
  await document.fonts?.ready;
  model.avatars=await Promise.all(ordered.map(x=>x?imageForCanvas(colPhoto(x)):Promise.resolve(null)));
  paintShare(ctx,model);
  const ria=await imageForCanvas(verticalLogo);
  if(ria)ctx.drawImage(ria,59,22,118,158);
  else{ctx.font="900 57px Arial";ctx.fillStyle="#173F35";ctx.fillText("RIA",58,102)}
  const blob=await new Promise(r=>canvas.toBlob(r,"image/png",.98));
  if(!blob)throw Error("Falha ao gerar PNG");
  const file=new File([blob],"Painel_eStore_CEPI_"+EX.period+"_"+latestDate()+".png",{type:"image/png"});
  if(navigator.canShare?.({files:[file]})&&navigator.share){
   try{await navigator.share({title:"Painel Executivo eStore | CE+PI",files:[file],text:caption()});return}catch(err){if(err.name==="AbortError")return}
  }
  const link=URL.createObjectURL(blob),a=document.createElement("a");a.href=link;a.download=file.name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(link),4000);
  try{await navigator.clipboard.writeText(caption());notify("Card compacto salvo e resumo copiado.")}catch(_){notify("Card compacto salvo para compartilhar.")}
 }catch(err){alert("Não foi possível gerar o card: "+String(err.message||err))}
}

w.executivePanelViewV1=executivePanelViewV1;
w.loadExecutiveV1=loadExecutiveV1;
w.execSetPeriodV1=setPeriod;
w.execRefreshV1=loadExecutiveV1;
w.execShowAdminV1=showAdmin;
w.execSaveBenchmarkV1=saveBenchmark;
w.execReadPrintV1=readPrint;
w.execShareV1=shareCard;
w.execShareCaptionV1=caption;
w.execToggleStoresV2=toggleStores;
})(window);
