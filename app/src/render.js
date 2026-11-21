// Renders a cover onto a canvas: photo panels, colour grade, vignette, grain,
// a title block with a halftone fade, a star badge, and the caption.
// The canvas size is the cover size, so the same code draws the preview and the export.
import { panelRects, titleBandRect } from './layouts.js';
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

/** Rows of dots over `rect`, growing toward its bottom edge, like a printed halftone.
 * Seeded, so the same cover re-renders identically. */
function drawHalftone(ctx, rect, seed, color, alpha, maxR) {
  const rnd = mulberry32(seed * 7919 + 5);
  const step = Math.max(10, Math.round(Math.min(rect.w, rect.h) / 60));
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  for (let y = rect.y; y < rect.y + rect.h; y += step) {
    const t = (y - rect.y) / Math.max(1, rect.h);
    const r = 0.5 + t * maxR;
    for (let x = rect.x + step / 2; x < rect.x + rect.w; x += step) {
      const jx = x + (rnd() - 0.5) * step * 0.25;
      ctx.beginPath();
      ctx.arc(jx, y + step / 2, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** The outline of a five-pointed star centred at (cx, cy). */
function starPath(ctx, cx, cy, rOuter, rInner) {
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/** A decorative star badge with ribbon tails, in the grade's palette. */
function drawStarBadge(ctx, cx, cy, r, grade) {
  ctx.save();
  ctx.fillStyle = grade.title[2];
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.45, cy + r * 0.55);
  ctx.lineTo(cx - r * 0.75, cy + r * 1.35);
  ctx.lineTo(cx - r * 0.25, cy + r * 1.05);
  ctx.lineTo(cx + r * 0.25, cy + r * 1.05);
  ctx.lineTo(cx + r * 0.75, cy + r * 1.35);
  ctx.lineTo(cx + r * 0.45, cy + r * 0.55);
  ctx.closePath();
  ctx.fill();
  const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  g.addColorStop(0, grade.title[0]);
  g.addColorStop(0.55, grade.title[1]);
  g.addColorStop(1, grade.title[2]);
  starPath(ctx, cx, cy, r, r * 0.45);
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(2, r * 0.08);
  ctx.strokeStyle = grade.outline;
  ctx.stroke();
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();
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

/** The gradient a panel shows when it holds no photo yet. */
function paintEmptyPanel(ctx, rect) {
  const g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
  g.addColorStop(0, '#3b1d4e');
  g.addColorStop(1, '#1c0b28');
  ctx.fillStyle = g;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
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
    if (rect.tilt) {
      // A tilted snapshot: a white border and a drop shadow, rotated around its centre.
      ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
      ctx.rotate((rect.tilt * Math.PI) / 180);
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = Math.max(8, rect.w * 0.04);
      ctx.shadowOffsetY = Math.max(6, rect.h * 0.02);
      const border = Math.max(6, Math.round(Math.min(rect.w, rect.h) * 0.035));
      ctx.fillStyle = '#fdf8ef';
      ctx.fillRect(-rect.w / 2 - border, -rect.h / 2 - border, rect.w + border * 2, rect.h + border * 2);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.beginPath();
      ctx.rect(-rect.w / 2, -rect.h / 2, rect.w, rect.h);
      ctx.clip();
      if (photo) {
        ctx.filter = grade.filter;
        drawPanelPhoto(ctx, photo.img, { x: -rect.w / 2, y: -rect.h / 2, w: rect.w, h: rect.h }, crop);
        ctx.filter = 'none';
      } else {
        paintEmptyPanel(ctx, { x: -rect.w / 2, y: -rect.h / 2, w: rect.w, h: rect.h });
      }
    } else {
      ctx.beginPath();
      ctx.rect(rect.x, rect.y, rect.w, rect.h);
      ctx.clip();
      if (photo) {
        ctx.filter = grade.filter;
        drawPanelPhoto(ctx, photo.img, rect, crop);
        ctx.filter = 'none';
      } else {
        paintEmptyPanel(ctx, rect);
      }
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
  const title = (state.title || '').trim().toUpperCase();
  // The subtitle keeps the case it was typed in: Pacifico is a script face.
  const subtitle = (state.subtitle || '').trim();
  const band = titleBandRect(state.layout, w, h);
  let titleSize = 0;
  if (band) {
    // A title block: a dark gradient strip with a halftone fade and an accent line,
    // the title and the script subtitle centred inside it.
    const bg = ctx.createLinearGradient(0, band.y, 0, band.y + band.h);
    bg.addColorStop(0, '#1c0b28');
    bg.addColorStop(1, grade.outline);
    ctx.fillStyle = bg;
    ctx.fillRect(band.x, band.y, band.w, band.h);
    ctx.fillStyle = grade.title[1];
    ctx.fillRect(band.x, band.y, band.w, Math.max(3, h * 0.004));
    drawHalftone(ctx, band, state.seed, '#ffffff', 0.16, Math.max(2, h * 0.004));
    if (title) {
      titleSize = fitTitleSize(ctx, title, w * 0.78, band.h * 0.52 * state.titleScale);
      drawTitle(ctx, title, w / 2, band.y + band.h * 0.52, titleSize, grade.title, grade.outline);
    }
    if (subtitle) {
      const subSize = Math.max(12, Math.round((titleSize || band.h * 0.3) * 0.34));
      drawSubtitle(ctx, subtitle, w / 2, band.y + band.h * 0.86, subSize, grade.subtitleGlow);
    }
  } else {
    // The title over the photos: a bottom scrim with a halftone texture above it.
    const scrim = ctx.createLinearGradient(0, h * 0.58, 0, h);
    scrim.addColorStop(0, 'rgba(10, 0, 18, 0)');
    scrim.addColorStop(1, 'rgba(10, 0, 18, 0.62)');
    ctx.fillStyle = scrim;
    ctx.fillRect(0, 0, w, h);
    drawHalftone(ctx, { x: 0, y: h * 0.60, w, h: h * 0.18 }, state.seed, '#ffffff', 0.10, Math.max(2, h * 0.003));
    if (title) {
      titleSize = fitTitleSize(ctx, title, w * 0.92, h * 0.115 * state.titleScale);
      drawTitle(ctx, title, w / 2, h - h * 0.062, titleSize, grade.title, grade.outline);
    }
    if (subtitle) {
      const subSize = Math.max(12, Math.round((titleSize || h * 0.115 * state.titleScale) * 0.34));
      drawSubtitle(ctx, subtitle, w / 2, h - h * 0.022, subSize, grade.subtitleGlow);
    }
  }
  if (state.badge) {
    const r = Math.max(18, Math.round(Math.min(w, h) * 0.052));
    if (band) drawStarBadge(ctx, w - band.h * 0.55, band.y + band.h * 0.5, r, grade);
    else drawStarBadge(ctx, w - r * 1.5, r * 1.5, r, grade);
  }
  ctx.restore();
}
