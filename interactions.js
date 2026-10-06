/* Revamps interactions: custom cursor, magnetic elements, scroll reveals.
   Physics-based, damped, no linear animations. */

(function() {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ============ CUSTOM CURSOR ============ */
  if (finePointer && !reducedMotion) {
    var dot = document.querySelector('.cursor-dot');
    var ring = document.querySelector('.cursor-ring');

    var cx = -100, cy = -100;       // dot (fast)
    var rx = -100, ry = -100;       // ring (slow, laggy)
    var tx = -100, ty = -100;       // target

    document.addEventListener('mousemove', function(e) {
      tx = e.clientX; ty = e.clientY;
    }, { passive: true });

    document.addEventListener('mouseleave', function() {
      tx = -100; ty = -100;
    });

    // Hover states
    var hoverTargets = 'a, button, summary, [data-magnetic]';
    document.addEventListener('mouseover', function(e) {
      if (e.target.closest(hoverTargets)) {
        ring.classList.add('is-hover');
      }
    });
    document.addEventListener('mouseout', function(e) {
      if (e.target.closest(hoverTargets)) {
        ring.classList.remove('is-hover');
      }
    });

    function cursorLoop() {
      // Dot follows quickly
      cx += (tx - cx) * 0.35;
      cy += (ty - cy) * 0.35;
      // Ring lags behind (spring feel)
      rx += (tx - rx) * 0.14;
      ry += (ty - ry) * 0.14;

      dot.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';

      requestAnimationFrame(cursorLoop);
    }
    cursorLoop();
  }

  /* ============ MAGNETIC ELEMENTS ============ */
  if (finePointer && !reducedMotion) {
    var magnetics = document.querySelectorAll('[data-magnetic]');

    magnetics.forEach(function(el) {
      var strength = 0.28;
      var raf = null;
      var mx = 0, my = 0, cmx = 0, cmy = 0;

      el.addEventListener('mousemove', function(e) {
        var r = el.getBoundingClientRect();
        mx = (e.clientX - r.left - r.width / 2) * strength;
        my = (e.clientY - r.top - r.height / 2) * strength;
        if (!raf) magneticLoop();
        // Cursor becomes magnetic field
        document.querySelector('.cursor-ring').classList.add('is-magnetic');
      });

      el.addEventListener('mouseleave', function() {
        mx = 0; my = 0;
        if (!raf) magneticLoop();
        document.querySelector('.cursor-ring').classList.remove('is-magnetic');
      });

      function magneticLoop() {
        cmx += (mx - cmx) * 0.18;
        cmy += (my - cmy) * 0.18;
        el.style.transform = 'translate(' + cmx.toFixed(2) + 'px,' + cmy.toFixed(2) + 'px)';

        if (Math.abs(mx - cmx) > 0.1 || Math.abs(my - cmy) > 0.1) {
          raf = requestAnimationFrame(magneticLoop);
        } else {
          el.style.transform = '';
          raf = null;
        }
      }
    });
  }

  /* ============ SCROLL REVEALS ============ */
  // IntersectionObserver with stagger, eased via CSS
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    var revealObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          // Stagger siblings
          var siblings = Array.prototype.slice.call(entry.target.parentNode.querySelectorAll('.reveal'));
          var idx = siblings.indexOf(entry.target);
          entry.target.style.transitionDelay = Math.min(idx * 0.08, 0.4) + 's';
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealEls.forEach(function(el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function(el) { el.classList.add('is-visible'); });
  }

  /* ============ HERO TITLE LINES ============ */
  // Cinematic line-by-line reveal on load
  if (!reducedMotion) {
    var lines = document.querySelectorAll('.hero-title .line-inner');
    lines.forEach(function(line, i) {
      line.style.transform = 'translateY(110%)';
      line.style.transition = 'none';
    });
    // Trigger after fonts load
    window.addEventListener('load', function() {
      setTimeout(function() {
        lines.forEach(function(line, i) {
          line.style.transition = 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1) ' + (0.15 + i * 0.12) + 's';
          line.style.transform = 'translateY(0)';
        });
      }, 100);
    });
    // Fallback if load already fired
    if (document.readyState === 'complete') {
      setTimeout(function() {
        lines.forEach(function(line, i) {
          line.style.transition = 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1) ' + (0.15 + i * 0.12) + 's';
          line.style.transform = 'translateY(0)';
        });
      }, 100);
    }
  }

  /* ============ SMOOTH ANCHOR SCROLL ============ */
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      var id = a.getAttribute('href');
      if (id.length > 1) {
        var target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          if (reducedMotion) {
            target.scrollIntoView();
          } else {
            // Smooth with easing
            var startY = window.scrollY;
            var endY = target.getBoundingClientRect().top + startY - 80;
            var dist = endY - startY;
            var dur = Math.min(Math.abs(dist) / 2, 1200);
            var start = performance.now();
            function step(now) {
              var p = Math.min((now - start) / dur, 1);
              var eased = 1 - Math.pow(1 - p, 4);
              window.scrollTo(0, startY + dist * eased);
              if (p < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
          }
        }
      }
    });
  });

  /* ============ INTERACTIVE SHOWCASE ============ */
  // Particle field that responds to cursor with repulsion + click bursts
  (function initShowcase() {
    var canvas = document.getElementById('showcase-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var W, H, DPR;
    var particles = [];
    var mouse = { x: -999, y: -999, tx: -999, ty: -999 };
    var bursts = [];
    var running = true;

    var COUNT = window.matchMedia('(pointer: coarse)').matches ? 120 : 220;

    function resize() {
      var r = canvas.parentElement.getBoundingClientRect();
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    function spawn() {
      particles = [];
      for (var i = 0; i < COUNT; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: Math.random() * 1.8 + 0.6,
          hue: 35 + Math.random() * 12, // warm amber range
          a: 0.25 + Math.random() * 0.45
        });
      }
    }
    spawn();

    canvas.parentElement.addEventListener('mousemove', function(e) {
      var r = canvas.getBoundingClientRect();
      mouse.tx = e.clientX - r.left;
      mouse.ty = e.clientY - r.top;
    }, { passive: true });
    canvas.parentElement.addEventListener('mouseleave', function() {
      mouse.tx = -999; mouse.ty = -999;
    });
    canvas.parentElement.addEventListener('touchmove', function(e) {
      if (e.touches.length > 0) {
        var r = canvas.getBoundingClientRect();
        var t = e.touches[0];
        mouse.tx = t.clientX - r.left;
        mouse.ty = t.clientY - r.top;
      }
    }, { passive: true });

    function burst(x, y) {
      for (var i = 0; i < 24; i++) {
        var ang = (i / 24) * Math.PI * 2 + Math.random() * 0.3;
        var sp = 2 + Math.random() * 4;
        bursts.push({
          x: x, y: y,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          life: 1,
          r: 1 + Math.random() * 2.2
        });
      }
    }
    canvas.parentElement.addEventListener('click', function(e) {
      var r = canvas.getBoundingClientRect();
      burst(e.clientX - r.left, e.clientY - r.top);
    });
    canvas.parentElement.addEventListener('touchstart', function(e) {
      if (e.touches.length > 0) {
        var r = canvas.getBoundingClientRect();
        var t = e.touches[0];
        burst(t.clientX - r.left, t.clientY - r.top);
      }
    }, { passive: true });

    var observer = new IntersectionObserver(function(entries) {
      running = entries[0].isIntersecting;
      if (running) requestAnimationFrame(frame);
    });
    observer.observe(canvas.parentElement);

    function frame() {
      if (!running) return;
      requestAnimationFrame(frame);

      // Damped mouse
      mouse.x += (mouse.tx - mouse.x) * 0.12;
      mouse.y += (mouse.ty - mouse.y) * 0.12;

      ctx.clearRect(0, 0, W, H);

      // Ambient particles with mouse repulsion
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];

        // Gentle drift
        p.x += p.vx; p.y += p.vy;

        // Mouse repulsion (soft, physical)
        var dx = p.x - mouse.x, dy = p.y - mouse.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < 140 && d > 1) {
          var f = (1 - d / 140) * 2.2;
          p.x += (dx / d) * f;
          p.y += (dy / d) * f;
        }

        // Wrap
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'hsla(' + p.hue + ', 55%, 62%, ' + p.a + ')';
        ctx.fill();
      }

      // Connection lines (subtle, only near mouse for perf)
      ctx.strokeStyle = 'rgba(217, 164, 91, 0.08)';
      ctx.lineWidth = 1;
      for (var j = 0; j < particles.length; j += 3) {
        var a = particles[j];
        var adx = a.x - mouse.x, ady = a.y - mouse.y;
        if (Math.sqrt(adx * adx + ady * ady) > 200) continue;
        for (var k = j + 3; k < particles.length; k += 3) {
          var b = particles[k];
          var ddx = a.x - b.x, ddy = a.y - b.y;
          var dd = ddx * ddx + ddy * ddy;
          if (dd < 6000) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Bursts
      for (var m = bursts.length - 1; m >= 0; m--) {
        var bt = bursts[m];
        bt.x += bt.vx; bt.y += bt.vy;
        bt.vx *= 0.96; bt.vy *= 0.96;
        bt.life -= 0.022;
        if (bt.life <= 0) { bursts.splice(m, 1); continue; }
        ctx.beginPath();
        ctx.arc(bt.x, bt.y, bt.r * bt.life, 0, Math.PI * 2);
        ctx.fillStyle = 'hsla(38, 70%, 65%, ' + (bt.life * 0.9) + ')';
        ctx.fill();
      }
    }

    if (reducedMotion) {
      // Static render
      ctx.clearRect(0, 0, W, H);
      particles.forEach(function(p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'hsla(' + p.hue + ', 55%, 62%, ' + p.a + ')';
        ctx.fill();
      });
    } else {
      requestAnimationFrame(frame);
    }
  })();

})();
