"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Wallet, ArrowRight, Lock, Mail, User } from "lucide-react";
import { registerSchema, RegisterInput } from "@/lib/validations/auth";
import { registerAction } from "@/app/auth/actions";
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

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const res = await registerAction(data);
      if (!res.success) {
        toast.error(res.error || "Pendaftaran akun gagal");
        return;
      }

      // If email confirmation needed
      if (res.error) {
        toast.info(res.error, { duration: 6000 });
        router.push("/login");
        return;
      }

      toast.success("Akun berhasil dibuat! Selamat datang di DompetKU.");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan teknis, silakan ulangi kembali.");
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
            Daftar Akun Baru
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Mulai kelola finansial Anda dengan lebih rapi hari ini
          </p>
        </div>

        {/* Register Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Registrasi</CardTitle>
            <CardDescription>
              Isi formulir berikut untuk membuat akun DompetKU
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nama Lengkap</Label>
                <div className="relative">
                  <Input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Contoh: Budi Santoso"
                    error={!!errors.name}
                    disabled={isLoading}
                    className="pl-10"
                    {...register("name")}
                  />
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
                {errors.name && (
                  <p className="text-xs text-destructive font-medium mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

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
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Minimal 6 karakter"
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

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Ulangi password"
                    error={!!errors.confirmPassword}
                    disabled={isLoading}
                    className="pl-10"
                    {...register("confirmPassword")}
                  />
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive font-medium mt-1">
                    {errors.confirmPassword.message}
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
                Daftar Sekarang
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Sudah memiliki akun?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-primary hover:underline"
                >
                  Masuk di sini
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
