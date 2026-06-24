# Roadmap Produk — blinker

> **Dokumen:** Roadmap Produk
> **Proyek:** blinker (sebelumnya mdown-dropper)
> **Versi Terkini:** 2.0.0
> **Tanggal:** 2026-06-24
> **Status:** Aktif
> **Penulis:** Cloud Dark

---

## Daftar Isi

1. [Visi Produk](#1-visi-produk)
2. [Fase Perjalanan Produk](#2-fase-perjalanan-produk)
   - [Phase 1: Foundation (v2.0.0)](#phase-1-foundation-v200)
   - [Phase 2: Enhanced UX (Q3 2026)](#phase-2-enhanced-ux-q3-2026)
   - [Phase 3: Collaboration (Q4 2026)](#phase-3-collaboration-q4-2026)
   - [Phase 4: Enterprise (Q1 2027)](#phase-4-enterprise-q1-2027)
   - [Phase 5: Platform (Q2 2027)](#phase-5-platform-q2-2027)
3. [Long-term Vision](#3-long-term-vision)
4. [Priority Matrix](#4-priority-matrix)
5. [Timeline Visual](#5-timeline-visual)
6. [Glosarium Fase](#6-glosarium-fase)

---

## 1. Visi Produk

**blinker** bercita-cita menjadi ekstensi *default* bagi praktisi AI, product manager, dan pengembang untuk mengakses, mengelola, dan menyisipkan konten prompt dan template — cepat, tanpa gesekan, dan langsung dari bilah alat peramban.

Perjalanan produk ini dibagi menjadi lima fase utama, masing-masing dengan tema yang jelas:

```
Foundation → Enhanced UX → Collaboration → Enterprise → Platform
   v2.0.0       Q3 2026       Q4 2026       Q1 2027       Q2 2027
```

Setiap fase dibangun di atas fondasi fase sebelumnya, dengan pengguna sebagai pusat dari setiap keputusan.

---

## 2. Fase Perjalanan Produk

---

### Phase 1: Foundation (v2.0.0)

**Status: ✅ Selesai**

Fase pertama adalah fondasi keseluruhan produk. Di fase ini, blinker (saat itu bernama mdown-dropper) dibangun sebagai ekstensi Chrome Manifest V3 yang stabil dengan fitur-fitur inti.

#### Tema: "Membangun fondasi yang kokoh"

Fase ini tidak mengejar banyak fitur, tetapi memastikan bahwa setiap fitur yang ada bekerja dengan sempurna, dapat diandalkan, dan memberikan pengalaman pengguna yang menyenangkan.

#### Fitur yang Dirilis

| Fitur | Status | Prioritas | Deskripsi |
|-------|--------|-----------|-----------|
| Dual-repo browsing dengan tab | ✅ Selesai | P0 | Menampilkan daftar file dari repositori PRD Prompt dan Prompt Collection melalui tab terpisah |
| Real-time search dengan alias expansion | ✅ Selesai | P0 | Filter file secara real-time dengan dukungan alias (`cs` → `customer support`, dll.) |
| Markdown preview (Rendered + Raw) | ✅ Selesai | P0 | Preview file markdown dalam mode rendered (HTML) dan raw (kode sumber) |
| Variable detection dan editor | ✅ Selesai | P0 | Deteksi otomatis `{{VARIABLE}}` dengan chip warna-warni dan modal editor |
| Drag & drop ke halaman web | ✅ Selesai | P0 | Drag file dari daftar ke textarea/input/contenteditable di halaman web |
| Copy to clipboard | ✅ Selesai | P0 | Salin konten (dengan variabel terisi) ke clipboard dengan satu klik |
| Insert ke active element | ✅ Selesai | P0 | Sisipkan konten ke elemen aktif di halaman web langsung dari popup |
| Cache system (10 menit TTL) | ✅ Selesai | P0 | Cache daftar file di localStorage untuk mengurangi panggilan API GitHub |
| Prefetch konten saat hover | ✅ Selesai | P1 | Ambil konten file secara proaktif saat hover agar drag terasa instan |
| Content script drop handler + overlay | ✅ Selesai | P0 | Overlay visual saat drag di atas target yang valid |
| Dark theme (Nocturnal Luxe) | ✅ Selesai | P0 | Tema gelap premium dengan palet warna yang konsisten |
| Toast notification system | ✅ Selesai | P1 | Notifikasi kecil untuk feedback aksi pengguna |
| Grouping file per folder | ✅ Selesai | P0 | File dikelompokkan berdasarkan direktori dengan section label |
| Loading, error, dan empty state | ✅ Selesai | P1 | State handling untuk semua skenario: loading, error, dan tidak ada hasil |
| Similarity search | ✅ Selesai | P1 | Pencarian dengan fuzzy matching dan scoring |
| Reorder tabs (PRD jadi default) | ✅ Selesai | P1 | Tab PRD sebagai tab default yang aktif saat popup dibuka |
| Rebrand mdown-dropper → blinker | ✅ Selesai | P0 | Perubahan nama, logo, dan identitas visual |

#### Dokumen yang Dihasilkan

- ✅ **PRD** — Product Requirements Document
- ✅ **FRD** — Functional Requirements Document
- ✅ **Architecture Document** — Arsitektur sistem dan diagram aliran data
- ✅ **Design System** — Design tokens, komponen, dan pola interaksi
- ✅ **Project Charter** — Visi, misi, dan prinsip produk
- ✅ **Roadmap** — Dokumen ini
- ✅ **User Guide** — Panduan penggunaan
- ✅ **Contributing Guide** — Panduan kontribusi
- ✅ **Security Model** — Model keamanan ekstensi
- ✅ **Deployment Guide** — Panduan rilis dan deployment
- ✅ **API Documentation** — Dokumentasi API internal dan eksternal
- ✅ **Database & Storage** — Dokumentasi penyimpanan data

#### Metrik Keberhasilan Phase 1

| Metrik | Target | Realisasi |
|--------|--------|-----------|
| Waktu muat daftar file (cache) | < 3 detik | ✅ ~1.5 detik |
| Waktu muat daftar file (fresh) | < 8 detik | ✅ ~4 detik |
| Waktu preview | < 2 detik | ✅ ~800 ms |
| Responsivitas pencarian | < 100 ms | ✅ ~30 ms |
| Cache hit rate | > 80% | 📊 Perlu diukur |
| Error rate API | < 5% | ✅ ~1-2% |
| Ukuran popup | 400x600 px | ✅ Tetap |
| Penggunaan memori | < 50 MB | ✅ ~20 MB |

---

### Phase 2: Enhanced UX (Q3 2026)

**Perkiraan Rilis:** v2.1.0 – v2.3.0
**Target Waktu:** Juli – September 2026
**Status:** 📋 Direncanakan

#### Tema: "Pengalaman yang lebih personal dan efisien"

Fase ini berfokus pada peningkatan pengalaman pengguna sehari-hari. Fitur-fitur yang membuat pengguna merasa "blinker paham saya" — riwayat, favorit, dan kustomisasi.

#### Fitur

##### 2.1 Search History (P1 — 1 minggu)

| Aspek | Detail |
|-------|--------|
| **Masalah** | Pengguna sering mencari file yang sama berulang kali, harus mengetik query yang sama |
| **Solusi** | Simpan 20 pencarian terakhir di `chrome.storage.sync`, tampilkan sebagai dropdown di search input |
| **Perilaku** | Saat search input di-focus, tampilkan riwayat pencarian. Klik item untuk mengisi query. Hapus dengan ikon ✕ |
| **Penyimpanan** | `chrome.storage.sync` dengan key `searchHistory`, maksimal 20 entri, deduplikasi otomatis |
| **Privasi** | Riwayat hanya disimpan secara lokal, tidak dikirim ke server manapun |
| **Dependencies** | Options page (untuk toggle fitur ini) |
| **UX** | Animasi fade-in dropdown, keyboard navigation (Arrow Up/Down, Enter, Escape) |

##### 2.2 Favorites & Pin (P1 — 1 minggu)

| Aspek | Detail |
|-------|--------|
| **Masalah** | Pengguna memiliki file favorit yang sering dipakai, harus mencari setiap kali |
| **Solusi** | Tambahkan tombol bintang (☆) di setiap file item. File yang di-favoritkan muncul di tab/section "Favorites" |
| **Penyimpanan** | `chrome.storage.sync` dengan key `favorites`, berisi array `{ repoKey, path, addedAt }` |
| **Sinkronisasi** | Tersinkronisasi antar perangkat Chrome via `chrome.storage.sync` (kapasitas 100KB, cukup untuk ~500 favorit) |
| **Tampilan** | Section "⭐ Favorites" muncul di paling atas daftar file. Bintang terisi (★) untuk file yang sudah difavoritkan |
| **Interaksi** | Klik bintang → toggle favorit. Hapus favorit dari section Favorites. Animasi bintang terisi |
| **Prioritas** | P1 — fitur yang paling banyak diminta oleh persona (Rina, Andi) |

##### 2.3 Batch Insert (P1 — 2 minggu)

| Aspek | Detail |
|-------|--------|
| **Masalah** | Pengguna ingin memasukkan beberapa file prompt sekaligus ke dalam satu percakapan/template |
| **Solusi** | Tambahkan mode "multi-pilih" dengan checkbox di setiap file item. Kumpulkan konten dari file yang dipilih, gabungkan dengan separator `---\n`, lalu insert/copy sebagai satu blok |
| **Trigger** | Tombol "⛭ Multi" di footer atau toggle mode seleksi dari icon button |
| **UX Mode** | Saat mode multi aktif: setiap file item mendapat checkbox. Footer berubah: "0 selected" → "Insert N files" / "Copy N files" |
| **Separator** | Default: `\n\n---\n\n`. Bisa dikustomisasi di pengaturan |
| **Variable Handling** | Variabel dari multi-file digabung. Jika ada variabel yang sama (misal `{{PROJECT_NAME}}` di dua file), nilai yang diisi akan dipakai untuk semua file |
| **Batas Maksimal** | 10 file per batch untuk menghindari konten terlalu panjang |
| **Dependencies** | Favorites (untuk quick-select file favorit) |

##### 2.4 Popup Resizable (P1 — 1 minggu)

| Aspek | Detail |
|-------|--------|
| **Masalah** | Popup 400x600 px terasa sempit untuk preview file panjang |
| **Solusi** | Jadikan popup resizable dengan menyimpan ukuran kustom di `chrome.storage.sync`. Tambahkan drag handle di pojok kanan bawah |
| **Batas Minimum** | 360x400 px (terlalu kecil akan mengorbankan usability) |
| **Batas Maksimum** | 800x900 px (Chrome membatasi ukuran maksimum popup ekstensi) |
| **Default** | 400x600 px (kompatibel dengan semua layout) |
| **Persistensi** | Ukuran popup disimpan perangkat via `chrome.storage.sync` |
| **Teknis** | Gunakan `window.resizeTo()` atau CSS `resize: both` dengan `overflow: auto` |
| **Edge Case** | Pastikan modal, toast, dan overlay tetap berada di dalam popup setelah resize |

##### 2.5 Recent Files (P2 — 3 hari)

| Aspek | Detail |
|-------|--------|
| **Masalah** | Pengguna sering membuka file yang sama berulang kali dalam satu sesi |
| **Solusi** | Tampilkan 5 file terakhir yang di-preview di bagian atas daftar, di bawah Favorites |
| **Penyimpanan** | In-memory selama sesi popup terbuka, opsional persist ke `chrome.storage.session` |
| **Tampilan** | Section "🕐 Recent" dengan 5 file terakhir, diurutkan dari yang terbaru |
| **Prioritas** | P2 — fitur yang berguna tetapi bisa ditunda jika Favorites sudah mencakup kebutuhan ini |

##### 2.6 Options Page (P2 — 1 minggu)

| Aspek | Detail |
|-------|--------|
| **Masalah** | Belum ada halaman pengaturan terpusat. Pengguna tidak bisa mengonfigurasi perilaku ekstensi |
| **Solusi** | Buat halaman `options.html` yang bisa diakses dari `chrome://extensions` atau klik kanan ikon ekstensi |
| **Halaman Pengaturan** | Daftar konfigurasi yang bisa diubah pengguna |
| **Konfigurasi** | |
| | ⚙ **Umum** — Bahasa (Indonesia/English), Tema (Dark/Light/System) |
| | 🔍 **Pencarian** — Aktifkan search history (on/off), Aktifkan alias expansion (on/off), Custom alias (tambah/hapus) |
| | ⭐ **Favorites** — Tampilkan section favorites di atas (on/off), Batas maksimal favorit |
| | 📋 **Insert** — Default separator untuk batch insert, Size limit peringatan |
| | 🎨 **Tampilan** — Ukuran popup default, Font size scale |
| | 🔒 **Privasi** — Hapus semua data lokal, Nonaktifkan telemetri |
| **Dependencies** | Search history, Favorites, Batch insert, Popup resizable |

##### 2.7 Keyboard Shortcut (P2 — 3 hari)

| Aspek | Detail |
|-------|--------|
| **Masalah** | Pengguna power ingin navigasi cepat tanpa mouse |
| **Solusi** | Tambahkan keyboard shortcut untuk aksi-aksi umum di dalam popup |
| **Shortcut** | |
| | `Ctrl+F` / `Cmd+F` — Focus ke search input |
| | `Ctrl+Shift+F` — Focus ke search input dan pilih semua teks |
| | `Escape` — Tutup modal / Back ke list dari preview |
| | `Ctrl+Enter` — Insert ke web (dari preview) |
| | `Ctrl+C` — Copy konten (dari preview) |
| | `Alt+1` — Pilih tab PRD |
| | `Alt+2` — Pilih tab Prompt Collection |
| | `Arrow Up/Down` — Navigasi file list (future) |
| **Catatan** | Shortcut global untuk membuka popup (`Ctrl+Shift+B`) memerlukan deklarasi di `manifest.json` menggunakan `commands` API, yang mana untuk action popup tidak bisa di-binding — hanya bisa untuk membuka popup atau menjalankan aksi |

##### 2.8 Custom Search Aliases (P2 — 3 hari)

| Aspek | Detail |
|-------|--------|
| **Masalah** | Alias bawaan (`cs`, `prd`, `qa`, `api`) tidak mencakup terminologi tim atau domain spesifik |
| **Solusi** | Izinkan pengguna menambah, mengedit, dan menghapus alias sendiri dari Options Page |
| **Penyimpanan** | `chrome.storage.sync` dengan key `customAliases`, format `{ "alias": "expansion" }` |
| **Prioritas** | P2 — berguna tetapi pengguna bisa menggunakan pencarian biasa sebagai alternatif |
| **Dependencies** | Options page |

##### 2.9 Improved Markdown Renderer (P2 — 1 minggu)

| Aspek | Detail |
|-------|--------|
| **Masalah** | Parser markdown saat ini regex-based, tidak mendukung nested list, gambar, dan syntax highlighting |
| **Solusi** | Tingkatkan parser untuk mendukung: nested list (ul/ol bersarang), gambar `![alt](url)`, task list `- [x]`, strikethrough `~~text~~`, dan syntax highlighting untuk code block |
| **Syntax Highlighting** | Implementasi sederhana tanpa library: warna dasar untuk beberapa bahasa (javascript, python, json, bash, sql, yaml) menggunakan regex pattern matching |
| **Dampak** | Ukuran popup + inline CSS untuk highlight (estimasi +5KB dari ukuran saat ini) |
| **Alternatif** | Jika bundle size menjadi masalah, pertimbangkan library ringan seperti `highlight.js` tanpa bahasa yang tidak diperlukan (tree-shaking) |

#### Ringkasan Phase 2

| Fitur | Prioritas | Estimasi | Dependencies |
|-------|-----------|----------|-------------|
| Search History | P1 | 1 minggu | Options page (untuk toggle) |
| Favorites & Pin | P1 | 1 minggu | — |
| Batch Insert | P1 | 2 minggu | Favorites (optional) |
| Popup Resizable | P1 | 1 minggu | — |
| Recent Files | P2 | 3 hari | — |
| Options Page | P2 | 1 minggu | Search history, Favorites, Aliases |
| Keyboard Shortcut | P2 | 3 hari | — |
| Custom Search Aliases | P2 | 3 hari | Options page |
| Improved Markdown Renderer | P2 | 1 minggu | — |

**Total Estimasi:** ~8 minggu (dikerjakan paralel)

---

### Phase 3: Collaboration (Q4 2026)

**Perkiraan Rilis:** v2.4.0 – v2.6.0
**Target Waktu:** Oktober – Desember 2026
**Status:** 📋 Direncanakan

#### Tema: "Berkolaborasi dan berbagi"

Fase ini membawa blinker dari alat personal menjadi alat tim. Pengguna dapat berbagi preset, mengelola koleksi tim, dan mendapatkan wawasan dari data penggunaan.

#### Fitur

##### 3.1 Share Presets (P1 — 3 minggu)

| Aspek | Detail |
|-------|--------|
| **Masalah** | Tim ingin berbagi konfigurasi prompt dan template yang sudah dikustomisasi |
| **Solusi** | Buat format preset JSON yang bisa diekspor dan diimpor. Preset berisi: daftar file favorit, alias kustom, nilai default variabel, dan pengaturan popup |
| **Ekspor** | Tombol "Export Preset" di Options Page → unduh file `.blinker-preset.json` |
| **Impor** | Tombol "Import Preset" → upload file → validasi → terapkan |
| **Format Preset** | `{ version, exportedAt, favorites, customAliases, defaultVarValues, settings }` |
| **Berbagi** | File preset bisa dibagikan melalui Slack, email, atau disimpan di repositori tim |
| **Keamanan** | Preset tidak mengandung informasi sensitif — hanya konfigurasi. Variabel default yang berisi API key ditandai sebagai `sensitive: true` dan tidak diekspor |
| **Validasi** | Validasi struktur JSON, versi kompatibilitas, ukuran maksimal 50KB |

##### 3.2 Team Collections (P1 — 3 minggu)

| Aspek | Detail |
|-------|--------|
| **Masalah** | Tim ingin mengelola koleksi prompt bersama yang bisa diakses oleh seluruh anggota tim |
| **Solusi** | Tambahkan dukungan untuk repositori GitHub tim sebagai sumber koleksi ketiga. Tim dapat mengelola file markdown di repo GitHub mereka, dan blinker akan menampilkannya |
| **Konfigurasi** | Tab ketiga "🏢 Team" yang dikonfigurasi dari Options Page dengan: owner, repo, branch, token (opsional untuk repo privat) |
| **Repositori Privat** | Dukungan awal untuk repositori privat menggunakan GitHub Personal Access Token (PAT) yang disimpan di `chrome.storage.local` |
| **Keamanan Token** | Token disimpan di `chrome.storage.local` (tidak tersinkronisasi). Tidak ada log atau ekspor yang mengandung token |
| **Persetujuan Minimum** | Token hanya butuh akses `Contents: Read` — tidak perlu akses write |
| **Peringatan** | Label "🔒 Private repo" pada tab jika token dikonfigurasi |
| **Tampilan** | Sama seperti tab PRD dan Prompt Collection — daftar file, search, preview, dan semua fitur yang ada |
| **Default Value** | Kosong — tidak ada konfigurasi default untuk team collection |

##### 3.3 Usage Analytics (P2 — 2 minggu)

| Aspek | Detail |
|-------|--------|
| **Masalah** | Pengguna tidak tahu seberapa produktif mereka dengan blinker. Tidak ada wawasan tentang pola penggunaan |
| **Solusi** | Dashboard statistik penggunaan di Options Page. Data dikumpulkan secara lokal dan opsional dapat dikirim ke telemetri anonim |
| **Metrik Lokal** | Total file di-preview, Total file di-copy, Total file di-insert, Total drag & drop, File terpopuler (top 10), Waktu rata-rata per sesi, Rata-rata variabel diisi per file |
| **Visualisasi** | Bar chart sederhana (CSS-only atau SVG) untuk 7 hari terakhir, pie chart untuk distribusi repo, leaderboard file terpopuler |
| **Penyimpanan** | `chrome.storage.local` dengan key `analytics`, data dipertahankan maksimal 90 hari, rotasi otomatis |
| **Privasi** | Opsi "Opt-out" di pengaturan. Data anonim yang dikirim (opsional): hanya event counts, tanpa path file atau konten |
| **Reset** | Tombol "Hapus Data Analitik" di Options Page |

##### 3.4 Share Snippet (P2 — 1 minggu)

| Aspek | Detail |
|-------|--------|
| **Masalah** | Pengguna ingin membagikan cuplikan prompt yang sudah diisi variabelnya ke rekan tim |
| **Solusi** | Fitur "Share" di preview: generate URL dengan konten yang sudah diisi. URL mengandung konten yang di-encode (base64) |
| **Peringatan Privasi** | URL mengandung konten prompt — pengguna diperingatkan untuk tidak membagikan informasi sensitif |
| **Format** | `blinker://share?content={base64}&vars={json}` — atau fallback ke URL teks biasa |
| **Prioritas** | P2 — fitur ini membutuhkan pertimbangan privasi dan UX yang matang |

##### 3.5 Comments & Annotations (P3 — 2 minggu)

| Aspek | Detail |
|-------|--------|
| **Masalah** | Pengguna ingin meninggalkan catatan atau anotasi pada file prompt untuk referensi tim |
| **Solusi** | Tambahkan field "notes" di setiap file. Catatan disimpan di `chrome.storage.sync` dan terkait dengan path file |
| **Tampilan** | Ikon 💬 di file item jika ada catatan. Preview menampilkan catatan di bagian atas. Editor catatan sederhana (textarea) |
| **Prioritas** | P3 — fitur lanjutan setelah Favorites dan Collections stabil |

#### Ringkasan Phase 3

| Fitur | Prioritas | Estimasi | Dependencies |
|-------|-----------|----------|-------------|
| Share Presets | P1 | 3 minggu | Options Page (v2.6) |
| Team Collections | P1 | 3 minggu | GitHub API, Options Page |
| Usage Analytics | P2 | 2 minggu | Options Page |
| Share Snippet | P2 | 1 minggu | Preview system |
| Comments & Annotations | P3 | 2 minggu | Storage sync, Favorites |

**Total Estimasi:** ~10 minggu (dikerjakan paralel)

---

### Phase 4: Enterprise (Q1 2027)

**Perkiraan Rilis:** v2.7.0 – v2.9.0
**Target Waktu:** Januari – Maret 2027
**Status:** 📋 Direncanakan

#### Tema: "Kuat, aman, dan terkustomisasi"

Fase ini menyasar kebutuhan pengguna enterprise dan power user: repositori kustom, dukungan self-hosted, tema, dan keamanan API.

#### Fitur

##### 4.1 Custom Repo UI (P1 — 3 minggu)

| Aspek | Detail |
|-------|--------|
| **Masalah** | Pengguna ingin menambahkan repositori GitHub mereka sendiri, tidak hanya dua repo bawaan |
| **Solusi** | UI manajemen repositori di Options Page. Pengguna bisa: tambah repo (owner, repo, branch), edit repo yang sudah ada, hapus repo, atur urutan tab, aktifkan/nonaktifkan repo |
| **Kapasitas** | Maksimal 10 repositori kustom (termasuk 2 bawaan) |
| **Filter Tipe File** | Per repo: pilih tipe file yang ditampilkan (.md, .json, .txt, .yaml) — default .md |
| **Tab Repo** | Setiap repo mendapat tab sendiri. Tab bisa diurutkan dengan drag-and-drop di halaman pengaturan |
| **Konfigurasi Lanjutan** | Path filter (hanya tampilkan file dari path tertentu), Regex filter untuk nama file, Ukuran file maksimal |
| **Peringatan Performa** | Semakin banyak repo, semakin lambat initial load. Cache per repo. Rekomendasi: maksimal 5 repo aktif |

##### 4.2 Self-Hosted Mode (P1 — 4 minggu)

| Aspek | Detail |
|-------|--------|
| **Masalah** | Tim enterprise ingin hosting konten mereka sendiri tanpa bergantung pada GitHub |
| **Solusi** | Mode "Self-Hosted" di mana blinker bisa mengambil daftar file dan konten dari server internal (GitLab, Gitea, atau web server statis) |
| **Konfigurasi** | URL API endpoint, format response yang diharapkan, header autentikasi (Basic Auth, Bearer Token, API Key) |
| **Format API** | Dokumentasi API untuk self-hosted: endpoint daftar file, endpoint konten, endpoint search |
| **Dukungan** | |
| | **GitLab** — Dukungan penuh: GitLab API v4, project ID, token akses |
| | **Gitea** — Dukungan penuh: Gitea API v1, token |
| | **Web Server Statis** — Dukungan dasar: `file-list.json` + folder konten |
| **Keamanan** | Token autentikasi disimpan di `chrome.storage.local`. Tidak ada data yang dikirim ke server pihak ketiga |
| **Sertifikat** | Peringatan untuk self-signed certificate (perlu konfigurasi manual di Chrome) |

##### 4.3 Theme System (P2 — 2 minggu)

| Aspek | Detail |
|-------|--------|
| **Masalah** | Pengguna ingin kustomisasi tampilan, tidak terbatas pada dark theme default |
| **Solusi** | Sistem tema dengan CSS custom properties. Tema bawaan: Nocturnal Luxe (default), Light (terang), Sepia (nyaman dibaca), dan Monokai (developer). Pengguna bisa membuat tema kustom |
| **Architecture** | Semua warna diganti dengan CSS custom properties. Tema adalah sekumpulan nilai `--*` yang di-load saat popup dibuka |
| **Theme Store** (future) | Di fase enterprise ini, tema disimpan lokal. Marketplace tema untuk Phase 5 atau long-term |
| **Kustom** | Editor tema di Options Page: color picker untuk setiap token, preview real-time dari perubahan |
| **Persistensi** | Tema aktif disimpan di `chrome.storage.sync` — tersinkronisasi antar perangkat |
| **Dampak Teknis** | Perlu refactor CSS untuk memisahkan nilai warna ke CSS custom properties. Estimasi refactor: 1 dari 2 minggu |

##### 4.4 API Keys Management (P2 — 1 minggu)

| Aspek | Detail |
|-------|--------|
| **Masalah** | Pengguna ingin menggunakan blinker dengan LLM API keys untuk mengirim prompt langsung |
| **Solusi** | Panel manajemen API Keys di Options Page. Pengguna bisa menyimpan API key untuk berbagai provider |
| **Provider** | |
| | **Anthropic (Claude)** — API key untuk mengirim prompt ke Claude |
| | **OpenAI (ChatGPT)** — API key untuk mengirim prompt ke ChatGPT |
| | **Google (Gemini)** — API key untuk Gemini |
| | **OpenRouter** — API key untuk akses multi-model |
| **Keamanan** | API key disimpan di `chrome.storage.local` (tidak sinkron). Key ditampilkan masked (********). Tidak ada log atau ekspor yang mengandung key |
| **Penggunaan** | (Long-term) Tombol "Kirim ke Claude/ChatGPT" di preview footer. Di fase Enterprise: hanya penyimpanan key, integrasi pengiriman di fase long-term |

##### 4.5 Variable Default Values (P2 — 3 hari)

| Aspek | Detail |
|-------|--------|
| **Masalah** | Pengguna sering mengisi variabel yang sama berulang kali (`{{PROJECT_NAME}}`, `{{COMPANY_NAME}}`) |
| **Solusi** | Simpan nilai default untuk variabel tertentu. Jika file mengandung variabel yang memiliki default, nilai default otomatis terisi |
| **Penyimpanan** | `chrome.storage.sync` dengan key `defaultVarValues`, format `{ "VARIABLE_NAME": "default value" }` |
| **Pengaturan** | Dikelola dari Options Page. Tabel: nama variabel, nilai default, tombol hapus. Tombol "Tambah" untuk variabel baru |
| **Prioritas** | P2 — tetapi sangat dihargai oleh persona Product Manager (Dimas) |

##### 4.6 Audit Log (P3 — 2 minggu)

| Aspek | Detail |
|-------|--------|
| **Masalah** | Pengguna enterprise perlu audit trail — siapa menggunakan prompt apa dan kapan |
| **Solusi** | Catat log penggunaan di `chrome.storage.local`: timestamp, file path, aksi (preview/copy/insert/drag), jumlah variabel diisi |
| **Ekspor Log** | Tombol "Export Log" → CSV file dengan kolom: timestamp, action, file, repo, varsFilled |
| **Retensi** | 30 hari. Log dirotasi otomatis (hapus yang terlama saat mencapai 500 entri) |
| **Privasi** | Log tidak mengandung konten file atau nilai variabel — hanya metadata. Opsi untuk menonaktifkan logging |
| **Prioritas** | P3 — fitur niche untuk kebutuhan compliance |

#### Ringkasan Phase 4

| Fitur | Prioritas | Estimasi | Dependencies |
|-------|-----------|----------|-------------|
| Custom Repo UI | P1 | 3 minggu | Options Page, Team Collections |
| Self-Hosted Mode | P1 | 4 minggu | Custom Repo UI, API documentation |
| Theme System | P2 | 2 minggu | Refactor CSS |
| API Keys Management | P2 | 1 minggu | Options Page |
| Variable Default Values | P2 | 3 hari | Options Page, Variable Editor |
| Audit Log | P3 | 2 minggu | Usage Analytics |

**Total Estimasi:** ~12 minggu (dikerjakan paralel)

---

### Phase 5: Platform (Q2 2027)

**Perkiraan Rilis:** v3.0.0
**Target Waktu:** April – Juni 2027
**Status:** 📋 Direncanakan

#### Tema: "Menjangkau lebih banyak platform"

Fase ini membawa blinker keluar dari ekosistem Chrome. Firefox, Safari, Edge, VS Code, dan CLI — sehingga pengguna bisa mengakses prompt dari mana pun.

#### Fitur

##### 5.1 Firefox Extension (P1 — 4 minggu)

| Aspek | Detail |
|-------|--------|
| **Tujuan** | Port blinker ke Firefox (Manifest V3 — Firefox mendukung MV3 sejak versi 109) |
| **Perubahan** | |
| | `manifest.json` → `manifest.json` dengan format Firefox (browser_specific_settings) |
| | `chrome.storage` → `browser.storage` (Firefox menggunakan Promise-based API) |
| | `chrome.scripting` → `browser.scripting` (sama, API sudah terstandardisasi) |
| | "action" untuk popup sudah didukung Firefox MV3 |
| **Pengujian** | Firefox Developer Edition untuk testing. Uji drag-and-drop (Firefox memiliki security restrictions lebih ketat untuk dataTransfer) |
| **Add-on Store** | Publikasi ke Firefox Add-ons (AMO — review process biasanya 1-2 minggu) |
| **Kode** | Buat branch `firefox-port` atau folder `firefox/` dengan manifest khusus. Kode inti (popup.js, content.js) bisa di-share dengan Chrome version |
| **Feature Parity** | Semua fitur dari Phase 1-4 harus tersedia di Firefox. Jika ada fitur yang menggunakan API khusus Chrome, sediakan fallback |

##### 5.2 Safari Extension (P1 — 4 minggu)

| Aspek | Detail |
|-------|--------|
| **Tujuan** | Port blinker ke Safari (macOS dan iOS) |
| **Perubahan** | |
| | Safari memerlukan `Safari web extension` dengan Xcode project dan `.app` wrapper |
| | API Chrome → Safari polyfill (`browser` namespace sudah didukung Safari 15+) |
| | `chrome.storage` → `browser.storage` (sama) |
| | **Batasan popup** — Safari tidak memiliki action popup di toolbar iOS. Perlu pendekatan berbeda (share sheet atau extension popup) |
| **Development** | Diperlukan Mac dengan Xcode. `xcrun safari-web-extension-converter` dapat membantu konversi awal |
| **App Store** | Publikasi melalui Mac App Store (developer account $99/tahun diperlukan) |
| **Batasan** | Drag-and-drop dari popup Safari ke halaman web mungkin memiliki UX yang berbeda. iOS Safari memiliki keterbatasan ekstensi yang signifikan |
| **Feature Set** | Safari version bisa dirilis dengan feature subset jika keterbatasan teknis menghalangi fitur tertentu |

##### 5.3 Edge Extension (P1 — 2 minggu)

| Aspek | Detail |
|-------|--------|
| **Tujuan** | Publikasi blinker ke Microsoft Edge Add-ons |
| **Perubahan** | Edge berbasis Chromium sehingga kompatibel dengan Chrome version. Hanya perlu menambahkan `browser_specific_settings` untuk Edge di manifest |
| **Pengujian** | Uji di Edge (Chromium) — seharusnya langsung berfungsi tanpa perubahan kode |
| **Add-on Store** | Publikasi ke Microsoft Edge Add-ons store (pendaftaran developer diperlukan) |
| **Feature Parity** | 100% — Edge adalah Chromium, semua API Chrome tersedia |

##### 5.4 VS Code Extension (P2 — 6 minggu)

| Aspek | Detail |
|-------|--------|
| **Tujuan** | Ekstensi VS Code untuk mengakses prompt langsung dari editor |
| **Arsitektur** | Ekstensi VS Code dengan Tree View di sidebar. Menampilkan file dari repositori yang sama |
| **Fitur** | |
| | Tree view repositori di VS Code sidebar |
| | Preview markdown di VS Code editor (built-in markdown preview) |
| | Insert prompt ke editor aktif (sama seperti "Insert ke Web" tetapi untuk VS Code) |
| | Variable detection dan editor sebagai WebView |
| **Perbedaan Platform** | Tidak ada popup — menggunakan WebView atau sidebar. Drag-and-drop tidak relevan di VS Code |
| **Teknologi** | VS Code Extension API (TypeScript), TreeDataProvider, WebView Panel |
| **Publikasi** | VS Code Marketplace |
| **Feature Set** | Minimum: browse, search, preview, insert ke editor. Variable editor di WebView. Favorites dan recent files sync dengan Chrome extension via GitHub atau lokal |

##### 5.5 CLI Tool (P2 — 4 minggu)

| Aspek | Detail |
|-------|--------|
| **Tujuan** | CLI (Command Line Interface) untuk akses prompt dari terminal |
| **Arsitektur** | Node.js script atau Go binary. Bisa diinstall via npm `npm install -g blinker-cli` atau sebagai binary |
| **Fitur** | |
| | `blinker list` — daftar semua file |
| | `blinker search <query>` — cari file |
| | `blinker preview <path>` — lihat preview markdown di terminal |
| | `blinker copy <path>` — copy konten ke clipboard (dengan variable substitution) |
| | `blinker config` — konfigurasi repositori dan API keys |
| **Output** | |
| | Terminal output: formatted table, markdown rendered sebagai text (menggunakan library seperti `marked` + terminal renderer) |
| | Pipe-friendly: `blinker copy "standards/code_review.md" | pbcopy` atau `blinker list --json | jq` |
| **Target Pengguna** | Developer yang bekerja di terminal, integrator CI/CD, pengguna yang ingin akses prompt tanpa GUI |
| **Dependencies** | Tidak ada — CLI adalah standalone tool. Bisa sync konfigurasi dengan Chrome extension via file JSON yang sama |

##### 5.6 Tab Sync (Multi-Platform) (P2 — 2 minggu)

| Aspek | Detail |
|-------|--------|
| **Masalah** | Favorites, alias, dan pengaturan tersimpan per platform dan tidak tersinkronisasi |
| **Solusi** | Fitur sync menggunakan GitHub Gist atau file JSON di repositori. Favorites, custom aliases, dan settings bisa dishare antar platform |
| **Mekanisme** | |
| | **GitHub Gist** — Simpan konfigurasi sebagai secret Gist. Autentikasi via GitHub Personal Access Token |
| | **File JSON** — Export/Import manual antar platform |
| **Prioritas** | P2 — berguna tetapi fitur manual export/import sudah ada sejak Phase 3 |

#### Ringkasan Phase 5

| Fitur | Prioritas | Estimasi | Dependencies |
|-------|-----------|----------|-------------|
| Firefox Extension | P1 | 4 minggu | Chrome extension codebase |
| Safari Extension | P1 | 4 minggu | Mac + Xcode |
| Edge Extension | P1 | 2 minggu | Chrome extension codebase |
| VS Code Extension | P2 | 6 minggu | Extension architecture |
| CLI Tool | P2 | 4 minggu | GitHub API, Node.js/Go |
| Tab Sync Multi-Platform | P2 | 2 minggu | Share Presets (Phase 3) |

**Total Estimasi:** ~20 minggu (dikerjakan paralel untuk browser, serial untuk VS Code + CLI)

---

## 3. Long-term Vision

Setelah Phase 5, blinker akan menjadi ekosistem multi-platform yang matang. Visi jangka panjang mencakup area-area berikut:

---

### 3.1 AI-Assisted Prompts

| Fitur | Deskripsi | Estimasi |
|-------|-----------|----------|
| **Smart Variable Suggestions** | AI menyarankan nilai variabel berdasarkan konteks halaman web yang sedang dibuka (judul halaman, URL, konten halaman). Contoh: `{{PROJECT_NAME}}` → terisi otomatis dari judul GitHub repo | Riset |
| **Prompt Composer** | UI untuk menyusun prompt dari beberapa blok/fragmen. Pengguna bisa memilih blok dari file yang berbeda, menggabungkannya, dan mengisi variabel secara terpusat | Riset |
| **Context-Aware Prompt** | Saat preview, AI memberikan saran prompt yang relevan berdasarkan konten halaman web yang sedang aktif (misal: halaman GitHub issue → saran "bug report" prompt) | Riset |
| **Auto-Fill Variables** | AI memprediksi nilai variabel berdasarkan history pengguna dan konteks. Pengguna cukup review dan approve, bukan isi manual | Riset |
| **Prompt Enhancement** | Tombol "Tingkatkan Prompt" → AI memberikan saran perbaikan pada prompt yang sedang dilihat | Riset |

**Catatan:** Fitur AI memerlukan integrasi dengan LLM API (OpenAI, Anthropic, dll.) yang membutuhkan API key dari pengguna atau langganan premium.

---

### 3.2 Version Control

| Fitur | Deskripsi | Prioritas |
|-------|-----------|-----------|
| **Prompt Version History** | Lihat riwayat perubahan prompt di repositori — siapa mengubah apa dan kapan (langsung dari GitHub commit history) | Sedang |
| **Local Snapshot** | Simpan snapshot prompt yang sudah diisi variabelnya. Bisa di-restore nanti. Berguna untuk eksperimen A/B testing prompt | Rendah |
| **Diff View** | Bandingkan dua file prompt atau dua versi dari file yang sama — side-by-side diff dari konten prompt | Rendah |
| **Branch Switching** | Ganti branch repositori dari popup. Berguna jika ada branch `develop` atau `experimental` dengan prompt yang belum stabil | Rendah |

---

### 3.3 Prompt Marketplace

| Fitur | Deskripsi | Prioritas |
|-------|-----------|-----------|
| **Community Templates** | Platform di mana pengguna bisa membagikan dan menemukan template prompt buatan komunitas | Sedang |
| **Rating & Review** | Sistem rating (bintang 1-5) dan review untuk setiap template | Rendah |
| **Trending Prompts** | Halaman trending — prompt yang paling banyak digunakan minggu ini | Rendah |
| **Kategori** | Taksonomi prompt: Coding, Writing, Marketing, Support, PRD, Technical, Creative, Research, dll. | Sedang |
| **Premium Templates** | Template berbayar dari kreator profesional. Integrasi pembayaran (Stripe/Paddle) | Sangat Rendah |

**Catatan:** Marketplace memerlukan infrastruktur backend, database, dan moderasi konten. Ini adalah inisiatif yang paling berat secara teknis dan operasional.

---

### 3.4 Integrations

| Integrasi | Deskripsi | Prioritas |
|-----------|-----------|-----------|
| **Claude AI (langsung)** | Tombol di preview footer untuk "Kirim ke Claude" — buka Claude.ai dengan prompt yang sudah diisi | Sedang |
| **ChatGPT (langsung)** | Tombol "Kirim ke ChatGPT" — buka chat.openai.com dengan prompt | Sedang |
| **Google Gemini** | Tombol "Kirim ke Gemini" | Rendah |
| **Notion** | Insert prompt langsung ke Notion page via Notion API | Rendah |
| **Linear/Jira** | Insert template ke deskripsi issue Linear atau Jira | Rendah |
| **Slack** | Kirim prompt ke Slack channel (via Slack API atau webhook) | Rendah |
| **Obsidian** | Simpan prompt ke vault Obsidian | Rendah |
| **Hugging Face** | Publikasikan prompt ke Hugging Face datasets | Sangat Rendah |

---

### 3.5 Advanced Developer Tools

| Fitur | Deskripsi | Prioritas |
|-------|-----------|-----------|
| **Webhook Triggers** | Pemicu berbasis webhook — ketika file di GitHub berubah, notifikasi muncul di popup | Rendah |
| **API untuk Developer** | REST API lokal untuk mengakses konten prompt dari aplikasi lain | Rendah |
| **Plugin System** | Arsitektur plugin untuk memperluas fungsionalitas blinker tanpa mengubah kode inti | Sangat Rendah |
| **Custom Hooks** | Hook yang bisa dieksekusi sebelum/sesudah insert (misal: transform konten, validasi, logging) | Sangat Rendah |

---

## 4. Priority Matrix

Matriks prioritas berdasarkan **Dampak ke Pengguna** (User Impact) dan **Kompleksitas Implementasi** (Implementation Complexity).

| Tinggi Dampak, Rendah Kompleksitas | Tinggi Dampak, Tinggi Kompleksitas |
|-------------------------------------|-------------------------------------|
| **--> SEGERA** | **--> INVESTASI** |
| Favorites & Pin (⭐) | Platform Expansion (Firefox, Safari, CLI) |
| Search History | Team Collections |
| Popup Resizable | Self-Hosted Mode |
| Recent Files | Custom Repo UI |
| Keyboard Shortcuts | AI-Assisted Prompts |
| Variable Default Values | VS Code Extension |
| Custom Search Aliases | |

| Rendah Dampak, Rendah Kompleksitas | Rendah Dampak, Tinggi Kompleksitas |
|-------------------------------------|-------------------------------------|
| **--> JIKA SEMPAT** | **--> EVALUASI ULANG** |
| Improved Markdown Renderer | Prompt Marketplace |
| Comments & Annotations | Plugin System |
| Audit Log | Premium Templates |
| Share Snippet | Komentar & Rating |
| Tab Sync | |

---

### 4.1 Urutan Prioritas (Diurutkan)

| Peringkat | Fitur | Fase | Dampak | Kompleksitas | Alasan |
|-----------|-------|------|--------|-------------|--------|
| 1 | Favorites & Pin | Phase 2 | Tinggi | Rendah | Paling banyak diminta, cepat diimplementasi |
| 2 | Search History | Phase 2 | Tinggi | Rendah | Dampak besar sehari-hari, implementasi mudah |
| 3 | Popup Resizable | Phase 2 | Tinggi | Rendah | Solusi keluhan ukuran popup |
| 4 | Batch Insert | Phase 2 | Tinggi | Sedang | Produktivitas power user |
| 5 | Custom Search Aliases | Phase 2 | Sedang | Rendah | Personalisasi, mudah |
| 6 | Options Page | Phase 2 | Sedang | Sedang | Enabler untuk banyak fitur selanjutnya |
| 7 | Share Presets | Phase 3 | Tinggi | Sedang | Kolaborasi tim, ekspor/impor |
| 8 | Team Collections | Phase 3 | Tinggi | Tinggi | Fitur tim yang kuat |
| 9 | Usage Analytics | Phase 3 | Sedang | Sedang | Wawasan untuk pengguna |
| 10 | Custom Repo UI | Phase 4 | Tinggi | Tinggi | Fleksibilitas maksimal |
| 11 | Self-Hosted Mode | Phase 4 | Tinggi | Tinggi | Enterprise-grade |
| 12 | Theme System | Phase 4 | Sedang | Sedang | Kustomisasi visual |
| 13 | API Keys Management | Phase 4 | Sedang | Rendah | Enabler AI features |
| 14 | Firefox Extension | Phase 5 | Tinggi | Sedang | Jangkauan pengguna lebih luas |
| 15 | Safari Extension | Phase 5 | Sedang | Tinggi | Pengguna Mac ecosystem |
| 16 | Edge Extension | Phase 5 | Sedang | Rendah | Sangat mudah, Chromium-based |
| 17 | VS Code Extension | Phase 5 | Tinggi | Tinggi | Developer workflow |
| 18 | CLI Tool | Phase 5 | Sedang | Sedang | Power user dan automation |

---

## 5. Timeline Visual

```
2026                                   2027
Q2          Q3              Q4              Q1              Q2
═══════════════════════════════════════════════════════════════════════
████  Phase 1 ████
 │    v2.0.0 (Foundation)
 │
 │       ██████████████  Phase 2 ████████████
 │       │    v2.1 - v2.3 (Enhanced UX)
 │       │    Search History, Favorites, Batch Insert,
 │       │    Resizable, Options, Shortcuts
 │       │
 │       │            ██████████████████  Phase 3 ████████████
 │       │            │    v2.4 - v2.6 (Collaboration)
 │       │            │    Share Presets, Team Collections,
 │       │            │    Analytics, Comments
 │       │            │
 │       │            │              ██████████████████████  Phase 4 ██
 │       │            │              │    v2.7 - v2.9 (Enterprise)
 │       │            │              │    Custom Repo, Self-Hosted,
 │       │            │              │    Themes, API Keys
 │       │            │              │
 │       │            │              │              ██████████████████
 │       │            │              │              │    v3.0 (Platform)
 │       │            │              │              │    Firefox, Safari,
 │       │            │              │              │    Edge, VS Code, CLI
 │       │            │              │              │
▼       ▼            ▼              ▼              ▼              ▼
Jun     Jul-Sep      Oct-Dec        Jan-Mar        Apr-Jun       Jul+
```

### Legend

```
████  Fase aktif / dirilis
│     Batas antar fase
▼     Titik rilis utama (major)
```

### Rilis Minor

| Rilis | Perkiraan | Fitur Utama |
|-------|-----------|-------------|
| v2.0.0 | Juni 2026 | Foundation (Phase 1) — selesai |
| v2.1.0 | Juli 2026 | Search History, Favorites |
| v2.2.0 | Agustus 2026 | Batch Insert, Popup Resizable |
| v2.3.0 | September 2026 | Options Page, Shortcuts, Improved Renderer |
| v2.4.0 | Oktober 2026 | Share Presets |
| v2.5.0 | November 2026 | Team Collections |
| v2.6.0 | Desember 2026 | Usage Analytics, Comments |
| v2.7.0 | Januari 2027 | Custom Repo UI |
| v2.8.0 | Februari 2027 | Self-Hosted Mode |
| v2.9.0 | Maret 2027 | Theme System, API Keys |
| v3.0.0 | Juni 2027 | Platform Expansion (Multi-Browser) |

---

## 6. Glosarium Fase

| Istilah | Definisi |
|---------|----------|
| **Foundation** | Fase pertama yang membangun fitur inti dan stabilitas produk. Semua fitur di fase ini bersifat P0 (wajib ada). |
| **Enhanced UX** | Fase yang berfokus pada personalisasi, efisiensi, dan kenyamanan pengguna. Fitur seperti favorit, riwayat, dan kustomisasi. |
| **Collaboration** | Fase yang membawa produk dari alat personal menjadi alat tim. Berbagi preset, koleksi tim, dan fitur kolaboratif lainnya. |
| **Enterprise** | Fase yang menyasar kebutuhan organisasi: repositori kustom, self-hosted, keamanan, dan kontrol tingkat lanjut. |
| **Platform** | Fase ekspansi ke berbagai platform dan perangkat: browser lain (Firefox, Safari, Edge), editor (VS Code), dan terminal (CLI). |
| **Priority Matrix** | Matriks 2x2 yang memetakan fitur berdasarkan dampak ke pengguna dan kompleksitas implementasi, membantu pengambilan keputusan prioritas. |
| **P0/P1/P2/P3** | Skala prioritas: P0 = wajib (blocking), P1 = sangat penting, P2 = penting, P3 = nice-to-have. |
| **MVP** | Minimum Viable Product — produk dengan fitur minimal yang sudah bisa digunakan dan memberikan value. |

---

## Dokumentasi Terkait

- [PRD (Product Requirements Document)](../requirements/PRD.md) — Kebutuhan produk secara menyeluruh
- [FRD (Functional Requirements Document)](../requirements/FRD.md) — Spesifikasi fungsional detail
- [Architecture Document](../architecture/architecture.md) — Arsitektur sistem dan diagram
- [Design System](../design/design.md) — Design tokens dan komponen UI
- [Changelog](changelog.md) — Catatan perubahan per rilis
- [User Guide](../guides/user-guide.md) — Panduan penggunaan untuk pengguna akhir

---

> **Catatan:** Roadmap ini adalah dokumen hidup (*living document*) yang akan diperbarui seiring perkembangan produk dan umpan balik pengguna. Prioritas dapat berubah berdasarkan data penggunaan, permintaan pengguna, dan perubahan pasar. Semua *stakeholder* dipersilakan memberikan masukan melalui *issue* atau *pull request* di repositori.
>
> *"Build the right thing, build it well, then build it everywhere."*
>
> Terakhir diperbarui: 2026-06-24
