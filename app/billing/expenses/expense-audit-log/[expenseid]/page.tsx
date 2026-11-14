'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RiArrowLeftLine, RiHistoryLine, RiRefreshLine, RiSearchLine } from '@remixicon/react';
import { customFetch } from '../../../../../components/Auth/customFetch';
import styles from './AuditLogDisplay.module.css';

type Fields = Record<string, unknown>;
type Log = {
  audit_id: number;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  old_data: Fields | null;
  new_data: Fields | null;
  changed_by: number | null;
  changed_on: string;
  username?: string;
};
type History = {
  expense: { name: string; amount: number; approved: number; workflow_status?: string; description?: string };
  actions: Array<{ id: number; action: string; from_status?: string; to_status?: string; actor_name?: string; actor_employeeid: number; actor_role?: string; amount: number; reason?: string; created_at: string }>;
  payments: Array<{ id: number; amount: number; payment_date: string; method: string; status: string; is_reversed: number; payment_reference?: string; payment_account_name?: string; recorded_by_name?: string }>;
};
type Activity = { id: string; title: string; date: string; actor?: string; detail?: string; amount?: number };

const money = new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' });
const dateTime = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
const dateLabel = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone: 'UTC' });
const readable = (value = '') => value.replace(/_/g, ' ');
const formatDate = (value: string) => {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return 'Date unavailable';
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? dateLabel.format(date) : dateTime.format(date);
};
const formatValue = (value: unknown) => value == null ? '—' : typeof value === 'object' ? JSON.stringify(value) : String(value);
const operation = { INSERT: 'Created', UPDATE: 'Updated', DELETE: 'Deleted' };

