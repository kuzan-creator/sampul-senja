// Dusk Cover Studio — render: draws the whole cover onto a canvas from the
// state. One file, one job: pixels. Deterministic — the same state draws the
// same cover, every time.
import { layoutPanels } from "./layouts.js";
import { gradeOf } from "./grades.js";
import { drawPhoto } from "./photos.js";
import { chromeTitle, gradientTitle, scriptSubtitle, roleTag } from "./lettering.js";
import { ROLE_TAGS } from "./config.js";

function star(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

// Deterministic pseudo-random numbers from a seed, for the barcode.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function drawBarcode(ctx, x, y, w, h, seedText) {
  const rand = mulberry32(hashSeed(seedText));
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#111111";
  let cx = x + w * 0.04;
  while (cx < x + w * 0.96) {
    const bw = 1 + Math.floor(rand() * 4);
    if (rand() > 0.45) ctx.fillRect(cx, y + h * 0.08, bw, h * 0.84);
    cx += bw + 1 + Math.floor(rand() * 3);
  }
  ctx.restore();
}

function drawHalftone(ctx, x, y, w, h, scale) {
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.16)";
  const step = 14 * scale;
  for (let r = 0; r * step < h; r++) {
    for (let c = 0; c * step < w; c++) {
      const rad = Math.max(0.6, (1 - (r + c) / 16) * 3.2 * scale);
      ctx.beginPath();
      ctx.arc(x + c * step + step / 2, y + r * step + step / 2, rad, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

export function renderCover(ctx, state, W, H) {
  const S = W / 1080;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#12081f";
  ctx.fillRect(0, 0, W, H);

  // ---- panels ----
  const grade = gradeOf(state.grade);
  const rects = layoutPanels(state.layout);
  const gutter = Math.max(3, W * 0.006);
  rects.forEach((r, i) => {
    const panel = state.panels[i];
    if (!panel) return;
    const img = state.photos.get(panel.photo);
    const px = r.x * W;
    const py = r.y * H;
    const pw = r.w * W;
    const ph = r.h * H;
    ctx.save();
    if (r.rot) {
      ctx.translate(px + pw / 2, py + ph / 2);
      ctx.rotate((r.rot * Math.PI) / 180);
      ctx.translate(-pw / 2, -ph / 2);
    } else {
      ctx.translate(px, py);
    }
    if (img) drawPhoto(ctx, img, { x: 0, y: 0, w: pw, h: ph }, panel, grade.filter);
    else {
      ctx.fillStyle = "#2a1745";
      ctx.fillRect(0, 0, pw, ph);
    }
    if (grade.overlay && grade.alpha > 0) {
      const og = ctx.createLinearGradient(0, 0, 0, ph);
      og.addColorStop(0, grade.overlay[0]);
      og.addColorStop(1, grade.overlay[1]);
      ctx.globalCompositeOperation = grade.blend;
      ctx.globalAlpha = grade.alpha;
      ctx.fillStyle = og;
      ctx.fillRect(0, 0, pw, ph);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }
    const tag = panel.tag || ROLE_TAGS[i % ROLE_TAGS.length];
    if (tag) roleTag(ctx, tag, gutter, gutter, S);
    ctx.restore();
  });

  // ---- readability scrim behind the title ----
  const scrim = ctx.createLinearGradient(0, H * 0.52, 0, H * 0.95);
  scrim.addColorStop(0, "rgba(8,4,16,0)");
  scrim.addColorStop(1, "rgba(8,4,16,0.78)");
  ctx.fillStyle = scrim;
  ctx.fillRect(0, H * 0.52, W, H * 0.43);

  // ---- tagline ribbon ----
  if (state.tagline) {
    const ry = H * 0.585;
    ctx.save();
    ctx.translate(W / 2, ry);
    ctx.rotate(-0.03);
    ctx.fillStyle = "#ff2d78";
    const tw = Math.min(W * 0.86, ctx.measureText(state.tagline).width + W * 0.1);
    ctx.fillRect(-tw / 2, -H * 0.016, tw, H * 0.032);
    ctx.fillStyle = "#ffffff";
    ctx.font = `700 ${Math.round(H * 0.016)}px "Bebas Neue", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(state.tagline.toUpperCase(), 0, 0);
    ctx.restore();
  }

  // ---- title + subtitle ----
  let tsize = Math.round(W * 0.125);
  ctx.font = `900 ${tsize}px Anton, "Arial Black", sans-serif`;
  const maxW = W * 0.94;
  while (ctx.measureText(state.title).width > maxW && tsize > 20) {
    tsize -= 2;
    ctx.font = `900 ${tsize}px Anton, "Arial Black", sans-serif`;
  }
  const titleY = H * 0.845;
  if (state.titleStyle === "gradient") gradientTitle(ctx, state.title, W / 2, titleY, tsize);
  else chromeTitle(ctx, state.title, W / 2, titleY, tsize);
  if (state.subtitle) {
    scriptSubtitle(ctx, state.subtitle, W / 2, H * 0.9, Math.round(W * 0.032));
  }

  // ---- gold seal ----
  // On narrow covers the title runs wide, so the seal moves up to the top
  // right (below the top bar) instead of sitting on the title's last letter.
  const narrow = W / H < 1.1;
  if (state.seal) {
    const sx = W * 0.885;
    const sy = narrow ? H * 0.16 : H * 0.815;
    const sr = W * 0.048;
    const g = ctx.createRadialGradient(sx - sr * 0.3, sy - sr * 0.3, sr * 0.1, sx, sy, sr);
    g.addColorStop(0, "#fff3b0");
    g.addColorStop(0.55, "#ffd166");
    g.addColorStop(1, "#b4691e");
    ctx.save();
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#7a4a12";
    ctx.lineWidth = Math.max(1.5, sr * 0.05);
    ctx.beginPath();
    ctx.arc(sx, sy, sr * 0.82, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#7a4a12";
    star(ctx, sx, sy - sr * 0.08, sr * 0.34);
    ctx.fill();
    ctx.font = `700 ${Math.round(sr * 0.22)}px "Bebas Neue", sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("★ EST. 2026 ★", sx, sy + sr * 0.52);
    ctx.restore();
  }

  // ---- halftone ----
  // Top right on wide covers; top left on narrow ones, so it never sits
  // under the gold seal (which moves up there on narrow covers).
  if (state.halftone) {
    const hx = narrow ? W * 0.01 : W * 0.86;
    drawHalftone(ctx, hx, H * 0.1, W * 0.13, H * 0.09, S);
  }

  // ---- poster frame ----
  if (state.frame) {
    // A thin gold edge around the whole cover, inside the frame bars.
    ctx.strokeStyle = "rgba(255,209,102,0.55)";
    ctx.lineWidth = Math.max(2, S * 3);
    ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, W - ctx.lineWidth, H - ctx.lineWidth);
    const barH = H * 0.072;
    ctx.fillStyle = "rgba(8,4,16,0.94)";
    ctx.fillRect(0, 0, W, barH);
    ctx.fillRect(0, H - barH * 1.15, W, barH * 1.15);
    // stars
    const starY = barH * 0.52;
    const starR = barH * 0.26;
    ctx.fillStyle = "#ffd166";
    for (let i = 0; i < 5; i++) {
      star(ctx, W * 0.035 + i * starR * 2.4, starY, starR);
      ctx.fill();
    }
    // VOL. 1, measured first so the quote can fit beside it.
    ctx.fillStyle = "#ffffff";
    ctx.font = `700 ${Math.round(barH * 0.36)}px "Bebas Neue", sans-serif`;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    const volW = ctx.measureText("VOL. 1").width;
    ctx.fillText("VOL. 1", W * 0.975, starY);
    // Quote, centred in the free space between the stars and VOL. 1, and
    // shrunk until it fits (narrow covers otherwise run it over the stars).
    const starsEnd = W * 0.035 + 5 * starR * 2.4;
    const qAvail = W * 0.975 - volW - W * 0.02 - starsEnd - W * 0.02;
    let qSize = Math.round(barH * 0.36);
    ctx.font = `italic ${qSize}px Georgia, serif`;
    const qText = `\u201c${state.quote}\u201d`;
    while (ctx.measureText(qText).width > qAvail && qSize > 10) {
      qSize -= 1;
      ctx.font = `italic ${qSize}px Georgia, serif`;
    }
    ctx.fillStyle = "#ffe9a8";
    ctx.textAlign = "center";
    ctx.fillText(qText, starsEnd + W * 0.02 + qAvail / 2, starY);
    // bottom bar: COMING SOON + credits + barcode
    const bbY = H - barH * 1.15;
    ctx.fillStyle = "#ffd166";
    ctx.font = `900 ${Math.round(barH * 0.42)}px Anton, sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("COMING SOON", W * 0.03, bbY + barH * 0.575);
    // Credits, centred in the free space between COMING SOON and the
    // barcode, shrunk until they fit (narrow covers otherwise overlap).
    const csW = ctx.measureText("COMING SOON").width;
    const bcX = W * 0.86;
    const cAvail = bcX - W * 0.02 - (W * 0.03 + csW + W * 0.02);
    let cSize = Math.round(barH * 0.3);
    ctx.font = `${cSize}px Georgia, serif`;
    while (ctx.measureText(state.credits).width > cAvail && cSize > 9) {
      cSize -= 1;
      ctx.font = `${cSize}px Georgia, serif`;
    }
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(state.credits, W * 0.03 + csW + W * 0.02 + cAvail / 2, bbY + barH * 0.575);
    drawBarcode(ctx, bcX, bbY + barH * 0.22, W * 0.11, barH * 0.7, state.title + state.credits);
  }
}
