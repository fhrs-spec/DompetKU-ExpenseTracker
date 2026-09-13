# DompetKU

Aplikasi web pencatat keuangan pribadi untuk mengelola pemasukan, pengeluaran, dan target tabungan bulanan. Dilengkapi pencatatan cerdas berbasis Google Gemini AI, visualisasi analitik interaktif, audit kesehatan arus kas, dan ekspor laporan PDF.

## Screenshot

### Desktop
![DompetKU Desktop](./public/screenshots/desktop-dashboard.svg)

### Mobile
<p align="center">
  <img src="./public/screenshots/mobile-dashboard.svg" alt="DompetKU Mobile" width="360" />
</p>

## Tech Stack

- **Framework**: Next.js 15 (App Router, Server Actions)
- **Library UI**: React 19, Tailwind CSS, Lucide React
- **Bahasa**: TypeScript (Strict Mode)
- **Database & Auth**: Supabase PostgreSQL, `@supabase/ssr` (Row Level Security)
- **AI Engine**: Google Gemini API (`@google/genai`, model `gemini-3.6-flash`)
- **Form & Validasi**: React Hook Form, Zod
- **Visualisasi Data**: Recharts
- **Ekspor Dokumen**: jsPDF, jspdf-autotable
- **State & Tema**: next-themes, Sonner

## Fitur Utama

- **Autentikasi & Akun**:
  - Registrasi, login, logout, dan proteksi rute berbasis session Supabase SSR.
  - Row Level Security (RLS) pada seluruh tabel untuk memastikan isolasi data per pengguna.
- **Pencatatan Cerdas AI (Google Gemini Flash)**:
  - **Natural Language Parsing**: Catat transaksi dengan mengetik kalimat bebas berbahasa Indonesia (contoh: *"Beli kopi kenangan 25rb tadi siang"* atau *"Gaji kantor 5jt kemarin"*).
  - **1-Click Direct Save**: Opsi untuk mengekstrak dan langsung menyimpan transaksi ke database Supabase dalam satu klik atau tombol Enter.
  - **Isi Formulir Otomatis**: Opsi untuk memetakan hasil ekstraksi ke formulir jika pengguna ingin meninjau atau mengedit sebelum menyimpan.
  - **Validasi Kategori Otomatis**: Memetakan kategori transaksi secara akurat ke kategori baku sistem (*Food*, *Transport*, *Shopping*, *Salary*, dll.).
- **Audit Kesehatan Finansial AI (Financial Advisor)**:
  - Diagnosis arus kas bulanan otomatis di halaman Analitik.
  - **Skor Kesehatan Finansial (0–100)** dengan indikator status (*Sehat*, *Perlu Perhatian*, *Kritis*).
  - **Temuan Kunci (Key Findings)**: Mengidentifikasi pos pengeluaran dominan dan rasio tabungan.
  - **Rekomendasi Taktis**: Langkah nyata terukur untuk efisiensi anggaran dan alokasi dana darurat.
  - **Client-side Caching**: Menyimpan hasil audit per bulan di browser untuk menghemat kuota API.
- **Dashboard Finansial**:
  - Ringkasan total saldo kumulatif, pemasukan bulanan, pengeluaran bulanan, dan net savings.
  - Quick-Add modal untuk pencatatan instan tanpa berpindah halaman.
  - Daftar transaksi terbaru dan widget progres target tabungan aktif.
