"use client";

import { useEffect, useState } from "react";

const views = [
	{
		label: "Registration",
		kicker: "PATIENT & ORDER WORKFLOW",
		title: "Move a registration through clear steps.",
		copy: "The current registration flow is organized around personal information, address, emergency contact, then photo and credentials.",
		steps: ["Personal information", "Address", "Emergency contact", "Photo & credentials"],
		chartTitle: "Registrations by day",
		chartValues: [36, 52, 44, 68, 57, 82, 71],
		tableHead: ["REFERENCE", "REQUESTED PANEL", "REGISTRATION", "STATUS"],
		rows: [
			{ reference: "SYN-REG-041", item: "Full blood count", context: "New visit", status: "Draft", tone: "amber" },
			{ reference: "SYN-REG-042", item: "Malaria rapid test", context: "New visit", status: "In progress", tone: "blue" },
		],
	},
	{
		label: "Physical samples",
		kicker: "SPECIMEN OPERATIONS",
		title: "Follow the physical hand-offs.",
		copy: "Use barcode lookup with collection, receipt, review, recollection and audit actions to follow specimen work.",
		steps: ["Barcode lookup", "Collection", "Receipt", "Review & recollection"],
		chartTitle: "Samples received by day",
		chartValues: [42, 58, 51, 73, 64, 88, 76],
		tableHead: ["BARCODE", "TEST PANEL", "COLLECTION", "STATUS"],
		rows: [
			{ reference: "SYN-0261-014", item: "Full blood count", context: "Facility", status: "Received", tone: "green" },
			{ reference: "SYN-0261-015", item: "Malaria rapid test", context: "Home collection", status: "Collected", tone: "blue" },
			{ reference: "SYN-0261-016", item: "Urinalysis", context: "Facility", status: "Review", tone: "amber" },
		],
	},
	{
		label: "Results",
		kicker: "RESULT ENTRY & AUTHORIZATION",
		title: "Structure result entry and review.",
		copy: "Enter results using configured test parameters and report templates, review critical alerts and route results through authorization before permitted reporting.",
		steps: ["Result entry", "Critical alerts", "Review", "Authorization & report"],
		chartTitle: "Results reviewed by day",
		chartValues: [29, 46, 39, 62, 55, 75, 67],
		tableHead: ["SAMPLE", "TEST PANEL", "RESULT WORKFLOW", "STATUS"],
		rows: [
			{ reference: "SYN-0261-014", item: "Full blood count", context: "Entry complete", status: "For review", tone: "blue" },
			{ reference: "SYN-0261-016", item: "Urinalysis", context: "Review step", status: "Pending", tone: "amber" },
		],
	},
	{
		label: "Billing",
		kicker: "BILLING & COLLECTIONS",
		title: "Connect charges with collection work.",
		copy: "Use general, clinician and organization tariffs with configured time-based pricing, then review payments, approvals, refunds and cash-out records.",
		steps: ["Service charges", "Tariffs & billing", "Payment activity", "Review & cash-out"],
		chartTitle: "Payments recorded by day",
		chartValues: [31, 48, 43, 69, 59, 79, 72],
		tableHead: ["REFERENCE", "SERVICE", "ILLUSTRATIVE AMOUNT", "STATUS"],
		rows: [
			{ reference: "SYN-BIL-0081", item: "Full blood count", context: "GHS 85.00 · sample", status: "Pending", tone: "amber" },
			{ reference: "SYN-BIL-0082", item: "Collection service", context: "GHS 30.00 · sample", status: "Recorded", tone: "green" },
		],
	},
	{
		label: "Accounting",
		kicker: "FINANCIAL OPERATIONS",
		title: "A fuller view of accounting work.",
		copy: "Use ledger, journals, statements, aging, period control and imported bank-statement matching in configured finance workflows.",
		steps: ["Subledger activity", "Journal review", "Period close", "Statement matching"],
		chartTitle: "Journal activity by day",
		chartValues: [23, 39, 35, 57, 48, 68, 61],
		tableHead: ["REFERENCE", "ACCOUNTING ACTIVITY", "PERIOD", "STATUS"],
		rows: [
			{ reference: "SYN-JRN-0012", item: "Manual journal", context: "Sample period", status: "For approval", tone: "amber" },
			{ reference: "SYN-BNK-0046", item: "Imported statement line", context: "Sample period", status: "Matched", tone: "green" },
		],
	},
	{
		label: "Inventory",
		kicker: "SUPPLY MANAGEMENT",
		title: "Keep stock activity in view.",
		copy: "Organize supplier, item, storage, unit, purchase-order, stock-movement and supplier-payment records.",
		steps: ["Catalog & suppliers", "Purchase order", "Receipt & storage", "Issue & consumption"],
		chartTitle: "Stock movements by day",
		chartValues: [54, 42, 67, 58, 77, 63, 86],
		tableHead: ["ITEM CODE", "STOCK ITEM", "LOCATION / BALANCE", "STATUS"],
		rows: [
			{ reference: "SYN-INV-032", item: "Collection tubes", context: "Store A · sample", status: "In stock", tone: "green" },
			{ reference: "SYN-INV-033", item: "Reagent kit", context: "Store B · sample", status: "Review", tone: "amber" },
		],
	},
	{
		label: "Quality control",
		kicker: "QUALITY CONTROL & DEVICE CALIBRATION",
		title: "Review control records and readings.",
		copy: "Organize QC sessions, control readings and device calibration records, with configured acceptance before result workflows.",
		steps: ["Control setup", "QC session", "Review readings", "Accept for results"],
		chartTitle: "QC reviews by day",
		chartValues: [25, 43, 38, 59, 52, 71, 65],
		tableHead: ["RECORD", "CONTROL", "SESSION", "REVIEW"],
		rows: [
			{ reference: "SYN-QC-0021", item: "Control Level 1", context: "Sample session", status: "Reviewed", tone: "green" },
			{ reference: "SYN-QC-0022", item: "Control Level 2", context: "Sample session", status: "For review", tone: "amber" },
		],
	},
];

