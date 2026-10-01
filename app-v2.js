/* V34 bootstrap: reutiliza o runtime principal já carregado pelo index */
var ESTORE_API=window.API||'https://fndkjgveeojlywkdrtxe.supabase.co/functions/v1/estore-api';


/* App eStore CE+PI — interface v3 baseada no modelo aprovado */
let APP_CONTENT={importantInfo:[],campaigns:[]};
let APP_DELTA={updates:[],asof:null};
let RANK_SCOPE='regional';
let REPORT_METRIC='sales';

function escV3(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function firstV3(){return U?.u?.name?U.u.name.trim().split(/\s+/)[0]:''}
function supV3(){return !!(U?.lead||U?.admin)}
function admV3(){return !!U?.admin}
function clampV3(v,a,b){return Math.max(a,Math.min(b,v))}
function storeFullV3(){
  const raw=COMMON?.stores?.[U?.u?.st]?.name||'';
  const clean=raw.replace(new RegExp('^L?'+String(U?.u?.st||'')+'\\s*[-–•:]?\\s*','i'),'').replace(/\s+/g,' ').trim();
  return String(U?.u?.st||'')+(clean?' • '+clean:'');
}
function profilePhotoKeyV3(){return 'estore_profile_photo_'+String(U?.u?.id||'')}
function profilePhotoV3(){try{return localStorage.getItem(profilePhotoKeyV3())||''}catch{return''}}
function profileAvatarV3(size='md'){
  const p=profilePhotoV3();
  return p?`<img class="profilePicV3 ${size}" src="${p}" alt="">`:`<div class="profileInitialV3 ${size}">${escV3(firstV3().slice(0,1))}</div>`;
}
function moneyShortV3(v){
  v=Number(v||0); if(Math.abs(v)>=1000000)return 'R$ '+(v/1000000).toLocaleString('pt-BR',{maximumFractionDigits:1})+' mi';
  if(Math.abs(v)>=1000)return 'R$ '+(v/1000).toLocaleString('pt-BR',{maximumFractionDigits:1})+' mil';
  return money(v);
}
function perfV3(att){
  const a=Number(att||0);
  if(a>=1)return {cls:'perfGoodV3',icon:'▲',label:'Alta'};
  if(a>=.8)return {cls:'perfMidV3',icon:'●',label:'Média'};
  return {cls:'perfLowV3',icon:'▼',label:'Baixa'};
}
function arrowV3(v){
  const n=Number(v||0);return n>0?'▲':n<0?'▼':'—';
}

async function loadContentV3(){
  try{
    const [cr,dr]=await Promise.all([
      fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'content_get'})}),
      fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'delta'})})
    ]);
    const c=await cr.json(),d=await dr.json();
    if(cr.ok&&c.ok)APP_CONTENT={importantInfo:Array.isArray(c.importantInfo)?c.importantInfo:[],campaigns:Array.isArray(c.campaigns)?c.campaigns:[]};
    if(dr.ok&&d.ok)APP_DELTA=d;
  }catch(e){}
}

function refreshNavV3(){
  const sh=document.querySelector('#drawer .sheet');
  if(sh)sh.innerHTML=`
    <div class="menuHeadV3"><div>${profileAvatarV3('sm')}<div><b>${escV3(U?.u?.name||'')}</b><small>${escV3(storeFullV3())}</small></div></div></div>
    <button onclick="go('home')">⌂ Início</button>
    <button onclick="go('result')">▣ Meu Resultado</button>
    <button onclick="go('store')">▤ Minha Filial</button>
    <button onclick="go('ranking')">★ Ranking</button>
    <button onclick="go('campaigns')">◇ Cupons e Campanhas</button>
    ${supV3()?`<button onclick="go('poolv3')">◎ Pool / Comissão</button>`:''}
    <button onclick="go('important')">ⓘ Informações Importantes</button>
    ${supV3()?`<button onclick="go('teamv3')">♙ Meu Time</button><button onclick="go('reportsv3')">▥ Relatórios e Rankings</button>`:''}
    <button onclick="go('profilev3')">◉ Meu Perfil</button>
    ${admV3()?`<button onclick="go('adminv3')">⚙ Administrativo</button>`:''}
    <button class="logoutBtn" onclick="logoutApp()">↪ Sair</button>`;
  const nav=document.getElementById('nav');
  if(nav)nav.innerHTML=`
    <button onclick="go('home')"><span>⌂</span>Início</button>
    <button onclick="go('result')"><span>▣</span>Vendas</button>
    <button onclick="go('campaigns')"><span>◇</span>Campanhas</button>
    <button onclick="go('ranking')"><span>★</span>Ranking</button>
    <button onclick="go('profilev3')"><span>◉</span>Perfil</button>`;
  const footer=document.querySelector('.footer');
  if(footer)footer.innerHTML='App. eStore | CE+PI<br><small>Fran Lima</small>';
}

function quickV3(){
  return `<div class="quickV3">
    <button class=qGreenV3 onclick="go('result')"><b>▥</b><span>Meu resultado</span></button>
    <button class=qPinkV3 onclick="go('campaigns')"><b>◇</b><span>Cupons e campanhas</span></button>
    <button class=qOrangeV3 onclick="go('ranking')"><b>★</b><span>Ranking</span></button>
    <button class=qSandV3 onclick="go('profilev3')"><b>◉</b><span>Meu perfil</span></button>
  </div>`;
}

function recognitionV3(){
  const month=U?.p?.month||{},top=COMMON?.top?.month||[];
  const pos=top.findIndex(x=>String(x.id)===String(U?.u?.id));
  if(pos>=0&&pos<10)return `<div class="recognitionV3 top10V3"><div class=recIconV3>★</div><div><span class=recTagV3>Top 10 Regional • ${pos+1}º</span><h3>Parabéns!</h3><p>Talento é conquista.</p></div><button onclick="PER='month';go('ranking')">›</button></div>`;
  if(Number(month.c||0)===0)return `<div class="recognitionV3 zeroV3"><div class=recIconV3>↗</div><div><span class=recTagV3>Sem vendas no período</span><h3>Vontade de crescer.</h3></div><button onclick="go('campaigns')">›</button></div>`;
  return '';
}

home=function(){
  const x=person();
  return `
  <div class="homeBannerV3"><div><small>App. eStore | CE+PI</small><h1>Olá, ${escV3(firstV3())}!</h1><p>Moda que inspira o Brasil</p></div></div>
  ${recognitionV3()}
  <div class="brandPhotoCardV3"><div class="brandPhotoOverlayV3"><b>Moda que inspira o Brasil</b></div></div>
  <div class=card><div class=sectionHeadV3><div><div class=title>Resultado • ${pLabel[PER]}</div><small>${escV3(storeFullV3())}</small></div>${tabs()}</div>
    <div class=metricGridV3>
      <div class="metricCardV3 mGreenV3"><span>▥ Venda captada</span><b>${money(x.c)}</b></div>
      <div class="metricCardV3 mRoseV3"><span>▣ Venda aprovada</span><b>${money(x.a)}</b></div>
      <div class="metricCardV3 mOrangeV3"><span>▤ Pedidos</span><b>${num(x.o)}</b></div>
      <div class="metricCardV3 mSandV3"><span>◇ Ticket médio</span><b>${x.o?money(x.c/x.o):money(0)}</b></div>
    </div>
  </div>`;
};

function eDayDataV3(){
  const p=U?.p?.[PER]||{},approved=Math.max(0,Number(p.a||0)),commission=Math.max(0,Number(p.com||0));
  let eApproved=(commission-approved*.03)/.07;
  eApproved=clampV3(Number.isFinite(eApproved)?eApproved:0,0,approved);
  const eCommission=+(eApproved*.10).toFixed(2);
  const regularCommission=Math.max(0,commission-eCommission);
  const asof=APP_DELTA?.asof||COMMON.asof||'';
  const details=[];
  const inSelectedPeriod=(d)=>{
    if(PER==='day')return d===asof;
    const dt=new Date(d+'T12:00:00'),aa=new Date(asof+'T12:00:00');
    if(PER==='month')return d.slice(0,7)===asof.slice(0,7);
    if(PER==='year')return d.slice(0,4)===asof.slice(0,4);
    const monday=x=>{const z=new Date(x);const k=(z.getDay()+6)%7;z.setDate(z.getDate()-k);return z.toISOString().slice(0,10)};
    return monday(dt)===monday(aa);
  };
  for(const up of APP_DELTA?.updates||[]){
    const d=String(up.result_date||''); if(!inSelectedPeriod(d))continue;
    const dt=new Date(d+'T12:00:00'); if(dt.getDay()!==1)continue;
    const rows=(up.collaborators||[]).filter(r=>String(r.id)===String(U.u.id));
    const a=rows.reduce((sum,r)=>sum+Number(r.a||0),0);
    if(a>0)details.push({d,approved:a,commission:+(a*.10).toFixed(2)});
  }
  return {approved,commission,eApproved,eCommission,regularCommission,details};
}
function eDayChartV3(details,total){
  const vals=details.length?details.map(x=>x.commission):[total];
  const mx=Math.max(1,...vals);
  return `<div class=miniBarsV3>${vals.map((v,i)=>`<div><span style="height:${Math.max(8,(v/mx)*70)}px"></span><small>${details.length?new Date(details[i].d+'T12:00').toLocaleDateString('pt-BR',{day:'2-digit'}):'eDay'}</small></div>`).join('')}</div>`;
}

result=function(){
  const x=person(),ed=eDayDataV3();
  return `<div class=pageTitleV3><span>Meu Resultado</span></div>
  <div class=card>${tabs()}
    <div class="commissionHeroV3"><div><small>Comissão do período selecionado</small><b>${money(ed.commission)}</b></div><span>${pLabel[PER]}</span></div>
    <div class="edayCardV3">
      <div class=edayTopV3><div><small>Comissão eDay • segundas</small><b>${money(ed.eCommission)}</b><span>10% sobre vendas aprovadas nas segundas do período selecionado</span></div><div class=edayIconV3>▣</div></div>
      ${eDayChartV3(ed.details,ed.eCommission)}
      <details><summary>Detalhamento das segundas disponíveis</summary>
        ${ed.details.length?ed.details.map(d=>`<div class=edayRowV3><span>${new Date(d.d+'T12:00').toLocaleDateString('pt-BR')}</span><b>${money(d.commission)}</b></div>`).join(''):`<p class=muted>O total eDay é calculado pela comissão acumulada. O detalhamento por segunda aparece conforme as cargas diárias disponíveis.</p>`}
      </details>
    </div>
    <div class=metricGridV3>
      <div class="metricCardV3 mGreenV3"><span>Venda captada</span><b>${money(x.c)}</b></div>
      <div class="metricCardV3 mRoseV3"><span>Venda aprovada</span><b>${money(x.a)}</b></div>
      <div class="metricCardV3 mOrangeV3"><span>Pedidos</span><b>${num(x.o)}</b></div>
      <div class="metricCardV3 mSandV3"><span>Posição CE+PI</span><b>${x.rr?num(x.rr)+'º':'—'}</b></div>
    </div>
  </div>`;
};

function progressV3(att){
 const p=Math.max(0,Math.min(120,Number(att||0)*100));
 return `<div class=progressWrapV3><div class=progressLineV3><span style="width:${Math.min(p,100)}%"></span></div><b>${p.toLocaleString('pt-BR',{maximumFractionDigits:1})}%</b></div>`;
}
function storeChartV3(x){
  const vals=(x.hi||[]).slice().reverse();
  if(!vals.length)return '';
  const mx=Math.max(1,...vals.map(v=>Number(v[1]||0)));
  return `<div class=chartCardV3><div class=chartTitleV3><b>Evolução</b><small>${pLabel[PER]}</small></div><div class=barChartV3>${vals.map(v=>`<div><span style="height:${Math.max(8,Number(v[1]||0)/mx*120)}px"></span><small>${String(v[0]).startsWith('2026-')?fmtDate(v[0]).split(',')[0]:escV3(v[0])}</small></div>`).join('')}</div></div>`;
}
store=function(){
  const x=storeP(),top=x.top||[],pf=perfV3(x.att);
  return `<div class=pageTitleV3><span>Dashboard Filial</span></div>
  <div class=card><div class=storeSelectorV3><div><small>Filial</small><b>${escV3(storeFullV3())}</b></div><span>⌄</span></div>${tabs()}
    <div class=metricGridV3>
      <div class="metricCardV3 mRoseV3"><span>Meta eStore</span><b>${money(x.ee)}</b></div>
      <div class="metricCardV3 mGreenV3"><span>Realizado</span><b>${money(x.c)}</b><small class="${pf.cls}">${pf.icon} ${pf.label}</small></div>
      <div class="metricCardV3 mOrangeV3"><span>Atingimento</span><b>${pct(x.att)}</b></div>
      <div class="metricCardV3 mSandV3"><span>Share eStore</span><b>${pct(x.share)}</b></div>
      <div class="metricCardV3 ${Number(x.gap||0)>=0?'mGreenV3':'mLowV3'}"><span>Gap</span><b>${money(x.gap)}</b></div>
      <div class="metricCardV3 mOrangeV3"><span>Pedidos</span><b>${num(x.o)}</b></div>
    </div>
    <div class=attCardV3><span>Atingimento</span>${progressV3(x.att)}</div>
    ${storeChartV3(x)}
  </div>
  <div class=card><div class=title>Top 3 da filial</div>${podium(top)}</div>`;
};

function setRankV3(v){RANK_SCOPE=v;go('ranking')}
ranking=function(){
  const me=person(); let body='';
  if(RANK_SCOPE==='regional'){
    const a=COMMON.top?.[PER]||[];
    body=a.map((x,i)=>`<div class="rank rankV3 ${String(x.id)===String(U.u.id)?'meRankV3':''}"><div class=medal>${i<3?['🥇','🥈','🥉'][i]:i+1+'º'}</div><div>${String(x.id)===String(U.u.id)?profileAvatarV3('xs'):''}<b>${escV3(String(x.id)===String(U.u.id)?'Você':x.name)}</b><div class=muted>Filial ${escV3(x.st)}</div></div><span><b>${money(x.c)}</b><br><small>${num(x.o)} pedidos</small></span></div>`).join('')||'<p class=muted>Sem resultados no período.</p>';
  }else if(RANK_SCOPE==='filial'){
    const a=(U.team?.[PER]||[]).length?(U.team[PER]||[]):((st().p?.[PER]?.top)||[]);
    body=[...a].sort((a,b)=>(b.c||0)-(a.c||0)).map((x,i)=>`<div class="rank rankV3 ${String(x.id)===String(U.u.id)?'meRankV3':''}"><div class=medal>${i+1}º</div><div><b>${escV3(String(x.id)===String(U.u.id)?'Você':x.name)}</b></div><span><b>${money(x.c)}</b></span></div>`).join('')||'<p class=muted>Sem resultados no período.</p>';
  }else body=`<div class=metricGridV3><div class="metricCardV3 mGreenV3"><span>Posição empresa</span><b>${me.nr?num(me.nr)+'º':'—'}</b></div><div class="metricCardV3 mSandV3"><span>Venda captada</span><b>${money(me.c)}</b></div></div>`;
  return `<div class=pageTitleV3><span>Ranking</span></div><div class=card><div class=scopeTabs><button class="${RANK_SCOPE==='filial'?'on':''}" onclick="setRankV3('filial')">Filial</button><button class="${RANK_SCOPE==='regional'?'on':''}" onclick="setRankV3('regional')">Regional</button><button class="${RANK_SCOPE==='empresa'?'on':''}" onclick="setRankV3('empresa')">Empresa</button></div>${tabs()}${body}</div>`;
};

function couponsV3(){
 return `
 <div class=couponHeroV3>
   <div class="couponV3 green"><div class=couponIconV3>◇</div><div><b>ESTORE20</b><strong>20% OFF</strong><small>1ª compra pelo App Riachuelo</small></div><button onclick="toggleCouponV3('c20')">›</button></div>
   <div id=c20 class=couponDetailV3><b>ESTORE20</b><p>20% de desconto na primeira compra realizada pelo App Riachuelo.</p><ul><li>Válido na 1ª compra pelo App Riachuelo.</li><li>Não cumulativo com outro cupom.</li><li>Uso conforme condições comerciais vigentes.</li></ul></div>
   <div class="couponV3 orange"><div class=couponIconV3>◇</div><div><b>ESTORE10</b><strong>10% OFF</strong><small>Válido sempre</small></div><button onclick="toggleCouponV3('c10')">›</button></div>
   <div id=c10 class=couponDetailV3><b>ESTORE10</b><p>10% de desconto para compras eStore.</p><ul><li>Válido sempre, conforme condições comerciais vigentes.</li><li>Não cumulativo com outro cupom.</li></ul></div>
 </div>
 <div class=accordionV3>
  <details><summary><span>⚙</span> Como funciona</summary><p>O pedido é realizado pelo eStore conforme a necessidade do cliente e as condições disponíveis no momento da compra.</p></details>
  <details><summary><span>▤</span> Regras operacionais</summary>
  <div class="rulesFlowV3">
    <b>Quando usar o eStore</b>
    <ol><li>Primeiro, consulte o estoque do produto na loja.</li><li>Após confirmar a indisponibilidade do produto, tamanho, cor ou variante na loja, ofereça o eStore ao cliente.</li><li>Não utilize o eStore para vender um produto disponível fisicamente na loja. Nessa situação, a comissão pode ser cancelada conforme a regra do processo.</li></ol>
    <b>Venda para clientes externos</b>
    <ul><li>Venda eStore destinada somente a clientes externos.</li><li>Não realizar venda eStore para colaboradores.</li><li>O desconto de colaborador de 30% não se aplica ao eStore.</li></ul>
    <b>BOPIS</b>
    <ul><li>BOPIS não comissiona.</li></ul>
    <b>Cupons</b>
    <ul><li>Cupons não são cumulativos.</li></ul>
  </div>
 </details>
  <details><summary><span>♙</span> Benefícios para o cliente</summary><ul><li>Frete grátis conforme regra vigente.</li><li>Parcelamento em até 10x.</li><li>ESTORE20 na 1ª compra pelo App Riachuelo.</li><li>ESTORE10 válido sempre, conforme condições vigentes.</li></ul></details>
  <details><summary><span>▥</span> Benefícios para o colaborador</summary><ul><li>Comissão sobre venda aprovada conforme regra vigente.</li><li>Referência de 3% nos dias regulares.</li><li>eDay nas segundas-feiras: 10% sobre venda aprovada.</li></ul></details>
 </div>`;
}
function toggleCouponV3(id){const e=document.getElementById(id);if(e)e.classList.toggle('open')}

function campaignsV3(){
  const custom=(APP_CONTENT.campaigns||[]).filter(x=>x.active!==false);
  return `<div class=pageTitleV3><span>Cupons e Campanhas</span></div><div class=card>${couponsV3()}</div>
  ${custom.length?`<div class=card><div class=title>Campanhas de incentivo</div>${custom.map(c=>`<div class=campaignItemV3><div class=campaignIconV3>★</div><div><b>${escV3(c.title)}</b>${c.period?`<small>${escV3(c.period)}</small>`:''}<p>${escV3(c.description||'')}</p>${c.mechanics?`<details><summary>Mecânica e regras</summary><p>${escV3(c.mechanics)}</p></details>`:''}${c.clientBenefit?`<details><summary>Benefício para o cliente</summary><p>${escV3(c.clientBenefit)}</p></details>`:''}${c.employeeBenefit?`<details><summary>Benefício para o colaborador</summary><p>${escV3(c.employeeBenefit)}</p></details>`:''}</div></div>`).join('')}</div>`:''}
  ${supV3()?`<div class=card><button class=campaignLinkV3 onclick="go('poolv3')"><span>★</span><div><b>Pool eStore</b><small>Disponível conforme perfil.</small></div><b>›</b></button></div>`:''}`;
};

let POOL_VIEW='day';
function setPoolViewV3(v){POOL_VIEW=v;go('poolv3')}
function poolSeriesV3(){
  const asof=APP_DELTA?.asof||COMMON.asof||'',st=String(U.u.st),rows=[];
  for(const up of APP_DELTA?.updates||[]){
    const d=String(up.result_date||'');
    if(d<'2026-08-01'||d.slice(0,7)!==asof.slice(0,7))continue;
    const r=(up.management||[]).find(x=>String(x.st)===st);
    if(r)rows.push({d,approved:Number(r.a||0)});
  }
  if(POOL_VIEW==='day')return rows.map(x=>({label:new Date(x.d+'T12:00').toLocaleDateString('pt-BR',{day:'2-digit'}),value:x.approved*.03}));
  if(POOL_VIEW==='week'){
    const m=new Map();
    const key=d=>{const z=new Date(d+'T12:00'),k=(z.getDay()+6)%7;z.setDate(z.getDate()-k);return z.toISOString().slice(0,10)};
    for(const x of rows){const k=key(x.d);m.set(k,(m.get(k)||0)+x.approved*.03)}
    return [...m.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map((x,i)=>({label:'Sem '+(i+1),value:x[1]}));
  }
  const total=Number(U.pool?.pool||0);
  return [{label:new Date(asof+'T12:00').toLocaleDateString('pt-BR',{month:'short'}).replace('.',''),value:total}];
}
function poolV3(){
 if(!supV3())return '<div class=card><div class=title>Pool / Comissão</div><p>Conteúdo disponível para supervisores elegíveis.</p></div>';
 const x=U.pool||{approved:0,pool:0,eligible:[],sim:0},hist=poolSeriesV3(),mx=Math.max(1,...hist.map(h=>h.value));
 return `<div class=pageTitleV3><span>Pool / Comissionamento</span></div>
 <div class=card><div class=poolHeroV3><small>Moda que inspira o Brasil</small></div>
 <div class=metricGridV3><div class="metricCardV3 mRoseV3"><span>Venda aprovada da loja</span><b>${money(x.approved)}</b></div><div class="metricCardV3 mOrangeV3"><span>Pool 3%</span><b>${money(x.pool)}</b></div><div class="metricCardV3 mGreenV3"><span>Supervisores elegíveis</span><b>${num(x.eligible?.length||0)}</b></div><div class="metricCardV3 mSandV3"><span>Rateio estimado</span><b>${money(x.sim)}</b></div></div>
 <div class=title style="margin-top:16px">Regras do Pool</div><ol class=rulesV3><li>3% sobre o valor aprovado da loja.</li><li>Rateio igualitário entre supervisores elegíveis.</li><li>Elegíveis conforme perfil e situação ativa no período.</li><li>Mês parcial considera o período trabalhado conforme regra da campanha.</li></ol>
 <div class=chartCardV3><div class=chartTitleV3><div><b>Evolução do Pool</b><small>Histórico considerado a partir de agosto/2026</small></div><span>R$</span></div>
 <div class=poolTabsV3><button class="${POOL_VIEW==='day'?'on':''}" onclick="setPoolViewV3('day')">Dia</button><button class="${POOL_VIEW==='week'?'on':''}" onclick="setPoolViewV3('week')">Semana</button><button class="${POOL_VIEW==='month'?'on':''}" onclick="setPoolViewV3('month')">Mês</button></div>
 ${hist.length?`<div class=barChartV3>${hist.map(h=>`<div><span style="height:${Math.max(8,h.value/mx*110)}px"></span><small>${h.label}</small><em>${money(h.value)}</em></div>`).join('')}</div>`:'<p class=muted>O gráfico será preenchido conforme as cargas diárias forem incorporadas ao histórico.</p>'}
 </div></div>`;
}

function importantV3(){
 const now=new Date().toISOString().slice(0,10);
 const list=(APP_CONTENT.importantInfo||[]).filter(x=>x.active!==false&&(!x.start||x.start<=now)&&(!x.end||x.end>=now)&&(!x.store||x.store==='Todos'||String(x.store)===String(U.u.st))&&(!x.profile||x.profile==='Todos'||(x.profile==='Supervisor'&&supV3())||(x.profile==='Colaborador'&&!supV3())));
 return `<div class=pageTitleV3><span>Informações Importantes</span></div><div class=card>${list.length?list.map(x=>`<div class=infoItemV3><div><span class=infoTagV3>${escV3(x.category||'Informação')}</span><small>${escV3(x.date||'')}</small></div><b>${escV3(x.title||'')}</b><p>${escV3(x.message||'')}</p></div>`).join(''):'<p class=muted>Nenhuma publicação ativa para o seu perfil.</p>'}</div>`;
}

function teamV3(){
 if(!supV3())return '<div class=card><div class=title>Meu Time</div><p>Conteúdo disponível para liderança.</p></div>';
 const a=U.team?.[PER]||[],yes=a.filter(x=>(x.c||0)>0),no=a.filter(x=>(x.c||0)===0),sorted=[...a].sort((x,y)=>(y.c||0)-(x.c||0));
 return `<div class=pageTitleV3><span>Meu Time</span></div><div class=card>${tabs()}
 <div class=metricGridV3><div class="metricCardV3 mGreenV3"><span>Ativos eStore</span><b>${num(yes.length)}</b></div><div class="metricCardV3 mLowV3"><span>Zerados</span><b>${num(no.length)}</b></div><div class="metricCardV3 mSandV3"><span>Venda captada</span><b>${money(yes.reduce((s,x)=>s+(x.c||0),0))}</b></div><div class="metricCardV3 mOrangeV3"><span>Pedidos</span><b>${num(yes.reduce((s,x)=>s+(x.o||0),0))}</b></div></div>
 <div class=title style="margin-top:16px">Ranking da equipe <small class=autoTagV3>Automático</small></div>
 <div class=teamRankV3>${sorted.map((x,i)=>{const status=(x.c||0)>0?(i<Math.ceil(sorted.length*.33)?['Alta','perfGoodV3']:i<Math.ceil(sorted.length*.66)?['Média','perfMidV3']:['Baixa','perfLowV3']):['Zerado','perfLowV3'];return `<div><span class=posV3>${i+1}</span><b>${escV3(String(x.id)===String(U.u.id)?'Você':x.name)}</b><strong>${money(x.c)}</strong><em class="${status[1]}">${status[0]}</em></div>`}).join('')}</div></div>`;
}

function setReportMetricV3(v){REPORT_METRIC=v;go('reportsv3')}
function reportValueV3(x){return REPORT_METRIC==='sales'?Number(x.c||0):REPORT_METRIC==='orders'?Number(x.o||0):REPORT_METRIC==='share'?Number(x.share||0):(Number(x.o||0)?Number(x.c||0)/Number(x.o||0):0)}
function reportLabelV3(){return {sales:'Vendas',orders:'Pedidos',ticket:'Ticket',share:'Share'}[REPORT_METRIC]}
function reportFormatV3(v){return REPORT_METRIC==='orders'?num(v):REPORT_METRIC==='share'?pct(v):money(v)}
function reportsV3(){
 if(!supV3())return '<div class=card><div class=title>Relatórios e Rankings</div><p>Conteúdo disponível para liderança.</p></div>';
 const base=admV3()?(COMMON.regional?.[PER]||[]):[storeP()];
 const sorted=[...base].sort((a,b)=>reportValueV3(b)-reportValueV3(a));
 const mx=Math.max(1,...sorted.map(reportValueV3));
 return `<div class=pageTitleV3><span>Relatórios e Rankings</span></div><div class=card>
 <div class=reportTabsV3><button class="${REPORT_METRIC==='sales'?'on':''}" onclick="setReportMetricV3('sales')">Vendas</button><button class="${REPORT_METRIC==='orders'?'on':''}" onclick="setReportMetricV3('orders')">Pedidos</button><button class="${REPORT_METRIC==='ticket'?'on':''}" onclick="setReportMetricV3('ticket')">Ticket</button><button class="${REPORT_METRIC==='share'?'on':''}" onclick="setReportMetricV3('share')">Share</button></div>${tabs()}
 <div class=chartCardV3><div class=chartTitleV3><b>${reportLabelV3()}</b><small>Ranking automático</small></div><div class=horizontalBarsV3>${sorted.slice(0,10).map((x,i)=>`<div><span class=hbLabelV3>${i+1}. ${escV3(x.st||U.u.st)}</span><div><i style="width:${Math.max(3,reportValueV3(x)/mx*100)}%"></i></div><b>${reportFormatV3(reportValueV3(x))}</b></div>`).join('')}</div></div>
 ${admV3()?`<div class=title style="margin-top:16px">Ranking de filiais</div><div class=table><table><tr><th>Ranking</th><th>Filial</th><th>Venda</th><th>Ating.</th><th>Performance</th></tr>${[...(COMMON.regional?.[PER]||[])].sort((a,b)=>reportValueV3(b)-reportValueV3(a)).map((x,i)=>{const p=perfV3(x.att);return `<tr class="${p.cls}Row"><td>${i+1}º</td><td>${x.st}</td><td>${money(x.c)}</td><td>${pct(x.att)}</td><td><span class="perfPillV3 ${p.cls}">${p.icon} ${p.label}</span></td></tr>`}).join('')}</table></div>`:''}</div>`;
}

function profileV3(){
 const photo=profilePhotoV3();
 return `<div class=pageTitleV3><span>Meu Perfil</span></div><div class=card>
 <div class=profileCoverV3></div><div class=profileHeaderV3>${profileAvatarV3('lg')}<label class=photoBtnV3>▣<input type=file accept="image/*" onchange="saveProfilePhotoV3(this)"></label><h2>${escV3(U.u.name)}</h2></div>
 <div class=profileRowsV3><div><span>Matrícula</span><b>${escV3(U.u.id)}</b></div><div><span>Filial</span><b>${escV3(storeFullV3())}</b></div><div><span>Cargo</span><b>${escV3(U.u.role)}</b></div></div>
 <label class=editPhotoV3>▣ Inserir / alterar foto<input type=file accept="image/*" onchange="saveProfilePhotoV3(this)"></label>
 </div>`;
}
function saveProfilePhotoV3(input){
 const f=input?.files?.[0];if(!f)return;
 if(f.size>1500000){alert('Selecione uma imagem de até 1,5 MB.');return}
 const r=new FileReader();r.onload=()=>{try{localStorage.setItem(profilePhotoKeyV3(),r.result);refreshNavV3();go('profilev3')}catch(e){alert('Não foi possível salvar a foto neste dispositivo.')}};r.readAsDataURL(f);
}

function importV3(){
 return `<div class=adminSectionV3><div class=title>Importação de Relatórios</div>
 <div class=uploadCardsV3>
  <div><span class=uGreenV3>▤</span><b>Relatório Colaboradores</b><small>Planilha de vendas por colaborador</small><input class=field type=file id=fCol accept=".xlsx,.xls,.csv"></div>
  <div><span class=uOrangeV3>▥</span><b>Relatório Gerencial / Share</b><small>Vendas, pedidos e share</small><input class=field type=file id=fGer accept=".xlsx,.xls,.csv"></div>
  <div><span class=uPinkV3>▣</span><b>Planilha de Metas</b><small>Metas por filial e período</small><input class=field type=file id=fMeta accept=".xlsx,.xls,.csv"></div>
 </div>
 <div class=importActionsV3><label>Data do resultado</label><input class=field type=date id=updDate><input class=field type=password id=updPwd placeholder="Senha ADM"><button class=btn id=updBtn onclick="validateUpdate()">Incorporar resultado diário</button><div id=updOut></div></div>
 <div class=importActionsV3><input class=field type=password id=metaPwd placeholder="Senha ADM para metas"><button class=btn id=metaBtn onclick="uploadMeta()">Incorporar meta</button><div id=metaOut></div></div>
 </div>`;
}

function infoAdminV3(){
 return `<div class=adminSectionV3><div class=title>Informações Importantes</div>
 <div class=adminFormV3><input id=infoTitle class=field placeholder="Título"><select id=infoCategory class=field><option>Campanha</option><option>Regra</option><option>Aviso</option><option>Atualização</option></select><textarea id=infoMessage class=field rows=4 placeholder="Informação"></textarea>
 <select id=infoStore class=field><option>Todos</option>${Object.keys(COMMON.stores||{}).map(s=>`<option>${s}</option>`).join('')}</select><select id=infoProfile class=field><option>Todos</option><option>Colaborador</option><option>Supervisor</option></select>
 <input id=infoStart class=field type=date><input id=infoEnd class=field type=date><input id=infoPwd class=field type=password placeholder="Senha ADM"></div>
 <button class=btn onclick="publishInfoV3()">Publicar</button><div id=infoOut></div></div>`;
}
async function publishInfoV3(){
 const out=$('#infoOut'),title=$('#infoTitle')?.value.trim(),message=$('#infoMessage')?.value.trim(),password=$('#infoPwd')?.value||'';
 if(!title||!message||!password){out.innerHTML='<p class=bad>Preencha título, informação e senha ADM.</p>';return}
 const item={id:Date.now(),title,message,category:$('#infoCategory').value,store:$('#infoStore').value,profile:$('#infoProfile').value,start:$('#infoStart').value,end:$('#infoEnd').value,date:new Date().toLocaleDateString('pt-BR'),active:true};
 const value=[item,...(APP_CONTENT.importantInfo||[])].slice(0,50);
 try{const r=await fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'content_publish',kind:'important_info',value,matricula:String(U.u.id),password})});const j=await r.json();if(!r.ok||!j.ok)throw new Error(j.error||'Falha ao publicar.');APP_CONTENT.importantInfo=value;out.innerHTML='<div class=notice>Publicação salva.</div>'}catch(e){out.innerHTML='<p class=bad>'+escV3(e.message||e)+'</p>'}
}

