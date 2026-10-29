"use client";
import { useEffect, useRef, useState } from 'react';

/** Inline feedback leaves form values in place and announces results to assistive technology. */
export function usePayrollFeedback() {
     const [notice, setNotice] = useState<{ message: string; kind: 'success' | 'error' } | null>(null);
     const target = useRef<HTMLDivElement>(null);
     useEffect(() => { if (notice?.kind === 'error') target.current?.focus(); }, [notice]);
     const notify = (message: unknown, kind: 'success' | 'error' = 'error') => setNotice({ message: String(message || 'Unable to complete this action. Please retry.'), kind });
     const feedback = notice ? <div ref={target} tabIndex={-1} role={notice.kind === 'error' ? 'alert' : 'status'} className={`alert alert-${notice.kind === 'error' ? 'danger' : 'success'} d-flex align-items-start justify-content-between gap-3`}>
          <span>{notice.message}</span><button type="button" className="btn-close flex-shrink-0" aria-label="Dismiss message" onClick={() => setNotice(null)} />
     </div> : null;
     return { notify, feedback };
}