export function ProductShowcase() {
	const [active, setActive] = useState(0);
	const [isPlaying, setIsPlaying] = useState(true);
	const view = views[active];
	const chartPoints = view.chartValues.map((value, index) => `${12 + index * 36},${72 - value * 0.58}`).join(" ");
	const chartArea = `12,76 ${chartPoints} 228,76`;

	useEffect(() => {
		const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
		const frame = window.requestAnimationFrame(() => {
			if (reducedMotion.matches) setIsPlaying(false);
		});
		return () => window.cancelAnimationFrame(frame);
	}, []);

	useEffect(() => {
		if (!isPlaying) return;
		const timer = window.setInterval(() => setActive((current) => (current + 1) % views.length), 6500);
		return () => window.clearInterval(timer);
	}, [isPlaying]);

	return (
		<div className="showcase">
			<div className="showcase-nav">
				<div className="showcase-tabs" role="tablist" aria-label="Illustrative PLS workflow structures">
					{views.map((item, index) => <button key={item.label} id={`showcase-tab-${index}`} role="tab" aria-selected={active === index} aria-controls="showcase-panel" tabIndex={active === index ? 0 : -1} onFocus={() => setIsPlaying(false)} onClick={() => {
						setActive(index);
						setIsPlaying(false);
					}} onKeyDown={(event) => {
						if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
							event.preventDefault();
							const direction = event.key === "ArrowRight" ? 1 : -1;
							const next = (index + direction + views.length) % views.length;
							setActive(next);
							setIsPlaying(false);
							document.getElementById(`showcase-tab-${next}`)?.focus();
						}
					}}>{item.label}</button>)}
				</div>
				<button className="showcase-play" type="button" aria-pressed={isPlaying} onClick={() => setIsPlaying((current) => !current)}>
					<span aria-hidden="true">{isPlaying ? "Ⅱ" : "▶"}</span>{isPlaying ? "Pause tour" : "Play tour"}
				</button>
			</div>
			<div className="showcase-panel" id="showcase-panel" role="tabpanel" aria-labelledby={`showcase-tab-${active}`}>
				<div className="showcase-copy"><span className="eyebrow">{view.kicker}</span><h3>{view.title}</h3><p>{view.copy}</p><span className="showcase-note">Illustrative workflow map based on current PLS capabilities. Not a live screenshot.</span></div>
				<div className="showcase-screen" aria-label={`${view.label} workflow illustration without customer records`} role="img">
					<div className="screen-head"><span><i /> PLS <small>FACILITY WORKSPACE</small></span><b>{view.label}</b><span>••</span></div>
					<div className="screen-workarea">
						<aside className="screen-sidebar"><span>WORKSPACE</span>{["Home", "Registration", "Samples", "Results", "Billing", "Accounting", "Inventory", "Quality control"].map((item) => <i className={item.toLowerCase() === (view.label === "Physical samples" ? "samples" : view.label.toLowerCase()) ? "screen-nav-active" : ""} key={item}>{item}</i>)}</aside>
						<div className="screen-content"><div className="screen-context"><small>PLS WORKSPACE / {view.kicker}</small><strong>{view.label}</strong></div>
							<div className="screen-steps">{view.steps.map((step, index) => <div className="screen-step" key={step}><span>{String(index + 1).padStart(2, "0")}</span><b>{step}</b>{index < view.steps.length - 1 && <i aria-hidden="true">→</i>}</div>)}</div>
							<div className="workflow-chart">
								<div className="workflow-chart-head"><b>{view.chartTitle}</b><span>ILLUSTRATIVE · 7 DAYS</span></div>
								<svg viewBox="0 0 240 88" role="img" aria-label={`${view.chartTitle}, illustrative synthetic values`}>
									<path className="workflow-chart-grid" d="M12 20H228 M12 48H228 M12 76H228" />
									<polygon className="workflow-chart-area" points={chartArea} />
									<polyline className="workflow-chart-line" points={chartPoints} />
									{view.chartValues.map((value, index) => <circle className="workflow-chart-point" key={`${index}-${value}`} cx={12 + index * 36} cy={72 - value * 0.58} r="2.6" />)}
								</svg>
								<div className="workflow-chart-axis"><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span></div>
							</div>
							<div className="screen-detail-panel"><div className="screen-detail-head"><b>{view.label} workflow records</b><span>All values synthetic</span></div><div className="screen-table-scroll"><table className="screen-workflow-table"><thead><tr>{view.tableHead.map((heading) => <th key={heading}>{heading}</th>)}</tr></thead><tbody>{view.rows.map((row) => <tr key={row.reference}><td><b>{row.reference}</b><small>SYNTHETIC</small></td><td>{row.item}</td><td>{row.context}</td><td><span className={`screen-status screen-status-${row.tone}`}>{row.status}</span></td></tr>)}</tbody></table></div></div>
							<p className="screen-disclaimer">Illustrative workflow structure · Synthetic IDs, states &amp; amounts · Not a live screenshot</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
