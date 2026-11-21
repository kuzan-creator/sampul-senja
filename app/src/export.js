// Exports the current cover as a PNG file at one of the three post sizes.
import { SIZES } from './config.js';
import { drawCover } from './render.js';

/** Renders the cover at `sizeId` and resolves to a PNG blob. */
export function renderPNG(state, sizeId) {
  const size = SIZES[sizeId];
  const canvas = document.createElement('canvas');
  canvas.width = size.w;
  canvas.height = size.h;
  drawCover(canvas, state);
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/png'));
}

/** Downloads a blob as a file. */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/** Exports the cover at `sizeId` and downloads it as sampul-senja-<w>x<h>.png. */
export async function exportSize(state, sizeId) {
  const size = SIZES[sizeId];
  const blob = await renderPNG(state, sizeId);
  downloadBlob(blob, `sampul-senja-${size.w}x${size.h}.png`);
  return blob;
}
