'use client';
import Link from 'next/link';
import InvoiceCollectionPanel from '../components/InvoiceCollectionPanel';
import { styles, usePharmacyAccess, Empty } from '../components/PharmacyWorkspace';

export default function PharmacyCollectionsPage() {
    const access = usePharmacyAccess();
    const role = String(access.app?.user?.role || '').toLowerCase().replace(/[\s_-]/g, '');
    if (!access.manager && !['pharmacist', 'pharmacydispensaryofficer', 'pharmacycashier', 'pharmacyaccountant'].includes(role)) {
        return <main className={styles.page}><h1>Medication collection</h1><Empty>Pharmacy dispensing or cashier access is required.</Empty></main>;
    }
    return <main className={styles.page}>
        <header className={styles.header}><div><h1>Uncollected invoices</h1><p>Review paid medicines awaiting pickup. Confirm medication handover once, then print the customer receipt.</p></div>
            <div className={styles.actions}><Link className="btn btn-outline-secondary" href="/pharmacy/sell">POS</Link><Link className="btn btn-outline-secondary" href="/pharmacy/counter">Cashier invoices</Link></div>
        </header>
        <InvoiceCollectionPanel queue />
    </main>;
}
