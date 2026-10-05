/* ===== V127 2026-10-04: Ritmo de captação + Ouça seu time + Dashboard FCA ===== */
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
    '.voiceAlertV123 .icon{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:#e83d43;color:#fff;font-size:20px;box-shadow:0 7px 14px rgba(214,47,52,.22)}.voiceAlertV123 b{display:block;font-size:14px}.voiceAlertV123 small{display:block;margin-top:4px;line-height:1.3;color:#a83a3f}.voicePendingV123{margin-top:7px;font-size:9px;font-weight:900;color:#9b5a00}.voiceAlertCtaV125{display:inline-flex;align-items:center;gap:6px;margin-top:9px;padding:8px 11px;border-radius:999px;background:#e83d43;color:#fff;font-size:10px;font-weight:950;letter-spacing:.01em;box-shadow:0 5px 12px rgba(210,40,48,.20);animation:voiceCtaPulseV125 1.8s ease-in-out infinite}.voiceAlertV123:hover .voiceAlertCtaV125,.voiceAlertV123:active .voiceAlertCtaV125{transform:scale(1.02)}@keyframes voiceCtaPulseV125{0%,100%{box-shadow:0 5px 12px rgba(210,40,48,.20);transform:scale(1)}50%{box-shadow:0 6px 18px rgba(210,40,48,.34);transform:scale(1.025)}}@media(prefers-reduced-motion:reduce){.voiceAlertCtaV125{animation:none!important}}',
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
    const alert=r.alert?'<div class=voiceAlertV123 role="button" tabindex="0" aria-label="Toque para registrar o impacto na sua captação" onclick="openVoiceSheetV123()" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();openVoiceSheetV123()}"><div class=icon>!</div><div><b>Atenção! Você está há '+num(r.zeroStreak)+' dias sem captar venda.</b><small>Registre o que impactou sua entrega e veja sugestões para recuperar o ritmo.</small><span class=voiceAlertCtaV125>👉 Toque aqui para registrar <b aria-hidden="true">→</b></span>'+voiceStatus+'</div><b aria-hidden="true">›</b></div>':'';
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
      '<div class=voiceCriticalV123><b>Você está há '+num(r.zeroStreak)+' dias sem captar venda.</b>Este registro ficará visível para o seu supervisor. O Speak eStore regional terá visão regional consolidada.</div>'+
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

  let VOICE_STATUS_V123='all',VOICE_STORE_V123='',VOICE_ITEMS_V123=[];
  let VOICE_PERIOD_V127='week',VOICE_ALL_V127=[],VOICE_FCA_V127=null;

  const dashStyleV127=document.createElement('style');
  dashStyleV127.id='voice-dashboard-v127-style';
  dashStyleV127.textContent=[
    '.voiceDashFiltersV127{display:grid;grid-template-columns:1fr 1fr;gap:9px}',
    '.voiceDashFilterV127{display:flex;align-items:center;gap:9px;background:#fff;border:1px solid #ddd9d0;border-radius:16px;padding:0 12px;min-height:52px}',
    '.voiceDashFilterV127 span{font-size:18px}.voiceDashFilterV127 label{display:block;font-size:8px;color:#7c8580;margin-bottom:1px}.voiceDashFilterV127 select{width:100%;border:0;background:transparent;color:#173F35;font-weight:900;font-size:12px;outline:0;padding:0}',
    '.voiceDashKpisV127{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}',
    '.voiceDashKpiV127{border-radius:18px;padding:13px 10px;min-height:105px;border:1px solid rgba(23,63,53,.07);display:flex;flex-direction:column;justify-content:space-between}',
    '.voiceDashKpiV127.red{background:linear-gradient(145deg,#fff0f0,#ffe6e7)}.voiceDashKpiV127.green{background:linear-gradient(145deg,#edf6f0,#e4f0e9)}.voiceDashKpiV127.gold{background:linear-gradient(145deg,#fff7e4,#f8edd1)}.voiceDashKpiV127.mint{background:linear-gradient(145deg,#eef8f5,#e4f3ee)}',
    '.voiceDashKpiV127 .ico{font-size:20px}.voiceDashKpiV127 span{font-size:9px;color:#46554f;line-height:1.2}.voiceDashKpiV127 b{font-size:24px;color:#173F35}.voiceDashKpiV127.red b{color:#d82e36}.voiceDashKpiV127 small{font-size:8px;color:#74807a;line-height:1.2}',
    '.voiceDashSectionV127{background:#fff;border:1px solid #e5e1d8;border-radius:20px;padding:14px;box-shadow:0 6px 18px rgba(23,63,53,.045)}',
    '.voiceDashTitleV127{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:11px}.voiceDashTitleV127 h3{margin:0;color:#173F35;font-size:16px}.voiceDashTitleV127 p{margin:2px 0 0;color:#7b8580;font-size:9px}.voiceDashLinkV127{border:0;background:#f4f1ea;color:#173F35;border-radius:999px;padding:7px 10px;font-size:9px;font-weight:900}',
    '.voiceRadarV127{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.voiceRadarCardV127{border-radius:15px;padding:11px;min-height:92px}.voiceRadarCardV127.red{background:#fff0f0}.voiceRadarCardV127.green{background:#edf6f0}.voiceRadarCardV127.gold{background:#fff7e6}.voiceRadarCardV127 span{display:block;font-size:9px;color:#66736d}.voiceRadarCardV127 b{display:block;margin-top:5px;color:#173F35;font-size:15px;line-height:1.12}.voiceRadarCardV127 small{display:block;margin-top:4px;color:#7c8580;font-size:8px;line-height:1.25}',
    '.voiceDashSplitV127{display:grid;grid-template-columns:.95fr 1.25fr;gap:10px}',
    '.voiceCauseRowV127{display:grid;grid-template-columns:105px 1fr 34px;gap:8px;align-items:center;margin:9px 0}.voiceCauseRowV127 label{font-size:9px;color:#3d4d47;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.voiceCauseBarV127{height:10px;background:#edf0ed;border-radius:999px;overflow:hidden}.voiceCauseBarV127 i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#1d6c57,#6ab49c)}.voiceCauseRowV127 b{font-size:9px;color:#173F35;text-align:right}',
    '.voicePriorityV127{display:grid;gap:8px}.voicePriorityItemV127{border-top:1px solid #eeeae3;padding-top:8px}.voicePriorityItemV127:first-child{border-top:0;padding-top:0}.voicePriorityTopV127{display:flex;align-items:center;gap:8px}.voicePriorityRankV127{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;background:#173F35;color:#fff;font-size:10px;font-weight:950}.voicePriorityTopV127 strong{flex:1;color:#173F35;font-size:11px}.voicePriorityTagV127{font-size:7px;font-weight:900;border-radius:999px;padding:5px 7px;background:#ffe7e7;color:#ce2830}.voicePriorityMetaV127{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin:7px 0 0 32px}.voicePriorityMetaV127 span{font-size:7px;color:#7b8580}.voicePriorityMetaV127 b{display:block;color:#173F35;font-size:10px;margin-top:2px}.voicePriorityMetaV127 .danger{color:#d82e36}',
    '.voiceInsightsV127{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.voiceInsightV127{border:1px solid #e4e1d9;border-radius:14px;padding:11px;background:#fff}.voiceInsightV127 span{font-size:18px}.voiceInsightV127 b{display:block;color:#173F35;font-size:10px;line-height:1.25;margin-top:5px}.voiceInsightV127 small{display:block;color:#7b8580;font-size:8px;line-height:1.3;margin-top:4px}',
    '.voiceTrendV127{width:100%;overflow:hidden}.voiceTrendV127 svg{width:100%;height:auto;display:block}.voiceTrendLegendV127{display:flex;justify-content:flex-end;gap:12px;margin:-2px 0 5px;font-size:8px;color:#64716b}.voiceTrendLegendV127 i{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:4px}.voiceTrendLegendV127 .a{background:#173F35}.voiceTrendLegendV127 .b{background:#DE7C00}',
    '.voiceRecordsHeadV127{display:flex;justify-content:space-between;align-items:center;margin-top:2px}.voiceRecordsHeadV127 h3{margin:0;color:#173F35;font-size:16px}.voiceRecordsHeadV127 span{font-size:9px;color:#7b8580}',
    '.voiceDashEmptyV127{padding:16px;border-radius:14px;background:#f7f5f0;color:#6c7772;font-size:10px;line-height:1.4}',
    '@media(max-width:620px){.voiceDashKpisV127{grid-template-columns:1fr 1fr}.voiceDashSplitV127{grid-template-columns:1fr}.voiceRadarV127{grid-template-columns:1fr 1fr}.voiceRadarCardV127:last-child{grid-column:1/-1}.voiceInsightsV127{grid-template-columns:1fr}.voiceDashFiltersV127{grid-template-columns:1fr 1fr}}',
    '@media(max-width:370px){.voiceDashFiltersV127{grid-template-columns:1fr}.voiceRadarV127{grid-template-columns:1fr}.voiceRadarCardV127:last-child{grid-column:auto}}'
  ].join('');
  document.head.appendChild(dashStyleV127);

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
    }catch(e){console.warn('[V127] badge Ouça seu time',e)}
  };

  const baseInitHomeV123=window.initHomeV34;
  if(typeof baseInitHomeV123==='function'){
    window.initHomeV34=initHomeV34=function(){
      const r=baseInitHomeV123.apply(this,arguments);
      setTimeout(refreshVoiceBadgeV123,80);
      return r;
    };
  }

  function isoLocalV127(d){
    d=d||new Date();
    try{
      const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Fortaleza',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);
      const m={};parts.forEach(p=>m[p.type]=p.value);
      return m.year+'-'+m.month+'-'+m.day;
    }catch(e){return d.toISOString().slice(0,10)}
  }
  function dateObjV127(s){return new Date(String(s)+'T12:00:00Z')}
  function addDaysV127(s,n){const d=dateObjV127(s);d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
  function weekStartV127(s){const d=dateObjV127(s),dow=d.getUTCDay()||7;return addDaysV127(s,1-dow)}
  function daysBetweenV127(a,b){return Math.round((dateObjV127(b)-dateObjV127(a))/86400000)}
  function rangeV127(period){
    const today=isoLocalV127(),day=+today.slice(8,10);
    if(period==='month'){
      const from=today.slice(0,7)+'-01',pmDate=dateObjV127(from);pmDate.setUTCMonth(pmDate.getUTCMonth()-1);
      const pStart=pmDate.toISOString().slice(0,7)+'-01',pmLast=new Date(Date.UTC(pmDate.getUTCFullYear(),pmDate.getUTCMonth()+1,0,12));
      const pTo=pmDate.getUTCFullYear()+'-'+String(pmDate.getUTCMonth()+1).padStart(2,'0')+'-'+String(Math.min(day,pmLast.getUTCDate())).padStart(2,'0');
      return {from,to:today,prevFrom:pStart,prevTo:pTo,label:'Mês'};
    }
    if(period==='30d'){
      return {from:addDaysV127(today,-29),to:today,prevFrom:addDaysV127(today,-59),prevTo:addDaysV127(today,-30),label:'30 dias'};
    }
    const from=weekStartV127(today),elapsed=daysBetweenV127(from,today);
    const prevFrom=addDaysV127(from,-7);
    return {from,to:today,prevFrom,prevTo:addDaysV127(prevFrom,elapsed),label:'Semana'};
  }
  function voiceStoreNameV127(st){
    const raw=String(COMMON?.stores?.[st]?.name||'').replace(/^L?\d{3}\s*[-–•:]?\s*/,'').trim();
    return raw?String(st)+' • '+raw:'Filial '+String(st);
  }
  function itemsInRangeV127(items,from,to){
    return (items||[]).filter(x=>{const d=String(x.created_at||'').slice(0,10);return d>=from&&d<=to});
  }
  function aggregateV127(items){
    const total=items.length,open=items.filter(x=>x.status!=='resolved').length,resolved=items.filter(x=>x.status==='resolved').length;
    const stores=[...new Set(items.map(x=>String(x.store_code||'')).filter(Boolean))];
    const collabs=[...new Set(items.filter(x=>(+x.zero_streak||0)>3).map(x=>String(x.matricula||'')).filter(Boolean))];
    const causes={};items.forEach(x=>{const k=String(x.cause_code||'outro');causes[k]=(causes[k]||0)+1});
    const causeRank=Object.entries(causes).sort((a,b)=>b[1]-a[1]);
    const byStore={};items.forEach(x=>{const st=String(x.store_code||'');if(!st)return;byStore[st]=byStore[st]||{count:0,causes:{},collabs:new Set(),maxZero:0};const q=byStore[st];q.count++;q.collabs.add(String(x.matricula||''));q.maxZero=Math.max(q.maxZero,+x.zero_streak||0);const k=String(x.cause_code||'outro');q.causes[k]=(q.causes[k]||0)+1});
    return {total,open,resolved,stores,collabs,rate:total?resolved/total:0,causeRank,byStore};
  }
  function deltaTextV127(cur,prev,type){
    if(type==='pp')return ((cur-prev)*100>=0?'↑ ':'↓ ')+Math.abs((cur-prev)*100).toLocaleString('pt-BR',{maximumFractionDigits:1})+' p.p.';
    if(prev===0)return cur===0?'—':'novo';
    const v=(cur/prev-1)*100;return (v>=0?'↑ ':'↓ ')+Math.abs(v).toLocaleString('pt-BR',{maximumFractionDigits:0})+'%';
  }
  function insightForCauseV127(k,stores){
    const names=(stores||[]).slice(0,2).map(x=>x.st).join(' e ');
    if(k==='abordagem')return {title:'Reforçar script de abordagem'+(names?' nas filiais '+names:''),detail:'Maior concentração de relatos ligada à abordagem e ativação do eStore.'};
    if(k==='instabilidade_app')return {title:'Consolidar chamados e evidências de instabilidade',detail:'Agrupar prints, horários e números de chamados para acelerar a tratativa sistêmica.'};
    if(k==='pagamento')return {title:'Mapear falhas de pagamento e alternativas',detail:'Identificar recorrência por meio de pagamento e orientar alternativas no atendimento.'};
    if(k==='cupom')return {title:'Reforçar regras de cupom e elegibilidade',detail:'Reduzir perda de venda por mecânica, vigência ou aplicação incorreta.'};
    if(k==='estoque_online')return {title:'Ampliar alternativas de sortimento online',detail:'Trabalhar cor, tamanho e categoria para preservar a oportunidade de venda.'};
    if(k==='outra_atividade')return {title:'Redistribuir foco operacional',detail:'Organizar janelas de atuação eStore nas lojas com maior dispersão.'};
    if(k==='escala_folga')return {title:'Cruzar alertas com escala e jornada',detail:'Separar oportunidade real de venda de dias sem atuação do colaborador.'};
    return {title:'Aprofundar escuta com o time',detail:'Usar os relatos para qualificar a causa raiz antes da próxima ação.'};
  }
  function causeLabelV127(k){return causeV123(k).label}
  function topCauseStoreV127(agg,st){
    const q=agg.byStore[String(st)]?.causes||{};
    const top=Object.entries(q).sort((a,b)=>b[1]-a[1])[0];
    return top?causeLabelV127(top[0]):'—';
  }
  function trendDataV127(items){
    const today=isoLocalV127(),currentStart=weekStartV127(today),weeks=[];
    for(let i=3;i>=0;i--){
      const from=addDaysV127(currentStart,-7*i),to=i===0?today:addDaysV127(from,6);
      const arr=itemsInRangeV127(items,from,to),collabs=new Set(arr.filter(x=>(+x.zero_streak||0)>3).map(x=>String(x.matricula||'')));
      weeks.push({from,to,records:arr.length,alerts:collabs.size});
    }
    return weeks;
  }
  function trendSvgV127(weeks){
    const max=Math.max(1,...weeks.flatMap(x=>[x.records,x.alerts])),xs=[34,116,198,280],y=v=>82-(v/max)*58;
    const ptsA=weeks.map((x,i)=>xs[i]+','+y(x.records)).join(' '),ptsB=weeks.map((x,i)=>xs[i]+','+y(x.alerts)).join(' ');
    const dotsA=weeks.map((x,i)=>'<circle cx="'+xs[i]+'" cy="'+y(x.records)+'" r="3.5" fill="#173F35"/>').join('');
    const dotsB=weeks.map((x,i)=>'<circle cx="'+xs[i]+'" cy="'+y(x.alerts)+'" r="3.5" fill="#DE7C00"/>').join('');
    const labels=weeks.map((x,i)=>'<text x="'+xs[i]+'" y="98" text-anchor="middle" font-size="7" fill="#77817d">S'+String(Math.ceil(((dateObjV127(x.from)-new Date(Date.UTC(dateObjV127(x.from).getUTCFullYear(),0,1,12)))/86400000+1)/7))+'</text>').join('');
    return '<div class=voiceTrendLegendV127><span><i class=a></i>Registros</span><span><i class=b></i>Colaboradores em alerta</span></div><div class=voiceTrendV127><svg viewBox="0 0 314 104" aria-label="Evolução das últimas quatro semanas"><line x1="24" y1="82" x2="294" y2="82" stroke="#e6e2da"/><line x1="24" y1="53" x2="294" y2="53" stroke="#f0ede7"/><line x1="24" y1="24" x2="294" y2="24" stroke="#f0ede7"/><polyline points="'+ptsA+'" fill="none" stroke="#173F35" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><polyline points="'+ptsB+'" fill="none" stroke="#DE7C00" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'+dotsA+dotsB+labels+'</svg></div>';
  }

  function dashboardHtmlV127(allItems,fca){
    const range=rangeV127(VOICE_PERIOD_V127),curItems=itemsInRangeV127(allItems,range.from,range.to),prevItems=itemsInRangeV127(allItems,range.prevFrom,range.prevTo);
    const cur=aggregateV127(curItems),prev=aggregateV127(prevItems),topCause=cur.causeRank[0],topCauseKey=topCause?topCause[0]:'outro',topCausePct=cur.total&&topCause?topCause[1]/cur.total:0;
    const impactStores=Object.entries(cur.byStore).sort((a,b)=>b[1].count-a[1].count);
    let priority=(Array.isArray(fca?.prioritized)?fca.prioritized:[]).filter(x=>isAdmin()?(!VOICE_STORE_V123||String(x.st)===VOICE_STORE_V123):String(x.st)===String(U?.u?.st||''));
    const usesFca=priority.length>0;
    if(!priority.length){
      priority=impactStores.slice(0,3).map(([st,q],i)=>({st,share:null,dispersion:null,priority_rank:i+1,priority_status:'sinal_time',_voice:q}));
    }
    const biggest=usesFca?priority[0]:(impactStores[0]?{st:impactStores[0][0]}:null),biggestLabel=biggest?voiceStoreNameV127(biggest.st):'Sem sinalização';
    const opportunity=insightForCauseV127(topCauseKey,priority);
    const causeRows=cur.causeRank.slice(0,6).map(([k,n])=>{
      const pct=cur.total?n/cur.total:0;
      return '<div class=voiceCauseRowV127><label>'+esc(causeLabelV127(k))+'</label><div class=voiceCauseBarV127><i style="width:'+Math.max(4,pct*100)+'%"></i></div><b>'+Math.round(pct*100)+'%</b></div>';
    }).join('')||'<div class=voiceDashEmptyV127>Os motivos começarão a aparecer conforme os colaboradores registrarem os impactos.</div>';

    const priorityRows=priority.slice(0,5).map((x,i)=>{
      const st=String(x.st),cause=topCauseStoreV127(cur,st),tag=usesFca?(x.priority_status==='critico'?'Priorizar':'Acompanhar'):'Sinal do time';
      return '<div class=voicePriorityItemV127><div class=voicePriorityTopV127><span class=voicePriorityRankV127>'+(i+1)+'</span><strong>'+esc(voiceStoreNameV127(st))+'</strong><span class=voicePriorityTagV127>'+tag+'</span></div>'+
        '<div class=voicePriorityMetaV127><span>Share<b>'+(x.share==null?'—':(+x.share*100).toLocaleString('pt-BR',{maximumFractionDigits:2})+'%')+'</b></span><span>% zerados<b class=danger>'+(x.dispersion==null?'—':(+x.dispersion*100).toLocaleString('pt-BR',{maximumFractionDigits:0})+'%')+'</b></span><span>Causa principal<b>'+esc(cause)+'</b></span></div></div>';
    }).join('')||'<div class=voiceDashEmptyV127>Nenhuma filial priorizada ou sinalizada neste período.</div>';

    const topStoresForInsight=priority.slice(0,2);
    const insight1=insightForCauseV127(topCauseKey,topStoresForInsight);
    const systemic=curItems.filter(x=>['instabilidade_app','pagamento','cupom','estoque_online'].includes(String(x.cause_code))).length;
    const insight2=systemic>0?{title:'Consolidar '+systemic+' relato'+(systemic===1?'':'s')+' de impacto sistêmico',detail:'Usar evidências e recorrência por filial para qualificar chamados e escalonamentos.'}:{title:'Manter leitura das causas sistêmicas',detail:'Acompanhar App, pagamento, cupom e estoque online mesmo sem concentração relevante.'};
    const highDisp=(Array.isArray(fca?.stores)?fca.stores:[]).filter(x=>(+x.dispersion||0)>=.5).sort((a,b)=>b.dispersion-a.dispersion);
    const insight3=highDisp.length?{title:'Atuar na dispersão de '+highDisp.slice(0,2).map(x=>x.st).join(' e '),detail:'Mais de 50% da base está zerada; combinar meta individual, abordagem e acompanhamento.'}:{title:'Sustentar ritmo e reduzir recorrência',detail:'Priorizar os colaboradores que voltam a aparecer com sequência superior a 3 dias sem captar.'};

    const weeks=trendDataV127(allItems);
    const compareLabel=VOICE_PERIOD_V127==='week'?'vs. semana anterior':'vs. período anterior';

    return '<div class=voiceDashFiltersV127>'+
      '<div class=voiceDashFilterV127><span>🗓️</span><div style="flex:1"><label>Período</label><select onchange="setVoicePeriodV127(this.value)"><option value=week '+(VOICE_PERIOD_V127==='week'?'selected':'')+'>Semana</option><option value=month '+(VOICE_PERIOD_V127==='month'?'selected':'')+'>Mês</option><option value=30d '+(VOICE_PERIOD_V127==='30d'?'selected':'')+'>Últimos 30 dias</option></select></div></div>'+
      '<div class=voiceDashFilterV127><span>📍</span><div style="flex:1"><label>Visão</label>'+(isAdmin()?'<select onchange="setVoiceStoreV123(this.value)"><option value="">CE+PI • Todas as filiais</option>'+Object.keys(COMMON?.stores||{}).sort().map(st=>'<option value="'+esc(st)+'" '+(VOICE_STORE_V123===st?'selected':'')+'>'+esc(voiceStoreNameV127(st))+'</option>').join('')+'</select>':'<div style="font-size:12px;font-weight:900;color:#173F35">'+esc(voiceStoreNameV127(U?.u?.st||''))+'</div>')+'</div></div>'+
    '</div>'+
    '<div class=voiceDashKpisV127>'+
      '<div class="voiceDashKpiV127 red"><div><span class=ico>📄</span><span>Registros abertos</span></div><b>'+num(cur.open)+'</b><small>'+deltaTextV127(cur.open,prev.open)+' • '+compareLabel+'</small></div>'+
      '<div class="voiceDashKpiV127 green"><div><span class=ico>🏬</span><span>Filiais impactadas</span></div><b>'+num(cur.stores.length)+'</b><small>'+deltaTextV127(cur.stores.length,prev.stores.length)+' • '+compareLabel+'</small></div>'+
      '<div class="voiceDashKpiV127 gold"><div><span class=ico>👥</span><span>Colaboradores em alerta</span></div><b>'+num(cur.collabs.length)+'</b><small>'+deltaTextV127(cur.collabs.length,prev.collabs.length)+' • '+compareLabel+'</small></div>'+
      '<div class="voiceDashKpiV127 mint"><div><span class=ico>✅</span><span>% tratativas concluídas</span></div><b>'+Math.round(cur.rate*100)+'%</b><small>'+deltaTextV127(cur.rate,prev.rate,'pp')+' • '+compareLabel+'</small></div>'+
    '</div>'+
    '<section class=voiceDashSectionV127><div class=voiceDashTitleV127><div><h3>🎯 Radar FCA da semana</h3><p>Principais sinais da escuta para complementar foco, causa e ação.</p></div><button class=voiceDashLinkV127 onclick="go(\'fca\')">Ver FCA →</button></div>'+
      '<div class=voiceRadarV127><div class="voiceRadarCardV127 red"><span>Top causa</span><b>'+esc(topCause?causeLabelV127(topCauseKey):'Sem registros')+'</b><small>'+(topCause?Math.round(topCausePct*100)+'% dos registros do período':'Aguardando registros')+'</small></div><div class="voiceRadarCardV127 green"><span>Maior impacto</span><b>'+esc(biggestLabel)+'</b><small>'+(usesFca?'Loja Priorizada pela leitura FCA semanal':'Maior concentração de relatos do time')+'</small></div><div class="voiceRadarCardV127 gold"><span>Oportunidade</span><b>'+esc(opportunity.title)+'</b><small>'+esc(opportunity.detail)+'</small></div></div>'+
    '</section>'+
    '<div class=voiceDashSplitV127>'+
      '<section class=voiceDashSectionV127><div class=voiceDashTitleV127><div><h3>📊 Principais causas</h3><p>% dos registros no período selecionado.</p></div></div>'+causeRows+'</section>'+
      '<section class=voiceDashSectionV127><div class=voiceDashTitleV127><div><h3>🏬 '+(usesFca?'Filiais priorizadas':'Filiais sinalizadas pelo time')+'</h3><p>'+(usesFca?'Priorização oficial do FCA com complemento da escuta.':'Sinalização de escuta; não substitui a priorização FCA.')+'</p></div><button class=voiceDashLinkV127 onclick="go(\'fca\')">Ver todas →</button></div><div class=voicePriorityV127>'+priorityRows+'</div></section>'+
    '</div>'+
    '<section class=voiceDashSectionV127><div class=voiceDashTitleV127><div><h3>💡 Insights para tratativa</h3><p>Ações recomendadas a partir dos dados da escuta + FCA.</p></div></div><div class=voiceInsightsV127>'+
      '<div class=voiceInsightV127><span>💬</span><b>'+esc(insight1.title)+'</b><small>'+esc(insight1.detail)+'</small></div>'+
      '<div class=voiceInsightV127><span>📋</span><b>'+esc(insight2.title)+'</b><small>'+esc(insight2.detail)+'</small></div>'+
      '<div class=voiceInsightV127><span>👥</span><b>'+esc(insight3.title)+'</b><small>'+esc(insight3.detail)+'</small></div>'+
    '</div></section>'+
    '<section class=voiceDashSectionV127><div class=voiceDashTitleV127><div><h3>📈 Evolução semanal</h3><p>Registros e colaboradores em alerta • últimas 4 semanas.</p></div></div>'+trendSvgV127(weeks)+'</section>';
  }

  window.listenTeamV123=function(){
    if(!isLead())return '<div class=notice>Acesso exclusivo para supervisores e gestores.</div>';
    return '<div class=voicePageV123>'+
      '<section class=voiceHeroV123><h2>Ouça seu time <span id=voicePageBadgeV123 class=voiceBadgeV123 style="position:static;vertical-align:middle"></span></h2><p>'+(isAdmin()?'Dashboard consolidado CE+PI para insights, causas e tratativas da regional.':'Dashboard da filial para transformar a escuta do time em causas e ações objetivas.')+'</p></section>'+
      '<div id=voiceDashboardV127><div class=card><div class=muted>Construindo dashboard...</div></div></div>'+
      '<div class=voiceRecordsHeadV127><h3>Registros do time</h3><span>Detalhamento e acompanhamento</span></div>'+
      '<div class=voiceTabsV123><button class="'+(VOICE_STATUS_V123==='open'?'on':'')+'" onclick="setVoiceStatusV123(\'open\')">Aguardando</button><button class="'+(VOICE_STATUS_V123==='resolved'?'on':'')+'" onclick="setVoiceStatusV123(\'resolved\')">Resolvidos</button><button class="'+(VOICE_STATUS_V123==='all'?'on':'')+'" onclick="setVoiceStatusV123(\'all\')">Todos</button></div>'+
      '<div id=voiceTeamBodyV123><div class=card><div class=muted>Carregando registros...</div></div></div>'+
    '</div>';
  };

  window.setVoicePeriodV127=function(v){
    VOICE_PERIOD_V127=['week','month','30d'].includes(String(v))?String(v):'week';
    loadVoiceTeamV123();
  };
  window.setVoiceStatusV123=function(v){
    VOICE_STATUS_V123=v;
    document.querySelectorAll('.voiceTabsV123 button').forEach(function(b,i){
      const key=i===0?'open':i===1?'resolved':'all';
      b.classList.toggle('on',key===VOICE_STATUS_V123);
    });
    renderVoiceRecordsV127();
  };
  window.setVoiceStoreV123=function(v){
    VOICE_STORE_V123=String(v||'');
    loadVoiceTeamV123();
  };

  function renderVoiceRecordsV127(){
    const body=document.getElementById('voiceTeamBodyV123');if(!body)return;
    const range=rangeV127(VOICE_PERIOD_V127);
    let arr=itemsInRangeV127(VOICE_ALL_V127,range.from,range.to);
    if(VOICE_STATUS_V123==='open')arr=arr.filter(x=>x.status!=='resolved');
    else if(VOICE_STATUS_V123==='resolved')arr=arr.filter(x=>x.status==='resolved');
    VOICE_ITEMS_V123=arr;
    const s={pending:arr.filter(x=>x.status==='pending').length,reviewed:arr.filter(x=>x.status==='reviewed').length,resolved:arr.filter(x=>x.status==='resolved').length};
    const cards=arr.map(item=>{
      const cc=causeV123(item.cause_code),resolved=item.status==='resolved';
      return '<article class="voiceItemV123 '+(resolved?'resolved':'')+'">'+
        '<div class=voiceItemTopV123><span class=voiceDotV123></span><div><h4>'+esc(item.collaborator_name||('Matrícula '+item.matricula))+'</h4><div class=meta>'+esc(voiceStoreNameV127(item.store_code))+' • '+fmtDateV123(String(item.created_at||'').slice(0,10))+' • '+statusLabelV123(item.status)+'</div></div><div class=voiceDaysV123>'+num(item.zero_streak)+' dias<br><span style="font-size:9px;font-weight:700">sem captar</span></div></div>'+
        '<span class=voiceReasonV123>'+cc.icon+' '+esc(cc.label)+'</span>'+
        '<p>'+esc(item.cause_detail||'')+'</p>'+
        (item.action_plan?'<p><b>Ação informada:</b> '+esc(item.action_plan)+'</p>':'')+
        '<div class=voiceActionsV123><button onclick="openVoiceItemV123(\''+item.id+'\')">'+(resolved?'Ver registro':'Ver / tratar')+'</button></div>'+
      '</article>';
    }).join('');
    body.innerHTML='<div class=voiceKpisV123><div class="voiceKpiV123 danger"><span>Aguardando</span><b>'+num(s.pending)+'</b></div><div class=voiceKpiV123><span>Em análise</span><b>'+num(s.reviewed)+'</b></div><div class=voiceKpiV123><span>Resolvidos</span><b>'+num(s.resolved)+'</b></div></div>'+
      '<div class=voiceListV123 style="margin-top:10px">'+(cards||'<div class=card><div class=muted>Nenhum registro neste filtro.</div></div>')+'</div>';
  }

  window.loadVoiceTeamV123=async function(){
    if(!isLead())return;
    const dash=document.getElementById('voiceDashboardV127'),body=document.getElementById('voiceTeamBodyV123');
    if(dash)dash.innerHTML='<div class=card><div class=muted>Atualizando dashboard...</div></div>';
    if(body)body.innerHTML='<div class=card><div class=muted>Atualizando registros...</div></div>';
    try{
      const range=rangeV127(VOICE_PERIOD_V127),trendStart=addDaysV127(weekStartV127(range.to),-21),
            fetchFrom=[range.from,range.prevFrom,trendStart].sort()[0];
      const jobs=[
        api({action:'voice_list',matricula:U.u.id,status:'all',store:VOICE_STORE_V123,from:fetchFrom,to:range.to,limit:1000}),
        api({action:'fca_dashboard',matricula:U.u.id}).catch(e=>({ok:false,error:e.message||'FCA indisponível'}))
      ];
      const out=await Promise.all(jobs),j=out[0],fca=out[1];
      VOICE_ALL_V127=Array.isArray(j.items)?j.items:[];
      VOICE_FCA_V127=fca&&fca.ok!==false?fca:null;
      if(dash)dash.innerHTML=dashboardHtmlV127(VOICE_ALL_V127,VOICE_FCA_V127);
      renderVoiceRecordsV127();
      refreshVoiceBadgeV123();
    }catch(e){
      if(dash)dash.innerHTML='<div class=notice danger>Não foi possível consolidar o dashboard: '+esc(e.message||'erro')+'</div>';
      if(body)body.innerHTML='<div class=notice danger>Não foi possível carregar os registros.</div>';
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
      '<div class=voiceFieldV123><label>Retorno do supervisor / Speak eStore regional</label><textarea id=voiceSupervisorNoteV123 maxlength=1500 placeholder="Registre orientação, alinhamento ou acompanhamento...">'+esc(item.supervisor_note||'')+'</textarea></div>'+
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
