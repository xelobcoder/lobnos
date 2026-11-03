"use client";
import { useState, type ReactNode } from "react";
import { accountingReference, record, rowsOf, text, type RecordData } from "../../../../lib/pharmacyAccounting";
import { DataTable, Facts, Feedback, Field, money, ReferenceText, ResourceState, styles } from "./common";
import { useMutation, useResource } from "./api";
import SupplierPicker from "./SupplierPicker";
import { Register } from "./Registers";

type AllocationLine = { billId: string; amount: string };
type ActionRenderer = (row: RecordData, kind: "allocation" | "release", refresh: () => void) => ReactNode;
const today = () => new Date().toISOString().slice(0, 10);
const sourceColumns = [
     "sourceKind",
     "sourceRef",
     "financialDate",
     "amount",
     "allocatedAmount",
     "unappliedAmount",
     "availableAmount",
     "status",
     "journalId",
];
const sourceCell = (row: RecordData, key: string) =>
     key === "sourceRef" ? (
          <ReferenceText value={row.sourceRef} field="source_document" kind={row.sourceKind} />
     ) : key === "journalId" && row.journalId ? (
          <a href={`/pharmacy/accounting/general-ledger/journals/${encodeURIComponent(text(row.journalId))}`}>
               <ReferenceText value={row.journalId} field="journal_id" />
          </a>
     ) : undefined;
