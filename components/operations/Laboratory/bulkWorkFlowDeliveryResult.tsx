"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { RiCheckboxCircleLine, RiErrorWarningLine, RiFileListLine, RiInformationLine } from "@remixicon/react";
import { customPost } from "../../Auth/customFetch";
import { useApplication } from "../../Auth/useApplicationContext";
import { toast } from "react-toastify";
import styles from "./BulkResultDeliveryModal.module.css";
import {
	deliveryEventDate, deliveryItemKey, deliveryMethodLabel, deliveryMethods,
	loadDeliveryHistory, positiveDeliveryId, type DeliveryEvent, type DeliveryItem, type DeliveryMethod,
} from "./resultDeliveryHistory";

type Props = {
	show: boolean;
	onHide: () => void;
	employeeid: number;
	items: DeliveryItem[];
	onSuccess: (shouldClose?: boolean) => void;
};

export default function BulkWorkFlowResultDeliveryModal(props: Props) {
	const application = useApplication();
	const scope = JSON.stringify([
		props.show, application?.user?.tenantId ?? application?.tenantId,
		application?.user?.branch ?? application?.branchid,
		application?.user?.employeeid ?? props.employeeid,
		props.items.map(deliveryItemKey).sort(),
	]);
	return <ResultDeliveryWorkspace key={scope} {...props} />;
}

type HistoryState = { status: "loading" } | { status: "ready"; events: DeliveryEvent[] } | { status: "error"; message: string };

