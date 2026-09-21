'use client';

import { useCallback, useEffect, useState } from 'react';
import { Modal, Spinner } from 'react-bootstrap';
import { RiInboxArchiveLine } from '@remixicon/react';
import { toast } from 'react-toastify';
import { customFetch, customFetchMutation } from '../../Auth/customFetch';

type Props = { show: boolean; hide: () => void; collection: { billingid?: number; patientid?: number; fullname?: string } };

type Sample = { id: number; sample_uid: string; barcode: string; status: string; version: number; sample_type_name?: string; container_type_name?: string; quantity?: number; unit?: string; tests: Array<{ testName: string }> };
type CandidateGroup = {
     requirementKey: string;
     sampleType: string;
     containerType: string;
     unit: string | null;
     suggestedQuantity: number;
     ascensions: Array<{ ascensionId: number; testName: string }>;
};

export default function ReceiveLabSampleModal({ show, hide, collection }: Props) {
     const [samples, setSamples] = useState<Sample[]>([]);
     const [selected, setSelected] = useState<number[]>([]);
     const [externalGroups, setExternalGroups] = useState<CandidateGroup[]>([]);
     const [selectedExternal, setSelectedExternal] = useState<string[]>([]);
     const [externalFacility, setExternalFacility] = useState('');
     const [loading, setLoading] = useState(false);
     const [busy, setBusy] = useState(false);

     const load = useCallback(async () => {
          if (!collection?.billingid) return;
          setLoading(true);
          try {
               const response = await customFetch(`physical-samples/candidates?billingid=${collection.billingid}`);
               if (!response?.success) throw new Error(response?.message || 'Unable to load physical samples.');
               const collected = (response.data?.samples || []).filter((sample: Sample) => sample.status === 'collected');
               const groups: CandidateGroup[] = response.data?.groups || [];
               setSamples(collected);
               setSelected(collected.map((sample: Sample) => sample.id));
               setExternalGroups(groups);
               setSelectedExternal(groups.map((group) => group.requirementKey));
          } catch (error: any) {
               toast.error(error?.message || 'Unable to load physical samples.');
               setSamples([]);
               setExternalGroups([]);
          } finally { setLoading(false); }
     }, [collection?.billingid]);

     useEffect(() => { if (show) load(); }, [show, load]);

     const receive = async () => {
          if (!selected.length && !selectedExternal.length) return toast.error('Select at least one sample to receive.');
          setBusy(true);
          try {
               if (selected.length) {
                    const response = await customFetchMutation('physical-samples/receive', 'POST', { samples: selected.map((id) => { const sample = samples.find((item) => item.id === id)!; return { id, expectedVersion: sample.version }; }) });
                    if (!response?.success) throw new Error(response?.message || 'Unable to receive selected collected samples.');
               }
               for (const group of externalGroups.filter((item) => selectedExternal.includes(item.requirementKey))) {
                    const response = await customFetchMutation('physical-samples', 'POST', {
                         billingid: Number(collection.billingid),
                         ascensionIds: group.ascensions.map((test) => test.ascensionId),
                         action: 'receive',
                         quantity: group.suggestedQuantity || undefined,
                         unit: group.unit || undefined,
                         externalFacility: externalFacility.trim() || undefined,
                         idempotencyKey: crypto.randomUUID(),
                    });
                    if (!response?.success) throw new Error(response?.message || `Unable to receive ${group.sampleType}.`);
               }
               const receivedCount = selected.length + selectedExternal.length;
               toast.success(`${receivedCount} physical sample${receivedCount === 1 ? '' : 's'} received and sent to validation.`);
          } catch (error: any) {
               toast.error(error?.message || 'Unable to receive selected samples.');
          } finally {
               await load();
               setBusy(false);
          }
     };

     return <Modal show={show} size="lg" backdrop="static" animation={false} onHide={hide} dialogClassName="mt-3">
          <Modal.Header closeButton><div><Modal.Title className="h5">Receive Physical Samples</Modal.Title><div className="text-muted">{collection?.fullname} · Billing {collection?.billingid}</div></div></Modal.Header>
          <Modal.Body>{loading ? <div className="text-center py-5"><Spinner animation="border" /></div> : samples.length || externalGroups.length ? <div className="d-flex flex-column gap-4">
               {samples.length > 0 && <section><h2 className="h6">Collected here, awaiting reception</h2><div className="d-flex flex-column gap-2">{samples.map((sample) => <label key={sample.id} className="border p-3 d-flex gap-3 align-items-start" style={{ borderRadius: 6 }}><input className="form-check-input mt-1" type="checkbox" checked={selected.includes(sample.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, sample.id] : current.filter((id) => id !== sample.id))} /><div><strong>{sample.sample_uid}</strong><div className="text-muted">{sample.sample_type_name || 'Specimen'} · {sample.container_type_name || 'Container'}</div><div className="mt-1">Tests: {sample.tests.map((test) => test.testName).join(', ')}</div></div></label>)}</div></section>}
               {externalGroups.length > 0 && <section><h2 className="h6">Sample brought to the laboratory</h2><p className="text-muted small">Use this when the sample was collected elsewhere and arrived after billing.</p><label className="form-label" htmlFor="external-facility">Source facility (optional)</label><input id="external-facility" className="form-control mb-3" value={externalFacility} onChange={(event) => setExternalFacility(event.target.value)} placeholder="Facility or collection point" /> <div className="d-flex flex-column gap-2">{externalGroups.map((group) => <label key={group.requirementKey} className="border p-3 d-flex gap-3 align-items-start" style={{ borderRadius: 6 }}><input className="form-check-input mt-1" type="checkbox" checked={selectedExternal.includes(group.requirementKey)} onChange={(event) => setSelectedExternal((current) => event.target.checked ? [...current, group.requirementKey] : current.filter((key) => key !== group.requirementKey))} /><div><strong>{group.sampleType}</strong><div className="text-muted">{group.containerType}</div><div className="mt-1">Tests: {group.ascensions.map((test) => test.testName).join(', ')}</div></div></label>)}</div></section>}
          </div> : <div className="alert alert-info mb-0">There are no samples waiting for reception.</div>}</Modal.Body>
          <Modal.Footer><button className="btn btn-outline-secondary" onClick={hide}>Close</button><button className="btn btn-primary d-flex align-items-center gap-2" disabled={busy || (!selected.length && !selectedExternal.length)} onClick={receive}><RiInboxArchiveLine size={18} />{busy ? 'Receiving...' : 'Receive selected'}</button></Modal.Footer>
     </Modal>;
}
