# DESIGN.md — SARA: SDGs Accountability and Risk Analytics

Dokumen ini adalah spesifikasi desain (design spec) yang diturunkan dari mockup dashboard SARA, dibuat agar bisa langsung diimplementasikan sebagai komponen **Next.js (App Router) + Tailwind CSS**, terhubung ke **Firebase Firestore**.

---

## 1. Ringkasan Proyek

**SARA** (SDGs Accountability and Reporting for Action) adalah dashboard untuk memantau program SDGs mahasiswa/pelajar: skor dampak (impact score), jadwal monitoring, aktivitas, notifikasi sistem, dan distribusi program per Goal.

- **Layout**: 3 kolom — Sidebar navigasi (kiri, tetap/fixed), Konten utama (tengah, scrollable), Panel info (kanan, tetap/fixed).
- **Mood**: bersih, modern, "data-forward", ramah untuk *judging* lomba (first impression kuat, transisi halus, warna SDG resmi sebagai aksen visual utama).

---

## 2. Tech Stack

| Layer | Pilihan | Alasan |
|---|---|---|
| Framework | Next.js 14+ (App Router) | Routing fleksibel, SSR/ISR, cepat di-deploy ke Vercel |
| Styling | Tailwind CSS | Konsisten dengan token desain di bawah, cepat untuk *slicing* |
| Komponen UI | shadcn/ui (opsional) | Card, Dialog, Dropdown, Avatar siap pakai, gampang di-restyle pakai token warna sendiri |
| Ikon | lucide-react | Gaya *line icon* sama seperti pada mockup (Feature Cards) |
| Chart | Recharts | Untuk grafik "Distribution of Student SDGs Programs by Goal" |
| Auth & DB | Firebase Auth + Firestore | Real-time, gratis untuk skala lomba/demo |
| Deploy | Vercel | Native untuk Next.js |

---

## 3. Design Tokens

### 3.1 Warna Inti

```css
:root {
  /* Brand / Primary */
  --color-primary: #12A594;       /* Teal utama: sidebar aktif, hero, tombol solid, card fitur */
  --color-primary-dark: #0C8377;  /* Hover / gradient akhir pada hero banner */
  --color-primary-light: #E4F6F3; /* Background hover item sidebar / badge lembut */

  /* Neutral */
  --color-bg: #F7F8F9;            /* Background halaman */
  --color-surface: #FFFFFF;       /* Card, sidebar, topbar */
  --color-border: #ECEEF0;        /* Garis pemisah tipis */
  --color-text-primary: #16191D;  /* Judul, teks utama */
  --color-text-secondary: #8A9099;/* Sub-label, teks sekunder (mis. "admin", tanggal kecil) */
  --color-muted-card: #F1F3F4;    /* Card jadwal non-aktif (mis. tanggal 2024) */

  /* Status */
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-danger: #E5243B;
}
```

> Catatan: nilai hex di atas adalah estimasi visual dari mockup. Jika butuh presisi 1:1, ambil sample warna langsung dari file desain asli (Figma/PSD) dengan color picker sebelum finalisasi.

### 3.2 Warna Resmi 17 SDG Icons

Grid 17 ikon di hero menggunakan palet warna resmi PBB — pertahankan warna ini agar tetap sesuai standar SDGs:

| # | Goal | Hex |
|---|---|---|
| 1 | No Poverty | `#E5243B` |
| 2 | Zero Hunger | `#DDA63A` |
| 3 | Good Health & Well-being | `#4C9F38` |
| 4 | Quality Education | `#C5192D` |
| 5 | Gender Equality | `#FF3A21` |
| 6 | Clean Water & Sanitation | `#26BDE2` |
| 7 | Affordable & Clean Energy | `#FCC30B` |
| 8 | Decent Work & Economic Growth | `#A21942` |
| 9 | Industry, Innovation & Infrastructure | `#FD6925` |
| 10 | Reduced Inequalities | `#DD1367` |
| 11 | Sustainable Cities & Communities | `#FD9D24` |
| 12 | Responsible Consumption & Production | `#BF8B2E` |
| 13 | Climate Action | `#3F7E44` |
| 14 | Life Below Water | `#0A97D9` |
| 15 | Life on Land | `#56C02B` |
| 16 | Peace, Justice & Strong Institutions | `#00689D` |
| 17 | Partnerships for the Goals | `#19486A` |

