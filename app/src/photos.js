// Sampul Senja v3 — photos: loading, per-panel assignment, crop and face framing.
// Photos are read on the user's own machine and never uploaded.

import { SAMPLE_PHOTOS } from './config.js';

// A loaded photo: an <img> plus its id, name and where it came from.
class PhotoBook {
  constructor() {
    this.items = new Map(); // id -> {id, name, src, img, loaded}
    this.faceCache = new Map(); // photo id -> detected face focus {x, y} or null
    this.faceFound = new Set(); // photo ids where a face was detected
  }

  // Load the kit's two sample photos (model-made, free to use).
  async loadSamples() {
    for (const s of SAMPLE_PHOTOS) {
      await this.add(s.id, s.name, s.src);
    }
  }

  // Load one image from a URL (a sample) or a data: URI (an upload).
  add(id, name, src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.items.set(id, { id, name, src, img, loaded: true });
        resolve(true);
      };
      img.onerror = () => resolve(false);
      img.src = src;
    });
  }

  // Add a user upload (a File from the file picker) and return its id.
  async addUpload(file) {
    const id = `up${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('cannot read file'));
      reader.readAsDataURL(file);
    });
    const ok = await this.add(id, file.name.replace(/\.[^.]+$/, '') || 'Foto', dataUrl);
    return ok ? id : null;
  }

  get(id) {
    return this.items.get(id) || null;
  }

  list() {
    return [...this.items.values()];
  }

  // Try the browser's FaceDetector on a photo; returns a focus point {x, y}
  // in 0..1 image coordinates, or null when no face is found / unavailable.
  async detectFace(photoId) {
    if (this.faceCache.has(photoId)) return this.faceCache.get(photoId);
    const photo = this.get(photoId);
    let focus = null;
    if (photo && 'FaceDetector' in window) {
      try {
        const detector = new FaceDetector({ fastMode: true });
        const faces = await detector.detect(photo.img);
        if (faces && faces.length > 0) {
          const box = faces[0].boundingBox;
          const cx = (box.x + box.width / 2) / photo.img.naturalWidth;
          const cy = (box.y + box.height / 2) / photo.img.naturalHeight;
          focus = { x: Math.min(0.9, Math.max(0.1, cx)), y: Math.min(0.9, Math.max(0.1, cy)) };
          this.faceFound.add(photoId);
        }
      } catch (err) {
        focus = null; // FaceDetector present but unusable: fall back below.
      }
    }
    this.faceCache.set(photoId, focus);
    return focus;
  }

  hasFace(photoId) {
    return this.faceFound.has(photoId);
  }
}

// Draw one photo into a rect with a cover fit around a focus point.
// crop = {fx, fy, zoom}: the focus (0..1) sits at the rect's centre, zoom >= 1.
// The image is clamped so it always covers the rect.
export function drawCoverPhoto(ctx, img, rect, crop) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  if (!iw || !ih) return;
  const zoom = Math.max(1, crop.zoom || 1);
  const scale = Math.max(rect.w / iw, rect.h / ih) * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  let dx = rect.x + rect.w / 2 - (crop.fx ?? 0.5) * dw;
  let dy = rect.y + rect.h / 2 - (crop.fy ?? 0.35) * dh;
  dx = Math.min(rect.x, Math.max(rect.x + rect.w - dw, dx));
  dy = Math.min(rect.y, Math.max(rect.y + rect.h - dh, dy));
  ctx.drawImage(img, dx, dy, dw, dh);
}

// The fallback focus when no face is found: upper third, centred (portraits).
export const FALLBACK_FOCUS = { x: 0.5, y: 0.35 };

export const photoBook = new PhotoBook();
