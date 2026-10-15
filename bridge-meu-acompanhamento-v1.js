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

  // Só oferece retorno contextual quando a sessão chegou pelo Meu Acompanhamento.
  // Faixa no fluxo do layout: não cobre os dados durante a rolagem.
  const linkedEntry=source==="meu-acompanhamento";
  function mountReturnBar(){
    const old=document.getElementById("backMeuAcompanhamentoV2");
    if(old)old.remove();
    if(!linkedEntry)return;
    const view=document.getElementById("view");
    if(!view||!view.parentElement)return;
    if(document.getElementById("maReturnBarV3"))return;
    if(!document.getElementById("maReturnStyleV3")){
      const style=document.createElement("style");
      style.id="maReturnStyleV3";
      style.textContent=[
        "#maReturnBarV3{box-sizing:border-box;position:sticky;top:0;z-index:90;"+
          "display:flex;align-items:center;justify-content:space-between;gap:12px;"+
          "padding:7px 14px;min-height:48px;background:#173F35;color:#fff;"+
          "border-bottom:1px solid rgba(255,255,255,.14)}",
        "#maReturnBarV3 *{box-sizing:border-box}",
        "#maReturnBarV3 .ma-return-action{display:inline-flex;align-items:center;gap:7px;"+
          "min-height:34px;padding:7px 12px;max-width:calc(100% - 112px);"+
          "border:1px solid rgba(255,255,255,.26);border-radius:999px;"+
          "background:rgba(255,255,255,.09);color:#fff;font:700 12px/1.2 system-ui,Arial,sans-serif;"+
          "white-space:nowrap;cursor:pointer}",
        "#maReturnBarV3 .ma-return-action:focus-visible{outline:2px solid #FF9B13;outline-offset:3px}",
        "#maReturnBarV3 .ma-return-arrow{font-size:16px;font-weight:600;line-height:1}",
        "#maReturnBarV3 .ma-return-brand{max-width:95px;width:24%;max-height:23px;object-fit:contain}",
        "@media(max-width:380px){#maReturnBarV3{padding:6px 10px;min-height:46px;gap:6px}"+
          "#maReturnBarV3 .ma-return-action{font-size:11px;padding:7px 9px;max-width:calc(100% - 86px)}"+
          "#maReturnBarV3 .ma-return-brand{max-width:79px}}"
      ].join("\n");
      document.head.appendChild(style);
    }
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

  // Remover APENAS o botão branco "Voltar" que flutua no canto inferior
  // (caso seja produzido por outras rotinas do app). Nunca remover a navegação
  // nativa do rodapé nem botões "Voltar" de páginas ou modais.
  function dismissLegacyFloatingBack(){
    if(!linkedEntry)return;
    const candidates=document.querySelectorAll("button,a,[role='button']");
    for(const button of candidates){
      if(button.closest("#maReturnBarV3"))continue;
      const title=String(button.textContent||button.getAttribute("aria-label")||"")
        .replace(/\s+/g," ").trim();
      if(!/^(?:←|↩|⟵|‹)?\s*Voltar$/i.test(title))continue;
      let fixed=null,node=button;
      for(let i=0;i<5&&node;i++,node=node.parentElement){
        if(getComputedStyle(node).position==="fixed"){fixed=node;break;}
      }
      if(!fixed)continue;
      const rect=button.getBoundingClientRect();
      if(!rect.width||!rect.height)continue;
      const nearBottom=rect.bottom>window.innerHeight-320&&rect.top>window.innerHeight*.45;
      const nearRight=rect.right>window.innerWidth*.55;
      if(!nearBottom||!nearRight)continue;
      const wrapper=fixed!==button&&fixed.querySelectorAll("button,a,[role='button']").length===1?fixed:button;
      wrapper.remove();
    }
  }
  let cleanupFrame=0;
  function scheduleReturnLayout(){
    if(cleanupFrame)return;
    cleanupFrame=requestAnimationFrame(()=>{
      cleanupFrame=0;
      mountReturnBar();
      dismissLegacyFloatingBack();
    });
  }
  function enableReturnLayout(){
    if(!linkedEntry)return;
    scheduleReturnLayout();
    const observer=new MutationObserver(mutations=>{
      // Ignorar mudanças de texto e atributos: observar somente novas interfaces.
      if(mutations.some(m=>m.addedNodes.length||m.removedNodes.length))scheduleReturnLayout();
    });
    observer.observe(document.body,{childList:true,subtree:true});
    window.addEventListener("pageshow",scheduleReturnLayout);
    window.addEventListener("resize",scheduleReturnLayout,{passive:true});
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
