/* Lash Style Finder — 3 questions, honest mapping to her real menu */
(function(){
  "use strict";
  var root=document.getElementById('finder');
  if(!root)return;
  var BOOK='https://phorest.com/book/salons/ladylashprofessional';
  var SETS=[
    {id:'classic',name:'Classic',price:100,time:'1 hr 15 min',vibe:0,img:'assets/img/result-lash-2.webp'},
    {id:'classic2d',name:'Classic 2D',price:110,time:'1 hr 15 min',vibe:0,img:'assets/img/result-lash-1.webp'},
    {id:'hybrid',name:'Hybrid',price:120,time:'1 hr 30 min',vibe:1,img:'assets/img/result-lash-3.webp'},
    {id:'elegance',name:'Elegance',price:139,time:'1 hr 30 min',vibe:1,img:'assets/img/result-lash-6.webp'},
    {id:'volume',name:'Volume',price:150,time:'1 hr 45 min',vibe:2,img:'assets/img/hero-lash-macro.webp'},
    {id:'kimk',name:'Kim K / Wispy',price:180,time:'2 hr',vibe:2,img:'assets/img/result-lash-4.webp'},
    {id:'mega',name:'Mega Volume',price:200,time:'2 hr 15 min',vibe:3,img:'assets/img/result-lash-5.webp'}
  ];
  var VIBES={natural:0,polished:1,glam:2,dramatic:3};
  var VIBE_NAME={natural:'natural',polished:'polished',glam:'glam',dramatic:'dramatic'};
  var CAPS={under130:120,mid:150,plus:200};
  var CAP_LABEL={under130:'under $130','mid':'$130 to $160','plus':'$160 and up'};
  var state={vibe:null,maint:null,budget:null,step:0};
  var bar=root.querySelector('.fprogress i');
  function show(i){
    state.step=i;
    root.querySelectorAll('.q').forEach(function(q){q.classList.remove('on')});
    var qs=root.querySelectorAll('.q');
    if(qs[i])qs[i].classList.add('on');
    if(bar)bar.style.width=(i/3*100)+'%';
  }
  function pick(){
    var want=VIBES[state.vibe],cap=CAPS[state.budget];
    var best=null;
    SETS.forEach(function(s){if(s.price<=cap&&s.vibe<=want){if(!best||s.vibe>best.vibe||(s.vibe===best.vibe&&s.price>best.price))best=s;}});
    if(!best)best=SETS[0];
    var clamped=want>best.vibe;
    return{set:best,clamped:clamped};
  }
  function result(){
    var r=pick(),s=r.set;
    var fill=state.maint==='low'?'Plan on a refill every 4 to 5 weeks to keep them full.':'Most clients refill every 2 to 3 weeks to keep them perfect.';
    var why={
      classic:'One extension per natural lash. The "is that her real lashes?" set.',
      classic2d:'Classic, with a little extra texture woven in.',
      hybrid:'Half classic, half volume. Fuller than natural, softer than glam.',
      elegance:'Her in-between set: more presence than hybrid, still wearable every day.',
      volume:'Handmade fans for real fullness. The camera loves this set.',
      kimk:'Wispy spikes and texture. The Kim K effect, done tastefully.',
      mega:'Maximum density and drama. For the days you want to be seen from across the room.'
    }[s.id];
    var note=r.clamped?'This is the best match inside your '+CAP_LABEL[state.budget]+' budget. When you are ready to go bigger, the next step up is waiting.':'Right in your '+CAP_LABEL[state.budget]+' range.';
    root.querySelector('.fresult').innerHTML=
      '<div class="qlabel">Your match</div>'+
      '<div class="fmatch"><div class="fmatch-img"><img src="'+s.img+'" alt="'+s.name+' lash set"></div>'+
      '<div class="plan">'+s.name+' <span style="font-size:.5em;color:#b9ae9c">$'+s.price+'</span></div></div>'+
      '<p class="why">'+why+'</p>'+
      '<ul><li><span>Full set</span><span>$'+s.price+'</span></li>'+
      '<li><span>Appointment</span><span>'+s.time+'</span></li>'+
      '<li><span>Upkeep</span><span>'+(state.maint==='low'?'Every 4-5 weeks':'Every 2-3 weeks')+'</span></li></ul>'+
      '<p class="fine">'+fill+' '+note+' Final call is always yours and your stylist\u2019s at the appointment.</p>'+
      '<div class="row"><a class="btn gold" href="'+BOOK+'" target="_blank" rel="noopener">Book this set</a>'+
      '<button class="linklike" id="f-restart" type="button">Start over</button></div>';
    document.getElementById('f-restart').addEventListener('click',function(){state={vibe:null,maint:null,budget:null,step:0};show(0);});
    show(3);
    if(bar)bar.style.width='100%';
  }
  root.querySelectorAll('.opts button').forEach(function(b){
    b.addEventListener('click',function(){
      var q=b.closest('.q').getAttribute('data-q');
      state[q]=b.getAttribute('data-v');
      if(state.step===0)show(1);
      else if(state.step===1)show(2);
      else result();
    });
  });
  show(0);
})();
