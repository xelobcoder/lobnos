"use client";

import { useEffect, useState } from "react";
import { customFetch, customFetchMutation } from "../../../../components/Auth/customFetch";

type Kind = "departments" | "samples" | "containers";
type ReferenceRow = {
    id: number;
    name?: string;
    department?: string;
    description?: string | null;
    volume_capacity?: number | string | null;
    material?: string | null;
    color?: string | null;
};
const labels: Record<Kind, string> = {
    departments: "Departments", samples: "Sample types", containers: "Sample containers",
};

export default function MasterReferences() {
    const [kind, setKind] = useState<Kind>("departments");
    const [rows, setRows] = useState<ReferenceRow[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [volume, setVolume] = useState("");
    const [material, setMaterial] = useState("");
    const [color, setColor] = useState("");
    const [reusable, setReusable] = useState(false);
    const [busy, setBusy] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        let cancelled = false;
        customFetch(`platform/facilities/master-catalog/${kind}?page=${page}`).then(response => {
            if (response?.status !== "success" || !Array.isArray(response.result?.rows)) {
                throw new Error(response?.message || "Unable to load master reference items.");
            }
            if (!cancelled) {
                setRows(response.result.rows);
                setTotal(Number(response.result.total));
            }
        }).catch((failure: unknown) => {
            if (!cancelled) setError(failure instanceof Error ? failure.message : "Unable to load master reference items.");
        }).finally(() => { if (!cancelled) setBusy(false); });
        return () => { cancelled = true; };
    }, [kind, page, refresh]);

    async function addItem(event: React.FormEvent) {
        event.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) { setError("Enter a name."); return; }
        if (volume && (!Number.isFinite(Number(volume)) || Number(volume) < 0)) {
            setError("Enter a valid non-negative container volume."); return;
        }
        const body = kind === "departments"
            ? { department: trimmed, departmentManager: "Master catalog" }
            : kind === "samples" ? { name: trimmed }
                : { name: trimmed, description: description.trim() || null,
                    volume_capacity: volume ? Number(volume) : null, material: material.trim() || null,
                    color: color.trim() || null, is_reusable: reusable ? 1 : 0 };
        setBusy(true); setError(""); setNotice("");
        try {
            const response = await customFetchMutation(`platform/facilities/master-catalog/${kind}`, "POST", body);
            if (response?.status !== "success") throw new Error(response?.message || "Unable to create the item.");
            setName(""); setDescription(""); setVolume(""); setMaterial(""); setColor(""); setReusable(false);
            setNotice(`${trimmed} added to the master catalog.`);
            setPage(1); setRefresh(value => value + 1);
        } catch (failure: unknown) {
            setError(failure instanceof Error ? failure.message : "Unable to create the item.");
            setBusy(false);
        }
    }

    return <section className="container-fluid py-3">
        <h2>Master reference catalog</h2>
        <p>Manage shared departments, sample types and containers. Facilities can import items they do not have.</p>
        <nav className="d-flex flex-wrap gap-2 mb-3" aria-label="Reference sections">
            {(Object.keys(labels) as Kind[]).map(section => <button key={section} type="button"
                className={`btn btn-sm ${kind === section ? "btn-primary" : "btn-outline-primary"}`}
                disabled={busy}
                aria-pressed={kind === section} onClick={() => { if (kind !== section) { setBusy(true); setError(""); setKind(section); setPage(1); setRows([]); setNotice(""); } }}>
                {labels[section]}
            </button>)}
        </nav>
        {error && <p className="alert alert-danger" role="alert">{error}</p>}
        {notice && <p className="alert alert-success" role="status">{notice}</p>}
        <form onSubmit={addItem} className="border rounded p-3 mb-3">
            <h3 className="h5">Add {labels[kind].toLowerCase()}</h3>
            <label className="d-block mb-2">Name
                <input className="form-control" value={name} onChange={event => setName(event.target.value)} maxLength={kind === "samples" ? 50 : 255} required />
            </label>
            {kind === "containers" && <div className="row g-2">
                <label className="col-md-6">Description<input className="form-control" value={description} onChange={event => setDescription(event.target.value)} /></label>
                <label className="col-md-2">Volume (mL)<input className="form-control" type="number" min="0" step="0.01" value={volume} onChange={event => setVolume(event.target.value)} /></label>
                <label className="col-md-2">Material<input className="form-control" maxLength={100} value={material} onChange={event => setMaterial(event.target.value)} /></label>
                <label className="col-md-2">Color<input className="form-control" maxLength={50} value={color} onChange={event => setColor(event.target.value)} /></label>
                <label className="col-12"><input type="checkbox" checked={reusable} onChange={event => setReusable(event.target.checked)} /> Reusable</label>
                <p className="text-muted mb-0">Leave unknown specifications blank; they are not inferred.</p>
            </div>}
            <button type="submit" className="btn btn-primary mt-2" disabled={busy}>Add</button>
        </form>
        <h3 className="h5">{labels[kind]}</h3>
        <div className="table-responsive"><table className="table table-sm">
            <thead><tr><th>Name</th>{kind === "containers" && <><th>Volume (mL)</th><th>Material</th><th>Color</th></>}</tr></thead>
            <tbody>{rows.map(row => <tr key={row.id}><td>{row.department ?? row.name}</td>
                {kind === "containers" && <><td>{row.volume_capacity ?? "Not specified"}</td><td>{row.material || "Not specified"}</td><td>{row.color || "Not specified"}</td></>}
            </tr>)}</tbody>
        </table></div>
        {busy && <p role="status">Loading...</p>}
        {!busy && !error && rows.length === 0 && <p>No items found.</p>}
        <div className="d-flex gap-2 align-items-center">
            <button type="button" className="btn btn-outline-secondary btn-sm" disabled={busy || page <= 1} onClick={() => { setBusy(true); setError(""); setPage(value => value - 1); }}>Previous</button>
            <span>Page {page}</span>
            <button type="button" className="btn btn-outline-secondary btn-sm" disabled={busy || page * 25 >= total} onClick={() => { setBusy(true); setError(""); setPage(value => value + 1); }}>Next</button>
        </div>
    </section>;
}
