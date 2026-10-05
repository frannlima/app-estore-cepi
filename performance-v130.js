/* V132 — Central de Performance | FCA Inteligente • resumo natural + complemento + branding oficial */
(function(){
  'use strict';
  if(window.__PERFORMANCE_V130_LOADED__)return;
  window.__PERFORMANCE_V130_LOADED__=true;

  var PERF_FCA_V130=null;
  var PERF_SCOPE_V130='regional';
  var PERF_PERIOD_V130='closed';
  var PERF_FOCUS_V130='share';
  var PERF_ACTIONS_CURRENT_V130=[];
  var PERF_DRAFT_V130=null;

  var PERF_FOCUS_LABELS_V130={
    share:'Share eStore',
    captured:'Venda captada',
    orders:'Pedidos',
    ticket:'Ticket médio',
    dispersion:'Dispersão'
  };
  var PERF_VOICE_LABELS_V130={
    instabilidade_app:'Instabilidade App/eStore',
    pagamento:'Problema de pagamento',
    cupom:'Cupom não aplicou',
    estoque_online:'Indisponibilidade de estoque online',
    outra_atividade:'Foco em outra atividade',
    abordagem:'Abordagem ao cliente',
    escala_folga:'Escala / folga',
    outro:'Outro motivo'
  };

  function pnum(v){var n=Number(v);return Number.isFinite(n)?n:0}
  function phas(v){return v!==null&&v!==undefined&&Number.isFinite(Number(v))}
  function pmoney(v){return typeof money==='function'?money(v):new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(pnum(v))}
  function ppct(v,d){if(v===null||v===undefined)return '—';return (pnum(v)*100).toLocaleString('pt-BR',{minimumFractionDigits:d==null?2:d,maximumFractionDigits:d==null?2:d})+'%'}
  function ppp(v){if(v===null||v===undefined)return '—';var n=pnum(v);return (n>0?'+':'')+(n*100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+' p.p.'}
  function pchange(v){if(v===null||v===undefined||!Number.isFinite(Number(v)))return '—';var n=Number(v);return (n>0?'+':'')+(n*100).toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})+'%'}
  function pdate(v){if(!v)return '—';try{return new Date(String(v)+'T12:00:00').toLocaleDateString('pt-BR')}catch(e){return String(v)}}
  function pesc(v){return typeof esc==='function'?esc(v):String(v==null?'':v)}
  function pstoreName(x){var st=String(x&&x.st||'');var name=x&&x.name?x.name:(typeof storeDisplayName==='function'?storeDisplayName(st):'');return st+(name?' • '+name:'')}
  function ptrend(v){var n=pnum(v);return n>0?'up':n<0?'down':'flat'}
  function pdeltaWord(v){var n=pnum(v);return n>0?'evolução':n<0?'retração':'estabilidade'}
  function pshort(v,max){var s=String(v||'').trim();return s.length>max?s.slice(0,max-1)+'…':s}
  function punique(arr,key){var m={};return (arr||[]).filter(function(x){var k=String(x&&x[key]||'');if(!k||m[k])return false;m[k]=1;return true})}

  var PERF_LOGO_V131='./assets/riachuelo-logo-horizontal-oficial-white-v133.svg'; // logo oficial Riachuelo • modelo aprovado
  function pprevFromChangeV131(current,change){
    if(change===null||change===undefined||!Number.isFinite(Number(change)))return null;
    var r=Number(change),den=1+r;
    if(!Number.isFinite(den)||Math.abs(den)<.000001)return null;
    return pnum(current)/den;
  }
  function pgapFromChangeV131(current,change,previous){
    var prev=phas(previous)?pnum(previous):pprevFromChangeV131(current,change);
    return prev===null?null:pnum(current)-prev;
  }
  function psignedMoneyV131(v){
    if(v===null||v===undefined||!Number.isFinite(Number(v)))return '—';
    var n=Number(v);return (n>0?'+':n<0?'-':'')+pmoney(Math.abs(n));
  }
  function psignedIntV131(v,label){
    if(v===null||v===undefined||!Number.isFinite(Number(v)))return '—';
    var n=Math.round(Number(v));return (n>0?'+':'')+n.toLocaleString('pt-BR')+(label?' '+label:'');
  }
  function metricGapV131(s,type){
    if(type==='captured')return pgapFromChangeV131(s.captured,s.capturedChange,s.previousCaptured);
    if(type==='orders')return pgapFromChangeV131(s.orders,s.ordersChange,s.previousOrders);
    if(type==='ticket')return pgapFromChangeV131(s.ticket,s.ticketChange,s.previousTicket);
    return null;
  }
  function metricDeviationTextV131(s,type){
    if(type==='share')return ppp(s.shareDelta);
    var change=type==='captured'?s.capturedChange:type==='orders'?s.ordersChange:s.ticketChange;
    if(change===null||change===undefined||!Number.isFinite(Number(change)))return type==='orders'?'Volume do período':'Resultado do período';
    var gap=metricGapV131(s,type),gapTxt=type==='orders'?psignedIntV131(gap,'pedidos'):psignedMoneyV131(gap);
    return pchange(change)+'  |  gap '+gapTxt;
  }

  function performanceViewV130(){
    if(typeof isLead==='function'&&!isLead())return '<div class=notice>Central de Performance disponível para supervisores e gestores.</div>';
    return '<div class=performancePageV130>'+
      '<section class=performanceHeroV130>'+
        '<button class=performanceBackTopV131 onclick="goBackApp()" aria-label="Voltar">← <span>Voltar</span></button>'+
        '<img class=brand src="'+PERF_LOGO_V131+'" alt="Riachuelo">'+
        '<h1>Central de Performance | FCA Inteligente</h1>'+
        '<p>Da análise à ação. Resultado, sinais de performance, causas registradas, priorização e plano de reversão reunidos em uma única leitura executiva.</p>'+
        '<div class=performanceHeroMetaV130><span>eStore CE+PI</span><span>Fonte oficial do App</span><span>FCA pré-pronta</span></div>'+
      '</section>'+
      '<div id=performanceRootV130><div class=card><div class=muted>Consolidando indicadores e tratativas...</div></div></div>'+
    '</div>';
  }
  window.performanceViewV130=performanceViewV130;

  function closedStores(d){return Array.isArray(d&&d.stores)?d.stores:[]}
  function currentStores(d){
    var p=d&&d.currentPartial||{};
    return punique([].concat(p.growth||[],p.retractions||[]),'st');
  }
  function ownClosedStore(d){
    var st=String(U&&U.u&&U.u.st||'');
    return closedStores(d).find(function(x){return String(x.st)===st})||
           (d&&d.prioritized||[]).find(function(x){return String(x.st)===st})||null;
  }
  function ownCurrentStore(d){
    var st=String(U&&U.u&&U.u.st||'');
    return currentStores(d).find(function(x){return String(x.st)===st})||null;
  }
  function priorityForStore(d,st){return (d&&d.prioritized||[]).find(function(x){return String(x.st)===String(st)})||null}

  function perfSnapshotV130(d){
    var isCurrent=PERF_PERIOD_V130==='current'&&d&&d.showPartial&&d.currentPartial;
    var reg=isCurrent?(d.currentPartial.regional||{}):(d.summary||{});
    var closed=closedStores(d),closedMap={};closed.forEach(function(x){closedMap[String(x.st)]=x});
    var stores=isCurrent?currentStores(d).map(function(x){return Object.assign({},closedMap[String(x.st)]||{},x)}):closed;
    var periodLabel=isCurrent?'Semana '+(d.currentWeekNumber||'—')+' • parcial':'Semana '+(d.weekNumber||'—')+' • fechada';
    var compareLabel=isCurrent?'vs Semana '+(d.weekNumber||'—'):'vs Semana '+(d.previousWeekNumber||'—');
    var delta=isCurrent?pnum(d.currentPartial.share_delta):pnum(d.summary&&d.summary.share_delta);
    var prevShare=isCurrent?pnum(d.summary&&d.summary.share):pnum(reg.share)-delta;
    var capChange=isCurrent?null:(d.summary&&d.summary.captured_change);
    var ordChange=isCurrent?null:(d.summary&&d.summary.orders_change);
    var ticketChange=isCurrent?(d.summary&&d.summary.ticket?pnum(reg.ticket)/pnum(d.summary.ticket)-1:null):(d.summary&&d.summary.ticket_change);
    var snap={
      isCurrent:isCurrent,periodLabel:periodLabel,compareLabel:compareLabel,stores:stores,
      share:pnum(reg.share),previousShare:prevShare,shareDelta:delta,
      captured:pnum(reg.captured),orders:pnum(reg.orders),ticket:pnum(reg.ticket),
      capturedChange:capChange,ordersChange:ordChange,ticketChange:ticketChange,
      previousCaptured:phas(reg.previous_captured)?pnum(reg.previous_captured):phas(d.summary&&d.summary.previous_captured)?pnum(d.summary.previous_captured):pprevFromChangeV131(reg.captured,capChange),
      previousOrders:phas(reg.previous_orders)?pnum(reg.previous_orders):phas(d.summary&&d.summary.previous_orders)?pnum(d.summary.previous_orders):pprevFromChangeV131(reg.orders,ordChange),
      previousTicket:phas(reg.previous_ticket)?pnum(reg.previous_ticket):phas(d.summary&&d.summary.previous_ticket)?pnum(d.summary.previous_ticket):pprevFromChangeV131(reg.ticket,ticketChange),
      dispersion:pnum((reg&&reg.dispersion)!=null?reg.dispersion:(d.performance&&d.performance.regional_dispersion)),
      active:stores.filter(function(x){return pnum(x.captured)>0}).length,
      activeBase:stores.length||closed.length,
      scope:'regional',
      store:null,
      partialFallback:false
    };
    if(PERF_SCOPE_V130==='operation'){
      var cur=isCurrent?ownCurrentStore(d):null;
      var closedStore=ownClosedStore(d);
      var x=cur||closedStore;
      if(x){
        snap.scope='operation';snap.store=x;
        snap.partialFallback=!!(isCurrent&&!cur);
        snap.share=pnum(x.share);
        snap.shareDelta=pnum(x.share_delta);
        snap.previousShare=phas(x.previous_share)?pnum(x.previous_share):snap.share-snap.shareDelta;
        snap.captured=pnum(x.captured);snap.orders=pnum(x.orders);snap.ticket=pnum(x.ticket);
        snap.capturedChange=phas(x.captured_change)?pnum(x.captured_change):null;
        snap.ordersChange=phas(x.orders_change)?pnum(x.orders_change):null;
        snap.ticketChange=phas(x.ticket_change)?pnum(x.ticket_change):null;
        snap.previousCaptured=phas(x.previous_captured)?pnum(x.previous_captured):pprevFromChangeV131(snap.captured,snap.capturedChange);
        snap.previousOrders=phas(x.previous_orders)?pnum(x.previous_orders):pprevFromChangeV131(snap.orders,snap.ordersChange);
        snap.previousTicket=phas(x.previous_ticket)?pnum(x.previous_ticket):pprevFromChangeV131(snap.ticket,snap.ticketChange);
        snap.dispersion=phas(x.dispersion)?pnum(x.dispersion):pnum(closedStore&&closedStore.dispersion);
        snap.zeroOver3=pnum(x.zero_over3||closedStore&&closedStore.zero_over3);
        snap.priority=priorityForStore(d,x.st);
        snap.participation=phas(x.participation)?pnum(x.participation):pnum(closedStore&&closedStore.participation);
        if(snap.partialFallback){
          snap.periodLabel='Semana '+(d.weekNumber||'—')+' • último fechamento da filial';
          snap.compareLabel='parcial atual sem recorte individual disponível';
        }
      }
    }
    return snap;
  }

  function focusMetricV130(x){
    if(PERF_FOCUS_V130==='captured')return pnum(x.captured);
    if(PERF_FOCUS_V130==='orders')return pnum(x.orders);
    if(PERF_FOCUS_V130==='ticket')return pnum(x.ticket);
    if(PERF_FOCUS_V130==='dispersion')return pnum(x.dispersion);
    return pnum(x.share);
  }
  function focusValueV130(x){
    if(PERF_FOCUS_V130==='captured')return pmoney(x.captured);
    if(PERF_FOCUS_V130==='orders')return (typeof num==='function'?num(x.orders):Math.round(pnum(x.orders)).toLocaleString('pt-BR'));
    if(PERF_FOCUS_V130==='ticket')return pmoney(x.ticket);
    if(PERF_FOCUS_V130==='dispersion')return ppct(x.dispersion,1);
    return ppct(x.share,2);
  }
  function rankStoresV130(stores,best){
    var a=(stores||[]).filter(function(x){
      if(!x||!x.st)return false;
      if(PERF_FOCUS_V130==='captured')return phas(x.captured);
      if(PERF_FOCUS_V130==='orders')return phas(x.orders);
      if(PERF_FOCUS_V130==='ticket')return phas(x.ticket);
      if(PERF_FOCUS_V130==='dispersion')return phas(x.dispersion);
      return phas(x.share);
    });
    a.sort(function(a,b){
      var av=focusMetricV130(a),bv=focusMetricV130(b);
      if(PERF_FOCUS_V130==='dispersion')return best?av-bv:bv-av;
      return best?bv-av:av-bv;
    });
    return a.slice(0,5);
  }

  function diagnosticV130(d,s){
    var trend=pdeltaWord(s.shareDelta),focus=PERF_FOCUS_LABELS_V130[PERF_FOCUS_V130]||'Share eStore';
    if(s.scope==='operation'&&s.store){
      var x=s.store,p=s.priority,txt='A filial '+String(x.st)+' fechou o recorte analisado com Share de '+ppct(s.share,2)+', '+trend+' de '+ppp(s.shareDelta)+'. ';
      txt+='A entrega foi de '+pmoney(s.captured)+' em venda captada, '+Math.round(s.orders).toLocaleString('pt-BR')+' pedidos e ticket médio de '+pmoney(s.ticket)+'. ';
      if(p)txt+='A loja está entre as lojas Priorizadas na FCA, na '+String(p.priority_rank||'—')+'ª posição de retração. ';
      else txt+='A loja não aparece entre as cinco prioridades oficiais de retração do último fechamento. ';
      if(x.fca&&x.fca.root_cause)txt+='Causa raiz registrada: '+pshort(x.fca.root_cause,220)+'.';
      else txt+='Os sinais operacionais abaixo devem ser validados com a leitura de campo antes de serem tratados como causa raiz.';
      return {text:txt,status:s.shareDelta>0?'good':s.shareDelta<0?'bad':'neutral',label:s.shareDelta>0?'Operação em evolução':s.shareDelta<0?'Operação em atenção':'Operação estável',focus:focus};
    }
    var stores=s.stores||[],growth=[].concat(d&&d.growth||[]).sort(function(a,b){return pnum(b.share_delta)-pnum(a.share_delta)}),pri=d&&d.prioritized||[];
    var pos=growth[0],neg=pri[0]||[...stores].sort(function(a,b){return pnum(a.share_delta)-pnum(b.share_delta)})[0];
    var text='A Regional CE+PI apresenta '+trend+' de Share no período, com '+ppct(s.share,2)+' e variação de '+ppp(s.shareDelta)+' '+s.compareLabel+'. ';
    text+='Foram captados '+pmoney(s.captured)+' em '+Math.round(s.orders).toLocaleString('pt-BR')+' pedidos, com ticket médio de '+pmoney(s.ticket)+'. ';
    if(pos)text+='A maior evolução identificada foi a filial '+String(pos.st)+' ('+ppp(pos.share_delta)+'). ';
    if(neg&&pnum(neg.share_delta)<0)text+='A principal pressão negativa foi a filial '+String(neg.st)+' ('+ppp(neg.share_delta)+'), considerada na priorização quando aplicável. ';
    var rc=d&&d.regionalContext||d&&d.executive&&d.executive.regional_context;
    if(rc&&rc.active)text+='Há um evento regional pontual registrado: '+pshort(rc.event_label||'evento externo',120)+' em '+pdate(rc.event_date)+', classificado como não recorrente. ';
    text+='A leitura de '+focus+' está cruzada com dispersão, frequência de zeragem, ticket e causas registradas; correlação não é tratada automaticamente como causa raiz.';
    return {text:text,status:s.shareDelta>0?'good':s.shareDelta<0?'bad':'neutral',label:s.shareDelta>0?'Performance em evolução':s.shareDelta<0?'Performance em atenção':'Performance estável',focus:focus};
  }

  function mapFactorLabelV130(key){
    var all=[].concat(typeof FCA_EXTERNAL_V61!=='undefined'?FCA_EXTERNAL_V61:[],typeof FCA_OPERATIONAL_V61!=='undefined'?FCA_OPERATIONAL_V61:[]);
    var f=all.find(function(x){return x[0]===key});
    return f?f[1]:(PERF_VOICE_LABELS_V130[key]||key||'Outro fator');
  }

  function causesV130(d,s){
    var out=[];
    if(s.scope==='operation'&&s.store){
      var f=s.store.fca||s.priority&&s.priority.fca||{};
      (f.external_factors||[]).forEach(function(k){out.push({label:mapFactorLabelV130(k),source:'FCA',cls:'fca'})});
      (f.operational_factors||[]).forEach(function(k){out.push({label:mapFactorLabelV130(k),source:'FCA',cls:'fca'})});
      if(pnum(s.dispersion)>=.35)out.push({label:'Dispersão elevada na operação',source:'Indicador',cls:'kpi'});
      if(pnum(s.zeroOver3)>0)out.push({label:String(s.zeroOver3)+' colaborador(es) com +3 dias zerados',source:'Indicador',cls:'kpi'});
      if(phas(s.ticketChange)&&pnum(s.ticketChange)<0)out.push({label:'Ticket médio em retração',source:'Indicador',cls:'kpi'});
    }else{
      var e=d&&d.executive||{},voice=d&&d.performance&&d.performance.voice||{},rc=d&&d.regionalContext||e.regional_context;
      if(rc&&rc.active)out.push({label:rc.event_label||'Evento externo regional',source:'Contexto Regional',cls:'fca'});
      (e.external||[]).slice(0,3).forEach(function(x){out.push({label:x.label||mapFactorLabelV130(x.key),source:'FCA',cls:'fca',pct:x.pct})});
      (e.operational||[]).slice(0,3).forEach(function(x){out.push({label:x.label||mapFactorLabelV130(x.key),source:'FCA',cls:'fca',pct:x.pct})});
      (voice.causes||[]).slice(0,3).forEach(function(x){out.push({label:PERF_VOICE_LABELS_V130[x.key]||x.label||x.key,source:'Ouça seu time',cls:'voice',pct:x.pct})});
      if(pnum(d&&d.performance&&d.performance.regional_dispersion)>=.35)out.push({label:'Dispersão regional em nível de atenção',source:'Indicador',cls:'kpi'});
      if(pnum(d&&d.performance&&d.performance.critical_zero_collaborators)>0)out.push({label:String(d.performance.critical_zero_collaborators)+' colaborador(es) com frequência crítica de zeragem',source:'Indicador',cls:'kpi'});
      if(phas(d&&d.summary&&d.summary.ticket_change)&&pnum(d.summary.ticket_change)<0)out.push({label:'Ticket médio regional em retração',source:'Indicador',cls:'kpi'});
    }
    var seen={};
    return out.filter(function(x){var k=String(x.label).toLowerCase();if(seen[k])return false;seen[k]=1;return true}).slice(0,7);
  }

  function evidenceV130(d,s){
    var out=[];
    out.push({title:'Share no período',detail:ppct(s.share,2)+' • '+ppp(s.shareDelta)+' '+s.compareLabel});
    out.push({title:'Venda e pedidos',detail:pmoney(s.captured)+' • '+Math.round(s.orders).toLocaleString('pt-BR')+' pedidos • Ticket '+pmoney(s.ticket)});
    if(s.scope==='operation'&&s.store){
      out.push({title:'Dispersão da filial',detail:ppct(s.dispersion,1)+(s.zeroOver3?' • '+s.zeroOver3+' com +3 dias zerados':'')});
      var f=s.store.fca||s.priority&&s.priority.fca||{};
      if(f.system_ticket)out.push({title:'Evidência sistêmica',detail:'Chamado / protocolo '+f.system_ticket});
      if(Array.isArray(f.evidences)&&f.evidences.length)out.push({title:'Anexos da FCA',detail:f.evidences.length+' evidência(s) registrada(s)'});
      if(f.system_description)out.push({title:'Relato sistêmico',detail:pshort(f.system_description,130)});
    }else{
      var p=d&&d.performance||{},rc=d&&d.regionalContext||d&&d.executive&&d.executive.regional_context;
      if(rc&&rc.active)out.push({title:'Evento regional pontual',detail:pshort((rc.event_label||'Evento externo')+' • '+pdate(rc.event_date)+' • impacto potencial '+pmoney(rc.estimated_impact||0),150)});
      out.push({title:'Dispersão regional',detail:ppct(p.regional_dispersion||0,1)});
      out.push({title:'Frequência crítica',detail:Math.round(p.critical_zero_collaborators||0)+' colaborador(es) com +3 dias zerados'});
      if(d&&d.summary&&d.summary.fca_submitted!=null)out.push({title:'Tratativas FCA',detail:Math.round(pnum(d.summary.fca_submitted))+' concluída(s) de '+Math.round(pnum(d.summary.prioritized))+' priorizada(s)'});
    }
    return out.slice(0,6);
  }

  function actionsV130(d,s,causes){
    var a=[];
    function add(t){if(t&&!a.includes(t))a.push(t)}
    var labels=(causes||[]).map(function(x){return String(x.label||'').toLowerCase()}).join(' ');
    if(pnum(s.dispersion)>=.35)add('Reduzir dispersão com meta individual, rotina de abertura/meio/fechamento e atuação sobre os zerados.');
    if(pnum(s.zeroOver3||d&&d.performance&&d.performance.critical_zero_collaborators)>0)add('Acompanhar diariamente colaboradores com +3 dias sem captação e pactuar recuperação de frequência.');
    if(phas(s.ticketChange)&&pnum(s.ticketChange)<0)add('Proteger ticket médio com reforço de abordagem, mix e acompanhamento de pedidos por oportunidade.');
    if(/instabilidade|sist[eê]mica|pagamento|cupom/.test(labels))add('Consolidar horários, evidências e chamados dos impactos sistêmicos e escalar a recorrência com o time responsável.');
    if(/abordagem/.test(labels))add('Reforçar script de abordagem eStore, objeções e benefícios com prática rápida no início do turno.');
    if(/distribui[cç][aã]o de meta|meta individual/.test(labels))add('Revisar distribuição da meta por HC e garantir acompanhamento individual da execução.');
    var rc=d&&d.regionalContext||d&&d.executive&&d.executive.regional_context;
    if(s.scope==='regional'&&rc&&rc.active&&rc.action_plan)add(pshort(rc.action_plan,280));
    if(s.scope==='operation'&&s.priority)add('Concluir a FCA oficial da filial com causa raiz validada, responsável, prazo e resultado esperado.');
    if(s.scope==='regional'&&(d&&d.prioritized||[]).length)add('Fazer checkpoint das lojas Priorizadas e acompanhar a reação do Share na parcial da semana seguinte.');
    if(!a.length)add('Manter acompanhamento do Share, pedidos, ticket e dispersão, preservando as práticas que sustentaram a evolução.');
    if(a.length<3)add('Compartilhar os destaques positivos e replicar as práticas das lojas com melhor evolução no período.');
    return a.slice(0,7);
  }

  function draftKeyV130(d,s){
    var base=String(d&&d.weekStart||d&&d.weekNumber||'periodo');
    return 'estore_perf_v130|'+base+'|'+PERF_PERIOD_V130+'|'+PERF_SCOPE_V130+'|'+(s.scope==='operation'?String(U&&U.u&&U.u.st||''):'CEPI');
  }
  function loadDraftV130(d,s,actions){
    var key=draftKeyV130(d,s),o=null;
    try{o=JSON.parse(localStorage.getItem(key)||'null')}catch(e){}
    if(!o||typeof o!=='object')o={note:'',manualActions:[],selectedActions:actions.slice(0,3),initialized:true};
    if(!Array.isArray(o.manualActions))o.manualActions=[];
    if(!Array.isArray(o.selectedActions))o.selectedActions=actions.slice(0,3);
    o._key=key;return o;
  }
  function saveDraftObjV130(){
    if(!PERF_DRAFT_V130||!PERF_DRAFT_V130._key)return;
    var copy={note:PERF_DRAFT_V130.note||'',manualActions:PERF_DRAFT_V130.manualActions||[],selectedActions:PERF_DRAFT_V130.selectedActions||[],initialized:true};
    try{localStorage.setItem(PERF_DRAFT_V130._key,JSON.stringify(copy))}catch(e){}
  }
  function syncNoteV130(){
    var el=document.getElementById('performanceReadV130');
    if(el&&PERF_DRAFT_V130){PERF_DRAFT_V130.note=String(el.value||'').slice(0,1200);saveDraftObjV130()}
  }

  function kpiHtmlV130(d,s){
    var shareClass=ptrend(s.shareDelta),capt=s.capturedChange,ord=s.ordersChange,ticket=s.ticketChange;
    var sixth=s.scope==='operation'?
      '<div class=performanceKpiV130><span>Frequência crítica</span><b>'+Math.round(pnum(s.zeroOver3))+'</b><small>colaborador(es) com +3 dias zerados</small></div>':
      '<div class=performanceKpiV130><span>Lojas com venda</span><b>'+Math.round(s.active)+' / '+Math.round(s.activeBase||closedStores(d).length)+'</b><small class="'+((s.active-(s.activeBase||closedStores(d).length))<0?'down':'up')+'">gap '+psignedIntV131(s.active-(s.activeBase||closedStores(d).length),'loja'+(Math.abs(s.active-(s.activeBase||closedStores(d).length))===1?'':'s'))+' para cobertura total</small></div>';
    return '<div class=performanceKpisV130>'+
      '<div class=performanceKpiV130><span>Share eStore</span><b>'+ppct(s.share,2)+'</b><small class='+shareClass+'>'+metricDeviationTextV131(s,'share')+' • '+pesc(s.compareLabel)+'</small></div>'+
      '<div class=performanceKpiV130><span>Venda captada</span><b>'+pmoney(s.captured)+'</b><small class="'+ptrend(capt)+'">'+pesc(metricDeviationTextV131(s,'captured'))+'</small></div>'+
      '<div class=performanceKpiV130><span>Pedidos</span><b>'+Math.round(s.orders).toLocaleString('pt-BR')+'</b><small class="'+ptrend(ord)+'">'+pesc(metricDeviationTextV131(s,'orders'))+'</small></div>'+
      '<div class=performanceKpiV130><span>Ticket médio</span><b>'+pmoney(s.ticket)+'</b><small class="'+ptrend(ticket)+'">'+pesc(metricDeviationTextV131(s,'ticket'))+'</small></div>'+
      '<div class=performanceKpiV130><span>Dispersão</span><b>'+ppct(s.dispersion,1)+'</b><small>'+(s.scope==='operation'?'Filial '+pesc(s.store&&s.store.st):'Regional CE+PI')+'</small></div>'+
      sixth+
    '</div>';
  }

  function filtersHtmlV130(d){
    var current=d&&d.showPartial&&d.currentPartial;
    return '<div class=performanceFiltersV130>'+
      '<div class=performanceScopeV130><button class="'+(PERF_SCOPE_V130==='regional'?'on':'')+'" onclick="performanceSetScopeV130(\'regional\')">Regional CE+PI</button><button class="'+(PERF_SCOPE_V130==='operation'?'on':'')+'" onclick="performanceSetScopeV130(\'operation\')">Minha Operação</button></div>'+
      '<div class=performanceFilterV130><label>Período</label><select onchange="performanceSetPeriodV130(this.value)"><option value=closed '+(PERF_PERIOD_V130==='closed'?'selected':'')+'>Semana '+pesc(d.weekNumber||'—')+' • fechada</option>'+(current?'<option value=current '+(PERF_PERIOD_V130==='current'?'selected':'')+'>Semana '+pesc(d.currentWeekNumber||'—')+' • parcial</option>':'')+'</select><small>Comparativo semanal certificado</small></div>'+
      '<div class=performanceFilterV130><label>Comparar com</label><select disabled><option>'+(PERF_PERIOD_V130==='current'?'Última semana fechada':'Semana anterior')+'</option></select><small>Base de comparação do App</small></div>'+
      '<div class=performanceFilterV130><label>Indicador principal</label><select onchange="performanceSetFocusV130(this.value)">'+Object.keys(PERF_FOCUS_LABELS_V130).map(function(k){return '<option value="'+k+'" '+(PERF_FOCUS_V130===k?'selected':'')+'>'+PERF_FOCUS_LABELS_V130[k]+'</option>'}).join('')+'</select><small>Não altera a priorização oficial FCA</small></div>'+
    '</div>';
  }

  function shareCompareHtmlV130(d,s){
    return '<section class=performancePanelV130><div class=performancePanelHeadV130><div><h3>Evolução do Share eStore</h3><p>Comparação direta do período selecionado.</p></div></div>'+
      '<div class=performanceShareCompareV130>'+
        '<div class=performanceSharePointV130><span>'+pesc(s.compareLabel.replace(/^vs\s*/i,''))+'</span><b>'+ppct(s.previousShare,2)+'</b><small>Referência</small></div>'+
        '<div class=performanceShareArrowV130></div>'+
        '<div class=performanceSharePointV130><span>'+pesc(s.periodLabel)+'</span><b>'+ppct(s.share,2)+'</b><small>Resultado entregue</small></div>'+
      '</div><span class="performanceDeltaBadgeV130 '+ptrend(s.shareDelta)+'">'+ppp(s.shareDelta)+' '+pdeltaWord(s.shareDelta)+'</span></section>';
  }

  function diagnosisHtmlV130(d,s){
    var diag=diagnosticV130(d,s);
    return '<section class="performancePanelV130 performanceDiagnosisV130"><div class=performancePanelHeadV130><div><h3>Leitura de Performance</h3><p>Leitura dos dados disponíveis, sem presumir causa raiz.</p></div></div><span class="status '+diag.status+'">'+pesc(diag.label)+'</span><p class=diagnosisText>'+pesc(diag.text)+'</p><div class=diagnosisFoot>Indicador em foco: <b>'+pesc(diag.focus)+'</b>. Causas só são tratadas como validadas quando registradas na FCA ou na leitura operacional.</div></section>';
  }

  function contributionHtmlV130(d,s,top){
    var pri=d&&d.prioritized||[],total=pnum((d.summary||{}).captured)||pnum(s.captured);
    var topCap=(top||[]).reduce(function(a,x){return a+pnum(x.captured)},0);
    var priCap=pri.reduce(function(a,x){return a+pnum(x.captured)},0);
    var own=s.scope==='operation'?pnum(s.participation):null;
    function line(label,val,amount,cls){
      var q=Math.max(0,Math.min(1,pnum(val)));
      return '<div class="performanceContributionLineV130 '+(cls||'')+'"><label>'+pesc(label)+'</label><b>'+ppct(q,1)+'</b><div class=performanceContributionBarV130><i style="width:'+Math.round(q*100)+'%"></i></div><small>'+pesc(amount||'')+'</small></div>';
    }
    var body=s.scope==='operation'&&s.store?
      line('Participação da filial no resultado regional',own,pmoney(s.captured),'')+
      line('Lojas Priorizadas no volume regional',total?priCap/total:0,pmoney(priCap),'priority'):
      line('Top 5 lojas no volume regional',total?topCap/total:0,pmoney(topCap),'')+
      line('Lojas Priorizadas no volume regional',total?priCap/total:0,pmoney(priCap),'priority');
    return '<section class=performancePanelV130><div class=performancePanelHeadV130><div><h3>Contribuição para o Resultado</h3><p>Representatividade financeira no consolidado.</p></div></div><div class=performanceContributionV130>'+body+'</div></section>';
  }

  function rankRowV130(x,i,priority){
    var delta=pnum(x.share_delta),sub='Share '+ppct(x.share,2)+' • '+pmoney(x.captured)+' • '+Math.round(pnum(x.orders))+' ped. • Ticket '+pmoney(x.ticket);
    return '<div class=performanceRankRowV130><span class=performanceRankNoV130>'+(i+1)+'</span><span class=main><b>'+pesc(pstoreName(x))+'</b><small>'+pesc(sub)+'</small></span><span class=value>'+(priority?'<span class=performancePriorityPillV130>'+(i<2?'ALTO':'MÉDIO')+'</span>':'<b>'+pesc(focusValueV130(x))+'</b>')+'<small class="'+ptrend(delta)+'">'+ppp(delta)+'</small></span></div>';
  }
  function priorityReasonV130(x){
    var f=x&&x.fca||{};
    if(f.root_cause)return pshort(f.root_cause,70);
    if(pnum(x&&x.dispersion)>=.5)return 'Dispersão elevada';
    if(pnum(x&&x.zero_over3)>=3)return 'Frequência de zeragem';
    if(phas(x&&x.ticket_change)&&pnum(x.ticket_change)<0)return 'Ticket em retração';
    return 'Retração de Share';
  }
  function priorityRowV130(x,i){
    return '<div class=performanceRankRowV130><span class=performanceRankNoV130>'+pesc(x.priority_rank||i+1)+'</span><span class=main><b>'+pesc(pstoreName(x))+'</b><small>'+pesc(priorityReasonV130(x))+'</small></span><span class=value><span class=performancePriorityPillV130>'+(i<2?'ALTO':'MÉDIO')+'</span><small class=down>'+ppp(x.share_delta)+'</small></span></div>';
  }
  function ranksHtmlV130(d,s,top,bottom){
    var pri=d&&d.prioritized||[];
    return '<div class=performanceRankGridV130>'+
      '<section class="performancePanelV130 performanceRankPanelV130"><div class="performanceRankHeaderV130 top"><div><h3>Top 5 Performance</h3><small>'+pesc(PERF_FOCUS_LABELS_V130[PERF_FOCUS_V130])+' • resultado entregue</small></div></div><div class=performanceRankTableV130>'+(top.length?top.map(function(x,i){return rankRowV130(x,i,false)}).join(''):'<div class=performanceEmptyV130>Sem dados suficientes.</div>')+'</div></section>'+
      '<section class="performancePanelV130 performanceRankPanelV130"><div class="performanceRankHeaderV130 bottom"><div><h3>Bottom 5 Performance</h3><small>'+pesc(PERF_FOCUS_LABELS_V130[PERF_FOCUS_V130])+' • menor desempenho</small></div></div><div class=performanceRankTableV130>'+(bottom.length?bottom.map(function(x,i){return rankRowV130(x,i,false)}).join(''):'<div class=performanceEmptyV130>Sem dados suficientes.</div>')+'</div></section>'+
      '<section class="performancePanelV130 performanceRankPanelV130"><div class="performanceRankHeaderV130 priority"><div><h3>Lojas Priorizadas FCA</h3><small>Priorizadas por retração de Share</small></div></div><div class=performanceRankTableV130>'+(pri.length?pri.slice(0,5).map(priorityRowV130).join(''):'<div class=performanceEmptyV130>Nenhuma prioridade validada neste ciclo.</div>')+'</div></section>'+
    '</div>';
  }

  function analysisHtmlV130(d,s,causes,evidences,actions){
    var causeRows=causes.length?causes.map(function(x){var detail=x.pct!=null?Math.round(pnum(x.pct)*100)+'% dos registros/consolidação':'Sinal disponível no período';return '<div class=performanceCauseRowV130><span><b>'+pesc(x.label)+'</b><small>'+pesc(detail)+'</small></span><span class="performanceSourceV130 '+x.cls+'">'+pesc(x.source)+'</span></div>'}).join(''):'<div class=performanceEmptyV130>Ainda não há causas validadas neste recorte.</div>';
    var evRows=evidences.map(function(x){return '<div class=performanceEvidenceV130><b>'+pesc(x.title)+'</b><small>'+pesc(x.detail)+'</small></div>'}).join('');
    var actRows=actions.map(function(x,i){var checked=PERF_DRAFT_V130.selectedActions.includes(x);return '<label class=performanceActionV130><input type=checkbox '+(checked?'checked':'')+' onchange="performanceToggleActionV130('+i+',this.checked)"><span>'+pesc(x)+'</span></label>'}).join('');
    return '<div class=performanceAnalysisGridV130>'+
      '<section class=performancePanelV130><div class=performancePanelHeadV130><div><h3>Principais Causas Identificadas</h3><p>Origem sempre identificada: FCA, escuta ou sinal de KPI.</p></div></div><div class=performanceCauseListV130>'+causeRows+'</div></section>'+
      '<section class=performancePanelV130><div class=performancePanelHeadV130><div><h3>Evidências dos Dados</h3><p>Fatos que sustentam a leitura do período.</p></div></div><div class=performanceEvidenceListV130>'+evRows+'</div><div class=performanceOfficialV130><button class=secondary onclick="go(\'listen\')">Ouça seu time</button></div></section>'+
      '<section class=performancePanelV130><div class=performancePanelHeadV130><div><h3>Sugestões de Ações</h3><p>Selecione o que deve entrar na FCA executiva.</p></div></div><div class=performanceActionsV130>'+actRows+'</div><div class=performanceActionAddV130><input id=performanceManualActionV130 maxlength=180 placeholder="Adicionar consideração / ação"><button onclick="performanceAddActionV130()">Adicionar</button></div></section>'+
    '</div>';
  }

  function planHtmlV130(d,s){
    var selected=(PERF_DRAFT_V130.selectedActions||[]).concat(PERF_DRAFT_V130.manualActions||[]).slice(0,6);
    var owner=s.scope==='operation'?'Supervisor da filial':'Speak eStore Regional',deadline=d&&d.deadline?pdate(d.deadline):'Próximo checkpoint';
    var rows=selected.map(function(x,i){return '<tr><td>'+(i+1)+'</td><td>'+pesc(x)+'</td><td>'+pesc(owner)+'</td><td>'+pesc(deadline)+'</td><td><span class=performancePlanStatusV130>Acompanhar</span></td></tr>'}).join('');
    return '<div class=performanceWorkbenchV130>'+
      '<section class="performancePanelV130 performanceReadV130"><div class=performancePanelHeadV130><div><h3>Complemento do Resumo da Semana</h3><p>Inclua sua leitura, contexto da operação e informações que precisam aparecer no resumo final.</p></div></div><textarea id=performanceReadV130 maxlength=1200 oninput="performanceDraftInputV130(this)" placeholder="Ex.: cenário da semana, contexto da operação, causas confirmadas, decisões tomadas, pontos que precisam ser reforçados na tratativa...">'+pesc(PERF_DRAFT_V130.note||'')+'</textarea><div class=hint><span>Este complemento entra no resumo e no card compartilhável.</span><span id=performanceReadCountV130>'+String((PERF_DRAFT_V130.note||'').length)+'/1200</span></div></section>'+
      '<section class=performancePanelV130><div class=performancePanelHeadV130><div><h3>Plano de Ação do Período</h3><p>Ações selecionadas para acompanhar a reversão ou sustentação.</p></div></div><div class=performancePlanV130><table class=performancePlanTableV130><thead><tr><th>#</th><th>Ação</th><th>Responsável</th><th>Prazo</th><th>Status</th></tr></thead><tbody>'+(rows||'<tr><td colspan=5>Selecione ao menos uma ação sugerida.</td></tr>')+'</tbody></table></div><div class=performanceOfficialV130><button class=primary onclick="go(\'fca\')">Abrir FCA oficial</button><button class=secondary onclick="performanceRefreshV130()">Atualizar dados</button></div></section>'+
    '</div>';
  }

  function executiveSummaryV131(d,s,top,pri,causes){
    var best=(top||[])[0],attention=(pri||[])[0],capGap=metricGapV131(s,'captured'),ordGap=metricGapV131(s,'orders'),ticketGap=metricGapV131(s,'ticket');
    var headline=s.shareDelta>0?'Semana com evolução de Share':s.shareDelta<0?'Semana com retração de Share':'Semana com Share estável';
    var result='Encerramos o período com Share de '+ppct(s.share,2)+', '+(s.shareDelta>0?'evolução de ':s.shareDelta<0?'retração de ':'variação de ')+ppp(s.shareDelta)+' '+s.compareLabel+'. A venda captada foi de '+pmoney(s.captured)+(s.capturedChange!=null?', '+pchange(s.capturedChange)+' com gap de '+psignedMoneyV131(capGap):'')+', em '+Math.round(s.orders).toLocaleString('pt-BR')+' pedidos'+(s.ordersChange!=null?', '+pchange(s.ordersChange)+' com gap de '+psignedIntV131(ordGap,'pedidos'):'')+', e ticket médio de '+pmoney(s.ticket)+(s.ticketChange!=null?', '+pchange(s.ticketChange)+' com gap de '+psignedMoneyV131(ticketGap):'')+'.';
    var positive=best?'Entre os destaques, a filial '+String(best.st)+' apresentou '+PERF_FOCUS_LABELS_V130[PERF_FOCUS_V130].toLowerCase()+' de '+focusValueV130(best)+(phas(best.share_delta)?' e variação de Share de '+ppp(best.share_delta):'')+'.':'Sem destaque consolidado para este recorte.';
    var risk=attention?'Como principal ponto de atenção, a filial '+String(attention.st)+' aparece entre as prioridades do período, com variação de Share de '+ppp(attention.share_delta)+'.':'Neste ciclo não há loja Priorizada no recorte disponível.';
    var direction=s.scope==='operation'?'O foco da tratativa será sustentar o que evoluiu e atuar sobre frequência de captação, dispersão e ações já definidas para a operação.':'O foco da tratativa será atuar nas lojas Priorizadas, preservar a evolução das melhores entregas e acompanhar a reação do Share na próxima parcial.';
    return {headline:headline,result:result,positive:positive,risk:risk,direction:direction};
  }

  function weekSummaryTextV132(d,s,top,pri,causes){
    var e=executiveSummaryV131(d,s,top,pri,causes);
    var complement=PERF_DRAFT_V130&&String(PERF_DRAFT_V130.note||'').trim();
    var parts=[e.result,e.positive,e.risk,e.direction];
    if(complement)parts.push(complement);
    return parts.join(' ');
  }

  function treatmentCaptionV131(d,s,top,pri,causes){
    var scope=s.scope==='operation'?'OPERAÇÃO '+String(s.store&&s.store.st||''):'REGIONAL CE+PI';
    var selected=(PERF_DRAFT_V130&&PERF_DRAFT_V130.selectedActions||[]).concat(PERF_DRAFT_V130&&PERF_DRAFT_V130.manualActions||[]).slice(0,3);
    var summary=weekSummaryTextV132(d,s,top,pri,causes);
    var lines=[
      '📊 *FCA PERFORMANCE eStore | '+scope+'*',
      '*'+s.periodLabel+'* • '+s.compareLabel,
      '',
      '📝 *Resumo da semana*',
      summary
    ];
    if(selected.length){
      lines.push('', '🎯 *Ações prioritárias*');
      selected.forEach(function(a,i){lines.push((i+1)+'. '+a)});
    }
    return lines.join('\n');
  }

  function execPreviewHtmlV130(d,s,top,pri,causes){
    var e=executiveSummaryV131(d,s,top,pri,causes);
    var summary=weekSummaryTextV132(d,s,top,pri,causes);
    return '<section class=performanceExecutiveV130>'+
      '<div class=performanceExecutiveTopV130><img class=brand src="'+PERF_LOGO_V131+'" alt="Riachuelo"><span><b>FCA PERFORMANCE</b><small>'+(s.scope==='operation'?'FILIAL '+pesc(s.store&&s.store.st):'REGIONAL CE+PI')+' • '+pesc(s.periodLabel)+'</small></span></div>'+
      '<div class=performanceExecutiveSummaryV131>'+
        '<div class=performanceExecEyebrowV131>RESUMO DA SEMANA</div>'+
        '<h3>'+pesc(e.headline)+'</h3>'+
        '<p>'+pesc(summary)+'</p>'+
        '<div class=performanceExecLegendActionsV131><button onclick="document.getElementById(\'performanceReadV130\')?.scrollIntoView({behavior:\'smooth\',block:\'center\'})">Complementar resumo</button><button onclick="copyPerformanceSummaryV131()">Copiar legenda da tratativa</button><button class=primary onclick="sharePerformanceSummaryV131()">Compartilhar resumo</button></div>'+
      '</div>'+
      '<div class=performanceExecutivePreviewV130>'+
        '<section><h4>Resultado</h4><div class=performanceExecutiveMiniKpisV130><div><span>Share</span><b>'+ppct(s.share,2)+'</b></div><div><span>Δ Share</span><b>'+ppp(s.shareDelta)+'</b></div><div><span>Captado</span><b>'+pmoney(s.captured)+'</b><small>'+pesc(metricDeviationTextV131(s,'captured'))+'</small></div><div><span>Pedidos</span><b>'+Math.round(s.orders).toLocaleString('pt-BR')+'</b><small>'+pesc(metricDeviationTextV131(s,'orders'))+'</small></div></div></section>'+
        '<section><h4>'+(s.scope==='operation'?'Referência Regional':'Top / Priorizadas')+'</h4><p>'+((top||[]).slice(0,2).map(function(x){return pesc(x.st+' • '+ppct(x.share,2)+' • '+ppp(x.share_delta))}).join('<br>')||'Sem dados')+'<br>'+(pri&&pri[0]?'Priorizada: '+pesc(pri[0].st)+' • '+ppp(pri[0].share_delta):'')+'</p></section>'+
        '<section><h4>Resumo da Semana</h4><p>'+pesc(pshort(summary,520))+'</p></section>'+
      '</div>'+
      '<div class=performanceShareActionsV130><button class=preview onclick="previewPerformanceCardV130()">Visualizar prévia em alta resolução</button><button class=share onclick="sharePerformanceCardV130()">Gerar card para compartilhar</button></div>'+
    '</section>';
  }

  function renderPerformanceV130(){
    var root=document.getElementById('performanceRootV130');if(!root||!PERF_FCA_V130)return;
    syncNoteV130();
    var d=PERF_FCA_V130,s=perfSnapshotV130(d);
    var stores=s.stores&&s.stores.length?s.stores:closedStores(d);
    var top=rankStoresV130(stores,true),bottom=rankStoresV130(stores,false);
    var causes=causesV130(d,s),evidences=evidenceV130(d,s),actions=actionsV130(d,s,causes);
    PERF_ACTIONS_CURRENT_V130=actions;
    PERF_DRAFT_V130=loadDraftV130(d,s,actions);
    var notice=s.partialFallback?'<div class=performanceNoticeV130>A parcial atual da sua filial não veio no recorte individual disponível. Para não inferir dados, a Central mantém o último fechamento certificado da operação e usa a parcial apenas como referência regional.</div>':'';
    root.innerHTML=filtersHtmlV130(d)+notice+kpiHtmlV130(d,s)+
      '<div class=performanceGridV130>'+shareCompareHtmlV130(d,s)+diagnosisHtmlV130(d,s)+contributionHtmlV130(d,s,top)+'</div>'+
      ranksHtmlV130(d,s,top,bottom)+
      analysisHtmlV130(d,s,causes,evidences,actions)+
      planHtmlV130(d,s)+
      execPreviewHtmlV130(d,s,top,d.prioritized||[],causes);
    patchPerformanceNavV130();
  }

  window.loadPerformanceV130=async function(force){
    var root=document.getElementById('performanceRootV130');if(!root)return;
    if(PERF_FCA_V130&&!force){renderPerformanceV130();return}
    root.innerHTML='<div class=card><div class=muted>Consolidando resultado, KPIs, FCA e sinais operacionais...</div></div>';
    try{
      var d=await api({action:'fca_dashboard',matricula:U.u.id});
      PERF_FCA_V130=d;
      renderPerformanceV130();
    }catch(e){
      root.innerHTML='<div class="notice danger"><b>Não foi possível consolidar a Central de Performance.</b><br>'+pesc(e&&e.message||'Tente novamente.')+'</div>';
    }
  };
  window.performanceRefreshV130=function(){syncNoteV130();PERF_FCA_V130=null;loadPerformanceV130(true)};
  window.performanceSetScopeV130=function(v){syncNoteV130();PERF_SCOPE_V130=v==='operation'?'operation':'regional';renderPerformanceV130()};
  window.performanceSetPeriodV130=function(v){syncNoteV130();PERF_PERIOD_V130=v==='current'?'current':'closed';renderPerformanceV130()};
  window.performanceSetFocusV130=function(v){syncNoteV130();PERF_FOCUS_V130=PERF_FOCUS_LABELS_V130[v]?v:'share';renderPerformanceV130()};
  window.performanceToggleActionV130=function(i,on){
    if(!PERF_DRAFT_V130)return;
    var a=PERF_ACTIONS_CURRENT_V130[i];if(!a)return;
    var cur=PERF_DRAFT_V130.selectedActions||[];
    if(on&&!cur.includes(a))cur.push(a);
    if(!on)cur=cur.filter(function(x){return x!==a});
    PERF_DRAFT_V130.selectedActions=cur;saveDraftObjV130();
  };
  window.performanceAddActionV130=function(){
    if(!PERF_DRAFT_V130)return;
    var el=document.getElementById('performanceManualActionV130'),v=String(el&&el.value||'').trim();
    if(!v)return;
    if(!PERF_DRAFT_V130.manualActions.includes(v))PERF_DRAFT_V130.manualActions.push(v.slice(0,180));
    saveDraftObjV130();renderPerformanceV130();
  };
  window.performanceDraftInputV130=function(el){
    if(!PERF_DRAFT_V130)return;
    PERF_DRAFT_V130.note=String(el&&el.value||'').slice(0,1200);saveDraftObjV130();
    var c=document.getElementById('performanceReadCountV130');if(c)c.textContent=PERF_DRAFT_V130.note.length+'/1200';
  };

  function canvasRoundV130(c,x,y,w,h,r,fill,stroke){
    c.beginPath();if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);
    c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke()}
  }
  function canvasTextV130(c,t,x,y,size,weight,color,align){
    c.fillStyle=color;c.font=(weight||'400')+' '+size+'px Arial, sans-serif';c.textAlign=align||'left';c.textBaseline='alphabetic';c.fillText(String(t==null?'':t),x,y);c.textAlign='left';
  }
  function canvasWrapV130(c,text,x,y,maxW,lineH,maxLines,size,weight,color){
    var words=String(text||'').split(/\s+/),line='',lines=[],i;
    c.font=(weight||'400')+' '+size+'px Arial, sans-serif';
    for(i=0;i<words.length;i++){
      var test=line?line+' '+words[i]:words[i];
      if(c.measureText(test).width>maxW&&line){lines.push(line);line=words[i];if(lines.length>=maxLines-1)break}else line=test;
    }
    if(line&&lines.length<maxLines)lines.push(line);
    if(i<words.length-1&&lines.length){var last=lines.length-1;while(c.measureText(lines[last]+'…').width>maxW&&lines[last].length>2)lines[last]=lines[last].slice(0,-1);lines[last]+='…'}
    lines.forEach(function(l,j){canvasTextV130(c,l,x,y+j*lineH,size,weight,color)});
    return y+lines.length*lineH;
  }
  function loadImgV130(src){return new Promise(function(ok){var im=new Image();im.onload=function(){ok(im)};im.onerror=function(){ok(null)};im.src=src})}

  async function performanceCardCanvasV130(){
    if(!PERF_FCA_V130)throw new Error('Central de Performance ainda não carregada.');
    syncNoteV130();
    var d=PERF_FCA_V130,s=perfSnapshotV130(d),stores=s.stores&&s.stores.length?s.stores:closedStores(d);
    var top=rankStoresV130(stores,true),pri=(d.prioritized||[]).slice(0,3),causes=causesV130(d,s).slice(0,4);
    var acts=(PERF_DRAFT_V130.selectedActions||[]).concat(PERF_DRAFT_V130.manualActions||[]).slice(0,3);
    var read=weekSummaryTextV132(d,s,top,pri,causes);
    var W=1920,H=1080,cv=document.createElement('canvas');cv.width=W;cv.height=H;
    var c=cv.getContext('2d');c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
    var G='#173F35',SAGE='#466964',PAPER='#F7F5EF',SAND='#D6D2C4',OR='#DE7C00',WINE='#76232F',RED='#C73532',WHITE='#FFFFFF',LINE='#E5E1D8',GOOD='#176843',INK='#243A33';
    c.fillStyle=PAPER;c.fillRect(0,0,W,H);
    c.fillStyle=G;c.fillRect(0,0,W,126);
    var logo=await loadImgV130(PERF_LOGO_V131);
    if(logo){const ratio=logo.naturalWidth/logo.naturalHeight,lw=300,lh=lw/ratio;c.drawImage(logo,62,39,lw,lh);}
    canvasTextV130(c,'FCA PERFORMANCE',1855,55,31,'700',WHITE,'right');
    canvasTextV130(c,(s.scope==='operation'?'FILIAL '+String(s.store&&s.store.st||''):'REGIONAL CE+PI')+'  |  '+s.periodLabel.toUpperCase(),1855,91,17,'400','#DCE6E2','right');

    var kpis=[
      ['SHARE',ppct(s.share,2),metricDeviationTextV131(s,'share')],
      ['VENDA CAPTADA',pmoney(s.captured),metricDeviationTextV131(s,'captured')],
      ['PEDIDOS',Math.round(s.orders).toLocaleString('pt-BR'),metricDeviationTextV131(s,'orders')],
      ['TICKET MÉDIO',pmoney(s.ticket),metricDeviationTextV131(s,'ticket')],
      ['DISPERSÃO',ppct(s.dispersion,1),s.scope==='operation'?'Filial '+String(s.store&&s.store.st||''):'Regional CE+PI']
    ];
    var gap=16,kx=62,kw=(1796-gap*4)/5,ky=153,kh=142;
    kpis.forEach(function(k,i){
      var x=kx+i*(kw+gap);canvasRoundV130(c,x,ky,kw,kh,18,WHITE,LINE);
      canvasTextV130(c,k[0],x+18,ky+31,13,'700',SAGE);
      canvasTextV130(c,k[1],x+18,ky+82,28,'700',G);
      var col=(i===0?(s.shareDelta>0?GOOD:s.shareDelta<0?RED:SAGE):SAGE);
      canvasTextV130(c,k[2],x+18,ky+116,13,'700',col);
    });

    var leftX=62,leftW=575,midX=657,midW=575,rightX=1252,rightW=606,bodyY=326,bodyH=690;
    canvasRoundV130(c,leftX,bodyY,leftW,bodyH,20,WHITE,LINE);
    canvasTextV130(c,s.scope==='operation'?'REFERÊNCIA REGIONAL | TOP 3':'TOP 3 PERFORMANCE',leftX+22,bodyY+38,15,'700',G);
    canvasTextV130(c,PERF_FOCUS_LABELS_V130[PERF_FOCUS_V130].toUpperCase(),leftX+leftW-22,bodyY+38,12,'700',SAGE,'right');
    var y=bodyY+70;
    top.slice(0,3).forEach(function(x,i){
      canvasRoundV130(c,leftX+20,y-20,leftW-40,88,14,i===0?'#EDF3F0':'#F8F7F3',null);
      canvasTextV130(c,String(i+1),leftX+42,y+14,20,'700',i===0?G:SAGE);
      canvasTextV130(c,pstoreName(x),leftX+80,y+4,16,'700',INK);
      canvasTextV130(c,'Share '+ppct(x.share,2)+'  |  '+pmoney(x.captured)+'  |  '+Math.round(pnum(x.orders))+' pedidos',leftX+80,y+30,12,'400',SAGE);
      canvasTextV130(c,focusValueV130(x),leftX+leftW-38,y+5,16,'700',G,'right');
      canvasTextV130(c,ppp(x.share_delta),leftX+leftW-38,y+31,12,'700',pnum(x.share_delta)>=0?GOOD:RED,'right');
      y+=102;
    });
    y=bodyY+420;canvasTextV130(c,'PRIORIZADAS FCA',leftX+22,y,15,'700',G);y+=34;
    if(pri.length){
      pri.forEach(function(x,i){
        canvasTextV130(c,String(x.priority_rank||i+1)+'º  '+pstoreName(x),leftX+24,y,14,'700',INK);
        canvasTextV130(c,ppp(x.share_delta),leftX+leftW-28,y,14,'700',RED,'right');
        canvasTextV130(c,priorityReasonV130(x),leftX+24,y+22,11,'400',SAGE);
        y+=70;
      });
    }else canvasTextV130(c,'Nenhuma loja Priorizada no ciclo.',leftX+24,y,13,'400',SAGE);

    canvasRoundV130(c,midX,bodyY,midW,bodyH,20,WHITE,LINE);
    canvasTextV130(c,'PRINCIPAIS CAUSAS / SINAIS',midX+22,bodyY+38,15,'700',G);
    y=bodyY+76;
    if(causes.length){
      causes.forEach(function(x,i){
        c.fillStyle=x.cls==='fca'?OR:x.cls==='voice'?WINE:GOOD;c.beginPath();c.arc(midX+31,y-4,6,0,Math.PI*2);c.fill();
        canvasWrapV130(c,x.label,midX+50,y,midW-88,18,2,13,'700',INK);
        canvasTextV130(c,x.source,midX+50,y+35,10,'700',SAGE);
        y+=70;
      });
    }else{canvasTextV130(c,'Sem causa validada neste recorte.',midX+24,y,13,'400',SAGE);y+=50}
    canvasTextV130(c,'PLANO DE AÇÃO | PRINCIPAIS',midX+22,bodyY+396,15,'700',G);
    y=bodyY+438;
    if(acts.length){
      acts.forEach(function(a,i){
        canvasRoundV130(c,midX+22,y-18,30,30,9,G,null);canvasTextV130(c,String(i+1),midX+37,y+3,13,'700',WHITE,'center');
        y=canvasWrapV130(c,a,midX+66,y,midW-94,19,3,12,'400',INK)+22;
      });
    }else canvasTextV130(c,'Selecione ações na Central de Performance.',midX+22,y,13,'400',SAGE);

    canvasRoundV130(c,rightX,bodyY,rightW,bodyH,20,WHITE,LINE);
    canvasTextV130(c,'RESUMO DA SEMANA',rightX+24,bodyY+38,15,'700',G);
    canvasWrapV130(c,read,rightX+24,bodyY+82,rightW-48,25,22,15,'400',INK);

    return cv;
  }
  window.performanceCardCanvasV130=performanceCardCanvasV130;

  async function performanceBlobV130(){
    var cv=await performanceCardCanvasV130();
    return new Promise(function(ok){cv.toBlob(function(b){ok({blob:b,canvas:cv})},'image/png',1)});
  }
  window.previewPerformanceCardV130=async function(){
    try{
      var out=await performanceBlobV130();if(!out.blob)throw new Error('Falha ao gerar o card.');
      var m=document.createElement('div');m.className='performanceModalV130';
      m.innerHTML='<div class=box><img src="'+out.canvas.toDataURL('image/png')+'" alt="Prévia FCA Performance"><div class=tools><button class=ghost onclick="this.closest(\'.performanceModalV130\').remove()">Fechar</button><button onclick="sharePerformanceCardV130()">Compartilhar</button></div></div>';
      m.addEventListener('click',function(e){if(e.target===m)m.remove()});document.body.appendChild(m);
    }catch(e){alert(e&&e.message||'Não foi possível gerar a prévia.')}
  };
  window.sharePerformanceCardV130=async function(){
    try{
      var out=await performanceBlobV130();if(!out.blob)throw new Error('Falha ao gerar o card.');
      var d=PERF_FCA_V130,s=perfSnapshotV130(d),scope=s.scope==='operation'?'Filial_'+String(s.store&&s.store.st||''):'CEPI';
      var week=s.isCurrent?d.currentWeekNumber:d.weekNumber;
      var name='FCA_Performance_'+scope+'_Semana_'+String(week||'')+'.png';
      var file=new File([out.blob],name,{type:'image/png'});
      var stores=s.stores&&s.stores.length?s.stores:closedStores(d);
      var text=treatmentCaptionV131(d,s,rankStoresV130(stores,true),d.prioritized||[],causesV130(d,s));
      try{if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({title:'FCA Performance eStore',text:text,files:[file]});return}}catch(e){if(e&&e.name==='AbortError')return}
      try{await navigator.clipboard.writeText(text)}catch(e){}
      var a=document.createElement('a');a.href=URL.createObjectURL(out.blob);a.download=name;a.click();setTimeout(function(){URL.revokeObjectURL(a.href)},1800);
    }catch(e){alert(e&&e.message||'Não foi possível gerar o card.')}
  };

  function performanceTileV130(){
    return '<button class="menuTileV33 green performanceTileV130" onclick="go(\'performance\')"><span class=menuIcon3dV33>▦</span><b>Central de Performance</b><i>›</i></button>';
  }
  function patchPerformanceNavV130(){
    var nav=document.querySelector('.drawerNav');if(!nav)return;
    var old=nav.querySelector('[data-performance-v130]');
    var fca=[].slice.call(nav.querySelectorAll('button')).find(function(b){return String(b.getAttribute('onclick')||'').indexOf("go('fca')")>=0});
    var lead=typeof isLead==='function'?isLead():false;
    if(!lead&&old){old.remove();old=null}
    if(lead&&!old){
      var b=document.createElement('button');b.setAttribute('data-performance-v130','1');b.setAttribute('onclick',"go('performance')");b.innerHTML='<span class=drawerIco>▦</span>Central de Performance';
      if(fca)nav.insertBefore(b,fca);else nav.appendChild(b);
    }
    if(fca&&/FCA e Performance/i.test(fca.textContent||''))fca.innerHTML='<span class=drawerIco>📈</span>FCA Semanal';
  }
  window.patchPerformanceNavV130=patchPerformanceNavV130;

  var baseHomeV130=window.home||home;
  window.home=home=function(){
    var html=typeof baseHomeV130==='function'?baseHomeV130():'';
    if(!(typeof isLead==='function'&&isLead())||html.indexOf("go('performance')")>=0)return html;
    return html.replace('<div class=menuGridV33>','<div class=menuGridV33>'+performanceTileV130());
  };

  var baseGoV130=window.go||go;
  window.go=go=function(v){
    if(v==='performance'){
      if(typeof isLead==='function'&&!isLead())return baseGoV130('home');
      if(typeof APP_BACKING!=='undefined'&&!APP_BACKING&&typeof CUR!=='undefined'&&CUR&&CUR!==v&&Array.isArray(APP_NAV_STACK))APP_NAV_STACK.push(CUR);
      CUR=v;
      var shell=document.getElementById('shell');if(shell){shell.classList.remove('homeMode');shell.classList.add('performanceModeV131')}
      var dr=document.querySelector('.drawer');if(dr)dr.classList.remove('open');
      document.querySelectorAll('.bottom button').forEach(function(b){b.classList.remove('navOn')});
      var back=document.getElementById('appBackBottom');if(back)back.classList.remove('show');
      var view=document.getElementById('view');if(view)view.innerHTML=performanceViewV130();
      window.scrollTo(0,0);
      try{if(typeof stopHomeV34==='function')stopHomeV34()}catch(e){}
      try{if(typeof updateDrawerInfo==='function')updateDrawerInfo()}catch(e){}
      patchPerformanceNavV130();
      setTimeout(function(){loadPerformanceV130(false)},0);
      return;
    }
    var shell=document.getElementById('shell');if(shell)shell.classList.remove('performanceModeV131');
    var out=baseGoV130(v);setTimeout(patchPerformanceNavV130,0);return out;
  };

  function bootPerformanceV130(){patchPerformanceNavV130()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootPerformanceV130,{once:true});else setTimeout(bootPerformanceV130,0);
})();