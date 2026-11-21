// Sampul Senja v4 — deterministic staging. ?shot=<name>&seed=1 picks one of
// the four screenshot presets, so the same URL always renders the same
// cover. The seed is accepted for compatibility and ignored: the photos
// are the fixed kit samples, so nothing random is involved.

export const SHOTS = {
  cover1: {
    mode: 'cover',
    layout: 'hero3',
    grade: 'ungu',
    title: 'DERMAGA TERAKHIR',
    subtitle: 'Satu malam di pelabuhan',
    tagline: 'ONE CITY, ONE NIGHT',
    photos: ['pier', 'boulevard', 'pier', 'boulevard'],
    size: 'wide',
  },
  editor: {
    mode: 'editor',
    layout: 'nine',
    grade: 'biru',
    title: 'SENJA BIRU',
    subtitle: 'Biru di ujung senja',
    tagline: 'EVERYONE WANTS A CUT OF THE SUNSET',
    photos: ['boulevard', 'pier', 'boulevard', 'pier', 'boulevard', 'pier', 'boulevard', 'pier', 'boulevard'],
    size: 'wide',
  },
  cover3: {
    mode: 'cover',
    layout: 'poster',
    grade: 'krom',
    title: 'KOTA KROM',
    subtitle: 'Kilau di ujung jalan',
    tagline: 'SHINE BRIGHT, DRIVE FAST',
    photos: ['pier', 'boulevard', 'pier', 'boulevard', 'pier'],
    size: 'story',
  },
  cover4: {
    mode: 'cover',
    layout: 'duo',
    grade: 'magenta',
    title: 'SENJA MAGENTA',
    subtitle: 'Kota menyala magenta',
    tagline: 'EVERYONE WANTS A CUT OF THE SUNSET',
    photos: ['boulevard', 'pier'],
    size: 'square',
  },
};

export function shotFromUrl() {
  const q = new URLSearchParams(window.location.search);
  return SHOTS[q.get('shot')] ? q.get('shot') : null;
}

export function applyShot(state, name) {
  const shot = SHOTS[name];
  if (!shot) return state;
  const next = { ...state };
  next.layout = shot.layout;
  next.grade = shot.grade;
  next.title = shot.title;
  next.subtitle = shot.subtitle;
  next.tagline = shot.tagline;
  next.size = shot.size;
  next.panels = shot.photos.map((src) => ({ src, panX: 0, panY: 0, zoom: 1, face: null }));
  return next;
}
