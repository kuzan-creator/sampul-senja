// Sampul Senja v4 — the cover renderer. One function draws the whole
// poster on any canvas at any size: the poster frame, the photo panels with
// their grade, the role tags, the title block, the tagline ribbon, and the
// gold seal. Deterministic: the same state always draws the same pixels
// (the barcode stripes come from a fixed pattern, not Math.random).

import { panelsFor } from './layouts.js';
import { gradeOf } from './grades.js';
import { drawCover } from './photos.js';
import {
  drawChromeTitle, drawGradientTitle, drawScriptSubtitle, drawHalftone, starPath,
} from './lettering.js';

const INK = '#14082a';
const GOLD = '#ffd76a';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawBarcode(ctx, x, y, w, h) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#111111';
  // Fixed stripe pattern, so every render is identical.
  const pattern = [2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 1, 3, 1, 2, 1, 4, 1, 1, 2, 3];
  let px = x + 3;
  let i = 0;
  while (px < x + w - 4) {
    const bw = pattern[i % pattern.length] * (w / 90);
    ctx.fillRect(px, y + 2, bw, h - 4);
    px += bw + (w / 90);
    i++;
  }
}

function drawRoleTag(ctx, x, y, h, text) {
  ctx.font = `400 ${h * 0.62}px "Bebas Neue", sans-serif`;
  const tw = ctx.measureText(text).width;
  const w = tw + h * 1.1;
  ctx.fillStyle = 'rgba(10,5,20,0.92)';
  roundRect(ctx, x, y, w, h, h * 0.22);
  ctx.fill();
  // Yellow slash at the tag's left edge.
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.moveTo(x + h * 0.22, y + h * 0.14);
  ctx.lineTo(x + h * 0.42, y + h * 0.14);
  ctx.lineTo(x + h * 0.30, y + h * 0.86);
  ctx.lineTo(x + h * 0.10, y + h * 0.86);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + h * 0.58, y + h * 0.54);
}

function drawSeal(ctx, cx, cy, r, text) {
  const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.1, cx, cy, r);
  g.addColorStop(0, '#ffe9ad');
  g.addColorStop(0.55, '#f5b942');
  g.addColorStop(1, '#b97f16');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = Math.max(1.5, r * 0.07);
  ctx.strokeStyle = '#8a5c0e';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(138,92,14,0.7)';
  ctx.lineWidth = Math.max(1, r * 0.03);
  ctx.stroke();
  // Star on top, text curved by splitting into two lines.
  ctx.fillStyle = '#7a4d08';
  starPath(ctx, cx, cy - r * 0.34, r * 0.24);
  ctx.fill();
  ctx.fillStyle = '#5d3a05';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const words = text.split(' ');
  const lines = words.length > 2
    ? [words.slice(0, 2).join(' '), words.slice(2).join(' ')]
    : [text];
  const fs = r * 0.21;
  ctx.font = `400 ${fs}px "Bebas Neue", sans-serif`;
  lines.forEach((line, i) => {
    ctx.fillText(line, cx, cy + r * 0.18 + i * fs * 1.15);
  });
}

