// Sampul Senja v4 — photos: loading, face-aware framing, and cover-fit
// drawing. A panel keeps a focus point (the face when one is found, else
// the upper third where faces usually sit); the renderer frames the photo
// around that point, and the user can still drag to pan and zoom to adjust.

const cache = new Map();

export function loadImage(src) {
  if (cache.has(src)) return cache.get(src);
  const p = new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('cannot load ' + src));
    img.src = src;
  });
  cache.set(src, p);
  return p;
}

// Detect a face with the browser's FaceDetector when it exists; otherwise
// return null and the caller falls back to the upper-third bias.
export async function detectFace(img) {
  try {
    if (typeof window === 'undefined' || !('FaceDetector' in window)) return null;
    const detector = new window.FaceDetector({ fastMode: true });
    const faces = await detector.detect(img);
    if (!faces || !faces.length) return null;
    const b = faces[0].boundingBox;
    return {
      x: (b.x + b.width / 2) / img.naturalWidth,
      y: (b.y + b.height / 2) / img.naturalHeight,
      found: true,
    };
  } catch (e) {
    return null;
  }
}

// Focus point for a panel: a detected face, else the upper quarter, where
// faces sit in the kit's sample photos (and in most portrait photos).
export function focusOf(panel) {
  if (panel.face && panel.face.found) return { x: panel.face.x, y: panel.face.y };
  return { x: 0.5, y: 0.25 };
}

// Draw an image cover-fitting rect, framed on the focus point, with the
// panel's pan (fractions of the rect) and zoom applied on top.
export function drawCover(ctx, img, rect, panel) {
  const zoom = panel.zoom || 1;
  const focus = focusOf(panel);
  const scale = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight) * zoom;
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  // Shift the image so the focus point lands at the rect's centre, then
  // clamp so no gap shows at the edges.
  let dx = rect.x + (rect.w - dw) / 2 + (0.5 - focus.x) * (dw - rect.w);
  let dy = rect.y + (rect.h - dh) / 2 + (0.5 - focus.y) * (dh - rect.h);
  dx = Math.min(rect.x, Math.max(rect.x + rect.w - dw, dx));
  dy = Math.min(rect.y, Math.max(rect.y + rect.h - dh, dy));
  // User pan, in fractions of the rect, clamped to the image edges.
  dx += (panel.panX || 0) * rect.w;
  dy += (panel.panY || 0) * rect.h;
  dx = Math.min(rect.x, Math.max(rect.x + rect.w - dw, dx));
  dy = Math.min(rect.y, Math.max(rect.y + rect.h - dh, dy));
  ctx.drawImage(img, dx, dy, dw, dh);
}
