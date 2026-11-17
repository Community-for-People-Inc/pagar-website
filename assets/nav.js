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
    ".menubtn:focus-visible,.mpanel a:focus-visible{outline:3px solid var(--ka-red);outline-offset:2px}";

  function init() {
    var st = document.createElement("style");
    st.textContent = css;
    document.head.appendChild(st);

    var header = document.querySelector("header.site");
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
