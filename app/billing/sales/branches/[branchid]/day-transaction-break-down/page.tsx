'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { currencyFormatter, customFetch } from '../../../../../../components/Auth/customFetch';
import styles from './FinancialSummary.module.css';
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
    RiMoneyDollarCircleLine,
    RiTestTubeLine,
    RiPieChartLine,
    RiDashboardLine,
} from '@remixicon/react';
import { CEOFinancialCharts } from '../../../../../../components/Billing/CeoSnapShot';
import { CeoClinicianSalesChart } from '../../../../../../components/Billing/ClinicianSalesChartCeo';
import { useApplication } from '../../../../../../components/Auth/useApplicationContext';

interface DailyCeoSnapshot {
    totalCost: string;
    actual_revenue: string;
    accrued_revenue: string;
    total_discount: string;
    outstanding_debt: string;
    total_refunds: string;
    total_expense_payments: string;
    total_tests_conducted: number;
    net_revenue: string;
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
    accrued_revenue: string;
    actual_revenue: string;
    total_discount: string;
    total_outstanding: string;
    total_tests: number;
    total_refunds: string;
    branchname: string;
}

interface DailyNightAdjustmentImpact {
    report_date: string;
    accrued_revenue: string;
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
    accrued_revenue: string;
    actual_revenue: string;
    total_discount: string;
    total_outstanding: string;
    total_cost: string;
    total_refunds: string;
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

interface ClinicianSalesDailyData {
    sale_date: string;
    clinician_id: number;
    clinician_name: string;
    clinician_phone: string;
    occupation: string | null;
    organization: number;
    total_services: number;
    total_value: string;
    additional_services_count: string;
    test_panels_count: string;
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
    expense_id: number;
    expense_name: string;
    merchant: string;
    billable_amount: number;
    expense_date: string;
    employeeid: number;
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
    name: string;
    merchant: string;
    amount: number;
    expense_date: string;
    days_since_submission: number;
    employeeid: number;
    branchid: number;
}

interface ExpensesByBranch {
    branchid: number;
    branch_name: string;
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
    merchant_name: string;
    payments_made: number;
    unique_expenses_reimbursed: number;
    total_reimbursed_amount: string;
}

interface ExpensePaymentsFullList {
    payment_id: number;
    expense_id: number;
    expense_name: string;
    merchant: string;
    merchant_name: string;
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
    merchant_name: string;
    amount: number;
    expense_date: string;
    category: string;
    approval_status: string;
    branch_name: string;
    submitted_by: string;
    employeeid: number;
    branchid: number;
    description: string;
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
    expense_id: number;
    expense_name: string;
    merchant: string;
    billable_amount: number;
    expense_date: string;
    employeeid: number;
}




const cardColors = {
    billedClients: { bg: "#4f46e5", icon: "#6366f1" },
    totalSales: { bg: "#059669", icon: "#0ea5e9" },
    amountPaid: { bg: "#dc2626", icon: "#10b981" },
    discount: { bg: "#7c3aed", icon: "#f59e0b" },
    pendingDebts: { bg: "#ea580c", icon: "#ef4444" },
    expenses: { bg: "#0891b2", icon: "#8b5cf6" },
    outstanding: { bg: "#c2410c", icon: "#f97316" },
};

export type AnalyticCardProps = {
    title: string;
    value: number | string;
    Icon: React.ElementType;
    bgColor: string;
    iconColor: string;
    formatAsCurrency?: boolean;
};

const AnalyticCard = ({
    title,
    value,
    Icon,
    bgColor,
    iconColor,
    formatAsCurrency = true,
}: AnalyticCardProps) => (
    <div
        className="card border-0 shadow-sm rounded"
        style={{
            background: bgColor,
            borderRadius: "8px",
            transition: "all 0.2s ease",
            height: "150px",
            flex: "1 1 auto",
            margin: "0 4px",
            border: "1px solid var(--bs-border-color)",
            cursor: "pointer",
            color: "white",
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
        }}
    >
        <div className="card-body p-3 d-flex flex-column h-100">
            <div className="d-flex align-items-center mb-2">
                <div
                    className="d-flex align-items-center justify-content-center me-2"
                    style={{
                        background: iconColor,
                        padding: "6px",
                        borderRadius: "6px",
                        width: "32px",
                        height: "32px",
                    }}
                >
                    <Icon style={{ fontSize: "1.2rem", color: "white" }} />
                </div>
                <h6 className="mb-0 fw-bold" style={{ fontSize: "1rem", lineHeight: "1.2", color: "rgba(255,255,255,0.9)" }}>
                    {title}
                </h6>
            </div>
            <hr className="my-2" style={{ borderColor: "rgba(255,255,255,0.3)", borderWidth: "1px" }} />
            <div className="fw-bold" style={{ fontSize: "1.8rem", lineHeight: "1.3" }}>
                {formatAsCurrency ? currencyFormatter.format(Number(value) || 0) : (typeof value === 'number' ? value.toLocaleString() : value)}
            </div>
        </div>
    </div>
);

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
                {React.cloneElement(icon as React.ReactElement, { size: 20 } as any)}
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
    const router = useRouter();
    const role = useApplication()?.users?.role;

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

