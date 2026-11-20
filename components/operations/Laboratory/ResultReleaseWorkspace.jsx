'use client';
import { useApplicationSettings } from '../../Auth/useApplicationContext';
import LaboratoryAscensionStages from './LaboratoryAscensionStages';
import { LaboratoryStagesProvider } from './LaboratoryStagesContext';
import ValidatedResultTable from './validatedResultTable';

export default function ResultReleaseWorkspace({ released = false }) {
    const { applicationsettings } = useApplicationSettings();
    const { user, branchid } = applicationsettings || {};
    const stage = released ? 'RELEASED' : 'SIGN_RELEASE';
    return <div className="p-3 container-fluid">
        <h1 className="h3 fw-bold">{released ? 'Released Results' : 'Sign & Release'}</h1>
        <p className="text-muted">{released
            ? 'Signed reports for the current result revision. View the release details or print an authorized report.'
            : 'Validated results awaiting manager approval or electronic sign-off. Any employee authorized in Result Entry Settings can sign and release; manager approval is separate.'}</p>
        <LaboratoryStagesProvider allDates>
            <LaboratoryAscensionStages employeeid={user?.employeeid} branchid={branchid} ascension_stage={stage} />
            <ValidatedResultTable employeeid={user?.employeeid} stage={stage} />
        </LaboratoryStagesProvider>
    </div>;
}
