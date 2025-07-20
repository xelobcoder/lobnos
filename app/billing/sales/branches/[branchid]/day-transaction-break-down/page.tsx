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
    total_outstanding_amount: string;
    total_discounts_given: string;
    total_tax_incurred: string;
}

interface ServiceStatusCounts {
    active_services: string;
    cancelled_services: string;
    refunded_services: string;
    voided_services: string;
    written_off_services: string;
    total_services: number;
}

interface DailyUniqueClientsSummary {
    unique_registered_clients: number;
    start_date: string;
    end_date: string;
}

interface OrganizationCommission {
    service_date: string;
    organization_id: number;
    organization_name: string;
    organization_phone: number;
    organization_email: string;
    total_services: number;
    total_value: string;
    commission_percent: number;
    commission_earned: string;
}

interface TopPerformingBranch {
    branchid: number;
    revenue: string;
    branchname: string;
}

interface DailyNightAdjustmentImpact {
    report_date: string;
    total_payable_amount: string;
    total_night_adjustment_value: string;
    night_adjustment_cases_count: number;
    normal_cases_count: number;
    total_cases: number;
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
        serviceStatusCounts = [],
        OrganizationCommissions = [],
        dailyUniqueClientsSummary = [],
        dailyNightAdjustmentImpact = [],
        topPerformingBranches = [],
        dailyTestTransactionSnapshot = [],
        breakDownPaymentModes = [],
        employeesWhoCollectedCash = [],
        cliniciansalesdailyData = [],
        auditTrailActions = [],
        mismatchedPaymentHistory = []
    } = data;

    // Calculate aggregated totals from all daily snapshots
    const aggregatedSnapshot = dailyCeoSnapshot.reduce((acc, snapshot) => ({
        total_billing_amount: (Number(acc.total_billing_amount || 0) + Number(snapshot.total_billing_amount || 0)).toString(),
        total_payable_amount: (Number(acc.total_payable_amount || 0) + Number(snapshot.total_payable_amount || 0)).toString(),
        total_paid_amount: (Number(acc.total_paid_amount || 0) + Number(snapshot.total_paid_amount || 0)).toString(),
        total_outstanding_amount: (Number(acc.total_outstanding_amount || 0) + Number(snapshot.total_outstanding_amount || 0)).toString(),
        total_discounts_given: (Number(acc.total_discounts_given || 0) + Number(snapshot.total_discounts_given || 0)).toString(),
        total_tax_incurred: (Number(acc.total_tax_incurred || 0) + Number(snapshot.total_tax_incurred || 0)).toString(),
        analytics_date: snapshot.analytics_date 
    }), {
        total_billing_amount: '0',
        total_payable_amount: '0',
        total_paid_amount: '0',
        total_outstanding_amount: '0',
        total_discounts_given: '0',
        total_tax_incurred: '0',
        analytics_date: ''
    });

    const serviceStatus = serviceStatusCounts[0] || {};
    const uniqueClients = dailyUniqueClientsSummary[0] || {};
    
    const branchesData = Array.isArray(topPerformingBranches) ? topPerformingBranches : [];
    const modesData = Array.isArray(breakDownPaymentModes) ? breakDownPaymentModes : [];
   
    const dateRangeText = formatDateRange(from, end, aggregatedSnapshot.analytics_date);

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
                    <Stat label="Total Billed" value={currencyFormatter.format(Number(aggregatedSnapshot.total_billing_amount || 0))} icon={<RiLineChartLine />} />
                    <Stat label="Total Amount Payable" value={currencyFormatter.format(Number(aggregatedSnapshot.total_payable_amount || 0))} icon={<RiLineChartLine />} />
                    <Stat label="Total Paid" value={currencyFormatter.format(Number(aggregatedSnapshot.total_paid_amount || 0))} icon={<RiHandCoinLine />} />
                    <Stat label="Total Outstanding" value={currencyFormatter.format(Number(aggregatedSnapshot.total_outstanding_amount || 0))} icon={<RiBankCardLine />} />
                    <Stat label="Total Tax Incurred" value={currencyFormatter.format(Number(aggregatedSnapshot.total_tax_incurred || 0))} icon={<RiCashLine />} />
                    <Stat label="Total Discounts" value={currencyFormatter.format(Number(aggregatedSnapshot.total_discounts_given || 0))} icon={<RiCashLine />} />
                    <Stat label="Active Services" value={serviceStatus.active_services || 0} icon={<RiFileList3Line />} />
                    <Stat label="Total Services" value={serviceStatus.total_services || 0} icon={<RiFileList3Line />} />
                    <Stat label="Cancelled Services" value={serviceStatus.cancelled_services || 0} icon={<RiFileList3Line />} />
                    <Stat label="Unique Clients" value={uniqueClients.unique_registered_clients || 0} icon={<RiGroupLine />} />
                    <Stat label="Refunded Services" value={serviceStatus.refunded_services || 0} icon={<RiCashLine />} />
                </div>
            </Card>

            <div className={styles.sectionDivider}></div>

            <Card title="Daily Financial Breakdown" icon={<RiCalendarLine />}>
                {Array.isArray(dailyCeoSnapshot) && dailyCeoSnapshot.length > 0 ? (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>Date</th>
                                    <th className={styles.th}>Total Billed</th>
                                    <th className={styles.th}>Total Payable</th>
                                    <th className={styles.th}>Total Paid</th>
                                    <th className={styles.th}>Outstanding</th>
                                    <th className={styles.th}>Tax Incurred</th>
                                    <th className={styles.th}>Discounts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dailyCeoSnapshot.map((daily: DailyCeoSnapshot, index: number) => (
                                    <tr key={index}>
                                        <td className={`${styles.td} ${styles.dateCell}`}>
                                            {new Date(daily.analytics_date).toLocaleDateString()}
                                        </td>
                                        <td className={`${styles.td} ${styles.currencyCell}`}>
                                            {currencyFormatter.format(Number(daily.total_billing_amount))}
                                        </td>
                                        <td className={`${styles.td} ${styles.currencyCell}`}>
                                            {currencyFormatter.format(Number(daily.total_payable_amount))}
                                        </td>
                                        <td className={`${styles.td} ${styles.currencyCell}`}>
                                            {currencyFormatter.format(Number(daily.total_paid_amount))}
                                        </td>
                                        <td className={`${styles.td} ${styles.currencyCell}`}>
                                            {currencyFormatter.format(Number(daily.total_outstanding_amount))}
                                        </td>
                                        <td className={`${styles.td} ${styles.currencyCell}`}>
                                            {currencyFormatter.format(Number(daily.total_tax_incurred))}
                                        </td>
                                        <td className={`${styles.td} ${styles.currencyCell}`}>
                                            {currencyFormatter.format(Number(daily.total_discounts_given))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <RiCalendarLine size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                        <p>No daily financial data available for the selected period.</p>
                    </div>
                )}
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

            {Array.isArray(OrganizationCommissions) && OrganizationCommissions.length > 0 && (
                <Card title="Organization Commissions" icon={<RiGroupLine />}>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>Service Date</th>
                                    <th className={styles.th}>Organization</th>
                                    <th className={styles.th}>Contact</th>
                                    <th className={styles.th}>Services</th>
                                    <th className={styles.th}>Total Value</th>
                                    <th className={styles.th}>Commission %</th>
                                    <th className={styles.th}>Commission Earned</th>
                                </tr>
                            </thead>
                            <tbody>
                                {OrganizationCommissions.map((commission: OrganizationCommission, index: number) => (
                                    <tr key={index}>
                                        <td className={`${styles.td} ${styles.dateCell}`}>
                                            {new Date(commission.service_date).toLocaleDateString()}
                                        </td>
                                        <td className={styles.td}>
                                            <div>
                                                <strong>{commission.organization_name}</strong>
                                                <br />
                                                <small style={{ color: '#666' }}>{commission.organization_email}</small>
                                            </div>
                                        </td>
                                        <td className={styles.td}>
                                            {commission.organization_phone}
                                        </td>
                                        <td className={`${styles.td} ${styles.numberCell}`}>
                                            <span className={styles.metricHighlight}>{commission.total_services}</span>
                                        </td>
                                        <td className={`${styles.td} ${styles.currencyCell}`}>
                                            {currencyFormatter.format(Number(commission.total_value))}
                                        </td>
                                        <td className={`${styles.td} ${styles.numberCell}`}>
                                            {commission.commission_percent}%
                                        </td>
                                        <td className={`${styles.td} ${styles.currencyCell}`}>
                                            {currencyFormatter.format(Number(commission.commission_earned))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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

            {Array.isArray(mismatchedPaymentHistory) && mismatchedPaymentHistory.length > 0 && (
                <Card title="Mismatched Payment History" icon={<RiAlertLine />}>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>Billing ID</th>
                                    <th className={styles.th}>Paid in Billing</th>
                                    <th className={styles.th}>Total in Billing History</th>
                                    <th className={styles.th}>Difference</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mismatchedPaymentHistory.map((mismatch: any, index: number) => (
                                    <tr key={index}>
                                        <td className={`${styles.td} ${styles.numberCell}`}>
                                            {mismatch.billingid}
                                        </td>
                                        <td className={`${styles.td} ${styles.currencyCell}`}>
                                            {currencyFormatter.format(Number(mismatch.paid_in_billing))}
                                        </td>
                                        <td className={`${styles.td} ${styles.currencyCell}`}>
                                            {currencyFormatter.format(Number(mismatch.total_in_billinghx))}
                                        </td>
                                        <td className={`${styles.td} ${styles.currencyCell}`} style={{ color: Number(mismatch.difference) < 0 ? 'red' : 'green' }}>
                                            {currencyFormatter.format(Number(mismatch.difference))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </main>
    );
}