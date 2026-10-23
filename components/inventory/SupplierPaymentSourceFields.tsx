'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { customFetch } from '../Auth/customFetch';

type Source = { id: number; name: string; account_type: string; currency: string };
const methods: Record<string, [string, string][]> = {
     cash: [['cash', 'Cash']],
     bank: [['bank_transfer', 'Bank transfer'], ['check', 'Cheque'], ['wire_transfer', 'Wire transfer'], ['credit_card', 'Card']],
     mobile_money: [['mobile_money', 'Mobile money']], other: [['other', 'Other']],
};
export default function SupplierPaymentSourceFields({ accountId, method, onChange, disabled = false }: {
     accountId: number; method: string; onChange: (accountId: number, method: string) => void; disabled?: boolean;
}) {
     const [accounts, setAccounts] = useState<Source[]>([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState('');
     useEffect(() => {
          let active = true;
          customFetch('expenses/payment-accounts?capability=pay').then(response => {
               if (!active) return;
               if (!response?.success) throw new Error(response?.message || 'Unable to load payment accounts');
               setAccounts((response.data || []).filter((account: Source) => account.currency === 'GHS'));
          }).catch(error => { if (active) setError(error.message || 'Unable to load payment accounts'); })
               .finally(() => { if (active) setLoading(false); });
          return () => { active = false; };
     }, []);
     const selected = accounts.find(account => Number(account.id) === accountId);
     const allowed = methods[selected?.account_type || ''] || [];
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
                         onChange(id, methods[account?.account_type || '']?.[0]?.[0] || '');
                    }}>
                    <option value="">{loading ? 'Loading payment accounts...' : 'Select a payment source'}</option>
                    {accounts.map(account => <option key={account.id} value={account.id}>{account.name} ({account.currency})</option>)}
               </select>
               <div className="form-text">Choose the cash, bank, or mobile money account funding this payment.</div>
               {error && <div className="text-danger mt-2" role="alert">{error}</div>}
               {!loading && !error && accounts.length === 0 && <div className="alert alert-warning mt-2">
                    You have no GHS payment accounts with payment access. Ask an administrator to grant Can pay access in <Link href="/accounting/payment-accounts">Payment accounts</Link>.
               </div>}
          </div>
          <div className="mb-3">
               <label className="form-label">Payment method *</label>
               <select className="form-select" aria-label="Supplier payment method" required disabled={disabled || !selected}
                    value={method} onChange={event => onChange(accountId, event.target.value)}>
                    {!selected && <option value="">Select a source account first</option>}
                    {allowed.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
               </select>
          </div>
     </>;
}
