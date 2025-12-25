import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';

export default function Navigation() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      // Force page reload to clear auth state
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout error:', err);
      window.location.href = '/login';
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div className="container-fluid px-4">
        <span className="navbar-brand brand-logo mb-0 h1">Wealthwise</span>
        <div className="d-flex gap-2">
          <button onClick={() => navigate('/dashboard')} className="btn btn-link text-decoration-none">Dashboard</button>
          <button onClick={() => navigate('/expenses')} className="btn btn-link text-decoration-none">Expenses</button>
          <button onClick={() => navigate('/budgets')} className="btn btn-link text-decoration-none">Budgets</button>
          <button onClick={() => navigate('/goals')} className="btn btn-link text-decoration-none">Goals</button>
          <button onClick={() => navigate('/import')} className="btn btn-link text-decoration-none">Import</button>
          <button onClick={handleLogout} className="btn btn-primary" style={{ backgroundColor: '#667eea', borderColor: '#667eea' }}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
