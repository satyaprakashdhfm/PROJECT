import { useNavigate } from 'react-router-dom';
import { removeToken } from '../api';

export default function Navigation() {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  return (
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
  );
}

const styles: Record<string, React.CSSProperties> = {
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
};
