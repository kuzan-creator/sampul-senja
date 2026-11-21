// Wires the editor controls to the app: photos, layouts, grades, sizes, text, panel crop and export.
import { SIZES, SAMPLE_PHOTOS, loadImage } from './config.js';
import { LAYOUTS, panelAt } from './layouts.js';
import { GRADES } from './grades.js';

export function initUI(app) {
  const $ = (id) => document.getElementById(id);
  const preview = $('preview');
  const status = $('status');

  function chip(container, label, onClick, extra) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    if (extra) extra(b);
    b.append(label);
    b.addEventListener('click', onClick);
    container.appendChild(b);
    return b;
  }

  const layoutBtns = {};
  for (const layout of Object.values(LAYOUTS)) {
    layoutBtns[layout.id] = chip($('layoutList'), layout.name, () => app.setLayout(layout.id));
  }
  const gradeBtns = {};
  for (const grade of Object.values(GRADES)) {
    gradeBtns[grade.id] = chip($('gradeList'), grade.name, () => app.setGrade(grade.id), (b) => {
      const sw = document.createElement('span');
      sw.className = 'swatch';
      sw.style.background = `linear-gradient(135deg, ${grade.title[0]}, ${grade.title[1]} 55%, ${grade.title[2]})`;
      b.prepend(sw);
    });
  }
  const sizeBtns = {};
  for (const size of Object.values(SIZES)) {
    sizeBtns[size.id] = chip($('sizeList'), size.label, () => app.setSize(size.id));
  }
  for (const size of Object.values(SIZES)) {
    chip($('exportList'), `PNG ${size.label}`, async () => {
      status.textContent = 'Mengekspor…';
      try {
        app.setSize(size.id);
        await app.exportAs(size.id);
        status.textContent = `Tersimpan sampul-senja-${size.w}x${size.h}.png`;
      } catch {
        status.textContent = 'Gagal mengekspor. Coba lagi.';
      }
    });
  }
  for (const sample of SAMPLE_PHOTOS) {
    chip($('sampleList'), `Contoh: ${sample.name}`, async () => {
      await app.ensureSamples();
      app.assignPhotoToSelectedPanel(sample.id);
      status.textContent = `Foto ${sample.name} dipakai di panel terpilih.`;
    });
  }

  function photoName(photoId) {
    const p = app.state.photos.find((x) => x.id === photoId);
    return p ? p.name : 'tanpa foto';
  }

  function rebuildThumbs() {
    const list = $('thumbList');
    list.textContent = '';
    for (const photo of app.state.photos) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'thumb';
      b.title = photo.name;
      if (photo.id === app.state.selectedPhotoId) b.classList.add('active');
      const img = document.createElement('img');
      img.src = photo.img.src;
      img.alt = photo.name;
      b.appendChild(img);
      const used = app.state.panels
        .map((p, i) => (p.photoId === photo.id ? i + 1 : null))
        .filter((x) => x !== null);
      if (used.length) {
        const tag = document.createElement('span');
        tag.className = 'used';
        tag.textContent = `Panel ${used.join(', ')}`;
        b.appendChild(tag);
      }
      b.addEventListener('click', () => app.assignPhotoToSelectedPanel(photo.id));
      list.appendChild(b);
    }
  }

  function refresh() {
    const s = app.state;
    for (const [id, b] of Object.entries(layoutBtns)) b.classList.toggle('active', s.layout === id);
    for (const [id, b] of Object.entries(gradeBtns)) b.classList.toggle('active', s.grade === id);
    for (const [id, b] of Object.entries(sizeBtns)) b.classList.toggle('active', s.size === id);
    const panel = s.panels[s.selectedPanel];
    $('panelLabel').textContent = panel
      ? `Panel ${s.selectedPanel + 1} dari ${s.panels.length} · ${photoName(panel.photoId)}`
      : 'Tidak ada panel';
    $('zoomRange').value = panel ? String(panel.zoom) : '1';
    if (document.activeElement !== $('titleInput')) $('titleInput').value = s.title;
    if (document.activeElement !== $('subtitleInput')) $('subtitleInput').value = s.subtitle;
    $('titleScale').value = String(s.titleScale);
    $('undoBtn').disabled = !app.canUndo();
    $('redoBtn').disabled = !app.canRedo();
    rebuildThumbs();
  }

  app.onRefresh(refresh);

  $('photoInput').addEventListener('change', async (e) => {
    const files = [...e.target.files];
    let first = null;
    for (const file of files) {
      try {
        const img = await loadImage(URL.createObjectURL(file));
        const photo = app.addPhoto(img, file.name);
        if (!first) first = photo;
      } catch {
        status.textContent = `Tidak bisa membaca ${file.name}.`;
      }
    }
    if (first) {
      app.setSelectedPhoto(first.id);
      app.assignPhotoToSelectedPanel(first.id);
      status.textContent = `${files.length} foto ditambahkan.`;
    }
    e.target.value = '';
  });

  $('titleInput').addEventListener('input', (e) => app.setTitle(e.target.value, { silent: true }));
  $('titleInput').addEventListener('change', () => app.commit());
  $('subtitleInput').addEventListener('input', (e) => app.setSubtitle(e.target.value, { silent: true }));
  $('subtitleInput').addEventListener('change', () => app.commit());
  $('titleScale').addEventListener('input', (e) => app.setTitleScale(parseFloat(e.target.value), { silent: true }));
  $('titleScale').addEventListener('change', () => app.commit());
  $('zoomRange').addEventListener('input', (e) => app.setPanelZoom(parseFloat(e.target.value), { silent: true }));
  $('zoomRange').addEventListener('change', () => app.commit());
  $('centerCrop').addEventListener('click', () => app.centerSelectedPanel());
  $('fillAll').addEventListener('click', () => {
    const id = app.state.selectedPhotoId || app.state.panels[app.state.selectedPanel]?.photoId;
    if (id) app.fillAllPanels(id);
  });
  $('undoBtn').addEventListener('click', () => app.undo());
  $('redoBtn').addEventListener('click', () => app.redo());
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      app.undo();
    }
    if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y'
      || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
      e.preventDefault();
      app.redo();
    }
  });

  function toCanvasCoords(e) {
    const rect = preview.getBoundingClientRect();
    return {
      px: (e.clientX - rect.left) * preview.width / rect.width,
      py: (e.clientY - rect.top) * preview.height / rect.height,
    };
  }

  let dragging = false;
  let moved = false;
  let lastX = 0;
  let lastY = 0;
  preview.addEventListener('pointerdown', (e) => {
    const { px, py } = toCanvasCoords(e);
    const idx = panelAt(app.state.layout, preview.width, preview.height, px, py);
    if (idx >= 0) app.selectPanel(idx);
    dragging = true;
    moved = false;
    lastX = px;
    lastY = py;
    preview.setPointerCapture(e.pointerId);
  });
  preview.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const { px, py } = toCanvasCoords(e);
    if (Math.abs(px - lastX) > 1 || Math.abs(py - lastY) > 1) moved = true;
    app.panSelectedPanel(px - lastX, py - lastY);
    lastX = px;
    lastY = py;
  });
  preview.addEventListener('pointerup', () => {
    if (dragging && moved) app.commit();
    dragging = false;
  });
  preview.addEventListener('pointercancel', () => { dragging = false; });

  refresh();
}
