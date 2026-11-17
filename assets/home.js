/* PAGAR homepage motion (17 Nov 2026, third pass). Loaded by index.html only.
   - Hero numbers count up once ("5-in-1" from 1, "100%" from 0), ending on the exact original text.
   - The "100%" in Why Pagar counts up when it scrolls into view.
   - The launch band ("Coming soon. Public launch November 2026.") becomes a moving ticker. The
     original words stay first and are the only copy screen readers hear; the repeats are hidden.
   - Cards: a soft light follows the cursor and the card tilts slightly (mouse only).
   - The coverage map draws its routes when it scrolls into view.
   With reduced motion none of this runs and the page stays as written. The hero's opening
   animation is pure CSS, switched on by the "motion" class set in the page head. */
(function () {
  var calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (calm) return;
  var io = "IntersectionObserver" in window;

  /* ---- count-ups ---- */
  function countUp(el, from, to, fmt, delay, dur) {
    var final = el.textContent;
    el.textContent = fmt(from);
    setTimeout(function () {
      var t0 = null;
      function step(t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        el.textContent = k < 1 ? fmt(Math.round(from + (to - from) * e)) : final;
        if (k < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }, delay);
  }
  [].forEach.call(document.querySelectorAll(".homehero .stat .n"), function (n, i) {
    var t = n.textContent.trim();
    if (t === "100%") countUp(n, 0, 100, function (v) { return v + "%"; }, 700 + i * 90, 1300);
    else if (t === "5-in-1") countUp(n, 1, 5, function (v) { return v + "-in-1"; }, 700 + i * 90, 900);
  });
  var big = document.querySelector("#why .card.lead .big");
  if (big && io && big.textContent.trim() === "100%") {
    big.textContent = "0%";
    var bo = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; bo.disconnect(); big.textContent = "100%";
      countUp(big, 0, 100, function (v) { return v + "%"; }, 150, 1500);
    }, { threshold: .5 });
    bo.observe(big);
  }

  /* ---- launch ticker ---- */
  var band = document.querySelector("main section.launchband, section.launchband");
  if (band) {
    var wrap = band.querySelector(".wrap");
    var group = document.createElement("div"); group.className = "tkgroup";
    while (wrap.firstChild) group.appendChild(wrap.firstChild);
    var extra = [["Food", "Pagkain"], ["Ride", "Sakay"], ["Package", "Padala"], ["Market", "Palengke"], ["Pabili", "Pabili"], ["Marawi City", "Marawi City"]];
    var lang = document.documentElement.lang === "fil" ? 1 : 0;
    extra.forEach(function (w) {
      var dot = document.createElement("i"); dot.className = "tkdot"; dot.setAttribute("aria-hidden", "true"); group.appendChild(dot);
      var s = document.createElement("span"); s.className = "tkword"; s.setAttribute("aria-hidden", "true");
      s.setAttribute("data-en", w[0]); s.setAttribute("data-fil", w[1]); s.textContent = w[lang]; group.appendChild(s);
    });
    var dot2 = document.createElement("i"); dot2.className = "tkdot"; dot2.setAttribute("aria-hidden", "true"); group.appendChild(dot2);
    var track = document.createElement("div"); track.className = "tktrack"; track.appendChild(group);
    for (var c = 0; c < 3; c++) { var g = group.cloneNode(true); g.setAttribute("aria-hidden", "true"); track.appendChild(g); }
    wrap.appendChild(track); band.classList.add("ticking");
  }

  /* ---- cursor light + tilt on cards (mouse only) ---- */
  var fine = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (fine) {
    [].forEach.call(document.querySelectorAll("main .card, main .appcard"), function (card) {
      if (card.closest(".journey, .hero")) return;
      card.classList.add("glow");
      var raf = 0, ev = null;
      card.addEventListener("pointermove", function (e) {
        ev = e; if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = 0; var r = card.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
          card.style.setProperty("--mx", (x * 100).toFixed(1) + "%"); card.style.setProperty("--my", (y * 100).toFixed(1) + "%");
          card.style.transform = "perspective(900px) translateY(-4px) rotateX(" + ((.5 - y) * 5).toFixed(2) + "deg) rotateY(" + ((x - .5) * 5).toFixed(2) + "deg)";
        });
      });
      card.addEventListener("pointerleave", function () { card.style.transform = ""; });
    });
  }

  /* ---- coverage routes ---- */
  var map = document.querySelector(".covmap");
  if (map && io) {
    map.classList.add("wait");
    var mo = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; mo.disconnect(); map.classList.remove("wait"); map.classList.add("draw");
    }, { threshold: .4 });
    mo.observe(map);
  }
})();
