import { ReportContent } from './ReportRichText';

export type ReportChange = { field: string; before: string | null; after: string | null };
export type ReportVersion = {
     version: number; revision: number; reason: string | null; signerName: string | null;
     signedBy: number | null; recordedAt: string; changes: ReportChange[]; isUltrasound?: boolean;
};

function ChangeValue({ value }: { value: string | null }) {
     if (!value) return <>—</>;
     return <ReportContent value={value} />;
}

export function ReportChangesReview({ changes }: { changes: ReportChange[] }) {
     if (!changes.length) return <p>No change in displayed result values, comments, or interpretation.</p>;
     return <section aria-label="Amendment comparison" className="mb-3">
          {changes.map((change, index) => <article key={index} className="mb-3">
               <h3 className="h6">{change.field}</h3>
               <div className="mb-2"><strong>Previous report</strong><ReportContent value={change.before} /></div>
               <div><strong>Amended report</strong><ReportContent value={change.after} /></div>
          </article>)}
     </section>;
}

export function ReportChangesTable({ changes }: { changes: ReportChange[] }) {
     if (!changes.length) return <p>No change in displayed result values, comments, or interpretation.</p>;
     return <table className="table table-sm table-bordered mb-1">
          <thead><tr><th scope="col">Changed item</th><th scope="col">Previous report</th><th scope="col">Amended report</th></tr></thead>
          <tbody>{changes.map((change, index) => <tr key={index} style={{ whiteSpace: 'pre-wrap' }}>
               <th scope="row">{change.field}</th><td><ChangeValue value={change.before} /></td><td><ChangeValue value={change.after} /></td>
          </tr>)}</tbody>
     </table>;
}

export default function ReportAmendmentNotice({ version, showChanges = true }: { version?: ReportVersion; showChanges?: boolean }) {
     if (!version?.signedBy) return null;
     return <section className="border rounded p-2 my-2" aria-label="Report amendment">
          <h3 className="h6">Amended report · Version {version.version}</h3>
          <p className="mb-1"><strong>Reason</strong> {version.reason}</p>
          <p className="mb-2"><strong>Electronically signed by</strong> {version.signerName} · {new Date(version.recordedAt).toLocaleString('en-GB')}</p>
          {showChanges && <ReportChangesTable changes={version.changes} />}
     </section>;
}
