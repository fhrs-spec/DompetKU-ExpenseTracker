import * as React from "react";
import {
  TrendingUp,
  CreditCard,
  ShoppingBag,
  Receipt,
} from "lucide-react";
import { AnalyticsStats as StatsType } from "@/lib/db/analytics";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface AnalyticsStatsProps {
  stats: StatsType;
}

export function AnalyticsStatsCards({ stats }: AnalyticsStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* 1. Tingkat Tabungan (Savings Rate) */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Rasio Tabungan
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-extrabold font-mono text-foreground">
            {stats.savingsRate}%
          </h3>
          <div className="w-full bg-muted rounded-full h-2 mt-2.5 overflow-hidden">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(stats.savingsRate, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Dari total pemasukan tersimpan
          </p>
        </div>
      </Card>

      {/* 2. Pengeluaran Terbesar */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Beban Terbesar
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-extrabold text-foreground truncate">
            {stats.topExpenseCategory ? stats.topExpenseCategory.category : "-"}
          </h3>
          <p className="text-xs font-mono font-semibold text-destructive mt-1">
            {stats.topExpenseCategory
              ? formatCurrency(stats.topExpenseCategory.amount)
              : "Tidak ada pengeluaran"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Kategori porsi pengeluaran tertinggi
          </p>
        </div>
      </Card>

      {/* 3. Rata-rata Harian */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Rata-rata / Hari
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-extrabold font-mono text-foreground">
            {formatCurrency(stats.avgDailyExpense)}
          </h3>
          <p className="text-xs text-muted-foreground mt-2">
            Rata-rata belanja per hari di bulan ini
          </p>
        </div>
      </Card>

      {/* 4. Total Transaksi */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Aktivitas Transaksi
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Receipt className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-extrabold font-mono text-foreground">
            {stats.transactionCount}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              transaksi
            </span>
          </h3>
          <p className="text-xs text-muted-foreground mt-2">
            {stats.netSavings >= 0
              ? `Surplus ${formatCurrency(stats.netSavings)}`
              : `Defisit ${formatCurrency(Math.abs(stats.netSavings))}`}
          </p>
        </div>
      </Card>
    </div>
  );
}
