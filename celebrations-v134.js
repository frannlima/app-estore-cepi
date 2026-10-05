/* V134 — Celebrações pessoais */
(function(){
  'use strict';
  if(window.__CELEBRATIONS_V134__)return;
  window.__CELEBRATIONS_V134__=true;

  const API=()=>window.API||window.ESTORE_API||'https://fndkjgveeojlywkdrtxe.supabase.co/functions/v1/estore-api';
  const LOGO='./assets/riachuelo-logo-horizontal-oficial-white-v133.svg';

  function escV134(v){
    return String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
  function keyV134(data){
    const id=String(data?.matricula||window.U?.u?.id||'');
    const types=(data?.events||[]).map(x=>x.type+(x.years?'-'+x.years:'')).sort().join('|');
    return 'estore_celebration_v134|'+id+'|'+String(data?.date||'')+'|'+types;
  }
  function birthdayCopyV134(first){
    return {
      title:'Feliz aniversário, '+first+'!',
      label:'Hoje é seu dia ✨',
      icon:'🎉',
      body:'Que este novo ciclo chegue com muitos motivos para celebrar, conquistar e se orgulhar. Que seu dia seja leve, especial e cheio de boas energias. Obrigado por fazer parte do nosso time e por tudo o que construímos juntos.',
      highlight:'Feliz vida! Que venha um ciclo incrível. 💛'
    };
  }
  function anniversaryCopyV134(first,years){
    const y=Number(years||0),label=y===1?'1 ano':y+' anos';
    return {
      title:'Parabéns pelos '+label+' de Riachuelo, '+first+'!',
      label:'Uma história que merece ser celebrada',
      icon:'✨',
      body:'Hoje celebramos mais um capítulo da sua trajetória com a gente. São '+label+' de dedicação, aprendizados, conquistas e histórias que ajudam a construir a Riachuelo todos os dias. Obrigado por fazer parte dessa jornada.',
      highlight:label+' de história. Que venham muitos outros capítulos! 💚'
    };
  }
  function eventHtmlV134(ev,first){
    const x=ev.type==='birthday'?birthdayCopyV134(first):anniversaryCopyV134(first,ev.years);
    return '<section class="celebrationEventV134"><h3>'+escV134(x.title)+'</h3><p>'+escV134(x.body)+'</p><div class="celebrationHighlightV134">'+escV134(x.highlight)+'</div></section>';
  }
  function showV134(data){
    if(!data||!Array.isArray(data.events)||!data.events.length)return;
    const key=keyV134(data);
    try{if(localStorage.getItem(key)==='shown')return}catch(_){}
    if(document.getElementById('celebrationOverlayV134'))return;

    const first=String(data.first_name||window.U?.u?.name||'Você').trim().split(/\s+/)[0]||'Você';
    const both=data.events.length>1;
    const primary=data.events[0];
    const top=both
      ?{label:'Hoje temos dois motivos especiais',title:'Um dia para celebrar você, '+first+'!',icon:'🎊'}
      :(primary.type==='birthday'?birthdayCopyV134(first):anniversaryCopyV134(first,primary.years));

    const el=document.createElement('div');
    el.id='celebrationOverlayV134';
    el.className='celebrationOverlayV134';
    el.setAttribute('role','dialog');
    el.setAttribute('aria-modal','true');
    el.innerHTML=
      '<div class="celebrationCardV134">'+
        '<button class="celebrationCloseV134" onclick="closeCelebrationV134()" aria-label="Fechar">×</button>'+
        '<header class="celebrationHeroV134">'+
          '<div class="celebrationConfettiV134"><i></i><i></i><i></i><i></i><i></i><i></i></div>'+
          '<img class="celebrationLogoV134" src="'+LOGO+'" alt="Riachuelo">'+
          '<div class="celebrationSealV134">'+top.icon+'</div>'+
          '<small>'+escV134(top.label)+'</small>'+
          '<h2>'+escV134(top.title)+'</h2>'+
        '</header>'+
        '<div class="celebrationBodyV134">'+
          (both?data.events.map(ev=>eventHtmlV134(ev,first)).join(''):
            '<p class="celebrationMessageV134">'+escV134(primary.type==='birthday'?birthdayCopyV134(first).body:anniversaryCopyV134(first,primary.years).body)+'</p>'+
            '<div class="celebrationHighlightV134">'+escV134(primary.type==='birthday'?birthdayCopyV134(first).highlight:anniversaryCopyV134(first,primary.years).highlight)+'</div>')+
          '<p class="celebrationSignatureV134">Com carinho,<b>Time eStore CE+PI</b></p>'+
        '</div>'+
        '<div class="celebrationActionsV134"><button onclick="closeCelebrationV134()">Obrigado! 💛</button></div>'+
      '</div>';
    document.body.appendChild(el);
    el.addEventListener('click',e=>{if(e.target===el)window.closeCelebrationV134()});
    requestAnimationFrame(()=>el.classList.add('show'));
    try{localStorage.setItem(key,'shown')}catch(_){}
  }
  window.closeCelebrationV134=function(){
    const el=document.getElementById('celebrationOverlayV134');if(!el)return;
    el.classList.remove('show');setTimeout(()=>el.remove(),220);
  };
  async function loadV134(){
    const id=String(window.U?.u?.id||'').trim();
    if(!id||id==='0000000')return;
    try{
      const r=await fetch(API(),{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',body:JSON.stringify({action:'celebration_get',matricula:id})});
      const j=await r.json();
      if(r.ok&&j.ok)showV134(j);
    }catch(e){console.warn('[V134] celebração indisponível',e)}
  }
  window.celebrate=loadV134;

  function bootV134(){
    [700,1500,3000,5500].forEach(ms=>setTimeout(()=>{if(window.U?.u?.id)loadV134()},ms));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootV134,{once:true});
  else bootV134();
})();