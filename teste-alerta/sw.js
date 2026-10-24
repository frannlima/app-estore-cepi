/* Diagnóstico FCM Web Push | não armazena token nem conteúdo da notificação */
const DB_NAME="estore-cepi-fcm-diagnostics";
function persist(kind){
  return new Promise(resolve=>{
    let done=false;const finish=()=>{if(!done){done=true;resolve();}};
    try{
      const open=indexedDB.open(DB_NAME,1);
      open.onupgradeneeded=()=>{const db=open.result;if(!db.objectStoreNames.contains("events"))db.createObjectStore("events",{keyPath:"id",autoIncrement:true});};
      open.onerror=finish;
      open.onsuccess=()=>{
        const db=open.result;
        const tx=db.transaction("events","readwrite");
        tx.objectStore("events").add({kind,at:new Date().toISOString()});
        tx.oncomplete=()=>{db.close();finish();};
        tx.onerror=()=>{db.close();finish();};
      };
    }catch(_){finish();}
  });
}
// Loga o evento bruto sem interceptar nem exibir notificações adicionais.
self.addEventListener("push",event=>{event.waitUntil(persist("push-recebido-no-service-worker"));});
// Registra click antes de importar o Firebase (evita sobrescrita do handler).
self.addEventListener("notificationclick",event=>{
  event.notification.close();
  event.waitUntil(Promise.all([
    persist("notificacao-clicada"),
    self.clients.matchAll({type:"window",includeUncontrolled:true}).then(clients=>{
      const match=clients.find(client=>client.url.startsWith(new URL("../",self.registration.scope).href));
      return match?.focus()||self.clients.openWindow(new URL("../",self.registration.scope).href);
    })
  ]));
});
importScripts("https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js");
firebase.initializeApp({"apiKey":"AIzaSyDMz5OGUlk81e7545iNpQWON_JWAIDeCE4","authDomain":"estore-cepi.firebaseapp.com","projectId":"estore-cepi","storageBucket":"estore-cepi.firebasestorage.app","messagingSenderId":"308440439164","appId":"1:308440439164:web:65b39d57384fb1805c6cf9","measurementId":"G-VS0JM2D1TC"});
const messaging=firebase.messaging();
messaging.onBackgroundMessage(payload=>{
  const received=persist("fcm-tratado-em-segundo-plano");
  if(payload.notification){return received;} // SDK exibe payload com notification automaticamente.
  const data=payload.data||{};
  return Promise.all([received,self.registration.showNotification(data.title||"🔔 Alerta eStore CEPI",{
    body:data.body||"Há uma atualização pendente.",
    tag:data.tag||"estore-cepi-test",
    icon:"../assets/app-icon-192.png",
    data:{url:"../"}
  })]);
});
