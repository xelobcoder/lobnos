"use client";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { customFetch, currencyFormatter } from "../../Auth/customFetch";
import { RiFileList3Line, RiWalletLine, RiRefund2Line, RiAccountCircleLine, RiCheckboxCircleLine, RiAlarmWarningLine, RiEyeLine } from "@remixicon/react";
import { useApplication } from "../../Auth/useApplicationContext";
import { Offcanvas } from "react-bootstrap";

interface Summary {
	totalTransactionCost: number;
	totalCost: number;
	totalPaid: number;
	totalPayable: number;
	totalRefunded: number;
	totalBalance: number;
	totalDiscount: number;
	totalOutstanding: number;
	totalTaxIncurred: number;
	transactionCount: number;
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
	totalPaid: 0,
	totalPayable: 0,
	totalRefunded: 0,
	totalBalance: 0,
	totalDiscount: 0,
	totalOutstanding: 0,
	totalTaxIncurred: 0,
	transactionCount: 0,
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
		className="card border-0 shadow-sm rounded"
		style={{
			background: bgColor,
			borderRadius: "8px",
			transition: "all 0.2s ease",
			height: "80px",
			flex: "1 1 auto",
			margin: "0 4px",
			border: "1px solid var(--bs-border-color)",
			cursor: "pointer",
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
		<div className="card-body p-3">
			<div className="d-flex justify-content-between align-items-center">
				<div className="d-flex align-items-center gap-3">
					<div
						className="d-flex align-items-center justify-content-center"
						style={{
							background: iconColor,
							padding: "6px",
							borderRadius: "6px",
						}}
					>
						<Icon style={{ fontSize: "1rem", color: "white" }} />
					</div>
					<div>
						<h6 className="mb-0 text-muted fw-medium" style={{ fontSize: "0.75rem", lineHeight: "1.2" }}>
							{title}
						</h6>
						<div className="fw-bold text-body" style={{ fontSize: "1rem", lineHeight: "1.3" }}>
							{formatAsCurrency ? currencyFormatter.format(Number(value) || 0) : value.toLocaleString()}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
);

const cardColors = {
	billedClients: { bg: "var(--theme-card-bg)", icon: "#6366f1" }, 
	totalSales: { bg: "var(--bs-secondary-bg)", icon: "#0ea5e9" },
	amountPaid: { bg: "var(--theme-card-bg)", icon: "#10b981" },
	discount: { bg: "var(--bs-secondary-bg)", icon: "#f59e0b" },
	pendingDebts: { bg: "var(--theme-card-bg)", icon: "#ef4444" }, 
	expenses: { bg: "var(--bs-secondary-bg)", icon: "#8b5cf6" }, 
	outstanding: { bg: "var(--theme-card-bg)", icon: "#f97316" }, 
};

type PropsQuery = {
	branchid: string;
	from?: string;
	to?: string;
};

export default function BilledSummary({ branchid, from, to }: PropsQuery) {
	const [internalSummary, setInternalSummary] = useState<Summary>(_default);
	const [branch, setBranch] = useState<Branch | null>(null);
	const [showOffcanvas, setShowOffcanvas] = useState(false);
	const role = useApplication()?.user?.role;
	const isAdmin = role === "admin" || role === "manager";

	useEffect(() => {
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
	}, [branchid, from, to]);

	return (
		<div className="p-3 border border-1 rounded" >
			{branch && (
				<div className="mb-3">
					<div className="d-flex justify-content-between align-items-center">
						<div>
							<h5 className="mb-1 fw-semibold text-dark">Financial Summary</h5>
							<div className="d-flex align-items-center gap-2">
								<span className="text-muted small">Branch:</span>
								<span className="fw-medium text-dark">{branch.name}</span>
								<span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 small">
									Active
								</span>
							</div>
						</div>
						{isAdmin && (
							<button
								className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
								onClick={() => setShowOffcanvas(true)}
								style={{
									borderRadius: "6px",
									padding: "6px 12px",
									transition: "all 0.2s ease"
								}}
							>
								<RiEyeLine style={{ fontSize: "1rem" }} />
								<span className="small fw-medium">View Summary</span>
							</button>
						)}
					</div>
				</div>
			)}
			{/* Summary Offcanvas - Admin Only */}
			{isAdmin && (
				<Offcanvas
					show={showOffcanvas}
					onHide={() => setShowOffcanvas(false)}
					placement="end"
					style={{ width: "400px" }}
				>
					<Offcanvas.Header>
						<Offcanvas.Title className="fw-semibold text-dark">
							Financial Summary
						</Offcanvas.Title>
					</Offcanvas.Header>
					<Offcanvas.Body className="p-3">
						{branch && (
							<div className="mb-3">
								<div className="d-flex align-items-center gap-2 mb-3">
									<span className="text-muted small">Branch:</span>
									<span className="fw-medium text-body">{branch.name}</span>
									<span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 small">
										Active
									</span>
								</div>
							</div>
						)}

						{/* Desktop Card View */}
						<div className="d-none d-md-flex flex-column gap-2">
							<AnalyticCard
								title="Total Cost"
								value={internalSummary.totalCost}
								Icon={RiFileList3Line}
								bgColor={cardColors.totalSales.bg}
								iconColor={cardColors.totalSales.icon}
							/>
							<AnalyticCard
								title="Total Paid"
								value={internalSummary.totalPaid}
								Icon={RiCheckboxCircleLine}
								bgColor={cardColors.amountPaid.bg}
								iconColor={cardColors.amountPaid.icon}
							/>
							<AnalyticCard
								title="Total Payable"
								value={internalSummary.totalPayable}
								Icon={RiWalletLine}
								bgColor={cardColors.discount.bg}
								iconColor={cardColors.discount.icon}
							/>
							<AnalyticCard
								title="Total Outstanding"
								value={internalSummary.totalOutstanding}
								Icon={RiAlarmWarningLine}
								bgColor={cardColors.outstanding.bg}
								iconColor={cardColors.outstanding.icon}
							/>
							<AnalyticCard
								title="Total Refunded"
								value={internalSummary.totalRefunded}
								Icon={RiRefund2Line}
								bgColor={cardColors.expenses.bg}
								iconColor={cardColors.expenses.icon}
							/>
							<AnalyticCard
								title="Transaction Count"
								value={internalSummary.transactionCount}
								Icon={RiAccountCircleLine}
								bgColor={cardColors.billedClients.bg}
								iconColor={cardColors.billedClients.icon}
								formatAsCurrency={false}
							/>
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
													background: cardColors.totalSales.icon,
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
													background: cardColors.amountPaid.icon,
													padding: "4px",
													borderRadius: "4px",
													width: "24px",
													height: "24px",
												}}
											>
												<RiCheckboxCircleLine style={{ fontSize: "0.8rem", color: "white" }} />
											</div>
											<span className="small fw-medium text-muted">Total Paid</span>
										</div>
										<span className="fw-semibold text-dark small">
											{currencyFormatter.format(Number(internalSummary.totalPaid) || 0)}
										</span>
									</div>
								</div>

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
												<RiWalletLine style={{ fontSize: "0.8rem", color: "white" }} />
											</div>
											<span className="small fw-medium text-muted">Total Payable</span>
										</div>
										<span className="fw-semibold text-dark small">
											{currencyFormatter.format(Number(internalSummary.totalPayable) || 0)}
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
													background: cardColors.expenses.icon,
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

								<div className="list-group-item px-3 py-2 border-0">
									<div className="d-flex justify-content-between align-items-center">
										<div className="d-flex align-items-center gap-2">
											<div
												className="d-flex align-items-center justify-content-center"
												style={{
													background: cardColors.billedClients.icon,
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
					</Offcanvas.Body>
				</Offcanvas>
			)}
		</div>
	);
}