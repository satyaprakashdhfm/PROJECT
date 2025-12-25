import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authAPI } from './api';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Budgets from './pages/Budgets';
import Goals from './pages/Goals';
import Import from './pages/Import';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication on app load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authAPI.verify();
      setIsAuthenticated(response.authenticated);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    // Show loading while checking authentication
    if (isAuthenticated === null) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <PrivateRoute>
              <Expenses />
            </PrivateRoute>
          }
        />
        <Route
          path="/budgets"
          element={
            <PrivateRoute>
              <Budgets />
            </PrivateRoute>
          }
        />
        <Route
          path="/goals"
          element={
            <PrivateRoute>
              <Goals />
            </PrivateRoute>
          }
        />
        <Route
          path="/import"
          element={
            <PrivateRoute>
              <Import />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
