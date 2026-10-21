import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../hourly-workflow-v198.js',import.meta.url),'utf8');
const start=source.indexOf('function parse(text){'),end=source.indexOf('window.hourlyParsedPrintV198=parse;',start);
assert.ok(start>0&&end>start);
const moneyVal=value=>{
 let x=String(value).replace(/[^\d.,]/g,'');
 if(x.includes(','))x=x.replace(/\./g,'').replace(',','.');
 return Number(x);
};
const STORES=['073','084','108','113','138','142','146','175','177','222','238','258','262','314','318','344','350','552'];
const parse=new Function('STORES','moneyVal',source.slice(start,end)+'return parse;')(STORES,moneyVal);
test('meta de pedidos não é captada como venda',()=>{
 const rows=parse('073 ➜ 5\n084 ➜ 2\n113 ➜ 1');
 assert.equal(rows.length,3);
 assert.ok(rows.every(r=>r.amounts.length===0));
});
test('valores anexados ao fim da meta são reconhecidos corretamente',()=>{
 const rows=parse('• 108 ➜ 8 159,98\n• 177 ➜ *4*209,98/161,99');
 assert.deepEqual(rows[0].amounts,[159.98]);
 assert.deepEqual(rows[1].amounts,[209.98,161.99]);
 assert.deepEqual(rows.map(x=>x.goal),[8,4]);
});
test('lojas de fora da regional são ignoradas',()=>{
 const rows=parse('109 ➜ 5 990,99\n089 ➜ 3 200,00\n108 ➜ 8 159,98');
 assert.deepEqual(rows.map(x=>x.st),['108']);
});
test('suporte a texto formatado com metas em negrito',()=>{
 const rows=parse('177 → **4** R$ 209,98 / R$ 161,99');
 assert.deepEqual(rows[0].amounts,[209.98,161.99]);
});
