'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../app/billing/sales/branches/[branchid]/day-transaction-break-down/FinancialSummary.module.css';
import {
    RiAlertLine,
    RiBankCardLine,
    RiBarChartGroupedLine,
    RiBuildingLine,
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

import { currencyFormatter,customFetch } from '../Auth/customFetch';
import { useApplication } from '../Auth/useApplicationContext';
import { CEOFinancialCharts, CEODailySnapshot } from './CeoSnapShot';
import { CeoClinicianSalesChart } from './ClinicianSalesChartCeo';


interface DailyCeoSnapshot {
    gross_revenue: string;
    cash_collected: string;
    earned_revenue: string;
    discount: string;
    outstanding: string;
    total_refunded: string;
    expenses_paid: string;
    total_tests_conducted: number;
    net_operating_cash: string;
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
    earned_revenue: string;
    cash_collected: string;
    discount: string;
    outstanding: string;
    total_tests: number;
    total_refunded: string;
    branchname: string;
}

interface DailyNightAdjustmentImpact {
    report_date: string;
    earned_revenue: string;
    total_night_adjustment_payable: string;
    total_normal_payable: string;
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
    earned_revenue: string;
    cash_collected: string;
    discount: string;
    outstanding: string;
    department: string | null;
    gross_revenue: string;
    total_refunded: string;
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

interface TotalExpensesPeriodComparison {
    period: string;
    total_expenses: string | null;
    expense_count: number;
}

interface AllExpenseCategory {
    category: string;
    expense_count: number;
    total_amount: string;
    percentage_of_total: string;
}

interface ExpenseApprovalStatusSummary {
    status: string;
    expense_count: number;
    total_amount: string;
}

interface TotalReimbursedPaid {
    total_reimbursed: string;
    expenses_paid_count: number;
}

interface BillableExpenses {
    billable_expenses_count: number;
    total_billable_amount: string;
}

interface MonthlyExpenseTrend {
    month: string;
    total_expenses: string;
    expense_count: number;
}

interface TopHighestExpense {
    expense_id: number;
    description: string;
    amount: string;
    date: string;
    category: string;
}

interface UnapprovedExpense {
    expense_id: number;
    description: string;
    amount: string;
    submitted_date: string;
    submitted_by: string;
}

interface ExpensesByBranch {
    branchid: number;
    expense_count: number;
    total_amount: string;
    percentage_of_total: string;
}

interface CeoExpenseSummarySnapshot {
    reporting_period: string;
    total_expenses_submitted: number;
    total_expenses_amount: string;
    approved_expenses_amount: string;
    pending_expenses_count: number;
    total_reimbursed_amount: string;
    total_billable_to_clients_amount: string;
}

interface AuditTrailAction {
    action_type: string;
    count: number;
}

interface ExpensePaymentsSummary {
    status: string;
    method: string;
    payments_made: number;
    unique_expenses_reimbursed: number;
    total_reimbursed_amount: string;
}

interface ExpensePaymentsFullList {
    payment_id: number;
    expense_id: number;
    expense_name: string;
    merchant: string;
    claimed_amount: number;
    paid_amount: string;
    payment_date: string;
    method: string;
    status: string;
    paid_by_employee_id: number;
}

interface AllIndividualExpense {
    expense_id: number;
    name: string;
    merchant: string;
    amount: number;
    expense_date: string;
    category: string;
    approval_status: string;
    employeeid: number;
    branchid: number;
    description: string;
}




const Card = ({ title, children, icon }: { title: string, children: React.ReactNode, icon: React.ReactNode }) => (
    <div className="border rounded mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
        <div className="p-3 border-bottom" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: 'var(--bs-border-color)' }}>
            <h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
                {icon}
                {title}
            </h2>
        </div>
        <div className="p-3">
            {children}
        </div>
    </div>
);

