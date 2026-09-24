const CACHE='estore-cepi-shell-v27';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon.svg','./app-v2.css','./app-v2.js'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).catch(()=>{}));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
  );
});

async function withV2Assets(res){
  if(!res||!res.ok) return res;
  const type=res.headers.get('content-type')||'';
  if(!type.includes('text/html')) return res;
  let html=await res.text();
  if(!html.includes('app-v2.css')) html=html.replace('</head>','<link rel="stylesheet" href="./app-v2.css?v=27"></head>');
  if(!html.includes('app-v2.js')) html=html.replace('</body>','<script src="./app-v2.js?v=27"></script></body>');
  const h=new Headers(res.headers);h.delete('content-length');
  return new Response(html,{status:res.status,statusText:res.statusText,headers:h});
}

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin) return;
  const isPage=req.mode==='navigate'||url.pathname.endsWith('/')||url.pathname.endsWith('/index.html');
  if(isPage){
    event.respondWith(fetch(req,{cache:'no-store'}).then(withV2Assets).catch(async()=>{
      const hit=await caches.match('./index.html');return hit?withV2Assets(hit):Response.error();
    }));
    return;
  }
  event.respondWith(fetch(req).then(res=>{
    if(res&&res.ok){const copy=res.clone();caches.open(CACHE).then(cache=>cache.put(req,copy)).catch(()=>{})}
    return res;
  }).catch(()=>caches.match(req)));
});