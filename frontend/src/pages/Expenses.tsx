import { useState, useEffect } from 'react';
import { expenseAPI } from '../api';
import { Expense, CATEGORIES } from '../types';
import Navigation from '../components/Navigation';

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [merchant, setMerchant] = useState('');

  // Filter fields
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  useEffect(() => {
    loadExpenses();
  }, [filterCategory, filterStartDate, filterEndDate]);

  const loadExpenses = async () => {
    try {
      // Build query string for filters
      const params = new URLSearchParams();
      if (filterCategory) params.append('category', filterCategory);
      if (filterStartDate) params.append('startDate', filterStartDate);
      if (filterEndDate) params.append('endDate', filterEndDate);
      const queryString = params.toString();

      const response: any = await expenseAPI.getAll(queryString ? `?${queryString}` : '');
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
      const response: any = await expenseAPI.add({
        amount: parseFloat(amount),
        date,
        category,
        description,
        merchant: merchant || undefined,
      });
      setShowForm(false);
      resetForm();
      loadExpenses();
      
      // Show budget alert if exceeded
      if (response.alert) {
        alert(`⚠️ ${response.alert}`);
      }
    } catch (err: any) {
      // Handle duplicate expense error
      if (err.message && err.message.includes('Duplicate expense')) {
        alert('❌ Duplicate Expense!\n\nAn expense with the same amount, date, description, and merchant already exists.');
      } else {
        alert(err.message);
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await expenseAPI.delete(id);
      loadExpenses();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const clearFilters = () => {
    setFilterCategory('');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  const resetForm = () => {
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory('Food');
    setDescription('');
    setMerchant('');
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      <Navigation />

      <main className="py-4" style={{ marginLeft: '250px', marginTop: '60px', padding: '2rem' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0 fw-bold">Expenses</h2>
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="btn btn-primary"
            style={{ backgroundColor: '#667eea', borderColor: '#667eea' }}
          >
            {showForm ? 'Cancel' : '+ Add Expense'}
          </button>
        </div>

        {/* Filter Section */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">🔍 Filters</h5>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                />
              </div>

              <div className="col-md-2 d-flex align-items-end">
                <button 
                  type="button"
                  onClick={clearFilters}
                  className="btn btn-secondary w-100"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <form onSubmit={handleAddExpense}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6 col-lg-4">
                    <label className="form-label">Amount (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="col-md-6 col-lg-4">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6 col-lg-4">
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

                  <div className="col-md-6 col-lg-4">
                    <label className="form-label">Description</label>
                    <input
                      type="text"
                      className="form-control"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6 col-lg-4">
                    <label className="form-label">Merchant (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={merchant}
                      onChange={(e) => setMerchant(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#667eea', borderColor: '#667eea' }}>
                  Add Expense
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
          ) : expenses.length === 0 ? (
            <div className="text-center text-muted py-5">
              No expenses yet. Add your first expense!
            </div>
          ) : (
            expenses.map((exp) => (
              <div key={exp._id} className="card shadow-sm">
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div className="flex-grow-1">
                    <h5 className="card-title mb-1">{exp.description}</h5>
                    <p className="card-text text-muted small mb-0">
                      {exp.category} • {new Date(exp.date).toLocaleDateString()}
                      {exp.merchant && ` • ${exp.merchant}`}
                    </p>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <h4 className="mb-0 fw-bold" style={{ color: '#667eea' }}>
                      ₹{exp.amount.toFixed(2)}
                    </h4>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(exp._id);
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
