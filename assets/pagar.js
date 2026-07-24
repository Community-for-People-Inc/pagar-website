/* PAGAR website — shared behavior: bilingual EN/FIL toggle (persisted), active nav.
   Elements carry data-en / data-fil (textContent) or data-en-html / data-fil-html (markup).
   The SVG sprite (Sarimanok + okir) is inlined per page so the logo renders without JS. */
(function () {
  var KEY = "pagar_lang";
  function getLang() { try { return localStorage.getItem(KEY) === "fil" ? "fil" : "en"; } catch (e) { return "en"; } }
  function setLang(l) { try { localStorage.setItem(KEY, l); } catch (e) {} apply(l); }

  function apply(lang) {
    var txt = document.querySelectorAll("[data-en]");
    for (var i = 0; i < txt.length; i++) {
      var el = txt[i];
      var v = lang === "fil" ? el.getAttribute("data-fil") : el.getAttribute("data-en");
      if (v == null) v = el.getAttribute("data-en"); // FIL falls back to EN
      if (v != null) el.textContent = v;
    }
    var html = document.querySelectorAll("[data-en-html]");
    for (var j = 0; j < html.length; j++) {
      var e2 = html[j];
      var h = lang === "fil" ? e2.getAttribute("data-fil-html") : e2.getAttribute("data-en-html");
      if (h == null) h = e2.getAttribute("data-en-html");
      if (h != null) e2.innerHTML = h;
    }
    document.documentElement.lang = lang === "fil" ? "fil" : "en";
    var btns = document.querySelectorAll(".langtoggle button");
    for (var k = 0; k < btns.length; k++) {
      btns[k].setAttribute("aria-pressed", btns[k].getAttribute("data-lang") === lang ? "true" : "false");
    }
  }

  function markActiveNav() {
    var path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    if (!path) path = "index.html";
    var links = document.querySelectorAll("nav.main a.navlink");
    for (var i = 0; i < links.length; i++) {
      var href = (links[i].getAttribute("href") || "").toLowerCase();
      if (href === path) links[i].setAttribute("aria-current", "page");
    }
  }

  function init() {
    apply(getLang());
    markActiveNav();
    var btns = document.querySelectorAll(".langtoggle button");
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener("click", function () { setLang(this.getAttribute("data-lang")); });
    }
  }
  if (document.readyState !== "loading") init(); else document.addEventListener("DOMContentLoaded", init);
  window.PagarLang = { set: setLang, get: getLang };
})();
