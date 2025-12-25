// Simple API configuration
const API_BASE_URL = '/api/v1';

// Generic fetch wrapper with credentials for cookie-based auth
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Important: Include cookies in requests
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

// Auth API
export const authAPI = {
  signup: (email: string, password: string) =>
    request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  login: (email: string, password: string) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  logout: () =>
    request('/auth/logout', {
      method: 'POST',
    }),
};

// Expense API
export const expenseAPI = {
  getAll: () => request<{ expenses: any[] }>('/expense'),
  
  add: (expense: {
    amount: number;
    date: string;
    category: string;
    description: string;
    merchant?: string;
  }) =>
    request('/expense/add', {
      method: 'POST',
      body: JSON.stringify(expense),
    }),
  
  delete: (id: string) =>
    request(`/expense/${id}`, {
      method: 'DELETE',
    }),
};

// Budget API
export const budgetAPI = {
  getAll: () => request<{ budgets: any[] }>('/budgets'),
  
  create: (budget: { category: string; budget_amount: number }) =>
    request('/budgets/set', {
      method: 'POST',
      body: JSON.stringify(budget),
    }),
  
  update: (id: string, budget_amount: number) =>
    request(`/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ budget_amount }),
    }),
  
  delete: (category: string) =>
    request(`/budgets/${category}`, {
      method: 'DELETE',
    }),
};

// Goal API
export const goalAPI = {
  getAll: () => request<{ goals: any[] }>('/goals'),
  
  create: (goal: { goal: string; target_amount: number }) =>
    request('/goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    }),
  
  update: (id: string, incrementAmount: number) =>
    request(`/goals/${id}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ amount: incrementAmount }),
    }),
  
  delete: (id: string) =>
    request(`/goals/${id}`, {
      method: 'DELETE',
    }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => request<{
    totalExpenses: number;
    categoryBreakdown: Array<{ category: string; total: number }>;
    recentExpenses: any[];
  }>('/dashboard/summary'),
};

// Import API
export const importAPI = {
  importExpenses: (expenses: any[]) =>
    request('/import/expenses', {
      method: 'POST',
      body: JSON.stringify({ expenses }),
    }),
};

// Export API
export const exportAPI = {
  excel: async () => {
    const response = await fetch(`${API_BASE_URL}/export/excel`, {
      credentials: 'include',
    });
    return response.blob();
  },
  
  pdf: async () => {
    const response = await fetch(`${API_BASE_URL}/export/pdf`, {
      credentials: 'include',
    });
    return response.blob();
  },
};
