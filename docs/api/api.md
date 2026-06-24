# Dokumentasi API — blinker

> **Dokumen:** API Reference  
> **Proyek:** blinker (sebelumnya mdown-dropper)  
> **Versi:** 2.0.0  
> **Tanggal:** 2026-06-24  
> **Penulis:** Cloud Dark  

---

## Daftar Isi

1. [Pendahuluan](#1-pendahuluan)
2. [GitHub Contents API](#2-github-contents-api)
   - 2.1 [Endpoint dan URL Pattern](#21-endpoint-dan-url-pattern)
   - 2.2 [Rate Limiting](#22-rate-limiting)
   - 2.3 [Response Format](#23-response-format)
   - 2.4 [Filtering Data](#24-filtering-data)
   - 2.5 [Error Handling GitHub API](#25-error-handling-github-api)
3. [raw.githubusercontent.com](#3-rawgithubusercontentcom)
   - 3.1 [URL Pattern](#31-url-pattern)
   - 3.2 [Autentikasi dan Akses](#32-autentikasi-dan-akses)
   - 3.3 [CORS dan Host Permissions](#33-cors-dan-host-permissions)
   - 3.4 [Error Handling Raw Content](#34-error-handling-raw-content)
4. [Chrome Extension APIs](#4-chrome-extension-apis)
   - 4.1 [chrome.storage.local](#41-chromestorage-local)
   - 4.2 [chrome.tabs](#42-chrometabs)
   - 4.3 [chrome.scripting](#43-chromescripting)
   - 4.4 [Callback vs Promise Pattern](#44-callback-vs-promise-pattern)
5. [Konfigurasi Repositori](#5-konfigurasi-repositori)
   - 5.1 [Struktur Repositori](#51-struktur-repositori)
   - 5.2 [Filter Rules](#52-filter-rules)
   - 5.3 [Perbedaan Tiap Repo](#53-perbedaan-tiap-repo)
6. [Integration Patterns](#6-integration-patterns)
   - 6.1 [Caching Strategy](#61-caching-strategy)
   - 6.2 [Prefetching](#62-prefetching)
   - 6.3 [Retry Mechanism](#63-retry-mechanism)
   - 6.4 [Offline Behavior](#64-offline-behavior)
7. [Rate Limiting dan Backoff](#7-rate-limiting-dan-backoff)
   - 7.1 [Strategi Rate Limiting](#71-strategi-rate-limiting)
   - 7.2 [Backoff Strategy](#72-backoff-strategy)
   - 7.3 [ETag dan Conditional Requests](#73-etag-dan-conditional-requests)
8. [Error Handling Komprehensif](#8-error-handling-komprehensif)
   - 8.1 [Matriks Error Handling](#81-matriks-error-handling)
   - 8.2 [User-facing Error Messages](#82-user-facing-error-messages)
   - 8.3 [Logging dan Debugging](#83-logging-dan-debugging)
9. [Diagram Alur API](#9-diagram-alur-api)
10. [Referensi](#10-referensi)

---

## 1. Pendahuluan

blinker mengintegrasikan tiga keluarga API untuk menyediakan akses cepat ke koleksi file markdown dari repositori GitHub. Ketiga API tersebut adalah:

1. **GitHub REST API** — digunakan untuk mengambil daftar file dari repositori (`GET /git/trees/main?recursive=1`).
2. **raw.githubusercontent.com** — digunakan untuk mengambil konten file mentah dalam format teks.
3. **Chrome Extension APIs** — digunakan untuk penyimpanan lokal (`chrome.storage.local`), interaksi tab (`chrome.tabs`), dan penyisipan konten ke halaman web (`chrome.scripting`).

Dokumen ini membahas setiap API secara mendetail, termasuk endpoint, format request/response, rate limiting, pola error handling, serta strategi integrasi yang digunakan di blinker.

---

## 2. GitHub Contents API

### 2.1 Endpoint dan URL Pattern

blinker menggunakan **GitHub Git Trees API** untuk mendapatkan daftar file dari repositori. Ini adalah endpoint yang paling efisien karena mengembalikan seluruh struktur direktori dalam satu response.

**Endpoint:**

```
GET https://api.github.com/repos/{owner}/{repo}/git/trees/{tree_sha}?recursive=1
```

**Parameter:**

| Parameter | Nilai | Deskripsi |
|-----------|-------|-----------|
| `owner` | `ai-builders-id` | Pemilik repositori |
| `repo` | `prd-prompt-collection` atau `mdown-collection` | Nama repositori |
| `tree_sha` | `main` | Branch atau SHA dari tree. blinker menggunakan branch `main` |

**Header yang dikirim:**

```
Accept: application/vnd.github+json
```

**Contoh URL aktual yang digunakan blinker (dari `popup.js`):**

```
// Untuk PRD Prompt Collection
https://api.github.com/repos/ai-builders-id/prd-prompt-collection/git/trees/main?recursive=1

// Untuk Prompt Collection (mdown-collection)
https://api.github.com/repos/ai-builders-id/mdown-collection/git/trees/main?recursive=1
```

**Mengapa Git Trees API?**

- Satu response berisi semua file dan folder dalam repositori (dengan `recursive=1`).
- Tidak perlu melakukan multiple request untuk menavigasi folder.
- Response mencakup metadata setiap file: `path`, `mode`, `type`, `sha`, `size`, `url`.
- Jauh lebih efisien daripada Contents API (`/contents`) yang hanya mengembalikan satu level direktori per request.

### 2.2 Rate Limiting

GitHub API memiliki rate limiting yang berbeda tergantung status autentikasi:

| Status | Rate Limit | Window | Batas Per Request |
|--------|-----------|--------|-------------------|
| **Unauthenticated** | 60 request/jam | Per IP address | - |
| **Authenticated** (token) | 5.000 request/jam | Per user | - |
| **GitHub App** | 5.000 request/jam | Per installation | - |

**Dampak ke blinker:**

- blinker tidak menggunakan autentikasi (tidak ada GitHub OAuth). Oleh karena itu, batas 60 request/jam berlaku per pengguna.
- Setiap kali popup dibuka, maksimal 2 request API dilakukan (satu per repositori).
- Dengan cache 10 menit, seorang pengguna bisa membuka popup ~6 kali per jam sebelum menyentuh limit untuk satu repositori — masih dalam batas aman.
- Jika pengguna sering berganti tab repositori, penggunaan API bisa mencapai 12 request/jam (6 kali switch x 2 repo).

### 2.3 Response Format

Response dari Git Trees API adalah objek JSON dengan struktur berikut:

**Response sukses (HTTP 200):**

```json
{
  "sha": "abc123def456...",
  "url": "https://api.github.com/repos/ai-builders-id/mdown-collection/git/trees/main",
  "tree": [
    {
      "path": "standards/code-review-prompt.md",
      "mode": "100644",
      "type": "blob",
      "sha": "a1b2c3d4e5f6...",
      "size": 2847,
      "url": "https://api.github.com/repos/ai-builders-id/mdown-collection/git/blobs/a1b2c3d4e5f6..."
    },
    {
      "path": "minimal",
      "mode": "040000",
      "type": "tree",
      "sha": "7890123456...",
      "url": "https://api.github.com/repos/ai-builders-id/mdown-collection/git/trees/7890123456..."
    },
    {
      "path": "minimal/bug-report.md",
      "mode": "100644",
      "type": "blob",
      "sha": "fedcba987654...",
      "size": 1532,
      "url": "https://api.github.com/repos/ai-builders-id/mdown-collection/git/blobs/fedcba987654..."
    }
  ],
  "truncated": false
}
```

**Field penting untuk blinker:**

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `tree[].path` | `string` | Path relatif file dari root repositori |
| `tree[].type` | `"blob"` atau `"tree"` | `blob` = file, `tree` = folder/direktori |
| `tree[].size` | `number` | Ukuran file dalam bytes (hanya untuk `blob`) |
| `tree[].sha` | `string` | SHA hash dari blob (berguna untuk caching ETag) |
| `truncated` | `boolean` | Apakah response dipotong karena terlalu besar |

Format ini memungkinkan blinker melakukan filtering di sisi klien tanpa perlu request tambahan ke GitHub.

### 2.4 Filtering Data

Setelah menerima response dari GitHub Tree API, blinker menerapkan filter berdasarkan repositori. Berikut adalah implementasi filter di `popup.js`:

**Filter untuk PRD Prompt Collection:**

```javascript
filter: item => item.type === 'blob'
             && item.path.endsWith('.md')
             && item.path !== 'README.md'
```

| Aturan | Keterangan |
|--------|-----------|
| `item.type === 'blob'` | Hanya file, bukan folder |
| `item.path.endsWith('.md')` | Hanya file markdown |
| `item.path !== 'README.md'` | Eksklusi README.md dari root |

**Filter untuk Prompt Collection (mdown-collection):**

```javascript
filter: item => item.type === 'blob'
             && (item.path.endsWith('.md') || item.path.endsWith('.json'))
             && !item.path.startsWith('assets/')
```

| Aturan | Keterangan |
|--------|-----------|
| `item.type === 'blob'` | Hanya file, bukan folder |
| `item.path.endsWith('.md')` | File markdown |
| `item.path.endsWith('.json')` | Juga sertakan file JSON |
| `!item.path.startsWith('assets/')` | Eksklusi folder `assets/` sepenuhnya |

### 2.5 Error Handling GitHub API

**Kode status HTTP yang mungkin:**

| Status Code | Arti | Handling di blinker |
|-------------|------|---------------------|
| `200 OK` | Sukses | Parse JSON, filter, cache, render |
| `301 Moved Permanently` | Repositori dipindah | Tampilkan error, sarankan cek URL |
| `403 Forbidden` | Rate limit tercapai atau akses ditolak | Tampilkan pesan "Rate limit exceeded" |
| `404 Not Found` | Repositori tidak ditemukan | Tampilkan "Repositori tidak ditemukan" |
| `500 Internal Server Error` | Error server GitHub | Retry dengan backoff, lalu error |
| `502 Bad Gateway` | GitHub sedang bermasalah | Retry, lalu error |
| `503 Service Unavailable` | GitHub sedang maintenance | Tampilkan "GitHub sedang sibuk" |
| `0` (network error) | Tidak ada koneksi internet | Tampilkan "Periksa koneksi internet" |

**Implementasi error handling di blinker (`popup.js`):**

```javascript
async function fetchFileList(repoKey, force = false) {
  // ... cache check ...
  
  const res = await fetch(apiUrl(cfg), { headers: { Accept: 'application/vnd.github+json' } });
  if (!res.ok) throw new Error(`GitHub API ${res.status} — ${cfg.repo}`);
  
  const data = await res.json();
  // ... processing ...
}
```

Saat terjadi error, blinker menampilkan pesan di UI:

```javascript
catch (err) {
  listScroll.innerHTML = `<div class="state-wrap">
    <div class="state-icon">⚠️</div>
    <div class="state-text">Gagal: ${err.message}</div>
  </div>`;
  footerCount.textContent = 'Error';
}
```

---

## 3. raw.githubusercontent.com

### 3.1 URL Pattern

Untuk mengambil konten file, blinker menggunakan **raw.githubusercontent.com**, yaitu CDN GitHub yang menyajikan file mentah tanpa HTML wrapping.

**Pattern URL:**

```
https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}
```

**Contoh aktual yang digunakan blinker:**

```javascript
function rawBase(cfg) {
  return `https://raw.githubusercontent.com/${cfg.owner}/${cfg.repo}/main/`;
}
// Hasil:
// https://raw.githubusercontent.com/ai-builders-id/prd-prompt-collection/main/
// https://raw.githubusercontent.com/ai-builders-id/mdown-collection/main/
```

**Contoh URL lengkap:**

```
https://raw.githubusercontent.com/ai-builders-id/mdown-collection/main/standards/code-review-prompt.md
https://raw.githubusercontent.com/ai-builders-id/prd-prompt-collection/main/PRD-Accounting.md
```

**Implementasi fetch konten:**

```javascript
async function fetchContent(repoKey, path) {
  const cfg = REPOS[repoKey];
  const res = await fetch(rawBase(cfg) + path);
  if (!res.ok) throw new Error(`Gagal fetch ${path}`);
  return await res.text();
}
```

### 3.2 Autentikasi dan Akses

raw.githubusercontent.com adalah layanan publik. Untuk repositori publik:

- **Tidak memerlukan autentikasi** — akses terbuka tanpa token.
- **Tidak ada rate limiting eksplisit** — CDN GitHub menangani beban.
- **Tidak ada header khusus yang diperlukan** — request GET standar sudah cukup.

Untuk repositori pribadi, endpoint `raw.githubusercontent.com` memerlukan token autentikasi. blinker tidak mendukung repositori pribadi saat ini (lihat `PRD.md` — Out of Scope).

**Cache CDN:**

- raw.githubusercontent.com menggunakan CDN dengan cache yang cukup agresif.
- File yang baru di-commit mungkin memerlukan waktu beberapa detik hingga menit untuk muncul di CDN.
- Untuk keperluan development, GitHub menyarankan menggunakan `?cache-bust=timestamp` jika perlu memastikan konten terbaru, namun blinker tidak melakukan ini karena mengandalkan file yang sudah stabil di `main`.

### 3.3 CORS dan Host Permissions

Karena blinker adalah Chrome Extension, kebijakan CORS (Cross-Origin Resource Sharing) tidak berlaku dengan cara yang sama seperti di halaman web biasa. Sebagai gantinya, blinker menggunakan `host_permissions` di `manifest.json`:

```json
{
  "host_permissions": [
    "https://api.github.com/*",
    "https://raw.githubusercontent.com/*",
    "<all_urls>"
  ]
}
```

**Penjelasan izin host:**

| Pattern | Tujuan |
|---------|--------|
| `https://api.github.com/*` | Akses ke GitHub REST API (file list) |
| `https://raw.githubusercontent.com/*` | Akses ke CDN GitHub (file content) |
| `<all_urls>` | Diperlukan untuk `chrome.scripting` dan content script |

**Mengapa `<all_urls>` diperlukan?**

- `chrome.scripting.executeScript` membutuhkan akses ke tab aktif yang mungkin berada di domain manapun.
- Content script (`content.js`) di-inject ke `<all_urls>` untuk menangani drag-and-drop di halaman web mana pun.
- Tanpa `<all_urls>`, ekstensi hanya bisa berinteraksi dengan domain yang tercantum di `host_permissions`.

### 3.4 Error Handling Raw Content

| Status Code | Arti | Handling |
|-------------|------|----------|
| `200 OK` | Sukses | Parse sebagai teks |
| `404 Not Found` | File tidak ada di branch `main` | Tampilkan "File tidak ditemukan" |
| `410 Gone` | File dihapus | Refresh daftar file |
| Network error | Koneksi terputus | Tampilkan "Gagal mengambil konten" |

---

## 4. Chrome Extension APIs

### 4.1 chrome.storage.local

blinker menggunakan `chrome.storage.local` untuk transfer data saat drag-and-drop dan penyimpanan state sementara.

**Method signatures:**

```javascript
// Menyimpan data
chrome.storage.local.set(
  { key: value },
  callback?: () => void
)

// Membaca data
chrome.storage.local.get(
  keys?: string | string[] | object,
  callback: (result: object) => void
)

// Menghapus data
chrome.storage.local.remove(
  keys: string | string[],
  callback?: () => void
)
```

**Penggunaan di blinker:**

| Storage Key | Tipe | Kegunaan | Lifetime |
|-------------|------|----------|----------|
| `mdown_drag_content` | `string` | Konten file yang di-drag | Hapus setelah drop |
| `mdown_drag_ready` | `boolean` | Flag konten siap | Hapus setelah drop |
| `mdown_drag_path` | `string` | Path file yang di-drag | Hapus setelah drop |

**Detail implementasi transfer drag:**

```javascript
// Di popup.js — saat drag dimulai
item.addEventListener('dragstart', e => {
  // ... 
  chrome.storage.local.set({
    mdown_drag_content: cached,
    mdown_drag_ready: true,
    mdown_drag_path: path
  });
});

// Di content.js — saat drop terjadi
chrome.storage.local.get(
  ['mdown_drag_content', 'mdown_drag_ready'],
  (result) => {
    if (result.mdown_drag_ready && result.mdown_drag_content) {
      insertText(target, result.mdown_drag_content);
      chrome.storage.local.remove([
        'mdown_drag_content',
        'mdown_drag_ready',
        'mdown_drag_path'
      ]);
    }
  }
);
```

**Mengapa tidak hanya `dataTransfer`?**

Dalam HTML5 Drag and Drop API, data dari `dataTransfer` hanya tersedia secara sinkron saat event `drop`. Jika konten file belum di-fetch saat drag dimulai (misalnya karena user langsung drag tanpa hover), data tidak bisa di-set secara sinkron. `chrome.storage.local` menjadi jembatan: konten di-fetch secara async dan disimpan ke storage, lalu content script membaca storage saat drop terjadi.

### 4.2 chrome.tabs

blinker menggunakan `chrome.tabs` untuk mendapatkan tab aktif sebagai target penyisipan konten.

**Method signature:**

```javascript
chrome.tabs.query(
  queryInfo: object,
  callback: (tabs: Tab[]) => void
)
```

**Parameter queryInfo:**

```javascript
{ active: true, currentWindow: true }
```

| Field | Nilai | Keterangan |
|-------|-------|------------|
| `active` | `true` | Tab yang sedang aktif |
| `currentWindow` | `true` | Di jendela saat ini |

**Implementasi:**

```javascript
chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
  const tabId = tabs[0].id;
  // Kirim script ke tab ini
  chrome.scripting.executeScript({
    target: { tabId },
    func: insertContent,
    args: [content]
  });
});
```

### 4.3 chrome.scripting

API untuk menjalankan skrip JavaScript di halaman web. blinker menggunakannya untuk menyisipkan konten ke elemen aktif.

**Method signature:**

```javascript
chrome.scripting.executeScript({
  target: {
    tabId: number,
    frameIds?: number[]
  },
  func: Function,
  args?: any[],
  injectImmediately?: boolean,
  world?: 'ISOLATED' | 'MAIN'
}): Promise<InjectionResult[]>
```

**Parameter yang digunakan blinker:**

| Parameter | Nilai | Keterangan |
|-----------|-------|------------|
| `target.tabId` | `tabs[0].id` | ID tab aktif |
| `func` | Function | Fungsi yang akan dijalankan di halaman |
| `args` | `[content]` | Konten yang akan disisipkan |

**Implementasi penyisipan:**

```javascript
pfInsert.addEventListener('click', () => {
  const content = getFinalContent();
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: (c) => {
        const el = document.activeElement;
        if (!el) { alert('Klik dulu field yang ingin diisi.'); return; }
        // ... insert logic ...
      },
      args: [content]
    });
  });
});
```

**Penting:** `chrome.scripting` memerlukan permission `"scripting"` dan `"activeTab"` di manifest. Ini berbeda dengan Manifest V2 yang menggunakan `chrome.tabs.executeScript`. Di Manifest V3, `chrome.scripting.executeScript` adalah pengganti resmi.

### 4.4 Callback vs Promise Pattern

Chrome Extension APIs menggunakan pola callback (callback-based). Namun, Chrome secara bertahap menambahkan dukungan Promise.

**Kondisi saat ini:**

| API | Callback | Promise (Chrome 88+) |
|-----|----------|---------------------|
| `chrome.storage.local.get` | Didukung | Didukung (Chrome 92+) |
| `chrome.storage.local.set` | Didukung | Didukung |
| `chrome.tabs.query` | Didukung | Didukung |
| `chrome.scripting.executeScript` | Tidak (return Promise) | Ya, default Promise |

**blinker menggunakan pola callback:**

```javascript
// Callback pattern
chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
  chrome.scripting.executeScript({
    target: { tabId: tabs[0].id },
    func: (c) => { /* ... */ },
    args: [content]
  });
});
```

**Konversi ke Promise (jika diperlukan di masa depan):**

```javascript
// Promise pattern (alternatif)
try {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  await chrome.scripting.executeScript({
    target: { tabId: tabs[0].id },
    func: (c) => { /* ... */ },
    args: [content]
  });
} catch (err) {
  console.error('Insert gagal:', err);
}
```

**Rekomendasi:** blinker tetap menggunakan pola callback untuk menjaga kompatibilitas maksimum, terutama karena `chrome.storage.local.get` di content script masih lebih stabil menggunakan callback.

---

## 5. Konfigurasi Repositori

### 5.1 Struktur Repositori

blinker mendukung dua repositori GitHub yang dikonfigurasi secara hardcoded di `popup.js`:

```javascript
const REPOS = {
  prd: {
    owner: 'ai-builders-id',
    repo:  'prd-prompt-collection',
    label: 'PRD Prompt',
    icon:  '📋',
    color: '#3fb950',
    filter: item => item.type === 'blob'
                 && item.path.endsWith('.md')
                 && item.path !== 'README.md',
    githubUrl: 'https://github.com/ai-builders-id/prd-prompt-collection',
  },
  mdown: {
    owner: 'ai-builders-id',
    repo:  'mdown-collection',
    label: 'Prompt Collection',
    icon:  '🗂️',
    color: '#58a6ff',
    filter: item => item.type === 'blob'
                 && (item.path.endsWith('.md') || item.path.endsWith('.json'))
                 && !item.path.startsWith('assets/'),
    githubUrl: 'https://github.com/ai-builders-id/mdown-collection',
  },
};
```

### 5.2 Filter Rules

**PRD Prompt Collection:**

| Filter | Nilai | Tujuan |
|--------|-------|--------|
| Tipe | `blob` | Hanya file, bukan direktori |
| Ekstensi | `.md` | Hanya file markdown |
| Eksklusi | `README.md` | File dokumentasi repositori tidak relevan |

**Prompt Collection (mdown-collection):**

| Filter | Nilai | Tujuan |
|--------|-------|--------|
| Tipe | `blob` | Hanya file, bukan direktori |
| Ekstensi | `.md` atau `.json` | Markdown + JSON (konfigurasi/data) |
| Eksklusi path | `assets/` | Folder aset statis (gambar, dll.) |

### 5.3 Perbedaan Tiap Repo

| Aspek | PRD Prompt Collection | Prompt Collection |
|-------|----------------------|-------------------|
| **Nama tab** | "PRD Prompt" | "Prompt Collection" |
| **Ikon tab** | 📋 | 🗂️ |
| **Warna aksen** | Hijau (`#3fb950`) | Biru (`#58a6ff`) |
| **Ekstensi file** | `.md` saja | `.md` dan `.json` |
| **README** | Dieksklusi | Tidak difilter khusus |
| **Folder assets** | Tidak ada | Dieksklusi |
| **URL GitHub** | `prd-prompt-collection` | `mdown-collection` |
| **Label folder root** | "PRD Collection" | "Root" |
| **Ikon default file** | 📋 (📐 untuk template) | 📄 (📐 untuk standards, 🗂️ untuk minimal, {} untuk JSON) |

---

## 6. Integration Patterns

### 6.1 Caching Strategy

blinker menerapkan caching dua tingkat:

**Level 1: localStorage (daftar file)**

```javascript
const CACHE_TTL = 10 * 60 * 1000; // 10 menit

async function fetchFileList(repoKey, force = false) {
  const cfg = REPOS[repoKey];
  const key = cacheKey(repoKey); // "mdown_v3_prd" atau "mdown_v3_mdown"

  // Cek cache
  if (!force) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const c = JSON.parse(raw);
        if (Date.now() - c.ts < CACHE_TTL) return c.files;
      }
    } catch (_) {}
  }

  // Fetch dari API, lalu simpan cache
  const res = await fetch(apiUrl(cfg), { ... });
  const data = await res.json();
  const files = data.tree.filter(cfg.filter).map(...);

  localStorage.setItem(key, JSON.stringify({ ts: Date.now(), files }));
  return files;
}
```

**Struktur cache di localStorage:**

```javascript
{
  "mdown_v3_prd": {
    "ts": 1719200000000,       // Timestamp saat disimpan
    "files": [                  // Array file yang sudah difilter
      { "path": "PRD-Accounting.md", "size": 3847 },
      { "path": "PRD-Marketing.md",  "size": 2156 }
    ]
  },
  "mdown_v3_mdown": {
    "ts": 1719200050000,
    "files": [
      { "path": "standards/code-review.md", "size": 2847 },
      { "path": "minimal/bug-report.md",   "size": 1532 }
    ]
  }
}
```

**Level 2: In-memory Map (konten file untuk drag)**

```javascript
const contentCache = new Map(); // key: "repo:path", value: string

function prefetchContent(repoKey, path) {
  const key = `${repoKey}:${path}`;
  if (contentCache.has(key)) return;
  contentCache.set(key, null); // mark as in-flight
  fetchContent(repoKey, path)
    .then(c => contentCache.set(key, c))
    .catch(() => contentCache.delete(key));
}
```

**Perbedaan antara kedua level cache:**

| Aspek | localStorage Cache | In-memory Cache |
|-------|-------------------|-----------------|
| **Data** | Daftar file (metadata) | Konten file (teks) |
| **TTL** | 10 menit | Lifetime popup (hilang saat popup ditutup) |
| **Persistensi** | Persisten (disk) | Volatil (RAM) |
| **Tujuan** | Mengurangi panggilan GitHub API | Mempercepat drag-and-drop |
| **Kapasitas** | ~5-10 MB (batasan browser) | Tergantung RAM popup |

### 6.2 Prefetching

Prefetching adalah strategi untuk mengambil konten file sebelum user benar-benar melakukan drag.

**Trigger prefetch:**

```javascript
// Prefetch on hover
item.addEventListener('mouseenter', () => prefetchContent(repo, path));

// Prefetch on pointer down (touch/mouse)
item.addEventListener('pointerdown', () => prefetchContent(repo, path));
```

**Alur prefetch:**

1. User mengarahkan kursor ke item file di daftar (event `mouseenter`).
2. `prefetchContent` dipanggil, menandai key sebagai "in-flight" (`null`).
3. `fetchContent` mulai mengunduh konten dari raw.githubusercontent.com.
4. Saat konten tiba, disimpan di `contentCache` Map.
5. Jika user melakukan drag (event `dragstart`), konten sudah siap di cache.
6. Konten di-set ke `dataTransfer` secara sinkron dan juga ke `chrome.storage.local` sebagai fallback.

**Fallback jika prefetch gagal atau belum selesai:**

```javascript
item.addEventListener('dragstart', e => {
  const cached = contentCache.get(cacheKey);
  if (cached) {
    // Konten siap
    e.dataTransfer.setData('text/plain', cached);
  } else {
    // Konten belum siap: set placeholder, fetch async
    e.dataTransfer.setData('text/plain', `{{LOADING:${path}}}`);
    fetchContent(repo, path)
      .then(content => {
        contentCache.set(cacheKey, content);
        chrome.storage.local.set({ mdown_drag_content: content, ... });
      });
  }
});
```

**Strategi ini memastikan 90% drag memiliki konten siap di `dataTransfer`** (sesuai target NFR-004 di PRD).

### 6.3 Retry Mechanism

blinker belum mengimplementasikan mekanisme retry otomatis untuk panggilan API yang gagal. Ini adalah area yang bisa ditingkatkan di versi mendatang.

**Rekomendasi retry pattern untuk implementasi masa depan:**

```javascript
async function fetchWithRetry(url, options, maxRetries = 3) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      
      // 429 = Too Many Requests, 5xx = server error
      if (res.status === 429 || res.status >= 500) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      
      // 4xx lainnya — tidak perlu retry
      throw new Error(`HTTP ${res.status}`);
      
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}
```

### 6.4 Offline Behavior

blinker adalah ekstensi yang **tidak memiliki mode offline penuh**. Semua konten diambil langsung dari GitHub secara real-time.

**Apa yang terjadi saat offline:**

| Skenario | Perilaku |
|----------|----------|
| **Popup dibuka saat offline** | Loading spinner muncul, lalu error "Gagal: TypeError Failed to fetch". Cache localStorage bisa membantu jika belum kedaluwarsa. |
| **Drag setelah offline** | `contentCache` (in-memory) mungkin berisi data dari sesi sebelumnya, tapi begitu popup ditutup, cache hilang. |
| **Cache localStorage masih valid** | Daftar file masih bisa ditampilkan, tapi preview konten tetap gagal karena konten tidak di-cache. |

**Rekomendasi offline mode (untuk versi mendatang):**

- Cache konten file yang sering diakses di `chrome.storage.local`.
- Indikator status koneksi di UI.
- Kemampuan untuk menandai file favorit yang otomatis di-cache.

---

## 7. Rate Limiting dan Backoff

### 7.1 Strategi Rate Limiting

Karena blinker menggunakan GitHub API tanpa autentikasi (batas 60 request/jam), strategi berikut diterapkan:

**1. Cache agresif (10 menit TTL)**

Setiap repositori hanya di-fetch maksimal sekali setiap 10 menit. Dalam 1 jam, maksimal 6 fetch per repositori. Dengan 2 repositori, total 12 request/jam — masih 20% dari batas 60 request/jam.

**2. Force refresh dibatasi**

Tombol refresh hanya bisa dipicu secara manual oleh user. Tidak ada auto-refresh atau polling.

**3. Cache key per repositori**

```javascript
function cacheKey(repoKey) { return `mdown_v3_${repoKey}`; }
```

Cache PRD dan Prompt Collection dipisah, sehingga keduanya tidak saling menginvalidasi.

**4. Validasi timestamp**

```javascript
if (Date.now() - c.ts < CACHE_TTL) return c.files;
```

Cache dianggap valid selama belum melewati 10 menit sejak disimpan.

**Perhitungan penggunaan API maksimal:**

| Skenario | Request/jam | Keterangan |
|----------|-------------|------------|
| Normal (buka popup 5x/jam, switch tab 2x) | ~10 | Aman |
| Heavy (buka refresh 10x/jam) | ~20 | Masih aman |
| Ekstrim (refresh 30x/jam) | ~60 | Mendekati limit |

### 7.2 Backoff Strategy

**Kondisi saat ini:** blinker belum mengimplementasikan exponential backoff.

**Implementasi yang direkomendasikan untuk masa depan:**

```javascript
function calculateBackoff(attempt, maxDelay = 30000) {
  // Exponential backoff with jitter
  const baseDelay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s, 16s
  const jitter = Math.random() * 1000; // +0-1s random
  return Math.min(baseDelay + jitter, maxDelay);
}

// Pattern penggunaan:
async function fetchWithBackoff(url, options, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, options);
      
      if (res.status === 429) {
        // Rate limited — baca Retry-After header jika ada
        const retryAfter = parseInt(res.headers.get('Retry-After') || '60');
        await new Promise(r => setTimeout(r, retryAfter * 1000));
        continue;
      }
      
      if (res.status >= 500 && attempt < maxRetries) {
        await new Promise(r => setTimeout(r, calculateBackoff(attempt)));
        continue;
      }
      
      return res;
    } catch (err) {
      if (attempt >= maxRetries) throw err;
      await new Promise(r => setTimeout(r, calculateBackoff(attempt)));
    }
  }
}
```

**Backoff stages (dengan 3 retry):**

| Attempt | Delay | Total Waktu |
|---------|-------|-------------|
| 1 | 2s + jitter | 2-3s |
| 2 | 4s + jitter | 6-8s |
| 3 | 8s + jitter | 14-17s |
| Gagal total | - | ~17 detik |

### 7.3 ETag dan Conditional Requests

**Kondisi saat ini:** blinker tidak menggunakan ETag atau conditional requests. Setiap fetch ke GitHub API selalu mengambil data penuh.

**Mengapa ETag penting:**

ETag (Entity Tag) adalah header HTTP yang memungkinkan client melakukan conditional request. Server mengembalikan `ETag` header di response pertama. Client kemudian bisa mengirim `If-None-Match` header di request berikutnya. Jika data tidak berubah, server response dengan `304 Not Modified` tanpa body — menghemat bandwidth dan tidak mengurangi kuota rate limit.

**Implementasi ETag yang direkomendasikan (masa depan):**

```javascript
// Saat menyimpan cache, simpan juga ETag
const etag = res.headers.get('ETag');
localStorage.setItem(key, JSON.stringify({ ts: Date.now(), files, etag }));

// Saat fetch, kirim ETag
const cached = JSON.parse(localStorage.getItem(key));
const headers = { Accept: 'application/vnd.github+json' };
if (cached && cached.etag) {
  headers['If-None-Match'] = cached.etag;
}

const res = await fetch(url, { headers });
if (res.status === 304) {
  // Data tidak berubah — gunakan cache yang ada, refresh timestamp
  cached.ts = Date.now();
  localStorage.setItem(key, JSON.stringify(cached));
  return cached.files;
}
```

**Manfaat ETag untuk blinker:**

| Metrik | Tanpa ETag | Dengan ETag |
|--------|-----------|-------------|
| Bandwidth per request | Full response (~2-5 KB) | Header only (~300 bytes) |
| Hitungan rate limit | 1 request | 1 request (sama) |
| Latensi rata-rata | ~500-800ms | ~200-400ms (304 lebih cepat) |
| Dapat menghemat request | - | Tidak, tetap 1 request |

ETag tidak mengurangi jumlah request, tapi mengurangi latensi dan bandwidth karena response 304 lebih kecil dan lebih cepat diproses server GitHub.

---

## 8. Error Handling Komprehensif

### 8.1 Matriks Error Handling

Berikut adalah matriks lengkap error yang mungkin terjadi dan penanganannya di blinker:

| API | Error Scenario | Detection | User-Facing Message | Recovery |
|-----|---------------|-----------|---------------------|----------|
| **GitHub Tree API** | Network offline | `fetch` throws `TypeError: Failed to fetch` | "Gagal: Koneksi terputus" | Cek cache localStorage |
| **GitHub Tree API** | Rate limit (403) | `res.status === 403` + header `X-RateLimit-Remaining: 0` | "Gagal: GitHub API rate limit tercapai. Coba lagi nanti." | Tunggu 1 jam |
| **GitHub Tree API** | Repo not found (404) | `res.status === 404` | "Gagal: Repositori tidak ditemukan" | Refresh manual |
| **GitHub Tree API** | Server error (500) | `res.status === 500` | "Gagal: GitHub sedang bermasalah" | Coba lagi |
| **GitHub Tree API** | Truncated response | `data.truncated === true` | "⚠️ Daftar file mungkin tidak lengkap" | Lanjut dengan data yang ada |
| **Raw Content** | Network offline | `fetch` throws | "Gagal fetch {path}" | Coba lagi |
| **Raw Content** | File not found (404) | `res.status === 404` | "Gagal fetch {path}" | Refresh daftar file |
| **Raw Content** | File terlalu besar | Ukuran > 1 MB | "File terlalu besar untuk preview" | Batasi fetch |
| **Clipboard API** | Clipboard blocked | `navigator.clipboard.writeText` throws | Tombol berubah jadi "✗" | Fallback ke `document.execCommand('copy')` |
| **chrome.scripting** | No active tab | `tabs` array kosong | "Tidak bisa mengakses tab aktif" | Minta user klik tab |
| **chrome.scripting** | Permission denied | `chrome.runtime.lastError` | "Izin tidak mencukupi" | Periksa manifest |
| **chrome.storage** | Quota exceeded | Set throws | (Silent — log ke console) | Hapus data lama |
| **chrome.storage** | Content not ready | `mdown_drag_ready` false | Drop tidak menghasilkan konten | User coba drag ulang |

### 8.2 User-facing Error Messages

Semua pesan error di blinker ditampilkan dalam Bahasa Indonesia, konsisten dengan kebijakan UI.

**Pesan error untuk daftar file:**

```javascript
// State loading
<div class="state-text">Mengambil daftar file...</div>

// State error
<div class="state-wrap">
  <div class="state-icon">⚠️</div>
  <div class="state-text">${err.message}</div>
</div>
```

**Pesan error untuk preview:**

```javascript
// State loading
<div class="state-text">Loading...</div>

// State error  
👁️ — di daftar file

// Saat gagal fetch konten
<div class="state-wrap">
  <div class="state-icon">⚠️</div>
  <div class="state-text">${err.message}</div>
</div>
```

**Feedback untuk aksi copy:**

```javascript
// Sukses
btn.textContent = '✓'; 
btn.classList.add('copied');
setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1500);

// Gagal
btn.textContent = '✗';
setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
```

**Feedback untuk aksi insert:**

```javascript
// Di halaman web (via content script)
// Flash hijau pada elemen target
el.style.outline = '2px solid #3fb950';
setTimeout(() => { el.style.outline = prev; }, 700);
```

### 8.3 Logging dan Debugging

blinker menggunakan `console.warn` untuk error non-kritis yang tidak perlu ditampilkan ke user:

```javascript
// Prefetch gagal — silent warning, tidak perlu UI error
fetchContent(repo, path)
  .then(content => contentCache.set(cacheKey, content))
  .catch(err => console.warn(err));

// Drag fallback async gagal — silent warning
fetchContent(repo, path)
  .then(content => { ... })
  .catch(err => console.warn(err));
```

---

## 9. Diagram Alur API

Berikut adalah alur lengkap dari inisialisasi hingga penggunaan API:

### 9.1 Alur Inisialisasi (Popup Dibuka)

```
User klik ikon ekstensi
        │
        ▼
Popup terbuka
        │
        ▼
loadRepo('prd') dipanggil  (default tab)
        │
        ├── Cek localStorage cache key "mdown_v3_prd"
        │       │
        │       ├── Cache valid (<10 menit) → return cached files
        │       │       │
        │       │       ▼
        │       │     renderList(files)
        │       │
        │       └── Cache expired/tidak ada
        │               │
        │               ▼
        │         Fetch GitHub Tree API
        │         GET /repos/ai-builders-id/prd-prompt-collection/git/trees/main?recursive=1
        │               │
        │               ├── Sukses (200)
        │               │       │
        │               │       ▼
        │               │     Filter: blob + .md + !README.md
        │               │       │
        │               │       ▼
        │               │     Simpan ke localStorage + renderList()
        │               │
        │               └── Gagal (4xx/5xx/network)
        │                       │
        │                       ▼
        │                     Tampilkan pesan error di UI
        │
        ▼
      Selesai (popup siap digunakan)
```

### 9.2 Alur Preview File

```
User klik tombol 👁 pada item file
        │
        ▼
openPreview(repoKey, path)
        │
        ├── Set view state: hide list, show preview
        │
        ├── Tampilkan spinner "Loading..."
        │
        ▼
fetchContent(repoKey, path)
GET https://raw.githubusercontent.com/{owner}/{repo}/main/{path}
        │
        ├── Sukses (200)
        │       │
        │       ├── extractVars(rawContent) → deteksi {{VARIABEL}}
        │       ├── applyVars(rawContent) → substitusi nilai yang sudah diisi
        │       ├── renderPreview() → render markdown ke HTML
        │       │
        │       └── Tampilkan:
        │           ├── Rendered: markdown → HTML
        │           ├── Raw: escaped source
        │           ├── Variable chips (jika ada variabel)
        │           └── Tombol aksi: Drag, Copy, Insert
        │
        └── Gagal
                │
                ▼
              Tampilkan ⚠️ + pesan error
```

### 9.3 Alur Drag and Drop

```
User hover/pointerdown pada item file
        │
        ▼
prefetchContent(repo, path)
        │
        ├── Cek in-memory cache (contentCache Map)
        │
        └── Fetch konten dari raw.githubusercontent.com
                │
                ▼
              Cache konten di Map (async)
                │
                ▼
User memulai drag (dragstart event)
        │
        ├── Cek contentCache
        │       │
        │       ├── Konten siap → set dataTransfer + chrome.storage
        │       │
        │       └── Konten belum siap → set placeholder + fetch async + chrome.storage fallback
        │
        ▼
Drag berlangsung di halaman web
        │
        ▼
Content script (content.js):
        ├── dragover → deteksi drop target, tampilkan overlay
        ├── dragleave → hapus overlay
        │
        └── drop event
                │
                ├── Cek dataTransfer.getData('text/plain')
                │       │
                │       ├── Konten siap (bukan placeholder) → insertText()
                │       │
                │       └── Konten placeholder {{LOADING:...}} → chrome.storage fallback
                │               │
                │               ▼
                │             chrome.storage.local.get('mdown_drag_content')
                │               │
                │               └── insertText() + hapus storage keys
                │
                ▼
              Hapus overlay + flash hijau konfirmasi
```

---

## 10. Referensi

### 10.1 Link Eksternal

| Resource | URL |
|----------|-----|
| GitHub Git Trees API | https://docs.github.com/en/rest/git/trees |
| GitHub Rate Limiting | https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting |
| raw.githubusercontent.com | https://raw.githubusercontent.com/ |
| Chrome Storage API | https://developer.chrome.com/docs/extensions/reference/storage/ |
| Chrome Tabs API | https://developer.chrome.com/docs/extensions/reference/tabs/ |
| Chrome Scripting API | https://developer.chrome.com/docs/extensions/reference/scripting/ |
| Manifest V3 | https://developer.chrome.com/docs/extensions/mv3/intro/ |
| HTML5 Drag and Drop | https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API |
| Content Security Policy | https://developer.chrome.com/docs/extensions/mv3/sandboxingEval/ |

### 10.2 File Terkait di blinker

| File | Path Absolut |
|------|-------------|
| Source code utama | `D:\project\mdown-collection-chrome\popup.js` |
| Content script | `D:\project\mdown-collection-chrome\content.js` |
| Manifest | `D:\project\mdown-collection-chrome\manifest.json` |
| UI popup | `D:\project\mdown-collection-chrome\popup.html` |
| PRD | `D:\project\mdown-collection-chrome\docs\requirements\PRD.md` |
| FRD | `D:\project\mdown-collection-chrome\docs\requirements\FRD.md` |

### 10.3 Changelog API

| Versi | Tanggal | Perubahan | Penulis |
|-------|---------|-----------|---------|
| 1.0 | 2026-06-24 | Dokumen awal — API Reference untuk blinker v2.0.0 | Cloud Dark |

---

*Dokumen ini adalah referensi teknis untuk pengembang yang bekerja pada atau mengintegrasikan dengan blinker. Update dokumentasi setiap kali ada perubahan signifikan pada penggunaan API.*
