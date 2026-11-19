/* PAGAR inner pages — scroll scene for step-by-step sections (17 Nov 2026).
   Used on About (journey steps), Safety (Before / During / After), Coverage (Where to next?) and
   Partners (Live in four steps). On wide screens (900px+ wide, 640px+ tall) the section's eyebrow,
   heading and list stay pinned while you scroll, and the items light up one at a time: a bar shows how
   far through you are and finished items keep a tick. (No step counter: owner, 17 Nov.) Clicking an item scrolls to it.
   Smaller screens, reduced motion and no JS: the section stays exactly as written. */
(function () {
  var calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (calm) return;
  var LISTS = "main ol.steps, main .phase, main .cov";
  var scenes = [];

  function build(list) {
    var items = list.children;
    if (items.length < 3) return;
    var h2 = prevMatch(list, "h2"); if (!h2) return;
    var eyebrow = prevMatch(h2, ".eyebrow");
    var first = eyebrow && eyebrow.nextElementSibling === h2 ? eyebrow : h2;
    /* wrap eyebrow … list in one pinned box; a spacer after it gives the scroll room */
    var box = document.createElement("div"); box.className = "scn";
    first.parentNode.insertBefore(box, first);
    var n = first; while (n) { var next = n.nextElementSibling; box.appendChild(n); if (n === list) break; n = next; }
    var meta = document.createElement("div"); meta.className = "scnmeta"; meta.setAttribute("aria-hidden", "true");
    meta.innerHTML = '<span class="scnbar"><i></i></span>';
    list.parentNode.insertBefore(meta, list);
    var run = document.createElement("div"); run.className = "scnrun"; run.setAttribute("aria-hidden", "true");
    box.parentNode.insertBefore(run, box.nextSibling);
    var s = { box: box, run: run, items: [], list: list, meta: meta, cur: -1, on: false, top: 0, h: 0, len: 0 };
    scenes.push(s);
    collect(s);
    /* Partners rebuilds its steps when you switch between driver and merchant: pick them up again */
    if ("MutationObserver" in window) new MutationObserver(function () { collect(s); measure(); }).observe(list, { childList: true });
  }
  function collect(s) {
    s.items = [].slice.call(s.list.children);
    s.items.forEach(function (it, i) {
      if (it.classList.contains("scnitem")) return;
      it.classList.add("scnitem");
      it.addEventListener("click", function (e) { if (s.on && !e.target.closest("a,button,input,select,textarea,summary")) goTo(s, s.items.indexOf(it)); });
    });
    s.cur = -1;
  }
  function prevMatch(el, sel) { var p = el.previousElementSibling; while (p) { if (p.matches(sel)) return p; p = p.previousElementSibling; } return null; }

  function measure() {
    var want = window.innerWidth >= 900 && window.innerHeight >= 640;
    scenes.forEach(function (s) {
      if (s.on !== want) {
        s.on = want; s.box.parentNode.classList.toggle("scene", want);
        if (!want) { s.items.forEach(function (it) { it.classList.remove("on", "done", "ahead"); }); s.cur = -1; s.box.style.top = ""; s.run.style.height = ""; }
      }
      if (!want) return;
      s.h = s.box.offsetHeight;
      s.top = Math.max(84, Math.round((window.innerHeight - s.h) / 2 + 10));
      s.box.style.top = s.top + "px";
      s.len = Math.round(window.innerHeight * .42 * s.items.length);
      s.run.style.height = s.len + "px";
    });
    tick();
  }
  function progress(s) { return Math.min(1, Math.max(0, (s.top + s.h - s.run.getBoundingClientRect().top) / s.len)); }
  var ticking = false;
  function tick() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      scenes.forEach(function (s) {
        if (!s.on) return;
        var p = progress(s), N = s.items.length, f = p * N, i = Math.min(N - 1, Math.floor(f));
        s.meta.querySelector(".scnbar i").style.transform = "scaleX(" + Math.max(.02, (i + Math.min(1, f - i)) / N) + ")";
        if (i === s.cur) return;
        s.cur = i;
        s.items.forEach(function (it, j) {
          it.classList.toggle("on", j === i); it.classList.toggle("done", j < i); it.classList.toggle("ahead", j > i);
        });
      });
    });
  }
  function goTo(s, i) {
    var y = window.scrollY + s.run.getBoundingClientRect().top - s.top - s.h + (i + .5) / s.items.length * s.len;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  function init() {
    [].forEach.call(document.querySelectorAll(LISTS), build);
    if (!scenes.length) return;
    measure();
    window.addEventListener("scroll", tick, { passive: true });
    var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(measure, 120); });
    window.addEventListener("load", measure);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
