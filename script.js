/* Revamps Studio v3: Harlan.
   Page behavior plus the working demo model.
   The demo is a model: a sample company, the same words, the same order,
   and the same timing a real caller gets. No libraries. */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FINE = window.matchMedia("(pointer: fine)").matches;

  /* ---------- mobile nav ---------- */
  var navToggle = $("navToggle"), mainNav = $("mainNav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var open = mainNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    mainNav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        mainNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- scroll reveals ---------- */
  var rvEls = document.querySelectorAll(".rv");
  if ("IntersectionObserver" in window && !RM) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    rvEls.forEach(function (el) { io.observe(el); });
  } else {
    rvEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- demo phone tilt (the one pointer-reactive piece) ---------- */
  var phone = $("phoneCustomer");
  if (phone && FINE && !RM) {
    var stage = document.querySelector(".demo-stage");
    phone.style.transition = "transform .25s cubic-bezier(.16,1,.3,1)";
    stage.addEventListener("pointermove", function (e) {
      var r = stage.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      phone.style.transform = "perspective(1100px) rotateY(" + (x * 5).toFixed(2) + "deg) rotateX(" + (-y * 5).toFixed(2) + "deg)";
    });
    stage.addEventListener("pointerleave", function () { phone.style.transform = ""; });
  }

  /* ================= the demo ================= */
  var msgs = $("msgs"), typing = $("typing"), chipsBox = $("chips"), chipRow = $("chipRow");
  var smsInput = $("smsInput");
  var ownerZone = $("ownerZone"), lockHint = $("lockHint");
  var calRows = $("calRows").children;

  var DISCLOSE = "Hi, this is Harlan, the AI assistant for Ridgeline Roofing. Sorry we missed your call. ";

  var SCENES = {
    leak: {
      clock: "6:40 PM", lockTime: "6:40", lockDate: "Tuesday, October 20",
      when: "Tuesday, 6:40 PM. Office closed at 5.",
      sub: "Scene one of three. You play the homeowner.",
      idleNote: "Tuesday, 6:40 PM. The office closed at 5. You are the homeowner, water is coming through your ceiling, and this is the company you called first.",
      callNote: "The office is dark. The crew is home. Let it ring out, the way it really happens.",
      town: "Franklin", score: 9, problemShort: "Active ceiling leak",
      opener: DISCLOSE + "What is going on with the roof?",
      steps: [
        { store: "problem",
          chips: ["Water is dripping through my ceiling", "There is a wet stain spreading upstairs", "Shingles blew off in the wind last night"],
          ask: "I am sorry, that is a rough evening. I can get an estimator out to look at it. What is the address?" },
        { store: "address",
          chips: ["418 Willow Bend Dr, Franklin", "In Franklin, off Hillsboro Rd"],
          ask: "Got it. And your name, so the estimator knows who they are meeting?" },
        { store: "name", chips: ["Elena Ruiz"] }
      ],
      slots: [
        { id: "calSlot1", label: "Wednesday 8:00 AM", short: "Wed 8:00 AM" },
        { id: "calSlot2", label: "Wednesday 11:30 AM", short: "Wed 11:30 AM" },
        { id: "calSlot3", label: "Wednesday 2:00 PM", short: "Wed 2:00 PM" }
      ],
      row4: "Sat 9:00 AM",
      row4Status: "Crew off. No estimates.",
      slotIntro: function (a) { return "Thanks, " + firstName(a.name) + ". Here are the open estimate times I can lock for you: "; },
      confirm: function (a, s) { return "Booked. " + s.label + ", at " + a.address + ". The estimator will text you before they head over. For tonight, a bucket under the drip and anything valuable moved out of the way will hold things until they see it."; },
      alertCls: "urgent",
      alertTitle: function (sc) { return "Hot lead, scored " + sc.score + " of 10"; },
      alertBody: function (a, s, sc) { return a.name + ", " + a.address + ". " + sc.problemShort + ", water coming in now. Estimate booked " + s.short + ". The full conversation is in the lead log."; },
      endTitle: "Booked, with the office closed.",
      endBody: "From missed call to a booked estimate, without one person in the office touching a phone. That is the whole product. The rest of this page shows how it works and what a missed call costs the business."
    },
    storm: {
      clock: "9:12 AM", lockTime: "9:12", lockDate: "Saturday, October 24",
      when: "Saturday, 9:12 AM. The crew is off for the weekend.",
      sub: "Scene two of three. A storm came through last night.",
      idleNote: "Saturday, 9:12 AM. A storm rolled through in the night, something hit your roof, and this is the company you called first. The crew is off. The office is shut.",
      callNote: "Saturday morning. The crew is off, the office is shut, and half the street is calling roofers. Let it ring out.",
      town: "Spring Hill", score: 10, problemShort: "Storm damage",
      opener: DISCLOSE + "Did the storm get you last night?",
      steps: [
        { store: "problem",
          chips: ["A tree limb came through the roof", "Half my shingles are in the yard", "Water is coming in around the chimney"],
          ask: "That goes to the top of our list. First, the address, so we know where to send help." },
        { store: "address",
          chips: ["27 Harvest Ln, Spring Hill", "Spring Hill, off Port Royal Rd"],
          ask: "Got it, and I have flagged the owner with this conversation already. And your name?" },
        { store: "name", chips: ["Tom Berger"] }
      ],
      earlyAlertAfter: "address",
      earlyAlert: { cls: "urgent", title: "Urgent lead, scored 10 of 10",
        body: function (a, sc) { return sc.problemShort + " at " + a.address + ". Booking the first estimate slot now. Full conversation is in the lead log."; } },
      slots: [
        { id: "calSlot1", label: "Monday 9:00 AM", short: "Mon 9:00 AM" },
        { id: "calSlot2", label: "Monday 1:30 PM", short: "Mon 1:30 PM" },
        { id: "calSlot3", label: "Tuesday 10:00 AM", short: "Tue 10:00 AM" }
      ],
      row4: "Today, Sat",
      row4Status: "Emergency dispatch only",
      slotIntro: function (a) { return "Thanks, " + firstName(a.name) + ". The owner has been paged right now to coordinate an emergency tarp for today. For the formal inspection, here are the first open times I can lock: "; },
      confirm: function (a, s) { return "Booked. " + s.label + ", at " + a.address + ", for the formal inspection. The emergency tarp for today is being coordinated by the owner now. If water is still coming in, keep clear of the ceiling in that room until the crew has seen it."; },
      alertCls: "good",
      alertTitle: function () { return "Estimate booked"; },
      alertBody: function (a, s, sc) { return a.name + ", " + a.address + ". " + sc.problemShort + ". Booked " + s.short + ". Score " + sc.score + " of 10."; },
      endTitle: "Booked, on a Saturday, with the crew off.",
      endBody: "A tree limb through the roof at 9 AM on a Saturday. No office, no crew, no voicemail. The owner knew within the minute, and the first estimate slot of the week carries this job."
    },
    price: {
      clock: "7:48 PM", lockTime: "7:48", lockDate: "Wednesday, October 21",
      when: "Wednesday, 7:48 PM. Office closed at 5.",
      sub: "Scene three of three. No emergency. A homeowner pricing a full replacement.",
      idleNote: "Wednesday, 7:48 PM. You are pricing a new roof, and this is the third company you have called tonight. The first two went to voicemail.",
      callNote: "Evening. The office closed at 5, and a price question does not wait for morning. Let it ring out.",
      town: "Franklin", score: 6, problemShort: "Full replacement quote",
      opener: DISCLOSE + "What can we help with?",
      steps: [
        { store: "problem",
          chips: ["What does a new roof cost?", "I need a price on a full replacement", "Just checking prices for now"],
          ask: "Fair question, and here is the honest answer: nobody can price a roof from a text. It depends on square footage, pitch, existing layers, and the condition of the decking underneath. What we can do is send an estimator to measure it and put an exact number in writing. That starts with the address." },
        { store: "address",
          chips: ["1120 Downs Blvd, Franklin", "Franklin, near Cool Springs"],
          ask: "And your name, for the appointment?" },
        { store: "name", chips: ["Greg Sanders"] }
      ],
      slots: [
        { id: "calSlot1", label: "Thursday 9:00 AM", short: "Thu 9:00 AM" },
        { id: "calSlot2", label: "Thursday 1:30 PM", short: "Thu 1:30 PM" },
        { id: "calSlot3", label: "Friday 10:00 AM", short: "Fri 10:00 AM" }
      ],
      row4: "Sat 9:00 AM",
      row4Status: "Crew off. No estimates.",
      slotIntro: function (a) { return "Thanks, " + firstName(a.name) + ". Open estimate times: "; },
      confirm: function (a, s) { return "Booked. " + s.label + ", at " + a.address + ". The estimator will measure the roof and leave you an exact price in writing."; },
      alertCls: "good",
      alertTitle: function (sc) { return "Estimate booked, scored " + sc.score + " of 10"; },
      alertBody: function (a, s, sc) { return a.name + ", " + sc.town + ". " + sc.problemShort + ". Booked " + s.short + ". Steady lead, not urgent."; },
      endTitle: "A price question, turned into an appointment.",
      endBody: "This homeowner called three companies tonight to ask one question. Two gave them a voicemail box. One answered in four seconds and put a time on the calendar. That is the company that gets to measure the roof."
    }
  };

  function firstName(n) { return (n || "there").split(" ")[0]; }

  var sceneKey = "leak", scene = SCENES.leak;
  var phase = "idle"; /* idle | calling | convo | slotoffer | done | closed */
  var stepIdx = 0, answers = {}, timers = [];
  var stats = { caught: 0, booked: 0, best: 0 };
  var bookedSlots = {};
  var ringTimer = null, respTimerInt = null, callStartedAt = 0, lastPrompt = "";
  var addrReasks = 0;

  function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
  function clearTimers() {
    timers.forEach(clearTimeout); timers = [];
    if (ringTimer) { clearInterval(ringTimer); ringTimer = null; }
    if (respTimerInt) { clearInterval(respTimerInt); respTimerInt = null; }
  }
  function botWait() { return RM ? 200 : 750 + Math.random() * 450; }

  function showView(id) {
    ["vIdle", "vCall", "vSms"].forEach(function (v) { $(v).classList.toggle("on", v === id); });
  }
  function scrollMsgs() { msgs.scrollTop = msgs.scrollHeight; }
  function addMsg(cls, text) {
    var d = document.createElement("div");
    d.className = "msg " + cls; d.textContent = text;
    msgs.insertBefore(d, typing); scrollMsgs(); return d;
  }
  function addNote(text) {
    var d = document.createElement("div");
    d.className = "note"; d.textContent = text;
    msgs.insertBefore(d, typing); scrollMsgs();
  }
  function setTyping(on) { typing.classList.toggle("on", on); if (on) scrollMsgs(); }

  function showChips(list) {
    chipRow.innerHTML = "";
    list.forEach(function (label) {
      var b = document.createElement("button");
      b.className = "chip"; b.type = "button"; b.textContent = label;
      b.addEventListener("click", function () { userSay(label); });
      chipRow.appendChild(b);
    });
    chipsBox.classList.add("on");
  }
  function hideChips() { chipsBox.classList.remove("on"); chipRow.innerHTML = ""; }

  function notify(cls, title, body) {
    var n = document.createElement("div");
    n.className = "notif" + (cls ? " " + cls : "");
    var nh = document.createElement("div"); nh.className = "nh";
    var l = document.createElement("span"); l.textContent = "Ridgeline Roofing";
    var r = document.createElement("span"); r.textContent = "now";
    nh.appendChild(l); nh.appendChild(r);
    var nt = document.createElement("div"); nt.className = "nt"; nt.textContent = title;
    var nb = document.createElement("div"); nb.className = "nb"; nb.textContent = body;
    n.appendChild(nh); n.appendChild(nt); n.appendChild(nb);
    ownerZone.appendChild(n);
    lockHint.style.display = "none";
  }

  function updateStats() {
    $("stCaught").textContent = stats.caught;
    $("stBooked").textContent = stats.booked;
    $("stScore").textContent = stats.best ? stats.best + " of 10" : "None yet";
  }

  function openSlots() {
    return scene.slots.filter(function (s) { return !bookedSlots[s.id]; });
  }

  /* ---------- flow ---------- */
  function startCall() {
    if (phase !== "idle") return;
    phase = "calling";
    showView("vCall");
    $("callNote").textContent = scene.callNote;
    $("callStatus").textContent = "Calling...";
    var t0 = Date.now();
    ringTimer = setInterval(function () {
      var s = Math.floor((Date.now() - t0) / 1000);
      $("callStatus").textContent = s < 1 ? "Calling..." : "Ringing... 0:" + (s < 10 ? "0" : "") + s;
      if (s >= 12) missedCall();
    }, 250);
  }

  function missedCall() {
    if (phase !== "calling") return;
    phase = "convo";
    if (ringTimer) { clearInterval(ringTimer); ringTimer = null; }
    $("btnMiss").classList.remove("ringing");
    showView("vSms");
    callStartedAt = Date.now();
    $("respTimer").textContent = RM ? "--" : "0.0 sec";
    if (!RM) {
      respTimerInt = setInterval(function () {
        $("respTimer").textContent = ((Date.now() - callStartedAt) / 1000).toFixed(1) + " sec";
      }, 100);
    }
    setTyping(true);
    later(function () {
      if (respTimerInt) { clearInterval(respTimerInt); respTimerInt = null; }
      $("respTimer").textContent = "4.0 sec";
      setTyping(false);
      stats.caught++; updateStats();
      addNote("Missed call, " + scene.clock + ", auto-reply sent in 4.0s");
      addMsg("them", scene.opener);
      lastPrompt = scene.opener;
      stepIdx = 0;
      showChips(scene.steps[0].chips);
    }, RM ? 900 : 4000);
  }

  function botSay(text, after) {
    setTyping(true);
    later(function () { setTyping(false); addMsg("them", text); if (after) after(); }, botWait());
  }

  function currentAsk() { return lastPrompt || scene.opener; }

  function slotOfferText() {
    var list = openSlots().map(function (s) { return s.label; }).join(", ");
    return scene.slotIntro(answers) + list + ". Which one works for you?";
  }

  function offerSlots() {
    phase = "slotoffer";
    var list = openSlots();
    if (!list.length) {
      botSay("Every open slot in this model is booked now. Run it again below to start fresh.", function () { phase = "done"; });
      return;
    }
    botSay(slotOfferText(), function () {
      lastPrompt = slotOfferText();
      showChips(list.map(function (s) { return s.label; }));
    });
  }

  function advance() {
    var step = scene.steps[stepIdx];
    if (scene.earlyAlertAfter && step.store === scene.earlyAlertAfter && scene.earlyAlert) {
      notify(scene.earlyAlert.cls, scene.earlyAlert.title, scene.earlyAlert.body(answers, scene));
    }
    stepIdx++;
    if (stepIdx >= scene.steps.length) { offerSlots(); return; }
    var next = scene.steps[stepIdx];
    botSay(step.ask, function () { lastPrompt = step.ask; showChips(next.chips); });
  }

  function matchSlot(text) {
    var t = text.toLowerCase(), list = openSlots();
    var byTime = function (frag) { return list.filter(function (s) { return s.label.toLowerCase().indexOf(frag) > -1; })[0]; };
    if (t.indexOf("11:30") > -1) return byTime("11:30");
    if (t.indexOf("1:30") > -1) return byTime("1:30");
    if (t.indexOf("8:00") > -1 || t.indexOf("8 am") > -1) return byTime("8:00");
    if (t.indexOf("9:00") > -1 || t.indexOf("9 am") > -1) return byTime("9:00");
    if (t.indexOf("10:00") > -1 || t.indexOf("10 am") > -1) return byTime("10:00");
    if (t.indexOf("2:00") > -1 || t.indexOf("2 pm") > -1) return byTime("2:00");
    if (t.indexOf("morning") > -1) return list.filter(function (s) { return /8:00|9:00|10:00/.test(s.label); })[0] || list[0];
    if (t.indexOf("afternoon") > -1) return list.filter(function (s) { return /1:30|2:00/.test(s.label); })[0] || list[0];
    var days = ["monday", "tuesday", "wednesday", "thursday", "friday"];
    for (var i = 0; i < days.length; i++) {
      if (t.indexOf(days[i]) > -1) {
        var hit = list.filter(function (s) { return s.label.toLowerCase().indexOf(days[i]) > -1; });
        if (hit.length) return hit[0];
      }
    }
    return null;
  }

  function book(slot) {
    phase = "done";
    bookedSlots[slot.id] = true;
    stats.booked++; if (scene.score > stats.best) stats.best = scene.score;
    updateStats();
    var statusEl = $(slot.id);
    statusEl.className = "appt";
    statusEl.textContent = answers.name + ", " + scene.problemShort;
    notify(scene.alertCls, scene.alertTitle(scene), scene.alertBody(answers, slot, scene));
    $("leadLine").textContent = scene.clock + ", " + answers.name + ", " + scene.town + ", " + scene.problemShort +
      ", Score " + scene.score + " of 10, Booked " + slot.short + ". The full conversation is in the record.";
    botSay(scene.confirm(answers, slot), function () {
      addNote("Estimate booked, " + slot.label);
      $("demoEndTitle").textContent = scene.endTitle;
      $("demoEndBody").textContent = scene.endBody;
      later(function () { $("demoEnd").classList.add("show"); }, 700);
    });
  }

  function optOutClose() {
    phase = "closed"; hideChips();
    botSay("Understood, we will not text you again. If you need roof work down the road, you can reach us anytime.", function () {
      $("demoEndTitle").textContent = "Opted out, cleanly.";
      $("demoEndBody").textContent = "One STOP and the conversation ends, for good. The number is flagged so the system never texts it again. That is not a courtesy extra. It is the law, and the system treats it that way.";
      later(function () { $("demoEnd").classList.add("show"); }, 700);
    });
  }

  function closePolitely() {
    phase = "closed"; hideChips();
    botSay("No problem at all. Thanks for calling Ridgeline Roofing. If you need roof work down the road, you can reach us anytime.", function () {
      $("demoEndTitle").textContent = "And that is a fine ending too.";
      $("demoEndBody").textContent = "Not every caller books. The point is that every caller gets an answer in seconds, in your voice, and the serious ones land on your calendar instead of the next company on Google.";
      later(function () { $("demoEnd").classList.add("show"); }, 700);
    });
  }

  function userSay(raw) {
    var text = (raw || "").trim();
    if (!text) return;
    if (phase !== "convo" && phase !== "slotoffer") return;
    smsInput.value = "";
    hideChips();
    addMsg("me", text);
    var t = text.toLowerCase();

    if (/\bstop\b|unsubscribe/.test(t)) { optOutClose(); return; }
    if (/not interested|no thanks|leave me alone/.test(t)) { closePolitely(); return; }

    if (/human|real person|actual person|someone real|call me|ring me|speak to (a|the) owner|talk to (a|the) owner/.test(t)) {
      notify("", "Caller asked for a human", (answers.name || "A caller") + " asked for a person. The conversation is in the lead log, ready to pick up.");
      botSay("Of course. I have flagged the owner with this whole conversation, and they will pick it up from here. One quick thing so they have it in front of them: " + currentAsk(), function () {
        if (phase === "slotoffer") showChips(openSlots().map(function (s) { return s.label; }));
        else showChips(scene.steps[stepIdx].chips);
      });
      return;
    }

    if (phase === "slotoffer") {
      var slot = matchSlot(text);
      if (slot) { book(slot); return; }
      botSay("I did not catch that one. The open times are " + openSlots().map(function (s) { return s.label; }).join(", ") + ". Tap one, or type the time.", function () {
        showChips(openSlots().map(function (s) { return s.label; }));
      });
      return;
    }

    if (/(price|cost|how much|quote|charge)/.test(t) && sceneKey !== "price" && stepIdx === 0) {
      answers[scene.steps[0].store] = text;
      botSay("Honest answer: nobody can price a roof from a text. An estimator measures it and puts an exact number in writing. I can book that visit now. " + scene.steps[0].ask, function () {
        showChips(scene.steps[1] ? scene.steps[1].chips : []);
        stepIdx = 1;
      });
      return;
    }

    var step = scene.steps[stepIdx];

    if (text.indexOf("?") > -1 && (step.store === "address" || step.store === "name")) {
      botSay("Good question. The owner can cover that properly when they pick this up. So they have everything ready: " + currentAsk(), function () {
        showChips(step.chips);
      });
      return;
    }

    if (step.store === "address" && !/\d/.test(text) && addrReasks === 0) {
      addrReasks++;
      botSay("I want the estimator to find the right house. What is the street number and street name?", function () {
        showChips(step.chips);
      });
      return;
    }

    if (step.store === "name") {
      var nm = text.replace(/^(my name is|i am|i'm|im|it's|it is|this is)\s+/i, "").trim();
      nm = nm.replace(/(^|\s)\S/g, function (m) { return m.toUpperCase(); });
      answers.name = nm;
    } else {
      answers[step.store] = text;
    }
    advance();
  }

  /* ---------- reset and scene control ---------- */
  function resetRun(key) {
    clearTimers();
    sceneKey = key; scene = SCENES[key];
    phase = "idle"; stepIdx = 0; answers = {}; bookedSlots = {}; addrReasks = 0;
    stats = { caught: 0, booked: 0, best: 0 }; updateStats();
    msgs.innerHTML = ""; msgs.appendChild(typing); setTyping(false); hideChips();
    smsInput.value = "";
    ownerZone.innerHTML = ""; lockHint.style.display = "";
    $("custClock").textContent = scene.clock;
    $("ownClock").textContent = scene.clock;
    $("lockTime").textContent = scene.lockTime;
    $("lockDate").textContent = scene.lockDate;
    $("sceneWhen").textContent = scene.when;
    $("sceneSub").textContent = scene.sub;
    $("respTimer").textContent = "--";
    $("stageLede").textContent = scene.idleNote;
    $("callNote").textContent = scene.callNote;
    $("callStatus").textContent = "Calling...";
    $("btnMiss").classList.remove("ringing");
    scene.slots.forEach(function (s) {
      var statusEl = $(s.id);
      statusEl.className = "open"; statusEl.textContent = "Open";
      statusEl.parentElement.firstElementChild.textContent = s.short;
    });
    var row4El = $("calRow4");
    row4El.firstElementChild.textContent = scene.row4;
    $("calRow4Status").textContent = scene.row4Status;
    if (key === "storm") $("calRows").insertBefore(row4El, $("calRows").firstChild);
    else $("calRows").appendChild(row4El);
    $("leadLine").textContent = "The lead log is empty. Run a scene and watch the first entry land here, scored and written down.";
    $("demoEnd").classList.remove("show");
    document.querySelectorAll(".scene-tab").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-scene") === key);
    });
    showView("vIdle");
  }

  $("btnStartCall").addEventListener("click", startCall);
  $("btnMiss").addEventListener("click", missedCall);
  $("smsSend").addEventListener("click", function () { userSay(smsInput.value); });
  smsInput.addEventListener("keydown", function (e) { if (e.key === "Enter") userSay(smsInput.value); });
  $("btnReplay").addEventListener("click", function () { resetRun(sceneKey); });
  document.querySelectorAll(".scene-tab").forEach(function (b) {
    b.addEventListener("click", function () { resetRun(b.getAttribute("data-scene")); });
  });

  resetRun("leak");
})();
