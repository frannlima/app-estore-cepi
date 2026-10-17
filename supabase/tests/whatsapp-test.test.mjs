import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto, randomUUID } from 'node:crypto';
import { makeTestHandler, makeWebhookHandler } from '../functions/_shared/whatsapp-test.mjs';

// Synthetic fixtures only; no personal telephone numbers or live credentials.
const PHONE='+15550000001', PHONE_ID='123456789';
function fixture(overrides={}) {
  const vars={SUPABASE_URL:'https://example.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'synthetic-service-key',
    WA_META_ACCESS_TOKEN:'synthetic-meta-token',WA_META_PHONE_NUMBER_ID:PHONE_ID,
    WA_META_APP_SECRET:'synthetic-app-secret',WA_WEBHOOK_VERIFY_TOKEN:'synthetic-verify-token-long-enough',...overrides};
  const state={calls:[],runs:new Map(),enabled:false,contact:{phone_e164:PHONE,enabled:true,opt_in_at:'2026-10-17',validated_at:'2026-10-17',store_code:'108'},
    cfg:{manual_test_enabled:true,contact_id:1,expected_phone_e164:PHONE},mode:'ok',rpcResult:'recorded'};
  const fetcher=async (url,opts={})=>{
    const u=new URL(url),body=opts.body?JSON.parse(opts.body):null;
    state.calls.push({url,method:opts.method,body});
    if(u.hostname==='graph.facebook.com') {
      if(state.mode==='network')throw new Error('synthetic network timeout');
      if(state.mode==='error')return Response.json({error:{code:131026,message:'Message undeliverable',error_data:{details:'Synthetic delivery error'}}},{status:400});
      if(state.mode==='missing_id')return Response.json({messaging_product:'whatsapp'});
      return Response.json({contacts:[{input:PHONE.slice(1),wa_id:PHONE.slice(1)}],messages:[{id:'wamid.synthetic'}]});
    }
    if(u.pathname.endsWith('rpc/estore_begin_whatsapp_test')) {
      if(state.runs.has(body.p_request_id))return Response.json({created:false,status:state.runs.get(body.p_request_id).status});
      state.runs.set(body.p_request_id,{status:'sending'});
      return Response.json({created:true,recipient_e164:PHONE,status:'sending'});
    }
    if(u.pathname.endsWith('rpc/estore_record_whatsapp_test_status'))return Response.json(state.rpcResult);
    if(u.pathname.endsWith('estore_whatsapp_test_config'))return Response.json([state.cfg]);
    if(u.pathname.endsWith('estore_alert_wa_contacts'))return Response.json([state.contact]);
    if(u.pathname.endsWith('estore_alert_config'))return Response.json([{whatsapp_enabled:state.enabled}]);
    if(u.pathname.endsWith('estore_whatsapp_tests')) {
      const id=u.searchParams.get('request_id').slice(3),run=state.runs.get(id);
      if(opts.method==='PATCH') {Object.assign(run,body);return new Response(null,{status:204});}
      return Response.json(run?[{request_id:id,...run}]:[]);
    }
    throw new Error('Unexpected synthetic database call');
  };
  const env=name=>vars[name]||'';
  const handler=makeTestHandler({env,fetcher});
  const webhook=makeWebhookHandler({env,fetcher,cryptoApi:webcrypto});
  const request=(body,authorized=true)=>handler(new Request('https://example.supabase.co/functions/v1/estore-whatsapp-test',{
    method:'POST',headers:authorized?{Authorization:`Bearer ${vars.SUPABASE_SERVICE_ROLE_KEY}`}:{},body:JSON.stringify(body),
  }));
  return {state,env,vars,request,webhook};
}
const graphCalls=f=>f.state.calls.filter(x=>x.url.startsWith('https://graph.facebook.com/'));

