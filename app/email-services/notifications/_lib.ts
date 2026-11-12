import { callGet, callMutate, parseList } from '../_lib';

export type NotificationEvent = {
     id?: number;
     event_code: string;
     event_name?: string;
     module?: string;
     is_active?: boolean;
};

export type EventSetting = {
     emailEnabled: boolean;
     smsEnabled: boolean;
     whatsappEnabled: boolean;
     inAppEnabled: boolean;
     defaultTemplateId: number | null;
};

export type NotificationTemplate = {
     id?: number;
     event_code?: string;
     eventCode?: string;
     event_id?: number;
     eventId?: number;
     template_name?: string;
     templateName?: string;
     subject?: string;
     html_body?: string;
     htmlBody?: string;
     plain_body?: string;
     plainBody?: string;
     is_default?: boolean;
     isDefault?: boolean;
     is_active?: boolean;
     isActive?: boolean;
     created_at?: string;
     updated_at?: string;
};

export type NotificationQueue = {
     id: number;
     event_code?: string;
     status?: string;
     priority?: string;
     created_at?: string;
     updated_at?: string;
     error_message?: string;
};

export type NotificationLog = {
     id: number;
     queue_id?: number;
     event_code?: string;
     status?: string;
     message?: string;
     created_at?: string;
};

export const DEFAULT_EVENT_CATALOG: Record<string, { subject: string; htmlBody: string; plainBody: string }> = {
     RESULT_READY: {
          subject: 'Prime Lab - Your Result Is Ready | {{InvoiceNumber}}',
          htmlBody: "<p>Dear {{PatientName}},</p><p>Your {{ResultName}} result is ready.</p><p><a href='{{ResultLink}}'>View Result</a></p>",
          plainBody: 'Dear {{PatientName}}, your {{ResultName}} result is ready. View: {{ResultLink}}',
     },
     SAMPLE_REJECTED: {
          subject: 'Sample {{SampleNumber}} Rejected',
          htmlBody: '<p>Dear {{PatientName}}, your sample {{SampleNumber}} was rejected. Reason: {{RejectionReason}}</p>',
          plainBody: 'Dear {{PatientName}}, sample {{SampleNumber}} was rejected. Reason: {{RejectionReason}}',
     },
     PATIENT_CREATED: {
          subject: 'Welcome to {{BranchName}}, {{PatientName}}',
          htmlBody: '<p>Dear {{PatientName}}, your patient account has been created.</p>',
          plainBody: 'Dear {{PatientName}}, your patient account has been created.',
     },
};

export const defaultEventSettings: EventSetting = {
     emailEnabled: true,
     smsEnabled: false,
     whatsappEnabled: false,
     inAppEnabled: true,
     defaultTemplateId: null,
};

export function extractTemplateVariables(text: string) {
     const matches = text.match(/{{\s*[A-Za-z0-9_]+\s*}}/g) || [];
     return Array.from(new Set(matches.map((item) => item.replace(/{{\s*|\s*}}/g, '').trim())));
}

export function mapTemplate(item: NotificationTemplate) {
     return {
          id: item.id,
          eventCode: item.eventCode ?? item.event_code ?? '',
          eventId: item.eventId ?? item.event_id,
          templateName: item.templateName ?? item.template_name ?? '',
          subject: item.subject ?? '',
          htmlBody: item.htmlBody ?? item.html_body ?? '',
          plainBody: item.plainBody ?? item.plain_body ?? '',
          isDefault: [true, 1, '1', 'true'].includes(item.isDefault ?? item.is_default ?? false),
          isActive: [true, 1, '1', 'true'].includes(item.isActive ?? item.is_active ?? true),
          created_at: item.created_at,
          updated_at: item.updated_at,
     };
}

export async function loadEvents() {
     const response = await callGet('notifications/events');
     return parseList<NotificationEvent>(response);
}

