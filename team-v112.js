/* ===== V112 2026-10-04: Meu Time executivo + comparativo oficial de dispersão ===== */
(function(){
  'use strict';
  if(window.__TEAM_V112_LOADED__)return;
  window.__TEAM_V112_LOADED__=true;

  const GREEN='#173F35', SAGE='#466964', ORANGE='#DE7C00', WINE='#76232F',
        RED='#E03C31', PAPER='#F7F5EF', WHITE='#FFFFFF', LINE='#DAD9D6',
        GOOD_BG='#E8F1EC', WARN_BG='#FFF2D9', BAD_BG='#F9E7E8';
  const COMPARE_CACHE={};
  const COMPARE_LOADING={};

  const originalRenderTeamV22=typeof renderTeamV22==='function'?renderTeamV22:null;
  const originalLoadTeamData=typeof loadTeamData==='function'?loadTeamData:null;

  function pad2(n){return String(n).padStart(2,'0')}
  function iso(d){return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate())}
  function dateOf(s){return new Date(String(s)+'T12:00:00')}
  function addDays(s,n){const d=dateOf(s);d.setDate(d.getDate()+n);return iso(d)}
  function daysInMonth(y,m){return new Date(y,m,0).getDate()}
  function fmtDate(s){try{return dateOf(s).toLocaleDateString('pt-BR')}catch(e){return String(s||'')}}
  function periodLabel(){return ({day:'Dia',week:'Semana',month:'Mês',year:'Ano'})[PER]||'Período'}
  function compareLabel(){
    return PER==='day'?'vs dia anterior':
           PER==='week'?'vs semana anterior equivalente':
           PER==='month'?'vs mês anterior equivalente':
           'vs ano anterior equivalente';
  }
  function currentEnd(j){
    return String(j?.endDate||j?.asof||COMMON?.asof||new Date().toLocaleDateString('en-CA',{timeZone:'America/Fortaleza'})).slice(0,10);
  }
  function comparisonRange(j){
    const end=currentEnd(j),d=dateOf(end);
    if(PER==='day'){
      const p=addDays(end,-1);return {start:p,end:p};
    }
    if(PER==='week'){
      return {start:addDays(end,-7),end:addDays(end,-7)};
    }
    if(PER==='month'){
      const pm=new Date(d.getFullYear(),d.getMonth()-1,1,12);
      const day=Math.min(d.getDate(),daysInMonth(pm.getFullYear(),pm.getMonth()+1));
      return {start:iso(pm),end:pm.getFullYear()+'-'+pad2(pm.getMonth()+1)+'-'+pad2(day)};
    }
    const py=d.getFullYear()-1,mo=d.getMonth()+1,day=Math.min(d.getDate(),daysInMonth(py,mo));
    return {start:py+'-01-01',end:py+'-'+pad2(mo)+'-'+pad2(day)};
  }
  function compareKey(j){const r=comparisonRange(j);return PER+'|'+r.start+'|'+r.end}
  function snapshotKey(period,start){return 'estore-team-dispersion-v112|'+period+'|'+start}
  function getSnapshot(period,start){try{return JSON.parse(localStorage.getItem(snapshotKey(period,start))||'null')}catch(e){return null}}
  function setSnapshot(period,start,data){try{localStorage.setItem(snapshotKey(period,start),JSON.stringify(data))}catch(e){}}

  function metric(s){
    const total=Number(s?.total||0),sold=Number(s?.sold||0),zeros=Number(s?.zeros||Math.max(0,total-sold)),
          captured=Number(s?.captured||0),orders=Number(s?.orders||0),
          ticket=orders?captured/orders:0,disp=total?zeros/total:0;
    return {...s,total,sold,zeros,captured,orders,ticket,disp,potential:zeros*ticket};
  }
  function responseMetrics(j){
    const stores=(j?.stores||[]).map(metric);
    const t=stores.reduce((z,r)=>{
      z.total+=r.total;z.sold+=r.sold;z.zeros+=r.zeros;z.captured+=r.captured;z.orders+=r.orders;z.potential+=r.potential;return z;
    },{total:0,sold:0,zeros:0,captured:0,orders:0,potential:0});
    t.disp=t.total?t.zeros/t.total:0;
    t.part=t.total?t.sold/t.total:0;
    t.ticket=t.orders?t.captured/t.orders:0;
    return {stores,total:t};
  }
  function snapshotFrom(j){
    const m=responseMetrics(j);
    return {regional:m.total.disp,stores:Object.fromEntries(m.stores.map(r=>[String(r.st),r.disp])),endDate:currentEnd(j)};
  }
  function saveCurrentSnapshot(j){
    const end=currentEnd(j),d=dateOf(end);
    let start=end;
    if(PER==='week'){const k=(d.getDay()+6)%7;start=addDays(end,-k)}
    else if(PER==='month')start=end.slice(0,7)+'-01';
    else if(PER==='year')start=end.slice(0,4)+'-01-01';
    setSnapshot(PER,start,snapshotFrom(j));
  }
  function previousSnapshot(j){
    const r=comparisonRange(j);
    let start=r.start;
    if(PER==='week'){const d=dateOf(r.end),k=(d.getDay()+6)%7;start=addDays(r.end,-k)}
    else if(PER==='month')start=r.end.slice(0,7)+'-01';
    else if(PER==='year')start=r.end.slice(0,4)+'-01-01';
    return getSnapshot(PER,start);
  }
  function responseMatchesRange(j,range){
    const end=String(j?.endDate||j?.asof||'').slice(0,10);
    return j?.dataAvailable!==false && !!end && end>=range.start && end<=range.end;
  }

  async function loadPrevious(j){
    const key=compareKey(j);
    if(COMPARE_CACHE[key])return COMPARE_CACHE[key];
    if(COMPARE_LOADING[key])return COMPARE_LOADING[key];

    COMPARE_LOADING[key]=(async()=>{
      const range=comparisonRange(j);
      let out=null;
      try{
        const req={
          action:'team_period',matricula:U.u.id,period:PER,store:U.u.st,
          reference_date:range.end,date:range.end,asof:range.end,end_date:range.end,
          month:range.end.slice(0,7),year:range.end.slice(0,4),
          start_date:range.start
        };
        const prev=await api(req);
        if(responseMatchesRange(prev,range))out=snapshotFrom(prev);
      }catch(e){console.warn('[Meu Time V112] Comparativo servidor indisponível:',e)}
      COMPARE_CACHE[key]=out||{regional:null,stores:{},endDate:range.end,missing:true};
      return COMPARE_CACHE[key];
    })();
    try{return await COMPARE_LOADING[key]}finally{delete COMPARE_LOADING[key]}
  }

  function evolution(cur,prev){
    if(prev==null||!Number.isFinite(Number(prev)))return {rel:null,pp:null};
    prev=Number(prev);cur=Number(cur)||0;
    if(prev===0)return {rel:cur===0?0:null,pp:cur-prev};
    return {rel:(cur-prev)/prev,pp:cur-prev};
  }
  function signedPp(e){
    if(!e||e.pp==null||!Number.isFinite(Number(e.pp)))return '—';
    const v=Number(e.pp)*100;
    if(Math.abs(v)<0.05)return '0,0 p.p.';
    return (v>0?'+':'')+v.toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})+' p.p.';
  }
  function evoPercent(e){
    if(!e||e.rel==null||!Number.isFinite(Number(e.rel)))return 'Sem base anterior';
    if(Math.abs(e.rel)<.0005)return '— 0,0%';
    return (e.rel<0?'↓ ':'↑ ')+(Math.abs(e.rel)*100).toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})+'%';
  }
  function evoText(e){
    if(!e||e.rel==null||!Number.isFinite(Number(e.rel)))return 'Sem base anterior';
    return evoPercent(e)+' | '+signedPp(e);
  }
  function evoClass(e){
    if(!e||e.rel==null)return 'neutral';
    return e.rel<0?'good':e.rel>0?'bad':'neutral';
  }
  function evoMeaning(e){
    if(!e||e.rel==null)return '';
    return e.rel<0?'redução':e.rel>0?'aumento':'estável';
  }
  function evoHtml(e){
    if(!e||e.rel==null)return '<span class="teamEvoV112 neutral"><b>Sem base</b><small>período anterior</small></span>';
    return '<span class="teamEvoV112 '+evoClass(e)+'"><b>'+evoPercent(e)+'</b><small>'+signedPp(e)+'</small></span>';
  }
  function storeNameV112(st){
    try{return typeof storeDisplayName==='function'?storeDisplayName(st):('Filial '+st)}catch(e){return 'Filial '+st}
  }

  function buildView(j){
    saveCurrentSnapshot(j);
    const cur=responseMetrics(j),prev=COMPARE_CACHE[compareKey(j)]||{regional:null,stores:{},missing:true},
          storePrev=prev?.stores||{},stores=cur.stores.map(r=>{
            const prevDisp=storePrev[String(r.st)];
            return {...r,prevDisp:prevDisp==null?null:Number(prevDisp),evolution:evolution(r.disp,prevDisp)};
          });
    return {j,stores,total:{...cur.total,prevDisp:prev?.regional==null?null:Number(prev.regional),evolution:evolution(cur.total.disp,prev?.regional)},previous:prev};
  }

  function injectStyles(){
    if(document.getElementById('team-v112-style'))return;
    const st=document.createElement('style');
    st.id='team-v112-style';
    st.textContent=
      '.teamRegionalV112{overflow:hidden}.teamCockpitV112{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin:14px 0 16px}.teamKpiV112{min-height:102px;border:1px solid #e5e1d9;border-radius:17px;background:#fff;padding:12px 10px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;box-shadow:0 4px 13px rgba(23,63,53,.04)}.teamKpiV112 span{font-size:9px;font-weight:900;letter-spacing:.045em;color:#466964}.teamKpiV112 b{font-size:19px;color:#173F35;margin:5px 0 2px}.teamKpiV112 small{font-size:9px;color:#6b7773}.teamKpiV112.bad{background:#f9e7e8}.teamKpiV112.good{background:#e8f1ec}.teamKpiV112.warn{background:#fff7e7}.teamKpiV112.wide{grid-column:span 2}.teamKpiV112 .teamEvoV112{margin-top:6px}'+
      '.teamEvoV112{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;padding:4px 7px;border-radius:10px;font-size:8.5px;font-weight:900;white-space:nowrap;line-height:1.05}.teamEvoV112 b{font-size:8.5px}.teamEvoV112 small{font-size:7px;margin-top:2px;opacity:.9}.teamEvoV112.good{background:#dceee4;color:#157349}.teamEvoV112.bad{background:#f5dce0;color:#9b2939}.teamEvoV112.neutral{background:#efeee9;color:#68736f}'+
      '.teamExecutiveHeadV112{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin:18px 0 8px}.teamExecutiveHeadV112 b{display:block;font-size:17px;color:#173F35}.teamExecutiveHeadV112 small{display:block;font-size:9px;color:#68736f;margin-top:3px}.teamExecutiveHeadV112>span{font-size:9px;color:#466964;font-weight:800}.teamTableWrapV112{overflow:auto;border:1px solid #e5e1d9;border-radius:16px;background:#fbfaf7;padding:5px}.teamTableV112{width:100%;min-width:1040px;border-collapse:separate;border-spacing:0 5px;table-layout:fixed}.teamTableV112 th,.teamTableV112 td{text-align:center!important;vertical-align:middle!important;white-space:nowrap;padding:8px 5px;font-size:10px}.teamTableV112 th{font-size:8px;text-transform:uppercase;letter-spacing:.02em;color:#53625d}.teamTableV112 tbody td{background:#fff}.teamTableV112 tbody tr.bad td{background:#f9e7e8}.teamTableV112 tbody tr.warn td{background:#fff2d9}.teamTableV112 tbody tr.good td{background:#e8f1ec}.teamTableV112 tbody td:first-child{border-radius:9px 0 0 9px}.teamTableV112 tbody td:last-child{border-radius:0 9px 9px 0}.teamTableV112 .teamEvoV112{margin:0;font-size:8px;padding:4px 5px;min-width:72px}.teamCompareNoteV112{margin-top:8px;text-align:center;font-size:9px;color:#68736f}.teamCompareLoadingV112{font-size:9px;color:#9a6b13;margin-top:5px}'+
      '@media(max-width:700px){.teamCockpitV112{grid-template-columns:repeat(2,minmax(0,1fr))}.teamKpiV112.wide{grid-column:span 2}.teamExecutiveHeadV112{align-items:flex-start;flex-direction:column}.teamTableV112 th,.teamTableV112 td{font-size:9px;padding:7px 4px}}';
    document.head.appendChild(st);
  }

  function cockpitHtml(d){
    const t=d.total,ec=evoClass(t.evolution);
    const cards=[
      ['COLABORADORES',intBRTeam(t.total),'HC considerado',''],
      ['COM VENDA',intBRTeam(t.sold)+' • '+pctBRTeam(t.part),'Participação do time',''],
      ['ZERADOS',intBRTeam(t.zeros)+' • '+pctBRTeam(t.disp),'Dispersão atual','bad'],
      ['EVOLUÇÃO DISP.',evoPercent(t.evolution),(t.evolution?.rel==null?'Sem base anterior':signedPp(t.evolution)+' • ant. '+pctBRTeam(t.prevDisp)+' → atual '+pctBRTeam(t.disp)),ec],
      ['VENDA CAPTADA',money(t.captured),'Resultado do período',''],
      ['PEDIDOS',intBRTeam(t.orders),'Volume do período',''],
      ['POTENCIAL TOTAL',money(t.potential),'Zerados × ticket da filial','warn wide']
    ];
    return '<div class=teamCockpitV112>'+cards.map((a,i)=>
      '<div class="teamKpiV112 '+a[3]+'"><span>'+a[0]+'</span><b>'+a[1]+'</b><small>'+a[2]+'</small>'+
      (i===3&&d.previous?.missing?'<em class=teamCompareLoadingV112>Base anterior ainda não disponível</em>':'')+'</div>'
    ).join('')+'</div>';
  }

  function regionalTableHtml(d){
    return '<div class=teamExecutiveHeadV112><div><b>Painel por filial</b><small>Dispersão = colaboradores zerados ÷ HC da própria filial</small></div><span>'+compareLabel()+'</span></div>'+
      '<div class=teamTableWrapV112><table class=teamTableV112><thead><tr><th>Loja</th><th>HC</th><th>Com venda</th><th>%</th><th>Zerados</th><th>Disp. atual</th><th>Disp. anterior</th><th>Evolução</th><th>Ticket médio</th><th>Potencial</th></tr></thead><tbody>'+
      d.stores.map(r=>{
        const cls=r.disp>=.8?'bad':r.disp>=.6?'warn':'good';
        return '<tr class="'+cls+'"><td><b>'+esc(r.st)+'</b></td><td>'+intBRTeam(r.total)+'</td><td>'+intBRTeam(r.sold)+'</td><td>'+pctBRTeam(r.total?r.sold/r.total:0)+'</td><td><b>'+intBRTeam(r.zeros)+'</b></td><td><b>'+pctBRTeam(r.disp)+'</b></td><td>'+(r.prevDisp==null?'—':pctBRTeam(r.prevDisp))+'</td><td>'+evoHtml(r.evolution)+'</td><td>'+money(r.ticket)+'</td><td><b>'+money(r.potential)+'</b></td></tr>';
      }).join('')+'</tbody></table></div>'+
      '<div class=teamCompareNoteV112><b>Evolução:</b> % = (dispersão atual − anterior) ÷ anterior • p.p. = dispersão atual − dispersão anterior. Quanto menor a dispersão, maior a participação do time com venda no eStore.</div>';
  }

  renderTeamV22=function(j){
    if(TEAM_SCOPE!=='regional'||!j?.stores?.length){
      return originalRenderTeamV22?originalRenderTeamV22(j):'<div class=notice>Sem dados do Meu Time.</div>';
    }
    injectStyles();
    const d=buildView(j),date=j.endDate?fmtDate(j.endDate):'';
    if(!COMPARE_CACHE[compareKey(j)]&&!COMPARE_LOADING[compareKey(j)]){
      setTimeout(()=>loadPrevious(j).then(()=>{
        if(TEAM_SCOPE==='regional'&&document.getElementById('view'))document.getElementById('view').innerHTML=team();
      }).catch(()=>{}),0);
    }
    return '<div class="card teamRegionalV112"><div class=title>Meu Time</div><div class=muted>Visão Regional CE+PI • '+periodLabel()+(date?' • '+date:'')+'</div>'+
      '<div class=scopeSwitch><button onclick="TEAM_SCOPE=\'store\';TEAM_FILTER=\'all\';go(\'team\')">Minha Filial</button><button class=on>Regional CE+PI</button></div>'+
      teamPeriodTabs()+cockpitHtml(d)+regionalTableHtml(d)+teamDashboardButton()+'</div>';
  };

  if(originalLoadTeamData){
    loadTeamData=async function(){
      const j=await originalLoadTeamData();
      saveCurrentSnapshot(j);
      try{await loadPrevious(j)}catch(e){console.warn('[Meu Time V112] comparação oficial indisponível',e)}
      return j;
    };
  }

  function canvasRound(ctx,x,y,w,h,r,fill){
    ctx.fillStyle=fill;ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);else ctx.rect(x,y,w,h);ctx.fill();
  }
  function canvasText(ctx,text,x,y,font,color,align='center',maxW){
    ctx.font=font;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='middle';
    let s=String(text??'');
    if(maxW){
      while(s.length>2&&ctx.measureText(s).width>maxW)s=s.slice(0,-1);
      if(s!==String(text??''))s=s.slice(0,-1)+'…';
    }
    ctx.fillText(s,x,y);
  }
  function logoV112(){
    return new Promise(ok=>{
      const im=new Image();im.onload=()=>ok(im);im.onerror=()=>ok(null);
      im.src='./riachuelo-horizontal-oficial.png?v=109';
    });
  }
  function listTop(stores,asc){
    return stores.filter(r=>r.total>0).slice().sort((a,b)=>asc?a.disp-b.disp:b.disp-a.disp).slice(0,5);
  }
  function captionStore(r){
    const prev=r.prevDisp==null?'sem base':pctBRTeam(r.prevDisp);
    return r.st+' • '+storeNameV112(r.st)+' — '+prev+' → '+pctBRTeam(r.disp)+' | '+evoText(r.evolution);
  }
  function shareCaption(d){
    const best=listTop(d.stores,true),worst=listTop(d.stores,false),t=d.total;
    const evo=evoText(t.evolution),meaning=evoMeaning(t.evolution);
    return [
      '📊 *DISPERSÃO eStore | REGIONAL CE+PI*',
      '*'+periodLabel()+' • atualizado até '+fmtDate(currentEnd(d.j))+'*',
      '',
      '🔴 *Dispersão regional atual:* '+pctBRTeam(t.disp),
      '⚪ *Dispersão anterior:* '+(t.prevDisp==null?'sem base':pctBRTeam(t.prevDisp)),
      '📈 *Evolução '+compareLabel()+':* '+evo+(meaning?' • '+meaning+' da dispersão':''),
      '👥 *HC:* '+intBRTeam(t.total)+' | *Com venda:* '+intBRTeam(t.sold)+' | *Zerados:* '+intBRTeam(t.zeros),
      '',
      '🟢 *5 menores dispersões*',
      ...best.map((r,i)=>(i+1)+'. '+captionStore(r)),
      '',
      '🔴 *5 maiores dispersões*',
      ...worst.map((r,i)=>(i+1)+'. '+captionStore(r))
    ].join('\n');
  }

  teamCardCanvas=async function(){
    const raw=teamCardData();
    if(!raw||!raw.regional)return null;
    const j=raw.j;
    if(!COMPARE_CACHE[compareKey(j)])try{await loadPrevious(j)}catch(e){}
    const d=buildView(j),stores=d.stores,W=1200,rowH=47,tableY=520,firstRow=565;
    const summaryY=firstRow+stores.length*rowH+35,H=Math.max(1600,summaryY+190);
    const cv=document.createElement('canvas');cv.width=W;cv.height=H;
    const x=cv.getContext('2d');x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';
    x.fillStyle=PAPER;x.fillRect(0,0,W,H);

    const logo=await logoV112();
    if(logo){
      const ratio=logo.naturalWidth/logo.naturalHeight,lw=365,lh=Math.min(72,lw/ratio);
      x.drawImage(logo,58,42,lw,lh);
    }
    x.strokeStyle=LINE;x.lineWidth=2;x.beginPath();x.moveTo(458,35);x.lineTo(458,130);x.stroke();
    x.textAlign='left';x.fillStyle=GREEN;x.font='700 37px Arial';x.fillText('MEU TIME',500,69);
    x.font='700 18px Arial';x.fillText('REGIONAL CE+PI',500,101);
    x.font='16px Arial';x.fillStyle=SAGE;x.fillText(periodLabel()+' • '+fmtDate(currentEnd(j)),500,128);

    const t=d.total,cardW=262,gap=16,xs=[58,336,614,892],y1=165,h=105;
    const cards1=[
      ['COLABORADORES',intBRTeam(t.total),'HC considerado',WHITE,GREEN],
      ['COM VENDA',intBRTeam(t.sold)+' • '+pctBRTeam(t.part),'Participação',WHITE,GREEN],
      ['ZERADOS',intBRTeam(t.zeros)+' • '+pctBRTeam(t.disp),'Dispersão atual',BAD_BG,WINE],
      ['EVOLUÇÃO DISP.',evoPercent(t.evolution),(t.evolution?.rel==null?'Sem base anterior':signedPp(t.evolution)+' • ant. '+pctBRTeam(t.prevDisp)),evoClass(t.evolution)==='good'?GOOD_BG:evoClass(t.evolution)==='bad'?BAD_BG:WHITE,evoClass(t.evolution)==='good'?'#157349':evoClass(t.evolution)==='bad'?WINE:GREEN]
    ];
    cards1.forEach((a,i)=>{
      canvasRound(x,xs[i],y1,cardW,h,17,a[3]);
      canvasText(x,a[0],xs[i]+cardW/2,y1+24,'700 12px Arial',SAGE,'center',cardW-24);
      canvasText(x,a[1],xs[i]+cardW/2,y1+57,'700 23px Arial',a[4],'center',cardW-24);
      canvasText(x,a[2],xs[i]+cardW/2,y1+86,'500 10px Arial','#68736F','center',cardW-24);
    });
    const y2=286,w2=344,x2=[58,428,798];
    [
      ['VENDA CAPTADA',money(t.captured),'Resultado do período',WHITE,GREEN],
      ['PEDIDOS',intBRTeam(t.orders),'Volume do período',WHITE,GREEN],
      ['POTENCIAL TOTAL',money(t.potential),'Zerados × ticket da filial','#FFF7E8',ORANGE]
    ].forEach((a,i)=>{
      canvasRound(x,x2[i],y2,w2,104,17,a[3]);
      canvasText(x,a[0],x2[i]+w2/2,y2+24,'700 12px Arial',SAGE,'center',w2-24);
      canvasText(x,a[1],x2[i]+w2/2,y2+58,'700 24px Arial',a[4],'center',w2-24);
      canvasText(x,a[2],x2[i]+w2/2,y2+86,'500 10px Arial','#68736F','center',w2-24);
    });

    x.textAlign='left';x.fillStyle=GREEN;x.font='700 25px Arial';x.fillText('PAINEL POR FILIAL',58,442);
    x.fillStyle=SAGE;x.font='14px Arial';x.fillText('Dispersão = zerados ÷ HC • '+compareLabel(),58,468);

    const cols=[62,120,205,286,365,455,555,685,850,1045],
          heads=['LOJA','HC','COM VENDA','%','ZERADOS','DISP. ATUAL','DISP. ANT.','EVOLUÇÃO','TICKET MÉDIO','POTENCIAL'],
          widths=[60,50,100,60,78,92,92,160,125,145];
    heads.forEach((h,i)=>canvasText(x,h,cols[i],tableY,'700 10px Arial','#53625D','center',widths[i]));

    let y=firstRow;
    stores.forEach(r=>{
      const fill=r.disp>=.8?BAD_BG:r.disp>=.6?WARN_BG:GOOD_BG;
      canvasRound(x,48,y-29,1104,39,8,fill);
      const vals=[r.st,intBRTeam(r.total),intBRTeam(r.sold),pctBRTeam(r.total?r.sold/r.total:0),intBRTeam(r.zeros),pctBRTeam(r.disp),(r.prevDisp==null?'—':pctBRTeam(r.prevDisp)),(r.evolution?.rel==null?'Sem base':evoPercent(r.evolution)+' / '+signedPp(r.evolution)),money(r.ticket),money(r.potential)];
      vals.forEach((v,i)=>{
        const col=i===7?(evoClass(r.evolution)==='good'?'#157349':evoClass(r.evolution)==='bad'?WINE:GREEN):(i===4||i===5?(r.disp>=.8?WINE:r.disp>=.6?ORANGE:GREEN):GREEN);
        canvasText(x,v,cols[i],y-9,(i===0||i===4||i===5||i===9?'700 ':'500 ')+(i===7?'9.5':'11.5')+'px Arial',col,'center',widths[i]);
      });
      y+=rowH;
    });

    const best=listTop(stores,true),worst=listTop(stores,false);
    const sy=y+18;
    x.textAlign='left';x.fillStyle=GREEN;x.font='700 17px Arial';x.fillText('LEITURA EXECUTIVA',58,sy);
    x.font='13px Arial';x.fillStyle=SAGE;x.fillText('Dispersão regional: '+(t.prevDisp==null?'—':pctBRTeam(t.prevDisp))+' → '+pctBRTeam(t.disp)+' • '+evoText(t.evolution)+' • '+compareLabel(),58,sy+28);
    x.font='700 12px Arial';x.fillStyle='#157349';x.fillText('5 menores: '+best.map(r=>r.st+' '+pctBRTeam(r.disp)).join(' • '),58,sy+56);
    x.fillStyle=WINE;x.fillText('5 maiores: '+worst.map(r=>r.st+' '+pctBRTeam(r.disp)).join(' • '),58,sy+82);

    const fy=H-47;x.strokeStyle='#BFC8C3';x.beginPath();x.moveTo(58,fy-18);x.lineTo(1142,fy-18);x.stroke();
    x.fillStyle=GREEN;x.font='700 11px Arial';x.textAlign='left';x.fillText('MODA QUE INSPIRA O BRASIL',58,fy);
    x.textAlign='right';x.fillText('App. eStore CE+PI',1142,fy);
    return cv;
  };

  previewTeamCard=async function(){
    try{
      const c=await teamCardCanvas();
      if(!c)return alert('Aguarde o carregamento dos dados do Meu Time.');
      const m=document.createElement('div');m.className='previewModal';
      m.innerHTML='<div class=box><img src="'+c.toDataURL('image/png')+'" alt="Dashboard Meu Time"><div class=toolbar><button class=btn onclick="shareTeamCard()">Compartilhar</button><button class="btn ghost" onclick="this.closest(\'.previewModal\').remove()">Fechar</button></div></div>';
      m.onclick=e=>{if(e.target===m)m.remove()};document.body.appendChild(m);
    }catch(e){console.error('Dashboard Meu Time V112:',e);alert('Não foi possível gerar o dashboard. Atualize a página e tente novamente.')}
  };

  shareTeamCard=async function(){
    try{
      const raw=teamCardData();if(!raw||!raw.regional)return alert('Abra a visão Regional CE+PI antes de compartilhar o painel.');
      if(!COMPARE_CACHE[compareKey(raw.j)])try{await loadPrevious(raw.j)}catch(e){}
      const d=buildView(raw.j),caption=shareCaption(d),c=await teamCardCanvas();
      if(!c)return alert('Aguarde o carregamento dos dados do Meu Time.');
      const b=await new Promise(r=>c.toBlob(r,'image/png',.98));if(!b)throw new Error('Falha ao gerar imagem');
      const f=new File([b],'Meu_Time_Dispersao_CEPI_'+PER+'.png',{type:'image/png'});
      if(navigator.share){
        try{
          if(!navigator.canShare||navigator.canShare({files:[f]})){
            await navigator.share({files:[f],title:'Meu Time • Dispersão eStore CE+PI',text:caption});return;
          }
        }catch(e){if(e&&e.name==='AbortError')return}
      }
      try{await navigator.clipboard.writeText(caption)}catch(e){}
      const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=f.name;document.body.appendChild(a);a.click();
      setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);
      alert('Painel gerado. A legenda-resumo foi copiada para compartilhamento.');
    }catch(e){console.error('Compartilhar Meu Time V112:',e);alert('Não foi possível compartilhar o card. Tente novamente.')}
  };

  injectStyles();
})();
