// Dusk Cover Studio — deterministic staging: each named shot sets the whole
// state (layout, grade, title, photos, tags) so a screenshot run reproduces
// the same cover every time. One file, one job: the four staged covers.
import { makePanels } from "./photos.js";
import { layoutPanels } from "./layouts.js";

export const SHOTS = {
  "cover-neon": {
    layout: "hero3",
    grade: "senja",
    title: "JALAN NEON",
    subtitle: "Kota Senja",
    tagline: "Satu kota. Seribu cerita.",
    quote: "Kota ini tidak pernah tidur.",
    credits: "Sebuah cerita dari Kota Senja",
    photos: ["portrait", "car", "marina", "boulevard2"],
    tags: ["THE DRIVER", "THE BOSS", "THE QUEEN", "THE NIGHT"],
  },
  "editor-panel": {
    layout: "grid9",
    grade: "biru",
    title: "OMBAK EMAS",
    subtitle: "Dermaga Terakhir",
    tagline: "Ombak tidak pernah berbohong.",
    quote: "Laut menyimpan semua rahasia.",
    credits: "Sebuah cerita dari Dermaga Senja",
    photos: ["marina", "portrait", "car", "boulevard2", "pier", "boulevard", "portrait", "car", "marina"],
    tags: ["THE QUEEN", "THE DRIVER", "THE BOSS", "THE NIGHT", "THE FIXER", "THE LOOKOUT", "THE RUNNER", "THE DEALER", "THE HEIST"],
  },
  "cover-story": {
    layout: "poster",
    grade: "krom",
    title: "KOTA PALEM",
    subtitle: "Senja Terakhir",
    tagline: "Jalan pulang paling jauh.",
    quote: "Palem menari, kota bernapas.",
    credits: "Sebuah cerita dari Kota Palem",
    photos: ["car", "boulevard2", "portrait"],
    tags: ["THE BOSS", "THE LOOKOUT", "THE DRIVER"],
  },
  "cover-square": {
    layout: "duo",
    grade: "magenta",
    title: "SENJA TERAKHIR",
    subtitle: "Jalan Neon",
    tagline: "Terakhir bukan berarti akhir.",
    quote: "Senja ini milik kita.",
    credits: "Sebuah cerita dari Jalan Neon",
    photos: ["marina", "portrait"],
    tags: ["THE QUEEN", "THE DRIVER"],
  },
};

export function applyShot(state, id) {
  const shot = SHOTS[id];
  if (!shot) return false;
  state.layout = shot.layout;
  state.grade = shot.grade;
  state.title = shot.title;
  state.subtitle = shot.subtitle;
  state.tagline = shot.tagline;
  state.quote = shot.quote;
  state.credits = shot.credits;
  const count = layoutPanels(shot.layout).length;
  state.panels = makePanels(shot.photos, count);
  state.panels.forEach((p, i) => {
    p.tag = shot.tags[i % shot.tags.length];
    const img = state.photos.get(p.photo);
    if (img && img._focus) {
      p.fx = img._focus.x;
      p.fy = img._focus.y;
    }
  });
  return true;
}
