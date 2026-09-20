
/* App eStore CE+PI — navegação v2 aprovada */
let APP_CONTENT={importantInfo:[],campaigns:[]};
let RANK_SCOPE='regional';

function escV2(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function firstV2(){return U?.u?.name?U.u.name.trim().split(/\s+/)[0]:''}
function supV2(){return !!(U?.lead||U?.admin)}
function admV2(){return !!U?.admin}

async function loadContentV2(){
  try{
    const r=await fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'content_get'})});
    const j=await r.json();
    if(r.ok&&j.ok)APP_CONTENT={importantInfo:Array.isArray(j.importantInfo)?j.importantInfo:[],campaigns:Array.isArray(j.campaigns)?j.campaigns:[]};
  }catch(e){}
}

function refreshNavV2(){
  const sh=document.querySelector('#drawer .sheet');
  if(sh)sh.innerHTML=`
    <div class="menuHead"><b>App. eStore | CE+PI</b><small>${escV2(U?.u?.name||'')}</small></div>
    <button onclick="go('home')">⌂ Início</button>
    <button onclick="go('result')">▣ Meu Resultado</button>
    <button onclick="go('store')">▤ Minha Filial</button>
    <button onclick="go('ranking')">★ Ranking</button>
    <button onclick="go('campaigns')">◇ Cupons e Campanhas</button>
    ${supV2()?`<button onclick="go('poolv2')">◎ Pool / Comissão</button>`:''}
    <button onclick="go('important')">ⓘ Informações Importantes</button>
    ${supV2()?`<button onclick="go('teamv2')">♙ Meu Time</button>`:''}
    <button onclick="go('profilev2')">◉ Meu Perfil</button>
    ${admV2()?`<button onclick="go('adminv2')">⚙ Administrativo</button>`:''}
    <button class="logoutBtn" onclick="logoutApp()">↪ Sair</button>`;
  const nav=document.getElementById('nav');
  if(nav)nav.innerHTML=`
    <button onclick="go('home')"><span>⌂</span>Início</button>
    <button onclick="go('result')"><span>▣</span>Resultados</button>
    <button onclick="go('campaigns')"><span>◇</span>Campanhas</button>
    <button onclick="go('ranking')"><span>★</span>Ranking</button>
    <button onclick="menu()"><span>☰</span>Menu</button>`;
  const footer=document.querySelector('.footer');
  if(footer)footer.innerHTML='App. eStore | CE+PI<br><small>Fran Lima</small>';
}

function quickV2(){
  return `<div class="quickV2">
    <button onclick="go('result')"><b>▣</b><span>Meu Resultado</span></button>
    <button onclick="go('store')"><b>▤</b><span>Minha Filial</span></button>
    <button onclick="go('campaigns')"><b>◇</b><span>Cupons e Campanhas</span></button>
    ${supV2()?`<button onclick="go('teamv2')"><b>♙</b><span>Meu Time</span></button>`:`<button onclick="go('important')"><b>ⓘ</b><span>Informações</span></button>`}
  </div>`;
}

home=function(){
  const x=person();
  return `<div class="brandHeroV2"><div><small>App. eStore | CE+PI</small><h1>Olá, ${escV2(firstV2())}!</h1><p>Moda que inspira o Brasil</p></div></div>
  <div class=card><div class=title>Resultado • ${pLabel[PER]}</div>${tabs()}
    <div class=grid>
      <div class=kpi>Venda captada<b>${money(x.c)}</b></div>
      <div class=kpi>Venda aprovada<b>${money(x.a)}</b></div>
      <div class=kpi>Pedidos<b>${num(x.o)}</b></div>
      <div class=kpi>Ticket médio<b>${x.o?money(x.c/x.o):money(0)}</b></div>
    </div>
  </div>
  <div class=card><div class=title>Acesso rápido</div>${quickV2()}</div>
  ${pulso()}`;
};

result=function(){
  const x=person();
  return `<div class=pageTitleV2><span>Meu Resultado</span></div>
  <div class=card>${tabs()}<div class=grid>
    <div class=kpi>Venda captada<b>${money(x.c)}</b></div>
    <div class=kpi>Venda aprovada<b>${money(x.a)}</b></div>
    <div class=kpi>Pedidos<b>${num(x.o)}</b></div>
    <div class=kpi>Ticket médio<b>${x.o?money(x.c/x.o):money(0)}</b></div>
    <div class=kpi>Posição CE+PI<b>${x.rr?num(x.rr)+'º':'—'}</b></div>
    <div class=kpi>Posição empresa<b>${x.nr?num(x.nr)+'º':'—'}</b></div>
    <div class=kpi>Comissão<b>${money(x.com)}</b></div>
  </div></div>${calculator()}`;
};

