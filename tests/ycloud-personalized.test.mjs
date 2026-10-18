import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {preparePersonalizedDraft, PERSONALIZED_BODY, PERSONALIZED_TEMPLATE, personalizedTemplateDraft, HOURLY_LINK} from '../supabase/functions/_shared/ycloud-personalized.mjs';
const context = () => ({from:'+12025550100',externalId:'synthetic-v2',at:'2026-10-18T17:00:00Z',consecutiveAttention:2,situation:'Sem captação nas duas últimas parciais',
  contact:{store_code:'108',enabled:true,validated_at:'2026-10-01',opt_in_at:'2026-10-01',phone_e164:'+12025550101',matricula:'synthetic-1'},
  collaborator:{store_code:'108',matricula:'synthetic-1',profile_type:'supervisor',situacao:'Atividade Normal',nome:'Alex Exemplo',nome_social:'Ari Exemplo'},
  shift:{store_code:'108',matricula:'synthetic-1',status:'working',start_at:'2026-10-18T13:00:00Z',end_at:'2026-10-18T21:00:00Z'},
  target:{store_code:'108',date:'2026-10-18',amount:1200,orders:6}});
test('V2 personalizes preferred first name, authoritative targets and fixed deep link without sending',()=>{
 const r=preparePersonalizedDraft(context());
 assert.equal(r.mode,'simulation');assert.equal(r.real_messages_sent,0);assert.equal(r.delivery_confirmed,false);
 assert.equal(r.payload.template.name,PERSONALIZED_TEMPLATE);
 const p=r.payload.template.components[0].parameters.map(x=>x.text);
 assert.equal(p.length,7);assert.equal(p[0],'Ari');assert.equal(p[1],'108');assert.match(p[2],/1\.200,00/);assert.equal(p[3],'6');assert.match(p[5],/14:00/);assert.equal(p[6],HOURLY_LINK);
});
test('missing name falls back; personal name is never inferred from phone',()=>{let c=context();delete c.collaborator.nome_social;delete c.collaborator.nome;assert.equal(preparePersonalizedDraft(c).payload.template.components[0].parameters[0].text,'liderança');});
for (const mutate of [c=>c.collaborator.profile_type='gerente',c=>c.contact.opt_in_at=null,c=>c.contact.validated_at=null,c=>c.shift.status='vacation',c=>c.collaborator.matricula='other',c=>c.target.store_code='073',c=>c.target.date='2026-10-17',c=>c.target.orders=0,c=>c.target.amount=NaN,c=>c.consecutiveAttention=1]) test('rejects unsafe context '+mutate.toString(),()=>{const c=context();mutate(c);assert.throws(()=>preparePersonalizedDraft(c));});
for(const store of ['089','090','109'])test('excluded store '+store,()=>{const c=context();c.contact.store_code=store;assert.throws(()=>preparePersonalizedDraft(c));});
test('template fits BODY limit with sequential variables and matching samples',()=>{assert.ok(PERSONALIZED_BODY.length<=1024);const d=personalizedTemplateDraft('synthetic-waba');assert.equal(d.components[0].type,'BODY');assert.equal(d.components[0].example.body_text[0].length,7);assert.deepEqual([...PERSONALIZED_BODY.matchAll(/\{\{(\d)\}\}/g)].map(x=>Number(x[1])),[1,2,3,4,5,6,7]);});
const code=fs.readFileSync(new URL('../alert-deeplink.js',import.meta.url),'utf8');
function browser(search,user){const calls=[];const c={URLSearchParams,location:{search},U:user,go:v=>calls.push(v)};c.window=c;vm.runInNewContext(code,c);return {c,calls};}
test('link waits for login and retains current user/store',()=>{const {c,calls}=browser('?menu=hourly',null);c.go('home');assert.deepEqual(calls,['home']);c.U={u:{st:'073'}};c.go('home');c.go('metas');assert.deepEqual(calls,['home','hourly','metas']);assert.equal(c.U.u.st,'073');});
test('existing session routes directly; invalid routes cannot open admin',()=>{assert.deepEqual(browser('?menu=metas',{u:{st:'108'}}).calls,['metas']);assert.deepEqual(browser('?menu=admin',{u:{}}).calls,[]);});
test('guest stays read-only and does not consume pending destination',()=>{const {c,calls}=browser('?menu=hourly',{u:{},demo:true});c.go('home');assert.deepEqual(calls,['home']);c.U={u:{st:'108'}};c.go('home');assert.equal(calls.at(-1),'hourly');});