export default function ExpenseAuditPage() {
  const { expenseid } = useParams<{ expenseid: string }>();
  const [data, setData] = useState<{ id: string; logs: Log[] | null; history: History | null }>();
  const [request, setRequest] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.allSettled([
      customFetch(`expenses/audit/${expenseid}`),
      customFetch(`expenses/${expenseid}/workflow-history`),
    ]).then(([audit, workflow]) => {
      if (!active) return;
      setData({
        id: expenseid,
        logs: audit.status === 'fulfilled' && Array.isArray(audit.value) ? audit.value : null,
        history: workflow.status === 'fulfilled' && workflow.value?.success ? workflow.value.data : null,
      });
      setLoading(false);
    });
    return () => { active = false; };
  }, [expenseid, request]);

  const current = data?.id === expenseid ? data : undefined;
  const history = current?.history;
  const expense = history?.expense;
  const paid = history?.payments.reduce((sum, payment) =>
    payment.status.toLowerCase() === 'paid' && !Number(payment.is_reversed) ? sum + Number(payment.amount) : sum, 0);
  const status = expense && (Number(expense.approved) === 1
    ? (Number(paid) >= Number(expense.amount) ? 'Paid' : Number(paid) > 0 ? 'Partially paid' : 'Approved')
    : Number(expense.approved) === 2 ? 'Rejected' : expense.workflow_status === 'draft' ? 'Draft' : 'Awaiting approval');

  const activity: Activity[] = history ? [
    ...history.actions.map(action => ({
      id: `action-${action.id}`, title: readable(action.action), date: action.created_at,
      actor: [action.actor_name || `Employee ${action.actor_employeeid}`, action.actor_role].filter(Boolean).join(' · '),
      detail: [action.from_status && action.to_status && `${readable(action.from_status)} → ${readable(action.to_status)}`, action.reason].filter(Boolean).join(' · '),
      amount: action.amount,
    })),
    ...history.payments.map(payment => ({
      id: `payment-${payment.id}`, title: Number(payment.is_reversed) ? 'Payment reversed' : payment.method === 'SYSTEM_AUTO' ? 'Automated settlement' : `Payment · ${payment.status}`,
      date: payment.payment_date, actor: payment.recorded_by_name,
      detail: [payment.payment_account_name || (payment.method !== 'SYSTEM_AUTO' && readable(payment.method)), payment.payment_reference].filter(Boolean).join(' · '),
      amount: payment.amount,
    })),
  ].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)) : [];
  const query = search.trim().toLowerCase();
  const logs = [...(current?.logs || [])].sort((a, b) => b.audit_id - a.audit_id).filter(log =>
    [log.username, log.changed_by, log.operation, operation[log.operation], formatDate(log.changed_on)]
      .some(value => String(value ?? '').toLowerCase().includes(query)),
  );

  return (
    <main className={styles.page} aria-busy={loading}>
      <header className={styles.header}>
        <div className={styles.toolbar}>
          <Link href="/billing/expenses"><RiArrowLeftLine size={18} aria-hidden /> Expenses</Link>
          <button type="button" className="btn btn-sm btn-outline-secondary" disabled={loading} onClick={() => setRequest(value => value + 1)}>
            <RiRefreshLine size={16} aria-hidden /> {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
        <div className={styles.heading}>
          <div><p>Expense #{expenseid} / Audit trail</p><h1>{expense?.name || 'Expense audit trail'}</h1></div>
          {status && <span className={styles.status} data-status={status}>{status}</span>}
        </div>
        {expense?.description && <p className={styles.description}>{expense.description}</p>}
        {expense && <dl className={styles.totals}>
          <div><dt>Expense amount</dt><dd>{money.format(Number(expense.amount))}</dd></div>
          <div><dt>Settled amount</dt><dd>{money.format(paid ?? 0)}</dd></div>
          <div><dt>Outstanding</dt><dd>{Number(expense.approved) === 1 ? money.format(Math.max(0, Number(expense.amount) - (paid ?? 0))) : '—'}</dd></div>
        </dl>}
      </header>

      {!current && loading ? <p className={styles.empty} role="status">Loading expense history…</p> : <>
        <section className={styles.panel} aria-labelledby="activity-heading">
          <div className={styles.sectionTitle}><RiHistoryLine size={21} aria-hidden /><h2 id="activity-heading">Workflow activity</h2></div>
          {!history ? <p className={styles.empty} role="alert">Workflow history is unavailable. Use Refresh to try again.</p> : activity.length === 0
            ? <p className={styles.empty}>No workflow actions or payments have been recorded.</p>
            : <ol className={styles.timeline}>{activity.map(item => (
              <li key={item.id}>
                <div><h3>{item.title}</h3><p>{[formatDate(item.date), item.actor].filter(Boolean).join(' · ')}</p>{item.detail && <p>{item.detail}</p>}</div>
                {item.amount != null && <strong>{money.format(Number(item.amount))}</strong>}
              </li>
            ))}</ol>}
        </section>

        <section className={styles.panel} aria-labelledby="changes-heading">
          <div className={styles.sectionHeader}>
            <div><h2 id="changes-heading">Record changes</h2>{current?.logs && <p>{logs.length} of {current.logs.length} changes</p>}</div>
            {!!current?.logs?.length && <label className={styles.search}><RiSearchLine size={18} aria-hidden />
              <input type="search" aria-label="Search record changes" placeholder="Search actor, action or date" value={search} onChange={event => setSearch(event.target.value)} />
            </label>}
          </div>
          {!current?.logs ? <p className={styles.empty} role="alert">Record changes are unavailable. Use Refresh to try again.</p> : !logs.length
            ? <p className={styles.empty}>{query ? 'No changes match your search.' : 'No record changes have been logged.'}</p>
            : logs.map(log => {
              const fields = [...new Set([...Object.keys(log.old_data || {}), ...Object.keys(log.new_data || {})])];
              const changed = fields.filter(field => log.operation !== 'UPDATE' || formatValue(log.old_data?.[field]) !== formatValue(log.new_data?.[field]));
              return <details className={styles.change} key={log.audit_id}>
                <summary><span><strong>{operation[log.operation] || log.operation}</strong><small>{log.username || (log.changed_by ? `Employee ${log.changed_by}` : 'Actor unavailable')} · {formatDate(log.changed_on)}</small></span>
                  <span className={styles.fieldCount}>{changed.length} {changed.length === 1 ? 'field' : 'fields'}</span></summary>
                {changed.length ? <div className={styles.tableWrap}><table><thead><tr><th scope="col">Field</th><th scope="col">Before</th><th scope="col">After</th></tr></thead>
                  <tbody>{changed.map(field => <tr key={field}><th scope="row">{readable(field)}</th><td>{formatValue(log.old_data?.[field])}</td><td>{formatValue(log.new_data?.[field])}</td></tr>)}</tbody></table></div>
                  : <p className={styles.empty}>No field differences were recorded.</p>}
              </details>;
            })}
        </section>
      </>}
    </main>
  );
}
