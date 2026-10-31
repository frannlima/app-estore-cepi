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
const impactPercent=(v)=>v==null?"—":(n(v)*100).toLocaleString("pt-BR",{minimumFractionDigits:1,maximumFractionDigits:1})+"%";
const pp=(v)=>v==null?"—":(v>0?"+":"")+(n(v)*100).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})+" p.p.";
const dia=(v)=>v?String(v).split("-").reverse().join("/"):"—";
function execZeroDateTag(date){
 const weekday=new Date(String(date)+"T12:00:00Z").getUTCDay();
 const mark=weekday===1?"eDay":weekday===6?"SÁB":weekday===0?"DOM":"";
 const cls=weekday===1?"execDateEdayV4":weekday===6?"execDateSaturdayV4":weekday===0?"execDateSundayV4":"";
 return '<span class="execZeroDateV4 '+cls+'" title="'+e(dia(date))+(mark?' • '+mark:'')+'">'+e(dia(date).slice(0,5))+(mark?'<em>'+mark+'</em>':'')+'</span>';
}
const isoWeek=(d)=>{let x=new Date(d+"T12:00:00Z"),z=x.getUTCDay()||7;x.setUTCDate(x.getUTCDate()-z+1);return x.toISOString().slice(0,10)};
function weekNumber(d){const x=new Date(d+"T12:00:00Z"),t=new Date(Date.UTC(x.getUTCFullYear(),x.getUTCMonth(),x.getUTCDate()));const day=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-day);const first=new Date(Date.UTC(t.getUTCFullYear(),0,1));return Math.ceil((((t-first)/86400000)+1)/7)}
const firstMonth=(d)=>d.slice(0,7)+"-01";
const same=(a,b)=>String(a||"")===String(b||"");
const logo="./assets/riachuelo-logo-horizontal-oficial-white-v133.svg";
const riaLogo="./assets/ria-marca-executivo.svg";
const executiveHeaderLogo="./assets/ria-vertical-header-light-v195.svg";
function notify(msg){let el=document.createElement("div");el.className="execToastV1";el.textContent=msg;document.body.append(el);setTimeout(()=>el.remove(),4700)}
async function exApi(body){const r=await fetch(API_EXEC,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});const j=await r.json().catch(()=>({}));if(!r.ok||j.error)throw Error(j.error||"Falha de comunicação");return j}
function storeName(st){try{return typeof storeDisplayName==="function"?storeDisplayName(st):""}catch(_){return""}}
function mat(){return w.U?.u?.id||typeof U!=="undefined"&&U?.u?.id||""}
function isLeader(){try{return typeof isLead==="function"&&isLead()}catch(_){return false}}
function isMain(){try{return typeof isMasterAdmin==="function"&&isMasterAdmin()&&!isDemo()}catch(_){return false}}
function isGuest(){try{return typeof isDemo==="function"&&isDemo()}catch(_){return true}}
function currentAsOf(){return String(w.COMMON?.asof||w.DB?.asof||"")}
function previousBusinessDate(){
 const d=new Date(Date.now()-86400000);
 const parts=new Intl.DateTimeFormat("en-US",{timeZone:"America/Fortaleza",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(d);
 const v=k=>parts.find(p=>p.type===k)?.value||"";
 return v("year")+"-"+v("month")+"-"+v("day");
}
function latestDate(){
 const y=previousBusinessDate();
 if(EX.period==="day")return y;
 const start=EX.period==="week"?isoWeek(y):firstMonth(y);
 const snap=(EX.data?.benchmarks||[]).filter(b=>b.period===EX.period&&b.end_date>=start&&b.end_date<=y&&b.start_date>=start&&validBenchmark(b,0))
 .sort((a,b)=>String(b.end_date).localeCompare(String(a.end_date)))[0];
 return snap?.end_date||y;
}
function periodBounds(period,date){
 if(period==="day")return {period,start_date:date,end_date:date};
 const first=period==="week"?isoWeek(date):firstMonth(date);
 const snap=(EX.data?.benchmarks||[]).find(b=>b.period===period&&b.end_date===date&&b.start_date>=first&&b.start_date<=date&&validBenchmark(b,0));
 return {period,start_date:snap?.start_date||first,end_date:date};
}
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
 const date=latestDate(),bounds=periodBounds(EX.period,date),b=matchBenchmark();
 let rows=[],strict=false;
 if(EX.period==="day"){
  rows=dailyRows(date);
  strict=rows.length===STORES.length;
 }else{
  const days=(EX.data?.daily||[]).filter(x=>x.date>=bounds.start_date&&x.date<=bounds.end_date);
  const byStore=new Map();
  for(const day of days)for(const x of day.stores||[]){
   if(!STORES.includes(x.st))continue;
   const old=byStore.get(x.st)||{st:x.st,c:0,o:0,a:0,target:0,share:null};
   old.c+=n(x.c);old.o+=n(x.o);old.a+=n(x.a);if(x.target!=null)old.target+=n(x.target);
   byStore.set(x.st,old);
  }
  rows=[...byStore.values()];
  const expected=Math.round((new Date(bounds.end_date+"T12:00:00Z")-new Date(bounds.start_date+"T12:00:00Z"))/86400000)+1;
  strict=days.length===expected&&days.every(d=>d.stores?.length===STORES.length);
 }
 const total=rows.reduce((a,x)=>({captured:a.captured+n(x.c),orders:a.orders+n(x.o),approved:a.approved+n(x.a),base:a.base+n(x.ge),target:a.target+n(x.target)}),{captured:0,orders:0,approved:0,base:0,target:0});
 let share=EX.period==="day"&&total.base>0?total.captured/total.base:null;
 if(b?.regional_share!=null)share=n(b.regional_share);
 if(EX.period!=="day"){
  total.captured=b?.regional_captured!=null?n(b.regional_captured):null;
  total.orders=b?.regional_orders!=null?n(b.regional_orders):null;
 }
 if(EX.period==="day"&&!rows.length){total.captured=null;total.orders=null;}
 return {rows,strict,total,share,delta:null,benchmark:b};
}
function activeStores(){const day=dailyRows(latestDate());const r=regionalData();return EX.period==="day"?(day.length?day:r.rows):r.rows}
function officialShareRows(){
 const date=latestDate(),bounds=periodBounds(EX.period,date);
 if(EX.period==="day")return dailyRows(date).map(x=>({...x,share:x.share==null?null:Number(x.share)}));
 const byStore=new Map();
 for(const d of (EX.data?.daily||[]).filter(x=>x.date>=bounds.start_date&&x.date<=bounds.end_date)){
  for(const x of d.stores||[]){
   if(!STORES.includes(String(x.st)))continue;
   const old=byStore.get(x.st)||{st:x.st,c:0,o:0,sales:0,valid:false};
   const captured=Number(x.c),share=x.share==null?NaN:Number(x.share);
   old.c+=Number.isFinite(captured)?captured:0;old.o+=n(x.o);
   if(Number.isFinite(share)&&share>0&&captured>=0){old.sales+=captured/share;old.valid=true}
   byStore.set(x.st,old);
  }
 }
 const month=EX.data?.official_months?.find(x=>x.month===date.slice(0,7)&&x.through===bounds.end_date);
 const weekRows=EX.period==="week"?(EX.data?.official_weeks||[]).filter(x=>x.week_start===bounds.start_date&&x.week_end===bounds.end_date):[];
 const officialWeek=new Map(weekRows.map(x=>[String(x.store_code||"").padStart(3,"0"),x.share]));
 return [...byStore.values()].map(x=>{
  const official=EX.period==="month"?month?.stores?.[x.st]:EX.period==="week"?officialWeek.get(x.st):null;
  const share=official!=null&&Number.isFinite(Number(official))?Number(official):x.valid&&x.sales>0?x.c/x.sales:null;
  return {...x,share};
 });
}
function topRows(type){
 const rows=type==="share"?officialShareRows():activeStores();
 return [...rows].filter(x=>type==="share"?(x.share!=null&&Number.isFinite(Number(x.share))&&Number(x.share)>=0):n(x[type])>0)
 .sort((a,b)=>n(b[type])-n(a[type])||String(a.st).localeCompare(String(b.st))).slice(0,3);
}
function topCollaborators(){return [...new Map((EX.ranking?.regional||[]).filter(x=>n(x.c)>0).map(x=>[String(x.id||x.matricula||x.name)+":"+String(x.st),x])).values()].sort((a,b)=>n(b.c)-n(a.c)).slice(0,10)}
/* Zeragens: dias-filial reais e oportunidade baseada na entrega observada, nunca 1% da meta. */
function opportunities(){
 const bounds=periodBounds(EX.period,latestDate()),start=bounds.start_date,end=bounds.end_date;
 const entries=(EX.data?.daily||[]).filter(x=>x.date<=end).sort((a,b)=>a.date.localeCompare(b.date));
 const daily=new Map(entries.filter(x=>x.date>=start).map(x=>[x.date,x]));
 const byStore=new Map(),incompleteDays=[],daysMissing=[],allDates=[],history=new Map();
 let regionCaptured=0,daysCovered=0,zeroDays=0,missingEstimates=0,validStoreDays=0,missingStoreDays=0;
 if(!start||!end)return {zeros:[],missing:[],potential:null,ratio:null,regionalCaptured:null,daysCovered:0,daysExpected:0,zeroDays:0,complete:false,missingEstimates:0};
 // Média conservadora: pedidos/dia observado (inclusive dias zerados) × ticket histórico real.
 // Janela dos 42 dias anteriores ao início, sem incluir o período analisado. Nenhuma meta ou share presumido.
 const lookback=new Date(start+"T12:00:00Z");lookback.setUTCDate(lookback.getUTCDate()-42);
 const historyStart=lookback.toISOString().slice(0,10);
 for(const day of entries.filter(d=>d.date>=historyStart&&d.date<start)){
  for(const x of day.stores||[]){
   const st=String(x.st||"").padStart(3,"0"),c=Number(x.c),o=Number(x.o);
   if(!STORES.includes(st)||!(x.target!=null&&Number(x.target)>0)||!Number.isFinite(c)||!Number.isFinite(o)||c<0||o<0)continue;
   const v=history.get(st)||{observed:0,captured:0,orders:0,activeDays:0};
   v.observed++;v.captured+=c;v.orders+=o;if(o>0)v.activeDays++;
   history.set(st,v);
  }
 }
 const cursor=new Date(start+"T12:00:00Z"),last=new Date(end+"T12:00:00Z");
 for(let count=0;cursor<=last&&count<35;count++,cursor.setUTCDate(cursor.getUTCDate()+1)){
  const date=cursor.toISOString().slice(0,10);allDates.push(date);
  const entry=daily.get(date);
  if(!entry){daysMissing.push(date);continue}
  const stores=new Map((entry.stores||[]).filter(x=>STORES.includes(String(x.st||"").padStart(3,"0"))).map(x=>[String(x.st).padStart(3,"0"),x]));
  if(stores.size!==STORES.length)incompleteDays.push(date);
  missingStoreDays+=STORES.length-stores.size;
  daysCovered++;
  for(const [st,item] of stores){
   const captured=Number(item.c),orders=Number(item.o);
   if(!Number.isFinite(captured)||!Number.isFinite(orders)||captured<0||orders<0){
    if(!incompleteDays.includes(date))incompleteDays.push(date);
    continue;
   }
   const eligible=item.target!=null&&Number.isFinite(Number(item.target))&&Number(item.target)>0;
   if(!eligible)continue; // Sem meta positiva não há oportunidade de venda nem zeragem.
   validStoreDays++;
   regionCaptured+=captured;
   if(captured!==0||orders!==0)continue;
   let zero=byStore.get(st);
   if(!zero){zero={st,days:0,potential:0,missing:0,dates:[]};byStore.set(st,zero)}
   zero.days++;zero.dates.push(date);zeroDays++;
   const h=history.get(st);
   // Exigir quatro dias elegíveis observados e ao menos um pedido: sem histórico suficiente, não estimar.
   if(!h||h.observed<4||h.orders<=0){zero.missing++;missingEstimates++;continue}
   const averageDailyCapture=h.captured/h.observed;
   zero.potential+=averageDailyCapture;
  }
 }
 const complete=daysMissing.length===0&&incompleteDays.length===0&&daysCovered===allDates.length&&daysCovered>0;
 const official=matchBenchmark()?.regional_captured;
 const regionalCaptured=official!=null&&Number.isFinite(Number(official))&&Number(official)>0?Number(official):(complete&&regionCaptured>0?regionCaptured:null);
 const rawPotential=daysCovered>0?[...byStore.values()].reduce((sum,x)=>sum+x.potential,0):null;
 const opportunityReliable=missingEstimates===0;
 const potential=rawPotential;
 const denominator=potential!=null&&regionalCaptured!=null?regionalCaptured+potential:null;
 const zeros=[...byStore.values()].map(x=>{
  const storePotential=x.missing?null:x.potential;
  return {...x,potential:storePotential,impact:storePotential!=null&&denominator>0?storePotential/denominator:null};
 }).sort((a,b)=>b.days-a.days||(b.potential??0)-(a.potential??0)||a.st.localeCompare(b.st));
 const ratio=denominator>0?potential/denominator:null;
 const missing=EX.period==="day"?STORES.filter(st=>!daily.get(end)?.stores?.some(x=>String(x.st||"").padStart(3,"0")===st)):[];
 return {zeros,missing,potential,ratio,regionalCaptured,daysCovered,daysExpected:allDates.length,
  zeroDays,opportunityReliable,validStoreDays,missingStoreDays,zeroRate:validStoreDays>0?zeroDays/validStoreDays:null,complete,missingEstimates,missingGoals:missingEstimates,daysMissing,incompleteDays};
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
 for(const day of days){
  const key=EX.period==="month"?isoWeek(day.date):day.date;
  const entry=grouped.get(key)||{date:day.date,until:day.date,captured:0,coverage:0};
  entry.captured+=(day.stores||[]).filter(x=>STORES.includes(x.st)).reduce((a,x)=>a+n(x.c),0);
  entry.until=day.date;entry.coverage++;
  grouped.set(key,entry);
 }
 const weekly=(EX.data?.cepi_weekly?.length?EX.data.cepi_weekly:EX.data?.competitive_weeks||[]).filter(x=>String(x.regional||"").replace(/\s+/g,"").toUpperCase()==="CE+PI"||String(x.regional||"").replace(/\s+/g,"").toUpperCase()==="CEPI");
 const benchmarks=(EX.data?.benchmarks||[]).filter(b=>b.period===(EX.period==="month"?"week":"day"));
 return [...grouped.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([key,x])=>{
  const boundsStart=EX.period==="month"?key:x.date;
  const relevant=benchmarks.filter(b=>b.start_date===boundsStart&&b.end_date<=x.until&&b.regional_share!=null&&Number.isFinite(Number(b.regional_share))).sort((a,b)=>String(b.end_date).localeCompare(String(a.end_date)));
  const latestOfficial=relevant[0]||null;
  const historic=EX.period==="month"?weekly.filter(w=>String(w.week_start)===key&&w.share!=null&&Number.isFinite(Number(w.share))).sort((a,b)=>String(b.week_end).localeCompare(String(a.week_end)))[0]:null;
  // Snapshot mensal do gráfico: benchmark apenas quando é mais recente que o histórico semanal.
  const share=latestOfficial&&(!historic||String(latestOfficial.end_date)>=String(historic.week_end)||String(historic.week_end)>end)?Number(latestOfficial.regional_share):historic?Number(historic.share):null;
  const national=latestOfficial?.company_share!=null?Number(latestOfficial.company_share):null;
  return {...x,share,companyShare:Number.isFinite(national)?national:null,shareSource:latestOfficial?"gerencial semanal CE+PI":historic?"histórico semanal CE+PI":null,shareThrough:latestOfficial?.end_date||historic?.week_end||null};
 });
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
 const medal=pos===1?'🏅':pos===2?'🥈':'🥉';
 const place='<span class="execPlaceV2 execPlaceWithMedalV3" aria-label="'+pos+'º lugar"><span class="execRankMedalV3" aria-hidden="true">'+medal+'</span><strong>'+pos+'º</strong></span>';
 const store='<span class="execStoreTextV3">L '+e(String(p.st||'').padStart(3,'0'))+'</span>';
 return '<div class="execPodiumPersonV2 place'+pos+'">'+place+
 '<div class="execPhotoV2">'+(photo?'<img src="'+e(photo)+'" alt="Foto do colaborador" loading="lazy" referrerpolicy="no-referrer">':'<span>'+e(initials)+'</span>')+'</div>'+
 '<b class="execNameV2">'+e(name)+'</b>'+store+'<strong class="execAmountV2">'+money(p.c)+'</strong></div>';
}
function top3HTML(title,rows,key,format){
 return '<div class="execMiniV1"><h4>'+e(title)+'</h4><div class="execMiniListV2">'+(
 rows.length?rows.map((x,i)=>'<div class="execMiniRowV1"><span class="execMedalV1">'+(i+1)+'</span><b class="execStoreV2">L'+e(x.st)+'</b><strong>'+format(x[key])+'</strong></div>').join(""):'<span class="execHelpV1">Aguardando dados</span>'
 )+'</div></div>';
}
function drawChart(rows){
 if(!rows.length)return '<p class="execHelpV1">Sem histórico oficial no intervalo.</p>';
 const max=Math.max(1,...rows.map(r=>n(r.captured))), width=850, base=245, step=800/rows.length;
 let svg='<svg viewBox="0 0 850 295" class="execChartV1" role="img" aria-label="Captação e share CE+PI por intervalo">';
 rows.forEach((r,i)=>{
  const x=25+i*step+step/2,h=n(r.captured)/max*155,y=base-h;
  const warn=i>0&&r.captured<rows[i-1].captured*.75;
  svg+='<rect x="'+(x-22)+'" y="'+y+'" width="44" height="'+h+'" rx="5" fill="'+(warn?'#C83732':'#173F35')+'"/>';
  svg+='<text x="'+x+'" y="'+(y-10)+'" font-size="12" text-anchor="middle" fill="#173F35">'+Math.round(r.captured).toLocaleString("pt-BR")+'</text>';
  if(r.share!=null&&r.companyShare!=null){
   const difference=Number(r.share)-Number(r.companyShare),symbol=difference>0.000001?'▲':difference< -0.000001?'▼':'◆';
   const color=symbol==='▲'?'#168252':symbol==='▼'?'#C83732':'#66746b';
   svg+='<text x="'+(x+29)+'" y="'+Math.max(18,y-10)+'" font-size="15" font-weight="800" text-anchor="middle" fill="'+color+'">'+symbol+'</text>';
  }
  svg+='<text x="'+x+'" y="275" font-size="12" text-anchor="middle" fill="#52635B">'+(EX.period==="month"?"Sem "+weekNumber(r.date):dia(r.date).slice(0,5))+'</text>';
 });
 const pts=rows.map((r,i)=>r.share==null?null:{x:25+i*step+step/2,y:65+105*(1-Math.min(1,n(r.share)/Math.max(.0001,...rows.map(t=>n(t.share))))),share:r.share}).filter(Boolean);
 if(pts.length){svg+='<polyline points="'+pts.map(p=>p.x+','+p.y).join(' ')+'" fill="none" stroke="#BFA66A" stroke-width="3"/>';
 pts.forEach(p=>{const index=Math.round((p.x-25)/step-.5),r=rows[index],barTop=r?base-n(r.captured)/max*155:0;const above=Math.abs((p.y-10)-(barTop-10))<19;svg+='<circle cx="'+p.x+'" cy="'+p.y+'" r="4" fill="#BFA66A" stroke="#fff" stroke-width="1.5"/><text x="'+p.x+'" y="'+(above?p.y+17:p.y-13)+'" text-anchor="middle" font-size="11" fill="#786234">'+(p.share*100).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})+'%</text>'});}
 return svg+'</svg><p class="execTinyV2">Valores financeiros sem abreviação. Vermelho: queda acima de 25% em relação ao intervalo anterior. Linha: share semanal oficial CE+PI; ▲/▼ compara com a média empresa da mesma referência. Sem valor oficial, não se estima share.</p>';
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
 return '<div class="execPageV1"><div class="execToolbarV1"><div class="execSegmentV1"><button class="'+(EX.period==="day"?"on":"")+'" onclick="execSetPeriodV1(\'day\')">D-1</button><button class="'+(EX.period==="week"?"on":"")+'" onclick="execSetPeriodV1(\'week\')">Semana</button><button class="'+(EX.period==="month"?"on":"")+'" onclick="execSetPeriodV1(\'month\')">Mês</button></div><div style="display:flex;flex-wrap:wrap;gap:7px"><button class="light" onclick="execRefreshV1()">↻ Atualizar</button>'+(isMain()?'<button class="orange" onclick="execShowAdminV1()">＋ Importar Semana/Mês</button>':'')+'<button onclick="execShareV1()">↗ Card do período</button><button class="orange" onclick="execShareMondayV1()">↗ Resumo D-1 + Semana + Mês</button></div></div><div id="execMessageV1"></div><div id="execVisualV1"><div class="execSectionV1">Consolidando relatórios oficiais e o FCA...</div></div><div id="execAdminSlotV1"></div></div>';
}