function cents(value: unknown): number | null {
     if (!["string", "number"].includes(typeof value) || !/^\d+(?:\.\d{1,2})?$/.test(String(value))) return null;
     const n = Math.round(Number(value) * 100);
     return Number.isSafeInteger(n) ? n : null;
}
export function supplierAllocationError(lines: AllocationLine[], source: RecordData, bills: RecordData[]): string {
     if (source.status !== "available" || cents(source.availableAmount) == null)
          return "Choose available, registered original supplier evidence.";
     if (!lines.length || lines.length > 100 || new Set(lines.map((line) => line.billId)).size !== lines.length)
          return "Choose 1–100 distinct original supplier bills.";
     let total = 0;
     for (const line of lines) {
          const bill = bills.find((b) => String(b.id) === line.billId),
               amount = cents(line.amount);
          if (!bill || String(bill.supplier_id) !== String(source.supplierId))
               return "Every bill must belong to the selected source supplier.";
          const outstanding = cents(bill.outstanding_amount);
          if (amount == null || amount <= 0 || outstanding == null || amount > outstanding)
               return "Each allocation must be a positive two-decimal amount within the evidenced bill outstanding.";
          total += amount;
     }
     return Number.isSafeInteger(total) && total <= cents(source.availableAmount)!
          ? ""
          : "Allocations exceed the original source available amount.";
}
export function SourceRegistration({ row, refresh }: { row: RecordData; refresh: () => void }) {
     const mutation = useMutation();
     return (
          <section>
               <h3 className="h6">Register existing source evidence</h3>
               <Facts data={row} />
               <Feedback {...mutation} />
               <form
                    onSubmit={async (e) => {
                         e.preventDefault();
                         const f = new FormData(e.currentTarget);
                         if (
                              f.get("confirmed") !== "on" ||
                              !["payment", "credit_note"].includes(String(row.sourceKind)) ||
                              !row.sourceRef
                         )
                              return;
                         if (
                              await mutation.mutate("payables/allocation-sources", {
                                   sourceKind: row.sourceKind,
                                   sourceRef: row.sourceRef,
                              })
                         )
                              refresh();
                    }}
               >
                    <fieldset disabled={mutation.pending}>
                         <label className="d-block mb-3">
                              <input type="checkbox" required name="confirmed" /> I reviewed this original posted
                              source. Registration does not pay money or create another journal.
                         </label>
                         <button className="btn btn-primary">Register reviewed source</button>
                    </fieldset>
               </form>
          </section>
     );
}
export function AllocationForm({
     sources,
     bills,
     date,
     refresh,
}: {
     sources: RecordData[];
     bills: RecordData[];
     date: string;
     refresh: () => void;
}) {
     const [sourceId, setSourceId] = useState(""),
          [lines, setLines] = useState<AllocationLine[]>([{ billId: "", amount: "" }]),
          [error, setError] = useState("");
     const mutation = useMutation(),
          source = sources.find((s) => String(s.id) === sourceId) || {};
     const eligible = bills.filter(
          (b) => String(b.supplier_id) === String(source.supplierId) && Number(b.outstanding_amount) > 0,
     );
     const patch = (index: number, value: Partial<AllocationLine>) =>
          setLines(lines.map((line, i) => (i === index ? { ...line, ...value } : line)));
     return (
          <section className={styles.section}>
               <h3>Create reviewed application</h3>
               <p>
                    Apply already-posted supplier payment or credit-note evidence to original bills. This does not move
                    cash or create a duplicate GL posting. Enabled accounting requires the original source to be
                    consolidated first. Drafts reserve no balance; the server revalidates availability when posted.
               </p>
               <Feedback error={error || mutation.error} errorCode={error ? '' : mutation.errorCode} notice={mutation.notice} />
               <form
                    onSubmit={async (e) => {
                         e.preventDefault();
                         setError("");
                         const issue = supplierAllocationError(lines, source, bills);
                         if (issue) {
                              setError(issue);
                              return;
                         }
                         const f = new FormData(e.currentTarget);
                         if (
                              await mutation.mutate("payables/allocations", {
                                   sourceId,
                                   date,
                                   reason: f.get("reason"),
                                   allocations: lines.map((line) => ({ billId: line.billId, amount: line.amount })),
                              })
                         ) {
                              setSourceId("");
                              setLines([{ billId: "", amount: "" }]);
                              refresh();
                         }
                    }}
               >
                    <fieldset disabled={mutation.pending}>
                         <Field label="Registered original source">
                              <select
                                   required
                                   name="sourceId"
                                   className="form-select"
                                   value={sourceId}
                                   onChange={(e) => {
                                        setSourceId(e.target.value);
                                        setLines([{ billId: "", amount: "" }]);
                                   }}
                              >
                                   <option value="">Choose available original evidence</option>
                                   {sources
                                        .filter((s) => s.status === "available" && Number(s.availableAmount) > 0)
                                        .map((s) => (
                                             <option key={text(s.id)} value={text(s.id)} title={text(s.sourceRef)}>
                                                  {s.sourceKind === "payment"
                                                       ? "Supplier payment"
                                                       : "Supplier credit note"}{" "}
                                                  · {accountingReference(s.sourceRef, "source_document", s.sourceKind)}{" "}
                                                  · available {money(s.availableAmount)}
                                             </option>
                                        ))}
                              </select>
                         </Field>
                         {lines.map((line, i) => (
                              <div className={styles.grid} key={i}>
                                   <Field label={`Application ${i + 1} original bill`}>
                                        <select
                                             required
                                             name={`billId-${i + 1}`}
                                             className="form-select"
                                             value={line.billId}
                                             onChange={(e) => patch(i, { billId: e.target.value })}
                                        >
                                             <option value="">Choose this supplier’s original bill</option>
                                             {eligible.map((b) => (
                                                  <option
                                                       value={text(b.id)}
                                                       key={text(b.id)}
                                                       disabled={lines.some(
                                                            (l, n) => n !== i && l.billId === String(b.id),
                                                       )}
                                                       title={text(b.source_ref || b.reference)}
                                                  >
                                                       {accountingReference(
                                                            b.source_ref || b.reference,
                                                            "source_document",
                                                            "receipt",
                                                       )}{" "}
                                                       · {text(b.description || b.source_kind)} · open{" "}
                                                       {money(b.outstanding_amount)}
                                                  </option>
                                             ))}
                                        </select>
                                   </Field>
                                   <Field label={`Application ${i + 1} amount`}>
                                        <input
                                             required
                                             type="number"
                                             name={`allocationAmount-${i + 1}`}
                                             min="0.01"
                                             step="0.01"
                                             className="form-control"
                                             value={line.amount}
                                             onChange={(e) => patch(i, { amount: e.target.value })}
                                        />
                                   </Field>
                                   {lines.length > 1 && (
                                        <button
                                             type="button"
                                             className="btn btn-outline-danger"
                                             onClick={() => setLines(lines.filter((_, n) => n !== i))}
                                        >
                                             Remove application {i + 1}
                                        </button>
                                   )}
                              </div>
                         ))}
                         <Field label="Application review evidence / reason">
                              <textarea required name="reason" className="form-control" />
                         </Field>
                         <div className={styles.actions}>
                              <button
                                   type="button"
                                   className="btn btn-outline-secondary"
                                   disabled={lines.length >= 100}
                                   onClick={() => setLines([...lines, { billId: "", amount: "" }])}
                              >
                                   Add bill application
                              </button>
                              <button className="btn btn-primary" disabled={!sourceId}>
                                   Save application draft
                              </button>
                         </div>
                    </fieldset>
               </form>
          </section>
     );
}
export function AllocationRelease({
     row,
     replacement = false,
     refresh,
}: {
     row: RecordData;
     replacement?: boolean;
     refresh: () => void;
}) {
     const mutation = useMutation();
     if (
          replacement
               ? row.status !== "voided" ||
                 !row.reversal_of ||
                 !Number.isSafeInteger(Number(row.version)) ||
                 Number(row.version) < 1
               : row.status !== "posted"
     )
          return null;
     return (
          <details className="mt-3 d-print-none">
               <summary>
                    {replacement ? "Replace voided allocation release" : "Request exact allocation release"}
               </summary>
               <p>
                    Release only the original application’s allocations after independent approval. This restores
                    unapplied source capacity; it does not refund money, reverse its original journal, or change the
                    source destination. Original legacy payments and credited returns remain immutable: no cancellation
                    or reversal producer API is exposed for those sources. Unused evidence may be reapplied through
                    reviewed applications.
               </p>
               <Feedback {...mutation} />
               <form
                    onSubmit={async (e) => {
                         e.preventDefault();
                         const f = new FormData(e.currentTarget);
                         const body: RecordData = { date: f.get("date"), reason: f.get("reason") };
                         if (replacement) {
                              body.replacesIntentId = row.id;
                              body.expectedVersion = Number(row.version);
                         }
                         if (
                              await mutation.mutate(
                                   `payables/allocations/${encodeURIComponent(text(replacement ? row.reversal_of : row.id))}/reversals`,
                                   body,
                              )
                         )
                              refresh();
                    }}
               >
                    <fieldset disabled={mutation.pending}>
                         <Field label="Allocation release financial date">
                              <input required type="date" name="date" defaultValue={today()} className="form-control" />
                         </Field>
                         <Field label="Allocation release evidence / reason">
                              <textarea required name="reason" className="form-control" />
                         </Field>
                         <button className="btn btn-outline-danger">Save exact release for review</button>
                    </fieldset>
               </form>
          </details>
     );
}
export function AllocationReview({
     row,
     kind,
     refresh,
     actions,
}: {
     row: RecordData;
     kind: "allocation" | "release";
     refresh: () => void;
     actions: ActionRenderer;
}) {
     const endpoint = kind === "allocation" ? "payables/allocations" : "payables/allocation-reversals";
     const detail = useResource<RecordData>(`${endpoint}/${encodeURIComponent(text(row.id))}`);
     const reload = () => {
          void detail.refresh();
          refresh();
     };
     return (
          <section aria-label="Original supplier application evidence">
               <ResourceState {...detail} retry={detail.refresh} />
               {detail.data && (
                    <>
                         <Facts data={detail.data} />
                         <Facts data={record(detail.data.details)} />
                         <h4 className="h6">Exact posted source uses / signed release lineage</h4>
                         <DataTable
                              rows={rowsOf(detail.data.sourceUses)}
                              columns={[
                                   "financial_date",
                                   "id",
                                   "source_id",
                                   "document_id",
                                   "bill_id",
                                   "allocation_id",
                                   "amount",
                                   "reversal_of_use_id",
                              ]}
                         />
                         <details className="mb-3">
                              <summary>Reviewed release intents and audit events</summary>
                              <DataTable
                                   rows={rowsOf(detail.data.reversals)}
                                   columns={["id", "financial_date", "description", "status"]}
                              />
                              <DataTable
                                   rows={rowsOf(detail.data.audit)}
                                   columns={["created_at", "action", "actor_id", "entity_id"]}
                              />
                         </details>
                         {actions(detail.data, kind, reload)}
                         <AllocationRelease row={detail.data} replacement={kind === "release"} refresh={reload} />
                    </>
               )}
          </section>
     );
}
function AllocationWorkspace({ refresh, actions }: { refresh: () => void; actions: ActionRenderer }) {
     const [supplier, setSupplier] = useState(""),
          [supplierName, setSupplierName] = useState(""),
          [kind, setKind] = useState("payment"),
          [offset, setOffset] = useState(0),
          [sourceOffset, setSourceOffset] = useState(0),
          [date, setDate] = useState(today()),
          [version, setVersion] = useState(0);
     const params = new URLSearchParams({
          supplierId: supplier,
          sourceKind: kind,
          limit: "25",
          offset: String(offset),
     });
     const candidates = useResource<RecordData>(`payables/allocation-sources/candidates?${params}`, false, !!supplier);
     const sources = useResource<RecordData>(
          `payables/allocation-sources?${new URLSearchParams({ supplierId: supplier, limit: "25", offset: String(sourceOffset) })}`,
          false,
          !!supplier,
     );
     const bills = useResource<RecordData>(`payables/bills?asOf=${date}`, false, !!supplier);
     const reload = () => {
          setVersion((v) => v + 1);
          void candidates.refresh();
          void sources.refresh();
          void bills.refresh();
          refresh();
     };
     return (
          <>
               <section className={styles.section}>
                    <h3>Original supplier evidence</h3>
                    <div className={styles.actions}>
                         <div className={styles.field}>
                              <label htmlFor="accounting-supplier">Supplier</label>
                              <SupplierPicker
                                   value={supplier}
                                   onChange={(id, name) => {
                                        setSupplier(id);
                                        setSupplierName(name);
                                        setOffset(0);
                                        setSourceOffset(0);
                                   }}
                              />
                         </div>
                         <Field label="Original evidence kind">
                              <select
                                   className="form-select"
                                   value={kind}
                                   onChange={(e) => {
                                        setKind(e.target.value);
                                        setOffset(0);
                                   }}
                              >
                                   <option value="payment">Existing supplier payment</option>
                                   <option value="credit_note">Posted supplier-return credit note</option>
                              </select>
                         </Field>
                         <Field label="Application financial date / bill as of">
                              <input
                                   required
                                   type="date"
                                   name="applicationDate"
                                   className="form-control"
                                   value={date}
                                   onChange={(e) => {
                                        if (e.target.value) setDate(e.target.value);
                                   }}
                              />
                         </Field>
                    </div>
                    {!supplier && (
                         <p role="status">Search and choose the named supplier before loading original evidence.</p>
                    )}
                    <ResourceState {...candidates} retry={candidates.refresh} />
                    {candidates.data && (
                         <>
                              <h4 className="h6">Eligible unregistered sources · {supplierName}</h4>
                              <DataTable
                                   rows={rowsOf(candidates.data)}
                                   columns={sourceColumns}
                                   cell={sourceCell}
                                   actions={(row) => <SourceRegistration row={row} refresh={reload} />}
                              />
                              <p>
                                   Scanned {Number(candidates.data.scanned).toLocaleString()} original records on this
                                   page. Eligibility is checked against original posted journals; this is not a
                                   full-history export.
                              </p>
                              <div className={`${styles.actions} d-print-none`}>
                                   <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        disabled={!offset}
                                        onClick={() => setOffset(Math.max(0, offset - 25))}
                                   >
                                        Previous original-source page
                                   </button>
                                   <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        disabled={candidates.data.nextOffset == null}
                                        onClick={() => setOffset(Number(candidates.data!.nextOffset))}
                                   >
                                        Next original-source page
                                   </button>
                              </div>
                         </>
                    )}
                    <ResourceState {...sources} retry={sources.refresh} />
                    {sources.data && (
                         <>
                              <h4 className="h6 mt-3">Registered original sources · {supplierName}</h4>
                              <DataTable rows={rowsOf(sources.data)} columns={sourceColumns} cell={sourceCell} />
                              <div className={`${styles.actions} d-print-none`}>
                                   <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        disabled={!sourceOffset}
                                        onClick={() => setSourceOffset(Math.max(0, sourceOffset - 25))}
                                   >
                                        Previous registered-source page
                                   </button>
                                   <span>
                                        Loaded source page {(sourceOffset / 25 + 1).toLocaleString()} · up to 25
                                        sources; not a full register export.
                                   </span>
                                   <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        disabled={rowsOf(sources.data).length < 25}
                                        onClick={() => setSourceOffset(sourceOffset + 25)}
                                   >
                                        Next registered-source page
                                   </button>
                              </div>
                         </>
                    )}
                    <ResourceState {...bills} retry={bills.refresh} />
                    {sources.data && bills.data && (
                         <AllocationForm
                              key={`${supplier}:${sourceOffset}`}
                              sources={rowsOf(sources.data)}
                              bills={rowsOf(bills.data)}
                              date={date}
                              refresh={reload}
                         />
                    )}
               </section>
               <h3 className="h5">Reviewed supplier applications</h3>
               <Register
                    endpoint="payables/allocations"
                    key={`applications-${version}`}
                    actions={(row, load) => (
                         <AllocationReview
                              row={row}
                              kind="allocation"
                              actions={actions}
                              refresh={() => {
                                   load();
                                   reload();
                              }}
                         />
                    )}
               />
               <h3 className="h5">Reviewed application releases</h3>
               <Register
                    endpoint="payables/allocation-reversals"
                    key={`releases-${version}`}
                    actions={(row, load) => (
                         <AllocationReview
                              row={row}
                              kind="release"
                              actions={actions}
                              refresh={() => {
                                   load();
                                   reload();
                              }}
                         />
                    )}
               />
          </>
     );
}
export default function SupplierAllocations({ refresh, actions }: { refresh: () => void; actions: ActionRenderer }) {
     const [open, setOpen] = useState(false);
     return (
          <details className="mb-3" onToggle={(e) => setOpen(e.currentTarget.open)}>
               <summary>Apply existing supplier payment / credit evidence and review releases</summary>
               <p className="mt-3">
                    Separate from new cash settlements. Existing original evidence is registered, reviewed,
                    independently approved and applied without posting its cash or credit journal again.
               </p>
               {open && <AllocationWorkspace refresh={refresh} actions={actions} />}
          </details>
     );
}
