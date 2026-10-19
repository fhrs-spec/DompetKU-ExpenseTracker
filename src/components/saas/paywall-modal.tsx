"use client";

import * as React from "react";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Zap,
  CreditCard,
  QrCode,
  MessageSquare,
  Mail,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Crown,
  ArrowRight,
  X,
  Building2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ADMIN_CONTACT } from "@/lib/auth/admin";
import { toast } from "sonner";

export interface PaywallModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onActivated?: () => void;
  defaultStep?: "pricing" | "checkout" | "contact";
  isDismissable?: boolean;
}

export function PaywallModal({
  isOpen,
  onClose,
  onActivated,
  defaultStep = "pricing",
  isDismissable = true,
}: PaywallModalProps) {
  const [step, setStep] = React.useState<"pricing" | "checkout" | "contact" | "success">(
    defaultStep
  );
  const [paymentMethod, setPaymentMethod] = React.useState<"card" | "qris" | "transfer">("card");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  // Demo Card Form State
  const [cardHolder, setCardHolder] = React.useState("");
  const [cardNumber, setCardNumber] = React.useState("");
  const [cardExpiry, setCardExpiry] = React.useState("");
  const [cardCvc, setCardCvc] = React.useState("");

  React.useEffect(() => {
    if (isOpen) {
      setStep(defaultStep);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, defaultStep]);

  if (!isOpen) return null;

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      }
      setCopiedField(fieldName);
      toast.success(`${fieldName} berhasil disalin ke clipboard!`);
      setTimeout(() => setCopiedField(null), 2500);
    } catch {
      toast.info(`${fieldName}: ${text}`);
    }
  };

  const handleFillDemoCard = () => {
    setCardHolder("Subscriber DompetKU");
    setCardNumber("4242 •••• •••• 4242");
    setCardExpiry("12/28");
    setCardCvc("888");
    toast.info("Data kartu demo berhasil diisi secara otomatis.");
  };

  const handleSimulatePayment = () => {
    if (paymentMethod === "card" && (!cardNumber || !cardHolder)) {
      setCardHolder("Subscriber DompetKU");
      setCardNumber("4242 •••• •••• 4242");
      setCardExpiry("12/28");
      setCardCvc("888");
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      try {
        localStorage.setItem("dompetku_pro_license_active", "true");
      } catch {
        // LocalStorage fallback
      }
      setStep("success");
      toast.success("Pembayaran Berhasil! Lisensi DompetKU SaaS Pro Aktif.");
    }, 1200);
  };

  const handleClose = () => {
    if (step === "success") {
      onActivated?.();
    }
    if (isDismissable && onClose) {
      onClose();
    }
  };

  const FEATURES = [
    {
      title: "Unlimited Smart AI Receipt Scanner",
      desc: "Pindai struk belanja fisik langsung dengan kamera smartphone atau galeri tanpa batasan kuota harian.",
    },
    {
      title: "Smart AI Financial Health Advisor",
      desc: "Audit arus kas bulanan otomatis dengan evaluasi rasio tabungan dan rekomendasi taktis.",
    },
    {
      title: "Akumulasi Saldo & Cashflow Analytics",
      desc: "Grafik saldo harian dinamis dan perbandingan histori 6 bulan tanpa terpotong.",
    },
    {
      title: "Ekspor Dokumen PDF Eksekutif",
      desc: "Unduh laporan keuangan bulanan terstruktur rapi untuk arsip pribadi atau perpajakan.",
    },
    {
      title: "Enkripsi Awan & Supabase PostgreSQL RLS",
      desc: "Data transaksi terisolasi aman dengan standar keamanan perbankan dan multi-device sync.",
    },
    {
      title: "Akses Langsung ke Admin & Developer (Fharas)",
      desc: "Dukungan prioritas dan konsultasi via WhatsApp resmi dan Email tanpa antrean bot.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-50 w-full max-w-2xl rounded-2xl sm:rounded-3xl border border-primary/30 bg-card p-5 sm:p-7 text-card-foreground shadow-2xl transition-all max-h-[92dvh] flex flex-col my-auto overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-soft">
              <Crown className="h-5 w-5 text-amber-500 fill-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-bold text-foreground">
                  DompetKU SaaS Pro
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  Lifetime License
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Satu kali bayar untuk akses selamanya tanpa biaya langganan bulanan
              </p>
            </div>
          </div>

          {isDismissable && (
            <button
              onClick={handleClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
              aria-label="Tutup paywall"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 pr-1 py-4 overscroll-contain space-y-5 scrollbar-thin scrollbar-thumb-border">
          {/* STEP 1: PRICING & VALUE PROPOSITION */}
          {step === "pricing" && (
            <div className="space-y-5">
              {/* Pricing Hero Box */}
              <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-background to-card p-5 sm:p-6 text-center relative overflow-hidden">
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-2.5 py-0.5 text-[11px] font-semibold shadow-soft">
                    <Sparkles className="h-3 w-3" /> Best Value
                  </span>
                </div>

                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Paket Lisensi Permanen
                </p>
                <div className="mt-2 flex items-baseline justify-center gap-2">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground font-mono">
                    $99
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    USD / Sekali Bayar
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground font-mono">
                  (Setara ± Rp {ADMIN_CONTACT.priceIdr} · Akses Seumur Hidup)
                </p>

                <p className="mt-3 text-xs sm:text-sm text-foreground/90 max-w-md mx-auto leading-relaxed">
                  Buka seluruh potensi manajemen finansial pribadi tanpa batasan. Diperkuat dengan Smart AI dan sinkronisasi awan aman.
                </p>

                <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button
                    onClick={() => setStep("checkout")}
                    size="lg"
                    className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-card hover:scale-[1.01] transition-transform"
                  >
                    <CreditCard className="h-4 w-4" />
                    Beli Lisensi $99 Sekarang
                  </Button>
                  <Button
                    onClick={() => setStep("contact")}
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto gap-2 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-semibold"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Hubungi Admin ({ADMIN_CONTACT.name})
                  </Button>
                </div>
              </div>

              {/* Feature Checklist */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Fitur Unggulan Yang Anda Dapatkan:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {FEATURES.map((feat, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-border/70 bg-card/60 p-3 flex items-start gap-2.5 transition-colors hover:border-primary/30"
                    >
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-semibold text-foreground">
                          {feat.title}
                        </h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                          {feat.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security & Guarantee Note */}
              <div className="rounded-xl border border-border/60 bg-muted/30 p-3 flex items-center gap-3 text-xs text-muted-foreground">
                <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                <span>
                  Garansi kepuasan & aktivasi instan. Lisensi terikat selamanya pada akun email Anda dan langsung aktif setelah verifikasi.
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: CHECKOUT SIMULATOR */}
          {step === "checkout" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-foreground">
                    Checkout Lisensi Pro ($99 USD)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Simulasi pembayaran aman instan untuk pengujian & aktivasi
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep("pricing")}
                  className="text-xs text-muted-foreground"
                >
                  ← Kembali
                </Button>
              </div>

              {/* Method Switcher */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                    paymentMethod === "card"
                      ? "border-primary bg-primary/10 text-primary font-semibold shadow-soft"
                      : "border-border bg-card hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Kartu Kredit/Debit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("qris")}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                    paymentMethod === "qris"
                      ? "border-primary bg-primary/10 text-primary font-semibold shadow-soft"
                      : "border-border bg-card hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <QrCode className="h-4 w-4" />
                  <span>QRIS Instan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("transfer")}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                    paymentMethod === "transfer"
                      ? "border-primary bg-primary/10 text-primary font-semibold shadow-soft"
                      : "border-border bg-card hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  <span>Bank Transfer</span>
                </button>
              </div>

              {/* Method 1: Credit Card Form */}
              {paymentMethod === "card" && (
                <div className="rounded-xl border border-border bg-card/70 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">
                      Rincian Kartu Pembayaran
                    </span>
                    <button
                      type="button"
                      onClick={handleFillDemoCard}
                      className="text-[11px] text-primary hover:underline font-medium"
                    >
                      + Isi Kartu Demo Otomatis
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Nama Pemilik Kartu</Label>
                    <Input
                      placeholder="e.g. John Doe"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Nomor Kartu</Label>
                    <Input
                      placeholder="•••• •••• •••• ••••"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="h-9 text-xs font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Masa Berlaku (MM/YY)</Label>
                      <Input
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="h-9 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">CVV / CVC</Label>
                      <Input
                        placeholder="123"
                        type="password"
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="h-9 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Method 2: QRIS Simulator */}
              {paymentMethod === "qris" && (
                <div className="rounded-xl border border-border bg-card/70 p-4 text-center space-y-3">
                  <div className="mx-auto w-36 h-36 rounded-xl border border-primary/20 bg-white flex flex-col items-center justify-center p-2 shadow-inner">
                    <QrCode className="h-28 w-28 text-slate-900" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      QRIS Nasional Standar BI
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Pindai dengan GoPay, OVO, Dana, ShopeePay, atau BCA Mobile
                    </p>
                    <p className="text-xs font-mono font-bold text-primary mt-1">
                      Nominal: Rp {ADMIN_CONTACT.priceIdr}
                    </p>
                  </div>
                </div>
              )}

              {/* Method 3: Bank Transfer info */}
              {paymentMethod === "transfer" && (
                <div className="rounded-xl border border-border bg-card/70 p-4 space-y-3 text-xs">
                  <p className="font-semibold text-foreground">
                    Rekening Resmi Administrator Fharas
                  </p>
                  <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Bank:</span>
                      <span className="font-semibold text-foreground">BCA (Bank Central Asia)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Nomor Rekening:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-foreground">8735-0912-34</span>
                        <button
                          type="button"
                          onClick={() => handleCopy("8735091234", "Nomor Rekening BCA")}
                          className="text-primary hover:text-primary/80"
                        >
                          {copiedField === "Nomor Rekening BCA" ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Atas Nama:</span>
                      <span className="font-semibold text-foreground">{ADMIN_CONTACT.name}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Setelah transfer, klik tombol simulasi di bawah atau kirim bukti transfer ke Admin Fharas via WhatsApp.
                  </p>
                </div>
              )}

              {/* Checkout CTA */}
              <div className="pt-2">
                <Button
                  onClick={handleSimulatePayment}
                  disabled={isProcessing}
                  size="lg"
                  className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-card"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memproses Verifikasi Lisensi $99...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>Bayar $99 & Aktifkan Lisensi Pro</span>
                    </>
                  )}
                </Button>
                <p className="text-[11px] text-center text-muted-foreground mt-2">
                  🛡️ Transaksi disimulasikan secara aman tanpa pemotongan dana nyata.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: CONTACT ADMIN FHARAS */}
          {step === "contact" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-foreground">
                    Hubungi Admin & Pembuat ({ADMIN_CONTACT.name})
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Konsultasi lisensi, aktivasi manual, atau negosiasi kebutuhan khusus
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep("pricing")}
                  className="text-xs text-muted-foreground"
                >
                  ← Kembali
                </Button>
              </div>

              {/* Direct WhatsApp Card */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-soft shrink-0">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-foreground">
                      WhatsApp Resmi Fharas
                    </h4>
                    <p className="text-xs text-muted-foreground font-mono">
                      +{ADMIN_CONTACT.whatsapp}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleCopy(ADMIN_CONTACT.whatsapp, "Nomor WhatsApp")}
                    className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground text-xs flex items-center gap-1 shrink-0"
                    title="Salin nomor"
                  >
                    {copiedField === "Nomor WhatsApp" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <a
                    href={ADMIN_CONTACT.whatsappUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-semibold shadow-soft transition-colors"
                  >
                    <span>Chat WhatsApp Sekarang</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* Direct Email Card */}
              <div className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-foreground">
                      Email Resmi Administrator
                    </h4>
                    <p className="text-xs text-muted-foreground font-mono">
                      {ADMIN_CONTACT.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleCopy(ADMIN_CONTACT.email, "Alamat Email")}
                    className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground text-xs flex items-center gap-1 shrink-0"
                    title="Salin email"
                  >
                    {copiedField === "Alamat Email" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <a
                    href={ADMIN_CONTACT.emailUrl()}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground px-3.5 py-2 text-xs font-semibold transition-colors"
                  >
                    <span>Kirim Email</span>
                    <Mail className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* Instant Test Activation Action */}
              <div className="rounded-xl border border-dashed border-primary/40 bg-primary/[0.03] p-4 text-center space-y-2">
                <p className="text-xs font-medium text-foreground">
                  Ingin langsung menguji coba dashboard dengan status lisensi Pro aktif?
                </p>
                <Button
                  onClick={handleSimulatePayment}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
                >
                  <Zap className="h-3.5 w-3.5" />
                  Aktifkan Mode Pro Instan (Simulasi $99)
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS / UNLOCKED */}
          {step === "success" && (
            <div className="text-center py-6 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-soft animate-bounce">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Selamat Datang di DompetKU SaaS Pro!
                </h3>
                <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                  Lisensi Lifetime $99 Anda telah berhasil diaktifkan. Anda kini memiliki akses tak terbatas ke seluruh fitur AI, analitik finansial, dan ekspor dokumen.
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <Button
                  onClick={() => {
                    onActivated?.();
                    handleClose();
                  }}
                  size="lg"
                  className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-card"
                >
                  <span>Mulai Gunakan DompetKU Pro</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
