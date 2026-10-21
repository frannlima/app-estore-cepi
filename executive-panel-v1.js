/* Painel Executivo eStore CE+PI
 * Fonte: Gestão/Lojas (COMMON.regional + daily_updates.management), FCA existente,
 * ranking_period (colaboradores) e benchmark oficial importado.
 * A exportação usa o MESMO nó HTML e gráficos da tela, sem redesenho paralelo.
 */
(function(w){
"use strict";
const API_EXEC="https://fndkjgveeojlywkdrtxe.supabase.co/functions/v1/estore-executive";
const STORES=["073","084","108","109","113","138","142","146","175","177","222","238","258","262","314","318","344","350","552"];
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
const firstMonth=(d)=>d.slice(0,7)+"-01";
const same=(a,b)=>String(a||"")===String(b||"");
const logo="./assets/riachuelo-logo-horizontal-oficial-white-v133.svg";
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
function matchBenchmark(){const b=periodBounds(EX.period,latestDate());return (EX.data?.benchmarks||[]).find(x=>x.period===b.period&&same(x.start_date,b.start_date)&&same(x.end_date,b.end_date))||null}
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
function trendData(){const end=latestDate(),start=EX.period==="day"?null:periodBounds(EX.period,end).start_date;
 let a=(EX.data?.daily||[]).filter(x=>x.date<=end&&(!start||x.date>=start)).slice(-8);
 if(!a.length)a=(EX.data?.daily||[]).slice(-8);
 const bm=EX.data?.benchmarks||[];
 return a.map(x=>{
  const b=bm.find(z=>z.period==="day"&&z.end_date===x.date);
  return {date:x.date,captured:x.stores.reduce((s,y)=>s+n(y.c),0),companyShare:b?.company_share==null?null:n(b.company_share)};
 });
}
function top3HTML(title,rows,key,format){return '<div class="execMiniV1"><h4>'+e(title)+'</h4>'+(
 rows.length?rows.map((x,i)=>'<div class="execMiniRowV1"><span class="execMedalV1">'+(i+1)+'</span><b>'+e(x.st)+'</b><b>'+format(x[key])+'</b></div>').join(""):'<small>Sem dados confirmados.</small>'
 )+'</div>'}
function drawChart(rows){
 if(!rows.length)return '<p class="execHelpV1">Sem histórico gerencial disponível para o período.</p>';
 const W=740,H=225,left=32,right=28,top=20,bottom=35;
 const max=Math.max(1,...rows.map(x=>x.captured));const maxY=max*1.25,plot=H-bottom-top,bw=(W-left-right)/rows.length;
 let a='<svg xmlns="http://www.w3.org/2000/svg" class="execChartV1" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Evolução da captação regional por dia; pontos laranja representam share oficial da empresa">';
 for(let i=0;i<4;i++){const y=top+plot*i/3,v=maxY*(3-i)/3;a+='<line x1="'+left+'" y1="'+y+'" x2="'+(W-right)+'" y2="'+y+'" stroke="#e1e3de"/><text x="'+(left-6)+'" y="'+(y+3)+'" font-size="10" fill="#6c746e" text-anchor="end">'+Math.round(v/1000)+'k</text>'}
 rows.forEach((x,i)=>{let x0=left+i*bw+bw*.20,w=bw*.58,h=plot*x.captured/maxY,y=top+plot-h,col=i===rows.length-1?"#DE7C00":"#173F35";
  a+='<rect x="'+x0+'" y="'+y+'" width="'+w+'" height="'+Math.max(0,h)+'" rx="4" fill="'+col+'"/>';
  a+='<text x="'+(x0+w/2)+'" y="'+(H-14)+'" text-anchor="middle" font-size="10" fill="#56615d">'+x.date.slice(8)+'/'+x.date.slice(5,7)+'</text>';
  if(i===rows.length-1)a+='<text x="'+(x0+w/2)+'" y="'+Math.max(12,y-7)+'" text-anchor="middle" font-weight="bold" font-size="13" fill="#D77500">'+count(x.captured)+'</text>';
 });
 const sharePoints=rows.map((x,i)=>x.companyShare==null?null:{x:left+i*bw+bw*.49,y:top+plot-plot*Math.min(1,(x.companyShare*100)/2.0),p:x.companyShare}).filter(Boolean);
 if(sharePoints.length>=2)a+='<polyline fill="none" stroke="#DE7C00" stroke-width="2.5" stroke-linejoin="round" points="'+sharePoints.map(x=>x.x+','+x.y).join(" ")+'"/>';
 for(const x of sharePoints)a+='<circle cx="'+x.x+'" cy="'+x.y+'" r="4.5" fill="#DE7C00" stroke="#fff" stroke-width="1"/>';
 a+='<text x="'+(W-4)+'" y="12" font-size="10" fill="#DE7C00" text-anchor="end">Share empresa (escala até 2%)</text></svg>';
 return a;
}
function executivePanelViewV1(){
 if(!isLeader())return '<div class="notice">Painel Executivo disponível para supervisores e gestores.</div>';
 EX.active=true;
 return '<div class="execPageV1"><div class="execToolbarV1"><div class="execSegmentV1"><button class="'+(EX.period==="day"?"on":"")+'" onclick="execSetPeriodV1(\'day\')">D-1</button><button class="'+(EX.period==="week"?"on":"")+'" onclick="execSetPeriodV1(\'week\')">Semana</button><button class="'+(EX.period==="month"?"on":"")+'" onclick="execSetPeriodV1(\'month\')">Mês</button></div><div style="display:flex;flex-wrap:wrap;gap:7px"><button class="light" onclick="execRefreshV1()">↻ Atualizar</button>'+(isMain()?'<button class="orange" onclick="execShowAdminV1()">＋ Benchmark</button>':'')+'<button onclick="execShareV1()">↗ Compartilhar</button></div></div><div id="execMessageV1"></div><div id="execVisualV1"><div class="execSectionV1">Consolidando relatórios oficiais e o FCA...</div></div><div id="execAdminSlotV1"></div></div>';
}
function render(){
 const root=document.getElementById("execVisualV1");if(!root)return;
 if(EX.loading&&!EX.data){root.innerHTML='<div class="execSectionV1">Consultando o histórico de resultados...</div>';return}
 const data=regionalData(),b=data.benchmark,co=b?.company_share==null?null:n(b.company_share);
 const rg=data.share,gap=rg==null||co==null?null:rg-co,cap=data.rows.length?data.total.captured:(b?.regional_captured??null),orders=data.rows.length?data.total.orders:(b?.regional_orders??null),target=data.total.target||null;
 const att=cap!=null&&target>0?cap/target:null;
 const date=latestDate(),dateRange=periodBounds(EX.period,date),title=EX.period==="day"?"D-1":EX.period==="week"?"ACUMULADO SEMANAL":"ACUMULADO MENSAL";
 const dateLabel=EX.period==="day"?dia(date):dia(dateRange.start_date)+" a "+dia(date);
 const absMax=Math.max(.00001,rg||0,co||0);
 const regionMeter=rg==null?0:Math.min(100,100*rg/absMax);
 const nationalMeter=co==null?0:Math.min(100,100*co/absMax);
 const zeros=opportunities(),trend=trendData(),regRows=data.rows;
 const podium=topCollaborators();
 const ordered=[podium[1],podium[0],podium[2]];
 const greenDelta=data.delta,regShares=data.share;
 const fca=EX.fca;
 const trendRows=EX.period==="week"&&(fca?.currentPartial?.end===date)?[...(fca.currentPartial.retractions||[])].slice(0,5):EX.period==="week"?[...(fca?.prioritized||[])].slice(0,5):[];
 let shareHtml=top3HTML("TOP 3 | SHARE",topRows("share"),"share",percent);
 let salesHtml=top3HTML("TOP 3 | CAPTAÇÃO",topRows("c"),"c",money);
 let ordersHtml=top3HTML("TOP 3 | PEDIDOS",topRows("o"),"o",count);
 let missing=!b?'<p class="execErrorV1">Benchmark empresa não informado para '+dateLabel+'. A comparação em p.p. ficará indisponível até o import oficial.</p>':"";
 let caption=EX.period==="week"&&greenDelta!=null?"▲▼ SHARE SEMANAL: "+pp(greenDelta)+" vs período anterior (FCA)":
 EX.period==="month"?"Evolução mensal em p.p.: requer período comparativo oficial.":"Captação regional do D-1 a partir do gerencial.";
 const stale=EX.period!=="day"&&!same(date,currentAsOf());
 const detail=stale?'<p class="execErrorV1">Data histórica: o consolidado da regional por loja não está disponível para essa seleção. Consulte o FCA ou o relatório gerencial correspondente.</p>':"";
 const zeroBlock=EX.period==="day"?'<div class="execZeroV1"><h4>LOJAS ZERADAS | D-1</h4><div class="big">'+(zeros.missing.length?'—':zeros.zeros.length)+'</div><small>'+(zeros.missing.length?zeros.missing.length+' lojas sem atualização no gerencial':"lojas com captação zero")+'</small><strong>'+money(zeros.potential)+'</strong><small>Potencial da meta dessas lojas</small><br><b>'+percent(zeros.ratio)+'</b><small> da meta regional</small></div>':
 '<div class="execZeroV1"><h4>EVOLUÇÃO SHARE | FCA</h4><div class="big" style="font-size:23px">'+(greenDelta==null?"—":pp(greenDelta))+'</div><small>'+caption+'</small><br><strong style="font-size:15px">Fonte: FCA semanal</strong></div>';
 const right=EX.period==="day"?(
   zeros.missing.length?'<p class="execHelpV1">Sem input: '+zeros.missing.join(", ")+'</p>':
   zeros.zeros.length?'<table class="execTableV1"><tr><th>LOJA</th><th>STATUS</th><th>META (R$)</th></tr>'+zeros.zeros.slice(0,5).map(x=>'<tr><td>'+e(x.st)+'</td><td class="execDangerV1">ZERADA</td><td>'+money(x.target)+'</td></tr>').join("")+'</table>':
   '<p class="execHelpV1">Todas as lojas com captação informada.</p>'
 ):trendRows.length?'<table class="execTableV1"><tr><th>LOJA</th><th>ANTERIOR</th><th>ATUAL</th><th>Δ SHARE</th></tr>'+trendRows.map(x=>'<tr><td>'+e(x.st)+'</td><td>'+percent(x.previous_share)+'</td><td>'+percent(x.share)+'</td><td class="'+(n(x.share_delta)<0?"execDangerV1":"execSuccessV1")+'">'+pp(x.share_delta)+'</td></tr>').join("")+'</table>':
 '<p class="execHelpV1">Nenhuma retração semanal disponível no FCA.</p>';
 const html='<div class="execReportV1" id="execShareCardV1">'+
  '<header class="execHeaderV1"><div class="execHeadTopV1"><img src="'+logo+'" alt="Riachuelo"><span>Moda que inspira o Brasil</span></div>'+
  '<div class="execTitleV1">eStore | CE+PI</div><div class="execSubV1">PAINEL EXECUTIVO DE RESULTADOS</div><div class="execDateBandV1">▣ '+title+' | '+dateLabel+'</div></header>'+
  '<div class="execBodyV1"><section class="execSectionV1"><div class="execSectionTitleV1">VISÃO GERAL | CE+PI × EMPRESA</div>'+
  '<div class="execKpisV1"><div class="execKpiV1"><label>CAPTAÇÃO CE+PI</label><strong>'+money(cap)+'</strong><small>Fonte Gestão/Lojas</small></div>'+
  '<div class="execKpiV1"><label>PEDIDOS</label><strong>'+count(orders)+'</strong><small>CE+PI</small></div>'+
  '<div class="execKpiV1"><label>SHARE REGIONAL</label><strong>'+percent(rg)+'</strong><small class="execTrendV1 '+(greenDelta<0?"down":"up")+'">'+(greenDelta==null?"vs Empresa":pp(greenDelta)+" vs FCA")+'</small></div>'+
  '<div class="execKpiV1"><label>ATING. META</label><strong>'+percent(att)+'</strong><small>Meta financeira eStore</small></div></div>'+
  '<div class="execCompareV1"><div><div class="execBarLabelV1"><span>CE+PI</span><b>'+percent(rg)+'</b><div class="execMeterV1"><i style="width:'+regionMeter+'%"></i></div></div>'+
  '<div class="execBarLabelV1"><span>Empresa</span><b>'+percent(co)+'</b><div class="execMeterV1 national"><i style="width:'+nationalMeter+'%"></i></div></div></div>'+
  '<div class="execDiffV1"><b style="'+(gap!=null&&gap>=0?"color:#148152":"")+'">'+pp(gap)+'</b><small>Desvio vs empresa</small></div></div></section>'+
  '<section class="execSectionV1"><div class="execSectionTitleV1">EVOLUÇÃO DA CAPTAÇÃO (R$)</div>'+
  '<div class="execChartLegendV1"><span><i class="execDotV1"></i>CE+PI • Captado</span><span><i class="execDotV1 orange"></i>Share empresa*</span></div>'+drawChart(trend)+
  '<small class="execHelpV1">* Linha do benchmark disponível somente nos dias importados; eixo da direita: share %.</small></section>'+
  '<div class="execTriGridV1">'+salesHtml+ordersHtml+shareHtml+'</div>'+
  '<div class="execPairV1" style="margin-top:12px">'+zeroBlock+'<section class="execPriorityV1"><h4>'+(EX.period==="day"?"LOJAS PRIORIZADAS | ZERAGEM":"MAIORES RETRAÇÕES | FCA")+'</h4>'+right+'</section></div>'+
  '<section class="execSectionV1"><div class="execSectionTitleV1">TOP 3 COLABORADORES | VENDA CAPTADA</div><div class="execPodiumV1">'+
  ordered.map((x,i)=>x?'<div class="'+(i===1?"winner":"")+'"><span class="execMedalV1">'+(i===1?"1":i===0?"2":"3")+'º</span><div class="execAvatarV1">'+e(String(x.name||"?").slice(0,1))+'</div><b>'+e(x.name)+'</b><small>Loja '+e(x.st)+'</small><strong>'+money(x.c)+'</strong></div>':'<div><div class="execAvatarV1">—</div><small>Sem dados</small></div>').join("")+'</div></section>'+
  '<div class="execBottomV1"><div class="execFocusV1"><b>🎯 FOCO DO DIA</b><div>'+(EX.period==="day"?"Mobilizar as lojas sem captação e recuperar o potencial disponível.":EX.period==="week"?"Reverter as maiores retrações de share identificadas no FCA.":"Reforçar produtividade e participação das lojas na entrega mensal.")+'</div></div>'+
  '<div class="execValuesV1">Talento é conquista<br>Ninguém faz nada sozinho<br>Vontade de crescer<br>Simples é incrível</div></div>'+
  '<p class="execSourceV1">'+(b?"Benchmark oficial da empresa • "+dia(b.updated_at.slice(0,10)):"Aguardando benchmark oficial")+' | Gerencial eStore CE+PI</p></div>'+
  '<footer class="execFootV1"><img src="'+logo+'" alt="Riachuelo"><span>Moda que inspira o Brasil</span></footer></div>';
 root.innerHTML=missing+detail+html+'<p class="execHelpV1" style="text-align:center;margin:12px">Os rankings refletem o último período gerencial disponível. Períodos sem base oficial não são estimados.</p>';
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
 const rg=regionalData(),b=rg.benchmark,zero=opportunities(),period=EX.period==="day"?"D-1":EX.period==="week"?"SEMANA":"MÊS";
 const d=latestDate();
 return "📊 *PAINEL eSTORE | CE+PI • "+period+"*\n"+
 "📅 "+dia(periodBounds(EX.period,d).start_date)+(EX.period!=="day"?" a "+dia(d):"")+"\n\n"+
 "💰 *Captação:* "+money2(rg.rows.length?rg.total.captured:b?.regional_captured??null)+"\n"+
 "🛍️ *Pedidos:* "+count(rg.rows.length?rg.total.orders:b?.regional_orders??null)+"\n"+
 "📈 *Share CE+PI:* "+percent(rg.share)+"\n"+
 "🏢 *Share empresa:* "+percent(b?.company_share)+"\n"+
 "↕️ *Desvio:* "+pp(rg.share!=null&&b?.company_share!=null?rg.share-n(b.company_share):null)+"\n"+
 (rg.delta==null?"":"🔺 *Evolução share vs FCA:* "+pp(rg.delta)+"\n")+
 (EX.period==="day"?"🎯 *Lojas zeradas:* "+zero.zeros.length+(zero.potential==null?"":" • potencial "+money2(zero.potential))+"\n":"")+
 "\n*Foco:* "+(EX.period==="week"?"Reverter as maiores retrações identificadas no FCA.":"Garantir produtividade e vendas em todas as filiais.")+
 "\n\nModa que inspira o Brasil";
}
async function shareCard(){
 const el=document.getElementById("execShareCardV1");if(!el)return notify("Painel indisponível.");
 try{
  const h=await loadLib("https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js","html2canvas");
  await document.fonts?.ready;
  const img=el.querySelector("img");if(img&&!img.complete)await new Promise(r=>{img.onload=r;img.onerror=r;setTimeout(r,1800)});
  const canvas=await h(el,{backgroundColor:"#F8F6F0",scale:Math.max(2,Math.min(3,1080/Math.max(320,el.offsetWidth))),useCORS:true,scrollY:-window.scrollY,logging:false});
  const blob=await new Promise(r=>canvas.toBlob(r,"image/png",1));if(!blob)throw Error("Imagem não gerada");
  const file=new File([blob],"eStore_CEPI_"+EX.period+"_"+latestDate()+".png",{type:"image/png"});
  if(navigator.canShare?.({files:[file]})&&navigator.share){
   try{await navigator.share({files:[file],title:"eStore CE+PI | Painel Executivo",text:caption()});return}catch(err){if(err.name==="AbortError")return}
  }
  const href=URL.createObjectURL(blob),a=document.createElement("a");a.href=href;a.download=file.name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(href),1800);
  try{await navigator.clipboard.writeText(caption());notify("PNG salvo e resumo copiado para WhatsApp.")}catch(_){notify("PNG gerado. Compartilhe o arquivo no WhatsApp.")}
 }catch(err){alert("Não foi possível exportar o card: "+String(err.message||err))}
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
})(window);
