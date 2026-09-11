import * as React from "react";
import Link from "next/link";
import { Target, ArrowRight, CheckCircle2 } from "lucide-react";
import { EnrichedSavingsGoal } from "@/lib/db/savings";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DashboardGoalsPreviewProps {
  goals: EnrichedSavingsGoal[];
}

export function DashboardGoalsPreview({ goals }: DashboardGoalsPreviewProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Target Tabungan</CardTitle>
        </div>
        <Link
          href="/goals"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          Kelola Target
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="flex-1">
        {goals.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            <p>Belum ada target tabungan aktif.</p>
            <Link
              href="/goals"
              className="inline-block mt-2 text-xs font-semibold text-primary hover:underline"
            >
              + Tetapkan Target Tabungan
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.slice(0, 3).map((goal) => (
              <div key={goal.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground truncate max-w-[180px] sm:max-w-xs">
                    {goal.isCompleted && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    )}
                    <span className="truncate">{goal.goal_name}</span>
                  </div>
                  <Badge
                    variant={goal.isCompleted ? "success" : "secondary"}
                    className="text-[10px] py-0"
                  >
                    {goal.progressPercentage}%
                  </Badge>
                </div>

                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      goal.isCompleted ? "bg-emerald-500" : "bg-primary"
                    }`}
                    style={{ width: `${goal.progressPercentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                  <span>{formatCurrency(goal.current_amount)}</span>
                  <span>Target: {formatCurrency(goal.target_amount)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
