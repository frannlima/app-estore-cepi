// Server-only integration. Recipients and consent are read from protected tables.
const HEADERS = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PHONE = /^\+[1-9][0-9]{7,14}$/;
const STATUS = new Set(["sent", "delivered", "read", "failed"]);
const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
  status, headers: { ...HEADERS, ...headers },
});

function equal(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function database(env, fetcher) {
  const base = env("SUPABASE_URL").replace(/\/$/, "");
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  return async (path, { method = "GET", body, prefer } = {}) => {
    if (!base || !key) throw new Error("database_not_configured");
    const response = await fetcher(`${base}/rest/v1/${path}`, {
      method,
      headers: { apikey: key, Authorization: `Bearer ${key}`, ...HEADERS,
        ...(prefer ? { Prefer: prefer } : {}) },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("database_request_failed");
    return response.status === 204 ? null : response.json();
  };
}

async function readiness(db, env) {
  const cfg = (await db("estore_whatsapp_test_config?id=eq.1&select=*"))[0];
  const contact = cfg ? (await db(`estore_alert_wa_contacts?id=eq.${cfg.contact_id}&select=phone_e164,enabled,opt_in_at,validated_at,store_code`))[0] : null;
  const channel = (await db("estore_alert_config?id=eq.1&select=whatsapp_enabled"))[0];
  const phoneId = env("WA_META_PHONE_NUMBER_ID").trim();
  const graphVersion = env("WA_META_GRAPH_VERSION").trim() || "v26.0";
  const secrets = Object.fromEntries(["WA_META_ACCESS_TOKEN", "WA_META_PHONE_NUMBER_ID", "WA_META_APP_SECRET", "WA_WEBHOOK_VERIFY_TOKEN"]
    .map(name => [name, Boolean(env(name).trim())]));
  const reasons = [];
  if (!cfg?.manual_test_enabled) reasons.push("manual_test_disabled");
  if (!channel || channel.whatsapp_enabled !== false) reasons.push("regional_channel_must_remain_disabled");
  if (!contact?.enabled || !contact.opt_in_at || !contact.validated_at ||
      !PHONE.test(cfg?.expected_phone_e164 || "") || contact.phone_e164 !== cfg?.expected_phone_e164 ||
      ["089", "090", "109", "519"].includes(contact?.store_code)) reasons.push("authorized_contact_not_valid");
  if (!/^\d+$/.test(phoneId)) reasons.push("invalid_sender_phone_number_id");
  if (!/^v\d+\.\d+$/.test(graphVersion)) reasons.push("invalid_graph_version");
  for (const [name, present] of Object.entries(secrets)) if (!present) reasons.push(`missing_${name}`);
  if (env("WA_WEBHOOK_VERIFY_TOKEN") && env("WA_WEBHOOK_VERIFY_TOKEN").length < 24) reasons.push("weak_webhook_verify_token");
  return { cfg, contact, phoneId, graphVersion, secrets, reasons };
}

function providerError(data, env) {
  const error = data?.error || {};
  const clean = value => {
    let text = String(value || "");
    for (const name of ["WA_META_ACCESS_TOKEN", "SUPABASE_SERVICE_ROLE_KEY", "WA_META_APP_SECRET", "WA_WEBHOOK_VERIFY_TOKEN"]) {
      const secret = env(name);
      if (secret) text = text.split(secret).join("[redacted]");
    }
    return text.slice(0,1000);
  };
  return { provider_error_code: Number.isInteger(error.code) ? error.code : null,
    provider_error_message: clean(error.message || "Meta rejected the request"),
    provider_error_details: clean(error.error_data?.details) };
}

export function makeTestHandler({ env, fetcher = globalThis.fetch }) {
  const db = database(env, fetcher);
  return async request => {
    if (request.method !== "POST") return json({ ok:false, error:"method_not_allowed" },405);
    const auth = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    if (!equal(auth,env("SUPABASE_SERVICE_ROLE_KEY"))) return json({ok:false,error:"unauthorized"},403);
    try {
      const raw = await request.text();
      if (raw.length > 2048) return json({ok:false,error:"body_too_large"},413);
      let body;
      try { body = JSON.parse(raw || "{}"); } catch { return json({ok:false,error:"invalid_json"},400); }
      if (!body || Array.isArray(body) || typeof body !== "object" ||
          Object.keys(body).some(key => !["action","request_id"].includes(key))) {
        return json({ok:false,error:"unsupported_fields_recipients_cannot_be_supplied"},400);
      }
      const action = body.action || "diagnostics";
      if (!["diagnostics","send_test","result"].includes(action)) return json({ok:false,error:"invalid_action"},400);
      if (action === "result") {
        if (!UUID.test(body.request_id || "")) return json({ok:false,error:"request_id_must_be_uuid"},400);
        const result = (await db(`estore_whatsapp_tests?request_id=eq.${body.request_id}&select=request_id,status,provider_message_id,provider_error_code,provider_error_message,provider_error_details,created_at,delivered_at,read_at,updated_at`))[0];
        return result ? json({ok:true,result}) : json({ok:false,error:"test_not_found"},404);
      }
      const state = await readiness(db,env);
      const diagnostic = { ready:state.reasons.length === 0, mode:"single_authorized_recipient",
        recipient_last4:state.cfg?.expected_phone_e164?.slice(-4) || null,
        secrets_present:state.secrets, blocked_reasons:state.reasons };
      if (action === "diagnostics") return json({ok:true,...diagnostic});
      if (!UUID.test(body.request_id || "")) return json({ok:false,error:"request_id_must_be_uuid"},400);
      if (state.reasons.length) return json({ok:false,...diagnostic},503);
      const claim = await db("rpc/estore_begin_whatsapp_test",{method:"POST",body:{
        p_request_id:body.request_id,p_phone_number_id:state.phoneId,
      }});
      if (!claim.created) {
        const existing = ["sending","accepted","sent","delivered","read","failed","uncertain"].includes(claim.status);
        return json({ok:existing,submitted:false,request_id:body.request_id,status:claim.status},existing ? 200 : claim.status === "rate_limited" ? 429 : 409);
      }
      if (claim.recipient_e164 !== state.cfg.expected_phone_e164) throw new Error("recipient_changed");
      const path = `estore_whatsapp_tests?request_id=eq.${body.request_id}&status=eq.sending`;
      let response, data;
      try {
        response = await fetcher(`https://graph.facebook.com/${state.graphVersion}/${state.phoneId}/messages`,{
          method:"POST",headers:{Authorization:`Bearer ${env("WA_META_ACCESS_TOKEN")}`, ...HEADERS},
          body:JSON.stringify({messaging_product:"whatsapp",recipient_type:"individual",
            to:claim.recipient_e164.slice(1),type:"template",template:{name:"hello_world",language:{code:"en_US"}}}),
          signal:AbortSignal.timeout(16000),
        });
        data = await response.json();
      } catch {
        await db(path,{method:"PATCH",body:{status:"uncertain",provider_error_message:"Network outcome unknown; do not retry automatically",updated_at:new Date().toISOString()}});
        return json({ok:false,request_id:body.request_id,status:"uncertain",error:"manual_reconciliation_required"},502);
      }
      const messageId = data?.messages?.[0]?.id;
      if (response.ok && typeof messageId === "string" && messageId.startsWith("wamid.")) {
        const target = claim.recipient_e164.slice(1);
        const mapping = (data.contacts || []).find(item => String(item.input).replace(/\D/g,"") === target);
        const canonical = /^\d{8,15}$/.test(mapping?.wa_id || "") ? mapping.wa_id : target;
        await db(path,{method:"PATCH",body:{status:"accepted",provider_message_id:messageId,
          canonical_recipient_id:canonical,updated_at:new Date().toISOString()}});
        return json({ok:true,request_id:body.request_id,status:"accepted",delivery_confirmed:false},202);
      }
      if (response.ok) {
        await db(path,{method:"PATCH",body:{status:"uncertain",provider_error_message:"Meta accepted HTTP request without a usable message id; reconcile before retrying",updated_at:new Date().toISOString()}});
        return json({ok:false,request_id:body.request_id,status:"uncertain",error:"manual_reconciliation_required"},502);
      }
      const error = providerError(data,env);
      await db(path,{method:"PATCH",body:{status:"failed",...error,updated_at:new Date().toISOString()}});
      return json({ok:false,request_id:body.request_id,status:"failed",...error},502);
    } catch {
      return json({ok:false,error:"integration_unavailable_check_private_test_log"},503);
    }
  };
}

async function validSignature(raw, signature, secret, cryptoApi) {
  if (!secret || !/^sha256=[a-f0-9]{64}$/i.test(signature || "")) return false;
  const key = await cryptoApi.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["verify"]);
  const bytes = Uint8Array.from(signature.slice(7).match(/../g).map(pair => parseInt(pair,16)));
  return cryptoApi.subtle.verify("HMAC",key,bytes,new TextEncoder().encode(raw));
}

export function makeWebhookHandler({env,fetcher=globalThis.fetch,cryptoApi=globalThis.crypto}) {
  const db = database(env,fetcher);
  return async request => {
    try {
      if (request.method === "GET") {
        const url = new URL(request.url);
        const verify = env("WA_WEBHOOK_VERIFY_TOKEN");
        if (!verify || verify.length < 24) return json({ok:false,error:"webhook_not_configured"},503);
        if (url.searchParams.get("hub.mode") !== "subscribe" || !equal(url.searchParams.get("hub.verify_token"),verify)) return json({ok:false,error:"verification_failed"},403);
        const challenge = url.searchParams.get("hub.challenge");
        if (!challenge || challenge.length > 512) return json({ok:false,error:"invalid_challenge"},400);
        return new Response(challenge,{headers:{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"no-store"}});
      }
      if (request.method !== "POST") return json({ok:false,error:"method_not_allowed"},405);
      if (!env("WA_META_APP_SECRET") || !env("SUPABASE_SERVICE_ROLE_KEY")) return json({ok:false,error:"webhook_not_configured"},503);
      const raw = await request.text();
      if (new TextEncoder().encode(raw).length > 262144) return json({ok:false,error:"body_too_large"},413);
      if (!await validSignature(raw,request.headers.get("x-hub-signature-256"),env("WA_META_APP_SECRET"),cryptoApi)) return json({ok:false,error:"invalid_signature"},401);
      let payload;
      try { payload = JSON.parse(raw); } catch { return json({ok:false,error:"invalid_json"},400); }
      if (payload.object !== "whatsapp_business_account") return json({ok:true,received:0});
      let received = 0, retry = false;
      for (const entry of payload.entry || []) for (const change of entry.changes || []) {
        if (change.field !== "messages" || change.value?.messaging_product !== "whatsapp") continue;
        const value = change.value;
        for (const status of value.statuses || []) {
          if (!STATUS.has(status.status) || typeof status.id !== "string" || !/^\d+$/.test(String(status.timestamp))) continue;
          const date = new Date(Number(status.timestamp)*1000);
          if (!Number.isFinite(date.getTime())) continue;
          const err = status.errors?.[0] || {};
          const safeError = providerError({error:err},env);
          const recorded = await db("rpc/estore_record_whatsapp_test_status",{method:"POST",body:{
            p_message_id:status.id,p_phone_number_id:String(value.metadata?.phone_number_id || ""),
            p_recipient_id:String(status.recipient_id || ""),p_status:status.status,p_provider_at:date.toISOString(),
            p_error_code:safeError.provider_error_code,p_error_message:status.status === "failed" ? safeError.provider_error_message : null,
            p_error_details:status.status === "failed" ? safeError.provider_error_details : null,
          }});
          if (recorded === "recorded") received++;
          if (recorded === "awaiting_api_response") retry = true;
        }
      }
      return retry ? json({ok:false,error:"awaiting_api_response"},503,{"Retry-After":"3"}) : json({ok:true,received});
    } catch {
      // A non-2xx response lets Meta retry instead of losing a delivery event.
      return json({ok:false,error:"webhook_processing_unavailable"},503);
    }
  };
}
