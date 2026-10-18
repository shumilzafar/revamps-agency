// DHH Med Spa concept: reveals, mobile nav, marquee duplication
(function(){
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } });
  },{threshold:.12, rootMargin:"0px 0px -40px 0px"});
  document.querySelectorAll(".rv").forEach(function(el){ io.observe(el); });

  var burger = document.querySelector(".burger");
  var links = document.querySelector(".nav-links");
  if(burger && links){
    burger.addEventListener("click", function(){
      var open = links.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function(a){
      a.addEventListener("click", function(){ links.classList.remove("open"); });
    });
  }

  // duplicate marquee content for a continuous loop
  var track = document.querySelector(".marquee-track");
  if(track){ track.innerHTML += track.innerHTML; }
})();
