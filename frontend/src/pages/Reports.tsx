import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';

export default function Reports() {
  const [reportType, setReportType] = useState('category');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReport();
  }, [reportType]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/goals/reports/${reportType}`, {
        credentials: 'include',
      });
      const result = await response.json();
      setData(result.data || result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100">
      <Navigation />

      <main className="container py-4" style={{ maxWidth: '1200px' }}>
        <h2 className="mb-4">Reports</h2>

        {/* Report Type Selector */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <label className="form-label">Select Report Type</label>
            <select 
              className="form-select"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="category">Category Report</option>
              <option value="time">Time-Based Report</option>
              <option value="trends">Spending Trends</option>
            </select>
          </div>
        </div>

        {/* Report Data */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-4">
                {reportType === 'category' && 'Category-wise Spending'}
                {reportType === 'time' && 'Time-Based Analysis'}
                {reportType === 'trends' && 'Spending Trends & Insights'}
              </h5>
              
              {reportType === 'category' && data?.categories && (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Total Spent</th>
                        <th>Budget</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.categories.map((cat: any) => (
                        <tr key={cat.category}>
                          <td>{cat.category}</td>
                          <td>₹{cat.spent.toFixed(2)}</td>
                          <td>₹{cat.budget?.toFixed(2) || 'N/A'}</td>
                          <td>
                            {cat.percentage && (
                              <span className={cat.percentage > 100 ? 'text-danger' : 'text-success'}>
                                {cat.percentage.toFixed(1)}%
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {reportType === 'time' && data?.analysis && (
                <div>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="p-3 bg-light rounded">
                        <small className="text-muted">Daily Average</small>
                        <h4>₹{data.analysis.dailyAverage?.toFixed(2) || '0.00'}</h4>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 bg-light rounded">
                        <small className="text-muted">Weekly Average</small>
                        <h4>₹{data.analysis.weeklyAverage?.toFixed(2) || '0.00'}</h4>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 bg-light rounded">
                        <small className="text-muted">Monthly Average</small>
                        <h4>₹{data.analysis.monthlyAverage?.toFixed(2) || '0.00'}</h4>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {reportType === 'trends' && data?.insights && (
                <div>
                  <h6 className="mb-3">AI Insights</h6>
                  <ul className="list-unstyled">
                    {data.insights.map((insight: string, index: number) => (
                      <li key={index} className="mb-2">
                        <span className="badge bg-info me-2">💡</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                  {data.topCategories && (
                    <div className="mt-4">
                      <h6>Top Spending Categories</h6>
                      <div className="row g-2">
                        {data.topCategories.map((cat: any, index: number) => (
                          <div key={index} className="col-md-4">
                            <div className="p-2 bg-light rounded">
                              {cat.category}: ₹{cat.total.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
