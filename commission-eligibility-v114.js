/* ===== V114 2026-10-04: elegibilidade de comissionamento ===== */
(function(){
  'use strict';
  if(window.__COMMISSION_ELIGIBILITY_V114__)return;
  window.__COMMISSION_ELIGIBILITY_V114__=true;

  const NOTE='Não elegível a comissionamento por conta da modalidade de contrato e política interna de benefícios.';
  const baseCommissionV114=window.commission;
  const baseCalcCommissionV114=window.calcCommission;
  const baseSimV114=window.sim;

  function normV114(s){
    return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  }
  function localEligibleV114(){
    return !/(intermitente|aprendiz)/.test(normV114(U?.u?.role||''));
  }
  function periodCacheV114(){
    const key=String(U?.u?.id||'')+'|'+PER;
    return window.RESULT_PERIOD_CACHE?.[key]||null;
  }
  function eligibleV114(){
    const x=periodCacheV114();
    if(x&&typeof x.commissionEligible==='boolean')return x.commissionEligible;
    return localEligibleV114();
  }
  function ineligibleNoticeV114(){
    return '<div class="notice warn" style="margin-top:12px"><b>Obs:</b> '+NOTE+'</div>';
  }

  // Meu Resultado: mantém vendas/ranking, mas não projeta comissão para modalidades não elegíveis.
  window.resultView=function(){
    let key=String(U?.u?.id||'')+'|'+PER,x=RESULT_PERIOD_CACHE[key];
    let head='<div class="card resultProfile"><div class=profileHead>'+photo(U.u.id,displayName(),'photoBig')+'<div><div class=title>'+esc(displayName())+'</div><div class=muted>Filial '+esc(U.u.st)+' • '+esc(U.u.role)+'</div></div></div>'+tabs()+'</div>';
    if(!x)return head+'<div class=card><div class=muted>Consultando resultado oficial pela sua matrícula...</div></div>';
    let rr=(+x.c||0)>0?x.rr:null,sr=(+x.c||0)>0?x.sr:null,tier=performanceTier(x),hasSale=(+x.c||0)>0,topR=hasSale&&rr&&rr<=10,topS=hasSale&&sr&&sr<=10,
        eligible=(typeof x.commissionEligible==='boolean'?x.commissionEligible:localEligibleV114());
    let recognition=topR?'🏆 Parabéns! Você está no Top 10 eStore CE+PI — '+ordinal(rr)+' lugar.':topS?'🏆 Parabéns! Você está no Top 10 da sua filial — '+ordinal(sr)+' lugar.':'Somos criadores de possibilidades. Você tem a missão de continuar inspirando moda na sua operação. Cada venda contribui para o resultado da sua filial e para a entrega da Regional CE+PI.';
    let asof=x.asof?'<div class=muted style="margin-top:10px">Fonte: relatório por colaborador • matrícula '+esc(U.u.id)+' • atualizado até '+fmtChartDate(x.asof)+'</div>':'';
    let commissionKpi=eligible
      ?'<div class=kpi>Comissão estimada <span class=metricIcon>▥</span><b>'+money(x.com)+'</b></div>'
      :'<div class="kpi teamBadV27">Comissão <span class=metricIcon>▥</span><b>Não elegível</b><small>Modalidade de contrato</small></div>';
    let edayKpi=eligible
      ?'<div class=kpi>eDay • segundas <span class=metricIcon>⭐</span><b id=resultEday>'+money(x.eday||0)+'</b><small>10% sobre vendas aprovadas nas segundas</small></div>'
      :'<div class="kpi teamBadV27">eDay • segundas <span class=metricIcon>⭐</span><b>Não elegível</b><small>Sem geração de comissão</small></div>';
    let foot=eligible
      ?'<div class=muted style="margin-top:10px">* Comissão estimada até o fechamento/aprovação definitiva.</div>'
      :ineligibleNoticeV114();

    return head+'<div id=resultRecognition class="notice success">'+recognition+'</div><div class=card><div class=grid>'+
      '<div class=kpi>Venda captada <span class=metricIcon>🛒</span><b>'+money(x.c)+'</b></div>'+
      '<div class=kpi>Venda aprovada <span class=metricIcon>▣</span><b>'+money(x.a)+'</b></div>'+
      '<div class=kpi>Pedidos <span class=metricIcon>🛍️</span><b>'+num(x.o)+'</b></div>'+
      commissionKpi+
      '<div class="kpi rankKpi"><span class=medal>'+(topR?'🏅':'🏆')+'</span>Posição Regional<b id=resultRegionalRank>'+ordinal(rr)+'</b>'+(topR?'<span class=topTag>🏆 TOP 10 • PARABÉNS!</span>':'')+'</div>'+
      '<div class="kpi rankKpi"><span class=medal>'+(topS?'🏅':'🏆')+'</span>Posição Filial<b id=resultStoreRank>'+ordinal(sr)+'</b>'+(topS?'<span class=topTag>🏆 TOP 10 • PARABÉNS!</span>':'')+'</div>'+
      edayKpi+
      '</div><div class=rhythmCard><div><b>🏆 Seu desempenho tem ritmo!</b><div class=muted style="margin-top:6px">Sua classificação considera ritmo, frequência e resultados no período selecionado.</div></div><div class=rhythmTag>'+tier.icon+' COLABORADOR<br>'+tier.name+'<small>'+tier.sub+'</small></div></div>'+asof+foot+'</div>';
  };

  window.loadResultExtras=async function(){
    try{
      const period=PER,key=String(U?.u?.id||'')+'|'+period,j=await api({action:'person_period',matricula:U.u.id,store:U.u.st,period});
      const eligible=(j.commissionEligible!==false)&&localEligibleV114();
      const x={
        c:+j.captured||0,a:+j.approved||0,o:+j.orders||0,
        com:eligible?(+j.commission||0):0,eday:eligible?(+j.eday||0):0,
        commissionEligible:eligible,
        commissionEligibilityReason:j.commissionEligibilityReason||(!eligible?NOTE:''),
        rr:j.regionalRank||null,sr:j.storeRank||null,asof:j.endDate||'',_live:true
      };
      RESULT_PERIOD_CACHE[key]=x;U.p=U.p||{};U.p[period]={...(U.p[period]||{}),...x};
      if(CUR==='result'&&PER===period){let v=document.getElementById('view');if(v)v.innerHTML=resultView()}
    }catch(e){
      console.warn('Meu Resultado',e);
      if(CUR==='result'){let v=document.getElementById('view');if(v)v.innerHTML='<div class=card><div class="notice danger">Não foi possível consultar o resultado oficial neste momento.</div></div>'}
    }
  };

  window.calcCommission=function(){
    if(!eligibleV114())return 0;
    return typeof baseCalcCommissionV114==='function'?baseCalcCommissionV114():0;
  };

  // Pool / Comissão: também evita simulação e expectativa de pagamento para modalidades não elegíveis.
  window.commission=function(){
    if(eligibleV114())return typeof baseCommissionV114==='function'?baseCommissionV114():'';
    if(PER==='year')PER='month';
    return '<div class=card><div class=title>Comissão</div>'+commissionTabs()+
      '<div class=grid><div class="kpi teamBadV27">Elegibilidade<b>Não elegível</b><small>Modalidade de contrato</small></div>'+
      '<div class=kpi>Comissão estimada<b>R$ 0,00</b><small>Não aplicável</small></div></div>'+
      ineligibleNoticeV114()+
      '<div class=muted style="margin-top:10px">Se houver alteração da modalidade contratual, a elegibilidade será refletida a partir da atualização da base de colaboradores.</div></div>';
  };

  window.loadHistoricalCommission=async function(){
    if(eligibleV114()){
      let el=$('#commMonthStatus');if(el)el.textContent='Consultando '+COMM_MONTH+'…';
      try{
        let j=await api({action:'commission_period',matricula:U.u.id,month:COMM_MONTH}),d=j.individual||{};
        if(j.commissionEligible===false){
          let view=document.getElementById('view');if(view&&CUR==='commission')view.innerHTML=commission();
          return;
        }
        if($('#commNormal'))$('#commNormal').textContent=money(d.normal||0);
        if($('#commEday'))$('#commEday').textContent=money(d.eday||0);
        if($('#commIndividual'))$('#commIndividual').textContent=money(d.total||0);
        if(el)el.textContent='Comissionamento atualizado • '+COMM_MONTH;
        if(typeof loadPoolRankings==='function')await loadPoolRankings();
      }catch(e){if(el)el.textContent='Histórico deste mês ainda não está disponível.'}
      return;
    }
    let view=document.getElementById('view');if(view&&CUR==='commission')view.innerHTML=commission();
  };

  window.sim=function(){
    if(!eligibleV114()){
      let el=$('#simout');if(el)el.innerHTML='<div class="notice warn"><b>Obs:</b> '+NOTE+'</div>';
      return;
    }
    if(typeof baseSimV114==='function')return baseSimV114();
  };
})();