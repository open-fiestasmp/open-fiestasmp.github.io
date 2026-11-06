/**
 * Fiesta SMP - Mobile Navigation Drawer & Utility Scripts
 */
(function() {
  function initMobileNav() {
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
    function showToast(msg) {
      var toast = document.querySelector(".fiesta-toast");
      if (!toast) {
        toast = document.createElement("div");
        toast.className = "fiesta-toast";
        document.body.appendChild(toast);
      }
      toast.textContent = msg;
      toast.classList.add("show");
      setTimeout(function() {
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMobileNav);
  } else {
    initMobileNav();
  }
})();
