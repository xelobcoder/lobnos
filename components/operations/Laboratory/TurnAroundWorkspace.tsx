'use client';
import Link from 'next/link';

import { useState } from 'react';
import PendingResultTATOverview from './PendingResultTATOverview';
import TurnAroundDataTable from './TurnAroundDataTable';

export default function TurnAroundWorkspace({ data = [] }: { data?: any[] }) {
     const [tab, setTab] = useState<'summary' | 'individual'>('summary');
     const [individualView, setIndividualView] = useState<'all' | 'pending'>('all');
     const [benchmark,setBenchmark]=useState('overdue');
     const [period,setPeriod]=useState<{from:string;to:string}|undefined>(undefined);
     const showCases = (key:string) => { setBenchmark(key); setIndividualView('pending'); setTab('individual'); };
     return <div className="container-fluid py-3">
          <h1 className="h4">Analytic TAT</h1><div className="alert alert-light border"><Link href="/operations/laboratory/workbench">Open configured deadlines, priorities and escalations in the laboratory workbench</Link><div className="small text-muted">Analytic TAT measures processing start to processing end. Pending-result age groups and workbench deadlines measure waiting time separately.</div></div>
          <div className="nav nav-tabs mb-3" role="tablist" aria-label="Turnaround time views">
               <button className={`nav-link ${tab === 'summary' ? 'active' : ''}`} id="tat-summary-tab" role="tab" aria-selected={tab === 'summary'} aria-controls="tat-summary-panel" onClick={() => setTab('summary')}>Summary</button>
               <button className={`nav-link ${tab === 'individual' ? 'active' : ''}`} id="tat-individual-tab" role="tab" aria-selected={tab === 'individual'} aria-controls="tat-individual-panel" onClick={() => setTab('individual')}>Individual tests</button>
          </div>
          {tab === 'summary' ? <section role="tabpanel" id="tat-summary-panel" aria-labelledby="tat-summary-tab"><p className="text-muted small">Select a benchmark to review the individual tests and their actual processing times.</p><PendingResultTATOverview initialPeriod={period} onPeriodChange={setPeriod} view="summary" onBenchmarkSelect={showCases} /></section>
               : <section role="tabpanel" id="tat-individual-panel" aria-labelledby="tat-individual-tab"><div className="mb-3"><label className="form-label small fw-semibold" htmlFor="tat-individual-view">Show tests</label><select id="tat-individual-view" className="form-select" style={{ maxWidth: 320 }} value={individualView} onChange={event => setIndividualView(event.target.value as 'all' | 'pending')}><option value="all">All individual analytic turnaround times</option><option value="pending">Tests by configured target benchmark</option></select></div>{individualView === 'pending' ? <PendingResultTATOverview initialPeriod={period} onPeriodChange={setPeriod} view="cases" initialBenchmark={benchmark} /> : <TurnAroundDataTable data={data} />}</section>}
     </div>;
}
