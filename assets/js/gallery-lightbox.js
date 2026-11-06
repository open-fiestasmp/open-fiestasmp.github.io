/**
 * Fiesta SMP Gallery Lightbox Viewer
 * Windows 7 Aero Aesthetic Screenshot Viewer
 * Supports Desktop clicks, keyboard shortcuts, and Mobile touch swipes.
 */
document.addEventListener("DOMContentLoaded", function() {
  var cards = document.querySelectorAll(".gallery-card");
  var lightbox = document.getElementById("gallery-lightbox");
  if (!cards.length || !lightbox) return;

  var lbImg = document.getElementById("lightbox-image") || document.getElementById("lightbox-img");
  var lbAvatar = document.getElementById("lightbox-avatar");
  var lbPlayer = document.getElementById("lightbox-player");
  var lbDate = document.getElementById("lightbox-date");
  var lbCaption = document.getElementById("lightbox-caption");
  var lbIndex = document.getElementById("lightbox-index");
  var lbTotal = document.getElementById("lightbox-total");

  var closeBtn = document.getElementById("lightbox-close") || lightbox.querySelector(".lightbox-close-btn") || lightbox.querySelector(".lightbox-close");
  var prevBtn = document.getElementById("lightbox-prev") || lightbox.querySelector(".lightbox-nav-btn.prev") || lightbox.querySelector(".lightbox-prev");
  var nextBtn = document.getElementById("lightbox-next") || lightbox.querySelector(".lightbox-nav-btn.next") || lightbox.querySelector(".lightbox-next");

  var currentIndex = 0;
  var items = [];

  cards.forEach(function(card, idx) {
    items.push({
      src: card.getAttribute("data-img"),
      player: card.getAttribute("data-player") || "FiestaSMP Player",
      avatar: card.getAttribute("data-avatar") || "assets/img/avatars/debarkak.png",
      date: card.getAttribute("data-date") || ""
    });

    card.addEventListener("click", function(e) {
      e.preventDefault();
      openLightbox(idx);
    });

    card.addEventListener("keydown", function(e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(idx);
      }
    });
  });

  if (lbTotal) {
    lbTotal.textContent = items.length;
  }

  function updateLightbox(idx) {
    if (idx < 0) idx = items.length - 1;
    if (idx >= items.length) idx = 0;
    currentIndex = idx;

    var item = items[currentIndex];
    if (lbImg) {
      lbImg.src = item.src;
      lbImg.alt = "Screenshot by " + item.player;
    }
    if (lbAvatar) {
      lbAvatar.src = item.avatar;
      lbAvatar.alt = item.player;
      lbAvatar.onerror = function() {
        this.src = "assets/img/avatars/debarkak.png";
      };
    }
    if (lbPlayer) lbPlayer.textContent = item.player;
    if (lbDate) lbDate.textContent = item.date;
    if (lbCaption) lbCaption.textContent = "";
    if (lbIndex) lbIndex.textContent = currentIndex + 1;
  }

  function openLightbox(idx) {
    updateLightbox(idx);
    lightbox.classList.add("active");
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("active");
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // Close handlers
  if (closeBtn) {
    closeBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      closeLightbox();
    });
  }

  // Backdrop click handler: close when clicking the darkened backdrop
  lightbox.addEventListener("click", function(e) {
    if (e.target === lightbox || e.target.classList.contains("gallery-lightbox") || e.target.classList.contains("lightbox-backdrop")) {
      closeLightbox();
    }
  });

  // Navigation handlers
  if (prevBtn) {
    prevBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      updateLightbox(currentIndex - 1);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      updateLightbox(currentIndex + 1);
    });
  }

  // Keyboard navigation
  document.addEventListener("keydown", function(e) {
    if (!lightbox.classList.contains("active") && !lightbox.classList.contains("open")) return;
    if (e.key === "Escape") {
      closeLightbox();
    } else if (e.key === "ArrowLeft") {
      updateLightbox(currentIndex - 1);
    } else if (e.key === "ArrowRight") {
      updateLightbox(currentIndex + 1);
    }
  });

  // Mobile Touch Gestures (Swipe left/right to change photo, swipe down to dismiss)
  var touchStartX = 0;
  var touchStartY = 0;
  var touchEndX = 0;
  var touchEndY = 0;

  var lbWindow = lightbox.querySelector(".lightbox-window");
  if (lbWindow) {
    lbWindow.addEventListener("touchstart", function(e) {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].screenX;
        touchStartY = e.touches[0].screenY;
        touchEndX = touchStartX;
        touchEndY = touchStartY;
      }
    }, { passive: true });

    lbWindow.addEventListener("touchmove", function(e) {
      if (e.touches.length === 1) {
        touchEndX = e.touches[0].screenX;
        touchEndY = e.touches[0].screenY;
      }
    }, { passive: true });

    lbWindow.addEventListener("touchend", function() {
      var diffX = touchEndX - touchStartX;
      var diffY = touchEndY - touchStartY;
      var absDiffX = Math.abs(diffX);
      var absDiffY = Math.abs(diffY);

      // Horizontal swipe threshold: 50px
      if (absDiffX > 50 && absDiffX > absDiffY) {
        if (diffX < 0) {
          // Swipe Left -> Next
          updateLightbox(currentIndex + 1);
        } else {
          // Swipe Right -> Prev
          updateLightbox(currentIndex - 1);
        }
      }
      // Vertical swipe down threshold: 75px
      else if (diffY > 75 && absDiffY > absDiffX) {
        closeLightbox();
      }
    }, { passive: true });
  }

  // Deep-linking: support ?img=0 (or ?photo=1)
  try {
    var params = new URLSearchParams(window.location.search);
    var imgParam = params.get("img") || params.get("photo") || params.get("open");
    if (imgParam !== null) {
      var initialIdx = parseInt(imgParam, 10);
      if (!isNaN(initialIdx) && initialIdx >= 0 && initialIdx < items.length) {
        openLightbox(initialIdx);
      }
    }
  } catch (err) {}
});
