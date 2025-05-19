import styles from './login.module.css';
import { RiShieldCrossFill } from '@remixicon/react';
import { handleUserLogin } from '../../../components/serverActions/ActionFiltering';

export  default async  function PrimeLabLoginPage() {
 
   
  return (
    <div>
      <div className="w-100 bg-primary text-white py-2 px-3">
        <div className="p-2">
          <h4 >Diagnostic Laboratory Management System</h4>
        </div>
      </div>
      <div className="text-center mb-4">
        <div className="d-flex flex-column align-items-center">
          <div className={styles.logoContainer}>
          <RiShieldCrossFill size={64} className="mx-auto" />
          </div>
          <h4 className="mt-2 fw-bold">Prime Lab System</h4>
        </div>
      </div>

      <div className='d-flex justify-content-center'>
        <div className={`card border-0 shadow-sm ${styles.cardContainer}`}>
          <div className="card-body p-4">

            <form action={handleUserLogin}>
            
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-control"
                  placeholder="Enter your email"
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
                  required
                />
                <div className="d-flex justify-content-end mt-1">
                  <a href="#" className={`text-decoration-none small ${styles.forgotPasswordLink}`}>
                    Forgot password?
                  </a>
                </div>
              </div>

              <div className="d-grid mt-4">
                <button
                type='submit'
                  className={`btn btn-primary ${styles.signInButton}`}>
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