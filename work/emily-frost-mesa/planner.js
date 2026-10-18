/* Frost Aesthetics "Find your plan" recommendation engine.
   Pure logic, no DOM. concern: lines | lips | tone | everything
   timeline: month | season | norush ; budget: under500 | mid | plus
   Price ranges shown are typical ranges from a third-party directory.
   Emily's site publishes no price list. */
(function (root, factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) { module.exports = api; }
  else { root.FrostPlan = api; }
})(typeof self !== "undefined" ? self : this, function () {

  var DISCLAIMER = "Emily confirms your exact plan at a consult.";

  var T = {
    botox: "Botox",
    filler: "Dermal fillers",
    dysport: "Dysport / Jeuveau",
    moxi: "Moxi",
    bbl: "BBL Heroic",
    co2: "CO2 laser",
    virtue: "Virtue RF series",
    facial: "Frost Glow Facial",
    zo: "ZO Skin Health plan",
    consult: "Lip filler consult"
  };

  function plan(title, treatments, typical, why) {
    return { title: title, treatments: treatments, typical: typical, why: why, disclaimer: DISCLAIMER };
  }

  function lines(timeline, budget) {
    var tx = [T.botox], typical = "$300-$500", title = "The line softener";
    var why = "Botox is the fastest, most predictable fix for expression lines in the forehead, between the brows, and around the eyes.";
    if (budget === "mid") { tx.push(T.facial); typical = "$300-$500, plus facial"; why += " Paired with the Frost Glow Facial, you leave the same day looking rested."; }
    if (budget === "plus") { tx.push(T.filler); typical = "$300-$500 + $600-$800"; title = "The full refresh"; why += " Dermal filler supports the deeper lines Botox alone cannot relax. This is the combination Emily teaches other injectors."; }
    if (timeline === "season" && budget !== "under500") { tx.push(T.moxi); why += " A season gives Moxi room to rebuild skin quality between visits."; }
    if (timeline === "norush" && budget === "plus") { tx.push(T.virtue); why += " With no rush, a Virtue RF series tightens everything underneath over the coming months."; }
    if (timeline === "norush" && budget !== "plus") { tx.push(T.zo); why += " With no rush, a medical-grade ZO plan does half the work at home."; }
    if (budget === "under500") { why += " It lands inside your range, with nothing wasted."; }
    return plan(title, tx, typical, why);
  }

  function lips(timeline, budget) {
    var pace = timeline === "month"
      ? " Most clients see their result within days."
      : timeline === "season"
        ? " A season gives room to stage and refine."
        : " With no rush, it can be refined over two visits.";
    if (budget === "under500") {
      return plan("Lips, honestly", [T.consult, T.facial], "Filler typically $600-$800",
        "Lip filler typically runs $600-$800, just above your range. The honest start is a consult plus the Frost Glow Facial, so you leave glowing while you decide." + pace);
    }
    if (budget === "mid") {
      return plan("Natural lips", [T.filler], "$600-$800",
        "The result Emily's clients quote most: lips that still look like their lips. Filler placed for shape and balance, never overdone." + pace);
    }
    return plan("Lips, perfected", [T.filler, T.dysport], "$600-$800+",
      "Filler for shape and volume, plus a neuromodulator to soften the lip line and lift the corners. Staged across visits, mapped at your consult." + pace);
  }

  function tone(timeline, budget) {
    if (budget === "under500") {
      return plan("Start with the surface", [T.facial], "Confirmed at your consult",
        "Laser series start above $500, so the honest start is the Frost Glow Facial: visible glow, no downtime, and a real plan for what comes next.");
    }
    if (budget === "mid") {
      if (timeline === "month") {
        return plan("Moxi, the lunch-break laser", [T.moxi], "Confirmed at your consult",
          "Moxi fits a busy month: little downtime, and tone and texture keep improving for weeks after.");
      }
      if (timeline === "season") {
        return plan("Tone, then pigment", [T.moxi, T.bbl], "Confirmed at your consult",
          "Moxi rebuilds texture while BBL Heroic clears pigment and redness. A season is exactly the right window for the pair.");
      }
      return plan("Slow and thorough", [T.moxi, T.zo], "Confirmed at your consult",
        "Moxi plus a medical-grade ZO plan. With no rush, the skincare does half the work at home.");
    }
    if (timeline === "month") {
      return plan("The tone reset", [T.moxi, T.bbl], "Confirmed at your consult",
        "Moxi plus BBL Heroic: texture and pigment handled together, with downtime that still fits a calendar.");
    }
    if (timeline === "season") {
      return plan("The full tone plan", [T.moxi, T.bbl, T.zo], "Confirmed at your consult",
        "Moxi and BBL Heroic for the clinic work, a ZO plan for the other 364 days. The complete approach Emily puts her own clients on.");
    }
    return plan("The deep reset", [T.co2, T.zo], "Confirmed at your consult",
      "CO2 is the most powerful resurfacing Emily offers, and it needs real downtime. With no rush, it is worth it, supported by a ZO plan before and after.");
  }

  function everything(timeline, budget) {
    if (budget === "under500") {
      return plan("The honest start", [T.botox], "$300-$500",
        "With a bit of everything and a focused budget, Emily starts where change shows most: Botox. The rest gets mapped at your consult.");
    }
    if (budget === "mid") {
      var tx = [T.botox, T.facial], typical = "$300-$500, plus facial";
      var why = "Botox quiets the lines while the Frost Glow Facial resets the surface. The two together read as one rested face.";
      if (timeline === "season") { tx.push(T.moxi); why += " A season leaves room for Moxi to rebuild texture between visits."; }
      if (timeline === "norush") { tx.push(T.zo); why += " With no rush, a ZO plan keeps improving things at home."; }
      return plan("Lines plus glow", tx, typical, why);
    }
    var tx2 = [T.botox, T.filler], typical2 = "$300-$500 + $600-$800", title2 = "The full refresh";
    var why2 = "Botox for the lines, filler for the volume loss. The core combination behind most of Emily's natural-looking transformations.";
    if (timeline === "season") { tx2.push(T.moxi); why2 += " A season leaves room for Moxi to rebuild texture between visits."; }
    if (timeline === "norush") { tx2.push(T.virtue); title2 = "The long game"; why2 += " With no rush, a Virtue RF series tightens everything underneath over the coming months. This is the plan Emily's long-term clients live on."; }
    return plan(title2, tx2, typical2, why2);
  }

  function recommend(concern, timeline, budget) {
    var c = String(concern || ""), t = String(timeline || ""), b = String(budget || "");
    if (c === "lines") return lines(t, b);
    if (c === "lips") return lips(t, b);
    if (c === "tone") return tone(t, b);
    if (c === "everything") return everything(t, b);
    return plan("Start with a consult", [T.facial], "Confirmed at your consult",
      "Tell Emily what bothers you most and she will map the honest plan from there.");
  }

  return { recommend: recommend, DISCLAIMER: DISCLAIMER };
});
