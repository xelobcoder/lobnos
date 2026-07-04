"use client";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { customFetch, currencyFormatter } from "../../Auth/customFetch";
import { RiFileList3Line, RiWalletLine, RiRefund2Line, RiCheckboxCircleLine, RiAlarmWarningLine, RiMoneyDollarCircleLine, RiBarChartLine, RiEyeLine, RiEyeOffLine, RiCheckLine } from "@remixicon/react";
import { useApplication } from "../../Auth/useApplicationContext";

const COLOR_BORDER = 'var(--bs-border-color)';

interface Summary {
	date?: string;
	gross_revenue: string | number;
	cash_collected: string | number;
	earned_revenue: string | number;
	discount: string | number;
	total_refunded: string | number;
	transactioncount?: number;
	expenses_paid: string | number;
	net_operating_cash: string | number;
	outstanding: string | number;
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
	date: '',
	gross_revenue: '0.00',
	cash_collected: '0.00',
	earned_revenue: '0.00',
	discount: '0.00',
	total_refunded: '0.00',
	transactioncount: 0,
	expenses_paid: '0.00',
	net_operating_cash: '0.00',
	outstanding: '0.00',
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
	totalCost: { bg: "#4f46e5", icon: "#6366f1" }, 
	outstanding: { bg: "#ea580c", icon: "#f97316" }, // Orange
	refunded: { bg: "#be123c", icon: "#e11d48" }, // Crimson
	expenses: { bg: "#dc2626", icon: "#ef4444" }, // Red
	accrued: { bg: "#7c3aed", icon: "#8b5cf6" }, // Violet
	actual: { bg: "#059669", icon: "#10b981" }, // Emerald
	net: { bg: "#16a34a", icon: "#22c55e" }, // Green
	discount: { bg: "#f59e0b", icon: "#fbbf24" }, // Amber
	transactionCount: { bg: "#0891b2", icon: "#06b6d4" }, // Cyan
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
	const isAdmin = role === "admin" || role === "manager"

