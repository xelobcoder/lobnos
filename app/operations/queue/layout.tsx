import { Suspense } from 'react';
import { ApplicationProvider } from '../../../components/Auth/useApplicationContext';
import MAIN_LAYOUT from '../../../components/Layout/MainLayout';
import PrimeLayout from '../../../components/Layout/PrimeLayout';
import { CrmLinks } from '../../../components/Layout/links/categories/crmLinks';

export default function QueueLayout({ children }: { children: React.ReactNode }) {
    return <Suspense><ApplicationProvider><MAIN_LAYOUT><PrimeLayout links={CrmLinks}>{children}</PrimeLayout></MAIN_LAYOUT></ApplicationProvider></Suspense>;
}
