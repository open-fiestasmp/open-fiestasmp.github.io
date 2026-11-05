/*!
 * Fiesta SMP — Official Gateway Console Script
 * High performance, zero external dependencies, authentic console behavior.
 */
(function () {
  'use strict';

  var d = document, w = window, root = d.documentElement;
  var SERVER = 'fiesta.debarkak.xyz';

  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }

  /* ---------- Copy to clipboard + Toast ---------- */
  var toastEl, toastT;
  function toast(msg) {
    if (!toastEl) {
      toastEl = d.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      d.body.appendChild(toastEl);
    }
    toastEl.innerHTML = '<span style="color:#00ff66;font-weight:bold;">[ OK ]</span> <span></span>';
    toastEl.lastChild.textContent = msg;
    clearTimeout(toastT);
    requestAnimationFrame(function () { toastEl.classList.add('show'); });
    toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 2400);
  }

  function copyText(text) {
    if (navigator.clipboard && w.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (res, rej) {
      var ta = d.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-200px;opacity:0';
      d.body.appendChild(ta);
      ta.select();
      try { d.execCommand('copy') ? res() : rej(); } catch (e) { rej(e); }
      d.body.removeChild(ta);
    });
  }

  d.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-copy]');
    if (!b) return;
    e.preventDefault();
    var text = b.getAttribute('data-copy');
    copyText(text).then(function () {
      b.classList.add('is-copied');
      var lbl = $('[data-copy-label]', b), old = lbl && lbl.textContent;
      if (lbl) lbl.textContent = '[ Copied! ]';
      setTimeout(function () {
        b.classList.remove('is-copied');
        if (lbl) lbl.textContent = old;
      }, 1600);
      toast('Copied ' + text + ' to clipboard.');
    }, function () {
      toast('Address: ' + text);
    });
  });

  /* ---------- IP Widget: Java / Bedrock toggle ---------- */
  $$('[data-ipw]').forEach(function (box) {
    var btns = $$('[data-ed]', box);
    var hostVal = $('.ip-val-host', box);
    var portVal = $('.ip-val-port', box);
    var copyBtn = $('[data-copy]', box);

    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (o) { o.classList.toggle('active', o === b); });
        var isJava = b.getAttribute('data-ed') === 'java';
        if (hostVal) hostVal.textContent = isJava ? 'fiesta.debarkak.xyz' : 'fiesta.debarkak.xyz';
        if (portVal) portVal.textContent = isJava ? '25565 (Default Java)' : '19132 (Default Bedrock)';
        if (copyBtn) copyBtn.setAttribute('data-copy', isJava ? 'fiesta.debarkak.xyz' : 'fiesta.debarkak.xyz:19132');
      });
    });
  });

  /* ---------- Live Server Status (mcsrvstat.us / local) ---------- */
  var MC = {
    '0': '#000000', '1': '#0000AA', '2': '#00AA00', '3': '#00AAAA',
    '4': '#AA0000', '5': '#AA00AA', '6': '#FFAA00', '7': '#AAAAAA',
    '8': '#555555', '9': '#5555FF', 'a': '#00AA00', 'b': '#0088cc',
    'c': '#FF5555', 'd': '#FF55FF', 'e': '#74b21d', 'f': '#222222'
  };

  function renderMotd(el, lines) {
    el.textContent = '';
    lines.slice(0, 2).forEach(function (line, li) {
      if (li) el.appendChild(d.createElement('br'));
      var color = null, fmt = {}, buf = '';
      function flush() {
        if (!buf) return;
        var sp = d.createElement('span');
        sp.textContent = buf;
        if (color) sp.style.color = color;
        var cls = Object.keys(fmt).join(' ');
        if (cls) sp.className = cls;
        el.appendChild(sp);
        buf = '';
      }
      for (var i = 0; i < line.length; i++) {
        var ch = line.charAt(i);
        if (ch === '§' && i + 1 < line.length) {
          var c = line.charAt(++i).toLowerCase();
          flush();
          if (MC[c]) { color = MC[c]; fmt = {}; }
          else if (c === 'r') { color = null; fmt = {}; }
          else if ('lonm'.indexOf(c) > -1) fmt[c] = 1;
          continue;
        }
        buf += ch;
      }
      flush();
    });
  }

  function setS(k, v) {
    $$('[data-s="' + k + '"]').forEach(function (el) { el.textContent = v; });
  }

  function applyStatus(s) {
    var isOnline = !!(s && s.online);
    $$('[data-status-root]').forEach(function (el) {
      el.setAttribute('data-state', isOnline ? 'online' : 'offline');
    });

    $$('.led-indicator').forEach(function (el) {
      el.classList.toggle('offline', !isOnline);
    });

    var playersOn = isOnline && s.players ? s.players.online : 0;
    var playersMax = isOnline && s.players ? s.players.max : 69;

    setS('players', isOnline ? playersOn : '-');
    setS('max', isOnline ? playersMax : '-');
    setS('software', isOnline ? ((s.software ? s.software + ' ' : '') + (s.version || '')).trim() || 'Paper / Purpur' : 'Server Offline');

    $$('[data-s="pill"]').forEach(function (el) {
      el.textContent = '';
      if (isOnline) {
        el.innerHTML = '<span class="badge-status online">[ Online ]</span> ' + playersOn + ' / ' + playersMax + ' Active Players';
      } else {
        el.innerHTML = '<span class="badge-status offline">[ Offline ]</span> Standby Mode';
      }
    });

    if (isOnline && s.motd && s.motd.raw && s.motd.raw.length) {
      $$('[data-s="motd"]').forEach(function (el) { renderMotd(el, s.motd.raw); });
    }
  }

  (function loadStatus() {
    if (!$('[data-status-root]')) return;
    var key = 'fiesta-status-v2', cached = null;
    try { cached = JSON.parse(sessionStorage.getItem(key)); } catch (e) { cached = null; }
    if (cached && Date.now() - cached.t < 60000) return applyStatus(cached.d);
    if (!w.fetch) return applyStatus(null);

    var ctl = w.AbortController ? new AbortController() : null;
    var to = setTimeout(function () { if (ctl) ctl.abort(); }, 8000);

    fetch('https://api.mcsrvstat.us/3/' + SERVER, ctl ? { signal: ctl.signal } : {})
      .then(function (r) { return r.json(); })
      .then(function (j) {
        clearTimeout(to);
        var slim = {
          online: !!j.online,
          players: j.players ? { online: j.players.online | 0, max: j.players.max | 0 } : null,
          version: String(j.version || '').replace(/§./g, ''),
          software: String(j.software || ''),
          motd: j.motd && j.motd.raw ? { raw: j.motd.raw } : null
        };
        try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), d: slim })); } catch (e) {}
        applyStatus(slim);
      })
      .catch(function () {
        clearTimeout(to);
        applyStatus(null);
      });
  })();

  /* ---------- Saturday Stream Calculation ---------- */
  $$('[data-sat]').forEach(function (box) {
    var now = new Date(), day = now.getDay(); // 0 = Sunday … 6 = Saturday
    var until = (6 - day + 7) % 7;
    var next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + until);
    var state = $('[data-sat-state]', box), when = $('[data-sat-when]', box);
    var fmt = function (o) {
      try { return next.toLocaleDateString(undefined, o); } catch (e) { return next.toDateString(); }
    };

    if (until === 0) {
      box.classList.add('is-today');
      if (state) state.textContent = '[ BROADCAST DAY: TODAY ]';
      if (when) when.textContent = 'Today, ' + fmt({ day: 'numeric', month: 'long' }) + ' (Afternoon Session)';
    } else {
      if (state) state.textContent = until === 1 ? '[ NEXT BROADCAST: TOMORROW ]' : '[ NEXT BROADCAST: IN ' + until + ' DAYS ]';
      if (when) when.textContent = fmt({ weekday: 'long', day: 'numeric', month: 'long' }) + ' (Afternoon Session)';
    }

    var cells = $$('.week-table td', box), idx = (day + 6) % 7;
    if (cells[idx]) cells[idx].classList.add('is-today');
  });

  /* ---------- Google Calendar On-Demand Embed ---------- */
  d.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-cal]');
    if (!b) return;
    var box = b.closest('.cal-frame');
    var f = d.createElement('iframe');
    f.src = b.getAttribute('data-cal');
    f.title = 'Fiesta SMP Live Broadcast Schedule';
    f.style.cssText = 'width:100%;height:320px;border:1px solid #a0a0a0;margin-top:8px;';
    f.setAttribute('loading', 'lazy');
    box.appendChild(f);
    b.parentNode.removeChild(b);
    var hint = $('.cal-hint', box);
    if (hint) hint.parentNode.removeChild(hint);
  });

  /* ---------- Gallery missing-image fallback + Lightbox ---------- */
  $$('.shot-card img').forEach(function (img) {
    function miss() {
      var s = img.closest('.shot-card');
      if (s) s.classList.add('is-missing');
    }
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) miss();
    img.addEventListener('error', miss);
  });

  var lb = $('#lb');
  if (lb && typeof lb.showModal === 'function') {
    var lbImg = $('img', lb), lbCap = $('figcaption', lb), cur = 0;
    var avail = function () {
      return $$('[data-lb]').filter(function (a) { return !a.closest('.is-missing'); });
    };
    var show = function (i) {
      var list = avail();
      if (!list.length) return;
      cur = (i + list.length) % list.length;
      var a = list[cur], im = $('img', a);
      lbImg.src = a.getAttribute('href');
      lbImg.alt = im ? im.alt : '';
      lbCap.textContent = a.getAttribute('data-caption') || '';
    };

    $$('[data-lb]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        if (a.closest('.is-missing')) return;
        show(avail().indexOf(a));
        lb.showModal();
      });
    });

    var closeBtn = $('.lb-close', lb);
    if (closeBtn) closeBtn.addEventListener('click', function () { lb.close(); });
    var prevBtn = $('.lb-prev', lb);
    if (prevBtn) prevBtn.addEventListener('click', function () { show(cur - 1); });
    var nextBtn = $('.lb-next', lb);
    if (nextBtn) nextBtn.addEventListener('click', function () { show(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(cur - 1);
      if (e.key === 'ArrowRight') show(cur + 1);
    });
  }
})();
