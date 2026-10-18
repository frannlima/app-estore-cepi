// Fixed routes only. A link never selects a store, recipient or identity.
(function () {
  'use strict';
  var requested = new URLSearchParams(location.search).get('menu');
  if (!['hourly', 'metas'].includes(requested) || typeof window.go !== 'function') return;
  var originalGo = window.go;
  var pending = requested;
  window.go = function (view) {
    if (pending && typeof U !== 'undefined' && U && U.u && !U.demo) {
      view = pending;
      pending = null;
    }
    return originalGo.apply(this, [view]);
  };
  if (typeof U !== 'undefined' && U && U.u && !U.demo) window.go(pending);
})();
