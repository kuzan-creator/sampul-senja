// Sampul Senja v3 — lettering: every word on the cover.
// Title (Anton, striped retro-chrome or smooth gradient), subtitle (Pacifico
// script with a neon glow), role tags, the tagline ribbon, the gold seal and
// the poster frame's bars. All drawn on canvas, so the export matches the
// preview exactly.

import { FONTS, rng } from './config.js';

// Fit a font size so `text` fits `maxW` (and never exceeds `cap`).
export function fitFont(ctx, text, maxW, cap, family, weight = '') {
  let size = cap;
  ctx.font = `${weight} ${size}px ${family}`;
  const w = ctx.measureText(text).width;
  if (w > maxW) size = Math.max(8, Math.floor((size * maxW) / w));
  return size;
}

// Draw a five-pointed star path centred at (cx, cy) with outer radius r.
export function starPath(ctx, cx, cy, r) {
  const inner = r * 0.42;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

// The title in striped retro-chrome: the text is drawn once to an offscreen
// canvas, the horizontal chrome bands are clipped into it, then it is drawn
// over a dark 3D outline on the cover.
export function drawChromeTitle(ctx, text, cx, baselineY, size, W) {
  const pad = size * 0.35;
  const off = document.createElement('canvas');
  const octx = off.getContext('2d');
  octx.font = `${size}px ${FONTS.title}`;
  const tw = octx.measureText(text).width;
  off.width = Math.ceil(tw + pad * 2);
  off.height = Math.ceil(size * 1.6);
  octx.font = `${size}px ${FONTS.title}`;
  octx.textBaseline = 'middle';
  octx.fillStyle = '#ffffff';
  octx.fillText(text, pad, off.height / 2);
  // Clip the chrome bands into the letters. One fill only: 'source-in'
  // replaces the canvas with (source AND destination), so several fills in
  // a row would eat the text away. A gradient with hard stops gives the
  // same bands in a single fill.
  octx.globalCompositeOperation = 'source-in';
  const bands = ['#fff3b0', '#ffd34d', '#ff9a3d', '#ff5e7a', '#ffd34d', '#fff3b0'];
  const chrome = octx.createLinearGradient(0, 0, 0, off.height);
  bands.forEach((colour, i) => {
    chrome.addColorStop(i / bands.length, colour);
    chrome.addColorStop((i + 1) / bands.length, colour);
  });
  octx.fillStyle = chrome;
  octx.fillRect(0, 0, off.width, off.height);
  // A thin bright line through the middle of the chrome.
  octx.globalCompositeOperation = 'source-atop';
  octx.fillStyle = 'rgba(255,255,255,0.55)';
  octx.fillRect(0, off.height * 0.42, off.width, Math.max(2, size * 0.05));
  // Dark 3D outline: the striped letters, offset down-right in near-black.
  const x = cx - off.width / 2;
  const y = baselineY - off.height / 2;
  const off2 = document.createElement('canvas');
  off2.width = off.width;
  off2.height = off.height;
  const c2 = off2.getContext('2d');
  c2.drawImage(off, 0, 0);
  c2.globalCompositeOperation = 'source-in';
  c2.fillStyle = '#1a0b1e';
  c2.fillRect(0, 0, off2.width, off2.height);
  const drop = Math.max(3, size * 0.07);
  ctx.drawImage(off2, x + drop, y + drop);
  ctx.drawImage(off, x, y);
  // A crisp dark stroke around the letters, for legibility on bright photos.
  ctx.save();
  ctx.font = `${size}px ${FONTS.title}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = Math.max(2, size * 0.045);
  ctx.strokeStyle = 'rgba(20,8,24,0.9)';
  ctx.strokeText(text, cx, baselineY);
  ctx.restore();
  return tw;
}

// The title in a smooth vertical gradient (the alternative title style).
export function drawGradientTitle(ctx, text, cx, baselineY, size, grade) {
  ctx.save();
  ctx.font = `${size}px ${FONTS.title}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const tw = ctx.measureText(text).width;
  const grad = ctx.createLinearGradient(0, baselineY - size * 0.55, 0, baselineY + size * 0.55);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.45, grade.accent);
  grad.addColorStop(1, '#7a1e3c');
  ctx.lineWidth = Math.max(2, size * 0.05);
  ctx.strokeStyle = 'rgba(20,8,24,0.9)';
  ctx.strokeText(text, cx, baselineY);
  ctx.fillStyle = grad;
  ctx.fillText(text, cx, baselineY);
  ctx.restore();
  return tw;
}

