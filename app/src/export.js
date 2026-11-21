// Sampul Senja v4 — PNG export. Each size renders the same state on an
// offscreen canvas at its exact pixel dimensions and downloads as a PNG;
// "Export semua ukuran" renders all four in turn.

import { SIZES } from './config.js';
import { renderCover } from './render.js';

function download(canvas, filename) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      resolve(blob);
    }, 'image/png');
  });
}

export async function exportSize(state, images, sizeId) {
  const size = SIZES.find((s) => s.id === sizeId) || SIZES[0];
  const canvas = document.createElement('canvas');
  renderCover(canvas, state, images, size.w, size.h);
  const slug = state.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cover';
  await download(canvas, `sampul-senja-${slug}-${size.w}x${size.h}.png`);
  return { w: size.w, h: size.h };
}

export async function exportAll(state, images) {
  const done = [];
  for (const size of SIZES) {
    done.push(await exportSize(state, images, size.id));
    // Let the UI breathe between downloads.
    await new Promise((r) => setTimeout(r, 120));
  }
  return done;
}
