import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Patient Portal | Prime Laboratory Software', robots: { index: false, follow: false } };

export default function PatientAccessLayout({ children }: { children: React.ReactNode }) {
    return children;
}
