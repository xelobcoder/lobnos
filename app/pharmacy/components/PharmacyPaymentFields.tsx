'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { customFetch, customFetchMutation } from '../../../components/Auth/customFetch';
import { useApplication } from '../../../components/Auth/useApplicationContext';

type Pending = { endpoint: string; payload: Record<string, unknown> };
export function usePharmacyDocument(scope: string) {
     const app = useApplication() as any;
     const user = app?.user;
     const key = `pharmacy-document:${scope}:${user?.tenantId || app?.tenantId || ''}:${user?.employeeid || ''}:${user?.branch || ''}`;
     const current = useRef<Pending | null>(null), busy = useRef(false), restored = useRef(false);
     const [pending, setPending] = useState<Pending | null>(null);
     useEffect(() => { try { const saved = sessionStorage.getItem(key); current.current = saved ? JSON.parse(saved) : null; setPending(current.current); restored.current = true; } catch { restored.current = false; } }, [key]);
     const execute = async (endpoint: string, payload: Record<string, unknown>) => {
          if (!restored.current) throw new Error('The previous operation could not be restored. Review pharmacy documents before retrying.');
          if (busy.current) throw new Error('An operation is already running');
          busy.current = true;
          try {
               const request = current.current || { endpoint, payload: { ...payload, idempotencyKey: crypto.randomUUID() } };
               sessionStorage.setItem(key, JSON.stringify(request)); current.current = request; setPending(request);
               const response = await customFetchMutation(request.endpoint, 'POST', request.payload);
               if (response?.success || response?.error?.code === 'PHARMACY_OPERATION_REJECTED') { sessionStorage.removeItem(key); current.current = null; setPending(null); }
               return response;
          } finally { busy.current = false; }
     };
     return { pending, execute };
}
export function usePharmacyPayment(scope: string) {
     const application = useApplication(); const user = application?.user as any;
     const storageKey = `pharmacy-checkout-v2:${scope}:${user?.tenantId || (application as any)?.tenantId || ''}:${user?.employeeid || ''}:${user?.branch || ''}`;
     const [reference, setReference] = useState(''), [amount, setAmount] = useState(''), [error, setError] = useState('');
     const [setup, setSetup] = useState<any>(null), [pending, setPending] = useState<Pending | null>(null);
     const current = useRef<Pending | null>(null), busy = useRef(false), restoreFailed = useRef(false);
     const setupVerified=useRef(false), setupGeneration=useRef(0);
     const refresh = useCallback(async () => {
          const generation=++setupGeneration.current;
          setupVerified.current=false;
          setSetup(null);
          try {
               const response=await customFetch('pharmacy/checkout-setup');
               if(generation!==setupGeneration.current)return;
               if(!response?.success)throw new Error(response?.error?.message||'Unable to load pharmacy checkout');
               setupVerified.current=true;
               setSetup(response.data);
               if(!restoreFailed.current)setError('');
          } catch(error) {
               if(generation===setupGeneration.current)setError(error instanceof Error?error.message:'Unable to load checkout');
          }
     }, []);
     useEffect(() => {
          try {
               // A v1 request must be resolved through sales history before issuing a replacement payment.
               const legacyKey = storageKey.replace('pharmacy-checkout-v2:', 'pharmacy-checkout:');
               if (sessionStorage.getItem(legacyKey)) throw new Error('A legacy checkout needs review in sales history before starting another sale.');
               const saved = sessionStorage.getItem(storageKey); current.current = saved ? JSON.parse(saved) : null; setPending(current.current); restoreFailed.current = false;
          } catch (e) { restoreFailed.current = true; setError(e instanceof Error ? e.message : 'Unable to restore checkout. Review sales history.'); }
          setupVerified.current=false;
          refresh();
          return()=>{setupGeneration.current++;setupVerified.current=false;};
     }, [storageKey, refresh]);
     useEffect(()=>{const update=()=>{refresh();};window.addEventListener('focus',update);return()=>window.removeEventListener('focus',update);},[refresh]);
     const execute = async (endpoint: string, payload: Record<string, unknown>) => {
          if (!current.current && (!setupVerified.current||setup?.day?.status!=='open')) throw new Error('The pharmacy financial day must be opened before checkout.');
          if (busy.current) throw new Error('A checkout is already running');
          if (restoreFailed.current) throw new Error('Review the saved checkout in sales history before collecting another payment.');
          busy.current = true;
          try {
               const request = current.current || { endpoint, payload: { ...payload, idempotencyKey: crypto.randomUUID(), amountTendered: Number(amount), paymentReference: reference.trim() } };
               sessionStorage.setItem(storageKey, JSON.stringify(request)); current.current = request; setPending(request);
               const response = await customFetchMutation(request.endpoint, 'POST', request.payload);
               if (response?.success || ['SALE_REJECTED', 'HELD_SALE_COMPLETION_REJECTED', 'FULFILLMENT_REJECTED'].includes(response?.error?.code)) {
                    sessionStorage.removeItem(storageKey); current.current = null; setPending(null);
               }
               if (response?.success) { setAmount(''); setReference(''); }
               return response;
          } finally { busy.current = false; }
     };
     return { reference, setReference, amount, setAmount, error, setup, refresh, pending, execute };
}
export default function PharmacyPaymentFields({ payment, method, total = 0, disabled = false }: { payment: ReturnType<typeof usePharmacyPayment>; method: string; total?: number; disabled?: boolean }) {
     const received = Number(payment.amount), difference = Math.round((received - total) * 100) / 100;
     const configured = payment.setup?.routes?.some((r: any) => r.method === method);
     return <div className="my-3">
          {payment.error && <p className="text-danger" role="alert">{payment.error}</p>}
          {payment.setup && !configured && <p className="text-danger" role="alert">Ask the pharmacy manager to configure {method.replace('_', ' ')} payments for this branch.</p>}
          {!payment.setup ? <p role="status">Checking financial day and cashier shift...</p> : payment.setup.day?.status!=='open' ? <div className="alert alert-warning">The pharmacy financial day is {payment.setup.day?.status==='closed'?'closed':'not opened'}. <a href="/pharmacy/cashier">View financial day &amp; cashier</a></div> : !payment.setup.shift ? <div className="alert alert-warning">Open your cashier shift before collecting payment. <a href="/pharmacy/cashier">Open cashier shift</a></div> : null}
          <label className="form-label d-block">Amount received (GHS)<input className="form-control form-control-lg" aria-label="Amount received (GHS)" type="number" inputMode="decimal" min={total} step="0.01" required value={payment.amount} disabled={disabled || !!payment.pending} onChange={e => payment.setAmount(e.target.value)} /></label>
          {method === 'cash' ? <p className={`fs-5 fw-bold ${difference < 0 ? 'text-danger' : 'text-success'}`} aria-live="polite">{difference < 0 ? 'Still due' : 'Change'}: GHS {Math.abs(difference).toFixed(2)}</p> : <p className="small">Confirm GHS {total.toFixed(2)} received. Card and mobile money payments must match the total.</p>}
          {method !== 'cash' && <label className="form-label d-block">Payment reference<input className="form-control" maxLength={128} required disabled={disabled || !!payment.pending} value={payment.reference} onChange={e => payment.setReference(e.target.value)} /></label>}
     </div>;
}
