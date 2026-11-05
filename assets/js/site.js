/*!
 * Fiesta SMP — shared page behaviour (nav, copy IP, live status, reveals, bunting, cube textures…)
 * Plain JS, no dependencies, safe to load with `defer` on every page.
 */
(function () {
  'use strict';

  var d = document, w = window, root = d.documentElement;
  var reduce = !!(w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var fine = !!(w.matchMedia && w.matchMedia('(hover: hover) and (pointer: fine)').matches);
  var lite = root.classList.contains('lite');
  var SERVER = 'fiesta.debarkak.xyz';
  var BASE = (d.body && d.body.getAttribute('data-base')) || '';
  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }
  function icon(id) { return '<svg class="i i--px" aria-hidden="true"><use href="' + BASE + 'assets/img/icons.svg#' + id + '"/></svg>'; }

  /* ---------- fonts: start the logo animation once the display font is in ---------- */
  (function () {
    var done = false;
    function ready() { if (!done) { done = true; root.classList.add('fonts'); } }
    setTimeout(ready, 1800);
    if (!d.fonts || !d.fonts.load) return ready();
    function go() {
      Promise.all([d.fonts.load('900 1em Unbounded'), d.fonts.load('600 1em "Pixelify Sans"')]).then(ready, ready);
    }
    var gf = d.getElementById('gf');
    if (gf && gf.media === 'print') gf.addEventListener('load', go); else go();
  })();

  /* ---------- nav: solid on scroll + mobile menu ---------- */
  var nav = $('.nav'), hero = $('.hero'), heroCopy = $('.hero-copy');
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = w.pageYOffset || 0;
    if (nav) nav.classList.toggle('is-solid', y > 24 || d.body.classList.contains('menu-open'));
    if (hero && heroCopy && !reduce) {
      var h = hero.offsetHeight || 1, p = Math.min(1, y / h);
      if (p < 1) {
        heroCopy.style.transform = 'translate3d(0,' + (y * 0.22).toFixed(1) + 'px,0)';
        heroCopy.style.opacity = String(Math.max(0, 1 - p * 1.35).toFixed(3));
      }
    }
  }
  w.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  var toggle = $('.nav-toggle'), menu = $('#menu');
  function setMenu(open) {
    d.body.classList.toggle('menu-open', open);
    if (toggle) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
    if (menu) menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    onScroll();
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function () { setMenu(!d.body.classList.contains('menu-open')); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && d.body.classList.contains('menu-open')) { setMenu(false); toggle.focus(); } });
    w.addEventListener('resize', function () { if (w.innerWidth > 900 && d.body.classList.contains('menu-open')) setMenu(false); });
  }

  /* ---------- copy to clipboard + toast + pixel confetti ---------- */
  var toastEl, toastT;
  function toast(msg) {
    if (!toastEl) {
      toastEl = d.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      d.body.appendChild(toastEl);
    }
    toastEl.innerHTML = icon('p-check') + '<span></span>';
    toastEl.lastChild.textContent = msg;
    clearTimeout(toastT);
    requestAnimationFrame(function () { toastEl.classList.add('show'); });
    toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }
  function copyText(text) {
    if (navigator.clipboard && w.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (res, rej) {
      var ta = d.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-200px;opacity:0';
      d.body.appendChild(ta); ta.select();
      try { d.execCommand('copy') ? res() : rej(); } catch (e) { rej(e); }
      d.body.removeChild(ta);
    });
  }
  var CONFETTI = ['#ffaa00', '#ff8fb1', '#55e6ff', '#8be34a', '#e05ab0', '#fff2d6'];
  function confetti(el) {
    if (reduce || !el.animate) return;
    var r = el.getBoundingClientRect(), cx = r.left + r.width * 0.75, cy = r.top + r.height / 2;
    var n = lite ? 10 : 22;
    for (var i = 0; i < n; i++) {
      var p = d.createElement('i'), s = 5 + Math.random() * 6;
      p.className = 'confetti';
      p.style.cssText = 'left:' + (cx - s / 2) + 'px;top:' + (cy - s / 2) + 'px;width:' + s + 'px;height:' + s + 'px;background:' + CONFETTI[i % CONFETTI.length];
      d.body.appendChild(p);
      var a = Math.random() * Math.PI * 2, v = 50 + Math.random() * 120;
      var dx = Math.cos(a) * v, dy = Math.sin(a) * v - 80, rot = (Math.random() - 0.5) * 720;
      var anim = p.animate([
        { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
        { transform: 'translate(' + dx * 0.7 + 'px,' + dy * 0.7 + 'px) rotate(' + rot * 0.5 + 'deg)', opacity: 1, offset: 0.45 },
        { transform: 'translate(' + dx + 'px,' + (dy + 150) + 'px) rotate(' + rot + 'deg)', opacity: 0 }
      ], { duration: 900 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.4,1)' });
      anim.onfinish = (function (el) { return function () { el.remove(); }; })(p);
    }
  }
  d.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-copy]');
    if (!b) return;
    e.preventDefault();
    var text = b.getAttribute('data-copy');
    copyText(text).then(function () {
      b.classList.add('is-copied');
      var lbl = $('[data-copy-label]', b), old = lbl && lbl.textContent;
      if (lbl) lbl.textContent = 'Copied!';
      setTimeout(function () { b.classList.remove('is-copied'); if (lbl) lbl.textContent = old; }, 1800);
      toast('Copied ' + text + ' — see you in-game!');
      confetti(b);
    }, function () { toast('Couldn’t copy — the address is ' + text); });
  });

  /* ---------- IP widget: Java / Bedrock toggle ---------- */
  $$('[data-ipw]').forEach(function (box) {
    var btns = $$('[data-ed]', box), meta = $('.ipw-meta', box), field = $('.ipw-field', box);
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
        var java = b.getAttribute('data-ed') === 'java';
        meta.innerHTML = java ? 'Java Edition · port <b>25565</b>' : 'Bedrock Edition · port <b>19132</b>';
        field.setAttribute('aria-label', 'Copy ' + (java ? 'Java' : 'Bedrock') + ' server address');
      });
    });
  });

  /* ---------- live server status (mcsrvstat.us), cached for 60s per tab ---------- */
  var MC = { '0': '#000000', '1': '#0000AA', '2': '#00AA00', '3': '#00AAAA', '4': '#AA0000', '5': '#AA00AA', '6': '#FFAA00', '7': '#AAAAAA', '8': '#555555', '9': '#5555FF', a: '#55FF55', b: '#55FFFF', c: '#FF5555', d: '#FF55FF', e: '#FFFF55', f: '#FFFFFF' };
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
        el.appendChild(sp); buf = '';
      }
      for (var i = 0; i < line.length; i++) {
        var ch = line.charAt(i);
        if (ch === '§' && i + 1 < line.length) {
          var c = line.charAt(++i).toLowerCase();
          flush();
          if (MC[c]) { color = MC[c]; fmt = {}; }
          else if (c === 'r') { color = null; fmt = {}; }
          else if ('lonm'.indexOf(c) > -1) fmt[c] = 1;
          else if (c === 'x') {
            var hex = line.substr(i + 1, 12).replace(/§/g, '');
            if (/^[0-9a-f]{6}$/i.test(hex)) { color = '#' + hex; i += 12; }
          }
          continue;
        }
        buf += ch;
      }
      flush();
    });
  }
  function setS(k, v) { $$('[data-s="' + k + '"]').forEach(function (el) { el.textContent = v; }); }
  function applyStatus(s) {
    var state = !s ? 'error' : s.online ? 'online' : 'offline';
    $$('[data-status-root]').forEach(function (el) { el.setAttribute('data-state', state); });
    var on = state === 'online' && s.players;
    setS('players', on ? s.players.online : '–');
    setS('max', on ? s.players.max : '–');
    setS('software', state === 'online' ? ((s.software ? s.software + ' ' : '') + (s.version || '')).trim() || '—' : '—');
    $$('[data-s="pill"]').forEach(function (el) {
      el.textContent = '';
      if (on) {
        var b = d.createElement('b'); b.textContent = 'Online';
        el.appendChild(b);
        el.appendChild(d.createTextNode(' · ' + s.players.online + '/' + s.players.max + ' playing'));
      } else el.textContent = state === 'offline' ? 'Server offline right now' : 'Live status unavailable';
    });
    if (state === 'online' && s.motd && s.motd.raw && s.motd.raw.length) $$('[data-s="motd"]').forEach(function (el) { renderMotd(el, s.motd.raw); });
  }
  (function loadStatus() {
    if (!$('[data-status-root]')) return;
    var key = 'fiesta-status-v1', cached = null;
    try { cached = JSON.parse(sessionStorage.getItem(key)); } catch (e) { cached = null; }
    if (cached && Date.now() - cached.t < 60000) return applyStatus(cached.d);
    if (!w.fetch) return applyStatus(null);
    var ctl = w.AbortController ? new AbortController() : null;
    var to = setTimeout(function () { if (ctl) ctl.abort(); }, 8000);

    function fetchUpstream() {
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
          try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), d: slim })); } catch (e) { /* private mode */ }
          applyStatus(slim);
        })
        .catch(function () { clearTimeout(to); applyStatus(null); });
    }

    fetch('/api/site/status', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
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
      .catch(fetchUpstream);
  })();

  /* ---------- reveal on scroll ---------- */
  var rvs = $$('.rv');
  if ('IntersectionObserver' in w && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    rvs.forEach(function (el) { io.observe(el); });
  } else rvs.forEach(function (el) { el.classList.add('in'); });

  /* ---------- 3D tilt + cursor glow on cards (mouse only) ---------- */
  if (fine && !reduce) {
    $$('[data-tilt]').forEach(function (el) {
      var raf = 0, ev = null;
      el.addEventListener('pointermove', function (e) {
        ev = e;
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = 0;
          var r = el.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
          el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
          el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
          el.style.setProperty('--ry', ((x - 0.5) * 7).toFixed(2) + 'deg');
          el.style.setProperty('--rx', ((0.5 - y) * 7).toFixed(2) + 'deg');
        });
      });
      el.addEventListener('pointerleave', function () { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
  }

  /* ---------- papel picado bunting ---------- */
  var FLAGS = ['#ffaa00', '#ff8fb1', '#55e6ff', '#8be34a', '#e05ab0', '#fff2d6'];
  function bunting(el) {
    var width = el.clientWidth || w.innerWidth;
    var n = Math.max(6, Math.min(36, Math.round(width / 52)));
    var sag = Math.min(24, width * 0.025);
    var html = '<svg class="string" viewBox="0 0 100 64" preserveAspectRatio="none" aria-hidden="true"><path d="M0 4Q50 ' + (4 + sag * 2).toFixed(1) + ' 100 4" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="1.5" vector-effect="non-scaling-stroke"/></svg><div class="flags">';
    for (var i = 0; i < n; i++) {
      var t = (i + 0.5) / n, y = 4 + 4 * t * (1 - t) * sag - 1;
      html += '<i class="flag" style="--x:' + (t * 100).toFixed(2) + ';--y:' + y.toFixed(1) + 'px;--d:-' + (i * 0.37).toFixed(2) + 's;--c:' + FLAGS[(i + (el.getAttribute('data-offset') | 0)) % FLAGS.length] + '"></i>';
    }
    el.innerHTML = html + '</div>';
    el.setAttribute('data-w', width);
  }
  var buntings = $$('[data-bunting]');
  buntings.forEach(bunting);
  if (buntings.length) {
    var bt = 0;
    w.addEventListener('resize', function () {
      clearTimeout(bt);
      bt = setTimeout(function () {
        buntings.forEach(function (el) { if (Math.abs((el.clientWidth || 0) - (+el.getAttribute('data-w') || 0)) > 40) bunting(el); });
      }, 200);
    });
  }

  /* ---------- pixel textures for the CSS cubes (generated, no image requests) ---------- */
  if ($('.cube')) {
    var seed = 7;
    var rand = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    var clamp = function (v) { return v < 0 ? 0 : v > 255 ? 255 : v | 0; };
    var vary = function (c, a) { var k = 1 + (rand() - 0.5) * a; return [clamp(c[0] * k), clamp(c[1] * k), clamp(c[2] * k)]; };
    var tex = function (fn) {
      var cv = d.createElement('canvas'); cv.width = cv.height = 16;
      var g = cv.getContext('2d'); if (!g) return null;
      var im = g.createImageData(16, 16);
      for (var y = 0; y < 16; y++) for (var x = 0; x < 16; x++) {
        var c = fn(x, y), o = (y * 16 + x) * 4;
        im.data[o] = c[0]; im.data[o + 1] = c[1]; im.data[o + 2] = c[2]; im.data[o + 3] = 255;
      }
      g.putImageData(im, 0, 0);
      return 'url("' + cv.toDataURL() + '")';
    };
    var GRASS = [108, 191, 74], DIRT = [139, 94, 60], GOLD = [255, 196, 58], PINK = [255, 143, 177], RIB = [255, 196, 40];
    var drip = []; for (var i = 0; i < 16; i++) drip.push(3 + (rand() < 0.45 ? 1 : 0) + (rand() < 0.15 ? 1 : 0));
    var T = {
      'grass-top': tex(function () { return vary(GRASS, 0.3); }),
      'grass-side': tex(function (x, y) { return y < drip[x] ? vary(GRASS, 0.28) : vary(rand() < 0.08 ? [96, 64, 40] : DIRT, 0.3); }),
      'dirt': tex(function () { return vary(rand() < 0.1 ? [96, 64, 40] : DIRT, 0.3); }),
      'gold': tex(function (x, y) {
        if (x === 0 || y === 0) return [255, 241, 168];
        if (x === 15 || y === 15) return [199, 132, 0];
        return rand() < 0.06 ? [255, 250, 220] : vary(GOLD, 0.14);
      }),
      'gift-side': tex(function (x) { return (x === 7 || x === 8) ? vary(RIB, 0.08) : vary(PINK, 0.1); }),
      'gift-top': tex(function (x, y) { return (x === 7 || x === 8 || y === 7 || y === 8) ? vary(RIB, 0.08) : vary(PINK, 0.1); }),
      'wool': tex(function (x, y) { return vary((x + y) % 4 === 0 ? [70, 205, 235] : [85, 230, 255], 0.08); }),
      'stone': tex(function () { return vary(rand() < 0.15 ? [100, 100, 108] : [125, 125, 134], 0.2); }),
      'lantern': tex(function (x, y) {
        if (x < 2 || x > 13 || y < 2 || y > 13) return [59, 46, 42];
        var dd = Math.abs(x - 7.5) + Math.abs(y - 7.5);
        return dd < 4 ? [255, 244, 200] : vary([255, 206, 110], 0.1);
      }),
      'lantern-top': tex(function (x, y) { return (x > 5 && x < 10 && y > 5 && y < 10) ? [40, 30, 28] : [70, 56, 50]; })
    };
    Object.keys(T).forEach(function (k) { if (T[k]) root.style.setProperty('--t-' + k, T[k]); });
  }

  /* ---------- Saturday stream: next date + "today" marker (viewer's local time) ---------- */
  $$('[data-sat]').forEach(function (box) {
    var now = new Date(), day = now.getDay(); // 0 = Sunday … 6 = Saturday
    var until = (6 - day + 7) % 7;
    var next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + until);
    var state = $('[data-sat-state]', box), when = $('[data-sat-when]', box);
    var fmt = function (o) { try { return next.toLocaleDateString(undefined, o); } catch (e) { return next.toDateString(); } };
    if (until === 0) {
      box.classList.add('is-today');
      if (state) state.textContent = 'Stream day — today!';
      if (when) when.textContent = 'Today, ' + fmt({ day: 'numeric', month: 'long' }) + ' · this afternoon';
    } else {
      if (state) state.textContent = until === 1 ? 'Next stream · tomorrow' : 'Next stream · in ' + until + ' days';
      if (when) when.textContent = fmt({ weekday: 'long', day: 'numeric', month: 'long' }) + ' · afternoon';
    }
    var cells = $$('.week li', box), idx = (day + 6) % 7; // Monday-first strip
    if (cells[idx]) cells[idx].classList.add('is-today');
  });

  /* ---------- splash text ---------- */
  var SPLASH = ['Live on Saturdays!', 'Barter or die!', 'Now with 100% more pig!', 'Guard your coords!', 'Bring gifts!', 'No /pay, only vibes!', 'Seasons last years!', 'Est. 2021!', 'Never gonna give you up!', 'Lanterns included!', 'Java + Bedrock!', 'Trust no one. Trade anyway.', 'Also try touching grass!', 'Party hats mandatory!', '69 slots, nice!'];
  $$('[data-splash]').forEach(function (el) { el.textContent = SPLASH[Math.floor(Math.random() * SPLASH.length)]; });

  /* ---------- stream calendar: load the Google embed only on demand ---------- */
  d.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-cal]');
    if (!b) return;
    var box = b.closest('.cal-frame'), f = d.createElement('iframe');
    f.src = b.getAttribute('data-cal');
    f.title = 'Fiesta SMP live stream schedule';
    f.setAttribute('loading', 'lazy');
    box.classList.add('is-loaded');
    box.appendChild(f);
    b.parentNode.removeChild(b);
    var hint = $('.cal-hint', box); if (hint) hint.parentNode.removeChild(hint);
  });

  /* ---------- gallery: missing-image fallback + lightbox ---------- */
  $$('.shot img').forEach(function (img) {
    function miss() { var s = img.closest('.shot'); if (s) s.classList.add('is-missing'); }
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) miss();
    img.addEventListener('error', miss);
  });
  var lb = $('#lb');
  if (lb && typeof lb.showModal === 'function') {
    var lbImg = $('img', lb), lbCap = $('figcaption', lb), cur = 0;
    var avail = function () { return $$('[data-lb]').filter(function (a) { return !a.closest('.is-missing'); }); };
    var show = function (i) {
      var list = avail(); if (!list.length) return;
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
    $('.lb-close', lb).addEventListener('click', function () { lb.close(); });
    $('.lb-prev', lb).addEventListener('click', function () { show(cur - 1); });
    $('.lb-next', lb).addEventListener('click', function () { show(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(cur - 1);
      if (e.key === 'ArrowRight') show(cur + 1);
    });
  }

  /* ---------- terms: highlight the section you're reading ---------- */
  var tocLinks = $$('.toc a');
  if (tocLinks.length && 'IntersectionObserver' in w) {
    var map = {};
    tocLinks.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var tio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        tocLinks.forEach(function (a) { a.classList.remove('is-active'); });
        var a = map[e.target.id];
        if (a) a.classList.add('is-active');
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    Object.keys(map).forEach(function (id) { var s = d.getElementById(id); if (s) tio.observe(s); });
  }
})();
