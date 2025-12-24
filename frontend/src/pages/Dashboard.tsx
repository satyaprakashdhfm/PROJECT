import { useState, useEffect } from 'react';
import { dashboardAPI } from '../api';
import { DashboardStats } from '../types';
import Navigation from '../components/Navigation';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response: any = await dashboardAPI.getStats();
      setStats(response.data || response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100">
      <Navigation />

      <main className="container py-4" style={{ maxWidth: '1200px' }}>
        <h2 className="mb-4">Dashboard</h2>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <div className="card shadow-sm">
              <div className="card-body">
                <h6 className="card-subtitle text-muted mb-2">Total Expenses</h6>
                <h2 className="text-primary mb-0" style={{ color: '#667eea' }}>
                  ₹{stats?.totalExpenses?.toFixed(2) || '0.00'}
                </h2>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card shadow-sm">
              <div className="card-body">
                <h6 className="card-subtitle text-muted mb-2">Recent Expenses</h6>
                <h2 className="text-primary mb-0" style={{ color: '#667eea' }}>
                  {stats?.recentExpenses?.length || 0}
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h3 className="card-title h5 mb-3">Category Breakdown</h3>
            <div className="d-flex flex-column gap-2">
              {stats?.expensesByCategory && Object.entries(stats.expensesByCategory).map(([category, total]) => (
                <div key={category} className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                  <span className="fw-medium">{category}</span>
                  <span className="fw-bold" style={{ color: '#667eea' }}>₹{(total as number).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="card shadow-sm">
          <div className="card-body">
            <h3 className="card-title h5 mb-3">Recent Expenses</h3>
            <div className="d-flex flex-column gap-2">
              {stats?.recentExpenses?.slice(0, 5).map((exp) => (
                <div key={exp._id} className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                  <div>
                    <p className="mb-1 fw-medium">{exp.description}</p>
                    <p className="mb-0 small text-muted">{exp.category} • {new Date(exp.date).toLocaleDateString()}</p>
                  </div>
                  <span className="fw-bold" style={{ color: '#667eea' }}>₹{exp.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
