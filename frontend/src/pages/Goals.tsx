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
      });
      setShowForm(false);
      setGoalName('');
      setTargetAmount('');
      loadGoals();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateProgress = async (id: string) => {
    const newAmount = prompt('Enter current amount:');
    if (!newAmount) return;
    try {
      await goalAPI.update(id, parseFloat(newAmount));
      loadGoals();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this goal?')) return;
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
    <div style={styles.container}>
      <Navigation />

      <main style={styles.main}>
        <div style={styles.titleRow}>
          <h2 style={styles.pageTitle}>Financial Goals</h2>
          <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
            {showForm ? 'Cancel' : '+ Add Goal'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Goal Name</label>
                <input
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  style={styles.input}
                  placeholder="e.g., Save for vacation"
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Target Amount (₹)</label>
                <input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  style={styles.input}
                  step="0.01"
                  required
                />
              </div>
            </div>

            <button type="submit" style={styles.submitBtn}>Create Goal</button>
          </form>
        )}

        <div style={styles.goalList}>
          {loading ? (
            <p>Loading...</p>
          ) : goals.length === 0 ? (
            <p style={styles.emptyText}>No goals yet. Create your first financial goal!</p>
          ) : (
            goals.map((goal) => (
              <div key={goal._id} style={styles.goalCard}>
                <div style={styles.goalInfo}>
                  <h3 style={styles.goalTitle}>{goal.goal}</h3>
                  <div style={styles.progressBar}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${Math.min(getProgress(goal), 100)}%`,
                      }}
                    />
                  </div>
                  <p style={styles.progressText}>
                    ₹{goal.current_amount.toFixed(2)} / ₹{goal.target_amount.toFixed(2)} ({getProgress(goal).toFixed(1)}%)
                  </p>
                </div>
                <div style={styles.goalActions}>
                  <button onClick={() => handleUpdateProgress(goal._id)} style={styles.updateBtn}>
                    Update
                  </button>
                  <button onClick={() => handleDelete(goal._id)} style={styles.deleteBtn}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: '#f5f5f5',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  pageTitle: {
    margin: 0,
    color: '#333',
  },
  addBtn: {
    padding: '10px 20px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  form: {
    background: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '30px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontWeight: '500',
    color: '#333',
    fontSize: '14px',
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
  },
  submitBtn: {
    padding: '12px 24px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '16px',
  },
  goalList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  goalCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalInfo: {
    flex: 1,
    marginRight: '20px',
  },
  goalTitle: {
    margin: '0 0 15px 0',
    color: '#333',
  },
  progressBar: {
    width: '100%',
    height: '10px',
    background: '#e0e0e0',
    borderRadius: '5px',
    overflow: 'hidden',
    marginBottom: '10px',
  },
  progressFill: {
    height: '100%',
    background: '#667eea',
    transition: 'width 0.3s ease',
  },
  progressText: {
    margin: 0,
    fontSize: '14px',
    color: '#666',
  },
  goalActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  updateBtn: {
    padding: '8px 16px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  deleteBtn: {
    padding: '8px 16px',
    background: '#ff4444',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: '40px',
  },
};
