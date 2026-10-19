import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * A4 organizational credit invoice template.
 *
 * The PDF is the single rendering of the invoice: preview, print and download all use it, so what
 * the organization receives always reconciles with the stored invoice and receivable. Amounts are
 * printed exactly as stored by the backend (DECIMAL, two places); nothing is recalculated here.
 */

export type InvoiceStatus = "unpaid" | "partially_paid" | "paid" | "void";

export interface OrganizationInvoiceDetail {
	invoice: {
		id: number;
		invoice_number: string;
		invoice_date: string;
		due_date: string;
		status: InvoiceStatus;
		payment_terms: string;
		reference: string;
		notes: string;
		subtotal: string | number;
		discount_total: string | number;
		tax_total: string | number;
		total_amount: string | number;
		prior_credits: string | number;
		amount_due: string | number;
		amount_paid: string | number;
		balance_due: string | number;
		void_reason?: string;
	};
	lines: Array<{
		id: number;
		billing_id: number;
		patient_name: string;
		description: string;
		service_date: string | null;
		quantity: number;
		unit_price: string | number;
		discount: string | number;
		tax: string | number;
		line_total: string | number;
		prior_credit: string | number;
		amount_due: string | number;
		amount_paid: string | number;
	}>;
	payments: Array<{
		id: number;
		amount: string | number;
		payment_mode: string | null;
		payment_date: string;
		reference: string;
		received_by_name?: string | null;
	}>;
	organization: {
		name: string;
		address: string;
		street: string;
		location: string;
		region: string;
		mobile: string | number;
		email: string;
		contact: { name: string; email: string; mobile: string | number } | null;
	} | null;
	company: {
		name?: string;
		email?: string;
		motto?: string;
		phonenumber?: string | number;
		alternativenumber?: string | number;
		address?: string;
		street?: string;
		website?: string;
		additionalInfo?: string;
	} | null;
}

export const STATUS_LABELS: Record<InvoiceStatus, string> = {
	unpaid: "Unpaid",
	partially_paid: "Partially Paid",
	paid: "Paid",
	void: "Void",
};

export const CURRENCY = "GHS";

export function money(value: string | number | null | undefined): string {
	const num = Number(value ?? 0);
	return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number.isFinite(num) ? num : 0);
}

