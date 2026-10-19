"use client";

import * as React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { BalanceTrendPoint } from "@/lib/db/analytics";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface BalanceLineChartProps {
  data: BalanceTrendPoint[];
}

export function BalanceLineChart({ data }: BalanceLineChartProps) {
  const hasData = data.length > 0;
  const hasNegative = data.some((d) => d.balance < 0);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Akumulasi Saldo Harian</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tren saldo berjalan dari hari ke hari
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-[300px] flex flex-col justify-center pt-4">
        {!hasData ? (
          <div className="py-16 text-center text-muted-foreground text-sm">
            Belum ada pergerakan saldo pada bulan ini.
          </div>
        ) : (
          <div className="w-full flex-1 flex flex-col justify-between">
            <div className="w-full overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-border">
              <div className="min-w-[580px] sm:min-w-0 h-[280px] sm:h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16A34A" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#16A34A" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
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
                          : val <= -1000000
                          ? `-${(Math.abs(val) / 1000000).toFixed(1)}jt`
                          : val <= -1000
                          ? `-${(Math.abs(val) / 1000).toFixed(0)}rb`
                          : `${val}`
                      }
                      className="fill-muted-foreground"
                    />
                    {hasNegative && (
                      <ReferenceLine
                        y={0}
                        stroke="#DC2626"
                        strokeDasharray="3 3"
                        strokeOpacity={0.7}
                      />
                    )}
                    <Tooltip
                      cursor={{ stroke: "hsl(var(--muted-foreground)/0.4)", strokeWidth: 1 }}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const val = Number(payload[0].value);
                          return (
                            <div className="rounded-xl border border-border bg-card p-3 shadow-card text-xs">
                              <p className="font-semibold text-foreground mb-1">
                                {label}
                              </p>
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-muted-foreground">
                                  Saldo Akhir Hari:
                                </span>
                                <span
                                  className={`font-bold font-mono ${
                                    val >= 0 ? "text-primary" : "text-destructive"
                                  }`}
                                >
                                  {formatCurrency(val)}
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="balance"
                      stroke="#16A34A"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#balanceGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="flex sm:hidden items-center justify-center gap-1.5 text-[11px] text-muted-foreground/75 pt-1">
              <span>← Geser grafik untuk melihat hari lainnya →</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
