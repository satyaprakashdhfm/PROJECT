import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authAPI } from '../api';

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    loadUsername();
  }, []);

  const loadUsername = async () => {
    try {
      const response: any = await authAPI.verify();
      if (response.authenticated && response.user?.username) {
        setUsername(response.user.username);
      }
    } catch (err) {
      console.error('Failed to load username:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout error:', err);
      window.location.href = '/login';
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', icon: '📊', label: 'DASHBOARD' },
    { path: '/expenses', icon: '💰', label: 'EXPENSES' },
    { path: '/budgets', icon: '💳', label: 'BUDGETS' },
    { path: '/goals', icon: '🎯', label: 'GOALS' },
    { path: '/import', icon: '📥', label: 'IMPORT' },
  ];

  return (
    <>
      {/* Top Navigation Bar with Profile */}
      <div className="position-fixed top-0 end-0 bg-white shadow-sm d-flex align-items-center justify-content-end px-4 py-2" 
           style={{ 
             left: '250px',
             zIndex: 1001,
             height: '60px',
             borderBottom: '1px solid #e0e0e0'
           }}>
        <div className="d-flex align-items-center gap-3">
          <div className="text-end">
            <div className="fw-semibold text-dark" style={{ fontSize: '0.95rem' }}>Welcome,  {username || 'User'}</div>
          </div>
          <img 
            src="/src/public/profile_icon.png" 
            alt="Profile" 
            className="rounded-circle"
            style={{ 
              width: '40px', 
              height: '40px', 
              objectFit: 'cover',
              border: '2px solid #667eea'
            }}
          />
        </div>
      </div>

      {/* Sidebar */}
      <div className="d-flex flex-column position-fixed top-0 bottom-0 text-white" 
           style={{ 
             width: '250px',
             background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
             zIndex: 1000,
             boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
             overflowY: 'auto'
           }}>
        
        {/* Logo and Brand */}
        <div className="p-3 border-bottom border-white border-opacity-25">
          <div className="d-flex align-items-center gap-3">
            <img 
              src="/src/public/icon.png" 
              alt="Logo" 
              style={{ width: '40px', height: '40px', objectFit: 'contain' }}
            />
            <span className="fw-bold fs-5" style={{ letterSpacing: '1px' }}>WEALTHWISE</span>
          </div>
        </div>

      {/* Navigation Items */}
      <nav className="flex-grow-1 py-3">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-100 text-start px-4 py-3 border-0 bg-transparent text-white d-flex align-items-center gap-3 position-relative ${
              isActive(item.path) ? 'bg-white bg-opacity-20' : ''
            }`}
            style={{
              transition: 'all 0.2s',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: isActive(item.path) ? '600' : '500',
              letterSpacing: '0.5px'
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            {isActive(item.path) && (
              <div 
                className="position-absolute start-0 top-0 bottom-0 bg-white"
                style={{ width: '4px' }}
              />
            )}
            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Settings and Logout */}
      <div className="border-top border-white border-opacity-25 p-3">
        <button
          onClick={handleLogout}
          className="w-100 btn btn-light text-primary fw-semibold py-2"
          style={{
            borderRadius: '8px',
            transition: 'all 0.2s'
          }}
        >
          🚪 Logout
        </button>
      </div>
    </div>
    </>
  );
}
