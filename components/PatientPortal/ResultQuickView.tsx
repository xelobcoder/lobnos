import type { LaboratoryReportData } from '../ResultView/LaboratoryReport';
import { quickResultRows } from '../../lib/patientPortal';
import styles from './PortalShell.module.css';

/** Readable on-screen summary of released results; the formal report below remains the record. */
export default function ResultQuickView({ reports }: { reports: LaboratoryReportData[] }) {
    const tests = reports.map(report => ({ report, rows: quickResultRows(report.records) })).filter(test => test.rows.length);
    if (!tests.length) return null;
    return (
        <section className={`card ${styles.panel}`} aria-labelledby="quick-results-title">
            <h2 id="quick-results-title" className={styles.panelTitle}>Results at a glance</h2>
            <p className="text-muted">A quick view for your screen. Your official report is below and in the PDF. Ask your clinician to explain any result.</p>
            <div className={styles.resultCards}>
                {tests.map(({ report, rows }, index) => (
                    <article key={report.ascensionid ?? index} className={styles.resultCard}>
                        <h3>{report.testInfo?.reportitle || report.testname || 'Laboratory test'}</h3>
                        {rows.map((row, rowIndex) => (
                            <div key={`${row.name}-${rowIndex}`} className={styles.resultRow}>
                                <span>{row.name}</span>
                                <span className={styles.resultValue}>
                                    {row.rich ? <span className="fw-normal text-muted">See full report</span> : row.value || '—'}
                                    {row.units && !row.rich ? <span className="fw-normal"> {row.units}</span> : null}
                                    {row.flag && <span className={styles.resultFlag}>{row.flag === 'H' ? 'High' : 'Low'}</span>}
                                </span>
                                <span className={styles.resultRange}>{row.reference ? `Range: ${row.reference}` : ''}</span>
                            </div>
                        ))}
                    </article>
                ))}
            </div>
        </section>
    );
}
