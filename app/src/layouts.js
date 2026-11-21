// Panel geometry: each layout names its photo panels as fractions of the cover.
// panelRects turns them into pixel rects with a thin gap between panels.
export const LAYOUTS = {
  grid: {
    id: 'grid', name: 'Empat Panel',
    panels: [
      { x: 0, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ],
  },
  hero: {
    id: 'hero', name: 'Hero + Tiga',
    panels: [
      { x: 0, y: 0, w: 1, h: 0.62 },
      { x: 0, y: 0.62, w: 1 / 3, h: 0.38 },
      { x: 1 / 3, y: 0.62, w: 1 / 3, h: 0.38 },
      { x: 2 / 3, y: 0.62, w: 1 / 3, h: 0.38 },
    ],
  },
  duo: {
    id: 'duo', name: 'Dua Panel',
    panels: [
      { x: 0, y: 0, w: 0.55, h: 1 },
      { x: 0.55, y: 0, w: 0.45, h: 1 },
    ],
  },
  full: {
    id: 'full', name: 'Satu Foto',
    panels: [{ x: 0, y: 0, w: 1, h: 1 }],
  },
};

/** Pixel rects for a layout on a cover of w × h, with a thin gap between panels. */
export function panelRects(layoutId, w, h) {
  const gap = Math.max(4, Math.round(Math.max(w, h) / 180));
  const half = gap / 2;
  return LAYOUTS[layoutId].panels.map((p) => ({
    x: Math.round(p.x * w + half),
    y: Math.round(p.y * h + half),
    w: Math.round(p.w * w - gap),
    h: Math.round(p.h * h - gap),
  }));
}

/** The index of the panel holding point (px, py) on a cover of w × h, or -1. */
export function panelAt(layoutId, w, h, px, py) {
  const rects = panelRects(layoutId, w, h);
  for (let i = 0; i < rects.length; i += 1) {
    const r = rects[i];
    if (px >= r.x && px < r.x + r.w && py >= r.y && py < r.y + r.h) return i;
  }
  return -1;
}
