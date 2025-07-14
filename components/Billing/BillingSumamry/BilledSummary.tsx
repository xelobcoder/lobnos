"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { customFetch, currencyFormatter } from "../../Auth/customFetch";
import { RiTeamLine } from "@remixicon/react";
import { RiMoneyDollarCircleLine } from "@remixicon/react";
import { RiFileList3Line } from "@remixicon/react";
import { RiPercentLine } from "@remixicon/react";
import { RiWalletLine } from "@remixicon/react";

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
		className="card border-0 shadow rounded mb-3"
		style={{
			background: bgColor,
			borderRadius: "12px",
			transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
			height: "89px",
			flex: "1 1 auto",
			margin: "0 8px",
		}}
	>
		<div className="card-body">
			<div className="d-flex justify-content-between align-items-center mb-1">
				<div
					className="d-flex align-items-center justify-content-center"
					style={{
						backgroundColor: iconColor,
						padding: "6px",
						borderRadius: "6px",
					}}
				>
					<Icon style={{ fontSize: "1rem", color: "white" }} />
				</div>
				<h6 className="mb-0 text-muted" style={{ fontSize: "0.875rem" }}>
					{title}
				</h6>
			</div>
			<div className="fw-bold" style={{ fontSize: "1rem" }}>
				{formatAsCurrency ? currencyFormatter.format(Number(value) || 0) : value}
			</div>
		</div>
	</div>
);

const cardColors = {
	billedClients: { bg: "#ECF2FF", icon: "#3B82F6" },
	totalSales: { bg: "#E8FDF5", icon: "#10B981" },
	amountPaid: { bg: "#FFF4ED", icon: "#F97316" },
	discount: { bg: "#F3E8FF", icon: "#E11D48" },
	pendingDebts: { bg: "#FEF3C7", icon: "#F59E0B" },
	expenses: { bg: "#FEE2E2", icon: "#EF4444" },
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
		<div className="">
			{branch && (
				<h5 className="mb-3">
					Branch: <span className="text-primary">{branch.name}</span>
				</h5>
			)}
			<div className="d-flex flex-column flex-md-row gap-1">
				<AnalyticCard
					title="Total Transaction Cost"
					value={internalSummary.totalTransactionCost}
					Icon={RiMoneyDollarCircleLine}
					bgColor={cardColors.totalSales.bg}
					iconColor={cardColors.totalSales.icon}
				/>
				<AnalyticCard
					title="Total Cost"
					value={internalSummary.totalCost}
					Icon={RiFileList3Line}
					bgColor={cardColors.amountPaid.bg}
					iconColor={cardColors.amountPaid.icon}
				/>
				<AnalyticCard
					title="Total Paid"
					value={internalSummary.totalPaid}
					Icon={RiPercentLine}
					bgColor={cardColors.discount.bg}
					iconColor={cardColors.discount.icon}
				/>
				<AnalyticCard
					title="Total Payable"
					value={internalSummary.totalPayable}
					Icon={RiWalletLine}
					bgColor={cardColors.pendingDebts.bg}
					iconColor={cardColors.pendingDebts.icon}
				/>
				<AnalyticCard
					title="Total Refunded"
					value={internalSummary.totalRefunded}
					Icon={RiMoneyDollarCircleLine}
					bgColor={cardColors.expenses.bg}
					iconColor={cardColors.expenses.icon}
				/>
				<AnalyticCard
					title="Total Balance"
					value={internalSummary.totalBalance}
					Icon={RiTeamLine}
					bgColor={cardColors.billedClients.bg}
					iconColor={cardColors.billedClients.icon}
					formatAsCurrency={false}
				/>
			</div>
		</div>
	)
}