# Panduan Deployment Blinker —— Chrome Extension

> **Dokumen**: Deployment Guide  
> **Proyek**: Blinker (sebelumnya mdown-dropper)  
> **Versi**: 2.0.0  
> **Manifest**: MV3  
> **Terakhir diperbarui**: Juni 2026

---

## Daftar Isi

1. [Ikhtisar Deployment](#1-ikhtisar-deployment)
2. [Persiapan Sebelum Deployment](#2-persiapan-sebelum-deployment)
3. [Chrome Web Store](#3-chrome-web-store)
4. [Version Management](#4-version-management)
5. [Build Process](#5-build-process)
6. [Store Policies](#6-store-policies)
7. [Update Mechanism](#7-update-mechanism)
8. [Sideload dan Manual Distribution](#8-sideload-dan-manual-distribution)
9. [Post-Deployment](#9-post-deployment)
10. [Lampiran](#10-lampiran)

---

## 1. Ikhtisar Deployment

Blinker adalah Chrome Extension berbasis Manifest V3 (MV3) yang memungkinkan pengguna menjelajah, mencari, pratinjau, dan menyisipkan file markdown dari repositori GitHub ke halaman web mana pun. Extension ini sepenuhnya vanilla JavaScript tanpa build step, sehingga proses deployment relatif sederhana namun tetap memiliki beberapa jalur distribusi yang perlu dipahami.

### 1.1 Jalur Distribusi yang Tersedia

| Jalur | Audiens | Kecepatan Distribusi | Persetujuan | Biaya |
|-------|---------|----------------------|-------------|-------|
| Chrome Web Store (CWS) | Publik | 1-3 hari (review) | Wajib | $5 (sekali) |
| Sideload (Developer mode) | Internal / testing | Instan | Tidak perlu | Gratis |
| Enterprise Policy | Organisasi | 1-2 jam | Admin IT | Gratis |
| Local unpacked | Developer sendiri | Instan | Tidak perlu | Gratis |

### 1.2 Struktur File untuk Deployment

```
blinker/
├── manifest.json          # MV3 manifest
├── popup.html             # UI utama extension
├── popup.js               # Logika popup, fetch GitHub, render markdown
├── content.js             # Content script untuk drop handling
├── icons/
│   ├── blinker.svg        # Icon default (action)
│   ├── icon16.png         # Icon 16x16
│   ├── icon48.png         # Icon 48x48
│   └── icon128.png        # Icon 128x128
└── README.md              # Dokumentasi (tidak wajib untuk deployment)
```

Tidak ada dependency eksternal, tidak ada bundler, tidak ada Webpack atau Vite. Semua file adalah JavaScript vanilla, HTML, dan CSS murni. Ini adalah keuntungan besar karena permukaan serangan (attack surface) minim dan tidak ada kerumitan build toolchain.

---

## 2. Persiapan Sebelum Deployment

### 2.1 Requirements Checklist

- [ ] Extension sudah berfungsi penuh di mode `Load unpacked`
- [ ] Semua ikon tersedia dalam ukuran 16x16, 48x48, dan 128x48 (atau SVG)
- [ ] File `manifest.json` sudah menggunakan field `name`, `version`, `description` yang benar
- [ ] Tidak ada hardcoded `localhost` atau URL development dalam kode produksi
- [ ] `content_security_policy` (jika ada) sudah sesuai untuk production
- [ ] Semua API call menggunakan HTTPS
- [ ] Kode sudah melalui minimal self-review atau code review

### 2.2 Akun Chrome Web Store Developer

Untuk mempublikasikan extension ke Chrome Web Store, Anda memerlukan akun developer:

1. Buka [chrome.google.com/webstore/devconsole](https://chrome.google.com/webstore/devconsole)
2. Login dengan akun Google Anda (disarankan akun khusus developer, bukan akun pribadi)
3. Bayar biaya pendaftaran satu kali sebesar **USD $5** — ini dibayarkan melalui Google Payments
4. Setelah pembayaran, akun Anda aktif dan siap untuk submit extension

> **Peringatan**: Biaya $5 bersifat final dan tidak dapat dikembalikan. Pastikan Anda menggunakan akun yang benar sebelum membayar. Google juga dapat menonaktifkan akun developer jika melanggar kebijakan, dan Anda tidak akan mendapatkan refund.

### 2.3 Menyiapkan Assets Store

Chrome Web Store membutuhkan aset-aset berikut sebelum submit:

#### Store Icon
- Ukuran: **128x128 pixel** (wajib)
- Format: PNG
- Referensi: File `icons/icon128.png` yang sudah ada di proyek
- Tips: Gunakan background transparan, pastikan ikon terlihat jelas di foreground putih maupun gelap

#### Screenshots
- Minimal: **1 screenshot** (disarankan 3-5)
- Ukuran: 1280x800 atau 640x400 pixel
- Format: PNG atau JPEG
- Konten: Tunjukkan UI extension dalam aksi — popup terbuka, fitur search, preview markdown, variable editor, drag-and-drop

#### Promotional Tile (Opsional tapi Disarankan)
- Ukuran: 440x280 pixel (small promotional tile)
- Format: PNG
- Gunakan untuk memperkaya halaman listing store

#### Deskripsi Store

Deskripsi panjang di Chrome Web Store mendukung HTML terbatas (paragraf, list, link). Berikut template deskripsi untuk Blinker:

```html
**Blinker** adalah Chrome Extension yang memudahkan Anda mengakses dan menggunakan koleksi prompt markdown serta template PRD langsung dari GitHub.

### Fitur Utama

- **Browse Koleksi** — Jelajahi file markdown dari repositori, dikelompokkan per kategori
- **Search Real-time** — Cari file berdasarkan nama atau path dengan cepat
- **Preview Markdown** — Lihat hasil render markdown langsung di popup (mode Rendered dan Raw)
- **Variable Editor** — Deteksi otomatis variabel {{VAR}} dalam file, isi nilainya lewat chip interaktif
- **Insert ke Halaman Web** — Sisipkan konten langsung ke textarea atau input aktif di halaman mana pun
- **Drag & Drop** — Seret file dari popup ke area input mana pun di web
- **Copy ke Clipboard** — Salin konten dengan satu klik
- **Dua Repositori** — Beralih antara koleksi prompt dan koleksi PRD dengan mudah

### Cara Penggunaan

1. Klik ikon Blinker di toolbar Chrome
2. Pilih tab repositori (Prompt Collection atau PRD Prompt)
3. Cari file yang diinginkan
4. Klik 👁 untuk preview, edit variabel, lalu Insert/Copy/Drag
```

### 2.4 Kategori Store

Pilih kategori yang paling sesuai:

- **Kategori utama**: Developer Tools
- **Kategori sekunder**: Productivity

Atau jika lebih cocok:
- **Kategori utama**: Productivity
- **Kategori sekunder**: Developer Tools

---

## 3. Chrome Web Store

### 3.1 Proses Submit Extension

Proses submit dilakukan melalui Chrome Web Store Developer Dashboard:

#### Langkah 1: Buat Item Baru

1. Buka [Chrome Web Store Developer Dashboard](https://chrome.webstore.devconsole)
2. Klik **"New item"**
3. Upload file ZIP extension Anda (lihat [Build Process](#5-build-process))

#### Langkah 2: Isi Store Listing

| Field | Isian untuk Blinker |
|-------|---------------------|
| **Name** | Blinker |
| **Summary** (132 karakter) | Quickly access and use markdown prompts and templates from GitHub. |
| **Description** | HTML deskripsi panjang (lihat template di atas) |
| **Category** | Developer Tools |
| **Language** | English (atau Indonesian jika target utama) |

#### Langkah 3: Upload Assets

- Icon store 128x128
- Screenshot (1-5 buah)
- Promotional tile (opsional)

#### Langkah 4: Setup Permissions

Bagian ini akan otomatis terisi dari `manifest.json`. Untuk Blinker:

- **activeTab** — Akses ke tab aktif saat insert/drag
- **scripting** — Inject script untuk insert konten ke halaman
- **storage** — Cache file list dan transfer konten drag
- **Host permissions** — `github.com` dan `raw.githubusercontent.com` untuk fetch repositori
- **`<all_urls>`** — Untuk drag-and-drop ke halaman web mana pun

> **Catatan Penting**: Permissions `"<all_urls>"` akan mendapat scrutiny ekstra dari reviewer CWS. Persiapkan justifikasi yang jelas (drag-and-drop membutuhkan akses ke semua domain).

#### Langkah 5: Setup Privacy

Isi kebijakan privasi. Jika tidak punya halaman privasi sendiri, Anda bisa membuat halaman GitHub Pages sederhana. Untuk Blinker:

- Extension **tidak mengumpulkan data pengguna**
- Extension hanya membaca repositori GitHub publik
- Tidak ada tracking, analytics, atau cookie
- Data cache disimpan di `localStorage` dan `chrome.storage.local` — semuanya di sisi klien

#### Langkah 6: Submit untuk Review

Setelah semua terisi, klik **"Submit for Review"**.

### 3.2 Proses Review

Setelah submit, extension memasuki antrian review:

1. **Automated Checks** (5-30 menit):
   - Malware scan
   - Validasi struktur manifest
   - Pengecekan permissions yang berlebihan
   - Pengecekan minimum functionality

2. **Manual Review** (beberapa jam hingga 3 hari kerja):
   - Reviewer manusia memeriksa extension
   - Verifikasi fungsi sesuai deskripsi
   - Pengecekan kepatuhan kebijakan
   - Pengujian permissions usage

3. **Hasil**:
   - **Published** — Extension live di store
   - **Rejected** — Dikirimkan alasan penolakan, Anda bisa memperbaiki dan resubmit
   - **Returned for info** — Reviewer meminta klarifikasi

> **Waktu Review**: Rata-rata 1-2 hari kerja untuk extension sederhana seperti Blinker. Update (versi baru) biasanya lebih cepat, sekitar 30 menit hingga 1 hari.

### 3.3 Common Rejections dan Cara Mengatasinya

#### 3.3.1 Minimum Functionality

**Masalah**: Extension dianggap tidak memberikan fungsi yang berarti atau terlalu sederhana.

**Solusi**:
- Pastikan deskripsi store menjelaskan value proposition dengan jelas
- Extension Blinker sudah memiliki fitur yang cukup: browsing, search, preview, variable editor, insert, drag-drop, copy. Pastikan ini tercantum di deskripsi
- Hindari submit extension yang hanya berisi satu tombol tanpa fungsi yang berguna

#### 3.3.2 Excessive Permissions

**Masalah**: Reviewer menganggap permissions terlalu luas untuk fungsi yang ditawarkan.

**Solusi untuk Blinker**:
- Permissions `"<all_urls>"` adalah yang paling berpotensi ditolak
- Siapkan justifikasi tertulis: "Extension needs `<all_urls>` because users can drag content to any website's text input, not limited to specific domains"
- Pertimbangkan untuk mengganti dengan `"activeTab"` saja jika memungkinkan. Namun, drag-and-drop dalam implementasi saat ini membutuhkan content script yang jalan di semua halaman
- Alternatif: ganti `<all_urls>` di `host_permissions` dengan daftar spesifik jika memungkinkan, dan gunakan `activeTab` untuk fungsi insert

#### 3.3.3 Deceptive Behavior

**Masalah**: Extension dianggap menipu pengguna.

**Solusi**:
- Nama, ikon, dan deskripsi harus jujur
- "Blinker" adalah nama yang unik, tidak meniru extension terkenal
- Pastikan ikon tidak mirip dengan ikon sistem Chrome atau Google
- Jangan klaim fitur yang tidak ada

#### 3.3.4 Data Usage Tidak Jelas

**Masalah**: Kebijakan privasi tidak jelas atau extension mengumpulkan data tanpa persetujuan.

**Solusi**:
- Blinker tidak mengumpulkan data pengguna — nyatakan ini dengan tegas
- Semua data yang di-fetch dari GitHub adalah konten publik
- Tidak ada cookies, analytics, atau tracking
- Jika menggunakan layanan pihak ketiga (GitHub API), jelaskan bahwa data hanya digunakan untuk menampilkan konten yang diminta pengguna

#### 3.3.5 Content Script Injection Tidak Wajar

**Masalah**: Content script di-inject ke semua halaman tanpa alasan jelas.

**Solusi**:
- Content script (`content.js`) diperlukan di `<all_urls>` untuk menangani event `dragover`, `drop`, `dragleave` di setiap halaman
- Fungsi content script terbatas pada:
  - Menampilkan overlay visual saat drag
  - Menyisipkan teks ke elemen yang dapat diisi
  - Tidak membaca atau mengubah konten halaman di luar fungsi drag
- Dokumentasikan ini di justifikasi permissions

### 3.4 Setelah Approval

Setelah extension disetujui:

1. **Publish delay**: Extension bisa memakan waktu hingga 1 jam untuk muncul di hasil pencarian CWS
2. **Public URL**: `https://chromewebstore.google.com/detail/blinker/[EXTENSION_ID]`
3. **Dashboard**: Monitoring performa, rating, dan ulasan di Developer Dashboard
4. **Update**: Setiap update juga melalui review, tapi biasanya lebih cepat

---

## 4. Version Management

### 4.1 Semantic Versioning (Semver)

Blinker menggunakan format semver `MAJOR.MINOR.PATCH`:

| Komponen | Contoh | Kapan Increment |
|----------|--------|-----------------|
| **MAJOR** | 2.0.0 | Perubahan besar yang tidak kompatibel (API berubah, permission baru) |
| **MINOR** | 2.1.0 | Fitur baru yang kompatibel ke belakang |
| **PATCH** | 2.0.1 | Bugfix, perbaikan keamanan, perubahan kecil |

Versi saat ini: **2.0.0**

### 4.2 Dimana Version Disimpan

Version didefinisikan di `manifest.json`:

```json
{
  "version": "2.0.0"
}
```

Setiap kali melakukan update, **wajib** mengubah nilai `"version"` ini. Chrome menggunakan field ini untuk menentukan apakah perlu mengunduh update.

### 4.3 Riwayat Versi

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| 0.1.0 | - | Prototype awal (mdown-dropper) |
| 1.0.0 | - | Rilis pertama Chrome Web Store |
| 2.0.0 | Juni 2026 | Rebrand ke Blinker, tab PRD + mdown, similarity search, variable editor |

### 4.4 Update Process (Developer Side)

Proses merilis versi baru:

1. Buat perubahan kode
2. Update `"version"` di `manifest.json`
3. Update `README.md` jika perlu (fitur baru, perubahan cara pakai)
4. Jika ada perubahan permission, update justifikasi di store listing
5. Build ZIP baru
6. Submit ke Chrome Web Store melalui Developer Dashboard
7. Tunggu approval
8. Setelah approval, Chrome akan mendistribusikan ke semua pengguna dalam ~5 jam

### 4.5 Migration Strategy

Karena Blinker menyimpan data di `localStorage` dan `chrome.storage.local`, migration data antar versi perlu ditangani dengan hati-hati:

```javascript
// Contoh logic migration di popup.js
const STORAGE_VERSION_KEY = 'blinker_storage_v2';

function migrateStorage() {
  const currentVersion = chrome.runtime.getManifest().version;
  const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY);

  if (storedVersion !== currentVersion) {
    // Clear cache lama agar di-fresh dari GitHub
    localStorage.removeItem('mdown_v3_mdown');
    localStorage.removeItem('mdown_v3_prd');
    localStorage.removeItem('mdown_drag_content');
    localStorage.removeItem('mdown_drag_ready');
    chrome.storage.local.clear();

    localStorage.setItem(STORAGE_VERSION_KEY, currentVersion);
    console.log(`Storage migrated to version ${currentVersion}`);
  }
}
```

**Prinsip migration**:
- Selalu backup data pengguna sebelum migration (jika ada data penting)
- Hapus cache format lama yang sudah tidak kompatibel
- Gunakan key version di localStorage untuk mendeteksi pertama kali setelah update
- Jangan asumsikan struktur data lama masih valid

---

## 5. Build Process

### 5.1 Persiapan File

Karena Blinker adalah vanilla JavaScript tanpa build tool, proses build lebih sederhana:

1. **Buat folder bersih** untuk distribusi:
   ```
   blinker-dist/
   ├── manifest.json
   ├── popup.html
   ├── popup.js
   ├── content.js
   └── icons/
       ├── icon16.png
       ├── icon48.png
       └── icon128.png
   ```

2. **Pastikan tidak ada file development** yang ikut:
   - Hapus file `.git`, `README.md`, `docs/`, `node_modules/` (jika ada)
   - Hapus file konfigurasi lokal (`.claude/`, `settings.json`, dll.)
   - Hapus file testing atau debug

3. **Validasi semua referensi path**:
   - Ikon di `manifest.json` → `"icons/blinker.svg"` sudah benar
   - Content script → `"js": ["content.js"]` sudah benar
   - Popup → `"default_popup": "popup.html"` sudah benar

### 5.2 Optimization

Meskipun vanilla JS, ada optimasi yang bisa dilakukan:

#### Minification (Opsional tapi Disarankan)

Gunakan tools sederhana untuk meminify:

```bash
# Gunakan terser untuk minify JavaScript
npx terser popup.js -o popup.min.js --compress --mangle
npx terser content.js -o content.min.js --compress --mangle

# Gunakan html-minifier untuk HTML
npx html-minifier --collapse-whitespace --remove-comments \
  --minify-css --minify-js popup.html -o popup.html
```

**Catatan**: Jika melakukan minification, update `manifest.json` untuk merujuk ke file `.min.js`.

#### Image Optimization

```bash
# Optimasi PNG icons (gunakan tools seperti pngquant atau oxipng)
pngquant --quality=80-90 icons/icon16.png icons/icon48.png icons/icon128.png
```

#### Tree Shaking (Manual)

- Hapus kode yang tidak terpakai dalam produksi
- Untuk Blinker, hampir semua kode di `popup.js` dan `content.js` digunakan

### 5.3 Validasi

Sebelum submit, lakukan validasi berikut:

#### Validasi Struktur

```bash
# Cek struktur file
blinker-dist/
├── manifest.json      # Wajib ada
├── popup.html         # Wajib (dari default_popup)
├── popup.js           # Wajib (dari HTML script tag)
├── content.js         # Wajib (dari content_scripts)
└── icons/
    ├── icon16.png     # Wajib (dari icons)
    ├── icon48.png     # Wajib (dari icons)
    └── icon128.png    # Wajib (dari icons)
```

#### Validasi Manifest

Gunakan Chrome Developer Dashboard yang otomatis memvalidasi manifest. Atau bisa juga menggunakan [Chrome Extension Manifest Validator](https://chrome.google.com/webstore/devconsole) online.

#### Uji Fungsional di Mode Unpacked

Sebelum ZIP, lakukan pengujian akhir:

1. Buka `chrome://extensions`
2. Mode **Developer on**
3. **Load unpacked** → pilih folder distribusi
4. Uji semua fitur:
   - List file dari GitHub berfungsi
   - Search bekerja
   - Preview menampilkan markdown
   - Variable editor mendeteksi `{{VAR}}`
   - Drag & drop berfungsi
   - Copy dan Insert berfungsi

#### Validasi Permissions

Pastikan setiap permission di `manifest.json` benar-benar digunakan:

```json
{
  "permissions": [
    "activeTab",      // Digunakan di pfInsert → chrome.tabs.query
    "scripting",      // Digunakan di pfInsert → chrome.scripting.executeScript
    "storage"         // Digunakan untuk transfer konten drag
  ],
  "host_permissions": [
    "https://api.github.com/*",          // Fetch file list via GitHub API
    "https://raw.githubusercontent.com/*", // Fetch konten file
    "<all_urls>"                          // Content script untuk drag & drop
  ]
}
```

### 5.4 Membuat File ZIP untuk Submit

```bash
# Dari folder distribusi (blinker-dist), buat ZIP:
zip -r ../blinker-2.0.0.zip . -x "*.git*" -x "*node_modules*"

# Atau di Windows PowerShell:
Compress-Archive -Path .\* -DestinationPath ..\blinker-2.0.0.zip
```

**Ukuran ZIP** harus di bawah batas maksimum Chrome Web Store (tidak ada batas ketat, tapi disarankan < 100MB). Untuk Blinker, ukuran ZIP sekitar 50-100KB.

---

## 6. Store Policies

### 6.1 Chrome Web Store Developer Program Policies

Extension Chrome harus mematuhi kebijakan berikut. Berikut analisis kepatuhan Blinker:

#### 6.1.1 Data Usage and Privacy

**Kebijakan**: Extension harus transparan tentang data yang dikumpulkan, digunakan, dan dibagikan.

**Kepatuhan Blinker**:
- **Tidak mengumpulkan data pribadi** — Semua data adalah file markdown dari repositori publik GitHub
- **Tidak ada tracking** — Tidak ada Google Analytics, tidak ada telemetry, tidak ada cookies
- **Tidak ada komunikasi server** — Kecuali fetch dari GitHub API dan raw.githubusercontent.com
- **Data yang disimpan**:
  - `localStorage`: Cache daftar file (TTL 10 menit)
  - `chrome.storage.local`: Transfer konten saat drag (dibersihkan setelah digunakan)
- **Tidak ada third-party sharing** — Data pengguna tidak dikirim ke pihak ketiga

**Yang harus dilakukan**:
- Cantumkan kebijakan privasi di halaman listing store
- Jika menggunakan GitHub API, jelaskan bahwa data repositori bersifat publik

#### 6.1.2 Permissions

**Kebijakan**: Permissions harus minimal dan relevan dengan fungsi extension.

**Kepatuhan Blinker**:

| Permission | Justifikasi |
|------------|-------------|
| `activeTab` | Diperlukan untuk mengakses tab aktif saat menyisipkan konten ke halaman web |
| `scripting` | Diperlukan untuk inject script ke halaman web (fungsi Insert) |
| `storage` | Diperlukan untuk cache file list dan transfer konten melalui chrome.storage saat drag |
| `<all_urls>` | Diperlukan agar content script berjalan di semua domain untuk menangani drag-and-drop |

**Risiko**: Permission `<all_urls>` adalah yang paling mungkin ditanyakan reviewer. Untuk memitigasi:
1. Pastikan justifikasi jelas di catatan submission
2. Content script hanya aktif untuk event drag, tidak untuk membaca data halaman
3. Pertimbangkan menggunakan `activeTab` + `scripting` dengan content script yang di-inject secara dinamis, bukan di-declare di manifest

#### 6.1.3 Content Script

**Kebijakan**: Content scripts tidak boleh mengubah fungsi halaman web di luar tujuan extension.

**Kepatuhan Blinker**:
- Content script (`content.js`) hanya menangani event `dragover`, `dragleave`, dan `drop`
- Tidak memodifikasi DOM halaman di luar menampilkan overlay visual saat drag
- Tidak membaca data pengguna dari halaman
- Tidak mengirim data ke server eksternal
- Fungsi terbatas pada menyisipkan teks ke elemen input yang menjadi target drop

#### 6.1.4 Minimum Functionality

**Kebijakan**: Extension harus memiliki fungsi yang berarti dan tidak boleh kosong.

**Kepatuhan Blinker**: Blinker menyediakan 8+ fitur fungsional:
1. Browse koleksi file markdown (dari dua repositori)
2. Search real-time dengan alias
3. Preview markdown (rendered + raw)
4. Variable editor dengan UI chip interaktif
5. Drag-and-drop ke halaman web
6. Copy ke clipboard
7. Insert ke halaman web
8. Refresh cache manual
9. Tab switching antar repositori

#### 6.1.5 Prohibited Uses

**Kebijakan**: Extension tidak boleh digunakan untuk aktivitas ilegal, menipu, atau berbahaya.

**Kepatuhan Blinker**: Extension hanya mengakses repositori markdown publik untuk tujuan produktivitas. Tidak ada kaitan dengan aktivitas terlarang.

### 6.2 Content Security Policy (CSP)

Blinker tidak mendefinisikan CSP khusus di manifest, sehingga menggunakan CSP default MV3. CSP default MV3 sudah cukup ketat:

- Script eksternal tidak diizinkan
- Hanya kode yang ada dalam package extension yang bisa dijalankan
- Koneksi eksternal hanya ke GitHub API dan raw.githubusercontent.com (yang sudah di-declare di `host_permissions`)

### 6.3 Remote Code

**Kebijakan**: Extension tidak boleh mengeksekusi remote code.

**Kepatuhan Blinker**: Semua kode adalah bagian dari package extension. Tidak ada eval(), `new Function()`, atau remote script injection.

### 6.4 Mengatasi Common Policy Violations

| Pelanggaran Potensial | Mitigasi untuk Blinker |
|----------------------|------------------------|
| Deceptive installation | Nama dan ikon unik, deskripsi jujur |
| Misleading functionality | Semua fitur yang dijanjikan berfungsi |
| User data collection | Tidak ada data collection |
| Excessive permissions | Minimal permissions sesuai fungsi |
| Insecure storage | Hanya localStorage dan chrome.storage |
| Unwanted software | Tidak ada background process mencurigakan |

---

## 7. Update Mechanism

### 7.1 Auto-Update Chrome Web Store

Chrome Web Store menyediakan update otomatis untuk extension yang terinstal:

1. Chrome memeriksa update secara berkala (setiap **~5 jam**)
2. Jika versi di store lebih baru, Chrome mengunduh dan menginstal update
3. Pengguna tidak perlu melakukan tindakan apa pun
4. Extension di-restart otomatis (dengan state pengguna dipertahankan)

**Frekuensi Pemeriksaan Update**:
- Chrome memeriksa update:
  - Setiap 5 jam (regular check)
  - Setiap kali Chrome di-restart
  - Saat pengguna membuka `chrome://extensions`

**Keterbatasan**:
- Update tidak instan — ada delay hingga 5 jam untuk menjangkau semua pengguna
- Pengguna harus memiliki koneksi internet
- Update hanya berjalan saat Chrome aktif

### 7.2 Forced Update

Untuk mempercepat distribusi update (misalnya untuk perbaikan keamanan kritis):

1. Publish versi baru ke Chrome Web Store
2. Buka `chrome://extensions` di browser pengguna
3. Aktifkan **Developer mode**
4. Klik **"Update"** — Chrome akan memeriksa update sekarang
5. Atau programmatically menggunakan `chrome.runtime.requestUpdateCheck()`

```javascript
// Memeriksa update secara manual
chrome.runtime.requestUpdateCheck((status, details) => {
  if (status === 'update_available') {
    console.log(`Update tersedia: ${details.version}`);
    // Chrome akan menginstal update saat browser di-restart
    // atau saat extension dimuat ulang
  } else if (status === 'no_update') {
    console.log('Tidak ada update');
  } else if (status === 'throttled') {
    console.log('Terlalu sering memeriksa, tunggu beberapa saat');
  }
});
```

### 7.3 Update Flow Detail

Saat Chrome menemukan update:

1. **Download** — Chrome mengunduh file ZIP baru
2. **Verifikasi** — Memeriksa integritas file
3. **Instalasi** — File diekstrak ke direktori extension
4. **Event** — `chrome.runtime.onInstalled` di-fire dengan reason `"update"`
5. **Load** — Extension dimuat ulang dengan kode baru

```javascript
// Menangani event update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'update') {
    const prevVersion = details.previousVersion;
    const newVersion = chrome.runtime.getManifest().version;
    console.log(`Update dari ${prevVersion} ke ${newVersion}`);

    // Migration logic di sini
    migrateStorage();
  } else if (details.reason === 'install') {
    console.log('Extension baru diinstal');
    // Setup awal
    performFirstTimeSetup();
  }
});
```

### 7.4 Update Tanpa Chrome Web Store (Self-Hosted)

Untuk enterprise deployment, update bisa dilakukan tanpa Chrome Web Store:

1. Hosting file `.crx` (extension yang sudah di-sign) di server internal
2. Buat file XML update manifest:
   ```xml
   <?xml version='1.0' encoding='UTF-8'?>
   <gupdate xmlns='http://www.google.com/update2/response' protocol='2.0'>
     <app appid='[EXTENSION_ID]'>
       <updatecheck codebase='https://your-server.com/blinker-2.0.0.crx' version='2.0.0' />
     </app>
   </gupdate>
   ```
3. Konfigurasi enterprise policy untuk menggunakan update URL ini

> **Catatan**: Self-hosting membutuhkan private key untuk signing CRX dan lebih kompleks. Jalur ini hanya disarankan untuk organisasi besar dengan kebutuhan enterprise.

---

## 8. Sideload dan Manual Distribution

### 8.1 Developer Mode (Load Unpacked)

Cara paling sederhana untuk instalasi lokal/testing:

1. Buka `chrome://extensions`
2. Aktifkan **Developer mode** (toggle kanan atas)
3. Klik **"Load unpacked"**
4. Pilih folder proyek `blinker/`
5. Extension akan muncul di toolbar

**Keterbatasan**:
- Hanya berfungsi selama folder tidak dihapus/dipindahkan
- Chrome akan menampilkan peringatan "Disable Developer Mode Extensions" saat startup
- Tidak cocok untuk distribusi ke pengguna non-teknis

### 8.2 Extension Management Policy (Enterprise)

Admin IT di organisasi dapat menginstal extension melalui:

#### Group Policy (Windows)
1. Download policy template Chrome dari [Chrome Browser Enterprise](https://chromeenterprise.google)
2. Konfigurasi `ExtensionInstallForceList`:
   ```
   [{"extension_id": "[EXTENSION_ID]", "update_url": "https://clients2.google.com/service/update2/crx"}]
   ```
3. Atau untuk sideload: install menggunakan `--load-extension` startup parameter

#### Mac/Linux
- Gunakan `managed_policies` JSON di direktori konfigurasi Chrome

### 8.3 Sideload via .CRX File

Anda bisa mendistribusikan extension sebagai file `.crx`:

1. **Pack extension**:
   - Di `chrome://extensions`, klik **"Pack extension"**
   - Pilih folder extension
   - Masukkan private key (atau biarkan kosong untuk key baru)
   - Chrome akan menghasilkan `.crx` dan `.pem` (private key)

2. **Distribusi**:
   - Bagikan file `.crx` ke pengguna
   - Pengguna buka `chrome://extensions`
   - Seret file `.crx` ke halaman tersebut
   - Konfirmasi instalasi

3. **Private Key**:
   - **Simpan file `.pem` di tempat aman**
   - Key ini diperlukan untuk update extension di masa depan
   - Jika key hilang, extension tidak bisa di-update tanpa melalui Chrome Web Store

### 8.4 Perbandingan Semua Metode Distribusi

| Metode | Kemudahan | Update Otomatis | Review Store | Cocok Untuk |
|--------|-----------|-----------------|--------------|-------------|
| Chrome Web Store | Mudah (bagi pengguna) | Ya | Ya | Publik, semua pengguna |
| Load unpacked | Mudah (bagi developer) | Tidak | Tidak | Development, testing |
| .CRX sideload | Sedang | Tidak | Tidak | Internal tim, beta testing |
| Enterprise policy | Khusus admin | Ya (self-host) | Tidak | Organisasi, enterprise |

### 8.5 Penggunaan untuk Blinker

**Rekomendasi distribusi**:
1. **Publik** → Chrome Web Store (jalur utama)
2. **Beta testing** → Sideload via .CRX atau Load unpacked
3. **Internal tim** → Enterprise policy atau .CRX
4. **Development** → Load unpacked

---

## 9. Post-Deployment

### 9.1 Monitoring

Setelah extension live, pantau metrik berikut:

#### Chrome Web Store Dashboard
- **Installs** — Jumlah total instalasi
- **Active users** — Pengguna aktif mingguan/bulanan
- **Ratings** — Rating bintang dan jumlah review
- **Crash reports** — Laporan crash dari pengguna
- **Permissions** — Jumlah pengguna yang menarik permission

#### Manual Monitoring

```javascript
// Tambahkan logging untuk debugging (hanya development)
const DEBUG = false; // Set false untuk production

function log(...args) {
  if (DEBUG) console.log('[Blinker]', ...args);
}

// Pantau error dengan try-catch di titik kritis
async function safeFetch(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('[Blinker] Fetch error:', err.message);
    // Tampilkan pesan error ke pengguna
    showErrorState(err.message);
    throw err;
  }
}
```

### 9.2 Feedback Collection

Strategi mengumpulkan feedback pengguna:

1. **Chrome Web Store Reviews** — Pantau ulasan secara berkala
2. **GitHub Issues** — Arahkan pengguna ke repositori GitHub untuk melaporkan bug
3. **In-App Feedback Button** (Opsional) — Tambahkan tombol "Kirim Feedback" yang membuka GitHub Issues:
   ```javascript
   // Di popup.html tambahkan:
   // <button id="feedbackBtn">Kirim Feedback</button>
   
   document.getElementById('feedbackBtn')?.addEventListener('click', () => {
     chrome.tabs.create({
       url: 'https://github.com/ai-builders-id/mdown-collection-chrome/issues/new'
     });
   });
   ```
4. **Rating Prompt** (Opsional) — Setelah penggunaan ke-5, tanyakan rating:
   ```javascript
   function maybeAskRating() {
     const usageCount = parseInt(localStorage.getItem('usage_count') || '0');
     localStorage.setItem('usage_count', String(usageCount + 1));
     if (usageCount === 5) {
       // Tampilkan modal non-intrusive untuk rating
       // Arahkan ke CWS review page
     }
   }
   ```

### 9.3 Bug Reporting

Buat template issue GitHub untuk memudahkan pelaporan bug:

```
**Deskripsi Bug**: [jelaskan bug]
**Versi Extension**: [cek di chrome://extensions]
**Chrome Version**: [cek di chrome://settings/help]
**OS**: [Windows/Mac/Linux]
**Langkah Reproduksi**:
1.
2.
3.
**Screenshot/Video**: [jika ada]
```

### 9.4 Update Cycle yang Direkomendasikan

| Jenis Update | Frekuensi | Waktu Review | Contoh |
|-------------|-----------|--------------|--------|
| **Patch** (bugfix) | Sesuai kebutuhan, bisa mingguan | 1-24 jam | Perbaiki error fetch, UI glitch |
| **Minor** (fitur baru) | Bulanan | 1-3 hari | Variable editor improvement, new tab |
| **Major** (breaking) | Per kuartal | 1-7 hari | Arsitektur ulang, permission berubah |

### 9.5 Rollback Plan

Jika versi baru bermasalah:

1. **Chrome Web Store**: Tidak ada rollback mekanis — Anda harus submit versi lama sebagai versi baru
2. **Simpan backup** setiap versi yang sudah di-submit (source code + manifest)
3. **Untuk self-hosting**: Ganti URL update manifest ke versi sebelumnya
4. **Komunikasi**: Beri tahu pengguna via release notes di store

### 9.6 Roadmap Setelah Launch

Fitur potensial untuk release mendatang:

- **v2.1.0**: Offline cache, multiple language support
- **v2.2.0**: Custom repositori (pengguna bisa memasukkan repo sendiri)
- **v2.3.0**: Dark/light theme toggle
- **v3.0.0**: Side panel mode (Chrome 114+), keyboard shortcuts

---

## 10. Lampiran

### 10.1 Checklist Pre-Submit

Gunakan checklist ini sebelum setiap submit ke Chrome Web Store:

- [ ] Version di `manifest.json` sudah diincrement
- [ ] Extension berfungsi di mode Load unpacked
- [ ] Semua URL produksi sudah benar (tidak ada `localhost` atau `staging`)
- [ ] Ikon tersedia di ukuran yang diminta
- [ ] Screenshot sudah di-upload (min 1, ideal 3-5)
- [ ] Deskripsi store sudah diperbarui
- [ ] Kebijakan privasi sudah diisi
- [ ] ZIP file sudah dibuat (isi hanya file yang diperlukan)
- [ ] Tidak ada kode debug/development (console.log berlebihan)
- [ ] CSP aman (jika ada)
- [ ] Permissions sudah dijustifikasi

### 10.2 Perintah Cepat

```bash
# Build ZIP untuk Chrome Web Store
mkdir -p blinker-build
cp manifest.json popup.html popup.js content.js blinker-build/
cp -r icons blinker-build/
cd blinker-build && zip -r ../blinker-2.0.0.zip . && cd ..

# Test di mode unpacked
chrome://extensions  # Load unpacked → pilih folder blinker-build

# Validasi manifest online
# Buka https://chromewebstore.google.com/devconsole → upload ZIP
```

### 10.3 Referensi

- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/)
- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [Chrome Web Store Policies](https://developer.chrome.com/docs/webstore/program-policies/)
- [Manifest V3 Overview](https://developer.chrome.com/docs/extensions/mv3/)
- [Chrome Extension Security](https://developer.chrome.com/docs/extensions/mv3/security/)
- [Chrome Enterprise Extension Management](https://support.google.com/chrome/a/answer/7519601)

### 10.4 Daftar Istilah

| Istilah | Arti |
|---------|------|
| **CWS** | Chrome Web Store — toko resmi extension Chrome |
| **MV3** | Manifest V3 — arsitektur extension Chrome terkini |
| **CRX** | Format file extension Chrome yang sudah dipackage |
| **Sideload** | Instalasi di luar store resmi |
| **Content Script** | Script yang di-inject ke halaman web |
| **Active Tab** | Tab browser yang sedang aktif |
| **CSP** | Content Security Policy — kebijakan keamanan konten |
| **Semver** | Semantic Versioning — skema penomoran versi MAJOR.MINOR.PATCH |

---

> **Dokumen ini adalah panduan deployment komprehensif untuk Blinker Chrome Extension.**
> Untuk pertanyaan atau issue, buka: [GitHub Issues](https://github.com/ai-builders-id/mdown-collection-chrome/issues)
