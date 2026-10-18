/* Young Again - shared interactions: nav, reveals, draggable filmstrip */
(function(){
  "use strict";
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* mobile nav */
  var btn = document.querySelector('[data-navbtn]'),
      panel = document.querySelector('[data-navpanel]');
  if(btn && panel){
    btn.addEventListener('click', function(){
      var open = panel.hasAttribute('hidden');
      if(open){ panel.removeAttribute('hidden'); btn.setAttribute('aria-expanded','true'); }
      else { panel.setAttribute('hidden',''); btn.setAttribute('aria-expanded','false'); }
    });
  }

  /* headline char reveal (word-wrapped so lines never break mid-word) */
  document.querySelectorAll('[data-split]').forEach(function(el){
    if(reduce) return;
    var nodes = Array.prototype.slice.call(el.childNodes), i = 0;
    el.innerHTML = '';
    function addChars(text, parent){
      text.split(/(\s+)/).forEach(function(part){
        if(!part) return;
        if(/^\s+$/.test(part)){ parent.appendChild(document.createTextNode(' ')); return; }
        var w = document.createElement('span');
        w.className = 'w'; w.style.whiteSpace = 'nowrap';
        part.split('').forEach(function(c){
          var s = document.createElement('span');
          s.className = 'ch'; s.textContent = c;
          s.style.animationDelay = (i++ * 22) + 'ms';
          w.appendChild(s);
        });
        parent.appendChild(w);
      });
    }
    nodes.forEach(function(n){
      if(n.nodeType === 3){
        addChars(n.textContent, el);
      } else if(n.nodeType === 1){
        var wrap = n.cloneNode(false);
        addChars(n.textContent, wrap);
        el.appendChild(wrap);
      }
    });
  });

  /* scroll reveals */
  var rv = document.querySelectorAll('.rv');
  if('IntersectionObserver' in window && !reduce){
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting){
          var d = e.target.style.getPropertyValue('--d');
          if(d) e.target.style.transitionDelay = d;
          e.target.classList.add('in'); io.unobserve(e.target);
        }
      });
    }, {threshold:.12});
    rv.forEach(function(el){ io.observe(el); });
  } else {
    rv.forEach(function(el){ el.classList.add('in'); });
  }

  /* draggable filmstrip with pointer tilt */
  document.querySelectorAll('[data-strip]').forEach(function(strip){
    var down = false, startX = 0, startL = 0, moved = false;
    strip.addEventListener('pointerdown', function(e){
      down = true; moved = false; startX = e.clientX; startL = strip.scrollLeft;
      strip.classList.add('dragging');
      try{ strip.setPointerCapture(e.pointerId); }catch(_){}
    });
    strip.addEventListener('pointermove', function(e){
      if(!down) return;
      var dx = e.clientX - startX;
      if(Math.abs(dx) > 6) moved = true;
      strip.scrollLeft = startL - dx;
    });
    ['pointerup','pointercancel','pointerleave'].forEach(function(ev){
      strip.addEventListener(ev, function(){ down = false; strip.classList.remove('dragging'); });
    });
    strip.addEventListener('click', function(e){ if(moved){ e.preventDefault(); e.stopPropagation(); } }, true);

    /* gentle auto-cruise until the visitor touches it */
    var cruised = false, raf = null;
    function cruise(){
      if(cruised || reduce || down) return;
      strip.scrollLeft += 0.45;
      if(strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 4){
        cruised = true; return;
      }
      raf = requestAnimationFrame(cruise);
    }
    var started = false;
    new IntersectionObserver(function(es){
      if(es[0].isIntersecting && !started){ started = true; raf = requestAnimationFrame(cruise); }
    }, {threshold:.3}).observe(strip);
    strip.addEventListener('pointerdown', function(){ cruised = true; if(raf) cancelAnimationFrame(raf); }, {once:true});
    strip.addEventListener('keydown', function(){ cruised = true; if(raf) cancelAnimationFrame(raf); }, {once:true});

    /* keyboard */
    strip.addEventListener('keydown', function(e){
      var step = 360;
      if(e.key === 'ArrowRight'){ strip.scrollLeft += step; e.preventDefault(); }
      if(e.key === 'ArrowLeft'){ strip.scrollLeft -= step; e.preventDefault(); }
    });

    /* pointer tilt on cards */
    if(!reduce && window.matchMedia('(pointer:fine)').matches){
      strip.querySelectorAll('.shot-inner').forEach(function(card){
        card.addEventListener('pointermove', function(e){
          var r = card.getBoundingClientRect(),
              x = (e.clientX - r.left) / r.width - .5,
              y = (e.clientY - r.top) / r.height - .5;
          card.style.transform = 'rotateY(' + (x*10).toFixed(2) + 'deg) rotateX(' + (-y*10).toFixed(2) + 'deg) translateZ(12px)';
        });
        card.addEventListener('pointerleave', function(){ card.style.transform = ''; });
      });
    }
  });
})();
