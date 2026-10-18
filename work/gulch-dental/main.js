/* Gulch Dental Studio - interactions */
(function(){
  "use strict";

  /* Mobile nav */
  var burger = document.querySelector('.burger');
  var links = document.querySelector('.nav-links');
  if(burger && links){
    burger.addEventListener('click', function(){ links.classList.toggle('open'); });
  }

  /* Scroll reveals */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, {threshold:.12});
  document.querySelectorAll('.rv').forEach(function(el){ io.observe(el); });

  /* ---- Smile assessment quiz ---- */
  var quiz = document.getElementById('quiz');
  if(quiz){
    var steps = Array.prototype.slice.call(quiz.querySelectorAll('.q-step'));
    var prog = document.getElementById('qprog').children;
    var result = document.getElementById('qresult');
    var answers = {};

    function goStep(n){
      steps.forEach(function(s){ s.classList.remove('on'); });
      var el = quiz.querySelector('[data-step="'+n+'"]');
      if(el) el.classList.add('on');
      for(var i=0;i<prog.length;i++){ prog[i].classList.toggle('done', i < n); }
    }

    var RECS = {
      veneers: {
        title: "Porcelain Veneers",
        text: "For chips, gaps, stains, or uneven shape, veneers are our signature answer. Ultra-thin IPS e.max restorations, a wax-up preview so you see the result first, and two visits from consult to placement.",
        comfort: ""
      },
      invisalign: {
        title: "Invisalign",
        text: "For crooked or crowded teeth, clear aligners straighten discreetly. We build a 3D digital preview of your finished smile before you commit, so there are no surprises.",
        comfort: ""
      },
      whitening: {
        title: "Teeth Whitening",
        text: "For stains and discoloration, professional whitening is the fastest, most conservative first step. Noticeable brightness without touching the tooth structure.",
        comfort: ""
      },
      makeover: {
        title: "Smile Makeover",
        text: "For missing or broken teeth, a full makeover plan combines the right restorations, implants, crowns, or veneers, into one coordinated treatment designed around your goals.",
        comfort: ""
      }
    };

    function comfortNote(v){
      if(v === 'anxious') return "Nervous about visits? You are not alone. We offer every level of sedation, from nitrous to a licensed anesthesiologist for severe anxiety, matched to exactly what you need.";
      if(v === 'nervous') return "A little nervous is normal. Most patients tell us the serene studio and clear communication made their visit easier than expected.";
      return "";
    }

    function finish(){
      var concern = answers[1], speed = answers[2], comfort = answers[3];
      var key = 'veneers';
      if(concern === 'align') key = 'invisalign';
      else if(concern === 'stain' && (speed === 'fast' || speed === 'steady')) key = 'whitening';
      else if(concern === 'missing') key = 'makeover';
      else if(concern === 'shape' && speed === 'gradual') key = 'invisalign';
      var rec = RECS[key];
      document.getElementById('rec-title').textContent = rec.title;
      document.getElementById('rec-text').textContent = rec.text;
      var cn = comfortNote(comfort);
      var cnEl = document.getElementById('rec-comfort');
      cnEl.textContent = cn;
      cnEl.style.display = cn ? 'block' : 'none';
      steps.forEach(function(s){ s.classList.remove('on'); });
      result.classList.add('on');
      for(var i=0;i<prog.length;i++){ prog[i].classList.add('done'); }
      result.scrollIntoView({behavior:'smooth', block:'center'});
    }

    quiz.addEventListener('click', function(e){
      var opt = e.target.closest('.q-opt');
      if(!opt) return;
      var stepEl = opt.closest('.q-step');
      var n = parseInt(stepEl.getAttribute('data-step'), 10);
      answers[n] = opt.getAttribute('data-v');
      if(n < 3){ goStep(n+1); }
      else { finish(); }
    });

    document.getElementById('qrestart').addEventListener('click', function(){
      answers = {};
      result.classList.remove('on');
      goStep(1);
    });

    goStep(1);
  }

  /* ---- Before/after results grid ---- */
  var grid = document.getElementById('resultsGrid');
  if(grid){
    var SMILES = [
      ['smile-holland','Holland'],['smile-hannah','Hannah'],['smile-jason','Jason'],
      ['smile-allison','Allison'],['smile-amy','Amy'],['smile-lisa','Lisa'],
      ['smile-will','Will'],['smile-brittany','Brittany'],['smile-cara','Cara'],
      ['smile-christine','Christine'],['smile-callie','Callie'],['smile-tina','Tina'],
      ['smile-kim','Kim'],['smile-angie','Angie'],['smile-daniel','Daniel'],
      ['smile-carla','Carla'],['smile-amanda','Amanda'],['smile-cindy','Cindy'],
      ['smile-jared','Jared'],['smile-tammy','Tammy'],['smile-elizabeth','Elizabeth'],
      ['smile-hinson','Hinson'],['smile-crystal','Crystal'],['smile-ashley','Ashley'],
      ['smile-pam','Pam'],['smile-mary','Mary'],['smile-lindy','Lindy'],
      ['smile-lizzy','Lizzy']
    ];
    SMILES.forEach(function(pair){
      var card = document.createElement('div');
      card.className = 'result-card rv';
      card.innerHTML =
        '<div class="ba" role="slider" aria-label="Before and after comparison for '+pair[1]+'" tabindex="0">' +
          '<img src="assets/img/'+pair[0]+'.jpg" alt="Before and after veneers for '+pair[1]+'">' +
          '<span class="lbl before-l">Before</span><span class="lbl after-l">After</span>' +
          '<div class="handle"></div><div class="knob">&#8596;</div>' +
        '</div>' +
        '<div class="cap">'+pair[1]+'<small>Porcelain veneers</small></div>';
      grid.appendChild(card);
      attachSlider(card.querySelector('.ba'));
      io.observe(card);
    });
  }

  /* Before/after slider: drag reveals after on the right.
     Source images are vertical before(top)/after(bottom) composites,
     so we show the TOP half labeled Before and BOTTOM half labeled After
     via background-position trickery on two stacked copies. */
  function attachSlider(ba){
    if(!ba) return;
    var img = ba.querySelector('img');
    var handle = ba.querySelector('.handle');
    var knob = ba.querySelector('.knob');

    /* Replace single img with two layered divs: before (top half) and after (bottom half) */
    var src = img.getAttribute('src');
    var alt = img.getAttribute('alt');
    img.remove();

    var before = document.createElement('div');
    before.style.cssText = 'position:absolute;inset:0;background:url('+src+') center top/100% 200% no-repeat;';
    before.setAttribute('aria-hidden','true');
    var after = document.createElement('div');
    after.style.cssText = 'position:absolute;inset:0;background:url('+src+') center bottom/100% 200% no-repeat;clip-path:inset(0 0 0 50%);';
    after.setAttribute('aria-hidden','true');
    ba.insertBefore(after, ba.firstChild);
    ba.insertBefore(before, ba.firstChild);

    var pos = 50, dragging = false;

    function setPos(p){
      pos = Math.max(2, Math.min(98, p));
      after.style.clipPath = 'inset(0 0 0 '+pos+'%)';
      handle.style.left = pos + '%';
      knob.style.left = pos + '%';
      ba.setAttribute('aria-valuenow', Math.round(pos));
    }

    function fromEvent(e){
      var r = ba.getBoundingClientRect();
      var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      setPos(x / r.width * 100);
    }

    ba.addEventListener('pointerdown', function(e){ dragging = true; ba.setPointerCapture(e.pointerId); fromEvent(e); });
    ba.addEventListener('pointermove', function(e){ if(dragging) fromEvent(e); });
    ba.addEventListener('pointerup', function(){ dragging = false; });
    ba.addEventListener('pointercancel', function(){ dragging = false; });
    ba.addEventListener('keydown', function(e){
      if(e.key === 'ArrowLeft'){ setPos(pos - 5); e.preventDefault(); }
      if(e.key === 'ArrowRight'){ setPos(pos + 5); e.preventDefault(); }
    });
    setPos(50);

    /* keep an accessible img for screen readers */
    var sr = document.createElement('img');
    sr.src = src; sr.alt = alt;
    sr.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);';
    ba.appendChild(sr);
  }

  /* Safety: any .ba not built by the grid (none currently) gets the slider too */
  document.querySelectorAll('.ba').forEach(function(ba){
    if(!ba.querySelector('div[style*="background:url"]')) attachSlider(ba);
  });
})();
