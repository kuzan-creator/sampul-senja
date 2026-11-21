// Sampul Senja v4 — panel layouts. Every layout returns the panel rects as
// fractions of the photo area (x, y, w, h in 0..1), plus an optional tilt in
// degrees for the overlapping snapshot cards. The renderer maps them onto
// the canvas; the photo area itself is whatever is left between the poster
// frame's top bar and the title block.

const GAP = 0.012;

function grid2x2() {
  const w = (1 - GAP * 3) / 2, h = (1 - GAP * 3) / 2;
  return [
    { x: GAP, y: GAP, w, h },
    { x: GAP * 2 + w, y: GAP, w, h },
    { x: GAP, y: GAP * 2 + h, w, h },
    { x: GAP * 2 + w, y: GAP * 2 + h, w, h },
  ];
}

function hero3() {
  const heroW = 0.6, sideW = 1 - heroW - GAP * 2;
  const sh = (1 - GAP * 4) / 3;
  return [
    { x: GAP, y: GAP, w: heroW, h: 1 - GAP * 2 },
    { x: heroW + GAP * 2, y: GAP, w: sideW, h: sh },
    { x: heroW + GAP * 2, y: GAP * 2 + sh, w: sideW, h: sh },
    { x: heroW + GAP * 2, y: GAP * 3 + sh * 2, w: sideW, h: sh },
  ];
}

function duo() {
  const w = (1 - GAP * 3) / 2;
  return [
    { x: GAP, y: GAP, w, h: 1 - GAP * 2 },
    { x: GAP * 2 + w, y: GAP, w, h: 1 - GAP * 2 },
  ];
}

function single() {
  return [{ x: 0, y: 0, w: 1, h: 1 }];
}

function nine() {
  const out = [];
  const w = (1 - GAP * 4) / 3, h = (1 - GAP * 4) / 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      out.push({ x: GAP + c * (w + GAP), y: GAP + r * (h + GAP), w, h });
    }
  }
  return out;
}

function tilted() {
  return [
    { x: 0.02, y: 0.06, w: 0.36, h: 0.88, tilt: -6 },
    { x: 0.32, y: 0.02, w: 0.36, h: 0.88, tilt: 0 },
    { x: 0.62, y: 0.06, w: 0.36, h: 0.88, tilt: 6 },
  ];
}

function poster() {
  const heroH = 0.62, smallH = 1 - heroH - GAP * 3;
  const sw = (1 - GAP * 5) / 4;
  const small = [0, 1, 2, 3].map((i) => ({
    x: GAP + i * (sw + GAP), y: heroH + GAP * 2, w: sw, h: smallH,
  }));
  return [{ x: GAP, y: GAP, w: 1 - GAP * 2, h: heroH }, ...small];
}

export const LAYOUT_DEFS = {
  grid: grid2x2,
  hero3,
  duo,
  single,
  nine,
  tilted,
  poster,
};

export function panelsFor(layoutId) {
  const fn = LAYOUT_DEFS[layoutId] || LAYOUT_DEFS.poster;
  return fn();
}

export function panelCount(layoutId) {
  return panelsFor(layoutId).length;
}
