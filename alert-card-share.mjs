// Cartão compartilhável de alerta. O PNG contém a mesma informação da prévia.
const money = n => Number(n).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
export async function createAlertImage(contact,row){
 if(!row || !(Number(row.meta)>0) || !(Number(row.orders)>0)) throw Error('Meta financeira e meta de pedidos precisam estar calculadas antes do compartilhamento.');
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1450;
 const g=canvas.getContext('2d');if(!g)throw Error('Canvas indisponível.');
 const dark='#173F35',red='#B71C1C',cream='#F6F4F0';
 const rect=(x,y,w,h,color)=>{g.fillStyle=color;g.fillRect(x,y,w,h);};
 const line=(text,x,y,size=36,color=dark,bold=false)=>{g.fillStyle=color;g.font=(bold?'700 ':'400 ')+size+'px Arial,sans-serif';g.fillText(text,x,y);};
 const wrap=(text,x,y,maxWidth,size=35,color=dark,bold=false,leading=46)=>{
  g.font=(bold?'700 ':'400 ')+size+'px Arial,sans-serif';
  let words=String(text).split(/\s+/),rowWords='',cy=y;
  for(const w of words){const test=rowWords?rowWords+' '+w:w;if(g.measureText(test).width>maxWidth && rowWords){line(rowWords,x,cy,size,color,bold);cy+=leading;rowWords=w;}else rowWords=test;}
  if(rowWords)line(rowWords,x,cy,size,color,bold);return cy+leading;
 };
 rect(0,0,1080,1450,cream);rect(0,0,1080,290,red);rect(36,34,245,220,dark);
 // A marca utilizada é o ícone do PWA oficial do próprio aplicativo.
 const logo=new Image();
 logo.src=new URL('./icon-v136.svg',import.meta.url).href;
 try{await logo.decode();g.drawImage(logo,37,23,242,242);}catch{
  line('App.',66,105,32,'#fff');line('eStore',66,158,53,'#fff',true);line('CE+PI',66,215,55,'#DE7C00',true);
 }
 line('🚨 ALERTA',318,112,76,'#fff',true);line('eSTORE CONNECT',325,173,47,'#fff',true);
 const kind=row.closing?'FECHAMENTO eSTORE | 21H':row.condition==='stale'?'VENDA SEM ATUALIZAÇÃO HÁ 1H':row.condition==='zero'?'ACELERAR CAPTAÇÃO':'LOJA SEM ATUALIZAÇÃO';
 line(kind,325,230,37,'#fff',true);
 const name=String(contact?.person?.nome||contact?.name_original||'Liderança').split(/\s+/)[0].toUpperCase();
 line('OLÁ, '+name+'!  |  FILIAL '+row.st,55,357,49,red,true);
 const intro=row.closing?'É hora de informar a venda eStore do dia.':row.condition==='stale'?'Venda no print sem nova atualização há 1 hora.':row.condition==='zero'?'Sua filial está com a parcial zerada.':'Sua filial precisa atualizar a venda no app.';
 wrap(intro,55,418,950,39,dark,true,48);
 rect(50,486,980,166,'#FFE7E7');g.strokeStyle=red;g.lineWidth=4;g.strokeRect(50,486,980,166);
 line(row.closing?'⚠ FECHAMENTO 21H — INFORME A VENDA':row.condition==='stale'?'⚠ VENDA DESATUALIZADA':'⚠ ATENÇÃO — SEM ATUALIZAÇÃO',80,552,37,red,true);
 const since=row.condition==='stale'?row.last_sale_change_time:row.first_check_time;
 line(row.closing?'Informe a captação do dia ou confirme sem novas vendas.':
  Number(row.missing_partials)>0?Number(row.missing_partials)+' parciais sem input de venda':
  since?'Venda e parcial desde as '+since:'Venda e parcial ainda não registradas',80,612,35,red,true);
 rect(50,679,980,165,'#E9EBEA');
 line('META eSTORE DO DIA',80,733,32,dark,true);line(money(row.meta),80,806,52,dark,true);
 line('META DE PEDIDOS',630,733,32,dark,true);line(String(row.orders)+' pedidos',630,806,52,dark,true);
 rect(50,874,980,192,'#fff');
 line(row.closing?'AÇÃO DE FECHAMENTO':'AÇÃO IMEDIATA',80,936,44,red,true);
 wrap(row.closing?'Informe a venda eStore do dia ou confirme sem novos pedidos.':'Atualize a parcial, mobilize a equipe e confirme se houve novos pedidos.',80,991,920,35,dark,false,45);
 line('ATUALIZE SUA PARCIAL',55,1130,37,dark,true);
 wrap('Menu → Hora a Hora → Registrar ou Confirmar sem novas vendas',55,1181,965,30,dark,false,43);
 line('frannlima.github.io/app-estore-cepi/?menu=hourly',55,1241,29,'#1458A5',true);
 rect(40,1280,1000,125,red);
 line(row.closing?'FECHAMENTO eSTORE | 21H':'A PRÓXIMA HORA PODE MUDAR O JOGO!',73,1330,38,'#fff',true);
 line(row.closing?'INFORME A VENDA CAPTADA NA LOJA':'VAMOS GIRAR O PONTEIRO!',row.closing?73:220,1381,38,'#fff',true);
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('Falha na geração do PNG.');
 return new File([blob],'alerta-estore-filial-'+row.st+'.png',{type:'image/png'});
}
export const HOURLY_LINK='https://frannlima.github.io/app-estore-cepi/?menu=hourly';
export async function shareAlertImage(file,phone,closing=false){
 if(navigator.canShare?.({files:[file]}) && typeof navigator.share==='function'){
  await navigator.share({files:[file],title:'Alerta eStore Connect',text:(closing?'📌 FECHAMENTO 21H: informe o valor total da venda eStore captada hoje na loja e a quantidade de pedidos. Se não vendeu, registre zero.\n':'📲 Atualize sua venda e pedidos no Hora a Hora:\n')+HOURLY_LINK});
  return 'Card PNG compartilhado. O link Hora a Hora foi incluído no texto do compartilhamento quando suportado pelo WhatsApp; confirme a legenda antes de enviar.';
 }
 const objectURL=URL.createObjectURL(file),a=document.createElement('a');a.href=objectURL;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(objectURL),60000);
 // O WhatsApp Web não admite pré-anexar um arquivo via wa.me; nunca enviar texto no lugar do PNG.
 return 'PNG baixado. Anexe a imagem ao WhatsApp com a legenda '+(closing?'Fechamento 21h: informe a venda eStore captada hoje. ':'')+HOURLY_LINK+'. O link dentro do PNG não é clicável.';
}


