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
import ExecutiveSummary from '../../../../../../components/Billing/Daily-Sales-breakdown/ExecutiveSummary';
import EmployeeMoneyCollection from '../../../../../../components/Billing/Daily-Sales-breakdown/EmployeeMoneyCollection';
import DailyTestsTransactions from '../../../../../../components/Billing/Daily-Sales-breakdown/DailyTestsTransactions';
import DepartmentSegregation from '../../../../../../components/Billing/Daily-Sales-breakdown/DepartmentSegregation';
import ExpenseCategory from '../../../../../../components/Billing/Daily-Sales-breakdown/ExpenseCategory';
import NightAdjustmentImpact from '../../../../../../components/Billing/Daily-Sales-breakdown/NightAdjustmentImpact';
import AuditTrailActions from '../../../../../../components/Billing/Daily-Sales-breakdown/AuditTrailActions';
import OrganizationCommissionsSection from '../../../../../../components/Billing/Daily-Sales-breakdown/OrganizationCommissions';
import ExpensePeriodComparison from '../../../../../../components/Billing/Daily-Sales-breakdown/ExpensePeriodComparison';
import MonthlyExpenseTrend from '../../../../../../components/Billing/Daily-Sales-breakdown/MonthlyExpenseTrend';
import ExpensesByBranch from '../../../../../../components/Billing/Daily-Sales-breakdown/ExpensesByBranch';
import ExpensePaymentsSummary from '../../../../../../components/Billing/Daily-Sales-breakdown/ExpensePaymentsSummary';
import ExpensePaymentsFullList from '../../../../../../components/Billing/Daily-Sales-breakdown/ExpensePaymentsFullList';
import AllIndividualExpenses from '../../../../../../components/Billing/Daily-Sales-breakdown/AllIndividualExpenses';
import ExpenseApprovalStatusSummary from '../../../../../../components/Billing/Daily-Sales-breakdown/ExpenseApprovalStatusSummary';
import TotalReimbursedPaidSummary from '../../../../../../components/Billing/Daily-Sales-breakdown/TotalReimbursedPaidSummary';

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
    department: string;
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

interface DepartmentSegregationDetail {
    test_name: string;
    total_cost: number;
    total_count: number;
    total_accrued_revenue: number;
    total_actual_revenue: number;
    total_discount: number;
    total_outstanding: number;
    total_refunds: number;
}

interface DepartmentSegregation {
    department: string;
    total_cost: number;
    total_count: number;
    total_accrued_revenue: number;
    total_actual_revenue: number;
    total_discount: number;
    total_outstanding: number;
    total_refunds: number;
    breakdown: DepartmentSegregationDetail[];
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

type SectionKey =
    | 'executiveSummary'
    | 'financialCharts'
    | 'nightAdjustmentImpact'
    | 'auditTrailActions'
    | 'organizationCommissions'
    | 'clinicianSales'
    | 'expenseOverview'
    | 'expensePayments'
    | 'expenseDetails'
    | 'departmentSegregation'
    | 'testsTransactions'
    | 'moneyCollection';

const sectionNavItems: { id: SectionKey; title: string; subtitle: string }[] = [
    { id: 'executiveSummary', title: 'Executive Summary', subtitle: 'High-level metrics and snapshot' },
    { id: 'financialCharts', title: 'Financial Charts', subtitle: 'Revenue and payment mode visuals' },
    { id: 'nightAdjustmentImpact', title: 'Night Adjustment Impact', subtitle: 'Night shift adjustments and totals' },
    { id: 'auditTrailActions', title: 'Audit Trail', subtitle: 'Tracking operational activity counts' },
    { id: 'organizationCommissions', title: 'Organization Commissions', subtitle: 'Commission earned by organizations' },
    { id: 'clinicianSales', title: 'Clinician Sales', subtitle: 'Clinician performance sales data' },
    { id: 'expenseOverview', title: 'Expense Overview', subtitle: 'Expense comparison and trend charts' },
    { id: 'expensePayments', title: 'Expense Payments', subtitle: 'Payment summary and full payment list' },
    { id: 'expenseDetails', title: 'Expense Details', subtitle: 'Expense categories and approval status' },
    { id: 'departmentSegregation', title: 'Department Segregation', subtitle: 'Totals per department, including refunds and paid amounts' },
    { id: 'testsTransactions', title: 'Tests Transactions', subtitle: 'Daily test transaction breakdown' },
    { id: 'moneyCollection', title: 'Employee Collections', subtitle: 'Cash collection activity by employee' },
];

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
    const [selectedSection, setSelectedSection] = useState<SectionKey>('executiveSummary');
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

    // Aggregate test transactions by test name and category
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

    // Organize test data by service category and department
    const organizeTestData = (data: any[]) => {
        const ultrasoundTests: any[] = [];
        const labTests: Record<string, any[]> = {};

        data.forEach((test) => {
            if (
                test.serviceCategory &&
                test.serviceCategory.toLowerCase().includes('ultrasound')
            ) {
                ultrasoundTests.push(test);
            } else {
                const dept = test.serviceCategory || 'General Laboratory';
                if (!labTests[dept]) {
                    labTests[dept] = [];
                }
                labTests[dept].push(test);
            }
        });

        return { ultrasoundTests, labTests };
    };

    const { ultrasoundTests, labTests } = organizeTestData(aggregatedTestData);

