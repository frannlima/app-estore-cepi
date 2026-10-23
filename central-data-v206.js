/* Central de Dados eStore CE+PI v206 — entrada real da Central Administrativa.
   Adapta os fluxos oficiais já presentes em index.html; não altera banco de dados sozinho.
*/
(function(){
"use strict";
if(window.__centralDataV206)return;
window.__centralDataV206=true;
const ID="centralDataV206";
let dailyMarkup="";
function adminAllowed(){
 try{return typeof isAdmin==="function"&&isAdmin()&&typeof isMasterAdmin==="function"&&isMasterAdmin()&&!(typeof isDemo==="function"&&isDemo())}catch(_){return false}
}
function by(id){return document.getElementById(id)}
function safe(v){return String(v??"").replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function css(){
 if(by("centralDataStyleV206"))return;
 const st=document.createElement("style");st.id="centralDataStyleV206";
 st.textContent=[
 "#"+ID+"{--dark:#173f35;--accent:#df8008;display:grid;gap:14px}",
 "#"+ID+" .cdHead206{display:flex;align-items:center;justify-content:space-between;gap:10px}",
 "#"+ID+" .cdHead206 b{font-size:21px;color:var(--dark)}",
 "#"+ID+" .cdTabs206{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}",
 "#"+ID+" .cdTabs206 button{border-radius:10px;border:1px solid #cdd9d2;background:#f5f7f4;color:var(--dark);padding:12px 5px;font-weight:800;font-size:12px}",
 "#"+ID+" .cdTabs206 button.on{background:var(--dark);color:#fff;border-color:var(--dark)}",
 "#"+ID+" .cdPanel206{background:#fff;border:1px solid #e5eae6;border-radius:16px;padding:14px}",
 "#"+ID+" .cdPanel206 h3{font-size:16px;color:var(--dark);margin:0 0 7px}",
 "#"+ID+" .cdPanel206 p{font-size:13px;line-height:1.5;color:#53625c}",
 "#"+ID+" .cdPanel206 input{width:100%;margin:6px 0 12px}",
 "#"+ID+" .cdPanel206 label{font-size:13px;font-weight:700;display:block;margin-top:10px}",
 "#"+ID+" .cdActions206{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}",
 "#"+ID+" .cdActions206 button{min-width:170px;flex:1}",
 "#"+ID+" .cdInfo206{background:#f3f7f3;border-left:3px solid #237b5f;border-radius:9px;padding:10px;font-size:12px;color:#385a4b}",
 "#"+ID+" .cdStatus206{margin-top:9px;font-size:13px;white-space:pre-wrap}",
 "#"+ID+" .cdLegend206{font-size:11px;color:#5c6a64}",
 "@media(max-width:560px){#"+ID+" .cdTabs206{grid-template-columns:repeat(2,minmax(0,1fr))}#"+ID+" .cdTabs206 button{font-size:12px;padding:12px 6px}}"
 ].join("\n");
 document.head.appendChild(st);
}
function addTile(){
 const hub=by("adminHubV205");if(!hub||!adminAllowed())return;
 const grid=hub.querySelector(".adminGrid");if(!grid||grid.querySelector(".centralTileV206"))return;
 const tile=document.createElement("button");
 tile.type="button";tile.className="btn centralTileV206";
 tile.textContent="Central de Dados";
 tile.setAttribute("onclick","adminCentralDataV206();adminJumpV205(this)");
 tile.setAttribute("aria-label","Central de Dados: D-1, acumulados oficiais, BOPIS e histórico");
 tile.style.background="#c87408";
 tile.style.color="#fff";
 grid.insertBefore(tile,grid.firstChild);
 // As ações antigas não desaparecem: passam a ser acessadas pela própria Central.
 for(const b of [...grid.querySelectorAll("button")]){
   if(b!==tile&&["Atualizar Resultados","Comparativo Semanal","Atualizar Metas"].includes((b.textContent||"").trim())){b.hidden=true;b.style.display="none"}
 }
}
function viewDaily(){
 return dailyMarkup+
 '<details class="cdPanel206"><summary>Atualizar metas (quando houver nova referência)</summary><p>Metas continuam na rotina oficial do aplicativo.</p><button type="button" class="btn" onclick="adminTargets()">Abrir metas</button></details>';
}
function viewOfficial(){
 return '<section class="cdPanel206"><h3>Acumulado oficial | Semana e Mês</h3>'+
 '<p>Os valores acumulados de captação, pedidos e share vêm do Power BI. A referência do intervalo não deve somar novamente os D-1 registrados.</p>'+
 '<div class="cdInfo206">Share semanal/mensal: utilize o importador oficial do Painel Executivo. O relatório gerencial de semana para comparação entre filiais pode ser registrado aqui abaixo.</div>'+
 '<div class="cdActions206"><button type="button" class="btn" onclick="centralOpenExecutiveV206()">Abrir importação oficial do Painel Executivo</button>'+
 '<button type="button" class="btn ghost" onclick="adminWeeklyComparisonV70()">Ver Comparativo Semanal</button></div>'+
 '<details style="margin-top:12px"><summary>Importar histórico comparativo semanal</summary>'+
 '<label for="centralWeekDateV206">Início da semana (segunda-feira)</label><input id="centralWeekDateV206" type="date" class="field">'+
 '<label for="centralWeekFileV206">Gerencial semanal (.xlsx)</label><input id="centralWeekFileV206" type="file" class="field" accept=".xlsx,.xls">'+
 '<button type="button" class="btn" id="centralWeekBtnV206" onclick="centralWeeklyImportV206()">Validar e incorporar histórico</button>'+
 '<div id="centralWeekStatusV206" class="cdStatus206" role="status"></div></details>'+
 '</section>';
}
function viewBopis(){
 return '<section class="cdPanel206"><h3>BOPIS | Retira em Loja</h3>'+
 '<p>Importação condicional: somente se houver movimento BOPIS. Mantém o controle de pedidos de retirada e as exclusões de comissões e campanhas conforme as regras vigentes.</p>'+
 '<label for="centralBopisFileV206">Relatório BOPIS</label><input id="centralBopisFileV206" type="file" class="field" accept=".xlsx,.xls,.csv">'+
 '<button class="btn" type="button" id="centralBopisBtnV206" onclick="centralBopisImportV206()">Importar BOPIS</button>'+
 '<div id="centralBopisStatusV206" class="cdStatus206" role="status"></div>'+
 '<p class="cdLegend206">O processamento segue o mesmo serviço BOPIS já utilizado pelo aplicativo. Não é somado uma segunda vez aos totais gerenciais.</p></section>';
}
function viewHistory(){
 return '<section class="cdPanel206"><h3>Histórico e cobertura das bases</h3><p>Consulta de integridade das fontes utilizadas pelo Painel Executivo e pelo Comparativo Semanal. Nenhuma informação é alterada nesta consulta.</p>'+
 '<button class="btn" type="button" onclick="centralAuditV206()">Verificar disponibilidade de dados</button>'+
 '<div id="centralAuditStatusV206" class="cdStatus206" role="status"></div>'+
 '<p class="cdLegend206">A disponibilidade da fonte não equivale a uma conciliação completa de indicadores e comissões.</p></section>';
}
window.centralTabV206=function(which){
 const root=by(ID);if(!root)return;
 const panels={daily:viewDaily,official:viewOfficial,bopis:viewBopis,history:viewHistory};
 root.querySelectorAll(".cdTabs206 button").forEach(function(b){b.classList.toggle("on",b.dataset.mode===which)});
 const slot=by("centralPaneV206");
 if(slot)slot.innerHTML=(panels[which]||panels.daily)();
};
window.adminCentralDataV206=function(){
 if(!adminAllowed())return;
 const target=by("adminWork");if(!target)return;
 css();
 if(typeof window.adminResults==="function"){window.adminResults();dailyMarkup=target.innerHTML}
 else dailyMarkup='<div class="notice">Rotina diária não encontrada.</div>';
 target.innerHTML='<div class="card" id="'+ID+'">'+
 '<div class="cdHead206"><div><b>Central de Dados eStore</b><div class="muted">Importação e conciliação • CE+PI</div></div><span aria-hidden="true" style="font-size:24px">▤</span></div>'+
 '<div class="cdTabs206" role="tablist">'+
 '<button type="button" data-mode="daily" onclick="centralTabV206(\'daily\')">D-1 Diário</button>'+
 '<button type="button" data-mode="official" onclick="centralTabV206(\'official\')">Acumulado Oficial</button>'+
 '<button type="button" data-mode="bopis" onclick="centralTabV206(\'bopis\')">BOPIS</button>'+
 '<button type="button" data-mode="history" onclick="centralTabV206(\'history\')">Histórico e Status</button>'+
 '</div><div id="centralPaneV206"></div></div>';
 window.centralTabV206("daily");
};
window.centralOpenExecutiveV206=function(){
 if(typeof go==="function"){go("executive");setTimeout(function(){if(typeof window.execShowAdminV1==="function")window.execShowAdminV1()},450)}
};
window.centralWeeklyImportV206=async function(){
 if(!adminAllowed())return;
 const date=by("centralWeekDateV206")?.value,file=by("centralWeekFileV206")?.files?.[0],out=by("centralWeekStatusV206"),btn=by("centralWeekBtnV206");
 if(!date||!file){if(out)out.textContent="Informe a semana e anexe o relatório gerencial.";return}
 if(new Date(date+"T12:00:00Z").getUTCDay()!==1){if(out)out.textContent="Selecione uma segunda-feira como início do período.";return}
 if(btn)btn.disabled=true;if(out)out.textContent="Processando histórico semanal...";
 try{
  const fd=new FormData();
  fd.append("action","weekly_history_import");
  fd.append("matricula",String(U.u.id));
  fd.append("password",adminPwd());
  fd.append("week_start",date);
  fd.append("weekly_report",file,file.name);
  const j=await apiForm(fd);if(j?.error)throw Error(j.error);
  if(out)out.textContent=(j.message||"Histórico semanal incorporado.")+" • "+Number(j.stores||0)+" filiais.";
 }catch(e){if(out)out.textContent="Não concluído: "+String(e.message||e)}
 finally{if(btn)btn.disabled=false}
};
window.centralBopisImportV206=async function(){
 if(!adminAllowed())return;
 const f=by("centralBopisFileV206")?.files?.[0],out=by("centralBopisStatusV206"),btn=by("centralBopisBtnV206");
 if(!f){if(out)out.textContent="Selecione o relatório BOPIS.";return}
 if(btn)btn.disabled=true;if(out)out.textContent="Processando BOPIS...";
 try{
  const fd=new FormData();
  fd.append("action","bopis_import");fd.append("matricula",String(U.u.id));fd.append("password",adminPwd());
  fd.append("bopis_report",f,f.name);
  const j=await apiForm(fd);if(j?.error||j?.ok===false)throw Error(j.error||"Não foi possível importar.");
  if(out)out.textContent="BOPIS incorporado: "+Number(j.rows||0)+" registros em "+Number(j.stores||0)+" loja(s). Confira os indicadores de Pool.";
 }catch(e){if(out)out.textContent="Não concluído: "+String(e.message||e)}
 finally{if(btn)btn.disabled=false}
};
window.centralAuditV206=async function(){
 if(!adminAllowed())return;
 const out=by("centralAuditStatusV206");if(!out)return;
 out.textContent="Consultando histórico...";
 const items=[];
 try{
  const r=await fetch("https://fndkjgveeojlywkdrtxe.supabase.co/functions/v1/estore-executive",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"get",matricula:String(U.u.id)}),cache:"no-store"});
  const j=await r.json();if(!r.ok||j?.error)throw Error(j.error||"Falha de consulta.");
  const days=Array.isArray(j.daily)?j.daily:[];
  const benchmarks=Array.isArray(j.benchmarks)?j.benchmarks:[];
  items.push("Gerencial D-1: "+days.length+" data(s) de histórico");
  ["week","month"].forEach(function(p){
   const row=benchmarks.filter(function(x){return x.period===p&&x.regional_share!=null}).sort(function(a,b){return String(b.end_date).localeCompare(String(a.end_date))})[0];
   items.push((p==="week"?"Share semanal":"Share mensal")+": "+(row?"oficial até "+row.end_date:"não localizado"));
  });
 }catch(e){items.push("Painel Executivo: consulta indisponível — "+String(e.message||e))}
 try{
  const j=await api({action:"weekly_history_dashboard",matricula:String(U.u.id)});
  if(j?.error)throw Error(j.error);
  items.push("Comparativo Semanal: histórico consultável");
 }catch(e){items.push("Comparativo Semanal: consulta indisponível — "+String(e.message||e))}
 out.textContent=items.join("\n");
};
function install(){
 // O login ocorre após o carregamento da página; a observação deve começar antes.
 const view=by("view")||by("shell");
 if(!view||window.__centralObserverV206)return;
 window.__centralObserverV206=new MutationObserver(function(){addTile()});
 window.__centralObserverV206.observe(view,{childList:true,subtree:true});
 addTile();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});
else install();
})();
