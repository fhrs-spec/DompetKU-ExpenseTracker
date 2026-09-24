# DompetKU — Mobile Web UI/UX Audit Report
**Evaluator:** Mobile Web UI/UX Specialist & Senior Frontend Design Auditor (fhrs-spec)  
**Target Viewport:** 320px — 430px (iPhone SE, iPhone 13/14/15/16 Pro, Samsung Galaxy S23/S24, Google Pixel)  
**Audit Scope:** Shell Navigation, Dashboard, Transactions & AI Scanner, Analytics & Recharts, Goals, Auth  
**Date:** 24 September 2026  
**Status:** Audit Lengkap & Rekomendasi Solusi  

---

## 1. Executive Summary (Ringkasan Eksekutif)

Aplikasi **DompetKU** memiliki fondasi frontend modern yang sangat solid berbasis Next.js 15 (App Router), Tailwind CSS, dan Lucide Icons dengan skema warna yang elegan (*emerald/zinc*), tema dark/light otomatis, serta alur form yang tervalidasi Zod. Fitur baru seperti **AI Receipt Scanner (OCR Struk Belanja)** dan **AI Financial Health Check** berjalan cepat berkat kompresi gambar berbasis HTML5 Canvas di sisi klien.

Namun, dari perspektif **Mobile Web UI/UX Specialist & Thumb Zone Ergonomics**, aplikasi DompetKU saat ini lebih banyak mengadopsi pola *desktop-first responsive* daripada *mobile-first native app-like experience*. Terdapat beberapa isu kritis yang langsung memengaruhi kenyamanan pengguna smartphone:
1. **Ketiadaan Mobile Bottom Navigation Bar:** Pengguna dipaksa menjangkau tombol hamburger di pojok kiri atas (zona terjauh jempol/Thumb Danger Zone) untuk berpindah halaman.
2. **Masalah iOS Auto-Zoom (Font Size < 16px pada Input):** Sejumlah input teks krusial (termasuk AI Quick Input dan filter transaksi) menggunakan `text-xs` (12px) dan `text-sm` (14px). Di Safari iOS, ini memicu *automatic viewport zoom-in* yang merusak tata letak mobile saat keyboard muncul.
3. **Touch Targets di Bawah Standar (< 44x44px):** Tombol aksi Edit dan Hapus pada daftar transaksi dan target tabungan hanya berukuran `32x32px` (`h-8 w-8`) dan diletakkan bersebelahan tanpa jarak aman, memperbesar risiko salah tekan (*accidental deletion*).
4. **Kepadatan Recharts pada Layar Sempit (< 380px):** Grafik batang arus kas bulanan memuat hingga 31 hari dalam satu layar sempit tanpa *horizontal scroll* atau *grouping*, menghasilkan batang yang sangat tipis (< 3px) dan sulit disentuh.

---

## 2. Skor Kesiapan Mobile (Mobile Readiness Score)

| Dimensi Penilaian | Bobot | Skor (0-100) | Keterangan |
|---|---|---|---|
| **Viewport & Layout Responsiveness (320px–430px)** | 20% | **82 / 100** | Tidak ada horizontal overflow fatal, namun padding dan kartu saldo ketat di 320px. |
| **Touch Targets & Thumb Zone (Ergonomi Jempol)** | 25% | **62 / 100** | Ketiadaan Bottom Bar; tombol aksi list `32x32px`; kamera AI `24x24px`. |
| **Mobile Form & Virtual Keyboard Usability** | 20% | **68 / 100** | Form rapi & sticky footer, namun terdampak iOS zoom 14px dan modal dialog terpotong keyboard. |
| **Tipografi & Kontras Visual Rupiah** | 15% | **88 / 100** | Font mono tajam, kontras warna status sangat baik; perlu auto-scaling angka besar. |
| **Data Visualization on Small Screens** | 10% | **65 / 100** | Donat chart responsif; Bar chart 31 hari terlalu padat untuk layar < 400px. |
| **Micro-interactions & Tactile Feel** | 10% | **80 / 100** | Transisi tombol & feedback Sonner prima; belum ada Bottom Sheet / gesture swipe. |
| **TOTAL SKOR KESIAPAN MOBILE** | **100%** | **74.1 / 100** | **Grade: B (Layak, Butuh Peningkatan Ergonomi Mobile)** |

---