store=function(){
  const x=storeP(),top=x.top||[];
  return `<div class=pageTitleV2><span>Minha Filial • ${escV2(U.u.st)}</span></div>
  <div class=card>${tabs()}<div class=grid>
    <div class=kpi>Meta eStore<b>${money(x.ee)}</b></div>
    <div class=kpi>Realizado<b>${money(x.c)}</b></div>
    <div class=kpi>Atingimento<b>${pct(x.att)}</b></div>
    <div class=kpi>Share eStore<b>${pct(x.share)}</b></div>
    <div class=kpi>Pedidos<b>${num(x.o)}</b></div>
    <div class=kpi>Venda aprovada<b>${money(x.a)}</b></div>
  </div></div>
  <div class=card><div class=title>Top 3 da filial</div>${podium(top)}</div>`;
};

function setRankV2(v){RANK_SCOPE=v;go('ranking')}
ranking=function(){
  const me=person();
  let body='';
  if(RANK_SCOPE==='regional'){
    const a=COMMON.top?.[PER]||[];
    body=a.map((x,i)=>`<div class=rank><div class=medal>${i<3?['🥇','🥈','🥉'][i]:i+1+'º'}</div><div><b>${escV2(x.name)}</b><div class=muted>Filial ${escV2(x.st)}</div></div><span><b>${money(x.c)}</b><br><small>${num(x.o)} pedidos</small></span></div>`).join('')||'<p class=muted>Sem resultados no período.</p>';
  }else if(RANK_SCOPE==='filial'){
    const a=(U.team?.[PER]||[]).length?(U.team[PER]||[]):((st().p?.[PER]?.top)||[]);
    body=[...a].sort((a,b)=>(b.c||0)-(a.c||0)).map((x,i)=>`<div class=rank><div class=medal>${i+1}º</div><div><b>${escV2(x.name)}</b></div><span><b>${money(x.c)}</b><br><small>${num(x.o)} pedidos</small></span></div>`).join('')||'<p class=muted>Sem resultados no período.</p>';
  }else{
    body=`<div class=grid><div class=kpi>Sua posição na empresa<b>${me.nr?num(me.nr)+'º':'—'}</b></div><div class=kpi>Venda captada<b>${money(me.c)}</b></div></div>`;
  }
  return `<div class=pageTitleV2><span>Ranking</span></div><div class=card>
    <div class=scopeTabs><button class="${RANK_SCOPE==='filial'?'on':''}" onclick="setRankV2('filial')">Filial</button><button class="${RANK_SCOPE==='regional'?'on':''}" onclick="setRankV2('regional')">Regional</button><button class="${RANK_SCOPE==='empresa'?'on':''}" onclick="setRankV2('empresa')">Empresa</button></div>
    ${tabs()}${body}</div>`;
};

function couponsV2(){
  return `
  <div class="couponV2 green"><div><b>ESTORE20</b><small>20% OFF</small></div><span>1ª compra pelo App Riachuelo</span></div>
  <details open><summary>Como funciona o ESTORE20</summary><p>20% de desconto na primeira compra realizada pelo App Riachuelo. Uso conforme condições vigentes. Não é cumulativo com outro cupom.</p></details>
  <div class="couponV2 orange"><div><b>ESTORE10</b><small>10% OFF</small></div><span>Válido sempre</span></div>
  <details><summary>Como funciona o ESTORE10</summary><p>10% de desconto para compras eStore. Válido sempre, conforme condições comerciais vigentes. Não é cumulativo com outro cupom.</p></details>
  <details><summary>Benefícios para o cliente</summary><p>Frete grátis conforme regra vigente, parcelamento em até 10x e acesso aos cupons disponíveis.</p></details>
  <details><summary>Regras operacionais</summary><p>BOPIS não comissiona. Retira Rápido não deve ser utilizado no eStore. O desconto de colaborador de 30% não se aplica. Não alterar o destino do pedido fora da necessidade do cliente.</p></details>
  <details><summary>Benefício para o colaborador</summary><p>Comissão calculada sobre venda aprovada conforme regra vigente. Referência de 3%; nas segundas-feiras, eDay de 10%, conforme campanha vigente.</p></details>`;
}

