// Simple API configuration
const API_BASE_URL = '/api/v1';

// Get token from localStorage
const getToken = (): string | null => localStorage.getItem('token');

// Set token to localStorage
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// Remove token from localStorage
export const removeToken = (): void => {
  localStorage.removeItem('token');
};

// Generic fetch wrapper
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
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
    request<{ token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
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
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/export/excel`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.blob();
  },
  
  pdf: async () => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/export/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.blob();
  },
};
