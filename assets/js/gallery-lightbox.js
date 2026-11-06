/**
 * Fiesta SMP Gallery Lightbox Viewer
 * Provides full-screen lightbox viewing with player metadata, avatar, and date.
 */
document.addEventListener("DOMContentLoaded", function() {
  var cards = document.querySelectorAll(".gallery-card");
  var lightbox = document.getElementById("gallery-lightbox");
  if (!cards.length || !lightbox) return;

  var lbImg = document.getElementById("lightbox-img");
  var lbAvatar = document.getElementById("lightbox-avatar");
  var lbPlayer = document.getElementById("lightbox-player");
  var lbDate = document.getElementById("lightbox-date");
  var lbCaption = document.getElementById("lightbox-caption");
  var lbIndex = document.getElementById("lightbox-index");
  var lbTotal = document.getElementById("lightbox-total");

  var currentIndex = 0;
  var items = [];

  cards.forEach(function(card, idx) {
    items.push({
      src: card.getAttribute("data-img"),
      player: card.getAttribute("data-player"),
      avatar: card.getAttribute("data-avatar"),
      date: card.getAttribute("data-date"),
      caption: card.getAttribute("data-caption")
    });

    card.addEventListener("click", function(e) {
      e.preventDefault();
      openLightbox(idx);
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
      lbImg.alt = item.caption + " by " + item.player;
    }
    if (lbAvatar) {
      lbAvatar.src = item.avatar;
      lbAvatar.alt = item.player + " avatar";
      lbAvatar.onerror = function() {
        this.src = "https://minotar.net/helm/" + encodeURIComponent(item.player) + "/64";
      };
    }
    if (lbPlayer) lbPlayer.textContent = item.player;
    if (lbDate) lbDate.textContent = item.date;
    if (lbCaption) lbCaption.textContent = item.caption;
    if (lbIndex) lbIndex.textContent = currentIndex + 1;
  }

  function openLightbox(idx) {
    updateLightbox(idx);
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // Close handlers
  var closeBtn = lightbox.querySelector(".lightbox-close");
  var backdrop = lightbox.querySelector(".lightbox-backdrop");
  if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
  if (backdrop) backdrop.addEventListener("click", closeLightbox);

  // Navigation handlers
  var prevBtn = lightbox.querySelector(".lightbox-prev");
  var nextBtn = lightbox.querySelector(".lightbox-next");
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
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") {
      closeLightbox();
    } else if (e.key === "ArrowLeft") {
      updateLightbox(currentIndex - 1);
    } else if (e.key === "ArrowRight") {
      updateLightbox(currentIndex + 1);
    }
  });
});
