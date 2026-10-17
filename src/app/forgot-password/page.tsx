"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Wallet,
  ArrowRight,
  ArrowLeft,
  Mail,
  CheckCircle2,
  RefreshCw,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { forgotPasswordSchema, ForgotPasswordInput } from "@/lib/validations/auth";
import { forgotPasswordAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [submittedEmail, setSubmittedEmail] = React.useState("");
  const [resendCooldown, setResendCooldown] = React.useState(0);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Countdown timer for resend
  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : undefined;
      const res = await forgotPasswordAction(data, origin);

      if (!res.success) {
        toast.error(res.error || "Gagal mengirim permintaan reset kata sandi");
        return;
      }

      setSubmittedEmail(data.email);
      setIsSubmitted(true);
      setResendCooldown(60);
      toast.success(res.message || "Tautan dan kode reset berhasil dikirim!");
    } catch {
      toast.error("Terjadi kendala sistem, silakan coba sesaat lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !submittedEmail) return;
    setIsLoading(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : undefined;
      const res = await forgotPasswordAction({ email: submittedEmail }, origin);
      if (!res.success) {
        toast.error(res.error || "Gagal mengirim ulang email");
        return;
      }
      setResendCooldown(60);
      toast.success("Email pemulihan baru telah berhasil dikirimkan!");
    } catch {
      toast.error("Terjadi kesalahan teknis saat mengirim ulang.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-start sm:justify-center items-center px-4 pt-6 pb-12 sm:py-12 bg-background">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 mb-3 sm:mb-4 group focus-visible:outline-none"
          >
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-card group-hover:scale-105 transition-transform">
              <Wallet className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              Dompet<span className="text-primary">KU</span>
            </span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Pemulihan Akun
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Kembalikan akses akun DompetKU Anda dengan aman
          </p>
        </div>

        {/* Form Card or Success State */}
        {!isSubmitted ? (
          <Card className="shadow-soft sm:shadow-card">
            <CardHeader>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <KeyRound className="h-5 w-5" />
                </div>
                <CardTitle>Lupa Kata Sandi?</CardTitle>
              </div>
              <CardDescription>
                Masukkan alamat email yang terdaftar. Kami akan mengirimkan tautan dan kode verifikasi untuk mengatur ulang kata sandi Anda.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Alamat Email Terdaftar</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="nama@email.com"
                      error={!!errors.email}
                      disabled={isLoading}
                      className="pl-10"
                      {...register("email")}
                    />
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-destructive font-medium mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="rounded-xl bg-muted/60 border border-border/80 p-3 text-xs text-muted-foreground flex items-start gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    Demi keamanan, instruksi reset hanya dikirim ke email terverifikasi dan tautan kedaluwarsa setelah digunakan.
                  </span>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                >
                  Kirim Instruksi Reset
                  {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Ingat kata sandi Anda?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Kembali ke halaman masuk
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        ) : (
          <Card className="shadow-soft sm:shadow-card animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="text-center pb-3">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl">Periksa Email Anda</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Instruksi pemulihan kata sandi telah dikirimkan ke:
              </CardDescription>
              <div className="mt-2 inline-block rounded-lg bg-muted px-3 py-1.5 text-xs sm:text-sm font-semibold text-foreground break-all border border-border">
                {submittedEmail}
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              <div className="space-y-3 rounded-xl bg-muted/40 border border-border p-3.5 text-xs">
                <div className="flex gap-2.5">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[11px]">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Klik Tautan di Email</p>
                    <p className="text-muted-foreground mt-0.5">
                      Buka email Anda lalu klik tombol atau tautan konfirmasi untuk diarahkan ke halaman pembuatan kata sandi baru.
                    </p>
                  </div>
                </div>

                <div className="border-t border-border/60 my-1" />

                <div className="flex gap-2.5">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[11px]">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Atau Masukkan Kode OTP</p>
                    <p className="text-muted-foreground mt-0.5">
                      Jika email Anda berisi kode angka verifikasi OTP, Anda dapat langsung memasukkannya di halaman Atur Ulang.
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href={`/reset-password?email=${encodeURIComponent(submittedEmail)}`}
                className="block w-full"
              >
                <Button variant="outline" className="w-full">
                  <KeyRound className="mr-2 h-4 w-4 text-primary" />
                  Saya Punya Kode OTP / Buka Form Reset
                </Button>
              </Link>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2">
              <div className="w-full flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border">
                <span>Tidak menerima email?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || isLoading}
                  className="font-semibold text-primary hover:underline disabled:opacity-50 disabled:no-underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
                  {resendCooldown > 0
                    ? `Kirim ulang (${resendCooldown}s)`
                    : "Kirim Ulang"}
                </button>
              </div>

              <div className="flex items-center justify-between w-full pt-1">
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Ganti email
                </button>

                <Link
                  href="/login"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Kembali ke login
                </Link>
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
