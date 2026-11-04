import { buildApiUrl } from "./apiBaseUrl";

export class BackupDownloadError extends Error {
     constructor(message: string, readonly status: number, readonly code?: string) {
          super(message);
          this.name = "BackupDownloadError";
     }
}

export async function requestBackupDownload(id: number, decrypt: boolean): Promise<Response> {
     if (!Number.isSafeInteger(id) || id < 1) throw new Error("Select a valid backup to download");
     const url = new URL(buildApiUrl(`security-features/backup/logs/${id}/download`));
     if (decrypt) url.searchParams.set("decrypt", "true");
     const response = await fetch(url.toString(), { method: "GET", credentials: "include", cache: "no-store" });
     const contentType = response.headers.get("content-type") || "";
     if (!response.ok) {
          let detail = response.statusText || "Request rejected";
          let code: string | undefined;
          if (contentType.includes("application/json")) {
               const body: unknown = await response.json();
               if (body && typeof body === "object") {
                    if ("code" in body && typeof body.code === "string") code = body.code;
                    if ("error" in body && typeof body.error === "string") detail = body.error;
                    else if ("message" in body && typeof body.message === "string") detail = body.message;
               }
          }
          if (response.status === 404 && detail === "Backup file not found") code = "BACKUP_FILE_NOT_FOUND";
          if (response.status === 404 && detail === "Backup not found") code = "BACKUP_NOT_FOUND";
          if (code === "BACKUP_FILE_NOT_FOUND") detail += ". The file is no longer available at its recorded server location. Restore the original file or create a new backup.";
          if (code === "BACKUP_NOT_FOUND") detail += ". Refresh the backup logs and select an existing backup.";
          throw new BackupDownloadError(`Download failed (${response.status}): ${detail}`, response.status, code);
     }
     if (contentType.includes("application/json") || contentType.includes("text/html")) {
          throw new BackupDownloadError("The server returned a page or message instead of a backup file. Refresh your session and try again.", response.status);
     }
     return response;
}
