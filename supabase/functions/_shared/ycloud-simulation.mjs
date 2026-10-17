import {buildAlert, makeYCloud} from './ycloud.mjs';
const json = (value, status = 200) => new Response(JSON.stringify(value), {status,
  headers: {'Content-Type': 'application/json', 'Cache-Control': 'no-store'}});
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const SCENARIOS = ['accepted', 'rejected', 'rate_limited', 'timeout'];
function equal(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0; for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
export async function simulate(scenario) {
  if (!SCENARIOS.includes(scenario)) throw new Error('invalid_scenario');
  const input = {from: '+12025550100', to: '+12025550101', externalId: 'synthetic-test',
    parameters: ['FILIAL SIMULADA', 'CENÁRIO SIMULADO — sem envio', '12:05']};
  buildAlert(input);
  let providerCalls = 0;
  const client = makeYCloud({apiKey: 'synthetic-key-not-valid', fetcher: async () => {
    providerCalls++;
    if (scenario === 'timeout') throw new Error('simulated timeout');
    if (scenario === 'rejected') return Response.json({error: {status: 403, code: 'FORBIDDEN'}}, {status: 403});
    if (scenario === 'rate_limited') return Response.json({error: {status: 429, code: 'TOO_MANY_REQUESTS'}}, {status: 429, headers: {'Retry-After': '60'}});
    return Response.json({id: 'synthetic-message-id', status: 'accepted'});
  }});
  const result = await client.enqueue(input);
  return {mode: 'simulation', scenario, outcome: result.state, provider_code: result.provider_code || null,
    retry_after_seconds: result.retry_after_seconds || null, automatic_retry: false,
    delivery_confirmed: false, real_messages_sent: 0, mock_transport_calls: providerCalls};
}

// This deployed handler cannot send to YCloud: it exposes only diagnostics and
// synthetic simulations. No live transport or live-send action is wired here.
export function makeSimulationHandler({env, db}) {
  return async request => {
    if (request.method !== 'POST') return json({ok: false, error: 'method_not_allowed'}, 405);
    const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
    if (!equal(token, env('SUPABASE_SERVICE_ROLE_KEY'))) return json({ok: false, error: 'unauthorized'}, 403);
    try {
      const raw = await request.text();
      if (new TextEncoder().encode(raw).length > 2048) return json({ok: false, error: 'body_too_large'}, 413);
      let body;
      try {body = JSON.parse(raw || '{}');} catch {return json({ok: false, error: 'invalid_json'}, 400);}
      if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(k => !['action', 'request_id', 'scenario'].includes(k))) {
        return json({ok: false, error: 'unsupported_fields_recipients_cannot_be_supplied'}, 400);
      }
      if (!['diagnostics', 'simulate'].includes(body.action)) return json({ok: false, error: 'live_send_locked'}, 409);
      const channel = (await db('estore_alert_config?id=eq.1&select=whatsapp_enabled'))?.[0];
      if (!channel || channel.whatsapp_enabled !== false) return json({ok: false, error: 'regional_channel_must_remain_disabled'}, 409);
      if (body.action === 'diagnostics') return json({ok: true, mode: 'simulation_only', live_send_locked: true,
        regional_enabled: false, secrets_present: {YCLOUD_API_KEY: Boolean(env('YCLOUD_API_KEY')), YCLOUD_SENDER_E164: Boolean(env('YCLOUD_SENDER_E164'))}});
      if (!UUID.test(body.request_id || '') || !SCENARIOS.includes(body.scenario)) return json({ok: false, error: 'invalid_simulation_parameters'}, 400);
      const result = await simulate(body.scenario);
      // Durable local deduplication is not a YCloud idempotency guarantee.
      const inserted = await db('estore_ycloud_simulations?on_conflict=request_id', {method: 'POST',
        prefer: 'resolution=ignore-duplicates,return=representation', body: {request_id: body.request_id, scenario: body.scenario, result}});
      const row = inserted?.[0] || (await db(`estore_ycloud_simulations?request_id=eq.${body.request_id}&select=request_id,scenario,result`))?.[0];
      if (!row) throw new Error('missing_simulation_receipt');
      if (row.scenario !== body.scenario) return json({ok: false, error: 'request_id_conflict'}, 409);
      return json({ok: true, duplicate: !inserted?.length, request_id: row.request_id, ...row.result});
    } catch {return json({ok: false, error: 'simulation_unavailable'}, 503);}
  };
}
