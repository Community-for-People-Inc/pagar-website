/* PAGAR homepage — "ride along" scroll journey (#how).
   The section is tall; its stage sticks to the screen while you scroll through it. A winding road
   is drawn to fit the stage and a Pagar tricycle drives along it with the scroll, slowing at each
   stop. On top of that:
   - a camera (.jworld) that zooms in, tilts slightly and follows the tricycle, then pulls back out
     at the start and the end so the whole route shows;
   - a 3D card deck: the current stop's card flips up, earlier cards slide back behind it;
   - a burst in the Sarimanok's tail colours at each stop, and lane markings that flow while you
     scroll;
   - on arrival the Sarimanok (same artwork and colours) flies in and lands at the door.
   Without JS, or with reduced motion, the section is a plain list of the same cards (class
   "static"). */
(function () {
  var sec = document.getElementById("how");
  if (!sec) return;
  var calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (calm || !document.createElementNS || !("getTotalLength" in document.createElementNS("http://www.w3.org/2000/svg", "path"))) {
    sec.classList.add("static"); return;
  }
  sec.classList.add("live");
  var NS = "http://www.w3.org/2000/svg";
  var stage = sec.querySelector(".jstage"), world = sec.querySelector(".jworld") || stage, svg = sec.querySelector(".jroad");
  var road = svg.querySelector(".road"), edge = svg.querySelector(".edge"), lane = svg.querySelector(".lane"), done = svg.querySelector(".done");
  var rider = svg.querySelector(".rider"), lamp = svg.querySelector(".lamp"), pinsG = svg.querySelector(".pins");
  var cards = [].slice.call(sec.querySelectorAll(".jcard"));
  var count = sec.querySelector(".jcount b"), bar = sec.querySelector(".jbar i"), bird = sec.querySelector(".jbird");
  var N = cards.length, len = 0, stopLen = [], W = 0, H = 0, mobile = false, pins = [], last = -1, ticking = false, flowT = 0;
  var COLORS = ["#ee0000", "#f4b60e", "#0eb046", "#0058a1"];

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
      var g = document.createElementNS(NS, "g");
      g.setAttribute("class", "pin");
      g.setAttribute("transform", "translate(" + pt[0] + " " + pt[1] + ")");
      g.innerHTML = '<circle class="ring" r="15"></circle><circle r="15"></circle><text y="5" text-anchor="middle">' + (i + 1) + "</text>";
      pinsG.appendChild(g);
      return g;
    });
    // one shared slot for the deck: top right on desktop, under the road on phones
    cards.forEach(function (c) {
      if (mobile) { c.style.left = "16px"; c.style.top = (H * .71) + "px"; c.style.width = (W - 32) + "px"; return; }
      c.style.width = "";
      var cw = c.offsetWidth || 300, side = Math.max(24, (W - 1120) / 2 + 20);
      c.style.left = (W - cw - side) + "px"; c.style.top = Math.max(140, H * .18) + "px";
    });
    last = -1; update();
  }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function burst(el, big) {
    var r = el.getBoundingClientRect(), sr = stage.getBoundingClientRect();
    var x = r.left + r.width / 2 - sr.left, y = r.top + r.height / 2 - sr.top, n = big ? 26 : 12;
    for (var i = 0; i < n; i++) {
      var s = document.createElement("i"), a = Math.PI * 2 * i / n + Math.random() * .4, dist = (big ? 90 : 46) + Math.random() * (big ? 70 : 30);
      s.className = "spark";
      s.style.left = x + "px"; s.style.top = y + "px";
      s.style.background = COLORS[i % COLORS.length];
      s.style.setProperty("--dx", Math.cos(a) * dist + "px");
      s.style.setProperty("--dy", Math.sin(a) * dist + "px");
      if (big) s.style.width = s.style.height = (6 + Math.random() * 6) + "px";
      stage.appendChild(s);
      setTimeout(function (n) { return function () { n.remove(); }; }(s), 900);
    }
  }
  function update() {
    ticking = false;
    var r = sec.getBoundingClientRect(), total = sec.offsetHeight - window.innerHeight;
    var s = Math.max(0, Math.min(1, -r.top / Math.max(1, total)));
    var seg = s * (N - 1), k = Math.min(N - 2, Math.floor(seg)), t = smooth(Math.min(1, Math.max(0, (seg - k) * 1.25)));
    var L = stopLen[k] + (stopLen[k + 1] - stopLen[k]) * t;
    var a = road.getPointAtLength(L), b = road.getPointAtLength(Math.min(len, L + 2)), c0 = road.getPointAtLength(Math.max(0, L - 2));
    var ang = Math.atan2(b.y - c0.y, b.x - c0.x) * 180 / Math.PI;
    rider.setAttribute("transform", "translate(" + a.x + " " + a.y + ") rotate(" + ang + ")");
    lamp.setAttribute("cx", a.x); lamp.setAttribute("cy", a.y);
    done.style.strokeDashoffset = (len - L);

    // camera: zoom in and follow the tricycle mid-journey, pull back out at both ends
    var Z = mobile ? .18 : .38, f = Math.sin(Math.PI * Math.min(1, s * 1.08)), z = 1 + Z * f;
    var tx = f * (W * .5 - z * a.x), ty = f * (H * (mobile ? .5 : .6) - z * a.y);
    if (world !== stage) world.style.transform = "perspective(1600px) rotateX(" + (10 * f).toFixed(2) + "deg) translate(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px) scale(" + z.toFixed(3) + ")";

    var at = 0;
    for (var i = 0; i < N; i++) if (L >= stopLen[i] - 6) at = i;
    pins.forEach(function (p, i) { p.classList.toggle("passed", i <= at); p.classList.toggle("here", i === at); });
    if (at !== last) {
      cards.forEach(function (c, i) {
        c.classList.toggle("on", i === at);
        c.classList.toggle("past", i < at && at - i <= 3);
        c.style.setProperty("--d", Math.max(0, at - i));
        c.setAttribute("aria-hidden", i === at ? "false" : "true");
      });
      if (last !== -1 && at > last && pins[at]) burst(pins[at], false);
      count.textContent = at + 1; last = at;
    }
    var arrived = s > .985;
    if (arrived && !sec.classList.contains("arrived")) {
      sec.classList.add("arrived");
      if (bird && pins[N - 1]) {
        var pr = pins[N - 1].getBoundingClientRect(), sr = stage.getBoundingClientRect(), bs = bird.offsetWidth || 120;
        bird.style.left = (pr.left + pr.width / 2 - sr.left - bs * .55) + "px";
        bird.style.top = (pr.top - sr.top - bs * .86) + "px";
      }
      setTimeout(function () { if (sec.classList.contains("arrived") && pins[N - 1]) burst(pins[N - 1], true); }, 900);
    } else if (!arrived && sec.classList.contains("arrived")) {
      sec.classList.remove("arrived");
      if (bird) { bird.style.left = ""; bird.style.top = ""; }
    }
    bar.style.transform = "scaleX(" + s + ")";
    stage.style.setProperty("--p", s);
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
    stage.classList.add("moving"); clearTimeout(flowT); flowT = setTimeout(function () { stage.classList.remove("moving"); }, 180);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(build, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
  build();
})();
