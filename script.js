// Revamps site interactions: mobile nav, header shadow, FAQ is native <details>.

(function () {
  var header = document.getElementById("siteHeader");
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("mainNav");

  // Mobile menu toggle
  toggle.addEventListener("click", function () {
    var open = header.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  // Close the mobile menu when a link is tapped
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      header.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    }
  });

  // Subtle shadow once the page scrolls
  function onScroll() {
    if (window.scrollY > 8) {
      header.style.boxShadow = "0 2px 12px rgba(15, 23, 42, 0.08)";
    } else {
      header.style.boxShadow = "none";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
