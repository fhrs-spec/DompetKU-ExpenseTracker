"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  FileText,
  Tag,
  Save,
} from "lucide-react";
import {
  transactionSchema,
  TransactionInput,
  getCategoriesForType,
} from "@/lib/validations/transaction";
import {
  createTransactionAction,
  updateTransactionAction,
} from "@/app/transactions/actions";
import { Transaction } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, formatCurrency } from "@/lib/utils";
import { AiQuickInput } from "./ai-quick-input";
import { ParsedAITransaction } from "@/lib/ai/parse-transaction";

interface TransactionFormProps {
  initialData?: Transaction;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TransactionForm({
  initialData,
  onSuccess,
  onCancel,
}: TransactionFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const isEdit = !!initialData;
  const defaultDate = initialData
    ? initialData.transaction_date
    : new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      title: initialData?.title || "",
      amount: initialData?.amount || ("" as unknown as number),
      type: initialData?.type || "expense",
      category: initialData?.category || "Food",
      transaction_date: defaultDate,
      note: initialData?.note || "",
    },
  });

  const selectedType = watch("type");
  const watchAmount = watch("amount");
  const availableCategories = getCategoriesForType(selectedType);

  // If type changes and current category is not in available list, set first category
  React.useEffect(() => {
    const currentCategory = watch("category");
    if (!availableCategories.includes(currentCategory as never)) {
      setValue("category", availableCategories[0]);
    }
  }, [selectedType, availableCategories, setValue, watch]);

  const onSubmit = async (data: TransactionInput) => {
    setIsLoading(true);
    try {
      if (isEdit && initialData) {
        const res = await updateTransactionAction(initialData.id, data);
        if (!res.success) {
          toast.error(res.error || "Gagal memperbarui transaksi");
          return;
        }
        toast.success("Transaksi berhasil diperbarui!");
      } else {
        const res = await createTransactionAction(data);
        if (!res.success) {
          toast.error(res.error || "Gagal menambahkan transaksi");
          return;
        }
        toast.success("Transaksi berhasil dicatat!");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/transactions");
        router.refresh();
      }
    } catch {
      toast.error("Terjadi kendala sistem, silakan coba lagi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIParsed = (parsed: ParsedAITransaction) => {
    setValue("title", parsed.title, { shouldValidate: true });
    setValue("amount", parsed.amount, { shouldValidate: true });
    setValue("type", parsed.type, { shouldValidate: true });
    setValue("category", parsed.category, { shouldValidate: true });
    setValue("transaction_date", parsed.transaction_date, { shouldValidate: true });
    if (parsed.note) {
      setValue("note", parsed.note, { shouldValidate: true });
    }
  };

  const handleAIDirectSave = async (parsed: ParsedAITransaction): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await createTransactionAction({
        title: parsed.title,
        amount: parsed.amount,
        type: parsed.type,
        category: parsed.category,
        transaction_date: parsed.transaction_date,
        note: parsed.note || "",
      });

      if (!res.success) {
        toast.error(res.error || "Gagal menyimpan transaksi");
        return false;
      }

      toast.success(`Transaksi "${parsed.title}" berhasil dicatat ke database!`);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/transactions");
        router.refresh();
      }
      return true;
    } catch {
      toast.error("Terjadi kendala saat menyimpan transaksi.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 sm:space-y-4.5" noValidate>
      {/* Smart AI Quick Input (Only for new transactions) */}
      {!isEdit && (
        <div className="pb-1 sm:pb-2 border-b border-border/50">
          <AiQuickInput
            onParsed={handleAIParsed}
            onDirectSave={handleAIDirectSave}
            disabled={isLoading}
          />
        </div>
      )}

      {/* Type Selector (Pemasukan vs Pengeluaran) */}
      <div className="space-y-2">
        <Label>Jenis Transaksi</Label>
        <div className="grid grid-cols-2 gap-3 p-1 rounded-xl bg-muted border border-border">
          <button
            type="button"
            onClick={() => setValue("type", "expense")}
            className={cn(
              "flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all",
              selectedType === "expense"
                ? "bg-card text-destructive shadow-soft border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ArrowDownLeft className="h-4 w-4" />
            Pengeluaran
          </button>
          <button
            type="button"
            onClick={() => setValue("type", "income")}
            className={cn(
              "flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all",
              selectedType === "income"
                ? "bg-card text-emerald-600 dark:text-emerald-400 shadow-soft border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ArrowUpRight className="h-4 w-4" />
            Pemasukan
          </button>
        </div>
      </div>

      {/* Judul Transaksi */}
      <div className="space-y-1.5">
        <Label htmlFor="title">Judul Transaksi</Label>
        <Input
          id="title"
          placeholder={
            selectedType === "expense"
              ? "Contoh: Makan Siang Nasi Padang"
              : "Contoh: Gaji Bulanan PT Maju"
          }
          error={!!errors.title}
          disabled={isLoading}
          {...register("title")}
        />
        {errors.title && (
          <p className="text-xs text-destructive font-medium">
            {errors.title.message}
          </p>
        )}
      </div>

      {/* Nominal */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="amount">Nominal (IDR)</Label>
          {Number(watchAmount) > 0 && (
            <span className="text-xs font-semibold text-primary">
              {formatCurrency(Number(watchAmount))}
            </span>
          )}
        </div>
        <div className="relative">
          <div className="absolute left-3.5 top-3 text-xs font-bold text-muted-foreground">
            Rp
          </div>
          <Input
            id="amount"
            type="number"
            min="1"
            step="1000"
            placeholder="50000"
            className="pl-11 font-mono text-base"
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

      {/* Grid: Kategori & Tanggal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Kategori */}
        <div className="space-y-1.5">
          <Label htmlFor="category" className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            Kategori
          </Label>
          <select
            id="category"
            className="flex h-11 w-full rounded-xl border border-border bg-card px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 transition-colors"
            disabled={isLoading}
            {...register("category")}
          >
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-xs text-destructive font-medium">
              {errors.category.message}
            </p>
          )}
        </div>

        {/* Tanggal */}
        <div className="space-y-1.5">
          <Label htmlFor="transaction_date" className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Tanggal
          </Label>
          <Input
            id="transaction_date"
            type="date"
            error={!!errors.transaction_date}
            disabled={isLoading}
            {...register("transaction_date")}
          />
          {errors.transaction_date && (
            <p className="text-xs text-destructive font-medium">
              {errors.transaction_date.message}
            </p>
          )}
        </div>
      </div>

      {/* Catatan (Opsional) */}
      <div className="space-y-1.5">
        <Label htmlFor="note" className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          Catatan Tambahan (Opsional)
        </Label>
        <textarea
          id="note"
          rows={2}
          placeholder="Tulis catatan jika diperlukan..."
          className="flex w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 transition-colors disabled:opacity-50"
          disabled={isLoading}
          {...register("note")}
        />
        {errors.note && (
          <p className="text-xs text-destructive font-medium">
            {errors.note.message}
          </p>
        )}
      </div>

      {/* Form Action Buttons (Sticky at bottom for mobile convenience) */}
      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border sticky bottom-0 bg-card/95 backdrop-blur-sm py-2 -mx-1 px-1 z-10">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            size="sm"
            className="h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm"
          >
            Batal
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
            size="sm"
            className="h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm"
          >
            Kembali
          </Button>
        )}

        <Button
          type="submit"
          isLoading={isLoading}
          size="sm"
          className="h-9 sm:h-10 px-3.5 sm:px-4 text-xs sm:text-sm gap-1.5 shadow-soft"
        >
          <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {isEdit ? "Simpan Perubahan" : "Catat Transaksi"}
        </Button>
      </div>
    </form>
  );
}
