/* eStore CE+PI | Campanhas novembro 2026 | competência isolada */
(function(){
'use strict';
const zone='America/Fortaleza';
function date(){return new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
function november(){const d=date();return d>='2026-11-01'&&d<='2026-11-30';}
function html(){
return '<section class="card" id="campanhaNov2026" style="border:2px solid #b18a46;background:#fffdf8">'+
'<div class="title">🎁 NOVEMBRO 2026 | BATEU? LEVOU!</div>'+
'<div class="notice success"><b>1% de share eStore na loja = 10% de comissão</b><br>Vendas próprias aprovadas e elegíveis de 01 a 30/11. O benefício substitui os 3% padrão; não acumula com o Dia E.</div>'+
'<div class="notice"><b>⭐ Dia E agora é na terça!</b><br>10% de comissão promocional nas terças-feiras de novembro (03, 10, 17 e 24/11). Não acumula com a campanha mensal.</div>'+
'<div class="notice"><b>Quem participa?</b><br>Colaboradores de loja e supervisores elegíveis. Gerentes, intermitentes e aprendizes não participam.</div>'+
'<div class="notice"><b>O que não comissiona?</b><br>Produto com estoque na própria loja, Retire Rápido na mesma filial e pagamentos não aprovados.</div>'+
'<div class="notice"><b>Supervisores</b><br>Pool permanece em 3%; a comissão de venda própria é independente e não cumulativa.</div>'+
'<div class="notice"><b>Pagamento</b><br>Regra M+1: até o último dia útil de dezembro de 2026, após apuração e aprovação.</div>'+
'<div class="notice"><b>Mobilização</b><br>Reforce no BD/BT de segunda-feira, planeje os mobiles e reconheça as vendas da terça. No caixa: “Você achou tudo o que gostaria?”</div>'+
'<small>Campanha de novembro: a condição de 1% é apurada no fechamento mensal. Valores exibidos antes do fechamento são projeções, não pagamentos garantidos.</small></section>';
}
function patch(){
if(!november())return;
if(typeof campaigns==='function'&&!campaigns.__nov2026){
 const old=campaigns;
 const wrapped=function(){return html()+String(old.apply(this,arguments)||'').replace(/eStore no Volume Máximo/gi,'Campanha anterior (encerrada)').replace(/PARCIAL NO VOLUME MÁXIMO/gi,'Histórico de campanha');};
 wrapped.__nov2026=true;try{campaigns=wrapped;window.campaigns=wrapped;}catch(_){}
}
if(typeof commission==='function'&&!commission.__nov2026){
 const old=commission;const wrapped=function(){return '<div class="notice"><b>Novembro: Bateu? Levou!</b><br>Se a loja alcançar 1% de share ao fechar o mês, 10% substituem os 3% sobre vendas próprias aprovadas elegíveis. Terças-feiras já têm 10%: sem acumular. O pool de supervisores continua 3%. Simulações padrão abaixo não incluem a apuração condicional de novembro.</div>'+old.apply(this,arguments);};
 wrapped.__nov2026=true;try{commission=wrapped;window.commission=wrapped;}catch(_){}
}
}

function popup(){
 if(!november()||!document.getElementById('shell')||document.getElementById('shell').classList.contains('hide'))return;
 try{if(sessionStorage.getItem('estore-campanha-nov2026-natal-v2'))return}catch(_){}
 if(document.getElementById('novCampaignModal'))return;
 if(!document.getElementById('novCampaignNatalCSS')){
  const css=document.createElement('style');css.id='novCampaignNatalCSS';
  css.textContent=[
  '#novCampaignModal{position:fixed;inset:0;z-index:2147483000;background:#071e19e8;display:grid;place-items:center;padding:12px;backdrop-filter:blur(5px)}',
  '#novCampaignModal *{box-sizing:border-box}#novCampaignModal button{cursor:pointer;font:inherit}',
  '#novCampaignModal .n-panel{width:min(470px,100%);max-height:95dvh;overflow:auto;position:relative;color:white;text-align:center;padding:30px 12px 12px}',
  '#novCampaignModal .n-x{position:absolute;right:0;top:0;border:1px solid #e9c677;border-radius:50%;background:#123f33;color:white;font-size:24px;width:37px;height:37px;z-index:5}',
  '#novCampaignModal h2{font:italic bold clamp(22px,6vw,30px)/1.1 Georgia,serif;color:#ffe49c;margin:9px 0 13px}',
  '#novCampaignModal .n-heading{font-size:11px;letter-spacing:.08em;font-weight:900;color:#ffe3a2}',
  '#novCampaignModal .n-intro p{font-size:14px;line-height:1.5}',
  '#novCampaignModal .n-present{position:relative;height:195px;width:210px;margin:14px auto 26px;filter:drop-shadow(0 14px 15px #0008)}',
  '#novCampaignModal .n-box{position:absolute;bottom:0;left:19px;width:172px;height:115px;border:3px solid #edba4f;border-radius:10px;background:linear-gradient(90deg,#9d1023 0%,#e31c30 43%,#ffd779 43%,#ffdf88 56%,#bc1429 56%,#8b0b1b 100%)}',
  '#novCampaignModal .n-lid{position:absolute;z-index:3;bottom:107px;left:8px;width:194px;height:33px;background:linear-gradient(90deg,#ab1626,#e32937 42%,#ffce61 42%,#fcd879 58%,#b81528 58%);border:3px solid #ffcf6e;border-radius:8px;transform-origin:10% 75%}',
  '#novCampaignModal .n-bow{position:absolute;z-index:4;left:73px;bottom:135px;font-size:62px;line-height:1;transform-origin:50% 80%}',
  '#novCampaignModal .n-santa{position:absolute;z-index:2;bottom:70px;left:55px;font-size:100px;line-height:1;opacity:0;transform:translateY(55px) scale(.4)}',
  '#novCampaignModal .n-gold{background:linear-gradient(#ffeca7,#ebb33e);color:#7e1320;border:1px solid #fff0b4;border-radius:15px;padding:13px 10px;font-weight:900!important;width:100%;box-shadow:0 4px 15px #dca64d66}',
  '#novCampaignModal .n-later{display:block;margin:9px auto 0;padding:6px 12px;background:none;border:0;color:white;font-size:13px}',
  '#novCampaignModal .n-card{display:none;text-align:left;background:linear-gradient(145deg,#155342,#08362b);border:2px solid #ecc575;box-shadow:0 0 20px #fbd07755;border-radius:22px;padding:20px 17px}',
  '#novCampaignModal .n-card h2,#novCampaignModal .n-card .n-heading{text-align:center}',
  '#novCampaignModal .n-card .n-santa-top{text-align:center;font-size:65px;line-height:1}',
  '#novCampaignModal .n-tag{background:linear-gradient(#ffeaa9,#e9af38);color:#9f1a23;font-size:21px;font-weight:1000;display:table;margin:10px auto;padding:9px 15px;border-radius:12px;transform:rotate(-3deg)}',
  '#novCampaignModal .n-lead{text-align:center;line-height:1.45;font-size:13px}',
  '#novCampaignModal .n-rule{background:#fff5dd;color:#26392e;padding:11px;border-radius:12px;margin:10px 0;font-size:12px;line-height:1.45}',
  '#novCampaignModal .n-rule b{display:block;color:#aa1d2a;font-size:14px}',
  '#novCampaignModal .n-small{font-size:10.5px;line-height:1.4;margin:12px 0;color:#fff9e7}',
  '#novCampaignModal.n-opening .n-bow{animation:nUnwrap .8s forwards}#novCampaignModal.n-opening .n-lid{animation:nLid .9s .4s forwards}#novCampaignModal.n-opening .n-santa{animation:nPop .8s .8s forwards}',
  '#novCampaignModal.n-revealed .n-intro{display:none}#novCampaignModal.n-revealed .n-card{display:block;animation:nFade .4s ease both}',
  '@keyframes nUnwrap{to{opacity:0;transform:translate(-65px,-50px) rotate(-85deg) scale(.4)}}@keyframes nLid{to{transform:translate(-15px,-78px) rotate(-25deg)}}',
  '@keyframes nPop{to{opacity:1;transform:translateY(-15px) scale(1)}}@keyframes nFade{from{opacity:0;transform:translateY(15px)}to{opacity:1;transform:translateY(0)}}',
  '@media(max-width:370px){#novCampaignModal .n-card{padding:15px 11px}#novCampaignModal .n-rule{padding:8px}}',
  '@media(prefers-reduced-motion:reduce){#novCampaignModal *{animation:none!important}}'
  ].join('');document.head.appendChild(css);
 }
 const el=document.createElement('div');el.id='novCampaignModal';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','Natal premiado eStore novembro 2026');
 el.innerHTML='<div class="n-panel"><button type="button" class="n-x" aria-label="Fechar">×</button><div class="n-intro"><div class="n-heading">🎄 NATAL PREMIADO eSTORE | NOVEMBRO 2026</div><h2>O Natal chegou antecipado no eStore!</h2><p>Já imaginou ganhar <b>10% de comissão</b> nas suas vendas? Abra seu presente e descubra!</p><div class="n-present" aria-hidden="true"><div class="n-box"></div><div class="n-santa">🎅</div><div class="n-lid"></div><div class="n-bow">🎀</div></div><button type="button" class="n-gold n-open">🎁 ABRIR MEU PRESENTE</button><button type="button" class="n-later">Agora não</button></div><div class="n-card" aria-hidden="true"><div class="n-santa-top" aria-hidden="true">🎅</div><div class="n-heading">🎄 NATAL PREMIADO eSTORE | NOVEMBRO 2026</div><h2>O Natal chegou antecipado no eStore!</h2><div class="n-tag">10% DE COMISSÃO 🎁</div><p class="n-lead">Sua loja bateu <b>1% de share eStore</b>? Você pode ganhar <b>10% de comissão</b> nas suas vendas elegíveis do mês!</p><div class="n-rule"><b>🎯 COMO FUNCIONA?</b>Se a loja atingir 1% de share no fechamento de novembro, os 10% substituem a comissão padrão nas vendas próprias aprovadas e elegíveis de 01 a 30/11, conforme o regulamento.</div><div class="n-rule"><b>⭐ TERÇA É DIA E!</b>Nas terças de novembro (03, 10, 17 e 24/11), as vendas elegíveis têm 10% de comissão promocional.</div><p class="n-small">Comissões não cumulativas. Pool dos supervisores permanece em 3%. Produtos com estoque na própria loja, Retire Rápido na mesma filial e pagamentos não aprovados não comissionam. Consulte critérios e exclusões no menu Campanhas.</p><button type="button" class="n-gold n-details">🎁 QUERO ENTENDER COMO GANHAR</button><button type="button" class="n-later n-dismiss">Agora não</button></div></div>';
 document.body.appendChild(el);let opening=false;
 function close(){try{sessionStorage.setItem('estore-campanha-nov2026-natal-v2','1')}catch(_){}el.remove()}
 el.querySelector('.n-x').onclick=close;el.querySelector('.n-later').onclick=close;el.querySelector('.n-dismiss').onclick=close;
 el.querySelector('.n-open').onclick=()=>{if(opening)return;opening=true;el.classList.add('n-opening');const reveal=()=>{if(!el.isConnected)return;el.classList.add('n-revealed');el.querySelector('.n-card').setAttribute('aria-hidden','false');el.querySelector('.n-details').focus()};if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)reveal();else setTimeout(reveal,1750)};
 el.querySelector('.n-details').onclick=()=>{close();if(typeof go==='function')go('campaigns');else if(typeof window.go==='function')window.go('campaigns')};
}
function upgradeSimulator(){
 if(!november())return;
 const select=document.getElementById('simr');
 if(!select||select.dataset.nov2026)return;
 select.dataset.nov2026='1';
 const option=document.createElement('option');option.value='.10';option.textContent='Bateu? Levou! • 10% (condicionado a 1% de share no fechamento)';select.appendChild(option);
 const hint=document.createElement('div');hint.className='notice';hint.style.marginTop='8px';hint.textContent='Novembro: Dia E 10% nas terças. Se a loja fechar o mês com 1% de share, 10% substituem os 3% nas vendas próprias elegíveis. Não acumula. O simulador não valida o atingimento da meta.';select.parentNode.appendChild(hint);
}
function enforceNovemberEday(){
 if(!november())return;
 try{if(typeof EDAY==='object'&&EDAY){EDAY.weekdays=[2];EDAY.rate=.10;EDAY.active=true;EDAY.start='2026-11-01';EDAY.end='2026-11-30';}}catch(_){}
}
function tick(){enforceNovemberEday();patch();popup();upgradeSimulator();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',tick);else tick();
setInterval(tick,1500);
})();
/* Regras vigentes: leitura pelo endpoint Supabase REST com chave pública do projeto. */
(function(){
 const localDate=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Fortaleza',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 if(localDate()<'2026-11-01'||localDate()>'2026-11-30')return;
 async function read(){
  try{
   if(typeof api!=='function')return;
   const response=await api({action:'campaign_rules_november'});
   if(!response||!response.ok)throw new Error('Regulamento indisponível');
   window.estoreNovemberCampaignRules=response.campaigns||[];
   document.dispatchEvent(new CustomEvent('estore:campaign-rules-ready',{detail:{count:window.estoreNovemberCampaignRules.length}}));
  }catch(error){console.warn('[eStore] Campanha novembro: leitura remota indisponível; regulamento local mantido.',error);}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',read,{once:true});else read();
})();
