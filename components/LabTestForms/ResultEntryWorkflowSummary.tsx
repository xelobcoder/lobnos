'use client';
import {useEffect, useState} from 'react';
import ResultReleaseWorkflowActions from '../operations/Laboratory/ResultReleaseWorkflowActions';
import {controlApi} from '../operations/OperationalControlsWorkspace';

export default function ResultEntryWorkflowSummary({ascensionid, refreshKey = 0, onValidate, testName = "Laboratory result", patientName = "", blocked = false}: {ascensionid: number; refreshKey?: number; onValidate?: () => void; testName?: string; patientName?: string; blocked?: boolean}) {
    const [workflow, setWorkflow] = useState<any>(null);
    const [error, setError] = useState('');
    const [retry, setRetry] = useState(0);
    useEffect(() => {
        let active = true;
        setWorkflow(null); setError('');
        if (!Number.isSafeInteger(Number(ascensionid)) || Number(ascensionid) < 1) {
            setError('An ascension is required to load workflow status.');
            return;
        }
        controlApi(`reports/${ascensionid}/release-preview`).then(data => {
            if (active) setWorkflow(data.workflow);
        }).catch(err => { if (active) setError(err.message || 'Workflow status could not be loaded.'); });
        return () => { active = false; };
    }, [ascensionid, refreshKey, retry]);
    return <section aria-label="Result workflow" className="border rounded-3 p-3 bg-body-tertiary">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
            <strong>Ascension #{ascensionid}</strong>
            <div className="d-flex flex-wrap gap-2">
                <button type="button" className="btn btn-sm btn-outline-primary" disabled={blocked} onClick={onValidate}>Review validation</button>
                {!blocked && workflow && <ResultReleaseWorkflowActions inline ascensionId={Number(ascensionid)} patientName={patientName} testName={testName} workflow={workflow} onUpdated={() => setRetry(value => value + 1)} />}
            </div>
        </div>
        {blocked && <p className="small text-warning-emphasis mt-2 mb-0">Save your changes before reviewing or authorizing this result.</p>}
        {error ? <div className="mt-2 text-danger" role="alert">{error} <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setRetry(value => value + 1)}>Retry status</button></div>
        : !workflow ? <p className="small mt-2 mb-0" role="status">Loading workflow status…</p>
        : <>
            <div className="d-flex flex-wrap gap-2 mt-3">
                <span className={`badge ${workflow.validationComplete ? 'bg-success-subtle text-success-emphasis' : 'bg-warning-subtle text-warning-emphasis'}`}>{workflow.requiresRevalidation ? 'Revalidation required' : workflow.validationComplete ? 'Validated' : 'Awaiting validation'} · {workflow.validationCount}/{workflow.validationRequired}</span>
                <span className="badge bg-secondary-subtle text-secondary-emphasis">Manager approval: {workflow.managerApprovalRequired ? workflow.managerApproved ? 'Approved' : 'Required' : 'Not required'}</span>
                <span className="badge bg-primary-subtle text-primary-emphasis">Sign &amp; Release: {workflow.released ? 'Released' : workflow.explicitReleaseRequired ? 'Required' : 'Optional'}</span>
            </div>
            <p className="small text-body-secondary mb-0 mt-2">{workflow.explicitReleaseRequired === false && workflow.availableForPrinting ? 'Separate Sign & Release is optional for this validated result.' : workflow.releaseBlockedReason || 'Review the saved result before authorizing release.'} Payment and critical-result checks still apply when printing.</p>
        </>}
    </section>;
}