- **Manajemen Transaksi (CRUD)**:
  - Tambah, ubah, dan hapus transaksi dengan dialog konfirmasi.
  - Filter berdasarkan tipe (*income*/*expense*), kategori, dan rentang tanggal.
  - Pencarian kata kunci real-time pada judul dan catatan transaksi.
  - Pemformatan mata uang otomatis Rupiah (IDR).
- **Analitik & Visualisasi Data**:
  - Bar chart perbandingan pemasukan vs pengeluaran bulanan.
  - Donut chart distribusi pengeluaran per kategori beserta persentase alokasi.
  - Line chart akumulasi tren saldo harian.
  - Komparasi tren multi-bulan (histori 6 bulan terakhir).
- **Target Tabungan (Savings Goals)**:
  - Pelacakan nominal target, saldo terkumpul, dan tanggal tenggat waktu.
  - Bar progres persentase capaian target.
  - Modal setoran cepat dengan preset nominal (+Rp 50rb, +Rp 100rb, dll.).
- **Ekspor Dokumen PDF**:
  - Unduh laporan keuangan bulanan lengkap (ringkasan metrik, distribusi pos, tabel rincian transaksi).
  - Digenerate secara instan di sisi browser tanpa perantara server pihak ketiga.
- **Dark Mode**: Dukungan tema gelap dan terang tersinkronisasi otomatis via `next-themes`.

## Skema Database

Aplikasi berjalan di atas PostgreSQL Supabase dengan Row Level Security (RLS) aktif di seluruh tabel:

- `profiles`: Data profil pengguna yang terhubung dengan `auth.users` via database trigger.
- `transactions`: Data transaksi pemasukan dan pengeluaran (`user_id`, `title`, `amount`, `type`, `category`, `transaction_date`, `note`).
- `savings_goals`: Data target tabungan pengguna (`user_id`, `goal_name`, `target_amount`, `current_amount`, `deadline`).

Definisi DDL dan kebijakan RLS lengkap dapat dilihat pada [`supabase/schema.sql`](./supabase/schema.sql).

## Panduan Instalasi & Menjalankan Lokal

### 1. Clone Repository

```bash
git clone https://github.com/fhrs-spec/DompetKU-ExpenseTracker.git
cd DompetKU-ExpenseTracker
```

### 2. Install Dependensi

```bash
npm install
```

### 3. Konfigurasi Environment Variables

Salin template environment:

```bash
cp .env.example .env.local
```

Buka `.env.local` dan isi kredensial project Anda:

```env
# Supabase (dari Project Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Google Gemini AI (dari aistudio.google.com)
GEMINI_API_KEY=your-gemini-api-key
```

### 4. Inisialisasi Database Supabase

Buka menu **SQL Editor** pada dashboard Supabase Anda, lalu jalankan seluruh isi skrip [`supabase/schema.sql`](./supabase/schema.sql).

### 5. Jalankan Server Pengembangan

```bash
npm run dev
```

Buka `http://localhost:3000` pada browser.

## Struktur Direktori

```text
src/
├── app/                  # Route handlers, pages, layout, dan Server Actions
│   ├── (auth)/           # Halaman login & register
│   ├── actions/          # Server Actions (AI parsing & health audit)
│   ├── analytics/        # Halaman visualisasi analitik & AI advisor
│   ├── api/              # Route API endpoints
│   ├── dashboard/        # Halaman dashboard utama
│   ├── goals/            # Halaman savings goals
│   └── transactions/     # Halaman dan server actions CRUD transaksi
├── components/           # Komponen UI modular
│   ├── analytics/        # Komponen AI advisor card & laporan
│   ├── charts/           # Visualisasi chart Recharts & month-year picker
│   ├── dashboard/        # Widget ringkasan saldo & quick-add modal
│   ├── goals/            # Card target tabungan & deposit modal
│   ├── layout/           # AppLayout, sidebar navigasi, header
│   ├── transactions/     # Form transaksi & AI quick input bar
│   └── ui/               # Primitif UI (Button, Input, Modal, Badge, dll.)
├── lib/
│   ├── ai/               # Klien Google Gemini, parser prompt, financial advisor
│   ├── db/               # Query data PostgreSQL Supabase
│   ├── pdf/              # Generator ekspor dokumen jsPDF
│   ├── supabase/         # Inisialisasi client, server, dan middleware Supabase
│   ├── utils/            # Utilitas helper (format currency, format date, cn)
│   └── validations/      # Validasi skema formulir Zod
└── types/                # Definisi tipe TypeScript & skema database
supabase/
└── schema.sql            # Skrip DDL PostgreSQL, RLS policies, dan user triggers
```

## Lisensi

[MIT](LICENSE)
