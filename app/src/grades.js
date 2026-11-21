// Sampul Senja v3 — grades: the colour treatment of a cover.
// A grade is a canvas filter on the photo plus a tinted overlay, a vignette
// and a seeded grain pass, so every grade reads as one coherent look.

import { GRADES, rng } from './config.js';

export function gradeById(id) {
  return GRADES.find((g) => g.id === id) || GRADES[0];
}

// Paint a grade's overlay tint over a rect (after the photo is drawn).
export function paintGradeOverlay(ctx, grade, rect) {
  const grad = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h);
  grad.addColorStop(0, grade.overlay[0]);
  grad.addColorStop(1, grade.overlay[1]);
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = grad;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}

// A soft dark vignette around a rect, so panels feel like poster art.
export function paintVignette(ctx, rect) {
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  const r = Math.max(rect.w, rect.h) * 0.72;
  const grad = ctx.createRadialGradient(cx, cy, r * 0.45, cx, cy, r);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.34)');
  ctx.save();
  ctx.fillStyle = grad;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}

// Seeded film grain over the whole cover: deterministic, so two renders of
// the same state are byte-identical.
export function paintGrain(ctx, W, H, seed) {
  const rand = rng(seed);
  const step = Math.max(3, Math.round(W / 360));
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = '#ffffff';
  for (let y = 0; y < H; y += step) {
    for (let x = 0; x < W; x += step) {
      if (rand() > 0.5) ctx.fillRect(x, y, 1.4, 1.4);
    }
  }
  ctx.restore();
}

// Halftone dots in a band: rows of dots fading out, the classic poster print.
export function paintHalftone(ctx, rect, colour, seed) {
  const rand = rng(seed + 7);
  const gap = Math.max(7, rect.h / 7);
  ctx.save();
  ctx.fillStyle = colour;
  let row = 0;
  for (let y = rect.y + gap / 2; y < rect.y + rect.h; y += gap, row++) {
    const fade = 1 - row / Math.max(1, Math.ceil(rect.h / gap));
    for (let x = rect.x + gap / 2; x < rect.x + rect.w; x += gap) {
      const r = (gap * 0.26) * (0.4 + 0.6 * fade) * (0.85 + rand() * 0.3);
      ctx.globalAlpha = 0.10 + 0.30 * fade;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}
