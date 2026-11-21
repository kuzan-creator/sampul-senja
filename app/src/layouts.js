// Dusk Cover Studio — the seven panel layouts. Each layout is a function
// that takes the cover's aspect (width / height) and returns the panels as
// normalised rectangles {x, y, w, h} (0..1), plus an optional rotation in
// degrees for the tilted layout. One file, one job: geometry only, no drawing.
function rect(x, y, w, h, rot = 0) {
  return { x, y, w, h, rot };
}

export const LAYOUTS = {
  hero3: {
    name: "Hero + Tiga",
    panels() {
      return [
        rect(0, 0, 0.62, 1),
        rect(0.635, 0, 0.365, 0.323),
        rect(0.635, 0.338, 0.365, 0.323),
        rect(0.635, 0.677, 0.365, 0.323),
      ];
    },
  },
  duo: {
    name: "Dua Panel",
    panels() {
      return [rect(0, 0, 0.4925, 1), rect(0.5075, 0, 0.4925, 1)];
    },
  },
  grid9: {
    name: "Sembilan Panel",
    panels() {
      const out = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          out.push(rect(c * 0.3383, r * 0.3383, 0.3233, 0.3233));
        }
      }
      return out;
    },
  },
  poster: {
    name: "Poster",
    panels() {
      return [
        rect(0, 0, 1, 0.62),
        rect(0, 0.635, 0.4925, 0.365),
        rect(0.5075, 0.635, 0.4925, 0.365),
      ];
    },
  },
  miring: {
    name: "Miring",
    panels() {
      return [
        rect(0, 0, 0.58, 1, -2),
        rect(0.56, 0.05, 0.44, 0.44, 2),
        rect(0.56, 0.52, 0.44, 0.44, -2),
      ];
    },
  },
  quad: {
    name: "Empat Panel",
    panels() {
      return [
        rect(0, 0, 0.4925, 0.4925),
        rect(0.5075, 0, 0.4925, 0.4925),
        rect(0, 0.5075, 0.4925, 0.4925),
        rect(0.5075, 0.5075, 0.4925, 0.4925),
      ];
    },
  },
  solo: {
    name: "Satu Panel",
    panels() {
      return [rect(0, 0, 1, 1)];
    },
  },
};

export function layoutPanels(id) {
  const layout = LAYOUTS[id] ?? LAYOUTS.hero3;
  return layout.panels();
}

export function layoutNames() {
  return Object.entries(LAYOUTS).map(([id, l]) => ({ id, name: l.name }));
}
