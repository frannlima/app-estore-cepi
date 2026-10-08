(function(){
  "use strict";

  const params=new URLSearchParams(location.search);
  const source=params.get("from");
  const target=params.get("open");
  if(source!=="meu-acompanhamento"||!target) return;

  let handoff=null;
  try{handoff=JSON.parse(localStorage.getItem("meu_acompanhamento_session")||"null")}catch(_){}

  // Prioriza a identidade que acabou de acessar o Meu Acompanhamento.
  if(handoff?.matricula){
    try{
      localStorage.setItem("estorePersistSession",JSON.stringify({type:"user",id:String(handoff.matricula)}));
    }catch(_){}
  }

  const routeMap={home:"home",hourly:"hourly",metas:"metas",regional:"hourly"};

  function hasUser(){
    try{return typeof U!=="undefined"&&!!U?.u?.id}catch(_){return false}
  }

  function cleanUrl(){
    try{
      const url=new URL(location.href);
      url.searchParams.delete("from");
      url.searchParams.delete("open");
      history.replaceState(null,"",url.pathname+(url.search?url.search:"")+url.hash);
    }catch(_){}
  }

  function openTarget(){
    const route=routeMap[target]||"home";
    if(typeof go!=="function") return false;
    go(route);
    if(target==="regional"){
      setTimeout(()=>{
        try{
          const details=document.getElementById("hourDetails");
          if(details) details.classList.remove("hide");
          const dash=document.querySelector(".hourDash");
          if(dash) dash.scrollIntoView({behavior:"smooth",block:"start"});
        }catch(_){}
      },450);
    }
    cleanUrl();
    return true;
  }

  async function ensureIntegratedAccess(){
    // A restauração nativa do eStore começa logo após o DOMContentLoaded.
    for(let i=0;i<36;i++){
      if(hasUser()){
        openTarget();
        return;
      }
      await new Promise(r=>setTimeout(r,100));
    }

    // Fallback: usa a matrícula já validada no Meu Acompanhamento.
    if(handoff?.matricula && typeof login==="function"){
      const input=document.getElementById("mat");
      if(input) input.value=String(handoff.matricula);
      try{
        await login();
        if(hasUser()) openTarget();
      }catch(e){
        console.warn("Integração Meu Acompanhamento → eStore",e);
      }
    }
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",()=>setTimeout(ensureIntegratedAccess,180),{once:true});
  }else{
    setTimeout(ensureIntegratedAccess,180);
  }
})();