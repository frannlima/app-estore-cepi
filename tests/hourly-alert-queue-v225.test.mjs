import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pendingNoSale} from '../hourly-alert-queue-v225.mjs';
const now=new Date('2026-10-24T23:13:00Z'); // 20:13 Fortaleza
const date='2026-10-24';
const row=(st,captured,updated_at=null,metaValue=100)=>({st,captured,updated_at,metaValue});
test('no-sale queue excludes stores already captured by supervisors or consolidated input',()=>{
 const rows=[row('073',564.97),row('108',77.98),row('177',479.90),row('238',152.99),row('084',0),row('113',0)];
 assert.deepEqual(pendingNoSale(rows,date,now).map(x=>x.st),['084','113']);
});
test('zero sales recently confirmed by supervisor are not alerted',()=>{
 const rows=[row('073',0,'2026-10-24T22:35:00Z'),row('084',0,'2026-10-24T20:30:00Z')];
 assert.deepEqual(pendingNoSale(rows,date,now).map(x=>x.st),['084']);
});
test('sales reported by WhatsApp but not yet reflected in the total are protected',()=>{
 const rows=[row('073',0),row('108',0)];
 assert.deepEqual(pendingNoSale(rows,date,now,{'073':'sale'}).map(x=>x.st),['108']);
});
test('no false alerts on historical dates, no-meta stores or excluded stores',()=>{
 assert.deepEqual(pendingNoSale([row('073',0)],'2026-10-23',now),[]);
 assert.deepEqual(pendingNoSale([row('089',0),row('084',0,null,0)],date,now),[]);
});
test('pending queue is stable and ordered by filial',()=>{
 assert.deepEqual(pendingNoSale([row('552',0),row('142',0),row('073',0)],date,now).map(x=>x.st),['073','142','552']);
});
