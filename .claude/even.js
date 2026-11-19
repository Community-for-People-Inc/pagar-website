// Run it from http://localhost:8080/.claude/ (a page without the site's content security policy,
// which blocks the eval used to load this file). It inspects the real pages in iframes.
// Unevenness audit for the Pagar site (dev tool, not shipped). Loads each page in an iframe at each
// width and reports: card rows whose buttons/links sit at different heights, a lone card on a last
// row under a fuller row, cards in one row with different heights, and headings that leave one word
// on the last line. Usage: await window.pagarEven()
window.pagarEven = async function (pages, widths) {
  pages = pages || ['index', 'about', 'coverage', 'safety', 'help', 'partners'];
  widths = widths || [1440, 1024, 768];
  const out = [];
  for (const p of pages) for (const w of widths) {
    const f = document.createElement('iframe');
    f.style.cssText = `position:fixed;left:0;top:0;width:${w}px;height:900px;opacity:0;pointer-events:none;z-index:-1`;
    f.src = '/' + p + '.html?even=' + Date.now();
    document.body.appendChild(f);
    await new Promise(r => { f.onload = r; });
    const win = f.contentWindow, d = f.contentDocument;
    const H = d.documentElement.scrollHeight;
    for (let y = 0; y < H; y += 600) { win.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
    await new Promise(r => setTimeout(r, 900));
    const tag = `${p}@${w}`;
    const name = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
    const vis = (el) => { const r = el.getBoundingClientRect(); const cs = win.getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden'; };
    // containers: grid or wrapping flex with 3+ visible box children
    for (const c of d.querySelectorAll('main *')) {
      if (c.closest('.phone, .herostage, svg, header, footer, .tktrack, .scn, nav, form, .journey .jtrack')) continue;
      const cs = win.getComputedStyle(c);
      const isGrid = cs.display === 'grid' || (cs.display === 'flex' && cs.flexWrap === 'wrap');
      if (!isGrid) continue;
      const kids = [...c.children].filter(k => vis(k) && k.getBoundingClientRect().width > 120 && k.getBoundingClientRect().height > 60);
      if (kids.length < 3) continue;
      const rows = [];
      kids.forEach(k => { const r = k.getBoundingClientRect(); let row = rows.find(x => Math.abs(x.top - r.top) < 4); if (!row) rows.push(row = { top: r.top, items: [] }); row.items.push(k); });
      if (rows.length < 1) continue;
      // lone card on a last row
      if (rows.length > 1) { const last = rows[rows.length - 1], prev = rows[rows.length - 2]; const lw = last.items[0].getBoundingClientRect().width, cw = c.getBoundingClientRect().width; if (last.items.length === 1 && prev.items.length >= 3 && lw < cw * .6) out.push({ page: tag, kind: 'lone-last-card', el: name(c), detail: rows.map(r => r.items.length).join('+') }); }
      for (const row of rows) {
        if (row.items.length < 2) continue;
        const hs = row.items.map(k => Math.round(k.getBoundingClientRect().height));
        if (Math.max(...hs) - Math.min(...hs) > 6) out.push({ page: tag, kind: 'row-heights-differ', el: name(c), detail: hs.join('/') });
        // the last button/link in each card: same distance from the card bottom?
        const ends = row.items.map(k => { const as = [...k.querySelectorAll('a, button, .store, .btn')].filter(vis); if (!as.length) return null; const a = as[as.length - 1]; return Math.round(k.getBoundingClientRect().bottom - a.getBoundingClientRect().bottom); });
        if (ends.filter(e => e !== null).length >= 2) { const v = ends.filter(e => e !== null); if (Math.max(...v) - Math.min(...v) > 6) out.push({ page: tag, kind: 'buttons-misaligned', el: name(c), detail: ends.join('/') + ' px from bottom' }); }
      }
    }
    // headings: one word alone on the last line
    for (const h of d.querySelectorAll('main h1, main h2, main h3, .filmcap')) {
      if (!vis(h) || h.closest('.phone, .herostage, .scn .scnitem:not(.on)')) continue;
      const rng = d.createRange(); rng.selectNodeContents(h);
      const rects = [...rng.getClientRects()].filter(r => r.width > 2);
      const lines = []; rects.forEach(r => { if (!lines.some(t => Math.abs(t - r.top) < 6)) lines.push(r.top); });
      if (lines.length < 2) continue;
      const words = h.textContent.trim().split(/\s+/); const last = words[words.length - 1];
      const lastTop = Math.max(...lines);
      // words on the last line
      const walker = d.createTreeWalker(h, NodeFilter.SHOW_TEXT); let n, onLast = 0;
      while ((n = walker.nextNode())) { const re = /\S+/g; let m; while ((m = re.exec(n.textContent))) { const r2 = d.createRange(); r2.setStart(n, m.index); r2.setEnd(n, m.index + m[0].length); const rr = r2.getClientRects()[0]; if (rr && Math.abs(rr.top - lastTop) < 6) onLast++; } }
      if (onLast === 1 && words.length > 3) out.push({ page: tag, kind: 'heading-orphan', el: name(h), detail: '"' + last + '" alone: ' + h.textContent.trim().slice(0, 60) });
    }
    f.remove();
  }
  return out;
};
