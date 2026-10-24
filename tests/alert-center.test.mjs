import {test} from 'node:test';
import assert from 'node:assert/strict';
import {clock,parsePartial,classify,evaluateAlert,recipientBlock,message,STORES} from '../alert-center-core.mjs';
test('Brasília cutoff is 14h, not UTC',()=>{assert.equal(clock(new Date('2026-10-20T16:59:00Z')).hour,13);assert.equal(clock(new Date('2026-10-20T17:00:00Z')).hour,14);});
test('target alone never means sale or confirmed zero',()=>{assert.deepEqual(parsePartial('084 → 2').map(x=>x.status),['missing']);});
test('sale notation after target is recognized for review',()=>{assert.equal(parsePartial('• 108 → 8 695,98+198,98')[0].status,'sale');});
test('exclusions and repeated lines',()=>{assert.equal(parsePartial('089 → 2\n090 → 3\n109 → 4').length,0);assert.equal(parsePartial('108 → 2\n108 → 2 99,99').length,1);assert.equal(STORES.length,18);});
test('print-only sale remains distinguishable from direct store input',()=>{assert.equal(classify({captured:1},'zero'),'group_sale');});
test('group sale with empty app requests data entry, not first sale',()=>{assert.equal(classify({captured:0},'sale'),'group_sale');});
test('unknown stays unclassified without store input',()=>{assert.equal(classify({captured:0},'unknown'),'unknown');});
test('stale zero entry differs from no entry',()=>{assert.equal(classify({captured:0,updated_at:'2026-10-20T14:00:00Z'},'unknown',new Date('2026-10-20T18:00:00Z')),'stale');});
const person={store_code:'108',cargo:'SUPERVISOR COMERCIAL',situacao:'Atividade Normal',eligible_supervisor:true};
test('managers and excluded stores cannot qualify',()=>{assert.match(recipientBlock({store_code_confirmed:'108'},{...person,cargo:'Gerente'}),/Cargo/);assert.match(recipientBlock({store_code_confirmed:'109'},{...person,store_code:'109'}),/Vínculo/);});
test('vacation, missing consent, shift and pilot all block',()=>{assert.match(recipientBlock({store_code_confirmed:'108'}, {...person,situacao:'Ferias Normais'}),/atividade/);assert.match(recipientBlock({store_code_confirmed:'108'},person),/validação/);assert.match(recipientBlock({store_code_confirmed:'108',verification_status:'confirmado'},person),/Jornada/);});
test('message includes input route, date, targets; no invented two-partial claim',()=>{const s=message({name:'Ana Paula',st:'108',meta:1200,orders:6,condition:'missing',date:'2026-10-20',time:'14:00'});assert.match(s,/Olá, Ana!/);assert.match(s,/menu=hourly/);assert.match(s,/somente novos pedidos/);assert.match(s,/20\/10\/2026 às 14:00/);assert.doesNotMatch(s,/duas últimas/);});
test('missing target never displays invented zero target',()=>{assert.match(message({name:'Ana',st:'108',meta:0,orders:0,date:'2026-10-20',time:'14:00'}),/A confirmar no app/);});

test('direct input overrides missing print while it is fresh',()=>{assert.equal(classify({captured:152.99,updated_at:'2026-10-24T17:09:00Z'},'missing',new Date('2026-10-24T17:30:00Z')),'ok');});
test('after one hour direct sale is recorded but the partial is stale',()=>{assert.equal(classify({captured:152.99,updated_at:'2026-10-24T17:09:00Z'},'missing',new Date('2026-10-24T19:34:00Z')),'stale');});
test('zero-sales confirmation updates the clock without creating a sale',()=>{assert.equal(classify({captured:0,updated_at:'2026-10-24T18:20:00Z'},'missing',new Date('2026-10-24T18:30:00Z')),'ok');});
test('print sale recent does not trigger alert',()=>{const {eligible}=evaluateAlert({st:'238',group:'sale',history:[{check_time:'16:30',reviewed_rows:[{st:'238',status:'sale',sale_signature:'15299'}]}],captured:152.99,now:new Date('2026-10-24T19:35:00Z'),date:'2026-10-24'});assert.equal(eligible,false);});
test('print sale older than one hour needs store confirmation',()=>{const {eligible,condition}=evaluateAlert({st:'238',group:'sale',history:[{check_time:'14:00',reviewed_rows:[{st:'238',status:'sale',sale_signature:'15299'}]}],captured:152.99,now:new Date('2026-10-24T19:35:00Z'),date:'2026-10-24'});assert.equal(eligible,true);assert.equal(condition,'group_sale');});

test('new print with a new sale preserves one-hour grace even if store input is old',()=>{const x=evaluateAlert({st:'238',group:'sale',history:[{check_time:'16:30',reviewed_rows:[{st:'238',status:'sale',sale_signature:'15299|10999'}]}],captured:262.98,updated_at:'2026-10-24T17:09:00Z',now:new Date('2026-10-24T19:35:00Z'),date:'2026-10-24'});assert.equal(x.condition,'stale');assert.equal(x.eligible,false);});