function campaignAdminV3(){
 return `<div class=adminSectionV3><div class=title>Cupons e Campanhas</div><div class=adminFormV3><input id=campTitle class=field placeholder="Nome da campanha"><input id=campPeriod class=field placeholder="Período"><textarea id=campDesc class=field rows=3 placeholder="Descrição"></textarea><textarea id=campMechanics class=field rows=3 placeholder="Mecânica e regras"></textarea><textarea id=campClient class=field rows=2 placeholder="Benefício para o cliente"></textarea><textarea id=campEmployee class=field rows=2 placeholder="Benefício para o colaborador"></textarea><input id=campPwd class=field type=password placeholder="Senha ADM"></div><button class=btn onclick="publishCampaignV3()">Publicar campanha</button><div id=campOut></div></div>`;
}
async function publishCampaignV3(){
 const out=$('#campOut'),title=$('#campTitle')?.value.trim(),password=$('#campPwd')?.value||'';if(!title||!password){out.innerHTML='<p class=bad>Informe o nome da campanha e a senha ADM.</p>';return}
 const item={id:Date.now(),title,period:$('#campPeriod').value,description:$('#campDesc').value,mechanics:$('#campMechanics').value,clientBenefit:$('#campClient').value,employeeBenefit:$('#campEmployee').value,active:true};const value=[item,...(APP_CONTENT.campaigns||[])].slice(0,30);
 try{const r=await fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'content_publish',kind:'campaigns_config',value,matricula:String(U.u.id),password})});const j=await r.json();if(!r.ok||!j.ok)throw new Error(j.error||'Falha ao publicar.');APP_CONTENT.campaigns=value;out.innerHTML='<div class=notice>Campanha salva.</div>'}catch(e){out.innerHTML='<p class=bad>'+escV3(e.message||e)+'</p>'}
}

function adminV3(){
 if(!admV3())return '<div class=card>Acesso restrito ao administrador.</div>';
 const arr=COMMON.regional?.[PER]||[],sorted=[...arr].sort((a,b)=>b.c-a.c),mx=Math.max(1,...arr.map(x=>x.c||0));
 return `<div class=pageTitleV3><span>ADM / Atualizações</span></div>
 <div class=adminNavV3><button onclick="document.getElementById('admDash3').scrollIntoView()">Dashboard</button><button onclick="document.getElementById('admImport3').scrollIntoView()">Relatórios</button><button onclick="document.getElementById('admCamp3').scrollIntoView()">Campanhas</button><button onclick="document.getElementById('admInfo3').scrollIntoView()">Informações</button></div>
 <div id=admDash3 class=card><div class=sectionHeadV3><div class=title>Dashboard Geral</div>${tabs()}</div>
  <div class=metricGridV3><div class="metricCardV3 mGreenV3"><span>Venda captada</span><b>${money(arr.reduce((s,x)=>s+(x.c||0),0))}</b></div><div class="metricCardV3 mRoseV3"><span>Venda aprovada</span><b>${money(arr.reduce((s,x)=>s+(x.a||0),0))}</b></div><div class="metricCardV3 mOrangeV3"><span>Pedidos</span><b>${num(arr.reduce((s,x)=>s+(x.o||0),0))}</b></div><div class="metricCardV3 mSandV3"><span>Lojas ativas</span><b>${num(arr.filter(x=>(x.c||0)>0).length)}</b></div></div>
  <div class=chartCardV3><div class=chartTitleV3><b>Ranking Regional</b><small>Automático</small></div><div class=horizontalBarsV3>${sorted.slice(0,10).map((x,i)=>`<div><span class=hbLabelV3>${i+1}. ${x.st}</span><div><i style="width:${Math.max(3,(x.c||0)/mx*100)}%"></i></div><b>${moneyShortV3(x.c)}</b></div>`).join('')}</div></div>
  <div class=table><table><tr><th>Ranking</th><th>Loja</th><th>Captada</th><th>Ating.</th><th>Share</th><th>Performance</th></tr>${sorted.map((x,i)=>{const p=perfV3(x.att);return `<tr class="${p.cls}Row"><td>${i+1}º</td><td><b>${x.st}</b></td><td>${money(x.c)}</td><td>${pct(x.att)}</td><td>${pct(x.share)}</td><td><span class="perfPillV3 ${p.cls}">${p.icon} ${p.label}</span></td></tr>`}).join('')}</table></div>
 </div>
 <div id=admImport3 class=card>${importV3()}</div>
 <div id=admCamp3 class=card>${campaignAdminV3()}</div>
 <div id=admInfo3 class=card>${infoAdminV3()}</div>`;
}

const goV3Original=go;
go=function(v){
 CUR=v;$('#drawer')?.classList.remove('open');
 const map={home,result,store,ranking,campaigns:campaignsV3,poolv3:poolV3,important:importantV3,teamv3:teamV3,reportsv3:reportsV3,profilev3:profileV3,adminv3:adminV3,admin:adminV3};
 $('#view').innerHTML=(map[v]||home)();window.scrollTo(0,0);
};

const loginV3Original=login;
login=async function(){
 await loginV3Original();if(!U)return;await loadContentV3();refreshNavV3();go('home');
};
celebrate=function(){};
window.addEventListener('DOMContentLoaded',()=>{const f=document.querySelector('.footer');if(f)f.innerHTML='App. eStore | CE+PI<br><small>Fran Lima</small>';const box=document.querySelector('.loginbox'),logo=document.querySelector('.loginlogo');if(box&&logo&&!document.querySelector('.loginHeroPhotoV3')){const hero=document.createElement('div');hero.className='loginHeroPhotoV3';logo.insertAdjacentElement('afterend',hero)}});

/* ===== V4: metas, compartilhamento, saudação e mídia administrável ===== */
function greetingV4(){const h=new Date().getHours();return h<12?'Bom dia':h<18?'Boa tarde':'Boa noite'}
function samePeriodV4(d,p,asof){if(!d||!asof)return false;if(p==='day')return d===asof;if(p==='month')return d.slice(0,7)===asof.slice(0,7);if(p==='year')return d.slice(0,4)===asof.slice(0,4);const mon=x=>{const z=new Date(x+'T12:00:00'),k=(z.getDay()+6)%7;z.setDate(z.getDate()-k);return z.toISOString().slice(0,10)};return mon(d)===mon(asof)}
async function loadContentV3(){try{const [cr,dr]=await Promise.all([fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'content_get'})}),fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'delta'})})]);const c=await cr.json(),d=await dr.json();if(cr.ok&&c.ok)APP_CONTENT={importantInfo:Array.isArray(c.importantInfo)?c.importantInfo:[],campaigns:Array.isArray(c.campaigns)?c.campaigns:[],media:Array.isArray(c.media)?c.media:[]};if(dr.ok&&d.ok)APP_DELTA=d;applyMediaV4()}catch(e){}}
function activeMediaV4(position){const today=new Date().toISOString().slice(0,10);return (APP_CONTENT.media||[]).filter(x=>x.active!==false&&x.position===position&&(!x.start||x.start<=today)&&(!x.end||x.end>=today)).sort((a,b)=>(b.id||0)-(a.id||0))[0]||null}
function mediaStyleV4(position){const m=activeMediaV4(position);return m?.image?`style="background-image:linear-gradient(180deg,rgba(23,63,53,.05),rgba(23,63,53,.38)),url('${m.image}')"`:''}
function applyMediaV4(){const m=activeMediaV4('Login'),el=document.querySelector('.loginHeroPhotoV3');if(el&&m?.image)el.style.backgroundImage="linear-gradient(180deg,rgba(23,63,53,.04),rgba(23,63,53,.30)),url('"+m.image+"')"}
async function preloadPublicMediaV4(){try{const r=await fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'content_get'})});const j=await r.json();if(r.ok&&j.ok){APP_CONTENT.media=Array.isArray(j.media)?j.media:[];applyMediaV4()}}catch(e){}}

function metaDistributionV4(period){const asof=APP_DELTA?.asof||COMMON.asof||'',st=String(U.u.st),meta=APP_DELTA?.meta||{},hcS=APP_DELTA?.hcSchedule||{};let individual=0,configured=0;for(const d of Object.keys(meta)){if(!samePeriodV4(d,period,asof))continue;const v=Number(meta[d]?.[st]?.metaEstore||0),hc=Number(hcS[d]?.[st]?.hc||0);if(v>0&&hc>0){individual+=v/hc;configured++}}return {individual:+individual.toFixed(2),configured}}
function metaSnapshotV4(){const sp=storeP(),target=Number(sp.ef||sp.ee||0),orders=Math.ceil(target/400);return `<div class="metaSnapshotV4"><div><small>Meta ${pLabel[PER]} • Filial</small><b>${money(target)}</b><span>${num(orders)} pedidos referência</span></div><div><small>Resultado da filial</small><b>${money(sp.c)}</b><span>${target?pct(sp.c/target):'—'}</span></div><button onclick="go('metasv4')">Ver metas ›</button></div>`}
function metasV4(){const x=person(),sp=storeP(),storeTarget=Number(sp.ef||sp.ee||0),storeOrders=Math.ceil(storeTarget/400),dist=metaDistributionV4(PER),myTarget=dist.configured?dist.individual:null,myOrders=myTarget==null?null:Math.ceil(myTarget/400),att=myTarget?x.c/myTarget:0,left=myTarget==null?null:Math.max(myTarget-x.c,0);return `<div class=pageTitleV3><span>Metas</span></div><div class=card>${tabs()}<div class=metricGridV3><div class="metricCardV3 mGreenV3"><span>Meta da filial</span><b>${money(storeTarget)}</b><small>${num(storeOrders)} pedidos referência</small></div><div class="metricCardV3 mRoseV3"><span>Resultado da filial</span><b>${money(sp.c)}</b><small>${num(sp.o)} pedidos</small></div><div class="metricCardV3 mOrangeV3"><span>Atingimento filial</span><b>${storeTarget?pct(sp.c/storeTarget):'—'}</b></div><div class="metricCardV3 mSandV3"><span>Falta para a meta</span><b>${money(Math.max(storeTarget-sp.c,0))}</b></div></div><div class=targetPersonalV4><div class=title>Sua meta distribuída</div>${myTarget==null?`<div class=notice>O supervisor ainda não registrou a distribuição por HC para os dias deste período.</div>`:`<div class=metricGridV3><div class="metricCardV3 mGreenV3"><span>Meta individual</span><b>${money(myTarget)}</b></div><div class="metricCardV3 mOrangeV3"><span>Pedidos meta</span><b>${num(myOrders)}</b></div><div class="metricCardV3 mSandV3"><span>Atingimento</span><b>${pct(att)}</b></div><div class="metricCardV3 mRoseV3"><span>Falta</span><b>${money(left)}</b></div></div>${progressV3(att)}<small class=muted>${dist.configured} dia(s) com distribuição por HC.</small>`}</div>${supV3()?hcDistributionV4():''}</div><div class=shareBarV4><button onclick="shareMetaV4()">Compartilhar no WhatsApp</button></div>`}
function localIsoV4(){const d=new Date(),p=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())}
function hcDistributionV4(){const d=localIsoV4(),st=String(U.u.st),saved=Number(APP_DELTA?.hcSchedule?.[d]?.[st]?.hc||0);return `<div class=hcBoxV4><div class=title>Distribuição diária por HC</div><div class=hcGridV4><label>Data<input class=field id=hcDateV4 type=date value="${d}" onchange="previewHcV4()"></label><label>HC disponível<input class=field id=hcCountV4 type=number min=1 max=500 value="${saved||''}" placeholder="Ex.: 20" oninput="previewHcV4()"></label></div><div id=hcPreviewV4>${hcPreviewHtmlV4(d,saved)}</div><button class=btn onclick="saveHcV4()">Salvar distribuição do dia</button><div id=hcOutV4></div></div>`}
function hcPreviewHtmlV4(d,hc){const st=String(U.u.st),m=Number(APP_DELTA?.meta?.[d]?.[st]?.metaEstore||0);if(!d||!hc)return '<p class=muted>Informe o HC disponível para calcular a distribuição.</p>';return `<div class=metricGridV3><div class="metricCardV3 mGreenV3"><span>Meta da loja</span><b>${money(m)}</b></div><div class="metricCardV3 mSandV3"><span>HC</span><b>${num(hc)}</b></div><div class="metricCardV3 mOrangeV3"><span>Meta por colaborador</span><b>${money(hc?m/hc:0)}</b></div><div class="metricCardV3 mRoseV3"><span>Pedidos sugeridos</span><b>${num(hc?Math.ceil((m/hc)/400):0)}</b></div></div>`}
function previewHcV4(){const d=$('#hcDateV4')?.value,h=Number($('#hcCountV4')?.value||0),e=$('#hcPreviewV4');if(e)e.innerHTML=hcPreviewHtmlV4(d,h)}
async function saveHcV4(){const d=$('#hcDateV4')?.value,h=Math.trunc(Number($('#hcCountV4')?.value||0)),out=$('#hcOutV4');if(!d||h<1){out.innerHTML='<p class=bad>Informe a data e o HC disponível.</p>';return}try{const r=await fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'hc_set',matricula:String(U.u.id),st:String(U.u.st),date:d,hc:h})});const j=await r.json();if(!r.ok||!j.ok)throw new Error(j.error||'Não foi possível salvar.');APP_DELTA.hcSchedule=APP_DELTA.hcSchedule||{};APP_DELTA.hcSchedule[d]=APP_DELTA.hcSchedule[d]||{};APP_DELTA.hcSchedule[d][String(U.u.st)]={hc:h};out.innerHTML='<div class=notice>Distribuição por HC salva.</div>';setTimeout(()=>go('metasv4'),700)}catch(e){out.innerHTML='<p class=bad>'+escV3(e.message||e)+'</p>'}}

function shareLinesV4(type){const x=person(),sp=storeP();if(type==='result')return ['Meu Resultado • '+pLabel[PER],'Captada: '+money(x.c),'Aprovada: '+money(x.a),'Pedidos: '+num(x.o),'Comissão: '+money(x.com)];if(type==='store')return ['Filial '+storeFullV3()+' • '+pLabel[PER],'Meta: '+money(sp.ef||sp.ee),'Realizado: '+money(sp.c),'Atingimento: '+pct(sp.att),'Share: '+pct(sp.share),'Pedidos: '+num(sp.o)];if(type==='meta'){const d=metaDistributionV4(PER),t=d.configured?d.individual:null;return ['Metas • '+pLabel[PER],'Meta filial: '+money(sp.ef||sp.ee),'Realizado: '+money(x.c),t!=null?'Meta individual: '+money(t):'Meta individual: aguardando distribuição por HC',t!=null?'Pedidos meta: '+num(Math.ceil(t/400)):'']}if(type==='pool'){const p=U.pool||{};return ['Pool eStore','Venda aprovada: '+money(p.approved||0),'Pool 3%: '+money(p.pool||0),'Elegíveis: '+num(p.eligible?.length||0),'Rateio estimado: '+money(p.sim||0)]}if(type==='team'){const a=U.team?.[PER]||[];return ['Meu Time • '+pLabel[PER],'Colaboradores: '+num(a.length),'Ativos: '+num(a.filter(v=>(v.c||0)>0).length),'Venda captada: '+money(a.reduce((sum,v)=>sum+Number(v.c||0),0))]}return ['Ranking eStore • '+pLabel[PER],'Filial '+U.u.st,'Minha posição CE+PI: '+(x.rr?num(x.rr)+'º':'—'),'Venda captada: '+money(x.c)]}
function shareV4(type,title){const lines=shareLinesV4(type).filter(Boolean),text=title+'\n'+lines.join('\n');shareCanvas(canvasCard(title,lines),text)}
function shareResultV4(){shareV4('result','Meu Resultado eStore')} function shareStoreV4(){shareV4('store','Dashboard eStore')} function shareMetaV4(){shareV4('meta','Metas eStore')} function sharePoolV4(){shareV4('pool','Pool eStore')} function shareTeamV4(){shareV4('team','Meu Time eStore')} function shareRankingV4(){shareV4('ranking','Ranking eStore')}
function shareBarV4(type){const fn='share'+type[0].toUpperCase()+type.slice(1)+'V4()';return `<div class=shareBarV4><button onclick="${fn}">Compartilhar no WhatsApp</button></div>`}

home=function(){const x=person();return `<div class="homeBannerV3"><div><small>App. eStore | CE+PI</small><h1>${greetingV4()}, ${escV3(firstV3())}!</h1></div></div>${recognitionV3()}<div class="brandPhotoCardV3" ${mediaStyleV4('Home')}><div class="brandPhotoOverlayV3"><b>${escV3(activeMediaV4('Home')?.title||'Moda que inspira o Brasil')}</b></div></div>${metaSnapshotV4()}<div class=card><div class=sectionHeadV3><div><div class=title>Resultado • ${pLabel[PER]}</div><small>${escV3(storeFullV3())}</small></div>${tabs()}</div><div class=metricGridV3><div class="metricCardV3 mGreenV3"><span>▥ Venda captada</span><b>${money(x.c)}</b></div><div class="metricCardV3 mRoseV3"><span>▣ Venda aprovada</span><b>${money(x.a)}</b></div><div class="metricCardV3 mOrangeV3"><span>▤ Pedidos</span><b>${num(x.o)}</b></div><div class="metricCardV3 mSandV3"><span>◇ Ticket médio</span><b>${x.o?money(x.c/x.o):money(0)}</b></div></div></div>`}
const resultBaseV4=result;result=function(){return resultBaseV4()+shareBarV4('result')};const storeBaseV4=store;store=function(){return storeBaseV4()+shareBarV4('store')};const rankingBaseV4=ranking;ranking=function(){return rankingBaseV4()+shareBarV4('ranking')};const poolBaseV4=poolV3;poolV3=function(){return poolBaseV4()+shareBarV4('pool')};const teamBaseV4=teamV3;teamV3=function(){return teamBaseV4()+shareBarV4('team')};

function refreshNavV4(){const sh=document.querySelector('#drawer .sheet');if(sh)sh.innerHTML=`<div class="menuHeadV3"><div>${profileAvatarV3('sm')}<div><b>${escV3(U?.u?.name||'')}</b><small>${escV3(storeFullV3())}</small></div></div></div><button onclick="go('home')">⌂ Início</button><button onclick="go('result')">▣ Meu Resultado</button><button onclick="go('metasv4')">◎ Metas</button><button onclick="go('store')">▤ Minha Filial</button><button onclick="go('ranking')">★ Ranking</button><button onclick="go('campaigns')">◇ Cupons e Campanhas</button>${supV3()?`<button onclick="go('poolv3')">◎ Pool / Comissão</button>`:''}<button onclick="go('important')">ⓘ Informações Importantes</button>${supV3()?`<button onclick="go('teamv3')">♙ Meu Time</button><button onclick="go('reportsv3')">▥ Relatórios e Rankings</button>`:''}<button onclick="go('profilev3')">◉ Meu Perfil</button>${admV3()?`<button onclick="go('adminv3')">⚙ Administrativo</button>`:''}<button class="logoutBtn" onclick="logoutApp()">↪ Sair</button>`;const nav=document.getElementById('nav');if(nav)nav.innerHTML=`<button onclick="go('home')"><span>⌂</span>Início</button><button onclick="go('result')"><span>▣</span>Vendas</button><button onclick="go('metasv4')"><span>◎</span>Metas</button><button onclick="go('ranking')"><span>★</span>Ranking</button><button onclick="go('profilev3')"><span>◉</span>Perfil</button>`;const footer=document.querySelector('.footer');if(footer)footer.innerHTML='App. eStore | CE+PI<br><small>Fran Lima</small>'}
refreshNavV3=refreshNavV4;

function resizeImageV4(file){return new Promise((resolve,reject)=>{const img=new Image(),r=new FileReader();r.onload=()=>img.src=r.result;img.onload=()=>{const max=1400,scale=Math.min(1,max/img.width),c=document.createElement('canvas');c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);c.getContext('2d').drawImage(img,0,0,c.width,c.height);resolve(c.toDataURL('image/jpeg',.78))};img.onerror=reject;r.onerror=reject;r.readAsDataURL(file)})}
function mediaAdminV4(){const items=APP_CONTENT.media||[];return `<div class=card id=admMediaV4><div class=title>Imagens / Cards Institucionais</div><p class=muted>Use somente imagens oficiais Riachuelo. Atualize Login, Home, Campanhas ou Informações Importantes sem alterar o código.</p><div class=adminFormV3><input id=mediaTitleV4 class=field placeholder="Título do card ou campanha"><select id=mediaPositionV4 class=field><option>Home</option><option>Login</option><option>Campanhas</option><option>Informações Importantes</option></select><select id=mediaAudienceV4 class=field><option>Todos</option><option>Colaborador</option><option>Supervisor</option></select><input id=mediaStartV4 class=field type=date><input id=mediaEndV4 class=field type=date><input id=mediaFileV4 class=field type=file accept="image/*"><input id=mediaPwdV4 class=field type=password placeholder="Senha ADM"></div><button class=btn onclick="publishMediaV4()">Publicar imagem</button><div id=mediaOutV4></div>${items.length?`<div class=mediaListV4>${items.slice(0,8).map(m=>`<div><span>${escV3(m.position)}</span><b>${escV3(m.title||'Imagem institucional')}</b><small>${escV3(m.start||'')} ${m.end?'→ '+escV3(m.end):''}</small></div>`).join('')}</div>`:''}</div>`}
async function publishMediaV4(){const file=$('#mediaFileV4')?.files?.[0],title=$('#mediaTitleV4')?.value.trim(),password=$('#mediaPwdV4')?.value||'',out=$('#mediaOutV4');if(!file||!password){out.innerHTML='<p class=bad>Selecione uma imagem e informe a senha ADM.</p>';return}try{out.innerHTML='<div class=notice>Preparando imagem...</div>';const image=await resizeImageV4(file),item={id:Date.now(),title:title||'',position:$('#mediaPositionV4').value,audience:$('#mediaAudienceV4').value,start:$('#mediaStartV4').value,end:$('#mediaEndV4').value,image,active:true},value=[item,...(APP_CONTENT.media||[])].slice(0,20),r=await fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'content_publish',kind:'institutional_media',value,matricula:String(U.u.id),password})}),j=await r.json();if(!r.ok||!j.ok)throw new Error(j.error||'Falha ao publicar imagem.');APP_CONTENT.media=value;out.innerHTML='<div class=notice>Imagem publicada.</div>';applyMediaV4();setTimeout(()=>go('adminv3'),700)}catch(e){out.innerHTML='<p class=bad>'+escV3(e.message||e)+'</p>'}}
const adminBaseV4=adminV3;adminV3=function(){return adminBaseV4()+mediaAdminV4()};

go=function(v){CUR=v;$('#drawer')?.classList.remove('open');const map={home,result,metasv4:metasV4,store,ranking,campaigns:campaignsV3,poolv3:poolV3,important:importantV3,teamv3:teamV3,reportsv3:reportsV3,profilev3:profileV3,adminv3:adminV3,admin:adminV3};$('#view').innerHTML=(map[v]||home)();window.scrollTo(0,0);applyMediaV4()}
window.addEventListener('DOMContentLoaded',preloadPublicMediaV4);

function mediaBannerV4(position){const m=activeMediaV4(position);return m?.image?`<div class=mediaBannerV4 style="background-image:url('${m.image}')"><div><b>${escV3(m.title||'')}</b></div></div>`:''}
const campaignsBaseV4=campaignsV3;campaignsV3=function(){return mediaBannerV4('Campanhas')+campaignsBaseV4()}
const importantBaseV4=importantV3;importantV3=function(){return mediaBannerV4('Informações Importantes')+importantBaseV4()}


/* ===== V5: foto compartilhada, pool executivo, suporte e hora a hora ===== */
let APP_PROFILE_PHOTOS={};
let SUPPORT_TARGET=null;
let HOURLY_SORT='att';
let HOURLY_CACHE=null;

async function loadContentV3(){
  try{
    const [cr,dr]=await Promise.all([
      fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'content_get'})}),
      fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'delta'})})
    ]);
    const c=await cr.json(),d=await dr.json();
    if(cr.ok&&c.ok){
      APP_CONTENT={importantInfo:Array.isArray(c.importantInfo)?c.importantInfo:[],campaigns:Array.isArray(c.campaigns)?c.campaigns:[],media:Array.isArray(c.media)?c.media:[]};
      APP_PROFILE_PHOTOS=c.profilePhotos||{};
    }
    if(dr.ok&&d.ok)APP_DELTA=d;
    applyMediaV4();
  }catch(e){}
}
function avatarForV5(id,name,size='xs'){
  const url=APP_PROFILE_PHOTOS[String(id)]||(String(id)===String(U?.u?.id)?profilePhotoV3():'');
  return url?`<img class="profilePicV3 ${size}" src="${escV3(url)}" alt="">`:`<div class="profileInitialV3 ${size}">${escV3(String(name||'?').trim().slice(0,1)||'?')}</div>`;
}
profileAvatarV3=function(size='md'){return avatarForV5(U?.u?.id,U?.u?.name,size)};

function compressProfileV5(file){
  return new Promise((resolve,reject)=>{
    const img=new Image(),r=new FileReader();
    r.onload=()=>img.src=r.result;
    img.onload=()=>{
      const side=Math.min(img.width,img.height),sx=(img.width-side)/2,sy=(img.height-side)/2,c=document.createElement('canvas');
      c.width=480;c.height=480;c.getContext('2d').drawImage(img,sx,sy,side,side,0,0,480,480);
      resolve(c.toDataURL('image/jpeg',.82));
    };
    img.onerror=reject;r.onerror=reject;r.readAsDataURL(file);
  });
}
saveProfilePhotoV3=async function(input){
  const f=input?.files?.[0];if(!f)return;
  if(f.size>10485760){alert('Selecione uma imagem de até 10 MB.');return}
  const labels=document.querySelectorAll('.editPhotoV3,.photoBtnV3');labels.forEach(e=>e.classList.add('uploadingV5'));
  try{
    const dataUrl=await compressProfileV5(f);
    const r=await fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'profile_photo_set',matricula:String(U.u.id),dataUrl})});
    const j=await r.json();if(!r.ok||!j.ok)throw new Error(j.error||'Não foi possível salvar a foto.');
    APP_PROFILE_PHOTOS[String(U.u.id)]=j.photo_url;
    try{localStorage.setItem(profilePhotoKeyV3(),j.photo_url)}catch(e){}
    refreshNavV5();go('profilev3');
  }catch(e){alert(String(e.message||e))}
  finally{labels.forEach(e=>e.classList.remove('uploadingV5'))}
};

ranking=function(){
  const me=person();let body='';
  if(RANK_SCOPE==='regional'){
    const a=COMMON.top?.[PER]||[];
    body=a.map((x,i)=>`<div class="rank rankV3 ${String(x.id)===String(U.u.id)?'meRankV3':''}"><div class=medal>${i<3?['🥇','🥈','🥉'][i]:i+1+'º'}</div><div>${avatarForV5(x.id,x.name,'xs')}<section><b>${escV3(String(x.id)===String(U.u.id)?'Você':x.name)}</b><div class=muted>Filial ${escV3(x.st)}</div></section></div><span><b>${money(x.c)}</b><br><small>${num(x.o)} pedidos</small></span></div>`).join('')||'<p class=muted>Sem resultados no período.</p>';
  }else if(RANK_SCOPE==='filial'){
    const a=(U.team?.[PER]||[]).length?(U.team[PER]||[]):((st().p?.[PER]?.top)||[]);
    body=[...a].sort((a,b)=>(b.c||0)-(a.c||0)).map((x,i)=>`<div class="rank rankV3 ${String(x.id)===String(U.u.id)?'meRankV3':''}"><div class=medal>${i+1}º</div><div>${avatarForV5(x.id,x.name,'xs')}<section><b>${escV3(String(x.id)===String(U.u.id)?'Você':x.name)}</b></section></div><span><b>${money(x.c)}</b><br><small>${num(x.o)} pedidos</small></span></div>`).join('')||'<p class=muted>Sem resultados no período.</p>';
  }else body=`<div class=metricGridV3><div class="metricCardV3 mGreenV3"><span>Posição empresa</span><b>${me.nr?num(me.nr)+'º':'—'}</b></div><div class="metricCardV3 mSandV3"><span>Venda captada</span><b>${money(me.c)}</b></div></div>`;
  return `<div class=pageTitleV3><span>Ranking</span></div><div class=card><div class=scopeTabs><button class="${RANK_SCOPE==='filial'?'on':''}" onclick="setRankV3('filial')">Filial</button><button class="${RANK_SCOPE==='regional'?'on':''}" onclick="setRankV3('regional')">Regional</button><button class="${RANK_SCOPE==='empresa'?'on':''}" onclick="setRankV3('empresa')">Empresa</button></div>${tabs()}${body}</div>${shareBarV4('ranking')}`;
};
teamV3=function(){
 if(!supV3())return '<div class=card><div class=title>Meu Time</div><p>Conteúdo disponível para liderança.</p></div>';
 const a=U.team?.[PER]||[],yes=a.filter(x=>(x.c||0)>0),no=a.filter(x=>(x.c||0)===0),sorted=[...a].sort((x,y)=>(y.c||0)-(x.c||0));
 return `<div class=pageTitleV3><span>Meu Time</span></div><div class=card>${tabs()}<div class=metricGridV3><div class="metricCardV3 mGreenV3"><span>Ativos eStore</span><b>${num(yes.length)}</b></div><div class="metricCardV3 mLowV3"><span>Zerados</span><b>${num(no.length)}</b></div><div class="metricCardV3 mSandV3"><span>Venda captada</span><b>${money(yes.reduce((s,x)=>s+(x.c||0),0))}</b></div><div class="metricCardV3 mOrangeV3"><span>Pedidos</span><b>${num(yes.reduce((s,x)=>s+(x.o||0),0))}</b></div></div><div class=title style="margin-top:16px">Ranking da equipe <small class=autoTagV3>Automático</small></div><div class=teamRankV3>${sorted.map((x,i)=>{const status=(x.c||0)>0?(i<Math.ceil(sorted.length*.33)?['Alta','perfGoodV3']:i<Math.ceil(sorted.length*.66)?['Média','perfMidV3']:['Baixa','perfLowV3']):['Zerado','perfLowV3'];return `<div class=teamRankRowV5><span class=posV3>${i+1}</span>${avatarForV5(x.id,x.name,'xs')}<b>${escV3(String(x.id)===String(U.u.id)?'Você':x.name)}</b><strong>${money(x.c)}</strong><em class="${status[1]}">${status[0]}</em></div>`}).join('')}</div></div>${shareBarV4('team')}`;
};

