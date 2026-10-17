"use server";

import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resetPasswordWithCodeSchema,
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ResetPasswordWithCodeInput,
} from "@/lib/validations/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export interface AuthResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export async function loginAction(values: LoginInput): Promise<AuthResponse> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Input tidak valid",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      success: false,
      error:
        error.message === "Invalid login credentials"
          ? "Email atau password salah"
          : error.message,
    };
  }

  return { success: true };
}

export async function registerAction(values: RegisterInput): Promise<AuthResponse> {
  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Input tidak valid",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        name: parsed.data.name,
      },
    },
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  // If Supabase has email confirmation enabled and user has no active session
  if (data.user && !data.session) {
    return {
      success: true,
      error: "Akun berhasil dibuat! Silakan cek email Anda untuk konfirmasi.",
    };
  }

  return { success: true };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

async function resolveOrigin(clientOrigin?: string): Promise<string> {
  if (
    clientOrigin &&
    typeof clientOrigin === "string" &&
    (clientOrigin.startsWith("http://") || clientOrigin.startsWith("https://"))
  ) {
    return clientOrigin.replace(/\/+$/, "");
  }

  try {
    const headerList = await headers();
    const host = headerList.get("x-forwarded-host") || headerList.get("host");
    const proto = headerList.get("x-forwarded-proto") || "https";
    if (host) {
      return `${proto}://${host}`.replace(/\/+$/, "");
    }
  } catch {
    // fallback below
  }

  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");
}

export async function forgotPasswordAction(
  values: ForgotPasswordInput,
  clientOrigin?: string
): Promise<AuthResponse> {
  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Format email tidak valid",
    };
  }

  const origin = await resolveOrigin(clientOrigin);
  const redirectTo = `${origin}/auth/callback?next=/reset-password`;

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo,
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes("rate limit") ||
      msg.includes("security purposes") ||
      msg.includes("too many") ||
      msg.includes("over_email_send_rate_limit")
    ) {
      return {
        success: false,
        error: "Terlalu banyak permintaan. Silakan tunggu sekitar 60 detik sebelum mencoba lagi.",
      };
    }
    // Account enumeration protection: if email not found, treat gracefully
    if (msg.includes("user not found") || msg.includes("not registered")) {
      return {
        success: true,
        message: "Jika email terdaftar, instruksi pemulihan kata sandi telah dikirimkan ke email Anda.",
      };
    }
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: "Tautan dan kode verifikasi reset kata sandi telah dikirimkan ke email Anda jika terdaftar.",
  };
}

export async function resetPasswordWithCodeAction(
  values: ResetPasswordWithCodeInput
): Promise<AuthResponse> {
  const parsed = resetPasswordWithCodeSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Data formulir tidak valid",
    };
  }

  const supabase = await createClient();

  // 1. Verify recovery OTP
  const { error: otpError } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.code.trim(),
    type: "recovery",
  });

  if (otpError) {
    const msg = otpError.message.toLowerCase();
    if (msg.includes("expired") || msg.includes("invalid") || msg.includes("token")) {
      return {
        success: false,
        error: "Kode verifikasi salah atau sudah kadaluarsa. Silakan periksa kembali atau minta kode baru.",
      };
    }
    return {
      success: false,
      error: otpError.message,
    };
  }

  // 2. Update password for authenticated user
  const { error: updateError } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (updateError) {
    return {
      success: false,
      error: updateError.message,
    };
  }

  return {
    success: true,
    message: "Kata sandi Anda berhasil diperbarui!",
  };
}

export async function updatePasswordAction(
  values: ResetPasswordInput
): Promise<AuthResponse> {
  const parsed = resetPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Data formulir tidak valid",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error: "Sesi verifikasi tidak ditemukan atau sudah kadaluarsa. Silakan buka tautan baru dari email Anda atau gunakan formulir kode OTP.",
    };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (updateError) {
    return {
      success: false,
      error: updateError.message,
    };
  }

  return {
    success: true,
    message: "Kata sandi Anda berhasil diperbarui!",
  };
}
