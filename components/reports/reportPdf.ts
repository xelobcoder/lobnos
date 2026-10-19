import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ACCENT, INK, LIGHT, MUTED, imageFormat, phone } from "../invoices/organizationInvoicePdf";
import { customFetch } from "../Auth/customFetch";
import { getRequestContext } from "../serverActions/requestHeaders";
import { companyImageUrl } from "../../lib/companyImage";
import { cellText, findTableSource, type ReportCell, type ReportTable } from "./tableSources";

/**
 * Shared landscape A4 report PDF for accounting, inventory and supplier reports. Same letterhead as
 * the organization invoice (company profile and logo), but no organization/patient block. Values are
 * printed exactly as the report displays them; nothing is recalculated here.
 */

export type { ReportCell, ReportTable } from "./tableSources";
export { cellText } from "./tableSources";

export interface ReportPdfSpec {
	title: string;
	subtitle?: string;
	period?: string;
	filters?: string[];
	/** Short statements printed above the tables (balance checks, warnings, record counts). */
	notes?: string[];
	tables: ReportTable[];
}

export interface CompanyBranding {
	company: Record<string, any>;
	logo: string | null;
}

export const EXPORT_PAGE_SIZE = 500;
export const EXPORT_MAX_ROWS = 10000;

const DANGER: [number, number, number] = [200, 35, 51];
const SUCCESS: [number, number, number] = [25, 135, 84];

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

/**
 * Reads every page from a paginated source. Stops on a short/empty page, a repeated page (a source
 * that ignores `page`), or the row cap, so a misbehaving endpoint can never loop forever.
 */
export async function fetchAllPages<T>(
	fetchPage: (page: number, count: number) => Promise<T[] | null | undefined>,
	options: { pageSize?: number; maxRows?: number } = {}
): Promise<{ rows: T[]; truncated: boolean }> {
	const pageSize = options.pageSize ?? EXPORT_PAGE_SIZE;
	const maxRows = options.maxRows ?? EXPORT_MAX_ROWS;
	const rows: T[] = [];
	let previousFirst: string | null = null;
	let truncated = false;
	for (let page = 1; ; page++) {
		const batch = (await fetchPage(page, pageSize)) || [];
		if (!Array.isArray(batch) || batch.length === 0) break;
		const first = JSON.stringify(batch[0]);
		if (previousFirst !== null && first === previousFirst) break;
		previousFirst = first;
		rows.push(...batch);
		if (rows.length >= maxRows) {
			truncated = rows.length > maxRows || batch.length >= pageSize;
			break;
		}
		if (batch.length < pageSize) break;
	}
	return { rows: rows.slice(0, maxRows), truncated };
}

// ── Reading reports from the rendered page ───────────────────────────────

const JUNK = "button, .btn, input, select, textarea, svg, .dropdown, .spinner-border, .spinner-grow, [data-pdf-ignore], .visually-hidden, .sr-only, [hidden]";
const BLOCK = new Set(["DIV", "P", "BR", "LI", "UL", "OL", "SMALL", "H1", "H2", "H3", "H4", "H5", "H6", "TR", "SECTION"]);
/** Inline elements whose on-screen separation comes from CSS (e.g. `<span class="me-2">acc-1000</span>Cash`). */
const SPACED_INLINE = /\b(m[sexy]|p[sexy]|gap)-(\d|auto)\b|\bbadge\b/;
const SPACED_TAGS = new Set(["CODE", "KBD", "TD", "TH"]);

