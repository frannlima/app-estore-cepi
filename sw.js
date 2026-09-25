const CACHE='estore-cepi-shell-v33';
const SHELL=['./esquadrao-cliente-card.jpg','./esquadrao-cliente.webp','./','./index.html','./manifest.webmanifest','./icon.svg','./riachuelo-horizontal-oficial.png'];

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
