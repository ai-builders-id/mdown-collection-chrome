# Privacy Policy / Kebijakan Privasi

**Effective Date / Tanggal Berlaku:** 24 June 2026  
**Extension / Ekstensi:** blinker  
**Version / Versi:** 2.0.0  
**Repository:** [github.com/ai-builders-id/mdown-collection](https://github.com/ai-builders-id/mdown-collection)

---

## Bahasa Indonesia

### 1. Pendahuluan

blinker ("kami", "ekstensi", atau "aplikasi") berkomitmen untuk melindungi privasi Anda. Dokumen ini menjelaskan bagaimana blinker menangani data ketika Anda menggunakan ekstensi Chrome ini.

Dengan menggunakan blinker, Anda menyetujui praktik yang dijelaskan dalam Kebijakan Privasi ini.

### 2. Tidak Ada Pengumpulan Data Pribadi

blinker **TIDAK mengumpulkan, menyimpan, mengirimkan, atau membagikan data pribadi Anda** kepada siapa pun, termasuk kepada pengembang ekstensi.

Secara spesifik:

- **Tidak ada analitik** — Ekstensi ini tidak mengandung kode pelacakan, analitik pihak ketiga, atau beacon.
- **Tidak ada akun** — Anda tidak perlu mendaftar atau masuk untuk menggunakan ekstensi ini.
- **Tidak ada data pengguna yang dikirim ke server kami** — Kami tidak mengoperasikan server backend. Semua komunikasi data terjadi langsung antara ekstensi Anda dan layanan publik GitHub.
- **Tidak ada log aktivitas** — Kami tidak mencatat riwayat penggunaan, file yang Anda buka, atau tindakan yang Anda lakukan.

### 3. Penyimpanan Lokal (Cache)

blinker menggunakan **penyimpanan lokal peramban** untuk meningkatkan kinerja:

| Mekanisme | Tujuan | Durasi |
|-----------|--------|--------|
| **localStorage** | Menyimpan daftar file dari GitHub agar tidak perlu di-fetch ulang setiap kali popup dibuka. | 10 menit (TTL). Data otomatis kedaluwarsa dan dapat dihapus kapan saja melalui tombol Refresh atau dengan membersihkan cache peramban. |
| **chrome.storage.local** | Mentransfer konten file dari popup ke halaman web saat Anda melakukan drag-and-drop. | Data ditulis saat drag dimulai dan **dihapus segera** setelah konten berhasil ditempel di halaman web. |

Semua data yang disimpan bersifat **lokal pada perangkat Anda** dan tidak pernah dikirim ke server eksternal (selain dari proses fetch dari GitHub yang dijelaskan di bagian 5).

### 4. Transfer Data Lokal (chrome.storage)

Fitur drag-and-drop dan "Insert ke Web" menggunakan **chrome.storage.local** untuk mentransfer konten file dari popup ekstensi ke halaman web yang aktif.

- Mekanisme ini sepenuhnya **lokal pada perangkat Anda**.
- Data ditransfer di dalam proses peramban yang sama, tidak melalui jaringan.
- Data akan **dihapus** dari chrome.storage.local segera setelah konten berhasil ditempel.

### 5. Layanan Pihak Ketiga: GitHub API

blinker mengambil file markdown dari repositori publik GitHub milik pengembang:

| Endpoint | Tujuan |
|----------|--------|
| `api.github.com/repos/ai-builders-id/*/git/trees/main?recursive=1` | Mengambil daftar file dari repositori publik |
| `raw.githubusercontent.com/ai-builders-id/*/main/` | Mengambil konten file markdown |

**Penting untuk diketahui:**

- Hanya **repositori publik** yang diakses. Ekstensi ini tidak memiliki akses ke repositori privat atau data pribadi GitHub Anda.
- Ekstensi ini **tidak mengautentikasi** sebagai pengguna GitHub mana pun. Semua permintaan bersifat anonim dan tunduk pada batas rate limit GitHub untuk pengguna anonim (saat ini ~60 permintaan per jam).
- GitHub memiliki Kebijakan Privasinya sendiri yang berlaku saat Anda mengakses layanan mereka. Silakan lihat [Kebijakan Privasi GitHub](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).
- Ekstensi ini tidak mengirimkan data identitas pribadi apa pun ke GitHub.

### 6. Justifikasi Izin (Permissions)

| Izin | Tujuan | Justifikasi |
|------|--------|-------------|
| `activeTab` | Mengakses tab aktif untuk menyisipkan konten dan menjalankan content script sementara. | Diperlukan agar tombol "Insert ke Web" dapat menulis konten ke field input di halaman web yang sedang aktif. Izin ini bersifat sementara dan hanya berlaku saat ekstensi digunakan. |
| `scripting` | Menjalankan kode di halaman web aktif untuk menyisipkan teks. | Diperlukan untuk menginjeksi fungsi yang menulis konten ke textarea/input/contenteditable di halaman web. |
| `storage` | Menggunakan chrome.storage.local untuk transfer konten drag-and-drop. | Diperlukan untuk mentransfer konten file dari popup ke content script yang berjalan di halaman web. |
| `https://api.github.com/*` | Mengambil daftar file dari repositori publik GitHub. | Diperlukan untuk menampilkan daftar file markdown yang tersedia. |
| `https://raw.githubusercontent.com/*` | Mengambil konten file markdown dari repositori publik GitHub. | Diperlukan untuk menampilkan pratinjau dan konten file. |
| `<all_urls>` | Content script berjalan di semua URL untuk mendukung fitur drag-and-drop. | Diperlukan agar Anda dapat menarik dan melepas konten ke halaman web mana pun. Content script hanya aktif menunggu event drop; tidak membaca atau mengubah konten halaman. |

### 7. Retensi Data dan Hak Pengguna

#### Data yang Disimpan

Satu-satunya data yang disimpan oleh blinker adalah cache daftar file di localStorage peramban Anda.

#### Hak Anda

Anda memiliki kendali penuh atas data ini:

- **Menghapus cache** — Klik tombol Refresh (↻) di popup untuk menghapus cache dan mengambil data terbaru dari GitHub.
- **Menghapus semua data ekstensi** — Buka `chrome://extensions` → blinker → "Details" → "Clear storage" atau hapus melalui "Site Settings" peramban Anda.
- **Mencabut izin** — Anda dapat menonaktifkan atau menghapus ekstensi kapan saja melalui `chrome://extensions`.

Karena kami tidak mengumpulkan data pribadi, tidak ada data yang perlu diminta untuk diakses, diperbaiki, atau dihapus dari server kami.

### 8. Kepatuhan COPPA (Children's Online Privacy Protection Act)

blinker **tidak mengumpulkan informasi pribadi apa pun dari pengguna mana pun**, termasuk anak-anak di bawah usia 13 tahun. Karena itu:

- Tidak ada persetujuan orang tua yang diperlukan.
- Tidak ada data anak yang dikumpulkan, digunakan, atau dibagikan.
- Ekstensi ini aman digunakan oleh semua usia karena tidak ada pengumpulan data pribadi sama sekali.

### 9. Perubahan Kebijakan Privasi

Kebijakan Privasi ini dapat diperbarui dari waktu ke waktu. Perubahan akan diumumkan melalui:
- Pembaruan pada file ini di repositori GitHub.
- Catatan rilis versi ekstensi.

Kami akan memberi tahu Anda tentang perubahan material dengan memperbarui tanggal "Efektif" di bagian atas dokumen ini.

### 10. Kontak

Jika Anda memiliki pertanyaan, kekhawatiran, atau permintaan terkait Kebijakan Privasi ini, silakan hubungi kami melalui:

- **GitHub Issues:** [github.com/ai-builders-id/mdown-collection/issues](https://github.com/ai-builders-id/mdown-collection/issues)
- **Repositori Ekstensi:** [github.com/ai-builders-id/mdown-collection-chrome](https://github.com/ai-builders-id/mdown-collection-chrome)

Kami akan merespons pertanyaan Anda dalam waktu 30 hari.

---

## English

### 1. Introduction

blinker ("we", "the extension", or "the application") is committed to protecting your privacy. This document explains how blinker handles data when you use this Chrome extension.

By using blinker, you agree to the practices described in this Privacy Policy.

### 2. No Personal Data Collection

blinker does **NOT collect, store, transmit, or share any personal data** with anyone, including the extension developers.

Specifically:

- **No analytics** — This extension contains no tracking code, third-party analytics, or beacons.
- **No accounts** — You do not need to register or log in to use this extension.
- **No user data is sent to our servers** — We do not operate any backend server. All data communication occurs directly between your extension and public GitHub services.
- **No activity logs** — We do not record usage history, files you open, or actions you take.

### 3. Local Storage (Cache)

blinker uses **browser local storage** for performance purposes:

| Mechanism | Purpose | Duration |
|-----------|---------|----------|
| **localStorage** | Caches the file list from GitHub so it does not need to be re-fetched every time the popup opens. | 10 minutes (TTL). Data automatically expires and can be cleared at any time via the Refresh button or by clearing browser cache. |
| **chrome.storage.local** | Transfers file content from the popup to a web page when you drag and drop. | Data is written when a drag starts and is **deleted immediately** after the content is successfully pasted on the web page. |

All stored data is **local to your device** and is never sent to external servers (aside from the GitHub fetch process described in Section 5).

### 4. Local Data Transfer (chrome.storage)

The drag-and-drop and "Insert to Web" features use **chrome.storage.local** to transfer file content from the extension popup to the active web page.

- This mechanism is entirely **local to your device**.
- Data is transferred within the same browser process, never over the network.
- Data is **deleted** from chrome.storage.local immediately after the content is successfully pasted.

### 5. Third-Party Services: GitHub API

blinker fetches markdown files from the developer's public GitHub repositories:

| Endpoint | Purpose |
|----------|---------|
| `api.github.com/repos/ai-builders-id/*/git/trees/main?recursive=1` | Fetches the file list from public repositories |
| `raw.githubusercontent.com/ai-builders-id/*/main/` | Fetches markdown file content |

**Important to note:**

- Only **public repositories** are accessed. This extension has no access to private repositories or your personal GitHub data.
- The extension does **not authenticate** as any GitHub user. All requests are anonymous and subject to GitHub's rate limits for unauthenticated users (currently ~60 requests per hour).
- GitHub has its own Privacy Policy that applies when you access their services. Please see [GitHub's Privacy Policy](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).
- The extension does not send any personally identifiable information to GitHub.

### 6. Permission Justification

| Permission | Purpose | Justification |
|------------|---------|---------------|
| `activeTab` | Access the active tab to insert content and run temporary content scripts. | Required for the "Insert to Web" button to write content into input fields on the active web page. This permission is temporary and only valid while the extension is in use. |
| `scripting` | Execute code in the active web page to insert text. | Required to inject a function that writes content into textarea/input/contenteditable elements on the web page. |
| `storage` | Uses chrome.storage.local for drag-and-drop content transfer. | Required to transfer file content from the popup to the content script running on the web page. |
| `https://api.github.com/*` | Fetches the file list from public GitHub repositories. | Required to display the list of available markdown files. |
| `https://raw.githubusercontent.com/*` | Fetches markdown file content from public GitHub repositories. | Required to display file previews and content. |
| `<all_urls>` | Content script runs on all URLs to support drag-and-drop functionality. | Required so you can drag and drop content into any web page. The content script only listens for drop events; it does not read or modify page content. |

### 7. Data Retention and User Rights

#### Stored Data

The only data stored by blinker is a cached file list in your browser's localStorage.

#### Your Rights

You have full control over this data:

- **Clear cache** — Click the Refresh button (↻) in the popup to clear the cache and fetch the latest data from GitHub.
- **Clear all extension data** — Go to `chrome://extensions` → blinker → "Details" → "Clear storage" or clear via your browser's "Site Settings".
- **Revoke permissions** — You may disable or remove the extension at any time via `chrome://extensions`.

Since we do not collect personal data, there is no data to request access to, correct, or delete from our servers.

### 8. COPPA Compliance (Children's Online Privacy Protection Act)

blinker **does not collect any personal information from any users**, including children under the age of 13. Therefore:

- No parental consent is required.
- No children's data is collected, used, or shared.
- This extension is safe for all ages as no personal data is collected whatsoever.

### 9. Changes to This Privacy Policy

This Privacy Policy may be updated from time to time. Changes will be communicated through:
- Updates to this file in the GitHub repository.
- Extension release notes.

We will notify you of material changes by updating the "Effective" date at the top of this document.

### 10. Contact

If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us through:

- **GitHub Issues:** [github.com/ai-builders-id/mdown-collection/issues](https://github.com/ai-builders-id/mdown-collection/issues)
- **Extension Repository:** [github.com/ai-builders-id/mdown-collection-chrome](https://github.com/ai-builders-id/mdown-collection-chrome)

We will respond to your inquiry within 30 days.

---

*Dokumen ini disusun dalam dua bahasa (Indonesia dan Inggris). Jika terdapat perbedaan interpretasi, versi Inggris yang berlaku.*  
*This document is prepared in two languages (Indonesian and English). In the event of any discrepancy, the English version shall prevail.*
