// Dusk Cover Studio — shared configuration: the sample photos, the export
// sizes, the default cover text and the role tags. One file, one job: the
// constants every other module reads, so a change here flows everywhere.
export const SAMPLES = [
  { id: "portrait", name: "Potret Neon", src: "samples/portrait.jpg" },
  { id: "car", name: "Lowrider", src: "samples/car.jpg" },
  { id: "marina", name: "Marina Emas", src: "samples/marina.jpg" },
  { id: "boulevard2", name: "Boulevard", src: "samples/boulevard2.jpg" },
  { id: "boulevard", name: "Boulevard Lama", src: "samples/boulevard.jpg" },
  { id: "pier", name: "Dermaga", src: "samples/pier.jpg" },
];

export const SIZES = [
  { id: "square", label: "1080 × 1080", w: 1080, h: 1080 },
  { id: "portrait", label: "1080 × 1350", w: 1080, h: 1350 },
  { id: "wide", label: "1920 × 1080", w: 1920, h: 1080 },
  { id: "story", label: "1080 × 1920", w: 1080, h: 1920 },
];

export const ROLE_TAGS = [
  "THE DRIVER",
  "THE BOSS",
  "THE DEALER",
  "THE RUNNER",
  "THE QUEEN",
  "THE FIXER",
  "THE LOOKOUT",
  "THE HEIST",
  "THE NIGHT",
];

export const DEFAULTS = {
  title: "JALAN NEON",
  subtitle: "Kota Senja",
  tagline: "Satu kota. Seribu cerita.",
  quote: "Kota ini tidak pernah tidur.",
  credits: "Sebuah cerita dari Kota Senja",
  layout: "hero3",
  grade: "senja",
  titleStyle: "chrome",
  seal: true,
  frame: true,
  halftone: true,
};

export function defaultState() {
  return {
    title: DEFAULTS.title,
    subtitle: DEFAULTS.subtitle,
    tagline: DEFAULTS.tagline,
    quote: DEFAULTS.quote,
    credits: DEFAULTS.credits,
    layout: DEFAULTS.layout,
    grade: DEFAULTS.grade,
    titleStyle: DEFAULTS.titleStyle,
    seal: DEFAULTS.seal,
    frame: DEFAULTS.frame,
    halftone: DEFAULTS.halftone,
    panels: [],
    photos: new Map(),
    uploads: [],
    selected: 0,
  };
}
