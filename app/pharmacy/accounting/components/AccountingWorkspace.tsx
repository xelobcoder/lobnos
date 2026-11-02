'use client';
import Link from 'next/link';
import { useState } from 'react';
import { accountingDestinations, accountingFriendlyTitles, type Section, type Settings } from '../../../../lib/pharmacyAccounting';
import { accountingArticle, articleHref } from '../../../../lib/pharmacyLearning';
import PharmacyTaskHelp from '../../components/PharmacyTaskHelp';
import { usePharmacyAccess } from '../../components/PharmacyWorkspace';
import { canAccessRolePage } from '../../../../lib/roleNavigationPolicy';
import { ChartOfAccounts, AccountingSettings } from './Configuration';
import { JournalDetail, JournalForm, Expenses } from './Documents';
import { CashBank, Periods, Reconciliation } from './Controls';
import { Overview, Register } from './Registers';
import { DateText, styles } from './common';
import printStyles from './AccountingWorkspace.module.css';
import { useResource } from './api';
import Tax from './Tax';
import { Receivables, Payables } from './Subledgers';
import ExpenseDetail from './ExpenseEvidence';
import PostedJournal from './PostedJournal';
import InventoryAccounting from './InventoryAccounting';
import reportLayout from '../../../../components/accounting/ReportShell.module.css';

function Journals() {
  const [version, setVersion] = useState(0);
  return <><details className="mb-3 d-print-none"><summary className="btn btn-primary">New draft journal</summary><div className="mt-3"><JournalForm onSaved={() => setVersion(v => v + 1)}/></div></details><Register key={version} endpoint="journals"/></>;
}
function PostingStatus() {
  const resource = useResource<Settings>('settings');
  if (resource.error) return <p role="alert" className="alert alert-warning">Posting configuration could not be verified: {resource.error}</p>;
  if (resource.loading) return <p role="status">Verifying accounting configuration…</p>;
  if (!resource.data?.enabled) return <p role="status" className="alert alert-warning">Facility accounting link is not enabled. These registers show pharmacy records, not proof they are included in facility reports. <Link href={articleHref('shared-records')}>What does this mean?</Link> <Link href="/pharmacy/accounting/settings">Review configuration</Link>.</p>;
  return <div className={`${printStyles.postingContext} d-print-none`}><span>Facility accounting link enabled</span><span>Linked from: <DateText value={resource.data.effective_date}/></span><Link href={articleHref('shared-records')}>What does this mean?</Link><Link href="/pharmacy/accounting/settings">Review posting & reconciliation</Link></div>;
}
const descriptions: Record<Section, string> = {
  '': 'Review balances, outstanding work and the next accounting task.',
  'chart-of-accounts': 'Manage the accounts assigned to pharmacy and their posting mappings.',
  'general-ledger': 'Inspect posted transactions and trace each balance to its source.',
  journals: 'Prepare, review and post controlled accounting entries.',
  receivables: 'Review customer invoices, collections and outstanding balances.',
  payables: 'Manage supplier bills, reviewed settlements and existing credits.',
  expenses: 'Prepare expenses, record approvals and track payments.',
  revenue: 'Review sales revenue and the transactions behind it.',
  cogs: 'Trace inventory cost recognised when medicines are sold, sourced from stock movements.',
  'cash-bank': 'Review collection accounts and their recorded movements.',
  reconciliation: 'Match actual bank statements to recorded pharmacy transactions.',
  suppliers: 'Review supplier activity and financial statements.',
  inventory: 'Compare weighted-average stock value with the inventory control account.',
  statements: 'Review and export the financial statements for your branch.',
  'trial-balance': 'Review net debit and credit account balances.',
  tax: 'Manage approved tax rules and review frozen transaction evidence.',
  periods: 'Review financial periods and posting restrictions.',
  audit: 'Trace accounting actions, approvals and corrections.',
  settings: 'Configure shared posting and review historical source reconciliation.',
};
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
    case 'cogs': return <Register endpoint="ledger" ledger initialAccount="cost_of_sales"/>;
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
  const formalTitle = accountingDestinations.find(([key]) => key === section)?.[1] || 'Accounting';
  const title = accountingFriendlyTitles[section] || formalTitle;
  const guideSlug = id ? section === 'expenses' ? 'expense-detail' : section === 'journals' ? 'journal-detail' : 'posted-journal' : accountingArticle[section];
  const permitted = finance && canAccessRolePage(role, `/pharmacy/accounting${section ? `/${section}` : ''}`);
  return <section aria-labelledby="pharmacy-accounting-title" className={`${styles.page} ${reportLayout.page} ${printStyles.workspace}`}>
    <nav className={`${reportLayout.breadcrumb} d-print-none`} aria-label="Breadcrumb"><Link href="/pharmacy">Pharmacy</Link><span aria-hidden="true"> / </span>{section ? <><Link href="/pharmacy/accounting">Accounting</Link><span aria-hidden="true"> / </span><span aria-current="page">{title}</span></> : <span aria-current="page">Accounting</span>}</nav>
    <header className={`${reportLayout.header} d-print-none`}><div><h1 id="pharmacy-accounting-title" className={reportLayout.title}>{section ? title : 'Accounting overview'}</h1>    <p className={reportLayout.subtitle}>{title !== formalTitle && <><strong>{formalTitle}</strong> - </>}{descriptions[section]}</p></div>{permitted && <div className={reportLayout.actions}>{!section && <><Link className="btn btn-sm btn-primary" href="/pharmacy/accounting/expenses">Record an expense</Link><Link className="btn btn-sm btn-outline-secondary" href="/pharmacy/accounting/payables">Pay a supplier</Link></>}    <Link className="btn btn-sm btn-outline-secondary" href={articleHref(guideSlug)}>Read this page's guide</Link></div>}</header>
    {!permitted ? <p role="status" className="alert alert-warning">A pharmacy manager or pharmacy accountant role is required. If your session is loading, please wait.</p> : <>
      <PharmacyTaskHelp slug={guideSlug} walkthrough={!id && ['expenses','receivables','statements'].includes(section)}/>
      {id && <p>Review the selected record, evidence and history. Only actions allowed by its status and your role are available.</p>}
      <PostingStatus/><div className={reportLayout.report}><Content section={section} id={id}/></div>
    </>}
  </section>;
}
