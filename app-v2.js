
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
  <div class=table><table><tr><th>#</th><th>Loja</th><th>Captada</th><th>Ating.</th><th>Share</th><th>Performance</th></tr>${sorted.map((x,i)=>{const p=perfV3(x.att);return `<tr class="${p.cls}Row"><td>${i+1}</td><td><b>${x.st}</b></td><td>${money(x.c)}</td><td>${pct(x.att)}</td><td>${pct(x.share)}</td><td><span class="perfPillV3 ${p.cls}">${p.icon} ${p.label}</span></td></tr>`}).join('')}</table></div>
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
