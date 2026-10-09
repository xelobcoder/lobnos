export interface AuditEvent {
     id: number; source: string; action: string; createdAt: string;
     actorTenantId: number; actorEmployeeId: number; reason: string | null;
     fromStatus: string | null; toStatus: string | null; details: unknown;
}

type Rec = Record<string, unknown>;
const isRecord = (value: unknown): value is Rec => typeof value === "object" && value !== null && !Array.isArray(value);
const text = (value: unknown) => value === null || value === undefined || value === "" ? "" : String(value);
const humanize = (value: string) => {
     const words = value.replace(/[_-]+/g, " ").trim().toLowerCase();
     return words ? words.charAt(0).toUpperCase() + words.slice(1) : "Unknown";
};

export function statusLabel(status: string | null | undefined): string {
     const value = String(status || "").toLowerCase();
     if (!value) return "-";
     return value === "suspended" ? "Deactivated" : humanize(value);
}

export function actionLabel(event: Pick<AuditEvent, "action" | "toStatus">): string {
     if (event.action.startsWith("failed:")) return `Provisioning failed: ${humanize(event.action.slice(7))}`;
     switch (event.action) {
          case "tenant_deleted": return "Tenant registry record deleted";
          case "status_changed":
               return event.toStatus === "active" ? "Facility activated"
                    : event.toStatus === "suspended" ? "Facility deactivated" : "Facility status changed";
          case "plan_create": return "Subscription plan created";
          case "plan_append": return "Subscription plan change scheduled";
          case "plan_replace": return "Subscription plan corrected";
          case "payment_recorded": return "Payment recorded";
          case "payment_voided": return "Payment voided";
          default: return humanize(event.action || "");
     }
}

export const sourceLabel = (source: string) => humanize(source || "");

export const actorLabel = (event: Pick<AuditEvent, "actorTenantId" | "actorEmployeeId">) =>
     `Staff #${event.actorEmployeeId} (Tenant #${event.actorTenantId})`;

export function formatDateTime(value: string, locale?: string, timeZone?: string): string {
     if (!value) return "-";
     const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(value) ? `${value.replace(" ", "T")}Z` : value;
     const date = new Date(normalized);
     if (Number.isNaN(date.getTime())) return value;
     return date.toLocaleString(locale, { dateStyle: "medium", timeStyle: "short", ...(timeZone ? { timeZone } : {}) });
}

export function parseDetails(details: unknown): unknown {
     if (typeof details !== "string") return details;
     try { return JSON.parse(details); } catch { return details; }
}

const FREQUENCIES: Record<string, string> = { daily: "Daily", weekly: "Weekly", monthly: "Monthly", yearly: "Yearly" };

export function describePlan(plan: unknown): string {
     if (!isRecord(plan)) return "No plan";
     const parts = [
          FREQUENCIES[text(plan.frequency)] || humanize(text(plan.frequency)),
          [text(plan.currency).toUpperCase(), text(plan.amount)].filter(Boolean).join(" "),
          plan.startDate ? `from ${text(plan.startDate)}` : "",
     ];
     return parts.filter(Boolean).join(" · ");
}

export interface AuditSummary { label: string; value: string }

// Structured, human-readable summary lines; raw details stay available separately.
export function summarizeDetails(event: Pick<AuditEvent, "action" | "details">): AuditSummary[] {
     const details = parseDetails(event.details);
     if (!isRecord(details)) return [];
     if (event.action.startsWith("plan_")) {
          if (event.action === "plan_append") return [{ label: "Scheduled plan", value: describePlan(details.next) }];
          return [
               { label: "Before", value: describePlan(details.replaced) },
               { label: "After", value: describePlan(details.next) },
          ];
     }
     if (event.action === "payment_recorded") {
          return [
               { label: "Period", value: [text(details.periodStart), text(details.periodEnd)].filter(Boolean).join(" to ") },
               { label: "Amount", value: [text(details.currency).toUpperCase(), text(details.amount)].filter(Boolean).join(" ") },
               { label: "Paid on", value: text(details.paidAt) },
          ].filter((item) => item.value);
     }
     if (typeof details.stage === "string") return [
          { label: "Provisioning stage", value: humanize(details.stage) },
          { label: "Outcome", value: details.failed ? "Failed" : "Completed" },
     ];
     if (event.action === "payment_voided" && details.paymentId != null) {
          return [{ label: "Corrected payment", value: `Payment #${text(details.paymentId)}` }];
     }
     return [];
}