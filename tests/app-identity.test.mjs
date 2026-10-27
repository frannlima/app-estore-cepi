import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../app-identity.js',import.meta.url),'utf8');
function load(config,href='https://frannlima.github.io/app-estore-cepi/?view=home'){
 const ctx=vm.createContext({URL,location:{href,origin:new URL(href).origin},ESTORE_TRANSITION:config});
 vm.runInContext(source,ctx);return ctx.EstoreIdentity;
}
test('preparation preserves old access despite an unapproved destination',()=>{
 const api=load({phase:'preparing',publicBase:'https://app.example.com/'});
 assert.equal(api.active,false);
 assert.equal(api.url('?menu=hourly'),'https://frannlima.github.io/app-estore-cepi/?menu=hourly');
});
test('activation preserves FCA query parameters and fragment',()=>{
 const api=load({phase:'active',publicBase:'https://app.example.com/'});
 assert.equal(api.url('?fca_store=108&fca_week=2026-10-19#priority'),'https://app.example.com/?fca_store=108&fca_week=2026-10-19#priority');
 assert.equal(api.normalize('Acesse https://frannlima.github.io/app-estore-cepi/?view=home'),'Acesse https://app.example.com/?view=home');
});
test('unsafe or malformed destination never replaces working access',()=>{
 for(const publicBase of ['javascript:alert(1)','http://example.com/','https://u:p@example.com/','https://example.com/?token=x','']){
  assert.equal(load({phase:'active',publicBase}).active,false);
 }
});
test('new host works at root and within subdirectories',()=>{
 assert.equal(load({phase:'preparing'},'https://app.example.com/?view=home').url('?menu=hourly'),'https://app.example.com/?menu=hourly');
 assert.equal(load({phase:'active',publicBase:'https://app.example.com/app'}).url('?view=home'),'https://app.example.com/app/?view=home');
});
