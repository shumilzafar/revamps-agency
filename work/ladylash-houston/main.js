/* shared interactions: nav, reveals, draggable filmstrip, gallery filters */
(function(){
  "use strict";
  // mobile nav
  var burger=document.querySelector('.burger'),links=document.querySelector('.nav-links');
  if(burger&&links){burger.addEventListener('click',function(){links.classList.toggle('open')});}
  // scroll reveals
  var rv=document.querySelectorAll('.rv');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}})},{threshold:.12});
    rv.forEach(function(el){io.observe(el)});
  }else{rv.forEach(function(el){el.classList.add('in')});}
  // draggable filmstrip with pointer tilt
  document.querySelectorAll('.strip').forEach(function(strip){
    var track=strip.querySelector('.strip-track');
    var down=false,sx=0,cur=0,moved=false;
    var max=0;
    function measure(){max=Math.max(0,track.scrollWidth-strip.clientWidth);}
    measure();window.addEventListener('resize',measure);
    strip.addEventListener('pointerdown',function(e){measure();down=true;moved=false;sx=e.clientX-cur;try{strip.setPointerCapture(e.pointerId);}catch(_){}});
    strip.addEventListener('pointermove',function(e){
      if(!down)return;
      var x=e.clientX-sx;
      if(Math.abs(e.clientX-sx-cur)>6)moved=true;
      cur=Math.min(0,Math.max(-max,x));
      track.style.transform='translateX('+cur+'px)';
    });
    ['pointerup','pointercancel','pointerleave'].forEach(function(ev){strip.addEventListener(ev,function(){down=false;});});
    strip.addEventListener('click',function(e){if(moved){e.preventDefault();e.stopPropagation();}},true);
    // 3d tilt on cards toward pointer
    strip.querySelectorAll('.card3d').forEach(function(card){
      card.addEventListener('pointermove',function(e){
        var r=card.getBoundingClientRect();
        var rx=((e.clientY-r.top)/r.height-.5)*-10;
        var ry=((e.clientX-r.left)/r.width-.5)*12;
        card.style.transform='perspective(700px) rotateX('+rx+'deg) rotateY('+ry+'deg)';
      });
      card.addEventListener('pointerleave',function(){card.style.transform='';});
    });
    // keyboard
    strip.tabIndex=0;
    strip.addEventListener('keydown',function(e){
      if(e.key==='ArrowRight'){cur=Math.max(-max,cur-320);track.style.transform='translateX('+cur+'px)';}
      if(e.key==='ArrowLeft'){cur=Math.min(0,cur+320);track.style.transform='translateX('+cur+'px)';}
    });
  });
  // gallery filters
  document.querySelectorAll('[data-filter-group]').forEach(function(group){
    var btns=group.querySelectorAll('button');
    var grid=document.querySelector(group.getAttribute('data-filter-group'));
    var count=group.parentElement.querySelector('.gcount');
    btns.forEach(function(b){
      b.addEventListener('click',function(){
        btns.forEach(function(x){x.classList.remove('on')});
        b.classList.add('on');
        var f=b.getAttribute('data-filter'),n=0;
        grid.querySelectorAll('figure').forEach(function(fig){
          var show=f==='all'||fig.getAttribute('data-cat')===f;
          fig.classList.toggle('hide',!show);
          if(show)n++;
        });
        if(count)count.textContent='Showing '+n+' of '+grid.querySelectorAll('figure').length;
      });
    });
  });
  // footer year
  document.querySelectorAll('.yr').forEach(function(el){el.textContent=new Date().getFullYear();});
})();
