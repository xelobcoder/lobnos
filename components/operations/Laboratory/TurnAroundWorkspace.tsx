'use client';

import { useState } from 'react';
import PendingResultTATOverview from './PendingResultTATOverview';
import TurnAroundDataTable from './TurnAroundDataTable';

export default function TurnAroundWorkspace({ data = [] }: { data?: any[] }) {
     const [tab, setTab] = useState<'summary' | 'individual'>('summary');
     const [individualView, setIndividualView] = useState<'all' | 'pending'>('all');
     const [threshold, setThreshold] = useState(6);
     const showCases = (hours: number) => { setThreshold(hours); setIndividualView('pending'); setTab('individual'); };
     return <div className="container-fluid py-3">
          <h1 className="h4">Turnaround time</h1>
          <div className="nav nav-tabs mb-3" role="tablist" aria-label="Turnaround time views">
               <button className={`nav-link ${tab === 'summary' ? 'active' : ''}`} id="tat-summary-tab" role="tab" aria-selected={tab === 'summary'} aria-controls="tat-summary-panel" onClick={() => setTab('summary')}>Summary</button>
               <button className={`nav-link ${tab === 'individual' ? 'active' : ''}`} id="tat-individual-tab" role="tab" aria-selected={tab === 'individual'} aria-controls="tat-individual-panel" onClick={() => setTab('individual')}>Individual tests</button>
          </div>
          {tab === 'summary' ? <section role="tabpanel" id="tat-summary-panel" aria-labelledby="tat-summary-tab"><p className="text-muted small">Facility totals for pending results. Select an elapsed-time group to view its individual tests.</p><PendingResultTATOverview view="summary" onThresholdSelect={showCases} /></section>
               : <section role="tabpanel" id="tat-individual-panel" aria-labelledby="tat-individual-tab"><div className="mb-3"><label className="form-label small fw-semibold" htmlFor="tat-individual-view">Show tests</label><select id="tat-individual-view" className="form-select" style={{ maxWidth: 320 }} value={individualView} onChange={event => setIndividualView(event.target.value as 'all' | 'pending')}><option value="all">All individual test turnaround times</option><option value="pending">Pending results by elapsed time</option></select></div>{individualView === 'pending' ? <PendingResultTATOverview view="cases" initialThreshold={threshold} /> : <TurnAroundDataTable data={data} />}</section>}
     </div>;
}
