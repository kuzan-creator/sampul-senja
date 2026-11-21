// Sampul Senja v3 — render: draws a whole cover onto a canvas.
// One function, renderCover, paints everything in order: frame bars, panels
// (photo + grade + border + role tag), title block (halftone, title, subtitle,
// tagline ribbon), gold seal and grain. The preview and the export both call
// it, so what the user sees is exactly what they download.

import { FONTS, LAYOUTS, SIZES } from './config.js';
import { layoutPanels } from './layouts.js';
import { gradeById, paintGradeOverlay, paintVignette, paintGrain, paintHalftone } from './grades.js';
import { drawCoverPhoto, photoBook } from './photos.js';
import {
  fitFont, starPath, drawChromeTitle, drawGradientTitle, drawSubtitle,
  drawRoleTag, drawTaglineRibbon, drawGoldSeal, drawBarcode,
} from './lettering.js';

export function sizeById(id) {
  return SIZES.find((s) => s.id === id) || SIZES[0];
}

export function layoutById(id) {
  return LAYOUTS.find((l) => l.id === id) || LAYOUTS[0];
}

// The cover's regions: frame bars, panels area and title block.
export function coverRegions(W, H, state) {
  const topBar = state.frame ? H * 0.055 : 0;
  const botBar = state.frame ? H * 0.05 : 0;
  const titleH = H * 0.21;
  const panels = {
    x: W * 0.028,
    y: topBar + H * 0.018,
    w: W * 0.944,
    h: H - topBar - botBar - titleH - H * 0.036,
  };
  const title = {
    x: W * 0.028,
    y: H - botBar - titleH,
    w: W * 0.944,
    h: titleH,
  };
  return { topBar, botBar, panels, title };
}

// Draw one panel: the photo (clipped, graded), its inked border and its tag.
function drawPanel(ctx, rect, panel, grade, state, W) {
  const photo = photoBook.get(panel.photo);
  ctx.save();
  if (rect.rot) {
    ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
    ctx.rotate(rect.rot);
    ctx.translate(-rect.w / 2, -rect.h / 2);
    rect = { x: 0, y: 0, w: rect.w, h: rect.h };
  }
  // Photo.
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  if (photo) {
    ctx.filter = grade.filter;
    drawCoverPhoto(ctx, photo.img, rect, panel.crop);
    ctx.filter = 'none';
    paintGradeOverlay(ctx, grade, rect);
  } else {
    ctx.fillStyle = '#241a2e';
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  }
  paintVignette(ctx, rect);
  ctx.restore();
  // Inked border: a white frame line and a dark outer edge, poster style.
  ctx.lineWidth = Math.max(2, W * 0.0022);
  ctx.strokeStyle = 'rgba(255,255,255,0.92)';
  ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  ctx.lineWidth = Math.max(1, W * 0.0012);
  ctx.strokeStyle = 'rgba(10,6,14,0.85)';
  ctx.strokeRect(rect.x - ctx.lineWidth, rect.y - ctx.lineWidth, rect.w + ctx.lineWidth * 2, rect.h + ctx.lineWidth * 2);
  // Role tag.
  if (state.roles && panel.role) {
    const th = Math.max(14, W * 0.016);
    drawRoleTag(ctx, panel.role, rect.x + rect.w * 0.03, rect.y + rect.h * 0.04, th);
  }
  ctx.restore();
}

