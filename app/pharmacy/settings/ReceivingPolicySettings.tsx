'use client';
import {useState} from 'react';
import {usePharmacyDocument} from '../components/PharmacyPaymentFields';
import {styles, Message, Empty, usePharmacyResource} from '../components/PharmacyWorkspace';

export default function ReceivingPolicySettings() {
  const resource = usePharmacyResource('pharmacy/receiving/setup');
  return <section className={styles.card}>
    <h2>Receiving policy</h2>
    <p>Choose how excess deliveries are accepted and how selling prices are rounded. Each recorded delivery keeps its policy snapshot.</p>
    <Message error={resource.error}/>
    {resource.loading ? <Empty>Loading receiving policy…</Empty> : resource.error ? <button className="btn btn-outline-secondary" onClick={resource.refresh}>Retry</button> : <PolicyForm key={resource.lastUpdated} policy={resource.data.policy} refresh={resource.refresh}/>}
  </section>;
}
function PolicyForm({policy, refresh}: {policy: any; refresh: () => Promise<void>}) {
  const [mode, setMode] = useState(policy.mode), [tolerance, setTolerance] = useState(String(policy.tolerancePercent));
  const [increment, setIncrement] = useState(String(policy.roundingIncrement)), [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [saved, setSaved] = useState(false);
  const request = usePharmacyDocument('receiving-policy');
  const save = async () => {
    if (busy) return;
    setBusy(true); setError(''); setSaved(false);
    try {
      const response = await request.execute('pharmacy/receiving/policy', {mode, tolerancePercent:Number(tolerance), roundingIncrement:Number(increment), reason:reason.trim()});
      if (!response?.success) throw new Error(response?.error?.message || 'Unable to confirm policy change.');
      setReason(''); setSaved(true);
    } catch (e) {setError(e instanceof Error ? e.message : 'Unable to save policy.');}
    finally {setBusy(false);}
  };
  return <>
    <Message error={error} notice={saved ? 'Receiving policy saved.' : ''}/>
    {request.pending && <div className="alert alert-warning">A policy change needs confirmation. <button className="btn btn-warning" disabled={busy} onClick={save}>Retry original policy</button></div>}
    <form onSubmit={e => {e.preventDefault(); void save();}}><fieldset className="border-0 p-0" disabled={busy || !!request.pending}>
      <div className="row g-3">
        <label className="form-label col-12">Excess acceptance<select className="form-select" value={mode} onChange={e=>setMode(e.target.value)}><option value="approval">Manager approval required</option><option value="tolerance">Allow within tolerance, manager approves above tolerance</option><option value="prohibit">Prohibit excess acceptance</option></select></label>
        <label className="form-label col-md-6">Tolerance (%)<input className="form-control" type="number" min="0" max="100" step=".001" disabled={mode!=='tolerance'} required value={tolerance} onChange={e=>setTolerance(e.target.value)}/></label>
        <label className="form-label col-md-6">Selling-price rounding increment (GHS)<input className="form-control" type="number" min=".01" step=".01" required value={increment} onChange={e=>setIncrement(e.target.value)}/></label>
        <label className="form-label col-12">Reason for change<textarea className="form-control" required minLength={3} maxLength={1000} value={reason} onChange={e=>setReason(e.target.value)}/></label>
      </div>
      <footer className={styles.footer}><button type="button" className="btn btn-outline-secondary" onClick={refresh}>Reload saved policy</button><button className="btn btn-primary">{busy ? 'Saving…' : 'Save receiving policy'}</button></footer>
    </fieldset></form>
  </>;
}
