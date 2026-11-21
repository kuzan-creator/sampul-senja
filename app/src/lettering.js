// Dusk Cover Studio — lettering: the striped retro-chrome title, the smooth
// gradient title, the script subtitle and the role tags. One file, one job:
// text on the cover. The chrome title is drawn in ONE fill from a gradient
// with hard stops — drawing it in several source-in fills would erase the
// earlier passes, so the stripes live in a single gradient.
function outline(ctx, text, cx, y, size) {
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#160a2b";
  ctx.lineWidth = Math.max(2, size * 0.07);
  ctx.strokeText(text, cx, y);
}

export function chromeTitle(ctx, text, cx, y, size) {
  ctx.save();
  ctx.font = `900 ${size}px Anton, "Arial Black", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const g = ctx.createLinearGradient(0, y - size, 0, y + size * 0.08);
  const bands = ["#fff8d6", "#ffd166", "#ff7a18", "#ff2d78", "#7b2fff", "#00e5ff"];
  bands.forEach((c, i) => {
    g.addColorStop(i / bands.length, c);
    g.addColorStop((i + 1) / bands.length, c);
  });
  outline(ctx, text, cx, y, size);
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = size * 0.12;
  ctx.shadowOffsetY = size * 0.04;
  ctx.fillStyle = g;
  ctx.fillText(text, cx, y);
  ctx.restore();
  ctx.restore();
}

export function gradientTitle(ctx, text, cx, y, size) {
  ctx.save();
  ctx.font = `900 ${size}px Anton, "Arial Black", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const g = ctx.createLinearGradient(0, y - size, 0, y + size * 0.08);
  g.addColorStop(0, "#fff8d6");
  g.addColorStop(0.45, "#ffd166");
  g.addColorStop(0.75, "#ff7a18");
  g.addColorStop(1, "#ff2d78");
  outline(ctx, text, cx, y, size);
  ctx.fillStyle = g;
  ctx.fillText(text, cx, y);
  ctx.restore();
}

export function scriptSubtitle(ctx, text, cx, y, size) {
  ctx.save();
  ctx.font = `${size}px Pacifico, cursive`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.shadowColor = "rgba(0,0,0,0.65)";
  ctx.shadowBlur = size * 0.25;
  ctx.shadowOffsetY = size * 0.05;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(text, cx, y);
  ctx.restore();
}

function pill(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function roleTag(ctx, text, x, y, scale) {
  ctx.save();
  const fs = Math.max(9, 15 * scale);
  ctx.font = `700 ${fs}px "Bebas Neue", "Arial Narrow", sans-serif`;
  const pad = 7 * scale;
  const w = ctx.measureText(text).width + pad * 2;
  const h = 24 * scale;
  ctx.fillStyle = "rgba(10,6,20,0.85)";
  pill(ctx, x, y, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = "#ffd166";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(text, x + pad, y + h - 6.5 * scale);
  ctx.restore();
}
