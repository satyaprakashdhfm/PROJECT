import axios, { AxiosInstance } from 'axios';

// Axios instance configuration
const axiosInstance: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // Important: Include cookies in requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// Auth API
export const    authAPI = {
  signup: (username: string, email: string, password: string) =>
    axiosInstance.post('/auth/signup', { username, email, password }),
  
  login: (email: string, password: string) =>
    axiosInstance.post('/auth/login', { email, password }),
  
  logout: () =>
    axiosInstance.post('/auth/logout'),
  
  verify: () =>
    axiosInstance.get<{ authenticated: boolean; user?: { id: string; email: string; username: string } }>('/auth/verify'),
};

// Expense API
export const expenseAPI = {
  getAll: (queryString?: string) => 
    axiosInstance.get<{ expenses: any[] }>(`/expense${queryString || ''}`),
  
  add: (expense: {
    amount: number;
    date: string;
    category: string;
    description: string;
    merchant?: string;
  }) =>
    axiosInstance.post('/expense/add', expense),
  
  delete: (id: string) =>
    axiosInstance.delete(`/expense/${id}`),
};

// Budget API
export const budgetAPI = {
  getAll: () => 
    axiosInstance.get<{ budgets: any[] }>('/budgets'),
  
  create: (budget: { category: string; budget_amount: number }) =>
    axiosInstance.post('/budgets/set', budget),
  
  update: (category: string, budget_amount: number) =>
    axiosInstance.put(`/budgets/${category}`, { budget_amount }),
  
  delete: (category: string) =>
    axiosInstance.delete(`/budgets/${category}`),
};

// Goal API
export const goalAPI = {
  getAll: () => 
    axiosInstance.get<{ goals: any[] }>('/goals'),
  
  create: (goal: { goal: string; target_amount: number }) =>
    axiosInstance.post('/goals', goal),
  
  update: (id: string, incrementAmount: number) =>
    axiosInstance.put(`/goals/${id}/progress`, { amount: incrementAmount }),
  
  delete: (id: string) =>
    axiosInstance.delete(`/goals/${id}`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: (queryString?: string) => 
    axiosInstance.get<{
      totalExpenses: number;
      categoryBreakdown: Array<{ category: string; total: number }>;
      recentExpenses: any[];
    }>(`/dashboard/summary${queryString ? '?' + queryString : ''}`),
};

// Import API
export const importAPI = {
  importExpenses: (transactions: any[]) =>
    axiosInstance.post('/import/bank', { transactions }),
};

// Export API
export const exportAPI = {
  excel: async () => {
    const response = await axiosInstance.get('/export/excel', {
      responseType: 'blob',
    });
    return response as unknown as Blob;
  },
  
  pdf: async () => {
    const response = await axiosInstance.get('/export/pdf', {
      responseType: 'blob',
    });
    return response as unknown as Blob;
  },
};

