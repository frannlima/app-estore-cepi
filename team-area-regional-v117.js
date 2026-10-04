/* ===== V117 2026-10-04: Dispersão regional por áreas ===== */
(function(){
  'use strict';
  if(window.__TEAM_AREA_REGIONAL_V117__)return;
  window.__TEAM_AREA_REGIONAL_V117__=true;

  const GREEN='#173F35',SAGE='#466964',ORANGE='#DE7C00',GRAY='#DAD9D6',BEIGE='#D6D2C4',PAPER='#F7F5EF',WHITE='#FFFFFF';
  const baseRenderTeamV117=window.renderTeamV22;
  const baseTeamCardCanvasV117=window.teamCardCanvas;
  const AREA_PREV_CACHE_V117={};
  const AREA_PREV_LOADING_V117={};

  function norm117(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
  function areaOf117(r){
    const role=norm117(r?.cargo||r?.role||'');
    if(/caixa|atendimento|balcao|balcoes|servic|solucoes|credi|financeir|administrativ/.test(role))return 'Caixa / Atendimento';
    return 'Operações';
  }
  function metric117(rows){
    const total=(rows||[]).length,sold=(rows||[]).filter(x=>(+x.c||0)>0).length,zeros=Math.max(0,total-sold);
    return {total,sold,zeros,disp:total?zeros/total:0};
  }
  function areaMetrics117(j){
    const rows=(j?.stores||[]).flatMap(s=>s?.rows||[]);
    const g={'Operações':[],'Caixa / Atendimento':[]};
    rows.forEach(r=>g[areaOf117(r)].push(r));
    return {'Operações':metric117(g['Operações']),'Caixa / Atendimento':metric117(g['Caixa / Atendimento'])};
  }
  function addDays117(s,n){const d=new Date(String(s)+'T12:00:00');d.setDate(d.getDate()+n);return d.toLocaleDateString('en-CA')}
  function dim117(y,m){return new Date(y,m,0).getDate()}
  function prevRef117(end){
    const d=new Date(String(end)+'T12:00:00');
    if(PER==='day')return addDays117(end,-1);
    if(PER==='week')return addDays117(end,-7);
    if(PER==='month'){
      const p=new Date(d.getFullYear(),d.getMonth()-1,1,12),day=Math.min(d.getDate(),dim117(p.getFullYear(),p.getMonth()+1));
      return p.getFullYear()+'-'+String(p.getMonth()+1).padStart(2,'0')+'-'+String(day).padStart(2,'0');
    }
    const y=d.getFullYear()-1,m=d.getMonth()+1,day=Math.min(d.getDate(),dim117(y,m));
    return y+'-'+String(m).padStart(2,'0')+'-'+String(day).padStart(2,'0');
  }
  function areaKey117(j){return PER+'|'+String(j?.endDate||j?.asof||'')}
  async function loadPrev117(j){
    const key=areaKey117(j);
    if(AREA_PREV_CACHE_V117[key])return AREA_PREV_CACHE_V117[key];
    if(AREA_PREV_LOADING_V117[key])return AREA_PREV_LOADING_V117[key];
    AREA_PREV_LOADING_V117[key]=(async()=>{
      const end=String(j?.endDate||j?.asof||'').slice(0,10);
      if(!end)return null;
      const ref=prevRef117(end);
      try{
        const p=await api({action:'team_period',matricula:U.u.id,period:PER,store:U.u.st,reference_date:ref,date:ref,asof:ref,end_date:ref});
        if(p?.dataAvailable===false)return null;
        AREA_PREV_CACHE_V117[key]=p;return p;
      }catch(e){console.warn('[V117] comparação por áreas indisponível',e);return null}
      finally{delete AREA_PREV_LOADING_V117[key]}
    })();
    return AREA_PREV_LOADING_V117[key];
  }
  function evo117(cur,prev){
    if(prev==null||!Number.isFinite(+prev))return {pp:null};
    return {pp:(+cur||0)-(+prev||0)};
  }
  function pct117(v){return ((+v||0)*100).toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})+'%'}
  function pp117(e){
    if(!e||e.pp==null)return 'Sem base';
    const v=e.pp*100;
    if(Math.abs(v)<.05)return '— 0,0 p.p.';
    return (v<0?'↓ ':'↑ ')+(Math.abs(v)).toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})+' p.p.';
  }
  function areaCardHtml117(label,m,pm){
    const ev=evo117(m.disp,pm?.disp),good=ev.pp!=null&&ev.pp<0,bad=ev.pp!=null&&ev.pp>0,deg=Math.max(0,Math.min(360,m.disp*360));
    return '<div class=areaCardV117>'+
      '<div class=areaTitleV117>'+label+'</div>'+
      '<div class=areaBodyV117>'+
        '<div class=areaDonutV117 style="background:conic-gradient('+ORANGE+' 0deg '+deg+'deg,'+GREEN+' '+deg+'deg 360deg)"><div><b>'+pct117(m.disp)+'</b><small>dispersão</small></div></div>'+
        '<div class=areaStatsV117>'+
          '<span><b>'+m.zeros+'</b> sem venda</span>'+
          '<span><b>'+m.sold+'</b> com venda</span>'+
          '<span><b>'+m.total+'</b> HC</span>'+
          '<em class="'+(good?'good':bad?'bad':'neutral')+'">'+pp117(ev)+'</em>'+
        '</div>'+
      '</div>'+
    '</div>';
  }
  function areaSection117(j){
    const cur=areaMetrics117(j),prev=AREA_PREV_CACHE_V117[areaKey117(j)],pm=prev?areaMetrics117(prev):{};
    return '<div class=areaSectionV117>'+
      '<div class=areaHeadV117><div><b>Dispersão por áreas</b><small>Base elegível ao comissionamento • evolução em p.p. vs período anterior equivalente</small></div><div class=areaLegendV117><span><i style="background:'+ORANGE+'"></i>Sem venda</span><span><i style="background:'+GREEN+'"></i>Com venda</span></div></div>'+
      '<div class=areaGridV117>'+
        areaCardHtml117('Operações',cur['Operações'],pm?.['Operações'])+
        areaCardHtml117('Caixa / Atendimento',cur['Caixa / Atendimento'],pm?.['Caixa / Atendimento'])+
      '</div>'+
    '</div>';
  }
  function injectStyle117(){
    if(document.getElementById('team-area-v117-style'))return;
    const st=document.createElement('style');st.id='team-area-v117-style';
    st.textContent=
      '.areaSectionV117{margin:18px 0 20px;padding:16px;border:1px solid #e2ded5;border-radius:18px;background:#f8f6f0}.areaHeadV117{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;margin-bottom:13px}.areaHeadV117 b{display:block;color:#173F35;font-size:17px}.areaHeadV117 small{display:block;color:#68736f;font-size:9px;margin-top:3px}.areaLegendV117{display:flex;gap:10px;font-size:9px;color:#466964}.areaLegendV117 span{display:flex;align-items:center;gap:4px}.areaLegendV117 i{width:8px;height:8px;border-radius:50%}.areaGridV117{display:grid;grid-template-columns:1fr 1fr;gap:12px}.areaCardV117{background:#fff;border:1px solid #e4e0d8;border-radius:16px;padding:13px}.areaTitleV117{font-weight:900;color:#173F35;font-size:14px;margin-bottom:10px}.areaBodyV117{display:flex;align-items:center;gap:14px}.areaDonutV117{width:105px;height:105px;border-radius:50%;display:grid;place-items:center;flex:0 0 auto}.areaDonutV117>div{width:69px;height:69px;border-radius:50%;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:inset 0 0 0 1px #eee}.areaDonutV117 b{font-size:16px;color:#173F35}.areaDonutV117 small{font-size:8px;color:#466964}.areaStatsV117{display:flex;flex-direction:column;gap:5px;font-size:10px;color:#466964}.areaStatsV117 b{color:#173F35}.areaStatsV117 em{font-style:normal;font-weight:900;padding:5px 7px;border-radius:999px;width:max-content}.areaStatsV117 em.good{background:#e3f0e7;color:#157349}.areaStatsV117 em.bad{background:#fff0dd;color:#a85c00}.areaStatsV117 em.neutral{background:#efeee9;color:#68736f}@media(max-width:650px){.areaHeadV117{align-items:flex-start;flex-direction:column}.areaGridV117{grid-template-columns:1fr}.areaBodyV117{justify-content:center}.areaCardV117{padding:14px}.areaDonutV117{width:116px;height:116px}.areaDonutV117>div{width:76px;height:76px}.areaStatsV117{min-width:145px;font-size:11px}}';
    document.head.appendChild(st);
  }

  window.renderTeamV22=function(j){
    injectStyle117();
    const html=typeof baseRenderTeamV117==='function'?baseRenderTeamV117(j):'';
    if(TEAM_SCOPE!=='regional'||!j?.stores?.length)return html;
    const key=areaKey117(j);
    if(!AREA_PREV_CACHE_V117[key]&&!AREA_PREV_LOADING_V117[key]){
      setTimeout(()=>loadPrev117(j).then(()=>{
        if(TEAM_SCOPE==='regional'&&CUR==='team'&&document.getElementById('view'))document.getElementById('view').innerHTML=team();
      }),30);
    }
    const section=areaSection117(j);
    const marker='<div class=teamExecutiveHeadV112>';
    return html.includes(marker)?html.replace(marker,section+marker):html+section;
  };

  function rr117(ctx,x,y,w,h,r,fill,stroke){
    ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,r):ctx.rect(x,y,w,h);
    ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}
  }
  function txt117(ctx,t,x,y,font,color,align='left'){
    ctx.font=font;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(String(t),x,y);
  }
  function donut117(ctx,cx,cy,r,disp){
    ctx.lineWidth=24;ctx.lineCap='butt';
    ctx.beginPath();ctx.strokeStyle=GRAY;ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();
    const start=-Math.PI/2,end=start+Math.PI*2*Math.max(0,Math.min(1,disp));
    ctx.beginPath();ctx.strokeStyle=ORANGE;ctx.arc(cx,cy,r,start,end);ctx.stroke();
    ctx.beginPath();ctx.strokeStyle=GREEN;ctx.arc(cx,cy,r,end,start+Math.PI*2);ctx.stroke();
  }
  function drawArea117(ctx,x,y,w,label,m,pm){
    const ev=evo117(m.disp,pm?.disp);
    rr117(ctx,x,y,w,275,18,WHITE,'#E4E0D8');
    txt117(ctx,label,x+26,y+35,'700 22px Arial',GREEN);
    donut117(ctx,x+135,y+145,72,m.disp);
    txt117(ctx,pct117(m.disp),x+135,y+137,'700 26px Arial',GREEN,'center');
    txt117(ctx,'dispersão',x+135,y+167,'500 12px Arial',SAGE,'center');
    ctx.strokeStyle=GRAY;ctx.beginPath();ctx.moveTo(x+250,y+78);ctx.lineTo(x+250,y+235);ctx.stroke();
    txt117(ctx,m.zeros+' sem venda',x+282,y+98,'700 15px Arial',GREEN);
    txt117(ctx,m.sold+' com venda',x+282,y+129,'600 14px Arial',SAGE);
    txt117(ctx,m.total+' HC',x+282,y+160,'600 14px Arial',SAGE);
    txt117(ctx,'Evolução',x+282,y+198,'500 12px Arial',SAGE);
    txt117(ctx,pp117(ev),x+282,y+230,'700 20px Arial',ev.pp!=null&&ev.pp<0?GREEN:ev.pp!=null&&ev.pp>0?ORANGE:SAGE);
  }

  window.teamCardCanvas=async function(){
    const base=await baseTeamCardCanvasV117();
    if(TEAM_SCOPE!=='regional'||!base)return base;
    const raw=typeof teamCardData==='function'?teamCardData():null;
    if(!raw?.j)return base;
    const prev=await loadPrev117(raw.j),cur=areaMetrics117(raw.j),pm=prev?areaMetrics117(prev):{};
    const extra=390,cv=document.createElement('canvas');cv.width=base.width;cv.height=base.height+extra;
    const ctx=cv.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    ctx.fillStyle=PAPER;ctx.fillRect(0,0,cv.width,cv.height);ctx.drawImage(base,0,0);
    const y=base.height+22;
    txt117(ctx,'DISPERSÃO POR ÁREAS',60,y+24,'700 28px Arial',GREEN);
    txt117(ctx,'Base elegível ao comissionamento • evolução em p.p. vs período anterior equivalente',60,y+54,'500 14px Arial',SAGE);
    const gap=22,w=(cv.width-120-gap)/2;
    drawArea117(ctx,60,y+82,w,'Operações',cur['Operações'],pm?.['Operações']);
    drawArea117(ctx,60+w+gap,y+82,w,'Caixa / Atendimento',cur['Caixa / Atendimento'],pm?.['Caixa / Atendimento']);
    return cv;
  };

  injectStyle117();
})();