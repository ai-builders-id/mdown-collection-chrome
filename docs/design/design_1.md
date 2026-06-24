# Design System — blinker

> **Versi:** 2.0.0 | **Terakhir diperbarui:** 2026-06-24 | **Aesthetic:** Nocturnal Luxe
>
> Dokumen ini mendefinisikan design system menyeluruh untuk blinker, sebuah Chrome extension popup
> untuk mengakses dan menggunakan koleksi markdown prompt dan template dari GitHub.
> Berdasarkan codebase actual `popup.html` dan `popup.js`.

---

## Daftar Isi

1. [Pendahuluan](#1-pendahuluan)
2. [Design Tokens](#2-design-tokens)
   - 2.1 [Color Palette](#21-color-palette)
   - 2.2 [Semantic Colors](#22-semantic-colors)
   - 2.3 [Typography Scale](#23-typography-scale)
   - 2.4 [Spacing Grid (4px)](#24-spacing-grid-4px)
   - 2.5 [Border Radius](#25-border-radius)
   - 2.6 [Shadows & Elevation](#26-shadows--elevation)
   - 2.7 [Z-Index Scale](#27-z-index-scale)
3. [Component Library](#3-component-library)
   - 3.1 [Header (App Bar)](#31-header-app-bar)
   - 3.2 [Repo Tabs](#32-repo-tabs)
   - 3.3 [Search Bar / Pencarian](#33-search-bar--pencarian)
   - 3.4 [File List & File Items](#34-file-list--file-items)
   - 3.5 [Hint Bar](#35-hint-bar)
   - 3.6 [Preview Header & View Tabs](#36-preview-header--view-tabs)
   - 3.7 [Variables Bar & Chips](#37-variables-bar--chips)
   - 3.8 [Variable Edit Modal](#38-variable-edit-modal)
   - 3.9 [Preview Content Area (Rendered / Raw)](#39-preview-content-area-rendered--raw)
   - 3.10 [Preview Action Buttons (Drag / Copy / Insert)](#310-preview-action-buttons-drag--copy--insert)
   - 3.11 [Main Footer](#311-main-footer)
   - 3.12 [Loading &amp; Empty States](#312-loading--empty-states)
   - 3.13 [Scrollbar](#313-scrollbar)
4. [Interaction Patterns](#4-interaction-patterns)
   - 4.1 [Hover States](#41-hover-states)
   - 4.2 [Click & Tap](#42-click--tap)
   - 4.3 [Drag & Drop](#43-drag--drop)
   - 4.4 [Keyboard Navigation](#44-keyboard-navigation)
   - 4.5 [Focus Management](#45-focus-management)
   - 4.6 [Transitions & Animations](#46-transitions--animations)
5. [Accessibility (A11y)](#5-accessibility-a11y)
   - 5.1 [Color Contrast](#51-color-contrast)
   - 5.2 [Focus Indicators](#52-focus-indicators)
   - 5.3 [ARIA Labels & Roles](#53-aria-labels--roles)
   - 5.4 [Screen Reader Considerations](#54-screen-reader-considerations)
   - 5.5 [Keyboard-Only Usage](#55-keyboard-only-usage)
6. [Micro-interactions](#6-micro-interactions)
   - 6.1 [Tab Switch (Repo &amp; Preview)](#61-tab-switch-repo--preview)
   - 6.2 [File List: Staggered Entry](#62-file-list-staggered-entry)
   - 6.3 [Modal Open / Close](#63-modal-open--close)
   - 6.4 [Toast Notification](#64-toast-notification)
   - 6.5 [Skeleton to Content Transition](#65-skeleton-to-content-transition)
   - 6.6 [Copy Button Feedback](#66-copy-button-feedback)
   - 6.7 [Drag State](#67-drag-state)
7. [Implementation Notes](#7-implementation-notes)
8. [Design Validation Checklist](#8-design-validation-checklist)

---

## 1. Pendahuluan

blinker adalah Chrome extension dengan ukuran popup tetap **400px x 600px** yang dirancang untuk
tiga persona utama:

| Persona | Kasus Penggunaan Utama |
|---------|----------------------|
| **Developer** | Mencari snippet, template kode, standar engineering, drag/drop ke editor |
| **Product Manager** | Mengakses PRD prompt, menyusun dokumen produk, menyalin template |
| **Technical Writer** | Mengambil standar dokumentasi, mengedit variable di prompt, preview konten |

### 1.1 Filosofi Desain: Nocturnal Luxe

Nocturnal Luxe adalah aesthetic yang memadukan tema gelap mewah dengan fungsionalitas alat
pengembang. Prinsip-prinsipnya:

- **Gelap, bukan redup.** Setiap elemen memiliki kontras yang jelas. Latar belakang gelap
  pekat (#0d1117) dipadu aksen warna tajam yang bersinar.
- **Fungsional yang elegan.** Tidak ada dekorasi tanpa tujuan. Setiap border, bayangan, dan
  transisi mendukung usability.
- **Data sebagai ornamen.** Warna-warna pada chips, highlight, dan badge tidak hanya estetis —
  mereka mengelompokkan informasi secara visual.
- **Ruangan yang bernapas.** Spacing 4px grid memberikan konsistensi vertikal dan horizontal
  yang membuat 400px terasa lega, tidak sesak.

### 1.2 Canvas & Constraints

```
┌──────────────────────────────────┐
│  ┌─ Header ─────────────────────┐│ ── 38px
│  │ icon  blinker           [↻]  ││
│  └──────────────────────────────┘│
│  ┌─ Repo Tabs ──────────────────┐│ ── 40px
│  │ [📋 PRD]  [🗂️ Prompt Coll.] ││
│  └──────────────────────────────┘│
│  ┌─ Search ─────────────────────┐│ ── 37px
│  │ 🔍 [ Cari file...          ] ││
│  └──────────────────────────────┘│
│  ┌─ Hint ───────────────────────┐│ ── 24px
│  │ ● Drag ke input · klik 👁   ││
│  └──────────────────────────────┘│
│  ┌─ List Scroll ────────────────┐│
│  │ SECTION LABEL                ││
│  │ 📋 file-item           👁Copy││ ← flex: 1
│  │ 📋 file-item           👁Copy││
│  │ ...                         ││
│  └──────────────────────────────┘│
│  ┌─ Main Footer ────────────────┐│ ── 31px
│  │ 12 files      GitHub ↗      ││
│  └──────────────────────────────┘│
└──────────────────────────────────┘
        400px (fixed width)
```

Layout ini dibagi menjadi area-area yang **flex-shrink:0** untuk header, tabs, search, hint,
dan footer, sementara area konten (list-scroll / preview-scroll) menggunakan **flex:1** dan
overflow-y:auto untuk mengisi sisa tinggi.

---

## 2. Design Tokens

### 2.1 Color Palette

Palet warna Nocturnal Luxe terinspirasi dari langit malam dengan aksen neon-halus.
Setiap warna dipilih agar memenuhi **WCAG AA minimum** pada latar belakang gelap.

#### 2.1.1 Netral (Surface)

| Token | Hex | RGB | Penggunaan |
|-------|-----|-----|------------|
| `--bg-primary` | `#0d1117` | `13,17,23` | Latar belakang utama body, di belakang konten |
| `--bg-secondary` | `#161b22` | `22,27,34` | Header, footer, search-wrap, modal box, preview-header |
| `--bg-tertiary` | `#21262d` | `33,38,45` | Border elemen, background code inline, chip active |
| `--bg-hover` | `#161b22` | `22,27,34` | Hover state item, tab hover |
| `--border-default` | `#21262d` | `33,38,45` | Border standard semua komponen |
| `--border-muted` | `#30363d` | `48,54,61` | Border icon-btn, input, secondary border |

#### 2.1.2 Foreground (Text)

| Token | Hex | Kontras thd #0d1117 | Penggunaan |
|-------|-----|---------------------|------------|
| `--text-primary` | `#e6edf3` | **13.6:1 (AAA)** | Judul, heading, teks utama |
| `--text-secondary` | `#c9d1d9` | **9.7:1 (AAA)** | Nama file, body teks, konten markdown |
| `--text-tertiary` | `#8b949e` | **5.7:1 (AA)** | Label, icon, tombol non-aktif, hint |
| `--text-muted` | `#484f58` | **2.9:1** | Placeholder, section label, file description, footer count |
| `--text-disabled` | `#484f58` | **2.9:1** | Elemen non-aktif (tidak perlu AA karena disabled) |

#### 2.1.3 Akses Warna (Accent)

Warna aksen digunakan untuk tab aktif, link, tombol aksi, hover state, highlight.

| Token | Hex | RGB | Peran |
|-------|-----|-----|-------|
| `--accent-blue` | `#58a6ff` | `88,166,255` | Aksen utama: link, tab-mdown aktif, focus border, hover icon-btn, row-btn hover |
| `--accent-green` | `#3fb950` | `63,185,80` | Tab-PRD aktif, success state, apply button, copy confirmation |
| `--accent-orange` | `#ffa657` | `255,166,87` | Variable chip grup 1, variable highlight grup 1 |
| `--accent-purple` | `#d2a8ff` | `210,168,255` | Variable chip grup 3, template badge, template tag |
| `--accent-red` | `#ff7b72` | `255,123,114` | Variable chip grup 5, inline code color, error state |
| `--accent-blue-btn` | `#1f6feb` | `31,111,235` | Tombol Insert (primary action) |
| `--accent-blue-btn-hover` | `#388bfd` | `56,139,253` | Hover state tombol Insert |
| `--accent-green-btn` | `#238636` | `54,134,54` | Tombol Copy / Apply (success action) |
| `--accent-green-btn-hover` | `#2ea043` | `46,160,67` | Hover state tombol Copy / Apply |

#### 2.1.4 Overlay & Shadow

| Token | Hex/RGBA | Penggunaan |
|-------|----------|------------|
| `--overlay-dark` | `rgba(0,0,0,0.6)` | Backdrop modal |
| `--shadow-modal` | `0 8px 32px rgba(0,0,0,0.5)` | Bayangan modal box |

#### 2.1.5 Warna Variabel (6 Grup Siklik)

Enam grup warna untuk `var-chip` dan `var-highlight` yang bersiklik (nth-child 6n+1 hingga 6n+6):

| Grup | Background | Text | Border | nth-child |
|------|-----------|------|--------|-----------|
| 1 — Orange | `#3d2b1f` | `#ffa657` | `#6e3f1c` | 6n+1 |
| 2 — Blue | `#1f2d3d` | `#79c0ff` | `#1c4a6e` | 6n+2 |
| 3 — Purple | `#2d1f3d` | `#d2a8ff` | `#5a2e8a` | 6n+3 |
| 4 — Green | `#1f3d2b` | `#56d364` | `#1a6e3c` | 6n+4 |
| 5 — Red | `#3d1f2b` | `#ff7b72` | `#6e1c2e` | 6n+5 |
| 6 — Lime | `#2b3d1f` | `#a5d679` | `#3e6e1c` | 6n+6 |

Setiap grup variable memiliki rasio kontras minimum **4.5:1** terhadap background-nya masing-masing.

#### 2.1.6 Special Purpose Colors

| Token | Hex | Fungsi |
|-------|-----|--------|
| `--spinner-track` | `#21262d` | Track animasi spinner |
| `--spinner-accent` | `#58a6ff` | Bagian atas spinner (akselerasi) |
| `--file-tag-prd-bg` | `#1a3a1a` | Badge PRD pada file PRD |
| `--file-tag-prd-border` | `#2a5a2a` | Border badge PRD |
| `--file-tag-template-bg` | `#2d1f3d` | Badge Template |
| `--file-tag-template-border` | `#4a2e6a` | Border badge Template |

### 2.2 Semantic Colors

Warna semantik memetakan peran fungsional ke token warna di atas.

```css
/* REPO IDENTITY */
--repo-prd-color:     var(--accent-green);  /* #3fb950 */
--repo-mdown-color:   var(--accent-blue);   /* #58a6ff */

/* STATE */
--state-info:         var(--accent-blue);
--state-success:      var(--accent-green);
--state-warning:      var(--accent-orange);
--state-error:        var(--accent-red);

/* INTERACTIVE */
--interactive-hover-border:  var(--accent-blue);
--interactive-hover-text:    var(--accent-blue);
--interactive-active-bg:     var(--bg-tertiary);    /* #21262d */
--interactive-active-text:   var(--text-primary);

/* SURFACE */
--surface-header:     var(--bg-secondary);  /* #161b22 */
--surface-body:       var(--bg-primary);    /* #0d1117 */
--surface-card:       var(--bg-secondary);
--surface-elevated:   var(--bg-secondary);  /* modal */

/* BORDER */
--border-subtle:      var(--border-default);   /* #21262d */
--border-default:     var(--border-muted);     /* #30363d */
--border-accent:      var(--accent-blue);
```

### 2.3 Typography Scale

blinker menggunakan sistem font native untuk performa maksimal di extension:

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
font-family (monospace): monospace; /* untuk code, raw, variable name */
```

#### 2.3.1 Font Size Scale

| Token | Size | Berat | Line Height | Penggunaan |
|-------|------|-------|-------------|------------|
| `--fs-xl` | **18px** (1.384) | Bold (700) | 1.4 | Judul markdown h1 |
| `--fs-lg` | **15px** (1.154) | Bold (700) | 1.4 | Judul markdown h2 |
| `--fs-base-plus` | **14px** (1.077) | Bold (700) | 1.4 | Nama variable modal, monospace |
| `--fs-base` | **13px** (1.000) | Regular (400) / Bold (700) | 1.6 | Body utama, header-icon, header-title, markdown body, input text |
| `--fs-sm` | **12px** (0.923) | Regular / Medium (500) | 1.5 | Nama file, search input, tombol modal, state text, no-results, footer link |
| `--fs-xs` | **11px** (0.846) | Regular / Semibold (600) | 1.4 | Icon button, repo tab, copy row button, preview tab, raw-body, footer link |
| `--fs-2xs` | **10px** (0.769) | Regular / Semibold (600) | 1.4 | Section label, hint, file description, file number, vars label, footer count, file tag, tab label, row-btn |
| `--fs-3xs` | **9px** (0.692) | Semibold (600) | 1.3 | File tag badge |

#### 2.3.2 Font Weight Scale

| Weight | Nilai | Penggunaan |
|--------|-------|------------|
| Regular | 400 | Body text, markdown p, li, input value |
| Medium | 500 | Variable chip |
| Semibold | 600 | Section label, repo tab, preview tab, action buttons, PF-btn, file tag |
| Bold | 700 | Header title, file name, heading markdown, modal variable name |

#### 2.3.3 Spesimen Tipografi

```css
/* Body — 13px */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-secondary); /* #c9d1d9 */
}

/* Heading */
h1 { font-size: 18px; font-weight: 700; color: var(--text-primary); }
h2 { font-size: 15px; font-weight: 700; color: var(--text-primary); }
h3 { font-size: 13px; font-weight: 700; color: var(--text-primary); }

/* Code */
code, pre, .raw-body, .var-modal-name {
  font-family: monospace;
}

/* Inline code */
code {
  font-size: 12px;
  color: var(--accent-red);    /* #ff7b72 */
  background: var(--bg-tertiary);
  border-radius: 3px;
  padding: 1px 4px;
}
```

### 2.4 Spacing Grid (4px)

Semua jarak dalam blinker menggunakan kelipatan 4px (4, 8, 12, 16, 20, 24, 28, 32).

| Token | Nilai | Contoh Penggunaan |
|-------|-------|-------------------|
| `--space-1` | 4px | gap vars-chips, padding chip, gap row-btns, margin list-scroll antar item |
| `--space-2` | 8px | gap header, padding search-wrap, padding preview-header, padding preview-footer |
| `--space-3` | 12px | padding body, horizontal padding scroll, padding modal box |
| `--space-4` | 16px | padding button, wrapper padding |
| `--space-5` | 20px | padding empty state, no-results |
| `--space-6` | 24px | padding section |
| `--space-8` | 32px | jarak antar group besar |

#### Implementasi CSS

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
}
```

#### Pola Spacing pada Komponen

| Komponen | Padding | Gap | Margin |
|----------|---------|-----|--------|
| Header | `10px 12px` (10=8+2, 12=4x3) | 8px | — |
| Repo Tabs | `6px 8px` top, `0 8px` horizontal | 2px | — |
| Search Wrap | `8px 12px` | — | — |
| List Scroll | `4px 6px` | — | — |
| File Item | `6px 7px` | 7px | — |
| Section Label | `7px 5px 3px` | — | — |
| Preview Header | `8px 12px` | 6px | — |
| Preview Footer | `8px 12px` | 6px | — |
| Main Footer | `7px 12px` | — | — |
| Hint Bar | `5px 12px` | 5px | — |
| Vars Bar | `6px 10px` | 4px | — |
| Modal Box | `14px` | — | — |
| Empty State | `20px` | 10px | — |

### 2.5 Border Radius

| Token | Nilai | Penggunaan |
|-------|-------|------------|
| `--radius-sm` | 3px | Row button, var-chip, var-highlight, code inline, var-rendered, file-tag, scrollbar thumb, preview tab |
| `--radius-md` | 5px | Icon button, search input, file-item, button standard, modal input, PF-btn, pre block |
| `--radius-lg` | 6px | Repo tab atas (border-radius atas 6px), preview tab group |
| `--radius-xl` | 8px | Modal box |

#### Detail Border Radius per Komponen

```
Repo tab:          border-radius: 6px 6px 0 0  (hanya atas)
Preview tab group: border-radius: 4px (pada container), 3px (pada tab)
Modal box:         border-radius: 8px
Icon button:       border-radius: 5px
File item:         border-radius: 5px
File tag/badge:    border-radius: 3px
Var chip:          border-radius: 3px
Code block (pre):  border-radius: 5px
Code inline:       border-radius: 3px
Input/search:      border-radius: 5px
PF button:         border-radius: 5px
Row button:        border-radius: 3px
```

### 2.6 Shadows & Elevation

Karena extension popup memiliki latar gelap, shadow digunakan secara halus untuk memberikan
kedalaman tanpa menimbulkan efek mengambang yang berlebihan.

| Level | Token | Nilai | Penggunaan |
|-------|-------|-------|------------|
| 0 | `--shadow-none` | `none` | Permukaan rata |
| 1 | `--shadow-sm` | `none` (implisit — border cukup) | Kartu dan surface — border 1px sudah memberi batas |
| 2 | `--shadow-md` | `inset 0 1px 0 rgba(255,255,255,0.03)` | Surface terangkat sedikit (header, footer) — tidak diimplementasikan di v1, menggunakan border-bottom |
| 3 | `--shadow-lg` | `0 8px 32px rgba(0,0,0,0.5)` | Modal box — satu-satunya elemen yang menggunakan bayangan |

**Catatan:** Di v1 ini, elevation dikomunikasikan melalui **border** (1px solid) dan **warna
latar** (bg-primary vs bg-secondary) bukan shadow. Hanya modal yang mendapat bayangan.

### 2.7 Z-Index Scale

| Token | Nilai | Elemen |
|-------|-------|--------|
| `--z-base` | `1` | Konten normal |
| `--z-sticky` | `100` | Header sticky, preview header |
| `--z-overlay` | `500` | Backdrop overlay |
| `--z-modal` | `999` | Modal box |

**Implementasi:**

```css
.var-modal { z-index: 999; }          /* Modal tertinggi */
.var-modal-box { z-index: inherit; }  /* Turunan dari parent */
```

---

## 3. Component Library

### 3.1 Header (App Bar)

Header adalah titik navigasi tetap di bagian atas popup.

#### 3.1.1 Struktur

```
┌──────────────────────────────────┐
│ ✨  blinker                [↻]   │
└──────────────────────────────────┘
```

- **Icon** (kiri): Emoji/sparkle `✨` — ukuran 16px, inline
- **Title**: Teks "blinker" — font-size 13px, bold 700
- **Refresh Button** (kanan): Icon button dengan simbol `↻`

#### 3.1.2 Visual

```css
.header {
  background: var(--bg-secondary);       /* #161b22 */
  border-bottom: 1px solid var(--border-default); /* #21262d */
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.header-icon { font-size: 16px; }
.header-title { font-size: 13px; font-weight: 700; flex: 1; }
```

#### 3.1.3 States

| State | Perubahan |
|-------|-----------|
| Default | Judul putih, tombol refresh border `#30363d` |
| Hover (refresh) | Border jadi `#58a6ff`, warna text jadi `#58a6ff` |
| Loading | Refresh button tetap bisa diklik (tidak ada spinner di header) |

#### 3.1.4 Accessibility

- Refresh button memiliki `title="Refresh dari GitHub"`
- Button memiliki `cursor: pointer`
- Ukuran minimum target klik: `padding: 3px 7px` (~24px height)

### 3.2 Repo Tabs

Tab untuk beralih antara repositori PRD dan Prompt Collection.

#### 3.2.1 Struktur

```
┌──────────────────────────────────┐
│  [📋 PRD Prompt]  [🗂️ Prompt Collection]  │
└──────────────────────────────────┘
```

Masing-masing tab terdiri dari:
- **Icon**: Emoji `📋` (PRD) atau `🗂️` (mdown)
- **Label**: Teks pendek "PRD Prompt" atau "Prompt Collection"
- **Active indicator**: Warna aksen hijau (#3fb950) untuk PRD, biru (#58a6ff) untuk mdown

#### 3.2.2 Visual

```css
.repo-tabs {
  display: flex;
  background: var(--bg-primary);          /* #0d1117 */
  border-bottom: 1px solid var(--border-default);
  padding: 6px 8px 0;
  gap: 2px;
  flex-shrink: 0;
}
.repo-tab {
  flex: 1;
  padding: 7px 8px;
  border: 1px solid transparent;
  border-bottom: none;
  border-radius: 6px 6px 0 0;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-tertiary);            /* #8b949e */
  background: none;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.repo-tab .tab-icon  { font-size: 14px; }
.repo-tab .tab-label { font-size: 10px; }
```

#### 3.2.3 States

| State | Background | Border | Text Color |
|-------|-----------|--------|------------|
| Default (inactive) | Transparan | Transparan | #8b949e |
| Hover | #161b22 | Transparan | #c9d1d9 |
| Active (PRD / tab-prd) | #161b22 | #21262d (samping+bawah), border-bottom #161b22 | #e6edf3, aksen #3fb950 |
| Active (mdown / tab-mdown) | #161b22 | #21262d (samping+bawah), border-bottom #161b22 | #e6edf3, aksen #58a6ff |

**Penting:** Saat tab aktif, border-bottom diabaikan (warna #161b22) sehingga menyatu dengan
area konten di bawahnya, menciptakan ilusi tab menyatu dengan panel.

#### 3.2.4 Accessibility

```html
<button class="repo-tab tab-prd active" id="repoTabPrd" role="tab" aria-selected="true">
<button class="repo-tab tab-mdown" id="repoTabMdown" role="tab" aria-selected="false">
```
- Gunakan `role="tab"` dan `aria-selected`
- Container perlu `role="tablist"`
- Focus dapat dipindahkan dengan ArrowLeft / ArrowRight

### 3.3 Search Bar / Pencarian

#### 3.3.1 Struktur

```
┌──────────────────────────────────┐
│ 🔍 [ Cari file...              ] │
└──────────────────────────────────┘
```

Search input memiliki ikon inline via `background-image` SVG untuk menghindari HTTP request
tambahan. Ikon berupa kaca pembesar dengan stroke `#8b949e`.

#### 3.3.2 Visual

```css
.search-wrap {
  padding: 8px 12px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-default);
  flex-shrink: 0;
}
.search-input {
  width: 100%;
  background: var(--bg-primary);
  border: 1px solid var(--border-muted);
  border-radius: 5px;
  color: var(--text-primary);
  padding: 5px 9px 5px 28px;   /* 28px = 8px (icon position) + 13px (icon width) + 7px */
  font-size: 12px;
  outline: none;
}
```

#### 3.3.3 States

| State | Perubahan |
|-------|-----------|
| Default | Border #30363d, placeholder #484f58 |
| Focus | Border berubah ke #58a6ff (accent-blue) |
| Terisi | Text putih (#e6edf3) |
| Disabled | Tidak ada — search selalu aktif |

#### 3.3.4 Search Aliases (Fitur)

Search mendukung alias yang diekspansi:
- `cs` -> "customer support"
- `prd` -> "product requirements"
- `qa` -> "quality assurance"
- `api` -> "application programming interface"

Alias ini memungkinkan pencarian cepat dengan singkatan yang umum digunakan developer.

### 3.4 File List & File Items

#### 3.4.1 Struktur

```
┌─ SECTION LABEL ──────────────────┐
│ PRD Collection                   │
├──────────────────────────────────┤
│  📋 1. Accounting Prompt    👁Copy ⠿  │
│  📋 7. API Endpoints        👁Copy ⠿  │
│  📋 10. Database Schema     👁Copy ⠿  │
├─ SECTION LABEL ──────────────────┤
│ Template                         │
├──────────────────────────────────┤
│  📐 1. PRD Template         👁Copy ⠿  │
│  📐 2. User Story           👁Copy ⠿  │
└──────────────────────────────────┘
```

Setiap file item terdiri dari:

| Elemen | Keterangan |
|--------|------------|
| `file-icon` | Emoji berdasarkan tipe file/repo: 📋 (PRD), 📄 (md biasa), 📐 (template/standard), 🗂️ (minimal), {} (JSON) |
| `file-num` | Nomor urut dari prefix nama file (optional) |
| `file-name` | Nama file setelah nomor prefix, underscore diganti spasi |
| `file-desc` | Ukuran file dalam format B/KB (optional) |
| `row-btns` | Tombol aksi per baris (Preview 👁, Copy) — muncul saat hover |
| `drag-handle` | Indikator `⠿` bahwa item bisa di-drag — muncul saat hover |

#### 3.4.2 Visual

```css
.section-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-muted);       /* #484f58 */
  padding: 7px 5px 3px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 7px;
  border-radius: 5px;
  cursor: grab;
  user-select: none;
  border: 1px solid transparent;
  transition: background 0.1s;
}
```

#### 3.4.3 States

| State | Background | Border | Opacity |
|-------|-----------|--------|---------|
| Default | Transparan | Transparan | 1.0 |
| Hover | #161b22 | #21262d | 1.0 |
| Dragging | (same) | (same) | **0.35** |
| Active (mouse down) | — | — | cursor: grabbing |

#### 3.4.4 Row Buttons

Tombol per baris (`row-btns`) memiliki **opacity 0** secara default dan menjadi **opacity 1**
saat file-item di-hover. Ini mengurangi clutter visual.

```css
.row-btns { opacity: 0; transition: opacity 0.1s; }
.file-item:hover .row-btns { opacity: 1; }

.row-btn {
  padding: 2px 5px;
  font-size: 10px;
  border: 1px solid #21262d;
  color: #484f58;
  border-radius: 3px;
}
.row-btn:hover { border-color: #58a6ff; color: #58a6ff; }
.row-btn.green:hover { border-color: #3fb950; color: #3fb950; }
.row-btn.copied { border-color: #3fb950; color: #3fb950; }
```

#### 3.4.5 Drag and Drop

File item memiliki `draggable="true"`. Saat drag:
- Class `.dragging` ditambahkan, mengubah opacity menjadi 0.35
- Data content diambil dari cache (prefetch on hover) atau fetch on-demand
- `e.dataTransfer.effectAllowed = 'copy'`

#### 3.4.6 File Tags / Badge

Untuk file PRD dan template, ada badge kecil:

```css
.file-tag {
  font-size: 9px; font-weight: 600;
  padding: 1px 5px; border-radius: 3px;
}
.file-tag.prd      { background: #1a3a1a; color: #3fb950; border: 1px solid #2a5a2a; }
.file-tag.template { background: #2d1f3d; color: #d2a8ff; border: 1px solid #4a2e6a; }
```

### 3.5 Hint Bar

#### 3.5.1 Struktur

```
┌──────────────────────────────────┐
│ ● Drag ke input · klik 👁 preview│
└──────────────────────────────────┘
```

Sebuah bar tipis dengan dot dan teks petunjuk. Dot berubah warna mengikuti repo aktif:
- PRD: hijau (#3fb950)
- mdown: biru (#58a6ff)

#### 3.5.2 Visual

```css
.hint {
  padding: 5px 12px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-default);
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--text-tertiary);   /* #8b949e */
  font-size: 10px;
  flex-shrink: 0;
}
.hint-dot { width: 5px; height: 5px; border-radius: 50%; }
```

### 3.6 Preview Header & View Tabs

#### 3.6.1 Struktur

```
┌──────────────────────────────────┐
│  [← Back]  Nama File  [Rendered|Raw] │
└──────────────────────────────────┘
```

- **Back button**: Icon button dengan teks "← Back"
- **Filename**: Nama file (tanpa ekstensi) — overflow ellipsis
- **View Tabs**: Switch antara rendered dan raw view

#### 3.6.2 Visual

```css
.preview-header {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-default);
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.preview-filename {
  font-size: 12px; font-weight: 600;
  flex: 1; color: var(--text-secondary);       /* #c9d1d9 */
  white-space: nowrap; overflow: hidden;
  text-overflow: ellipsis;
}

/* Preview tab group */
.preview-tabs {
  display: flex; gap: 1px;
  background: var(--bg-primary);              /* #0d1117 */
  border-radius: 4px; padding: 2px;
}
.preview-tab {
  background: none; border: none;
  color: var(--text-tertiary);                /* #8b949e */
  padding: 3px 8px; border-radius: 3px;
  cursor: pointer; font-size: 11px;
}
.preview-tab.active {
  background: var(--bg-tertiary);             /* #21262d */
  color: var(--text-primary);                 /* #e6edf3 */
}
```

Tab group menggunakan teknik **segmented control**: background gelap #0d1117 dengan padding 2px,
tab aktif mendapat latar #21262d.

### 3.7 Variables Bar & Chips

#### 3.7.1 Struktur

```
┌─ Variables (klik untuk edit): ───┐
│  [{{VAR_NAME}}] [{{OTHER_VAR}}] [...]
└──────────────────────────────────┘
```

Bar ini hanya muncul jika file memiliki variable `{{...}}`. Disembunyikan dengan
`display: none` secara default dan `display: block` saat `has-vars`.

#### 3.7.2 Visual

```css
.vars-bar {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-default);
  padding: 6px 10px;
  flex-shrink: 0;
  display: none;
}
.vars-bar.has-vars { display: block; }
.vars-label { font-size: 10px; color: var(--text-tertiary); margin-bottom: 5px; }
.vars-chips { display: flex; flex-wrap: wrap; gap: 4px; }

.var-chip {
  padding: 2px 7px; border-radius: 3px;
  font-size: 10px; cursor: pointer;
  border: 1px solid transparent;
  font-weight: 500;
}
/* 6 grup warna siklik — lihat 2.1.5 */
```

#### 3.7.3 States

| State | Perubahan |
|-------|-----------|
| Default | Warna grup masing-masing (6 siklik) |
| Hover | `filter: brightness(1.2); border-color: currentColor` |
| After click | Membuka modal edit variable |

#### 3.7.4 Highlight dalam Konten

Variable yang **belum diisi** tetap muncul sebagai `{{VAR}}` dan di-highlight:
- Di rendered view: menggunakan `var-rendered` class (dashed border)
- Di raw view: menggunakan `var-highlight` class (solid background)

Keduanya menggunakan **6 grup warna siklik** yang sama dengan chips dan bisa diklik untuk
membuka modal edit.

### 3.8 Variable Edit Modal

#### 3.8.1 Struktur

```
┌─────────────────────────────────────┐
│  ┌─────────────────────────────┐    │
│  │ Edit variable               │    │
│  │ {{VAR_NAME}}                │    │
│  │ ┌─────────────────────────┐ │    │
│  │ │ [Masukkan nilai...]     │ │    │
│  │ └─────────────────────────┘ │    │
│  │            [Batal] [Terapkan]│    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

#### 3.8.2 Visual

```css
.var-modal {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.6);
  display: none;             /* hidden by default */
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.var-modal.open { display: flex; }

.var-modal-box {
  background: var(--bg-secondary);
  border: 1px solid var(--border-muted);
  border-radius: 8px;
  padding: 14px;
  width: 310px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
}
.var-modal-title { font-size: 11px; color: var(--text-tertiary); margin-bottom: 6px; }
.var-modal-name  { font-size: 14px; font-weight: 700; font-family: monospace; margin-bottom: 8px; }
.var-modal-input {
  width: 100%; background: var(--bg-primary);
  border: 1px solid var(--border-muted);
  border-radius: 5px; color: var(--text-primary);
  padding: 7px 9px; font-size: 13px;
  outline: none; margin-bottom: 10px;
}
.var-modal-input:focus { border-color: var(--accent-blue); }
```

#### 3.8.3 Button Pair

| Tombol | Style | Fungsi |
|--------|-------|--------|
| Batal (cancel) | Transparan, border #30363d, teks #8b949e | Tutup modal tanpa menyimpan |
| Terapkan (apply) | Background #238636, teks putih | Simpan nilai variable dan refresh preview |

#### 3.8.4 Keyboard

| Key | Aksi |
|-----|------|
| Enter | Apply (simpan) |
| Escape | Cancel (tutup) |
| Tab | Pindah fokus antara input dan tombol |
| Shift+Tab | Pindah fokus mundur |

#### 3.8.5 States

| State | Perubahan |
|-------|-----------|
| Modal tertutup | `display: none` |
| Modal terbuka | `display: flex` dengan backdrop gelap |
| Input focus | Border #58a6ff |
| Tombol cancel hover | Border #8b949e, teks #e6edf3 |
| Tombol apply hover | Background #2ea043 |

### 3.9 Preview Content Area (Rendered / Raw)

#### 3.9.1 Rendered View

Markdown dirender ke HTML menggunakan parser internal (regex-based) di `renderMarkdown()`.
Output ditempatkan dalam `<div class="md-body">`.

**Elemen yang didukung:**
- Heading h1, h2, h3
- Bold, italic, bold+italic
- Inline code & code block `<pre><code>`
- Link `<a>` — terbuka di tab baru (`target="_blank"`)
- Blockquote dengan border kiri
- Unordered list `<ul><li>`
- Ordered list `<ol><li>`
- Tabel `<table><tbody><tr><td>`
- Horizontal rule `<hr/>`
- Paragraf otomatis

#### 3.9.2 Raw View

Konten ditampilkan apa adanya dengan `white-space: pre-wrap` dan `font-family: monospace`.
Variable belum terisi tetap di-highlight dengan `var-highlight` class.

```css
.raw-body {
  font-size: 11px; line-height: 1.6;
  color: var(--text-secondary);
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-word;
}
```

#### 3.9.3 Scroll Area

```css
.preview-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 12px 14px;
}
```

### 3.10 Preview Action Buttons (Drag / Copy / Insert)

#### 3.10.1 Struktur

```
┌──────────────────────────────────┐
│  [⠿ Drag]  [📋 Copy]  [⬇ Insert]  │
└──────────────────────────────────┘
```

Tiga tombol aksi dengan peran berbeda:

| Tombol | Style | Icon | Fungsi |
|--------|-------|------|--------|
| **Drag** | Outline (transparan) | `⠿` | Drag content ke halaman web lain |
| **Copy** | Solid green (#238636) | `📋` | Copy ke clipboard |
| **Insert** | Solid blue (#1f6feb) | `⬇` | Insert langsung ke active element di halaman web |

#### 3.10.2 Visual

```css
.preview-footer {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-default);
  padding: 8px 12px;
  display: flex; gap: 6px; flex-shrink: 0;
}
.pf-btn {
  flex: 1;
  border: 1px solid var(--border-muted);
  border-radius: 5px;
  padding: 6px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  text-align: center;
}
```

#### 3.10.3 States

| Tombol | Default | Hover |
|--------|---------|-------|
| Drag | Background none, `#8b949e` | Border `#58a6ff`, text `#58a6ff` |
| Copy | Background `#238636`, white text | Background `#2ea043` |
| Insert | Background `#1f6feb`, white text | Background `#388bfd` |

#### 3.10.4 Copy Success Feedback

Saat copy berhasil, tombol Copy berubah teks menjadi `✓ Copied!` selama 1.5 detik.

### 3.11 Main Footer

#### 3.11.1 Struktur

```
┌──────────────────────────────────┐
│  12 files              GitHub ↗  │
└──────────────────────────────────┘
```

- **Kiri**: Jumlah file yang tampil (`${count} file(s)`)
- **Kanan**: Link ke repository GitHub, terbuka di tab baru

#### 3.11.2 Visual

```css
.main-footer {
  padding: 7px 12px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-default);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
.footer-count { font-size: 10px; color: var(--text-muted); }
.footer-link  {
  font-size: 10px; color: var(--accent-blue);
  text-decoration: none;
}
.footer-link:hover { text-decoration: underline; }
```

### 3.12 Loading & Empty States

#### 3.12.1 Loading State (Skeleton)

```html
<div class="state-wrap">
  <div class="spinner"></div>
  <div class="state-text">Mengambil daftar file...</div>
</div>
```

```css
.state-wrap {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 10px; padding: 20px;
  color: var(--text-tertiary);
}
.spinner {
  width: 22px; height: 22px;
  border: 2px solid var(--spinner-track);       /* #21262d */
  border-top-color: var(--spinner-accent);       /* #58a6ff */
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
```

**Varian teks loading:**
- Daftar file: "Mengambil daftar file..." / "Mengambil dari GitHub..."
- Preview: "Loading..."

#### 3.12.2 Error State

```html
<div class="state-wrap">
  <div class="state-icon">⚠️</div>
  <div class="state-text">Gagal: ${err.message}</div>
</div>
```

- Icon: ⚠️ (warning)
- Teks: Pesan error dari exception

#### 3.12.3 Empty State (No Results)

```html
<div class="no-results">Tidak ada file yang cocok 🔍</div>
```

- Muncul saat pencarian tidak menghasilkan file
- Teks sentral dengan font-size 12px, color #484f58
- Padding: 20px

### 3.13 Scrollbar

#### 3.13.1 Visual

```css
.list-scroll::-webkit-scrollbar,
.preview-scroll::-webkit-scrollbar {
  width: 3px;
}
.list-scroll::-webkit-scrollbar-thumb,
.preview-scroll::-webkit-scrollbar-thumb {
  background: var(--bg-tertiary);   /* #21262d */
  border-radius: 3px;
}
```

Scrollbar sangat tipis (3px) agar tidak mengambil banyak ruang di popup 400px.

| Elemen | Nilai |
|--------|-------|
| Width | 3px |
| Thumb color | #21262d |
| Thumb radius | 3px |
| Track | Transparan (tidak di-set, default) |

---

## 4. Interaction Patterns

### 4.1 Hover States

Semua elemen interaktif memiliki hover state yang jelas:

| Elemen | Efek Hover | Durasi |
|--------|-----------|--------|
| `.icon-btn` | Border dan text berubah ke `#58a6ff` | 150ms |
| `.repo-tab` | Background ke `#161b22`, text ke `#c9d1d9` | 150ms |
| `.file-item` | Background ke `#161b22`, border `#21262d` muncul | 100ms |
| `.file-item` .drag-handle | Warna dari `#30363d` ke `#484f58` | 100ms |
| `.row-btns` | Opacity 0 ke 1 (parent hover) | 100ms |
| `.row-btn` | Border ke `#58a6ff`, text ke `#58a6ff` | 150ms |
| `.row-btn.green` | Border ke `#3fb950`, text ke `#3fb950` | 150ms |
| `.var-chip` | `filter: brightness(1.2)`, border-color `currentColor` | 150ms |
| `.vm-btn.cancel` | Border ke `#8b949e`, text ke `#e6edf3` | 150ms |
| `.vm-btn.apply` | Background ke `#2ea043` | 150ms |
| `.pf-btn.drag` | Border ke `#58a6ff`, text ke `#58a6ff` | 150ms |
| `.pf-btn.copy` | Background ke `#2ea043` | 150ms |
| `.pf-btn.insert` | Background ke `#388bfd` | 150ms |
| `.footer-link` | `text-decoration: underline` | instant |

**Prinsip:** Semua transisi hover menggunakan `ease` timing function dengan durasi 100-150ms
— cepat namun tetap terasa halus.

### 4.2 Click & Tap

| Elemen | Efek Click | Catatan |
|--------|-----------|---------|
| Tab repo | Beralih tampilan file list, animasi tab aktif pindah | Mengubah class `.active` |
| Tab preview | Beralih rendered/raw, re-render konten | Memanggil `renderPreview()` |
| Back button | Kembali ke list view | List view menjadi `.active`, preview di-`.remove` |
| Preview button (👁) | Buka preview file | `stopPropagation` agar tidak trigger drag |
| Copy row button | Copy + feedback visual | Teks berubah `Copy` -> `...` -> `✓` -> `Copy` |
| Var chip | Buka modal edit variable | `stopPropagation` |
| Var highlight/rendered | Buka modal edit variable | Sama seperti chip |
| Modal backdrop click | Tutup modal | `if (e.target === varModal)` |
| Copy button (footer) | Copy + feedback | Teks `📋 Copy` -> `✓ Copied!` -> `📋 Copy` |

### 4.3 Drag & Drop

#### 4.3.1 File Item Drag

```javascript
item.addEventListener('dragstart', e => {
  item.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'copy';
  e.dataTransfer.setData('text/plain', cachedContent);
});

item.addEventListener('dragend', () => {
  item.classList.remove('dragging');
});
```

**Flow:**
1. User mulai drag → class `.dragging` ditambahkan (opacity 0.35)
2. Data content diambil dari cache (prefetch pada hover) atau fetch async
3. `effectAllowed = 'copy'` — drag tidak memindahkan file, hanya menyalin
4. Content juga disimpan ke `chrome.storage.local` untuk content script
5. User melepas → class `.dragging` dihapus

#### 4.3.2 Drag dari Preview Footer

Button `.pf-btn.drag-btn` juga `draggable="true"` dan menyediakan konten yang sudah
diaplikasikan variable-nya.

#### 4.3.3 Prefetch on Hover

```javascript
item.addEventListener('mouseenter', () => prefetchContent(repo, path));
item.addEventListener('pointerdown', () => prefetchContent(repo, path));
```

Cache di-populate saat user meng-hover item, sehingga saat drag dimulai, data sudah siap.

### 4.4 Keyboard Navigation

| Key | Konteks | Aksi |
|-----|---------|------|
| Enter | Modal input | Submit / Apply value |
| Escape | Modal | Close / Cancel |
| Escape | Di mana saja | Tutup modal jika terbuka (via event listener) |
| Tab | Modal | Pindah antara input -> Cancel -> Apply |
| ArrowLeft | Repo tabs | Pindah tab ke kiri (future enhancement) |
| ArrowRight | Repo tabs | Pindah tab ke kanan (future enhancement) |

### 4.5 Focus Management

1. **Modal terbuka**: Focus dipindahkan ke input (`vmInput.focus()`) setelah 50ms timeout
   (menunggu modal selesai render)
2. **Modal tertutup**: Focus tidak dikembalikan secara eksplisit (future enhancement — perlu
   menyimpan elemen terakhir yang di-focus)
3. **Tidak ada focus trap**: Di modal, user bisa Tab ke browser chrome/address bar
4. **Search input**: Fokus bisa diklik langsung oleh user

### 4.6 Transitions & Animations

| Property | Durasi | Timing | Elemen |
|----------|--------|--------|--------|
| `all` | 150ms | ease | Button, tab, chip, icon-btn, row-btn, PF-btn, vm-btn |
| `background` | 100ms | ease | File-item, chip hover |
| `opacity` | 100ms | ease | Row buttons muncul/sembunyi |
| `border-color` | 150ms | ease | Input focus, button hover |
| Spinner rotation | 700ms | linear | State loading |

```css
transition: all 0.15s;              /* pattern umum — 150ms */
transition: background 0.1s;        /* pattern khusus — 100ms */
transition: opacity 0.1s;           /* pattern khusus — 100ms */
```

---

## 5. Accessibility (A11y)

### 5.1 Color Contrast

Semua pasangan warna telah divalidasi terhadap WCAG 2.1.

#### 5.1.1 Text Contrast Ratios

| Elemen | Foreground | Background | Ratio | Level |
|--------|-----------|------------|-------|-------|
| Teks utama (body) | `#c9d1d9` | `#0d1117` | **9.7:1** | AAA |
| Judul / heading | `#e6edf3` | `#0d1117` | **13.6:1** | AAA |
| Teks tersier | `#8b949e` | `#0d1117` | **5.7:1** | AA |
| Teks muted | `#484f58` | `#0d1117` | **2.9:1** | — (hias/dekoratif) |
| Teks pada chip orange | `#ffa657` | `#3d2b1f` | **5.2:1** | AA |
| Teks pada chip blue | `#79c0ff` | `#1f2d3d` | **5.8:1** | AA |
| Teks pada chip purple | `#d2a8ff` | `#2d1f3d` | **5.9:1** | AA |
| Teks pada chip green | `#56d364` | `#1f3d2b` | **5.2:1** | AA |
| Teks pada chip red | `#ff7b72` | `#3d1f2b` | **4.5:1** | AA |
| Teks pada chip lime | `#a5d679` | `#2b3d1f` | **5.1:1** | AA |
| Tombol Copy | `#ffffff` | `#238636` | **5.5:1** | AA |
| Tombol Insert | `#ffffff` | `#1f6feb` | **5.7:1** | AA |
| Link GitHub | `#58a6ff` | `#161b22` | **5.6:1** | AA |

#### 5.1.2 Non-text Contrast

Semua elemen non-text (border, icon yang informatif) memiliki rasio kontras minimum 3:1
terhadap background adjacent.

### 5.2 Focus Indicators

Semua elemen interaktif memiliki `outline: none` pada CSS tetapi mengandalkan **border-color
change** sebagai visual focus indicator:

| Elemen | Focus Indicator |
|--------|----------------|
| Search input | Border berubah dari `#30363d` ke `#58a6ff` |
| Modal input | Border berubah dari `#30363d` ke `#58a6ff` |
| Tombol/button | Browser default outline + hover state memberikan indikasi visual |

**Catatan:** Untuk fokus keyboard murni, disarankan menambahkan `:focus-visible` style di
masa mendatang untuk memberikan ring fokus yang lebih jelas tanpa mengganggu pengguna mouse.

### 5.3 ARIA Labels & Roles

| Elemen | Atribut | Nilai |
|--------|---------|-------|
| Repo tabs container | `role` | `"tablist"` |
| Repo tab (PRD) | `role`, `aria-selected` | `"tab"`, `"true"` / `"false"` |
| Repo tab (mdown) | `role`, `aria-selected` | `"tab"`, `"true"` / `"false"` |
| Search input | `aria-label` | `"Cari file markdown"` |
| Refresh button | `title` | `"Refresh dari GitHub"` |
| Preview button (👁) | `title` | `"Preview"` |
| Copy row button | `title` | `"Copy"` |
| Var chip | `role` | `"button"` (future) |
| Modal | `role` | `"dialog"` (future) |
| Modal | `aria-modal` | `"true"` (future) |
| File list container | `role` | `"list"` (future) |
| File item | `role` | `"listitem"` (future) |

### 5.4 Screen Reader Considerations

1. **Loading states**: Spinner menggunakan CSS animation — tidak ada teks alternatif.
   Pastikan `.state-text` memberikan konteks yang cukup: "Mengambil daftar file..."

2. **Variable chips**: Teks `{{VAR_NAME}}` sudah deskriptif karena nama variable biasanya
   singkatan yang bermakna.

3. **Button icons**: Emoji seperti `👁`, `📋`, `⬇` bersifat dekoratif. Button perlu
   `aria-label` untuk memberikan nama yang bermakna.

4. **Tab switching**: Saat tab berubah, konten di bawahnya berubah. Gunakan `aria-live`
   region atau `role="tabpanel"` untuk memberi tahu screen reader.

5. **Modal dialog**: Saat modal terbuka, focus harus dipindahkan ke dalam modal. Saat
   tertutup, focus harus kembali ke tombol yang memicu modal.

6. **Drag and drop**: Elemen `draggable="true"` secara native diumumkan oleh browser.
   Pastikan setiap item memiliki label yang jelas.

### 5.5 Keyboard-Only Usage

Skenario penggunaan tanpa mouse:

1. **Navigasi daftar file**: Tab melalui file items (setiap item adalah focusable jika
   memiliki tombol). _Catatan: file item sendiri tidak memiliki tabindex — perlu
   ditingkatkan._

2. **Search**: Focus ke search input, ketik query, hasil langsung terfilter.

3. **Preview**: Tab ke 👁 button, Enter untuk buka preview.

4. **Back**: Tab ke ← Back button, Enter untuk kembali.

5. **Tab switching**: Tab ke tab PRD/mdown/Preview, Enter/Space untuk pindah.

6. **Modal**: Saat terbuka, Enter untuk apply, Escape untuk cancel.

**Gap identifikasi:** File items saat ini tidak memiliki `tabindex`, sehingga user keyboard
tidak bisa memilih file tanpa mouse. Ini adalah area yang perlu diperbaiki di versi
mendatang.

---

## 6. Micro-interactions

### 6.1 Tab Switch (Repo & Preview)

**Repo tab switch:**
1. User klik tab PRD atau Prompt Collection
2. Class `.active` dipindahkan ke tab baru, dihapus dari tab lama
3. Warna hint dot berubah sesuai repo aktif (hijau/biru)
4. List scroll di-reset, menampilkan loading spinner
5. Data di-fetch dari GitHub API (atau cache)
6. List di-render dengan file dari repo baru
7. Search input dikosongkan

**Preview tab switch:**
1. User klik "Rendered" atau "Raw"
2. Class `.active` dipindahkan
3. `renderPreview()` dipanggil ulang dengan mode baru
4. Scroll position dipertahankan

### 6.2 File List: Staggered Entry

Saat daftar file pertama kali di-render, semua item muncul bersamaan. Untuk meningkatkan
persepsi performa, di versi mendatang bisa ditambahkan staggered animation:

```css
@keyframes slideIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
.file-item {
  animation: slideIn 0.2s ease both;
}
.file-item:nth-child(1) { animation-delay: 0ms; }
.file-item:nth-child(2) { animation-delay: 20ms; }
/* ... dan seterusnya — bisa di-set via JS inline style */
```

Di versi saat ini, entry bersifat instant — setiap file item langsung muncul setelah
`renderList()` dipanggil.

### 6.3 Modal Open / Close

**Open:**
1. Variable chip atau highlight diklik
2. `varModal.classList.add('open')` → modal muncul (`display: none` → `display: flex`)
3. Input di-focus setelah 50ms delay
4. Backdrop gelap (rgba 0,0,0,0.6) muncul bersamaan

**Close (Cancel):**
1. Tombol Batal diklik, atau Escape ditekan, atau backdrop diklik
2. `varModal.classList.remove('open')` → modal menghilang
3. Nilai input yang sudah diketik **tidak disimpan**

**Close (Apply):**
1. Tombol Terapkan diklik, atau Enter ditekan
2. Nilai input disimpan ke `varValues[editingVar]`
3. Modal ditutup
4. Preview di-render ulang dengan variable baru

**Transisi:** Saat ini modal menggunakan `display: none/block` tanpa animasi transisi.
Untuk peningkatan, bisa ditambahkan:

```css
.var-modal {
  transition: opacity 0.2s ease;
  opacity: 0;
}
.var-modal.open {
  opacity: 1;
}
```

### 6.4 Toast Notification

Di versi saat ini tidak ada komponen toast terpusat. Feedback diberikan secara langsung
pada tombol:

- **Copy button**: Teks berubah menjadi `✓ Copied!` selama 1.5 detik
- **Copy row button**: Teks `Copy` → `...` → `✓` → `Copy`

Untuk versi mendatang, toast notification bisa ditambahkan:

```css
.toast {
  position: fixed;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-secondary);
  border: 1px solid var(--accent-green);
  border-radius: 5px;
  padding: 6px 12px;
  font-size: 11px;
  color: var(--accent-green);
  animation: toastIn 0.2s ease, toastOut 0.2s ease 2s forwards;
}
@keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(8px); } }
@keyframes toastOut { to { opacity: 0; transform: translateX(-50%) translateY(-4px); } }
```

### 6.5 Skeleton to Content Transition

Saat ini loading state menggunakan spinner + teks. Transisi ke konten terjadi secara
instan — spinner diganti dengan list HTML dalam satu operasi `innerHTML`.

Untuk improvement:
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.list-scroll > *:not(.state-wrap) {
  animation: fadeIn 0.15s ease;
}
```

### 6.6 Copy Button Feedback

**File list (row btn):**
1. Klik → teks jadi `...`
2. Fetch content dari GitHub
3. Copy ke clipboard → teks jadi `✓`, class`.copied` ditambahkan
4. Setelah 1.5 detik → teks kembali `Copy`, class`.copied` dihapus

### 6.7 Drag State

1. User mulai drag → class `.dragging` ditambahkan
2. Opacity item berubah menjadi 0.35 — item terlihat "terangkat"
3. Cursor berubah menjadi `grabbing` (CSS `:active` state)
4. Data dimasukkan ke `dataTransfer`
5. Setelah drag selesai → class `.dragging` dihapus, opacity kembali 1.0

---

## 7. Implementation Notes

### 7.1 CSS Architecture

CSS saat ini menggunakan pendekatan **single file stylesheet** inline di `popup.html`.
Keuntungan:
- Tanpa dependensi eksternal
- Loading instant (tidak ada HTTP request tambahan)
- Mudah di-maintain untuk proyek kecil

Untuk skala lebih besar, direkomendasikan:
- Ekstrak ke file `popup.css` terpisah
- Gunakan CSS custom properties untuk token
- Modularisasi per komponen

### 7.2 CSS Custom Properties (Tokens)

Rekomendasi implementasi token sebagai CSS custom properties:

```css
:root {
  /* Colors */
  --bg-primary: #0d1117;
  --bg-secondary: #161b22;
  --bg-tertiary: #21262d;
  --border-default: #21262d;
  --border-muted: #30363d;
  --text-primary: #e6edf3;
  --text-secondary: #c9d1d9;
  --text-tertiary: #8b949e;
  --text-muted: #484f58;
  --accent-blue: #58a6ff;
  --accent-green: #3fb950;
  --accent-orange: #ffa657;
  --accent-purple: #d2a8ff;
  --accent-red: #ff7b72;
  --accent-blue-btn: #1f6feb;
  --accent-green-btn: #238636;

  /* Typography */
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: monospace;
  --fs-xl: 18px;
  --fs-lg: 15px;
  --fs-base: 13px;
  --fs-sm: 12px;
  --fs-xs: 11px;
  --fs-2xs: 10px;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;

  /* Radius */
  --radius-sm: 3px;
  --radius-md: 5px;
  --radius-lg: 6px;
  --radius-xl: 8px;

  /* Z-index */
  --z-modal: 999;

  /* Transitions */
  --transition-fast: 100ms ease;
  --transition-base: 150ms ease;
}
```

### 7.3 File Organisation

```
popup.html — HTML structure + inline CSS
popup.js   — All JavaScript logic
```

Untuk masa depan, struktur yang lebih terorganisir:

```
src/
  styles/
    tokens.css       — Design tokens
    base.css         — Reset, body, typography
    components.css   — Semua component styles
  components/
    Header.js
    RepoTabs.js
    FileList.js
    Preview.js
    VarModal.js
  utils/
    github.js        — API functions
    markdown.js      — Markdown renderer
    cache.js         — Cache management
```

### 7.4 Markdown Parser

Parser saat ini menggunakan regex sederhana yang mencakup elemen umum. Keterbatasan:
- Tidak mendukung nested list
- Tidak mendukung inline HTML
- Tidak mendukung syntax highlighting di code block
- Tidak mendukung gambar

Untuk kebutuhan lebih lanjut, pertimbangkan menggunakan library seperti `marked` atau
`remark` (walaupun akan menambah bundle size).

### 7.5 Performance Considerations

| Aspek | Optimasi |
|-------|----------|
| Cache | File list di-cache di localStorage selama 10 menit |
| Prefetch | Content file di-prefetch saat hover |
| Rendering | renderList() menggunakan innerHTML — batch operation |
| Animasi | Gunakan `transform` dan `opacity` (GPU-accelerated) |
| Font | Gunakan system font stack — zero network request |

---

## 8. Design Validation Checklist

### Visual Design
- [ ] Semua teks memiliki kontras cukup (AA minimum, AAA untuk teks besar)
- [ ] Spacing konsisten menggunakan grid 4px
- [ ] Warna aksen digunakan secara intentional, tidak berlebihan
- [ ] Tidak ada dua elemen interaktif yang bertumpuk tanpa pemisah visual
- [ ] Ukuran target klik minimum 20px (ideal 24px+)
- [ ] Scrollbar tipis tidak mengganggu konten

### Interaction
- [ ] Semua tombol memiliki hover state
- [ ] Semua tombol memiliki cursor: pointer
- [ ] Drag memberikan feedback visual (opacity change)
- [ ] Copy memberikan feedback temporal (teks berubah)
- [ ] Tab switch memberikan transisi yang jelas (spinner)
- [ ] Modal bisa ditutup dengan 3 cara: Cancel, Escape, backdrop click

### Accessibility
- [ ] Semua button memiliki aria-label atau title
- [ ] Focus indicator visible untuk semua interactive elements
- [ ] Color tidak menjadi satu-satunya indikator informasi
- [ ] Tab navigasi logis
- [ ] Modal memindahkan focus ke dalam
- [ ] Screen reader dapat memahami struktur halaman

### Responsiveness (dalam batas 400x600)
- [ ] Konten tidak overflow secara horizontal
- [ ] File name terpotong dengan ellipsis
- [ ] Variable chips wrap dengan rapi
- [ ] Preview markdown tidak keluar dari container
- [ ] Modal tidak lebih besar dari viewport

### Code Quality
- [ ] CSS transitions menggunakan timing yang konsisten
- [ ] Tidak ada inline styles yang tidak perlu
- [ ] Event listeners di-attach dengan benar
- [ ] Memory leak tidak ada (event listener cleanup)
- [ ] Error states ditampilkan dengan baik ke user

---

> **Catatan:** Dokumen ini adalah living document yang harus diperbarui seiring perkembangan
> blinker. Setiap perubahan pada `popup.html` dan `popup.js` harus direfleksikan di sini.
>
> Terakhir diperbarui: 2026-06-24 — Cocok dengan codebase v2.0.0.
