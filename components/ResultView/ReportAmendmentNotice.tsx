export type ReportChange = { field: string; before: string | null; after: string | null };
export type ReportVersion = {
     version: number; revision: number; reason: string | null; signerName: string | null;
     signedBy: number | null; recordedAt: string; changes: ReportChange[];
};

export function ReportChangesTable({ changes }: { changes: ReportChange[] }) {
     if (!changes.length) return <p>No change in displayed result values, comments, or interpretation.</p>;
     return <table className="table table-sm table-bordered mb-1">
          <thead><tr><th scope="col">Changed item</th><th scope="col">Previous report</th><th scope="col">Amended report</th></tr></thead>
          <tbody>{changes.map((change, index) => <tr key={index} style={{ whiteSpace: 'pre-wrap' }}>
               <th scope="row">{change.field}</th><td>{change.before || '—'}</td><td>{change.after || '—'}</td>
          </tr>)}</tbody>
     </table>;
}

export default function ReportAmendmentNotice({ version }: { version?: ReportVersion }) {
     if (!version?.signedBy) return null;
     return <section className="border rounded p-2 my-2" aria-label="Report amendment">
          <h3 className="h6">Amended report · Version {version.version}</h3>
          <p className="mb-1"><strong>Reason</strong> {version.reason}</p>
          <p className="mb-2"><strong>Electronically signed by</strong> {version.signerName} · {new Date(version.recordedAt).toLocaleString('en-GB')}</p>
          <ReportChangesTable changes={version.changes} />
     </section>;
}
