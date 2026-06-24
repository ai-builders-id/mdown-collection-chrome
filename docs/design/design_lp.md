# Design System — AI Builders Indonesia

> Filosofi visual: **Workshop / Studio / Analog-Digital**.  
> Bukan landing page korporat yang rapi — tapi papan tulis whiteboard penuh tempelan sticky notes, coretan spidol, dan energi builder yang lagi *ngoding bareng*.

---

## Daftar Isi

- [Color Palette](#color-palette)
- [Typography](#typography)
- [Layout & Spacing](#layout--spacing)
- [Komponen Custom](#komponen-custom)
- [Animasi](#animasi)
- [Tone Visual](#tone-visual)
- [Teknis](#teknis)

---

## Color Palette

Semua warna didefinisikan sebagai **CSS custom properties** (HSL) di `src/index.css` dan di-map ke Tailwind di `tailwind.config.ts`.

### Core Colors

| Token | HSL | Tailwind | Penggunaan |
|---|---|---|---|
| `--background` | `39 30% 93%` | `bg-background` | Latar kraft paper hangat |
| `--foreground` | `220 15% 18%` | `text-foreground` | Teks utama (dark slate) |
| `--card` | `45 40% 92%` | `bg-card` | Latar kartu (lebih kekuningan) |
| `--primary` | `220 15% 18%` | `bg-primary` | Tombol CTA, aksen teks |
| `--secondary` | `39 20% 86%` | `bg-secondary` | Kotak callout |
| `--muted` | `39 15% 88%` | `bg-muted` | Area muted |
| `--muted-foreground` | `220 10% 42%` | `text-muted-foreground` | Teks sekunder |
| `--accent` | `348 55% 62%` | `text-accent` | Aksen coral/salmon |
| `--border` | `33 20% 78%` | `border-border` | Garis tepi warm |
| `--ring` | `220 15% 18%` | `ring-ring` | Focus ring |
| `--radius` | `0.25rem` | `rounded` | Border radius global |

### Sticky Notes

| Token | HSL | Visual |
|---|---|---|
| `--sticky-yellow` | `48 85% 80%` | 🟡 Pastel kuning |
| `--sticky-green` | `140 40% 78%` | 🟢 Pastel sage |
| `--sticky-pink` | `340 50% 85%` | 🩷 Pastel pink |
| `--sticky-blue` | `210 50% 82%` | 🔵 Pastel baby blue |
| `--sticky-orange` | `25 80% 82%` | 🟠 Pastel peach |

### Marker Pen (Spidol)

| Token | HSL | Visual | Pemakaian |
|---|---|---|---|
| `--marker-red` | `355 70% 50%` | 🔴 | Angka besar, underline, aksen |
| `--marker-blue` | `220 65% 45%` | 🔵 | Teks "Bukan hype chasers", SVG aksen |
| `--marker-green` | `150 50% 38%` | 🟢 | Coretan SVG scribble |
| `--marker-black` | `220 15% 18%` | ⚫ | Headings, teks utama |

---

## Typography

### Fonts

| Font | CSS Class | Usage |
|---|---|---|
| **Permanent Marker** | `font-hand` | Semua heading, teks yang ingin ditekankan (casual, seperti tulisan spidol) |
| **Space Grotesk** | `font-body` | Body text, deskripsi, navigasi, UI elements (geometric sans-serif modern) |

Keduanya di-import dari Google Fonts di `src/index.css`.

### Font Scale

| Level | Ukuran | Font | Contoh Pemakaian |
|---|---|---|---|
| Hero heading | `text-5xl` – `text-8xl` | `font-hand` | "We Build AI with AI." |
| Section title | `text-3xl` – `text-5xl` | `font-hand` | "Fitur Komunitas" |
| Feature title | `text-2xl` | `font-hand` | "Daily Discussions" |
| Body primary | `text-base` – `text-lg` | `font-body` | Deskripsi fitur |
| Body secondary | `text-sm` | `font-body` | Subtitle, meta info |
| Muted / legal | `text-xs` | `font-body` | Footer copyright |

### Efek Teks Kustom

- **`rough-underline`** — underline tebal ala stabilo (6px, 88% dari atas, warna marker-red 40% opacity). Dipakai untuk kata "shipping" dan "nge-build!"
- **`sketch-border`** — border sketch dengan radius asimetris `2px 8px 4px 12px`, memberi kesan digunting tangan

---

## Layout & Spacing

### Container Widths

| Section | Max Width | Notes |
|---|---|---|
| Hero | `max-w-3xl` (768px) | Fokus ke teks |
| Features Grid | `max-w-5xl` (1024px) | Grid 2 kolom |
| Social Proof | `max-w-6xl` (1152px) | Marquee lebar |
| Why + CTA | `max-w-3xl` (768px) | Teks sentral |

### Section Padding

- Vertikal: `py-16 md:py-24` (4rem mobile, 6rem desktop)
- Horizontal: `px-4`
- Container wrapper: `max-w-7xl mx-auto px-8`

### Grid

- Features: `grid-cols-1 md:grid-cols-2 gap-6 md:gap-8`
- Setiap sticky note punya rotasi unik: -2°, 1.5°, -1°, 2°

### Breakpoint

- Mobile-first, breakpoint `md:` = 768px
- Mobile detection hook: `use-mobile.tsx` (matchMedia < 768px)

---

## Komponen Custom

### StickyNote (`src/components/StickyNote.tsx`)

Komponen reusable untuk kartu bergaya sticky notes.

**Props:**
- `color`: `'yellow' | 'green' | 'pink' | 'blue' | 'orange'` — pilihan warna
- `rotate`: `number` — derajat rotasi (default -2)
- `tape?: boolean` — tampilkan masking tape di atas
- `icon`: React node — ikon Lucide
- `title`: string — judul (font-hand)
- `description`: string — deskripsi (font-body)

**Behavior:**
- Spring animation saat masuk viewport (Framer Motion)
- Hover: scale 1.03 + reset rotasi ke 0
- Border-radius sketch: `2px 8px 12px 4px`
- Drop shadow via class `sticky-shadow`

### HeroSection (`src/components/HeroSection.tsx`)

- Full height min-90vh
- Dekorasi SVG: ellipse dashed merah (top-right), panah biru (bottom-left) — opacity rendah
- Heading: hand font + emoji bendera Indonesia
- CTA button: `bg-foreground text-background` + `sketch-border` + hover scale & shadow

### SocialProofSection (`src/components/SocialProofSection.tsx`)

- Marquee carousel 21 logo perusahaan (Clearbit API + fallback Google Favicon)
- Grayscale → full-color on hover
- Marquee pause on hover
- "1,400+" member count dengan marker-red underline

### WhySection (`src/components/WhySection.tsx`)

- Scribble SVG hijau (top-left)
- Callout box: `bg-secondary` + `sketch-border` + rotate -1°
- Pesan komunitas: "Build build build build buiiiiillddd let's gooooo"

### CTASection (`src/components/CTASection.tsx`)

- Dua CTA button (Hero + Footer),指向 Google Form yang sama
- Kontak: email + phone (clickable)
- Footer: "Part of Bahni & Co. · PT Teknologi Tepat Sasaran"

---

## Animasi

### Framer Motion (Entrance)

Semua section menggunakan `whileInView` + `viewport={{ once: true }}` — animasi masuk satu kali saat di-scroll.

#### HeroSection (stagger)
| Elemen | Delay | Animasi |
|---|---|---|
| Heading (Emoji) | 0s | fade-up + y: 30→0 |
| Subtitle | 0.3s | fade-in |
| Description | 0.5s | fade-in |
| CTA Button | 0.7s | fade-in |

#### StickyNote (spring)
- `initial`: scale 0.85, opacity 0.5, y 40
- `whileInView`: scale 1, opacity 1, y 0
- `transition`: `type: "spring", stiffness: 120, damping: 15`

### Tailwind Keyframes (tailwind.config.ts)

| Nama | Keyframes | Durasi | Penggunaan |
|---|---|---|---|
| `wiggle` | rotate -1° ↔ 1° | 3s infinite | Hover effect |
| `marquee` | translateX 0% → -50% | 60s linear infinite | Logo carousel |
| `accordion-down` | height 0 → auto | — | shadcn accordion |
| `accordion-up` | height auto → 0 | — | shadcn accordion |

---

## Tone Visual

| Elemen | Kesan |
|---|---|
| Kraft paper background | Hangat, tactile, tidak digital |
| Dot grid overlay | Notebook / bullet journal |
| Hand-drawn font (Permanent Marker) | Coretan whiteboard, tidak formal |
| Sticky notes + masking tape | Brainstorming wall, workshop vibe |
| Sketch borders | Digunting tangan, imperfect |
| Marker pen colors (red, blue, green) | Stabilo, highlighter |
| Rotasi organik (1-2°) | Tidak kaku, handmade feel |

---

## Teknis

### Environment

| Tool | Versi / Config |
|---|---|
| Tailwind CSS | 3.4, dengan `tailwindcss-animate` + `@tailwindcss/typography` |
| PostCSS | `tailwindcss` + `autoprefixer` |
| CSS Custom Properties | Semua warna sebagai HSL di `:root` |
| Utility classes | `bg-dotgrid`, `sticky-shadow`, `tape-top`, `rough-underline`, `sketch-border` |

### Definisi Tailwind (tailwind.config.ts)

```ts
colors: {
  border, input, ring, background, foreground,
  primary, secondary,
  destructive, destructive-foreground,
  muted, muted-foreground,
  accent, accent-foreground,
  card, card-foreground,
  popover, popover-foreground,
  sticky: { yellow, green, pink, blue, orange },
  marker: { red, blue, green, black },
},
fontFamily: {
  hand: ['"Permanent Marker"', 'cursive'],
  body: ['"Space Grotesk"', 'sans-serif'],
},
```

### CSS Custom Utilities (src/index.css)

```css
.bg-dotgrid {
  background-image: radial-gradient(circle, ...);
  background-size: 24px 24px;
}
.sticky-shadow {
  box-shadow: 2px 3px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06);
}
.rough-underline {
  background-image: linear-gradient(...marker-red at 40%...);
  background-size: 100% 6px;
  background-position: 0 88%;
}
.sketch-border {
  border: 2px solid;
  border-radius: 2px 8px 4px 12px;
}
```

---

## Status & Catatan

- **shadcn/ui** ter-install lengkap (~45 komponen) tapi belum semuanya dipakai di landing page — tersedia untuk pengembangan ke depan.
- Semua konten berbahasa **Indonesia**, menargetkan audiens Indonesia.
- Satu-satunya conversion goal: **Google Form → WhatsApp Group**.
- Landing page adalah **static SPA** — no SSR, no server. Build output di `dist/`.

---

*Dibuat dengan 💙 oleh AI Builders Indonesia*
