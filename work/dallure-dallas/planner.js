/* D'Allure "Build your custom plan" recommendation engine. Pure logic, no DOM. */
(function (root, factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) { module.exports = api; }
  else { root.DallurePlan = api; }
})(typeof self !== "undefined" ? self : this, function () {

  function T(name, img) { return { name: name, img: img }; }
  var IMG = {
    facial: "assets/img/dallure-18.webp",
    peel: "assets/img/dallure-19.webp",
    micro: "assets/img/dallure-20.webp",
    prp: "assets/img/dallure-21.webp",
    laser: "assets/img/dallure-25.webp",
    botox: "assets/img/dallure-30.webp",
    filler: "assets/img/dallure-05.webp",
    sculptra: "assets/img/dallure-30.webp",
    hair: "assets/img/dallure-25.webp",
    consult: "assets/img/dallure-01.webp"
  };

  function plan(title, treatments, why) {
    return { title: title, treatments: treatments, why: why };
  }

  var PLANS = {
    /* concern: lines | volume | tone | hair | upkeep */
    /* goal: quick | natural | transform */
    "lines-quick": plan("The quick refresh",
      [T("Botox Cosmetic", IMG.botox), T("Dysport", IMG.botox)],
      "For expression lines, neuromodulators are the fastest fix Brandy offers. Most clients are in and out on a lunch break, with results settling in over the following week."),
    "lines-natural": plan("Softened, not frozen",
      [T("Botox Cosmetic", IMG.botox), T("D'Allure Signature Facial", IMG.facial)],
      "Brandy's philosophy is refresh, not change. A conservative neuromodulator dose paired with her signature facial keeps everything looking like you, on a good day."),
    "lines-transform": plan("The full reset",
      [T("Botox Cosmetic", IMG.botox), T("Sculptra Aesthetic", IMG.sculptra), T("Chemical peel", IMG.peel)],
      "Lines, volume loss, and texture together call for a layered plan. Neuromodulator for movement, Sculptra for gradual structure, and a peel to resurface. Staged across visits, mapped at your consult."),
    "volume-quick": plan("Subtle structure",
      [T("Dermal fillers", IMG.filler)],
      "A single filler visit restores the volume time takes from lips, cheeks, or under-eyes. Brandy places for balance first, so the change reads as rested, not done."),
    "volume-natural": plan("Your face, supported",
      [T("Dermal fillers", IMG.filler), T("SkinVive by Juvederm", IMG.filler)],
      "Filler for shape where it counts, SkinVive for skin quality everywhere else. The combination keeps the result natural because the skin itself looks better too."),
    "volume-transform": plan("Rebuilt gradually",
      [T("Sculptra Aesthetic", IMG.sculptra), T("Dermal fillers", IMG.filler)],
      "Sculptra rebuilds your own collagen over months while filler handles what needs attention now. It is the long game, and for the right face it is the best one."),
    "tone-quick": plan("Glow, same day",
      [T("HydraFacial", IMG.facial)],
      "The HydraFacial is Brandy's answer when you need to look good this week. Deep cleanse, exfoliation, hydration, zero downtime, glow you can see the same day."),
    "tone-natural": plan("Skin health first",
      [T("D'Allure Signature Facial", IMG.facial), T("Chemical peel", IMG.peel)],
      "True beauty starts with healthy skin, and this is that belief as a plan. Customized facials plus a light peel series to keep tone even and texture smooth."),
    "tone-transform": plan("Texture, rebuilt",
      [T("Microneedling with PRP", IMG.prp), T("Laser facial", IMG.laser)],
      "For scarring, deep texture, or sun damage, Brandy reaches for the serious tools. Microneedling with PRP rebuilds from within; laser facials clear what sits on the surface."),
    "hair-quick": plan("Start the series",
      [T("Laser hair removal", IMG.hair)],
      "Laser hair removal is a series, not a single visit, so the quickest win is starting now. Most clients see real reduction within the first few sessions."),
    "hair-natural": plan("Smooth, steadily",
      [T("Laser hair removal", IMG.hair)],
      "One area, one series, done properly. Brandy's laser protocols are built around your skin type, so the result is smooth without the irritation."),
    "hair-transform": plan("Every area, handled",
      [T("Laser hair removal", IMG.hair), T("D'Allure Signature Facial", IMG.facial)],
      "Full series across every area you want handled, plus facials to keep the skin itself in top shape while you go."),
    "upkeep-quick": plan("The maintenance facial",
      [T("D'Allure Signature Facial", IMG.facial)],
      "Great skin is maintenance, not miracles. A standing facial appointment keeps everything Brandy has built for you working."),
    "upkeep-natural": plan("Your custom routine",
      [T("Free confidential consultation", IMG.consult), T("D'Allure Signature Facial", IMG.facial)],
      "This is where D'Allure's custom skincare plans start. Brandy maps your skin, your products, and your in-office cadence in one free consultation."),
    "upkeep-transform": plan("The membership path",
      [T("Free confidential consultation", IMG.consult), T("D'Allure Signature Facial", IMG.facial), T("Chemical peel", IMG.peel)],
      "For clients who want it all handled, the membership path bundles facials, peels, and priority booking. One plan, all year, skin that never has an off month.")
  };

  function recommend(concern, goal) {
    return PLANS[concern + "-" + goal] || PLANS["upkeep-natural"];
  }

  return { recommend: recommend };
});
