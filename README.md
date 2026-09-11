# DompetKU — Personal Expense Tracker

Aplikasi pencatat keuangan pribadi modern dan minimalis yang dibangun dengan arsitektur **Next.js 15 (App Router)**, **React 19**, **TypeScript (strict mode)**, dan **Supabase PostgreSQL**. Dirancang khusus untuk memantau arus kas bulanan secara akurat, terstruktur, dan aman dengan isolasi data tingkat database (*Row Level Security*).

---

## 📸 Antarmuka Aplikasi (Preview)

### Desktop View (Dashboard)
![DompetKU Desktop Dashboard](./public/screenshots/desktop-dashboard.svg)

### Mobile View (Responsive)
<p align="center">
  <img src="./public/screenshots/mobile-dashboard.svg" alt="DompetKU Mobile Dashboard" width="360" />
</p>

---

## 🚀 Tech Stack

### Frontend & Core
* **Framework**: Next.js 15 (App Router, Server Components & Server Actions)
* **Library UI**: React 19
* **Bahasa**: TypeScript (Strict Mode)
* **Styling**: Tailwind CSS (Clean Fintech Indonesia Palette)
* **Ikon**: Lucide Icons
* **Tema**: `next-themes` (Dark Mode & Light Mode persistensi)

### Backend & Database
* **Database**: PostgreSQL (Supabase)
* **Autentikasi**: Supabase Auth (`@supabase/ssr` with HttpOnly session cookies)
* **Keamanan Data**: PostgreSQL Row Level Security (RLS) di seluruh tabel

### Libraries & Tooling
* **Form & Validasi**: React Hook Form + Zod
* **Visualisasi Data**: Recharts (Bar Chart, Donut/Pie Chart, Cumulative Area Chart)
* **Notifikasi Toast**: Sonner
* **Manipulasi Tanggal**: date-fns & Native Intl
* **Laporan PDF**: jsPDF + jspdf-autotable

---

## 🌟 Daftar Fitur

### 1. Autentikasi & Keamanan Sesi
* Registrasi akun baru dengan pencocokan konfirmasi password via Zod.
* Login aman dengan proteksi error kredensial dan feedback Sonner toast.
* Pembuatan baris profil otomatis via PostgreSQL trigger saat user mendaftar.
* Proteksi rute berbasis Next.js Middleware: halaman dasbor tidak dapat diakses tanpa sesi aktif, dan user terotentikasi otomatis dialihkan dari halaman login.

### 2. Dashboard Finansial Terpadu
* **4 Kartu Metrik Keuangan**: Total Saldo Kumulatif, Total Pemasukan Bulan Ini, Total Pengeluaran Bulan Ini, dan Tabungan Bersih (surplus/defisit dinamis).
* **Modal Quick Add**: Pencatatan transaksi kilat dalam 2 klik langsung dari dasbor.
* **Grafik Arus Kas Harian**: Visualisasi batang interaktif perbandingan pemasukan vs pengeluaran.
* **Aktivitas Terkini**: Daftar 5 transaksi terakhir dengan badge kategori dan pewarnaan nominal.
* **Widget Target Tabungan**: Ringkasan persentase capaian target tabungan aktif.

### 3. Manajemen Transaksi (CRUD Lengkap)
* Formulir pencatatan dengan pemilih jenis transaksi (Pemasukan / Pengeluaran).
* Pilihan kategori kontekstual:
  * *Pemasukan*: Salary, Bonus, Freelance, Gift, Other.
  * *Pengeluaran*: Food, Transport, Shopping, Bills, Entertainment, Health, Education, Other.
* Live preview format mata uang Rupiah Indonesia (`Rp ...`).
* Pencarian transaksi instan berdasarkan kata kunci judul/catatan.
* Filter transaksi berdasarkan jenis, kategori, dan rentang tanggal (tersinkronisasi ke URL parameter).
* Edit dan Hapus transaksi dengan dialog konfirmasi modal yang *accessible*.

