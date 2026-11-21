// Sampul Senja v3 — ui: the editor around the preview canvas.
// Builds the control panels, wires every input, drag-to-pan on the preview,
// and undo/redo. The preview is a live render of the same state the export
// uses, so the editor never lies about the cover.

import { LAYOUTS, GRADES, SIZES, SAMPLE_PHOTOS, FONTS } from './config.js';
import { photoBook } from './photos.js';
import { renderCover, sizeById, layoutById, panelRectsFor } from './render.js';
import { exportCurrent, exportAll } from './export.js';

// A small helper to build an element with attributes and children.
function el(tag, attrs = {}, ...kids) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  for (const kid of kids) {
    if (kid == null) continue;
    node.append(kid.nodeType ? kid : document.createTextNode(kid));
  }
  return node;
}

export class Editor {
  constructor(root, state, opts = {}) {
    this.root = root;
    this.state = state;
    this.onRender = opts.onRender || (() => {});
    this.history = [];
    this.future = [];
    this.drag = null;
    this.build();
  }

  // ---- history -----------------------------------------------------------
  snapshot() {
    return JSON.stringify(this.state);
  }

  commit() {
    this.history.push(this.snapshot());
    if (this.history.length > 60) this.history.shift();
    this.future = [];
    this.refreshRoleInputs();
    this.render();
  }

  undo() {
    if (this.history.length === 0) return;
    this.future.push(this.snapshot());
    const prev = JSON.parse(this.history.pop());
    Object.assign(this.state, prev);
    this.syncInputs();
    this.render();
  }

  redo() {
    if (this.future.length === 0) return;
    this.history.push(this.snapshot());
    const next = JSON.parse(this.future.pop());
    Object.assign(this.state, next);
    this.syncInputs();
    this.render();
  }

  // ---- build -------------------------------------------------------------
  build() {
    this.root.innerHTML = '';
    const header = el('header', { class: 'head' },
      el('div', { class: 'brand' },
        el('span', { class: 'logo', text: 'SS' }),
        el('div', {},
          el('h1', { text: 'Sampul Senja' }),
          el('p', { text: 'Ubah foto jadi sampul ala poster — offline, tanpa unggah.' }))),
      el('div', { class: 'head-actions' },
        el('button', { type: 'button', id: 'undoBtn', onclick: () => this.undo(), text: '↩ Urungkan' }),
        el('button', { type: 'button', id: 'redoBtn', onclick: () => this.redo(), text: '↪ Ulangi' })));
    const stage = el('section', { class: 'stage' },
      el('canvas', { id: 'preview', 'aria-label': 'Pratinjau sampul' }),
      el('p', { class: 'hint', id: 'hint', text: 'Klik panel untuk memilih · seret untuk menggeser foto di panel' }),
      el('p', { class: 'face-note', id: 'faceNote', hidden: '', text: '✓ Wajah terdeteksi — foto dibingkai otomatis' }));
    this.preview = stage.querySelector('#preview');
    this.faceNote = stage.querySelector('#faceNote');
    this.side = el('aside', { class: 'side' });
    this.root.append(header, el('main', { class: 'body' }, stage, this.side));
    this.buildSide();
    this.wirePreview();
    this.syncInputs();
  }