function poolSummaryV5(x){
  const month=storeP(),series=poolSeriesV3(),last=series[series.length-1]?.value||0,prev=series[series.length-2]?.value||0,delta=prev?last/prev-1:null;
  return `<div class=poolExecutiveV5><div><small>Seu rateio estimado</small><b>${money(x.sim||0)}</b><span>Pool total: ${money(x.pool||0)}</span></div><div class=poolExecGridV5><span><small>Venda aprovada</small><b>${money(x.approved||0)}</b></span><span><small>Elegíveis</small><b>${num(x.eligible?.length||0)}</b></span><span><small>Variação</small><b class="${delta==null?'':delta>=0?'perfGoodV3':'perfLowV3'}">${delta==null?'—':(delta>=0?'▲ ':'▼ ')+Math.abs(delta*100).toLocaleString('pt-BR',{maximumFractionDigits:1})+'%'}</b></span></div></div>`;
}
poolV3=function(){
 if(!supV3())return '<div class=card><div class=title>Pool / Comissão</div><p>Conteúdo disponível para supervisores elegíveis.</p></div>';
 const x=U.pool||{approved:0,pool:0,eligible:[],sim:0},hist=poolSeriesV3(),mx=Math.max(1,...hist.map(h=>h.value));
 return `<div class=pageTitleV3><span>Pool / Comissionamento</span></div><div class=card>${poolSummaryV5(x)}<div class=metricGridV3><div class="metricCardV3 mRoseV3"><span>Venda aprovada da loja</span><b>${money(x.approved)}</b></div><div class="metricCardV3 mOrangeV3"><span>Pool 3%</span><b>${money(x.pool)}</b></div><div class="metricCardV3 mGreenV3"><span>Supervisores elegíveis</span><b>${num(x.eligible?.length||0)}</b></div><div class="metricCardV3 mSandV3"><span>Rateio estimado</span><b>${money(x.sim)}</b></div></div><div class=title style="margin-top:16px">Regras do Pool</div><ol class=rulesV3><li>3% sobre o valor aprovado da loja.</li><li>Rateio igualitário entre supervisores elegíveis.</li><li>Elegíveis conforme perfil e situação ativa no período.</li><li>Mês parcial considera o período trabalhado conforme regra da campanha.</li></ol><div class=chartCardV3><div class=chartTitleV3><div><b>Evolução do Pool</b><small>Histórico considerado a partir de agosto/2026</small></div><span>R$</span></div><div class=poolTabsV3><button class="${POOL_VIEW==='day'?'on':''}" onclick="setPoolViewV3('day')">Dia</button><button class="${POOL_VIEW==='week'?'on':''}" onclick="setPoolViewV3('week')">Semana</button><button class="${POOL_VIEW==='month'?'on':''}" onclick="setPoolViewV3('month')">Mês</button></div>${hist.length?`<div class=barChartV3>${hist.map(h=>`<div><span style="height:${Math.max(8,h.value/mx*110)}px"></span><small>${h.label}</small><em>${money(h.value)}</em></div>`).join('')}</div>`:'<p class=muted>O gráfico será preenchido conforme as cargas diárias forem incorporadas ao histórico.</p>'}</div></div>${shareBarV4('pool')}`;
};

function loadImgV5(url){return new Promise(resolve=>{if(!url)return resolve(null);const img=new Image();img.crossOrigin='anonymous';img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src=url})}
function rankingRowsV5(type){
  if(type==='store'||type==='meta')return (storeP().top||[]).slice(0,5);
  if(type==='team')return [...(U.team?.[PER]||[])].sort((a,b)=>(b.c||0)-(a.c||0)).slice(0,5);
  if(type==='ranking'&&RANK_SCOPE==='filial')return [...(U.team?.[PER]||[])].sort((a,b)=>(b.c||0)-(a.c||0)).slice(0,5);
  return (COMMON.top?.[PER]||[]).slice(0,5);
}
async function highlightsCanvasV5(type,title){
  const rows=rankingRowsV5(type),c=document.createElement('canvas');c.width=1080;c.height=1500;const x=c.getContext('2d');
  x.fillStyle='#f8f7f4';x.fillRect(0,0,c.width,c.height);x.fillStyle='#173F35';x.fillRect(0,0,c.width,210);
  x.fillStyle='white';x.font='bold 50px Arial';x.fillText(title,65,90);x.font='30px Arial';x.fillText('Período: '+pLabel[PER]+' • '+storeFullV3(),65,145);
  x.fillStyle='#173F35';x.font='bold 38px Arial';x.fillText('Destaques do período',65,285);
  let y=345;
  for(let i=0;i<rows.length;i++){
    const r=rows[i],url=APP_PROFILE_PHOTOS[String(r.id)]||'',img=await loadImgV5(url);
    x.fillStyle=i<3?'#fff4dc':'#ffffff';x.beginPath();x.roundRect(55,y,970,155,26);x.fill();
    x.fillStyle='#173F35';x.font='bold 34px Arial';x.fillText((i+1)+'º',80,y+90);
    if(img){x.save();x.beginPath();x.arc(175,y+77,48,0,Math.PI*2);x.clip();x.drawImage(img,127,y+29,96,96);x.restore()}
    else{x.fillStyle='#D6D2C4';x.beginPath();x.arc(175,y+77,48,0,Math.PI*2);x.fill();x.fillStyle='#173F35';x.font='bold 34px Arial';x.fillText(String(r.name||'?').slice(0,1),164,y+89)}
    x.fillStyle='#173F35';x.font='bold 27px Arial';const nm=String(r.name||'').split(' ').slice(0,3).join(' ');x.fillText(nm,245,y+63);
    x.fillStyle='#466964';x.font='24px Arial';x.fillText('Filial '+(r.st||U.u.st),245,y+100);
    x.fillStyle='#173F35';x.font='bold 28px Arial';x.textAlign='right';x.fillText(money(r.c||0),990,y+78);x.textAlign='left';
    y+=172;
  }
  const lines=shareLinesV4(type).filter(Boolean);x.fillStyle='#173F35';x.font='bold 30px Arial';x.fillText('Resumo',65,y+30);x.font='26px Arial';let yy=y+78;for(const l of lines.slice(0,5)){x.fillText(l,65,yy);yy+=42}
  x.fillStyle='#173F35';x.font='bold 24px Arial';x.fillText('Fran Lima',65,1440);return c;
}
async function shareHighlightsV5(type,title){const c=await highlightsCanvasV5(type,title),lines=shareLinesV4(type).filter(Boolean),text=title+'\n'+lines.join('\n');shareCanvas(c,text)}
shareResultV4=function(){return shareHighlightsV5('result','Destaques eStore | '+pLabel[PER])};
shareStoreV4=function(){return shareHighlightsV5('store','Destaques Filial | '+pLabel[PER])};
shareMetaV4=function(){return shareHighlightsV5('meta','Metas eStore | '+pLabel[PER])};
shareTeamV4=function(){return shareHighlightsV5('team','Destaques Meu Time | '+pLabel[PER])};
shareRankingV4=function(){return shareHighlightsV5('ranking','Ranking eStore | '+pLabel[PER])};

function supportV5(){
  return `<div class=pageTitleV3><span>Chat / Suporte</span></div><div class=card><div id=supportTopV5></div><div id=supportMessagesV5 class=supportMessagesV5><div class=notice>Carregando conversa...</div></div><div class=supportComposeV5><textarea id=supportTextV5 class=field rows=2 placeholder="Digite sua mensagem"></textarea><label class=attachBtnV5>＋ Anexar<input id=supportFileV5 type=file accept="image/*,.pdf,.xlsx,.xls,.csv,.doc,.docx"></label><button class=btn onclick="sendSupportV5()">Enviar</button></div><div id=supportOutV5></div></div>`;
}
async function loadSupportV5(){
  try{
    const isAdmin=admV3(),body={action:'support_get',matricula:String(U.u.id)};
    if(isAdmin&&SUPPORT_TARGET)body.target=SUPPORT_TARGET;
    if(isAdmin&&!SUPPORT_TARGET)body.listThreads=true;
    const r=await fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}),j=await r.json();
    if(!r.ok||!j.ok)throw new Error(j.error||'Falha ao carregar o chat.');
    if(isAdmin&&!SUPPORT_TARGET){renderSupportThreadsV5(j.threads||[]);return}
    renderSupportMessagesV5(j.messages||[]);
  }catch(e){$('#supportMessagesV5').innerHTML='<p class=bad>'+escV3(e.message||e)+'</p>'}
}
function renderSupportThreadsV5(threads){
  $('#supportTopV5').innerHTML='<div class=title>Conversas</div>';
  $('#supportMessagesV5').innerHTML=threads.length?`<div class=supportThreadsV5>${threads.map(t=>`<button onclick="openSupportThreadV5('${escV3(t.matricula)}')"><b>${escV3(t.matricula)}</b><span>Filial ${escV3(t.store_code||'—')}</span><small>${escV3((t.message||t.attachment_name||'Arquivo').slice(0,55))}</small></button>`).join('')}</div>`:'<p class=muted>Nenhuma conversa ainda.</p>';
  document.querySelector('.supportComposeV5')?.classList.add('hide');
}
function openSupportThreadV5(id){SUPPORT_TARGET=id;go('supportv5');setTimeout(loadSupportV5,0)}
function renderSupportMessagesV5(messages){
  if(admV3()&&SUPPORT_TARGET)$('#supportTopV5').innerHTML=`<button class=backChatV5 onclick="SUPPORT_TARGET=null;go('supportv5');setTimeout(loadSupportV5,0)">‹ Conversas</button><b>Matrícula ${escV3(SUPPORT_TARGET)}</b>`;
  const el=$('#supportMessagesV5');el.innerHTML=messages.length?messages.map(m=>`<div class="chatBubbleV5 ${m.sender_role==='admin'?'fromAdminV5':'fromUserV5'}"><p>${escV3(m.message||'')}</p>${m.attachment_url?`<a href="${escV3(m.attachment_url)}" target="_blank">${String(m.attachment_type||'').startsWith('image/')?`<img src="${escV3(m.attachment_url)}" alt="">`:'📎 '+escV3(m.attachment_name||'Arquivo')}</a>`:''}<small>${new Date(m.created_at).toLocaleString('pt-BR')}</small></div>`).join(''):'<p class=muted>Envie uma mensagem, foto ou arquivo para iniciar a conversa.</p>';el.scrollTop=el.scrollHeight;
}
async function sendSupportV5(){
 const text=$('#supportTextV5')?.value.trim()||'',file=$('#supportFileV5')?.files?.[0],out=$('#supportOutV5');if(!text&&!file){out.innerHTML='<p class=bad>Digite uma mensagem ou anexe um arquivo.</p>';return}if(file&&file.size>10485760){out.innerHTML='<p class=bad>O arquivo deve ter no máximo 10 MB.</p>';return}
 try{const fd=new FormData();fd.append('action','support_send');fd.append('matricula',String(U.u.id));fd.append('store_code',String(U.u.st));fd.append('message',text);if(admV3()&&SUPPORT_TARGET)fd.append('target',SUPPORT_TARGET);if(file)fd.append('attachment',file);const r=await fetch(ESTORE_API,{method:'POST',body:fd}),j=await r.json();if(!r.ok||!j.ok)throw new Error(j.error||'Não foi possível enviar.');$('#supportTextV5').value='';$('#supportFileV5').value='';out.innerHTML='';await loadSupportV5()}catch(e){out.innerHTML='<p class=bad>'+escV3(e.message||e)+'</p>'}
}

function hourlyV5(){
 const d=localIsoV4();
 return `<div class=pageTitleV3><span>Hora a Hora eStore | CE+PI</span></div><div class=card><div class=hourlyEntryV5><div class=title>Lançar resultado da filial</div><div class=hourlyGridV5><label>Data<input id=hourDateV5 class=field type=date value="${d}" onchange="loadHourlyV5()"></label><label>Venda eStore capturada acumulada<input id=hourCapturedV5 class=field type=number min=0 step=.01 placeholder="R$"></label><label>Pedidos acumulados<input id=hourOrdersV5 class=field type=number min=0 step=1 placeholder="0"></label><label>Venda total da loja acumulada <small>(para calcular Share)</small><input id=hourStoreSalesV5 class=field type=number min=0 step=.01 placeholder="R$"></label></div><button class=btn onclick="submitHourlyV5()">Registrar atualização</button><div id=hourOutV5></div></div></div><div id=hourlyDashboardV5><div class=card><div class=notice>Carregando consolidado...</div></div></div>`;
}
async function submitHourlyV5(){
 const d=$('#hourDateV5').value,c=Number($('#hourCapturedV5').value||0),o=Math.trunc(Number($('#hourOrdersV5').value||0)),ss=Number($('#hourStoreSalesV5').value||0),out=$('#hourOutV5');
 try{const r=await fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'hourly_submit',matricula:String(U.u.id),store_code:String(U.u.st),result_date:d,captured:c,orders:o,store_sales:ss})}),j=await r.json();if(!r.ok||!j.ok)throw new Error(j.error||'Não foi possível registrar.');out.innerHTML='<div class=notice>Atualização registrada.</div>';await loadHourlyV5()}catch(e){out.innerHTML='<p class=bad>'+escV3(e.message||e)+'</p>'}
}
async function loadHourlyV5(){
 const d=$('#hourDateV5')?.value||localIsoV4();try{const r=await fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'hourly_get',result_date:d})}),j=await r.json();if(!r.ok||!j.ok)throw new Error(j.error||'Falha ao carregar.');HOURLY_CACHE=j;renderHourlyV5()}catch(e){$('#hourlyDashboardV5').innerHTML='<div class=card><p class=bad>'+escV3(e.message||e)+'</p></div>'}
}
function setHourlySortV5(v){HOURLY_SORT=v;renderHourlyV5()}
function hourlySortValueV5(x){return HOURLY_SORT==='sales'?x.captured:HOURLY_SORT==='share'?x.share:x.att}

function hourlySnapshotV6(j){
 const stores=j?.stores||[], regional={
  meta:stores.reduce((s,x)=>s+Number(x.metaValue||0),0),
  captured:stores.reduce((s,x)=>s+Number(x.captured||0),0),
  orders:stores.reduce((s,x)=>s+Number(x.orders||0),0),
  orderTarget:stores.reduce((s,x)=>s+Number(x.orderTarget||0),0),
  storeSales:stores.reduce((s,x)=>s+Number(x.storeSales||0),0)
 };
 regional.att=regional.meta?regional.captured/regional.meta:0;
 regional.share=regional.storeSales?regional.captured/regional.storeSales:0;
 regional.active=stores.filter(x=>Number(x.captured||0)>0).length;
 regional.updated=stores.filter(x=>x.updated_at).length;
 return regional;
}
function hourlyPreviousV6(j){
 try{
  const key='estore_hourly_history_'+String(j.result_date), now=hourlySnapshotV6(j);
  const sig=(j.stores||[]).map(x=>String(x.st)+':'+Number(x.captured||0)+':'+Number(x.orders||0)+':'+String(x.updated_at||'')).join('|');
  let h=JSON.parse(localStorage.getItem(key)||'[]');
  const last=h[h.length-1];
  if(!last||last.sig!==sig){h.push({sig,ts:Date.now(),regional:now,stores:(j.stores||[]).map(x=>({st:String(x.st),captured:Number(x.captured||0),orders:Number(x.orders||0),share:Number(x.share||0),att:Number(x.att||0)}))});h=h.slice(-24);localStorage.setItem(key,JSON.stringify(h))}
  return h.length>1?h[h.length-2]:null;
 }catch(e){return null}
}
function deltaMarkV6(cur,prev,kind='number'){
 if(prev==null||!Number.isFinite(Number(prev)))return '<small class=hourDeltaV6>sem hora anterior</small>';
 const d=Number(cur)-Number(prev), arrow=d>0?'▲':d<0?'▼':'—', cls=d>0?'up':d<0?'down':'flat';
 let value='';
 if(kind==='money')value=(d>=0?'+':'')+money(d);
 else if(kind==='orders')value=(d>=0?'+':'')+num(d)+' pedidos';
 else if(kind==='pp')value=(d>=0?'+':'')+(d*100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+' p.p.';
 else value=(d>=0?'+':'')+num(d);
 return '<small class="hourDeltaV6 '+cls+'">'+arrow+' '+value+' vs. última atualização</small>';
}
function hourStatusV6(r){
 if(!r.updated_at)return {cls:'notfed',dot:'●',label:'NÃO ALIMENTOU'};
 if(Number(r.captured||0)<=0)return {cls:'zero',dot:'●',label:'ZERADA'};
 if(Number(r.att||0)>=.8)return {cls:'course',dot:'●',label:'EM CURSO'};
 return {cls:'attention',dot:'●',label:'ATENÇÃO'};
}
function renderHourlyV5(){
 const j=HOURLY_CACHE;if(!j)return;
 const stores=j.stores||[],regional=hourlySnapshotV6(j),prev=hourlyPreviousV6(j),p=prev?.regional||null;
 const sorted=[...stores].sort((a,b)=>Number(b.captured||0)-Number(a.captured||0));
 const top=sorted.slice(0,3),notFed=stores.filter(x=>!x.updated_at).map(x=>x.st),zero=stores.filter(x=>Number(x.captured||0)<=0).map(x=>x.st);
 $('#hourlyDashboardV5').innerHTML='<div class="card hourlyExecutiveV6"><div class=sectionHeadV3><div><div class=title>Consolidado CE+PI</div><small>'+new Date(j.result_date+'T12:00').toLocaleDateString('pt-BR')+' • Moda que inspira o Brasil</small></div><button class=hourShareBtnV5 onclick="shareHourlyV5()">Compartilhar dashboard</button></div>'+
 '<div class=hourKpisV6>'+
 '<div class="hourKpiV6 primary"><span>Venda captada</span><b>'+money(regional.captured)+'</b>'+deltaMarkV6(regional.captured,p?.captured,'money')+'</div>'+
 '<div class=hourKpiV6><span>Pedidos</span><b>'+num(regional.orders)+' / '+num(regional.orderTarget)+'</b>'+deltaMarkV6(regional.orders,p?.orders,'orders')+'</div>'+
 '<div class=hourKpiV6><span>Meta Regional</span><b>'+money(regional.meta)+'</b>'+deltaMarkV6(regional.meta,p?.meta,'money')+'</div>'+
 '<div class=hourKpiV6><span>Atingimento</span><b>'+(regional.meta?pct(regional.att):'—')+'</b>'+deltaMarkV6(regional.att,p?.att,'pp')+'</div>'+
 '<div class=hourKpiV6><span>Share Regional</span><b>'+(regional.storeSales?pct(regional.share):'—')+'</b>'+deltaMarkV6(regional.share,p?.share,'pp')+'</div>'+
 '<div class=hourKpiV6><span>Lojas com venda</span><b>'+num(regional.active)+' / 19</b>'+deltaMarkV6(regional.active,p?.active)+'</div></div>'+
 '<div class=hourTopV6><div class=hourBlockTitleV6>Top do Momento</div><div class=hourTopGridV6>'+top.map((r,i)=>'<div><strong>'+(i+1)+'º</strong><b>Loja '+escV3(r.st)+'</b><span>'+money(r.captured)+'</span></div>').join('')+'</div></div>'+
 '<div class=hourBlockTitleV6>Desempenho por Loja <small>Ordenado por venda captada • todas as 19 lojas</small></div><div class="table hourTableV6"><table><tr><th>Loja</th><th>Captado</th><th>Pedidos</th><th>Atingimento</th><th>Share</th><th>Desvio</th><th>Status</th></tr>'+
 sorted.map(r=>{const s=hourStatusV6(r),dev=Number(r.captured||0)-Number(r.metaValue||0),share=Number(r.share||0);return '<tr class="hourRowV6 '+s.cls+'"><td><b>'+escV3(r.st)+'</b></td><td>'+money(r.captured)+'</td><td>'+num(r.orders)+'/'+num(r.orderTarget)+'</td><td>'+pct(r.att)+'</td><td class="'+(share===0?'shareZeroV6':'')+'">'+(r.storeSales?pct(share):'0,00%')+'</td><td class="'+(dev>=0?'devPosV6':'devNegV6')+'">'+money(dev)+'</td><td><span class="hourLightV6 '+s.cls+'">'+s.dot+' '+s.label+'</span></td></tr>'}).join('')+'</table></div>'+
 (notFed.length?'<div class=hourAlertV6><b>⚠ Lojas que ainda não alimentaram o Hora a Hora</b><span>'+notFed.join(' • ')+'</span></div>':'')+
 '<div class=hourFooterV6><span>Moda que inspira o Brasil</span><b>Fran Lima</b></div></div>';
}
function hourlyCaptionV6(j){
 const stores=j.stores||[],r=hourlySnapshotV6(j),notFed=stores.filter(x=>!x.updated_at).map(x=>x.st),zero=stores.filter(x=>Number(x.captured||0)<=0).map(x=>x.st),hh=new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
 return '📊 PARCIAL eStore | '+hh+'\n\n'+
 '💰 Venda captada: '+money(r.captured)+'\n'+
 '🎯 Meta Regional: '+money(r.meta)+'\n'+
 '📈 Atingimento: '+(r.meta?pct(r.att):'—')+'\n'+
 '🛍️ Pedidos: '+num(r.orders)+' / '+num(r.orderTarget)+'\n'+
 '🏬 Lojas com venda: '+num(r.active)+' / 19\n\n'+
 '⚠️ Ainda não alimentaram o Hora a Hora:\n'+(notFed.length?notFed.join(' • '):'Nenhuma')+'\n\n'+
 '🔴 Lojas zeradas na parcial:\n'+(zero.length?zero.join(' • '):'Nenhuma')+'\n\n'+
 '🚀 Vamos acelerar a próxima hora!';
}
async function shareHourlyV5(){
 if(!HOURLY_CACHE)return;
 const j=HOURLY_CACHE,stores=[...(j.stores||[])].sort((a,b)=>Number(b.captured||0)-Number(a.captured||0)),r=hourlySnapshotV6(j),prev=hourlyPreviousV6(j)?.regional||null;
 const c=document.createElement('canvas');c.width=1080;c.height=1920;const x=c.getContext('2d');
 x.fillStyle='#F8F7F4';x.fillRect(0,0,1080,1920);x.fillStyle='#173F35';x.fillRect(0,0,1080,210);
 const logo=document.querySelector('header img');if(logo&&logo.complete){try{x.drawImage(logo,60,42,230,92)}catch(e){}}
 x.fillStyle='#fff';x.textAlign='right';x.font='700 38px Arial';x.fillText('HORA A HORA | '+new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),1020,78);x.font='24px Arial';x.fillText('Moda que inspira o Brasil',1020,124);x.fillText(new Date(j.result_date+'T12:00').toLocaleDateString('pt-BR'),1020,162);x.textAlign='left';
 const k=[['VENDA CAPTADA',money(r.captured),deltaMarkText(r.captured,prev?.captured,'money')],['PEDIDOS',num(r.orders)+' / '+num(r.orderTarget),deltaMarkText(r.orders,prev?.orders,'orders')],['META REGIONAL',money(r.meta),''],['ATINGIMENTO',r.meta?pct(r.att):'—',deltaMarkText(r.att,prev?.att,'pp')],['SHARE REGIONAL',r.storeSales?pct(r.share):'—',deltaMarkText(r.share,prev?.share,'pp')],['LOJAS COM VENDA',num(r.active)+' / 19',deltaMarkText(r.active,prev?.active,'number')]];
 let ky=245;k.forEach((a,i)=>{const col=i%3,row=Math.floor(i/3),xx=55+col*335,yy=ky+row*150;x.fillStyle='#fff';x.fillRect(xx,yy,305,126);x.fillStyle='#466964';x.font='700 18px Arial';x.fillText(a[0],xx+18,yy+30);x.fillStyle='#173F35';x.font='700 30px Arial';x.fillText(a[1],xx+18,yy+70);x.font='16px Arial';x.fillStyle=a[2].startsWith('▲')?'#287A55':a[2].startsWith('▼')?'#B23A3A':'#6B6B68';x.fillText(a[2],xx+18,yy+101)});
 const top=stores.slice(0,3);x.fillStyle='#173F35';x.font='700 25px Arial';x.fillText('TOP DO MOMENTO',55,575);top.forEach((a,i)=>{x.fillStyle=['#D6D2C4','#E68699','#DE7C00'][i];x.fillRect(55+i*335,600,305,72);x.fillStyle='#173F35';x.font='700 20px Arial';x.fillText((i+1)+'º  Loja '+a.st,72+i*335,628);x.font='700 19px Arial';x.fillText(money(a.captured),72+i*335,655)});
 x.fillStyle='#173F35';x.font='700 24px Arial';x.fillText('DESEMPENHO POR LOJA',55,725);x.font='15px Arial';x.fillText('Loja     Captado       Ped.     Ating.    Share      Desvio        Status',55,760);
 let y=795;x.font='17px Arial';stores.forEach((a,i)=>{const s=hourStatusV6(a),dev=Number(a.captured||0)-Number(a.metaValue||0);x.fillStyle=s.cls==='notfed'?'#FFF1E3':s.cls==='zero'?'#FDECEC':i%2?'#FFFFFF':'#F0F2EE';x.fillRect(45,y-25,990,50);x.fillStyle='#173F35';x.fillText(a.st,58,y);x.fillText(money(a.captured),118,y);x.fillText(num(a.orders)+'/'+num(a.orderTarget),300,y);x.fillText(pct(a.att),390,y);x.fillStyle=Number(a.share||0)===0?'#B42318':'#173F35';x.fillText(a.storeSales?pct(a.share):'0,00%',505,y);x.fillStyle=dev>=0?'#287A55':'#B42318';x.fillText(money(dev),620,y);x.fillStyle=s.cls==='course'?'#287A55':s.cls==='attention'?'#DE7C00':'#D92D20';x.font='700 15px Arial';x.fillText('● '+s.label,785,y);x.font='17px Arial';y+=54});
 const nf=stores.filter(a=>!a.updated_at).map(a=>a.st);x.fillStyle='#FFF1E3';x.fillRect(45,1830,990,55);x.fillStyle='#76232F';x.font='700 18px Arial';x.fillText('⚠ Ainda não alimentaram: '+(nf.length?nf.join(' • '):'Nenhuma'),62,1864);x.fillStyle='#173F35';x.font='16px Arial';x.fillText('Moda que inspira o Brasil',55,1910);x.textAlign='right';x.fillText('Fran Lima',1025,1910);
 const caption=hourlyCaptionV6(j);
 c.toBlob(async blob=>{if(!blob)return;const file=new File([blob],'parcial-estore-hora-a-hora.png',{type:'image/png'});try{if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],text:caption,title:'Parcial eStore'});return}}catch(e){if(e?.name==='AbortError')return}try{await navigator.clipboard.writeText(caption)}catch(e){};shareCanvas(c,caption)},'image/png');
}
function deltaMarkText(cur,prev,kind){
 if(prev==null||!Number.isFinite(Number(prev)))return '— sem hora anterior';
 const d=Number(cur)-Number(prev),a=d>0?'▲':d<0?'▼':'—';
 if(kind==='money')return a+' '+(d>=0?'+':'')+money(d);
 if(kind==='orders')return a+' '+(d>=0?'+':'')+num(d)+' pedidos';
 if(kind==='pp')return a+' '+(d>=0?'+':'')+(d*100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+' p.p.';
 return a+' '+(d>=0?'+':'')+num(d);
}

function refreshNavV5(){
 const sh=document.querySelector('#drawer .sheet');if(sh)sh.innerHTML=`<div class="menuHeadV3"><div>${profileAvatarV3('sm')}<div><b>${escV3(U?.u?.name||'')}</b><small>${escV3(storeFullV3())}</small></div></div></div><button onclick="go('home')">⌂ Início</button><button onclick="go('result')">▣ Meu Resultado</button><button onclick="go('metasv4')">◎ Metas</button><button onclick="go('hourlyv5')">◷ Hora a Hora CE+PI</button><button onclick="go('store')">▤ Minha Filial</button><button onclick="go('ranking')">★ Ranking</button><button onclick="go('campaigns')">◇ Cupons e Campanhas</button>${supV3()?`<button onclick="go('poolv3')">◎ Pool / Comissão</button>`:''}<button onclick="go('important')">ⓘ Informações Importantes</button>${supV3()?`<button onclick="go('teamv3')">♙ Meu Time</button><button onclick="go('reportsv3')">▥ Relatórios e Rankings</button>`:''}<button onclick="go('supportv5')">◉ Chat / Suporte</button><button onclick="go('profilev3')">◉ Meu Perfil</button>${admV3()?`<button onclick="go('adminv3')">⚙ Administrativo</button>`:''}<button class="logoutBtn" onclick="logoutApp()">↪ Sair</button>`;
 const nav=document.getElementById('nav');if(nav)nav.innerHTML=`<button onclick="go('home')"><span>⌂</span>Início</button><button onclick="go('result')"><span>▣</span>Vendas</button><button onclick="go('metasv4')"><span>◎</span>Metas</button><button onclick="go('hourlyv5')"><span>◷</span>Hora a Hora</button><button onclick="go('profilev3')"><span>◉</span>Perfil</button>`;
 const footer=document.querySelector('.footer');if(footer)footer.innerHTML='App. eStore | CE+PI<br><small>Fran Lima</small>';
}
refreshNavV3=refreshNavV5;
go=function(v){CUR=v;$('#drawer')?.classList.remove('open');const map={home,result,metasv4:metasV4,hourlyv5:hourlyV5,supportv5:supportV5,store,ranking,campaigns:campaignsV3,poolv3:poolV3,important:importantV3,teamv3:teamV3,reportsv3:reportsV3,profilev3:profileV3,adminv3:adminV3,admin:adminV3};$('#view').innerHTML=(map[v]||home)();window.scrollTo(0,0);applyMediaV4();if(v==='hourlyv5')setTimeout(loadHourlyV5,0);if(v==='supportv5')setTimeout(loadSupportV5,0)};


/* ===== V6: sessão dinâmica pelo backend + atualização imediata ===== */
async function refreshSessionV6(matricula){
  const r=await fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',body:JSON.stringify({action:'dashboard',matricula:String(matricula)})});
  const j=await r.json();
  if(!r.ok||!j.ok)throw new Error(j.error||'Não foi possível carregar a sessão atualizada.');
  U=j.user;
  COMMON=j.common;
  if(window.DB){DB.asof=j.asof||DB.asof}
  return j;
}
login=async function(){
  const id=$('#mat').value.trim();
  $('#err').textContent='Carregando resultado atualizado...';
  try{
    await refreshSessionV6(id);
    await loadContentV3();
  }catch(e){
    console.error(e);
    $('#err').textContent=String(e.message||'Não foi possível carregar sua matrícula.');
    return;
  }
  $('#login').classList.add('hide');$('#app').classList.remove('hide');$('#nav').classList.remove('hide');
  refreshNavV5();
  go('home');
  setTimeout(()=>{try{celebrate()}catch(e){}},300);
};
async function refreshNowV6(){
  const id=String(U?.u?.id||''); if(!id)return;
  const btn=document.getElementById('refreshNowV6'); if(btn){btn.disabled=true;btn.textContent='Atualizando...'}
  try{
    await refreshSessionV6(id); await loadContentV3(); refreshNavV5(); go(CUR||'home');
  }catch(e){alert(String(e.message||e))}
  finally{if(btn){btn.disabled=false;btn.textContent='Atualizar agora'}}
}


/* ===== V7: login resiliente — backend com fallback para base local ===== */
login=async function(){
  const id=$('#mat').value.trim();
  $('#err').textContent='Carregando resultado atualizado...';
  try{
    try{
      await refreshSessionV6(id);
    }catch(apiErr){
      const localUser=await loadUser(id);
      if(!localUser) throw apiErr;
      U=localUser;
      try{
        const d=await _estoreFetchDelta();
        if(d?.asof) _estoreApplyDelta(U,d);
      }catch(deltaErr){ console.warn('Atualização dinâmica indisponível; usando base local.',deltaErr); }
    }
    await loadContentV3();
  }catch(e){
    console.error(e);
    $('#err').textContent='Matrícula não localizada.';
    return;
  }
  $('#login').classList.add('hide');
  $('#app').classList.remove('hide');
  $('#nav').classList.remove('hide');
  refreshNavV5();
  go('home');
  setTimeout(()=>{try{celebrate()}catch(e){}},300);
};


/* ===== V12: Hora a Hora — Share sobre a meta geral de vendas da loja ===== */
hourlyV5=function(){
 const d=localIsoV4();
 return `<div class=pageTitleV3><span>Hora a Hora eStore | CE+PI</span></div><div class=card><div class=hourlyEntryV5><div class=title>Lançar resultado da filial</div><div class=hourlyGridV5><label>Data<input id=hourDateV5 class=field type=date value="${d}" onchange="loadHourlyV5()"></label><label>Venda eStore capturada acumulada<input id=hourCapturedV5 class=field type=number min=0 step=.01 placeholder="R$"></label><label>Pedidos acumulados<input id=hourOrdersV5 class=field type=number min=0 step=1 placeholder="0"></label></div><div class=notice>Share calculado automaticamente: venda eStore ÷ meta geral de vendas da filial no dia.</div><button class=btn onclick="submitHourlyV5()">Registrar atualização</button><div id=hourOutV5></div></div></div><div id=hourlyDashboardV5><div class=card><div class=notice>Carregando consolidado...</div></div></div>`;
};
submitHourlyV5=async function(){
 const d=$('#hourDateV5').value,c=Number($('#hourCapturedV5').value||0),o=Math.trunc(Number($('#hourOrdersV5').value||0)),out=$('#hourOutV5');
 try{const r=await fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'hourly_submit',matricula:String(U.u.id),store_code:String(U.u.st),result_date:d,captured:c,orders:o,store_sales:0})}),j=await r.json();if(!r.ok||!j.ok)throw new Error(j.error||'Não foi possível registrar.');out.innerHTML='<div class=notice>Atualização registrada.</div>';await loadHourlyV5()}catch(e){out.innerHTML='<p class=bad>'+escV3(e.message||e)+'</p>'}
};


