/* ===== V123 2026-10-04: Ritmo de captação + Ouça seu time ===== */
(function(){
  'use strict';
  if(window.__VOICE_V123_LOADED__)return;
  window.__VOICE_V123_LOADED__=true;

  const CAUSES={
    instabilidade_app:{label:'Instabilidade App/eStore',icon:'◉',suggestion:'Registrar a ocorrência/chamado, manter novas tentativas quando possível e sinalizar ao supervisor o período de indisponibilidade.'},
    pagamento:{label:'Problema de pagamento',icon:'▣',suggestion:'Validar os dados da compra, testar outra forma de pagamento quando aplicável e registrar a falha se houver recorrência.'},
    cupom:{label:'Cupom não aplicou',icon:'◇',suggestion:'Revisar vigência e regra do cupom, confirmar elegibilidade do pedido e registrar evidência quando a aplicação falhar.'},
    estoque_online:{label:'Indisponibilidade de estoque online',icon:'⬡',suggestion:'Buscar alternativas de categoria, cor ou tamanho e ampliar a oferta para preservar a oportunidade de venda.'},
    outra_atividade:{label:'Foco em outra atividade da loja',icon:'▦',suggestion:'Organizar blocos de abordagem e combinar janelas de foco eStore com o supervisor para recuperar o ritmo.'},
    abordagem:{label:'Dificuldade de abordagem',icon:'◎',suggestion:'Reforçar o script de abordagem, apresentar benefícios do eStore e praticar objeções com o time.'},
    escala_folga:{label:'Escala, folga ou afastamento',icon:'◷',suggestion:'Registrar o contexto para que os dias sem captação sejam interpretados corretamente na leitura do período.'},
    outro:{label:'Outro motivo',icon:'•••',suggestion:'Descreva o principal impacto e combine uma ação objetiva para a próxima oportunidade de atendimento.'}
  };

  const css=document.createElement('style');
  css.id='voice-v123-style';
  css.textContent=[
    '.rhythmWrapV123{display:grid;gap:12px;margin-top:12px}',
    '.rhythmMainV123{background:linear-gradient(145deg,#0d5b49,#073e34);color:#fff;border-radius:22px;padding:17px;box-shadow:0 10px 24px rgba(23,63,53,.14)}',
    '.rhythmHeadV123{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}',
    '.rhythmHeadV123 b{font-size:18px}.rhythmHeadV123 small{display:block;margin-top:4px;color:#dce9e4;font-size:10px}',
    '.rhythmBodyV123{display:grid;grid-template-columns:112px 1fr;gap:14px;align-items:center;margin-top:14px}',
    '.rhythmDonutV123{width:106px;height:106px;border-radius:50%;display:grid;place-items:center;position:relative}',
    '.rhythmDonutV123:after{content:"";position:absolute;inset:13px;border-radius:50%;background:#0b4b3e}',
    '.rhythmDonutV123 div{position:relative;z-index:2;text-align:center}.rhythmDonutV123 b{display:block;font-size:27px}.rhythmDonutV123 span{display:block;font-size:9px;color:#dce9e4;margin-top:2px}',
    '.rhythmStatsV123{display:grid;grid-template-columns:1fr 1fr;gap:7px}.rhythmStatV123{background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:9px}.rhythmStatV123 span{display:block;font-size:9px;color:#dce9e4}.rhythmStatV123 b{display:block;font-size:16px;margin-top:3px}',
    '.rhythmBarsV123{height:54px;display:flex;align-items:flex-end;gap:4px;margin-top:13px;padding-top:8px;border-top:1px solid rgba(255,255,255,.12)}',
    '.rhythmBarsV123 i{flex:1;min-width:4px;border-radius:4px 4px 1px 1px;background:#68cfa9;height:18%;opacity:.45}.rhythmBarsV123 i.sold{opacity:1;background:linear-gradient(#80dfbd,#34a87f)}.rhythmBarsV123 i.zero{height:12%!important;background:#e3a53f;opacity:.7}',
    '.participationV123{background:linear-gradient(145deg,#fff9e9,#f6ecd0);border:1px solid #ead8a6;border-radius:22px;padding:16px;display:grid;grid-template-columns:104px 1fr;gap:14px;align-items:center}',
    '.participationDonutV123{width:98px;height:98px;border-radius:50%;display:grid;place-items:center;position:relative}.participationDonutV123:after{content:"";position:absolute;inset:12px;border-radius:50%;background:#fff9e9}.participationDonutV123 b{position:relative;z-index:2;font-size:24px;color:#173F35}',
    '.participationCopyV123 h4{margin:0;color:#173F35;font-size:14px}.participationCopyV123 p{margin:6px 0 9px;color:#5d6864;font-size:11px;line-height:1.35}.participationCopyV123 span{display:block;color:#173F35;font-size:10px}.participationCopyV123 strong{font-size:17px}',
    '.voiceAlertV123{border:1.5px solid #e24747;background:linear-gradient(145deg,#fff1f1,#ffe6e4);border-radius:18px;padding:14px;display:grid;grid-template-columns:42px 1fr 20px;gap:10px;align-items:center;color:#b51f25;cursor:pointer}',
    '.voiceAlertV123 .icon{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:#e83d43;color:#fff;font-size:20px;box-shadow:0 7px 14px rgba(214,47,52,.22)}.voiceAlertV123 b{display:block;font-size:14px}.voiceAlertV123 small{display:block;margin-top:4px;line-height:1.3;color:#a83a3f}.voicePendingV123{margin-top:7px;font-size:9px;font-weight:900;color:#9b5a00}',
    '.voiceMenuV123{position:relative!important}.voiceBadgeV123{position:absolute;right:9px;top:7px;min-width:20px;height:20px;padding:0 5px;border-radius:999px;background:#e3242b;color:#fff;display:none;align-items:center;justify-content:center;font-size:10px;font-weight:950;box-shadow:0 3px 8px rgba(180,20,30,.3)}.voiceBadgeV123.show{display:flex}',
    '.voicePageV123{display:grid;gap:12px}.voiceHeroV123{background:linear-gradient(135deg,#173F35,#0f5848);color:#fff;border-radius:22px;padding:18px}.voiceHeroV123 h2{margin:0;font-size:24px}.voiceHeroV123 p{margin:7px 0 0;color:#dce7e3;font-size:12px;line-height:1.4}',
    '.voiceTabsV123{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;background:#f0eee8;padding:5px;border-radius:16px}.voiceTabsV123 button{border:0;background:transparent;border-radius:12px;padding:10px 5px;font-size:11px;font-weight:900;color:#52635d}.voiceTabsV123 button.on{background:#173F35;color:#fff}',
    '.voiceFilterV123{display:flex;gap:8px;align-items:center}.voiceFilterV123 select{width:100%;height:44px;border:1px solid #d9d5cc;border-radius:13px;background:#fff;padding:0 11px;color:#173F35;font-weight:800}',
    '.voiceKpisV123{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.voiceKpiV123{background:#fff;border:1px solid #e5e1d8;border-radius:15px;padding:12px;text-align:center}.voiceKpiV123 span{display:block;font-size:9px;color:#6b7671}.voiceKpiV123 b{display:block;font-size:20px;color:#173F35;margin-top:4px}.voiceKpiV123.danger b{color:#d32d35}',
    '.voiceListV123{display:grid;gap:9px}.voiceItemV123{background:#fff;border:1px solid #e5e1d8;border-radius:18px;padding:13px;box-shadow:0 5px 15px rgba(23,63,53,.05)}.voiceItemTopV123{display:grid;grid-template-columns:10px 1fr auto;gap:9px;align-items:start}.voiceDotV123{width:9px;height:9px;border-radius:50%;background:#e3242b;margin-top:5px}.voiceItemV123.resolved .voiceDotV123{background:#198455}.voiceItemV123 h4{margin:0;color:#173F35;font-size:14px}.voiceItemV123 .meta{font-size:9px;color:#77817d;margin-top:3px}.voiceDaysV123{color:#d8232f;font-weight:950;font-size:12px;text-align:right}.voiceItemV123 p{margin:9px 0 0;font-size:11px;line-height:1.42;color:#394944}.voiceReasonV123{display:inline-flex;align-items:center;gap:5px;margin-top:8px;background:#f5f2eb;border-radius:999px;padding:5px 8px;font-size:9px;color:#53625d}.voiceActionsV123{display:flex;justify-content:flex-end;margin-top:10px}.voiceActionsV123 button{border:0;background:#eaf1ee;color:#173F35;border-radius:11px;padding:8px 10px;font-size:10px;font-weight:900}',
    '.voiceOverlayV123{position:fixed;inset:0;z-index:100020;background:rgba(4,24,20,.58);backdrop-filter:blur(6px);display:flex;align-items:flex-end;justify-content:center}.voiceSheetV123{width:min(620px,100%);max-height:92vh;overflow:auto;background:#faf8f3;border-radius:26px 26px 0 0;padding:18px 16px calc(22px + env(safe-area-inset-bottom));box-shadow:0 -18px 48px rgba(0,0,0,.24)}',
    '.voiceSheetHeadV123{display:flex;justify-content:space-between;gap:12px;align-items:center}.voiceSheetHeadV123 h3{margin:0;color:#173F35;font-size:21px}.voiceCloseV123{width:38px;height:38px;border:0;border-radius:50%;background:#e8e5de;color:#173F35;font-size:23px}',
    '.voiceCriticalV123{margin:12px 0;background:#ffe6e3;border-radius:15px;padding:12px;color:#be1f27;font-size:12px;line-height:1.4}.voiceCriticalV123 b{display:block;margin-bottom:3px}',
    '.voiceCauseGridV123{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:9px}.voiceCauseV123{border:1px solid #dad6cd;background:#fff;border-radius:13px;padding:10px 7px;min-height:62px;color:#253c35;font-size:10px;font-weight:800;display:flex;align-items:center;gap:7px;text-align:left}.voiceCauseV123.on{border-color:#173F35;background:#e9f1ed;box-shadow:inset 0 0 0 1px #173F35}.voiceCauseV123 i{font-style:normal;font-size:17px;color:#173F35}',
    '.voiceFieldV123{margin-top:13px}.voiceFieldV123 label{display:block;margin-bottom:6px;color:#173F35;font-size:11px;font-weight:900}.voiceFieldV123 textarea{width:100%;min-height:88px;resize:vertical;border:1px solid #d9d5cc;border-radius:13px;background:#fff;padding:11px;font:inherit;font-size:12px;color:#2d403a}.voiceSuggestionV123{background:#edf4f1;border-left:4px solid #173F35;border-radius:13px;padding:11px;font-size:11px;line-height:1.42;color:#3b514a;margin-top:10px}',
    '.voiceSubmitV123{width:100%;margin-top:14px;border:0;border-radius:15px;padding:14px;background:#173F35;color:#fff;font-weight:950}.voiceResolveBtnsV123{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.voiceResolveBtnsV123 button{border:0;border-radius:13px;padding:12px;font-weight:900}.voiceResolveBtnsV123 .review{background:#f4e9c8;color:#6d5008}.voiceResolveBtnsV123 .resolve{background:#173F35;color:#fff}',
    '@media(max-width:380px){.rhythmBodyV123{grid-template-columns:96px 1fr}.rhythmDonutV123{width:92px;height:92px}.participationV123{grid-template-columns:90px 1fr}.participationDonutV123{width:86px;height:86px}.voiceCauseGridV123{grid-template-columns:1fr}}'
  ].join('');
  document.head.appendChild(css);

  function normV123(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
  function contractEligibleV123(){return !/(intermitente|aprendiz)/.test(normV123(U?.u?.role||''))}
  function cacheV123(){return RESULT_PERIOD_CACHE?.[String(U?.u?.id||'')+'|'+PER]||null}
  function periodNameV123(){return ({day:'Dia',week:'Semana',month:'Mês',year:'Ano'})[PER]||'Período'}
  function statusLabelV123(s){return s==='resolved'?'Resolvido':s==='reviewed'?'Em análise':'Aguardando'}
  function causeV123(k){return CAUSES[k]||CAUSES.outro}
  function safePctV123(v){return Math.max(0,Math.min(1,+v||0))}
  function fmtDateV123(s){try{return new Date(String(s)+'T12:00:00').toLocaleDateString('pt-BR')}catch(e){return String(s||'')}}

  function rhythmHtmlV123(x){
    const r=x?.rhythm||{},freq=safePctV123(r.frequency),deg=(freq*360).toFixed(1),
          part=Math.max(0,+x.participation||0),partDeg=Math.min(360,part*360).toFixed(1),
          daily=Array.isArray(r.daily)?r.daily.slice(-14):[];
    const bars=daily.map(d=>'<i class="'+(d.sold?'sold':'zero')+'" style="height:'+(d.sold?Math.min(100,32+Math.log10(1+(+d.captured||0))*23):12)+'%" title="'+esc(fmtDateV123(d.date))+' • '+money(d.captured)+'"></i>').join('');
    const latest=x.latestVoice;
    const voiceStatus=latest&&latest.status!=='resolved'?'<div class=voicePendingV123>● Registro enviado • '+statusLabelV123(latest.status)+'</div>':'';
    const alert=r.alert?'<div class=voiceAlertV123 onclick="openVoiceSheetV123()"><div class=icon>!</div><div><b>Atenção! Você está há '+num(r.zeroStreak)+' dias sem captar venda.</b><small>Registre o que impactou sua entrega e veja sugestões para recuperar o ritmo.</small>'+voiceStatus+'</div><b>›</b></div>':'';
    return '<div class=rhythmWrapV123>'+
      '<section class=rhythmMainV123>'+
        '<div class=rhythmHeadV123><div><b>Ritmo de captação eStore</b><small>'+periodNameV123()+' • '+fmtDateV123(x.startDate)+' a '+fmtDateV123(x.asof)+'</small></div><span>📈</span></div>'+
        '<div class=rhythmBodyV123>'+
          '<div class=rhythmDonutV123 style="background:conic-gradient(#f4c44f 0deg '+deg+'deg,rgba(255,255,255,.16) '+deg+'deg 360deg)"><div><b>'+Math.round(freq*100)+'%</b><span>'+num(r.daysWithSale)+' de '+num(r.operationalDays)+' dias<br>com venda</span></div></div>'+
          '<div class=rhythmStatsV123>'+
            '<div class=rhythmStatV123><span>Dias com venda</span><b>'+num(r.daysWithSale)+'</b></div>'+
            '<div class=rhythmStatV123><span>Dias sem venda</span><b>'+num(r.zeroDays)+'</b></div>'+
            '<div class=rhythmStatV123><span>Sequência sem captar</span><b>'+num(r.zeroStreak)+' dia'+((+r.zeroStreak||0)===1?'':'s')+'</b></div>'+
            '<div class=rhythmStatV123><span>Última captação</span><b style="font-size:12px">'+(r.lastSaleDate?fmtDateV123(r.lastSaleDate):'—')+'</b></div>'+
          '</div>'+
        '</div>'+
        (bars?'<div class=rhythmBarsV123>'+bars+'</div>':'')+
      '</section>'+
      '<section class=participationV123>'+
        '<div class=participationDonutV123 style="background:conic-gradient(#DE7C00 0deg '+partDeg+'deg,#dad9d6 '+partDeg+'deg 360deg)"><b>'+((part*100).toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1}))+'%</b></div>'+
        '<div class=participationCopyV123><h4>Participação no resultado da sua operação</h4><p>Representatividade da sua venda aprovada no resultado eStore da filial neste período.</p><span>Sua venda aprovada <strong>'+money(x.a)+'</strong></span><span>Resultado da filial <strong>'+money(x.storeApproved)+'</strong></span></div>'+
      '</section>'+
      alert+
    '</div>';
  }

  const baseResultViewV123=window.resultView;
  window.resultView=resultView=function(){
    const html=typeof baseResultViewV123==='function'?baseResultViewV123():'';
    const x=cacheV123();
    if(!x||!x.rhythm)return html;
    return html+rhythmHtmlV123(x);
  };

  window.loadResultExtras=async function(){
    try{
      const period=PER,key=String(U?.u?.id||'')+'|'+period,
            j=await api({action:'person_period',matricula:U.u.id,store:U.u.st,period}),
            eligible=(j.commissionEligible!==false)&&contractEligibleV123(),
            verified=j.commissionVerified!==false;
      const x={
        c:+j.captured||0,a:+j.approved||0,o:+j.orders||0,
        com:eligible&&verified?(+j.commission||0):0,
        eday:eligible&&verified?(+j.eday||0):0,
        commissionableApproved:+j.commissionableApproved||0,
        bopisApproved:+j.bopisApproved||0,bopisCaptured:+j.bopisCaptured||0,bopisOrders:+j.bopisOrders||0,
        commissionVerified:verified,commissionEligible:eligible,
        commissionEligibilityReason:j.commissionEligibilityReason||'',
        rr:j.regionalRank||null,sr:j.storeRank||null,asof:j.endDate||'',startDate:j.startDate||'',
        rhythm:j.rhythm||{},participation:+j.participation||0,storeApproved:+j.storeApproved||0,
        participationSource:j.participationSource||'',participationCoverage:+j.participationCoverage||0,
        latestVoice:j.latestVoice||null,_live:true
      };
      RESULT_PERIOD_CACHE[key]=x;
      U.p=U.p||{};U.p[period]={...(U.p[period]||{}),...x};
      if(CUR==='result'&&PER===period){const v=document.getElementById('view');if(v)v.innerHTML=resultView()}
    }catch(e){
      console.warn('[V123] Meu Resultado',e);
      if(CUR==='result'){const v=document.getElementById('view');if(v)v.innerHTML='<div class=card><div class="notice danger">Não foi possível consultar o resultado oficial neste momento.</div></div>'}
    }
  };

  let SELECTED_CAUSE_V123='';
  window.selectVoiceCauseV123=function(code){
    SELECTED_CAUSE_V123=code;
    document.querySelectorAll('.voiceCauseV123').forEach(b=>b.classList.toggle('on',b.dataset.cause===code));
    const box=document.getElementById('voiceSuggestionV123'),c=causeV123(code);
    if(box)box.innerHTML='<b>Sugestão para recuperar o ritmo</b><br>'+esc(c.suggestion);
  };

  window.closeVoiceSheetV123=function(){document.getElementById('voiceOverlayV123')?.remove()};

  window.openVoiceSheetV123=function(){
    closeVoiceSheetV123();
    const x=cacheV123(),r=x?.rhythm||{};
    if(!x)return;
    SELECTED_CAUSE_V123='';
    const d=document.createElement('div');
    d.id='voiceOverlayV123';d.className='voiceOverlayV123';
    d.innerHTML='<div class=voiceSheetV123>'+
      '<div class=voiceSheetHeadV123><div><h3>Registro de impacto</h3><div class=muted>Conte o que aconteceu e como podemos apoiar.</div></div><button class=voiceCloseV123 onclick="closeVoiceSheetV123()">×</button></div>'+
      '<div class=voiceCriticalV123><b>Você está há '+num(r.zeroStreak)+' dias sem captar venda.</b>Este registro ficará visível para o seu supervisor. O ADV terá visão regional consolidada.</div>'+
      '<div class=voiceFieldV123><label>Qual foi o principal motivo?</label><div class=voiceCauseGridV123>'+
        Object.entries(CAUSES).map(([k,v])=>'<button type=button class=voiceCauseV123 data-cause="'+k+'" onclick="selectVoiceCauseV123(\''+k+'\')"><i>'+v.icon+'</i><span>'+esc(v.label)+'</span></button>').join('')+
      '</div></div>'+
      '<div id=voiceSuggestionV123 class=voiceSuggestionV123>Selecione um motivo para receber uma sugestão prática de melhoria.</div>'+
      '<div class=voiceFieldV123><label>Conte o que aconteceu</label><textarea id=voiceDetailV123 maxlength=1200 placeholder="Descreva o que impactou sua captação nesses dias..."></textarea></div>'+
      '<div class=voiceFieldV123><label>O que você pretende realizar?</label><textarea id=voicePlanV123 maxlength=1200 placeholder="Ex.: aumentar abordagem, utilizar script, reforçar uso do eStore, organizar janelas de foco..."></textarea></div>'+
      '<button id=voiceSubmitV123 class=voiceSubmitV123 onclick="submitVoiceV123()">Enviar para o meu supervisor</button>'+
    '</div>';
    d.addEventListener('click',e=>{if(e.target===d)closeVoiceSheetV123()});
    document.body.appendChild(d);
  };

  window.submitVoiceV123=async function(){
    const x=cacheV123(),r=x?.rhythm||{},detail=String(document.getElementById('voiceDetailV123')?.value||'').trim(),
          plan=String(document.getElementById('voicePlanV123')?.value||'').trim(),btn=document.getElementById('voiceSubmitV123');
    if(!SELECTED_CAUSE_V123)return alert('Selecione o principal motivo.');
    if(detail.length<8)return alert('Conte brevemente o que impactou sua captação.');
    const c=causeV123(SELECTED_CAUSE_V123);
    try{
      if(btn){btn.disabled=true;btn.textContent='Enviando...'}
      await api({
        action:'voice_submit',matricula:U.u.id,period:PER,
        period_start:x.startDate,period_end:x.asof,
        zero_streak:r.zeroStreak||0,zero_days:r.zeroDays||0,frequency:r.frequency||0,participation:x.participation||0,
        cause_code:SELECTED_CAUSE_V123,cause_detail:detail,suggested_improvement:c.suggestion,action_plan:plan
      });
      closeVoiceSheetV123();
      alert('Registro enviado ao seu supervisor.');
      await loadResultExtras();
      refreshVoiceBadgeV123();
    }catch(e){alert(e.message||'Não foi possível enviar o registro.')}
    finally{if(btn){btn.disabled=false;btn.textContent='Enviar para o meu supervisor'}}
  };

  let VOICE_STATUS_V123='open',VOICE_STORE_V123='',VOICE_ITEMS_V123=[];

  function menuTileV123(){
    return '<button class="menuTileV33 sage voiceMenuV123" onclick="go(\'listen\')"><span class=menuIcon3dV33>👂</span><b>Ouça seu time</b><i>›</i><span id=voiceHomeBadgeV123 class=voiceBadgeV123></span></button>';
  }

  const baseHomeV123=window.home;
  window.home=home=function(){
    let html=typeof baseHomeV123==='function'?baseHomeV123():'';
    if(!isLead()||html.includes('voiceHomeBadgeV123'))return html;
    return html.replace('<div class=menuGridV33>','<div class=menuGridV33>'+menuTileV123());
  };

  window.refreshVoiceBadgeV123=async function(){
    if(!isLead()||!U?.u?.id)return;
    try{
      const j=await api({action:'voice_badge',matricula:U.u.id}),n=+j.pendingCount||0,el=document.getElementById('voiceHomeBadgeV123');
      if(el){el.textContent=n>99?'99+':String(n);el.classList.toggle('show',n>0)}
      const top=document.getElementById('voicePageBadgeV123');if(top){top.textContent=String(n);top.style.display=n>0?'inline-flex':'none'}
    }catch(e){console.warn('[V123] badge Ouça seu time',e)}
  };

  const baseInitHomeV123=window.initHomeV34;
  if(typeof baseInitHomeV123==='function'){
    window.initHomeV34=initHomeV34=function(){
      const r=baseInitHomeV123.apply(this,arguments);
      setTimeout(refreshVoiceBadgeV123,80);
      return r;
    };
  }

  window.listenTeamV123=function(){
    if(!isLead())return '<div class=notice>Acesso exclusivo para supervisores e gestores.</div>';
    const opts=isAdmin()?'<div class=voiceFilterV123><select id=voiceStoreFilterV123 onchange="setVoiceStoreV123(this.value)"><option value="">Todas as filiais • CE+PI</option>'+Object.keys(COMMON?.stores||{}).sort().map(st=>'<option value="'+esc(st)+'" '+(VOICE_STORE_V123===st?'selected':'')+'>Filial '+esc(st)+'</option>').join('')+'</select></div>':'';
    return '<div class=voicePageV123>'+
      '<section class=voiceHeroV123><h2>Ouça seu time <span id=voicePageBadgeV123 class=voiceBadgeV123 style="position:static;vertical-align:middle"></span></h2><p>'+(isAdmin()?'Visão regional CE+PI dos impactos e sugestões registrados pelos colaboradores.':'Acompanhe os impactos, causas e sugestões registradas pelos colaboradores da sua filial.')+'</p></section>'+
      opts+
      '<div class=voiceTabsV123><button class="'+(VOICE_STATUS_V123==='open'?'on':'')+'" onclick="setVoiceStatusV123(\'open\')">Aguardando</button><button class="'+(VOICE_STATUS_V123==='resolved'?'on':'')+'" onclick="setVoiceStatusV123(\'resolved\')">Resolvidos</button><button class="'+(VOICE_STATUS_V123==='all'?'on':'')+'" onclick="setVoiceStatusV123(\'all\')">Todos</button></div>'+
      '<div id=voiceTeamBodyV123><div class=card><div class=muted>Carregando registros...</div></div></div>'+
    '</div>';
  };

  window.setVoiceStatusV123=function(v){
    VOICE_STATUS_V123=v;
    const view=document.getElementById('view');
    if(view&&CUR==='listen'){view.innerHTML=listenTeamV123();loadVoiceTeamV123()}
  };
  window.setVoiceStoreV123=function(v){VOICE_STORE_V123=String(v||'');loadVoiceTeamV123()};

  window.loadVoiceTeamV123=async function(){
    if(!isLead())return;
    const body=document.getElementById('voiceTeamBodyV123');
    if(body)body.innerHTML='<div class=card><div class=muted>Atualizando registros...</div></div>';
    try{
      const j=await api({action:'voice_list',matricula:U.u.id,status:VOICE_STATUS_V123,store:VOICE_STORE_V123});
      VOICE_ITEMS_V123=Array.isArray(j.items)?j.items:[];
      const s=j.summary||{},cards=VOICE_ITEMS_V123.map(item=>{
        const c=causeV123(item.cause_code),resolved=item.status==='resolved';
        return '<article class="voiceItemV123 '+(resolved?'resolved':'')+'">'+
          '<div class=voiceItemTopV123><span class=voiceDotV123></span><div><h4>'+esc(item.collaborator_name||('Matrícula '+item.matricula))+'</h4><div class=meta>Filial '+esc(item.store_code)+' • '+fmtDateV123(String(item.created_at||'').slice(0,10))+' • '+statusLabelV123(item.status)+'</div></div><div class=voiceDaysV123>'+num(item.zero_streak)+' dias<br><span style="font-size:9px;font-weight:700">sem captar</span></div></div>'+
          '<span class=voiceReasonV123>'+c.icon+' '+esc(c.label)+'</span>'+
          '<p>'+esc(item.cause_detail||'')+'</p>'+
          (item.action_plan?'<p><b>Ação informada:</b> '+esc(item.action_plan)+'</p>':'')+
          '<div class=voiceActionsV123><button onclick="openVoiceItemV123(\''+item.id+'\')">'+(resolved?'Ver registro':'Ver / tratar')+'</button></div>'+
        '</article>';
      }).join('');
      if(body)body.innerHTML='<div class=voiceKpisV123><div class="voiceKpiV123 danger"><span>Aguardando</span><b>'+num(s.pending||0)+'</b></div><div class=voiceKpiV123><span>Em análise</span><b>'+num(s.reviewed||0)+'</b></div><div class=voiceKpiV123><span>Resolvidos</span><b>'+num(s.resolved||0)+'</b></div></div>'+
        '<div class=voiceListV123 style="margin-top:10px">'+(cards||'<div class=card><div class=muted>Nenhum registro neste filtro.</div></div>')+'</div>';
      refreshVoiceBadgeV123();
    }catch(e){
      if(body)body.innerHTML='<div class=notice danger>Não foi possível carregar os registros: '+esc(e.message||'erro')+'</div>'
    }
  };

  window.openVoiceItemV123=function(id){
    const item=VOICE_ITEMS_V123.find(x=>String(x.id)===String(id));if(!item)return;
    closeVoiceSheetV123();
    const c=causeV123(item.cause_code),resolved=item.status==='resolved',d=document.createElement('div');
    d.id='voiceOverlayV123';d.className='voiceOverlayV123';
    d.innerHTML='<div class=voiceSheetV123>'+
      '<div class=voiceSheetHeadV123><div><h3>'+esc(item.collaborator_name||'Colaborador')+'</h3><div class=muted>Filial '+esc(item.store_code)+' • '+statusLabelV123(item.status)+'</div></div><button class=voiceCloseV123 onclick="closeVoiceSheetV123()">×</button></div>'+
      '<div class=voiceCriticalV123 style="background:#f5f1e8;color:#173F35"><b>'+num(item.zero_streak)+' dias sem captar • '+((+item.frequency||0)*100).toLocaleString('pt-BR',{maximumFractionDigits:1})+'% de frequência</b>'+esc(c.label)+'</div>'+
      '<div class=voiceFieldV123><label>O que aconteceu</label><div class=voiceSuggestionV123>'+esc(item.cause_detail||'—')+'</div></div>'+
      '<div class=voiceFieldV123><label>Sugestão apresentada ao colaborador</label><div class=voiceSuggestionV123>'+esc(item.suggested_improvement||c.suggestion)+'</div></div>'+
      '<div class=voiceFieldV123><label>Ação informada pelo colaborador</label><div class=voiceSuggestionV123>'+esc(item.action_plan||'Não informada.')+'</div></div>'+
      '<div class=voiceFieldV123><label>Retorno do supervisor / ADV</label><textarea id=voiceSupervisorNoteV123 maxlength=1500 placeholder="Registre orientação, alinhamento ou acompanhamento...">'+esc(item.supervisor_note||'')+'</textarea></div>'+
      (resolved?'<div class=notice success>Registro resolvido.</div>':'<div class=voiceResolveBtnsV123><button class=review onclick="updateVoiceItemV123(\''+item.id+'\',\'reviewed\')">Marcar em análise</button><button class=resolve onclick="updateVoiceItemV123(\''+item.id+'\',\'resolved\')">Resolver</button></div>')+
    '</div>';
    d.addEventListener('click',e=>{if(e.target===d)closeVoiceSheetV123()});
    document.body.appendChild(d);
  };

  window.updateVoiceItemV123=async function(id,status){
    const note=String(document.getElementById('voiceSupervisorNoteV123')?.value||'').trim();
    try{
      await api({action:'voice_update',matricula:U.u.id,id,status,supervisor_note:note});
      closeVoiceSheetV123();
      await loadVoiceTeamV123();
      await refreshVoiceBadgeV123();
    }catch(e){alert(e.message||'Não foi possível atualizar o registro.')}
  };

  setTimeout(()=>{if(CUR==='home')refreshVoiceBadgeV123()},300);
})();
