// Sampul Senja v3 — export: turn the state into PNG files.
// The export renders offscreen at the exact post size, so the downloaded
// PNG is the cover itself, never a screenshot of the editor.

import { SIZES } from './config.js';
import { renderCover, sizeById } from './render.js';

// Render the cover at a size into a fresh canvas and return it.
export function renderToCanvas(state, sizeId, seed = 1) {
  const size = sizeById(sizeId);
  const canvas = document.createElement('canvas');
  canvas.width = size.w;
  canvas.height = size.h;
  const ctx = canvas.getContext('2d');
  renderCover(ctx, size.w, size.h, state, seed);
  return canvas;
}

// A canvas as a PNG blob.
export function canvasToPng(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('PNG failed'))), 'image/png');
  });
}

// Download a blob as a file (a plain anchor click, no network).
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function slug(text) {
  return String(text || 'sampul')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'sampul';
}

// Export the current size. Returns the blob and its exact dimensions.
export async function exportCurrent(state, onStatus) {
  const size = sizeById(state.size);
  onStatus && onStatus(`Mengekspor ${size.name}…`);
  const canvas = renderToCanvas(state, state.size, 1);
  const blob = await canvasToPng(canvas);
  downloadBlob(blob, `${slug(state.title)}-${size.id}.png`);
  onStatus && onStatus(`Tersimpan: ${size.name} PNG.`);
  return { blob, w: size.w, h: size.h };
}

// Export all four sizes, one after another with a short pause so the
// browser does not block the later downloads.
export async function exportAll(state, onStatus) {
  const done = [];
  for (const size of SIZES) {
    onStatus && onStatus(`Mengekspor ${size.name}…`);
    const canvas = renderToCanvas(state, size.id, 1);
    const blob = await canvasToPng(canvas);
    downloadBlob(blob, `${slug(state.title)}-${size.id}.png`);
    done.push({ id: size.id, w: size.w, h: size.h, bytes: blob.size });
    await new Promise((r) => setTimeout(r, 350));
  }
  onStatus && onStatus(`Selesai: 4 PNG (${done.map((d) => d.id).join(', ')}).`);
  return done;
}
