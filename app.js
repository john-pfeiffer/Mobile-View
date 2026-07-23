(() => {
  'use strict';

  const DEVICES = [
    { id: 'iphone-se',      name: 'iPhone SE',            width: 375, height: 667,  dpr: 2,   type: 'iphone-classic' },
    { id: 'iphone-15',      name: 'iPhone 15',            width: 393, height: 852,  dpr: 3,   type: 'iphone-notch' },
    { id: 'iphone-15-pm',   name: 'iPhone 15 Pro Max',    width: 430, height: 932,  dpr: 3,   type: 'iphone-dynamic' },
    { id: 'galaxy-s23',     name: 'Galaxy S23',           width: 360, height: 780,  dpr: 3,   type: 'android-punch' },
    { id: 'pixel-8',        name: 'Pixel 8',              width: 412, height: 915,  dpr: 2.6, type: 'android-punch' },
    { id: 'galaxy-fold',    name: 'Galaxy Z Fold (cover)',width: 344, height: 882,  dpr: 2.8, type: 'android-punch' },
    { id: 'ipad-mini',      name: 'iPad Mini',            width: 768, height: 1024, dpr: 2,   type: 'tablet' },
    { id: 'ipad-pro-11',    name: 'iPad Pro 11"',         width: 834, height: 1194, dpr: 2,   type: 'tablet' },
  ];

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
    rDevice: $('#r-device'),
    rWidth: $('#r-width'),
    rHeight: $('#r-height'),
    rDpr: $('#r-dpr'),
    rOrientation: $('#r-orientation'),
    themeToggle: $('#theme-toggle'),
  };

  const state = {
    deviceId: DEVICES[1].id,
    orientation: 'portrait',
    url: '',
  };

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

  function renderDeviceGrid() {
    el.deviceGrid.innerHTML = '';
    DEVICES.forEach((d) => {
      const btn = document.createElement('button');
      btn.className = 'device-btn' + (d.id === state.deviceId ? ' selected' : '');
      btn.innerHTML = `<span class="d-name">${d.name}</span><span class="d-dims">${d.width}×${d.height} · ${d.dpr}x</span>`;
      btn.addEventListener('click', () => {
        state.deviceId = d.id;
        renderDeviceGrid();
        applyFrame();
        syncUrlParams();
      });
      el.deviceGrid.appendChild(btn);
    });
    el.deviceCount.textContent = `${DEVICES.length} PRESETS`;
  }

  function applyFrame() {
    const d = currentDevice();
    const { width, height } = currentDims();

    el.deviceFrame.className = 'device-frame type-' + d.type;
    el.iframe.style.width = width + 'px';
    el.iframe.style.height = height + 'px';

    el.rDevice.textContent = d.name.toUpperCase();
    el.rWidth.textContent = width + 'px';
    el.rHeight.textContent = height + 'px';
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

    const scale = Math.min(1, availW / frameW, availH / frameH);

    // device-frame is sized to its natural (unscaled) footprint so the
    // transform below shrinks it visually without the browser's
    // auto-width block layout shrinking it a second time.
    el.deviceFrame.style.width = frameW + 'px';
    el.deviceFrame.style.height = frameH + 'px';
    el.frameScaler.style.width = Math.round(frameW * scale) + 'px';
    el.frameScaler.style.height = Math.round(frameH * scale) + 'px';
    el.deviceFrame.style.transform = `scale(${scale})`;
    el.deviceFrame.style.transformOrigin = 'top left';

    el.scaleValue.textContent = Math.round(scale * 100) + '%';
  }

  function loadUrl(rawInput) {
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
    el.iframe.src = target;
    el.stage.classList.add('has-content');
    showNote(`Loaded ${target} — if the frame stays blank, the site is likely blocking embedding (X-Frame-Options).`, 'ok');
    syncUrlParams();
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
    const newUrl = `${location.pathname}?${params.toString()}`;
    history.replaceState(null, '', newUrl);
  }

  function loadFromQueryParams() {
    const params = new URLSearchParams(location.search);
    const qUrl = params.get('url');
    const qDevice = params.get('device');
    const qOrientation = params.get('orientation');

    if (qDevice && DEVICES.some((d) => d.id === qDevice)) state.deviceId = qDevice;
    if (qOrientation === 'landscape' || qOrientation === 'portrait') state.orientation = qOrientation;
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
  renderDeviceGrid();
  applyFrame();
  loadFromQueryParams();
})();
