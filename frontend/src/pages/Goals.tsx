import { useState, useEffect } from 'react';
import axios from 'axios';
import { goalAPI } from '../api';
import { Goal } from '../types';
import Navigation from '../components/Navigation';

// Configure axios instance for this component
const axiosInstance = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
});

// Add response interceptor to match the main api.ts behavior
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');

  // Reports section
  const [reportType, setReportType] = useState('category');
  const [reportData, setReportData] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [timePeriod, setTimePeriod] = useState('monthly'); // For time-based reports

  useEffect(() => {
    loadGoals();
  }, []);

  useEffect(() => {
    if (reportType) {
      loadReport(); // Load reports when report type or time period changes
    }
  }, [reportType, timePeriod]);

  const loadGoals = async () => {
    try {
      const response: any = await goalAPI.getAll();
      setGoals(response.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await goalAPI.create({
        goal: goalName,
        target_amount: parseFloat(targetAmount),
      });
      setShowForm(false);
      setGoalName('');
      setTargetAmount('');
      loadGoals();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateProgress = async (id: string, currentAmount: number) => {
    const newAmount = prompt(`Current progress: ₹${currentAmount.toFixed(2)}\nEnter amount to ADD:`);
    if (!newAmount) return;
    const incrementAmount = parseFloat(newAmount);
    if (isNaN(incrementAmount) || incrementAmount <= 0) {
      alert('Please enter a valid positive amount');
      return;
    }
    try {
      await goalAPI.update(id, incrementAmount);
      loadGoals();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await goalAPI.delete(id);
      loadGoals();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getProgress = (goal: Goal) => {
    return (goal.current_amount / goal.target_amount) * 100;
  };

  const loadReport = async () => {
    setLoadingReport(true);
    try {
      let url = `/goals/reports/${reportType}`;
      
      // Add period query param for time-based reports
      if (reportType === 'time') {
        url += `?period=${timePeriod}`;
      }
      
      const data = await axiosInstance.get(url);
      console.log('Report data received:', data);
      setReportData(data);
    } catch (err) {
      console.error('Report error:', err);
      setReportData(null);
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      <Navigation />

      <main className="py-4" style={{ marginLeft: '250px', padding: '2rem' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0 fw-bold">Financial Goals & Reports</h2>
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="btn btn-primary"
            style={{ backgroundColor: '#667eea', borderColor: '#667eea' }}
          >
            {showForm ? 'Cancel' : '+ Add Goal'}
          </button>
        </div>

        {showForm && (
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <form onSubmit={handleCreate}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Goal Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={goalName}
                      onChange={(e) => setGoalName(e.target.value)}
                      placeholder="e.g., Save for vacation"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Target Amount (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#667eea', borderColor: '#667eea' }}>
                  Create Goal
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Reports Section - Always visible */}
        <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h4 className="card-title mb-3">📊 Spending Insights & Reports</h4>
              
              <div className="mb-4">
                <label className="form-label">Select Report Type</label>
                <select
                  className="form-select"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="category">Spending by Category</option>
                  <option value="time">Spending Over Time</option>
                  <option value="trends">Spending Trends</option>
                </select>
              </div>

              {loadingReport ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : reportData ? (
                <div>
                  {reportType === 'category' && reportData && reportData.data && (
                    <div>
                      <h5 className="mb-3">Total Spending by Category</h5>
                      {reportData.data.length === 0 ? (
                        <p className="text-muted">No expense data available yet. Add some expenses to see category reports.</p>
                      ) : (
                        <div className="row g-3">
                          {reportData.data.map((item: any) => (
                            <div key={item.category} className="col-md-4">
                              <div className="card">
                                <div className="card-body">
                                  <h6 className="card-subtitle mb-2 text-muted">{item.category}</h6>
                                  <h4 className="card-title text-primary">₹{item.totalSpent.toFixed(2)}</h4>
                                  <p className="card-text small">{item.transactionCount} transactions</p>
                                  {item.budget && (
                                    <div className="mt-2">
                                      <small className="text-muted">
                                        Budget: ₹{item.budget} 
                                        {item.remaining !== null && (
                                          <span className={item.remaining < 0 ? 'text-danger' : 'text-success'}>
                                            {' '}({item.remaining < 0 ? 'Over' : 'Remaining'}: ₹{Math.abs(item.remaining).toFixed(2)})
                                          </span>
                                        )}
                                      </small>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {reportType === 'time' && reportData && reportData.data && (
                    <div>
                      <div className="mb-3">
                        <label className="form-label">Time Period</label>
                        <select
                          className="form-select"
                          value={timePeriod}
                          onChange={(e) => setTimePeriod(e.target.value)}
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                      
                      <h5 className="mb-3">{timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)} Spending Breakdown</h5>
                      {Object.keys(reportData.data).length === 0 ? (
                        <p className="text-muted">No expense data available yet.</p>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-striped">
                            <thead>
                              <tr>
                                <th>Period</th>
                                <th>Total Spent</th>
                                <th>Transactions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(reportData.data).map(([period, data]: [string, any]) => (
                                <tr key={period}>
                                  <td>{period}</td>
                                  <td className="fw-bold">₹{data?.total?.toFixed(2) || '0.00'}</td>
                                  <td>{data?.count || 0}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {reportType === 'trends' && reportData && reportData.data && (
                    <div>
                      <h5 className="mb-3">Spending Trends & Insights</h5>
                      {reportData.data.insights && reportData.data.insights.length > 0 ? (
                        <div className="alert alert-info">
                          {reportData.data.insights.map((insight: string, idx: number) => (
                            <div key={idx}>• {insight}</div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted">No spending data available yet. Add some expenses to see trends.</p>
                      )}
                      
                      {reportData.data.trends && reportData.data.trends.length > 0 && (
                        <div className="mt-3">
                          <h6>Monthly Trend</h6>
                          <div className="table-responsive">
                            <table className="table table-sm">
                              <thead>
                                <tr>
                                  <th>Month</th>
                                  <th>Amount</th>
                                </tr>
                              </thead>
                              <tbody>
                                {reportData.data.trends.map((trend: any, idx: number) => (
                                  <tr key={idx}>
                                    <td>{trend.month}</td>
                                    <td>₹{trend.amount.toFixed(2)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted">Select a report type to view insights</p>
              )}
            </div>
          </div>

        <div className="d-flex flex-column gap-3">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : goals.length === 0 ? (
            <div className="text-center text-muted py-5">
              No goals yet. Create your first financial goal!
            </div>
          ) : (
            goals.map((goal) => (
              <div key={goal._id} className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="card-title mb-0">{goal.goal}</h5>
                    <div className="d-flex gap-2">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleUpdateProgress(goal._id, goal.current_amount || 0);
                        }} 
                        className="btn btn-primary btn-sm"
                        style={{ backgroundColor: '#667eea', borderColor: '#667eea' }}
                      >
                        Update
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(goal._id);
                        }} 
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="progress mb-2" style={{ height: '24px' }}>
                    <div 
                      className="progress-bar" 
                      role="progressbar" 
                      style={{ 
                        width: `${Math.min(getProgress(goal), 100)}%`,
                        backgroundColor: '#667eea'
                      }}
                      aria-valuenow={getProgress(goal)} 
                      aria-valuemin={0} 
                      aria-valuemax={100}
                    >
                      {getProgress(goal).toFixed(1)}%
                    </div>
                  </div>

                  <p className="text-muted mb-0 small">
                    ₹{goal.current_amount.toFixed(2)} / ₹{goal.target_amount.toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
