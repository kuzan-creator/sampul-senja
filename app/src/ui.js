// Dusk Cover Studio — interface: wires every control to the state and the
// renderer, plus undo/redo history and panel drag/zoom on the canvas. One
// file, one job: the DOM.
import { SAMPLES, SIZES, ROLE_TAGS } from "./config.js";
import { layoutNames, layoutPanels } from "./layouts.js";
import { gradeNames } from "./grades.js";
import { loadImage, makePanels, faceFocus } from "./photos.js";
import { exportPNG, exportAll } from "./export.js";

function snapshot(state) {
  return JSON.stringify({
    title: state.title,
    subtitle: state.subtitle,
    tagline: state.tagline,
    quote: state.quote,
    credits: state.credits,
    layout: state.layout,
    grade: state.grade,
    titleStyle: state.titleStyle,
    seal: state.seal,
    frame: state.frame,
    halftone: state.halftone,
    panels: state.panels,
  });
}

function restore(state, snap) {
  Object.assign(state, JSON.parse(snap));
}

export function initUI(state, render, canvas) {
  const $ = (id) => document.getElementById(id);
  const history = { past: [], future: [] };
  let drag = null;

  function pushHistory() {
    history.past.push(snapshot(state));
    if (history.past.length > 60) history.past.shift();
    history.future.length = 0;
  }
  function undo() {
    if (!history.past.length) return;
    history.future.push(snapshot(state));
    restore(state, history.past.pop());
    syncInputs();
    render();
  }
  function redo() {
    if (!history.future.length) return;
    history.past.push(snapshot(state));
    restore(state, history.future.pop());
    syncInputs();
    render();
  }
  function changed() {
    pushHistory();
    render();
  }

  function chips(el, items, current, onPick) {
    el.innerHTML = "";
    for (const it of items) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = it.name;
      b.className = it.id === current ? "chip on" : "chip";
      b.addEventListener("click", () => {
        pushHistory();
        onPick(it.id);
        chips(el, items, it.id, onPick);
        render();
      });
      el.appendChild(b);
    }
  }

  function rebuildTags() {
    const box = $("tags");
    box.innerHTML = "";
    state.panels.forEach((p, i) => {
      const label = document.createElement("label");
      label.textContent = `Panel ${i + 1}`;
      const input = document.createElement("input");
      input.type = "text";
      input.value = p.tag || ROLE_TAGS[i % ROLE_TAGS.length];
      input.addEventListener("input", () => {
        p.tag = input.value;
        render();
      });
      input.addEventListener("change", () => pushHistory());
      label.appendChild(input);
      box.appendChild(label);
    });
    $("panel-no").textContent = `Panel terpilih: ${state.selected + 1} dari ${state.panels.length}`;
  }

  function rebuildPanelPhoto() {
    const sel = $("in-panel-photo");
    sel.innerHTML = "";
    const all = [...SAMPLES, ...state.uploads];
    for (const s of all) {
      const o = document.createElement("option");
      o.value = s.id;
      o.textContent = s.name;
      sel.appendChild(o);
    }
    const cur = state.panels[state.selected];
    if (cur) sel.value = cur.photo;
  }

  function syncInputs() {
    $("in-title").value = state.title;
    $("in-subtitle").value = state.subtitle;
    $("in-tagline").value = state.tagline;
    $("in-quote").value = state.quote;
    $("in-credits").value = state.credits;
    $("in-titlestyle").value = state.titleStyle;
    $("in-frame").checked = state.frame;
    $("in-seal").checked = state.seal;
    $("in-halftone").checked = state.halftone;
    chips($("layouts"), layoutNames(), state.layout, (id) => {
      state.layout = id;
      state.panels = makePanels(
        state.panels.map((p) => p.photo),
        layoutPanels(id).length,
      );
      rebuildTags();
      rebuildPanelPhoto();
    });
    chips($("grades"), gradeNames(), state.grade, (id) => {
      state.grade = id;
    });
    rebuildTags();
    rebuildPanelPhoto();
  }

  function bindText(id, key) {
    $(id).addEventListener("input", (e) => {
      state[key] = e.target.value;
      render();
    });
    $(id).addEventListener("change", () => pushHistory());
  }
  bindText("in-title", "title");
  bindText("in-subtitle", "subtitle");
  bindText("in-tagline", "tagline");
  bindText("in-quote", "quote");
  bindText("in-credits", "credits");

  $("in-titlestyle").addEventListener("change", (e) => {
    state.titleStyle = e.target.value;
    changed();
  });
  $("in-frame").addEventListener("change", (e) => {
    state.frame = e.target.checked;
    changed();
  });
  $("in-seal").addEventListener("change", (e) => {
    state.seal = e.target.checked;
    changed();
  });
  $("in-halftone").addEventListener("change", (e) => {
    state.halftone = e.target.checked;
    changed();
  });

  $("btn-undo").addEventListener("click", undo);
  $("btn-redo").addEventListener("click", redo);

  // Sample photos: clicking one sets the selected panel's photo.
  const sampleBox = $("samples");
  for (const s of SAMPLES) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "sample";
    b.title = s.name;
    const img = document.createElement("img");
    img.src = s.src;
    img.alt = s.name;
    b.appendChild(img);
    b.addEventListener("click", async () => {
      const p = state.panels[state.selected];
      if (!p) return;
      pushHistory();
      p.photo = s.id;
      const imgEl = state.photos.get(s.id);
      if (imgEl && imgEl._focus) {
        p.fx = imgEl._focus.x;
        p.fy = imgEl._focus.y;
      }
      rebuildPanelPhoto();
      render();
    });
    sampleBox.appendChild(b);
  }

  // Upload: adds the photo and puts it on the selected panel.
  $("upload").addEventListener("change", async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImage(url);
      const id = `up${state.uploads.length + 1}`;
      state.photos.set(id, img);
      state.uploads.push({ id, name: file.name, src: url });
      const f = await faceFocus(img);
      img._focus = f;
      const p = state.panels[state.selected];
      if (p) {
        pushHistory();
        p.photo = id;
        p.fx = f.x;
        p.fy = f.y;
      }
      rebuildPanelPhoto();
      render();
    } catch (err) {
      // Unreadable file: ignore it.
    }
    e.target.value = "";
  });

  $("in-panel-photo").addEventListener("change", (e) => {
    const p = state.panels[state.selected];
    if (!p) return;
    pushHistory();
    p.photo = e.target.value;
    const img = state.photos.get(p.photo);
    if (img && img._focus) {
      p.fx = img._focus.x;
      p.fy = img._focus.y;
    }
    render();
  });

  // Export buttons.
  const expBox = $("exports");
  for (const s of SIZES) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.textContent = s.label;
    b.addEventListener("click", () => exportPNG(state, s));
    expBox.appendChild(b);
  }
  $("btn-export-all").addEventListener("click", () => exportAll(state));

  // Canvas: click to select a panel, drag to move its photo, scroll to zoom.
  function toCanvas(e) {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * canvas.width,
      y: ((e.clientY - r.top) / r.height) * canvas.height,
    };
  }
  function hitPanel(x, y) {
    const rects = layoutPanels(state.layout);
    for (let i = rects.length - 1; i >= 0; i--) {
      const r = rects[i];
      if (x >= r.x * canvas.width && x <= (r.x + r.w) * canvas.width && y >= r.y * canvas.height && y <= (r.y + r.h) * canvas.height) return i;
    }
    return -1;
  }
  canvas.addEventListener("pointerdown", (e) => {
    const p = toCanvas(e);
    const i = hitPanel(p.x, p.y);
    if (i < 0) return;
    state.selected = i;
    rebuildPanelPhoto();
    $("panel-no").textContent = `Panel terpilih: ${i + 1} dari ${state.panels.length}`;
    const panel = state.panels[i];
    drag = { x: p.x, y: p.y, dx: panel.dx, dy: panel.dy, moved: false };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const p = toCanvas(e);
    const panel = state.panels[state.selected];
    panel.dx = drag.dx + (p.x - drag.x);
    panel.dy = drag.dy + (p.y - drag.y);
    if (Math.abs(p.x - drag.x) + Math.abs(p.y - drag.y) > 4) drag.moved = true;
    render();
  });
  canvas.addEventListener("pointerup", () => {
    if (drag && drag.moved) pushHistory();
    drag = null;
  });
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const panel = state.panels[state.selected];
    if (!panel) return;
    panel.scale = Math.min(4, Math.max(0.5, panel.scale * (e.deltaY < 0 ? 1.1 : 0.9)));
    render();
  }, { passive: false });

  syncInputs();
  pushHistory();
}