// The poster's top bar: five stars, an editable quote, a VOL. 1 badge.
function drawTopBar(ctx, W, H, state, seed) {
  const barH = H * 0.055;
  ctx.save();
  ctx.fillStyle = '#120a18';
  ctx.fillRect(0, 0, W, barH);
  const cy = barH / 2;
  // Stars.
  const sr = barH * 0.26;
  let sx = W * 0.028;
  ctx.fillStyle = '#ffd21f';
  for (let i = 0; i < 5; i++) {
    starPath(ctx, sx + sr, cy, sr);
    ctx.fill();
    sx += sr * 2.5;
  }
  // Quote, centred.
  ctx.font = `italic ${Math.max(10, barH * 0.34)}px Georgia, serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const quote = `"${state.quote}"`;
  const qw = ctx.measureText(quote).width;
  if (qw < W * 0.55) ctx.fillText(quote, W / 2, cy);
  // VOL. 1 badge.
  const bw = W * 0.075;
  const bh = barH * 0.62;
  const bx = W - W * 0.028 - bw;
  ctx.fillStyle = '#ffd21f';
  ctx.beginPath();
  ctx.roundRect(bx, cy - bh / 2, bw, bh, bh * 0.3);
  ctx.fill();
  ctx.fillStyle = '#120a18';
  ctx.font = `${bh * 0.52}px ${FONTS.label}`;
  ctx.fillText('VOL. 1', bx + bw / 2, cy + bh * 0.03);
  ctx.restore();
}

// The poster's bottom bar: COMING SOON, credits, a decorative barcode.
function drawBottomBar(ctx, W, H, state, seed) {
  const barH = H * 0.05;
  const y = H - barH;
  ctx.save();
  ctx.fillStyle = '#120a18';
  ctx.fillRect(0, y, W, barH);
  const cy = y + barH / 2;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffd21f';
  ctx.font = `${barH * 0.44}px ${FONTS.label}`;
  ctx.fillText('COMING SOON', W * 0.028, cy);
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = `${Math.max(9, barH * 0.30)}px ${FONTS.label}`;
  ctx.textAlign = 'center';
  ctx.fillText(state.credits, W * 0.52, cy);
  drawBarcode(ctx, W * 0.86, y + barH * 0.16, W * 0.11, barH * 0.68, seed);
  ctx.restore();
}

// The title block: halftone band, title, subtitle and tagline ribbon.
function drawTitleBlock(ctx, region, state, grade, W, H) {
  const { x, y, w, h } = region;
  ctx.save();
  // Dark band with a halftone fade at its top edge.
  ctx.fillStyle = '#150b1c';
  ctx.fillRect(x, y, w, h);
  paintHalftone(ctx, { x, y, w, h: h * 0.42 }, '#ffffff', 11);
  const cx = x + w / 2;
  // Title.
  const titleSize = fitFont(ctx, state.title, w * 0.94, h * 0.46, FONTS.title);
  const titleY = y + h * 0.30;
  if (state.titleStyle === 'krom') {
    drawChromeTitle(ctx, state.title, cx, titleY, titleSize, W);
  } else {
    drawGradientTitle(ctx, state.title, cx, titleY, titleSize, grade);
  }
  // Subtitle (Pacifico script, neon glow).
  const subSize = fitFont(ctx, state.subtitle, w * 0.8, h * 0.17, FONTS.subtitle);
  drawSubtitle(ctx, state.subtitle, cx, y + h * 0.60, subSize, grade.accent);
  // Tagline ribbon.
  if (state.tagline) {
    const rh = h * 0.13;
    const rw = Math.min(w * 0.72, ctx.measureText(state.tagline).width + rh * 4);
    drawTaglineRibbon(ctx, state.tagline, cx, y + h * 0.80, rw, rh, grade.accent);
  }
  ctx.restore();
}

// The whole cover. seed keeps grain and barcode deterministic.
export function renderCover(ctx, W, H, state, seed = 1) {
  const grade = gradeById(state.grade);
  const layout = layoutById(state.layout);
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#150b1c';
  ctx.fillRect(0, 0, W, H);
  const regions = coverRegions(W, H, state);
  if (state.frame) drawTopBar(ctx, W, H, state, seed);
  // Panels.
  const rects = layoutPanels(state.layout, regions.panels);
  const count = Math.min(layout.panels, rects.length);
  for (let i = 0; i < count; i++) {
    drawPanel(ctx, rects[i], state.panels[i], grade, state, W);
  }
  // Title block.
  drawTitleBlock(ctx, regions.title, state, grade, W, H);
  // Gold seal, top-right of the panels area.
  if (state.seal) {
    const r = Math.max(26, W * 0.045);
    drawGoldSeal(ctx, regions.panels.x + regions.panels.w - r * 0.4, regions.panels.y + r * 0.9, r, state.sealText);
  }
  if (state.frame) drawBottomBar(ctx, W, H, state, seed);
  paintGrain(ctx, W, H, seed);
  ctx.restore();
}

// Panel rects in cover coordinates, for hit-testing in the editor.
export function panelRectsFor(W, H, state) {
  const regions = coverRegions(W, H, state);
  const layout = layoutById(state.layout);
  return layoutPanels(state.layout, regions.panels).slice(0, layout.panels);
}