function ResultDeliveryWorkspace({
	show,
	onHide,
	onSuccess,
	items,
}: Props) {
	const id = useId();
	const [selectedMethods, setSelectedMethods] = useState<Record<string, DeliveryMethod[]>>({});
	const [historyKey, setHistoryKey] = useState("");
	const [histories, setHistories] = useState<Record<string, HistoryState>>({});
	const [errors, setErrors] = useState<Record<string, string[]>>({});
	const [notes, setNotes] = useState("");
	const [loading, setLoading] = useState(false);
	const active = useRef(true);
	const saving = useRef(false);
	const historyVersions = useRef<Record<number, number>>({});
	const rows = items.map((item, index) => {
		try {
			const billingid = positiveDeliveryId(item.billingid), ascensionid = positiveDeliveryId(item.ascension_id ?? item.ascensionid);
			return { item, key: `${billingid}:${ascensionid}`, billingid, ascensionid, error: null };
		} catch (error) {
			return { item, key: `invalid-${index}`, billingid: 0, ascensionid: 0,
				error: error instanceof Error ? error.message : "Unable to verify this selected test." };
		}
	}).filter((row, index, all) => all.findIndex(other => other.key === row.key) === index);
	const billingIds = [...new Set(rows.filter(row => !row.error).map(row => row.billingid))];
	const billKey = billingIds.join(",");
	const allHistoryReady = rows.length > 0 && rows.every(row => !row.error && histories[row.billingid]?.status === "ready");
	const operations = rows.flatMap(row => (selectedMethods[row.key] || []).map(mode => ({ row, mode })));
	const selectionReady = operations.length > 0 && operations.every(({ row }) => !row.error && histories[row.billingid]?.status === "ready");
	const focusedRow = rows.find(row => row.key === historyKey) || rows[0];
	const focusedName = focusedRow?.item.name || focusedRow?.item.test_name || (focusedRow ? `Test ${rows.indexOf(focusedRow) + 1}` : "Selected test");
	const focusedHistory = focusedRow ? histories[focusedRow.billingid] : undefined;
	const focusedEvents = focusedRow && focusedHistory?.status === "ready"
		? focusedHistory.events.filter(event => event.ascensionid === focusedRow.ascensionid) : [];

	async function refreshHistory(bills: number[]) {
		setHistories(current => ({ ...current, ...Object.fromEntries(bills.map(bill => [bill, { status: "loading" }])) }));
		await Promise.all(bills.map(async bill => {
			const version = (historyVersions.current[bill] || 0) + 1;
			historyVersions.current[bill] = version;
			try {
				const events = await loadDeliveryHistory(bill);
				if (active.current && historyVersions.current[bill] === version) setHistories(current => ({ ...current, [bill]: { status: "ready", events } }));
			} catch (error) {
				console.error("Result delivery history check failed", error);
				if (active.current && historyVersions.current[bill] === version) setHistories(current => ({ ...current, [bill]: {
					status: "error", message: error instanceof Error ? error.message : "Unable to verify delivery history. Please retry.",
				} }));
			}
		}));
	}

	useEffect(() => {
		active.current = true;
		if (show && billingIds.length) void refreshHistory(billingIds);
		return () => { active.current = false; };
	}, [show, billKey]);

	function selectMethod(key: string, mode: DeliveryMethod, checked: boolean) {
		setSelectedMethods(current => ({
			...current, [key]: checked ? [...new Set([...(current[key] || []), mode])] : (current[key] || []).filter(value => value !== mode),
		}));
		setErrors(current => ({ ...current, [key]: [] }));
	}

	const handleSubmit = async () => {
		if (saving.current) return;
		if (!rows.length) return toast.error("No items selected");
		if (!operations.length) return toast.error("Please select at least one delivery method");
		if (!selectionReady) return toast.error("Verify the selected tests' delivery history before recording a delivery.");

		if (notes.length > 500) return toast.error("Notes cannot exceed 500 characters");
		saving.current = true;
		setLoading(true);
		setErrors({});
		try {
			const results = await Promise.allSettled(operations.map(({ row, mode }) =>
				customPost('result/delivery/record', 'POST', {
					billingid: row.billingid, ascensionid: row.ascensionid, delivered_mode: mode,
					delivered_at: new Date(), notes: notes.trim() || null, failurenotes: null,
				})));
			if (!active.current) return;
			const completed = operations.filter((_operation, index) => results[index].status === "fulfilled" && results[index].value?.status === true);
			const failures: Record<string, string[]> = {};
			results.forEach((result, index) => {
				if (result.status === "fulfilled" && result.value?.status === true) return;
				const { row, mode } = operations[index];
				const message = result.status === "rejected"
					? "Could not confirm this delivery. Review refreshed history before retrying."
					: typeof result.value?.message === "string" ? result.value.message : "Delivery was not recorded. Please retry.";
				(failures[row.key] ||= []).push(`${deliveryMethodLabel(mode)}: ${message}`);
				if (result.status === "rejected") console.error("Result delivery recording failed", result.reason);
			});
			setErrors(failures);
			setSelectedMethods(current => {
				const remaining = { ...current };
				for (const { row, mode } of completed) remaining[row.key] = (remaining[row.key] || []).filter(value => value !== mode);
				return remaining;
			});
			if (completed.length) toast.success(`${completed.length} delivery ${completed.length === 1 ? "record" : "records"} saved`);
			if (completed.length === operations.length) {
				onSuccess(true);
				onHide();
			} else {
				toast.error(`${operations.length - completed.length} delivery ${operations.length - completed.length === 1 ? "record needs" : "records need"} attention. Review the test details below.`);
				await refreshHistory([...new Set(operations.map(({ row }) => row.billingid))]);
				if (active.current && completed.length) onSuccess(false);
			}
		} catch (error) {
			console.error("Result delivery submission failed", error);
			if (active.current) {
				toast.error("Submission could not be completed. Review refreshed delivery history before retrying.");
				await refreshHistory(billingIds);
			}
		} finally {
			saving.current = false;
			if (active.current) setLoading(false);
		}
	};

	function methodCheckbox(mode: DeliveryMethod, label: string, checked: boolean, disabled: boolean, change: (checked: boolean) => void, checkboxId: string, mixed = false) {
		return (
			<label className={styles.methodChoice} htmlFor={checkboxId}>
				<input id={checkboxId} type="checkbox" checked={checked} disabled={disabled}
					aria-label={label} aria-checked={mixed ? "mixed" : checked}
					ref={input => { if (input) input.indeterminate = mixed; }}
					onChange={event => change(event.target.checked)} />
				<span>{deliveryMethodLabel(mode)}</span>
			</label>
		);
	}

	return (
		<Modal show={show} onHide={()=>{if(!loading)onHide()}} fullscreen
			backdrop="static" keyboard={!loading} scrollable
			contentClassName={styles.content}
			aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}>
			<Modal.Header closeButton={!loading} className={styles.header}>
				<div className={styles.heading}>
					<span className={styles.headingIcon} aria-hidden="true"><RiCheckboxCircleLine size={26} /></span>
					<div>
						<Modal.Title as="h2" id={`${id}-title`} className={styles.title}>{rows.length === 1 ? "Record result delivery" : "Record selected deliveries"}</Modal.Title>
						<span className={styles.description}>{rows.length} selected {rows.length === 1 ? "test" : "tests"}</span>
					</div>
				</div>
			</Modal.Header>

			<Modal.Body className={styles.body} aria-busy={loading}>
				<div className={styles.notice} id={`${id}-description`}>
					<RiInformationLine size={20} aria-hidden="true" />
					<p>Review existing deliveries, then select one or more methods per test. Nothing is recorded until you confirm.</p>
				</div>
				<div className={styles.layout}>
					<div className={styles.controls} tabIndex={0} role="region" aria-label="Delivery choices and selected tests">
					<Form id={`${id}-form`} className={styles.form}
						onSubmit={event => { event.preventDefault(); void handleSubmit(); }}>
						<fieldset className={styles.methodFieldset} disabled={loading || !allHistoryReady}
							aria-describedby={`${id}-method-help`}>
							<legend className={styles.label}>Apply methods to all tests</legend>
							<div className={styles.methodGrid}>
								{deliveryMethods.map(method => {
									const count = rows.filter(row => selectedMethods[row.key]?.includes(method.value)).length;
									return <div key={method.value}>{methodCheckbox(method.value, `${method.label} for all tests`,
										count === rows.length && rows.length > 0, loading || !allHistoryReady,
										checked => rows.forEach(row => selectMethod(row.key, method.value, checked)),
										`${id}-all-${method.value}`, count > 0 && count < rows.length)}</div>;
								})}
							</div>
							<Form.Text id={`${id}-method-help`}>Choose multiple methods here, or adjust each test below. Previously recorded methods remain in history.</Form.Text>
						</fieldset>

						<Form.Group controlId={`${id}-notes`}>
							<Form.Label className={styles.label}>Notes <span className={styles.optional}>Optional</span></Form.Label>
							<Form.Control
								as="textarea"
								rows={3}
								value={notes}
								maxLength={500}
								disabled={loading}
								aria-describedby={`${id}-notes-help ${id}-notes-count`}
								onChange={(e) => setNotes(e.target.value)}
								placeholder="Add any delivery notes here..."
							/>
							<div className={styles.notesHelp}>
								<Form.Text id={`${id}-notes-help`}>Applies to the delivery records you choose below.</Form.Text>
								<span id={`${id}-notes-count`} className={styles.characterCount}>{notes.length}/500 characters</span>
							</div>
						</Form.Group>
					</Form>

					<section className={styles.selected} aria-labelledby={`${id}-selected-title`}>
						<div className={styles.selectedHeading}>
							<h3 id={`${id}-selected-title`} className={styles.sectionTitle}>
								<RiFileListLine size={20} aria-hidden="true" /> Selected tests
							</h3>
							<span className={styles.count}>{rows.length}</span>
						</div>
						{rows.length ? (
							<ul className={styles.testList} aria-label="Selected tests">
								{rows.map((row, index) => {
									const { item } = row, history = histories[row.billingid];
									const events = history?.status === "ready" ? history.events.filter(event => event.ascensionid === row.ascensionid) : [];
									const successful = events.filter((event): event is DeliveryEvent & { mode: string } => event.successful && typeof event.mode === "string");
									const ready = !row.error && history?.status === "ready";
									const name = item.name || item.test_name || `Test ${index + 1}`;
									return (
										<li key={row.key} className={styles.testItem}>
											<div className={styles.testContent}>
												<strong>{name}</strong>
												{item.fullname && <span className={styles.patientName}>{item.fullname}</span>}
												{row.error || history?.status === "error" ? (
													<div className={styles.historyError} role="alert">
														<p>{row.error || (history?.status === "error" ? history.message : "")}</p>
														{!row.error && <button type="button" className="btn btn-outline-secondary btn-sm"
															disabled={loading} onClick={() => void refreshHistory([row.billingid])}>Retry history check</button>}
													</div>
												) : !ready ? (
													<p className={styles.historyStatus} role="status"><Spinner as="span" size="sm" aria-hidden="true" /> Checking delivery history...</p>
												) : (
													<>
														<p className={`${styles.historyStatus} ${successful.length ? styles.delivered : styles.notDelivered}`}>
															{successful.length ? `Already delivered: ${[...new Set(successful.map(event => deliveryMethodLabel(event.mode)))].join(", ")}` : "No successful delivery recorded"}
														</p>
													</>
												)}
												<button type="button" className={`btn btn-outline-secondary btn-sm ${styles.historyButton}`}
													disabled={loading} aria-label={`View history for ${name}`}
													aria-controls={`${id}-history-panel`} aria-pressed={focusedRow?.key === row.key}
													onClick={() => setHistoryKey(row.key)}>View history{ready ? ` (${events.length})` : ""}</button>
												<fieldset className={styles.methodFieldset} disabled={loading || !ready}>
													<legend className={styles.testMethodLabel}>Methods to record for this test</legend>
													<div className={styles.methodGrid}>
														{deliveryMethods.map(method => <div key={method.value}>
															{methodCheckbox(method.value, `${method.label} for ${name}`,
																selectedMethods[row.key]?.includes(method.value) || false, loading || !ready,
																checked => selectMethod(row.key, method.value, checked), `${id}-test-${index}-${method.value}`)}
														</div>)}
													</div>
												</fieldset>
												{errors[row.key]?.map((message, errorIndex) => <p key={errorIndex} className={styles.failure} role="alert">{message}</p>)}
											</div>
										</li>
									);
								})}
							</ul>
						) : (
							<p className={styles.empty} role="status">No tests selected. Close this dialog and select tests first.</p>
						)}
					</section>
					</div>
					<section id={`${id}-history-panel`} className={styles.historyPanel} aria-labelledby={`${id}-history-title`}>
						<div className={styles.historyHeader}>
							<div className={styles.selectedHeading}>
								<h3 id={`${id}-history-title`} className={styles.sectionTitle}>Delivery history</h3>
								{focusedHistory?.status === "ready" && <span className={styles.count}>{focusedEvents.length} {focusedEvents.length === 1 ? "event" : "events"}</span>}
							</div>
							<label className={styles.label} htmlFor={`${id}-history-test`}>History for</label>
							<select className="form-select" id={`${id}-history-test`} value={focusedRow?.key || ""}
								disabled={loading || !rows.length} onChange={event => setHistoryKey(event.target.value)}>
								{rows.length ? rows.map((row, index) => <option key={row.key} value={row.key}>
									{row.item.name || row.item.test_name || `Test ${index + 1}`}{row.item.fullname ? ` · ${row.item.fullname}` : ""}
								</option>) : <option value="">No tests selected</option>}
							</select>
							{focusedRow?.item.fullname && <p className={styles.patientName}>{focusedRow.item.fullname}</p>}
						</div>
						<div className={styles.historyScroll} tabIndex={0} role="region" aria-label={`Delivery history for ${focusedName}`}>
							{!focusedRow ? <p className={styles.empty}>Select tests to review their delivery history.</p>
								: focusedRow.error || focusedHistory?.status === "error" ? (
									<div className={styles.historyError} role="alert">
										<p>{focusedRow.error || (focusedHistory?.status === "error" ? focusedHistory.message : "")}</p>
										{!focusedRow.error && <button type="button" className="btn btn-outline-secondary btn-sm"
											disabled={loading} onClick={() => void refreshHistory([focusedRow.billingid])}>Retry history check</button>}
									</div>
								) : focusedHistory?.status !== "ready" ? (
									<p className={styles.historyStatus} role="status"><Spinner as="span" size="sm" aria-hidden="true" /> Checking delivery history...</p>
								) : !focusedEvents.length ? (
									<p className={styles.empty}>No delivery events recorded for this test.</p>
								) : (
									<>
										<p className={styles.timelineOrder}>Newest first</p>
										<ol className={styles.timeline} aria-label={`Delivery history for ${focusedName}`}>
											{focusedEvents.map((event, eventIndex) => <li key={eventIndex} className={styles.timelineItem}
												data-status={event.successful ? "delivered" : "failed"}>
												<span className={`${styles.timelineMarker} ${event.successful ? styles.timelineSuccess : styles.timelineFailure}`} aria-hidden="true">
													{event.successful ? <RiCheckboxCircleLine size={18} /> : <RiErrorWarningLine size={18} />}
												</span>
												<div className={styles.timelineContent}>
													<strong>{event.successful && event.mode ? `Delivered by ${deliveryMethodLabel(event.mode)}` : "Failed delivery attempt"}</strong>
													<span>{deliveryEventDate(event.when)}</span>
													{event.operator && <span>Recorded by {event.operator}</span>}
													{event.notes && <span>{event.notes}</span>}
													{event.failure && <span className={styles.failure}>{event.failure}</span>}
												</div>
											</li>)}
										</ol>
									</>
								)}
						</div>
					</section>
				</div>
				<p className={styles.recordingHelp}>Selecting an already recorded method adds another delivery record. This records delivery status; it does not send results.</p>
			</Modal.Body>

			<Modal.Footer className={styles.footer}>
				<p className={styles.footerHint} role="status">
					{loading ? "Recording delivery status. Please wait..." : `${operations.length} new delivery ${operations.length === 1 ? "record" : "records"}`}
				</p>
				<div className={styles.actions}>
					<Button variant="outline-secondary" onClick={onHide} disabled={loading}>
						Cancel
					</Button>
					<Button variant="primary" type="submit" form={`${id}-form`}
						disabled={loading || !selectionReady || notes.length > 500}>
						{loading ? <><Spinner as="span" size="sm" className="me-2" aria-hidden="true" />Recording...</>
							: <><RiCheckboxCircleLine size={18} aria-hidden="true" /> Record {operations.length} {operations.length === 1 ? "delivery" : "deliveries"}</>}
					</Button>
				</div>
			</Modal.Footer>
		</Modal>
	);
}
