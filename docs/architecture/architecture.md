# Dokumen Arsitektur — blinker Chrome Extension

| Atribut | Detail |
|---|---|
| **Proyek** | blinker (sebelumnya mdown-dropper) |
| **Versi** | 2.0.0 |
| **Tanggal** | 2026-06-24 |
| **Status** | Final |
| **Penulis** | Cloud Dark |

---

## Daftar Isi

1. [Ikhtisar Arsitektur](#1-ikhtisar-arsitektur)
2. [Arsitektur Manifest V3](#2-arsitektur-manifest-v3)
3. [Arsitektur Modul](#3-arsitektur-modul)
4. [Design Patterns](#4-design-patterns)
5. [Diagram Aliran Data](#5-diagram-aliran-data)
6. [Arsitektur Performa](#6-arsitektur-performa)
7. [Arsitektur Keamanan](#7-arsitektur-keamanan)
8. [Arsitektur Penanganan Error](#8-arsitektur-penanganan-error)
9. [Lampiran](#9-lampiran)

---

## 1. Ikhtisar Arsitektur

### 1.1 Diagram Arsitektur Tingkat Tinggi

Berikut adalah diagram arsitektur sistem blinker secara keseluruhan:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            PERAMBAN CHROME                                   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │                    CHROME EXTENSION (MV3)                         │       │
│  │                                                                   │       │
│  │  ┌──────────────────┐       ┌─────────────────────────────┐      │       │
│  │  │   popup.html     │       │       content.js             │      │       │
│  │  │   + popup.js     │◄─────►│  (injected di <all_urls>)   │      │       │
│  │  │                  │  via  │                              │      │       │
│  │  │  ┌────────────┐  │chrome │  ┌──────────────────────┐   │      │       │
│  │  │  │ Repository │  │.store│  │ Drop Detection       │   │      │       │
│  │  │  │ Manager    │  │.local│  │ - dragover handler   │   │      │       │
│  │  │  │            │  │      │  │ - drop handler       │   │      │       │
│  │  │  │ File       │  │      │  │ - overlay visual     │   │      │       │
│  │  │  │ Browser    │  │      │  └──────────────────────┘   │      │       │
│  │  │  │            │  │      │                             │      │       │
│  │  │  │ Preview    │  │      │  ┌──────────────────────┐   │      │       │
│  │  │  │ System     │  │      │  │ Insert Engine        │   │      │       │
│  │  │  │            │  │      │  │ - insertText()       │   │      │       │
│  │  │  │ Variable   │  │      │  │ - flash confirmation │   │      │       │
│  │  │  │ Editor     │  │      │  └──────────────────────┘   │      │       │
│  │  │  │            │  │      │                             │      │       │
│  │  │  │ Content    │  │      └─────────────────────────────┘      │       │
│  │  │  │ Insertion  │  │                                            │       │
│  │  │  └────────────┘  │                                            │       │
│  │  └──────────────────┘                                            │       │
│  │         │                    │                                    │       │
│  │         ▼                    ▼                                    │       │
│  │  ┌──────────────┐   ┌──────────────┐                             │       │
│  │  │ localStorage  │   │ chrome.storage│                            │       │
│  │  │ (cache file   │   │ .local        │                            │       │
│  │  │  list 10m TTL)│   │ (drag bridge) │                            │       │
│  │  └──────────────┘   └──────────────┘                             │       │
│  └──────────────────────────────────────────────────────────────────┘       │
│         │                          │                                          │
│         ▼                          ▼                                          │
│  ┌──────────────┐           ┌──────────────┐                                │
│  │ GitHub API   │           │ Halaman Web  │                                │
│  │ (file tree)  │           │ (target drop)│                                │
│  └──────┬───────┘           └──────────────┘                                │
│         │                                                                     │
│         ▼                                                                     │
│  ┌──────────────┐                                                           │
│  │ raw.github   │                                                           │
│  │ .com (content)│                                                          │
│  └──────────────┘                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Komponen Utama

blinker terdiri dari lima komponen utama yang saling terintegrasi:

| Komponen | Berkas | Fungsi |
|---|---|---|
| **Popup UI** | `popup.html` | Antarmuka pengguna 400x600px dengan dua view (list dan preview) |
| **Popup Logic** | `popup.js` | Seluruh logika bisnis: manajemen repositori, pencarian, preview, variabel, drag-drop, copy, insert |
| **Content Script** | `content.js` | Skrip yang di-inject ke halaman web untuk menangani drop event dan overlay |
| **Manifest** | `manifest.json` | Konfigurasi ekstensi MV3, permissions, host_permissions, content_scripts |
| **Ikon** | `icons/` | Ikon ekstensi (16px, 48px, 128px) serta ikon SVG untuk action toolbar |

### 1.3 Prinsip Arsitektur

1. **Zero Dependency**: Tidak ada library eksternal. Markdown parser, variable engine, dan seluruh UI ditulis dalam vanilla JavaScript murni.
2. **Serverless**: Tidak ada backend server. Komunikasi langsung ke GitHub API publik.
3. **Cache-First**: Daftar file diutamakan dari cache localStorage; GitHub API sebagai fallback.
4. **Graceful Degradation**: Setiap subsistem memiliki fallback jika komponen lain gagal (misalnya drag async fallback ke chrome.storage jika dataTransfer tidak siap).
5. **Minimal Permission**: Hanya tiga permission yang diminta — `activeTab`, `scripting`, `storage`.

---

## 2. Arsitektur Manifest V3

### 2.1 Service Worker vs Popup

blinker menggunakan arsitektur popup tradisional MV3, bukan service worker. Ini adalah keputusan arsitektural yang disengaja:

```
┌─────────────────────────────────────────────────────────────────┐
│                    MANIFEST V3 ARCHITECTURE                      │
│                                                                  │
│  ┌─────────────────────────────────────┐                        │
│  │         Action Popup                │                        │
│  │  (popup.html + popup.js)            │                        │
│  │                                     │                        │
│  │  Lifecycle:                         │                        │
│  │  1. User klik icon toolbar          │                        │
│  │  2. Chrome buka popup.html          │                        │
│  │  3. DOMContentLoaded → init()      │                        │
│  │  4. Semua state in-memory live      │                        │
│  │     selama popup terbuka            │                        │
│  │  5. Popup ditutup → semua state     │                        │
│  │     in-memory hilang                │                        │
│  └─────────────────────────────────────┘                        │
│                                                                  │
│  ┌─────────────────────────────────────┐                        │
│  │         Content Script              │                        │
│  │  (content.js)                       │                        │
│  │                                     │                        │
│  │  Lifecycle:                         │                        │
│  │  1. Di-inject saat halaman dimuat   │                        │
│  │     (sesuai manifest matches)       │                        │
│  │  2. IIFE guard: cek window.__flag   │                        │
│  │  3. Event listeners: dragover,      │                        │
│  │     dragleave, drop (capture phase) │                        │
│  │  4. Tidak terikat lifecycle popup   │                        │
│  │  5. Hidup selama halaman terbuka    │                        │
│  └─────────────────────────────────────┘                        │
│                                                                  │
│  ┌─────────────────────────────────────┐                        │
│  │         chrome.storage.local         │                        │
│  │  (Bridge antara popup & content)     │                        │
│  │                                     │                        │
│  │  Keys:                               │                        │
│  │  - mdown_drag_content: string       │                        │
│  │  - mdown_drag_ready: boolean         │                        │
│  │  - mdown_drag_path: string          │                        │
│  └─────────────────────────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Popup Lifecycle

Siklus hidup popup dimulai saat ikon ekstensi diklik dan berakhir saat popup ditutup:

```
┌──────────────┐
│ Popup Closed │  ← state in-memory tidak dipertahankan
└──────┬───────┘
       │ klik ikon ekstensi
       ▼
┌──────────────┐
│ Popup Loads  │  ← DOMContentLoaded
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌───────────────────┐
│ Init State   │────►│ loadRepo('prd')  │
│ - activeRepo │     └────────┬──────────┘
│ - allFiles[] │              │
│ - filtered[] │     ┌────────▼──────────┐
│ - dst        │     │ Cek Cache Cache   │
└──────────────┘     │ localStorage      │
                     └────────┬──────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
       ┌────────────┐  ┌────────────┐  ┌────────────┐
       │ Cache Hit  │  │ Cache Miss │  │ Error      │
       │ (< 10 mnt) │  │ Fetch API  │  │ Tampilkan  │
       └──────┬─────┘  └──────┬─────┘  │ Pesan      │
              │               │         └────────────┘
              │               ▼
              │        ┌────────────┐
              │        │ Simpan ke  │
              │        │ localStorage│
              │        └────────────┘
              ▼               │
       ┌──────────────────────┘
       │
       ▼
┌──────────────┐
│ renderList() │  ← file ditampilkan, user bisa berinteraksi
└──────────────┘
       │
       ├──► searchInput → filter → renderList(filtered)
       ├──► klik preview → openPreview() → switch view
       ├──► drag item → dragstart → dataTransfer + chrome.storage
       ├──► klik copy → navigator.clipboard.writeText()
       └──► klik insert → chrome.scripting.executeScript()
```

**Catatan penting tentang lifecycle**:

- Setiap kali popup dibuka, state diinisialisasi dari awal. Data yang bertahan hanyalah cache di `localStorage`.
- Variabel `contentCache` (Map untuk prefetch) akan kosong setiap popup dibuka.
- Semua event listener di popup.js dipasang saat inisialisasi dan hidup selama popup terbuka.

### 2.3 Content Script Injection

Content script di-inject berdasarkan deklarasi di manifest.json:

```json
{
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content.js"]
  }]
}
```

**Mekanisme singleton guard**:

```javascript
(function(){
  if(window.__mdownDropperV2) return;
  window.__mdownDropperV2 = true;
  // ... event listeners
})();
```

Ini mencegah double-injection jika terjadi reload ekstensi atau inject ulang oleh Chrome.

**Capture phase event listeners**: Semua event handler (`dragover`, `dragleave`, `drop`) menggunakan `true` sebagai parameter ketiga (`useCapture`). Ini penting karena banyak halaman web memanggil `preventDefault()` pada event `dragover` dan `drop` di fase bubbling — dengan capture phase, content script mendapat kesempatan pertama untuk memproses event sebelum halaman web.

### 2.4 chrome.storage sebagai Bridge

`chrome.storage.local` berfungsi sebagai jembatan komunikasi antara popup.js (yang hidup di konteks ekstensi) dan content.js (yang hidup di konteks halaman web). Mekanisme ini diperlukan karena `dataTransfer` antar konteks yang berbeda (popup ke halaman web) tidak selalu sinkron — terutama saat konten file belum siap di-prefetch.

Protokol bridge:

```
Popup.js (dragstart)                  content.js (drop)
       │                                    │
       │  chrome.storage.local.set({        │
       │    mdown_drag_content: string,     │
       │    mdown_drag_ready: true          │
       │  })                                │
       │                                    │
       │          ┌──────────────┐           │
       │──────────► chrome.stor. │           │
       │          │    local     │───────────►│
       │          └──────────────┘           │
       │                                    │
       │                            chrome.storage.local.get(
       │                              ['mdown_drag_content',
       │                               'mdown_drag_ready'])
       │                                    │
       │                            insertText(target, content)
       │                                    │
       │                            chrome.storage.local.remove(
       │                              ['mdown_drag_content',
       │                               'mdown_drag_ready',
       │                               'mdown_drag_path'])
```

---

## 3. Arsitektur Modul

### 3.1 Modul GitHub Integration (Repository Manager)

**Lokasi**: `popup.js` — fungsi `fetchFileList()`, `fetchContent()`, konstanta `REPOS`, `CACHE_TTL`.

**Tanggung jawab**:
- Mengelola koneksi ke GitHub API untuk dua repositori.
- Mengambil file tree via Git Trees API dengan depth recursive.
- Mengambil konten file via raw.githubusercontent.com.
- Menyediakan caching dengan TTL 10 menit di localStorage.

**Struktur internal**:

```
REPOS (konfigurasi hardcoded)
  ├── prd: { owner, repo, label, icon, color, filter, githubUrl }
  └── mdown: { owner, repo, label, icon, color, filter, githubUrl }

fetchFileList(repoKey, force)
  ├── force=true || cache miss → fetch GitHub API
  ├── force=false, cache hit → parse localStorage
  ├── Filter response tree dengan cfg.filter
  └── Simpan/salurkan Array<{path, size}>

fetchContent(repoKey, path)
  └── GET raw.githubusercontent.com/{owner}/{repo}/main/{path}
      └── return text content
```

**Alur detail cache**:

```
fetchFileList('prd', false)
  │
  ├─ key = 'mdown_v3_prd'
  ├─ localStorage.getItem(key)
  │    ├─ null → fetch API
  │    ├─ JSON.parse gagal → fetch API (fallback)
  │    └─ sukses → cek Date.now() - cached.ts < 10 * 60 * 1000
  │         ├─ true → return cached.files
  │         └─ false → fetch API
  │
  └─ fetch API sukses
       ├─ simpan { ts: Date.now(), files } ke localStorage
       └─ return files
```

### 3.2 Modul UI Controller

**Lokasi**: `popup.js` — fungsi renderList(), switchRepo(), event listeners, DOM references.

**Tanggung jawab**:
- Mengelola rendering UI berdasarkan state.
- Menangani interaksi pengguna (klik tab, input pencarian, klik preview, dll).
- Mengelola dua view: list view dan preview view.
- Menampilkan indikator loading, error, dan empty state.

**Struktur view management**:

```
Popup UI
  ├── #viewList (default active)
  │    ├── Header + Search
  │    ├── Hint bar (drag instruction)
  │    ├── #listScroll (file items)
  │    │    ├── [Loading] Spinner
  │    │    ├── [Error] Pesan error
  │    │    ├── [Empty] "Tidak ada file"
  │    │    └── [Normal] Section + File Items
  │    └── Footer (file count + GitHub link)
  │
  └── #viewPreview
       ├── Preview header (back + filename + tabs)
       ├── Vars bar (variable chips)
       ├── #previewScroll (content rendered/raw)
       └── Preview footer (drag + copy + insert)
```

**State-dependent rendering**:

```javascript
renderList(files) {
  // if empty → tampilkan "Tidak ada file"
  // else → group by folder, generate HTML, inject
}

// View switching
switchRepo(key) {
  // update tab UI
  // reset search
  // panggil loadRepo(key)
  // update hint dot color
  // update footer link
}
```

### 3.3 Modul Variable Engine

**Lokasi**: `popup.js` — fungsi `extractVars()`, `applyVars()`, `openVarModal()`, `renderPreview()`.

**Tanggung jawab**:
- Mendeteksi pola `{{VARIABLE}}` dalam konten markdown.
- Menyediakan antarmuka editor (modal) untuk mengisi nilai variabel.
- Menerapkan substitusi variabel ke konten.
- Mempertahankan state variabel selama sesi preview.

**Alur kerja Variable Engine**:

```
extractVars(text)
  │
  ├─ regex: /\{\{([A-Z0-9_]+)\}\}/g
  ├─ mapping: ['TITLE', 'AUTHOR', 'DATE']
  └─ deduplikasi dengan new Set()

applyVars(text)
  │
  ├─ iterasi Object.entries(varValues)
  ├─ untuk setiap {k, v} dengan v truthy:
  │    replaceAll('{{' + k + '}}', v)
  └─ return text yang sudah disubstitusi

renderPreview()
  │
  ├─ vars = extractVars(rawContent)
  ├─ content = applyVars(rawContent)
  │
  ├─ Render vars bar
  │    └─ jika vars.length > 0: tampilkan chips
  │
  ├─ Jika activeTab === 'rendered':
  │    ├─ html = renderMarkdown(content)
  │    ├─ untuk setiap var unfilled di vars:
  │    │    replace {{VAR}} dengan span.var-rendered
  │    └─ inject ke .md-body
  │
  └─ Jika activeTab === 'raw':
       ├─ escaped = HTML-escape(rawContent)
       ├─ highlight vars dengan span.var-highlight
       └─ inject ke .raw-body
```

**Variable state lifecycle**:

```
openPreview(file) → varValues = {} (reset)
       │
       ▼
User klik chip → openVarModal(name) → isi nilai
       │
       ▼
vmApply.click() → varValues[name] = value
       │
       ▼
renderPreview() → applyVars(rawContent) → tampilkan hasil
       │
       ▼
User klik Back → varValues di-reset (varValues = {})
       │
       ▼
openPreview(file baru) → varValues = {} (reset lagi)
```

### 3.4 Modul Content Transfer

**Lokasi**: `popup.js` — fungsi `prefetchContent()`, event handler `dragstart`, `pfDrag.dragstart`, `pfCopy.click`, `pfInsert.click`.

**Tanggung jawab**:
- Menyediakan tiga mekanisme transfer konten: drag-and-drop, copy, dan insert.
- Mengelola prefetch konten untuk responsivitas drag.
- Mengelola komunikasi dengan content script via chrome.storage.

**Tiga jalur transfer**:

```
┌────────────────────────────────────────────────────────┐
│                 CONTENT TRANSFER MODULE                  │
│                                                          │
│  1. Drag & Drop (dari List)                             │
│     ┌──────────┐    ┌──────────────┐    ┌───────────┐  │
│     │ Hover    │───►│ Prefetch     │───►│ Cache di  │  │
│     │ file item│    │ Content      │    │ Map       │  │
│     └──────────┘    └──────────────┘    └────────────┘  │
│                                                          │
│     ┌──────────┐    ┌──────────────────────────────┐     │
│     │ Dragstart│───►│ dataTransfer (sync jika ada) │     │
│     │          │    │ chrome.storage (fallback)    │     │
│     └──────────┘    └──────────────────────────────┘     │
│                                                          │
│  2. Drag & Drop (dari Preview)                          │
│     ┌──────────┐    ┌──────────────────────────────┐     │
│     │ Drag     │───►│ dataTransfer (content final   │     │
│     │ Button   │    │ dengan variabel terisi)      │     │
│     └──────────┘    └──────────────────────────────┘     │
│                                                          │
│  3. Copy to Clipboard                                    │
│     ┌──────────┐    ┌──────────────────────────────┐     │
│     │ Copy     │───►│ navigator.clipboard          │     │
│     │ Button   │    │ .writeText(content final)    │     │
│     └──────────┘    └──────────────────────────────┘     │
│                                                          │
│  4. Insert ke Web                                        │
│     ┌──────────┐    ┌──────────────────────────────┐     │
│     │ Insert   │───►│ chrome.tabs.query()           │     │
│     │ Button   │    │ → chrome.scripting           │     │
│     │          │    │   .executeScript(func, args) │     │
│     └──────────┘    └──────────────────────────────┘     │
└────────────────────────────────────────────────────────┘
```

**Prefetch strategy detail**:

```javascript
// Prefetch saat mouse enter — antisipasi drag
item.addEventListener('mouseenter', () => prefetchContent(repo, path));

// Prefetch saat pointer down — fallback jika hover tidak sempat
item.addEventListener('pointerdown', () => prefetchContent(repo, path));

function prefetchContent(repoKey, path) {
  const key = repoKey + ':' + path;
  if (contentCache.has(key)) return; // sudah di-fetch atau sedang proses

  contentCache.set(key, null); // marker "sedang loading"

  fetchContent(repoKey, path)
    .then(c => contentCache.set(key, c))
    .catch(() => contentCache.delete(key)); // gagal → hapus marker
}
```

**Prioritas konten saat drop di halaman web**:

```
Priority 1 (sync):  dataTransfer.getData('text/plain')
                    Jika konten real (bukan {{LOADING:...}})

Priority 2 (async): chrome.storage.local.get()
                    Fallback jika konten belum siap saat dragstart
```

### 3.5 Modul Content Script

**Lokasi**: `content.js` — seluruh file.

**Tanggung jawab**:
- Mendeteksi elemen target drop yang valid.
- Menampilkan overlay visual selama drag.
- Menangani event drop dan menyisipkan konten.
- Memberikan konfirmasi visual (flash hijau) setelah drop.

**Arsitektur internal content.js**:

```
content.js (IIFE)
  │
  ├─ Singleton guard: window.__mdownDropperV2
  │
  ├─ State: dropOverlay (DOM element | null)
  │
  ├─ isDropTarget(el): boolean
  │    └─ cek tagName === 'TEXTAREA'
  │       cek tagName === 'INPUT' && type di ['text','search','url','email']
  │       cek isContentEditable === true
  │
  ├─ createOverlay(el): void
  │    └─ buat div fixed mengikuti rect elemen
  │       border dashed biru, background transparan
  │       label "📄 Drop markdown here"
  │       z-index 2147483647
  │
  ├─ removeOverlay(): void
  │    └─ hapus dropOverlay dari DOM
  │
  ├─ insertText(el, content): void
  │    ├─ TEXTAREA/INPUT: insert di posisi kursor
  │    ├─ contentEditable: Insert via Selection API
  │    └─ flash konfirmasi (green outline 700ms)
  │
  └─ Event Handlers (capture phase)
       ├─ dragover: deteksi target, overlay, preventDefault
       ├─ dragleave: hapus overlay
       └─ drop: ambil konten, insert, cleanup
```

---

## 4. Design Patterns

### 4.1 Module Pattern (IIFE)

Baik `popup.js` maupun `content.js` menggunakan Module Pattern. Content script menggunakan IIFE (Immediately Invoked Function Expression) untuk isolasi:

```javascript
(function() {
  if(window.__mdownDropperV2) return;
  window.__mdownDropperV2 = true;
  // ... semua logika di sini, tidak ada global leak
})();
```

Popup.js meskipun tidak dibungkus IIFE eksplisit, secara alami terisolasi karena:
- Popup berjalan di konteks ekstensi sendiri (bukan halaman web).
- Semua variabel dideklarasikan dengan `let` atau `const` di file scope.
- Tidak ada objek yang diekspor ke `window`.

### 4.2 Observer Pattern (Event-Driven)

blinker menggunakan arsitektur berbasis event, bukan state management library:

| Event | Trigger | Observer(s) |
|---|---|---|
| `DOMContentLoaded` | Browser | `init()` — loadRepo, setup tabs |
| `input` di searchInput | User mengetik | `renderList(filtered)` |
| `click` di repo tab | User ganti repo | `switchRepo(key)` |
| `click` di preview button | User lihat file | `openPreview(repo, path)` |
| `click` di variable chip | User edit variabel | `openVarModal(name)` |
| `click` di Terapkan | User simpan variabel | `varValues[key]=val`, `renderPreview()` |
| `dragstart` di file item | User mulai drag | `dataTransfer.setData()`, `chrome.storage.set()` |
| `mouseenter` di file item | User hover | `prefetchContent()` |
| `drop` di halaman | User drop konten | `insertText()`, cleanup |

### 4.3 Cache-Aside Pattern

Cache-aside digunakan untuk caching daftar file dari GitHub API:

```
loadRepo(key)
  │
  ├─ CACHE HIT (localStorage, TTL valid)
  │    └─ return cached data, no API call
  │
  └─ CACHE MISS (TTL expired / tidak ada)
       ├─ fetch GitHub API
       ├─ simpan ke localStorage dengan timestamp
       └─ return fresh data
```

**Varian: Refresh Force** — tombol refresh menggunakan parameter `force=true` yang melewati cache sama sekali:

```javascript
refreshBtn.addEventListener('click', () => {
  localStorage.removeItem(cacheKey(activeRepo));
  loadRepo(activeRepo, true); // force = true
});
```

### 4.4 Proxy Pattern (chrome.storage Bridge)

`chrome.storage.local` digunakan sebagai proxy antara popup.js dan content.js. Ini adalah adaptasi dari Proxy Pattern karena storage bertindak sebagai perantara yang memungkinkan dua konteks terisolasi berkomunikasi:

```
popup.js (producer)
  │
  │  set({ mdown_drag_content: data })
  │
  ▼
┌──────────────────────┐
│ chrome.storage.local  │  ← Proxy/Bridge
│ (shared state)        │
└──────────────────────┘
  │
  │  get(['mdown_drag_content'])
  │
  ▼
content.js (consumer)
```

Mekanisme ini digunakan karena `dataTransfer` antar konteks ekstensi dan halaman web terbatas — data tidak bisa di-set secara asynchronous dari popup ke halaman web. Proxy storage menyediakan kanal komunikasi asynchronous yang handal.

### 4.5 Singleton Pattern (Content Script Guard)

Content script menggunakan singleton guard untuk mencegah multiple injection di halaman yang sama:

```javascript
if(window.__mdownDropperV2) return;
window.__mdownDropperV2 = true;
```

Ini penting karena:
- Chrome kadang meng-inject ulang content script saat ekstensi di-reload.
- Halaman dengan iframe dapat menyebabkan multiple injection.
- Mencegah event listener terdaftar dua kali.

---

## 5. Diagram Aliran Data

### 5.1 Flow A: Browse Repositori

Aliran saat pengguna membuka popup dan menjelajahi daftar file:

```
User            Popup.js            localStorage        GitHub API
 │                │                    │                  │
 ├─ klik ikon ───►                    │                  │
 │               DOMContentLoaded     │                  │
 │                │                    │                  │
 │               loadRepo('prd')      │                  │
 │                ├──► cek cache ─────►                  │
 │                │   (mdown_v3_prd)  │                  │
 │                │◄── cache miss ────│                  │
 │                │                    │                  │
 │                ├─────────────────────────────────────►│
 │                │  GET /git/trees/                      │
 │                │  main?recursive=1                    │
 │                │◄─────────────────────────────────────│
 │                │  200 + tree[]                        │
 │                │                    │                  │
 │                ├──► simpan cache ──►                  │
 │                │   {ts,files}      │                  │
 │                │                    │                  │
 │               filter files         │                  │
 │                │  (type=blob,       │                  │
 │                │   .md/.json,       │                  │
 │                │   exclude README)  │                  │
 │                │                    │                  │
 │               group by folder      │                  │
 │                │                    │                  │
 │               renderList(files)    │                  │
 │                │                    │                  │
 │◄── list files ─│                    │                  │
 │    ditampilkan  │                    │                  │
 │                │                    │                  │
 ├─ ketik di      │                    │                  │
 │  search ──────►│                    │                  │
 │                ├─ rawQ = input val  │                  │
 │                ├─ expandedQ =       │                  │
 │                │  SEARCH_ALIASES[rawQ] atau rawQ       │
 │                ├─ filter allFiles   │                  │
 │                │  (path.includes)   │                  │
 │                ├─ renderList(filtered)                │
 │◄── filtered ───│                    │                  │
 │    list        │                    │                  │
```

### 5.2 Flow B: Preview File

Aliran saat pengguna melihat preview file markdown:

```
User            Popup.js             GitHub Raw          DOM
 │                │                     │                │
 ├─ klik 👁 ─────►                     │                │
 │               openPreview(repo,path) │                │
 │                │                     │                │
 │                ├─ currentPath = path │                │
 │                ├─ currentRepo = repo │                │
 │                ├─ varValues = {}     │                │
 │                ├─ activeTab = 'rendered'              │
 │                │                     │                │
 │                ├─ switch view ───────► #viewPreview   │
 │                ├─ spinner ──────────► #previewScroll   │
 │                │                     │                │
 │                ├────────────────────────────────────► │
 │                │ GET raw content     │                │
 │                │◄────────────────────│                │
 │                │  (text content)     │                │
 │                │                     │                │
 │               extractVars(content)   │                │
 │                │  regex: {{VAR}}     │                │
 │                │  ['PROJECT_NAME',   │                │
 │                │   'AUTHOR', ...]    │                │
 │                │                     │                │
 │               applyVars(content)    │                │
 │                │  ganti {{VAR}}      │                │
 │                │  dengan nilai (jika ada)             │
 │                │                     │                │
 │               renderMarkdown(content)                │
 │                │  parser kustom (regex)               │
 │                │  h1, h2, h3, p, ul, ol,             │
 │                │  table, blockquote, code, link       │
 │                │                     │                │
 │               highlight vars unfilled                │
 │                │  span.var-rendered  │                │
 │                │                     │                │
 │                ├─ render HTML ──────► #previewScroll  │
 │                │                     │                │
 │◄── preview ────│────────────────────│                │
 │    tampil      │                     │                │
```

### 5.3 Flow C: Variable Edit

Aliran saat pengguna mengedit variabel dan melihat hasilnya secara live:

```
User            Popup.js                DOM
 │                │                     │
 │  (Preview aktif, ada {{VAR}})        │
 │                │                     │
 ├─ klik chip ───►                     │
 │  {{AUTHOR}}    │                     │
 │                openVarModal('AUTHOR')│
 │                ├─ editingVar='AUTHOR'│
 │                ├─ vmVarName.text     │
 │                │  = '{{AUTHOR}}'     │
 │                ├─ vmInput.value =    │
 │                │  varValues['AUTHOR']│
 │                ├─ modal open ────────► #varModal
 │                │                     │
 │◄── modal ──────│────────────────────│
 │    tampil      │                     │
 │                │                     │
 ├─ isi input ───►                     │
 │  "John Doe"    │                     │
 │                │                     │
 ├─ tekan Enter ─►                     │
 │                │                     │
 │               vmApply.click()       │
 │                │                     │
 │                ├─ varValues['AUTHOR']│
 │                │  = 'John Doe'       │
 │                ├─ closeModal ────────► #varModal
 │                ├─ renderPreview()    │
 │                │                     │
 │                ├─ applyVars(raw)     │
 │                │  '{{AUTHOR}}' →     │
 │                │  'John Doe'         │
 │                │                     │
 │                ├─ re-render ────────► #previewScroll
 │                │                     │
 │◄── preview ────│────────────────────│
 │    update      │  {{AUTHOR}} sudah   │
 │    (live)      │  diganti "John Doe" │
```

**Edge case**: Jika variabel belum diisi, `{{VAR}}` tetap tampil dengan highlight. Jika nilai yang diisi adalah string kosong (`''`), substitusi tidak terjadi (hanya nilai truthy yang diganti). Ini memungkinkan pengguna mengosongkan nilai untuk mengembalikan ke placeholder.

### 5.4 Flow D: Drag & Drop

Aliran drag-and-drop dari daftar file ke halaman web, mencakup skenario sinkron dan asinkron:

```
Popup.js (Waktu)          chrome.storage        content.js          Halaman Web
  │                            │                    │                   │
  │ [t=-3s] hover file         │                    │                   │
  │ prefetchContent('prd',     │                    │                   │
  │   'file.md')               │                    │                   │
  │ fetch(raw url) ───────────►│                    │                   │
  │◄─ content ────────────────│                    │                   │
  │ cache in Map               │                    │                   │
  │                            │                    │                   │
  │ [t=0s] dragstart           │                    │                   │
  │ cek contentCache[key]      │                    │                   │
  │  ├─ CACHED:               │                    │                   │
  │  │  dataTransfer.setData()│                    │                   │
  │  │  chrome.storage.set() ─►│ mdown_drag_content │                   │
  │  │                         │ mdown_drag_ready   │                   │
  │  │                         │                    │                   │
  │  └─ NOT CACHED:           │                    │                   │
  │     dataTransfer.setData(  │                    │                   │
  │       '{{LOADING:path}}')  │                    │                   │
  │     fetch async ──────────►│                    │                   │
  │     → chrome.storage.set() │                    │                   │
  │                            │                    │                   │
  │ [t=+1s] user drag ke       │                    │                   │
  │         textarea            │                    │                   │
  │                            │                    │                   │
  │                            │    dragover ───────► target textarea    │
  │                            │      overlay ──────► dashed border      │
  │                            │                    │                   │
  │                            │    drop ───────────►                   │
  │                            │                    │                   │
  │                            │    Priority 1:     │                   │
  │                            │    dt.getData() ───► 'text/plain'      │
  │                            │      CACHED: konten │                   │
  │                            │      → insertText() │                   │
  │                            │                    │                   │
  │                            │    Priority 2:      │                   │
  │                            │    (jika P1 gagal)  │                   │
  │                            │ chrome.storage.get()│                   │
  │                            │◄────────────────────│                   │
  │                            │  mdown_drag_content  │                   │
  │                            │                    │                   │
  │                            │    insertText() ────► target.value      │
  │                            │      flash green ───► outline: #3fb950  │
  │                            │      after 700ms ───► outline restore   │
  │                            │                    │                   │
  │                            │    cleanup:         │                   │
  │                            │    chrome.storage.  │                   │
  │                            │    remove(keys) ────►                   │
  │                            │                    │                   │
  │ [t=+1.5s] dragend          │                    │                   │
  │ hapus class 'dragging'     │                    │                   │
```

### 5.5 Flow E: Copy ke Clipboard

Aliran paling sederhana — tidak memerlukan content script:

```
User               Popup.js                   Clipboard API
 │                   │                            │
 ├─ klik Copy ──────►                            │
 │                  getFinalContent()             │
 │                   │  applyVars(rawContent)     │
 │                   │                            │
 │                  navigator.clipboard           │
 │                   .writeText(content) ─────────►
 │                   │                            │
 │                  [sukses]                      │
 │                   ├─ btn.text = '✓ Copied!'    │
 │                   ├─ setTimeout 1.5 detik      │
 │                   │  → btn.text = '📋 Copy'    │
 │                   │                            │
 │                  [gagal]                       │
 │                   ├─ btn.text = '✗'            │
 │                   ├─ setTimeout 1.5 detik      │
 │                   │  → btn.text = 'Copy'       │
 │                   │                            │
 │◄── feedback ──────│                            │
 │    visual         │                            │
```

### 5.6 Flow F: Insert ke Web

Aliran untuk menyisipkan konten langsung ke elemen aktif di halaman web:

```
User              popup.js              chrome.scripting          Halaman Web
 │                  │                        │                       │
 ├─ klik Insert ───►                        │                       │
 │                 getFinalContent()        │                       │
 │                  │                        │                       │
 │                 chrome.tabs.query(       │                       │
 │                  {active: true,           │                       │
 │                   currentWindow: true})   │                       │
 │                  ├───────────────────────►│                       │
 │                  │◄── [{ id: 123 }] ─────│                       │
 │                  │                        │                       │
 │                 chrome.scripting          │                       │
 │                  .executeScript({         │                       │
 │                   target: { tabId: 123 }, │                       │
 │                   func: insertHandler,    │                       │
 │                   args: [content]         │                       │
 │                  }) ────────────────────►│                       │
 │                                           │                       │
 │                                           ├─ func(content) ─────►│
 │                                           │                       │
 │                                           │  document             │
 │                                           │  .activeElement ─────►│
 │                                           │                       │
 │                                           │  [CABANG]:            │
 │                                           │                       │
 │                                           │  TEXTAREA/INPUT:      │
 │                                           │    selectionStart     │
 │                                           │    selectionEnd       │
 │                                           │    value = slice(0,s) │
 │                                           │          + content    │
 │                                           │          + slice(e)   │
 │                                           │    dispatch input/    │
 │                                           │    change events      │
 │                                           │                       │
 │                                           │  contentEditable:     │
 │                                           │    execCommand(       │
 │                                           │     'insertText',     │
 │                                           │     false, content)   │
 │                                           │                       │
 │                                           │  else:                │
 │                                           │    alert('Klik dulu   │
 │                                           │     field')           │
 │                                           │                       │
```

### 5.7 Flow G: Refresh Cache

Aliran saat pengguna memaksa refresh dari GitHub:

```
User              Popup.js                  localStorage        GitHub API
 │                  │                          │                  │
 ├─ klik ↻ ────────►                          │                  │
 │                 refreshBtn.click           │                  │
 │                  │                          │                  │
 │                 localStorage.removeItem(   │                  │
 │                  'mdown_v3_' + activeRepo) │                  │
 │                  ├────────────────────────►│                  │
 │                  │                          │                  │
 │                 loadRepo(activeRepo, true) │                  │
 │                  │                          │                  │
 │                  ├─ spinner ────────────────│                  │
 │                  │  "Mengambil dari GitHub" │                  │
 │                  │                          │                  │
 │                  ├───────────────────────────────────────────►│
 │                  │  GET /git/trees/...      │                  │
 │                  │◄───────────────────────────────────────────│
 │                  │  200 + tree[]            │                  │
 │                  │                          │                  │
 │                  ├─ simpan ke localStorage ─►                  │
 │                  │  { ts: now, files }      │                  │
 │                  │                          │                  │
 │                 renderList(files)           │                  │
 │                  │                          │                  │
 │◄── list baru ────│                          │                  │
 │    tampil        │                          │                  │
```

---

## 6. Arsitektur Performa

### 6.1 Strategi Caching

blinker menerapkan tiga tingkat caching untuk mengoptimalkan performa:

| Tingkat | Media | Data | TTL | Kapasitas |
|---|---|---|---|---|
| L1 — In-Memory | `Map` (contentCache) | Konten file (prefetch) | Sesi popup | Tidak terbatas (bergantung konten) |
| L2 — localStorage | `localStorage` | Daftar file (metadata) | 10 menit | ~5-10 MB per origin (terbatas browser) |
| L3 — HTTP Cache | Browser cache | Respons GitHub API | Tergantung header | Tergantung browser |

**Diagram hierarki cache**:

```
Request file list
  │
  ├─ L1: In-Memory (contentCache)
  │    └─ CACHE HIT → return instant (untuk drag)
  │
  ├─ L2: localStorage (file list)
  │    └─ CACHE HIT (< 10 menit) → parse & return
  │
  └─ L3: GitHub API (HTTP cache)
       └─ CACHE MISS → fetch API → simpan L2 → return
```

### 6.2 Prefetching

Prefetching adalah strategi utama untuk membuat drag-and-drop terasa instan:

**Kapan prefetch terjadi**:
1. `mouseenter` pada file item — saat kursor masuk area item.
2. `pointerdown` pada file item — saat pointer ditekan (sebelum drag dimulai).

**Mekanisme**:
```javascript
function prefetchContent(repoKey, path) {
  const key = `${repoKey}:${path}`;
  if (contentCache.has(key)) return; // sudah ada atau sedang loading

  contentCache.set(key, null);       // marker "sedang loading"

  fetchContent(repoKey, path)
    .then(c => contentCache.set(key, c))
    .catch(() => contentCache.delete(key));
}
```

**Efektivitas**: Dengan dua trigger (mouseenter + pointerdown), probabilitas konten sudah di-cache saat dragstart sangat tinggi karena:
- Mouseenter memberi waktu ~200-500ms sebelum user benar-benar mulai drag.
- Pointerdown memberi ~100-300ms sebelum dragstart.
- Fetch konten dari raw.githubusercontent.com biasanya selesai dalam 300-800ms untuk file rata-rata (< 50 KB).

### 6.3 DOM Optimization

Popup berukuran 400x600px dengan keterbatasan sumber daya. Optimasi DOM yang diterapkan:

1. **InnerHTML batch rendering**: HTML untuk seluruh daftar file digabung dalam array, lalu di-inject sekali via `innerHTML`. Tidak ada node-by-node DOM manipulation.

```javascript
// Optimal: batch → single injection
const html = [];  // push semua fragmen
html.push(`<div class="file-item">...</div>`);
listScroll.innerHTML = html.join('');

// Tidak menggunakan: appendChild per item
```

2. **Event delegation via querySelectorAll**: Semua event listener dipasang dengan iterasi `querySelectorAll` setelah HTML di-inject. Tidak ada event bubbling delegation yang kompleks.

3. **Render ulang preview penuh**: Setiap kali variabel berubah, seluruh preview di-render ulang (bukan patch). Ini sederhana dan aman, dan karena ukuran file markdown biasanya kecil (< 50 KB), overhead minimal.

4. **Minimal reflow**: Semua perubahan style terkonsentrasi pada class toggle (`.active`, `.has-vars`, `.dragging`, `.open`, `.copied`), bukan inline style manipulation.

5. **Spinner sebagai state indicator**: Elemen spinner ditampilkan dengan mengganti seluruh innerHTML konten — bukan show/hide elemen terpisah. Ini mengurangi kompleksitas DOM state management.

### 6.4 Batasan dan Trade-off

| Aspek | Trade-off | Alasan |
|---|---|---|
| Markdown parser | Regex-based, tidak full CommonMark | Ukuran popup kecil (< 2 KB tambahan), cukup untuk dokumen prompt |
| Full re-render | Tidak efisien untuk file besar | File markdown rata-rata < 20 KB; overhead render < 50ms |
| localStorage untuk cache | Tidak bisa diakses content script | Cukup untuk metadata; konten tidak di-cache di storage |
| contentCache Map | Hilang saat popup ditutup | Popup sementara; MAP lebih cepat dari storage untuk sesi pendek |
| Tidak ada virtual scroll | Semua node file di-render sekaligus | Rata-rata file < 200; jika 500+ mungkin perlu optimasi |

---

## 7. Arsitektur Keamanan

### 7.1 Model Permission

blinker meminta tiga permission minimum untuk fungsionalitasnya:

```json
{
  "permissions": ["activeTab", "scripting", "storage"],
  "host_permissions": [
    "https://api.github.com/*",
    "https://raw.githubusercontent.com/*",
    "<all_urls>"
  ]
}
```

| Permission | Kegunaan | Risiko Jika Disalahgunakan |
|---|---|---|
| `activeTab` | Akses tab aktif untuk inject script (insert ke web) | Terbatas hanya saat user berinteraksi dengan ekstensi |
| `scripting` | `chrome.scripting.executeScript()` untuk insert konten | Hanya bisa inject kode yang sudah ada di paket ekstensi |
| `storage` | `chrome.storage.local` untuk bridge drag-and-drop | Data terbatas pada satu origin ekstensi |
| `<all_urls>` | Content script untuk menangani drop di semua halaman | Diperlukan untuk deteksi target drop di semua situs |

**Mengapa `<all_urls>` diperlukan**: Content script harus berjalan di semua halaman untuk mendeteksi event `dragover` dan `drop`. Tanpa `<all_urls>`, drag-and-drop hanya akan berfungsi di domain tertentu.

**Mengapa tidak menggunakan OAuth atau permission tambahan**:
- `storage` hanya `local`, bukan `sync` — data tidak disinkronisasi ke cloud.
- Tidak ada `cookies`, `tabs` (hanya `activeTab`), `webRequest`, atau permission sensitif lainnya.
- Tidak ada permission untuk membaca konten halaman web — content script hanya mendengarkan event drag-and-drop, tidak membaca DOM.

### 7.2 Isolasi Konteks

blinker menjaga isolasi antara tiga konteks yang berbeda:

```
┌─────────────────────────────────────────────────────────┐
│              KONTEKS EKSTENSI (ISOLATED)                 │
│                                                          │
│  popup.html + popup.js                                   │
│  - Hanya bisa diakses oleh ekstensi sendiri              │
│  - Tidak ada akses DOM halaman web                       │
│  - Hanya bisa berkomunikasi via chrome API               │
│                                                          │
│  chrome.storage.local                                    │
│  - Partisi per origin ekstensi                           │
│  - Tidak bisa diakses oleh content script dari           │
│    ekstensi lain atau halaman web                        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              KONTEKS HALAMAN WEB                         │
│                                                          │
│  content.js                                              │
│  - Berjalan di halaman web tapi di isolated world        │
│  - Tidak bisa mengakses variabel JS halaman web          │
│  - Halaman web tidak bisa mengakses variabel content.js  │
│  - Hanya mendengarkan event DOM (dragover, drop)         │
│  - Membaca dataTransfer saja, tidak membaca konten lain  │
└─────────────────────────────────────────────────────────┘
```

**Isolated world MV3**: Content script Chrome berjalan di "isolated world" — tidak dapat diakses oleh JavaScript halaman web, dan tidak dapat mengakses variabel global halaman web. Ini adalah isolasi keamanan bawaan Chrome.

### 7.3 Sanitasi Konten

Meskipun bliker hanya menampilkan konten dari repositori GitHub publik (yang sudah melalui kontrol sumber), sanitasi tetap diterapkan:

1. **HTML escaping sebelum rendering markdown**:
```javascript
.replace(/&/g, '&amp;')
.replace(/</g, '&lt;')
.replace(/>/g, '&gt;')
```

2. **Markdown renderer tidak menghasilkan tag berbahaya**: Parser hanya menghasilkan tag HTML yang aman: `h1`-`h3`, `p`, `strong`, `em`, `code`, `pre`, `blockquote`, `a` (dengan `target="_blank"`), `ul`, `ol`, `li`, `table`, `tr`, `td`, `hr`. Tidak ada tag `script`, `iframe`, `object`, `embed`, `style`, `form`, `input`.

3. **Link tag menggunakan `target="_blank"`** semuanya dibuka di tab baru — bukan navigasi paksa.

4. **Tidak ada `innerHTML` untuk konten yang tidak di-sanitasi**: Hanya konten yang sudah melewati markdown renderer (yang hanya menghasilkan tag aman) yang di-inject via `innerHTML`.

5. **Teks input dari user (variabel) juga di-escape**: Sebelum dirender, nilai variabel yang dimasukkan user dilewatkan melalui fungsi markdown renderer yang sama, sehingga jika user memasukkan HTML berbahaya, akan di-escape.

### 7.4 Chrome Storage Security

`chrome.storage.local` digunakan sebagai bridge untuk data transfer. Data ini:
- Hanya bisa diakses oleh ekstensi yang sama (isolated storage).
- Tidak bisa diakses oleh halaman web atau ekstensi lain.
- Data dibersihkan segera setelah digunakan (`remove()` setelah drop).

---

## 8. Arsitektur Penanganan Error

### 8.1 Strategi Penanganan Error

blinker menggunakan strategi penanganan error berlapis:

```
Error terjadi
  │
  ├─ Catch di tingkat fungsi (fetch, preview, copy, dll)
  │    └─ Tampilkan pesan error yang jelas di UI
  │
  ├─ Fallback ke data alternatif (cache, default state)
  │    └─ Jika API gagal, tampilkan state error (bukan crash)
  │
  └─ Graceful degradation
       └─ Satu fitur gagal → fitur lain tetap berfungsi
```

### 8.2 Matriks Error per Komponen

| Komponen | Skenario Error | Mekanisme Deteksi | Feedback User | Fallback |
|---|---|---|---|---|
| **Repository Manager** | GitHub API 403 (rate limit) | `res.ok === false`, `res.status === 403` | `⚠️ Gagal: GitHub API 403 — {repo}` di list view | Cache localStorage (jika ada) |
| | GitHub API 404 (repo not found) | `res.ok === false`, `res.status === 404` | `⚠️ Gagal: GitHub API 404 — {repo}` | — |
| | Network offline (`fetch` gagal) | `fetch()` throw `TypeError` | `⚠️ Gagal: Failed to fetch` | — |
| | localStorage corrupt | `JSON.parse()` throw | Cache dianggap miss, fetch API | Fetch dari API |
| **Preview System** | File content 404 | `res.ok === false` | `⚠️ Gagal fetch {path}` di preview | — |
| | File terlalu besar (> 1 MB) | Ukuran dari metadata | Loading lama, tidak ada batasan eksplisit | — |
| **Variable Editor** | Input invalid (XSS attempt) | Tidak ada validasi khusus | Nilai diterima apa adanya | HTML otomatis di-escape saat render |
| **Copy** | Clipboard write denied | Promise reject | `✗` pada tombol (1.5 detik) | Silent catch |
| **Insert ke Web** | Tab tidak aktif | `chrome.tabs.query` return empty | Silent fail | — |
| | `activeElement` null | Conditional check | `alert('Klik dulu field yang ingin diisi.')` | — |
| | `chrome.scripting` tidak diizinkan | Promise reject | Silent fail | — |
| **Drag & Drop** | Prefetch gagal | `fetchContent()` reject | Content cache dihapus dari Map | Fetch async saat dragstart |
| | dataTransfer tidak punya konten | `getData('text/plain')` empty/null | Fallback ke chrome.storage | chrome.storage.local.get() |
| | chrome.storage juga kosong | `result.mdown_drag_ready` false | Drop tidak menghasilkan apa-apa | — |
| | Target drop tidak valid | `isDropTarget()` return false | Drop ignored | — |
| **Content Script** | Double injection | `window.__mdownDropperV2` guard | Tidak ada (silent skip) | IIFE return |
| | Overlay z-index konflik | Overlay pakai z-index 2147483647 | Overlay tetap tampil | — |

### 8.3 Arsitektur Try-Catch di Popup.js

Setiap fungsi async di popup.js memiliki try-catch sendiri:

```javascript
// fetchFileList — error ditangani oleh pemanggil (loadRepo)
async function fetchFileList(repoKey, force = false) {
  // ...
  const res = await fetch(apiUrl(cfg), { ... });
  if (!res.ok) throw new Error(`GitHub API ${res.status} — ${cfg.repo}`);
  // ...
}

// loadRepo — menangani error dari fetchFileList
async function loadRepo(key, force = false) {
  try {
    allFiles = await fetchFileList(key, force);
    renderList(allFiles);
  } catch (err) {
    listScroll.innerHTML = `<div class="state-wrap">...⚠️...${err.message}...</div>`;
  }
}

// openPreview — menangani error dari fetchContent
async function openPreview(repoKey, path) {
  try {
    rawContent = await fetchContent(repoKey, path);
    renderPreview();
  } catch (err) {
    previewScroll.innerHTML = `<div class="state-wrap">...⚠️...${err.message}...</div>`;
  }
}

// Copy — error handling dengan feedback visual
pfCopy.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(getFinalContent());
    pfCopy.textContent = '✓ Copied!';
  } catch (_) {
    pfCopy.textContent = '✗';
  }
  setTimeout(() => { pfCopy.textContent = '📋 Copy'; }, 1500);
});
```

### 8.4 Pemulihan State

Jika terjadi error, state aplikasi tetap konsisten:

| Skenario | State yang Terganggu | Pemulihan |
|---|---|---|
| API gagal saat loadRepo | `allFiles = []`, `filtered = []` | User bisa klik Refresh untuk coba lagi |
| API gagal saat preview | `rawContent = ''` | User bisa klik Back untuk kembali ke list |
| Drag gagal | Tidak ada state yang berubah | User bisa coba Copy atau Insert sebagai alternatif |
| Copy gagal | Tidak ada state yang berubah | Tersedia opsi Drag atau Insert |
| Insert gagal | Tidak ada state yang berubah | User bisa coba Copy manual |

### 8.5 Logging dan Debug

- **Console.warn**: Error prefetch dicatat ke console.warn (tidak mengganggu user):
  ```javascript
  .catch(err => console.warn(err));
  ```
- **Silent catch**: Error yang sudah memiliki feedback UI tidak perlu logging tambahan.
- **Tidak ada error tracking eksternal**: Sesuai prinsip minimal permission dan privasi.

---

## 9. Lampiran

### 9.1 Peta Berkas

```
mdown-collection-chrome/
├── manifest.json          ← Konfigurasi MV3: permissions, content_scripts, icons
├── popup.html             ← UI popup 400x600px (HTML + CSS inline)
├── popup.js               ← Seluruh logika bisnis ekstensi (534 baris)
├── content.js             ← Content script untuk drop handler (103 baris)
├── icons/
│   ├── blinker.svg        ← Ikon toolbar (SVG)
│   ├── icon16.png         ← Ikon 16px
│   ├── icon48.png         ← Ikon 48px
│   └── icon128.png        ← Ikon 128px
├── docs/
│   ├── 00_PROJECT_CHARTER.md
│   ├── index.md
│   ├── requirements/
│   │   ├── PRD.md
│   │   └── FRD.md
│   ├── api/
│   │   └── api.md
│   ├── security/
│   │   └── security.md
│   ├── database/
│   │   └── db.md
│   └── architecture/
│       └── architecture.md  ← Dokumen ini
└── README.md
```

### 9.2 Matriks Dependensi Antar Modul

| Modul | Bergantung Pada | Digunakan Oleh |
|---|---|---|
| Repository Manager | GitHub API, localStorage, `fetch` | File Browser, Preview System, Content Transfer |
| File Browser | Repository Manager, Search | Preview System |
| Preview System | Repository Manager, Variable Engine | Content Transfer |
| Variable Engine | Preview System | Preview System (render ulang) |
| Content Transfer | Repository Manager, Preview System, `chrome.storage`, `chrome.scripting` | User |
| Content Script | `chrome.storage` | Content Transfer (receiver) |
| UI Controller | Semua modul | Semua modul (menampilkan output) |

### 9.3 Glossary Arsitektur

| Istilah | Definisi |
|---|---|
| **Bridge** | Mekanisme `chrome.storage.local` untuk komunikasi antar konteks (popup ↔ content script) |
| **Cache-Aside** | Pola di mana aplikasi bertanggung jawab mengisi dan memelihara cache (bukan cache yang menyediakan data) |
| **Capture Phase** | Fase event DOM sebelum bubbling — content script menggunakan fase ini untuk mencegah konflik dengan halaman web |
| **Content Transfer** | Modul yang menyediakan tiga jalur ekspor konten: drag-drop, copy, insert |
| **GitHub Tree API** | Endpoint Git Trees GitHub yang mengembalikan struktur direktori repositori |
| **Graceful Degradation** | Kemampuan sistem untuk tetap berfungsi sebagian saat salah satu komponen gagal |
| **IIFE** | Immediately Invoked Function Expression — pola JavaScript untuk isolasi scope |
| **Isolated World** | Lingkungan eksekusi content script yang terisolasi dari JavaScript halaman web |
| **MV3** | Manifest V3 — spesifikasi Chrome Extension terbaru dengan arsitektur berbasis service worker |
| **Prefetch** | Teknik mengambil data sebelum dibutuhkan untuk mengurangi latensi yang terlihat user |
| **Proxy Pattern** | Pola di mana satu objek bertindak sebagai perantara untuk objek lain — di sini `chrome.storage` sebagai perantara popup.js dan content.js |
| **Raw** | Tampilan mentah (kode sumber) dari file markdown dengan HTML entities yang di-escape |
| **Rendered** | Tampilan markdown yang sudah dikonversi ke HTML |
| **Singleton Guard** | Pola untuk memastikan sebuah modul hanya diinisialisasi sekali |
| **TTL** | Time-To-Live — durasi maksimum data dianggap valid dalam cache |
| **Variable Engine** | Modul untuk mendeteksi, mengelola, dan mensubstitusi placeholder `{{VAR}}` dalam konten |

---

*Dokumen arsitektur ini dibuat berdasarkan source code blinker v2.0.0. Seluruh komponen, aliran data, dan design patterns mengacu pada implementasi aktual di repositori [mdown-collection-chrome](https://github.com/ai-builders-id/mdown-collection-chrome).*
