/* CE+PI • vitrine de cupons oficiais na Home • 19/10/2026
   Fonte pública: https://blog.riachuelo.com.br/promocoes-e-regulamentos/
   Cupons site/app não são apresentados como garantidamente elegíveis no eStore. */
(function(){
'use strict';
if(window.__ESTORE_PROMOS_HOME_V174__)return;
window.__ESTORE_PROMOS_HOME_V174__=true;
const SOURCE='https://blog.riachuelo.com.br/promocoes-e-regulamentos/';
const PROMOS=[
{id:'estore20',code:'ESTORE20',offer:'20% OFF',title:'Primeira compra no App',detail:'Benefício operacional do eStore para a primeira compra pelo aplicativo.',channel:'eStore • verificar na sacola',kind:'estore',badge:'CUPOM eSTORE',priority:1},
{id:'estore10',code:'ESTORE10',offer:'10% OFF',title:'Oportunidade de venda eStore',detail:'Cupom operacional eStore. Não acumula com outros cupons.',channel:'eStore • verificar na sacola',kind:'estore',badge:'CUPOM eSTORE',priority:2},
{id:'riamais',code:'RIAMAIS',offer:'15% OFF',title:'A partir de R$ 119,99',detail:'Compras acima de R$ 119,99. Site e App Riachuelo; não cumulativo.',from:'2026-10-01',until:'2026-10-25',channel:'Site e App',badge:'CUPOM OFICIAL'},
{id:'bw20',code:'BW20',offer:'20% OFF',title:'Compras acima de R$ 119,99',detail:'Não válido em produtos já promocionados; não acumula com outros cupons.',from:'2026-09-23',until:'2026-10-30',channel:'Site e App',badge:'CUPOM OFICIAL'},
{id:'outfit',code:'OUTFIT',offer:'20% OFF',title:'Looks selecionados',detail:'Desconto em lista selecionada de produtos no site e no aplicativo.',from:'2026-03-25',until:'2026-10-31',channel:'Site e App • itens selecionados',badge:'CUPOM OFICIAL'},
{id:'plusoff',code:'PLUSOFF',offer:'20% OFF',title:'Seleção especial',detail:'Desconto em lista selecionada de produtos no site e no aplicativo.',from:'2026-06-24',until:'2026-10-31',channel:'Site e App • itens selecionados',badge:'CUPOM OFICIAL'},
{id:'app10',code:'APP10',offer:'10% OFF',title:'Primeira compra pelo App',detail:'1 utilização por CPF. Exceto eletroportáteis, relógios e fragrâncias.',channel:'Somente App Riachuelo',badge:'EXCLUSIVO APP'},
{id:'jubutler10',code:'JUBUTLER10',offer:'10% OFF',title:'Carter’s com desconto',detail:'Válido para produtos Carter’s no site Carter’s e nos canais digitais Riachuelo.',from:'2026-01-21',until:'2027-01-31',channel:'Site Carter’s / Site e App',badge:'CARTER’S'},
{id:'bemvindo',code:'BEM-VINDO',offer:'CUPOM ESPECIAL',title:'Cartões Riachuelo',detail:'1 compra por CPF; pagamento com Cartões Riachuelo. Exclui beleza e relógios. Desconto final limitado a 40%.',channel:'Site e App • Cartão Riachuelo',badge:'MIDWAY'},
{id:'retira10',code:'RETIRA10',offer:'10% OFF',title:'1ª compra com Retira em Loja',detail:'Para pedidos na modalidade Retira em Loja ou Retira Rápido; não gera comissão eStore/BOPIS.',from:'2026-03-26',until:'2026-12-31',channel:'Site e App • fora da meta eStore',badge:'NÃO COMISSIONÁVEL',kind:'retira'},
{id:'carters',offer:'ATÉ 30% OFF',title:'Enxoval Carter’s progressivo',detail:'4 peças = 15%; 6 peças = 20%; 10 ou mais = 30%, somente itens participantes.',from:'2026-08-26',until:'2026-12-31',channel:'Site Riachuelo • seleção',badge:'PROMOÇÃO'},
{id:'combo',offer:'COMBOS',title:'Mais peças, mais economia',detail:'Itens selecionados: 3 por R$ 119,99; 2 por R$ 139,99; ou 2 por R$ 199,99.',until:'2027-01-31',channel:'Site e App • itens selecionados',badge:'PROMOÇÃO'},
{id:'segunda',offer:'50% NA 2ª PEÇA',title:'Monte uma combinação',detail:'Desconto na peça de menor valor entre itens selecionados; limite total do pedido de 40%.',until:'2027-02-01',channel:'Site e App • itens selecionados',badge:'PROMOÇÃO'}
];
window.ESTORE_PROMOS_CATALOG_V174={promos:PROMOS,source:SOURCE};
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>{const p=new Intl.DateTimeFormat('en-US',{timeZone:'America/Fortaleza',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const v=k=>p.find(x=>x.type===k)?.value||'';return [v('year'),v('month'),v('day')].join('-')};
const pretty=d=>d?d.slice(8)+'/'+d.slice(5,7)+'/'+d.slice(0,4):'Sem data fixa';
const listed=p=>!p.from||today()>=p.from;
const current=p=>listed(p)&&(!p.until||today()<=p.until);
const offerType=p=>p.kind==='estore'?'estore':p.kind==='retira'?'retira':'official';
function promoPhoto(p){
 const kind=offerType(p),rule=p.until?'Até '+pretty(p.until):'Sujeito a estoque e suspensão';
 const detail=p.kind==='estore'?'Conferir elegibilidade no fechamento do pedido.':p.kind==='retira'?'Retira Rápido e BOPIS não comissionam.':'Site/App: validar aceitação no eStore antes de ofertar.';
 return '<section class="campaignPhotoV34 ecpPromoPhoto174 ecp-'+kind+'" aria-label="'+escapeHtml(p.title)+'">'+
 '<div class="ecpAuras174" aria-hidden="true"></div><div class="ecpHeader174"><span class="ecpTag174">'+escapeHtml(p.badge)+'</span><small>OPORTUNIDADES DE COMPRA</small></div>'+
 '<div class="ecpMain174"><span class="ecpOffer174">'+escapeHtml(p.offer)+'</span><h2>'+escapeHtml(p.title)+'</h2>'+
 (p.code?'<div class="ecpCoupon174"><span>USE O CUPOM</span><strong>'+escapeHtml(p.code)+'</strong></div>':'')+
 '<p class="ecpRules174">'+escapeHtml(p.detail)+'</p></div>'+
 '<div class="ecpFine174"><strong>'+escapeHtml(p.channel)+'</strong><span>'+escapeHtml(rule)+'</span><small>'+escapeHtml(detail)+'</small></div></section>';
}
function promoPanel(p){
 const label=p.kind==='estore'?'VER CUPONS E REGRAS':'CONFERIR REGULAMENTO OFICIAL';
 return '<button class="dynamicPanelV34 ecpPromoPanel174" type="button" data-ecp-offer="'+escapeHtml(p.id)+'" aria-label="'+escapeHtml(label+' para '+p.title)+'">'+escapeHtml(label)+' <span aria-hidden="true">→</span></button>';
}
function updateDots(hero){
 const photos=[...hero.querySelectorAll('.campaignPhotoV34')];
 const panels=[...hero.querySelectorAll('.dynamicPanelV34')];
 const dots=hero.querySelector('.dynDotsV34');
 if(!dots||!photos.length||photos.length!==panels.length)return;
 dots.innerHTML=photos.map((_,i)=>'<button type="button" class="'+(i===0?'active':'')+'" data-ecp-index="'+i+'" aria-label="Ir para destaque '+(i+1)+' de '+photos.length+'" title="Destaque '+(i+1)+'"></button>').join('');
 let counter=hero.querySelector('.ecpCount174');
 if(!counter){counter=document.createElement('span');counter.className='ecpCount174';counter.setAttribute('aria-live','off');dots.insertAdjacentElement('beforebegin',counter);}
 hero.dataset.ecpCount=String(photos.length);
}
function markDots(){
 const hero=document.getElementById('campaignHeroV34');
 if(!hero||!hero.dataset.ecpCount)return;
 const dots=[...hero.querySelectorAll('.dynDotsV34 button')];
 const active=dots.findIndex(d=>d.classList.contains('active'));
 const index=active<0?0:active;
 const visible=dots.length<=6?dots.map((_,i)=>i):[...new Set([Math.max(0,index-2),Math.max(0,index-1),index,Math.min(dots.length-1,index+1),Math.min(dots.length-1,index+2)])];
 dots.forEach((d,i)=>{d.hidden=!visible.includes(i);d.setAttribute('aria-current',String(i===index));});
 const count=hero.querySelector('.ecpCount174');if(count)count.textContent=(index+1)+' / '+dots.length;
}
function install(){
 const hero=document.getElementById('campaignHeroV34');
 if(!hero||hero.dataset.ecpInstalled==='1')return;
 // Só ampliar após o carrossel existente com a campanha ter sido montado.
 const campaign=hero.querySelector('.campaignCardSlideV121');
 const panel=hero.querySelector('.campaignPanelV121');
 const deck=hero.querySelector('.dynamicDeckV34');
 if(!campaign||!panel||!deck)return;
 const offers=PROMOS.filter(current);
 if(!offers.length)return;
 campaign.insertAdjacentHTML('afterend',offers.map(promoPhoto).join(''));
 panel.insertAdjacentHTML('afterend',offers.map(promoPanel).join(''));
 updateDots(hero);
 hero.dataset.ecpInstalled='1';
 hero.dataset.ecpDay=today();
 hero.addEventListener('click',e=>{
   const dot=e.target.closest('[data-ecp-index]');
   if(dot){e.preventDefault();e.stopPropagation();if(typeof window.homeSlideV34==='function')window.homeSlideV34(Number(dot.dataset.ecpIndex));return;}
   const btn=e.target.closest('[data-ecp-offer]');
   if(!btn)return;
   e.preventDefault();e.stopPropagation();
   const promo=PROMOS.find(x=>x.id===btn.dataset.ecpOffer);
   if(!promo)return;
   if(promo.kind==='estore'){
     if(typeof window.go==='function')window.go('campaigns');
   }else{
     window.open(SOURCE,'_blank','noopener,noreferrer');
   }
 });
 markDots();
}
function checkDay(){
 const hero=document.getElementById('campaignHeroV34');if(!hero)return;
 if(hero.dataset.ecpInstalled==='1'&&hero.dataset.ecpDay!==today()){
  hero.querySelectorAll('.ecpPromoPhoto174,.ecpPromoPanel174').forEach(n=>n.remove());
  hero.querySelector('.ecpCount174')?.remove();
  delete hero.dataset.ecpInstalled;install();
  try{window.homeSlideV34?.(0)}catch(_){}
 }
}

function bootstrap(){
 if(typeof window.initHomeV34==='function'&&!window.initHomeV34.__ecp174){
  const original=window.initHomeV34;
  const wrap=function(){const res=original.apply(this,arguments);install();return res;};
  wrap.__ecp174=true;window.initHomeV34=initHomeV34=wrap;
 }
 if(typeof window.homeSlideV34==='function'&&!window.homeSlideV34.__ecp174){
  const previous=window.homeSlideV34;
  const wrap=function(){const res=previous.apply(this,arguments);markDots();return res;};
  wrap.__ecp174=true;window.homeSlideV34=homeSlideV34=wrap;
 }
 install();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootstrap,{once:true});else bootstrap();
[400,1200,3000].forEach(t=>setTimeout(bootstrap,t));
setInterval(()=>{checkDay();if(document.getElementById('campaignHeroV34'))install();},60000);
})();