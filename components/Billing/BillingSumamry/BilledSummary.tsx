"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { customFetch, currencyFormatter } from "../../Auth/customFetch";
import { RiFileList3Line } from "@remixicon/react";
import { RiWalletLine } from "@remixicon/react";
import { RiRefund2Line } from "@remixicon/react";
import { RiAccountCircleLine } from "@remixicon/react";
import { RiCheckboxCircleLine } from "@remixicon/react";
import { RiAlarmWarningLine } from "@remixicon/react";

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
		className="card border-0 shadow-sm rounded mb-3"
		style={{
			background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}E6 100%)`,
			borderRadius: "16px",
			transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
			height: "110px",
			flex: "1 1 auto",
			margin: "0 8px",
			border: "1px solid rgba(255,255,255,0.2)",
			cursor: "pointer",
		}}
		onMouseEnter={(e) => {
			e.currentTarget.style.transform = "translateY(-4px)";
			e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
		}}
		onMouseLeave={(e) => {
			e.currentTarget.style.transform = "translateY(0)";
			e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
		}}
	>
		<div className="card-body p-3">
			<div className="d-flex justify-content-between align-items-start mb-2">
				<div
					className="d-flex align-items-center justify-content-center"
					style={{
						background: `linear-gradient(135deg, ${iconColor} 0%, ${iconColor}DD 100%)`,
						padding: "10px",
						borderRadius: "12px",
						boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
					}}
				>
					<Icon style={{ fontSize: "1.2rem", color: "white" }} />
				</div>
				<h6 className="mb-0 text-muted fw-medium" style={{ fontSize: "0.8rem", lineHeight: "1.2" }}>
					{title}
				</h6>
			</div>
			<div className="fw-bold text-dark" style={{ fontSize: "1.2rem", lineHeight: "1.3" }}>
				{formatAsCurrency ? currencyFormatter.format(Number(value) || 0) : value.toLocaleString()}
			</div>
		</div>
	</div>
);

const cardColors = {
	billedClients: { bg: "#F0F9FF", icon: "#0EA5E9" },
	totalSales: { bg: "#F0FDF4", icon: "#22C55E" },
	amountPaid: { bg: "#FFF7ED", icon: "#F97316" },
	discount: { bg: "#FAF5FF", icon: "#A855F7" },
	pendingDebts: { bg: "#FFFBEB", icon: "#EAB308" },
	expenses: { bg: "#FEF2F2", icon: "#EF4444" },
	outstanding: { bg: "#FDF2F8", icon: "#EC4899" },
};

type PropsQuery = {
	branchid: string;
	from?: string;
	to?: string;
};

export default function BilledSummary({ branchid, from, to }: PropsQuery) {
	const [internalSummary, setInternalSummary] = useState<Summary>(_default);
	const [branch, setBranch] = useState<Branch | null>(null);

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
		<div className="p-2" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", borderRadius: "16px" }}>
			{branch && (
				<div className="mb-4">
					<h4 className="mb-2 fw-bold text-dark">Financial Summary</h4>
					<div className="d-flex align-items-center gap-2">
						<span className="text-muted">Branch:</span>
						<span className="fw-semibold text-primary fs-5">{branch.name}</span>
						<span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 ms-2">
							Active
						</span>
					</div>
				</div>
			)}
			<div className="d-flex flex-column flex-lg-row gap-2 flex-wrap">
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
		</div>
	)
}