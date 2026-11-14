import { customFetch, customFetchMutation } from '../../components/Auth/customFetch';

/**
 * Server-action calls take endpoints RELATIVE to the backend API base, which already ends in
 * `/api/v1/` (for example `reports/datasets`). Prefixing them with `/api/v1/` produces a
 * double-prefixed URL and an HTML 404. Browser-facing export URLs below intentionally start with
 * `/api/v1/` because they are handled by the Next catch-all proxy, not by a server action.
 */

export type ReportColumnType = 'string' | 'number' | 'money' | 'date';
export type ReportOperator = 'eq' | 'neq' | 'in' | 'contains' | 'between' | 'gte' | 'lte';

export interface DatasetColumnMeta {
     key: string;
     label: string;
     type: ReportColumnType;
     groupable: boolean;
     filterable: boolean;
     aggregate: 'sum' | 'avg' | 'min' | 'max' | null;
}

export interface DatasetMeta {
     id: string;
     label: string;
     description: string;
     dateColumn: string;
     defaultColumns: string[];
     columns: DatasetColumnMeta[];
}

export interface ReportFilter {
     column: string;
     operator: ReportOperator;
     value: unknown;
}

export interface ReportDefinition {
     dataset: string;
     columns: string[];
     filters?: ReportFilter[];
     groupBy?: string[];
     sort?: Array<{ column: string; direction: 'asc' | 'desc' }>;
     limit?: number;
}

export interface ReportResult {
     columns: Array<{ key: string; label: string; type: ReportColumnType | 'count' }>;
     rows: Array<Record<string, unknown>>;
     grouped: boolean;
     limit: number;
     dataset?: string;
     datasetLabel?: string;
     name?: string;
     definition?: ReportDefinition;
}

export interface SavedReport {
     id: string;
     name: string;
     description: string | null;
     dataset: string;
     visibility: 'private' | 'facility';
     owner_employeeid: number;
     definition: ReportDefinition;
     created_at: string;
     updated_at: string;
}

function unwrap<T>(response: any, fallback: string): T {
     if (!response || response.status === false || response.status === 'error') {
          throw new Error(response?.message || fallback);
     }
     return response.data as T;
}

export async function fetchReportDatasets(): Promise<DatasetMeta[]> {
     return unwrap<DatasetMeta[]>(await customFetch('reports/datasets'), 'Unable to load report datasets.');
}

export async function previewReport(definition: ReportDefinition): Promise<ReportResult> {
     return unwrap<ReportResult>(await customFetchMutation('reports/preview', 'POST', { definition }), 'Unable to run the report.');
}

export async function listSavedReports(): Promise<SavedReport[]> {
     return unwrap<SavedReport[]>(await customFetch('reports'), 'Unable to load saved reports.');
}

export async function getSavedReport(id: string): Promise<SavedReport> {
     return unwrap<SavedReport>(await customFetch(`reports/${id}`), 'Unable to load the report.');
}

export async function saveReport(input: {
     name: string;
     description?: string | null;
     visibility: 'private' | 'facility';
     definition: ReportDefinition;
}): Promise<SavedReport> {
     return unwrap<SavedReport>(await customFetchMutation('reports', 'POST', input), 'Unable to save the report.');
}

export async function runSavedReport(id: string): Promise<ReportResult> {
     return unwrap<ReportResult>(await customFetchMutation(`reports/${id}/run`, 'POST', {}), 'Unable to run the report.');
}

export async function deleteSavedReport(id: string): Promise<void> {
     unwrap<{ removed: boolean }>(await customFetchMutation(`reports/${id}`, 'DELETE'), 'Unable to delete the report.');
}

function saveBlob(blob: Blob, filename: string) {
     const url = URL.createObjectURL(blob);
     const anchor = document.createElement('a');
     anchor.href = url;
     anchor.download = filename;
     document.body.appendChild(anchor);
     anchor.click();
     anchor.remove();
     URL.revokeObjectURL(url);
}

async function readError(response: Response): Promise<string> {
     try {
          const body = await response.json();
          return body?.message || 'The export could not be created.';
     } catch {
          return 'The export could not be created.';
     }
}

export async function downloadReportExport(definition: ReportDefinition, format: 'csv' | 'xlsx'): Promise<void> {
     const response = await fetch('/api/v1/reports/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ format, definition }),
     });
     if (!response.ok) throw new Error(await readError(response));
     saveBlob(await response.blob(), `report.${format}`);
}

export async function downloadSavedReport(id: string, format: 'csv' | 'xlsx', name: string): Promise<void> {
     const response = await fetch(`/api/v1/reports/${encodeURIComponent(id)}/export?format=${format}`);
     if (!response.ok) throw new Error(await readError(response));
     const stem = (name || 'report').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'report';
     saveBlob(await response.blob(), `${stem}.${format}`);
}
