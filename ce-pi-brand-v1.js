(function(){'use strict';if(window.__cepiRegionalBrand)return;window.__cepiRegionalBrand=true;
const image='./assets/ce-pi-marca-nordestina.svg';
const special=/\bCEPI\b/g;
function update(){
 const root=document.getElementById('view');if(root){const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n,changed=0;while((n=walk.nextNode())&&changed<2000){if(n.parentElement?.closest('script,style,textarea,input,[contenteditable],code'))continue;if(special.test(n.nodeValue)){n.nodeValue=n.nodeValue.replace(special,'CE+PI');changed++}special.lastIndex=0;}}
 const main=document.getElementById('cepiScene');if(main){main.querySelectorAll('h2,h3,.cepiCard small').forEach(e=>{if(/CEPI/.test(e.textContent)){e.textContent=e.textContent.replace(/CEPI/g,'CE+PI')}})}
 const btn=document.getElementById('cepiCenaBtn');if(btn&&btn.textContent.includes('CEPI'))btn.textContent=btn.textContent.replace(/CEPI/g,'CE+PI');
 const home=document.querySelector('#cepiCenaBtn');if(home&&!home.dataset.cepiBrand){home.dataset.cepiBrand='1';const im=document.createElement('img');im.src=image;im.alt='CE+PI';im.style.cssText='width:57px;height:25px;object-fit:contain;vertical-align:middle;margin-right:5px';home.prepend(im);}
}
const style=document.createElement('style');style.textContent='.cepiBrandMark{display:inline-block;max-width:135px;width:100%;height:auto;object-fit:contain}';document.head.append(style);
let scheduled=false;new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;update()})}).observe(document.body,{childList:true,subtree:true});
window.CEPI_BRAND_ASSET=image;window.CEPI_BRAND_LABEL='CE+PI';update();
})();