/* ===== V144 2026-10-07: Pool regional completo + card HD ===== */
(function(){
  'use strict';
  if(window.__BOPIS_COMMISSION_V115__)return;
  window.__BOPIS_COMMISSION_V115__=true;

  const BOPIS_NOTE='BOPIS (Retira em Loja) não gera comissionamento. O valor aprovado de pedidos BOPIS não compõe a comissão individual nem o Pool dos supervisores.';
  const CONTRACT_NOTE='Não elegível a comissionamento por conta da modalidade de contrato e política interna de benefícios.';
  const baseCommissionV115=window.commission;
  const baseSimV115=window.sim;
  let POOL_DATA_V143=null;

  function norm115(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
  function contractEligible115(){return !/(intermitente|aprendiz)/.test(norm115(U?.u?.role||''))}
  function cache115(){return RESULT_PERIOD_CACHE?.[String(U?.u?.id||'')+'|'+PER]||null}
  function commissionEligible115(){const x=cache115();return typeof x?.commissionEligible==='boolean'?x.commissionEligible:contractEligible115()}
  function commissionVerified115(){const x=cache115();return x?.commissionVerified!==false}

  function bopisNotice115(){
    return '<div class="notice" style="margin-top:12px"><b>Regra BOPIS:</b> '+BOPIS_NOTE+'</div>';
  }
  function pendingBopis115(){
    return '<div class="notice warn" style="margin-top:12px"><b>Comissão aguardando base com Tipo Entrega.</b><br>Para evitar expectativa incorreta, o App não exibe valor estimado quando a base não permite separar BOPIS das demais vendas.</div>';
  }

  window.resultView=function(){
    let key=String(U?.u?.id||'')+'|'+PER,x=RESULT_PERIOD_CACHE[key];
    let head='<div class="card resultProfile"><div class=profileHead>'+photo(U.u.id,displayName(),'photoBig')+'<div><div class=title>'+esc(displayName())+'</div><div class=muted>Filial '+esc(U.u.st)+' • '+esc(U.u.role)+'</div></div></div>'+tabs()+'</div>';
    if(!x)return head+'<div class=card><div class=muted>Consultando resultado oficial pela sua matrícula...</div></div>';

    let rr=(+x.c||0)>0?x.rr:null,sr=(+x.c||0)>0?x.sr:null,tier=performanceTier(x),hasSale=(+x.c||0)>0,topR=hasSale&&rr&&rr<=10,topS=hasSale&&sr&&sr<=10,
        eligible=(typeof x.commissionEligible==='boolean'?x.commissionEligible:contractEligible115()),
        verified=x.commissionVerified!==false;

    let recognition=topR?'🏆 Parabéns! Você está no Top 10 eStore CE+PI — '+ordinal(rr)+' lugar.':topS?'🏆 Parabéns! Você está no Top 10 da sua filial — '+ordinal(sr)+' lugar.':'Somos criadores de possibilidades. Você tem a missão de continuar inspirando moda na sua operação. Cada venda contribui para o resultado da sua filial e para a entrega da Regional CE+PI.';
    let asof=x.asof?'<div class=muted style="margin-top:10px">Fonte: relatório por colaborador • matrícula '+esc(U.u.id)+' • atualizado até '+fmtChartDate(x.asof)+'</div>':'';

    let commissionKpi,edayKpi,foot;
    if(!eligible){
      commissionKpi='<div class="kpi teamBadV27">Comissão <span class=metricIcon>▥</span><b>Não elegível</b><small>Modalidade de contrato</small></div>';
      edayKpi='<div class="kpi teamBadV27">eDay • segundas <span class=metricIcon>⭐</span><b>Não elegível</b><small>Sem geração de comissão</small></div>';
      foot='<div class="notice warn" style="margin-top:12px"><b>Obs:</b> '+CONTRACT_NOTE+'</div>'+bopisNotice115();
    }else if(!verified){
      commissionKpi='<div class="kpi teamBadV27">Comissão estimada <span class=metricIcon>▥</span><b>—</b><small>Base BOPIS pendente</small></div>';
      edayKpi='<div class="kpi teamBadV27">eDay • segundas <span class=metricIcon>⭐</span><b>—</b><small>Base BOPIS pendente</small></div>';
      foot=pendingBopis115()+bopisNotice115();
    }else{
      commissionKpi='<div class=kpi>Comissão estimada <span class=metricIcon>▥</span><b>'+money(x.com)+'</b><small>Base aprovada sem BOPIS</small></div>';
      edayKpi='<div class=kpi>eDay • segundas <span class=metricIcon>⭐</span><b id=resultEday>'+money(x.eday||0)+'</b><small>10% sobre aprovado elegível, sem BOPIS</small></div>';
      foot='<div class=muted style="margin-top:10px">* Comissão estimada sobre venda aprovada elegível. BOPIS/Retira em Loja não comissiona.</div>'+bopisNotice115();
    }

    return head+'<div id=resultRecognition class="notice success">'+recognition+'</div><div class=card><div class=grid>'+
      '<div class=kpi>Venda captada <span class=metricIcon>🛒</span><b>'+money(x.c)+'</b></div>'+
      '<div class=kpi>Venda aprovada <span class=metricIcon>▣</span><b>'+money(x.a)+'</b><small>Inclui BOPIS no resultado/ranking</small></div>'+
      '<div class=kpi>Pedidos <span class=metricIcon>🛍️</span><b>'+num(x.o)+'</b></div>'+
      commissionKpi+
      '<div class="kpi rankKpi"><span class=medal>'+(topR?'🏅':'🏆')+'</span>Posição Regional<b id=resultRegionalRank>'+ordinal(rr)+'</b>'+(topR?'<span class=topTag>🏆 TOP 10 • PARABÉNS!</span>':'')+'</div>'+
      '<div class="kpi rankKpi"><span class=medal>'+(topS?'🏅':'🏆')+'</span>Posição Filial<b id=resultStoreRank>'+ordinal(sr)+'</b>'+(topS?'<span class=topTag>🏆 TOP 10 • PARABÉNS!</span>':'')+'</div>'+
      edayKpi+
      '</div><div class=rhythmCard><div><b>🏆 Seu desempenho tem ritmo!</b><div class=muted style="margin-top:6px">Vendas BOPIS continuam no resultado e no ranking; apenas não geram comissão.</div></div><div class=rhythmTag>'+tier.icon+' COLABORADOR<br>'+tier.name+'<small>'+tier.sub+'</small></div></div>'+asof+foot+'</div>';
  };

  window.loadResultExtras=async function(){
    try{
      const period=PER,key=String(U?.u?.id||'')+'|'+period,j=await api({action:'person_period',matricula:U.u.id,store:U.u.st,period});
      const eligible=(j.commissionEligible!==false)&&contractEligible115(),verified=j.commissionVerified!==false;
      const x={
        c:+j.captured||0,a:+j.approved||0,o:+j.orders||0,
        com:eligible&&verified?(+j.commission||0):0,
        eday:eligible&&verified?(+j.eday||0):0,
        commissionableApproved:+j.commissionableApproved||0,
        bopisApproved:+j.bopisApproved||0,
        commissionVerified:verified,
        commissionEligible:eligible,
        commissionEligibilityReason:j.commissionEligibilityReason||(!eligible?CONTRACT_NOTE:''),
        rr:j.regionalRank||null,sr:j.storeRank||null,asof:j.endDate||'',_live:true
      };
      RESULT_PERIOD_CACHE[key]=x;U.p=U.p||{};U.p[period]={...(U.p[period]||{}),...x};
      if(CUR==='result'&&PER===period){let v=document.getElementById('view');if(v)v.innerHTML=resultView()}
    }catch(e){
      console.warn('Meu Resultado',e);
      if(CUR==='result'){let v=document.getElementById('view');if(v)v.innerHTML='<div class=card><div class="notice danger">Não foi possível consultar o resultado oficial neste momento.</div></div>'}
    }
  };


  function injectPoolStyleV143(){
    if(document.getElementById('pool-v143-style'))return;
    const st=document.createElement('style');st.id='pool-v143-style';
    st.textContent=
      '.poolToolbarV143{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 14px}.poolRowV143{display:grid;grid-template-columns:48px minmax(0,1fr) auto;gap:10px;align-items:center;padding:11px 10px;border-bottom:1px solid #ebe8e0}.poolRankV143{width:38px;height:38px;border-radius:12px;background:#eef3f0;color:#173F35;display:grid;place-items:center;font-weight:900}.poolRowV143:nth-child(1) .poolRankV143{background:#f6d466}.poolRowV143:nth-child(2) .poolRankV143{background:#e3e5e4}.poolRowV143:nth-child(3) .poolRankV143{background:#e9bc8f}.poolStoreV143{font-weight:900;color:#173F35;font-size:15px}.poolMetaV143{font-size:10px;color:#66736f;line-height:1.45;margin-top:3px}.poolAmountV143{min-width:108px;text-align:right;font-size:19px!important;font-weight:950!important;color:#173F35!important;background:#edf4f1;border-radius:12px;padding:9px 10px;box-shadow:inset 0 0 0 1px #dbe7e2}.poolBopisV143{display:inline-flex;align-items:center;gap:5px;background:#e62b2b;color:white;border-radius:999px;padding:4px 8px;font-size:9px;font-weight:900;margin-left:5px;white-space:nowrap}.poolBopisV143 b{color:white!important}.poolSupervisorValueV143{display:inline-block;background:#173F35;color:white!important;border-radius:10px;padding:7px 10px;min-width:96px;text-align:center;font-size:16px!important}.poolRuleV143{background:#f1f5f2;border-left:4px solid #173F35;border-radius:12px;padding:10px 12px;margin:10px 0;font-size:11px;color:#284a42}@media(max-width:600px){.poolRowV143{grid-template-columns:42px minmax(0,1fr) auto}.poolAmountV143{min-width:96px;font-size:17px!important;padding:8px}.poolBopisV143{margin-left:0;margin-top:4px}}';
    document.head.appendChild(st);
  }

  function poolMonthLabelV143(){
    const ym=/^\d{4}-\d{2}$/.test(String(COMM_MONTH||''))?COMM_MONTH:new Date().toLocaleDateString('en-CA',{timeZone:'America/Fortaleza'}).slice(0,7);
    const [y,m]=ym.split('-').map(Number);
    return new Date(y,m-1,1).toLocaleDateString('pt-BR',{month:'long',year:'numeric'}).replace(/^./,x=>x.toUpperCase());
  }
  function poolDateV143(s){try{return new Date(String(s)+'T12:00:00').toLocaleDateString('pt-BR')}catch{return String(s||'')}}
  function poolMoneyV143(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
  function poolRoundRectV143(ctx,x,y,w,h,r,fill,stroke){
    ctx.beginPath();
    if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);else ctx.rect(x,y,w,h);
    ctx.fillStyle=fill;ctx.fill();
    if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}
  }
  function poolTextV143(ctx,t,x,y,font,color,align='left',maxW){
    ctx.font=font;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='middle';
    let s=String(t??'');
    if(maxW){while(s.length>2&&ctx.measureText(s).width>maxW)s=s.slice(0,-1);if(s!==String(t??''))s=s.slice(0,-1)+'…'}
    ctx.fillText(s,x,y);
  }
  async function poolLogoV143(){
    return await new Promise(ok=>{
      const i=new Image();i.onload=()=>ok(i);i.onerror=()=>ok(null);
      i.src='./assets/riachuelo-logo-horizontal-oficial-v133.svg?v=133';
    });
  }
  async function loadPoolCardDataV143(){
    const req={action:'pool_rankings',matricula:U.u.id,period:'month',month:COMM_MONTH};
    POOL_DATA_V143=await api(req);
    return POOL_DATA_V143;
  }
  async function poolCanvasV143(){
    const d=await loadPoolCardDataV143(),stores=(d.stores||[]).slice().sort((a,b)=>(+b.pool||0)-(+a.pool||0));
    const rows=stores,regional=stores.reduce((s,x)=>s+(+x.pool||0),0),bopisStores=stores.filter(x=>(+x.bopisApproved||0)>0).length,top=stores[0]||{};
    const W=1080,cols=2,rowH=72,rowStart=558,gridRows=Math.ceil(Math.max(rows.length,1)/cols),gridBottom=rowStart+(gridRows*rowH),footerY=gridBottom+24,H=footerY+120;
    const SCALE=2,cv=document.createElement('canvas');cv.width=W*SCALE;cv.height=H*SCALE;const x=cv.getContext('2d');x.scale(SCALE,SCALE);
    const GREEN='#173F35',GREEN2='#315E54',PAPER='#F7F5EF',WHITE='#FFFFFF',TEXT='#173F35',MUTED='#64726D',RED='#E62B2B',BORDER='#E5E2DA',GOLD='#F2CC5D',SILVER='#DFE2E1',BRONZE='#E7B686';
    x.fillStyle=PAPER;x.fillRect(0,0,W,H);

    const logo=await poolLogoV143();
    if(logo){const ratio=(logo.naturalWidth||400)/(logo.naturalHeight||90),lw=360,lh=lw/ratio;x.drawImage(logo,48,34,lw,lh)}
    poolTextV143(x,'Moda que inspira o Brasil',1030,63,'600 22px Arial',TEXT,'right');

    poolRoundRectV143(x,30,110,1020,330,28,WHITE);
    poolTextV143(x,'POOL DE COMISSÃO',54,162,'900 48px Arial',TEXT);
    poolTextV143(x,'Parcial do mês • CE+PI',54,210,'700 26px Arial',MUTED);
    poolTextV143(x,'Atualizado até '+poolDateV143(d.endDate),54,248,'600 18px Arial',GREEN2);
    poolRoundRectV143(x,650,138,365,98,18,'#EEF3F0');
    poolTextV143(x,'Base do Pool =',680,168,'700 17px Arial',TEXT);
    poolTextV143(x,'Aprovado da loja − BOPIS',680,202,'600 17px Arial',TEXT);

    poolRoundRectV143(x,50,285,430,125,18,GREEN);
    poolTextV143(x,'Pool regional estimado',78,318,'600 18px Arial','#F0F5F2');
    poolTextV143(x,poolMoneyV143(regional),78,365,'900 38px Arial',WHITE);
    poolRoundRectV143(x,500,285,220,125,18,'#F0F3F0');
    poolTextV143(x,'Lojas com BOPIS',525,318,'600 16px Arial',MUTED);
    poolTextV143(x,String(bopisStores),525,365,'900 34px Arial',TEXT);
    poolRoundRectV143(x,740,285,275,125,18,'#F0F3F0');
    poolTextV143(x,'Maior Pool da regional',765,318,'600 15px Arial',MUTED);
    poolTextV143(x,String(top.st||'—')+' • '+poolMoneyV143(top.pool||0),765,365,'900 23px Arial',TEXT);

    const rankBoxH=(gridBottom-462)+18;
    poolRoundRectV143(x,30,462,1020,rankBoxH,28,WHITE);
    poolTextV143(x,'Ranking Pool por Loja',55,505,'900 30px Arial',TEXT);
    poolTextV143(x,'Ranking completo • todas as lojas da regional',1020,505,'600 16px Arial',MUTED,'right');

    const colW=480,gap=20,leftX=50;
    rows.forEach((r,i)=>{
      const col=i%2,row=Math.floor(i/2),rx=leftX+col*(colW+gap),ry=rowStart+row*rowH;
      poolRoundRectV143(x,rx,ry,colW,60,13,'#FCFBF8',BORDER);
      const badge=i===0?GOLD:i===1?SILVER:i===2?BRONZE:'#EAF0EC';
      poolRoundRectV143(x,rx+12,ry+11,42,38,10,badge);
      poolTextV143(x,(i+1)+'º',rx+33,ry+30,'900 15px Arial',TEXT,'center');
      poolTextV143(x,'Loja '+String(r.st),rx+68,ry+20,'900 17px Arial',TEXT);
      poolTextV143(x,poolMoneyV143(r.pool),rx+462,ry+20,'900 19px Arial',TEXT,'right');
      const base='Base '+poolMoneyV143(r.approved);
      poolTextV143(x,base,rx+68,ry+43,'600 12px Arial',MUTED,'left',220);
      const bop=+r.bopisApproved||0;
      if(bop>0){
        poolRoundRectV143(x,rx+315,ry+34,55,18,9,RED);
        poolTextV143(x,'BOPIS',rx+342.5,ry+43,'900 9px Arial',WHITE,'center');
        poolTextV143(x,'-'+poolMoneyV143(bop).replace(/\s/g,''),rx+462,ry+43,'800 11px Arial',RED,'right',88);
      }
    });

    poolRoundRectV143(x,30,footerY,1020,95,22,GREEN);
    poolTextV143(x,'Quanto maior a base sem BOPIS, maior o Pool da loja.',58,footerY+35,'800 22px Arial',WHITE);
    poolTextV143(x,'Siga acelerando a captação com qualidade para ampliar o ganho do time.',58,footerY+68,'500 17px Arial','#E3ECE8');
    return cv;
  }
  function poolCaptionV143(d){
    const stores=(d?.stores||[]).slice().sort((a,b)=>(+b.pool||0)-(+a.pool||0)),regional=stores.reduce((s,x)=>s+(+x.pool||0),0);
    return ['📲 *POOL DE COMISSÃO | CE+PI*','*'+poolMonthLabelV143()+' • atualizado até '+poolDateV143(d?.endDate)+'*','','💰 *Pool regional estimado:* '+poolMoneyV143(regional),'🏆 *Maior Pool:* '+(stores[0]?.st||'—')+' • '+poolMoneyV143(stores[0]?.pool||0),'','*Top lojas:*',...stores.slice(0,5).map((x,i)=>(i+1)+'º • *'+x.st+'* — '+poolMoneyV143(x.pool)+((+x.bopisApproved||0)>0?' | BOPIS -'+poolMoneyV143(x.bopisApproved):'')),'','Quanto maior a base sem BOPIS, maior o Pool da loja.'].join('\n');
  }
  window.previewPoolCardV143=async function(){
    try{
      const c=await poolCanvasV143(),m=document.createElement('div');m.className='previewModal';
      m.innerHTML='<div class=box><img src="'+c.toDataURL('image/png')+'" alt="Pool de Comissão CE+PI"><div class=toolbar><button class=btn onclick="sharePoolCardV143()">Compartilhar</button><button class="btn ghost" onclick="this.closest(\'.previewModal\').remove()">Fechar</button></div></div>';
      m.onclick=e=>{if(e.target===m)m.remove()};document.body.appendChild(m);
    }catch(e){alert('Não foi possível gerar o card do Pool.')}
  };
  window.sharePoolCardV143=async function(){
    try{
      const cv=await poolCanvasV143(),d=POOL_DATA_V143,b=await new Promise(r=>cv.toBlob(r,'image/png',.98)),caption=poolCaptionV143(d);
      if(!b)throw new Error('Falha ao gerar imagem');
      const f=new File([b],'Pool_Comissao_CEPI_'+String(COMM_MONTH||'mes')+'.png',{type:'image/png'});
      if(navigator.share){
        try{if(!navigator.canShare||navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'Pool de Comissão • CE+PI',text:caption});return}}
        catch(e){if(e?.name==='AbortError')return}
      }
      try{await navigator.clipboard.writeText(caption)}catch(e){}
      const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=f.name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1200);
    }catch(e){alert('Não foi possível compartilhar o card do Pool.')}
  };

  window.commission=function(){
    injectPoolStyleV143();
    if(!commissionEligible115()){
      if(PER==='year')PER='month';
      return '<div class=card><div class=title>Comissão</div>'+commissionTabs()+
        '<div class=grid><div class="kpi teamBadV27">Elegibilidade<b>Não elegível</b><small>Modalidade de contrato</small></div><div class=kpi>Comissão estimada<b>R$ 0,00</b><small>Não aplicável</small></div></div>'+
        '<div class="notice warn"><b>Obs:</b> '+CONTRACT_NOTE+'</div>'+bopisNotice115()+'</div>';
    }
    let html=typeof baseCommissionV115==='function'?baseCommissionV115():'';
    if(isLead()){
      html=html.replace(
        '<div class=title>Ranking Pool • Lojas CE+PI</div><div id=poolStores',
        '<div class=title>Ranking Pool • Lojas CE+PI</div><div class=poolRuleV143><b>Pool da loja = 3%</b> sobre a venda aprovada, descontando somente as vendas BOPIS registradas.</div><div class=poolToolbarV143><button class="btn alt" onclick="previewPoolCardV143()">Visualizar card</button><button class=btn onclick="sharePoolCardV143()">Compartilhar parcial do mês</button></div><div id=poolStores'
      );
    }
    return html+bopisNotice115();
  };

  window.loadHistoricalCommission=async function(){
    if(!commissionEligible115()){let v=document.getElementById('view');if(v&&CUR==='commission')v.innerHTML=commission();return}
    let el=$('#commMonthStatus');if(el)el.textContent='Consultando '+COMM_MONTH+'…';
    try{
      let j=await api({action:'commission_period',matricula:U.u.id,month:COMM_MONTH}),d=j.individual||{};
      if(j.commissionEligible===false){let v=document.getElementById('view');if(v&&CUR==='commission')v.innerHTML=commission();return}
      if(j.commissionVerified===false){
        if($('#commNormal'))$('#commNormal').textContent='—';
        if($('#commEday'))$('#commEday').textContent='—';
        if($('#commIndividual'))$('#commIndividual').textContent='—';
        if(el)el.textContent='Base BOPIS pendente • valor não exibido';
      }else{
        if($('#commNormal'))$('#commNormal').textContent=money(d.normal||0);
        if($('#commEday'))$('#commEday').textContent=money(d.eday||0);
        if($('#commIndividual'))$('#commIndividual').textContent=money(d.total||0);
        if(el)el.textContent='Comissionamento atualizado • BOPIS excluído';
      }
      if(typeof loadPoolRankings==='function')await loadPoolRankings();
    }catch(e){if(el)el.textContent='Histórico deste mês ainda não está disponível.'}
  };

  window.loadPoolRankings=async function(){
    if(!isLead())return;
    injectPoolStyleV143();
    try{
      let req={action:'pool_rankings',matricula:U.u.id,period:PER};if(PER==='month')req.month=COMM_MONTH;
      let j=await api(req),mine=j.mySupervisor,stores=j.stores||[],sups=j.supervisors||[],
          validSups=sups.filter(x=>x.poolAvailable!==false),
          avg=validSups.length?validSups.reduce((a,x)=>a+(+x.pool||0),0)/validSups.length:0,
          myAvailable=mine?mine.poolAvailable!==false:true,
          myPool=mine&&myAvailable?+mine.pool:0;
      POOL_DATA_V143=j;

      if($('#poolKpi')){$('#poolKpi').textContent=mine&&!myAvailable?'—':money(myPool);$('#poolKpi').classList.add('poolSupervisorValueV143')}
      if($('#poolTotal')){
        const indivText=$('#commIndividual')?.textContent||'';
        const indiv=indivText.includes('—')?null:+indivText.replace(/[^0-9,]/g,'').replace(',','.');
        $('#poolTotal').textContent=mine&&!myAvailable||indiv==null?'—':money(myPool+(indiv||0));
        $('#poolTotal').classList.add('poolSupervisorValueV143');
      }

      if($('#poolStores'))$('#poolStores').innerHTML=stores.map((x,i)=>{
        const bop=+x.bopisApproved||0,bopis=bop>0?'<span class=poolBopisV143>BOPIS <b>-'+money(bop)+'</b></span>':'';
        return '<div class=poolRowV143><div class=poolRankV143>'+(i+1)+'º</div><div><div class=poolStoreV143>Filial '+esc(x.st)+'</div><div class=poolMetaV143>Base comissionável '+money(x.approved)+' • '+x.eligible+' supervisor'+(x.eligible===1?'':'es')+' elegível'+(x.eligible===1?'':'eis')+' '+bopis+'</div></div><b class=poolAmountV143>'+money(x.pool)+'</b></div>';
      }).join('');

      if(isAdmin()){
        if($('#poolMine'))$('#poolMine').innerHTML=sups.length?sups.map(x=>{
          return '<div class=rankrow><b>'+x.rank+'º</b><div><b>'+esc(preferredName(x.id,x.name))+'</b><div class=muted>Filial '+esc(x.st)+' • '+esc(x.role)+'</div></div><b class=poolSupervisorValueV143>'+money(x.pool)+'</b></div>';
        }).join(''):'<div class=muted>Sem supervisores elegíveis neste período.</div>';
        return;
      }
      if(mine){
        let msg=myPool<avg?'<div class="notice warn"><b>Tem espaço para crescer.</b><br>Seu Pool está abaixo da média regional de '+money(avg)+'. Cada venda aprovada sem BOPIS aumenta o potencial de ganho do time.</div>':'<div class="notice success"><b>Acima da média regional!</b><br>Continue acelerando a entrega da filial e defendendo sua posição.</div>';
        if($('#poolMine'))$('#poolMine').innerHTML='<div class=grid><div class=kpi>Minha posição<b>'+mine.rank+'º</b></div><div class=kpi>Meu Pool<b class=poolSupervisorValueV143>'+money(mine.pool)+'</b><small>Base aprovada menos BOPIS</small></div><div class=kpi>Média Regional<b>'+money(avg)+'</b></div></div>'+msg;
      }else if($('#poolMine'))$('#poolMine').innerHTML='<div class=notice>Seu cadastro não está entre os supervisores elegíveis ao Pool neste período.</div>';
    }catch(e){
      if($('#poolStores'))$('#poolStores').innerHTML='<div class="notice danger">'+esc(e.message)+'</div>';
      if($('#poolMine'))$('#poolMine').innerHTML='<div class="notice danger">'+esc(e.message)+'</div>';
    }
  };

  window.sim=function(){
    if(!commissionEligible115())return typeof baseSimV115==='function'?baseSimV115():undefined;
    let v=Number(String($('#simv')?.value||'').replace(',','.'))||0,r=Number($('#simr')?.value||0);
    if($('#simout'))$('#simout').innerHTML='<div class="notice success">Comissão estimada: <b>'+money(v*r)+'</b><br><small>Informe somente venda aprovada elegível. BOPIS/Retira em Loja não entra no cálculo.</small></div>';
  };
})();