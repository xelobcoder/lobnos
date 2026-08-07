import { customFetch, customPost } from '../../../components/Auth/customFetch';

export type EmailTemplate = {
     id?: number;
     name: string;
     category: string;
     subject: string;
     htmlBody?: string;
     plainTextBody?: string;
     html_body?: string;
     plain_text_body?: string;
     variables?: string[];
     variables_json?: string;
     status?: 'active' | 'archived' | string;
     created_at?: string;
     updated_at?: string;
};

export type EmailProvider = {
     id?: number;
     name: string;
     providerType?: string;
     provider_type?: string;
     host: string;
     port: number;
     secure?: boolean;
     username: string;
     password?: string;
     fromEmail?: string;
     from_email?: string;
     fromName?: string;
     from_name?: string;
     isDefault?: boolean;
     is_default?: boolean;
     isActive?: boolean;
     is_active?: boolean;
};

export type EmailSettings = {
     defaultProviderId: number | null;
     maxAttachmentSizeMb: number;
     maxRetries: number;
     retryBackoffMinutes: number[];
     allowMarketingEmails: boolean;
};

export type QueueItem = {
     id: number;
     status: string;
     priority?: string;
     subject?: string;
     retry_count?: number;
     scheduled_at?: string;
     created_at?: string;
     to_json?: string;
     cc_json?: string;
     bcc_json?: string;
     html_body?: string;
     plain_text_body?: string;
     variables_json?: string;
};

export type EmailLog = {
     id: number;
     queue_id?: number;
     provider_id?: number;
     status?: string;
     recipients_json?: string;
     subject?: string;
     response_payload_json?: string;
     failure_reason?: string | null;
     duration_ms?: number;
     created_at?: string;
};

export const TEMPLATE_CATEGORIES = ['authentication', 'patient', 'clinician', 'organization', 'internal', 'marketing'];
export const STATUS_OPTIONS = ['active', 'archived'];
export const PRIORITIES = ['low', 'normal', 'high'];
export const QUEUE_STATUSES = ['pending', 'processing', 'sent', 'failed', 'scheduled', 'cancelled'];
export const VARIABLE_CHIPS = ['{{PatientName}}', '{{InvoiceNumber}}', '{{ResultName}}', '{{BranchName}}', '{{DoctorName}}'];

export const defaultTemplateForm: EmailTemplate = {
     name: '',
     category: 'patient',
     subject: '',
     htmlBody: '',
     plainTextBody: '',
     variables: [],
     status: 'active',
};

export const defaultProviderForm: EmailProvider = {
     name: '',
     providerType: 'smtp',
     host: '',
     port: 587,
     secure: false,
     username: '',
     password: '',
     fromEmail: '',
     fromName: '',
     isDefault: false,
     isActive: true,
};

export const defaultSettingsForm: EmailSettings = {
     defaultProviderId: null,
     maxAttachmentSizeMb: 10,
     maxRetries: 3,
     retryBackoffMinutes: [2, 10, 30],
     allowMarketingEmails: true,
};

export const defaultQueueForm = {
     templateId: '',
     providerId: '',
     to: '',
     cc: '',
     bcc: '',
     subject: '',
     htmlBody: '',
     plainTextBody: '',
     variablesJson: '{\n  "PatientName": "John Doe"\n}',
     attachmentsJson: '[]',
     scheduledAt: '',
     priority: 'normal',
     referenceType: '',
     referenceId: '',
};

export function parseList<T>(response: any): T[] {
     if (Array.isArray(response?.result)) return response.result as T[];
     if (Array.isArray(response)) return response as T[];
     return [];
}

export function parseJsonArray(value: string | undefined): any[] {
     if (!value) return [];
     try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [];
     } catch (_err) {
          return [];
     }
}

export function parseJsonObject(value: string | undefined): Record<string, any> {
     if (!value) return {};
     try {
          const parsed = JSON.parse(value);
          return parsed && typeof parsed === 'object' ? parsed : {};
     } catch (_err) {
          return {};
     }
}

export function mapTemplateFromApi(item: any): EmailTemplate {
     return {
          ...item,
          htmlBody: item.htmlBody ?? item.html_body ?? '',
          plainTextBody: item.plainTextBody ?? item.plain_text_body ?? '',
          variables: item.variables ?? (parseJsonArray(item.variables_json) as string[]),
          status: item.status ?? 'active',
     };
}

export function mapProviderFromApi(item: any): EmailProvider {
     return {
          ...item,
          providerType: item.providerType ?? item.provider_type ?? 'smtp',
          fromEmail: item.fromEmail ?? item.from_email ?? '',
          fromName: item.fromName ?? item.from_name ?? '',
          isDefault: item.isDefault ?? item.is_default ?? false,
          isActive: item.isActive ?? item.is_active ?? true,
     };
}

export function statusBadge(status: string | undefined) {
     const normalized = (status || '').toLowerCase();
     if (normalized === 'sent' || normalized === 'active') return 'success';
     if (normalized === 'pending' || normalized === 'processing' || normalized === 'scheduled') return 'warning';
     if (normalized === 'failed' || normalized === 'cancelled' || normalized === 'archived') return 'secondary';
     return 'info';
}

export async function callGet(endpoint: string) {
     const response = await customFetch(endpoint);
     if (response?.status === 'error') {
          throw new Error(response?.message || 'Request failed. Please try again.');
     }
     return response;
}

export async function callMutate(endpoint: string, method: string, body: any = {}) {
     const response = await customPost(endpoint, method, body);
     if (!response) throw new Error('Request failed. Please try again.');
     if (response?.status === 'error') {
          throw new Error(response?.message || 'Request failed. Please try again.');
     }
     return response;
}
