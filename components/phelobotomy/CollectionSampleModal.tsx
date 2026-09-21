'use client';

import { useCallback, useEffect, useState } from 'react';
import { Modal, Spinner } from 'react-bootstrap';
import { RiCheckboxCircleLine, RiCloseLine, RiDropLine, RiFlaskLine, RiPlayCircleLine } from '@remixicon/react';
import { toast } from 'react-toastify';
import { customFetch, customFetchMutation } from '../Auth/customFetch';

type AscensionCandidate = { ascensionId: number; testId: number; testName: string };
type CandidateGroup = {
     requirementKey: string;
     sampleType: string;
     containerType: string;
     unit: string | null;
     suggestedQuantity: number;
     ascensions: AscensionCandidate[];
};
type PhysicalSample = {
     id: number;
     sample_uid: string;
     status: string;
     sample_type_name?: string;
     container_type_name?: string;
     tests: Array<{ ascensionId: number; testName: string }>;
};
type Props = {
     show: boolean;
     hide: () => void;
     collection: { billingid?: number; patientid?: number; fullname?: string };
     employeeid: number;
     removeCollectedSample?: (billingid?: number) => void;
     selectedSamples?: unknown[];
     collections?: unknown[];
     currentIndex?: number;
     onNextItem?: () => void;
};

