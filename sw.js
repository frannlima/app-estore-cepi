const CACHE='estore-cepi-shell-v201-hourly-live';
const BUILD='v201-hourly-live';
const PRESENTATION_SCRIPT='./presentation-v103.js?build=v155';
const HOURLY_META_SCRIPT='./hourly-meta-v104.js?build=v104';
const TEAM_SCRIPT='./team-v112.js?build=v155';
const TEAM_STORE_SCRIPT='./team-store-v113.js?build=v155';
const COMMISSION_ELIGIBILITY_SCRIPT='./commission-eligibility-v114.js?build=v114';
const COMMISSION_BOPIS_SCRIPT='./commission-bopis-v146.js?build=v146';
const TEAM_COLLAPSE_SCRIPT='./team-collapse-v116.js?build=v116';
const TEAM_AREA_REGIONAL_SCRIPT='./team-area-regional-v117.js?build=v117';
const BOPIS_ANALYTICS_SCRIPT='./bopis-analytics-v117.js?build=v155';
const VOICE_SCRIPT='./voice-v123.js?build=v133';
const MEU_ACOMPANHAMENTO_BRIDGE='./bridge-meu-acompanhamento-v1.js?build=v152';
const CAMPAIGN_PARTIAL_SCRIPT='./campaign-partial-v158.js?build=v173';
const CAMPAIGN_NATIVE_SCRIPT='./campaign-integration-v168.js?build=v168';
const SHELL=['./executive-panel-v1.js','./hourly-live-v200.js','./hourly-live-v200.css','./executive-panel-v1.css','./assets/ria-marca-executivo.svg','./assets/ria-vertical-anexo-v188.svg','./assets/ria-vertical-header-light-v195.svg','./alert-batch.mjs','./alert-center.js','./alert-card-share.mjs','./alert-center-core.mjs','./alert-center.css','./coupon-home-carousel-v174.js','./coupon-home-carousel-v174.css','./cards-visible-preview-v1.css','./brand-sharecards-2025.js','./brand-riachuelo-2025.css','./app-v2.css','./campaign-partial-v158.js','./campaign-integration-v168.js','./parcial.html','./ranking-3a-parcial-2026.html','./presentation-v103.js','./hourly-meta-v104.js','./team-v112.js','./team-store-v113.js','./commission-eligibility-v114.js','./commission-bopis-v146.js','./team-collapse-v116.js','./team-area-regional-v117.js','./bopis-analytics-v117.js','./voice-v123.js','./bridge-meu-acompanhamento-v1.js','./performance-v130.js','./performance-v130.css','./celebrations-v134.js','./celebrations-v134.css','./assets/campaign-popup-v86.svg','./assets/campaign-hero-v84.svg','./assets/riachuelo-logo-exact-v75.svg','./assets/riachuelo-logo-horizontal-oficial-v133.svg','./assets/riachuelo-logo-horizontal-oficial-white-v133.svg','./assets/campaign-share-v76.svg','./assets/campaign-share-v75.jpg','./october-volume-maximo.svg','./esquadrao-cliente-card.jpg','./esquadrao-cliente.webp','./','./index.html','./manifest.webmanifest','./icon-v136.svg','./desktop-v136.css','./icon.svg','./riachuelo-horizontal-oficial.png'];

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
  // Remove os scripts da página original para injetar a versão uma única vez, por último.
  const marker='<!-- CAMPANHA-ESTORE-TOP15-NATIVE-V168 -->';
  const start=html.indexOf(marker);
  if(start>=0){
    const close1=html.indexOf('</script>',start);
    const close2=close1>=0?html.indexOf('</script>',close1+9):-1;
    if(close2>=0)html=html.slice(0,start)+html.slice(close2+9);
  }
  const tags='\n<script src="'+PRESENTATION_SCRIPT+'"></script>\n<script src="'+HOURLY_META_SCRIPT+'"></script>\n<script src="'+TEAM_SCRIPT+'"></script>\n<script src="'+TEAM_STORE_SCRIPT+'"></script>\n<script src="'+COMMISSION_ELIGIBILITY_SCRIPT+'"></script>\n<script src="'+COMMISSION_BOPIS_SCRIPT+'"></script>\n<script src="'+TEAM_COLLAPSE_SCRIPT+'"></script>\n<script src="'+TEAM_AREA_REGIONAL_SCRIPT+'"></script>\n<script src="'+BOPIS_ANALYTICS_SCRIPT+'"></script>\n<script src="'+VOICE_SCRIPT+'"></script>\n<script src="'+MEU_ACOMPANHAMENTO_BRIDGE+'"></script>\n<script src="'+CAMPAIGN_PARTIAL_SCRIPT+'"></script>\n<script src="'+CAMPAIGN_NATIVE_SCRIPT+'"></script>\n';
  html=html.replace('</head>','<link rel="stylesheet" href="./brand-riachuelo-2025.css?build=v168"><link rel="stylesheet" href="./cards-visible-preview-v1.css?build=v168"><link rel="stylesheet" href="./coupon-home-carousel-v174.css?build=v174"></head>');
  return html.replace(/<\/body>\s*<\/html>\s*$/i, tags+'<script src="./coupon-home-carousel-v174.js?build=v174"></script>'+'</body></html>');
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

  if(url.pathname.endsWith('/parcial.html')){
    // Painel autônomo: preservar o HTML completo, sem scripts legados injetados.
    event.respondWith(fetch(new Request(req,{cache:'no-store'})).catch(async()=>{
      const cache=await caches.open(CACHE);return (await cache.match(req))||Response.error();
    }));
    return;
  }

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

    // A navegação prioriza a versão atual; o cache só entra quando offline.
    event.respondWith(
      (async()=>{
        const res=await networkPromise;
        if(res&&res.ok)return htmlResponseWithInjection(res.clone());
        const cache=await cachePromise,cached=await cache.match('./index.html');
        if(cached)return htmlResponseWithInjection(cached.clone());
        return new Response('App temporariamente indisponível offline.',{
          status:503,
          headers:{'content-type':'text/plain; charset=utf-8'}
        });
      })()
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
    (async()=>{
      const critical=url.pathname.endsWith('.js')||url.pathname.endsWith('.css');
      if(critical){
        // JS/CSS: garantir atualização após deploy e manter fallback offline.
        const live=await networkPromise;
        if(live&&live.ok)return live;
      }
      const cache=await cachePromise;
      const cached=await cache.match(req,{ignoreSearch:true});
      if(cached)return cached;
      return (await networkPromise)||Response.error();
    })()
  );
});