// The subtitle in Pacifico script with a neon glow in the grade's accent.
export function drawSubtitle(ctx, text, cx, baselineY, size, accent) {
  ctx.save();
  ctx.font = `${size}px ${FONTS.subtitle}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = accent;
  ctx.shadowBlur = size * 0.45;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, cx, baselineY);
  ctx.shadowBlur = 0;
  ctx.fillText(text, cx, baselineY);
  ctx.restore();
}

// A role tag: a small black tag with a yellow slash and Bebas Neue text.
export function drawRoleTag(ctx, text, x, y, h) {
  ctx.save();
  ctx.font = `${h * 0.72}px ${FONTS.label}`;
  const tw = ctx.measureText(text).width;
  const pad = h * 0.45;
  const w = tw + pad * 2 + h * 0.55;
  ctx.fillStyle = 'rgba(8,8,10,0.92)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, h * 0.22);
  ctx.fill();
  // The yellow slash.
  ctx.fillStyle = '#ffd21f';
  ctx.beginPath();
  ctx.moveTo(x + pad * 0.55, y + h * 0.18);
  ctx.lineTo(x + pad * 0.55 + h * 0.28, y + h * 0.18);
  ctx.lineTo(x + pad * 0.55 + h * 0.10, y + h * 0.82);
  ctx.lineTo(x + pad * 0.55 - h * 0.18, y + h * 0.82);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + pad + h * 0.42, y + h / 2 + h * 0.03);
  ctx.restore();
  return w;
}

// A coloured ribbon carrying the tagline, centred under the subtitle.
export function drawTaglineRibbon(ctx, text, cx, y, w, h, accent) {
  ctx.save();
  const grad = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
  grad.addColorStop(0, accent);
  grad.addColorStop(1, '#ff3d81');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, y);
  ctx.lineTo(cx + w / 2, y);
  ctx.lineTo(cx + w / 2 - h * 0.5, y + h);
  ctx.lineTo(cx - w / 2 + h * 0.5, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.font = `${h * 0.52}px ${FONTS.label}`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const tw = ctx.measureText(text).width;
  const fit = Math.min(1, (w * 0.92) / Math.max(1, tw));
  ctx.font = `${Math.max(8, h * 0.52 * fit)}px ${FONTS.label}`;
  ctx.fillText(text, cx, y + h / 2 + h * 0.03);
  ctx.restore();
}

// A circular gold seal: a gold ring, a star, and the seal text inside.
export function drawGoldSeal(ctx, cx, cy, r, text) {
  ctx.save();
  const gold = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
  gold.addColorStop(0, '#ffe98a');
  gold.addColorStop(0.55, '#f5b81e');
  gold.addColorStop(1, '#a86e00');
  ctx.fillStyle = gold;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = Math.max(2, r * 0.07);
  ctx.strokeStyle = '#7a5200';
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.86, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#7a5200';
  starPath(ctx, cx, cy - r * 0.28, r * 0.30);
  ctx.fill();
  // The seal text, wrapped to fit the circle's lower half.
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    ctx.font = `${r * 0.24}px ${FONTS.label}`;
    if (ctx.measureText(test).width > r * 1.45 && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  ctx.fillStyle = '#4d3400';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const shown = lines.slice(0, 2);
  shown.forEach((ln, i) => {
    ctx.font = `${r * 0.24}px ${FONTS.label}`;
    ctx.fillText(ln, cx, cy + r * 0.22 + i * r * 0.30);
  });
  ctx.restore();
}

// A decorative barcode: vertical bars of seeded widths on a white strip.
export function drawBarcode(ctx, x, y, w, h, seed) {
  const rand = rng(seed + 31);
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#111111';
  let bx = x + w * 0.04;
  while (bx < x + w * 0.96) {
    const bw = 1 + Math.floor(rand() * 4) * (w / 220);
    const gap = (0.6 + rand() * 1.6) * (w / 220);
    ctx.fillRect(bx, y + h * 0.08, bw, h * 0.84);
    bx += bw + gap;
  }
  ctx.restore();
}
