(function(){
'use strict';
if(window.__cepiCena)return;window.__cepiCena=true;
const items=[['10h','Resultado oficial D-1','Rotina atual'],['11h','Conteúdo estratégico','Campanhas, pool ou dispersão'],['14h','Abertura','O movimento é nosso'],['16h','Radar CEPI','Participação das filiais'],['18h','Virada de jogo','Reação comprovada'],['20h','Eu vi esse movimento','Reconhecimento das lideranças'],['21h','Encerramento','Opcional']];
const base=[
'Bom dia, equipe! Segue nosso resultado oficial D-1 e o comparativo CEPI x empresa. Vamos direcionar nossas oportunidades!',
'Time, compartilho um ponto importante para mantermos no radar hoje. Vamos transformar essa leitura em ação nas operações.',
'Boa tarde, time! 👋\nComo está o movimento nas operações? Cada parcial informada fortalece nossa leitura da CEPI.\nConto com vocês! 🚀',
'Time, como estamos de movimento nesta tarde? 👀\nCada filial conectada contribui para um consolidado mais completo. Vamos seguir juntos!',
'Time, ainda temos oportunidade de reação nesta tarde. Acompanhar, ajustar e agir faz diferença. 🚀',
'Quero reconhecer as pessoas que fazem o acompanhamento acontecer. Supervisores e gerentes, a presença da liderança faz diferença! 👏',
'Equipe, obrigado pela participação de hoje! Seguimos acompanhando as operações até o fechamento.\nTalento é conquista!'];
let current=2,tab=0,edits={};
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Fortaleza'}).format(new Date());
const storage=()=> 'cepi-em-cena:'+today();
const completed=()=>{try{return JSON.parse(localStorage.getItem(storage())||'{}')}catch(e){return {}}};
const escape=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text=()=>edits[current]===undefined?base[current]:edits[current];
const authorized=()=>{try{return typeof isAdmin==='function'&&isAdmin()&&!(typeof isDemo==='function'&&isDemo())}catch(e){return false}};
function open(){if(!authorized())return;document.getElementById('cepiScene').style.display='flex';render()}
function close(){document.getElementById('cepiScene').style.display='none'}
function render(){
const el=document.getElementById('cepiScene'),done=completed(),r=items[current];
el.querySelector('.cepiBody').innerHTML='<header><div><small>eSTORE CONNECT · ADMIN</small><h2>CEPI em Cena</h2><p>Agenda de comunicação e mobilização</p></div><button id="cepiClose">×</button></header><div class="cepiHero"><b>O movimento é nosso.</b><small>'+Object.keys(done).length+' marcos sinalizados hoje · Sem envio automático</small></div><nav>'+['Agenda','Preparar','Histórico'].map((v,i)=>'<button data-tab="'+i+'" class="'+(tab===i?'sel':'')+'">'+v+'</button>').join('')+'</nav>'+
(tab===0?'<section>'+items.map((x,i)=>'<button class="cepiRow" data-row="'+i+'"><strong>'+x[0]+'</strong><span><b>'+escape(x[1])+'</b><small>'+escape(x[2])+'</small></span><i>'+(done[i]?'✓':'›')+'</i></button>').join('')+'</section>':
tab===1?'<section><label>Horário<select id="cepiSelect">'+items.map((x,i)=>'<option value="'+i+'" '+(i===current?'selected':'')+'>'+x[0]+' · '+escape(x[1])+'</option>').join('')+'</select></label><div class="cepiCard"><small>CEPI EM CENA · '+r[0]+'</small><h3>'+escape(r[1])+'</h3><p>'+escape(r[2])+'</p><b>O MOVIMENTO É NOSSO.</b></div><label>Legenda editável<textarea id="cepiText" rows="7">'+escape(text())+'</textarea></label><div class="cepiActions"><button id="cepiSend">Compartilhar card + texto</button><button id="cepiCopy">Copiar legenda</button><button id="cepiMark">Marcar preparado</button></div><small>O WhatsApp solicita a seleção do grupo e a confirmação de envio. O histórico não comprova entrega.</small></section>':
'<section><h3>Preparações de hoje</h3>'+items.filter((x,i)=>done[i]).map(x=>'<p>✓ '+escape(x[0])+' · '+escape(x[1])+'</p>').join('')+'<small>Somente marcações manuais; envio não confirmado.</small></section>')+
'<footer><button id="cepiHourly">Abrir Hora a Hora atual</button><small>Consolidado e alertas permanecem inalterados.</small></footer>';
el.querySelector('#cepiClose').onclick=close;
el.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=Number(b.dataset.tab);render()});
el.querySelectorAll('[data-row]').forEach(b=>b.onclick=()=>{current=Number(b.dataset.row);tab=1;render()});
const sel=el.querySelector('#cepiSelect');if(sel)sel.onchange=()=>{current=Number(sel.value);render()};
const tx=el.querySelector('#cepiText');if(tx)tx.oninput=()=>edits[current]=tx.value;
const cp=el.querySelector('#cepiCopy');if(cp)cp.onclick=()=>navigator.clipboard.writeText(text()).then(()=>alert('Legenda copiada.'),()=>alert('Selecione o texto para copiar.'));
const mr=el.querySelector('#cepiMark');if(mr)mr.onclick=()=>{const d=completed();d[current]=true;localStorage.setItem(storage(),JSON.stringify(d));render()};
const sn=el.querySelector('#cepiSend');if(sn)sn.onclick=share;
el.querySelector('#cepiHourly').onclick=()=>{close();if(typeof go==='function')go('hourly')};
}
async function share(){
const cv=document.createElement('canvas');cv.width=1200;cv.height=675;
const c=cv.getContext('2d');c.fillStyle='#173F35';c.fillRect(0,0,1200,675);c.fillStyle='#E6CA89';c.fillRect(65,115,1070,5);
c.font='bold 32px Arial';c.fillStyle='#FFFFFF';c.fillText('eSTORE CONNECT  |  CE+PI',65,80);
c.fillStyle='#E6CA89';c.font='bold 36px Arial';c.fillText('CEPI EM CENA  ·  '+items[current][0],65,200);
c.fillStyle='#FFFFFF';c.font='bold 60px Arial';const words=items[current][1].split(' ');let line='',y=300;for(const w of words){const next=(line+' '+w).trim();if(c.measureText(next).width>1050){c.fillText(line,65,y);y+=78;line=w}else line=next}if(line)c.fillText(line,65,y);
c.fillStyle='#DDE8E2';c.font='28px Arial';c.fillText('Presença · Conexão · Liderança',65,530);
c.fillStyle='#E6CA89';c.font='bold 30px Arial';c.fillText('O MOVIMENTO É NOSSO.',65,610);
const blob=await new Promise(resolve=>cv.toBlob(resolve,'image/png'));if(!blob)return alert('Falha ao gerar card.');
const file=new File([blob],'CEPI_em_Cena_'+items[current][0]+'.png',{type:'image/png'});
try{if(navigator.share&&navigator.canShare?.({files:[file]})){await navigator.share({files:[file],text:text(),title:'CEPI em Cena'});return}}catch(e){if(e.name==='AbortError')return}
const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
try{await navigator.clipboard.writeText(text());alert('Card baixado e legenda copiada. Selecione o grupo no WhatsApp para concluir o envio.')}catch(e){alert('Card baixado. Copie a legenda separadamente para compartilhar.')}
}
const css=document.createElement('style');css.textContent='#cepiScene{display:none;position:fixed;inset:0;background:#071a17ad;z-index:99999;align-items:center;justify-content:center;padding:12px}.cepiBody{width:min(620px,100%);max-height:95vh;overflow:auto;padding:20px;border-radius:18px;background:#fcfcfa;color:#173F35;font:14px Arial}.cepiBody header{display:flex;justify-content:space-between}.cepiBody header h2{font-size:28px;margin:5px 0}.cepiBody header p{margin:0 0 14px;color:#65756b}.cepiBody button{cursor:pointer}.cepiBody #cepiClose{border:0;background:none;font-size:30px}.cepiHero,.cepiCard{background:#173F35;color:white;border-radius:12px;padding:20px;margin:12px 0}.cepiHero{display:grid;gap:8px}.cepiHero b{font-size:22px}.cepiHero small{color:#d3e1da}.cepiBody nav{display:flex;gap:5px;margin-bottom:12px}.cepiBody nav button{flex:1;padding:12px 4px;border:1px solid #cbdad1;border-radius:8px;background:white}.cepiBody nav button.sel{background:#173F35;color:white}.cepiRow{display:flex;gap:12px;width:100%;text-align:left;align-items:center;background:white;border:1px solid #dbe6df;border-radius:10px;padding:12px;margin-bottom:7px;color:#173F35}.cepiRow strong{padding:9px;background:#edf3ee;border-radius:7px}.cepiRow span{display:grid;flex:1;gap:4px}.cepiRow small{color:#68796f}.cepiRow i{font-size:24px}.cepiBody label{display:grid;gap:7px;font-weight:bold;margin:12px 0}.cepiBody select,.cepiBody textarea{width:100%;box-sizing:border-box;padding:11px;border:1px solid #cbdad1;border-radius:8px;background:white;font:14px Arial}.cepiCard small,.cepiCard b{color:#E6CA89}.cepiCard h3{font-size:25px;margin:25px 0 10px}.cepiActions{display:grid;gap:8px}.cepiActions button,.cepiBody footer button{padding:12px;border:0;border-radius:8px;background:#173F35;color:white;font-weight:bold}.cepiActions button:not(:first-child){background:#e7eee9;color:#173F35}.cepiBody section>small,.cepiBody footer small{display:block;font-size:12px;color:#697a71;line-height:1.5;margin-top:9px}.cepiBody footer{border-top:1px solid #dbe6df;margin-top:16px;padding-top:14px}';document.head.appendChild(css);
const div=document.createElement('div');div.id='cepiScene';div.innerHTML='<div class="cepiBody"></div>';document.body.appendChild(div);
function attach(){if(!authorized())return;const hub=document.getElementById('adminHubV205');if(!hub||document.getElementById('cepiCenaBtn'))return;const b=document.createElement('button');b.id='cepiCenaBtn';b.className='btn';b.textContent='🎬 CEPI em Cena · Agenda e WhatsApp';b.onclick=open;const grid=hub.querySelector('.adminGrid');(grid||hub).prepend(b)}
new MutationObserver(attach).observe(document.body,{childList:true,subtree:true});setTimeout(attach,300);
window.openCepiCena=open;
})();