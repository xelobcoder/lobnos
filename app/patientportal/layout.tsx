import PortalShell from "../../components/PatientPortal/PortalShell";
import type { Metadata } from 'next';


export const metadata: Metadata = { title: 'Patient Portal | Prime Laboratory Software', robots: { index: false, follow: false } };

export default function PatientPortalLayout({ children }: { children: React.ReactNode }) {
     return <PortalShell>{children}</PortalShell>;
}
