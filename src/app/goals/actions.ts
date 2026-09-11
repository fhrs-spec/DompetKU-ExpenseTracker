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

export async function updateSavingsGoalAction(
  id: string,
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

  // Fetch current goal
  const { data: goal, error: fetchError } = await supabase
    .from("savings_goals")
    .select("current_amount, target_amount")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !goal) {
    return {
      success: false,
      error: "Target tabungan tidak ditemukan.",
    };
  }

  const currentAmt = Number(goal.current_amount) || 0;
  const newAmount = currentAmt + parsed.data.amount;

  const { error } = await supabase
    .from("savings_goals")
    .update({
      current_amount: newAmount,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error depositing to savings goal:", error);
    return {
      success: false,
      error: "Gagal menambahkan tabungan: " + error.message,
    };
  }

  revalidatePath("/goals");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function deleteSavingsGoalAction(
  id: string
): Promise<GoalActionResponse> {
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
      error: "Gagal menghapus target tabungan: " + error.message,
    };
  }

  revalidatePath("/goals");
  revalidatePath("/dashboard");

  return { success: true };
}
