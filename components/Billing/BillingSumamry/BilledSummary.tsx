"use client";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { customFetch, currencyFormatter } from "../../Auth/customFetch";
import { RiFileList3Line, RiWalletLine, RiRefund2Line, RiCheckboxCircleLine, RiAlarmWarningLine, RiMoneyDollarCircleLine, RiBarChartLine, RiEyeLine, RiEyeOffLine, RiCheckLine } from "@remixicon/react";
import { useApplication } from "../../Auth/useApplicationContext";
import { Card } from "react-bootstrap";

const COLOR_BORDER = 'var(--bs-border-color)';

interface Summary {
	date?: string;
	gross_revenue: string | number;
	cash_collected: string | number;
	earned_revenue: string | number;
	discount: string | number;
	total_refunded: string | number;
	total_billing?: number;
	total_patients_registered?: number;
	transactioncount?: number;
	expenses_paid: string | number;
	net_operating_cash: string | number;
	outstanding: string | number;
}

type SummaryPayload = {
	summary?: Summary[];
	branch?: Branch;
};

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
	total_billing: 0,
	total_patients_registered: 0,
	transactioncount: 0,
	expenses_paid: '0.00',
	net_operating_cash: '0.00',
	outstanding: '0.00',
};

export type AnalyticCardProps = {
	title: string;
	value: number;
	Icon: React.ElementType;
	variant: string;
	subtitle: string;
	formatAsCurrency?: boolean;
};

const AnalyticCard = ({
	title,
	value,
	Icon,
	variant,
	subtitle,
	formatAsCurrency = true,
}: AnalyticCardProps) => (
	<Card className={`border-0 shadow-sm bg-${variant} bg-gradient text-white rounded-3 h-100`}>
		<Card.Body className="p-3">
			<div className="d-flex justify-content-between align-items-center mb-1">
				<span className="text-xs text-uppercase fw-semibold opacity-75">{title}</span>
				<Icon size={22} className="opacity-75" />
			</div>
			<h3 className="fw-bold mb-0">
				{formatAsCurrency ? currencyFormatter.format(Number(value) || 0) : value.toLocaleString()}
			</h3>
			<span className="text-xs opacity-75">{subtitle}</span>
		</Card.Body>
	</Card>
);

const mobileCardColors = {
	primary: 'var(--bs-primary)',
	success: 'var(--bs-success)',
	info: 'var(--bs-info)',
	warning: 'var(--bs-warning)',
	danger: 'var(--bs-danger)',
	secondary: 'var(--bs-secondary)',
};

type PropsQuery = {
	branchid: string;
	from?: string;
	to?: string;
	summary?: Summary | Summary[] | SummaryPayload;
};

type ResolvedSummaryData = {
	summary: Summary;
	branch: Branch | null;
};

function resolveSummaryData(value?: Summary | Summary[] | SummaryPayload) {
	if (!value) {
		return { summary: _default, branch: null } as ResolvedSummaryData;
	}

	if (Array.isArray(value)) {
		return { summary: value[0] || _default, branch: null } as ResolvedSummaryData;
	}

	if ("summary" in value && Array.isArray(value.summary)) {
		return {
			summary: value.summary[0] || _default,
			branch: value.branch || null,
		} as ResolvedSummaryData;
	}

	return { summary: value, branch: null } as ResolvedSummaryData;
}

