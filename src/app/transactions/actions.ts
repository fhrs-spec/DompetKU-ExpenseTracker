"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { transactionSchema, TransactionInput } from "@/lib/validations/transaction";

export interface TransactionActionResponse {
  success: boolean;
  error?: string;
}

export async function createTransactionAction(
  values: TransactionInput
): Promise<TransactionActionResponse> {
  const parsed = transactionSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Data transaksi tidak valid",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Sesi Anda telah berakhir. Silakan login kembali.",
    };
  }

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    title: parsed.data.title,
    amount: parsed.data.amount,
    type: parsed.data.type,
    category: parsed.data.category,
    transaction_date: parsed.data.transaction_date,
    note: parsed.data.note || null,
  });

  if (error) {
    console.error("Error creating transaction:", error);
    return {
      success: false,
      error: "Gagal menyimpan transaksi: " + error.message,
    };
  }

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/analytics");

  return { success: true };
}

export async function updateTransactionAction(
  id: string,
  values: TransactionInput
): Promise<TransactionActionResponse> {
  const parsed = transactionSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Data transaksi tidak valid",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Sesi Anda telah berakhir. Silakan login kembali.",
    };
  }

  const { error } = await supabase
    .from("transactions")
    .update({
      title: parsed.data.title,
      amount: parsed.data.amount,
      type: parsed.data.type,
      category: parsed.data.category,
      transaction_date: parsed.data.transaction_date,
      note: parsed.data.note || null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating transaction:", error);
    return {
      success: false,
      error: "Gagal memperbarui transaksi: " + error.message,
    };
  }

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/analytics");

  return { success: true };
}

export async function deleteTransactionAction(
  id: string
): Promise<TransactionActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Sesi Anda telah berakhir. Silakan login kembali.",
    };
  }

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting transaction:", error);
    return {
      success: false,
      error: "Gagal menghapus transaksi: " + error.message,
    };
  }

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/analytics");

  return { success: true };
}
