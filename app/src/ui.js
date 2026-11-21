// Sampul Senja v4 — editor UI: control buttons, text inputs, role-tag
// inputs, photo upload, undo/redo, and panel pan/zoom by dragging the
// preview. Every change pushes a history snapshot first, so Ctrl+Z works.

import { LAYOUTS, GRADES, SIZES, TITLE_STYLES, SAMPLE_PHOTOS } from './config.js';
import { panelCount, panelsFor } from './layouts.js';
import { detectFace } from './photos.js';
import { exportSize, exportAll } from './export.js';

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}

function buttonGroup(container, items, current, onPick) {
  container.innerHTML = '';
  items.forEach((it) => {
    const b = el('button', 'chip' + (it.id === current ? ' on' : ''), it.label);
    b.addEventListener('click', () => onPick(it.id));
    container.appendChild(b);
  });
}

export function buildUI(opts) {
  const { state, images, render, onState } = opts;
  const history = { past: [], future: [] };
  const push = () => {
    history.past.push(JSON.stringify(state));
    if (history.past.length > 50) history.past.shift();
    history.future = [];
  };
  const undo = () => {
    if (!history.past.length) return;
    history.future.push(JSON.stringify(state));
    Object.assign(state, JSON.parse(history.past.pop()));
    onState();
  };
  const redo = () => {
    if (!history.future.length) return;
    history.past.push(JSON.stringify(state));
    Object.assign(state, JSON.parse(history.future.pop()));
    onState();
  };
  const change = (fn) => { push(); fn(); onState(); };

  // Header undo/redo.
  document.getElementById('btn-undo').addEventListener('click', undo);
  document.getElementById('btn-redo').addEventListener('click', redo);
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
    if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
  });

  // Photo upload + samples + fill-all.
  const fileInput = document.getElementById('file-photo');
  document.getElementById('btn-upload').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    const f = fileInput.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      change(() => {
        state.panels[state.selectedPanel] = {
          src: reader.result, panX: 0, panY: 0, zoom: 1, face: null,
        };
      });
      faceCheck();
    };
    reader.readAsDataURL(f);
  });
  document.getElementById('btn-fill-all').addEventListener('click', () => {
    const src = state.panels[state.selectedPanel]?.src || 'pier';
    change(() => {
      state.panels = state.panels.map(() => ({ src, panX: 0, panY: 0, zoom: 1, face: null }));
    });
    faceCheck();
  });
  const sampleBox = document.getElementById('samples');
  sampleBox.innerHTML = '';
  SAMPLE_PHOTOS.forEach((s) => {
    const card = el('button', 'sample');
    const img = el('img');
    img.src = s.src;
    img.alt = s.label;
    card.appendChild(img);
    card.appendChild(el('span', '', s.label.replace('Contoh: ', '')));
    card.addEventListener('click', () => {
      change(() => {
        state.panels[state.selectedPanel] = { src: s.id, panX: 0, panY: 0, zoom: 1, face: null };
      });
      faceCheck();
    });
    sampleBox.appendChild(card);
  });

  // Layout / grade / title-style / size pickers.
  const refreshPickers = () => {
    buttonGroup(document.getElementById('layouts'), LAYOUTS, state.layout, (id) => {
      change(() => {
        state.layout = id;
        ensurePanels();
      });
      buildRoleInputs();
    });
    buttonGroup(document.getElementById('grades'), GRADES, state.grade, (id) => change(() => { state.grade = id; }));
    buttonGroup(document.getElementById('title-styles'), TITLE_STYLES, state.titleStyle, (id) => change(() => { state.titleStyle = id; }));
    buttonGroup(document.getElementById('sizes'), SIZES, state.size, (id) => change(() => { state.size = id; }));
  };

  // Text inputs.
  const bindText = (id, key) => {
    const input = document.getElementById(id);
    input.value = state[key];
    input.addEventListener('input', () => { state[key] = input.value; render(); });
    input.addEventListener('change', () => { push(); onState(); });
  };
  ['title', 'subtitle', 'quote', 'tagline', 'credits', 'sealText'].forEach((key) => bindText('in-' + key, key));

  // Toggles.
  const bindToggle = (id, key) => {
    const input = document.getElementById(id);
    input.checked = state[key];
    input.addEventListener('change', () => change(() => { state[key] = input.checked; }));
  };
  bindToggle('tg-frame', 'posterFrame');
  bindToggle('tg-tags', 'showTags');
  bindToggle('tg-seal', 'showSeal');

  // Role-tag inputs, one per panel of the current layout.
  const buildRoleInputs = () => {
    const box = document.getElementById('roles');
    box.innerHTML = '';
    const n = panelCount(state.layout);
    for (let i = 0; i < n; i++) {
      const label = el('label', '', `Panel ${i + 1}`);
      const input = el('input');
      input.type = 'text';
      input.value = state.roles[i] || '';
      input.placeholder = 'THE DRIVER';
      input.addEventListener('input', () => { state.roles[i] = input.value.toUpperCase(); render(); });
      input.addEventListener('change', () => { push(); onState(); });
      label.appendChild(input);
      box.appendChild(label);
    }
  };

  // Zoom slider for the selected panel.
  const zoom = document.getElementById('zoom');
  zoom.addEventListener('input', () => {
    const p = state.panels[state.selectedPanel];
    if (p) { p.zoom = parseFloat(zoom.value); render(); }
  });
  zoom.addEventListener('change', () => { push(); onState(); });

  // Export buttons.
  document.getElementById('btn-export-all').addEventListener('click', async () => {
    await exportAll(state, images);
  });
  document.querySelectorAll('[data-export]').forEach((b) => {
    b.addEventListener('click', async () => {
      await exportSize(state, images, b.dataset.export);
    });
  });

  // Panel select + drag-to-pan on the preview canvas.
  const canvas = document.getElementById('preview');
  let drag = null;
  const geometry = () => {
    const W = canvas.width, H = canvas.height;
    const topH = state.posterFrame ? H * 0.058 : 0;
    const botH = state.posterFrame ? H * 0.052 : 0;
    const titleH = H * 0.205;
    return { W, H, photo: { x: 0, y: topH, w: W, h: H - topH - botH - titleH } };
  };
  const panelAt = (mx, my) => {
    const { photo } = geometry();
    const rects = panelsFor(state.layout);
    for (let i = rects.length - 1; i >= 0; i--) {
      const r = rects[i];
      const x = photo.x + r.x * photo.w, y = photo.y + r.y * photo.h;
      if (mx >= x && mx <= x + r.w * photo.w && my >= y && my <= y + r.h * photo.h) return i;
    }
    return -1;
  };
  const toCanvas = (e) => {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * canvas.width,
      y: ((e.clientY - r.top) / r.height) * canvas.height,
    };
  };
  canvas.addEventListener('pointerdown', (e) => {
    const p = toCanvas(e);
    const i = panelAt(p.x, p.y);
    if (i < 0) return;
    canvas.setPointerCapture(e.pointerId);
    drag = { i, x: p.x, y: p.y, moved: false, panX: state.panels[i]?.panX || 0, panY: state.panels[i]?.panY || 0 };
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const p = toCanvas(e);
    const dx = p.x - drag.x, dy = p.y - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
    if (drag.moved) {
      const { photo } = geometry();
      const r = panelsFor(state.layout)[drag.i];
      const panel = state.panels[drag.i];
      if (panel) {
        panel.panX = drag.panX + dx / (r.w * photo.w);
        panel.panY = drag.panY + dy / (r.h * photo.h);
        render();
      }
    }
  });
  canvas.addEventListener('pointerup', () => {
    if (drag && !drag.moved) {
      state.selectedPanel = drag.i;
      const p = state.panels[drag.i];
      if (p) zoom.value = String(p.zoom || 1);
      render();
    }
    if (drag && drag.moved) push();
    drag = null;
  });

  // Face detection: run for every panel photo, show the indicator.
  async function faceCheck() {
    let found = false;
    for (const slot of state.panels) {
      const img = images[slot.src];
      if (!img) continue;
      const face = await detectFace(img);
      slot.face = face;
      if (face) found = true;
    }
    document.getElementById('face-note').hidden = !found;
    render();
  }

  function ensurePanels() {
    const n = panelCount(state.layout);
    while (state.panels.length < n) {
      state.panels.push({ src: state.panels.length % 2 === 0 ? 'pier' : 'boulevard', panX: 0, panY: 0, zoom: 1, face: null });
    }
    state.panels.length = n;
    if (state.selectedPanel >= n) state.selectedPanel = 0;
  }

  refreshPickers();
  buildRoleInputs();
  ensurePanels();
  faceCheck();
  return { undo, redo, refreshPickers, buildRoleInputs, faceCheck, ensurePanels };
}
