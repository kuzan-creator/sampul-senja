# Sampul Senja

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/kuzan-creator/sampul-senja/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard)
[![reward](https://make.fun/badge/gta6-cover-art-01/kuzan-creator/sampul-senja/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

**Sampul Senja** adalah aplikasi web offline yang mengubah foto dan caption
menjadi cover art gaya poster film GTA 6: bingkai poster, role tag di tiap
panel, judul krom bergaris, pita tagline, dan segel emas. Dibuat untuk
bounty [make.fun "Make GTA 6 Cover Art"](https://make.fun/bounty/gta6-cover-art-01).

## Yang bisa dilakukan

- **Bingkai poster** — bar atas (★★★★★ + kutipan yang bisa diedit + "VOL. 1")
  dan bar bawah ("COMING SOON" + kredit yang bisa diedit + barcode dekoratif).
  Bisa di-toggle, default menyala.
- **Role tag di tiap panel** — tag hitam dengan slash kuning dan teks yang
  bisa diedit (default: THE DRIVER, THE BOSS, THE BRAINS, THE GETAWAY,
  THE LOOKOUT, THE FIXER, THE CAPTAIN, THE RIDER, THE MECHANIC, THE HIDEOUT).
- **Judul krom** — huruf besar dengan garis-garis krom horizontal
  (emas/oranye/pink) dan outline 3D; atau gaya "Gradasi". Judul memakai
  Anton, subjudul memakai Pacifico script dengan neon glow.
- **Pita tagline + segel emas** — pita berwarna di bawah subjudul dengan
  tagline yang bisa diedit, dan segel emas melingkar dengan bintang + teks
  yang bisa diedit.
- **Crop wajah (face-aware)** — memakai FaceDetector browser bila tersedia
  untuk membingkai wajah di tiap panel; fallback ke bias sepertiga atas.
  Panel terpilih bisa digeser (drag) dan di-zoom.
- **7 layout** — Empat Panel, Hero + Tiga, Dua Panel, Satu Foto,
  Sembilan Panel, Miring, dan Poster (hero close-up besar + 4 panel kecil).
- **8 grade warna** — Senja, Neon, Senja Ungu, Emas Palem, Pantai Biru,
  Noir, Krom Perak, dan Magenta.
- **Export PNG 4 ukuran** — 1080×1080, 1080×1350, 1920×1080, dan story
  1080×1920, plus tombol "Export semua ukuran".
- **Undo/redo** (Ctrl+Z / Ctrl+Y), upload foto (dibaca lokal saja, tidak
  pernah diunggah), dan 2 foto contoh.

## Cara memakai

1. Jalankan `node serve.ts`, lalu buka http://localhost:8080.
2. Unggah fotomu (atau pakai foto contoh), pilih layout, grade, dan ukuran.
3. Edit judul, subjudul, kutipan, tagline, kredit, dan role tag sesukamu.
4. Klik panel untuk memilihnya; seret untuk menggeser foto, geser slider
   untuk zoom.
5. Export sebagai PNG — satu ukuran, atau semua ukuran sekaligus.

## Offline & orisinal

Aplikasi ini 100% statis dan offline: tidak ada network request, semua
script, font, dan gambar adalah file di dalam `app/`. Font Anton, Bebas
Neue, dan Pacifico berlisensi SIL Open Font License (lihat
`app/vendor/*-OFL.txt`). Tidak ada aset Rockstar Games di sini — semua
nama, judul, dan desain dibuat sendiri.

Dibuat untuk [make.fun](https://make.fun) — daftar lewat
[tautan referral saya](https://make.fun/r/00sgd8yt).
