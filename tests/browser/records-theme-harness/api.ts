const empty = new URLSearchParams(location.search).has("empty");
const calls: string[] = [];
Object.assign(window, { recordsThemeCalls: calls });
let securityKey = "synthetic-key";
const request = {
     id: 1,
     patientid: 101,
     fullpatientid: "SYN-101",
     staffid: 1,
     username: "Synthetic Staff",
     employee_role: "scientist",
     requestType: "edit",
     requestedAt: "2026-01-02T10:00:00Z",
     status: "pending",
     ascensionid: 42,
     grantedAt: null,
     revokedAt: null,
     expiredAt: null,
     accessedAt: null,
     reason: "Synthetic request",
     urgency: "routine",
};
const accessWindow = {
     id: 1,
     employeeid: 1,
     category: "individual",
     edit_window: "4h",
     access_window: "24h",
     applicable_role: "scientist",
     require_approval: 1,
     username: "Synthetic Staff",
};

export const currencyFormatter = new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" });

export async function customFetch(endpoint: string) {
     calls.push(endpoint);
     const pathname = endpoint.split("?")[0];
     switch (pathname) {
          case "security-features/backup/security-settings":
               if (calls.filter(call => call === endpoint).length > 1) {
                    await new Promise(resolve => setTimeout(resolve, 200));
               }
               return { status: true, data: {
                    encryption_required: true,
                    encryption_enabled: true,
                    encryption_algorithm: "AES-256-GCM",
                    key_rotation_days: 90,
                    secure_deletion_enabled: true,
                    deletion_passes: 3,
                    current_key_id: securityKey,
                    key_last_rotated: "2026-01-01",
                    storage_path: "C:\\SyntheticBackups",
                    is_active: true,
               } };
          case "security-features/backup/stats":
               return { status: true, data: {
                    total_backups: 1, successful_backups: 1, failed_backups: 0,
                    total_size: 1048576, last_backup_date: "2026-01-02T10:00:00Z",
               } };
          case "security-features/backup/schedules":
               return { status: true, data: empty ? [] : [{
                    id: 1, schedule_name: "Synthetic schedule", frequency: "daily",
                    backup_time: "01:00", backup_type: "database", is_active: true,
                    retention_days: 30, username: "Synthetic Staff",
               }] };
          case "security-features/backup/logs":
               return { status: true, data: empty ? [] : [{
                    id: 1, backup_name: "Synthetic backup", is_successful: true,
                    is_full_backup: false, backup_size_bytes: 1048576,
                    backup_type: "database", backup_mode: "automated",
                    backup_date: "2026-01-02T10:00:00Z", duration_seconds: 10,
               }] };
          case "security-features/history":
               return { status: true, data: empty ? [] : [
                    request,
                    { ...request, id: 2, fullpatientid: "SYN-102", status: "approved", grantedAt: "2026-01-02T10:30:00Z" },
               ] };
          case "security-features/access-windows":
               return { status: true, data: empty ? [] : [accessWindow] };
          case "security-features/access-windows/employee/1":
               if (new URLSearchParams(location.search).has("employeeError")) {
                    throw new Error("Synthetic employee settings error");
               }
               return { status: true, data: accessWindow };
          case "logins":
               return { status: "success", result: [{ employeeid: 1, username: "Synthetic Staff", role: "scientist" }] };
          case "accounting/accounts":
               return { status: "success", result: [
                    { account_code: "1000", name: "Synthetic cash", type: "asset" },
                    { account_code: "2000", name: "Synthetic payable", type: "liability" },
               ] };
          default:
               throw new Error(`Unexpected synthetic GET: ${endpoint}`);
     }
}

export async function customPost(endpoint: string) {
     if (endpoint === "security-features/backup/rotate-key") {
          securityKey = "rotated-synthetic-key";
          return { status: true, data: { newKeyId: securityKey } };
     }
     throw new Error(`Unexpected synthetic mutation: ${endpoint}`);
}

export async function customFile(endpoint: string) {
     throw new Error(`Unexpected synthetic file request: ${endpoint}`);
}

export const EXPORT_MAX_ROWS = 0;
export function tablesFromElement() { throw new Error("Export is not available in the synthetic theme fixture"); }
export function fetchAllPages() { throw new Error("Export is not available in the synthetic theme fixture"); }
export function exportReportPdf() { throw new Error("Export is not available in the synthetic theme fixture"); }
export function exportTablesCsv() { throw new Error("Export is not available in the synthetic theme fixture"); }
