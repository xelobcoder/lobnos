'use client';

import { usePathname } from 'next/navigation';
import PrimeLayout from './PrimeLayout';
import { CrmLinks } from './links/categories/crmLinks';
import { ExpensesLinks, isExpensesPath } from './links/categories/ExpensesLinks';

export default function BillingModuleLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    return (
        <PrimeLayout links={isExpensesPath(pathname) ? ExpensesLinks : CrmLinks}>
            {children}
        </PrimeLayout>
    );
}