/**
 * Compartilhamento assistido. Navegadores não permitem selecionar um destinatário
 * do WhatsApp e anexar a imagem programaticamente via wa.me.
 * Ao usar native share, a pessoa escolhe o destinatário e confirma o envio.
 * No fallback desktop: PNG baixado + conversa aberta com a legenda pronta.
 */
export function canNativeFileShare(){
 if(typeof navigator==='undefined'||typeof File==='undefined')return false;
 if(typeof navigator.share!=='function'||typeof navigator.canShare!=='function')return false;
 try{
  const probe=new File(['png'],'alerta.png',{type:'image/png'});
  return Boolean(navigator.canShare({files:[probe]}));
 }catch(_){return false}
}
export function recipientWhatsAppUrl(phone,caption){
 const digits=String(phone||'').replace(/\D/g,'');
 if(!/^55[1-9]\d9\d{8}$/.test(digits))throw new Error('WhatsApp do supervisor não validado.');
 return 'https://wa.me/'+digits+'?text='+encodeURIComponent(String(caption||''));
}
export async function sharePreparedAlert({file,caption,phone,store,name,preopenedWindow=null}){
 if(!file||file.type!=='image/png')throw new Error('O card PNG não foi gerado corretamente.');
 const url=recipientWhatsAppUrl(phone,caption);
 if(canNativeFileShare()){
  try{
   if(navigator.canShare({files:[file]})){
    await navigator.share({
     files:[file],
     title:'ALERTA eSTORE | FILIAL '+String(store||''),
     text:String(caption||'')
    });
    // A API nativa não comprova entrega nem destino escolhido.
    return {mode:'native',chatOpened:false,url};
   }
  }catch(e){
   // Cancelar a folha de compartilhamento não deve baixar nem abrir outro destino.
   if(e?.name==='AbortError')throw e;
   // Falha de compatibilidade ou ativação: oferecer fallback manual.
  }
 }
 const objectURL=URL.createObjectURL(file);
 const link=document.createElement('a');
 link.href=objectURL;link.download=file.name||('alerta-estore-'+String(store||'filial')+'.png');
 document.body.append(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(objectURL),60000);
 let chatOpened=false;
 if(preopenedWindow&&!preopenedWindow.closed){
  try{preopenedWindow.location.replace(url);chatOpened=true}catch(_){/* exibir link manual */}
 }
 try{if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(String(caption||''));}catch(_){}
 return {mode:'manual',chatOpened,url};
}
