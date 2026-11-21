// Renders a cover onto a canvas: photo panels, colour grade, vignette, grain and caption.
// The canvas size is the cover size, so the same code draws the preview and the export.
import { panelRects } from './layouts.js';
import { GRADES, paintGradeWash } from './grades.js';
import { fitTitleSize, drawTitle, drawSubtitle } from './lettering.js';
import { mulberry32 } from './config.js';

const grainCache = new Map();

/** A small tiled noise pattern, cached per seed so re-renders match. */
function grainPattern(ctx, seed) {
  if (!grainCache.has(seed)) {
    const tile = document.createElement('canvas');
    tile.width = 128;
    tile.height = 128;
    const tctx = tile.getContext('2d');
    const img = tctx.createImageData(128, 128);
    const rnd = mulberry32(seed * 104729 + 7);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 118 + Math.floor(rnd() * 20);
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    tctx.putImageData(img, 0, 0);
    grainCache.set(seed, ctx.createPattern(tile, 'repeat'));
  }
  return grainCache.get(seed);
}

/** Draws one panel's photo, cover-fit, with the panel's zoom and pan.
 * ox/oy run from -0.5 (the photo's top/left edge) to 0.5 (its bottom/right edge),
 * so a pan can reach any part of the photo. */
function drawPanelPhoto(ctx, img, rect, crop) {
  const base = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight) * crop.zoom;
  const dw = img.naturalWidth * base;
  const dh = img.naturalHeight * base;
  const dx = rect.x - (0.5 + crop.ox) * (dw - rect.w);
  const dy = rect.y - (0.5 + crop.oy) * (dh - rect.h);
  ctx.drawImage(img, dx, dy, dw, dh);
}

/** Draws the whole cover for `state` onto `canvas` (its width/height are the cover size). */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const grade = GRADES[state.grade];
  ctx.save();
  ctx.fillStyle = '#160a1e';
  ctx.fillRect(0, 0, w, h);
  const rects = panelRects(state.layout, w, h);
  rects.forEach((rect, i) => {
    const crop = state.panels[i];
    if (!crop) return;
    const photo = state.photos.find((p) => p.id === crop.photoId);
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.clip();
    if (photo) {
      ctx.filter = grade.filter;
      drawPanelPhoto(ctx, photo.img, rect, crop);
      ctx.filter = 'none';
    } else {
      const g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
      g.addColorStop(0, '#3b1d4e');
      g.addColorStop(1, '#1c0b28');
      ctx.fillStyle = g;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
    ctx.restore();
  });
  paintGradeWash(ctx, w, h, state.grade);
  const vig = ctx.createRadialGradient(
    w / 2, h * 0.42, Math.min(w, h) * 0.35,
    w / 2, h / 2, Math.max(w, h) * 0.75,
  );
  vig.addColorStop(0, 'rgba(8, 0, 16, 0)');
  vig.addColorStop(1, 'rgba(8, 0, 16, 0.38)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = grainPattern(ctx, state.seed);
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
  const scrim = ctx.createLinearGradient(0, h * 0.58, 0, h);
  scrim.addColorStop(0, 'rgba(10, 0, 18, 0)');
  scrim.addColorStop(1, 'rgba(10, 0, 18, 0.62)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, 0, w, h);
  const title = (state.title || '').trim().toUpperCase();
  const subtitle = (state.subtitle || '').trim().toUpperCase();
  if (title) {
    const size = fitTitleSize(ctx, title, w * 0.92, h * 0.115 * state.titleScale);
    drawTitle(ctx, title, w / 2, h - h * 0.062, size, grade.title, grade.outline);
  }
  if (subtitle) {
    const subSize = Math.max(12, Math.round(h * 0.115 * state.titleScale * 0.30));
    drawSubtitle(ctx, subtitle, w / 2, h - h * 0.022, subSize);
  }
  ctx.restore();
}
