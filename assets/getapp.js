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

  window.pagarGetApp = render; // lets a preview try links without editing this file
  function init() { render(APPS); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
