'use client';
import { financialQuery, record, rowsOf, text, type RecordData } from '../../../../lib/pharmacyAccounting';
import { request } from './api';

const MAX_EXPORT = 10000;
export interface ExportData { rows: RecordData[]; metadata: RecordData }
/** Never export the current screen page as if it were the full filtered register. */
export async function fullFilteredExport(endpoint: string, filters: Record<string, string | number | boolean>, options: { ledger?: boolean; external?: boolean; unpaged?: boolean } = {}): Promise<ExportData> {
  if (options.ledger) {
    const value = await request<unknown>(`ledger?${financialQuery({ ...filters, all: true })}`);
    const metadata = record(value), rows = rowsOf(value);
    if (metadata.truncated === true || Number(metadata.total ?? rows.length) !== rows.length || rows.length > MAX_EXPORT) throw Error('The ledger export is incomplete or exceeds 10,000 rows. Narrow the filters.');
    return { rows, metadata };
  }
  const rows: RecordData[] = [], batchSize = 200;
  let metadata: RecordData = {}, previous = '';
  for (let page = 1; page <= MAX_EXPORT / batchSize + 1; page++) {
    const result = await request<unknown>(`${endpoint}?${financialQuery({ ...filters, page, count: batchSize, limit: batchSize, offset: (page - 1) * batchSize })}`, undefined, undefined, options.external);
    const data = record(result), batch = rowsOf(result);
    if (page === 1) metadata = data;
    if (data.truncated === true) throw Error('The server marked this export as truncated. Narrow the filters.');
    const fingerprint = JSON.stringify(batch);
    if (batch.length && previous === fingerprint) throw Error('This register did not advance pagination. Full export cannot be verified.');
    previous = fingerprint; rows.push(...batch);
    if (rows.length > MAX_EXPORT) throw Error('Exports are limited to 10,000 rows. Narrow the filters.');
    const total = data.total ?? record(data.totals).count;
    if (total !== undefined && rows.length >= Number(total)) {
      if (rows.length !== Number(total)) throw Error('Export row count changed during retrieval. Refresh and retry.');
      return { rows, metadata };
    }
    if (options.unpaged || batch.length < batchSize) {
      if (total !== undefined && rows.length < Number(total)) throw Error('The export is incomplete. Narrow the filters or retry.');
      return { rows, metadata };
    }
  }
  throw Error('Full export could not be verified within 10,000 rows. Narrow the filters.');
}
const heading = (key: string) => key.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
export async function downloadAccountingExport(format: 'xlsx' | 'pdf', title: string, data: ExportData, context: string) {
  const detectedColumns = Array.isArray(data.metadata.columns) ? data.metadata.columns.map(c => typeof c === 'string' ? c : String(record(c).key || record(c).field || '')).filter(Boolean)
    : Array.from(new Set(data.rows.flatMap(row => Object.keys(row))));
  for(const key of ['account_name','document_ref']) if(data.rows.some(row=>row[key])&&!detectedColumns.includes(key)) detectedColumns.push(key);
  const columns = detectedColumns.length ? detectedColumns : ['record'];
  const body = data.rows.map(row => columns.map(key => text(row[key])));
  const totals = Object.entries(record(data.metadata.totals)).map(([key, value]) => [heading(key), text(value)]);
  const issues = rowsOf(data.metadata.classificationIssues);
  const warning = issues.length ? 'WARNING: Cash-flow classification is incomplete. Unclassified movements require review.' : '';
  const balances = ['openingBalance','closingBalance'].filter(key => data.metadata[key] != null).map(key => [heading(key), text(data.metadata[key])]);
  if (format === 'xlsx') {
    const XLSX = await import('xlsx');
    const sheet = XLSX.utils.aoa_to_sheet([[title], [context], ...(warning ? [[warning]] : []), [], columns.map(heading), ...body, [], ...balances, ...totals]);
    const book = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book, sheet, 'Accounting');
    if (issues.length) XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(issues), 'Classification issues');
    const accountBalances = rowsOf(data.metadata.accountBalances);
    if (accountBalances.length) XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(accountBalances), 'Account balances');
    // aoa_to_sheet treats source strings as strings, not executable formulas.
    XLSX.writeFile(book, `${title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.xlsx`);
  } else {
    const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
    const doc = new jsPDF({ orientation: columns.length > 6 ? 'landscape' : 'portrait' });
    doc.setFontSize(14); doc.text(title, 14, 16); doc.setFontSize(9); doc.text(context, 14, 23);
    if (warning) doc.text(doc.splitTextToSize(warning, doc.internal.pageSize.getWidth() - 28), 14, 30);
    autoTable(doc, { startY: warning ? 42 : 29, head: [columns.map(heading)], body, styles: { fontSize: 8, overflow: 'linebreak' }, showHead: 'everyPage' });
    if (balances.length || totals.length) {
      const lastY = (doc as typeof doc & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 29;
      autoTable(doc, { startY: lastY + 10, head: [['Measure','Value']], body: [...balances, ...totals], styles: { fontSize: 9 }, columnStyles: { 1: { halign: 'right' } } });
    }
    if (issues.length) { doc.addPage(); doc.text('Classification issues', 14, 16); autoTable(doc, { startY: 22, head: [['Journal','Description','Amount']], body: issues.map(row => [text(row.journalId), text(row.description), text(row.amount)]) }); }
    const accountBalances = rowsOf(data.metadata.accountBalances);
    if (accountBalances.length) { doc.addPage(); doc.text('Account balances', 14, 16); autoTable(doc, { startY: 22, head: [['Account','Opening','Closing']], body: accountBalances.map(row => [text(row.account),text(row.opening),text(row.closing)]) }); }
    doc.save(`${title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.pdf`);
  }
}
