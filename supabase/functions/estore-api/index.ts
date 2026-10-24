
import { createClient } from "npm:@supabase/supabase-js@2";
import * as XLSX from "npm:xlsx@0.18.5";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};

const url = Deno.env.get("SUPABASE_URL")!;
let secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
if (!secret) {
  try {
    const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
    secret = keys.default || Object.values(keys)[0] || "";
  } catch {}
}
const db = createClient(url, secret, { auth: { persistSession: false } });

const REGIONAL = new Set(["073","084","108","113","138","142","146","175","177","222","238","258","262","314","318","344","350","552"]);
const BASELINE = "2026-09-25";
const PERIODS = ["day","week","month","year"];

const CAMPAIGN_IMAGE_ASSETS:any={
  samsung:[
    "https://images.samsung.com/is/image/samsung/p6pim/br/sm-a075mzkgzto/gallery/br-galaxy-a07-sm-a075-sm-a075mzkgzto-548807702?$1164_776_PNG$="
  ],
  tune720:[
    "https://jbl-harman.in.ua/i/product/1140/640702362ace8.png",
    "https://www.jbl.com.br/dw/image/v2/BFND_PRD/on/demandware.static/-/Sites-masterCatalog_Harman/default/dwbfa524ed/01.JBL_Tune_720BT_ProductImage_Hero_Black.png?sh=535&sw=535"
  ],
  waveBeam2:[
    "https://jbl-harman.in.ua/i/product/1356/67220b8d640f6.png",
    "https://www.jbl.com.br/dw/image/v2/BFND_PRD/on/demandware.static/-/Sites-masterCatalog_Harman/default/dwb3516f7c/01.JBL_Wave%20Beam%202_Product%20Image_Hero_Black.png?sh=535&sw=535"
  ],
  waveBuds2:[
    "https://uk.jbl.com/dw/image/v2/BFND_PRD/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw11b858ba/01.LS_JBL_Wave%20Buds%202_Product%20Image_Hero_Black.png?sh=680&sw=680",
    "https://www.jbl.com.br/dw/image/v2/BFND_PRD/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw11b858ba/01.LS_JBL_Wave%20Buds%202_Product%20Image_Hero_Black.png?sh=535&sw=535"
  ],
  go4:[
    "https://www.jbl.com.br/dw/image/v2/BFND_PRD/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw96fc93ec/JBL_GO_4_HERO_BLACK_48156_x4.png?sh=535&sw=535",
    "https://uk.jbl.com/dw/image/v2/BFND_PRD/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw96fc93ec/JBL_GO_4_HERO_BLACK_48156_x4.png?sh=680&sw=680"
  ],
  tune520:[
    "https://www.jbl.com.br/dw/image/v2/BFND_PRD/on/demandware.static/-/Sites-masterCatalog_Harman/default/dwc23d813b/01.JBL_Tune_520BT_ProductImage_Hero_Black.png?sh=535&sw=535",
    "https://uk.jbl.com/dw/image/v2/BFND_PRD/on/demandware.static/-/Sites-masterCatalog_Harman/default/dwc23d813b/01.JBL_Tune_520BT_ProductImage_Hero_Black.png?sh=680&sw=680"
  ]
};
async function campaignImageResponse(key:string){
  const candidates=CAMPAIGN_IMAGE_ASSETS[key]||[];
  for(const remote of candidates){
    try{
      const r=await fetch(remote,{headers:{
        "User-Agent":"Mozilla/5.0 (compatible; eStore-CEPI/1.0)",
        "Accept":"image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
      }});
      if(!r.ok)continue;
      const type=String(r.headers.get("content-type")||"image/png").split(";")[0];
      if(!type.startsWith("image/"))continue;
      const bytes=await r.arrayBuffer();
      if(bytes.byteLength<1000)continue;
      return new Response(bytes,{status:200,headers:{
        "Access-Control-Allow-Origin":"*",
        "Access-Control-Allow-Methods":"GET, OPTIONS",
        "Content-Type":type,
        "Cache-Control":"public, max-age=86400, s-maxage=86400"
      }});
    }catch{}
  }
  return new Response("Imagem indisponível",{status:404,headers:{
    "Access-Control-Allow-Origin":"*",
    "Content-Type":"text/plain; charset=utf-8",
    "Cache-Control":"no-store"
  }});
}

