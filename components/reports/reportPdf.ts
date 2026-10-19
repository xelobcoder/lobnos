import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ACCENT, INK, LIGHT, MUTED, imageFormat, phone } from "../invoices/organizationInvoicePdf";
import { customFetch } from "../Auth/customFetch";
import { getRequestContext } from "../serverActions/requestHeaders";
import { companyImageUrl } from "../../lib/companyImage";

/**
 * Shared landscape A4 report PDF. Same letterhead as the organization invoice (company profile and
 * logo), but no organization/patient block. Table values are printed exactly as displayed.
 */

export interface ReportTable {
	heading?: string;
	head: string[];
	body: string[][];
	foot?: string[][];
}

export interface ReportPdfSpec {
	title: string;
	subtitle?: string;
	period?: string;
	filters?: string[];
	tables: ReportTable[];
}

export interface CompanyBranding {
	company: Record<string, any>;
	logo: string | null;
}

let brandingCache: { tenantId: number | undefined; value: CompanyBranding } | null = null;

function pick(row: Record<string, any> | null | undefined, key: string) {
	if (!row) return undefined;
	const found = Object.keys(row).find((k) => k.toLowerCase() === key.toLowerCase());
	return found ? row[found] : undefined;
}

async function loadLogo(tenantId: number | undefined): Promise<string | null> {
	try {
		const url = companyImageUrl(tenantId);
		if (!url) return null;
		const res = await fetch(url, { credentials: "include" });
		if (!res.ok) return null;
		const blob = await res.blob();
		if (!blob.size || !blob.type.startsWith("image/")) return null;
		return await new Promise((resolve) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : null);
			reader.onerror = () => resolve(null);
			reader.readAsDataURL(blob);
		});
	} catch {
		return null;
	}
}

export async function loadCompanyBranding(): Promise<CompanyBranding> {
	const tenantId = (await getRequestContext())?.tenantId as number | undefined;
	if (brandingCache && brandingCache.tenantId === tenantId) return brandingCache.value;
	let raw: any = null;
	try {
		const res = await customFetch(`settings/companyprofile?tenantId=${tenantId}`);
		raw = res?.data ?? res?.result ?? res;
		if (Array.isArray(raw)) raw = raw[0];
	} catch {
		raw = null;
	}
	const keys = ["name", "email", "motto", "phonenumber", "alternativenumber", "address", "street", "website"];
	const company: Record<string, any> = {};
	for (const k of keys) company[k] = pick(raw, k);
	const value = { company, logo: await loadLogo(tenantId) };
	brandingCache = { tenantId, value };
	return value;
}

const NUMERIC = /^[\s(+-]*(GH[S₵]|₵)?\s*[\d,]+(\.\d+)?\s*%?\)?\s*(Dr|Cr)?$/i;

function isNumericColumn(table: ReportTable, col: number): boolean {
	const values = table.body.map((r) => (r[col] ?? "").trim()).filter((v) => v && v !== "-" && v !== "—");
	return values.length > 0 && values.every((v) => NUMERIC.test(v));
}

export function reportFileName(title: string, period?: string): string {
	const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
	const date = new Date().toISOString().slice(0, 10);
	return `${[slug(title), period ? slug(period) : ""].filter(Boolean).join("_")}_${date}.pdf`;
}