/* ===== V13: experiência por perfil, comissão e Hora a Hora incremental ===== */
function rankInfoV13(){
 const reg=COMMON?.top?.[PER]||[],ri=reg.findIndex(x=>String(x.id)===String(U.u.id));
 const fil=(U.team?.[PER]||COMMON?.stores?.[U.u.st]?.p?.[PER]?.top||[]).slice().sort((a,b)=>Number(b.c||0)-Number(a.c||0)),fi=fil.findIndex(x=>String(x.id)===String(U.u.id));
 return {regional:ri>=0?ri+1:null,filial:fi>=0?fi+1:null,topRegional:ri>=0&&ri<10,topFilial:fi>=0&&fi<5};
}
function recognitionV13(){
 const r=rankInfoV13();
 if(r.topRegional||r.topFilial)return '<div class="recognitionV3 top10V3"><div class=recIconV3>🏆</div><div><span class=recTagV3>Reconhecimento eStore</span><h3>Parabéns! Você é incrivelmente Brasil.</h3><p>'+(r.topRegional?'Top 10 Regional • '+r.regional+'º lugar':'Top 5 da filial • '+r.filial+'º lugar')+'</p></div></div>';
 return '<div class="recognitionV3"><div class=recIconV3>★</div><div><span class=recTagV3>Sua jornada eStore</span><h3>Somos criadores de possibilidades.</h3><p>Você tem a missão de continuar inspirando moda na sua operação. Cada venda contribui para sua filial e para a Regional CE+PI.</p></div></div>';
}
function commissionSimulatorV13(){
 return '<div class="card simV13"><div class=title>Simulador de comissionamento</div><p class=muted>Veja o potencial da sua venda aprovada.</p><input id=simComV13 class=field type=number min=0 step=.01 placeholder="Valor da venda aprovada" oninput="calcCommissionV13()"><div id=simOutV13 class=simOutV13><span>Dia normal • 3% <b>R$ 0,00</b></span><span>Segunda eDay • 10% <b>R$ 0,00</b></span></div></div>';
}
function calcCommissionV13(){const v=Number(document.querySelector('#simComV13')?.value||0),e=document.querySelector('#simOutV13');if(e)e.innerHTML='<span>Dia normal • 3% <b>'+money(v*.03)+'</b></span><span>Segunda eDay • 10% <b>'+money(v*.10)+'</b></span><strong>No eDay: +'+money(v*.07)+'</strong>'}
function isMondayV13(){return new Date().getDay()===1}
function eDayAlertV13(){return isMondayV13()?'<button class="edayAlertV13" onclick="go(\'result\')"><b>⚡ Hoje é eDay • 10% de comissão</b><span>Aproveite a segunda para potencializar seus ganhos. Simular meus ganhos ›</span></button>':''}
function menuGridV13(){
 const items=[['▥','Meu Resultado','result','green'],['◎','Metas','metasv4','orange'],['◷','Hora a Hora','hourlyv5','rose'],['▤','Minha Filial','store','sand'],['★','Ranking','ranking','pink'],['◇','Cupons e Campanhas','campaigns','orange'],['ⓘ','Informações','important','green'],['◉','Chat / Suporte','supportv5','rose'],['◉','Meu Perfil','profilev3','sand']];
 if(supV3())items.splice(6,0,['◎','Pool / Comissão','poolv3','wine'],['♙','Meu Time','teamv3','green'],['▥','Relatórios','reportsv3','orange']);
 if(admV3())items.push(['⚙','Administrativo','adminv3','wine']);
 return '<div class=menuGridV13>'+items.map(i=>'<button class="'+i[3]+'" onclick="go(\''+i[2]+'\')"><b>'+i[0]+'</b><span>'+i[1]+'</span></button>').join('')+'</div>';
}
home=function(){
 return '<div class=homeBannerV3><div><small>App. eStore | CE+PI</small><h1>Olá, '+escV3(firstV3())+'!</h1><p>Moda que inspira o Brasil</p></div></div>'+eDayAlertV13()+'<div class=card><div class=title>Acessos</div><p class=muted>Menus disponíveis para o seu perfil.</p>'+menuGridV13()+'</div>';
};
result=function(){
 const x=person(),ed=eDayDataV3(),pool=U.pool||{},eligible=supV3()&&Number(pool.eligible?.length||0)>0;
 const poolPart=eligible?Number(pool.sim||0):0,total=Number(ed.commission||0)+poolPart;
 return '<div class=pageTitleV3><span>Meu Resultado</span></div>'+recognitionV13()+'<div class=card>'+tabs()+'<div class=commissionHeroV3><div><small>Comissão individual estimada</small><b>'+money(ed.commission)+'</b></div><span>'+pLabel[PER]+'</span></div><div class=edayCardV3><div class=edayTopV3><div><small>eDay • segundas</small><b>'+money(ed.eCommission)+'</b><span>10% sobre vendas aprovadas nas segundas do período.</span></div><div class=edayIconV3>⚡</div></div></div><div class=metricGridV3><div class="metricCardV3 mGreenV3"><span>Venda captada</span><b>'+money(x.c)+'</b></div><div class="metricCardV3 mRoseV3"><span>Venda aprovada</span><b>'+money(x.a)+'</b></div><div class="metricCardV3 mOrangeV3"><span>Pedidos</span><b>'+num(x.o)+'</b></div><div class="metricCardV3 mSandV3"><span>Posição CE+PI</span><b>'+(rankInfoV13().regional?rankInfoV13().regional+'º':'—')+'</b></div></div></div>'+(eligible?'<div class=card><div class=title>Meu Pool eStore</div><div class=metricGridV3><div class="metricCardV3 mRoseV3"><span>Venda aprovada da loja</span><b>'+money(pool.approved)+'</b></div><div class="metricCardV3 mOrangeV3"><span>Pool gerado • 3%</span><b>'+money(pool.pool)+'</b></div><div class="metricCardV3 mGreenV3"><span>Meu rateio estimado</span><b>'+money(poolPart)+'</b></div><div class="metricCardV3 mSandV3"><span>Total estimado</span><b>'+money(total)+'</b></div></div><p class=poolNudgeV13>Mobilize sua operação: mais venda aprovada amplia o Pool. Nas segundas, aproveite também o eDay para potencializar sua comissão individual.</p><button class=btn onclick="go(\'poolv3\')">Ver Pool e rankings</button></div>':'')+commissionSimulatorV13();
};
function hourlyV5(){
 const d=localIsoV4(),adminStore=admV3()?'<label>Filial<select id=hourStoreV13 class=field>'+Object.keys(COMMON.stores||{}).sort().map(s=>'<option value="'+s+'">'+s+'</option>').join('')+'</select></label>':'';
 return '<div class=pageTitleV3><span>Hora a Hora eStore | CE+PI</span></div><div class=card><div class=hourlyEntryV5><div class=title>Novo lançamento</div><div class=hourlyGridV5><label>Data<input id=hourDateV5 class=field type=date value="'+d+'" onchange="loadHourlyV5()"></label>'+adminStore+'<label>Venda eStore deste lançamento<input id=hourCapturedV5 class=field type=number min=0 step=.01 placeholder="+ R$"></label><label>Pedidos deste lançamento<input id=hourOrdersV5 class=field type=number min=0 step=1 placeholder="+ 0"></label></div><div class=notice>O App soma os lançamentos automaticamente. Share = venda eStore acumulada ÷ meta geral de vendas da filial.</div><button class=btn onclick="submitHourlyV5()">Adicionar ao acumulado</button><div id=hourOutV5></div></div></div><div id=hourlyDashboardV5><div class=card><div class=notice>Carregando consolidado...</div></div></div>';
}
submitHourlyV5=async function(){
 const d=document.querySelector('#hourDateV5').value,c=Number(document.querySelector('#hourCapturedV5').value||0),o=Math.trunc(Number(document.querySelector('#hourOrdersV5').value||0)),st=admV3()?(document.querySelector('#hourStoreV13')?.value||U.u.st):U.u.st,out=document.querySelector('#hourOutV5');
 try{const r=await fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'hourly_submit',matricula:String(U.u.id),store_code:String(st),result_date:d,captured:c,orders:o,store_sales:0,incremental:true,source:admV3()?'admin':'store'})}),j=await r.json();if(!r.ok||!j.ok)throw new Error(j.error||'Não foi possível registrar.');out.innerHTML='<div class=notice>Atualização adicionada ao acumulado.</div>';document.querySelector('#hourCapturedV5').value='';document.querySelector('#hourOrdersV5').value='';await loadHourlyV5()}catch(e){out.innerHTML='<p class=bad>'+escV3(e.message||e)+'</p>'}
};


/* ===== V14: notificações, auditoria Hora a Hora e suporte identificado ===== */
let NOTIF_V14=[];
async function loadNotificationsV14(){
 if(!U?.u?.id)return;
 try{const r=await fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'notifications_get',matricula:String(U.u.id)})}),j=await r.json();NOTIF_V14=j.items||[];renderBellV14()}catch(e){}
}
function renderBellV14(){
 let b=document.getElementById('notifyBellV14'),brand=document.querySelector('.top .brand');if(!brand)return;
 if(!b){b=document.createElement('button');b.id='notifyBellV14';b.className='notifyBellV14';b.onclick=()=>go('notificationsv14');brand.parentNode.insertBefore(b,brand)}
 const seen=Number(localStorage.getItem('estore_notif_seen_v14')||0),unread=Math.max(0,NOTIF_V14.length-seen);b.innerHTML='🔔'+(unread?'<i>'+unread+'</i>':'');
}
function notificationsV14(){
 localStorage.setItem('estore_notif_seen_v14',String(NOTIF_V14.length));setTimeout(renderBellV14,0);
 return '<div class=pageTitleV3><span>Notificações</span></div><div class=card><div class=title>Central de avisos</div><p class=muted>Informações e direcionamentos eStore.</p>'+(NOTIF_V14.length?NOTIF_V14.map(x=>'<div class=notifItemV14><b>'+escV3(x.title||'Aviso eStore')+'</b><p>'+escV3(x.message||'')+'</p><small>'+new Date(x.created_at).toLocaleString('pt-BR')+'</small></div>').join(''):'<div class=notice>Nenhuma notificação nova.</div>')+'</div>';
}
async function publishNotificationV14(){
 const out=document.querySelector('#notifAdmOutV14'),title=document.querySelector('#notifTitleV14')?.value||'',message=document.querySelector('#notifMsgV14')?.value||'',target=document.querySelector('#notifTargetV14')?.value||'all',store_code=document.querySelector('#notifStoreV14')?.value||'',target_matricula=document.querySelector('#notifMatV14')?.value||'';
 if(!message.trim()){out.innerHTML='<p class=bad>Digite a mensagem.</p>';return}
 try{const r=await fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'notification_publish',matricula:String(U.u.id),title,message,target,store_code,target_matricula})}),j=await r.json();if(!r.ok||!j.ok)throw new Error(j.error||'Falha ao publicar.');out.innerHTML='<div class=notice>Notificação publicada.</div>';document.querySelector('#notifMsgV14').value='';await loadNotificationsV14()}catch(e){out.innerHTML='<p class=bad>'+escV3(e.message||e)+'</p>'}
}
function notificationAdminV14(){
 if(!admV3())return'';
 return '<div class=card><div class=title>🔔 Enviar notificação</div><div class=adminGrid><label>Título<input id=notifTitleV14 class=field value="Aviso eStore"></label><label>Público<select id=notifTargetV14 class=field><option value=all>Regional • todos</option><option value=supervisors>Supervisores</option><option value=store>Filial específica</option><option value=matricula>Matrícula específica</option></select></label><label>Filial<select id=notifStoreV14 class=field><option value="">—</option>'+Object.keys(COMMON.stores||{}).sort().map(s=>'<option>'+s+'</option>').join('')+'</select></label><label>Matrícula<input id=notifMatV14 class=field inputmode=numeric placeholder="Opcional"></label></div><textarea id=notifMsgV14 class=field rows=4 placeholder="Mensagem"></textarea><button class=btn onclick="publishNotificationV14()">Publicar notificação</button><div id=notifAdmOutV14></div></div>';
}
const _adminV14=adminv3;
adminv3=function(){return _adminV14()+notificationAdminV14()}

function hourlyHistoryV14(j){
 const rows=[...(j.history||[])].reverse();
 if(!rows.length)return '<div class=notice>Nenhum lançamento realizado neste dia.</div>';
 return '<div class=hourHistoryV14><div class=title>Histórico do dia</div>'+rows.map(r=>'<div class=hourHistRowV14><div><b>Filial '+escV3(r.store_code)+'</b><small>'+new Date(r.created_at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})+' • '+escV3(r.updated_by||r.matricula)+' • '+escV3(r.matricula)+'</small></div><span><b>+'+money(r.captured)+'</b><small>+'+num(r.orders)+' pedidos</small></span>'+((admV3()||String(r.matricula)===String(U.u.id))?'<div class=histActionsV14><button onclick="editHourlyV14(\''+r.id+'\','+Number(r.captured||0)+','+Number(r.orders||0)+')">Editar</button><button onclick="deleteHourlyV14(\''+r.id+'\')">Excluir</button></div>':'')+'</div>').join('')+'</div>';
}
async function editHourlyV14(id,c,o){
 const nc=prompt('Valor correto deste lançamento:',String(c).replace('.',','));if(nc===null)return;const no=prompt('Pedidos corretos deste lançamento:',String(o));if(no===null)return;
 await manageHourlyV14('edit',id,Number(String(nc).replace(',','.')),Math.trunc(Number(no)||0));
}
async function deleteHourlyV14(id){if(!confirm('Excluir este lançamento? O acumulado será recalculado.'))return;await manageHourlyV14('delete',id,0,0)}
async function manageHourlyV14(op,id,captured,orders){
 try{const r=await fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'hourly_manage',matricula:String(U.u.id),op,id,captured,orders})}),j=await r.json();if(!r.ok||!j.ok)throw new Error(j.error||'Não foi possível alterar.');await loadHourlyV5()}catch(e){alert(e.message||e)}
}
const _renderHourlyV14=renderHourlyV5;
renderHourlyV5=function(j){
 _renderHourlyV14(j);
 const dash=document.querySelector('#hourlyDashboardV5');if(dash)dash.insertAdjacentHTML('beforeend','<div class=card>'+hourlyHistoryV14(j)+'</div>');
}

const _supportV14=supportv5;
supportv5=function(){
 const base=_supportV14(),who='<div class=supportIdentityV14><b>'+escV3(String(U.u.id))+' • '+escV3(firstV3())+'</b><span>Filial '+escV3(U.u.st)+'</span></div>';
 return base.replace('<div class=pageTitleV3><span>Chat / Suporte</span></div>','<div class=pageTitleV3><span>Chat / Suporte</span></div>'+who);
}

const _goV14=go;
go=function(p){_goV14(p);if(U?.u?.id){loadNotificationsV14();setTimeout(renderBellV14,0)}}


/* V14 routing final */
hourlyV5=hourlyV5;
supportV5=supportv5;
const _adminBaseV14=adminV3;
adminV3=function(){return _adminBaseV14()+notificationAdminV14()}
go=function(v){
 CUR=v;document.querySelector('#drawer')?.classList.remove('open');
 const map={home,result,metasv4:metasV4,hourlyv5:hourlyV5,supportv5:supportV5,notificationsv14:notificationsV14,store,ranking,campaigns:campaignsV3,poolv3:poolV3,important:importantV3,teamv3:teamV3,reportsv3:reportsV3,profilev3:profileV3,adminv3:adminV3,admin:adminV3};
 document.querySelector('#view').innerHTML=(map[v]||home)();window.scrollTo(0,0);if(typeof applyMediaV4==='function')applyMediaV4();if(v==='hourlyv5')setTimeout(loadHourlyV5,0);if(v==='supportv5')setTimeout(loadSupportV5,0);if(U?.u?.id){loadNotificationsV14();setTimeout(renderBellV14,0)}
};


/* ===== V15: eDay administrável + compartilhamento Hora a Hora profissional ===== */
let EDAY_V15={active:true,rate:.10,start:'2026-08-01',end:''};
async function loadEDayV15(){try{const r=await fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'eday_get'})}),j=await r.json();if(r.ok&&j.ok)EDAY_V15=j.config||EDAY_V15}catch(e){}}
function eDayActiveV15(){
 const d=new Date(),iso=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
 return EDAY_V15.active!==false&&d.getDay()===1&&(!EDAY_V15.start||iso>=EDAY_V15.start)&&(!EDAY_V15.end||iso<=EDAY_V15.end);
}
eDayAlertV13=function(){return eDayActiveV15()?'<button class="edayAlertV13" onclick="go(\'result\')"><b>⚡ Hoje é eDay • 10% de comissão</b><span>Segunda é dia de transformar oportunidade em resultado. Aproveite o eDay para potencializar seus ganhos. Simular meus ganhos ›</span></button>':''}
async function saveEDayV15(){
 const out=document.querySelector('#edayOutV15'),active=document.querySelector('#edayActiveV15')?.checked!==false,start=document.querySelector('#edayStartV15')?.value||'',end=document.querySelector('#edayEndV15')?.value||'';
 try{const r=await fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'eday_update',matricula:String(U.u.id),active,start,end})}),j=await r.json();if(!r.ok||!j.ok)throw new Error(j.error||'Falha ao salvar.');EDAY_V15=j.config;out.innerHTML='<div class=notice>Configuração eDay atualizada.</div>'}catch(e){out.innerHTML='<p class=bad>'+escV3(e.message||e)+'</p>'}
}
function eDayAdminV15(){
 if(!admV3())return'';
 return '<div class=card><div class=title>⚡ Controle eDay</div><p class=muted>O alerta de 10% aparece automaticamente às segundas enquanto a campanha estiver ativa.</p><label class=switchLineV15><input id=edayActiveV15 type=checkbox '+(EDAY_V15.active!==false?'checked':'')+'> Incentivo ativo</label><div class=adminGrid><label>Início<input id=edayStartV15 class=field type=date value="'+escV3(EDAY_V15.start||'')+'"></label><label>Fim opcional<input id=edayEndV15 class=field type=date value="'+escV3(EDAY_V15.end||'')+'"></label></div><button class=btn onclick="saveEDayV15()">Salvar eDay</button><div id=edayOutV15></div></div>';
}

function shareClassV15(r){if(!r.updated_at)return'#f1e7e8';if(Number(r.share)>=.01)return'#e8f3ee';if(Number(r.share)>=.005)return'#fff4df';return'#fdecea'}
shareHourlyV5=async function(){
 if(!HOURLY_CACHE)return;
 const j=HOURLY_CACHE,stores=[...(j.stores||[])].sort((a,b)=>Number(b.att||0)-Number(a.att||0)),active=stores.filter(r=>r.updated_at),pending=stores.filter(r=>!r.updated_at),regional={meta:stores.reduce((s,r)=>s+Number(r.metaValue||0),0),captured:stores.reduce((s,r)=>s+Number(r.captured||0),0),orders:stores.reduce((s,r)=>s+Number(r.orders||0),0),orderTarget:stores.reduce((s,r)=>s+Number(r.orderTarget||0),0),sales:stores.reduce((s,r)=>s+Number(r.storeSales||0),0)};
 const c=document.createElement('canvas');c.width=1080;c.height=1900;const x=c.getContext('2d');x.fillStyle='#f8f7f4';x.fillRect(0,0,1080,1900);x.fillStyle='#173F35';x.fillRect(0,0,1080,255);x.fillStyle='#fff';x.font='bold 48px Arial';x.fillText('eStore CE+PI | Hora a Hora',60,78);x.font='29px Arial';x.fillText('Parcial '+new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})+' • '+new Date(j.result_date+'T12:00').toLocaleDateString('pt-BR'),60,130);x.fillText('Filiais atualizadas: '+active.length+' / '+stores.length,60,182);
 const cards=[['Realizado',money(regional.captured)],['Atingimento',regional.meta?pct(regional.captured/regional.meta):'—'],['Pedidos',num(regional.orders)+' / '+num(regional.orderTarget)],['Share',regional.sales?pct(regional.captured/regional.sales):'—']];
 let cx=50;for(const q of cards){x.fillStyle='#fff';x.beginPath();x.roundRect(cx,285,235,105,18);x.fill();x.fillStyle='#466964';x.font='20px Arial';x.fillText(q[0],cx+18,320);x.fillStyle='#173F35';x.font='bold 25px Arial';x.fillText(q[1],cx+18,360);cx+=250}
 x.fillStyle='#173F35';x.font='bold 22px Arial';x.fillText('RK',60,445);x.fillText('FILIAL',125,445);x.fillText('CAPTADO',255,445);x.fillText('ATING.',500,445);x.fillText('PEDIDOS',655,445);x.fillText('SHARE',850,445);
 let y=485;for(let i=0;i<stores.length;i++){const r=stores[i];x.fillStyle=shareClassV15(r);x.beginPath();x.roundRect(45,y-30,990,58,10);x.fill();x.fillStyle='#173F35';x.font='bold 22px Arial';x.fillText((i+1)+'º',60,y);x.fillText(r.st,130,y);x.fillText(money(r.captured),255,y);x.fillText(pct(r.att),500,y);x.fillText(num(r.orders)+'/'+num(r.orderTarget),655,y);x.fillText(r.storeSales?pct(r.share):'—',850,y);if(!r.updated_at){x.fillStyle='#76232F';x.font='bold 15px Arial';x.fillText('PENDENTE',930,y)}y+=64}
 if(pending.length){x.fillStyle='#76232F';x.font='bold 25px Arial';x.fillText('Pendentes: '+pending.map(r=>r.st).join(' • '),55,1745)}
 x.fillStyle='#173F35';x.font='bold 21px Arial';x.fillText('Share: eStore captado ÷ meta geral de vendas da filial',55,1800);x.fillText('Fran Lima',55,1845);
 const txt='🎯 *eStore CE+PI | HORA A HORA*\\n💵 *Realizado:* '+money(regional.captured)+'\\n📈 *Atingimento:* '+(regional.meta?pct(regional.captured/regional.meta):'—')+'\\n🛍️ *Pedidos:* '+num(regional.orders)+' / '+num(regional.orderTarget)+'\\n📊 *Share:* '+(regional.sales?pct(regional.captured/regional.sales):'—')+'\\n🏬 *Atualizadas:* '+active.length+'/'+stores.length+(pending.length?'\\n⚠️ *Pendentes:* '+pending.map(r=>r.st).join(', '):'');
 shareCanvas(c,txt);
}

const _loginV15=login;
login=async function(){await loadEDayV15();await _loginV15();if(U)await loadNotificationsV14()}
const _adminV15=adminV3;
adminV3=function(){return _adminV15()+eDayAdminV15()}


/* ===== V16: rankings de supervisores/Pool + alertas Hora a Hora ===== */
let POOL_RANK_V16={stores:[],supervisors:[]},SUP_RANK_TAB_V16='pool';
async function loadPoolRankV16(){
 if(!supV3())return;
 try{const r=await fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'pool_rankings',matricula:String(U.u.id)})}),j=await r.json();if(r.ok&&j.ok)POOL_RANK_V16=j}catch(e){}
}
function setSupRankV16(v){SUP_RANK_TAB_V16=v;go('poolv3')}
function supervisorSalesV16(){
 const rows=[];for(const stc of Object.keys(COMMON.stores||{})){const top=COMMON.stores?.[stc]?.p?.[PER]?.top||[];for(const r of top){if(r.lead||r.supervisor)rows.push({...r,st:r.st||stc})}}
 const mine=U.team?.[PER]||[];for(const r of mine){if(r.lead||r.supervisor||String(r.id)===String(U.u.id))rows.push({...r,st:r.st||U.u.st})}
 const m=new Map();for(const r of rows){const k=String(r.id);if(!m.has(k)||(r.a||r.c)>(m.get(k).a||m.get(k).c))m.set(k,r)}return [...m.values()].sort((a,b)=>Number(b.a||b.c||0)-Number(a.a||a.c||0));
}
function supervisorRankBlockV16(){
 let rows=[],label='';
 if(SUP_RANK_TAB_V16==='stores'){rows=POOL_RANK_V16.stores||[];label='Pool conquistado pelas lojas'}
 else if(SUP_RANK_TAB_V16==='sales'){rows=supervisorSalesV16();label='Supervisores que vendem'}
 else {rows=POOL_RANK_V16.supervisors||[];label='Pool conquistado por supervisor'}
 return '<div class=superRankV16><div class=scopeTabs><button class="'+(SUP_RANK_TAB_V16==='pool'?'on':'')+'" onclick="setSupRankV16(\'pool\')">Supervisores</button><button class="'+(SUP_RANK_TAB_V16==='stores'?'on':'')+'" onclick="setSupRankV16(\'stores\')">Filiais</button><button class="'+(SUP_RANK_TAB_V16==='sales'?'on':'')+'" onclick="setSupRankV16(\'sales\')">Venda individual</button></div><div class=title>'+label+'</div>'+(rows.length?rows.slice(0,20).map((r,i)=>'<div class="rank rankV3 '+(String(r.id)===String(U.u.id)?'meRankV3':'')+'"><div class=medal>'+(i<3?['🥇','🥈','🥉'][i]:(i+1)+'º')+'</div><div><b>'+escV3(r.name||('Filial '+r.st))+'</b><div class=muted>Filial '+escV3(r.st||'')+'</div></div><span><b>'+money(SUP_RANK_TAB_V16==='sales'?Number(r.a||r.c||0):Number(r.pool||0))+'</b></span></div>').join(''):'<p class=muted>Ranking em atualização conforme os resultados disponíveis.</p>')+'</div>';
}
const _poolV16=poolV3;
poolV3=function(){
 if(!supV3())return _poolV16();
 const x=U.pool||{},individual=person(),total=Number(x.sim||0)+Number(individual.a||0)*.03;
 return _poolV16()+'<div class=card><div class=title>🏆 Reconhecimento de Supervisores</div><p class=poolNudgeV13><b>Mobilize sua operação.</b> Cada venda aprovada fortalece o resultado da filial e amplia o potencial do Pool. No eDay, sua venda individual também pode potencializar seus ganhos.</p><div class=metricGridV3><div class="metricCardV3 mGreenV3"><span>Meu rateio Pool</span><b>'+money(x.sim||0)+'</b></div><div class="metricCardV3 mOrangeV3"><span>Minha venda individual</span><b>'+money(individual.a||individual.c||0)+'</b></div><div class="metricCardV3 mRoseV3"><span>Total estimado*</span><b>'+money(total)+'</b></div></div><small class=muted>*Estimativa: Pool rateado + referência de 3% sobre venda individual. eDay é calculado conforme vendas aprovadas nas segundas.</small>'+supervisorRankBlockV16()+'</div>';
}

function hourlyPendingV16(){
 if(!HOURLY_CACHE)return'';
 const p=(HOURLY_CACHE.stores||[]).filter(r=>!r.updated_at);if(!p.length)return'<div class="hourCoverageV16 ok"><b>✓ Cobertura completa</b><span>Todas as filiais já registraram informação.</span></div>';
 return '<div class="hourCoverageV16"><b>⚠ '+p.length+' filial'+(p.length>1?'is':'')+' sem informação</b><span>'+p.map(r=>r.st).join(' • ')+'</span>'+(admV3()?'<button onclick="notifyPendingV16()">Notificar supervisores</button>':'')+'</div>';
}
async function notifyPendingV16(){
 const p=(HOURLY_CACHE?.stores||[]).filter(r=>!r.updated_at);if(!p.length)return;
 const out=[];for(const r of p){const resp=await fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'notification_publish',matricula:String(U.u.id),title:'Hora a Hora pendente | Filial '+r.st,message:'Ainda não identificamos a atualização deste período. Atualize o resultado para garantir a consolidação da Regional CE+PI.',target:'store',store_code:String(r.st)})});if(resp.ok)out.push(r.st)}
 alert('Aviso enviado para '+out.length+' filial(is): '+out.join(', '));await loadNotificationsV14();
}
const _renderHourlyV16=renderHourlyV5;
renderHourlyV5=function(j){_renderHourlyV16(j);const d=document.querySelector('#hourlyDashboardV5');if(d)d.insertAdjacentHTML('afterbegin',hourlyPendingV16())}

const _loginV16=login;
login=async function(){await _loginV16();if(U&&supV3())await loadPoolRankV16()}


/* ===== V17: metas claras + fechamento Hora a Hora ===== */
const _metasV17=metasV4;
metasV4=function(){
 const html=_metasV17();
 if(supV3())return html;
 return html.replace('<div class=notice>O supervisor ainda não registrou a distribuição por HC para os dias deste período.</div>','<div class="notice metaMissingV17"><b>Sua meta eStore ainda não foi distribuída.</b><br>Procure seu gestor imediato e peça a distribuição da meta eStore do dia para o time.</div>');
}