## 3. Analisis Halaman per Halaman & Komponen Kunci

### 3.1. Shell Layout & Navigasi
**Berkas Terkait:**
- [`src/app/layout.tsx`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/app/layout.tsx#L23-L36)
- [`src/components/layout/app-layout.tsx`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/layout/app-layout.tsx#L12-L26)
- [`src/components/layout/app-header.tsx`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/layout/app-header.tsx#L45-L138)
- [`src/components/layout/app-sidebar.tsx`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/layout/app-sidebar.tsx#L52-L126)

#### Bukti Kode & Temuan:
1. **Ergonomi Navigasi Jempol Rendah ([`app-header.tsx#L48-L54`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/layout/app-header.tsx#L48-L54)):**
   Pada viewport mobile, navigasi disembunyikan di balik tombol Hamburger di pojok kiri atas. Untuk berpindah dari Transaksi ke Analitik, pengguna satu tangan harus meregangkan ibu jari ke area paling atas layar smartphone (6.1"–6.7").
2. **Ketiadaan Mobile Bottom Navigation Bar:**
   Tidak ada komponen navigasi bawah (*Bottom Navigation Bar*) tetap (*fixed bottom*). Standar modern aplikasi finansial mobile (seperti Jenius, BCA Mobile, Jago, Spendee) menempatkan 4 tab utama + tombol Quick Add di bagian bawah.
3. **Safe Area Inset Hilang ([`app-header.tsx#L45`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/layout/app-header.tsx#L45)):**
   Header hanya menggunakan `sticky top-0 h-16` tanpa `pt-[env(safe-area-inset-top)]` dan `pb-[env(safe-area-inset-bottom)]`. Pada iPhone berponi / Dynamic Island dalam mode PWA atau Safari standalone, status bar sistem dapat menabrak teks header.

---

### 3.2. Dashboard
**Berkas Terkait:**
- [`src/app/dashboard/page.tsx`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/app/dashboard/page.tsx#L31-L69)
- [`src/components/dashboard/balance-cards.tsx`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/dashboard/balance-cards.tsx#L28-L134)
- [`src/components/dashboard/recent-transactions.tsx`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/dashboard/recent-transactions.tsx#L41-L91)
- [`src/components/dashboard/monthly-overview-chart.tsx`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/dashboard/monthly-overview-chart.tsx#L47-L134)
- [`src/components/dashboard/quick-add-modal.tsx`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/dashboard/quick-add-modal.tsx#L14-L33)

#### Bukti Kode & Temuan:
1. **Risiko Text Clipping / Wrapping Saldo Rupiah ([`balance-cards.tsx#L40-L42`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/dashboard/balance-cards.tsx#L40-L42)):**
   Setiap kartu saldo menggunakan `p-6` (padding horizontal 48px). Pada layar 320px (iPhone SE generasi awal), lebar bersih kartu adalah $320 - 32 - 48 = 240\text{px}$. Tipografi nominal diatur sebagai `text-2xl font-extrabold font-mono`. Angka dengan 9-11 digit seperti `+Rp 125.500.000` (17 karakter monospace ~230px) nyaris menabrak batas kartu dan dapat terpotong atau turun baris secara kikuk.
2. **Transaksi Terkini Bukan Elemen Interaktif Sentuh ([`recent-transactions.tsx#L41-L90`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/dashboard/recent-transactions.tsx#L41-L90)):**
   Item transaksi di dashboard ditampilkan menggunakan tag `<div>`. Pengguna mobile secara alami menyentuh kartu baris untuk melihat rincian atau mengubah transaksi. Karena tidak dibungkus `<Link>`, pengguna bingung karena baris tidak responsif saat disentuh.
3. **Penyempitan Judul Transaksi ([`recent-transactions.tsx#L62-L64`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/dashboard/recent-transactions.tsx#L62-L64)):**
   `truncate max-w-[150px] sm:max-w-xs`. Bersama dengan Badge kategori dan angka nominal di sebelah kanan, judul transaksi terpotong terlalu dini bahkan untuk teks pendek 3 kata.

---

### 3.3. Transaksi, Form & AI Quick Scanner
**Berkas Terkait:**
- [`src/app/transactions/page.tsx`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/app/transactions/page.tsx#L77-L104)
- [`src/components/transactions/transaction-list.tsx`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/transactions/transaction-list.tsx#L148-L352)
- [`src/components/transactions/transaction-form.tsx`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/transactions/transaction-form.tsx#L171-L362)
- [`src/components/transactions/ai-quick-input.tsx`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/transactions/ai-quick-input.tsx#L176-L304)

#### Bukti Kode & Temuan:
1. **Touch Target Sub-standar (Pelanggaran WCAG 2.5.5) ([`transaction-list.tsx#L328-L347`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/transactions/transaction-list.tsx#L328-L347)):**
   Tombol Edit dan Hapus transaksi memiliki ukuran `h-8 w-8` (hanya 32x32px) dengan jarak hanya `gap-1` (4px). Pengguna dengan ukuran ibu jari rata-rata (10–12mm) rentan salah menekan tombol **Hapus** ketika bermaksud menekan tombol **Edit**.
2. **Kamera & Chip Trigger AI Terlalu Kecil ([`ai-quick-input.tsx#L215-L228`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/transactions/ai-quick-input.tsx#L215-L228)):**
   - Ikon kamera di dalam input AI memiliki ukuran `h-6 w-6` (24x24px) dengan padding sempit `left-2.5`. Pengguna seringkali tidak sengaja memfokuskan kursor teks alih-alih membuka kamera / file picker.
   - Chip contoh prompt (`ai-quick-input.tsx#L297`) menggunakan `text-[10px] px-2 py-0.5`, dengan tinggi fisik hanya ~22px, jauh di bawah standar target sentuh ergonomis (minimal 40–44px).
3. **Pemicu iOS Safari Auto-Zoom ([`ai-quick-input.tsx#L242`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/transactions/ai-quick-input.tsx#L242) & [`transaction-form.tsx#L207-L217`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/transactions/transaction-form.tsx#L207-L217)):**
   Pada browser iOS WebKit (Safari/Chrome di iPhone), setiap elemen `<input>` dengan ukuran font di bawah `16px` (`1rem`) akan menyebabkan browser otomatis melakukan **zoom-in mendadak** saat input di-tap. Ini membingungkan pengguna dan membuat layout tampak bergeser keluar layar.
   - Input AI: `text-xs sm:text-sm` (12px pada mobile).
   - Input Judul & Form: `text-sm` (14px).
4. **Header Tombol Transaksi Berhimpitan di 320px ([`src/app/transactions/page.tsx#L89-L97`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/app/transactions/page.tsx#L89-L97)):**
   Tombol `ExportPdfButton` ("Ekspor PDF", ~125px) dan `Catat Transaksi` (~150px) diletakkan bersisian (`gap-2.5`). Pada lebar 320px dikurangi padding halaman 32px (sisa 288px), kedua tombol ini melampaui lebar baris dan membentur sisi kanan layar jika tidak diatur `w-full` atau ditumpuk vertikal.

---

### 3.4. Analitik & Grafik (Recharts)
**Berkas Terkait:**
- [`src/app/analytics/page.tsx`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/app/analytics/page.tsx#L67-L116)
- [`src/components/charts/monthly-overview-chart.tsx`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/dashboard/monthly-overview-chart.tsx#L47-L134)
- [`src/components/charts/expense-pie-chart.tsx`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/charts/expense-pie-chart.tsx#L32-L113)
- [`src/components/charts/balance-line-chart.tsx`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/charts/balance-line-chart.tsx#L40-L110)
- [`src/components/charts/month-year-picker.tsx`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/charts/month-year-picker.tsx#L52-L78)
- [`src/components/analytics/ai-advisor-card.tsx`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/analytics/ai-advisor-card.tsx#L111-L288)

#### Bukti Kode & Temuan:
1. **Kepadatan Ekstrem Batang Recharts (31 Hari) ([`monthly-overview-chart.tsx#L50-L132`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/dashboard/monthly-overview-chart.tsx#L50-L132)):**
   Grafik harian merender data dari tanggal 1 sampai tanggal 31 (`lastDay`). Pada lebar layar smartphone 360px, lebar kanvas grafik sekitar 280px. Merender 31 grup batang (pemasukan & pengeluaran = 62 batang) menghasilkan lebar batang hanya sekitar 2–3px. Menyentuh batang tersebut dengan jari untuk memicu `Tooltip` sangat sulit.
2. **Kelebihan Komponen Positif:**
   - Donut Chart ([`expense-pie-chart.tsx`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/charts/expense-pie-chart.tsx#L32)) tertata rapi: grafik di atas, progress bar rincian kategori di bawah.
   - Kartu AI Financial Health Audit ([`ai-advisor-card.tsx`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/analytics/ai-advisor-card.tsx#L111)) menyajikan skor besar (2 digit), badge status, temuan, dan rekomendasi yang sangat jelas terbaca di mobile.
3. **Filter Periode Bulan/Tahun ([`month-year-picker.tsx#L52-L78`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/charts/month-year-picker.tsx#L52-L78)):**
   Dropdown menggunakan elemen native `<select>` di dalam pill wrapper. Pada layar kecil, bersama tombol `ExportPdfButton`, kontrol ini terbagi canggung jika tidak diberikan lebar penuh (`w-full`).

---

### 3.5. Target Tabungan (Goals)
**Berkas Terkait:**
- [`src/app/goals/page.tsx`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/app/goals/page.tsx#L6-L20)
- [`src/components/goals/savings-goals-client.tsx`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/goals/savings-goals-client.tsx#L61-L148)
- [`src/components/goals/savings-goal-card.tsx`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/goals/savings-goal-card.tsx#L58-L171)
- [`src/components/goals/deposit-modal.tsx`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/goals/deposit-modal.tsx#L70-L157)

#### Bukti Kode & Temuan:
1. **Tombol Tindakan Kartu Tabungan Berukuran Kecil ([`savings-goal-card.tsx#L88-L105`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/goals/savings-goal-card.tsx#L88-L105)):**
   Tombol Edit dan Hapus target tabungan sama-sama menggunakan `h-8 w-8` (32x32px).
2. **Preset Nominal Cepat pada Modal Nabung ([`deposit-modal.tsx#L127-L138`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/goals/deposit-modal.tsx#L127-L138)):**
   Chip `+Rp 50.000`, `+Rp 100.000` menggunakan `px-2.5 py-1 text-xs font-mono`. Tinggi tombol hanya ~26px. Sangat rawan salah sentuh ketika keyboard virtual sedang aktif.

---

### 3.6. Autentikasi (Login & Register)
**Berkas Terkait:**
- [`src/app/login/page.tsx`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/app/login/page.tsx#L59-L163)
- [`src/app/register/page.tsx`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/app/register/page.tsx#L68-L214)

#### Bukti Kode & Temuan:
1. **Kesesuaian Tampilan:**
   Halaman login dan register memiliki desain terpusat yang sangat bersih (`max-w-md`, rounded cards, icon prefix dalam input).
2. **Keyboard Push & Scrolling:**
   Halaman menggunakan `min-h-screen flex flex-col justify-center py-12`. Ketika keyboard muncul di smartphone berlayar pendek (misal tinggi viewport tersisa ~380px), kontainer form dapat digulir dengan aman.
3. **Catatan Input:**
   Input password dan email memiliki `h-11` (44px) yang memenuhi standar tinggi touch target, namun perlu penegasan ukuran font `text-base` di layar mobile agar bebas dari efek auto-zoom iOS.

---

## 4. Temuan Positif (Strengths)

1. **Kompresi Gambar Klien Efisien:** Fitur OCR struk belanja di [`ai-quick-input.tsx`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/transactions/ai-quick-input.tsx#L33-L78) mengompres foto berukuran 10MB menjadi ~200KB di Canvas sebelum dikirim ke API Gemini, sangat menghemat kuota seluler mobile dan waktu respon.
2. **Sticky Submit Actions:** Form transaksi ([`transaction-form.tsx#L328`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/transactions/transaction-form.tsx#L328)) mengimplementasikan tombol simpan sticky di bagian bawah modal (`sticky bottom-0 bg-card/95 backdrop-blur-sm`), memudahkan pengguna menyimpan tanpa harus scroll manual ke paling bawah.
3. **Hirarki Visual & Status Warna Tegas:** Indikator pemasukan (*emerald-600*), pengeluaran (*destructive/red*), dan status AI (*amber/gold*) memiliki kontras tinggi yang sangat mudah dipindai dengan cepat di bawah pencahayaan luar ruangan (outdoor).
4. **Modal Scrolling Containment:** Komponen [`Modal`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/ui/modal.tsx#L56-L78) menggunakan `max-h-[92dvh]` dengan `overflow-y-auto` dan `overscroll-contain`, mencegah efek *background rubber-banding* pada iOS Safari.

---

## 5. Ringkasan Masalah & Area Peningkatan

| ID | Prioritas | Komponen / Halaman | Masalah UX / Teknis | Dampak Pengguna |
|---|---|---|---|---|
| **C-01** | **Critical** | Shell Navigation | Tidak ada Mobile Bottom Navigation Bar; navigasi bertumpu pada hamburger di pojok kiri atas (Thumb Danger Zone). | Frustrasi navigasi satu tangan; alur perpindahan antar fitur utama lambat. |
| **C-02** | **Critical** | Form & AI Scanner | Font size input `< 16px` (`text-xs`/`text-sm`), memicu *iOS Safari auto-zoom* paksa saat keyboard muncul. | Tampilan melompat/zoom out of frame setiap kali mengetik di iPhone. |
| **C-03** | **Critical** | Transaction & Goals Lists | Tombol Edit & Hapus hanya berukuran `32x32px` (`h-8 w-8`) dengan jarak `4px`. | Pelanggaran WCAG 2.5.5; risiko tinggi terhapusnya data secara tidak sengaja (*mis-tap*). |
| **W-01** | **Warning** | Dashboard & Analytics Charts | Grafik batang 31 hari memuat 62 batang dalam layar sempit < 380px tanpa horizontal scroll. | Batang terlalu tipis (< 3px); tooltip hampir mustahil disentuh dengan jari. |
| **W-02** | **Warning** | Dashboard Balance Cards | Padding kartu `p-6` dan font saldo `text-2xl font-mono` berisiko clipping/wrapping pada layar 320px. | Angka nominal puluhan/ratusan juta tampak terpotong atau terbelah baris. |
| **W-03** | **Warning** | AI Quick Input Camera Icon | Touch target ikon kamera hanya `24x24px` di dalam input field. | Pengguna kesulitan menyentuh kamera; sering terpicu kursor teks. |
| **W-04** | **Warning** | Modal Dialog | Modal berbentuk floating card tengah alih-alih Bottom Sheet (Drawer). | Terpotong oleh keyboard virtual mobile; tidak ada gestur swipe down untuk menutup. |
| **R-01** | **Recommendation** | Dashboard Recent Transactions | Baris transaksi berupa tag `<div>` pasif tanpa tautan interaktif sentuh. | Kebiasaan alami pengguna smartphone mengetuk kartu tidak diakomodasi. |
| **R-02** | **Recommendation** | Shell Header | Belum ada penerapan `env(safe-area-inset-top)` & `bottom`. | Potensi tabrakan visual pada notch/Dynamic Island iOS. |
| **R-03** | **Recommendation** | Goals & Deposit Modal | Preset nominal cepat (`+50rb`, `+100rb`) hanya memiliki tinggi 26px. | Jempol sulit menekan nominal instan dengan presisi. |

---

## 6. Matriks Rekomendasi Solusi Konkret & Panduan Implementasi

### 6.1. Solusi C-01: Tambahkan Komponen Mobile Bottom Navigation Bar
Buat komponen `src/components/layout/bottom-nav.tsx` yang hanya muncul di layar kecil (`md:hidden`), ditempatkan `fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-md border-t border-border pb-[env(safe-area-inset-bottom)]`.
Sertakan 4 tab utama + 1 Quick Add action terpusat:
- **Dashboard** (`/dashboard`, Icon: `LayoutDashboard`)
- **Transaksi** (`/transactions`, Icon: `ArrowLeftRight`)
- **Catat (+)** (Floating / Elevated button di tengah, membuka `QuickAddModal`)
- **Analitik** (`/analytics`, Icon: `PieChart`)
- **Target** (`/goals`, Icon: `Target`)

Tambahkan padding bawah pada konten utama di mobile: `pb-20 md:pb-6` agar konten tidak tertutup bar bawah.

### 6.2. Solusi C-02: Atasi Masalah iOS Auto-Zoom pada Input Form
Standar industri: Semua elemen input pada mobile harus memiliki ukuran font minimal `16px` (`text-base`) pada layar kecil, dan dapat kembali ke `text-sm` (14px) pada layar desktop.
Ubah pada `src/components/ui/input.tsx`:
```tsx
// Sebelum:
className={cn("flex h-11 w-full ... text-sm ...", className)}

// Sesudah:
className={cn("flex h-11 w-full ... text-base sm:text-sm ...", className)}
```
Terapkan hal yang sama pada:
- [`src/components/transactions/ai-quick-input.tsx`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/transactions/ai-quick-input.tsx#L242): ubah `text-xs sm:text-sm` menjadi `text-base sm:text-sm`.
- Semua elemen `<select>` dan `<textarea>`.

### 6.3. Solusi C-03: Perbesar Touch Targets Tombol Aksi List (Minimal 44x44px)
Ubah tombol Edit dan Hapus pada `TransactionList` dan `SavingsGoalCard`:
```tsx
// Ganti:
<Button variant="ghost" size="icon" className="h-8 w-8 ...">

// Menjadi:
<Button variant="ghost" size="icon" className="h-10 w-10 sm:h-8 sm:w-8 p-2 ...">
```
Berikan jarak yang lebih aman (`gap-2`) antara tombol Edit dan Hapus, atau ubah menjadi menu titik tiga (*action sheet / context menu*) pada perangkat mobile untuk mengeliminasi salah klik data transaksi finansial.

### 6.4. Solusi W-01: Optimasi Grafik Batang Recharts untuk Layar Mobile
Pada [`monthly-overview-chart.tsx`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/dashboard/monthly-overview-chart.tsx):
- **Opsi A (Horizontal Scroll Wrapper):** Bungkus `<BarChart>` dalam kontainer dengan `min-w-[580px]` dan aktifkan `overflow-x-auto no-scrollbar` di mobile. Tambahkan label halus: *"Geser grafik untuk melihat hari lainnya"*.
- **Opsi B (Weekly Grouping di Mobile):** Jika lebar layar < 500px, agregasikan data menjadi 4-5 interval minggu (W1–W4) agar batang tetap tebal dan mudah disentuh.

### 6.5. Solusi W-02: Penyesuaian Tipografi Nominal Monospace di Layar Sempit
Pada [`balance-cards.tsx`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/dashboard/balance-cards.tsx):
- Ubah padding kartu: `p-4 sm:p-6`.
- Sesuaikan ukuran font saldo: `text-xl sm:text-2xl font-extrabold font-mono tracking-tight break-all sm:break-normal`.
- Dengan pengurangan padding 16px di layar kecil, tersedia ruang ekstra 32px untuk menjaga saldo miliaran rupiah tetap satu baris.

### 6.6. Solusi W-03: Perbesar Area Sentuh Kamera AI Quick Input
Pada [`ai-quick-input.tsx`](file:///d:/CODINGAN/PROJECT_PRIBADI/PORTOFOLIO_PROJECT/Expense%20Tracker%20%28DompetKU%29/src/components/transactions/ai-quick-input.tsx#L219):
- Berikan tombol kamera ukuran `h-9 w-9` (36x36px) dengan hit area 44px melalui padding transparan.
- Sesuaikan padding kiri input teks: `pl-11`.

---

## 7. Kesimpulan & Roadmap Implementasi

Secara keseluruhan, arsitektur frontend DompetKU dirancang dengan sangat bersih dan fungsional. Peningkatan antarmuka mobile ke standar **fhrs-spec Mobile Excellence** dapat dicapai dalam 3 fase cepat:

1. **Sprint 1 (Quick Ergonomic Fixes - 1-2 Jam):**
   - Atasi iOS auto-zoom (`text-base sm:text-sm`).
   - Perbesar touch targets tombol list dari 32px ke 40-44px.
   - Perbesar ikon kamera AI OCR ke hit area 40px+.
   - Turunkan padding Balance Cards di mobile menjadi `p-4`.
2. **Sprint 2 (Mobile Navigation Uplift - 2-3 Jam):**
   - Implementasikan Mobile Bottom Navigation Bar 5-slot (Dashboard, Transaksi, FAB Catat, Analitik, Goals).
   - Terapkan safe-area inset pada header dan footer.
   - Jadikan baris transaksi di Dashboard dapat diklik langsung (`<Link>`).
3. **Sprint 3 (Mobile Charts & Gestures - 2-3 Jam):**
   - Tambahkan horizontal swipeable container pada grafik Recharts harian.
   - Tingkatkan preset chip nominal tabungan ke minimal tinggi 38-44px.
   - Pertimbangkan Bottom Drawer (*vaul*) untuk form quick add mobile.
