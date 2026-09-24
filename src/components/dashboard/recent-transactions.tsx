import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDownLeft, ArrowRight, Clock } from "lucide-react";
import { Transaction } from "@/types/database";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Transaksi Terakhir</CardTitle>
        </div>
        <Link
          href="/transactions"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          Lihat Semua
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="flex-1">
        {transactions.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground text-sm">
            Belum ada transaksi tercatat. Mulai catat transaksi Anda sekarang!
          </div>
        ) : (
          <div className="divide-y divide-border">
            {transactions.slice(0, 5).map((t) => {
              const isIncome = t.type === "income";

              return (
                <Link
                  key={t.id}
                  href="/transactions"
                  className="flex items-center justify-between py-2.5 sm:py-3 px-2 rounded-xl hover:bg-muted/50 active:bg-muted transition-colors cursor-pointer -mx-2"
                  title="Lihat di riwayat transaksi"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        isIncome
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {isIncome ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate max-w-[130px] xs:max-w-[180px] sm:max-w-xs">
                          {t.title}
                        </p>
                        <Badge
                          variant={isIncome ? "success" : "secondary"}
                          className="text-[10px] py-0"
                        >
                          {t.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(t.transaction_date)}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs sm:text-sm font-bold font-mono ${
                      isIncome
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-destructive"
                    }`}
                  >
                    {isIncome ? "+" : "-"} {formatCurrency(Number(t.amount))}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
