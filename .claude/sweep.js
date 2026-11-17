// Run it from http://localhost:8080/.claude/ (a page without the site's content security policy,
// which blocks the eval used to load this file). It inspects the real pages in iframes.
// Defect sweep for the Pagar site (dev tool, not shipped). Paste into the browser console on any
// page of the local preview, or run through the preview's JS tool. Loads each page in an iframe at
// each width, scrolls it through, and reports problems. Usage: await window.pagarSweep()
window.pagarSweep = async function (pages, widths) {
  pages = pages || ['index', 'about', 'coverage', 'safety', 'help', 'partners'];
  widths = widths || [1440, 1024, 768, 375];
  const out = [];
  const lum = (c) => { const m = c.match(/[\d.]+/g); if (!m) return null; const [r, g, b, a] = m.map(Number); if (a === 0) return null; return [r, g, b].map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }).reduce((s, v, i) => s + v * [.2126, .7152, .0722][i], 0); };
  const ratio = (a, b) => (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
  const linkCache = {};
  for (const p of pages) for (const w of widths) {
    const h = w >= 900 ? 900 : (w >= 768 ? 1024 : 812);
    const f = document.createElement('iframe');
    f.style.cssText = `position:fixed;left:0;top:0;width:${w}px;height:${h}px;opacity:0;pointer-events:none;z-index:-1`;
    f.src = '/' + p + '.html';
    const errs = [];
    document.body.appendChild(f);
    await new Promise(r => { f.onload = r; });
    const win = f.contentWindow, d = f.contentDocument;
    win.addEventListener('error', e => errs.push(String(e.message)));
    // scroll through so every reveal fires, then come back
    const H = d.documentElement.scrollHeight;
    for (let y = 0; y < H; y += Math.round(h * .6)) { win.scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 120)); }
    win.scrollTo({ top: H, behavior: 'instant' }); await new Promise(r => setTimeout(r, 1600));
    const tag = `${p}@${w}`;
    const add = (kind, el, detail) => out.push({ page: tag, kind, el: el ? (el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '')) : '', text: el ? (el.textContent || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 50) : '', detail });
    const skip = (el) => el.closest('[aria-hidden="true"], .phone, .herostage, .covmap, .heroart, svg, .tktrack .tkgroup + .tkgroup, .sprite, noscript, [hidden], .flybird, .jbird, details:not([open]) > :not(summary)');
    const vis = (el) => { const cs = win.getComputedStyle(el); const r = el.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0; };
    // 1 sideways scroll
    const over = d.documentElement.scrollWidth - d.documentElement.clientWidth;
    if (over > 1) add('sideways-scroll', null, over + 'px');
    // 2 errors
    errs.forEach(e => add('script-error', null, e));
    const all = [...d.querySelectorAll('body *')];
    const textEls = all.filter(el => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && !skip(el) && vis(el));
    for (const el of textEls) {
      const cs = win.getComputedStyle(el);
      // 3 tiny text on phones/tablets
      if (w <= 768 && parseFloat(cs.fontSize) < 11) add('text-under-11px', el, cs.fontSize);
      // 4 spill: text wider than its own box with clipping, or beyond the viewport
      const r = el.getBoundingClientRect();
      if (r.right > w + 1 && !el.closest('.tktrack, .svctabs, .igsteps, .faqchips, .tbl, pre')) add('beyond-viewport', el, Math.round(r.right - w) + 'px');
      if ((cs.overflow === 'hidden' || cs.overflowX === 'hidden') && el.scrollWidth > el.clientWidth + 2 && cs.textOverflow !== 'ellipsis') add('text-clipped', el, el.scrollWidth + '>' + el.clientWidth);
      // 5 contrast against the first solid background behind it
      if (parseFloat(cs.opacity) === 0) continue;
      let bg = null, e = el, img = false;
      while (e && e.nodeType === 1) { const c = win.getComputedStyle(e); if (c.backgroundImage && c.backgroundImage !== 'none' && !/^url\(/.test(c.backgroundImage) ? false : (c.backgroundImage !== 'none')) { img = true; break; } if (c.backgroundImage !== 'none') { img = true; break; } const L = lum(c.backgroundColor); if (L !== null && !/rgba\([^)]*,\s*0?\.\d+\)/.test(c.backgroundColor)) { bg = L; break; } e = e.parentElement; }
      if (img) continue;
      if (bg === null) bg = lum('rgb(248,244,244)');
      const fg = lum(cs.color);
      if (fg === null) continue;
      const big = parseFloat(cs.fontSize) >= 18.66 || (parseFloat(cs.fontSize) >= 14 && parseInt(cs.fontWeight) >= 700);
      const cr = ratio(fg, bg);
      if (cr < 1.5) add('invisible-text', el, cr.toFixed(2));
      else if (cr < (big ? 3 : 4.5)) add('low-contrast', el, cr.toFixed(2));
    }
    // 6 tap targets on phones/tablets
    if (w <= 768) for (const el of d.querySelectorAll('a[href], button, input, select, textarea, summary, [role="tab"]')) {
      if (skip(el) || !vis(el)) continue;
      if (el.tagName === 'A' && el.closest('p, li span, td') && !el.className) continue; // inline text links
      const r = el.getBoundingClientRect();
      if (r.height < 34 && el.type !== 'checkbox' && el.type !== 'radio' && el.type !== 'hidden') add('small-tap-target', el, Math.round(r.height) + 'px tall');
    }
    // 7 broken images
    for (const im of d.images) if (im.complete && im.naturalWidth === 0 && !skip(im)) add('broken-image', im, im.getAttribute('src'));
    // 8 stuck hidden after scrolling through
    for (const el of d.querySelectorAll('.rv, h2.sec, .card, ol.steps li, .appcard')) {
      if (skip(el) || !vis(el)) continue;
      if (parseFloat(win.getComputedStyle(el).opacity) < .3 && !el.classList.contains('ahead')) add('stuck-hidden', el, 'opacity ' + win.getComputedStyle(el).opacity);
    }
    // 9 duplicate ids, links (once per page)
    if (w === widths[0]) {
      const ids = {}; d.querySelectorAll('[id]').forEach(el => { ids[el.id] = (ids[el.id] || 0) + 1; });
      Object.entries(ids).filter(([, n]) => n > 1).forEach(([id, n]) => add('duplicate-id', null, id + ' ×' + n));
      for (const a of d.querySelectorAll('a[href]')) {
        const href = a.getAttribute('href');
        if (/^(mailto:|tel:|https?:|javascript:)/.test(href)) continue;
        const [file, hash] = href.split('#');
        const target = file || (p + '.html');
        if (!(target in linkCache)) linkCache[target] = await fetch('/' + target, { method: 'HEAD' }).then(r => r.ok).catch(() => false);
        if (!linkCache[target]) { add('broken-link', a, href); continue; }
        if (hash && !file && !d.getElementById(hash)) add('broken-anchor', a, href);
      }
    }
    f.remove();
  }
  return out;
};
