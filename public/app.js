(() => {
  'use strict';

  // width/height are the CSS viewport the device's browser lays pages out
  // at; pw/ph are the physical screen pixels (viewport × DPR, as marketed).
  const BRANDS = [
    {
      brand: 'iPhone',
      devices: [
        { id: 'iphone-se',      name: 'iPhone SE (2/3)',      width: 375, height: 667, pw: 750,  ph: 1334, dpr: 2,    type: 'iphone-classic' },
        { id: 'iphone-11',      name: 'iPhone 11',            width: 414, height: 896, pw: 828,  ph: 1792, dpr: 2,    type: 'iphone-notch' },
        { id: 'iphone-13-mini', name: 'iPhone 13 Mini',       width: 375, height: 812, pw: 1080, ph: 2340, dpr: 3,    type: 'iphone-notch' },
        { id: 'iphone-14',      name: 'iPhone 13 / 14',       width: 390, height: 844, pw: 1170, ph: 2532, dpr: 3,    type: 'iphone-notch' },
        { id: 'iphone-15',      name: 'iPhone 15',            width: 393, height: 852, pw: 1179, ph: 2556, dpr: 3,    type: 'iphone-dynamic' },
        { id: 'iphone-15-pm',   name: 'iPhone 15 Pro Max',    width: 430, height: 932, pw: 1290, ph: 2796, dpr: 3,    type: 'iphone-dynamic' },
        { id: 'iphone-16',      name: 'iPhone 16',            width: 393, height: 852, pw: 1179, ph: 2556, dpr: 3,    type: 'iphone-dynamic' },
        { id: 'iphone-16-pro',  name: 'iPhone 16 Pro',        width: 402, height: 874, pw: 1206, ph: 2622, dpr: 3,    type: 'iphone-dynamic' },
        { id: 'iphone-16-pm',   name: 'iPhone 16 Pro Max',    width: 440, height: 956, pw: 1320, ph: 2868, dpr: 3,    type: 'iphone-dynamic' },
      ],
    },
    {
      brand: 'Samsung',
      devices: [
        { id: 'galaxy-s21',     name: 'Galaxy S21',           width: 360, height: 800, pw: 1080, ph: 2400, dpr: 3,    type: 'android-punch' },
        { id: 'galaxy-s23',     name: 'Galaxy S23',           width: 360, height: 780, pw: 1080, ph: 2340, dpr: 3,    type: 'android-punch' },
        { id: 'galaxy-s24',     name: 'Galaxy S24',           width: 360, height: 780, pw: 1080, ph: 2340, dpr: 3,    type: 'android-punch' },
        { id: 'galaxy-s24u',    name: 'Galaxy S24 Ultra',     width: 384, height: 832, pw: 1440, ph: 3120, dpr: 3.75, type: 'android-punch' },
        { id: 'galaxy-a54',     name: 'Galaxy A54',           width: 360, height: 780, pw: 1080, ph: 2340, dpr: 3,    type: 'android-punch' },
        { id: 'galaxy-fold',    name: 'Galaxy Z Fold (cover)',width: 344, height: 882, pw: 904,  ph: 2316, dpr: 2.625,type: 'android-punch' },
      ],
    },
    {
      brand: 'Google Pixel',
      devices: [
        { id: 'pixel-6',        name: 'Pixel 6 / 7',          width: 412, height: 915, pw: 1080, ph: 2400, dpr: 2.625,type: 'android-punch' },
        { id: 'pixel-8',        name: 'Pixel 8',              width: 412, height: 915, pw: 1080, ph: 2400, dpr: 2.625,type: 'android-punch' },
        { id: 'pixel-8-pro',    name: 'Pixel 8 Pro',          width: 448, height: 998, pw: 1344, ph: 2992, dpr: 3,    type: 'android-punch' },
        { id: 'pixel-9',        name: 'Pixel 9',              width: 412, height: 923, pw: 1080, ph: 2424, dpr: 2.625,type: 'android-punch' },
      ],
    },
    {
      brand: 'iPad',
      devices: [
        { id: 'ipad-mini',      name: 'iPad Mini (6th gen)',  width: 744, height: 1133, pw: 1488, ph: 2266, dpr: 2,   type: 'tablet' },
        { id: 'ipad-10',        name: 'iPad (10th gen) / Air',width: 820, height: 1180, pw: 1640, ph: 2360, dpr: 2,   type: 'tablet' },
        { id: 'ipad-pro-11',    name: 'iPad Pro 11"',         width: 834, height: 1194, pw: 1668, ph: 2388, dpr: 2,   type: 'tablet' },
        { id: 'ipad-pro-13',    name: 'iPad Pro 12.9"',       width: 1024, height: 1366, pw: 2048, ph: 2732, dpr: 2,  type: 'tablet' },
      ],
    },
  ];

  const DEVICES = BRANDS.flatMap((b) => b.devices);

  const SAMPLE_URL = 'https://example.com';

  const $ = (sel) => document.querySelector(sel);

  const el = {
    urlInput: $('#url-input'),
    loadBtn: $('#load-btn'),
    reloadBtn: $('#reload-btn'),
    shareBtn: $('#share-btn'),
    orientationBtn: $('#orientation-btn'),
    urlNote: $('#url-note'),
    deviceGrid: $('#device-grid'),
    deviceCount: $('#device-count'),
    stage: $('#stage'),
    frameScaler: $('#frame-scaler'),
    deviceFrame: $('#device-frame'),
    iframe: $('#preview-frame'),
    scaleValue: $('#scale-value'),
    zoomInBtn: $('#zoom-in-btn'),
    zoomOutBtn: $('#zoom-out-btn'),
    zoomFitBtn: $('#zoom-fit-btn'),
    rDevice: $('#r-device'),
    rResolution: $('#r-resolution'),
    rViewport: $('#r-viewport'),
    rDpr: $('#r-dpr'),
    rOrientation: $('#r-orientation'),
    themeToggle: $('#theme-toggle'),
  };

  const state = {
    deviceId: 'iphone-15',
    orientation: 'portrait',
    url: '',
    zoom: 'fit', // 'fit' or a number 0.25–2
  };

  const ZOOM_MIN = 0.25;
  const ZOOM_MAX = 2;
  const ZOOM_STEP = 0.25;
  let lastAppliedScale = 1; // what fitScale last rendered, used as the base for +/-

  function normalizeUrl(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }

  function isPlausibleUrl(str) {
    try {
      const u = new URL(str);
      return !!u.hostname && u.hostname.includes('.');
    } catch {
      return false;
    }
  }

  function currentDevice() {
    return DEVICES.find((d) => d.id === state.deviceId) || DEVICES[0];
  }

  function currentDims() {
    const d = currentDevice();
    return state.orientation === 'landscape'
      ? { width: d.height, height: d.width }
      : { width: d.width, height: d.height };
  }

  // Remembers the last model picked within each brand, so inactive brands'
  // dropdowns keep showing a sensible choice.
  const brandChoice = {};
  const brandUi = []; // { brand, card, select, dims } — built once, updated in place

  function pickDevice(id, brand) {
    state.deviceId = id;
    brandChoice[brand] = id;
    updateDeviceGrid();
    applyFrame();
    syncUrlParams();
  }

  function buildDeviceGrid() {
    el.deviceGrid.innerHTML = '';
    BRANDS.forEach((b) => {
      brandChoice[b.brand] = b.devices.some((d) => d.id === state.deviceId)
        ? state.deviceId
        : b.devices[0].id;

      const card = document.createElement('div');
      card.className = 'brand-card';

      const name = document.createElement('span');
      name.className = 'd-name';
      name.textContent = b.brand;

      const selectWrap = document.createElement('div');
      selectWrap.className = 'select-wrap';
      const select = document.createElement('select');
      select.className = 'model-select';
      select.setAttribute('aria-label', `${b.brand} model`);
      b.devices.forEach((d) => {
        const opt = document.createElement('option');
        opt.value = d.id;
        opt.textContent = d.name;
        select.appendChild(opt);
      });
      const arrow = document.createElement('span');
      arrow.className = 'select-arrow';
      arrow.textContent = '▾';
      selectWrap.append(select, arrow);

      const dims = document.createElement('span');
      dims.className = 'd-dims';

      select.addEventListener('change', () => pickDevice(select.value, b.brand));
      // Interacting with an inactive brand's dropdown activates its shown
      // model right away (no `change` fires if the value doesn't change).
      select.addEventListener('focus', () => {
        if (!b.devices.some((d) => d.id === state.deviceId)) {
          pickDevice(select.value, b.brand);
        }
      });
      // Clicking anywhere else on an inactive card activates it too.
      card.addEventListener('click', (e) => {
        if (e.target !== select && !b.devices.some((d) => d.id === state.deviceId)) {
          pickDevice(select.value, b.brand);
        }
      });

      card.append(name, selectWrap, dims);
      el.deviceGrid.appendChild(card);
      brandUi.push({ brand: b, card, select, dims });
    });
    el.deviceCount.textContent = `${DEVICES.length} MODELS · ${BRANDS.length} BRANDS`;
    updateDeviceGrid();
  }

  function updateDeviceGrid() {
    brandUi.forEach(({ brand, card, select, dims }) => {
      const active = brand.devices.some((d) => d.id === state.deviceId);
      const shownId = active ? state.deviceId : brandChoice[brand.brand];
      const shown = brand.devices.find((d) => d.id === shownId) || brand.devices[0];
      card.classList.toggle('selected', active);
      select.value = shown.id;
      dims.textContent = `${shown.pw}×${shown.ph} · ${shown.dpr}x`;
    });
  }

  function applyFrame() {
    const d = currentDevice();
    const { width, height } = currentDims();
    const landscape = state.orientation === 'landscape';
    const [pw, ph] = landscape ? [d.ph, d.pw] : [d.pw, d.ph];

    el.deviceFrame.className =
      'device-frame type-' + d.type + (landscape ? ' landscape' : '');
    el.iframe.style.width = width + 'px';
    el.iframe.style.height = height + 'px';

    el.rDevice.textContent = d.name.toUpperCase();
    el.rResolution.textContent = `${pw}×${ph}`;
    el.rViewport.textContent = `${width}×${height}`;
    el.rDpr.textContent = d.dpr + 'x';
    el.rOrientation.textContent = state.orientation.toUpperCase();

    requestAnimationFrame(fitScale);
  }

  function fitScale() {
    const { width, height } = currentDims();
    const bezel = 28; // device-frame padding (14px each side)
    const frameW = width + bezel;
    const frameH = height + bezel;

    const availW = el.stage.clientWidth - 16;
    const stageTop = el.stage.getBoundingClientRect().top;
    const availH = Math.max(300, window.innerHeight - stageTop - 40);

    const fit = Math.min(1, availW / frameW, availH / frameH);
    const scale = state.zoom === 'fit' ? fit : state.zoom;
    lastAppliedScale = scale;

    // device-frame is sized to its natural (unscaled) footprint so the
    // transform below shrinks it visually without the browser's
    // auto-width block layout shrinking it a second time.
    el.deviceFrame.style.width = frameW + 'px';
    el.deviceFrame.style.height = frameH + 'px';
    el.frameScaler.style.width = Math.round(frameW * scale) + 'px';
    el.frameScaler.style.height = Math.round(frameH * scale) + 'px';
    el.deviceFrame.style.transform = `scale(${scale})`;
    el.deviceFrame.style.transformOrigin = 'top left';

    el.scaleValue.textContent =
      Math.round(scale * 100) + '%' + (state.zoom === 'fit' ? ' · FIT' : '');
    el.zoomFitBtn.classList.toggle('selected', state.zoom === 'fit');
  }

  function stepZoom(dir) {
    const base = state.zoom === 'fit' ? lastAppliedScale : state.zoom;
    const stepped = Math.round((base + dir * ZOOM_STEP) / ZOOM_STEP) * ZOOM_STEP;
    state.zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, stepped));
    fitScale();
    syncUrlParams();
  }

  async function checkFrameBlocked(target) {
    // Asks our serverless endpoint whether the site sends frame-blocking
    // headers. Returns null when the endpoint isn't available (e.g. when
    // running as a plain static server with no /api routes).
    try {
      const resp = await fetch(`/api/proxy?mode=check&url=${encodeURIComponent(target)}`, {
        signal: AbortSignal.timeout(12000),
      });
      if (!resp.ok) return null;
      const data = await resp.json();
      return typeof data.blocked === 'boolean' ? data.blocked : null;
    } catch {
      return null;
    }
  }

  async function loadUrl(rawInput) {
    let target = normalizeUrl(rawInput);

    if (!target) {
      target = SAMPLE_URL;
      el.urlInput.value = SAMPLE_URL;
    }

    if (!isPlausibleUrl(target)) {
      showNote('That doesn’t look like a valid URL.', 'error');
      return;
    }

    state.url = target;
    el.stage.classList.add('has-content');
    showNote('CHECKING_EMBED_POLICY...', '');
    syncUrlParams();

    const blocked = await checkFrameBlocked(target);
    if (state.url !== target) return; // a newer load superseded this one

    if (blocked === true) {
      el.iframe.src = `/api/proxy?url=${encodeURIComponent(target)}`;
      showNote(`${target} blocks embedding — routed through the proxy (anonymous, logged-out view; complex apps may not fully work).`, 'ok');
    } else {
      el.iframe.src = target;
      showNote(
        blocked === false
          ? `Loaded ${target} directly.`
          : `Loaded ${target} — if the frame stays blank, the site is likely blocking embedding (X-Frame-Options).`,
        'ok'
      );
    }
  }

  function showNote(msg, kind) {
    el.urlNote.textContent = msg;
    el.urlNote.className = 'inline-note' + (kind ? ' ' + kind : '');
  }

  function syncUrlParams() {
    if (!state.url) return;
    const params = new URLSearchParams();
    params.set('url', state.url);
    params.set('device', state.deviceId);
    params.set('orientation', state.orientation);
    if (state.zoom !== 'fit') params.set('zoom', String(state.zoom));
    const newUrl = `${location.pathname}?${params.toString()}`;
    history.replaceState(null, '', newUrl);
  }

  function loadFromQueryParams() {
    const params = new URLSearchParams(location.search);
    const qUrl = params.get('url');
    const qDevice = params.get('device');
    const qOrientation = params.get('orientation');

    if (qDevice && DEVICES.some((d) => d.id === qDevice)) {
      state.deviceId = qDevice;
      const owner = BRANDS.find((b) => b.devices.some((d) => d.id === qDevice));
      if (owner) brandChoice[owner.brand] = qDevice;
    }
    if (qOrientation === 'landscape' || qOrientation === 'portrait') state.orientation = qOrientation;
    const qZoom = parseFloat(params.get('zoom'));
    if (!Number.isNaN(qZoom) && qZoom >= ZOOM_MIN && qZoom <= ZOOM_MAX) state.zoom = qZoom;
    updateDeviceGrid();
    applyFrame();
    if (qUrl) {
      el.urlInput.value = qUrl;
      loadUrl(qUrl);
    }
  }

  function initTheme() {
    const saved = localStorage.getItem('mv-theme');
    document.documentElement.setAttribute('data-theme', saved === 'light' ? 'light' : 'dark');
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('mv-theme', next);
  }

  el.loadBtn.addEventListener('click', () => loadUrl(el.urlInput.value));
  el.urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') loadUrl(el.urlInput.value);
  });

  el.reloadBtn.addEventListener('click', () => {
    if (!state.url) return;
    const src = el.iframe.src;
    el.iframe.src = 'about:blank';
    requestAnimationFrame(() => { el.iframe.src = src; });
  });

  el.orientationBtn.addEventListener('click', () => {
    state.orientation = state.orientation === 'portrait' ? 'landscape' : 'portrait';
    applyFrame();
    syncUrlParams();
  });

  el.zoomInBtn.addEventListener('click', () => stepZoom(1));
  el.zoomOutBtn.addEventListener('click', () => stepZoom(-1));
  el.zoomFitBtn.addEventListener('click', () => {
    state.zoom = 'fit';
    fitScale();
    syncUrlParams();
  });

  el.shareBtn.addEventListener('click', async () => {
    syncUrlParams();
    const link = location.href;
    try {
      await navigator.clipboard.writeText(link);
      showNote('Link copied to clipboard.', 'ok');
    } catch {
      showNote(link, 'ok');
    }
  });

  el.themeToggle.addEventListener('click', toggleTheme);

  window.addEventListener('resize', () => requestAnimationFrame(fitScale));

  initTheme();
  buildDeviceGrid();
  applyFrame();
  loadFromQueryParams();
})();
