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
  expensesByCategory: { [key: string]: number };
  expensesByMonth?: { [key: string]: number };
  recentExpenses: Expense[];
  budgetComparison?: Array<{
    category: string;
    spent: number;
    budget: number;
    percentage: number;
  }>;
  statistics?: {
    avgExpensePerDay: number;
    highestExpenseDay: number;
    lowestExpenseDay: number;
  };
}

export const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Other'];
