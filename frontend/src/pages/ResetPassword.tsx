import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`/api/v1/auth/reset-password/${token}`, { newPassword });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center" 
      style={{ backgroundColor: '#f8f9fa' }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-sm">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold" style={{ color: '#667eea' }}>Reset Password</h2>
                  <p className="text-muted">Enter your new password</p>
                </div>

                {!success ? (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                      />
                      <small className="text-muted">Minimum 6 characters</small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Confirm Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        required
                      />
                    </div>

                    {error && (
                      <div className="alert alert-danger" role="alert">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="btn btn-primary w-100 py-2 mb-3"
                      style={{ backgroundColor: '#667eea', borderColor: '#667eea' }}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Resetting...
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="btn btn-link text-decoration-none"
                        style={{ color: '#667eea' }}
                      >
                        Back to Login
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <div className="alert alert-success" role="alert">
                      <h5 className="alert-heading">Success!</h5>
                      <p className="mb-0">Your password has been reset successfully.</p>
                      <hr />
                      <p className="mb-0">Redirecting to login page...</p>
                    </div>

                    <div className="text-center mt-3">
                      <button
                        onClick={() => navigate('/login')}
                        className="btn btn-primary"
                        style={{ backgroundColor: '#667eea', borderColor: '#667eea' }}
                      >
                        Go to Login Now
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
