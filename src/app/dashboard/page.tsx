import { createClient } from "@/lib/supabase/server";
import {
  getMonthlySummary,
  getTransactions,
  getDashboardChartData,
} from "@/lib/db/transactions";
import { AppLayout } from "@/components/layout/app-layout";
import { BalanceCards } from "@/components/dashboard/balance-cards";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { MonthlyOverviewChart } from "@/components/dashboard/monthly-overview-chart";
import { QuickAddModal } from "@/components/dashboard/quick-add-modal";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [summary, transactions, chartData] = await Promise.all([
    getMonthlySummary(),
    getTransactions(),
    getDashboardChartData(),
  ]);

  const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Pengguna";

  return (
    <AppLayout userName={userName} userEmail={user?.email}>
      <div className="space-y-8">
        {/* Welcome Banner & Quick Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Ringkasan Keuangan
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Selamat datang kembali, <span className="font-semibold text-foreground">{userName}</span>. Berikut kondisi keuangan Anda saat ini.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <QuickAddModal />
          </div>
        </div>

        {/* 4 Summary Cards */}
        <BalanceCards
          totalBalance={summary.totalBalance}
          monthlyIncome={summary.monthlyIncome}
          monthlyExpense={summary.monthlyExpense}
          netDifference={summary.netDifference}
        />

        {/* Visualizations & Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <MonthlyOverviewChart data={chartData} />
          </div>
          <div className="lg:col-span-5">
            <RecentTransactions transactions={transactions} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
