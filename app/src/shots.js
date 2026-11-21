// Sampul Senja v3 — shots: deterministic staging for screenshots.
// ?shot=cover&photo=pier&caption=KOTA%20SENJA&seed=1 renders one cover;
// ?shot=editor shows the full editor. The same state the user edits is
// staged here, so a screenshot is always a real render of the app.

import { photoBook } from './photos.js';

// One staging preset per shot name.
const PRESETS = {
  cover: {
    layout: 'poster', grade: 'senja', size: '1920x1080',
    title: 'KOTA SENJA', subtitle: 'Pantai di ujung senja',
    tagline: 'EVERYONE WANTS A CUT OF THE SUNSET',
    photo: 'pier', frame: true, roles: true, seal: true, mode: 'cover',
  },
  editor: {
    layout: 'tilted', grade: 'noir', size: '1080x1080',
    title: 'BOULEVARD', subtitle: 'Emas di ujung jalan',
    tagline: 'EVERYONE WANTS A CUT OF THE SUNSET',
    photo: 'boulevard', frame: true, roles: true, seal: true, mode: 'editor',
  },
  story: {
    layout: 'poster', grade: 'emas', size: '1080x1920',
    title: 'SENJA TERAKHIR', subtitle: 'Satu kota satu malam',
    tagline: 'ONE CITY, ONE NIGHT',
    photo: 'pier', frame: true, roles: true, seal: true, mode: 'cover',
  },
  square: {
    layout: 'tilted', grade: 'neon', size: '1080x1080',
    title: 'NEON BOULEVARD', subtitle: 'Kota menyala',
    tagline: 'EVERYONE WANTS A CUT OF THE SUNSET',
    photo: 'boulevard', frame: true, roles: true, seal: true, mode: 'cover',
  },
};

// Apply a shot preset to the state. Returns the mode ('cover' or 'editor').
// `editor` is the Editor instance, so the UI is synced after staging.
export async function applyShot(state, editor) {
  const params = new URLSearchParams(window.location.search);
  const name = params.get('shot');
  if (!name || !PRESETS[name]) return 'editor';
  const preset = PRESETS[name];
  state.layout = preset.layout;
  state.grade = preset.grade;
  state.size = preset.size;
  state.title = params.get('caption') || preset.title;
  state.subtitle = params.get('subtitle') || preset.subtitle;
  state.tagline = preset.tagline;
  state.frame = preset.frame;
  state.roles = preset.roles;
  state.seal = preset.seal;
  state.titleStyle = 'krom';
  const photoId = params.get('photo') || preset.photo;
  // The staged photo goes in every panel; the other sample fills alternates.
  const other = photoId === 'pier' ? 'boulevard' : 'pier';
  state.panels.forEach((p, i) => {
    p.photo = i % 2 === 0 ? photoId : other;
    p.crop = { fx: 0.5, fy: 0.35, zoom: 1 };
  });
  // Face-aware framing for the staged panels (best effort, then fallback).
  for (let i = 0; i < state.panels.length; i++) {
    const focus = await photoBook.detectFace(state.panels[i].photo);
    if (focus) {
      state.panels[i].crop.fx = focus.x;
      state.panels[i].crop.fy = focus.y;
      state.faceNote = true;
    }
  }
  if (preset.mode === 'cover') document.body.classList.add('shot');
  editor.syncInputs();
  editor.render();
  return preset.mode;
}
