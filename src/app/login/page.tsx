"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Wallet, ArrowRight, Lock, Mail } from "lucide-react";
import { loginSchema, LoginInput } from "@/lib/validations/auth";
import { loginAction } from "@/app/auth/actions";
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

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const res = await loginAction(data);
      if (!res.success) {
        toast.error(res.error || "Gagal masuk ke akun");
        return;
      }

      toast.success("Berhasil masuk! Mengalihkan ke dashboard...");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan sistem, silakan coba beberapa saat lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-background">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 mb-4 group focus-visible:outline-none"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-card group-hover:scale-105 transition-transform">
              <Wallet className="h-6 w-6" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-foreground">
              Dompet<span className="text-primary">KU</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Selamat Datang Kembali
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Masuk ke akun Anda untuk memantau pengeluaran
          </p>
        </div>

        {/* Login Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Masuk Akun</CardTitle>
            <CardDescription>
              Masukkan alamat email dan password yang terdaftar
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
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

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    error={!!errors.password}
                    disabled={isLoading}
                    className="pl-10"
                    {...register("password")}
                  />
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive font-medium mt-1">
                    {errors.password.message}
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
                Masuk Sekarang
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Belum memiliki akun?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-primary hover:underline"
                >
                  Daftar akun baru
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
