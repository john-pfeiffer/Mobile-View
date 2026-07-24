# Mobile_View

Paste a link, pick a device, see the exact page at true phone and tablet
dimensions — rendered live in an iframe, nothing uploaded or stored.

No build step, no server, no dependencies. It's three static files.

## Run it

Open `index.html` directly in a browser, or serve the folder locally:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Features

- **Device presets** — iPhone SE, iPhone 15, iPhone 15 Pro Max, Galaxy S23,
  Pixel 8, Galaxy Z Fold (cover), iPad Mini, iPad Pro 11", each rendered at
  its real CSS pixel dimensions so responsive breakpoints fire correctly.
- **Portrait / landscape** toggle.
- **Shareable links** — the current URL, device, and orientation are encoded
  in the query string (`[ COPY_LINK ]`), so a reviewer opens the same frame.
- **Light / dark theme** toggle, saved locally.

## Embed-blocked sites

Some sites send `X-Frame-Options` or a `frame-ancestors` CSP directive that
blocks iframe embedding ("refused to connect"). When deployed on Vercel,
`api/proxy.js` handles this automatically: the app first checks the site's
headers, and if framing is blocked it fetches the page server-side, strips
the frame-blocking headers, injects a `<base>` tag so assets resolve
against the original origin, and serves it from our own origin.

Limitations and properties of the proxy:

- Fetches are **anonymous** — no cookies or auth are forwarded in either
  direction, so logged-in views won't render.
- Private/internal hosts are rejected (SSRF guard); only `http(s)` URLs to
  public hosts are fetched.
- Heavy client-side apps may not fully work through the proxy; simple
  marketing/content pages work best.
- When running as a plain static server (no `/api` routes), the app
  gracefully falls back to direct embedding.

## Style

Visual language follows the [EVS Records](https://www.evsrecords.com/)
tools pages: black background, `UPPERCASE_SNAKE_CASE` panel labels,
hairline borders, zero corner radius, bracket-style buttons, a film-grain
overlay on the site chrome (never on the device mockup), and a neon-green
accent for status/active state.

Typography is the [Geist](https://vercel.com/font) family, self-hosted in
`fonts/` (SIL OFL 1.1, license included): Geist for body text, Geist Mono
for technical labels and readouts, and Geist Pixel (Square) for display
headings.
