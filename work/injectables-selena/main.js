// Injectables by Selena — treatment finder + reveals + mobile nav
(function(){
  "use strict";

  // Mobile nav
  var burger = document.querySelector(".burger");
  var links = document.querySelector(".nav-links");
  if(burger && links){
    burger.addEventListener("click", function(){
      links.classList.toggle("open");
    });
  }

  // Scroll reveals
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, {threshold:.12});
  document.querySelectorAll(".rv").forEach(function(el){ io.observe(el); });

  // Treatment finder
  var DATA = {
    lips: {
      t: "Lip Filler",
      d: "Half or full syringe of hyaluronic filler for shape, symmetry, and soft volume. Numbing included, little to no downtime.",
      p: "From $500 · Half syringe special $159 (Oct 7-24)",
      img: "assets/img/ig-3.jpg"
    },
    wrinkles: {
      t: "Neurotoxin (Botox)",
      d: "Smooths frown lines, crow's feet, and forehead lines. Walk-ins welcome Mon-Sat. Results in 24-48 hours.",
      p: "From $11 per unit",
      img: "assets/img/ig-2.jpg"
    },
    texture: {
      t: "Microneedling + PRF",
      d: "Controlled micro-channels trigger your skin's own collagen repair. Great for texture, fine lines, and acne scarring.",
      p: "From $350 · PRF $500",
      img: "assets/img/ig-adela.jpg"
    },
    glow: {
      t: "Hydrafacial",
      d: "Vortex-fusion exfoliation, extraction, and hydration in one. The no-downtime glow treatment.",
      p: "$200",
      img: "assets/img/ig-adela.jpg"
    },
    spots: {
      t: "VI Chemical Peel",
      d: "Medical-grade peel for acne, scarring, sun spots, and melasma. Gentle but powerful.",
      p: "$300",
      img: "assets/img/ig-adela.jpg"
    },
    hair: {
      t: "Laser Hair Removal",
      d: "Permanent reduction for unwanted hair, nearly anywhere on the body. Cooling technology for comfort.",
      p: "Consultation for pricing",
      img: "assets/img/svc-laserhr.jpg"
    },
    volume: {
      t: "Radiesse + Dermal Fillers",
      d: "Restore, lift, and contour cheeks, jawline, chin, and under-eyes. Stimulates your own collagen.",
      p: "Fillers from $500 · Radiesse $600",
      img: "assets/img/ig-8.jpg"
    },
    resurface: {
      t: "Skin Resurfacing",
      d: "Non-ablative laser rebuilds collagen beneath the surface. Firmer skin, smaller pores, no peeling.",
      p: "Consultation for pricing",
      img: "assets/img/svc-resurfacing.jpg"
    }
  };

  var chips = document.querySelectorAll(".chip");
  var result = document.getElementById("fresult");
  if(chips.length && result){
    chips.forEach(function(chip){
      chip.addEventListener("click", function(){
        chips.forEach(function(c){ c.classList.remove("on"); });
        chip.classList.add("on");
        var d = DATA[chip.dataset.k];
        if(!d) return;
        result.querySelector(".fimg img").src = d.img;
        result.querySelector(".fimg img").alt = d.t;
        result.querySelector("h3").textContent = d.t;
        result.querySelector(".fdesc").textContent = d.d;
        result.querySelector(".fprice").textContent = d.p;
        result.classList.add("show");
        result.scrollIntoView({behavior:"smooth", block:"nearest"});
      });
    });
  }
})();
