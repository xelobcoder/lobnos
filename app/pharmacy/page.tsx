'use client';
import Link from 'next/link';
import { styles, money, usePharmacyAccess, usePharmacyResource, Message, Empty, FinancialDayPanel, PharmacyTaskLinks } from './components/PharmacyWorkspace';
import purchasing from './components/PharmacyPurchasing.module.css';
import accountingStyles from './accounting/components/AccountingWorkspace.module.css';
export default function PharmacyOverviewPage() {
     const access=usePharmacyAccess(),dashboard=usePharmacyResource('pharmacy/dashboard'),setup=usePharmacyResource('pharmacy/checkout-setup');
     const refresh=async()=>{await Promise.all([dashboard.refresh(),setup.refresh()]);};
     const setupReady=!!setup.data&&!setup.loading&&!setup.error;
     return <main className={`${styles.page} ${accountingStyles.page} ${purchasing.theme} ${styles.overview}`}>
          <header className={styles.header}><div><h1>Pharmacy overview</h1><p>Today's pharmacy sales, stock alerts and financial-day status.</p></div><div className={styles.actions}><button className="btn btn-outline-secondary" onClick={refresh} disabled={dashboard.loading||setup.loading}>Refresh</button>{access.selling&&<Link className="btn btn-primary" href="/pharmacy/sell">Start sale</Link>}{access.stock&&<Link className="btn btn-outline-primary" href="/pharmacy/inventory">Manage stock</Link>}</div></header>
          <Message error={dashboard.error||setup.error}/>
          <PharmacyTaskLinks/>
          <FinancialDayPanel setup={setupReady?setup.data:null} canManage={access.finance&&setupReady} onChange={refresh}/>
          {access.manager&&setupReady&&!setup.data.routes.length&&<div className="alert alert-info">Configure payment routing before cashiers start trading. <Link href="/pharmacy/settings">Set up pharmacy payments</Link></div>}
          {dashboard.loading&&!dashboard.data?<Empty>Loading pharmacy activity...</Empty>:dashboard.data&&<><dl className={accountingStyles.summaryStrip} aria-label="Pharmacy activity summary"><div><dt>Today's net collections</dt><dd>{money(dashboard.data.todaySales)}</dd></div><div><dt>Recorded collections</dt><dd>{dashboard.data.completedSales}</dd></div><div><dt>Low-stock medicines</dt><dd>{dashboard.data.lowStockItems}</dd><dd className={accountingStyles.summaryDetail}><Link href="/pharmacy/stock?filter=low">View low stock</Link></dd></div></dl><section className={styles.card}><div className={styles.toolbar}><h2>Recent pharmacy sales</h2><Link href="/pharmacy/sales-history">View sales history</Link></div>{dashboard.data.recentSales.length?<div className="table-responsive"><table className={styles.table}><thead><tr><th>Receipt</th><th>Customer</th><th>Method</th><th className={styles.number}>Total</th></tr></thead><tbody>{dashboard.data.recentSales.map((s:any)=><tr key={s.receiptNumber}><td>{s.receiptNumber}</td><td>{s.customerName}</td><td>{s.paymentMethod.replace('_',' ')}</td><td className={styles.number}>{money(s.total)}</td></tr>)}</tbody></table></div>:<Empty>No completed sales yet. Open the financial day and a cashier shift before starting.</Empty>}</section></>}
     </main>;
}
