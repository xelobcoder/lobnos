'use client';
import { useEffect, useRef, useState } from 'react';
import { customFetch, customFetchMutation } from '../Auth/customFetch';
import { toast } from 'react-toastify';

type Test = { ascensionId: number; testName: string };
type Group = { sampleTypeId?: number; containerTypeId?: number; suggestedQuantity: number; unit: string | null; ascensions: Test[] };
type Container = { key: string; ascensionIds: number[]; sampleTypeId: string; containerTypeId: string; quantity: string; unit: string };
export default function CollectionPlanEditor({ billingid, groups, onSaved, onCancel }: { billingid: number; groups: Group[]; onSaved: () => Promise<void>; onCancel: () => void }) {
     const [containers, setContainers] = useState<Container[]>(() => groups.map((group, index) => ({ key: String(index), ascensionIds: group.ascensions.map(test => test.ascensionId), sampleTypeId: String(group.sampleTypeId || ''), containerTypeId: String(group.containerTypeId || ''), quantity: group.suggestedQuantity ? String(group.suggestedQuantity) : '', unit: group.unit || 'ml' })));
     const [options, setOptions] = useState<{ sampleTypes: any[]; containerTypes: any[] }>({ sampleTypes: [], containerTypes: [] });
     const [reason, setReason] = useState('');
     const [drawnQuantity, setDrawnQuantity] = useState('');
     const [busy, setBusy] = useState(false);
     const [pending, setPending] = useState(false);
     const [error, setError] = useState('');
     const intent = useRef<any>(null);
     const saving = useRef(false);
     const tests = [...new Map(groups.flatMap(group => group.ascensions).map(test => [test.ascensionId, test])).values()];
     const storageKey = useRef<string | null>(null);
     const locked = busy || pending;
     useEffect(() => { let active = true; customFetch('physical-samples/collection-plan/options').then(response => { if (!active) return; if (response?.success) {
          setOptions(response.data); storageKey.current = `collection-plan:${response.data.tenantId}:${billingid}`;
          const saved = sessionStorage.getItem(storageKey.current);
          if (saved) { intent.current = JSON.parse(saved); setPending(true); }
     } else setError(response?.message || 'Unable to load container types'); }).catch(() => active && setError('Unable to load container types')); return () => { active = false; }; }, [billingid]);
     const update = (key: string, changes: Partial<Container>) => setContainers(previous => previous.map(container => container.key === key ? { ...container, ...changes } : container));
     const save = async () => {
          if (saving.current) return;
          if (!intent.current && !reason.trim()) return toast.error('Enter the reason for changing the proposed containers.');
          if (!intent.current && tests.some(test => !containers.some(container => container.ascensionIds.includes(test.ascensionId)))) return toast.error('Assign every proposed test to at least one container.');
          saving.current = true; setBusy(true); setError('');
          try {
               intent.current ||= { billingid, idempotencyKey: crypto.randomUUID(), reason: reason.trim(), drawnQuantity: drawnQuantity || null, containers: containers.map(({ key, ...container }) => container) };
               if (!storageKey.current) throw new Error('Load container options before saving');
               sessionStorage.setItem(storageKey.current, JSON.stringify(intent.current)); setPending(true);
               const response = await customFetchMutation('physical-samples/collection-plan', 'POST', intent.current);
               if (!response?.success) {
                    if (response.statusCode >= 400 && response.statusCode < 500 && !String(response.message).includes('Retry key')) { intent.current = null; setPending(false); sessionStorage.removeItem(storageKey.current); }
                    throw new Error(response?.message || 'Unable to save container plan');
               }
               sessionStorage.removeItem(storageKey.current); intent.current = null; setPending(false);
               toast.success('Actual containers created. Complete collection and record the supplies used.');
               await onSaved();
          } catch (e: any) { setError(e.message || 'Unable to confirm the plan. Retry the same plan.'); }
          finally { saving.current = false; setBusy(false); }
     };
     return <section className="border rounded p-3 mb-4">
          <h2 className="h6">Adjust actual containers before collection</h2>
          <p className="small text-muted">Combine proposed containers, change their specimen or tube types, or split a draw into separate tubes. The original test requirements remain in the audit history. Enter the actual volume for each container.</p>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          {pending && <div className="alert alert-warning">A previous container plan awaits confirmation. Retry the same plan before editing or creating other containers.<div>Reason: {intent.current?.reason}</div>{intent.current?.containers?.map((container: any, index: number) => <div key={index}>Container {index + 1}: {options.containerTypes.find(type => Number(type.id) === Number(container.containerTypeId))?.name || container.containerTypeId}, {container.quantity} {container.unit}</div>)}</div>}
          {containers.map((container, index) => <article key={container.key} className="border rounded p-3 mb-3">
               <div className="d-flex justify-content-between"><strong>Container {index + 1}</strong><div className="d-flex gap-2">{containers.length > 1 && <select aria-label={`Combine container ${index + 1} into another container`} className="form-select form-select-sm" value="" disabled={locked} onChange={e => { const target = e.target.value; if (target) setContainers(previous => previous.filter(row => row.key !== container.key).map(row => row.key === target ? { ...row, ascensionIds: [...new Set([...row.ascensionIds, ...container.ascensionIds])], quantity: '' } : row)); }}><option value="">Combine into...</option>{containers.map((target, targetIndex) => target.key !== container.key && <option key={target.key} value={target.key}>Container {targetIndex + 1}</option>)}</select>}<button type="button" className="btn btn-sm btn-outline-secondary" disabled={locked} onClick={() => setContainers(previous => [...previous, { ...container, key: crypto.randomUUID(), quantity: '' }])}>Split / add another tube</button></div></div>
               <div className="row g-2 mt-1"><label className="col-md-4">Specimen<select className="form-select" value={container.sampleTypeId} disabled={locked} onChange={e => update(container.key, { sampleTypeId: e.target.value })}><option value="">Choose specimen</option>{options.sampleTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}</select></label><label className="col-md-4">Actual container<select className="form-select" value={container.containerTypeId} disabled={locked} onChange={e => update(container.key, { containerTypeId: e.target.value })}><option value="">Choose container</option>{options.containerTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}</select></label><label className="col-md-2">Actual amount<input className="form-control" type="number" min="0.01" step="0.01" value={container.quantity} disabled={locked} onChange={e => update(container.key, { quantity: e.target.value })} /></label><label className="col-md-2">Unit<input className="form-control" maxLength={30} value={container.unit} disabled={locked} onChange={e => update(container.key, { unit: e.target.value })} /></label></div>
               <div className="small fw-semibold mt-3">Tests using this container</div>{tests.map(test => <label key={test.ascensionId} className="d-flex gap-2 py-1"><input type="checkbox" disabled={locked} checked={container.ascensionIds.includes(test.ascensionId)} onChange={e => update(container.key, { ascensionIds: e.target.checked ? [...container.ascensionIds, test.ascensionId] : container.ascensionIds.filter(id => id !== test.ascensionId) })} />{test.testName} <small className="text-muted">#{test.ascensionId}</small></label>)}
          </article>)}
          <label className="d-block mb-2">Total draw / collected amount (optional)<input className="form-control" type="number" step="0.01" min="0.01" value={drawnQuantity} disabled={locked} onChange={e => setDrawnQuantity(e.target.value)} /><small className="text-muted">For a 5 ml draw split into 3 ml EDTA and 2 ml gel, enter 5 here. Container amounts must add up using the same unit.</small></label>
          <label className="d-block">Reason for manual override<textarea className="form-control" maxLength={1000} value={reason} disabled={locked} onChange={e => setReason(e.target.value)} /></label>
          <div className="d-flex gap-2 mt-3"><button type="button" className="btn btn-primary" disabled={busy || !options.containerTypes.length} onClick={save}>{busy ? 'Saving...' : pending ? 'Retry same container plan' : 'Confirm plan and start collection'}</button><button type="button" className="btn btn-outline-secondary" disabled={locked} onClick={onCancel}>Cancel</button></div>
     </section>;
}
