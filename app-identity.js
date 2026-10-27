/* App eStore CE+PI | concepção e direção funcional: Francimar Lima (Fran Lima). */
(function(root){
 'use strict';
 const cfg=root.ESTORE_TRANSITION||{},legacy='https://frannlima.github.io/app-estore-cepi/';
 let approved='';
 try{const u=new URL(cfg.publicBase);if(cfg.phase==='active'&&u.protocol==='https:'&&!u.username&&!u.password&&!u.search&&!u.hash)approved=u.href.replace(/\/?$/,'/')}catch(_){}
 const local=typeof location!=='undefined'?new URL('./',location.href).href:legacy;
 function url(query=''){return new URL(query,approved||local).href}
 function normalize(text){return String(text||'').replaceAll(legacy,approved||local)}
 root.EstoreIdentity=Object.freeze({url,normalize,active:!!approved});
 function mount(){
  const about=document.querySelector('.appAboutV51');
  if(about){
   about.querySelector('.appAboutHeadV51 b').textContent='Sobre o App • Créditos';
   about.querySelector('.appAboutHeadV51 span').textContent='Desde 2026';
   about.querySelector('.appAboutFootV51').textContent='Criado e idealizado por Fran Lima — Francimar Lima';
   const a=document.createElement('a');a.href='./sobre-o-app.html';a.textContent='Conheça o projeto e o histórico de criação →';a.style.cssText='display:block;margin-top:10px;color:#173f35;font-weight:800';about.appendChild(a);
  }
  const text=approved?'O App eStore CE+PI tem um novo endereço. Ao acessá-lo, poderá ser necessário entrar novamente com sua matrícula, reinstalar o app e autorizar as notificações. Confira seus registros antes de remover a instalação antiga.':'Estamos preparando um novo endereço para o App eStore CE+PI. Continue usando este acesso. Após a mudança, poderá ser necessário entrar novamente, reinstalar o app e autorizar as notificações. Não reinstale agora; o novo link será informado aqui.';
  for(const parent of [document.querySelector('#login .loginbox'),document.querySelector('#shell main.wrap')]){
   if(!parent)continue;
   const box=document.createElement('details');box.className='estoreTransitionNotice';box.open=true;
   box.style.cssText='margin:12px 0;padding:12px;border:1px solid #c8d7cf;border-radius:12px;background:#edf5f0;color:#173f35;font-size:13px;line-height:1.5;text-align:left';
   box.innerHTML='<summary style="cursor:pointer;font-weight:800">Endereço do app: informações importantes</summary>';
   const p=document.createElement('p');p.textContent=text;box.appendChild(p);
   if(approved&&new URL(approved).origin!==location.origin){const a=document.createElement('a');a.href=url(location.search+location.hash);a.textContent='Acessar o novo endereço oficial →';box.appendChild(a)}
   const more=document.createElement('a');more.href='./sobre-o-app.html#transicao';more.textContent='Orientações de acesso e instalação';more.style.display='block';box.appendChild(more);
   parent.prepend(box);
  }
 }
 if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount()}
})(globalThis);

/* Central de Ajuda WhatsApp Business */
(function(){
  if(typeof document==="undefined" || document.getElementById("ec-support-script"))return;
  const el=document.createElement("script");
  el.id="ec-support-script";
  el.src=new URL("./support-widget-v1.js?v=1", document.currentScript && document.currentScript.src || location.href).href;
  el.dataset.app="estore";
  el.defer=true;
  document.head.appendChild(el);
})();

/* Comunicados D-1 personalizados: interface administrativa, disparo assistido. */
(function(){
 if(typeof document==="undefined"||document.getElementById("estore-d1-daily-script"))return;
 const script=document.createElement("script");
 script.id="estore-d1-daily-script";
 script.src=new URL("./estore-d1-broadcast-v1.js?v=7",document.currentScript?.src||location.href).href;
 script.defer=true;
 document.head.appendChild(script);
})();