### 4. Analitik Bulanan Mendalam
* **Pemilih Periode**: Navigasi bulan dan tahun dinamis yang sinkron dengan query URL.
* **Rasio Tabungan (*Savings Rate %*)**: Indikator persentase dana tersimpan dibanding penerimaan.
* **Kategori Beban Terbesar**: Mengetahui sektor pengeluaran paling dominan di bulan berjalan.
* **Donut Chart Kategori**: Proporsi persentase per kategori pengeluaran berpadu dengan progress bar berwarna senada.
* **Grafik Saldo Kumulatif**: Kurva dinamis akumulasi saldo harian dari awal hingga akhir bulan.
* **Grafik Historis 6 Bulan**: Tren perbandingan arus kas multi-bulan.

### 5. Target Tabungan (Savings Goals)
* Penetapan target finansial (Dana Darurat, Liburan, Gadget) dengan nominal target dan deadline.
* Bar progres visual dengan persentase capaian dan nominal sisa yang dibutuhkan.
* Status waktu otomatis: *Selesai*, *X Hari Tersisa*, atau peringatan *Batas Waktu Terlewat*.
* Fitur **Setor Tabungan** dengan tombol preset nominal instan (+Rp 50rb, +Rp 100rb, +Rp 250rb, +Rp 500rb, +Rp 1jt).

### 6. Ekspor Laporan Resmi ke PDF
* Ekspor rekening koran/laporan keuangan bulanan berbasis `jsPDF` dan `jspdf-autotable`.
* Struktur dokumen resmi mencakup header brand DompetKU, metadata akun, periode, 4 kotak ringkasan finansial, tabel pengeluaran kategori, dan tabel rincian transaksi berpenomoran halaman otomatis.
* Berjalan 100% di browser tanpa beban komputasi server.

### 7. Dark Mode & Desain Responsif
* Transisi tema mulus tanpa *flash* saat reload halaman (*hydration-safe*).
* Desain adaptif dari layar smartphone hingga monitor desktop ultrawide.

---

## 🗄️ Skema Database & Keamanan RLS

Skema lengkap tersedia pada file [`supabase/schema.sql`](./supabase/schema.sql).

```sql
-- Tabel Profil Pengguna
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabel Transaksi
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  note TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabel Target Tabungan
CREATE TABLE public.savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  goal_name TEXT NOT NULL,
  target_amount NUMERIC(15, 2) NOT NULL CHECK (target_amount > 0),
  current_amount NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  deadline DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### Row Level Security (RLS)
Setiap tabel mengaktifkan RLS dengan kebijakan `auth.uid() = user_id`:
```sql
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" 
  ON public.transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" 
  ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" 
  ON public.transactions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" 
  ON public.transactions FOR DELETE USING (auth.uid() = user_id);
```

---

## 🛠️ Panduan Instalasi Lokal

### Prasyarat
* Node.js v18+ atau v20+ (Direkomendasikan v20+)
* Akun [Supabase](https://supabase.com) gratis

### Langkah-langkah
1. **Clone repositori**:
   ```bash
   git clone https://github.com/username/dompetku.git
   cd dompetku
   ```

2. **Install dependensi**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables**:
   Salin file `.env.example` menjadi `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Isi kredensial project Supabase Anda:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Jalankan Migrasi Database**:
   * Buka [Dashboard Supabase](https://supabase.com/dashboard) -> pilih project Anda.
   * Masuk ke menu **SQL Editor**.
   * Salin seluruh isi file [`supabase/schema.sql`](./supabase/schema.sql) dan klik **Run**.

5. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3000` pada browser Anda.

---

## 🚀 Panduan Deployment ke Vercel

1. Push kode project ke repositori GitHub Anda:
   ```bash
   git add .
   git commit -m "feat: complete production ready dompetku"
   git push origin main
   ```
2. Buka [Vercel Dashboard](https://vercel.com) -> klik **Add New Project**.
3. Hubungkan repositori GitHub `dompetku`.
4. Tambahkan Environment Variables di halaman konfigurasi Vercel:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Pada dashboard Supabase:
   * Masuk ke **Authentication** -> **URL Configuration**.
   * Tambahkan URL domain produksi Vercel Anda ke dalam **Site URL** dan **Redirect URLs** (misal: `https://your-domain.vercel.app/auth/callback`).
6. Klik **Deploy**. Aplikasi siap digunakan di internet!

---

## 📄 Lisensi
Project ini dibuat untuk tujuan portofolio rekayasa perangkat lunak modern di bawah lisensi MIT.
