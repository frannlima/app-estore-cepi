import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const ORIGIN_HEADERS = {
  "Access-Control-Allow-Origin": "https://frannlima.github.io",
  "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8"
};
const reply=(obj:unknown,status=200)=>new Response(JSON.stringify(obj),{status,headers:ORIGIN_HEADERS});
const iso=(v:unknown)=>/^\d{4}-\d{2}-\d{2}$/.test(String(v||""))&&!Number.isNaN(Date.parse(String(v)));
const finite=(v:unknown)=>typeof v==="number"&&Number.isFinite(v);
const dec=(v:unknown)=>finite(v)&&v>=0&&v<=1;
async function hash(v:string){
 const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(v));
 return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,"0")).join("");
}
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:ORIGIN_HEADERS});
 if(req.method!=="POST")return reply({error:"Método não permitido."},405);
 try{
  const body=await req.json();
  const matricula=String(body.matricula||"").trim();
  if(!/^\d{4,10}$/.test(matricula)||matricula==="0000000")return reply({error:"Identificação inválida."},403);
  const url=Deno.env.get("SUPABASE_URL"),key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if(!url||!key)return reply({error:"Configuração do serviço indisponível."},503);
  const db=createClient(url,key,{auth:{persistSession:false}});
  const [{data:user,error:ue},{data:conf,error:ce}]=await Promise.all([
   db.from("collaborators").select("matricula,cargo,profile_type,situacao").eq("matricula",matricula).maybeSingle(),
   db.from("app_state").select("value").eq("key","config").maybeSingle()
  ]);
  if(ue||ce)throw ue||ce;
  const config=conf?.value||{},main=matricula===String(config.admin_matricula||"");
  const role=String(user?.cargo||"")+" "+String(user?.profile_type||"");
  const lead=/supervisor|gerente|coordenad|líder|lider|diretor|admin|gestor/i.test(role);
  if(!main&&(!user||!lead||/desligad/i.test(String(user.situacao||""))))return reply({error:"Disponível somente para a liderança."},403);
  if(body.action==="get"){
   const [{data:bench,error:be},{data:daily,error:de},{data:official,error:oe},{data:meta,error:me},{data:weekly,error:we},{data:dailyRegions,error:re}]=await Promise.all([
    db.from("estore_executive_benchmark").select("period,start_date,end_date,company_captured,company_approved,company_orders,company_share,regional_captured,regional_orders,regional_share,updated_at").order("end_date",{ascending:false}).limit(120),
    db.from("daily_updates").select("result_date,management,management_mode,imported_at").order("result_date",{ascending:false}).limit(42),
    db.from("app_state").select("value").eq("key","supervisor_share_official").maybeSingle(),
    db.from("app_state").select("value").eq("key","meta_schedule").maybeSingle(),
    db.from("estore_regional_weekly_history").select("week_start,week_end,week_number,regional,share,captured,orders").order("week_start",{ascending:false}).limit(210),
    db.from("app_state").select("key,value").like("key","regional_daily_shares_%").order("key",{ascending:false}).limit(60)
   ]);
   if(be||de||oe||me||we||re)throw be||de||oe||me||we||re;
   const reg=new Set(["073","084","108","113","138","142","146","175","177","222","238","258","262","314","318","344","350","552"]);
   const goalsByDay=meta?.value||{};
   const curve=(daily||[]).map((row:any)=>{
    const raw=Array.isArray(row.management)?row.management:[];
    const dailyGoals=goalsByDay[String(row.result_date)]||{};
    const stores=raw.filter((x:any)=>reg.has(String(x.st||"").padStart(3,"0"))).map((x:any)=>{
     const st=String(x.st||"").padStart(3,"0");
     // Meta eStore de cada loja/data é a meta oficial armazenada no calendário;
     // nunca inferir a meta por atingimento ou por um dia vizinho.
     const planned=dailyGoals[st]?.metaEstore;
     const target=planned!=null&&finite(Number(planned))&&Number(planned)>=0?Number(planned):null;
     return {st,c:Number(x.c)||0,o:Number(x.o)||0,target,
      share:finite(Number(x.share))?Number(x.share):null,
      attainment:finite(Number(x.meta1))?Number(x.meta1):null};
    });
    return {date:String(row.result_date),stores,coverage:stores.length,imported_at:row.imported_at};
   }).sort((a:any,b:any)=>a.date.localeCompare(b.date));
   const m=official?.value?.month||{},months=Object.entries(m).filter(([ym]:[string,unknown])=>/^\d{4}-\d{2}$/.test(ym)).map(([ym,x]:[string,any])=>({
    month:ym,through:String(x?.through||""),stores:Object.fromEntries(Object.entries(x?.stores||{}).filter(([st,v]:[string,any])=>reg.has(st)&&v!=null&&Number.isFinite(Number(v))).map(([st,v]:[string,any])=>[st,Number(v)]))
   }));
   return reply({ok:true,benchmarks:bench||[],daily:curve,official_months:months,competitive_weeks:weekly||[],competitive_periods:{day:(dailyRegions||[]).flatMap((entry:any)=>Array.isArray(entry.value)?entry.value:[])}});
  }
  if(body.action==="save"){
   // Nunca confiar apenas na matrícula: o principal deve autenticar com a senha administrativa.
   if(!main||!String(body.password||"")||await hash(String(body.password))!==String(config.admin_hash||""))
    return reply({error:"Somente o administrador principal, com senha válida, pode publicar o benchmark."},403);
   const row=body.record||{},period=String(row.period||"");
   if(!["day","week","month"].includes(period)||!iso(row.start_date)||!iso(row.end_date)||
    String(row.end_date)<String(row.start_date)||
    (period==="day"&&row.start_date!==row.end_date)||
    (period==="month"&&String(row.start_date).slice(0,7)!==String(row.end_date).slice(0,7))||
    !finite(row.company_captured)||row.company_captured<0||!dec(row.company_share)||row.company_share>.05||
    (row.company_orders!=null&&(!Number.isInteger(row.company_orders)||row.company_orders<0))||
    (row.company_approved!=null&&(!finite(row.company_approved)||row.company_approved<0))||
    (row.regional_captured!=null&&(!finite(row.regional_captured)||row.regional_captured<0))||
    (row.regional_orders!=null&&(!Number.isInteger(row.regional_orders)||row.regional_orders<0))||
    (row.regional_share!=null&&!dec(row.regional_share))||
    (row.regional_captured!=null&&row.regional_captured>row.company_captured))
     return reply({error:"Dados inválidos. Confira intervalo, share oficial e valores numéricos."},400);
   const saved={
    period,start_date:row.start_date,end_date:row.end_date,
    company_captured:row.company_captured,company_approved:row.company_approved??null,company_orders:row.company_orders??null,
    company_share:row.company_share,regional_captured:row.regional_captured??null,
    regional_orders:row.regional_orders??null,regional_share:row.regional_share??null,
    submitted_by:matricula,updated_at:new Date().toISOString()
   };
   const {error}=await db.from("estore_executive_benchmark").upsert(saved,{onConflict:"period,start_date,end_date"});
   if(error)throw error;
   return reply({ok:true,record:saved});
  }
  return reply({error:"Ação desconhecida."},400);
 }catch(e){console.error("estore-executive",e);return reply({error:"Não foi possível processar os dados do Painel Executivo."},500);}
});
