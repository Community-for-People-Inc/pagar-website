/* PAGAR website — rider earnings calculator (17 Nov 2026), Partners page, driver view. It fills an empty
   <div data-tool="earnings">; without JavaScript the div stays empty and nothing else changes.
   It uses the public city fare: ₱30 flat for a tricycle inside Marawi (City Ordinance 043-07), which
   the rider keeps whole. */
(function () {
  var FARE = 30;
  var calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function peso(n) { return Math.round(n * 100) / 100; }
  function money(n, cents) {
    var v = cents ? peso(n).toFixed(2) : String(Math.round(n));
    return "₱" + v.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  /* numbers glide to their new value instead of jumping */
  function tween(el, to, cents) {
    var from = parseFloat(el.getAttribute("data-v") || "0");
    el.setAttribute("data-v", String(to));
    if (calm || from === to) { el.textContent = money(to, cents); return; }
    var t0 = null;
    (function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / 450), e = 1 - Math.pow(1 - k, 3);
      el.textContent = money(from + (to - from) * e, cents);
      if (k < 1) requestAnimationFrame(step);
    })(performance.now());
  }
  var uid = 0;
  function id(p) { return "pt-" + p + "-" + (++uid); }

  /* ---------- rider earnings ---------- */
  function earningsTool(box) {
    var a = id("trips"), b = id("days");
    box.className += " ptool";
    box.innerHTML =
      '<div class="pt-in">' +
        '<label class="pt-lbl" for="' + a + '">Trips a day <b class="pt-tv">15</b></label>' +
        '<input type="range" id="' + a + '" min="1" max="40" step="1" value="15">' +
        '<div class="pt-scale" aria-hidden="true"><span>1</span><span>40</span></div>' +
        '<label class="pt-lbl" for="' + b + '">Days a week <b class="pt-dv">6</b></label>' +
        '<input type="range" id="' + b + '" min="1" max="7" step="1" value="6">' +
        '<div class="pt-scale" aria-hidden="true"><span>1</span><span>7</span></div>' +
      '</div>' +
      '<div class="pt-out" aria-live="polite">' +
        '<div class="pt-total"><small>You keep, a week</small><b class="pt-week">₱0</b></div>' +
        '<div class="pt-split">' +
          '<div><i class="dot r"></i><span>A day</span><b class="pt-day">₱0</b></div>' +
          '<div><i class="dot g"></i><span>A month (about)</span><b class="pt-month">₱0</b></div>' +
        '</div>' +
        '<p class="pt-note">At the ₱30 city fare. Pagar\'s fee is paid by the customer on top, so it never comes out of your fare, and every tip is yours. Before fuel and your own costs. Longer trips beyond the city earn more.</p>' +
      '</div>';
    var t = box.querySelector("#" + a), d = box.querySelector("#" + b), tv = box.querySelector(".pt-tv"), dv = box.querySelector(".pt-dv"),
        wk = box.querySelector(".pt-week"), dy = box.querySelector(".pt-day"), mo = box.querySelector(".pt-month");
    function update() {
      var trips = +t.value, days = +d.value, day = trips * FARE, week = day * days, month = week * 52 / 12;
      tv.textContent = trips; dv.textContent = days;
      t.style.setProperty("--p", ((trips - 1) / 39 * 100) + "%"); d.style.setProperty("--p", ((days - 1) / 6 * 100) + "%");
      tween(wk, week, false); tween(dy, day, false); tween(mo, Math.round(month / 10) * 10, false);
    }
    t.addEventListener("input", update); d.addEventListener("input", update); update();
  }

  function init() {
    [].forEach.call(document.querySelectorAll('[data-tool="earnings"]'), earningsTool);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