export default function BilledSummary({ branchid, from, to, summary }: PropsQuery) {
	const [internalSummary, setInternalSummary] = useState<Summary>(resolveSummaryData(summary).summary);
	const [branch, setBranch] = useState<Branch | null>(null);
	const [isVisible, setIsVisible] = useState<boolean>(true);
	const role = useApplication()?.user?.role;
	const isAdmin = role === "admin" || role === "manager"
	const canViewExpenseMetrics = ["admin", "accountant"].includes((role || "").trim().toLowerCase());

	useEffect(() => {
		if (summary) {
			const resolved = resolveSummaryData(summary);
			setInternalSummary(resolved.summary);
			if (resolved.branch) {
				setBranch(resolved.branch);
			}
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
		<div className="p-3 border rounded-3 bg-body" >
			<div className="mb-3">
				<div className="d-flex justify-content-between align-items-center">
					<div>
						<h5 className="mb-1 fw-bold text-body d-flex align-items-center gap-2"><RiMoneyDollarCircleLine className="text-primary" size={24} />Financial Summary</h5>
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
					<div className="d-flex align-items-center gap-3 flex-wrap">
						<h6 className="mb-0 fw-bold text-dark">
							Transactions: {Number(internalSummary.transactioncount || 0).toLocaleString()}
						</h6>
						<h6 className="mb-0 fw-bold text-dark">
							Total Billing: {Number(internalSummary.total_billing || 0).toLocaleString()}
						</h6>
						<h6 className="mb-0 fw-bold text-dark">
							Patients Registered: {Number(internalSummary.total_patients_registered || 0).toLocaleString()}
						</h6>
					</div>
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
									variant="primary"
									subtitle="Total billed revenue"
								/>
							</div>
							<div className="col-md-6 col-lg-3">
								<AnalyticCard
									title="Cash Collected"
									value={Number(internalSummary.cash_collected)}
									Icon={RiWalletLine}
									variant="success"
									subtitle="Payments received"
								/>
							</div>
							<div className="col-md-6 col-lg-3">
								<AnalyticCard
									title="Outstanding"
									value={Number(internalSummary.outstanding)}
									Icon={RiAlarmWarningLine}
									variant="warning"
									subtitle="Balance awaiting payment"
								/>
							</div>
							<div className="col-md-6 col-lg-3">
								<AnalyticCard
									title="Total Refunded"
									value={Number(internalSummary.total_refunded)}
									Icon={RiRefund2Line}
									variant="danger"
									subtitle="Refunds processed"
								/>
							</div>
						</div>

						{/* Second Row - 4 Cards */}
						<div className="row g-3">
							{canViewExpenseMetrics && (
								<div className="col-md-6 col-lg-3">
									<AnalyticCard
										title="Expenses Paid"
										value={Number(internalSummary.expenses_paid)}
										Icon={RiMoneyDollarCircleLine}
										variant="danger"
										subtitle="Operational expenses paid"
									/>
								</div>
							)}
							<div className="col-md-6 col-lg-3">
								<AnalyticCard
									title="Earned Revenue"
									value={Number(internalSummary.earned_revenue)}
									Icon={RiCheckboxCircleLine}
									variant="info"
									subtitle="Revenue after adjustments"
								/>
							</div>
							<div className="col-md-6 col-lg-3">
								<AnalyticCard
									title="Discount"
									value={Number(internalSummary.discount)}
									Icon={RiRefund2Line}
									variant="secondary"
									subtitle="Discounts applied"
								/>
							</div>
							{canViewExpenseMetrics && (
								<div className="col-md-6 col-lg-3">
									<AnalyticCard
										title="Net Operating Cash"
										value={Number(internalSummary.net_operating_cash)}
										Icon={RiBarChartLine}
										variant="success"
										subtitle="Cash after expenses"
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
												background: mobileCardColors.primary,
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
												background: mobileCardColors.success,
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
												background: mobileCardColors.info,
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
												background: mobileCardColors.warning,
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
												background: mobileCardColors.danger,
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

							{canViewExpenseMetrics && (
								<div className="list-group-item px-3 py-2 border-0">
									<div className="d-flex justify-content-between align-items-center">
										<div className="d-flex align-items-center gap-2">
											<div
												className="d-flex align-items-center justify-content-center"
												style={{
													background: mobileCardColors.danger,
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
							)}

							<div className="list-group-item px-3 py-2 border-0">
								<div className="d-flex justify-content-between align-items-center">
									<div className="d-flex align-items-center gap-2">
										<div
											className="d-flex align-items-center justify-content-center"
											style={{
												background: mobileCardColors.secondary,
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

							{canViewExpenseMetrics && (
								<div className="list-group-item px-3 py-2 border-0">
									<div className="d-flex justify-content-between align-items-center">
										<div className="d-flex align-items-center gap-2">
											<div
												className="d-flex align-items-center justify-content-center"
												style={{
													background: mobileCardColors.success,
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
							)}
						</div>
					</div>
				</>
			)}
		</div>
	);
}