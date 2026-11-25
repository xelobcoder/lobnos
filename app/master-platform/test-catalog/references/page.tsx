"use client";

import { useEffect, useRef, useState } from "react";
import { customFetch, customFetchMutation } from "../../../../components/Auth/customFetch";

type Kind = "departments" | "samples" | "containers" | "drugCategories" | "drugs";
type ReferenceRow = {
    id: number;
    name?: string;
    department?: string;
    categoryName?: string;
    category?: number;
    drug?: string;
    description?: string | null;
    volume_capacity?: number | string | null;
    material?: string | null;
    color?: string | null;
};
type PendingDrug = { id: number; drug: string; category: string };
const labels: Record<Kind, string> = {
    departments: "Departments", samples: "Sample types", containers: "Sample containers",
    drugCategories: "Drug categories", drugs: "Culture sensitivity drugs",
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
    const [drugName, setDrugName] = useState("");
    const [drugCategory, setDrugCategory] = useState("");
    const nextPendingDrugId = useRef(1);
    const [pendingDrugs, setPendingDrugs] = useState<PendingDrug[]>([]);
    const [drugCategories, setDrugCategories] = useState<Array<{ id: number; categoryName: string }>>([]);
    const [busy, setBusy] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        let cancelled = false;
        const catalogRequest = customFetch(`platform/facilities/master-catalog/${kind}?page=${page}`);
        const optionsRequest = kind === "drugs"
            ? customFetch("platform/facilities/master-catalog/options")
            : Promise.resolve(null);
        Promise.all([catalogRequest, optionsRequest]).then(([response, options]) => {
            if (response?.status !== "success" || !Array.isArray(response.result?.rows)) {
                throw new Error(response?.message || "Unable to load master reference items.");
            }
            if (options && (options.status !== "success" || !Array.isArray(options.result?.drugCategories))) {
                throw new Error(options?.message || "Unable to load master drug categories.");
            }
            if (!cancelled) {
                setRows(response.result.rows);
                setTotal(Number(response.result.total));
                if (options) {
                    const categories = options.result.drugCategories.map((category: { id: number; name: string }) => ({
                        id: category.id, categoryName: category.name,
                    }));
                    setDrugCategories(categories);
                    setDrugCategory(current => current || String(categories.find((category: { id: number; categoryName: string }) =>
                        category.categoryName.toLowerCase() === "antibiotics")?.id || ""));
                }
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
                : kind === "containers" ? { name: trimmed, description: description.trim() || null,
                    volume_capacity: volume ? Number(volume) : null, material: material.trim() || null,
                    color: color.trim() || null, is_reusable: reusable ? 1 : 0 }
                    : kind === "drugCategories" ? { categoryName: trimmed, description: description.trim() || null }
                    : {};
        const endpoint = `platform/facilities/master-catalog/${kind}`;
        setBusy(true); setError(""); setNotice("");
        try {
            const response = await customFetchMutation(endpoint, "POST", body);
            if (response?.status !== "success") throw new Error(response?.message || "Unable to create the item.");
            setName(""); setDescription(""); setVolume(""); setMaterial(""); setColor(""); setReusable(false);
            setNotice(`${trimmed} added to the master catalog.`);
            setPage(1); setRefresh(value => value + 1);
        } catch (failure: unknown) {
            setError(failure instanceof Error ? failure.message : "Unable to create the item.");
            setBusy(false);
        }
    }

    function stageDrug(event: React.FormEvent) {
        event.preventDefault();
        const drug = drugName.trim().replace(/\s+/g, " ");
        if (!drug || drug.length > 255 || !drugCategory) {
            setError("Enter a drug name and choose a category.");
            return;
        }
        const category = Number(drugCategory);
        const duplicate = pendingDrugs.some(item => item.category === drugCategory &&
            item.drug.toLowerCase() === drug.toLowerCase());
        if (!Number.isSafeInteger(category) || category < 1 || duplicate) {
            setError(duplicate ? "This drug is already in the pending list for that category." : "Choose a valid drug category.");
            return;
        }
        const id = nextPendingDrugId.current++;
        setPendingDrugs(current => [...current, {
            id,
            drug,
            category: drugCategory,
        }]);
        setDrugName("");
        setError("");
        setNotice(`${drug} added to the pending list.`);
    }

    async function saveDrugBatch() {
        if (!pendingDrugs.length || busy) return;
        setBusy(true); setError(""); setNotice("");
        try {
            const response = await customFetchMutation("platform/facilities/master-catalog/drugs/bulk", "POST", {
                drugs: pendingDrugs.map(item => ({
                    drug: item.drug,
                    category: Number(item.category),
                })),
            });
            if (response?.status !== "success") throw new Error(response?.message || "Unable to save the drug list.");
            const savedCount = Number(response.result?.added ?? pendingDrugs.length);
            setPendingDrugs([]);
            setDrugName("");
            setNotice(`${savedCount} drugs saved to the master catalog.`);
            setPage(1); setRefresh(value => value + 1);
        } catch (failure: unknown) {
            setError(failure instanceof Error ? failure.message : "Unable to save the drug list.");
            setBusy(false);
        }
    }

    function openDrugCategories() {
        setKind("drugCategories");
        setPage(1); setBusy(true); setError(""); setRows([]); setNotice("");
    }

    return <section className="container-fluid py-3">
        <h2>Master reference catalog</h2>
        <p>Manage shared departments, sample types, containers and culture-sensitivity drugs for facility imports.</p>
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
        <form onSubmit={kind === "drugs" ? stageDrug : addItem} className="border rounded p-3 mb-3">
            <h3 className="h5">Add {labels[kind].toLowerCase()}</h3>
            {kind !== "drugs" && <label className="d-block mb-2">{kind === "drugCategories" ? "Category name" : "Name"}
                <input className="form-control" value={name} onChange={event => setName(event.target.value)} maxLength={kind === "samples" ? 50 : 255} required />
            </label>}
            {kind === "containers" && <div className="row g-2">
                <label className="col-md-6">Description<input className="form-control" value={description} onChange={event => setDescription(event.target.value)} /></label>
                <label className="col-md-2">Volume (mL)<input className="form-control" type="number" min="0" step="0.01" value={volume} onChange={event => setVolume(event.target.value)} /></label>
                <label className="col-md-2">Material<input className="form-control" maxLength={100} value={material} onChange={event => setMaterial(event.target.value)} /></label>
                <label className="col-md-2">Color<input className="form-control" maxLength={50} value={color} onChange={event => setColor(event.target.value)} /></label>
                <label className="col-12"><input type="checkbox" checked={reusable} onChange={event => setReusable(event.target.checked)} /> Reusable</label>
                <p className="text-muted mb-0">Leave unknown specifications blank; they are not inferred.</p>
            </div>}
            {kind === "drugCategories" && <label className="d-block mb-2">Description
                <textarea className="form-control" value={description} onChange={event => setDescription(event.target.value)} maxLength={2000} rows={2} />
            </label>}
            {kind === "drugs" && <>
                <div className="row g-2 align-items-end">
                    <label className="col-md-4">Drug name *
                        <input className="form-control" maxLength={255} value={drugName} onChange={event => setDrugName(event.target.value)} />
                    </label>
                    <label className="col-md-3">Drug category *
                        <select className="form-select" value={drugCategory} onChange={event => setDrugCategory(event.target.value)}>
                            <option value="">Choose category</option>
                            {drugCategories.map(category => <option key={category.id} value={category.id}>{category.categoryName}</option>)}
                        </select>
                    </label>
                    <div className="col-md-5 d-flex gap-2">
                        <button type="submit" className="btn btn-outline-primary">Add drug</button>
                        <button type="button" className="btn btn-outline-secondary" onClick={openDrugCategories}>Add category</button>
                    </div>
                </div>
                {!drugCategories.length && <p className="text-muted small mt-2">Add a drug category before staging drugs.</p>}
                <section className="border rounded p-3 mt-4" aria-label="Pending drugs">
                    <h4 className="h6">Drugs to save ({pendingDrugs.length})</h4>
                    {!pendingDrugs.length && <p className="text-muted mb-0">Use Add drug to place entries in this list.</p>}
                    {pendingDrugs.map(item => <div key={item.id} className="d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom py-2">
                        <div>
                            <strong>{item.drug}</strong>
                            <div className="small text-muted">
                                {drugCategories.find(category => String(category.id) === item.category)?.categoryName || "Category"}
                            </div>
                        </div>
                        <button type="button" className="btn btn-outline-secondary btn-sm"
                            onClick={() => setPendingDrugs(current => current.filter(drug => drug.id !== item.id))}>
                            Remove
                        </button>
                    </div>)}
                    <button type="button" className="btn btn-primary mt-3" disabled={busy || !pendingDrugs.length}
                        onClick={() => void saveDrugBatch()}>Save changes</button>
                </section>
            </>}
            {kind !== "drugs" && <button type="submit" className="btn btn-primary mt-2" disabled={busy}>Add</button>}
        </form>
        <h3 className="h5">{labels[kind]}</h3>
        <div className="table-responsive"><table className="table table-sm">
            <thead><tr><th>{kind === "drugs" ? "Drug" : kind === "drugCategories" ? "Category" : "Name"}</th>
                {kind === "drugs" && <th>Category</th>}
                {kind === "drugCategories" && <th>Description</th>}
                {kind === "containers" && <><th>Volume (mL)</th><th>Material</th><th>Color</th></>}</tr></thead>
            <tbody>{rows.map(row => <tr key={row.id}><td>{row.department ?? row.name ?? row.categoryName ?? row.drug}</td>
                {kind === "drugs" && <td>{row.categoryName || row.category || "Not set"}</td>}
                {kind === "drugCategories" && <td>{row.description || "No description"}</td>}
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