export function buildReportPdf(spec: ReportPdfSpec, branding: CompanyBranding): jsPDF {
	const company = branding.company || {};
	const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape", compress: true });
	const pageWidth = doc.internal.pageSize.getWidth();
	const pageHeight = doc.internal.pageSize.getHeight();
	const margin = 12;
	doc.setProperties({ title: spec.title, subject: "PLS report", creator: "Prime Laboratory Software" });

	let y = margin;
	let textLeft = margin;
	if (branding.logo) {
		try {
			doc.addImage(branding.logo, imageFormat(branding.logo), margin, y, 20, 20);
			textLeft = margin + 24;
		} catch {
			textLeft = margin;
		}
	}
	doc.setTextColor(...ACCENT);
	doc.setFont("helvetica", "bold");
	doc.setFontSize(14);
	doc.text(doc.splitTextToSize(String(company.name || "Facility").toUpperCase(), 150), textLeft, y + 5);
	doc.setFont("helvetica", "normal");
	doc.setFontSize(8);
	doc.setTextColor(...MUTED);
	const lines = [
		company.motto || "",
		[company.address, company.street].filter(Boolean).join(", "),
		[phone(company.phonenumber) && `Tel: ${phone(company.phonenumber)}`, phone(company.alternativenumber)].filter(Boolean).join(" / "),
		[company.email, company.website].filter(Boolean).join("  ·  "),
	].filter(Boolean);
	let ly = y + 9.5;
	for (const line of lines) {
		doc.text(String(line), textLeft, ly);
		ly += 3.8;
	}

	doc.setFont("helvetica", "bold");
	doc.setFontSize(17);
	doc.setTextColor(...ACCENT);
	doc.text(doc.splitTextToSize(spec.title, 110), pageWidth - margin, y + 6, { align: "right" });
	doc.setFont("helvetica", "normal");
	doc.setFontSize(8.5);
	doc.setTextColor(...MUTED);
	let ry = y + 12;
	for (const line of [spec.subtitle, spec.period, ...(spec.filters || [])].filter(Boolean) as string[]) {
		doc.text(doc.splitTextToSize(line, 110), pageWidth - margin, ry, { align: "right" });
		ry += 4;
	}

	y = Math.max(ly, ry, y + 22) + 1;
	doc.setDrawColor(...ACCENT);
	doc.setLineWidth(0.7);
	doc.line(margin, y, pageWidth - margin, y);
	y += 4;

	const tables = spec.tables.filter((t) => t.head.length);
	if (!tables.length) {
		doc.setFontSize(10);
		doc.setTextColor(...INK);
		doc.text("No data for the selected filters.", margin, y + 8);
	}
	for (const table of tables) {
		if (table.heading) {
			doc.setFont("helvetica", "bold");
			doc.setFontSize(10);
			doc.setTextColor(...INK);
			doc.text(table.heading, margin, y + 4);
			y += 6;
		}
		const columnStyles: Record<number, any> = {};
		table.head.forEach((_, i) => {
			if (isNumericColumn(table, i)) columnStyles[i] = { halign: "right" };
		});
		const body = table.body.length ? table.body : [[{ content: "No records found.", colSpan: table.head.length, styles: { halign: "center", textColor: MUTED } } as any]];
		autoTable(doc, {
			startY: y,
			head: [table.head.map((h, i) => ({ content: h, styles: { halign: columnStyles[i]?.halign || "left" } }))],
			body,
			foot: table.foot?.length ? table.foot.map((r) => r.map((c, i) => ({ content: c, styles: { halign: columnStyles[i]?.halign || "left" } }))) : undefined,
			showHead: "everyPage",
			showFoot: "lastPage",
			theme: "grid",
			margin: { left: margin, right: margin, bottom: 14 },
			styles: { font: "helvetica", fontSize: 8, cellPadding: 1.6, textColor: INK, lineColor: [210, 214, 220], lineWidth: 0.1, overflow: "linebreak" },
			headStyles: { fillColor: ACCENT, textColor: [255, 255, 255], fontStyle: "bold" },
			footStyles: { fillColor: LIGHT, textColor: INK, fontStyle: "bold" },
			alternateRowStyles: { fillColor: [248, 249, 251] },
			columnStyles,
		});
		y = ((doc as any).lastAutoTable?.finalY ?? y) + 8;
		if (y > pageHeight - 30) {
			doc.addPage();
			y = margin;
		}
	}

	const total = doc.getNumberOfPages();
	const generated = new Date().toLocaleString("en-GB");
	for (let i = 1; i <= total; i++) {
		doc.setPage(i);
		doc.setFont("helvetica", "normal");
		doc.setFontSize(7.5);
		doc.setTextColor(...MUTED);
		doc.text(`${spec.title} · Generated ${generated}`, margin, pageHeight - 6);
		doc.text(`Page ${i} of ${total}`, pageWidth - margin, pageHeight - 6, { align: "right" });
	}
	return doc;
}

/** Reads the visible tables of a rendered report, exactly as the user sees them. */
export function tablesFromElement(root: HTMLElement): ReportTable[] {
	const text = (el: Element) => ((el as HTMLElement).innerText ?? el.textContent ?? "").replace(/\s+/g, " ").trim();
	const result: ReportTable[] = [];
	root.querySelectorAll("table").forEach((table) => {
		if (table.closest("[data-pdf-ignore]") || (table as HTMLElement).offsetParent === null) return;
		const headRow = table.querySelector("thead tr:last-child") || table.querySelector("tr");
		if (!headRow) return;
		const heads = Array.from(headRow.children).map(text);
		const skip = heads.map((h) => !h || /^actions?$/i.test(h));
		const keep = (cells: string[]) => cells.filter((_, i) => !skip[i]);
		const rowsOf = (selector: string) =>
			Array.from(table.querySelectorAll(selector)).flatMap((tr) => {
				const cells: string[] = [];
				Array.from(tr.children).forEach((c) => {
					const span = Number((c as HTMLTableCellElement).colSpan) || 1;
					cells.push(text(c));
					for (let k = 1; k < span; k++) cells.push("");
				});
				return cells.some(Boolean) ? [keep(cells)] : [];
			});
		const body = rowsOf("tbody tr");
		const foot = rowsOf("tfoot tr");
		const heading = table.closest(".card")?.querySelector(".card-header, h5, h6")?.textContent?.trim();
		result.push({ heading: heading || undefined, head: keep(heads), body: body.filter((r) => r.length === keep(heads).length), foot });
	});
	return result;
}

export async function exportReportPdf(spec: ReportPdfSpec): Promise<void> {
	const branding = await loadCompanyBranding();
	buildReportPdf(spec, branding).save(reportFileName(spec.title, spec.period));
}