test('unauthorized calls cannot query contacts or send',async()=>{
  const f=fixture();assert.equal((await f.request({action:'send_test',request_id:randomUUID()},false)).status,403);assert.equal(f.state.calls.length,0);
});
test('diagnostics without credentials never claims or sends a test',async()=>{
  const f=fixture({WA_META_ACCESS_TOKEN:''});const data=await(await f.request({})).json();
  assert.equal(data.ready,false);assert.ok(data.blocked_reasons.includes('missing_WA_META_ACCESS_TOKEN'));assert.equal(f.state.runs.size,0);assert.equal(graphCalls(f).length,0);
});
test('recipient overrides are rejected before accessing the database',async()=>{
  const f=fixture();assert.equal((await f.request({action:'send_test',request_id:randomUUID(),to:'15550000002'})).status,400);assert.equal(f.state.calls.length,0);
});
test('regional activation, missing consent, or changed contact blocks the pilot',async()=>{
  for(const change of [f=>f.state.enabled=true,f=>f.state.contact.opt_in_at=null,f=>f.state.contact.phone_e164='+15550000002']) {
    const f=fixture();change(f);assert.equal((await f.request({action:'send_test',request_id:randomUUID()})).status,503);assert.equal(graphCalls(f).length,0);
  }
});
test('the test uses only the protected recipient and the Meta test template',async()=>{
  const f=fixture(),id=randomUUID();const response=await f.request({action:'send_test',request_id:id});
  assert.equal(response.status,202);assert.equal((await response.json()).delivery_confirmed,false);
  assert.deepEqual(graphCalls(f)[0].body,{messaging_product:'whatsapp',recipient_type:'individual',to:PHONE.slice(1),type:'template',template:{name:'hello_world',language:{code:'en_US'}}});
  assert.equal(f.state.runs.get(id).status,'accepted');
});
test('repeating a request id never resends',async()=>{
  const f=fixture(),id=randomUUID();await f.request({action:'send_test',request_id:id});await f.request({action:'send_test',request_id:id});assert.equal(graphCalls(f).length,1);
});
test('provider failures preserve the actual error code',async()=>{
  const f=fixture(),id=randomUUID();f.state.mode='error';const response=await f.request({action:'send_test',request_id:id});
  assert.equal(response.status,502);assert.equal(f.state.runs.get(id).provider_error_code,131026);assert.equal(f.state.runs.get(id).status,'failed');
});
test('uncertain network outcomes are stored and never retried automatically',async()=>{
  const f=fixture(),id=randomUUID();f.state.mode='network';await f.request({action:'send_test',request_id:id});
  assert.equal(f.state.runs.get(id).status,'uncertain');await f.request({action:'send_test',request_id:id});assert.equal(graphCalls(f).length,1);
});
test('successful HTTP without a message id remains uncertain',async()=>{
  const f=fixture(),id=randomUUID();f.state.mode='missing_id';await f.request({action:'send_test',request_id:id});assert.equal(f.state.runs.get(id).status,'uncertain');
});
test('webhook verification requires the exact configured token',async()=>{
  const f=fixture(),url='https://example.supabase.co/webhook?hub.mode=subscribe&hub.challenge=123&hub.verify_token=';
  assert.equal((await f.webhook(new Request(url+'wrong'))).status,403);
  assert.equal(await(await f.webhook(new Request(url+f.vars.WA_WEBHOOK_VERIFY_TOKEN))).text(),'123');
});
async function signedRequest(f,{recipient=PHONE.slice(1),signature=true}={}) {
  const raw=JSON.stringify({object:'whatsapp_business_account',entry:[{changes:[{field:'messages',value:{messaging_product:'whatsapp',metadata:{phone_number_id:PHONE_ID},statuses:[{id:'wamid.synthetic',recipient_id:recipient,status:'failed',timestamp:'1792210000',errors:[{code:131026,message:'Message undeliverable',error_data:{details:'Synthetic failure'}}]}]}}]}]});
  const headers={};
  if(signature) {
    const key=await webcrypto.subtle.importKey('raw',new TextEncoder().encode(f.vars.WA_META_APP_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']);
    headers['x-hub-signature-256']='sha256='+Buffer.from(await webcrypto.subtle.sign('HMAC',key,new TextEncoder().encode(raw))).toString('hex');
  }
  return new Request('https://example.supabase.co/webhook',{method:'POST',headers,body:raw});
}
test('unsigned callbacks cannot change delivery records',async()=>{
  const f=fixture();assert.equal((await f.webhook(await signedRequest(f,{signature:false}))).status,401);assert.equal(f.state.calls.length,0);
});
test('signed callbacks pass provider details to the protected status recorder',async()=>{
  const f=fixture();const response=await f.webhook(await signedRequest(f));assert.equal(response.status,200);
  assert.equal(f.state.calls[0].body.p_error_code,131026);assert.equal(f.state.calls[0].body.p_status,'failed');
});
test('unmatched recipients are ignored by the database result',async()=>{
  const f=fixture();f.state.rpcResult='ignored';assert.deepEqual(await(await f.webhook(await signedRequest(f,{recipient:'15550000002'}))).json(),{ok:true,received:0});
});
test('callbacks arriving before the API response are retried instead of acknowledged',async()=>{
  const f=fixture();f.state.rpcResult='awaiting_api_response';assert.equal((await f.webhook(await signedRequest(f))).status,503);
});
test('unconfigured webhook fails closed',async()=>{
  const f=fixture({WA_META_APP_SECRET:''});assert.equal((await f.webhook(await signedRequest(f,{signature:false}))).status,503);assert.equal(f.state.calls.length,0);
});
