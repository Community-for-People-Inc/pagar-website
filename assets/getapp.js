/* PAGAR website — "Get the app" (17 Nov 2026), homepage #apps section.
   While the apps wait for Google Play and the App Store, Android phones can install them straight
   from a download link. Fill in a link below and that app's card grows a "Download for Android
   (APK)" button, and the "How to install" panel appears under the cards.

   Leave a link empty and nothing changes: the card keeps its "Coming to Google Play" badge, as it
   does today. Without JavaScript nothing changes either. Only link to builds signed with the
   release key (the same key Google Play will use), and update version and size with each build. */
(function () {
  var APPS = {
    express:  { apk: "", version: "", size: "" },  // e.g. apk: "https://…/pagar-express-1.0.14.apk", version: "1.0.14", size: "48 MB"
    driver:   { apk: "", version: "", size: "" },
    merchant: { apk: "", version: "", size: "" }
  };

  var ANDROID = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7.2 9h9.6c.4 0 .7.3.7.7V17c0 .6-.4 1-1 1h-.9v2.3a1.2 1.2 0 0 1-2.4 0V18h-2.4v2.3a1.2 1.2 0 0 1-2.4 0V18h-.9c-.6 0-1-.4-1-1V9.7c0-.4.3-.7.7-.7zM4.6 9.2c.7 0 1.2.5 1.2 1.2v5a1.2 1.2 0 0 1-2.4 0v-5c0-.7.5-1.2 1.2-1.2zm14.8 0c.7 0 1.2.5 1.2 1.2v5a1.2 1.2 0 0 1-2.4 0v-5c0-.7.5-1.2 1.2-1.2zM15.6 3.4l1-1.5a.3.3 0 0 0-.5-.3l-1 1.6A6.3 6.3 0 0 0 12 2.5c-1.1 0-2.2.3-3.1.7l-1-1.6a.3.3 0 0 0-.5.3l1 1.5A5.3 5.3 0 0 0 6.5 8h11a5.3 5.3 0 0 0-1.9-4.6zM9.6 6.1a.6.6 0 1 1 0-1.2.6.6 0 0 1 0 1.2zm4.8 0a.6.6 0 1 1 0-1.2.6.6 0 0 1 0 1.2z"/></svg>';

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function render(apps) {
    var any = false;
    Object.keys(apps).forEach(function (key) {
      var a = apps[key], card = document.querySelector('#apps .appcard[data-app="' + key + '"]');
      if (!card) return;
      var old = card.querySelector(".dl");
      if (old) old.remove();
      if (!a || !/^https:\/\//.test(a.apk || "")) return;
      any = true;
      var name = card.querySelector("b") ? card.querySelector("b").textContent : "Pagar";
      var meta = ["For Android phones"];
      if (a.version) meta.push("v" + a.version);
      if (a.size) meta.push(a.size);
      var box = document.createElement("div");
      box.className = "dl";
      box.innerHTML =
        '<a class="dlbtn" href="' + esc(a.apk) + '" download aria-label="Download ' + esc(name) + ' for Android (APK)">' + ANDROID +
        '<span>Download for Android <small>(APK)</small></span></a>' +
        '<span class="dlmeta">' + esc(meta.join(" · ")) + "</span>";
      var store = card.querySelector(".store");
      store.parentNode.insertBefore(box, store);
      card.classList.add("hasdl");
    });
    var panel = document.getElementById("install");
    if (panel) panel.hidden = !any;
  }

  /* ---- the install guide: four steps beside a phone showing each one ----
     Desktop: click or hover a step (hover pauses), arrow keys, and a 4.5s timer while on screen.
     Phones: tap a step or swipe the phone left/right, plus the timer. Tapping or clicking stops the
     timer; hovering only pauses it. Reduced motion: no timer, no animation. */
  function guide() {
    var box = document.getElementById("install");
    if (!box) return;
    var list = box.querySelector(".igsteps"), steps = [].slice.call(box.querySelectorAll(".igstep")),
        scr = [].slice.call(box.querySelectorAll(".igscr")), dots = [].slice.call(box.querySelectorAll(".igdots i")),
        stage = box.querySelector(".igstage");
    var N = steps.length, cur = 0, timer = null, stopped = false, hovering = false, inView = false;
    var calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    function show(i, focus) {
      i = (i + N) % N; cur = i;
      steps.forEach(function (s, j) { var on = j === i; s.setAttribute("aria-selected", on ? "true" : "false"); s.tabIndex = on ? 0 : -1;
        var b = s.querySelector(".bar"); if (on && b) { b.style.animation = "none"; void b.offsetWidth; b.style.animation = ""; } });
      scr.forEach(function (el, j) { el.classList.toggle("on", j === i); });
      dots.forEach(function (d, j) { d.classList.toggle("on", j === i); });
      stage.setAttribute("aria-labelledby", steps[i].id);
      if (focus) steps[i].focus({ preventScroll: true });
      /* phones: the steps are a swipe row under the phone; keep the shown step in the middle */
      if (window.innerWidth < 900 && !swiping && list.scrollWidth > list.clientWidth) {
        var s = steps[i];
        list.scrollTo({ left: s.offsetLeft - (list.clientWidth - s.offsetWidth) / 2, behavior: calm ? "auto" : "smooth" });
      }
    }
    /* swiping the row of steps shows the step that settles in the middle */
    var swiping = false, swipeT = null;
    list.addEventListener("touchstart", function () { swiping = true; }, { passive: true });
    list.addEventListener("scroll", function () {
      if (!swiping || window.innerWidth >= 900) return;
      clearTimeout(swipeT);
      swipeT = setTimeout(function () {
        var mid = list.scrollLeft + list.clientWidth / 2, best = 0, d = 1e9;
        steps.forEach(function (s, j) { var dd = Math.abs(s.offsetLeft + s.offsetWidth / 2 - mid); if (dd < d) { d = dd; best = j; } });
        if (list.scrollLeft + list.clientWidth >= list.scrollWidth - 4) best = N - 1; /* swiped to the end */
        if (list.scrollLeft <= 4) best = 0;
        swiping = false;
        if (best !== cur) { stop(); show(best); }
      }, 140);
    }, { passive: true });
    function tick() { clearTimeout(timer); if (stopped || hovering || !inView || calm || box.hidden) return; timer = setTimeout(function () { show(cur + 1); tick(); }, 4500); }
    function stop() { stopped = true; clearTimeout(timer); list.classList.remove("auto"); }
    function isMouse(e) { return e.pointerType ? e.pointerType === "mouse" : true; }
    var enter = "PointerEvent" in window ? "pointerenter" : "mouseenter", leave = "PointerEvent" in window ? "pointerleave" : "mouseleave";
    steps.forEach(function (s, i) {
      s.addEventListener("click", function () { swiping = false; stop(); show(i); });
      s.addEventListener(enter, function (e) { if (isMouse(e) && i !== cur) show(i); });
    });
    list.addEventListener(enter, function (e) { if (!isMouse(e)) return; hovering = true; clearTimeout(timer); list.classList.remove("auto"); });
    list.addEventListener(leave, function (e) { if (!isMouse(e)) return; hovering = false; if (!stopped && !calm) { list.classList.add("auto"); show(cur); tick(); } });
    list.addEventListener("keydown", function (e) {
      var n = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
      if (!n) return; e.preventDefault(); stop(); show(cur + n, true);
    });
    var sx = 0, sy = 0;
    stage.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      var p = e.changedTouches[0], dx = p.clientX - sx, dy = p.clientY - sy;
      if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
      stop(); show(cur + (dx < 0 ? 1 : -1));
    }, { passive: true });
    stage.addEventListener("click", function () { stop(); show(cur + 1); }); /* tapping the phone moves on too */
    if (!calm) list.classList.add("auto");
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { inView = es[0].isIntersecting; if (inView) { show(cur); tick(); } else clearTimeout(timer); }, { threshold: .35 }).observe(box);
    show(0);
  }

  window.pagarGetApp = render; // lets a preview try links without editing this file
  function init() {
    render(APPS);
    /* ?getapp=preview shows the install guide before any link is set, for review */
    if (/[?&]getapp=preview\b/.test(location.search)) { var p = document.getElementById("install"); if (p) p.hidden = false; }
    guide();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
