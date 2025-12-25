import { useState, useEffect } from 'react';
import { budgetAPI } from '../api';
import { Budget, CATEGORIES } from '../types';
import Navigation from '../components/Navigation';

export default function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState('Food');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      const response: any = await budgetAPI.getAll();
      setBudgets(response.data || []);
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

  const handleDelete = async (category: string) => {
    console.log('[Budgets] Delete button clicked - Category:', category);
    try {
      console.log('[Budgets] Calling delete API for category:', category);
      await budgetAPI.delete(category);
      console.log('[Budgets] Delete successful, reloading budgets');
      loadBudgets();
    } catch (err: any) {
      console.error('[Budgets] Delete error:', err);
      alert(err.message);
    }
  };

  return (
    <div className="min-vh-100">
      <Navigation />

      <main className="container py-4" style={{ maxWidth: '1200px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Budgets</h2>
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="btn btn-primary"
            style={{ backgroundColor: '#667eea', borderColor: '#667eea' }}
          >
            {showForm ? 'Cancel' : '+ Add Budget'}
          </button>
        </div>

        {showForm && (
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <form onSubmit={handleCreate}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Budget Amount (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#667eea', borderColor: '#667eea' }}>
                  Create Budget
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
          ) : budgets.length === 0 ? (
            <div className="text-center text-muted py-5">
              No budgets yet. Create your first budget!
            </div>
          ) : (
            budgets.map((budget) => (
              <div key={budget._id} className="card shadow-sm">
                <div className="card-body d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">{budget.category}</h5>
                  <div className="d-flex align-items-center gap-3">
                    <h4 className="mb-0 fw-bold" style={{ color: '#667eea' }}>
                      ₹{budget.budget_amount.toFixed(2)}
                    </h4>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(budget.category);
                      }} 
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
