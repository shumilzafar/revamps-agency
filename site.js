/* Revamps site interactions: honest and simple.
   Scroll reveals, smooth anchors. No custom cursor, no gimmicks. */
(function() {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll reveals
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          var siblings = Array.prototype.slice.call(e.target.parentNode.querySelectorAll('.reveal'));
          var i = siblings.indexOf(e.target);
          e.target.style.transitionDelay = Math.min(i * 0.07, 0.35) + 's';
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function(el) { io.observe(el); });
  } else {
    els.forEach(function(el) { el.classList.add('is-visible'); });
  }

  // Smooth anchors
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      var id = a.getAttribute('href');
      if (id.length > 1) {
        var t = document.querySelector(id);
        if (t) {
          e.preventDefault();
          if (reduced) { t.scrollIntoView(); return; }
          var sy = window.scrollY;
          var ey = t.getBoundingClientRect().top + sy - 70;
          var d = ey - sy, dur = Math.min(Math.abs(d) / 2.5, 1000), st = performance.now();
          (function step(now) {
            var p = Math.min((now - st) / dur, 1);
            window.scrollTo(0, sy + d * (1 - Math.pow(1 - p, 4)));
            if (p < 1) requestAnimationFrame(step);
          })(st);
        }
      }
    });
  });
})();
