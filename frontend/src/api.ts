// Simple API configuration
const API_BASE_URL = '/api/v1';

// Generic fetch wrapper with credentials for cookie-based auth
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const fullUrl = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(fullUrl, {
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
  signup: (username: string, email: string, password: string) =>
    request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
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
  
  verify: () =>
    request<{ authenticated: boolean; user?: { id: string; email: string } }>('/auth/verify', {
      method: 'GET',
    }),
};

// Expense API
export const expenseAPI = {
  getAll: (queryString?: string) => request<{ expenses: any[] }>(`/expense${queryString || ''}`),
  
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
  getStats: (queryString?: string) => request<{
    totalExpenses: number;
    categoryBreakdown: Array<{ category: string; total: number }>;
    recentExpenses: any[];
  }>(`/dashboard/summary${queryString ? '?' + queryString : ''}`),
};

// Import API
export const importAPI = {
  importExpenses: (transactions: any[]) =>
    request('/import/bank', {
      method: 'POST',
      body: JSON.stringify({ transactions }),
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
