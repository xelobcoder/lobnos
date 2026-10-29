import Offcanvas from 'react-bootstrap/Offcanvas';
import styles from './PayrollScreens.module.css';
const money = new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 2 });
const amount = (value: unknown) => value == null || !Number.isFinite(Number(value)) ? '—' : money.format(Number(value));
export default function PayrollHistoryDetails({ show, transaction, onHide }: { show: boolean; transaction: any; onHide: () => void }) {
 if (!transaction) return null;
 const groups = [
  { title: 'Earnings', rows: [['Basic salary','basic_salary'],['Hourly earnings','hourly_earnings'],['Overtime','overtime_earnings'],['Commission','commission_earnings'],['Allowances','total_allowances'],['Bonuses','total_bonuses'],['Gross salary','gross_salary']] },
  { title: 'Employee deductions', rows: [['Income tax','income_tax'],['Employee pension','employee_ssnit'],['Employee Tier 3','employee_tier3'],['NHIS','nhis'],['Other deductions','total_other_deductions'],['Total deductions','total_deductions']] }
 ];
 const date = transaction.payment_date ? new Date(transaction.payment_date) : null;
 return <Offcanvas show={show} onHide={onHide} placement="end" className={styles.historyCanvas} aria-labelledby="payroll-breakdown-title">
  <Offcanvas.Header closeButton><Offcanvas.Title id="payroll-breakdown-title">Payroll breakdown</Offcanvas.Title></Offcanvas.Header>
  <Offcanvas.Body><p className="text-muted mb-4">{transaction.employeename || `Employee #${transaction.employeeid}`} · Payroll period #{transaction.payroll_period_id}</p>
   <div className={styles.takeHome}><span>Net salary</span><strong>{amount(transaction.net_salary)}</strong><small>Stored take-home pay for this transaction</small></div>
   <div className={styles.breakdownGrid}>{groups.map(group=><section className={styles.breakdownSection} key={group.title}><h2>{group.title}</h2><dl>{group.rows.map(([label,key])=><div key={key}><dt>{label}</dt><dd>{amount(transaction[key])}</dd></div>)}</dl></section>)}</div>
   <section className={styles.breakdownSection}><h2>Work and payment details</h2><dl className={styles.reportFacts}>
    {[['Days worked',transaction.days_worked],['Hours worked',transaction.hours_worked],['Overtime hours',transaction.overtime_hours],['Days absent',transaction.days_absent],['Days on leave',transaction.days_leave],['Payment date',date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('en-GB') : 'Not paid'],['Payment method',transaction.payment_method?.replaceAll('_',' ') || 'Not recorded'],['Status',transaction.status],['Employer pension',amount(transaction.employer_ssnit)],['Employer Tier 3',amount(transaction.employer_tier3)],['Total employer cost',amount(transaction.employer_cost)]].map(([label,value])=><div key={String(label)}><dt>{label}</dt><dd>{value ?? '—'}</dd></div>)}
   </dl></section><p className="small text-muted mt-3">Amounts reflect the saved payroll transaction. Employer contributions are separate from employee deductions.</p>
  </Offcanvas.Body>
 </Offcanvas>;
}
