"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
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
    is_reusable?: number | boolean | string;
};
type PendingDrug = { id: number; drug: string; category: string; error?: string };
type DrugCategory = { id: number; categoryName: string };
const PAGE_SIZE = 25;
const labels: Record<Kind, string> = {
    departments: "Departments",
    samples: "Sample types",
    containers: "Sample containers",
    drugCategories: "Drug categories",
    drugs: "Culture-sensitivity drugs",
};

export default function MasterReferences({ initialKind }: { initialKind: Kind }) {
    const [kind] = useState<Kind>(initialKind);
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
    const [newCategoryName, setNewCategoryName] = useState("");
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [savingCategory, setSavingCategory] = useState(false);
    const [editingPendingId, setEditingPendingId] = useState<number | null>(null);
    const nextPendingDrugId = useRef(1);
    const [pendingDrugs, setPendingDrugs] = useState<PendingDrug[]>([]);
    const [drugCategories, setDrugCategories] = useState<DrugCategory[]>([]);
    const [busy, setBusy] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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
                        id: category.id,
                        categoryName: category.name,
                    }));
                    setDrugCategories(categories);
                    setDrugCategory(current => current || String(categories.find((category: DrugCategory) =>
                        category.categoryName.toLowerCase() === "antibiotics")?.id || ""));
                }
            }
        }).catch((failure: unknown) => {
            if (!cancelled) setError(failure instanceof Error ? failure.message : "Unable to load master reference items.");
        }).finally(() => {
            if (!cancelled) setBusy(false);
        });
        return () => { cancelled = true; };
    }, [kind, page, refresh]);

    function resetEditor() {
        setEditingPendingId(null);
        setName("");
        setDescription("");
        setVolume("");
        setMaterial("");
        setColor("");
        setReusable(false);
        setDrugName("");
        setDrugCategory("");
        setFieldErrors({});
        setError("");
    }

    function clearFieldError(field: string) {
        setFieldErrors(current => ({ ...current, [field]: "" }));
        setError("");
    }

    async function addItem(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const trimmed = name.trim();
        const nextErrors: Record<string, string> = {};
        if (!trimmed) nextErrors.name = "Enter a name.";
        if (volume && (!Number.isFinite(Number(volume)) || Number(volume) < 0)) {
            nextErrors.volume = "Enter a valid non-negative container volume.";
        }
        setFieldErrors(nextErrors);
        if (Object.keys(nextErrors).length) {
            setError("Correct the highlighted fields before saving.");
            return;
        }

        const body = kind === "departments"
            ? { department: trimmed, departmentManager: "Master catalog" }
            : kind === "samples" ? { name: trimmed }
                : kind === "containers" ? {
                    name: trimmed,
                    description: description.trim() || null,
                    volume_capacity: volume ? Number(volume) : null,
                    material: material.trim() || null,
                    color: color.trim() || null,
                    is_reusable: reusable ? 1 : 0,
                }
                    : kind === "drugCategories" ? { categoryName: trimmed, description: description.trim() || null }
                        : {};
        const endpoint = `platform/facilities/master-catalog/${kind}`;
        setBusy(true);
        setError("");
        setNotice("");
        try {
            const response = await customFetchMutation(endpoint, "POST", body);
            if (response?.status !== "success") throw new Error(response?.message || "Unable to save the item.");
            setNotice(`${trimmed} added to the master catalog.`);
            resetEditor();
            setPage(1);
            setRefresh(value => value + 1);
        } catch (failure: unknown) {
            setError(failure instanceof Error ? failure.message : "Unable to save the item.");
            setBusy(false);
        }
    }

    async function deleteItem(row: ReferenceRow) {
        const itemName = kind === "drugs"
            ? row.drug
            : kind === "departments"
                ? row.department
                : row.name || row.categoryName;
        if (!itemName || busy || !window.confirm(`Delete "${itemName}" from the master catalog? This cannot be undone.`)) return;

        setBusy(true);
        setError("");
        setNotice("");
        try {
            const response = await customFetchMutation(
                `platform/facilities/master-catalog/${kind}/${row.id}`,
                "DELETE",
                {},
            );
            if (response?.status !== "success") {
                throw new Error(response?.message || "Unable to delete the catalog item.");
            }
            setNotice(`${itemName} deleted from the master catalog.`);
            setTotal(current => Math.max(0, current - 1));
            if (rows.length === 1 && page > 1) {
                setPage(current => current - 1);
            } else {
                setRefresh(current => current + 1);
            }
        } catch (failure: unknown) {
            setError(failure instanceof Error ? failure.message : "Unable to delete the catalog item.");
            setBusy(false);
        }
    }

    async function stageDrug(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const drug = drugName.trim().replace(/\s+/g, " ");
        const nextErrors: Record<string, string> = {};
        if (!drug || drug.length > 255) nextErrors.drug = "Enter a drug name between 1 and 255 characters.";
        if (!drugCategory) nextErrors.category = "Choose a drug category.";
        const category = Number(drugCategory);
        if (drugCategory && (!Number.isSafeInteger(category) || category < 1)) {
            nextErrors.category = "Choose a valid drug category.";
        }
        const duplicate = pendingDrugs.some(item =>
            item.id !== editingPendingId
            && item.category === drugCategory
            && item.drug.toLowerCase() === drug.toLowerCase());
        if (duplicate) nextErrors.drug = "This drug is already in the pending list for that category.";
        setFieldErrors(nextErrors);
        if (Object.keys(nextErrors).length) {
            setError("Correct the highlighted fields before continuing.");
            return;
        }

        setError("");
        setNotice("");
        if (editingPendingId !== null) {
            setPendingDrugs(current => current.map(item => item.id === editingPendingId
                ? { ...item, drug, category: drugCategory, error: undefined }
                : item));
            setEditingPendingId(null);
            setDrugName("");
            setFieldErrors({});
            setNotice(`${drug} updated in the pending list.`);
            return;
        }

        const id = nextPendingDrugId.current++;
        setPendingDrugs(current => [...current, { id, drug, category: drugCategory }]);
        setDrugName("");
        setFieldErrors({});
        setNotice(`${drug} added to the pending list.`);
    }

    async function createDrugCategory() {
        const trimmed = newCategoryName.trim();
        if (!trimmed) {
            setFieldErrors(current => ({ ...current, newCategory: "Enter a category name." }));
            return;
        }
        setSavingCategory(true);
        setError("");
        setFieldErrors({});
        try {
            const response = await customFetchMutation(
                "platform/facilities/master-catalog/drugCategories",
                "POST",
                { categoryName: trimmed },
            );
            if (response?.status !== "success") throw new Error(response?.message || "Unable to create the drug category.");
            const created = response.result as { id?: number; categoryName?: string } | undefined;
            const id = Number(created?.id);
            if (Number.isSafeInteger(id) && id > 0) {
                setDrugCategories(current => [...current, { id, categoryName: created?.categoryName || trimmed }]);
                setDrugCategory(String(id));
            } else {
                setRefresh(value => value + 1);
            }
            setNewCategoryName("");
            setShowCategoryForm(false);
            setNotice(`${trimmed} category added.`);
        } catch (failure: unknown) {
            setError(failure instanceof Error ? failure.message : "Unable to create the drug category.");
        } finally {
            setSavingCategory(false);
        }
    }

    async function saveDrugBatch() {
        if (!pendingDrugs.length || busy) return;
        setBusy(true);
        setError("");
        setNotice("");
        try {
            const validation = await customFetchMutation("platform/facilities/master-catalog/drugs/check", "POST", {
                drugs: pendingDrugs.map(item => ({ drug: item.drug, category: Number(item.category) })),
            });
            if (validation?.status !== "success" || !Array.isArray(validation.result?.duplicates)) {
                throw new Error(validation?.message || "Unable to validate the pending drug list.");
            }
            if (validation.result.duplicates.length) {
                const duplicateKeys = new Set<string>(validation.result.duplicates.map((item: { drug: string; category: number }) =>
                    `${Number(item.category)}:${item.drug.trim().toLowerCase()}`));
                setPendingDrugs(current => current.map(item => duplicateKeys.has(`${Number(item.category)}:${item.drug.toLowerCase()}`)
                    ? { ...item, error: "This drug already exists in this category." }
                    : { ...item, error: undefined }));
                setError("Resolve the highlighted duplicate drugs before saving the batch.");
                setBusy(false);
                return;
            }
            const response = await customFetchMutation("platform/facilities/master-catalog/drugs/bulk", "POST", {
                drugs: pendingDrugs.map(item => ({ drug: item.drug, category: Number(item.category) })),
            });
            if (response?.status !== "success") throw new Error(response?.message || "Unable to save the drug list.");
            const savedCount = Number(response.result?.added ?? pendingDrugs.length);
            setPendingDrugs([]);
            setDrugName("");
            setEditingPendingId(null);
            setNotice(`${savedCount} drugs saved to the master catalog.`);
            setPage(1);
            setRefresh(value => value + 1);
        } catch (failure: unknown) {
            setError(failure instanceof Error ? failure.message : "Unable to save the drug list.");
            setBusy(false);
        }
    }

    return <section className="container-fluid py-3">
        <header className="border rounded p-3 mb-3 bg-white shadow-none">
            <h2>{labels[kind]}</h2>
            <p className="text-muted mb-0">Manage {labels[kind].toLowerCase()} in the master catalog for facility imports.</p>
        </header>
        {error && <p className="alert alert-danger" role="alert">{error}</p>}
        {notice && <p className="alert alert-success" role="status">{notice}</p>}
        <form noValidate onSubmit={kind === "drugs" ? stageDrug : addItem} className="border rounded p-3 mb-4 bg-white shadow-none">
            <h3 className="h5">Add {kind === "drugs" ? "drug" : labels[kind].toLowerCase()}</h3>
            {kind !== "drugs" && <div className="row g-2 align-items-end mb-3">
                <label className={kind === "containers" ? "col-md-6 col-xl-2" : kind === "drugCategories" ? "col-md-4" : "col-md-9"} htmlFor="referenceName">
                    <span className="form-label">{kind === "drugCategories" ? "Category name" : kind === "containers" ? "Container name" : "Name"} <span className="text-danger" aria-hidden="true">*</span></span>
                    <input id="referenceName" className={`form-control${fieldErrors.name ? " is-invalid" : ""}`}
                        value={name} onChange={event => { setName(event.target.value); clearFieldError("name"); }} maxLength={kind === "samples" ? 50 : 255}
                        required aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? "referenceNameError" : undefined} />
                    {fieldErrors.name && <span id="referenceNameError" className="invalid-feedback d-block">{fieldErrors.name}</span>}
                </label>
                {kind === "containers" && <>
                    <label className="col-md-6 col-xl-2"><span className="form-label">Description</span>
                    <input className="form-control" value={description} onChange={event => setDescription(event.target.value)} />
                    </label>
                    <label className="col-md-6 col-xl-2"><span className="form-label">Volume (mL)</span>
                    <input className={`form-control${fieldErrors.volume ? " is-invalid" : ""}`} type="number" min="0" step="0.01"
                        value={volume} onChange={event => { setVolume(event.target.value); clearFieldError("volume"); }} aria-invalid={Boolean(fieldErrors.volume)} />
                    {fieldErrors.volume && <span className="invalid-feedback d-block">{fieldErrors.volume}</span>}
                    </label>
                    <label className="col-md-6 col-xl-2"><span className="form-label">Material</span>
                    <input className="form-control" maxLength={100} value={material} onChange={event => setMaterial(event.target.value)} />
                    </label>
                    <label className="col-md-6 col-xl-2"><span className="form-label">Color</span>
                    <input className="form-control" maxLength={50} value={color} onChange={event => setColor(event.target.value)} />
                    </label>
                    <label className="col-6 col-xl-1 form-check d-flex align-items-center gap-2 mb-2">
                        <input className="form-check-input m-0" type="checkbox" checked={reusable} onChange={event => setReusable(event.target.checked)} />
                        <span className="form-check-label">Reusable</span>
                    </label>
                </>}
                {kind === "drugCategories" && <label className="col-md-6" htmlFor="categoryDescription">
                    <span className="form-label">Description</span>
                    <input id="categoryDescription" className="form-control" value={description}
                        onChange={event => setDescription(event.target.value)} maxLength={2000} />
                </label>}
                <div className={kind === "containers" ? "col-12 col-xl-1 d-flex gap-2" : kind === "drugCategories" ? "col-md-2 d-flex gap-2" : "col-md-3 d-flex gap-2"}>
                    <button type="submit" className="btn btn-primary" disabled={busy}>
                        Add
                    </button>
                </div>
                {kind === "containers" && <p className="col-12 text-muted small mb-0">Leave unknown specifications blank; they are not inferred.</p>}
            </div>}
            {kind === "drugs" && <div className="row g-3 align-items-end">
                <label className="col-md-4" htmlFor="drugName">
                    <span className="form-label">Drug name <span className="text-danger" aria-hidden="true">*</span></span>
                    <input id="drugName" className={`form-control${fieldErrors.drug ? " is-invalid" : ""}`} maxLength={255}
                        value={drugName} onChange={event => { setDrugName(event.target.value); clearFieldError("drug"); }} required
                        aria-invalid={Boolean(fieldErrors.drug)} aria-describedby={fieldErrors.drug ? "drugNameError" : undefined} />
                    {fieldErrors.drug && <span id="drugNameError" className="invalid-feedback d-block">{fieldErrors.drug}</span>}
                </label>
                <label className="col-md-3" htmlFor="drugCategory">
                    <span className="form-label">Drug category <span className="text-danger" aria-hidden="true">*</span></span>
                    <select id="drugCategory" className={`form-select${fieldErrors.category ? " is-invalid" : ""}`}
                        value={drugCategory} onChange={event => { setDrugCategory(event.target.value); clearFieldError("category"); }} required
                        aria-invalid={Boolean(fieldErrors.category)} aria-describedby={fieldErrors.category ? "drugCategoryError" : undefined}>
                        <option value="">Choose category</option>
                        {drugCategories.map(category => <option key={category.id} value={category.id}>{category.categoryName}</option>)}
                    </select>
                    {fieldErrors.category && <span id="drugCategoryError" className="invalid-feedback d-block">{fieldErrors.category}</span>}
                </label>
                <div className="col-md-5 d-flex flex-wrap gap-2">
                    <button type="submit" className="btn btn-primary" disabled={busy || !drugCategories.length}>
                        {editingPendingId !== null ? "Update pending drug" : "Add drug"}
                    </button>
                    {editingPendingId !== null && <button type="button" className="btn btn-secondary" onClick={resetEditor}>Cancel edit</button>}
                    <button type="button" className="btn btn-secondary" onClick={() => setShowCategoryForm(value => !value)}>
                        {showCategoryForm ? "Cancel category" : "Add category"}
                    </button>
                </div>
                {showCategoryForm && <div className="col-12">
                    <div className="row g-2 align-items-end border rounded bg-white shadow-none p-3">
                        <label className="col-md-8" htmlFor="newDrugCategory">
                            <span className="form-label">New category name</span>
                            <input id="newDrugCategory" className={`form-control${fieldErrors.newCategory ? " is-invalid" : ""}`}
                                value={newCategoryName} onChange={event => { setNewCategoryName(event.target.value); clearFieldError("newCategory"); }} maxLength={255}
                                required aria-invalid={Boolean(fieldErrors.newCategory)} aria-describedby={fieldErrors.newCategory ? "newDrugCategoryError" : undefined} />
                            {fieldErrors.newCategory && <span id="newDrugCategoryError" className="invalid-feedback d-block">{fieldErrors.newCategory}</span>}
                        </label>
                        <div className="col-md-4">
                            <button type="button" className="btn btn-primary" disabled={savingCategory} onClick={() => void createDrugCategory()}>
                                {savingCategory ? "Saving category..." : "Save category"}
                            </button>
                        </div>
                    </div>
                </div>}
            </div>}
        </form>

        {kind === "drugs" && <section className="border rounded p-3 mt-4 mb-4 bg-white shadow-none" aria-label="Pending drugs">
            <h4 className="h6">Drugs to save ({pendingDrugs.length})</h4>
            {!pendingDrugs.length && <p className="text-muted mb-0">Use Add drug to place entries in this list.</p>}
            {pendingDrugs.map(item => <div key={item.id} className="d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom py-2">
                <div>
                    <strong>{item.drug}</strong>
                    <div className="small text-muted">
                        {drugCategories.find(category => String(category.id) === item.category)?.categoryName || "Category"}
                    </div>
                    {item.error && <div className="small text-danger" role="alert">{item.error}</div>}
                </div>
                <div className="d-flex gap-2">
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => {
                        setEditingPendingId(item.id);
                        setDrugName(item.drug);
                        setDrugCategory(item.category);
                        setFieldErrors({});
                        setError("");
                        setNotice("");
                    }}>Edit</button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => {
                        setPendingDrugs(current => current.filter(drug => drug.id !== item.id));
                        if (editingPendingId === item.id) resetEditor();
                    }}>Remove</button>
                </div>
            </div>)}
            <button type="button" className="btn btn-primary mt-3" disabled={busy || !pendingDrugs.length}
                onClick={() => void saveDrugBatch()}>Save {pendingDrugs.length} {pendingDrugs.length === 1 ? "drug" : "drugs"}</button>
        </section>}

        <section className="border rounded p-3 bg-white shadow-none" aria-labelledby="catalogItemsHeading">
            <h3 id="catalogItemsHeading" className="h5">{labels[kind]}</h3>
            <div className="table-responsive"><table className="table table-sm">
                <thead><tr><th>{kind === "drugs" ? "Drug" : kind === "drugCategories" ? "Category" : "Name"}</th>
                    {kind === "drugs" && <th>Category</th>}
                    {kind === "drugCategories" && <th>Description</th>}
                    {kind === "containers" && <><th>Volume (mL)</th><th>Material</th><th>Color</th></>}
                    <th>Actions</th></tr></thead>
                <tbody>{rows.map(row => <tr key={row.id}><td>{kind === "drugs" ? row.drug : row.department ?? row.name ?? row.categoryName}</td>
                    {kind === "drugs" && <td>{row.categoryName || row.category || "Not set"}</td>}
                    {kind === "drugCategories" && <td>{row.description || "No description"}</td>}
                    {kind === "containers" && <><td>{row.volume_capacity ?? "Not specified"}</td><td>{row.material || "Not specified"}</td><td>{row.color || "Not specified"}</td></>}
                    <td><button type="button" className="btn btn-danger btn-sm" disabled={busy}
                        onClick={() => void deleteItem(row)}
                        aria-label={`Delete ${kind === "drugs" ? row.drug : row.department ?? row.name ?? row.categoryName}`}>
                        Delete
                    </button></td>
                </tr>)}</tbody>
            </table></div>
            {busy && <p role="status">Loading...</p>}
            {!busy && !error && rows.length === 0 && <p>No items found.</p>}
            <div className="d-flex gap-2 align-items-center">
                <button type="button" className="btn btn-outline-secondary btn-sm" disabled={busy || page <= 1} onClick={() => { setBusy(true); setError(""); setPage(value => value - 1); }}>Previous</button>
                <span>Page {page}</span>
                <button type="button" className="btn btn-outline-secondary btn-sm" disabled={busy || page * PAGE_SIZE >= total} onClick={() => { setBusy(true); setError(""); setPage(value => value + 1); }}>Next</button>
            </div>
        </section>
    </section>;
}