	useEffect(() => {
		if (summary) {
			const summaryToUse = Array.isArray(summary) ? summary[0] : summary;
			setInternalSummary(summaryToUse || _default);
			return;
		}
		async function fetchSummary() {
			try {
				const data = await customFetch(
					`summary/daily?branchid=${branchid}&from=${from}&to=${to}`
				);
				if (data && data?.summary && Array.isArray(data.summary) && data.summary.length > 0) {
					setInternalSummary(data.summary[0]); 
				}
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
					<h5 className=" fw-bold">Transactions Count: {Number(internalSummary.transactioncount || 0).toLocaleString()}</h5>
					<div className="d-flex align-items-center gap-2">
						
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
			</div>
			{isVisible && (
				<>
					{/* Desktop Card View */}
					<div className="d-none d-md-flex flex-column gap-3">
						{/* First Row - 4 Cards */}
						<div className="row g-3">
							<div className="col-md-6 col-lg-3">
								<AnalyticCard
									title="Gross Revenue"
									value={Number(internalSummary.gross_revenue)}
									Icon={RiFileList3Line}
									bgColor={cardColors.totalCost.bg}
									iconColor={cardColors.totalCost.icon}
								/>
							</div>
							<div className="col-md-6 col-lg-3">
								<AnalyticCard
									title="Cash Collected"
									value={Number(internalSummary.cash_collected)}
									Icon={RiWalletLine}
									bgColor={cardColors.actual.bg}
									iconColor={cardColors.actual.icon}
								/>
							</div>
							<div className="col-md-6 col-lg-3">
								<AnalyticCard
									title="Outstanding"
									value={Number(internalSummary.outstanding)}
									Icon={RiAlarmWarningLine}
									bgColor={cardColors.outstanding.bg}
									iconColor={cardColors.outstanding.icon}
								/>
							</div>
							<div className="col-md-6 col-lg-3">
								<AnalyticCard
									title="Total Refunded"
									value={Number(internalSummary.total_refunded)}
									Icon={RiRefund2Line}
									bgColor={cardColors.refunded.bg}
									iconColor={cardColors.refunded.icon}
								/>
							</div>
						</div>

						{/* Second Row - 4 Cards */}
						<div className="row g-3">
							<div className="col-md-6 col-lg-3">
								<AnalyticCard
									title="Expenses Paid"
									value={Number(internalSummary.expenses_paid)}
									Icon={RiMoneyDollarCircleLine}
									bgColor={cardColors.expenses.bg}
									iconColor={cardColors.expenses.icon}
								/>
							</div>
							<div className="col-md-6 col-lg-3">
								<AnalyticCard
									title="Earned Revenue"
									value={Number(internalSummary.earned_revenue)}
									Icon={RiCheckboxCircleLine}
									bgColor={cardColors.accrued.bg}
									iconColor={cardColors.accrued.icon}
								/>
							</div>
							<div className="col-md-6 col-lg-3">
								<AnalyticCard
									title="Discount"
									value={Number(internalSummary.discount)}
									Icon={RiRefund2Line}
									bgColor={cardColors.discount.bg}
									iconColor={cardColors.discount.icon}
								/>
							</div>
							<div className="col-md-6 col-lg-3">
								<AnalyticCard
									title="Net Operating Cash"
									value={Number(internalSummary.net_operating_cash)}
									Icon={RiBarChartLine}
									bgColor={cardColors.net.bg}
									iconColor={cardColors.net.icon}
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
												background: cardColors.totalCost.bg,
												padding: "4px",
												borderRadius: "4px",
												width: "24px",
												height: "24px",
											}}
										>
											<RiFileList3Line style={{ fontSize: "0.8rem", color: "white" }} />
										</div>
										<span className="small fw-medium text-muted">Gross Revenue</span>
									</div>
									<span className="fw-semibold text-dark small">
										{currencyFormatter.format(Number(internalSummary.gross_revenue) || 0)}
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
											<RiWalletLine style={{ fontSize: "0.8rem", color: "white" }} />
										</div>
										<span className="small fw-medium text-muted">Cash Collected</span>
									</div>
									<span className="fw-semibold text-dark small">
										{currencyFormatter.format(Number(internalSummary.cash_collected) || 0)}
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
											<RiCheckboxCircleLine style={{ fontSize: "0.8rem", color: "white" }} />
										</div>
										<span className="small fw-medium text-muted">Earned Revenue</span>
									</div>
									<span className="fw-semibold text-dark small">
										{currencyFormatter.format(Number(internalSummary.earned_revenue) || 0)}
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
										<span className="small fw-medium text-muted">Outstanding</span>
									</div>
									<span className="fw-semibold text-dark small">
										{currencyFormatter.format(Number(internalSummary.outstanding) || 0)}
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
										{currencyFormatter.format(Number(internalSummary.total_refunded) || 0)}
									</span>
								</div>
							</div>

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
										<span className="small fw-medium text-muted">Expenses Paid</span>
									</div>
									<span className="fw-semibold text-dark small">
										{currencyFormatter.format(Number(internalSummary.expenses_paid) || 0)}
									</span>
								</div>
							</div>

							<div className="list-group-item px-3 py-2 border-0">
								<div className="d-flex justify-content-between align-items-center">
									<div className="d-flex align-items-center gap-2">
										<div
											className="d-flex align-items-center justify-content-center"
											style={{
												background: cardColors.discount.bg,
												padding: "4px",
												borderRadius: "4px",
												width: "24px",
												height: "24px",
											}}
										>
											<RiRefund2Line style={{ fontSize: "0.8rem", color: "white" }} />
										</div>
										<span className="small fw-medium text-muted">Discount</span>
									</div>
									<span className="fw-semibold text-dark small">
										{currencyFormatter.format(Number(internalSummary.discount) || 0)}
									</span>
								</div>
							</div>

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
										<span className="small fw-medium text-muted">Net Operating Cash</span>
									</div>
									<span className={`fw-semibold small ${Number(internalSummary.net_operating_cash) >= 0 ? 'text-success' : 'text-danger'}`}>
										{currencyFormatter.format(Number(internalSummary.net_operating_cash) || 0)}
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