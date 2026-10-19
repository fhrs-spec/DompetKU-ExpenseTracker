"use client";

import * as React from "react";
import {
  Crown,
  Sparkles,
  Lock,
  CreditCard,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { isAppOwner, ADMIN_CONTACT } from "@/lib/auth/admin";
import { Button } from "@/components/ui/button";
import { PaywallModal } from "@/components/saas/paywall-modal";
import { logoutAction } from "@/app/auth/actions";
import Link from "next/link";

interface PaywallGuardProps {
  children: React.ReactNode;
  userEmail?: string;
  userName?: string;
}

export function PaywallGuard({
  children,
  userEmail,
  userName,
}: PaywallGuardProps) {
  const [mounted, setMounted] = React.useState(false);
  const [isProActive, setIsProActive] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalStep, setModalStep] = React.useState<"pricing" | "checkout" | "contact">("pricing");

  const isOwner = isAppOwner(userEmail, userName);

  React.useEffect(() => {
    setMounted(true);
    const syncStatus = () => {
      try {
        const active = localStorage.getItem("dompetku_pro_license_active") === "true";
        setIsProActive(active);
      } catch {
        setIsProActive(false);
      }
    };
    syncStatus();
    window.addEventListener("storage", syncStatus);
    return () => window.removeEventListener("storage", syncStatus);
  }, []);

  const handleResetLicense = () => {
    try {
      localStorage.removeItem("dompetku_pro_license_active");
    } catch {
      // Fallback
    }
    setIsProActive(false);
  };

  // SSR or before mount
  if (!mounted) {
    return <>{children}</>;
  }

  // If userEmail is undefined (e.g. during Next.js loading.tsx skeleton), render children
  if (userEmail === undefined) {
    return <>{children}</>;
  }

  // 1. Owner has unconditional lifetime access
  if (isOwner) {
    return <>{children}</>;
  }

  // 2. User has simulated or purchased Pro license
  if (isProActive) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-1.5 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
            DompetKU SaaS Pro Aktif (Akses Simulasi Lisensi $99)
          </span>
          <button
            onClick={handleResetLicense}
            className="text-[11px] underline hover:opacity-80 font-medium cursor-pointer"
          >
            Kunci Kembali (Uji Paywall)
          </button>
        </div>
        <div className="flex-1">{children}</div>
      </div>
    );
  }

  // 3. Non-owner without license: Show SaaS Paywall Gate
  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-2 sm:px-4">
      {/* Paywall Gate Hero Card */}
      <div className="rounded-3xl border border-primary/25 bg-card shadow-2xl p-6 sm:p-10 relative overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary via-emerald-400 to-amber-400" />

        <div className="max-w-2xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
            <Lock className="h-3.5 w-3.5" />
            Akses Akun Terproteksi · SaaS Pro License Gate
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Buka Akses Penuh DompetKU Pro
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Halo <span className="font-semibold text-foreground">{userName || userEmail || "Pengguna"}</span>, akun Anda saat ini berada dalam status penawaran SaaS Pro. Dapatkan akses tak terbatas ke seluruh fitur manajemen finansial kelas dunia.
          </p>

          {/* Pricing Highlight */}
          <div className="my-6 p-6 rounded-2xl bg-primary/[0.04] border border-primary/20 text-center">
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground font-mono">
                ${ADMIN_CONTACT.priceUsd}
              </span>
              <span className="text-sm font-semibold text-muted-foreground">
                USD / Sekali Bayar (Lifetime)
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ± Rp {ADMIN_CONTACT.priceIdr} · Tanpa biaya bulanan atau perpanjangan tersembunyi
            </p>

            <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={() => {
                  setModalStep("checkout");
                  setModalOpen(true);
                }}
                size="lg"
                className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-card"
              >
                <CreditCard className="h-4 w-4" />
                Beli Lisensi $99 (Simulasi Checkout)
              </Button>

              <Button
                onClick={() => {
                  setModalStep("contact");
                  setModalOpen(true);
                }}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto gap-2 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-semibold"
              >
                <MessageSquare className="h-4 w-4" />
                Hubungi Admin ({ADMIN_CONTACT.name})
              </Button>
            </div>
          </div>

          {/* Features Comparison */}
          <div className="text-left pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 text-center sm:text-left">
              Keuntungan Menggunakan DompetKU SaaS Pro:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "Unlimited Smart AI Scanner (Pindai struk fisik otomatis)",
                "Smart AI Financial Health Audit & Rekomendasi bulanan",
                "Akumulasi Saldo Harian & Visualisasi Arus Kas Real-time",
                "Ekspor Laporan Keuangan Dokumen PDF Eksekutif",
                "Multi-Device Sync dengan Supabase Row-Level Security",
                "Konsultasi & Jalur Komunikasi Prioritas dengan Fharas",
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border/70 bg-card/60 p-3 flex items-start gap-2.5 text-xs"
                >
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground/90 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Owner & Logout Footer */}
          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>
                Owner (<span className="font-semibold text-foreground">Fharas / mfharas5@gmail.com</span>) memiliki akses penuh otomatis.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-xs">
                  Halaman Utama
                </Button>
              </Link>
              <form action={logoutAction}>
                <Button
                  variant="outline"
                  size="sm"
                  type="submit"
                  className="gap-1.5 text-xs text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Keluar Akun
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Paywall Modal Dialog */}
      <PaywallModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onActivated={() => {
          setIsProActive(true);
          setModalOpen(false);
        }}
        defaultStep={modalStep}
        isDismissable={true}
      />
    </div>
  );
}
