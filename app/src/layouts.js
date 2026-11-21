// Sampul Senja v3 — layouts: where each photo panel sits on the cover.
// Every layout takes the panels area {x, y, w, h} (the cover minus the frame
// bars and the title block) and returns panel rects in cover pixels.
// A rect may carry rot (radians) for the tilted layout. Panels are numbered
// in reading order; the layout's panelCount (config.js) decides how many
// of the state's panels are shown.

const GAP = 0.012; // gap between panels, as a fraction of the cover width

function gridRects(area, cols, rows, count) {
  const g = Math.max(4, area.w * GAP);
  const cw = (area.w - g * (cols - 1)) / cols;
  const ch = (area.h - g * (rows - 1)) / rows;
  const out = [];
  for (let i = 0; i < count; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    out.push({
      x: area.x + c * (cw + g),
      y: area.y + r * (ch + g),
      w: cw,
      h: ch,
      rot: 0,
    });
  }
  return out;
}

// Empat Panel: a 2x2 grid.
function grid(area) {
  return gridRects(area, 2, 2, 4);
}

// Hero + Tiga: a big hero on the left, three stacked panels on the right.
function hero(area) {
  const g = Math.max(4, area.w * GAP);
  const heroW = area.w * 0.62;
  const sideW = area.w - heroW - g;
  const sideH = (area.h - g * 2) / 3;
  const out = [{ x: area.x, y: area.y, w: heroW, h: area.h, rot: 0 }];
  for (let i = 0; i < 3; i++) {
    out.push({
      x: area.x + heroW + g,
      y: area.y + i * (sideH + g),
      w: sideW,
      h: sideH,
      rot: 0,
    });
  }
  return out;
}

// Dua Panel: two side-by-side panels.
function duo(area) {
  return gridRects(area, 2, 1, 2);
}

// Satu Foto: one full-bleed panel.
function single(area) {
  return [{ x: area.x, y: area.y, w: area.w, h: area.h, rot: 0 }];
}

// Sembilan Panel: a 3x3 grid.
function nine(area) {
  return gridRects(area, 3, 3, 9);
}

// Miring: three overlapping tilted snapshots, like photos tossed on a table.
function tilted(area) {
  const w = area.w * 0.42;
  const h = area.h * 0.94;
  const cy = area.y + area.h / 2 - h / 2;
  return [
    { x: area.x + area.w * 0.02, y: cy + area.h * 0.02, w, h, rot: -0.14 },
    { x: area.x + area.w * 0.29, y: cy - area.h * 0.02, w, h, rot: 0.03 },
    { x: area.x + area.w * 0.56, y: cy + area.h * 0.02, w, h, rot: 0.14 },
  ];
}

// Poster: a movie-poster composition — a big hero close-up on top and four
// small panels in a row beneath it.
function poster(area) {
  const g = Math.max(4, area.w * GAP);
  const heroH = area.h * 0.64;
  const rowH = area.h - heroH - g;
  const out = [{ x: area.x, y: area.y, w: area.w, h: heroH, rot: 0 }];
  const cw = (area.w - g * 3) / 4;
  for (let i = 0; i < 4; i++) {
    out.push({
      x: area.x + i * (cw + g),
      y: area.y + heroH + g,
      w: cw,
      h: rowH,
      rot: 0,
    });
  }
  return out;
}

export const LAYOUT_FNS = { grid, hero, duo, single, nine, tilted, poster };

// Panel rects for a layout id inside the panels area.
export function layoutPanels(layoutId, area) {
  const fn = LAYOUT_FNS[layoutId] || grid;
  return fn(area);
}
