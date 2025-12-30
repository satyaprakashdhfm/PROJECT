import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetLink('');
    setLoading(true);

    try {
      const response = await axios.post('/api/v1/auth/forgot-password', { email });
      setResetLink(response.data.resetLink);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate reset link');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(resetLink);
    alert('Reset link copied to clipboard!');
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
                  <h2 className="fw-bold" style={{ color: '#667eea' }}>Forgot Password</h2>
                  <p className="text-muted">Enter your email to get a password reset link</p>
                </div>

                {!resetLink ? (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
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
                          Generating...
                        </>
                      ) : (
                        'Get Reset Link'
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
                    <div className="alert alert-success mb-4" role="alert">
                      <h5 className="alert-heading">Reset Link Generated!</h5>
                      <p className="mb-0">Copy the link below and paste it in your browser:</p>
                    </div>

                    <div className="card bg-light mb-3">
                      <div className="card-body">
                        <p className="small text-muted mb-2">Reset Link:</p>
                        <p className="font-monospace small mb-0" style={{ wordBreak: 'break-all' }}>
                          {resetLink}
                        </p>
                      </div>
                    </div>

                    <div className="d-grid gap-2">
                      <button
                        onClick={copyToClipboard}
                        className="btn btn-primary"
                        style={{ backgroundColor: '#667eea', borderColor: '#667eea' }}
                      >
                        Copy Link to Clipboard
                      </button>
                      
                      <a
                        href={resetLink}
                        className="btn btn-outline-primary"
                        style={{ borderColor: '#667eea', color: '#667eea' }}
                      >
                        🔗 Open Reset Link
                      </a>

                      <button
                        onClick={() => navigate('/login')}
                        className="btn btn-link"
                        style={{ color: '#667eea' }}
                      >
                        Back to Login
                      </button>
                    </div>

                    <div className="alert alert-warning mt-3" role="alert">
                      <small>⏰ This link expires in 10 minutes</small>
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
