# PAGAR — marketing website

The public site for **Pagar** (pagarexpress.com) — the Marawi/Mindanao super-app.
Clean, dependency-free **static HTML/CSS** (no build step, no runtime framework) so it loads
instantly on weak connections and is easy to maintain. Owned and maintained by the tech team;
visual design + branding are marketing's (Sarimanok, okir, Archivo, red-dominant palette) and are
preserved faithfully here.

## Pages
| File | Purpose |
|---|---|
| `index.html` | Landing + waitlist |
| `about.html` | Story / mission (social enterprise, dignified income) |
| `coverage.html` | Where Pagar is live + city-interest capture |
| `safety.html` | SOS + before/during/after trip safety |
| `partners.html` | **Recruitment** — driver / merchant application, wired to the app |
| `help.html` | FAQ + legal |
| `assets/styles.css` | Shared brand stylesheet (single source of truth) |
| `assets/pagar.js` | Shared behavior: EN/FIL toggle (persisted), active-nav |

## Editing
- **Copy / colors / components:** edit `assets/styles.css` (brand tokens are the `--ka-*` CSS
  variables at the top) — changes apply to every page.
- **Bilingual text:** each element carries `data-en` / `data-fil` (or `-html` variants);
  `pagar.js` swaps them and remembers the visitor's choice. Add `data-fil` to translate; if it's
  missing, the page falls back to English.
- **Logo/motif:** the Sarimanok + okir SVG symbols are inlined near the top of each page so the
  logo always renders (no JS needed). Edit once and paste to all if the mark changes.

## Recruitment wiring (partners.html)
The Apply form really submits to the app: `POST {API_BASE}/api/recruit` (see
`docs/recruitment-api.md` in the app repo). Two config constants at the bottom of `partners.html`:
- `API_BASE` — the app API origin. **`""` = DEMO** (form simulates success, sends nothing).
  Set to the real API origin to go live.
- `TURNSTILE_SITEKEY` — Cloudflare Turnstile site key (`""` = no captcha widget).

**Go-live checklist for recruitment:** (1) deploy the recruit API (app PR #126); (2) set
`API_BASE`; (3) add a **CORS allow for `pagarexpress.com`** on `/api/recruit`; (4) set the
Turnstile site key here + `TURNSTILE_SECRET_KEY` on the server.
> Documents are collected **in-app during onboarding** (authenticated, DPA-safe) — the public
> form only captures the application + a "prepare these documents" checklist.

The waitlist (`index.html`) and city-interest (`coverage.html`) forms have `WAITLIST_ENDPOINT` /
`CITY_ENDPOINT` constants (empty = acknowledge only). Point them at a real endpoint to persist.

## Deploy (Hostinger)
Static files — upload the repo contents to the web root (e.g. `public_html/`), or connect the
host to this repo. No server, no build.

## Notes / follow-ups
- `partners.html` is currently self-contained (its own styles + i18n) — can be consolidated onto
  `assets/styles.css` + `assets/pagar.js` later for full consistency.
- Full legal text (Terms / Privacy / Cancellation & Refunds / Community Guidelines) to be finalized
  before public launch.
