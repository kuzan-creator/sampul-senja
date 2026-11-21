// Panel geometry: each layout names its photo panels as fractions of the cover.
// panelRects turns them into pixel rects with a thin gap between panels.
// A layout may carry a `titleBand` (a fraction of the cover kept for the title block,
// drawn below the panels) and a `tilt` per panel (degrees, for snapshot layouts).
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
  nine: {
    id: 'nine', name: 'Sembilan Panel',
    // A 3 x 3 contact sheet over the top 78% of the cover; the bottom 22% is the title band.
    titleBand: { y: 0.78, h: 0.22 },
    panels: [
      { x: 0, y: 0, w: 1 / 3, h: 0.26 },
      { x: 1 / 3, y: 0, w: 1 / 3, h: 0.26 },
      { x: 2 / 3, y: 0, w: 1 / 3, h: 0.26 },
      { x: 0, y: 0.26, w: 1 / 3, h: 0.26 },
      { x: 1 / 3, y: 0.26, w: 1 / 3, h: 0.26 },
      { x: 2 / 3, y: 0.26, w: 1 / 3, h: 0.26 },
      { x: 0, y: 0.52, w: 1 / 3, h: 0.26 },
      { x: 1 / 3, y: 0.52, w: 1 / 3, h: 0.26 },
      { x: 2 / 3, y: 0.52, w: 1 / 3, h: 0.26 },
    ],
  },
  tilt: {
    id: 'tilt', name: 'Miring',
    // Three overlapping snapshots, each tilted, like photos tossed on a table.
    // They are drawn in order, so the last one sits on top.
    panels: [
      { x: 0.03, y: 0.10, w: 0.44, h: 0.66, tilt: -8 },
      { x: 0.30, y: 0.04, w: 0.44, h: 0.70, tilt: 2 },
      { x: 0.55, y: 0.12, w: 0.42, h: 0.64, tilt: 8 },
    ],
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
    tilt: p.tilt ?? 0,
  }));
}

/** The pixel rect of a layout's title band on a cover of w × h, or null. */
export function titleBandRect(layoutId, w, h) {
  const band = LAYOUTS[layoutId].titleBand;
  if (!band) return null;
  return { x: 0, y: Math.round(band.y * h), w, h: Math.round(band.h * h) };
}

/** The index of the panel holding point (px, py) on a cover of w × h, or -1.
 * The last match wins, so on overlapping layouts the card on top is selected. */
export function panelAt(layoutId, w, h, px, py) {
  const rects = panelRects(layoutId, w, h);
  let found = -1;
  for (let i = 0; i < rects.length; i += 1) {
    const r = rects[i];
    if (px >= r.x && px < r.x + r.w && py >= r.y && py < r.y + r.h) found = i;
  }
  return found;
}
