// Dusk Cover Studio — the eight colour grades. A grade is a canvas filter
// string applied while drawing each photo, plus a soft tint overlay (a
// vertical gradient, a blend mode and an alpha) laid over the panel after
// the photo. One file, one job: colour only, no drawing.
export const GRADES = {
  senja: {
    name: "Senja",
    filter: "saturate(1.35) contrast(1.08) brightness(1.03)",
    overlay: ["#ff7a18", "#ff2d78"],
    blend: "overlay",
    alpha: 0.18,
  },
  ungu: {
    name: "Senja Ungu",
    filter: "saturate(1.3) hue-rotate(18deg) contrast(1.1)",
    overlay: ["#7b2fff", "#ff2d78"],
    blend: "overlay",
    alpha: 0.2,
  },
  neon: {
    name: "Neon",
    filter: "saturate(1.5) contrast(1.15) brightness(1.04)",
    overlay: ["#00e5ff", "#ff2d95"],
    blend: "overlay",
    alpha: 0.16,
  },
  biru: {
    name: "Pantai Biru",
    filter: "saturate(1.2) hue-rotate(185deg) brightness(1.06)",
    overlay: ["#00b4ff", "#0a2a6b"],
    blend: "soft-light",
    alpha: 0.22,
  },
  emas: {
    name: "Emas Palem",
    filter: "saturate(1.25) sepia(0.28) contrast(1.06)",
    overlay: ["#ffd166", "#b4691e"],
    blend: "overlay",
    alpha: 0.18,
  },
  noir: {
    name: "Noir",
    filter: "grayscale(1) contrast(1.22) brightness(1.05)",
    overlay: null,
    blend: "overlay",
    alpha: 0,
  },
  krom: {
    name: "Krom Perak",
    filter: "saturate(0.65) contrast(1.28) brightness(1.1)",
    overlay: ["#e8ecf1", "#5a6675"],
    blend: "soft-light",
    alpha: 0.14,
  },
  magenta: {
    name: "Magenta",
    filter: "saturate(1.45) hue-rotate(-32deg) contrast(1.1)",
    overlay: ["#ff2d95", "#6b0a4d"],
    blend: "overlay",
    alpha: 0.18,
  },
};

export function gradeNames() {
  return Object.entries(GRADES).map(([id, g]) => ({ id, name: g.name }));
}

export function gradeOf(id) {
  return GRADES[id] ?? GRADES.senja;
}
