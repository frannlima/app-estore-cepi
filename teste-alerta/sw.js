importScripts("https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js");
firebase.initializeApp({"apiKey":"AIzaSyDMz5OGUlk81e7545iNpQWON_JWAIDeCE4","authDomain":"estore-cepi.firebaseapp.com","projectId":"estore-cepi","storageBucket":"estore-cepi.firebasestorage.app","messagingSenderId":"308440439164","appId":"1:308440439164:web:65b39d57384fb1805c6cf9","measurementId":"G-VS0JM2D1TC"});
const messaging=firebase.messaging();
messaging.onBackgroundMessage((payload)=>{
  if(payload.notification)return; // Firebase already displays notification payloads; avoid duplicates.
  const data=payload.data||{};
  self.registration.showNotification(data.title||"🔔 Alerta eStore CEPI",{body:data.body||"Há uma atualização pendente.",tag:data.tag||"estore-cepi-test",icon:"../assets/app-icon-192.png",data:{url:"../"}});
});
self.addEventListener("notificationclick",event=>{event.notification.close();event.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(cs=>cs.find(c=>c.url.includes("/app-estore-cepi/"))?.focus()||self.clients.openWindow(new URL("../",self.registration.scope).href)));});