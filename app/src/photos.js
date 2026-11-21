// Dusk Cover Studio — photos: loading sample photos and uploads, the
// per-panel crop state, and the face-aware crop. One file, one job: images
// in, drawn photos out.
import { SAMPLES } from "./config.js";

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("cannot load " + src));
    img.src = src;
  });
}

export async function loadSamples(state) {
  for (const s of SAMPLES) {
    try {
      const img = await loadImage(s.src);
      state.photos.set(s.id, img);
    } catch (e) {
      // A missing sample is skipped; the app still works with the rest.
    }
  }
}

// Where the face is, normalised to the image (0..1). Uses the FaceDetector
// API when the browser has it; otherwise the upper quartile, which keeps
// faces in frame for the usual portrait framing.
export async function faceFocus(img) {
  try {
    if (typeof FaceDetector !== "undefined") {
      const detector = new FaceDetector({ fastMode: true });
      const faces = await detector.detect(img);
      if (faces && faces.length) {
        // The largest face is the subject; a small background face is not.
        const f = faces
          .map((face) => face.boundingBox)
          .reduce((a, b) => (a.width * a.height >= b.width * b.height ? a : b));
        return {
          x: (f.x + f.width / 2) / img.naturalWidth,
          y: (f.y + f.height / 2) / img.naturalHeight,
        };
      }
    }
  } catch (e) {
    // Fall through to the fallback below.
  }
  return { x: 0.5, y: 0.25 };
}

export function makePanels(photoIds, count) {
  const panels = [];
  for (let i = 0; i < count; i++) {
    panels.push({
      photo: photoIds[i % photoIds.length],
      scale: 1,
      dx: 0,
      dy: 0,
      fx: 0.5,
      fy: 0.25,
      tag: "",
    });
  }
  return panels;
}

// Reset a panel's crop to its focus point (undo a drag or a zoom).
export function resetCrop(panel) {
  panel.scale = 1;
  panel.dx = 0;
  panel.dy = 0;
}

// Draw img into rect (pixels) honouring the panel's crop: a cover fit, then
// the panel's zoom (scale) and drag offsets (dx, dy in pixels), anchored so
// the panel's focus point (fx, fy) sits near the panel's upper middle. The
// result is clamped so the image always covers the panel.
export function drawPhoto(ctx, img, rect, panel, filter) {
  const { x, y, w, h } = rect;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (filter) ctx.filter = filter;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const cover = Math.max(w / iw, h / ih) * (panel.scale || 1);
  const dw = iw * cover;
  const dh = ih * cover;
  let dx0 = x + w * 0.5 - (panel.fx ?? 0.5) * dw + (panel.dx || 0);
  let dy0 = y + h * 0.32 - (panel.fy ?? 0.25) * dh + (panel.dy || 0);
  if (dw >= w) dx0 = Math.min(x, Math.max(x + w - dw, dx0));
  else dx0 = x + (w - dw) / 2;
  if (dh >= h) dy0 = Math.min(y, Math.max(y + h - dh, dy0));
  else dy0 = y + (h - dh) / 2;
  ctx.drawImage(img, dx0, dy0, dw, dh);
  ctx.restore();
  ctx.filter = "none";
}
