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

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Akumulasi Saldo Harian</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-[300px] flex items-center justify-center pt-4">
        {!hasData ? (
          <div className="py-16 text-center text-muted-foreground text-sm">
            Belum ada pergerakan saldo pada bulan ini.
          </div>
        ) : (
          <div className="h-[300px] w-full">
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
                      : `${val}`
                  }
                  className="fill-muted-foreground"
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-xl border border-border bg-card p-3 shadow-card text-xs">
                          <p className="font-semibold text-foreground mb-1">
                            {label}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              Saldo Kumulatif:
                            </span>
                            <span className="font-bold font-mono text-primary">
                              {formatCurrency(Number(payload[0].value))}
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
        )}
      </CardContent>
    </Card>
  );
}
