import { createClient } from "@/lib/supabase/server";
import { getAnalyticsData } from "@/lib/db/analytics";
import { AppLayout } from "@/components/layout/app-layout";
import { MonthYearPicker } from "@/components/charts/month-year-picker";
import { AnalyticsStatsCards } from "@/components/charts/analytics-stats";
import { ExpensePieChart } from "@/components/charts/expense-pie-chart";
import { MultiMonthBarChart } from "@/components/charts/multi-month-bar-chart";
import { BalanceLineChart } from "@/components/charts/balance-line-chart";
import { ExportPdfButton } from "@/components/export-pdf-button";
import { AiAdvisorCard } from "@/components/analytics/ai-advisor-card";

interface AnalyticsPageProps {
  searchParams: Promise<{
    month?: string;
    year?: string;
  }>;
}

export default async function AnalyticsPage({
  searchParams,
}: AnalyticsPageProps) {
  const params = await searchParams;
  const now = new Date();
  const selectedMonth = params.month ? parseInt(params.month, 10) : now.getMonth() + 1;
  const selectedYear = params.year ? parseInt(params.year, 10) : now.getFullYear();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const analytics = await getAnalyticsData(selectedYear, selectedMonth);
  const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Pengguna";

  const monthName = new Intl.DateTimeFormat("id-ID", { month: "long" }).format(
    new Date(selectedYear, selectedMonth - 1, 1)
  );
  const periodLabel = `${monthName} ${selectedYear}`;

  const reportData = {
    userName,
    userEmail: user?.email || "user@dompetku.local",
    period: periodLabel,
    totalBalance: analytics.totalBalance,
    totalIncome: analytics.stats.totalIncome,
    totalExpense: analytics.stats.totalExpense,
    netSavings: analytics.stats.netSavings,
    categories: analytics.categoryExpenses,
    transactions: analytics.transactions,
  };

  return (
    <AppLayout userName={userName} userEmail={user?.email}>
      <div className="space-y-8">
        {/* Page Header with Period Filter & PDF Export */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Analitik Keuangan Bulanan
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Wawasan mendalam mengenai struktur pengeluaran dan tren arus kas Anda.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <MonthYearPicker
              currentMonth={selectedMonth}
              currentYear={selectedYear}
            />
            <ExportPdfButton reportData={reportData} />
          </div>
        </div>

        {/* 4 Financial Insight Metrics */}
        <AnalyticsStatsCards stats={analytics.stats} />

        {/* AI Financial Health Audit */}
        <AiAdvisorCard
          year={selectedYear}
          month={selectedMonth}
          periodLabel={periodLabel}
        />

        {/* Breakdown Row: Pie Chart & Line Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <ExpensePieChart categories={analytics.categoryExpenses} />
          </div>
          <div className="lg:col-span-6">
            <BalanceLineChart data={analytics.balanceTrend} />
          </div>
        </div>

        {/* Multi-Month Historical Trend */}
        <div className="w-full">
          <MultiMonthBarChart data={analytics.multiMonthTrend} />
        </div>
      </div>
    </AppLayout>
  );
}
