export const STORES=['073','084','108','113','138','142','146','175','177','222','238','258','262','314','318','344','350','552'];
export const LABELS={missing:'Parcial não informada',stale:'Parcial desatualizada',zero:'Venda zero informada',group_sale:'Venda no grupo: atualizar app',ok:'Venda registrada'};
export function clock(now=new Date()){
 const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now).map(x=>[x.type,x.value]));
 return {date:`${p.year}-${p.month}-${p.day}`,time:`${p.hour}:${p.minute}`,hour:Number(p.hour)};
}
export function classify(row,group,now=new Date()){
 if(Number(row.captured)>0)return 'ok';
 if(group==='sale')return 'group_sale';
 if(group==='zero')return 'zero';
 if(!row.updated_at)return 'missing';
 if(now.getTime()-new Date(row.updated_at).getTime()>70*60000)return 'stale';
 return 'zero';
}
// The first number after the arrow is a target, never a sale.
export function parsePartial(text){
 const result=new Map();for(const line of String(text).split(/\r?\n/)){
  const m=line.match(/^\s*[•·*-]?\s*(\d{3})\s*[➜➔➡→➤➞]\s*(.*)$/u);
  if(!m||!STORES.includes(m[1]))continue;
  const tail=m[2].replace(/\*/g,'').replace(/^\s*\d+\s*/, '');
  const sale=/\d+[,.]\d{2}(?!\d)/.test(tail);
  result.set(m[1],{st:m[1],status:sale?'sale':'missing',source:line.slice(0,200)});
 }return [...result.values()];
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
 const situation={missing:'Parcial ainda não informada nesta verificação.',stale:'Parcial do app precisa de atualização.',zero:'Parcial informada com venda zero.',group_sale:'Venda informada no grupo ainda não registrada no app.'}[condition]||'Validar atualização da parcial.';
 return `📊 eSTORE CONNECT | VAMOS AVANÇAR JUNTOS\n\nOlá, ${first}! Cada atendimento traz uma oportunidade de aproximar sua filial da meta. Queremos apoiar você na mobilização do time.\n\n🏬 Filial: ${st}\n🎯 Meta eStore do dia: ${target}\n🛍️ Desafio do dia: ${orders>0?orders+' pedidos':'A confirmar no app'}\n📍 Situação identificada: ${situation}\n🕒 Verificação: ${date.split('-').reverse().join('/')} às ${time}\n\n📲 Já realizou vendas? Atualize a parcial: Menu → Hora a Hora → sua filial → informe o valor incremental e a quantidade de pedidos → Registrar.\nhttps://frannlima.github.io/app-estore-cepi/?menu=hourly\n\n🤝 Ainda não distribuiu a meta? Metas → informe o HC disponível → Salvar HC → Ratear igualmente (ou ajuste em Meta) → Compartilhar meta. Envie o card à equipe para que cada pessoa conheça seu desafio.\n\nSe houver algum impedimento, sinalize para alinharmos o apoio necessário. Conte com a gente. Vamos juntos avançar!`;
}