/** Visible text of an element with controls stripped; block children become separate lines. */
export function textOf(node: Node): string {
	const parts: string[] = [];
	const walk = (n: Node) => {
		if (n.nodeType === Node.TEXT_NODE) {
			parts.push(n.nodeValue || "");
			return;
		}
		if (n.nodeType !== Node.ELEMENT_NODE) return;
		const el = n as HTMLElement;
		if (el !== node && el.matches(JUNK)) return;
		if (el.style?.display === "none") return;
		if (el.classList.contains("d-none") && !/\bd-(sm|md|lg|xl|xxl)-(?!none)/.test(String(el.className))) return;
		const block = BLOCK.has(el.tagName);
		const spaced = !block && (SPACED_TAGS.has(el.tagName) || SPACED_INLINE.test(String(el.className)));
		if (block) parts.push("\n");
		else if (spaced) parts.push(" ");
		if (el.tagName === "BR") return;
		el.childNodes.forEach(walk);
		if (block) parts.push("\n");
		else if (spaced) parts.push(" ");
	};
	walk(node);
	return parts
		.join("")
		.split("\n")
		.map((line) => line.replace(/\s+/g, " ").trim())
		.filter(Boolean)
		.join("\n");
}

function isVisible(el: Element): boolean {
	return (el as HTMLElement).offsetParent !== null || (el as HTMLElement).getClientRects().length > 0;
}

function hasClass(el: Element | null | undefined, pattern: RegExp): boolean {
	return !!el && pattern.test(el.className && typeof el.className === "string" ? el.className : "");
}

interface RawCell {
	text: string;
	span: number;
	bold: boolean;
	indent: number;
	tone?: "danger" | "success" | "muted";
}

function readRow(tr: HTMLTableRowElement): RawCell[] {
	const rowBold = hasClass(tr, /\b(fw-bold|fw-semibold|table-secondary|table-light|table-active)\b/);
	return Array.from(tr.cells).map((cell) => {
		const first = cell.firstElementChild;
		const toneSource = (pattern: RegExp) => hasClass(cell, pattern) || (cell.childElementCount === 1 && hasClass(first, pattern));
		const tone = toneSource(/\btext-danger\b/) ? "danger" : toneSource(/\btext-success\b/) ? "success" : undefined;
		return {
			text: textOf(cell),
			span: Math.max(1, Number(cell.colSpan) || 1),
			bold: rowBold || cell.tagName === "TH" || hasClass(cell, /\b(fw-bold|fw-semibold)\b/),
			indent: hasClass(cell, /\bps-5\b/) ? 2 : hasClass(cell, /\bps-4\b/) ? 1 : 0,
			tone,
		};
	});
}

function expandedWidth(cells: RawCell[]): number {
	return cells.reduce((sum, c) => sum + c.span, 0);
}

/** Converts one HTML table into a report table, dropping action/control columns. */
export function tableFromElement(table: HTMLTableElement, heading?: string): ReportTable | null {
	const headRows = table.tHead ? Array.from(table.tHead.rows) : [];
	const footRows = table.tFoot ? Array.from(table.tFoot.rows) : [];
	const bodyRows = Array.from(table.tBodies).flatMap((b) => Array.from(b.rows));
	const headRow = headRows.length ? readRow(headRows[headRows.length - 1]) : null;
	const body = bodyRows.map(readRow);
	const foot = footRows.map(readRow);

	const heads: string[] = [];
	headRow?.forEach((c) => {
		heads.push(c.text.replace(/\n/g, " "));
		for (let k = 1; k < c.span; k++) heads.push("");
	});
	const width = headRow ? heads.length : Math.max(0, ...body.map(expandedWidth), ...foot.map(expandedWidth));
	if (!width) return null;

	// Text found in each column of single-span body cells, to tell action columns from data columns.
	const columnHasText = new Array(width).fill(false);
	body.forEach((cells) => {
		let pos = 0;
		cells.forEach((c) => {
			if (c.span === 1 && c.text && pos < width) columnHasText[pos] = true;
			pos += c.span;
		});
	});
	const skip = new Array(width).fill(false).map((_, i) => {
		if (!headRow) return false;
		const h = heads[i]?.trim() || "";
		if (/^(actions?|options?|manage)$/i.test(h)) return true;
		return !h && !columnHasText[i];
	});
	const keptWidth = skip.filter((s) => !s).length;
	if (!keptWidth) return null;

	const convert = (cells: RawCell[], isBody: boolean): ReportCell[] | null => {
		if (!cells.some((c) => c.text)) return null;
		const out: ReportCell[] = [];
		let pos = 0;
		for (const c of cells) {
			if (pos >= width) break;
			const end = Math.min(width, pos + c.span);
			let kept = 0;
			for (let i = pos; i < end; i++) if (!skip[i]) kept++;
			pos += c.span;
			if (!kept) continue;
			const section = isBody && cells.length === 1 && kept === keptWidth && keptWidth > 1;
			if (kept === 1 && !c.bold && !c.indent && !c.tone) out.push(c.text);
			else out.push({ content: c.text, colSpan: kept > 1 ? kept : undefined, bold: c.bold || section || undefined, section: section || undefined, indent: c.indent || undefined, tone: c.tone });
		}
		const filled = out.reduce<number>((sum, c) => sum + (typeof c === "string" ? 1 : c.colSpan || 1), 0);
		for (let i = filled; i < keptWidth; i++) out.push("");
		return out;
	};

	return {
		heading,
		head: headRow ? heads.filter((_, i) => !skip[i]) : undefined,
		body: body.map((r) => convert(r, true)).filter((r): r is ReportCell[] => !!r),
		foot: foot.map((r) => convert(r, false)).filter((r): r is ReportCell[] => !!r),
	};
}

