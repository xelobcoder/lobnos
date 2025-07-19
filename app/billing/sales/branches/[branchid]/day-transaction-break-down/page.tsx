import React from 'react';
import type { Metadata } from 'next';
import { currencyFormatter, customFetch } from '../../../../../../components/Auth/customFetch';
import styles from './FinancialSummary.module.css';
import {
    RiAlertLine,
    RiBankCardLine,
    RiBarChartGroupedLine,
    RiCalendarLine,
    RiCashLine,
    RiFileList3Line,
    RiGroupLine,
    RiHandCoinLine,
    RiLineChartLine,
    RiTestTubeLine,
    RiPieChartLine,
    RiDashboardLine,
} from '@remixicon/react';
import { CEOFinancialCharts } from '../../../../../../components/Billing/CeoSnapShot';
import { CeoClinicianSalesChart } from '../../../../../../components/Billing/ClinicianSalesChartCeo';

interface DailyCeoSnapshot {
    analytics_date: string;
    total_billing_amount: string;
    total_payable_amount: string;
    total_paid_amount: string;
    total_services_rendered: number;
    total_refunds_processed: string;
    total_refund_payments_made: string;
    total_outstanding_amount: string;
    total_discounts_given: string;
    total_tax_incurred: string;
    unique_patients_billed: number;
    refund_completion_rate_percentage: string;
}

interface TopPerformingBranch {
    branchid: number;
    revenue: string;
    branchname: string;
}

interface DailyNightAdjustmentImpact {
    report_date: string;
    total_billed_without_night_adjustment: string;
    amount_gained_from_night_adjustment: string;
    total_billed_with_night_adjustment: string;
    billed_without_night_adjustment_part_for_night_adjusted_services: string;
    night_adjustment_uplift: string;
    package_cases: string;
    package_total_value: string;
    total_cases: number;
    clinician_referrals: string;
    organization_referrals: string;
    self_cases: string;
}

interface DailyTestTransaction {
    serviceAddedOn: string;
    test_date: string;
    trackId: number;
    serviceCategory: string;
    test_panel_name: string | null;
    test_count: number;
    total_amount: string;
}

interface PaymentModeBreakdown {
    mode: string;
    total_transactions: number;
    total_amount: string;
}

interface EmployeeCashCollection {
    mode: string;
    username: string;
    total_transactions: number;
    total_amount: string;
    payment_date: string;
}

interface AuditTrailAction {
    action_type: string;
    count: number;
}

export const metadata: Metadata = {
    title: 'Daily Financial Summary',
    description: 'A detailed breakdown of daily financial transactions and performance.',
};

const Card = ({ title, children, icon }: { title: string, children: React.ReactNode, icon: React.ReactNode }) => (
    <section className={styles.card}>
        <h2 className={styles.cardTitle}>
            {icon}
            {title}
        </h2>
        <div className={styles.cardContent}>
            {children}
        </div>
    </section>
);

