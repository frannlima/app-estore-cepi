// Draft-only V2. No provider transport or activation switch is exposed here.
import {buildAlert, regionalEligibility} from './ycloud.mjs';
export const PERSONALIZED_TEMPLATE = 'estore_cepi_alerta_parcial_v2';
export const HOURLY_LINK = 'https://frannlima.github.io/app-estore-cepi/?menu=hourly';
export const META_LINK = 'https://frannlima.github.io/app-estore-cepi/?menu=metas';
export const PERSONALIZED_BODY = `📊 eSTORE CONNECT | VAMOS AVANÇAR JUNTOS

Olá, {{1}}! Cada atendimento traz uma oportunidade de aproximar sua filial da meta. Queremos apoiar você na mobilização do time.

🏬 Filial: {{2}}
🎯 Meta eStore do dia: {{3}}
🛍️ Desafio do dia: {{4}} pedidos
📍 Situação identificada: {{5}}
🕒 Verificação: {{6}}

Sua filial permanece em atenção nas duas últimas parciais. Vamos aproveitar as próximas oportunidades para avançar!

📲 Já realizou vendas? Atualize o Hora a Hora:
{{7}}

🤝 Ainda não distribuiu a meta? No app: Metas → informe o HC disponível → Salvar HC → Ratear igualmente (ou ajuste em Meta) → Compartilhar meta. Envie o card à equipe para que cada pessoa conheça seu desafio.

Se houver algum impedimento, sinalize para alinharmos o apoio necessário. Conte com a gente. Vamos juntos avançar!`;
const clean = (value, max = 120) => {
  if (typeof value !== 'string') throw new Error('invalid_context');
  const text = value.normalize('NFC').replace(/[\r\n\t*_~`]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text || text.length > max) throw new Error('invalid_context');
  return text;
};
const day = value => {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) throw new Error('invalid_date');
  return new Intl.DateTimeFormat('en-CA', {timeZone:'America/Sao_Paulo', year:'numeric', month:'2-digit', day:'2-digit'}).format(date);
};

// Caller must supply authoritative collaborator and day/store target records.
// Phone cannot be supplied by the caller separately from the validated contact.
export function preparePersonalizedDraft({from, externalId, contact, collaborator, shift, target, situation, at, consecutiveAttention}) {
  if (!regionalEligibility({contact, collaborator, shift, at})) throw new Error('recipient_not_eligible');
  const store = String(contact.store_code).padStart(3, '0');
  if (consecutiveAttention !== 2) throw new Error('two_partials_required');
  if (String(target?.store_code).padStart(3, '0') !== store || target?.date !== day(at)) throw new Error('target_context_mismatch');
  if (typeof target.amount !== 'number' || !Number.isFinite(target.amount) || target.amount <= 0 ||
      !Number.isSafeInteger(target.orders) || target.orders <= 0) throw new Error('invalid_daily_target');
  const name = collaborator.nome_social || collaborator.nome;
  const firstName = name ? clean(name, 200).split(' ')[0] : 'liderança';
  const parameters = [firstName, store, new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(target.amount),
    String(target.orders), clean(situation, 200), new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',dateStyle:'short',timeStyle:'short'}).format(new Date(at)), HOURLY_LINK];
  const payload = buildAlert({from, to: contact.phone_e164, externalId, parameters: parameters.slice(0,3)});
  payload.template.name = PERSONALIZED_TEMPLATE;
  payload.template.components[0].parameters = parameters.map(text => ({type:'text',text}));
  return {mode:'simulation', provider_validation:'synthetic_unverified', real_messages_sent:0, delivery_confirmed:false, payload};
}

export function personalizedTemplateDraft(wabaId) {
  return {wabaId: clean(wabaId), name:PERSONALIZED_TEMPLATE, language:'pt_BR', category:'MARKETING',
    components:[{type:'BODY', text:PERSONALIZED_BODY, example:{body_text:[['Alex','108','R$ 1.200,00','6','Sem captação nas duas últimas parciais','18/10/2026, 14:00',HOURLY_LINK]]}}]};
}
