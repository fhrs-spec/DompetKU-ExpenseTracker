"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PlusCircle, Wallet } from "lucide-react";
import { depositSchema, DepositInput } from "@/lib/validations/savings";
import { depositSavingsGoalAction } from "@/app/goals/actions";
import { EnrichedSavingsGoal } from "@/lib/db/savings";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";

interface DepositModalProps {
  goal: EnrichedSavingsGoal | null;
  onClose: () => void;
}

export function DepositModal({ goal, onClose }: DepositModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<DepositInput>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: "" as unknown as number,
    },
  });

  React.useEffect(() => {
    reset({ amount: "" as unknown as number });
  }, [goal, reset]);

  if (!goal) return null;

  const watchAmount = watch("amount");
  const remaining = Math.max(0, goal.target_amount - goal.current_amount);

  const onSubmit = async (data: DepositInput) => {
    setIsLoading(true);
    try {
      const res = await depositSavingsGoalAction(goal.id, data);
      if (!res.success) {
        toast.error(res.error || "Gagal menyetor tabungan");
        return;
      }
      toast.success(
        `Berhasil menyetor ${formatCurrency(data.amount)} ke ${goal.goal_name}!`
      );
      onClose();
    } catch {
      toast.error("Terjadi kendala sistem, silakan coba lagi");
    } finally {
      setIsLoading(false);
    }
  };

  const PRESETS = [50000, 100000, 250000, 500000, 1000000];

  return (
    <Modal
      isOpen={!!goal}
      onClose={onClose}
      title="Setor Tabungan"
      description={`Tambah tabungan untuk target "${goal.goal_name}".`}
    >
      <div className="mb-4 p-4 rounded-xl bg-muted/60 border border-border flex items-center justify-between">
        <div>
          <span className="text-xs text-muted-foreground">Terkumpul Saat Ini</span>
          <p className="text-sm font-bold font-mono text-foreground">
            {formatCurrency(goal.current_amount)}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-muted-foreground">Kurang Menuju Target</span>
          <p className="text-sm font-bold font-mono text-primary">
            {formatCurrency(remaining)}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="deposit_amount">Nominal Setoran (IDR)</Label>
            {Number(watchAmount) > 0 && (
              <span className="text-xs font-semibold text-primary">
                +{formatCurrency(Number(watchAmount))}
              </span>
            )}
          </div>
          <div className="relative">
            <Wallet className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="deposit_amount"
              type="number"
              min="1000"
              step="1000"
              placeholder="Contoh: 100000"
              className="pl-10 font-mono text-base"
              error={!!errors.amount}
              disabled={isLoading}
              {...register("amount")}
            />
          </div>
          {errors.amount && (
            <p className="text-xs text-destructive font-medium">
              {errors.amount.message}
            </p>
          )}
        </div>

        {/* Quick presets */}
        <div>
          <span className="text-xs text-muted-foreground mb-1.5 block">
            Pilihan Nominal Cepat:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setValue("amount", preset)}
                className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs sm:text-sm font-mono font-medium text-foreground transition-all active:scale-95 min-h-[36px] flex items-center justify-center cursor-pointer"
              >
                +{formatCurrency(preset)}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
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
            <PlusCircle className="h-4 w-4" />
            Simpan Setoran
          </Button>
        </div>
      </form>
    </Modal>
  );
}