                if (new Date(from) > new Date(end)) {
                    setError("'From' date cannot be later than 'End' date.");
                    setLoading(false);
                    return;
                }

                if (!date || !from || !end) {
                    setError("Please provide 'date', 'from', and 'end' query parameters.");
                    setLoading(false);
                    return;
                }
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
    const aggregatedSnapshot = dailyCeoSnapshot.length > 0 ? dailyCeoSnapshot[0] : {
        totalCost: '0',
        actual_revenue: '0',
        accrued_revenue: '0',
        outstanding_debt: '0',
        total_discount: '0',
        total_refunds: '0',
        total_expense_payments: '0',
        total_tests_conducted: 0,
        net_revenue: '0',
    };

    // Aggregate test transactions by test name
    const aggregatedTestTransactions = dailyTestTransactionSnapshot.reduce((acc, test) => {
        const key = test.test_panel_name || 'N/A';
        if (!acc[key]) {
            acc[key] = {
                test_panel_name: key,
                serviceCategory: test.serviceCategory,
                total_cost: 0,
                test_count: 0,
                accrued_revenue: 0,
                actual_revenue: 0,
                total_discount: 0,
                total_outstanding: 0,
                total_refunds: 0,
            };
        }
        acc[key].total_cost += Number(test.total_cost) || 0;
        acc[key].test_count += Number(test.test_count) || 0;
        acc[key].accrued_revenue += Number(test.accrued_revenue) || 0;
        acc[key].actual_revenue += Number(test.actual_revenue) || 0;
        acc[key].total_discount += Number(test.total_discount) || 0;
        acc[key].total_outstanding += Number(test.total_outstanding) || 0;
        acc[key].total_refunds += Number(test.total_refunds) || 0;
        return acc;
    }, {} as Record<string, any>);

    const aggregatedTestData = Object.values(aggregatedTestTransactions);

    const serviceStatus = serviceStatusCounts[0] || {};
    const uniqueClients = dailyUniqueClientsSummary[0] || {};

    const branchesData = Array.isArray(topPerformingBranches) ? topPerformingBranches : [];
    const modesData = Array.isArray(breakDownPaymentModes) ? breakDownPaymentModes : [];

    const dateRangeText = formatDateRange(from, end, undefined);

