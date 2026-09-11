"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Save } from "lucide-react";
import {
  savingsGoalSchema,
  SavingsGoalInput,
} from "@/lib/validations/savings";
import {
  createSavingsGoalAction,
  updateSavingsGoalAction,
} from "@/app/goals/actions";
import { EnrichedSavingsGoal } from "@/lib/db/savings";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";

interface SavingsGoalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: EnrichedSavingsGoal | null;
}

export function SavingsGoalFormModal({
  isOpen,
  onClose,
  goalToEdit,
}: SavingsGoalFormModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const isEdit = !!goalToEdit;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SavingsGoalInput>({
    resolver: zodResolver(savingsGoalSchema),
    defaultValues: {
      goal_name: "",
      target_amount: "" as unknown as number,
      current_amount: 0,
      deadline: "",
    },
  });

  // Populate form when editing
  React.useEffect(() => {
    if (goalToEdit) {
      reset({
        goal_name: goalToEdit.goal_name,
        target_amount: goalToEdit.target_amount,
        current_amount: goalToEdit.current_amount,
        deadline: goalToEdit.deadline,
      });
    } else {
      reset({
        goal_name: "",
        target_amount: "" as unknown as number,
        current_amount: 0,
        deadline: "",
      });
    }
  }, [goalToEdit, reset]);

  const watchTarget = watch("target_amount");
  const watchCurrent = watch("current_amount");

  const onSubmit = async (data: SavingsGoalInput) => {
    setIsLoading(true);
    try {
      if (isEdit && goalToEdit) {
        const res = await updateSavingsGoalAction(goalToEdit.id, data);
        if (!res.success) {
          toast.error(res.error || "Gagal memperbarui target tabungan");
          return;
        }
        toast.success("Target tabungan berhasil diperbarui!");
      } else {
        const res = await createSavingsGoalAction(data);
        if (!res.success) {
          toast.error(res.error || "Gagal membuat target tabungan");
          return;
        }
        toast.success("Target tabungan baru berhasil dibuat!");
      }
      onClose();
    } catch {
      toast.error("Terjadi kendala teknis, silakan coba lagi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Target Tabungan" : "Buat Target Tabungan Baru"}
      description={
        isEdit
          ? "Perbarui nominal atau tanggal target Anda."
          : "Tetapkan target tabungan impian untuk masa depan Anda."
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Nama Goal */}
        <div className="space-y-1.5">
          <Label htmlFor="goal_name">Nama Target</Label>
          <Input
            id="goal_name"
            placeholder="Contoh: Dana Darurat, Beli Laptop, Liburan"
            error={!!errors.goal_name}
            disabled={isLoading}
            {...register("goal_name")}
          />
          {errors.goal_name && (
            <p className="text-xs text-destructive font-medium">
              {errors.goal_name.message}
            </p>
          )}
        </div>

        {/* Target Nominal */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="target_amount">Target Nominal (IDR)</Label>
            {Number(watchTarget) > 0 && (
              <span className="text-xs font-semibold text-primary">
                {formatCurrency(Number(watchTarget))}
              </span>
            )}
          </div>
          <Input
            id="target_amount"
            type="number"
            min="1"
            placeholder="Contoh: 10000000"
            error={!!errors.target_amount}
            disabled={isLoading}
            {...register("target_amount")}
          />
          {errors.target_amount && (
            <p className="text-xs text-destructive font-medium">
              {errors.target_amount.message}
            </p>
          )}
        </div>

        {/* Nominal Terkumpul Awal */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="current_amount">Saldo Terkumpul Awal (IDR)</Label>
            {Number(watchCurrent) > 0 && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(Number(watchCurrent))}
              </span>
            )}
          </div>
          <Input
            id="current_amount"
            type="number"
            min="0"
            placeholder="0 jika belum ada saldo"
            error={!!errors.current_amount}
            disabled={isLoading}
            {...register("current_amount")}
          />
          {errors.current_amount && (
            <p className="text-xs text-destructive font-medium">
              {errors.current_amount.message}
            </p>
          )}
        </div>

        {/* Deadline */}
        <div className="space-y-1.5">
          <Label htmlFor="deadline">Batas Waktu (Deadline)</Label>
          <Input
            id="deadline"
            type="date"
            error={!!errors.deadline}
            disabled={isLoading}
            {...register("deadline")}
          />
          {errors.deadline && (
            <p className="text-xs text-destructive font-medium">
              {errors.deadline.message}
            </p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button type="submit" isLoading={isLoading} className="gap-2">
            <Save className="h-4 w-4" />
            {isEdit ? "Simpan Perubahan" : "Buat Target"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
