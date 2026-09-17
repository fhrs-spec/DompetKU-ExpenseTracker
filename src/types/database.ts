export type TransactionType = "income" | "expense";

export const INCOME_CATEGORIES = [
  "Salary",
  "Bonus",
  "Freelance",
  "Gift",
  "Other",
] as const;

export const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Education",
  "Other",
] as const;

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type TransactionCategory = IncomeCategory | ExpenseCategory;

export type Profile = {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  created_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  note?: string | null;
  transaction_date: string;
  created_at: string;
  updated_at: string;
};

export type SavingsGoal = {
  id: string;
  user_id: string;
  goal_name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  created_at: string;
};

export type GenericRelationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          name: string;
          email: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: GenericRelationship[];
      };
      transactions: {
        Row: Transaction;
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          amount: number;
          type: TransactionType;
          category: string;
          note?: string | null;
          transaction_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          amount?: number;
          type?: TransactionType;
          category?: string;
          note?: string | null;
          transaction_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: GenericRelationship[];
      };
      savings_goals: {
        Row: SavingsGoal;
        Insert: {
          id?: string;
          user_id: string;
          goal_name: string;
          target_amount: number;
          current_amount?: number;
          deadline: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          goal_name?: string;
          target_amount?: number;
          current_amount?: number;
          deadline?: string;
          created_at?: string;
        };
        Relationships: GenericRelationship[];
      };
    };
    Views: Record<string, never>;
    Functions: {
      deposit_to_savings_goal: {
        Args: {
          p_goal_id: string;
          p_amount: number;
        };
        Returns: SavingsGoal;
      };
    };
  };
};
