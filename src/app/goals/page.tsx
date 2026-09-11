import { createClient } from "@/lib/supabase/server";
import { getSavingsGoals } from "@/lib/db/savings";
import { AppLayout } from "@/components/layout/app-layout";
import { SavingsGoalsClient } from "@/components/goals/savings-goals-client";

export default async function GoalsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const goals = await getSavingsGoals();
  const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Pengguna";

  return (
    <AppLayout userName={userName} userEmail={user?.email}>
      <SavingsGoalsClient initialGoals={goals} />
    </AppLayout>
  );
}
