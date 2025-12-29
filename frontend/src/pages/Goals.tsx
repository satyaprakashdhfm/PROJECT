import { useState, useEffect } from 'react';
import { goalAPI } from '../api';
import { Goal } from '../types';
import Navigation from '../components/Navigation';

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    loadGoals();
  }, []);

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
        deadline: deadline || undefined,
      });
      setShowForm(false);
      setGoalName('');
      setTargetAmount('');
      setDeadline('');
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

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      <Navigation />

      <main className="py-4" style={{ marginLeft: '250px', marginTop: '60px', padding: '2rem' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0 fw-bold">🎯 Financial Goals</h2>
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
                  <div className="col-md-4">
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

                  <div className="col-md-4">
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

                  <div className="col-md-4">
                    <label className="form-label">Target Deadline (Optional)</label>
                    <input
                      type="date"
                      className="form-control"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
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
                    <div>
                      <h5 className="card-title mb-1">{goal.goal}</h5>
                      {goal.deadline && (
                        <div className="small">
                          {goal.isOverdue ? (
                            <span className="badge bg-danger">
                              Overdue by {Math.abs(goal.daysRemaining || 0)} days
                            </span>
                          ) : (
                            <span className={`badge ${goal.daysRemaining && goal.daysRemaining < 30 ? 'bg-warning' : 'bg-info'}`}>
                              {goal.daysRemaining} days remaining
                            </span>
                          )}
                          <span className="text-muted ms-2">
                            (Target: {new Date(goal.deadline).toLocaleDateString()})
                          </span>
                        </div>
                      )}
                    </div>
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

                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <p className="text-muted mb-0 small">
                      ₹{goal.current_amount.toFixed(2)} / ₹{goal.target_amount.toFixed(2)}
                    </p>
                    <p className="text-muted mb-0 small">
                      Remaining: ₹{(goal.remaining || 0).toFixed(2)}
                    </p>
                  </div>

                  {goal.deadline && !goal.isOverdue && goal.remaining && goal.remaining > 0 && (
                    <div className="alert alert-light py-2 px-3 mb-0 mt-2" style={{ backgroundColor: '#f0f4ff', borderColor: '#667eea' }}>
                      <div className="small">
                        <strong>💡 Required Savings:</strong>
                        <div className="mt-1">
                          <span className="badge bg-primary me-2">₹{(goal.requiredMonthlySavings || 0).toFixed(2)}/month</span>
                          <span className="badge bg-secondary me-2">₹{(goal.requiredWeeklySavings || 0).toFixed(2)}/week</span>
                          <span className="badge bg-secondary">₹{(goal.requiredDailySavings || 0).toFixed(2)}/day</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {goal.isOverdue && goal.remaining && goal.remaining > 0 && (
                    <div className="alert alert-danger py-2 px-3 mb-0 mt-2">
                      <small>⚠️ This goal is overdue. You still need ₹{goal.remaining.toFixed(2)} to complete it.</small>
                    </div>
                  )}

                  {goal.remaining !== undefined && goal.remaining <= 0 && (
                    <div className="alert alert-success py-2 px-3 mb-0 mt-2">
                      <small>🎉 Congratulations! Goal completed!</small>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
