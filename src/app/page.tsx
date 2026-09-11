import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  ShieldCheck,
  FileText,
  Target,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  let user = null;
  try {
    const supabase = await createClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    user = currentUser;
  } catch {
    // If Supabase credentials are not yet configured in local environment
    user = null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header / Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-soft">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Dompet<span className="text-primary">KU</span>
            </span>
          </div>

          <nav className="flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft hover:bg-primary/90 transition-colors"
              >
                Buka Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-xl px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft hover:bg-primary/90 transition-colors"
                >
                  Daftar Sekarang
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 pt-16 pb-20 sm:px-6 lg:px-8 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Kelola Keuangan Pribadi dengan Tenang & Terarah
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Pantau Arus Kas & Wujudkan Target Finansial Anda
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Pencatat pemasukan dan pengeluaran modern dengan antarmuka yang
            bersih, analitik bulanan real-time, target tabungan, dan ekspor
            laporan instan.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={user ? "/dashboard" : "/register"}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-card hover:bg-primary/90 transition-all hover:scale-[1.01]"
            >
              {user ? "Masuk ke Dashboard" : "Mulai Gratis Sekarang"}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center rounded-xl border border-border bg-card px-6 py-3.5 text-base font-medium text-foreground hover:bg-muted transition-colors"
            >
              Sudah Punya Akun? Masuk
            </Link>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 border-t border-border">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Didesain Khusus untuk Kebutuhan Sehari-hari
            </h2>
            <p className="mt-3 text-muted-foreground text-sm sm:text-base">
              Tidak ada fitur rumit yang membingungkan. DompetKU berfokus pada esensi pencatatan keuangan yang cepat dan akurat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-xl border border-border bg-card p-6 shadow-soft transition-all hover:border-primary/40">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                <Wallet className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Pencatatan Cepat
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Catat pemasukan dan pengeluaran dalam hitungan detik dengan kategori yang relevan untuk kebutuhan di Indonesia.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-soft transition-all hover:border-primary/40">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Visualisasi Arus Kas
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Analitik interaktif berbasis chart untuk melihat perbandingan pemasukan vs pengeluaran serta proporsi kategori.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-soft transition-all hover:border-primary/40">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-4">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Target Tabungan
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Tetapkan target dana darurat, liburan, atau gadget impian dengan indikator persentase capaian yang jelas.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-soft transition-all hover:border-primary/40">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-4">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Ekspor PDF Resmi
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Unduh rekapitulasi keuangan bulanan dalam format dokumen PDF rapi yang siap dicetak atau disimpan.
              </p>
            </div>
          </div>
        </section>

        {/* Security & Reliability Callout */}
        <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 mb-12">
          <div className="rounded-2xl border border-border bg-card p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-soft">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Keamanan & Privasi Tingkat PostgreSQL RLS
                </h3>
                <p className="mt-1 text-sm text-muted-foreground max-w-xl">
                  Setiap data keuangan diisolasi dengan ketat menggunakan Row Level Security Supabase. Tidak ada pengguna lain yang dapat mengakses data transaksi Anda.
                </p>
              </div>
            </div>
            <Link
              href="/register"
              className="shrink-0 rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:bg-foreground/90 transition-colors"
            >
              Buat Akun Gratis
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} DompetKU. Dibangun dengan Next.js App Router, React 19, & Supabase.</p>
        </div>
      </footer>
    </div>
  );
}
