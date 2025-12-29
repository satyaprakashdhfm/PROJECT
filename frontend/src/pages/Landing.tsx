import { useNavigate } from 'react-router-dom'

const Landing = () => {
    const navigate = useNavigate()

    return (
        <div 
            className='min-vh-100 d-flex align-items-center' 
            style={{
                backgroundColor: '#ffffff',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div className='container'>
                <div className='row align-items-center'>
                    <div className='col-md-6 text-center text-md-start mb-5 mb-md-0'>
                        <h1 
                            className='display-2 fw-bold mb-3' 
                            style={{ 
                                color: '#2c3e50',
                                letterSpacing: '-1px'
                            }}
                        >
                            Wealthwise
                        </h1>
                        <p 
                            className='lead fw-semibold mb-3' 
                            style={{ color: '#667eea' }}
                        >
                            Manage Your Money. Master Your Future
                        </p>
                        <p 
                            className='fs-5 mb-4' 
                            style={{ color: '#6c757d' }}
                        >
                            Track expenses, manage budgets and gain insights into your spending habits
                        </p>
                        
                        <div className='d-flex gap-3 justify-content-center justify-content-md-start'>
                            <button 
                                className='btn btn-lg px-4 py-2 shadow-sm fw-semibold'
                                onClick={() => navigate("/signup")}
                                style={{
                                    backgroundColor: '#667eea',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#5568d3'
                                    e.currentTarget.style.transform = 'translateY(-2px)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#667eea'
                                    e.currentTarget.style.transform = 'translateY(0)'
                                }}
                            >
                                Get Started
                            </button>
                            <button 
                                className='btn btn-lg px-4 py-2 fw-semibold'
                                onClick={() => navigate("/login")}
                                style={{
                                    backgroundColor: 'transparent',
                                    color: '#667eea',
                                    border: '2px solid #667eea',
                                    borderRadius: '8px',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#667eea'
                                    e.currentTarget.style.color = '#ffffff'
                                    e.currentTarget.style.transform = 'translateY(-2px)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent'
                                    e.currentTarget.style.color = '#667eea'
                                    e.currentTarget.style.transform = 'translateY(0)'
                                }}
                            >
                                Sign In
                            </button>
                        </div>
                    </div>

                    <div className='col-md-6 text-center'>
                        <img 
                            src="/src/public/expense_photo.png" 
                            alt="Finance Illustration"
                            className='img-fluid'
                            style={{
                                maxHeight: '800px', maxWidth:'800px'
                              //  filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1))'
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Landing