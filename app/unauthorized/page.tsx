import Link from 'next/link';
import { RiShieldCrossFill, RiHomeLine } from '@remixicon/react';

export default function UnauthorizedPage() {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <header className="w-100 bg-primary text-white py-2 px-3">
        <div className="p-2">
          <h4>Diagnostic Laboratory Management System</h4>
        </div>
      </header>
      
      <div className="flex-grow-1 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center p-4 bg-white rounded shadow-sm mx-auto" style={{ maxWidth: '400px' }}>
          <div className="text-danger mb-4">
            <RiShieldCrossFill size={64} className="mx-auto" />
          </div>
          <h1 className="display-4 fw-bold text-danger mb-4">401</h1>
          <h2 className="h4 fw-semibold text-dark mb-4">Unauthorized Access</h2>
          <p className="text-muted mb-4">
            Sorry, you don&apos;t have permission to access this page. Please contact your administrator if you believe this is a mistake.
          </p>
          <Link 
            href="/"
            className="btn btn-primary d-inline-flex align-items-center gap-2"
          >
            <RiHomeLine />
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}