    const departmentSegregationData = Object.values(
        dailyTestTransactionSnapshot.reduce((acc: Record<string, DepartmentSegregation>, test) => {
            const department = test.department?.trim() || test.serviceCategory?.trim() || 'Unknown';
            const testName = test.test_panel_name?.trim() || 'Unknown Service';

            if (!acc[department]) {
                acc[department] = {
                    department,
                    total_cost: 0,
                    total_count: 0,
                    total_accrued_revenue: 0,
                    total_actual_revenue: 0,
                    total_discount: 0,
                    total_outstanding: 0,
                    total_refunds: 0,
                    breakdown: [],
                };
            }

            acc[department].total_cost += Number(test.total_cost) || 0;
            acc[department].total_count += Number(test.test_count) || 0;
            acc[department].total_accrued_revenue += Number(test.accrued_revenue) || 0;
            acc[department].total_actual_revenue += Number(test.actual_revenue) || 0;
            acc[department].total_discount += Number(test.total_discount) || 0;
            acc[department].total_outstanding += Number(test.total_outstanding) || 0;
            acc[department].total_refunds += Number(test.total_refunds) || 0;

            const existingTest = acc[department].breakdown.find((item) => item.test_name === testName);
            if (!existingTest) {
                acc[department].breakdown.push({
                    test_name: testName,
                    total_cost: 0,
                    total_count: 0,
                    total_accrued_revenue: 0,
                    total_actual_revenue: 0,
                    total_discount: 0,
                    total_outstanding: 0,
                    total_refunds: 0,
                });
            }

            const testBreakdown = acc[department].breakdown.find((item) => item.test_name === testName);
            if (testBreakdown) {
                testBreakdown.total_cost += Number(test.total_cost) || 0;
                testBreakdown.total_count += Number(test.test_count) || 0;
                testBreakdown.total_accrued_revenue += Number(test.accrued_revenue) || 0;
                testBreakdown.total_actual_revenue += Number(test.actual_revenue) || 0;
                testBreakdown.total_discount += Number(test.total_discount) || 0;
                testBreakdown.total_outstanding += Number(test.total_outstanding) || 0;
                testBreakdown.total_refunds += Number(test.total_refunds) || 0;
            }

            return acc;
        }, {})
    );

    const serviceStatus = serviceStatusCounts[0] || {};
    const uniqueClients = dailyUniqueClientsSummary[0] || {};

    const branchesData = Array.isArray(topPerformingBranches) ? topPerformingBranches : [];
    const modesData = Array.isArray(breakDownPaymentModes) ? breakDownPaymentModes : [];

    const dateRangeText = formatDateRange(from, end, undefined);

    const renderSelectedSection = () => {
        switch (selectedSection) {
            case 'executiveSummary':
                return <ExecutiveSummary aggregatedSnapshot={aggregatedSnapshot} dailyCeoSnapshot={dailyCeoSnapshot} ceoExpenseSummarySnapshot={ceoExpenseSummarySnapshot} />;
            case 'financialCharts':
                return <CEOFinancialCharts branchesData={branchesData} modesData={modesData} />;
            case 'nightAdjustmentImpact':
                return <NightAdjustmentImpact dailyNightAdjustmentImpact={dailyNightAdjustmentImpact} />;
            case 'auditTrailActions':
                return <AuditTrailActions auditTrailActions={auditTrailActions} />;
            case 'organizationCommissions':
                return <OrganizationCommissionsSection OrganizationCommissions={OrganizationCommissions} />;
            case 'clinicianSales':
                return <CeoClinicianSalesChart data={cliniciansalesdailyData} />;
            case 'expenseOverview':
                return (
                    <>
                        <ExpensePeriodComparison totalExpensesPeriodComparison={totalExpensesPeriodComparison} />
                        <MonthlyExpenseTrend monthlyExpenseTrend={monthlyExpenseTrend} />
                        <ExpensesByBranch expensesByBranch={expensesByBranch} />
                    </>
                );
            case 'expensePayments':
                return (
                    <>
                        <ExpensePaymentsSummary expensePaymentsSummary={expensePaymentsSummary} />
                        <ExpensePaymentsFullList expensePaymentsFullList={expensePaymentsFullList} />
                    </>
                );
            case 'expenseDetails':
                return (
                    <>
                        <ExpenseCategory allExpenseCategories={allExpenseCategories} />
                        <AllIndividualExpenses allIndividualExpenses={allIndividualExpenses} />
                        <ExpenseApprovalStatusSummary expenseApprovalStatusSummary={expenseApprovalStatusSummary} />
                        <TotalReimbursedPaidSummary totalReimbursedPaid={totalReimbursedPaid} />
                    </>
                );
            case 'departmentSegregation':
                return <DepartmentSegregation departmentSegregation={departmentSegregationData} />;
            case 'testsTransactions':
                return <DailyTestsTransactions aggregatedTestData={aggregatedTestData} ultrasoundTests={ultrasoundTests} labTests={labTests as unknown as any[]} />;
            case 'moneyCollection':
                return <EmployeeMoneyCollection employeesWhoCollectedCash={employeesWhoCollectedCash} />;
            default:
                return null;
        }
    };

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

            <div className={styles.layoutGrid}>
                <aside className={styles.sectionNav}>
                    <div className={styles.navHeader}>
                        <h2 className="fs-6 fw-semibold mb-0">Report Sections</h2>
                        <p className="small text-secondary mb-0">Tap a section to view</p>
                    </div>
                    <ul className={styles.sectionNavList}>
                        {sectionNavItems.map((section) => (
                            <li key={section.id} className={styles.sectionNavItem}>
                                <button
                                    type="button"
                                    className={`${styles.sectionNavButton} ${selectedSection === section.id ? styles.sectionNavButtonActive : ''}`}
                                    onClick={() => setSelectedSection(section.id)}
                                >
                                    <div>
                                        <div className="fw-semibold">{section.title}</div>
                                        <div className="small text-secondary">{section.subtitle}</div>
                                    </div>
                                    <span className="text-muted">›</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </aside>

                <section className={styles.sectionContent}>
                    {renderSelectedSection()}
                </section>
            </div>
        </main>
    );
}