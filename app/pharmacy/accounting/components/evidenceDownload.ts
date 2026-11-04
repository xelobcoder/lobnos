'use client';
import { getRequestContext } from '../../../../components/serverActions/requestHeaders';
import { buildApiUrl } from '../../../../lib/apiBaseUrl';
import { errorMessage } from '../../../../lib/pharmacyAccounting';

export async function downloadExpenseEvidence(expenseId: string, attachmentId: string, filename: string) {
  const context = await getRequestContext();
  if (!context.authenticated || !context.tenantId) throw Error('A valid authenticated tenant session is required.');
  const endpoint = `pharmacy/accounting/expenses/${encodeURIComponent(expenseId)}/attachments/${encodeURIComponent(attachmentId)}/content`;
  const url = new URL(buildApiUrl(endpoint)); url.searchParams.set('tenantId', String(context.tenantId));
  const response = await fetch(url.toString(), { credentials: 'include', cache: 'no-store' });
  if (!response.ok) throw Error(errorMessage(await response.json().catch(() => ({}))));
  const blobUrl = URL.createObjectURL(await response.blob()), anchor = document.createElement('a');
  anchor.href = blobUrl; anchor.download = filename.replace(/[\\/]/g,'-'); anchor.click();
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}
