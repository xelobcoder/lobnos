import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {ACCENT, INK, MUTED, formatDate, imageFormat, phone} from '../components/invoices/organizationInvoicePdf';

type Party = {name?: string; address?: string; street?: string; motto?: string; phone?: string; phonenumber?: string; alternativenumber?: string; email?: string; website?: string};
export type SupplierInvoiceDocument = {
  id: string;
  amount: number | string;
  created_at: string;
  supplier?: Party;
  details: {
    reference: string;
    supplierName?: string;
    invoiceDate?: string;
    dueDate?: string;
    inventoryAmount?: number | string;
    recoverableTax?: {amount: number | string} | null;
    reason?: string;
    lines?: Array<{
      name: string; sku?: string; batchNumber?: string; expiryDate?: string;
      deliveryReference?: string; quantity: number; amount: number | string;
    }>;
  };
};

const amount = (value: number | string) => Number(value).toLocaleString('en-GH', {minimumFractionDigits: 2, maximumFractionDigits: 2});
const finalY = (doc: jsPDF) => (doc as jsPDF & {lastAutoTable: {finalY: number}}).lastAutoTable.finalY;

/** Uses the saved invoice allocations and totals, with repeated headings and unsplit line items. */
export function buildSupplierInvoicePdf(invoice: SupplierInvoiceDocument, facility: Party, logo?: string | null): jsPDF {
  const doc = new jsPDF({unit: 'mm', format: 'a4', compress: true});
  const detail = invoice.details, supplier = invoice.supplier || {};
  const margin = 15, width = 180, bottom = 272;
  const reference = detail.reference || invoice.id;
  const tax = Number(detail.recoverableTax?.amount || 0);
  const subtotal = detail.inventoryAmount ?? Number(invoice.amount) - tax;
  doc.setProperties({title: `Supplier invoice ${reference}`, subject: 'Recorded supplier invoice copy', creator: 'Prime Laboratory Software'});

  let letterheadLeft = margin;
  if (logo) {
    try {
      const image = doc.getImageProperties(logo), scale = Math.min(22 / image.width, 22 / image.height);
      doc.addImage(logo, imageFormat(logo), margin, margin, image.width * scale, image.height * scale);
      letterheadLeft += 26;
    }
    catch {letterheadLeft = margin;}
  }
  const facilityContact = [phone(facility.phonenumber || facility.phone), phone(facility.alternativenumber)].filter(Boolean).join(' / ');
  autoTable(doc, {
    startY: margin, margin: {left: letterheadLeft, right: margin}, tableWidth: 195 - letterheadLeft,
    theme: 'plain', styles: {cellPadding: 0, fontSize: 9, textColor: MUTED, overflow: 'linebreak'},
    body: [
      [{content: facility.name || 'Pharmacy', styles: {fontSize: 15, fontStyle: 'bold', textColor: ACCENT, cellPadding: {bottom: 2}}}],
      ...[facility.motto, [facility.address, facility.street].filter(Boolean).join(', '), facilityContact,
        [facility.email, facility.website].filter(Boolean).join(' | ')].filter(Boolean).map(value => [value!]),
    ],
  });
  const letterheadEnd = Math.max(finalY(doc), logo ? 37 : 0) + 6;
  doc.setDrawColor(...ACCENT); doc.setLineWidth(0.6); doc.line(margin, letterheadEnd, 195, letterheadEnd);

  autoTable(doc, {
    startY: letterheadEnd + 7, margin: {left: margin, right: margin}, tableWidth: width,
    theme: 'plain', styles: {cellPadding: 0, fontSize: 14, textColor: INK, overflow: 'linebreak', valign: 'top'},
    columnStyles: {0: {cellWidth: 96, cellPadding: {right: 8}, fontStyle: 'bold'}, 1: {cellWidth: 84, halign: 'right', fontStyle: 'bold', textColor: ACCENT}},
    body: [[supplier.name || detail.supplierName || 'Supplier', 'SUPPLIER INVOICE']],
  });
  let y = finalY(doc) + 3;
  autoTable(doc, {
    startY: y, margin: {left: margin, right: margin}, tableWidth: width,
    theme: 'plain', styles: {cellPadding: 0, fontSize: 9, textColor: MUTED, overflow: 'linebreak', valign: 'top'},
    columnStyles: {0: {cellWidth: 96, cellPadding: {right: 8}}, 1: {cellWidth: 84, halign: 'right'}},
    body: [[[supplier.address, supplier.phone, supplier.email].filter(Boolean).join('\n'), `${reference}\nRecorded copy`]],
  });
  y = finalY(doc) + 5;
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(0.6);
  doc.line(margin, y, margin + width, y);
  y += 6;
  autoTable(doc, {
    startY: y, margin: {left: margin, right: margin}, tableWidth: width,
    theme: 'plain', styles: {cellPadding: 1, fontSize: 9, textColor: INK, overflow: 'linebreak', valign: 'top'},
    columnStyles: {0: {cellWidth: 100}, 1: {cellWidth: 42, textColor: MUTED}, 2: {cellWidth: 38, halign: 'right'}},
    body: [
      [{content: 'BILL TO', styles: {textColor: MUTED, fontSize: 8}}, 'Invoice date', formatDate(detail.invoiceDate || invoice.created_at)],
      [{content: facility.name || 'Pharmacy', styles: {fontStyle: 'bold'}}, 'Due date', detail.dueDate ? formatDate(detail.dueDate) : 'Not recorded'],
      [[facility.address, facility.phonenumber || facility.phone, facility.email].filter(Boolean).join('\n'), 'Currency', 'GHS'],
    ],
  });
  y = finalY(doc) + 7;

  autoTable(doc, {
    startY: y, margin: {left: margin, right: margin, top: 25, bottom: 25}, tableWidth: width,
    theme: 'plain', showHead: 'everyPage', rowPageBreak: 'avoid',
    styles: {fontSize: 9, cellPadding: 2.5, textColor: INK, overflow: 'linebreak', valign: 'top', lineColor: [220, 228, 223], lineWidth: {bottom: 0.15}},
    headStyles: {fillColor: [237, 245, 239], textColor: INK, fontStyle: 'bold', fontSize: 8},
    columnStyles: {0: {cellWidth: 99}, 1: {cellWidth: 21, halign: 'right'}, 2: {cellWidth: 30, halign: 'right'}, 3: {cellWidth: 30, halign: 'right'}},
    head: [['Medicine / batch', 'Quantity', 'Unit amount\n(GHS)', 'Amount\n(GHS)']],
    body: (detail.lines || []).map(line => [
      [line.name, line.sku, line.batchNumber && `Batch ${line.batchNumber}`,
        line.expiryDate && `Expiry ${formatDate(line.expiryDate)}`, line.deliveryReference && `Delivery ${line.deliveryReference}`].filter(Boolean).join('\n'),
      Number(line.quantity).toLocaleString('en-GH', {maximumFractionDigits: 3}),
      Number(line.quantity) > 0 ? (Number(line.amount) / Number(line.quantity)).toLocaleString('en-GH', {minimumFractionDigits: 2, maximumFractionDigits: 6}) : '-',
      amount(line.amount),
    ]),
  });
  y = finalY(doc) + 6;
  if (y + (tax > 0 ? 40 : 30) > bottom) {doc.addPage(); y = 25;}
  autoTable(doc, {
    startY: y, margin: {left: 105, right: margin}, tableWidth: 90, theme: 'plain',
    styles: {cellPadding: 2.5, fontSize: 10, textColor: INK},
    columnStyles: {0: {cellWidth: 58}, 1: {cellWidth: 32, halign: 'right'}},
    body: [
      ['Subtotal (GHS)', amount(subtotal)],
      ...(tax > 0 ? [['Recoverable purchase tax (GHS)', amount(tax)]] : []),
      [{content: 'INVOICE TOTAL (GHS)', styles: {fontStyle: 'bold', fillColor: [237, 245, 239]}},
        {content: amount(invoice.amount), styles: {fontStyle: 'bold', fillColor: [237, 245, 239]}}],
    ],
  });
  y = finalY(doc) + 8;
  if (detail.reason) {
    autoTable(doc, {
      startY: y, margin: {left: margin, right: margin, top: 25, bottom: 25}, tableWidth: width,
      theme: 'plain', styles: {cellPadding: 1, fontSize: 9, textColor: MUTED, overflow: 'linebreak'},
      body: [[{content: 'Invoice note', styles: {fontStyle: 'bold'}}], [detail.reason]],
    });
  }

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    if (page > 1) {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...INK);
      doc.text('SUPPLIER INVOICE - CONTINUED', margin, 15);
    }
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...MUTED);
    doc.setDrawColor(220, 228, 223); doc.setLineWidth(0.15); doc.line(margin, 278, 195, 278);
    doc.text(`Record ${invoice.id}`, margin, 283);
    doc.text(`Page ${page} of ${pages}`, 195, 283, {align: 'right'});
    doc.text('Recorded copy from matched supplier delivery quantities.', margin, 287);
  }
  return doc;
}
