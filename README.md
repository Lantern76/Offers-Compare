# Offers Compare (working name)
Static comparison of US brokerage, crypto-exchange and cash-APY offers. `node build.js` turns `data/offers.json` into `dist/` (validation runs first and fails the build); `node scripts/check-links.js` checks internal links. Rules: every offer cites its official terms page (`termsUrl`, `termsQuote`) and a `lastChecked` time; anything the terms don't say is null → shown as "Not stated". No affiliate links. Strict CSP (no inline scripts/styles); calculator in `assets/app.js` + `assets/calc.js`, with no-JS fallbacks (precomputed $5,000 values, prebuilt filter pages served via Vercel query rewrites).

## Settings
- `SITE_URL` (env, required for production): public origin used for canonical links, `og:url`, `robots.txt` and the sitemap. The built-in default `https://offers-compare.vercel.app` is a **placeholder**, not a decided domain; the build warns when `SITE_URL` is unset. Example: `SITE_URL=https://example.com npm run build`.
- Indexing: all V1 pages are `noindex` (`NOINDEX` in build.js), so no `sitemap.xml` is written and `robots.txt` has no `Sitemap:` line. Only indexable pages are ever listed.
