/* ===== V113 2026-10-04: Dashboard executivo da dispersão da filial ===== */
(function(){
  'use strict';
  if(window.__TEAM_STORE_V113_LOADED__)return;
  window.__TEAM_STORE_V113_LOADED__=true;

  const P={
    green:'#173F35', sage:'#466964', gray:'#DAD9D6',
    beige:'#D6D2C4', orange:'#DE7C00', paper:'#F7F5EF',
    white:'#FFFFFF', soft:'#F1EFE9', dark:'#203B35'
  };
  const baseTeamCardCanvasV113=window.teamCardCanvas;
  const baseShareTeamCardV113=window.shareTeamCard;

  function norm(s){
    return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  }
  function areaOf(row){
    const role=norm(row?.cargo||row?.role||'');
    if(/caixa|atendimento|dcc|credi|financeir|balcao|servic|fiscal de caixa|operador de caixa/.test(role))return 'Caixa / Atendimento';
    return 'Operações';
  }
  function periodName(){return ({day:'Dia',week:'Semana',month:'Mês',year:'Ano'})[PER]||'Período'}
  function addDays(s,n){const d=new Date(String(s)+'T12:00:00');d.setDate(d.getDate()+n);return d.toLocaleDateString('en-CA')}
  function daysInMonth(y,m){return new Date(y,m,0).getDate()}
  function previousReference(end){
    const d=new Date(String(end)+'T12:00:00');
    if(PER==='day')return addDays(end,-1);
    if(PER==='week')return addDays(end,-7);
    if(PER==='month'){
      const pm=new Date(d.getFullYear(),d.getMonth()-1,1,12);
      const day=Math.min(d.getDate(),daysInMonth(pm.getFullYear(),pm.getMonth()+1));
      return pm.getFullYear()+'-'+String(pm.getMonth()+1).padStart(2,'0')+'-'+String(day).padStart(2,'0');
    }
    const y=d.getFullYear()-1,m=d.getMonth()+1,day=Math.min(d.getDate(),daysInMonth(y,m));
    return y+'-'+String(m).padStart(2,'0')+'-'+String(day).padStart(2,'0');
  }
  function metric(rows){
    const total=(rows||[]).length,sold=(rows||[]).filter(x=>(+x.c||0)>0).length,zeros=Math.max(0,total-sold);
    return {total,sold,zeros,disp:total?zeros/total:0};
  }
  function areas(rows){
    const groups={'Operações':[],'Caixa / Atendimento':[]};
    (rows||[]).forEach(r=>(groups[areaOf(r)]||(groups[areaOf(r)]=[])).push(r));
    return Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,metric(v)]));
  }
  function evolution(cur,prev){
    if(prev==null||!Number.isFinite(+prev))return {rel:null,pp:null};
    if(+prev===0)return {rel:+cur===0?0:null,pp:+cur-(+prev)};
    return {rel:(+cur-(+prev))/(+prev),pp:+cur-(+prev)};
  }
  function fmtPct(v){return ((+v||0)*100).toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})+'%'}
  function evoPct(e){
    if(!e||e.rel==null)return 'Sem base';
    if(Math.abs(e.rel)<.0005)return '— 0,0%';
    return (e.rel<0?'↓ ':'↑ ')+(Math.abs(e.rel)*100).toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})+'%';
  }
  function evoPp(e){
    if(!e||e.pp==null)return '';
    const v=e.pp*100;
    if(Math.abs(v)<.05)return '0,0 p.p.';
    return (v>0?'+':'')+v.toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})+' p.p.';
  }
  function evoColor(e){return !e||e.rel==null?P.sage:e.rel<0?P.green:e.rel>0?P.orange:P.sage}
  function evoWord(e){return !e||e.rel==null?'sem base anterior':e.rel<0?'redução da dispersão':e.rel>0?'aumento da dispersão':'estável'}
  function moneyBR(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
  function intBR(v){return Math.round(+v||0).toLocaleString('pt-BR')}
  function fmtDate(s){try{return new Date(String(s)+'T12:00:00').toLocaleDateString('pt-BR')}catch{return String(s||'')}}
  function rr(ctx,x,y,w,h,r,fill,stroke){
    ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,r):ctx.rect(x,y,w,h);
    ctx.fillStyle=fill;ctx.fill();
    if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}
  }
  function txt(ctx,t,x,y,font,color,align='left',maxW){
    ctx.font=font;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='middle';
    let s=String(t??'');
    if(maxW){
      while(s.length>2&&ctx.measureText(s).width>maxW)s=s.slice(0,-1);
      if(s!==String(t??''))s=s.slice(0,-1)+'…';
    }
    ctx.fillText(s,x,y);
  }
  function donut(ctx,cx,cy,r,disp){
    const lw=23,start=-Math.PI/2,zero=Math.max(0,Math.min(1,+disp||0));
    ctx.lineWidth=lw;ctx.lineCap='butt';
    ctx.beginPath();ctx.strokeStyle=P.gray;ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.strokeStyle=P.orange;ctx.arc(cx,cy,r,start,start+Math.PI*2*zero);ctx.stroke();
    if(zero<1){
      ctx.beginPath();ctx.strokeStyle=P.green;ctx.arc(cx,cy,r,start+Math.PI*2*zero,start+Math.PI*2);ctx.stroke();
    }
  }
  async function officialLogoWhite(){
    return await new Promise(ok=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>ok(null);i.src='./assets/riachuelo-logo-horizontal-oficial-white-v133.svg?v=133'});
  }
  async function previousTeamData(current){
    const end=String(current?.endDate||current?.asof||'').slice(0,10);
    if(!end)return null;
    const ref=previousReference(end);
    try{
      const j=await api({action:'team_period',matricula:U.u.id,period:PER,store:U.u.st,reference_date:ref,date:ref,asof:ref,end_date:ref});
      if(j?.dataAvailable===false)return null;
      return j;
    }catch(e){console.warn('[V113] comparação da filial indisponível',e);return null}
  }
  function kpi(ctx,x,y,w,label,value,accent,fill=P.white){
    rr(ctx,x,y,w,105,15,fill,'#E6E2DA');
    txt(ctx,label,x+w/2,y+27,'700 11px Arial',P.sage,'center',w-20);
    txt(ctx,value,x+w/2,y+66,'700 23px Arial',accent||P.green,'center',w-18);
  }
  function areaCard(ctx,x,y,w,h,label,m,prev){
    const e=evolution(m.disp,prev?.disp),good=m.sold;
    rr(ctx,x,y,w,h,18,P.white,'#E4E0D8');
    txt(ctx,label,x+24,y+34,'700 20px Arial',P.green,'left',w-50);
    donut(ctx,x+118,y+155,72,m.disp);
    txt(ctx,fmtPct(m.disp),x+118,y+145,'700 27px Arial',P.green,'center',130);
    txt(ctx,'dispersão',x+118,y+174,'500 13px Arial',P.sage,'center',120);
    ctx.strokeStyle=P.gray;ctx.beginPath();ctx.moveTo(x+225,y+83);ctx.lineTo(x+225,y+h-28);ctx.stroke();
    txt(ctx,intBR(m.zeros)+' zerados',x+252,y+102,'700 15px Arial',P.dark);
    txt(ctx,'/ '+intBR(m.total)+' HC',x+252,y+126,'600 14px Arial',P.dark);
    txt(ctx,intBR(good)+' com venda',x+252,y+151,'500 12px Arial',P.sage);
    ctx.strokeStyle='#E4E0D8';ctx.beginPath();ctx.moveTo(x+252,y+174);ctx.lineTo(x+w-24,y+174);ctx.stroke();
    txt(ctx,'Evolução',x+252,y+202,'500 12px Arial',P.sage);
    txt(ctx,evoPct(e),x+252,y+234,'700 23px Arial',evoColor(e));
    txt(ctx,evoPp(e),x+252,y+260,'600 11px Arial',evoColor(e));
    txt(ctx,evoWord(e),x+252,y+284,'500 10px Arial',P.sage,'left',w-276);
  }
  function storeCaption(current,prev){
    const rows=current?.store?.rows||[],pr=prev?.store?.rows||[],m=metric(rows),pm=prev?metric(pr):null,e=evolution(m.disp,pm?.disp),a=areas(rows),pa=prev?areas(pr):{};
    return [
      '📊 *DISPERSÃO eStore | FILIAL '+U.u.st+'*',
      '*'+periodName()+' • atualizado até '+fmtDate(current?.endDate)+'*',
      '',
      '🔎 *Resumo da filial*',
      '• *HC:* '+intBR(m.total),
      '• *Com venda:* '+intBR(m.sold)+' • '+fmtPct(m.total?m.sold/m.total:0),
      '• *Zerados:* '+intBR(m.zeros)+' • '+fmtPct(m.disp),
      '• *Período anterior:* '+(pm?fmtPct(pm.disp):'sem base'),
      '• *Evolução:* '+evoPct(e)+(e.pp!=null?' | '+evoPp(e):''),
      '',
      '🟠 *Dispersão por áreas*',
      '• *Operações:* '+fmtPct(a['Operações'].disp)+' • '+intBR(a['Operações'].zeros)+' zerados / '+intBR(a['Operações'].total)+' HC • '+evoPct(evolution(a['Operações'].disp,pa?.['Operações']?.disp)),
      '• *Caixa / Atendimento:* '+fmtPct(a['Caixa / Atendimento'].disp)+' • '+intBR(a['Caixa / Atendimento'].zeros)+' zerados / '+intBR(a['Caixa / Atendimento'].total)+' HC • '+evoPct(evolution(a['Caixa / Atendimento'].disp,pa?.['Caixa / Atendimento']?.disp))
    ].join('\n');
  }
  async function storeCanvas(){
    const d=teamCardData();if(!d||d.regional)return null;
    const current=d.j,prev=await previousTeamData(current),rows=current?.store?.rows||d.rows||[],pr=prev?.store?.rows||[];
    const m=metric(rows),pm=prev?metric(pr):null,e=evolution(m.disp,pm?.disp),a=areas(rows),pa=prev?areas(pr):{};
    const W=1080,H=1510,cv=document.createElement('canvas');cv.width=W;cv.height=H;
    const ctx=cv.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    ctx.fillStyle=P.paper;ctx.fillRect(0,0,W,H);

    // Cabeçalho oficial
    ctx.fillStyle=P.green;ctx.fillRect(0,0,W,170);
    const logo=await officialLogoWhite();
    if(logo){
      const ratio=logo.width/logo.height,lw=370,lh=Math.min(70,lw/ratio);
      ctx.drawImage(logo,(W-lw)/2,37,lw,lh);
    }
    txt(ctx,'Moda que inspira o Brasil',W/2,132,'500 17px Arial',P.white,'center');

    txt(ctx,'MEU TIME',W/2,225,'700 43px Arial',P.green,'center');
    txt(ctx,'FILIAL '+U.u.st,W/2,273,'700 25px Arial',P.green,'center');
    txt(ctx,periodName()+' • '+fmtDate(current?.endDate),W/2,312,'500 18px Arial',P.sage,'center');

    // KPIs
    const gap=14,cw=(W-96-gap*3)/4,x0=48,y0=352;
    const cap=(rows||[]).filter(x=>(+x.c||0)>0).reduce((v,x)=>v+(+x.c||0),0);
    kpi(ctx,x0,y0,cw,'COLABORADORES',intBR(m.total),P.green);
    kpi(ctx,x0+(cw+gap),y0,cw,'COM VENDA',intBR(m.sold)+' • '+fmtPct(m.total?m.sold/m.total:0),P.green);
    kpi(ctx,x0+2*(cw+gap),y0,cw,'ZERADOS',intBR(m.zeros)+' • '+fmtPct(m.disp),P.orange,'#FFF4E7');
    kpi(ctx,x0+3*(cw+gap),y0,cw,'VENDA CAPTADA',moneyBR(cap),P.green);

    // Dispersão da filial
    const sy=486;
    rr(ctx,48,sy,W-96,235,18,'#EFEADF','#E2DDD3');
    txt(ctx,'DISPERSÃO DA FILIAL',82,sy+41,'700 25px Arial',P.green);
    rr(ctx,68,sy+72,W-136,135,14,P.white);
    txt(ctx,'Atual',115,sy+101,'500 13px Arial',P.sage);
    txt(ctx,fmtPct(m.disp),115,sy+145,'700 39px Arial',P.orange);
    ctx.strokeStyle=P.gray;ctx.beginPath();ctx.moveTo(355,sy+90);ctx.lineTo(355,sy+188);ctx.stroke();
    txt(ctx,'Período anterior',405,sy+101,'500 13px Arial',P.sage);
    txt(ctx,pm?fmtPct(pm.disp):'—',405,sy+145,'700 31px Arial',P.green);
    ctx.strokeStyle=P.gray;ctx.beginPath();ctx.moveTo(658,sy+90);ctx.lineTo(658,sy+188);ctx.stroke();
    rr(ctx,690,sy+87,270,105,13,e.rel!=null&&e.rel<0?'#E6F0EA':'#FFF2DF');
    txt(ctx,'Evolução',720,sy+110,'500 13px Arial',P.sage);
    txt(ctx,evoPct(e),720,sy+145,'700 31px Arial',evoColor(e));
    txt(ctx,e.pp==null?'':evoPp(e)+' • '+evoWord(e),720,sy+174,'500 10px Arial',P.sage,'left',220);

    // Áreas
    const ay=758;
    txt(ctx,'DISPERSÃO POR ÁREAS',74,ay,'700 28px Arial',P.green);
    txt(ctx,'Percentual de colaboradores sem venda por área da filial.',74,ay+32,'500 14px Arial',P.sage);
    areaCard(ctx,48,ay+62,478,345,'Operações',a['Operações'],pa?.['Operações']);
    areaCard(ctx,554,ay+62,478,345,'Caixa / Atendimento',a['Caixa / Atendimento'],pa?.['Caixa / Atendimento']);

    // Legenda Pantone
    const ly=1190;rr(ctx,48,ly,W-96,96,14,'#F0EEE9');
    const legends=[[P.orange,'Zerados'],[P.green,'Com venda'],[P.beige,'Período anterior'],[P.sage,'Redução da dispersão']];
    legends.forEach((z,i)=>{
      const bx=80+i*235;ctx.beginPath();ctx.arc(bx,ly+40,10,0,Math.PI*2);ctx.fillStyle=z[0];ctx.fill();
      txt(ctx,z[1],bx+18,ly+40,'500 11px Arial',P.sage,'left',180);
    });

    ctx.strokeStyle='#BFC8C3';ctx.beginPath();ctx.moveTo(48,1435);ctx.lineTo(1032,1435);ctx.stroke();
    txt(ctx,'MODA QUE INSPIRA O BRASIL',48,1465,'700 11px Arial',P.green);
    txt(ctx,'App. eStore CE+PI',1032,1465,'700 11px Arial',P.green,'right');
    return cv;
  }

  window.teamCardCanvas=async function(){
    if(TEAM_SCOPE==='regional')return await baseTeamCardCanvasV113();
    return await storeCanvas();
  };

  window.shareTeamCard=async function(){
    if(TEAM_SCOPE==='regional')return await baseShareTeamCardV113();
    try{
      const raw=teamCardData();if(!raw||raw.regional)return;
      const prev=await previousTeamData(raw.j),caption=storeCaption(raw.j,prev),c=await storeCanvas();
      if(!c)return alert('Aguarde o carregamento dos dados do Meu Time.');
      const b=await new Promise(r=>c.toBlob(r,'image/png',.98));if(!b)throw new Error('Falha ao gerar imagem');
      const f=new File([b],'Meu_Time_Dispersao_Filial_'+U.u.st+'_'+PER+'.png',{type:'image/png'});
      if(navigator.share){
        try{
          if(!navigator.canShare||navigator.canShare({files:[f]})){
            await navigator.share({files:[f],title:'Meu Time • Dispersão Filial '+U.u.st,text:caption});return;
          }
        }catch(e){if(e?.name==='AbortError')return}
      }
      try{await navigator.clipboard.writeText(caption)}catch(e){}
      const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=f.name;document.body.appendChild(a);a.click();
      setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);
      alert('Painel gerado. A legenda foi copiada para compartilhamento.');
    }catch(e){console.error('[V113] compartilhar filial',e);alert('Não foi possível compartilhar o card da filial. Tente novamente.')}
  };
})();