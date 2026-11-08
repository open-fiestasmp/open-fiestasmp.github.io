/**
 * FiestaSMP - Lightweight UI Scripts (Mobile Navigation, Copy IP, Back to Top, Live Server Stats)
 * Optimized for low memory and smooth performance on low-end hardware.
 */
(function() {
  function init() {
    // 1. Mobile Navigation Toggle
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
      var navLinks = msNavbar.querySelectorAll("a");
      for (var i = 0; i < navLinks.length; i++) {
        navLinks[i].addEventListener("click", function() {
          msNavbar.classList.remove("open");
        });
      }
    }

    // 2. Click-to-copy for server IP addresses
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
      }, 2500);
    }

    var copyButtons = document.querySelectorAll(".copyable-ip");
    for (var j = 0; j < copyButtons.length; j++) {
      (function(btn) {
        btn.addEventListener("click", function(e) {
          e.preventDefault();
          var ip = btn.getAttribute("data-ip") || btn.textContent.trim();
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(ip).then(function() {
              showToast("Copied " + ip + " to clipboard!");
            }).catch(function() {
              showToast("Copied " + ip + " to clipboard!");
            });
          } else {
            var ta = document.createElement("textarea");
            ta.value = ip;
            ta.style.position = "fixed";
            ta.style.opacity = "0";
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
            showToast("Copied " + ip + " to clipboard!");
          }
        });
      })(copyButtons[j]);
    }

    // 3. Lightweight Back-to-Top Button (rAF-throttled scroll handler)
    var btt = document.querySelector(".back-to-top");
    if (!btt) {
      btt = document.createElement("button");
      btt.className = "back-to-top";
      btt.setAttribute("type", "button");
      btt.setAttribute("aria-label", "Back to top");
      btt.setAttribute("title", "Back to top");
      btt.innerHTML = '<svg viewBox="0 0 24 24" focusable="false" width="18" height="18" fill="currentColor"><path d="M12 4l-8 8h5v8h6v-8h5z"/></svg>';
      document.body.appendChild(btt);
    }

    btt.addEventListener("click", function() {
      window.scrollTo(0, 0);
    });

    var isTicking = false;
    var isVisible = false;
    window.addEventListener("scroll", function() {
      if (!isTicking) {
        window.requestAnimationFrame(function() {
          var shouldBeVisible = (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0) > 280;
          if (shouldBeVisible !== isVisible) {
            isVisible = shouldBeVisible;
            if (isVisible) {
              btt.classList.add("visible");
            } else {
              btt.classList.remove("visible");
            }
          }
          isTicking = false;
        });
        isTicking = true;
      }
    }, { passive: true });

    // 4. Live Minecraft Server Status, MOTD, Player Count & User Latency (Ping)
    var liveMonitor = document.getElementById("live-server-monitor");
    if (liveMonitor) {
      var statusDot = document.getElementById("status-dot");
      var statusState = document.getElementById("status-state");
      var livePlayers = document.getElementById("live-players");
      var livePing = document.getElementById("live-ping");
      var liveMotd = document.getElementById("live-motd");
      var wireStatus = document.getElementById("wire-status-text");

      var tStart = performance.now();

      function applyStatus(data, ms) {
        if (livePing) {
          livePing.textContent = ms + " ms";
        }

        if (data && data.online) {
          if (statusDot) statusDot.className = "ms-status-indicator online";
          if (statusState) statusState.textContent = "Server Online";

          var on = (data.players && typeof data.players.online === "number") ? data.players.online : 0;
          var mx = (data.players && typeof data.players.max === "number") ? data.players.max : 69;

          if (livePlayers) {
            livePlayers.textContent = on + " / " + mx;
          }

          if (wireStatus) {
            wireStatus.innerHTML = "Server is online (" + on + "/" + mx + " players, " + ms + "ms) &bull; Java &amp; Bedrock: fiesta.debarkak.xyz &bull; Any type of accounts are welcome";
          }

          if (liveMotd) {
            if (data.motd && data.motd.html) {
              liveMotd.innerHTML = data.motd.html;
            } else if (data.motd && data.motd.clean) {
              var clean = Array.isArray(data.motd.clean) ? data.motd.clean.join("\n") : data.motd.clean;
              liveMotd.textContent = clean;
            }
          }
        } else {
          if (statusDot) statusDot.className = "ms-status-indicator offline";
          if (statusState) statusState.textContent = "Offline";
          if (livePlayers) livePlayers.textContent = "0 / 69";
          if (liveMotd) liveMotd.textContent = "Server is currently offline or unreachable.";
        }
      }

      // Query primary fast status API
      fetch("https://api.mcstatus.io/v2/status/java/fiesta.debarkak.xyz", { cache: "no-cache" })
        .then(function(res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.json();
        })
        .then(function(data) {
          var latency = Math.round(performance.now() - tStart);
          applyStatus(data, latency);
        })
        .catch(function() {
          // Fallback to secondary status API
          var fbStart = performance.now();
          fetch("https://api.mcsrvstat.us/3/fiesta.debarkak.xyz")
            .then(function(res) {
              if (!res.ok) throw new Error("HTTP " + res.status);
              return res.json();
            })
            .then(function(data) {
              var latency = Math.round(performance.now() - fbStart);
              applyStatus(data, latency);
            })
            .catch(function() {
              if (livePing) livePing.textContent = "-- ms";
              if (livePlayers) livePlayers.textContent = "Online";
              if (liveMotd) liveMotd.innerHTML = "<span>fiesta &raquo; Certified Fresh</span><br><span>certified 100% organic, grass-fed, free-range Minecraft server</span>";
            });
        });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
