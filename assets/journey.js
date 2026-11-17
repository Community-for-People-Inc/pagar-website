/* PAGAR homepage — "ride along" scroll journey (#how).
   The section is tall; its stage sticks to the screen while you scroll through it. A winding road
   is drawn to fit the stage, a Pagar tricycle drives along it with the scroll, slows at each stop,
   and the stop's card comes up. Without JS, or with reduced motion, the section is a plain list of
   the same cards (class "static"). */
(function () {
  var sec = document.getElementById("how");
  if (!sec) return;
  var calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (calm || !document.createElementNS || !("getTotalLength" in document.createElementNS("http://www.w3.org/2000/svg", "path"))) {
    sec.classList.add("static"); return;
  }
  sec.classList.add("live");
  var stage = sec.querySelector(".jstage"), svg = sec.querySelector(".jroad");
  var road = svg.querySelector(".road"), edge = svg.querySelector(".edge"), lane = svg.querySelector(".lane"), done = svg.querySelector(".done");
  var rider = svg.querySelector(".rider"), lamp = svg.querySelector(".lamp"), pinsG = svg.querySelector(".pins");
  var cards = [].slice.call(sec.querySelectorAll(".jcard"));
  var count = sec.querySelector(".jcount b"), bar = sec.querySelector(".jbar i");
  var N = cards.length, len = 0, stopLen = [], W = 0, H = 0, mobile = false, pins = [], last = -1, ticking = false;

  function catmull(p) {
    var d = "M" + p[0][0] + " " + p[0][1];
    for (var i = 0; i < p.length - 1; i++) {
      var p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
      d += " C" + (p1[0] + (p2[0] - p0[0]) / 6) + " " + (p1[1] + (p2[1] - p0[1]) / 6) + " " +
           (p2[0] - (p3[0] - p1[0]) / 6) + " " + (p2[1] - (p3[1] - p1[1]) / 6) + " " + p2[0] + " " + p2[1];
    }
    return d;
  }
  function build() {
    W = stage.clientWidth; H = stage.clientHeight; mobile = W < 760;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    var f = mobile
      ? [[.2, .30], [.78, .37], [.24, .45], [.76, .52], [.26, .59], [.72, .66]]
      : [[.07, .80], [.24, .44], [.42, .76], [.6, .42], [.78, .74], [.93, .46]];
    var pts = f.map(function (q) { return [q[0] * W, q[1] * H]; });
    var d = catmull(pts);
    [road, edge, lane, done].forEach(function (p) { p.setAttribute("d", d); });
    len = road.getTotalLength();
    // where each stop sits along the road
    stopLen = pts.map(function (pt) {
      var best = 0, bd = 1e9;
      for (var s = 0; s <= 600; s++) {
        var L = len * s / 600, q = road.getPointAtLength(L), dd = (q.x - pt[0]) * (q.x - pt[0]) + (q.y - pt[1]) * (q.y - pt[1]);
        if (dd < bd) { bd = dd; best = L; }
      }
      return best;
    });
    stopLen[0] = 0; stopLen[N - 1] = len;
    done.style.strokeDasharray = len + " " + len;
    pinsG.innerHTML = "";
    pins = pts.map(function (pt, i) {
      var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "pin");
      g.setAttribute("transform", "translate(" + pt[0] + " " + pt[1] + ")");
      g.innerHTML = '<circle r="15"></circle><text y="5" text-anchor="middle">' + (i + 1) + "</text>";
      pinsG.appendChild(g);
      return g;
    });
    // card placement: beside its stop on desktop, one shared slot under the road on phones
    cards.forEach(function (c, i) {
      if (mobile) { c.style.left = "16px"; c.style.top = (H * .71) + "px"; c.style.width = (W - 32) + "px"; return; }
      c.style.width = "";
      var cw = c.offsetWidth || 300, ch = c.offsetHeight || 150, pt = pts[i];
      var x = Math.max(16, Math.min(W - cw - 16, pt[0] - cw / 2));
      var y = pt[1] > H * .6 ? pt[1] - ch - 44 : pt[1] + 44;
      c.style.left = x + "px"; c.style.top = Math.max(H * .22, Math.min(H - ch - 16, y)) + "px";
    });
    last = -1; update();
  }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function update() {
    ticking = false;
    var r = sec.getBoundingClientRect(), total = sec.offsetHeight - window.innerHeight;
    var s = Math.max(0, Math.min(1, -r.top / Math.max(1, total)));
    // travel between stops eases in and out, so the tricycle settles at each stop
    var seg = s * (N - 1), k = Math.min(N - 2, Math.floor(seg)), t = smooth(Math.min(1, Math.max(0, (seg - k) * 1.25)));
    var L = stopLen[k] + (stopLen[k + 1] - stopLen[k]) * t;
    var a = road.getPointAtLength(L), b = road.getPointAtLength(Math.min(len, L + 2)), c0 = road.getPointAtLength(Math.max(0, L - 2));
    var ang = Math.atan2(b.y - c0.y, b.x - c0.x) * 180 / Math.PI;
    rider.setAttribute("transform", "translate(" + a.x + " " + a.y + ") rotate(" + ang + ")");
    lamp.setAttribute("cx", a.x); lamp.setAttribute("cy", a.y);
    done.style.strokeDashoffset = (len - L);
    var at = 0;
    for (var i = 0; i < N; i++) if (L >= stopLen[i] - 6) at = i;
    pins.forEach(function (p, i) { p.classList.toggle("passed", i <= at); p.classList.toggle("here", i === at); });
    if (at !== last) {
      cards.forEach(function (c, i) { c.classList.toggle("on", i === at); c.setAttribute("aria-hidden", i === at ? "false" : "true"); });
      count.textContent = at + 1; last = at;
    }
    sec.classList.toggle("arrived", s > .985);
    bar.style.transform = "scaleX(" + s + ")";
    stage.style.setProperty("--p", s);
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(build, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
  build();
})();