function json(data:any, status=200){ return new Response(JSON.stringify(data), { status, headers: cors }); }
function safeFileName(s:any){ return String(s||"file").replace(/[^a-zA-Z0-9._-]+/g,"_").slice(-120); }
function dataUrlBytes(dataUrl:string){
  const m=String(dataUrl||"").match(/^data:([^;]+);base64,(.+)$/);
  if(!m) throw new Error("Imagem inválida.");
  const bin=atob(m[2]); const bytes=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
  return {bytes,mime:m[1]};
}
function n(v:any){ const x=Number(v); return Number.isFinite(x)?x:0; }
function stCode(s:any){ const m=String(s||"").match(/^L?(\d{3})\b/); return m?m[1]:""; }
function isoDate(v:any):string {
  if (v instanceof Date) return v.toISOString().slice(0,10);
  if (typeof v === "number") {
    const ms = Date.UTC(1899,11,30) + Math.round(v*86400000);
    return new Date(ms).toISOString().slice(0,10);
  }
  const s=String(v||"").trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0,10);
  const br=s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/); if(br) return br[3]+"-"+br[2]+"-"+br[1];
  return "";
}
function dateObj(s:string){ return new Date(s+"T12:00:00Z"); }
function sameWeek(a:string,b:string){
  const da=dateObj(a), dbb=dateObj(b);
  const mon=(d:Date)=>{ const x=new Date(d); const day=(x.getUTCDay()+6)%7; x.setUTCDate(x.getUTCDate()-day); return x.toISOString().slice(0,10); };
  return mon(da)===mon(dbb);
}
function inPeriod(d:string, period:string, asof:string){
  if(period==="day") return d===asof;
  const dd=dateObj(d), aa=dateObj(asof);
  if(period==="week") return sameWeek(d,asof);
  if(period==="month") return dd.getUTCFullYear()===aa.getUTCFullYear() && dd.getUTCMonth()===aa.getUTCMonth();
  return dd.getUTCFullYear()===aa.getUTCFullYear();
}
function baseIncluded(period:string, asof:string){
  if(period==="day") return asof===BASELINE;
  if(period==="week") return sameWeek(BASELINE,asof);
  if(period==="month") return BASELINE.slice(0,7)===asof.slice(0,7);
  if(period==="year") return BASELINE.slice(0,4)===asof.slice(0,4);
  return false;
}
function commission(d:string,a:number,cfg:any){
  const dt=dateObj(d);
  const active=cfg?.active===true;
  const start=String(cfg?.start||"");
  const end=String(cfg?.end||"");
  const eligible=active && dt.getUTCDay()===1 && (!start||d>=start) && (!end||d<=end);
  return a*(eligible ? n(cfg?.rate||0.10) : 0.03);
}
async function sha256(s:string){
  const b=new TextEncoder().encode(s); const h=await crypto.subtle.digest("SHA-256",b);
  return [...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,"0")).join("");
}
async function getState(keys:string[]){
  const {data,error}=await db.from("app_state").select("key,value").in("key",keys);
  if(error) throw error;
  const o:any={}; for(const r of data||[])o[r.key]=r.value; return o;
}
// Read every page: the Data API limits individual responses to 1,000 rows.
async function allCollaborators(columns="*"){
  const rows:any[]=[];
  const pageSize=500;
  for(let from=0;;from+=pageSize){
    const {data,error}=await db.from("collaborators").select(columns).order("matricula").range(from,from+pageSize-1);
    if(error) throw error;
    const page=data||[];
    rows.push(...page);
    if(page.length<pageSize) break;
  }
  return {data:rows,error:null};
}
async function allUserState(){
  const {data,error}=await db.from("app_state").select("key,value").like("key","users_%");
  if(error) throw error;
  const stores:any={}; for(const r of data||[]) Object.assign(stores,r.value||{});
  const {data:people,error:pe}=await allCollaborators("matricula,nome,store_code,cargo,situacao,profile_type,menu_permissions,is_admin");
  if(pe) throw pe;
  for(const p of people||[]){
    const st=String(p.store_code||"").padStart(3,"0"), id=String(p.matricula||"").trim();
    if(!id||!REGIONAL.has(st)) continue;
    stores[st]=stores[st]||{users:[]}; stores[st].users=Array.isArray(stores[st].users)?stores[st].users:[];
    const idx=stores[st].users.findIndex((u:any)=>String(u.id)===id);
    const lead=["supervisor","gerente"].includes(String(p.profile_type||"").toLowerCase()) || /supervisor|gerente/i.test(String(p.cargo||""));
    const patch={id,name:String(p.nome||"Colaborador").trim()||"Colaborador",st,role:String(p.cargo||"Colaborador"),status:String(p.situacao||"Atividade Normal"),lead,admin:!!p.is_admin,profileType:String(p.profile_type||"colaborador"),menuPermissions:Array.isArray(p.menu_permissions)?p.menu_permissions:[]};
    if(idx>=0) stores[st].users[idx]={...stores[st].users[idx],...patch,lead:(stores[st].users[idx].lead||lead)};
    else stores[st].users.push({...patch,p:{}});
  }
  return stores;
}
function emptyP(){ return {c:0,a:0,o:0,com:0,rr:null,nr:null}; }
function addP(t:any, row:any, d:string, edayCfg:any){
  t.c+=n(row.c); t.a+=n(row.a); t.o+=Math.trunc(n(row.o));
  const dt=dateObj(d),start=String(edayCfg?.start||"2026-08-01"),end=String(edayCfg?.end||"");
  const isE=(edayCfg?.active!==false)&&dt.getUTCDay()===1&&d>=start&&(!end||d<=end);
  t.com+=isE?n(row.a)*n(edayCfg?.rate||0.10):n(row.com);
}
function roundP(x:any){ x.c=+x.c.toFixed(2);x.a=+x.a.toFixed(2);x.com=+x.com.toFixed(2);return x; }
function storeName(base:any, st:string){ return base?.stores?.[st]?.name || ("Filial "+st); }
function eligibleSupervisorRole(role:any){
  const s=String(role||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  return /supervisor/.test(s) && /(operac|eficien|experien|comercial)/.test(s) && !/(servicos|solucoes)/.test(s);
}
function commissionEligibleRole(role:any){
  const s=String(role||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  // Política interna: Intermitentes e Jovens Aprendizes não são elegíveis ao comissionamento.
  return !/(intermitente|aprendiz)/.test(s);
}
const COMMISSION_INELIGIBLE_NOTE="Não elegível a comissionamento por conta da modalidade de contrato e política interna de benefícios.";
async function commissionEligibilityForMatricula(matricula:string){
  if(String(matricula)==="0000000")return {eligible:true,role:"MODO DEMONSTRAÇÃO",reason:""};
  const {data,error}=await db.from("collaborators").select("cargo").eq("matricula",String(matricula)).maybeSingle();
  if(error)throw error;
  const role=String(data?.cargo||"");
  const eligible=commissionEligibleRole(role);
  return {eligible,role,reason:eligible?"":COMMISSION_INELIGIBLE_NOTE};
}

const DEFAULT_HISTORICAL_TICKETS:any={"073":145,"084":256,"108":226,"109":130,"113":162,"138":254,"142":165,"146":147,"175":200,"177":208,"222":177,"238":233,"258":145,"262":257,"314":133,"318":237,"344":230,"350":165,"552":133};

function historicalTicketFromState(state:any,st:string){
  const source=state?.historical_ticket_ytd;
  const values=(source&&typeof source==="object"&&!Array.isArray(source)&&source.values)?source.values:(source||{});
  return n(values?.[st])||n(DEFAULT_HISTORICAL_TICKETS[st])||188;
}
function historicalTicketPayload(state:any){
  const x=state?.historical_ticket_ytd;
  if(x&&typeof x==="object"&&!Array.isArray(x)&&x.values){
    return {...x,values:{...DEFAULT_HISTORICAL_TICKETS,...(x.values||{})}};
  }
  return {values:{...DEFAULT_HISTORICAL_TICKETS},reference_date:"",updated_at:"",updated_by:"",history:[]};
}
async function persistHistoricalTickets(values:any,referenceDate:string,actor:string){
  const currentState=await getState(["historical_ticket_ytd","meta_schedule"]);
  const clean:any={};
  for(const st of REGIONAL){
    const v=n(values?.[st]);
    if(!(v>0))throw new Error("Informe um ticket médio válido para todas as 19 filiais.");
    clean[st]=+v.toFixed(2);
  }
  const ref=/^\d{4}-\d{2}-\d{2}$/.test(String(referenceDate||""))?String(referenceDate):new Date().toISOString().slice(0,10);
  const now=new Date().toISOString();
  const prev=historicalTicketPayload(currentState);
  const history=Array.isArray(prev.history)?prev.history.slice(-23):[];
  history.push({reference_date:ref,values:clean,updated_at:now,updated_by:actor});
  const payload={values:clean,reference_date:ref,updated_at:now,updated_by:actor,history};

  const schedule=currentState.meta_schedule||{};
  for(const d of Object.keys(schedule)){
    for(const st of REGIONAL){
      const row=schedule?.[d]?.[st];
      if(!row)continue;
      const metaEstore=n(row.metaEstore);
      row.metaPedidos=metaEstore>0?Math.ceil(metaEstore/(clean[st]||188)):0;
    }
  }
  const {error:e1}=await db.from("app_state").upsert({key:"historical_ticket_ytd",value:payload,updated_at:now},{onConflict:"key"});
  if(e1)throw e1;
  const {error:e2}=await db.from("app_state").upsert({key:"meta_schedule",value:schedule,updated_at:now},{onConflict:"key"});
  if(e2)throw e2;
  return payload;
}

function storagePathFromPublicUrl(raw:any){
  try{
    const u=new URL(String(raw||""));
    const marker="/storage/v1/object/public/estore-public/";
    const i=u.pathname.indexOf(marker);
    if(i<0)return "";
    return decodeURIComponent(u.pathname.slice(i+marker.length));
  }catch{return ""}
}
async function removeManagedAppMediaIfUnused(oldUrl:string,nextSlots:any){
  if(!oldUrl)return;
  for(const x of Object.values(nextSlots||{}) as any[]){
    if(String(x?.url||"")===oldUrl)return;
  }
  const st=await getState(["institutional_media","important_info","campaigns_config","popup_messages"]);
  const refs=[
    ...(Array.isArray(st.important_info)?st.important_info:[]),
    ...(Array.isArray(st.campaigns_config)?st.campaigns_config:[]),
    ...(Array.isArray(st.popup_messages)?st.popup_messages:[])
  ];
  if(refs.some((x:any)=>String(x?.image_url||"")===oldUrl))return;
  let media=Array.isArray(st.institutional_media)?st.institutional_media:[];
  const hit=media.find((x:any)=>String(x?.url||"")===oldUrl);
  if(!hit)return;
  const path=storagePathFromPublicUrl(oldUrl);
  if(path&&path.startsWith("app-media/")){
    const {error:rm}=await db.storage.from("estore-public").remove([path]);
    if(rm)console.warn("media cleanup",rm.message||rm);
  }
  media=media.filter((x:any)=>String(x?.url||"")!==oldUrl);
  const {error}=await db.from("app_state").upsert({key:"institutional_media",value:media,updated_at:new Date().toISOString()},{onConflict:"key"});
  if(error)throw error;
}
function ritualSupervisorAllowed(ctx:any){
  if(!ctx)return false;
  if(ctx.admin)return true;
  return ctx.profile==="supervisor" || /supervisor/i.test(String(ctx.role||""));
}
function ritualCouponCodes(coupons:any[],date:string){
  return (Array.isArray(coupons)?coupons:[]).filter((x:any)=>{
    if(x?.active===false)return false;
    const start=String(x?.start_at||"").slice(0,10),end=String(x?.end_at||"").slice(0,10);
    if(start&&date<start)return false;
    if(end&&date>end)return false;
    return !!String(x?.code||x?.title||"").trim();
  }).map((x:any)=>String(x.code||x.title||"").trim()).filter(Boolean);
}
async function ritualReference(ctx:any,date:string,requestedStore?:string){
  const st=ctx.admin&&requestedStore&&REGIONAL.has(requestedStore)?requestedStore:String(ctx.st||"").padStart(3,"0");
  if(!REGIONAL.has(st))throw new Error("Filial inválida para o ritual.");
  const state=await getState(["meta_schedule","coupons_config","historical_ticket_ytd"]);
  const metaExpected=+n(state.meta_schedule?.[date]?.[st]?.metaEstore).toFixed(2);
  const ticket=historicalTicketFromState(state,st);
  const orderExpected=metaExpected>0?Math.ceil(metaExpected/ticket):0;

  const [{data:hcRow,error:hcErr},{data:assignments,error:aErr}]=await Promise.all([
    db.from("daily_store_hc").select("*").eq("result_date",date).eq("store_code",st).maybeSingle(),
    db.from("meta_assignments").select("matricula,target,assigned_by,updated_at").eq("result_date",date).eq("store_code",st)
  ]);
  if(hcErr)throw hcErr;if(aErr)throw aErr;
  const hc=Math.trunc(n(hcRow?.hc_available));
  const individualExpected=hc>0?+(metaExpected/hc).toFixed(2):0;

  let deviationExpected:any=null,deviationDate:any=null,capturedRef:any=null,metaRef:any=null;
  const {data:latest,error:lerr}=await db.from("daily_updates").select("result_date,management").lt("result_date",date).order("result_date",{ascending:false}).limit(1);
  if(lerr)throw lerr;
  const last=latest?.[0]||null;
  if(last){
    deviationDate=String(last.result_date||"");
    const row=(Array.isArray(last.management)?last.management:[]).find((x:any)=>String(x.st).padStart(3,"0")===st);
    if(row){
      capturedRef=n(row.c);
      metaRef=n(state.meta_schedule?.[deviationDate]?.[st]?.metaEstore);
      if(metaRef>0)deviationExpected=+(capturedRef-metaRef).toFixed(2);
    }
  }

  const couponExpected=ritualCouponCodes(state.coupons_config||[],date);
  return {st,metaExpected,ticket,orderExpected,hc,individualExpected,assignments:assignments||[],deviationExpected,deviationDate,capturedRef,metaRef,couponExpected};
}

const RITUAL_FREQ_SCORE:any={todos:4,quase:3,metade:2,poucos:1,passou:0};
async function weeklyRitualContext(ctx:any,requestedWeekStart="",requestedStore=""){
  const st=ctx.admin&&requestedStore&&REGIONAL.has(requestedStore)?requestedStore:String(ctx.st||"").padStart(3,"0");
  if(!REGIONAL.has(st))throw new Error("Filial inválida para o Raio-X.");
  const today=fortalezaToday(),currentWeek=weekStartOf(today);
  let weekStart=/^\d{4}-\d{2}-\d{2}$/.test(String(requestedWeekStart||""))?weekStartOf(String(requestedWeekStart)):addIsoDays(currentWeek,-7);
  if(weekStart>=currentWeek)weekStart=addIsoDays(currentWeek,-7);
  const weekEnd=weekEndOf(weekStart),previousWeekStart=addIsoDays(weekStart,-7),previousWeekEnd=weekEndOf(previousWeekStart);
  const weekNumber=isoWeekNumber(weekStart),previousWeekNumber=isoWeekNumber(previousWeekStart);

  const [{data:hist,error:he},{data:allHist,error:ahe},{data:daily,error:de},{data:people,error:pe},{data:assign,error:ae},{data:hourly,error:hoe},{data:fca,error:fe}]=await Promise.all([
    db.from("estore_weekly_history").select("*").in("week_start",[previousWeekStart,weekStart]).eq("store_code",st),
    db.from("estore_weekly_history").select("week_start,store_code,share,captured,orders").in("week_start",[previousWeekStart,weekStart]),
    db.from("daily_collaborator").select("date,matricula,store_code,captured,approved,orders").eq("store_code",st).gte("date",weekStart).lte("date",weekEnd),
    allCollaborators("matricula,nome,store_code,cargo,situacao"),
    db.from("meta_assignments").select("result_date,matricula,target").eq("store_code",st).gte("result_date",weekStart).lte("result_date",weekEnd),
    db.from("hourly_estore").select("result_date,captured,orders,status,deleted_at").eq("store_code",st).gte("result_date",weekStart).lte("result_date",weekEnd).is("deleted_at",null),
    db.from("fca_weekly").select("id,status,root_cause,action_plan,action_owner,action_deadline").eq("week_start",weekStart).eq("store_code",st).order("updated_at",{ascending:false}).limit(1)
  ]);
  if(he)throw he;if(ahe)throw ahe;if(de)throw de;if(pe)throw pe;if(ae)throw ae;if(hoe)throw hoe;if(fe)throw fe;

  const current=(hist||[]).find((x:any)=>String(x.week_start)===weekStart)||null;
  const previous=(hist||[]).find((x:any)=>String(x.week_start)===previousWeekStart)||null;
  const share=current? n(current.share):null,previousShare=previous? n(previous.share):null;
  const shareDelta=share!==null&&previousShare!==null?+(share-previousShare).toFixed(10):null;

  const curMap=new Map((allHist||[]).filter((x:any)=>String(x.week_start)===weekStart&&REGIONAL.has(String(x.store_code))).map((x:any)=>[String(x.store_code),x]));
  const prevMap=new Map((allHist||[]).filter((x:any)=>String(x.week_start)===previousWeekStart&&REGIONAL.has(String(x.store_code))).map((x:any)=>[String(x.store_code),x]));
  const retractions=[...REGIONAL].map(code=>{
    const a:any=curMap.get(code),b:any=prevMap.get(code);
    if(!a||!b)return null;
    const delta=n(a.share)-n(b.share);
    return {st:code,share:n(a.share),previous_share:n(b.share),share_delta:+delta.toFixed(10)};
  }).filter((x:any)=>x&&x.share_delta<0).sort((a:any,b:any)=>a.share_delta-b.share_delta).slice(0,5);
  const priorityIndex=retractions.findIndex((x:any)=>x.st===st);
  const priorityRank=priorityIndex>=0?priorityIndex+1:0;

  const roster=(people||[]).filter((p:any)=>String(p.store_code||"").padStart(3,"0")===st&&!/deslig/i.test(String(p.situacao||""))&&commissionEligibleRole(p.cargo));
  const names=new Map(roster.map((p:any)=>[String(p.matricula),String(p.nome||"Colaborador")]));
  const salesMap=new Map<string,any>();
  for(const r of daily||[]){
    const id=String(r.matricula||"");if(!id)continue;
    const q=salesMap.get(id)||{id,name:names.get(id)||("Matrícula "+id),captured:0,approved:0,orders:0};
    q.captured+=n(r.captured);q.approved+=n(r.approved);q.orders+=Math.trunc(n(r.orders));salesMap.set(id,q);
  }
  const teamRows=roster.map((p:any)=>{
    const id=String(p.matricula),q=salesMap.get(id)||{captured:0,approved:0,orders:0};
    return {id,name:String(p.nome||"Colaborador"),captured:+n(q.captured).toFixed(2),approved:+n(q.approved).toFixed(2),orders:Math.trunc(n(q.orders))};
  }).sort((a:any,b:any)=>b.captured-a.captured);
  const sold=teamRows.filter((x:any)=>x.captured>0),zeros=Math.max(0,teamRows.length-sold.length),participation=teamRows.length?sold.length/teamRows.length:0;
  const top3=sold.slice(0,3);

  const dailyMap=new Map<string,any>();
  for(const r of daily||[]){
    const date=String(r.date||"");const q=dailyMap.get(date)||{date,captured:0,approved:0,orders:0};
    q.captured+=n(r.captured);q.approved+=n(r.approved);q.orders+=Math.trunc(n(r.orders));dailyMap.set(date,q);
  }
  const sundayClosed=new Set(["084","113","146"]);
  const dayRows:any[]=[];
  for(let i=0;i<7;i++){
    const date=addIsoDays(weekStart,i),dow=new Date(date+"T12:00:00Z").getUTCDay();
    if(dow===0&&sundayClosed.has(st))continue;
    const q=dailyMap.get(date)||{date,captured:0,approved:0,orders:0};
    dayRows.push({date,captured:+n(q.captured).toFixed(2),approved:+n(q.approved).toFixed(2),orders:Math.trunc(n(q.orders))});
  }
  const weakest=[...dayRows].sort((a,b)=>a.captured-b.captured||a.orders-b.orders||a.date.localeCompare(b.date))[0]||null;

  const distributionDays=[...new Set((assign||[]).map((x:any)=>String(x.result_date)))].length;
  const hourlyDays=[...new Set((hourly||[]).filter((x:any)=>String(x.status||"active")!=="deleted").map((x:any)=>String(x.result_date)))].length;
  const captured=current? n(current.captured):sold.reduce((s:number,x:any)=>s+n(x.captured),0);
  const approved=current? n(current.approved):sold.reduce((s:number,x:any)=>s+n(x.approved),0);
  const orders=current?Math.trunc(n(current.orders)):sold.reduce((s:number,x:any)=>s+Math.trunc(n(x.orders)),0);
  const ticket=current?n(current.ticket):(orders?captured/orders:0);
  const metaOne=share!==null&&share>0?captured/share*.01:0;
  const gapToOne=share===null?null:+(.01-share).toFixed(10);
  const approvedRate=captured>0?approved/captured:0;

  return {
    st,storeName:String(current?.store_name||("Filial "+st)),today,weekStart,weekEnd,weekNumber,previousWeekStart,previousWeekEnd,previousWeekNumber,
    captured:+captured.toFixed(2),approved:+approved.toFixed(2),approvedRate:+approvedRate.toFixed(4),orders,ticket:+ticket.toFixed(2),metaOne:+metaOne.toFixed(2),
    share,previousShare,shareDelta,gapToOne,targetShare:.01,
    teamTotal:teamRows.length,sold:sold.length,zeros,participation:+participation.toFixed(4),top3,weakestDay:weakest,daily:dayRows,
    distributionDays,hourlyDays,priorityRank,fcaPriority:priorityRank>0,fca:(fca||[])[0]||null
  };
}


async function buildDashboard(matricula:string){
  const state=await getState(["common_base","config","meta_schedule","annual_meta","meta_hc","eday_config","annual_store_actuals_2026","annual_meta_ytd_2026","year_meta_2026","supervisor_share_official"]);
  const base=state.common_base; if(!base) throw new Error("Base inicial não configurada.");
  const storesSeed=await allUserState();
  const allUsers:any[]=[];
  for(const st of Object.keys(storesSeed)) for(const u of (storesSeed[st]?.users||[])) allUsers.push(structuredClone(u));
  const me=allUsers.find(x=>String(x.id)===String(matricula));
  if(!me) return null;

  const {data:ups,error}=await db.from("daily_updates").select("result_date,collaborators,management,imported_at").gt("result_date",BASELINE).order("result_date",{ascending:true});
  if(error) throw error;
  const updates=ups||[];
  const asof=updates.length ? String(updates[updates.length-1].result_date) : BASELINE;
  const updatedAt=updates.length ? String(updates[updates.length-1].imported_at||"") : "";
  const meta=state.meta_schedule||{}; const yearMeta=state.year_meta_2026||{}; const annualMeta=state.annual_meta||{}; const metaHc=state.meta_hc||{};

  // Fonte oficial por colaborador: histórico diário consolidado pelo Tabelão.
  // A base até 25/09/2026 já está em daily_collaborator; cargas futuras são incrementais.
  const dailyPeople:any[]=[];
  for(let from=0;;from+=500){
    const {data:chunk,error:de}=await db.from("daily_collaborator")
      .select("date,matricula,store_code,captured,approved,orders,commission")
      .lte("date",asof).range(from,from+499);
    if(de) throw de;
    dailyPeople.push(...(chunk||[]));
    if(!chunk||chunk.length<500) break;
  }
  const byPerson=new Map<string,any[]>();
  for(const r of dailyPeople){
    const id=String(r.matricula||""); if(!id) continue;
    if(!byPerson.has(id)) byPerson.set(id,[]);
    byPerson.get(id)!.push(r);
  }
  const dynUsers=allUsers.map(u=>{
    const du:any=structuredClone(u); du.p={};
    const mine=byPerson.get(String(u.id))||[];
    for(const p of PERIODS){
      const z=emptyP();
      for(const r of mine){
        const d=String(r.date||""); if(!inPeriod(d,p,asof)) continue;
        addP(z,{c:n(r.captured),a:n(r.approved),o:n(r.orders),com:n(r.commission)},d,state.eday_config||{});
      }
      du.p[p]=roundP(z);
    }
    return du;
  });

  // Regional ranks.
  const regional=dynUsers.filter(u=>REGIONAL.has(u.st));
  const rankMaps:any={};
  const top:any={};
  for(const p of PERIODS){
    const s=[...regional].filter(u=>n(u.p[p].c)>0).sort((a,b)=>(b.p[p].c-a.p[p].c)||String(a.id).localeCompare(String(b.id)));
    rankMaps[p]=new Map(s.map((u,i)=>[String(u.id),i+1]));
    for(const u of regional) u.p[p].rr=n(u.p[p].c)>0?(rankMaps[p].get(String(u.id))||null):null;
    top[p]=s.slice(0,10).map(u=>({id:u.id,name:u.name,st:u.st,c:u.p[p].c,a:u.p[p].a,o:u.p[p].o,rr:u.p[p].rr,nr:u.p[p].nr||null}));
  }

  // Exact national day rank from latest daily report when available.
  if(updates.length){
    const latest=updates[updates.length-1];
    const natMap=new Map<string,number>();
    for(const r of (latest.collaborators||[])) natMap.set(String(r.id),(natMap.get(String(r.id))||0)+n(r.c));
    const vals=[...natMap.entries()].sort((a,b)=>b[1]-a[1]);
    const nr=new Map(vals.map((x,i)=>[x[0],i+1]));
    for(const u of regional) u.p.day.nr=nr.get(String(u.id))||null;
    for(const t of top.day) t.nr=nr.get(String(t.id))||null;
  }

  // Build store metrics and refreshed COMMON.
  const common=structuredClone(base); common.asof=asof; common.top=top; common.regional={}; common.awards={};
  const mgmtByDate:any={}; for(const up of updates){ const m:any={}; for(const r of (up.management||[]))m[r.st]=r; mgmtByDate[String(up.result_date)]=m; }

  function periodMeta(st:string,p:string){
    const bp=base?.stores?.[st]?.p?.[p]||{};
    if(p==="year" && state.annual_meta?.[st]){
      const v=n(state.annual_meta[st].final);
      return {ee:v,ef:v};
    }
    if(p==="month" && asof.slice(0,7)===BASELINE.slice(0,7) && n(bp.ef)>0){
      return {ee:n(bp.ef),ef:n(bp.ef)};
    }
    if(p==="week" && sameWeek(BASELINE,asof) && n(bp.ef)>0){
      return {ee:n(bp.ef),ef:n(bp.ef)};
    }
    if(p==="day"){
      const v=n(meta?.[asof]?.[st]?.metaEstore)||n(bp.ef)||n(bp.ee);
      return {ee:v,ef:v};
    }
    const dates=Object.keys(meta).sort(); let ee=0;
    for(const d of dates){
      if(!inPeriod(d,p,asof)) continue;
      ee+=n(meta[d]?.[st]?.metaEstore);
    }
    if(ee<=0)ee=n(bp.ef)||n(bp.ee);
    return {ee:+ee.toFixed(2),ef:+ee.toFixed(2)};
  }
  function periodShare(st:string,p:string,c:number){
    if(p==="week"||p==="month"){
      let snap:any=null;
      if(p==="week"){
        const wd=new Date(asof+"T12:00:00Z"),dow=wd.getUTCDay()||7;
        wd.setUTCDate(wd.getUTCDate()-dow+1);
        const wk=wd.toISOString().slice(0,10);
        snap=state.supervisor_share_official?.week?.[wk]?.stores;
      }else{
        snap=state.supervisor_share_official?.month?.[asof.slice(0,7)]?.stores;
      }
      if(snap&&Object.prototype.hasOwnProperty.call(snap,st))return n(snap[st]);
    }
    let denom=0;
    if(baseIncluded(p,asof)){
      const bp=base?.stores?.[st]?.p?.[p]; const bc=n(bp?.c), bs=n(bp?.share);
      if(bc>0 && bs>0) denom+=bc/bs;
    }
    for(const up of updates){
      const d=String(up.result_date); if(!inPeriod(d,p,asof))continue;
      const m=mgmtByDate[d]?.[st]; if(m && n(m.c)>0 && n(m.share)>0)denom+=n(m.c)/n(m.share);
    }
    return denom>0 ? c/denom : 0;
  }
  function highlights(st:string,p:string,c:number){
    const bp=base?.stores?.[st]?.p?.[p];
    if(p==="day") return c>0?[[asof,c]]:[];
    if(p==="week"){
      const arr:any[]=(baseIncluded(p,asof)?structuredClone(bp?.hi||[]):[]);
      for(const up of updates){
        const d=String(up.result_date); if(!inPeriod(d,p,asof))continue;
        const cday=(up.collaborators||[]).filter((r:any)=>r.regional==="CE + PI"&&r.st===st).reduce((q:any,r:any)=>q+n(r.c),0);
        if(cday>0) arr.push([d,+cday.toFixed(2)]);
      }
      const uniq=new Map(arr.map(x=>[x[0],x]));
      return [...uniq.values()].sort((a:any,b:any)=>b[1]-a[1]).slice(0,3);
    }
    if(p==="year" && bp?.months){
      const months:any=structuredClone(bp.months);
      for(const up of updates){
        const d=String(up.result_date); if(!inPeriod(d,p,asof))continue;
        const v=(up.collaborators||[]).filter((r:any)=>r.regional==="CE + PI"&&r.st===st).reduce((q:any,r:any)=>q+n(r.c),0);
        const ym=d.slice(0,7); months[ym]=+(n(months[ym])+v).toFixed(2);
      }
      return Object.entries(months).sort((a:any,b:any)=>n(b[1])-n(a[1])).slice(0,3);
    }
    return structuredClone(bp?.hi||[]);
  }

  for(const st of Object.keys(common.stores||{})){
    const users=regional.filter(u=>u.st===st);
    common.stores[st].p=common.stores[st].p||{};
    for(const p of PERIODS){
      const annualActual=p==="year"?state.annual_store_actuals_2026?.[st]:null;
      let c=0,a=0,o=0;
      if(annualActual){
        c=n(annualActual.c); a=n(annualActual.a); o=Math.trunc(n(annualActual.o));
      }else{
        const bp=base?.stores?.[st]?.p?.[p];
        if(baseIncluded(p,asof) && bp){
          c=n(bp.c); a=n(bp.a); o=Math.trunc(n(bp.o));
        }
        for(const up of updates){
          const d=String(up.result_date); if(!inPeriod(d,p,asof))continue;
          const m=mgmtByDate[d]?.[st]; if(!m)continue;
          c+=n(m.c); a+=n(m.a); o+=Math.trunc(n(m.o));
        }
      }
      const mm=periodMeta(st,p), share=annualActual?n(annualActual.share):periodShare(st,p,c), att=mm.ee>0?c/mm.ee:0;
      const top3=[...users].sort((x,y)=>y.p[p].c-x.p[p].c).filter(x=>x.p[p].c>0).slice(0,3).map(u=>({id:u.id,name:u.name,c:u.p[p].c,a:u.p[p].a,o:u.p[p].o}));
      common.stores[st].p[p]={c:+c.toFixed(2),a:+a.toFixed(2),o,share,ee:mm.ee,ef:mm.ef,att,gap:+(c-mm.ee).toFixed(2),left:+Math.max(mm.ef-c,0).toFixed(2),hi:highlights(st,p,c),top:top3};
    }
  }

  for(const p of PERIODS){
    const arr=Object.keys(common.stores).map(st=>{
      const x=common.stores[st].p[p];return {st,c:x.c,a:x.a,o:x.o,share:x.share,att:x.att,ee:x.ee,ef:x.ef,gap:x.gap,left:x.left};
    });
    common.regional[p]=arr;
    const active=arr.filter(x=>x.c>0);
    common.awards[p]={
      share:[...active].sort((a,b)=>b.share-a.share)[0]||null,
      sales:[...active].sort((a,b)=>b.c-a.c)[0]||null,
      att:[...active].sort((a,b)=>b.att-a.att)[0]||null
    };
  }

  const meDyn=regional.find(u=>String(u.id)===String(matricula))!;
  const team:any={};
  // Ranking da filial é visível para todos os perfis; permissões de gestão continuam separadas no frontend/backend.
  for(const p of PERIODS){
    team[p]=regional.filter(u=>u.st===meDyn.st && !/ferias/i.test(String(u.status||""))).map(u=>({id:u.id,name:u.name,c:u.p[p].c,a:u.p[p].a,o:u.p[p].o,rr:u.p[p].rr,nr:u.p[p].nr,status:u.status}));
  }
  const eligible=(base?.stores?.[meDyn.st]?.sup||[]).filter((u:any)=>/supervisor/i.test(String(u.role||'')) && /(efici|opera|experi|comercial)/i.test(String(u.role||'')));
  const approvedMonth=common.stores?.[meDyn.st]?.p?.month?.a||0;
  const isConfiguredAdmin=await adminAllowed(matricula);
  meDyn.admin=isConfiguredAdmin;
  const pool=(meDyn.lead||meDyn.admin)?{approved:approvedMonth,pool:approvedMonth*.03,eligible:eligible.map(u=>({id:u.id,name:u.name})),sim:eligible.length?approvedMonth*.03/eligible.length:0}:null;

  const {data:accessRow}=await db.from("collaborators").select("profile_type,menu_permissions").eq("matricula",String(meDyn.id)).maybeSingle();
  const next=new Date(asof+"T12:00:00Z"); next.setUTCDate(next.getUTCDate()+1);
  const nextDate=next.toISOString().slice(0,10);
  return {
    asof,
    updatedAt,
    common,
    user:{u:{id:meDyn.id,name:meDyn.name,st:meDyn.st,role:meDyn.role,status:meDyn.status},p:meDyn.p,lead:(!!meDyn.lead||isConfiguredAdmin),admin:isConfiguredAdmin,profileType:accessRow?.profile_type||"colaborador",menuPermissions:accessRow?.menu_permissions||[],team,pool,nextDayMeta:n(meta[nextDate]?.[meDyn.st]?.metaEstore),nextDay:nextDate,hcSchedule:metaHc},
  };
}

function sheetRows(file:File){
  return file.arrayBuffer().then(buf=>{
    const wb=XLSX.read(new Uint8Array(buf),{type:"array",cellDates:false});
    const ws=wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(ws,{defval:null,raw:true}) as any[];
  });
}
function normalizedHeader(k:any){return String(k??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");}
function pick(r:any,...keys:string[]){
  for(const k of keys)if(r[k]!==undefined&&r[k]!==null)return r[k];
  const wanted=new Set(keys.map(normalizedHeader));
  for(const [k,v] of Object.entries(r||{}))if(v!==null&&v!==undefined&&wanted.has(normalizedHeader(k)))return v;
  return null;
}
function isCePiRegion(v:any){return String(v??"").normalize("NFKC").toUpperCase().replace(/\s+/g,"").replace(/[^A-Z]/g,"")==="CEPI";}

async function adminAllowed(matricula:string){ return String(matricula||"").trim()==="2457695"; }
async function demoSourceMatricula(){
  const st=await getState(["config"]);
  return String(st.config?.admin_matricula||"2457695");
}
async function actorContext(matricula:string){
  const id=String(matricula||"").trim();
  if(id==="0000000")return {id,st:"108",name:"VISITANTE • DEMONSTRAÇÃO",role:"SUPERVISOR • MODO DEMONSTRAÇÃO",profile:"supervisor",lead:true,admin:true,status:"Ativo",demo:true};
  if(!/^\d+$/.test(id))return null;
  const {data,error}=await db.from("collaborators").select("matricula,store_code,nome,cargo,situacao,profile_type,eligible_supervisor,is_admin").eq("matricula",id).maybeSingle();
  if(error)throw error;
  const admin=await adminAllowed(id);
  if(!data && !admin)return null;
  const profile=String(data?.profile_type||"").toLowerCase();
  const lead=admin || profile==="supervisor" || profile==="gerente" || /supervisor|gerente/i.test(String(data?.cargo||""));
  return {id,st:String(data?.store_code||"").padStart(3,"0"),name:String(data?.nome||"Administrador"),role:String(data?.cargo||""),profile,lead,admin,status:String(data?.situacao||"")};
}
async function adminOk(matricula:string,password:string){
  if(!(await adminAllowed(matricula)))return false;
  const st=await getState(["config"]); const c=st.config||{};
  return (await sha256(password||""))===String(c.admin_hash||"");
}

function weekStartOf(date:string){
  const d=new Date(String(date)+"T12:00:00Z"),dow=d.getUTCDay()||7;
  d.setUTCDate(d.getUTCDate()-dow+1);
  return d.toISOString().slice(0,10);
}
function weekEndOf(start:string){
  const d=new Date(String(start)+"T12:00:00Z");d.setUTCDate(d.getUTCDate()+6);return d.toISOString().slice(0,10);
}
function addIsoDays(date:string,days:number){
  const d=new Date(String(date)+"T12:00:00Z");d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10);
}
function fortalezaToday(){
  return new Intl.DateTimeFormat("en-CA",{timeZone:"America/Fortaleza",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
}
function isoWeekNumber(date:string){
  const d=new Date(String(date)+"T12:00:00Z"),x=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()));
  const day=x.getUTCDay()||7;x.setUTCDate(x.getUTCDate()+4-day);
  const y0=new Date(Date.UTC(x.getUTCFullYear(),0,1));
  return Math.ceil((((x.getTime()-y0.getTime())/86400000)+1)/7);
}
function fcaFactorLabel(key:string){
  const m:any={
    interface_sistemica:"Problema de interface sistêmica",
    app_mobile_instabilidade:"App/eStore (Mobile) com instabilidade",
    perda_venda:"Perda de venda por indisponibilidade/erro sistêmico",
    cupom_desconto:"Problema na aplicação de cupom/desconto",
    estoque_online:"Indisponibilidade do produto no estoque online",
    aprovacao_pagamento:"Problema na aprovação/pagamento do pedido",
    prazo_entrega:"Prazo de entrega questionado",
    outro_externo:"Outro fator externo",
    abordagem_script:"Dificuldade na abordagem e script de atendimento",
    manuseio_estore:"Dificuldade no manuseio da ferramenta eStore",
    distribuicao_meta:"Oportunidade no alinhamento/distribuição de meta",
    alta_dispersao:"Alto percentual de dispersão",
    baixa_mobilizacao:"Baixa mobilização do time",
    outras_prioridades:"Foco em outras prioridades da operação",
    outro_operacional:"Outra oportunidade operacional"
  };
  return m[String(key)]||String(key||"");
}
async function weeklyHistoryDashboard(currentRequested?:string,previousRequested?:string){
  const {data,error}=await db.from("estore_weekly_history").select("*").order("week_start",{ascending:true}).order("store_code",{ascending:true});
  if(error)throw error;
  const rows=data||[],byWeek=new Map<string,any[]>();
  for(const r of rows){const k=String(r.week_start);if(!byWeek.has(k))byWeek.set(k,[]);byWeek.get(k)!.push(r)}
  const starts=[...byWeek.keys()].sort();
  const current=starts.includes(String(currentRequested||""))?String(currentRequested):starts[starts.length-1]||"";
  const ci=starts.indexOf(current);
  const previous=starts.includes(String(previousRequested||""))?String(previousRequested):(ci>0?starts[ci-1]:"");
  function weekSummary(start:string){
    const rr=byWeek.get(start)||[],regional=rr.find((x:any)=>x.store_code==="REGIONAL")||null,stores=rr.filter((x:any)=>REGIONAL.has(String(x.store_code)));
    return {start,end:regional?.week_end||stores[0]?.week_end||weekEndOf(start),week_number:regional?.week_number||stores[0]?.week_number||isoWeekNumber(start),
      stores:stores.length,missing:[...REGIONAL].filter(st=>!stores.some((x:any)=>String(x.store_code)===st)),
      share:regional? n(regional.share):null,captured:regional? n(regional.captured):stores.reduce((a:number,x:any)=>a+n(x.captured),0),
      orders:regional?Math.trunc(n(regional.orders)):stores.reduce((a:number,x:any)=>a+Math.trunc(n(x.orders)),0),
      source_filename:regional?.source_filename||stores[0]?.source_filename||"",source_type:regional?.source_type||stores[0]?.source_type||"gerencial_semanal"};
  }
  const curRows=byWeek.get(current)||[],prevRows=byWeek.get(previous)||[],cm=new Map(curRows.map((x:any)=>[String(x.store_code),x])),pm=new Map(prevRows.map((x:any)=>[String(x.store_code),x]));
  const comparisons=[...REGIONAL].map(st=>{
    const c:any=cm.get(st)||null,p:any=pm.get(st)||null;
    const comparable=!!c&&!!p,delta=comparable?+(n(c.share)-n(p.share)).toFixed(10):null;
    return {st,store_name:String(c?.store_name||p?.store_name||""),current_share:c?n(c.share):null,previous_share:p?n(p.share):null,delta,
      current_captured:c?n(c.captured):null,previous_captured:p?n(p.captured):null,current_orders:c?Math.trunc(n(c.orders)):null,previous_orders:p?Math.trunc(n(p.orders)):null,
      comparable,status:!comparable?"sem_dado":Math.abs(delta!)<0.0000005?"estavel":delta!>0?"evolucao":"retracao"};
  });
  const comparable=comparisons.filter(x=>x.comparable);
  const retractions=comparable.filter(x=>(x.delta||0)<0).sort((a,b)=>(a.delta||0)-(b.delta||0));
  const evolutions=comparable.filter(x=>(x.delta||0)>0).sort((a,b)=>(b.delta||0)-(a.delta||0));
  const cur=weekSummary(current),prev=weekSummary(previous);
  return {weeks:starts.map(x=>weekSummary(x)).reverse(),current:cur,previous:prev,
    regional_delta:cur.share!==null&&prev.share!==null?+(cur.share-prev.share).toFixed(10):null,
    comparisons,top_retractions:retractions.slice(0,5),top_evolutions:evolutions.slice(0,5),
    summary:{comparable:comparable.length,evolved:evolutions.length,retracted:retractions.length,stable:comparable.filter(x=>x.status==="estavel").length,missing:comparisons.filter(x=>!x.comparable).length}};
}

function normalizeWeeklyShare(v:any){
  let x=n(v); if(x>1)x=x/100; return Number.isFinite(x)&&x>=0&&x<=1?+x.toFixed(10):null;
}

async function fcaWeekMetrics(start:string,end:string,state:any){
  const base=state.common_base||{},metaSchedule=state.meta_schedule||{},shareOfficial=state.supervisor_share_official||{};
  const rows:any={};
  for(const st of REGIONAL)rows[st]={st,captured:0,orders:0,denom:0,meta:0,share:0,source:"calculado"};
  const {data:weeklyHistory,error:weeklyHistoryError}=await db.from("estore_weekly_history").select("*").eq("week_start",start);
  if(weeklyHistoryError)throw weeklyHistoryError;
  const weeklyHistoryMap=new Map((weeklyHistory||[]).filter((x:any)=>REGIONAL.has(String(x.store_code))).map((x:any)=>[String(x.store_code),x]));
  const weeklyRegional=(weeklyHistory||[]).find((x:any)=>String(x.store_code)==="REGIONAL")||null;

  const baselineWeek=weekStartOf(BASELINE);
  if(start===baselineWeek && start<=BASELINE && end>=BASELINE){
    for(const st of REGIONAL){
      const p=base?.stores?.[st]?.p?.week||{};
      rows[st].captured+=n(p.c);
      rows[st].orders+=Math.trunc(n(p.o));
      if(n(p.c)>0&&n(p.share)>0)rows[st].denom+=n(p.c)/n(p.share);
    }
  }

  // Uma única base de captação por período: gerencial da loja, nunca soma dos vendedores.
  // O histórico mensal possui uma curva de captação por semana para semanas antigas,
  // mas NÃO contém o denominador da venda total da filial; portanto não certifica share.
  const historicalWeeklySources=new Set<string>();
  if(start<baselineWeek&&start.slice(0,7)===BASELINE.slice(0,7)){
    const label="Semana "+isoWeekNumber(start);
    for(const st of REGIONAL){
      const history=base?.stores?.[st]?.p?.month?.hi;
      const found=Array.isArray(history)?history.find((r:any)=>Array.isArray(r)&&String(r[0])===label):null;
      if(found&&Number.isFinite(Number(found[1]))&&Number(found[1])>=0){
        rows[st].captured=n(found[1]);
        rows[st].source="Gerencial histórico: captação semanal";
        rows[st].historical_volume=true;
        historicalWeeklySources.add(st);
      }
    }
  }
  const denominatorsByDay=new Map<string,Set<string>>();
  const observedByDay=new Map<string,Set<string>>();
  const storeDailyCapture=new Map<string,number>();
  const updateStart=start===baselineWeek?addIsoDays(BASELINE,1):start;
  const seenDates=new Set<string>();
  if(updateStart<=end){
    const {data:ups,error}=await db.from("daily_updates")
      .select("result_date,management,management_mode")
      .gte("result_date",updateStart).lte("result_date",end)
      .order("result_date",{ascending:true});
    if(error)throw error;
    for(const up of ups||[]){
      if(String(up.management_mode||"daily")!=="daily")continue;
      seenDates.add(String(up.result_date));
      for(const r of up.management||[]){
        const st=String(r.st||"").padStart(3,"0");
        if(!REGIONAL.has(st))continue;
        if(!observedByDay.has(st))observedByDay.set(st,new Set());
        observedByDay.get(st)!.add(String(up.result_date));
        // Fontes de captação gerencial prevalecem sobre vendas por matrícula.
        // Para semanas históricas cujo volume já foi consolidado no gerencial mensal,
        // não somar novamente os lançamentos diários.
        if(!historicalWeeklySources.has(st))rows[st].captured+=n(r.c);
        rows[st].orders+=Math.trunc(n(r.o));
        const physicalSale=n(r.store_sales??r.storeSales??r.venda_loja??r.vendaLoja);
        if(physicalSale>0){
          rows[st].denom+=physicalSale;
          if(!denominatorsByDay.has(st))denominatorsByDay.set(st,new Set());
          denominatorsByDay.get(st)!.add(String(up.result_date));
        }else if(n(r.c)>0&&n(r.share)>0){
          rows[st].denom+=n(r.c)/n(r.share);
          if(!denominatorsByDay.has(st))denominatorsByDay.set(st,new Set());
          denominatorsByDay.get(st)!.add(String(up.result_date));
        }else{
          // Loja zerada tambem possui venda fisica; meta diaria e estimativa provisoria.
          const estimatedStoreSales=n(metaSchedule?.[String(up.result_date)]?.[st]?.metaVenda);
          if(estimatedStoreSales>0){
            rows[st].denom+=estimatedStoreSales;
            rows[st].estimated_denom=true;
          }
        }
      }
    }
  }

  for(const d of Object.keys(metaSchedule)){
    if(d<start||d>end)continue;
    for(const st of REGIONAL)rows[st].meta+=n(metaSchedule?.[d]?.[st]?.metaEstore);
  }
  if(start===baselineWeek){
    for(const st of REGIONAL)if(!(rows[st].meta>0))rows[st].meta=n(base?.stores?.[st]?.p?.week?.ef||base?.stores?.[st]?.p?.week?.ee);
  }

  const officialCandidate=shareOfficial?.week?.[start]||null;
  // Referencia datada vale somente para o recorte correspondente.
  const official=officialCandidate?.asof&&String(officialCandidate.asof)!==end?null:officialCandidate;
  for(const st of REGIONAL){
    let share=rows[st].denom>0?rows[st].captured/rows[st].denom:0;
    if(official?.stores&&Object.prototype.hasOwnProperty.call(official.stores,st)){
      share=n(official.stores[st]);rows[st].source=String(official.source||"Relatório gerencial semanal");
    }
    rows[st].share=+share.toFixed(10);
    const approvedOfficial=!!official?.stores&&Object.prototype.hasOwnProperty.call(official.stores,st);
    const measuredDates=denominatorsByDay.get(st)||new Set<string>();
    const baseSpan=(start===baselineWeek&&String(base.asof||"")===BASELINE&&n(base?.stores?.[st]?.p?.week?.share)>0)?Math.max(0,Math.min(7,Math.round((Date.parse(BASELINE)-Date.parse(start))/86400000)+1)):0;
    const allDaysProven=(measuredDates.size+baseSpan)>=7;
    // Share calculado é homologável automaticamente somente quando todas as vendas
    // físicas dos 7 dias estão comprovadas, inclusive dias sem captação eStore.
    rows[st].verified=approvedOfficial||(allDaysProven&&rows[st].denom>0);
    rows[st].share_source=approvedOfficial?"gerencial_semanal_oficial":rows[st].verified?"gerencial_diario_completo":"parcial_nao_homologado";
    rows[st].denominator_covered_days=measuredDates.size+baseSpan;
    const baselineStorePresent=!!base?.stores?.[st]?.p?.week;
    const datesCovered=observedByDay.get(st)||new Set<string>();
    const hasSevenDaily=[...Array(7)].every((_,i)=>datesCovered.has(addIsoDays(start,i)));
    const baselineCovered=start===baselineWeek&&baselineStorePresent&&
      [...Array(7-Math.max(0,Math.min(7,baseSpan)))].every((_,i)=>datesCovered.has(addIsoDays(BASELINE,i+1)));
    rows[st].captured_covered=!!rows[st].historical_volume||hasSevenDaily||baselineCovered;
    const weeklyOfficial:any=weeklyHistoryMap.get(st)||null;
    if(weeklyOfficial){
      rows[st].captured=n(weeklyOfficial.captured);
      rows[st].orders=Math.trunc(n(weeklyOfficial.orders));
      rows[st].share=n(weeklyOfficial.share);
      rows[st].source="Histórico semanal oficial • Gerencial";
      rows[st].verified=true;
      rows[st].share_source="historico_semanal_oficial";
      rows[st].captured_covered=true;
      rows[st].weekly_history=true;
    }
    rows[st].captured=+n(rows[st].captured).toFixed(2);
    rows[st].orders=Math.trunc(n(rows[st].orders));
    rows[st].meta=+n(rows[st].meta).toFixed(2);
    rows[st].financial_gap=+(rows[st].captured-rows[st].meta).toFixed(2);
    rows[st].ticket=rows[st].orders>0?+(rows[st].captured/rows[st].orders).toFixed(2):0;
  }

  let regionalCaptured=0,regionalOrders=0,regionalMeta=0,regionalDenom=0;
  for(const st of REGIONAL){
    regionalCaptured+=rows[st].captured;regionalOrders+=rows[st].orders;regionalMeta+=rows[st].meta;regionalDenom+=rows[st].denom;
  }
  let regionalShare=regionalDenom>0?regionalCaptured/regionalDenom:0;
  if(official?.regional_share!==undefined)regionalShare=n(official.regional_share);
  if(weeklyRegional){
    regionalCaptured=n(weeklyRegional.captured);
    regionalOrders=Math.trunc(n(weeklyRegional.orders));
    regionalShare=n(weeklyRegional.share);
  }
  return {
    start,end,stores:rows,
    regional:{
      captured:+regionalCaptured.toFixed(2),orders:regionalOrders,meta:+regionalMeta.toFixed(2),
      financial_gap:+(regionalCaptured-regionalMeta).toFixed(2),
      share:+regionalShare.toFixed(10),
      ticket:regionalOrders>0?+(regionalCaptured/regionalOrders).toFixed(2):0
    },
    source:official?String(official.source||"Relatório gerencial semanal"):"Gestão/Lojas consolidado",
    coverage:{
      daily_dates:[...seenDates].sort(),
      baseline_days:(start===baselineWeek&&String(base.asof||"")===BASELINE)?Math.max(0,Math.min(7,Math.round((Date.parse(BASELINE)-Date.parse(start))/86400000)+1)):0,
      official_stores:[...REGIONAL].filter(st=>Object.prototype.hasOwnProperty.call(official?.stores||{},st)).length,
      regional_share_official:typeof official?.regional_share==="number"&&Number.isFinite(official.regional_share),
      historical_full:weeklyHistoryMap.size>=18||(seenDates.size+((start===baselineWeek&&String(base.asof||"")===BASELINE)?Math.max(0,Math.min(7,Math.round((Date.parse(BASELINE)-Date.parse(start))/86400000)+1)):0))===7,
      weekly_history_stores:weeklyHistoryMap.size,
      weekly_volume_history_stores:historicalWeeklySources.size,
      share_verified_stores:[...REGIONAL].filter(st=>!!rows[st].verified).length,
      missing_share_stores:[...REGIONAL].filter(st=>!rows[st].verified)
    }
  };
}
function fcaStoreExecutive(item:any,metric:any){
  if(!item)return "";
  const factors=[...(item.external_factors||[]),...(item.operational_factors||[])].map(fcaFactorLabel).filter(Boolean);
  const cause=String(item.root_cause||item.treatment||"").trim();
  const action=String(item.action_plan||"").trim();
  const parts=[
    "Share passou de "+(n(item.previous_share)*100).toFixed(2).replace(".",",")+"% para "+(n(item.share)*100).toFixed(2).replace(".",",")+"%, variação de "+((n(item.share_delta)*100)>=0?"+":"")+(n(item.share_delta)*100).toFixed(2).replace(".",",")+" p.p."
  ];
  if(factors.length)parts.push("Fatores apontados: "+factors.slice(0,3).join("; ")+(factors.length>3?" e outros":"")+".");
  if(cause)parts.push("Causa raiz: "+cause.replace(/\s+/g," ").slice(0,360)+".");
  if(action)parts.push("Plano de reversão: "+action.replace(/\s+/g," ").slice(0,360)+".");
  if(item.action_owner)parts.push("Responsável: "+String(item.action_owner)+(item.action_deadline?" • prazo "+String(item.action_deadline).split("-").reverse().join("/"):"")+".");
  if(n(item.system_impact_amount)>0)parts.push("Impacto sistêmico estimado informado: R$ "+n(item.system_impact_amount).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})+".");
  return parts.join(" ");
}
function fcaDistribution(records:any[],field:string){
  const m=new Map<string,number>();
  for(const r of records)for(const k of (Array.isArray(r?.[field])?r[field]:[]))m.set(String(k),(m.get(String(k))||0)+1);
  const total=Math.max(1,records.length);
  return [...m.entries()].map(([key,count])=>({key,label:fcaFactorLabel(key),count,pct:count/total})).sort((a,b)=>b.count-a.count||a.label.localeCompare(b.label,"pt-BR"));
}
function fcaRegionalExecutive(closed:any,previous:any,prioritized:any[],submitted:any[]){
  const delta=n(closed.regional.share)-n(previous.regional.share);
  const ext=fcaDistribution(submitted,"external_factors"),op=fcaDistribution(submitted,"operational_factors");
  const top=[ext[0]?.label,op[0]?.label].filter(Boolean);
  const systemic=submitted.filter(x=>["sim","parcialmente"].includes(String(x.system_impact))).length;
  const impact=submitted.reduce((s,x)=>s+n(x.system_impact_amount),0);
  let txt="A Regional CE+PI fechou a semana "+isoWeekNumber(closed.start)+" com share de "+(n(closed.regional.share)*100).toFixed(2).replace(".",",")+"%, ";
  txt+=(delta>=0?"evolução de ":"retração de ")+Math.abs(delta*100).toFixed(2).replace(".",",")+" p.p. frente à semana "+isoWeekNumber(previous.start)+". ";
  txt+=prioritized.length+" loja"+(prioritized.length===1?" foi priorizada":"s foram priorizadas")+" pelas maiores retrações de share.";
  if(submitted.length)txt+=" "+submitted.length+" FCA"+(submitted.length===1?" foi concluída":"s foram concluídas")+(top.length?", com maior recorrência em "+top.join(" e "):"")+".";
  if(systemic)txt+=" "+systemic+" tratativa"+(systemic===1?" registrou":"s registraram")+" impacto sistêmico"+(impact>0?", com impacto potencial informado de R$ "+impact.toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2}):"")+".";
  return txt;
}
async function fcaWeeklyData(matricula:string){
  const ctx=await actorContext(matricula);
  if(!ctx||(!ctx.lead&&!ctx.admin))throw new Error("Acesso exclusivo para supervisores e gestores.");
  const sourceMatricula=String(matricula)==="0000000"?await demoSourceMatricula():matricula;
  const dash=await buildDashboard(sourceMatricula);
  if(!dash)throw new Error("Usuário não localizado.");

  const today=fortalezaToday(),currentWeekStart=weekStartOf(today),deadline=addIsoDays(currentWeekStart,2);
  const closedWeekStart=addIsoDays(currentWeekStart,-7),closedWeekEnd=addIsoDays(currentWeekStart,-1),previousWeekStart=addIsoDays(currentWeekStart,-14),previousWeekEnd=addIsoDays(currentWeekStart,-8);
  const [lastUpdate,lastDaily]=await Promise.all([
    db.from("daily_updates").select("result_date").order("result_date",{ascending:false}).limit(1),
    db.from("daily_collaborator").select("date").order("date",{ascending:false}).limit(1)
  ]);
  const latestData=String([lastUpdate.data?.[0]?.result_date,lastDaily.data?.[0]?.date,BASELINE].filter(Boolean).sort().at(-1)||BASELINE);
  const state=await getState(["common_base","meta_schedule","supervisor_share_official","fca_regional_context"]);
  const [closed,previous]=await Promise.all([
    fcaWeekMetrics(closedWeekStart,closedWeekEnd,state),
    fcaWeekMetrics(previousWeekStart,previousWeekEnd,state)
  ]);
  const regionalContextMap=(state.fca_regional_context&&typeof state.fca_regional_context==="object")?state.fca_regional_context:{};
  const regionalContext=regionalContextMap[closedWeekStart]||null;

  const {data:people,error:pe}=await allCollaborators("matricula,nome,store_code,cargo,situacao,profile_type");
  if(pe)throw pe;
  const rosterByStore=new Map<string,Set<string>>(),supervisorByStore=new Map<string,any[]>();
  for(const p of people||[]){
    const st=String(p.store_code||"").padStart(3,"0"),id=String(p.matricula||"").trim(),status=String(p.situacao||"");
    if(!REGIONAL.has(st)||!id)continue;
    if(!/ferias|férias|afast|deslig|inativ/i.test(status)&&commissionEligibleRole(p.cargo)){
      if(!rosterByStore.has(st))rosterByStore.set(st,new Set());rosterByStore.get(st)!.add(id);
    }
    if(eligibleSupervisorRole(p.cargo)&&!/deslig|afast|inativ/i.test(status)){
      if(!supervisorByStore.has(st))supervisorByStore.set(st,[]);
      supervisorByStore.get(st)!.push({id,name:String(p.nome||id),role:String(p.cargo||""),status});
    }
  }

  const soldByStore=new Map<string,Set<string>>();
  const saleDatesByStorePerson=new Map<string,Map<string,Set<string>>>();
  for(let from=0;;from+=500){
    const {data:chunk,error}=await db.from("daily_collaborator").select("date,matricula,store_code,captured").gte("date",closedWeekStart).lte("date",closedWeekEnd).range(from,from+499);
    if(error)throw error;
    for(const r of chunk||[]){
      const st=String(r.store_code||"").padStart(3,"0"),id=String(r.matricula||"").trim(),date=String(r.date||"");
      if(!REGIONAL.has(st)||!id||!date||n(r.captured)<=0)continue;
      if(!soldByStore.has(st))soldByStore.set(st,new Set());soldByStore.get(st)!.add(id);
      if(!saleDatesByStorePerson.has(st))saleDatesByStorePerson.set(st,new Map());
      const byPerson=saleDatesByStorePerson.get(st)!;
      if(!byPerson.has(id))byPerson.set(id,new Set());
      byPerson.get(id)!.add(date);
    }
    if(!chunk||chunk.length<500)break;
  }

  const sundayClosedStores=new Set(["084","113","146"]);
  const stores:any[]=[];
  for(const st of [...REGIONAL].sort()){
    const cur=closed.stores[st]||{},prev=previous.stores[st]||{},roster=[...(rosterByStore.get(st)||new Set())],sold=soldByStore.get(st)||new Set();
    const soldCount=roster.filter(id=>sold.has(id)).length,total=roster.length,zeros=Math.max(0,total-soldCount),dispersion=total?zeros/total:0;
    const operationalDates=Array.from({length:7},(_,i)=>addIsoDays(closedWeekStart,i)).filter(date=>{
      const dow=new Date(date+"T12:00:00Z").getUTCDay();
      return !(dow===0&&sundayClosedStores.has(st));
    });
    const personDates=saleDatesByStorePerson.get(st)||new Map<string,Set<string>>();
    const zeroDetails=roster.map(id=>{
      const dates=personDates.get(id)||new Set<string>();
      const daysWithSale=operationalDates.filter(date=>dates.has(date)).length;
      return {id,days_with_sale:daysWithSale,zero_days:Math.max(0,operationalDates.length-daysWithSale)};
    });
    const zeroOver3=zeroDetails.filter(x=>x.zero_days>3).length;
    const avgZeroDays=zeroDetails.length?zeroDetails.reduce((s,x)=>s+x.zero_days,0)/zeroDetails.length:0;
    const prevTicket=n(prev.ticket),curTicket=n(cur.ticket);
    stores.push({
      st,name:storeName(dash.common,st),captured:n(cur.captured),orders:Math.trunc(n(cur.orders)),ticket:curTicket,
      previous_ticket:prevTicket,ticket_delta:+(curTicket-prevTicket).toFixed(2),ticket_change:prevTicket>0?+(curTicket/prevTicket-1).toFixed(7):null,
      share:n(cur.share),previous_share:n(prev.share),share_delta:+(n(cur.share)-n(prev.share)).toFixed(10),has_verified_compare:!!cur.verified&&!!prev.verified,
      previous_captured:n(prev.captured),previous_captured_covered:!!prev.captured_covered,
      captured_covered:!!cur.captured_covered,
      captured_delta:+(n(cur.captured)-n(prev.captured)).toFixed(2),
      captured_delta_pct:n(prev.captured)>0?+(n(cur.captured)/n(prev.captured)-1).toFixed(7):null,
      meta:n(cur.meta),financial_gap:n(cur.financial_gap),dispersion:+dispersion.toFixed(10),zeros,total,
      zero_over3:zeroOver3,avg_zero_days:+avgZeroDays.toFixed(2),operational_days:operationalDates.length,
      supervisors:supervisorByStore.get(st)||[],source:cur.source||closed.source
    });
  }
  const regionalCaptured=stores.reduce((s,x)=>s+n(x.captured),0);
  const regionalRoster=stores.reduce((s,x)=>s+n(x.total),0),regionalZeros=stores.reduce((s,x)=>s+n(x.zeros),0);
  const criticalZeroCollaborators=stores.reduce((s,x)=>s+n(x.zero_over3),0);
  const regionalDispersion=regionalRoster>0?regionalZeros/regionalRoster:0;
  for(const x of stores)x.participation=regionalCaptured>0?n(x.captured)/regionalCaptured:0;

  const dataReady=latestData>=closedWeekEnd;
  const comparableCount=stores.filter(x=>x.has_verified_compare).length;
  // Não exigir que o share tenha sido importado manualmente quando há 7 dias de
  // gerencial com denominadores válidos. Exigir cobertura quase total evita falso Top 5.
  const comparisonReady=dataReady&&comparableCount>=18;
  const missingPrior=previous.coverage.missing_share_stores||[];
  const missingCurrent=closed.coverage.missing_share_stores||[];
  const comparisonIssue=!dataReady?"Semana "+isoWeekNumber(closedWeekStart)+" ainda sem fechamento gerencial completo.":
    !comparisonReady?"Comparação semanal de share pendente de validação: semana "+isoWeekNumber(previousWeekStart)+" ("+previous.coverage.share_verified_stores+"/19 filiais com share comprovado), semana "+isoWeekNumber(closedWeekStart)+" ("+closed.coverage.share_verified_stores+"/19). "+
      "Falta venda total das lojas ou share gerencial oficial. Sem estimativas. "+
      (missingPrior.length?"Semana anterior pendente: "+missingPrior.join(", ")+". ":"")+
      (missingCurrent.length?"Semana atual pendente: "+missingCurrent.join(", ")+".":""):"";
  const volumeComparable=[...stores].filter(x=>x.previous_captured_covered&&x.captured_covered);
  const volumeRetractions=volumeComparable.filter(x=>x.captured_delta<0)
    .sort((a,b)=>a.captured_delta-b.captured_delta||a.st.localeCompare(b.st)).slice(0,5)
    .map((x:any,i:number)=>({...x,volume_rank:i+1,preview_only:true}));
  const retractions=[...stores].filter(x=>x.previous_share>0&&x.share_delta<0).sort((a,b)=>a.share_delta-b.share_delta||a.share-b.share);
  const prioritized=(comparisonReady?retractions.filter(x=>x.has_verified_compare):[]).slice(0,5).map((x:any,i:number)=>({...x,priority_rank:i+1,priority_status:i<2?"critico":"atencao"}));
  const growth=[...stores].filter(x=>comparisonReady&&x.has_verified_compare&&x.previous_share>0&&x.share_delta>0).sort((a,b)=>b.share_delta-a.share_delta||b.share-a.share).slice(0,5).map((x:any,i:number)=>({...x,rank:i+1}));
  const topShare=[...stores].filter(x=>x.share>0).sort((a,b)=>b.share-a.share||b.captured-a.captured).slice(0,5).map((x:any,i:number)=>({...x,rank:i+1}));
  const stable=stores.filter(x=>comparisonReady&&x.has_verified_compare&&x.previous_share>0&&Math.abs(x.share_delta)<0.00005).length;
  const evolved=stores.filter(x=>comparisonReady&&x.has_verified_compare&&x.previous_share>0&&x.share_delta>=0.00005).length;
  const retracted=stores.filter(x=>comparisonReady&&x.has_verified_compare&&x.previous_share>0&&x.share_delta<=-0.00005).length;

  const {data:allFcas,error:fe}=await db.from("fca_weekly").select("*").eq("week_start",closedWeekStart);
  if(fe)throw fe;
  const allPrioritizedFcas=(allFcas||[]).filter((r:any)=>prioritized.some(x=>x.st===String(r.store_code)));
  const submitted=allPrioritizedFcas.filter((x:any)=>x.status==="concluida"||x.status==="enviada");
  const fcaVisible=ctx.admin?allPrioritizedFcas:allPrioritizedFcas.filter((x:any)=>String(x.store_code)===String(ctx.st));
  const fcaFullMap=new Map(fcaVisible.map((x:any)=>[String(x.store_code),x]));
  const fcaStatusMap=new Map(allPrioritizedFcas.map((x:any)=>[String(x.store_code),{status:x.status,updated_at:x.updated_at,submitted_at:x.submitted_at,review_status:x.review_status}]));
  for(const arr of [stores,prioritized,growth,topShare])for(const x of arr)x.fca=fcaFullMap.get(String(x.st))||(ctx.admin?null:(fcaStatusMap.get(String(x.st))||null));

  const voiceQuery=await db.from("collaborator_voice")
    .select("store_code,matricula,cause_code,status,zero_streak,created_at")
    .gte("created_at",closedWeekStart+"T00:00:00.000Z")
    .lte("created_at",closedWeekEnd+"T23:59:59.999Z")
    .order("created_at",{ascending:false}).limit(2000);
  if(voiceQuery.error)throw voiceQuery.error;
  const voiceRows=(voiceQuery.data||[]).filter((x:any)=>ctx.admin||String(x.store_code)===String(ctx.st));
  const voiceCauseMap=new Map<string,number>(),voiceByStore=new Map<string,number>();
  for(const v of voiceRows){
    const key=String(v.cause_code||"outro"),st=String(v.store_code||"").padStart(3,"0");
    voiceCauseMap.set(key,(voiceCauseMap.get(key)||0)+1);
    if(REGIONAL.has(st))voiceByStore.set(st,(voiceByStore.get(st)||0)+1);
  }
  const voiceCauses=[...voiceCauseMap.entries()].sort((a,b)=>b[1]-a[1]).map(([key,count])=>({key,count,pct:voiceRows.length?count/voiceRows.length:0}));
  const voiceSummary={
    records:voiceRows.length,
    open:voiceRows.filter((x:any)=>String(x.status)!=="resolved").length,
    resolved:voiceRows.filter((x:any)=>String(x.status)==="resolved").length,
    collaborators:[...new Set(voiceRows.map((x:any)=>String(x.matricula||"")).filter(Boolean))].length,
    causes:voiceCauses,
    by_store:[...voiceByStore.entries()].sort((a,b)=>b[1]-a[1]).map(([st,count])=>({st,count}))
  };

  const systemCount=submitted.filter((x:any)=>["sim","parcialmente"].includes(String(x.system_impact))).length;
  const systemImpact=submitted.reduce((s:number,x:any)=>s+n(x.system_impact_amount),0);
  const externalDistribution=fcaDistribution(submitted,"external_factors"),operationalDistribution=fcaDistribution(submitted,"operational_factors");
  const executiveStores=(ctx.admin?prioritized:prioritized.filter(x=>x.st===ctx.st)).map((x:any)=>{
    const f=(ctx.admin?allPrioritizedFcas:fcaVisible).find((r:any)=>String(r.store_code)===x.st)||null;
    return {...x,executive_summary:f?fcaStoreExecutive(f,x):"",fca:f};
  });

  let currentPartial:any=null;
  const showPartial=today>deadline&&latestData>=currentWeekStart;
  if(showPartial){
    const currentEnd=latestData<today?latestData:today;
    const part=await fcaWeekMetrics(currentWeekStart,currentEnd,state);
    const partStores=stores.map(x=>{
      const p=part.stores[x.st]||{},delta=n(p.share)-n(x.share);
      return {st:x.st,name:x.name,share:n(p.share),previous_share:n(x.share),share_delta:+delta.toFixed(10),captured:n(p.captured),orders:Math.trunc(n(p.orders)),ticket:n(p.ticket),trend:delta>0?"recuperacao":delta<0?"retracao":"estavel"};
    });
    currentPartial={
      start:currentWeekStart,end:currentEnd,regional:part.regional,
      share_delta:+(n(part.regional.share)-n(closed.regional.share)).toFixed(10),
      growth:[...partStores].filter(x=>x.share_delta>0).sort((a,b)=>b.share_delta-a.share_delta).slice(0,5),
      retractions:[...partStores].filter(x=>x.share_delta<0).sort((a,b)=>a.share_delta-b.share_delta).slice(0,5),
      stores:partStores
    };
  }

  const myPriority=prioritized.find(x=>String(x.st)===String(ctx.st))||null;
  const isSupervisor=ctx.profile==="supervisor"||/supervisor/i.test(String(ctx.role||""));
  const isManager=ctx.profile==="gerente"||/gerente/i.test(String(ctx.role||""));
  const withinWindow=today<=deadline;
  const permissions={
    isSupervisor,isManager,isAdmin:!!ctx.admin,withinWindow,
    canTreat:!!ctx.admin||(isSupervisor&&!!myPriority&&withinWindow),
    canReview:!!ctx.admin||isManager,
    treatmentDeadline:deadline
  };
  const summary={
    captured:closed.regional.captured,orders:closed.regional.orders,ticket:closed.regional.ticket,share:closed.regional.share,
    previous_captured:previous.coverage.historical_full?previous.regional.captured:null,previous_orders:previous.coverage.historical_full?previous.regional.orders:null,previous_ticket:previous.coverage.historical_full?previous.regional.ticket:null,previous_share:previous.coverage.regional_share_official?previous.regional.share:null,
    share_delta:comparisonReady?+(n(closed.regional.share)-n(previous.regional.share)).toFixed(10):null,
    captured_change:previous.coverage.historical_full&&previous.regional.captured?closed.regional.captured/previous.regional.captured-1:null,
    orders_change:previous.coverage.historical_full&&previous.regional.orders?closed.regional.orders/previous.regional.orders-1:null,
    ticket_change:previous.coverage.historical_full&&previous.regional.ticket?closed.regional.ticket/previous.regional.ticket-1:null,
    financial_gap:closed.regional.financial_gap,
    evolved,stable,retracted,prioritized:prioritized.length,total_stores:stores.length,
    fca_submitted:submitted.length,fca_pending:Math.max(0,prioritized.length-submitted.length),
    systemic_reports:systemCount,systemic_impact:+systemImpact.toFixed(2),
    regional_context_flagged:!!regionalContext?.active,
    regional_context_impact:+n(regionalContext?.estimated_impact).toFixed(2),
    regional_dispersion:+regionalDispersion.toFixed(10),
    zero_over3:criticalZeroCollaborators
  };
  const storesByDispersion=[...stores].sort((a,b)=>b.dispersion-a.dispersion);
  const storesByTicketLoss=[...stores].filter(x=>x.ticket_change!==null).sort((a,b)=>n(a.ticket_change)-n(b.ticket_change));
  const storesByZero=[...stores].sort((a,b)=>b.zero_over3-a.zero_over3||b.dispersion-a.dispersion);
  const performance={
    critical_zero_collaborators:criticalZeroCollaborators,
    regional_dispersion:+regionalDispersion.toFixed(10),
    ticket_change:summary.ticket_change,
    max_dispersion:storesByDispersion[0]||null,
    max_ticket_loss:storesByTicketLoss[0]||null,
    max_zero:storesByZero[0]||null,
    voice:voiceSummary
  };
  const executive={
    regional:comparisonReady?fcaRegionalExecutive(closed,previous,prioritized,submitted):
      "Semana "+isoWeekNumber(closedWeekStart)+": captação gerencial e indicadores disponíveis. "+
      "A comparação de share com a semana "+isoWeekNumber(previousWeekStart)+
      " não está homologada; por isso nenhuma filial será tratada como retração comprovada até completar a venda geral/compartilhamento oficial.",
    external:externalDistribution,operational:operationalDistribution,
    regional_context:regionalContext,
    stores:executiveStores
  };
  return {
    ctx,today,latestData,dataReady,comparisonReady,comparisonIssue,coverage:{previous:previous.coverage,closed:closed.coverage,comparable:comparableCount,total:REGIONAL.size},weekStart:closedWeekStart,weekEnd:closedWeekEnd,calendarWeekEnd:closedWeekEnd,
    previousWeekStart,previousWeekEnd,currentWeekStart,deadline,showPartial,
    weekNumber:isoWeekNumber(closedWeekStart),previousWeekNumber:isoWeekNumber(previousWeekStart),currentWeekNumber:isoWeekNumber(currentWeekStart),
    source:{closed:closed.source,previous:previous.source},
    permissions,summary,performance,stores,prioritized,growth,topShare,myPriority,currentPartial,
    fcas:fcaVisible,executive,regionalContext,
    volumeRetractions,volumeCoverage:{comparable:volumeComparable.length,total:REGIONAL.size,source:"Histórico de captação do relatório gerencial; não é share",certified_share:false}
  };
}


