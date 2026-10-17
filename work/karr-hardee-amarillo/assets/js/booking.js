/* Karr & Hardee booking widget. Real hours: Mon 8-5, Tue-Thu 7-6, Fri 8-12, Sat/Sun closed. */
(function(){
  var HOURS = {1:[8,17], 2:[7,18], 3:[7,18], 4:[7,18], 5:[8,12]}; // day: [open, close]
  var DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function initAll(){
    var widgets = document.querySelectorAll('[data-booking]');
    for (var i = 0; i < widgets.length; i++) init(widgets[i]);
  }

  function init(root){
    var state = {service:null, day:null, time:null};
    var panels = root.querySelectorAll('.bk-panel');
    var steps = root.querySelectorAll('.bk-step');

    function show(n){
      for (var i = 0; i < panels.length; i++) panels[i].classList.toggle('on', i === n);
      for (var j = 0; j < steps.length; j++){
        steps[j].classList.toggle('on', j === n);
        steps[j].classList.toggle('done', j < n);
      }
    }

    // step 0: services
    var svcBtns = root.querySelectorAll('[data-service]');
    for (var s = 0; s < svcBtns.length; s++){
      (function(btn){
        btn.addEventListener('click', function(){
          state.service = btn.getAttribute('data-service');
          markPicked(svcBtns, btn);
          renderDays();
          show(1);
        });
      })(svcBtns[s]);
    }

    function markPicked(list, btn){
      for (var k = 0; k < list.length; k++) list[k].classList.remove('picked');
      btn.classList.add('picked');
    }

    // step 1: days (next 14)
    function renderDays(){
      var wrap = root.querySelector('[data-days]');
      wrap.innerHTML = '';
      var today = new Date();
      for (var d = 0; d < 14; d++){
        (function(offset){
          var dt = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
          var dow = dt.getDay();
          var open = HOURS[dow];
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'bk-opt';
          b.textContent = DAYS[dow] + ', ' + MONTHS[dt.getMonth()] + ' ' + dt.getDate();
          if (!open){ b.disabled = true; b.title = 'Closed'; }
          else {
            b.addEventListener('click', function(){
              state.day = dt; state.time = null;
              markPicked(wrap.querySelectorAll('.bk-opt'), b);
              renderTimes(dt, open);
              show(2);
            });
          }
          wrap.appendChild(b);
        })(d);
      }
    }

    // step 2: times
    function renderTimes(dt, open){
      var wrap = root.querySelector('[data-times]');
      wrap.innerHTML = '';
      var label = root.querySelector('[data-day-label]');
      if (label) label.textContent = DAYS[dt.getDay()] + ', ' + MONTHS[dt.getMonth()] + ' ' + dt.getDate();
      for (var h = open[0]; h < open[1]; h++){
        for (var m = 0; m < 60; m += 30){
          if (h === open[1] - 1 && m > 0) continue;
          (function(hh, mm){
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'bk-opt';
            var ap = hh >= 12 ? 'PM' : 'AM';
            var hr = hh % 12 === 0 ? 12 : hh % 12;
            var t = hr + ':' + (mm === 0 ? '00' : '30') + ' ' + ap;
            b.textContent = t;
            b.addEventListener('click', function(){
              state.time = t;
              markPicked(wrap.querySelectorAll('.bk-opt'), b);
              show(3);
            });
            wrap.appendChild(b);
          })(h, m);
        }
      }
    }

    // step 3: details
    var form = root.querySelector('[data-bookform]');
    if (form){
      form.addEventListener('submit', function(e){
        e.preventDefault();
        var name = root.querySelector('[data-fname]').value.trim();
        var phone = root.querySelector('[data-fphone]').value.trim();
        var err = root.querySelector('[data-err]');
        if (name.length < 2 || phone.replace(/\D/g,'').length < 7){
          err.style.display = 'block';
          return;
        }
        err.style.display = 'none';
        var d = state.day;
        var when = DAYS[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate() + ' at ' + state.time;
        var done = root.querySelector('[data-done]');
        done.querySelector('[data-summary]').textContent =
          state.service + ' on ' + when + ', for ' + name + '.';
        for (var i = 0; i < panels.length; i++) panels[i].classList.remove('on');
        done.style.display = 'block';
        for (var j = 0; j < steps.length; j++){ steps[j].classList.remove('on'); steps[j].classList.add('done'); }
      });
    }

    // back buttons
    var backs = root.querySelectorAll('[data-back]');
    for (var b = 0; b < backs.length; b++){
      (function(btn){
        btn.addEventListener('click', function(){
          show(parseInt(btn.getAttribute('data-back'), 10));
        });
      })(backs[b]);
    }

    show(0);
  }

  // reveal on scroll
  function reveal(){
    var els = document.querySelectorAll('.reveal');
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, {threshold:.12});
    els.forEach(function(el){ io.observe(el); });
  }

  // before/after slider
  function sliders(){
    var slds = document.querySelectorAll('[data-slider]');
    slds.forEach(function(sld){
      var after = sld.querySelector('.after-wrap');
      var handle = sld.querySelector('.slider-handle');
      var knob = sld.querySelector('.slider-knob');
      var pos = 50;
      function setPos(p){
        pos = Math.max(2, Math.min(98, p));
        after.style.clipPath = 'inset(0 ' + (100 - pos) + '% 0 0)';
        handle.style.left = pos + '%';
      }
      function fromEvent(e){
        var r = sld.getBoundingClientRect();
        var x = (e.touches && e.touches[0] ? e.touches[0].clientX : e.clientX) - r.left;
        setPos(x / r.width * 100);
      }
      var drag = false;
      sld.addEventListener('pointerdown', function(e){ drag = true; fromEvent(e); sld.setPointerCapture(e.pointerId); });
      sld.addEventListener('pointermove', function(e){ if (drag) fromEvent(e); });
      sld.addEventListener('pointerup', function(){ drag = false; });
      sld.addEventListener('keydown', function(e){
        if (e.key === 'ArrowLeft'){ setPos(pos - 4); e.preventDefault(); }
        if (e.key === 'ArrowRight'){ setPos(pos + 4); e.preventDefault(); }
      });
      sld.setAttribute('tabindex', '0');
      sld.setAttribute('role', 'slider');
      setPos(50);
    });
  }

  // mobile nav
  function nav(){
    var b = document.querySelector('[data-burger]');
    var l = document.querySelector('[data-navlinks]');
    if (b && l) b.addEventListener('click', function(){ l.classList.toggle('open'); });
  }

  document.addEventListener('DOMContentLoaded', function(){
    initAll(); reveal(); sliders(); nav();
  });
})();
