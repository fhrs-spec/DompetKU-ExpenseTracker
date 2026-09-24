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
import { BarChart3 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ChartDataPoint {
  date: string;
  income: number;
  expense: number;
}

interface MonthlyOverviewChartProps {
  data: ChartDataPoint[];
}

export function MonthlyOverviewChart({ data }: MonthlyOverviewChartProps) {
  // Filter out days with 0 income and 0 expense to make chart clean if desired, or show all
  const hasActivity = data.some((d) => d.income > 0 || d.expense > 0);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Arus Kas Bulan Ini</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-[300px] flex items-center justify-center pt-4">
        {!hasActivity ? (
          <div className="py-16 text-center text-muted-foreground text-sm">
            Belum ada data transaksi pada bulan ini untuk divisualisasikan.
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-[11px] text-muted-foreground/80 text-right sm:hidden">
              Geser grafik untuk melihat hari lainnya &rarr;
            </p>
            <div className="w-full overflow-x-auto no-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
              <div className="h-[280px] sm:h-[300px] min-w-[500px] sm:min-w-0 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      className="stroke-border"
                    />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                      interval="preserveStartEnd"
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
                                  <span className="text-muted-foreground capitalize">
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
                      radius={[6, 6, 0, 0]}
                      maxBarSize={28}
                    />
                    <Bar
                      dataKey="expense"
                      fill="#DC2626"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={28}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