Simpan sebagai `lib/sdgColors.ts`:

```ts
export const SDG_COLORS: Record<number, { name: string; color: string }> = {
  1: { name: "No Poverty", color: "#E5243B" },
  2: { name: "Zero Hunger", color: "#DDA63A" },
  3: { name: "Good Health and Well-being", color: "#4C9F38" },
  4: { name: "Quality Education", color: "#C5192D" },
  5: { name: "Gender Equality", color: "#FF3A21" },
  6: { name: "Clean Water and Sanitation", color: "#26BDE2" },
  7: { name: "Affordable and Clean Energy", color: "#FCC30B" },
  8: { name: "Decent Work and Economic Growth", color: "#A21942" },
  9: { name: "Industry, Innovation and Infrastructure", color: "#FD6925" },
  10: { name: "Reduced Inequalities", color: "#DD1367" },
  11: { name: "Sustainable Cities and Communities", color: "#FD9D24" },
  12: { name: "Responsible Consumption and Production", color: "#BF8B2E" },
  13: { name: "Climate Action", color: "#3F7E44" },
  14: { name: "Life Below Water", color: "#0A97D9" },
  15: { name: "Life on Land", color: "#56C02B" },
  16: { name: "Peace, Justice and Strong Institutions", color: "#00689D" },
  17: { name: "Partnerships for the Goals", color: "#19486A" },
};
```

### 3.3 Tipografi

- Font: **Inter** atau **Plus Jakarta Sans** (sans-serif geometris, mudah dibaca di dashboard data-heavy).
- Load via `next/font/google` agar otomatis dioptimasi Next.js.

| Token | Ukuran | Weight | Penggunaan |
|---|---|---|---|
| `text-display` | 28–32px | 700 | Judul hero "SARA Youth SDGs..." |
| `text-h2` | 20px | 600 | Judul section: "Feature", "Distribution of..." |
| `text-h3` | 16px | 600 | Judul card / item list |
| `text-body` | 14px | 400 | Teks umum |
| `text-caption` | 12px | 400–500 | Label sekunder, tanggal, "admin" |

```ts
// app/layout.tsx
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
```

### 3.4 Spacing, Radius & Shadow

```css
--radius-sm: 8px;    /* input, badge */
--radius-md: 14px;   /* card umum */
--radius-lg: 20px;   /* hero banner, panel besar */
--radius-full: 999px;/* avatar, tombol pill, icon bell */

--shadow-card: 0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06);

--space-gutter: 24px; /* jarak antar kolom utama (sidebar/main/panel) */
--space-card-gap: 16px;
```

Grid utama halaman (Tailwind):

```
grid-cols-[240px_1fr_300px] gap-6
```

---

## 4. Struktur Layout

```
┌───────────┬─────────────────────────────────────────┬───────────────┐
│  SIDEBAR  │  TOPBAR (search · filter · notif)        │  Admin Profile│
│           ├─────────────────────────────────────────┤───────────────│
│  Logo     │  HERO: judul + CTA   |  Grid 17 ikon SDG │  Monitoring   │
│  Dashboard│                                          │  Schedule     │
│  SDGs...  ├─────────────────────────────────────────┤───────────────│
│  Impact...│  FEATURE (5 kartu ikon)                  │  Activities   │
│  Reports  ├─────────────────────────────────────────┤───────────────│
│  Settings │  Distribution chart (bar/heatmap by Goal)│  System       │
│           │                                          │  Notification │
│  Account  │                                          │               │
│  Sign Out │                                          │               │
│  Help     │                                          │               │
└───────────┴─────────────────────────────────────────┴───────────────┘
```

