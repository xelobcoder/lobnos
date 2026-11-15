"use client";

import { type FormEvent, useEffect, useState } from "react";
import { customFetch, customFetchMutation } from "../../components/Auth/customFetch";

type Facility = { tenantId: number; name: string; platformId: string; status: string };
type Panel = { id: number; name: string };
type Parameter = { id: number; name: string; units?: string | null };
type Value = { unit: string | null; range: (string | null)[]; type: string };
type Preview = {
    previewId: string; sourceName: string; destinationName: string | null; blockers: string[];
    parameters: { id: number; name: string; status: "add" | "conflict" | "exists" | "blocked";
        differences: string[]; reason?: string; source: Value; destination: Value | null }[];
};

function PanelPicker({ tenant, side, value, onChange }: {
    tenant: string; side: "Source" | "Destination"; value: string; onChange: (value: string) => void;
}) {
    const [query, setQuery] = useState("");
    const [panels, setPanels] = useState<Panel[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!tenant) return;
        let active = true;
        setLoading(true);
        const timer = window.setTimeout(() => {
            void customFetch(`platform/facilities/${tenant}/test-setup/panels?search=${encodeURIComponent(query)}`)
                .then(response => {
                    if (!active) return;
                    if (response?.status !== "success" || !Array.isArray(response.result)) throw Error(response?.message || "Could not load panels.");
                    setPanels(response.result);
                    setError("");
                }).catch(failure => { if (active) { setPanels([]); setError(failure.message); } })
                .finally(() => { if (active) setLoading(false); });
        }, 250);
        return () => { active = false; window.clearTimeout(timer); };
    }, [tenant, query]);

    return <div className="mb-3">
        <label className="form-label" htmlFor={`copy-search-${side}`}>Search {side.toLowerCase()} panels</label>
        <input className="form-control mb-2" id={`copy-search-${side}`} value={query} disabled={!tenant}
            onChange={event => { onChange(""); setQuery(event.target.value); }} />
        <label className="form-label" htmlFor={`copy-panel-${side}`}>{side} panel</label>
        <select className="form-select" id={`copy-panel-${side}`} value={value} required disabled={!tenant || loading}
            onChange={event => onChange(event.target.value)}>
            <option value="">{loading ? "Loading panels…" : "Select a panel"}</option>
            {panels.map(panel => <option key={panel.id} value={panel.id}>{panel.name}</option>)}
        </select>
        {error && <p className="text-danger small" role="alert">{error}</p>}
    </div>;
}

const statusLabel = { add: "Add", conflict: "Conflict · keep destination", exists: "Already exists", blocked: "Requires review" };
const display = (value: Value | null) => {
    if (!value) return "—";
    const range = value.range.some(Boolean) ? ` · ${value.range.map(limit => limit || "—").join(" to ")}` : "";
    return `${value.type}${value.unit ? ` · ${value.unit}` : ""}${range}`;
};

