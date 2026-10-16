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
     '@media(max-width:560px){.cpNativeToolbar168{flex-wrap:wrap}.cpNativeTab168{padding:10px 6px!important}.campaignPage75 .tabs75:has(.cpNativeTab168){flex-wrap:wrap!important}}'+
     '@media(prefers-reduced-motion:reduce){.cpNativeTab168,.cpNativeFeature168{animation:none!important}}';
   document.head.appendChild(e);
 }
 function init(){
   addStyle();
   setupCampaign();
   setupResult();
   setupGo();
 }
 init();
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else setTimeout(init,0);
 // Restaura a ligação se outros módulos legados substituírem a navegação no carregamento.
 [350,1100,2500].forEach(delay=>setTimeout(init,delay));
})();