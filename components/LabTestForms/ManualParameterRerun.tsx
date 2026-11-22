"use client";

import { useCallback, useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import Link from "next/link";
import { customFetch, customPost } from "../Auth/customFetch";
import { eligibleManualRerunFields, manualRerunDisplayState } from "../../lib/manualRerunUi";

type PersistedField = { fieldid: number | string; name?: string; value?: unknown };
type StagedField = {
	fieldid: number | string;
	field?: string;
	value: unknown;
	originalvalue?: unknown;
	entrymode?: string;
	receivedAt?: string;
};
type RerunSnapshot = {
	rerunId: number | string;
	ascensionid: number | string;
	status: string;
	fieldIds: Array<number | string>;
	confirmedFieldIds: Array<number | string>;
	staged: StagedField[];
};

function responseRows(response: any): any[] {
	if (Array.isArray(response)) return response;
	if (Array.isArray(response?.data)) return response.data;
	if (Array.isArray(response?.result)) return response.result;
	return [];
}

function fieldId(value: number | string): number {
	return Number(value);
}

export default function ManualParameterRerun({
	ascensionid,
	testid,
	persistedFields,
	authorized,
	onConfirmed,
}: {
	ascensionid: number | string;
	testid: number | string;
	persistedFields: PersistedField[];
	authorized: boolean;
	onConfirmed: () => void | Promise<void>;
}) {
	const [ruleLoad, setRuleLoad] = useState(() => ({
		testid: String(testid),
		loading: true,
		error: "",
		rules: [] as any[],
	}));
	const requestedTestId = String(testid);
	const ruleLoadMatchesTest = ruleLoad.testid === requestedTestId;
	const rules = ruleLoadMatchesTest ? ruleLoad.rules : [];
	const rulesLoading = !ruleLoadMatchesTest || ruleLoad.loading;
	const rulesError = ruleLoadMatchesTest ? ruleLoad.error : "";
	const [run, setRun] = useState<RerunSnapshot | null>(null);
	const [statusError, setStatusError] = useState("");
	const [statusLoaded, setStatusLoaded] = useState(false);
	const [selectedFieldIds, setSelectedFieldIds] = useState<number[]>([]);
	const [manualValues, setManualValues] = useState<Record<number, string>>({});
	const [open, setOpen] = useState(false);
	const [busyAction, setBusyAction] = useState<number | "start" | "manual" | null>(null);
	const [actionError, setActionError] = useState("");

	const eligibleFields = eligibleManualRerunFields(persistedFields, rules);

	const refreshRun = useCallback(async () => {
		setStatusError("");
		try {
			const response = await customFetch(`result/manual-rerun/${encodeURIComponent(String(ascensionid))}`);
			if (response?.status !== "success") {
				throw new Error(response?.message || "Unable to load manual rerun status.");
			}
			setRun(response.data && typeof response.data === "object" ? response.data : null);
		} catch (error) {
			setRun(null);
			setStatusError(error instanceof Error ? error.message : "Unable to load manual rerun status.");
		} finally {
			setStatusLoaded(true);
		}
	}, [ascensionid]);

	useEffect(() => {
		let active = true;
		const requestTestId = String(testid);
		customFetch(`testpanel/list/customtestrule?testid=${encodeURIComponent(requestTestId)}`)
			.then((response) => {
				if (active) setRuleLoad({
					testid: requestTestId,
					loading: false,
					error: "",
					rules: responseRows(response),
				});
			})
			.catch((error) => {
				if (active) setRuleLoad({
					testid: requestTestId,
					loading: false,
					error: error instanceof Error ? error.message : "Unable to verify manual rerun settings.",
					rules: [],
				});
			});
		// Defer the initial status request so the effect itself does not synchronously
		// update React state through refreshRun().
		void Promise.resolve().then(() => refreshRun());
		return () => { active = false; };
	}, [testid, refreshRun]);

	const displayState = manualRerunDisplayState(run);
	const stagedIds = new Set((run?.staged || []).map((item) => fieldId(item.fieldid)));
	const confirmedIds = new Set((run?.confirmedFieldIds || []).map(fieldId));
	const pendingFieldIds = (run?.fieldIds || []).map(fieldId).filter((id) => !stagedIds.has(id) && !confirmedIds.has(id));
	const hasPendingResults = Boolean(run?.fieldIds?.some((id) =>
		!stagedIds.has(fieldId(id)) && !confirmedIds.has(fieldId(id)),
	));

	useEffect(() => {
		if (!run || !hasPendingResults) return;
		const timer = window.setTimeout(() => { void refreshRun(); }, 3500);
		return () => window.clearTimeout(timer);
	}, [run, hasPendingResults, refreshRun]);

	const toggleField = (id: number, checked: boolean) => {
		setSelectedFieldIds((current) => checked
			? [...new Set([...current, id])]
			: current.filter((value) => value !== id));
	};

	const startRerun = async () => {
		if (!selectedFieldIds.length) return;
		setBusyAction("start");
		setActionError("");
		try {
			const response = await customPost("result/manual-rerun", "POST", {
				ascensionid: Number(ascensionid),
				fieldIds: selectedFieldIds,
			});
			if (response?.status !== "success") {
				throw new Error(response?.message || "The manual rerun could not be started.");
			}
			setSelectedFieldIds([]);
			await refreshRun();
		} catch (error) {
			setActionError(error instanceof Error ? error.message : "The manual rerun could not be started.");
		} finally {
			setBusyAction(null);
		}
	};

	const stageManualValues = async () => {
		const fields = pendingFieldIds
			.filter((id) => manualValues[id]?.trim())
			.map((id) => {
				const value = manualValues[id].trim();
				const field = eligibleFields.find((item) => fieldId(item.fieldid) === id);
				return { fieldid: id, field: field?.name || `Parameter ${id}`, value, originalvalue: value };
			});
		if (!fields.length) return;
		setBusyAction("manual");
		setActionError("");
		try {
			const response = await customPost("result/manual-rerun/manual-values", "POST", {
				ascensionid: Number(ascensionid),
				fields,
			});
			if (response?.status !== "success") {
				throw new Error(response?.message || "Manual rerun values could not be staged.");
			}
			setManualValues((current) => {
				const remaining = { ...current };
				fields.forEach(({ fieldid }) => delete remaining[fieldid]);
				return remaining;
			});
			await refreshRun();
		} catch (error) {
			setActionError(error instanceof Error ? error.message : "Manual rerun values could not be staged.");
		} finally {
			setBusyAction(null);
		}
	};

	const confirmField = async (id: number) => {
		setBusyAction(id);
		setActionError("");
		try {
			const response = await customPost("result/manual-rerun/confirm", "POST", {
				ascensionid: Number(ascensionid),
				fieldIds: [id],
			});
			if (response?.status !== "success") {
				throw new Error(response?.message || "This analyzer value could not be confirmed.");
			}
			await refreshRun();
			// Only an explicit confirmation reloads current report values; staged values never edit them.
			await onConfirmed();
		} catch (error) {
			setActionError(error instanceof Error ? error.message : "This analyzer value could not be confirmed.");
		} finally {
			setBusyAction(null);
		}
	};

	if (!authorized) return null;
	if (rulesLoading) {
		return <li><span className="dropdown-item-text small text-muted" role="status">Checking manual rerun availability…</span></li>;
	}
	if (rulesError) {
		return <li><span className="dropdown-item-text small text-danger" role="status">Manual rerun unavailable: settings could not be verified.</span></li>;
	}
	if (!eligibleFields.length) {
		return (
			<>
				<li>
					<span
						className="dropdown-item-text small text-muted"
						role="status"
						style={{ display: "block", width: 190, maxWidth: "calc(100vw - 56px)", whiteSpace: "normal", overflowWrap: "anywhere", lineHeight: 1.35 }}
					>
						Rerun unavailable. Save a result and enable a parameter in Test Fields.
					</span>
				</li>
				<li>
					<Link className="dropdown-item" href={`/settings/applicationsettings/testpanels/testlist/${encodeURIComponent(String(testid))}?tab=fields`}>
						Open Test Fields
					</Link>
				</li>
			</>
		);
	}

	return (
		<li>
			<button type="button" className="dropdown-item" onClick={() => setOpen(true)}>
				Manual parameter rerun
			</button>
			<Modal show={open} onHide={() => setOpen(false)} centered size="lg" aria-labelledby="manual-rerun-title">
				<Modal.Header closeButton>
					<Modal.Title id="manual-rerun-title">Manual parameter rerun</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p className="text-body-secondary">
						Start a rerun for selected parameters. If no analyzer is connected, you can enter the repeat values here after starting it. Values do not replace the report until you explicitly confirm them.
					</p>
					{statusError && <div className="alert alert-warning" role="alert">
						{statusError} <button type="button" className="btn btn-sm btn-outline-secondary ms-2" onClick={() => void refreshRun()}>Retry status</button>
					</div>}
					{actionError && <div className="alert alert-danger" role="alert">{actionError}</div>}

					{run && <section className="border rounded p-3 mb-3" aria-label="Manual rerun status">
						<div className="d-flex flex-wrap justify-content-between gap-2">
							<strong>{displayState}</strong>
							<span className="text-muted">Rerun #{run.rerunId} · {run.status}</span>
						</div>
						<p className="small text-body-secondary mb-0 mt-1">
							{displayState === "Awaiting rerun results" && "Waiting for rerun values. Analyzer results are detected automatically; for manual work, enter the values below and stage them."}
							{displayState === "Awaiting confirmation" && "Rerun values are staged. Review and confirm parameters individually."}
							{displayState === "Revalidated" && "All selected parameters have been explicitly confirmed and revalidated."}
						</p>
					</section>}

					{run && pendingFieldIds.length > 0 && <fieldset className="border rounded p-3 mb-3" disabled={busyAction !== null}>
						<legend className="float-none w-auto px-2 fs-6">Enter rerun results manually</legend>
						<p className="small text-body-secondary">Use this when the test was repeated without an analyzer. Only filled parameters are staged.</p>
						{pendingFieldIds.map((id) => {
							const field = eligibleFields.find((item) => fieldId(item.fieldid) === id);
							const label = field?.name || `Parameter ${id}`;
							return <label key={id} className="d-block mb-2">
								<span className="form-label">{label}</span>
								<input
									type="text"
									className="form-control"
									aria-label={`Manual rerun value for ${label}`}
									value={manualValues[id] || ""}
									onChange={(event) => setManualValues((current) => ({ ...current, [id]: event.target.value }))}
								/>
							</label>;
						})}
						<button
							type="button"
							className="btn btn-primary btn-sm mt-2"
							disabled={!pendingFieldIds.some((id) => manualValues[id]?.trim()) || busyAction !== null}
							onClick={() => void stageManualValues()}
						>
							{busyAction === "manual" ? "Staging…" : "Stage manual rerun values"}
						</button>
					</fieldset>}

					{!run && !statusLoaded && <p role="status">Checking for an existing manual rerun…</p>}
					{!run && statusLoaded && <fieldset className="border rounded p-3" disabled={busyAction !== null}>
						<legend className="float-none w-auto px-2 fs-6">Choose parameters</legend>
						{eligibleFields.map((field) => {
							const id = fieldId(field.fieldid);
							return <label key={id} className="d-flex align-items-center gap-2 border-bottom py-2">
								<input
									type="checkbox"
									className="form-check-input mt-0"
									checked={selectedFieldIds.includes(id)}
									onChange={(event) => toggleField(id, event.target.checked)}
								/>
								<span>{field.name || `Parameter ${id}`}</span>
								<span className="ms-auto text-muted">Current: {String(field.value)}</span>
							</label>;
						})}
						<button type="button" className="btn btn-primary btn-sm mt-3" disabled={!selectedFieldIds.length || busyAction !== null} onClick={() => void startRerun()}>
							{busyAction === "start" ? "Starting…" : "Start analyzer rerun"}
						</button>
					</fieldset>}

					{run && <div className="table-responsive">
						<table className="table table-sm table-bordered align-middle">
							<thead><tr><th>Parameter</th><th>Current value</th><th>Rerun value</th><th>Source</th><th>Received</th><th>Status / action</th></tr></thead>
							<tbody>
								{run.staged?.map((item) => {
									const id = fieldId(item.fieldid);
									const confirmed = confirmedIds.has(id);
									return <tr key={id}>
										<th scope="row">{item.field || eligibleFields.find((field) => fieldId(field.fieldid) === id)?.name || `Parameter ${id}`}</th>
										<td>{item.originalvalue == null ? "—" : String(item.originalvalue)}</td>
										<td>{item.value == null ? "—" : String(item.value)}</td>
										<td>{item.entrymode === "manual" ? "Manual entry" : "Analyzer"}</td>
										<td>{item.receivedAt ? new Date(item.receivedAt).toLocaleString() : "—"}</td>
										<td>
											{confirmed
												? <span className="badge text-bg-success">Revalidated</span>
												: <div className="d-flex flex-column gap-1">
													<span className="badge text-bg-warning">Awaiting confirmation</span>
													<button type="button" className="btn btn-sm btn-success" disabled={busyAction !== null} onClick={() => void confirmField(id)}>
														{busyAction === id ? "Confirming…" : "Confirm this parameter"}
													</button>
												</div>}
										</td>
									</tr>;
								})}
								{!run.staged?.length && <tr><td colSpan={6} className="text-center text-muted">No rerun values have been staged yet.</td></tr>}
							</tbody>
						</table>
						<button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => void refreshRun()}>Refresh analyzer status</button>
					</div>}
				</Modal.Body>
				<Modal.Footer>
					<button type="button" className="btn btn-outline-secondary" onClick={() => setOpen(false)}>Close</button>
				</Modal.Footer>
			</Modal>
		</li>
	);
}
