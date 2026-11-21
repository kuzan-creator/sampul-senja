// Sampul Senja v3 — shared constants: layouts, grades, sizes, roles, fonts.
// Written fresh for the v3 rebuild. Everything here is the app's own design.

export const APP_NAME = 'Sampul Senja';
export const APP_TAGLINE = 'Ubah foto jadi sampul ala poster — offline, tanpa unggah.';

// The seven layouts. panels is how many photo panels the layout shows.
export const LAYOUTS = [
  { id: 'grid', name: 'Empat Panel', panels: 4 },
  { id: 'hero', name: 'Hero + Tiga', panels: 4 },
  { id: 'duo', name: 'Dua Panel', panels: 2 },
  { id: 'single', name: 'Satu Foto', panels: 1 },
  { id: 'nine', name: 'Sembilan Panel', panels: 9 },
  { id: 'tilted', name: 'Miring', panels: 3 },
  { id: 'poster', name: 'Poster', panels: 5 },
];

// The eight colour grades. filter is a canvas ctx.filter string applied to the
// photo; overlay is a [top, bottom] pair painted over it; accent is the UI dot.
export const GRADES = [
  { id: 'senja', name: 'Senja', filter: 'saturate(1.25) contrast(1.06) brightness(1.02)', overlay: ['rgba(255,122,24,0.16)', 'rgba(255,61,129,0.20)'], accent: '#ff7a18' },
  { id: 'neon', name: 'Neon', filter: 'saturate(1.6) contrast(1.12) brightness(1.0)', overlay: ['rgba(255,45,149,0.22)', 'rgba(0,229,255,0.18)'], accent: '#ff2d95' },
  { id: 'ungu', name: 'Senja Ungu', filter: 'saturate(1.35) contrast(1.08) hue-rotate(-18deg)', overlay: ['rgba(124,58,237,0.22)', 'rgba(255,122,24,0.14)'], accent: '#7c3aed' },
  { id: 'emas', name: 'Emas Palem', filter: 'saturate(1.3) contrast(1.05) sepia(0.28)', overlay: ['rgba(255,190,60,0.20)', 'rgba(120,72,20,0.16)'], accent: '#ffbe3c' },
  { id: 'pantai', name: 'Pantai Biru', filter: 'saturate(1.3) contrast(1.06) hue-rotate(14deg)', overlay: ['rgba(0,190,220,0.20)', 'rgba(0,90,160,0.18)'], accent: '#00bedc' },
  { id: 'noir', name: 'Noir', filter: 'grayscale(1) contrast(1.28) brightness(1.04)', overlay: ['rgba(255,255,255,0.06)', 'rgba(0,0,0,0.22)'], accent: '#e8e8e8' },
  { id: 'krom', name: 'Krom Perak', filter: 'grayscale(0.55) contrast(1.22) brightness(1.08)', overlay: ['rgba(200,220,255,0.14)', 'rgba(40,60,90,0.20)'], accent: '#c8d4e8' },
  { id: 'magenta', name: 'Magenta', filter: 'saturate(1.7) contrast(1.1) hue-rotate(-38deg)', overlay: ['rgba(255,0,128,0.24)', 'rgba(120,0,90,0.18)'], accent: '#ff0080' },
];

// The four export sizes (width x height in pixels).
export const SIZES = [
  { id: '1080x1080', name: '1080 × 1080', w: 1080, h: 1080 },
  { id: '1080x1350', name: '1080 × 1350', w: 1080, h: 1350 },
  { id: '1920x1080', name: '1920 × 1080', w: 1920, h: 1080 },
  { id: '1080x1920', name: '1080 × 1920', w: 1080, h: 1920 },
];

// Default role tags, assigned to panels in order.
export const ROLE_DEFAULTS = [
  'THE DRIVER', 'THE BOSS', 'THE BRAINS', 'THE GETAWAY', 'THE LOOKOUT',
  'THE FIXER', 'THE CAPTAIN', 'THE RIDER', 'THE MECHANIC',
];

// The two sample photos shipped with the kit (model-made, free to use).
export const SAMPLE_PHOTOS = [
  { id: 'pier', name: 'Dermaga Senja', src: 'samples/pier.jpg' },
  { id: 'boulevard', name: 'Boulevard', src: 'samples/boulevard.jpg' },
];

export const FONTS = {
  title: 'Anton',
  subtitle: 'Pacifico',
  label: 'Bebas Neue',
};

// A fresh default state. panels are sized to the most any layout needs (9).
export function defaultState() {
  return {
    layout: 'poster',
    grade: 'senja',
    size: '1080x1080',
    title: 'KOTA SENJA',
    subtitle: 'Pantai di ujung senja',
    tagline: 'EVERYONE WANTS A CUT OF THE SUNSET',
    quote: 'A city that never sleeps, a sunset that never ends.',
    credits: 'A SAMPUL SENJA PRODUCTION  •  IN CINEMAS SOON',
    sealText: 'ORIGINAL COVER ART',
    titleStyle: 'krom',
    frame: true,
    roles: true,
    seal: true,
    faceNote: false,
    selected: 0,
    panels: ROLE_DEFAULTS.map((role, i) => ({
      photo: i % 2 === 0 ? 'pier' : 'boulevard',
      role,
      crop: { fx: 0.5, fy: 0.35, zoom: 1 },
    })),
  };
}

// A tiny deterministic PRNG (mulberry32) so grain and barcodes are stable.
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