function isClosingV17(dateStr){
 const today=localIsoV4(),h=new Date().getHours();return dateStr<today||(dateStr===today&&h>=22);
}
shareHourlyV5=async function(){
 if(!HOURLY_CACHE)return;
 const j=HOURLY_CACHE,closing=isClosingV17(j.result_date),stores=[...(j.stores||[])].sort((a,b)=>Number(b.att||0)-Number(a.att||0)),active=stores.filter(r=>r.updated_at),missing=stores.filter(r=>!r.updated_at),regional={meta:stores.reduce((s,r)=>s+Number(r.metaValue||0),0),captured:stores.reduce((s,r)=>s+Number(r.captured||0),0),orders:stores.reduce((s,r)=>s+Number(r.orders||0),0),orderTarget:stores.reduce((s,r)=>s+Number(r.orderTarget||0),0),sales:stores.reduce((s,r)=>s+Number(r.storeSales||0),0)};
 const c=document.createElement('canvas');c.width=1080;c.height=1900;const x=c.getContext('2d');x.fillStyle='#f8f7f4';x.fillRect(0,0,1080,1900);x.fillStyle='#173F35';x.fillRect(0,0,1080,260);x.fillStyle='#fff';x.font='bold 46px Arial';x.fillText(closing?'eStore CE+PI | Fechamento':'eStore CE+PI | Hora a Hora',55,76);x.font='28px Arial';x.fillText(new Date(j.result_date+'T12:00').toLocaleDateString('pt-BR')+' • consolidado '+new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),55,128);x.fillText('Cobertura de atualização: '+active.length+'/'+stores.length+' filiais'+(missing.length?' • '+missing.length+' sem informação':''),55,180);
 const cards=[['Realizado',money(regional.captured)],['Meta',money(regional.meta)],['Atingimento',regional.meta?pct(regional.captured/regional.meta):'—'],['Share',regional.sales?pct(regional.captured/regional.sales):'—']];let cx=45;for(const q of cards){x.fillStyle='#fff';x.beginPath();x.roundRect(cx,285,240,105,18);x.fill();x.fillStyle='#466964';x.font='19px Arial';x.fillText(q[0],cx+17,320);x.fillStyle='#173F35';x.font='bold 24px Arial';x.fillText(q[1],cx+17,360);cx+=250}
 x.fillStyle='#173F35';x.font='bold 20px Arial';['RK','FILIAL','CAPTADO','ATING.','PEDIDOS','SHARE'].forEach((v,i)=>x.fillText(v,[55,120,250,500,650,845][i],445));
 let y=485;for(let i=0;i<stores.length;i++){const r=stores[i];x.fillStyle=shareClassV15(r);x.beginPath();x.roundRect(42,y-29,995,58,10);x.fill();x.fillStyle='#173F35';x.font='bold 21px Arial';x.fillText((i+1)+'º',55,y);x.fillText(r.st,120,y);if(!r.updated_at&&closing){x.fillStyle='#76232F';x.font='bold 17px Arial';x.fillText('Nenhuma informação de venda ao longo do dia',250,y)}else{x.fillText(money(r.captured),250,y);x.fillText(pct(r.att),500,y);x.fillText(num(r.orders)+'/'+num(r.orderTarget),650,y);x.fillText(r.storeSales?pct(r.share):'—',845,y);if(r.updated_at&&Number(r.captured)===0){x.fillStyle='#76232F';x.font='bold 13px Arial';x.fillText('R$ 0,00 informado',250,y+18)}}y+=64}
 x.fillStyle='#173F35';x.font='bold 22px Arial';x.fillText('Pedidos: '+num(regional.orders)+' / '+num(regional.orderTarget),55,1740);x.font='20px Arial';x.fillText('Share = venda eStore captada ÷ meta geral de vendas da filial',55,1790);x.fillText('Atualizado em '+new Date().toLocaleString('pt-BR')+' • Fran Lima',55,1840);
 const text=(closing?'🏁 *eStore CE+PI | FECHAMENTO*':'🎯 *eStore CE+PI | HORA A HORA*')+'\\n📅 '+new Date(j.result_date+'T12:00').toLocaleDateString('pt-BR')+'\\n💵 *Realizado:* '+money(regional.captured)+'\\n🎯 *Meta:* '+money(regional.meta)+'\\n📈 *Atingimento:* '+(regional.meta?pct(regional.captured/regional.meta):'—')+'\\n🛍️ *Pedidos:* '+num(regional.orders)+' / '+num(regional.orderTarget)+'\\n📊 *Share:* '+(regional.sales?pct(regional.captured/regional.sales):'—')+'\\n🏬 *Cobertura:* '+active.length+'/'+stores.length+(missing.length?' • '+missing.length+' sem informação':'')+(closing&&missing.length?'\\n⚠️ *Sem informação ao longo do dia:* '+missing.map(r=>r.st).join(', '):'');
 shareCanvas(c,text);
}

function hourlyClosingStatusV17(){
 if(!HOURLY_CACHE||!isClosingV17(HOURLY_CACHE.result_date))return'';
 const miss=(HOURLY_CACHE.stores||[]).filter(r=>!r.updated_at);
 return '<div class="closingStatusV17"><b>Fechamento Hora a Hora</b><span>Cobertura: '+((HOURLY_CACHE.stores||[]).length-miss.length)+'/'+(HOURLY_CACHE.stores||[]).length+' filiais'+(miss.length?' • '+miss.length+' sem informação':' • cobertura completa')+'</span></div>';
}
const _renderHourlyV17=renderHourlyV5;
renderHourlyV5=function(j){_renderHourlyV17(j);const d=document.querySelector('#hourlyDashboardV5');if(d){const s=hourlyClosingStatusV17();if(s)d.insertAdjacentHTML('afterbegin',s)}}

/* ===== V18: metas individuais ===== */
function metaRowsV18(){return (APP_DELTA&&APP_DELTA.metaAssignments)||[]}
function metaTodayV18(){return localIsoV4()}
function metaManagerV18(){
 if(!supV3())return '';
 const team=(U.team&&U.team.day)||[],d=metaTodayV18();
 const rows=metaRowsV18().filter(r=>String(r.result_date)===d&&String(r.store_code)===String(U.u.st));
 const map=new Map(rows.map(r=>[String(r.matricula),Number(r.target||0)]));
 const missing=team.filter(r=>!map.has(String(r.id)));
 return '<div class="card metaManagerV18"><div class="title">Distribuição individual de Meta eStore</div><div class="metaCoverageV18"><b>'+rows.length+' de '+team.length+' colaboradores com meta distribuída hoje</b><span>'+(missing.length?'Pendentes: '+missing.map(r=>escV3(r.name)).join(', '):'Todos os colaboradores estão com meta distribuída.')+'</span></div>'+team.map(r=>'<div class="metaPersonV18"><span><b>'+escV3(r.name)+'</b><small>'+escV3(String(r.id))+'</small></span><input class="field" id="mav18_'+escV3(String(r.id))+'" type="number" min="0" step="0.01" value="'+(map.has(String(r.id))?map.get(String(r.id)):'')+'" placeholder="Meta R$"><button class="btn" onclick="saveMetaV18(\''+escV3(String(r.id))+'\')">Salvar</button></div>').join('')+'</div>';
}
async function saveMetaV18(id){
 const el=document.getElementById('mav18_'+id),target=Number(el&&el.value||0);
 try{
  const r=await fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'meta_assign_set',matricula:String(U.u.id),st:String(U.u.st),date:metaTodayV18(),target_matricula:String(id),target})});
  const j=await r.json();if(!r.ok||!j.ok)throw new Error(j.error||'Falha ao salvar meta.');
  if(!APP_DELTA.metaAssignments)APP_DELTA.metaAssignments=[];
  APP_DELTA.metaAssignments=APP_DELTA.metaAssignments.filter(x=>!(String(x.result_date)===metaTodayV18()&&String(x.store_code)===String(U.u.st)&&String(x.matricula)===String(id)));
  APP_DELTA.metaAssignments.push(j.assignment);go('metasv4');
 }catch(e){alert(e.message||e)}
}
const _metasBaseV18=metasV4;
metasV4=function(){const h=_metasBaseV18();return supV3()?h+metaManagerV18():h}


/* ===== HOTFIX 2026-09-21: login não depende da API auxiliar ===== */
login=async function(){
  const btn=document.querySelector('#login .btn');
  const err=document.getElementById('err');
  if(btn){btn.disabled=true;btn.textContent='Entrando...'}
  if(err)err.textContent='';
  try{
    await _loginV15();
    if(U){
      Promise.resolve().then(()=>loadEDayV15()).catch(()=>{});
      Promise.resolve().then(()=>loadNotificationsV14()).catch(()=>{});
      if(supV3())Promise.resolve().then(()=>loadPoolRankV16()).catch(()=>{});
    }
  }catch(e){
    if(err)err.textContent='Não foi possível abrir o App. Tente novamente.';
    console.error('Login hotfix:',e);
  }finally{
    if(btn){btn.disabled=false;btn.textContent='Entrar'}
  }
};


/* V19 — Meu Time Regional: visão compacta por filial + exportação Excel */
let TEAM_STORE_V19='regional';
function teamDatesV19(d){
  const asof=String(APP_DELTA?.asof||COMMON?.asof||'');
  if(!d||!asof)return false;
  if(PER==='day')return d===asof;
  if(PER==='month')return d.slice(0,7)===asof.slice(0,7);
  if(PER==='year')return d.slice(0,4)===asof.slice(0,4);
  const monday=s=>{const z=new Date(s+'T12:00:00'),k=(z.getDay()+6)%7;z.setDate(z.getDate()-k);return z.toISOString().slice(0,10)};
  return monday(d)===monday(asof);
}
function regionalPeopleV19(){
  const m=new Map();
  for(const up of (APP_DELTA?.updates||[])){
    const d=String(up.result_date||''); if(!teamDatesV19(d))continue;
    for(const x of (up.collaborators||[])){
      const id=String(x.id??x.matricula??''), st=String(x.st??x.store??x.loja??'');
      if(!id||!st)continue;
      const k=st+'|'+id, old=m.get(k)||{id,st,name:x.name||x.nome||id,c:0,a:0,o:0};
      old.name=x.name||x.nome||old.name; old.c+=Number(x.c??x.captada??0); old.a+=Number(x.a??x.aprovada??0); old.o+=Number(x.o??x.pedidos??0); m.set(k,old);
    }
  }
  return [...m.values()];
}
function teamStoresV19(){
  const fromPeople=[...new Set(regionalPeopleV19().map(x=>String(x.st)))];
  const fromRegional=(COMMON.regional?.[PER]||[]).map(x=>String(x.st));
  return [...new Set([...fromRegional,...fromPeople])].filter(Boolean).sort((a,b)=>a.localeCompare(b,'pt-BR',{numeric:true}));
}
function setTeamStoreV19(v){TEAM_STORE_V19=String(v||'regional');go('teamv3')}
function teamRowsV19(){
  if(TEAM_STORE_V19==='regional')return regionalPeopleV19();
  const all=regionalPeopleV19().filter(x=>String(x.st)===TEAM_STORE_V19);
  if(all.length)return all;
  if(String(TEAM_STORE_V19)===String(U?.u?.st))return (U.team?.[PER]||[]).map(x=>({...x,st:String(U.u.st)}));
  return [];
}
function teamStoreSummaryV19(st,people){
  const r=(COMMON.regional?.[PER]||[]).find(x=>String(x.st)===String(st))||{};
  const p=people.filter(x=>String(x.st)===String(st)), c=p.reduce((s,x)=>s+Number(x.c||0),0), o=p.reduce((s,x)=>s+Number(x.o||0),0);
  return {st,c:Number(r.c??c),o:Number(r.o??o),active:p.filter(x=>Number(x.c||0)>0).length,zero:p.filter(x=>Number(x.c||0)===0).length,att:Number(r.att||0)};
}
function exportTeamExcelV19(){
  const people=teamRowsV19(), stores=TEAM_STORE_V19==='regional'?teamStoresV19():[TEAM_STORE_V19];
  const sums=stores.map(st=>teamStoreSummaryV19(st,regionalPeopleV19()));
  const title=TEAM_STORE_V19==='regional'?'Regional CE+PI':'Filial '+TEAM_STORE_V19;
  const html='<html><head><meta charset="UTF-8"></head><body><h2>eStore CE+PI - '+title+'</h2><p>Período: '+escV3(pLabel[PER])+'</p>'+
    '<h3>Resumo</h3><table border="1"><tr><th>Filial</th><th>Venda Captada</th><th>Pedidos</th><th>Ativos</th><th>Zerados</th><th>Atingimento</th></tr>'+
    sums.map(x=>'<tr><td>'+x.st+'</td><td>'+x.c.toFixed(2)+'</td><td>'+x.o+'</td><td>'+x.active+'</td><td>'+x.zero+'</td><td>'+(x.att*100).toFixed(1)+'%</td></tr>').join('')+'</table>'+
    '<h3>Colaboradores</h3><table border="1"><tr><th>Filial</th><th>Matrícula</th><th>Colaborador</th><th>Captada</th><th>Aprovada</th><th>Pedidos</th><th>Status</th></tr>'+
    people.sort((a,b)=>String(a.st).localeCompare(String(b.st),'pt-BR',{numeric:true})||Number(b.c||0)-Number(a.c||0)).map(x=>'<tr><td>'+escV3(x.st)+'</td><td>'+escV3(x.id)+'</td><td>'+escV3(x.name)+'</td><td>'+Number(x.c||0).toFixed(2)+'</td><td>'+Number(x.a||0).toFixed(2)+'</td><td>'+Number(x.o||0)+'</td><td>'+(Number(x.c||0)>0?'Com venda':'Zerado')+'</td></tr>').join('')+'</table><p>Fran Lima</p></body></html>';
  const blob=new Blob(['\ufeff',html],{type:'application/vnd.ms-excel;charset=utf-8'}),a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download='eStore_'+(TEAM_STORE_V19==='regional'?'Regional_CE_PI':'Filial_'+TEAM_STORE_V19)+'_'+PER+'.xls';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);
}
teamV3=function(){
 if(!supV3())return '<div class=card><div class=title>Meu Time</div><p>Conteúdo disponível para liderança.</p></div>';
 if(!admV3()&&TEAM_STORE_V19==='regional')TEAM_STORE_V19=String(U.u.st);
 const stores=teamStoresV19(),people=teamRowsV19(),yes=people.filter(x=>Number(x.c||0)>0),no=people.filter(x=>Number(x.c||0)===0);
 const totalC=people.reduce((s,x)=>s+Number(x.c||0),0),totalO=people.reduce((s,x)=>s+Number(x.o||0),0);
 const storeSummaries=stores.map(st=>teamStoreSummaryV19(st,regionalPeopleV19())).sort((a,b)=>b.c-a.c);
 const selected=TEAM_STORE_V19!=='regional';
 const sorted=[...people].sort((a,b)=>Number(b.c||0)-Number(a.c||0));
 return '<div class=pageTitleV3><span>Meu Time</span></div><div class=card>'+
   '<div class=teamToolbarV19><div><small>Visão</small><select class=field onchange="setTeamStoreV19(this.value)">'+
   (admV3()?'<option value="regional" '+(TEAM_STORE_V19==='regional'?'selected':'')+'>Regional CE+PI</option>':'')+
   stores.map(st=>'<option value="'+escV3(st)+'" '+(TEAM_STORE_V19===st?'selected':'')+'>Filial '+escV3(st)+'</option>').join('')+
   '</select></div><button class=btn onclick="exportTeamExcelV19()">Exportar Excel</button></div>'+tabs()+
   '<div class=metricGridV3><div class="metricCardV3 mGreenV3"><span>Ativos eStore</span><b>'+num(yes.length)+'</b></div><div class="metricCardV3 mLowV3"><span>Zerados</span><b>'+num(no.length)+'</b></div><div class="metricCardV3 mSandV3"><span>Venda captada</span><b>'+money(totalC)+'</b></div><div class="metricCardV3 mOrangeV3"><span>Pedidos</span><b>'+num(totalO)+'</b></div></div>'+
   (!selected?'<div class=regionalCompactV19><div class=title>Filiais <small class=autoTagV3>selecione para detalhar</small></div><div class=table><table><tr><th>Filial</th><th>Venda</th><th>Pedidos</th><th>Ativos</th><th>Zerados</th><th></th></tr>'+storeSummaries.map(x=>'<tr><td><b>'+escV3(x.st)+'</b></td><td>'+money(x.c)+'</td><td>'+num(x.o)+'</td><td>'+num(x.active)+'</td><td>'+num(x.zero)+'</td><td><button class=miniBtnV19 onclick="setTeamStoreV19(\''+String(x.st).replace(/'/g,"\\'")+'\')">Ver time</button></td></tr>').join('')+'</table></div></div>':
   '<div class=regionalCompactV19><div class=title>Colaboradores • Filial '+escV3(TEAM_STORE_V19)+'</div><div class=teamRankV3>'+sorted.map((x,i)=>'<div class=teamRankRowV5><span class=posV3>'+(i+1)+'</span>'+avatarForV5(x.id,x.name,'xs')+'<b>'+escV3(x.name)+'</b><strong>'+money(x.c)+'</strong><em class="'+(Number(x.c||0)>0?'perfGoodV3':'perfLowV3')+'">'+(Number(x.c||0)>0?num(x.o)+' ped.':'Zerado')+'</em></div>').join('')+(sorted.length?'':'<p class=muted>Sem dados de colaboradores para esta filial no período selecionado.</p>')+'</div></div>')+
   '</div>';
};

/* V20 — home e menu conforme referência aprovada 22/09 */
function navBtnV20(icon,label,target,active=''){return '<button class="'+active+'" onclick="go(\''+target+'\')"><span class="navIcoV20">'+icon+'</span><span>'+label+'</span><span class="navArrV20">›</span></button>'}
refreshNavV3=function(){
 const sh=document.querySelector('#drawer .sheet');
 if(sh)sh.innerHTML=
  '<div class="menuBrandV20">RIACHUELO</div><div class="menuAppV20">App. eStore CE+PI</div>'+
  '<div class="menuHeadV20">'+profileAvatarV3('sm')+'<div><b>'+escV3(U?.u?.name||'')+'</b><small>'+escV3(storeFullV3())+'</small></div></div>'+
  '<div class="menuSectionV20">Principal</div>'+
  navBtnV20('⌂','Início','home','activeV20')+
  navBtnV20('▥','Meu Resultado','result')+
  navBtnV20('◎','Metas','metas')+
  '<div class="menuSectionV20">Gestão</div>'+
  navBtnV20('▤','Minha Filial','store')+
  (supV3()?navBtnV20('♙','Meu Time','teamv3'):'')+
  navBtnV20('♕','Ranking','ranking')+
  (supV3()?navBtnV20('▣','Pool / Comissão','poolv3'):'')+
  (supV3()?navBtnV20('◷','Hora a Hora','hourly'):'')+
  '<div class="menuSectionV20">Informações</div>'+
  navBtnV20('◇','Cupons e Campanhas','campaigns')+
  navBtnV20('ⓘ','Informações Importantes','important')+
  navBtnV20('♧','Chat / Suporte','support')+
  (admV3()?'<div class="menuSectionV20"></div>'+navBtnV20('☷','Administrativo','adminv3'):'')+
  '<button class="logoutBtn" onclick="logoutApp()"><span class="navIcoV20">↪</span><span>Sair</span><span class="navArrV20"></span></button>'+
  '<div class="menuFootV20">Moda que inspira o Brasil.<br>Fran Lima</div>';
 const nav=document.getElementById('nav');
 if(nav)nav.innerHTML=
  '<button onclick="go(\'home\')"><span>⌂</span>Início</button>'+
  '<button onclick="go(\'result\')"><span>▱</span>Vendas</button>'+
  '<button onclick="go(\'metas\')"><span>◎</span>Metas</button>'+
  '<button onclick="go(\'hourly\')"><span>◷</span>Hora a Hora</button>'+
  '<button onclick="go(\'profilev3\')"><span>♙</span>Perfil</button>';
 const footer=document.querySelector('.footer');if(footer)footer.innerHTML='Moda que inspira o Brasil.<br><small>Fran Lima</small>';
};
function homeTileV20(cls,icon,title,sub,target){return '<button class="'+cls+'" onclick="go(\''+target+'\')"><span class="miV20">'+icon+'</span><span><b>'+title+'</b><small>'+sub+'</small></span><span class="maV20">›</span></button>'}
home=function(){
 return '<div class="homePremiumV20">'+
  '<h1>App. eStore CE+PI</h1><div class="helloV20">Olá, '+escV3(firstV3())+'</div><div class="storeV20">'+escV3(storeFullV3())+'</div>'+
  '<button class="weekFeatureV20" onclick="go(\'ranking\')"><span class="icoV20">♕</span><b>Destaques da semana</b><span class="arrV20">›</span></button>'+
  '<div class="quickTitleV20">Acesso rápido</div><div class="menuGridV20">'+
   homeTileV20('green','▥','Meu Resultado','Desempenho individual','result')+
   homeTileV20('orange','◎','Metas','Acompanhe sua meta','metas')+
   homeTileV20('wine','▤','Minha Filial','Resultado da operação','store')+
   (supV3()?homeTileV20('sage','♙','Meu Time','Equipe e participação','teamv3'):'')+
   homeTileV20('orange','♕','Ranking','Filial e regional','ranking')+
   (supV3()?homeTileV20('wine','▣','Pool / Comissão','Estimativas e incentivos','poolv3'):'')+
   homeTileV20('sage','◇','Cupons e Campanhas','Regras e incentivos','campaigns')+
   (supV3()?homeTileV20('green','◷','Hora a Hora','Evolução das vendas','hourly'):'')+
   homeTileV20('sand','ⓘ','Informações Importantes','Atualizações eStore','important')+
   homeTileV20('sage','♧','Chat / Suporte','Fale com o suporte','support')+
  '</div><div class="homeSignV20">Fran Lima</div></div>';
};

/* V25: compatibilidade pós-importação administrativa */
if(typeof window.render!=='function')window.render=function(){try{if(typeof go==='function')go(CUR||'adminv3')}catch(e){location.reload()}};


/* V26 — Meu Time executivo + dashboard/card compartilhável */
let TEAM_FILTER_V26='all',TEAM_DASH_V26=false;
function setTeamFilterV26(v){TEAM_FILTER_V26=v;go('teamv3')}
function toggleTeamDashV26(){TEAM_DASH_V26=!TEAM_DASH_V26;go('teamv3')}
function teamStatsV26(){
 const people=teamRowsV19(),yes=people.filter(x=>Number(x.c||0)>0),zero=people.filter(x=>Number(x.c||0)<=0),captured=people.reduce((s,x)=>s+Number(x.c||0),0),orders=people.reduce((s,x)=>s+Number(x.o||0),0);
 return {people,yes,zero,captured,orders,disp:people.length?zero.length/people.length:0};
}
function teamDashboardV26(){
 const all=regionalPeopleV19(),stores=teamStoresV19().map(st=>teamStoreSummaryV19(st,all)).sort((a,b)=>b.c-a.c),zero=[...stores].sort((a,b)=>b.zero-a.zero).slice(0,5),top=stores.slice(0,5);
 return '<div class="teamDashV26">'+
 '<div class="teamDashHeadV26"><div><small>MEU TIME • REGIONAL CE+PI</small><b>'+escV3(pLabel[PER])+'</b></div><span>Moda que inspira o Brasil</span></div>'+
 '<div class="teamSplitV26"><section><h3>Top filiais • Venda captada</h3>'+top.map((x,i)=>'<div class="teamLineV26"><b>'+(i+1)+'º '+escV3(x.st)+'</b><span>'+money(x.c)+'</span></div>').join('')+'</section>'+
 '<section class="alert"><h3>Filiais com mais zerados</h3>'+zero.map(x=>'<div class="teamLineV26"><b>'+escV3(x.st)+'</b><span>'+num(x.zero)+'</span></div>').join('')+'</section></div>'+
 '<div class="teamTableV26"><h3>Resumo por filial</h3><div class=table><table><tr><th>Loja</th><th>Colab.</th><th>Com venda</th><th>Zerados</th><th>Venda captada</th></tr>'+stores.map(x=>'<tr><td><b>'+escV3(x.st)+'</b></td><td>'+num(x.active+x.zero)+'</td><td>'+num(x.active)+'</td><td class="'+(x.zero?'zero':'')+'">'+num(x.zero)+'</td><td>'+money(x.c)+'</td></tr>').join('')+'</table></div></div></div>';
}
function teamV26(){
 if(!supV3())return '<div class=card><div class=title>Meu Time</div><p>Conteúdo disponível para liderança.</p></div>';
 if(!admV3()&&TEAM_STORE_V19==='regional')TEAM_STORE_V19=String(U.u.st);
 const stores=teamStoresV19(),s=teamStatsV26(),selected=TEAM_STORE_V19!=='regional';
 let rows=[...s.people].sort((a,b)=>Number(b.c||0)-Number(a.c||0));
 if(TEAM_FILTER_V26==='sold')rows=rows.filter(x=>Number(x.c||0)>0);if(TEAM_FILTER_V26==='zero')rows=rows.filter(x=>Number(x.c||0)<=0);
 return '<div class=pageTitleV3><span>Meu Time</span></div><div class="card teamExecV26">'+
 '<div class=teamToolbarV19><div><small>Visão</small><select class=field onchange="setTeamStoreV19(this.value)">'+(admV3()?'<option value="regional" '+(TEAM_STORE_V19==='regional'?'selected':'')+'>Regional CE+PI</option>':'')+stores.map(st=>'<option value="'+escV3(st)+'" '+(TEAM_STORE_V19===st?'selected':'')+'>Filial '+escV3(st)+'</option>').join('')+'</select></div><button class=btn onclick="exportTeamExcelV19()">Exportar Excel</button></div>'+tabs()+
 '<div class=teamKpisV26><div><span>Colaboradores</span><b>'+num(s.people.length)+'</b></div><div><span>Com venda</span><b>'+num(s.yes.length)+'</b></div><div class=rose><span>Zerados</span><b>'+num(s.zero.length)+'</b></div><div><span>Dispersão</span><b>'+pct(s.disp)+'</b></div><div class=wide><span>Venda captada</span><b>'+money(s.captured)+'</b></div><div><span>Pedidos</span><b>'+num(s.orders)+'</b></div></div>'+
 '<div class=teamFilterV26><button class="'+(TEAM_FILTER_V26==='all'?'on':'')+'" onclick="setTeamFilterV26(\'all\')">Todos</button><button class="'+(TEAM_FILTER_V26==='sold'?'on':'')+'" onclick="setTeamFilterV26(\'sold\')">Com venda</button><button class="'+(TEAM_FILTER_V26==='zero'?'on':'')+'" onclick="setTeamFilterV26(\'zero\')">Zerados</button></div>'+
 (selected?'<div class=teamPeopleV26>'+rows.map(x=>'<div class="'+(Number(x.c||0)>0?'sold':'zero')+'">'+avatarForV5(x.id,x.name,'xs')+'<span><b>'+escV3(x.name)+'</b><small>'+escV3(String(x.id))+' • '+num(x.o||0)+' pedidos</small></span><strong>'+money(x.c||0)+'</strong><em>'+(Number(x.c||0)>0?'Com venda':'Zerado')+'</em></div>').join('')+'</div>':teamDashboardV26())+
 '<div class=teamActionsV26><button onclick="toggleTeamDashV26()">▣ '+(TEAM_DASH_V26?'Ocultar dashboard':'Visualizar dashboard')+'</button><button onclick="shareTeamCardV26()">Compartilhar</button></div>'+
 (TEAM_DASH_V26&&selected?teamDashboardV26():'')+'</div>';
}
teamV3=teamV26;
async function shareTeamCardV26(){
 const all=regionalPeopleV19(),stores=(TEAM_STORE_V19==='regional'?teamStoresV19():[TEAM_STORE_V19]).map(st=>teamStoreSummaryV19(st,all)).sort((a,b)=>b.c-a.c),s=teamStatsV26();
 const c=document.createElement('canvas');c.width=1080;c.height=1500;const x=c.getContext('2d'),green='#173F35',sage='#466964',sand='#D6D2C4',gray='#DAD9D6',rose='#F5DDE2',red='#76232F',orange='#DE7C00';
 x.fillStyle='#F8F7F4';x.fillRect(0,0,c.width,c.height);x.fillStyle=green;x.fillRect(0,0,1080,190);
 const logo=document.querySelector('header img');if(logo&&logo.complete){try{x.drawImage(logo,55,38,250,95)}catch(e){}}
 x.fillStyle='#fff';x.textAlign='right';x.font='700 34px Arial, sans-serif';x.fillText('MEU TIME | '+(TEAM_STORE_V19==='regional'?'REGIONAL CE+PI':'FILIAL '+TEAM_STORE_V19),1020,70);x.font='24px Arial, sans-serif';x.fillText(pLabel[PER]+' • Moda que inspira o Brasil',1020,115);x.textAlign='left';
 const k=[['COLABORADORES',s.people.length],['COM VENDA',s.yes.length],['ZERADOS',s.zero.length],['DISPERSÃO',pct(s.disp)],['VENDA CAPTADA',money(s.captured)],['PEDIDOS',s.orders]];k.forEach((a,i)=>{const col=i%3,row=Math.floor(i/3),xx=55+col*330,yy=225+row*125;x.fillStyle=i===2?rose:(i===4?sand:'#fff');x.beginPath();x.roundRect(xx,yy,300,100,18);x.fill();x.fillStyle=sage;x.font='700 16px Arial, sans-serif';x.fillText(a[0],xx+18,yy+30);x.fillStyle=green;x.font='700 29px Arial, sans-serif';x.fillText(String(a[1]),xx+18,yy+70)});
 let y=500;x.fillStyle=green;x.font='700 25px Arial, sans-serif';x.fillText('Resumo por filial',55,y);y+=45;x.font='700 17px Arial, sans-serif';['LOJA','COLAB.','COM VENDA','ZERADOS','VENDA CAPTADA'].forEach((v,i)=>x.fillText(v,[55,170,310,500,680][i],y));y+=18;
 for(const r of stores.slice(0,19)){x.fillStyle=r.zero/(r.active+r.zero||1)>.7?'#FFF0F0':'#fff';x.beginPath();x.roundRect(45,y,990,48,8);x.fill();x.fillStyle=green;x.font='700 18px Arial, sans-serif';x.fillText(r.st,60,y+31);x.font='18px Arial, sans-serif';x.fillText(String(r.active+r.zero),185,y+31);x.fillText(String(r.active),330,y+31);x.fillStyle=r.zero?red:green;x.fillText(String(r.zero),520,y+31);x.fillStyle=green;x.fillText(money(r.c),690,y+31);y+=53;if(y>1390)break}
 x.fillStyle=green;x.font='18px Arial, sans-serif';x.fillText('Moda que inspira o Brasil',55,1460);x.textAlign='right';x.fillText('App. eStore CE+PI',1020,1460);
 const text='📊 *MEU TIME eStore | '+(TEAM_STORE_V19==='regional'?'REGIONAL CE+PI':'FILIAL '+TEAM_STORE_V19)+'*\\n'+pLabel[PER]+'\\n👥 Colaboradores: '+s.people.length+'\\n✅ Com venda: '+s.yes.length+'\\n🔴 Zerados: '+s.zero.length+'\\n📉 Dispersão: '+pct(s.disp)+'\\n💰 Venda captada: '+money(s.captured)+'\\n🛍️ Pedidos: '+s.orders;
 shareCanvas(c,text);
}


/* ===== V27 HOTFIX 2026-09-24: resultado individual vinculado à matrícula =====
   Regra: a matrícula autenticada é a única chave para consolidar resultado.
   APP_DELTA contém as cargas posteriores à base histórica do login. */
function normMatV27(v){return String(v??'').replace(/\D/g,'').replace(/^0+/,'')||String(v??'').trim()}
function sameUserV27(v){return normMatV27(v)===normMatV27(U?.u?.id)}
function periodHasDateV27(d,p){
  const asof=String(APP_DELTA?.asof||COMMON?.asof||localIsoV4());
  if(!d||!asof)return false;
  if(p==='day')return d===asof;
  if(p==='month')return d.slice(0,7)===asof.slice(0,7);
  if(p==='year')return d.slice(0,4)===asof.slice(0,4);
  const monday=x=>{const z=new Date(x+'T12:00:00'),k=(z.getDay()+6)%7;z.setDate(z.getDate()-k);return z.toISOString().slice(0,10)};
  return monday(d)===monday(asof);
}
function deltaUserV27(p){
  const byDate=new Map();
  for(const up of (APP_DELTA?.updates||[])){
    const d=String(up.result_date||''); if(!periodHasDateV27(d,p))continue;
    const rows=(up.collaborators||[]).filter(r=>sameUserV27(r.id??r.matricula));
    if(!rows.length)continue;
    const row=rows.reduce((z,r)=>({
      c:z.c+Number(r.c??r.captada??0),
      a:z.a+Number(r.a??r.aprovada??0),
      o:z.o+Number(r.o??r.pedidos??0)
    }),{c:0,a:0,o:0});
    byDate.set(d,row);
  }
  const out={c:0,a:0,o:0,com:0};
  for(const [d,r] of byDate){
    out.c+=r.c;out.a+=r.a;out.o+=r.o;
    const monday=new Date(d+'T12:00:00').getDay()===1;
    out.com+=r.a*(monday?.10:.03);
  }
  return out;
}
function personV27(){
  const b=U?.p?.[PER]||{},d=deltaUserV27(PER);
  return {...b,c:Number(b.c||0)+d.c,a:Number(b.a||0)+d.a,o:Number(b.o||0)+d.o,com:Number(b.com||0)+d.com};
}
person=personV27;

function liveRegionalRowsV27(p){
  const base=(COMMON?.top?.[p]||[]).map(x=>({...x,c:Number(x.c||0),a:Number(x.a||0),o:Number(x.o||0)}));
  const map=new Map(base.map(x=>[normMatV27(x.id),x]));
  const dateRows=new Map();
  for(const up of (APP_DELTA?.updates||[])){
    const d=String(up.result_date||'');if(!periodHasDateV27(d,p))continue;
    const daily=new Map();
    for(const r of (up.collaborators||[])){
      const k=normMatV27(r.id??r.matricula);if(!k)continue;
      const z=daily.get(k)||{id:r.id??r.matricula,name:r.name??r.nome??'',st:r.st??r.store??r.loja??'',c:0,a:0,o:0};
      z.c+=Number(r.c??r.captada??0);z.a+=Number(r.a??r.aprovada??0);z.o+=Number(r.o??r.pedidos??0);daily.set(k,z);
    }
    dateRows.set(d,daily);
  }
  for(const daily of dateRows.values())for(const [k,r] of daily){
    const z=map.get(k)||{id:r.id,name:r.name,st:r.st,c:0,a:0,o:0};
    z.name=r.name||z.name;z.st=r.st||z.st;z.c=Number(z.c||0)+r.c;z.a=Number(z.a||0)+r.a;z.o=Number(z.o||0)+r.o;map.set(k,z);
  }
  return [...map.values()].sort((a,b)=>Number(b.c||0)-Number(a.c||0));
}
rankInfoV13=function(){
 const reg=liveRegionalRowsV27(PER),ri=reg.findIndex(x=>sameUserV27(x.id));
 const fil=reg.filter(x=>String(x.st)===String(U?.u?.st)).sort((a,b)=>Number(b.c||0)-Number(a.c||0)),fi=fil.findIndex(x=>sameUserV27(x.id));
 return {regional:ri>=0?ri+1:null,filial:fi>=0?fi+1:null,topRegional:ri>=0&&ri<10,topFilial:fi>=0&&fi<3};
};

eDayDataV3=function(){
 const x=personV27(),approved=Math.max(0,Number(x.a||0)),commission=Math.max(0,Number(x.com||0));
 const details=[],seen=new Set();
 for(const up of (APP_DELTA?.updates||[])){
   const d=String(up.result_date||'');if(!periodHasDateV27(d,PER)||seen.has(d)||new Date(d+'T12:00:00').getDay()!==1)continue;
   seen.add(d);const a=(up.collaborators||[]).filter(r=>sameUserV27(r.id??r.matricula)).reduce((s,r)=>s+Number(r.a??r.aprovada??0),0);
   if(a>0)details.push({d,approved:a,commission:+(a*.10).toFixed(2)});
 }
 let eApproved=(commission-approved*.03)/.07;eApproved=clampV3(Number.isFinite(eApproved)?eApproved:0,0,approved);
 const eCommission=+(eApproved*.10).toFixed(2);
 return {approved,commission,eApproved,eCommission,regularCommission:Math.max(0,commission-eCommission),details};
};

async function refreshUserDataV27(){
 if(!U?.u?.id)return;
 await loadContentV3();
}
const _goV27=go;
go=function(v){
 if(U?.u?.id&&['home','result','ranking','metas','metasv4'].includes(v)){
   refreshUserDataV27().then(()=>{try{_goV27(v)}catch(e){console.error('V27 render',e)}}).catch(()=>{});
 }
 return _goV27(v);
};


/* ===== V28 2026-09-24: fonte única para Resultado + Minha Filial + Rankings ===== */
function storeCodeV28(r){return String(r?.st??r?.store??r?.store_code??r?.loja??r?.filial??'').replace(/\D/g,'').replace(/^0+/,'')}
function rowNumsV28(r){return {c:Number(r?.c??r?.captada??r?.captured??0)||0,a:Number(r?.a??r?.aprovada??r?.approved??0)||0,o:Number(r?.o??r?.pedidos??r?.orders??0)||0}}
function latestDailyRowsV28(p){
 const byDate=new Map();
 for(const up of (APP_DELTA?.updates||[])){
  const d=String(up?.result_date||'');if(!periodHasDateV27(d,p))continue;
  const rows=Array.isArray(up?.collaborators)?up.collaborators:[];
  if(rows.length)byDate.set(d,rows);
 }
 return [...byDate.entries()].sort((a,b)=>a[0].localeCompare(b[0]));
}
function liveRowsV28(p){
 const dates=latestDailyRowsV28(p),map=new Map();
 for(const [d,rows] of dates)for(const r of rows){
  const id=normMatV27(r?.id??r?.matricula);if(!id)continue;const n=rowNumsV28(r),z=map.get(id)||{id:r?.id??r?.matricula,name:r?.name??r?.nome??'',st:storeCodeV28(r),c:0,a:0,o:0,com:0};
  z.name=r?.name??r?.nome??z.name;z.st=storeCodeV28(r)||z.st;z.c+=n.c;z.a+=n.a;z.o+=n.o;z.com+=n.a*(new Date(d+'T12:00:00').getDay()===1?.10:.03);map.set(id,z);
 }
 return [...map.values()];
}
function hasLivePeriodV28(p){return latestDailyRowsV28(p).length>0}
function personV28(){
 if(!hasLivePeriodV28(PER))return U?.p?.[PER]||{};
 const r=liveRowsV28(PER).find(x=>normMatV27(x.id)===normMatV27(U?.u?.id));return r||{c:0,a:0,o:0,com:0};
}
person=personV28;
function storePV28(){
 const base=(typeof st==='function'?st()?.p?.[PER]:null)||{}, code=String(U?.u?.st||'').replace(/\D/g,'').replace(/^0+/,'');
 if(!hasLivePeriodV28(PER))return base;
 const rows=liveRowsV28(PER).filter(r=>storeCodeV28(r)===code),sum=rows.reduce((z,r)=>({c:z.c+r.c,a:z.a+r.a,o:z.o+r.o}),{c:0,a:0,o:0});
 const ee=Number(base.ee??base.ef??0)||0,shareDen=Number(base.storeSales??base.totalSales??base.vendaLoja??0)||0;
 return {...base,...sum,ee,ef:Number(base.ef??ee)||ee,att:ee?sum.c/ee:0,gap:sum.c-ee,share:shareDen?sum.c/shareDen:Number(base.share||0),top:[...rows].sort((a,b)=>b.c-a.c)};
}
storeP=storePV28;
function rankInfoV28(){
 const reg=(hasLivePeriodV28(PER)?liveRowsV28(PER):(COMMON?.top?.[PER]||[])).slice().sort((a,b)=>Number(b.c||0)-Number(a.c||0)),me=normMatV27(U?.u?.id),ri=reg.findIndex(x=>normMatV27(x.id)===me),code=String(U?.u?.st||'').replace(/\D/g,'').replace(/^0+/,'');
 const fil=reg.filter(x=>storeCodeV28(x)===code),fi=fil.findIndex(x=>normMatV27(x.id)===me);return {regional:ri>=0?ri+1:null,filial:fi>=0?fi+1:null,topRegional:ri>=0&&ri<10,topFilial:fi>=0&&fi<3};
}
rankInfoV13=rankInfoV28;
function eDayDataV28(){const x=personV28(),details=[];for(const [d,rows] of latestDailyRowsV28(PER)){if(new Date(d+'T12:00:00').getDay()!==1)continue;const a=rows.filter(r=>normMatV27(r?.id??r?.matricula)===normMatV27(U?.u?.id)).reduce((s,r)=>s+rowNumsV28(r).a,0);if(a>0)details.push({d,approved:a,commission:+(a*.10).toFixed(2)})}const eCommission=details.reduce((s,r)=>s+r.commission,0);return {approved:Number(x.a||0),commission:Number(x.com||0),eApproved:details.reduce((s,r)=>s+r.approved,0),eCommission,regularCommission:Math.max(0,Number(x.com||0)-eCommission),details}}
eDayDataV3=eDayDataV28;
const _goV28=go;go=function(v){if(U?.u?.id&&['home','result','store','ranking','metas','metasv4'].includes(v)){loadContentV3().then(()=>{try{_goV28(v)}catch(e){console.error('V28 render',e)}}).catch(()=>{});}return _goV28(v)};


/* ===== V29 2026-09-25: contrato definitivo de fontes dos relatórios =====
 Colaborador: relatório por colaborador, chave matrícula, comissão vem pronta do relatório.
 Filial: relatório Gestão/Lojas (management). Nunca somar colaboradores para formar filial. */
function commissionV29(r){return Number(r?.com??r?.commission??r?.comissao??r?.comissão??r?.comissao_estimada??r?.commission_estimated??0)||0}
function employeeNumsV29(r){const n=rowNumsV28(r);return {...n,com:commissionV29(r)}}
function employeeRowsV29(p){
 const map=new Map();
 for(const [d,rows] of latestDailyRowsV28(p))for(const r of rows){const id=normMatV27(r?.id??r?.matricula);if(!id)continue;const n=employeeNumsV29(r),z=map.get(id)||{id:r?.id??r?.matricula,name:r?.name??r?.nome??'',st:storeCodeV28(r),c:0,a:0,o:0,com:0};z.name=r?.name??r?.nome??z.name;z.st=storeCodeV28(r)||z.st;z.c+=n.c;z.a+=n.a;z.o+=n.o;z.com+=n.com;map.set(id,z)}
 return [...map.values()];
}
liveRowsV28=employeeRowsV29;
person=function(){if(!hasLivePeriodV28(PER))return U?.p?.[PER]||{};return employeeRowsV29(PER).find(x=>normMatV27(x.id)===normMatV27(U?.u?.id))||{c:0,a:0,o:0,com:0}};
function managementRowsV29(p){
 const byDate=new Map();
 for(const up of (APP_DELTA?.updates||[])){const d=String(up?.result_date||'');if(!periodHasDateV27(d,p))continue;const rows=Array.isArray(up?.management)?up.management:[];if(rows.length)byDate.set(d,rows)}
 return [...byDate.entries()].sort((a,b)=>a[0].localeCompare(b[0]));
}
function managementStoreV29(p,stCode){
 const code=String(stCode||'').replace(/\D/g,'').replace(/^0+/,'');let found=false,out={c:0,a:0,o:0,storeSales:0};
 for(const [,rows] of managementRowsV29(p)){for(const r of rows){if(storeCodeV28(r)!==code)continue;found=true;const n=rowNumsV28(r);out.c+=n.c;out.a+=n.a;out.o+=n.o;out.storeSales+=Number(r?.storeSales??r?.store_sales??r?.venda_loja??r?.vendaLoja??r?.totalSales??r?.venda_total??0)||0}}
 return found?out:null;
}
storeP=function(){const base=(typeof st==='function'?st()?.p?.[PER]:null)||{},m=managementStoreV29(PER,U?.u?.st);if(!m)return base;const ee=Number(base.ee??base.ef??0)||0;return {...base,...m,ee,ef:Number(base.ef??ee)||ee,att:ee?m.c/ee:0,gap:m.c-ee,share:m.storeSales?m.c/m.storeSales:Number(base.share||0)}};
eDayDataV3=function(){const x=person(),details=[];for(const [d,rows] of latestDailyRowsV28(PER)){if(new Date(d+'T12:00:00').getDay()!==1)continue;const mine=rows.filter(r=>normMatV27(r?.id??r?.matricula)===normMatV27(U?.u?.id)),approved=mine.reduce((s,r)=>s+employeeNumsV29(r).a,0),commission=mine.reduce((s,r)=>s+employeeNumsV29(r).com,0);if(approved||commission)details.push({d,approved,commission})}const eCommission=details.reduce((s,r)=>s+r.commission,0);return {approved:Number(x.a||0),commission:Number(x.com||0),eApproved:details.reduce((s,r)=>s+r.approved,0),eCommission,regularCommission:Math.max(0,Number(x.com||0)-eCommission),details}};
rankInfoV13=function(){const reg=(hasLivePeriodV28(PER)?employeeRowsV29(PER):(COMMON?.top?.[PER]||[])).slice().sort((a,b)=>Number(b.c||0)-Number(a.c||0)),me=normMatV27(U?.u?.id),ri=reg.findIndex(x=>normMatV27(x.id)===me),code=String(U?.u?.st||'').replace(/\D/g,'').replace(/^0+/,'');const fil=reg.filter(x=>storeCodeV28(x)===code),fi=fil.findIndex(x=>normMatV27(x.id)===me);return {regional:ri>=0?ri+1:null,filial:fi>=0?fi+1:null,topRegional:ri>=0&&ri<10,topFilial:fi>=0&&fi<3}};


/* ===== V30 2026-09-25: comissão eDay + integridade de fontes ===== */
const EDAY_START_V30='2026-08-01';
let EDAY_END_V30=null; // campanha ativa; definir somente quando houver encerramento oficial
function isEDayV30(d){if(!d||d<EDAY_START_V30||(EDAY_END_V30&&d>EDAY_END_V30))return false;return new Date(d+'T12:00:00').getDay()===1}
function employeeRowsV30(p){
 const map=new Map();
 for(const [d,rows] of latestDailyRowsV28(p))for(const r of rows){
  const id=normMatV27(r?.id??r?.matricula);if(!id)continue;const n=employeeNumsV29(r),z=map.get(id)||{id:r?.id??r?.matricula,name:r?.name??r?.nome??'',st:storeCodeV28(r),c:0,a:0,o:0,com:0,eday:0};
  z.name=r?.name??r?.nome??z.name;z.st=storeCodeV28(r)||z.st;z.c+=n.c;z.a+=n.a;z.o+=n.o;
  // relatório já contém 3%; no eDay substitui a comissão daquele movimento por 10% da aprovada
  const finalCom=isEDayV30(d)?n.a*.10:n.com;z.com+=finalCom;if(isEDayV30(d))z.eday+=finalCom;map.set(id,z);
 }
 return [...map.values()];
}
liveRowsV28=employeeRowsV30;
person=function(){if(!hasLivePeriodV28(PER))return U?.p?.[PER]||{};return employeeRowsV30(PER).find(x=>normMatV27(x.id)===normMatV27(U?.u?.id))||{c:0,a:0,o:0,com:0,eday:0}};
eDayDataV3=function(){const x=person(),details=[];for(const [d,rows] of latestDailyRowsV28(PER)){if(!isEDayV30(d))continue;const mine=rows.filter(r=>normMatV27(r?.id??r?.matricula)===normMatV27(U?.u?.id)),approved=mine.reduce((s,r)=>s+employeeNumsV29(r).a,0);if(approved>0)details.push({d,approved,commission:+(approved*.10).toFixed(2)})}const eApproved=details.reduce((s,r)=>s+r.approved,0),eCommission=details.reduce((s,r)=>s+r.commission,0);return {approved:Number(x.a||0),commission:Number(x.com||0),eApproved,eCommission,regularCommission:Math.max(0,Number(x.com||0)-eCommission),details}};
rankInfoV13=function(){const reg=(hasLivePeriodV28(PER)?employeeRowsV30(PER):(COMMON?.top?.[PER]||[])).filter(x=>Number(x.c||0)>0).sort((a,b)=>Number(b.c||0)-Number(a.c||0)),me=normMatV27(U?.u?.id),ri=reg.findIndex(x=>normMatV27(x.id)===me),code=String(U?.u?.st||'').replace(/\D/g,'').replace(/^0+/,'');const fil=reg.filter(x=>storeCodeV28(x)===code),fi=fil.findIndex(x=>normMatV27(x.id)===me);return {regional:ri>=0?ri+1:null,filial:fi>=0?fi+1:null,topRegional:ri>=0&&ri<10,topFilial:fi>=0&&fi<3}};
function auditSourcesV30(){const issues=[];for(const p of ['day','week','month','year']){const em=employeeRowsV30(p);const dup=new Set(),seen=new Set();for(const r of em){const id=normMatV27(r.id);if(seen.has(id))dup.add(id);seen.add(id)}if(dup.size)issues.push(p+': matrículas duplicadas '+[...dup].join(','));for(const [d,rows] of managementRowsV29(p)){for(const r of rows){if(!storeCodeV28(r))issues.push(p+'/'+d+': Gestão/Lojas sem filial')}}}return issues}


/* ===== V31 2026-09-25: Base Mestre de Colaboradores ===== */
function collaboratorAdminV31(){return `<div id=admCollab31 class=card><div class=title>Base de Colaboradores</div><p class=muted>Sincronize a relação regional por matrícula. Novos são incluídos, transferências atualizam a filial e ausentes ficam inativos sem apagar histórico.</p><div class=uploadCardsV3><div><span class=uGreenV3>♙</span><b>Atualizar Base Regional</b><small>Planilha atual de colaboradores CE+PI</small><input class=field type=file id=collabBase31 accept=".xlsx,.xls,.csv"></div></div><button class=btn onclick="importCollaboratorsV31()">Importar / Atualizar Base</button><div id=collabImportOut31></div><hr><div class=title>Cadastrar / Editar Colaborador</div><div class=adminFormV3><input id=cMat31 class=field placeholder="Matrícula"><input id=cName31 class=field placeholder="Nome completo"><input id=cStore31 class=field placeholder="Filial (ex.: 108)"><input id=cRole31 class=field placeholder="Cargo"><select id=cProfile31 class=field><option value=colaborador>Colaborador</option><option value=supervisor>Supervisor</option><option value=gerente>Gerente</option></select><input id=cPwd31 class=field type=password placeholder="Senha ADM"></div><button class=btn onclick="saveCollaboratorV31()">Salvar na base geral</button><div id=collabSaveOut31></div><hr><button class=btn onclick="loadCollaboratorsV31()">Ver resumo da base</button><div id=collabSummary31></div></div>`}
async function importCollaboratorsV31(){const f=$('#collabBase31')?.files?.[0],out=$('#collabImportOut31');if(!f){out.innerHTML='<p class=bad>Selecione a planilha da base regional.</p>';return}out.innerHTML='<p class=muted>Sincronizando base...</p>';try{const fd=new FormData();fd.append('action','collaborators_import');fd.append('matricula',String(U.u.id));fd.append('collaborators',f);const r=await fetch(ESTORE_API,{method:'POST',body:fd}),j=await r.json();if(!r.ok||!j.ok)throw new Error(j.error||'Falha na atualização.');out.innerHTML=`<div class=notice><b>Base atualizada.</b><br>Novos: ${j.inserted||0} | Atualizados: ${j.updated||0} | Transferidos: ${j.transferred||0} | Inativados: ${j.inactivated||0} | Sem alteração: ${j.unchanged||0}<br>Ativos na regional: ${j.active||0}</div>`;await loadContentV3()}catch(e){out.innerHTML='<p class=bad>'+escV3(e.message||e)+'</p>'}}
async function saveCollaboratorV31(){const out=$('#collabSaveOut31'),x={matricula:$('#cMat31')?.value.trim(),nome:$('#cName31')?.value.trim(),store_code:$('#cStore31')?.value.trim(),cargo:$('#cRole31')?.value.trim(),profile_type:$('#cProfile31')?.value,situacao:'Ativo'};if(!x.matricula||!x.nome||!x.store_code){out.innerHTML='<p class=bad>Informe matrícula, nome e filial.</p>';return}try{const r=await fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'collaborator_admin_save',matricula:String(U.u.id),password:$('#cPwd31')?.value||'',collaborator:x})}),j=await r.json();if(!r.ok||!j.ok)throw new Error(j.error||'Falha ao salvar.');out.innerHTML='<div class=notice>Colaborador incorporado à base geral com sucesso.</div>';await loadContentV3()}catch(e){out.innerHTML='<p class=bad>'+escV3(e.message||e)+'</p>'}}
async function loadCollaboratorsV31(){const out=$('#collabSummary31');out.innerHTML='<p class=muted>Carregando...</p>';try{const r=await fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'collaborators_admin_get',matricula:String(U.u.id)})}),j=await r.json();if(!r.ok||!j.ok)throw new Error(j.error||'Falha ao consultar.');const a=j.collaborators||[],active=a.filter(x=>!/inativ/i.test(String(x.situacao||''))),stores=new Set(active.map(x=>String(x.store_code)));out.innerHTML=`<div class=metricGridV3><div class="metricCardV3 mGreenV3"><span>Ativos</span><b>${num(active.length)}</b></div><div class="metricCardV3 mSandV3"><span>Base total</span><b>${num(a.length)}</b></div><div class="metricCardV3 mOrangeV3"><span>Filiais</span><b>${num(stores.size)}</b></div></div>`}catch(e){out.innerHTML='<p class=bad>'+escV3(e.message||e)+'</p>'}}
const _adminV31=adminV3;adminV3=function(){const base=_adminV31();return base+collaboratorAdminV31()};


