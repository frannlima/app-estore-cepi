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
 line('App.',66,105,32,'#fff');line('eStore',66,158,53,'#fff',true);line('CE+PI',66,215,55,'#DE7C00',true);
 line('🚨 ALERTA',318,112,76,'#fff',true);line('eSTORE CONNECT',325,173,47,'#fff',true);
 const kind=row.condition==='zero'?'ACELERAR CAPTAÇÃO':row.condition==='group_sale'?'VENDA NÃO LANÇADA':'LOJA SEM ATUALIZAÇÃO';
 line(kind,325,230,37,'#fff',true);
 const name=String(contact?.person?.nome||contact?.name_original||'Liderança').split(/\s+/)[0].toUpperCase();
 line('OLÁ, '+name+'!  |  FILIAL '+row.st,55,357,49,red,true);
 const intro=row.condition==='zero'?'Sua filial está com a parcial zerada.':'Sua filial precisa atualizar a venda no app.';
 wrap(intro,55,418,950,39,dark,true,48);
 rect(50,486,980,166,'#FFE7E7');g.strokeStyle=red;g.lineWidth=4;g.strokeRect(50,486,980,166);
 line('⚠ ATENÇÃO — SEM ATUALIZAÇÃO',80,552,39,red,true);
 const since=row.updated_at?new Date(row.updated_at).toLocaleTimeString('pt-BR',{timeZone:'America/Sao_Paulo',hour:'2-digit',minute:'2-digit'}):'14:00';
 line('Venda e parcial desde as '+since,80,612,37,red,true);
 rect(50,679,980,165,'#E9EBEA');
 line('META eSTORE DO DIA',80,733,32,dark,true);line(money(row.meta),80,806,52,dark,true);
 line('META DE PEDIDOS',630,733,32,dark,true);line(String(row.orders)+' pedidos',630,806,52,dark,true);
 rect(50,874,980,192,'#fff');
 line('AÇÃO IMEDIATA',80,936,44,red,true);
 wrap('Mobilizar o time, analisar o speed de atendimento e intensificar a captação.',80,991,920,35,dark,false,45);
 line('REGISTRE A VENDA',55,1142,37,dark,true);
 wrap('Menu → Hora a Hora → Sua filial → Registrar',55,1200,965,32,dark,false,45);
 rect(40,1260,1000,145,red);
 line('A PRÓXIMA HORA PODE MUDAR O JOGO!',73,1320,38,'#fff',true);
 line('VAMOS GIRAR O PONTEIRO!',220,1370,38,'#fff',true);
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('Falha na geração do PNG.');
 return new File([blob],'alerta-estore-filial-'+row.st+'.png',{type:'image/png'});
}
export async function shareAlertImage(file,phone){
 if(navigator.canShare?.({files:[file]}) && navigator.share){
  await navigator.share({files:[file],title:'Alerta eStore Connect'});return 'Compartilhamento aberto. Confirme o destinatário no WhatsApp.';
 }
 const objectURL=URL.createObjectURL(file),a=document.createElement('a');a.href=objectURL;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(objectURL),60000);
 const popup=window.open('https://wa.me/'+phone,'_blank','noopener,noreferrer');
 return popup?'Imagem baixada. Anexe o PNG à conversa aberta no WhatsApp e confirme o envio.':'Imagem baixada. Abra o WhatsApp e anexe o PNG manualmente.';
}
