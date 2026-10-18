// Server-side adapter. No credentials, runtime fetch defaults or automatic retries.
export const TEMPLATE = 'estore_cepi_alerta_parcial';
export const API = 'https://api.ycloud.com/v2';
const PHONE = /^\+[1-9][0-9]{7,14}$/;
const has = (o, key) => Object.prototype.hasOwnProperty.call(o, key);
const required = (s, max = 255) => {
  if (typeof s !== 'string' || !s.trim() || s.length > max) throw new Error('invalid_parameter');
  return s;
};

// General provider construction preserves to-precedence. The application pilot
// separately restricts recipient selection; it must never accept caller phones.
export function buildAlert(input) {
  if (!PHONE.test(input.from)) throw new Error('invalid_sender');
  let recipient;
  if (has(input, 'to')) {
    if (typeof input.to !== 'string' || !PHONE.test(input.to)) throw new Error('invalid_recipient');
    recipient = {to: input.to};
  } else {
    recipient = {recipient: required(input.recipient)};
  }
  if (!Array.isArray(input.parameters) || input.parameters.length !== 3) throw new Error('three_parameters_required');
  return {
    from: input.from, ...recipient, type: 'template',
    externalId: required(input.externalId), filterBlocked: true, filterUnsubscribed: true,
    template: {name: TEMPLATE, language: {code: 'pt_BR'}, components: [
      {type: 'body', parameters: input.parameters.map(text => ({type: 'text', text: required(text, 512)}))},
    ]},
  };
}

// Preserve unknown status observations, but never promote them to delivery.
export function observation(message) {
  const status = typeof message?.status === 'string' ? message.status : 'unknown';
  return {
    provider_message_id: typeof message?.id === 'string' && message.id.length <= 255 ? message.id : null,
    provider_status: status,
    delivery_confirmed: ['delivered', 'read'].includes(status),
    provider_at: message?.updateTime || null,
    delivered_at: message?.deliverTime || null,
    read_at: message?.readTime || null,
  };
}

export function makeYCloud({apiKey, fetcher}) {
  if (typeof apiKey !== 'string' || !apiKey.trim() || typeof fetcher !== 'function') throw new Error('adapter_not_configured');
  async function call(path, method, body) {
    let response, data;
    try {
      response = await fetcher(API + path, {
        method, headers: {'X-API-Key': apiKey, 'Content-Type': 'application/json'},
        ...(body ? {body: JSON.stringify(body)} : {}), signal: AbortSignal.timeout(16000),
      });
      data = await response.json();
    } catch {
      return {ok: false, state: 'uncertain', automatic_retry: false, reconciliation_required: true};
    }
    const requestId = response.headers.get('YCloud-Request-ID');
    if (!response.ok) {
      // No human-readable provider message is persisted: it may echo secrets/PII.
      const error = data?.error || {};
      const code = typeof error.code === 'string' && /^[A-Z0-9_]{1,100}$/.test(error.code) ? error.code : 'UNKNOWN_PROVIDER_ERROR';
      const retryAfter = response.headers.get('Retry-After');
      return {ok: false, state: method === 'POST' && response.status >= 500 ? 'uncertain' : 'failed',
        http_status: response.status, provider_code: code,
        provider_request_id: requestId, retry_after_seconds: /^\d+$/.test(retryAfter || '') ? Number(retryAfter) : null,
        automatic_retry: false, reconciliation_required: method === 'POST' && response.status >= 500};
    }
    const result = observation(data);
    if (!result.provider_message_id) return {ok: false, state: 'uncertain', automatic_retry: false, reconciliation_required: true};
    // `data` retained only inside adapter caller; never log or return to a browser.
    return {ok: true, state: method === 'POST' ? 'accepted' : 'observed', ...result,
      delivery_confirmed: method === 'POST' ? false : result.delivery_confirmed,
      provider_request_id: requestId, automatic_retry: false};
  }
  return {
    enqueue: input => call('/whatsapp/messages', 'POST', buildAlert(input)),
    retrieve: id => call('/whatsapp/messages/' + encodeURIComponent(required(id)), 'GET'),
  };
}

export function regionalEligibility({contact, collaborator, shift, at}) {
  const store = String(contact?.store_code || '').padStart(3, '0');
  if (['089', '090', '109', '519'].includes(store)) return false;
  if (!contact?.enabled || !contact.validated_at || !contact.opt_in_at || !PHONE.test(contact.phone_e164 || '')) return false;
  if (collaborator?.profile_type !== 'supervisor' || collaborator?.situacao !== 'Atividade Normal' ||
      !contact.matricula || contact.matricula !== collaborator.matricula || store !== String(collaborator.store_code).padStart(3, '0')) return false;
  if (shift?.status !== 'working' || shift.matricula !== contact.matricula || String(shift.store_code).padStart(3, '0') !== store) return false;
  const time = Date.parse(at), start = Date.parse(shift.start_at), end = Date.parse(shift.end_at);
  return Number.isFinite(time) && Number.isFinite(start) && Number.isFinite(end) && start <= time && time < end;
}
