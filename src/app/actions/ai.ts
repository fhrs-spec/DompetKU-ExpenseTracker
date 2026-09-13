"use server";

import { createClient } from "@/lib/supabase/server";
import { parseTransactionWithAI, ParsedAITransaction } from "@/lib/ai/parse-transaction";
import {
  generateFinancialHealthAdvice,
  FinancialHealthAdvice,
} from "@/lib/ai/financial-advisor";
import { getAnalyticsData } from "@/lib/db/analytics";

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

    const parsed = await parseTransactionWithAI(input);
    return { success: true, data: parsed };
  } catch (err) {
    console.error("AI Parse Transaction Error:", err);
    return {
      success: false,
      error:
        err instanceof Error
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

    const analytics = await getAnalyticsData(year, month);

    const monthName = new Intl.DateTimeFormat("id-ID", { month: "long" }).format(
      new Date(year, month - 1, 1)
    );
    const periodLabel = `${monthName} ${year}`;

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
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Gagal menghasilkan analisis finansial AI. Silakan coba lagi.",
    };
  }
}