const HEADING_SELECTOR = "h4, h5, h6, .card-header, .card-title, [data-pdf-heading]";

function headingsBefore(root: HTMLElement, tables: HTMLTableElement[]): Array<string | undefined> {
	const candidates = Array.from(root.querySelectorAll<HTMLElement>(HEADING_SELECTOR)).filter(
		(h) => !h.closest("table, [data-pdf-ignore]") && isVisible(h) && !h.querySelector("table")
	);
	return tables.map((table, index) => {
		const previous = tables[index - 1];
		let found: HTMLElement | undefined;
		for (const h of candidates) {
			const beforeTable = !!(h.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING) && !h.contains(table);
			const afterPrevious = !previous || !!(previous.compareDocumentPosition(h) & Node.DOCUMENT_POSITION_FOLLOWING);
			if (beforeTable && afterPrevious) found = h;
		}
		const text = found ? textOf(found).split("\n")[0] : "";
		return text || undefined;
	});
}

/** Reads the visible tables of a rendered report, exactly as the user sees them. */
export function tablesFromElement(root: HTMLElement): ReportTable[] {
	const tables = Array.from(root.querySelectorAll("table")).filter(
		(t) => !t.closest("[data-pdf-ignore]") && !t.parentElement?.closest("table") && isVisible(t)
	);
	const headings = headingsBefore(root, tables);
	return tables.map((t, i) => tableFromElement(t, headings[i])).filter((t): t is ReportTable => !!t);
}

/** Alerts and explicitly marked notes, e.g. the balance-sheet balance check. */
export function notesFromElement(root: HTMLElement): string[] {
	return Array.from(root.querySelectorAll<HTMLElement>(".alert, [data-pdf-note]"))
		.filter((el) => !el.closest("table, [data-pdf-ignore]") && isVisible(el))
		.map((el) => textOf(el).replace(/\n/g, " "))
		.filter(Boolean);
}

/** "Label: value" for each labelled filter control that has a value. */
export function filtersFromElement(root: HTMLElement | null): string[] {
	if (!root) return [];
	const result: string[] = [];
	root.querySelectorAll("label").forEach((label) => {
		const name = textOf(label).replace(/\n/g, " ").replace(/:$/, "");
		if (!name) return;
		const control = ((label.htmlFor && document.getElementById(label.htmlFor)) ||
			label.querySelector("select, input, textarea") ||
			label.parentElement?.querySelector("select, input:not([type=hidden]), textarea")) as HTMLInputElement | HTMLSelectElement | null;
		if (!control) return;
		let value = "";
		if (control instanceof HTMLSelectElement) value = Array.from(control.selectedOptions).map((o) => o.text).join(", ");
		else if (control.type === "checkbox" || control.type === "radio") value = control.checked ? "Yes" : "";
		else value = control.value;
		if (value && value.trim()) result.push(`${name}: ${value.trim()}`);
	});
	return result;
}

