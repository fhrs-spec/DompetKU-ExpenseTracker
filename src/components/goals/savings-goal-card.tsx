"use client";

import * as React from "react";
import {
  Target,
  Calendar,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { EnrichedSavingsGoal } from "@/lib/db/savings";
import { formatCurrency, formatDate } from "@/lib/utils";
import { deleteSavingsGoalAction } from "@/app/goals/actions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

interface SavingsGoalCardProps {
  goal: EnrichedSavingsGoal;
  onEdit: (goal: EnrichedSavingsGoal) => void;
  onDeposit: (goal: EnrichedSavingsGoal) => void;
}

export function SavingsGoalCard({
  goal,
  onEdit,
  onDeposit,
}: SavingsGoalCardProps) {
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteSavingsGoalAction(goal.id);
      if (!res.success) {
        toast.error(res.error || "Gagal menghapus target tabungan");
        return;
      }
      toast.success("Target tabungan berhasil dihapus");
      setDeleteModalOpen(false);
    } catch {
      toast.error("Terjadi kendala sistem, silakan coba lagi");
    } finally {
      setIsDeleting(false);
    }
  };

  const remainingAmount = Math.max(0, goal.target_amount - goal.current_amount);

  return (
    <>
      <Card className="p-6 flex flex-col justify-between transition-all hover:border-primary/40">
        <div>
          {/* Header row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  goal.isCompleted
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {goal.isCompleted ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Target className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground line-clamp-1">
                  {goal.goal_name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Target: {formatDate(goal.deadline)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => onEdit(goal)}
                title="Edit target"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => setDeleteModalOpen(true)}
                title="Hapus target"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Amount info */}
          <div className="my-4">
            <div className="flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-extrabold font-mono text-foreground">
                {formatCurrency(goal.current_amount)}
              </span>
              <span className="text-xs font-medium text-muted-foreground font-mono">
                dari {formatCurrency(goal.target_amount)}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-2.5 mt-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  goal.isCompleted ? "bg-emerald-500" : "bg-primary"
                }`}
                style={{ width: `${goal.progressPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs mt-2 text-muted-foreground">
              <span className="font-semibold text-foreground">
                {goal.progressPercentage}% tercapai
              </span>
              <span>
                {goal.isCompleted
                  ? "Target terpenuhi!"
                  : `Kurang ${formatCurrency(remainingAmount)}`}
              </span>
            </div>
          </div>
        </div>

        {/* Footer row: Status Badge & Deposit CTA */}
        <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
          {goal.isCompleted ? (
            <Badge variant="success" className="gap-1 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Selesai 🎉
            </Badge>
          ) : goal.isOverdue ? (
            <Badge variant="destructive" className="gap-1 text-xs">
              <AlertCircle className="h-3.5 w-3.5" />
              Terlewat ({Math.abs(goal.daysRemaining)} hari lalu)
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">
              {goal.daysRemaining} hari lagi
            </Badge>
          )}

          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs font-semibold"
            onClick={() => onDeposit(goal)}
          >
            <PlusCircle className="h-3.5 w-3.5 text-primary" />
            Setor Tabungan
          </Button>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Hapus Target Tabungan"
        description={`Apakah Anda yakin ingin menghapus target "${goal.goal_name}"?`}
      >
        <div className="flex items-center gap-3 p-3 rounded-xl bg-destructive/10 text-destructive text-sm mb-6">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>Target ini beserta riwayat pencapaiannya akan dihapus permanen.</span>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setDeleteModalOpen(false)}
            disabled={isDeleting}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Ya, Hapus
          </Button>
        </div>
      </Modal>
    </>
  );
}
