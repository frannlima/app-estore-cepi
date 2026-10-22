/* Card regional Hora a Hora • v198 */
(function(){
'use strict';
if(window.__hourlyCardV198)return;
window.__hourlyCardV198=true;
const logoPath='./assets/ria-vertical-header-light-v195.svg';
const BLUE='#1A688C',GREEN='#173F35',ORANGE='#DE7C00',MUTED='#64776D',RED='#AF2939',PALE='#F8F7F3';
const money=v=>Number.isFinite(Number(v))?Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}):'—';
const percent=v=>Number.isFinite(Number(v))?(Number(v)*100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'%':'—';
const count=v=>Math.round(Number(v)||0).toLocaleString('pt-BR');
const dateBR=v=>/^\d{4}-\d\d-\d\d$/.test(v)?v.slice(8)+'/'+v.slice(5,7)+'/'+v.slice(0,4):'—';
const clock=()=>new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Fortaleza',hour:'2-digit',minute:'2-digit'}).format(new Date());
const rrect=(ctx,x,y,w,h,r,fill,stroke)=>{ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}};
const put=(ctx,str,x,y,size,color=GREEN,bold=true,align='left')=>{ctx.textBaseline='middle';ctx.textAlign=align;ctx.fillStyle=color;ctx.font=(bold?'800 ':'500 ')+size+'px Larsseit,Arial,sans-serif';ctx.fillText(String(str),x,y);ctx.textAlign='left'};
const fit=(ctx,val,x,y,width,size,color=GREEN,bold=true,align='left')=>{const t=String(val??'—');let z=size;while(z>11){ctx.font=(bold?'800 ':'500 ')+z+'px Larsseit,Arial,sans-serif';if(ctx.measureText(t).width<=width)break;z--}put(ctx,t,x,y,z,color,bold,align)};
const image=src=>new Promise(done=>{const im=new Image();im.onload=()=>done(im);im.onerror=()=>done(null);im.src=src;setTimeout(()=>done(null),4000)});
const status=(r,j)=>window.hourlyStatusV198?.(r,j)||{code:r.updated_at?'course':'missing',label:r.updated_at?'Em curso':'Sem input'};
async function createPoster(j){
 const data=[...(j.stores||[])].sort((a,b)=>Number(b.captured||0)-Number(a.captured||0));
 const n=data.length,total={meta:0,captured:0,orders:0,orderTarget:0,storeSales:0};
 for(const r of data){total.meta+=Number(r.metaValue||0);total.captured+=Number(r.captured||0);total.orders+=Number(r.orders||0);total.orderTarget+=Number(r.orderTarget||0);total.storeSales+=Number(r.storeSales||0)}
 const active=data.filter(r=>Number(r.captured||0)>0).length,counts={spinning:0,course:0,missing:0};
 data.forEach(r=>{const st=status(r,j);counts[st.code]=(counts[st.code]||0)+1});
 const colW=315,gap=22,x0=45,header=185,kpiY=215,kpiH=130,topY=530,
       tableStart=813,rowH=50,footerY=tableStart+47+n*rowH+22,footH=188;
 const c=document.createElement('canvas');c.width=1080;c.height=footerY+footH;
 const ctx=c.getContext('2d',{alpha:false});if(!ctx)throw Error('Canvas indisponível');
 ctx.fillStyle=PALE;ctx.fillRect(0,0,c.width,c.height);
 const grad=ctx.createLinearGradient(0,0,1080,0);grad.addColorStop(0,GREEN);grad.addColorStop(.75,'#275A4D');grad.addColorStop(1,'#173F35');ctx.fillStyle=grad;ctx.fillRect(0,0,1080,header);
 ctx.fillStyle=ORANGE;ctx.fillRect(0,header-7,1080,7);
 const log=await image(logoPath);
 if(log){const ratio=(log.naturalWidth||950)/(log.naturalHeight||1268),h=137,w=h*ratio;ctx.drawImage(log,51,23,w,h)}
 else{['RIA','CHU','ELO'].forEach((t,i)=>put(ctx,t,101,55+i*44,29,'#F9F8F2',true,'center'))}
 ctx.fillStyle='#FFFFFF55';ctx.fillRect(169,33,2,117);
 put(ctx,'eStore • CE+PI',195,71,48,'#FFFFFF',true);
 put(ctx,'PAINEL REGIONAL DE PERFORMANCE',195,116,24,'#E7F2EB',true);
 put(ctx,'Moda que inspira o Brasil',1023,33,17,'#E7F2EB',false,'right');
 rrect(ctx,743,115,280,45,23,'#336456','#88AB9C');
 put(ctx,dateBR(j.result_date)+'  •  '+clock(),883,138,19,'#FFFFFF',true,'center');
 const delta=total.captured-total.meta;
 const kpis=[
 ['🏷️','META eSTORE',money(total.meta)],
 ['💰','CAPTAÇÃO',money(total.captured)],
 ['🛍️','PEDIDOS',count(total.orders)+' / '+count(total.orderTarget)],
 ['🎯','ATINGIMENTO',percent(total.meta>0?total.captured/total.meta:null)],
 ['📊','SHARE REGIONAL',total.storeSales>0?percent(total.captured/total.storeSales):'—'],
 ['↕️','DESVIO PARA META',(delta>0?'+':'')+money(delta)]
 ];
 kpis.forEach(([icon,title,val],i)=>{
  const col=i%3,row=Math.floor(i/3),x=x0+col*(colW+gap),y=kpiY+row*(kpiH+15);
  rrect(ctx,x,y,colW,kpiH,19,row===0?'#FFFFFF':'#EDF4EE','#E3E6E0');
  const palette=[['#315F50','#EBF3E8'],['#DAD9D6','#FDF6ED'],['#F3E0DB','#FCEFEA']][col];
  rrect(ctx,x+15,y+15,47,45,12,palette[1]);
  put(ctx,icon,x+38,y+38,25,GREEN,true,'center');
  fit(ctx,title,x+72,y+37,colW-90,18,MUTED,true);
  fit(ctx,val,x+15,y+95,colW-30,34,title==='DESVIO PARA META'?(delta<0?RED:'#167748'):BLUE,true);
 });
 put(ctx,'🏆 TOP DO MOMENTO',x0,topY,25,GREEN,true);
 const sellers=data.filter(r=>Number(r.captured||0)>0).slice(0,3);
 for(let i=0;i<3;i++){
  const r=sellers[i],x=x0+i*(colW+gap),y=topY+28;
  rrect(ctx,x,y,colW,91,15,['#F4E3B9','#E9F0EA','#F0DFD5'][i]);
  rrect(ctx,x+13,y+17,48,48,24,['#D58B16','#557E6C','#A36C4A'][i]);
  put(ctx,(i+1)+'º',x+37,y+42,20,'#FFFFFF',true,'center');
  if(r){put(ctx,'L '+r.st,x+75,y+27,18,GREEN,true);fit(ctx,money(r.captured),x+75,y+64,colW-90,27,BLUE,true)}
  else put(ctx,'Aguardando venda',x+77,y+49,17,MUTED,false);
 }
 put(ctx,'PULSO DA REGIONAL',x0,topY+163,22,GREEN,true);
 const pulses=[
 ['🟢 Girando ponteiro',counts.spinning,'#E2F3E8'],
 ['🟠 Em curso',counts.course,'#FFF3E1'],
 ['🔴 Sem input',counts.missing,'#FBE5E4']
 ];
 pulses.forEach(([title,val,bg],i)=>{
  const x=x0+i*(colW+gap),y=topY+178;
  rrect(ctx,x,y,colW,64,12,bg);
  fit(ctx,title,x+12,y+26,colW-78,17,GREEN,true);
  put(ctx,String(val),x+colW-19,y+34,27,GREEN,true,'right');
 });
 put(ctx,'DESEMPENHO POR FILIAL',x0,tableStart-30,24,GREEN,true);
 rrect(ctx,45,tableStart,990,48,10,GREEN);
 const columns=[['FILIAL',57],['META',150],['CAPTADO',285],['PED.',418],['ATING.',514],['SHARE',613],['DESVIO',709],['STATUS',852]];
 for(const [title,x] of columns)put(ctx,title,x,tableStart+24,15,'#FFFFFF',true);
 data.forEach((r,i)=>{
  const y=tableStart+48+i*rowH,st=status(r,j);
  rrect(ctx,45,y,990,rowH-2,4,st.code==='missing'?'#FFEDEA':i%2===0?'#FFFFFF':'#F0F4F0');
  const delta=Number(r.captured||0)-Number(r.metaValue||0);
  put(ctx,'L'+r.st,57,y+24,16,GREEN,true);
  fit(ctx,money(r.metaValue),150,y+24,125,15,BLUE,true);
  fit(ctx,money(r.captured),285,y+24,128,15,BLUE,true);
  put(ctx,Number(r.orders||0)+'/'+Number(r.orderTarget||0),418,y+24,15,BLUE,true);
  fit(ctx,percent(r.att),514,y+24,88,15,BLUE,true);
  fit(ctx,percent(r.share),613,y+24,91,15,BLUE,true);
  fit(ctx,money(delta),709,y+24,136,15,delta<0?RED:'#167748',true);
  if(st.code==='missing'){
   fit(ctx,st.miss+' parciais sem input',852,y+16,165,13,RED,true);
   put(ctx,'de venda',852,y+34,12,RED,false);
  }else fit(ctx,st.label,852,y+24,175,15,st.code==='spinning'?'#177548':'#97621B',true);
 });
 const pending=data.filter(r=>status(r,j).code==='missing').map(r=>r.st);
 const fb=footerY;ctx.fillStyle='#FFEAD8';rrect(ctx,45,fb,990,80,14,'#FFF2E8');
 put(ctx,'⚠️ LOJAS SEM INPUT DE VENDAS • '+pending.length,66,fb+25,19,RED,true);
 fit(ctx,pending.map(x=>'L'+x).join('  •  ')||'Nenhuma filial pendente',66,fb+55,940,19,GREEN,true);
 put(ctx,'Meta: '+money(total.meta)+'   •   Captação: '+money(total.captured)+'   •   Lojas com venda: '+active+'/'+n,54,fb+111,18,GREEN,true);
 ctx.fillStyle=GREEN;ctx.fillRect(0,c.height-54,1080,54);
 put(ctx,'Moda que inspira o Brasil  •  App eStore CE+PI',55,c.height-26,18,'#FFFFFF',true);
 return c;
}
shareHourlyV5=async function(){
 const j=typeof HOURLY_CACHE!=='undefined'?HOURLY_CACHE:null;
 if(!j)return alert('Carregue a parcial antes de compartilhar.');
 try{
  const c=await createPoster(j),branded=window.RiachueloBrandCards?.decorateCanvas?.(c)||c;
  const blob=await new Promise(resolve=>branded.toBlob(resolve,'image/png',.97));
  if(!blob)throw Error('Não foi possível gerar a imagem');
  const caption=hourlyCaptionV6(j),file=new File([blob],'Painel_Hora_a_Hora_CEPI_'+j.result_date+'.png',{type:'image/png'});
  if(navigator.share&&navigator.canShare?.({files:[file]})){
   try{await navigator.share({title:'Hora a Hora eStore | CE+PI',files:[file],text:caption});return}catch(e){if(e?.name==='AbortError')return}
  }
  const object=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=object;anchor.download=file.name;document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(object),6000);
  try{await navigator.clipboard.writeText(caption);alert('Card salvo e legenda copiada. Cole a legenda no WhatsApp.')}catch(_){alert('Card salvo. A legenda está disponível no aplicativo.')}
 }catch(e){alert(String(e.message||e))}
};
window.hourCardPosterV198=createPoster;
console.info('[eStore] Card Hora a Hora regional v198');
})();