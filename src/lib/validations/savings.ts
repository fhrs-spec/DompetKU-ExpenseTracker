import { z } from "zod";

export const savingsGoalSchema = z.object({
  goal_name: z
    .string()
    .min(1, "Nama target wajib diisi")
    .max(100, "Nama target maksimal 100 karakter"),
  target_amount: z.coerce
    .number({ invalid_type_error: "Target nominal harus berupa angka" })
    .positive("Target nominal harus lebih dari 0"),
  current_amount: z.coerce
    .number({ invalid_type_error: "Nominal terkumpul harus berupa angka" })
    .min(0, "Nominal terkumpul tidak boleh negatif")
    .default(0),
  deadline: z
    .string()
    .min(1, "Batas waktu (deadline) wajib diisi")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid (YYYY-MM-DD)"),
});

export const depositSchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: "Nominal setoran harus berupa angka" })
    .positive("Nominal setoran harus lebih dari 0"),
});

export type SavingsGoalInput = z.infer<typeof savingsGoalSchema>;
export type DepositInput = z.infer<typeof depositSchema>;
