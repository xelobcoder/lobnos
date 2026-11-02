import { createRoot } from 'react-dom/client';
import AccountingWorkspace from '../../../app/pharmacy/accounting/components/AccountingWorkspace';
import type { Section } from '../../../lib/pharmacyAccounting';
const parts = location.pathname.replace('/pharmacy/accounting', '').split('/').filter(Boolean);
createRoot(document.getElementById('root')!).render(<main><AccountingWorkspace section={(parts[0] || '') as Section} id={parts[1]}/></main>);