    return (
        <main className={styles.container}>
            <div className="border rounded p-3 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-3">
                        <h1 className="fs-5 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
                            <RiDashboardLine className="me-2" size={20} style={{ color: 'var(--pls-accent)' }} />
                            Financial Analytics Report
                        </h1>
                        <div className="d-flex align-items-center gap-2 text-muted small">
                            <RiCalendarLine size={14} />
                            <span>Report Period: <span className="fw-medium" style={{ color: 'var(--pls-accent)' }}>{dateRangeText}</span></span>
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <div className="input-group input-group-sm" style={{ width: '140px' }}>
                            <span className="input-group-text bg-transparent border-end-0 p-1" style={{ borderColor: 'var(--bs-border-color)' }}>
                                <RiCalendarLine size={14} className="text-muted" />
                            </span>
                            <input
                                type="date"
                                className="form-control shadow-none border-start-0 p-1"
                                value={selectedFrom}
                                onChange={(e) => setSelectedFrom(e.target.value)}
                                style={{ fontSize: '0.875rem' }}
                            />
                        </div>
                        <div className="input-group input-group-sm" style={{ width: '140px' }}>
                            <span className="input-group-text bg-transparent border-end-0 p-1" style={{ borderColor: 'var(--bs-border-color)' }}>
                                <RiCalendarLine size={14} className="text-muted" />
                            </span>
                            <input
                                type="date"
                                className="form-control shadow-none border-start-0 p-1"
                                value={selectedEnd}
                                onChange={(e) => setSelectedEnd(e.target.value)}
                                min={selectedFrom}
                                style={{ fontSize: '0.875rem' }}
                            />
                        </div>
                        <button
                            onClick={handleApplyDateRange}
                            className="btn btn-sm btn-primary px-3"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </div>

            <Card title="Executive Summary" icon={<RiPieChartLine />}>
                {/* Desktop Card View */}
                <div className="d-none d-md-block">
                    <div className="d-flex flex-row gap-3 mb-3">
                        <div className="flex-fill" style={{ height: '150px' }}>
                            <AnalyticCard
                                title="Net Revenue"
                                value={Number(aggregatedSnapshot.net_revenue || 0)}
                                Icon={RiMoneyDollarCircleLine}
                                bgColor={cardColors.totalSales.bg}
                                iconColor={cardColors.totalSales.icon}
                            />
                        </div>
                        <div className="flex-fill" style={{ height: '150px' }}>
                            <AnalyticCard
                                title="Accrued Revenue"
                                value={Number(aggregatedSnapshot.accrued_revenue || 0)}
                                Icon={RiLineChartLine}
                                bgColor={cardColors.discount.bg}
                                iconColor={cardColors.discount.icon}
                            />
                        </div>
                        <div className="flex-fill" style={{ height: '150px' }}>
                            <AnalyticCard
                                title="Actual Revenue "
                                value={Number(aggregatedSnapshot.actual_revenue || 0)}
                                Icon={RiHandCoinLine}
                                bgColor={cardColors.amountPaid.bg}
                                iconColor={cardColors.amountPaid.icon}
                            />
                        </div>
                        <div className="flex-fill" style={{ height: '150px' }}>
                            <AnalyticCard
                                title="Outstanding Debt"
                                value={Number(aggregatedSnapshot.outstanding_debt || 0)}
                                Icon={RiBankCardLine}
                                bgColor={cardColors.outstanding.bg}
                                iconColor={cardColors.outstanding.icon}
                            />
                        </div>
                        <div className="flex-fill" style={{ height: '150px' }}>
                            <AnalyticCard
                                title="Total Discounts"
                                value={Number(aggregatedSnapshot.total_discount || 0)}
                                Icon={RiCashLine}
                                bgColor={cardColors.expenses.bg}
                                iconColor={cardColors.expenses.icon}
                            />
                        </div>
                        <div className="flex-fill" style={{ height: '150px' }}>
                            <AnalyticCard
                                title="Total Refunds"
                                value={Number(aggregatedSnapshot.total_refunds || 0)}
                                Icon={RiCashLine}
                                bgColor={cardColors.pendingDebts.bg}
                                iconColor={cardColors.pendingDebts.icon}
                            />
                        </div>
                    </div>
                    <div className="d-flex flex-row gap-3 mb-3">
                        <div className="flex-fill" style={{ height: '150px' }}>
                            <AnalyticCard
                                title="Total Expenses"
                                value={Number(ceoExpenseSummarySnapshot[0]?.total_expenses_amount || 0)}
                                Icon={RiCashLine}
                                bgColor={cardColors.expenses.bg}
                                iconColor={cardColors.expenses.icon}
                            />
                        </div>
                        <div className="flex-fill" style={{ height: '150px' }}>
                            <AnalyticCard
                                title="Approved Expenses"
                                value={Number(ceoExpenseSummarySnapshot[0]?.approved_expenses_amount || 0)}
                                Icon={RiFileList3Line}
                                bgColor={cardColors.amountPaid.bg}
                                iconColor={cardColors.amountPaid.icon}
                            />
                        </div>
                        <div className="flex-fill" style={{ height: '150px' }}>
                            <AnalyticCard
                                title="Pending Expenses"
                                value={ceoExpenseSummarySnapshot[0]?.pending_expenses_count || 0}
                                Icon={RiFileList3Line}
                                bgColor={cardColors.pendingDebts.bg}
                                iconColor={cardColors.pendingDebts.icon}
                                formatAsCurrency={false}
                            />
                        </div>
                    </div>
                </div>

                {/* Mobile List View */}
                <div className="d-md-none">
                    <div className="list-group list-group-flush">
                        <div className="list-group-item px-3 py-2 border-0">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-2">
                                    <div
                                        className="d-flex align-items-center justify-content-center"
                                        style={{
                                            background: cardColors.discount.icon,
                                            padding: "4px",
                                            borderRadius: "4px",
                                            width: "24px",
                                            height: "24px",
                                        }}
                                    >
                                        <RiLineChartLine style={{ fontSize: "0.8rem", color: "white" }} />
                                    </div>
                                    <span className="small fw-medium text-muted">Accrued Revenue</span>
                                </div>
                                <span className="fw-semibold text-dark small">
                                    {currencyFormatter.format(Number(aggregatedSnapshot.accrued_revenue || 0))}
                                </span>
                            </div>
                        </div>

                        <div className="list-group-item px-3 py-2 border-0">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-2">
                                    <div
                                        className="d-flex align-items-center justify-content-center"
                                        style={{
                                            background: cardColors.amountPaid.icon,
                                            padding: "4px",
                                            borderRadius: "4px",
                                            width: "24px",
                                            height: "24px",
                                        }}
                                    >
                                        <RiHandCoinLine style={{ fontSize: "0.8rem", color: "white" }} />
                                    </div>
                                    <span className="small fw-medium text-muted">Actual Revenue(paid amount)</span>
                                </div>
                                <span className="fw-semibold text-dark small">
                                    {currencyFormatter.format(Number(aggregatedSnapshot.actual_revenue || 0))}
                                </span>
                            </div>
                        </div>

                        <div className="list-group-item px-3 py-2 border-0">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-2">
                                    <div
                                        className="d-flex align-items-center justify-content-center"
                                        style={{
                                            background: cardColors.outstanding.icon,
                                            padding: "4px",
                                            borderRadius: "4px",
                                            width: "24px",
                                            height: "24px",
                                        }}
                                    >
                                        <RiBankCardLine style={{ fontSize: "0.8rem", color: "white" }} />
                                    </div>
                                    <span className="small fw-medium text-muted">Outstanding Debt</span>
                                </div>
                                <span className="fw-semibold text-dark small">
                                    {currencyFormatter.format(Number(aggregatedSnapshot.outstanding_debt || 0))}
                                </span>
                            </div>
                        </div>

                        <div className="list-group-item px-3 py-2 border-0">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-2">
                                    <div
                                        className="d-flex align-items-center justify-content-center"
                                        style={{
                                            background: cardColors.expenses.icon,
                                            padding: "4px",
                                            borderRadius: "4px",
                                            width: "24px",
                                            height: "24px",
                                        }}
                                    >
                                        <RiCashLine style={{ fontSize: "0.8rem", color: "white" }} />
                                    </div>
                                    <span className="small fw-medium text-muted">Total Discounts</span>
                                </div>
                                <span className="fw-semibold text-dark small">
                                    {currencyFormatter.format(Number(aggregatedSnapshot.total_discount || 0))}
                                </span>
                            </div>
                        </div>

                        <div className="list-group-item px-3 py-2 border-0">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-2">
                                    <div
                                        className="d-flex align-items-center justify-content-center"
                                        style={{
                                            background: cardColors.pendingDebts.icon,
                                            padding: "4px",
                                            borderRadius: "4px",
                                            width: "24px",
                                            height: "24px",
                                        }}
                                    >
                                        <RiCashLine style={{ fontSize: "0.8rem", color: "white" }} />
                                    </div>
                                    <span className="small fw-medium text-muted">Total Refunds</span>
                                </div>
                                <span className="fw-semibold text-dark small">
                                    {currencyFormatter.format(Number(aggregatedSnapshot.total_refunds || 0))}
                                </span>
                            </div>
                        </div>

                        <div className="list-group-item px-3 py-2 border-0">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-2">
                                    <div
                                        className="d-flex align-items-center justify-content-center"
                                        style={{
                                            background: cardColors.expenses.icon,
                                            padding: "4px",
                                            borderRadius: "4px",
                                            width: "24px",
                                            height: "24px",
                                        }}
                                    >
                                        <RiCashLine style={{ fontSize: "0.8rem", color: "white" }} />
                                    </div>
                                    <span className="small fw-medium text-muted">Total Expenses</span>
                                </div>
                                <span className="fw-semibold text-dark small">
                                    {currencyFormatter.format(Number(ceoExpenseSummarySnapshot[0]?.total_expense_payments || 0))}
                                </span>
                            </div>
                        </div>

                                                <div className="list-group-item px-3 py-2 border-0">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-2">
                                    <div
                                        className="d-flex align-items-center justify-content-center"
                                        style={{
                                            background: cardColors.totalSales.icon,
                                            padding: "4px",
                                            borderRadius: "4px",
                                            width: "24px",
                                            height: "24px",
                                        }}
                                    >
                                        <RiMoneyDollarCircleLine style={{ fontSize: "0.8rem", color: "white" }} />
                                    </div>
                                    <span className="small fw-medium text-muted">Net Revenue</span>
                                </div>
                                <span className="fw-semibold text-dark small">
                                    {currencyFormatter.format(Number(aggregatedSnapshot.net_revenue || 0))}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <CEOFinancialCharts branchesData={branchesData} modesData={modesData} />

            <div className={styles.sectionDivider}></div>

            <Card title="Night Adjustment Impact Analysis" icon={<RiLineChartLine />}>
                {Array.isArray(dailyNightAdjustmentImpact) && dailyNightAdjustmentImpact.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table table-hover table-striped">
                            <thead className="table-light">
                                <tr>
                                    <th className="text-start">Report Date</th>
                                    <th className="text-start">Accrued Revenue(total payable)</th>
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
                                            {currencyFormatter.format(Number(adjustment.accrued_revenue))}
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
                        <table className="table table-hover table-striped">
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
                                {Array.isArray(OrganizationCommissions) && OrganizationCommissions.map((commission: OrganizationCommission, index: number) => (
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
                                            {commission.total_services}
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

            <div className="tab-pane fade show active" id="expenses" role="tabpanel">



                {Array.isArray(totalExpensesPeriodComparison) && totalExpensesPeriodComparison.length > 0 && (
                    <Card title="Expense Period Comparison" icon={<RiBarChartGroupedLine />}>
                        <div className="table-responsive">
                            <table className="table table-hover table-striped">
                                <thead className="table-light">
                                    <tr>
                                        <th className="text-start">Period</th>
                                        <th className="text-start">Total Expenses</th>
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
                            <table className="table table-hover table-striped">
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
                            <table className="table table-hover table-striped">
                                <thead className="table-light">
                                    <tr>
                                        <th className="text-start">Branch ID</th>
                                        <th className="text-start">Branch Name</th>
                                        <th className="text-start">Total Expenses</th>
                                        <th className="text-start">Expense Count</th>
                                        <th className="text-start">Percentage of Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expensesByBranch.map((expense: ExpensesByBranch, index: number) => (
                                        <tr key={expense.branchid}>
                                            <td className="text-start">{expense.branchid}</td>
                                            <td className="text-start">{expense.branch_name}</td>
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
                            <table className="table table-hover table-striped">
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
                            <table className="table table-hover table-striped">
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
                            <table className="table table-hover table-striped">
                                <thead className="table-light">
                                    <tr>
                                        <th className="text-start">Payment Date</th>
                                        <th className="text-start">Expense Name</th>
                                        <th className="text-start">Merchant</th>
                                        <th className="text-start">Claimed Amount</th>
                                        <th className="text-start">Paid Amount</th>
                                        <th className="text-start">Method</th>
                                        <th className="text-start">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expensePaymentsFullList.map((payment: ExpensePaymentsFullList, index: number) => (
                                        <tr key={payment.payment_id}>
                                            <td className="text-start">
                                                {new Date(payment.payment_date).toLocaleDateString()}
                                            </td>
                                            <td className="text-start">{payment.expense_name}</td>
                                            <td className="text-start">{payment.merchant_name}</td>
                                            <td className="text-start">
                                                {currencyFormatter.format(Number(payment.claimed_amount))}
                                            </td>
                                            <td className="text-start">
                                                {currencyFormatter.format(Number(payment.paid_amount))}
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
                            <table className="table table-hover table-striped">
                                <thead className="table-light">
                                    <tr>
                                        <th className="text-start">Expense ID</th>
                                        <th className="text-start">Name</th>
                                        <th className="text-start">Merchant Name</th>
                                        <th className="text-start">Amount</th>
                                        <th className="text-start">Expense Date</th>
                                        <th className="text-start">Category</th>
                                        <th className="text-start">Approval Status</th>
                                        <th className="text-start">Submitted By</th>
                                        <th className="text-start">Branch</th>
                                        <th className="text-start">Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allIndividualExpenses.map((expense: AllIndividualExpense, index: number) => (
                                        <tr key={expense.expense_id}>
                                            <td className="text-start">{expense.expense_id}</td>
                                            <td className="text-start">{expense.name}</td>
                                            <td className="text-start">{expense.merchant_name}</td>
                                            <td className="text-start">
                                                {currencyFormatter.format(Number(expense.amount))}
                                            </td>
                                            <td className="text-start">
                                                {new Date(expense.expense_date).toLocaleDateString()}
                                            </td>
                                            <td className="text-start">{expense.category}</td>
                                            <td className="text-start">{expense.approval_status}</td>
                                            <td className="text-start">{expense.submitted_by}</td>
                                            <td className="text-start">{expense.branch_name}</td>
                                            <td className="text-start">{expense.description}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {Array.isArray(expenseApprovalStatusSummary) && expenseApprovalStatusSummary.length > 0 && (
                    <Card title="Expense Approval Status Summary" icon={<RiFileList3Line />}>
                        <div className="table-responsive">
                            <table className="table table-hover table-striped">
                                <thead className="table-light">
                                    <tr>
                                        <th className="text-start">Status</th>
                                        <th className="text-start">Count</th>
                                        <th className="text-start">Total Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenseApprovalStatusSummary.map((summary: ExpenseApprovalStatusSummary, index: number) => (
                                        <tr key={index}>
                                            <td className="text-start">{summary.status}</td>
                                            <td className="text-start">{summary.expense_count}</td>
                                            <td className="text-start">
                                                {currencyFormatter.format(Number(summary.total_amount))}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {Array.isArray(totalReimbursedPaid) && totalReimbursedPaid.length > 0 && (
                    <Card title="Total Reimbursed & Paid Summary" icon={<RiHandCoinLine />}>
                        <div className="table-responsive">
                            <table className="table table-hover table-striped">
                                <thead className="table-light">
                                    <tr>
                                        <th className="text-start">Total Reimbursed</th>
                                        <th className="text-start">Expenses Paid Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {totalReimbursedPaid.map((summary: TotalReimbursedPaid, index: number) => (
                                        <tr key={index}>
                                            <td className="text-start">
                                                {currencyFormatter.format(Number(summary.total_reimbursed))}
                                            </td>
                                            <td className="text-start">{summary.expenses_paid_count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

            </div>

            <Card title="Daily Test Transaction Details" icon={<RiTestTubeLine />}>
                {Array.isArray(aggregatedTestData) && aggregatedTestData.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table table-hover table-striped">
                            <thead className="table-light">
                                <tr>
                                    <th className="text-start">Test Name</th>
                                    <th className="text-start">Total Cost</th>
                                    <th className="text-start">Total Count</th>
                                    <th className="text-start">Total Payable</th>
                                    <th className="text-start">Total Paid</th>
                                    <th className="text-start">Total Discount</th>
                                    <th className="text-start">Total Outstanding</th>
                                    <th className="text-start">Total Refunds</th>
                                </tr>
                            </thead>
                            <tbody>
                                {aggregatedTestData.map((test: any, index: number) => (
                                    <tr key={`${test.test_panel_name}-${index}`}>
                                        <td className="text-start">{test.test_panel_name}</td>
                                        <td className="text-start">
                                            {currencyFormatter.format(Number(test.total_cost))}
                                        </td>
                                        <td className="text-start">
                                            {test.test_count}
                                        </td>
                                        <td className="text-start">
                                            {currencyFormatter.format(Number(test.accrued_revenue))}
                                        </td>
                                        <td className="text-start">
                                            {currencyFormatter.format(Number(test.actual_revenue))}
                                        </td>
                                        <td className="text-start">
                                            {currencyFormatter.format(Number(test.total_discount))}
                                        </td>
                                        <td className="text-start">
                                            {currencyFormatter.format(Number(test.total_outstanding))}
                                        </td>
                                        <td className="text-start">
                                            {currencyFormatter.format(Number(test.total_refunds))}
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
                        <table className="table table-hover table-striped">
                            <thead className="table-light">
                                <tr>
                                    <th className="text-start">Payment Date</th>
                                    <th className="text-start">Employee</th>
                                    <th className="text-start">Transactions</th>
                                    <th className="text-start">Total Amount</th>
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
                                            {employee.total_transactions}
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
        </main>
    );
}