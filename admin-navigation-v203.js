/* Central Administrativa — navegação contextual, mobile e desktop.
   Mantém intactos os handlers de importação, salvamento e consultas. */
(function () {
  'use strict';
  const NAV_ID = 'adminWorkspaceNavV203';
  const DONE_RE = /salv|conclu|sucesso|importad|publicad|atualizad|processad|incorporad|enviad|cadastrad|exclu[ií]d|gravad|realizad|registrad/i;
  const ERROR_RE = /erro|falha|inválid|não foi poss[ií]vel|obrigat[oó]ri|selecione|informe|negad|n[aã]o autorizad/i;
  const state = { active: '', work: null, observer: null, action: null, returnTimer: null, scrollTimer: null };
  const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  function refs() {
    const work = document.getElementById('adminWork');
    if (!work || !work.closest('#view')) return null;
    const bar = document.getElementById(NAV_ID);
    const host = bar && work.previousElementSibling === bar ? bar.previousElementSibling : work.previousElementSibling;
    const menu = host?.querySelector('.adminGrid');
    return menu ? { work, menu, host, bar } : null;
  }

  function scrollAt(el) {
    if (!el || !el.isConnected) return;
    const header = document.querySelector('#shell > header.top');
    const position = header && getComputedStyle(header).position;
    const offset = position === 'fixed' || position === 'sticky'
      ? header.getBoundingClientRect().height + 12 : 12;
    const top = Math.max(0, window.scrollY + el.getBoundingClientRect().top - offset);
    window.scrollTo({ top, behavior: reducedMotion() ? 'instant' : 'smooth' });
  }

  function stopPending() {
    clearTimeout(state.returnTimer);
    clearTimeout(state.scrollTimer);
    state.returnTimer = null;
    state.scrollTimer = null;
    state.action = null;
  }

  function goBack(completed) {
    const r = refs();
    stopPending();
    state.active = '';
    if (!r) return;
    const bar = document.getElementById(NAV_ID);
    if (bar) bar.hidden = true;
    r.menu.querySelectorAll('button').forEach(b => {
      b.classList.remove('adminWorkspaceSelectedV203');
      b.removeAttribute('aria-current');
    });
    scrollAt(r.host);
    if (completed) {
      const toast = document.createElement('div');
      toast.className = 'adminWorkspaceToastV203';
      toast.setAttribute('role', 'status');
      toast.textContent = '✓ Ação concluída. Selecione outro menu.';
      r.host.appendChild(toast);
      setTimeout(() => toast.remove(), 3300);
    }
  }

  function mount() {
    const r = refs();
    if (!r) return null;
    if (!r.bar) {
      const bar = document.createElement('div');
      bar.id = NAV_ID;
      bar.className = 'adminWorkspaceNavV203';
      bar.hidden = true;
      bar.innerHTML = '<button type="button" class="adminWorkspaceBackV203">← Voltar aos menus</button><span class="adminWorkspaceNameV203"></span><span class="adminWorkspaceStateV203" role="status"></span>';
      bar.querySelector('button').addEventListener('click', () => goBack(false));
      r.work.before(bar);
    }
    if (state.work !== r.work) {
      state.observer?.disconnect();
      state.work = r.work;
      state.observer = new MutationObserver(onWorkMutation);
      state.observer.observe(r.work, { childList: true, characterData: true, subtree: true });
    }
    return refs();
  }

  function showWorkspace(button) {
    const r = mount();
    if (!r) return;
    stopPending();
    state.active = button.textContent.replace(/\s+/g, ' ').trim();
    const bar = document.getElementById(NAV_ID);
    bar.hidden = false;
    bar.querySelector('.adminWorkspaceNameV203').textContent = state.active;
    bar.querySelector('.adminWorkspaceStateV203').textContent = '';
    r.menu.querySelectorAll('button').forEach(b => {
      b.classList.toggle('adminWorkspaceSelectedV203', b === button);
      if (b === button) b.setAttribute('aria-current', 'true');
      else b.removeAttribute('aria-current');
    });
    // A barra aparece antes da área de edição, independentemente do tempo de carregamento da API.
    requestAnimationFrame(() => requestAnimationFrame(() => scrollAt(bar)));
  }

  function armAction(button, work) {
    if (!state.active) return;
    const caption = button.textContent.replace(/\s+/g, ' ').trim();
    const fn = (button.getAttribute('onclick') || '').match(/^\s*(?:window\.)?([\w$]+)\s*\(/)?.[1] || '';
    const writeFn = /^(sendResults|sendTargets|weeklyUpload|save|publish|upload|delete|remove|import|process|create|admDbSave|admDbImport)/i.test(fn);
    const writeLabel = /^(salvar|publicar|processar|importar|incorporar|excluir|enviar|confirmar|cadastrar|gravar|aplicar)/i.test(caption)
      || /^atualizar\s+(?:dados|metas|base|cadastro|resultados|ticket|ranking)/i.test(caption);
    if (!writeFn && !writeLabel) return;
    clearTimeout(state.returnTimer);
    state.returnTimer = null;
    const good = [...work.querySelectorAll('.notice.success, .success.notice')]
      .map(el => el.textContent.replace(/\s+/g, ' ').trim());
    state.action = { fn, root: work.firstElementChild, good, started: Date.now() };
  }

  function actionComplete() {
    if (!state.active || !state.action || state.returnTimer) return;
    state.action = null;
    const bar = document.getElementById(NAV_ID);
    if (bar) bar.querySelector('.adminWorkspaceStateV203').textContent = '✓ Concluído';
    const active = state.active;
    state.returnTimer = setTimeout(() => {
      state.returnTimer = null;
      if (state.active === active && refs()) goBack(true);
    }, 1800);
  }

  function onWorkMutation() {
    if (!state.action || !state.active) return;
    const work = state.work;
    if (!work?.isConnected) return;
    const fresh = [...work.querySelectorAll('.notice.success, .success.notice')]
      .map(el => el.textContent.replace(/\s+/g, ' ').trim())
      .filter(txt => DONE_RE.test(txt) && !ERROR_RE.test(txt));
    if (fresh.some(txt => !state.action.good.includes(txt))) {
      actionComplete();
      return;
    }
    // Publicações no gerenciador de conteúdo são salvas e a listagem é remontada
    // sem mensagem de sucesso: a remontagem após Salvar/Excluir sinaliza conclusão.
    if (/^(saveContentItem|deleteContentItem)$/i.test(state.action.fn)
      && work.firstElementChild && work.firstElementChild !== state.action.root
      && work.querySelector('#contentList')) actionComplete();
  }

  document.addEventListener('click', function (event) {
    const button = event.target.closest?.('button');
    if (!button) return;
    const r = refs();
    if (!r) return;
    if (r.menu.contains(button)) {
      const handler = button.getAttribute('onclick') || '';
      // Hora a Hora, Suporte e FCA são páginas próprias; manter o roteamento original.
      if (/\bgo\s*\(/.test(handler)) {
        stopPending();
        state.active = '';
        return;
      }
      showWorkspace(button);
    } else if (r.work.contains(button)) {
      if (state.returnTimer) {
        clearTimeout(state.returnTimer);
        state.returnTimer = null;
      }
      armAction(button, r.work);
    }
  }, true);

  const originalAlert = window.alert;
  window.alert = function (message) {
    const text = String(message ?? '');
    const positive = Boolean(state.action && DONE_RE.test(text) && !ERROR_RE.test(text));
    const negative = Boolean(state.action && ERROR_RE.test(text));
    const result = originalAlert.apply(this, arguments);
    if (positive) actionComplete();
    else if (negative) state.action = null;
    return result;
  };

  const css = document.createElement('style');
  css.textContent = `
    .adminWorkspaceNavV203{display:flex;align-items:center;flex-wrap:wrap;gap:10px;margin:14px 0 10px;padding:10px 12px;border:1px solid #d6ded8;border-radius:14px;background:#f5f8f5;scroll-margin-top:90px}
    .adminWorkspaceNavV203[hidden]{display:none!important}
    .adminWorkspaceBackV203{border:0;border-radius:11px;background:#173F35;color:#fff;min-height:43px;padding:10px 14px;font:inherit;font-weight:800;cursor:pointer}
    .adminWorkspaceNameV203{font-size:14px;color:#173F35;font-weight:800}
    .adminWorkspaceStateV203{color:#18754b;font-size:12px;font-weight:700;margin-left:auto}
    .adminWorkspaceSelectedV203{outline:3px solid #DE7C00;outline-offset:-3px}
    .adminWorkspaceToastV203{margin-top:12px;padding:10px 12px;border-radius:10px;background:#e7f2e9;color:#173F35;font-size:13px;font-weight:700}
    @media(max-width:600px){.adminWorkspaceNavV203{gap:7px;padding:10px}.adminWorkspaceBackV203{width:100%}.adminWorkspaceNameV203{flex:1}.adminWorkspaceStateV203{margin-left:0}}
  `;
  document.head.appendChild(css);
})();