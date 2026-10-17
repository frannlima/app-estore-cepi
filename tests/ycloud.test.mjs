import test from 'node:test';
import assert from 'node:assert/strict';
import {buildAlert, makeYCloud, observation, regionalEligibility, API} from '../supabase/functions/_shared/ycloud.mjs';
import {makeSimulationHandler, simulate} from '../supabase/functions/_shared/ycloud-simulation.mjs';
const base = {from: '+12025550100', to: '+12025550101', externalId: 'synthetic-request', parameters: ['108', 'SIMULADO', '12:05']};
test('three template parameters, fixed language and subscription filters', () => {
  const p = buildAlert(base);
  assert.equal(p.template.name, 'estore_cepi_alerta_parcial');
  assert.deepEqual(p.template.language, {code: 'pt_BR'});
  assert.deepEqual(p.template.components[0].parameters.map(x => x.text), base.parameters);
  assert.equal(p.filterBlocked, true); assert.equal(p.filterUnsubscribed, true);
  assert.equal(p.text, undefined);
});
test('neither recipient rejects', () => {const {to, ...input} = base; assert.throws(() => buildAlert(input));});
test('recipient alone succeeds', () => {const {to, ...input} = base; assert.equal(buildAlert({...input, recipient: 'US.synthetic'}).recipient, 'US.synthetic');});
for (const recipient of ['US.synthetic', '', null, {}, 8]) test('to wins over recipient ' + JSON.stringify(recipient), () => {
  assert.deepEqual(buildAlert({...base, recipient}), buildAlert(base));
});
test('invalid to cannot fall back to valid recipient', () => assert.throws(() => buildAlert({...base, to: '', recipient: 'US.synthetic'})));
test('ignored recipient getter is never read', () => {const input = {...base}; Object.defineProperty(input, 'recipient', {get() {throw new Error('must_not_read');}}); assert.deepEqual(buildAlert(input), buildAlert(base));});
test('wrong parameter count and invalid sender reject', () => {
  assert.throws(() => buildAlert({...base, parameters: ['108']}));
  assert.throws(() => buildAlert({...base, parameters: ['108', {}, '12:05']}));
  assert.throws(() => buildAlert({...base, from: 'bad'}));
});
test('queued path, server header, no provider idempotency header', async () => {
  let called = 0;
  const client = makeYCloud({apiKey: 'synthetic-key', fetcher: async (url, options) => {
    called++; assert.equal(url, API + '/whatsapp/messages'); assert.equal(options.headers['X-API-Key'], 'synthetic-key');
    assert.equal(options.headers['Idempotency-Key'], undefined);
    return Response.json({id: 'CaseSensitive.SYNTHETIC', status: 'accepted', unknownField: 'tolerated'});
  }});
  const result = await client.enqueue(base); assert.equal(called, 1); assert.equal(result.state, 'accepted'); assert.equal(result.delivery_confirmed, false);
});
test('retrieve encodes opaque case-sensitive id and confirms observed delivery', async () => {
  const client = makeYCloud({apiKey: 'synthetic-key', fetcher: async (url, options) => {
    assert.equal(url, API + '/whatsapp/messages/ABC%2Fdef'); assert.equal(options.method, 'GET');
    return Response.json({id: 'ABC/def', status: 'delivered', deliverTime: '2026-10-17T18:00:00Z'});
  }});
  assert.equal((await client.retrieve('ABC/def')).delivery_confirmed, true);
});
test('unknown status preserved without delivery', () => assert.deepEqual(observation({id: 'synthetic', status: 'future_state'}).provider_status, 'future_state'));
test('unknown status is not delivered', () => assert.equal(observation({id: 'synthetic', status: 'future_state'}).delivery_confirmed, false));
for (const status of [400, 401, 403, 404, 429, 503]) test('HTTP ' + status + ' never retries POST or echoes provider text', async () => {
  let calls = 0;
  const client = makeYCloud({apiKey: 'synthetic-key', fetcher: async () => {
    calls++; return Response.json({error: {code: 'UNKNOWN_NEW_CODE', message: 'synthetic-key private details'}},
      {status, headers: {'Retry-After': '60', 'YCloud-Request-ID': 'req-synthetic'}});
  }});
  const result = await client.enqueue(base); assert.equal(calls, 1); assert.equal(result.automatic_retry, false);
  assert.equal(result.provider_code, 'UNKNOWN_NEW_CODE'); assert.equal(result.provider_request_id, 'req-synthetic');
  assert.equal(JSON.stringify(result).includes('synthetic-key'), false);
  if (status === 503) assert.equal(result.state, 'uncertain');
  if (status === 429) assert.equal(result.retry_after_seconds, 60);
});
test('timeout remains uncertain with no replay', async () => {
  let calls = 0; const client = makeYCloud({apiKey: 'synthetic-key', fetcher: async () => {calls++; throw new Error('timeout');}});
  const r = await client.enqueue(base); assert.equal(r.state, 'uncertain'); assert.equal(r.reconciliation_required, true); assert.equal(calls, 1);
});
test('HTTP success without message id is uncertain', async () => {
  const client = makeYCloud({apiKey: 'synthetic-key', fetcher: async () => Response.json({status: 'accepted'})});
  assert.equal((await client.enqueue(base)).state, 'uncertain');
});
const eligible = {contact: {store_code: '108', matricula: 'synthetic-employee', enabled: true, validated_at: 'date', opt_in_at: 'date', phone_e164: base.to},
  collaborator: {store_code: '108', matricula: 'synthetic-employee', profile_type: 'supervisor', situacao: 'Atividade Normal'},
  shift: {store_code: '108', matricula: 'synthetic-employee', status: 'working', start_at: '2026-10-17T12:00:00-03:00', end_at: '2026-10-17T20:00:00-03:00'}, at: '2026-10-17T16:00:00-03:00'};