  buildSide() {
    const s = this.state;
    const side = this.side;
    side.innerHTML = '';

    // FOTO
    const photoSec = el('section', { class: 'card' },
      el('h2', { text: 'FOTO' }),
      el('div', { class: 'row' },
        el('label', { class: 'upload' },
          el('span', { text: '+ Unggah foto' }),
          el('input', { id: 'uploadInput', type: 'file', accept: 'image/*', hidden: '' })),
        el('button', { type: 'button', onclick: () => this.fillAll(), text: 'Isi semua panel' })),
      el('div', { class: 'row' },
        ...SAMPLE_PHOTOS.map((p) => el('button', {
          type: 'button', class: 'sample', onclick: () => this.assignPhoto(p.id), text: `Contoh: ${p.name}`,
        }))),
      el('div', { class: 'thumbs', id: 'thumbs' }),
      el('p', { class: 'note', text: 'Foto dibaca di perangkatmu dan tidak pernah diunggah.' }));
    side.append(photoSec);

    // TATA LETAK
    const layoutSec = el('section', { class: 'card' },
      el('h2', { text: 'TATA LETAK' }),
      el('div', { class: 'chips', id: 'layoutChips' },
        ...LAYOUTS.map((l) => el('button', {
          type: 'button', 'data-layout': l.id, onclick: () => { this.state.layout = l.id; this.commit(); }, text: l.name,
        }))));
    side.append(layoutSec);

    // WARNA
    const gradeSec = el('section', { class: 'card' },
      el('h2', { text: 'WARNA' }),
      el('div', { class: 'chips', id: 'gradeChips' },
        ...GRADES.map((g) => el('button', {
          type: 'button', 'data-grade': g.id, onclick: () => { this.state.grade = g.id; this.commit(); },
        }, el('span', { class: 'dot', style: `background:${g.accent}` }), g.name))));
    side.append(gradeSec);

    // GAYA JUDUL + UKURAN
    const styleSec = el('section', { class: 'card' },
      el('h2', { text: 'GAYA JUDUL' }),
      el('div', { class: 'chips' },
        el('button', { type: 'button', 'data-tstyle': 'krom', onclick: () => { this.state.titleStyle = 'krom'; this.commit(); }, text: 'Krom' }),
        el('button', { type: 'button', 'data-tstyle': 'gradasi', onclick: () => { this.state.titleStyle = 'gradasi'; this.commit(); }, text: 'Gradasi' })),
      el('h2', { text: 'UKURAN' }),
      el('div', { class: 'chips', id: 'sizeChips' },
        ...SIZES.map((z) => el('button', {
          type: 'button', 'data-size': z.id, onclick: () => { this.state.size = z.id; this.commit(); }, text: z.name,
        }))));
    side.append(styleSec);

    // TEKS
    const textSec = el('section', { class: 'card' },
      el('h2', { text: 'TEKS' }),
      this.textField('Judul', 'title', 'KOTA SENJA'),
      this.textField('Subjudul (script)', 'subtitle', 'Pantai di ujung senja'),
      this.textField('Tagline (pita)', 'tagline', 'EVERYONE WANTS A CUT OF THE SUNSET'),
      this.textField('Kutipan (bar atas)', 'quote', 'A city that never sleeps…'),
      this.textField('Kredit (bar bawah)', 'credits', 'A SAMPUL SENJA PRODUCTION'),
      this.textField('Teks segel emas', 'sealText', 'ORIGINAL COVER ART'));
    side.append(textSec);

    // PERAN PANEL
    const roleSec = el('section', { class: 'card' },
      el('h2', { text: 'PERAN PANEL' }),
      el('label', { class: 'check' },
        el('input', { type: 'checkbox', id: 'rolesToggle', checked: '', onchange: (e) => { this.state.roles = e.target.checked; this.commit(); } }),
        el('span', { text: 'Tampilkan tag peran di panel' })),
      el('div', { id: 'roleInputs' }));
    side.append(roleSec);

    // BINGKAI POSTER
    const frameSec = el('section', { class: 'card' },
      el('h2', { text: 'BINGKAI POSTER' }),
      el('label', { class: 'check' },
        el('input', { type: 'checkbox', id: 'frameToggle', checked: '', onchange: (e) => { this.state.frame = e.target.checked; this.commit(); } }),
        el('span', { text: 'Bingkai poster (bar atas + bar bawah)' })),
      el('label', { class: 'check' },
        el('input', { type: 'checkbox', id: 'sealToggle', checked: '', onchange: (e) => { this.state.seal = e.target.checked; this.commit(); } }),
        el('span', { text: 'Segel emas' })));
    side.append(frameSec);

    // PANEL TERPILIH (crop)
    const cropSec = el('section', { class: 'card' },
      el('h2', { text: 'PANEL TERPILIH' }),
      el('p', { class: 'note', id: 'selLabel', text: 'Panel 1' }),
      el('label', { class: 'slider' },
        el('span', { text: 'Zoom' }),
        el('input', {
          id: 'zoomSlider', type: 'range', min: '1', max: '2.5', step: '0.05', value: '1',
          oninput: (e) => { this.panel().crop.zoom = Number(e.target.value); this.render(); },
          onchange: () => this.commit(),
        })));
    side.append(cropSec);

    // EKSPOR
    const exportSec = el('section', { class: 'card' },
      el('h2', { text: 'EKSPOR' }),
      el('div', { class: 'row' },
        el('button', { type: 'button', class: 'primary', id: 'exportBtn', onclick: () => this.doExport(false), text: 'Ekspor PNG' }),
        el('button', { type: 'button', id: 'exportAllBtn', onclick: () => this.doExport(true), text: 'Export semua ukuran' })),
      el('p', { class: 'status', id: 'status', role: 'status' }));
    side.append(exportSec);

    // Upload wiring.
    side.querySelector('#uploadInput').addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const id = await photoBook.addUpload(file);
      if (id) {
        this.assignPhoto(id);
        this.setStatus('Foto ditambahkan.');
      } else {
        this.setStatus('Foto tidak bisa dibaca.');
      }
      e.target.value = '';
    });

    this.refreshThumbs();
    this.refreshRoleInputs();
  }

  textField(label, key, placeholder) {
    const input = el('input', {
      type: 'text', value: this.state[key], placeholder,
      oninput: (e) => { this.state[key] = e.target.value; this.render(); },
      onchange: () => this.commit(),
    });
    input.dataset.key = key;
    return el('label', { class: 'field' }, el('span', { text: label }), input);
  }

  panel() {
    return this.state.panels[this.state.selected];
  }

  refreshThumbs() {
    const box = this.side.querySelector('#thumbs');
    if (!box) return;
    box.innerHTML = '';
    for (const photo of photoBook.list()) {
      const img = el('img', { src: photo.src, alt: photo.name, title: photo.name });
      const btn = el('button', {
        type: 'button', class: 'thumb', onclick: () => this.assignPhoto(photo.id),
      }, img, el('span', { text: photo.name }));
      box.append(btn);
    }
  }

  refreshRoleInputs() {
    const box = this.side.querySelector('#roleInputs');
    if (!box) return;
    const layout = layoutById(this.state.layout);
    box.innerHTML = '';
    for (let i = 0; i < layout.panels; i++) {
      const p = this.state.panels[i];
      const input = el('input', {
        type: 'text', value: p.role, maxlength: '18',
        oninput: (e) => { p.role = e.target.value.toUpperCase(); this.render(); },
        onchange: () => this.commit(),
      });
      box.append(el('label', { class: 'field' }, el('span', { text: `Panel ${i + 1}` }), input));
    }
  }

  assignPhoto(photoId) {
    this.panel().photo = photoId;
    this.applyFaceFocus(this.state.selected);
    this.commit();
    this.refreshThumbs();
  }

  fillAll() {
    const id = this.panel().photo;
    for (const p of this.state.panels) p.photo = id;
    this.commit();
  }

  // Face-aware crop: when a face is detected in the panel's photo, centre
  // the crop on it; otherwise keep the upper-third fallback.
  async applyFaceFocus(panelIndex) {
    const panel = this.state.panels[panelIndex];
    const focus = await photoBook.detectFace(panel.photo);
    if (focus) {
      panel.crop.fx = focus.x;
      panel.crop.fy = focus.y;
      this.state.faceNote = photoBook.hasFace(panel.photo);
      this.render();
    }
  }

  syncInputs() {
    const side = this.side;
    if (!side) return;
    for (const input of side.querySelectorAll('input[data-key]')) {
      input.value = this.state[input.dataset.key];
    }
    const roles = side.querySelector('#rolesToggle');
    if (roles) roles.checked = this.state.roles;
    const frame = side.querySelector('#frameToggle');
    if (frame) frame.checked = this.state.frame;
    const seal = side.querySelector('#sealToggle');
    if (seal) seal.checked = this.state.seal;
    const zoom = side.querySelector('#zoomSlider');
    if (zoom) zoom.value = String(this.panel().crop.zoom);
    const label = side.querySelector('#selLabel');
    if (label) label.textContent = `Panel ${this.state.selected + 1} — ${this.panel().role || ''}`;
    for (const btn of side.querySelectorAll('[data-layout]')) {
      btn.classList.toggle('active', btn.dataset.layout === this.state.layout);
    }
    for (const btn of side.querySelectorAll('[data-grade]')) {
      btn.classList.toggle('active', btn.dataset.grade === this.state.grade);
    }
    for (const btn of side.querySelectorAll('[data-size]')) {
      btn.classList.toggle('active', btn.dataset.size === this.state.size);
    }
    for (const btn of side.querySelectorAll('[data-tstyle]')) {
      btn.classList.toggle('active', btn.dataset.tstyle === this.state.titleStyle);
    }
    this.refreshRoleInputs();
  }

  setStatus(text) {
    const node = this.side.querySelector('#status');
    if (node) node.textContent = text;
  }

  async doExport(all) {
    try {
      if (all) await exportAll(this.state, (t) => this.setStatus(t));
      else await exportCurrent(this.state, (t) => this.setStatus(t));
    } catch (err) {
      this.setStatus(`Gagal mengekspor: ${err.message}`);
    }
  }

  // ---- preview -----------------------------------------------------------
  render() {
    const size = sizeById(this.state.size);
    const canvas = this.preview;
    if (canvas.width !== size.w || canvas.height !== size.h) {
      canvas.width = size.w;
      canvas.height = size.h;
    }
    const ctx = canvas.getContext('2d');
    renderCover(ctx, size.w, size.h, this.state, 1);
    this.faceNote.hidden = !this.state.faceNote;
    this.onRender();
  }

  wirePreview() {
    const canvas = this.preview;
    const toCover = (e) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * canvas.width,
        y: ((e.clientY - rect.top) / rect.height) * canvas.height,
      };
    };
    canvas.addEventListener('pointerdown', (e) => {
      canvas.setPointerCapture(e.pointerId);
      const p = toCover(e);
      const rects = panelRectsFor(canvas.width, canvas.height, this.state);
      let hit = -1;
      rects.forEach((r, i) => {
        if (p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h) hit = i;
      });
      if (hit < 0) return;
      this.state.selected = hit;
      this.syncInputs();
      this.render();
      const panel = this.panel();
      this.drag = { startX: p.x, startY: p.y, fx: panel.crop.fx, fy: panel.crop.fy, moved: false };
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!this.drag) return;
      const p = toCover(e);
      const rects = panelRectsFor(canvas.width, canvas.height, this.state);
      const rect = rects[this.state.selected];
      if (!rect) return;
      const panel = this.panel();
      const photo = photoBook.get(panel.photo);
      if (!photo) return;
      // Dragging moves the focus point opposite to the pointer (natural pan).
      const iw = photo.img.naturalWidth;
      const ih = photo.img.naturalHeight;
      const scale = Math.max(rect.w / iw, rect.h / ih) * Math.max(1, panel.crop.zoom);
      const dx = (p.x - this.drag.startX) / (iw * scale);
      const dy = (p.y - this.drag.startY) / (ih * scale);
      panel.crop.fx = Math.min(0.95, Math.max(0.05, this.drag.fx - dx));
      panel.crop.fy = Math.min(0.95, Math.max(0.05, this.drag.fy - dy));
      this.drag.moved = true;
      this.render();
    });
    canvas.addEventListener('pointerup', () => {
      if (this.drag && this.drag.moved) this.commit();
      this.drag = null;
    });
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        this.undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        e.preventDefault();
        this.redo();
      }
    });
  }
}
