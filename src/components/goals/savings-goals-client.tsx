"use client";

import * as React from "react";
import { Plus, Target, CheckCircle2, TrendingUp, Inbox } from "lucide-react";
import { EnrichedSavingsGoal } from "@/lib/db/savings";
import { formatCurrency } from "@/lib/utils";
import { SavingsGoalCard } from "@/components/goals/savings-goal-card";
import { SavingsGoalFormModal } from "@/components/goals/savings-goal-form-modal";
import { DepositModal } from "@/components/goals/deposit-modal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SavingsGoalsClientProps {
  initialGoals: EnrichedSavingsGoal[];
}

export function SavingsGoalsClient({ initialGoals }: SavingsGoalsClientProps) {
  const [formOpen, setFormOpen] = React.useState(false);
  const [goalToEdit, setGoalToEdit] = React.useState<EnrichedSavingsGoal | null>(
    null
  );
  const [goalToDeposit, setGoalToDeposit] =
    React.useState<EnrichedSavingsGoal | null>(null);

  const totalTarget = initialGoals.reduce((acc, g) => acc + g.target_amount, 0);
  const totalCurrent = initialGoals.reduce((acc, g) => acc + g.current_amount, 0);
  const completedCount = initialGoals.filter((g) => g.isCompleted).length;
  const overallPercentage =
    totalTarget > 0 ? Math.min(100, Math.round((totalCurrent / totalTarget) * 100)) : 0;

  const handleOpenCreate = () => {
    setGoalToEdit(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (goal: EnrichedSavingsGoal) => {
    setGoalToEdit(goal);
    setFormOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Top Header Row with Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Target Tabungan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Wujudkan impian finansial Anda dengan perencanaan dan pemantauan disiplin.
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="gap-2 shadow-soft">
          <Plus className="h-4 w-4" />
          Target Baru
        </Button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Dana Impian
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Target className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold font-mono text-foreground">
              {formatCurrency(totalTarget)}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Dari {initialGoals.length} target tabungan
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Terkumpul Saat Ini
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalCurrent)}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {overallPercentage}% dari total target
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Target Tercapai
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold font-mono text-foreground">
              {completedCount} / {initialGoals.length}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Target yang telah terpenuhi
            </p>
          </div>
        </Card>
      </div>

      {/* Goals Grid */}
      {initialGoals.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4">
            <Inbox className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-foreground">
            Belum ada target tabungan
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            Mulai tetapkan tujuan finansial seperti dana darurat, liburan, atau gadget baru.
          </p>
          <Button onClick={handleOpenCreate} className="mt-6 gap-2">
            <Plus className="h-4 w-4" />
            Buat Target Pertama
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialGoals.map((goal) => (
            <SavingsGoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleOpenEdit}
              onDeposit={(g) => setGoalToDeposit(g)}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Form Modal */}
      <SavingsGoalFormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setGoalToEdit(null);
        }}
        goalToEdit={goalToEdit}
      />

      {/* Deposit Modal */}
      <DepositModal
        goal={goalToDeposit}
        onClose={() => setGoalToDeposit(null)}
      />
    </div>
  );
}
