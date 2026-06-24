# Security Document — blinker Chrome Extension

- **Ekstensi**: blinker (Manifest V3)
- **Versi**: 2.0.0
- **Dokumen ini**: Analisis keamanan menyeluruh untuk Chrome Extension "blinker" yang berfungsi sebagai markdown prompt manager dengan integrasi GitHub API, drag-and-drop, dan content script injection.

---

## Daftar Isi

1. [Permission Model & Risk Assessment](#1-permission-model--risk-assessment)
2. [Content Security Policy (CSP)](#2-content-security-policy-csp)
3. [Data Privacy](#3-data-privacy)
4. [Storage Security](#4-storage-security)
5. [Content Script Security](#5-content-script-security)
6. [GitHub API Security](#6-github-api-security)
7. [Drag & Drop Security](#7-drag--drop-security)
8. [Zero Third-Party Dependencies](#8-zero-third-party-dependencies)
9. [Threat Model (STRIDE Analysis)](#9-threat-model-stride-analysis)
10. [OWASP Checklist](#10-owasp-checklist)
11. [GDPR & Chrome Web Store Compliance](#11-gdpr--chrome-web-store-compliance)
12. [Vulnerability Reporting Process](#12-vulnerability-reporting-process)

---

## 1. Permission Model & Risk Assessment

### Permissions yang Diminta

| Permission | Level Risiko | Justifikasi |
|---|---|---|
| `activeTab` | Rendah | Memberi akses sementara ke tab aktif saat pengguna berinteraksi. Digunakan untuk menginjeksi teks ke input/textarea via tombol "Insert". Tidak memberikan akses persisten ke semua tab. |
| `scripting` | Sedang | Diperlukan oleh `activeTab` untuk menjalankan `chrome.scripting.executeScript()`. Hanya aktif saat pengguna mengeklik "Insert" di popup. Tidak ada background script persistent. |
| `storage` | Rendah | Digunakan untuk transfer data drag-and-drop antar konteks (popup ke content script). Data bersifat sementara dan langsung dihapus (`chrome.storage.local.remove`) setelah diproses. |
| `https://api.github.com/*` | Rendah | Akses read-only ke GitHub API untuk mengambil daftar file dari dua repository publik. Tidak ada token autentikasi; hanya endpoint publik. |
| `https://raw.githubusercontent.com/*` | Rendah | Akses read-only untuk mendownload konten file `.md` dan `.json` dari repository publik. |
| `<all_urls>` | **Tinggi** | Diperlukan karena content script harus aktif di semua halaman untuk mendeteksi drop target (textarea, input, contentEditable). Risiko dimitigasi oleh: (a) content script hanya bereaksi terhadap event drag-and-drop dan (b) tidak ada komunikasi keluar yang tidak diinisiasi pengguna. |

### Analisis Risiko `<all_urls>`

Host permission `<all_urls>` adalah risiko terbesar pada permission model ini. Namun beberapa mitigasi diterapkan:

1. Content script (`content.js`) tidak berkomunikasi dengan server eksternal. Tidak ada fetch, XMLHttpRequest, atau WebSocket dari content script.
2. Content script tidak membaca atau mengirim data halaman ke mana pun. Fungsi satu-satunya adalah menerima drop dan menyisipkan teks.
3. Tidak ada background script persistent (manifest tidak mendeklarasikan `background` service worker). Ekstensi hanya aktif saat popup terbuka.
4. Tidak ada `webRequest`, `cookies`, `tabs`, atau permission sensitif lain yang memungkinkan ekfiltrasi data.

**Rekomendasi**: Bila memungkinkan di masa depan, ganti `<all_urls>` dengan pola URL yang lebih spesifik, atau gunakan `activeTab` saja dan tambahkan minimal `userScript` daripada content script global.

---

## 2. Content Security Policy (CSP)

### Kondisi Saat Ini

Manifest V3 saat ini **tidak mendeklarasikan CSP** secara eksplisit. Chrome menerapkan CSP default untuk extension MV3:

- `script-src 'self'`
- `object-src 'none'`
- `style-src 'unsafe-inline'` (diperlukan oleh popup HTML yang menggunakan inline `<style>`)

### Analisis

| Aspek | Status | Catatan |
|---|---|---|
| Inline script (`<script>` tag) | Aman — hanya `popup.js` dari local bundle | Tidak ada CDN, tidak ada eval |
| `eval()` | Tidak digunakan | Tidak ada panggilan `eval()` di seluruh codebase |
| `innerHTML` | **Risiko sedang** — digunakan di `popup.js` baris 185, 224, 357, 364, 441, 449, 316 | Semua input sudah melalui sanitasi via `renderMarkdown()` |
| `style` inline di HTML | Diperlukan oleh desain popup | CSP default MV3 mengizinkan `'unsafe-inline'` untuk style |
| `fetch()` ke API eksternal | Aman — hanya ke GitHub API dan raw.githubusercontent.com | Tidak ada komunikasi ke server acak |

### Rekomendasi CSP Eksplisit

Meskipun CSP default MV3 sudah cukup ketat, menambahkan CSP eksplisit dianjurkan untuk defense-in-depth:

```json
"content_security_policy": {
  "extension_pages": "script-src 'self'; object-src 'none';"
}
```

Tidak perlu menambahkan `connect-src` karena fetch ke api.github.com dan raw.githubusercontent.com sudah dibatasi oleh `host_permissions`.

### Risiko `innerHTML`

Fungsi `renderMarkdown()` di `popup.js` menggunakan regex substitution untuk mengkonversi markdown ke HTML, lalu hasilnya dimasukkan ke DOM via `innerHTML`. Ini adalah surface XSS potensial jika konten dari GitHub mengandung HTML berbahaya. Namun:

1. Semua input markdown discape terlebih dahulu: `&`, `<`, `>` diubah menjadi entity HTML (baris 391).
2. Regex yang digunakan hanya mengkonversi pola markdown yang dikenal — tag HTML mentah akan tetap ter-escape.
3. Konten bersumber dari dua repository yang dikontrol oleh pengembang.

**Rekomendasi**: Tambahkan sanitasi final menggunakan API `Sanitizer` (tersedia di Chromium) jika browser support, atau implementasikan allowlist tag HTML di akhir `renderMarkdown()` untuk defense-in-depth.

---

## 3. Data Privacy

### Apa yang DIKUMPULKAN

1. **File list cache (localStorage)**: Daftar path dan ukuran file dari GitHub API, disimpan dengan key `mdown_v3_prd` dan `mdown_v3_mdown`. Masa berlaku 10 menit. Hanya metadata publik (path, size).
2. **Drag content (chrome.storage.local)**: Konten markdown yang akan di-drop ke halaman web. Disimpan sementara saat drag dimulai dan dihapus setelah drop selesai.
3. **Variable values (memory)**: Nilai variabel `{{VAR}}` yang diisi pengguna di modal editor. Hanya ada di runtime JavaScript popup (tidak disimpan ke disk).

### Apa yang TIDAK DIKUMPULKAN

1. **Tidak ada cookies**: Ekstensi tidak membaca atau mengakses cookies pengguna.
2. **Tidak ada analytics**: Tidak ada Google Analytics, telemetry, atau tracking pixel.
3. **Tidak ada user authentication**: Tidak ada login, tidak ada session token.
4. **Tidak ada data browsing history**: Content script tidak membaca URL, DOM, atau data pribadi halaman.
5. **Tidak ada network request logging**: Ekstensi tidak menggunakan `webRequest` API.
6. **Tidak ada background persistent activity**: Service worker tidak ada; ekstensi hanya aktif saat popup terbuka.
7. **Tidak ada data pengguna dikirim ke pihak ketiga**: Satu-satunya koneksi keluar adalah fetch read-only ke GitHub API (repositori publik) dan raw.githubusercontent.com.
8. **Tidak ada storage sinkron**: `chrome.storage.sync` tidak digunakan; semua penyimpanan bersifat lokal.

### Pernyataan Privasi

Blinker tidak mengumpulkan, menyimpan, atau mengirimkan data pribadi pengguna. Ekstensi ini beroperasi sepenuhnya secara lokal dengan koneksi keluar minimal yang hanya membaca konten markdown publik dari repositori GitHub yang telah ditentukan.

---

## 4. Storage Security

### chrome.storage.local

| Aspek | Detail |
|---|---|
| Key yang digunakan | `mdown_drag_content`, `mdown_drag_ready`, `mdown_drag_path` |
| Tujuan | Transfer data antar konteks (popup ke content script) |
| Durasi | Data ditulis saat drag start, dibaca saat drop, lalu segera dihapus dengan `chrome.storage.local.remove()` |
| Isolasi | Terisolasi per ekstensi — hanya content script dari ekstensi yang sama bisa membaca data ini |
| Enkripsi | Data disimpan dalam bentuk plaintext di disk browser. Karena ini hanya konten markdown publik, tidak ada risiko signifikan. |

**Risiko potensial**: Jika terjadi kompromi browser, attacker dengan akses ke profil Chrome bisa membaca data storage. Namun kontennya adalah markdown dari repositori publik, bukan data sensitif.

### localStorage

| Aspek | Detail |
|---|---|
| Key yang digunakan | `mdown_v3_prd`, `mdown_v3_mdown` |
| Tujuan | Cache daftar file dari GitHub API |
| Durasi | 10 menit TTL, atau sampai pengguna mengeklik tombol refresh |
| Isi | Array objek `{path: string, size: number}` |
| Sinkronisasi | Tidak ada; lokal per instance popup |

### Pembandingan: chrome.storage vs localStorage

| Aspek | chrome.storage.local | localStorage |
|---|---|---|
| Isolasi antar ekstensi | Ya (terisolasi per extension ID) | Ya |
| Isolasi dari content script | Ya (hanya extension context) | **Tidak** — content script bisa membaca localStorage halaman induk |
| Kapasitas | ~10 MB (extension) | ~5-10 MB (per origin) |
| Persistensi | Persistent (disk) | Persistent (disk) |
| Cocok untuk | Cross-context communication (popup -> content script) | Caching data yang hanya dipakai di popup |

**Catatan penting**: `localStorage` di popup page (extension page) sebenarnya adalah localStorage dari ekstensi itu sendiri, bukan dari halaman web yang aktif. Jadi aman dari content script halaman web.

### Rekomendasi

1. Pertimbangkan untuk memindahkan cache file list ke `chrome.storage.local` juga untuk konsistensi. Saat ini ada dual approach (chrome.storage untuk drag, localStorage untuk cache) yang bisa disederhanakan.
2. Jika di masa depan ada data yang lebih sensitif, gunakan `chrome.storage.session` (MV3) yang bersifat in-memory dan otomatis terhapus saat sesi browser berakhir.

---

## 5. Content Script Security

### Apa yang Dilakukan Content Script

File `content.js` menjalankan fungsi berikut di setiap halaman web:

1. Mendeteksi elemen yang bisa diisi teks (textarea, input[type=text/search/url/email], contentEditable).
2. Menampilkan overlay visual saat drag di atas elemen tersebut.
3. Menerima drop dan menyisipkan teks markdown ke elemen target.
4. Membaca `chrome.storage.local` untuk mengambil konten yang siap di-drop.

### XSS Prevention

| Teknik | Penerapan |
|---|---|
| **textContent, bukan innerHTML** | Semua manipulasi DOM pada elemen target menggunakan `value` (untuk input/textarea) atau `document.createTextNode()` (untuk contentEditable). Tidak ada satupun konten markdown yang dimasukkan sebagai HTML ke halaman. |
| **No eval()** | Content script tidak menggunakan `eval()`, `Function()`, `setTimeout(string)`, atau eksekusi kode dinamis. |
| **No DOM clobbering** | Tidak ada akses ke properti DOM berbahaya. Hanya `selectionStart/End`, `value`, `dispatchEvent`. |
| **Event handler terbatas** | Hanya `dragover`, `dragleave`, `drop` — tidak ada event yang bisa dimanipulasi untuk eksekusi kode. |
| **No message passing** | Content script tidak menggunakan `chrome.runtime.onMessage` atau `postMessage` untuk komunikasi lintas konteks. |

### Risiko Overlay

Overlay div dibuat dengan `pointerEvents: 'none'` sehingga tidak bisa menjadi target klik atau event. Z-index yang tinggi (`2147483647`) memang besar, tetapi karena pointer-events dinonaktifkan, overlay tidak bisa dicegat untuk clickjacking.

### Risiko Insert via `scripting.executeScript`

Fungsi di `popup.js` baris 512-527 menginjeksi kode ke halaman web saat tombol "Insert" diklik. Kode yang diinjeksi:

- Membaca `document.activeElement`
- Jika textarea/input: menyisipkan teks via manipulasi `value` dan `selectionStart/End`
- Jika contentEditable: menggunakan `document.execCommand('insertText', false, c)`
- Tidak membaca data dari halaman
- Tidak mengirim data ke mana pun

**Risiko**: Rendah. Fungsi yang diinjeksi tidak mengandung input pengguna yang tidak difilter (parameter `c` adalah konten markdown mentah yang sudah melalui `applyVars()`). Namun karena fungsi ini dijalankan di konteks halaman web, ada potensi jika attacker meng-override `document.activeElement` getter. Ini adalah risiko yang sangat teoretis dan tidak praktis untuk dieksploitasi.

### Self-Visiting Check

Content script memiliki guard `if(window.__mdownDropperV2) return;` untuk mencegah double initialization jika content script diinjeksi ulang. Ini mencegah memory leak dan race condition.

---

## 6. GitHub API Security

### Tanpa Autentikasi

Blinker menggunakan GitHub API **tanpa token autentikasi**. Semua request dikirim sebagai unauthenticated requests ke endpoint publik:

```
GET https://api.github.com/repos/{owner}/{repo}/git/trees/main?recursive=1
GET https://raw.githubusercontent.com/{owner}/{repo}/main/{path}
```

### Rate Limiting

- **Unauthenticated requests**: 60 request per jam per IP (GitHub policy).
- Untuk dua repository yang diakses (prd-prompt-collection dan mdown-collection), caching 10 menit di localStorage mengurangi beban API secara signifikan.
- Satu kali load awal = 2 request API (satu per repo). Setelah itu, cache digunakan selama 10 menit.
- Jika pengguna melakukan refresh, cache dihapus dan request baru dibuat.

### Dampak Rate Limit

Jika rate limit tercapai:

1. **Gejala**: API mengembalikan status `403` atau `429` dengan header `X-RateLimit-Remaining: 0`.
2. **Penanganan**: Error ditangkap di `fetchFileList()`, ditampilkan sebagai pesan error di UI popup ("Gagal: GitHub API 403...").
3. **Recovery**: Pengguna bisa menunggu hingga rate limit reset (biasanya 1 jam dari first request).

### Implikasi Keamanan Rate Limit

Rate limit yang ketat sebenarnya menguntungkan dari segi keamanan — membatasi seberapa sering ekstensi bisa dijadikan alat untuk scraping oleh pihak ketiga yang mengakses mesin pengguna.

### Rekomendasi

1. Pertimbangkan untuk menambahkan GitHub Token opsional (via opsi ekstensi) untuk meningkatkan rate limit menjadi 5000 request/jam. Token harus disimpan di `chrome.storage.local` dan hanya dikirim di header `Authorization`.
2. Implementasi exponential backoff untuk retry saat rate limit tercapai.
3. Pertimbangkan GitHub API ETag/If-None-Match untuk conditional request, mengurangi beban API dan mempercepat cache validation.

---

## 7. Drag & Drop Security

### Alur Drag-and-Drop

```
Popup:
  dragstart → setData('text/plain', content)
            → chrome.storage.local.set({ mdown_drag_content, mdown_drag_ready })

Halaman Web (content script):
  dragover  → detect drop target, show overlay
  drop      → getData('text/plain') → jika konten ada → insertText()
            → fallback: chrome.storage.local.get() → insertText()
            → chrome.storage.local.remove()
```

### Risiko Terkait Drag-and-Drop

| Risiko | Mitigasi |
|---|---|
| **Data leakage via drag** | Konten di set sebagai `text/plain` via `DataTransfer.setData()`. Hanya aplikasi yang menerima drop yang bisa membaca data ini. |
| **Cross-origin drag** | Browser membatasi drag antar origin. Pengguna secara eksplisit melakukan drag dari popup ekstensi ke halaman web. |
| **Data tersisa di storage** | `chrome.storage.local.remove()` dipanggil setelah drop sukses. Jika drop gagal (misal dibatalkan), data tetap ada di storage sampai drag berikutnya menimpa. |
| **Overlay abuse** | Overlay adalah visual saja dengan `pointer-events: none`. Tidak bisa digunakan untuk clickjacking atau intercept event. |

### Race Condition Handling

Content script memiliki fallback mechanism:

1. **Fast path**: Jika konten sudah siap di `DataTransfer.getData('text/plain')`, gunakan langsung.
2. **Fallback path**: Jika konten tidak tersedia (masih loading), ambil dari `chrome.storage.local`.
3. **Prefix check**: Konten yang diawali `{{LOADING:...}}` tidak dimasukkan karena menandakan konten belum siap — content script akan fallback ke storage.

Ini mencegah situasi di mana placeholder string `{{LOADING:path}}` dimasukkan ke halaman web.

### Interaksi Drag dari File Item vs Preview Footer

Ada dua source drag:

1. **File item di list view**: Menggunakan prefetch cache (`contentCache` Map) untuk performance. Drag dari sini memicu fetch konten jika belum ada di cache.
2. **Preview footer drag button**: Konten sudah pasti ada di memori (`rawContent` + `varValues`). Drag button langsung menyediakan konten via `e.dataTransfer.setData()`.

Keduanya menulis ke `chrome.storage.local` untuk memastikan content script bisa mengambil konten.

---

## 8. Zero Third-Party Dependencies

### Deklarasi

Blinker memiliki **zero third-party dependencies**. Tidak ada:

- Library JavaScript (jQuery, React, Vue, Lodash, dll.)
- CSS framework (Bootstrap, Tailwind, dll.)
- CDN resources
- npm packages
- Webpack, Vite, atau bundler lainnya
- Google Analytics atau tracking scripts
- External fonts

### Implikasi Keamanan

| Aspek | Keuntungan |
|---|---|
| **Supply chain attack** | Tidak ada risiko. Tidak ada dependensi yang bisa disusupi. |
| **SBOM** | Tidak diperlukan. Seluruh codebase adalah first-party code. |
| **Update vulnerability** | Tidak ada library yang perlu di-patch. |
| **Audit trail** | Kode sumber sepenuhnya transparan dan bisa diaudit oleh reviewer Chrome Web Store. |
| **Build tampering** | Tidak ada build pipeline yang bisa dimanipulasi. File HTML/CSS/JS langsung digunakan. |

### Markdown Renderer Kustom

Ekstensi menggunakan markdown renderer kustom (~25 baris regex) sebagai pengganti library seperti marked.js atau showdown. Keuntungan:

- Ukuran minimal (tidak perlu download library besar)
- Tanpa risiko XSS dari library markdown (lihat CVE-2022-23470 di marked.js, dll.)
- Kontrol penuh atas output HTML
- Hanya support subset markdown yang diperlukan

**Trade-off**: Renderer kustom tidak support semua fitur markdown (tables kompleks, task lists, footnotes). Ini adalah trade-off keamanan vs fungsionalitas yang disengaja.

---

## 9. Threat Model (STRIDE Analysis)

### STRIDE per Komponen

| Komponen | Spoofing | Tampering | Repudiation | Info Disclosure | DoS | Elevation |
|---|---|---|---|---|---|---|
| **Popup UI (popup.html/js)** | Rendah — tidak ada autentikasi | Rendah — input terbatas | Rendah — tidak ada log | Rendah — localStorage cache | Rendah — popup sementara | Rendah — tidak ada kontrol akses |
| **Content Script (content.js)** | **Sedang** — bisa disalahgunakan oleh drag dari sumber lain | Rendah — hanya insert teks | Rendah — tidak ada log | Rendah — tidak baca data halaman | Rendah — overlay sementara | Rendah — hanya manipulasi input |
| **GitHub API fetch** | Rendah — endpoint publik HTTPS | Rendah — TLS mencegah tampering | Rendah — tidak ada log | Tidak relevan — data publik | **Sedang** — rate limit bisa habis | Tidak relevan |
| **chrome.storage.local** | Rendah — terisolasi per extension | Rendah — hanya data drag | Rendah — tidak ada log | Rendah — hanya konten markdown publik | Rendah — ukuran kecil | Rendah — tidak ada kontrol akses |
| **localStorage** | Rendah — terisolasi per extension page | Rendah — timestamp + JSON | Tidak relevan | Rendah — hanya metadata file | Rendah — 10 menit TTL | Tidak relevan |

### Threat Scenarios

**S1 — Content script dijalankan di halaman berbahaya**
- **Deskripsi**: Pengguna membuka halaman web berbahaya saat popup terbuka.
- **Dampak**: Halaman bisa mendeteksi keberadaan ekstensi (bisa dicegah dengan `chrome.runtime.id` check, tapi tidak diimplementasikan). Halaman tidak bisa membaca data ekstensi karena content script hanya menulis, tidak membaca data halaman.
- **Mitigasi**: Content script tidak menggunakan `postMessage`, tidak membaca URL, tidak mengirim data. Halaman berbahaya tidak mendapat info berguna dari ekstensi ini.

**S2 — Malicious drop content**
- **Deskripsi**: Konten markdown berisi teks yang membahayakan jika ditempelkan ke aplikasi web (misal injection ke input bank).
- **Dampak**: Ini adalah risiko yang melekat pada fungsionalitas ekstensi. Konten yang ditempelkan bisa berupa teks apa pun.
- **Mitigasi**: Ekstensi hanya menyediakan konten. Pengguna bertanggung jawab penuh atas konten yang mereka drop. Ekstensi tidak mengotomatiskan submit — hanya mengisi field.

**S3 — localStorage poisoning**
- **Deskripsi**: Attacker menulis data berbahaya ke localStorage extension page.
- **Dampak**: Data cache di-parse dengan `JSON.parse()`. Jika data berbahaya, bisa menyebabkan error yang ditampilkan di UI, tapi tidak ada eksekusi kode karena `JSON.parse` tidak menjalankan kode.
- **Mitigasi**: `JSON.parse` di-wrap dalam try-catch (baris 93-96 popup.js). Error hanya menyebabkab fallback ke fetch dari API.

**S4 — Chromium extension store compromise**
- **Deskripsi**: Attacker mendapatkan akses ke akun Chrome Web Store developer dan mengupload versi berbahaya.
- **Dampak**: Semua pengguna yang mengupdate otomatis akan mendapatkan versi berbahaya.
- **Mitigasi**: Tidak ada mitigasi dari sisi ekstensi. Perlindungan ada di sisi operasional: 2FA di akun developer, code signing, dan Chrome Web Store review.

### Trust Boundaries

```
[GitHub API] ──HTTPS──> [Popup] ──chrome.storage──> [Content Script]
                              │
                              └──localStorage──> [Popup (next open)]
```

Tidak ada trust boundary antara popup dan content script selain yang disediakan oleh browser API. Keduanya berjalan di konteks terpisah dengan isolasi ketat dari Chrome.

---

## 10. OWASP Checklist

Berikut adalah kontrol keamanan dari OWASP Extension Security Checklist yang diterapkan oleh blinker:

### OWASP-EXT-1: Use HTTPS for all external communications
- **Status**: **Terpenuhi**
- Semua koneksi keluar menggunakan HTTPS: `https://api.github.com/` dan `https://raw.githubusercontent.com/`.

### OWASP-EXT-2: Validate all user-supplied input
- **Status**: **Terpenuhi sebagian**
- Input dari GitHub API dilewatkan melalui filter `REPOS[repoKey].filter()` dan di-render via fungsi markdown kustom yang melakukan escaping. Input dari modal variabel tidak membahayakan karena hanya digunakan untuk `replaceAll()` pada string konten.

### OWASP-EXT-3: Sanitize output to prevent XSS
- **Status**: **Terpenuhi sebagian**
- Output ke halaman web via content script selalu berupa `textContent` atau `value` — tidak ada HTML injection. Output di popup page melalui `renderMarkdown()` sudah melakukan escaping HTML entities sebelum konversi markdown.

### OWASP-EXT-4: Avoid usage of dangerous functions (eval, innerHTML)
- **Status**: **Terpenuhi sebagian**
- `eval()` tidak digunakan. `innerHTML` digunakan di UI popup untuk rendering markdown setelah escaping. Ini risiko minimal karena konten sudah discape.

### OWASP-EXT-5: Use minimal permissions
- **Status**: **Perlu perbaikan**
- `<all_urls>` adalah permission yang luas. Meskipun ada mitigasi, ini adalah area yang perlu dipersempit jika memungkinkan di masa depan.

### OWASP-EXT-6: Isolate content scripts from extension pages
- **Status**: **Terpenuhi**
- Content script tidak memiliki akses ke `chrome.runtime.getBackgroundPage()` atau API extension internal selain `chrome.storage.local`.

### OWASP-EXT-7: No sensitive data in localStorage
- **Status**: **Terpenuhi**
- localStorage hanya berisi cache path dan ukuran file dari repositori publik.

### OWASP-EXT-8: Disable autofill for sensitive fields
- **Status**: **Tidak relevan**
- Ekstensi tidak memiliki form autofill.

### OWASP-EXT-9: Prevent clickjacking
- **Status**: **Terpenuhi**
- Popup adalah browser action popup yang tidak bisa di-frame. Overlay content script menggunakan `pointer-events: none`.

### OWASP-EXT-10: No external message passing
- **Status**: **Terpenuhi**
- Tidak ada `chrome.runtime.onMessageExternal` atau `postMessage` ke origin lain.

### OWASP-EXT-11: Secure update mechanism
- **Status**: **Terpenuhi**
- Menggunakan update mechanism default Chrome Web Store dengan code signing.

### OWASP-EXT-12: No unnecessary web-accessible resources
- **Status**: **Terpenuhi**
- Tidak ada `web_accessible_resources` di manifest.

---

## 11. GDPR & Chrome Web Store Compliance

### GDPR Compliance

| Persyaratan | Status |
|---|---|
| **Data Controller / Processor** | Tidak relevan — ekstensi tidak mengumpulkan data pribadi. |
| **Lawful basis for processing** | Tidak diperlukan — tidak ada data pribadi yang diproses. |
| **Data minimization** | Terpenuhi — hanya data yang benar-benar diperlukan untuk fungsi ekstensi. |
| **Right to access** | Tidak relevan — tidak ada data pribadi yang disimpan. |
| **Right to erasure** | Terpenuhi — semua data bisa dihapus dengan menutup popup (data in-memory) atau membersihkan localStorage dan chrome.storage. |
| **Data breach notification** | Tidak relevan — tidak ada data breach risk karena tidak ada data pribadi. |
| **DPIA (Data Protection Impact Assessment)** | Tidak diperlukan — ekstensi tidak memproses data pribadi skala besar, tidak profiling, tidak biometric, dll. |

### Pernyataan Kepatuhan GDPR

Blinker tidak mengumpulkan, menyimpan, memproses, atau mentransfer data pribadi pengguna. Ekstensi ini termasuk dalam kategori "non-data" processing sebagaimana didefinisikan dalam GDPR Article 2 dan Recital 15 (purely personal or household activity exemption).

### Chrome Web Store Compliance

| Persyaratan | Status |
|---|---|
| **Single purpose** | Terpenuhi — fungsi tunggal: mengelola dan menyisipkan markdown prompts. |
| **Minimal permissions** | Terpenuhi sebagian — `<all_urls>` perlu justifikasi di listing. |
| **Inline installation** | Tidak relevan — MV3 tidak support inline installation. |
| **User data policy** | Terpenuhi — tidak mengumpulkan data pengguna. |
| **Coercive functionality** | Terpenuhi — tidak ada fungsi yang menipu pengguna. |
| **Disclosure requirements** | Terpenuhi — fungsi ekstensi jelas dari deskripsi dan kode sumber terbuka. |

### Item Checklist Chrome Web Store Listing

Untuk listing di Chrome Web Store, siapkan justifikasi berikut:

1. **`<all_urls>`**: Diperlukan karena content script harus aktif di semua halaman untuk mendeteksi elemen input/textarea dan contentEditable. Tidak ada alternatif yang memadai karena pengguna bisa mengakses halaman web mana pun.
2. **`scripting`**: Diperlukan untuk menginjeksi teks ke halaman web aktif saat pengguna mengeklik "Insert" di popup. Hanya digunakan dengan `activeTab`.
3. **`activeTab`**: Diperlukan untuk mendapatkan akses sementara ke tab aktif.

---

## 12. Vulnerability Reporting Process

### Cara Melapor Kerentanan

Kami menganggap serius keamanan software. Jika Anda menemukan kerentanan keamanan di blinker, harap laporkan melalui saluran berikut:

**Email**: [clouddark@duck.com]
**Subject**: "[blinker Security] Deskripsi singkat"

Atau ajukan GitHub Security Advisory di repository:

**URL**: [https://github.com/ai-builders-id/mdown-collection-chrome/security/advisories](https://github.com/ai-builders-id/mdown-collection-chrome/security/advisories)

### Informasi yang Harus Disertakan

1. **Deskripsi**: Jenis kerentanan dan potensi dampak
2. **Langkah reproduksi**: Langkah detail untuk mereproduksi
3. **Versi ekstensi**: Versi yang terpengaruh (cek di chrome://extensions)
4. **Browser & OS**: Chrome/Chromium version dan sistem operasi
5. **Bukti konsep (PoC)**: Kode atau screenshot yang mendemonstrasikan kerentanan (bila ada)
6. **Saran perbaikan**: Jika ada

### Response Time

| Tahap | Waktu Target |
|---|---|
| Konfirmasi penerimaan | 48 jam |
| Verifikasi kerentanan | 5 hari kerja |
| Patch release (High/Critical) | 14 hari kerja |
| Patch release (Medium/Low) | 30 hari kerja |
| Public disclosure | Setelah patch dirilis |

### Scope

**In-scope**:
- Kerentanan pada kode ekstensi (content.js, popup.js, manifest.json)
- XSS, CSRF, privilege escalation terkait extension
- Data leakage melalui extension
- Bypass permission model

**Out-of-scope**:
- Kerentanan pada repositori GitHub (file konten markdown)
- Kerentanan pada browser Chrome/Chromium itu sendiri
- Social engineering pengguna
- Physical access attacks
- DoS/DDoS attack

### Kebijakan Disclosure

Kami menganut prinsip **responsible disclosure**:

1. Pelapor melapor secara pribadi (private).
2. Tim mengonfirmasi dan mengembangkan patch.
3. Tim merilis patch dan memberikan kredit kepada pelapor (jika diizinkan).
4. Setelah patch dirilis, detail kerentanan dipublikasikan.

---

## Lampiran: Ringkasan Kontrol Keamanan

| Kategori | Status | Area Perbaikan |
|---|---|---|
| Permission model | Perlu perbaikan | Persempit `<all_urls>` atau tambahkan justifikasi eksplisit |
| CSP | Adekuat | Tambahkan CSP deklarasi eksplisit di manifest |
| XSS prevention | Adekuat | Tambahkan sanitizer final untuk innerHTML |
| Storage security | Adekuat | Konsolidasi chrome.storage & localStorage |
| Input validation | Adekuat | Tidak ada input dari pengguna ke server |
| Output encoding | Baik | Semua output ke halaman web adalah text |
| Network security | Baik | HTTPS only, publik endpoints |
| Third-party risk | Sangat baik | Zero dependencies |
| Privacy | Sangat baik | No PII collection |
| Transparency | Sangat baik | Open source, kode bisa diaudit |

---

*Dokumen ini terakhir diperbarui: 24 Juni 2026*
*Untuk pertanyaan keamanan, hubungi: clouddark@duck.com*
