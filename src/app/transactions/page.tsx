import Link from "next/link";
import { Plus, Receipt, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTransactions, TransactionFilterOptions, getMonthlySummary } from "@/lib/db/transactions";
import { AppLayout } from "@/components/layout/app-layout";
import { TransactionList } from "@/components/transactions/transaction-list";
import { ExportPdfButton } from "@/components/export-pdf-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    type?: "income" | "expense";
    category?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function TransactionsPage({ searchParams }: PageProps) {
  const filters = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [transactions, summary] = await Promise.all([
    getTransactions(filters as TransactionFilterOptions),
    getMonthlySummary(),
  ]);

  const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Pengguna";

  let txIncome = 0;
  let txExpense = 0;
  const catMap = new Map<string, number>();

  transactions.forEach((tx) => {
    const amt = Number(tx.amount) || 0;
    if (tx.type === "income") txIncome += amt;
    else {
      txExpense += amt;
      catMap.set(tx.category, (catMap.get(tx.category) || 0) + amt);
    }
  });

  const categories = Array.from(catMap.entries()).map(([category, amount]) => ({
    category,
    amount,
    percentage: txExpense > 0 ? Math.round((amount / txExpense) * 100) : 0,
  }));

  const reportData = {
    userName,
    userEmail: user?.email || "user@dompetku.local",
    period: "Filter Terpilih",
    totalBalance: summary.totalBalance,
    totalIncome: txIncome,
    totalExpense: txExpense,
    netSavings: txIncome - txExpense,
    categories,
    transactions: transactions.map((t) => ({
      title: t.title,
      amount: t.amount,
      type: t.type,
      category: t.category,
      transaction_date: t.transaction_date,
    })),
  };

  return (
    <AppLayout
      userName={userName}
      userEmail={user?.email}
    >
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Riwayat Transaksi
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Kelola, cari, dan tinjau seluruh pemasukan serta pengeluaran Anda.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <ExportPdfButton reportData={reportData} />
            <Link href="/transactions/add" className="hidden sm:inline-flex">
              <Button className="gap-2 shadow-soft">
                <Plus className="h-4 w-4" />
                Catat Transaksi
              </Button>
            </Link>
          </div>
        </div>

        {/* 3 Summary Metrics: swipeable horizontal scroll on mobile, 3-col grid on sm+ */}
        <div className="flex sm:grid overflow-x-auto sm:overflow-visible grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 pb-1 sm:pb-0 no-scrollbar snap-x snap-mandatory">
          <Card className="min-w-[220px] xs:min-w-[240px] sm:min-w-0 flex-1 shrink-0 snap-start p-3.5 sm:p-5 transition-all hover:border-primary/40">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                Total Transaksi
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Receipt className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2.5 sm:mt-3">
              <h3 className="text-xl sm:text-2xl font-extrabold font-mono text-foreground tracking-tight break-all sm:break-normal">
                {transactions.length}
              </h3>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                Catatan transaksi aktif
              </p>
            </div>
          </Card>

          <Card className="min-w-[220px] xs:min-w-[240px] sm:min-w-0 flex-1 shrink-0 snap-start p-3.5 sm:p-5 transition-all hover:border-emerald-500/40">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                Total Pemasukan
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2.5 sm:mt-3">
              <h3 className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight break-all sm:break-normal">
                +{formatCurrency(txIncome)}
              </h3>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                Penerimaan dalam filter
              </p>
            </div>
          </Card>

          <Card className="min-w-[220px] xs:min-w-[240px] sm:min-w-0 flex-1 shrink-0 snap-start p-3.5 sm:p-5 transition-all hover:border-destructive/40">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                Total Pengeluaran
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <ArrowDownLeft className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2.5 sm:mt-3">
              <h3 className="text-xl sm:text-2xl font-extrabold font-mono text-destructive tracking-tight break-all sm:break-normal">
                -{formatCurrency(txExpense)}
              </h3>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                Pengeluaran dalam filter
              </p>
            </div>
          </Card>
        </div>

        {/* Interactive List and Filter Component */}
        <TransactionList transactions={transactions} />
      </div>
    </AppLayout>
  );
}
