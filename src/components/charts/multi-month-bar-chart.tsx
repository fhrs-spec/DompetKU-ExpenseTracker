"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { BarChart2 } from "lucide-react";
import { MonthlyComparison } from "@/lib/db/analytics";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface MultiMonthBarChartProps {
  data: MonthlyComparison[];
}

export function MultiMonthBarChart({ data }: MultiMonthBarChartProps) {
  const hasData = data.some((d) => d.income > 0 || d.expense > 0);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">
              Tren Pemasukan vs Pengeluaran (6 Bulan)
            </CardTitle>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Komparasi arus kas 6 bulan terakhir hingga periode terpilih
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-[300px] flex items-center justify-center pt-4">
        {!hasData ? (
          <div className="py-16 text-center text-muted-foreground text-sm flex flex-col items-center justify-center gap-2">
            <BarChart2 className="h-8 w-8 text-muted-foreground/40" />
            <p>Belum ada riwayat transaksi dalam 6 bulan terakhir.</p>
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  className="stroke-border"
                />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                tickFormatter={(val) =>
                  val >= 1000000
                    ? `${(val / 1000000).toFixed(1)}jt`
                    : val >= 1000
                    ? `${(val / 1000).toFixed(0)}rb`
                    : `${val}`
                }
                className="fill-muted-foreground"
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted)/0.3)" }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-xl border border-border bg-card p-3 shadow-card text-xs">
                        <p className="font-semibold text-foreground mb-1.5">
                          {label}
                        </p>
                        {payload.map((entry) => (
                          <div
                            key={entry.name}
                            className="flex items-center justify-between gap-4 py-0.5"
                          >
                            <span className="text-muted-foreground">
                              {entry.name === "income"
                                ? "Pemasukan"
                                : "Pengeluaran"}
                              :
                            </span>
                            <span className="font-bold font-mono text-foreground">
                              {formatCurrency(Number(entry.value))}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                formatter={(value) => (
                  <span className="text-xs font-medium text-foreground">
                    {value === "income" ? "Pemasukan" : "Pengeluaran"}
                  </span>
                )}
              />
              <Bar
                dataKey="income"
                fill="#22C55E"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                dataKey="expense"
                fill="#DC2626"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        )}
      </CardContent>
    </Card>
  );
}
