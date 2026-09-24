import * as React from "react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface BalanceCardsProps {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  netDifference: number;
}

export function BalanceCards({
  totalBalance,
  monthlyIncome,
  monthlyExpense,
  netDifference,
}: BalanceCardsProps) {
  const isNetPositive = netDifference >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
      {/* 1. Total Saldo Kumulatif */}
      <Card className="p-4 sm:p-6 transition-all hover:border-primary/40">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-medium text-muted-foreground">
            Total Saldo
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Wallet className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 sm:mt-4">
          <h3 className="text-xl sm:text-2xl font-extrabold font-mono text-foreground tracking-tight break-all sm:break-normal">
            {formatCurrency(totalBalance)}
          </h3>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
            Akumulasi seluruh arus kas
          </p>
        </div>
      </Card>

      {/* 2. Total Pemasukan Bulan Ini */}
      <Card className="p-4 sm:p-6 transition-all hover:border-emerald-500/40">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-medium text-muted-foreground">
            Pemasukan Bulan Ini
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 sm:mt-4">
          <h3 className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight break-all sm:break-normal">
            +{formatCurrency(monthlyIncome)}
          </h3>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
            Total penerimaan bulan ini
          </p>
        </div>
      </Card>

      {/* 3. Total Pengeluaran Bulan Ini */}
      <Card className="p-4 sm:p-6 transition-all hover:border-destructive/40">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-medium text-muted-foreground">
            Pengeluaran Bulan Ini
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <ArrowDownLeft className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 sm:mt-4">
          <h3 className="text-xl sm:text-2xl font-extrabold font-mono text-destructive tracking-tight break-all sm:break-normal">
            -{formatCurrency(monthlyExpense)}
          </h3>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
            Total beban bulan ini
          </p>
        </div>
      </Card>

      {/* 4. Selisih / Tabungan Bersih */}
      <Card
        className={`p-4 sm:p-6 transition-all ${
          isNetPositive
            ? "hover:border-emerald-500/40"
            : "hover:border-destructive/40"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-medium text-muted-foreground">
            Tabungan Bersih
          </span>
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              isNetPositive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {isNetPositive ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )}
          </div>
        </div>
        <div className="mt-3 sm:mt-4">
          <h3
            className={`text-xl sm:text-2xl font-extrabold font-mono tracking-tight break-all sm:break-normal ${
              isNetPositive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-destructive"
            }`}
          >
            {isNetPositive ? "+" : ""}
            {formatCurrency(netDifference)}
          </h3>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
            {isNetPositive
              ? "Surplus keuangan bulan ini"
              : "Defisit keuangan bulan ini"}
          </p>
        </div>
      </Card>
    </div>
  );
}