function campaignsV2(){
  const custom=(APP_CONTENT.campaigns||[]).filter(x=>x.active!==false);
  return `<div class=pageTitleV2><span>Cupons e Campanhas</span></div>
  <div class=card>${couponsV2()}</div>
  ${custom.length?`<div class=card><div class=title>Campanhas publicadas</div>${custom.map(c=>`<div class=campaignItemV2><b>${escV2(c.title)}</b>${c.period?`<small>${escV2(c.period)}</small>`:''}<p>${escV2(c.description||'')}</p>${c.mechanics?`<p><b>Mecânica e regras:</b> ${escV2(c.mechanics)}</p>`:''}${c.clientBenefit?`<p><b>Benefício para o cliente:</b> ${escV2(c.clientBenefit)}</p>`:''}${c.employeeBenefit?`<p><b>Benefício para o colaborador:</b> ${escV2(c.employeeBenefit)}</p>`:''}</div>`).join('')}</div>`:''}`;
}

function poolV2(){
  if(!supV2())return '<div class=card><div class=title>Pool / Comissão</div><p>Conteúdo disponível para supervisores elegíveis.</p></div>';
  const x=U.pool||{approved:0,pool:0,eligible:[],sim:0};
  return `<div class=pageTitleV2><span>Pool / Comissão</span></div>
  <div class="card poolV2"><div class=grid>
    <div class=kpi>Venda aprovada da loja<b>${money(x.approved)}</b></div>
    <div class=kpi>Pool • 3%<b>${money(x.pool)}</b></div>
    <div class=kpi>Supervisores elegíveis<b>${num(x.eligible?.length||0)}</b></div>
    <div class=kpi>Rateio estimado<b>${money(x.sim)}</b></div>
  </div></div>
  <div class=card><div class=title>Regras</div><ol class=rulesV2>
    <li>O pool corresponde a 3% sobre o valor aprovado da loja.</li>
    <li>O valor é dividido de forma igualitária entre os supervisores elegíveis.</li>
    <li>São considerados os supervisores elegíveis conforme perfil e situação ativa no período.</li>
    <li>Em mês parcial, o cálculo considera o período trabalhado conforme regra da campanha.</li>
    <li>O valor apresentado no app é acompanhamento gerencial; o pagamento oficial segue a apuração da campanha.</li>
  </ol>${x.eligible?.length?`<div class=notice><b>Elegíveis na base atual</b><br>${x.eligible.map(e=>escV2(e.name)).join(' • ')}</div>`:''}</div>`;
}

function importantV2(){
  const now=new Date().toISOString().slice(0,10);
  const list=(APP_CONTENT.importantInfo||[]).filter(x=>x.active!==false&&(!x.start||x.start<=now)&&(!x.end||x.end>=now)&&(!x.store||x.store==='Todos'||String(x.store)===String(U.u.st))&&(!x.profile||x.profile==='Todos'||(x.profile==='Supervisor'&&supV2())||(x.profile==='Colaborador'&&!supV2())));
  return `<div class=pageTitleV2><span>Informações Importantes</span></div><div class=card>
  ${list.length?list.map(x=>`<div class=infoItemV2><div><span class=infoTagV2>${escV2(x.category||'Informação')}</span><small>${escV2(x.date||'')}</small></div><b>${escV2(x.title||'')}</b><p>${escV2(x.message||'')}</p></div>`).join(''):'<p class=muted>Nenhuma publicação ativa para o seu perfil.</p>'}</div>`;
}

function teamV2(){
  if(!supV2())return '<div class=card><div class=title>Meu Time</div><p>Conteúdo disponível para liderança.</p></div>';
  const a=U.team?.[PER]||[],yes=a.filter(x=>(x.c||0)>0),no=a.filter(x=>(x.c||0)===0);
  return `<div class=pageTitleV2><span>Meu Time</span></div><div class=card>${tabs()}<div class=grid>
    <div class=kpi>Colaboradores<b>${num(a.length)}</b></div><div class=kpi>Ativos eStore<b>${num(yes.length)}</b></div><div class=kpi>Zerados<b>${num(no.length)}</b></div><div class=kpi>Venda captada<b>${money(yes.reduce((s,x)=>s+(x.c||0),0))}</b></div>
  </div><div class=table><table><tr><th>Colaborador</th><th>Captada</th><th>Aprovada</th><th>Pedidos</th></tr>${[...a].sort((x,y)=>(y.c||0)-(x.c||0)).map(x=>`<tr><td>${escV2(x.name)}</td><td>${money(x.c)}</td><td>${money(x.a)}</td><td>${num(x.o)}</td></tr>`).join('')}</table></div></div>`;
}

