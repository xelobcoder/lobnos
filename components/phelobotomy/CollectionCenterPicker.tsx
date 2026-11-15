'use client';

import { useCallback, useEffect, useId, useState } from 'react';
import { customFetch, customFetchMutation } from '../Auth/customFetch';

const endpoint = 'physical-samples/collection-centers';
type Center = { id: number; name: string; active: boolean | number };

export default function CollectionCenterPicker({ value, onChange }: {
     value: number | undefined;
     onChange: (value: number | undefined) => void;
}) {
     const [centers, setCenters] = useState<Center[]>([]);
     const [canManage, setCanManage] = useState(false);
     const [loading, setLoading] = useState(true);
     const [busy, setBusy] = useState(false);
     const [name, setName] = useState('');
     const [error, setError] = useState('');
     const id = useId();

     const load = useCallback(async () => {
          const response = await customFetch(endpoint);
          if (!response?.success) throw new Error(response?.message || 'Unable to load collection centers');
          setCenters(response.data);
          setCanManage(response.canManage);
     }, []);

     useEffect(() => {
          load().catch(error => setError(error.message)).finally(() => setLoading(false));
     }, [load]);

     async function save(center?: Center) {
          setBusy(true);
          setError('');
          try {
               const response = center
                    ? await customFetchMutation(`${endpoint}/${center.id}`, 'PATCH', { active: !center.active })
                    : await customFetchMutation(endpoint, 'POST', { name: name.trim() });
               if (!response?.success) throw new Error(response?.message || 'Unable to save collection center');
               if (!center) {
                    setName('');
                    onChange(Number(response.data.id));
               } else if (center.active && center.id === value) onChange(undefined);
               await load();
          } catch (error) {
               setError(error instanceof Error ? error.message : 'Unable to save collection center');
          } finally {
               setBusy(false);
          }
     }

     return <section className="border rounded p-3 mb-3">
          <label className="form-label fw-semibold" htmlFor={id}>Collection center</label>
          <select id={id} className="form-select" value={value ?? ''} disabled={loading || busy}
               onChange={event => onChange(event.target.value ? Number(event.target.value) : undefined)}>
               <option value="">{loading ? 'Loading centers…' : 'No named center'}</option>
               {centers.filter(center => center.active).map(center => <option key={center.id} value={center.id}>{center.name}</option>)}
          </select>
          {canManage && <details className="mt-2">
               <summary className="text-primary">Manage branch collection centers</summary>
               <div className="d-flex flex-wrap gap-2 mt-2">
                    <input aria-label="New collection center name" className="form-control flex-fill w-auto" maxLength={100} value={name}
                         placeholder="New center name" onChange={event => setName(event.target.value)} />
                    <button type="button" className="btn btn-outline-primary" disabled={busy || !name.trim()} onClick={() => save()}>Add center</button>
               </div>
               {centers.length > 0 && <ul className="list-group list-group-flush mt-2">
                    {centers.map(center => <li key={center.id} className="list-group-item px-0 d-flex justify-content-between align-items-center gap-2">
                         <span>{center.name}{!center.active && <small className="text-muted ms-2">Inactive</small>}</span>
                         <button type="button" className="btn btn-sm btn-outline-secondary" disabled={busy} onClick={() => save(center)}>
                              {center.active ? 'Deactivate' : 'Reactivate'}
                         </button>
                    </li>)}
               </ul>}
          </details>}
          {error && <div className="text-danger small mt-2" role="alert">{error}</div>}
     </section>;
}
