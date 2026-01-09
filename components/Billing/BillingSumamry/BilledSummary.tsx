"use client";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { customFetch, currencyFormatter } from "../../Auth/customFetch";
import { RiFileList3Line, RiWalletLine, RiRefund2Line, RiAccountCircleLine, RiCheckboxCircleLine, RiAlarmWarningLine, RiMoneyDollarCircleLine, RiBarChartLine, RiEyeLine, RiEyeOffLine } from "@remixicon/react";
import { useApplication } from "../../Auth/useApplicationContext";

const COLOR_BORDER = 'var(--bs-border-color)';

interface Summary {
	totalTransactionCost: number;
	totalCost: number;
	actualRevenue: number;
	accruedRevenue: number;
	totalRefunded: number;
	totalBalance: number;
	totalDiscount: number;
	totalOutstanding: number;
	totalTaxIncurred: number;
	transactionCount: number;
	totalExpensePayments?: number;
	netRevenue?: number;
}

interface Branch {
	branchid: number;
	name: string;
	date: string;
	activation: number;
	address: string;
	email: string;
	contact: number;
	managerid: string;
}

const _default: Summary = {
	totalTransactionCost: 0,
	totalCost: 0,
	actualRevenue: 0,
	accruedRevenue: 0,
	totalRefunded: 0,
	totalBalance: 0,
	totalDiscount: 0,
	totalOutstanding: 0,
	totalTaxIncurred: 0,
	transactionCount: 0,
	totalExpensePayments: 0,
	netRevenue: 0,
};

export type AnalyticCardProps = {
	title: string;
	value: number;
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
		className="border-0 rounded shadow-sm p-4 h-100"
		style={{
			backgroundColor: bgColor,
			transition: 'all 0.2s',
			cursor: 'pointer',
			minHeight: '130px',
			color: 'white'
		}}
		onMouseEnter={(e) => {
			e.currentTarget.style.transform = "translateY(-2px)";
			e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.15)";
		}}
		onMouseLeave={(e) => {
			e.currentTarget.style.transform = "translateY(0)";
			e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
		}}
	>
		<div className="d-flex align-items-center mb-3">
			<div style={{ color: 'white' }} className="me-2">
				<Icon size={32} />
			</div>
			<h6 className="mb-0 fw-semibold" style={{ fontSize: "0.9rem", color: 'rgba(255,255,255,0.95)' }}>
				{title}
			</h6>
		</div>
		<div className="fw-bold" style={{ fontSize: "1.6rem", color: 'white' }}>
			{formatAsCurrency ? currencyFormatter.format(Number(value) || 0) : value.toLocaleString()}
		</div>
	</div>
);

const cardColors = {
	totalCost: { bg: "#4f46e5", icon: "#6366f1" }, // Indigo
	transactionCount: { bg: "#0891b2", icon: "#06b6d4" }, // Cyan
	outstanding: { bg: "#ea580c", icon: "#f97316" }, // Orange
	refunded: { bg: "#be123c", icon: "#e11d48" }, // Crimson
	expenses: { bg: "#dc2626", icon: "#ef4444" }, // Red
	accrued: { bg: "#7c3aed", icon: "#8b5cf6" }, // Violet
	actual: { bg: "#059669", icon: "#10b981" }, // Emerald
	net: { bg: "#16a34a", icon: "#22c55e" }, // Green
};

type PropsQuery = {
	branchid: string;
	from?: string;
	to?: string;
	summary?: Summary;
};

