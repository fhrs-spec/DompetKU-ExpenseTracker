import { createClient } from "@/lib/supabase/server";
import { Transaction } from "@/types/database";

export interface TransactionFilterOptions {
  search?: string;
  type?: "income" | "expense";
  category?: string;
  startDate?: string;
  endDate?: string;
}

export async function getTransactions(
  filters?: TransactionFilterOptions
): Promise<Transaction[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  let query = supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
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

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }

  return (data as unknown as Transaction[]) || [];
}

export async function getTransactionById(
  id: string
): Promise<Transaction | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as unknown as Transaction;
}

export async function getMonthlySummary(year?: number, month?: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
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

  // 1. Fetch all transactions to compute overall total balance
  const { data: allTransactions } = await supabase
    .from("transactions")
    .select("amount, type")
    .eq("user_id", user.id);

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

  // 2. Fetch current month transactions for income and expense totals
  const { data: monthlyTransactions } = await supabase
    .from("transactions")
    .select("amount, type")
    .eq("user_id", user.id)
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

export async function getDashboardChartData(year?: number, month?: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const now = new Date();
  const targetYear = year ?? now.getFullYear();
  const targetMonth = month ?? now.getMonth() + 1;

  const startDate = `${targetYear}-${String(targetMonth).padStart(2, "0")}-01`;
  const lastDay = new Date(targetYear, targetMonth, 0).getDate();
  const endDate = `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const { data } = await supabase
    .from("transactions")
    .select("transaction_date, amount, type")
    .eq("user_id", user.id)
    .gte("transaction_date", startDate)
    .lte("transaction_date", endDate)
    .order("transaction_date", { ascending: true });

  if (!data) return [];

  const monthLabel = new Intl.DateTimeFormat("id-ID", { month: "short" }).format(
    new Date(targetYear, targetMonth - 1, 1)
  );

  const map = new Map<string, { date: string; income: number; expense: number }>();

  for (let d = 1; d <= lastDay; d++) {
    const dayStr = `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    map.set(dayStr, {
      date: `${d} ${monthLabel}`,
      income: 0,
      expense: 0,
    });
  }

  const rows = data as unknown as Array<{
    transaction_date: string;
    amount: number;
    type: "income" | "expense";
  }>;

  rows.forEach((item) => {
    const entry = map.get(item.transaction_date);
    if (entry) {
      const amt = Number(item.amount) || 0;
      if (item.type === "income") entry.income += amt;
      else entry.expense += amt;
    }
  });

  return Array.from(map.values());
}
