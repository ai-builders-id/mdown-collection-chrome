# Product Requirements Document (PRD) — blinker

> **Dokumen:** PRD — Product Requirements Document  
> **Proyek:** blinker (sebelumnya mdown-dropper)  
> **Versi:** 2.0.0  
> **Tanggal:** 2026-06-24  
> **Status:** Draft  
> **Penulis:** Cloud Dark  

---

## Daftar Isi

1. [Executive Summary](#1-executive-summary)
2. [Product Scope](#2-product-scope)
3. [User Personas](#3-user-personas)
4. [User Stories](#4-user-stories)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Constraints & Assumptions](#7-constraints--assumptions)
8. [Success Metrics](#8-success-metrics)
9. [Risk Assessment](#9-risk-assessment)
10. [Feature Roadmap](#10-feature-roadmap)
11. [Glossary](#11-glossary)

---

## 1. Executive Summary

**blinker** adalah ekstensi Chrome (Manifest V3) yang memungkinkan pengguna untuk menjelajah (*browse*), mencari (*search*), melihat pratinjau (*preview*), dan melakukan *drag-and-drop* file markdown dari repositori GitHub ke halaman web mana pun. Awalnya dirilis dengan nama **mdown-dropper**, ekstensi ini kemudian diubah namanya menjadi blinker untuk mencerminkan cakupan yang lebih luas: tidak hanya sebagai alat *drop* markdown, tetapi juga sebagai jembatan cepat (*blink connector*) antara konten prompt yang terstruktur dan halaman kerja pengguna.

blinker mengintegrasikan dua repositori GitHub utama — **PRD Prompt Collection** dan **Prompt Collection** (mdown-collection) — yang berisi kumpulan *product requirement document* (PRD) siap pakai, *prompt engineering* berkualitas tinggi, dan template *engineering standards*. Setiap file markdown dapat memiliki variabel yang ditandai dengan notasi `{{VARIABLE}}`, yang secara otomatis terdeteksi dan dapat diisi nilainya melalui *variable editor* bawaan sebelum konten digunakan.

Dengan blinker, *prompt engineer*, *product manager*, *software engineer*, dan *AI enthusiast* dapat mengakses pustaka prompt yang kaya tanpa harus membuka GitHub, menyalin secara manual, atau beralih tab. Semua dilakukan dari satu popup ekstensi ringkas yang terintegrasi langsung ke alur kerja.

### 1.1 Masalah yang Dipecahkan

- **Fragmentasi akses prompt**: Prompt berkualitas tersebar di berbagai repositori, file lokal, dan bookmark tanpa alat pencarian terpadu.
- **Kehilangan konteks**: Pengguna harus bolak-balik antara tab GitHub, editor, dan halaman kerja, menyebabkan gesekan dan kehilangan fokus.
- **Kustomisasi manual**: Variabel dalam template prompt harus diedit manual, rentan kesalahan dan memakan waktu.
- **Tidak ada integrasi alur kerja**: Belum ada alat yang memungkinkan *drag-and-drop* langsung dari koleksi prompt ke halaman web atau form.

### 1.2 Visi Produk

Menjadi ekstensi *default* bagi praktisi AI dan pengembang untuk mengakses, mengelola, dan menyisipkan konten prompt dan template — cepat, tanpa gesekan (*frictionless*), dan langsung dari bilah alat peramban.

### 1.3 Target Audiens

- **Pengguna utama**: Prompt engineer, product manager, AI/ML engineer, software developer.
- **Pengguna sekunder**: Technical writer, QA engineer, content writer, mahasiswa yang bekerja dengan AI.

---

## 2. Product Scope

### 2.1 In-Scope (Lingkup Produk)

| Area | Deskripsi |
|------|-----------|
| **Dual-Repo Browsing** | Menjelajahi dua repositori GitHub (PRD Prompt + Prompt Collection) melalui tab terpisah di popup |
| **Real-Time Search** | Filter file berdasarkan nama atau jalur secara *real-time* dengan dukungan *alias expansion* (misal: ketik `cs` akan mencari `customer support`) |
| **Markdown Preview** | Menampilkan file markdown dalam mode **Rendered** (tampilan HTML termodifikasi) dan **Raw** (kode sumber) |
| **Variable Detection & Editor** | Mendeteksi otomatis pola `{{VARIABLE}}` dari konten file, menampilkan *chip* yang dapat diklik untuk mengedit nilai, menerapkan penggantian ke teks |
| **Drag & Drop** | Menyeret (*drag*) file dari daftar popup ke *textarea*, *input*, atau elemen *contenteditable* di halaman web mana pun, dengan konten dikirim melalui `chrome.storage.local` |
| **Copy to Clipboard** | Menyalin konten file (setelah variabel diisi) ke *clipboard* dengan satu klik |
| **Insert ke Active Element** | Menyisipkan konten file ke elemen aktif di halaman web (textarea, input, contenteditable) langsung dari popup |
| **Cache System** | Menyimpan daftar file di `localStorage` dengan *Time-To-Live* (TTL) 10 menit untuk mengurangi panggilan API GitHub |
| **Refresh dari GitHub** | Tombol *refresh* untuk memuat ulang daftar file dari GitHub, melewati *cache* |
| **Prefetch Content** | Mengambil konten file saat *hover* atau *pointerdown* pada item daftar agar *drag* terasa instan |
| **Indikator Loading/Empty/Error** | Menampilkan *spinner* saat memuat, pesan "tidak ada hasil" saat pencarian kosong, dan pesan *error* jika API gagal |

### 2.2 Out-of-Scope (Luar Lingkup)

| Area | Alasan |
|------|--------|
| Repositori GitHub pihak ketiga (kustom) | Menambah kompleksitas autentikasi, izin, dan OAuth |
| Edit file markdown di repositori | Bukan tujuan utama — cukup *read-only* dan *export* |
| *Folder/file management* (create, rename, delete) | Tidak sesuai dengan fungsi sebagai *read-only browser* |
| *Snippet manager* dengan penyimpanan lokal | Sudah ada banyak alat seperti itu; blinker fokus pada konten GitHub |
| *Rich text editor* di popup | Popup Chrome memiliki ukuran terbatas (400x600 px) dan bukan tempat menulis |
| Autentikasi GitHub OAuth | Memerlukan *backend server*, *client ID/secret*, dan meningkatkan *permission footprint* |
| Dukungan repositori GitHub pribadi | Membutuhkan token autentikasi dan menambah kompleksitas |
| Integrasi dengan *LLM provider* (langsung kirim prompt ke ChatGPT/Claude) | Di luar lingkup ekstensi *browser utility*; potensi fitur masa depan |
| *Multi-monitor* atau *full-window* mode | Keterbatasan teknis popup Chrome |
| *Bulk export* multi-file | *Use case* minor dengan kompleksitas implementasi tinggi |
| Preview gambar atau file non-markdown | Tipe file non-markdown diabaikan dari *filter* repositori |

### 2.3 MVP (Minimum Viable Product)

*Minimum Viable Product* blinker sudah tercakup dalam versi 2.0.0 saat ini dan mencakup:

1. Menampilkan daftar file markdown dari repositori PRD dan Prompt Collection.
2. *Real-time search* dengan *alias expansion* sederhana.
3. *Preview* markdown (Rendered + Raw) dengan deteksi variabel.
4. *Variable editor* dengan modal *input* untuk mengisi nilai `{{VARIABLE}}`.
5. *Drag-and-drop* file dari daftar ke halaman web.
6. *Copy to clipboard*.
7. *Insert* konten ke elemen aktif di halaman web.
8. *Cache* daftar file (10 menit TTL) di `localStorage`.

---

## 3. User Personas

### 3.1 Persona 1 — Rina, Prompt Engineer

> *"Saya butuh akses cepat ke prompt berkualitas tanpa harus membuka GitHub setiap lima menit."*

| Atribut | Detail |
|---------|--------|
| **Nama** | Rina Kusuma |
| **Usia** | 28 tahun |
| **Pekerjaan** | Prompt Engineer di startup AI |
| **Pengalaman Teknis** | Mahir — hafal format markdown, paham *prompt chaining* dan *few-shot prompting* |
| **Tools** | Chrome (default), Claude, ChatGPT, VS Code, Notion |
| **Kesulitan** | Harus bolak-balik antara tab GitHub, Notion, dan ChatGPT untuk mengambil prompt; sering lupa di mana menyimpan prompt yang sudah dikustomisasi |
| **Tujuan** | Mengakses prompt dengan cepat, mengisi variabel, dan langsung menempelkannya ke percakapan AI — tanpa *context switch* |
| **Skenario Harian** | Setiap pagi, Rina membuka beberapa prompt PRD dan *customer support* dari koleksi, mengisi variabel seperti `{{PRODUCT_NAME}}`, lalu *drag-and-drop* atau *copy* prompt tersebut ke jendela ChatGPT |
| **Pain Points** | *Alias expansion* masih terbatas; ingin bisa *custom alias*; kadang *cache* membuat file baru tidak muncul sampai klik *refresh* manual |

### 3.2 Persona 2 — Dimas, Product Manager

> *"Saya sering menulis PRD dan butuh template yang konsisten. Yang penting adalah variabelnya bisa diisi otomatis."*

| Atribut | Detail |
|--------|--------|
| **Nama** | Dimas Pratama |
| **Usia** | 34 tahun |
| **Pekerjaan** | Senior Product Manager di perusahaan fintech |
| **Pengalaman Teknis** | Menengah — bisa markdown, paham GitHub tapi tidak *daily user* |
| **Tools** | Chrome, Google Docs, Linear, Jira, Slack, Claude |
| **Kesulitan** | Sering lupa *template* PRD yang benar; proses *copy-paste* template dari GitHub ke dokumen lambat dan rawan format kacau |
| **Tujuan** | Mendapatkan template PRD yang konsisten dengan variabel yang sudah diisi, tanpa khawatir format markdown rusak |
| **Skenario Harian** | Dimas membuat PRD baru 1-2 kali seminggu. Ia membuka blinker, memilih tab PRD Prompt, mencari "accounting" atau "charter", melihat *preview*, mengisi variabel seperti `{{PROJECT_SLUG}}` dan `{{PROJECT_NAME}}`, lalu meng-*insert* konten ke Google Docs atau Linear |
| **Pain Points** | Tidak bisa *preview* langsung bagaimana hasil akhir setelah variabel diisi (saat ini *live preview* sudah ada tapi bisa lebih responsif); ingin dukungan *variable default value* |

### 3.3 Persona 3 — Andi, Software Engineer

> *"Saya ingin akses cepat ke *engineering standards* dan *prompt* untuk *code review*, tanpa meninggalkan IDE."*

| Atribut | Detail |
|--------|--------|
| **Nama** | Andi Wijaya |
| **Usia** | 31 tahun |
| **Pekerjaan** | Backend Engineer di perusahaan *e-commerce* |
| **Pengalaman Teknis** | Sangat mahir — *daily GitHub user*, familiar dengan Chrome DevTools dan ekstensi |
| **Tools** | Chrome, VS Code, iTerm2, GitHub CLI, Claude, Cursor |
| **Kesulitan** | Saat *code review* atau nulis *ticket*, butuh *engineering standards* dan *prompt* untuk *review*, tapi harus buka repo terpisah |
| **Tujuan** | Mengakses *standards* dan *prompt teknis* langsung dari bilah alat, tanpa mengganggu alur coding |
| **Skenario Harian** | Andi sedang *review* PR di GitHub. Ia perlu *prompt* untuk *code review* yang komprehensif. Ia buka blinker, cari "review" di tab Prompt Collection, *preview* isinya, lalu *drop* ke *comment box* GitHub |
| **Pain Points** | Ingin *shortcut keyboard* untuk membuka popup; ingin file yang sering dipakai muncul di *recent/favorites* |

### 3.4 Persona 4 — Sari, Technical Writer (Persona Tambahan)

> *"Saya mendokumentasikan API dan fitur produk. Template dokumentasi yang konsisten sangat penting."*

| Atribut | Detail |
|--------|--------|
| **Nama** | Sari Wulandari |
| **Usia** | 26 tahun |
| **Pekerjaan** | Technical Writer |
| **Pengalaman Teknis** | Dasar — bisa markdown, paham GitHub *basic* |
| **Tools** | Chrome, Notion, Google Docs, Markdown editors |
| **Kesulitan** | Mencari template dokumentasi yang sesuai; format markdown kadang tidak *render* sempurna di Notion setelah di-*paste* |
| **Tujuan** | Menulis dokumentasi yang konsisten dengan template yang sudah teruji |
| **Pain Points** | Ingin *preview* yang bisa melihat hasil *rendered* dan *raw* secara berdampingan; ingin *copy* dalam format yang kompatibel dengan Notion |

---

## 4. User Stories

### 4.1 Epic 1: Browsing & Navigation

| ID | Sebagai... | Saya ingin... | Sehingga... | Prioritas |
|----|-----------|---------------|-------------|-----------|
| US-001 | Pengguna | Melihat daftar semua file markdown dari repositori PRD Prompt | Saya dapat memilih template yang sesuai dengan kebutuhan | P0 |
| US-002 | Pengguna | Melihat daftar semua file dari Prompt Collection (mdown-collection) | Saya dapat mengakses prompt teknis dan template engineering | P0 |
| US-003 | Pengguna | Beralih antara repositori PRD dan Prompt Collection dengan satu klik tab | Saya dapat dengan cepat mencari di kedua repositori | P0 |
| US-004 | Pengguna | Melihat file dikelompokkan berdasarkan folder/direktori | Saya dapat menavigasi konten secara hierarkis | P0 |
| US-005 | Pengguna | Melihat jumlah total file yang tersedia | Saya tahu seberapa besar koleksi yang bisa saya akses | P1 |
| US-006 | Pengguna | Melihat tautan langsung ke repositori GitHub di footer | Saya dapat membuka repositori untuk konteks lebih lanjut | P1 |

### 4.2 Epic 2: Search & Discovery

| ID | Sebagai... | Saya ingin... | Sehingga... | Prioritas |
|----|-----------|---------------|-------------|-----------|
| US-007 | Pengguna | Mencari file berdasarkan nama dengan filter *real-time* | File yang relevan langsung muncul saat saya mengetik | P0 |
| US-008 | Pengguna | Mengetik *alias* pendek (misal `cs` untuk *customer support*) dan pencarian memperluasnya secara otomatis | Saya dapat mencari lebih cepat dengan singkatan | P0 |
| US-009 | Pengguna | Melihat pesan "tidak ada hasil" jika pencarian tidak cocok | Saya tahu tidak ada file yang sesuai dengan kriteria | P1 |
| US-010 | Pengguna | Menambahkan *alias* kustom sendiri | Saya dapat mempersonalisasi pencarian sesuai terminologi tim | P3 |

### 4.3 Epic 3: Preview & Variable Editor

| ID | Sebagai... | Saya ingin... | Sehingga... | Prioritas |
|----|-----------|---------------|-------------|-----------|
| US-011 | Pengguna | Melihat *preview* markdown dalam mode *rendered* | Saya dapat membaca konten dengan format yang mudah dipahami | P0 |
| US-012 | Pengguna | Melihat *preview* dalam mode *raw* (kode sumber markdown) | Saya dapat memeriksa struktur markdown asli | P0 |
| US-013 | Pengguna | Mendeteksi semua `{{VARIABLE}}` secara otomatis dalam file | Saya tahu variabel mana yang perlu diisi | P0 |
| US-014 | Pengguna | Mengklik *chip* variabel berwarna untuk mengisi nilainya | Saya dapat mengisi variabel tanpa harus mencari di teks | P0 |
| US-015 | Pengguna | Melihat variabel yang sudah diisi langsung tercermin di *preview* | Saya dapat memverifikasi hasil akhir sebelum digunakan | P0 |
| US-016 | Pengguna | Mengklik teks variabel yang disorot di *preview* untuk mengedit nilainya | Saya dapat mengedit variabel dengan cepat dari mana saja | P1 |
| US-017 | Pengguna | Melihat variabel yang belum diisi masih ditampilkan dengan sorotan | Saya tidak lupa variabel mana yang perlu dilengkapi | P1 |

### 4.4 Epic 4: Content Export & Insertion

| ID | Sebagai... | Saya ingin... | Sehingga... | Prioritas |
|----|-----------|---------------|-------------|-----------|
| US-018 | Pengguna | Menyalin konten file (dengan variabel terisi) ke *clipboard* | Saya dapat menempelkannya di aplikasi lain | P0 |
| US-019 | Pengguna | Melakukan *drag-and-drop* file dari daftar ke *textarea* atau *input* di halaman web | Saya dapat memasukkan konten tanpa klik tambahan | P0 |
| US-020 | Pengguna | Menyisipkan konten file ke elemen aktif di halaman web dari tombol di *preview* | Saya tidak perlu beralih jendela untuk menempelkan konten | P0 |
| US-021 | Pengguna | Melihat konfirmasi visual setelah *copy* atau *insert* berhasil | Saya yakin aksi telah berhasil dilakukan | P1 |
| US-022 | Pengguna | Melihat *overlay* drop target pada halaman web saat melakukan *drag* | Saya tahu persis di mana konten akan ditempatkan | P1 |

### 4.5 Epic 5: Performa & Keandalan

| ID | Sebagai... | Saya ingin... | Sehingga... | Prioritas |
|----|-----------|---------------|-------------|-----------|
| US-023 | Pengguna | Daftar file dimuat dari *cache* (bukan API) saat ekstensi dibuka kembali dalam 10 menit | Ekstensi terasa cepat dan tidak membuang kuota API | P0 |
| US-024 | Pengguna | Konten file di-*prefetch* saat *hover* | *Drag-and-drop* terasa instan | P1 |
| US-025 | Pengguna | Melihat *spinner* saat memuat data dari GitHub | Saya tahu aplikasi sedang bekerja | P1 |
| US-026 | Pengguna | Melihat pesan *error* yang jelas jika pemuatan gagal | Saya tahu apa yang salah dan bisa memperbaikinya | P1 |
| US-027 | Pengguna | Me-*refresh* daftar file secara manual dengan tombol | Saya bisa mendapatkan file terbaru kapan pun | P1 |

### 4.6 Epic 6: Pengalaman Pengguna

| ID | Sebagai... | Saya ingin... | Sehingga... | Prioritas |
|----|-----------|---------------|-------------|-----------|
| US-028 | Pengguna | Melihat tema gelap (*dark theme*) yang konsisten dengan GitHub | Mata saya tidak cepat lelah | P0 |
| US-029 | Pengguna | Melihat informasi ukuran file di daftar | Saya tahu perkiraan panjang konten file | P2 |
| US-030 | Pengguna | Tombol aksi (preview, copy) muncul saat *hover* pada item file | Antarmuka tidak terlalu ramai | P1 |

---

## 5. Functional Requirements

### 5.1 Repo Management

| ID | Nama | Deskripsi | Prioritas |
|----|------|-----------|-----------|
| FR-001 | Konfigurasi Dual Repositori | Sistem harus mendukung dua repositori GitHub yang dikonfigurasi: `prd-prompt-collection` (owner: `ai-builders-id`) dan `mdown-collection` (owner: `ai-builders-id`). Setiap repositori memiliki *filter* sendiri — untuk PRD hanya file `.md` kecuali `README.md`; untuk Prompt Collection `.md` dan `.json` kecuali di folder `assets/` | P0 |
| FR-002 | Tab Switching | Popup harus menampilkan dua tab repositori dengan *icon* dan *label* yang berbeda. Tab PRD berwarna hijau (`#3fb950`), tab Prompt Collection berwarna biru (`#58a6ff`). Klik tab akan memuat repositori terkait | P0 |
| FR-003 | GitHub API Fetch | Sistem harus mengambil daftar file dari GitHub Tree API (`GET /repos/{owner}/{repo}/git/trees/main?recursive=1`) dengan *header* `Accept: application/vnd.github+json` | P0 |
| FR-004 | File Content Fetch | Sistem harus mengambil konten file dari `raw.githubusercontent.com/{owner}/{repo}/main/{path}` | P0 |
| FR-005 | File Filtering | Setiap repositori memiliki fungsi *filter* untuk hanya menyertakan *blob* dengan ekstensi yang sesuai. File `README.md` harus dikecualikan dari repositori PRD | P0 |
| FR-006 | Cache Storage | Daftar file yang diambil dari GitHub harus disimpan di `localStorage` selama 10 menit dengan *key* `mdown_v3_{repoKey}` bersama *timestamp* | P0 |

### 5.2 UI & Display

| ID | Nama | Deskripsi | Prioritas |
|----|------|-----------|-----------|
| FR-007 | Daftar File | Daftar file harus ditampilkan dengan ikon yang sesuai (📋 untuk PRD, 🗂️/📄 untuk Prompt Collection, 📐 untuk *standards/template*, {} untuk JSON), nama file yang sudah dibersihkan (underscore diganti spasi, nomor prefiks dipisah), dan ukuran file | P0 |
| FR-008 | Pengelompokan Folder | File harus dikelompokkan berdasarkan direktori asal (folder). Label folder ditampilkan sebagai *section header*: "Root", "Engineering Standards", "Minimal Templates", atau nama folder asli | P0 |
| FR-009 | Header Popup | Header harus menampilkan nama "blinker" dengan ikon ✨ dan tombol *refresh* (↻) | P0 |
| FR-010 | Footer Popup | Footer harus menampilkan jumlah file dan tautan ke repositori GitHub | P1 |
| FR-011 | Dark Theme | Seluruh UI harus menggunakan tema gelap dengan palet warna yang konsisten dengan GitHub Dark (#0d1117 latar belakang, #161b22 header/panel, #e6edf3 teks, #58a6ff aksen biru, #3fb950 aksen hijau) | P0 |

### 5.3 Search

| ID | Nama | Deskripsi | Prioritas |
|----|------|-----------|-----------|
| FR-012 | Search Input | Input pencarian yang terletak di bawah header. Setiap perubahan (event `input`) akan memicu *filtering* daftar file | P0 |
| FR-013 | Alias Expansion | Sistem harus mendukung *alias* pencarian: `cs` → *customer support*, `prd` → *product requirements*, `qa` → *quality assurance*, `api` → *application programming interface*. Jika input cocok dengan salah satu *key alias*, pencarian diperluas ke nilai alias tersebut | P0 |
| FR-014 | Case-Insensitive Search | Pencarian harus *case-insensitive* dan mencocokkan nama file dan jalur | P0 |
| FR-015 | Empty State | Jika pencarian tidak menghasilkan hasil, tampilkan pesan "Tidak ada file yang cocok" dengan ikon 🔍 | P1 |

### 5.4 Preview System

| ID | Nama | Deskripsi | Prioritas |
|----|------|-----------|-----------|
| FR-016 | Preview Mode | Popup harus memiliki dua *view*: daftar (list) dan *preview*. Tombol 👁 pada item file akan membuka *preview* | P0 |
| FR-017 | Preview Tabs | *Preview* harus memiliki dua tab: "Rendered" (default) dan "Raw" untuk beralih tampilan | P0 |
| FR-018 | Markdown Rendering | Konten markdown harus di-*render* ke HTML dengan dukungan heading (h1-h3), bold/italic, inline/block code, link, list, tabel, blockquote, dan horizontal rule | P0 |
| FR-019 | Raw Display | Mode *raw* harus menampilkan kode sumber markdown yang sudah di-*escape* dengan *monospace font* dan *white-space: pre-wrap* | P0 |
| FR-020 | Back Navigation | Tombol "← Back" di *preview header* untuk kembali ke daftar file | P0 |

### 5.5 Variable Detection & Editor

| ID | Nama | Deskripsi | Prioritas |
|----|------|-----------|-----------|
| FR-021 | Variable Extraction | Sistem harus mengekstrak semua pola `{{[A-Z0-9_]+}}` dari konten file secara otomatis. Variabel duplikat di-*deduplicate* | P0 |
| FR-022 | Variable Chips | Variabel yang terdeteksi ditampilkan sebagai *chip* berwarna di bilah variabel. Setiap *chip* dapat diklik untuk membuka editor | P0 |
| FR-023 | Variable Color Coding | Variabel harus memiliki warna siklus 6 warna yang konsisten antara *chip*, sorotan *rendered*, dan sorotan *raw* | P0 |
| FR-024 | Variable Modal | Editor variabel berupa modal dengan: nama variabel (monospace, warna oranye), input teks, tombol "Batal" dan "Terapkan". Enter untuk terapkan, Escape untuk batal | P0 |
| FR-025 | Variable Substitution | Setelah variabel diisi, sistem harus mengganti semua kemunculan `{{VARIABLE}}` dengan nilai yang diberikan. Variabel yang belum diisi tetap ditampilkan dengan sorotan | P0 |
| FR-026 | Variable State Reset | Saat membuka file baru, semua nilai variabel harus di-*reset* | P0 |

### 5.6 Content Export

| ID | Nama | Deskripsi | Prioritas |
|----|------|-----------|-----------|
| FR-027 | Drag dari Daftar | Setiap item file di daftar harus memiliki atribut `draggable="true"`. Saat *dragstart*, konten file (setelah *prefetch* atau *fetch async*) diatur sebagai `text/plain` di *dataTransfer* dan juga disimpan ke `chrome.storage.local` | P0 |
| FR-028 | Drag dari Preview | Tombol "⠿ Drag" di *footer preview* harus mentransfer konten final (dengan variabel terisi) melalui *dataTransfer* | P0 |
| FR-029 | Prefetch on Hover | Konten file harus mulai di-*fetch* saat *mouseenter* atau *pointerdown* pada item daftar, sehingga siap saat *drag* dimulai | P1 |
| FR-030 | Copy to Clipboard | Tombol "📋 Copy" harus menyalin konten final ke *clipboard* menggunakan *Clipboard API* (`navigator.clipboard.writeText`) | P0 |
| FR-031 | Insert ke Active Element | Tombol "⬇ Insert ke Web" harus menyisipkan konten final ke elemen aktif di halaman web (textarea, input, contenteditable) menggunakan `chrome.scripting.executeScript` | P0 |

### 5.7 Content Script (Drop Handler)

| ID | Nama | Deskripsi | Prioritas |
|----|------|-----------|-----------|
| FR-032 | Drop Target Detection | *Content script* harus mendeteksi elemen yang valid sebagai target *drop*: `TEXTAREA`, `INPUT` dengan tipe text/search/url/email, dan elemen dengan `isContentEditable = true` | P0 |
| FR-033 | Overlay Visual | Saat *dragover* di atas target yang valid, tampilkan *overlay* dengan *border dashed* biru dan label "📄 Drop markdown here" | P1 |
| FR-034 | Drop Handler | Saat *drop*, konten diambil dari *dataTransfer* (jika tersedia sinkron) atau dari `chrome.storage.local` (jika *async*). Konten disisipkan ke posisi kursor, dengan *flash* konfirmasi hijau | P0 |

### 5.8 Utility

| ID | Nama | Deskripsi | Prioritas |
|----|------|-----------|-----------|
| FR-035 | State Loading | Saat memuat data, tampilkan *spinner* dengan teks "Mengambil daftar file..." atau "Loading..." | P1 |
| FR-036 | State Error | Jika API gagal, tampilkan ikon ⚠️ dan pesan *error* yang jelas | P1 |
| FR-037 | Manual Refresh | Tombol *refresh* (↻) harus menghapus *cache localStorage* repositori aktif dan memuat ulang dari GitHub dengan parameter `force = true` | P1 |

---

## 6. Non-Functional Requirements

### 6.1 Performance (Performa)

| ID | Nama | Target | Kriteria |
|----|------|--------|----------|
| NFR-001 | Waktu Muat Daftar File | < 3 detik (dengan cache), < 8 detik (tanpa cache) | Diukur dari klik ikon hingga daftar muncul |
| NFR-002 | Waktu Preview | < 2 detik | Dari klik tombol preview hingga konten file ditampilkan |
| NFR-003 | Responsivitas Pencarian | < 100 ms | Waktu antara input pengguna hingga daftar terfilter |
| NFR-004 | *Drag Readiness* | 90% *drag* memiliki konten siap di *dataTransfer* | Mengandalkan *prefetch* yang berhasil |
| NFR-005 | Ukuran Popup | Tetap 400x600 px | Tidak ada *layout shift* atau *scroll* horizontal |
| NFR-006 | Penggunaan Memori | < 50 MB RAM | Penggunaan memori popup tidak boleh membebani peramban |
| NFR-007 | Waktu Pemualan Ekstensi | < 1 detik | Dari klik ikon ekstensi hingga UI siap |

### 6.2 Reliability (Keandalan)

| ID | Nama | Target | Kriteria |
|----|------|--------|----------|
| NFR-008 | Ketersediaan Cache | Data tersedia di *localStorage* untuk 10 menit penuh | Tidak ada pemanggilan API berulang dalam periode yang sama |
| NFR-009 | *Error Recovery* | 100% *error* API tertangkap dan ditampilkan ke pengguna | Tidak ada *silent failure* |
| NFR-010 | Konsistensi Drag | Konten yang di-*drop* harus identik dengan konten asli file (setelah substitusi variabel) | Verifikasi integritas konten |

### 6.3 Usability (Kegunaan)

| ID | Nama | Target | Kriteria |
|----|------|--------|----------|
| NFR-011 | Aksesibilitas Keyboard | Semua aksi utama dapat diakses dengan keyboard | Tab, Enter, Escape berfungsi di modal dan tombol |
| NFR-012 | Bahasa UI | UI dalam Bahasa Indonesia untuk semua teks statis | Konsistensi bahasa di seluruh ekstensi |
| NFR-013 | Visual Feedback | Setiap aksi pengguna (klik, drag, copy, error) memiliki *feedback* visual | Maksimal 1,5 detik durasi *feedback* |
| NFR-014 | Ukuran Font Minimum | Font body tidak boleh lebih kecil dari 10px | Keterbacaan pada ukuran popup 400px |

### 6.4 Security (Keamanan)

| ID | Nama | Target | Kriteria |
|----|------|--------|----------|
| NFR-015 | Minimal Permissions | Hanya menggunakan *permissions* yang diperlukan: `activeTab`, `scripting`, `storage` | Tidak ada *permission* yang berlebihan |
| NFR-016 | Content Isolation | *Content script* tidak boleh mengganggu fungsionalitas halaman web | Menggunakan IIFE dengan *guard flag* untuk mencegah *double injection* |
| NFR-017 | Data Sanitasi | Semua konten yang di-*render* di popup harus di-*escape* untuk XSS | Kode HTML dari markdown di-*render* aman; tag berbahaya di-*strip* |

### 6.5 Compatibility (Kompatibilitas)

| ID | Nama | Target | Kriteria |
|----|------|--------|----------|
| NFR-018 | Dukungan Peramban | Chrome 88+ (Manifest V3) | Fitur yang digunakan (ES6+, `chrome.scripting`) tersedia |
| NFR-019 | Dukungan Platform | Windows 10+, macOS 10.13+, Linux (Chrome) | Ekstensi lintas platform |
| NFR-020 | GitHub API Rate Limit | Tidak melebihi 60 *requests/jam* per pengguna untuk API *unauthenticated* | Mengandalkan *cache* untuk mengurangi panggilan |

---

## 7. Constraints & Assumptions

### 7.1 Constraints (Batasan)

| ID | Batasan | Dampak |
|----|---------|--------|
| C-001 | Ukuran popup Chrome terbatas pada 400x600 px (tidak bisa di-*resize*) | UI harus ringkas; informasi padat tanpa *scroll* horizontal |
| C-002 | `chrome.scripting` memerlukan izin `activeTab` dan hanya berfungsi pada tab aktif | Fitur *insert* tidak bisa menjangkau tab *background* |
| C-003 | GitHub API *unauthenticated* terbatas 60 *requests/jam* per IP | Cache 10 menit sangat penting untuk mencegah *rate limiting* |
| C-004 | `localStorage` terbatas ~5-10 MB per *origin* | Hanya daftar file (metadata) yang di-*cache*, bukan konten |
| C-005 | Manifest V3 membatasi penggunaan *remote code* | Semua kode harus disertakan dalam paket ekstensi; tidak ada *eval()* |
| C-006 | `async` *drag-and-drop* tidak bisa mengirim data secara sinkron | Menggunakan `chrome.storage.local` sebagai *fallback* untuk konten yang belum siap |
| C-007 | Tidak ada *backend server* | Semua komunikasi langsung ke GitHub API dan `raw.githubusercontent.com` |

### 7.2 Assumptions (Asumsi)

| ID | Asumsi | Risiko Jika Salah |
|----|--------|-------------------|
| A-001 | Repositori GitHub yang digunakan bersifat *public* | Ekstensi tidak akan bisa mengakses repositori pribadi tanpa autentikasi |
| A-002 | Struktur file repositori tidak berubah drastis antar *commit* | *Filter* dan *grouping* mungkin perlu disesuaikan |
| A-003 | Pengguna memiliki koneksi internet saat menggunakan ekstensi | Tidak ada *offline mode*; konten tidak bisa diakses *offline* |
| A-004 | File markdown menggunakan `{{VARIABLE}}` dengan format konsisten | Pola *regex* yang digunakan mungkin tidak cocok dengan format variabel non-standar |
| A-005 | Mayoritas pengguna menggunakan Chrome versi terbaru | Fitur modern (ES6+, CSS Grid, Flexbox) tersedia tanpa *polyfill* |
| A-006 | Pengguna lebih suka UI Bahasa Indonesia | Memudahkan adopsi di pasar Indonesia |
| A-007 | Branch default repositori adalah `main` | Jika diganti ke `master`, URL harus diperbarui |

---

## 8. Success Metrics

### 8.1 Key Performance Indicators (KPI)

| KPI | Target | Cara Ukur | Periode |
|-----|--------|-----------|---------|
| **Jumlah file yang berhasil di-*drop*** | > 1000 *drop*/bulan | `chrome.storage` *counter* (jika diimplementasikan) | Bulanan |
| **Cache Hit Rate** | > 80% | Persentase muatan dari *cache* vs API | Harian |
| **Waktu Muat Rata-rata** | < 2 detik (cache), < 6 detik (*fresh*) | `performance.now()` di *dev build* | Per rilis |
| **Error Rate API** | < 5% | Persentase *request* API yang gagal | Harian |
| **User Retention** | > 40% *week-2 retention* | *Chrome Web Store analytics* | Mingguan |
| **Rating Chrome Web Store** | > 4.0 / 5.0 | Ulasan pengguna di CWS | Per kuartal |
| **Jumlah Pengguna Aktif** | > 500 pengguna | *Chrome Web Store dashboard* | Bulanan |
| **Penggunaan Variable Editor** | > 60% pengguna mengisi minimal 1 variabel | *Tracking event* (akan diimplementasikan) | Bulanan |

### 8.2 Target Peluncuran (*Launch Targets*)

| Metrik | V1 (MVP — Saat Ini) | V2 (3 Bulan) | V3 (6 Bulan) |
|--------|---------------------|--------------|--------------|
| Fitur | Browsing, Search, Preview, Drag, Copy, Insert | + Recent files, Favorites | + Custom alias, Stats |
| Stabilitas | 99% *uptime* (API *available*) | 99.5% | 99.9% |
| Kinerja | Daftar < 3 detik (cache) | < 1.5 detik (cache) | < 1 detik (cache) |
| Pengguna | 100 | 500 | 2000 |

### 8.3 Mekanisme Pengukuran

- **Google Chrome Web Store Dashboard**: Jumlah pengguna, rating, ulasan.
- **Telemetri Opsional** (dengan izin): Menggunakan `chrome.storage.local` untuk menyimpan hitungan pemakaian anonim — jumlah file di-*preview*, di-*copy*, di-*drop*, dan di-*insert*.
- **Error Tracking**: Pantau frekuensi *error* API melalui *wrapper* yang mencatat ke `chrome.storage`.
- **Performance Budget**: *Test* otomatis menggunakan *Chrome DevTools* *Lighthouse* untuk ekstensi sebelum rilis.

---

## 9. Risk Assessment

### 9.1 Risk Register

| ID | Risiko | Probabilitas | Dampak | Skor | Mitigasi | Kontingensi |
|----|--------|-------------|--------|------|----------|-------------|
| R-001 | GitHub API *rate limit* tercapai (60 req/jam) | Sedang | Tinggi | Tinggi | Cache 10 menit, minimal panggilan API, *retry* dengan backoff | Tampilkan pesan "terkena *rate limit*, coba lagi nanti" |
| R-002 | Struktur repositori berubah (folder baru, rename) | Tinggi | Rendah | Sedang | Filter berbasis *path prefix* fleksibel; label folder dinamis dari API | Pembaruan cepat pada konfigurasi filter |
| R-003 | Repositori GitHub *down* atau *renamed* | Rendah | Tinggi | Sedang | *Error handling* di semua panggilan API; cache sebagai *fallback* | Tampilkan data *cache* lama dengan peringatan |
| R-004 | Perubahan Chrome Manifest V3 API | Rendah | Tinggi | Sedang | Pantau *breaking changes* di *Chromium Extensions blog*; gunakan *feature detection* | Rilis darurat dengan *polyfill* atau *workaround* |
| R-005 | Konten file terlalu besar (> 1 MB) | Rendah | Sedang | Rendah | Tampilkan ukuran file di daftar; *loading state* yang jelas | Batasi *fetch* konten untuk file > 1 MB (tampilkan peringatan) |
| R-006 | *Security issue* pada markdown renderer | Rendah | Tinggi | Sedang | HTML *escaping* sebelum *render*; tidak menggunakan `innerHTML` untuk konten yang tidak di-*sanitasi* | Audit keamanan; *update* segera jika ditemukan celah |
| R-007 | *Cross-browser compatibility* (Firefox/Safari) | Sedang | Sedang | Sedang | Gunakan *vanilla JS*; hindari API khusus Chrome jika ada alternatif | Buat *port* terpisah untuk Firefox (Manifest V2/V3 berbeda) |
| R-008 | Pengguna tidak paham fitur *variable editor* | Sedang | Sedang | Sedang | *Tooltip* dan *hint text* informatif; animasi *chip* saat pertama kali muncul | *Onboarding flow* sederhana (1-2 langkah) saat pertama buka |
| R-009 | Konflik dengan ekstensi lain | Rendah | Rendah | Rendah | *Namespace* unik untuk `chrome.storage` keys dan *content script guard* | *Debug mode* untuk diagnosa konflik |
| R-010 | Performa *lambat* pada repositori dengan 500+ file | Sedang | Rendah | Rendah | *Lazy rendering* daftar (*virtual scroll* dipertimbangkan); *debounce* pada pencarian | Optimasi *caching*; batasi *batch fetch* |

### 9.2 Matriks Risiko

```
Probabilitas
    ↑
 Tinggi  │         │  R-002   │         │
         │         │          │         │
 Sedang  │  R-009  │ R-001    │ R-003   │ R-006
         │ R-010   │ R-007    │ R-004   │
         │         │ R-008    │         │
 Rendah  │         │ R-005    │         │
         └────────┴──────────┴─────────┴──────→ Dampak
            Rendah    Sedang     Tinggi   Sangat Tinggi
```

---

## 10. Feature Roadmap

### Phase 1: MVP Stabil (v2.0.x — Saat Ini)

| Fitur | Status | Catatan |
|-------|--------|---------|
| Dual-repo browsing dengan tab | ✅ Selesai | PRD + Prompt Collection |
| Real-time search dengan alias expansion | ✅ Selesai | 4 alias bawaan |
| Markdown preview (Rendered + Raw) | ✅ Selesai | Renderer sederhana tanpa library |
| Variable detection dan editor | ✅ Selesai | Modal input variabel |
| Drag & drop dari daftar ke halaman web | ✅ Selesai | Prefetch + chrome.storage fallback |
| Copy to clipboard | ✅ Selesai | Feedback visual "✓" |
| Insert ke active element | ✅ Selesai | injectScript |
| Cache system (10 menit TTL) | ✅ Selesai | localStorage |
| Refresh dari GitHub | ✅ Selesai | Force refresh + cache invalidation |
| Content script drop handler | ✅ Selesai | Overlay visual |
| Dark theme (GitHub Dark) | ✅ Selesai | Palet warna konsisten |

### Phase 2: Experience Enhancement (v2.1.x — 3 Bulan)

| Fitur | Prioritas | Estimasi |
|-------|-----------|----------|
| **Recent Files** — tab atau bagian yang menampilkan 5-10 file terakhir di-*preview* | P1 | 1 minggu |
| **Favorites** — tombol bintang di item file untuk menandai favorit, disimpan di `chrome.storage.sync` | P1 | 1 minggu |
| **Similarity Search** — pencarian dengan *fuzzy matching* dan *scoring* | P1 | 2 minggu |
| **Improved Markdown Renderer** — tabel yang lebih baik, *syntax highlighting* untuk *code block* | P2 | 1 minggu |
| **Tooltip** pada tombol aksi | P2 | 2 hari |
| **Keyboard Shortcut** — `Ctrl+Shift+B` untuk membuka popup (jika Chrome mengizinkan *commands* API untuk *action popup*) | P2 | 1 minggu |
| **Optimasi Virtual Scroll** untuk repositori 500+ file | P2 | 2 minggu |

### Phase 3: Advanced Features (v2.2.x — 6 Bulan)

| Fitur | Prioritas | Estimasi |
|-------|-----------|----------|
| **Custom Search Aliases** — pengguna dapat menambah/mengedit *alias* sendiri di halaman *options* | P2 | 1 minggu |
| **Export dengan Format** — salin sebagai *plain text* atau *markdown* dengan format variabel terisi | P2 | 3 hari |
| **Statistics Dashboard** — hitungan pemakaian (file di-*drop*, di-*preview*, di-*copy*) | P3 | 1 minggu |
| **Options Page** — halaman *settings* untuk konfigurasi *alias*, *default values* variabel, tema | P3 | 2 minggu |
| **Variable Default Values** — pengguna bisa set *default* untuk variabel tertentu | P3 | 3 hari |
| **Animasi Transisi** — transisi halus antara list dan preview, *chip* variabel masuk dengan animasi | P3 | 3 hari |
| **Multi-language Support** — file `_locales` untuk Inggris dan Indonesia | P3 | 1 minggu |
| **Export ke Notion/Google Docs** — integrasi dengan API Notion/Google Docs | P3 | 2 minggu |
| **AI-predict Variables** — saran nilai variabel berdasarkan konteks (LLM suggestion) | P3 | Riset |

### Future Considerations (Post-v3)

- **GitHub OAuth** untuk repositori pribadi.
- **Sync across devices** menggunakan `chrome.storage.sync`.
- **Snippet share** — bagikan *snippet* prompt dengan rekan tim.
- **LLM Integration** — kirim prompt langsung ke Claude/ChatGPT dengan satu klik.
- **Chrome Side Panel** (Manifest V3) untuk pengalaman yang lebih *immersive*.

---

## 11. Glossary

| Istilah | Definisi |
|---------|----------|
| **blinker** | Nama ekstensi Chrome; dari *blink* (kedip cepat) + *connector* (penghubung) — alat cepat yang menghubungkan pengguna dengan konten prompt. |
| **Cache** | Mekanisme penyimpanan sementara data di `localStorage` untuk menghindari pemanggilan API berulang. blinker menggunakan TTL 10 menit. |
| **Content Script** | Skrip (`content.js`) yang di-*inject* ke halaman web untuk mendeteksi target *drop* dan menangani peristiwa *drag-and-drop*. |
| **Chrome Storage** | API penyimpanan Chrome (`chrome.storage.local` dan `chrome.storage.sync`). blinker menggunakan `local` untuk transfer konten *drag* dan `sync` (masa depan) untuk preferensi. |
| **Dual-Repo** | Kemampuan blinker untuk mengakses dua repositori GitHub sekaligus: PRD Prompt Collection dan Prompt Collection. |
| **Drag & Drop** | Fitur untuk menyeret file dari daftar popup dan menjatuhkannya ke elemen *input* atau *textarea* di halaman web. |
| **GitHub Tree API** | API GitHub yang mengembalikan struktur direktori repositori secara rekursif. |
| **Manifest V3** | Versi ketiga dari spesifikasi *Chrome Extension manifest* — arsitektur berbasis *service worker* dengan keamanan yang lebih ketat. |
| **mdown-dropper** | Nama sebelumnya dari blinker (versi 1.x). |
| **Modal** | Jendela dialog overlay yang muncul di tengah popup untuk mengedit nilai variabel. |
| **Popup** | Jendela kecil yang muncul saat mengklik ikon ekstensi di *toolbar* Chrome. blinker menggunakan ukuran 400x600 px. |
| **PRD** | *Product Requirements Document* — dokumen yang menjelaskan kebutuhan dan spesifikasi produk. |
| **Prefetch** | Teknik mengambil data sebelum benar-benar dibutuhkan. blinker melakukan *prefetch* konten file saat *hover* untuk mengantisipasi *drag*. |
| **Prompt** | Instruksi atau *input* yang diberikan kepada sistem AI untuk menghasilkan respons tertentu. |
| **Prompt Collection** | Repositori (`ai-builders-id/mdown-collection`) yang berisi kumpulan *prompt* berkualitas dan *engineering standards*. |
| **PRD Prompt Collection** | Repositori (`ai-builders-id/prd-prompt-collection`) yang berisi template dan contoh PRD siap pakai. |
| **Rendered View** | Tampilan *preview* di mana markdown diubah menjadi HTML dengan format yang mudah dibaca. |
| **Raw View** | Tampilan *preview* di mana kode sumber markdown (dengan *escaping*) ditampilkan apa adanya. |
| **TTL (Time-To-Live)** | Waktu hidup data dalam *cache* sebelum dianggap kedaluwarsa. blinker menggunakan 10 menit. |
| **Variable** | Tempat penampung nilai yang ditandai dengan `{{NAMA_VARIABEL}}` di dalam file markdown. Variabel memungkinkan kustomisasi template tanpa mengedit file asli. |
| **Variable Chip** | Elemen UI berbentuk *chip* berwarna yang mewakili satu variabel. Klik *chip* akan membuka editor variabel. |
| **Variable Editor** | Fitur untuk mendeteksi, menampilkan, dan mengedit nilai `{{VARIABLE}}` dalam file markdown. |

---

## Document History

| Versi | Tanggal | Perubahan | Penulis |
|-------|---------|-----------|---------|
| 1.0 | 2026-06-24 | Dokumen awal — PRD komprehensif untuk blinker v2.0.0 | Cloud Dark |

---

*Dokumen ini adalah dokumen hidup (*living document*) yang akan diperbarui seiring perkembangan produk. Semua *stakeholder* dipersilakan memberikan masukan melalui *pull request* atau *issue* di repositori.*
