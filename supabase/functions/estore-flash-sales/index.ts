import {createClient} from "npm:@supabase/supabase-js@2.57.4";

// Integração somente de leitura da última coleta autenticada do Flash.
// O cliente não envia valores de venda; o servidor consulta a origem protegida.
const FLASH="https://vvgejviwvtnlahbyopah.supabase.co/functions/v1/flash-sync";
const CORS={"Access-Control-Allow-Origin":"https://frannlima.github.io","Access-Control-Allow-Headers":"authorization,apikey,content-type","Access-Control-Allow-Methods":"POST,OPTIONS","Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"};
const STORES=new Set(["073","084","108","113","138","142","146","175","177","222","238","258","262","314","318","344","350","552"]);
const reply=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:CORS});
const today=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"America/Fortaleza",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
async function flash(token:string,matricula:string,action:string,date?:string){
 const response=await fetch(FLASH,{method:"POST",headers:{"Authorization":"Bearer "+token,"Content-Type":"application/json"},body:JSON.stringify({action,matricula,...(date?{business_date:date}:{})}),signal:AbortSignal.timeout(13000)});
 const body=await response.json();
 if(!response.ok)throw new Error("Falha de autenticação ou leitura do Flash: "+response.status);
 return body.data;
}
Deno.serve(async request=>{
 if(request.method==="OPTIONS")return new Response(null,{status:204,headers:CORS});
 if(request.method!=="POST")return reply({error:"Método não permitido"},405);
 const origin=request.headers.get("origin");
 if(origin&&origin!=="https://frannlima.github.io")return reply({error:"Origem não permitida"},403);
 const token=request.headers.get("Authorization")?.match(/^Bearer (.+)$/)?.[1];
 if(!token)return reply({error:"Sessão Flash autenticada necessária"},401);
 let args:any;
 try {const raw=await request.text();if(raw.length>2500)return reply({error:"Solicitação inválida"},400);args=JSON.parse(raw);}
 catch{return reply({error:"JSON inválido"},400);}
 if(args?.action!=="sync"||!/^[0-9]{4,12}$/.test(String(args?.matricula||"")))return reply({error:"Solicitação inválida"},400);
 try{
  const actor=await flash(token,String(args.matricula),"session");
  if(actor?.role!=="administrador")return reply({error:"Somente o administrador autenticado do Flash pode compartilhar a coleta regional"},403);
  const date=today();
  const latest=await flash(token,String(args.matricula),"latest",date);
  const packet=Array.isArray(latest)?latest[0]:null;
  if(!packet||packet.business_date!==date||!Array.isArray(packet.rows)||packet.rows.length!==18)
   return reply({error:"Não há coleta regional completa salva para hoje no Flash. Salve a coleta autenticada e tente novamente."},409);
  const when=Date.parse(String(packet.collected_at||"")),age=Date.now()-when;
  if(!Number.isFinite(when)||age< -60000||age>45*60000)
   return reply({error:"Coleta Flash desatualizada. Realize uma nova extração e salve."},409);
  const sourceRows:any[]=[];const seen=new Set();
  for(const r of packet.rows){
   const st=String(r.store||"");
   const total=Number(r.total),omni=Number(r.omni||0);
   if(!STORES.has(st)||seen.has(st)||!Number.isFinite(total)||total<0||total>1e9||!Number.isFinite(omni)||omni<0||omni>total)
    return reply({error:"Coleta Flash inconsistente."},422);
   seen.add(st);
   sourceRows.push({result_date:date,store_code:st,total_flash:total,omni,source_time:r.source_time||null,collected_at:packet.collected_at,synced_at:new Date().toISOString(),source:"Flash • Meu Acompanhamento"});
  }
  const url=Deno.env.get("SUPABASE_URL"),key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if(!url||!key)return reply({error:"Integração sem configuração de serviço"},503);
  const db=createClient(url,key,{auth:{persistSession:false}});
  const {data:old,error:readError}=await db.from("estore_flash_store_sales").select("store_code,collected_at").eq("result_date",date);
  if(readError)throw readError;
  const byStore=new Map((old||[]).map(r=>[r.store_code,Date.parse(r.collected_at)]));
  const fresh=sourceRows.filter(r=>!byStore.has(r.store_code)||Date.parse(r.collected_at)>Number(byStore.get(r.store_code)));
  if(fresh.length){
   const {error}=await db.from("estore_flash_store_sales").upsert(fresh,{onConflict:"result_date,store_code"});
   if(error)throw error;
  }
  return reply({ok:true,result_date:date,coverage:sourceRows.length,updated: fresh.length,flash_collected_at:packet.collected_at,source:"flash-authenticated"});
 }catch(e){
  console.error("Flash bridge:",String(e));
  return reply({error:"Não foi possível sincronizar a coleta Flash autenticada."},503);
 }
});