// Sampul Senja v3 — main: the app's entry point.
// Loads the fonts and the sample photos, builds the editor, applies a
// deterministic shot when the URL asks for one, and renders.

import { defaultState } from './config.js';
import { photoBook } from './photos.js';
import { Editor } from './ui.js';
import { applyShot } from './shots.js';

async function start() {
  const state = defaultState();
  const root = document.getElementById('app');
  const editor = new Editor(root, state, {
    onRender: () => {
      document.body.classList.add('ready');
    },
  });
  // The three fonts must be loaded before the first canvas render, or the
  // lettering falls back to a system font.
  try {
    await Promise.all([
      document.fonts.load('40px Anton'),
      document.fonts.load('40px Pacifico'),
      document.fonts.load('40px "Bebas Neue"'),
    ]);
    await document.fonts.ready;
  } catch (err) {
    // Fonts failing to load is not fatal: the canvas still renders.
  }
  await photoBook.loadSamples();
  editor.refreshThumbs();
  await applyShot(state, editor);
  editor.render();
  window.__sampul = { state, editor };
}

start();