/**
 * Collects a report from the page. Tables registered as data sources (e.g. server-paginated
 * PrimeTables) supply their full dataset instead of the rows currently on screen.
 */
export async function collectReport(root: HTMLElement): Promise<{ tables: ReportTable[]; notes: string[] }> {
	const elements = Array.from(root.querySelectorAll("table")).filter(
		(t) => !t.closest("[data-pdf-ignore]") && !t.parentElement?.closest("table") && isVisible(t)
	);
	const headings = headingsBefore(root, elements);
	const tables: ReportTable[] = [];
	const notes = notesFromElement(root);
	const done = new Set<Element>();
	for (let i = 0; i < elements.length; i++) {
		const registered = findTableSource(elements[i], root);
		if (registered) {
			if (done.has(registered.element)) continue;
			done.add(registered.element);
			const result = await registered.source();
			result.tables.forEach((t) => tables.push({ ...t, heading: t.heading || headings[i] }));
			notes.push(...(result.notes || []));
			continue;
		}
		const table = tableFromElement(elements[i], headings[i]);
		if (table) tables.push(table);
	}
	return { tables, notes };
}

// ── Rendering ────────────────────────────────────────────────────────────

const NUMERIC = /^[\s(+-]*(GH[S₵]|₵)?\s*[\d,]+(\.\d+)?\s*%?\)?\s*(Dr|Cr)?$/i;

function isNumericColumn(table: ReportTable, col: number): boolean {
	const values: string[] = [];
	for (const row of table.body) {
		let pos = 0;
		for (const cell of row) {
			const span = typeof cell === "string" ? 1 : cell.colSpan || 1;
			if (pos === col && span === 1) values.push(cellText(cell).trim());
			pos += span;
		}
	}
	const filled = values.filter((v) => v && v !== "-" && v !== "—");
	return filled.length > 0 && filled.every((v) => NUMERIC.test(v));
}

function tableWidth(table: ReportTable): number {
	if (table.head?.length) return table.head.length;
	return Math.max(0, ...table.body.map((r) => r.reduce<number>((s, c) => s + (typeof c === "string" ? 1 : c.colSpan || 1), 0)));
}

export function reportFileName(title: string, period?: string): string {
	const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
	const date = new Date().toISOString().slice(0, 10);
	return `${[slug(title), period ? slug(period) : ""].filter(Boolean).join("_")}_${date}.pdf`;
}

/**
 * jsPDF's built-in fonts only cover Latin-1/WinAnsi, so glyphs such as the cedi sign (₵),
 * narrow no-break spaces from Intl formatting, or the Unicode minus print as garbage ("GH µ").
 * Currency is written as "GHS", consistent with the organization invoice PDF.
 */
export function pdfSafe(text: string): string {
	return text
		.replace(/(?:GH\s*)?\u20B5\s*/g, "GHS ")
		.replace(/[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g, " ")
		.replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")
		.replace(/[\u2212\u2010-\u2015]/g, "-")
		.replace(/[\u2018\u2019\u201A\u2032]/g, "'")
		.replace(/[\u201C\u201D\u201E\u2033]/g, '"')
		.replace(/\u2026/g, "...")
		.replace(/[\u2022\u2219]/g, "\u00B7")
		.replace(/\u2264/g, "<=")
		.replace(/\u2265/g, ">=")
		.replace(/\u2192/g, "->")
		.replace(/[^\n\t\u0020-\u007E\u00A0-\u00FF]/g, "");
}

function pdfSafeDeep<T>(value: T): T {
	if (typeof value === "string") return pdfSafe(value) as T;
	if (Array.isArray(value)) return value.map(pdfSafeDeep) as T;
	if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
		const out: Record<string, unknown> = {};
		for (const [key, inner] of Object.entries(value)) out[key] = pdfSafeDeep(inner);
		return out as T;
	}
	return value;
}