export function formatDate(value: string | null | undefined): string {
	if (!value) return "";
	const text = String(value);
	// DATE columns may arrive as "YYYY-MM-DD" or an ISO timestamp; never shift the calendar day.
	const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(text);
	const date = match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : new Date(text);
	if (Number.isNaN(date.getTime())) return text;
	return date.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

export function phone(value: unknown): string {
	if (value === null || value === undefined || value === "") return "";
	const text = String(value).trim();
	// Legacy numeric phone columns drop the leading zero.
	return /^\d{9}$/.test(text) ? `0${text}` : text;
}

export function imageFormat(dataUrl: string): string {
	const match = /^data:image\/(png|jpe?g|webp)/i.exec(dataUrl);
	if (!match) return "PNG";
	return match[1].toLowerCase().startsWith("jp") ? "JPEG" : match[1].toUpperCase();
}

export const INK: [number, number, number] = [33, 37, 41];
export const MUTED: [number, number, number] = [108, 117, 125];
export const ACCENT: [number, number, number] = [20, 61, 110];
export const LIGHT: [number, number, number] = [236, 241, 247];

export function buildOrganizationInvoicePdf(detail: OrganizationInvoiceDetail, logoDataUrl?: string | null): jsPDF {
	const { invoice, lines, payments } = detail;
	const company = detail.company || {};
	const org = detail.organization;
	const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });
	const pageWidth = doc.internal.pageSize.getWidth();
	const pageHeight = doc.internal.pageSize.getHeight();
	const margin = 15;
	const contentWidth = pageWidth - margin * 2;
	doc.setProperties({ title: `Invoice ${invoice.invoice_number}`, subject: "Organizational credit invoice", creator: "Prime Laboratory Software" });

	// ── Letterhead ─────────────────────────────────────────────
	let y = margin;
	let textLeft = margin;
	if (logoDataUrl) {
		try {
			doc.addImage(logoDataUrl, imageFormat(logoDataUrl), margin, y, 22, 22);
			textLeft = margin + 26;
		} catch {
			textLeft = margin;
		}
	}
	doc.setTextColor(...ACCENT);
	doc.setFont("helvetica", "bold");
	doc.setFontSize(15);
	const companyName = (company.name || "Facility").toUpperCase();
	doc.text(doc.splitTextToSize(companyName, 105), textLeft, y + 5);
	doc.setFont("helvetica", "normal");
	doc.setFontSize(8.5);
	doc.setTextColor(...MUTED);
	const companyLines = [
		company.motto || "",
		[company.address, company.street].filter(Boolean).join(", "),
		[phone(company.phonenumber) && `Tel: ${phone(company.phonenumber)}`, phone(company.alternativenumber)].filter(Boolean).join(" / "),
		[company.email, company.website].filter(Boolean).join("  ·  "),
	].filter(Boolean);
	let companyY = y + 10.5;
	for (const line of companyLines) {
		const wrapped = doc.splitTextToSize(line, 105);
		doc.text(wrapped, textLeft, companyY);
		companyY += 4 * wrapped.length;
	}

	doc.setFont("helvetica", "bold");
	doc.setFontSize(24);
	doc.setTextColor(...ACCENT);
	doc.text("INVOICE", pageWidth - margin, y + 8, { align: "right" });
	doc.setFontSize(8);
	doc.setTextColor(...MUTED);
	doc.text("ORGANIZATIONAL CREDIT BILLING", pageWidth - margin, y + 13, { align: "right" });

	y = Math.max(companyY, y + 24) + 2;
	doc.setDrawColor(...ACCENT);
	doc.setLineWidth(0.8);
	doc.line(margin, y, pageWidth - margin, y);
	y += 6;

	// ── From / Bill to / Invoice details ───────────────────────
	const colWidth = (contentWidth - 8) / 3;
	const block = (title: string, x: number, rows: string[], bold?: string) => {
		doc.setFont("helvetica", "bold");
		doc.setFontSize(7.5);
		doc.setTextColor(...MUTED);
		doc.text(title, x, y);
		let rowY = y + 5;
		if (bold) {
			doc.setFontSize(10);
			doc.setTextColor(...INK);
			const wrapped = doc.splitTextToSize(bold, colWidth);
			doc.text(wrapped, x, rowY);
			rowY += 4.5 * wrapped.length;
		}
		doc.setFont("helvetica", "normal");
		doc.setFontSize(8.5);
		doc.setTextColor(...INK);
		for (const row of rows.filter(Boolean)) {
			const wrapped = doc.splitTextToSize(row, colWidth);
			doc.text(wrapped, x, rowY);
			rowY += 4 * wrapped.length;
		}
		return rowY;
	};
	const fromEnd = block("FROM — SERVICE PROVIDER", margin, [
		[company.address, company.street].filter(Boolean).join(", "),
		phone(company.phonenumber) ? `Tel: ${phone(company.phonenumber)}` : "",
		company.email || "",
	], company.name || "Facility");
	const billToEnd = block("BILL TO — CONTRACTED ORGANIZATION", margin + colWidth + 4, org ? [
		[org.address, org.street, org.location, org.region].filter(Boolean).join(", "),
		org.contact?.name ? `Attn: ${org.contact.name}` : "Attn: Accounts Department",
		[phone(org.mobile || org.contact?.mobile), org.email || org.contact?.email].filter(Boolean).join("  ·  "),
		invoice.reference ? `Ref / Contract: ${invoice.reference}` : "",
	] : [], org?.name || "Organization");

	const metaX = margin + (colWidth + 4) * 2;
	autoTable(doc, {
		startY: y - 3,
		margin: { left: metaX, right: margin },
		tableWidth: colWidth,
		theme: "plain",
		styles: { fontSize: 8.5, cellPadding: { top: 1, bottom: 1, left: 1.5, right: 1.5 }, textColor: INK },
		columnStyles: { 0: { textColor: MUTED, cellWidth: 24 }, 1: { fontStyle: "bold", halign: "right" } },
		body: [
			["Invoice No.", invoice.invoice_number],
			["Invoice Date", formatDate(invoice.invoice_date)],
			["Due Date", formatDate(invoice.due_date)],
			["Status", STATUS_LABELS[invoice.status] || invoice.status],
			["Terms", invoice.payment_terms || "As agreed in contract"],
		],
	});
	const metaEnd = (doc as any).lastAutoTable.finalY as number;
	y = Math.max(fromEnd, billToEnd, metaEnd) + 6;

	// ── Line items ─────────────────────────────────────────────
	const showDiscount = Number(invoice.discount_total) > 0;
	const showTax = Number(invoice.tax_total) > 0;
	const showPrior = Number(invoice.prior_credits) > 0;
	const head = ["#", "Date", "Patient / Bill Ref.", "Service / Test", "Qty", `Unit (${CURRENCY})`];
	if (showDiscount) head.push("Discount");
	if (showTax) head.push("Tax");
	if (showPrior) head.push("Prior Credit");
	head.push(`Amount Due (${CURRENCY})`);
	const body = lines.map((line, index) => {
		const row: string[] = [
			String(index + 1),
			line.service_date ? new Date(line.service_date).toLocaleDateString("en-GB") : "",
			`${line.patient_name}\nBill #${line.billing_id}`,
			line.description,
			String(line.quantity),
			money(line.unit_price),
		];
		if (showDiscount) row.push(money(line.discount));
		if (showTax) row.push(money(line.tax));
		if (showPrior) row.push(money(line.prior_credit));
		row.push(money(line.amount_due));
		return row;
	});
	const numericStart = 4;
	const columnStyles: Record<number, any> = { 0: { cellWidth: 8, halign: "center" }, 1: { cellWidth: 20 }, 2: { cellWidth: 38 } };
	for (let i = numericStart; i < head.length; i++) columnStyles[i] = { halign: "right", cellWidth: i === numericStart ? 10 : undefined };

	autoTable(doc, {
		startY: y,
		margin: { left: margin, right: margin, top: 20, bottom: 20 },
		head: [head],
		body,
		theme: "striped",
		headStyles: { fillColor: ACCENT, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8, halign: "center" },
		styles: { fontSize: 8, cellPadding: 1.8, textColor: INK, overflow: "linebreak", valign: "middle" },
		alternateRowStyles: { fillColor: [248, 250, 252] },
		columnStyles,
	});
	y = (doc as any).lastAutoTable.finalY + 4;

	// ── Totals ────────────────────────────────────────────────
	const totalsRows: Array<[string, string]> = [["Subtotal", money(invoice.subtotal)]];
	if (showDiscount) totalsRows.push(["Less: discounts", `(${money(invoice.discount_total)})`]);
	if (showTax) totalsRows.push(["Tax", money(invoice.tax_total)]);
	totalsRows.push(["Total charges", money(invoice.total_amount)]);
	if (showPrior) totalsRows.push(["Less: settled before invoicing", `(${money(invoice.prior_credits)})`]);
	totalsRows.push(["Amount invoiced", money(invoice.amount_due)]);
	totalsRows.push(["Payments received", `(${money(invoice.amount_paid)})`]);

	const totalsWidth = 82;
	if (y + 8 + totalsRows.length * 6 + 14 > pageHeight - 25) {
		doc.addPage();
		y = 20;
	}
	const totalsTop = y;
	autoTable(doc, {
		startY: y,
		margin: { left: pageWidth - margin - totalsWidth, right: margin },
		tableWidth: totalsWidth,
		theme: "plain",
		styles: { fontSize: 9, cellPadding: { top: 1.2, bottom: 1.2, left: 2, right: 2 }, textColor: INK },
		columnStyles: { 0: { textColor: MUTED }, 1: { halign: "right" } },
		body: totalsRows,
	});
	y = (doc as any).lastAutoTable.finalY + 1;
	doc.setFillColor(...ACCENT);
	doc.rect(pageWidth - margin - totalsWidth, y, totalsWidth, 11, "F");
	doc.setTextColor(255, 255, 255);
	doc.setFont("helvetica", "bold");
	doc.setFontSize(9);
	doc.text("BALANCE DUE", pageWidth - margin - totalsWidth + 3, y + 7);
	doc.setFontSize(12);
	doc.text(`${CURRENCY} ${money(invoice.balance_due)}`, pageWidth - margin - 3, y + 7.3, { align: "right" });
	const totalsBottom = y + 11;

	// Payment instructions sit beside the totals.
	const leftWidth = contentWidth - totalsWidth - 8;
	let leftY = totalsTop + 3;
	doc.setTextColor(...MUTED);
	doc.setFont("helvetica", "bold");
	doc.setFontSize(7.5);
	doc.text("PAYMENT INSTRUCTIONS", margin, leftY);
	leftY += 4.5;
	doc.setFont("helvetica", "normal");
	doc.setFontSize(8.5);
	doc.setTextColor(...INK);
	const instructions = [
		company.additionalInfo ? String(company.additionalInfo) : "Please pay using the facility's approved bank or payment details.",
		`Quote invoice number ${invoice.invoice_number} with your payment.`,
	];
	for (const text of instructions) {
		const wrapped = doc.splitTextToSize(text, leftWidth);
		doc.text(wrapped, margin, leftY);
		leftY += 4 * wrapped.length + 1;
	}
	if (invoice.notes) {
		leftY += 2;
		doc.setFont("helvetica", "bold");
		doc.setFontSize(7.5);
		doc.setTextColor(...MUTED);
		doc.text("NOTES", margin, leftY);
		leftY += 4.5;
		doc.setFont("helvetica", "normal");
		doc.setFontSize(8.5);
		doc.setTextColor(...INK);
		const wrapped = doc.splitTextToSize(invoice.notes, leftWidth);
		doc.text(wrapped, margin, leftY);
		leftY += 4 * wrapped.length;
	}
	y = Math.max(totalsBottom, leftY) + 8;

	// ── Payment history ───────────────────────────────────────
	if (payments.length > 0) {
		doc.setFont("helvetica", "bold");
		doc.setFontSize(9);
		doc.setTextColor(...ACCENT);
		doc.text("PAYMENTS RECEIVED", margin, y);
		autoTable(doc, {
			startY: y + 2,
			margin: { left: margin, right: margin, top: 20, bottom: 20 },
			head: [["Date", "Mode", "Reference", `Amount (${CURRENCY})`]],
			body: payments.map(p => [formatDate(p.payment_date), p.payment_mode || "", p.reference || "", money(p.amount)]),
			theme: "grid",
			headStyles: { fillColor: LIGHT, textColor: INK, fontStyle: "bold", fontSize: 8 },
			styles: { fontSize: 8, cellPadding: 1.5, textColor: INK, lineColor: [210, 214, 220], lineWidth: 0.2 },
			columnStyles: { 3: { halign: "right" } },
		});
		y = (doc as any).lastAutoTable.finalY + 8;
	}

	// ── Sign-off ──────────────────────────────────────────────
	if (y + 22 > pageHeight - 20) {
		doc.addPage();
		y = 25;
	}
	doc.setDrawColor(...MUTED);
	doc.setLineWidth(0.3);
	doc.line(margin, y + 10, margin + 70, y + 10);
	doc.setFont("helvetica", "normal");
	doc.setFontSize(8);
	doc.setTextColor(...MUTED);
	doc.text("Authorized by (name, signature & stamp)", margin, y + 14);
	doc.setFont("helvetica", "italic");
	doc.setFontSize(9);
	doc.setTextColor(...ACCENT);
	doc.text("Thank you for your continued partnership.", pageWidth - margin, y + 14, { align: "right" });

	// ── Status stamp, footer & page numbers on every page ─────
	const pageCount = doc.getNumberOfPages();
	const generated = new Date().toLocaleString("en-GB");
	for (let page = 1; page <= pageCount; page++) {
		doc.setPage(page);
		if (invoice.status === "void" || invoice.status === "paid") {
			const label = invoice.status === "void" ? "VOID" : "PAID";
			const color: [number, number, number] = invoice.status === "void" ? [200, 35, 51] : [25, 135, 84];
			doc.saveGraphicsState();
			doc.setGState(new (doc as any).GState({ opacity: 0.12 }));
			doc.setTextColor(...color);
			doc.setFont("helvetica", "bold");
			doc.setFontSize(90);
			doc.text(label, pageWidth / 2, pageHeight / 2, { align: "center", angle: 30 });
			doc.restoreGraphicsState();
		}
		doc.setDrawColor(220, 224, 230);
		doc.setLineWidth(0.3);
		doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
		doc.setFont("helvetica", "normal");
		doc.setFontSize(7);
		doc.setTextColor(...MUTED);
		doc.text(`${company.name || ""}  ·  Invoice ${invoice.invoice_number}`, margin, pageHeight - 9);
		doc.text(`Generated ${generated}`, pageWidth / 2, pageHeight - 9, { align: "center" });
		doc.text(`Page ${page} of ${pageCount}`, pageWidth - margin, pageHeight - 9, { align: "right" });
		if (invoice.status === "void" && page === 1 && invoice.void_reason) {
			doc.setTextColor(200, 35, 51);
			doc.text(`Voided: ${invoice.void_reason}`.slice(0, 120), margin, pageHeight - 5);
		}
	}
	return doc;
}
