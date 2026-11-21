// The photo tray and each panel's crop: which photo a panel shows, its zoom and its pan.
// Crops are deterministic from a seed so staged screenshots re-take identically.
import { mulberry32 } from './config.js';
import { LAYOUTS } from './layouts.js';

let nextPhotoId = 1;

/** A photo the cover can draw: an HTML image plus the name the tray shows. */
export function makePhoto(img, name) {
  const photo = { id: `p${nextPhotoId}`, name, img };
  nextPhotoId += 1;
  return photo;
}

/** Default crops for a layout: each panel gets its own zoom and pan from the seed. */
export function defaultPanels(layoutId, photoIds, seed) {
  const rnd = mulberry32(seed * 7919 + 13);
  const count = LAYOUTS[layoutId].panels.length;
  const panels = [];
  for (let i = 0; i < count; i += 1) {
    panels.push({
      photoId: photoIds.length ? photoIds[i % photoIds.length] : null,
      zoom: 1.05 + rnd() * 0.4,
      ox: (rnd() - 0.5) * 0.6,
      oy: (rnd() - 0.5) * 0.6,
    });
  }
  return panels;
}
