/* ===== V116 2026-10-04: alça retrátil da listagem Meu Time ===== */
(function(){
  'use strict';
  if(window.__TEAM_COLLAPSE_V116__)return;
  window.__TEAM_COLLAPSE_V116__=true;

  const baseRenderTeamV116=window.renderTeamV22;
  window.TEAM_LIST_COLLAPSED_V116=false;

  function ensureStyleV116(){
    if(document.getElementById('team-collapse-v116-style'))return;
    const st=document.createElement('style');
    st.id='team-collapse-v116-style';
    st.textContent=
      '.teamCollapseHandleV116{position:sticky;top:72px;z-index:12;margin:10px 0 8px;width:100%;border:0;border-radius:16px;background:#173F35;color:#fff;padding:9px 14px 11px;box-shadow:0 7px 20px rgba(23,63,53,.16);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font-weight:800;cursor:pointer;transition:.2s ease}'+
      '.teamCollapseHandleV116:active{transform:scale(.99)}'+
      '.teamHandleBarV116{display:block;width:46px;height:4px;border-radius:999px;background:rgba(255,255,255,.62)}'+
      '.teamHandleLabelV116{display:flex;align-items:center;justify-content:center;gap:8px;font-size:13px;line-height:1.1}'+
      '.teamHandleChevronV116{font-size:17px;line-height:1;transition:transform .2s ease}'+
      '.teamListBodyV116{overflow:hidden;max-height:20000px;opacity:1;transition:max-height .34s ease,opacity .2s ease,margin .25s ease}'+
      '.teamListBodyV116.isCollapsed{max-height:0!important;opacity:0;margin:0!important;pointer-events:none}'+
      '.teamCollapseHandleV116.isCollapsed{background:#466964;margin-bottom:12px}'+
      '.teamCollapseHintV116{font-size:10px;font-weight:600;opacity:.78}'+
      '@media(max-width:700px){.teamCollapseHandleV116{top:64px;border-radius:14px;padding:8px 12px 10px}.teamHandleLabelV116{font-size:12.5px}}';
    document.head.appendChild(st);
  }

  function shownCountV116(fragment){
    return (String(fragment||'').match(/class="teamrow\b/g)||[]).length;
  }

  function injectCollapsibleV116(html){
    if(typeof html!=='string'||html.includes('teamCollapseHandleV116'))return html;
    const re=/<div class=title style="margin-top:20px">(Colaboradores zerados|Colaboradores com venda|Equipe)<\/div>/;
    const m=html.match(re);
    if(!m)return html;
    const titleEnd=(m.index||0)+m[0].length;
    let dash='';
    try{dash=typeof teamDashboardButton==='function'?teamDashboardButton():''}catch(e){}
    let dashAt=dash?html.lastIndexOf(dash):-1;
    if(dashAt<0)dashAt=html.lastIndexOf('<div class=teamReportBar>');
    if(dashAt<0||dashAt<=titleEnd)return html;

    const listHtml=html.slice(titleEnd,dashAt),count=shownCountV116(listHtml);
    const collapsed=!!window.TEAM_LIST_COLLAPSED_V116;
    const handle=
      '<button type="button" class="teamCollapseHandleV116 '+(collapsed?'isCollapsed':'')+'" onclick="toggleTeamListV116()" aria-expanded="'+(!collapsed)+'" aria-controls="teamListBodyV116">'+
        '<span class=teamHandleBarV116></span>'+
        '<span class=teamHandleLabelV116><span id=teamHandleChevronV116 class=teamHandleChevronV116>'+(collapsed?'⌄':'⌃')+'</span><span id=teamHandleTextV116>'+(collapsed?'Mostrar equipe':'Recolher equipe')+(count?' • '+count+' colaboradores':'')+'</span></span>'+
        '<span class=teamCollapseHintV116>'+(collapsed?'Toque para abrir a listagem':'Toque para recolher e acessar o compartilhamento')+'</span>'+
      '</button>'+
      '<div id=teamListBodyV116 class="teamListBodyV116 '+(collapsed?'isCollapsed':'')+'">'+listHtml+'</div>';

    return html.slice(0,titleEnd)+handle+html.slice(dashAt);
  }

  window.toggleTeamListV116=function(){
    const body=document.getElementById('teamListBodyV116'),
          btn=document.querySelector('.teamCollapseHandleV116'),
          text=document.getElementById('teamHandleTextV116'),
          chev=document.getElementById('teamHandleChevronV116');
    if(!body||!btn)return;
    const collapse=!body.classList.contains('isCollapsed');
    window.TEAM_LIST_COLLAPSED_V116=collapse;
    body.classList.toggle('isCollapsed',collapse);
    btn.classList.toggle('isCollapsed',collapse);
    btn.setAttribute('aria-expanded',String(!collapse));

    const count=(body.querySelectorAll('.teamrow')||[]).length;
    if(text)text.textContent=(collapse?'Mostrar equipe':'Recolher equipe')+(count?' • '+count+' colaboradores':'');
    if(chev)chev.textContent=collapse?'⌄':'⌃';
    const hint=btn.querySelector('.teamCollapseHintV116');
    if(hint)hint.textContent=collapse?'Toque para abrir a listagem':'Toque para recolher e acessar o compartilhamento';

    if(collapse){
      setTimeout(()=>{
        const target=document.querySelector('.teamReportBar');
        if(target)target.scrollIntoView({behavior:'smooth',block:'center'});
      },220);
    }
  };

  window.renderTeamV22=function(j){
    ensureStyleV116();
    const html=typeof baseRenderTeamV116==='function'?baseRenderTeamV116(j):'';
    if(TEAM_SCOPE==='regional')return html;
    return injectCollapsibleV116(html);
  };

  ensureStyleV116();
})();