const CACHE='estore-cepi-shell-v148';
const BUILD='v148';
const PRESENTATION_SCRIPT='./presentation-v103.js?build=v133';
const HOURLY_META_SCRIPT='./hourly-meta-v104.js?build=v104';
const TEAM_SCRIPT='./team-v112.js?build=v133';
const TEAM_STORE_SCRIPT='./team-store-v113.js?build=v133';
const COMMISSION_ELIGIBILITY_SCRIPT='./commission-eligibility-v114.js?build=v114';
const COMMISSION_BOPIS_SCRIPT='./commission-bopis-v146.js?build=v146';
const TEAM_COLLAPSE_SCRIPT='./team-collapse-v116.js?build=v116';
const TEAM_AREA_REGIONAL_SCRIPT='./team-area-regional-v117.js?build=v117';
const BOPIS_ANALYTICS_SCRIPT='./bopis-analytics-v117.js?build=v142';
const VOICE_SCRIPT='./voice-v123.js?build=v133';
const MEU_ACOMPANHAMENTO_BRIDGE='./bridge-meu-acompanhamento-v1.js?build=v148';
const SHELL=['./presentation-v103.js','./hourly-meta-v104.js','./team-v112.js','./team-store-v113.js','./commission-eligibility-v114.js','./commission-bopis-v146.js','./team-collapse-v116.js','./team-area-regional-v117.js','./bopis-analytics-v117.js','./voice-v123.js','./bridge-meu-acompanhamento-v1.js','./performance-v130.js','./performance-v130.css','./celebrations-v134.js','./celebrations-v134.css','./assets/campaign-popup-v86.svg','./assets/campaign-hero-v84.svg','./assets/riachuelo-logo-exact-v75.svg','./assets/riachuelo-logo-horizontal-oficial-v133.svg','./assets/riachuelo-logo-horizontal-oficial-white-v133.svg','./assets/campaign-share-v76.svg','./assets/campaign-share-v75.jpg','./october-volume-maximo.svg','./esquadrao-cliente-card.jpg','./esquadrao-cliente.webp','./','./index.html','./manifest.webmanifest','./icon-v136.svg','./desktop-v136.css','./icon.svg','./riachuelo-horizontal-oficial.png'];

function injectAppV104(html){
  if(!html) return html;
  html=html
    .replace(/\n?<script[^>]+src=["']\.\/presentation-v10[123]\.js[^"']*["'][^>]*><\/script>\n?/gi,'\n')
    .replace(/\n?<script[^>]+src=["']\.\/hourly-meta-v\d+\.js[^"']*["'][^>]*><\/script>\n?/gi,'\n')
    .replace(/\n?<script[^>]+src=["']\.\/team-v\d+\.js[^"']*["'][^>]*><\/script>\n?/gi,'\n')
    .replace(/\n?<script[^>]+src=["']\.\/team-store-v\d+\.js[^"']*["'][^>]*><\/script>\n?/gi,'\n')
    .replace(/\n?<script[^>]+src=["']\.\/commission-eligibility-v\d+\.js[^"']*["'][^>]*><\/script>\n?/gi,'\n')
    .replace(/\n?<script[^>]+src=["']\.\/commission-bopis-v\d+\.js[^"']*["'][^>]*><\/script>\n?/gi,'\n')
    .replace(/\n?<script[^>]+src=["']\.\/team-collapse-v\d+\.js[^"']*["'][^>]*><\/script>\n?/gi,'\n')
    .replace(/\n?<script[^>]+src=["']\.\/team-area-regional-v\d+\.js[^"']*["'][^>]*><\/script>\n?/gi,'\n')
    .replace(/\n?<script[^>]+src=["']\.\/bopis-analytics-v\d+\.js[^"']*["'][^>]*><\/script>\n?/gi,'\n')
    .replace(/\n?<script[^>]+src=["']\.\/voice-v\d+\.js[^"']*["'][^>]*><\/script>\n?/gi,'\n')
    .replace(/src=["']\.\/app-v2\.js(?:\?[^"']*)?["']/gi,'src="./app-v2.js?build='+BUILD+'"');
  const tags='\n<script src="'+PRESENTATION_SCRIPT+'"></script>\n<script src="'+HOURLY_META_SCRIPT+'"></script>\n<script src="'+TEAM_SCRIPT+'"></script>\n<script src="'+TEAM_STORE_SCRIPT+'"></script>\n<script src="'+COMMISSION_ELIGIBILITY_SCRIPT+'"></script>\n<script src="'+COMMISSION_BOPIS_SCRIPT+'"></script>\n<script src="'+TEAM_COLLAPSE_SCRIPT+'"></script>\n<script src="'+TEAM_AREA_REGIONAL_SCRIPT+'"></script>\n<script src="'+BOPIS_ANALYTICS_SCRIPT+'"></script>\n<script src="'+VOICE_SCRIPT+'"></script>\n<script src="'+MEU_ACOMPANHAMENTO_BRIDGE+'"></script>\n';
  return html.replace(/<\/body>\s*<\/html>\s*$/i, tags+'</body></html>');
}
async function htmlResponseWithInjection(res){
  const text=await res.text();
  return new Response(injectAppV104(text),{status:res.status,statusText:res.statusText,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}});
}

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

  if(url.pathname.endsWith('/abrir.html')){
    event.respondWith(fetch(new Request(req,{cache:'no-store'})));
    return;
  }

  if(req.mode==='navigate'){
    const cachePromise=caches.open(CACHE);
    const networkPromise=fetch(new Request(req,{cache:'no-store'}))
      .then(async res=>{
        if(!res||!res.ok) return res;
        try{
          const cache=await cachePromise;
          await cache.put('./index.html',res.clone());
        }catch(e){}
        return res;
      })
      .catch(()=>null);

    // Atualiza silenciosamente em segundo plano, sem navegar/recarregar a página.
    event.waitUntil(networkPromise.then(()=>{}));

    event.respondWith(
      cachePromise.then(async cache=>{
        const cached=await cache.match('./index.html');
        if(cached) return htmlResponseWithInjection(cached.clone());
        const res=await networkPromise;
        if(res) return htmlResponseWithInjection(res.clone());
        return new Response('App temporariamente indisponível offline.',{
          status:503,
          headers:{'content-type':'text/plain; charset=utf-8'}
        });
      })
    );
    return;
  }

  // Assets locais: resposta imediata do cache + atualização silenciosa.
  const cachePromise=caches.open(CACHE);
  const networkPromise=fetch(req)
    .then(async res=>{
      if(res&&res.ok){
        try{
          const cache=await cachePromise;
          await cache.put(req,res.clone());
        }catch(e){}
      }
      return res;
    })
    .catch(()=>null);

  event.waitUntil(networkPromise.then(()=>{}));
  event.respondWith(
    cachePromise.then(async cache=>{
      const cached=await cache.match(req,{ignoreSearch:true});
      if(cached) return cached;
      const res=await networkPromise;
      return res||Response.error();
    })
  );
});
