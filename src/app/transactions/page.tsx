import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTransactions, TransactionFilterOptions, getMonthlySummary } from "@/lib/db/transactions";
import { AppLayout } from "@/components/layout/app-layout";
import { TransactionList } from "@/components/transactions/transaction-list";
import { ExportPdfButton } from "@/components/export-pdf-button";
import { Button } from "@/components/ui/button";

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
      <div className="space-y-6">
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

          <div className="flex items-center gap-2.5">
            <ExportPdfButton reportData={reportData} />
            <Link href="/transactions/add">
              <Button className="gap-2 shadow-soft">
                <Plus className="h-4 w-4" />
                Catat Transaksi
              </Button>
            </Link>
          </div>
        </div>

        {/* Interactive List and Filter Component */}
        <TransactionList transactions={transactions} />
      </div>
    </AppLayout>
  );
}
