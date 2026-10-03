(function(){
  'use strict';
  const BUILD='v104';
  const EXCLUDED_STORES=new Set(['109']);
  const STORE_ORDER=['073','084','108','113','138','142','146','175','177','222','238','258','262','314','318','344','350','552'];
  let LAST_MESSAGE='';

  const money=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(v)||0);
  const todayISO=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Fortaleza'});
  const todayBR=()=>todayISO().split('-').reverse().join('/');
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function ticketFor(st,row){
    try{
      if(typeof historicalTicketV97==='function'){
        const t=Number(historicalTicketV97(st));
        if(Number.isFinite(t)&&t>0)return t;
      }
    }catch(e){}
    const meta=Number(row?.metaValue)||0,target=Number(row?.orderTarget)||0;
    if(meta>0&&target>0)return meta/target;
    return 188;
  }

  function orderTarget(row){
    const meta=Number(row?.metaValue)||0;
    if(meta<=0)return 0;
    const t=ticketFor(String(row.st),row);
    return Math.max(1,Math.ceil(meta/t));
  }

  function eligibleRows(j){
    return (j?.stores||[])
      .filter(r=>!EXCLUDED_STORES.has(String(r.st)) && Number(r.metaValue||0)>0)
      .map(r=>({...r,orderTargetV104:orderTarget(r)}))
      .sort((a,b)=>STORE_ORDER.indexOf(String(a.st))-STORE_ORDER.indexOf(String(b.st)));
  }

  function buildMessage(rows){
    const regionalMeta=rows.reduce((s,r)=>s+Number(r.metaValue||0),0);
    const challenge=rows.reduce((s,r)=>s+Number(r.orderTargetV104||0),0);
    const lines=[
      '📲 *META eSTORE | HOJE – '+todayBR()+'* 🚀',
      '',
      '🎯 *Meta regional:* '+money(regionalMeta),
      '🛍️ *Desafio do dia:* *'+challenge+' vendas*',
      '',
      '*Distribuição por loja:*',
      ...rows.map(r=>'- '+String(r.st)+' ➜ *'+Number(r.orderTargetV104||0)+'*'),
      '',
      '💚 *eStore CE+PI*'
    ];
    return lines.join('\n');
  }

  function ensureStyles(){
    if(document.getElementById('hourMetaStyleV104'))return;
    const s=document.createElement('style');s.id='hourMetaStyleV104';s.textContent=`
      .hourMetaShareV104{margin-top:12px;display:grid;gap:8px}
      .hourMetaShareV104 .btn{width:100%}
      .hourMetaOverlayV104{position:fixed;inset:0;background:rgba(13,38,32,.56);z-index:99999;display:flex;align-items:flex-end;justify-content:center;padding:16px 12px max(86px,env(safe-area-inset-bottom));backdrop-filter:blur(3px)}
      .hourMetaModalV104{width:min(680px,100%);max-height:82vh;overflow:auto;background:#fff;border-radius:24px;padding:18px;box-shadow:0 18px 56px rgba(0,0,0,.25);color:#173F35}
      .hourMetaHeadV104{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}
      .hourMetaHeadV104 h3{margin:0;font-size:20px;line-height:1.15}.hourMetaHeadV104 p{margin:5px 0 0;color:#68736F;font-size:12px}
      .hourMetaCloseV104{border:0;background:#F2F1EC;color:#173F35;border-radius:999px;width:38px;height:38px;font-size:20px;font-weight:900}
      .hourMetaPreviewV104{white-space:pre-wrap;word-break:break-word;background:#F7F5EF;border:1px solid #E4E0D8;border-radius:16px;padding:15px;font:500 14px/1.52 system-ui,-apple-system,Segoe UI,Arial;color:#173F35;margin:0}
      .hourMetaActionsV104{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.hourMetaActionsV104 .btn:first-child{grid-column:1/-1}
      .hourMetaStatusV104{margin-top:9px;font-size:12px;color:#466964;font-weight:700;min-height:18px}
      @media(max-width:520px){.hourMetaActionsV104{grid-template-columns:1fr}.hourMetaActionsV104 .btn:first-child{grid-column:auto}.hourMetaModalV104{border-radius:22px 22px 16px 16px}}
    `;document.head.appendChild(s);
  }

  function closeModal(){document.getElementById('hourMetaOverlayV104')?.remove()}
  window.hourOrderShareCloseV104=closeModal;

  function showModal(message){
    closeModal();ensureStyles();LAST_MESSAGE=message;
    const overlay=document.createElement('div');overlay.id='hourMetaOverlayV104';overlay.className='hourMetaOverlayV104';
    overlay.innerHTML='<div class="hourMetaModalV104" role="dialog" aria-modal="true" aria-label="Compartilhar meta de pedidos">'+
      '<div class="hourMetaHeadV104"><div><h3>Meta de Pedidos • Hoje</h3><p>Mensagem pronta para WhatsApp.</p></div><button class="hourMetaCloseV104" onclick="hourOrderShareCloseV104()" aria-label="Fechar">×</button></div>'+
      '<pre class="hourMetaPreviewV104">'+esc(message)+'</pre>'+
      '<div class="hourMetaActionsV104"><button class="btn" onclick="hourOrderWhatsAppV104()">📲 Enviar pelo WhatsApp</button><button class="btn ghost" onclick="hourOrderCopyV104()">📋 Copiar texto</button><button class="btn ghost" onclick="hourOrderShareCloseV104()">Voltar</button></div>'+
      '<div id="hourMetaStatusV104" class="hourMetaStatusV104"></div></div>';
    overlay.addEventListener('click',e=>{if(e.target===overlay)closeModal()});
    document.body.appendChild(overlay);
  }

  window.hourOrderShareOpenV104=async function(){
    try{
      const button=document.getElementById('hourOrderShareBtnV104');
      const old=button?.textContent;if(button){button.disabled=true;button.textContent='Preparando mensagem...'}
      const args={action:'hourly_get',result_date:todayISO()};
      try{if(typeof U!=='undefined'&&U?.u?.id)args.matricula=U.u.id}catch(e){}
      if(typeof api!=='function')throw new Error('Conexão do Hora a Hora indisponível.');
      const j=await api(args),rows=eligibleRows(j);
      if(!rows.length)throw new Error('Não há metas de pedidos disponíveis para hoje.');
      showModal(buildMessage(rows));
      if(button){button.disabled=false;button.textContent=old||'📲 Compartilhar meta de pedidos'}
    }catch(e){
      const button=document.getElementById('hourOrderShareBtnV104');if(button){button.disabled=false;button.textContent='📲 Compartilhar meta de pedidos'}
      alert(e?.message||'Não foi possível montar a mensagem de hoje.');
    }
  };

  window.hourOrderCopyV104=async function(){
    if(!LAST_MESSAGE)return;
    const status=document.getElementById('hourMetaStatusV104');
    try{
      if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(LAST_MESSAGE);
      else{const ta=document.createElement('textarea');ta.value=LAST_MESSAGE;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove()}
      if(status)status.textContent='Texto copiado. Pronto para colar no WhatsApp.';
    }catch(e){if(status)status.textContent='Não foi possível copiar automaticamente.'}
  };

  window.hourOrderWhatsAppV104=function(){
    if(!LAST_MESSAGE)return;
    const url='https://wa.me/?text='+encodeURIComponent(LAST_MESSAGE);
    const w=window.open(url,'_blank','noopener,noreferrer');
    if(!w)window.location.href=url;
  };

  function injectButton(){
    if(document.getElementById('hourOrderShareBtnV104'))return;
    const titles=[...document.querySelectorAll('.title')];
    const title=titles.find(el=>/Hora a Hora\s*[•·-]\s*Atualiza/i.test(el.textContent||''));
    if(!title)return;
    const card=title.closest('.card');if(!card)return;
    const host=document.createElement('div');host.className='hourMetaShareV104';
    host.innerHTML='<button id="hourOrderShareBtnV104" class="btn alt" onclick="hourOrderShareOpenV104()">📲 Compartilhar meta de pedidos</button>'+
      '<div class="muted" style="font-size:11px;text-align:center">Gera a meta diária por filial em texto, pronta para WhatsApp.</div>';
    card.appendChild(host);
  }

  ensureStyles();injectButton();
  const observer=new MutationObserver(()=>injectButton());
  observer.observe(document.documentElement,{childList:true,subtree:true});
  console.info('[eStore] Meta de pedidos WhatsApp '+BUILD+' ativa.');
})();