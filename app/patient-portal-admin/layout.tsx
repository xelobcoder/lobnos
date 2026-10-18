import PortalShell from '../../components/PatientPortal/PortalShell';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Patient Portal Administration | Prime Laboratory Software', robots: { index: false, follow: false } };

export default function PortalAdminLayout({ children }: { children: React.ReactNode }) {
    return <PortalShell admin>{children}</PortalShell>;
}
