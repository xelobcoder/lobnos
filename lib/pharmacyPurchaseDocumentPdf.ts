import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ACCENT, INK, MUTED, formatDate, imageFormat, phone } from '../components/invoices/organizationInvoicePdf';
import type { PurchaseDocumentSpec } from './pharmacyPurchaseOrder';

/**
 * A4 pharmacy purchase order / purchase request. Same letterhead, information blocks, striped item
 * table, summary box, sign-off, status stamp and footer as the organizational credit invoice, but
 * quantity-only: purchase documents never carry agreed prices.
 */
export type PurchaseBranding = { company: Record<string, any>; logo: string | null };

const DANGER: [number, number, number] = [200, 35, 51];
const quantity = (value: number) => String(Number(Number(value || 0).toFixed(3)));

export function buildPurchaseDocumentPdf(spec: PurchaseDocumentSpec, branding: PurchaseBranding): jsPDF {
  const order = spec.kind === 'order';
  const company = branding.company || {};
  const title = order ? 'PURCHASE ORDER' : 'PURCHASE REQUEST';
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  doc.setProperties({ title: `${order ? 'Purchase order' : 'Purchase request'} ${spec.reference}`, subject: order ? 'Pharmacy purchase order' : 'Pharmacy purchase requisition', creator: 'Prime Laboratory Software' });

  // ── Letterhead ─────────────────────────────────────────────
  let y = margin;
  let textLeft = margin;
  if (branding.logo) {
    try {
      doc.addImage(branding.logo, imageFormat(branding.logo), margin, y, 22, 22);
      textLeft = margin + 26;
    } catch {
      textLeft = margin;
    }
  }
  doc.setTextColor(...ACCENT);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(doc.splitTextToSize((company.name || 'Facility').toUpperCase(), 100), textLeft, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  const companyLines = [
    company.motto || '',
    [company.address, company.street].filter(Boolean).join(', '),
    [phone(company.phonenumber) && `Tel: ${phone(company.phonenumber)}`, phone(company.alternativenumber)].filter(Boolean).join(' / '),
    [company.email, company.website].filter(Boolean).join('  ·  '),
  ].filter(Boolean);
  let companyY = y + 10.5;
  for (const line of companyLines) {
    const wrapped = doc.splitTextToSize(line, 100);
    doc.text(wrapped, textLeft, companyY);
    companyY += 4 * wrapped.length;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...ACCENT);
  doc.text(title, pageWidth - margin, y + 8, { align: 'right' });
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(order ? 'PHARMACY PROCUREMENT' : 'INTERNAL REQUISITION', pageWidth - margin, y + 13, { align: 'right' });

  y = Math.max(companyY, y + 24) + 2;
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  if (spec.banner) {
    doc.setFillColor(253, 236, 238);
    doc.rect(margin, y - 4, contentWidth, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...DANGER);
    doc.text(spec.banner, pageWidth / 2, y + 1.2, { align: 'center' });
    y += 10;
  }

  // ── From / Supplier or Purpose / Document details ──────────
  const colWidth = (contentWidth - 8) / 3;
  const block = (heading: string, x: number, rows: string[], bold?: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(heading, x, y);
    let rowY = y + 5;
    if (bold) {
      doc.setFontSize(10);
      doc.setTextColor(...INK);
      const wrapped = doc.splitTextToSize(bold, colWidth);
      doc.text(wrapped, x, rowY);
      rowY += 4.5 * wrapped.length;
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...INK);
    for (const row of rows.filter(Boolean)) {
      const wrapped = doc.splitTextToSize(row, colWidth);
      doc.text(wrapped, x, rowY);
      rowY += 4 * wrapped.length;
    }
    return rowY;
  };
  const facilityAddress = [company.address, company.street].filter(Boolean).join(', ');
  const fromEnd = block(order ? 'FROM — ORDERING FACILITY' : 'FROM — REQUESTING FACILITY', margin, [
    facilityAddress,
    phone(company.phonenumber) ? `Tel: ${phone(company.phonenumber)}` : '',
    company.email || '',
    order ? `Deliver to: Pharmacy store${facilityAddress ? `, ${facilityAddress}` : ''}` : 'Department: Pharmacy',
  ], company.name || 'Facility');
  const secondEnd = order
    ? block('TO — SUPPLIER', margin + colWidth + 4, [
      'Attn: Sales / Orders Department',
      phone(spec.supplier?.phone) ? `Tel: ${phone(spec.supplier?.phone)}` : '',
      spec.supplier?.email || '',
    ], spec.supplier?.name || 'Supplier')
    : block('PURPOSE OF REQUEST', margin + colWidth + 4, [
      spec.purpose || 'Restock pharmacy medicines',
      spec.supplier?.name ? `Preferred supplier: ${spec.supplier.name}` : 'Supplier: selected when the order is raised',
    ]);

  const metaX = margin + (colWidth + 4) * 2;
  const metaRows: string[][] = [
    [order ? 'PO No.' : 'Request No.', spec.reference],
    [order ? 'Order Date' : 'Request Date', formatDate(spec.date) || '—'],
    ['Status', spec.statusLabel],
    ['Medicines', String(spec.lines.length)],
  ];
  if (spec.requestedBy) metaRows.push([order ? 'Prepared by' : 'Requested by', spec.requestedBy]);
  autoTable(doc, {
    startY: y - 3,
    margin: { left: metaX, right: margin },
    tableWidth: colWidth,
    theme: 'plain',
    styles: { fontSize: 8.5, cellPadding: { top: 1, bottom: 1, left: 1.5, right: 1.5 }, textColor: INK },
    columnStyles: { 0: { textColor: MUTED, cellWidth: 24 }, 1: { fontStyle: 'bold', halign: 'right' } },
    body: metaRows,
  });
  const metaEnd = (doc as any).lastAutoTable.finalY as number;
  y = Math.max(fromEnd, secondEnd, metaEnd) + 6;

  // ── Line items (quantities only) ───────────────────────────
  const approvedShown = !order && spec.lines.some(line => line.approved != null);
  const notesShown = spec.lines.some(line => line.note);
  const head = order ? ['#', 'Medicine / Description', 'Unit', 'Qty Ordered', 'Qty Supplied'] : ['#', 'Medicine / Description', 'Unit', 'Qty Requested'];
  if (approvedShown) head.push('Qty Approved');
  if (notesShown) head.push(order ? 'Remarks' : 'Review Note');
  const body = spec.lines.map((line, index) => {
    const row = [String(index + 1), line.name, line.unit || 'units', quantity(line.quantity)];
    if (order) row.push('');
    if (approvedShown) row.push(line.approved == null ? 'Pending' : quantity(line.approved));
    if (notesShown) row.push(line.note || '');
    return row;
  });
  const columnStyles: Record<number, any> = { 0: { cellWidth: 8, halign: 'center' }, 2: { cellWidth: 22 } };
  for (let i = 3; i < head.length; i++) columnStyles[i] = head[i].startsWith('Qty') ? { halign: 'right', cellWidth: 24 } : { cellWidth: 40 };
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin, top: 20, bottom: 20 },
    head: [head],
    body,
    theme: 'striped',
    headStyles: { fillColor: ACCENT, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8, halign: 'center' },
    styles: { fontSize: 8.5, cellPadding: 1.8, textColor: INK, overflow: 'linebreak', valign: 'middle' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles,
  });
  y = (doc as any).lastAutoTable.finalY + 4;

  // ── Summary box (in place of invoice totals) ───────────────
  const total = spec.lines.reduce((sum, line) => sum + Number(line.quantity || 0), 0);
  const summaryRows: string[][] = [['Medicines', String(spec.lines.length)], [order ? 'Total quantity ordered' : 'Total quantity requested', quantity(total)]];
  if (approvedShown) summaryRows.push(['Total quantity approved', quantity(spec.lines.reduce((sum, line) => sum + Number(line.approved || 0), 0))]);
  const summaryWidth = 82;
  if (y + 8 + summaryRows.length * 6 + 14 > pageHeight - 25) {
    doc.addPage();
    y = 20;
  }
  const summaryTop = y;
  autoTable(doc, {
    startY: y,
    margin: { left: pageWidth - margin - summaryWidth, right: margin },
    tableWidth: summaryWidth,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: { top: 1.2, bottom: 1.2, left: 2, right: 2 }, textColor: INK },
    columnStyles: { 0: { textColor: MUTED }, 1: { halign: 'right' } },
    body: summaryRows,
  });
  y = (doc as any).lastAutoTable.finalY + 1;
  doc.setFillColor(...ACCENT);
  doc.rect(pageWidth - margin - summaryWidth, y, summaryWidth, 11, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(order ? 'ITEMS ON ORDER' : 'REQUEST STATUS', pageWidth - margin - summaryWidth + 3, y + 7);
  doc.setFontSize(11);
  doc.text(order ? `${spec.lines.length} ${spec.lines.length === 1 ? 'medicine' : 'medicines'}` : spec.statusLabel, pageWidth - margin - 3, y + 7.3, { align: 'right' });
  const summaryBottom = y + 11;

  // Instructions sit beside the summary, as payment instructions do on the invoice.
  const leftWidth = contentWidth - summaryWidth - 8;
  let leftY = summaryTop + 3;
  const section = (heading: string, texts: string[]) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(heading, margin, leftY);
    leftY += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...INK);
    for (const text of texts.filter(Boolean)) {
      const wrapped = doc.splitTextToSize(text, leftWidth);
      doc.text(wrapped, margin, leftY);
      leftY += 4 * wrapped.length + 1;
    }
    leftY += 2;
  };
  section(order ? 'SUPPLIER INSTRUCTIONS' : 'REVIEW NOTES', order ? [
    'Please supply the medicines and quantities listed above.',
    'Prices are confirmed on your delivery note or invoice; this order does not fix prices.',
    `Quote ${spec.reference} on your delivery note and invoice.`,
  ] : [
    'Internal requisition for review. It is not an order to a supplier and commits no prices.',
    'After approval, a purchase order is raised for the approved quantities.',
  ]);
  if (spec.decisionReason) section('DECISION REASON', [spec.decisionReason]);
  if (spec.notes) section('NOTES', [spec.notes]);
  y = Math.max(summaryBottom, leftY) + 8;

  // ── Sign-off ──────────────────────────────────────────────
  if (y + 26 > pageHeight - 20) {
    doc.addPage();
    y = 25;
  }
  doc.setDrawColor(...MUTED);
  doc.setLineWidth(0.3);
  doc.line(margin, y + 10, margin + 70, y + 10);
  doc.line(pageWidth - margin - 70, y + 10, pageWidth - margin, y + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(order ? 'Prepared by (name & signature)' : 'Requested by (name & signature)', margin, y + 14);
  doc.text('Authorized by (name, signature & stamp)', pageWidth - margin - 70, y + 14);
  if (order) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(...ACCENT);
    doc.text('Thank you for your prompt delivery.', pageWidth - margin, y + 22, { align: 'right' });
  }

  // ── Status stamp, footer & page numbers on every page ─────
  const pageCount = doc.getNumberOfPages();
  const generated = new Date().toLocaleString('en-GB');
  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);
    if (spec.stamp) {
      doc.saveGraphicsState();
      doc.setGState(new (doc as any).GState({ opacity: 0.12 }));
      doc.setTextColor(...DANGER);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(spec.stamp.length > 10 ? 56 : 80);
      doc.text(spec.stamp, pageWidth / 2, pageHeight / 2, { align: 'center', angle: 30 });
      doc.restoreGraphicsState();
    }
    doc.setDrawColor(220, 224, 230);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(`${company.name || ''}  ·  ${order ? 'Purchase order' : 'Purchase request'} ${spec.reference}`, margin, pageHeight - 9);
    doc.text(`Generated ${generated}`, pageWidth / 2, pageHeight - 9, { align: 'center' });
    doc.text(`Page ${page} of ${pageCount}`, pageWidth - margin, pageHeight - 9, { align: 'right' });
    if (spec.banner) {
      doc.setTextColor(...DANGER);
      doc.text(spec.banner, margin, pageHeight - 5);
    }
  }
  return doc;
}
