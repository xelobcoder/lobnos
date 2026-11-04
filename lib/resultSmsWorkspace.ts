export type ResultSmsTest = {
    ascensionid: number;
    testid: number;
    name: string;
    resultEntryEnd: string | null;
    status: "ready" | "entry_pending" | "approval_pending" | "revalidation_required" | "critical_hold";
    reason: string | null;
};

export type ResultSmsWorkspace = {
    billingid: number;
    patient: { patientid: number; name: string; phone: string | null };
    smsAvailable: boolean;
    smsUnavailableReason: string | null;
    tests: ResultSmsTest[];
};

export type ResultSmsPreview = {
    billingid: number;
    patientid: number;
    phone: string;
    message: string;
    ascensionids: number[];
    testNames: string[];
    pendingCount: number;
    fingerprint: string;
    encoding: string;
    segments: number;
    units?: number;
};

export type ResultSmsHistoryItem = {
    id: number;
    jobid: number;
    message: string;
    status: string;
    queuedAt: string | null;
    sentAt: string | null;
    lastCheckedAt: string | null;
    error: string | null;
    employeeid: number | null;
};

export type ResultSmsHistory = {
    items: ResultSmsHistoryItem[];
    total: number;
    page: number;
    count: number;
};

export function smsErrorMessage(value: unknown, fallback = "Unable to load SMS data."): string {
    const messages: string[] = [];
    function collect(current: unknown, context = "", depth = 0, fields = false) {
        if (depth > 6 || messages.length >= 30 || current == null) return;
        if (typeof current === "string" || typeof current === "number" || typeof current === "boolean") {
            const text = String(current).trim();
            if (text) messages.push(context ? `${context}: ${text}` : text);
            return;
        }
        if (Array.isArray(current)) {
            current.forEach(entry => collect(entry, context, depth + 1, fields));
            return;
        }
        if (typeof current !== "object") return;
        const error = current as Record<string, unknown>;
        const path = Array.isArray(error.path)
            ? error.path.filter(part => typeof part === "string" || typeof part === "number").join(".")
            : typeof error.field === "string" ? error.field : context;
        if (error.error != null) collect(error.error, context, depth + 1);
        if (error.message != null) collect(error.message, path, depth + 1);
        if (typeof error.code === "string" && error.code.trim()) messages.push(`[${error.code.trim()}]`);
        for (const key of ["details", "errors", "issues", "validationErrors"]) {
            if (error[key] != null) collect(error[key], context, depth + 1, true);
        }
        // Validation details may be a field-name map, rather than message objects.
        if (fields) for (const [key, entry] of Object.entries(error)) {
            if (!["message", "error", "code", "path", "field", "details", "errors", "issues", "validationErrors"].includes(key)) {
                collect(entry, context ? `${context}.${key}` : key, depth + 1, true);
            }
        }
    }
    collect(value);
    return [...new Set(messages)].join("\n") || fallback;
}

export function isUncertainSmsResponse(value: unknown): boolean {
    if (!value || typeof value !== "object") return false;
    const response = value as { code?: unknown; error?: { code?: unknown }; statusCode?: unknown };
    return response.code === "UPSTREAM_UNAVAILABLE" || response.error?.code === "UPSTREAM_UNAVAILABLE"
        || (typeof response.statusCode === "number" && response.statusCode >= 500);
}

export function responseData<T>(response: unknown): T {
    if (!response || typeof response !== "object") throw new Error("Invalid server response.");
    const value = response as { success?: boolean; data?: T; error?: unknown };
    if (value.success !== true || !value.data) throw new Error(smsErrorMessage(value));
    return value.data;
}

export function validWorkspace(value: ResultSmsWorkspace, billingid: string, patientid: string): boolean {
    return value?.billingid === Number(billingid) && Boolean(value.patient)
        && Number.isInteger(value.patient.patientid) && value.patient.patientid > 0
        && (!patientid || value.patient.patientid === Number(patientid))
        && typeof value.patient.name === "string"
        && (value.patient.phone === null || typeof value.patient.phone === "string")
        && typeof value.smsAvailable === "boolean" && Array.isArray(value.tests)
        && value.tests.every(test => Number.isInteger(test.ascensionid) && test.ascensionid > 0
            && Number.isInteger(test.testid) && typeof test.name === "string"
            && Object.hasOwn(readinessLabels, test.status));
}

export function initialReadySelection(tests: ResultSmsTest[], linkedId: string): number[] {
    // A linked unready test must never silently select a different test.
    const linked = tests.find(test => String(test.ascensionid) === linkedId);
    return linked?.status === "ready" ? [linked.ascensionid] : [];
}

export function sameSelection(a: number[], b: number[]): boolean {
    const orderedB = [...b].sort((x, y) => x - y);
    return a.length === b.length && [...a].sort((x, y) => x - y).every((id, index) => id === orderedB[index]);
}

export const readinessLabels: Record<ResultSmsTest["status"], string> = {
    ready: "Ready",
    entry_pending: "Result entry pending",
    approval_pending: "Approval pending",
    revalidation_required: "Revalidation required",
    critical_hold: "Critical result hold",
};

export function smsStatusTone(status: string): "success" | "danger" | "secondary" | "warning" {
    if (["sent", "delivered"].includes(status)) return "success";
    if (["failed", "cancelled"].includes(status)) return "danger";
    if (["pending", "queued", "submitted"].includes(status)) return "warning";
    return "secondary";
}

export function hasPendingSms(items: ResultSmsHistoryItem[]): boolean {
    return items.some(item => ["pending", "queued", "submitted"].includes(item.status));
}

export function validHistory(value: ResultSmsHistory): boolean {
    return Array.isArray(value?.items) && Number.isInteger(value.total) && value.total >= 0
        && Number.isInteger(value.page) && value.page >= 1 && value.count === 10
        && value.items.every(item => Number.isInteger(item.id) && Number.isInteger(item.jobid)
            && typeof item.message === "string" && typeof item.status === "string");
}
