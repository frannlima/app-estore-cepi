(function(){
  const BUILD='v102';
  const C={green:'#173F35',sage:'#466964',gray:'#DAD9D6',sand:'#D6D2C4',orange:'#DE7C00',orangeU:'#D37C32',wine:'#76232F',red:'#E03C31',up:'#157349',cream:'#F7F5EF',white:'#FFFFFF',ink:'#173F35',muted:'#68736F',line:'#E4E0D8',soft:'#FBFAF7',rose:'#FCE7E7',mint:'#E7F3E9'};
  let PERIOD='week', LAST=null, LAST_CANVAS=null, BUSY=false;
  const $id=id=>document.getElementById(id);
  const safe=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const fmtNum=v=>new Intl.NumberFormat('pt-BR').format(Math.round(Number(v)||0));
  const fmtPct=(v,d=2)=>Number.isFinite(Number(v))?(Number(v)*100).toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d})+'%':'—';
  const fmtPp=v=>Number.isFinite(Number(v))?((Number(v)>0?'+':'')+(Number(v)*100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+' p.p.'):'—';
  const fmtMoney=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(v)||0);
  const fmtMoney0=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(Number(v)||0);
  const periodName=p=>p==='month'?'Mês':p==='year'?'Ano':'Semana';
  const storeName=st=>{try{return typeof storeDisplayName==='function'?storeDisplayName(st):st}catch(e){return st}};
  const supStore=(st,n)=>{try{return typeof supervisorPrettyStoreV46==='function'?supervisorPrettyStoreV46(st,n):storeName(st)}catch(e){return storeName(st)}};
  const pref=(id,n)=>{try{return typeof preferredName==='function'?preferredName(id,n):(n||'')}catch(e){return n||''}};
  const supFirsts=store=>{try{const a=(store?.supervisors||[]).filter(u=>typeof supervisorEligibleRoleV49!=='function'||supervisorEligibleRoleV49(u.role)).map(u=>typeof supervisorFirstNameV48==='function'?supervisorFirstNameV48(u.id,u.name):(u.name||'').split(' ')[0]).filter(Boolean);return [...new Set(a)].join(' • ')||'Supervisores'}catch(e){return 'Supervisores'}};

  function status(msg,type=''){const el=$id('presStatusV102');if(el)el.innerHTML='<div class="notice '+type+'">'+safe(msg)+'</div>'}
  function descriptor(d){
    if(d.period==='week')return 'Semana '+(d.fca?.weekNumber||'')+' • Comparativo vs Semana '+(d.fca?.previousWeekNumber||'');
    if(d.period==='month'){const x=new Date((d.month||'2026-10')+'-01T12:00:00');const s=x.toLocaleDateString('pt-BR',{month:'long',year:'numeric'});return s.charAt(0).toUpperCase()+s.slice(1)}
    return String((d.asof||window.COMMON?.asof||new Date().getFullYear()).slice(0,4));
  }
  function rowCaptured(r){return Number(r?.captured??r?.c??0)||0}
  function rowOrders(r){return Number(r?.orders??r?.o??0)||0}
  function rowTicket(r){const t=Number(r?.ticket);if(Number.isFinite(t)&&t>0)return t;const o=rowOrders(r);return o?rowCaptured(r)/o:0}
  function rowShare(r){return Number(r?.share??0)||0}
  function rowDisp(r){return Number(r?.dispersion??r?.disp??0)||0}

  window.adminPresentationV99=async function(){
    const asof=String(window.COMMON?.asof||new Date().toLocaleDateString('en-CA',{timeZone:'America/Fortaleza'}));
    const month=asof.slice(0,7); LAST=null; LAST_CANVAS=null;
    const w=$id('adminWork');if(!w)return;
    w.innerHTML='<div class="card" style="display:grid;gap:14px">'+
      '<div style="background:linear-gradient(135deg,#173F35,#466964);color:#fff;border-radius:24px;padding:22px;position:relative;overflow:hidden;min-height:150px;display:flex;flex-direction:column;justify-content:center">'+
        '<div style="position:absolute;right:-60px;top:-72px;width:220px;height:220px;border-radius:50%;border:28px solid rgba(222,124,0,.24)"></div>'+
        '<h2 style="margin:0;font-size:25px;line-height:1.05">Painel Regional eStore • CE+PI</h2>'+
        '<p style="margin:9px 0 0;color:#e8eeea;max-width:620px;font-size:12px;line-height:1.45">Gere um card horizontal executivo, pronto para apresentação e compartilhamento, usando os dados consolidados do App.</p>'+
      '</div>'+
      '<div style="display:grid;grid-template-columns:1.05fr 1fr;gap:10px">'+
        '<div class=presChoiceV99><label>Período</label><div class=presSegmentV99>'+
          '<button id=presWeekV102 class=on onclick="presSetPeriodV102(\'week\')">Semana</button>'+
          '<button id=presMonthBtnV102 onclick="presSetPeriodV102(\'month\')">Mês</button>'+
          '<button id=presYearV102 onclick="presSetPeriodV102(\'year\')">Ano</button>'+
        '</div><div id=presMonthBoxV102 style="display:none;margin-top:9px"><label>Mês de referência</label><input id=presMonthV102 type=month class=field value="'+safe(month)+'"></div></div>'+
        '<div class=presChoiceV99><label>Saída</label><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'+
          '<button class="btn ghost" onclick="presPreviewV102()">Gerar prévia</button>'+
          '<button class=btn onclick="presGeneratePanelV102()">Gerar painel</button>'+
          '<button class="btn ghost" onclick="presDownloadPanelV102()">Baixar PNG</button>'+
          '<button class=btn onclick="presSharePanelV102()">Compartilhar</button>'+
        '</div><div id=presStatusV102 style="margin-top:8px"></div></div>'+
      '</div>'+
      '<div id=presPreviewV102 style="display:none;border:1px solid #e3e0d8;border-radius:18px;padding:9px;background:#f7f5ef"><img id=presPreviewImgV102 alt="Prévia do Painel Regional eStore" style="display:block;width:100%;height:auto;border-radius:12px"></div>'+
    '</div>';
  };

  window.presSetPeriodV102=function(p){
    PERIOD=p;LAST=null;LAST_CANVAS=null;
    [['week','presWeekV102'],['month','presMonthBtnV102'],['year','presYearV102']].forEach(a=>$id(a[1])?.classList.toggle('on',a[0]===p));
    const mb=$id('presMonthBoxV102');if(mb)mb.style.display=p==='month'?'block':'none';
    const pv=$id('presPreviewV102');if(pv)pv.style.display='none';
  };

  async function loadData(){
    if(BUSY)throw new Error('O painel já está sendo processado.');
    BUSY=true;
    try{
      const month=PERIOD==='month'?($id('presMonthV102')?.value||String(window.COMMON?.asof||'2026-10-01').slice(0,7)):undefined;
      const calls=[api({action:'ranking_period',matricula:U.u.id,period:PERIOD,month,store:U.u.st}),api({action:'supervisor_highlights',matricula:U.u.id,period:PERIOD})];
      if(PERIOD==='week')calls.push(api({action:'fca_dashboard',matricula:U.u.id}));
      const [ranking,sup,fca]=await Promise.all(calls);
      const regional=(ranking.regional||[]).filter(x=>(+x.c||0)>0);
      const collabCaptured=[...regional].sort((a,b)=>(+b.c||0)-(+a.c||0)).slice(0,3);
      const supervisorRanking=[...(sup.sales||[])].sort((a,b)=>(+b.c||0)-(+a.c||0)).slice(0,3);
      const storeMap=new Map((sup.stores||[]).map(x=>[String(x.st),x]));
      const shares=(sup.shares||[]).map(x=>{const st=storeMap.get(String(x.st))||{};const c=+st.c||0,o=+st.o||0;return {...x,captured:c,orders:o,ticket:o?c/o:0,dispersion:+st.disp||0}});
      let growth=[],retractions=[],prioritized=[];
      if(PERIOD==='week'){
        growth=(fca?.growth||[]).slice(0,5);
        retractions=(fca?.prioritized||[]).slice(0,5);
        prioritized=(fca?.prioritized||[]).slice(0,3);
      }else{
        growth=[...shares].sort((a,b)=>(+b.share||0)-(+a.share||0)).slice(0,5);
        retractions=[...shares].sort((a,b)=>(+a.share||0)-(+b.share||0)).slice(0,5);
        prioritized=retractions.slice(0,3);
      }
      LAST={period:PERIOD,month,ranking,supervisors:sup,fca:fca||null,collabCaptured,supervisorRanking,growth,retractions,prioritized,asof:sup.asof||window.COMMON?.asof||''};
      return LAST;
    }finally{BUSY=false}
  }

  function summary(d){
    const stores=Array.isArray(d.supervisors?.stores)?d.supervisors.stores:[];
    const captured=stores.reduce((a,x)=>a+(+x.c||0),0),orders=stores.reduce((a,x)=>a+(+x.o||0),0);
    let share=Number(d.supervisors?.shareReference?.regionalShare);
    if(d.period==='week'&&Number.isFinite(Number(d.fca?.summary?.share)))share=Number(d.fca.summary.share);
    if(!Number.isFinite(share))share=0;
    const cap=d.period==='week'&&Number.isFinite(Number(d.fca?.summary?.captured))?Number(d.fca.summary.captured):captured;
    const ord=d.period==='week'&&Number.isFinite(Number(d.fca?.summary?.orders))?Number(d.fca.summary.orders):orders;
    const ticket=d.period==='week'&&Number.isFinite(Number(d.fca?.summary?.ticket))?Number(d.fca.summary.ticket):(ord?cap/ord:0);
    return {
      share,captured:cap,orders:ord,ticket,
      share_delta:d.period==='week'?Number(d.fca?.summary?.share_delta):NaN,
      captured_change:d.period==='week'?Number(d.fca?.summary?.captured_change):NaN,
      orders_change:d.period==='week'?Number(d.fca?.summary?.orders_change):NaN,
      ticket_change:d.period==='week'?Number(d.fca?.summary?.ticket_change):NaN,
      meta_total:d.period==='week'?Number(d.fca?.summary?.meta_total):NaN
    };
  }

  function rr(ctx,x,y,w,h,r,fill,stroke='#E4E0D8',lw=1){
    r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();
    if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.lineWidth=lw;ctx.strokeStyle=stroke;ctx.stroke()}
  }
  function txt(ctx,text,x,y,maxW,font,color=C.ink,align='left'){
    ctx.font=font;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='middle';
    let s=String(text??'');if(maxW&&ctx.measureText(s).width>maxW){while(s.length>1&&ctx.measureText(s+'…').width>maxW)s=s.slice(0,-1);s+='…'}ctx.fillText(s,x,y);
  }
  function lines(ctx,text,x,y,maxW,lineH,font,color=C.ink,maxLines=2,align='left'){
    ctx.font=font;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='top';
    const words=String(text??'').split(/\s+/);let line='',out=[];
    for(const word of words){const test=line?line+' '+word:word;if(ctx.measureText(test).width<=maxW)line=test;else{if(line)out.push(line);line=word;if(out.length>=maxLines-1)break}}
    if(line&&out.length<maxLines)out.push(line);
    if(out.length===maxLines&&words.join(' ').length>out.join(' ').length){let s=out[maxLines-1];while(s.length>1&&ctx.measureText(s+'…').width>maxW)s=s.slice(0,-1);out[maxLines-1]=s+'…'}
    out.forEach((l,i)=>ctx.fillText(l,x,y+i*lineH));return out.length*lineH;
  }
  function circle(ctx,x,y,r,fill){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill()}
  async function loadLogo(){
    try{
      const r=await fetch('./assets/riachuelo-logo-exact-v75.svg?build='+BUILD,{cache:'no-store'});let svg=await r.text();
      svg=svg.replace(/fill="#[0-9a-f]{3,6}"/gi,'fill="#FFFFFF"').replace(/fill="[^"]+"/gi,'fill="#FFFFFF"');
      const u='data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(svg)));
      return await loadImg(u);
    }catch(e){return null}
  }
  function loadImg(src){return new Promise((ok,err)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=err;im.src=src})}
  function kpiSub(v,kind){
    if(!Number.isFinite(v))return {text:'Resultado do período',up:null};
    if(kind==='pp')return {text:fmtPp(v)+' vs período anterior',up:v>=0};
    return {text:(v>0?'+':'')+(v*100).toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})+'% vs período anterior',up:v>=0};
  }
  function drawKpi(ctx,x,y,w,h,title,value,sub,accent,icon){
    rr(ctx,x,y,w,h,18,C.white,'#E6E2DB',1);
    circle(ctx,x+52,y+48,32,accent);
    txt(ctx,icon,x+52,y+49,52,'700 25px Arial','#FFFFFF','center');
    txt(ctx,title,x+100,y+32,w-120,'600 20px Arial','#29423C');
    txt(ctx,value,x+100,y+84,w-120,'700 38px Arial',C.green);
    const bg=sub.up===null?'#F2F1EC':(sub.up?C.mint:C.rose),col=sub.up===null?C.muted:(sub.up?C.up:C.red);
    rr(ctx,x+18,y+h-52,w-36,37,10,bg,null,0);
    txt(ctx,sub.up===true?'↑':sub.up===false?'↓':'•',x+48,y+h-33,20,'700 24px Arial',col,'center');
    txt(ctx,sub.text,x+76,y+h-33,w-98,'700 15px Arial',col);
  }
  function drawTable(ctx,x,y,w,h,title,rows,mode){
    rr(ctx,x,y,w,h,18,C.white,'#E5E1D8',1);
    const headerColor=mode==='up'?C.green:C.wine;
    ctx.save();rr(ctx,x,y,w,52,18,headerColor,headerColor,0);ctx.fillStyle=headerColor;ctx.fillRect(x,y+26,w,26);ctx.restore();
    txt(ctx,mode==='up'?'↗':'↘',x+28,y+27,28,'700 26px Arial','#FFFFFF','center');
    txt(ctx,title,x+58,y+27,w-74,'700 20px Arial','#FFFFFF');
    const cols=[x+22,x+58,x+w-240,x+w-156,x+w-94,x+w-24];
    const heads=['#','Loja','Captado','Share','Ped.','Ticket'];
    heads.forEach((t,i)=>txt(ctx,t,cols[i],y+76,i===1?150:70,'700 12px Arial','#53625D',i>=2?'right':'left'));
    const rowH=(h-92)/5;
    rows.slice(0,5).forEach((r,i)=>{
      const yy=y+92+i*rowH;if(i%2===0){ctx.fillStyle='#FBFAF7';ctx.fillRect(x+10,yy,w-20,rowH)}
      circle(ctx,x+28,yy+rowH/2,15,mode==='up'?'#B9DEC6':'#F5C1C4');
      txt(ctx,String(i+1),x+28,yy+rowH/2,20,'700 12px Arial',mode==='up'?C.up:C.red,'center');
      const name=(r.st||'')+' • '+storeName(r.st||'');txt(ctx,name,x+58,yy+rowH/2,175,'600 13px Arial','#29423C');
      txt(ctx,fmtMoney(rowCaptured(r)),x+w-240,yy+rowH/2,105,'600 12px Arial','#29423C','right');
      txt(ctx,fmtPct(rowShare(r)),x+w-156,yy+rowH/2,70,'600 12px Arial','#29423C','right');
      txt(ctx,fmtNum(rowOrders(r)),x+w-94,yy+rowH/2,45,'600 12px Arial','#29423C','right');
      txt(ctx,fmtMoney(rowTicket(r)),x+w-24,yy+rowH/2,76,'600 12px Arial','#29423C','right');
      if(i<4){ctx.strokeStyle='#EEEAE3';ctx.beginPath();ctx.moveTo(x+18,yy+rowH);ctx.lineTo(x+w-18,yy+rowH);ctx.stroke()}
    });
  }
  function drawPriorities(ctx,x,y,w,h,rows){
    rr(ctx,x,y,w,h,18,'#F5F1E8','#E5E1D8',1);
    txt(ctx,'▦',x+24,y+27,25,'700 24px Arial','#333333','center');
    txt(ctx,'Lojas Priorizadas',x+54,y+27,w-70,'700 20px Arial','#222222');
    const gap=8,cw=(w-24-gap*2)/3,cy=y+58,ch=h-70;
    rows.slice(0,3).forEach((r,i)=>{
      const cx=x+8+i*(cw+gap);rr(ctx,cx,cy,cw,ch,12,C.white,'#E0DDD6',1);circle(ctx,cx+26,cy+25,17,C.orange);txt(ctx,String(i+1),cx+26,cy+25,24,'700 15px Arial','#FFFFFF','center');
      lines(ctx,(r.st||'')+' • '+storeName(r.st||''),cx+52,cy+10,cw-62,17,'700 13px Arial','#203B35',2);
      const labels=[['Share',fmtPct(rowShare(r))],['Captado',fmtMoney(rowCaptured(r))],['Pedidos',fmtNum(rowOrders(r))],['Ticket médio',fmtMoney(rowTicket(r))],['Dispersão',fmtPct(rowDisp(r),1)]];
      labels.forEach((a,j)=>{const yy=cy+72+j*35;txt(ctx,a[0],cx+14,yy,cw-80,'500 12px Arial','#596762');txt(ctx,a[1],cx+cw-14,yy,80,'700 12px Arial',j===4&&rowDisp(r)>.5?C.red:'#263E38','right')});
    });
  }
  function drawPodiumGroup(ctx,x,y,w,h,label,rows,mode){
    txt(ctx,mode==='sup'?'♟':'●',x+10,y+18,18,'700 17px Arial',C.green);
    txt(ctx,label,x+34,y+18,w-40,'700 16px Arial',C.green);
    const gap=14,cw=(w-gap*2)/3,cy=y+39,ch=h-46;
    rows.slice(0,3).forEach((r,i)=>{
      const cx=x+i*(cw+gap);const fills=['#FFF7E8','#F1F1EF','#F8EEE7'];rr(ctx,cx,cy,cw,ch,12,fills[i],'#ECE7DE',1);
      const medal=[C.orange,'#B7BABD','#9B4E2E'][i];circle(ctx,cx+36,cy+28,18,medal);txt(ctx,String(i+1),cx+36,cy+28,24,'700 16px Arial','#FFFFFF','center');
      txt(ctx,(i+1)+'º lugar',cx+64,cy+28,cw-76,'700 15px Arial',medal);
      const name=mode==='sup'?supFirsts(r):pref(r.id,r.name);txt(ctx,name,cx+18,cy+62,cw-36,'700 15px Arial','#203B35');
      const sub=mode==='sup'?((r.st||'')+' • '+supStore(r.st,r.name)):((r.st||'')+' • '+storeName(r.st||''));txt(ctx,sub,cx+18,cy+88,cw-36,'500 12px Arial','#4D5A56');
      ctx.strokeStyle='#DDD5C8';ctx.beginPath();ctx.moveTo(cx+24,cy+110);ctx.lineTo(cx+cw-24,cy+110);ctx.stroke();
      txt(ctx,fmtMoney0(mode==='sup'?(+r.c||0):(+r.c||0)),cx+cw/2,cy+136,cw-30,'700 20px Arial',C.green,'center');
    });
  }

  async function renderPanel(d){
    const W=1600,H=900,canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d',{alpha:false});
    ctx.fillStyle=C.cream;ctx.fillRect(0,0,W,H);
    // Header
    rr(ctx,18,14,W-36,122,15,C.green,C.green,0);
    const logo=await loadLogo();
    if(logo)ctx.drawImage(logo,62,50,355,43);else txt(ctx,'RIACHUELO',62,73,350,'600 44px Arial','#FFFFFF');
    ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(485,37);ctx.lineTo(485,110);ctx.stroke();
    txt(ctx,'Painel Regional eStore • CE+PI',530,60,650,'700 34px Arial','#FFFFFF');
    txt(ctx,descriptor(d),530,99,690,'500 20px Arial','#F2E6C7');
    ctx.beginPath();ctx.moveTo(1190,14);ctx.bezierCurveTo(1280,20,1290,115,1380,136);ctx.lineTo(1510,136);ctx.bezierCurveTo(1430,88,1470,37,1540,14);ctx.closePath();ctx.fillStyle=C.sage;ctx.fill();
    ctx.beginPath();ctx.moveTo(1430,14);ctx.bezierCurveTo(1500,5,1560,10,1582,14);ctx.lineTo(1582,136);ctx.lineTo(1515,136);ctx.bezierCurveTo(1465,95,1485,40,1540,14);ctx.closePath();ctx.fillStyle=C.orange;ctx.fill();

    const s=summary(d);
    const shareSub=kpiSub(s.share_delta,'pp');
    let capDelta=Number.isFinite(s.meta_total)&&s.meta_total>0?(s.captured/s.meta_total-1):s.captured_change;
    const capSub=kpiSub(capDelta,'pct');
    if(Number.isFinite(s.meta_total)&&s.meta_total>0)capSub.text='Desvio vs meta: '+(capDelta>0?'+':'')+(capDelta*100).toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})+'%';
    const ordSub=kpiSub(s.orders_change,'pct'),tktSub=kpiSub(s.ticket_change,'pct');
    const kx=18,ky=151,kg=12,kw=(W-36-kg*3)/4,kh=168;
    drawKpi(ctx,kx,ky,kw,kh,'Share',fmtPct(s.share),shareSub,C.green,'◔');
    drawKpi(ctx,kx+(kw+kg),ky,kw,kh,'Venda captada',fmtMoney(s.captured),capSub,C.sage,'▢');
    drawKpi(ctx,kx+2*(kw+kg),ky,kw,kh,'Pedidos',fmtNum(s.orders),ordSub,'#D7CEC1','▤');
    drawKpi(ctx,kx+3*(kw+kg),ky,kw,kh,'Ticket médio',fmtMoney(s.ticket),tktSub,C.orange,'◇');

    const midY=334,midH=307,leftW=524,gap=12,rightW=W-36-leftW*2-gap*2;
    drawTable(ctx,18,midY,leftW,midH,d.period==='week'?'Maiores recuperações de Share':'Maiores Shares',d.growth,'up');
    drawTable(ctx,18+leftW+gap,midY,leftW,midH,d.period==='week'?'Maiores retrações de Share':'Menores Shares',d.retractions,'down');
    drawPriorities(ctx,18+(leftW+gap)*2,midY,rightW,midH,d.prioritized);

    const podY=656,podH=206;rr(ctx,18,podY,W-36,podH,16,C.white,'#E5E1D8',1);
    ctx.fillStyle=C.green;rr(ctx,18,podY,W-36,42,16,C.green,C.green,0);ctx.fillRect(18,podY+21,W-36,21);
    txt(ctx,'🏆',48,podY+21,28,'700 20px Arial','#FFFFFF','center');txt(ctx,'Pódio Regional',76,podY+21,250,'700 19px Arial','#FFFFFF');
    ctx.strokeStyle='#D7D1C8';ctx.beginPath();ctx.moveTo(W/2,podY+56);ctx.lineTo(W/2,podY+podH-12);ctx.stroke();
    drawPodiumGroup(ctx,46,podY+48,W/2-78,podH-58,'Colaboradores',d.collabCaptured,'collab');
    drawPodiumGroup(ctx,W/2+30,podY+48,W/2-78,podH-58,'Supervisores',d.supervisorRanking,'sup');

    txt(ctx,'MODA QUE INSPIRA O BRASIL',30,885,360,'600 15px Arial',C.green);
    ctx.strokeStyle=C.sage;ctx.beginPath();ctx.moveTo(356,884);ctx.lineTo(1550,884);ctx.stroke();
    return canvas;
  }

  async function ensurePanel(){
    const d=LAST||await loadData();LAST=d;
    status('Montando painel horizontal...');
    LAST_CANVAS=await renderPanel(d);
    const img=$id('presPreviewImgV102'),box=$id('presPreviewV102');
    if(img)img.src=LAST_CANVAS.toDataURL('image/png');if(box)box.style.display='block';
    status('Painel pronto.','success');return LAST_CANVAS;
  }

  window.presPreviewV102=async function(){try{await ensurePanel()}catch(e){console.error(e);status(e.message||'Não foi possível gerar a prévia.','danger')}};
  window.presGeneratePanelV102=async function(){try{LAST=null;LAST_CANVAS=null;await ensurePanel()}catch(e){console.error(e);status(e.message||'Não foi possível gerar o painel.','danger')}};
  window.presDownloadPanelV102=async function(){try{const c=LAST_CANVAS||await ensurePanel();const a=document.createElement('a');a.href=c.toDataURL('image/png');a.download='Painel_Regional_eStore_CEPI_'+PERIOD+'.png';document.body.appendChild(a);a.click();a.remove()}catch(e){status(e.message||'Não foi possível baixar o painel.','danger')}};
  window.presSharePanelV102=async function(){try{const c=LAST_CANVAS||await ensurePanel();const blob=await new Promise((ok,er)=>c.toBlob(b=>b?ok(b):er(new Error('Falha ao gerar imagem.')),'image/png'));const file=new File([blob],'Painel_Regional_eStore_CEPI_'+PERIOD+'.png',{type:'image/png'});if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){await navigator.share({files:[file],title:'Painel Regional eStore • CE+PI',text:'Painel Regional eStore • CE+PI'});return}const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2500)}catch(e){if(e?.name!=='AbortError')status(e.message||'Não foi possível compartilhar.','danger')}};

  // Compatibilidade: o antigo botão "Gerar PowerPoint" deixa de produzir PPT e passa a gerar o painel aprovado.
  window.presGeneratePptxV99=window.presGeneratePanelV102;
})();