function celebrationFirstName(name:any){
  const raw=String(name||"").trim();
  if(!raw)return "Você";
  const first=raw.split(/\s+/)[0].toLocaleLowerCase("pt-BR");
  return first.charAt(0).toLocaleUpperCase("pt-BR")+first.slice(1);
}
async function celebrationForMatricula(matricula:string){
  const today=fortalezaToday();
  const [year,month,day]=today.split("-").map(Number);
  const {data,error}=await db.from("collaborators")
    .select("matricula,nome,store_code,cargo,situacao,admissao,birth_day,birth_month")
    .eq("matricula",String(matricula)).maybeSingle();
  if(error)throw error;
  if(!data||/inativ/i.test(String(data.situacao||"")))return {date:today,events:[]};
  const firstName=celebrationFirstName(data.nome);
  const events:any[]=[];
  if(Number(data.birth_day)===day&&Number(data.birth_month)===month){
    events.push({type:"birthday",title:"Feliz aniversário, "+firstName+"!",first_name:firstName});
  }
  const adm=String(data.admissao||"").slice(0,10);
  if(/^\d{4}-\d{2}-\d{2}$/.test(adm)&&adm.slice(5)===today.slice(5)&&adm<today){
    const years=year-Number(adm.slice(0,4));
    if(years>0)events.push({
      type:"work_anniversary",years,
      title:"Parabéns pelos "+years+" "+(years===1?"ano":"anos")+" de Riachuelo, "+firstName+"!",
      first_name:firstName,admission_date:adm
    });
  }
  return {date:today,matricula:String(data.matricula||""),name:String(data.nome||""),first_name:firstName,store_code:String(data.store_code||"").padStart(3,"0"),events};
}