function drawRibbon(ctx, cx, y, w, h, text) {
  const slant = h * 0.5;
  const g = ctx.createLinearGradient(cx - w / 2, y, cx + w / 2, y);
  g.addColorStop(0, '#ff7a18');
  g.addColorStop(1, '#ff2e88');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(cx - w / 2 + slant, y);
  ctx.lineTo(cx + w / 2 - slant, y);
  ctx.lineTo(cx + w / 2, y + h);
  ctx.lineTo(cx - w / 2, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `400 ${h * 0.52}px "Bebas Neue", sans-serif`;
  ctx.fillText(text, cx, y + h * 0.54);
}

export function renderCover(canvas, state, images, W, H) {
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const frame = state.posterFrame;
  const topH = frame ? H * 0.058 : 0;
  const botH = frame ? H * 0.052 : 0;
  const titleH = H * 0.205;
  const photo = { x: 0, y: topH, w: W, h: H - topH - botH - titleH };

  // Backdrop.
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, H);

  // Photo panels.
  const rects = panelsFor(state.layout);
  const grade = gradeOf(state.grade);
  rects.forEach((frac, i) => {
    const slot = state.panels[i] || {};
    const img = images[slot.src] || images.pier || null;
    const r = {
      x: photo.x + frac.x * photo.w,
      y: photo.y + frac.y * photo.h,
      w: frac.w * photo.w,
      h: frac.h * photo.h,
    };
    ctx.save();
    if (frac.tilt) {
      ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
      ctx.rotate((frac.tilt * Math.PI) / 180);
      ctx.translate(-r.w / 2, -r.h / 2);
      ctx.beginPath();
      ctx.rect(0, 0, r.w, r.h);
      ctx.clip();
      if (img) {
        ctx.filter = grade.filter;
        drawCover(ctx, img, { x: 0, y: 0, w: r.w, h: r.h }, slot);
        ctx.filter = 'none';
        const wash = ctx.createLinearGradient(0, 0, 0, r.h);
        wash.addColorStop(0, grade.wash[0]);
        wash.addColorStop(1, grade.wash[1]);
        ctx.fillStyle = wash;
        ctx.fillRect(0, 0, r.w, r.h);
      }
      ctx.lineWidth = Math.max(2, W * 0.002);
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(0, 0, r.w, r.h);
      if (state.showTags) drawRoleTag(ctx, r.w * 0.04, r.h * 0.04, Math.min(r.h * 0.09, 30), state.roles[i] || '');
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.rect(r.x, r.y, r.w, r.h);
      ctx.clip();
      if (img) {
        ctx.filter = grade.filter;
        drawCover(ctx, img, r, slot);
        ctx.filter = 'none';
        const wash = ctx.createLinearGradient(r.x, r.y, r.x, r.y + r.h);
        wash.addColorStop(0, grade.wash[0]);
        wash.addColorStop(1, grade.wash[1]);
        ctx.fillStyle = wash;
        ctx.fillRect(r.x, r.y, r.w, r.h);
      }
      ctx.lineWidth = Math.max(2, W * 0.002);
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(r.x, r.y, r.w, r.h);
      if (state.showTags) drawRoleTag(ctx, r.x + r.w * 0.03, r.y + r.h * 0.04, Math.min(r.h * 0.085, 30), state.roles[i] || '');
      ctx.restore();
    }
  });

  // Title block: halftone, title, script subtitle, tagline ribbon.
  const ty = photo.y + photo.h;
  drawHalftone(ctx, W * 0.06, ty + H * 0.018, W * 0.88, Math.max(1.5, W * 0.0022), '#ffffff');
  const titleY = ty + H * 0.115;
  if (state.titleStyle === 'krom') {
    drawChromeTitle(ctx, state.title, W / 2, titleY, W * 0.92, H * 0.085);
  } else {
    drawGradientTitle(ctx, state.title, W / 2, titleY, W * 0.92, H * 0.085);
  }
  drawScriptSubtitle(ctx, state.subtitle, W / 2, ty + H * 0.165, W * 0.8, H * 0.032);
  drawRibbon(ctx, W / 2, ty + H * 0.178, W * 0.52, H * 0.024, state.tagline);

  // Gold seal, overlapping the photo area's top-right corner.
  if (state.showSeal) {
    drawSeal(ctx, W - W * 0.055, photo.y + H * 0.055, W * 0.048, state.sealText);
  }

  // Poster frame: top quote bar and bottom credits bar.
  if (frame) {
    // Top bar: stars left, quote centred, VOL. 1 badge right. The quote is
    // shrunk until it fits the symmetric space around the centre between
    // the stars and the badge, so it never overlaps them on narrow covers
    // (story, square).
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = `400 ${H * 0.028}px sans-serif`;
    const stars = '★★★★★';
    const starsW = ctx.measureText(stars).width;
    ctx.fillText(stars, W * 0.025, topH * 0.52);
    const quoteText = `"${state.quote}"`;
    const gap = W * 0.02;
    const avail = Math.min(W / 2 - (W * 0.025 + starsW) - gap, W * 0.90 - W / 2 - gap);
    const quoteMaxW = Math.max(80, avail * 2);
    let qpx = H * 0.02;
    ctx.font = `italic 400 ${qpx}px Georgia, serif`;
    while (qpx > H * 0.011 && ctx.measureText(quoteText).width > quoteMaxW) {
      qpx -= 0.5;
      ctx.font = `italic 400 ${qpx}px Georgia, serif`;
    }
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillText(quoteText, W / 2, topH * 0.52);
    ctx.fillStyle = GOLD;
    roundRect(ctx, W * 0.90, topH * 0.18, W * 0.075, topH * 0.64, topH * 0.2);
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.font = `400 ${H * 0.02}px "Bebas Neue", sans-serif`;
    ctx.fillText('VOL. 1', W * 0.9375, topH * 0.54);
    // Bottom bar.
    const by = H - botH;
    ctx.textAlign = 'left';
    ctx.fillStyle = GOLD;
    ctx.font = `400 ${H * 0.022}px Anton, sans-serif`;
    ctx.fillText('COMING SOON', W * 0.025, by + botH * 0.55);
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = `400 ${H * 0.016}px "Bebas Neue", sans-serif`;
    ctx.fillText(state.credits, W / 2, by + botH * 0.55);
    drawBarcode(ctx, W * 0.90, by + botH * 0.22, W * 0.075, botH * 0.56);
  }
  return canvas;
}