function profileV2(){
  return `<div class=pageTitleV2><span>Meu Perfil</span></div><div class=card><div class=profileV2>
    <div class=avatarV2>${escV2(firstV2().slice(0,1))}</div><div><b>${escV2(U.u.name)}</b><small>Matrícula ${escV2(U.u.id)}</small></div>
  </div><div class=profileRowsV2><div><span>Filial</span><b>${escV2(U.u.st)}</b></div><div><span>Perfil</span><b>${escV2(U.u.role)}</b></div><div><span>Situação</span><b>${escV2(U.u.status)}</b></div></div></div>`;
}

function importV2(){
 return `<div class=adminSectionV2><div class=title>Importação de Relatórios</div><p class=muted>Atualização e incorporação dos resultados.</p>
   <div class=importBlockV2><b>Resultado diário</b><label>Data do resultado</label><input class=field type=date id=updDate>
   <div class=adminGrid><div class=upload><b>Resultado Colaboradores</b><input class=field type=file id=fCol accept=".xlsx,.xls,.csv"></div><div class=upload><b>Resultado Gerencial / Share</b><input class=field type=file id=fGer accept=".xlsx,.xls,.csv"></div></div>
   <input class=field type=password id=updPwd placeholder="Senha ADM"><button class=btn id=updBtn onclick="validateUpdate()">Validar e incorporar ao histórico</button><div id=updOut></div></div>
   <div class=importBlockV2><b>Metas das lojas</b><input class=field type=file id=fMeta accept=".xlsx,.xls,.csv"><input class=field type=password id=metaPwd placeholder="Senha ADM"><button class=btn id=metaBtn onclick="uploadMeta()">Incorporar meta</button><div id=metaOut></div></div>
 </div>`;
}

function infoAdminV2(){
 return `<div class=adminSectionV2><div class=title>Informações Importantes</div><p class=muted>Publicação direcionada por loja e perfil.</p>
 <div class=adminFormV2><input id=infoTitle class=field placeholder="Título"><select id=infoCategory class=field><option>Campanha</option><option>Regra</option><option>Aviso</option><option>Atualização</option></select><textarea id=infoMessage class=field rows=4 placeholder="Informação"></textarea>
 <select id=infoStore class=field><option>Todos</option>${Object.keys(COMMON.stores||{}).map(s=>`<option>${s}</option>`).join('')}</select><select id=infoProfile class=field><option>Todos</option><option>Colaborador</option><option>Supervisor</option></select>
 <input id=infoStart class=field type=date><input id=infoEnd class=field type=date><input id=infoPwd class=field type=password placeholder="Senha ADM"></div>
 <button class=btn onclick="publishInfoV2()">Publicar</button><div id=infoOut></div></div>`;
}
async function publishInfoV2(){
 const out=$('#infoOut'),title=$('#infoTitle')?.value.trim(),message=$('#infoMessage')?.value.trim(),password=$('#infoPwd')?.value||'';
 if(!title||!message||!password){out.innerHTML='<p class=bad>Preencha título, informação e senha ADM.</p>';return}
 const item={id:Date.now(),title,message,category:$('#infoCategory').value,store:$('#infoStore').value,profile:$('#infoProfile').value,start:$('#infoStart').value,end:$('#infoEnd').value,date:new Date().toLocaleDateString('pt-BR'),active:true};
 const value=[item,...(APP_CONTENT.importantInfo||[])].slice(0,50);
 try{
  const r=await fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'content_publish',kind:'important_info',value,matricula:String(U.u.id),password})});const j=await r.json();if(!r.ok||!j.ok)throw new Error(j.error||'Falha ao publicar.');
  APP_CONTENT.importantInfo=value;out.innerHTML='<div class=notice>Publicação salva.</div>';
 }catch(e){out.innerHTML='<p class=bad>'+escV2(e.message||e)+'</p>'}
}

