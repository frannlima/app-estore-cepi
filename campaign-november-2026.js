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
if(typeof window.campaigns==='function'&&!window.campaigns.__nov2026){
 const old=window.campaigns;
 const wrapped=function(){return html()+String(old.apply(this,arguments)||'').replace(/eStore no Volume Máximo/gi,'Campanha anterior (encerrada)').replace(/PARCIAL NO VOLUME MÁXIMO/gi,'Histórico de campanha');};
 wrapped.__nov2026=true;window.campaigns=wrapped;try{campaigns=wrapped;}catch(_){}
}
if(typeof window.commission==='function'&&!window.commission.__nov2026){
 const old=window.commission;const wrapped=function(){return '<div class="notice"><b>Novembro: Bateu? Levou!</b><br>Se a loja alcançar 1% de share ao fechar o mês, 10% substituem os 3% sobre vendas próprias aprovadas elegíveis. Terças-feiras já têm 10%: sem acumular. O pool de supervisores continua 3%. Simulações padrão abaixo não incluem a apuração condicional de novembro.</div>'+old.apply(this,arguments);};
 wrapped.__nov2026=true;window.commission=wrapped;try{commission=wrapped;}catch(_){}
}
}
function popup(){
if(!november()||!document.getElementById('shell')||document.getElementById('shell').classList.contains('hide'))return;
try{if(sessionStorage.getItem('estore-campanha-nov2026-v1'))return;}catch(_){}
if(document.getElementById('novCampaignModal'))return;
const el=document.createElement('div');el.id='novCampaignModal';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','Campanha de novembro');
el.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(8,30,24,.77);display:grid;place-items:center;padding:18px';
el.innerHTML='<div style="background:white;color:#173f35;max-width:430px;width:100%;border-radius:22px;padding:22px;max-height:85vh;overflow:auto;box-shadow:0 22px 70px #0005"><div style="font-size:12px;font-weight:800;color:#a57931">NOVEMBRO 2026</div><h2 style="margin:8px 0">🎁 BATEU? LEVOU!</h2><p><b>1% de share na loja = 10% de comissão</b> sobre vendas próprias aprovadas elegíveis do mês.</p><p>⭐ <b>Dia E agora é na terça!</b> Comissão promocional de 10% nas terças de novembro.</p><p style="font-size:12px">Comissões não cumulativas. Pool dos supervisores permanece 3%. Consulte critérios e exclusões no menu Campanhas.</p><button id="novCampaignDetails" style="width:100%;padding:13px;background:#173f35;color:white;border:0;border-radius:12px;font-weight:bold">VER REGULAMENTO</button><button id="novCampaignDismiss" style="width:100%;padding:12px;background:transparent;border:0;color:#173f35">Agora não</button></div>';
document.body.appendChild(el);
function close(){try{sessionStorage.setItem('estore-campanha-nov2026-v1','1');}catch(_){}el.remove();}
el.querySelector('#novCampaignDismiss').onclick=close;
el.querySelector('#novCampaignDetails').onclick=function(){close();if(typeof go==='function')go('campaigns');};
}
function upgradeSimulator(){
 if(!november())return;
 const select=document.getElementById('simr');
 if(!select||select.dataset.nov2026)return;
 select.dataset.nov2026='1';
 const option=document.createElement('option');option.value='.10';option.textContent='Bateu? Levou! • 10% (condicionado a 1% de share no fechamento)';select.appendChild(option);
 const hint=document.createElement('div');hint.className='notice';hint.style.marginTop='8px';hint.textContent='Novembro: Dia E 10% nas terças. Se a loja fechar o mês com 1% de share, 10% substituem os 3% nas vendas próprias elegíveis. Não acumula. O simulador não valida o atingimento da meta.';select.parentNode.appendChild(hint);
}
function tick(){patch();popup();upgradeSimulator();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',tick);else tick();
setInterval(tick,1500);
})();