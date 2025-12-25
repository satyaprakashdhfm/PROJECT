import { useState, useEffect } from 'react';
import { dashboardAPI, exportAPI } from '../api';
import { DashboardStats } from '../types';
import Navigation from '../components/Navigation';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    loadStats();
  }, [filters]);

  const loadStats = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const response: any = await dashboardAPI.getStats(params.toString());
      setStats(response.data || response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'excel' | 'pdf') => {
    try {
      const blob = type === 'excel' ? await exportAPI.excel() : await exportAPI.pdf();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses.${type === 'excel' ? 'xlsx' : 'pdf'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  // Get chart colors
  const getCategoryColor = (index: number) => {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];
    return colors[index % colors.length];
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
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Dashboard</h2>
          <div className="d-flex gap-2">
            <button onClick={() => handleExport('excel')} className="btn btn-success btn-sm">
              📊 Export Excel
            </button>
            <button onClick={() => handleExport('pdf')} className="btn btn-danger btn-sm">
              📄 Export PDF
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Start Date</label>
                <input 
                  type="date" 
                  className="form-control"
                  value={filters.startDate}
                  onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">End Date</label>
                <input 
                  type="date" 
                  className="form-control"
                  value={filters.endDate}
                  onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

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
        <div className="row g-3 mb-4">
          {/* Bar Chart */}
          <div className="col-lg-7">
            <div className="card shadow-sm">
              <div className="card-body">
                <h3 className="card-title h5 mb-4">Category Expenses (Bar Chart)</h3>
                {stats?.expensesByCategory && Object.keys(stats.expensesByCategory).length > 0 ? (
                  <div style={{ position: 'relative', height: '300px' }}>
                    <svg width="100%" height="100%" viewBox="0 0 600 300" preserveAspectRatio="xMidYMid meet">
                      {/* Y-axis and X-axis */}
                      <line x1="50" y1="20" x2="50" y2="250" stroke="#ccc" strokeWidth="2" />
                      <line x1="50" y1="250" x2="580" y2="250" stroke="#ccc" strokeWidth="2" />
                      
                      {/* Bars */}
                      {Object.entries(stats.expensesByCategory).map(([category, total], index) => {
                        const maxValue = Math.max(...Object.values(stats.expensesByCategory || {}));
                        const barHeight = ((total as number) / maxValue) * 200;
                        const barWidth = 80;
                        const x = 80 + index * 120;
                        const y = 250 - barHeight;
                        const color = getCategoryColor(index);
                        
                        return (
                          <g key={category}>
                            {/* Bar */}
                            <rect
                              x={x}
                              y={y}
                              width={barWidth}
                              height={barHeight}
                              fill={color}
                              opacity="0.8"
                              rx="4"
                            />
                            {/* Value on top */}
                            <text
                              x={x + barWidth / 2}
                              y={y - 5}
                              textAnchor="middle"
                              fontSize="12"
                              fill="#333"
                              fontWeight="600"
                            >
                              ₹{(total as number).toFixed(0)}
                            </text>
                            {/* Category label */}
                            <text
                              x={x + barWidth / 2}
                              y={270}
                              textAnchor="middle"
                              fontSize="12"
                              fill="#666"
                            >
                              {category}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                ) : (
                  <p className="text-muted text-center">No expense data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="col-lg-5">
            <div className="card shadow-sm">
              <div className="card-body">
                <h3 className="card-title h5 mb-4">Category Distribution (Pie Chart)</h3>
                {stats?.expensesByCategory && Object.keys(stats.expensesByCategory).length > 0 ? (
                  <div style={{ position: 'relative', height: '300px' }}>
                    <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
                      {(() => {
                        const total = Object.values(stats.expensesByCategory || {}).reduce((a, b) => a + (b as number), 0);
                        let currentAngle = -90;
                        const centerX = 200;
                        const centerY = 150;
                        const radius = 100;
                        
                        return Object.entries(stats.expensesByCategory).map(([category, value], index) => {
                          const percentage = ((value as number) / total) * 100;
                          const angle = (percentage / 100) * 360;
                          const startAngle = currentAngle;
                          const endAngle = currentAngle + angle;
                          
                          const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
                          const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
                          const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
                          const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
                          
                          const largeArc = angle > 180 ? 1 : 0;
                          const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
                          
                          currentAngle = endAngle;
                          const color = getCategoryColor(index);
                          
                          return (
                            <g key={category}>
                              <path d={path} fill={color} opacity="0.8" stroke="white" strokeWidth="2" />
                            </g>
                          );
                        });
                      })()}
                    </svg>
                    {/* Legend */}
                    <div className="mt-3">
                      {Object.entries(stats.expensesByCategory).map(([category, value], index) => {
                        const total = Object.values(stats.expensesByCategory || {}).reduce((a, b) => a + (b as number), 0);
                        const percentage = ((value as number) / total) * 100;
                        return (
                          <div key={category} className="d-flex align-items-center mb-2">
                            <div
                              style={{
                                width: '16px',
                                height: '16px',
                                backgroundColor: getCategoryColor(index),
                                borderRadius: '3px',
                                marginRight: '8px'
                              }}
                            />
                            <span className="small">
                              {category}: ₹{(value as number).toFixed(0)} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted text-center">No expense data available</p>
                )}
              </div>
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
