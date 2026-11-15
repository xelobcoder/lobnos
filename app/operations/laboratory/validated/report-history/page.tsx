'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ReportVersionsPage() {
     const router = useRouter();
     const [orderedTestId, setOrderedTestId] = useState('');
     const [error, setError] = useState('');

     return <main className="container py-4">
          <h1 className="h3">Report Versions &amp; Amendments</h1>
          <p>Open an ordered test to view its original report, compare amended versions, or review a pending sign-off.</p>
          <section className="border rounded p-3" style={{ maxWidth: 560 }}>
               <form onSubmit={event => {
                    event.preventDefault();
                    const id = orderedTestId.trim();
                    if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)) || Number(id) < 1) {
                         setError('Enter a valid ordered test ID.');
                         return;
                    }
                    router.push(`/operations/laboratory/validated/report-history/${Number(id)}`);
               }}>
                    <label className="form-label fw-semibold" htmlFor="report-history-test-id">Ordered test ID (Ascension ID)</label>
                    <div className="input-group">
                         <input id="report-history-test-id" className="form-control" inputMode="numeric" required
                              aria-invalid={Boolean(error)} value={orderedTestId}
                              onChange={event => { setOrderedTestId(event.target.value); setError(''); }} />
                         <button type="submit" className="btn btn-primary">Open report history</button>
                    </div>
                    {error && <p className="text-danger mt-2 mb-0" role="alert">{error}</p>}
               </form>
               <Link className="d-inline-block mt-3" href="/operations/laboratory/validated">Browse validated results</Link>
          </section>
     </main>;
}
