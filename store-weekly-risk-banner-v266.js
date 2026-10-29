/* Minha Filial | Alerta semanal único por filial — v266.
   Share em fração (0.0035 = 0,35 p.p.); o gap financeiro usa o
   denominador de vendas da própria filial observado no período parcial.
   Nenhum ranking ou valor é fabricado se faltarem semanas comparáveis. */
(function(){
'use strict';
if(window.__STORE_WEEKLY_RISK_V266__)return;
window.__STORE_WEEKLY_RISK_V266__=true;
const API='https://fndkjgveeojlywkdrtxe.supabase.co/functions/v1/estore-api';
const ID='estoreStoreRiskTopV266',STYLE='estoreStoreRiskStyleV266';
const STATE={actor:'',data:null,at:0,busy:false,store:'',scheduled:false};
const n=v=>(v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v)))?Number(v):null;
const code=v=>String(v||'').replace(/\D/g,'').padStart(3,'0').slice(-3);
const money=v=>n(v)===null?'Em apuração':new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);
const pp=(v,sign=true)=>n(v)===null?'Em apuração':(sign&&v>0?'+':'')+(v*100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+' p.p.';
const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Fortaleza',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
function session(){
 try{if(typeof U==='undefined'||!U?.u?.id)return null;return {actor:String(U.u.id),store:code(U.u.st)}}catch(_){return null}
}
function model(data,store){
 const pending=(note)=>({zone:'pending',title:'RADAR SEMANAL EM APURAÇÃO',subtitle:note,detail:'Os valores serão apresentados quando houver comparativo suficiente entre as filiais.'});
 if(!data?.ok||Number(data?.coverage?.closed?.share_verified_stores||0)<18)return pending('Semana anterior sem share validado para comparação.');
 const current=data.currentPartial;
 if(!current||current.start!==data.currentWeekStart||!Array.isArray(current.stores)||!current.end||current.end<current.start||current.end>today())
   return pending('Aguardando apuração da semana em curso.');
 const valid=current.stores.filter(x=>{
   const a=n(x.share),b=n(x.previous_share),c=n(x.captured);
   return code(x.st)!=='000'&&a!==null&&a>=0&&a<=1&&b!==null&&b>0&&b<=1&&c!==null&&c>=0&&(c===0||a>0);
 }).map(x=>({st:code(x.st),share:Number(x.share),previous:Number(x.previous_share),captured:Number(x.captured),
   delta:Number((Number(x.share)-Number(x.previous_share)).toFixed(10))}));
 // A base CE+PI contém 18 filiais comparáveis ativas; cobertura menor não permite Top 5.
 if(valid.length<18||new Set(valid.map(x=>x.st)).size<18)return pending('Faltam shares comparáveis na semana em curso.');
 const mine=valid.find(x=>x.st===store);
 if(!mine)return pending('Filial sem comparativo de share validado.');
 const losses=valid.filter(x=>x.delta<0).sort((a,b)=>a.delta-b.delta||a.st.localeCompare(b.st));
 const index=losses.findIndex(x=>x.st===store);
 const cutoff=losses.length>=5?losses[4].delta:0;
 const denom=mine.share>0&&mine.captured>0?mine.captured/mine.share:null;
 const base={weekEnd:current.end,delta:mine.delta,denominator:denom,cutoff,rank:index+1,store};
 if(index>=0&&index<5){
   // Sair do Top 5 exige superar, não empatar com, o desvio da 5ª retração.
   const target=Math.min(0,cutoff+0.0001); // Margem de segurança: 0,01 p.p. acima do corte.
   const need=Math.max(0,target-mine.delta);
   return {...base,zone:'red',title:'ALERTA • RETRAÇÃO DE SHARE',subtitle:'Risco de priorização na semana',
    badge:(index+1)+'ª entre as priorizadas',missingPp:need,missingMoney:denom!==null?Math.ceil(need*denom*100)/100:null,
    detail:'Equivalência em R$ calculada sobre a venda total já apurada, incluindo margem de 0,01 p.p. A posição e o valor podem mudar até domingo.'};
 }
 if(mine.delta<0){
   const margin=Math.max(0,mine.delta-cutoff);
   return {...base,zone:'yellow',title:'ATENÇÃO • SHARE SEMANAL',subtitle:margin<=0.001?'Próxima da zona de priorização':'Retração sob monitoramento',
    badge:'Fora do Top 5',marginPp:margin,marginMoney:denom!==null?Math.floor(margin*denom*100)/100:null,
    detail:'Margem até o corte da 5ª maior retração, sobre os dados parciais. Não representa venda adicional necessária.'};
 }
 return {...base,zone:'green',title:mine.delta>0?'EVOLUÇÃO DE SHARE':'SHARE ESTÁVEL',
   subtitle:mine.delta>0?'Ganho frente à semana anterior':'Sem retração no comparativo',
   badge:'Fora da priorização',detail:'Comparação parcial com a semana anterior; poderá mudar no fechamento.'};
}
function banner(m){
 const meta=m.weekEnd?'Parcial até '+m.weekEnd.slice(8,10)+'/'+m.weekEnd.slice(5,7):'Semana em curso';
 let metrics='';
 if(m.zone==='red')metrics='<div class="riskMetric266"><span>Perda na semana</span><strong>'+pp(m.delta)+'</strong></div>'+
   '<div class="riskMetric266"><span>Faltam para sair</span><strong>'+pp(m.missingPp)+'</strong></div>'+
   '<div class="riskMetric266"><span>Equivalente em eStore</span><strong>'+money(m.missingMoney)+'</strong></div>';
 else if(m.zone==='yellow')metrics='<div class="riskMetric266"><span>Retração no share</span><strong>'+pp(m.delta)+'</strong></div>'+
   '<div class="riskMetric266"><span>Margem até o corte</span><strong>'+pp(m.marginPp)+'</strong></div>'+
   '<div class="riskMetric266"><span>Margem equivalente</span><strong>'+money(m.marginMoney)+'</strong></div>';
 else if(m.zone==='green')metrics='<div class="riskMetric266"><span>'+ (m.delta>0?'Ganho de share':'Variação de share')+'</span><strong>'+pp(m.delta)+'</strong></div>';
 return '<div class="riskInner266 '+m.zone+'" role="status" aria-live="polite" title="'+safe(m.detail)+'">'+
  '<span class="riskIcon266" aria-hidden="true">'+(m.zone==='red'?'!':m.zone==='yellow'?'!':m.zone==='green'?'↑':'…')+'</span>'+
  '<div class="riskCopy266"><small>'+safe(m.title)+'</small><b>'+safe(m.subtitle)+'</b><em>'+safe(m.badge||meta)+'</em></div>'+
  (metrics?'<div class="riskMetrics266">'+metrics+'</div>':'')+
  '<div class="riskFoot266">'+safe(meta)+(m.zone==='red'||m.zone==='yellow'?' • estimativa parcial':'')+'</div>'+
  '</div>';
}
function isVisible(el){return !!el&&el.isConnected&&!!(el.offsetWidth||el.offsetHeight||el.getClientRects().length);}
function titleNode(){
 const root=document.querySelector('#app:not(.hide)')||document.body;
 const selectors='.pageTitleV3,.title,h1,h2,h3,strong,b,span';
 const candidates=Array.from(root.querySelectorAll(selectors));
 return candidates.find(el=>{
   const t=(el.textContent||'').trim();
   return /^Minha Filial(?:\s*[•|\-]\s*\d{2,4})?$/i.test(t)&&t.length<45&&isVisible(el)&&
    !el.closest('#drawer,nav,.menuGridV13,.menuGridV20,.menuHeadV20');
 })||null;
}
function mount(){
 const s=session();
 if(!s)return null;
 const node=titleNode();
 if(!node)return null;
 const title=node.closest('.pageTitleV3')||node;
 let out=document.getElementById(ID);
 if(!out||!out.isConnected){
   out=document.createElement('div');out.id=ID;
   const row=document.createElement('div');row.className='riskTopRow266';
   title.parentNode.insertBefore(row,title);
   row.appendChild(title);row.appendChild(out);
 }
 STATE.store=code((node.textContent||'').match(/(\d{3})/)?.[1]||s.store);
 return out;
}
function show(){
 const target=mount();if(!target)return;
 const s=session();if(!s)return;
 const m=model(STATE.actor===s.actor?STATE.data:null,STATE.store);
 const html=banner(m);
 if(target.dataset.html!==html){target.innerHTML=html;target.dataset.html=html;}
}
async function load(){
 const s=session();if(!s||STATE.busy)return;
 if(STATE.actor!==s.actor){STATE.actor=s.actor;STATE.data=null;STATE.at=0;}
 if(Date.now()-STATE.at<120000)return;
 STATE.busy=true;STATE.at=Date.now();
 try{
   const res=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},
     body:JSON.stringify({action:'fca_dashboard',matricula:s.actor}),cache:'no-store'});
   const j=await res.json();
   if(!res.ok||!j?.ok)throw Error(j?.error||'Falha ao consultar dados semanais.');
   if(session()?.actor===s.actor)STATE.data=j;
 }catch(e){console.warn('[Radar Minha Filial] Consulta não validada:',String(e?.message||e));STATE.data=null;}
 finally{STATE.busy=false;show();}
}
function tick(){
 STATE.scheduled=false;
 if(!session())return;
 const el=mount();
 if(!el)return;
 show();load();
}
function schedule(){
 if(STATE.scheduled)return;
 STATE.scheduled=true;
 requestAnimationFrame(tick);
}
function init(){
 const observer=new MutationObserver(()=>schedule());
 observer.observe(document.querySelector('#app')||document.body,{childList:true,subtree:true});
 window.addEventListener('estore:fca-loaded',event=>{
   if(event&&window.__FCA_CEPI_DATA_V240?.ok){STATE.data=window.__FCA_CEPI_DATA_V240;STATE.actor=session()?.actor||'';STATE.at=Date.now();}
   schedule();
 });
 window.addEventListener('focus',schedule);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){STATE.at=0;schedule();}});
 setInterval(()=>{if(!document.hidden){STATE.at=0;schedule();}},180000);
 schedule();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.__ESTORE_WEEKLY_RISK_CALC_V266=model;
})();