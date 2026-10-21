// Server-side policy only. No network transport or credentials.
export const TEMPLATE = 'estore_cepi_alerta_parcial';
const PHONE = /^\+[1-9][0-9]{7,14}$/;
export function prepareTest({ channel, config, contact, sender, templateStatus, parameters }) {
  if (channel?.whatsapp_enabled !== false) throw Error('regional_channel_must_remain_disabled');
  if (!config?.manual_test_enabled || !contact?.enabled || !contact.opt_in_at || !contact.validated_at ||
      !contact.matricula || !contact.store_code || ['089','090','109'].includes(String(contact.store_code).padStart(3,'0')) ||
      !PHONE.test(config.expected_phone_e164 || '') || contact.phone_e164 !== config.expected_phone_e164 ||
      contact.id !== config.contact_id) throw Error('authorized_contact_not_valid');
  if (!PHONE.test(sender || '')) throw Error('sender_not_confirmed');
  if (templateStatus !== 'APPROVED') throw Error('template_not_approved');
  if (!Array.isArray(parameters) || parameters.length !== 3 || parameters.some(x => typeof x !== 'string' || !x.trim() || x.length > 1024)) throw Error('invalid_template_parameters');
  return {from:sender,to:config.expected_phone_e164,type:'template',template:{name:TEMPLATE,language:{code:'pt_BR'},components:[{type:'body',parameters:parameters.map(text=>({type:'text',text}))}]}};
}
export function interpretObservation(message) {
  if (!message || typeof message.id !== 'string' || !message.id || message.id.length > 255) return {status:'uncertain',delivery_confirmed:false,automatic_retry:false};
  const status = typeof message.status === 'string' ? message.status : 'unknown';
  return {provider_message_id:message.id,status,delivery_confirmed:['delivered','read'].includes(status),automatic_retry:false};
}
