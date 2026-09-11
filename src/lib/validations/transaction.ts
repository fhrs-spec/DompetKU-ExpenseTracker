import { z } from "zod";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/types/database";

export const transactionSchema = z.object({
  title: z
    .string()
    .min(1, "Judul transaksi wajib diisi")
    .max(100, "Judul maksimal 100 karakter"),
  amount: z.coerce
    .number({ invalid_type_error: "Nominal harus berupa angka" })
    .positive("Nominal harus lebih dari 0"),
  type: z.enum(["income", "expense"], {
    required_error: "Pilih jenis transaksi",
  }),
  category: z.string().min(1, "Pilih kategori transaksi"),
  transaction_date: z
    .string()
    .min(1, "Tanggal transaksi wajib diisi")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid (YYYY-MM-DD)"),
  note: z.string().max(500, "Catatan maksimal 500 karakter").optional().nullable(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

export function getCategoriesForType(type: "income" | "expense") {
  return type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}