// Radar competitivo alimentado pelo histórico oficial das semanas importadas.
// Compara a semana atual (inclusive parcial) com a anterior, exigindo 21 regionais comparáveis,
// mesmo quando a semana corrente ainda não foi importada.
function competitiveRadar(){
 const selected=EX.period;
 const historical=selected==="week"&&Array.isArray(EX.data?.competitive_weeks)?EX.data.competitive_weeks:[];
 const pct4=v=>v==null?"—":(Number(v)*100).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})+"%";
 const pp4=v=>v==null?"—":(v>0?"+":"")+(Number(v)*100).toLocaleString("pt-BR",{minimumFractionDigits:Math.abs(v)>0&&Math.abs(v)<.00005?4:3,maximumFractionDigits:4})+" p.p.";
 const groups=new Map();
 const canon=v=>String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g,"").toUpperCase();
 for(const item of historical){
  const start=String(item?.week_start||""),region=String(item?.regional||"").trim(),share=Number(item?.share);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(start)||!region||item.share==null||!Number.isFinite(share)||share<0||share>1)continue;
  if(!groups.has(start))groups.set(start,new Map());
  groups.get(start).set(canon(region),{region,share,captured:item.captured==null?null:Number(item.captured),end:String(item.week_end||"")});
 }
 if(selected!=="week")return competitivePeriodRadar(selected);
 let pair=null;
 for(const start of [...groups.keys()].sort().reverse()){
  const date=new Date(start+"T12:00:00Z");
  date.setUTCDate(date.getUTCDate()-7);
  const previousStart=date.toISOString().slice(0,10);
  const now=groups.get(start),before=groups.get(previousStart);
  if(!before||now.size<21||before.size<21)continue;
  const shared=[...now.keys()].filter(k=>before.has(k));
  if(shared.length<21||!shared.some(k=>k==="CE+PI"||k==="CEPI"))continue;
  pair={start,previousStart,now,before,shared,end:[...now.values()][0]?.end||""};break;
 }
 const rows=pair?pair.shared.map(k=>{
  const a=pair.before.get(k),b=pair.now.get(k);
  return {region:b.region,before:a.share,now:b.share,delta:b.share-a.share,captured:b.captured};
 }).sort((a,b)=>a.delta-b.delta||a.region.localeCompare(b.region,"pt-BR")):[];
 const cepi=rows.find(x=>/^(CE\s*\+\s*PI|CEPI)$/i.test(x.region.trim()));
 const previous=cepi?cepi.before:null,current=cepi?cepi.now:null,delta=cepi?cepi.delta:null;
 const cutoffCount=5,cutoff=rows.length>=cutoffCount?rows[cutoffCount-1].delta:null;
 const poorer=cepi?rows.filter(x=>x.delta<cepi.delta-0.0000000001).length:null;
 const tied=cepi?rows.filter(x=>Math.abs(x.delta-cepi.delta)<0.0000000001).length:0;
 const rank=poorer==null?null:poorer+1,lastRank=rank==null?null:rank+tied-1;
 const definiteRisk=rank!=null&&lastRank<=cutoffCount,tieRisk=rank!=null&&rank<=cutoffCount&&!definiteRisk;
 const safe=rank!=null&&rank>cutoffCount;
 const label=!rows.length?"Aguardando duas semanas comparáveis do gerencial por regional":safe?"CE+PI fora das 5 menores evoluções":tieRisk?"CE+PI empatada na linha de corte":definiteRisk?"CE+PI entre as 5 menores evoluções":"Acompanhamento semanal";
 const status=!rows.length?"neutral":safe?"ok":"danger";
 const capture=cepi?.captured;
 const sales=cepi&&cepi.now>0&&Number.isFinite(capture)&&capture>=0?capture/cepi.now:null;
 // Exercício contrafactual, não altera semanas fechadas nem prevê outras regionais.
 const target=cutoff!=null&&previous!=null?previous+cutoff+0.0000001:null;
 const need=target!=null&&Number.isFinite(sales)&&sales>0&&Number.isFinite(capture)?
  Math.max(0,Math.ceil((target*sales-capture)*100)/100):null;
 const rankLabel=rank==null?"—":(lastRank>rank?rank+"º–"+lastRank+"º":rank+"º")+" / "+rows.length;
 const textDelta=delta==null?"—":(delta>0?"▲ ":delta<0?"▼ ":"= ")+pp4(delta);
 const latestWeekBenchmark=(EX.data?.benchmarks||[]).filter(x=>x.period==="week"&&x.start_date===pair?.start).sort((a,b)=>String(b.end_date||"").localeCompare(String(a.end_date||"")))[0];
 const importedThrough=latestWeekBenchmark?.end_date||pair?.end||"";
 const partial=!!pair&&!!importedThrough&&importedThrough<pair.end;
 const weekCaption=pair?"S"+weekNumber(pair.start)+" • "+dia(pair.start)+" a "+dia(partial?importedThrough:pair.end)+(partial?" • PARCIAL":" • FECHADA")+" vs S"+weekNumber(pair.previousStart):"Sem histórico comparável";
 const topFive=rows.length?'<div class="execRadarTopV5"><strong>5 REGIONAIS COM MENOR EVOLUÇÃO</strong><div class="execRadarRankV4">'+
  rows.slice(0,5).map((x,i)=>'<div><span>'+(i+1)+'º • '+e(x.region)+(i===4?' • linha de corte':'')+'</span><b class="'+(x.delta<0?"execDangerV1":"execSuccessV1")+'">'+pp4(x.delta)+'</b></div>').join("")+
  '</div></div>':"";
 const fullRank=rows.length?'<div class="execRadarRankV4">'+rows.map((x,i)=>
  '<div><span>'+(i+1)+'º • '+e(x.region)+'</span><span>Antes: '+pct4(x.before)+' | Atual: '+pct4(x.now)+'</span><b class="'+(x.delta<0?"execDangerV1":"execSuccessV1")+'">'+pp4(x.delta)+'</b></div>').join("")+'</div>':
  '<p class="execHelpV1">Os dados de semanas completas serão usados automaticamente após a carga gerencial nível empresa.</p>';
 return '<section class="execSectionV1 execRadarV4" aria-label="Radar competitivo share semanal">'+
  '<div class="execSectionHeadV2"><h3>RADAR COMPETITIVO | SHARE SEMANAL</h3><span class="execTinyV2">'+e(weekCaption)+'</span></div>'+
  '<div class="execRadarGridV4">'+
  '<div><small>SEMANA ANTERIOR • CE+PI</small><strong>'+pct4(previous)+'</strong></div>'+
  '<div><small>SHARE ATUAL • CE+PI</small><strong>'+pct4(current)+'</strong></div>'+
  '<div><small>EVOLUÇÃO • CE+PI</small><strong class="'+(delta!=null&&delta<0?"execDangerV1":"execSuccessV1")+'">'+textDelta+'</strong></div>'+
  '<div><small>POSIÇÃO POR MENOR EVOLUÇÃO</small><strong>'+rankLabel+'</strong></div></div>'+
  '<div class="execRadarActionV4 '+status+'"><strong>'+e(label)+'</strong><span>Captação adicional teórica para superar a linha de corte: <b>'+money2(need)+'</b></span></div>'+
  topFive+
  '<p class="execTinyV2">Fonte: histórico regional importado. Enquanto a semana estiver em andamento, ranking e priorização são parciais e podem mudar. A estimativa em R$ pressupõe denominador de vendas e demais regionais constantes; não é uma projeção garantida.</p>'+
  '<details class="execRadarDetailsV4"><summary>Ver ranking completo das '+rows.length+' regionais ▾</summary>'+fullRank+'</details></section>';
}

