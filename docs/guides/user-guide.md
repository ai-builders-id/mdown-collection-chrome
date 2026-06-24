# Panduan Pengguna Blinker

> **Versi:** 2.0.0 | **Diperbarui:** 2026-06-24

---

## Daftar Isi

1. [Pengenalan](#1-pengenalan)
2. [Quick Start 5 Menit](#2-quick-start-5-menit)
3. [Fitur Detail](#3-fitur-detail)
4. [Use Cases](#4-use-cases)
5. [FAQ](#5-faq)
6. [Tips & Tricks](#6-tips--tricks)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Pengenalan

### 1.1 Apa Itu Blinker?

**Blinker** adalah ekstensi Chrome yang dirancang untuk membantu Anda menjelajah, mencari, melihat pratinjau, dan menyisipkan file markdown dari repositori GitHub langsung ke halaman web apa pun. Bayangkan Anda memiliki perpustakaan berisi puluhan template PRD, standar engineering, prompt AI, dan dokumentasi teknis -- dan semuanya bisa Anda akses dalam satu klik tanpa meninggalkan tab yang sedang Anda buka.

Blinker adalah penerus dari **mdown-dropper**, dibangun ulang dengan arsitektur yang lebih modular, dukungan dual-repo, dan alur kerja yang lebih mulus.

### 1.2 Makna Nama "Blinker"

Nama **blinker** terinspirasi dari kata *blink* (kedipan) -- melambangkan kecepatan dan keringkasan. Saat Anda mengakses sebuah template atau prompt, prosesnya hanya butuh satu kedipan mata: dari daftar file hingga konten siap digunakan di halaman Anda. Ekstensi ini hadir untuk meminimalkan gesekan antara "saya butuh template ini" dan "template sudah terisi di halaman saya."

### 1.3 System Requirements

| Komponen | Persyaratan |
|---|---|
| **Browser** | Google Chrome 88+ (atau Chromium-based browser: Edge, Brave, Opera, Vivaldi) |
| **Koneksi Internet** | Diperlukan untuk mengambil daftar file dan konten dari GitHub |
| **Sistem Operasi** | Windows 10+, macOS 10.13+, Linux (semua distro modern) |
| **Akses GitHub** | Tidak perlu akun GitHub -- repositori bersifat publik |
| **Penyimpanan Lokal** | Sekitar 5-10 MB untuk cache (disimpan di `localStorage` browser) |

### 1.4 Cara Install

Ikuti langkah-langkah berikut untuk memasang Blinker di Chrome:

1. **Clone atau download repositori** ini ke komputer Anda:
   ```bash
   git clone https://github.com/ai-builders-id/mdown-collection-chrome.git
   ```
   Atau download sebagai ZIP dari halaman GitHub, lalu ekstrak.

2. **Buka halaman extension Chrome**:
   - Ketik `chrome://extensions` di address bar, lalu tekan Enter.

3. **Aktifkan Developer Mode**:
   - Toggle sakelar **Developer mode** di pojok kanan atas halaman.

4. **Load Unpacked Extension**:
   - Klik tombol **"Load unpacked"**.
   - Pilih folder tempat Anda menyimpan repositori Blinker.
   - Pastikan folder tersebut berisi file `manifest.json`.

5. **Konfirmasi**:
   - Ekstensi Blinker akan muncul di daftar extension Anda.
   - Ikon Blinker (bintang kecil) akan muncul di toolbar Chrome.

6. **Sematkan (opsional)**:
   - Klik ikon puzzle (Extensions) di toolbar, cari Blinker, lalu klik ikon sematan (pin) agar selalu terlihat.

### 1.5 Cara Update

Blinker mengambil daftar file langsung dari GitHub API secara real-time, sehingga konten template selalu yang terbaru. Untuk memperbarui ekstensi itu sendiri:

1. Tarik perubahan terbaru dari repositori: `git pull`
2. Buka `chrome://extensions`
3. Klik ikon **↻ (Reload)** pada kartu Blinker

---

## 2. Quick Start 5 Menit

Ikuti panduan singkat ini untuk merasakan fitur utama Blinker dalam waktu kurang dari 5 menit.

### Langkah 1: Buka Blinker

Klik ikon Blinker di toolbar Chrome. Popup akan terbuka menampilkan daftar file dari repositori **PRD Prompt** (tab aktif pertama).

### Langkah 2: Ganti Repositori

Klik tab **"Prompt Collection"** untuk beralih ke repositori koleksi prompt yang lebih umum. Perhatikan bahwa indikator titik warna berubah: hijau untuk PRD Prompt, biru untuk Prompt Collection.

### Langkah 3: Cari File

Mulai ketik di kotak pencarian (bertuliskan "Cari file..."). Misalnya, ketik **"template"** untuk menyaring file yang mengandung kata tersebut. Hasil pencarian akan diperbarui secara real-time saat Anda mengetik.

### Langkah 4: Preview File

Klik tombol **👁** di samping file mana pun. Popup akan beralih ke tampilan preview dengan konten markdown yang sudah di-render.

### Langkah 5: Isi Variable

Jika file mengandung `{{VARIABLE}}`, Anda akan melihat chip berwarna di bagian atas preview. Klik salah satu chip, masukkan nilai yang diinginkan, lalu klik **"Terapkan"**. Perhatikan bahwa konten preview diperbarui secara langsung dengan nilai yang Anda masukkan.

### Langkah 6: Kirim ke Halaman Web

1. Di halaman web, klik di dalam textarea, input, atau elemen contenteditable (misalnya, input ChatGPT, form Jira, atau editor dokumen).
2. Kembali ke popup Blinker (jangan tutup halaman web).
3. Klik tombol **"⬇ Insert ke Web"** di bagian bawah preview.
4. Konten akan langsung muncul di field yang Anda pilih.

### Selesai!

Anda baru saja menyelesaikan alur kerja utama Blinker: **Browse > Search > Preview > Edit Variable > Insert ke Web**. Tidak perlu copy-paste manual atau bolak-balik antar tab.

---

## 3. Fitur Detail

### 3.1 Dual Repo

Blinker mengelola dua repositori GitHub sekaligus, yang dapat diakses melalui tab di bagian atas popup.

#### Tab PRD Prompt

| Detail | Nilai |
|---|---|
| **Repositori** | `ai-builders-id/prd-prompt-collection` |
| **Ikon Tab** | `📋` |
| **Warna Indikator** | Hijau (`#3fb950`) |
| **Fokus Konten** | Template PRD, dokumen produk, spesifikasi fitur |

Repositori ini berisi kumpulan template Product Requirements Document (PRD), FRD, dan dokumen perencanaan produk lainnya. Cocok untuk Product Manager, Business Analyst, dan siapa pun yang bekerja dengan dokumen spesifikasi.

#### Tab Prompt Collection

| Detail | Nilai |
|---|---|
| **Repositori** | `ai-builders-id/mdown-collection` |
| **Ikon Tab** | `🗂️` |
| **Warna Indikator** | Biru (`#58a6ff`) |
| **Fokus Konten** | Prompt AI, standar engineering, template minimal |

Repositori ini berisi koleksi prompt untuk berbagai keperluan, standar coding, dan template sederhana. File dikelompokkan ke dalam folder seperti `standards/` untuk standar engineering dan `minimal/` untuk template ringan.

#### Filter per Repositori

Masing-masing repositori memiliki filter sendiri:
- **PRD Prompt**: Hanya menampilkan file `.md` (mengecualikan `README.md`)
- **Prompt Collection**: Menampilkan file `.md` dan `.json` (mengecualikan folder `assets/`)

Semua data diperoleh melalui **GitHub Contents API** -- tidak ada hardcode daftar file, sehingga konten selalu sinkron dengan repositori.

### 3.2 Search & Filter

Kotak pencarian di bagian atas popup memungkinkan Anda menyaring file secara instan.

#### Cara Kerja

- Pencarian dilakukan terhadap **path** file (termasuk nama file dan folder).
- Hasil diperbarui secara **real-time** saat Anda mengetik.
- Pencarian bersifat **case-insensitive** (tidak membedakan huruf besar/kecil).

#### Search Aliases

Blinker mendukung alias pencerdas untuk istilah umum:

| Alias | Diperluas Menjadi |
|---|---|
| `cs` | `customer support` |
| `prd` | `product requirements` |
| `qa` | `quality assurance` |
| `api` | `application programming interface` |

Contoh: mengetik **"cs"** akan menampilkan semua file yang mengandung kata "customer support" di path-nya.

#### Indikator Visual

- Hasil pencarian yang kosong menampilkan pesan "Tidak ada file yang cocok."
- Footer di bagian bawah menunjukkan jumlah total file yang ditampilkan.
- Grup folder tetap dipertahankan dalam hasil pencarian untuk memudahkan navigasi.

### 3.3 Preview

Klik tombol **👁** pada item file mana pun untuk membuka tampilan preview. Preview memiliki dua mode:

#### Mode Rendered (Default)

- Konten markdown diterjemahkan ke HTML dengan tampilan yang bersih dan mudah dibaca.
- Mendukung elemen markdown standar:
  - Heading (h1, h2, h3)
  - Paragraph
  - Daftar bullet dan numbered
  - Tabel
  - Blockquote
  - Inline code dan code block
  - Link (dapat diklik, terbuka di tab baru)
  - Bold, italic, bold+italic
  - Garis horizontal (hr)
- Variable yang belum diisi tetap terlihat dengan highlight berwarna dan border dashed.

#### Mode Raw

- Menampilkan konten mentah file dalam font monospace.
- Variable `{{VARIABLE}}` tetap di-highlight dengan warna yang sama seperti chip.
- Berguna untuk melihat dan mengedit konten mentah sebelum digunakan.

#### Navigasi

- Tombol **"← Back"** kembali ke daftar file.
- Nama file ditampilkan di header dengan format yang sudah dibersihkan (underscore diganti spasi, prefix angka dihilangkan).

### 3.4 Variable Editor

Fitur ini mendeteksi secara otomatis seluruh `{{VARIABLE}}` yang ada di dalam file dan memungkinkan Anda mengisinya sebelum digunakan.

#### Cara Menggunakan

1. Buka preview sebuah file.
2. Jika file mengandung variable, bagian **"Variables (klik untuk edit)"** akan muncul di bawah header.
3. Klik salah satu chip variable (misalnya `{{PROJECT_NAME}}`).
4. Sebuah modal akan muncul dengan input field untuk mengisi nilai variable.
5. Masukkan nilai yang diinginkan dan klik **"Terapkan"** (atau tekan Enter).
6. Preview akan diperbarui secara langsung -- variable yang sudah diisi akan terganti dengan nilainya.

#### Aturan Variable

- Format: `{{NAMA_VARIABLE}}` (dua kurung kurawal, huruf kapital, angka, dan underscore).
- Variable bersifat **global** dalam satu sesi preview -- mengisi satu variable akan menggantikan semua kemunculannya dalam file.
- Variable yang belum diisi tetap terlihat di preview rendered dengan gaya visual yang mencolok.
- Nilai variable hanya disimpan dalam memori sesi -- ditutup saat popup ditutup.

#### Modal Edit

- **Judul**: Menampilkan nama variable (misalnya `{{PROJECT_NAME}}`)
- **Input**: Text field untuk memasukkan nilai
- **Batal**: Menutup modal tanpa menyimpan
- **Terapkan**: Menyimpan nilai dan memperbarui preview
- **Shortcut**: Enter = Terapkan, Escape = Batal

### 3.5 Drag & Drop

Blinker mendukung dua mekanisme drag & drop yang berbeda.

#### Drag dari Daftar File

1. Arahkan kursor ke item file di daftar.
2. Pegang dan seret item tersebut (kursor berubah menjadi `grab`).
3. Arahkan ke textarea, input, atau elemen contenteditable di halaman web mana pun.
4. Lepaskan -- konten file akan otomatis terisi.

**Bagaimana ini bekerja?**
- Saat Anda mulai menyeret, Blinker mengambil konten dari GitHub dan menyimpannya ke `chrome.storage.local`.
- Content script di halaman web mendeteksi drop, membaca konten dari storage, dan menyisipkannya.
- Jika konten belum siap saat drag dimulai, akan ada mekanisme fallback yang mengambil konten secara asinkron.

#### Drag dari Preview

1. Di tampilan preview, tombol **"⠿ Drag"** di footer adalah elemen yang bisa diseret.
2. Seret tombol tersebut langsung ke field target di halaman web.
3. Keunggulan dibanding drag dari daftar: variable yang sudah diisi akan ikut disisipkan.

#### Drop Target yang Didukung

| Elemen HTML | Status |
|---|---|
| `<textarea>` | Didukung penuh |
| `<input type="text">` | Didukung penuh |
| `<input type="search">` | Didukung penuh |
| `<input type="url">` | Didukung penuh |
| `<input type="email">` | Didukung penuh |
| Elemen dengan `contenteditable="true"` | Didukung penuh |

#### Visual Feedback

Saat Anda menyeret file ke atas elemen yang didukung, sebuah overlay dengan border biru putus-putus akan muncul sebagai indikasi bahwa elemen tersebut adalah target yang valid. Setelah konten berhasil disisipkan, elemen target akan berkedip hijau sebentar sebagai konfirmasi.

### 3.6 Copy

Blinker menyediakan dua cara untuk menyalin konten file ke clipboard.

#### Copy dari Daftar File

Setiap item file memiliki tombol **"Copy"** yang muncul saat di-hover. Klik tombol ini untuk menyalin konten mentah file (tanpa nilai variable) langsung ke clipboard. Tombol akan menampilkan animasi:
- **"..."** saat sedang mengambil konten
- **"✓"** jika berhasil (berubah hijau)
- **"✗"** jika gagal
- Kembali ke **"Copy"** setelah 1,5 detik

#### Copy dari Preview

Di tampilan preview, tombol **"📋 Copy"** akan menyalin konten file dengan nilai variable yang sudah diisi. Jika Anda sudah mengisi variable tertentu, hasil copy akan berisi nilai-nilai tersebut, bukan placeholder `{{VARIABLE}}`.

### 3.7 Insert ke Web

Fitur **"⬇ Insert ke Web"** adalah salah satu fitur paling powerful di Blinker.

#### Cara Kerja

1. Buka preview file dan isi variable yang diinginkan.
2. **Klik di field target** di halaman web (textarea, input, contenteditable).
3. Kembali ke popup Blinker dan klik **"⬇ Insert ke Web"**.
4. Konten akan disisipkan di posisi kursor pada field yang aktif.

#### Teknis

Blinker menggunakan `chrome.scripting.executeScript` untuk menyuntikkan kode ke halaman web yang aktif. Script akan:
- Mendeteksi elemen aktif (`document.activeElement`).
- Menyisipkan konten di posisi kursor (untuk textarea/input) atau menggunakan `document.execCommand('insertText')` (untuk contenteditable).
- Memicu event `input` dan `change` agar framework JavaScript (React, Vue, Angular) mendeteksi perubahan.

#### Catatan Penting

- **Pastikan field target sudah aktif/terklik** sebelum menekan tombol Insert. Jika tidak, akan muncul alert "Klik dulu field yang ingin diisi."
- Popup Blinker harus tetap terbuka saat Anda mengklik field target (popup tidak perlu dalam fokus, tetapi harus belum ditutup).
- Fitur ini hanya berfungsi di tab yang aktif saat itu.

### 3.8 Refresh

Tombol **↻ (Refresh)** di pojok kanan atas popup digunakan untuk memuat ulang daftar file dari GitHub.

#### Kapan Perlu Refresh?

- **Cache TTL**: Blinker menyimpan daftar file di `localStorage` selama **10 menit**. Dalam periode ini, refresh tidak diperlukan.
- **Konten Baru**: Jika seseorang baru saja menambahkan file baru ke repositori, Anda mungkin perlu refresh untuk melihatnya.
- **Error Loading**: Jika terjadi error saat memuat daftar file, tombol refresh dapat digunakan untuk mencoba lagi.

#### Cara Kerja Cache

- Data cache disimpan di `localStorage` dengan key `mdown_v3_prd` (untuk PRD Prompt) dan `mdown_v3_mdown` (untuk Prompt Collection).
- Setiap data cache berisi timestamp dan array file.
- Saat tombol refresh diklik, cache akan dihapus terlebih dahulu sebelum memuat ulang data dari GitHub.

---

## 4. Use Cases

### 4.1 Product Manager: Mencari Template PRD

**Skenario**: Seorang Product Manager (PM) sedang menyusun Product Requirements Document untuk fitur baru dan membutuhkan template standar.

**Alur Kerja**:
1. Buka Blinker, tab **PRD Prompt** aktif secara default.
2. Di kotak pencarian, ketik **"template"** untuk menyaring file.
3. Preview setiap template dengan mengklik **👁** untuk melihat struktur dokumen.
4. Pilih template yang paling sesuai dengan kebutuhan.
5. Jika template memiliki variable seperti `{{PROJECT_NAME}}` atau `{{FEATURE_DESCRIPTION}}`, isi nilainya menggunakan Variable Editor.
6. Buka dokumen di Google Docs / Notion / Confluence.
7. Klik di area editor, lalu klik **"⬇ Insert ke Web"** di Blinker.
8. Template langsung terisi di dokumen dengan nilai variable yang sudah disesuaikan.

**Hasil**: PM menghemat 15-30 menit waktu yang biasanya dihabiskan untuk mencari dan menyalin template secara manual.

### 4.2 Developer: Mencari Standar Engineering

**Skenario**: Seorang developer ingin memastikan bahwa kontribusi kode-nya mengikuti standar yang ditetapkan tim.

**Alur Kerja**:
1. Buka Blinker, klik tab **Prompt Collection**.
2. Cari folder **"standards"** -- Blinker mengelompokkan file berdasarkan folder.
3. Preview file standar yang relevan, misalnya standar commit message atau code review checklist.
4. Jika ada variable seperti `{{LANGUAGE}}` atau `{{TEAM_NAME}}`, isi sesuai kebutuhan.
5. Gunakan tombol **"📋 Copy"** untuk menyalin standar tersebut dan menempelkannya di wiki tim atau pull request description.

**Hasil**: Developer memiliki akses instan ke standar engineering tanpa perlu membuka repositori GitHub atau mencari di dokumentasi internal.

### 4.3 Writer: Mencari Prompt AI

**Skenario**: Seorang content writer atau AI prompt engineer sedang mencari prompt yang tepat untuk menghasilkan output tertentu dari ChatGPT, Claude, atau Gemini.

**Alur Kerja**:
1. Buka Blinker, pilih tab **Prompt Collection**.
2. Ketik kata kunci di kotak pencarian, misalnya **"blog"**, **"copywriting"**, atau **"SEO"**.
3. Preview prompt yang muncul untuk melihat instruksi dan formatnya.
4. Jika prompt memiliki variable seperti `{{TOPIC}}` atau `{{TONE}}`, isi nilainya.
5. Buka chatbot AI di tab browser (ChatGPT, Claude.ai, dll).
6. Klik di input chat, lalu klik **"⬇ Insert ke Web"**.
7. Prompt yang sudah diisi akan langsung masuk ke chat.

**Tips**: Kombinasikan fitur ini dengan **Drag & Drop** dari tombol "⠿ Drag" di preview untuk workflow yang lebih cepat -- cukup seret prompt langsung ke input chat.

**Hasil**: Writer dapat menguji berbagai prompt dengan cepat, mengganti nilai variable tanpa mengetik ulang seluruh instruksi.

### 4.4 Quality Assurance: Menggunakan Checklist Pengujian

**Skenario**: Seorang QA engineer sedang mempersiapkan test case untuk sprint berikutnya.

**Alur Kerja**:
1. Buka prompt collection, cari file checklist atau test case template.
2. Preview untuk melihat daftar item pengujian.
3. Isi variable seperti `{{MODULE_NAME}}` atau `{{SPRINT_NUMBER}}`.
4. Salin checklist ke tool manajemen pengujian (TestRail, Zephyr, dsb).
5. Gunakan checklist sebagai referensi selama proses pengujian.

---

## 5. FAQ

### 5.1 Umum

**Q: Apakah Blinker gratis?**
A: Ya, Blinker 100% gratis dan open source di bawah lisensi MIT.

**Q: Apakah data saya dikirim ke server pihak ketiga?**
A: Blinker hanya berkomunikasi dengan GitHub API (`api.github.com`) dan `raw.githubusercontent.com` untuk mengambil daftar file dan konten. Tidak ada data pengguna yang dikirim ke server manapun. Semua nilai variable yang Anda masukkan hanya disimpan di memori lokal selama sesi berlangsung.

**Q: Apakah saya perlu akun GitHub?**
A: Tidak. Repositori yang digunakan Blinker bersifat publik dan dapat diakses tanpa autentikasi.

**Q: Apakah Blinker mengumpulkan data analytics?**
A: Tidak. Blinker tidak menyertakan kode analytics, pelacak, atau telemetri dalam bentuk apapun.

**Q: Apakah Blinker berfungsi di browser selain Chrome?**
A: Ya, Blinker berfungsi di semua browser berbasis Chromium, termasuk Microsoft Edge, Brave, Opera, dan Vivaldi. Instalasi dilakukan dengan cara yang sama (Load unpacked).

### 5.2 Fitur

**Q: Mengapa daftar file tidak muncul?**
A: Kemungkinan penyebab:
- Koneksi internet terputus.
- GitHub API sedang mengalami gangguan.
- Cache yang korup. Coba klik tombol **↻ Refresh** untuk memuat ulang.

**Q: Variable editor tidak muncul padahal file mengandung `{{VARIABLE}}`?**
A: Pastikan format variable menggunakan kurung kurawal ganda dan huruf kapital. Contoh benar: `{{PROJECT_NAME}}`. Contoh salah: `{{project_name}}` atau `${PROJECT_NAME}`.

**Q: Fitur Insert ke Web tidak berfungsi?**
A: Pastikan:
1. Anda sudah mengklik field target di halaman web (textarea/input/contenteditable).
2. Popup Blinker masih terbuka.
3. Halaman web berada di tab yang aktif.
4. Izin `scripting` dan `activeTab` sudah diberikan (biasanya otomatis).

**Q: File yang saya cari tidak ada di daftar?**
A: Blinker mengambil data dari repositori publik GitHub. Jika file baru saja ditambahkan, mungkin perlu menunggu hingga cache 10 menit kedaluwarsa, atau klik tombol **↻ Refresh** untuk memuat ulang secara manual.

### 5.3 Troubleshooting Teknis

**Q: Ekstensi tidak bisa di-load (error saat Load unpacked)?**
A: Pastikan folder yang dipilih berisi file `manifest.json` yang valid. Pastikan tidak ada folder yang tumpang tindih dengan ekstensi lain.

**Q: Popup terbuka tapi kosong?**
A: Coba langkah berikut:
1. Buka DevTools popup (klik kanan > Inspect).
2. Periksa tab Console untuk pesan error.
3. Refresh popup dengan menutup dan membukanya kembali.
4. Jika ada error `Failed to fetch`, periksa koneksi internet dan coba refresh.

**Q: Fitur Drag & Drop tidak berfungsi di halaman tertentu?**
A: Beberapa halaman web memiliki keamanan yang melarang script injection. Jika halaman menggunakan Content Security Policy (CSP) yang ketat, content script Blinker mungkin tidak berfungsi. Coba gunakan fitur **Copy** dan paste manual sebagai alternatif.

**Q: Variable values hilang setelah popup ditutup?**
A: Ini adalah perilaku normal. Nilai variable hanya disimpan di memori sesi untuk menjaga privasi. Jika Anda perlu menyimpan nilai, gunakan tool eksternal atau catat sebelum menutup popup.

---

## 6. Tips & Tricks

### 6.1 Keyboard Shortcuts

Blinker tidak memiliki shortcut keyboard global, tetapi ada beberapa shortcut dalam popup yang dapat mempercepat workflow Anda:

| Shortcut | Konteks | Fungsi |
|---|---|---|
| **Enter** | Modal Variable Editor | Menerapkan nilai variable |
| **Escape** | Modal Variable Editor | Membatalkan dan menutup modal |
| **Ketik** | Search Box | Menyaring file secara real-time |
| **Click** | Chip Variable | Membuka modal edit variable |

### 6.2 Best Practices

#### Alur Kerja Cepat dengan Drag & Drop

Untuk workflow tercepat, biasakan menggunakan **Drag & Drop** daripada Copy + Insert:
1. Buka Blinker dan cari file yang diinginkan.
2. Preview sebentar untuk memastikan konten sesuai.
3. Seret langsung dari daftar file ke field target di halaman web.
4. Tidak perlu mengklik tombol apapun -- konten langsung terisi.

#### Manajemen Variable yang Efisien

- **Isi variable sebelum preview**: Jika Anda sudah tahu variablenya, isi semuanya sekaligus sebelum membaca konten.
- **Variable umum**: Jika sebuah template sering digunakan dengan nilai yang sama, catat nilainya di Notepad atau tool catatan agar bisa diisi ulang dengan cepat.
- **Kosongkan variable yang tidak perlu**: Variable yang tidak diisi akan tetap muncul sebagai placeholder `{{VARIABLE}}` -- tidak masalah jika Anda atau tim Anda tahu artinya.

#### Memaksimalkan Search

- Gunakan **alias pencarian** untuk mempercepat: cukup ketik `cs` untuk customer support, `prd` untuk product requirements.
- Ketik nama folder sebagai query untuk melihat semua file dalam folder tertentu.
- Gunakan kata kunci spesifik daripada umum: lebih baik "API documentation" daripada hanya "doc".

#### Manajemen Cache

Cache 10 menit dirancang untuk menyeimbangkan antara kecepatan dan kesegaran data. Jika Anda sedang mengedit repositori dan perlu melihat perubahan segera:
- Klik **↻ Refresh** untuk menghapus cache dan memuat ulang.
- Jika refresh masih menampilkan data lama, coba tutup dan buka popup kembali.

### 6.3 Tips Lanjutan

#### Menggunakan Blinker dengan ChatGPT / Claude

1. Buka chat AI di satu tab.
2. Buka Blinker di tab lain (popup).
3. Cari prompt AI yang diinginkan.
4. Isi variable (topik, tone, format output).
5. Klik input chat di tab AI.
6. Klik **"⬇ Insert ke Web"** di popup Blinker.
7. Kirim prompt dan lihat hasilnya.

Teknik ini sangat efektif untuk A/B testing prompt: ubah satu variable, insert ulang, dan bandingkan outputnya.

#### Menggunakan Blinker dengan Jira / Linear / Notion

1. Buka issue atau dokumen yang sedang diedit.
2. Buka Blinker, cari template yang relevan.
3. Isi variable dengan konteks issue.
4. Insert langsung ke editor.
5. Format markdown akan dipertahankan (heading, list, code block).

#### Drag dari Preview vs Drag dari Daftar

| Fitur | Drag dari Daftar | Drag dari Preview |
|---|---|---|
| Nilai Variable | Tidak diterapkan | Diterapkan |
| Kecepatan | Lebih cepat (tanpa perlu preview) | Sedikit lebih lambat (perlu buka preview) |
| Konten | Konten mentah | Konten yang sudah dipersonalisasi |
| Penggunaan Terbaik | Konten tanpa variable atau standar statis | Template dengan variable yang perlu diisi |

---

## 7. Troubleshooting

### 7.1 Error Codes

Berikut adalah kode error yang mungkin muncul beserta solusinya.

#### Error GitHub API

| Error | Penyebab | Solusi |
|---|---|---|
| `GitHub API 403` | Rate limit GitHub API terlampaui | Tunggu beberapa menit, lalu coba refresh. GitHub API memiliki batas 60 request per jam untuk pengguna tidak terautentikasi. |
| `GitHub API 404` | Repositori tidak ditemukan atau tidak dapat diakses | Periksa koneksi internet dan pastikan repositori masih tersedia. |
| `GitHub API 429` | Terlalu banyak request | Tutup popup, tunggu 1-2 menit, lalu coba lagi. |
| `Failed to fetch` | Koneksi internet terputus, DNS error, atau GitHub sedang down | Periksa koneksi internet, coba akses github.com di browser, lalu refresh Blinker. |
| `Gagal fetch {path}` | File tidak ditemukan di repositori | File mungkin telah dihapus atau dipindahkan. Refresh daftar file untuk memperbarui. |

#### Error Ekstensi

| Error | Penyebab | Solusi |
|---|---|---|
| `Klik dulu field yang ingin diisi` | Tombol Insert ditekan tanpa field target yang aktif | Klik di textarea/input di halaman web terlebih dahulu, lalu klik Insert. |
| Popup tidak muncul | File manifest korup atau ekstensi tidak di-load dengan benar | Reload ekstensi dari `chrome://extensions`. |
| Content script tidak jalan | Halaman web memblokir content script | Coba gunakan fitur Copy (clipboard) sebagai alternatif. |
| `chrome.storage.local` error | Storage browser penuh atau corrupt | Buka `chrome://extensions` > Blinker > detail > hapus storage, lalu reload. |

### 7.2 Debug Mode

Jika Anda mengalami masalah yang tidak dapat diselesaikan dengan solusi di atas, ikuti langkah-langkah berikut untuk mendiagnosis masalah.

#### Langkah 1: Buka Console Popup

1. Buka popup Blinker (klik ikon ekstensi).
2. Klik kanan di dalam popup, pilih **"Inspect"**.
3. DevTools akan terbuka khusus untuk popup Blinker.
4. Buka tab **Console** untuk melihat pesan error dan log.

#### Langkah 2: Periksa Network Requests

1. Di DevTools popup, buka tab **Network**.
2. Refresh daftar file dengan tombol **↻**.
3. Perhatikan request ke `api.github.com` dan `raw.githubusercontent.com`.
4. Klik setiap request untuk melihat status code dan responsenya.
5. Status code 200 berarti sukses, 4xx berarti ada masalah dengan request, 5xx berarti masalah di server.

#### Langkah 3: Periksa Content Script

1. Buka halaman web tempat Anda ingin menggunakan Blinker.
2. Buka DevTools halaman web tersebut (F12).
3. Buka tab **Console**.
4. Ketik `window.__mdownDropperV2` -- jika mengembalikan `true`, berarti content script sudah berjalan.

#### Langkah 4: Cek Storage

1. Di DevTools popup, buka tab **Application**.
2. Di sidebar kiri, pilih **Local Storage** > `chrome-extension://...` (dengan ID ekstensi Blinker).
3. Periksa key `mdown_v3_prd` dan `mdown_v3_mdown` -- keduanya harus berisi JSON dengan `ts` (timestamp) dan `files` (array file).
4. Jika data tidak ada atau korup, klik **↻ Refresh** untuk mengisi ulang.

#### Langkah 5: Manual Test

Untuk memastikan bahwa koneksi ke GitHub berfungsi, coba akses URL berikut langsung di browser:

- **Daftar file PRD**: `https://api.github.com/repos/ai-builders-id/prd-prompt-collection/git/trees/main?recursive=1`
- **Daftar file Prompt Collection**: `https://api.github.com/repos/ai-builders-id/mdown-collection/git/trees/main?recursive=1`

Jika URL di atas bisa diakses di browser tetapi tidak di Blinker, kemungkinan ada masalah dengan permission ekstensi.

### 7.3 Masalah Umum dan Solusi Cepat

| Masalah | Solusi Tercepat |
|---|---|
| Daftar file tidak muncul | Klik **↻ Refresh** |
| Preview kosong | Tutup dan buka popup lagi, lalu coba preview ulang |
| Insert tidak berfungsi | Pastikan sudah klik field target di halaman web |
| Variable tidak terdeteksi | Periksa format `{{NAMA_VARIABLE}}` |
| Drag & Drop tidak berfungsi | Gunakan tombol **Copy** sebagai alternatif |
| Ekstensi error setelah update | Reload ekstensi dari `chrome://extensions` |
| Popup terlalu kecil/besar | Ukuran popup 400x600px tidak dapat diubah |

### 7.4 Melaporkan Bug

Jika Anda menemukan bug yang tidak tercantum di sini, laporkan melalui GitHub Issues:

1. Buka [repositori Blinker](https://github.com/ai-builders-id/mdown-collection-chrome).
2. Klik tab **Issues** > **New Issue**.
3. Sertakan informasi berikut:
   - Versi Chrome dan sistem operasi.
   - Langkah-langkah untuk mereproduksi masalah.
   - Pesan error dari Console (jika ada).
   - Screenshot atau screen recording (jika memungkinkan).

---

## Lampiran: Struktur File Blinker

```
mdown-collection-chrome/
├── manifest.json        # Konfigurasi Chrome Extension (Manifest V3)
├── popup.html           # HTML popup dengan styling dark mode
├── popup.js             # Logika utama: fetch, render, variable editor, search
├── content.js           # Content script untuk drag & drop di halaman web
├── icons/
│   ├── blinker.svg      # Ikon SVG utama
│   ├── icon16.png       # Ikon 16x16
│   ├── icon48.png       # Ikon 48x48
│   └── icon128.png      # Ikon 128x128
├── README.md            # Dokumentasi awal
└── docs/                # Dokumentasi lengkap
    └── guides/
        └── user-guide.md  # Panduan pengguna ini
```

Blinker dibangun dengan **Vanilla JavaScript** tanpa build step atau dependency eksternal. Kode sumbernya ringan, mudah dipelajari, dan mudah dikontribusi.

---

## Catatan Rilis

| Versi | Tanggal | Perubahan |
|---|---|---|
| 2.0.0 | 2026-06-24 | Rilis ulang dari mdown-dropper ke Blinker dengan dual-repo, UI baru, dan variable editor |
| 1.0.0 | 2026-05-01 | Rilis pertama mdown-dropper dengan fitur dasar browse, preview, dan drag & drop |

---

*Dokumen ini adalah bagian dari proyek [mdown-collection-chrome](https://github.com/ai-builders-id/mdown-collection-chrome). Kontribusi dan saran selalu diterima melalui GitHub Issues atau Pull Requests.*