export default function BilledSummary({ branchid, from, to, summary }: PropsQuery) {
	const [internalSummary, setInternalSummary] = useState<Summary>(summary || _default);
	const [branch, setBranch] = useState<Branch | null>(null);
	const [isVisible, setIsVisible] = useState<boolean>(true);
	const role = useApplication()?.user?.role;
	const isAdmin = role === "admin" || role === "manager";

	useEffect(() => {
		if (summary) {
			setInternalSummary(summary);
			return;
		}
		async function fetchSummary() {
			try {
				const data = await customFetch(
					`summary/daily?branchid=${branchid}&from=${from}&to=${to}`
				);
				setInternalSummary(data.summary);
				setBranch(data.branch);
			} catch (err) {
				toast.error("Something went wrong", {
					autoClose: 3000,
					position: "bottom-right",
				});
				setInternalSummary(_default);
				setBranch(null);
			}
		}
		fetchSummary();
	}, [branchid, from, to, summary]);

	return (
		<div className="p-3 border border-1 rounded" >
			<div className="mb-3">
				<div className="d-flex justify-content-between align-items-center">
					<div>
						<h5 className="mb-1 fw-semibold text-dark">Financial Summary</h5>
						{branch && (
							<div className="d-flex align-items-center gap-2">
								<span className="text-muted small">Branch:</span>
								<span className="fw-medium text-dark">{branch.name}</span>
								<span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 small">
									Active
								</span>
							</div>
						)}
					</div>
					{isAdmin && (
						<button
							className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"
							onClick={() => setIsVisible(!isVisible)}
						>
							{isVisible ? (
								<>
									<RiEyeOffLine size={16} /> Hide Summary
								</>
							) : (
								<>
									<RiEyeLine size={16} /> Show Summary
								</>
							)}
						</button>
					)}
				</div>
			</div>
			{isVisible && isAdmin && (
				<>
					{/* Desktop Card View */}
					<div className="d-none d-md-flex flex-column gap-3">
						{/* First Row - 5 Cards */}
						<div className="row g-3">
							<div className="col-md-6 col-lg-3">
								<AnalyticCard
									title="Total Cost"
									value={internalSummary.totalCost}
									Icon={RiFileList3Line}
									bgColor={cardColors.totalCost.bg}
									iconColor={cardColors.totalCost.icon}
								/>
							</div>
							<div className="col-md-6 col-lg-3">
								<AnalyticCard
									title="Tran. Count"
									value={internalSummary.transactionCount}
									Icon={RiAccountCircleLine}
									bgColor={cardColors.transactionCount.bg}
									iconColor={cardColors.transactionCount.icon}
									formatAsCurrency={false}
								/>
							</div>
							<div className="col-md-6 col-lg-3">
								<AnalyticCard
									title="Total Outstanding"
									value={internalSummary.totalOutstanding}
									Icon={RiAlarmWarningLine}
									bgColor={cardColors.outstanding.bg}
									iconColor={cardColors.outstanding.icon}
								/>
							</div>
							<div className="col-md-6 col-lg-3">
								<AnalyticCard
									title="Total Refunded"
									value={internalSummary.totalRefunded}
									Icon={RiRefund2Line}
									bgColor={cardColors.refunded.bg}
									iconColor={cardColors.refunded.icon}
								/>
							</div>

						</div>

						{/* Second Row - Revenue Cards (Accrued → Actual → Net) */}
						<div className="row g-3">
							{internalSummary.totalExpensePayments !== undefined && (
								<div className="col-md-6 col-lg-3">
									<AnalyticCard
										title="Total Expenses"
										value={internalSummary.totalExpensePayments}
										Icon={RiMoneyDollarCircleLine}
										bgColor={cardColors.expenses.bg}
										iconColor={cardColors.expenses.icon}
									/>
								</div>
							)}

							<div className="col-md-6 col-lg-3">
								<AnalyticCard
									title="Accrued Revenue"
									value={internalSummary.accruedRevenue}
									Icon={RiWalletLine}
									bgColor={cardColors.accrued.bg}
									iconColor={cardColors.accrued.icon}
								/>
							</div>

							<div className="col-md-6 col-lg-3">
								<AnalyticCard
									title="Actual Revenue"
									value={internalSummary.actualRevenue}
									Icon={RiCheckboxCircleLine}
									bgColor={cardColors.actual.bg}
									iconColor={cardColors.actual.icon}
								/>
							</div>
							{internalSummary.netRevenue !== undefined && (
								<div className="col-md-6 col-lg-3">
									<AnalyticCard
										title="Net Revenue"
										value={internalSummary.netRevenue}
										Icon={RiBarChartLine}
										bgColor={cardColors.net.bg}
										iconColor={cardColors.net.icon}
									/>
								</div>
							)}

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
												background: cardColors.totalCost.bg,
												padding: "4px",
												borderRadius: "4px",
												width: "24px",
												height: "24px",
											}}
										>
											<RiFileList3Line style={{ fontSize: "0.8rem", color: "white" }} />
										</div>
										<span className="small fw-medium text-muted">Total Cost</span>
									</div>
									<span className="fw-semibold text-dark small">
										{currencyFormatter.format(Number(internalSummary.totalCost) || 0)}
									</span>
								</div>
							</div>

							<div className="list-group-item px-3 py-2 border-0">
								<div className="d-flex justify-content-between align-items-center">
									<div className="d-flex align-items-center gap-2">
										<div
											className="d-flex align-items-center justify-content-center"
											style={{
												background: cardColors.actual.bg,
												padding: "4px",
												borderRadius: "4px",
												width: "24px",
												height: "24px",
											}}
										>
											<RiCheckboxCircleLine style={{ fontSize: "0.8rem", color: "white" }} />
										</div>
										<span className="small fw-medium text-muted">Actual Revenue</span>
									</div>
									<span className="fw-semibold text-dark small">
										{currencyFormatter.format(Number(internalSummary.actualRevenue) || 0)}
									</span>
								</div>
							</div>

							<div className="list-group-item px-3 py-2 border-0">
								<div className="d-flex justify-content-between align-items-center">
									<div className="d-flex align-items-center gap-2">
										<div
											className="d-flex align-items-center justify-content-center"
											style={{
												background: cardColors.accrued.bg,
												padding: "4px",
												borderRadius: "4px",
												width: "24px",
												height: "24px",
											}}
										>
											<RiWalletLine style={{ fontSize: "0.8rem", color: "white" }} />
										</div>
										<span className="small fw-medium text-muted">Accrued Revenue</span>
									</div>
									<span className="fw-semibold text-dark small">
										{currencyFormatter.format(Number(internalSummary.accruedRevenue) || 0)}
									</span>
								</div>
							</div>

							<div className="list-group-item px-3 py-2 border-0">
								<div className="d-flex justify-content-between align-items-center">
									<div className="d-flex align-items-center gap-2">
										<div
											className="d-flex align-items-center justify-content-center"
											style={{
												background: cardColors.outstanding.bg,
												padding: "4px",
												borderRadius: "4px",
												width: "24px",
												height: "24px",
											}}
										>
											<RiAlarmWarningLine style={{ fontSize: "0.8rem", color: "white" }} />
										</div>
										<span className="small fw-medium text-muted">Total Outstanding</span>
									</div>
									<span className="fw-semibold text-dark small">
										{currencyFormatter.format(Number(internalSummary.totalOutstanding) || 0)}
									</span>
								</div>
							</div>

							<div className="list-group-item px-3 py-2 border-0">
								<div className="d-flex justify-content-between align-items-center">
									<div className="d-flex align-items-center gap-2">
										<div
											className="d-flex align-items-center justify-content-center"
											style={{
												background: cardColors.refunded.bg,
												padding: "4px",
												borderRadius: "4px",
												width: "24px",
												height: "24px",
											}}
										>
											<RiRefund2Line style={{ fontSize: "0.8rem", color: "white" }} />
										</div>
										<span className="small fw-medium text-muted">Total Refunded</span>
									</div>
									<span className="fw-semibold text-dark small">
										{currencyFormatter.format(Number(internalSummary.totalRefunded) || 0)}
									</span>
								</div>
							</div>

							{internalSummary.totalExpensePayments !== undefined && (
								<div className="list-group-item px-3 py-2 border-0">
									<div className="d-flex justify-content-between align-items-center">
										<div className="d-flex align-items-center gap-2">
											<div
												className="d-flex align-items-center justify-content-center"
												style={{
													background: cardColors.expenses.bg,
													padding: "4px",
													borderRadius: "4px",
													width: "24px",
													height: "24px",
												}}
											>
												<RiMoneyDollarCircleLine style={{ fontSize: "0.8rem", color: "white" }} />
											</div>
											<span className="small fw-medium text-muted">Total Expenses</span>
										</div>
										<span className="fw-semibold text-dark small">
											{currencyFormatter.format(Number(internalSummary.totalExpensePayments) || 0)}
										</span>
									</div>
								</div>
							)}

							{internalSummary.netRevenue !== undefined && (
								<div className="list-group-item px-3 py-2 border-0">
									<div className="d-flex justify-content-between align-items-center">
										<div className="d-flex align-items-center gap-2">
											<div
												className="d-flex align-items-center justify-content-center"
												style={{
													background: cardColors.net.bg,
													padding: "4px",
													borderRadius: "4px",
													width: "24px",
													height: "24px",
												}}
											>
												<RiBarChartLine style={{ fontSize: "0.8rem", color: "white" }} />
											</div>
											<span className="small fw-medium text-muted">Net Revenue</span>
										</div>
										<span className={`fw-semibold small ${internalSummary.netRevenue >= 0 ? 'text-success' : 'text-danger'}`}>
											{currencyFormatter.format(Number(internalSummary.netRevenue) || 0)}
										</span>
									</div>
								</div>
							)}

							<div className="list-group-item px-3 py-2 border-0">
								<div className="d-flex justify-content-between align-items-center">
									<div className="d-flex align-items-center gap-2">
										<div
											className="d-flex align-items-center justify-content-center"
											style={{
												background: cardColors.transactionCount.bg,
												padding: "4px",
												borderRadius: "4px",
												width: "24px",
												height: "24px",
											}}
										>
											<RiAccountCircleLine style={{ fontSize: "0.8rem", color: "white" }} />
										</div>
										<span className="small fw-medium text-muted">Transaction Count</span>
									</div>
									<span className="fw-semibold text-dark small">
										{internalSummary.transactionCount.toLocaleString()}
									</span>
								</div>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
}