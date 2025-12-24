import { useState, useEffect } from 'react';
import { expenseAPI } from '../api';
import { Expense, CATEGORIES } from '../types';
import Navigation from '../components/Navigation';

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [merchant, setMerchant] = useState('');

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const response: any = await expenseAPI.getAll();
      setExpenses(response.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await expenseAPI.add({
        amount: parseFloat(amount),
        date,
        category,
        description,
        merchant: merchant || undefined,
      });
      setShowForm(false);
      resetForm();
      loadExpenses();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await expenseAPI.delete(id);
      loadExpenses();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory('Food');
    setDescription('');
    setMerchant('');
  };

  return (
    <div style={styles.container}>
      <Navigation />

      <main style={styles.main}>
        <div style={styles.titleRow}>
          <h2 style={styles.pageTitle}>Expenses</h2>
          <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
            {showForm ? 'Cancel' : '+ Add Expense'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAddExpense} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={styles.input}
                  step="0.01"
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

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
                <label style={styles.label}>Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Merchant (Optional)</label>
                <input
                  type="text"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            <button type="submit" style={styles.submitBtn}>Add Expense</button>
          </form>
        )}

        <div style={styles.expenseList}>
          {loading ? (
            <p>Loading...</p>
          ) : expenses.length === 0 ? (
            <p style={styles.emptyText}>No expenses yet. Add your first expense!</p>
          ) : (
            expenses.map((exp) => (
              <div key={exp._id} style={styles.expenseCard}>
                <div style={styles.expenseInfo}>
                  <h3 style={styles.expenseTitle}>{exp.description}</h3>
                  <p style={styles.expenseMeta}>
                    {exp.category} • {new Date(exp.date).toLocaleDateString()}
                    {exp.merchant && ` • ${exp.merchant}`}
                  </p>
                </div>
                <div style={styles.expenseActions}>
                  <p style={styles.expenseAmount}>₹{exp.amount.toFixed(2)}</p>
                  <button onClick={() => handleDelete(exp._id)} style={styles.deleteBtn}>
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
  expenseList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  expenseCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    margin: '0 0 5px 0',
    color: '#333',
  },
  expenseMeta: {
    margin: 0,
    fontSize: '14px',
    color: '#999',
  },
  expenseActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  expenseAmount: {
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
