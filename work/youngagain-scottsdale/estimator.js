/* Honest pricing estimator - ranges only, consult disclaimer always shown */
(function(){
  "use strict";
  var UNIT_LO = 10, UNIT_HI = 15;      /* $ per Botox unit, area ranges */
  var SYR_LO = 400, SYR_HI = 600;      /* $ per filler syringe, area ranges */
  var AREAS = [
    {id:'forehead', name:'Forehead lines', kind:'tox', units:[10,20], note:'Botox or Jeuveau'},
    {id:'frown',    name:'Frown lines (11s)', kind:'tox', units:[15,25], note:'Botox or Jeuveau'},
    {id:'crows',    name:"Crow's feet", kind:'tox', units:[12,24], note:'Botox or Jeuveau'},
    {id:'brow',     name:'Brow lift', kind:'tox', units:[4,8], note:'Botox or Jeuveau'},
    {id:'lipflip',  name:'Lip flip', kind:'tox', units:[4,6], note:'Botox or Jeuveau'},
    {id:'lips',     name:'Lips', kind:'filler', syr:[1,1], note:'Dermal filler'},
    {id:'cheeks',   name:'Cheeks', kind:'filler', syr:[1,2], note:'Dermal filler'},
    {id:'chin',     name:'Chin', kind:'filler', syr:[1,1], note:'Dermal filler'},
    {id:'jawline',  name:'Jawline', kind:'filler', syr:[2,2], note:'Dermal filler'}
  ];
  var root = document.querySelector('[data-estimator]');
  if(!root) return;
  var list = root.querySelector('[data-areas]'),
      range = root.querySelector('[data-range]'),
      per = root.querySelector('[data-per]'),
      lines = root.querySelector('[data-lines]'),
      empty = root.querySelector('[data-empty]'),
      nempty = root.querySelector('[data-nempty]');

  var on = {};
  function fmt(n){ return '$' + n.toLocaleString('en-US'); }

  AREAS.forEach(function(a){
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'area'; b.setAttribute('aria-pressed','false');
    b.innerHTML = '<span class="box" aria-hidden="true"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 6.5 4.8 9 10 3"/></svg></span>' +
      '<span><b>' + a.name + '</b><span>' + a.note + '</span></span>';
    b.addEventListener('click', function(){
      on[a.id] = !on[a.id];
      b.setAttribute('aria-pressed', on[a.id] ? 'true' : 'false');
      render();
    });
    list.appendChild(b);
  });

  function render(){
    var sel = AREAS.filter(function(a){ return on[a.id]; });
    if(!sel.length){
      empty.style.display = ''; nempty.style.display = 'none';
      range.textContent = 'Pick an area';
      per.textContent = 'to see an honest estimate'; lines.innerHTML = '';
      return;
    }
    empty.style.display = 'none'; nempty.style.display = '';
    var lo = 0, hi = 0, rows = [];
    sel.forEach(function(a){
      var rlo, rhi, detail;
      if(a.kind === 'tox'){
        rlo = a.units[0]*UNIT_LO; rhi = a.units[1]*UNIT_HI;
        detail = a.units[0] + "-" + a.units[1] + ' units';
      } else {
        rlo = a.syr[0]*SYR_LO; rhi = a.syr[1]*SYR_HI;
        detail = a.syr[0] === a.syr[1] ? a.syr[0] + ' syringe' : a.syr[0] + "-" + a.syr[1] + ' syringes';
      }
      lo += rlo; hi += rhi;
      rows.push('<div><span>' + a.name + ' <span style="color:#9aa7ad">· ' + detail + '</span></span><span>' + fmt(rlo) + "-" + fmt(rhi) + '</span></div>');
    });
    range.textContent = fmt(lo) + ' - ' + fmt(hi);
    per.textContent = 'estimated range for ' + sel.length + (sel.length === 1 ? ' area' : ' areas');
    lines.innerHTML = rows.join('');
  }
  render();
})();
