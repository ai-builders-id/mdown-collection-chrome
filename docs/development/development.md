# Panduan Development Blinker

> **Blinker** — Chrome Extension untuk browse, preview, variable editing, dan drag-drop file markdown dari GitHub ke halaman web manapun.

Dokumen ini ditujukan untuk developer yang akan berkontribusi atau melanjutkan pengembangan Blinker. Dibahas mulai dari setup environment, struktur proyek, standar kode, hingga panduan debugging dan tugas-tugas umum.

---

## Daftar Isi

1. [Environment Setup](#1-environment-setup)
2. [Project Structure](#2-project-structure)
3. [Code Standards](#3-code-standards)
4. [Development Workflow](#4-development-workflow)
5. [Key Code Patterns](#5-key-code-patterns)
6. [Debugging Guide](#6-debugging-guide)
7. [Common Tasks](#7-common-tasks)
8. [Dependency](#8-dependency)

---

## 1. Environment Setup

### 1.1 Prerequisites

Sebelum memulai, pastikan sistem sudah memiliki:

| Alat | Keterangan |
|------|------------|
| **Google Chrome** | Versi terbaru (minimum Chrome 88+ untuk Manifest V3) |
| **Git** | `git --version` untuk verifikasi (minimum 2.30) |
| **Code Editor** | VS Code direkomendasikan (extensions: ESLint, Prettier, Chrome Debugger) |
| **Node.js** (opsional) | Hanya dibutuhkan jika ingin menambahkan tooling seperti linter atau formatter — extension sendiri zero dependency |

### 1.2 Clone Repository

```bash
git clone https://github.com/ai-builders-id/mdown-collection-chrome.git
cd mdown-collection-chrome
```

Proyek ini tidak memiliki package manager — tidak ada `npm install` atau `yarn`. Semua kode adalah vanilla JavaScript murni.

### 1.3 Load Unpacked Extension

1. Buka Chrome dan navigasi ke `chrome://extensions`
2. Aktifkan **Developer mode** (toggle di pojok kanan atas)
3. Klik tombol **"Load unpacked"**
4. Pilih folder hasil clone (`D:/project/mdown-collection-chrome` atau lokasi clone masing-masing)
5. Icon Blinker akan muncul di Chrome toolbar (sebelah kanan address bar)
6. Klik icon untuk membuka popup

### 1.4 Workflow Sehari-hari

```
Edit kode  →  reload extension  →  test di popup  →  commit
```

Karena ini extension tanpa build step, workflow sangat sederhana:

1. Buka `chrome://extensions`
2. Klik tombol reload (ikon ↻) di kartu Blinker
3. Atau gunakan shortcut: setelah edit, buka popup baru — Chrome me-reload otomatis jika extension baru saja di-reload

**Power user tip:** Buka `chrome://extensions` di panel terpisah, reload satu klik, lalu langsung tes popup.

### 1.5 Tools yang Direkomendasikan

- **VS Code** dengan ekstensi:
  - ESLint (konfigurasi standar JavaScript)
  - Prettier (format otomatis)
  - Chrome Debugger (debug langsung dari VS Code)
- **Chrome DevTools** untuk popup:
  - Klik kanan pada popup → `Inspect` → muncul DevTools terpisah
  - Atau buka `chrome-extension://<id>/popup.html` langsung di tab

---

## 2. Project Structure

```
mdown-collection-chrome/
├── manifest.json          # Chrome Extension Manifest V3
├── popup.html             # UI popup (HTML + CSS inline)
├── popup.js               # Logic utama: fetch, render, search, preview, variable editor
├── content.js             # Content script: handle drop events di halaman web
├── icons/
│   ├── blinker.svg        # SVG icon untuk action toolbar
│   ├── icon16.png         # Icon 16x16
│   ├── icon48.png         # Icon 48x48
│   └── icon128.png        # Icon 128x128
├── docs/                  # Dokumentasi proyek
│   ├── ...
│   └── development/
│       └── development.md # Dokumen ini
├── .claude/               # Claude Code workspace config
├── README.md              # README utama
└── .gitignore             # Git ignore rules
```

### 2.1 manifest.json

File konfigurasi extension Chrome Manifest V3:

- **name**: `blinker`
- **version**: `2.0.0`
- **action.default_popup**: `popup.html` — entry point UI
- **permissions**: `activeTab`, `scripting`, `storage`
- **host_permissions**: GitHub API (`api.github.com`, `raw.githubusercontent.com`) dan `<all_urls>` untuk content script
- **content_scripts**: Satu script (`content.js`) di-inject ke `<all_urls>`

Perubahan pada manifest.json membutuhkan reload penuh extension di `chrome://extensions`.

### 2.2 popup.html

File HTML tunggal yang berisi:

- **CSS inline** (baris 6-162) — semua styling dalam tag `<style>`, tidak ada file CSS terpisah
- **DOM structure**:
  - Header dengan judul dan tombol refresh
  - Repository tabs (PRD Prompt, Prompt Collection)
  - List view: search input, hint bar, scrollable file list, footer
  - Preview view: back button, filename, rendered/raw tabs, variables bar, preview content, action buttons (drag, copy, insert)
  - Variable edit modal: overlay modal untuk mengisi nilai variabel
- **Script tag** (baris 242) — memuat `popup.js`

### 2.3 popup.js

File JavaScript utama (~534 baris). Semua logic application berada di sini:

| Bagian | Baris | Fungsi |
|--------|-------|--------|
| Repo config | 4-28 | Definisi 2 repo GitHub (PRD dan mdown) |
| Cache & Aliases | 30-38 | Cache TTL 10 menit, search aliases |
| State | 40-50 | `activeRepo`, `allFiles`, `filtered`, `currentPath`, `varValues`, dll |
| DOM references | 52-78 | Semua `getElementById` disimpan di variabel global |
| GitHub API | 80-116 | `fetchFileList()` dan `fetchContent()` |
| Display helpers | 118-177 | `getFilename`, `getDisplayName`, `getNumberPrefix`, dll |
| Render list | 179-226 | `renderList()` — render file list ke DOM |
| List events | 228-287 | Drag, preview, copy events + prefetch |
| Repo switching | 289-319 | Tab switching antar repo |
| Search | 321-336 | Filter real-time dengan alias expansion |
| Preview | 344-372 | Open/close preview |
| Variables | 374-386 | `extractVars()`, `applyVars()` |
| Markdown renderer | 388-414 | Custom markdown-to-HTML converter |
| Render preview | 416-455 | Render dengan variable highlighting |
| Tab switching | 457-467 | Rendered vs Raw tab |
| Var modal | 469-489 | Modal editor variabel |
| Preview actions | 491-528 | Drag, copy, insert ke halaman web |
| Init | 530-533 | Bootstrap aplikasi |

### 2.4 content.js

Content script (~103 baris) yang di-inject ke semua halaman:

- **IIFE** (Immediately Invoked Function Expression) dengan guard `window.__mdownDropperV2` untuk mencegah double injection
- **Drop target detection** (`isDropTarget`): textarea, input[type=text/search/url/email], contentEditable
- **Overlay**: visual feedback saat drag di atas target
- **insertText()**: insert konten ke textarea/input atau contentEditable dengan flash animation hijau
- **Event listeners**: `dragover`, `dragleave`, `drop` — semua di phase capturing (parameter `true`)

### 2.5 icons/

Empat file icon:

| File | Penggunaan |
|------|------------|
| `blinker.svg` | Action toolbar icon (SVG vector) |
| `icon16.png` | Favicon/context menu |
| `icon48.png` | Extension management page |
| `icon128.png` | Chrome Web Store |

### 2.6 docs/

Dokumentasi lengkap proyek terpisah per domain:

- `api.md` — API documentation
- `architecture.md` — Arsitektur sistem
- `db.md` — Database / storage design
- `design.md` — Design system
- `development.md` — Dokumen ini
- `security.md` — Security considerations
- `testing.md` — Test plan & strategy
- `project/PRD.md` — Product Requirements Document
- `project/FRD.md` — Functional Requirements Document

---

## 3. Code Standards

### 3.1 JavaScript Style Guide

Blinker menggunakan vanilla JavaScript tanpa framework. Standar penulisan:

#### 3.1.1 Formatting

- **Indentasi**: 2 spasi (bukan tab)
- **Quotes**: Single quotes untuk string (`'...'`)
- **Semicolon**: Wajib di akhir setiap statement
- **Spasi**:
  - Satu spasi setelah `function` keyword: `function name() {}`
  - Satu spasi di sekitar operator: `a + b`, `key === value`
  - Koma diikuti spasi: `[1, 2, 3]`
- **Braces**: Egyptian style (buka kurung di baris yang sama):

```javascript
// Benar
function fetchData() {
  return result;
}

if (condition) {
  doSomething();
}

// Salah
function fetchData()
{
  return result;
}
```

#### 3.1.2 Naming Conventions

| Konteks | Convention | Contoh |
|---------|-----------|--------|
| Variables & functions | camelCase | `activeRepo`, `fetchFileList()` |
| Constants | UPPER_SNAKE_CASE | `CACHE_TTL`, `SEARCH_ALIASES` |
| DOM element variables | Awalan dengan tipe | `btn`, `viewList`, `searchInput` |
| Config objects | PascalCase | `REPOS` |
| Event handlers | Awalan `handle` atau deskriptif | `attachListEvents()`, `openPreview()` |
| Private/internal | Tidak ada prefix underscore | Gunakan function scope |

#### 3.1.3 Variable Declarations

- Gunakan `const` untuk semua nilai yang tidak di-reassign
- Gunakan `let` jika variabel perlu di-reassign
- **Jangan gunakan `var`** — tidak ada satupun `var` di codebase
- Deklarasi satu variabel per statement (bukan comma-separated)

```javascript
// Benar
const activeRepo = 'prd';
const cfg = REPOS[repoKey];
let filtered = [];

// Salah
var old = 'style';
const a = 1, b = 2;
```

#### 3.1.4 Arrow Functions

- Gunakan arrow function untuk callback dan anonymous function
- Gunakan `() => { ... }` untuk multi-line, `() => expr` untuk one-line
- Arrow function tanpa kurung untuk satu parameter hanya jika sangat jelas

```javascript
// Preferred
files.forEach(f => {
  process(f);
});

// Untuk satu-liner
const names = files.map(f => f.path);
```

#### 3.1.5 Async/Await

- Semua operasi I/O menggunakan async/await (lihat [Key Code Patterns](#key-code-patterns))
- Error handling dengan try/catch
- Hindari `.then()` chains — gunakan `await`

#### 3.1.6 Comparison

- Gunakan strict equality `===` dan `!==`
- Jangan gunakan `==` atau `!=`
- Truthy/falsy check eksplisit: `if (!files.length)` (diterima untuk length), tapi prefer `if (val !== null)` untuk null check

#### 3.1.7 Array Methods

Prefer array methods over manual loops:

```javascript
// Preferred
files.filter(cfg.filter).map(item => ({ path: item.path }));

// Avoid
const result = [];
for (let i = 0; i < files.length; i++) {
  if (cfg.filter(files[i])) {
    result.push({ path: files[i].path });
  }
}
```

### 3.2 HTML/CSS Standards

#### 3.2.1 HTML

- **Semantic elements**: Gunakan `div` dengan class deskriptif
- **ID vs Class**: ID untuk elemen unik (JavaScript hooks), class untuk reusable styling
- **Data attributes**: Prefix `data-` untuk storing state di DOM: `data-path`, `data-repo`, `data-var`
- **Self-closing**: Tidak perlu `/` pada void elements: `<input>` bukan `<input />`
- **Quotes**: Double quotes untuk attribute HTML

#### 3.2.2 CSS

- **Inline dalam HTML**: Semua CSS di satu `<style>` block di `<head>` — tidak ada file CSS eksternal
- **Class naming**: lowercase-with-dash: `.file-item`, `.preview-header`, `.row-btns`
- **No CSS framework**: Semua dari nol
- **CSS Variables**: Tidak digunakan (konsisten dengan inline approach)
- **Box-sizing**: Universal `*{box-sizing:border-box}`
- **Color system**: GitHub Dark theme palette:
  - Background: `#0d1117`, `#161b22`
  - Border: `#21262d`, `#30363d`
  - Text: `#e6edf3`, `#c9d1d9`, `#8b949e`, `#484f58`
  - Accent: `#58a6ff` (biru), `#3fb950` (hijau), `#ffa657` (oranye)
- **Z-index**: Gunakan `z-index: 999` atau `2147483647` untuk overlay maksimum
- **Transitions**: Durasi `.15s` untuk interaksi, `.1s` untuk opasitas

### 3.3 Comments

#### 3.3.1 File Header

Setiap file JS diawali dengan komentar satu baris deskriptif:

```javascript
// mdown-dropper v3 — popup.js
// File list 100% dari GitHub API, zero hard-code
```

#### 3.3.2 Section Comments

Gunakan komentar dengan dekorasi garis untuk membagi file menjadi seksi:

```javascript
// ── GitHub API ────────────────────────────────────────────
```

Pendekatan ini membuat file panjang lebih mudah dinavigasi. Semua seksi memiliki padding dengan `─` hingga ~50 karakter.

#### 3.3.3 Kode Kompleks

Beri komentar pada bagian yang tidak obvious:

```javascript
const SEARCH_ALIASES = {
  'cs': 'customer support',   // Singkatan → full form
  'prd': 'product requirements',
};
```

#### 3.3.4 Inline Comments

Minimal. Hanya untuk magic numbers, regex patterns, atau workaround:

```javascript
// Flash confirmation
const prev = el.style.outline;
el.style.outline = '2px solid #3fb950';
setTimeout(() => { el.style.outline = prev; }, 700);
```

### 3.4 Commit Conventions

Proyek menggunakan **Conventional Commits**:

```
<type>: <deskripsi singkat>
```

#### Types yang digunakan:

| Type | Kapan | Contoh |
|------|-------|--------|
| `feat` | Fitur baru | `feat: add search alias expansion for common terms` |
| `fix` | Bug fix | `fix: prevent double overlay on nested drop targets` |
| `refactor` | Perubahan kode tanpa perubahan fungsionalitas | `refactor: extract variable extraction to helper function` |
| `style` | Perubahan formatting, CSS | `style: adjust popup width to 400px` |
| `docs` | Dokumentasi | `docs: add development guide` |
| `perf` | Performance improvement | `perf: add content prefetch on hover` |
| `chore` | Maintenance | `chore: update manifest version to 2.0.0` |

#### Aturan commit:

1. **Subject line**: Maksimal 72 karakter, present tense, imperative mood
2. **Body** (opsional): Tambahkan setelah baris kosong, wrap di 72 karakter
3. **Referensi issue**: Sertakan di body jika ada
4. **Co-author**: Untuk pairing, tambahkan `Co-authored-by`

```bash
git commit -m 'feat: add similarity search using keyword expansion

Search now expands common abbreviations (cs → customer support,
prd → product requirements) to improve discoverability.

Closes #42'
```

#### Riwayat commit yang ada:

```
041ea39 feat: rename to blinker, reorder tabs, and add similarity search
8d821a9 Add mdown-dropper Chrome extension
0b987c7 Initial commit
```

---

## 4. Development Workflow

### 4.1 Feature Development

1. **Branch**: Buat branch baru dari `main`
   ```bash
   git checkout -b feat/nama-fitur
   ```
2. **Develop**: Edit kode, reload extension, test
3. **Commit**: Gunakan Conventional Commits
   ```bash
   git add popup.js manifest.json
   git commit -m 'feat: what was added'
   ```
4. **Push & PR**:
   ```bash
   git push origin feat/nama-fitur
   ```
   Buat Pull Request ke `main` di GitHub

### 4.2 Testing Strategy

Karena Blinker adalah Chrome Extension tanpa test framework, pengujian dilakukan secara manual dan eksploratif:

#### 4.2.1 Smoke Test Checklist

Setelah setiap perubahan signifikan, lakukan:

- [ ] Popup terbuka tanpa error (cek console)
- [ ] File list muncul dari kedua repo (PRD & Prompt Collection)
- [ ] Search filter berfungsi
- [ ] Preview terbuka (Rendered & Raw tab)
- [ ] Variable detection berfungsi
- [ ] Variable editor modal bisa diisi
- [ ] Drag item ke textarea berfungsi
- [ ] Copy ke clipboard berfungsi
- [ ] Insert ke web berfungsi
- [ ] Refresh button berfungsi
- [ ] Cache expiration bekerja (10 menit)
- [ ] Content script inject tanpa error
- [ ] Drop overlay muncul di textarea
- [ ] Drop content terinsert dengan benar

#### 4.2.2 Regression Test

Sebelum release, test di halaman-halaman berbeda:

- **Google Docs** (contentEditable)
- **GitHub** (textarea komentar)
- **Twitter** (textarea tweet)
- **Standard HTML form** (input, textarea)
- **Page tanpa drop target** (no-op, tidak crash)

#### 4.2.3 Console Monitoring

Selalu buka DevTools saat testing. Perhatikan:

- **Errors** (merah) — harus 0
- **Warnings** (kuning) — minimal, hanya yang diketahui
- **Network requests** — hanya ke GitHub API dan raw.githubusercontent.com

### 4.3 Code Review

Saat melakukan code review, perhatikan:

1. **Zero dependency**: Tidak menambahkan library eksternal
2. **Chrome API usage**: Sesuai dengan Manifest V3
3. **Error handling**: Setiap fetch harus punya try/catch
4. **DOM leakage**: Event listener harus selalu di-re-attach setelah DOM update (lihat `attachListEvents()`)
5. **Cache strategy**: Jangan bypass cache tanpa need (refresh button sudah cukup)
6. **Variable safety**: `applyVars()` harus handle missing variable gracefully
7. **Cross-repo compatibility**: Perubahan di satu repo tidak boleh merusak repo lain

### 4.4 Release Checklist

1. Bump version di `manifest.json`
2. Update `README.md` jika perlu
3. Update `docs/` jika ada perubahan fitur
4. Commit dengan `chore: bump version to x.y.z`
5. Tag: `git tag vx.y.z`
6. Push: `git push --tags`

---

## 5. Key Code Patterns

### 5.1 Async/Await untuk Fetch

Semua komunikasi dengan GitHub API menggunakan async/await:

```javascript
async function fetchFileList(repoKey, force = false) {
  const cfg = REPOS[repoKey];
  const key = cacheKey(repoKey);

  // Cache check
  if (!force) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const c = JSON.parse(raw);
        if (Date.now() - c.ts < CACHE_TTL) return c.files;
      }
    } catch (_) {}
  }

  // Network fetch
  const res = await fetch(apiUrl(cfg), {
    headers: { Accept: 'application/vnd.github+json' }
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status} — ${cfg.repo}`);
  const data = await res.json();
  // ...
}
```

**Pola penting:**

- Cache-first: localStorage dicek sebelum fetch
- Force parameter untuk bypass cache (refresh button)
- Error handling di caller dengan try/catch
- `_` sebagai parameter catch yang tidak digunakan

### 5.2 DOM Pattern

Karena aplikasi ini adalah popup yang dimuat ulang setiap kali dibuka, tidak ada konsep "component lifecycle" yang kompleks. Semua state disimpan di variabel global di scope module:

```javascript
// State global — di-reset setiap kali popup dibuka
let activeRepo   = 'prd';
let allFiles     = [];
let filtered     = [];
let currentPath  = null;
```

**Render-in-place**: Setiap render membersihkan dan mengisi ulang DOM:

```javascript
function renderList(files) {
  footerLink.href = REPOS[repoKey].githubUrl;
  footerCount.textContent = `${files.length} file${files.length !== 1 ? 's' : ''}`;

  const groups = groupFiles(files);
  // Build HTML string
  listScroll.innerHTML = html.join('');
  attachListEvents(); // Re-attach event listeners setelah DOM baru
}
```

### 5.3 Event Delegation

Setelah list di-render, event listener di-attach ke setiap elemen:

```javascript
function attachListEvents() {
  document.querySelectorAll('.file-item').forEach(item => {
    item.addEventListener('dragstart', e => { ... });
    item.addEventListener('dragend', () => { ... });
  });
  document.querySelectorAll('.preview-btn').forEach(btn => {
    btn.addEventListener('click', e => { openPreview(...); });
  });
}
```

**Mengapa tidak delegasi ke parent?** Karena `listScroll.innerHTML` di-replace total tiap render, event listener ke parent pun tetap harus di-re-attach. Pendekatan querySelectorAll sederhana dan straightforward.

### 5.4 Caching Strategy

Dua level caching:

#### Level 1: localStorage (file list)

```javascript
const CACHE_TTL = 10 * 60 * 1000; // 10 menit

function cacheKey(repoKey) { return `mdown_v3_${repoKey}`; }

// Save
localStorage.setItem(key, JSON.stringify({ ts: Date.now(), files }));

// Load
const raw = localStorage.getItem(key);
if (raw) {
  const c = JSON.parse(raw);
  if (Date.now() - c.ts < CACHE_TTL) return c.files;
}
```

#### Level 2: In-memory Map (file content untuk drag)

```javascript
const contentCache = new Map(); // prefetch cache

function prefetchContent(repoKey, path) {
  const key = `${repoKey}:${path}`;
  if (contentCache.has(key)) return;
  contentCache.set(key, null); // mark as in-flight
  fetchContent(repoKey, path)
    .then(c => contentCache.set(key, c))
    .catch(() => contentCache.delete(key));
}
```

**Prefetch on hover**: Saat user hover atau pointerdown di list item, content langsung di-fetch:

```javascript
item.addEventListener('mouseenter', () => prefetchContent(repo, path));
item.addEventListener('pointerdown', () => prefetchContent(repo, path));
```

**Synchronous drag data**: Jika content sudah di-cache, drag data diset langsung (tanpa async):

```javascript
if (cached) {
  e.dataTransfer.setData('text/plain', cached);
  chrome.storage.local.set({ mdown_drag_content: cached, mdown_drag_ready: true });
} else {
  e.dataTransfer.setData('text/plain', `{{LOADING:${path}}}`);
  fetchContent(repo, path).then(content => {
    chrome.storage.local.set({ mdown_drag_content: content, mdown_drag_ready: true });
  });
}
```

### 5.5 Cross-context Communication (Content Script)

Popup → Halaman web menggunakan dua mekanisme:

1. **Drag & Drop**: `content.js` listen `drop` event, baca dari `chrome.storage.local`
2. **Insert ke Web**: `chrome.scripting.executeScript()` inject function langsung ke tab aktif

```javascript
// popup.js — insert via scripting API
pfInsert.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: (content) => {
        // Function ini di-inject ke halaman web
        const el = document.activeElement;
        // ...
      },
      args: [content]
    });
  });
});
```

```javascript
// content.js — drop handler
document.addEventListener('drop', e => {
  chrome.storage.local.get(['mdown_drag_content', 'mdown_drag_ready'], (result) => {
    if (result.mdown_drag_ready && result.mdown_drag_content) {
      insertText(target, result.mdown_drag_content);
      chrome.storage.local.remove(['mdown_drag_content', 'mdown_drag_ready', 'mdown_drag_path']);
    }
  });
}, true);
```

### 5.6 Variable Pattern

Variable detection menggunakan regex `\{\{([A-Z0-9_]+)\}\}` dan diganti dengan input user:

```javascript
function extractVars(text) {
  const matches = text.match(/\{\{([A-Z0-9_]+)\}\}/g) || [];
  return [...new Set(matches.map(m => m.replace(/[{}]/g, '')))];
}

function applyVars(text) {
  let out = text;
  for (const [k, v] of Object.entries(varValues)) {
    if (v) out = out.replaceAll(`{{${k}}}`, v);
  }
  return out;
}
```

**Visual feedback**: Variable yang belum diisi di-highlight dengan warna-warni di rendered view.

### 5.7 Self-contained Content Script

Content script mencegah multiple injection dengan guard:

```javascript
(function() {
  if (window.__mdownDropperV2) return;
  window.__mdownDropperV2 = true;
  // ... setup
})();
```

---

## 6. Debugging Guide

### 6.1 Membuka DevTools untuk Popup

Popup Blinker adalah window terpisah, cara debug-nya berbeda dari halaman web biasa:

**Metode 1 — Klik kanan:**
1. Klik icon Blinker di toolbar untuk membuka popup
2. Klik kanan di dalam popup → pilih **"Inspect"**
3. DevTools terbuka di window terpisah

**Metode 2 — Load langsung di tab:**
1. Buka `chrome://extensions`
2. Aktifkan Developer mode
3. Catat ID extension (misal: `abcdefghijklmnop`)
4. Buka `chrome-extension://abcdefghijklmnop/popup.html` di tab baru
5. Buka DevTools seperti biasa (F12)

### 6.2 Console

Semua log bisa dilihat di DevTools popup:

- **Error**: Otomatis muncul merah. Perhatikan CORS errors, API rate limiting, syntax errors
- **Logging**: Blinker minimal menggunakan console — hanya error penting yang di-log:

```javascript
// Satu-satunya console.log di codebase
.catch(err => console.warn(err));  // fetch content gagal saat drag
```

Jika perlu debug tambahan, tambahkan `console.log()` sementara.

### 6.3 Storage Inspection

Chrome DevTools → tab `Application` → `Storage`:

- **Local Storage**: File list cache (key: `mdown_v3_prd`, `mdown_v3_mdown`)
- **Chrome Storage**: Temporary drag content (key: `mdown_drag_content`, `mdown_drag_ready`, `mdown_drag_path`)

Untuk melihat/mengedit di console DevTools:

```javascript
// Local storage
localStorage.getItem('mdown_v3_prd');

// Chrome storage
chrome.storage.local.get(null, console.log);
```

Clear storage untuk test fresh state:

```javascript
localStorage.clear();
chrome.storage.local.clear();
```

### 6.4 Network Inspection

Di DevTools → tab `Network`:

Filter untuk melihat request ke GitHub API dan raw.githubusercontent.com:

1. Buka popup Blinker
2. Buka DevTools popup
3. Switch ke tab Network
4. Reload popup (tutup dan buka lagi)
5. Filter: `api.github.com` untuk file list, `raw.githubusercontent.com` untuk content

**Rate limiting**: GitHub API unauthenticated punya limit 60 request/jam. Jika development banyak melakukan refresh, gunakan personal access token di header `Authorization` untuk rate limit yang lebih tinggi.

### 6.5 Content Script Debugging

Content script berjalan di konteks halaman web, bukan di popup:

- Buka DevTools halaman web tempat extension aktif (F12)
- Tab **Console**: log dari content.js akan muncul di sini
- Tab **Sources** → `chrome-extension://<id>/content.js`: bisa di-breakpoint

### 6.6 Common Issues

| Issue | Penyebab | Solusi |
|-------|----------|--------|
| Popup blank | Syntax error di popup.js | Buka DevTools popup, cek Console |
| "Failed to fetch" | GitHub API rate limited | Tunggu 1 jam, atau kurangi frekuensi |
| Drag tidak bekerja | Content script tidak inject | Periksa `chrome://extensions` → Blinker → "Inspect views" |
| Variable tidak muncul | Regex mismatch | Cek format `{{NAMA_VAR}}` di file markdown |
| Cache tidak valid | localStorage corrupted | Hapus localStorage manual atau refresh paksa |
| Insert ke web error | Tab tidak aktif | Pastikan tab target aktif sebelum insert |
| Popup width berubah | CSS overflow | Cek horizontal scroll, width `400px` |

---

## 7. Common Tasks

### 7.1 Menambah Repository Baru

Untuk menambah sumber file markdown baru:

1. Tambahkan entry baru di object `REPOS` (popup.js baris ~5-28):

```javascript
const REPOS = {
  // ... existing repos
  docs: {
    owner: 'ai-builders-id',
    repo:  'documentation-collection',
    label: 'Docs',
    icon:  '📚',
    color: '#f0883e',
    filter: item => item.type === 'blob'
                 && item.path.endsWith('.md'),
    githubUrl: 'https://github.com/ai-builders-id/documentation-collection',
  },
};
```

2. Tambahkan tab baru di popup.html:

```html
<button class="repo-tab" id="repoTabDocs">
  <span class="tab-icon">📚</span>
  <span class="tab-label">Docs</span>
</button>
```

3. Tambahkan event listener di popup.js:

```javascript
document.getElementById('repoTabDocs').addEventListener('click', () => switchRepo('docs'));
```

### 7.2 Memodifikasi Filter File

Filter untuk setiap repo ada di object `REPOS`:

```javascript
// Hanya file .md dan bukan README
filter: item => item.type === 'blob'
             && item.path.endsWith('.md')
             && item.path !== 'README.md',

// File .md dan .json, kecuali di folder assets/
filter: item => item.type === 'blob'
             && (item.path.endsWith('.md') || item.path.endsWith('.json'))
             && !item.path.startsWith('assets/'),
```

Ubah sesuai kebutuhan. Perhatikan bahwa `filter` dijalankan pada response `git/trees/main?recursive=1`, jadi setiap item memiliki properti: `path`, `mode`, `type`, `size`, `sha`, `url`.

### 7.3 Menambah UI Baru

Contoh: menambah tombol "Copy Path" di file list.

1. **HTML**: Tambahkan button di dalam `file-item` template di `renderList()`:

```javascript
html.push(`
  <div class="file-item" ...>
    ...
    <div class="row-btns">
      <button class="row-btn path-btn" data-path="${file.path}" title="Copy Path">📎</button>
      <button class="row-btn preview-btn" ...>👁</button>
      <button class="row-btn green copy-row-btn" ...>Copy</button>
    </div>
    ...
  </div>`);
```

2. **CSS**: Tambahkan style untuk `.path-btn` jika perlu (bisa reuse `.row-btn`)

3. **JS — event handler** di `attachListEvents()`:

```javascript
document.querySelectorAll('.path-btn').forEach(btn => {
  btn.addEventListener('click', async e => {
    e.stopPropagation();
    await navigator.clipboard.writeText(btn.dataset.path);
    // feedback visual
  });
});
```

### 7.4 Menambah Variable Pattern

Saat ini variable pattern adalah `{{NAMA_VAR}}` dengan karakter A-Z, 0-9, underscore. Jika perlu pattern berbeda:

1. Ubah regex di `extractVars()`:

```javascript
// Pattern baru: ${variable} atau {{variable}}
function extractVars(text) {
  const matches = text.match(/\$\{([A-Z_]+)\}|\{\{([A-Z_]+)\}\}/g) || [];
  return [...new Set(matches.map(m => m.replace(/[\${}]/g, '')))];
}
```

2. Update `applyVars()` dan rendering yang menggunakan pola `{{...}}` di `renderPreview()`.

### 7.5 Menambah Search Alias

Search aliases digunakan untuk memperluas query singkatan. Tambah di `SEARCH_ALIASES`:

```javascript
const SEARCH_ALIASES = {
  'cs': 'customer support',
  'prd': 'product requirements',
  'qa': 'quality assurance',
  'api': 'application programming interface',
  'fe': 'frontend',          // tambahan baru
  'be': 'backend',           // tambahan baru
};
```

Alias bekerja dengan: jika user mengetik persis key, query diperluas dengan value. File dicocokkan jika path mengandung key ATAU value.

### 7.6 Mengubah Cache TTL

```javascript
const CACHE_TTL = 10 * 60 * 1000; // 10 menit — ubah sesuai kebutuhan
```

Nilai dalam milidetik. Untuk development, set lebih pendek (misal `60 * 1000` = 1 menit). Untuk production, set 30-60 menit.

### 7.7 Menambah Folder Icon Mapping

Folder icon berdasarkan path prefix di `getFileIcon()`:

```javascript
function getFileIcon(path, repoKey) {
  if (path.endsWith('.json')) return '{}';
  if (repoKey === 'prd') {
    if (path.toLowerCase().includes('template')) return '📐';
    return '📋';
  }
  if (path.startsWith('standards/')) return '📐';
  if (path.startsWith('minimal/'))  return '🗂️';
  return '📄';
}
```

Tambah kondisi baru untuk folder lain.

---

## 8. Dependency

### 8.1 Zero External Dependencies

Blinker memiliki **zero external dependencies**:

| Dependency | Status | Alasan |
|-----------|--------|--------|
| Framework JS | None | Semua vanilla JS tanpa React, Vue, atau framework lain |
| CSS Framework | None | Semua styling custom dari nol |
| Markdown Parser | None | Custom regex-based renderer di popup.js |
| Icons Library | None | Emoji dan karakter Unicode untuk icons |
| Build Tool | None | Tidak ada Webpack, Vite, Babel, atau bundler apapun |
| Package Manager | None | Tidak ada package.json, node_modules, atau lock file |
| CDN | None | Semua resources local, tidak ada remote fetch untuk library |

### 8.2 Kenapa Zero Dependencies?

1. **Chrome Extension constraints**: Extension berjalan di environment terbatas. External script perlu ditambahkan sebagai resource dan di-declare di manifest.
2. **Performance**: Popup adalah halaman transient yang di-load setiap kali dibuka. Tanpa framework load, popup terbuka hampir instan.
3. **Security**: Zero dependency = zero supply chain attack surface. Tidak perlu audit npm packages, tidak ada risiko malicious dependency injection.
4. **Simplicity**: Developer cukup paham HTML, CSS, dan vanilla JavaScript — tidak perlu belajar framework atau toolchain.
5. **Maintenance**: Tidak perlu upgrade dependencies, tidak ada breaking changes dari library eksternal, tidak ada deprecation warning.

### 8.3 Satu-satunya "Dependency": GitHub API

Satu-satunya ketergantungan eksternal adalah **GitHub REST API** dan **raw.githubusercontent.com**:

| Endpoint | Tujuan |
|----------|--------|
| `https://api.github.com/repos/{owner}/{repo}/git/trees/main?recursive=1` | Mendapatkan daftar file |
| `https://raw.githubusercontent.com/{owner}/{repo}/main/{path}` | Mendapatkan konten file |

Keduanya adalah public endpoints — tanpa autentikasi. Rate limit untuk unauthenticated request adalah 60 request/jam.

### 8.4 Chrome APIs yang Digunakan

| API | Tujuan |
|-----|--------|
| `chrome.storage.local` | Transfer konten antara popup dan content script saat drag |
| `chrome.tabs.query` | Mendapatkan tab aktif untuk insert konten |
| `chrome.scripting.executeScript` | Inject function ke halaman web untuk insert konten |

Semua API adalah bagian dari Chrome Extension Manifest V3 dan tidak memerlukan library tambahan.

### 8.5 Browser Compatibility

Blinker dirancang khusus untuk **Google Chrome** dan browser berbasis Chromium (Edge, Brave, Opera, Vivaldi). Tidak ada rencana untuk mendukung Firefox atau Safari karena perbedaan Content Script API dan Manifest V3 implementation.

---

## Appendiks

### A. File Reference

| File Path | Ukuran | Fungsi |
|-----------|--------|--------|
| `D:/project/mdown-collection-chrome/manifest.json` | 626 B | Konfigurasi Chrome Extension |
| `D:/project/mdown-collection-chrome/popup.html` | 13.9 KB | UI aplikasi dengan inline CSS |
| `D:/project/mdown-collection-chrome/popup.js` | 20.5 KB | Semua logic aplikasi |
| `D:/project/mdown-collection-chrome/content.js` | 3.6 KB | Content script untuk drop handling |
| `D:/project/mdown-collection-chrome/icons/blinker.svg` | 504 B | Icon toolbar (SVG) |
| `D:/project/mdown-collection-chrome/icons/icon16.png` | 218 B | Icon 16x16 |
| `D:/project/mdown-collection-chrome/icons/icon48.png` | 379 B | Icon 48x48 |
| `D:/project/mdown-collection-chrome/icons/icon128.png` | 775 B | Icon 128x128 |
| `D:/project/mdown-collection-chrome/README.md` | 2.8 KB | README utama |

### B. Git Branching Strategy

```
main          → Stabil, production-ready
feat/*        → Fitur baru
fix/*         → Bug fixes
docs/*        → Dokumentasi
refactor/*    → Refactoring
```

Branch `main` dilindungi — semua perubahan melalui Pull Request.

### C. Quick Reference Commands

```bash
# Clone
git clone https://github.com/ai-builders-id/mdown-collection-chrome.git

# Branch baru
git checkout -b feat/nama-fitur

# Commit (Conventional)
git commit -m 'type: what changed'

# Update dari main
git fetch origin
git rebase origin/main

# Push branch
git push origin feat/nama-fitur

# Tag release
git tag v2.1.0
git push --tags
```

---

> Dokumen ini adalah bagian dari proyek **Blinker** — Chrome Extension untuk markdown prompt management.
>
> Pertanyaan atau saran? Buat issue di [GitHub repository](https://github.com/ai-builders-id/mdown-collection-chrome).
