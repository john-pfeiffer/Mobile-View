// Vercel serverless function: fetches a page server-side so it can be
// embedded in the preview iframe even when the site sends X-Frame-Options
// or a CSP frame-ancestors directive.
//
// Modes:
//   /api/proxy?mode=check&url=...  -> JSON { blocked, status } (does the
//                                     site send frame-blocking headers?)
//   /api/proxy?url=...             -> the page HTML with frame-blocking
//                                     headers stripped and a <base> tag
//                                     injected so relative assets resolve
//                                     against the original origin.
//
// Privacy/safety properties:
//   - No cookies or auth are ever forwarded in either direction; every
//     fetch is anonymous, so the proxy can only see what a logged-out
//     visitor sees.
//   - Private/internal hosts are rejected (SSRF guard).
//   - Non-HTML responses redirect to the real URL instead of proxying.

const FETCH_TIMEOUT_MS = 10000;
const MAX_HTML_BYTES = 3 * 1024 * 1024;

const PRIVATE_HOST_RE = /^(localhost|.*\.local|.*\.internal)$/i;
const PRIVATE_IP_RE = new RegExp(
  '^(0\\.|10\\.|127\\.|169\\.254\\.|192\\.168\\.|172\\.(1[6-9]|2\\d|3[01])\\.|100\\.(6[4-9]|[7-9]\\d|1[01]\\d|12[0-7])\\.)'
);

function validateTarget(raw) {
  let u;
  try {
    u = new URL(raw);
  } catch {
    return { error: 'invalid_url' };
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    return { error: 'unsupported_scheme' };
  }
  const host = u.hostname;
  const isPrivate =
    PRIVATE_HOST_RE.test(host) ||
    PRIVATE_IP_RE.test(host) ||
    host.startsWith('[') || // IPv6 literals (::1, fd00::, link-local, ...)
    !host.includes('.');
  if (isPrivate && !process.env.MV_ALLOW_PRIVATE) {
    return { error: 'private_host_blocked' };
  }
  return { url: u };
}

function framingBlocked(headers) {
  if (headers.get('x-frame-options')) return true;
  const csp = headers.get('content-security-policy') || '';
  return /frame-ancestors/i.test(csp);
}

async function fetchTarget(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9',
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

function injectBase(html, baseHref) {
  const tag = `<base href="${baseHref.replace(/"/g, '&quot;')}">`;
  const headMatch = html.match(/<head[^>]*>/i);
  if (headMatch) {
    const idx = headMatch.index + headMatch[0].length;
    return html.slice(0, idx) + tag + html.slice(idx);
  }
  return tag + html;
}

module.exports = async function handler(req, res) {
  const raw = req.query.url;
  if (!raw) {
    res.status(400).json({ error: 'missing_url' });
    return;
  }

  const target = validateTarget(raw);
  if (target.error) {
    res.status(400).json({ error: target.error });
    return;
  }

  let upstream;
  try {
    upstream = await fetchTarget(target.url.href);
  } catch (err) {
    const reason = err && err.name === 'AbortError' ? 'timeout' : 'fetch_failed';
    res.status(502).json({ error: reason });
    return;
  }

  // Validate the post-redirect landing host too.
  const finalUrl = upstream.url || target.url.href;
  const finalCheck = validateTarget(finalUrl);
  if (finalCheck.error) {
    res.status(400).json({ error: finalCheck.error });
    return;
  }

  if (req.query.mode === 'check') {
    res.setHeader('cache-control', 's-maxage=300');
    res.status(200).json({
      blocked: framingBlocked(upstream.headers),
      status: upstream.status,
    });
    return;
  }

  const contentType = upstream.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    // Assets and other non-documents aren't frame-blocked; let the
    // browser fetch them from the source directly.
    res.setHeader('location', finalUrl);
    res.status(302).end();
    return;
  }

  let html;
  try {
    html = await upstream.text();
  } catch {
    res.status(502).json({ error: 'read_failed' });
    return;
  }
  if (html.length > MAX_HTML_BYTES) {
    html = html.slice(0, MAX_HTML_BYTES);
  }

  res.setHeader('content-type', 'text/html; charset=utf-8');
  res.setHeader('cache-control', 's-maxage=60, stale-while-revalidate=600');
  // Intentionally no X-Frame-Options / CSP on our response: this document
  // exists to be framed by the viewer. The iframe's sandbox attribute
  // (no allow-top-navigation) keeps frame-busting scripts contained.
  res.status(upstream.status).send(injectBase(html, finalUrl));
};