Breakpoint: sidebar & panel kanan collapse jadi drawer/off-canvas di bawah `lg` (1024px); grid utama jadi 1 kolom.

---

## 5. Breakdown Komponen

### 5.1 `<Sidebar />`
- Logo "SARA" (mark + wordmark 2 baris kecil: "SDGs Accountability and Risk Analytics").
- Menu utama (state aktif = background `--color-primary`, teks putih, `rounded-xl`):
  `Dashboard, SDGs Programs, Impact Assessment, Impact Insights, SDGs Reports, Settings`
- Menu sekunder di bawah (dipisah jarak lebih besar, ikon outline abu-abu):
  `My Account, Sign Out, Help`
- Props: `activeRoute: string` → dicocokkan dengan `usePathname()` Next.js untuk highlight otomatis.

### 5.2 `<Topbar />`
- Search input full-width dengan ikon kaca pembesar, placeholder "Search Here".
- Ikon filter/slider (outline).
- Ikon bell dalam tombol bulat solid teal (badge notifikasi jika ada unread).

### 5.3 `<HeroBanner />`
- Container `rounded-2xl`, background gradient teal (`--color-primary` → `--color-primary-dark`, arah 135deg).
- Kiri: judul besar putih, subteks kecil, 2 tombol:
  - `Ghost/outline` — "View Risk Summary" (border putih, transparan)
  - `Solid putih` — "Access Monitoring Panel" (teks teal)
- Kanan: grid `5 kolom x 4 baris` ikon SDG 1–17 + 1 slot logo "THE GLOBAL GOALS" di posisi tengah (index ke-11). Tiap sel `aspect-square rounded-md`, background sesuai `SDG_COLORS`.

### 5.4 `<FeatureGrid />`
Section header: judul "Feature" + link teks "See All" (kanan, warna primary).
5 kartu persegi (`rounded-2xl`, background `--color-primary`, ikon garis warna gelap/hitam di atas, label 2 baris putih/gelap bold di bawah):
1. SDGs Mapping Panel
2. Impact Score Indicator
3. Impact Indicator Tracker
4. SDGs Impact Report
5. Improvement Recommendation Panel

### 5.5 `<DistributionChart />`
Section header sama pola: judul "Distribution of Student SDGs Programs by Goal" + "See All".
Chart bar horizontal/heatmap, tiap baris = kategori program, kolom = 17 Goal berwarna sesuai `SDG_COLORS`, sel diberi intensitas (opacity) sesuai `impact_score`. Gunakan Recharts `BarChart` custom atau grid CSS kalau butuh tampilan heatmap persis seperti mockup.

### 5.6 Panel Kanan
- **`<AdminProfile />`**: avatar bulat + nama "Admin" + role kecil "admin", rata kanan atas.
- **`<MonitoringSchedule />`**: list 2 kartu tanggal berdampingan:
  - Kartu aktif (akan datang) → background `--color-primary`, teks putih, angka tanggal besar.
  - Kartu lampau/nonaktif → background `--color-muted-card`, teks abu-abu.
  Tiap kartu: bulan+tahun kecil di atas, tanggal besar, judul event di bawah (mis. "Impact Review Meeting").
- **`<ActivitiesList />`**: baris pill `rounded-full`/`rounded-xl`, item pertama highlight solid teal (status aktif/pinned), sisanya outline/soft teal dengan ikon kecil kotak di kiri.
- **`<SystemNotification />`**: card solid teal, teks pesan singkat (mis. "SDG 4 Impact Report Successfully Submitted").
- Tiap panel punya header + menu titik tiga (`⋯`) untuk aksi (lihat semua / opsi).

---

## 6. Struktur Folder Next.js (App Router)

