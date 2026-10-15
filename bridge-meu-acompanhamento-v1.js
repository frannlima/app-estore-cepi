/* MEU-ACOMPANHAMENTO-BRIDGE-V2 */
(function(){
  "use strict";
  if(window.__meuAcompanhamentoBridgeV2) return;
  window.__meuAcompanhamentoBridgeV2=true;

  const MAIN_URL="https://frannlima.github.io/meu-acompanhamento/";
  const params=new URLSearchParams(location.search);
  const source=params.get("from");
  const target=params.get("open")||null;

  let handoff=null;
  try{handoff=JSON.parse(localStorage.getItem("meu_acompanhamento_session")||"null")}catch(_){}

  if(source==="meu-acompanhamento"){
    try{sessionStorage.setItem("estore_entry_source","meu-acompanhamento")}catch(_){}
  }

  // Reutiliza somente a matrícula já autenticada no Meu Acompanhamento.
  // O login() nativo do eStore continua validando essa identidade na API oficial.
  if(source==="meu-acompanhamento" && handoff?.matricula){
    try{
      localStorage.setItem("estorePersistSession",JSON.stringify({type:"user",id:String(handoff.matricula)}));
    }catch(_){}
  }

  // Persistir a origem também após o redirecionamento remover "?from=" da URL.
  // A chave é de sessão da aba: o acesso direto em uma nova aba não ganha
  // controles de retorno desnecessários.
  const linkedEntry=source==="meu-acompanhamento" || (()=>{
    try{return sessionStorage.getItem("estore_entry_source")==="meu-acompanhamento";}catch(_){return false;}
  })();

  function ensureReturnStyle(){
    if(document.getElementById("maReturnStyleV3"))return;
    const style=document.createElement("style");
    style.id="maReturnStyleV3";
    style.textContent=[
      // Legado: não permitir que o botão grande volte a ficar sobre o conteúdo.
      "#backMeuAcompanhamentoV2{display:none!important}",
      // Barra inserida no fluxo, sem position:fixed nem sticky. Rola com a página.
      "#maReturnBarV3{box-sizing:border-box;position:relative!important;top:auto!important;z-index:1;"+
        "display:flex;align-items:center;justify-content:space-between;gap:10px;"+
        "width:100%;padding:7px 13px;min-height:44px;"+
        "background:#173F35;color:#fff;border-bottom:1px solid rgba(255,255,255,.15)}",
      "#maReturnBarV3 *{box-sizing:border-box}",
      "#maReturnBarV3 .ma-return-action{display:inline-flex;align-items:center;gap:7px;"+
        "min-height:30px;padding:6px 10px;max-width:calc(100% - 92px);"+
        "border:1px solid rgba(255,255,255,.24);border-radius:999px;"+
        "background:rgba(255,255,255,.08);color:#fff;"+
        "font:700 11px/1.2 system-ui,Arial,sans-serif;white-space:nowrap;cursor:pointer}",
      "#maReturnBarV3 .ma-return-action:focus-visible{outline:2px solid #FF9B13;outline-offset:3px}",
      "#maReturnBarV3 .ma-return-arrow{font-size:15px;font-weight:600;line-height:1}",
      "#maReturnBarV3 .ma-return-brand{width:84px;max-height:22px;object-fit:contain}",
      "@media(max-width:380px){#maReturnBarV3{padding:6px 10px;gap:6px}"+
        "#maReturnBarV3 .ma-return-action{font-size:10px;padding:6px 9px;max-width:calc(100% - 79px)}"+
        "#maReturnBarV3 .ma-return-brand{width:75px}}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function mountReturnBar(){
    document.getElementById("backMeuAcompanhamentoV2")?.remove();
    if(!linkedEntry)return;
    const view=document.getElementById("view");
    if(!view?.parentElement||document.getElementById("maReturnBarV3"))return;
    ensureReturnStyle();
    const row=document.createElement("div");
    row.id="maReturnBarV3";
    row.setAttribute("aria-label","Retorno ao Meu Acompanhamento");
    row.innerHTML='<button type="button" class="ma-return-action" aria-label="Voltar para Meu Acompanhamento">'+
      '<span class="ma-return-arrow" aria-hidden="true">←</span>'+
      '<span>Meu Acompanhamento</span></button>'+
      '<img class="ma-return-brand" src="./assets/riachuelo-logo-horizontal-oficial-white-v133.svg" alt="Riachuelo">';
    row.querySelector("button").addEventListener("click",()=>{location.href=MAIN_URL;});
    view.parentElement.insertBefore(row,view);
  }

  // Remover o controle EXTRA "← Voltar" sobreposto ao conteúdo, independente
  // de o CSS legado usar position:fixed, sticky, absolute ou um contêiner.
  // Não alterar menus de navegação e botões Voltar dentro de modais/formulários.
  function dismissObstructingBack(){
    document.getElementById("backMeuAcompanhamentoV2")?.remove();
    const width=window.innerWidth||document.documentElement.clientWidth;
    const height=window.innerHeight||document.documentElement.clientHeight;
    document.querySelectorAll("button,a,[role='button']").forEach(button=>{
      if(button.closest("#maReturnBarV3,nav,#nav,.bottom,[role='dialog'],[aria-modal='true']"))return;
      const label=String(button.textContent||button.getAttribute("aria-label")||"")
        .replace(/[\u2190\u21a9\u27f5\u2039]/g,"").replace(/\s+/g," ").trim();
      if(!/^voltar$/i.test(label))return;
      const rect=button.getBoundingClientRect();
      if(!rect.width||!rect.height)return;
      const atBottomRight=rect.left>width*.52 && rect.right>width*.77 &&
        rect.top>height*.55 && rect.bottom>height*.67;
      if(!atBottomRight)return;
      let fixedContainer=null;
      for(let node=button,level=0;node&&level<7;node=node.parentElement,level++){
        const position=getComputedStyle(node).position;
        if(position==="fixed"||position==="sticky"){fixedContainer=node;break;}
      }
      // A sobreposição foi confirmada pela posição inferior direita. Não
      // depender apenas de position:fixed: alguns temas usam absolute.
      const container=fixedContainer&&fixedContainer!==button&&
        fixedContainer.querySelectorAll("button,a,[role='button']").length===1
          ?fixedContainer:button;
      container.remove();
    });
  }

  let pendingScan=false;
  function scanReturnLayout(){
    if(pendingScan)return;
    pendingScan=true;
    requestAnimationFrame(()=>{
      pendingScan=false;
      mountReturnBar();
      dismissObstructingBack();
    });
  }
  function enableReturnLayout(){
    ensureReturnStyle();
    scanReturnLayout();
    const observer=new MutationObserver(mutations=>{
      if(mutations.some(m=>m.addedNodes.length||m.removedNodes.length))scanReturnLayout();
    });
    observer.observe(document.body,{childList:true,subtree:true});
    window.addEventListener("pageshow",scanReturnLayout);
    window.addEventListener("resize",scanReturnLayout,{passive:true});
    // Alguns componentes só surgem ao rolar/abrir menus, sem novos nós no DOM.
    document.addEventListener("scroll",scanReturnLayout,{passive:true});
    setInterval(scanReturnLayout,3500);
  }

  function userReady(){
    try{return typeof U!=="undefined"&&!!U?.u?.id}catch(_){return false}
  }

  function cleanBridgeQuery(){
    try{
      const u=new URL(location.href);
      u.searchParams.delete("from");
      u.searchParams.delete("open");
      history.replaceState(null,"",u.pathname+(u.search||"")+u.hash);
    }catch(_){}
  }

  function openRequestedTarget(){
    if(!target || typeof go!=="function") return false;
    if(target==="metas") go("metas");
    else if(target==="hourly"||target==="regional") go("hourly");
    else go("home");

    if(target==="regional"){
      setTimeout(function(){
        try{
          const details=document.getElementById("hourDetails");
          if(details) details.classList.remove("hide");
          const dash=document.querySelector(".hourDash");
          if(dash) dash.scrollIntoView({behavior:"smooth",block:"start"});
        }catch(_){}
      },450);
    }
    cleanBridgeQuery();
    return true;
  }

  async function launch(){
    enableReturnLayout();

    if(source!=="meu-acompanhamento" || !target) return;

    // Primeiro aguarda a restauração nativa da sessão eStore.
    for(let i=0;i<45;i++){
      if(userReady()){
        openRequestedTarget();
        return;
      }
      await new Promise(r=>setTimeout(r,100));
    }

    // Fallback seguro: a matrícula é enviada ao login nativo e validada no backend eStore.
    if(handoff?.matricula && typeof login==="function"){
      try{
        const input=document.getElementById("mat");
        if(input) input.value=String(handoff.matricula);
        await login();
        if(userReady()) openRequestedTarget();
      }catch(e){
        console.warn("[Meu Acompanhamento → eStore]",e);
      }
    }
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",()=>setTimeout(launch,120),{once:true});
  }else{
    setTimeout(launch,120);
  }

  // Os dois aplicativos escrevem na mesma tabela oficial; emitir apenas sinal de atualização.
  function broadcastHourlyUpdate(){
    try{
      localStorage.setItem("estore_hourly_changed_v3",JSON.stringify({
        store:String(U?.u?.st||""),date:localIsoV4(),at:Date.now()
      }));
    }catch(_){}
  }
  function hourlyOpen(){
    return !document.hidden && !!document.getElementById("hourlyDashboardV5") &&
      typeof U!=="undefined" && !!U?.u?.id;
  }
  let lastSync=0;
  function refreshHourlyIfOpen(force=false){
    if(!hourlyOpen()||typeof window.loadHourlyV5!=="function")return;
    if(!force&&Date.now()-lastSync<30000)return;
    lastSync=Date.now();
    void window.loadHourlyV5();
  }
  if(typeof window.submitHourlyV5==="function"){
    const originalSubmit=window.submitHourlyV5;
    window.submitHourlyV5=async function(){
      const answer=await originalSubmit.apply(this,arguments);
      const message=document.getElementById("hourOutV5")?.textContent||"";
      if(/atualização adicionada ao acumulado/i.test(message))broadcastHourlyUpdate();
      return answer;
    };
  }
  window.addEventListener("storage",event=>{
    if(event.key==="estore_hourly_changed_v3")refreshHourlyIfOpen(true);
  });
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)refreshHourlyIfOpen(true)});
  window.addEventListener("focus",()=>refreshHourlyIfOpen(true));
  window.addEventListener("pageshow",()=>refreshHourlyIfOpen(true));
  setInterval(()=>refreshHourlyIfOpen(false),30000);

})();
