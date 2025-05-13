"use client"
import { useState } from 'react';

export default function PrimeLabLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    console.log('Login attempt with:', { email });
  };

  return (
    <div >
      <div className="w-100 bg-primary text-white py-2 px-3">
        <div className="p-2">
          <h4 >Diagnostic Laboratory Management System</h4>
        </div>
      </div>
      <div className="text-center mb-4">
        <div className="d-flex flex-column align-items-center">
          <div style={{ width: '48px', height: '48px' }}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" fill="#1E3A8A"/>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#1E3A8A"/>
            </svg>
          </div>
          <h4 className="mt-2 fw-bold">Prime Lab System</h4>
        </div>
      </div>
      
     <div className='d-flex justify-content-center'>
     <div className="card border-0 shadow-sm" style={{ maxWidth: '420px', width: '100%' }}>
        <div className="card-body p-4">
         
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-control"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="d-flex justify-content-end mt-1">
                <a href="#" className="text-decoration-none small" style={{ color: '#4F46E5' }}>
                  Forgot password?
                </a>
              </div>
            </div>
            
            <div className="d-grid mt-4">
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}>
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
     </div>
    </div>
  );
}