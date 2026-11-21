// Dusk Cover Studio — entry point: builds the state, loads the fonts and
// the sample photos, applies a ?shot= staging when present, renders, and
// wires the interface. One file, one job: startup.
import { defaultState } from "./config.js";
import { loadSamples, makePanels, faceFocus } from "./photos.js";
import { layoutPanels } from "./layouts.js";
import { renderCover } from "./render.js";
import { initUI } from "./ui.js";
import { applyShot } from "./shots.js";

const state = defaultState();
const canvas = document.getElementById("cover");
const ctx = canvas.getContext("2d");

function render() {
  renderCover(ctx, state, canvas.width, canvas.height);
}

async function start() {
  canvas.width = 1080;
  canvas.height = 810;
  // Load the display fonts before the first render so the title draws right.
  try {
    await Promise.all([
      document.fonts.load('900 100px Anton'),
      document.fonts.load('700 40px "Bebas Neue"'),
      document.fonts.load('40px Pacifico'),
    ]);
  } catch (e) {
    // Fallbacks in the CSS stacks cover a missing font.
  }
  await loadSamples(state);
  console.log(`Dusk Cover Studio: ${state.photos.size} sample photos loaded`);
  // Face-aware focus for every sample photo, once, up front.
  for (const img of state.photos.values()) {
    img._focus = await faceFocus(img);
  }
  const params = new URLSearchParams(location.search);
  const shot = params.get("shot");
  if (shot && applyShot(state, shot)) {
    // Panels already took their focus from their photo in applyShot.
  } else {
    state.panels = makePanels(
      ["portrait", "car", "marina", "boulevard2"],
      layoutPanels(state.layout).length,
    );
    state.panels.forEach((p) => {
      const img = state.photos.get(p.photo);
      if (img && img._focus) {
        p.fx = img._focus.x;
        p.fy = img._focus.y;
      }
    });
  }
  // Cover-only mode for screenshot runs: hide the editor chrome and size
  // the canvas to the requested cover dimensions.
  if (params.get("cover") === "1") {
    document.body.classList.add("cover-only");
    canvas.width = Number(params.get("w") || 1280);
    canvas.height = Number(params.get("h") || 720);
  }
  render();
  initUI(state, render, canvas);
  window.__dusk = { state, render };
}

start();
