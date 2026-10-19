export interface SalesReport {
	from: string;
	to: string;
	generatedAt: string;
	branch: { id: number | string; name: string };
	company: {
		name?: string;
		motto?: string;
		address?: string;
		street?: string;
		email?: string;
		website?: string;
		phonenumber?: string | number;
		alternativenumber?: string | number;
	};
	summary: {
		clients: number;
		transactions: number;
		grossSales: number;
		discounts: number;
		netSales: number;
		receipts: number;
		expensePayments: number;
		netCashMovement: number;
		outstanding: number;
	};
	transactions: Array<{
		billingId: number;
		date: string;
		patientId: number;
		patientName: string;
		source: string;
		gross: number;
		discount: number;
		net: number;
		paid: number;
		outstanding: number;
	}>;
	receipts: Array<{
		id: number | string;
		date: string;
		billingId: number;
		patientName: string;
		method: string;
		amount: number;
	}>;
	expenses: Array<{
		id: number | string;
		date: string;
		description: string;
		category: string;
		payee: string;
		method: string;
		amount: number;
	}>;
	outstanding: Array<{
		billingId: number;
		date: string;
		patientName: string;
		source: string;
		organizationName: string;
		amount: number;
	}>;
	paymentMethods: Array<{ method: string; amount: number }>;
	outstandingBySource: Array<{ source: string; amount: number }>;
	notes: string[];
}

export function localReportDate(date = new Date()): string {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function salesReportEndpoint(branchId: string | number, from: string, to: string): string {
	if (!/^[1-9]\d*$/.test(String(branchId)) || !Number.isSafeInteger(Number(branchId))) {
		throw new Error("Please select a valid branch.");
	}
	for (const date of [from, to]) {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) ||
			new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) {
			throw new Error("Please select valid start and end dates.");
		}
	}
	if (from > to) throw new Error("The start date must not be after the end date.");
	const query = new URLSearchParams({ branchid: String(branchId), from, to });
	return `billing/sales/report?${query}`;
}

export function salesReportFilename(report: Pick<SalesReport, "branch" | "from" | "to">, includeDetails: boolean): string {
	return `sales-expenses-${report.branch.id}-${report.from}-${report.to}${includeDetails ? "" : "-summary"}.pdf`;
}
