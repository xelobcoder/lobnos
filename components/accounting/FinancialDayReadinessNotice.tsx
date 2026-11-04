'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useApplication } from '../Auth/useApplicationContext';
import { accountingApi, FinancialDayReadiness } from '../../lib/accounting/accountingApi';

export default function FinancialDayReadinessNotice({ ledger = 'facility', refreshKey, onReview }: { ledger?: 'facility' | 'pharmacy'; refreshKey?: unknown; onReview?: (url: string) => void }) {
     const application = useApplication();
     const branchId = Number(application?.branchid ?? application?.user?.branch);
     const [readiness, setReadiness] = useState<FinancialDayReadiness | null>(null);
     const [error, setError] = useState('');
     useEffect(() => {
          let active = true;
          setReadiness(null);
          setError('');
          accountingApi.financialDayReadiness(ledger).then(response => {
               if (response.status !== 'success' || typeof response.result?.blocked !== 'boolean' || Number(response.result.branchId) !== branchId)
                    throw new Error(response.message || 'Unable to verify the financial closing deadline. Refresh or contact your administrator.');
               if (active) setReadiness(response.result);
          }).catch(error => {
               if (active) setError(error instanceof Error ? error.message : 'Unable to verify the financial closing deadline.');
          });
          return () => { active = false; };
     }, [branchId, ledger, refreshKey]);

     if (error) return <div className="alert alert-warning" role="alert">{error} Closing and reconciliation remain available.</div>;
     if (!readiness) return <div className="small text-muted mb-3" role="status">Checking the financial closing policy...</div>;
     return <div className={`alert alert-${readiness.blocked ? 'danger' : 'info'}`} role={readiness.blocked ? 'alert' : 'status'}>
          <strong>{readiness.blocked ? 'Transactions blocked - overdue financial day' : readiness.enabled === false ? `Overdue enforcement off (${readiness.graceHours}-hour interval)` : `${readiness.graceHours}-hour financial closing interval`}</strong>
          {readiness.enabled === false && <div>Overdue transaction blocking is disabled for this ledger. Historical migration locks and finalized-day restrictions remain in place.</div>}
          {readiness.overdue && !readiness.blocked && <div>An overdue financial day needs review; overdue enforcement is not blocking transactions.</div>}
          {readiness.oldestFinancialDate ? <div>
               Financial day <strong>{readiness.oldestFinancialDate}</strong>{readiness.enabled === false ? ' has a configured closing deadline of ' : ` must be ${readiness.closeUrl.startsWith('/accounting/') ? 'finalized' : 'closed'} by `}<strong>{readiness.deadline?.replace('T', ' ').replace('.000Z', ' UTC')}</strong>.
               {readiness.blocked && ' Close every overdue day before starting another transaction. Administrator status does not bypass this limit.'}
               {' '}<Link href={readiness.closeUrl} onClick={() => onReview?.(readiness.closeUrl)}>{readiness.blocked ? 'Review overdue day' : 'Review financial day'}</Link>
          </div> : <div>No unclosed financial activity was found for this ledger and branch.</div>}
     </div>;
}
