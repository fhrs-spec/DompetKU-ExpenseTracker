"use server";

import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema, LoginInput, RegisterInput } from "@/lib/validations/auth";
import { redirect } from "next/navigation";

export interface AuthResponse {
  success: boolean;
  error?: string;
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
