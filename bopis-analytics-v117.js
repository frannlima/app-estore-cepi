/* ===== V117 2026-10-04: Central BOPIS + Meu Resultado ===== */
(function(){
  'use strict';
  if(window.__BOPIS_ANALYTICS_V117__)return;
  window.__BOPIS_ANALYTICS_V117__=true;

  const GREEN='#173F35',SAGE='#466964',ORANGE='#DE7C00',GRAY='#DAD9D6',BEIGE='#D6D2C4',WINE='#76232F',PAPER='#F7F5EF',WHITE='#FFFFFF';
  const baseAdminV117=window.admin;
  const baseResultViewV117=window.resultView;
  let BOPIS_PERIOD_V117='month',BOPIS_DATA_V117=null,BOPIS_SEARCH_V117='';

  function fmtPct117(v){return ((+v||0)*100).toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})+'%'}
  function fmtMoney117(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
  function fmtInt117(v){return Math.round(+v||0).toLocaleString('pt-BR')}
  function fmtDate117(s){try{return new Date(String(s)+'T12:00:00').toLocaleDateString('pt-BR')}catch{return String(s||'')}}
  function periodLabel117(){return ({day:'Dia',week:'Semana',month:'Mês',year:'Ano'})[BOPIS_PERIOD_V117]||'Período'}
  function storeName117(st){try{return storeDisplayName(st)}catch{return 'Filial '+st}}
  function verifiedWarning117(d){
    return d&&d.commissionVerifiedCoverage<1
      ?'<div class="notice warn" style="margin:12px 0"><b>Cobertura BOPIS parcial.</b><br>Parte do histórico foi importada antes da identificação de Tipo Entrega. Os indicadores abaixo consideram somente registros em que BOPIS pôde ser separado com segurança.</div>'
      :'';
  }
  function injectStyle117(){
    if(document.getElementById('bopis-v117-style'))return;
    const st=document.createElement('style');st.id='bopis-v117-style';
    st.textContent=
      '.bopisHeroV117{background:linear-gradient(135deg,#173F35,#466964);color:#fff;border-radius:18px;padding:18px;margin-bottom:14px}.bopisHeroV117 h2{margin:0;font-size:21px}.bopisHeroV117 p{margin:6px 0 0;font-size:11px;opacity:.86}.bopisTabsV117{display:flex;gap:7px;flex-wrap:wrap;margin:12px 0}.bopisTabsV117 button{border:1px solid #d7d5cf;background:#fff;color:#173F35;border-radius:999px;padding:9px 15px;font-weight:800}.bopisTabsV117 button.on{background:#173F35;color:#fff;border-color:#173F35}.bopisKpisV117{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin:12px 0}.bopisKpiV117{background:#fff;border:1px solid #e4e0d8;border-radius:15px;padding:13px;text-align:center;min-height:93px;display:flex;flex-direction:column;justify-content:center}.bopisKpiV117 small{font-size:8px;text-transform:uppercase;font-weight:900;color:#466964}.bopisKpiV117 b{font-size:19px;color:#173F35;margin-top:5px}.bopisKpiV117.warn{background:#fff4e6}.bopisChartsV117{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:15px 0}.bopisPanelV117{background:#fff;border:1px solid #e4e0d8;border-radius:16px;padding:14px}.bopisPanelV117 h3{margin:0 0 4px;color:#173F35;font-size:15px}.bopisPanelV117>small{color:#68736f;font-size:9px}.bopisBarRowV117{display:grid;grid-template-columns:52px 1fr 72px;gap:7px;align-items:center;margin:9px 0;font-size:9px}.bopisBarTrackV117{height:12px;background:#efeee9;border-radius:999px;overflow:hidden}.bopisBarV117{height:100%;background:#DE7C00;border-radius:999px}.bopisTimelineV117{height:155px;display:flex;gap:5px;align-items:flex-end;margin-top:16px;padding-bottom:25px;position:relative;border-bottom:1px solid #dad9d6}.bopisTimelineColV117{flex:1;min-width:8px;max-width:34px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%}.bopisTimelineBarV117{width:100%;min-height:2px;background:#173F35;border-radius:5px 5px 0 0}.bopisTimelineColV117 small{position:absolute;bottom:2px;font-size:7px;color:#68736f;transform:rotate(-45deg);transform-origin:center}.bopisTableWrapV117{overflow:auto;margin-top:10px}.bopisTableV117{width:100%;min-width:820px;border-collapse:separate;border-spacing:0 5px;table-layout:fixed}.bopisTableV117 th,.bopisTableV117 td{text-align:center;padding:7px 5px;font-size:9px}.bopisTableV117 th{color:#53625d;text-transform:uppercase;font-size:7.5px}.bopisTableV117 td{background:#faf9f6}.bopisTableV117 td:first-child{border-radius:8px 0 0 8px}.bopisTableV117 td:last-child{border-radius:0 8px 8px 0}.bopisSearchV117{display:grid;grid-template-columns:1fr auto;gap:8px;margin:10px 0}.bopisPersonV117{border-left:5px solid #DE7C00;background:#fff8ea;border-radius:12px;padding:12px;margin:10px 0}.bopisPersonV117 .grid{margin-top:10px}.bopisAlertResultV117{border:1px solid #efc37b;background:#fff6e7;border-radius:16px;padding:15px;margin-top:12px}.bopisAlertResultV117 h3{margin:0;color:#76232F}.bopisAlertResultV117 .bopisResultGridV117{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}.bopisAlertResultV117 .bopisResultGridV117 div{background:#fff;border-radius:11px;padding:10px;text-align:center}.bopisAlertResultV117 small{display:block;color:#68736f;font-size:9px}.bopisAlertResultV117 b{display:block;color:#173F35;margin-top:4px}.bopisPolicyV117{color:#76232F;font-size:11px;font-weight:800;line-height:1.4;margin-top:9px}@media(max-width:700px){.bopisKpisV117{grid-template-columns:repeat(2,1fr)}.bopisChartsV117{grid-template-columns:1fr}.bopisAlertResultV117 .bopisResultGridV117{grid-template-columns:1fr 1fr}.bopisSearchV117{grid-template-columns:1fr}.bopisTimelineV117{overflow-x:auto;justify-content:flex-start}.bopisTimelineColV117{flex:0 0 18px}}';
    document.head.appendChild(st);
  }

  // Adiciona o menu BOPIS à Central Administrativa.
  window.admin=function(){
    const html=typeof baseAdminV117==='function'?baseAdminV117():'';
    if(!html||html.includes('adminBopisV117'))return html;
    const marker='<button class=btn onclick="go(&quot;fca&quot;)">FCA e Performance</button>';
    const btn='<button class=btn onclick="adminBopisV117()">BOPIS / Retira em Loja</button>';
    if(html.includes(marker))return html.replace(marker,btn+marker);
    const demo='</div><div class=notice style="margin-top:14px">🔒';
    if(html.includes(demo))return html.replace(demo,'<button class=btn>BOPIS / Retira em Loja</button></div><div class=notice style="margin-top:14px">🔒');
    return html;
  };

  async function loadBopisV117(search){
    return await api({action:'bopis_dashboard',matricula:U.u.id,period:BOPIS_PERIOD_V117,search_matricula:String(search||'').trim()});
  }
  function barRows117(stores){
    const arr=(stores||[]).filter(x=>(+x.orders||0)>0||(+x.captured||0)>0).slice(0,10),mx=Math.max(1,...arr.map(x=>+x.orders||0));
    if(!arr.length)return '<div class=muted style="margin-top:12px">Sem ocorrências BOPIS identificadas no período.</div>';
    return arr.map(x=>'<div class=bopisBarRowV117><b>'+esc(x.st)+'</b><div class=bopisBarTrackV117><div class=bopisBarV117 style="width:'+Math.max(2,(+x.orders||0)/mx*100)+'%"></div></div><span>'+fmtInt117(x.orders)+' ped.</span></div>').join('');
  }
  function timeline117(rows){
    const arr=(rows||[]),mx=Math.max(1,...arr.map(x=>+x.orders||0));
    if(!arr.length)return '<div class=muted style="margin-top:12px">Sem série temporal disponível.</div>';
    return '<div class=bopisTimelineV117>'+arr.map(x=>{
      const h=Math.max(2,(+x.orders||0)/mx*115),lab=String(x.date||'').slice(5).split('-').reverse().join('/');
      return '<div class=bopisTimelineColV117 title="'+esc(fmtDate117(x.date)+' • '+x.orders+' pedidos • '+fmtMoney117(x.captured))+'"><div class=bopisTimelineBarV117 style="height:'+h+'px"></div><small>'+esc(lab)+'</small></div>';
    }).join('')+'</div>';
  }
  function storesTable117(rows){
    return '<div class=bopisTableWrapV117><table class=bopisTableV117><thead><tr><th>Loja</th><th>Pedidos</th><th>Colaboradores</th><th>Frequência</th><th>Recorrentes</th><th>Captado</th><th>Aprovado não comissionável</th></tr></thead><tbody>'+
      (rows||[]).map(x=>'<tr><td><b>'+esc(x.st)+'</b><br><small>'+esc(storeName117(x.st))+'</small></td><td><b>'+fmtInt117(x.orders)+'</b></td><td>'+fmtInt117(x.collaborators)+'</td><td>'+fmtInt117(x.frequency)+' dias</td><td>'+fmtInt117(x.recurringCollaborators)+'</td><td><b>'+fmtMoney117(x.captured)+'</b></td><td>'+fmtMoney117(x.approved)+'</td></tr>').join('')+
      '</tbody></table></div>';
  }
  function collabTable117(rows){
    const arr=(rows||[]).slice(0,100);
    return '<div class=bopisTableWrapV117><table class=bopisTableV117><thead><tr><th>#</th><th>Colaborador</th><th>Filial</th><th>Pedidos BOPIS</th><th>Frequência</th><th>Recorrência</th><th>Captado</th><th>Não comissionado</th></tr></thead><tbody>'+
      (arr.map((x,i)=>'<tr><td>'+(i+1)+'º</td><td style="text-align:left"><b>'+esc(x.name)+'</b><br><small>'+esc(x.id)+'</small></td><td>'+esc(x.st)+'</td><td><b>'+fmtInt117(x.orders)+'</b></td><td>'+fmtInt117(x.frequency)+' dias</td><td>'+fmtInt117(x.recurrence)+'</td><td>'+fmtMoney117(x.captured)+'</td><td><b>'+fmtMoney117(x.approved)+'</b></td></tr>').join('')||'<tr><td colspan=8>Sem colaboradores com BOPIS identificado no período.</td></tr>')+
      '</tbody></table></div>';
  }
  function person117(p){
    if(!BOPIS_SEARCH_V117)return '';
    if(!p)return '<div class="notice warn">Matrícula não localizada na base regional.</div>';
    return '<div class=bopisPersonV117><b>'+esc(p.name)+'</b><div class=muted>Filial '+esc(p.st)+' • '+esc(p.id)+' • '+esc(p.role||'')+'</div>'+
      '<div class=grid><div class=kpi><span>Pedidos BOPIS</span><b>'+fmtInt117(p.orders)+'</b></div><div class=kpi><span>Frequência</span><b>'+fmtInt117(p.frequency)+' dias</b></div><div class=kpi><span>Recorrência</span><b>'+fmtInt117(p.recurrence)+'</b></div><div class=kpi><span>Valor captado</span><b>'+fmtMoney117(p.captured)+'</b></div><div class="kpi danger"><span>Não comissionado</span><b>'+fmtMoney117(p.approved)+'</b></div></div>'+
      (p.orders>0?'<div class="notice warn"><b>Atenção:</b> foram identificadas ocorrências BOPIS/Retira em Loja no período. Esses valores não compõem a base de comissão.</div>':'<div class="notice success">Nenhuma ocorrência BOPIS identificada para esta matrícula no período.</div>')+
      '</div>';
  }
  function renderBopisV117(d){
    const s=d.summary||{},coverage=+d.commissionVerifiedCoverage||0;
    return '<div class=bopisHeroV117><h2>BOPIS • Retira em Loja</h2><p>Painel regional para leitura de ocorrências, frequência, recorrência e impacto no comissionamento.</p></div>'+
      '<div class=bopisTabsV117>'+['day','week','month','year'].map(k=>'<button class="'+(BOPIS_PERIOD_V117===k?'on':'')+'" onclick="setBopisPeriodV117(\''+k+'\')">'+({day:'Dia',week:'Semana',month:'Mês',year:'Ano'})[k]+'</button>').join('')+'</div>'+
      '<div class=muted>'+periodLabel117()+' • '+fmtDate117(d.startDate)+' a '+fmtDate117(d.endDate)+'</div>'+
      verifiedWarning117(d)+
      '<div class=bopisKpisV117>'+
        '<div class="bopisKpiV117 warn"><small>Valor captado BOPIS</small><b>'+fmtMoney117(s.captured)+'</b></div>'+
        '<div class=bopisKpiV117><small>Pedidos BOPIS</small><b>'+fmtInt117(s.orders)+'</b></div>'+
        '<div class=bopisKpiV117><small>Colaboradores</small><b>'+fmtInt117(s.collaborators)+'</b></div>'+
        '<div class=bopisKpiV117><small>Lojas com ocorrência</small><b>'+fmtInt117(s.stores)+'</b></div>'+
        '<div class=bopisKpiV117><small>Recorrentes</small><b>'+fmtInt117(s.recurringCollaborators)+'</b></div>'+
        '<div class=bopisKpiV117><small>Frequência regional</small><b>'+fmtInt117(s.frequencyDays)+' dias</b></div>'+
      '</div>'+
      '<div class=toolbar><button class=btn onclick="previewBopisCardV117()">▣ Visualizar dashboard</button><button class="btn ghost" onclick="shareBopisCardV117()">Compartilhar</button></div>'+
      '<div class=bopisChartsV117>'+
        '<div class=bopisPanelV117><h3>Ocorrências por filial</h3><small>Top 10 por quantidade de pedidos BOPIS</small>'+barRows117(d.stores)+'</div>'+
        '<div class=bopisPanelV117><h3>Frequência no período</h3><small>Pedidos BOPIS identificados por dia</small>'+timeline117(d.timeline)+'</div>'+
      '</div>'+
      '<div class=bopisPanelV117><h3>Relação das lojas</h3><small>Quantidade, pessoas envolvidas, frequência, recorrência e valores BOPIS.</small>'+storesTable117(d.stores)+'</div>'+
      '<div class=bopisPanelV117 style="margin-top:12px"><h3>Buscar matrícula</h3><small>Consulte o histórico BOPIS de um colaborador no período selecionado.</small><div class=bopisSearchV117><input id=bopisSearchInputV117 class=field inputmode=numeric placeholder="Digite a matrícula" value="'+esc(BOPIS_SEARCH_V117)+'"><button class=btn onclick="bopisSearchV117()">Buscar</button></div><div id=bopisPersonBoxV117>'+person117(d.person)+'</div></div>'+
      '<div class=bopisPanelV117 style="margin-top:12px"><h3>Colaboradores com venda BOPIS</h3><small>Ranking por quantidade de pedidos; valor aprovado BOPIS é não comissionável.</small>'+collabTable117(d.collaborators)+'</div>';
  }

  window.adminBopisV117=async function(){
    injectStyle117();
    const box=document.getElementById('adminWork');if(!box)return;
    box.innerHTML='<div class=card><div class=title>BOPIS / Retira em Loja</div><div class=muted>Carregando análise regional...</div></div>';
    try{
      BOPIS_DATA_V117=await loadBopisV117(BOPIS_SEARCH_V117);
      box.innerHTML='<div class=card>'+renderBopisV117(BOPIS_DATA_V117)+'</div>';
      setTimeout(()=>box.scrollIntoView({behavior:'smooth',block:'start'}),20);
    }catch(e){box.innerHTML='<div class=card><div class="notice danger">'+esc(e.message||'Não foi possível carregar o painel BOPIS.')+'</div></div>'}
  };
  window.setBopisPeriodV117=function(p){BOPIS_PERIOD_V117=p;BOPIS_SEARCH_V117='';adminBopisV117()};
  window.bopisSearchV117=async function(){
    BOPIS_SEARCH_V117=String(document.getElementById('bopisSearchInputV117')?.value||'').trim();
    try{
      BOPIS_DATA_V117=await loadBopisV117(BOPIS_SEARCH_V117);
      const box=document.getElementById('bopisPersonBoxV117');if(box)box.innerHTML=person117(BOPIS_DATA_V117.person);
    }catch(e){alert(e.message)}
  };

  function rr117(ctx,x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,r):ctx.rect(x,y,w,h);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.stroke()}}
  function tx117(ctx,t,x,y,font,color,align='left',maxW){
    ctx.font=font;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='middle';let s=String(t??'');
    if(maxW){while(s.length>2&&ctx.measureText(s).width>maxW)s=s.slice(0,-1);if(s!==String(t??''))s=s.slice(0,-1)+'…'}
    ctx.fillText(s,x,y);
  }
  async function logo117(){
    return await new Promise(ok=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>ok(null);i.src='./assets/riachuelo-logo-horizontal-oficial-white-v133.svg?v=133'});
  }
  async function bopisCanvas117(){
    if(!BOPIS_DATA_V117)BOPIS_DATA_V117=await loadBopisV117('');
    const d=BOPIS_DATA_V117,s=d.summary||{},stores=d.stores||[],people=(d.collaborators||[]).slice(0,5);
    const W=1200,H=1700,cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');
    x.fillStyle=PAPER;x.fillRect(0,0,W,H);
    x.fillStyle=GREEN;x.fillRect(0,0,W,160);
    const logo=await logo117();
    if(logo){const ratio=logo.naturalWidth/logo.naturalHeight,lw=370,lh=Math.min(70,lw/ratio);x.drawImage(logo,60,42,lw,lh)}
    tx117(x,'BOPIS • RETIRA EM LOJA',510,62,'700 34px Arial',WHITE);
    tx117(x,'REGIONAL CE+PI • '+periodLabel117()+' • '+fmtDate117(d.endDate),510,104,'600 15px Arial','#E6ECE9');

    const cards=[
      ['CAPTADO BOPIS',fmtMoney117(s.captured),ORANGE],
      ['PEDIDOS',fmtInt117(s.orders),GREEN],
      ['COLABORADORES',fmtInt117(s.collaborators),GREEN],
      ['LOJAS',fmtInt117(s.stores),GREEN],
      ['RECORRENTES',fmtInt117(s.recurringCollaborators),WINE],
      ['FREQUÊNCIA',fmtInt117(s.frequencyDays)+' dias',SAGE]
    ];
    const cw=342,gap=25,sx=62;
    cards.forEach((a,i)=>{const col=i%3,row=Math.floor(i/3),cx=sx+col*(cw+gap),cy=205+row*120;rr117(x,cx,cy,cw,98,15,WHITE,'#E4E0D8');tx117(x,a[0],cx+cw/2,cy+27,'700 11px Arial',SAGE,'center');tx117(x,a[1],cx+cw/2,cy+64,'700 24px Arial',a[2],'center')});

    tx117(x,'RELAÇÃO DAS LOJAS',62,475,'700 24px Arial',GREEN);
    const cols=[75,160,300,430,555,690,870,1055],heads=['LOJA','PED.','COLAB.','FREQ.','RECOR.','CAPTADO','NÃO COMISS.','STATUS'];
    heads.forEach((h,i)=>tx117(x,h,cols[i],515,'700 10px Arial',SAGE,'center'));
    let y=548;
    stores.slice(0,19).forEach(r=>{
      rr117(x,55,y-20,1090,36,7,(+r.orders||0)>0?'#FFF5E5':'#F2F0EB');
      const vals=[r.st,fmtInt117(r.orders),fmtInt117(r.collaborators),fmtInt117(r.frequency)+' d',fmtInt117(r.recurringCollaborators),fmtMoney117(r.captured),fmtMoney117(r.approved),(+r.orders||0)>0?'Ocorrência':'—'];
      vals.forEach((v,i)=>tx117(x,v,cols[i],y,(i===0||i===1?'700 ':'500 ')+(i===5||i===6?'10':'11')+'px Arial',i===7&&(+r.orders||0)>0?WINE:GREEN,'center',i===5||i===6?160:110));
      y+=42;
    });

    const py=Math.max(1390,y+30);
    tx117(x,'TOP 5 COLABORADORES • BOPIS',62,py,'700 22px Arial',GREEN);
    people.forEach((p,i)=>{
      const yy=py+40+i*40;tx117(x,(i+1)+'º',72,yy,'700 13px Arial',ORANGE);
      tx117(x,p.name,115,yy,'700 12px Arial',GREEN,'left',360);
      tx117(x,p.st,500,yy,'600 12px Arial',SAGE,'center');
      tx117(x,fmtInt117(p.orders)+' pedidos',620,yy,'600 12px Arial',GREEN,'center');
      tx117(x,fmtMoney117(p.captured),790,yy,'600 12px Arial',GREEN,'center');
      tx117(x,fmtMoney117(p.approved)+' não comiss.',1040,yy,'600 11px Arial',WINE,'center',220);
    });
    x.strokeStyle='#BFC8C3';x.beginPath();x.moveTo(62,H-60);x.lineTo(1138,H-60);x.stroke();
    tx117(x,'MODA QUE INSPIRA O BRASIL',62,H-32,'700 11px Arial',GREEN);
    tx117(x,'App. eStore CE+PI',1138,H-32,'700 11px Arial',GREEN,'right');
    return cv;
  }
  function bopisCaption117(){
    const d=BOPIS_DATA_V117,s=d?.summary||{},top=(d?.stores||[]).filter(x=>(+x.orders||0)>0).slice(0,5);
    return [
      '📲 *BOPIS | REGIONAL CE+PI*',
      '*'+periodLabel117()+' • atualizado até '+fmtDate117(d?.endDate)+'*',
      '',
      '🛍️ *Pedidos BOPIS:* '+fmtInt117(s.orders),
      '💰 *Valor captado:* '+fmtMoney117(s.captured),
      '👥 *Colaboradores:* '+fmtInt117(s.collaborators),
      '🏬 *Lojas com ocorrência:* '+fmtInt117(s.stores),
      '🔁 *Colaboradores recorrentes:* '+fmtInt117(s.recurringCollaborators),
      '',
      '⚠️ *Top 5 lojas por pedidos BOPIS*',
      ...top.map((r,i)=>(i+1)+'. *'+r.st+' • '+storeName117(r.st)+'* — '+fmtInt117(r.orders)+' pedidos | '+fmtMoney117(r.captured))
    ].join('\n');
  }
  window.previewBopisCardV117=async function(){
    try{
      const c=await bopisCanvas117(),m=document.createElement('div');m.className='previewModal';
      m.innerHTML='<div class=box><img src="'+c.toDataURL('image/png')+'" alt="Dashboard BOPIS"><div class=toolbar><button class=btn onclick="shareBopisCardV117()">Compartilhar</button><button class="btn ghost" onclick="this.closest(\'.previewModal\').remove()">Fechar</button></div></div>';
      m.onclick=e=>{if(e.target===m)m.remove()};document.body.appendChild(m);
    }catch(e){alert('Não foi possível gerar o dashboard BOPIS.')}
  };
  window.shareBopisCardV117=async function(){
    try{
      const c=await bopisCanvas117(),b=await new Promise(r=>c.toBlob(r,'image/png',.98)),caption=bopisCaption117();
      if(!b)throw new Error('Falha ao gerar imagem');
      const f=new File([b],'BOPIS_Regional_CEPI_'+BOPIS_PERIOD_V117+'.png',{type:'image/png'});
      if(navigator.share){try{if(!navigator.canShare||navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'BOPIS • Regional CE+PI',text:caption});return}}catch(e){if(e?.name==='AbortError')return}}
      try{await navigator.clipboard.writeText(caption)}catch(e){}
      const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=f.name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1200);
    }catch(e){alert('Não foi possível compartilhar o dashboard BOPIS.')}
  };

  // Meu Resultado: evidencia possíveis vendas BOPIS sem retirar o valor do resultado/ranking.
  window.loadResultExtras=async function(){
    try{
      const period=PER,key=String(U?.u?.id||'')+'|'+period,j=await api({action:'person_period',matricula:U.u.id,store:U.u.st,period});
      const role=String(U?.u?.role||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
      const eligible=j.commissionEligible!==false&&!/(intermitente|aprendiz)/.test(role),verified=j.commissionVerified!==false;
      const x={
        c:+j.captured||0,a:+j.approved||0,o:+j.orders||0,
        com:eligible&&verified?(+j.commission||0):0,eday:eligible&&verified?(+j.eday||0):0,
        commissionableApproved:+j.commissionableApproved||0,bopisApproved:+j.bopisApproved||0,
        bopisCaptured:+j.bopisCaptured||0,bopisOrders:+j.bopisOrders||0,
        commissionVerified:verified,commissionEligible:eligible,
        commissionEligibilityReason:j.commissionEligibilityReason||'',
        rr:j.regionalRank||null,sr:j.storeRank||null,asof:j.endDate||'',_live:true
      };
      RESULT_PERIOD_CACHE[key]=x;U.p=U.p||{};U.p[period]={...(U.p[period]||{}),...x};
      if(CUR==='result'&&PER===period){const v=document.getElementById('view');if(v)v.innerHTML=resultView()}
    }catch(e){console.warn('[V117] Meu Resultado',e)}
  };

  window.resultView=function(){
    const html=typeof baseResultViewV117==='function'?baseResultViewV117():'';
    const x=RESULT_PERIOD_CACHE?.[String(U?.u?.id||'')+'|'+PER];
    if(!x||x.commissionVerified===false)return html;
    const has=(+x.bopisOrders||0)>0||(+x.bopisApproved||0)>0||(+x.bopisCaptured||0)>0;
    if(!has)return html;
    const card='<div class="card bopisAlertResultV117"><h3>⚠️ BOPIS / Retira em Loja no período</h3>'+
      '<div class=muted>Foram identificadas possíveis vendas BOPIS vinculadas à sua matrícula no período selecionado.</div>'+
      '<div class=bopisResultGridV117><div><small>Pedidos BOPIS</small><b>'+fmtInt117(x.bopisOrders)+'</b></div><div><small>Valor captado</small><b>'+fmtMoney117(x.bopisCaptured)+'</b></div><div><small>Valor não comissionado</small><b>'+fmtMoney117(x.bopisApproved)+'</b></div></div>'+
      '<div class=bopisPolicyV117>Prática fora da política de elegibilidade ao comissionamento: vendas BOPIS / Retira em Loja permanecem no resultado e no ranking, porém não geram comissão. Revise a ocorrência e o procedimento com sua liderança.</div>'+
      '</div>';
    return html+card;
  };

  injectStyle117();
})();