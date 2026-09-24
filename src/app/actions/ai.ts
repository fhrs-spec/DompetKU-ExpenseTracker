"use server";

import { createClient } from "@/lib/supabase/server";
import { parseTransactionWithAI, ParsedAITransaction } from "@/lib/ai/parse-transaction";
import { parseReceiptWithAI } from "@/lib/ai/parse-receipt";
import {
  generateFinancialHealthAdvice,
  FinancialHealthAdvice,
} from "@/lib/ai/financial-advisor";
import { getAnalyticsData } from "@/lib/db/analytics";
import { checkAIRateLimit, DAILY_LIMITS } from "@/lib/ai/rate-limiter";
import { isAppOwner } from "@/lib/auth/admin";

export interface AIActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function parseTransactionAction(
  input: string
): Promise<AIActionResponse<ParsedAITransaction>> {
  if (!input || input.trim().length === 0) {
    return { success: false, error: "Kalimat transaksi tidak boleh kosong." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Silakan login terlebih dahulu." };
    }

    // Rate limit check (Bypassed for verified owner mfharas5@gmail.com)
    const rateCheck = checkAIRateLimit(user.id, user.email, "parse");
    if (!rateCheck.allowed) {
      return { success: false, error: rateCheck.error };
    }

    const parsed = await parseTransactionWithAI(input);
    return { success: true, data: parsed };
  } catch (err) {
    console.error("AI Parse Transaction Error:", err);
    const isTimeout =
      err instanceof Error &&
      (err.name === "AbortError" || err.message.toLowerCase().includes("aborted"));
    const isQuota =
      err instanceof Error &&
      (err.message.includes("429") || err.message.includes("RESOURCE_EXHAUSTED"));
    return {
      success: false,
      error: isTimeout
        ? "Permintaan AI melebihi batas waktu (timeout 10 detik). Silakan coba lagi."
        : isQuota
        ? "Layanan AI sedang sibuk atau kuota tercapai. Silakan coba beberapa saat lagi."
        : err instanceof Error
        ? err.message
        : "Gagal memproses transaksi dengan AI. Silakan coba lagi.",
    };
  }
}

export async function getFinancialHealthCheckAction(
  year: number,
  month: number
): Promise<AIActionResponse<FinancialHealthAdvice>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Silakan login terlebih dahulu." };
    }

    // Rate limit check (Bypassed for verified owner mfharas5@gmail.com)
    const rateCheck = checkAIRateLimit(user.id, user.email, "health_audit");
    if (!rateCheck.allowed) {
      return { success: false, error: rateCheck.error };
    }

    const now = new Date();
    const validYear =
      typeof year === "number" && !isNaN(year) && year >= 2000 && year <= 2100
        ? Math.floor(year)
        : now.getFullYear();
    const validMonth =
      typeof month === "number" && !isNaN(month) && month >= 1 && month <= 12
        ? Math.floor(month)
        : now.getMonth() + 1;

    const analytics = await getAnalyticsData(validYear, validMonth);

    const monthName = new Intl.DateTimeFormat("id-ID", { month: "long" }).format(
      new Date(validYear, validMonth - 1, 1)
    );
    const periodLabel = `${monthName} ${validYear}`;

    const advice = await generateFinancialHealthAdvice({
      periodLabel,
      totalBalance: analytics.totalBalance,
      monthlyIncome: analytics.stats.totalIncome,
      monthlyExpense: analytics.stats.totalExpense,
      netSavings: analytics.stats.netSavings,
      savingsRate: analytics.stats.savingsRate,
      categories: analytics.categoryExpenses,
    });

    return { success: true, data: advice };
  } catch (err) {
    console.error("AI Financial Health Error:", err);
    const isTimeout =
      err instanceof Error &&
      (err.name === "AbortError" || err.message.toLowerCase().includes("aborted"));
    const isQuota =
      err instanceof Error &&
      (err.message.includes("429") || err.message.includes("RESOURCE_EXHAUSTED"));
    return {
      success: false,
      error: isTimeout
        ? "Permintaan analisis AI melebihi batas waktu (timeout 10 detik). Silakan coba lagi."
        : isQuota
        ? "Layanan AI sedang sibuk atau kuota tercapai. Silakan coba beberapa saat lagi."
        : "Gagal menghasilkan analisis finansial AI. Silakan coba lagi.",
    };
  }
}

export async function parseReceiptAction(
  imageBase64: string,
  mimeType?: string
): Promise<AIActionResponse<ParsedAITransaction>> {
  if (!imageBase64 || imageBase64.trim().length === 0) {
    return { success: false, error: "Gambar struk belanja tidak boleh kosong." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Silakan login terlebih dahulu." };
    }

    // Rate limit check (Bypassed for verified owner mfharas5@gmail.com)
    const rateCheck = checkAIRateLimit(user.id, user.email, "scan_receipt");
    if (!rateCheck.allowed) {
      return { success: false, error: rateCheck.error };
    }

    const parsed = await parseReceiptWithAI({ imageBase64, mimeType });
    return { success: true, data: parsed };
  } catch (err) {
    console.error("AI Parse Receipt Error:", err);
    const isTimeout =
      err instanceof Error &&
      (err.name === "AbortError" || err.message.toLowerCase().includes("aborted"));
    const isQuota =
      err instanceof Error &&
      (err.message.includes("429") || err.message.includes("RESOURCE_EXHAUSTED"));
    return {
      success: false,
      error: isTimeout
        ? "Pemindaian struk melebihi batas waktu (timeout 15 detik). Pastikan koneksi internet stabil dan coba lagi."
        : isQuota
        ? "Layanan AI sedang sibuk atau kuota tercapai. Silakan coba beberapa saat lagi."
        : err instanceof Error
        ? err.message
        : "Gagal memindai struk belanja dengan AI. Silakan coba lagi.",
    };
  }
}

export async function getUserAIQuotaAction(): Promise<{
  isOwner: boolean;
  email?: string;
  parseLimit: number;
  scanLimit: number;
  auditLimit: number;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isOwner: false, parseLimit: 0, scanLimit: 0, auditLimit: 0 };
  }

  const isOwner = isAppOwner(user.email);
  return {
    isOwner,
    email: user.email,
    parseLimit: isOwner ? 999999 : DAILY_LIMITS.parse,
    scanLimit: isOwner ? 999999 : DAILY_LIMITS.scan_receipt,
    auditLimit: isOwner ? 999999 : DAILY_LIMITS.health_audit,
  };
}
