/* D'Allure — shared interactions */
(function(){
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* mobile nav */
  var burger = document.querySelector(".burger");
  var links = document.querySelector(".nav-links");
  if (burger && links) {
    burger.addEventListener("click", function(){
      links.classList.toggle("open");
    });
  }

  /* reveal on scroll */
  var els = document.querySelectorAll(".rv");
  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting) {
          var d = e.target.style.getPropertyValue("--d");
          if (d) e.target.style.transitionDelay = d;
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, {threshold: .12});
    els.forEach(function(el){ io.observe(el); });
  } else {
    els.forEach(function(el){ el.classList.add("in"); });
  }

  /* draggable strip */
  document.querySelectorAll(".strip").forEach(function(strip){
    var down = false, startX = 0, startL = 0, moved = false;
    strip.addEventListener("pointerdown", function(e){
      down = true; moved = false;
      startX = e.clientX; startL = strip.scrollLeft;
      strip.classList.add("dragging");
      strip.setPointerCapture(e.pointerId);
    });
    strip.addEventListener("pointermove", function(e){
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 6) moved = true;
      strip.scrollLeft = startL - dx;
    });
    ["pointerup","pointercancel","pointerleave"].forEach(function(ev){
      strip.addEventListener(ev, function(){
        down = false; strip.classList.remove("dragging");
      });
    });
    strip.addEventListener("click", function(e){
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);
    /* gentle auto-cruise until touched */
    if (!reduced) {
      var touched = false, dir = 1;
      strip.addEventListener("pointerdown", function(){ touched = true; }, {once:true});
      var cruise = setInterval(function(){
        if (touched || document.hidden) return;
        if (strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 4) dir = -1;
        if (strip.scrollLeft <= 0) dir = 1;
        strip.scrollLeft += dir * 1.2;
      }, 30);
      strip.addEventListener("pointerdown", function(){ clearInterval(cruise); }, {once:true});
    }
    /* keyboard */
    strip.setAttribute("tabindex", "0");
    strip.addEventListener("keydown", function(e){
      var step = strip.clientWidth * .7;
      if (e.key === "ArrowRight") strip.scrollLeft += step;
      if (e.key === "ArrowLeft") strip.scrollLeft -= step;
    });
  });

  /* custom plan builder */
  var builder = document.querySelector("[data-builder]");
  if (builder) {
    var answers = {};
    var result = builder.querySelector("[data-b-result]");
    builder.querySelectorAll("[data-step]").forEach(function(step){
      var key = step.getAttribute("data-step");
      step.querySelectorAll(".opt").forEach(function(opt){
        opt.addEventListener("click", function(){
          step.querySelectorAll(".opt").forEach(function(o){ o.classList.remove("sel"); });
          opt.classList.add("sel");
          answers[key] = opt.getAttribute("data-val");
          maybeRender();
        });
      });
    });
    function maybeRender(){
      if (!answers.concern || !answers.goal) return;
      var plan = window.DallurePlan.recommend(answers.concern, answers.goal);
      result.querySelector("[data-r-title]").textContent = plan.title;
      result.querySelector("[data-r-why]").textContent = plan.why;
      var ul = result.querySelector("[data-r-items]");
      ul.innerHTML = "";
      plan.treatments.forEach(function(t){
        var li = document.createElement("li");
        if (t.img) {
          var ph = document.createElement("span");
          ph.className = "r-thumb";
          var im = document.createElement("img");
          im.src = t.img; im.alt = t.name; im.loading = "lazy";
          ph.appendChild(im); li.appendChild(ph);
        }
        var name = document.createElement("span");
        name.textContent = t.name;
        var tick = document.createElement("span");
        tick.className = "tick"; tick.textContent = "✓";
        li.appendChild(name); li.appendChild(tick);
        ul.appendChild(li);
      });
      result.querySelector("[data-r-fine]").textContent =
        "Brandy confirms your exact plan at a free confidential consultation. Call (469) 754-9713.";
      result.classList.add("show");
      result.scrollIntoView({behavior: reduced ? "auto" : "smooth", block: "nearest"});
    }
  }
})();
