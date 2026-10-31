const {test}=require("node:test");
const assert=require("node:assert/strict");
const vm=require("node:vm"),fs=require("node:fs"),path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"../meta-upload-compact-v1.js"),"utf8");
const win={},ctx={window:win,Set,Map,Date,Number,String,Array,Math,Promise};
vm.runInNewContext(source,ctx);
const compact=win.EstoreMetaUploadV1.compactRows;
const sheet=(rows,name="Metas")=>({name,rows});
test("mantém datas e filiais, calcula apenas os registros CEPI",()=>{
 const result=compact([sheet([["Data","Loja","Meta Fin"],["01/11/2026","108",300000],["2026-11-02","L073","R$ 180.000,50"],["01/11/2026","999",700000]])]);
 assert.equal(result.rows.length,2);
 assert.equal(result.stores,2);
 assert.equal(result.minDate,"2026-11-01");
 assert.equal(result.maxDate,"2026-11-02");
 assert.equal(result.rows[1][2],180000.5);
});
test("reconhece cabeçalho em outra aba e datas numéricas do Excel",()=>{
 const serial=Math.round((Date.UTC(2026,10,1)-Date.UTC(1899,11,30))/86400000);
 const result=compact([sheet([["Resumo","Valor"],["Total",1]],"Resumo"),sheet([["Meta Novembro"],["Filial","Data","Meta Financeira"],[84,serial,250000]],"Calendário")]);
 assert.equal(result.rows[0][0],"2026-11-01");
 assert.equal(result.rows[0][1],"084");
 assert.equal(result.rows[0][2],250000);
});
test("não inventa datas nem permite divergência na mesma loja e data",()=>{
 assert.throws(()=>compact([sheet([["Data","Loja","Meta Fin"],["31/11/2026",108,300000]])]),/confira Data/);
 assert.throws(()=>compact([sheet([["Data","Loja","Meta Fin"],["01/11/2026",108,300000],["01/11/2026",108,320000]])]),/divergentes/);
});
test("não permite envio sem os três cabeçalhos",()=>{
 assert.throws(()=>compact([sheet([["Filial","Meta eStore"],[108,3000]])]),/cabeçalhos Data, Loja e Meta Fin/);
});