test('confirmed supervisor inside individual shift is eligible', () => assert.equal(regionalEligibility(eligible), true));
for (const role of ['gerente', 'admin', 'colaborador']) test(role + ' excluded', () => assert.equal(regionalEligibility({...eligible, collaborator: {...eligible.collaborator, profile_type: role}}), false));
for (const store of ['089','090','109','519']) test('excluded store ' + store, () => assert.equal(regionalEligibility({...eligible, contact: {...eligible.contact, store_code: store}}), false));
for (const status of ['day_off', 'vacation', 'leave', 'unknown']) test('shift ' + status + ' blocked', () => assert.equal(regionalEligibility({...eligible, shift: {...eligible.shift, status}}), false));
test('missing shift, mismatched employee or store, invalid consent and end of shift blocked', () => {
  assert.equal(regionalEligibility({...eligible, shift: null}), false);
  assert.equal(regionalEligibility({...eligible, contact: {...eligible.contact, matricula: 'other'}}), false);
  assert.equal(regionalEligibility({...eligible, shift: {...eligible.shift, store_code: '073'}}), false);
  assert.equal(regionalEligibility({...eligible, contact: {...eligible.contact, opt_in_at: null}}), false);
  assert.equal(regionalEligibility({...eligible, at: eligible.shift.end_at}), false);
});
for (const scenario of ['accepted', 'rejected', 'rate_limited', 'timeout']) test('simulation ' + scenario + ' never sends a real message', async () => {
  const r = await simulate(scenario); assert.equal(r.real_messages_sent, 0); assert.equal(r.delivery_confirmed, false); assert.equal(r.mock_transport_calls, 1);
});
function harness({enabled = false, failDb = false} = {}) {
  const rows = new Map(); let dbCalls = 0;
  const db = async (path, options = {}) => {
    dbCalls++; if (failDb) throw new Error('database unavailable');
    if (path.startsWith('estore_alert_config')) return [{whatsapp_enabled: enabled}];
    if (options.method === 'POST') {if (rows.has(options.body.request_id)) return []; rows.set(options.body.request_id, options.body); return [options.body];}
    return [rows.get(path.match(/request_id=eq\.([^&]+)/)[1])].filter(Boolean);
  };
  const handler = makeSimulationHandler({env: n => n === 'SUPABASE_SERVICE_ROLE_KEY' ? 'synthetic-service-key' : '', db});
  return {rows, handler, calls: () => dbCalls};
}
const id = '12345678-1234-4234-8234-123456789abc';
const request = (body, token = 'synthetic-service-key') => new Request('https://synthetic.invalid', {method: 'POST', headers: {authorization: 'Bearer ' + token}, body: JSON.stringify(body)});
test('authentication rejects before database access', async () => {const h = harness(); assert.equal((await h.handler(request({action:'diagnostics'}, 'wrong'))).status, 403); assert.equal(h.calls(), 0);});
test('diagnostics do not reveal key values and keep sending locked', async () => {
  const h = harness(); const r = await (await h.handler(request({action: 'diagnostics'}))).json();
  assert.equal(r.live_send_locked, true); assert.equal(r.secrets_present.YCLOUD_API_KEY, false); assert.equal(JSON.stringify(r).includes('synthetic-service-key'), false);
});
test('live send and caller recipients blocked', async () => {
  const h = harness(); assert.equal((await h.handler(request({action:'send_test'}))).status, 409);
  assert.equal((await h.handler(request({action:'simulate', to:base.to}))).status, 400);
});
test('idempotent simulation receipt and conflicting scenario blocked', async () => {
  const h = harness(); const b = {action:'simulate', request_id:id, scenario:'accepted'};
  assert.equal((await (await h.handler(request(b))).json()).duplicate, false);
  assert.equal((await (await h.handler(request(b))).json()).duplicate, true);
  assert.equal(h.rows.size, 1);
  assert.equal((await h.handler(request({...b, scenario:'timeout'}))).status, 409);
});
test('concurrent simulation requests leave one receipt', async () => {
  const h = harness(); const b = {action:'simulate', request_id:id, scenario:'accepted'};
  const results = await Promise.all(Array.from({length:10}, () => h.handler(request(b)).then(r => r.json())));
  assert.equal(h.rows.size, 1); assert.equal(results.filter(r => !r.duplicate).length, 1);
});
test('regional enabled or unknown DB state blocks simulation', async () => {
  assert.equal((await harness({enabled:true}).handler(request({action:'simulate',request_id:id,scenario:'accepted'}))).status, 409);
  assert.equal((await harness({failDb:true}).handler(request({action:'diagnostics'}))).status, 503);
});
test('invalid UUID, unknown scenario, oversize and malformed bodies rejected', async () => {
  const h = harness(); assert.equal((await h.handler(request({action:'simulate',request_id:'bad',scenario:'accepted'}))).status, 400);
  assert.equal((await h.handler(request({action:'simulate',request_id:id,scenario:'bad'}))).status, 400);
  assert.equal((await h.handler(request({action:'simulate',scenario:'x'.repeat(3000)}))).status, 413);
  assert.equal((await h.handler(new Request('https://synthetic.invalid',{method:'POST',headers:{authorization:'Bearer synthetic-service-key'},body:'{'}))).status, 400);
});
