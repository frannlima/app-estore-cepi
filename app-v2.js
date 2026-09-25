
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
