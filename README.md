# mdown-dropper

Chrome Extension untuk browse, preview, dan drag-drop file markdown dari repo [ai-builders-id/mdown-collection](https://github.com/ai-builders-id/mdown-collection) ke halaman web manapun.

![mdown-dropper](https://img.shields.io/badge/version-2.0.0-blue) ![manifest](https://img.shields.io/badge/manifest-v3-green) ![license](https://img.shields.io/badge/license-MIT-orange)

## Fitur

- 📋 **List semua file** — dikelompokkan per folder (Root, Standards, Minimal), dengan deskripsi singkat tiap file
- 🔍 **Search** — filter file secara real-time
- 👁 **Preview** — render markdown langsung di popup (Rendered / Raw)
- 🏷 **Variable Editor** — deteksi otomatis `{{VARIABLE}}` dari isi file, klik untuk isi nilainya
- ⬇ **Insert ke Web** — insert konten (dengan variabel yang sudah diisi) ke field yang aktif di halaman
- ⠿ **Drag & Drop** — drag item dari list ke textarea/input/contenteditable di halaman manapun
- 📋 **Copy** — copy konten ke clipboard
- ↻ **Refresh** — update list dari GitHub (cache 10 menit)

## Cara Install

1. Download atau clone repo ini
2. Buka Chrome → `chrome://extensions`
3. Aktifkan **Developer mode** (toggle kanan atas)
4. Klik **"Load unpacked"** → pilih folder `mdown-dropper`
5. Icon extension muncul di toolbar

## Cara Pakai

### Browse & Search
Klik icon extension → muncul list semua file dari repo. Ketik di search box untuk filter.

### Preview + Variable Editor
Klik tombol 👁 di sebelah file untuk membuka preview. Di bagian atas akan muncul chip berwarna untuk setiap `{{VARIABLE}}` yang ditemukan di file. Klik chip atau klik langsung text variable di preview untuk mengisi nilainya.

### Insert ke Halaman Web
1. Isi variable yang diperlukan di preview
2. Klik di textarea/input di halaman web yang ingin diisi
3. Kembali ke popup, klik **"⬇ Insert ke Web"** — konten langsung masuk ke field tersebut

### Drag & Drop
Dari list utama, drag item langsung ke textarea/input/contenteditable di halaman manapun. Konten file akan otomatis di-paste ke posisi kursor.

## Struktur File

```
mdown-dropper/
├── manifest.json      # Chrome Extension manifest v3
├── popup.html         # UI popup
├── popup.js           # Logic: fetch, render, preview, variable editor
├── content.js         # Injected ke semua halaman untuk handle drop
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## Tech Stack

- Vanilla JS (no build step, no dependencies)
- Chrome Extension Manifest V3
- GitHub Contents API + raw.githubusercontent.com
- `chrome.storage.local` untuk transfer konten saat drag

## Source Repo

File markdown diambil dari: [ai-builders-id/mdown-collection](https://github.com/ai-builders-id/mdown-collection)

---
MIT License
