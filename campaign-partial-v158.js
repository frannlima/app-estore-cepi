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
 let current='P+PP';
 const money=n=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(n)||0);
 const prize=p=>p<4?'Samsung A07 4G 128GB':p<6?'JBL Tune 720BT':p===6?'JBL Wave Beam 2':p===7?'JBL Wave Buds 2':p<10?'JBL Go 4':'JBL T520 BT';
 const limit=k=>ranks[k][14].approved;
 const days=()=>{const d=new Date();return Math.max(0,Math.ceil((Date.UTC(2026,9,31)-Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()))/86400000));};
 const mat=()=>{try{return String(U.u.id||'');}catch(_){return '';}};
 const esc=s=>String(s||'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 function defaultGroup(){let m=mat();for(let k of groups)if(ranks[k].some(r=>r.mat===m))return k;return 'P+PP';}
 function row(r){
   return '<div class="cpRow158"><div class="cpNumber158">'+r.pos+'º</div><div class="cpPerson158"><b>Matrícula '+esc(r.mat)+'</b><small>Loja '+esc(r.store)+(r.store==='108'?' · CE+PI':'')+'</small>'+
      (r.bopis?'<span class="cpBopis158" title="Valor BOPIS excluído do resultado">BOPIS: '+money(r.bopis)+'</span>':'')+'</div>'+
      '<div class="cpValue158"><b>'+money(r.approved)+'</b><small>'+esc(prize(r.pos))+'</small></div></div>';
 }
 function partial(){
   return '<div class="cpHero158"><small>CAMPANHA NACIONAL · 01 A 31/10/2026</small><h2>🔊 eStore no <em>Volume Máximo</em></h2><p>Uma parcial para aumentar o som das vendas. 15 premiáveis por porte · 45 posições nacionais.</p><span>BASE ATÉ 14/10/2026</span></div>'+
   '<div class="cpPorte158">'+groups.map(k=>'<button class="'+(k===current?'selected':'')+'" onclick="campaignPorte158(\''+k+'\')">'+esc(k)+'</button>').join('')+'</div>'+
   '<div class="cpKpis158"><div><small>Corte atual • Top 15</small><b>'+money(limit(current))+'</b></div><div><small>Premiados provisórios</small><b>15</b></div><div><small>Dias restantes</small><b>'+days()+'</b></div></div>'+
   '<div class="cpHead158"><div><h3>🏆 TOP 15 · '+esc(current)+'</h3><p>Ranking nacional por venda aprovada sem BOPIS</p></div><button onclick="shareCampaignCard158(\''+current+'\')">↗ Compartilhar card horizontal</button></div>'+
   '<div class="cpGrid158">'+ranks[current].map(row).join('')+'</div>'+
   '<p class="cpNote158"><b>BOPIS (em vermelho):</b> valor não contabilizado, pois se trata de venda de produtos que já estavam no estoque da loja. Os prêmios indicados são provisórios e as posições podem mudar até 31/10.</p>'+
   '<div class="cpSimulator158"><h3>🎯 Qual seu desafio para entrar no Top 15?</h3><p>Digite sua matrícula. Se estiver fora do Top 15, informe a venda aprovada válida e o ticket médio para fazer a simulação.</p>'+
   '<label>Matrícula <input id="cpMat158" inputmode="numeric" value="'+esc(mat())+'"></label>'+
   '<label>Venda aprovada sem BOPIS (R$) <input id="cpApproved158" inputmode="decimal" placeholder="Opcional para quem já está no Top 15"></label>'+
   '<label>Ticket médio válido (R$) <input id="cpTicket158" inputmode="decimal" placeholder="Opcional para quem já está no Top 15"></label>'+
   '<button onclick="calculateCampaign158()">Simular pedidos necessários</button><div id="cpAnswer158" role="status"></div></div>'+
   '<p class="cpMeta158">Parcial até 14/10/2026. Os nomes não constam no relatório recebido; por isso a identificação é por matrícula. Elegibilidade por cargo sujeita à validação final do regulamento.</p>';
 }
 function amount(s){s=String(s||'').trim().replace(/[R$\s]/g,'');return s?Number(s.includes(',')?s.replace(/\./g,'').replace(',','.'):s):NaN;}
 window.campaignPorte158=function(k){if(!ranks[k])return;current=k;let el=document.getElementById('cpPartial158');if(el)el.innerHTML=partial();};
 window.calculateCampaign158=function(){
   const out=document.getElementById('cpAnswer158');if(!out)return;
   const m=String(document.getElementById('cpMat158').value||'').trim();
   const r=ranks[current].find(x=>x.mat===m);
   const a=amount(document.getElementById('cpApproved158').value);
   const t=amount(document.getElementById('cpTicket158').value);
   const approved=Number.isFinite(a)?a:(r?r.approved:NaN);
   const ticket=Number.isFinite(t)?t:(r?r.ticket:NaN);
   if(!(approved>=0&&ticket>0)){out.textContent='Para calcular, informe sua venda válida e ticket médio (sem BOPIS).';return;}
   const diff=Math.max(0,Math.ceil((limit(current)-approved+.01)*100)/100);
   const orders=Math.ceil(diff/ticket), remaining=days();
   out.innerHTML=diff===0?'<b>Você já alcançou o corte atual.</b> Continue vendendo: a classificação pode mudar.':
   '<b>Faltam '+money(diff)+' para superar o atual 15º.</b><br>Estimativa: <b>'+orders+' pedido(s)</b> com ticket médio de '+money(ticket)+
   '<br>Ritmo estimado: <b>'+(remaining?(orders/remaining).toFixed(2).replace('.',',')+' pedido(s) por dia':'campanha encerrada')+'</b> até 31/10.'+
   '<br><small>Simulação com corte atual; não garante premiação.</small>';
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
 function inject(){
   if(typeof ccTabsV38!=='function'||typeof campaignsV3!=='function')return;
   const tabs=ccTabsV38;ccTabsV38=function(){
     const base=tabs();
     const action='<button type="button" class="cpTab158 '+(CC_TAB_V38==='partial158'?'on':'')+'" onclick="openCampaignPartial158()">🏆 <span>Parcial Top 15</span></button>';
     return base.replace(/<\/div>\s*$/,action+'</div>');
   };
   if(typeof campaignOverviewV38==='function'){
     const overview=campaignOverviewV38;
     campaignOverviewV38=function(){
       return '<section class="cpHeroCall158"><div><b>🏆 PARCIAL DA CAMPANHA • DESTAQUE</b><p>🔊 Você está aumentando o volume ou deixando seu nome fora dos 15 premiáveis? Confira quem está no Top 15 de cada porte!</p></div><button onclick="openCampaignPartial158()">Ver parcial →</button></section>'+overview();
     };
   }
   const previous=campaignsV3;
   campaignsV3=function(){
     if(CC_TAB_V38==='partial158')return '<div class="ccPageV38 cpPage158"><div class="pageTitleV3"><span>Campanhas · Parcial</span></div>'+ccTabsV38()+'<div id="cpPartial158">'+partial()+'</div></div>';
     return previous();
   };
 }
 style();inject();popup();
 const observer=new MutationObserver(function(){popup();});
 observer.observe(document.documentElement,{childList:true,subtree:true});
})();