export async function loadEventVariables(eventCode: string) {
     const response = await callGet(`notifications/events/${encodeURIComponent(eventCode)}/variables`);
     const rows = parseList<any>(response);
     return Array.from(
          new Set(
               rows
                    .map((item) => item.variable_name || item.variableName || item.name || '')
                    .filter(Boolean)
                    .map((item) => String(item)),
          ),
     );
}

export async function loadEventSettings(eventCode: string) {
     const response = await callGet(`notifications/settings/${encodeURIComponent(eventCode)}`);
     const source = response?.result || response || {};
     return {
          emailEnabled: [true, 1, '1', 'true'].includes(source.emailEnabled ?? source.email_enabled ?? true),
          smsEnabled: [true, 1, '1', 'true'].includes(source.smsEnabled ?? source.sms_enabled ?? false),
          whatsappEnabled: [true, 1, '1', 'true'].includes(source.whatsappEnabled ?? source.whatsapp_enabled ?? false),
          inAppEnabled: [true, 1, '1', 'true'].includes(source.inAppEnabled ?? source.in_app_enabled ?? true),
          defaultTemplateId: (source.defaultTemplateId ?? source.default_template_id) == null ? null : Number(source.defaultTemplateId ?? source.default_template_id),
     } as EventSetting;
}

export async function loadTemplates(includeInactive = false) {
     const response = await callGet(`notifications/templates?includeInactive=${includeInactive}`);
     return parseList<NotificationTemplate>(response).map(mapTemplate);
}

export async function loadQueue(limit: number) {
     const response = await callGet(`notifications/queue?page=1&count=${limit}`);
     return parseList<NotificationQueue>(response);
}

export async function loadLogs(limit: number) {
     const response = await callGet(`notifications/logs?page=1&count=${limit}`);
     return parseList<NotificationLog>(response);
}

export type EventVariableMeta = {
     variable_name: string;
     variable_type?: string;
     description?: string;
     is_required?: boolean;
     sample_value?: string;
};

export type EventCatalogItem = {
     event: {
          id?: number;
          event_code: string;
          event_name?: string;
          module?: string;
          is_active?: boolean;
     };
     variables: EventVariableMeta[];
     template?: {
          subject: string;
          htmlBody: string;
          plainBody: string;
     };
     requiredReferences: string[];
};

export type TriggerByReferencePayload = {
     eventCode: string;
     references: Record<string, any>;
     context?: Record<string, any>;
     priority?: string;
     createdBy?: number;
     recipients?: { to: string[]; cc: string[]; bcc: string[] };
};

function mapEventCatalog(item: any): EventCatalogItem {
     return {
          ...item,
          variables: (item.variables || []).map((variable: any) => ({
               ...variable,
               variable_type: variable.variable_type ?? variable.data_type,
          })),
          template: {
               ...item.template,
               subject: item.template?.subject || '',
               htmlBody: item.template?.htmlBody ?? item.template?.html_body ?? '',
               plainBody: item.template?.plainBody ?? item.template?.plain_body ?? '',
          },
     };
}

export async function loadEventCatalog(): Promise<EventCatalogItem[]> {
     const response = await callGet('notifications/events/catalog');
     return parseList<EventCatalogItem>(response).map(mapEventCatalog);
}

export async function loadSingleEventCatalog(eventCode: string): Promise<EventCatalogItem | null> {
     try {
          const response = await callGet(`notifications/events/${encodeURIComponent(eventCode)}/catalog`);
          const item = response?.result || response;
          return item?.event ? mapEventCatalog(item) : null;
     } catch {
          return null;
     }
}

export async function syncDefinitions(): Promise<any[]> {
     const response = await callMutate('notifications/events/sync-definitions', 'POST', {});
     return parseList<any>(response);
}

export async function triggerByReference(payload: TriggerByReferencePayload): Promise<any> {
     return await callMutate('notifications/trigger-by-reference', 'POST', payload);
}

export { callGet, callMutate, parseList };
