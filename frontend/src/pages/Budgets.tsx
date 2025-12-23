import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { budgetAPI, removeToken } from '../api';
import { Budget, CATEGORIES } from '../types';

export default function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [category, setCategory] = useState('Food');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      const data = await budgetAPI.getAll();
      setBudgets(data.budgets);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await budgetAPI.create({
        category,
        budget_amount: parseFloat(amount),
      });
      setShowForm(false);
      setAmount('');
      loadBudgets();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this budget?')) return;
    try {
      await budgetAPI.delete(id);
      loadBudgets();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.logo}>Wealthwise</h1>
        <nav style={styles.nav}>
          <button onClick={() => navigate('/dashboard')} style={styles.navBtn}>Dashboard</button>
          <button onClick={() => navigate('/expenses')} style={styles.navBtn}>Expenses</button>
          <button onClick={() => navigate('/budgets')} style={styles.navBtn}>Budgets</button>
          <button onClick={() => navigate('/goals')} style={styles.navBtn}>Goals</button>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </nav>
      </header>

      <main style={styles.main}>
        <div style={styles.titleRow}>
          <h2 style={styles.pageTitle}>Budgets</h2>
          <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
            {showForm ? 'Cancel' : '+ Add Budget'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={styles.input}
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Budget Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={styles.input}
                  step="0.01"
                  required
                />
              </div>
            </div>

            <button type="submit" style={styles.submitBtn}>Create Budget</button>
          </form>
        )}

        <div style={styles.budgetList}>
          {loading ? (
            <p>Loading...</p>
          ) : budgets.length === 0 ? (
            <p style={styles.emptyText}>No budgets yet. Create your first budget!</p>
          ) : (
            budgets.map((budget) => (
              <div key={budget._id} style={styles.budgetCard}>
                <div>
                  <h3 style={styles.budgetTitle}>{budget.category}</h3>
                </div>
                <div style={styles.budgetActions}>
                  <p style={styles.budgetAmount}>₹{budget.budget_amount.toFixed(2)}</p>
                  <button onClick={() => handleDelete(budget._id)} style={styles.deleteBtn}>
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
  header: {
    background: 'white',
    padding: '20px 40px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    color: '#667eea',
    margin: 0,
  },
  nav: {
    display: 'flex',
    gap: '10px',
  },
  navBtn: {
    padding: '10px 20px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    color: '#333',
  },
  logoutBtn: {
    padding: '10px 20px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '500',
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
  budgetList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  budgetCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetTitle: {
    margin: 0,
    color: '#333',
  },
  budgetActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  budgetAmount: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#667eea',
    margin: 0,
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
