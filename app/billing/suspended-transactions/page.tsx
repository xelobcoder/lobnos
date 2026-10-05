"use client";

import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Table } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { RiDeleteBinLine, RiPlayLine, RiRefreshLine } from '@remixicon/react';
import { useApplication } from '../../../components/Auth/useApplicationContext';
import { customFetch, customFetchMutation } from '../../../components/Auth/customFetch';
import { plsEncryption } from '../../../lib/encryption';

const BILLING_SOURCE_LABELS: Record<number, string> = {
     1: 'General / Cash',
     2: 'Organization',
     3: 'Private Insurance',
     4: 'NHIS',
     6: 'Clinician',
};

export default function SuspendedTransactionsPage() {
     const router = useRouter();
     const context = useApplication();
     const branchid = context?.branchid;
     const [drafts, setDrafts] = useState<any[]>([]);
     const [loading, setLoading] = useState(true);
     const [busyId, setBusyId] = useState<number | null>(null);
     const [error, setError] = useState('');

     const load = useCallback(async () => {
          setLoading(true);
          setError('');
          try {
               const response = await customFetch('billing/suspended');
               if (!response?.success || !Array.isArray(response.data)) {
                    throw new Error(response?.message || 'Unable to load suspended transactions');
               }
               setDrafts(response.data);
          } catch (loadError: any) {
               setError(loadError?.message || 'Unable to load suspended transactions');
               setDrafts([]);
          } finally {
               setLoading(false);
          }
     }, []);

     useEffect(() => { void load(); }, [load]);

     const resume = (draft: any) => {
          const data = draft.draft_data || {};
          const params = new URLSearchParams({ suspendedDraftId: String(draft.id) });
          if (data.entitytype || draft.entity_type) params.set('entitytype', data.entitytype || draft.entity_type);
          const entityId = data.entityId || draft.entity_id;
          if (entityId) params.set('entityid', String(entityId));
          if (data.entityname || draft.entityname) params.set('entityname', data.entityname || draft.entityname);
          const source = Number(draft.billing_source);
          if (data.specialCode || data.referalCode) params.set('specialcode', data.specialCode || data.referalCode);
          if (!draft.patientid && (draft.is_pricing_quote === 'true' || draft.is_pricing_quote === true || data.isPricingQuote)) {
               params.set('ispricingcheckout', '1');
               router.push(`/billing/patientid/checkout/multi/${source}?${params.toString()}`);
               return;
          }
          if (!draft.patientid) {
               toast.error('This suspended transaction has no patient attached.');
               return;
          }
          const patientPathId = plsEncryption(String(draft.patientid));
          router.push(`/billing/patientid/${patientPathId}/multi/${source}?${params.toString()}`);
     };

     const cancel = async (draftId: number) => {
          setBusyId(draftId);
          try {
               const response = await customFetchMutation(`billing/suspended/${draftId}`, 'DELETE', {});
               if (!response?.success) throw new Error(response?.message || 'Unable to cancel transaction');
               toast.success('Suspended transaction cancelled');
               await load();
          } catch (cancelError: any) {
               toast.error(cancelError?.message || 'Unable to cancel transaction');
          } finally {
               setBusyId(null);
          }
     };

     return (
          <main className="container-fluid py-4">
               <header className="d-flex justify-content-between align-items-end gap-3 mb-4">
                    <div>
                         <h1 className="h3 mb-1">Suspended Transactions</h1>
                         <p className="text-muted mb-0">Resume unfinished bills without creating an outstanding balance.</p>
                    </div>
                    <Button variant="outline-secondary" onClick={() => void load()} disabled={loading} aria-label="Refresh suspended transactions">
                         <RiRefreshLine className="me-1" />Refresh
                    </Button>
               </header>

               {error && <Alert variant="danger">{error}</Alert>}
               {branchid == null && <Alert variant="warning">Your account has no assigned branch, so suspended transactions cannot be loaded.</Alert>}

               <div className="table-responsive">
                    <Table bordered hover className="align-middle">
                         <thead className="table-light">
                              <tr>
                                   <th>Patient</th>
                                   <th>Billing source</th>
                                   <th>Entity</th>
                                   <th>Suspended by</th>
                                   <th>Last saved</th>
                                   <th>Note</th>
                                   <th className="text-end">Actions</th>
                              </tr>
                         </thead>
                         <tbody>
                              {loading ? (
                                   <tr><td colSpan={7} className="text-center py-4">Loading suspended transactions...</td></tr>
                              ) : drafts.length === 0 ? (
                                   <tr><td colSpan={7} className="text-center py-4 text-muted">No suspended transactions for this branch.</td></tr>
                              ) : drafts.map((draft) => (
                                   <tr key={draft.id}>
                                        <td>{draft.patientid ? draft.patient_name || `Patient ${draft.patientid}` : 'Price quote (patient not selected)'}</td>
                                        <td>{BILLING_SOURCE_LABELS[Number(draft.billing_source)] || `Source ${draft.billing_source}`}</td>
                                        <td>{draft.entity_type ? `${draft.entity_type} ${draft.entity_id || ''}` : 'General / Cash'}</td>
                                        <td>{draft.created_by_name || `Employee ${draft.created_by}`}</td>
                                        <td>{draft.updated_at ? new Date(draft.updated_at).toLocaleString() : '-'}</td>
                                        <td>{draft.notes || '-'}</td>
                                        <td className="text-end text-nowrap">
                                             <Button size="sm" variant="primary" className="me-2" onClick={() => resume(draft)}>
                                                  <RiPlayLine className="me-1" />Resume
                                             </Button>
                                             <Button size="sm" variant="outline-danger" disabled={busyId === Number(draft.id)} onClick={() => void cancel(Number(draft.id))} aria-label={`Cancel suspended transaction ${draft.id}`}>
                                                  <RiDeleteBinLine />
                                             </Button>
                                        </td>
                                   </tr>
                              ))}
                         </tbody>
                    </Table>
               </div>
          </main>
     );
}
