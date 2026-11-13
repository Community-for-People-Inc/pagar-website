/* Keeps a #link's target in view while the page finishes loading. Fonts and media above it move it
   after the jump, and Safari does not compensate, so it re-aligns until the reader scrolls.
   Every page loads this, partners.html included (it does not load pagar.js). */
(function () {
  var id = location.hash.slice(1);
  if (!id) return;
  var moved = false;
  function stop() { moved = true; }
  ["wheel", "touchstart", "keydown", "mousedown"].forEach(function (e) { window.addEventListener(e, stop, { passive: true }); });
  function align() { var el = document.getElementById(id); if (!moved && el) el.scrollIntoView({ block: "start", behavior: "instant" }); }
  // Smooth scrolling would animate toward where the target was before fonts loaded; jump instead.
  var root = document.documentElement;
  root.style.scrollBehavior = "auto";
  function settle() { align(); root.style.scrollBehavior = ""; }
  if (document.readyState === "complete") settle(); else window.addEventListener("load", settle);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(align);
})();
