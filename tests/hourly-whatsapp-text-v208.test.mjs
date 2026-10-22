import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../hourly-live-v200.js',import.meta.url),'utf8');
const start=source.indexOf('function parse(text){');
const end=source.indexOf('window.hourlyParsedPrintV198=parse;',start);
assert.ok(start>=0&&end>start,'Parser do Hora a Hora acessível');
const STORES=['073','084','108','113','138','142','146','175','177','222','238','258','262','314','318','344','350','552'];
function moneyVal(t){
 const clean=String(t||'').replace(/[^\d.,]/g,'');
 return Number(clean.includes(',')?clean.replace(/\./g,'').replace(',','.'):clean);
}
const parse=new Function('STORES','moneyVal',source.slice(start,end)+'return parse;')(STORES,moneyVal);
const cents=amounts=>amounts.reduce((sum,n)=>sum+Math.round(n*100),0);
const sample=[
 '🎯 *META eSTORE | HOJE – 21/10/2026*',
 '🎯 *Meta regional:* R$ 8.566,71',
 '🛍️ *Desafio do dia:* *50 vendas*',
 '*Distribuição por loja:*',
 '- 073 ➜ *5*159,99/79,99',
 '- 084 ➜ *2*',
 '- 108 ➜ *8* 159.98 +69.98+165.99 +195.99 + 305,98',
 '- 113 ➜ *1*','- 138 ➜ *3*','- 142 ➜ *2*','- 146 ➜ *4*','- 175 ➜ *2*',
 '- 177 ➜ *4*209,98/161,99','- 222 ➜ *3*','- 238 ➜ *2*',
 '- 258 ➜ *2* 143,99','- 262 ➜ *3*','- 314 ➜ *2*','- 318 ➜ *2*',
 '- 344 ➜ *2*','- 350 ➜ *3*','- 552 ➜ *2* 71,99/ 98,00',
 '🚀 *eStore CE+PI*'
].join('\n');
test('colagem integral separa as 18 metas das 5 filiais com vendas',()=>{
 const records=parse(sample);
 assert.equal(records.length,18);
 assert.equal(records.filter(x=>x.amounts.length).length,5);
 const expected={'073':23998,'108':89792,'177':37197,'258':14399,'552':16999};
 for(const r of records)assert.equal(cents(r.amounts),expected[r.st]||0,'filial '+r.st);
 assert.equal(records.reduce((total,r)=>total+cents(r.amounts),0),182385);
});
test('quebra de linha soma valores da mesma filial',()=>{
 const rows=parse('- 108 ➜ 8 159.98 +69.98+165.99\n+195.99 +305,98');
 assert.equal(cents(rows[0].amounts),89792);
});
test('meta não vira venda, lojas fora da regional são ignoradas',()=>{
 const rows=parse('- 073 ➜ *5*\n- 109 ➜ *9* 999,99\n- 084 ➜ 2');
 assert.deepEqual(rows.map(r=>r.st),['073','084']);
 assert.ok(rows.every(r=>r.amounts.length===0));
});
test('colagem tolera setas OCR imperfeitas e pontuação decimal mista',()=>{
 const rows=parse('• 108 A 8 159.98\n• 177 > 4 209,98/161,99');
 assert.equal(cents(rows[0].amounts),15998);
 assert.equal(cents(rows[1].amounts),37197);
});