const Stat = ({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) => (
    <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
        <div className="d-flex align-items-center mb-2">
            <div className="me-2 text-primary">
                {React.cloneElement(icon as React.ReactElement<any>, { size: 20 } as any)}
            </div>
            <span className="fw-medium text-muted small">{label}</span>
        </div>
        <div className="fs-4 fw-bold text-primary">{value}</div>
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

async function getFinancialData(target: string, from: string, end: string, employeeid: string | undefined) {
    try {
        const financialInformation = await customFetch(`financials/billing/summary/daily/breakdown?toDate=${end}&&fromDate=${from}&&targetDate=${target}&&employeeid=${employeeid}`);
        if (!financialInformation) {
            throw new Error("API returned no data.");
        }
        return financialInformation;
    } catch (error: any) {
        return { error: error.message || 'An unknown error occurred' };
    }
}

export default function FinancialSummaryPage({ searchParams }: { searchParams: { date: string, from: string, end: string } }) {
    const { date, from, end } = searchParams;
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedFrom, setSelectedFrom] = useState(from || '');
    const [selectedEnd, setSelectedEnd] = useState(end || '');
    const [activeTab, setActiveTab] = useState('summary');
    const router = useRouter();

    const handleApplyDateRange = () => {
        const params = new URLSearchParams();
        if (date) params.set('date', date);
        if (selectedFrom) params.set('from', selectedFrom);
        if (selectedEnd) params.set('end', selectedEnd);
        router.push(`?${params.toString()}`);
    };
    const user = useApplication()?.user;
    const employeeid = user?.employeeid;

    useEffect(() => {
        setSelectedFrom(from || '');
        setSelectedEnd(end || '');
    }, [from, end]);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const result = await getFinancialData(date, from, end, employeeid);
                if (result.error) {
                    setError(result.error);
                } else {
                    setData(result);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [date, from, end]);

    if (loading) {
        return (
            <main className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Loading...</h1>
                </div>
            </main>
        );
    }

    if (error) {
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
                <pre className={styles.pre}>{error}</pre>
            </main>
        );
    }

    if (!data) {
        return (
            <main className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>No Data Available</h1>
                </div>
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
        mismatchedPaymentHistory = [],
        totalExpensesPeriodComparison = [],
        allExpenseCategories = [],
        expenseApprovalStatusSummary = [],
        totalReimbursedPaid = [],
        billableExpenses = [],
        monthlyExpenseTrend = [],
        topHighestExpenses = [],
        allIndividualExpenses = [],
        unapprovedExpensesPeriod = [],
        expensesByBranch = [],
        ceoExpenseSummarySnapshot = [],
        expensePaymentsSummary = [],
        expensePaymentsFullList = []
    } = data;

    // Calculate aggregated totals from all daily snapshots
    const aggregatedSnapshot = dailyCeoSnapshot.reduce((acc, snapshot) => ({
        gross_revenue: (Number(acc.gross_revenue || 0) + Number(snapshot.gross_revenue || 0)).toString(),
        cash_collected: (Number(acc.cash_collected || 0) + Number(snapshot.cash_collected || 0)).toString(),
        earned_revenue: (Number(acc.earned_revenue || 0) + Number(snapshot.earned_revenue || 0)).toString(),
        discount: (Number(acc.discount || 0) + Number(snapshot.discount || 0)).toString(),
        outstanding: (Number(acc.outstanding || 0) + Number(snapshot.outstanding || 0)).toString(),
        total_refunded: (Number(acc.total_refunded || 0) + Number(snapshot.total_refunded || 0)).toString(),
        expenses_paid: (Number(acc.expenses_paid || 0) + Number(snapshot.expenses_paid || 0)).toString(),
        total_tests_conducted: Number(acc.total_tests_conducted || 0) + Number(snapshot.total_tests_conducted || 0),
        net_operating_cash: (Number(acc.net_operating_cash || 0) + Number(snapshot.net_operating_cash || 0)).toString(),
    }), {
        gross_revenue: '0',
        cash_collected: '0',
        earned_revenue: '0',
        discount: '0',
        outstanding: '0',
        total_refunded: '0',
        expenses_paid: '0',
        total_tests_conducted: 0,
        net_operating_cash: '0',
    });

    const serviceStatus = serviceStatusCounts[0] || {};
    const uniqueClients = dailyUniqueClientsSummary[0] || {};

    const branchesData = Array.isArray(topPerformingBranches) ? topPerformingBranches : [];
    const modesData = Array.isArray(breakDownPaymentModes) ? breakDownPaymentModes : [];

    const dateRangeText = formatDateRange(from, end, undefined);

    return (
        <main className={styles.container}>
            <div className="border rounded p-4 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-3">
                    <h1 className="fs-4 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                        <RiDashboardLine className="me-2" size={24} style={{ color: 'var(--pls-accent)' }} />
                        Financial Analytics Report
                    </h1>
                    <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                        <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                            <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: 'var(--bs-border-color)' }}>
                                <RiCalendarLine size={16} className="text-muted" />
                            </span>
                            <input
                                type="date"
                                className="form-control shadow-none border-start-0"
                                value={selectedFrom}
                                onChange={(e) => setSelectedFrom(e.target.value)}
                            />
                        </div>
                        <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                            <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: 'var(--bs-border-color)' }}>
                                <RiCalendarLine size={16} className="text-muted" />
                            </span>
                            <input
                                type="date"
                                className="form-control shadow-none border-start-0"
                                value={selectedEnd}
                                onChange={(e) => setSelectedEnd(e.target.value)}
                                min={selectedFrom}
                            />
                        </div>
                        <button
                            onClick={handleApplyDateRange}
                            className="btn btn-sm btn-primary d-flex align-items-center"
                        >
                            Apply
                        </button>
                    </div>
                </div>
                <p className="text-muted mb-0 d-flex align-items-center">
                    <RiCalendarLine className="me-2" size={16} />
                    Report Period: <span className="fw-medium ms-1" style={{ color: 'var(--pls-accent)' }}>{dateRangeText}</span>
                </p>
            </div>

            <ul className="nav nav-tabs mb-4" id="financialTabs" role="tablist">
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === 'summary' ? 'active' : ''}`}
                        id="summary-tab"
                        type="button"
                        role="tab"
                        onClick={() => setActiveTab('summary')}
                    >
                        Summary
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === 'financial' ? 'active' : ''}`}
                        id="financial-tab"
                        type="button"
                        role="tab"
                        onClick={() => setActiveTab('financial')}
                    >
                        Financial Details
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === 'transactions' ? 'active' : ''}`}
                        id="transactions-tab"
                        type="button"
                        role="tab"
                        onClick={() => setActiveTab('transactions')}
                    >
                        Transactions
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === 'expenses' ? 'active' : ''}`}
                        id="expenses-tab"
                        type="button"
                        role="tab"
                        onClick={() => setActiveTab('expenses')}
                    >
                        Expenses
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === 'other' ? 'active' : ''}`}
                        id="other-tab"
                        type="button"
                        role="tab"
                        onClick={() => setActiveTab('other')}
                    >
                        Other
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === 'issues' ? 'active' : ''}`}
                        id="issues-tab"
                        type="button"
                        role="tab"
                        onClick={() => setActiveTab('issues')}
                    >
                        Issues
                    </button>
                </li>
            </ul>

            <div className="tab-content">
                {activeTab === 'summary' && (
                    <div className="tab-pane fade show active" id="summary" role="tabpanel">
                        <Card title="Executive Summary" icon={<RiPieChartLine />}>
                            <div className="row g-3">
                                <div className="col-12 col-sm-6 col-md-4 col-lg-2 col-xl-2">
                                    <Stat label="Gross Revenue" value={currencyFormatter.format(Number(aggregatedSnapshot.gross_revenue || 0))} icon={<RiLineChartLine />} />
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-2 col-xl-2">
                                    <Stat label="Cash Collected" value={currencyFormatter.format(Number(aggregatedSnapshot.cash_collected || 0))} icon={<RiHandCoinLine />} />
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-2 col-xl-2">
                                    <Stat label="Earned Revenue" value={currencyFormatter.format(Number(aggregatedSnapshot.earned_revenue || 0))} icon={<RiLineChartLine />} />
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-2 col-xl-2">
                                    <Stat label="Outstanding" value={currencyFormatter.format(Number(aggregatedSnapshot.outstanding || 0))} icon={<RiBankCardLine />} />
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-2 col-xl-2">
                                    <Stat label="Total Discounts" value={currencyFormatter.format(Number(aggregatedSnapshot.discount || 0))} icon={<RiCashLine />} />
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-2 col-xl-2">
                                    <Stat label="Total Refunds" value={currencyFormatter.format(Number(aggregatedSnapshot.total_refunded || 0))} icon={<RiCashLine />} />
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-2 col-xl-2">
                                    <Stat label="Expenses Paid" value={currencyFormatter.format(Number(aggregatedSnapshot.expenses_paid || 0))} icon={<RiHandCoinLine />} />
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-2 col-xl-2">
                                    <Stat label="Net Operating Cash" value={currencyFormatter.format(Number(aggregatedSnapshot.net_operating_cash || 0))} icon={<RiCashLine />} />
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-2 col-xl-2">
                                    <Stat label="Tests Conducted" value={aggregatedSnapshot.total_tests_conducted || 0} icon={<RiTestTubeLine />} />
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-2 col-xl-2">
                                    <Stat label="Active Services" value={serviceStatus.active_services || 0} icon={<RiFileList3Line />} />
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-2 col-xl-2">
                                    <Stat label="Total Services" value={serviceStatus.total_services || 0} icon={<RiFileList3Line />} />
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-2 col-xl-2">
                                    <Stat label="Cancelled Services" value={serviceStatus.cancelled_services || 0} icon={<RiFileList3Line />} />
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-2 col-xl-2">
                                    <Stat label="Unique Clients" value={uniqueClients.unique_registered_clients || 0} icon={<RiGroupLine />} />
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-2 col-xl-2">
                                    <Stat label="Refunded Services" value={serviceStatus.refunded_services || 0} icon={<RiCashLine />} />
                                </div>
                            </div>
                        </Card>
                        <CEODailySnapshot data={aggregatedSnapshot} />
                        <CEOFinancialCharts branchesData={branchesData} modesData={modesData} />
                    </div>
                )}

                {activeTab === 'financial' && (
                    <div className="tab-pane fade show active" id="financial" role="tabpanel">
                        <Card title="Daily Financial Breakdown" icon={<RiCalendarLine />}>
                            {Array.isArray(dailyCeoSnapshot) && dailyCeoSnapshot.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-sm table-hover table-striped small">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="text-start">Gross Revenue</th>
                                                <th className="text-start">Cash Collected</th>
                                                <th className="text-start">Earned Revenue</th>
                                                <th className="text-start">Discount</th>
                                                <th className="text-start">Outstanding</th>
                                                <th className="text-start">Total Refunded</th>
                                                <th className="text-start">Expenses Paid</th>
                                                <th className="text-start">Net Operating Cash</th>
                                                <th className="text-start">Tests</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array.isArray(dailyCeoSnapshot) && dailyCeoSnapshot.length > 0 && dailyCeoSnapshot.map((daily: DailyCeoSnapshot, index: number) => (
                                                <tr key={index}>
                                                    <td className="text-start">
                                                        {currencyFormatter.format(Number(daily.gross_revenue))}
                                                    </td>
                                                    <td className="text-start">
                                                        {currencyFormatter.format(Number(daily.cash_collected))}
                                                    </td>
                                                    <td className="text-start">
                                                        {currencyFormatter.format(Number(daily.earned_revenue))}
                                                    </td>
                                                    <td className="text-start">
                                                        {currencyFormatter.format(Number(daily.discount))}
                                                    </td>
                                                    <td className="text-start">
                                                        {currencyFormatter.format(Number(daily.outstanding))}
                                                    </td>
                                                    <td className="text-start">
                                                        {currencyFormatter.format(Number(daily.total_refunded))}
                                                    </td>
                                                    <td className="text-start">
                                                        {currencyFormatter.format(Number(daily.expenses_paid))}
                                                    </td>
                                                    <td className="text-start">
                                                        {currencyFormatter.format(Number(daily.net_operating_cash))}
                                                    </td>
                                                    <td className="text-start">
                                                        {daily.total_tests_conducted}
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
                                <div className="table-responsive">
                                    <table className="table table-sm table-hover table-striped small">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="text-start">Report Date</th>
                                                <th className="text-start">Earned Revenue</th>
                                                <th className="text-start">Total Night Adjustment Payable</th>
                                                <th className="text-start">Total Normal Payable</th>
                                                <th className="text-start">Night Adjustment Cases</th>
                                                <th className="text-start">Normal Cases</th>
                                                <th className="text-start">Total Cases</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dailyNightAdjustmentImpact.map((adjustment: any, index: number) => (
                                                <tr key={index}>
                                                    <td className="text-start">
                                                        {new Date(adjustment.report_date).toLocaleDateString()}
                                                    </td>
                                                    <td className="text-start">
                                                        {currencyFormatter.format(Number(adjustment.earned_revenue))}
                                                    </td>
                                                    <td className="text-start">
                                                        {currencyFormatter.format(Number(adjustment.total_night_adjustment_payable))}
                                                    </td>
                                                    <td className="text-start">
                                                        {currencyFormatter.format(Number(adjustment.total_normal_payable))}
                                                    </td>
                                                    <td className="text-start">
                                                        {adjustment.night_adjustment_cases_count}
                                                    </td>
                                                    <td className="text-start">
                                                        {adjustment.normal_cases_count}
                                                    </td>
                                                    <td className="text-start">
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
                    </div>
                )}

                {activeTab === 'other' && (
                    <div className="tab-pane fade show active" id="other" role="tabpanel">
                        {Array.isArray(auditTrailActions) && auditTrailActions.length > 0 && (
                            <Card title="Audit Trail Actions" icon={<RiFileList3Line />}>
                                <div className="row g-3">
                                    {auditTrailActions.map((action: AuditTrailAction, index: number) => (
                                        <div key={index} className="col-12 col-sm-6 col-md-4 col-lg-2 col-xl-2">
                                            <Stat label={`${action.action_type} Actions`} value={action.count} icon={<RiFileList3Line />} />
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {Array.isArray(OrganizationCommissions) && OrganizationCommissions.length > 0 && (
                            <Card title="Organization Commissions" icon={<RiGroupLine />}>
                                <div className="table-responsive">
                                    <table className="table table-sm table-hover table-striped small">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="text-start">Service Date</th>
                                                <th className="text-start">Organization</th>
                                                <th className="text-start">Contact</th>
                                                <th className="text-start">Services</th>
                                                <th className="text-start">Total Value</th>
                                                <th className="text-start">Commission %</th>
                                                <th className="text-start">Commission Earned</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {OrganizationCommissions.map((commission: OrganizationCommission, index: number) => (
                                                <tr key={index}>
                                                    <td className="text-start">
                                                        {new Date(commission.service_date).toLocaleDateString()}
                                                    </td>
                                                    <td className="text-start">
                                                        <div>
                                                            <strong>{commission.organization_name}</strong>
                                                            <br />
                                                            <small style={{ color: 'var(--bs-secondary-color)' }}>{commission.organization_email}</small>
                                                        </div>
                                                    </td>
                                                    <td className="text-start">
                                                        {commission.organization_phone}
                                                    </td>
                                                    <td className="text-start">
                                                        <span className="badge bg-primary">{commission.total_services}</span>
                                                    </td>
                                                    <td className="text-start">
                                                        {currencyFormatter.format(Number(commission.total_value))}
                                                    </td>
                                                    <td className="text-start">
                                                        {commission.commission_percent}%
                                                    </td>
                                                    <td className="text-start">
                                                        {currencyFormatter.format(Number(commission.commission_earned))}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        )}

                        

                        <CeoClinicianSalesChart data={cliniciansalesdailyData} />
                    </div>
                )}

                {activeTab === 'issues' && (
                    <div className="tab-pane fade show active" id="issues" role="tabpanel">
                        {Array.isArray(mismatchedPaymentHistory) && mismatchedPaymentHistory.length > 0 && (
                            <Card title="Mismatched Payment History" icon={<RiAlertLine />}>
                                <div className="table-responsive">
                                    <table className="table table-sm table-hover table-striped small">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="text-start">Billing ID</th>
                                                <th className="text-start">Paid in Billing</th>
                                                <th className="text-start">Total in Billing History</th>
                                                <th className="text-start">Difference</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {mismatchedPaymentHistory.map((mismatch: any, index: number) => (
                                                <tr key={index}>
                                                    <td className="text-start">
                                                        {mismatch.billingid}
                                                    </td>
                                                    <td className="text-start">
                                                        {currencyFormatter.format(Number(mismatch.paid_in_billing))}
                                                    </td>
                                                    <td className="text-start">
                                                        {currencyFormatter.format(Number(mismatch.total_in_billinghx))}
                                                    </td>
                                                    <td className="text-start" style={{ color: Number(mismatch.difference) < 0 ? 'var(--bs-danger)' : 'var(--bs-success)' }}>
                                                        {currencyFormatter.format(Number(mismatch.difference))}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        )}
                    </div>
                )}

                {activeTab === 'expenses' && (
                    <div className="tab-pane fade show active" id="expenses" role="tabpanel">

                        {Array.isArray(ceoExpenseSummarySnapshot) && ceoExpenseSummarySnapshot.length > 0 && (
                            <Card title="Expense Summary" icon={<RiCashLine />}>
                                <div className="row g-3">
                                    <div className="col-12 col-sm-6 col-md-4 col-lg-2 col-xl-2">
                                        <Stat label="Total Expenses" value={currencyFormatter.format(Number(ceoExpenseSummarySnapshot[0]?.total_expenses_amount || 0))} icon={<RiCashLine />} />
                                    </div>
                                    <div className="col-12 col-sm-6 col-md-4 col-lg-2 col-xl-2">
                                        <Stat label="Approved Expenses" value={currencyFormatter.format(Number(ceoExpenseSummarySnapshot[0]?.approved_expenses_amount || 0))} icon={<RiFileList3Line />} />
                                    </div>
                                    <div className="col-12 col-sm-6 col-md-4 col-lg-2 col-xl-2">
                                        <Stat label="Total Reimbursed" value={currencyFormatter.format(Number(ceoExpenseSummarySnapshot[0]?.total_reimbursed_amount || 0))} icon={<RiHandCoinLine />} />
                                    </div>
                                    <div className="col-12 col-sm-6 col-md-4 col-lg-2 col-xl-2">
                                        <Stat label="Billable to Clients" value={currencyFormatter.format(Number(ceoExpenseSummarySnapshot[0]?.total_billable_to_clients_amount || 0))} icon={<RiBankCardLine />} />
                                    </div>
                                    <div className="col-12 col-sm-6 col-md-4 col-lg-2 col-xl-2">
                                        <Stat label="Pending Expenses" value={ceoExpenseSummarySnapshot[0]?.pending_expenses_count || 0} icon={<RiFileList3Line />} />
                                    </div>
                                </div>
                            </Card>
                        )}

                        {Array.isArray(totalExpensesPeriodComparison) && totalExpensesPeriodComparison.length > 0 && (
                            <Card title="Expense Period Comparison" icon={<RiBarChartGroupedLine />}>
                                <div className="table-responsive">
                                    <table className="table table-sm table-hover table-striped small">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="text-start">Period</th>
                                                <th className="text-start">Expenses Paid</th>
                                                <th className="text-start">Expense Count</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {totalExpensesPeriodComparison.map((comparison: TotalExpensesPeriodComparison, index: number) => (
                                                <tr key={index}>
                                                    <td className="text-start">{comparison.period}</td>
                                                    <td className="text-start">
                                                        {comparison.total_expenses ? currencyFormatter.format(Number(comparison.total_expenses)) : 'N/A'}
                                                    </td>
                                                    <td className="text-start">{comparison.expense_count}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        )}

                        {Array.isArray(monthlyExpenseTrend) && monthlyExpenseTrend.length > 0 && (
                            <Card title="Monthly Expense Trend" icon={<RiLineChartLine />}>
                                <div className="table-responsive">
                                    <table className="table table-sm table-hover table-striped small">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="text-start">Month</th>
                                                <th className="text-start">Total Expenses</th>
                                                <th className="text-start">Expense Count</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {monthlyExpenseTrend.map((trend: MonthlyExpenseTrend, index: number) => (
                                                <tr key={index}>
                                                    <td className="text-start">{trend.month}</td>
                                                    <td className="text-start">
                                                        {trend.total_expenses ? currencyFormatter.format(Number(trend.total_expenses)) : 'N/A'}
                                                    </td>
                                                    <td className="text-start">{trend.expense_count}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        )}

                        {Array.isArray(expensesByBranch) && expensesByBranch.length > 0 && (
                            <Card title="Expenses by Branch" icon={<RiBuildingLine />}>
                                <div className="table-responsive">
                                    <table className="table table-sm table-hover table-striped small">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="text-start">Branch ID</th>
                                                <th className="text-start">Total Expenses</th>
                                                <th className="text-start">Expense Count</th>
                                                <th className="text-start">Percentage of Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {expensesByBranch.map((expense: ExpensesByBranch, index: number) => (
                                                <tr key={expense.branchid}>
                                                    <td className="text-start">{expense.branchid}</td>
                                                    <td className="text-start">
                                                        {currencyFormatter.format(Number(expense.total_amount))}
                                                    </td>
                                                    <td className="text-start">{expense.expense_count}</td>
                                                    <td className="text-start">{expense.percentage_of_total}%</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        )}

                        {Array.isArray(allExpenseCategories) && allExpenseCategories.length > 0 && (
                            <Card title="Expense Categories" icon={<RiBarChartGroupedLine />}>
                                <div className="table-responsive">
                                    <table className="table table-sm table-hover table-striped small">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="text-start">Category</th>
                                                <th className="text-start">Expense Count</th>
                                                <th className="text-start">Total Amount</th>
                                                <th className="text-start">Percentage of Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allExpenseCategories.map((category: AllExpenseCategory, index: number) => (
                                                <tr key={index}>
                                                    <td className="text-start">{category.category}</td>
                                                    <td className="text-start">{category.expense_count}</td>
                                                    <td className="text-start">
                                                        {currencyFormatter.format(Number(category.total_amount))}
                                                    </td>
                                                    <td className="text-start">{category.percentage_of_total}%</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        )}

                        {Array.isArray(expensePaymentsSummary) && expensePaymentsSummary.length > 0 && (
                            <Card title="Expense Payments Summary" icon={<RiHandCoinLine />}>
                                <div className="table-responsive">
                                    <table className="table table-sm table-hover table-striped small">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="text-start">Status</th>
                                                <th className="text-start">Method</th>
                                                <th className="text-start">Payments Made</th>
                                                <th className="text-start">Unique Expenses Reimbursed</th>
                                                <th className="text-start">Total Reimbursed Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {expensePaymentsSummary.map((summary: ExpensePaymentsSummary, index: number) => (
                                                <tr key={index}>
                                                    <td className="text-start">{summary.status}</td>
                                                    <td className="text-start">{summary.method}</td>
                                                    <td className="text-start">{summary.payments_made}</td>
                                                    <td className="text-start">{summary.unique_expenses_reimbursed}</td>
                                                    <td className="text-start">
                                                        {currencyFormatter.format(Number(summary.total_reimbursed_amount))}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        )}

                        {Array.isArray(expensePaymentsFullList) && expensePaymentsFullList.length > 0 && (
                            <Card title="Expense Payments Full List" icon={<RiFileList3Line />}>
                                <div className="table-responsive">
                                    <table className="table table-sm table-hover table-striped small">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="text-start">Payment ID</th>
                                                <th className="text-start">Expense Name</th>
                                                <th className="text-start">Merchant</th>
                                                <th className="text-start">Claimed Amount</th>
                                                <th className="text-start">Paid Amount</th>
                                                <th className="text-start">Payment Date</th>
                                                <th className="text-start">Method</th>
                                                <th className="text-start">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {expensePaymentsFullList.map((payment: ExpensePaymentsFullList, index: number) => (
                                                <tr key={payment.payment_id}>
                                                    <td className="text-start">{payment.payment_id}</td>
                                                    <td className="text-start">{payment.expense_name}</td>
                                                    <td className="text-start">{payment.merchant}</td>
                                                    <td className="text-start">
                                                        {currencyFormatter.format(Number(payment.claimed_amount))}
                                                    </td>
                                                    <td className="text-start">
                                                        {currencyFormatter.format(Number(payment.paid_amount))}
                                                    </td>
                                                    <td className="text-start">
                                                        {new Date(payment.payment_date).toLocaleDateString()}
                                                    </td>
                                                    <td className="text-start">{payment.method}</td>
                                                    <td className="text-start">{payment.status}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        )}

                        {Array.isArray(allIndividualExpenses) && allIndividualExpenses.length > 0 && (
                            <Card title="All Individual Expenses" icon={<RiCashLine />}>
                                <div className="table-responsive">
                                    <table className="table table-sm table-hover table-striped small">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="text-start">Expense ID</th>
                                                <th className="text-start">Name</th>
                                                <th className="text-start">Merchant</th>
                                                <th className="text-start">Amount</th>
                                                <th className="text-start">Expense Date</th>
                                                <th className="text-start">Category</th>
                                                <th className="text-start">Approval Status</th>
                                                <th className="text-start">Employee ID</th>
                                                <th className="text-start">Branch ID</th>
                                                <th className="text-start">Description</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allIndividualExpenses.map((expense: AllIndividualExpense, index: number) => (
                                                <tr key={expense.expense_id}>
                                                    <td className="text-start">{expense.expense_id}</td>
                                                    <td className="text-start">{expense.name}</td>
                                                    <td className="text-start">{expense.merchant}</td>
                                                    <td className="text-start">
                                                        {currencyFormatter.format(Number(expense.amount))}
                                                    </td>
                                                    <td className="text-start">
                                                        {new Date(expense.expense_date).toLocaleDateString()}
                                                    </td>
                                                    <td className="text-start">{expense.category}</td>
                                                    <td className="text-start">{expense.approval_status}</td>
                                                    <td className="text-start">{expense.employeeid}</td>
                                                    <td className="text-start">{expense.branchid}</td>
                                                    <td className="text-start">{expense.description}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        )}

                        {Array.isArray(unapprovedExpensesPeriod) && unapprovedExpensesPeriod.length > 0 && (
                            <Card title="Unapproved Expenses" icon={<RiAlertLine />}>
                                <div className="table-responsive">
                                    <table className="table table-sm table-hover table-striped small">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="text-start">Expense ID</th>
                                                <th className="text-start">Description</th>
                                                <th className="text-start">Amount</th>
                                                <th className="text-start">Submitted Date</th>
                                                <th className="text-start">Submitted By</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {unapprovedExpensesPeriod.map((expense: UnapprovedExpense, index: number) => (
                                                <tr key={expense.expense_id}>
                                                    <td className="text-start">{expense.expense_id}</td>
                                                    <td className="text-start">{expense.description}</td>
                                                    <td className="text-start">
                                                        {currencyFormatter.format(Number(expense.amount))}
                                                    </td>
                                                    <td className="text-start">
                                                        {new Date(expense.submitted_date).toLocaleDateString()}
                                                    </td>
                                                    <td className="text-start">{expense.submitted_by}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        )}

                    </div>
                )}

                {activeTab === 'transactions' && (
                    <div className="tab-pane fade show active" id="transactions" role="tabpanel">

                        <Card title="Daily Test Transaction Details" icon={<RiTestTubeLine />}>
                            {Array.isArray(dailyTestTransactionSnapshot) && dailyTestTransactionSnapshot.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-sm table-hover table-striped small">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="text-start">Test Name</th>
                                                <th className="text-start">Category</th>
                                                <th className="text-start">Count</th>
                                                <th className="text-start">Gross Revenue</th>
                                                <th className="text-start">Cash Collected</th>
                                                <th className="text-start">Earned Revenue</th>
                                                <th className="text-start">Discount</th>
                                                <th className="text-start">Outstanding</th>
                                                <th className="text-start">Refunds</th>
                                                <th className="text-start">Department</th>
                                                <th className="text-start">Added On</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dailyTestTransactionSnapshot.map((test: DailyTestTransaction, index: number) => (
                                                <tr key={`${test.trackId}-${index}`}>
                                                    <td className="text-start">{test.test_panel_name || 'N/A'}</td>
                                                    <td className="text-start">{test.serviceCategory}</td>
                                                    <td className="text-start">
                                                        <span className="badge bg-primary">{test.test_count}</span>
                                                    </td>
                                                    <td className="text-start">
                                                        {currencyFormatter.format(Number(test.gross_revenue))}
                                                    </td>
                                                    <td className="text-start">
                                                        {currencyFormatter.format(Number(test.cash_collected))}
                                                    </td>
                                                    <td className="text-start">
                                                        {currencyFormatter.format(Number(test.earned_revenue))}
                                                    </td>
                                                    <td className="text-start">
                                                        {currencyFormatter.format(Number(test.discount))}
                                                    </td>
                                                    <td className="text-start">
                                                        {currencyFormatter.format(Number(test.outstanding))}
                                                    </td>
                                                    <td className="text-start">
                                                        {currencyFormatter.format(Number(test.total_refunded))}
                                                    </td>
                                                    <td className="text-start">
                                                        {test.department || 'N/A'}
                                                    </td>
                                                    <td className="text-start">
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
                                <div className="table-responsive">
                                    <table className="table table-sm table-hover table-striped small">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="text-start">Employee</th>
                                                <th className="text-start">Transactions</th>
                                                <th className="text-start">Cash Collected</th>
                                                <th className="text-start">Last Payment Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {employeesWhoCollectedCash.map((employee: EmployeeCashCollection, index: number) => (
                                                <tr key={index}>
                                                    <td className="text-start">
                                                        {new Date(employee.payment_date).toLocaleDateString()}
                                                    </td>
                                                    <td className="text-start">{employee.username}</td>
                                                    <td className="text-start">
                                                        <span className="badge bg-primary">{employee.total_transactions}</span>
                                                    </td>
                                                    <td className="text-start">
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

                    </div>
                )}
            </div>
        </main>
    );
}