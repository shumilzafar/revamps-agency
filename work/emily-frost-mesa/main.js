/* Frost Aesthetics rebuild interactions. One showpiece per page, quiet elsewhere.
   Honors prefers-reduced-motion everywhere. No libraries. */
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- mobile nav ---------- */
  function initNav() {
    var btn = document.querySelector("[data-navbtn]");
    var panel = document.querySelector("[data-navpanel]");
    if (!btn || !panel) return;
    function set(open) {
      panel.hidden = !open;
      btn.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    }
    btn.addEventListener("click", function () { set(panel.hidden); });
    panel.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { set(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !panel.hidden) { set(false); btn.focus(); }
    });
  }

  /* ---------- headline character reveal (word-wrapped so lines never break mid-word) ---------- */
  function splitChars() {
    if (reduced) return;
    document.querySelectorAll("[data-split]").forEach(function (h) {
      var i = 0;
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (ch) {
          if (ch.nodeType === 3) {
            var frag = document.createDocumentFragment();
            ch.textContent.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) {
                frag.appendChild(document.createTextNode(" "));
              } else {
                var w = document.createElement("span");
                w.className = "w";
                Array.prototype.forEach.call(part, function (c) {
                  var s = document.createElement("span");
                  s.className = "ch";
                  s.style.setProperty("--i", i++);
                  s.textContent = c;
                  w.appendChild(s);
                });
                frag.appendChild(w);
              }
            });
            node.replaceChild(frag, ch);
          } else if (ch.nodeType === 1) { walk(ch); }
        });
      })(h);
    });
  }

  /* ---------- scroll reveal ---------- */
  function initReveal() {
    var els = document.querySelectorAll(".rv");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- quiet count-up proof ---------- */
  function initCounts() {
    var els = document.querySelectorAll("[data-count]");
    if (!els.length || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.textContent = fmt(el.dataset.count); });
      return;
    }
    function fmt(n) { return Math.round(Number(n)).toLocaleString("en-US"); }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target, target = Number(el.dataset.count);
        if (reduced || !isFinite(target)) { el.textContent = fmt(target); return; }
        var t0 = performance.now(), dur = 1500;
        (function tick(t) {
          var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(target * e);
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.4 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- draggable, pointer-reactive results filmstrip ---------- */
  function initStrip() {
    var strip = document.querySelector("[data-strip]");
    if (!strip) return;
    var cards = Array.prototype.slice.call(strip.querySelectorAll(".shot-inner"));
    var isDown = false, startX = 0, startScroll = 0, moved = false, raf = 0;

    strip.addEventListener("pointerdown", function (e) {
      isDown = true; moved = false;
      startX = e.clientX; startScroll = strip.scrollLeft;
      strip.classList.add("dragging");
      try { strip.setPointerCapture(e.pointerId); } catch (err) {}
    });
    strip.addEventListener("pointermove", function (e) {
      if (isDown) {
        var dx = e.clientX - startX;
        if (Math.abs(dx) > 6) moved = true;
        strip.scrollLeft = startScroll - dx;
      }
      tilt(e);
    });
    function end() {
      isDown = false;
      strip.classList.remove("dragging");
      resetTilt();
    }
    strip.addEventListener("pointerup", end);
    strip.addEventListener("pointercancel", end);
    strip.addEventListener("pointerleave", function () { if (!isDown) resetTilt(); });
    strip.addEventListener("click", function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);
    strip.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { strip.scrollBy({ left: 320, behavior: reduced ? "auto" : "smooth" }); }
      if (e.key === "ArrowLeft") { strip.scrollBy({ left: -320, behavior: reduced ? "auto" : "smooth" }); }
    });

    function tilt(e) {
      if (reduced || raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        cards.forEach(function (card) {
          var r = card.getBoundingClientRect();
          var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
          var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
          var d = Math.min(1, Math.hypot(dx, dy));
          var s = Math.max(0, 1 - d * 1.5);
          card.style.transform =
            "rotateY(" + (dx * 7 * s).toFixed(2) + "deg)" +
            "rotateX(" + (-dy * 7 * s).toFixed(2) + "deg)";
        });
      });
    }
    function resetTilt() {
      cards.forEach(function (c) { c.style.transform = ""; });
    }
  }

  /* ---------- results filters ---------- */
  function initFilters() {
    var bar = document.querySelector("[data-filters]");
    if (!bar) return;
    var btns = Array.prototype.slice.call(bar.querySelectorAll("button"));
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-cat]"));
    var count = document.querySelector("[data-count-label]");
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        btns.forEach(function (x) {
          var on = x === b;
          x.classList.toggle("on", on);
          x.setAttribute("aria-pressed", on ? "true" : "false");
        });
        var f = b.dataset.filter, n = 0;
        items.forEach(function (it) {
          var show = f === "all" || it.dataset.cat === f;
          it.hidden = !show;
          if (show) n++;
        });
        if (count) count.textContent = "Showing " + n + " of " + items.length;
      });
    });
  }

  /* ---------- plan builder ---------- */
  function initBuilder() {
    var root = document.getElementById("plan-builder");
    if (!root || !window.FrostPlan) return;
    var steps = Array.prototype.slice.call(root.querySelectorAll("[data-step]"));
    var result = root.querySelector("[data-result]");
    var progress = root.querySelector("[data-progress]");
    var bar = root.querySelector("[data-bar]");
    var answers = {};
    var idx = 0;

    function show(i) {
      idx = i;
      steps.forEach(function (s, k) { s.hidden = k !== i; });
      if (result) result.hidden = true;
      var n = i + 1;
      if (progress) progress.textContent = "Question " + n + " of " + steps.length;
      if (bar) bar.style.width = (n / steps.length * 100) + "%";
    }

    steps.forEach(function (s, i) {
      var next = s.querySelector("[data-next]");
      var inputs = Array.prototype.slice.call(s.querySelectorAll('input[type="radio"]'));
      inputs.forEach(function (inp) {
        inp.addEventListener("change", function () {
          s.querySelectorAll(".opt").forEach(function (o) { o.classList.remove("sel"); });
          var opt = inp.closest(".opt");
          if (opt) opt.classList.add("sel");
          next.disabled = false;
          answers[s.dataset.step] = inp.value;
        });
      });
      next.addEventListener("click", function () {
        if (i < steps.length - 1) { show(i + 1); }
        else { renderResult(); }
      });
    });

    function renderResult() {
      var r = window.FrostPlan.recommend(answers.q1, answers.q2, answers.q3);
      var IMG = {
        "Botox": "assets/img/treat-botox.webp",
        "Dermal fillers": "assets/img/treat-fillers.webp",
        "Dysport / Jeuveau": "assets/img/treat-botox.webp",
        "Moxi": "assets/img/treat-moxi.webp",
        "BBL Heroic": "assets/img/treat-bbl.webp",
        "CO2 laser": "assets/img/treat-co2.webp",
        "Virtue RF series": "assets/img/treat-virtuerf.webp",
        "Frost Glow Facial": "assets/img/treat-facial.webp",
        "ZO Skin Health plan": "assets/img/treat-skincare.webp",
        "Lip filler consult": "assets/img/treat-fillers.webp"
      };
      steps.forEach(function (s) { s.hidden = true; });
      result.querySelector("[data-r-title]").textContent = r.title;
      var ul = result.querySelector("[data-r-items]");
      ul.innerHTML = "";
      r.treatments.forEach(function (t) {
        var li = document.createElement("li");
        if (IMG[t]) {
          var ph = document.createElement("span");
          ph.className = "r-thumb";
          var im = document.createElement("img");
          im.src = IMG[t]; im.alt = t; im.loading = "lazy";
          ph.appendChild(im); li.appendChild(ph);
        }
        var name = document.createElement("span");
        name.textContent = t;
        var tick = document.createElement("span");
        tick.className = "tick";
        tick.setAttribute("aria-hidden", "true");
        tick.textContent = "\u2713";
        li.appendChild(name);
        li.appendChild(tick);
        ul.appendChild(li);
      });
      result.querySelector("[data-r-typical]").textContent = r.typical;
      result.querySelector("[data-r-why]").textContent = r.why;
      result.querySelector("[data-r-fine]").textContent =
        "Typical ranges, not a price list. " + r.disclaimer;
      result.hidden = false;
      if (progress) progress.textContent = "Your plan";
      if (bar) bar.style.width = "100%";
      result.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "nearest" });
    }

    var again = root.querySelector("[data-again]");
    if (again) again.addEventListener("click", function () {
      Object.keys(answers).forEach(function (k) { delete answers[k]; });
      steps.forEach(function (s) {
        s.querySelectorAll('input[type="radio"]').forEach(function (i) { i.checked = false; });
        s.querySelectorAll(".opt").forEach(function (o) { o.classList.remove("sel"); });
        s.querySelector("[data-next]").disabled = true;
      });
      show(0);
    });

    show(0);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    splitChars();
    initReveal();
    initCounts();
    initStrip();
    initFilters();
    initBuilder();
  });
})();
