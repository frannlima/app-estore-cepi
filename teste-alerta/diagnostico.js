// Diagnóstico local e de entrega FCM. Nenhum token é transmitido ou armazenado aqui.
const localBtn=document.getElementById("testLocal");
const deliveryBtn=document.getElementById("checkDelivery");
const logEl=document.getElementById("pushLog");
const stamp=()=>new Date().toLocaleString("pt-BR",{hour12:false});
localBtn?.addEventListener("click",async()=>{
  if(!("Notification" in window)||Notification.permission!=="granted"){
    logEl.textContent="Notificações não autorizadas neste navegador. Permita o site nas configurações do Chrome.";return;
  }
  try{
    const reg=await navigator.serviceWorker.getRegistration("./");
    if(!reg?.active)throw new Error("Service Worker de teste não está ativo.");
    await reg.showNotification("🔔 TESTE LOCAL | eStore 108",{
      body:"Esta é uma notificação gerada no próprio Android, para verificar a exibição. Não é um envio remoto.",
      tag:"estore-cepi-diagnostico-local-"+Date.now(),
      icon:"../assets/app-icon-192.png",
      vibrate:[180,90,180],
    });
    logEl.textContent="Solicitação de exibição local aceita pelo Chrome às "+stamp()+". Confira a barra de notificações e o som. Isso NÃO confirma entrega remota.";
  }catch(e){logEl.textContent="Falha no teste local: "+String(e?.message||e);}
});
function getEvents(){
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open("estore-cepi-fcm-diagnostics",1);
    request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains("events"))request.result.createObjectStore("events",{keyPath:"id",autoIncrement:true});};
    request.onerror=()=>reject(request.error);
    request.onsuccess=()=>{
      const db=request.result;
      const tx=db.transaction("events","readonly");
      const result=[];
      tx.objectStore("events").openCursor(null,"prev").onsuccess=e=>{
        const cursor=e.target.result;
        if(cursor && result.length<8){result.push(cursor.value);cursor.continue();}
        else{db.close();resolve(result);}
      };
      tx.onerror=()=>{db.close();reject(tx.error);};
    };
  });
}
deliveryBtn?.addEventListener("click",async()=>{
  try{
    const r=await navigator.serviceWorker.getRegistration("./");
    if(r)await r.update();
    const events=await getEvents();
    logEl.textContent="Verificado às "+stamp()+"\nService Worker: "+(r?.active?.state||"ausente")+"\n"+
      (events.length?events.map(e=>new Date(e.at).toLocaleString("pt-BR")+" — "+e.kind).join("\n"):
        "Nenhum push registrado neste navegador desde a instalação do diagnóstico. Se um teste remoto já foi enviado, refaça um envio após atualizar a página e confira novamente.");
  }catch(e){logEl.textContent="Erro ao ler diagnóstico: "+String(e?.message||e);}
});
navigator.serviceWorker?.getRegistration("./").then(r=>r?.update()).catch(()=>{});
