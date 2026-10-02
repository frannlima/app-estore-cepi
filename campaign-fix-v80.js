/* v80 — compartilhamento estável + popup diário; carregado após o núcleo do App */
(function(){
  'use strict';

  let shareFile=null;
  let preparing=null;
  const CARD='./assets/campaign-share-v75.jpg?build=v80';
  const LOGO='./assets/riachuelo-logo-exact-v75.svg?build=v80';

  function loadImage(src){
    return new Promise(function(resolve,reject){
      const im=new Image();
      im.onload=function(){resolve(im)};
      im.onerror=function(){reject(new Error('Falha ao carregar imagem'))};
      im.src=new URL(src,location.href).href;
    });
  }

  function setShareLabel(label){
    document.querySelectorAll('.share75 b').forEach(function(el){el.textContent=label});
  }

  function prepareShare(){
    if(shareFile)return Promise.resolve(shareFile);
    if(preparing)return preparing;
    preparing=Promise.all([loadImage(CARD),loadImage(LOGO)]).then(function(imgs){
      const card=imgs[0],logo=imgs[1];
      const canvas=document.createElement('canvas');
      canvas.width=1536;canvas.height=1024;
      const g=canvas.getContext('2d',{alpha:false});
      g.drawImage(card,0,0,1536,1024);

      const patch=g.createLinearGradient(62,0,407,0);
      patch.addColorStop(0,'#012625');
      patch.addColorStop(.55,'#002b29');
      patch.addColorStop(1,'#003130');
      g.fillStyle=patch;
      g.fillRect(62,33,345,70);

      const w=305;
      const h=Math.round(w*((logo.naturalHeight||54)/(logo.naturalWidth||662)));
      g.drawImage(logo,88,52,w,h);

      return new Promise(function(resolve,reject){
        canvas.toBlob(function(blob){
          if(!blob){reject(new Error('Falha ao gerar card'));return}
          shareFile=new File([blob],'campanha-estore-volume-maximo-outubro.jpg',{type:'image/jpeg'});
          setShareLabel('Compartilhar campanha');
          resolve(shareFile);
        },'image/jpeg',.94);
      });
    }).catch(function(err){
      preparing=null;
      console.warn('[v80] prepare campaign share',err);
      throw err;
    });
    return preparing;
  }

  function downloadFile(file){
    const url=URL.createObjectURL(file);
    const a=document.createElement('a');
    a.href=url;
    a.download=file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function(){URL.revokeObjectURL(url)},2500);
  }

  window.shareCampaign75=function(){
    if(!shareFile){
      setShareLabel('Preparando card...');
      prepareShare().then(function(){
        setShareLabel('Card pronto - toque novamente');
      }).catch(function(){
        setShareLabel('Compartilhar campanha');
        alert('Não foi possível preparar o card agora. Tente novamente.');
      });
      return;
    }

    try{
      if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[shareFile]}))){
        navigator.share({
          files:[shareFile],
          title:'eStore no Volume Máximo',
          text:'Esses prêmios podem ser seus. Confira a campanha de outubro no App. eStore CE+PI.'
        }).catch(function(err){
          if(err&&err.name==='AbortError')return;
          console.warn('[v80] share campaign',err);
          downloadFile(shareFile);
        });
        return;
      }
    }catch(err){
      console.warn('[v80] share campaign',err);
    }
    downloadFile(shareFile);
  };
  window.shareCampaignV72=window.shareCampaign75;

  function warmShare(){
    setTimeout(function(){prepareShare().catch(function(){})},700);
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',warmShare,{once:true});
  }else{
    warmShare();
  }

  const previousCampaignPopup=window.showHighlightsPopup;
  if(typeof previousCampaignPopup==='function'){
    let popupCallAt=0;
    let popupCallUser='';
    window.showHighlightsPopup=showHighlightsPopup=async function(){
      if(typeof U==='undefined'||!U||!U.u||!U.u.id)return;
      const uid=String(U.u.id);
      const now=Date.now();
      if(popupCallUser===uid&&now-popupCallAt<4000)return;
      popupCallUser=uid;
      popupCallAt=now;

      try{
        if(typeof refreshExtras==='function')await refreshExtras();
      }catch(e){
        console.warn('[v80] conteúdo da campanha indisponível no pré-carregamento',e);
      }

      let day='';
      try{day=new Date().toLocaleDateString('en-CA',{timeZone:'America/Fortaleza'})}
      catch(e){day=new Date().toISOString().slice(0,10)}
      const reliableKey='estoreCampaignPopupV79:'+day+':'+uid;

      try{
        if(localStorage.getItem(reliableKey))return;
        const remove=[];
        for(let i=0;i<localStorage.length;i++){
          const k=localStorage.key(i);
          if(k&&k.startsWith('estoreCampaignDailyV71:')){
            const p=k.split(':');
            if(String(p[2]||'')===uid)remove.push(k);
          }
        }
        remove.forEach(function(k){localStorage.removeItem(k)});
      }catch(e){}

      try{
        await previousCampaignPopup();
      }catch(e){
        console.warn('[v80] falha ao abrir comunicação da campanha',e);
        return;
      }

      requestAnimationFrame(function(){
        try{
          const visible=!!document.getElementById('campaignPop75')||
            !!document.getElementById('highlightsPopup')||
            !!document.getElementById('campaignPopupV37');
          if(visible)localStorage.setItem(reliableKey,'1');
        }catch(e){}
      });
    };
  }
})();