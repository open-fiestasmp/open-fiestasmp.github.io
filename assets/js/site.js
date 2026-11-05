/*!
 * Fiesta SMP — Windows 7 Aero / Microsoft 2009 UI Functionality
 * Plain JS, zero dependencies, responsive & accessible.
 */
(function () {
  'use strict';

  var d = document, w = window;
  var SERVER = 'fiesta.debarkak.xyz';
  var PORT_JAVA = '25565';
  var PORT_BEDROCK = '19132';

  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }

  /* ---------- Toast Notification ---------- */
  var toastEl, toastT;
  function toast(msg) {
    if (!toastEl) {
      toastEl = d.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      d.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    clearTimeout(toastT);
    requestAnimationFrame(function () { toastEl.classList.add('show'); });
    toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 2800);
  }

  /* ---------- Copy to Clipboard ---------- */
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
      toast('Copied ' + text + ' to clipboard!');
      var orig = b.getAttribute('data-orig-text') || b.textContent;
      if (!b.getAttribute('data-orig-text')) b.setAttribute('data-orig-text', orig);
      var lbl = $('[data-copy-label]', b);
      if (lbl) {
        var oldLbl = lbl.textContent;
        lbl.textContent = 'Copied!';
        setTimeout(function () { lbl.textContent = oldLbl; }, 1800);
      }
    }, function () {
      toast('Address: ' + text);
    });
  });

  /* ---------- IP Widget Toggle (Java / Bedrock) ---------- */
  $$('[data-ipw]').forEach(function (box) {
    var btns = $$('[data-ed]', box);
    var meta = $('[data-ip-meta]', box);
    var copyBtn = $('[data-copy]', box);
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (o) { o.classList.remove('active'); });
        b.classList.add('active');
        var isBedrock = b.getAttribute('data-ed') === 'bedrock';
        if (meta) {
          meta.innerHTML = isBedrock 
            ? 'Bedrock Edition &middot; Host: <b>' + SERVER + '</b> &middot; Port: <b>' + PORT_BEDROCK + '</b>'
            : 'Java Edition &middot; Host: <b>' + SERVER + '</b> &middot; Port: <b>' + PORT_JAVA + '</b>';
        }
        if (copyBtn) {
          copyBtn.setAttribute('data-copy', isBedrock ? SERVER + ':' + PORT_BEDROCK : SERVER);
        }
      });
    });
  });

  /* ---------- Hero Tabs Switcher ---------- */
  var heroTabs = $$('.hero-tab-pill');
  if (heroTabs.length) {
    heroTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        heroTabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        var targetSection = tab.getAttribute('data-target');
        if (targetSection) {
          var el = $(targetSection);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  /* ---------- Live Server Status (mcsrvstat.us) ---------- */
  function updateTelemetry(data) {
    var isOnline = data && data.online;
    var led = $('.aero-status-led');
    var statusText = $('[data-live-status]');
    var playerCount = $('[data-live-players]');
    var maxCount = $('[data-live-max]');
    var motdText = $('[data-live-motd]');
    var versionText = $('[data-live-version]');

    if (led) {
      led.style.background = isOnline ? '#33cc33' : '#cc3333';
      led.style.boxShadow = isOnline ? '0 0 6px #33cc33' : '0 0 6px #cc3333';
    }

    if (statusText) {
      statusText.textContent = isOnline ? 'ONLINE' : 'OFFLINE';
      statusText.style.color = isOnline ? '#008800' : '#aa0000';
    }

    if (playerCount) {
      playerCount.textContent = (isOnline && data.players) ? data.players.online : '0';
    }

    if (maxCount) {
      maxCount.textContent = (isOnline && data.players) ? data.players.max : '69';
    }

    if (versionText && isOnline && data.version) {
      versionText.textContent = data.version;
    }

    if (motdText && isOnline && data.motd && data.motd.clean) {
      motdText.textContent = data.motd.clean.join(' ');
    }
  }

  (function fetchStatus() {
    var cacheKey = 'fiesta_srv_status';
    var cached = null;
    try { cached = JSON.parse(sessionStorage.getItem(cacheKey)); } catch (e) {}

    if (cached && Date.now() - cached.time < 60000) {
      updateTelemetry(cached.data);
      return;
    }

    if (!w.fetch) return;
    fetch('https://api.mcsrvstat.us/3/' + SERVER)
      .then(function (r) { return r.json(); })
      .then(function (json) {
        var cleanData = {
          online: !!json.online,
          players: json.players ? { online: json.players.online, max: json.players.max } : null,
          version: json.version || 'Paper 1.21.x',
          motd: json.motd ? { clean: json.motd.clean } : null
        };
        try { sessionStorage.setItem(cacheKey, JSON.stringify({ time: Date.now(), data: cleanData })); } catch (e) {}
        updateTelemetry(cleanData);
      })
      .catch(function () {
        // Fallback offline or default
        updateTelemetry({ online: true, players: { online: 0, max: 69 }, version: '1.8 → 26.3+' });
      });
  })();

  /* ---------- Google Calendar Embedder ---------- */
  d.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-cal]');
    if (!b) return;
    var box = b.closest('.cal-frame') || b.parentNode;
    var iframe = d.createElement('iframe');
    iframe.src = b.getAttribute('data-cal');
    iframe.title = 'Fiesta SMP Live Stream Calendar';
    iframe.style.cssText = 'width:100%; height:320px; border:1px solid #bdd7ed; border-radius:3px; margin-top:8px;';
    iframe.setAttribute('loading', 'lazy');
    box.appendChild(iframe);
    b.style.display = 'none';
  });

  /* ---------- Lightbox Modal ---------- */
  var lb = $('#lb');
  if (lb && typeof lb.showModal === 'function') {
    var lbImg = $('img', lb);
    var lbCap = $('figcaption', lb);
    var links = $$('[data-lb]');
    var cur = 0;

    var show = function (idx) {
      if (!links.length) return;
      cur = (idx + links.length) % links.length;
      var a = links[cur];
      var img = $('img', a);
      if (lbImg) {
        lbImg.src = a.getAttribute('href');
        lbImg.alt = img ? img.alt : '';
      }
      if (lbCap) {
        lbCap.textContent = a.getAttribute('data-caption') || (img ? img.alt : '');
      }
    };

    links.forEach(function (a, i) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        show(i);
        lb.showModal();
      });
    });

    var closeBtn = $('.lb-close-btn', lb);
    if (closeBtn) closeBtn.addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  }

  /* ---------- FAQ Accordion ---------- */
  $$('.faq-question-aero').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = q.closest('.faq-item-aero');
      var ans = $('.faq-answer-aero', item);
      if (!ans) return;
      var open = ans.style.display !== 'none';
      ans.style.display = open ? 'none' : 'block';
      var indicator = $('.faq-icon', q);
      if (indicator) indicator.textContent = open ? '+' : '–';
    });
  });

  /* ---------- News Category Filtering ---------- */
  var catBtns = $$('[data-filter-cat]');
  var articles = $$('[data-cat]');
  if (catBtns.length && articles.length) {
    catBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        catBtns.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var cat = btn.getAttribute('data-filter-cat');
        articles.forEach(function (art) {
          if (cat === 'all' || art.getAttribute('data-cat') === cat) {
            art.style.display = 'block';
          } else {
            art.style.display = 'none';
          }
        });
      });
    });
  }

  /* ---------- Terms Explorer Scroll-Spy ---------- */
  var termsLinks = $$('.terms-tree-nav a');
  if (termsLinks.length && 'IntersectionObserver' in w) {
    var map = {};
    termsLinks.forEach(function (a) {
      var href = a.getAttribute('href');
      if (href && href.startsWith('#')) map[href.slice(1)] = a;
    });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        termsLinks.forEach(function (l) { l.classList.remove('is-active'); });
        var targetLink = map[entry.target.id];
        if (targetLink) targetLink.classList.add('is-active');
      });
    }, { rootMargin: '-20% 0px -60% 0px' });

    Object.keys(map).forEach(function (id) {
      var sec = d.getElementById(id);
      if (sec) observer.observe(sec);
    });
  }
})();
