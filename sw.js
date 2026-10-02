const CACHE='estore-cepi-shell-v88';
const BUILD='v88';
const SHELL=['./assets/campaign-popup-v86.svg','./assets/campaign-hero-v84.svg','./assets/riachuelo-logo-exact-v75.svg','./assets/campaign-share-v76.svg','./assets/campaign-share-v75.jpg','./october-volume-maximo.svg','./esquadrao-cliente-card.jpg','./esquadrao-cliente.webp','./','./index.html','./manifest.webmanifest','./icon.svg','./riachuelo-horizontal-oficial.png'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache=>cache.addAll(SHELL.map(u=>new Request(u,{cache:'reload'})))).catch(()=>{})
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
      .then(()=>self.clients.matchAll({type:'window',includeUncontrolled:true}))
      .then(clients=>Promise.all(clients.map(client=>{
        try{
          const u=new URL(client.url);
          if(u.origin!==self.location.origin)return Promise.resolve();
          u.searchParams.set('build',BUILD);
          return client.navigate(u.toString()).catch(()=>{});
        }catch(e){return Promise.resolve();}
      })))
  );
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin) return;

  if(req.mode==='navigate'){
    event.respondWith(
      fetch(new Request(req,{cache:'no-store'}))
        .then(res=>{
          if(res&&res.ok){
            const copy=res.clone();
            caches.open(CACHE).then(cache=>cache.put('./index.html',copy)).catch(()=>{});
          }
          return res;
        })
        .catch(()=>caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    fetch(req)
      .then(res=>{
        if(res&&res.ok){
          const copy=res.clone();
          caches.open(CACHE).then(cache=>cache.put(req,copy)).catch(()=>{});
        }
        return res;
      })
      .catch(()=>caches.match(req))
  );
});
