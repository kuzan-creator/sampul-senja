// Sampul Senja: the app. Holds the cover state, the actions the controls call,
// and the start-up that loads the fonts and the sample photos.
import { SIZES, SAMPLE_PHOTOS, DEFAULT_TITLE, DEFAULT_SUBTITLE, loadImage } from './config.js';
import { LAYOUTS, panelRects } from './layouts.js';
import { drawCover } from './render.js';
import { makePhoto, defaultPanels } from './photos.js';
import { initUI } from './ui.js';
import { runShot } from './shots.js';
import { exportSize } from './export.js';

const canvas = document.getElementById('preview');

function freshState() {
  return {
    layout: 'hero',
    grade: 'senja',
    size: 'square',
    title: DEFAULT_TITLE,
    subtitle: DEFAULT_SUBTITLE,
    titleScale: 1,
    badge: true,
    photos: [],
    panels: [],
    selectedPanel: 0,
    selectedPhotoId: null,
    seed: 1,
  };
}

export function createApp() {
  const state = freshState();
  const undoStack = [];
  const redoStack = [];
  let refreshUI = null;
  let lastRenderedSize = null;

  function snapshot() {
    return JSON.stringify({
      layout: state.layout,
      grade: state.grade,
      size: state.size,
      title: state.title,
      subtitle: state.subtitle,
      titleScale: state.titleScale,
      badge: state.badge,
      panels: state.panels,
      selectedPanel: state.selectedPanel,
      selectedPhotoId: state.selectedPhotoId,
    });
  }

  function restore(json) {
    const s = JSON.parse(json);
    state.layout = s.layout;
    state.grade = s.grade;
    state.size = s.size;
    state.title = s.title;
    state.subtitle = s.subtitle;
    state.titleScale = s.titleScale;
    state.badge = s.badge !== false;
    state.panels = s.panels.map((p) => ({ ...p }));
    state.selectedPanel = s.selectedPanel;
    state.selectedPhotoId = s.selectedPhotoId;
  }

  function commit() {
    undoStack.push(snapshot());
    if (undoStack.length > 80) undoStack.shift();
    redoStack.length = 0;
  }

  function render() {
    const size = SIZES[state.size];
    if (lastRenderedSize !== state.size) {
      canvas.width = size.w;
      canvas.height = size.h;
      lastRenderedSize = state.size;
    }
    drawCover(canvas, state);
    if (refreshUI) refreshUI();
  }

  function change(fn, opts = {}) {
    fn();
    if (!opts.silent) commit();
    render();
  }

  function syncPanels(seed = state.seed) {
    const count = LAYOUTS[state.layout].panels.length;
    const photoIds = state.photos.map((p) => p.id);
    const fresh = defaultPanels(state.layout, photoIds, seed);
    const kept = state.panels.slice(0, count);
    const added = [];
    for (let i = kept.length; i < count; i += 1) { kept.push(fresh[i]); added.push(i); }
    state.panels = kept;
    if (state.selectedPanel >= count) state.selectedPanel = 0;
    biasPanels(added);
  }

  /** Wide panels show only a thin band of a square photo, so a fresh crop of one
   * is biased to the top, where faces are, instead of the middle. */
  function biasPanel(panel, rect) {
    const photo = state.photos.find((p) => p.id === panel.photoId);
    if (!photo) return;
    const panelAspect = rect.w / rect.h;
    const photoAspect = photo.img.naturalWidth / photo.img.naturalHeight;
    if (panelAspect > 1.6 && photoAspect < 1.2) {
      panel.oy = -0.42;
      panel.zoom = Math.min(panel.zoom, 1.05);
    }
  }

  function biasPanels(indices) {
    const size = SIZES[state.size];
    const rects = panelRects(state.layout, size.w, size.h);
    for (const i of indices) {
      if (state.panels[i] && rects[i]) biasPanel(state.panels[i], rects[i]);
    }
  }

  const app = {
    state,
    render,
    onRefresh(fn) { refreshUI = fn; },
    commit,
    undo() {
      if (undoStack.length > 1) {
        redoStack.push(undoStack.pop());
        restore(undoStack[undoStack.length - 1]);
        render();
      }
    },
    redo() {
      if (redoStack.length > 0) {
        const s = redoStack.pop();
        undoStack.push(s);
        restore(s);
        render();
      }
    },
    canUndo() { return undoStack.length > 1; },
    canRedo() { return redoStack.length > 0; },
    setLayout(id, opts) { change(() => { state.layout = id; syncPanels(); }, opts); },
    setGrade(id, opts) { change(() => { state.grade = id; }, opts); },
    setSize(id, opts) { change(() => { state.size = id; }, opts); },
    setTitle(t, opts) { change(() => { state.title = t; }, opts); },
    setSubtitle(t, opts) { change(() => { state.subtitle = t; }, opts); },
    setTitleScale(v, opts) { change(() => { state.titleScale = v; }, opts); },
    setBadge(v, opts) { change(() => { state.badge = v; }, opts); },
    selectPanel(i) {
      state.selectedPanel = i;
      const panel = state.panels[i];
      if (panel && panel.photoId) state.selectedPhotoId = panel.photoId;
      render();
    },
    setSelectedPhoto(photoId) {
      state.selectedPhotoId = photoId;
      render();
    },
    assignPhotoToSelectedPanel(photoId, opts) {
      change(() => {
        const panel = state.panels[state.selectedPanel];
        if (panel) panel.photoId = photoId;
        state.selectedPhotoId = photoId;
      }, opts);
    },
    fillAllPanels(photoId, opts) {
      change(() => {
        state.panels.forEach((panel) => { panel.photoId = photoId; });
        state.selectedPhotoId = photoId;
      }, opts);
    },
    setPanelZoom(zoom, opts) {
      change(() => {
        const panel = state.panels[state.selectedPanel];
        if (panel) panel.zoom = zoom;
      }, opts);
    },
    centerSelectedPanel(opts) {
      change(() => {
        const panel = state.panels[state.selectedPanel];
        if (panel) { panel.zoom = 1.1; panel.ox = 0; panel.oy = 0; }
      }, opts);
    },
    panSelectedPanel(dpx, dpy) {
      const panel = state.panels[state.selectedPanel];
      if (!panel) return;
      const size = SIZES[state.size];
      const rects = panelRects(state.layout, size.w, size.h);
      const rect = rects[state.selectedPanel];
      const photo = state.photos.find((p) => p.id === panel.photoId);
      if (!rect || !photo) return;
      const base = Math.max(rect.w / photo.img.naturalWidth, rect.h / photo.img.naturalHeight) * panel.zoom;
      const oxOverflow = Math.max(1, photo.img.naturalWidth * base - rect.w);
      const oyOverflow = Math.max(1, photo.img.naturalHeight * base - rect.h);
      panel.ox = Math.max(-0.5, Math.min(0.5, panel.ox - dpx / oxOverflow));
      panel.oy = Math.max(-0.5, Math.min(0.5, panel.oy - dpy / oyOverflow));
      render();
    },
    addPhoto(img, name) {
      const photo = makePhoto(img, name);
      state.photos.push(photo);
      let assigned = false;
      state.panels.forEach((panel) => {
        if (!panel.photoId) { panel.photoId = photo.id; assigned = true; }
      });
      if (assigned) commit();
      render();
      return photo;
    },
    async ensureSamples() {
      for (const s of SAMPLE_PHOTOS) {
        if (state.photos.some((p) => p.id === s.id)) continue;
        try {
          const img = await loadImage(s.url);
          state.photos.push({ id: s.id, name: s.name, img });
        } catch {
          // A missing sample leaves its panels as a gradient; the app still works.
        }
      }
      const ids = state.photos.map((p) => p.id);
      state.panels.forEach((panel, i) => {
        if (!panel.photoId && ids.length) panel.photoId = ids[i % ids.length];
      });
      biasPanels(state.panels.map((_, i) => i));
    },
    resetPanels(seed) {
      state.panels = defaultPanels(state.layout, state.photos.map((p) => p.id), seed);
      state.selectedPanel = 0;
      biasPanels(state.panels.map((_, i) => i));
      render();
    },
    async exportAs(sizeId) {
      return exportSize(state, sizeId);
    },
    async waitForFonts() {
      try {
        await Promise.race([
          Promise.all([
            document.fonts.load('400 100px Anton'),
            document.fonts.load('400 100px "Bebas Neue"'),
            document.fonts.load('400 100px Pacifico'),
          ]),
          new Promise((resolve) => setTimeout(resolve, 4000)),
        ]);
      } catch {
        // Falls back to the system sans in the lettering.
      }
    },
  };

  syncPanels();
  undoStack.push(snapshot());
  return app;
}

const app = createApp();
initUI(app);

async function init() {
  await app.waitForFonts();
  await app.ensureSamples();
  app.render();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => app.render());
  }
  const params = new URLSearchParams(location.search);
  const shot = params.get('shot');
  if (shot) await runShot(app, shot, params);
}

init();