/* ===== V32 2026-09-25: coerência única de fontes em todos os menus ===== */
function employeeRowsV32(p=PER){return hasLivePeriodV28(p)?employeeRowsV30(p):((COMMON?.top?.[p]||[]).map(x=>({...x}))) }
function regionalRankRowsV32(p=PER){return employeeRowsV32(p).filter(x=>Number(x.c||0)>0).sort((a,b)=>Number(b.c||0)-Number(a.c||0))}
function filialRankRowsV32(p=PER,code=String(U?.u?.st||'')){const stc=String(code).replace(/\D/g,'').replace(/^0+/,'');return regionalRankRowsV32(p).filter(x=>storeCodeV28(x)===stc)}
function regionalStoresV32(p=PER){const codes=Object.keys(COMMON?.stores||{});return codes.map(st=>{const x=managementStoreV29(p,st);return {...x,st:String(st).padStart(3,'0')}}).filter(x=>x.st)}
recognitionV3=function(){const a=regionalRankRowsV32('month'),pos=a.findIndex(x=>normMatV27(x.id)===normMatV27(U?.u?.id)),me=a[pos];if(pos>=0&&pos<10)return `<div class="recognitionV3 top10V3"><div class=recIconV3>★</div><div><span class=recTagV3>Top 10 Regional • ${pos+1}º</span><h3>Parabéns!</h3><p>Talento é conquista.</p></div><button onclick="PER='month';go('ranking')">›</button></div>`;if(!me||Number(me.c||0)===0)return `<div class="recognitionV3 zeroV3"><div class=recIconV3>↗</div><div><span class=recTagV3>Sem vendas no período</span><h3>Vontade de crescer.</h3></div><button onclick="go('campaigns')">›</button></div>`;return ''}
ranking=function(){const me=person();let body='';if(RANK_SCOPE==='regional'){const a=regionalRankRowsV32();body=a.map((x,i)=>`<div class="rank rankV3 ${normMatV27(x.id)===normMatV27(U.u.id)?'meRankV3':''}"><div class=medal>${i<3?['🥇','🥈','🥉'][i]:i+1+'º'}</div><div>${avatarForV5(x.id,x.name,'xs')}<section><b>${escV3(normMatV27(x.id)===normMatV27(U.u.id)?'Você':(x.name||'Matrícula '+x.id))}</b><div class=muted>Filial ${escV3(x.st)}</div></section></div><span><b>${money(x.c)}</b><br><small>${num(x.o)} pedidos</small></span></div>`).join('')||'<p class=muted>Sem resultados no período.</p>'}else if(RANK_SCOPE==='filial'){const a=filialRankRowsV32();body=a.map((x,i)=>`<div class="rank rankV3 ${normMatV27(x.id)===normMatV27(U.u.id)?'meRankV3':''}"><div class=medal>${i+1}º</div><div>${avatarForV5(x.id,x.name,'xs')}<section><b>${escV3(normMatV27(x.id)===normMatV27(U.u.id)?'Você':(x.name||'Matrícula '+x.id))}</b></section></div><span><b>${money(x.c)}</b><br><small>${num(x.o)} pedidos</small></span></div>`).join('')||'<p class=muted>Sem resultados no período.</p>'}else body=`<div class=metricGridV3><div class="metricCardV3 mGreenV3"><span>Posição empresa</span><b>${me.nr?num(me.nr)+'º':'—'}</b></div><div class="metricCardV3 mSandV3"><span>Venda captada</span><b>${money(me.c)}</b></div></div>`;return `<div class=pageTitleV3><span>Ranking</span></div><div class=card><div class=scopeTabs><button class="${RANK_SCOPE==='filial'?'on':''}" onclick="setRankV3('filial')">Filial</button><button class="${RANK_SCOPE==='regional'?'on':''}" onclick="setRankV3('regional')">Regional</button><button class="${RANK_SCOPE==='empresa'?'on':''}" onclick="setRankV3('empresa')">Empresa</button></div>${tabs()}${body}</div>${shareBarV4('ranking')}`}
teamV3=function(){if(!supV3())return '<div class=card><div class=title>Meu Time</div><p>Conteúdo disponível para liderança.</p></div>';const sold=filialRankRowsV32(),known=new Map(sold.map(x=>[normMatV27(x.id),x])),roster=(U.team?.[PER]||[]).map(x=>known.get(normMatV27(x.id))||{...x,c:0,a:0,o:0}),a=[...roster,...sold.filter(x=>!roster.some(r=>normMatV27(r.id)===normMatV27(x.id)))],yes=a.filter(x=>Number(x.c||0)>0),no=a.filter(x=>Number(x.c||0)===0),sorted=[...a].sort((x,y)=>Number(y.c||0)-Number(x.c||0));return `<div class=pageTitleV3><span>Meu Time</span></div><div class=card>${tabs()}<div class=metricGridV3><div class="metricCardV3 mGreenV3"><span>Ativos eStore</span><b>${num(yes.length)}</b></div><div class="metricCardV3 mLowV3"><span>Zerados</span><b>${num(no.length)}</b></div><div class="metricCardV3 mSandV3"><span>Venda captada</span><b>${money(yes.reduce((s,x)=>s+Number(x.c||0),0))}</b></div><div class="metricCardV3 mOrangeV3"><span>Pedidos</span><b>${num(yes.reduce((s,x)=>s+Number(x.o||0),0))}</b></div></div><div class=title style="margin-top:16px">Ranking da equipe <small class=autoTagV3>Relatório por matrícula</small></div><div class=teamRankV3>${sorted.map((x,i)=>`<div class=teamRankRowV5><span class=posV3>${i+1}</span>${avatarForV5(x.id,x.name,'xs')}<b>${escV3(normMatV27(x.id)===normMatV27(U.u.id)?'Você':(x.name||'Matrícula '+x.id))}</b><strong>${money(x.c)}</strong><em class="${Number(x.c||0)>0?'perfGoodV3':'perfLowV3'}">${Number(x.c||0)>0?'Com venda':'Zerado'}</em></div>`).join('')}</div></div>${shareBarV4('team')}`}
rankingRowsV5=function(type){if(type==='store'||type==='meta'||type==='team'||(type==='ranking'&&RANK_SCOPE==='filial'))return filialRankRowsV32().slice(0,5);return regionalRankRowsV32().slice(0,5)}
reportsV3=function(){if(!supV3())return '<div class=card><div class=title>Relatórios e Rankings</div><p>Conteúdo disponível para liderança.</p></div>';const base=admV3()?regionalStoresV32():[managementStoreV29(PER,U.u.st)],sorted=[...base].sort((a,b)=>reportValueV3(b)-reportValueV3(a)),mx=Math.max(1,...sorted.map(reportValueV3));return `<div class=pageTitleV3><span>Relatórios e Rankings</span></div><div class=card><div class=reportTabsV3><button class="${REPORT_METRIC==='sales'?'on':''}" onclick="setReportMetricV3('sales')">Vendas</button><button class="${REPORT_METRIC==='orders'?'on':''}" onclick="setReportMetricV3('orders')">Pedidos</button><button class="${REPORT_METRIC==='ticket'?'on':''}" onclick="setReportMetricV3('ticket')">Ticket</button><button class="${REPORT_METRIC==='share'?'on':''}" onclick="setReportMetricV3('share')">Share</button></div>${tabs()}<div class=chartCardV3><div class=chartTitleV3><b>${reportLabelV3()}</b><small>Fonte: Gestão/Lojas</small></div><div class=horizontalBarsV3>${sorted.slice(0,10).map((x,i)=>`<div><span class=hbLabelV3>${i+1}. ${escV3(x.st||U.u.st)}</span><div><i style="width:${Math.max(3,reportValueV3(x)/mx*100)}%"></i></div><b>${reportFormatV3(reportValueV3(x))}</b></div>`).join('')}</div></div></div>`}


