import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTransactions, TransactionFilterOptions } from "@/lib/db/transactions";
import { AppLayout } from "@/components/layout/app-layout";
import { TransactionList } from "@/components/transactions/transaction-list";
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

  const transactions = await getTransactions(filters as TransactionFilterOptions);

  return (
    <AppLayout
      userName={user?.user_metadata?.name}
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

          <Link href="/transactions/add">
            <Button className="gap-2 shadow-soft">
              <Plus className="h-4 w-4" />
              Catat Transaksi
            </Button>
          </Link>
        </div>

        {/* Interactive List and Filter Component */}
        <TransactionList transactions={transactions} />
      </div>
    </AppLayout>
  );
}
