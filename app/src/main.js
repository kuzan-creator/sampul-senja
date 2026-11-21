// Sampul Senja v4 — entry point. Loads the OFL fonts and the kit sample
// photos, applies a deterministic ?shot= preset when one is given, and
// renders the preview. In cover mode (?shot=cover*) the editor chrome is
// hidden and the canvas fills the viewport, so a screenshot of the page is
// the exported cover itself.

import { defaultState, SIZES } from './config.js';
import { panelCount } from './layouts.js';
import { loadImage } from './photos.js';
import { renderCover } from './render.js';
import { buildUI } from './ui.js';
import { shotFromUrl, applyShot, SHOTS } from './shots.js';

const canvas = document.getElementById('preview');
let state = defaultState();
const images = {};
let ui = null;

async function loadFonts() {
  const faces = [
    ['Anton', 'vendor/Anton-Regular.ttf', 400],
    ['Bebas Neue', 'vendor/BebasNeue-Regular.ttf', 400],
    ['Pacifico', 'vendor/Pacifico-Regular.ttf', 400],
  ];
  await Promise.all(faces.map(async ([family, url, weight]) => {
    try {
      const face = new FontFace(family, `url(${url})`, { weight: String(weight) });
      const loaded = await face.load();
      document.fonts.add(loaded);
    } catch (e) {
      // The canvas falls back to a system font; the app still works.
    }
  }));
  await document.fonts.ready;
}

function previewSize() {
  const size = SIZES.find((s) => s.id === state.size) || SIZES[2];
  const w = 960;
  return { w, h: Math.round((w * size.h) / size.w) };
}

function render() {
  const shot = shotFromUrl();
  if (shot && SHOTS[shot].mode === 'cover') {
    renderCover(canvas, state, images, window.innerWidth, window.innerHeight);
    return;
  }
  const { w, h } = previewSize();
  renderCover(canvas, state, images, w, h);
}

async function init() {
  await loadFonts();
  const [pier, boulevard] = await Promise.all([
    loadImage('samples/pier.jpg'),
    loadImage('samples/boulevard.jpg'),
  ]);
  images.pier = pier;
  images.boulevard = boulevard;

  const shot = shotFromUrl();
  if (shot) {
    state = applyShot(state, shot);
    if (SHOTS[shot].mode === 'cover') {
      document.body.classList.add('cover-mode');
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
    }
  } else {
    // Default editor state: poster layout, alternating samples.
    const n = panelCount(state.layout);
    state.panels = Array.from({ length: n }, (_, i) => ({
      src: i % 2 === 0 ? 'pier' : 'boulevard', panX: 0, panY: 0, zoom: 1, face: null,
    }));
  }
  if (shot && SHOTS[shot].mode !== 'cover') {
    // Editor preset: keep the editor chrome, apply the shot's state.
    const n = panelCount(state.layout);
    while (state.panels.length < n) {
      state.panels.push({ src: 'pier', panX: 0, panY: 0, zoom: 1, face: null });
    }
  }

  ui = buildUI({ state, images, render, onState: () => { ui.refreshPickers(); ui.buildRoleInputs(); render(); } });
  render();

  // Test hook: the Playwright checks drive the app through this.
  window.__sampul = { get state() { return state; }, images, render, ui };
}

init();