const Stat = ({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) => (
    <div className={styles.statItem}>
        <div className={styles.statIcon}>{icon}</div>
        <div className={styles.statInfo}>
            <span className={styles.statValue}>{value}</span>
            <span className={styles.statLabel}>{label}</span>
        </div>
    </div>
);

const formatDateRange = (fromDate: string | undefined, toDate: string | undefined, analyticsDate: string | undefined) => {
    if (!fromDate && !toDate && !analyticsDate) return "Date range not specified";
    
    try {
        if (fromDate && toDate) {
            const from = new Date(fromDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
            const to = new Date(toDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
            return fromDate === toDate ? from : `${from} - ${to}`;
        }
        
        if (analyticsDate) {
            return new Date(analyticsDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        }
        
        return "Invalid date range";
    } catch (e) {
        return "Invalid date range";
    }
};

async function getFinancialData(target: string, from: string, end: string) {
    try {
        const financialInformation = await customFetch(`financials/billing/summary/daily/breakdown?toDate=${end}&&fromDate=${from}&&targetDate=${target}`);
        if (!financialInformation) {
            throw new Error("API returned no data.");
        }
        console.log("Financial Information:", financialInformation);
        return financialInformation;
    } catch (error: any) {
        return { error: error.message || 'An unknown error occurred' };
    }
}

export default async function FinancialSummaryPage({ searchParams }: { searchParams: { date: string, from: string, end: string } }) {
    const { date, from, end } = searchParams;
    const data = await getFinancialData(date, from, end);

    if (data.error) {
        return (
            <main className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Could Not Load Data</h1>
                </div>
                <div className={styles.errorBox}>
                    <RiAlertLine size={40} />
                    <div>
                        <p><strong>There was a problem connecting to the API.</strong></p>
                        <p>Please check the console for more details or ensure your API server is running.</p>
                    </div>
                </div>
                <pre className={styles.pre}>{data.error}</pre>
            </main>
        );
    }

    const {
        dailyCeoSnapshot = [],
        dailyNightAdjustmentImpact = [],
        topPerformingBranches = [],
        dailyTestTransactionSnapshot = [],
        breakDownPaymentModes = [],
        employeesWhoCollectedCash = [],
        cliniciansalesdailyData = [],
        auditTrailActions = [],
        mismatchedPaymentHistory = []
    } = data;

    const snapshot = dailyCeoSnapshot[0] || {};
    const nightAdjustment = dailyNightAdjustmentImpact[0] || {};
    
    const branchesData = Array.isArray(topPerformingBranches[0]) ? topPerformingBranches[0] : [];
    const modesData = Array.isArray(breakDownPaymentModes[0]) ? breakDownPaymentModes[0] : [];
   
    const dateRangeText = formatDateRange(from, end, snapshot.analytics_date);

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>
                    <RiDashboardLine />
                    Financial Analytics Report
                </h1>
                <p className={styles.subtitle}>
                    <RiCalendarLine />
                    Report Period: <span className={styles.dateRange}>{dateRangeText}</span>
                </p>
            </header>

            <Card title="Executive Summary" icon={<RiPieChartLine />}>
                <div className={styles.statsGrid}>
                    <Stat label="Total Billed" value={currencyFormatter.format(Number(snapshot.total_billing_amount || 0))} icon={<RiLineChartLine />} />
                    <Stat label="Total Amount Payable" value={currencyFormatter.format(Number(snapshot.total_payable_amount || 0))} icon={<RiLineChartLine />} />
                    <Stat label="Total Paid" value={currencyFormatter.format(Number(snapshot.total_paid_amount || 0))} icon={<RiHandCoinLine />} />
                    <Stat label="Total Outstanding" value={currencyFormatter.format(Number(snapshot.total_outstanding_amount || 0))} icon={<RiBankCardLine />} />
                    <Stat label="Total Refunds Processed" value={currencyFormatter.format(Number(snapshot.total_refunds_processed || 0))} icon={<RiCashLine />} />
                    <Stat label="Total Refund Payments" value={currencyFormatter.format(Number(snapshot.total_refund_payments_made || 0))} icon={<RiCashLine />} />
                    <Stat label="Total Tax Incurred" value={currencyFormatter.format(Number(snapshot.total_tax_incurred || 0))} icon={<RiCashLine />} />
                    <Stat label="Services Rendered" value={snapshot.total_services_rendered || 0} icon={<RiFileList3Line />} />
                    <Stat label="Unique Patients" value={snapshot.unique_patients_billed || 0} icon={<RiGroupLine />} />
                    <Stat label="Total Discounts" value={currencyFormatter.format(Number(snapshot.total_discounts_given || 0))} icon={<RiCashLine />} />
                    <Stat label="Refund Completion Rate" value={`${Number(snapshot.refund_completion_rate_percentage || 0).toFixed(2)}%`} icon={<RiCashLine />} />
                </div>
            </Card>

            <div className={styles.sectionDivider}></div>

            <Card title="Night Adjustment Impact Analysis" icon={<RiLineChartLine />}>
                {Array.isArray(dailyNightAdjustmentImpact) && dailyNightAdjustmentImpact.length > 0 ? (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>Report Date</th>
                                    <th className={styles.th}>Total Payable Amount</th>
                                    <th className={styles.th}>Total Night Adjustment Value</th>
                                    <th className={styles.th}>Night Adjustment Cases</th>
                                    <th className={styles.th}>Normal Cases</th>
                                    <th className={styles.th}>Total Cases</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dailyNightAdjustmentImpact.map((adjustment: any, index: number) => (
                                    <tr key={index}>
                                        <td className={`${styles.td} ${styles.dateCell}`}>
                                            {new Date(adjustment.report_date).toLocaleDateString()}
                                        </td>
                                        <td className={`${styles.td} ${styles.currencyCell}`}>
                                            {currencyFormatter.format(Number(adjustment.total_payable_amount))}
                                        </td>
                                        <td className={`${styles.td} ${styles.currencyCell}`}>
                                            {currencyFormatter.format(Number(adjustment.total_night_adjustment_value))}
                                        </td>
                                        <td className={`${styles.td} ${styles.numberCell}`}>
                                            {adjustment.night_adjustment_cases_count}
                                        </td>
                                        <td className={`${styles.td} ${styles.numberCell}`}>
                                            {adjustment.normal_cases_count}
                                        </td>
                                        <td className={`${styles.td} ${styles.numberCell}`}>
                                            {adjustment.total_cases}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <RiLineChartLine size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                        <p>No night adjustment data available for the selected period.</p>
                    </div>
                )}
            </Card>

            {Array.isArray(auditTrailActions) && auditTrailActions.length > 0 && (
                <Card title="Audit Trail Actions" icon={<RiFileList3Line />}>
                    <div className={styles.statsGrid}>
                        {auditTrailActions.map((action: AuditTrailAction, index: number) => (
                            <Stat key={index} label={`${action.action_type} Actions`} value={action.count} icon={<RiFileList3Line />} />
                        ))}
                    </div>
                </Card>
            )}

            <div className={styles.sectionDivider}></div>

            <CEOFinancialCharts branchesData={branchesData} modesData={modesData} />

            <div className={styles.sectionDivider}></div>

            <Card title="Daily Test Transaction Details" icon={<RiTestTubeLine />}>
                {Array.isArray(dailyTestTransactionSnapshot) && dailyTestTransactionSnapshot.length > 0 ? (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>Test Name</th>
                                    <th className={styles.th}>Category</th>
                                    <th className={styles.th}>Count</th>
                                    <th className={styles.th}>Amount</th>
                                    <th className={styles.th}>Added On</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dailyTestTransactionSnapshot.map((test: DailyTestTransaction, index: number) => (
                                    <tr key={`${test.trackId}-${index}`}>
                                        <td className={styles.td}>{test.test_panel_name || 'N/A'}</td>
                                        <td className={styles.td}>{test.serviceCategory}</td>
                                        <td className={`${styles.td} ${styles.numberCell}`}>
                                            <span className={styles.metricHighlight}>{test.test_count}</span>
                                        </td>
                                        <td className={`${styles.td} ${styles.currencyCell}`}>
                                            {currencyFormatter.format(Number(test.total_amount))}
                                        </td>
                                        <td className={`${styles.td} ${styles.dateCell}`}>
                                            {new Date(test.serviceAddedOn).toLocaleTimeString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <RiTestTubeLine size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                        <p>No test transaction data available for the selected period.</p>
                    </div>
                )}
            </Card>

            <Card title="Employee Cash Collection Summary" icon={<RiGroupLine />}>
                {Array.isArray(employeesWhoCollectedCash) && employeesWhoCollectedCash.length > 0 ? (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>Payment Date</th>
                                    <th className={styles.th}>Employee</th>
                                    <th className={styles.th}>Transactions</th>
                                    <th className={styles.th}>Total Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employeesWhoCollectedCash.map((employee: EmployeeCashCollection, index: number) => (
                                    <tr key={index}>
                                        <td className={`${styles.td} ${styles.dateCell}`}>
                                            {new Date(employee.payment_date).toLocaleDateString()}
                                        </td>
                                        <td className={styles.td}>{employee.username}</td>
                                        <td className={`${styles.td} ${styles.numberCell}`}>
                                            <span className={styles.metricHighlight}>{employee.total_transactions}</span>
                                        </td>
                                        <td className={`${styles.td} ${styles.currencyCell}`}>
                                            {currencyFormatter.format(Number(employee.total_amount))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <RiGroupLine size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                        <p>No cash collection data available for the selected period.</p>
                    </div>
                )}
            </Card>

            <div className={styles.sectionDivider}></div>

            <CeoClinicianSalesChart data={cliniciansalesdailyData} />
        </main>
    );
}