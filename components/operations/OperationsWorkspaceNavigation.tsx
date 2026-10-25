import styles from './OperationsWorkspace.module.css';
const links = [
    ['critical', '/operations/laboratory/criticalvaluesAlert', 'Critical results'],
    ['delivery', '/operations/laboratory/undelivered', 'Result delivery'],
    ['archives', '/operations/laboratory/patientarchives', 'Patient archives'],
    ['outsourcing', '/operations/laboratory/outsourced-cases', 'Outsourcing'],
    ['workbench', '/operations/laboratory/workbench', 'Assigned work'],
];
export default function OperationsWorkspaceNavigation({ current }: { current: string }) {
    return <nav className={styles.navigation} aria-label="Laboratory operations">{links.map(([key, href, label]) => <a key={key} href={href} aria-current={key === current ? 'page' : undefined}>{label}</a>)}</nav>;
}
