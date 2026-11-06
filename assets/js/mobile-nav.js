/**
 * Fiesta SMP - Mobile Navigation Drawer & Utility Scripts
 */
(function() {
  function initMobileNav() {
    // 2009 Microsoft Aero Mobile Navigation Toggle
    var msToggle = document.querySelector(".ms-mobile-toggle");
    var msNavbar = document.querySelector(".ms-navbar");
    if (msToggle && msNavbar) {
      msToggle.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        msNavbar.classList.toggle("open");
      });
      document.addEventListener("click", function(e) {
        if (!msNavbar.contains(e.target) && !msToggle.contains(e.target)) {
          msNavbar.classList.remove("open");
        }
      });
      msNavbar.querySelectorAll("a").forEach(function(link) {
        link.addEventListener("click", function() {
          msNavbar.classList.remove("open");
        });
      });
    }

    var hamburgerBtn = document.getElementById("s9iPrd") || document.querySelector(".DXsoRd") || document.querySelector('[aria-controls="yuynLe"]');
    var drawer = document.getElementById("yuynLe");
    var backdrop = document.querySelector(".TxnWlb") || document.querySelector(".BuY5Fd");
    var hamburgerSvg = hamburgerBtn ? hamburgerBtn.querySelector(".wFCWne") : null;

    function isDrawerOpen() {
      return drawer && drawer.classList.contains("jsnVQ");
    }

    function openDrawer() {
      if (!drawer) return;
      drawer.style.display = "block";
      drawer.setAttribute("aria-hidden", "false");
      if (hamburgerBtn) {
        hamburgerBtn.setAttribute("aria-expanded", "true");
        hamburgerBtn.classList.add("o0iVae");
      }
      if (hamburgerSvg) {
        hamburgerSvg.classList.add("o0iVae");
      }
      if (backdrop) {
        backdrop.style.display = "block";
        void backdrop.offsetWidth; // Force reflow
        backdrop.classList.add("XPSexb");
      }
      document.body.style.overflow = "hidden";
      void drawer.offsetWidth; // Force reflow so transition begins smoothly
      drawer.classList.add("jsnVQ");
    }

    function closeDrawer() {
      if (!drawer) return;
      drawer.classList.remove("jsnVQ");
      drawer.setAttribute("aria-hidden", "true");
      if (hamburgerBtn) {
        hamburgerBtn.setAttribute("aria-expanded", "false");
        hamburgerBtn.classList.remove("o0iVae");
      }
      if (hamburgerSvg) {
        hamburgerSvg.classList.remove("o0iVae");
      }
      if (backdrop) {
        backdrop.classList.remove("XPSexb");
      }
      document.body.style.overflow = "";
      setTimeout(function() {
        if (!isDrawerOpen()) {
          drawer.style.display = "none";
          if (backdrop && !backdrop.classList.contains("XPSexb")) {
            backdrop.style.display = "none";
          }
        }
      }, 500);
    }

    var lastToggleTime = 0;
    function handleToggle(e) {
      var now = Date.now();
      if (now - lastToggleTime < 300) return;
      lastToggleTime = now;
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (isDrawerOpen()) {
        closeDrawer();
      } else {
        openDrawer();
      }
    }

    function handleBackdrop(e) {
      var now = Date.now();
      if (now - lastToggleTime < 300) return;
      lastToggleTime = now;
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      closeDrawer();
    }

    if (hamburgerBtn) {
      hamburgerBtn.addEventListener("click", handleToggle);
      hamburgerBtn.addEventListener("touchend", handleToggle, { passive: false });
    }

    if (backdrop) {
      backdrop.addEventListener("click", handleBackdrop);
      backdrop.addEventListener("touchend", handleBackdrop, { passive: false });
    }

    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape" && isDrawerOpen()) {
        closeDrawer();
      }
    });

    window.addEventListener("resize", function() {
      if (window.innerWidth >= 768 && isDrawerOpen()) {
        closeDrawer();
      }
    });

    if (drawer) {
      drawer.querySelectorAll("a").forEach(function(link) {
        link.addEventListener("click", function() {
          closeDrawer();
        });
      });
    }

    // Click-to-copy for server IP addresses
    var toastTimeout = null;
    function showToast(msg) {
      var toast = document.querySelector(".fiesta-toast");
      if (!toast) {
        toast = document.createElement("div");
        toast.className = "fiesta-toast";
        document.body.appendChild(toast);
      }
      toast.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:8px;display:inline-block;"><polyline points="20 6 9 17 4 12"></polyline></svg><span>' + msg + '</span>';
      toast.classList.add("show");
      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(function() {
        toast.classList.remove("show");
      }, 2800);
    }

    document.querySelectorAll(".copyable-ip").forEach(function(el) {
      el.addEventListener("click", function(e) {
        e.preventDefault();
        var ip = el.getAttribute("data-ip") || el.textContent.trim();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(ip).then(function() {
            showToast("Copied " + ip + " to clipboard!");
          }).catch(function() {
            showToast("Copied " + ip + " to clipboard!");
          });
        } else {
          var ta = document.createElement("textarea");
          ta.value = ip;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          showToast("Copied " + ip + " to clipboard!");
        }
      });
    });

    // Back to Top Button
    var btt = document.querySelector(".back-to-top");
    if (!btt) {
      btt = document.createElement("button");
      btt.className = "back-to-top";
      btt.setAttribute("type", "button");
      btt.setAttribute("aria-label", "Back to top");
      btt.setAttribute("title", "Back to top");
      btt.innerHTML = '<svg viewBox="0 0 24 24" focusable="false"><path d="M12 4l-8 8h5v8h6v-8h5z"/></svg>';
      document.body.appendChild(btt);
    }
    btt.addEventListener("click", function() {
      window.scrollTo(0, 0);
    });
    window.addEventListener("scroll", function() {
      if (window.scrollY > 280) {
        btt.classList.add("visible");
      } else {
        btt.classList.remove("visible");
      }
    }, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMobileNav);
  } else {
    initMobileNav();
  }
})();
