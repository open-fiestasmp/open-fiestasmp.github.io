/**
 * Fiesta SMP Markdown Renderer
 * Automatically renders Markdown in elements with [data-markdown] or .markdown-raw
 */
(function() {
  function renderAll() {
    if (typeof marked === 'undefined') return;

    // Configure marked options
    if (typeof marked.setOptions === 'function') {
      marked.setOptions({
        gfm: true,
        breaks: true,
        headerIds: true,
        mangle: false
      });
    }

    // Process elements with [data-markdown] attribute
    document.querySelectorAll('[data-markdown]').forEach(function(el) {
      var raw = el.getAttribute('data-markdown');
      if (!raw || raw.trim() === '') {
        raw = el.textContent || el.innerText;
      }
      if (raw) {
        el.innerHTML = marked.parse(raw);
        el.classList.add('markdown-content');
      }
    });

    // Process elements with .markdown-raw class
    document.querySelectorAll('.markdown-raw').forEach(function(el) {
      var raw = el.textContent || el.innerText;
      if (raw) {
        el.innerHTML = marked.parse(raw);
        el.classList.remove('markdown-raw');
        el.classList.add('markdown-content');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAll);
  } else {
    renderAll();
  }

  // Export helper for manual programmatic calls
  window.renderFiestaMarkdown = function(targetEl, rawMarkdown) {
    if (typeof marked !== 'undefined' && targetEl) {
      targetEl.innerHTML = marked.parse(rawMarkdown);
      targetEl.classList.add('markdown-content');
    }
  };
})();
