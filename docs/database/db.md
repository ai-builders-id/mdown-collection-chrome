# Database & Data Storage — Blinker

> **Dokumentasi internal untuk arsitektur penyimpanan data ekstensi Blinker.**
> Mencakup tiga lapis storage: `chrome.storage.local`, `localStorage`, dan in-memory state.
> Ditulis dalam Bahasa Indonesia.

---

## Daftar Isi

1. [Arsitektur Data Secara Umum](#1-arsitektur-data-secara-umum)
2. [chrome.storage.local](#2-chromestorage-local)
   - 2.1 [Keys dan Schema](#21-keys-dan-schema)
   - 2.2 [Lifecycle](#22-lifecycle)
   - 2.3 [Cleanup](#23-cleanup)
3. [localStorage](#3-localstorage)
   - 3.1 [Format Keys](#31-format-keys)
   - 3.2 [Schema Cache](#32-schema-cache)
   - 3.3 [TTL 10 Menit](#33-ttl-10-menit)
   - 3.4 [Invalidation](#34-invalidation)
   - 3.5 [Quota Ekstensi Service Worker vs Popup](#35-quota-ekstensi-service-worker-vs-popup)
4. [In-Memory State](#4-in-memory-state)
   - 4.1 [Variabel Global Popup](#41-variabel-global-popup)
   - 4.2 [Initial Values](#42-initial-values)
   - 4.3 [State Transitions](#43-state-transitions)
   - 4.4 [State Diagram](#44-state-diagram)
5. [Data Flow Diagrams](#5-data-flow-diagrams)
   - 5.1 [Flow Daftar File (List)](#51-flow-daftar-file-list)
   - 5.2 [Flow Preview](#52-flow-preview)
   - 5.3 [Flow Drag & Drop](#53-flow-drag--drop)
   - 5.4 [Flow Copy](#54-flow-copy)
   - 5.5 [Flow Insert ke Halaman Aktif](#55-flow-insert-ke-halaman-aktif)
   - 5.6 [Flow Variable Substitution](#56-flow-variable-substitution)
6. [Storage Limits](#6-storage-limits)
   - 6.1 [chrome.storage.local — 10 MB](#61-chromestorage-local--10-mb)
   - 6.2 [localStorage — 5–10 MB](#62-localstorage--510-mb)
   - 6.3 [In-Memory — Tergantung Heap JS](#63-in-memory--tergantung-heap-js)
7. [Cache Strategy](#7-cache-strategy)
   - 7.1 [Stale-While-Revalidate](#71-stale-while-revalidate)
   - 7.2 [Prefetch Cache untuk Drag](#72-prefetch-cache-untuk-drag)
   - 7.3 [Cache Invalidation Triggers](#73-cache-invalidation-triggers)
8. [Performance Optimization](#8-performance-optimization)
   - 8.1 [Batch Rendering](#81-batch-rendering)
   - 8.2 [Lazy Content Fetch](#82-lazy-content-fetch)
   - 8.3 [Minimal Reflow](#83-minimal-reflow)
   - 8.4 [Cache Hit Ratio](#84-cache-hit-ratio)
9. [Ringkasan](#9-ringkasan)

---

## 1. Arsitektur Data Secara Umum

Blinker menggunakan tiga lapis penyimpanan yang masing-masing memiliki tujuan, siklus hidup, dan batasan yang berbeda. Tidak ada database relasional atau penyimpanan terpusat; data mengalir secara sekuensial dari sumber (GitHub API) menuju pengguna akhir melalui lapisan-lapisan ini.

```
┌─────────────────────────────────────────────────────────────┐
│                      GitHub API                              │
│  (api.github.com / raw.githubusercontent.com)                │
└───────────┬─────────────────────────────────────┬───────────┘
            │ daftar file (JSON)                  │ konten (.md)
            ▼                                      ▼
┌───────────────────────┐          ┌──────────────────────────┐
│   localStorage         │          │  In-Memory (popup.js)    │
│   mdown_v3_{prd,mdown} │          │  rawContent              │
│   TTL: 10 menit        │          │  varValues               │
│   cache daftar file    │          │  contentCache (Map)      │
└───────────────────────┘          └──────────┬───────────────┘
                                               │ saat drag
                                               ▼
                                     ┌──────────────────┐
                                     │ chrome.storage    │
                                     │ .local            │
                                     │ mdown_drag_*      │
                                     │ bridge popup→tab  │
                                     └──────────────────┘
```

**Penjelasan setiap lapisan:**

| Lapisan | Lokasi | Fungsi | Persistensi |
|---------|--------|--------|-------------|
| **chrome.storage.local** | Browser (terisolasi per ekstensi) | Jembatan konten dari popup ke content script saat drag | Persisten sampai dihapus |
| **localStorage** | Origin ekstensi (halaman popup) | Cache daftar file dari GitHub API | Persisten, TTL 10 menit |
| **In-Memory** | Heap JS popup.js | State sesi aktif (preview, variabel, tab) | Hilang saat popup ditutup |

Ketiga lapisan ini bekerja bersama untuk memberikan pengalaman yang cepat: localStorage menghindari fetch ulang daftar file setiap kali popup dibuka, in-memory memungkinkan rendering instan saat navigasi preview, dan chrome.storage.local menjembatani eksekusi async antara popup dan content script saat drag & drop.

---

## 2. chrome.storage.local

### 2.1 Keys dan Schema

chrome.storage.local digunakan secara eksklusif untuk **content transfer** — yaitu mengirim konten markdown dari popup.js ke content.js saat pengguna melakukan drag & drop. Hanya ada tiga key yang digunakan:

| Key | Tipe Data | Contoh Value | Ukuran |
|-----|-----------|-------------|--------|
| `mdown_drag_content` | `string` | Konten file .md mentah (bisa >100 KB) | Variabel (tergantung file) |
| `mdown_drag_ready` | `boolean` | `true` / `false` | ~4 bytes |
| `mdown_drag_path` | `string` | `"prompts/react-component.md"` | Variabel |

**Schema lengkap:**

```typescript
interface ChromeStorageDragPayload {
  mdown_drag_content: string;   // Konten yang akan diinsert ke target
  mdown_drag_ready: boolean;    // Penanda bahwa konten sudah siap
  mdown_drag_path: string;      // Path file asal (untuk debugging / logging)
}
```

**Catatan penting:** Ketiga key ini tidak memiliki prefix versi karena:
- Ekstensi hanya berjalan dalam satu versi dalam satu sesi browser,
- chrome.storage.local tidak dibagi antar-profil,
- Format konten sudah distandardisasi (UTF-8 text).

### 2.2 Lifecycle

Lifecycle data di chrome.storage.local sangat pendek — hanya dalam rentang satu event drag:

```
Drag Start (popup.js)
    │
    ├─ Set mdown_drag_content = konten
    ├─ Set mdown_drag_ready  = true
    ├─ Set mdown_drag_path   = path file
    │
    ▼
Drop Event (content.js di halaman web)
    │
    ├─ Baca mdown_drag_content
    ├─ Insert ke target element
    │
    ▼
Cleanup (content.js)
    └─ Hapus semua key mdown_drag_*
```

**Timeline tipikal:**
1. **T=0ms** — Pointer down / drag start di popup. `fetchContent()` dipanggil.
2. **T=50–300ms** — Response diterima. `chrome.storage.local.set()` dipanggil dengan konten.
3. **T=Varies** — Drop event terjadi di halaman web. `chrome.storage.local.get()` membaca konten.
4. **T+50ms** — `chrome.storage.local.remove()` membersihkan data.

### 2.3 Cleanup

**Siapa yang membersihkan:** Content script (`content.js`) bertanggung jawab untuk cleanup setelah drop.

**Kode cleanup:**

```javascript
// content.js baris 97-98
chrome.storage.local.remove([
  'mdown_drag_content',
  'mdown_drag_ready',
  'mdown_drag_path'
]);
```

**Mengapa cleanup penting:**
- Konten yang basi bisa tertinggal jika popup ditutup sebelum drop selesai,
- Konten sensitif (rahasia perusahaan, API key dalam prompt) tidak boleh mengendap,
- chrome.storage.local memiliki kuota 10 MB — konten besar (>100 KB) bisa cepat memenuhi kuota jika tidak dibersihkan.

**Fallback:** Jika pengguna menutup popup setelah drag start tetapi sebelum drop, maka data akan mengendap sampai:
- Drop terjadi di lain waktu (content script akan membaca dan membersihkan), atau
- Popup dibuka kembali dan drag baru menimpa key yang sama, atau
- Ekstensi di-uninstall (Chrome otomatis menghapus storage).

**Tidak ada garbage collector periodik.** Ini adalah keputusan desain karena lifecycle yang sangat pendek. Jika ditemukan akumulasi data basi di masa depan, kita bisa menambahkan:

```javascript
// Opsi: cleanup periodik (belum diimplementasikan)
chrome.storage.local.get(null, (items) => {
  for (const key of Object.keys(items)) {
    if (key.startsWith('mdown_drag_')) {
      chrome.storage.local.remove(key);
    }
  }
});
```

---

## 3. localStorage

### 3.1 Format Keys

Hanya ada dua key di localStorage, satu untuk setiap repositori:

| Key | Sumber Data |
|-----|-------------|
| `mdown_v3_prd` | `ai-builders-id/prd-prompt-collection` |
| `mdown_v3_mdown` | `ai-builders-id/mdown-collection` |

**Pola penamaan:** `mdown_v3_{repoKey}` — terdiri dari tiga bagian:
1. **`mdown_`** — Prefix aplikasi (menghindari collision dengan ekstensi lain).
2. **`v3_`** — Versi format cache. Diinkrementasikan saat struktur data cache berubah.
3. **`{repoKey}`** — Key repositori (`prd` atau `mdown`).

**Mengapa versi di hardcode di key:**
Jika format cache berubah di masa depan (misal: menambahkan field baru), versi lama akan otomatis diabaikan tanpa perlu migrasi data. localStorage.get() untuk key lama akan return `null`, memicu fetch ulang.

### 3.2 Schema Cache

Setiap key localStorage menyimpan JSON dengan struktur berikut:

```typescript
interface FileListCache {
  ts: number;            // Timestamp saat cache disimpan (Date.now())
  files: Array<{
    path: string;         // Path relatif di repo, e.g. "prompts/react.md"
    size: number;         // Ukuran file dalam bytes
  }>;
}
```

**Contoh value aktual (terbaca di DevTools):**

```json
{
  "ts": 1734567890123,
  "files": [
    { "path": "README.md", "size": 1234 },
    { "path": "prompts/react-component.md", "size": 5678 },
    { "path": "standards/coding-guidelines.md", "size": 9012 }
  ]
}
```

**Ukuran tipikal:** Repositori dengan ~100 file menghasilkan JSON ~8–15 KB setelah diserialisasi.

### 3.3 TTL 10 Menit

TTL (Time-To-Live) cache diatur oleh konstanta `CACHE_TTL` di `popup.js`:

```javascript
const CACHE_TTL = 10 * 60 * 1000; // 10 menit dalam milidetik
```

**Mekanisme validasi:**

```javascript
// popup.js baris 89-96
const raw = localStorage.getItem(key);
if (raw) {
  const c = JSON.parse(raw);
  if (Date.now() - c.ts < CACHE_TTL) return c.files;
  // Jika sudah kedaluwarsa: fallthrough ke fetch API
}
```

**Alasan memilih 10 menit:**

| Faktor | Pertimbangan |
|--------|-------------|
| **Frekuensi update repositori** | Repositori prompt jarang berubah (beberapa kali sehari) |
| **Biaya fetch** | GitHub API membutuhkan 1 HTTP request + parsing JSON array |
| **User experience** | Popup dibuka-tutup dalam hitungan detik; cache 10 menit menghindari loading spinner yang mengganggu |
| **Rate limit GitHub** | 60 req/jam untuk unauthenticated; cache mencegah abuse |

**Perilaku saat kedaluwarsa:**
- Cache tidak langsung dihapus, hanya diabaikan.
- Fetch baru akan menyimpan timestamp baru.
- Cache lama akan ditimpa oleh `localStorage.setItem()` pada baris 107.

### 3.4 Invalidation

Cache di-invalidate dalam tiga skenario:

**1. Refresh Manual (Tombol Refresh)**

```javascript
// popup.js baris 339-342
refreshBtn.addEventListener('click', () => {
  localStorage.removeItem(cacheKey(activeRepo));
  loadRepo(activeRepo, true);
});
```

Saat pengguna menekan tombol refresh (`↻`) di popup:
- Key localStorage untuk repositori aktif dihapus,
- `loadRepo` dipanggil dengan `force = true`,
- Fetch API dilakukan tanpa melihat cache,
- Cache baru ditulis setelah fetch sukses.

**2. Auto-Expiry (TTL)**

Tanpa intervensi pengguna, cache akan diabaikan setelah 10 menit. Saat popup dibuka kembali setelah >10 menit sejak cache terakhir:
- `localStorage.getItem()` mengembalikan data,
- `Date.now() - c.ts >= CACHE_TTL` → true,
- Fetch API dijalankan.

**3. Switch Repositori**

Saat pengguna beralih tab antara PRD dan Mdown:
- `switchRepo()` dipanggil,
- `loadRepo()` dipanggil tanpa force,
- Cache untuk repositori tujuan dicek TTL-nya,
- Jika valid, langsung ditampilkan. Jika tidak, fetch.

**Tidak ada invalidasi event-based.** Tidak ada WebSocket atau webhook yang memberi tahu popup saat repositori berubah. Ini adalah keputusan sadar: kompleksitas tidak sebanding dengan frekuensi perubahan data.

### 3.5 Quota Ekstensi Service Worker vs Popup

Perlu dicatat bahwa localStorage pada Chrome Extension memiliki perilaku khusus. Dalam arsitektur Manifest V3, popup adalah halaman HTML biasa yang berjalan di dalam proses ekstensi. localStorage yang digunakan oleh popup terikat pada asal ekstensi (`chrome-extension://<id>/`) dan memiliki kuota standar 5–10 MB (bervariasi per browser).

localStorage **tidak** dapat diakses dari service worker (background script) MV3. Ini bukan masalah untuk Blinker karena semua operasi storage terjadi di popup.

---

## 4. In-Memory State

### 4.1 Variabel Global Popup

Popup.js mendeklarasikan 9 variabel state global dan 1 Map untuk cache. Berikut adalah tabel lengkap:

| Variabel | Tipe | Initial Value | Digunakan di | Fungsi |
|----------|------|---------------|-------------|--------|
| `activeRepo` | `string` | `'prd'` | Seluruh file | Menentukan repositori aktif (`'prd'` atau `'mdown'`) |
| `allFiles` | `Array<{path, size}>` | `[]` | `loadRepo`, `searchInput` | Seluruh daftar file dari repositori aktif |
| `filtered` | `Array<{path, size}>` | `[]` | `renderList`, `searchInput` | Hasil filtering/search dari `allFiles` |
| `currentPath` | `string \| null` | `null` | `openPreview`, `backBtn` | Path file yang sedang dipreview |
| `currentRepo` | `string \| null` | `null` | `openPreview`, `backBtn` | Repositori dari file yang sedang dipreview |
| `rawContent` | `string` | `''` | `renderPreview`, `getFinalContent` | Konten mentah file yang sedang dipreview |
| `varValues` | `Record<string, string>` | `{}` | `openVarModal`, `renderPreview` | Nilai substitusi variabel `{{VAR}}` |
| `activeTab` | `string` | `'rendered'` | `tabRendered`, `tabRaw`, `renderPreview` | Tab aktif di preview (`'rendered'` / `'raw'`) |
| `editingVar` | `string \| null` | `null` | `openVarModal`, `vmApply`, `closeVarModal` | Nama variabel yang sedang diedit di modal |
| `contentCache` | `Map<string, string \| null>` | `new Map()` | `prefetchContent`, drag events | Cache prefetch konten untuk drag |

**Daftar referensi DOM** (12 elemen):

| Variabel DOM | Elemen | Fungsi |
|-------------|--------|--------|
| `viewList` | `#viewList` | Container tampilan daftar file |
| `viewPreview` | `#viewPreview` | Container tampilan preview |
| `listScroll` | `#listScroll` | Scroll area daftar file |
| `searchInput` | `#searchInput` | Input pencarian |
| `footerCount` | `#footerCount` | Jumlah file |
| `footerLink` | `#footerLink` | Link ke repositori GitHub |
| `refreshBtn` | `#refreshBtn` | Tombol refresh |
| `repoTabMdown` | `#repoTabMdown` | Tab repositori Mdown |
| `repoTabPrd` | `#repoTabPrd` | Tab repositori PRD |
| `hintDot` | `#hintDot` | Indikator warna repositori aktif |
| `backBtn` | `#backBtn` | Tombol kembali dari preview ke list |
| `previewFilename` | `#previewFilename` | Nama file di header preview |
| `tabRendered` | `#tabRendered` | Tab rendered view |
| `tabRaw` | `#tabRaw` | Tab raw view |
| `varsBar` | `#varsBar` | Baris variabel |
| `varsChips` | `#varsChips` | Container chip variabel |
| `previewScroll` | `#previewScroll` | Area konten preview |
| `pfDrag` | `#pfDrag` | Tombol aksi drag |
| `pfCopy` | `#pfCopy` | Tombol aksi copy |
| `pfInsert` | `#pfInsert` | Tombol aksi insert |
| `varModal` | `#varModal` | Modal pengeditan variabel |
| `vmVarName` | `#vmVarName` | Nama variabel di modal |
| `vmInput` | `#vmInput` | Input value variabel |
| `vmCancel` | `#vmCancel` | Tombol batal |
| `vmApply` | `#vmApply` | Tombol terapkan |

### 4.2 Initial Values

Saat popup pertama kali dimuat:

```javascript
// Setelah semua deklarasi variabel, state adalah:
{
  activeRepo:   'prd',         // Tab PRD aktif
  allFiles:     [],             // Belum ada data
  filtered:     [],             // Belum ada data
  currentPath:  null,           // Tidak dalam mode preview
  currentRepo:  null,           // Tidak dalam mode preview
  rawContent:   '',             // Tidak ada konten
  varValues:    {},             // Tidak ada variabel
  activeTab:    'rendered',     // Tab rendered default
  editingVar:   null,           // Modal tertutup
  contentCache: Map(0),         // Cache kosong
}
```

**Inisialisasi di bagian bawah file (`// ── Init ──`):**

```javascript
// Baris 531-533
hintDot.style.background = REPOS[activeRepo].color;  // Warna PRD (#3fb950)
footerLink.href = REPOS[activeRepo].githubUrl;        // URL PRD repo
loadRepo(activeRepo);                                  // Fetch daftar file PRD
```

### 4.3 State Transitions

Transisi state terjadi sebagai respons terhadap event pengguna. Berikut adalah semua transisi yang mungkin:

**A. Transisi List (Daftar File)**

| Trigger | Perubahan State | Keterangan |
|---------|----------------|------------|
| Popup load | `allFiles = [...], filtered = allFiles` | `loadRepo()` dipanggil dengan `activeRepo` |
| Switch tab repo | `activeRepo = 'prd'|'mdown'`, `searchInput = ''`, `allFiles = [...]`, `filtered = allFiles` | Cache dicek, fetch jika perlu |
| Search input | `filtered = allFiles.filter(...)` | Filter berdasarkan query |
| Refresh | `allFiles = [...], filtered = allFiles` | Cache dihapus, fetch paksa |

**B. Transisi Preview**

| Trigger | Perubahan State | Keterangan |
|---------|----------------|------------|
| Klik preview button | `currentPath = path`, `currentRepo = repo`, `varValues = {}`, `activeTab = 'rendered'`, `rawContent = "..."` | View berpindah dari list ke preview |
| Klik back button | `currentPath = null`, `currentRepo = null`, `rawContent = ''`, `varValues = {}` | View kembali ke list |
| Ganti tab render/raw | `activeTab = 'rendered'|'raw'` | Re-render konten |

**C. Transisi Variabel**

| Trigger | Perubahan State | Keterangan |
|---------|----------------|------------|
| Klik chip variabel | `editingVar = varName` | Modal terbuka |
| Apply | `varValues[editingVar] = value` | Modal tertutup, re-render |
| Cancel / Escape | `editingVar = null` | Modal tertutup |
| Klik latar modal | `editingVar = null` | Modal tertutup |

**D. Transisi Drag**

| Trigger | Perubahan State | Keterangan |
|---------|----------------|------------|
| Hover file (mouseenter) | `contentCache.set(key, null)` lalu diisi async | Prefetch dimulai |
| Drag start (daftar) | chrome.storage.local.set({...}) | Konten dikirim ke storage |
| Drag start (preview) | chrome.storage.local.set({...}) | Konten final (dengan var) dikirim |
| Drag end | class 'dragging' dihapus | Tidak ada perubahan state lain |

**E. Transisi Aksi (Copy / Insert)**

| Trigger | Perubahan State | Keterangan |
|---------|----------------|------------|
| Copy | Tidak ada (navigator.clipboard) | Side effect: teks di clipboard |
| Insert | Tidak ada (chrome.scripting) | Side effect: halaman aktif berubah |

### 4.4 State Diagram

Berikut diagram state untuk siklus hidup popup:

```
                    ┌──────────────┐
                    │  INIT LOAD   │
                    │ allFiles=[]  │
                    │ filtered=[]  │
                    └──────┬───────┘
                           │ loadRepo()
                           ▼
                    ┌──────────────┐
             ┌──────│  LIST VIEW   │◄──────────────────────┐
             │      │ allFiles=[..] │                      │
             │      │ filtered=[..] │                      │
             │      │ currentPath=null                     │
             │      └──┬───────┬────┘                      │
             │         │       │                           │
             │  search │       │ preview-btn               │
             │         ▼       │                           │
             │  ┌──────────┐   │                           │
             │  │ SEARCHED │   │                           │
             │  │ filtered │   │                           │
             │  │ = subset │   │                           │
             │  └──────────┘   │                           │
             │                 ▼                           │
             │      ┌──────────────────────────────────┐   │
             │      │         PREVIEW VIEW               │   │
             │      │ currentPath=path                  │   │
             │      │ currentRepo=repo                  │   │
             │      │ rawContent="..."                  │   │
             │      │ varValues={}                      │   │
             │      │ activeTab='rendered'|'raw'        │   │
             │      └────┬───────┬───────┬──────┐       │   │
             │           │       │       │      │       │   │
             │           │       │       │      │       │   │
             │  tab-     │  var  │  var  │ back │       │   │
             │  switch   │  chip │ modal │ btn  │       │   │
             │           ▼       ▼       ▼      │       │   │
             │  ┌────────┐ ┌────────┐ ┌──────┐ │       │   │
             │  │TAB:    │ │VAR:    │ │MODAL │ │       │   │
             │  │rendered│ │CHIP    │ │OPEN  │ │       │   │
             │  │  /raw  │ │baru    │ │editing│ │       │   │
             │  └────────┘ └────────┘ │Var=.. │ │       │   │
             │                        └───┬───┘ │       │   │
             │                   apply /   │     │       │   │
             │                   cancel    │     │       │   │
             │                            ▼     │       │   │
             │                       ┌──────┐   │       │   │
             │                       │VAR   │   │       │   │
             │                       │UPDATE│   │       │   │
             │                       │re-   │   │       │   │
             │                       │render│   │       │   │
             │                       └──────┘   │       │   │
             │                                  ▼       │   │
             │                        Kembali ke LIST ──┘   │
             │                                             │
             └─────────────────────────────────────────────┘
                          (search tidak mengubah state
                           selain 'filtered')
```

---

## 5. Data Flow Diagrams

### 5.1 Flow Daftar File (List)

**Tujuan:** Menampilkan daftar file markdown dari repositori GitHub.

```
Pengguna buka popup
    │
    ▼
loadRepo(activeRepo)           // activeRepo = 'prd'
    │
    ├─► cacheKey = 'mdown_v3_prd'
    │
    ├─► localStorage.getItem('mdown_v3_prd')
    │   │
    │   ├─ null / parse error  ──► fetchFileList('prd')
    │   │                              │
    │   │                              ├─ GET api.github.com/.../git/trees/main?recursive=1
    │   │                              │      Headers: { Accept: application/vnd.github+json }
    │   │                              │
    │   │                              ├─ Response: { tree: [ { path, size, type }, ... ] }
    │   │                              │
    │   │                              ├─ Filter: item.type === 'blob'
    │   │                              │          && item.path.endsWith('.md')
    │   │                              │          && item.path !== 'README.md'
    │   │                              │
    │   │                              ├─ Map: { path: item.path, size: item.size }
    │   │                              │
    │   │                              ├─ localStorage.setItem('mdown_v3_prd', JSON.stringify({
    │   │                              │      ts: Date.now(),
    │   │                              │      files: [...]
    │   │                              │   }))
    │   │                              │
    │   │                              └─ Return files[]
    │   │
    │   └─ Valid ──► Cek TTL: Date.now() - c.ts < 600000?
    │                    │
    │                    ├─ Ya ──► Return c.files (cache hit)
    │                    │
    │                    └─ Tidak ──► Fallthrough ke fetchFileList (cache miss)
    │
    ▼
allFiles = files[]
filtered = files[]
    │
    ▼
renderList(filtered)
    │
    ├─ groupFiles() — kelompokkan berdasarkan folder
    │      Contoh: "standards/coding.md" → folderKey = "standards"
    │
    ├─ Sortir folder (folder kosong/null diurutkan pertama)
    │
    ├─ Render HTML per item file:
    │      - Icon (berdasarkan path dan repoKey)
    │      - Number prefix (jika ada angka di awal nama)
    │      - Nama file (tanpa nomor, underscore jadi spasi)
    │      - Ukuran file
    │      - Tombol preview 👁
    │      - Tombol copy
    │
    ├─ attachListEvents()
    │      - mouseenter → prefetchContent
    │      - pointerdown → prefetchContent
    │      - dragstart → chrome.storage.local.set
    │      - dragend → hapus class dragging
    │
    └─ Tampilkan di #listScroll
```

**Skenario alternatif:** Jika GitHub API gagal (network error, rate limit, repo tidak ditemukan):

```
fetchFileList()
    │
    ├─ fetch(apiUrl) → throw new Error(`GitHub API ${res.status}`)
    │
    ▼
catch(err)
    │
    ├─ listScroll.innerHTML = "<div class='state-wrap'>⚠️ Gagal: ${err.message}</div>"
    │
    └─ footerCount.textContent = 'Error'
```

### 5.2 Flow Preview

**Tujuan:** Menampilkan konten file markdown yang sudah dirender dengan dukungan variabel.

```
Pengguna klik tombol 👁 pada file
    │
    ▼
openPreview(repoKey, path)
    │
    ├─ State update:
    │      currentPath = path
    │      currentRepo = repoKey
    │      varValues   = {}
    │      activeTab   = 'rendered'
    │
    ├─ View switch:
    │      viewList.classList.remove('active')
    │      viewPreview.classList.add('active')
    │
    ├─ UI update:
    │      previewFilename.textContent = getDisplayName(path)
    │      previewScroll.innerHTML = "<spinner>"  (loading state)
    │      varsBar.classList.remove('has-vars')
    │
    ├─ fetchContent(repoKey, path)
    │      │
    │      ├─ rawBase = https://raw.githubusercontent.com/{owner}/{repo}/main/
    │      ├─ fetch(rawBase + path)
    │      ├─ Response: text content (markdown)
    │      │
    │      ▼
    │   rawContent = response text
    │      │
    │      ▼
    │   renderPreview()
    │      │
    │      ├─ extractVars(rawContent)
    │      │      Regex: /\{\{([A-Z0-9_]+)\}\}/g
    │      │      Contoh: "{{API_KEY}}", "{{MODEL_NAME}}"
    │      │
    │      ├─ applyVars(rawContent)
    │      │      Ganti {{VAR}} dengan nilai dari varValues (jika ada)
    │      │
    │      ├─ Jika ada variabel:
    │      │      varsBar.classList.add('has-vars')
    │      │      Render chip untuk setiap variabel
    │      │
    │      ├─ Jika activeTab === 'rendered':
    │      │      renderMarkdown(content) → HTML
    │      │      Highlight variabel yang belum diisi dengan class 'var-rendered'
    │      │
    │      ├─ Jika activeTab === 'raw':
    │      │      Escape HTML
    │      │      Highlight variabel dengan class 'var-highlight'
    │      │
    │      └─ Pasang click listener pada elemen [data-var]
    │             → openVarModal(varName)
    │
    └─ Jika fetch gagal:
           previewScroll.innerHTML = "<div class='state-wrap'>⚠️ ${err.message}</div>"
```

**Skenario alternatif:** Saat pengguna mengganti tab (rendered/raw), tidak ada fetch ulang. `renderPreview()` dipanggil ulang dengan data `rawContent` yang sudah ada di memori.

### 5.3 Flow Drag & Drop

**Tujuan:** Mengizinkan pengguna menarik file dari popup ke halaman web lain.

```
Ini adalah flow paling kompleks karena melibatkan dua konteks eksekusi:
popup.js (popup) dan content.js (halaman web).

── FLOW A: Drag dari daftar file ──────────────────────

Popup:
  1. User hover file → mouseenter
       prefetchContent(repo, path)
         contentCache.set(key, null)  // mark in-flight
         fetchContent(repo, path).then(c => contentCache.set(key, c))
         // Fetch konten di background sebelum drag dimulai

  2. User mulai drag → dragstart
       Cek contentCache.get(cacheKey)
         │
         ├─ Ada (sudah di-prefetch):
         │      e.dataTransfer.setData('text/plain', cached)
         │      chrome.storage.local.set({
         │        mdown_drag_content: cached,
         │        mdown_drag_ready: true,
         │        mdown_drag_path: path
         │      })
         │
         └─ Null (masih fetching atau belum di-prefetch):
                e.dataTransfer.setData('text/plain', '{{LOADING:${path}}}')
                fetchContent(repo, path)  // fallback fetch
                  .then(content => {
                    contentCache.set(key, content)
                    chrome.storage.local.set({...})
                  })

Halaman Web (content.js):
  3. User drop file → drop event
       e.dataTransfer.getData('text/plain')
         │
         ├─ Bukan '{{LOADING:...}}' → konten siap langsung
         │      insertText(target, dtText)
         │
         └─ '{{LOADING:...}}' → konten belum siap
                chrome.storage.local.get(['mdown_drag_content', 'mdown_drag_ready'])
                  .then(result => {
                    if (result.mdown_drag_ready) {
                      insertText(target, result.mdown_drag_content)
                      chrome.storage.local.remove([...])  // cleanup
                    }
                  })

── FLOW B: Drag dari tombol preview ───────────────────

Popup:
  1. User drag dari tombol "↗ Drag" di preview footer
       pfDrag.dragstart
         content = getFinalContent()  // rawContent dengan varValues sudah di-substitusi
         e.dataTransfer.setData('text/plain', content)
         chrome.storage.local.set({
           mdown_drag_content: content,
           mdown_drag_ready: true
         })
         // Konten sudah pasti siap (sinkron)

Halaman Web:
  2. Sama seperti Flow A step 3 — konten langsung siap
```

**Mengapa menggunakan chrome.storage.local untuk transfer:**
- `dataTransfer.setData()` di dragstart harus sinkron — jika konten belum siap, kita tidak bisa menunggu Promise,
- Content script tidak bisa mengakses variabel popup (konteks terisolasi),
- chrome.storage.local adalah satu-satunya jembatan persistensi antara popup dan content script.

### 5.4 Flow Copy

**Tujuan:** Menyalin konten file ke clipboard pengguna.

```
Pengguna klik tombol "Copy" di daftar file
    │
    ▼
copy-row-btn.click
    │
    ├─ btn.textContent = '...'   (feedback loading)
    │
    ├─ fetchContent(repo, path)
    │      GET https://raw.githubusercontent.com/.../main/{path}
    │
    ├─ navigator.clipboard.writeText(content)
    │
    ├─ btn.textContent = '✓'
    │   btn.classList.add('copied')
    │
    ├─ setTimeout(1500ms)
    │      btn.textContent = 'Copy'
    │      btn.classList.remove('copied')
    │
    └─ Jika gagal:
           btn.textContent = '✗'
           setTimeout(1500ms) → btn.textContent = 'Copy'
```

**Perbedaan dengan drag:**
- Copy tidak menggunakan cache chrome.storage.local,
- Copy menggunakan `navigator.clipboard` API (harusnya aman di MV3 popup karena user-initiated),
- Copy bisa dilakukan dari daftar (tanpa preview).

### 5.5 Flow Insert ke Halaman Aktif

**Tujuan:** Memasukkan konten langsung ke textarea/input/contenteditable di halaman web aktif.

```
Pengguna klik tombol "Insert ↓" di preview footer
    │
    ▼
pfInsert.click
    │
    ├─ getFinalContent()  // applyVars(rawContent) dengan varValues saat ini
    │
    ├─ chrome.tabs.query({ active: true, currentWindow: true })
    │      → Dapatkan tab aktif
    │
    ├─ chrome.scripting.executeScript({
    │     target: { tabId: tabs[0].id },
    │     func: (content) => {
    │       // Fungsi ini dieksekusi DI HALAMAN WEB, bukan di popup
    │       const el = document.activeElement;
    │       if (!el) { alert('Klik dulu field yang ingin diisi.'); return; }
    │
    │       if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
    │         // Sisipkan di posisi kursor
    │         el.value = el.value.slice(0, start) + content + el.value.slice(end);
    │         el.selectionStart = el.selectionEnd = start + content.length;
    │         el.dispatchEvent(new Event('input', { bubbles: true }));
    │         el.dispatchEvent(new Event('change', { bubbles: true }));
    │       } else if (el.isContentEditable) {
    │         document.execCommand('insertText', false, content);
    │       } else {
    │         alert('Klik dulu textarea/input yang ingin diisi.');
    │       }
    │     },
    │     args: [content]
    │   })
    │
    └─ Tidak ada perubahan state lokal.
```

**Peringatan:** `chrome.scripting.executeScript` membutuhkan permission `"scripting"` dan `"activeTab"` di manifest. Insert hanya berfungsi jika pengguna sudah mengklik suatu field di halaman web sebelum mengklik tombol Insert.

### 5.6 Flow Variable Substitution

**Tujuan:** Mengganti placeholder `{{VAR_NAME}}` dalam konten markdown dengan nilai yang diinput pengguna.

```
── Variabel Extraction ────────────────────────────────

extractVars(text)
    │
    ├─ Regex: /\{\{([A-Z0-9_]+)\}\}/g
    │
    ├─ Cocokkan semua pola {{VARIABLE}}
    │      Contoh: "Gunakan model {{MODEL}} dengan suhu {{TEMP}}""
    │      → ['MODEL', 'TEMP']
    │
    └─ Kembalikan array unik (Set)

── Variabel Input ─────────────────────────────────────

Pengguna klik chip "{{MODEL}}"
    │
    ▼
openVarModal('MODEL')
    │
    ├─ editingVar = 'MODEL'
    ├─ vmVarName.textContent = '{{MODEL}}'
    ├─ vmInput.value = varValues['MODEL'] || ''  // nilai sebelumnya (jika ada)
    ├─ varModal.classList.add('open')
    └─ setTimeout(() => vmInput.focus(), 50)

Pengguna isi nilai dan klik "Apply" / Enter
    │
    ▼
vmApply.click
    │
    ├─ varValues[editingVar] = vmInput.value.trim()
    ├─ closeVarModal()  → editingVar = null, modal close
    └─ renderPreview()  → re-render dengan nilai baru

── Variabel Substitution ──────────────────────────────

applyVars(text)
    │
    ├─ Untuk setiap [k, v] di Object.entries(varValues):
    │      Jika v truthy: text = text.replaceAll('{{' + k + '}}', v)
    │
    └─ Kembalikan text yang sudah di-substitusi

── Contoh Lengkap ─────────────────────────────────────

Input rawContent:
  "Gunakan model {{MODEL}} dengan prompt: {{PROMPT}}"

Step 1: extractVars → ['MODEL', 'PROMPT']
Step 2: Tampilkan chip: {{MODEL}} {{PROMPT}}
Step 3: User isi MODEL = "gpt-4", PROMPT = "Summarize"
Step 4: applyVars:
    "Gunakan model gpt-4 dengan prompt: Summarize"
```

**Catatan:** Variabel yang tidak diisi tetap tampil sebagai `{{VAR}}` (tidak di-substitusi). Ini sengaja agar pengguna tahu bahwa ada placeholder yang belum diisi. Di rendered view, variabel yang belum diisi mendapat highlight dengan CSS class `var-rendered`.

---

## 6. Storage Limits

### 6.1 chrome.storage.local — 10 MB

**Batas resmi:** 10 MB per ekstensi (dokumentasi Chrome: 10 MB untuk `storage.local`, namun implementasi sebenarnya bisa lebih longgar — beberapa sumber menyebut 10 MB untuk `storage.sync`, tanpa batas ketat untuk `storage.local` kecuali kuota implementasi browser).

**Penggunaan aktual Blinker:**

| Skenario | Ukuran Data | Key |
|----------|------------|-----|
| Drag file kecil (<1 KB) | ~0.5–1 KB | `mdown_drag_content` |
| Drag file sedang (1–10 KB) | ~1–10 KB | `mdown_drag_content` |
| Drag file besar (>100 KB) | ~100–500 KB | `mdown_drag_content` |
| Metadata (boolean + path) | ~50–200 bytes | `mdown_drag_ready`, `mdown_drag_path` |

**Risiko:** Jika pengguna melakukan drag berulang kali tanpa drop (atau jika content script gagal cleanup), data bisa menumpuk. Dalam praktiknya, setiap drag baru akan menimpa key yang sama (karena nama key tetap), jadi hanya satu set data yang ada.

**Strategi mitigasi:**
- Hanya tiga key yang digunakan — tidak mungkin terjadi fragmentasi,
- Setiap drag baru menimpa nilai key yang sama,
- Cleanup dilakukan di content script setelah drop sukses,
- File markdown umumnya <100 KB (dokumen prompt tidak sebesar file media).

### 6.2 localStorage — 5–10 MB

**Batas resmi:** 5 MB per origin di sebagian besar browser (Chrome memberikan 10 MB untuk extension origin).

**Penggunaan aktual Blinker:**

| Key | Perkiraan Ukuran | Isi |
|-----|-----------------|-----|
| `mdown_v3_prd` | ~5–15 KB | Cache daftar file PRD |
| `mdown_v3_mdown` | ~10–30 KB | Cache daftar file Mdown |

**Total penggunaan:** ~15–45 KB — sangat kecil dibandingkan kuota 5–10 MB.

**Risiko:** Tidak ada risiko quota untuk kasus penggunaan saat ini. Bahkan jika repositori memiliki 10.000 file, perkiraan ukuran JSON dengan path dan size adalah ~1–2 MB (masih di bawah kuota).

**Catatan:**
- localStorage di origin ekstensi (`chrome-extension://<id>/`) adalah isolated — tidak bisa diakses oleh website lain,
- Data di localStorage akan terhapus saat ekstensi di-uninstall,
- Tidak ada garansi penyimpanan jika pengguna membersihkan data browser (cookies & site data),
- Popup harus siap menghadapi `localStorage` yang tiba-tiba kosong (yang sudah ditangani oleh `if (!raw) { fetch; }`).

### 6.3 In-Memory — Tergantung Heap JS

**Batas:** Tidak ada batas tetap, bergantung pada memori perangkat dan browser.

**Penggunaan aktual:** Sangat kecil — beberapa array (<1000 objek), satu string konten (biasanya <100 KB), satu Map cache (isinya null atau string).

**Alokasi memori tipikal:**

| Komponen | Perkiraan Memori |
|----------|-----------------|
| `allFiles` (100 file) | ~10–20 KB |
| `filtered` (referensi, copy array) | ~negligible (referensi objek yang sama) |
| `rawContent` | ~5–100 KB (tergantung file) |
| `varValues` | ~0–1 KB |
| `contentCache` (Map) | ~0–500 KB (tergantung jumlah file di-prefetch) |
| DOM references | ~negligible |

**Risiko:** Tidak ada risiko signifikan. Satu-satunya potensi masalah adalah `rawContent` untuk file yang sangat besar (>1 MB), yang jarang terjadi untuk file markdown prompt.

---

## 7. Cache Strategy

### 7.1 Stale-While-Revalidate

Blinker mengimplementasikan **stale-while-revalidate** untuk cache daftar file di localStorage.

**Cara kerja:**

```
Ada permintaan data
    │
    ├─► Cek cache di localStorage
    │
    ├─ Cache HIT (data ada, TTL valid):
    │      │
    │      ├─► Kembalikan data cache (instant)
    │      │
    │      └─► [Tidak ada revalidate — TTL masih valid]
    │
    ├─ Cache STALE (data ada, TTL expired):
    │      │
    │      ├─► Kembalikan data cache (cepat, meski basi)
    │      │
    │      └─► [Revalidate] Fetch data baru dari API
    │             └─► Update cache dengan data baru
    │
    └─ Cache MISS (data tidak ada):
           │
           └─► Fetch data dari API
                  └─► Simpan di cache + kembalikan data
```

**Implementasi:**

```javascript
// Stale = data TTL-nya expired — tetapi data masih dikembalikan
// Revalidate = fetch ulang dari API
// Dalam implementasi Blinker, "stale" sebenarnya diabaikan:
// jika TTL expired, kita tidak pakai cache sama sekali.
//
// Ini adalah keputusan desain: data daftar file jarang berubah,
// dan fetch memakan waktu <1 detik. Tidak perlu mengembalikan data basi.
```

**Perbedaan dengan canonical stale-while-revalidate:** Implementasi Blinker lebih mendekati **"cache-then-network"** daripada SWR murni. Jika TTL expired, Blinker tidak mengembalikan data lama sama sekali — ia menunggu fetch API selesai. Ini bisa ditingkatkan di masa depan untuk memberikan respons instan dengan data basi sambil fetch di background.

### 7.2 Prefetch Cache untuk Drag

`contentCache` adalah `Map<string, string | null>` yang menyimpan konten file yang sudah di-fetch untuk keperluan drag.

**Mekanisme:**

```
Mouse enter pada file item
    │
    ├─ contentCache.has(key)?
    │
    ├─ Tidak → contentCache.set(key, null)  // mark as in-flight
    │           fetchContent(repo, path)
    │             .then(c => contentCache.set(key, c))
    │             .catch(() => contentCache.delete(key))
    │
    └─ Ya → sudah pernah di-prefetch (atau sedang di-fetch)
             Tidak melakukan apa-apa
```

**Karakteristik:**

| Aspek | Detail |
|-------|--------|
| **Trigger** | `mouseenter` dan `pointerdown` |
| **Capacity** | Tidak dibatasi (bisa tumbuh sampai semua file di-prefetch) |
| **Eviction** | Hanya saat popup ditutup (Map hilang dari memori) |
| **Nilai null** | Digunakan sebagai "lock" untuk menandai bahwa fetch sedang berlangsung |
| **Error handling** | `catch(() => contentCache.delete(key))` — hapus entry agar bisa dicoba lagi |

**Prefetch cukup agresif:** Begitu pengguna mengarahkan kursor ke file, fetch konten dimulai. Ini mengasumsikan bahwa hover mengindikasikan niat untuk drag (atau setidaknya minat). Untuk file kecil (<5 KB), prefetch selesai dalam <100 ms, sehingga konten sudah siap saat drag dimulai.

### 7.3 Cache Invalidation Triggers

Ringkasan semua mekanisme yang membuat cache menjadi invalid:

| Trigger | Lapisan | Mekanisme |
|---------|---------|-----------|
| **TTL 10 menit** | localStorage | `Date.now() - c.ts >= CACHE_TTL` → fetch ulang |
| **Tombol refresh** | localStorage | `localStorage.removeItem(key)` + `loadRepo(repo, true)` |
| **Popup ditutup** | In-Memory (contentCache) | Semua variabel hilang (Map tidak persist) |
| **Popup dibuka kembali** | In-Memory (allFiles) | `loadRepo()` dipanggil ulang, cache localStorage dicek |
| **Drop sukses** | chrome.storage.local | `chrome.storage.local.remove([...])` |
| **Tab switch** | localStorage | `loadRepo(repoKey)` — cache untuk repo baru dicek |

**Tidak ada invalidasi untuk kasus berikut:**
- Perubahan di repositori GitHub (tidak ada webhook),
- Popup dibiarkan terbuka >10 menit (cache tidak di-revalidate otomatis),
- Mode offline (jika fetch gagal, data tidak ditampilkan — tidak ada offline fallback).

---

## 8. Performance Optimization

### 8.1 Batch Rendering

Daftar file diretur dalam satu batch menggunakan `innerHTML`, bukan DOM manipulation satu per satu:

```javascript
// GOOD: Batch render dengan innerHTML
const html = [];
files.forEach(file => { html.push(`<div>...</div>`); });
listScroll.innerHTML = html.join('');

// BUKAN: DOM manipulation satu per satu (slow)
// files.forEach(file => {
//   const div = document.createElement('div');
//   listScroll.appendChild(div);  // Layout thrashing!
// });
```

**Dampak:** Untuk 500 file, batch rendering selesai dalam ~5–15 ms, sedangkan appendChild per item bisa memakan 50–200 ms karena layout recalculations.

### 8.2 Lazy Content Fetch

Konten file hanya di-fetch saat diperlukan:
- Preview: fetch saat tombol preview diklik,
- Copy: fetch saat tombol copy diklik,
- Drag: fetch saat hover (prefetch) atau saat drag start (fallback),
- Tidak ada fetch untuk file yang tidak diinteraksi.

```javascript
// Hanya fetch ketika benar-benar dibutuhkan
// Tidak ada: fetch semua file saat popup dimuat
```

**Pengecualian:** `contentCache` melakukan prefetch pada hover. Ini adalah trade-off antara bandwidth dan latency. Untuk repositori dengan file besar (>1 MB), prefetch mungkin boros bandwidth; untuk file kecil (<10 KB), ini adalah optimasi yang baik.

### 8.3 Minimal Reflow

**DOM batching:**
Semua perubahan DOM dilakukan dalam jumlah minimal:

```javascript
// GOOD: Satu innerHTML menggantikan banyak operasi DOM
listScroll.innerHTML = html.join('');

// GOOD: Satu classList.toggle menggantikan style manipulation
viewList.classList.toggle('active');
viewPreview.classList.toggle('active');
```

**CSS transitions, bukan JS animation:**
- Loading spinner menggunakan CSS animation (bukan JS setInterval),
- Overlay drop menggunakan CSS (dibuat oleh content.js dengan style object),
- Highlight saat insert menggunakan CSS transition (outline color).

**Event delegation terbatas:**
Pendekatan hybrid: event listener dipasang secara individual di `attachListEvents()`, bukan delegation dari parent. Untuk daftar <500 item, ini masih efisien. Untuk skalabilitas lebih baik, bisa menggunakan event delegation:

```javascript
// Opsi masa depan: event delegation
listScroll.addEventListener('click', (e) => {
  const btn = e.target.closest('.preview-btn, .copy-row-btn');
  if (btn) {
    // handle preview or copy
  }
});
```

### 8.4 Cache Hit Ratio

Berdasarkan pola penggunaan tipikal:

| Skenario | Cache Hit Ratio | Alasan |
|----------|----------------|--------|
| Popup pertama kali hari ini | 0% (miss) | Cache expired atau tidak ada |
| Popup kedua dalam 10 menit | 100% (hit) | TTL masih valid |
| Popup setelah 30 menit | 0% (miss) | TTL expired (10 menit) |
| Switch repo, lalu switch balik | 100% (hit) | Cache repo sebelumnya masih valid |
| Refresh manual | 0% (forced miss) | Cache dihapus sebelum fetch |
| Hover file (prefetch) | ~60% (hit saat drag) | Bergantung kecepatan fetch vs reaksi user |

**Target optimasi:** Meningkatkan hit ratio contentCache dengan memperluas prefetch ke pointerdown (sudah diimplementasikan). Pointerdown memberi waktu ~200–500 ms sebelum dragstart benar-benar terjadi.

---

## 9. Ringkasan

| Aspek | chrome.storage.local | localStorage | In-Memory |
|-------|---------------------|-------------|-----------|
| **Tujuan** | Transfer konten popup → web | Cache daftar file GitHub | State sesi aktif |
| **Key count** | 3 (tetap) | 2 (per repo) | 9 variabel + 1 Map |
| **Data size** | ~1–500 KB | ~15–45 KB | ~10–600 KB |
| **Persistensi** | Persisten (sampai dihapus) | Persisten (TTL 10 menit) | Volatile (hilang saat popup ditutup) |
| **Cleanup** | Manual (content.js) | Overwrite + TTL | Otomatis (GC) |
| **Kecepatan akses** | Async (callback) | Sync | Sync (RAM) |
| **Kuota** | 10 MB | 5–10 MB | ~Heap JS |
| **Risiko utama** | Data basi jika crash | Cache expired | Kehilangan state saat popup tertutup |

**Keputusan arsitektur kunci:**

1. **Tidak ada framework state management** — kompleksitas tidak memerlukan Redux/Zustand. State sederhana dengan variabel global sudah cukup.
2. **localStorage untuk cache, bukan untuk data primer** — data utama selalu dari GitHub API. localStorage hanya mempercepat.
3. **chrome.storage.local sebagai bridge, bukan sebagai database** — hanya untuk transfer sesaat antar konteks.
4. **Prefetch agresif** — mengorbankan bandwidth untuk mengurangi latency drag.
5. **Tidak ada migrasi data** — versioning di key name (`v3`) memungkinkan breaking change tanpa migrasi.

---

*Dokumen ini diperbarui secara berkala seiring perubahan arsitektur data Blinker.*
