import Link from 'next/link';
import { RiShieldCrossFill, RiHomeLine } from '@remixicon/react';


export default function UnauthorizedPage() {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <header className="w-100 bg-primary text-white py-2 px-3">
        <div className="p-2">
          <h4>Prime Laboratory Software</h4>
        </div>
      </header>
      
      <div className="flex-grow-1 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center p-4 bg-white rounded shadow-sm mx-auto" style={{ maxWidth: '400px' }}>
          <div className="text-danger mb-4">
            <RiShieldCrossFill size={64} className="mx-auto" />
          </div>
          <h1 className="h3 fw-semibold text-danger mb-4">Access restricted</h1>
          <h2 className="h5 fw-semibold text-dark mb-4">This page is outside your current access</h2>
          <p className="text-muted mb-4">
            Sorry, you don&apos;t have permission to access this page. Please contact your administrator if you believe this is a mistake.
          </p>
          <Link 
            href="/authentications/login"
            className="btn btn-primary d-inline-flex align-items-center gap-2"
          >
            <RiHomeLine />
            Return to your workspace
          </Link>
          <p className="small mt-3 mb-0"><Link href="/authentication/logout">Sign out to use another account</Link></p>
        </div>
      </div>
    </div>
  );
}