Deno.serve(async(req)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
  try{
    if(req.method==="GET"){
      const u=new URL(req.url);
      const asset=String(u.searchParams.get("asset")||"");
      if(asset)return await campaignImageResponse(asset);
      return json({ok:true,service:"App eStore CE+PI",status:"ready"});
    }
    const ct=req.headers.get("content-type")||"";
    if(ct.includes("multipart/form-data")){
      const form=await req.formData();
      const action=String(form.get("action")||"");
      const matricula=String(form.get("matricula")||""), password=String(form.get("password")||"");
      if(matricula==="0000000")return json({error:"Modo visitante é somente leitura."},403);
      if(action==="fca_save"){
        const ctx=await actorContext(matricula);
        if(!ctx||(!ctx.lead&&!ctx.admin))return json({error:"Acesso exclusivo para supervisores e gestores."},403);
        const store_code=String(form.get("store_code")||ctx.st).padStart(3,"0");
        if(!REGIONAL.has(store_code))return json({error:"Filial inválida."},400);
        if(!ctx.admin&&store_code!==ctx.st)return json({error:"Você só pode tratar a FCA da sua filial."},403);

        const dashboard=await fcaWeeklyData(matricula);
        const metric=dashboard.prioritized.find((x:any)=>x.st===store_code);
        if(!metric)return json({error:"A filial não está entre as lojas priorizadas desta semana."},403);
        const isSupervisor=ctx.profile==="supervisor"||/supervisor/i.test(String(ctx.role||""));
        if(!ctx.admin&&!isSupervisor)return json({error:"A tratativa da FCA deve ser preenchida pelo Supervisor da filial."},403);
        if(!ctx.admin&&!dashboard.permissions.withinWindow)return json({error:"O prazo de tratamento desta FCA encerrou na quarta-feira. A consulta permanece disponível em modo leitura."},403);

        const current=dashboard.fcas.find((x:any)=>String(x.store_code)===store_code)||null;
        const parseArray=(name:string)=>{try{const a=JSON.parse(String(form.get(name)||"[]"));return Array.isArray(a)?a.map((x:any)=>String(x).slice(0,80)).slice(0,20):[]}catch{return []}};
        const externalFactors=parseArray("external_factors"),operationalFactors=parseArray("operational_factors");
        const causes=[...externalFactors,...operationalFactors];
        const rootCause=String(form.get("root_cause")||form.get("treatment")||"").trim().slice(0,3000);
        const actionPlan=String(form.get("action_plan")||"").trim().slice(0,3000);
        const expectedResult=String(form.get("expected_result")||"").trim().slice(0,1000);
        const couponProblem=String(form.get("coupon_problem")||"").trim().slice(0,300);
        const systemImpact=String(form.get("system_impact")||"nao");
        const status=String(form.get("status")||"em_andamento");
        const owner=String(form.get("action_owner")||ctx.name||"").trim().slice(0,120);
        const deadline=String(form.get("action_deadline")||"")||null;

        const evidences=Array.isArray(current?.evidences)?[...current.evidences]:[];
        const files=form.getAll("evidence").filter(x=>x instanceof File) as File[];
        if(files.length>3)return json({error:"Envie no máximo 3 evidências por vez."},400);
        for(const f of files){
          if(f.size>10485760)return json({error:"Cada evidência deve ter no máximo 10 MB."},400);
          const mt=String(f.type||"");
          if(!(mt.startsWith("image/")||mt==="application/pdf"))return json({error:"As evidências devem ser imagem ou PDF."},400);
          const path="fca/"+dashboard.weekStart+"/"+store_code+"/"+Date.now()+"_"+safeFileName(f.name||"evidencia");
          const {error:upErr}=await db.storage.from("estore-public").upload(path,f,{upsert:false,contentType:mt||undefined});
          if(upErr)throw upErr;
          const url=db.storage.from("estore-public").getPublicUrl(path).data.publicUrl;
          evidences.push({url,name:f.name||"evidencia",type:mt,uploaded_at:new Date().toISOString(),uploaded_by:matricula});
        }

        if(status==="concluida"||status==="enviada"){
          if(!causes.length)return json({error:"Selecione pelo menos um fator relacionado à não entrega."},400);
          if(rootCause.length<10)return json({error:"Descreva a causa raiz com um pouco mais de detalhe."},400);
          if(actionPlan.length<10)return json({error:"Informe um plano de ação objetivo para reversão."},400);
          if(!owner||!deadline)return json({error:"Informe responsável e prazo do plano de ação."},400);
          if(externalFactors.includes("cupom_desconto")&&!couponProblem)return json({error:"Informe qual cupom ou desconto apresentou problema."},400);
          const needsEvidence=externalFactors.some(x=>["interface_sistemica","app_mobile_instabilidade","perda_venda","cupom_desconto","aprovacao_pagamento"].includes(x));
          const ticket=String(form.get("system_ticket")||"").trim();
          if(needsEvidence&&!ticket&&!evidences.length)return json({error:"Para ocorrência sistêmica, anexe uma evidência ou informe o número do chamado."},400);
        }

        const executiveSummary=fcaStoreExecutive({
          previous_share:metric.previous_share,share:metric.share,share_delta:metric.share_delta,
          external_factors:externalFactors,operational_factors:operationalFactors,root_cause:rootCause,
          action_plan:actionPlan,action_owner:owner,action_deadline:deadline,
          system_impact:SystematicSafe(systemImpact),system_impact_amount:n(form.get("system_impact_amount"))
        },metric);
        function SystematicSafe(v:string){return ["sim","parcialmente","nao","nao_sei","nao_informado"].includes(v)?v:"nao"}

        const payload:any={
          week_start:dashboard.weekStart,week_end:dashboard.weekEnd,previous_week_start:dashboard.previousWeekStart,store_code,
          supervisor_matricula:matricula,supervisor_name:ctx.name,supervisor_role:ctx.role,
          previous_share:metric.previous_share,share:metric.share,share_delta:metric.share_delta,
          captured:metric.captured,orders:metric.orders,financial_gap:metric.financial_gap,
          dispersion:metric.dispersion,regional_participation:metric.participation,
          priority_status:metric.priority_status,causes,external_factors:externalFactors,operational_factors:operationalFactors,
          treatment:rootCause,root_cause:rootCause,action_plan:actionPlan,expected_result:expectedResult,
          action_owner:owner,action_deadline:deadline,coupon_problem:couponProblem,
          system_impact:SystematicSafe(systemImpact),
          system_issue_type:String(form.get("system_issue_type")||"").trim().slice(0,120)||null,
          system_ticket:String(form.get("system_ticket")||"").trim().slice(0,120)||null,
          system_description:String(form.get("system_description")||"").trim().slice(0,3000)||null,
          system_impact_amount:+n(form.get("system_impact_amount")).toFixed(2),
          evidences,executive_summary:executiveSummary,
          status:["rascunho","em_andamento","enviada","concluida"].includes(status)?status:"em_andamento",
          review_status:(status==="concluida"||status==="enviada")?"aguardando_revisao":"pendente",
          submitted_at:(status==="enviada"||status==="concluida")?new Date().toISOString():(current?.submitted_at||null),
          updated_at:new Date().toISOString()
        };
        const {data,error}=await db.from("fca_weekly").upsert(payload,{onConflict:"week_start,store_code"}).select().single();
        if(error)throw error;
        return json({ok:true,item:data,message:payload.status==="concluida"?"FCA concluída. A leitura executiva da filial foi atualizada.":"Tratativa salva com sucesso."});
      }
      if(action==="support_send"){
        const store_code=String(form.get("store_code")||"");
        const message=String(form.get("message")||"").trim();
        const target=String(form.get("target")||matricula);
        const st=await getState(["config"]);
        const isAdmin=await adminAllowed(matricula);
        const threadMatricula=isAdmin&&target?target:matricula;
        let attachment_url:any=null, attachment_name:any=null, attachment_type:any=null;
        const file=form.get("attachment");
        if(file instanceof File && file.size>0){
          if(file.size>10485760)return json({error:"Arquivo acima de 10 MB."},400);
          const ext=safeFileName(file.name||"arquivo");
          const path="support/"+threadMatricula+"/"+Date.now()+"_"+ext;
          const {error:upErr}=await db.storage.from("estore-public").upload(path,file,{upsert:false,contentType:file.type||undefined});
          if(upErr)throw upErr;
          attachment_url=db.storage.from("estore-public").getPublicUrl(path).data.publicUrl;
          attachment_name=file.name||"arquivo";
          attachment_type=file.type||"";
        }
        if(!message&&!attachment_url)return json({error:"Digite uma mensagem ou anexe um arquivo."},400);
        const {data,error}=await db.from("support_messages").insert({matricula:threadMatricula,store_code,sender_role:isAdmin?"admin":"user",message,attachment_url,attachment_name,attachment_type}).select().single();
        if(error)throw error;
        return json({ok:true,message:data});
      }
      if(action==="content_media_upload"){
        if(!(await adminOk(matricula,password)))return json({error:"Acesso administrativo inválido."},403);
        const f=form.get("media");
        if(!(f instanceof File))return json({error:"Selecione uma imagem ou vídeo."},400);
        const mt=String(f.type||"");
        const isImage=mt.startsWith("image/"),isVideo=mt.startsWith("video/");
        if(!isImage&&!isVideo)return json({error:"Envie um arquivo de imagem ou vídeo."},400);
        if(isImage&&f.size>8388608)return json({error:"Imagem acima de 8 MB."},400);
        if(isVideo&&f.size>26214400)return json({error:"Vídeo acima de 25 MB."},400);
        const path="app-media/"+Date.now()+"_"+safeFileName(f.name||(isVideo?"video":"imagem"));
        const {error:upErr}=await db.storage.from("estore-public").upload(path,f,{upsert:false,contentType:mt||undefined});if(upErr)throw upErr;
        const public_url=db.storage.from("estore-public").getPublicUrl(path).data.publicUrl;
        const st=await getState(["institutional_media"]);let arr=Array.isArray(st.institutional_media)?st.institutional_media:[];
        const item={id:crypto.randomUUID(),name:f.name,url:public_url,type:mt,kind:isVideo?"video":"image",created_at:new Date().toISOString(),created_by:matricula};arr.unshift(item);
        const {error}=await db.from("app_state").upsert({key:"institutional_media",value:arr,updated_at:new Date().toISOString()},{onConflict:"key"});if(error)throw error;
        return json({ok:true,item,media:arr});
      }
      if(action==="community_post"){
        const title=String(form.get("title")||"").trim().slice(0,140), bodyText=String(form.get("body")||"").trim().slice(0,4000), category=String(form.get("category")||"boas_praticas"), store_code=String(form.get("store_code")||"").padStart(3,"0");
        if(!title)return json({error:"Informe um título para compartilhar."},400);
        if(!["boas_praticas","engajamento","sugestoes"].includes(category))return json({error:"Categoria inválida."},400);
        let authorName="",authorStore=store_code;
        const users=await allUserState();
        for(const st of Object.keys(users)){const u=(users[st]?.users||[]).find((x:any)=>String(x.id)===matricula);if(u){authorName=String(u.name||"").trim();authorStore=String(u.st||st).padStart(3,"0");break;}}
        if(!authorName){
          const {data:p}=await db.from("collaborators").select("nome,store_code").eq("matricula",matricula).maybeSingle();
          if(p){authorName=String(p.nome||"").trim();authorStore=String(p.store_code||store_code).padStart(3,"0");}
        }
        if(!authorName && await adminAllowed(matricula)){
          authorName=String(form.get("author_name")||"Administrador").trim()||"Administrador";
          authorStore=REGIONAL.has(store_code)?store_code:"108";
        }
        if(!authorName)return json({error:"Apenas usuários cadastrados podem publicar. Visitantes podem visualizar o mural."},403);
        let media_url:any=null,media_type:any=null,media_name:any=null;
        const media=form.get("media");
        if(media instanceof File && media.size>0){
          if(media.size>26214400)return json({error:"O arquivo deve ter no máximo 25 MB."},400);
          const mt=String(media.type||"");
          if(!(mt.startsWith("image/")||mt.startsWith("video/")))return json({error:"Envie uma foto ou vídeo."},400);
          const path="community/"+Date.now()+"_"+safeFileName(media.name||"arquivo");
          const {error:upErr}=await db.storage.from("estore-public").upload(path,media,{upsert:false,contentType:mt||undefined});
          if(upErr)throw upErr;
          media_url=db.storage.from("estore-public").getPublicUrl(path).data.publicUrl;
          media_type=mt;media_name=media.name||"arquivo";
        }
        const {data,error}=await db.from("community_posts").insert({author_matricula:matricula,author_name:authorName,store_code:authorStore,category,title,body:bodyText,media_url,media_type,media_name}).select().single();
        if(error)throw error;
        return json({ok:true,post:data});
      }
      if(action==="collaborators_import"){
        if(!(await adminAllowed(matricula)))return json({error:"Acesso administrativo inválido."},403);
        const f=form.get("collaborators"); if(!(f instanceof File))return json({error:"Selecione a planilha de colaboradores."},400);
        const wb=XLSX.read(await f.arrayBuffer(),{type:"array"}), ws=wb.Sheets[wb.SheetNames[0]], rows:any[]=XLSX.utils.sheet_to_json(ws,{defval:""});
        const norm=(s:any)=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
        const val=(r:any,names:string[])=>{for(const k of Object.keys(r)){if(names.includes(norm(k)))return r[k]}return ""};
        const {data:old,error:oe}=await allCollaborators();if(oe)throw oe;
        const oldMap=new Map((old||[]).map((x:any)=>[String(x.matricula),x]));
        const {data:prefs,error:pre}=await db.from("profile_preferences").select("matricula,preferred_name");
        if(pre)throw pre;
        const prefMap=new Map((prefs||[]).map((x:any)=>[String(x.matricula),String(x.preferred_name||"").trim()]));
        const payload:any[]=[]; const seen=new Set<string>();
        for(const r of rows){
          const id=String(val(r,["matricula","mat","registro","id"])).replace(/\.0$/,"").trim();
          const estab=String(val(r,["estabdescr","estabelecimento","filial","loja","store","storecode","codigoloja"])); const st=(estab.match(/^\s*(\d{3})/)?.[1]||estab.replace(/\D/g,"").padStart(3,"0").slice(-3));
          if(!id||!REGIONAL.has(st)||seen.has(id))continue; seen.add(id);
          const sourceName=String(val(r,["nome","colaborador","nomecolaborador"])).trim(); if(!sourceName)continue;
          const nome=String(prefMap.get(id)||sourceName).trim();
          const cargo=String(val(r,["cargodescr","cargo","funcao","role"])).trim(),adm=isoDate(val(r,["admissao","dataadmissao","dtadmissao"]));
          const situacao=String(val(r,["situacaodescr","situacao","status"])).trim()||"Atividade Normal";
          const prev:any=oldMap.get(id); const profile=/gerente/i.test(cargo)?"gerente":/supervisor/i.test(cargo)?"supervisor":(prev?.profile_type||"colaborador");
          const eligible=eligibleSupervisorRole(cargo);
          payload.push({matricula:id,nome,store_code:st,cargo,situacao,admissao:adm||prev?.admissao||null,profile_type:profile,menu_permissions:Array.isArray(prev?.menu_permissions)?prev.menu_permissions:[],eligible_supervisor:eligible,is_admin:!!prev?.is_admin,updated_at:new Date().toISOString()});
        }
        if(!payload.length)return json({error:"Nenhum colaborador CE+PI válido foi identificado na planilha."},400);
        let inserted=0,updated=0,transferred=0,unchanged=0;
        for(const x of payload){const p:any=oldMap.get(x.matricula);if(!p)inserted++;else{const changed=String(p.nome||"")!==x.nome||String(p.store_code||"").padStart(3,"0")!==x.store_code||String(p.cargo||"")!==x.cargo||String(p.situacao||"")!==x.situacao||String(p.admissao||"")!==String(x.admissao||"")||String(p.profile_type||"")!==x.profile_type||!!p.eligible_supervisor!==!!x.eligible_supervisor;if(String(p.store_code||"").padStart(3,"0")!==x.store_code)transferred++;if(changed)updated++;else unchanged++;}}
        for(let i=0;i<payload.length;i+=300){const {error}=await db.from("collaborators").upsert(payload.slice(i,i+300),{onConflict:"matricula"});if(error)throw error;}
        const incoming=new Set(payload.map(x=>x.matricula)); const missing=(old||[]).filter((x:any)=>REGIONAL.has(String(x.store_code||"").padStart(3,"0"))&&!incoming.has(String(x.matricula))&&!/inativ/i.test(String(x.situacao||"")));
        for(let i=0;i<missing.length;i+=300){const ids=missing.slice(i,i+300).map((x:any)=>String(x.matricula));const {error}=await db.from("collaborators").update({situacao:"Inativo",updated_at:new Date().toISOString()}).in("matricula",ids);if(error)throw error;}
        const {data:allActive,error:ae}=await allCollaborators();if(ae)throw ae;
        const roster=(allActive||[]).filter((x:any)=>REGIONAL.has(String(x.store_code).padStart(3,"0"))&&!/inativ/i.test(String(x.situacao||""))).map((x:any)=>({id:String(x.matricula),name:x.nome||"",st:String(x.store_code).padStart(3,"0"),role:x.cargo||"",profile:x.profile_type||"colaborador"}));
        const {error:rs}=await db.from("app_state").upsert({key:"regional_roster_cepi",value:roster,updated_at:new Date().toISOString()},{onConflict:"key"});if(rs)throw rs;
        const stores=[...new Set(payload.map(x=>x.store_code))];
        const {error:he}=await db.from("collaborator_import_history").insert({imported_by:matricula,file_name:f.name,total_rows:payload.length,inserted_rows:inserted,updated_rows:updated,transferred_rows:transferred,inactivated_rows:missing.length,unchanged_rows:unchanged,active_rows:roster.length,stores});if(he)throw he;
        return json({ok:true,message:"Base regional sincronizada com sucesso.",total:payload.length,inserted,updated,transferred,inactivated:missing.length,unchanged,active:roster.length,stores:stores.length});
      }
      if(action==="weekly_history_import"){
        if(!(await adminOk(matricula,password)))return json({error:"Acesso administrativo inválido."},403);
        const file=form.get("weekly_report"),start=String(form.get("week_start")||"").trim();
        if(!(file instanceof File))return json({error:"Selecione o Gerencial Semanal."},400);
        if(!/^\d{4}-\d{2}-\d{2}$/.test(start)||weekStartOf(start)!==start)return json({error:"Informe a segunda-feira de início da semana."},400);
        const weekEnd=weekEndOf(start);
        if(weekEnd>=fortalezaToday())return json({error:"O fechamento semanal só pode ser incorporado após o encerramento do domingo. Semana informada: "+start+" a "+weekEnd+"."},400);
        const weekNumber=isoWeekNumber(start),raw=await sheetRows(file),payload:any[]=[];
        let regionalRow:any=null;
        for(const r of raw){
          if(String(pick(r,"Regional")||"").trim()!=="CE + PI")continue;
          const loja=String(pick(r,"Loja","LOJA")||"").trim(),share=normalizeWeeklyShare(pick(r,"Share Loja %","Share Loja","Share","SHARE"));
          const base:any={week_start:start,week_end:weekEnd,week_number:weekNumber,regional:"CE + PI",
            captured:+n(pick(r,"Captação","Captacao")).toFixed(2),approved:+n(pick(r,"Aprovado")).toFixed(2),
            orders:Math.trunc(n(pick(r,"Qtde Pedidos","Qtd Pedidos"))),billing:+n(pick(r,"Faturamento")).toFixed(2),
            share:share??0,ticket:+n(pick(r,"Ticket Médio","Ticket Medio")).toFixed(6),meta_1pct:+n(pick(r,"Meta (1%)","Meta 1%")).toFixed(10),
            source_filename:safeFileName(file.name||"gerencial_semanal.xlsx"),source_type:"gerencial_semanal",updated_at:new Date().toISOString()};
          if(/^total$/i.test(loja)||/^regional$/i.test(loja)){regionalRow=share===null?null:{...base,store_code:"REGIONAL",store_name:"CE + PI"};continue}
          const st=stCode(loja);if(!REGIONAL.has(st)||share===null)continue;
          payload.push({...base,store_code:st,store_name:loja});
        }
        if(payload.length<18)return json({error:"O Gerencial Semanal precisa conter pelo menos 18 filiais válidas da CE+PI. Encontradas: "+payload.length+"."},400);
        if(!regionalRow||normalizeWeeklyShare(regionalRow.share)===null)return json({error:"Não encontrei a linha Total/Regional com Share Regional no arquivo."},400);
        const seen=new Set<string>();for(const x of payload){if(seen.has(x.store_code))return json({error:"Filial duplicada no arquivo: "+x.store_code},400);seen.add(x.store_code)}
        const {error:del}=await db.from("estore_weekly_history").delete().eq("week_start",start);if(del)throw del;
        const {error:ins}=await db.from("estore_weekly_history").insert([...payload,regionalRow]);if(ins)throw ins;
        const state=await getState(["supervisor_share_official"]);const shareState=state.supervisor_share_official||{};shareState.week=shareState.week||{};
        const map:any={};for(const x of payload)map[x.store_code]=x.share;
        shareState.week[start]={stores:map,regional_share:regionalRow.share,through:weekEnd,source:"Gerencial semanal oficial • histórico comparativo",
          imported_at:new Date().toISOString(),imported_by:matricula,source_filename:safeFileName(file.name||"")};
        const {error:se}=await db.from("app_state").upsert({key:"supervisor_share_official",value:shareState,updated_at:new Date().toISOString()},{onConflict:"key"});if(se)throw se;
        const dash=await weeklyHistoryDashboard(start);
        return json({ok:true,message:"Semana "+weekNumber+" incorporada ao histórico comparativo.",week_start:start,week_end:weekEnd,stores:payload.length,missing:[...REGIONAL].filter(st=>!seen.has(st)),dashboard:dash});
      }
      if(action==="ticket_history_upload"){
        if(!(await adminOk(matricula,password)))return json({error:"Acesso administrativo inválido."},403);
        const f=form.get("ticket_history");
        if(!(f instanceof File))return json({error:"Selecione a planilha de ticket médio histórico."},400);
        const rows=await sheetRows(f);
        const state=await getState(["historical_ticket_ytd"]);
        const values:any={...historicalTicketPayload(state).values};
        let found=0;
        for(const r of rows){
          const loja=String(pick(r,"Loja","LOJA","Filial","FILIAL","Estabelecimento","Código Loja","Codigo Loja")||"");
          const st=stCode(loja);
          if(!REGIONAL.has(st))continue;
          const v=n(pick(r,"Ticket Médio","Ticket Medio","TICKET MÉDIO","TICKET MEDIO","Ticket","TICKET","TM"));
          if(v>0){values[st]=+v.toFixed(2);found++;}
        }
        if(!found)return json({error:"Não encontrei filiais e valores de Ticket Médio válidos na planilha."},400);
        const payload=await persistHistoricalTickets(values,String(form.get("reference_date")||""),matricula);
        return json({ok:true,rows:found,stores:Object.keys(payload.values||{}).length,historicalTickets:payload,message:"Ticket médio histórico atualizado e metas de pedidos recalculadas."});
      }
      if(action==="meta_update"){
        if(!(await adminOk(matricula,password)))return json({error:"Acesso administrativo inválido."},403);
        const fm=form.get("meta");
        if(!(fm instanceof File))return json({error:"Selecione o arquivo de meta."},400);
        const rows=await sheetRows(fm);
        const state=await getState(["meta_schedule","config","annual_meta","historical_ticket_ytd"]);
        const merged:any=state.meta_schedule||{};
        let count=0,minDate="",maxDate=""; const stores=new Set<string>();
        for(const r of rows){
          const d=isoDate(pick(r,"Data","DATA"));
          const loja=String(pick(r,"Loja","LOJA")||"");
          const st=stCode(loja);
          if(!d||!REGIONAL.has(st))continue;
          const ticket=historicalTicketFromState(state,st);
          const mv=n(pick(r,"Meta Fin","Meta","Meta Venda","META FIN"));
          const me=+(mv*.01).toFixed(2);
          merged[d]=merged[d]||{};
          merged[d][st]={metaVenda:+mv.toFixed(2),metaEstore:me,metaPedidos:me>0?Math.ceil(me/ticket):0};
          count++;stores.add(st);
          if(!minDate||d<minDate)minDate=d;if(!maxDate||d>maxDate)maxDate=d;
        }
        if(!count)return json({error:"Não encontrei linhas válidas de Data, Loja e Meta Fin."},400);
        const {error}=await db.from("app_state").upsert({key:"meta_schedule",value:merged,updated_at:new Date().toISOString()},{onConflict:"key"});
        const annual:any={};
        for(const st of REGIONAL){
          let toBaseline=0,final=0;
          for(const d of Object.keys(merged)){
            if(d.slice(0,4)!=="2026") continue;
            const v=n(merged[d]?.[st]?.metaEstore);
            if(d<=BASELINE)toBaseline+=v;
            if(d<="2026-09-30")final+=v;
          }
          if(final>0)annual[st]={to_baseline:+toBaseline.toFixed(2),final:+final.toFixed(2)};
        }
        if(Object.keys(annual).length){
          const {error:e2}=await db.from("app_state").upsert({key:"annual_meta",value:annual,updated_at:new Date().toISOString()},{onConflict:"key"});
          if(e2)throw e2;
        }
        if(error)throw error;
        return json({ok:true,rows:count,stores:stores.size,minDate,maxDate,message:"Meta de venda incorporada ao histórico."});
      }
      if(action==="bopis_import"){
        if(!(await adminOk(matricula,password)))return json({error:"Acesso administrativo inválido."},403);
        const f=form.get("bopis_report");
        if(!(f instanceof File))return json({error:"Selecione o relatório de vendas BOPIS."},400);
        const raw=await sheetRows(f),map=new Map<string,any>();
        for(const r of raw){
          const date=isoDate(pick(r,"Data Criação Pedido","Data Criacao Pedido","Data","DATA")),
                loja=String(pick(r,"Loja","LOJA","Filial","FILIAL")||""),
                st=stCode(loja),
                id=String(pick(r,"Matrícula","Matricula","MATRÍCULA","MATRICULA")||"").replace(/\.0$/,"").trim(),
                regional=String(pick(r,"Regional","REGIONAL")||"").trim();
          if(!date||!id||!REGIONAL.has(st))continue;
          if(regional&&regional!=="CE + PI")continue;
          const k=date+"|"+id+"|"+st,q=map.get(k)||{date,matricula:id,store_code:st,cargo:String(pick(r,"Cargo","CARGO")||""),captured:0,approved:0,orders:0};
          q.captured+=n(pick(r,"Captação","Captacao","CAPTAÇÃO","CAPTACAO"));
          q.approved+=n(pick(r,"Aprovado","APROVADO"));
          q.orders+=Math.trunc(n(pick(r,"Qtd Pedidos","Qtde Pedidos","QTD PEDIDOS","QTDE PEDIDOS"))||1);
          map.set(k,q);
        }
        const payload=[...map.values()].map((q:any)=>({...q,captured:+q.captured.toFixed(2),approved:+q.approved.toFixed(2),orders:Math.max(1,Math.trunc(q.orders)),imported_at:new Date().toISOString(),source:"admin_bopis_report"}));
        if(!payload.length)return json({error:"Nenhuma venda BOPIS válida da Regional CE+PI foi encontrada no arquivo."},400);
        for(let i=0;i<payload.length;i+=300){
          const {error}=await db.from("bopis_sales_history").upsert(payload.slice(i,i+300),{onConflict:"date,matricula,store_code"});
          if(error)throw error;
        }
        const dates=payload.map((x:any)=>x.date).sort(),stores=new Set(payload.map((x:any)=>x.store_code));
        const approved=payload.reduce((s:number,x:any)=>s+n(x.approved),0),orders=payload.reduce((s:number,x:any)=>s+Math.trunc(n(x.orders)),0);
        await db.from("app_audit").insert({event_type:"bopis_import",entity:"bopis_sales_history",entity_id:dates[0]+"_"+dates.at(-1),actor_matricula:matricula,after_data:{rows:payload.length,stores:stores.size,approved:+approved.toFixed(2),orders,source_file:safeFileName(f.name||"bopis.xlsx")}});
        return json({ok:true,rows:payload.length,stores:stores.size,minDate:dates[0],maxDate:dates.at(-1),approved:+approved.toFixed(2),orders,message:"Relatório BOPIS incorporado. Esses valores serão descontados automaticamente da base do Pool."});
      }
      if(action!=="daily_update")return json({error:"Ação inválida."},400);
      const requested=String(form.get("date")||"");
      if(!(await adminOk(matricula,password)))return json({error:"Acesso administrativo inválido."},403);
      const f1=form.get("collaborators"), f2=form.get("management");
      if(!(f1 instanceof File)||!(f2 instanceof File)||!requested)return json({error:"Informe a data e os dois relatórios."},400);
      const [cr,mr]=await Promise.all([sheetRows(f1),sheetRows(f2)]);
      // Input diagnostics: verify the Power BI exports before persisting any daily totals.
      const diagnostics={
        requested, collaborator_rows:cr.length,management_rows:mr.length,
        collaborator_dates:[...new Set(cr.map((r:any)=>isoDate(pick(r,"Data Criação Pedido","Data Criacao Pedido","Data"))).filter(Boolean))].slice(0,12),
        collaborator_region_rows:cr.filter((r:any)=>isCePiRegion(pick(r,"Regional"))).length,
        management_region_rows:mr.filter((r:any)=>isCePiRegion(pick(r,"Regional"))).length,
        collaborator_columns:Object.keys(cr[0]||{}).slice(0,25),
        management_columns:Object.keys(mr[0]||{}).slice(0,25)
      };
      const deliveryKeys=["Tipo Entrega","Tipo da Entrega","Modalidade Entrega","Modalidade de Entrega"];
      const hasDeliveryTypeColumn=(cr||[]).some((r:any)=>deliveryKeys.some(k=>Object.prototype.hasOwnProperty.call(r||{},k)));
      const deliveryTypeOf=(r:any)=>String(pick(r,...deliveryKeys)||"").trim();
      const isBopisDelivery=(v:any)=>/\bBOPIS\b|RETIRA\s*EM\s*LOJA|RETIRE\s*EM\s*LOJA/i.test(String(v||""));

      const histMap=new Map<string,any>();
      for(const r of cr){
        const hd=isoDate(pick(r,"Data Criação Pedido","Data Criacao Pedido","Data")),
              hloja=String(pick(r,"Loja")||""),hst=stCode(hloja),
              hid=String(pick(r,"Matrícula","Matricula")||"").replace(/\.0$/,"").trim();
        if(!hd||!hid||!REGIONAL.has(hst)||!isCePiRegion(pick(r,"Regional")))continue;
        const delivery=deliveryTypeOf(r),isBopis=isBopisDelivery(delivery),approved=n(pick(r,"Aprovado"));
        const k=hd+"|"+hid+"|"+hst,
              q=histMap.get(k)||{date:hd,matricula:hid,store_code:hst,regional:"CE + PI",cargo:String(pick(r,"Cargo")||""),captured:0,approved:0,billed:0,rupture:0,commission:0,orders:0,items:0,bopisApproved:0,bopisCaptured:0,bopisOrders:0,commissionableApproved:0,deliveryTypes:new Set<string>()};
        q.captured+=n(pick(r,"Captação","Captacao"));q.approved+=approved;q.billed+=n(pick(r,"Faturamento"));q.rupture+=n(pick(r,"Ruptura"));
        q.orders+=Math.trunc(n(pick(r,"Qtd Pedidos","Qtde Pedidos"))||1);q.items+=n(pick(r,"Qtd Itens","Qtde Itens","Qtde Produtos"));
        if(delivery)q.deliveryTypes.add(delivery);
        if(hasDeliveryTypeColumn){
          if(isBopis){
            q.bopisApproved+=approved;
            q.bopisCaptured+=n(pick(r,"Captação","Captacao"));
            q.bopisOrders+=Math.trunc(n(pick(r,"Qtd Pedidos","Qtde Pedidos"))||1);
          }else q.commissionableApproved+=approved;
        }else q.commission+=n(pick(r,"Comissão Estimada","Comissao Estimada"));
        histMap.set(k,q);
      }
      const histRows=[...histMap.values()].map((q:any)=>{
        const verified=hasDeliveryTypeColumn,deliveryType=q.deliveryTypes.size===1?[...q.deliveryTypes][0]:(q.deliveryTypes.size>1?"MISTO":"");
        return {date:q.date,matricula:q.matricula,store_code:q.store_code,regional:q.regional,cargo:q.cargo,captured:+q.captured.toFixed(2),approved:+q.approved.toFixed(2),billed:+q.billed.toFixed(2),rupture:+q.rupture.toFixed(2),commission:verified?+(q.commissionableApproved*.03).toFixed(2):+q.commission.toFixed(2),orders:Math.trunc(q.orders),items:+q.items.toFixed(2),ticket:q.orders?+(q.captured/q.orders).toFixed(2):0,basket:q.orders?+(q.items/q.orders).toFixed(2):0,delivery_type:deliveryType,bopis_approved:verified?+q.bopisApproved.toFixed(2):null,bopis_captured:verified?+q.bopisCaptured.toFixed(2):null,bopis_orders:verified?Math.trunc(q.bopisOrders):null,commissionable_approved:verified?+q.commissionableApproved.toFixed(2):null,commission_verified:verified,imported_at:new Date().toISOString()};
      });
      for(let i=0;i<histRows.length;i+=300){const {error:dh}=await db.from("daily_collaborator").upsert(histRows.slice(i,i+300),{onConflict:"date,matricula,store_code"});if(dh)throw dh;}

      const collabMap=new Map<string,any>();
      for(const r of cr){
        const d=isoDate(pick(r,"Data Criação Pedido","Data Criacao Pedido","Data"));
        if(d!==requested)continue;
        const loja=String(pick(r,"Loja")||""),st=stCode(loja),id=String(pick(r,"Matrícula","Matricula")||"").replace(/\.0$/,"").trim(),regional=String(pick(r,"Regional")||"").trim();
        if(!id||!REGIONAL.has(st)||!isCePiRegion(regional))continue;
        const approved=n(pick(r,"Aprovado")),delivery=deliveryTypeOf(r),isBopis=isBopisDelivery(delivery);
        const k=st+"|"+id,q=collabMap.get(k)||{id,name:String(pick(r,"Nome","Colaborador","Nome Colaborador","Nome Vendedor","Vendedor")||"").trim(),regional,st,loja,c:0,a:0,o:0,com:0,bopis_a:0,bopis_c:0,bopis_o:0,commissionable_a:0,commission_verified:hasDeliveryTypeColumn};
        q.c+=n(pick(r,"Captação","Captacao"));q.a+=approved;q.o+=Math.trunc(n(pick(r,"Qtd Pedidos","Qtde Pedidos"))||1);
        if(hasDeliveryTypeColumn){
          if(isBopis){
            q.bopis_a+=approved;
            q.bopis_c+=n(pick(r,"Captação","Captacao"));
            q.bopis_o+=Math.trunc(n(pick(r,"Qtd Pedidos","Qtde Pedidos"))||1);
          }else q.commissionable_a+=approved;
        }else q.com+=n(pick(r,"Comissão Estimada","Comissao Estimada"));
        collabMap.set(k,q);
      }
      const collab=[...collabMap.values()].map((q:any)=>({...q,c:+q.c.toFixed(2),a:+q.a.toFixed(2),bopis_a:q.commission_verified?+q.bopis_a.toFixed(2):null,bopis_c:q.commission_verified?+q.bopis_c.toFixed(2):null,bopis_o:q.commission_verified?Math.trunc(q.bopis_o):null,commissionable_a:q.commission_verified?+q.commissionable_a.toFixed(2):null,com:q.commission_verified?+(q.commissionable_a*.03).toFixed(2):+q.com.toFixed(2)}));
      const management:any[]=[];
      for(const r of mr){
        if(!isCePiRegion(pick(r,"Regional")))continue;
        const loja=String(pick(r,"Loja")||""); if(loja==="Total")continue; const st=stCode(loja); if(!REGIONAL.has(st))continue;
        management.push({st,c:n(pick(r,"Captação","Captacao")),a:n(pick(r,"Aprovado")),o:n(pick(r,"Qtde Pedidos","Qtd Pedidos")),share:n(pick(r,"Share Loja %")),f:n(pick(r,"Faturamento")),meta1:n(pick(r,"Meta (1%)"))});
      }
      if(!collab.length||!management.length)return json({
        error:"Importação não concluída: "+(!collab.length?"nenhum pedido válido de "+requested+" para CE+PI no relatório por colaborador. ":"")+(!management.length?"nenhuma filial CE+PI reconhecida no relatório gerencial.":""),
        collaborators:collab.length,management:management.length,diagnostics
      },400);
      const collabCaptured=collab.reduce((s:any,r:any)=>s+n(r.c),0),managementCaptured=management.reduce((s:any,r:any)=>s+n(r.c),0);
      const managementMode=(managementCaptured>50000&&collabCaptured>0&&managementCaptured>collabCaptured*5)?"cumulative_ytd":"daily";
      const {error}=await db.from("daily_updates").upsert({result_date:requested,collaborators:collab,management,management_mode:managementMode,imported_by:matricula,imported_at:new Date().toISOString()},{onConflict:"result_date"});
      if(error)throw error;
      await db.from("import_log").insert({result_date:requested,collaborators_count:collab.length,management_count:management.length,action:"upsert",imported_by:matricula});
      const month=requested.slice(0,7),magg:any={};
      for(const r of collab){
        if(r.regional!=="CE + PI")continue;
        const k=String(r.id)+"|"+String(r.st);
        magg[k]=magg[k]||{month,matricula:String(r.id),store_code:String(r.st),captured:0,approved:0,orders:0,eday_approved:0,bopis_approved:0,bopis_captured:0,bopis_orders:0,commissionable_approved:0,commission_verified:true};
        magg[k].captured+=n(r.c);magg[k].approved+=n(r.a);magg[k].orders+=Math.trunc(n(r.o));
        magg[k].commission_verified=magg[k].commission_verified&&r.commission_verified===true;
        if(r.commission_verified===true){
          magg[k].bopis_approved+=n(r.bopis_a);magg[k].bopis_captured+=n(r.bopis_c);magg[k].bopis_orders+=Math.trunc(n(r.bopis_o));magg[k].commissionable_approved+=n(r.commissionable_a);
          if(dateObj(requested).getUTCDay()===1&&requested>="2026-08-01")magg[k].eday_approved+=n(r.commissionable_a);
        }
      }
      const {data:upsMonth,error:ume}=await db.from("daily_updates").select("result_date,collaborators").gte("result_date",month+"-01").lt("result_date",(()=>{const [y,m]=month.split("-").map(Number);return new Date(Date.UTC(y,m,1)).toISOString().slice(0,10)})());
      if(ume)throw ume;
      const rebuilt:any={};
      for(const up of upsMonth||[]){
        for(const r of(up.collaborators||[])){
          if(r.regional!=="CE + PI")continue;
          const k=String(r.id)+"|"+String(r.st);
          rebuilt[k]=rebuilt[k]||{month,matricula:String(r.id),store_code:String(r.st),captured:0,approved:0,orders:0,eday_approved:0,bopis_approved:0,bopis_captured:0,bopis_orders:0,commissionable_approved:0,commission_verified:true};
          rebuilt[k].captured+=n(r.c);rebuilt[k].approved+=n(r.a);rebuilt[k].orders+=Math.trunc(n(r.o));
          rebuilt[k].commission_verified=rebuilt[k].commission_verified&&r.commission_verified===true;
          if(r.commission_verified===true){
            rebuilt[k].bopis_approved+=n(r.bopis_a);rebuilt[k].bopis_captured+=n(r.bopis_c);rebuilt[k].bopis_orders+=Math.trunc(n(r.bopis_o));rebuilt[k].commissionable_approved+=n(r.commissionable_a);
            if(dateObj(String(up.result_date)).getUTCDay()===1&&String(up.result_date)>="2026-08-01")rebuilt[k].eday_approved+=n(r.commissionable_a);
          }
        }
      }
      const {error:delm}=await db.from("monthly_collaborator_history").delete().eq("month",month);if(delm)throw delm;
      for(const row of Object.values(rebuilt) as any[]){
        const {error:mh}=await db.from("monthly_collaborator_history").upsert({...row,bopis_approved:row.commission_verified?+n(row.bopis_approved).toFixed(2):null,bopis_captured:row.commission_verified?+n(row.bopis_captured).toFixed(2):null,bopis_orders:row.commission_verified?Math.trunc(n(row.bopis_orders)):null,commissionable_approved:row.commission_verified?+n(row.commissionable_approved).toFixed(2):null,updated_at:new Date().toISOString()},{onConflict:"month,matricula,store_code"});
        if(mh)throw mh;
      }
      return json({ok:true,date:requested,collaborators:collab.length,management:management.length,commissionVerified:hasDeliveryTypeColumn,message:hasDeliveryTypeColumn?"Resultado incorporado ao histórico com sucesso. Comissão calculada com exclusão de BOPIS.":"Resultado incorporado ao histórico. Comissão não publicada: o relatório de colaboradores precisa conter a coluna Tipo Entrega para separar BOPIS."});
    }
    const body=await req.json();
    if(String(body.matricula||"")==="0000000"){
      const demoRead=new Set(["guest_dashboard","community_get","profile_preferences_get","support_get","result_extras","store_period","person_period","commission_history","commission_period","pool_rankings","eday_get","notifications_get","hourly_get","meta_assign_get","branding_get","content_get","ritual_get","ritual_weekly_get","fca_dashboard","supervisor_highlights","team_period","ranking_period","voice_badge","voice_list","celebration_get"]);
      if(!demoRead.has(String(body.action||"")))return json({error:"Modo visitante é somente leitura."},403);
    }
    if(body.action==="delta"){
      return json({error:"Ação descontinuada. Utilize os endpoints oficiais por perfil e período."},410);
    }
    if(body.action==="celebration_get"){
      const id=String(body.matricula||"").trim();
      if(id==="0000000")return json({ok:true,date:fortalezaToday(),events:[]});
      if(!/^\d+$/.test(id))return json({error:"Matrícula inválida."},400);
      const ctx=await actorContext(id);
      if(!ctx)return json({error:"Matrícula não localizada."},404);
      const out=await celebrationForMatricula(id);
      return json({ok:true,...out});
    }

    if(body.action==="dashboard"){
      const data=await buildDashboard(String(body.matricula||""));
      return data?json({ok:true,...data}):json({error:"Matrícula não localizada."},404);
    }
    if(body.action==="guest_dashboard"){
      const sourceId=await demoSourceMatricula();
      const live=await buildDashboard(sourceId);
      if(!live?.common?.stores?.["108"])return json({error:"Modo demonstração indisponível."},503);
      const base=structuredClone(live.common);
      const asof=String(live.asof||BASELINE),updatedAt=String(live.updatedAt||"");
      for(const st of Object.keys(base.stores||{})){
        const store=base.stores[st]||{};store.sup=[];
        for(const period of PERIODS){
          const pp=store?.p?.[period];
          if(pp&&Array.isArray(pp.top))pp.top=pp.top.map((x:any,i:number)=>({...x,id:"DEMO-"+st+"-"+period+"-"+String(i+1),name:"Colaborador "+String(i+1)}));
        }
      }
      const p:any={},team:any={};
      for(const period of PERIODS){
        const top=base?.stores?.["108"]?.p?.[period]?.top||[],lead=top[0]||{};
        p[period]={c:n(lead.c),a:n(lead.a),o:Math.trunc(n(lead.o)),com:+(n(lead.a)*.03).toFixed(2),rr:null,nr:null};
        team[period]=top.map((x:any,i:number)=>({id:"DEMO"+String(i+1),name:"Colaborador "+String(i+1),c:n(x.c),a:n(x.a),o:Math.trunc(n(x.o)),rr:null,nr:null,status:"Atividade Normal"}));
      }
      const storeMonth=base?.stores?.["108"]?.p?.month||{};
      const demoUser={u:{id:"0000000",name:"VISITANTE • DEMONSTRAÇÃO",st:"108",role:"SUPERVISOR • MODO DEMONSTRAÇÃO • SOMENTE LEITURA",status:"Ativo"},p,lead:true,admin:true,profileType:"supervisor",menuPermissions:[],team,pool:{approved:n(storeMonth.a),pool:n(storeMonth.a)*.03,eligible:[],sim:n(storeMonth.a)*.01},nextDayMeta:0,nextDay:asof,hcSchedule:{},demo:true};
      return json({ok:true,asof,updatedAt,common:base,user:demoUser,demo:true});
    }
    if(body.action==="community_get"){
      const actor=String(body.matricula||""),isDemoActor=actor==="0000000";
      const actorCtx=await actorContext(actor);if(!actorCtx)return json({error:"Acesso não autorizado."},403);
      const {data,error}=await db.from("community_posts").select("*").eq("active",true).order("created_at",{ascending:false}).limit(60);
      if(error)throw error;
      const items=data||[], ids=items.map((x:any)=>x.id);
      if(ids.length){
        const [{data:likes,error:le},{data:comments,error:ce}]=await Promise.all([
          db.from("community_likes").select("post_id,matricula").in("post_id",ids),
          db.from("community_comments").select("*").in("post_id",ids).eq("active",true).order("created_at",{ascending:true})
        ]);
        if(le)throw le;if(ce)throw ce;
        for(const x of items){
          const xl=(likes||[]).filter((v:any)=>String(v.post_id)===String(x.id));
          x.like_count=xl.length;x.liked_by_me=!!actor&&xl.some((v:any)=>String(v.matricula)===actor);
          x.comments=(comments||[]).filter((v:any)=>String(v.post_id)===String(x.id));
          x.comment_count=x.comments.length;
        }
      }
      if(isDemoActor){
        for(const x of items){
          x.author_matricula="DEMO";x.author_name="Equipe Loja "+String(x.store_code||"");
          x.liked_by_me=false;
          x.comments=(x.comments||[]).map((z:any)=>({...z,matricula:"DEMO",author_name:"Equipe Regional"}));
        }
      }
      return json({ok:true,items});
    }
    if(body.action==="community_like"){
      const actor=String(body.matricula||""),postId=String(body.post_id||"");
      if(!actor||!postId)return json({error:"Dados inválidos."},400);
      const {data:post}=await db.from("community_posts").select("id").eq("id",postId).eq("active",true).maybeSingle();if(!post)return json({error:"Publicação não localizada."},404);
      const {data:hit,error:he}=await db.from("community_likes").select("id").eq("post_id",postId).eq("matricula",actor).maybeSingle();if(he)throw he;
      if(hit){const {error}=await db.from("community_likes").delete().eq("id",hit.id);if(error)throw error;}
      else {const {error}=await db.from("community_likes").insert({post_id:postId,matricula:actor});if(error)throw error;}
      const {count,error:ce}=await db.from("community_likes").select("*",{count:"exact",head:true}).eq("post_id",postId);if(ce)throw ce;
      return json({ok:true,liked:!hit,like_count:count||0});
    }
    if(body.action==="community_comment"){
      const actor=String(body.matricula||""),postId=String(body.post_id||""),bodyText=String(body.body||"").trim().slice(0,1000),fallbackStore=String(body.store_code||"").padStart(3,"0");
      if(!actor||!postId||!bodyText)return json({error:"Digite um comentário."},400);
      let authorName="",authorStore=fallbackStore;const users=await allUserState();
      for(const st of Object.keys(users)){const u=(users[st]?.users||[]).find((x:any)=>String(x.id)===actor);if(u){authorName=String(u.name||"").trim();authorStore=String(u.st||st).padStart(3,"0");break;}}
      if(!authorName){const {data:p}=await db.from("collaborators").select("nome,store_code").eq("matricula",actor).maybeSingle();if(p){authorName=String(p.nome||"").trim();authorStore=String(p.store_code||fallbackStore).padStart(3,"0");}}
      if(!authorName&&await adminAllowed(actor)){authorName=String(body.author_name||"Administrador").trim()||"Administrador";authorStore=REGIONAL.has(fallbackStore)?fallbackStore:"108";}
      if(!authorName)return json({error:"Apenas usuários cadastrados podem comentar."},403);
      const {data,error}=await db.from("community_comments").insert({post_id:postId,matricula:actor,author_name:authorName,store_code:authorStore,body:bodyText}).select().single();if(error)throw error;
      return json({ok:true,comment:data});
    }
    if(body.action==="community_delete"){
      const actor=String(body.matricula||""),id=String(body.id||"");
      const {data:post,error:pe}=await db.from("community_posts").select("author_matricula").eq("id",id).maybeSingle();if(pe)throw pe;if(!post)return json({error:"Publicação não localizada."},404);
      const can=String(post.author_matricula)===actor || await adminAllowed(actor);
      if(!can)return json({error:"Sem permissão para excluir esta publicação."},403);
      const {error}=await db.from("community_posts").update({active:false}).eq("id",id);if(error)throw error;return json({ok:true});
    }
    if(body.action==="profile_preferences_get"){
      const matricula=String(body.matricula||"").trim();const {data,error}=await db.from("profile_preferences").select("preferred_name").eq("matricula",matricula).maybeSingle();if(error)throw error;return json({ok:true,preferred_name:data?.preferred_name||""});
    }
    if(body.action==="profile_preferences_set"){
      const matricula=String(body.matricula||"").trim(),preferred_name=String(body.preferred_name||"").trim().slice(0,40);if(!/^\d{4,10}$/.test(matricula))return json({error:"Matrícula inválida."},400);if(!preferred_name)return json({error:"Informe o nome de preferência."},400);const {error}=await db.from("profile_preferences").upsert({matricula,preferred_name,updated_at:new Date().toISOString()},{onConflict:"matricula"});if(error)throw error;return json({ok:true,preferred_name});
    }
    if(body.action==="profile_photo_set"){
      const matricula=String(body.matricula||"").trim(), dataUrl=String(body.dataUrl||"");
      if(!/^\d{4,10}$/.test(matricula))return json({error:"Matrícula inválida."},400);
      const isSelfAdmin=await adminAllowed(matricula);
      if(body.target_matricula && String(body.target_matricula)!==matricula && !isSelfAdmin)return json({error:"Sem permissão para alterar foto de outra matrícula."},403);
      const {bytes,mime}=dataUrlBytes(dataUrl);
      if(bytes.length>1500000)return json({error:"Imagem processada ainda está muito grande."},400);
      const ext=mime.includes("png")?"png":"jpg";
      const path="profiles/"+matricula+"."+ext;
      const {error:upErr}=await db.storage.from("estore-public").upload(path,bytes,{upsert:true,contentType:mime});
      if(upErr)throw upErr;
      const photo_url=db.storage.from("estore-public").getPublicUrl(path).data.publicUrl+"?v="+Date.now();
      const {error}=await db.from("profile_photos").upsert({matricula,photo_url,updated_at:new Date().toISOString()},{onConflict:"matricula"});
      if(error)throw error;
      return json({ok:true,photo_url});
    }
    if(body.action==="support_get"){
      const matricula=String(body.matricula||""), target=String(body.target||matricula);
      const st=await getState(["config"]);
      const isAdmin=await adminAllowed(matricula);
      if(isAdmin && body.listThreads){
        const {data,error}=await db.from("support_messages").select("matricula,store_code,message,attachment_name,created_at,sender_role").order("created_at",{ascending:false}).limit(300);
        if(error)throw error;
        const seen=new Set<string>(),threads:any[]=[];
        for(const r of data||[]) if(!seen.has(r.matricula)){seen.add(r.matricula);threads.push(r);}
        const users=await allUserState(); const names:any={}; for(const st of Object.keys(users)) for(const u of (users[st]?.users||[])) names[String(u.id)]=String(u.name||"").trim().split(/\s+/)[0]||String(u.id);
        for(const t of threads) t.first_name=names[String(t.matricula)]||"";
        return json({ok:true,isAdmin:true,threads});
      }
      const threadMatricula=isAdmin&&target?target:matricula;
      const {data,error}=await db.from("support_messages").select("*").eq("matricula",threadMatricula).order("created_at",{ascending:true}).limit(300);
      if(error)throw error;
      const users=await allUserState(); let first_name=""; for(const st of Object.keys(users)){ const u=(users[st]?.users||[]).find((x:any)=>String(x.id)===String(threadMatricula)); if(u){first_name=String(u.name||"").trim().split(/\s+/)[0];break;} }
      return json({ok:true,isAdmin,messages:data||[],thread:threadMatricula,first_name});
    }
    if(body.action==="support_status"){
      const matricula=String(body.matricula||""), target=String(body.target||""), status=String(body.status||"open");
      if(!(await adminAllowed(matricula)))return json({error:"Não autorizado."},403);
      if(!["open","in_progress","resolved"].includes(status)||!target)return json({error:"Dados inválidos."},400);
      const {error}=await db.from("support_messages").update({status,response_status:status,updated_at:new Date().toISOString()}).eq("matricula",target); if(error)throw error;
      return json({ok:true,status});
    }
    if(body.action==="hourly_submit"){
      const matricula=String(body.matricula||""), store_code=String(body.store_code||""), result_date=String(body.result_date||"");
      const captured=n(body.captured), store_sales=n(body.store_sales), orders=Math.trunc(n(body.orders));
      const noNewSales=body.confirm_no_sales===true;
      if(!REGIONAL.has(store_code)||!/^\d{4}-\d{2}-\d{2}$/.test(result_date)||captured<0||store_sales<0||orders<0)return json({error:"Dados inválidos."},400);
      if(noNewSales&&(captured!==0||orders!==0||store_sales!==0||result_date!==fortalezaToday()))return json({error:"Confirmação sem novas vendas permitida somente para hoje, sem valores de captação ou pedidos."},400);
      const users=await allUserState(); let me:any=null; for(const st of Object.keys(users)){const u=(users[st]?.users||[]).find((x:any)=>String(x.id)===matricula);if(u){me=u;break;}}
      const isAdmin=await adminAllowed(matricula); if(!me&&!isAdmin)return json({error:"Matrícula não localizada."},404);
      if(!isAdmin && (!me?.lead || String(me.st)!==store_code))return json({error:"Somente o supervisor da filial pode atualizar o Hora a Hora."},403);
      const {data:recent}=await db.from("hourly_estore").select("id,captured,orders,created_at,entry_kind").eq("result_date",result_date).eq("store_code",store_code).eq("matricula",matricula).eq("status","active").order("created_at",{ascending:false}).limit(1);
      const dup=recent?.[0] && n(recent[0].captured)===captured && Math.trunc(n(recent[0].orders))===orders && (Date.now()-new Date(recent[0].created_at).getTime())<120000 && (noNewSales?recent[0].entry_kind==="no_sales_update":recent[0].entry_kind!=="no_sales_update");
      if(noNewSales&&dup)return json({ok:true,already_confirmed:true});
      if(dup && !body.confirm_duplicate)return json({error:"Possível lançamento duplicado. Confirme para registrar novamente.",duplicate:true},409);
      const {data,error}=await db.from("hourly_estore").insert({result_date,store_code,matricula,captured,store_sales,orders,source:isAdmin?"admin":"store",status:"active",entry_kind:noNewSales?"no_sales_update":"incremental",note:noNewSales?"Parcial confirmada sem novos pedidos; não altera captação":null,actor_name:String(me?.name||""),actor_role:String(me?.role||"Administrador")}).select().single();
      if(error)throw error; return json({ok:true,row:data,checkin:noNewSales});
    }
    if(body.action==="hourly_manage"){
      const matricula=String(body.matricula||""), id=String(body.id||""), op=String(body.op||"");
      const state=await getState(["config"]); const isAdmin=await adminAllowed(matricula);
      const {data:row,error:re}=await db.from("hourly_estore").select("*").eq("id",id).maybeSingle(); if(re)throw re;
      if(!row)return json({error:"Lançamento não localizado."},404);
      if(!(isAdmin||String(row.matricula)===matricula))return json({error:"Sem permissão para alterar este lançamento."},403);
      if(op==="delete"){const {error}=await db.from("hourly_estore").update({status:"deleted",updated_at:new Date().toISOString(),updated_by:matricula,deleted_at:new Date().toISOString(),deleted_by:matricula}).eq("id",id);if(error)throw error;return json({ok:true});}
      if(op==="edit"){
        const captured=n(body.captured),orders=Math.trunc(n(body.orders)); if(captured<0||orders<0)return json({error:"Valores inválidos."},400);
        const {data,error}=await db.from("hourly_estore").update({captured,orders,updated_at:new Date().toISOString(),updated_by:matricula}).eq("id",id).select().single();if(error)throw error;return json({ok:true,row:data});
      }
      return json({error:"Operação inválida."},400);
    }
    if(body.action==="result_extras"){
      const matricula=String(body.matricula||"").trim(),period=PERIODS.includes(String(body.period||"month"))?String(body.period||"month"):"month";
      if(!/^\d+$/.test(matricula))return json({error:"Matrícula inválida."},400);
      const personId=matricula==="0000000"?await demoSourceMatricula():matricula;
      const latest=(await db.from("daily_updates").select("result_date").order("result_date",{ascending:false}).limit(1)).data?.[0]?.result_date||BASELINE;
      let start=latest,end=latest;
      if(period==="week"){const d=new Date(latest+"T12:00:00Z"),dow=d.getUTCDay()||7;d.setUTCDate(d.getUTCDate()-dow+1);start=d.toISOString().slice(0,10)}
      else if(period==="month"){start=latest.slice(0,7)+"-01"}
      else if(period==="year"){start=latest.slice(0,4)+"-01-01"}
      const {data:rows,error}=await db.from("daily_collaborator").select("date,store_code,matricula,approved,captured,commissionable_approved,commission_verified").gte("date",start).lte("date",end);if(error)throw error;
      let sourceRows:any[]=rows||[];
      if(!sourceRows.length){const {data:ups,error:ue}=await db.from("daily_updates").select("result_date,collaborators").gte("result_date",start).lte("result_date",end);if(ue)throw ue;sourceRows=[];for(const up of ups||[])for(const x of(up.collaborators||[]))sourceRows.push({date:up.result_date,store_code:String(x.st||""),matricula:String(x.id||""),approved:n(x.a),captured:n(x.c)})}
      const mine=sourceRows.filter((r:any)=>String(r.matricula)===personId),st=String(mine[0]?.store_code||body.store||"108").padStart(3,"0");
      const sums=new Map<string,number>();for(const r of sourceRows){if(String(r.store_code).padStart(3,"0")!==st)continue;const id=String(r.matricula),v=n(r.captured);sums.set(id,(sums.get(id)||0)+v)}
      if(period==="month"){const state=await getState(["common_base","users_"+st]);const top=state.common_base?.stores?.[st]?.p?.month?.top||[];for(const x of top)sums.set(String(x.id),n(x.c));const us=state["users_"+st]?.[st]?.users||[];for(const x of us){const v=n(x?.p?.month?.c);if(v>0)sums.set(String(x.id),v)}}
      const ordered=[...sums.entries()].sort((a,b)=>b[1]-a[1]),idx=ordered.findIndex(x=>x[0]===personId);
      const cfg=(await getState(["eday_config"])).eday_config||{active:true,rate:.10,start:"",end:""};let edayApproved=0;
      const commissionVerified=mine.length===0?true:mine.every((r:any)=>r.commission_verified===true);
      for(const r of mine){const d=String(r.date),dow=new Date(d+"T12:00:00Z").getUTCDay(),isE=cfg.active!==false&&dow===1&&(!cfg.start||d>=cfg.start)&&(!cfg.end||d<=cfg.end);if(isE&&r.commission_verified===true)edayApproved+=n(r.commissionable_approved)}
      return json({ok:true,period,storeRank:idx>=0?idx+1:null,commissionVerified,edayApproved:+edayApproved.toFixed(2),edayCommission:commissionVerified?+(edayApproved*n(cfg.rate||.10)).toFixed(2):0,edayRate:n(cfg.rate||.10)});
    }
    if(body.action==="store_period"){
      const matricula=String(body.matricula||"").trim(),st=String(body.store||"").padStart(3,"0"),period=PERIODS.includes(String(body.period||"month"))?String(body.period||"month"):"month";
      const actorCtx=await actorContext(matricula);if(!actorCtx)return json({error:"Acesso não autorizado."},403);if(!actorCtx.admin&&actorCtx.st!==st)return json({error:"Acesso restrito à sua filial."},403);
      if(!/^\d+$/.test(matricula)||!REGIONAL.has(st))return json({error:"Parâmetros inválidos."},400);

      const state=await getState(["common_base","annual_store_actuals_2026","supervisor_share_official"]);
      const base=state.common_base||{},bs=base?.stores?.[st]?.p||{};

      const [lastCollab,lastUpdate]=await Promise.all([
        db.from("daily_collaborator").select("date").order("date",{ascending:false}).limit(1),
        db.from("daily_updates").select("result_date").order("result_date",{ascending:false}).limit(1)
      ]);
      const endDate=String([lastCollab.data?.[0]?.date,lastUpdate.data?.[0]?.result_date,BASELINE].filter(Boolean).sort().at(-1)||BASELINE);
      let startDate=endDate;
      if(period==="week"){const d=new Date(endDate+"T12:00:00Z"),dow=d.getUTCDay()||7;d.setUTCDate(d.getUTCDate()-dow+1);startDate=d.toISOString().slice(0,10)}
      else if(period==="month")startDate=endDate.slice(0,7)+"-01";
      else if(period==="year")startDate=endDate.slice(0,4)+"-01-01";

      const dailyRows:any[]=[];
      for(let from=0;;from+=500){
        const {data:chunk,error:de}=await db.from("daily_collaborator")
          .select("date,captured,approved,orders")
          .eq("store_code",st).gte("date",startDate).lte("date",endDate)
          .order("date",{ascending:true}).range(from,from+499);
        if(de)throw de;
        dailyRows.push(...(chunk||[]));
        if(!chunk||chunk.length<500)break;
      }

      const byDate=new Map<string,{c:number,a:number,o:number}>();
      for(const r of dailyRows){
        const d=String(r.date),q=byDate.get(d)||{c:0,a:0,o:0};
        q.c+=n(r.captured);q.a+=n(r.approved);q.o+=Math.trunc(n(r.orders));byDate.set(d,q);
      }

      const {data:futureUps,error:ue}=await db.from("daily_updates")
        .select("result_date,management,management_mode")
        .gt("result_date",BASELINE).lte("result_date",endDate)
        .order("result_date",{ascending:true});
      if(ue)throw ue;
      const rowFor=(up:any)=>((up?.management||[]).find((r:any)=>String(r.st||"").padStart(3,"0")===st)||null);

      // Se o gerencial do dia chegar antes do relatório por colaborador, completa o período
      // sem duplicar datas já presentes no Tabelão.
      for(const up of futureUps||[]){
        const d=String(up.result_date);
        if(d<startDate||d>endDate||String(up.management_mode||"daily")!=="daily"||byDate.has(d))continue;
        const r=rowFor(up);if(!r)continue;
        byDate.set(d,{c:n(r.c),a:n(r.a),o:Math.trunc(n(r.o))});
      }

      let captured=[...byDate.values()].reduce((s,r)=>s+r.c,0);
      let approved=[...byDate.values()].reduce((s,r)=>s+r.a,0);
      let orders=[...byDate.values()].reduce((s,r)=>s+r.o,0);
      let hist:any[]=[...byDate.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([d,r])=>[d,+r.c.toFixed(2)]);

      let share=0,denom=0;
      const bp=bs?.[period]||{};
      const baselineInPeriod=startDate<=BASELINE&&BASELINE<=endDate;

      if(period==="year"){
        const annual=state.annual_store_actuals_2026?.[st]||{};
        const annualAsOf=String(annual.asof||BASELINE);
        captured=n(annual.c);approved=n(annual.a);orders=Math.trunc(n(annual.o));
        denom=n(annual.c)>0&&n(annual.share)>0?n(annual.c)/n(annual.share):0;
        for(const up of futureUps||[]){
          const d=String(up.result_date);if(d<=annualAsOf||d<startDate||d>endDate)continue;
          if(String(up.management_mode||"daily")!=="daily")continue;
          const r=rowFor(up);if(!r)continue;
          captured+=n(r.c);approved+=n(r.a);orders+=Math.trunc(n(r.o));
          if(n(r.c)>0&&n(r.share)>0)denom+=n(r.c)/n(r.share);
        }
        share=denom>0?captured/denom:n(annual.share);
        const months=new Map<string,number>();
        for(const [d,r] of byDate){const ym=d.slice(0,7);months.set(ym,(months.get(ym)||0)+r.c)}
        hist=[...months.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([ym,v])=>[ym,+v.toFixed(2)]);
      }else{
        if(baselineInPeriod&&n(bp.c)>0&&n(bp.share)>0)denom+=n(bp.c)/n(bp.share);
        for(const up of futureUps||[]){
          const d=String(up.result_date);if(d<startDate||d>endDate)continue;
          if(String(up.management_mode||"daily")!=="daily")continue;
          const r=rowFor(up);if(!r)continue;
          if(n(r.c)>0&&n(r.share)>0)denom+=n(r.c)/n(r.share);
        }
        if(period==="day"){
          const sameDay=(futureUps||[]).find((u:any)=>String(u.result_date)===endDate);
          const r=sameDay?rowFor(sameDay):null;
          share=r?n(r.share):(endDate===BASELINE?n(bp.share):0);
        }else{
          share=denom>0?captured/denom:n(bp.share);
        }
      }

      let directShareSource=period==="year"?"gestao_lojas_acumulado":"tabelao_reconciliado_gestao";
      if(period==="week"||period==="month"){
        const snap=period==="week"
          ?state.supervisor_share_official?.week?.[startDate]
          :state.supervisor_share_official?.month?.[startDate.slice(0,7)];
        if(snap?.stores&&Object.prototype.hasOwnProperty.call(snap.stores,st)){
          share=n(snap.stores[st]);
          directShareSource=period==="week"?"relatorio_gerencial_semanal_oficial":"relatorio_gerencial_mensal_oficial";
        }
      }

      return json({
        ok:true,period,store:st,startDate,endDate,
        source:directShareSource,
        captured:+captured.toFixed(2),approved:+approved.toFixed(2),orders,
        share:+share.toFixed(10),history:hist,
        managementMode:endDate>BASELINE?"baseline_mais_incrementos":"baseline_25_09"
      });
    }
    if(body.action==="person_period"){
      const matricula=String(body.matricula||"").trim(),period=PERIODS.includes(String(body.period||"month"))?String(body.period||"month"):"month";
      if(!/^\d+$/.test(matricula))return json({error:"Matrícula inválida."},400);
      const personId=matricula==="0000000"?await demoSourceMatricula():matricula;
      const commissionEligibility=await commissionEligibilityForMatricula(matricula==="0000000"?"0000000":personId);
      const personMeta=await db.from("collaborators").select("matricula,nome,store_code,cargo").eq("matricula",personId).maybeSingle();
      if(personMeta.error)throw personMeta.error;

      const lr=await db.from("daily_collaborator").select("date").order("date",{ascending:false}).limit(1);
      const latest=String(lr.data?.[0]?.date||BASELINE);
      let start=latest;
      if(period==="week"){
        const d=new Date(latest+"T12:00:00Z"),dow=d.getUTCDay()||7;
        d.setUTCDate(d.getUTCDate()-dow+1);start=d.toISOString().slice(0,10);
      }else if(period==="month")start=latest.slice(0,7)+"-01";
      else if(period==="year")start=latest.slice(0,4)+"-01-01";

      const {data,error}=await db.from("daily_collaborator")
        .select("date,store_code,captured,approved,orders,commissionable_approved,bopis_approved,bopis_captured,bopis_orders,commission_verified")
        .eq("matricula",personId).gte("date",start).lte("date",latest).order("date",{ascending:true});
      if(error)throw error;

      let captured=0,approved=0,orders=0,com=0,eday=0,commissionableApproved=0,bopisApproved=0,bopisCaptured=0,bopisOrders=0;
      const cfg=(await getState(["eday_config"])).eday_config||{active:true,rate:.10,start:"2026-08-01",end:""};
      const commissionVerified=(data||[]).length===0?true:(data||[]).every((r:any)=>r.commission_verified===true);
      const saleByDate=new Map<string,number>();

      for(const r of data||[]){
        const d=String(r.date),a=n(r.approved),ca=r.commission_verified===true?n(r.commissionable_approved):0,
              ba=r.commission_verified===true?n(r.bopis_approved):0,
              isE=cfg.active!==false&&new Date(d+"T12:00:00Z").getUTCDay()===1&&d>=String(cfg.start||"2026-08-01")&&(!cfg.end||d<=cfg.end);
        captured+=n(r.captured);approved+=a;orders+=Math.trunc(n(r.orders));commissionableApproved+=ca;bopisApproved+=ba;
        bopisCaptured+=r.commission_verified===true?n(r.bopis_captured):0;
        bopisOrders+=r.commission_verified===true?Math.trunc(n(r.bopis_orders)):0;
        saleByDate.set(d,(saleByDate.get(d)||0)+n(r.captured));
        const cc=commissionEligibility.eligible&&r.commission_verified===true?ca*(isE?n(cfg.rate||.10):.03):0;
        com+=cc;if(isE)eday+=cc;
      }

      const rpRows:any[]=[];
      for(let from=0;;from+=500){
        const q=await db.from("daily_collaborator").select("date,matricula,store_code,captured,approved")
          .gte("date",start).lte("date",latest).order("date",{ascending:true}).range(from,from+499);
        if(q.error)throw q.error;
        rpRows.push(...(q.data||[]));
        if(!q.data||q.data.length<500)break;
      }

      const m=new Map<string,any>();
      for(const r of rpRows){
        const id=String(r.matricula),q=m.get(id)||{id,st:String(r.store_code||"").padStart(3,"0"),c:0};
        q.c+=n(r.captured);m.set(id,q);
      }

      const st=String(personMeta.data?.store_code||(data||[]).at(-1)?.store_code||"").padStart(3,"0");
      const personName=String(personMeta.data?.nome||"Colaborador");
      const sold=[...m.values()].filter(x=>x.c>0).sort((a,b)=>b.c-a.c),me=sold.findIndex(x=>x.id===personId),
            fil=sold.filter(x=>x.st===st),fi=fil.findIndex(x=>x.id===personId);

      const closedSundayStores=new Set(["084","113","146"]);
      const isOperationalDate=(d:string)=>{
        const dow=new Date(d+"T12:00:00Z").getUTCDay();
        return !(dow===0&&closedSundayStores.has(st));
      };
      const operationDates=[...new Set(rpRows.map((r:any)=>String(r.date||"")).filter(Boolean))].filter(isOperationalDate).sort();
      const daysWithSale=operationDates.filter(d=>n(saleByDate.get(d))>0).length;
      const zeroDays=Math.max(0,operationDates.length-daysWithSale);
      const frequency=operationDates.length?daysWithSale/operationDates.length:0;
      let periodZeroStreak=0;
      for(let i=operationDates.length-1;i>=0;i--){
        if(n(saleByDate.get(operationDates[i]))>0)break;
        periodZeroStreak++;
      }

      const recentStart=addIsoDays(latest,-45),recentRows:any[]=[];
      for(let from=0;;from+=500){
        const q=await db.from("daily_collaborator").select("date,matricula,store_code,captured")
          .gte("date",recentStart).lte("date",latest).order("date",{ascending:true}).range(from,from+499);
        if(q.error)throw q.error;
        recentRows.push(...(q.data||[]));
        if(!q.data||q.data.length<500)break;
      }
      const recentDates=[...new Set(recentRows.map((r:any)=>String(r.date||"")).filter(Boolean))].filter(isOperationalDate).sort();
      const recentPersonSales=new Map<string,number>();
      for(const r of recentRows){
        if(String(r.matricula)!==personId)continue;
        const d=String(r.date||"");recentPersonSales.set(d,(recentPersonSales.get(d)||0)+n(r.captured));
      }
      let zeroStreak=0,lastSaleDate="";
      for(let i=recentDates.length-1;i>=0;i--){
        const d=recentDates[i];
        if(n(recentPersonSales.get(d))>0){lastSaleDate=d;break}
        zeroStreak++;
      }
      if(!lastSaleDate){
        const prior=(data||[]).filter((r:any)=>n(r.captured)>0).at(-1);
        lastSaleDate=prior?String(prior.date||""):"";
      }

      const storeApprovedPeople=rpRows.filter((r:any)=>String(r.store_code||"").padStart(3,"0")===st).reduce((s:number,r:any)=>s+n(r.approved),0);
      const mgmt=await db.from("daily_updates").select("result_date,management").gte("result_date",start).lte("result_date",latest).order("result_date",{ascending:true});
      if(mgmt.error)throw mgmt.error;
      let officialApproved=0,officialDays=0;
      for(const up of mgmt.data||[]){
        const row=(Array.isArray(up.management)?up.management:[]).find((x:any)=>String(x.st||"").padStart(3,"0")===st);
        if(!row)continue;
        officialDays++;officialApproved+=n(row.a);
      }
      const officialCoverage=operationDates.length?officialDays/operationDates.length:0;
      const useOfficial=officialCoverage>=.75;
      const storeApproved=useOfficial?officialApproved:storeApprovedPeople;
      const participation=storeApproved>0?approved/storeApproved:0;

      const rhythmDaily=operationDates.slice(-31).map(d=>({date:d,captured:+n(saleByDate.get(d)).toFixed(2),sold:n(saleByDate.get(d))>0}));
      const voice=await db.from("collaborator_voice").select("id,status,cause_code,cause_detail,suggested_improvement,action_plan,supervisor_note,created_at,updated_at")
        .eq("matricula",personId).order("created_at",{ascending:false}).limit(1);
      if(voice.error)throw voice.error;

      return json({
        ok:true,period,startDate:start,endDate:latest,
        captured:+captured.toFixed(2),approved:+approved.toFixed(2),orders,
        commission:+com.toFixed(2),eday:+eday.toFixed(2),
        commissionableApproved:+commissionableApproved.toFixed(2),
        bopisApproved:+bopisApproved.toFixed(2),bopisCaptured:+bopisCaptured.toFixed(2),bopisOrders:Math.trunc(bopisOrders),
        commissionVerified,commissionBasis:"approved_excluding_bopis",
        commissionEligible:commissionEligibility.eligible,commissionEligibilityReason:commissionEligibility.reason,contractRole:commissionEligibility.role,
        regionalRank:me>=0?me+1:null,storeRank:fi>=0?fi+1:null,
        rhythm:{
          operationalDays:operationDates.length,
          daysWithSale,zeroDays,frequency:+frequency.toFixed(6),
          periodZeroStreak,zeroStreak,lastSaleDate,
          alert:zeroStreak>3,
          daily:rhythmDaily
        },
        participation:+participation.toFixed(6),
        storeApproved:+storeApproved.toFixed(2),
        participationSource:useOfficial?"gerencial_lojas":"relatorio_colaborador",
        participationCoverage:+officialCoverage.toFixed(4),
        latestVoice:voice.data?.[0]||null,
        person:{id:personId,name:personName,store:st}
      });
    }

    if(body.action==="voice_submit"){
      const matricula=String(body.matricula||"").trim();
      const ctx=await actorContext(matricula);
      if(!ctx||ctx.demo)return json({error:"Acesso não autorizado."},403);
      const allowed=new Set(["instabilidade_app","pagamento","cupom","estoque_online","outra_atividade","abordagem","escala_folga","outro"]);
      const cause=String(body.cause_code||"");
      if(!allowed.has(cause))return json({error:"Selecione o principal motivo do impacto."},400);
      const detail=String(body.cause_detail||"").trim().slice(0,1200);
      const suggestion=String(body.suggested_improvement||"").trim().slice(0,1200);
      const actionPlan=String(body.action_plan||"").trim().slice(0,1200);
      if(detail.length<8)return json({error:"Conte brevemente o que impactou sua captação."},400);
      const row={
        matricula:ctx.id,collaborator_name:ctx.name,store_code:ctx.st,
        period:PERIODS.includes(String(body.period||"week"))?String(body.period):"week",
        period_start:String(body.period_start||"").slice(0,10)||null,
        period_end:String(body.period_end||"").slice(0,10)||null,
        zero_streak:Math.max(0,Math.trunc(n(body.zero_streak))),
        zero_days:Math.max(0,Math.trunc(n(body.zero_days))),
        frequency:+Math.max(0,Math.min(1,n(body.frequency))).toFixed(6),
        participation:+Math.max(0,n(body.participation)).toFixed(6),
        cause_code:cause,cause_detail:detail,
        suggested_improvement:suggestion,action_plan:actionPlan,
        status:"pending",updated_at:new Date().toISOString()
      };
      const ins=await db.from("collaborator_voice").insert(row).select("*").single();
      if(ins.error)throw ins.error;
      await db.from("app_audit").insert({
        event_type:"voice_submit",entity:"collaborator_voice",entity_id:String(ins.data.id),
        actor_matricula:ctx.id,store_code:ctx.st,after_data:row
      });
      return json({ok:true,item:ins.data});
    }

    if(body.action==="voice_badge"){
      const matricula=String(body.matricula||"").trim(),ctx=await actorContext(matricula);
      if(!ctx||(!ctx.lead&&!ctx.admin))return json({error:"Acesso exclusivo para supervisores e gestores."},403);
      let q:any=db.from("collaborator_voice").select("id",{count:"exact",head:true}).neq("status","resolved");
      if(!ctx.admin)q=q.eq("store_code",ctx.st);
      const r=await q;if(r.error)throw r.error;
      return json({ok:true,pendingCount:r.count||0,scope:ctx.admin?"regional":"store",store:ctx.admin?null:ctx.st});
    }

    if(body.action==="voice_list"){
      const matricula=String(body.matricula||"").trim(),ctx=await actorContext(matricula);
      if(!ctx||(!ctx.lead&&!ctx.admin))return json({error:"Acesso exclusivo para supervisores e gestores."},403);
      const status=String(body.status||"open"),requestedStore=String(body.store||"").padStart(3,"0");
      const from=/^\d{4}-\d{2}-\d{2}$/.test(String(body.from||""))?String(body.from):"";
      const to=/^\d{4}-\d{2}-\d{2}$/.test(String(body.to||""))?String(body.to):"";
      const limit=Math.max(50,Math.min(1000,Math.trunc(n(body.limit)||250)));
      let q:any=db.from("collaborator_voice").select("*").order("created_at",{ascending:false}).limit(limit);
      if(!ctx.admin)q=q.eq("store_code",ctx.st);
      else if(REGIONAL.has(requestedStore))q=q.eq("store_code",requestedStore);
      if(from)q=q.gte("created_at",from+"T00:00:00.000Z");
      if(to)q=q.lte("created_at",to+"T23:59:59.999Z");
      if(status==="open")q=q.neq("status","resolved");
      else if(["pending","reviewed","resolved"].includes(status))q=q.eq("status",status);
      const r=await q;if(r.error)throw r.error;
      const items=r.data||[];
      const summary={
        total:items.length,
        pending:items.filter((x:any)=>x.status==="pending").length,
        reviewed:items.filter((x:any)=>x.status==="reviewed").length,
        resolved:items.filter((x:any)=>x.status==="resolved").length
      };
      const byStore=[...REGIONAL].sort().map(st=>({st,count:items.filter((x:any)=>String(x.store_code)===st).length})).filter(x=>x.count>0);
      return json({ok:true,scope:ctx.admin?"regional":"store",store:ctx.admin?(REGIONAL.has(requestedStore)?requestedStore:null):ctx.st,from:from||null,to:to||null,summary,byStore,items});
    }

    if(body.action==="voice_update"){
      const matricula=String(body.matricula||"").trim(),ctx=await actorContext(matricula);
      if(!ctx||(!ctx.lead&&!ctx.admin))return json({error:"Acesso exclusivo para supervisores e gestores."},403);
      const id=String(body.id||""),status=String(body.status||"reviewed");
      if(!["reviewed","resolved"].includes(status))return json({error:"Status inválido."},400);
      const hit=await db.from("collaborator_voice").select("*").eq("id",id).maybeSingle();
      if(hit.error)throw hit.error;if(!hit.data)return json({error:"Registro não localizado."},404);
      if(!ctx.admin&&String(hit.data.store_code)!==ctx.st)return json({error:"Este registro pertence a outra filial."},403);
      const note=String(body.supervisor_note||"").trim().slice(0,1500),now=new Date().toISOString();
      const patch:any={status,supervisor_note:note,updated_at:now};
      if(status==="resolved"){patch.resolved_by=ctx.id;patch.resolved_at=now}
      const up=await db.from("collaborator_voice").update(patch).eq("id",id).select("*").single();
      if(up.error)throw up.error;
      await db.from("app_audit").insert({
        event_type:"voice_update",entity:"collaborator_voice",entity_id:id,
        actor_matricula:ctx.id,store_code:String(hit.data.store_code),before_data:hit.data,after_data:up.data
      });
      return json({ok:true,item:up.data});
    }

        if(body.action==="bopis_dashboard"){
      const matricula=String(body.matricula||"").trim(),period=PERIODS.includes(String(body.period||"month"))?String(body.period||"month"):"month";
      const actorCtx=await actorContext(matricula);
      if(!actorCtx||(!actorCtx.lead&&!actorCtx.admin))return json({error:"Acesso exclusivo para supervisores e gestores."},403);

      const latestQ=await db.from("daily_collaborator").select("date").order("date",{ascending:false}).limit(1);
      const bopisState=(await getState(["bopis_coverage"])).bopis_coverage||{};
      const latest=String([latestQ.data?.[0]?.date,bopisState.end,BASELINE].filter(Boolean).sort().at(-1)||BASELINE);
      let start=latest;
      if(period==="week"){const d=new Date(latest+"T12:00:00Z"),dow=d.getUTCDay()||7;d.setUTCDate(d.getUTCDate()-dow+1);start=d.toISOString().slice(0,10)}
      else if(period==="month")start=latest.slice(0,7)+"-01";
      else if(period==="year")start=latest.slice(0,4)+"-01-01";

      const rows:any[]=[];
      for(let from=0;;from+=500){
        const {data:chunk,error}=await db.from("bopis_sales_history")
          .select("date,matricula,store_code,captured,approved,orders")
          .gte("date",start).lte("date",latest).range(from,from+499);
        if(error)throw error;
        rows.push(...(chunk||[]));
        if(!chunk||chunk.length<500)break;
      }
      const verifiedRows=rows;
      const coverage=1;

      const {data:people,error:pe}=await allCollaborators("matricula,nome,store_code,cargo");
      if(pe)throw pe;
      const names=new Map<string,any>();
      for(const p of people||[])names.set(String(p.matricula),{name:String(p.nome||p.matricula),st:String(p.store_code||"").padStart(3,"0"),role:String(p.cargo||"")});

      const byStore=new Map<string,any>(),byPerson=new Map<string,any>(),byDate=new Map<string,any>();
      for(const r of verifiedRows){
        const orders=Math.trunc(n(r.orders)),cap=n(r.captured),app=n(r.approved);
        if(orders<=0&&cap<=0&&app<=0)continue;
        const st=String(r.store_code||"").padStart(3,"0"),id=String(r.matricula||""),d=String(r.date||"");
        if(!REGIONAL.has(st)||!id)continue;

        const s=byStore.get(st)||{st,orders:0,captured:0,approved:0,people:new Set<string>(),days:new Set<string>()};
        s.orders+=orders;s.captured+=cap;s.approved+=app;s.people.add(id);s.days.add(d);byStore.set(st,s);

        const meta=names.get(id)||{name:"Matrícula "+id,st,role:""};
        const p=byPerson.get(id)||{id,name:meta.name,st,role:meta.role,orders:0,captured:0,approved:0,days:new Set<string>(),dates:[]};
        p.orders+=orders;p.captured+=cap;p.approved+=app;p.days.add(d);p.dates.push({date:d,orders,captured:+cap.toFixed(2),approved:+app.toFixed(2),st});byPerson.set(id,p);

        const day=byDate.get(d)||{date:d,orders:0,captured:0,approved:0,people:new Set<string>(),stores:new Set<string>()};
        day.orders+=orders;day.captured+=cap;day.approved+=app;day.people.add(id);day.stores.add(st);byDate.set(d,day);
      }

      const peopleOut=[...byPerson.values()].map((p:any)=>({
        id:p.id,name:p.name,st:p.st,role:p.role,orders:p.orders,captured:+p.captured.toFixed(2),approved:+p.approved.toFixed(2),
        frequency:p.days.size,recurrence:p.days.size>1?p.days.size-1:0,dates:p.dates.sort((a:any,b:any)=>b.date.localeCompare(a.date))
      })).sort((a:any,b:any)=>b.orders-a.orders||b.captured-a.captured);

      const stores=[...REGIONAL].sort().map(st=>{
        const s=byStore.get(st)||{orders:0,captured:0,approved:0,people:new Set<string>(),days:new Set<string>()};
        const rec=peopleOut.filter((p:any)=>p.st===st&&p.frequency>1).length;
        return {st,orders:s.orders||0,captured:+n(s.captured).toFixed(2),approved:+n(s.approved).toFixed(2),collaborators:s.people?.size||0,frequency:s.days?.size||0,recurringCollaborators:rec};
      }).sort((a:any,b:any)=>b.orders-a.orders||b.captured-a.captured);

      const timeline=[...byDate.values()].map((d:any)=>({date:d.date,orders:d.orders,captured:+d.captured.toFixed(2),approved:+d.approved.toFixed(2),collaborators:d.people.size,stores:d.stores.size})).sort((a:any,b:any)=>a.date.localeCompare(b.date));
      const totalOrders=peopleOut.reduce((s:any,p:any)=>s+p.orders,0),totalCaptured=peopleOut.reduce((s:any,p:any)=>s+p.captured,0),totalApproved=peopleOut.reduce((s:any,p:any)=>s+p.approved,0);
      const recurring=peopleOut.filter((p:any)=>p.frequency>1).length;

      const searchId=String(body.search_matricula||"").trim();
      const person=searchId?(peopleOut.find((p:any)=>p.id===searchId)||(()=>{const meta=names.get(searchId);return meta?{id:searchId,name:meta.name,st:meta.st,role:meta.role,orders:0,captured:0,approved:0,frequency:0,recurrence:0,dates:[]}:null})()):null;

      return json({
        ok:true,period,startDate:start,endDate:latest,commissionVerifiedCoverage:+coverage.toFixed(4),coverageStart:bopisState.start||null,coverageEnd:bopisState.end||null,coverageSource:"admin_bopis_report",
        summary:{orders:totalOrders,captured:+totalCaptured.toFixed(2),approved:+totalApproved.toFixed(2),collaborators:peopleOut.length,stores:stores.filter((s:any)=>s.orders>0||s.captured>0).length,recurringCollaborators:recurring,frequencyDays:timeline.length},
        stores,timeline,collaborators:peopleOut,person
      });
    }
    if(body.action==="commission_history"){
      const matricula=String(body.matricula||"").trim();
      if(!/^\d+$/.test(matricula))return json({error:"Matrícula inválida."},400);
      const personId=matricula==="0000000"?await demoSourceMatricula():matricula;
      const commissionEligibility=await commissionEligibilityForMatricula(matricula==="0000000"?"0000000":personId);
      const {data,error}=await db.from("monthly_collaborator_history")
        .select("month,store_code,captured,approved,orders,eday_approved,bopis_approved,commissionable_approved,commission_verified")
        .eq("matricula",personId)
        .order("month",{ascending:true});
      if(error)throw error;
      const byMonth=new Map<string,any>();
      for(const r of data||[]){
        const month=String(r.month||"");
        if(!/^\d{4}-\d{2}$/.test(month))continue;
        const q=byMonth.get(month)||{month,captured:0,approved:0,orders:0,edayApproved:0,bopisApproved:0,commissionableApproved:0,commissionVerified:true,stores:new Set<string>()};
        q.captured+=n(r.captured);q.approved+=n(r.approved);q.orders+=Math.trunc(n(r.orders));q.commissionVerified=q.commissionVerified&&r.commission_verified===true;if(r.commission_verified===true){q.edayApproved+=n(r.eday_approved);q.bopisApproved+=n(r.bopis_approved);q.commissionableApproved+=n(r.commissionable_approved)}
        const sc=String(r.store_code||"").padStart(3,"0");if(REGIONAL.has(sc))q.stores.add(sc);
        byMonth.set(month,q);
      }
      const months=[...byMonth.values()].map((q:any)=>{
        const edayApproved=Math.max(0,Math.min(n(q.commissionableApproved),n(q.edayApproved)));
        const normalApproved=Math.max(0,n(q.commissionableApproved)-edayApproved);
        const normal=commissionEligibility.eligible&&q.commissionVerified?normalApproved*.03:0,eday=commissionEligibility.eligible&&q.commissionVerified?edayApproved*.10:0,total=normal+eday;
        return {
          month:q.month,
          captured:+n(q.captured).toFixed(2),
          approved:+n(q.approved).toFixed(2),
          orders:Math.trunc(n(q.orders)),
          normalApproved:+normalApproved.toFixed(2),
          edayApproved:+edayApproved.toFixed(2),
          normalCommission:+normal.toFixed(2),
          edayCommission:+eday.toFixed(2),
          totalCommission:+total.toFixed(2),
          commissionableApproved:+n(q.commissionableApproved).toFixed(2),
          bopisApproved:+n(q.bopisApproved).toFixed(2),
          commissionVerified:!!q.commissionVerified,
          stores:[...q.stores].sort()
        };
      }).sort((a:any,b:any)=>b.month.localeCompare(a.month));
      return json({ok:true,source:"monthly_collaborator_history",commissionEligible:commissionEligibility.eligible,commissionEligibilityReason:commissionEligibility.reason,contractRole:commissionEligibility.role,rule:{normalRate:.03,edayRate:.10,edayStart:"2026-08-01"},months});
    }
    if(body.action==="commission_period"){
      const matricula=String(body.matricula||"").trim(),month=String(body.month||"");
      if(!/^\d+$/.test(matricula)||!/^\d{4}-\d{2}$/.test(month))return json({error:"Parâmetros inválidos."},400);
      const personId=matricula==="0000000"?await demoSourceMatricula():matricula;
      const commissionEligibility=await commissionEligibilityForMatricula(matricula==="0000000"?"0000000":personId);
      const start=month+"-01",end=new Date(Date.UTC(+month.slice(0,4),+month.slice(5,7),1)).toISOString().slice(0,10);
      const [{data,error},{data:bopis,error:be}]=await Promise.all([
        db.from("daily_collaborator").select("date,store_code,approved").eq("matricula",personId).gte("date",start).lt("date",end),
        db.from("bopis_sales_history").select("date,store_code,approved").eq("matricula",personId).gte("date",start).lt("date",end)
      ]);
      if(error)throw error;if(be)throw be;
      const bm=new Map<string,number>();
      for(const r of bopis||[]){const k=String(r.date)+"|"+String(r.store_code||"").padStart(3,"0");bm.set(k,(bm.get(k)||0)+n(r.approved))}
      let normal=0,eday=0,commissionableApproved=0,bopisApproved=0;
      const cfg=(await getState(["eday_config"])).eday_config||{active:true,rate:.10,start:"2026-08-01",end:""};
      for(const r of data||[]){
        const d=String(r.date),st=String(r.store_code||"").padStart(3,"0"),aa=n(r.approved),
              ba=Math.min(aa,n(bm.get(d+"|"+st))),ca=Math.max(0,aa-ba),
              dow=new Date(d+"T12:00:00Z").getUTCDay(),eStart=String(cfg.start||"2026-08-01"),
              isE=cfg.active!==false&&dow===1&&d>=eStart&&(!cfg.end||d<=cfg.end);
        commissionableApproved+=ca;bopisApproved+=ba;
        if(!commissionEligibility.eligible)continue;
        if(isE)eday+=ca*n(cfg.rate||.10);else normal+=ca*.03;
      }
      return json({ok:true,month,commissionVerified:true,commissionableApproved:+commissionableApproved.toFixed(2),bopisApproved:+bopisApproved.toFixed(2),basis:"approved_minus_admin_bopis_report",commissionEligible:commissionEligibility.eligible,commissionEligibilityReason:commissionEligibility.reason,contractRole:commissionEligibility.role,individual:{normal:+normal.toFixed(2),eday:+eday.toFixed(2),total:+(normal+eday).toFixed(2)}});
    }
    if(body.action==="pool_rankings"){
      const matricula=String(body.matricula||""),period=PERIODS.includes(String(body.period||"month"))?String(body.period||"month"):"month",month=String(body.month||"");
      const actorCtx=await actorContext(matricula);if(!actorCtx||(!actorCtx.lead&&!actorCtx.admin))return json({error:"Acesso exclusivo para supervisores e gestores."},403);
      const state=await getState(["common_base"]);const base=state.common_base||{},campaignStart="2026-08-01";
      const [lastDaily,lastUpdate]=await Promise.all([
        db.from("daily_collaborator").select("date").order("date",{ascending:false}).limit(1),
        db.from("daily_updates").select("result_date").order("result_date",{ascending:false}).limit(1)
      ]);
      const latest=String([lastDaily.data?.[0]?.date,lastUpdate.data?.[0]?.result_date,BASELINE].filter(Boolean).sort().at(-1)||BASELINE);
      let startDate=campaignStart,endDate=latest;
      if(period==="day"){startDate=latest;endDate=latest}
      else if(period==="week"){const d=new Date(latest+"T12:00:00Z"),dow=d.getUTCDay()||7;d.setUTCDate(d.getUTCDate()-dow+1);startDate=d.toISOString().slice(0,10);if(startDate<campaignStart)startDate=campaignStart}
      else if(period==="month"){
        const ym=/^\d{4}-\d{2}$/.test(month)?month:latest.slice(0,7);
        startDate=ym+"-01";
        const next=new Date(Date.UTC(+ym.slice(0,4),+ym.slice(5,7),1));
        const monthEnd=new Date(next.getTime()-86400000).toISOString().slice(0,10);
        endDate=ym===latest.slice(0,7)?latest:(ym<latest.slice(0,7)?monthEnd:startDate);
        if(startDate<campaignStart)startDate=campaignStart;
      }else {startDate=campaignStart;endDate=latest}

      const by:any={};for(const st of REGIONAL)by[st]={grossApproved:0,bopisApproved:0};
      if(startDate<=endDate){
        for(let from=0;;from+=500){
          const {data:chunk,error}=await db.from("daily_collaborator")
            .select("date,store_code,approved").gte("date",startDate).lte("date",endDate).range(from,from+499);
          if(error)throw error;
          for(const r of chunk||[]){const st=String(r.store_code||"").padStart(3,"0");if(REGIONAL.has(st))by[st].grossApproved+=n(r.approved)}
          if(!chunk||chunk.length<500)break;
        }
        for(let from=0;;from+=500){
          const {data:chunk,error}=await db.from("bopis_sales_history")
            .select("date,store_code,approved").gte("date",startDate).lte("date",endDate).range(from,from+499);
          if(error)throw error;
          for(const r of chunk||[]){const st=String(r.store_code||"").padStart(3,"0");if(REGIONAL.has(st))by[st].bopisApproved+=n(r.approved)}
          if(!chunk||chunk.length<500)break;
        }
      }

      // Elegibilidade vem do cadastro vigente, evitando lista estática da base visual.
      const {data:eligibleRows,error:ee}=await allCollaborators("matricula,nome,store_code,cargo,eligible_supervisor,situacao");
      if(ee)throw ee;
      const eligibleByStore=new Map<string,any[]>();
      for(const u of eligibleRows||[]){
        const st=String(u.store_code||"").padStart(3,"0");
        if(!REGIONAL.has(st)||u.eligible_supervisor!==true||/deslig|inativ/i.test(String(u.situacao||"")))continue;
        if(!eligibleByStore.has(st))eligibleByStore.set(st,[]);
        eligibleByStore.get(st)!.push({id:String(u.matricula),name:String(u.nome||u.matricula),role:String(u.cargo||"")});
      }

      const stores:any[]=[],supervisors:any[]=[];
      for(const st of REGIONAL){
        const sups=eligibleByStore.get(st)||[];
        const grossApproved=n(by[st]?.grossApproved),bopisApproved=Math.min(grossApproved,n(by[st]?.bopisApproved)),approved=Math.max(0,grossApproved-bopisApproved),pool=approved*.03,individual=sups.length?pool/sups.length:0;
        stores.push({st,approved:+approved.toFixed(2),grossApproved:+grossApproved.toFixed(2),bopisApproved:+bopisApproved.toFixed(2),commissionVerified:true,commissionPartial:false,poolAvailable:true,verifiedRows:0,pendingRows:0,pool:+pool.toFixed(2),eligible:sups.length});
        for(const u of sups)supervisors.push({id:u.id,name:u.name,role:u.role,st,commissionVerified:true,commissionPartial:false,poolAvailable:true,verifiedRows:0,pendingRows:0,pool:+individual.toFixed(2)});
      }
      stores.sort((x,y)=>y.pool-x.pool);supervisors.sort((x,y)=>y.pool-x.pool);
      const ranked=supervisors.map((x,i)=>({...x,rank:i+1})),mine=ranked.find(x=>String(x.id)===matricula)||null,avg=ranked.length?ranked.reduce((a,x)=>a+x.pool,0)/ranked.length:0,admin=matricula==="0000000"||await adminAllowed(matricula);
      const rankedOut=matricula==="0000000"?ranked.map((x:any,i:number)=>({...x,id:"DEMO-SUP-"+(i+1),name:"Supervisor "+(i+1)})):ranked;
      return json({ok:true,period,startDate,endDate,campaignStart,basis:"commissionable_approved_excluding_bopis",rate:.03,source:"daily_collaborator_minus_admin_bopis_report",stores,mySupervisor:mine,regionalAverage:+avg.toFixed(2),supervisors:admin?rankedOut:[]});
    }
    if(body.action==="eday_get"){
      const state=await getState(["eday_config"]); const cfg=state.eday_config||{active:true,rate:.10,start:"2026-08-01",end:""};
      return json({ok:true,config:cfg});
    }
    if(body.action==="eday_update"){
      const matricula=String(body.matricula||""), password=String(body.password||""); const state=await getState(["config"]); if(!(await adminOk(matricula,password)))return json({error:"Não autorizado."},403);
      const cfg={active:body.active!==false,rate:.10,start:String(body.start||""),end:String(body.end||""),updated_at:new Date().toISOString(),updated_by:matricula};
      const {error}=await db.from("app_state").upsert({key:"eday_config",value:cfg,updated_at:new Date().toISOString()},{onConflict:"key"});if(error)throw error;return json({ok:true,config:cfg});
    }
    if(body.action==="notifications_get"){
      const matricula=String(body.matricula||""), storeCode=String(body.store_code||""); const state=await getState(["common_base"]);
      const isSup=(state.common_base?.stores?.[storeCode]?.sup||[]).some((u:any)=>String(u.id)===matricula), isAdm=await adminAllowed(matricula);
      // Lembrete padrão diário às 10h (Fortaleza) somente para supervisor que ainda não fez rateio de meta.
      if(isSup){
        const brNow=new Date(new Date().toLocaleString("en-US",{timeZone:"America/Fortaleza"}));
        const y=brNow.getFullYear(),mo=String(brNow.getMonth()+1).padStart(2,"0"),da=String(brNow.getDate()).padStart(2,"0"),today=y+"-"+mo+"-"+da;
        if(brNow.getHours()>=10){
          const {count}=await db.from("meta_assignments").select("*",{count:"exact",head:true}).eq("result_date",today).eq("store_code",storeCode);
          if(!count){
            const key="meta-rateio-10h-"+today+"-"+storeCode+"-"+matricula;
            const {data:exists}=await db.from("notification_messages").select("id").eq("recurring_key",key).maybeSingle();
            if(!exists){
              await db.from("notification_messages").insert({title:"Lembrete • Rateio de metas",message:"Sua filial ainda não possui rateio de metas dos colaboradores registrado hoje. Acesse Metas e faça a distribuição do compromisso eStore da equipe.",target_type:"matricula",target_matricula:matricula,target_name:"Supervisor • Loja "+storeCode,created_by:"sistema",active:true,scheduled_at:new Date().toISOString(),recurring_key:key});
            }
          }
        }
      }
      const nowIso=new Date().toISOString();
      const {data,error}=await db.from("notification_messages").select("*").eq("active",true).or("scheduled_at.is.null,scheduled_at.lte."+nowIso).order("created_at",{ascending:false}).limit(100); if(error)throw error;
      const visible=(data||[]).filter((x:any)=>{if(x.expires_at&&String(x.expires_at)<=nowIso)return false;const t=String(x.target_type||"regional");return t==="regional"||t==="all"||(t==="supervisors"&&(isSup||isAdm))||(t==="store"&&String(x.store_code||"")===storeCode)||(t==="matricula"&&String(x.target_matricula||"")===matricula);}).slice(0,50);
      const ids=visible.map((x:any)=>x.id); let readSet=new Set<string>();
      if(ids.length){const {data:reads}=await db.from("notification_reads").select("notification_id").eq("matricula",matricula).in("notification_id",ids);readSet=new Set((reads||[]).map((x:any)=>String(x.notification_id)));}
      const items=visible.map((x:any)=>({...x,read:readSet.has(String(x.id))})); return json({ok:true,items,unread:items.filter((x:any)=>!x.read).length});
    }
    if(body.action==="notifications_admin_get"){
      const matricula=String(body.matricula||""); if(!(await adminAllowed(matricula)))return json({error:"Não autorizado."},403);
      const users=await allUserState(); const people:any[]=[]; for(const st of Object.keys(users))for(const u of(users[st]?.users||[]))people.push({id:String(u.id),name:String(u.name||""),st:String(u.st||st),role:String(u.role||"")});
      const base=(await getState(["common_base"])).common_base||{}; const supervisors:any[]=[]; for(const st of Object.keys(base.stores||{}))for(const u of(base.stores[st]?.sup||[]))supervisors.push({id:String(u.id),name:String(u.name||""),st,role:String(u.role||"")});
      const {data,error}=await db.from("notification_messages").select("*").order("created_at",{ascending:false}).limit(100); if(error)throw error;
      return json({ok:true,items:data||[],people,supervisors,stores:[...REGIONAL].sort()});
    }
    if(body.action==="notification_delete"){
      const matricula=String(body.matricula||""),id=String(body.id||""); if(!(await adminAllowed(matricula)))return json({error:"Não autorizado."},403);
      const {error}=await db.from("notification_messages").delete().eq("id",id); if(error)throw error; return json({ok:true});
    }
    if(body.action==="notification_read"){
      const matricula=String(body.matricula||""), id=String(body.id||""); if(!matricula||!id)return json({error:"Dados inválidos."},400);
      const {error}=await db.from("notification_reads").upsert({notification_id:id,matricula,read_at:new Date().toISOString()},{onConflict:"notification_id,matricula"}); if(error)throw error; return json({ok:true});
    }
    if(body.action==="notification_publish"){
      const matricula=String(body.matricula||""), password=String(body.password||""); if(!(await adminOk(matricula,password)))return json({error:"Não autorizado."},403);
      let target=String(body.target||"regional"); if(target==="all")target="regional"; if(!["regional","store","supervisors","matricula"].includes(target))return json({error:"Destino inválido."},400);
      const item={title:String(body.title||"Aviso eStore").slice(0,100),message:String(body.message||"").slice(0,500),target_type:target,store_code:String(body.store_code||"")||null,target_matricula:String(body.target_matricula||"")||null,target_name:String(body.target_name||"")||null,scheduled_at:body.scheduled_at?String(body.scheduled_at):null,expires_at:body.expires_at?String(body.expires_at):null,created_by:matricula,active:true}; if(!item.message)return json({error:"Digite a mensagem."},400);
      const {data,error}=await db.from("notification_messages").insert(item).select().single(); if(error)throw error; return json({ok:true,item:data});
    }
    if(body.action==="hourly_get"){
      const result_date=String(body.result_date||"");
      const matricula=String(body.matricula||"").trim(),actorCtx=await actorContext(matricula);if(!actorCtx||(!actorCtx.lead&&!actorCtx.admin))return json({error:"Acesso exclusivo para supervisores e gestores."},403);
      if(!/^\d{4}-\d{2}-\d{2}$/.test(result_date))return json({error:"Data inválida."},400);
      const [{data,error},{data:flashRows,error:flashError}]=await Promise.all([
        db.from("hourly_estore").select("*").eq("result_date",result_date).order("created_at",{ascending:true}),
        db.from("estore_flash_store_sales").select("store_code,total_flash,collected_at,source_time").eq("result_date",result_date)
      ]);
      if(error||flashError)throw error||flashError;
      const flashByStore=new Map((flashRows||[]).map((r:any)=>[String(r.store_code),r]));
      const state=await getState(["meta_schedule","historical_ticket_ytd"]);
      const byStore:any={};
      for(const r of data||[]){ if(String(r.status||"active")!=="deleted") (byStore[r.store_code] ||= []).push(r); }
      const users=await allUserState(); const nameMap:any={};
      for(const st of Object.keys(users)) for(const u of (users[st]?.users||[])) nameMap[String(u.id)]=String(u.name||"").trim().split(/\s+/)[0]||String(u.id);
      const stores=[...REGIONAL].map(st=>{
        const rows=byStore[st]||[], metaRow=state.meta_schedule?.[result_date]?.[st]||{};
        const metaValue=n(metaRow.metaEstore), storeTarget=n(metaRow.metaVenda), ticket=historicalTicketFromState(state,st), orderTarget=metaValue>0?Math.ceil(metaValue/ticket):0;
        const captured=rows.reduce((q:any,r:any)=>q+n(r.captured),0), orders=rows.reduce((q:any,r:any)=>q+Math.trunc(n(r.orders)),0), last=rows[rows.length-1]||null;
        const directRows=rows.filter((r:any)=>r.source!=="print_whatsapp_revisado"),lastDirect=directRows.at(-1)||null;
        const capturedDirect=directRows.reduce((q:number,r:any)=>q+n(r.captured),0);
        const capturedImported=rows.filter((r:any)=>r.source==="print_whatsapp_revisado").reduce((q:number,r:any)=>q+n(r.captured),0);
        const flash:any=flashByStore.get(st);
        const hasFlash=flash&&Number.isFinite(Number(flash.total_flash))&&Number(flash.total_flash)>0;
        const storeSales=hasFlash?Number(flash.total_flash):null;
        return {st,captured,storeSales,storeTarget,orders,metaValue,orderTarget,
          att:metaValue?captured/metaValue:0,share:storeSales!==null?captured/storeSales:null,
          shareSource:storeSales!==null?"flash":"aguardando_flash",flashCollectedAt:flash?.collected_at||null,flashSourceTime:flash?.source_time||null,
          updated_at:lastDirect?.created_at||null,matricula:matricula==="0000000"?(lastDirect?"DEMO":null):(lastDirect?.matricula||null),
          updated_by:lastDirect?(matricula==="0000000"?"Equipe Loja "+st:(nameMap[String(lastDirect.matricula)]||String(lastDirect.matricula))):null,
          last_consolidated_at:last?.created_at||null,last_entry_kind:lastDirect?.entry_kind||null,
          captured_direct:+capturedDirect.toFixed(2),captured_imported:+capturedImported.toFixed(2),
          updates:rows.length,store_updates:directRows.length};
      });
      const history=(data||[]).map((r:any)=>({...r,updated_by_name:matricula==="0000000"?"Equipe Loja "+String(r.store_code||""):(nameMap[String(r.updated_by||r.matricula)]||String(r.updated_by||r.matricula)),matricula:matricula==="0000000"?"DEMO":r.matricula,updated_by:matricula==="0000000"?"DEMO":r.updated_by}));
      const covered=stores.filter((r:any)=>r.storeSales!==null);
      const denom=covered.reduce((sum:number,r:any)=>sum+r.storeSales,0);
      const coveredCaptured=covered.reduce((sum:number,r:any)=>sum+r.captured,0);
      const allCaptured=stores.reduce((sum:number,r:any)=>sum+r.captured,0);
      const regionalFlash={source:"flash",covered_stores:covered.length,total_stores:REGIONAL.size,
        complete:covered.length===REGIONAL.size,store_sales:denom,captured_covered:coveredCaptured,
        captured_unmatched:allCaptured-coveredCaptured,share:denom>0?coveredCaptured/denom:null,
        collected_at:covered.reduce((m:string|null,r:any)=>!m||r.flashCollectedAt>m?r.flashCollectedAt:m,null)};
      return json({ok:true,result_date,stores,history,regionalFlash});
    }
    if(body.action==="audit_get"){
      const matricula=String(body.matricula||"");
      if(!(await adminAllowed(matricula)))return json({error:"Não autorizado."},403);
      const {data,error}=await db.from("app_audit").select("*").order("created_at",{ascending:false}).limit(300);
      if(error)throw error; return json({ok:true,items:data||[]});
    }
    if(body.action==="meta_assign_get"){
      const matricula=String(body.matricula||""), st=String(body.st||""), date=String(body.date||"");
      const metaState=await getState(["meta_schedule","annual_meta","year_meta_2026"]); const metaSchedule=metaState.meta_schedule||{};
      const targetFor=(period:string)=>{
        if(period==="month" && date.slice(0,7)==="2026-09" && metaState.year_meta_2026?.[st]){
          const y=metaState.year_meta_2026[st];
          const sepTarget=Math.max(0,n(y.jan_sep_final)-n(y.through_aug));
          if(sepTarget>0) return +sepTarget.toFixed(2);
        }
        const ref=new Date(date+"T12:00:00Z"); let total=0;
        for(const d of Object.keys(metaSchedule)){
          let include=false;
          if(period==="day") include=d===date;
          else if(period==="month") include=d.slice(0,7)===date.slice(0,7);
          else if(period==="week"){
            const x=new Date(d+"T12:00:00Z"), dow=(ref.getUTCDay()+6)%7, start=new Date(ref);start.setUTCDate(ref.getUTCDate()-dow);const end=new Date(start);end.setUTCDate(start.getUTCDate()+6);
            include=x>=start&&x<=end;
          }
          if(include) total+=n(metaSchedule[d]?.[st]?.metaEstore);
        }
        return +total.toFixed(2);
      };
      const targets={day:targetFor("day"),week:targetFor("week"),month:targetFor("month"),year:0};
      if(metaState.annual_meta?.[st]) targets.year=+n(metaState.annual_meta[st].final).toFixed(2);
      const users=await allUserState(); let me:any=null; for(const sc of Object.keys(users)){const u=(users[sc]?.users||[]).find((x:any)=>String(x.id)===matricula);if(u){me=u;break;}}
      const isAdmin=matricula==="0000000"||await adminAllowed(matricula);
      const base=(await getState(["common_base"])).common_base;
      const isSup=(base?.stores?.[st]?.sup||[]).some((u:any)=>String(u.id)===matricula);
      if(!isAdmin && !isSup){
        const {data,error}=await db.from("meta_assignments").select("*").eq("result_date",date).eq("matricula",matricula).order("store_code");
        if(error)throw error; return json({ok:true,assignments:data||[],scope:"self",targets});
      }
      const {data,error}=await db.from("meta_assignments").select("*").eq("result_date",date).eq("store_code",st).order("matricula");
      if(error)throw error;
      const {data:hcRow}=await db.from("daily_store_hc").select("*").eq("result_date",date).eq("store_code",st).maybeSingle();
      const outAssignments=matricula==="0000000"?[]:(data||[]);
      return json({ok:true,assignments:outAssignments,hc:hcRow||null,scope:isAdmin?"admin":"store",targets});
    }
    if(body.action==="store_hc_set"){
      const matricula=String(body.matricula||""), st=String(body.st||""), date=String(body.date||""), hc=Math.trunc(n(body.hc));
      if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!REGIONAL.has(st)||hc<0)return json({error:"HC inválido."},400);
      const base=(await getState(["common_base"])).common_base; const isAdmin=await adminAllowed(matricula);
      const isSup=(base?.stores?.[st]?.sup||[]).some((u:any)=>String(u.id)===matricula);
      if(!isAdmin&&!isSup)return json({error:"Apenas supervisor da filial ou ADM pode informar o HC diário."},403);
      const {data,error}=await db.from("daily_store_hc").upsert({result_date:date,store_code:st,hc_available:hc,informed_by:matricula,updated_at:new Date().toISOString()},{onConflict:"result_date,store_code"}).select().single();
      if(error)throw error; return json({ok:true,hc:data});
    }
    if(body.action==="ticket_history_save"){
      const matricula=String(body.matricula||""),password=String(body.password||"");
      if(!(await adminOk(matricula,password)))return json({error:"Não autorizado."},403);
      const payload=await persistHistoricalTickets(body.values||{},String(body.reference_date||""),matricula);
      return json({ok:true,historicalTickets:payload,message:"Ticket médio histórico atualizado e metas de pedidos recalculadas."});
    }
    if(body.action==="ticket_history_get"){
      const matricula=String(body.matricula||"");
      if(!(await adminAllowed(matricula)))return json({error:"Não autorizado."},403);
      const state=await getState(["historical_ticket_ytd"]);
      return json({ok:true,historicalTickets:historicalTicketPayload(state)});
    }
    if(body.action==="branding_get"){
      const state=await getState(["app_image_slots"]);
      return json({ok:true,imageSlots:state.app_image_slots||{}});
    }
    if(body.action==="content_get"){
      const actor=String(body.matricula||"").trim(),demo=body.demo===true || actor==="0000000";
      if(!demo){const ctx=await actorContext(actor);if(!ctx)return json({error:"Acesso não autorizado."},403);}
      const state=await getState(["important_info","campaigns_config","popup_messages","institutional_media","eday_config","coupons_config","app_image_slots","historical_ticket_ytd"]);
      if(demo)return json({ok:true,importantInfo:state.important_info||[],campaigns:state.campaigns_config||[],popups:state.popup_messages||[],media:state.institutional_media||[],eday:state.eday_config||{},coupons:state.coupons_config||[],imageSlots:state.app_image_slots||{},historicalTickets:historicalTicketPayload(state),profilePhotos:{},preferredNames:{}});
      const {data:photos}=await db.from("profile_photos").select("matricula,photo_url");
      const {data:prefs}=await db.from("profile_preferences").select("matricula,preferred_name");
      const profilePhotos:any={}; for(const p of photos||[]) profilePhotos[String(p.matricula)]=p.photo_url;
      const preferredNames:any={}; for(const p of prefs||[]) preferredNames[String(p.matricula)]=p.preferred_name;
      return json({ok:true,importantInfo:state.important_info||[],campaigns:state.campaigns_config||[],popups:state.popup_messages||[],media:state.institutional_media||[],eday:state.eday_config||{},coupons:state.coupons_config||[],imageSlots:state.app_image_slots||{},historicalTickets:historicalTicketPayload(state),profilePhotos,preferredNames});
    }
    if(body.action==="content_admin_get"){
      const matricula=String(body.matricula||"");if(!(await adminAllowed(matricula)))return json({error:"Não autorizado."},403);
      const st=await getState(["important_info","campaigns_config","popup_messages","institutional_media","eday_config","coupons_config","app_image_slots","historical_ticket_ytd"]);
      return json({ok:true,importantInfo:st.important_info||[],campaigns:st.campaigns_config||[],popups:st.popup_messages||[],media:st.institutional_media||[],eday:st.eday_config||{},coupons:st.coupons_config||[],imageSlots:st.app_image_slots||{},historicalTickets:historicalTicketPayload(st)});
    }
    if(body.action==="app_image_slot_save"){
      const matricula=String(body.matricula||""),password=String(body.password||"");
      if(!(await adminOk(matricula,password)))return json({error:"Não autorizado."},403);
      const slot=String(body.slot||"").trim();
      const allowed=new Set(["login_background","home_hero_1","home_hero_2","home_hero_3","community_cover"]);
      if(!allowed.has(slot))return json({error:"Área de mídia inválida."},400);
      const mediaUrl=String(body.url||"").trim(),linkUrl=String(body.link_url||"").trim();
      let mediaType=String(body.media_type||"image").toLowerCase();
      mediaType=mediaType.startsWith("video")?"video":"image";
      if(slot==="login_background"&&mediaType==="video")return json({error:"A tela de login utiliza imagem. Vídeos podem ser usados nos destaques da Home e na capa da comunidade."},400);
      const allowedPositions=new Set(["center center","center top","center 20%","center 30%","center 34%","center 38%","center 45%","left center","right center"]);
      const position=allowedPositions.has(String(body.position||""))?String(body.position):"center center";
      if(mediaUrl && !/^https?:\/\//i.test(mediaUrl))return json({error:"URL de mídia inválida."},400);
      if(linkUrl && !/^https?:\/\//i.test(linkUrl))return json({error:"Link de destino inválido."},400);
      const state=await getState(["app_image_slots"]);
      const value=(state.app_image_slots && typeof state.app_image_slots==="object" && !Array.isArray(state.app_image_slots))?{...state.app_image_slots}:{};
      const oldUrl=String(value?.[slot]?.url||"");
      if(!mediaUrl) delete value[slot];
      else value[slot]={url:mediaUrl,media_type:mediaType,link_url:linkUrl,position,updated_at:new Date().toISOString(),updated_by:matricula};
      const {error}=await db.from("app_state").upsert({key:"app_image_slots",value,updated_at:new Date().toISOString()},{onConflict:"key"});
      if(error)throw error;
      if(oldUrl&&oldUrl!==mediaUrl)await removeManagedAppMediaIfUnused(oldUrl,value);
      return json({ok:true,slots:value});
    }
    if(body.action==="content_item_save"){
      const matricula=String(body.matricula||""),password=String(body.password||"");if(!(await adminOk(matricula,password)))return json({error:"Não autorizado."},403);
      const kind=String(body.kind||"");
      const key=kind==="info"?"important_info":kind==="campaign"?"campaigns_config":kind==="coupon"?"coupons_config":kind==="popup"?"popup_messages":"";
      if(!key)return json({error:"Tipo inválido."},400);
      const st=await getState([key]);let arr=Array.isArray(st[key])?st[key]:[],x=body.item||{},id=String(x.id||crypto.randomUUID());
      const start_at=String(x.start_at||x.start||"").slice(0,10),end_at=String(x.end_at||x.end||"").slice(0,10);
      if(start_at && !/^\d{4}-\d{2}-\d{2}$/.test(start_at))return json({error:"Data inicial inválida."},400);
      if(end_at && !/^\d{4}-\d{2}-\d{2}$/.test(end_at))return json({error:"Data final inválida."},400);
      if(start_at&&end_at&&end_at<start_at)return json({error:"A data final não pode ser anterior à inicial."},400);
      const item={
        id,
        title:String(x.title||x.code||"").slice(0,120),
        code:String(x.code||"").toUpperCase().slice(0,40),
        text:String(x.text||x.description||"").slice(0,4000),
        description:String(x.description||x.text||"").slice(0,4000),
        period:String(x.period||"").slice(0,120),
        mechanics:String(x.mechanics||"").slice(0,4000),
        clientBenefit:String(x.clientBenefit||x.client_benefit||"").slice(0,2000),
        employeeBenefit:String(x.employeeBenefit||x.employee_benefit||"").slice(0,2000),
        image_url:String(x.image_url||"").slice(0,1000),
        link_url:String(x.link_url||"").slice(0,1000),
        link_label:String(x.link_label||"Saiba mais").slice(0,60),
        start_at,end_at,active:x.active!==false,
        updated_at:new Date().toISOString(),updated_by:matricula
      };
      if(!item.title)return json({error:"Informe o título."},400);
      if(kind==="coupon"&&!item.code)return json({error:"Informe o código do cupom."},400);
      let i=arr.findIndex((z:any)=>String(z.id)===id);if(i>=0)arr[i]=item;else arr.unshift(item);
      const {error}=await db.from("app_state").upsert({key,value:arr,updated_at:new Date().toISOString()},{onConflict:"key"});if(error)throw error;return json({ok:true,item,value:arr});
    }
    if(body.action==="content_item_delete"){
      const matricula=String(body.matricula||""),password=String(body.password||"");if(!(await adminOk(matricula,password)))return json({error:"Não autorizado."},403);
      const kind=String(body.kind||""),id=String(body.id||""),key=kind==="info"?"important_info":kind==="campaign"?"campaigns_config":kind==="coupon"?"coupons_config":kind==="popup"?"popup_messages":"";
      if(!key)return json({error:"Tipo inválido."},400);
      const st=await getState([key]);let arr=(Array.isArray(st[key])?st[key]:[]).filter((x:any)=>String(x.id)!==id);const {error}=await db.from("app_state").upsert({key,value:arr,updated_at:new Date().toISOString()},{onConflict:"key"});if(error)throw error;return json({ok:true,value:arr});
    }
    if(body.action==="eday_admin_save"){
      const matricula=String(body.matricula||""),password=String(body.password||"");if(!(await adminOk(matricula,password)))return json({error:"Não autorizado."},403);
      const x=body.config||{},value={active:x.active!==false,start:String(x.start||""),end:String(x.end||""),rate:n(x.rate||.10),weekdays:Array.isArray(x.weekdays)?x.weekdays.map((v:any)=>Math.trunc(n(v))).filter((v:number)=>v>=0&&v<=6):[1],updated_at:new Date().toISOString(),updated_by:matricula};
      const {error}=await db.from("app_state").upsert({key:"eday_config",value,updated_at:new Date().toISOString()},{onConflict:"key"});if(error)throw error;return json({ok:true,config:value});
    }
    if(body.action==="content_publish"){
      const matricula=String(body.matricula||""), password=String(body.password||"");
      if(!(await adminOk(matricula,password)))return json({error:"Não autorizado."},403);
      const kind=String(body.kind||"");
      if(!["important_info","campaigns_config","institutional_media","coupons_config"].includes(kind))return json({error:"Tipo de conteúdo inválido."},400);
      const value=Array.isArray(body.value)?body.value:[];
      const {error}=await db.from("app_state").upsert({key:kind,value,updated_at:new Date().toISOString()},{onConflict:"key"});
      if(error)throw error;
      return json({ok:true,kind,count:value.length});
    }
    if(body.action==="meta_assign_set"){
      const matricula=String(body.matricula||""), st=String(body.st||""), date=String(body.date||""), targetMatricula=String(body.target_matricula||""), target=n(body.target);
      if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!REGIONAL.has(st)||!targetMatricula||target<0)return json({error:"Dados de meta inválidos."},400);
      const users=await allUserState(); let me:any=null,targetUser:any=null; for(const sc of Object.keys(users)){for(const u of (users[sc]?.users||[])){if(String(u.id)===matricula)me=u;if(String(u.id)===targetMatricula)targetUser=u;}}
      const isAdmin=await adminAllowed(matricula); const selfCommit=matricula===targetMatricula;
      if(!isAdmin&&!selfCommit&&(!me?.lead||String(me.st)!==st))return json({error:"Apenas o supervisor da filial pode distribuir meta para outra pessoa."},403);
      if(selfCommit){ if(!me||String(me.st)!==st)return json({error:"Matrícula não pertence à filial selecionada."},400); targetUser=me; }
      if(!targetUser||String(targetUser.st)!==st)return json({error:"Colaborador não pertence à filial selecionada."},400);
      const {data,error}=await db.from("meta_assignments").upsert({result_date:date,store_code:st,matricula:targetMatricula,target,assigned_by:matricula,updated_at:new Date().toISOString()},{onConflict:"result_date,store_code,matricula"}).select().single(); if(error)throw error; return json({ok:true,assignment:data});
    }
    if(body.action==="hc_set"){
      const matricula=String(body.matricula||""), st=String(body.st||""), date=String(body.date||""), hc=Math.trunc(n(body.hc));
      if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!REGIONAL.has(st)||hc<1||hc>500)return json({error:"Dados de distribuição inválidos."},400);
      const state=await getState(["common_base","config","meta_hc"]);
      const isAdmin=await adminAllowed(matricula);
      const supervisors=state.common_base?.stores?.[st]?.sup||[];
      const isSupervisor=supervisors.some((u:any)=>String(u.id)===matricula && !/ferias/i.test(String(u.status||"")));
      if(!(isAdmin||isSupervisor)) return json({error:"Acesso não autorizado para esta filial."},403);
      const value=state.meta_hc||{};
      value[date]=value[date]||{};
      value[date][st]={hc,updated_by:matricula,updated_at:new Date().toISOString()};
      const {error}=await db.from("app_state").upsert({key:"meta_hc",value,updated_at:new Date().toISOString()},{onConflict:"key"});
      if(error)throw error;
      return json({ok:true,date,st,hc});
    }
    if(body.action==="history_import_2026" && body.import_key==="CEPI-2026-09-HIST-FINAL"){
      const rows=Array.isArray(body.rows)?body.rows:[];if(!rows.length||rows.length>400)return json({error:"Lote inválido."},400);
      const payload=rows.map((r:any)=>({month:String(r.month),matricula:String(r.matricula),store_code:String(r.store_code).padStart(3,"0"),captured:n(r.captured),approved:n(r.approved),orders:Math.trunc(n(r.orders)),eday_approved:n(r.eday_approved),updated_at:new Date().toISOString()}));
      const {error}=await db.from("monthly_collaborator_history").upsert(payload,{onConflict:"month,matricula,store_code"});if(error)throw error;return json({ok:true,count:payload.length});
    }

    if(body.action==="ritual_get"){
      const matricula=String(body.matricula||"").trim(),date=String(body.date||"").trim(),requestedStore=String(body.st||"").padStart(3,"0");
      if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return json({error:"Data inválida."},400);
      const ctx=await actorContext(matricula);
      if(!ritualSupervisorAllowed(ctx))return json({error:"Ritual disponível para perfil Supervisor."},403);
      const ref=await ritualReference(ctx,date,requestedStore);
      const {data:existing,error}=await db.from("estore_daily_ritual").select("*").eq("result_date",date).eq("matricula",matricula).maybeSingle();
      if(error)throw error;
      return json({ok:true,date,store_code:ref.st,reference:ref,existing:existing||null});
    }
    if(body.action==="ritual_save"){
      const matricula=String(body.matricula||"").trim(),date=String(body.date||"").trim(),requestedStore=String(body.st||"").padStart(3,"0");
      if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return json({error:"Data inválida."},400);
      const ctx=await actorContext(matricula);
      if(!ritualSupervisorAllowed(ctx))return json({error:"Ritual disponível para perfil Supervisor."},403);
      const ref=await ritualReference(ctx,date,requestedStore);
      const ans=body.answers||{};
      const metaInput=n(ans.meta);
      const orderInput=Math.trunc(n(ans.orders));
      const distributed=ans.distributed===true;
      const individualInput=n(ans.individual_meta);
      const mobileProvador=ans.mobile_provador===true,mobileCaixa=ans.mobile_caixa===true,mobileAdv=ans.mobile_adv===true;
      const deviationInput=n(ans.deviation);
      const couponInput=String(ans.coupon||"").trim();

      const metaOk=ref.metaExpected>0&&Math.abs(metaInput-ref.metaExpected)<=0.02;
      const orderOk=ref.orderExpected>0&&orderInput===ref.orderExpected;
      const distributionOk=distributed&&ref.hc>0&&ref.assignments.length>0&&ref.individualExpected>0&&Math.abs(individualInput-ref.individualExpected)<=0.05;
      const mobilesOk=mobileProvador&&mobileCaixa&&mobileAdv;
      const deviationOk=ans.deviation_entered===true&&ref.deviationExpected!==null&&Math.abs(deviationInput-n(ref.deviationExpected))<=0.05;
      const normalizedCoupon=couponInput.toUpperCase().replace(/\s+/g,"");
      const couponOk=ref.couponExpected.length>0&&ref.couponExpected.some((code:string)=>normalizedCoupon.includes(String(code).toUpperCase().replace(/\s+/g,"")));

      let score=0;
      if(metaOk)score+=20;
      if(orderOk)score+=15;
      if(distributionOk)score+=20;
      if(mobilesOk)score+=15;
      if(deviationOk)score+=15;
      if(couponOk)score+=15;
      const ready=score>=80,status=ready?"pronta":score>=60?"atencao":"critico";
      const row={
        result_date:date,matricula,store_code:ref.st,supervisor_name:String(ctx?.name||""),supervisor_role:String(ctx?.role||""),
        meta_input:+metaInput.toFixed(2),meta_expected:ref.metaExpected,meta_ok:metaOk,
        order_input:orderInput,order_expected:ref.orderExpected,order_ok:orderOk,
        distributed,hc_available:ref.hc,individual_meta_input:+individualInput.toFixed(2),individual_meta_expected:ref.individualExpected,distribution_ok:distributionOk,
        mobile_provador:mobileProvador,mobile_caixa:mobileCaixa,mobile_adv:mobileAdv,mobiles_ok:mobilesOk,
        deviation_input:+deviationInput.toFixed(2),deviation_expected:ref.deviationExpected,deviation_reference_date:ref.deviationDate||null,deviation_ok:deviationOk,
        coupon_input:couponInput,coupon_expected:ref.couponExpected,coupon_ok:couponOk,
        score,ready,status,answers:ans,submitted_at:new Date().toISOString(),updated_at:new Date().toISOString()
      };
      const {data,error}=await db.from("estore_daily_ritual").upsert(row,{onConflict:"result_date,matricula"}).select().single();
      if(error)throw error;
      return json({ok:true,item:data,score,ready,status,checks:{meta:metaOk,orders:orderOk,distribution:distributionOk,mobiles:mobilesOk,deviation:deviationOk,coupon:couponOk},reference:ref});
    }
    if(body.action==="ritual_report"){
      const matricula=String(body.matricula||"").trim(),date=String(body.date||"").trim();
      if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return json({error:"Data inválida."},400);
      if(!(await adminAllowed(matricula)))return json({error:"Acesso administrativo não autorizado."},403);
      const {data:people,error:pe}=await allCollaborators("matricula,nome,store_code,cargo,situacao,profile_type,eligible_supervisor");
      if(pe)throw pe;
      const roster=(people||[]).filter((p:any)=>{
        const st=String(p.store_code||"").padStart(3,"0"),status=String(p.situacao||"");
        return REGIONAL.has(st)&&eligibleSupervisorRole(p.cargo)&&!/deslig|afast|ferias|férias/i.test(status);
      }).map((p:any)=>({matricula:String(p.matricula),nome:String(p.nome||""),store_code:String(p.store_code||"").padStart(3,"0"),cargo:String(p.cargo||""),situacao:String(p.situacao||"")}));
      const {data:rows,error}=await db.from("estore_daily_ritual").select("*").eq("result_date",date).order("store_code").order("score",{ascending:false});
      if(error)throw error;
      const byId=new Map((rows||[]).map((r:any)=>[String(r.matricula),r]));
      const items=roster.map((p:any)=>({...p,response:byId.get(p.matricula)||null,score:byId.get(p.matricula)?.score??null,ready:byId.get(p.matricula)?.ready??false,status:byId.get(p.matricula)?.status||"nao_respondido"}));
      const responded=items.filter((x:any)=>!!x.response),readyCount=responded.filter((x:any)=>x.ready).length;
      const avgScore=responded.length?Math.round(responded.reduce((s:number,x:any)=>s+n(x.score),0)/responded.length):0;
      return json({ok:true,date,items,summary:{expected:items.length,responded:responded.length,missing:items.length-responded.length,adherence:items.length?responded.length/items.length:0,ready:readyCount,avgScore}});
    }
    if(body.action==="ritual_weekly_regional"){
      const matricula=String(body.matricula||"").trim(),requestedWeek=String(body.week_start||"");
      const ctx=await actorContext(matricula);
      if(!ctx?.admin)return json({error:"Visão Regional do Raio-X disponível somente para Administrador."},403);

      const {data:weeksRaw,error:we}=await db.from("estore_weekly_history")
        .select("week_start,week_end,week_number")
        .neq("store_code","REGIONAL")
        .order("week_start",{ascending:false});
      if(we)throw we;
      const weekMap=new Map<string,any>();
      for(const w of weeksRaw||[]){
        const k=String(w.week_start||"");
        if(k&&!weekMap.has(k))weekMap.set(k,{start:k,end:String(w.week_end||weekEndOf(k)),number:Math.trunc(n(w.week_number))||isoWeekNumber(k)});
      }
      const weeks=[...weekMap.values()].sort((a:any,b:any)=>String(b.start).localeCompare(String(a.start)));
      if(!weeks.length)return json({ok:true,weeks:[],week:null,summary:{},pillars:{},stores:[]});
      const requested=/^\d{4}-\d{2}-\d{2}$/.test(requestedWeek)?weekStartOf(requestedWeek):"";
      const week=weeks.find((x:any)=>x.start===requested)||weeks[0];
      const weekStart=week.start,weekEnd=week.end,previousWeekStart=addIsoDays(weekStart,-7),previousWeekEnd=weekEndOf(previousWeekStart);

      const [{data:hist,error:he},{data:rituals,error:re},{data:daily,error:de},{data:people,error:pe},{data:fcas,error:fe}]=await Promise.all([
        db.from("estore_weekly_history").select("*").in("week_start",[previousWeekStart,weekStart]),
        db.from("estore_weekly_ritual").select("*").eq("week_start",weekStart).order("store_code").order("supervisor_name"),
        db.from("daily_collaborator").select("date,matricula,store_code,captured,approved,orders").gte("date",weekStart).lte("date",weekEnd),
        allCollaborators("matricula,nome,store_code,cargo,situacao,profile_type"),
        db.from("fca_weekly").select("store_code,status,review_status").eq("week_start",weekStart)
      ]);
      if(he)throw he;if(re)throw re;if(de)throw de;if(pe)throw pe;if(fe)throw fe;

      const cur=new Map((hist||[]).filter((x:any)=>String(x.week_start)===weekStart&&REGIONAL.has(String(x.store_code))).map((x:any)=>[String(x.store_code),x]));
      const prev=new Map((hist||[]).filter((x:any)=>String(x.week_start)===previousWeekStart&&REGIONAL.has(String(x.store_code))).map((x:any)=>[String(x.store_code),x]));

      const deltaRows=[...REGIONAL].map(st=>{
        const a:any=cur.get(st),b:any=prev.get(st);
        if(!a||!b)return null;
        return {st,delta:+(n(a.share)-n(b.share)).toFixed(10)};
      }).filter(Boolean).sort((a:any,b:any)=>a.delta-b.delta);
      const priorities=deltaRows.filter((x:any)=>x.delta<0).slice(0,5).map((x:any,i:number)=>({...x,rank:i+1}));
      const priorityMap=new Map(priorities.map((x:any)=>[x.st,x.rank]));

      const salesByStore=new Map<string,Map<string,number>>();
      for(const r of daily||[]){
        const st=String(r.store_code||"").padStart(3,"0"),id=String(r.matricula||"").trim();
        if(!REGIONAL.has(st)||!id)continue;
        if(!salesByStore.has(st))salesByStore.set(st,new Map());
        const m=salesByStore.get(st)!;m.set(id,(m.get(id)||0)+n(r.captured));
      }

      const rosterByStore=new Map<string,Set<string>>(),supByStore=new Map<string,any[]>();
      for(const p of people||[]){
        const st=String(p.store_code||"").padStart(3,"0"),id=String(p.matricula||"").trim(),status=String(p.situacao||"");
        if(!REGIONAL.has(st)||!id)continue;
        if(!/deslig/i.test(status)&&commissionEligibleRole(p.cargo)){
          if(!rosterByStore.has(st))rosterByStore.set(st,new Set());
          rosterByStore.get(st)!.add(id);
        }
        if(eligibleSupervisorRole(p.cargo)&&!/deslig|afast|ferias|férias/i.test(status)){
          if(!supByStore.has(st))supByStore.set(st,[]);
          supByStore.get(st)!.push({id,name:String(p.nome||id),role:String(p.cargo||""),status});
        }
      }

      const ritualByStore=new Map<string,any[]>();
      for(const r of rituals||[]){
        const st=String(r.store_code||"").padStart(3,"0");
        if(!ritualByStore.has(st))ritualByStore.set(st,[]);
        ritualByStore.get(st)!.push(r);
      }
      const fcaMap=new Map((fcas||[]).map((x:any)=>[String(x.store_code),x]));

      const stores=[...REGIONAL].sort().map(st=>{
        const h:any=cur.get(st)||null,p:any=prev.get(st)||null;
        const roster=[...(rosterByStore.get(st)||new Set())],sm=salesByStore.get(st)||new Map();
        const sold=roster.filter(id=>n(sm.get(id))>0).length,total=roster.length,zeros=Math.max(0,total-sold),participation=total?sold/total:0,dispersion=total?zeros/total:0;
        const expected=supByStore.get(st)||[],responses=ritualByStore.get(st)||[],completed=responses.filter((x:any)=>x.status==="concluido");
        const scoreRows=(completed.length?completed:responses).filter((x:any)=>Number.isFinite(Number(x.management_pct)));
        const managementPct=scoreRows.length?Math.round(scoreRows.reduce((a:number,x:any)=>a+n(x.management_pct),0)/scoreRows.length):null;
        const share=h?n(h.share):null,previousShare=p?n(p.share):null,shareDelta=share!==null&&previousShare!==null?+(share-previousShare).toFixed(10):null;
        return {
          st,name:String(h?.store_name||("Filial "+st)),share,previousShare,shareDelta,
          captured:h?n(h.captured):0,orders:h?Math.trunc(n(h.orders)):0,ticket:h?n(h.ticket):0,
          teamTotal:total,sold,zeros,participation:+participation.toFixed(4),dispersion:+dispersion.toFixed(4),
          expectedSupervisors:expected,expectedCount:expected.length,responses,completedCount:completed.length,
          managementPct,priorityRank:priorityMap.get(st)||0,fca:fcaMap.get(st)||null
        };
      });

      const expectedAll=stores.reduce((a:number,x:any)=>a+x.expectedCount,0);
      const completedAll=stores.reduce((a:number,x:any)=>a+x.completedCount,0);
      const storesResponded=stores.filter((x:any)=>x.completedCount>0).length;
      const completedResponses=(rituals||[]).filter((x:any)=>x.status==="concluido");
      const avgMaturity=completedResponses.length?Math.round(completedResponses.reduce((a:number,x:any)=>a+n(x.management_pct),0)/completedResponses.length):0;
      const atOne=stores.filter((x:any)=>x.share!==null&&x.share>=.01).length;
      const retracting=stores.filter((x:any)=>x.shareDelta!==null&&x.shareDelta<0).length;
      const fcaPriority=stores.filter((x:any)=>x.priorityRank>0).length;

      const freq:any={todos:4,quase:3,metade:2,poucos:1,passou:0};
      const pillarKeys:any=[
        ["goal_management","Gestão de Metas"],
        ["recognition","Reconhecimento"],
        ["service_script","Atendimento"],
        ["campaigns","Campanhas"]
      ];
      const pillars:any={};
      for(const [key,label] of pillarKeys){
        const vals=completedResponses.map((r:any)=>freq[String(r.answers?.[key]||"")]).filter((v:any)=>Number.isFinite(v));
        pillars[key]={label,value:vals.length?Math.round(vals.reduce((a:number,v:number)=>a+v,0)/(vals.length*4)*100):null,count:vals.length};
      }

      const regionalCurrent=(hist||[]).find((x:any)=>String(x.week_start)===weekStart&&String(x.store_code)==="REGIONAL")||null;
      const regionalPrevious=(hist||[]).find((x:any)=>String(x.week_start)===previousWeekStart&&String(x.store_code)==="REGIONAL")||null;
      const regionalShare=regionalCurrent?n(regionalCurrent.share):(stores.filter((x:any)=>x.share!==null).length?stores.reduce((a:number,x:any)=>a+n(x.captured),0)/Math.max(1,stores.reduce((a:number,x:any)=>a+(x.share>0?n(x.captured)/n(x.share):0),0)):null);
      const regionalPreviousShare=regionalPrevious?n(regionalPrevious.share):null;
      const regionalDelta=regionalShare!==null&&regionalPreviousShare!==null?+(regionalShare-regionalPreviousShare).toFixed(10):null;

      return json({ok:true,weeks,week:{start:weekStart,end:weekEnd,number:week.number,previousStart:previousWeekStart,previousEnd:previousWeekEnd,previousNumber:isoWeekNumber(previousWeekStart)},
        summary:{stores:REGIONAL.size,storesResponded,expectedSupervisors:expectedAll,completedSupervisors:completedAll,adherence:expectedAll?completedAll/expectedAll:0,avgMaturity,atOne,retracting,fcaPriority,regionalShare,regionalPreviousShare,regionalDelta},
        pillars,stores});
    }

    if(body.action==="ritual_weekly_get"){
      const matricula=String(body.matricula||"").trim(),requestedStore=String(body.st||"").padStart(3,"0"),requestedWeek=String(body.week_start||"");
      const ctx=await actorContext(matricula);
      if(!ritualSupervisorAllowed(ctx))return json({error:"Raio-X disponível para perfil Supervisor."},403);
      const summary=await weeklyRitualContext(ctx,requestedWeek,requestedStore);
      const {data:existing,error}=await db.from("estore_weekly_ritual").select("*").eq("week_start",summary.weekStart).eq("matricula",matricula).maybeSingle();
      if(error)throw error;
      const {data:history,error:hh}=await db.from("estore_weekly_ritual").select("week_start,week_end,week_number,management_pct,diagnosis,status,submitted_at,store_code").eq("matricula",matricula).order("week_start",{ascending:false}).limit(10);
      if(hh)throw hh;
      return json({ok:true,summary,existing:existing||null,history:history||[]});
    }
    if(body.action==="ritual_weekly_save"){
      const matricula=String(body.matricula||"").trim(),requestedStore=String(body.st||"").padStart(3,"0"),requestedWeek=String(body.week_start||"");
      const ctx=await actorContext(matricula);
      if(!ritualSupervisorAllowed(ctx))return json({error:"Raio-X disponível para perfil Supervisor."},403);
      const summary=await weeklyRitualContext(ctx,requestedWeek,requestedStore);
      const ans=body.answers&&typeof body.answers==="object"?body.answers:{};
      const keys=["goal_management","recognition","service_script","campaigns"];
      const values=keys.map(k=>String(ans[k]||""));
      const invalid=values.some(v=>!Object.prototype.hasOwnProperty.call(RITUAL_FREQ_SCORE,v));
      const raw=values.reduce((s:number,v:string)=>s+n(RITUAL_FREQ_SCORE[v]),0);
      const pctScore=invalid?0:Math.round(raw/16*100);
      const diagnosis=pctScore>=85?"Alta Prontidão":pctScore>=70?"Consistente":pctScore>=50?"Em Evolução":"Atenção";
      const finalize=body.finalize===true;
      if(finalize){
        const required=[
          !invalid,
          ["nao","sim_tratado","sim_pendente"].includes(String(ans.irregular_status||"")),
          Number.isFinite(Number(ans.bdbt_rating))&&Number(ans.bdbt_rating)>=0&&Number(ans.bdbt_rating)<=5,
          !!String(ans.weak_day_reason||"").trim(),
          !!String(ans.wins_challenges||"").trim(),
          !!String(ans.action_cause||"").trim(),
          !!String(ans.action_plan||"").trim(),
          !!String(ans.action_owner||"").trim(),
          /^\d{4}-\d{2}-\d{2}$/.test(String(ans.action_deadline||""))
        ];
        if(required.some(x=>!x))return json({error:"Complete os itens obrigatórios do Raio-X antes de finalizar."},400);
      }
      const fcaSuggested=!!summary.fcaPriority || (summary.share!==null&&summary.share<.01) || (summary.shareDelta!==null&&summary.shareDelta<0);
      const row={
        week_start:summary.weekStart,week_end:summary.weekEnd,week_number:summary.weekNumber,matricula,store_code:summary.st,
        supervisor_name:String(ctx?.name||""),supervisor_role:String(ctx?.role||""),summary,answers:ans,
        management_score:raw,management_pct:pctScore,diagnosis,
        action_cause:String(ans.action_cause||"").trim()||null,action_plan:String(ans.action_plan||"").trim()||null,
        action_owner:String(ans.action_owner||"").trim()||null,action_deadline:/^\d{4}-\d{2}-\d{2}$/.test(String(ans.action_deadline||""))?String(ans.action_deadline):null,
        fca_suggested:fcaSuggested,status:finalize?"concluido":"rascunho",submitted_at:finalize?new Date().toISOString():null,updated_at:new Date().toISOString()
      };
      const {data,error}=await db.from("estore_weekly_ritual").upsert(row,{onConflict:"week_start,matricula"}).select().single();
      if(error)throw error;
      return json({ok:true,item:data,summary,management_pct:pctScore,diagnosis,fca_suggested:fcaSuggested});
    }
    if(body.action==="weekly_history_dashboard"){
      const matricula=String(body.matricula||"").trim();
      const ctx=await actorContext(matricula);
      if(!ctx||!ctx.admin)return json({error:"Acesso administrativo não autorizado."},403);
      const d=await weeklyHistoryDashboard(String(body.current_week||""),String(body.previous_week||""));
      return json({ok:true,...d});
    }
    if(body.action==="fca_regional_context_save"){
      const matricula=String(body.matricula||"").trim();
      if(!(await adminAllowed(matricula)))return json({error:"Acesso administrativo não autorizado."},403);
      const week_start=String(body.week_start||"").trim();
      if(!/^\d{4}-\d{2}-\d{2}$/.test(week_start)||weekStartOf(week_start)!==week_start)
        return json({error:"Semana de referência inválida."},400);
      const stateCtx=await getState(["fca_regional_context"]);
      const map=(stateCtx.fca_regional_context&&typeof stateCtx.fca_regional_context==="object")?stateCtx.fca_regional_context:{};
      const item={
        active:body.active!==false,
        event_code:String(body.event_code||"election_sunday_closure").slice(0,80),
        event_label:String(body.event_label||"Fechamento excepcional por eleições").slice(0,160),
        event_date:String(body.event_date||"").slice(0,10)||null,
        classification:String(body.classification||"fator_externo_pontual").slice(0,80),
        recurring:body.recurring===true,
        impacted_market:String(body.impacted_market||"Fortaleza").slice(0,120),
        fact:String(body.fact||"").trim().slice(0,3000),
        estimated_impact:+Math.max(0,n(body.estimated_impact)).toFixed(2),
        impact_basis:String(body.impact_basis||"").trim().slice(0,1000),
        action_plan:String(body.action_plan||"").trim().slice(0,3000),
        expected_result:String(body.expected_result||"").trim().slice(0,1500),
        owner:String(body.owner||"Regional CE+PI").trim().slice(0,160),
        status:String(body.status||"registrado").slice(0,80),
        updated_at:new Date().toISOString(),
        updated_by:matricula
      };
      map[week_start]=item;
      const {error}=await db.from("app_state").upsert({key:"fca_regional_context",value:map,updated_at:new Date().toISOString()},{onConflict:"key"});
      if(error)throw error;
      return json({ok:true,item});
    }
    if(body.action==="fca_dashboard"){
      const matricula=String(body.matricula||"").trim();
      const ctx=await actorContext(matricula);
      if(!ctx||(!ctx.lead&&!ctx.admin))return json({error:"Acesso exclusivo para supervisores e gestores."},403);
      const d=await fcaWeeklyData(matricula);
      if(matricula==="0000000"){
        for(const arr of [d.stores,d.prioritized,d.growth,d.topShare])for(const x of arr||[])x.supervisors=(x.supervisors||[]).map((u:any,i:number)=>({...u,id:"DEMO-SUP-"+x.st+"-"+(i+1),name:"Supervisor "+(i+1)}));
      }
      return json({ok:true,...d,ctx:{id:d.ctx.id,st:d.ctx.st,name:d.ctx.name,role:d.ctx.role,profile:d.ctx.profile,lead:d.ctx.lead,admin:d.ctx.admin}});
    }
    if(body.action==="fca_week_import"){
      const matricula=String(body.matricula||"").trim(),password=String(body.password||"");
      const cfg=(await getState(["config"])).config||{};
      if(matricula==="0000000"||matricula!==String(cfg.admin_matricula||"")||!password||(await sha256(password))!==String(cfg.admin_hash||""))
        return json({error:"Importação de share semanal autorizada apenas ao administrador principal mediante senha."},403);
      const start=String(body.week_start||"").trim(),shares=body.stores;
      if(!/^\d{4}-\d{2}-\d{2}$/.test(start)||!Number.isFinite(Date.parse(start))||weekStartOf(start)!==start||start>fortalezaToday())
        return json({error:"Informe a segunda-feira correta da semana de referência."},400);
      if(!Array.isArray(shares)||shares.length!==REGIONAL.size)return json({error:"Informe as 19 filiais e seus shares oficiais, sem duplicidades."},400);
      const map:any={};
      for(const v of shares){
        const st=String(v?.store_code||"").padStart(3,"0"),val=Number(v?.share);
        if(!REGIONAL.has(st)||Object.prototype.hasOwnProperty.call(map,st)||!Number.isFinite(val)||val<0||val>1)
          return json({error:"Código ou share inválido ou duplicado: "+st},400);
        map[st]=+val.toFixed(10);
      }
      if(Object.keys(map).length!==REGIONAL.size)return json({error:"Base semanal incompleta."},400);
      const regional_share=Number(body.regional_share);
      if(!Number.isFinite(regional_share)||regional_share<0||regional_share>1)
        return json({error:"Informe o share regional oficial da semana."},400);
      const st=await getState(["supervisor_share_official"]);
      const value=st.supervisor_share_official||{};value.week=value.week||{};
      value.week[start]={...(value.week[start]||{}),stores:map,regional_share:+regional_share.toFixed(10),
        through:weekEndOf(start),source:"Relatório gerencial semanal • validação ADM",
        imported_at:new Date().toISOString(),imported_by:matricula};
      const {error}=await db.from("app_state").upsert({key:"supervisor_share_official",value,updated_at:new Date().toISOString()},{onConflict:"key"});
      if(error)throw error;
      return json({ok:true,week_start:start,stores:Object.keys(map).length});
    }
    if(body.action==="fca_adv_note"){
      const matricula=String(body.matricula||"").trim(),store_code=String(body.store_code||"").padStart(3,"0"),week_start=String(body.week_start||"");
      if(!(await adminAllowed(matricula)))return json({error:"Acesso administrativo não autorizado."},403);
      if(!REGIONAL.has(store_code)||!/^\d{4}-\d{2}-\d{2}$/.test(week_start))return json({error:"Parâmetros inválidos."},400);
      const note=String(body.note||"").trim().slice(0,3000);
      const {data,error}=await db.from("fca_weekly").update({adv_observation:note,adv_matricula:matricula,adv_updated_at:new Date().toISOString(),review_status:"revisada",updated_at:new Date().toISOString()}).eq("week_start",week_start).eq("store_code",store_code).select().maybeSingle();
      if(error)throw error;
      if(!data)return json({error:"A FCA da filial ainda não foi iniciada."},404);
      return json({ok:true,item:data});
    }
    if(body.action==="supervisor_highlights"){
      const matricula=String(body.matricula||"").trim();
      const period=PERIODS.includes(String(body.period||"day"))?String(body.period||"day"):"day";
      const actorCtx=await actorContext(matricula);
      if(!actorCtx)return json({error:"Acesso não autorizado."},403);

      const dashboardId=matricula==="0000000"?await demoSourceMatricula():matricula;
      const dash=await buildDashboard(dashboardId);
      if(!dash)return json({error:"Usuário não localizado."},404);
      const asof=String(dash.asof||BASELINE);
      let startDate=asof,endDate=asof;
      if(period==="week"){
        const dt=new Date(asof+"T12:00:00Z"),dow=dt.getUTCDay()||7;
        dt.setUTCDate(dt.getUTCDate()-dow+1);
        startDate=dt.toISOString().slice(0,10);
      }else if(period==="month")startDate=asof.slice(0,7)+"-01";
      else if(period==="year")startDate=asof.slice(0,4)+"-01-01";

      // Share de Supervisores deve refletir exatamente o share oficial entregue pela filial
      // no relatório gerencial do período. Para a semana, quando existe snapshot oficial
      // carregado, ele é a fonte única do ranking de share.
      const shareState=await getState(["supervisor_share_official"]);
      const shareSnapshot=period==="week"
        ?shareState.supervisor_share_official?.week?.[startDate]
        :period==="month"
          ?shareState.supervisor_share_official?.month?.[startDate.slice(0,7)]
          :null;
      const officialPeriodShares=(shareSnapshot?.stores&&typeof shareSnapshot.stores==="object")?shareSnapshot.stores:null;

      const daily:any[]=[];
      for(let from=0;;from+=500){
        const {data:chunk,error}=await db.from("daily_collaborator")
          .select("date,matricula,store_code,captured,orders")
          .gte("date",startDate).lte("date",endDate).range(from,from+499);
        if(error)throw error;
        daily.push(...(chunk||[]));
        if(!chunk||chunk.length<500)break;
      }

      const salesByStore=new Map<string,Map<string,number>>();
      for(const r of daily){
        const st=String(r.store_code||"").padStart(3,"0"),id=String(r.matricula||"").trim();
        if(!REGIONAL.has(st)||!id)continue;
        if(!salesByStore.has(st))salesByStore.set(st,new Map());
        const m=salesByStore.get(st)!;
        m.set(id,(m.get(id)||0)+n(r.captured));
      }

      const {data:people,error:pe}=await allCollaborators("matricula,nome,store_code,cargo,situacao,profile_type");
      if(pe)throw pe;
      const rosterByStore=new Map<string,Set<string>>();
      const supervisorByStore=new Map<string,any[]>();
      for(const p of people||[]){
        const st=String(p.store_code||"").padStart(3,"0"),id=String(p.matricula||"").trim();
        if(!REGIONAL.has(st)||!id)continue;
        const status=String(p.situacao||"");
        if(!/ferias|férias|afast|deslig/i.test(status)&&commissionEligibleRole(p.cargo)){
          if(!rosterByStore.has(st))rosterByStore.set(st,new Set());
          rosterByStore.get(st)!.add(id);
        }
        const isSup=eligibleSupervisorRole(p.cargo);
        if(isSup&&!/deslig|afast/i.test(status)){
          if(!supervisorByStore.has(st))supervisorByStore.set(st,[]);
          supervisorByStore.get(st)!.push({id,name:String(p.nome||id),role:String(p.cargo||""),status});
        }
      }

      // Complementa supervisores a partir da base institucional para não perder nomes em férias.
      for(const st of Object.keys(dash.common?.stores||{})){
        const list=Array.isArray(dash.common?.stores?.[st]?.sup)?dash.common.stores[st].sup:[];
        for(const u of list){
          if(!eligibleSupervisorRole(u.role)||/deslig|afast/i.test(String(u.status||"")))continue;
          if(!supervisorByStore.has(st))supervisorByStore.set(st,[]);
          const a=supervisorByStore.get(st)!;
          if(!a.some((z:any)=>String(z.id)===String(u.id)))a.push({id:String(u.id),name:String(u.name||u.id),role:String(u.role||""),status:String(u.status||"")});
        }
      }

      const stores:any[]=[];
      for(const st of [...REGIONAL].sort()){
        const supervisors=supervisorByStore.get(st)||[];
        if(!supervisors.length)continue;
        const metric=dash.common?.stores?.[st]?.p?.[period]||{};
        const roster=[...(rosterByStore.get(st)||new Set())];
        const sm=salesByStore.get(st)||new Map();
        const sold=roster.filter(id=>n(sm.get(id))>0).length;
        const total=roster.length,zeros=Math.max(0,total-sold),disp=total?zeros/total:1;
        stores.push({
          st,
          name:storeName(dash.common,st),
          supervisors,
          c:+n(metric.c).toFixed(2),
          o:Math.trunc(n(metric.o)),
          share:officialPeriodShares?(Object.prototype.hasOwnProperty.call(officialPeriodShares,st)?n(officialPeriodShares[st]):0):n(metric.share),
          total,
          sold,
          zeros,
          disp
        });
      }

      if(matricula==="0000000"){
        for(const x of stores)x.supervisors=(x.supervisors||[]).map((u:any,i:number)=>({...u,id:"DEMO-SUP-"+x.st+"-"+(i+1),name:"Supervisor "+(i+1)}));
      }
      const sales=[...stores].filter(x=>x.c>0).sort((a,b)=>b.c-a.c||b.share-a.share);
      const shares=[...stores].filter(x=>x.share>0).sort((a,b)=>b.share-a.share||b.c-a.c);
      const orders=[...stores].filter(x=>x.o>0).sort((a,b)=>b.o-a.o||b.c-a.c);
      const dispersion=[...stores].filter(x=>x.total>0).sort((a,b)=>a.zeros-b.zeros||a.disp-b.disp||b.c-a.c);

      return json({
        ok:true,period,startDate,endDate,asof,
        source:{sales:"relatorio_minha_filial",share:officialPeriodShares?(period==="week"?"relatorio_gerencial_semanal_oficial":"relatorio_gerencial_mensal_oficial"):"relatorio_gerencia",dispersion:"base_colaboradores"},
        shareReference:officialPeriodShares?{period,periodKey:period==="week"?startDate:startDate.slice(0,7),through:String(shareSnapshot?.through||endDate),regionalShare:n(shareSnapshot?.regional_share),source:String(shareSnapshot?.source||"Relatório gerencial")}:null,
        stores,
        sales,
        shares,
        orders,
        dispersion
      });
    }
    if(body.action==="team_period"){
      const matricula=String(body.matricula||"").trim(),
            period=PERIODS.includes(String(body.period||"day"))?String(body.period||"day"):"day",
            requestedStore=String(body.store||"").padStart(3,"0");
      const actorCtx=await actorContext(matricula);
      if(!actorCtx||(!actorCtx.lead&&!actorCtx.admin))return json({error:"Acesso exclusivo para supervisores e gestores."},403);
      if(!/^\d+$/.test(matricula)||!REGIONAL.has(requestedStore))return json({error:"Parâmetros inválidos."},400);

      const [latestUpdate,latestDaily]=await Promise.all([
        db.from("daily_updates").select("result_date").order("result_date",{ascending:false}).limit(1),
        db.from("daily_collaborator").select("date").order("date",{ascending:false}).limit(1)
      ]);
      const latest=String([latestUpdate.data?.[0]?.result_date,latestDaily.data?.[0]?.date,BASELINE].filter(Boolean).sort().at(-1)||BASELINE);
      const requestedRef=String(body.reference_date||body.asof||body.end_date||body.date||"").slice(0,10);
      let endDate=/^\d{4}-\d{2}-\d{2}$/.test(requestedRef)?requestedRef:latest;
      if(endDate>latest)endDate=latest;

      let startDate=endDate;
      if(period==="week"){
        const d=new Date(endDate+"T12:00:00Z"),dow=d.getUTCDay()||7;
        d.setUTCDate(d.getUTCDate()-dow+1);
        startDate=d.toISOString().slice(0,10);
      }else if(period==="month"){
        startDate=endDate.slice(0,7)+"-01";
      }else if(period==="year"){
        startDate=endDate.slice(0,4)+"-01-01";
      }

      const daily:any[]=[];
      for(let from=0;;from+=500){
        const {data:chunk,error:de}=await db.from("daily_collaborator")
          .select("date,matricula,store_code,captured,approved,orders")
          .gte("date",startDate).lte("date",endDate).range(from,from+499);
        if(de)throw de;
        daily.push(...(chunk||[]));
        if(!chunk||chunk.length<500)break;
      }

      const map=new Map<string,any>();
      for(const r of daily||[]){
        const st=String(r.store_code||"").padStart(3,"0"),id=String(r.matricula||"");
        if(!REGIONAL.has(st)||!id)continue;
        const k=st+"|"+id,q=map.get(k)||{id,st,c:0,a:0,o:0};
        q.c+=n(r.captured);q.a+=n(r.approved);q.o+=Math.trunc(n(r.orders));map.set(k,q);
      }

      let updateRows:any[]=[];
      if(!(daily||[]).length){
        const {data:ups,error:ue}=await db.from("daily_updates")
          .select("result_date,collaborators")
          .gte("result_date",startDate).lte("result_date",endDate);
        if(ue)throw ue;
        updateRows=ups||[];
        for(const up of updateRows)for(const r of(up.collaborators||[])){
          if(r.regional!=="CE + PI")continue;
          const st=String(r.st||"").padStart(3,"0"),id=String(r.id||r.matricula||"");
          if(!REGIONAL.has(st)||!id)continue;
          const k=st+"|"+id,q=map.get(k)||{id,st,c:0,a:0,o:0};
          q.c+=n(r.c??r.captured);q.a+=n(r.a??r.approved);q.o+=Math.trunc(n(r.o??r.orders));map.set(k,q);
        }
      }

      const {data:people,error:pe}=await allCollaborators("matricula,nome,store_code,situacao,cargo");
      if(pe)throw pe;
      const names=new Map<string,string>(),roles=new Map<string,string>(),activeByStore=new Map<string,Set<string>>(),commissionEligibleIds=new Set<string>();
      for(const p of people||[]){
        const id=String(p.matricula||""),st=String(p.store_code||"").padStart(3,"0");
        if(id&&String(p.nome||"").trim())names.set(id,String(p.nome).trim());
        if(id)roles.set(id,String(p.cargo||""));
        if(id&&REGIONAL.has(st)&&commissionEligibleRole(p.cargo)){
          commissionEligibleIds.add(id);
          if(!activeByStore.has(st))activeByStore.set(st,new Set());
          activeByStore.get(st)!.add(id);
        }
      }
      for(const [k,v] of map){
        if(!commissionEligibleIds.has(String(v.id)))continue;
        if(!activeByStore.has(v.st))activeByStore.set(v.st,new Set());
        activeByStore.get(v.st)!.add(v.id);
      }

      const stores:any[]=[];
      for(const st of [...REGIONAL].sort()){
        const ids=[...(activeByStore.get(st)||new Set())],
              rows=ids.map(id=>{
                const q=map.get(st+"|"+id)||{c:0,a:0,o:0};
                return{id,st,name:names.get(id)||("Matrícula "+id),role:roles.get(id)||"",cargo:roles.get(id)||"",c:+n(q.c).toFixed(2),a:+n(q.a).toFixed(2),o:Math.trunc(n(q.o))}
              }).sort((a,b)=>b.c-a.c),
              sold=rows.filter(x=>x.c>0),zeros=rows.filter(x=>x.c<=0);
        stores.push({
          st,total:rows.length,sold:sold.length,zeros:zeros.length,
          captured:+sold.reduce((s,x)=>s+x.c,0).toFixed(2),
          approved:+sold.reduce((s,x)=>s+x.a,0).toFixed(2),
          orders:sold.reduce((s,x)=>s+x.o,0),rows
        });
      }

      const rosterCount=(people||[]).filter((p:any)=>REGIONAL.has(String(p.store_code||"").padStart(3,"0"))).length;
      const salesPeople=new Set([...map.values()].map((x:any)=>String(x.st)+"|"+String(x.id))).size;
      const unmatchedSales=[...map.values()].filter((x:any)=>!names.has(String(x.id))).map((x:any)=>({matricula:String(x.id),store_code:String(x.st)}));
      const rosterComplete=unmatchedSales.length===0 && rosterCount>0;
      const dataAvailable=(daily||[]).length>0 || updateRows.length>0 || endDate===latest;

      if(matricula==="0000000")for(const s of stores)s.rows=(s.rows||[]).map((x:any,i:number)=>({...x,id:"DEMO-"+s.st+"-"+(i+1),name:"Colaborador "+(i+1)}));

      return json({
        ok:true,period,startDate,endDate,referenceDate:endDate,
        requestedReferenceDate:requestedRef||null,
        source:(daily||[]).length?"relatorio_vendedores":updateRows.length?"daily_updates":"sem_movimento",
        dataAvailable,rosterComplete,rosterCount,salesPeople,
        unmatchedSales:matricula==="0000000"?[]:unmatchedSales,
        stores,
        store:stores.find(x=>x.st===requestedStore)||{st:requestedStore,total:0,sold:0,zeros:0,captured:0,approved:0,orders:0,rows:[]}
      });
    }
    if(body.action==="ranking_period"){
      const matricula=String(body.matricula||"").trim(), month=String(body.month||""), period=PERIODS.includes(String(body.period||"month"))?String(body.period||"month"):"month", requestedStore=String(body.store||"").padStart(3,"0");
      const actorCtx=await actorContext(matricula);if(!actorCtx)return json({error:"Acesso não autorizado."},403);if(!actorCtx.admin&&!actorCtx.lead&&requestedStore!==actorCtx.st)return json({error:"Ranking de filial restrito à sua filial."},403);
      if(!/^\d+$/.test(matricula))return json({error:"Parâmetros inválidos."},400);
      const latestRow=await db.from("daily_collaborator").select("date").order("date",{ascending:false}).limit(1);
      const latest=String(latestRow.data?.[0]?.date||BASELINE);
      let startDate=latest,endDate=latest,ym=latest.slice(0,7);
      if(period==="week"){
        const d=new Date(latest+"T12:00:00Z"),dow=d.getUTCDay()||7;d.setUTCDate(d.getUTCDate()-dow+1);startDate=d.toISOString().slice(0,10);
      }else if(period==="month"){
        ym=/^\d{4}-\d{2}$/.test(month)?month:latest.slice(0,7);startDate=ym+"-01";
        const nx=new Date(Date.UTC(+ym.slice(0,4),+ym.slice(5,7),1));endDate=new Date(nx.getTime()-86400000).toISOString().slice(0,10);
        if(ym===latest.slice(0,7)&&endDate>latest)endDate=latest;
      }else if(period==="year"){startDate=latest.slice(0,4)+"-01-01";endDate=latest;}
      const rows:any[]=[];
      for(let from=0;;from+=500){
        const {data:chunk,error}=await db.from("daily_collaborator").select("date,matricula,store_code,captured,approved,orders").gte("date",startDate).lte("date",endDate).range(from,from+499);
        if(error)throw error;rows.push(...(chunk||[]));if(!chunk||chunk.length<500)break;
      }
      const {data:people}=await allCollaborators("matricula,nome,store_code");
      const names=new Map<string,string>();for(const x of people||[])if(String(x.matricula||""))names.set(String(x.matricula),String(x.nome||"").trim());
      const reg=new Map<string,any>(),loc=new Map<string,any>();
      const add=(map:Map<string,any>,r:any)=>{
        const st=String(r.store_code||"").padStart(3,"0"),id=String(r.matricula||"");if(!id||!REGIONAL.has(st))return;
        const k=st+"|"+id,q=map.get(k)||{id,st,name:names.get(id)||("Matrícula "+id),c:0,a:0,o:0};
        q.c+=n(r.captured);q.a+=n(r.approved);q.o+=Math.trunc(n(r.orders));map.set(k,q);
      };
      for(const r of rows){add(reg,r);if(String(r.store_code||"").padStart(3,"0")===requestedStore)add(loc,r);}
      const regional=[...reg.values()].filter((x:any)=>n(x.c)>0).sort((x:any,y:any)=>(y.c-x.c)||String(x.id).localeCompare(String(y.id))).map((x:any,i:number)=>({...x,rr:i+1}));
      const store=[...loc.values()].filter((x:any)=>n(x.c)>0).sort((x:any,y:any)=>(y.c-x.c)||String(x.id).localeCompare(String(y.id))).map((x:any,i:number)=>({...x,sr:i+1}));
      const meRegional=regional.find((x:any)=>String(x.id)===matricula)||null,meStore=store.find((x:any)=>String(x.id)===matricula)||null;
      const regionalOut=matricula==="0000000"?regional.map((x:any,i:number)=>({...x,id:"DEMO-R-"+(i+1),name:"Colaborador "+(i+1)})):regional;
      const storeOut=matricula==="0000000"?store.map((x:any,i:number)=>({...x,id:"DEMO-L-"+(i+1),name:"Colaborador "+(i+1)})):store;
      return json({ok:true,period,month:period==="month"?ym:"",startDate,endDate,source:"relatorio_colaborador",regional:regionalOut,store:storeOut,myRegionalRank:meRegional?.rr||null,myStoreRank:meStore?.sr||null});
    }
    if(body.action==="collaborators_admin_get"){
      const matricula=String(body.matricula||""); if(!(await adminAllowed(matricula)))return json({error:"Não autorizado."},403);
      const {data,error}=await allCollaborators();if(error)throw error;
      data.sort((a:any,b:any)=>String(a.store_code||"").localeCompare(String(b.store_code||""))||String(a.nome||"").localeCompare(String(b.nome||""),"pt-BR"));
      const {data:hist,error:hh}=await db.from("collaborator_import_history").select("*").order("imported_at",{ascending:false}).limit(20);if(hh)throw hh;
      const st=await getState(["admin_grants"]); return json({ok:true,collaborators:data||[],history:hist||[],grants:st.admin_grants||[]});
    }
    if(body.action==="collaborator_admin_save"){
      const actor=String(body.matricula||""),password=String(body.password||"");if(!(await adminOk(actor,password)))return json({error:"Não autorizado."},403);
      const x=body.collaborator||{}, id=String(x.matricula||"").trim(), st=String(x.store_code||"").padStart(3,"0");
      if(!/^\d+$/.test(id)||!REGIONAL.has(st)||!String(x.nome||"").trim())return json({error:"Informe matrícula, nome e filial válidos."},400);
      const profile=["colaborador","supervisor","gerente"].includes(String(x.profile_type))?String(x.profile_type):"colaborador";
      const {data:prev}=await db.from("collaborators").select("*").eq("matricula",id).maybeSingle();
      const row={matricula:id,nome:String(x.nome).trim(),store_code:st,cargo:String(x.cargo||""),situacao:String(x.situacao||prev?.situacao||"Atividade Normal"),admissao:String(x.admissao||prev?.admissao||"")||null,profile_type:profile,menu_permissions:Array.isArray(x.menu_permissions)?x.menu_permissions:(Array.isArray(prev?.menu_permissions)?prev.menu_permissions:[]),eligible_supervisor:x.eligible_supervisor===undefined?!!prev?.eligible_supervisor:!!x.eligible_supervisor,is_admin:!!prev?.is_admin,updated_at:new Date().toISOString()};
      const {error}=await db.from("collaborators").upsert(row,{onConflict:"matricula"});if(error)throw error;
      const {data:allActive,error:ae}=await allCollaborators();if(ae)throw ae;
      const roster=(allActive||[]).filter((z:any)=>REGIONAL.has(String(z.store_code).padStart(3,"0"))).map((z:any)=>({id:String(z.matricula),name:z.nome||"",st:String(z.store_code).padStart(3,"0"),role:z.cargo||"",profile:z.profile_type||"colaborador"}));
      await db.from("app_state").upsert({key:"regional_roster_cepi",value:roster,updated_at:new Date().toISOString()},{onConflict:"key"});
      return json({ok:true,collaborator:row});
    }
    if(body.action==="admin_grant_set"){
      const actor=String(body.matricula||""),password=String(body.password||"");if(!(await adminOk(actor,password)))return json({error:"Não autorizado."},403);
      const target=String(body.target_matricula||"").trim(),expires=String(body.expires_at||"");if(!/^\d+$/.test(target)||!expires)return json({error:"Informe matrícula e validade."},400);
      const st=await getState(["admin_grants"]);let g=Array.isArray(st.admin_grants)?st.admin_grants.filter((x:any)=>String(typeof x==="string"?x:x?.matricula)!==target):[];
      g.push({matricula:target,expires_at:expires,active:true,granted_by:actor,granted_at:new Date().toISOString()});
      const {error}=await db.from("app_state").upsert({key:"admin_grants",value:g,updated_at:new Date().toISOString()},{onConflict:"key"});if(error)throw error;return json({ok:true,grants:g});
    }
    if(body.action==="admin_grant_revoke"){
      const actor=String(body.matricula||""),password=String(body.password||"");if(!(await adminOk(actor,password)))return json({error:"Não autorizado."},403);
      const target=String(body.target_matricula||"");const st=await getState(["admin_grants"]);let g=Array.isArray(st.admin_grants)?st.admin_grants.filter((x:any)=>String(typeof x==="string"?x:x?.matricula)!==target):[];
      const {error}=await db.from("app_state").upsert({key:"admin_grants",value:g,updated_at:new Date().toISOString()},{onConflict:"key"});if(error)throw error;return json({ok:true,grants:g});
    }
    if(body.action==="seed_store"){
      if(!(await adminOk(String(body.matricula||""),String(body.password||""))))return json({error:"Não autorizado."},403);
      const key=String(body.key||""); if(!/^users_\d{3}$/.test(key))return json({error:"Chave inválida."},400);
      const {error}=await db.from("app_state").upsert({key,value:body.value,updated_at:new Date().toISOString()},{onConflict:"key"});
      if(error)throw error; return json({ok:true,key});
    }
    return json({error:"Ação inválida."},400);
  }catch(e){console.error(e);return json({error:e?.message||String(e)},500);}
});
