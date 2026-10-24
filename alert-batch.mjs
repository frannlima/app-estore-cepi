// Lote assistido: gerar um PNG por filial; exige confirmação manual de cada envio no WhatsApp.
import {createAlertImage,shareAlertImage} from './alert-card-share.mjs';
const selected=new Map();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const eligibleRow=r=>!!r?.partial_id&&r.active===true&&r.eligible===true&&Number(r.meta)>0&&Number(r.orders)>0&&['missing','zero','sale','unknown'].includes(r.group_status);
const eligibleContact=(c,r)=>!!c?.person&&c.verification_status==='confirmado'&&c.store_code_original===r.st&&c.store_code_confirmed===r.st&&c.matricula_confirmed===c.person.matricula&&c.person.store_code===r.st&&c.person.eligible_supervisor===true&&/supervisor/i.test(c.person.cargo||'')&&!/gerente/i.test(c.person.cargo||'')&&c.person.situacao==='Atividade Normal'&&/^\+55[1-9]\d9\d{8}$/.test(c.phone_suggested_e164||'');
const targets=model=>(model?.rows||[]).filter(eligibleRow).sort((a,b)=>(a.group_status==='sale')-(b.group_status==='sale')||a.st.localeCompare(b.st)).map(row=>({row,contacts:(model?.contacts||[]).filter(c=>eligibleContact(c,row))}));
export function batchMarkup(model){
 const rows=targets(model),enabled=rows.filter(t=>t.contacts.length).length;
 let blocks='';
 for(const t of rows){
  const options=t.contacts.map(c=>'<option value="'+c.id+'" '+(String(selected.get(t.row.st))===String(c.id)?'selected':'')+'>'+esc(c.person?.nome||c.name_original)+'</option>').join('');
  const choice=t.contacts.length?'<select class="field" aria-label="Supervisor da filial '+t.row.st+'" data-ac-batch-store="'+t.row.st+'"><option value="">Selecionar supervisor</option>'+options+'</select>':'<small class="acPending">Contato sem validação, fora de atividade ou sem vínculo confirmado.</small>';
  const situation=t.row.closing?'Fechamento 21h: confirmar captação eStore do dia':t.row.condition==='stale'?'Venda registrada; parcial da loja há mais de 60 min':t.row.condition==='group_sale'?'Venda no consolidado; confirmar parcial sem duplicar':t.row.condition==='zero'?'Sem venda registrada: confirmar ou atualizar':'Loja sem lançamento: alerta prioritário';
  blocks+='<div class="acBatchRow"><span><b>Filial '+esc(t.row.st)+'</b><small>'+situation+'</small></span>'+choice+'</div>';
 }
 return '<section class="acBatch"><div class="acBatchTitle"><div><strong>🚨 Alertas das lojas priorizadas</strong><p>Loja sem registro: prioridade. Com venda contabilizada: alerta somente após 60 minutos sem nova atualização confirmada. Selecione um supervisor por filial.</p></div><b class="acBatchCount">'+rows.length+' lojas</b></div>'+
 '<div class="acBatchStats"><span>🔴 '+rows.length+' priorizadas</span><span>✅ '+enabled+' com contato apto</span><span>⚠️ '+(rows.length-enabled)+' aguardam validação</span></div>'+
 (model?.needs_reconfirm?'<p class="acBatchFreshNote"><b>Referência: '+esc(model.reference_time||'?')+'.</b> Existe um registro posterior ('+esc(model.latest_record_time||'?')+') sem classificação. Revise o registro mais recente ou confirme o uso da parcial classificada.</p><label class="acConfirm"><input type="checkbox" id="acBatchReferenceConfirm"> Autorizo usar a parcial classificada de '+esc(model.reference_time||'?')+' como referência deste lote.</label>':'<p class="acBatchFreshNote">Referência da parcial validada: <b>'+esc(model?.reference_time||'não informada')+'</b>.</p>')+
 (blocks?'<div class="acBatchTargets">'+blocks+'</div>':'<p>Nenhuma filial exige alerta agora. Lojas com venda informada há menos de 60 minutos permanecem fora do lote; classificações não conferidas não disparam.</p>')+
 '<label class="acConfirm"><input id="acBatchWorking" type="checkbox"> Confirmei que os supervisores selecionados estão trabalhando agora e podem receber os alertas.</label>'+
 '<div class="acBatchActions"><button id="acSelectAllBatch" class="btn ghost">Selecionar todas aptas</button><button id="acClearBatch" class="btn ghost">Limpar seleção</button><button id="acStartBatch" class="btn" disabled>Enviar em massa (assistido)</button><button id="acReviewBatch" class="btn ghost">Conferir contatos</button></div>'+
 '<small class="acFootnote">Um PNG personalizado por filial. O WhatsApp exige selecionar e confirmar cada destinatário; iniciar lote não comprova entrega.</small></section>';
}
export function wireBatch(model,notify){
 const available=targets(model);
 const working=document.getElementById('acBatchWorking'),btn=document.getElementById('acStartBatch'),reference=document.getElementById('acBatchReferenceConfirm');
 const queue=()=>available.flatMap(t=>{const c=t.contacts.find(c=>String(c.id)===String(selected.get(t.row.st)));return c?[{row:t.row,contact:c}]:[];});
 const refresh=()=>{const n=queue().length;btn.disabled=!working.checked||n===0||(reference&&!reference.checked);btn.textContent='Enviar em massa (assistido) · '+n;};
 document.querySelectorAll('[data-ac-batch-store]').forEach(e=>e.addEventListener('change',()=>{if(e.value)selected.set(e.dataset.acBatchStore,e.value);else selected.delete(e.dataset.acBatchStore);refresh();}));
 working.addEventListener('change',refresh);reference?.addEventListener('change',refresh);
 document.getElementById('acSelectAllBatch')?.addEventListener('click',()=>{
  for(const x of available){if(x.contacts.length)selected.set(x.row.st,String(x.contacts[0].id));}
  document.querySelectorAll('[data-ac-batch-store]').forEach(e=>{e.value=selected.get(e.dataset.acBatchStore)||'';});
  refresh();
 });
 document.getElementById('acClearBatch')?.addEventListener('click',()=>{
  selected.clear();document.querySelectorAll('[data-ac-batch-store]').forEach(e=>{e.value='';});refresh();
 });
 document.getElementById('acReviewBatch')?.addEventListener('click',()=>document.getElementById('acContactsTab')?.click());
 refresh();
 btn.addEventListener('click',()=>{
  if(!working.checked||(reference&&!reference.checked))return;
  const items=queue().filter(v=>eligibleRow(v.row)&&eligibleContact(v.contact,v.row));
  if(!items.length){notify('Nenhum destinatário elegível selecionado. Confira os contatos.');return;}
  runBatch(items,notify);
 });
}
function runBatch(items,notify){
 document.getElementById('acBatchDialog')?.remove();
 const dialog=document.createElement('dialog');dialog.id='acBatchDialog';document.body.append(dialog);
 let i=0,shared=0;
 const show=()=>{
  if(i>=items.length){
   dialog.innerHTML='<h3>Lote concluído</h3><p>'+shared+' cards preparados/compartilhados. O aplicativo não confirma envio nem entrega.</p><button id="acBatchClose" class="btn">Fechar</button>';
   dialog.querySelector('#acBatchClose').onclick=()=>dialog.close();return;
  }
  const x=items[i];
  dialog.innerHTML='<h3>Envio em lote — '+(i+1)+' de '+items.length+'</h3>'+
   '<p><b>Filial '+esc(x.row.st)+'</b> — '+esc(x.contact.person?.nome||x.contact.name_original)+'</p>'+
   '<p>Destino WhatsApp: '+esc(x.contact.phone_suggested_e164)+'</p>'+
   '<button class="btn" id="acBatchShare">Compartilhar PNG desta filial</button> '+
   '<button class="btn ghost" id="acBatchSkip">Pular filial</button> '+
   '<button class="btn ghost" id="acBatchStop">Encerrar lote</button>'+
   '<p id="acBatchMessage" role="status"></p><small>Confirme o número no WhatsApp. Abrir compartilhamento não comprova envio.</small>';
  const action=dialog.querySelector('#acBatchShare');
  action.onclick=async()=>{
   action.disabled=true;
   try{
    const file=await createAlertImage(x.contact,x.row);
    const result=await shareAlertImage(file,x.contact.phone_suggested_e164.replace(/\D/g,''),Boolean(x.row.closing));
    shared++;
    dialog.querySelector('#acBatchMessage').textContent=result;
    action.disabled=false;action.textContent='Continuar para a próxima filial';
    action.onclick=()=>{i++;show();};
   }catch(e){dialog.querySelector('#acBatchMessage').textContent=e?.name==='AbortError'?'Compartilhamento cancelado.':String(e?.message||'Falha ao preparar card.');action.disabled=false;}
  };
  dialog.querySelector('#acBatchSkip').onclick=()=>{i++;show();};
  dialog.querySelector('#acBatchStop').onclick=()=>dialog.close();
 };
 show();dialog.showModal();
 notify('Fila de compartilhamento aberta. Cada PNG exige confirmação manual no WhatsApp.');
}