export default function CopyTestSetup() {
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [source, setSource] = useState("");
    const [target, setTarget] = useState("");
    const [sourceTest, setSourceTest] = useState("");
    const [targetTest, setTargetTest] = useState("");
    const [mode, setMode] = useState<"panel" | "parameters">("panel");
    const [price, setPrice] = useState("");
    const [parameters, setParameters] = useState<Parameter[]>([]);
    const [selected, setSelected] = useState<number[]>([]);
    const [preview, setPreview] = useState<{ data: Preview; request: object } | null>(null);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        let active = true;
        void customFetch("platform/facilities").then(response => {
            if (!active) return;
            if (response?.status !== "success" || !Array.isArray(response.result)) throw Error(response?.message || "Could not load facilities.");
            setFacilities(response.result.filter((facility: Facility) => facility.status === "active"));
        }).catch(failure => { if (active) setError(failure.message); });
        return () => { active = false; };
    }, []);

    useEffect(() => {
        if (!source || !sourceTest || mode !== "parameters") return;
        let active = true;
        void customFetch(`platform/facilities/${source}/test-setup/panels/${sourceTest}/parameters`).then(response => {
            if (!active) return;
            if (response?.status !== "success" || !Array.isArray(response.result)) throw Error(response?.message || "Could not load parameters.");
            setParameters(response.result);
        }).catch(failure => { if (active) setError(failure.message); });
        return () => { active = false; };
    }, [source, sourceTest, mode]);

    async function showPreview(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setBusy(true);
        setError("");
        setNotice("");
        setPreview(null);
        const request = { mode, sourceTenantId: Number(source), targetTenantId: Number(target), sourceTestId: Number(sourceTest),
            ...(mode === "panel" ? { price: Number(price) } : { targetTestId: Number(targetTest), fieldIds: selected }) };
        try {
            const response = await customFetchMutation("platform/facilities/test-setup/preview", "POST", request);
            if (response?.status !== "success") throw Error(response?.message || "Preview failed.");
            setPreview({ data: response.result, request });
        } catch (failure) { setError(failure instanceof Error ? failure.message : "Preview failed."); }
        finally { setBusy(false); }
    }

    async function apply() {
        if (!preview || busy) return;
        setBusy(true);
        setError("");
        try {
            const response = await customFetchMutation("platform/facilities/test-setup/apply", "POST",
                { request: preview.request, previewId: preview.data.previewId });
            if (response?.status !== "success") throw Error(response?.message || "Copy failed.");
            setNotice(`Copied ${response.result.copied.length} parameter(s) to panel #${response.result.testId}. Destination audit #${response.result.auditId}.${response.result.masterAuditRecorded === false ? " The master audit could not be updated." : ""}`);
            setPreview(null);
        } catch (failure) { setError(failure instanceof Error ? failure.message : "Copy failed."); }
        finally { setBusy(false); }
    }

    return <section className="p-3">
        <h1 className="h4">Copy test setup</h1>
        <p className="text-muted">Copy a panel or add missing parameters. Copy only reviewed additions. Historical results and existing prices stay in place. New copies require explicit public panel selection before appearing on the website.</p>
        {error && <p className="alert alert-danger" role="alert">{error}</p>}
        {notice && <p className="alert alert-success" role="status">{notice}</p>}
        <form method="post" onSubmit={showPreview} onChange={() => { setPreview(null); setNotice(""); }}>
            <fieldset disabled={busy}>
                <legend className="h6">Copy mode</legend>
                <select className="form-select mb-3" aria-label="Copy mode" value={mode} onChange={event => {
                    setMode(event.target.value as typeof mode); setParameters([]); setSelected([]);
                }}>
                    <option value="panel">Copy full panel</option>
                    <option value="parameters">Copy selected parameters</option>
                </select>
                <div className="row">
                    <div className="col-md-6">
                        <label className="form-label" htmlFor="copy-source">Source facility</label>
                        <select className="form-select mb-3" id="copy-source" required value={source} onChange={event => {
                            setSource(event.target.value); setSourceTest(""); setParameters([]); setSelected([]);
                        }}>
                            <option value="">Select source facility</option>
                            {facilities.filter(f => String(f.tenantId) !== target).map(f => <option key={f.tenantId} value={f.tenantId}>{f.name} ({f.platformId})</option>)}
                        </select>
                        <PanelPicker key={source} tenant={source} side="Source" value={sourceTest} onChange={value => {
                            setSourceTest(value); setParameters([]); setSelected([]);
                        }} />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label" htmlFor="copy-target">Destination facility</label>
                        <select className="form-select mb-3" id="copy-target" required value={target} onChange={event => {
                            setTarget(event.target.value); setTargetTest("");
                        }}>
                            <option value="">Select destination facility</option>
                            {facilities.filter(f => String(f.tenantId) !== source).map(f => <option key={f.tenantId} value={f.tenantId}>{f.name} ({f.platformId})</option>)}
                        </select>
                        {mode === "parameters" ? <PanelPicker key={target} tenant={target} side="Destination" value={targetTest} onChange={setTargetTest} />
                            : <><label className="form-label" htmlFor="copy-price">Destination price</label>
                                <input className="form-control mb-3" id="copy-price" type="number" min={0} max={2147483647}
                                    step={1} required value={price} onChange={event => setPrice(event.target.value)} /></>}
                    </div>
                </div>
                {mode === "parameters" && parameters.length > 0 && <fieldset className="border rounded p-3 mb-3">
                    <legend className="h6">Select source parameters</legend>
                    {parameters.map(parameter => <div className="form-check" key={parameter.id}>
                        <input type="checkbox" className="form-check-input" id={`copy-parameter-${parameter.id}`} checked={selected.includes(parameter.id)}
                            onChange={event => setSelected(current => event.target.checked ? [...current, parameter.id] : current.filter(id => id !== parameter.id))} />
                        <label className="form-check-label" htmlFor={`copy-parameter-${parameter.id}`}>{parameter.name}{parameter.units ? ` (${parameter.units})` : ""}</label>
                    </div>)}
                </fieldset>}
                <button className="btn btn-outline-primary" disabled={mode === "parameters" && !selected.length}>Preview copy</button>
            </fieldset>
        </form>
        {preview && <section className="border rounded p-3 mt-4" aria-label="Copy preview">
            <h2 className="h5">Preview: {preview.data.sourceName}{preview.data.destinationName ? ` → ${preview.data.destinationName}` : ""}</h2>
            {!!preview.data.blockers.length && <ul className="alert alert-warning">{preview.data.blockers.map(blocker => <li className="ms-3" key={blocker}>{blocker}</li>)}</ul>}
            <div className="table-responsive"><table className="table table-sm">
                <thead><tr><th>Parameter</th><th>Source setup</th><th>Destination setup</th><th>Action</th></tr></thead>
                <tbody>{preview.data.parameters.map(row => <tr key={row.id}>
                    <th scope="row">{row.name}</th><td>{display(row.source)}</td><td>{display(row.destination)}</td>
                    <td><strong>{statusLabel[row.status]}</strong>{row.differences.length > 0 && <div>{row.differences.join(", ")}</div>}
                        {row.reason && <div>{row.reason}</div>}</td>
                </tr>)}</tbody>
            </table></div>
            <button className="btn btn-primary" type="button" onClick={() => void apply()}
                disabled={busy || !!preview.data.blockers.length || !preview.data.parameters.some(row => row.status === "add")}>
                Apply {preview.data.parameters.filter(row => row.status === "add").length} addition(s)
            </button>
        </section>}
    </section>;
}
