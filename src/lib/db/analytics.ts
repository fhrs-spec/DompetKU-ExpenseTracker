import { createClient } from "@/lib/supabase/server";

export interface CategoryExpense {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface MonthlyComparison {
  month: string;
  income: number;
  expense: number;
}

export interface BalanceTrendPoint {
  date: string;
  balance: number;
}

export interface AnalyticsStats {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number;
  topExpenseCategory: { category: string; amount: number } | null;
  avgDailyExpense: number;
  transactionCount: number;
}

export interface ReportTransaction {
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  transaction_date: string;
}

export interface AnalyticsData {
  selectedMonth: number;
  selectedYear: number;
  totalBalance: number;
  openingBalance: number;
  stats: AnalyticsStats;
  categoryExpenses: CategoryExpense[];
  multiMonthTrend: MonthlyComparison[];
  balanceTrend: BalanceTrendPoint[];
  transactions: ReportTransaction[];
}

const CATEGORY_COLORS = [
  "#16A34A", // Emerald / Primary
  "#2563EB", // Blue
  "#F59E0B", // Amber
  "#DC2626", // Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#64748B", // Slate
];

export async function getAnalyticsData(
  year?: number,
  month?: number,
  userId?: string
): Promise<AnalyticsData> {
  const supabase = await createClient();

  let currentUserId = userId;
  if (!currentUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    currentUserId = user?.id;
  }

  const now = new Date();
  const selectedYear =
    typeof year === "number" && !isNaN(year) && year >= 2000 && year <= 2100
      ? Math.floor(year)
      : now.getFullYear();
  const selectedMonth =
    typeof month === "number" && !isNaN(month) && month >= 1 && month <= 12
      ? Math.floor(month)
      : now.getMonth() + 1;

  if (!currentUserId) {
    return {
      selectedMonth,
      selectedYear,
      totalBalance: 0,
      openingBalance: 0,
      stats: {
        totalIncome: 0,
        totalExpense: 0,
        netSavings: 0,
        savingsRate: 0,
        topExpenseCategory: null,
        avgDailyExpense: 0,
        transactionCount: 0,
      },
      categoryExpenses: [],
      multiMonthTrend: [],
      balanceTrend: [],
      transactions: [],
    };
  }

  // 0. Compute overall total balance (attempt RPC first)
  let totalBalance = 0;
  let rpcSuccess = false;

  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "get_financial_summary",
      {
        p_start_date: `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`,
        p_end_date: `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`,
      }
    );
    if (!rpcError && rpcData && typeof rpcData === "object") {
      const summary = rpcData as { total_balance?: number };
      if (typeof summary.total_balance === "number") {
        totalBalance = summary.total_balance;
        rpcSuccess = true;
      }
    }
  } catch {
    // Fall back to table scan
  }

  if (!rpcSuccess) {
    const { data: allTxs } = await supabase
      .from("transactions")
      .select("amount, type")
      .eq("user_id", currentUserId);

    if (allTxs) {
      const rows = allTxs as unknown as Array<{
        amount: number;
        type: "income" | "expense";
      }>;
      totalBalance = rows.reduce((acc, curr) => {
        const amt = Number(curr.amount) || 0;
        return curr.type === "income" ? acc + amt : acc - amt;
      }, 0);
    }
  }

  // Calculate start & end of selected month
  const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`;
  const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
  const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  // 1. Fetch transactions for selected month
  const { data: monthTransactions } = await supabase
    .from("transactions")
    .select("title, amount, type, category, transaction_date")
    .eq("user_id", currentUserId)
    .gte("transaction_date", startDate)
    .lte("transaction_date", endDate)
    .order("transaction_date", { ascending: false });

  const currentMonthRows = (monthTransactions as unknown as Array<{
    title: string;
    amount: number;
    type: "income" | "expense";
    category: string;
    transaction_date: string;
  }>) || [];

  let totalIncome = 0;
  let totalExpense = 0;
  const categoryMap = new Map<string, number>();

  currentMonthRows.forEach((tx) => {
    const amt = Number(tx.amount) || 0;
    if (tx.type === "income") {
      totalIncome += amt;
    } else {
      totalExpense += amt;
      categoryMap.set(tx.category, (categoryMap.get(tx.category) || 0) + amt);
    }
  });

  const netSavings = totalIncome - totalExpense;
  const savingsRate =
    totalIncome > 0
      ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100))
      : 0;

  // Compute category breakdown with percentage and assigned color
  const sortedCategories = Array.from(categoryMap.entries()).sort(
    (a, b) => b[1] - a[1]
  );

  const topExpenseCategory =
    sortedCategories.length > 0
      ? { category: sortedCategories[0][0], amount: sortedCategories[0][1] }
      : null;

  const categoryExpenses: CategoryExpense[] = sortedCategories.map(
    ([category, amount], index) => ({
      category,
      amount,
      percentage:
        totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    })
  );

  // Calculate realistic average daily expense (elapsed days for current month, lastDay for past months)
  const isCurrentMonth =
    selectedYear === now.getFullYear() && selectedMonth === now.getMonth() + 1;
  const effectiveDays = isCurrentMonth
    ? Math.max(1, Math.min(now.getDate(), lastDay))
    : Math.max(1, lastDay);
  const avgDailyExpense = Math.round(totalExpense / effectiveDays);

  // Calculate opening balance carried over before the selected month
  const { data: previousTxs } = await supabase
    .from("transactions")
    .select("amount, type")
    .eq("user_id", currentUserId)
    .lt("transaction_date", startDate);

  let openingBalance = 0;
  if (previousTxs) {
    const rows = previousTxs as unknown as Array<{
      amount: number;
      type: "income" | "expense";
    }>;
    openingBalance = rows.reduce((acc, curr) => {
      const amt = Number(curr.amount) || 0;
      return curr.type === "income" ? acc + amt : acc - amt;
    }, 0);
  }

  // 2. Compute cumulative daily balance trend throughout selected month starting from opening balance
  let cumulative = openingBalance;
  const dailyBalanceMap = new Map<string, number>();

  for (let d = 1; d <= lastDay; d++) {
    const dStr = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    dailyBalanceMap.set(dStr, 0);
  }

  currentMonthRows.forEach((tx) => {
    const amt = Number(tx.amount) || 0;
    const diff = tx.type === "income" ? amt : -amt;
    dailyBalanceMap.set(
      tx.transaction_date,
      (dailyBalanceMap.get(tx.transaction_date) || 0) + diff
    );
  });

  const monthLabel = new Intl.DateTimeFormat("id-ID", { month: "short" }).format(
    new Date(selectedYear, selectedMonth - 1, 1)
  );

  const balanceTrend: BalanceTrendPoint[] = [];
  dailyBalanceMap.forEach((dailyDiff, dateStr) => {
    cumulative += dailyDiff;
    const dayNumber = parseInt(dateStr.split("-")[2], 10);
    balanceTrend.push({
      date: `${dayNumber} ${monthLabel}`,
      balance: cumulative,
    });
  });

  // 3. Compute 6-Month Historical Comparison
  const sixMonthsAgo = new Date(selectedYear, selectedMonth - 6, 1);
  const sixMonthsStart = `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, "0")}-01`;

  const { data: historicalData } = await supabase
    .from("transactions")
    .select("amount, type, transaction_date")
    .eq("user_id", currentUserId)
    .gte("transaction_date", sixMonthsStart)
    .lte("transaction_date", endDate);

  const histRows = (historicalData as unknown as Array<{
    amount: number;
    type: "income" | "expense";
    transaction_date: string;
  }>) || [];

  // Group historical rows by YYYY-MM
  const multiMonthMap = new Map<string, { income: number; expense: number; label: string }>();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(selectedYear, selectedMonth - 1 - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = new Intl.DateTimeFormat("id-ID", {
      month: "short",
      year: "2-digit",
    }).format(d);
    multiMonthMap.set(key, { income: 0, expense: 0, label });
  }

  histRows.forEach((r) => {
    const key = r.transaction_date.slice(0, 7); // YYYY-MM
    const entry = multiMonthMap.get(key);
    if (entry) {
      const amt = Number(r.amount) || 0;
      if (r.type === "income") entry.income += amt;
      else entry.expense += amt;
    }
  });

  const multiMonthTrend: MonthlyComparison[] = Array.from(
    multiMonthMap.values()
  ).map((val) => ({
    month: val.label,
    income: val.income,
    expense: val.expense,
  }));

  return {
    selectedMonth,
    selectedYear,
    totalBalance,
    openingBalance,
    stats: {
      totalIncome,
      totalExpense,
      netSavings,
      savingsRate,
      topExpenseCategory,
      avgDailyExpense,
      transactionCount: currentMonthRows.length,
    },
    categoryExpenses,
    multiMonthTrend,
    balanceTrend,
    transactions: currentMonthRows,
  };
}
