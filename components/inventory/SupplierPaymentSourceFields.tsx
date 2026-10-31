'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { customFetch } from '../Auth/customFetch';

type Source = { id: number; name: string; account_type: string; currency: string; posted_balance?:number; committed_amount?:number; purpose?:'supplier'|'payroll'; onReady?:(ready:boolean)=>void; available_balance?:number };
const methods: Record<string, [string, string][]> = {
     cash: [['cash', 'Cash']],
     bank: [['bank_transfer', 'Bank transfer'], ['check', 'Cheque'], ['wire_transfer', 'Wire transfer'], ['credit_card', 'Card']],
     mobile_money: [['mobile_money', 'Mobile money']], other: [['other', 'Other']],
};
export default function SupplierPaymentSourceFields({ accountId, method, onChange, disabled = false, amount, purpose = 'supplier', onReady }: {
     accountId: number; method: string; onChange: (accountId: number, method: string) => void; disabled?: boolean; amount?:number; purpose?:'supplier'|'payroll'; onReady?:(ready:boolean)=>void;
}) {
     const [accounts, setAccounts] = useState<Source[]>([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState('');
     const [refresh,setRefresh]=useState(0);
     useEffect(() => {
          let active = true;setLoading(true);setError('');
          customFetch('expenses/payment-accounts?capability=pay').then(response => {
               if (!active) return;
               if (!response?.success) throw new Error(response?.message || 'Unable to load payment accounts');
               setAccounts((response.data || []).filter((account: Source) => account.currency === 'GHS' && (purpose !== 'payroll' || account.account_type !== 'other')));
          }).catch(error => { if (active) setError(error.message || 'Unable to load payment accounts'); })
               .finally(() => { if (active) setLoading(false); });
          return () => { active = false; };
     }, [refresh]);
     const selected = accounts.find(account => Number(account.id) === accountId);
     const options=(type:string)=>purpose==='payroll'&&type==='bank'?[['bank_transfer','Bank transfer'],['cheque','Cheque']]:(methods[type]||[]);
     const allowed = options(selected?.account_type || '');
     useEffect(()=>{onReady?.(!loading&&!error&&!!selected&&Number.isFinite(selected.available_balance)&&allowed.some(([value])=>value===method)&&(amount==null||amount<=Number(selected.available_balance)));},[loading,error,accountId,method,selected?.available_balance,amount]);
     useEffect(() => {
          if (loading) return;
          if (accountId && !selected) onChange(0, '');
          else if (selected && !allowed.some(([value]) => value === method)) onChange(accountId, allowed[0]?.[0] || '');
     }, [loading, accounts, accountId, method]);
     return <>
          <div className="mb-3">
               <label className="form-label">Pay from account *</label>
               <select className="form-select" aria-label="Pay from account" required disabled={disabled || loading || !!error}
                    value={accountId || ''} onChange={event => {
                         const id = Number(event.target.value);
                         const account = accounts.find(account => Number(account.id) === id);
                         onChange(id, options(account?.account_type || '')?.[0]?.[0] || '');
                    }}>
                    <option value="">{loading ? 'Loading payment accounts...' : 'Select a payment source'}</option>
                    {accounts.map(account => <option key={account.id} value={account.id}>{account.name} ({account.currency})</option>)}
               </select>
               <div className="form-text">Choose the cash, bank, or mobile money account funding this payment.</div>
               <button type="button" className="btn btn-sm btn-outline-secondary mt-2" disabled={disabled||loading} onClick={()=>setRefresh(value=>value+1)}>Refresh account balances</button>
               {error && <div className="text-danger mt-2" role="alert">{error}</div>}
               {!loading && !error && accounts.length === 0 && <div className="alert alert-warning mt-2">
                    You have no GHS payment accounts with payment access. Ask an administrator to grant Can pay access in <Link href="/accounting/payment-accounts">Payment accounts</Link>.
               </div>}
          </div>
          {selected && <section aria-label="Funding review" className="border rounded p-3 mb-3">
               <dl className="mb-0"><div className="d-flex justify-content-between gap-2"><dt className="fw-medium">Posted balance</dt><dd>GHS {Number(selected.posted_balance||0).toFixed(2)}</dd></div>
               <div className="d-flex justify-content-between gap-2"><dt className="fw-medium">Committed payments</dt><dd>GHS {Number(selected.committed_amount||0).toFixed(2)}</dd></div>
               <div className="d-flex justify-content-between gap-2"><dt className="fw-medium">Available funds</dt><dd>GHS {Number(selected.available_balance||0).toFixed(2)}</dd></div>
               {amount!=null&&<><div className="d-flex justify-content-between gap-2"><dt className="fw-medium">This payment</dt><dd>GHS {Number(amount).toFixed(2)}</dd></div><div className="d-flex justify-content-between gap-2"><dt className="fw-medium">Remaining funds</dt><dd>GHS {(Number(selected.available_balance||0)-amount).toFixed(2)}</dd></div></>}</dl>
               {amount!=null&&amount>Number(selected.available_balance||0)&&<p className="text-danger mb-0" role="alert">Insufficient funds. Fund this account or select another authorized account.</p>}
               <small className="text-muted">Funds and access are checked again when payment is confirmed.</small>
          </section>}
          <div className="mb-3">
               <label className="form-label">Payment method *</label>
               <select className="form-select" aria-label="Payment method" required disabled={disabled || !selected}
                    value={method} onChange={event => onChange(accountId, event.target.value)}>
                    {!selected && <option value="">Select a source account first</option>}
                    {allowed.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
               </select>
          </div>
     </>;
}