/* ===== V33 2026-09-25: Pool separado da comissão individual ===== */
function poolCalcV33(){const start='2026-08-01',asof=APP_DELTA?.asof||COMMON.asof||'',st=String(U?.u?.st||'').padStart(3,'0'),eligible=(U?.pool?.eligible||[]),updates=(APP_DELTA?.updates||[]).filter(up=>{const d=String(up.result_date||'');return d>=start&&samePeriodV4(d,PER,asof)});let approved=0;for(const up of updates){const r=(up.management||[]).find(x=>String(x.st||'').padStart(3,'0')===st);if(r)approved+=Number(r.a||0)}if(!updates.length){const x=managementStoreV29(PER,st);approved=Number(x.a||0)}const pool=approved*.03,sim=eligible.length?pool/eligible.length:0;return {approved,pool,eligible,sim}}
function ownCommissionV33(){const x=person(),ed=eDayDataV3();return {sales:Number(x.c||0),approved:Number(x.a||0),commission:Number(ed.commission||0),eday:Number(ed.eCommission||0)}}
poolV3=function(){if(!supV3())return '<div class=card><div class=title>Pool / Comissão</div><p>Conteúdo disponível para supervisores elegíveis.</p></div>';const x=poolCalcV33(),own=ownCommissionV33(),hist=poolSeriesV3(),mx=Math.max(1,...hist.map(h=>h.value));return `<div class=pageTitleV3><span>Pool / Comissionamento</span></div><div class=card><div class=poolHeroV3><small>Incentivo adicional para supervisores elegíveis</small></div>${tabs()}<div class=notice><b>Pool eStore é um incentivo adicional.</b><br>Ele não substitui e não é somado ao cálculo da sua comissão individual. Os dois valores são demonstrados separadamente.</div><div class=title style="margin-top:16px">Seu resultado individual</div><div class=metricGridV3><div class="metricCardV3 mGreenV3"><span>Sua venda captada</span><b>${money(own.sales)}</b></div><div class="metricCardV3 mRoseV3"><span>Sua venda aprovada</span><b>${money(own.approved)}</b></div><div class="metricCardV3 mSandV3"><span>Sua comissão de vendas</span><b>${money(own.commission)}</b><small>3% normal • 10% no eDay</small></div><div class="metricCardV3 mOrangeV3"><span>Dentro disso: eDay</span><b>${money(own.eday)}</b></div></div><div class=title style="margin-top:18px">Seu incentivo Pool</div><div class=metricGridV3><div class="metricCardV3 mRoseV3"><span>Venda aprovada da filial</span><b>${money(x.approved)}</b><small>Fonte: Gestão/Lojas</small></div><div class="metricCardV3 mOrangeV3"><span>Pool da filial • 3%</span><b>${money(x.pool)}</b></div><div class="metricCardV3 mGreenV3"><span>Supervisores elegíveis</span><b>${num(x.eligible.length)}</b></div><div class="metricCardV3 mSandV3"><span>Seu rateio estimado</span><b>${money(x.sim)}</b><small>Pool ÷ supervisores elegíveis</small></div></div><div class=title style="margin-top:16px">Quem participa do Pool</div><p class=muted>Supervisores de Operações, Eficiência Operacional, Experiência e Comercial. Supervisão de Serviços e Soluções não entra neste incentivo.</p>${x.eligible.length?`<div class=teamRankV3>${x.eligible.map(v=>`<div><b>${escV3(v.name||v.id)}</b><strong>1/${x.eligible.length} do pool</strong></div>`).join('')}</div>`:''}<div class=title style="margin-top:16px">Regra de cálculo</div><ol class=rulesV3><li>Pool = 3% da venda total aprovada da filial.</li><li>O Pool é dividido igualmente pela quantidade de supervisores elegíveis da filial.</li><li>Começa a ser considerado a partir de agosto/2026.</li><li>Se o supervisor também realizar venda, sua comissão individual continua independente: 3% normalmente ou 10% nas vendas aprovadas de segunda-feira/eDay.</li><li>O valor do Pool nunca entra na base de cálculo da comissão individual.</li></ol><div class=chartCardV3><div class=chartTitleV3><div><b>Evolução do Pool da filial</b><small>3% sobre aprovado • desde agosto/2026</small></div><span>R$</span></div><div class=poolTabsV3><button class="${POOL_VIEW==='day'?'on':''}" onclick="setPoolViewV3('day')">Dia</button><button class="${POOL_VIEW==='week'?'on':''}" onclick="setPoolViewV3('week')">Semana</button><button class="${POOL_VIEW==='month'?'on':''}" onclick="setPoolViewV3('month')">Mês</button></div>${hist.length?`<div class=barChartV3>${hist.map(h=>`<div><span style="height:${Math.max(8,h.value/mx*110)}px"></span><small>${h.label}</small><em>${money(h.value)}</em></div>`).join('')}</div>`:'<p class=muted>Sem histórico disponível para o período.</p>'}</div></div>${shareBarV4('pool')}`}


/* ===== V35 2026-09-26: baseline oficial até 25/09 + incrementos diários =====
   O backend passa a ser a fonte única dos acumulados. O frontend não substitui
   mês/semana/ano por apenas as cargas incrementais do APP_DELTA. */
person=function(){return U?.p?.[PER]||{c:0,a:0,o:0,com:0}};
storeP=function(){return (typeof st==='function'?st()?.p?.[PER]:null)||{c:0,a:0,o:0,share:0,att:0,gap:0,ee:0,ef:0,top:[]}};
regionalRankRowsV32=function(p=PER){return (COMMON?.top?.[p]||[]).map(x=>({...x})).filter(x=>Number(x.c||0)>0).sort((a,b)=>Number(b.c||0)-Number(a.c||0))};
filialRankRowsV32=function(p=PER,code=String(U?.u?.st||'')){return (U?.team?.[p]||[]).map(x=>({...x,st:String(code)})).filter(x=>Number(x.c||0)>0).sort((a,b)=>Number(b.c||0)-Number(a.c||0))};
regionalStoresV32=function(p=PER){return Object.keys(COMMON?.stores||{}).map(code=>({...(COMMON.stores?.[code]?.p?.[p]||{}),st:String(code).padStart(3,'0')}))};
rankInfoV13=function(){const reg=regionalRankRowsV32(PER),me=normMatV27(U?.u?.id),ri=reg.findIndex(x=>normMatV27(x.id)===me),fil=filialRankRowsV32(PER),fi=fil.findIndex(x=>normMatV27(x.id)===me);return {regional:ri>=0?ri+1:null,filial:fi>=0?fi+1:null,topRegional:ri>=0&&ri<10,topFilial:fi>=0&&fi<3}};
poolCalcV33=function(){const p=storeP(),eligible=(U?.pool?.eligible||[]),approved=Number(p.a||0),pool=approved*.03,sim=eligible.length?pool/eligible.length:0;return {approved,pool,eligible,sim}};


/* ===== V36 2026-10-01: histórico mensal de comissão ===== */
let RESULT_HISTORY_V36=null;
let RESULT_HISTORY_MONTH_V36='';

function monthLabelV36(ym){
  if(!/^\d{4}-\d{2}$/.test(String(ym||'')))return String(ym||'');
  const d=new Date(String(ym)+'-01T12:00:00');
  return d.toLocaleDateString('pt-BR',{month:'long',year:'numeric'}).replace(/^./,s=>s.toUpperCase());
}
function resultHistoryShellV36(){
  return '<div class="card resultHistoryCardV36" id=resultHistoryV36><div class=title>Histórico mensal</div><p class=muted>Carregando seus resultados e comissões anteriores...</p></div>';
}
function resultHistoryHtmlV36(month){
  const data=RESULT_HISTORY_V36,rows=data?.months||[];
  if(!rows.length)return '<div class=title>Histórico mensal</div><div class=notice>Não há meses com histórico de vendas para esta matrícula.</div>';
  const selected=rows.find(x=>x.month===month)||rows[0];
  RESULT_HISTORY_MONTH_V36=selected.month;
  const currentMonth=typeof localIsoV4==='function'?localIsoV4().slice(0,7):new Date().toISOString().slice(0,7);
  const closed=selected.month<currentMonth;
  const stores=(selected.stores||[]).join(' • ')||String(U?.u?.st||'');
  return '<div class=resultHistoryHeadV36><div><div class=title>Histórico mensal</div><p class=muted>Consulte seus resultados e sua comissão por competência.</p></div>'+
    '<select class="field historyMonthSelectV36" onchange="renderResultHistoryV36(this.value)">'+
      rows.map(x=>'<option value="'+escV3(x.month)+'" '+(x.month===selected.month?'selected':'')+'>'+escV3(monthLabelV36(x.month))+'</option>').join('')+
    '</select></div>'+
    '<div class=historyPeriodV36><b>'+escV3(monthLabelV36(selected.month))+'</b><span class="'+(closed?'closed':'partial')+'">'+(closed?'Mês fechado':'Mês em andamento')+'</span></div>'+
    '<div class=metricGridV3>'+
      '<div class="metricCardV3 mGreenV3"><span>Venda captada</span><b>'+money(selected.captured)+'</b></div>'+
      '<div class="metricCardV3 mRoseV3"><span>Venda aprovada</span><b>'+money(selected.approved)+'</b></div>'+
      '<div class="metricCardV3 mOrangeV3"><span>Pedidos</span><b>'+num(selected.orders)+'</b></div>'+
      '<div class="metricCardV3 mSandV3"><span>Comissão normal • 3%</span><b>'+money(selected.normalCommission)+'</b><small>Sobre aprovado fora do eDay</small></div>'+
      '<div class="metricCardV3 mOrangeV3"><span>Comissão eDay • 10%</span><b>'+money(selected.edayCommission)+'</b><small>Segundas elegíveis desde ago/2026</small></div>'+
      '<div class="metricCardV3 mGreenV3"><span>Comissão total</span><b>'+money(selected.totalCommission)+'</b><small>Normal + eDay</small></div>'+
    '</div>'+
    '<div class=historyMetaV36><span>Filial(is) no período: <b>'+escV3(stores)+'</b></span><span>Fonte: histórico consolidado por matrícula</span></div>'+
    '<div class=notice><b>Histórico preservado.</b><br>Os meses anteriores permanecem disponíveis e as novas cargas atualizam somente a competência correspondente.</div>';
}
function renderResultHistoryV36(month){
  const box=document.querySelector('#resultHistoryV36');if(!box)return;
  box.innerHTML=resultHistoryHtmlV36(month||RESULT_HISTORY_MONTH_V36);
}
async function loadResultHistoryV36(force=false){
  const box=document.querySelector('#resultHistoryV36');if(!box||!U?.u?.id)return;
  if(RESULT_HISTORY_V36&&!force){renderResultHistoryV36(RESULT_HISTORY_MONTH_V36);return}
  box.innerHTML='<div class=title>Histórico mensal</div><p class=muted>Consultando histórico consolidado...</p>';
  try{
    const r=await fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',body:JSON.stringify({action:'commission_history',matricula:String(U.u.id)})});
    const j=await r.json();if(!r.ok||!j.ok)throw new Error(j.error||'Não foi possível carregar o histórico.');
    RESULT_HISTORY_V36=j;
    if(!RESULT_HISTORY_MONTH_V36||!(j.months||[]).some(x=>x.month===RESULT_HISTORY_MONTH_V36))RESULT_HISTORY_MONTH_V36=j.months?.[0]?.month||'';
    renderResultHistoryV36(RESULT_HISTORY_MONTH_V36);
  }catch(e){
    box.innerHTML='<div class=title>Histórico mensal</div><div class="notice danger">Não foi possível consultar o histórico neste momento.<br>'+escV3(e.message||e)+'</div>';
  }
}
const _resultV36=result;
result=function(){
  const base=_resultV36();
  return base+(PER==='month'?resultHistoryShellV36():'');
};
const _goV36=go;
go=function(v){
  _goV36(v);
  if(v==='result'&&PER==='month')setTimeout(()=>loadResultHistoryV36(),0);
};



/* V36 histórico mensal • estilos */
(function(){
  if(document.getElementById('result-history-v36-style'))return;
  const s=document.createElement('style');
  s.id='result-history-v36-style';
  s.textContent=`
.resultHistoryCardV36{margin-top:12px}
.resultHistoryHeadV36{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap}
.resultHistoryHeadV36 .field{margin:0;min-width:180px;max-width:260px}
.historyPeriodV36{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:14px 0 10px;padding:10px 12px;border-radius:14px;background:#f5f4ef;border:1px solid #e2e0d9}
.historyPeriodV36 b{color:#173F35;font-size:14px}
.historyPeriodV36 span{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;padding:5px 8px;border-radius:999px}
.historyPeriodV36 span.closed{background:#e8f0ec;color:#173F35}
.historyPeriodV36 span.partial{background:#fff1df;color:#9a5a00}
.historyMetaV36{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin:10px 2px 12px;color:#66736f;font-size:10px}
@media(max-width:560px){.resultHistoryHeadV36{align-items:stretch}.resultHistoryHeadV36 .field{max-width:none;width:100%}.historyMetaV36{display:grid}}
`;
  document.head.appendChild(s);
})();


/* ===== V37 2026-10-01: campanha outubro + Conexão eStore + pop-up sonoro ===== */
const CAMPAIGN_OCT_V37={
  title:'eStore no Volume Máximo',
  start:'2026-10-01',
  end:'2026-10-31',
  art:'./october-volume-maximo.svg'
};
let CONNECTION_V37=[];

function campaignActiveV37(){
  const d=(typeof localIsoV4==='function'?localIsoV4():new Date().toISOString().slice(0,10));
  return d>=CAMPAIGN_OCT_V37.start&&d<=CAMPAIGN_OCT_V37.end;
}
function campaignHomeV37(){
  if(!campaignActiveV37())return '';
  return '<section class="campaignHomeV37" onclick="go(\'connectionv37\')" role="button" tabindex="0" aria-label="Abrir campanha eStore no Volume Máximo">'+
    '<div class="campaignHomeGlowV37"></div>'+
    '<img src="'+CAMPAIGN_OCT_V37.art+'" alt="Campanha eStore no Volume Máximo">'+
    '<div class="campaignHomeActionV37"><span class="campaignLiveV37"><i></i> CAMPANHA DE OUTUBRO</span><b>Conferir campanha</b><span>›</span></div>'+
  '</section>';
}
const _homeV37=home;
home=function(){
  let base=_homeV37();
  if(typeof homeTileV20==='function'&&base.includes('</div><div class="homeSignV20">')){
    const tile=homeTileV20('sage','◉','Conexão eStore','Campanhas e boas práticas','connectionv37');
    base=base.replace('</div><div class="homeSignV20">',tile+'</div><div class="homeSignV20">');
  }
  const hero=campaignHomeV37();
  if(!hero)return base;
  const mark='<button class="weekFeatureV20"';
  return base.includes(mark)?base.replace(mark,hero+mark):hero+base;
};

function connectionCampaignV37(){
  return '<article class="connectionCampaignV37">'+
    '<div class="connectionBrandV37"><span class="connectionAvatarV37">eS</span><div><b>eStore CE+PI</b><small>Campanha • Outubro 2026</small></div><span class="connectionPinV37">●</span></div>'+
    '<div class="connectionArtV37"><img src="'+CAMPAIGN_OCT_V37.art+'" alt="eStore no Volume Máximo"></div>'+
    '<div class="connectionCopyV37"><h2>🔊 eStore no Volume Máximo chegou!</h2><p>Durante outubro, vamos aumentar o som das vendas e transformar cada oportunidade em resultado. Gerentes regionais, gerentes de loja e vendedores concorrem a prêmios JBL e Samsung.</p>'+
    '<div class="connectionTagsV37"><span>#eStoreNoVolumeMáximo</span><span>#Outubro</span><span>#JBL</span><span>#Samsung</span></div></div>'+
  '</article>';
}
function connectionV37(){
  return '<div class="pageTitleV3"><span>Conexão eStore</span></div>'+
    '<div class="connectionTabsV37"><button class="on">Todos</button><button>Campanhas</button><button>Boas práticas</button></div>'+
    connectionCampaignV37()+
    '<div id="connectionFeedV37"><div class="card"><p class="muted">Carregando publicações da regional...</p></div></div>';
}
function communityPostHtmlV37(x){
  const media=x.media_url?'<div class="connectionPostMediaV37"><img src="'+escV3(x.media_url)+'" alt=""></div>':'';
  const comments=Number(x.comment_count||0),likes=Number(x.like_count||0),liked=x.liked_by_me===true;
  return '<article class="connectionPostV37">'+
    '<div class="connectionBrandV37"><span class="connectionAvatarV37">'+escV3(String(x.author_name||'eS').trim().slice(0,2).toUpperCase())+'</span><div><b>'+escV3(x.author_name||'eStore CE+PI')+'</b><small>Filial '+escV3(x.store_code||'CE+PI')+'</small></div></div>'+
    '<h3>'+escV3(x.title||'Conexão eStore')+'</h3>'+
    media+
    (x.body?'<p>'+escV3(x.body)+'</p>':'')+
    '<div class="connectionActionsV37"><button class="'+(liked?'liked':'')+'" onclick="toggleCommunityLikeV37(\''+escV3(String(x.id))+'\')">♥ '+likes+'</button><span>💬 '+comments+'</span></div>'+
  '</article>';
}
async function loadConnectionV37(){
  const box=document.getElementById('connectionFeedV37');if(!box||!U?.u?.id)return;
  try{
    const r=await fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',body:JSON.stringify({action:'community_get',matricula:String(U.u.id)})});
    const j=await r.json();if(!r.ok||!j.ok)throw new Error(j.error||'Não foi possível carregar o Conexão eStore.');
    CONNECTION_V37=Array.isArray(j.items)?j.items:[];
    const other=CONNECTION_V37.filter(x=>String(x.title||'')!==CAMPAIGN_OCT_V37.title);
    box.innerHTML=other.length?other.map(communityPostHtmlV37).join(''):'<div class="card"><p class="muted">A campanha de outubro já está em destaque. Novas publicações aparecerão aqui.</p></div>';
  }catch(e){box.innerHTML='<div class="card"><p class="muted">Conexão eStore temporariamente indisponível.</p></div>'}
}
async function toggleCommunityLikeV37(id){
  try{
    const r=await fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'community_like',matricula:String(U.u.id),post_id:String(id)})});
    const j=await r.json();if(!r.ok||!j.ok)throw new Error(j.error||'Falha ao curtir.');
    await loadConnectionV37();
  }catch(e){alert(String(e.message||e))}
}

function closeCampaignPopupV37(openConnection){
  const el=document.getElementById('campaignPopupV37');if(el)el.remove();
  if(openConnection)go('connectionv37');
}
function showCampaignPopupV37(){
  if(!campaignActiveV37()||!U?.u?.id||document.getElementById('campaignPopupV37'))return;
  const el=document.createElement('div');
  el.id='campaignPopupV37';el.className='campaignOverlayV37';
  el.innerHTML='<div class="campaignWaveV37 w1"></div><div class="campaignWaveV37 w2"></div><div class="campaignWaveV37 w3"></div>'+
    '<div class="campaignModalV37" role="dialog" aria-modal="true" aria-label="Campanha eStore no Volume Máximo">'+
      '<button class="campaignCloseV37" onclick="closeCampaignPopupV37(false)" aria-label="Fechar">×</button>'+
      '<div class="campaignRadioTopV37"><span class="campaignHeadphoneV37">◖</span><div class="campaignEqV37"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><span class="campaignHeadphoneV37 right">◗</span></div>'+
      '<img src="'+CAMPAIGN_OCT_V37.art+'" alt="Campanha eStore no Volume Máximo">'+
      '<div class="campaignModalCopyV37"><span>🔊 ATENÇÃO, TIME!</span><h2>Outubro está no Volume Máximo</h2><p>A campanha eStore do mês já começou. Confira a mecânica, mobilize sua loja e fique de olho nas premiações.</p>'+
      '<button onclick="closeCampaignPopupV37(true)">Conferir campanha <b>→</b></button></div>'+
    '</div>';
  document.body.appendChild(el);
  requestAnimationFrame(()=>el.classList.add('show'));
}

const _refreshNavV37=refreshNavV5;
refreshNavV5=function(){
  _refreshNavV37();
  const sh=document.querySelector('#drawer .sheet');
  if(sh&&!sh.querySelector('[data-connection-v37]')){
    const buttons=[...sh.querySelectorAll('button')];
    const before=buttons.find(b=>/Cupons e Campanhas/i.test(b.textContent||''))||buttons.find(b=>/Informações Importantes/i.test(b.textContent||''));
    const html='<button data-connection-v37="1" onclick="go(\'connectionv37\')">◉ Conexão eStore</button>';
    if(before)before.insertAdjacentHTML('beforebegin',html);else sh.insertAdjacentHTML('beforeend',html);
  }
};
refreshNavV3=refreshNavV5;

const _goV37=go;
go=function(v){
  if(v==='connectionv37'){
    CUR=v;document.querySelector('#drawer')?.classList.remove('open');
    const view=document.querySelector('#view');if(view)view.innerHTML=connectionV37();
    window.scrollTo(0,0);setTimeout(loadConnectionV37,0);
    if(U?.u?.id&&typeof loadNotificationsV14==='function')Promise.resolve(loadNotificationsV14()).catch(()=>{});
    return;
  }
  return _goV37(v);
};

const _loginV37=login;
login=async function(){
  await _loginV37();
  if(U?.u?.id){
    refreshNavV5();
    setTimeout(showCampaignPopupV37,650);
  }
};

(function(){
  if(document.getElementById('campaign-v37-style'))return;
  const s=document.createElement('style');s.id='campaign-v37-style';
  s.textContent=
'.campaignHomeV37{position:relative;display:block;margin:14px 0 16px;border:0;border-radius:24px;overflow:hidden;background:#173F35;box-shadow:0 14px 34px rgba(16,47,41,.18);cursor:pointer}'+
'.campaignHomeV37 img{display:block;width:100%;aspect-ratio:2/1;object-fit:cover}'+
'.campaignHomeGlowV37{position:absolute;inset:-30%;background:radial-gradient(circle at 76% 48%,rgba(222,124,0,.22),transparent 34%);pointer-events:none;animation:campaignGlowV37 2.4s ease-in-out infinite}'+
'.campaignHomeActionV37{position:absolute;left:14px;right:14px;bottom:12px;display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:center;background:rgba(11,34,29,.82);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.16);color:#fff;border-radius:14px;padding:10px 12px;font-size:12px}'+
'.campaignHomeActionV37>b{color:#f5dfaf;font-size:12px}.campaignHomeActionV37>span:last-child{font-size:20px}.campaignLiveV37{display:flex;align-items:center;gap:6px;font-size:9px;font-weight:800;letter-spacing:.08em}.campaignLiveV37 i{width:7px;height:7px;border-radius:50%;background:#DE7C00;box-shadow:0 0 0 0 rgba(222,124,0,.6);animation:campaignLivePulseV37 1.4s infinite}'+
'.connectionTabsV37{display:flex;gap:8px;overflow:auto;margin:0 0 12px;padding-bottom:2px}.connectionTabsV37 button{border:1px solid #d8d7d1;background:#fff;color:#466964;padding:8px 13px;border-radius:999px;font-weight:700;white-space:nowrap}.connectionTabsV37 button.on{background:#173F35;color:#fff;border-color:#173F35}'+
'.connectionCampaignV37,.connectionPostV37{background:#fff;border:1px solid #e7e5df;border-radius:22px;padding:14px;margin-bottom:14px;box-shadow:0 8px 24px rgba(23,63,53,.08)}'+
'.connectionBrandV37{display:flex;align-items:center;gap:10px;margin-bottom:12px}.connectionBrandV37>div{display:grid;gap:2px;flex:1}.connectionBrandV37 small{font-size:10px;color:#7b8582}.connectionAvatarV37{width:36px;height:36px;border-radius:50%;background:#173F35;color:#fff;display:grid;place-items:center;font-weight:800;font-size:12px}.connectionPinV37{color:#DE7C00;font-size:10px}'+
'.connectionArtV37,.connectionPostMediaV37{border-radius:18px;overflow:hidden;background:#173F35}.connectionArtV37 img,.connectionPostMediaV37 img{display:block;width:100%;height:auto}.connectionCopyV37 h2,.connectionPostV37 h3{color:#173F35;margin:13px 0 8px;font-size:18px}.connectionCopyV37 p,.connectionPostV37 p{color:#4d5d58;line-height:1.5;font-size:13px;margin:0 0 12px}.connectionTagsV37{display:flex;gap:6px;flex-wrap:wrap}.connectionTagsV37 span{background:#f2f0e8;color:#466964;border-radius:999px;padding:6px 9px;font-size:9px;font-weight:700}'+
'.connectionActionsV37{display:flex;gap:16px;border-top:1px solid #eeeae3;padding-top:10px;margin-top:10px;color:#6f7b77;font-size:12px}.connectionActionsV37 button{border:0;background:transparent;color:#6f7b77;font-weight:700;padding:0}.connectionActionsV37 button.liked{color:#9b2f43}'+
'.campaignOverlayV37{position:fixed;inset:0;z-index:99999;background:rgba(7,22,19,.82);backdrop-filter:blur(8px);display:grid;place-items:center;padding:18px;opacity:0;transition:opacity .25s ease;overflow:hidden}.campaignOverlayV37.show{opacity:1}.campaignModalV37{position:relative;width:min(440px,94vw);max-height:92vh;overflow:auto;background:#0f2f28;border:1px solid rgba(240,215,164,.36);border-radius:28px;box-shadow:0 30px 80px rgba(0,0,0,.42);transform:translateY(18px) scale(.97);transition:transform .28s ease}.campaignOverlayV37.show .campaignModalV37{transform:none}.campaignModalV37>img{display:block;width:100%;height:auto;border-radius:26px 26px 0 0}'+
'.campaignCloseV37{position:absolute;z-index:4;right:12px;top:12px;width:36px;height:36px;border-radius:50%;border:1px solid rgba(255,255,255,.28);background:rgba(11,34,29,.78);color:#fff;font-size:24px;line-height:32px}.campaignModalCopyV37{padding:18px 20px 22px;color:#fff}.campaignModalCopyV37>span{color:#f1d49a;font-size:10px;font-weight:900;letter-spacing:.12em}.campaignModalCopyV37 h2{margin:7px 0 8px;font-size:22px}.campaignModalCopyV37 p{margin:0 0 16px;color:#D6D2C4;font-size:13px;line-height:1.5}.campaignModalCopyV37 button{width:100%;border:0;border-radius:15px;background:#f1d49a;color:#173F35;font-weight:900;padding:13px 16px;font-size:13px;display:flex;justify-content:center;gap:8px}'+
'.campaignRadioTopV37{position:absolute;z-index:3;left:50%;top:15px;transform:translateX(-50%);display:flex;align-items:center;gap:8px;color:#f1d49a;background:rgba(10,33,28,.78);border:1px solid rgba(241,212,154,.24);border-radius:999px;padding:7px 11px}.campaignHeadphoneV37{font-size:18px;font-weight:900}.campaignHeadphoneV37.right{transform:scaleX(-1)}.campaignEqV37{height:22px;display:flex;align-items:center;gap:3px}.campaignEqV37 i{display:block;width:3px;border-radius:3px;background:#DE7C00;animation:eqV37 .9s ease-in-out infinite}.campaignEqV37 i:nth-child(1){height:8px}.campaignEqV37 i:nth-child(2){height:16px;animation-delay:.1s}.campaignEqV37 i:nth-child(3){height:11px;animation-delay:.2s}.campaignEqV37 i:nth-child(4){height:21px;animation-delay:.3s}.campaignEqV37 i:nth-child(5){height:13px;animation-delay:.4s}.campaignEqV37 i:nth-child(6){height:18px;animation-delay:.5s}.campaignEqV37 i:nth-child(7){height:9px;animation-delay:.6s}'+
'.campaignWaveV37{position:absolute;left:50%;top:50%;width:420px;height:420px;border:2px solid rgba(241,212,154,.22);border-radius:50%;transform:translate(-50%,-50%) scale(.6);animation:waveV37 2.7s ease-out infinite}.campaignWaveV37.w2{animation-delay:.9s}.campaignWaveV37.w3{animation-delay:1.8s}'+
'@keyframes waveV37{0%{opacity:.8;transform:translate(-50%,-50%) scale(.55)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.55)}}@keyframes eqV37{0%,100%{transform:scaleY(.45);opacity:.55}50%{transform:scaleY(1);opacity:1}}@keyframes campaignGlowV37{0%,100%{opacity:.65}50%{opacity:1}}@keyframes campaignLivePulseV37{0%{box-shadow:0 0 0 0 rgba(222,124,0,.55)}70%{box-shadow:0 0 0 8px rgba(222,124,0,0)}100%{box-shadow:0 0 0 0 rgba(222,124,0,0)}}'+
'@media(max-width:560px){.campaignHomeActionV37{grid-template-columns:1fr auto}.campaignHomeActionV37 .campaignLiveV37{grid-column:1/-1}.connectionCampaignV37,.connectionPostV37{border-radius:18px}.campaignModalV37{width:min(410px,96vw)}}';
  document.head.appendChild(s);
})();


/* ===== V38 2026-10-01: Cupons e Campanhas interativo + gestão por vigência ===== */
let CC_TAB_V38='campaigns';

function todayV38(){
  return typeof localIsoV4==='function'?localIsoV4():new Date().toISOString().slice(0,10);
}
function activeWindowV38(x){
  if(!x||x.active===false)return false;
  const d=todayV38(),s=String(x.start_at||x.start||'').slice(0,10),e=String(x.end_at||x.end||'').slice(0,10);
  return (!s||d>=s)&&(!e||d<=e);
}
function activeCampaignsV38(){
  return (APP_CONTENT.campaigns||[]).filter(activeWindowV38).sort((a,b)=>String(b.start_at||'').localeCompare(String(a.start_at||'')));
}
function activeCouponsV38(){
  return (APP_CONTENT.coupons||[]).filter(activeWindowV38).sort((a,b)=>String(a.code||a.title||'').localeCompare(String(b.code||b.title||'')));
}
function currentCampaignV38(){
  return activeCampaignsV38()[0]||null;
}
function campaignArtV38(x){
  return escV3(String(x?.image_url||'./october-volume-maximo.svg'));
}
function campaignPeriodV38(x){
  if(x?.period)return escV3(x.period);
  const s=String(x?.start_at||''),e=String(x?.end_at||'');
  if(!s&&!e)return 'Período não informado';
  const f=d=>{try{return new Date(d+'T12:00:00').toLocaleDateString('pt-BR')}catch(_){return d}};
  return (s?f(s):'Início livre')+(e?' a '+f(e):'');
}
function setCcTabV38(v){CC_TAB_V38=v;go('campaigns')}

async function loadContentV3(){
  try{
    const body={action:'content_get',matricula:String(U?.u?.id||''),demo:String(U?.u?.id||'')==='0000000'};
    const [cr,dr]=await Promise.all([
      fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',body:JSON.stringify(body)}),
      fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',body:JSON.stringify({action:'delta'})})
    ]);
    const x=await cr.json(),d=await dr.json();
    if(cr.ok&&x.ok){
      APP_CONTENT={
        importantInfo:Array.isArray(x.importantInfo)?x.importantInfo:[],
        campaigns:Array.isArray(x.campaigns)?x.campaigns:[],
        coupons:Array.isArray(x.coupons)?x.coupons:[],
        media:Array.isArray(x.media)?x.media:[]
      };
      APP_PROFILE_PHOTOS=x.profilePhotos||APP_PROFILE_PHOTOS||{};
      if(typeof APP_PREFERRED_NAMES!=='undefined')APP_PREFERRED_NAMES=x.preferredNames||APP_PREFERRED_NAMES||{};
    }
    if(dr.ok&&d.ok)APP_DELTA=d;
    if(typeof applyMediaV4==='function')applyMediaV4();
  }catch(e){console.warn('Conteúdo dinâmico:',e)}
}

