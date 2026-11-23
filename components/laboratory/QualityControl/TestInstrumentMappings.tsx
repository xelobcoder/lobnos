'use client';

import { useEffect, useState } from 'react';
import { customFetch, customFetchMutation } from '../../Auth/customFetch';
import { useApplicationSettings } from '../../Auth/useApplicationContext';
import { roleAllowed } from '../../Auth/roles';

type Device = { id: string; deviceName: string; status: string };
type Test = { id: number; name: string; mode: 'manual' | 'instrument' | null; version: number; devices: Device[] };
type Event = { id: number; actor_id: number; reason: string; before_data: string | null; after_data: string; created_at: string };
const size = 20;
function checked(response: any) {
     if (!response || response.error || response.status === 'error' || Number(response.statusCode) >= 400)
          throw new Error(response?.message || response?.error || 'Request failed');
     return response;
}

export function TestInstrumentMappings() {
     const { applicationsettings } = useApplicationSettings();
     const canEdit = roleAllowed(applicationsettings?.user?.role, ['admin', 'manager']);
     const [tests, setTests] = useState<Test[]>([]);
     const [page, setPage] = useState(1), [total, setTotal] = useState(0);
     const [query, setQuery] = useState(''), [search, setSearch] = useState('');
     const [selected, setSelected] = useState<Test | null>(null);
     const [mode, setMode] = useState<'manual' | 'instrument'>('manual');
     const [deviceIds, setDeviceIds] = useState<string[]>([]), [reason, setReason] = useState('');
     const [devices, setDevices] = useState<Device[]>([]);
     const [devicePage, setDevicePage] = useState(1), [deviceTotal, setDeviceTotal] = useState(0);
     const [events, setEvents] = useState<Event[]>([]);
     const [historyPage, setHistoryPage] = useState(1), [historyTotal, setHistoryTotal] = useState(0);
     const [refresh, setRefresh] = useState(0), [busy, setBusy] = useState(false), [error, setError] = useState('');

     useEffect(() => {
          let live = true;
          customFetch(`test-instrument-mappings?page=${page}&count=${size}&search=${encodeURIComponent(search)}`).then(checked).then(response => {
               if (!Array.isArray(response.data)) throw new Error('Invalid tests response');
               if (live) { setTests(response.data); setTotal(Number(response.total)); }
          }).catch(e => { if (live) setError(e.message); });
          return () => { live = false; };
     }, [page, search, refresh]);
     useEffect(() => {
          if (!selected) return;
          let live = true;
          customFetch(`devices?page=${devicePage}&count=${size}`).then(checked).then(r => {
               if (!Array.isArray(r.data)) throw new Error('Invalid instruments response');
               if (live) { setDevices(r.data); setDeviceTotal(Number(r.total)); }
          }).catch(e => { if (live) setError(e.message); });
          return () => { live = false; };
     }, [selected, devicePage]);
     useEffect(() => {
          if (!selected) return;
          let live = true;
          customFetch(`test-instrument-mappings/${selected.id}/history?page=${historyPage}&count=${size}`).then(checked).then(r => {
               if (!Array.isArray(r.data)) throw new Error('Invalid history response');
               if (live) { setEvents(r.data); setHistoryTotal(Number(r.total)); }
          }).catch(e => { if (live) setError(e.message); });
          return () => { live = false; };
     }, [selected, historyPage, refresh]);
     function choose(test: Test) {
          setSelected(test); setMode(test.mode || 'manual'); setDeviceIds(test.devices.map(d => d.id));
          setReason(''); setHistoryPage(1); setDevicePage(1); setEvents([]); setError('');
     }
     async function save() {
          if (!selected) return;
          setBusy(true); setError('');
          try {
               checked(await customFetchMutation(`test-instrument-mappings/${selected.id}`, 'PUT',
                    { mode, deviceIds: mode === 'manual' ? [] : deviceIds, version: selected.version, reason }));
               setSelected(null); setRefresh(n => n + 1);
          } catch (e: any) { setError(e.message || 'Unable to save mapping'); }
          finally { setBusy(false); }
     }
     return <main className="container-fluid py-4">
          <h1>Test instrument mappings</h1>
          <p>Unconfigured tests retain their existing workflow. Instrument-based tests require an explicitly selected active mapped instrument; mappings do not assign instruments to results.</p>
          <p>Changing a mapping can block existing results from approval or release. Previously recorded results cannot be reassigned.</p>
          <a href="/operations/laboratory/quality-control">Back to quality control</a>
          {error && <div role="alert" className="alert alert-danger mt-3">{error}</div>}
          <form className="d-flex gap-2 my-3" onSubmit={e => { e.preventDefault(); setPage(1); setSearch(query); }}>
               <label htmlFor="test-search" className="visually-hidden">Search tests</label>
               <input id="test-search" className="form-control" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search tests" maxLength={100} />
               <button className="btn btn-outline-primary">Search</button>
          </form>
          <div className="table-responsive"><table className="table"><thead><tr><th>Test</th><th>Mode</th><th>Instruments</th><th /></tr></thead><tbody>
               {tests.map(test => <tr key={test.id}><td>{test.name}</td><td>{test.mode || 'Unconfigured'}</td>
                    <td>{test.devices.map(d => `${d.deviceName} (${d.status})`).join(', ') || '—'}</td>
                    <td><button className="btn btn-sm btn-outline-primary" onClick={() => choose(test)}>View / configure</button></td></tr>)}
          </tbody></table></div>
          <div className="d-flex gap-2 align-items-center"><button className="btn btn-outline-secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
               <span>Page {page} · {total} tests</span><button className="btn btn-outline-secondary" disabled={page * size >= total} onClick={() => setPage(page + 1)}>Next</button></div>
          {selected && <section className="border rounded p-3 mt-4">
               <h2>{selected.name}</h2><p>Current: {selected.mode || 'Unconfigured'} · version {selected.version}</p>
               <fieldset disabled={!canEdit || busy}>
                    <legend>Processing mode</legend>
                    <label className="me-3"><input type="radio" checked={mode === 'manual'} onChange={() => setMode('manual')} /> Manual only</label>
                    <label><input type="radio" checked={mode === 'instrument'} onChange={() => setMode('instrument')} /> Instrument based</label>
                    {mode === 'instrument' && <div className="mt-3"><h3>Eligible instruments</h3>
                         <p>{deviceIds.length} selected. Inactive instruments cannot be newly selected and must be removed before saving.</p>
                         <p>Selected IDs: {deviceIds.join(', ') || 'none'}</p>
                         {selected.devices.filter(d => deviceIds.includes(d.id) && !devices.some(x => x.id === d.id)).map(d =>
                              <div key={d.id}><button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setDeviceIds(ids => ids.filter(id => id !== d.id))}>Remove</button> {d.deviceName} ({d.status})</div>)}
                         {devices.map(d => <div key={d.id}><label><input type="checkbox" checked={deviceIds.includes(d.id)}
                              disabled={d.status !== 'active' && !deviceIds.includes(d.id)}
                              onChange={e => setDeviceIds(ids => e.target.checked ? [...ids, d.id] : ids.filter(id => id !== d.id))} /> {d.deviceName} ({d.status})</label></div>)}
                         <button type="button" className="btn btn-sm btn-outline-secondary me-2" disabled={devicePage === 1} onClick={() => setDevicePage(devicePage - 1)}>Previous instruments</button>
                         <span>Page {devicePage} · {deviceTotal} instruments </span>
                         <button type="button" className="btn btn-sm btn-outline-secondary" disabled={devicePage * size >= deviceTotal} onClick={() => setDevicePage(devicePage + 1)}>Next instruments</button>
                    </div>}
                    <label className="d-block mt-3">Reason for change <textarea className="form-control" maxLength={1000} value={reason} onChange={e => setReason(e.target.value)} /></label>
                    <button className="btn btn-primary mt-2" type="button" disabled={!reason.trim() || (mode === 'instrument' && !deviceIds.length)} onClick={save}>Save mapping</button>
               </fieldset>
               {!canEdit && <p>Only a supervisor can change mappings.</p>}
               <h3 className="mt-4">Mapping history</h3>
               {!events.length && <p>No changes recorded.</p>}
               {events.map(event => <article className="border rounded p-2 mb-2" key={event.id}>
                    <strong>Change #{event.id}</strong> · Employee #{event.actor_id} · {String(event.created_at)}<p>Reason: {event.reason}</p>
                    <p>Before: {event.before_data || 'Unconfigured'}</p><p>After: {event.after_data}</p>
               </article>)}
               <button className="btn btn-sm btn-outline-secondary me-2" disabled={historyPage === 1} onClick={() => setHistoryPage(historyPage - 1)}>Previous history</button>
               <span>Page {historyPage} · {historyTotal} changes </span><button className="btn btn-sm btn-outline-secondary" disabled={historyPage * size >= historyTotal} onClick={() => setHistoryPage(historyPage + 1)}>Next history</button>
          </section>}
     </main>;
}
