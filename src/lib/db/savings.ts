import { createClient } from "@/lib/supabase/server";
import { SavingsGoal } from "@/types/database";

export interface EnrichedSavingsGoal extends SavingsGoal {
  progressPercentage: number;
  daysRemaining: number;
  isCompleted: boolean;
  isOverdue: boolean;
}

export async function getSavingsGoals(
  userId?: string
): Promise<EnrichedSavingsGoal[]> {
  const supabase = await createClient();

  let currentUserId = userId;
  if (!currentUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    currentUserId = user?.id;
  }

  if (!currentUserId) return [];

  const { data, error } = await supabase
    .from("savings_goals")
    .select("*")
    .eq("user_id", currentUserId)
    .order("deadline", { ascending: true });

  if (error || !data) {
    console.error("Error fetching savings goals:", error);
    return [];
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rawGoals = data as unknown as SavingsGoal[];

  return rawGoals.map((goal) => {
    const target = Number(goal.target_amount) || 1;
    const current = Number(goal.current_amount) || 0;
    const progressPercentage = Math.min(
      100,
      Math.round((current / target) * 100)
    );
    const isCompleted = current >= target;

    const deadlineDate = new Date(goal.deadline);
    deadlineDate.setHours(0, 0, 0, 0);

    const diffTime = deadlineDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isOverdue = daysRemaining < 0 && !isCompleted;

    return {
      ...goal,
      target_amount: target,
      current_amount: current,
      progressPercentage,
      daysRemaining,
      isCompleted,
      isOverdue,
    };
  });
}

export async function getSavingsGoalById(
  id: string,
  userId?: string
): Promise<SavingsGoal | null> {
  const supabase = await createClient();

  let currentUserId = userId;
  if (!currentUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    currentUserId = user?.id;
  }

  if (!currentUserId) return null;

  const { data, error } = await supabase
    .from("savings_goals")
    .select("*")
    .eq("id", id)
    .eq("user_id", currentUserId)
    .single();

  if (error || !data) return null;

  return data as unknown as SavingsGoal;
}