function incompleteMonthlyRadar(){
 const canon=x=>String(x||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g,"").toUpperCase();
 const now=latestDate(),month=now.slice(0,7);
 const previous=new Map((EX.septemberRegions||[]).map(x=>[canon(x.regional),x]));
 const weekly=(EX.data?.competitive_weeks||[]).filter(x=>String(x.week_start||"").slice(0,7)===month&&String(x.week_start)<=now);
 const byRegion=new Map(),weeks=new Map();
 for(const x of weekly){
  const key=canon(x.regional),c=Number(x.captured),sh=Number(x.share),day=String(x.week_start||"");
  if(!key||!previous.has(key)||!Number.isFinite(c)||c<0||!Number.isFinite(sh)||sh<=0)continue;
  if(!weeks.has(day))weeks.set(day,new Set());weeks.get(day).add(key);
  if(!byRegion.has(key))byRegion.set(key,{name:x.regional,parts:new Map()});
  byRegion.get(key).parts.set(day,{captured:c,denominator:c/sh});
 }
 const sharedWeeks=[...weeks].filter(([_,set])=>set.size>=21).map(([day])=>day).sort();
 const rows=[...byRegion].map(([key,x])=>{
  const items=sharedWeeks.map(w=>x.parts.get(w)).filter(Boolean),c=items.reduce((a,b)=>a+b.captured,0),sales=items.reduce((a,b)=>a+b.denominator,0);
  const before=Number(previous.get(key)?.share),share=sales>0?c/sales:null;
  return {key,name:x.name,share,before,delta:share!=null?share-before:null};
 }).filter(x=>x.delta!=null&&Number.isFinite(x.delta)).sort((a,b)=>a.delta-b.delta);
 const me=rows.find(x=>x.key==="CE+PI"||x.key==="CEPI");
 if(sharedWeeks.length===0||rows.length<21||!me)return '<section class="execSectionV1 execRadarV4"><h3>RADAR COMPETITIVO | SHARE MENSAL</h3><p class="execHelpV1">Setembro está registrado. Ainda faltam shares mensais de outubro das 21 regionais; os registros semanais disponíveis não formam uma comparação mensal completa.</p></section>';
 const pp3=x=>(x>0?"+":"")+(x*100).toLocaleString("pt-BR",{maximumFractionDigits:3})+" p.p.";
 const monthly=EX.data?.benchmarks?.filter(x=>x.period==="month"&&x.end_date===now).sort((a,b)=>String(b.updated_at||"").localeCompare(String(a.updated_at||"")))[0];
 const official=monthly?.regional_share;
 const pct=x=>(x*100).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})+"%";
 return '<section class="execSectionV1 execRadarV4"><div class="execSectionHeadV2"><h3>RADAR COMPETITIVO | OUTUBRO x SETEMBRO</h3><span class="execTinyV2">Amostra semanal, não fechamento mensal</span></div><div class="execRadarGridV4"><div><small>SETEMBRO CE+PI</small><strong>'+pct(me.before)+'</strong></div><div><small>OUTUBRO OFICIAL CE+PI</small><strong>'+(official!=null?pct(Number(official)):"—")+'</strong></div><div><small>DESVIO OFICIAL CE+PI</small><strong>'+(official!=null?pp3(Number(official)-me.before):"—")+'</strong></div><div><small>AMOSTRA COMPETITIVA</small><strong>'+sharedWeeks.length+' semanas</strong></div></div><p class="execTinyV2">As posições abaixo comparam apenas as semanas com 21 regionais válidas. Não equivalem ao ranking mensal acumulado.</p><details class="execRadarDetailsV4"><summary>Ver evolução das 21 regionais na amostra ▾</summary><div class="execRadarRankV4">'+rows.map((x,i)=>'<div><span>'+(i+1)+'º • '+e(x.name)+'</span><b class="'+(x.delta<0?"execDangerV1":"execSuccessV1")+'">'+pp3(x.delta)+'</b></div>').join("")+'</div></details></section>';
}
function officialOctoberRadar(){
 const norm=v=>String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\\s+/g,"").toUpperCase();
 const previous=new Map((EX.septemberRegions||[]).map(x=>[norm(x.regional),x]));
 const rows=(EX.octoberRegions||[]).map(x=>{const old=previous.get(norm(x.regional));if(!old)return null;return {name:x.regional,prior:Number(old.share),current:Number(x.share),captured:Number(x.captured),delta:Number(x.share)-Number(old.share)};}).filter(x=>x&&Number.isFinite(x.delta)).sort((a,b)=>a.delta-b.delta);
 const ce=rows.find(x=>norm(x.name)==="CE+PI"),cutoff=rows[4]?.delta;
 if(rows.length<21||!ce)return incompleteMonthlyRadar();
 const rank=rows.indexOf(ce)+1;
 const fmt=x=>(x*100).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})+"%";
 const pp3=x=>(x>0?"+":"")+(x*100).toLocaleString("pt-BR",{minimumFractionDigits:3,maximumFractionDigits:3})+" p.p.";
 const distance=cutoff==null?null:Math.max(0,cutoff-ce.delta);
 const sales=ce.current>0?ce.captured/ce.current:null;
 const needed=distance>0&&sales>0?(ce.prior+cutoff+0.0000001)*sales-ce.captured:0;
 return '<section class="execSectionV1 execRadarV4"><div class="execSectionHeadV2"><h3>RADAR COMPETITIVO | SHARE MENSAL</h3><span class="execTinyV2">Setembro fechado × outubro até '+e(dia(EX.octoberThrough))+'</span></div><div class="execRadarGridV4"><div><small>SETEMBRO CE+PI</small><strong>'+fmt(ce.prior)+'</strong></div><div><small>OUTUBRO CE+PI</small><strong>'+fmt(ce.current)+'</strong></div><div><small>EVOLUÇÃO</small><strong class="'+(ce.delta<0?"execDangerV1":"execSuccessV1")+'">'+pp3(ce.delta)+'</strong></div><div><small>POSIÇÃO POR MENOR EVOLUÇÃO</small><strong>'+rank+'º / 21</strong></div></div><div class="execRadarActionV4 '+(rank>5?"ok":"danger")+'"><strong>'+(rank>5?"CE+PI fora das cinco menores evoluções":"CE+PI na zona de priorização")+'</strong><span>Distância para superar a linha de corte: '+(distance==null?"—":pp3(distance))+' • Captação adicional teórica: '+money2(needed)+'</span></div><div class="execRadarTopV5"><strong>5 REGIONAIS COM MENOR EVOLUÇÃO</strong><div class="execRadarRankV4">'+rows.slice(0,5).map((x,i)=>'<div><span>'+(i+1)+'º • '+e(x.name)+'</span><b class="'+(x.delta<0?"execDangerV1":"execSuccessV1")+'">'+pp3(x.delta)+'</b></div>').join("")+'</div></div><details class="execRadarDetailsV4"><summary>Ver ranking das 21 regionais ▾</summary><div class="execRadarRankV4">'+rows.map((x,i)=>'<div><span>'+(i+1)+'º • '+e(x.name)+'</span><b>'+pp3(x.delta)+'</b></div>').join("")+'</div></details><p class="execTinyV2">Comparativo parcial de outubro com setembro fechado. O valor adicional é cenário teórico com denominador constante, não projeção de vendas.</p></section>';
}
function competitivePeriodRadar(period){
 const label=period==="month"?"MENSAL":"DIÁRIO";
 const current=latestDate(), previous=new Date(current+"T12:00:00Z");
 previous.setUTCDate(previous.getUTCDate()-1);
 const past=period==="month"?(current.slice(0,7)+"-01"):(previous.toISOString().slice(0,10));
 const ref=period==="month"?(new Date(new Date(past+"T12:00:00Z").setUTCDate(0))).toISOString().slice(0,10):past;
 const data=EX.data?.competitive_periods?.[period]||[];
 if(period==="month"&&EX.octoberRegions?.length>=21&&EX.septemberRegions?.length>=21)return officialOctoberRadar();
 if(period==="month"&&!data.length){return incompleteMonthlyRadar();}
 const baseline=period==="month"&&ref==="2026-09-30"?(EX.septemberRegions||[]).map(x=>({...x,period_end:ref})):[];
 const latest=data.filter(x=>x.period_end===current),old=[...data.filter(x=>x.period_end===ref),...baseline];
 const before=new Map(old.map(x=>[String(x.regional),x]));
 const rows=latest.filter(x=>before.has(String(x.regional))).map(x=>({regional:String(x.regional),share:Number(x.share),prev:Number(before.get(String(x.regional)).share),delta:Number(x.share)-Number(before.get(String(x.regional)).share)})).filter(x=>Number.isFinite(x.delta)).sort((a,b)=>a.delta-b.delta);
 const fmt=v=>(v*100).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})+"%";
 const delta=v=>(v>=0?"+":"")+(v*100).toLocaleString("pt-BR",{maximumFractionDigits:3})+" p.p.";
 const me=rows.find(x=>/CE\\s*\\+?\\s*PI/i.test(x.regional));
 return '<section class="execSectionV1 execRadarV4"><div class="execSectionHeadV2"><h3>RADAR COMPETITIVO | SHARE '+label+'</h3><span class="execTinyV2">'+(period==="month"?"Mês anterior vs acumulado atual":"D-2 vs D-1")+'</span></div>'+(rows.length>=21&&me?'<div class="execRadarGridV4"><div><small>ANTERIOR</small><strong>'+fmt(me.prev)+'</strong></div><div><small>ATUAL</small><strong>'+fmt(me.share)+'</strong></div><div><small>EVOLUÇÃO</small><strong>'+delta(me.delta)+'</strong></div><div><small>POSIÇÃO</small><strong>'+(rows.indexOf(me)+1)+'º / '+rows.length+'</strong></div></div><div class="execRadarTopV5"><strong>5 REGIONAIS COM MENOR EVOLUÇÃO</strong>'+rows.slice(0,5).map((x,i)=>'<div class="execMiniRowV1"><b>'+(i+1)+'º '+e(x.regional)+'</b><strong>'+delta(x.delta)+'</strong></div>').join("")+'</div>':'<p class="execHelpV1">Comparativo '+label.toLowerCase()+' indisponível: são necessários shares oficiais por regional nos dois períodos. Não será utilizado o radar de outra semana.</p>')+'</section>';
}
function executiveAreaDispersal(){
 const stores=EX.team?.stores||[];
 if(!stores.length)return '<section class="execSectionV1"><h3>DISPERSÃO REGIONAL POR ÁREAS</h3><p class="execHelpV1">Dados do Meu Time indisponíveis ('+e(EX.teamError||'sem retorno')+'). Período: '+(EX.period==="day"?"D-1":EX.period==="week"?"semana":"mês")+'. Não serão estimados colaboradores sem venda.</p></section>';
 const areas={"Operações":{zero:0,sold:0},"Caixa / Atendimento":{zero:0,sold:0}};
 const seen=new Set();
 for(const store of stores)for(const x of store.rows||[]){
  const id=String(x.id||x.matricula||x.name||""),st=String(x.st||store.st||store.store||"");
  if(!id||seen.has(st+"|"+id))continue;seen.add(st+"|"+id);
  const role=String(x.cargo||x.role||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  const area=/caixa|atendimento|balcao|balcoes|servic|solucoes|credi|financeir|administrativ/.test(role)?"Caixa / Atendimento":"Operações";
  if(Number(x.c)>0)areas[area].sold++;else areas[area].zero++;
 }
 return '<section class="execSectionV1"><div class="execSectionHeadV2"><h3>DISPERSÃO REGIONAL POR ÁREAS</h3><span class="execTinyV2">Fonte: Meu Time • '+(EX.period==="day"?"D-1":EX.period==="week"?"Semana":"Mês")+'</span></div><div class="execAreaGrid">'+Object.entries(areas).map(([name,v])=>{
 const total=v.zero+v.sold,pct=total?v.zero/total:null,angle=(pct||0)*360;
 return '<div class="execAreaBox"><b>'+e(name)+'</b><div class="execAreaInner"><div class="execAreaDonut" style="background:conic-gradient(#DE7C00 '+angle+'deg,#173F35 '+angle+'deg 360deg)"><span>'+ (pct==null?'—':percent(pct))+'</span></div><div><small>'+v.zero+' sem venda</small><small>'+v.sold+' com venda</small><small>'+total+' colaboradores</small></div></div></div>';
 }).join("")+'</div></section>';
}
function render(){
 const root=document.getElementById("execVisualV1");if(!root)return;
 if(!EX.data){root.innerHTML='<div class="execSectionV1">Consultando as fontes oficiais...</div>';return}
 const d=regionalData(),bench=d.benchmark,raw=rawBenchmark(),bad=raw&&!bench;
 const share=d.share,company=bench?.company_share==null?null:n(bench.company_share);
 const gap=share==null||company==null?null:share-company,cap=d.total.captured==null?null:d.total.captured;
 const orders=d.total.orders==null?null:d.total.orders,target=d.total.target||null;
 const reach=cap!=null&&target>0?cap/target:null;
 const ref=latestDate(),bounds=periodBounds(EX.period,ref),periodName=EX.period==="day"?"D-1":EX.period==="week"?"SEMANA":"MÊS";
 const dateText=EX.period==="day"?dia(ref):dia(bounds.start_date)+" – "+dia(ref);
 const maxCompare=Math.max(.00001,share||0,company||0);
 const bar=(v)=>v==null?"0%":Math.min(100,v/maxCompare*100)+"%";
 const trend=d.delta,opp=opportunities(),recs=topCollaborators(),ordered=[recs[1],recs[0],recs[2]];

 const d1Pending=EX.period==="day"&&!bench&&d.rows.length>0;
 const benchmarkMessage=bad?'<div class="execErrorV1">⚠ Benchmark de '+e(dateText)+' inconsistente. Valores gerenciais preservados.</div>':
  d1Pending?'<div class="execNoticeV2"><strong>D-1 de '+e(dateText)+' registrado. Comparativo CE+PI × Empresa pendente.</strong> A importação anterior preservou o resultado das lojas, mas não os totais oficiais da empresa. '+(isMain()?'<button type="button" class="execSecondaryV2" onclick="execOpenD1RepairV1()">Conciliar apenas o share D-1</button>':'A conciliação pode ser feita pelo administrador sem alterar vendas ou comissões.')+'</div>':
  !bench?'<p class="execNoticeV2">Comparativo oficial não disponível para '+e(dateText)+'. Não serão usados shares de outro período.</p>':"";
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
 const zeroCard='<div class="execZeroV1 execZeroPeriodV3"><h4>'+(daily?'LOJAS ZERADAS NO DIA':'LOJAS COM ZERAGEM NO PERÍODO')+'</h4>'+
 '<strong class="execNumBigV2">'+(opp.daysCovered?opp.zeros.length:'—')+'</strong>'+
 '<small>'+(daily?'Com captação igual a zero':opp.zeroDays+' ocorrências loja-dia zeradas • '+opp.validStoreDays+' loja-dias com meta')+'</small>'+
 '<div class="execZeroStatsV2"><span>Oportunidade estimada (R$)</span><b>'+money2(opp.potential)+'</b>'+
 '<span>Parcela da oportunidade (%)</span><b>'+impactPercent(opp.ratio)+'</b>'+ 
 '<span>Taxa de zeragem (%)</span><b>'+percent(opp.zeroRate)+'</b></div>'+
 (!opp.complete||opp.missingGoals||!opp.opportunityReliable?'<p class="execTinyV2 execZeroWarningV3">Cobertura '+opp.daysCovered+'/'+opp.daysExpected+' dias do calendário • '+opp.validStoreDays+' loja-dias com meta positiva'+(opp.missingGoals?' • histórico insuficiente em '+opp.missingEstimates+' ocorrência(s)':'')+'. Sem dados não é zeragem.'+(!opp.opportunityReliable?' • Oportunidade financeira suspensa: histórico insuficiente ou valor desproporcional à captação real.':'')+'</p>':'')+
 '</div>';
 const rightCard='<div class="execPriorityV1 execZeroStoresV3"><h4>'+(daily?'LOJAS SEM CAPTAÇÃO DE VENDA NO DIA':'LOJAS COM ZERAGEM DE VENDAS NO PERÍODO')+'</h4>'+
 (daily?'<div class="execZeroHeadV3"><span>Filial</span><span>Situação</span></div>':
 '<div class="execZeroHeadV3"><span>Filial</span><span>Ocorrências e datas</span><span>Impacto regional</span></div><div class="execZeroLegendV4"><span><i class="execLegendEdayV4"></i> eDay</span><span><i class="execLegendSaturdayV4"></i> Sábado</span><span><i class="execLegendSundayV4"></i> Domingo</span></div>')+
 (opp.zeros.length?'<div class="execZeroListV3">'+opp.zeros.map(x=>'<div class="execZeroRowV3"><b>L'+e(x.st)+'</b>'+
 (daily?'<strong class="execDangerV1">ZERADA</strong>':'<span class="execZeroDatesCellV4"><b>'+x.days+' dia'+(x.days===1?'':'s')+'</b><span class="execZeroDatesV4">'+x.dates.map(execZeroDateTag).join('')+'</span></span><strong class="execDangerV1">'+impactPercent(x.impact)+'<small style="display:block;font-size:10px">'+(x.potential==null?'Sem histórico':'('+money(x.potential)+')')+'</small></strong>')+
 '</div>').join("")+'</div>':
 '<div class="execHelpV1">'+(opp.daysCovered?'Nenhuma filial com zeragem registrada no período.':'Aguardando registros oficiais do período.')+'</div>')+
 '<small class="execTinyV2">Estimativa histórica, não desvio de meta: captação média por dia com meta positiva nos 42 dias anteriores ao período. Impacto potencial = oportunidade da filial ÷ (captação regional + oportunidade total estimada). Dias sem meta positiva ou registro não são zeragens.</small></div>';
 const moves=shareMovements();
 const lines=(list,cls)=>list.length?list.map(x=>'<div class="execMoveRowV188"><strong>L'+e(x.st)+'</strong><b class="'+cls+'">'+pp(x.delta)+'</b></div>').join(""):'<div class="execHelpV1">Nenhuma filial neste critério.</div>';
 const movementPanel=daily?"":'<section class="execSectionV1"><div class="execSectionHeadV2"><h3>EVOLUÇÃO DO SHARE | '+(EX.period==="week"?"SEMANA":"MÊS")+'</h3><span class="execTinyV2">'+e(moves.source)+'</span></div>'+
 (moves.available?'<div class="execMovementGridV188"><div><h4 class="execSuccessV1">▲ EVOLUÍRAM</h4>'+lines(moves.up,"execSuccessV1")+'</div><div><h4 class="execDangerV1">▼ RETRAÍRAM</h4>'+lines(moves.down,"execDangerV1")+'</div></div>':'<p class="execHelpV1">'+e(moves.reason||"Comparativo oficial indisponível")+'</p>')+'</section>';
 const podium='<section class="execSectionV1"><div class="execSectionHeadV2"><h3>TOP 3 COLABORADORES | REGIONAL</h3><span class="execTinyV2">Venda captada • '+periodName+'</span></div>'+
 '<div class="execPodiumV1">'+ordered.map((x,i)=>podiumItem(x,[2,1,3][i])).join("")+'</div>'+ (recs.length>3?'<details class="execRadarDetailsV4"><summary>Ver Top 10 colaboradores ▾</summary><div class="execRadarRankV4">'+recs.slice(3,10).map((x,i)=>'<div><b>'+(i+4)+'º • '+e(displayColName(x))+' • L'+e(x.st)+'</b><strong>'+money2(x.c)+'</strong></div>').join("")+'</div></details>':'')+'</section>';
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
 competitiveRadar()+chart+
 '<section class="execSectionV1"><div class="execSectionHeadV2"><h3>DESTAQUES POR FILIAL</h3></div><div class="execTriGridV1">'+mini+'</div></section>'+
 '<section class="execPairV1 execPairFixedV1">'+zeroCard+rightCard+'</section>'+ executiveAreaDispersal()+
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
  const [db,fca,ranking,highlights,team]=await Promise.allSettled([
   exApi({action:"get",matricula:id}),
   (typeof api==="function"?api({action:"fca_dashboard",matricula:id}):Promise.reject(Error("FCA indisponível"))),
   (typeof api==="function"?api({action:"ranking_period",matricula:id,period:EX.period,month:EX.period==="month"?currentAsOf().slice(0,7):undefined,store:w.U?.u?.st}):Promise.reject(Error("Ranking indisponível"))),
   (typeof api==="function"?api({action:"supervisor_highlights",matricula:id,period:EX.period}):Promise.reject(Error("Destaques indisponíveis"))),
   (typeof api==="function"?api({action:"team_period",matricula:id,period:EX.period,store:STORES[0],reference_date:latestDate()}):Promise.reject(Error("Meu Time indisponível")))
  ]);
  if(db.status==="rejected")throw db.reason;
  EX.data=db.value;
  if(!EX.septemberRegions){try{const response=await fetch("./data/radar-regional-setembro-2026.json",{cache:"no-store"});if(response.ok){const json=await response.json();EX.septemberRegions=Array.isArray(json.regions)?json.regions:[]}}catch(err){console.warn("Histórico setembro indisponível",err)}}
  try{const response=await fetch("./data/radar-regional-outubro-2026-10-29.json",{cache:"no-store"});if(response.ok){const json=await response.json();EX.octoberRegions=json?.regions||[];EX.octoberThrough=json?.through||""}}catch(err){console.warn("Histórico outubro indisponível",err)}
  EX.fca=fca.status==="fulfilled"?fca.value:null;
  EX.ranking=ranking.status==="fulfilled"?ranking.value:null;
  EX.highlight=highlights.status==="fulfilled"?highlights.value:null;
  EX.team=team.status==="fulfilled"&&Array.isArray(team.value?.stores)&&team.value.stores.length?team.value:null;
  EX.teamError=team.status==="rejected"?String(team.reason):!EX.team?String(team.value?.error||"Sem base regional de colaboradores"):"";
  EX.date=null; // D-1 recalculado a cada consulta.
  render();
 }catch(err){EX.error=String(err.message||err);if(root)root.innerHTML='<div class="execErrorV1">Não foi possível obter o histórico do painel: '+e(EX.error)+' <button onclick="execRefreshV1()">Tentar novamente</button></div>'}
 finally{EX.loading=false}
}
function setPeriod(period){if(!["day","week","month"].includes(period))return;EX.period=period;const view=document.getElementById("view");if(view&&typeof go==="function"){go("executive")}else render()}
/* V3: print como entrada principal; datas do D-1 vinculadas ao resultado importado. */
function benchmarkPeriodChangedV3(){
 const period=document.getElementById("exIn_period")?.value||"week",y=previousBusinessDate();
 const start=document.getElementById("exIn_start_date"),end=document.getElementById("exIn_end_date");
 if(start)start.value=period==="week"?isoWeek(y):firstMonth(y);
 if(end)end.value=y;
 const hint=document.getElementById("exDateHintV3");
 if(hint)hint.textContent="Informe apenas o intervalo exato do print. Os números serão lidos e salvos automaticamente quando consistentes.";
}
function benchmarkReviewV3(force){
 const panel=document.getElementById("exBenchmarkReviewV3");
 if(!panel)return;
 panel.hidden=false;
 if(force)panel.open=true;
}
function showAdmin(){
 if(!isMain())return notify("Importação restrita ao administrador principal.");
 const slot=document.getElementById("execAdminSlotV1");if(!slot)return;
 if(EX.ocrImageUrl){URL.revokeObjectURL(EX.ocrImageUrl);EX.ocrImageUrl=null}
 const period=EX.period==="month"?"month":"week";
 slot.innerHTML='<section class="execAdminV1 execImportSimplifiedV3" id="execBenchmarkAdminV1">'+
 '<h3>Importação oficial | Semana e Mês</h3>'+
 '<p class="execHelpV1">D-1 é alimentado automaticamente pelo gerencial. Para semana ou mês, importe o Excel oficial (.xlsx), ou use o print como alternativa. Não é necessário digitar ou confirmar os valores.</p>'+
 '<div class="execImportPeriodV3"><div class="execFieldV1"><label for="exIn_period">Período</label><select id="exIn_period" onchange="execBenchmarkPeriodChangedV3()"><option value="week">Semana</option><option value="month">Mês</option></select></div>'+
 '<div class="execImportDatesV3"><div id="exDateRangeV3" class="execDateRangeV3"><div class="execFieldV1"><label for="exIn_start_date">De</label><input id="exIn_start_date" type="date"></div>'+
 '<div class="execFieldV1"><label for="exIn_end_date">Até</label><input id="exIn_end_date" type="date"></div></div>'+
 '<small id="exDateHintV3" class="execHelpV1"></small></div></div>'+
 '<label class="execUploadMainV3" for="exExcelFileV1"><span class="execUploadIconV3">▤</span><span><strong>Importar Excel oficial</strong><small>Planilha .xlsx ou .xls · Totais CE+PI e Empresa</small></span><input id="exExcelFileV1" type="file" accept=".xlsx,.xls" onchange="execReadExcelV1(event)" hidden></label>'+ 
 '<label class="execUploadMainV3" for="exPrintFileV1"><span class="execUploadIconV3">▣</span><span><strong>Anexar print oficial</strong><small>Leitura e registro automáticos · PNG/JPG/WEBP até 8 MB</small></span><input id="exPrintFileV1" accept="image/*" type="file" onchange="execReadPrintV1(event)" hidden></label>'+
 '<div id="exOcrStatusV1" class="execReadStatusV3" role="status" aria-live="polite">Selecione o período e importe Excel ou print.</div>'+
 '<details id="exOriginalPrintV3" class="execOriginalPrintV3" hidden><summary>Ver print utilizado</summary><img id="exOriginalImageV3" alt="Print de resultado" loading="lazy"></details>'+
 '<div class="execImportActionsV3"><button type="button" class="execActionV1" style="background:#e2e5df;color:#173F35" onclick="document.getElementById(\'execAdminSlotV1\').innerHTML=\'\'">Fechar</button></div></section>';
 document.getElementById("exIn_period").value=period;
 benchmarkPeriodChangedV3();
 slot.scrollIntoView({behavior:"smooth",block:"start"});
}
async function loadLib(url,global){if(w[global])return w[global];await new Promise((resolve,reject)=>{const script=document.createElement("script");script.src=url;script.onload=resolve;script.onerror=()=>reject(Error("Biblioteca indisponível."));document.head.appendChild(script)});return w[global]}
/* V3: leitura conservadora da linha total da empresa e da linha CE+PI. */
function ocrParse(text){
 const lines=String(text||"").split(/\r?\n/).map(x=>x.replace(/\s+/g," ").trim()).filter(Boolean);
 const normalize=x=>String(x||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().replace(/[|•]/g," ").replace(/\s+/g," ").trim();
 const regionName=x=>/^(?:REGIONAL\s*)?CE\s*(?:\+|&|\/|\-|E)?\s*PI(?:\b|$)|^(?:REGIONAL\s*)?CEPI\b|^CEARA\s*(?:E|\/)\s*PIAUI\b/.test(normalize(x));
 const companyName=x=>/^(?:(?:TOTAL|T0TAL)(?:\s+(?:GERAL|EMPRESA|NACIONAL))?|(?:MEDIA|MEDIA\s+GERAL|MEDIA\s+EMPRESA|EMPRESA|CONSOLIDADO(?:\s+GERAL)?|BRASIL)(?:\s+TOTAL)?)(?:\s|$)/.test(normalize(x));
 const isOtherRow=x=>/^(?:REGIONAL\s+)?(?:[A-Z]{2}\s*(?:\+|\/)\s*[A-Z]{2}|TOTAL|EMPRESA|BRASIL|CONSOLIDADO|MEDIA)\b/.test(normalize(x));
 function collect(test){
  const candidates=[];
  for(let i=0;i<lines.length;i++){
   if(!test(lines[i]))continue;
   let value=lines[i];
   // OCR ocasionalmente envia valores da tabela na linha seguinte à identificação.
   for(let j=1;j<=2&&i+j<lines.length&&!isOtherRow(lines[i+j])&&value.length<170;j++){
    if(/\d[\d.]*,\d{2}/.test(value)&&/\d[.,]\d{1,3}\s*%/.test(value))break;
    value+=' '+lines[i+j];
   }
   const row=extract(value);
   candidates.push({row,quality:[row.captured,row.approved,row.orders,row.share].filter(x=>x!=null).length,content:value});
  }
  candidates.sort((a,b)=>b.quality-a.quality);
  return candidates[0]?.row||{captured:null,approved:null,orders:null,share:null};
 }
 function extract(line){
  // Usar apenas percentuais explícitos; não confundir share com EV vs AA.
  const shares=(line.match(/\b\d{1,2}[.,]\d{1,3}\s*%/g)||[])
    .map(x=>numeric(x)).filter(x=>x!=null&&x>=0&&x<=5);
  const share=shares.length===1?shares[0]:null;
  const withoutShares=line.replace(/(?:^|[^\d])\d{1,2}[.,]\d{1,3}\s*%/g," ");
  // Valor financeiro com R$ ou casas decimais e separador de milhar.
  const rawAmounts=withoutShares.match(/R\$\s*[-+]?\d[\d.,]*|(?:\d{1,3}(?:\.\d{3})+|\d+),\d{2}(?!\d)/gi)||[];
  const amounts=rawAmounts.map(x=>numeric(x)).filter(x=>x!=null&&x>=0);
  const captured=amounts.length?amounts[0]:null;
  const approved=amounts.length>1?amounts[1]:null;
  // Pedidos apenas com rótulo explícito na mesma linha; nunca adivinhar.
  const ordersMatch=line.match(/(?:pedidos?|qtd\.?\s*ped(?:idos)?)\s*[:\-]?\s*(\d{1,3}(?:\.\d{3})+|\d{1,7})(?![\d.,])/i);
  const orders=ordersMatch?Number(ordersMatch[1].replace(/\./g,"")):null;
  return {captured,approved,orders,share};
 }
 return {company:collect(companyName),regional:collect(regionName),lines:lines.length};
}

async function readExcel(ev){
 const file=ev?.target?.files?.[0],status=document.getElementById("exOcrStatusV1");
 if(!file)return;
 try{
 const period=document.getElementById("exIn_period")?.value,start=document.getElementById("exIn_start_date")?.value,end=document.getElementById("exIn_end_date")?.value,y=previousBusinessDate();
 if(!["week","month"].includes(period)||!start||!end||start>end||end>y||(period==="week"&&isoWeek(start)!==isoWeek(end))||(period==="month"&&start.slice(0,7)!==end.slice(0,7)))throw Error("Datas inválidas: escolha um intervalo da mesma semana ou mês até D-1.");
 if(!/\.(xlsx|xls)$/i.test(file.name)||file.size>15e6)throw Error("Arquivo deve ser Excel (.xlsx ou .xls) de até 15 MB.");
 if(status){status.className="execReadStatusV3";status.textContent="Conferindo totais do Excel oficial...";}
 const xl=await loadLib("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js","XLSX"),wb=xl.read(await file.arrayBuffer(),{type:"array"});
 const norm=v=>String(v??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().replace(/\s+/g," ").trim();
 let match;
 for(const sheet of wb.SheetNames){
 const rows=xl.utils.sheet_to_json(wb.Sheets[sheet],{header:1,defval:null,raw:true});
 const h=rows.findIndex(r=>norm(r?.[0])==="REGIONAL"&&norm(r?.[1])==="LOJA"&&r.some(v=>norm(v)==="CAPTACAO"));
 if(h<0)continue;
 const cols=rows[h].map(norm),ind=["REGIONAL","LOJA","CAPTACAO","APROVADO","QTDE PEDIDOS","SHARE LOJA %"].map(x=>cols.indexOf(x));
 if(ind.some(i=>i<0))continue;
 const [ir,il,ic,ia,io,ish]=ind,data=rows.slice(h+1);
 const regional=data.find(r=>/^(CE\s*\+\s*PI|CEPI)$/.test(norm(r?.[ir]))&&norm(r?.[il])==="TOTAL");
 const company=data.find(r=>norm(r?.[ir])==="TOTAL"&&!norm(r?.[il]));
 if(regional&&company){match={regional,company,ic,ia,io,ish};break;}
 }
 if(!match)throw Error("Subtotal CE + PI, total Empresa ou cabeçalho oficial ausente. Nada foi gravado.");
 const {regional,company,ic,ia,io,ish}=match,num=(r,i)=>typeof r[i]==="number"?r[i]:numeric(r[i]);
 const cc=num(company,ic),rc=num(regional,ic),cs=num(company,ish),rs=num(regional,ish),co=num(company,io),ro=num(regional,io);
 if([cc,rc,cs,rs,co,ro].some(v=>v==null||!Number.isFinite(v))||cc<=0||rc<0||rc>cc||cs<0||cs>.05||rs<0||rs>.05||!Number.isInteger(co)||!Number.isInteger(ro)||ro>co)throw Error("Captação, pedidos ou share inconsistentes. Nenhum valor salvo.");
 await saveBenchmark({period,start_date:start,end_date:end,company_captured:cc,company_approved:num(company,ia),company_orders:co,company_share:cs,regional_captured:rc,regional_orders:ro,regional_share:rs});
 if(status?.isConnected){status.className="execReadStatusV3 success";status.textContent="✅ Excel oficial de "+dia(start)+" a "+dia(end)+" importado. Totais consolidados atualizados.";}
 }catch(err){if(status){status.className="execReadStatusV3 warning";status.textContent=String(err.message||err);}}
 finally{if(ev?.target)ev.target.value="";}
}
async function readPrint(ev){
 const file=ev?.target?.files?.[0],status=document.getElementById("exOcrStatusV1");
 if(!file)return;
 const period=document.getElementById("exIn_period")?.value;
 const start=document.getElementById("exIn_start_date")?.value;
 const end=document.getElementById("exIn_end_date")?.value;
 const y=previousBusinessDate();
 if(!["week","month"].includes(period)||!start||!end||start>end||end>y||
   (period==="week"&&isoWeek(start)!==isoWeek(end))||
   (period==="month"&&start.slice(0,7)!==end.slice(0,7))){
  if(status){status.className="execReadStatusV3 warning";status.textContent="Intervalo inválido. Utilize datas da mesma semana ou mês, até D-1.";}
  ev.target.value="";return;
 }
 if(!file.type.startsWith("image/")||file.size>8e6){notify("Anexe uma imagem de até 8 MB.");return}
 if(EX.ocrImageUrl)URL.revokeObjectURL(EX.ocrImageUrl);
 EX.ocrImageUrl=URL.createObjectURL(file);
 const preview=document.getElementById("exOriginalImageV3"),details=document.getElementById("exOriginalPrintV3");
 if(preview)preview.src=EX.ocrImageUrl;
 if(details)details.hidden=false;
 if(status){status.className="execReadStatusV3";status.textContent="Analisando o print e validando os indicadores oficiais...";}
 try{
  const t=await loadLib("https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js","Tesseract");
  let result;
  try{result=await t.recognize(file,"por+eng")}
  catch(_){result=await t.recognize(file,"eng")}
  const parsed=ocrParse(result?.data?.text||""),company=parsed.company,regional=parsed.regional;
  const nums=[company.captured,company.share,regional.captured,regional.share];
  if(nums.some(x=>x==null||!Number.isFinite(Number(x)))||
     company.captured<=0||regional.captured<0||company.captured<regional.captured||
     company.share<0||company.share>5||regional.share<0||regional.share>5){
   throw Error("Leitura insuficiente ou inconsistente. Use um print mais nítido com captação e share de CE+PI e empresa. Nenhum valor foi salvo.");
  }
  const record={period,start_date:start,end_date:end,company_captured:company.captured,
   company_approved:company.approved,company_orders:company.orders,company_share:company.share/100,
   regional_captured:regional.captured,regional_orders:regional.orders,regional_share:regional.share/100};
  if(status)status.textContent="Dados reconhecidos. Salvando intervalo oficial...";
  await saveBenchmark(record);
  if(status?.isConnected){status.className="execReadStatusV3 success";status.textContent="✅ Print de "+dia(start)+" a "+dia(end)+" importado. O painel já utiliza os novos números.";}
 }catch(err){
  if(status){status.className="execReadStatusV3 warning";status.textContent=String(err.message||err)}
 }finally{if(ev?.target)ev.target.value=""}
}
async function saveBenchmark(record){
 if(!isMain())return notify("Importação não autorizada.");
 if(!record)return notify("Para importar semana ou mês, anexe o print do intervalo.");
 let pwd="";
 try{pwd=typeof adminPwd==="function"?adminPwd():""}catch(_){}
 if(!pwd)pwd=prompt("Senha administrativa para autorizar o registro do print:")||"";
 if(!pwd)throw Error("Importação cancelada: senha administrativa necessária.");
 const r=await exApi({action:"save",matricula:mat(),password:pwd,record});
 if(!r.ok)throw Error("Não foi possível registrar o período.");
 EX.period=record.period;
 await loadExecutiveV1();
 notify("Acumulado oficial e share atualizados sem confirmação manual dos valores.");
}
function caption(){
 const r=regionalData(),b=r.benchmark,z=opportunities(),ref=latestDate();
 const period=EX.period==="day"?"D-1":EX.period==="week"?"SEMANA":"MÊS";
 const start=periodBounds(EX.period,ref).start_date;
 const cap=r.rows.length?r.total.captured:b?.regional_captured??null;
 const orders=r.rows.length?r.total.orders:b?.regional_orders??null;
 const company=b?.company_share??null,desvio=r.share!=null&&company!=null?r.share-n(company):null;
 const sign=desvio==null?"↕️":desvio<0?"🔻":desvio>0?"🔺":"➖";
 const date=EX.period==="day"?dia(ref):dia(start)+" a "+dia(ref);
 const labels=EX.period==="day"?"Lojas zeradas":"Lojas com zeragem";
 const lines=[
  "📊 *PAINEL EXECUTIVO eSTORE | CE+PI*",
  "📅 *"+period+" • "+date+"*",
  "",
  "💰 *Captação:* "+money2(cap)+" | *Pedidos:* "+count(orders),
  "📈 *Share:* CE+PI "+percent(r.share)+" | Empresa "+percent(company),
  sign+" *Desvio:* "+pp(desvio),
  "",
  "🏬 *"+labels+":* "+(z.daysCovered?z.zeros.length:"—"),
  "💸 *Potencial de dispersão:* "+money2(z.potential),
  "📉 *Impacto regional:* "+percent(z.ratio)
 ];
 if(!z.complete||z.missingGoals)lines.push("⚠️ *Apuração parcial:* "+z.daysCovered+"/"+z.daysExpected+" dias.");
 lines.push("","🔎 *Explore os indicadores e a performance detalhada no app:*",
  (globalThis.EstoreIdentity?.url('')||'https://frannlima.github.io/app-estore-cepi/'),"","_Moda que inspira o Brasil_");
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
 // Cabeçalho integrado: textos alinhados à esquerda e marca transparente à direita,
 // sem caixa, moldura ou fundo adicional atrás do logo.
 fit("eStore | CE+PI",58,70,54,755,true,W);
 print("PAINEL EXECUTIVO DE RESULTADOS",60,120,25,true,"#D3E4DC");
 box(58,151,706,42,O,9);
 fit(period+" • "+data.dateLabel,78,172,27,665,true,W);
 ctx.fillStyle=O;ctx.fillRect(0,206,1080,6);

 // V197: alinhamento central e dimensionamento por área útil para compartilhar no celular.
 // As cinco caixas preservam os mesmos indicadores oficiais, sem mudar os cálculos.
 const centered=(value,centerX,y,desired,maxWidth,color=G,bold=true)=>{
   const label=String(value??"—");
   let size=desired;
   while(size>17){
     ctx.font=(bold?"800 ":"500 ")+size+"px Larsseit,Arial,sans-serif";
     if(ctx.measureText(label).width<=maxWidth)break;
     size--;
   }
   print(label,centerX,y,size,bold,color,"center");
 };
 const metrics=[["CAPTAÇÃO CE+PI",money2(data.captured)],["PEDIDOS",count(data.orders)],["SHARE REGIONAL",percent(data.regionalShare)]];
 metrics.forEach(([title,val],i)=>{
   const x=46+i*335,w=321,cx=x+w/2;
   box(x,239,w,137,W,16,L);
   centered(title,cx,274,22,w-25,M,true);
   centered(val,cx,328,48,w-27,i===2?O:G,true);
 });
 box(46,397,988,156,W,16,L);
 const shareCenter=(46+394)/2,desvioCenter=(396+1034)/2;
 centered("SHARE EMPRESA",shareCenter,433,23,308,M,true);
 centered(percent(data.companyShare),shareCenter,494,51,300,G,true);
 ctx.fillStyle=L;ctx.fillRect(394,420,2,110);
 centered("DESVIO CE+PI × EMPRESA",desvioCenter,433,24,602,M,true);
 // Valor em p.p. acompanhado de triângulo sem depender de emojis/fontes do dispositivo.
 const diffValue=pp(data.gap);
 const diffColor=data.gap==null?M:data.gap<0?R:data.gap>0?"#188257":M;
 let diffFont=56;
 const diffWidth=564,triangleW=25,triangleGap=15;
 while(diffFont>18){
   ctx.font="800 "+diffFont+"px Larsseit,Arial,sans-serif";
   if(ctx.measureText(diffValue).width+triangleW+triangleGap<=diffWidth)break;
   diffFont--;
 }
 ctx.font="800 "+diffFont+"px Larsseit,Arial,sans-serif";
 const textW=ctx.measureText(diffValue).width;
 const groupStart=desvioCenter-(textW+triangleW+triangleGap)/2;
 const triX=groupStart+triangleW/2,triY=492;
 ctx.fillStyle=diffColor;
 if(data.gap==null||data.gap===0){
   ctx.fillRect(triX-12,triY-3,24,6);
 }else{
   ctx.beginPath();
   if(data.gap>0){
     ctx.moveTo(triX,triY-14);
     ctx.lineTo(triX+13,triY+11);
     ctx.lineTo(triX-13,triY+11);
   }else{
     ctx.moveTo(triX-13,triY-11);
     ctx.lineTo(triX+13,triY-11);
     ctx.lineTo(triX,triY+14);
   }
   ctx.closePath();ctx.fill();
 }
 print(diffValue,groupStart+triangleW+triangleGap,triY,diffFont,true,diffColor);

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
 const isDaily=data.period==="day",zeroRows=data.zeroRows||[];
 fit(isDaily?"LOJAS ZERADAS NO DIA":"LOJAS COM ZERAGEM NO PERÍODO",71,959,29,943,true,G);
 print(isDaily?"Lojas:":"Filiais:",73,1002,22,false,M);
 print(String(data.zeroCount??"—"),170,1002,29,true,R);
 print("Potencial dispersão:",283,1002,22,false,M);
 fit(money2(data.potential),505,1002,26,195,true,G);
 print("Impacto:",724,1002,22,false,M);
 fit(percent(data.ratio),1007,1002,27,155,true,R,"right");
 // D-1: manter apenas indicadores e a sequência das filiais, sem títulos intermediários.
 // Semana e mês: preservar dias de zeragem e impacto regional por loja.
 if(isDaily){
  if(zeroRows.length){
   const stores=zeroRows.map(item=>"L"+String(item.st||"").padStart(3,"0"));
   const perLine=9;
   for(let i=0;i<stores.length;i+=perLine){
    fit(stores.slice(i,i+perLine).join("  •  "),73,1059+Math.floor(i/perLine)*33,23,931,true,G);
   }
  }else fit(data.hasDailyData?"Nenhuma filial com captação zerada":"Aguardando dados oficiais do dia",73,1059,21,929,false,M);
 }else{
  fit("LOJAS COM ZERAGEM DE VENDAS NO PERÍODO",73,1051,24,944,true,G);
  for(let i=0;i<2;i++){
   const x=73+i*487;
   print("FILIAL  •  DIAS ZERADOS  •  IMPACTO",x,1087,17,true,M);
  }
  if(zeroRows.length){
   for(let i=0;i<zeroRows.length;i++){
    const item=zeroRows[i],x=73+(i%2)*487,y=1123+Math.floor(i/2)*37;
    print("L"+String(item.st||"").padStart(3,"0"),x,y,22,true,G);
    print(item.days+"d",x+179,y,21,true,G);
    fit(percent(item.impact),x+461,y,21,195,true,R,"right");
   }
  }else fit(data.hasDailyData?"Nenhuma filial com zeragem no período":"Aguardando dados oficiais do intervalo",73,1123,22,938,false,M);
 }
 if(!data.coverageComplete)fit("Base parcial: "+data.daysCovered+"/"+data.daysExpected+" dias • números ausentes não estimados",73,data.detailBottom-22,18,934,false,R);

 print("TOP 3 VENDEDORES | CE+PI",52,bottom+37,28,true,G);
 const order=[data.collabs[1],data.collabs[0],data.collabs[2]],no=[2,1,3];
 for(let i=0;i<3;i++){
  const x=46+335*i,person=order[i];
  box(x,podiumY,321,302,i===1?"#FBE1AB":"#EFF0EC",19);
  // Medalha e colocação com contraste, iguais ao pódio da tela.
  box(x+98,podiumY+13,125,45,i===1?"#DE7C00":"#466964",17);
  print(no[i]===1?"🏅":no[i]===2?"🥈":"🥉",x+125,podiumY+36,30,false,W,"center");
  print(no[i]+"º",x+190,podiumY+36,28,true,W,"center");
  if(!person)continue;
  const avatar=data.avatars?.[i];
  ctx.save();ctx.beginPath();ctx.arc(x+160,podiumY+112,48,0,Math.PI*2);ctx.clip();
  if(avatar)ctx.drawImage(avatar,x+112,podiumY+64,96,96);
  else{ctx.fillStyle="#D4E3D9";ctx.fillRect(x+112,podiumY+64,96,96);print(displayColName(person).slice(0,1),x+160,podiumY+113,37,true,G,"center")}
  ctx.restore();
  fit(displayColName(person),x+160,podiumY+192,29,292,true,G,"center");
  fit("L "+String(person.st||"").padStart(3,"0"),x+160,podiumY+236,29,285,true,G,"center");
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
 const detailHeight=EX.period==="day"?Math.max(180,150+Math.ceil(opp.zeros.length/9)*33+(!opp.complete?30:0)):Math.max(240,215+Math.ceil(opp.zeros.length/2)*37);
 const detailBottom=927+detailHeight,cardHeight=detailBottom+70+302+118;
 const model={period:EX.period,dateLabel:EX.period==="day"?dia(latestDate()):dia(periodBounds(EX.period,latestDate()).start_date)+" a "+dia(latestDate()),
  captured:cap,orders,regionalShare:d.share,companyShare:b?.company_share??null,
  gap:d.share!=null&&b?.company_share!=null?d.share-n(b.company_share):null,
  topCap:topRows("c"),topOrders:topRows("o"),topShare:topRows("share"),
  zeroCount:opp.daysCovered?opp.zeros.length:null,zeroRows:opp.zeros,ratio:opp.ratio,potential:opp.potential,
  hasDailyData:opp.daysCovered>0,coverageComplete:opp.complete,daysCovered:opp.daysCovered,daysExpected:opp.daysExpected,
  detailHeight,detailBottom,height:cardHeight,collabs:topCollaborators()};
 const ordered=[model.collabs[1],model.collabs[0],model.collabs[2]];
 try{
  const canvas=document.createElement("canvas");canvas.width=1080;canvas.height=model.height;
  const ctx=canvas.getContext("2d",{alpha:false});if(!ctx)throw Error("Canvas indisponível");
  await document.fonts?.ready;
  model.avatars=await Promise.all(ordered.map(x=>x?imageForCanvas(colPhoto(x)):Promise.resolve(null)));
  const headerLogo=await imageForCanvas(executiveHeaderLogo);
  paintShare(ctx,model);
  // Marca original RIA / CHU / ELO em versão clara e transparente, no próprio
  // fundo verde do cabeçalho. Região reservada: x=910..1032; y=22..182.
  if(headerLogo){
   const maxW=116,maxH=155;
   const iw=headerLogo.naturalWidth||950,ih=headerLogo.naturalHeight||1268;
   const scale=Math.min(maxW/iw,maxH/ih);
   const wLogo=iw*scale,hLogo=ih*scale;
   const xLogo=1080-54-(maxW+wLogo)/2, yLogo=27+(maxH-hLogo)/2;
   ctx.drawImage(headerLogo,xLogo,yLogo,wLogo,hLogo);
  }else{
   // Carregamento do SVG indisponível: fallback tipográfico sem fundo.
   ctx.font="800 30px Larsseit,Arial,sans-serif";
   ctx.fillStyle="#F7F5EF";ctx.textAlign="center";ctx.textBaseline="middle";
   ["RIA","CHU","ELO"].forEach((line,i)=>ctx.fillText(line,968,61+i*41));
   ctx.textAlign="left";
  }
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

function execShareMondayV1(){
 if(!EX.data)return notify("Dados oficiais ainda não carregados.");
 const reference=latestDate(),base=(EX.data?.daily||[]),last=base.find(x=>x.date===reference);
 const summarize=(period)=>{
  const beginning=period==="day"?reference:period==="week"?isoWeek(reference):firstMonth(reference);
  const rows=base.filter(x=>x.date>=beginning&&x.date<=reference);
  let captured=0,orders=0;
  for(const d of rows)for(const x of d.stores||[])if(STORES.includes(String(x.st||"").padStart(3,"0"))){captured+=n(x.c);orders+=n(x.o)}
  const benchmark=(EX.data.benchmarks||[]).filter(x=>x.period===period&&x.end_date===reference).sort((a,b)=>String(b.updated_at||"").localeCompare(String(a.updated_at||"")))[0];
  return {captured:period==="day"&&!last?null:rows.length?captured:null,orders:rows.length?orders:null,share:benchmark?.regional_share??null,start:beginning,complete:period==="day"||period==="week"&&new Date(reference+"T12:00:00Z").getUTCDay()===0};
 };
 const a=summarize("day"),b=summarize("week"),c=summarize("month");
 const url=globalThis.EstoreIdentity?.url('')||'https://frannlima.github.io/app-estore-cepi/';
 const block=(name,x)=>name+"\\n💰 Captação: "+money2(x.captured)+"\\n📦 Pedidos: "+count(x.orders)+"\\n📊 Share: "+percent(x.share);
 const msg="📊 *eSTORE CE+PI | Painel de Resultado*\\n\\nBom dia, time! ☀️\\nCompartilho nosso consolidado com os principais resultados e oportunidades.\\n\\n"+block("📍 *01 | RESULTADO D-1* • "+dia(reference),a)+"\\n\\n"+block("📍 *02 | SEMANA* • "+dia(b.start)+" a "+dia(reference)+(b.complete?" • FECHAMENTO":" • PARCIAL"),b)+"\\n\\n"+block("📍 *03 | MÊS* • "+dia(c.start)+" a "+dia(reference)+" • "+(reference.slice(8)==="30"||reference.slice(8)==="31"?"ACUMULADO / CONFERIR FECHAMENTO":"ACUMULADO"),c)+"\\n\\n🔎 *Explore o Relatório Executivo*\\n"+url+"\\n\\n🚀 *Talento é conquista!*";
 window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank","noopener");
}
w.execShareMondayV1=execShareMondayV1;
w.executivePanelViewV1=executivePanelViewV1;
w.loadExecutiveV1=loadExecutiveV1;
w.execSetPeriodV1=setPeriod;
w.execRefreshV1=loadExecutiveV1;
w.execBenchmarkPeriodChangedV3=benchmarkPeriodChangedV3;
w.execBenchmarkReviewV3=benchmarkReviewV3;
w.execShowAdminV1=showAdmin;
w.execSaveBenchmarkV1=saveBenchmark;
w.execReadPrintV1=readPrint;
w.execReadExcelV1=readExcel;

function execOpenD1RepairV1(){
 if(!isMain())return notify("Conciliação disponível somente para administrador.");
 const date=latestDate();
 if(typeof go!=="function")return notify("Abra a Central de Dados na Administração.");
 go("admin");
 setTimeout(()=>{
  if(typeof window.adminCentralDataV206==="function")window.adminCentralDataV206();
  const panel=document.querySelector(".estoreD1ReconcileV1");
  if(!panel){notify("Abra Central de Dados → D-1 Diário → Corrigir share.");return}
  panel.open=true;
  const input=document.getElementById("estoreD1RepairDateV1");
  if(input)input.value=date;
  panel.scrollIntoView({behavior:"smooth",block:"center"});
 },120);
}
w.execOpenD1RepairV1=execOpenD1RepairV1;
w.execShareV1=shareCard;
w.execShareCaptionV1=caption;
w.execToggleStoresV2=toggleStores;
})(window);
