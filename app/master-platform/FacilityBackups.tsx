"use client";

import { useEffect, useState } from "react";
import { customFetch, customFetchMutation } from "../../components/Auth/customFetch";

type Facility = { tenantId: number; name: string; platformId: string; status: string };
type Backup = {
    id: number; name: string; date: string; bytes: number | string | null; path: string | null;
    duration: number | null; encrypted: boolean; successful: boolean; full: boolean;
    available: boolean; canRestore: boolean; mode: string;
};
type Catalog = { directory: string | null; backups: Backup[]; hasNext: boolean };

function formatSize(bytes: Backup["bytes"]) {
    if (bytes === null) return "—";
    const size = Number(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 ** 2) return `${(size / 1024).toFixed(1)} KiB`;
    if (size < 1024 ** 3) return `${(size / 1024 ** 2).toFixed(1)} MiB`;
    return `${(size / 1024 ** 3).toFixed(2)} GiB`;
}

export default function FacilityBackups() {
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [facilityId, setFacilityId] = useState("");
    const [catalog, setCatalog] = useState<Catalog | null>(null);
    const [page, setPage] = useState(1);
    const [reload, setReload] = useState(0);
    const [selected, setSelected] = useState<Backup | null>(null);
    const [confirmation, setConfirmation] = useState("");
    const [busy, setBusy] = useState<"create" | "restore" | null>(null);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const facility = facilities.find(item => String(item.tenantId) === facilityId);
    const endpoint = `platform/facilities/${facilityId}/backups`;

    useEffect(() => {
        let active = true;
        void customFetch("platform/facilities").then(response => {
            if (response?.status !== "success") throw Error(response?.message || "Could not load facilities.");
            if (active) setFacilities(response.result.filter((item: Facility) => !["deleted", "provisioning", "provision_failed"].includes(item.status)));
        }).catch(failure => { if (active) setError(failure.message); });
        return () => { active = false; };
    }, []);

    useEffect(() => {
        if (!facilityId) return;
        let active = true;
        void customFetch(`${endpoint}?page=${page}`).then(response => {
            if (response?.status !== "success") throw Error(response?.message || "Could not load backups.");
            if (active) setCatalog(response.result);
        }).catch(failure => { if (active) setError(failure.message); });
        return () => { active = false; };
    }, [endpoint, facilityId, page, reload]);

    async function operate(action: "create" | "restore") {
        if (!facility || busy || (action === "restore" && (!selected || confirmation !== facility.platformId))) return;
        setBusy(action);
        setError("");
        setNotice("");
        try {
            const url = action === "restore" ? `${endpoint}/${selected!.id}/restore` : endpoint;
            const response = await customFetchMutation(url, "POST", action === "restore" ? { confirmation } : {});
            if (response?.status !== "success") throw Error(response?.message || "The backup operation could not be confirmed.");
            const audit = response.result.auditRecorded === false ? " The platform audit entry could not be saved." : "";
            if (action === "restore") {
                setNotice(`Restored and verified ${response.result.tableCount} tables in ${response.result.database} on ${response.result.server}.${audit}`);
                setSelected(null);
                setConfirmation("");
            } else {
                setNotice(`Encrypted backup created at ${response.result.location}.${audit}`);
                setPage(1);
                setReload(current => current + 1);
            }
        } catch (failure) {
            setError(failure instanceof Error ? failure.message : "The backup operation could not be confirmed.");
            if (action === "create") setReload(current => current + 1);
        } finally {
            setBusy(null);
        }
    }

    return <section className="p-3" aria-busy={Boolean(busy)}>
        <h1 className="h4">Facility backups</h1>
        <label className="form-label" htmlFor="backup-facility">Facility</label>
        <div className="d-flex flex-wrap gap-2 mb-3">
            <select id="backup-facility" className="form-select w-auto mw-100" value={facilityId} disabled={Boolean(busy)}
                onChange={event => {
                    setFacilityId(event.currentTarget.value);
                    setPage(1); setCatalog(null); setSelected(null); setConfirmation(""); setNotice(""); setError("");
                }}>
                <option value="">Select a facility</option>
                {facilities.map(item => <option key={item.tenantId} value={item.tenantId}>{item.name} ({item.platformId})</option>)}
            </select>
            <button type="button" className="btn btn-primary" disabled={!catalog?.directory || Boolean(busy) || Boolean(selected)}
                onClick={() => void operate("create")}>{busy === "create" ? "Creating backup…" : "Create encrypted backup"}</button>
        </div>
        {error && <p className="alert alert-danger" role="alert">{error}</p>}
        {notice && <p className="alert alert-success" role="status">{notice}</p>}
        {facilityId && !catalog && !error && <p role="status">Loading backups…</p>}
        {catalog && <>
            <p><strong>Storage directory</strong><br /><code className="text-break">{catalog.directory ?? "Storage directory needs configuration"}</code></p>
            {selected && <form className="alert alert-warning" onSubmit={event => { event.preventDefault(); void operate("restore"); }}>
                <h2 className="h6">Restore backup #{selected.id} to a separate database</h2>
                <p>Enter <strong>{facility?.platformId}</strong> to restore and verify this backup. The facility continues using its live database.</p>
                <label htmlFor="restore-confirm" className="form-label">Organization identifier</label>
                <input id="restore-confirm" className="form-control mb-2" value={confirmation} disabled={Boolean(busy)}
                    onChange={event => setConfirmation(event.currentTarget.value)} autoComplete="off" />
                <button className="btn btn-warning me-2" disabled={Boolean(busy) || confirmation !== facility?.platformId}>
                    {busy === "restore" ? "Restoring…" : "Restore to separate database"}
                </button>
                <button type="button" className="btn btn-outline-secondary" disabled={Boolean(busy)}
                    onClick={() => { setSelected(null); setConfirmation(""); }}>Cancel</button>
            </form>}
            {catalog.backups.length === 0 ? <p className="text-muted">No database backups on this page.</p>
                : <div className="table-responsive"><table className="table table-sm align-middle">
                    <thead><tr><th>Backup</th><th>Created</th><th>Size</th><th>Metadata</th><th>Server location</th><th>Restore</th></tr></thead>
                    <tbody>{catalog.backups.map(backup => <tr key={backup.id}>
                        <th scope="row" className="text-break">#{backup.id} {backup.name}</th>
                        <td>{new Date(backup.date).toLocaleString()}</td>
                        <td className="text-nowrap">{formatSize(backup.bytes)}</td>
                        <td>{backup.mode} · {backup.full ? "Full" : "Partial"} · {backup.encrypted ? "Encrypted" : "Plain SQL"}
                            {backup.duration !== null && <div>{backup.duration} s</div>}</td>
                        <td className="text-break"><code>{backup.path ?? "—"}</code></td>
                        <td>{backup.canRestore
                            ? <button type="button" className="btn btn-sm btn-outline-primary" disabled={Boolean(busy)}
                                onClick={() => { setSelected(backup); setConfirmation(""); }}>Review restore</button>
                            : backup.successful ? backup.available ? "Outside configured storage" : "File missing" : "Backup failed"}</td>
                    </tr>)}</tbody>
                </table></div>}
            <div className="d-flex gap-2 align-items-center">
                <button type="button" className="btn btn-sm btn-outline-secondary" disabled={page === 1 || Boolean(busy)}
                    onClick={() => { setSelected(null); setCatalog(null); setPage(page - 1); }}>Previous</button>
                <span>Page {page}</span>
                <button type="button" className="btn btn-sm btn-outline-secondary" disabled={!catalog.hasNext || Boolean(busy)}
                    onClick={() => { setSelected(null); setCatalog(null); setPage(page + 1); }}>Next</button>
            </div>
        </>}
    </section>;
}
