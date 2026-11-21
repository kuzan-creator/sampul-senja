// Dusk Cover Studio — export: renders the cover at an exact size and saves
// it as a PNG, one size or all four. One file, one job: pixels out.
import { renderCover } from "./render.js";
import { SIZES } from "./config.js";

export function renderToCanvas(state, w, h) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  renderCover(canvas.getContext("2d"), state, w, h);
  return canvas;
}

export function exportPNG(state, size) {
  const canvas = renderToCanvas(state, size.w, size.h);
  const a = document.createElement("a");
  a.download = `dusk-cover-${size.id}-${size.w}x${size.h}.png`;
  a.href = canvas.toDataURL("image/png");
  a.click();
}

export function exportAll(state) {
  for (const s of SIZES) exportPNG(state, s);
}
