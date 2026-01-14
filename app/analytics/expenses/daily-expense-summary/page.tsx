"use client";

import { customFetch, currencyFormatter } from "../../../../components/Auth/customFetch";
import { useApplication } from "../../../../components/Auth/useApplicationContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";
import { RiBarChartBoxLine, RiLineChartLine, RiBubbleChartLine, RiLoader4Line, RiErrorWarningLine, RiInbox2Line, RiCalendarEventLine, RiRefreshLine } from "@remixicon/react";
import { useState, useEffect } from "react";
import dayjs from "dayjs";

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';

interface DailyExpenseData {
    expense_date: string;
    total_expenses: string;
    expense_count: number;
    avg_expense_amount: string;
    unique_employees: number;
    unique_merchants: number;
}

export default function DailyExpenseSummary() {
    const [data, setData] = useState<DailyExpenseData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState(() => {
        const currentYear = new Date().getFullYear();
        return `${currentYear}-01-01`;
    });
    const [endDate, setEndDate] = useState(() => {
        const currentYear = new Date().getFullYear();
        return `${currentYear}-12-31`;
    });
    const [chartType, setChartType] = useState<"bar" | "line" | "area">("bar");
    const [showModal, setShowModal] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<any>(null);
    const [breakdownData, setBreakdownData] = useState<any[]>([]);
    const [breakdownLoading, setBreakdownLoading] = useState(false);

    const { branchid, user } = useApplication();

    const handleResetFilters = () => {
        const currentYear = new Date().getFullYear();
        setStartDate(`${currentYear}-01-01`);
        setEndDate(`${currentYear}-12-31`);
    };

    const fetchBreakdown = async (date: string) => {
        setBreakdownLoading(true);
        try {
            const endpoint = `expenses/analytics/breakdown-admin-level?startDate=${date}&endDate=${date}`;
            const response = await customFetch(endpoint);
            if (response?.status === 'success' && response?.statusCode === 200) {
                setBreakdownData(response.data || response.result || []);
            } else {
                setBreakdownData([]);
            }
        } catch (error) {
            setBreakdownData([]);
        } finally {
            setBreakdownLoading(false);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const endpoint = `expenses/analytics/daily?branchid=${branchid}${startDate ? `&startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate}` : ''}`;
            const response = await customFetch(endpoint);
            const { data } = response;
            if (response && Array.isArray(data)) {
                setData(data);
            } else {
                setError("Invalid data format received");
            }
        } catch (err: any) {
            setError(err.message || "Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (branchid) {
            fetchData();
        }
        // eslint-disable-next-line
    }, [branchid]);

    const chartData = data.map(item => ({
        ...item,
        total_amount: parseFloat(item.total_expenses),
        average_amount: parseFloat(item.avg_expense_amount),
        dateLabel: dayjs(item.expense_date).format('DD-MM-YYYY')
    }));

    const totalAmountSum = chartData.reduce((sum, entry) => sum + entry.total_amount, 0);
    const totalExpensesSum = chartData.reduce((sum, entry) => sum + entry.expense_count, 0);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const entry = payload[0].payload;
            return (
                <div
                    className="rounded-lg border p-2 shadow-sm"
                    style={{
                        backgroundColor: 'var(--bs-body-bg)',
                        borderColor: COLOR_BORDER,
                        minWidth: '180px',
                        fontSize: '0.85rem',
                        color: 'var(--bs-body-color)'
                    }}
                >
                    <div className="mb-1">
                        <span className="text-xs fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Date</span>
                        <span className="fw-bold d-block">{entry.dateLabel}</span>
                    </div>
                    <div className="mb-1">
                        <span className="text-xs fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Total Amount</span>
                        <span className="fw-bold d-block" style={{ color: COLOR_ACCENT }}>{currencyFormatter.format(entry.total_amount)}</span>
                    </div>
                    <div className="mb-1">
                        <span className="text-xs fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Total Expenses</span>
                        <span className="fw-bold d-block">{entry.expense_count}</span>
                    </div>
                    <div className="mb-1">
                        <span className="text-xs fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Merchants</span>
                        <span className="fw-bold d-block">{entry.unique_merchants}</span>
                    </div>
                    <div>
                        <span className="text-xs fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Employees</span>
                        <span className="fw-bold d-block">{entry.unique_employees}</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderChart = () => {
        const commonProps = {
            data: chartData,
            margin: { top: 5, right: 5, left: 20, bottom: 45 },
        };
        const xAxisProps = {
            dataKey: "dateLabel",
            angle: -45,
            textAnchor: "end" as const,
            height: 60,
            interval: 0 as const,
            tick: { fontSize: 11, fill: COLOR_TEXT_MUTED },
            axisLine: { stroke: COLOR_BORDER },
            tickLine: { stroke: COLOR_BORDER },
        };
        const yAxisProps = {
            tickFormatter: (value: number) => currencyFormatter.format(value),
            tick: { fontSize: 11, fill: COLOR_TEXT_MUTED },
            axisLine: false,
            tickLine: false,
            width: 95,
        };
        const legendProps = {
            verticalAlign: "top" as const,
            align: "right" as const,
            iconType: "circle" as const,
            iconSize: 8,
            wrapperStyle: { fontSize: '13px', color: 'var(--bs-body-color)', paddingBottom: '15px' }
        };

        if (chartType === "bar") {
            return (
                <BarChart {...commonProps}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                    <XAxis {...xAxisProps} />
                    <YAxis {...yAxisProps} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                    <Legend {...legendProps} />
                    <Bar dataKey="total_amount" name="Total Amount" fill={COLOR_ACCENT} radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
            );
        }
        if (chartType === "line") {
            return (
                <LineChart {...commonProps}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                    <XAxis {...xAxisProps} />
                    <YAxis {...yAxisProps} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                    <Legend {...legendProps} />
                    <Line type="monotone" dataKey="total_amount" name="Total Amount" stroke={COLOR_ACCENT} strokeWidth={2} dot={{ r: 3, strokeWidth: 1, fill: COLOR_ACCENT }} activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_ACCENT, stroke: COLOR_TOOLTIP_BG }} />
                </LineChart>
            );
        }
        return (
            <AreaChart {...commonProps}>
                <defs>
                    <linearGradient id="colorTotalSpentFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLOR_ACCENT} stopOpacity={0.5} />
                        <stop offset="95%" stopColor={COLOR_ACCENT} stopOpacity={0.05} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                <Legend {...legendProps} />
                <Area type="monotone" dataKey="total_amount" name="Total Amount" stroke={COLOR_ACCENT} fill="url(#colorTotalSpentFill)" strokeWidth={2} dot={{ r: 3, strokeWidth: 1, fill: COLOR_ACCENT }} activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_ACCENT, stroke: COLOR_TOOLTIP_BG }} />
            </AreaChart>
        );
    };

    const viewButtons = [
        { type: "bar" as const, icon: RiBarChartBoxLine, label: "Bar" },
        { type: "line" as const, icon: RiLineChartLine, label: "Line" },
        { type: "area" as const, icon: RiBubbleChartLine, label: "Area" },
    ];

    return (
        <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
            <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                    <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                        <RiBarChartBoxLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                        Daily Expense Summary
                    </h2>
                    <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                        <div className="btn-group btn-group-sm" role="group" aria-label="Chart type">
                            {viewButtons.map(btn => (
                                <button
                                    key={btn.type}
                                    type="button"
                                    className={`btn ${chartType === btn.type ? 'btn-primary active' : 'btn-outline-secondary'}`}
                                    onClick={() => setChartType(btn.type)}
                                    style={chartType === btn.type ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
                                >
                                    <btn.icon size={16} className="me-1 align-text-bottom" /> {btn.label}
                                </button>
                            ))}
                        </div>
                        <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
                            <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                                <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER, paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
                                    <RiCalendarEventLine size={16} className="text-muted" style={{ color: COLOR_TEXT_MUTED }} />
                                </span>
                                <input id="startDateDES" type="date" className="form-control shadow-none border-start-0" value={startDate} onChange={e => setStartDate(e.target.value)} aria-label="Start Date" style={{ fontSize: '0.875rem', borderColor: COLOR_BORDER, paddingLeft: '0.3rem' }} />
                            </div>
                            <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                                <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER, paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
                                    <RiCalendarEventLine size={16} className="text-muted" style={{ color: COLOR_TEXT_MUTED }} />
                                </span>
                                <input id="endDateDES" type="date" className="form-control shadow-none border-start-0" value={endDate} onChange={e => setEndDate(e.target.value)} aria-label="End Date" style={{ fontSize: '0.875rem', borderColor: COLOR_BORDER, paddingLeft: '0.3rem' }} />
                            </div>
                            <button onClick={fetchData} className="btn btn-sm btn-primary d-flex align-items-center" type="button" aria-label="Load data" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem', whiteSpace: 'nowrap' }}>
                                <RiRefreshLine size={16} className="me-1" /> Load Data
                            </button>
                            <button onClick={handleResetFilters} className="btn btn-sm btn-outline-secondary d-flex align-items-center" type="button" aria-label="Reset date filters" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
                                <RiRefreshLine size={16} className="me-1" /> Reset
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card-body p-3 p-md-4">
                {loading ? (
                    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}>
                        <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                        <p className="text-muted" style={{ color: COLOR_TEXT_MUTED }}>Loading data...</p>
                    </div>
                ) : error ? (
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                        <RiErrorWarningLine size={48} className="mb-3 text-danger" />
                        <h5 className="fw-medium mb-1">Error Loading Data</h5>
                        <p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>{error}</p>
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                        <RiInbox2Line size={48} className="mb-3 text-muted" style={{ color: COLOR_TEXT_MUTED }} />
                        <h5 className="fw-medium mb-1">No Data Available</h5>
                        <p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>
                            No daily expense data for the selected period or branch.
                        </p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={350}>
                        {renderChart()}
                    </ResponsiveContainer>
                )}
            </div>
            {chartData.length > 0 && (
                <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{ borderTop: `1px solid ${COLOR_BORDER}` }}>
                    <div className="print-date-range" style={{ display: 'none' }}>
                        Daily Expenses Report Period: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                        <h4 className="fs-6 fw-medium mb-3">
                            Daily Expense Table
                        </h4>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => window.print()}>
                            Print
                        </button>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-sm table-hover table-striped small printable-table-with-borders">
                            <thead className="sticky-top bg-body-tertiary">
                                <tr>
                                    <th scope="col" className="py-2 text-start">Date</th>
                                    <th scope="col" className="py-2 text-start">Total Amount</th>
                                    <th scope="col" className="py-2 text-start">Expense Count</th>
                                    <th scope="col" className="py-2 text-start">Employees</th>
                                    <th scope="col" className="py-2 text-start">Merchants</th>
                                    <th scope="col" className="py-2 text-start">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {chartData.map((entry, idx) => (
                                    <tr key={idx}>
                                        <td className="py-2 text-start">{entry.dateLabel}</td>
                                        <td className="py-2 text-start fw-medium">{currencyFormatter.format(entry.total_amount)}</td>
                                        <td className="py-2 text-start">{entry.expense_count}</td>
                                        <td className="py-2 text-start">{entry.unique_employees}</td>
                                        <td className="py-2 text-start">{entry.unique_merchants}</td>
                                        <td className="py-2 text-start">
                                            <button className="btn btn-sm btn-outline-secondary" onClick={() => { setSelectedEntry(entry); setShowModal(true); fetchBreakdown(entry.expense_date); }}>
                                                Break Down
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="fw-bold border-top">
                                    <td className="py-2 text-start">Total</td>
                                    <td className="py-2 text-start">{currencyFormatter.format(totalAmountSum)}</td>
                                    <td className="py-2 text-start">{totalExpensesSum}</td>
                                    <td className="py-2 text-start">{chartData.reduce((sum, entry) => sum + entry.unique_employees, 0)}</td>
                                    <td className="py-2 text-start">{chartData.reduce((sum, entry) => sum + entry.unique_merchants, 0)}</td>
                                    <td className="py-2 text-start"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}
            {showModal && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-fullscreen">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Expense Breakdown for {selectedEntry?.dateLabel}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                {breakdownLoading ? (
                                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                                        <div className="animate-spin" style={{ fontSize: '2rem', color: 'var(--bs-primary)' }}></div>
                                        <span className="ms-2">Loading breakdown...</span>
                                    </div>
                                ) : breakdownData && breakdownData.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-sm table-striped">
                                            <thead>
                                                <tr>
                                                    <th>Expense ID</th>
                                                    <th>Expense Description</th>
                                                    <th>Amount</th>
                                                    <th>Category</th>
                                                    <th>Requested By</th>
                                                    <th>Merchant</th>
                                                    <th>Branch</th>
                                                    <th>Expense Date</th>
                                                    <th>Approval Status</th>
                                                    <th>Approved Date</th>
                                                    <th>Approved By</th>
                                                    <th>Payment Status</th>
                                                    <th>Payment Method</th>
                                                    <th>Payment Date</th>
                                                    <th>Payment Amount</th>
                                                    <th>Payment Created By</th>
                                                    <th>Invoice Status</th>
                                                    <th>Invoice Number</th>
                                                    <th>Invoice Date</th>
                                                    <th>Invoice Total</th>
                                                    <th>Invoice Tax</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Array.isArray(breakdownData) && breakdownData.map((expense: any, index: number) => (
                                                    <tr key={index}>
                                                        <td>{expense.expense_id}</td>
                                                        <td>{expense.expense_description}</td>
                                                        <td>{currencyFormatter.format(expense.expense_amount)}</td>
                                                        <td>{expense.category_name || `Category ${expense.expense_category}`}</td>
                                                        <td>{expense.employee_name}</td>
                                                        <td>{expense.merchant_name}</td>
                                                        <td>{expense.branch_name}</td>
                                                        <td>{new Date(expense.expense_date).toLocaleDateString()}</td>
                                                        <td>
                                                            <span className={`badge ${expense.is_approved === 1 ? 'bg-success' : expense.is_approved === 2 ? 'bg-warning' : 'bg-secondary'}`}>
                                                                {expense.is_approved === 1 ? 'Approved' : expense.is_approved === 2 ? 'Pending' : 'Rejected'}
                                                            </span>
                                                        </td>
                                                        <td>{expense.approved_date ? new Date(expense.approved_date).toLocaleDateString() : 'N/A'}</td>
                                                        <td>{expense.approved_by_username || 'N/A'}</td>
                                                        <td>
                                                            <span className={`badge ${expense.payment_status === 'Paid' ? 'bg-success' : expense.payment_status === 'Pending' ? 'bg-warning' : 'bg-secondary'}`}>
                                                                {expense.payment_status || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td>{expense.payment_method || 'N/A'}</td>
                                                        <td>{expense.payment_date ? new Date(expense.payment_date).toLocaleDateString() : 'N/A'}</td>
                                                        <td>{expense.payment_amount ? currencyFormatter.format(expense.payment_amount) : 'N/A'}</td>
                                                        <td>{expense.payment_created_by_username || 'N/A'}</td>
                                                        <td>
                                                            <span className={`badge ${expense.invoice_status === 'Paid' ? 'bg-success' : expense.invoice_status === 'Pending' ? 'bg-warning' : 'bg-secondary'}`}>
                                                                {expense.invoice_status || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td>{expense.invoice_number || 'N/A'}</td>
                                                        <td>{expense.invoice_date ? new Date(expense.invoice_date).toLocaleDateString() : 'N/A'}</td>
                                                        <td>{expense.invoice_total ? currencyFormatter.format(expense.invoice_total) : 'N/A'}</td>
                                                        <td>{expense.invoice_tax ? currencyFormatter.format(expense.invoice_tax) : 'N/A'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p>No breakdown data available for this date.</p>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <style jsx global>{`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .table-responsive thead.sticky-top th {
                    border-bottom: 2px solid var(--bs-border-color); 
                }
                .table-responsive thead th {
                    font-weight: bold !important;
                    color: #000 !important;
                }
                @media print {
                    .printable-table-with-borders tbody tr {
                        border: none !important;
                        border-bottom: 2px solid #000 !important;
                    }
                    .printable-table-with-borders tbody tr:nth-child(odd) {
                        background-color: #f8f9fa !important;
                    }
                    .printable-table-with-borders th,
                    .printable-table-with-borders td {
                        padding: 0.25rem 0.5rem !important;
                    }
                }
            `}</style>
        </div>
    );
}
