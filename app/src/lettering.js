// Bold poster lettering: a title with a gradient fill, dark outline and drop shadow,
// plus a letter-spaced subtitle underneath.
const TITLE_FONT = 'Anton, "Arial Black", sans-serif';
const SUB_FONT = '"Bebas Neue", "Arial Narrow", sans-serif';

/** The largest title size (px) that fits `text` inside maxWidth, starting from startSize. */
export function fitTitleSize(ctx, text, maxWidth, startSize) {
  let size = startSize;
  ctx.font = `400 ${size}px ${TITLE_FONT}`;
  while (size > 14 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `400 ${size}px ${TITLE_FONT}`;
  }
  return size;
}

/** Draws the title centred at (cx, baselineY) with a vertical gradient fill and outline. */
export function drawTitle(ctx, text, cx, baselineY, size, colors, outline) {
  const g = ctx.createLinearGradient(0, baselineY - size, 0, baselineY + size * 0.12);
  g.addColorStop(0, colors[0]);
  g.addColorStop(0.55, colors[1]);
  g.addColorStop(1, colors[2]);
  ctx.save();
  ctx.font = `400 ${size}px ${TITLE_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(3, size / 11);
  ctx.strokeStyle = outline;
  ctx.strokeText(text, cx, baselineY);
  ctx.shadowColor = 'rgba(10, 0, 20, 0.6)';
  ctx.shadowBlur = size * 0.16;
  ctx.shadowOffsetY = size * 0.045;
  ctx.fillStyle = g;
  ctx.fillText(text, cx, baselineY);
  ctx.restore();
}

/** Draws the subtitle centred at (cx, baselineY), letter-spaced and in white. */
export function drawSubtitle(ctx, text, cx, baselineY, size) {
  ctx.save();
  ctx.font = `400 ${size}px ${SUB_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${Math.round(size * 0.32)}px`;
  ctx.shadowColor = 'rgba(10, 0, 20, 0.65)';
  ctx.shadowBlur = size * 0.25;
  ctx.shadowOffsetY = size * 0.06;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, cx, baselineY);
  ctx.restore();
}
