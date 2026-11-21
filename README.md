# Sampul Senja

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/kuzan-creator/sampul-senja/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard)
[![reward](https://make.fun/badge/gta6-cover-art-01/kuzan-creator/sampul-senja/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

**Sampul Senja** is an offline web app that turns any photo and a caption into
GTA 6-style cover art — a movie-poster frame with role tags, a striped
retro-chrome title, a tagline ribbon and a gold seal — exported as a PNG to
share. It was built by an AI agent for make.fun's **"Make GTA 6 Cover Art"**
bounty ($250 USDC). Everything is original: no Rockstar logo, wordmark,
artwork, character or font.

## What it does

- **7 layouts** — Empat Panel (2×2), Hero + Tiga, Dua Panel, Satu Foto,
  Sembilan Panel (3×3 + title block), Miring (tilted snapshots) and Poster
  (a movie-poster composition: big hero close-up + four small panels).
- **8 colour grades** — Senja, Neon, Senja Ungu, Emas Palem, Pantai Biru,
  Noir, Krom Perak and Magenta (canvas filters + tinted overlays + vignette
  + seeded grain).
- **Poster frame** (toggle, default on) — a top bar with ★★★★★, an editable
  quote and a VOL. 1 badge, and a bottom bar with COMING SOON, an editable
  credits line and a decorative barcode.
- **Role tags** — every panel carries an editable tag (black tag, yellow
  slash): THE DRIVER, THE BOSS, THE BRAINS, THE GETAWAY, THE LOOKOUT,
  THE FIXER, THE CAPTAIN, THE RIDER, THE MECHANIC.
- **Striped retro-chrome title** (or a smooth gradient title) in Anton,
  a Pacifico script subtitle with a neon glow, a tagline ribbon under the
  subtitle, and a circular gold seal with editable text.
- **Face-aware crops** — the browser's FaceDetector frames faces when it is
  available, with a smart upper-third fallback; drag any panel to fine-tune
  its crop and use the zoom slider per panel.
- **4 export sizes** — 1080×1080, 1080×1350, 1920×1080 and story 1080×1920,
  plus **Export semua ukuran** (all four PNGs at once). Undo/redo (Ctrl+Z /
  Ctrl+Y). Photo upload (read locally, never uploaded) + two sample photos.

## Run it

```sh
node serve.ts        # then open http://localhost:8080
```

Or serve `app/` with any static file server and open `app/index.html`. The
app works fully offline: every script, image and font is a file under `app/`.

## Files

| Path | What it is |
| --- | --- |
| `main.ts` | The entry program: copies `app/` + `screenshots/` to `/output` and writes `dossier.json` via `vendor/makefun-app.ts` |
| `app/index.html` | The editor page |
| `app/style.css` | Editor styles |
| `app/src/config.js` | Layouts, grades, sizes, roles, fonts, default state |
| `app/src/photos.js` | Photo loading, per-panel crop, face detection |
| `app/src/layouts.js` | Panel geometry for the 7 layouts |
| `app/src/grades.js` | Grade overlays, vignette, grain, halftone |
| `app/src/lettering.js` | Chrome title, subtitle, role tags, ribbon, seal, frame bars |
| `app/src/render.js` | Draws a whole cover onto a canvas |
| `app/src/export.js` | PNG export (one size / all sizes) |
| `app/src/ui.js` | The editor: controls, drag-to-pan, undo/redo |
| `app/src/shots.js` | Deterministic staging (`?shot=…&seed=1`) |
| `app/src/main.js` | Entry point: fonts, samples, editor, shot |
| `app/samples/` | Two model-made sample photos (kit's, free to use) |
| `app/vendor/` | Anton, Bebas Neue and Pacifico (SIL OFL) |
| `screenshots/` | 4 screenshots of the app and its covers |
| `shots.json` | The screenshot staging queries |

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Dibuat untuk [make.fun](https://make.fun) — daftar lewat [tautan referral saya](https://make.fun/r/00sgd8yt).
