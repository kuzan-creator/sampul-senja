// Shared constants for Sampul Senja: export sizes, sample photos, defaults and a seeded random.
// The cover maker is an offline web app: every file it loads lives under app/ or is a data: URI.
export const SIZES = {
  square: { id: 'square', label: '1080 × 1080', w: 1080, h: 1080 },
  portrait: { id: 'portrait', label: '1080 × 1350', w: 1080, h: 1350 },
  landscape: { id: 'landscape', label: '1920 × 1080', w: 1920, h: 1080 },
  story: { id: 'story', label: '1080 × 1920', w: 1080, h: 1920 },
};

export const SAMPLE_PHOTOS = [
  { id: 'pier', name: 'Dermaga Senja', url: 'samples/pier.jpg' },
  { id: 'boulevard', name: 'Boulevard', url: 'samples/boulevard.jpg' },
];

export const DEFAULT_TITLE = 'SAMPUL SENJA';
// Mixed case on purpose: the subtitle is set in Pacifico, a script face that reads best uncapitalised.
export const DEFAULT_SUBTITLE = 'Kota di Ujung Senja';

/** A tiny seeded random (mulberry32) so staged screenshots and grain re-take identically. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`cannot load ${url}`));
    img.src = url;
  });
}
