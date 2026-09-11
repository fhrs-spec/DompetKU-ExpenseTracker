"use client";

import * as React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { PieChart as PieIcon } from "lucide-react";
import { CategoryExpense } from "@/lib/db/analytics";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ExpensePieChartProps {
  categories: CategoryExpense[];
}

export function ExpensePieChart({ categories }: ExpensePieChartProps) {
  const hasExpenses = categories.length > 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <PieIcon className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Kategori Pengeluaran</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between pt-2">
        {!hasExpenses ? (
          <div className="py-16 text-center text-muted-foreground text-sm flex-1 flex items-center justify-center">
            Belum ada pengeluaran pada bulan ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* Donut Chart */}
            <div className="sm:col-span-6 h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as CategoryExpense;
                        return (
                          <div className="rounded-xl border border-border bg-card p-3 shadow-card text-xs">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: data.color }}
                              />
                              <span className="font-semibold text-foreground">
                                {data.category}
                              </span>
                            </div>
                            <p className="font-bold font-mono text-foreground">
                              {formatCurrency(data.amount)}{" "}
                              <span className="text-muted-foreground font-normal">
                                ({data.percentage}%)
                              </span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Breakdown List */}
            <div className="sm:col-span-6 space-y-2.5 overflow-y-auto max-h-[240px] pr-2">
              {categories.map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-medium text-foreground">
                        {cat.category}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-foreground">
                      {formatCurrency(cat.amount)} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