function campaignAdminV2(){
 return `<div class=adminSectionV2><div class=title>Cupons e Campanhas</div><p class=muted>ESTORE20: 20% OFF na 1ª compra pelo App Riachuelo. ESTORE10: 10% OFF válido sempre.</p>
 <div class=adminFormV2><input id=campTitle class=field placeholder="Nome da campanha"><input id=campPeriod class=field placeholder="Período"><textarea id=campDesc class=field rows=3 placeholder="Descrição"></textarea><textarea id=campMechanics class=field rows=3 placeholder="Mecânica e regras"></textarea><textarea id=campClient class=field rows=2 placeholder="Benefício para o cliente"></textarea><textarea id=campEmployee class=field rows=2 placeholder="Benefício para o colaborador"></textarea><input id=campPwd class=field type=password placeholder="Senha ADM"></div>
 <button class=btn onclick="publishCampaignV2()">Publicar campanha</button><div id=campOut></div></div>`;
}
async function publishCampaignV2(){
 const out=$('#campOut'),title=$('#campTitle')?.value.trim(),password=$('#campPwd')?.value||'';
 if(!title||!password){out.innerHTML='<p class=bad>Informe o nome da campanha e a senha ADM.</p>';return}
 const item={id:Date.now(),title,period:$('#campPeriod').value,description:$('#campDesc').value,mechanics:$('#campMechanics').value,clientBenefit:$('#campClient').value,employeeBenefit:$('#campEmployee').value,active:true};
 const value=[item,...(APP_CONTENT.campaigns||[])].slice(0,30);
 try{
  const r=await fetch(ESTORE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'content_publish',kind:'campaigns_config',value,matricula:String(U.u.id),password})});const j=await r.json();if(!r.ok||!j.ok)throw new Error(j.error||'Falha ao publicar.');
  APP_CONTENT.campaigns=value;out.innerHTML='<div class=notice>Campanha salva.</div>';
 }catch(e){out.innerHTML='<p class=bad>'+escV2(e.message||e)+'</p>'}
}

function adminPanelV2(){
 if(!admV2())return '<div class=card>Acesso restrito ao administrador.</div>';
 const arr=COMMON.regional?.[PER]||[];
 return `<div class=pageTitleV2><span>Área Administrativa</span></div>
 <div class=adminNavV2><button onclick="document.getElementById('admDash').scrollIntoView()">Dashboard</button><button onclick="document.getElementById('admImport').scrollIntoView()">Relatórios</button><button onclick="document.getElementById('admCamp').scrollIntoView()">Cupons e Campanhas</button><button onclick="document.getElementById('admPool').scrollIntoView()">Pool</button><button onclick="document.getElementById('admInfo').scrollIntoView()">Informações</button></div>
 <div id=admDash class=card><div class=title>Dashboard Geral</div>${tabs()}<div class=grid><div class=kpi>Venda captada<b>${money(arr.reduce((s,x)=>s+(x.c||0),0))}</b></div><div class=kpi>Venda aprovada<b>${money(arr.reduce((s,x)=>s+(x.a||0),0))}</b></div><div class=kpi>Pedidos<b>${num(arr.reduce((s,x)=>s+(x.o||0),0))}</b></div><div class=kpi>Lojas ativas<b>${num(arr.filter(x=>(x.c||0)>0).length)}</b></div></div></div>
 <div id=admImport class=card>${importV2()}</div>
 <div id=admCamp class=card>${campaignAdminV2()}</div>
 <div id=admPool class=card><div class=title>Pool / Comissão</div><ol class=rulesV2><li>3% sobre o valor aprovado da loja.</li><li>Rateio igualitário entre supervisores elegíveis.</li><li>Mês parcial conforme período trabalhado.</li><li>Elegibilidade conforme perfil e situação ativa.</li></ol></div>
 <div id=admInfo class=card>${infoAdminV2()}</div>
 <div class=card><div class=title>Configurações / Menu</div><div class=table><table><tr><th>Menu</th><th>Colaborador</th><th>Supervisor</th><th>ADM</th></tr>
 ${[['Início','✓','✓','✓'],['Meu Resultado','✓','✓','✓'],['Minha Filial','✓','✓','✓'],['Ranking','✓','✓','✓'],['Cupons e Campanhas','✓','✓','✓'],['Pool / Comissão','—','✓','✓'],['Informações Importantes','✓','✓','✓'],['Meu Time','—','✓','✓'],['Administrativo','—','—','✓']].map(r=>`<tr>${r.map(x=>`<td>${x}</td>`).join('')}</tr>`).join('')}</table></div></div>`;
}

const goV2Original=go;
go=function(v){
 CUR=v;
 $('#drawer')?.classList.remove('open');
 const map={home,result,store,ranking,campaigns:campaignsV2,poolv2:poolV2,important:importantV2,teamv2:teamV2,profilev2:profileV2,adminv2:adminPanelV2,admin:adminPanelV2};
 $('#view').innerHTML=(map[v]||home)();
 window.scrollTo(0,0);
};

const loginV2Original=login;
login=async function(){
 await loginV2Original();
 if(!U)return;
 await loadContentV2();
 refreshNavV2();
 go('home');
};

celebrate=function(){};
window.addEventListener('DOMContentLoaded',()=>{const footer=document.querySelector('.footer');if(footer)footer.innerHTML='App. eStore | CE+PI<br><small>Fran Lima</small>';});
