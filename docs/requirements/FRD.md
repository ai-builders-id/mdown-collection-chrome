# FRD — Functional Requirements Document

## blinker — Chrome Extension MV3

| **Dokumen** | Functional Requirements Document |
|---|---|
| **Proyek** | blinker |
| **Versi** | 2.0.0 |
| **Tanggal** | 2026-06-24 |
| **Status** | Draft |
| **Penulis** | Cloud Dark |

---

## Daftar Isi

1. [Pendahuluan](#1-pendahuluan)
2. [Functional Modules](#2-functional-modules)
3. [System Architecture](#3-system-architecture)
4. [Detailed Feature Specs](#4-detailed-feature-specs)
5. [Data Dictionary](#5-data-dictionary)
6. [API Contracts](#6-api-contracts)
7. [State Management](#7-state-management)
8. [Error Handling](#8-error-handling)
9. [Event Flow Diagrams](#9-event-flow-diagrams)
10. [UI Component Specs](#10-ui-component-specs)

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen

Dokumen ini menjelaskan secara detail kebutuhan fungsional dari ekstensi Chrome **blinker** (sebelumnya bernama mdown-dropper). FRD ini menjadi acuan bagi pengembang, penguji, dan pemangku kepentingan untuk memahami bagaimana setiap fitur bekerja, bagaimana data mengalir antar komponen, dan bagaimana sistem merespons berbagai skenario penggunaan.

### 1.2 Ringkasan Produk

blinker adalah ekstensi Chrome Manifest V3 yang memungkinkan pengguna menjelajahi, mencari, mempratinjau, dan menyisipkan file markdown dari repositori GitHub langsung ke halaman web mana pun. Ekstensi ini mendukung dua repositori: **PRD Prompt Collection** (template Product Requirements Document) dan **Prompt Collection** (kumpulan prompt AI/engineering). Fitur unggulannya meliputi variable editor yang mendeteksi `{{VARIABLE}}` secara otomatis, preview markdown rendered/raw, drag-and-drop ke elemen halaman, dan penyisipan satu-klik ke field aktif.

### 1.3 Target Pengguna

- **AI Engineer / Prompt Engineer**: Menggunakan dan mengelola koleksi prompt untuk berbagai kasus penggunaan.
- **Product Manager**: Mengakses template PRD untuk menyusun dokumen persyaratan produk.
- **Software Engineer**: Menggunakan engineering standards dan template minimal untuk dokumentasi teknis.
- **Power User Chrome**: Siapa pun yang sering bekerja dengan markdown dan ingin akses cepat dari browser.

### 1.4 Batasan Sistem

- Berjalan sebagai ekstensi Chrome MV3 — tidak ada backend server.
- Komunikasi dengan GitHub API untuk mengambil daftar file dan konten.
- Penyimpanan lokal menggunakan `chrome.storage.local` dan `localStorage`.
- Popup terbatas pada ukuran 400x600 piksel.
- Content script di-inject ke semua halaman (`<all_urls>`).

---

## 2. Functional Modules

### 2.1 Modul Repository Manager

**Deskripsi**: Modul ini mengelola koneksi dan konfigurasi ke repositori GitHub. Berisi definisi dua repositori yang di-hardcode (PRD Prompt Collection dan Prompt Collection), termasuk owner, nama repo, filter file, dan URL. Menyediakan fungsi untuk mengambil daftar file dari GitHub API dengan caching di localStorage.

**Tanggung Jawab**:
- Menyimpan konfigurasi repositori (owner, repo, label, filter, githubUrl).
- Mengambil file tree dari GitHub Git Trees API dengan depth recursive.
- Memfilter file berdasarkan jenis (blob) dan ekstensi (.md, .json).
- Menyediakan mekanisme cache 10 menit di localStorage.
- Mendukung refresh paksa (force fetch) melalui tombol refresh.

**Input**: `repoKey` ('prd' | 'mdown'), `force` (boolean).
**Output**: Array objek `{ path: string, size: number }`.

### 2.2 Modul File Browser

**Deskripsi**: Modul ini menampilkan daftar file yang diambil dari repositori dalam tampilan terstruktur dan dapat dicari. File dikelompokkan berdasarkan folder (root, standards, minimal) dan dapat difilter secara real-time melalui input pencarian.

**Tanggung Jawab**:
- Mengelompokkan file berdasarkan path folder.
- Menampilkan label seksi per folder.
- Menampilkan setiap file dengan ikon, nomor urut (jika ada prefix angka), dan nama yang sudah dibersihkan.
- Menyediakan input pencarian dengan dukungan alias (cs -> customer support, prd -> product requirements, dll).
- Menampilkan jumlah total file di footer.
- Menyediakan tautan ke repositori GitHub di footer.

**State**: loading, error, empty (no results), normal.

### 2.3 Modul Preview System

**Deskripsi**: Modul untuk melihat isi file markdown dalam dua mode: Rendered (HTML yang sudah dirender) dan Raw (teks mentah dengan syntax highlighting). Preview menampilkan variabel yang ditemukan dan memungkinkan pengguna mengisi nilainya.

**Tanggung Jawab**:
- Mengambil konten file dari raw.githubusercontent.com.
- Merender markdown ke HTML dengan parser sederhana (tanpa library eksternal).
- Menampilkan tab Rendered dan Raw.
- Mendeteksi variabel `{{VAR_NAME}}` dalam konten.
- Menampilkan variable chips di vars bar untuk setiap variabel yang ditemukan.
- Menyorot variabel yang belum diisi di preview.
- Menampilkan variabel yang sudah diisi dengan nilai aktual.

**State**: loading, error, normal (rendered), normal (raw).

### 2.4 Modul Variable Editor

**Deskripsi**: Modul yang memungkinkan pengguna mengisi nilai untuk placeholder `{{VAR_NAME}}` yang ditemukan dalam konten file. Variabel diidentifikasi dengan pola `{{[A-Z0-9_]+}}` dan dapat diedit melalui modal dialog atau klik langsung pada highlight di preview.

**Tanggung Jawab**:
- Mengekstrak nama variabel dari teks menggunakan regex `/\{\{([A-Z0-9_]+)\}\}/g`.
- Menampilkan chip berwarna di vars bar (setiap chip mewakili satu variabel).
- Membuka modal editor saat chip atau highlight diklik.
- Menerapkan nilai variabel ke konten (replace all occurrences).
- Menyimpan nilai variabel di memori (objek `varValues`) selama sesi preview.
- Render ulang preview setiap kali nilai variabel berubah.

**Interaksi**:
- Klik chip variabel -> buka modal.
- Klik `{{VAR}}` highlight di preview -> buka modal.
- Isi input -> klik "Terapkan" atau tekan Enter -> nilai tersimpan, preview dirender ulang.
- Tekan Escape -> modal tertutup tanpa perubahan.

### 2.5 Modul Content Insertion

**Deskripsi**: Modul yang menyediakan tiga mekanisme untuk memasukkan konten ke halaman web: drag-and-drop dari list, drag-and-drop dari preview, copy ke clipboard, dan insert langsung ke field aktif.

**Tanggung Jawab**:
- **Drag from list**: Menyediakan data transfer via `e.dataTransfer.setData('text/plain', content)` dan juga menyimpan ke `chrome.storage.local` untuk fallback asynchronous.
- **Drag from preview**: Sama dengan drag dari list, tetapi konten sudah termasuk nilai variabel yang sudah diisi.
- **Copy**: Menyalin konten (dengan variabel terisi) ke clipboard via `navigator.clipboard.writeText()`.
- **Insert to Web**: Mengirim konten ke halaman aktif via `chrome.scripting.executeScript`, menyisipkan teks ke elemen aktif (textarea, input, contentEditable).

**Precautions**:
- Fallback async jika konten belum siap saat drag start (masih loading).
- Flash hijau pada elemen setelah insert sebagai konfirmasi visual.
- Validasi elemen target sebelum insert.

### 2.6 Modul Content Script

**Deskripsi**: Script yang di-inject ke semua halaman (`<all_urls>`) untuk menangani drop event dari popup ekstensi. Menyediakan overlay visual saat drag di atas target yang valid, dan menyisipkan teks ke elemen saat drop terjadi.

**Tanggung Jawab**:
- Deteksi elemen target yang valid (textarea, input[text/search/url/email], contentEditable).
- Menampilkan overlay dashed border pada elemen target saat drag over.
- Menangani drop event: priority pertama dari `dataTransfer.getData('text/plain')`, fallback ke `chrome.storage.local`.
- Menyisipkan teks ke elemen target dengan benar (textarea/input vs contentEditable).
- Flash konfirmasi hijau setelah insert berhasil.
- Singleton pattern agar tidak double-inject.

**Event Handlers**:
- `dragover` (capture phase): deteksi target valid, prevent default, tampilkan overlay.
- `dragleave` (capture phase): hapus overlay jika benar-benar meninggalkan target.
- `drop` (capture phase): tangkap konten, sisipkan ke elemen, hapus overlay.

---

## 3. System Architecture

### 3.1 Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   Chrome Extension (MV3)                      │
│                                                               │
│  ┌──────────────────────┐      ┌──────────────────────────┐  │
│  │     popup.html        │      │      content.js           │  │
│  │     (400x600)         │      │  (injected <all_urls>)    │  │
│  │                       │      │                           │  │
│  │  ┌─────────────────┐  │      │  ┌─────────────────────┐  │  │
│  │  │ Repository       │  │      │  │ Drop Handler        │  │  │
│  │  │ Manager          │  │      │  │ - dragover          │  │  │
│  │  │ - fetchFileList  │  │      │  │ - dragleave         │  │  │
│  │  │ - fetchContent   │  │      │  │ - drop              │  │  │
│  │  └────────┬────────┘  │      │  │ - insertText         │  │  │
│  │           │            │      │  │ - overlay UI         │  │  │
│  │  ┌────────▼────────┐  │      │  └─────────────────────┘  │  │
│  │  │ File Browser     │  │      └──────────────────────────┘  │
│  │  │ - renderList     │  │              │                      │
│  │  │ - search/filter  │  │              │ chrome.storage.local │
│  │  │ - group files    │  │              ▼                      │
│  │  └────────┬────────┘  │      ┌──────────────────────────┐  │
│  │           │            │      │   chrome.storage.local    │  │
│  │  ┌────────▼────────┐  │      │   (data transfer bridge)  │  │
│  │  │ Preview System   │  │      │                           │  │
│  │  │ - Markdown       │  │      │  mdown_drag_content       │  │
│  │  │   Renderer       │  │      │  mdown_drag_ready         │  │
│  │  │ - Variable       │  │      │  mdown_drag_path          │  │
│  │  │   Editor         │  │      └──────────────────────────┘  │
│  │  │ - Tab Rendered   │  │                                     │
│  │  │ - Tab Raw        │  │                                     │
│  │  └────────┬────────┘  │                                     │
│  │           │            │                                     │
│  │  ┌────────▼────────┐  │                                     │
│  │  │ Content Insertion│  │                                     │
│  │  │ - Drag & Drop   │  │                                     │
│  │  │ - Copy to       │  │                                     │
│  │  │   Clipboard     │  │                                     │
│  │  │ - Insert ke Web │  │                                     │
│  │  └─────────────────┘  │                                     │
│  └──────────────────────┘                                      │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Data Flow

#### Flow A: Inisialisasi dan Load Daftar File

```
User klik icon extension
  -> popup.html dimuat
    -> popup.js inisialisasi state
      -> loadRepo('prd') dipanggil
        -> Cek localStorage cache (key: mdown_v3_prd)
          |-- [CACHE HIT, < 10 menit] -> Gunakan file list dari cache
          |-- [CACHE MISS/EXPIRED] -> fetch GitHub API
              -> GET https://api.github.com/repos/ai-builders-id/prd-prompt-collection/git/trees/main?recursive=1
              -> Filter response: hanya blob, .md, bukan README.md
              -> Simpan ke localStorage
              -> Kembalikan array file
        -> renderList(files):
          -> Kelompokkan file berdasarkan folder
          -> Generate HTML untuk setiap group + file
          -> Inject ke #listScroll
```

#### Flow B: Preview File

```
User klik tombol 👁 pada file item
  -> openPreview(repoKey, path) dipanggil
    -> Simpan currentPath, currentRepo
    -> Reset varValues = {}
    -> Switch view: viewList -> viewPreview
    -> Tampilkan spinner loading
    -> fetchContent(repoKey, path):
      -> GET https://raw.githubusercontent.com/{owner}/{repo}/main/{path}
      -> Kembalikan teks konten
    -> renderPreview():
      -> extractVars(rawContent) -> cari semua {{VAR_NAME}}
      -> Tampilkan vars bar jika ada variabel
      -> applyVars(rawContent) -> replace variabel dengan nilai
      -> [Tab Rendered]: render markdown ke HTML
      -> [Tab Raw]: escape HTML, highlight variabel
      -> Attach event listener pada semua [data-var] element
```

#### Flow C: Variable Editing

```
User klik chip variabel di vars bar
  -> openVarModal(varName):
    -> Set editingVar = varName
    -> Tampilkan modal dengan input berisi nilai saat ini (atau kosong)
    -> Focus input

User klik "Terapkan" atau tekan Enter
  -> Ambil nilai dari vmInput.value.trim()
  -> Simpan ke varValues[editingVar] = nilai
  -> Tutup modal
  -> renderPreview() -> semua {{VAR}} diganti dengan nilai
```

#### Flow D: Drag and Drop (dari list)

```
User mulai drag file item
  -> dragstart event:
    -> Cek contentCache[key] untuk konten yang sudah di-prefetch
      |-- [CACHED] -> Set dataTransfer.setData('text/plain', cached)
                    -> Set chrome.storage.local dengan konten
      |-- [NOT CACHED] -> Set placeholder '{{LOADING:path}}'
                       -> Fetch konten async
                       -> Set chrome.storage.local saat selesai

User drag di atas textarea di halaman web
  -> content.js dragover handler:
    -> Deteksi target valid
    -> Tampilkan overlay dashed border
    -> Set dropEffect = 'copy'

User drop konten
  -> content.js drop handler:
    -> Cek dataTransfer.getData('text/plain')
      |-- [Real content] -> insertText(target, content) langsung
      |-- [Placeholder/falsy] -> chrome.storage.local.get()
          -> insertText(target, content) dari storage
    -> Hapus overlay
    -> Flash hijau pada target
```

#### Flow E: Insert ke Web

```
User klik "⬇ Insert ke Web" di preview footer
  -> Ambil konten final = applyVars(rawContent)
  -> chrome.tabs.query({ active: true, currentWindow: true })
    -> Dapatkan tabId tab aktif
    -> chrome.scripting.executeScript:
      -> func(content) di-inject ke halaman
      -> Dapatkan document.activeElement
      -> Jika TEXTAREA/INPUT:
        -> Insert teks di posisi kursor (selectionStart/End)
        -> Dispatch event 'input' dan 'change'
      -> Jika contentEditable:
        -> Gunakan document.execCommand('insertText')
      -> Jika bukan keduanya:
        -> Tampilkan alert: "Klik dulu field yang ingin diisi."
```

### 3.3 Storage Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                      STORAGE LAYER                               │
│                                                                   │
│  localStorage (Browser)           chrome.storage.local            │
│  ────────────────────────         ────────────────────────        │
│  mdown_v3_prd:                    mdown_drag_content: string      │
│    { ts: timestamp,               mdown_drag_ready: boolean       │
│      files: [{path,size}] }       mdown_drag_path: string         │
│                                                                   │
│  mdown_v3_mdown:                  Digunakan untuk:                │
│    { ts: timestamp,               - Transfer data async           │
│      files: [{path,size}] }        antara popup.js dan            │
│                                    content.js saat drag           │
│  Digunakan untuk:                - Lifecycle: di-set saat          │
│  - Cache daftar file              drag start, di-read saat         │
│  - TTL: 10 menit                  drop, di-remove setelah          │
│  - Key prefix: mdown_v3_          digunakan                       │
│                                                                   │
│  In-Memory (JavaScript Runtime)                                   │
│  ────────────────────────                                         │
│  allFiles: Array           Filtered file list                     │
│  filtered: Array           Hasil pencarian                        │
│  currentPath: string       Path file yang di-preview              │
│  currentRepo: string       Repo key dari file di-preview          │
│  rawContent: string        Konten mentah file di-preview          │
│  varValues: Object         Nilai variabel { NAMA: "value" }      │
│  activeTab: string         'rendered' | 'raw'                     │
│  contentCache: Map         Prefetch cache {key: content}          │
│  editingVar: string|null   Variabel yang sedang diedit            │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Detailed Feature Specs

### 4.1 Repo Management

#### 4.1.1 Konfigurasi Repositori

Dua repositori dikonfigurasi secara hardcode dalam objek `REPOS`:

| Key | Owner | Repo | Label | Filter | GitHub URL |
|---|---|---|---|---|---|
| `prd` | `ai-builders-id` | `prd-prompt-collection` | PRD Prompt | blob, `.md`, bukan README.md | `https://github.com/ai-builders-id/prd-prompt-collection` |
| `mdown` | `ai-builders-id` | `mdown-collection` | Prompt Collection | blob, `.md` atau `.json`, bukan dari folder `assets/` | `https://github.com/ai-builders-id/mdown-collection` |

#### 4.1.2 Mekanisme Cache

- **Tipe**: localStorage dengan key `mdown_v3_{repoKey}`.
- **Struktur**: `{ ts: number, files: Array<{path: string, size: number}> }`.
- **TTL**: 10 menit (dicek dengan `Date.now() - cached.ts < CACHE_TTL`).
- **Invalidasi Manual**: Tombol refresh (↻) di header menghapus cache key untuk repo aktif, lalu memanggil `loadRepo(key, true)`.
- **Fallback**: Jika localStorage gagal di-parse, dianggap cache miss.

#### 4.1.3 GitHub API Endpoint

- **URL**: `GET https://api.github.com/repos/{owner}/{repo}/git/trees/main?recursive=1`
- **Headers**: `Accept: application/vnd.github+json`
- **Parsing**: Ambil `data.tree`, filter dengan `cfg.filter`.
- **Rate Limit**: Tergantung rate limit GitHub API (60 req/jam untuk unauthenticated, 5000 req/jam untuk authenticated). Cache 10 menit mengurangi frekuensi fetch.

### 4.2 File Browser

#### 4.2.1 Grouping dan Label

File dikelompokkan berdasarkan folder (path tanpa filename). Label ditentukan oleh fungsi `getFolderLabel`:

| Folder Key | Label untuk PRD | Label untuk Mdown |
|---|---|---|
| `""` (root) | PRD Collection | Root |
| `"standards"` | Engineering Standards | Engineering Standards |
| `"minimal"` | Minimal Templates | Minimal Templates |
| Lainnya | Nama folder | Nama folder |

#### 4.2.2 Display Name

Nama file yang ditampilkan diproses melalui beberapa fungsi:

1. `getDisplayName(path)`: Ambil filename, hapus ekstensi `.md`/`.json`, replace `_` dengan spasi.
2. `getNumberPrefix(path)`: Deteksi prefix angka diawal filename (`/^\d+[_-]/`).
3. `getNameWithoutNumber(path)`: Hapus prefix angka dan replace underscore.

Contoh:
- `01_PR_Dokumentasi_API.md` -> Prefix: `01`, Nama: `PR Dokumentasi API`
- `standards/architectural_decisions.md` -> Prefix: null, Nama: `architectural decisions`

#### 4.2.3 Ikon File

Ikon ditentukan oleh `getFileIcon(path, repoKey)`:

| Kondisi | Ikon |
|---|---|
| Ekstensi `.json` | `{}` |
| PRD repo, path mengandung "template" | `📐` |
| PRD repo, lainnya | `📋` |
| Mdown repo, path mulai `standards/` | `📐` |
| Mdown repo, path mulai `minimal/` | `🗂️` |
| Mdown repo, lainnya | `📄` |

#### 4.2.4 Pencarian

- **Input**: Search box dengan placeholder "Cari file...".
- **Filter**: Case-insensitive, cocokkan query dengan path file.
- **Alias**: Query pendek diperluas:
  - `cs` -> `customer support`
  - `prd` -> `product requirements`
  - `qa` -> `quality assurance`
  - `api` -> `application programming interface`
- **Edge Case**: Query kosong mengembalikan semua file.
- **Hasil**: Langsung dirender ulang (real-time, setiap input event).

### 4.3 Preview System

#### 4.3.1 Markdown Renderer

Parser markdown kustom (tanpa library) dengan dukungan:

| Elemen | Sintaks | Output HTML |
|---|---|---|
| Heading 1 | `# Teks` | `<h1>Teks</h1>` |
| Heading 2 | `## Teks` | `<h2>Teks</h2>` |
| Heading 3 | `### Teks` | `<h3>Teks</h3>` |
| Bold | `**teks**` | `<strong>teks</strong>` |
| Italic | `*teks*` | `<em>teks</em>` |
| Bold+Italic | `***teks***` | `<strong><em>teks</em></strong>` |
| Inline Code | `` `teks` `` | `<code>teks</code>` |
| Code Block | ```` ``` ``` ```` | `<pre><code>...</code></pre>` |
| Blockquote | `> teks` | `<blockquote>teks</blockquote>` |
| Link | `[text](url)` | `<a href="url">text</a>` |
| List | `- item` / `1. item` | `<ul><li>item</li></ul>` |
| Table | `\| col1 \| col2 \|` | `<table><tr><td>...</td></tr></table>` |
| Horizontal Rule | `---` | `<hr/>` |
| Paragraf | Teks biasa | `<p>teks</p>` |

**Keterbatasan**: Parser ini adalah implementasi sederhana dengan regex. Tidak mendukung nested list, mixed formatting, atau markdown kompleks. Cukup untuk dokumen prompt dan template.

#### 4.3.2 Variable Detection

- **Pola regex**: `/\{\{([A-Z0-9_]+)\}\}/g`
- **Case-sensitive**: Hanya huruf kapital, angka, dan underscore.
- **Deduplikasi**: `new Set()` untuk menghilangkan duplikat.
- **Tampilan**: Setiap variabel unik mendapat chip di vars bar dan highlight di konten.
- **Color cycling**: 6 warna berbeda untuk chip dan highlight, diterapkan dengan CSS `nth-child(6n+1)` hingga `nth-child(6n+6)`.

#### 4.3.3 Tab Switching

- **Rendered**: Konten setelah variable substitution dirender sebagai HTML. Variabel yang belum diisi tetap tampil sebagai `{{VAR}}` dengan styling highlight.
- **Raw**: Konten mentah (seperti dari GitHub) dengan HTML entities yang di-escape. Variabel di-highlight dengan warna yang bisa diklik. Tidak ada substitusi variabel di raw view.

### 4.4 Variable Editor

#### 4.4.1 Modal Editor

- **Trigger**: Klik pada chip variabel di vars bar, atau klik pada highlight `{{VAR}}` di konten preview.
- **Tampilan**: Modal overlay dengan background semi-transparan. Box berisi:
  - Label "Edit variable"
  - Nama variabel (monospace, warna oranye)
  - Input teks dengan nilai saat ini (atau kosong)
  - Tombol "Batal" dan "Terapkan"
- **Interaksi**:
  - Enter -> Terapkan dan tutup modal.
  - Escape -> Tutup modal tanpa perubahan.
  - Klik di luar modal -> Tutup modal tanpa perubahan.
  - Focus otomatis ke input saat modal terbuka.

#### 4.4.2 Variable Application

- `applyVars(text)`: Iterasi semua entry di `varValues`, lakukan `replaceAll` untuk setiap `{{KEY}}` dengan nilai yang disimpan.
- Nilai kosong (empty string) tidak akan me-replace apapun (hanya jika nilai truthy).
- Setelah variabel diterapkan, preview di-render ulang secara penuh.

### 4.5 Content Insertion

#### 4.5.1 Drag-and-Drop (dari List)

| Langkah | Detail |
|---|---|
| **Hover** | Prefetch konten file via `prefetchContent()` ke contentCache Map |
| **Pointer Down** | Prefetch konten lagi sebagai fallback |
| **Drag Start** | Cek contentCache: jika ada -> set dataTransfer + chrome.storage. Jika tidak -> set placeholder + fetch async |
| **Drag End** | Hapus class 'dragging' dari item |

**Prefetch Strategy**: Konten di-fetch saat mouse hover atau pointer down pada file item. Ini memastikan konten biasanya sudah siap saat drag benar-benar dimulai.

#### 4.5.2 Drag-and-Drop (dari Preview)

- Tombol "⠿ Drag" di preview footer adalah elemen `draggable="true"`.
- `dragstart` langsung menyiapkan konten final (dengan variabel terisi).
- Tidak memerlukan prefetch karena konten sudah dimuat.

#### 4.5.3 Copy ke Clipboard

- Tombol "📋 Copy" menyalin konten final ke clipboard.
- Feedback: teks tombol berubah menjadi "✓ Copied!" selama 1,5 detik.
- Error handling: jika clipboard write gagal, error di-catch (silent fail).

#### 4.5.4 Insert ke Web

- Menggunakan `chrome.tabs.query` untuk mendapatkan tab aktif.
- Inject fungsi via `chrome.scripting.executeScript` dengan argumen konten.
- Fungsi yang di-inject:
  - Ambil `document.activeElement`.
  - Jika TEXTAREA atau INPUT: insert di posisi kursor, dispatch event `input` dan `change`.
  - Jika contentEditable: gunakan `document.execCommand('insertText')`.
  - Jika tidak valid: tampilkan alert.

### 4.6 Content Script

#### 4.6.1 Target Detection

Fungsi `isDropTarget(el)` mengembalikan true jika:
- `el.tagName === 'TEXTAREA'`
- `el.tagName === 'INPUT'` dengan type `text`, `search`, `url`, atau `email`
- `el.isContentEditable === true`

#### 4.6.2 Drop Overlay

Overlay visual yang ditampilkan saat drag di atas target valid:
- Posisi: fixed, mengikuti bounding rect elemen target.
- Style: dashed border 2px biru (`#58a6ff`), background biru transparan, label "📄 Drop markdown here".
- Pointer events: none (tidak mengganggu interaksi).
- Z-index: maksimum (`2147483647`).

#### 4.6.3 Insert Text Logic

```
Fungsi insertText(el, content):
  Jika TEXTAREA atau INPUT:
    - Simpan selectionStart dan selectionEnd
    - Potong value: sebelum selection + content + setelah selection
    - Atur selectionStart = selectionEnd = posisi setelah content
    - Dispatch event 'input' (bubbles: true)
    - Dispatch event 'change' (bubbles: true)

  Jika contentEditable:
    - Dapatkan Selection API
    - Hapus konten yang dipilih (jika ada)
    - Buat text node dengan content
    - Insert node di posisi range
    - Set range setelah text node
    - Dispatch InputEvent 'input' (bubbles: true)

  Flash konfirmasi:
    - Set outline = '2px solid #3fb950'
    - Setelah 700ms, kembalikan outline ke nilai sebelumnya
```

#### 4.6.4 Content Transfer Priority

1. **Priority 1 (Sync)**: `dataTransfer.getData('text/plain')` jika konten real dan bukan placeholder `{{LOADING:...}}`.
2. **Priority 2 (Async)**: `chrome.storage.local.get(['mdown_drag_content', 'mdown_drag_ready'])` jika data transfer tidak mengandung konten real.
3. **Cleanup**: Setelah konten diambil dari storage, hapus keys `mdown_drag_content`, `mdown_drag_ready`, `mdown_drag_path`.

---

## 5. Data Dictionary

### 5.1 Konfigurasi Repositori

| Field | Tipe | Deskripsi | Contoh |
|---|---|---|---|
| `owner` | `string` | Nama owner/organisasi GitHub | `"ai-builders-id"` |
| `repo` | `string` | Nama repositori | `"prd-prompt-collection"` |
| `label` | `string` | Label tampilan untuk tab | `"PRD Prompt"` |
| `icon` | `string` | Emoji untuk tab | `"📋"` |
| `color` | `string` | Warna aksen (CSS hex) | `"#3fb950"` |
| `filter` | `function` | Fungsi filter untuk file tree items | `item => item.type === 'blob' && ...` |
| `githubUrl` | `string` | URL halaman repositori | `"https://github.com/ai-builders-id/..."` |

### 5.2 File Object (dari GitHub API)

| Field | Tipe | Deskripsi | Contoh |
|---|---|---|---|
| `path` | `string` | Path file dalam repositori | `"standards/architectural_decisions.md"` |
| `size` | `number` | Ukuran file dalam bytes | `2048` |
| `type` | `string` | Tipe Git object (dari API) | `"blob"` |

### 5.3 Cache Entry (localStorage)

| Field | Tipe | Deskripsi |
|---|---|---|
| `ts` | `number` | Timestamp cache dibuat (`Date.now()`) |
| `files` | `Array<{path, size}>` | Daftar file yang sudah difilter |

### 5.4 State Variables (In-Memory)

| Variabel | Tipe | Default | Deskripsi |
|---|---|---|---|
| `activeRepo` | `'prd' \| 'mdown'` | `'prd'` | Repositori yang aktif |
| `allFiles` | `Array<{path, size}>` | `[]` | Semua file dari repo aktif |
| `filtered` | `Array<{path, size}>` | `[]` | File setelah difilter pencarian |
| `currentPath` | `string \| null` | `null` | Path file yang sedang di-preview |
| `currentRepo` | `string \| null` | `null` | Repo key file yang di-preview |
| `rawContent` | `string` | `''` | Konten mentah file preview |
| `varValues` | `Record<string, string>` | `{}` | Nilai variabel yang sudah diisi |
| `activeTab` | `'rendered' \| 'raw'` | `'rendered'` | Tab preview aktif |
| `editingVar` | `string \| null` | `null` | Variabel yang sedang diedit di modal |

### 5.5 chrome.storage.local (Data Transfer Bridge)

| Key | Tipe | Deskripsi | Lifecycle |
|---|---|---|---|
| `mdown_drag_content` | `string` | Konten file yang akan di-drop | Set saat drag start, remove setelah drop |
| `mdown_drag_ready` | `boolean` | Flag bahwa konten sudah siap | Set true setelah konten tersimpan |
| `mdown_drag_path` | `string` | Path file yang di-drag (debugging) | Opsional, di-set bersama content |

### 5.6 DOM State Indicators

| Elemen | Class | Makna |
|---|---|---|
| `.repo-tab` | `.active` | Tab repositori sedang aktif |
| `.view` | `.active` | View (list/preview) sedang ditampilkan |
| `.preview-tab` | `.active` | Tab (rendered/raw) sedang aktif |
| `.vars-bar` | `.has-vars` | File memiliki variabel yang bisa diedit |
| `.file-item` | `.dragging` | Item sedang di-drag |
| `.row-btn` | `.copied` | Tombol copy menunjukkan status berhasil |
| `.var-modal` | `.open` | Modal editor variabel terbuka |

---

## 6. API Contracts

### 6.1 GitHub Git Trees API

**Endpoint**:
```
GET https://api.github.com/repos/{owner}/{repo}/git/trees/main?recursive=1
```

**Headers**:
```
Accept: application/vnd.github+json
```

**Response (Success 200)**:
```json
{
  "sha": "abc123",
  "url": "https://api.github.com/repos/.../git/trees/abc123",
  "tree": [
    {
      "path": "01_PR_Dokumentasi_API.md",
      "mode": "100644",
      "type": "blob",
      "size": 2048,
      "url": "https://api.github.com/repos/.../git/blobs/def456"
    },
    {
      "path": "standards/",
      "mode": "040000",
      "type": "tree",
      "size": 0,
      "url": "https://api.github.com/repos/.../git/trees/ghi789"
    }
  ],
  "truncated": false
}
```

**Response (Error)**:
```json
{
  "message": "Not Found",
  "documentation_url": "https://docs.github.com/rest/git/trees#get-a-tree"
}
```

**Error Codes**:
| Status | Penyebab |
|---|---|
| 301 | Repositori dipindahkan (permanent redirect) |
| 403 | Rate limit tercapai atau repositori private |
| 404 | Repositori atau branch tidak ditemukan |
| 409 | Repositori kosong |

### 6.2 Raw File Content

**Endpoint**:
```
GET https://raw.githubusercontent.com/{owner}/{repo}/main/{path}
```

**Response (Success 200)**: `text/plain` — konten file mentah.

**Response (Error 404)**: HTML halaman 404 GitHub.

**Catatan**: Endpoint ini tidak memerlukan autentikasi dan tidak terikat rate limit GitHub API. Namun, URL bisa berubah jika file dipindahkan atau branch diubah dari `main`.

### 6.3 chrome.scripting API (Internal)

**Method**: `chrome.scripting.executeScript`

**Parameters**:
```json
{
  "target": { "tabId": number },
  "func": Function,
  "args": [string]
}
```

**Persyaratan**:
- Izin `"scripting"` dan `"activeTab"` di manifest.json.
- Hanya berfungsi pada tab aktif di window saat ini.

### 6.4 Data Transfer Contract (popup.js <-> content.js)

Protokol transfer data drag-and-drop via `chrome.storage.local`:

**Writer (popup.js)**:
```javascript
chrome.storage.local.set({
  mdown_drag_content: string,   // konten file yang di-drag
  mdown_drag_ready: true,       // penanda sudah siap
  mdown_drag_path: string       // path file (opsional)
});
```

**Reader (content.js)**:
```javascript
chrome.storage.local.get(
  ['mdown_drag_content', 'mdown_drag_ready'],
  (result) => {
    if (result.mdown_drag_ready && result.mdown_drag_content) {
      // Gunakan konten, lalu cleanup
      chrome.storage.local.remove([
        'mdown_drag_content',
        'mdown_drag_ready',
        'mdown_drag_path'
      ]);
    }
  }
);
```

---

## 7. State Management

### 7.1 State Variables

| Variabel | Inisialisasi | Transisi | Persistent |
|---|---|---|---|
| `activeRepo` | `'prd'` | `switchRepo(key)` saat tab repositori diklik | Tidak (default prd setiap popup dibuka) |
| `allFiles` | `[]` | `loadRepo(key)` setelah fetch sukses | Tidak (di-cache di localStorage) |
| `filtered` | `[]` | `loadRepo()` atau `searchInput event` | Tidak |
| `currentPath` | `null` | `openPreview(repo, path)` | Tidak |
| `currentRepo` | `null` | `openPreview(repo, path)` | Tidak |
| `rawContent` | `''` | `fetchContent()` sukses di preview | Tidak |
| `varValues` | `{}` | `vmApply.click()` mengisi nilai | Tidak (reset setiap preview baru) |
| `activeTab` | `'rendered'` | Klik tab rendered/raw | Tidak |
| `editingVar` | `null` | `openVarModal(name)` | Tidak |
| `contentCache` | `new Map()` | `prefetchContent()` atau `fetchContent()` | Tidak (Map) |

### 7.2 State Transition Diagram

```
                    ┌──────────────┐
                    │  Popup Open  │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Loading     │  <-- loadRepo() dipanggil
                    │  (spinner)   │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
       ┌──────────┐ ┌──────────┐ ┌──────────┐
       │ List     │ │ Empty    │ │ Error    │
       │ Normal   │ │ (no file)│ │ (⚠️ msg) │
       └────┬─────┘ └──────────┘ └──────────┘
            │
      ┌─────┴─────┐
      ▼           ▼
  ┌────────┐ ┌────────┐
  │Search  │ │Preview │
  │Filtered│ │Button  │
  └────────┘ │  Click │
             └────┬───┘
                  │
                  ▼
           ┌──────────────┐
           │ Preview      │
           │ Loading      │
           └──────┬───────┘
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
  ┌─────────┐ ┌────────┐ ┌─────────┐
  │Rendered │ │ Raw    │ │ Error   │
  │(variabel│ │(mentah) │ │ (⚠️)   │
  │ terisi) │ │         │ │         │
  └─────────┘ └────────┘ └─────────┘
        │
        │ (klik variable chip / highlight)
        ▼
  ┌──────────┐
  │ Var      │
  │ Modal    │
  │ Open     │
  └────┬─────┘
       │
  ┌────┴────┐
  ▼         ▼
Apply    Cancel
  │         │
  └────┬────┘
       ▼
  ┌─────────┐
  │ Re-render│
  │ Preview  │
  └─────────┘
```

### 7.3 State Reset Behavior

| Aksi | State yang Direset |
|---|---|
| Switch repo | `searchInput.value = ''`, panggil `loadRepo(key)` |
| Open preview | `varValues = {}`, `activeTab = 'rendered'` |
| Back dari preview | `currentPath = null`, `rawContent = ''`, `varValues = {}` |
| Refresh | Hapus cache localStorage untuk repo aktif, panggil `loadRepo(key, true)` |
| Popup ditutup | Semua in-memory state hilang (kecuali localStorage cache) |

---

## 8. Error Handling

### 8.1 Skenario Error dan Fallback

| Skenario | Deteksi | Fallback / Feedback |
|---|---|---|
| GitHub API rate limited (403) | `res.ok === false`, status 403 | Tampilkan "Gagal: GitHub API 403 — {repo}" di list view |
| Repositori tidak ditemukan (404) | `res.ok === false`, status 404 | Tampilkan "Gagal: GitHub API 404 — {repo}" |
| Network offline | `fetch()` throw TypeError | Tampilkan "Gagal: TypeError: Failed to fetch" |
| localStorage corrupt | `JSON.parse()` throw | Cache dianggap miss, fetch dari API |
| File content fetch gagal (404) | `res.ok === false` | Preview menampilkan pesan error |
| Clipboard write denied | `navigator.clipboard.writeText()` reject | Silent catch, tombol menunjukkan "✗" untuk 1,5 detik |
| chrome.scripting.executeScript gagal | Promise reject | Tidak ada feedback visual (silent fail) |
| Content script tidak ter-inject | Tidak ada `window.__mdownDropperV2` | Drag tidak menghasilkan apa-apa di halaman |
| Drop target bukan elemen valid | `isDropTarget()` return false | Drop ignored, tidak ada insert |
| Element aktif null saat insert | `document.activeElement === null` | Alert: "Klik dulu field yang ingin diisi." |
| Content cache key tidak ditemukan | `contentCache.get(key)` undefined | Fallback ke fetch sync di dragstart |

### 8.2 User Feedback Matrix

| Komponen | Loading | Error | Empty | Success |
|---|---|---|---|---|
| **File List** | Spinner + "Mengambil daftar file..." | ⚠️ + pesan error + nama repo | "Tidak ada file yang cocok" | Daftar file dengan count |
| **Preview** | Spinner + "Loading..." | ⚠️ + pesan error | N/A (file selalu punya konten) | Rendered/Raw markdown |
| **Copy Button** | "..." | "✗" (1,5 detik) | N/A | "✓ Copied!" / "✓" (1,5 detik) |
| **Drag & Drop** | Placeholder `{{LOADING:path}}` | Silent catch (console.warn) | N/A | Text ter-insert di target |
| **Insert ke Web** | N/A (synchronous) | Alert box | N/A | Text ter-insert, flash hijau |
| **Variable Apply** | N/A | N/A | N/A | Preview re-render |

### 8.3 Graceful Degradation

- **Tanpa koneksi internet**: File list gagal dimuat, error message ditampilkan. Pengguna tidak bisa menggunakan ekstensi sampai koneksi pulih.
- **Rate limit GitHub API**: Cache localStorage membantu jika data sudah pernah di-fetch sebelumnya. Setelah cache expired, ekstensi tidak berfungsi sampai rate limit pulih (biasanya 1 jam untuk unauthenticated).
- **Tanpa tab aktif**: Insert ke Web memerlukan tab aktif. Jika tidak ada tab aktif (`chrome.tabs.query` return empty), script gagal tanpa pesan.
- **Tanpa content script**: Jika content script belum ter-inject di halaman (misalnya halaman chrome://), drag & drop tidak berfungsi.

---

## 9. Event Flow Diagrams

### 9.1 Flow: Initial Load

```
User           Popup           localStorage      GitHub API
 │               │                  │                │
 ├─ klik icon ──►                  │                │
 │               │                  │                │
 │              loadRepo('prd')     │                │
 │               ├──► cek cache ────►                │
 │               │                  │                │
 │               │◄── cache miss ───│                │
 │               │                  │                │
 │               ├──────────────────────────────────►│
 │               │   GET /git/trees/main?recursive=1  │
 │               │◄──────────────────────────────────│
 │               │   200 + tree[]                     │
 │               │                  │                │
 │               ├──► simpan cache ─►                │
 │               │                  │                │
 │              filter + group + render               │
 │               │                  │                │
 │◄──── list files ditampilkan ─────│                │
```

### 9.2 Flow: Preview dengan Variable Editing

```
User            popup.js             GitHub Raw         DOM
 │                │                     │                │
 ├─ klik 👁 ─────►                     │                │
 │               openPreview()          │                │
 │                ├─► switch view ──────► viewPreview    │
 │                ├─► spinner ─────────► #previewScroll  │
 │                │                     │                │
 │                ├────────────────────────────────────► │
 │                │ GET raw content      │               │
 │                │◄────────────────────│               │
 │                │                     │                │
 │               renderPreview()        │                │
 │                ├─► extractVars ──────► varsBar chips  │
 │                ├─► applyVars ────────► render content  │
 │                │                     │                │
 │◄── preview ────│────────────────────│                │
 │     tampil     │                     │                │
 │                │                     │                │
 ├─ klik chip ───►                     │                │
 │               openVarModal()        │                │
 │                ├─► modal open ───────► varModal       │
 │◄── modal ─────│                     │                │
 │     tampil     │                     │                │
 │                │                     │                │
 ├─ isi input ───►                     │                │
 │   tekan Enter  │                     │                │
 │               vmApply.click()        │                │
 │                ├─► varValues[key]=val│                │
 │                ├─► close modal ──────► varModal       │
 │                ├─► renderPreview() ───► previewScroll  │
 │◄── preview ───│                     │                │
 │     update     │                     │                │
```

### 9.3 Flow: Drag & Drop (List Item ke Halaman Web)

```
Popup.js                  chrome.storage          content.js            Web Page
   │                          │                      │                    │
   ├─ user hover item ───────►                      │                    │
   │  prefetchContent()       │                      │                    │
   │  fetch(raw url)          │                      │                    │
   │◄─ content ──────────────│                      │                    │
   │  cache in Map            │                      │                    │
   │                          │                      │                    │
   ├─ dragstart ────────────►│                      │                    │
   │  set dataTransfer        │ mdown_drag_content   │                    │
   │  set chrome.storage ────►│                      │                    │
   │                          │                      │                    │
   │                          │       dragover ──────► target textarea    │
   │                          │         overlay ─────► dashed border      │
   │                          │                      │                    │
   │                          │        drop ─────────►                    │
   │                          │         read dt ─────► 'text/plain'       │
   │                          │         read storage──► mdown_drag_content│
   │                          │         insertText ───► target.value      │
   │                          │         flash ────────► green outline     │
   │                          │         cleanup ──────► remove storage    │
   │◄─ dragend ──────────────│                      │                    │
```

### 9.4 Flow: Insert ke Web

```
User              popup.js                  chrome.scripting        Web Page
 │                  │                            │                    │
 ├─ klik "Insert" ─►                            │                    │
 │                  │                            │                    │
 │                 getFinalContent()             │                    │
 │                  │                            │                    │
 │                 chrome.tabs.query()           │                    │
 │                  ├───────────────────────────►│                    │
 │                  │◄── tabId ─────────────────│                    │
 │                  │                            │                    │
 │                 chrome.scripting              │                    │
 │                 .executeScript()              │                    │
 │                  ├───────────────────────────►│                    │
 │                  │                            ├─► func(content) ──►│
 │                  │                            │   ambil activeElm  │
 │                  │                            │   cek tagName      │
 │                  │                            │   insert teks ─────► textarea
 │                  │                            │   dispatch event ──► input/change
 │                  │                            │                    │
```

---

## 10. UI Component Specs

### 10.1 Header

| State | Style | Deskripsi |
|---|---|---|
| **Normal** | Background `#161b22`, border-bottom `#21262d`, padding 10px 12px | Menampilkan ikon "✨", judul "blinker", tombol refresh |
| **Hover (refresh btn)** | Border color `#58a6ff`, color `#58a6ff` | Tombol refresh berubah warna |

### 10.2 Repo Tabs

| State | Style | Deskripsi |
|---|---|---|
| **Normal (inactive)** | Background none, color `#8b949e` | Tab tidak aktif |
| **Hover** | Background `#161b22`, color `#c9d1d9` | Hover pada tab tidak aktif |
| **Active (prd)** | Background `#161b22`, border `#21262d`, color `#3fb950` | Tab PRD terpilih dengan aksen hijau |
| **Active (mdown)** | Background `#161b22`, border `#21262d`, color `#58a6ff` | Tab Mdown terpilih dengan aksen biru |

### 10.3 Search Input

| State | Style | Deskripsi |
|---|---|---|
| **Normal** | Background `#0d1117`, border `#30363d`, icon search kiri | Placeholder "Cari file..." |
| **Focus** | Border `#58a6ff` | Input aktif |
| **Disabled** | N/A | Selalu enabled |

### 10.4 File List

#### Section Label
| State | Style |
|---|---|
| **Normal** | Font 10px, uppercase, color `#484f58`, padding 7px 5px 3px |

#### File Item

| State | Style | Deskripsi |
|---|---|---|
| **Normal** | Padding 6px 7px, border-radius 5px, `cursor: grab` | Item siap di-drag |
| **Hover** | Background `#161b22`, border `#21262d` | Item di-hover |
| **Active (mousedown)** | `cursor: grabbing` | Item sedang dipegang |
| **Dragging** | `opacity: 0.35` | Item sedang di-drag |

#### Row Buttons (Preview, Copy)

| State | Style | Deskripsi |
|---|---|---|
| **Hidden** | `opacity: 0` | Tersembunyi saat item tidak di-hover |
| **Visible** | `opacity: 1` | Muncul saat item di-hover |
| **Normal** | Border `#21262d`, color `#484f58` | Tombol siap diklik |
| **Hover (preview)** | Border `#58a6ff`, color `#58a6ff` | Hover tombol preview |
| **Hover (copy)** | Border `#3fb950`, color `#3fb950` | Hover tombol copy |
| **Copied (success)** | Border `#3fb950`, color `#3fb950` | Copy berhasil |

### 10.5 Preview Header

| State | Style | Deskripsi |
|---|---|---|
| **Normal** | Background `#161b22`, border-bottom `#21262d`, padding 8px 12px | Menampilkan back button, nama file, tab rendered/raw |

#### Preview Tabs (Rendered / Raw)

| State | Style |
|---|---|
| **Normal (inactive)** | Background none, color `#8b949e` |
| **Active** | Background `#21262d`, color `#e6edf3` |

### 10.6 Variables Bar

| State | Style | Deskripsi |
|---|---|---|
| **Hidden** | `display: none` | Jika file tidak memiliki variabel |
| **Visible** | `display: block`, background `#0d1117`, border-bottom `#21262d` | Jika file memiliki variabel |

#### Variable Chips

| State | Style | Deskripsi |
|---|---|---|
| **Normal** | Background berwarna (6 varian), color sesuai, border transparan, `cursor: pointer` | Chip untuk setiap variabel |
| **Hover** | `filter: brightness(1.2)`, border color `currentColor` | Chip di-hover |

**Color Cycling**:
| nth-child | Background | Color | Border |
|---|---|---|---|
| 6n+1 | `#3d2b1f` | `#ffa657` | `#6e3f1c` |
| 6n+2 | `#1f2d3d` | `#79c0ff` | `#1c4a6e` |
| 6n+3 | `#2d1f3d` | `#d2a8ff` | `#5a2e8a` |
| 6n+4 | `#1f3d2b` | `#56d364` | `#1a6e3c` |
| 6n+5 | `#3d1f2b` | `#ff7b72` | `#6e1c2e` |
| 6n+6 | `#2b3d1f` | `#a5d679` | `#3e6e1c` |

### 10.7 Var Highlight (dalam konten)

| State | Style | Deskripsi |
|---|---|---|
| **Rendered (unfilled)** | `var-rendered`: dashed border, `cursor: pointer` | `{{VAR}}` yang belum diisi |
| **Rendered (filled)** | (tidak ada highlight, sudah diganti nilai) | Variabel terisi dengan nilai aktual |
| **Raw (unfilled)** | `var-highlight`: background solid, `cursor: pointer`, font-weight 600 | `{{VAR}}` di view raw |

### 10.8 Variable Modal

| State | Style | Deskripsi |
|---|---|---|
| **Closed** | `display: none` | Modal tersembunyi |
| **Open** | `display: flex`, overlay rgba(0,0,0,0.6) | Modal tampil di tengah layar |
| **Input Normal** | Background `#0d1117`, border `#30363d` | Input siap diisi |
| **Input Focus** | Border `#58a6ff` | Input aktif |

| Tombol | Normal | Hover |
|---|---|---|
| **Batal** | Background none, color `#8b949e`, border `#30363d` | Border `#8b949e`, color `#e6edf3` |
| **Terapkan** | Background `#238636`, border `#238636`, color white | Background `#2ea043` |

### 10.9 Preview Footer Buttons

| Tombol | Normal | Hover | Active/Feedback |
|---|---|---|---|
| **⠿ Drag** | Background none, color `#8b949e`, border `#30363d` | Border `#58a6ff`, color `#58a6ff` | `draggable="true"` |
| **📋 Copy** | Background `#238636`, border `#238636`, color white | Background `#2ea043` | "✓ Copied!" (1.5 detik) |
| **⬇ Insert** | Background `#1f6feb`, border `#1f6feb`, color white | Background `#388bfd` | Eksekusi langsung |

### 10.10 State Screens

#### Loading State
```
┌─────────────────────────────────┐
│         ✨ blinker      [↻]     │
├─────────────────────────────────┤
│  [📋 PRD Prompt][🗂️ Prompt..]  │
├─────────────────────────────────┤
│  🔍 Cari file...               │
├─────────────────────────────────┤
│                                 │
│         ⟳ (spinner)            │
│   Mengambil daftar file...     │
│                                 │
│                                 │
├─────────────────────────────────┤
│  — files     [GitHub ↗]        │
└─────────────────────────────────┘
```

#### Error State
```
┌─────────────────────────────────┐
│         ✨ blinker      [↻]     │
├─────────────────────────────────┤
│  [📋 PRD Prompt][🗂️ Prompt..]  │
├─────────────────────────────────┤
│  🔍 Cari file...               │
├─────────────────────────────────┤
│                                 │
│         ⚠️                      │
│   Gagal: GitHub API 403 —      │
│   prd-prompt-collection        │
│                                 │
│                                 │
├─────────────────────────────────┤
│  Error         [GitHub ↗]      │
└─────────────────────────────────┘
```

#### Empty Search State
```
┌─────────────────────────────────┐
│         ✨ blinker      [↻]     │
├─────────────────────────────────┤
│  [📋 PRD Prompt][🗂️ Prompt..]  │
├─────────────────────────────────┤
│  🔍 xyzabc                     │
├─────────────────────────────────┤
│                                 │
│   Tidak ada file yang cocok 🔍  │
│                                 │
│                                 │
├─────────────────────────────────┤
│  0 files       [GitHub ↗]      │
└─────────────────────────────────┘
```

#### Preview State (Rendered)
```
┌─────────────────────────────────┐
│  ✨ blinker              [↻]    │
├─────────────────────────────────┤
│  [📋 PRD Prompt][🗂️ Prompt..]  │
├─────────────────────────────────┤
│  [← Back]  Nama File  [Rend│Raw]│
├─────────────────────────────────┤
│ Variables (klik untuk edit):    │
│  [{{TITLE}}] [{{AUDIENCE}}]    │
├─────────────────────────────────┤
│                                 │
│  # Judul Dokumen                │
│                                 │
│  Ini adalah {{TITLE}} yang      │
│  ditujukan untuk {{AUDIENCE}}   │
│                                 │
│  ## Bagian Kedua                │
│  ...                            │
│                                 │
├─────────────────────────────────┤
│  [⠿ Drag] [📋 Copy] [⬇ Insert]│
└─────────────────────────────────┘
```

#### Preview State (Raw)
```
┌─────────────────────────────────┐
│  ✨ blinker              [↻]    │
├─────────────────────────────────┤
│  [📋 PRD Prompt][🗂️ Prompt..]  │
├─────────────────────────────────┤
│  [← Back]  Nama File  [Rend│Raw]│
├─────────────────────────────────┤
│ Variables (klik untuk edit):    │
│  [{{TITLE}}] [{{AUDIENCE}}]    │
├─────────────────────────────────┤
│                                 │
│  # Judul Dokumen                │
│                                 │
│  Ini adalah {{TITLE}} yang      │
│  ditujukan untuk {{AUDIENCE}}   │
│                                 │
│  ## Bagian Kedua                │
│  ...                            │
│                                 │
├─────────────────────────────────┤
│  [⠿ Drag] [📋 Copy] [⬇ Insert]│
└─────────────────────────────────┘
```

---

## Lampiran A: Daftar Istilah

| Istilah | Definisi |
|---|---|
| **MV3** | Manifest V3 — spesifikasi terbaru Chrome Extension |
| **Content Script** | Script yang di-inject ke halaman web oleh ekstensi |
| **Popup** | UI kecil (400x600) yang muncul saat ikon ekstensi diklik |
| **PRD** | Product Requirements Document |
| **Raw** | Konten mentah tanpa rendering HTML |
| **Rendered** | Konten markdown yang sudah diubah menjadi HTML |
| **Variable** | Placeholder `{{NAMA}}` dalam konten yang bisa diisi pengguna |
| **TTL** | Time To Live — durasi cache berlaku |
| **ContentEditable** | Atribut HTML yang membuat elemen bisa diedit langsung |

---

## Lampiran B: Matriks Dependency Antar Modul

| Modul | Bergantung Pada | Digunakan Oleh |
|---|---|---|
| Repository Manager | GitHub API, localStorage | File Browser |
| File Browser | Repository Manager, Search | Preview System, Content Insertion |
| Preview System | Repository Manager, Variable Editor | Content Insertion |
| Variable Editor | Preview System | Preview System |
| Content Insertion | Repository Manager, Preview System, chrome.storage, chrome.scripting | User |
| Content Script | chrome.storage | Content Insertion (sebagai receiver) |

---

## Lampiran C: Perubahan dari Versi Sebelumnya

| Aspek | mdown-dropper v1 | blinker v2 |
|---|---|---|
| Nama | mdown-dropper | blinker |
| Repositori | 1 (mdown-collection) | 2 (prd + mdown) |
| Tab Repo | Tidak ada | Tab switching PRD / Prompt Collection |
| Variable Editor | Tidak ada | Ada dengan modal editor |
| Pencarian | Basic string match | Search dengan aliases |
| UI Theme | Light | GitHub Dark (#0d1117) |
| Cache | Session storage | localStorage dengan TTL 10 menit |
| Preview Tabs | Tidak ada | Rendered + Raw |
| Insert ke Web | N/A | Ada (chrome.scripting) |

---

*Dokumen ini adalah FRD untuk blinker Chrome Extension versi 2.0.0. Semua spesifikasi mengacu pada implementasi yang terdapat dalam source code di repositori [mdown-collection-chrome](https://github.com/ai-builders-id/mdown-collection-chrome).*
