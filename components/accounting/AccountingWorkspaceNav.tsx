"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./AccountingWorkspaceNav.module.css";
const destinations = [
 ["Overview", "/accounting"], ["Chart of accounts", "/accounting/chart-of-accounts"], ["General ledger", "/accounting/general-ledger"], ["Journals", "/accounting/manual-journals"],
 ["Financial reports", "/accounting/reports"], ["NHIS", "/accounting/nhis"], ["Planning", "/accounting/budgets"], ["Bills", "/accounting/bills"], ["Bank reconciliation", "/accounting/bank-reconciliation"], ["Close & review", "/accounting/daily-close"],
];
export default function AccountingWorkspaceNav() {
 const path = usePathname();
 const reports = ["reports", "income-statement", "balance-sheet", "cash-flow", "trial-balance", "receivables", "payables", "statements"];
 return <nav className={styles.nav} aria-label="Accounting workspace">{destinations.map(([label,href])=>{
  const active = href === "/accounting" ? path === href : href.endsWith("reports") ? reports.some(report=>path?.startsWith(`/accounting/${report}`)) : href.endsWith("budgets") ? ["budgets","recurring-expenses","cash-flow-forecast"].some(section=>path?.startsWith(`/accounting/${section}`)) : href.endsWith("daily-close") ? ["daily-close","periods","year-end-close","control-history","posting-health"].some(section=>path?.startsWith(`/accounting/${section}`)) : path?.startsWith(href);
  return <Link key={href} href={href} aria-current={active?"page":undefined}>{label}</Link>;
 })}</nav>;
}
