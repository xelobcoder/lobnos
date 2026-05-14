import { RiPieChartLine, RiBankCardLine, RiCashLine, RiLineChartLine, RiHandCoinLine, RiMoneyDollarCircleLine } from '@remixicon/react'
import React from 'react'
import { Card } from 'react-bootstrap'
import { currencyFormatter } from '../../Auth/customFetch'

export type AnalyticCardProps = {
    title: string;
    value: number | string;
    Icon: React.ElementType;
    bgColor: string;
    iconColor: string;
    formatAsCurrency?: boolean;
};


const cardColors = {
    billedClients: { bg: "#4f46e5", icon: "#6366f1" },
    totalSales: { bg: "#059669", icon: "#0ea5e9" },
    amountPaid: { bg: "#dc2626", icon: "#10b981" },
    discount: { bg: "#7c3aed", icon: "#f59e0b" },
    pendingDebts: { bg: "#ea580c", icon: "#ef4444" },
    expenses: { bg: "#0891b2", icon: "#8b5cf6" },
    outstanding: { bg: "#c2410c", icon: "#f97316" },
};




export default function ExecutiveSummary({
    aggregatedSnapshot,
    dailyCeoSnapshot,
    ceoExpenseSummarySnapshot
}) {


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

    return (
        <div>
            <Card title="Executive Summary" icon={<RiPieChartLine />}>
                {/* Desktop Card View */}
                <div className="d-none d-md-block">
                    <div className="d-flex flex-row gap-3 mb-3">

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
                                title="Total Expenses Payments "
                                value={Number(dailyCeoSnapshot[0]?.total_expense_payments || 0)}
                                Icon={RiCashLine}
                                bgColor={cardColors.expenses.bg}
                                iconColor={cardColors.expenses.icon}
                            />
                        </div>

                        <div className="flex-fill" style={{ height: '150px' }}>
                            <AnalyticCard
                                title="Net Revenue"
                                value={Number(aggregatedSnapshot.net_revenue || 0)}
                                Icon={RiMoneyDollarCircleLine}
                                bgColor={cardColors.totalSales.bg}
                                iconColor={cardColors.totalSales.icon}
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
                                    {currencyFormatter.format(Number(ceoExpenseSummarySnapshot[0]?.total_expenses_amount || 0))}
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
        </div>
    )
}
