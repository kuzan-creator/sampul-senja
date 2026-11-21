// Sampul Senja v4 — lettering: the striped retro-chrome title, the gradient
// title, the neon script subtitle, and the halftone dots. The chrome title
// is drawn with ONE gradient (hard stops make the stripes) in a SINGLE
// fill: several source-in fills would eat each other until nothing is left.

export function fitFont(ctx, text, maxW, startPx, family, weight) {
  let px = startPx;
  ctx.font = `${weight} ${px}px ${family}`;
  while (px > 12 && ctx.measureText(text).width > maxW) {
    px -= 2;
    ctx.font = `${weight} ${px}px ${family}`;
  }
  return px;
}

export function drawChromeTitle(ctx, text, cx, y, maxW, startPx) {
  const px = fitFont(ctx, text, maxW, startPx, 'Anton, sans-serif', 400);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  // 3D drop: the same text, dark, offset down-right.
  ctx.font = `400 ${px}px Anton, sans-serif`;
  ctx.fillStyle = '#1a0b2e';
  ctx.fillText(text, cx + px * 0.035, y + px * 0.05);
  // One vertical gradient with hard stops = the chrome stripes.
  const g = ctx.createLinearGradient(0, y - px, 0, y + px * 0.1);
  g.addColorStop(0.0, '#ffe08a');
  g.addColorStop(0.28, '#ffd76a');
  g.addColorStop(0.28, '#ff8a1e');
  g.addColorStop(0.55, '#ff7a18');
  g.addColorStop(0.55, '#ff2e88');
  g.addColorStop(0.82, '#ff5e9e');
  g.addColorStop(0.82, '#ffd76a');
  g.addColorStop(1.0, '#ffe9ad');
  ctx.fillStyle = g;
  ctx.fillText(text, cx, y);
  // Crisp dark outline on top of the gradient.
  ctx.lineWidth = Math.max(1.5, px * 0.02);
  ctx.strokeStyle = 'rgba(26,11,46,0.85)';
  ctx.strokeText(text, cx, y);
  return px;
}

export function drawGradientTitle(ctx, text, cx, y, maxW, startPx) {
  const px = fitFont(ctx, text, maxW, startPx, 'Anton, sans-serif', 400);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `400 ${px}px Anton, sans-serif`;
  ctx.fillStyle = '#1a0b2e';
  ctx.fillText(text, cx + px * 0.035, y + px * 0.05);
  const g = ctx.createLinearGradient(0, y - px, 0, y + px * 0.1);
  g.addColorStop(0, '#fff3c4');
  g.addColorStop(0.45, '#ffb347');
  g.addColorStop(1, '#ff2e88');
  ctx.fillStyle = g;
  ctx.fillText(text, cx, y);
  ctx.lineWidth = Math.max(1.5, px * 0.02);
  ctx.strokeStyle = 'rgba(26,11,46,0.85)';
  ctx.strokeText(text, cx, y);
  return px;
}

export function drawScriptSubtitle(ctx, text, cx, y, maxW, startPx) {
  const px = fitFont(ctx, text, maxW, startPx, 'Pacifico, cursive', 400);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `400 ${px}px Pacifico, cursive`;
  // A dark-pink offset pass under the white glow, for depth.
  ctx.shadowColor = '#c2185b';
  ctx.shadowBlur = px * 0.12;
  ctx.fillStyle = '#ffd7ea';
  ctx.fillText(text, cx + px * 0.03, y + px * 0.04);
  ctx.shadowColor = '#ff2e88';
  ctx.shadowBlur = px * 0.35;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, cx, y);
  ctx.shadowBlur = 0;
  return px;
}

// A row of halftone dots, fading out toward the edges.
export function drawHalftone(ctx, x, y, w, dotR, color) {
  const step = dotR * 3.2;
  ctx.fillStyle = color;
  for (let px = x; px <= x + w; px += step) {
    const t = 1 - Math.abs(px - (x + w / 2)) / (w / 2);
    ctx.globalAlpha = 0.15 + 0.55 * t;
    ctx.beginPath();
    ctx.arc(px, y, dotR, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// Five-point star path, centred at (cx, cy) with outer radius r.
export function starPath(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}
