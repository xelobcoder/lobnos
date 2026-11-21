'use client';
import Link from 'next/link';
import {useParams} from 'next/navigation';

export default function RegistrationSectionLayout({
     children,
}: {
     children: React.ReactNode;
}) {
     const params=useParams();
     return (
          <div className="w-100 p-2">
               <nav className="d-flex gap-2 mb-2"><Link className="btn btn-sm btn-outline-primary" href={`/crm/registration/${params?.patientid}/personal-information`}>Patient registration</Link><Link className="btn btn-sm btn-outline-primary" href={`/crm/registration/${params?.patientid}/consent`}>E-consent & history</Link></nav>
               {children}
          </div>
     );
}
