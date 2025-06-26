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
} from '@remixicon/react';
import { CEOFinancialCharts } from '../../../../../../components/Billing/CeoSnapShot';
import { CeoClinicianSalesChart } from '../../../../../../components/Billing/ClinicianSalesChartCeo';

interface DailyCeoSnapshot {
    analytics_date: string;
    total_billing_amount: string;
    total_paid_amount: string;
    total_services_rendered: number;
    total_outstanding_amount: string;
    total_discounts_given: string;
    unique_patients_billed: number;
}

interface TopPerformingBranch {
    branchid: number;
    revenue: string;
    branchname: string;
}

interface DailyTestTransaction {
    trackId: number;
    serviceCategory: string;
    test_panel_name: string | null;
    total_amount: string;
}

interface PaymentModeBreakdown {
    mode: string;
    total_transactions: number;
    total_amount: string;
}

interface EmployeeCashCollection {
    username: string;
    total_amount: string;
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
        {children}
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

const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Not Available";
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch (e) {
        return "Invalid Date";
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
                <h1 className={styles.title}>Could Not Load Data</h1>
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
        topPerformingBranches = [],
        dailyTestTransactionSnapshot = [],
        breakDownPaymentModes = [],
        employeesWhoCollectedCash = [],
        cliniciansalesdailyData=[]
    } = data;

    const snapshot = dailyCeoSnapshot[0] || {};
   

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Daily Financial Summary</h1>
                <p className={styles.subtitle}>
                    <RiCalendarLine />
                    Report for: {formatDate(snapshot.analytics_date)}
                </p>
            </header>

            <Card title="CEO Snapshot" icon={<RiBarChartGroupedLine />}>
                <div className={styles.statsGrid}>
                    <Stat label="Total Billed" value={currencyFormatter.format(Number(snapshot.total_billing_amount || 0))} icon={<RiLineChartLine />} />
                    <Stat label="Total Amount Payable" value={currencyFormatter.format(Number(snapshot.total_payable_amount || 0))} icon={<RiLineChartLine />} />
                    <Stat label="Total Paid" value={currencyFormatter.format(Number(snapshot.total_paid_amount || 0))} icon={<RiHandCoinLine />} />
                    <Stat label="Total Outstanding" value={currencyFormatter.format(Number(snapshot.total_outstanding_amount || 0))} icon={<RiBankCardLine />} />
                    <Stat label="Services Rendered" value={snapshot.total_services_rendered || 0} icon={<RiFileList3Line />} />
                    <Stat label="Unique Patients" value={snapshot.unique_patients_billed || 0} icon={<RiGroupLine />} />
                    <Stat label="Total Discounts" value={currencyFormatter.format(Number(snapshot.total_discounts_given || 0))} icon={<RiCashLine />} />
                </div>
            </Card>

            <CEOFinancialCharts branchesData={topPerformingBranches} modesData={breakDownPaymentModes} />

            <Card title="Daily Test Transactions" icon={<RiTestTubeLine />}>
                {dailyTestTransactionSnapshot.length > 0 ? (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Test Name</th>
                                <th className={styles.th}>Category</th>
                                <th className={styles.th}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dailyTestTransactionSnapshot.map((test: DailyTestTransaction) => (
                                <tr key={test.trackId}>
                                    <td className={styles.td}>{test.test_panel_name || 'N/A'}</td>
                                    <td className={styles.td}>{test.serviceCategory}</td>
                                    <td className={styles.td}>{currencyFormatter.format(Number(test.total_amount))}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : <p>No test transaction data available.</p>}
            </Card>

            <Card title="Cash Collections by Employee" icon={<RiGroupLine />}>
                {employeesWhoCollectedCash.length > 0 ? (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Employee</th>
                                <th className={styles.th}>Total Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employeesWhoCollectedCash.map((employee: EmployeeCashCollection, index: number) => (
                                <tr key={index}>
                                    <td className={styles.td}>{employee.username}</td>
                                    <td className={styles.td}>{currencyFormatter.format(Number(employee.total_amount))}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : <p>No cash collection data available.</p>}
            </Card>

            <CeoClinicianSalesChart data={cliniciansalesdailyData} />
        </main>
    );
}