```
app/
  layout.tsx                 # font, providers (Auth context)
  page.tsx                   # redirect ke /dashboard atau /login
  (auth)/
    login/page.tsx
  (dashboard)/
    layout.tsx                # Sidebar + Topbar + Right Panel shell
    dashboard/page.tsx        # Hero + Feature + Chart
    sdgs-programs/page.tsx
    impact-assessment/page.tsx
    impact-insights/page.tsx
    sdgs-reports/page.tsx
    settings/page.tsx
components/
  layout/Sidebar.tsx
  layout/Topbar.tsx
  layout/RightPanel.tsx
  dashboard/HeroBanner.tsx
  dashboard/SdgIconGrid.tsx
  dashboard/FeatureGrid.tsx
  dashboard/DistributionChart.tsx
  dashboard/MonitoringSchedule.tsx
  dashboard/ActivitiesList.tsx
  dashboard/SystemNotification.tsx
  ui/                          # shadcn/ui primitives
lib/
  firebase.ts                  # init app, auth, firestore
  sdgColors.ts
  services/
    schedules.ts                # getSchedules()
    activities.ts                # getActivities()
    notifications.ts
    sdgPrograms.ts
```

---

## 7. Struktur Database Firestore

| Collection | Field Utama | Tipe | Fungsi |
|---|---|---|---|
| `users` | `uid`, `name`, `role`, `avatar_url` | String | Data admin yang login (Admin Profile) |
| `schedules` | `title`, `date`, `month`, `year`, `is_upcoming` | String/Timestamp/Boolean | Monitoring Schedule (2 kartu tanggal) |
| `activities` | `title`, `status`, `created_at` | String/Timestamp | Activities list |
| `notifications` | `message`, `is_read`, `created_at` | String/Boolean/Timestamp | System Notification |
| `sdg_programs` | `program_name`, `sdg_goal` (1–17), `impact_score` | String/Number | Data mentah untuk Distribution Chart |

Contoh service fetch (`lib/services/schedules.ts`):

```ts
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getSchedules() {
  const q = query(collection(db, "schedules"), orderBy("date", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
```

---

## 8. Responsive Behavior

| Breakpoint | Perilaku |
|---|---|
| `≥1280px` | Layout 3 kolom penuh seperti mockup |
| `1024–1279px` | Panel kanan menyempit, font/padding sedikit dikecilkan |
| `768–1023px` | Sidebar jadi collapsible drawer (toggle via ikon hamburger di Topbar); panel kanan pindah ke bawah konten utama |
| `<768px` | Semua section jadi 1 kolom vertikal; grid SDG icon jadi 4 atau 3 kolom; feature cards jadi scroll horizontal |

---

## 9. Motion & Interaksi

- Satu momen animasi utama: *stagger fade-in* ringan (100ms delay antar item) saat 17 ikon SDG pertama kali render — jangan animasikan semua elemen halaman sekaligus.
- Hover pada Feature Card & Activity item: `scale-[1.02]` + shadow naik tipis, transisi 150ms.
- Chart: animasikan tinggi/opacity bar saat data pertama kali masuk (`recharts` sudah punya ini secara default — cukup aktifkan `isAnimationActive`).
- Hormati `prefers-reduced-motion`: nonaktifkan transisi non-esensial jika user mengaktifkan setting ini di OS.

---

## 10. Ringkasan Roadmap Eksekusi

1. **Hari 1** — Init Next.js + Tailwind + Firebase project (Auth + Firestore) + shadcn/ui.
2. **Hari 2–3** — Slicing layout (Sidebar, Topbar, Hero + SDG grid, Feature cards, Right panel).
3. **Hari 4** — Buat collections Firestore di atas + dummy data + service fetch.
4. **Hari 5–6** — Auth login, hubungkan data real-time ke UI, build Distribution Chart pakai Recharts.
5. **Hari 7** — Polish state (loading/empty/error), pastikan responsif, deploy ke Vercel.

**Prioritas untuk lomba**: selesaikan tampilan visual & smoothness navigasi dulu sebelum memperdalam fungsionalitas backend — first impression UI/UX biasanya dinilai lebih dulu oleh juri.
