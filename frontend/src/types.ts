export interface User {
  id: string;
  email: string;
}

export interface Expense {
  _id: string;
  amount: number;
  date: string;
  category: string;
  description: string;
  merchant?: string;
  createdAt: string;
}

export interface Budget {
  _id: string;
  category: string;
  budget_amount: number;
}

export interface Goal {
  _id: string;
  goal: string;
  target_amount: number;
  current_amount: number;
}

export interface DashboardStats {
  totalExpenses: number;
  categoryBreakdown: Array<{ category: string; total: number }>;
  recentExpenses: Expense[];
}

export const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Other'];
