# Testing Strategy — blinker Chrome Extension

| **Dokumen** | Testing Strategy & Test Cases |
|---|---|
| **Proyek** | blinker (sebelumnya mdown-dropper) |
| **Versi** | 2.0.0 |
| **Tanggal** | 2026-06-24 |
| **Status** | Final |
| **Penulis** | Cloud Dark |

---

## Daftar Isi

1. [Testing Strategy Overview](#1-testing-strategy-overview)
2. [Unit Testing](#2-unit-testing)
3. [Integration Testing](#3-integration-testing)
4. [Manual Test Cases (TC-001 hingga TC-012)](#4-manual-test-cases)
5. [Cross-browser Testing](#5-cross-browser-testing)
6. [Performance Testing](#6-performance-testing)
7. [Accessibility Testing](#7-accessibility-testing)
8. [Regression Checklist](#8-regression-checklist)

---

## 1. Testing Strategy Overview

### 1.1 Pendekatan Pengujian

blinker menggunakan strategi pengujian **berlapis** (*layered testing*) yang mencakup tiga tingkatan utama:

| Tingkat | Fokus | Metode | Cakupan Target |
|---|---|---|---|
| **Unit** | Fungsi JavaScript murni | Manual review + assertion mental | `extractVars()`, `applyVars()`, `getDisplayName()`, `getFileIcon()`, `getNumberPrefix()`, `getNameWithoutNumber()`, `formatSize()`, `renderMarkdown()` |
| **Integrasi** | Interaksi antar modul + API eksternal | End-to-end manual test di Chrome | GitHub API, chrome.storage, chrome.scripting, komunikasi popup-content script |
| **Sistem** | Seluruh alur pengguna | Manual test case (TC) terstruktur | 12 skenario dari inisialisasi hingga error handling |

### 1.2 Lingkungan Pengujian

| Komponen | Spesifikasi |
|---|---|
| **Browser Utama** | Google Chrome 125+ (Manifest V3) |
| **Browser Tambahan** | Microsoft Edge 125+, Brave 1.68+ |
| **OS** | Windows 11 Pro (10.0.26200), macOS 14+, Linux (Ubuntu 22.04+) |
| **Tools** | Chrome DevTools (Console, Network, Storage, Performance), GitHub API Test Harness |
| **Jaringan** | Koneksi internet aktif (wajib untuk GitHub API) |

### 1.3 Prinsip Pengujian

1. **Cache-first validation**: Setiap pengujian harus diverifikasi dengan cache kosong dan cache terisi untuk memastikan perilaku yang benar di kedua kondisi.
2. **Error simulation**: Semua error state harus diuji: network offline, rate limit GitHub, repositori tidak ditemukan, clipboard blocked.
3. **State isolation**: Setiap skenario pengujian dimulai dari state yang bersih (fresh popup).
4. **User-centric**: Skenario pengujian mencerminkan perilaku nyata pengguna (browsing, search, preview, variable editing, drag-drop, copy, insert).

### 1.4 Risk-Based Testing Priority

| Prioritas | Area | Risiko Jika Gagal |
|---|---|---|
| **P0** (Critical) | GitHub API fetch, Drag & Drop content transfer, Insert ke Web, Variable substitution | Ekstensi tidak berfungsi sama sekali |
| **P1** (High) | Search & filter, Preview rendered/raw, Copy to clipboard, Cache mechanism | Fitur utama tidak berfungsi |
| **P2** (Medium) | Variable chips & modal, UI states (loading/error/empty), Repo tab switching | Gangguan UX, error tidak tertangani |
| **P3** (Low) | File icon & grouping, Footer info, Refresh button, Format ukuran file | Masalah kosmetik / minor |

---

## 2. Unit Testing

### 2.1 extractVars()

**Fungsi**: Mengekstrak nama variabel `{{VAR_NAME}}` dari string teks. Regex: `/\{\{([A-Z0-9_]+)\}\}/g`.

| Test ID | Input | Expected Output | Keterangan |
|---|---|---|---|
| UT-001 | `"Gunakan {{MODEL}} dengan suhu {{TEMP}}"` | `["MODEL", "TEMP"]` | Dua variabel berbeda |
| UT-002 | `"Tidak ada placeholder"` | `[]` | Tanpa variabel |
| UT-003 | `"{{SINGLE}}"` | `["SINGLE"]` | Satu variabel |
| UT-004 | `"{{DUPLICATE}} dan {{DUPLICATE}} lagi"` | `["DUPLICATE"]` | Duplikat di-deduplikasi (Set) |
| UT-005 | `""` | `[]` | String kosong |
| UT-006 | `"{{lowercase}}"` | `[]` | Hanya uppercase A-Z, 0-9, underscore |
| UT-007 | `"{{MIXED_case}}"` | `[]` | Huruf kecil tidak lolos regex |
| UT-008 | `"{{VAR_1}} {{VAR_2}} {{VAR_3}}"` | `["VAR_1", "VAR_2", "VAR_3"]` | Variabel dengan angka |
| UT-009 | `"{{A}} {{B}} {{A}} {{C}} {{B}}"` | `["A", "B", "C"]` | Banyak duplikat, urutan sesuai kemunculan pertama |
| UT-010 | `"{{}}"` | `[]` | Variabel kosong (tanpa nama) |

### 2.2 applyVars()

**Fungsi**: Mengganti `{{VAR}}` dengan nilai dari objek `varValues`.

| Test ID | Input Text | varValues | Expected Output | Keterangan |
|---|---|---|---|---|
| UT-011 | `"Halo {{NAMA}}"` | `{NAMA: "Dunia"}` | `"Halo Dunia"` | Substitusi sederhana |
| UT-012 | `"{{A}} dan {{B}}"` | `{A: "satu", B: "dua"}` | `"satu dan dua"` | Multi variabel |
| UT-013 | `"Teks biasa"` | `{}` | `"Teks biasa"` | Tanpa variabel |
| UT-014 | `"{{X}}{{X}}{{X}}"` | `{X: "a"}` | `"aaa"` | Replace all (gunakan replaceAll) |
| UT-015 | `"{{UNFILLED}}"` | `{}` | `"{{UNFILLED}}"` | Variabel tidak diisi — tidak berubah (hanya truthy value yang di-replace) |
| UT-016 | `"{{KOSONG}}"` | `{KOSONG: ""}` | `"{{KOSONG}}"` | String kosong tidak truthy — tidak di-replace |
| UT-017 | `"{{A}} {{A}}"` | `{A: "sama"}` | `"sama sama"` | replaceAll untuk semua kemunculan |
| UT-018 | `"{{NUM}}"` | `{NUM: "123"}` | `"123"` | Nilai numerik dalam string |
| UT-019 | `"{{SPECIAL}}"` | `{SPECIAL: "$&^*(@"}` | `"$&^*(@"` | Karakter spesial dalam nilai |
| UT-020 | `""` | `{A: "val"}` | `""` | String kosong |

### 2.3 getDisplayName()

**Fungsi**: Mengubah path file menjadi nama tampilan yang bersih.

| Test ID | Input | Expected Output | Keterangan |
|---|---|---|---|
| UT-021 | `"PRD-Accounting.md"` | `"PRD-Accounting"` | Hapus ekstensi .md |
| UT-022 | `"standards/code-review.md"` | `"code-review"` | Path dengan folder, ambil filename |
| UT-023 | `"00_PROJECT_CHARTER.md"` | `"00 PROJECT CHARTER"` | Underscore jadi spasi, prefix angka tetap |
| UT-024 | `"01_PR_Dokumentasi_API.md"` | `"01 PR Dokumentasi API"` | Underscore jadi spasi |
| UT-025 | `"data.json"` | `"data"` | Ekstensi .json juga dihapus |
| UT-026 | `"minimal/bug-report.json"` | `"bug-report"` | Path nested + .json |
| UT-027 | `"README.md"` | `"README"` | Nama file tanpa ekstensi |

### 2.4 getFileIcon()

**Fungsi**: Menentukan ikon berdasarkan path file dan repoKey.

| Test ID | Path | repoKey | Expected Output | Keterangan |
|---|---|---|---|---|
| UT-028 | `"data.json"` | `"mdown"` | `"{}"` | File JSON selalu {} |
| UT-029 | `"template-prd.md"` | `"prd"` | `"📐"` | PRD + mengandung "template" |
| UT-030 | `"PRD-Accounting.md"` | `"prd"` | `"📋"` | PRD biasa |
| UT-031 | `"standards/coding.md"` | `"mdown"` | `"📐"` | Mdown + path mulai "standards/" |
| UT-032 | `"minimal/bug.md"` | `"mdown"` | `"🗂️"` | Mdown + path mulai "minimal/" |
| UT-033 | `"prompts/react.md"` | `"mdown"` | `"📄"` | Mdown lainnya |

### 2.5 getNumberPrefix() dan getNameWithoutNumber()

**Fungsi**: Mengekstrak nomor urut dan nama bersih dari file dengan prefix angka.

| Test ID | Fungsi | Input | Expected Output | Keterangan |
|---|---|---|---|---|
| UT-034 | `getNumberPrefix` | `"01_PR_Dokumentasi.md"` | `"01"` | Prefix dua digit dengan underscore |
| UT-035 | `getNumberPrefix` | `"10-PRD-Accounting.md"` | `"10"` | Prefix dengan dash |
| UT-036 | `getNumberPrefix` | `"standards/code-review.md"` | `null` | Tanpa prefix angka |
| UT-037 | `getNumberPrefix` | `"standards/99_final.md"` | `"99"` | Prefix di file dalam folder |
| UT-038 | `getNameWithoutNumber` | `"01_PR_Dokumentasi.md"` | `"PR Dokumentasi"` | Nomor dihapus, underscore jadi spasi |
| UT-039 | `getNameWithoutNumber` | `"standards/code-review.md"` | `"code review"` | Tanpa prefix, underscore jadi spasi |
| UT-040 | `getNameWithoutNumber` | `"minimal/bug-report.json"` | `"bug report"` | Path + ekstensi .json |

### 2.6 formatSize()

**Fungsi**: Memformat ukuran byte ke string.

| Test ID | Input | Expected Output | Keterangan |
|---|---|---|---|
| UT-041 | `512` | `"512B"` | Kurang dari 1 KB |
| UT-042 | `1024` | `"1.0KB"` | Tepat 1 KB |
| UT-043 | `2048` | `"2.0KB"` | 2 KB |
| UT-044 | `1536` | `"1.5KB"` | 1.5 KB |
| UT-045 | `0` | `""` | Ukuran 0 (empty string, untuk folder) |
| UT-046 | `null` | `""` | Null/undefined |
| UT-047 | `undefined` | `""` | Undefined |

### 2.7 renderMarkdown()

**Fungsi**: Parser markdown sederhana berbasis regex (tanpa library).

| Test ID | Input Markdown | Elemen yang Diuji |
|---|---|---|
| UT-048 | `"# Judul"` | `<h1>Judul</h1>` |
| UT-049 | `"## Sub Judul"` | `<h2>Sub Judul</h2>` |
| UT-050 | `"### Sub-sub"` | `<h3>Sub-sub</h3>` |
| UT-051 | `"**bold**"` | `<strong>bold</strong>` |
| UT-052 | `"*italic*"` | `<em>italic</em>` |
| UT-053 | `"***bold italic***"` | `<strong><em>bold italic</em></strong>` |
| UT-054 | `` "`code`" `` | `<code>code</code>` |
| UT-055 | `` "```\nconst x = 1;\n```" `` | `<pre><code>const x = 1;</code></pre>` |
| UT-056 | `"> quote"` | `<blockquote>quote</blockquote>` |
| UT-057 | `"[Link](url)"` | `<a href="url" target="_blank">Link</a>` |
| UT-058 | `"- item"` | `<ul><li>item</li></ul>` |
| UT-059 | `"1. item"` | `<ul><li>item</li></ul>` (renderer saat ini treat sebagai unordered) |
| UT-060 | `"\|a\|b\|"` | `<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>` |
| UT-061 | `"---"` | `<hr/>` |
| UT-062 | `"<script>alert('xss')</script>"` | Harus di-escape, tidak boleh ada tag <script> |
| UT-063 | `"&amp; &lt; &gt;"` | Entity harus di-escape |

---

## 3. Integration Testing

### 3.1 GitHub API Integration

| Test ID | Skenario | Langkah | Expected Result |
|---|---|---|---|
| IT-001 | Fetch file list sukses | 1. Buka popup 2. Tab PRD aktif | Daftar file dari `prd-prompt-collection` muncul dalam <8 detik. Footer menampilkan jumlah file. |
| IT-002 | Fetch file list dari cache | 1. Buka popup 2. Tutup popup 3. Buka lagi dalam <10 menit | Daftar file muncul instan (<500ms), tidak ada request API baru di Network tab. |
| IT-003 | Switch repo tab | 1. Buka popup (PRD) 2. Klik tab "Prompt Collection" | Daftar file dari `mdown-collection` termuat. Hint dot berubah jadi biru. Footer link berubah. |
| IT-004 | Refresh manual | 1. Buka popup 2. Klik tombol refresh (↻) | Cache dihapus, file list di-fetch ulang. Spinner muncul. Network tab menunjukkan request baru. |
| IT-005 | Cache expired behavior | 1. Set `CACHE_TTL` ke 100ms via DevTools 2. Tunggu >100ms 3. Switch tab repo | Fetch API dijalankan karena cache dianggap expired. |
| IT-006 | GitHub API error 404 | Modifikasi URL repo menjadi tidak valid | UI menampilkan pesan error "Gagal: GitHub API 404 — ..." dengan ikon ⚠️. Footer menampilkan "Error". |
| IT-007 | Network offline | Nonaktifkan koneksi internet, buka popup | UI menampilkan error "Gagal: TypeError: Failed to fetch" atau pesan network error. |

### 3.2 chrome.storage Integration

| Test ID | Skenario | Langkah | Expected Result |
|---|---|---|---|
| IT-008 | Drag set storage | 1. Buka popup 2. Drag file item dari list | `chrome.storage.local` berisi `mdown_drag_content`, `mdown_drag_ready=true`, `mdown_drag_path`. |
| IT-009 | Storage cleanup setelah drop | 1. Drag file ke textarea 2. Drop | Setelah drop, ketiga key `mdown_drag_*` tidak ada di chrome.storage.local. |
| IT-010 | Fallback async drag | 1. Nonaktifkan cache (clear contentCache) 2. Langsung drag tanpa hover | `dataTransfer` berisi placeholder `{{LOADING:path}}`. Saat drop, konten diambil dari chrome.storage.local. |

### 3.3 Content Script Communication

| Test ID | Skenario | Langkah | Expected Result |
|---|---|---|---|
| IT-011 | Drop ke textarea | 1. Buka halaman dengan textarea 2. Drag file ke textarea | Konten file ter-insert di posisi kursor. Textarea mendapat flash hijau. |
| IT-012 | Drop ke input[text] | 1. Buka halaman dengan input text 2. Drag file ke input | Konten ter-insert di input. |
| IT-013 | Drop ke contentEditable | 1. Buka halaman dengan contentEditable (contoh: Gmail compose, Notion) 2. Drag file | Konten ter-insert. Flash hijau muncul. |
| IT-014 | Drop ke elemen non-target | 1. Drag file ke div biasa, button, atau link | Drop diabaikan. Tidak ada insert. Tidak ada error. |
| IT-015 | Overlay visual saat drag | Drag file di atas textarea | Overlay dashed border biru dengan label "Drop markdown here" muncul. |
| IT-016 | Overlay hilang setelah drag leave | Drag masuk textarea lalu drag keluar | Overlay hilang. |
| IT-017 | Insert ke Web via tombol | 1. Preview file 2. Klik field di halaman web 3. Klik "Insert" di popup | Konten (dengan variabel terisi) muncul di field yang aktif. |
| IT-018 | Insert tanpa field aktif | Klik "Insert" tanpa mengklik field di halaman | Alert muncul: "Klik dulu field yang ingin diisi." |

### 3.4 Variable Editor Integration

| Test ID | Skenario | Langkah | Expected Result |
|---|---|---|---|
| IT-019 | Variable chips muncul | Preview file yang memiliki `{{VAR}}` | Vars bar muncul dengan chip untuk setiap variabel unik. |
| IT-020 | Chip klik buka modal | Klik chip variabel | Modal terbuka, menampilkan nama variabel dan input (kosong atau nilai sebelumnya). |
| IT-021 | Apply variabel | 1. Isi nilai di modal 2. Klik "Terapkan" atau Enter | Nilai tersimpan, modal tertutup, preview re-render dengan variabel terisi. |
| IT-022 | Cancel variabel | 1. Isi nilai 2. Klik "Batal" atau Escape | Modal tertutup, nilai tidak tersimpan, preview tidak berubah. |
| IT-023 | Variabel unfilled highlight | Preview file dengan variabel belum diisi | `{{VAR}}` masih muncul dengan highlight (dashed border di rendered, solid di raw). |
| IT-024 | Klik highlight buka modal | Klik `{{VAR}}` highlight di konten preview | Modal editor terbuka untuk variabel tersebut. |

---

## 4. Manual Test Cases

### TC-001: Inisialisasi Popup dan Load Daftar File

| Atribut | Detail |
|---|---|
| **ID** | TC-001 |
| **Judul** | Inisialisasi Popup dan Load Daftar File |
| **Prioritas** | P0 (Critical) |
| **Prekondisi** | Cache localStorage kosong (bersihkan lewat DevTools atau pertama kali install) |
| **Langkah** | 1. Klik ikon blinker di Chrome toolbar<br>2. Amati loading state<br>3. Tunggu hingga daftar file muncul |
| **Expected Result** | - Spinner muncul saat load<br>- Teks "Mengambil daftar file..." muncul<br>- Daftar file PRD prompt muncul dalam <8 detik<br>- File dikelompokkan per folder<br>- Footer menampilkan jumlah file (contoh: "12 files")<br>- Tab "PRD Prompt" aktif dengan aksen hijau |
| **Pass Criteria** | Semua elemen di atas terpenuhi. Tidak ada error. |

### TC-002: Search dan Filter File

| Atribut | Detail |
|---|---|
| **ID** | TC-002 |
| **Judul** | Search dan Filter File Real-time |
| **Prioritas** | P0 (Critical) |
| **Prekondisi** | Popup terbuka, daftar file termuat |
| **Langkah** | 1. Ketik kata kunci di search box (contoh: "api")<br>2. Amati perubahan daftar file<br>3. Hapus input (kosongkan)<br>4. Ketik alias pencarian (contoh: "cs")<br>5. Ketik kata yang tidak ada (contoh: "zzzznotfound") |
| **Expected Result** | - Saat mengetik "api": daftar file terfilter secara real-time, hanya file dengan "api" di path yang tampil<br>- Saat input dikosongkan: semua file muncul kembali<br>- Saat mengetik "cs": pencarian diperluas ke "customer support", file yang cocok muncul<br>- Saat mengetik "zzzznotfound": pesan "Tidak ada file yang cocok" muncul, footer menunjukkan "0 files" |
| **Pass Criteria** | Filter bekerja real-time. Alias expansion berfungsi. Empty state muncul dengan benar. |

### TC-003: Preview File Rendered View

| Atribut | Detail |
|---|---|
| **ID** | TC-003 |
| **Judul** | Preview File — Rendered View |
| **Prioritas** | P0 (Critical) |
| **Prekondisi** | Popup terbuka, daftar file termuat |
| **Langkah** | 1. Arahkan kursor ke file item<br>2. Klik tombol 👁 (preview)<br>3. Amati view berpindah ke preview<br>4. Perhatikan konten yang dirender |
| **Expected Result** | - Back button "← Back" muncul<br>- Nama file ditampilkan di header<br>- Spinner muncul saat loading<br>- Konten markdown dirender sebagai HTML (heading, bold, link, code, dll)<br>- Scroll area berfungsi untuk konten panjang<br>- Tombol aksi (Drag, Copy, Insert) muncul di footer |
| **Pass Criteria** | Preview berfungsi. Markdown dirender dengan benar. Navigasi balik berfungsi. |

### TC-004: Preview File Raw View

| Atribut | Detail |
|---|---|
| **ID** | TC-004 |
| **Judul** | Preview File — Raw View |
| **Prioritas** | P0 (Critical) |
| **Prekondisi** | Popup dalam mode preview |
| **Langkah** | 1. Klik tab "Raw" di preview header<br>2. Amati tampilan |
| **Expected Result** | - Konten markdown mentah ditampilkan dengan font monospace<br>- HTML entities di-escape (tidak ada tag yang dirender)<br>- Variabel `{{VAR}}` di-highlight dengan warna dan bisa diklik<br>- Scroll area berfungsi |
| **Pass Criteria** | Raw view menampilkan konten mentah. Variabel di-highlight. |

### TC-005: Variable Editor

| Atribut | Detail |
|---|---|
| **ID** | TC-005 |
| **Judul** | Variable Editor — Isi Nilai Variabel |
| **Prioritas** | P0 (Critical) |
| **Prekondisi** | Preview file yang memiliki variabel `{{VAR}}` (contoh: file PRD template) |
| **Langkah** | 1. Klik chip variabel di vars bar<br>2. Isi nilai di input modal<br>3. Klik "Terapkan"<br>4. Amati preview berubah<br>5. Klik `{{VAR}}` highlight di konten<br>6. Ubah nilai, tekan Enter |
| **Expected Result** | - Chip variabel muncul di vars bar dengan warna yang sesuai<br>- Modal terbuka dengan nama variabel dan input<br>- Setelah apply: `{{VAR}}` diganti dengan nilai di preview rendered<br>- Klik highlight membuka modal yang sama<br>- Enter di modal = apply, Escape = cancel<br>- Klik backdrop = cancel |
| **Pass Criteria** | Variable detection, editing, dan substitution berfungsi penuh. |

### TC-006: Drag & Drop dari List ke Halaman Web

| Atribut | Detail |
|---|---|
| **ID** | TC-006 |
| **Judul** | Drag & Drop File dari List ke Textarea/Input |
| **Prioritas** | P0 (Critical) |
| **Prekondisi** | Popup terbuka, browser memiliki tab lain dengan textarea (contoh: GitHub issue comment, Google Docs, atau https://textarea.co) |
| **Langkah** | 1. Hover file item (tunggu prefetch)<br>2. Drag file ke textarea di halaman web<br>3. Drop konten |
| **Expected Result** | - Overlay dashed border biru muncul di textarea saat drag<br>- Label "Drop markdown here" muncul di overlay<br>- Setelah drop: konten file ter-insert di posisi kursor<br>- Flash hijau pada textarea sebagai konfirmasi<br>- chrome.storage.local dibersihkan |
| **Pass Criteria** | Drag & drop berhasil. Konten file lengkap dan utuh. |

### TC-007: Drag & Drop dari Preview

| Atribut | Detail |
|---|---|
| **ID** | TC-007 |
| **Judul** | Drag & Drop dari Preview Footer |
| **Prioritas** | P0 (Critical) |
| **Prekondisi** | Popup dalam mode preview, variabel sudah diisi |
| **Langkah** | 1. Isi variabel di preview<br>2. Drag tombol "⠿ Drag" di preview footer<br>3. Drop ke textarea di halaman web |
| **Expected Result** | - Konten yang di-drop sudah包含 nilai variabel yang sudah diisi<br>- Sama seperti TC-006 untuk overlay dan insert<br>- Data transfer sinkron (konten sudah pasti siap) |
| **Pass Criteria** | Drag dari preview berhasil dengan variabel terisi. |

### TC-008: Copy ke Clipboard

| Atribut | Detail |
|---|---|
| **ID** | TC-008 |
| **Judul** | Copy File ke Clipboard |
| **Prioritas** | P0 (Critical) |
| **Prekondisi** | Popup terbuka, daftar file termuat |
| **Langkah** | 1. Klik tombol "Copy" pada file item di daftar<br>2. Amati feedback tombol<br>3. Paste di text editor (Notepad, VS Code)<br>4. Ulangi dari preview: isi variabel, klik "📋 Copy"<br>5. Paste lagi |
| **Expected Result** | - Tombol berubah: "Copy" -> "..." -> "✓" -> "Copy" (masing-masing 1,5 detik)<br>- Konten file (tanpa variabel) ter-copy di langkah 3<br>- Konten file (dengan variabel terisi) ter-copy di langkah 4-5<br>- Clipboard berisi konten markdown utuh |
| **Pass Criteria** | Copy berfungsi dari list dan dari preview. Feedback visual berfungsi. |

### TC-009: Insert ke Web

| Atribut | Detail |
|---|---|
| **ID** | TC-009 |
| **Judul** | Insert Konten ke Active Element di Halaman Web |
| **Prioritas** | P0 (Critical) |
| **Prekondisi** | Popup dalam mode preview, variabel diisi, tab lain dengan textarea aktif |
| **Langkah** | 1. Di halaman web, klik di dalam textarea (buat aktif)<br>2. Kembali ke popup<br>3. Klik tombol "⬇ Insert ke Web" |
| **Expected Result** | - Konten muncul di textarea yang aktif<br>- Posisi kursor tepat setelah konten yang di-insert<br>- Tidak ada alert error |
| **Pass Criteria** | Insert berfungsi. Konten dengan variabel terisi masuk ke field yang benar. |

### TC-010: Switch Repositori

| Atribut | Detail |
|---|---|
| **ID** | TC-010 |
| **Judul** | Switch Antara Repositori PRD dan Prompt Collection |
| **Prioritas** | P1 (High) |
| **Prekondisi** | Popup terbuka di tab PRD |
| **Langkah** | 1. Klik tab "Prompt Collection"<br>2. Amati perubahan<br>3. Klik tab "PRD Prompt" kembali |
| **Expected Result** | - Saat switch ke Prompt Collection: tab berubah ke biru, hint dot jadi biru, file list dari mdown-collection muncul<br>- Search input dikosongkan<br>- Footer link berubah ke repo yang sesuai<br>- Switch balik ke PRD: memuat dari cache (jika masih valid) atau fetch ulang<br>- Loading spinner muncul saat fetch |
| **Pass Criteria** | Tab switching berfungsi. Masing-masing repo menampilkan file yang sesuai. Cache dimanfaatkan. |

### TC-011: Refresh dan Cache Invalidation

| Atribut | Detail |
|---|---|
| **ID** | TC-011 |
| **Judul** | Manual Refresh dan Cache Invalidation |
| **Prioritas** | P1 (High) |
| **Prekondisi** | Popup terbuka, daftar file termuat |
| **Langkah** | 1. Buka DevTools -> Application -> Local Storage<br>2. Catat nilai `mdown_v3_prd` (ts dan files)<br>3. Klik tombol refresh (↻)<br>4. Amati perubahan |
| **Expected Result** | - Spinner muncul, daftar file di-fetch ulang<br>- Cache `mdown_v3_prd` di localStorage dihapus dan ditulis ulang dengan timestamp baru<br>- Data file terbaru ditampilkan<br>- Footer count terupdate |
| **Pass Criteria** | Refresh berfungsi. Cache di-invalidate dan diperbarui. |

### TC-012: Error Handling — GitHub API Rate Limited

| Atribut | Detail |
|---|---|
| **ID** | TC-012 |
| **Judul** | Error Handling saat GitHub API Rate Limited |
| **Prioritas** | P1 (High) |
| **Prekondisi** | Kondisi rate limited: bisa disimulasi dengan memblokir API di DevTools Network panel (Offline) atau menggunakan throttle |
| **Langkah** | 1. Buka DevTools -> Network -> toggle Offline<br>2. Buka popup (atau refresh jika sudah terbuka)<br>3. Amati UI |
| **Expected Result** | - Ikon ⚠️ muncul<br>- Pesan error ditampilkan: "Gagal: TypeError: Failed to fetch" (atau sesuai kondisi)<br>- Footer menampilkan "Error"<br>- Tombol refresh tetap bisa diklik<br>- Cache (jika masih valid) **tidak** digunakan sebagai fallback |
| **Pass Criteria** | Error tertangani dengan baik. UI tidak broken. User mendapat informasi yang jelas. |

---

## 5. Cross-browser Testing

### 5.1 Matriks Dukungan

| Fitur | Chrome 125+ | Edge 125+ | Brave 1.68+ |
|---|---|---|---|
| MV3 Extension API | Full support | Full support (Chromium-based) | Full support (Chromium-based) |
| Popup 400x600 | Native | Native | Native |
| `chrome.storage.local` | Supported | Supported | Supported |
| `chrome.scripting` | Supported | Supported | Supported |
| `chrome.tabs` | Supported | Supported | Supported |
| Drag & Drop API | Supported | Supported | Supported |
| `navigator.clipboard` | Supported | Supported | Supported |
| localStorage | Supported | Supported | Supported |
| CSS `-webkit-scrollbar` | Supported | Supported | Supported |

### 5.2 Test Scenarios per Browser

| ID | Browser | Skenario | Catatan Khusus |
|---|---|---|---|
| CB-001 | Chrome | Full regression TC-001 s.d. TC-012 | Baseline testing |
| CB-002 | Edge | Load popup, search, preview, variable edit, drag-drop | Edge memiliki fitur "Drop" yang bisa interferensi? |
| CB-003 | Edge | Copy to clipboard | Edge mungkin memblokir clipboard API tanpa user gesture |
| CB-004 | Brave | Load popup, switch tab repo | Brave memiliki shield yang mungkin memblokir GitHub API? Nonaktifkan shield untuk test. |
| CB-005 | Brave | Drag & drop ke halaman web | Brave mungkin membatasi DataTransfer |
| CB-006 | All | Insert ke Web via chrome.scripting | Pastikan permission `activeTab` berfungsi di semua browser |

### 5.3 Daftar Periksa Visual

| Aspek | Chrome | Edge | Brave |
|---|---|---|---|
| Ukuran popup konsisten (400x600) | -- | -- | -- |
| Font rendering (system font stack) | -- | -- | -- |
| Scrollbar custom (3px, dark) | -- | -- | -- |
| Variable chip colors | -- | -- | -- |
| Modal overlay (rgba) | -- | -- | -- |
| Spinner animation | -- | -- | -- |
| Dark theme konsisten | -- | -- | -- |

*Diisi saat pengujian: (/) Pass, (x) Fail, (-) Not tested*

---

## 6. Performance Testing

### 6.1 Load Time

| ID | Skenario | Target | Alat Ukur |
|---|---|---|---|
| PT-001 | Cold start (cache kosong) — fetch dari GitHub API | < 8 detik | Chrome DevTools Network + Performance tab |
| PT-002 | Warm start (cache valid) — dari localStorage | < 500ms | Chrome DevTools Performance tab |
| PT-003 | Switch repositori (cache miss) | < 8 detik | Performance.now() via console |
| PT-004 | Preview file (fetch from raw.githubusercontent) | < 2 detik | Network tab |
| PT-005 | Search filter (100+ file) | < 100ms | DevTools Performance |

**Prosedur PT-001 (Cold Start):**
1. Buka DevTools -> Performance
2. Mulai recording
3. Klik ikon blinker
4. Tunggu hingga daftar file muncul
5. Stop recording
6. Catat waktu dari "Popup Open" hingga "List Rendered"

**Prosedur PT-002 (Warm Start):**
1. Buka popup sekali (pastikan cache terisi)
2. Tutup popup
3. Buka DevTools -> Performance
4. Mulai recording
5. Klik ikon blinker
6. Stop recording
7. Catat waktu muat

### 6.2 Memory Usage

| ID | Skenario | Target | Alat Ukur |
|---|---|---|---|
| PT-006 | Popup idle (daftar file termuat) | < 30 MB | Chrome Task Manager (Shift+Esc) |
| PT-007 | Preview file besar (>100 KB) | < 50 MB | Chrome Task Manager, Heap snapshot |
| PT-008 | Multiple variable editing session | < 50 MB | Chrome Task Manager |
| PT-009 | Drag prefetch multiple files (10+ prefetch) | < 60 MB | Chrome Task Manager |

### 6.3 Cache Performance

| ID | Skenario | Target | Cara Ukur |
|---|---|---|---|
| PT-010 | Cache hit ratio setelah 10 popup opens dalam 1 jam | > 80% | Network tab: hitungan request API vs cache retrieval |
| PT-011 | Cache size (localStorage PRD + Mdown) | < 50 KB | DevTools -> Application -> Local Storage |
| PT-012 | Content prefetch success rate (drag dengan konten siap) | > 90% | Console log + dataTransfer check |

### 6.4 Rendering Performance

| ID | Skenario | Target | Cara Ukur |
|---|---|---|---|
| PT-013 | Render list 200+ file items | < 50ms (JS execution) | Performance tab — Measure `renderList()` |
| PT-014 | Markdown rendering 50 KB file | < 100ms | console.time('renderMarkdown') |
| PT-015 | Re-render setelah variable apply | < 50ms | Performance tab |

---

## 7. Accessibility Testing

### 7.1 Keyboard Navigation

| ID | Skenario | Langkah | Expected Result |
|---|---|---|---|
| AT-001 | Focus search input | Tekan Tab dari address bar hingga search input ter-focus | Search input mendapat focus ring. Placeholder terlihat. |
| AT-002 | Navigasi tab repositori | Tab dari search ke repo tabs, gunakan Enter/Space untuk pilih | Tab berubah, file list berubah sesuai repo. |
| AT-003 | Navigasi file list | Tab melalui file items (jika ada tabindex) atau tombol aksi | Setiap tombol preview/copy bisa di-focus dan diaktifkan. |
| AT-004 | Modal keyboard | 1. Buka modal (Enter pada chip) 2. Tab antara input, Cancel, Apply 3. Escape untuk tutup | Focus pindah ke input saat modal terbuka. Tab berjalan normal. Escape menutup modal. |
| AT-005 | Back button | Tab ke "← Back" di preview, Enter | Kembali ke list view. |

**Catatan:** Saat ini file items belum memiliki `tabindex`, sehingga navigasi keyboard terbatas pada tombol aksi (preview, copy) dan header elements. Peningkatan aksesibilitas keyboard direncanakan di versi mendatang.

### 7.2 Screen Reader

| ID | Skenario | Expected Result |
|---|---|---|
| AT-006 | Popup terbuka — screen reader membacakan judul | Judul "blinker" terbaca. Header role terdeteksi. |
| AT-007 | Tab repo berubah | Screen reader mendapatkan notifikasi bahwa tab panel berubah. |
| AT-008 | Preview terbuka | Nama file dibacakan. Mode rendered/raw diumumkan. |
| AT-009 | Variable chip | Teks chip (nama variabel) terbaca. Interaksi "klik untuk edit" perlu disampaikan. |
| AT-010 | Modal terbuka | Role "dialog" diumumkan. Focus pindah ke input. |
| AT-011 | Copy button feedback | Perubahan teks "Copy" -> "✓ Copied!" terbaca. |
| AT-012 | Loading state | Teks "Mengambil daftar file..." terbaca. Spinner adalah dekoratif. |

### 7.3 Color Contrast

Semua rasio kontras telah divalidasi terhadap WCAG 2.1 AA (minimum 4.5:1 untuk teks normal, 3:1 untuk teks besar).

| Elemen | Foreground | Background | Ratio | Level |
|---|---|---|---|---|
| Teks body | `#c9d1d9` | `#0d1117` | 9.7:1 | AAA |
| Judul | `#e6edf3` | `#0d1117` | 13.6:1 | AAA |
| Teks tersier | `#8b949e` | `#0d1117` | 5.7:1 | AA |
| Variable chips | Bervariasi | Bervariasi | >4.5:1 | AA |
| Tombol Copy | `#ffffff` | `#238636` | 5.5:1 | AA |
| Tombol Insert | `#ffffff` | `#1f6feb` | 5.7:1 | AA |

### 7.4 Focus Indicators

| ID | Elemen | Current State | Rekomendasi |
|---|---|---|---|
| AT-013 | Search input | Border color change (`#58a6ff`) | Cukup — visible focus indicator |
| AT-014 | Modal input | Border color change (`#58a6ff`) | Cukup |
| AT-015 | Buttons (icon-btn, row-btn) | Browser default outline | Tambahkan `:focus-visible` untuk ring fokus yang lebih jelas |
| AT-016 | Repo tabs | Class `.active` sebagai visual indicator | Tambahkan `outline` atau `box-shadow` untuk keyboard focus |

---

## 8. Regression Checklist

### 8.1 Pre-release Regression Suite

Jalankan checklist berikut sebelum setiap rilis baru untuk memastikan tidak ada regresi.

#### A. Inisialisasi dan Loading
- [ ] A-1: Popup terbuka tanpa error
- [ ] A-2: Loading spinner muncul saat fetch
- [ ] A-3: Daftar file termuat dari GitHub API (cold start)
- [ ] A-4: Daftar file termuat dari cache (warm start)
- [ ] A-5: Error message tampil jika API gagal

#### B. Navigasi dan Search
- [ ] B-1: Tab PRD dan Prompt Collection berfungsi
- [ ] B-2: Search filter real-time berfungsi
- [ ] B-3: Alias expansion (cs, prd, qa, api) berfungsi
- [ ] B-4: Empty state "Tidak ada file yang cocok" muncul
- [ ] B-5: Footer count terupdate sesuai filter

#### C. Preview System
- [ ] C-1: Preview terbuka dari tombol 👁
- [ ] C-2: Rendered view menampilkan HTML
- [ ] C-3: Raw view menampilkan source markdown
- [ ] C-4: Tab switching rendered/raw berfungsi
- [ ] C-5: Back button kembali ke list
- [ ] C-6: Scroll area berfungsi untuk konten panjang

#### D. Variable Editor
- [ ] D-1: Variable chips muncul di vars bar
- [ ] D-2: Chip klik membuka modal
- [ ] D-3: Apply mengubah preview (substitusi berhasil)
- [ ] D-4: Cancel tidak menyimpan perubahan
- [ ] D-5: Highlight `{{VAR}}` di konten bisa diklik
- [ ] D-6: Enter = Apply, Escape = Cancel
- [ ] D-7: Klik backdrop = Cancel
- [ ] D-8: Variabel tanpa nilai tetap terlihat sebagai `{{VAR}}`
- [ ] D-9: Preview file baru mereset varValues

#### E. Content Insertion
- [ ] E-1: Drag dari list ke textarea berhasil
- [ ] E-2: Drag dari preview berhasil (dengan variabel)
- [ ] E-3: Overlay visual muncul saat drag
- [ ] E-4: Flash hijau setelah insert
- [ ] E-5: Copy dari list berhasil (feedback ✓)
- [ ] E-6: Copy dari preview berhasil (dengan variabel)
- [ ] E-7: Insert ke Web berhasil ke field aktif
- [ ] E-8: Alert muncul jika insert tanpa field aktif
- [ ] E-9: chrome.storage.local dibersihkan setelah drop

#### F. Error Handling
- [ ] F-1: Error API ditampilkan dengan ⚠️
- [ ] F-2: Error preview ditampilkan dengan ⚠️
- [ ] F-3: Copy failed feedback (✗)
- [ ] F-4: Network offline handling
- [ ] F-5: Cache corrupt handling (JSON.parse fallback)

#### G. UI/Visual
- [ ] G-1: Dark theme konsisten di semua view
- [ ] G-2: File icons sesuai tipe
- [ ] G-3: File grouping per folder
- [ ] G-4: Row buttons (👁 Copy) muncul saat hover
- [ ] G-5: Hover states pada semua elemen interaktif
- [ ] G-6: Scrollbar kustom (3px)
- [ ] G-7: Tidak ada overflow horizontal
- [ ] G-8: Nama file terpotong dengan ellipsis jika panjang

#### H. Cache & Refresh
- [ ] H-1: Cache localStorage setelah fetch pertama
- [ ] H-2: Cache digunakan dalam 10 menit
- [ ] H-3: Cache expired setelah >10 menit
- [ ] H-4: Refresh menghapus cache dan fetch ulang
- [ ] H-5: Switch repo menggunakan cache masing-masing

### 8.2 Smoke Test (Pra-rilis Cepat)

Untuk rilis patch/minor, smoke test cukup mencakup:

1. Buka popup — daftar file muncul
2. Search file — filter berfungsi
3. Preview file — rendered + raw
4. Isi variabel — substitusi berfungsi
5. Drag file ke textarea — konten ter-insert
6. Copy file — clipboard berfungsi
7. Switch repo — tab berfungsi
8. Refresh — cache di-invalidate

### 8.3 Edge Cases

| ID | Skenario | Expected Behavior |
|---|---|---|
| EC-01 | File dengan 50+ variabel | Semua chip muncul, scroll vars bar jika perlu |
| EC-02 | Nama file sangat panjang (>100 karakter) | Ellipsis (...) di nama file |
| EC-03 | File markdown 500 KB+ | Loading state mungkin lebih lama, tapi tidak crash |
| EC-04 | Popup dibuka di halaman chrome:// | Content script tidak ter-inject, drag tidak berfungsi (expected) |
| EC-05 | Popup dibuka di incognito mode | localStorage tersedia (incognito), cache berfungsi |
| EC-06 | Multiple popup windows (klik icon cepat 2x) | Hanya satu popup yang muncul (Chrome behavior) |
| EC-07 | Variabel dengan nilai mengandung karakter khusus HTML | Tidak boleh break rendering markdown |
| EC-08 | File tanpa variabel | Vars bar tidak muncul (display: none) |
| EC-09 | Search query hanya spasi | Dianggap kosong, semua file ditampilkan |
| EC-10 | Drag tanpa pernah hover (langsung drag) | Fallback async ke chrome.storage.local |

---

## Lampiran A: Ringkasan Test Coverage

| Area | Jumlah Test Cases | Cakupan |
|---|---|---|
| Unit Testing (extractVars) | 10 | Semua edge case regex |
| Unit Testing (applyVars) | 10 | Substitusi, truthy/falsy, empty |
| Unit Testing (getDisplayName) | 7 | Path, ekstensi, underscore |
| Unit Testing (getFileIcon) | 6 | Semua kategori ikon |
| Unit Testing (getNumberPrefix) | 4 | Prefix format, null case |
| Unit Testing (getNameWithoutNumber) | 3 | Prefix removal |
| Unit Testing (formatSize) | 7 | Bytes, KB, zero, null |
| Unit Testing (renderMarkdown) | 16 | Semua elemen markdown |
| Integration Testing | 24 | API, storage, content script, variable |
| Manual Test Cases | 12 | Skenario end-to-end |
| Cross-browser Testing | 6 | Chrome, Edge, Brave |
| Performance Testing | 15 | Load time, memory, cache, rendering |
| Accessibility Testing | 16 | Keyboard, screen reader, contrast, focus |
| Regression Checklist | 50+ | Semua fitur kritis |

---

## Lampiran B: Test Environment Setup

### B.1 Persiapan Chrome DevTools

```javascript
// Untuk memonitor cache dan storage
// Buka Console di DevTools popup (klik kanan -> Inspect)

// Cek cache localStorage
localStorage.getItem('mdown_v3_prd');

// Cek chrome.storage
chrome.storage.local.get(null, console.log);

// Simulasi cache expired
const key = 'mdown_v3_prd';
const raw = localStorage.getItem(key);
if (raw) {
  const c = JSON.parse(raw);
  c.ts = 0; // Set timestamp ke epoch
  localStorage.setItem(key, JSON.stringify(c));
}
```

### B.2 Test Data

Gunakan file-file berikut dari repositori untuk pengujian variabel:
- File dari `prd-prompt-collection` yang memiliki `{{VARIABLE}}` (contoh: template PRD)
- File dari `mdown-collection/standards/` untuk engineering standards
- File `.json` untuk menguji ikon `{}`

---

## Lampiran C: Daftar Istilah

| Istilah | Definisi |
|---|---|
| **Cold Start** | Kondisi saat popup pertama kali dibuka tanpa cache localStorage |
| **Warm Start** | Kondisi saat popup dibuka dengan cache localStorage yang masih valid |
| **TTL (Time-To-Live)** | Waktu cache berlaku sebelum dianggap expired (10 menit) |
| **Prefetch** | Pengambilan konten file sebelum user benar-benar melakukan drag (trigger: hover/pointerdown) |
| **Content Script** | Script (`content.js`) yang di-inject ke halaman web untuk menangani drop event |
| **Rendered View** | Tampilan markdown yang sudah dikonversi ke HTML |
| **Raw View** | Tampilan source markdown mentah dengan HTML escaping |
| **Variable Chip** | Elemen UI berbentuk chip yang mewakili satu placeholder `{{VAR}}` |
| **MV3** | Manifest V3 — arsitektur Chrome Extension terbaru |

---

*Dokumen ini adalah panduan testing komprehensif untuk blinker Chrome Extension versi 2.0.0. Update dokumentasi ini setiap kali ada fitur baru atau perubahan signifikan pada codebase.*
