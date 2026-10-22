'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useApplicationSettings } from '../../Auth/useApplicationContext';
import { roleAllowed } from '../../Auth/roles';
import { Modal, Spinner } from 'react-bootstrap';
import { RiBarcodeLine, RiCheckboxCircleLine, RiCloseLine, RiSearchLine } from '@remixicon/react';
import { toast } from 'react-toastify';
import { customFetch, customFetchMutation } from '../../Auth/customFetch';

type Sample = { id: number; sample_uid: string; status: string; storage_state?: string; version: number; sample_type_name?: string; container_type_name?: string; tests: Array<{ ascensionId: number; testName: string }> };
type CandidateGroup = { requirementKey: string; sampleType: string; containerType: string; ascensions: Array<{ ascensionId: number; testName: string }> };
type Props = {
     show: boolean; hide: () => void; billingid?: number; removeClient?: (id?: number) => void;
     multiMode?: boolean; selectedItems?: number[]; onMultiProcessComplete?: (ids: number[]) => void; data?: any[];
};

export default function SampleAssessmentModal({ show, hide, billingid, removeClient, multiMode = false, selectedItems = [], onMultiProcessComplete = () => {}, data = [] }: Props) {
     const { applicationsettings } = useApplicationSettings();
     const canHandleStorage = roleAllowed(applicationsettings?.user?.role, ['admin', 'manager', 'scientist', 'phelobotomist', 'phlebotomist']);
     const [currentIndex, setCurrentIndex] = useState(0);
     const [processedItems, setProcessedItems] = useState<number[]>([]);
     const [samples, setSamples] = useState<Sample[]>([]);
     const [allSamples, setAllSamples] = useState<Sample[]>([]);
     const [unregisteredGroups, setUnregisteredGroups] = useState<CandidateGroup[]>([]);
     const [loadError, setLoadError] = useState('');
     const [barcode, setBarcode] = useState('');
     const [barcodeLoading, setBarcodeLoading] = useState(false);
     const [loading, setLoading] = useState(false);
     const [busyId, setBusyId] = useState<number | null>(null);
     const [rejecting, setRejecting] = useState<Sample | null>(null);
     const [reason, setReason] = useState('');
     const [channels, setChannels] = useState<Array<'sms' | 'email'>>([]);
     const [message, setMessage] = useState('Please return to the laboratory for recollection of your sample.');
     const currentBillingId = multiMode ? selectedItems[currentIndex] : billingid;
     const patient = multiMode ? data.find((item) => item.billingid === currentBillingId) : null;

     const load = useCallback(async () => {
          if (!currentBillingId) return;
          setLoading(true);
          setLoadError('');
          try {
               const response = await customFetch(`physical-samples/candidates?billingid=${currentBillingId}`);
               if (!response?.success) throw new Error(response?.message || 'Unable to load samples for validation.');
               const physicalSamples: Sample[] = response.data?.samples || [];
               setAllSamples(physicalSamples);
               setUnregisteredGroups(response.data?.groups || []);
               setSamples(physicalSamples.filter((sample) => ['collected', 'received'].includes(sample.status)));
          } catch (error: any) {
               const message = error?.message || 'Unable to load samples for validation.';
               toast.error(message);
               setLoadError(message);
               setSamples([]);
               setAllSamples([]);
               setUnregisteredGroups([]);
          } finally { setLoading(false); }
     }, [currentBillingId]);

     useEffect(() => { if (show) { setCurrentIndex(0); setProcessedItems([]); } }, [show]);
     useEffect(() => { if (show) load(); }, [show, load]);

     const toggleChannel = (channel: 'sms' | 'email') => setChannels((current) => current.includes(channel) ? current.filter((item) => item !== channel) : [...current, channel]);

     const findByBarcode = async () => {
          const lookup = barcode.trim();
          if (!lookup) return toast.error('Scan or enter a sample barcode or ID.');
          setBarcodeLoading(true);
          try {
               const response = await customFetch(`physical-samples/barcode/${encodeURIComponent(lookup)}`);
               if (!response?.success) throw new Error(response?.message || 'Sample was not found.');
               const sample: Sample & { billingid: number } = response.data;
               if (Number(sample.billingid) !== Number(currentBillingId)) throw new Error(`This sample belongs to billing ${sample.billingid}.`);
               if (!['collected', 'received'].includes(sample.status)) throw new Error(`This sample is ${sample.status.replace(/_/g, ' ')} and cannot be validated.`);
               setAllSamples([sample]);
               setSamples([sample]);
               setUnregisteredGroups([]);
          } catch (error: any) { toast.error(error?.message || 'Unable to find sample.'); }
          finally { setBarcodeLoading(false); }
     };

     const accept = async (sample: Sample) => {
          setBusyId(sample.id);
          try {
               const response = await customFetchMutation(`physical-samples/${sample.id}/status`, 'PATCH', { status: 'accepted', expectedVersion: sample.version, idempotencyKey: crypto.randomUUID() });
               if (!response?.success) throw new Error(response?.message || 'Unable to accept sample.');
               toast.success(`${sample.sample_uid} accepted for all linked tests.`);
               await load();
          } catch (error: any) { toast.error(error?.message || 'Unable to accept sample.'); }
          finally { setBusyId(null); }
     };

     const reject = async () => {
          if (!rejecting || reason.trim().length < 3) return toast.error('Enter a rejection reason.');
          if (channels.length && !message.trim()) return toast.error('Enter the patient message.');
          setBusyId(rejecting.id);
          try {
               const response = await customFetchMutation(`physical-samples/${rejecting.id}/status`, 'PATCH', {
                    status: 'rejected', reason: reason.trim(), expectedVersion: rejecting.version, idempotencyKey: crypto.randomUUID(),
                    communication: { channels, message: message.trim() },
               });
               if (!response?.success) throw new Error(response?.message || 'Unable to reject sample.');
               toast.success(`${rejecting.sample_uid} rejected for every linked test. Patient communication: ${channels.length ? 'queued' : 'not requested'}.`);
               setRejecting(null); setReason(''); setChannels([]);
               await load();
          } catch (error: any) { toast.error(error?.message || 'Unable to reject sample.'); }
          finally { setBusyId(null); }
     };

     const finish = () => {
          if (currentBillingId) {
               const nextProcessed = [...processedItems, Number(currentBillingId)];
               setProcessedItems(nextProcessed);
               if (multiMode && currentIndex < selectedItems.length - 1) { setCurrentIndex((index) => index + 1); return; }
               if (multiMode) onMultiProcessComplete(nextProcessed); else removeClient?.(currentBillingId);
          }
          hide();
     };

     const waitingForReception = allSamples.filter((sample) => ['planned', 'collection_started'].includes(sample.status));
     const processedSamples = allSamples.filter((sample) => ['accepted', 'rejected', 'recollection_required'].includes(sample.status));
     const acceptedSamples = allSamples.filter((sample) => sample.status === 'accepted' && sample.storage_state !== 'disposed');

     return <>
          <Modal show={show} size="xl" backdrop="static" animation={false} onHide={hide} dialogClassName="mt-3">
               <Modal.Header closeButton><div><Modal.Title className="h5">Physical Sample Validation</Modal.Title><div className="text-muted">{patient?.fullname || ''} · Billing {currentBillingId}</div></div></Modal.Header>
               <Modal.Body><div className="border bg-body-tertiary p-3 mb-3" style={{ borderRadius: 6 }}><label className="form-label fw-semibold" htmlFor="sample-barcode-search"><RiBarcodeLine size={18} className="me-1" />Scan or enter sample barcode / ID</label><div className="input-group"><input id="sample-barcode-search" className="form-control" value={barcode} onChange={(event) => setBarcode(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') findByBarcode(); }} autoFocus placeholder="Scan barcode or enter S-... / numeric ID" /><button className="btn btn-primary" type="button" disabled={barcodeLoading || !barcode.trim()} onClick={findByBarcode} title="Find sample"><RiSearchLine size={18} /></button></div></div>{loading ? <div className="text-center py-5"><Spinner animation="border" /></div>
                    : loadError ? <div className="alert alert-danger mb-0"><strong>Could not load this billing&apos;s physical samples.</strong><div>{loadError}</div></div>
                    : samples.length ? <div className="row g-3">{samples.map((sample) => <div className="col-lg-6" key={sample.id}><article className="border p-3 h-100" style={{ borderRadius: 6, borderLeft: '5px solid #176b4d' }}><div className="d-flex justify-content-between"><div><strong>{sample.sample_uid}</strong><div className="text-muted">{sample.sample_type_name || 'Specimen'} · {sample.container_type_name || 'Container'}</div></div><span className="text-capitalize fw-semibold">{sample.status}</span></div><div className="mt-3"><span className="text-muted">This decision applies to:</span><ul className="mb-3">{sample.tests.map((test) => <li key={test.ascensionId}>{test.testName}</li>)}</ul></div><div className="d-flex gap-2"><button className="btn btn-success d-flex gap-2 align-items-center" disabled={busyId === sample.id} onClick={() => accept(sample)}><RiCheckboxCircleLine size={18} /> Accept container</button><button className="btn btn-outline-danger" disabled={busyId === sample.id} onClick={() => setRejecting(sample)}>Reject container</button>{canHandleStorage && sample.storage_state !== 'disposed' && <Link className="btn btn-outline-primary" href={`/operations/phelobotomy/specimen-storage?sampleId=${sample.id}&action=store`}>Store sample</Link>}</div></article></div>)}</div>
                    : waitingForReception.length ? <div className="alert alert-warning mb-0"><strong>Reception has not been completed.</strong><div className="mt-1">{waitingForReception.length} physical container{waitingForReception.length === 1 ? ' is' : 's are'} recorded as {waitingForReception.map((sample) => sample.status.replace(/_/g, ' ')).join(', ')}. Receive {waitingForReception.length === 1 ? 'it' : 'them'} in the Sample Reception workspace before validation.</div></div>
                    : unregisteredGroups.length ? <div className="alert alert-warning mb-0"><strong>No physical container has been received.</strong><div className="mt-1">The billed tests have sample requirements, but no container is registered. If the client brought a sample from another facility, register it in the Sample Reception workspace first.</div></div>
                    : processedSamples.length ? <div className="alert alert-info mb-0">All physical samples for this billing have already been processed.</div>
                    : <div className="alert alert-info mb-0">No physical samples are available for this billing.</div>}
                    {!loading && !loadError && acceptedSamples.length > 0 && <section className="mt-4" aria-labelledby="accepted-storage-heading"><h2 className="h6" id="accepted-storage-heading">Accepted containers — ready for storage</h2><p className="small text-muted">Choose a freezer, rack and position for each accepted container. You can continue validating the remaining samples.</p><div className="d-flex flex-column gap-2">{acceptedSamples.map(sample => <article className="border rounded p-3 d-flex flex-wrap align-items-center justify-content-between gap-3" key={sample.id}><div><strong>{sample.sample_uid}</strong><div className="small text-muted">{sample.sample_type_name || 'Specimen'} / {sample.container_type_name || 'Container'}</div></div>{canHandleStorage ? <Link className="btn btn-primary btn-sm" href={`/operations/phelobotomy/specimen-storage?sampleId=${sample.id}&action=store`}>{sample.storage_state === 'stored' ? 'Move sample' : sample.storage_state === 'retrieved' ? 'Return to storage' : 'Store sample'}</Link> : <span className="small text-muted">Ask authorized laboratory staff to store this sample.</span>}</article>)}</div></section>}
               </Modal.Body>
               <Modal.Footer><button className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={hide}><RiCloseLine size={18} /> Close</button><button className="btn btn-primary" disabled={loading || samples.length > 0 || Boolean(loadError) || waitingForReception.length > 0 || unregisteredGroups.length > 0} onClick={finish}>{multiMode && currentIndex < selectedItems.length - 1 ? 'Next patient' : 'Finish validation'}</button></Modal.Footer>
          </Modal>

          {rejecting && <Modal show animation={false} backdrop="static" onHide={() => setRejecting(null)} dialogClassName="mt-3"><Modal.Header closeButton><Modal.Title className="h5">Reject {rejecting.sample_uid}</Modal.Title></Modal.Header><Modal.Body><div className="alert alert-warning">This rejects the physical container and every linked test: {rejecting.tests.map((test) => test.testName).join(', ')}.</div><label className="form-label fw-semibold" htmlFor="sample-reason">Rejection reason</label><textarea id="sample-reason" className="form-control mb-3" rows={3} value={reason} onChange={(event) => setReason(event.target.value)} /><fieldset><legend className="h6">Inform patient</legend><div className="d-flex gap-4 mb-3"><label className="form-check"><input className="form-check-input" type="checkbox" checked={channels.includes('sms')} onChange={() => toggleChannel('sms')} /><span className="form-check-label">SMS</span></label><label className="form-check"><input className="form-check-input" type="checkbox" checked={channels.includes('email')} onChange={() => toggleChannel('email')} /><span className="form-check-label">Email</span></label><label className="form-check"><input className="form-check-input" type="checkbox" checked={!channels.length} onChange={() => setChannels([])} /><span className="form-check-label">Do not notify</span></label></div></fieldset>{channels.length > 0 && <><label className="form-label fw-semibold" htmlFor="patient-message">Patient message</label><textarea id="patient-message" className="form-control" rows={4} value={message} onChange={(event) => setMessage(event.target.value)} /></>}</Modal.Body><Modal.Footer><button className="btn btn-outline-secondary" onClick={() => setRejecting(null)}>Cancel</button><button className="btn btn-danger" disabled={busyId === rejecting.id || reason.trim().length < 3} onClick={reject}>{busyId === rejecting.id ? 'Rejecting...' : 'Reject and save'}</button></Modal.Footer></Modal>}
     </>;
}
