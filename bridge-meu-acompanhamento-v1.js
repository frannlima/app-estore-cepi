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

  function ensureBackButton(){
    let btn=document.getElementById("backMeuAcompanhamentoV2");
    if(btn) return btn;
    btn=document.createElement("button");
    btn.id="backMeuAcompanhamentoV2";
    btn.type="button";
    btn.setAttribute("aria-label","Voltar para Meu Acompanhamento");
    btn.innerHTML='<span aria-hidden="true">←</span><b>Meu Acompanhamento</b>';
    btn.style.cssText=[
      "position:fixed","left:max(10px,env(safe-area-inset-left))","top:max(10px,env(safe-area-inset-top))",
      "z-index:2147483000","display:flex","align-items:center","gap:7px","min-height:38px",
      "padding:7px 11px","border:1px solid rgba(255,255,255,.42)","border-radius:999px",
      "background:#173F35","color:#fff","font:700 11px Arial,sans-serif",
      "box-shadow:0 8px 22px rgba(23,63,53,.22)","cursor:pointer"
    ].join(";");
    btn.onclick=function(){location.href=MAIN_URL};
    document.body.appendChild(btn);
    return btn;
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
    ensureBackButton();

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
})();