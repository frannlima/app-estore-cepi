export const STORES=['073','084','108','113','138','142','146','175','177','222','238','258','262','314','318','344','350','552'];
export const LABELS={missing:'Sem parcial informada',stale:'Parcial da loja atrasada',zero:'Sem venda informada',group_sale:'Consolidado lançado • aguarda loja',ok:'Parcial atualizada',unknown:'A conferir'};
export function clock(now=new Date()){
 const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now).map(x=>[x.type,x.value]));
 return {date:`${p.year}-${p.month}-${p.day}`,time:`${p.hour}:${p.minute}`,hour:Number(p.hour)};
}
// O consolidado aumenta a venda, mas somente a loja confirma que atualizou sua parcial.
export function evaluateAlert({st,group,history=[],captured=0,updated_at=null,now=new Date(),date}){
 const local=clock(now),today=date||local.date;
 const ordered=[...history].sort((a,b)=>String(a.check_time).localeCompare(String(b.check_time)));
 let signature=null,lastSaleChange=null,previousStatus=null;
 for(const p of ordered){
  const r=(p.reviewed_rows||[]).find(x=>x.st===st);
  const status=r?.status||'unknown';
  const nextSignature=status==='sale'?'sale:'+String(r?.sale_signature||'não discriminada'):null;
  if(status==='sale'&&(previousStatus!=='sale'||signature!==nextSignature))lastSaleChange=p.check_time;
  signature=nextSignature;previousStatus=status;
 }
 const inputTs=updated_at?new Date(updated_at).getTime():NaN;
 const hasStoreInput=Number.isFinite(inputTs);
 const age=hasStoreInput?Math.max(0,Math.floor((now.getTime()-inputTs)/60000)):null;
 let condition='unknown',eligible=false,alert_reason='Parcial não classificada; conferir o relatório antes de alertar';
 if(hasStoreInput&&age<60){
  condition='ok';
  alert_reason=Number(captured)>0?'Venda contabilizada; loja atualizou a parcial há menos de 60 minutos':'Parcial sem novas vendas confirmada pela loja há menos de 60 minutos';
 }else if(hasStoreInput){
  condition='stale';eligible=true;
  alert_reason=Number(captured)>0?'Venda contabilizada; supervisor precisa atualizar a parcial':'Sem novo lançamento; confirmar situação atual da loja';
 }else if(group==='sale'||Number(captured)>0){
  condition='group_sale';eligible=true;
  alert_reason='Venda já incluída no consolidado; aguardando confirmação de parcial do supervisor (não duplicar)';
 }else if(group==='zero'){
  condition='zero';eligible=true;alert_reason='Sem venda no consolidado nem lançamento da loja';
 }else if(group==='missing'){
  condition='missing';eligible=true;alert_reason='Nenhum lançamento da filial na parcial validada';
 }
 const closing=local.hour===21&&eligible;
 return {eligible,condition,closing,minutes_since_sale:age,last_sale_change_time:lastSaleChange,alert_reason};
}
export function classify(row,group,now=new Date()){
 return evaluateAlert({st:row.st,group,history:row.history||[],captured:row.captured,updated_at:row.updated_at,now,date:row.date}).condition;
}
// Antes da seta vem a loja e imediatamente após vem a META DE PEDIDOS, nunca a venda.
// Extrair valores efetivos APÓS a primeira meta, inclusive "*4*989,99/221,38".
export function parsePartial(text){
 const result=new Map();
 for(const line of String(text).split(/\r?\n/)){
  const m=line.match(/^\s*[•·*-]?\s*(\d{3})\s*[➜➔➡→➤➞]\s*(.*)$/u);
  if(!m||!STORES.includes(m[1]))continue;
  let tail=m[2].trim();
  // Um ou dois asteriscos opcionais são a marcação de negrito da meta.
  const goal=tail.match(/^\*{0,2}\s*\d+\s*\*{0,2}/);
  if(!goal)continue;
  tail=tail.slice(goal[0].length);
  const tokens=[...tail.matchAll(/(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2}|\d+[\.,]\d{2})(?!\d)/g)].map(x=>x[1]);
  const cents=t=>Math.round(Number(t.includes(',')?t.replace(/\./g,'').replace(',','.'):t)*100);
  const amounts=tokens.map(cents).filter(n=>Number.isSafeInteger(n)&&n>0);
  result.set(m[1],{st:m[1],status:amounts.length?'sale':'missing',sale_signature:amounts.length?amounts.join('|'):null,source:line.slice(0,200)});
 }
 return [...result.values()];
}
export function recipientBlock(contact,person){
 if(!person||!STORES.includes(person.store_code)||person.store_code!==contact.store_code_confirmed)return 'Vínculo com filial pendente';
 if(!person.eligible_supervisor||!/supervisor/i.test(person.cargo)||/gerente/i.test(person.cargo))return 'Cargo não elegível';
 if(person.situacao!=='Atividade Normal')return 'Fora de atividade: '+person.situacao;
 if(contact.verification_status!=='confirmado')return 'Telefone e consentimento aguardam validação';
 return 'Jornada individual e ativação do piloto pendentes';
}
export function message({name,st,meta,orders,condition,date,time}){
 const first=String(name||'liderança').trim().split(/\s+/)[0];
 const target=Number(meta)>0?Number(meta).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}):'A confirmar no app';
 const situation={missing:'A loja ainda não informou a parcial.',stale:'Existe lançamento, mas o supervisor precisa atualizar a parcial.',zero:'Não há vendas registradas; informe ou confirme a parcial.',group_sale:'A venda já está contabilizada no consolidado; falta confirmação da loja.'}[condition]||'Validar atualização da parcial.';
 return `📊 eSTORE CONNECT | VAMOS AVANÇAR JUNTOS\n\nOlá, ${first}! Cada atendimento traz uma oportunidade de aproximar sua filial da meta. Queremos apoiar você na mobilização do time.\n\n🏬 Filial: ${st}\n🎯 Meta eStore do dia: ${target}\n🛍️ Desafio do dia: ${orders>0?orders+' pedidos':'A confirmar no app'}\n📍 Situação identificada: ${situation}\n🕒 Verificação: ${date.split('-').reverse().join('/')} às ${time}\n\n📲 Já realizou vendas? Atualize a parcial: Menu → Hora a Hora → sua filial → informe somente novos pedidos ou use Confirmar sem novas vendas. Nunca lance outra vez valores já incluídos no consolidado.\nhttps://frannlima.github.io/app-estore-cepi/?menu=hourly\n\n🤝 Ainda não distribuiu a meta? Metas → informe o HC disponível → Salvar HC → Ratear igualmente (ou ajuste em Meta) → Compartilhar meta. Envie o card à equipe para que cada pessoa conheça seu desafio.\n\nSe houver algum impedimento, sinalize para alinharmos o apoio necessário. Conte com a gente. Vamos juntos avançar!`;
}
