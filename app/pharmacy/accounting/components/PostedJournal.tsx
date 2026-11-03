'use client';
import Link from 'next/link';
import { record, rowsOf, text, type RecordData } from '../../../../lib/pharmacyAccounting';
import { useResource } from './api';
import { DataTable, Facts, ReferenceText, ResourceState, styles } from './common';

/** Operational pharmacy_journals IDs are not approval workflow document IDs. */
export default function PostedJournal({ id }: { id: string }) {
  const resource=useResource<RecordData>(`posted-journals/${encodeURIComponent(id)}`);
  const journal=record(resource.data),lines=rowsOf(journal.lines);
  return <section className={styles.card}><Link href="/pharmacy/accounting/general-ledger">← General ledger</Link><h2 className="mt-3">Posted operational journal <ReferenceText value={id} field="journal_id"/></h2><p>Immutable original posting evidence for sales, receipts and returns. Operational journal IDs are distinct from manual draft workflow IDs.</p><ResourceState {...resource} retry={resource.refresh}/>{resource.data&&<><Facts data={journal} idField="journal_id"/><DataTable rows={lines} columns={['account_number','account_name','source_document','debit','credit']} labels={{account_number:'Account no.',account_name:'Account'}}/><h3 className="mt-3">Shared posting link</h3><p>{journal.sharedEntryId!=null?`Shared general-ledger entry: ${text(journal.sharedEntryId)}`:'No shared general-ledger entry is linked to this local journal.'}</p><p className={styles.muted}>Original source: <ReferenceText value={journal.source_ref} field="source_ref" kind={journal.kind}/>. Line source documents and actual account names are preserved above. Corrections must use the original sale, receipt or return correction workflow. Posted operational entries cannot be edited or reversed from this detail view.</p></>}</section>;
}
