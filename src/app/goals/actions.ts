"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  savingsGoalSchema,
  depositSchema,
  SavingsGoalInput,
  DepositInput,
} from "@/lib/validations/savings";

export interface GoalActionResponse {
  success: boolean;
  error?: string;
}

export async function createSavingsGoalAction(
  values: SavingsGoalInput
): Promise<GoalActionResponse> {
  const parsed = savingsGoalSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Input tidak valid",
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

  const { error } = await supabase.from("savings_goals").insert({
    user_id: user.id,
    goal_name: parsed.data.goal_name,
    target_amount: parsed.data.target_amount,
    current_amount: parsed.data.current_amount || 0,
    deadline: parsed.data.deadline,
  });

  if (error) {
    console.error("Error creating savings goal:", error);
    return {
      success: false,
      error: "Gagal membuat target tabungan: " + error.message,
    };
  }

  revalidatePath("/goals");
  revalidatePath("/dashboard");

  return { success: true };
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function updateSavingsGoalAction(
  id: string,
  values: SavingsGoalInput
): Promise<GoalActionResponse> {
  if (!id || typeof id !== "string" || !UUID_REGEX.test(id)) {
    return {
      success: false,
      error: "ID target tabungan tidak valid.",
    };
  }

  const parsed = savingsGoalSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Input tidak valid",
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
    .from("savings_goals")
    .update({
      goal_name: parsed.data.goal_name,
      target_amount: parsed.data.target_amount,
      current_amount: parsed.data.current_amount,
      deadline: parsed.data.deadline,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating savings goal:", error);
    return {
      success: false,
      error: "Gagal memperbarui target tabungan: " + error.message,
    };
  }

  revalidatePath("/goals");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function depositSavingsGoalAction(
  id: string,
  values: DepositInput
): Promise<GoalActionResponse> {
  if (!id || typeof id !== "string" || !UUID_REGEX.test(id)) {
    return {
      success: false,
      error: "ID target tabungan tidak valid.",
    };
  }

  const parsed = depositSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Nominal tidak valid",
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

  // Atomic database RPC deposit to prevent concurrency lost-update race conditions (P0-1)
  const { error } = await supabase.rpc("deposit_to_savings_goal", {
    p_goal_id: id,
    p_amount: parsed.data.amount,
  });

  if (error) {
    console.error("[DEPOSIT_ACTION_ERROR]", {
      code: error.code,
      message: error.message,
    });
    return {
      success: false,
      error: "Gagal menambahkan tabungan: " + (error.message || "Terjadi kesalahan server."),
    };
  }

  revalidatePath("/goals");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function deleteSavingsGoalAction(
  id: string
): Promise<GoalActionResponse> {
  if (!id || typeof id !== "string" || !UUID_REGEX.test(id)) {
    return {
      success: false,
      error: "ID target tabungan tidak valid.",
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
    .from("savings_goals")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting savings goal:", error);
    return {
      success: false,
      error: "Gagal menghapus target tabungan: " + (error.message || "Terjadi kesalahan server."),
    };
  }

  revalidatePath("/goals");
  revalidatePath("/dashboard");

  return { success: true };
}
