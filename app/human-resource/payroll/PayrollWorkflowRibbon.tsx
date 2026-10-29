import styles from './PayrollScreens.module.css';

const steps = ['draft', 'calculated', 'approved', 'locked', 'paid'];
const labels = ['Prepare', 'Calculate', 'Approve', 'Lock', 'Pay'];
const guidance: Record<string, string> = {
 draft: 'Prepare employee compensation and resolve calculation errors before approval.',
 calculated: 'Review employee earnings and deductions, then approve the payroll.',
 approved: 'Payroll has been approved. Lock the period before recording payment.',
 locked: 'The approved period is locked and ready for payment review.',
 paid: 'Payment is recorded. Review payslips and payroll history below.'
};
export default function PayrollWorkflowRibbon({ status }: { status: string }) {
 const current = steps.indexOf(status);
 return <section className={styles.workflowRibbon} aria-label="Payroll progress">
  <ol>{steps.map((step, index) => <li key={step} aria-current={index === current ? 'step' : undefined} data-complete={index < current}>
   <span>{index < current ? '✓' : index + 1}</span><strong>{labels[index]}</strong>
  </li>)}</ol><p>{guidance[status] || 'Review the current payroll status before continuing.'}</p>
 </section>;
}