function ccTabsV38(){
  const items=[['campaigns','📣','Campanhas'],['coupons','🎟','Cupons'],['prizes','🎁','Premiação'],['sell','▥','Como vender']];
  return '<div class="ccTabsV38">'+items.map(i=>'<button class="'+(CC_TAB_V38===i[0]?'on':'')+'" onclick="setCcTabV38(\''+i[0]+'\')"><b>'+i[1]+'</b><span>'+i[2]+'</span></button>').join('')+'</div>';
}
function campaignOverviewV38(){
  const x=currentCampaignV38();
  if(!x)return '<div class="ccEmptyV38"><b>Nenhuma campanha ativa agora.</b><span>As campanhas aparecem automaticamente conforme a vigência definida no ADM.</span></div>';
  return '<div class="ccHeroV38"><img src="'+campaignArtV38(x)+'" alt="'+escV3(x.title||'Campanha eStore')+'"><button onclick="setCcTabV38(\'prizes\')">Ver campanha <span>→</span></button></div>'+
    '<div class="ccTitleV38">Campanha em destaque</div>'+
    '<div class="ccCampaignCardV38"><img src="'+campaignArtV38(x)+'" alt=""><div><b>'+escV3(x.title||'Campanha eStore')+'</b><span>'+campaignPeriodV38(x)+'</span></div></div>'+
    '<div class="ccInfoGridV38">'+
      '<div><i>♙</i><span><b>Quem participa</b>Gerentes regionais, gerentes de loja e vendedores.</span></div>'+
      '<div><i>▣</i><span><b>Período</b>'+campaignPeriodV38(x)+'</span></div>'+
      '<div><i>◎</i><span><b>Critério</b>Aumente o som das vendas e concorra às premiações.</span></div>'+
      '<div><i>🏆</i><span><b>Premiação</b>JBL e Samsung para os melhores resultados.</span></div>'+
    '</div>'+
    '<div class="ccTitleV38">Destaques da campanha</div>'+
    '<div class="ccHighlightGridV38"><button onclick="setCcTabV38(\'prizes\')"><span>📻</span><b>Lideranças</b><small>6 premiados</small><em>›</em></button><button onclick="setCcTabV38(\'prizes\')"><span>🎧</span><b>Vendedores</b><small>45 premiados</small><em>›</em></button></div>'+
    '<button class="ccShareV38" onclick="shareCcV38(\'campaign\')">↗ Compartilhar campanha</button>';
}
function couponCardV38(x){
  const code=escV3(x.code||x.title||'CUPOM'),title=escV3(x.title||x.description||''),desc=escV3(x.description||x.text||'');
  return '<div class="ccCouponV38"><div class="ccCouponCodeV38"><b>'+code+'</b><span>'+title+'</span></div><div class="ccCouponRulesV38"><span>● '+desc+'</span><span>● Não acumula com outros cupons</span>'+(x.end_at?'<small>Válido até '+new Date(x.end_at+'T12:00:00').toLocaleDateString('pt-BR')+'</small>':'')+'</div></div>';
}
function couponsV38(){
  const a=activeCouponsV38();
  return '<div class="ccTitleV38">Cupons e benefícios</div>'+
    (a.length?a.map(couponCardV38).join(''):'<div class="ccEmptyV38"><b>Nenhum cupom ativo.</b><span>Os cupons aparecem conforme a vigência definida no ADM.</span></div>')+
    '<div class="ccTitleV38">Regras importantes</div>'+
    '<div class="ccRulesGridV38"><div><b>🚚</b><span>Frete grátis</span></div><div><b>▭</b><span>10x sem juros</span></div><div><b>♧</b><span>Não acumula cupons</span></div><div><b>▥</b><span>Não vender pelo eStore o que há em loja</span></div></div>'+
    '<div class="ccSellBannerV38"><div><b>Mais possibilidades para o seu cliente</b><span>Quando não tiver o produto em loja, ofereça pelo eStore.</span><button onclick="setCcTabV38(\'sell\')">Acesse e venda</button></div><div>🛒</div></div>'+
    '<div class="ccTitleV38">Dicas rápidas</div>'+
    '<div class="ccTipsV38"><div><b>♙</b><span>Abordagem e script</span></div><div><b>▯</b><span>Uso do App eStore</span></div><div><b>⬡</b><span>Quebra de objeções</span></div><div><b>↗</b><span>Oportunidades de venda</span></div></div>'+
    '<button class="ccShareV38" onclick="shareCcV38(\'coupons\')">↗ Compartilhar cupons</button>';
}
function prizesV38(){
  return '<div class="ccTitleV38">Premiação • eStore no Volume Máximo</div>'+
    '<section class="ccPrizeSectionV38"><div class="ccPrizeHeadV38"><span>📻</span><div><b>Lideranças</b><small>6 premiados</small></div></div>'+
      '<div class="ccPrizeRowV38"><b>Gerentes Regionais</b><span>3 premiados • maior share eStore</span><strong>JBL Boombox 4</strong></div>'+
      '<div class="ccPrizeRowV38"><b>Gerentes de Loja</b><span>3 premiados • maior share por grupo de porte</span><strong>JBL Boombox 3</strong></div></section>'+
    '<section class="ccPrizeSectionV38"><div class="ccPrizeHeadV38"><span>🎧</span><div><b>Vendedores</b><small>45 premiados • valor aprovado por grupo de porte</small></div></div>'+
      '<div class="ccPrizeRowV38"><b>1º a 3º</b><strong>Samsung A07 4G 128GB</strong></div>'+
      '<div class="ccPrizeRowV38"><b>4º e 5º</b><strong>JBL Tune 720 BT</strong></div>'+
      '<div class="ccPrizeRowV38"><b>6º</b><strong>JBL Wave Beam 2</strong></div>'+
      '<div class="ccPrizeRowV38"><b>7º</b><strong>JBL Wave Buds 2</strong></div>'+
      '<div class="ccPrizeRowV38"><b>8º e 9º</b><strong>JBL Go 4</strong></div>'+
      '<div class="ccPrizeRowV38"><b>10º a 15º</b><strong>JBL T520 BT</strong></div></section>'+
    '<button class="ccShareV38" onclick="shareCcV38(\'campaign\')">↗ Compartilhar campanha</button>';
}
function sellMoreV38(){
  const tips=[
    ['01','Amplie as possibilidades','Quando a loja não tiver tamanho, cor ou produto, use o eStore para não perder a venda.'],
    ['02','Apresente a facilidade','Mostre frete grátis, parcelamento e cupons ativos durante a abordagem.'],
    ['03','Use o App junto do cliente','Pesquise o produto, confirme as opções e conduza a compra de forma simples.'],
    ['04','Transforme objeção em solução','Prazo, variedade e disponibilidade podem virar argumentos para fechar a venda.']
  ];
  return '<div class="ccTitleV38">Como vender mais no eStore</div><div class="ccStepsV38">'+tips.map(t=>'<div><span>'+t[0]+'</span><section><b>'+t[1]+'</b><p>'+t[2]+'</p></section></div>').join('')+'</div>'+
  '<div class="ccSellBannerV38"><div><b>Venda que não se perde, vira oportunidade.</b><span>Use o eStore como extensão da sua loja.</span></div><div>📲</div></div>';
}
campaignsV3=function(){
  const body=CC_TAB_V38==='coupons'?couponsV38():CC_TAB_V38==='prizes'?prizesV38():CC_TAB_V38==='sell'?sellMoreV38():campaignOverviewV38();
  return '<div class="ccPageV38"><div class="pageTitleV3"><span>Cupons e Campanhas</span></div>'+ccTabsV38()+body+'</div>';
};

async function shareCcV38(type){
  const x=currentCampaignV38(),coupons=activeCouponsV38();
  const txt=type==='coupons'
    ?'Cupons eStore ativos:\n'+coupons.map(v=>'• '+(v.code||v.title)+': '+(v.description||v.text||'')).join('\n')
    :'eStore no Volume Máximo | Outubro\nAumente o som das vendas! Confira a campanha, critérios e premiações no App. eStore CE+PI.';
  if(navigator.share){try{await navigator.share({title:'eStore CE+PI',text:txt});return}catch(e){}}
  window.open('https://wa.me/?text='+encodeURIComponent(txt),'_blank');
}

function removeLegacyPromoV38(root=document){
  try{
    const nodes=root.querySelectorAll?root.querySelectorAll('div,section,aside'):[]; 
    for(const el of nodes){
      const t=String(el.textContent||'').toLowerCase();
      const legacy=t.includes('já está sabendo da novidade no estore')||t.includes('campanha relâmpago')||(t.includes('giftty card')&&t.includes('300'))||(t.includes('gift card')&&t.includes('300'));
      if(!legacy)continue;
      let cur=el,fixed=null;
      for(let i=0;cur&&i<7;i++,cur=cur.parentElement){
        try{if(getComputedStyle(cur).position==='fixed'){fixed=cur;break}}catch(_){}
      }
      if(fixed)fixed.remove();
    }
  }catch(e){}
}
const LEGACY_OBSERVER_V38=new MutationObserver(ms=>{
  for(const m of ms)for(const n of m.addedNodes||[])if(n.nodeType===1)removeLegacyPromoV38(n);
});
function startLegacyGuardV38(){
  if(!document.body)return;
  try{LEGACY_OBSERVER_V38.observe(document.body,{childList:true,subtree:true})}catch(e){}
  setTimeout(()=>removeLegacyPromoV38(document),250);
}
if(document.body)startLegacyGuardV38();else window.addEventListener('DOMContentLoaded',startLegacyGuardV38);

campaignActiveV37=function(){return !!currentCampaignV38()};
campaignHomeV37=function(){
  const x=currentCampaignV38();if(!x)return '';
  return '<section class="campaignHomeV37" onclick="go(\'campaigns\')" role="button" tabindex="0" aria-label="Abrir campanha '+escV3(x.title||'eStore')+'">'+
    '<div class="campaignHomeGlowV37"></div><img src="'+campaignArtV38(x)+'" alt="'+escV3(x.title||'Campanha eStore')+'">'+
    '<div class="campaignHomeActionV37"><span class="campaignLiveV37"><i></i> CAMPANHA ATIVA</span><b>'+escV3(x.title||'Conferir campanha')+'</b><span>›</span></div></section>';
};
connectionCampaignV37=function(){
  const x=currentCampaignV38();if(!x)return '';
  return '<article class="connectionCampaignV37"><div class="connectionBrandV37"><span class="connectionAvatarV37">eS</span><div><b>eStore CE+PI</b><small>Campanha • '+campaignPeriodV38(x)+'</small></div><span class="connectionPinV37">●</span></div>'+
    '<div class="connectionArtV37"><img src="'+campaignArtV38(x)+'" alt="'+escV3(x.title||'Campanha eStore')+'"></div>'+
    '<div class="connectionCopyV37"><h2>🔊 '+escV3(x.title||'Campanha eStore')+'</h2><p>'+escV3(x.description||x.text||'Confira a campanha ativa no eStore.')+'</p>'+
    '<div class="connectionTagsV37"><span>#eStore</span><span>#Campanha</span><span>#CEPI</span></div></div></article>';
};
showCampaignPopupV37=function(){
  removeLegacyPromoV38(document);
  const x=currentCampaignV38();
  if(!x||document.getElementById('campaignPopupV37'))return;
  const el=document.createElement('div');el.id='campaignPopupV37';el.className='campaignOverlayV37';
  el.innerHTML='<div class="campaignWaveV37 w1"></div><div class="campaignWaveV37 w2"></div><div class="campaignWaveV37 w3"></div>'+
    '<div class="campaignModalV38" role="dialog" aria-modal="true">'+
      '<button class="campaignCloseV37" onclick="closeCampaignPopupV37(false)">×</button>'+
      '<div class="campaignRadioV38"><div class="campaignHeadsetV38">◖</div><div class="campaignEqV37"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="campaignHeadsetV38 right">◗</div></div>'+
      '<div class="campaignPopupArtV38"><img src="'+campaignArtV38(x)+'" alt="'+escV3(x.title||'Campanha')+'"></div>'+
      '<div class="campaignPopupCopyV38"><small>CAMPANHA • '+campaignPeriodV38(x)+'</small><h2>'+escV3(x.title||'Campanha eStore')+'</h2><b>Aumente o som das vendas.</b><p>'+escV3(x.employeeBenefit||x.description||x.text||'Confira os detalhes e aproveite a campanha.')+'</p>'+
      '<button class="campaignPrimaryV38" onclick="closeCampaignPopupV37(false);go(\'campaigns\')">Quero conferir <span>→</span></button>'+
      '<button class="campaignSecondaryV38" onclick="closeCampaignPopupV37(false)">Agora não</button>'+
      '<img class="campaignBrandV38" src="./riachuelo-horizontal-oficial.png" alt="Riachuelo"></div>'+
    '</div>';
  document.body.appendChild(el);requestAnimationFrame(()=>el.classList.add('show'));
};

function ccAdminV38(){
  if(!admV3())return '';
  const camps=APP_CONTENT.campaigns||[],coupons=APP_CONTENT.coupons||[];
  const status=x=>activeWindowV38(x)?'<span class="ccStatusV38 active">No ar</span>':(x.active===false?'<span class="ccStatusV38 off">Inativo</span>':'<span class="ccStatusV38 off">Fora da vigência</span>');
  return '<div id="campaignCouponAdminV38" class="card ccAdminV38"><div class="title">Gestão • Cupons e Campanhas</div><p class="muted">Inclua, edite e defina a vigência. O App exibe automaticamente apenas comunicações ativas dentro do período.</p>'+
    '<input id="ccPwdV38" class="field" type="password" placeholder="Senha ADM">'+
    '<div class="ccAdminColsV38"><section><div class="ccAdminTitleV38"><b>Campanhas</b><button onclick="clearCampaignFormV38()">+ Nova</button></div>'+
      '<input id="ccCampIdV38" type="hidden"><input id="ccCampTitleV38" class="field" placeholder="Nome da campanha"><div class="ccDateGridV38"><label>Início<input id="ccCampStartV38" class="field" type="date"></label><label>Fim<input id="ccCampEndV38" class="field" type="date"></label></div>'+
      '<textarea id="ccCampDescV38" class="field" rows="3" placeholder="Descrição / chamada"></textarea><textarea id="ccCampMechanicsV38" class="field" rows="3" placeholder="Mecânica / critério"></textarea><textarea id="ccCampEmployeeV38" class="field" rows="2" placeholder="Premiação / benefício"></textarea><input id="ccCampImageV38" class="field" placeholder="URL da imagem (opcional)"><label class="ccCheckV38"><input id="ccCampActiveV38" type="checkbox" checked> Comunicação ativa</label><button class="btn" onclick="saveCampaignV38()">Salvar campanha</button><div id="ccCampOutV38"></div>'+
      '<div class="ccAdminListV38">'+camps.map(x=>'<div><section><b>'+escV3(x.title||'Campanha')+'</b><small>'+campaignPeriodV38(x)+'</small>'+status(x)+'</section><button onclick="editCampaignV38(\''+escV3(String(x.id))+'\')">Editar</button><button class="danger" onclick="deleteCcV38(\'campaign\',\''+escV3(String(x.id))+'\')">Excluir</button></div>').join('')+'</div></section>'+
    '<section><div class="ccAdminTitleV38"><b>Cupons</b><button onclick="clearCouponFormV38()">+ Novo</button></div>'+
      '<input id="ccCouponIdV38" type="hidden"><input id="ccCouponCodeV38" class="field" placeholder="Código do cupom"><input id="ccCouponTitleV38" class="field" placeholder="Título / benefício"><div class="ccDateGridV38"><label>Início<input id="ccCouponStartV38" class="field" type="date"></label><label>Fim<input id="ccCouponEndV38" class="field" type="date"></label></div><textarea id="ccCouponDescV38" class="field" rows="3" placeholder="Regras do cupom"></textarea><label class="ccCheckV38"><input id="ccCouponActiveV38" type="checkbox" checked> Cupom ativo</label><button class="btn" onclick="saveCouponV38()">Salvar cupom</button><div id="ccCouponOutV38"></div>'+
      '<div class="ccAdminListV38">'+coupons.map(x=>'<div><section><b>'+escV3(x.code||x.title||'Cupom')+'</b><small>'+escV3(x.title||'')+'</small>'+status(x)+'</section><button onclick="editCouponV38(\''+escV3(String(x.id))+'\')">Editar</button><button class="danger" onclick="deleteCcV38(\'coupon\',\''+escV3(String(x.id))+'\')">Excluir</button></div>').join('')+'</div></section></div></div>';
}
function clearCampaignFormV38(){['ccCampIdV38','ccCampTitleV38','ccCampStartV38','ccCampEndV38','ccCampDescV38','ccCampMechanicsV38','ccCampEmployeeV38','ccCampImageV38'].forEach(id=>{const e=document.getElementById(id);if(e)e.value=''});const a=document.getElementById('ccCampActiveV38');if(a)a.checked=true}
function clearCouponFormV38(){['ccCouponIdV38','ccCouponCodeV38','ccCouponTitleV38','ccCouponStartV38','ccCouponEndV38','ccCouponDescV38'].forEach(id=>{const e=document.getElementById(id);if(e)e.value=''});const a=document.getElementById('ccCouponActiveV38');if(a)a.checked=true}
function editCampaignV38(id){const x=(APP_CONTENT.campaigns||[]).find(v=>String(v.id)===String(id));if(!x)return;document.getElementById('ccCampIdV38').value=x.id||'';document.getElementById('ccCampTitleV38').value=x.title||'';document.getElementById('ccCampStartV38').value=x.start_at||x.start||'';document.getElementById('ccCampEndV38').value=x.end_at||x.end||'';document.getElementById('ccCampDescV38').value=x.description||x.text||'';document.getElementById('ccCampMechanicsV38').value=x.mechanics||'';document.getElementById('ccCampEmployeeV38').value=x.employeeBenefit||'';document.getElementById('ccCampImageV38').value=x.image_url||'';document.getElementById('ccCampActiveV38').checked=x.active!==false;document.getElementById('ccCampTitleV38').scrollIntoView({behavior:'smooth',block:'center'})}
function editCouponV38(id){const x=(APP_CONTENT.coupons||[]).find(v=>String(v.id)===String(id));if(!x)return;document.getElementById('ccCouponIdV38').value=x.id||'';document.getElementById('ccCouponCodeV38').value=x.code||'';document.getElementById('ccCouponTitleV38').value=x.title||'';document.getElementById('ccCouponStartV38').value=x.start_at||x.start||'';document.getElementById('ccCouponEndV38').value=x.end_at||x.end||'';document.getElementById('ccCouponDescV38').value=x.description||x.text||'';document.getElementById('ccCouponActiveV38').checked=x.active!==false;document.getElementById('ccCouponCodeV38').scrollIntoView({behavior:'smooth',block:'center'})}
async function saveCampaignV38(){
  const out=document.getElementById('ccCampOutV38'),password=document.getElementById('ccPwdV38')?.value||'';
  const item={id:document.getElementById('ccCampIdV38')?.value||undefined,title:document.getElementById('ccCampTitleV38')?.value.trim(),start_at:document.getElementById('ccCampStartV38')?.value||'',end_at:document.getElementById('ccCampEndV38')?.value||'',description:document.getElementById('ccCampDescV38')?.value.trim(),text:document.getElementById('ccCampDescV38')?.value.trim(),mechanics:document.getElementById('ccCampMechanicsV38')?.value.trim(),employeeBenefit:document.getElementById('ccCampEmployeeV38')?.value.trim(),image_url:document.getElementById('ccCampImageV38')?.value.trim(),active:document.getElementById('ccCampActiveV38')?.checked!==false};
  if(!item.title){out.innerHTML='<p class="bad">Informe o nome da campanha.</p>';return}
  try{const r=await fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'content_item_save',kind:'campaign',matricula:String(U.u.id),password,item})});const j=await r.json();if(!r.ok||!j.ok)throw new Error(j.error||'Falha ao salvar.');APP_CONTENT.campaigns=j.value||[];out.innerHTML='<div class="notice">Campanha salva e vigência aplicada.</div>';setTimeout(()=>go('adminv3'),500)}catch(e){out.innerHTML='<p class="bad">'+escV3(e.message||e)+'</p>'}
}
async function saveCouponV38(){
  const out=document.getElementById('ccCouponOutV38'),password=document.getElementById('ccPwdV38')?.value||'';
  const item={id:document.getElementById('ccCouponIdV38')?.value||undefined,code:document.getElementById('ccCouponCodeV38')?.value.trim(),title:document.getElementById('ccCouponTitleV38')?.value.trim(),start_at:document.getElementById('ccCouponStartV38')?.value||'',end_at:document.getElementById('ccCouponEndV38')?.value||'',description:document.getElementById('ccCouponDescV38')?.value.trim(),text:document.getElementById('ccCouponDescV38')?.value.trim(),active:document.getElementById('ccCouponActiveV38')?.checked!==false};
  if(!item.code){out.innerHTML='<p class="bad">Informe o código do cupom.</p>';return}
  try{const r=await fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'content_item_save',kind:'coupon',matricula:String(U.u.id),password,item})});const j=await r.json();if(!r.ok||!j.ok)throw new Error(j.error||'Falha ao salvar.');APP_CONTENT.coupons=j.value||[];out.innerHTML='<div class="notice">Cupom salvo e vigência aplicada.</div>';setTimeout(()=>go('adminv3'),500)}catch(e){out.innerHTML='<p class="bad">'+escV3(e.message||e)+'</p>'}
}
async function deleteCcV38(kind,id){
  const password=document.getElementById('ccPwdV38')?.value||'';if(!password){alert('Informe a senha ADM.');return}
  if(!confirm('Excluir este item?'))return;
  try{const r=await fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'content_item_delete',kind,matricula:String(U.u.id),password,id})});const j=await r.json();if(!r.ok||!j.ok)throw new Error(j.error||'Falha ao excluir.');if(kind==='campaign')APP_CONTENT.campaigns=j.value||[];else APP_CONTENT.coupons=j.value||[];go('adminv3')}catch(e){alert(String(e.message||e))}
}
const _adminV38=adminV3;
adminV3=function(){
  let base=_adminV38();
  base=base.replaceAll("document.getElementById('admCamp3').scrollIntoView()","document.getElementById('campaignCouponAdminV38').scrollIntoView()");
  return base+ccAdminV38();
};

(function(){
  if(document.getElementById('cc-v38-style'))return;
  const s=document.createElement('style');s.id='cc-v38-style';
  s.textContent=
'#admCamp3{display:none!important}.ccPageV38{padding-bottom:16px}.ccTabsV38{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;background:#fff;border:1px solid #e8e5df;border-radius:24px;padding:8px;margin-bottom:12px;position:sticky;top:4px;z-index:10}.ccTabsV38 button{border:0;background:transparent;border-radius:16px;color:#52625d;padding:9px 4px;display:grid;gap:3px;place-items:center;font-size:10px;font-weight:700}.ccTabsV38 button b{font-size:19px}.ccTabsV38 button.on{background:#173F35;color:#fff;box-shadow:0 8px 20px rgba(23,63,53,.18)}'+
'.ccHeroV38{position:relative;border-radius:24px;overflow:hidden;background:#173F35;box-shadow:0 12px 28px rgba(23,63,53,.14);margin-bottom:16px}.ccHeroV38 img{display:block;width:100%;aspect-ratio:2/1;object-fit:cover}.ccHeroV38 button{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);border:0;border-radius:999px;padding:10px 18px;background:#f1d49a;color:#173F35;font-weight:900;white-space:nowrap}.ccTitleV38{font-size:18px;font-weight:900;color:#173F35;margin:17px 4px 10px}.ccCampaignCardV38{display:grid;grid-template-columns:1.15fr .85fr;border-radius:20px;overflow:hidden;background:#fff;border:1px solid #e7e4dd}.ccCampaignCardV38 img{width:100%;height:125px;object-fit:cover}.ccCampaignCardV38>div{display:flex;flex-direction:column;justify-content:center;padding:12px;color:#173F35}.ccCampaignCardV38 b{font-size:16px}.ccCampaignCardV38 span{font-size:11px;color:#71807b;margin-top:5px}'+
'.ccInfoGridV38{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:9px}.ccInfoGridV38>div{display:flex;gap:9px;align-items:flex-start;background:#f3f2ed;border-radius:16px;padding:12px;min-height:86px}.ccInfoGridV38 i{font-style:normal;color:#DE7C00;font-size:21px}.ccInfoGridV38 span{font-size:10px;color:#4c5d57;line-height:1.35}.ccInfoGridV38 b{display:block;font-size:11px;color:#173F35;margin-bottom:4px}.ccHighlightGridV38{display:grid;grid-template-columns:1fr 1fr;gap:9px}.ccHighlightGridV38 button{border:0;border-radius:18px;padding:14px;background:#173F35;color:#fff;display:grid;grid-template-columns:auto 1fr auto;grid-template-rows:auto auto;align-items:center;text-align:left;gap:2px 8px}.ccHighlightGridV38 button:nth-child(2){background:#f4ead8;color:#173F35}.ccHighlightGridV38 span{grid-row:1/3;font-size:26px}.ccHighlightGridV38 b{font-size:12px}.ccHighlightGridV38 small{font-size:9px;opacity:.78}.ccHighlightGridV38 em{grid-row:1/3;grid-column:3;font-style:normal;font-size:20px}.ccShareV38{width:100%;border:0;background:#173F35;color:#fff;border-radius:16px;padding:14px;margin-top:14px;font-weight:900;font-size:13px}'+
'.ccCouponV38{display:grid;grid-template-columns:.9fr 1.1fr;background:#f8f0df;border-radius:18px;overflow:hidden;margin-bottom:10px;border:1px solid #ece7dc}.ccCouponCodeV38{background:#173F35;color:#fff;padding:18px 14px;display:flex;flex-direction:column;justify-content:center}.ccCouponCodeV38 b{font-size:24px}.ccCouponCodeV38 span{font-size:10px;margin-top:3px}.ccCouponRulesV38{padding:13px;display:grid;gap:7px;color:#173F35;font-size:10px;align-content:center}.ccCouponRulesV38 small{color:#81786d}.ccRulesGridV38,.ccTipsV38{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}.ccRulesGridV38>div,.ccTipsV38>div{background:#f2f2ee;border-radius:14px;padding:10px 5px;text-align:center;display:grid;gap:7px;align-content:center;min-height:82px}.ccRulesGridV38 b,.ccTipsV38 b{font-size:20px;color:#173F35}.ccRulesGridV38 span,.ccTipsV38 span{font-size:8px;color:#354a43}.ccSellBannerV38{display:flex;align-items:center;justify-content:space-between;background:#f5ead8;border-radius:19px;padding:15px;margin:15px 0}.ccSellBannerV38>div:first-child{display:grid;gap:4px}.ccSellBannerV38 b{color:#173F35;font-size:15px}.ccSellBannerV38 span{font-size:10px;color:#566660}.ccSellBannerV38 button{border:0;border-radius:999px;background:#173F35;color:#fff;font-size:9px;font-weight:800;padding:8px 13px;margin-top:5px;width:max-content}.ccSellBannerV38>div:last-child{font-size:38px}'+
'.ccPrizeSectionV38{background:#fff;border:1px solid #e7e4dd;border-radius:20px;padding:14px;margin-bottom:12px}.ccPrizeHeadV38{display:flex;gap:10px;align-items:center;margin-bottom:12px}.ccPrizeHeadV38>span{font-size:28px}.ccPrizeHeadV38>div{display:grid}.ccPrizeHeadV38 b{font-size:16px;color:#173F35}.ccPrizeHeadV38 small{font-size:9px;color:#76847f}.ccPrizeRowV38{display:grid;grid-template-columns:1fr auto;gap:4px 8px;border-top:1px solid #eeeae3;padding:10px 2px}.ccPrizeRowV38 b{color:#173F35;font-size:11px}.ccPrizeRowV38 span{grid-column:1/-1;font-size:9px;color:#74817c}.ccPrizeRowV38 strong{color:#173F35;font-size:10px;text-align:right}.ccStepsV38{display:grid;gap:9px}.ccStepsV38>div{display:flex;gap:10px;background:#fff;border:1px solid #e7e4dd;border-radius:18px;padding:13px}.ccStepsV38>div>span{width:34px;height:34px;border-radius:50%;background:#f1d49a;color:#173F35;display:grid;place-items:center;font-weight:900}.ccStepsV38 section{flex:1}.ccStepsV38 b{color:#173F35;font-size:13px}.ccStepsV38 p{margin:5px 0 0;color:#64736e;font-size:10px;line-height:1.45}.ccEmptyV38{background:#fff;border:1px solid #e7e4dd;border-radius:18px;padding:22px;text-align:center;color:#173F35;display:grid;gap:6px}.ccEmptyV38 span{font-size:10px;color:#6f7b77}'+
'.campaignModalV38{position:relative;width:min(430px,94vw);max-height:94vh;overflow:auto;background:#0c2d27;border:1px solid rgba(241,212,154,.45);border-radius:30px;box-shadow:0 30px 80px rgba(0,0,0,.48);transform:translateY(18px) scale(.97);transition:.28s}.campaignOverlayV37.show .campaignModalV38{transform:none}.campaignPopupArtV38{height:330px;overflow:hidden;background:#173F35}.campaignPopupArtV38 img{width:100%;height:100%;object-fit:cover}.campaignRadioV38{position:absolute;z-index:4;top:18px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:8px;background:rgba(8,31,26,.84);border:1px solid rgba(241,212,154,.32);border-radius:999px;padding:7px 12px;color:#f1d49a}.campaignHeadsetV38{font-size:18px;font-weight:900}.campaignHeadsetV38.right{transform:scaleX(-1)}.campaignPopupCopyV38{padding:17px 20px 20px;text-align:center;color:#fff}.campaignPopupCopyV38 small{font-size:9px;color:#f1d49a;letter-spacing:.12em;font-weight:900}.campaignPopupCopyV38 h2{font-size:28px;line-height:1.02;margin:9px 0 5px;color:#fff}.campaignPopupCopyV38>b{color:#f1d49a;font-size:14px}.campaignPopupCopyV38 p{color:#D6D2C4;font-size:12px;line-height:1.45;margin:10px 0 15px}.campaignPrimaryV38,.campaignSecondaryV38{width:100%;border-radius:16px;padding:13px;font-weight:900;font-size:13px}.campaignPrimaryV38{border:0;background:#efbd61;color:#173F35}.campaignSecondaryV38{margin-top:9px;border:1px solid rgba(241,212,154,.55);background:transparent;color:#fff}.campaignBrandV38{display:block;max-width:128px;max-height:42px;object-fit:contain;margin:18px auto 0;filter:brightness(0) invert(1);opacity:.92}'+
'.ccAdminV38{margin-top:16px}.ccAdminColsV38{display:grid;grid-template-columns:1fr 1fr;gap:16px}.ccAdminColsV38>section{border:1px solid #e5e1d8;border-radius:18px;padding:13px;background:#fbfaf7}.ccAdminTitleV38{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}.ccAdminTitleV38 b{color:#173F35}.ccAdminTitleV38 button{border:0;background:#173F35;color:#fff;border-radius:999px;padding:7px 11px;font-weight:800}.ccDateGridV38{display:grid;grid-template-columns:1fr 1fr;gap:8px}.ccDateGridV38 label{font-size:9px;color:#61706b}.ccCheckV38{display:flex;align-items:center;gap:7px;font-size:10px;color:#173F35;margin:8px 0 12px}.ccAdminListV38{display:grid;gap:7px;margin-top:12px}.ccAdminListV38>div{display:grid;grid-template-columns:1fr auto auto;gap:6px;align-items:center;background:#fff;border:1px solid #ebe8e1;border-radius:13px;padding:9px}.ccAdminListV38 section{display:grid;gap:2px}.ccAdminListV38 b{font-size:10px;color:#173F35}.ccAdminListV38 small{font-size:8px;color:#7a8581}.ccAdminListV38 button{border:0;border-radius:8px;background:#eef2f0;color:#173F35;font-weight:800;font-size:8px;padding:7px}.ccAdminListV38 button.danger{background:#f8e9e9;color:#8b2d2d}.ccStatusV38{font-size:7px!important;font-weight:900;width:max-content;padding:3px 6px;border-radius:999px}.ccStatusV38.active{background:#e3f0e8;color:#1e6648}.ccStatusV38.off{background:#eeeae5;color:#746f68}'+
'@media(max-width:680px){.ccAdminColsV38{grid-template-columns:1fr}.ccTabsV38{top:2px}.ccRulesGridV38,.ccTipsV38{gap:5px}.ccInfoGridV38{grid-template-columns:1fr 1fr}.campaignPopupArtV38{height:300px}}';
  document.head.appendChild(s);
})();
