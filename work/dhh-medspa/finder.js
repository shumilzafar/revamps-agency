// Concern finder: maps a concern to Megan's recommended treatments
(function(){
  var DATA = {
    lines: {
      title: "Soften lines, keep expression",
      img: "assets/img/svc-injectables.jpg",
      alt: "Injectable treatment at DHH Med Spa",
      copy: "Megan is known across the Valley for Botox that lifts and smooths without freezing the face. She starts conservatively, maps your muscle movement, and doses for a refreshed look that still looks like you.",
      tags: ["Botox", "Dysport", "Xeomin", "Jeuveau", "Daxxify", "Letybo"]
    },
    volume: {
      title: "Restore volume where time took it",
      img: "assets/img/svc-injectables.jpg",
      alt: "Dermal filler treatment at DHH Med Spa",
      copy: "Cheeks, lips, jawline, temples: Megan rebuilds structure with an artist's eye for proportion. As a national trainer for Prollenium, she teaches other injectors the techniques she uses on you.",
      tags: ["Juv\u00e9derm", "Restylane", "Revanesse Versa", "Radiesse", "Sculptra", "Renuva", "PRP / PRF"]
    },
    sagging: {
      title: "Lift and tighten, no surgery",
      img: "assets/img/svc-lifting.jpg",
      alt: "Skin tightening treatment at DHH Med Spa",
      copy: "For laxity along the jawline, neck, and brows, Megan layers ultrasound and radiofrequency technologies that rebuild collagen from within. Results build over months and look entirely natural.",
      tags: ["Ultherapy", "XERF", "PDO Threads", "PiXel8-RF", "Agnes RF", "Aquagold"]
    },
    texture: {
      title: "Clear, bright, even skin",
      img: "assets/img/svc-facials.jpg",
      alt: "Medical grade facial at DHH Med Spa",
      copy: "Nicole, our licensed esthetician and laser safety officer, builds every skin plan around your skin type and your calendar. Medical grade facials, lasers, and peels that turn back the clock on sun damage and dullness.",
      tags: ["DiamondGlow", "Clear + Brilliant", "IPL", "Chemical Peels", "BioRePeel", "Dermaplaning", "Skinvive"]
    },
    hair: {
      title: "Done with the razor",
      img: "assets/img/svc-facials.jpg",
      alt: "Laser hair removal at DHH Med Spa",
      copy: "Fast, comfortable laser hair removal with settings matched to your skin and hair type. Nicole oversees every series personally as the practice's laser safety officer.",
      tags: ["Laser Hair Removal"]
    },
    body: {
      title: "Shape up, slim down",
      img: "assets/img/svc-body.jpg",
      alt: "Body treatment at DHH Med Spa",
      copy: "Non-surgical body contouring, medical weight loss, and hormone optimization, all under one roof and all supervised by a board-certified nurse practitioner. Real plans, real follow-up.",
      tags: ["Emsculpt", "Weight Loss", "Hormone Therapy", "Mesotherapy", "B12 / MIC", "Buttock Augmentation"]
    }
  };

  var chips = document.querySelectorAll(".chip");
  var res = document.getElementById("fresult");
  if(!chips.length || !res) return;

  chips.forEach(function(chip){
    chip.addEventListener("click", function(){
      chips.forEach(function(c){ c.classList.remove("on"); c.setAttribute("aria-pressed","false"); });
      chip.classList.add("on");
      chip.setAttribute("aria-pressed","true");
      var d = DATA[chip.getAttribute("data-k")];
      if(!d) return;
      res.innerHTML =
        '<img src="' + d.img + '" alt="' + d.alt + '" loading="lazy">' +
        '<div><h4>' + d.title + '</h4><p>' + d.copy + '</p>' +
        '<div class="ftags">' + d.tags.map(function(t){ return "<span>" + t + "</span>"; }).join("") + "</div>" +
        '<a class="btn btn-solid" href="tel:+14803364195">Book a consult: (480) 336-4195</a></div>';
      res.classList.remove("show");
      void res.offsetWidth;
      res.classList.add("show");
    });
  });
})();
