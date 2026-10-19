"use client";

import { useEffect, useRef, useState } from "react";
import { Alert, Button, Col, Form, Modal, Row, Spinner } from "react-bootstrap";
import type jsPDF from "jspdf";
import { toast } from "react-toastify";
import { customFetch } from "../Auth/customFetch";
import { getRequestContext } from "../serverActions/requestHeaders";
import { companyImageUrl } from "../../lib/companyImage";
import { localReportDate, salesReportEndpoint, salesReportFilename } from "../../lib/salesReport";
import type { SalesReport } from "../../lib/salesReport";
import { buildSalesReportPdf } from "./salesReportPdf";

async function reportLogo(): Promise<string | null> {
	const context = await getRequestContext();
	const url = companyImageUrl(context?.tenantId);
	if (!url) throw new Error("The facility logo could not be loaded without a valid tenant.");
	const response = await fetch(url, { credentials: "include", cache: "no-store" });
	if (response.status === 404 || response.status === 204) return null;
	if (!response.ok) throw new Error("The facility logo could not be loaded.");
	const blob = await response.blob();
	if (!blob.size) return null;
	if (!blob.type.startsWith("image/")) throw new Error("The facility logo is not a supported image.");
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onerror = () => reject(new Error("The facility logo could not be read."));
		reader.onload = () => {
			if (typeof reader.result === "string") resolve(reader.result);
			else reject(new Error("The facility logo could not be read."));
		};
		reader.readAsDataURL(blob);
	});
}

export default function SalesReportModal({ branchId, from: initialFrom, to: initialTo }: {
	branchId: number | string;
	from: string;
	to: string;
}) {
	const [show, setShow] = useState(false);
	const [from, setFrom] = useState("");
	const [to, setTo] = useState("");
	const [includeDetails, setIncludeDetails] = useState(true);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");
	const [previewUrl, setPreviewUrl] = useState("");
	const [viewerReady, setViewerReady] = useState(false);
	const [pdf, setPdf] = useState<{ document: jsPDF; filename: string } | null>(null);
	const previewRef = useRef<HTMLIFrameElement>(null);
	const generation = useRef(0);

	useEffect(() => () => { generation.current++; }, []);
	useEffect(() => {
		setViewerReady(false);
		if (!pdf) { setPreviewUrl(""); return; }
		const url = URL.createObjectURL(pdf.document.output("blob"));
		setPreviewUrl(url);
		return () => URL.revokeObjectURL(url);
	}, [pdf]);

	function open() {
		generation.current++;
		setFrom(initialFrom || initialTo || localReportDate());
		setTo(initialTo || initialFrom || localReportDate());
		setError("");
		setPdf(null);
		setShow(true);
	}

	function close() {
		generation.current++;
		setShow(false);
		setBusy(false);
		setPdf(null);
	}

	async function generate() {
		const request = ++generation.current;
		setBusy(true);
		setError("");
		setPdf(null);
		try {
			const endpoint = salesReportEndpoint(branchId, from, to);
			const response: { status?: string; statusCode?: number; data?: SalesReport; message?: string; error?: string } =
				await customFetch(endpoint);
			if (response?.status !== "success" || response.statusCode !== 200 || !response.data) {
				throw new Error(response?.message || response?.error || "Unable to load the sales report.");
			}
			const report = response.data;
			let logo: string | null = null;
			try {
				logo = await reportLogo();
			} catch (cause) {
				if (request !== generation.current) return;
				toast.warning(`${cause instanceof Error ? cause.message : "Unable to load the logo."} The report will use the company letterhead without a logo.`);
			}
			if (request !== generation.current) return;
			let document: jsPDF;
			try {
				document = buildSalesReportPdf(report, { includeDetails, logoDataUrl: logo });
			} catch (cause) {
				if (!logo) throw cause;
				console.warn("Sales report PDF could not render the facility logo", cause);
				toast.warning("The facility logo could not be rendered. The report uses the company letterhead without it.");
				document = buildSalesReportPdf(report, { includeDetails });
			}
			setPdf({ document, filename: salesReportFilename(report, includeDetails) });
		} catch (cause) {
			if (request === generation.current) {
				setError(cause instanceof Error ? cause.message : "Unable to generate the sales report.");
			}
		} finally {
			if (request === generation.current) setBusy(false);
		}
	}

	function print() {
		try {
			const viewer = previewRef.current?.contentWindow;
			if (!viewer) throw new Error("The PDF preview is not ready. Download the PDF to print it.");
			viewer.focus();
			viewer.print();
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Printing is unavailable in this viewer. Download the PDF to print it.");
		}
	}

	return <>
		<Button variant="outline-primary" size="sm" onClick={open}>Sales &amp; Expenses Report</Button>
		<Modal show={show} onHide={close} size="xl" centered>
			<Modal.Header closeButton><Modal.Title>Sales &amp; Expenses Report</Modal.Title></Modal.Header>
			<Modal.Body>
				<Row className="g-3 align-items-end">
					<Col sm={4}>
						<Form.Label htmlFor="sales-report-from">From</Form.Label>
						<Form.Control id="sales-report-from" type="date" value={from} disabled={busy}
							onChange={event => { setFrom(event.target.value); setPdf(null); }} />
					</Col>
					<Col sm={4}>
						<Form.Label htmlFor="sales-report-to">To</Form.Label>
						<Form.Control id="sales-report-to" type="date" value={to} min={from} disabled={busy}
							onChange={event => { setTo(event.target.value); setPdf(null); }} />
					</Col>
					<Col sm={4}><Button disabled={busy} onClick={generate}>
						{busy && <Spinner size="sm" className="me-2" />}Generate report
					</Button></Col>
				</Row>
				<Form.Check className="my-3" id="sales-report-details" type="checkbox" checked={includeDetails} disabled={busy}
					label="Include full transaction, collection, expense and outstanding lists after the summary"
					onChange={event => { setIncludeDetails(event.target.checked); setPdf(null); }} />
				<p className="small text-muted">
					Sales are bills created in this period. Collections include payments received on older bills.
					Expenses are amounts actually paid in this period. Outstanding amounts are current balances on this period&apos;s bills,
					not historical balances. Net cash movement is collections less expense payments, not profit.
				</p>
				{error && <Alert variant="danger" role="alert">{error}</Alert>}
				{previewUrl && pdf && <>
					<div className="d-flex gap-2 mb-3">
						<Button size="sm" disabled={!viewerReady} onClick={print}>Print</Button>
						<Button size="sm" variant="outline-primary" onClick={() => {
							try { pdf.document.save(pdf.filename); }
							catch { setError("The PDF could not be downloaded. Please generate the report again."); }
						}}>Download PDF</Button>
					</div>
					<iframe ref={previewRef} title="Sales and expenses report preview" src={previewUrl}
						onLoad={() => setViewerReady(true)}
						style={{ width: "100%", height: "70vh", border: "1px solid #dee2e6" }} />
				</>}
			</Modal.Body>
			<Modal.Footer><Button variant="secondary" onClick={close}>Close</Button></Modal.Footer>
		</Modal>
	</>;
}
