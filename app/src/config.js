// Sampul Senja v4 — shared configuration: layouts, grades, sizes, role tags.
// A movie-poster cover-art studio: a photo and a caption become GTA-style
// key art. Everything is offline; every asset is a file under app/.

export const ROLE_TAGS = [
  'THE DRIVER', 'THE BOSS', 'THE BRAINS', 'THE GETAWAY', 'THE LOOKOUT',
  'THE FIXER', 'THE CAPTAIN', 'THE RIDER', 'THE MECHANIC', 'THE HIDEOUT',
];

export const LAYOUTS = [
  { id: 'grid', label: 'Empat Panel' },
  { id: 'hero3', label: 'Hero + Tiga' },
  { id: 'duo', label: 'Dua Panel' },
  { id: 'single', label: 'Satu Foto' },
  { id: 'nine', label: 'Sembilan Panel' },
  { id: 'tilted', label: 'Miring' },
  { id: 'poster', label: 'Poster' },
];

export const GRADES = [
  { id: 'senja', label: 'Senja' },
  { id: 'neon', label: 'Neon' },
  { id: 'ungu', label: 'Senja Ungu' },
  { id: 'emas', label: 'Emas Palem' },
  { id: 'biru', label: 'Pantai Biru' },
  { id: 'noir', label: 'Noir' },
  { id: 'krom', label: 'Krom Perak' },
  { id: 'magenta', label: 'Magenta' },
];

export const SIZES = [
  { id: 'square', label: '1080 × 1080', w: 1080, h: 1080 },
  { id: 'portrait', label: '1080 × 1350', w: 1080, h: 1350 },
  { id: 'wide', label: '1920 × 1080', w: 1920, h: 1080 },
  { id: 'story', label: 'Story 1080 × 1920', w: 1080, h: 1920 },
];

export const TITLE_STYLES = [
  { id: 'krom', label: 'Krom' },
  { id: 'gradasi', label: 'Gradasi' },
];

export const SAMPLE_PHOTOS = [
  { id: 'pier', label: 'Contoh: Dermaga Senja', src: 'samples/pier.jpg' },
  { id: 'boulevard', label: 'Contoh: Boulevard', src: 'samples/boulevard.jpg' },
];

export function defaultState() {
  return {
    layout: 'poster',
    grade: 'senja',
    titleStyle: 'krom',
    title: 'DERMAGA TERAKHIR',
    subtitle: 'Satu malam di pelabuhan',
    quote: 'A city that never sleeps, a sunset that never ends.',
    tagline: 'EVERYONE WANTS A CUT OF THE SUNSET',
    credits: 'A SAMPUL SENJA PRODUCTION · IN CINEMAS SOON',
    sealText: 'ORIGINAL COVER ART',
    posterFrame: true,
    showTags: true,
    showSeal: true,
    roles: [...ROLE_TAGS],
    // One photo slot per panel; each slot: { src, panX, panY, zoom, face }
    // src is a sample id ('pier' | 'boulevard') or a data: URL from upload.
    panels: [],
    selectedPanel: 0,
    size: 'wide',
  };
}