export function buildReportPdf(rawSpec: ReportPdfSpec, branding: CompanyBranding): jsPDF {
	const spec = pdfSafeDeep(rawSpec);
	const company = pdfSafeDeep(branding.company || {});
	const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape", compress: true });
	const pageWidth = doc.internal.pageSize.getWidth();
	const pageHeight = doc.internal.pageSize.getHeight();
	const margin = 12;
	const contentWidth = pageWidth - margin * 2;
	doc.setProperties({ title: spec.title, subject: "PLS report", creator: "Prime Laboratory Software" });

	// ── Letterhead ──────────────────────────────────────────
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
	const nameLines = doc.splitTextToSize(String(company.name || "Facility").toUpperCase(), 140);
	doc.text(nameLines, textLeft, y + 5);
	doc.setFont("helvetica", "normal");
	doc.setFontSize(8);
	doc.setTextColor(...MUTED);
	const lines = [
		company.motto || "",
		[company.address, company.street].filter(Boolean).join(", "),
		[phone(company.phonenumber) && `Tel: ${phone(company.phonenumber)}`, phone(company.alternativenumber)].filter(Boolean).join(" / "),
		[company.email, company.website].filter(Boolean).join("  ·  "),
	].filter(Boolean);
	let ly = y + 5 + 5.5 * nameLines.length - 1;
	for (const line of lines) {
		const wrapped = doc.splitTextToSize(String(line), 140);
		doc.text(wrapped, textLeft, ly);
		ly += 3.8 * wrapped.length;
	}

	doc.setFont("helvetica", "bold");
	doc.setFontSize(17);
	doc.setTextColor(...ACCENT);
	const titleLines = doc.splitTextToSize(spec.title, 110);
	doc.text(titleLines, pageWidth - margin, y + 6, { align: "right" });
	doc.setFont("helvetica", "normal");
	doc.setFontSize(8.5);
	doc.setTextColor(...MUTED);
	let ry = y + 6 + 6.5 * titleLines.length;
	for (const line of [spec.subtitle, spec.period, ...(spec.filters || [])].filter(Boolean) as string[]) {
		const wrapped = doc.splitTextToSize(line, 110);
		doc.text(wrapped, pageWidth - margin, ry, { align: "right" });
		ry += 4 * wrapped.length;
	}

	y = Math.max(ly, ry, y + 22) + 1;
	doc.setDrawColor(...ACCENT);
	doc.setLineWidth(0.7);
	doc.line(margin, y, pageWidth - margin, y);
	y += 5;

	// ── Notes ───────────────────────────────────────────────
	const notes = Array.from(new Set((spec.notes || []).map((n) => n.trim()).filter(Boolean)));
	if (notes.length) {
		doc.setFont("helvetica", "normal");
		doc.setFontSize(8.5);
		const wrapped = notes.map((n) => doc.splitTextToSize(n, contentWidth - 6) as string[]);
		const height = wrapped.reduce((h, w) => h + w.length * 4, 0) + 4;
		doc.setFillColor(...LIGHT);
		doc.rect(margin, y - 1, contentWidth, height, "F");
		doc.setTextColor(...INK);
		let ny = y + 3;
		for (const w of wrapped) {
			doc.text(w, margin + 3, ny);
			ny += 4 * w.length;
		}
		y += height + 4;
	}

	// ── Tables ──────────────────────────────────────────────
	const tables = spec.tables.filter((t) => tableWidth(t) > 0);
	if (!tables.length) {
		doc.setFontSize(10);
		doc.setTextColor(...INK);
		doc.text("No data for the selected filters.", margin, y + 4);
	}
	for (const table of tables) {
		const width = tableWidth(table);
		if (y > pageHeight - 30) {
			doc.addPage();
			y = margin;
		}
		if (table.heading) {
			doc.setFont("helvetica", "bold");
			doc.setFontSize(10);
			doc.setTextColor(...INK);
			doc.text(table.heading, margin, y + 3);
			y += 6;
		}
		// Many columns get a smaller (still legible) font instead of being clipped.
		const fontSize = width > 14 ? 6.5 : width > 10 ? 7 : 8;
		const align: Array<"left" | "right"> = Array.from({ length: width }, (_, i) => (isNumericColumn(table, i) ? "right" : "left"));
		const toCell = (cell: ReportCell, index: number): any => {
			if (typeof cell === "string") return { content: cell, styles: { halign: align[index] } };
			const styles: Record<string, any> = { halign: (cell.colSpan || 1) > 1 ? "left" : align[index] };
			if (cell.bold) styles.fontStyle = "bold";
			if (cell.section) styles.fillColor = LIGHT;
			if (cell.indent) styles.cellPadding = { top: 1.6, bottom: 1.6, right: 1.6, left: 1.6 + cell.indent * 4 };
			if (cell.tone === "danger") styles.textColor = DANGER;
			if (cell.tone === "success") styles.textColor = SUCCESS;
			if (cell.tone === "muted") styles.textColor = MUTED;
			return { content: cell.content, colSpan: cell.colSpan, styles };
		};
		const mapRow = (row: ReportCell[]) => {
			let pos = 0;
			return row.map((cell) => {
				const out = toCell(cell, pos);
				pos += typeof cell === "string" ? 1 : cell.colSpan || 1;
				return out;
			});
		};
		const body = table.body.length
			? table.body.map(mapRow)
			: [[{ content: "No records found.", colSpan: width, styles: { halign: "center", textColor: MUTED } }]];
		autoTable(doc, {
			startY: y,
			head: table.head?.length ? [table.head.map((h, i) => ({ content: h, styles: { halign: align[i] } }))] : undefined,
			body,
			foot: table.foot?.length ? table.foot.map(mapRow) : undefined,
			showHead: "everyPage",
			showFoot: "lastPage",
			theme: "grid",
			margin: { left: margin, right: margin, top: margin, bottom: 14 },
			styles: { font: "helvetica", fontSize, cellPadding: 1.6, textColor: INK, lineColor: [210, 214, 220], lineWidth: 0.1, overflow: "linebreak", valign: "middle" },
			headStyles: { fillColor: ACCENT, textColor: [255, 255, 255], fontStyle: "bold" },
			footStyles: { fillColor: LIGHT, textColor: INK, fontStyle: "bold" },
			alternateRowStyles: { fillColor: [248, 249, 251] },
		});
		y = ((doc as any).lastAutoTable?.finalY ?? y) + 8;
	}

	// ── Footer on every page ────────────────────────────────
	const total = doc.getNumberOfPages();
	const generated = new Date().toLocaleString("en-GB");
	for (let i = 1; i <= total; i++) {
		doc.setPage(i);
		doc.setDrawColor(220, 224, 230);
		doc.setLineWidth(0.3);
		doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);
		doc.setFont("helvetica", "normal");
		doc.setFontSize(7.5);
		doc.setTextColor(...MUTED);
		doc.text([company.name, spec.title].filter(Boolean).join("  ·  "), margin, pageHeight - 6);
		doc.text(`Generated ${generated}`, pageWidth / 2, pageHeight - 6, { align: "center" });
		doc.text(`Page ${i} of ${total}`, pageWidth - margin, pageHeight - 6, { align: "right" });
	}
	return doc;
}

export async function exportReportPdf(spec: ReportPdfSpec): Promise<void> {
	const branding = await loadCompanyBranding();
	buildReportPdf(spec, branding).save(reportFileName(spec.title, spec.period));
}

export function exportTablesCsv(tables: ReportTable[], title: string): void {
	const quote = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
	const row = (cells: ReportCell[]) =>
		cells.flatMap((c) => [quote(cellText(c).replace(/\n/g, " ")), ...Array(Math.max(0, (typeof c === "string" ? 1 : c.colSpan || 1) - 1)).fill('""')]).join(",");
	const lines = tables.flatMap((t) => [...(t.head ? [row(t.head)] : []), ...t.body.map(row), ...(t.foot || []).map(row)]);
	const url = URL.createObjectURL(new Blob(["\ufeff" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" }));
	const a = document.createElement("a");
	a.href = url;
	a.download = reportFileName(title).replace(/\.pdf$/, ".csv");
	a.click();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}
