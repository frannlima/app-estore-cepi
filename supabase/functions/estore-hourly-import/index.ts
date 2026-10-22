import {createClient} from "npm:@supabase/supabase-js@2.57.4";
const ORIGIN="https://frannlima.github.io";
const CORS={"Access-Control-Allow-Origin":ORIGIN,"Access-Control-Allow-Methods":"POST,OPTIONS","Access-Control-Allow-Headers":"content-type,authorization,apikey,x-client-info","Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","Vary":"Origin"};
const db=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false}});
const STORES=["073","084","108","113","138","142","146","175","177","222","238","258","262","314","318","344","350","552"];
const reply=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:CORS});
const digest=async(s:string)=>Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)))).map(n=>n.toString(16).padStart(2,"0")).join("");
async function handle(request:Request){
 if(request.method==="OPTIONS")return new Response(null,{status:204,headers:CORS});
 if(request.method!=="POST")return reply({error:"Método não permitido"},405);
 const origin=request.headers.get("origin");
 if(origin&&origin!==ORIGIN)return reply({error:"Origem não autorizada"},403);
 let body:any;
 try {
  const payload=await request.text();
  if(payload.length>30000)return reply({error:"Solicitação excede o limite"},413);
  body=JSON.parse(payload);
 }catch(_){return reply({error:"Dados inválidos"},400)}
 if(!/^\d{4,12}$/.test(String(body?.matricula||""))||typeof body.password!=="string"||body.password.length>256||!body.password)
  return reply({error:"Informe a matrícula e a senha administrativa"},401);
 try{
  const {data:config,error:ce}=await db.from("app_state").select("value").eq("key","config").single();
  if(ce)throw ce;
  const cfg=config?.value||{};
  if(String(body.matricula)!==String(cfg.admin_matricula)||!cfg.admin_hash||(await digest(body.password))!==String(cfg.admin_hash))
   return reply({error:"Acesso administrativo não autorizado"},403);
  if(body.action==="dashboard"){
   const viewDate=/^\d{4}-\d{2}-\d{2}$/.test(String(body.date||""))?String(body.date):new Date().toISOString().slice(0,10);
   const [pe,cr,review]=await Promise.all([
    db.from("collaborators").select("matricula,nome,store_code,cargo,situacao,eligible_supervisor,profile_type").in("store_code",STORES).eq("eligible_supervisor",true),
    db.from("estore_alert_wa_contact_review").select("store_code_original,store_code_confirmed,matricula_confirmed,phone_suggested_e164,verification_status").eq("import_batch","supervisores_20261020_texto"),
    db.from("estore_alert_center_partials").select("reviewed_rows,check_time,result_date").eq("result_date",viewDate).order("created_at",{ascending:false}).limit(1)
   ]);
   if(pe.error||cr.error||review.error)throw pe.error||cr.error||review.error;
   const people=(pe.data||[]).filter(p=>p.eligible_supervisor===true&&/supervisor/i.test(String(p.cargo||""))&&!/gerente/i.test(String(p.cargo||""))&&!/afast|deslig|inativ/i.test(String(p.situacao||"")));
   const contacts=STORES.map(st=>({
    st,people:people.filter(p=>p.store_code===st).map(p=>{
     const c=(cr.data||[]).find(c=>c.matricula_confirmed===p.matricula&&c.store_code_confirmed===st&&c.store_code_original===st&&c.verification_status==="confirmado");
     return {name:String(p.nome||""),role:String(p.cargo||""),situation:String(p.situacao||""),onLeave:/f[eé]rias/i.test(String(p.situacao||"")),phone:c&&/^\+55[1-9]\d9\d{8}$/.test(String(c.phone_suggested_e164))?String(c.phone_suggested_e164):null};
    }).sort((a,b)=>a.name.localeCompare(b.name,"pt-BR"))
   }));
   const groupStatus=Object.fromEntries(((review.data||[])[0]?.reviewed_rows||[]).filter((x:any)=>STORES.includes(String(x.st))).map((x:any)=>[String(x.st),String(x.status||'unknown')]));
   return reply({ok:true,contacts,groupStatus,groupReferenceTime:(review.data||[])[0]?.check_time||null});
  }
  if(body.action==="commit"){
   const date=String(body.date||""),clock=String(body.time||""),hash=String(body.source_hash||"");
   const items=body.rows;
   if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(clock)||!/^[0-9a-f]{64}$/.test(hash)||
    !Array.isArray(items)||!items.length||items.length>18||body.reviewed!==true)
    return reply({error:"Revise a data, hora, lojas e valores antes de importar"},400);
   const seen=new Set();
   const clean:any[]=[];
   for(const x of items){
    const st=String(x.st||"");
    if(!STORES.includes(st)||seen.has(st)||!["incremental","cumulative"].includes(x.mode))
     return reply({error:"Filial ou tipo de lançamento inválido"},400);
    seen.add(st);
    const value=Number(x.captured),orders=Number(x.orders);
    if(!Number.isFinite(value)||value<=0||value>1000000||!Number.isSafeInteger(orders)||orders<0||orders>10000)
     return reply({error:"Confira valor e pedidos da filial "+st},400);
    clean.push({st,mode:x.mode,captured:value.toFixed(2),orders:String(orders)});
   }
   const reference=new Date(date+"T"+clock+":00-03:00");
   if(Number.isNaN(reference.getTime())||reference.getTime()>Date.now()+5*60000)return reply({error:"Horário inválido ou futuro"},400);
   const {data,error}=await db.rpc("estore_hourly_import_reviewed",
     {p_actor:String(body.matricula),p_date:date,p_reference:reference.toISOString(),p_hash:hash,p_rows:clean});
   if(error)throw error;
   return reply(data||{ok:true,rows:[]});
  }
  return reply({error:"Ação indisponível"},400);
 }catch(error){
   console.error("Hourly reviewed import:",String(error));
   return reply({error:"Não foi possível executar a importação. Confira os dados e tente novamente."},503);
 }
}
Deno.serve(handle);
