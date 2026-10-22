/* eStore CE+PI | INTEGRACAO NATIVA V168 | 16/10/2026 */
(function(){
 'use strict';
 const ACTIVE_UNTIL='2026-11-10';
 const state=window.__campaignNative168||(window.__campaignNative168={active:false});
 function today(){
   const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Fortaleza',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
   const val=t=>parts.find(x=>x.type===t)?.value||'';
   return [val('year'),val('month'),val('day')].join('-');
 }
 function visible(){return today()<=ACTIVE_UNTIL;}
 function moduleReady(){return typeof window.renderCampaignPartialStandalone158==='function';}
 function moneyLocal(n){return Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
 function removePopups(){try{if(typeof window.closePop75==='function')window.closePop75();}catch(e){}try{document.getElementById('campaignPopupV37')?.remove()}catch(e){}}
 function showPanel(){
   const html=moduleReady()?window.renderCampaignPartialStandalone158():'<div class="card"><h3>Carregando o ranking da campanha…</h3><p>Os dados serão exibidos assim que a conexão for concluída.</p></div>';
   return '<div class="campaignPage75 cpNativePage168">'+
      '<div class="cpNativeToolbar168"><button type="button" onclick="campaignPartialBack168()">← Campanhas</button><span>🏆 PARCIAL NO VOLUME MÁXIMO</span></div>'+
      '<div id="cpPartial158">'+html+'</div></div>';
 }
 function featured(){
   return '<section class="cpNativeFeature168" role="region" aria-label="Parcial da campanha eStore">'+
     '<span class="cpNativeLive168">● PARCIAL DISPONÍVEL</span>'+
     '<h3>🏆 Já conferiu sua posição no Top 15?</h3>'+
     '<p>Você está aumentando o volume ou deixando seu prêmio para outro colaborador? Confira os 45 elegíveis, por porte, e descubra o seu próximo desafio.</p>'+
     '<button type="button" onclick="campaignPartialOpen168()">VER PARCIAL DA CAMPANHA →</button></section>';
 }
 function tab(){
   return '<button type="button" class="cpNativeTab168" onclick="campaignPartialOpen168()" aria-label="Parcial Top 15 da campanha eStore">'+
     '<strong>🏆</strong><span>Parcial Top 15</span></button>';
 }
 window.campaignPartialOpen168=function(){
   if(!visible())return;
   state.active=true;
   removePopups();
   if(typeof go==='function')go('campaigns');
   if(typeof window.loadCampaignSnapshot165==='function')window.loadCampaignSnapshot165(true).catch(e=>console.warn('[Campanha] parcial:',e));
 };
 window.campaignPartialBack168=function(){
   state.active=false;
   if(typeof go==='function')go('campaigns');
 };
 function setupCampaign(){
   if(typeof campaigns!=='function')return false;
   if(campaigns.__nativeCampaign168)return true;
   const previous=campaigns;
   const wrap=function(){
     if(!visible())return previous();
     if(state.active)return showPanel();
     const base=String(previous()||'');
     if(base.includes('cpNativeTab168'))return base;
     const feature=featured();
     if(base.includes('</nav>'))return base.replace('</nav>',tab()+'</nav>'+feature);
     return feature+base;
   };
   wrap.__nativeCampaign168=true;
   campaigns=wrap;
   try{window.campaigns=wrap;}catch(e){}
   return true;
 }
 function setupResult(){
   if(typeof resultView!=='function')return false;
   if(resultView.__nativeCampaign168)return true;
   const previous=resultView;
   const wrap=function(){
     const base=previous();
     if(!visible())return base;
     const card=moduleReady()&&typeof window.campaignMyResultCard165==='function'
       ?window.campaignMyResultCard165()
       :'<section class="cpMyShell168" id="cpMyResult165"><b>🏆 eStore no Volume Máximo · Sua posição</b><p>Carregando sua classificação e premiação provisória…</p></section>';
     if(typeof window.refreshCampaignResult165==='function'){
       setTimeout(function(){if(document.getElementById('cpMyResult165'))window.refreshCampaignResult165().catch(e=>console.warn('[Campanha] Meu Resultado:',e));},90);
     }
     return card+base;
   };
   wrap.__nativeCampaign168=true;
   resultView=wrap;
   try{window.resultView=wrap;}catch(e){}
   return true;
 }
 function setupGo(){
   if(typeof go!=='function')return false;
   if(go.__nativeCampaign168)return true;
   const previous=go;
   const wrap=function(view){
     const output=previous(view);
     if(visible())setTimeout(drawerEntry,50);
     if(visible()&&view==='campaigns'&&state.active){
       if(!moduleReady())setTimeout(function(){if(state.active&&moduleReady())go('campaigns');},600);
       else if(typeof window.loadCampaignSnapshot165==='function')window.loadCampaignSnapshot165();
     }
     return output;
   };
   wrap.__nativeCampaign168=true;
   go=wrap;
   try{window.go=wrap;}catch(e){}
   return true;
 }
 function drawerEntry(){
   if(!visible())return;
   const drawer=document.querySelector('.drawerNav');
   if(!drawer||drawer.querySelector('.cpDrawerEntry168'))return;
   const existing=Array.from(drawer.querySelectorAll('button')).find(b=>/go\(['"]campaigns['"]\)/.test(b.getAttribute('onclick')||''));
   if(!existing)return;
   const button=document.createElement('button');
   button.type='button';button.className='cpDrawerEntry168';
   button.innerHTML='<span class="drawerIco">🏆</span>Parcial Top 15 <small>· Outubro</small>';
   button.addEventListener('click',window.campaignPartialOpen168);
   existing.insertAdjacentElement('afterend',button);
 }
 function addStyle(){
   if(document.getElementById('cp-native-v168-css'))return;
   const e=document.createElement('style');e.id='cp-native-v168-css';
   e.textContent=
     '@keyframes cpGlow168{0%,100%{box-shadow:0 0 0 0 rgba(222,124,0,.48);border-color:#DE7C00}50%{box-shadow:0 0 0 8px rgba(222,124,0,0);border-color:#E68699}}'+
     '.cpNativeTab168{border:2px solid #DE7C00!important;border-radius:14px!important;background:#FFF0CC!important;color:#173F35!important;font-weight:950!important;animation:cpGlow168 2.8s ease-in-out infinite}.cpNativeTab168 strong,.cpNativeTab168 span{display:block;font-size:12px!important}'+
     '.cpNativeFeature168{border:2px solid #DE7C00;background:linear-gradient(115deg,#10392F,#286452);border-radius:20px;color:white;margin:14px 0;padding:21px;animation:cpGlow168 2.8s ease-in-out infinite}'+
     '.cpNativeLive168{font-weight:950;font-size:10px;color:#FFD990;letter-spacing:.1em}.cpNativeFeature168 h3{font-size:20px;color:#FFDC91;margin:8px 0}.cpNativeFeature168 p{color:#fff;font-size:13px;line-height:1.55;margin:0 0 14px}.cpNativeFeature168 button{width:100%;border:0;border-radius:14px;background:#DE7C00;color:#fff;padding:14px;font-weight:950;cursor:pointer}'+
     '.cpNativePage168{max-width:1200px;margin:0 auto}.cpNativeToolbar168{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:12px 0 20px;color:#173F35;font-size:12px;font-weight:900}.cpNativeToolbar168 button{border:1px solid #466964;background:white;padding:11px 17px;border-radius:13px;color:#173F35;font-weight:800}'+
     '.cpMyShell168{border:2px solid #DE7C00;border-radius:18px;background:#F8F3E8;padding:16px;margin:13px 0}.cpMyShell168 b{color:#173F35}.cpMyShell168 p{font-size:12px;color:#466964}'+
     '.cpDrawerEntry168{background:#FFF1D3!important;border:1px solid #DE7C00!important;color:#173F35!important;font-weight:900!important}.cpDrawerEntry168 small{color:#9C5B4A;font-size:10px}'+
     '@media(max-width:560px){.cpNativeToolbar168{flex-wrap:wrap}.cpNativeTab168{padding:10px 6px!important}.campaignPage75 .tabs75:has(.cpNativeTab168){flex-wrap:wrap!important}}'+
     '@media(prefers-reduced-motion:reduce){.cpNativeTab168,.cpNativeFeature168{animation:none!important}}';
   document.head.appendChild(e);
 }
 function init(){
   addStyle();
   setupCampaign();
   setupResult();
   setupGo();
   drawerEntry();
 }
 init();
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else setTimeout(init,0);
 // Restaura a ligação se outros módulos legados substituírem a navegação no carregamento.
 [350,1100,2500].forEach(delay=>setTimeout(init,delay));
})();

/* V215: direcionamento diário de metas para supervisores e links de compartilhamento. */
(function(){
 "use strict";
 const permitted=new Set(["home","result","metasv4","hourlyv5","store","ranking","campaigns","poolv3","teamv3","reportsv3","profilev3","important","supportv5","adminv3"]);
 const labels={home:"Início",result:"Meu Resultado",metasv4:"Metas",store:"Minha Filial",ranking:"Ranking",campaigns:"Campanhas",poolv3:"Pool",teamv3:"Meu Time",reportsv3:"Relatórios",profilev3:"Perfil",important:"Informações",hourlyv5:"Hora a Hora",supportv5:"Suporte",adminv3:"Administrativo"};
 let current="home",lastId="",routed=false,shown=false,wrappedGo=null,wrappedShare=null;
 window.__estoreCurrentShareMenu215=()=>current;
 function date(){
   const parts=new Intl.DateTimeFormat("en-US",{timeZone:"America/Fortaleza",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
   const p=k=>parts.find(x=>x.type===k)?.value||"";
   return p("year")+"-"+p("month")+"-"+p("day");
 }
 function id(){try{return String(U?.u?.id||"").trim()}catch(_){return ""}}
 function logged(){return !!id()&&!document.getElementById("app")?.classList.contains("hide")}
 function read(k){try{return localStorage.getItem(k)==="1"}catch(_){return false}}
 function save(k){try{localStorage.setItem(k,"1")}catch(_){}}
 function close(){document.getElementById("estoreGoalFirst215")?.remove()}
 function openMenu(v){if(typeof go==="function")go(v);else if(typeof window.go==="function")window.go(v);if(v==="metasv4")setTimeout(()=>document.querySelector(".hcBoxV4")?.scrollIntoView({behavior:"smooth",block:"start"}),200)}
 function show(idNow){
   const key="estore_goal_first_access_20261022_"+idNow+"_"+date();
   save(key);shown=true;
   if(document.getElementById("estoreGoalFirst215"))return;
   const el=document.createElement("section");el.id="estoreGoalFirst215";
   el.setAttribute("role","dialog");el.setAttribute("aria-modal","true");
   el.setAttribute("aria-label","Distribuição diária de metas");
   el.innerHTML='<div class="goal-content"><button class="goal-dismiss" type="button" aria-label="Fechar">×</button><small>🎯 GESTÃO DO DIA</small><h2>Sua meta do dia está disponível!</h2><p>Acesse a distribuição diária por HC e alinhe o desafio com sua equipe.</p><button class="goal-open" type="button">Visualizar distribuição de metas →</button><button class="goal-later" type="button">Agora não</button></div>';
   el.querySelector(".goal-dismiss").onclick=close;
   el.querySelector(".goal-later").onclick=close;
   el.querySelector(".goal-open").onclick=()=>{close();openMenu("metasv4")};
   document.body.appendChild(el);
 }
 const css=document.createElement("style");css.textContent="#estoreGoalFirst215{position:fixed;inset:0;z-index:2147483200;background:#09281fd1;display:flex;justify-content:center;align-items:center;padding:18px;box-sizing:border-box}#estoreGoalFirst215 *{box-sizing:border-box}#estoreGoalFirst215 .goal-content{position:relative;width:min(450px,100%);background:#fffaf2;border:2px solid #DE7C00;border-radius:24px;padding:27px;color:#173F35;box-shadow:0 23px 70px #0005}#estoreGoalFirst215 small{font-size:11px;letter-spacing:.11em;font-weight:900;color:#9a621b}#estoreGoalFirst215 h2{font-size:clamp(21px,5vw,28px);line-height:1.15;margin:15px 0 12px;color:#173F35}#estoreGoalFirst215 p{font-size:15px;line-height:1.55;color:#466964;margin:0 0 21px}#estoreGoalFirst215 button{cursor:pointer;font:inherit}#estoreGoalFirst215 .goal-dismiss{position:absolute;top:12px;right:16px;background:transparent;border:0;font-size:28px;color:#173F35}#estoreGoalFirst215 .goal-open{width:100%;background:#173F35;color:#fff;border:0;border-radius:14px;padding:15px;font-weight:850}#estoreGoalFirst215 .goal-later{display:block;margin:13px auto 0;color:#466964;background:transparent;border:0;font-size:13px;font-weight:700}";
 (document.head||document.documentElement).appendChild(css);
 function tick(){
   if(typeof window.go==="function"&&window.go!==wrappedGo&&!window.go.__goal215){
     const orig=window.go,fn=function(view,...rest){if(view==="adminv3"&&id()!=="2457695")return; if(permitted.has(view))current=view;return orig.call(this,view,...rest)};
     fn.__goal215=true;wrappedGo=fn;window.go=fn;
   }
   if(typeof window.shareCanvas==="function"&&window.shareCanvas!==wrappedShare&&!window.shareCanvas.__goal215){
     const orig=window.shareCanvas,fn=function(canvas,text,...rest){
       const label=labels[current]||"Início",route=permitted.has(current)?current:"home";
       const footer="\n\n📲 Acesse o App eStore CE+PI\n📍 Menu → "+label+"\n🔗 https://frannlima.github.io/app-estore-cepi/?view="+route;
       const content=String(text||"");
       return orig.call(this,canvas,content.includes("📲 Acompanhe no App eStore CE+PI")||content.includes("📲 Acesse o App eStore CE+PI")?content:content+footer,...rest);
     };
     fn.__goal215=true;wrappedShare=fn;window.shareCanvas=fn;
   }
   if(!logged())return;
   const m=id();
   // Admin pertence exclusivamente à matrícula proprietária; preserve menus de supervisão.
   try{if(m!=="2457695"&&U?.admin)U.admin=false}catch(_){}
   if(m!==lastId){lastId=m;routed=false;shown=false;close()}
   if(!routed){
     routed=true;
     const v=new URLSearchParams(location.search).get("view");
     if(v&&permitted.has(v)&&!(v==="adminv3"&&m!=="2457695")){openMenu(v);return}
   }
   if(!shown){
     const key="estore_goal_first_access_20261022_"+m+"_"+date();
     if(read(key)){shown=true;return}
     if(m!=="2457695"&&!!U?.lead&&!U?.admin)show(m);
     else shown=true;
   }
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",tick,{once:true});else tick();
 setInterval(tick,1400);
})();

/* V215 | Inclui menu e endereço no compartilhamento nativo de imagens e textos. */
(function(){
 "use strict";
 if(typeof navigator.share!=="function"||navigator.share.__estoreFooter215)return;
 const before=navigator.share;
 const paths={home:"Início",result:"Meu Resultado",metasv4:"Metas",store:"Minha Filial",ranking:"Ranking",campaigns:"Campanhas",poolv3:"Pool",teamv3:"Meu Time",reportsv3:"Relatórios",profilev3:"Perfil",important:"Informações",hourlyv5:"Hora a Hora",adminv3:"Administrativo"};
 function route(){
   const v=new URLSearchParams(location.search).get("view");
   let current=typeof window.__estoreCurrentShareMenu215==="function"?window.__estoreCurrentShareMenu215():"";
   if((!current||current==="home")&&paths[v])current=v;
   return paths[current]?current:"home";
 }
 function footer(text){
   const base=String(text||"").trimEnd();
   if(base.includes("frannlima.github.io/app-estore-cepi/"))return base;
   const v=route();
   return base+"\n\n📲 Acesse o App eStore CE+PI\n📍 Menu → "+paths[v]+"\n🔗 https://frannlima.github.io/app-estore-cepi/?view="+v;
 }
 const enhanced=function(payload){
   if(!payload||typeof payload!=="object")return before.call(navigator,payload);
   return before.call(navigator,{...payload,text:footer(payload.text||payload.title||"")});
 };
 enhanced.__estoreFooter215=true;
 try{navigator.share=enhanced}catch(_){}
})();


/* Segurança da experiência: promoções permanecem no menu Campanhas, sem modal na abertura. */
(function(){
 "use strict";
 let lastSuppressed=null;
 function suppress(){
   // A tela principal já carregou; os métodos de publicidade não podem interrompê-la.
   try{
     if(typeof showCampaignPopupV37==="function"&&showCampaignPopupV37!==lastSuppressed){
       lastSuppressed=function(){return};
       showCampaignPopupV37=lastSuppressed;
     }
   }catch(_){}
   try{
     if(typeof window.showCampaignPopupV37==="function"&&window.showCampaignPopupV37!==lastSuppressed){
       if(!lastSuppressed)lastSuppressed=function(){return};
       window.showCampaignPopupV37=lastSuppressed;
     }
   }catch(_){}
   document.getElementById("campaignPopupV37")?.remove();
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",suppress,{once:true});
 else suppress();
 const interval=setInterval(suppress,2500);
 window.addEventListener("pagehide",()=>clearInterval(interval),{once:true});
})();
