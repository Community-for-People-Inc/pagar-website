/* PAGAR website — phone menu + one-time Sarimanok flight. Loaded by every page, after pagar.js.

   Phone menu: below 900px the header hides its nav links (styles.css, and partners.html's own
   copy of the header styles), and nothing replaced them, so a phone visitor could only reach
   About, Coverage, Safety or Help through the footer. This adds a Menu button beside the
   header's red button and a panel listing the same links, cloned from the header so the two
   never drift. Styles live here, not in styles.css, because partners.html carries its own
   header styles and loads only this file and hash-target.js; one copy serves all six pages.
   Colours, border and offset shadow follow the existing --ka-* tokens.

   Sarimanok: .flybird looped every 5.6s for as long as the page was open, and on the homepage
   crossed the waitlist fields. It now makes one flight on load and is gone. Colours untouched. */
(function () {
  /* Page-to-page transitions (styles.css) are skipped when the tab is hidden; that skip is harmless,
     so it is not reported as an error. (The arriving page catches its side in its own <head>.) */
  window.addEventListener("pageswap", function (e) {
    var vt = e.viewTransition; if (!vt) return;
    [vt.ready, vt.finished, vt.updateCallbackDone].forEach(function (p) { if (p && p.catch) p.catch(function () {}); });
  });
  var css =
    ".flybird{animation-iteration-count:1!important}" +
    ".menubtn{display:none;flex:none;width:44px;height:44px;border:2px solid var(--ka-ink);border-radius:11px;background:#fff;color:var(--ka-ink);cursor:pointer;place-items:center;padding:0;font:inherit}" +
    ".menubtn svg{width:22px;height:22px}" +
    ".menubtn .x{display:none}" +
    "header.site.menu-open .menubtn .x{display:block}header.site.menu-open .menubtn .bars{display:none}" +
    ".mpanel{display:none}" +
    "@media (max-width:900px){" +
      ".menubtn{display:grid}" +
      "header.site.menu-open .mpanel{display:block}" +
      ".mpanel{border-top:1px solid var(--ka-line);background:var(--ka-cream);padding:8px 20px 18px;max-height:calc(100vh - 64px);overflow:auto}" +
      ".mpanel a{display:block;text-decoration:none;color:var(--ka-ink);font-weight:800;font-size:18px;padding:13px 4px;border-bottom:1px solid var(--ka-line)}" +
      ".mpanel a:last-child{border-bottom:0}" +
      ".mpanel a[aria-current]{color:var(--ka-red)}" +
    "}" +
    ".menubtn:focus-visible,.mpanel a:focus-visible{outline:3px solid var(--ka-red);outline-offset:2px}" +
    /* scroll-in: content rises gently into view; siblings in a row follow one another */
    ".rv{opacity:0;transform:translateY(28px) scale(.985);filter:blur(6px);transition:opacity .6s ease,transform .8s cubic-bezier(.2,.8,.2,1),filter .6s ease}" +
    ".rv.in{opacity:1;transform:none;filter:none}" +
    /* section headings wipe up from a line, like a reveal mask */
    /* (a mask, not clip-path: a fully clipped heading never counts as on screen, so it would never appear) */
    "h2.sec.rv{transform:translateY(12px);filter:none;-webkit-mask:linear-gradient(#000,#000) 0 100%/100% 0 no-repeat;mask:linear-gradient(#000,#000) 0 100%/100% 0 no-repeat;transition:-webkit-mask-size .9s cubic-bezier(.7,0,.2,1),mask-size .9s cubic-bezier(.7,0,.2,1),transform .9s cubic-bezier(.2,.8,.2,1),opacity .3s}" +
    "h2.sec.rv.in{transform:none;-webkit-mask-size:100% 100%;mask-size:100% 100%}" +
    /* scroll progress line under the header (browsers without scroll timelines get none) */
    ".scrollbar{position:absolute;left:0;right:0;bottom:-1px;height:2px;pointer-events:none;background:linear-gradient(90deg,#ee0000,#f4b60e 60%,#0eb046);transform-origin:left;transform:scaleX(0);opacity:0}" +
    "@supports (animation-timeline:scroll()){.scrollbar{opacity:1;animation:kaProg linear both;animation-timeline:scroll(root)}}" +
    "@keyframes kaProg{to{transform:scaleX(1)}}" +
    /* numbered steps: the dotted link to the next step draws itself once the steps are in */
    "ol.steps.rvl li::after{transform:scaleX(0);transform-origin:left;transition:transform .6s ease}" +
    "ol.steps.rvl.in li::after{transform:scaleX(1)}" +
    "ol.steps.rvl.in li:nth-child(2)::after{transition-delay:.25s}ol.steps.rvl.in li:nth-child(3)::after{transition-delay:.5s}";

  /* Scroll-in animation for the content blocks on every page. Only JS adds the hidden starting state,
     so without JS (or with reduced motion) everything simply shows. Things already on screen when the
     page opens appear at once. */
  function reveal() {
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var sel = "main section.block h2.sec, main .card, main ol.steps li, main ul.reqs li, main ul.checks li, main details.faq," +
              " main .tcard, main .appcard, main .city, main .phase .p, main .note, main .filmcard, main .svcstage";
    var els = [].slice.call(document.querySelectorAll(sel)).filter(function (el) {
      return !el.closest(".hero, #how, .herostage, [hidden]");
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target; el.classList.add("in"); io.unobserve(el);
        if (el.tagName !== "OL") setTimeout(function () { el.classList.remove("rv", "in"); el.style.transitionDelay = ""; }, 1300);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    var vh = window.innerHeight;
    els.forEach(function (el) {
      if (el.getBoundingClientRect().top < vh * .92) return; // already on screen: leave as is
      var sib = el.parentNode ? [].indexOf.call(el.parentNode.children, el) : 0;
      el.style.transitionDelay = Math.min(sib, 5) * 80 + "ms";
      el.classList.add("rv"); io.observe(el);
    });
    [].forEach.call(document.querySelectorAll("main ol.steps"), function (ol) {
      if (ol.getBoundingClientRect().top < vh * .92) return;
      ol.classList.add("rvl"); io.observe(ol);
    });
  }

  /* Cards on every page: a soft light follows the cursor and the card tilts slightly. Mouse only,
     and off for reduced motion. The light and lift styles are .glow in styles.css. */
  function cardLight() {
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!(window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches)) return;
    [].forEach.call(document.querySelectorAll("main .card, main .appcard, main .phase .p, main .cov .city, main ol.steps li"), function (card) {
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

  function init() {
    var st = document.createElement("style");
    st.textContent = css;
    document.head.appendChild(st);
    reveal();
    cardLight();

    var header = document.querySelector("header.site");
    if (header && !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) {
      var sb = document.createElement("div"); sb.className = "scrollbar"; sb.setAttribute("aria-hidden", "true"); header.appendChild(sb);
    }
    var bar = header && header.querySelector(".bar");
    var nav = header && header.querySelector("nav.main");
    if (!bar || !nav) return;

    var panel = document.createElement("nav");
    panel.className = "mpanel";
    panel.id = "mpanel";
    panel.setAttribute("aria-label", "Menu");
    var links = nav.querySelectorAll("a.navlink");
    for (var i = 0; i < links.length; i++) panel.appendChild(links[i].cloneNode(true));

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "menubtn";
    btn.setAttribute("aria-label", "Menu");
    btn.setAttribute("aria-controls", "mpanel");
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML =
      '<svg class="bars" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>' +
      '<svg class="x" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    bar.appendChild(btn);
    header.appendChild(panel);

    function set(open) {
      header.classList.toggle("menu-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    }
    btn.addEventListener("click", function () { set(!header.classList.contains("menu-open")); });
    panel.addEventListener("click", function (e) { if (e.target.closest("a")) set(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && header.classList.contains("menu-open")) { set(false); btn.focus(); }
    });
    window.addEventListener("resize", function () { if (window.innerWidth > 900) set(false); });
  }
  if (document.readyState !== "loading") init(); else document.addEventListener("DOMContentLoaded", init);
})();
