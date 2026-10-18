/* Miami Beach Laser & Aesthetics — interactions */
(function(){
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Scroll reveals */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); }
    });
  },{threshold:.12,rootMargin:"0px 0px -40px 0px"});
  document.querySelectorAll(".rv").forEach(function(el,i){
    el.style.transitionDelay = (el.style.getPropertyValue("--d") || (Math.min(i,6)*40)+"ms");
    io.observe(el);
  });

  /* Concern finder */
  var DATA = {
    lines:{t:"Botox",d:"Softens expression lines so you look rested, never frozen. Results in days, lasting 3 to 6 months.",img:"assets/img/svc-botox.jpg"},
    spots:{t:"Cutera excel V+ laser",d:"The gold standard for sun spots, age spots and pigment. Safe for all skin types, with real clearing power.",img:"assets/img/svc-laser.jpg"},
    sagging:{t:"Ultherapy",d:"Ultrasound lifting for the face, neck and chest. The only non-invasive FDA-approved lift. Collagen builds over 2 to 3 months.",img:"assets/img/svc-ulthera.jpg"},
    volume:{t:"Dermal fillers",d:"Restores volume with a conservative hand. Michelle is known for fixing overdone work and keeping it natural.",img:"assets/img/svc-botox.jpg"},
    redness:{t:"Cutera excel V+ laser",d:"Treats rosacea, facial redness, broken capillaries and flushing at the source. Michelle has cleared rosacea other providers could not.",img:"assets/img/svc-laser.jpg"}
  };
  var chips = document.getElementById("chips");
  var result = document.getElementById("finderResult");
  if(chips && result){
    chips.addEventListener("click",function(ev){
      var btn = ev.target.closest(".chip");
      if(!btn) return;
      chips.querySelectorAll(".chip").forEach(function(c){c.classList.remove("sel")});
      btn.classList.add("sel");
      var r = DATA[btn.dataset.k];
      result.innerHTML =
        '<img src="'+r.img+'" alt="'+r.t+'">'+
        '<div><h3>'+r.t+'</h3><p>'+r.d+'</p>'+
        '<p style="margin-top:.8rem"><a class="link-quiet" style="color:#fff" href="treatments.html">See treatments</a></p></div>';
      result.classList.add("show");
    });
  }
})();
