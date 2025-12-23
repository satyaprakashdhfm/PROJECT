import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI, removeToken } from '../api';
import { DashboardStats } from '../types';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await dashboardAPI.getStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

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
        <h2 style={styles.pageTitle}>Dashboard</h2>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <h3 style={styles.statTitle}>Total Expenses</h3>
            <p style={styles.statValue}>₹{stats?.totalExpenses.toFixed(2) || '0.00'}</p>
          </div>

          <div style={styles.statCard}>
            <h3 style={styles.statTitle}>Recent Expenses</h3>
            <p style={styles.statValue}>{stats?.recentExpenses.length || 0}</p>
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Category Breakdown</h3>
          <div style={styles.categoryList}>
            {stats?.categoryBreakdown.map((cat) => (
              <div key={cat.category} style={styles.categoryItem}>
                <span style={styles.categoryName}>{cat.category}</span>
                <span style={styles.categoryAmount}>₹{cat.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Recent Expenses</h3>
          <div style={styles.expenseList}>
            {stats?.recentExpenses.slice(0, 5).map((exp) => (
              <div key={exp._id} style={styles.expenseItem}>
                <div>
                  <p style={styles.expenseDesc}>{exp.description}</p>
                  <p style={styles.expenseMeta}>{exp.category} • {new Date(exp.date).toLocaleDateString()}</p>
                </div>
                <p style={styles.expenseAmount}>₹{exp.amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
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
  pageTitle: {
    marginBottom: '30px',
    color: '#333',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  statCard: {
    background: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  statTitle: {
    color: '#666',
    fontSize: '14px',
    margin: '0 0 10px 0',
  },
  statValue: {
    color: '#667eea',
    fontSize: '32px',
    fontWeight: 'bold',
    margin: 0,
  },
  section: {
    background: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: '20px',
    color: '#333',
  },
  categoryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  categoryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '15px',
    background: '#f9f9f9',
    borderRadius: '5px',
  },
  categoryName: {
    fontWeight: '500',
    color: '#333',
  },
  categoryAmount: {
    fontWeight: 'bold',
    color: '#667eea',
  },
  expenseList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  expenseItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '15px',
    background: '#f9f9f9',
    borderRadius: '5px',
  },
  expenseDesc: {
    margin: '0 0 5px 0',
    fontWeight: '500',
    color: '#333',
  },
  expenseMeta: {
    margin: 0,
    fontSize: '12px',
    color: '#999',
  },
  expenseAmount: {
    fontWeight: 'bold',
    color: '#667eea',
    margin: 0,
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontSize: '18px',
    color: '#666',
  },
};
