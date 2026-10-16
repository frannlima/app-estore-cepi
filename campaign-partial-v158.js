/* eStore CE+PI | Parcial da campanha eStore no Volume Máximo | Base: 14/10/2026 */
(function(){
 'use strict';
 if(window.__CAMPAIGN_PARTIAL_158__)return;
 window.__CAMPAIGN_PARTIAL_158__=true;
 // matrícula,filial,aprovado válido,bopis,ticket médio. Identificação sem nomes: arquivo de origem não os contém.
 const raw={
  'P+PP':'4120910,512,3354.80,751.74,559.13|4147454,488,3180.75,323.97,244.67|4155659,339,3119.91,0,389.99|4120815,186,2976.26,0,156.65|4128427,206,2657.61,0,442.94|4150943,269,2654.73,0,294.97|4155178,430,2455.34,0,245.53|4146132,512,2399.44,0,299.93|4152175,488,2218.99,0,554.75|4127842,183,2130.13,0,133.13|4139831,289,2003.11,0,182.10|4155639,212,1914.71,0,191.47|4107954,269,1823.49,0,202.61|4151417,289,1708.53,89,155.32|4111694,462,1707.99,1346.67,341.60',
  'M':'4154257,391,10425.21,0,289.59|2943751,288,6518.58,0,260.74|4074079,341,5622.15,0,374.81|4127482,306,4312.09,0,226.95|4144222,233,3648.41,0,228.03|4148643,152,3078.55,0,219.90|4152703,069,3074.80,127.99,153.74|4123786,386,3026.56,0,201.77|4111527,215,2990.31,107.99,249.19|4144879,444,2904.00,656.86,414.86|4152784,516,2861.81,0,317.98|4104871,312,2560.27,63.99,142.24|4147386,391,2505.54,0,250.55|4149223,215,2392.32,132.95,299.04|4149612,061,2343.04,0,390.51',
  'G+GG+EXX':'4149633,100,5013.97,274.97,263.89|4103076,475,4177.25,0,596.75|4153107,155,4173.93,0,208.70|4098621,132,3820.42,0,764.08|4126650,148,3812.67,0,190.63|4129830,440,3570.26,0,396.70|4126767,132,3309.86,0,551.64|4147772,108,3048.68,134.99,1016.23|4111450,366,3030.59,0,3030.59|4123193,100,2978.36,0,156.76|4138261,112,2940.47,609.34,226.19|4145996,366,2880.89,0,221.61|4048856,373,2819.58,0,1409.79|4129807,463,2377.52,0,1188.76|4144104,070,2367.81,0,215.26'
 };
 const groups=['P+PP','M','G+GG+EXX'];
 const ranks={};
 groups.forEach(function(k){ranks[k]=raw[k].split('|').map(function(s,i){const p=s.split(',');return {pos:i+1,mat:p[0],store:p[1],approved:+p[2],bopis:+p[3],ticket:+p[4]};});});
const regionalSnapshot163 = new Map();
 const regionalRaw163="1605496,2,7399,0,1;1940953,2,11197,0,1;1958275,2,53396,13599,4;2129752,0,14938,0,2;2365510,1,35693,0,2;2383101,1,8999,0,1;2396254,2,8099,28436,1;2438526,2,14038,0,2;2503247,0,11339,0,1;2739623,1,15999,11999,1;2739658,2,14399,0,1;2981319,2,76595,0,2;2998041,2,11998,0,1;3115445,1,46248,0,2;3116573,1,3599,0,1;3121089,1,16109,0,1;3122670,1,26998,0,2;3539555,2,11699,0,1;3633039,2,2699,26998,1;3661628,2,47192,0,3;3978219,1,7999,0,1;3978232,1,16199,0,1;3978689,0,39995,0,2;3995006,1,8999,0,1;3995369,1,16199,0,1;3996043,2,14399,0,1;4022411,2,11898,0,2;4024343,2,47998,0,1;4024839,2,23399,25198,1;4027213,0,27177,0,2;4028106,2,4679,54599,1;4028550,0,15299,0,1;4029444,2,25554,0,2;4039449,0,12599,0,1;4042043,2,9598,0,2;4055249,2,0,14399,0;4057052,1,30597,0,2;4058246,2,61596,0,4;4072556,1,25999,0,1;4074900,1,9576,0,1;4078853,2,70491,0,3;4082802,1,45807,0,2;4084535,0,14999,0,1;4084907,2,15999,0,1;4086800,0,33299,0,1;4088249,0,32476,0,4;4089941,1,12329,0,1;4092200,2,8599,0,1;4092977,2,27098,0,2;4093172,2,24837,0,3;4095459,2,8750,0,1;4095649,2,15999,0,1;4095765,2,7999,0,1;4095861,2,92554,0,6;4097172,1,1439,0,1;4098020,2,10999,0,1;4099552,2,0,12289,0;4102031,0,42035,0,3;4102034,1,25797,0,3;4102719,2,44598,0,1;4103295,2,106471,0,2;4104681,0,8999,0,1;4105334,1,9449,0,1;4106241,2,38696,25198,2;4106242,1,36998,0,2;4106781,2,17999,0,1;4106785,0,15299,0,1;4107565,0,13999,0,1;4108064,2,7199,0,1;4110028,0,42936,0,4;4111143,0,0,10799,0;4111385,2,20798,0,1;4111724,2,26997,0,1;4112324,1,94432,0,6;4112993,2,0,12239,0;4117626,2,16199,0,1;4117758,0,82011,19798,5;4118200,2,101332,0,4;4118739,1,14399,0,1;4121063,0,9651,0,1;4121570,1,14399,0,1;4122269,0,18419,0,2;4124391,0,12599,0,1;4124625,2,20330,0,2;4124627,2,5399,0,1;4125114,1,53896,21598,3;4125219,2,8999,0,1;4125940,2,6299,0,1;4126711,1,17792,0,2;4126793,0,49936,0,4;4127308,1,17999,0,1;4127497,0,37889,0,4;4127502,0,16199,0,1;4127517,0,9718,0,2;4127653,0,13548,0,2;4127979,2,37836,0,3;4129559,2,28798,0,1;4129639,1,22398,0,2;4129669,0,12599,0,1;4129686,1,14399,0,1;4129690,1,16739,0,1;4129704,2,50397,0,3;4130680,0,30598,0,2;4130780,1,0,12239,0;4131341,0,3999,0,1;4131839,1,10661,0,1;4132277,1,5399,0,1;4132934,0,48414,12599,5;4134662,2,17997,14399,1;4135506,1,3599,0,1;4135574,2,18498,23398,2;4136600,1,22497,0,2;4138966,2,38313,7199,3;4139129,0,22796,0,1;4139565,2,17998,0,1;4140291,1,21286,0,2;4141915,0,131114,0,7;4142234,0,7199,0,1;4142784,0,89812,0,7;4143272,0,17399,0,1;4144413,2,15299,6299,1;4144415,2,15299,0,1;4144600,1,27536,36896,1;4144611,0,13139,0,1;4145084,2,0,25198,0;4145094,0,76259,12599,6;4145248,2,12599,0,1;4145473,2,0,3599,0;4145653,2,97198,0,1;4145744,0,7599,0,1;4146164,0,29035,0,4;4147181,0,50209,0,5;4147772,2,304868,13499,3;4148249,0,13229,0,1;4148264,0,4499,0,1;4148504,0,4719,0,1;4149149,0,12599,0,1;4149160,0,8099,0,1;4149620,1,13098,35998,2;4150144,1,11339,0,1;4150725,0,7305,0,1;4150781,2,18432,0,1;4151041,0,31907,8999,3;4151062,2,24599,0,1;4151248,2,12599,0,1;4151293,2,13076,0,2;4151449,2,11699,0,1;4151468,0,18994,0,1;4151612,1,29355,0,3;4151676,2,17999,0,1;4151892,1,17999,0,1;4152004,1,11199,0,1;4152226,1,36177,0,1;4152664,2,33397,0,2;4152917,0,14759,0,1;4152924,0,27538,0,2;4153199,2,27895,0,2;4153522,2,8599,0,1;4153618,2,17654,0,2;4153874,1,0,15999,0;4153911,1,107927,0,11;4154241,1,17539,0,2;4154264,2,6839,0,1;4155199,2,10797,0,1;4155330,0,10799,0,1;4155600,2,8999,0,1;4156309,0,13216,0,1;4156445,2,65872,0,4;713210,1,34377,0,2;726400,0,65494,0,4;903078,2,75655,0,4";
 regionalRaw163.split(';').forEach(function(line){const p=line.split(',');const group=groups[Number(p[1])];if(!group)return;const rec={mat:p[0],group:group,approved:Number(p[2])/100,bopis:Number(p[3])/100,orders:Number(p[4])};if(!regionalSnapshot163.has(rec.mat))regionalSnapshot163.set(rec.mat,rec);});
 let current='P+PP';
 const money=n=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(n)||0);
 const prize=p=>p<4?'Samsung A07 4G 128GB':p<6?'JBL Tune 720BT':p===6?'JBL Wave Beam 2':p===7?'JBL Wave Buds 2':p<10?'JBL Go 4':'JBL T520 BT';
 const limit=k=>ranks[k][14].approved;
 const days=()=>{const d=new Date();return Math.max(0,Math.ceil((Date.UTC(2026,9,31)-Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()))/86400000));};
 const mat=()=>{try{return String(U.u.id||'');}catch(_){return '';}};
 const esc=s=>String(s||'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 function lookup163(m){for(const g of groups){const p=ranks[g].find(r=>r.mat===m);if(p)return {...p,group:g,orders:p.ticket>0?Math.max(1,Math.round(p.approved/p.ticket)):0};}return regionalSnapshot163.get(m)||null;}
 function defaultGroup(){const r=lookup163(mat());return r?r.group:'P+PP';}
 function row(r){
   return '<div class="cpRow158"><div class="cpNumber158">'+r.pos+'º</div><div class="cpPerson158"><b>Matrícula '+esc(r.mat)+'</b><small>Loja '+esc(r.store)+(r.store==='108'?' · CE+PI':'')+'</small>'+
      (r.bopis?'<span class="cpBopis158" title="Valor BOPIS excluído do resultado">BOPIS: '+money(r.bopis)+'</span>':'')+'</div>'+
      '<div class="cpValue158"><b>'+money(r.approved)+'</b><small>'+esc(prize(r.pos))+'</small></div></div>';
 }
 function partial(){
   return '<div class="cpHero158"><small>CAMPANHA NACIONAL · 01 A 31/10/2026</small><h2>🔊 eStore no <em>Volume Máximo</em></h2><p>Uma parcial para aumentar o som das vendas. 15 premiáveis por porte · 45 posições nacionais.</p><span>PERÍODO DA PARCIAL: 01/10 A 14/10/2026</span></div>'+
   '<div class="cpPorte158">'+groups.map(k=>'<button class="'+(k===current?'selected':'')+'" onclick="campaignPorte158(\''+k+'\')">'+esc(k)+'</button>').join('')+'</div>'+
   '<div class="cpKpis158"><div><small>Corte atual • Top 15</small><b>'+money(limit(current))+'</b></div><div><small>Premiados provisórios</small><b>15</b></div><div><small>Dias restantes</small><b>'+days()+'</b></div></div>'+
   '<div class="cpHead158"><div><h3>🏆 TOP 15 · '+esc(current)+'</h3><p>Ranking nacional por venda aprovada sem BOPIS</p></div><button onclick="shareCampaignCard158(\''+current+'\')">↗ Compartilhar Top 15 deste porte</button></div>'+
   '<div class="cpGrid158">'+ranks[current].map(row).join('')+'</div>'+
   '<p class="cpNote158"><b>BOPIS (em vermelho):</b> valor não contabilizado, pois se trata de venda de produtos que já estavam no estoque da loja. Os prêmios indicados são provisórios e as posições podem mudar até 31/10.</p>'+
   '<div class="cpSimulator158"><h3>🎯 Descubra seu desafio para subir no ranking</h3><p>Informe apenas sua matrícula. A parcial busca automaticamente suas vendas aprovadas, exclui BOPIS e calcula seu ticket médio válido.</p>'+
   '<label>Matrícula <input id="cpMat158" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="9" autocomplete="off" value="'+esc(mat())+'" placeholder="Digite sua matrícula"></label>'+
   '<button onclick="calculateCampaign158()">Consultar meu desafio</button><div id="cpAnswer158" role="status" aria-live="polite"></div></div>'+
   '<p class="cpMeta158">Parcial até 14/10/2026. Os nomes não constam no relatório recebido; por isso a identificação é por matrícula. Elegibilidade por cargo sujeita à validação final do regulamento.</p>';
 }
 function amount(s){s=String(s||'').trim().replace(/[R$\s]/g,'');return s?Number(s.includes(',')?s.replace(/\./g,'').replace(',','.'):s):NaN;}
 window.campaignPorte158=function(k){if(!ranks[k])return;current=k;let el=document.getElementById('cpPartial158');if(el)el.innerHTML=partial();};
 window.calculateCampaign158=function(){
   const field=document.getElementById('cpMat158');
   const out=document.getElementById('cpAnswer158');
   if(!field||!out)return;
   const m=String(field.value||'').replace(/[^0-9]/g,'').trim();
   if(!/^\\d{6,9}$/.test(m)){out.textContent='Informe uma matrícula válida para consultar a parcial.';return;}
   const rec=lookup163(m);
   if(!rec){out.innerHTML='<b>Matrícula não localizada na parcial disponível.</b><br>O arquivo recebido contém o Top 45 nacional e a base completa da CE+PI até 14/10. É necessário atualizar o relatório nacional para consultar esta matrícula; não vamos estimar valores sem dados.';return;}
   if(rec.group!==current){current=rec.group;const area=document.getElementById('cpPartial158');if(area)area.innerHTML=partial();}
   const updated=document.getElementById('cpMat158'),answer=document.getElementById('cpAnswer158');
   if(updated)updated.value=m;
   if(!answer)return;
   const matched=ranks[rec.group].find(x=>x.mat===m);
   const currentPosition=matched?matched.pos:null;
   const target=currentPosition>1?ranks[rec.group][currentPosition-2]:ranks[rec.group][14];
   const approved=Math.round(rec.approved*100);
   const threshold=Math.round(target.approved*100);
   const diff=currentPosition===1?0:Math.max(0,(threshold+1-approved)/100);
   const ticket=rec.orders>0?Math.round(approved/rec.orders)/100:0;
   const orders=ticket>0?Math.ceil((diff-0.000001)/ticket):null;
   const remaining=days();
   let html='<div class="cpResult163"><b>Matrícula '+esc(m)+' · Porte '+esc(rec.group)+'</b>'+
     '<p>Venda aprovada válida: <strong>'+money(rec.approved)+'</strong> · Pedidos válidos: '+(rec.orders||0)+
     '<br>Ticket médio individual: '+(ticket>0?money(ticket):'sem pedidos válidos')+
     '<br>'+ (rec.bopis>0?'<span class="cpBopis158">BOPIS excluído: '+money(rec.bopis)+'</span><br>':'')+
     '<small>O BOPIS não integra o valor total utilizado no ranking.</small></p>';
   if(currentPosition===1)html+='<b>🥇 1º lugar parcial!</b> Mantenha o ritmo: a classificação é provisória até 31/10.';
   else{
     const action=currentPosition?'ultrapassar o '+(currentPosition-1)+'º colocado':'entrar no Top 15';
     html+='<p>'+(currentPosition?'<b>Posição atual: '+currentPosition+'º • Prêmio provisório: '+esc(prize(currentPosition))+'</b><br>':'<b>Fora do Top 15 na parcial.</b><br>')+
       'Para '+action+': <strong>'+money(diff)+'</strong> adicionais em vendas aprovadas válidas.'+
       (orders!==null?'<br>Estimativa pelo seu ticket: <strong>'+orders+' pedido(s)</strong>.': '<br><b>Quantidade de pedidos:</b> indisponível, pois não há ticket médio individual válido.')+
       '<br>Até 31/10: <strong>'+remaining+' dia(s)</strong> restantes.'+
       (orders!==null&&remaining>0?'<br>Ritmo estimado: <strong>'+(orders/remaining).toLocaleString('pt-BR',{maximumFractionDigits:2,minimumFractionDigits:2})+' pedido(s)/dia</strong>.':'')+'</p>';
   }
   answer.innerHTML=html+'<small>Simulação com a base de 01 a 14/10/2026. O corte e a posição podem mudar até o encerramento da campanha.</small></div>';
 };
 window.openCampaignPartial158=function(){
   current=defaultGroup();
   try{if(document.getElementById('campaignPopupV37')&&typeof closeCampaignPopupV37==='function')closeCampaignPopupV37(false);}catch(_){}
   if(typeof CC_TAB_V38!=='undefined')CC_TAB_V38='partial158';
   if(typeof go==='function')go('campaigns');
   window.scrollTo(0,0);
 };
 function rr(c,x,y,w,h,r,fill){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();}
 function fit(c,s,max){while(s.length&&c.measureText(s).width>max)s=s.slice(0,-1);return s;}
 async function canvasFor(k){
   const can=document.createElement('canvas');can.width=1920;can.height=1080;
   const c=can.getContext('2d');c.fillStyle='#173F35';c.fillRect(0,0,1920,1080);
   c.fillStyle='#DE7C00';c.fillRect(0,0,460,9);
   const image=new Image();image.src='./assets/riachuelo-logo-horizontal-oficial-white-v133.svg';
   try{await image.decode();c.drawImage(image,48,39,310,48);}catch(_){c.fillStyle='white';c.font='800 36px Arial';c.fillText('RIACHUELO',48,76);}
   c.fillStyle='#E7C178';c.font='700 18px Arial';c.fillText('CAMPANHA NACIONAL • 01 A 31 DE OUTUBRO',49,132);
   c.fillStyle='white';c.font='800 56px Arial';c.fillText('eStore no',48,192);
   c.fillStyle='#EFB657';c.fillText('Volume Máximo',335,192);
   c.textAlign='right';c.fillStyle='white';c.font='700 28px Arial';c.fillText('TOP 15 • PORTE '+k,1870,71);
   c.font='500 20px Arial';c.fillText('PARCIAL ATÉ 14/10/2026 • NACIONAL',1870,107);
   c.textAlign='left';
   ranks[k].forEach(function(r,i){
     const col=Math.floor(i/5),rw=i%5,x=35+col*630,y=216+rw*141;
     rr(c,x,y,606,130,16,i===0?'#FFF0D2':'#F7F5F0');
     rr(c,x+13,y+15,70,98,12,r.pos===1?'#E8B653':r.pos===2?'#DADFDA':r.pos===3?'#EED5C4':'#E1EBE6');
     c.fillStyle='#173F35';c.font='800 28px Arial';c.textAlign='center';c.fillText(r.pos+'º',x+48,y+72);c.textAlign='left';
     c.font='800 18px Arial';c.fillText('MATRÍCULA '+r.mat,x+100,y+35);
     c.font='600 15px Arial';c.fillStyle='#466964';c.fillText('LOJA '+r.store+(r.store==='108'?' • CE+PI':''),x+100,y+60);
     c.font='800 24px Arial';c.fillStyle='#173F35';c.fillText(money(r.approved),x+100,y+94);
     c.fillStyle='#466964';c.font='700 15px Arial';c.fillText(fit(c,prize(r.pos),235),x+358,y+96);
     if(r.bopis){rr(c,x+343,y+13,247,33,10,'#FCE2E4');c.fillStyle='#B4232B';c.font='800 16px Arial';c.fillText('● BOPIS '+money(r.bopis),x+354,y+37);}
   });
   rr(c,35,943,1850,104,17,'#0A2E28');
   c.fillStyle='#FFCD75';c.font='800 28px Arial';c.fillText('CORTE TOP 15: '+money(limit(k)),60,989);
   c.fillStyle='white';c.font='600 18px Arial';c.fillText('BOPIS em vermelho: produto disponível no estoque da loja — valor não contabilizado.',60,1023);
   c.textAlign='right';c.font='600 18px Arial';c.fillText('PRÊMIOS PROVISÓRIOS • MODA QUE INSPIRA O BRASIL',1850,1008);
   return can;
 }
 window.shareCampaignCard158=async function(k){
   try{
     k=ranks[k]?k:current;
     const canvas=await canvasFor(k);
     const blob=await new Promise(done=>canvas.toBlob(done,'image/png'));
     if(!blob)throw Error('Falha na imagem');
     const file=new File([blob],'ranking-top15-'+k.replace(/\W/g,'-')+'-14-10.png',{type:'image/png'});
     if(navigator.canShare&&navigator.canShare({files:[file]})){
       try{await navigator.share({files:[file],title:'Parcial eStore no Volume Máximo',text:'Top 15 nacional • '+k+' • até 14/10/2026'});return;}catch(e){if(e.name==='AbortError')return;}
     }
     const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
   }catch(e){alert('Não foi possível gerar o card: '+String(e.message||e));}
 };
 function style(){
   if(document.getElementById('cpStyle158'))return;
   const st=document.createElement('style');st.id='cpStyle158';
   st.textContent=
    '@keyframes cpBlink158{0%,100%{box-shadow:0 0 0 0 #de7c0070;border-color:#de7c00}50%{box-shadow:0 0 0 8px #de7c0000;border-color:#e68699}}'+
    '.cpTab158,.cpHeroCall158,.cpPopupCTA158{animation:cpBlink158 2.5s ease-in-out infinite;border:2px solid #de7c00!important}'+
    '.cpTab158{background:#fff2d8!important;color:#173f35!important;border-radius:13px!important;font-weight:900!important}.cpTab158.on{background:#e9d4a2!important}'+
    '.cpHeroCall158{background:linear-gradient(110deg,#173f35,#2b6856);color:#fff;border-radius:19px;margin:15px 0;padding:18px;display:flex;justify-content:space-between;align-items:center;gap:16px}'+
    '.cpHeroCall158 b{color:#ffe0a3}.cpHeroCall158 p{color:#fff;margin:5px 0;font-size:13px}.cpHeroCall158 button,.cpHead158 button,.cpSimulator158 button{border:0;border-radius:10px;padding:12px;background:#de7c00;color:#fff;font-weight:850;cursor:pointer}'+
    '.cpPage158{max-width:1100px;margin:0 auto}.cpHero158{background:linear-gradient(120deg,#123d34,#276759);border-radius:20px;padding:23px;color:#fff}'+
    '.cpHero158 small{color:#f6cb73;font-size:10px;letter-spacing:.11em}.cpHero158 h2{color:white;font-size:27px;line-height:1.2;margin:10px 0}.cpHero158 em{font-style:normal;color:#f3c56d}.cpHero158 p{color:#fff;opacity:.9;font-size:13px}.cpHero158 span{display:inline-block;background:#f4ddb1;color:#173f35;border-radius:25px;font-size:11px;font-weight:900;padding:6px 12px}'+
    '.cpPorte158{display:flex;gap:9px;margin:15px 0}.cpPorte158 button{flex:1;min-width:0;border:1px solid #d6d2c4;border-radius:13px;background:white;padding:13px 5px;font-weight:850;color:#173f35;cursor:pointer}.cpPorte158 button.selected{color:#fff;background:#173f35;border-color:#de7c00}'+
    '.cpKpis158{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:14px 0}.cpKpis158 div{background:#f4f2ed;border-radius:13px;padding:13px;display:grid;gap:5px}.cpKpis158 small{color:#66776e;font-size:10px}.cpKpis158 b{font-size:clamp(14px,2.3vw,22px);color:#173f35}'+
    '.cpHead158{display:flex;align-items:center;justify-content:space-between;gap:15px;margin:18px 0}.cpHead158 h3{color:#173f35;margin:0}.cpHead158 p{font-size:11px;color:#65756b;margin:4px 0}'+
    '.cpGrid158{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.cpRow158{display:flex;gap:10px;align-items:center;background:white;border:1px solid #e4e7df;border-radius:14px;padding:10px;min-width:0}.cpNumber158{flex:0 0 43px;height:48px;border-radius:12px;display:grid;place-items:center;background:#e2eae3;font-size:19px;font-weight:900;color:#173f35}.cpRow158:first-child .cpNumber158{background:#ffe1a3}.cpRow158:nth-child(2) .cpNumber158{background:#dedfdd}.cpRow158:nth-child(3) .cpNumber158{background:#efd0be}'+
    '.cpPerson158,.cpValue158{display:flex;flex-direction:column;gap:4px;min-width:0}.cpPerson158{flex:1}.cpPerson158 b,.cpValue158 b{font-size:12px;color:#173f35}.cpPerson158 small,.cpValue158 small{font-size:10px;color:#52685c}.cpValue158{text-align:right}.cpBopis158{color:#ac2430;background:#ffebec;font-size:10px;font-weight:900;border-radius:7px;padding:3px 5px;align-self:flex-start}'+
    '.cpNote158,.cpMeta158{font-size:12px;line-height:1.5;color:#6b3529;background:#fff0ea;border-radius:13px;padding:12px;margin:12px 0}.cpMeta158{background:#eff2ed;color:#557064}'+
    '.cpSimulator158{border:1px solid #d6d2c4;background:#faf8f3;padding:17px;border-radius:18px;color:#173f35;margin:18px 0}.cpSimulator158 h3{margin:0}.cpSimulator158 p{font-size:12px}.cpSimulator158 label{display:block;font-size:12px;font-weight:750;margin:10px 0}.cpSimulator158 input{width:100%;box-sizing:border-box;display:block;border:1px solid #d6d2c4;border-radius:10px;padding:11px;background:#fff;margin-top:5px}.cpSimulator158 #cpAnswer158{line-height:1.7;font-size:13px;margin-top:13px}'+
    '.cpPopupCTA158{display:block;cursor:pointer;width:calc(100% - 24px);margin:9px 12px 14px;padding:13px;text-align:left;border-radius:13px;background:#fff0d4;color:#173f35}.cpPopupCTA158 b{display:block;font-size:15px;line-height:1.3}.cpPopupCTA158 span{display:block;font-size:12px;line-height:1.4;margin-top:5px}'+
    '.campaignModalV86:has(.cpPopupCTA158){overflow:auto!important}.campaignModalV86:has(.cpPopupCTA158) .campaignBannerV86 img{max-height:54vh!important}'+
    '@media(max-width:670px){.cpHeroCall158,.cpHead158{display:block}.cpHeroCall158 button,.cpHead158 button{width:100%;margin-top:9px}.cpGrid158{grid-template-columns:1fr}.cpKpis158{gap:5px}.cpKpis158 div{padding:9px 6px}.cpKpis158 small{font-size:9px}.cpRow158{padding:9px 6px}.cpValue158 b{font-size:12px}}'+
    '@media(prefers-reduced-motion:reduce){.cpTab158,.cpHeroCall158,.cpPopupCTA158{animation:none!important}}';
   document.head.appendChild(st);
 }
 function popup(){
   const modal=document.querySelector('#campaignPopupV37 .campaignModalV86,#campaignPopupV37 .campaignModalV82,#campaignPopupV37 .campaignModalV38');
   if(!modal||modal.querySelector('.cpPopupCTA158,.campaignPopupPartialV160'))return;
   const b=document.createElement('button');b.type='button';b.className='cpPopupCTA158';
   b.innerHTML='<b>🔊 Você está aumentando o volume ou deixando seu nome fora do Top 15?</b><span>🏆 Veja a parcial da campanha! Confira os 45 elegíveis e os prêmios provisórios por porte →</span>';
   b.addEventListener('click',window.openCampaignPartial158);const banner=modal.querySelector('.campaignBannerV86,.campaignBannerButtonV82,.campaignPopupArtV38');if(banner)modal.insertBefore(b,banner);else modal.appendChild(b);
 }
 let installed158=false;
 function inject(){
   if(installed158)return true;
   if(typeof ccTabsV38!=='function'||typeof campaignsV3!=='function')return false;
   installed158=true;
   const tabs=ccTabsV38;ccTabsV38=function(){
     const base=tabs();
     const action='<button type="button" class="cpTab158 '+(CC_TAB_V38==='partial158'?'on':'')+'" onclick="openCampaignPartial158()">🏆 <span>Parcial Top 15</span></button>';
     return base.replace(/<\/div>\s*$/,action+'</div>');
   };
   if(typeof campaignOverviewV38==='function'){
     const overview=campaignOverviewV38;
     campaignOverviewV38=function(){
       const body=overview();
     if(body.includes('campaignNativeCalloutV162'))return body;
     return '<section class="cpHeroCall158"><div><b>🏆 PARCIAL DA CAMPANHA • DESTAQUE</b><p>🔊 Você está aumentando o volume ou deixando seu nome fora dos 15 premiáveis? Confira quem está no Top 15 de cada porte!</p></div><button onclick="openCampaignPartial158()">Ver parcial →</button></section>'+body;
     };
   }
   const previous=campaignsV3;
   campaignsV3=function(){
     if(CC_TAB_V38==='partial158')return '<div class="ccPageV38 cpPage158"><div class="pageTitleV3"><span>Campanhas · Parcial</span></div>'+ccTabsV38()+'<div id="cpPartial158">'+partial()+'</div></div>';
     return previous();
   };
   return true;
 }
 window.renderCampaignPartialStandalone158 = function(){
   current='P+PP';
   return partial();
 };
 function ensureReady158(){
   inject();
   popup();
 }
 style();ensureReady158();
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureReady158,{once:true});
 // Aguarda a interface legada concluir scripts com defer e carregamento assíncrono.
 let attempts158=0;
 const retry158=setInterval(function(){
   if(inject()||++attempts158>=50)clearInterval(retry158);
   popup();
 },250);
 const observer=new MutationObserver(function(){popup();if(!installed158)inject();});
 observer.observe(document.documentElement,{childList:true,subtree:true});
})();