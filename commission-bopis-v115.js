/* ===== V115 2026-10-04: BOPIS não comissionável + transparência ===== */
(function(){
  'use strict';
  if(window.__BOPIS_COMMISSION_V115__)return;
  window.__BOPIS_COMMISSION_V115__=true;

  const BOPIS_NOTE='BOPIS (Retira em Loja) não gera comissionamento. O valor aprovado de pedidos BOPIS não compõe a comissão individual nem o Pool dos supervisores.';
  const CONTRACT_NOTE='Não elegível a comissionamento por conta da modalidade de contrato e política interna de benefícios.';
  const baseCommissionV115=window.commission;
  const baseSimV115=window.sim;

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

  window.commission=function(){
    if(!commissionEligible115()){
      if(PER==='year')PER='month';
      return '<div class=card><div class=title>Comissão</div>'+commissionTabs()+
        '<div class=grid><div class="kpi teamBadV27">Elegibilidade<b>Não elegível</b><small>Modalidade de contrato</small></div><div class=kpi>Comissão estimada<b>R$ 0,00</b><small>Não aplicável</small></div></div>'+
        '<div class="notice warn"><b>Obs:</b> '+CONTRACT_NOTE+'</div>'+bopisNotice115()+'</div>';
    }
    let html=typeof baseCommissionV115==='function'?baseCommissionV115():'';
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
    try{
      let req={action:'pool_rankings',matricula:U.u.id,period:PER};if(PER==='month')req.month=COMM_MONTH;
      let j=await api(req),mine=j.mySupervisor,stores=j.stores||[],sups=j.supervisors||[],
          validSups=sups.filter(x=>x.poolAvailable!==false),
          avg=validSups.length?validSups.reduce((a,x)=>a+(+x.pool||0),0)/validSups.length:0,
          myAvailable=mine?mine.poolAvailable!==false:true,
          myPartial=mine?.commissionPartial===true,
          myPool=mine&&myAvailable?+mine.pool:0;

      if($('#poolKpi'))$('#poolKpi').textContent=mine&&!myAvailable?'—':money(myPool);
      if($('#poolTotal')){
        const indivText=$('#commIndividual')?.textContent||'';
        const indiv=indivText.includes('—')?null:+indivText.replace(/[^0-9,]/g,'').replace(',','.');
        $('#poolTotal').textContent=mine&&!myAvailable||indiv==null?'—':money(myPool+(indiv||0));
      }

      if($('#poolStores'))$('#poolStores').innerHTML=stores.map((x,i)=>{
        const available=x.poolAvailable!==false,partial=x.commissionPartial===true;
        const baseText=available
          ?'Base aprovada sem BOPIS: '+money(x.approved)+(partial?' • parcial verificada • '+Number(x.pendingRows||0)+' pendência(s) Tipo Entrega':'')
          :'Base aprovada: '+money(x.grossApproved||0)+' • aguardando Tipo Entrega';
        return '<div class=rankrow><b>'+(i+1)+'º</b><div>Filial '+esc(x.st)+
          '<div class=muted>'+x.eligible+' supervisores elegíveis • '+baseText+
          (available&&(+x.bopisApproved||0)>0?' • BOPIS excluído '+money(x.bopisApproved):'')+'</div></div><b>'+(available?money(x.pool):'—')+'</b></div>';
      }).join('');

      if(isAdmin()){
        if($('#poolMine'))$('#poolMine').innerHTML=sups.length?sups.map(x=>{
          const available=x.poolAvailable!==false,partial=x.commissionPartial===true;
          return '<div class=rankrow><b>'+x.rank+'º</b><div><b>'+esc(preferredName(x.id,x.name))+'</b><div class=muted>Filial '+esc(x.st)+' • '+esc(x.role)+(partial?' • Pool parcial verificado':(!available?' • Base BOPIS pendente':''))+'</div></div><b>'+(available?money(x.pool):'—')+'</b></div>';
        }).join(''):'<div class=muted>Sem supervisores elegíveis neste período.</div>';
        return;
      }
      if(mine){
        if(!myAvailable){
          if($('#poolMine'))$('#poolMine').innerHTML='<div class="notice warn"><b>Pool aguardando base com Tipo Entrega.</b><br>Ainda não há base verificada suficiente para separar e excluir BOPIS da sua filial.</div>';
          return;
        }
        let partialMsg=myPartial?'<div class="notice warn"><b>Pool parcial de outubro.</b><br>Valor calculado somente sobre a base já verificada sem BOPIS. '+Number(mine.pendingRows||0)+' registro(s) ainda aguardam Tipo Entrega e serão incorporados após validação.</div>':'';
        let msg=myPool<avg?'<div class="notice warn"><b>Tem espaço para crescer.</b><br>Seu Pool está abaixo da média regional de '+money(avg)+'.</div>':'<div class="notice success"><b>Acima da média regional!</b><br>Continue acelerando a entrega da filial e defendendo sua posição.</div>';
        if($('#poolMine'))$('#poolMine').innerHTML='<div class=grid><div class=kpi>Minha posição<b>'+mine.rank+'º</b></div><div class=kpi>Meu Pool<b>'+money(mine.pool)+'</b><small>'+(myPartial?'Parcial verificado • BOPIS excluído':'BOPIS excluído')+'</small></div><div class=kpi>Média Regional<b>'+money(avg)+'</b></div></div>'+partialMsg+msg;
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