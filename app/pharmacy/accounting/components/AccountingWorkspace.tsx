'use client';
import Link from 'next/link';
import { useState } from 'react';
import { accountingDestinations, type Section, type Settings } from '../../../../lib/pharmacyAccounting';
import { usePharmacyAccess } from '../../components/PharmacyWorkspace';
import { canAccessRolePage } from '../../../../lib/roleNavigationPolicy';
import { ChartOfAccounts, AccountingSettings } from './Configuration';
import { JournalDetail, JournalForm, Expenses } from './Documents';
import { CashBank, Periods, Reconciliation } from './Controls';
import { Overview, Register } from './Registers';
import { styles, WorkflowLinks } from './common';
import printStyles from './AccountingWorkspace.module.css';
import { useResource } from './api';
import Tax from './Tax';
import { Receivables, Payables } from './Subledgers';
import ExpenseDetail from './ExpenseEvidence';
import PostedJournal from './PostedJournal';
import InventoryAccounting from './InventoryAccounting';

function Journals() {
  const [version, setVersion] = useState(0);
  return <><details className="mb-3 d-print-none"><summary className="btn btn-primary">New draft journal</summary><div className="mt-3"><JournalForm onSaved={() => setVersion(v => v + 1)}/></div></details><Register key={version} endpoint="journals"/></>;
}
function PostingStatus() {
  const resource = useResource<Settings>('settings');
  if (resource.error) return <p role="alert" className="alert alert-warning">Posting configuration could not be verified: {resource.error}</p>;
  if (resource.loading) return <p role="status">Verifying accounting configuration…</p>;
  if (!resource.data?.enabled) return <p role="status" className="alert alert-warning">Shared-ledger posting is not enabled. These registers show pharmacy-local evidence; they do not prove consolidation into shared books. <Link href="/pharmacy/accounting/settings">Review configuration</Link>.</p>;
  return <p className={styles.muted}>Explicit shared-ledger cutover: {resource.data.effective_date?.slice(0,10) || 'not supplied'}. Local evidence and shared GL posting links remain separate; review unlinked journals in Settings.</p>;
}
function Content({ section, id }: { section: Section; id?: string }) {
  switch (section) {
    case '': return <Overview/>;
    case 'chart-of-accounts': return <ChartOfAccounts/>;
    case 'general-ledger': return id ? <PostedJournal id={id}/> : <Register endpoint="ledger" ledger/>;
    case 'journals': return id ? <JournalDetail id={id}/> : <Journals/>;
    case 'expenses': return id ? <ExpenseDetail id={id}/> : <Expenses/>;
    case 'receivables': return <Receivables/>;
    case 'payables': return <Payables/>;
    case 'revenue': return <Register endpoint="revenue"/>;
    case 'cogs': return <><p>Cost postings are sourced from inventory movements, not invented margin estimates. The register starts with the local cost-of-sales code; its shared GL destination is explicitly configured in settings.</p><Register endpoint="ledger" ledger initialAccount="cost_of_sales"/></>;
    case 'cash-bank': return <CashBank/>;
    case 'reconciliation': return <Reconciliation/>;
    case 'suppliers': return <Register endpoint="suppliers" supplier/>;
    case 'inventory': return <InventoryAccounting/>;
    case 'statements': return <Register endpoint="reports" report="profit_loss"/>;
    case 'trial-balance': return <Register endpoint="reports" report="trial_balance"/>;
    case 'tax': return <Tax/>;
    case 'periods': return <Periods/>;
    case 'audit': return <Register endpoint="audit"/>;
    case 'settings': return <AccountingSettings/>;
  }
}
export default function AccountingWorkspace({ section = '', id }: { section?: Section; id?: string }) {
  const { app, finance } = usePharmacyAccess();
  const role = app?.user?.role;
  const title = accountingDestinations.find(([key]) => key === section)?.[1] || 'Accounting';
  const permitted = finance && canAccessRolePage(role, `/pharmacy/accounting${section ? `/${section}` : ''}`);
  return <section aria-labelledby="pharmacy-accounting-title" className={`container-fluid ${styles.page} ${printStyles.workspace}`}><header className={`${styles.header} d-print-none`}><div><h1 id="pharmacy-accounting-title">Pharmacy Accounting · {title}</h1><p>Transaction registers, controlled posting and printable financial statements. <Link href="/pharmacy/analytics">Operational analytics</Link> is separate.</p></div></header>
    {!permitted ? <p role="status" className="alert alert-warning">A pharmacy manager or pharmacy accountant role is required. If your session is loading, please wait.</p> : <><nav aria-label="Pharmacy accounting" className={`${printStyles.navigation} d-print-none`}>{accountingDestinations.map(([key, label]) => <Link key={key} href={`/pharmacy/accounting${key ? `/${key}` : ''}`} aria-current={section === key ? 'page' : undefined} className={`${styles.tab} ${section === key ? styles.activeTab : ''}`}>{label}</Link>)}</nav><PostingStatus/><Content section={section} id={id}/></>}
  </section>;
}
