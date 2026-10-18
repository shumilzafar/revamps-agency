/* True Med Spa concept: reveal on scroll + visit planner */
(function(){
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* reveal */
  var els = document.querySelectorAll(".rv");
  if("IntersectionObserver" in window && !reduced){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); }
      });
    },{threshold:.12,rootMargin:"0px 0px -6% 0px"});
    els.forEach(function(el){ io.observe(el); });
  } else {
    els.forEach(function(el){ el.classList.add("in"); });
  }

  /* visit planner: goal -> day -> plan */
  var root = document.getElementById("visit-planner");
  if(!root) return;
  var step1 = root.querySelector("[data-p-step1]");
  var step2 = root.querySelector("[data-p-step2]");
  var out = root.querySelector("[data-p-out]");
  var state = { goal:null, day:null };

  var GOALS = {
    "smooth": { label:"Silky-smooth skin", plan:"Start with <strong>pain-free laser hair removal</strong>. Most clients see lasting reduction in a short series. Pair it with a <strong>HydraFacial MD</strong> the same week for glow on top of smooth." },
    "glow": { label:"Glow + even tone", plan:"Book a <strong>Photofacial</strong> to lift sun damage and even tone, then keep it with a <strong>monthly membership facial</strong>. That rhythm is the whole idea behind the gym-for-your-skin membership." },
    "lines": { label:"Soften lines + wrinkles", plan:"<strong>Botox or Xeomin</strong> for expression lines, with <strong>Juvederm XC or Radiesse</strong> where volume has thinned. A consult maps exactly what goes where. Nothing generic." },
    "tighten": { label:"Firm + contour", plan:"<strong>Venus Legacy body contouring</strong> tightens and smooths, and <strong>skin tightening</strong> firms the face and neck. These are series treatments. The planner below lands you on the right day to start." }
  };
  var DAYNOTE = {
    "mon":"<strong>Monday 10 AM - 5 PM</strong> is open. Start your week with your skin first.",
    "thu":"<strong>Thursday 10 AM - 5 PM</strong> is open. A midweek reset that fits around work.",
    "fri":"<strong>Friday 10 AM - 5 PM</strong> is open. Head into the weekend glowing."
  };

  function render(){
    if(state.goal && state.day){
      var g = GOALS[state.goal];
      out.hidden = false;
      out.innerHTML = "<h4>Your visit plan</h4><p>"+g.plan+"</p><p style='margin-top:.8rem'>"+DAYNOTE[state.day]+" True Med Spa runs <strong>Monday, Thursday, and Friday, 10 AM - 5 PM</strong>. Three focused days, every slot intentional.</p>"+
        "<div class='cta-row'>"+
        "<a class='btn btn-plum' href='tel:+14804294000'>Call (480) 429-4000 to book</a>"+
        "<a class='btn btn-ghost' href='visit.html'>Plan your visit</a></div>"+
        "<p style='margin-top:1rem;font-size:.85rem;color:var(--gray)'>Prefer to book online? True Med Spa takes online bookings through MindBody. Ask for the link when you call, or find them on the MindBody app.</p>";
      if(!reduced) out.scrollIntoView({behavior:"smooth",block:"nearest"});
    }
  }
  function bindStep(el, key){
    el.querySelectorAll(".opt").forEach(function(btn){
      btn.addEventListener("click", function(){
        el.querySelectorAll(".opt").forEach(function(b){ b.classList.remove("sel"); });
        btn.classList.add("sel");
        state[key] = btn.getAttribute("data-val");
        if(key==="goal"){ step2.hidden = false; }
        render();
      });
    });
  }
  bindStep(step1,"goal");
  bindStep(step2,"day");
})();
