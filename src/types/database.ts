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

export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  note?: string | null;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  goal_name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at"> & { created_at?: string };
        Update: Partial<Profile>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Transaction>;
      };
      savings_goals: {
        Row: SavingsGoal;
        Insert: Omit<SavingsGoal, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<SavingsGoal>;
      };
    };
  };
}
