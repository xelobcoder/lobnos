import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { SalesReport } from "../../lib/salesReport";
import { CURRENCY, formatDate, money } from "../invoices/organizationInvoicePdf";

const ACCENT: [number, number, number] = [20, 61, 110];
const MUTED: [number, number, number] = [108, 117, 125];

export function buildSalesReportPdf(report: SalesReport, options: { includeDetails: boolean; logoDataUrl?: string | null }): jsPDF {
	const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
	const margin = 14;
	const width = doc.internal.pageSize.getWidth();
	const height = doc.internal.pageSize.getHeight();
	let y = margin;
	doc.setProperties({
		title: `Sales & Expenses Report: ${report.from} to ${report.to}`,
		subject: report.branch.name,
		creator: "Prime Laboratory Software",
	});
	let textLeft = margin;
	if (options.logoDataUrl) {
		doc.addImage(options.logoDataUrl, margin, y, 22, 22);
		textLeft += 27;
	}
	doc.setFont("helvetica", "bold");
	doc.setFontSize(16);
	doc.setTextColor(...ACCENT);
	const companyName: string[] = doc.splitTextToSize(report.company.name || "Facility", width - textLeft - margin);
	doc.text(companyName, textLeft, y + 6);
	let companyY = y + 6 + companyName.length * 6;
	doc.setFont("helvetica", "normal");
	doc.setFontSize(8);
	doc.setTextColor(...MUTED);
	const companyLines = [
		report.company.motto,
		[report.company.address, report.company.street].filter(Boolean).join(", "),
		[report.company.phonenumber, report.company.alternativenumber].filter(Boolean).join(" / "),
		[report.company.email, report.company.website].filter(Boolean).join(" | "),
	].filter((line): line is string => Boolean(line));
	for (const line of companyLines) {
		const wrapped: string[] = doc.splitTextToSize(line, width - textLeft - margin);
		doc.text(wrapped, textLeft, companyY);
		companyY += wrapped.length * 4;
	}
	y = Math.max(companyY, margin + 25) + 3;
	doc.setDrawColor(...ACCENT);
	doc.line(margin, y, width - margin, y);
	y += 8;
	doc.setTextColor(...ACCENT);
	doc.setFont("helvetica", "bold");
	doc.setFontSize(14);
	doc.text("SALES & EXPENSES REPORT", margin, y);
	y += 6;
	doc.setFont("helvetica", "normal");
	doc.setFontSize(9);
	doc.setTextColor(33, 37, 41);
	const meta: string[] = doc.splitTextToSize(
		`${report.branch.name} | ${formatDate(report.from)} - ${formatDate(report.to)}`, width - margin * 2);
	doc.text(meta, margin, y);
	y += meta.length * 4.5;
	doc.setFontSize(8);
	doc.text(`Generated: ${new Date(report.generatedAt).toLocaleString()} | Currency: ${CURRENCY}`, margin, y);
	y += 7;

	function table(title: string, head: string[], body: string[][], numericColumns: number[] = [], totals?: string[]) {
		if (y > height - 45) { doc.addPage(); y = 23; }
		doc.setFont("helvetica", "bold");
		doc.setFontSize(10);
		doc.setTextColor(...ACCENT);
		doc.text(title, margin, y);
		y += 3;
		autoTable(doc, {
			startY: y,
			margin: { left: margin, right: margin, top: 23, bottom: 19 },
			head: [head],
			body: body.length ? body : [["No records for this period.", ...head.slice(1).map(() => "")]],
			foot: totals ? [totals] : undefined,
			showFoot: "lastPage",
			theme: "striped",
			styles: { fontSize: 8, cellPadding: 1.8, overflow: "linebreak" },
			headStyles: { fillColor: ACCENT },
			footStyles: { fillColor: [236, 241, 247], textColor: ACCENT },
			columnStyles: Object.fromEntries(numericColumns.map(index => [index, { halign: "right" as const }])),
			didDrawPage: data => { if (data.cursor) y = data.cursor.y + 8; },
		});
	}
	const s = report.summary;
	table("Management summary", ["Measure", "Value"], [
		["Clients (unique patients billed in period)", String(s.clients)],
		["Transactions (bills created in period)", String(s.transactions)],
		["Gross sales", money(s.grossSales)],
		["Discounts", money(s.discounts)],
		["Net sales billed", money(s.netSales)],
		["Payments collected in period (including older bills)", money(s.receipts)],
		["Expense payments in period", money(s.expensePayments)],
		["Net cash movement (collections less expense payments)", money(s.netCashMovement)],
		["Current outstanding on this period's bills", money(s.outstanding)],
	], [1]);
	table("Collections by payment method", ["Payment method", `Collected (${CURRENCY})`],
		report.paymentMethods.map(row => [row.method, money(row.amount)]), [1], ["Total", money(s.receipts)]);
	table("Current outstanding by billing source", ["Billing source", `Outstanding (${CURRENCY})`],
		report.outstandingBySource.map(row => [row.source, money(row.amount)]), [1], ["Total", money(s.outstanding)]);
	table("Report basis", ["Important notes"], [
		["Net cash movement is not accounting profit or the bank/cash balance."],
		["Sales and current outstanding refer to bills created in the selected period. Collections and expense payments use their payment dates."],
		...report.notes.map(note => [note]),
	]);

	if (options.includeDetails) {
		doc.addPage(); y = 23;
		table("Transactions billed in period (paid / outstanding are current)", [
			"Bill / Date", "Client / Source", "Gross", "Discount", "Net", "Paid", "Outstanding",
		], report.transactions.map(row => [
			`#${row.billingId}\n${formatDate(row.date)}`, `${row.patientName}\n${row.source}`,
			money(row.gross), money(row.discount), money(row.net), money(row.paid), money(row.outstanding),
		]), [2, 3, 4, 5, 6]);
		table("Payments collected in period", ["Date / Ref", "Client / Bill", "Method", `Amount (${CURRENCY})`],
			report.receipts.map(row => [
				`${formatDate(row.date)}\n${row.id}`, `${row.patientName}\nBill #${row.billingId}`, row.method, money(row.amount),
			]), [3], ["Total", "", "", money(s.receipts)]);
		table("Expense payments in period", ["Date / Ref", "Expense / Category", "Payee", "Method", `Paid (${CURRENCY})`],
			report.expenses.map(row => [
				`${formatDate(row.date)}\n${row.id}`, `${row.description}\n${row.category}`, row.payee, row.method, money(row.amount),
			]), [4], ["Total", "", "", "", money(s.expensePayments)]);
		table("Current outstanding - bill-by-bill breakdown", ["Bill / Date", "Client", "Source / Organization", `Due (${CURRENCY})`],
			report.outstanding.map(row => [
				`#${row.billingId}\n${formatDate(row.date)}`, row.patientName,
				[row.source, row.organizationName].filter(Boolean).join("\n"), money(row.amount),
			]), [3], ["Total", "", "", money(s.outstanding)]);
	}

	const pageCount = doc.getNumberOfPages();
	for (let page = 1; page <= pageCount; page++) {
		doc.setPage(page);
		doc.setFont("helvetica", "normal");
		doc.setTextColor(...MUTED);
		doc.setFontSize(7);
		if (page > 1) {
			doc.text("SALES & EXPENSES REPORT", margin, 12);
			doc.text(`${report.from} - ${report.to}`, width - margin, 12, { align: "right" });
		}
		doc.setDrawColor(220, 225, 230);
		doc.line(margin, height - 14, width - margin, height - 14);
		doc.text("Confidential management report | Prime Laboratory Software", margin, height - 9);
		doc.text(`Page ${page} of ${pageCount}`, width - margin, height - 9, { align: "right" });
	}
	return doc;
}
