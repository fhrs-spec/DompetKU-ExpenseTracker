import { createClient } from "@/lib/supabase/server";
import { Transaction } from "@/types/database";

export interface TransactionFilterOptions {
  search?: string;
  type?: "income" | "expense";
  category?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export async function getTransactions(
  filters?: TransactionFilterOptions,
  userId?: string
): Promise<Transaction[]> {
  const supabase = await createClient();

  let currentUserId = userId;
  if (!currentUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    currentUserId = user?.id;
  }

  if (!currentUserId) return [];

  let query = supabase
    .from("transactions")
    .select("*")
    .eq("user_id", currentUserId)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters?.search && filters.search.trim()) {
    query = query.ilike("title", `%${filters.search.trim()}%`);
  }

  if (filters?.type) {
    query = query.eq("type", filters.type);
  }

  if (filters?.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }

  if (filters?.startDate) {
    query = query.gte("transaction_date", filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte("transaction_date", filters.endDate);
  }

  if (
    filters?.limit &&
    typeof filters.limit === "number" &&
    Number.isFinite(filters.limit) &&
    filters.limit > 0
  ) {
    query = query.limit(Math.floor(filters.limit));
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }

  return (data as unknown as Transaction[]) || [];
}

export async function getTransactionById(
  id: string,
  userId?: string
): Promise<Transaction | null> {
  const supabase = await createClient();

  let currentUserId = userId;
  if (!currentUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    currentUserId = user?.id;
  }

  if (!currentUserId) return null;

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .eq("user_id", currentUserId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as unknown as Transaction;
}

export async function getMonthlySummary(
  year?: number,
  month?: number,
  userId?: string
) {
  const supabase = await createClient();

  let currentUserId = userId;
  if (!currentUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    currentUserId = user?.id;
  }

  if (!currentUserId) {
    return {
      totalBalance: 0,
      monthlyIncome: 0,
      monthlyExpense: 0,
      netDifference: 0,
    };
  }

  const now = new Date();
  const targetYear = year ?? now.getFullYear();
  const targetMonth = month ?? now.getMonth() + 1;

  // Format first day and last day of target month: YYYY-MM-DD
  const startDate = `${targetYear}-${String(targetMonth).padStart(2, "0")}-01`;
  const lastDay = new Date(targetYear, targetMonth, 0).getDate();
  const endDate = `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  // Try high-performance database RPC function first
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "get_financial_summary",
      {
        p_start_date: startDate,
        p_end_date: endDate,
      }
    );

    if (!rpcError && rpcData && typeof rpcData === "object") {
      const summary = rpcData as {
        total_balance?: number;
        period_income?: number;
        period_expense?: number;
      };
      const totalBalance = Number(summary.total_balance) || 0;
      const monthlyIncome = Number(summary.period_income) || 0;
      const monthlyExpense = Number(summary.period_expense) || 0;
      return {
        totalBalance,
        monthlyIncome,
        monthlyExpense,
        netDifference: monthlyIncome - monthlyExpense,
      };
    }
  } catch {
    // Fall back to standard query if RPC not defined
  }

  // Fallback 1: Fetch all transactions to compute overall total balance
  const { data: allTransactions } = await supabase
    .from("transactions")
    .select("amount, type")
    .eq("user_id", currentUserId);

  let totalBalance = 0;
  if (allTransactions) {
    const rows = allTransactions as unknown as Array<{
      amount: number;
      type: "income" | "expense";
    }>;
    totalBalance = rows.reduce((acc, curr) => {
      const amt = Number(curr.amount) || 0;
      return curr.type === "income" ? acc + amt : acc - amt;
    }, 0);
  }

  // Fallback 2: Fetch current month transactions for income and expense totals
  const { data: monthlyTransactions } = await supabase
    .from("transactions")
    .select("amount, type")
    .eq("user_id", currentUserId)
    .gte("transaction_date", startDate)
    .lte("transaction_date", endDate);

  let monthlyIncome = 0;
  let monthlyExpense = 0;

  if (monthlyTransactions) {
    const rows = monthlyTransactions as unknown as Array<{
      amount: number;
      type: "income" | "expense";
    }>;
    rows.forEach((t) => {
      const amt = Number(t.amount) || 0;
      if (t.type === "income") monthlyIncome += amt;
      else monthlyExpense += amt;
    });
  }

  const netDifference = monthlyIncome - monthlyExpense;

  return {
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    netDifference,
  };
}

export interface DashboardChartDataPoint {
  date: string;
  income: number;
  expense: number;
}

export async function getDashboardChartData(
  year?: number,
  month?: number,
  userId?: string
): Promise<DashboardChartDataPoint[]> {
  const supabase = await createClient();

  let currentUserId = userId;
  if (!currentUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    currentUserId = user?.id;
  }

  if (!currentUserId) return [];

  const now = new Date();
  const targetYear = year ?? now.getFullYear();
  const targetMonth = month ?? now.getMonth() + 1;

  const startDate = `${targetYear}-${String(targetMonth).padStart(2, "0")}-01`;
  const lastDay = new Date(targetYear, targetMonth, 0).getDate();
  const endDate = `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const { data } = await supabase
    .from("transactions")
    .select("transaction_date, amount, type")
    .eq("user_id", currentUserId)
    .gte("transaction_date", startDate)
    .lte("transaction_date", endDate)
    .order("transaction_date", { ascending: true });

  if (!data) return [];

  const monthLabel = new Intl.DateTimeFormat("id-ID", { month: "short" }).format(
    new Date(targetYear, targetMonth - 1, 1)
  );

  const rows = (data as unknown as Array<{
    transaction_date: string;
    amount: number;
    type: "income" | "expense";
  }>) || [];

  const isCurrentMonth =
    targetYear === now.getFullYear() && targetMonth === now.getMonth() + 1;
  const isFutureMonth =
    targetYear > now.getFullYear() ||
    (targetYear === now.getFullYear() && targetMonth > now.getMonth() + 1);

  const maxTxDay = rows.reduce((max, item) => {
    const parts = item.transaction_date.split("-");
    const day = parts.length === 3 ? parseInt(parts[2], 10) : 0;
    return Math.max(max, isNaN(day) ? 0 : day);
  }, 0);

  const activeLastDay = isCurrentMonth
    ? Math.min(lastDay, Math.max(now.getDate(), maxTxDay))
    : isFutureMonth
    ? maxTxDay
    : lastDay;

  const map = new Map<string, DashboardChartDataPoint>();

  for (let d = 1; d <= activeLastDay; d++) {
    const dayStr = `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    map.set(dayStr, {
      date: `${d} ${monthLabel}`,
      income: 0,
      expense: 0,
    });
  }

  rows.forEach((item) => {
    const dateKey = item.transaction_date.slice(0, 10);
    const entry = map.get(dateKey);
    if (entry) {
      const amt = Number(item.amount) || 0;
      if (item.type === "income") entry.income += amt;
      else entry.expense += amt;
    }
  });

  return Array.from(map.values());
}
