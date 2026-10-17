"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Wallet,
  ArrowRight,
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import {
  resetPasswordSchema,
  resetPasswordWithCodeSchema,
  ResetPasswordInput,
  ResetPasswordWithCodeInput,
} from "@/lib/validations/auth";
import {
  updatePasswordAction,
  resetPasswordWithCodeAction,
} from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlEmail = searchParams.get("email") || "";
  const urlError = searchParams.get("error");

  const [hasRecoverySession, setHasRecoverySession] = React.useState<boolean | null>(null);
  const [activeTab, setActiveTab] = React.useState<"session" | "code">("session");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  // Check client-side authentication / recovery session
  React.useEffect(() => {
    const supabase = createClient();

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setHasRecoverySession(true);
        setActiveTab("session");
      } else {
        setHasRecoverySession(false);
        setActiveTab("code");
      }
    };

    checkSession();

    // Listen to hash fragment or auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setHasRecoverySession(true);
        setActiveTab("session");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Form for Authenticated Session (clicked email link)
  const sessionForm = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Form for OTP Code Verification
  const codeForm = useForm<ResetPasswordWithCodeInput>({
    resolver: zodResolver(resetPasswordWithCodeSchema),
    defaultValues: {
      email: urlEmail,
      code: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Update email if searchParam changes
  React.useEffect(() => {
    if (urlEmail) {
      codeForm.setValue("email", urlEmail);
    }
  }, [urlEmail, codeForm]);

  // Handler for Authenticated Session
  const onSessionSubmit = async (data: ResetPasswordInput) => {
    setIsLoading(true);
    try {
      const res = await updatePasswordAction(data);
      if (!res.success) {
        toast.error(res.error || "Gagal memperbarui kata sandi");
        // If session expired, switch to OTP code form
        if (res.error?.toLowerCase().includes("sesi") || res.error?.toLowerCase().includes("kadaluarsa")) {
          setHasRecoverySession(false);
          setActiveTab("code");
        }
        return;
      }

      setIsSuccess(true);
      toast.success("Kata sandi berhasil diperbarui!");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2500);
    } catch {
      toast.error("Terjadi kesalahan sistem, silakan coba beberapa saat lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for OTP Code
  const onCodeSubmit = async (data: ResetPasswordWithCodeInput) => {
    setIsLoading(true);
    try {
      const res = await resetPasswordWithCodeAction(data);
      if (!res.success) {
        toast.error(res.error || "Gagal memverifikasi kode atau mengganti sandi");
        return;
      }

      setIsSuccess(true);
      toast.success("Kata sandi berhasil diperbarui!");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2500);
    } catch {
      toast.error("Terjadi kesalahan teknis saat memproses verifikasi.");
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
            Atur Ulang Kata Sandi
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Buat kata sandi baru yang aman untuk akun Anda
          </p>
        </div>

        {/* Success View */}
        {isSuccess ? (
          <Card className="shadow-soft sm:shadow-card animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="text-center pb-3">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl">Kata Sandi Berhasil Diperbarui!</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Kata sandi Anda telah sukses diganti. Anda sedang dialihkan ke dashboard DompetKU...
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-2">
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted px-4 py-2 rounded-xl">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
                  Mengalihkan otomatis...
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-2 pt-2">
              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full"
              >
                Buka Dashboard Sekarang
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="shadow-soft sm:shadow-card">
            {/* Expired URL alert */}
            {urlError === "expired" && (
              <div className="m-6 mb-0 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Tautan Pemulihan Kadaluarsa</p>
                  <p className="mt-0.5 text-destructive/90">
                    Tautan dari email Anda sudah tidak berlaku. Silakan masukkan kode OTP di bawah ini jika Anda menerimanya, atau{" "}
                    <Link href="/forgot-password" className="underline font-semibold">
                      minta tautan baru
                    </Link>.
                  </p>
                </div>
              </div>
            )}

            <CardHeader className={urlError === "expired" ? "pt-4" : ""}>
              <div className="flex items-center justify-between">
                <CardTitle>Kata Sandi Baru</CardTitle>
                {hasRecoverySession && activeTab === "session" && (
                  <Badge variant="success" className="gap-1 text-[11px] py-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Sesi Terverifikasi
                  </Badge>
                )}
              </div>
              <CardDescription>
                {activeTab === "session"
                  ? "Sesi Anda terverifikasi dari tautan email. Silakan tentukan kata sandi baru."
                  : "Masukkan alamat email, kode OTP verifikasi, dan kata sandi baru Anda."}
              </CardDescription>

              {/* Mode Toggle Tabs */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-muted rounded-xl mt-3 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("session")}
                  className={`py-2 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
                    activeTab === "session"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Via Tautan Email
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("code")}
                  className={`py-2 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
                    activeTab === "code"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Via Kode OTP
                </button>
              </div>
            </CardHeader>

            {/* Form 1: With Authenticated Session (Link) */}
            {activeTab === "session" && (
              <form onSubmit={sessionForm.handleSubmit(onSessionSubmit)} noValidate>
                <CardContent className="space-y-4">
                  {hasRecoverySession === false && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
                      Tidak terdeteksi sesi tautan aktif di browser ini. Jika Anda menerima kode OTP di email, klik tab{" "}
                      <button
                        type="button"
                        onClick={() => setActiveTab("code")}
                        className="underline font-bold cursor-pointer"
                      >
                        Via Kode OTP
                      </button>{" "}
                      atau buka tautan langsung dari email.
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="session-password">Kata Sandi Baru</Label>
                    <div className="relative">
                      <Input
                        id="session-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Minimal 6 karakter"
                        error={!!sessionForm.formState.errors.password}
                        disabled={isLoading}
                        className="pl-10 pr-10"
                        {...sessionForm.register("password")}
                      />
                      <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {sessionForm.formState.errors.password && (
                      <p className="text-xs text-destructive font-medium mt-1">
                        {sessionForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="session-confirmPassword">Konfirmasi Kata Sandi Baru</Label>
                    <div className="relative">
                      <Input
                        id="session-confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Ulangi kata sandi baru"
                        error={!!sessionForm.formState.errors.confirmPassword}
                        disabled={isLoading}
                        className="pl-10 pr-10"
                        {...sessionForm.register("confirmPassword")}
                      />
                      <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {sessionForm.formState.errors.confirmPassword && (
                      <p className="text-xs text-destructive font-medium mt-1">
                        {sessionForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                  <Button
                    type="submit"
                    className="w-full"
                    isLoading={isLoading}
                  >
                    Simpan Kata Sandi Baru
                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    Ingat kata sandi Anda?{" "}
                    <Link
                      href="/login"
                      className="font-semibold text-primary hover:underline"
                    >
                      Kembali ke halaman masuk
                    </Link>
                  </p>
                </CardFooter>
              </form>
            )}

            {/* Form 2: With OTP Code */}
            {activeTab === "code" && (
              <form onSubmit={codeForm.handleSubmit(onCodeSubmit)} noValidate>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="code-email">Email Terdaftar</Label>
                    <div className="relative">
                      <Input
                        id="code-email"
                        type="email"
                        autoComplete="email"
                        placeholder="nama@email.com"
                        error={!!codeForm.formState.errors.email}
                        disabled={isLoading}
                        className="pl-10"
                        {...codeForm.register("email")}
                      />
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                    {codeForm.formState.errors.email && (
                      <p className="text-xs text-destructive font-medium mt-1">
                        {codeForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="code-otp">Kode OTP / Verifikasi Email</Label>
                    <div className="relative">
                      <Input
                        id="code-otp"
                        type="text"
                        autoComplete="one-time-code"
                        placeholder="Contoh: 123456"
                        maxLength={10}
                        error={!!codeForm.formState.errors.code}
                        disabled={isLoading}
                        className="pl-10 tracking-widest font-mono text-base font-bold"
                        {...codeForm.register("code")}
                      />
                      <KeyRound className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                    {codeForm.formState.errors.code && (
                      <p className="text-xs text-destructive font-medium mt-1">
                        {codeForm.formState.errors.code.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="code-password">Kata Sandi Baru</Label>
                    <div className="relative">
                      <Input
                        id="code-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Minimal 6 karakter"
                        error={!!codeForm.formState.errors.password}
                        disabled={isLoading}
                        className="pl-10 pr-10"
                        {...codeForm.register("password")}
                      />
                      <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {codeForm.formState.errors.password && (
                      <p className="text-xs text-destructive font-medium mt-1">
                        {codeForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="code-confirmPassword">Konfirmasi Kata Sandi Baru</Label>
                    <div className="relative">
                      <Input
                        id="code-confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Ulangi kata sandi baru"
                        error={!!codeForm.formState.errors.confirmPassword}
                        disabled={isLoading}
                        className="pl-10 pr-10"
                        {...codeForm.register("confirmPassword")}
                      />
                      <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {codeForm.formState.errors.confirmPassword && (
                      <p className="text-xs text-destructive font-medium mt-1">
                        {codeForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                  <Button
                    type="submit"
                    className="w-full"
                    isLoading={isLoading}
                  >
                    Verifikasi Kode & Ganti Kata Sandi
                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>

                  <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                    <Link
                      href="/forgot-password"
                      className="text-primary hover:underline"
                    >
                      Kirim ulang email reset
                    </Link>
                    <Link
                      href="/login"
                      className="font-semibold text-primary hover:underline"
                    >
                      Kembali ke login
                    </Link>
                  </div>
                </CardFooter>
              </form>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <ResetPasswordContent />
    </React.Suspense>
  );
}
