/* eStore CE+PI | Metas de venda: pré-processamento local para evitar limite de memória na Edge Function.
 * Apenas Data/Loja/Meta Fin são transmitidas; não modifica o banco sem confirmação do servidor.
 */
(function(){
 "use strict";
 if(window.__estoreMetaCompactV1)return;
 window.__estoreMetaCompactV1=true;
 const STORES=new Set(["073","084","108","113","138","142","146","175","177","222","238","258","262","314","318","344","350","552"]);
 const FILE_LIMIT=80*1024*1024;
 const MAX_ROWS=15000;
 let busy=false, xlsxPromise=null;
 const normalized=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
 const safe=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const dateISO=v=>{
   if(v instanceof Date&&!Number.isNaN(v.getTime()))return v.toISOString().slice(0,10);
   if(typeof v==="number"&&Number.isFinite(v)&&v>10000&&v<100000){
     return new Date(Date.UTC(1899,11,30)+Math.round(v)*86400000).toISOString().slice(0,10);
   }
   const s=String(v??"").trim();
   let m=s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
   if(m)return validDate(m[1],m[2],m[3]);
   m=s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:\s*\([^)]+\))?\s*$/);
   if(m)return validDate(m[3],m[2],m[1]);
   return null;
 };
 function validDate(y,m,d){
   const iso=String(y).padStart(4,"0")+"-"+String(m).padStart(2,"0")+"-"+String(d).padStart(2,"0");
   const dt=new Date(iso+"T12:00:00Z");
   return !Number.isNaN(dt.getTime())&&dt.toISOString().slice(0,10)===iso?iso:null;
 }
 const storeCode=v=>{
   if(typeof v==="number"&&Number.isInteger(v))return String(v).padStart(3,"0");
   const s=String(v??"").trim().replace(/^RIA(?:CHUELO)?\s*/i,"").replace(/^FILIAL\s*/i,"");
   const m=s.match(/^L?\s*(\d{1,3})(?:\D|$)/i);
   return m?m[1].padStart(3,"0"):"";
 };
 function amount(v){
   if(typeof v==="number")return Number.isFinite(v)&&v>=0?v:null;
   let s=String(v??"").trim().replace(/R\$/gi,"").replace(/[\s\u00a0]/g,"");
   if(!s)return null;
   if(s.includes(",")&&s.includes(".")){
     const last=s.lastIndexOf(",")>s.lastIndexOf(".")?",":".";
     s=last===","?s.replace(/\./g,"").replace(",","."):s.replace(/,/g,"");
   }else if(s.includes(","))s=s.replace(/\./g,"").replace(",",".");
   else if(/^\d{1,3}(?:\.\d{3})+$/.test(s))s=s.replace(/\./g,"");
   if(!/^\d+(?:\.\d+)?$/.test(s))return null;
   const n=Number(s);return Number.isFinite(n)&&n>=0?n:null;
 }
 function headerCols(row){
   const names=(row||[]).map(normalized);
   const find=(set)=>names.findIndex(v=>set.includes(v));
   const date=find(["data","dia","datameta","datavenda","dataref","datareferencia","dataoperacao"]);
   const store=find(["loja","filial","nloja","numeroloja","numerodaloja","codigoloja","codigodaloja","codigofilial","unidade","store"]);
   const meta=find(["metafin","metafinanceira","metavenda","metavendas","metadiaria","metatotal","meta"]);
   return date<0||store<0||meta<0?null:{date,store,meta};
 }
 function compactRows(sheets){
   const list=[],seen=new Map(),errors=[];let inspected=0,skipped=0,matched=false;
   for(const sheet of sheets){
     const input=Array.isArray(sheet.rows)?sheet.rows:[];
     let h=-1,cols=null;
     for(let i=0;i<Math.min(input.length,75);i++){
       cols=headerCols(input[i]);if(cols){h=i;break}
     }
     if(h<0)continue;
     matched=true;
     for(let i=h+1;i<input.length;i++){
       const row=input[i]||[];
       if(!row.some(v=>v!==null&&v!==undefined&&String(v).trim()!==""))continue;
       const st=storeCode(row[cols.store]);
       if(!STORES.has(st)){skipped++;continue}
       // Exportação oficial contém uma linha Total por filial, não uma meta diária.
       if(/^total(?:\s|$)/i.test(String(row[cols.date]??"").trim())){skipped++;continue}
       const date=dateISO(row[cols.date]),value=amount(row[cols.meta]);
       inspected++;
       if(!date||value===null){errors.push((sheet.name||"Planilha")+" linha "+(i+1)+": confira Data e Meta Fin da filial "+st);continue}
       const id=date+"|"+st;
       const previous=seen.get(id);
       if(previous!==undefined){
         if(Math.abs(previous-value)>.01)errors.push("Metas divergentes para loja "+st+" em "+date);
         continue;
       }
       seen.set(id,value);
       list.push([date,st,Math.round((value+Number.EPSILON)*100)/100]);
       if(list.length>MAX_ROWS)throw new Error("Planilha com mais de "+MAX_ROWS+" metas. Separe por mês.");
     }
   }
   if(!matched)throw new Error("Nenhuma aba contém as colunas Loja, Data/Dia e Meta Fin/Meta Diária.");
   if(errors.length)throw new Error("Metas não enviadas. "+errors.slice(0,3).join("; ")+(errors.length>3?" e mais "+(errors.length-3)+" divergências.":""));
   if(!list.length)throw new Error("Não encontrei metas das filiais CE+PI. Confira Loja, Dia/Data e Meta Diária/Meta Fin.");
   list.sort((a,b)=>a[0].localeCompare(b[0])||a[1].localeCompare(b[1]));
   return {rows:list,stores:new Set(list.map(r=>r[1])).size,minDate:list[0][0],maxDate:list[list.length-1][0],skipped,inspected};
 }
 function sheetJs(){
   if(window.XLSX?.read&&window.XLSX?.write)return Promise.resolve(window.XLSX);
   if(xlsxPromise)return xlsxPromise;
   const urls=[
     "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js",
     "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
   ];
   xlsxPromise=(async()=>{
     for(const url of urls){
       try{
         await new Promise((resolve,reject)=>{
           const script=document.createElement("script");
           script.src=url;script.async=true;script.crossOrigin="anonymous";
           script.onload=()=>resolve();
           script.onerror=()=>{script.remove();reject(new Error("Falha ao carregar leitor Excel"))};
           document.head.appendChild(script);
         });
         if(window.XLSX?.read&&window.XLSX?.write)return window.XLSX;
       }catch(_){}
     }
     throw new Error("Não foi possível carregar o leitor Excel. Verifique a conexão e tente novamente.");
   })().catch(err=>{xlsxPromise=null;throw err});
   return xlsxPromise;
 }
 async function compactWorkbook(file,onStatus){
   if(!file||!/\.xlsx?$/i.test(file.name))throw new Error("Selecione uma planilha Excel .xlsx ou .xls.");
   if(file.size>FILE_LIMIT)throw new Error("Arquivo muito grande (limite de 80 MB). Exporte apenas as metas das lojas e datas necessárias.");
   const XLSX=await sheetJs();
   onStatus("Lendo arquivo Excel no navegador, sem consumir memória do servidor...");
   const binary=new Uint8Array(await file.arrayBuffer());
   const workbook=XLSX.read(binary,{type:"array",dense:true,cellDates:false,cellStyles:false,cellNF:false,bookVBA:false});
   const sheets=[];
   for(const name of workbook.SheetNames){
     const ws=workbook.Sheets[name];
     if(!ws)continue;
     const rows=XLSX.utils.sheet_to_json(ws,{header:1,raw:true,defval:null,blankrows:false});
     if(rows.length)sheets.push({name,rows});
   }
   const result=compactRows(sheets);
   const ws=XLSX.utils.aoa_to_sheet([["Data","Loja","Meta Fin"],...result.rows]);
   const wb=XLSX.utils.book_new();
   XLSX.utils.book_append_sheet(wb,ws,"Metas");
   const bytes=XLSX.write(wb,{bookType:"xlsx",type:"array",compression:true});
   if(bytes.byteLength>2*1024*1024)throw new Error("O arquivo normalizado ficou grande demais. Separe a importação por mês.");
   return {file:new File([bytes],"metas_cepi_normalizadas.xlsx",{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}),result};
 }
 function statusHtml(status,message,kind){
   if(!status)return;
   status.innerHTML='<div class="notice '+(kind||"")+'" role="status" aria-live="polite">'+safe(message)+'</div>';
 }
 window.sendTargets=async function(){
   const file=document.getElementById("metaFile")?.files?.[0];
   const status=document.getElementById("metaStatus");
   const button=status?.closest(".card")?.querySelector('button[onclick*="sendTargets"]');
   if(busy)return;
   if(!file){statusHtml(status,"Selecione o arquivo de metas.", "danger");return}
   const matricula=typeof U!=="undefined"?String(U?.u?.id||""):"";
   if(!matricula){statusHtml(status,"Sessão administrativa indisponível. Entre novamente no app.","danger");return}
   busy=true;
   if(button){button.disabled=true;button.textContent="Preparando metas..."}
   try{
     const prepared=await compactWorkbook(file,msg=>statusHtml(status,msg));
     const v=prepared.result;
     statusHtml(status,v.rows.length+" metas validadas • "+v.stores+" filiais • "+v.minDate+" a "+v.maxDate+". Enviando arquivo reduzido...");
     const password=typeof adminPwd==="function"?adminPwd():"";
     if(!password)throw new Error("Informe a senha administrativa para processar as metas.");
     const form=new FormData();
     form.append("action","meta_update");
     form.append("matricula",matricula);
     form.append("password",password);
     form.append("meta",prepared.file,prepared.file.name);
     const response=await fetch("https://fndkjgveeojlywkdrtxe.supabase.co/functions/v1/estore-api",{
       method:"POST",body:form,cache:"no-store"
     });
     const text=await response.text();
     let data=null;try{data=JSON.parse(text)}catch(_){}
     if(!response.ok||data?.ok===false||data?.error){
       const cause=data?.error||(
         response.status===546?"O serviço ultrapassou o limite de memória.":
         response.status===413?"Arquivo acima do limite do servidor.":
         response.status>=500?"Servidor indisponível (HTTP "+response.status+").":
         "Falha HTTP "+response.status);
       throw new Error(cause);
     }
     if(!data||typeof data.rows!=="number"||data.rows<=0)throw new Error("O servidor não confirmou a incorporação. Confira o histórico antes de reenviar.");
     statusHtml(status,"Metas incorporadas com sucesso: "+data.rows+" linhas, "+data.stores+" filiais, "+data.minDate+" a "+data.maxDate+".", "success");
     try{if(typeof reloadDashboard==="function")await reloadDashboard()}catch(_){
       statusHtml(status,"Metas salvas no servidor, mas a atualização da tela não concluiu. Reabra o app para conferir; não reenvie antes da verificação.","success");
     }
   }catch(error){
     statusHtml(status,"Importação não confirmada: "+String(error?.message||error),"danger");
   }finally{
     busy=false;
     if(button){button.disabled=false;button.textContent="Processar metas"}
   }
 };
 window.EstoreMetaUploadV1={compactRows,dateISO,storeCode,amount,headerCols};
})();