export default function CollectionSampleModal({ show, hide, collection, removeCollectedSample, collections = [], currentIndex = 0, onNextItem }: Props) {
     const { billingid, patientid, fullname } = collection || {};
     const [loading, setLoading] = useState(true);
     const [groups, setGroups] = useState<CandidateGroup[]>([]);
     const [samples, setSamples] = useState<PhysicalSample[]>([]);
     const [selectedByGroup, setSelectedByGroup] = useState<Record<string, number[]>>({});
     const [busyKey, setBusyKey] = useState<string | null>(null);
     const isMultiProcessing = collections.length > 0;

     const load = useCallback(async () => {
          if (!billingid) return;
          setLoading(true);
          try {
               const response = await customFetch(`physical-samples/candidates?billingid=${billingid}`);
               if (!response?.success) throw new Error(response?.message || 'Unable to load sample requirements.');
               const nextGroups: CandidateGroup[] = response.data?.groups || [];
               setGroups(nextGroups);
               setSamples(response.data?.samples || []);
               setSelectedByGroup(Object.fromEntries(nextGroups.map((group) => [group.requirementKey, group.ascensions.map((test) => test.ascensionId)])));
          } catch (error: any) {
               toast.error(error?.message || 'Unable to load sample requirements.');
               setGroups([]);
               setSamples([]);
          } finally {
               setLoading(false);
          }
     }, [billingid]);

     useEffect(() => { if (show) load(); }, [show, load]);

     const toggleAscension = (groupKey: string, ascensionId: number) => {
          setSelectedByGroup((current) => {
               const selected = current[groupKey] || [];
               return { ...current, [groupKey]: selected.includes(ascensionId) ? selected.filter((id) => id !== ascensionId) : [...selected, ascensionId] };
          });
     };

     const createSample = async (group: CandidateGroup, action: 'start' | 'collect') => {
          const ascensionIds = selectedByGroup[group.requirementKey] || [];
          if (!ascensionIds.length) return toast.error('Select at least one test for this sample.');
          setBusyKey(group.requirementKey);
          try {
               const response = await customFetchMutation('physical-samples', 'POST', {
                    billingid: Number(billingid), ascensionIds, action,
                    quantity: group.suggestedQuantity || undefined,
                    unit: group.unit || undefined,
                    idempotencyKey: crypto.randomUUID(),
               });
               if (!response?.success) throw new Error(response?.message || 'Unable to record sample collection.');
               toast.success(action === 'start' ? `Collection started: ${response.data.sample_uid}` : `Sample collected: ${response.data.sample_uid}`);
               await load();
          } catch (error: any) {
               toast.error(error?.message || 'Unable to record sample collection.');
          } finally { setBusyKey(null); }
     };

     const completeSample = async (sample: PhysicalSample) => {
          setBusyKey(`sample-${sample.id}`);
          try {
               const response = await customFetchMutation(`physical-samples/${sample.id}/status`, 'PATCH', { status: 'collected' });
               if (!response?.success) throw new Error(response?.message || 'Unable to complete sample collection.');
               toast.success(`${sample.sample_uid} collected.`);
               await load();
          } catch (error: any) {
               toast.error(error?.message || 'Unable to complete sample collection.');
          } finally { setBusyKey(null); }
     };

     const addContainer = async (sample: PhysicalSample) => {
          setBusyKey(`sample-${sample.id}`);
          try {
               const response = await customFetchMutation('physical-samples', 'POST', {
                    billingid: Number(billingid),
                    ascensionIds: sample.tests.map((test) => test.ascensionId),
                    action: 'start',
                    allowAdditional: true,
                    idempotencyKey: crypto.randomUUID(),
               });
               if (!response?.success) throw new Error(response?.message || 'Unable to add another container.');
               toast.success(`Additional container created: ${response.data.sample_uid}`);
               await load();
          } catch (error: any) {
               toast.error(error?.message || 'Unable to add another container.');
          } finally { setBusyKey(null); }
     };

     const finish = () => {
          if (!groups.length) removeCollectedSample?.(billingid);
          if (isMultiProcessing && onNextItem && currentIndex < collections.length - 1) onNextItem();
          else hide();
     };

     return (
          <Modal show={show} size="xl" backdrop="static" keyboard={false} animation={false} onHide={hide} dialogClassName="mt-3">
               <Modal.Header closeButton className="bg-light"><div><Modal.Title className="h5">Physical Sample Collection</Modal.Title><div className="text-muted">{fullname} ({patientid}) · Billing {billingid}</div></div></Modal.Header>
               <Modal.Body className="p-4">
                    {loading ? <div className="text-center py-5"><Spinner animation="border" /><p className="mt-3 mb-0">Loading sample requirements...</p></div> : <>
                         {samples.length > 0 && <section className="mb-4"><h2 className="h6 mb-3">Physical samples</h2><div className="row g-3">{samples.map((sample) => <div className="col-lg-6" key={sample.id}><article className="border bg-light p-3 h-100" style={{ borderRadius: 6 }}><div className="d-flex justify-content-between gap-3"><div><strong className="fs-6">{sample.sample_uid}</strong><div className="text-muted">{sample.sample_type_name || 'Specimen'} · {sample.container_type_name || 'Container'}</div></div><span className="text-capitalize fw-semibold">{sample.status.replace(/_/g, ' ')}</span></div><div className="mt-3"><span className="text-muted">Linked tests:</span> {sample.tests.map((test) => test.testName).join(', ')}</div>{sample.status === 'collection_started' && <div className="d-flex flex-wrap gap-2 mt-3"><button type="button" className="btn btn-outline-primary" disabled={busyKey === `sample-${sample.id}`} onClick={() => addContainer(sample)}>+ Add another container</button><button type="button" className="btn btn-success d-flex align-items-center gap-2" disabled={busyKey === `sample-${sample.id}`} onClick={() => completeSample(sample)}><RiCheckboxCircleLine size={19} />{busyKey === `sample-${sample.id}` ? 'Working...' : 'Complete collection'}</button></div>}{['collected', 'received', 'accepted', 'rejected', 'recollection_required'].includes(sample.status) && <div className="alert alert-secondary mt-3 mb-0 py-2">Collection is complete. Reception and validation are handled in their dedicated workspaces.</div>}</article></div>)}</div></section>}
                         {groups.length > 0 ? <section><h2 className="h6 mb-3">Samples to collect</h2><div className="row g-3">{groups.map((group) => <div className="col-lg-6" key={group.requirementKey}><article className="border p-3 h-100" style={{ borderRadius: 6, borderLeft: '5px solid #176b4d' }}><div className="d-flex align-items-start gap-3 mb-3"><div className="bg-success-subtle text-success p-2" style={{ borderRadius: 6 }}><RiDropLine size={24} /></div><div><h3 className="h6 mb-1">{group.sampleType}</h3><div className="text-muted">{group.containerType}</div>{group.suggestedQuantity > 0 && <small className="text-muted">Suggested: {group.suggestedQuantity} {group.unit || ''}</small>}</div></div><div className="border-top border-bottom py-2 mb-3"><div className="small fw-semibold text-muted mb-2">Tests sharing this physical sample</div>{group.ascensions.map((test) => <label className="d-flex align-items-center gap-2 py-1" key={test.ascensionId}><input className="form-check-input" type="checkbox" checked={(selectedByGroup[group.requirementKey] || []).includes(test.ascensionId)} onChange={() => toggleAscension(group.requirementKey, test.ascensionId)} /><span>{test.testName}</span><small className="text-muted ms-auto">Ascension {test.ascensionId}</small></label>)}</div><div className="d-flex flex-wrap gap-2"><button type="button" className="btn btn-outline-primary d-flex align-items-center gap-2" disabled={busyKey === group.requirementKey} onClick={() => createSample(group, 'start')}><RiPlayCircleLine size={19} /> Start collection</button><button type="button" className="btn btn-success d-flex align-items-center gap-2" disabled={busyKey === group.requirementKey} onClick={() => createSample(group, 'collect')}><RiFlaskLine size={19} /> Collect now</button></div></article></div>)}</div></section> : samples.length === 0 ? <div className="text-center py-5"><RiCheckboxCircleLine size={48} className="text-success mb-2" /><h2 className="h5">All samples collected</h2></div> : null}
                    </>}
               </Modal.Body>
               <Modal.Footer>{isMultiProcessing && <div className="me-auto text-muted">Patient {currentIndex + 1} of {collections.length}</div>}<button type="button" className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={hide}><RiCloseLine size={18} /> Close</button><button type="button" className="btn btn-primary" disabled={loading || groups.length > 0} onClick={finish}>{isMultiProcessing && currentIndex < collections.length - 1 ? 'Next patient' : 'Finish'}</button></Modal.Footer>
          </Modal>
     );
}
