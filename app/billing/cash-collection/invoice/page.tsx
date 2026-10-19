"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { customFetch } from "../../../../components/Auth/customFetch";
import { useApplication } from "../../../../components/Auth/useApplicationContext";
import { getRequestContext } from "../../../../components/serverActions/requestHeaders";
import { companyImageUrl } from "../../../../lib/companyImage";
import { buildClientInvoicePdf } from "../../../../components/invoices/clientInvoicePdf";

async function loadLogo(): Promise<string | null> {
	try {
		const url = companyImageUrl((await getRequestContext())?.tenantId);
		if (!url) return null;
		const res = await fetch(url, { credentials: "include" });
		if (!res.ok) return null;
		const blob = await res.blob();
		if (!blob.size || !blob.type.startsWith("image/")) return null;
		return await new Promise((resolve) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : null);
			reader.onerror = () => resolve(null);
			reader.readAsDataURL(blob);
		});
	} catch {
		return null;
	}
}

// Client invoice: same PDF layout as the organization invoice, fed by the billing record.
export default function ClientInvoicePage() {
	const billingid = useSearchParams()?.get("billingid");
	const { user, company } = useApplication();
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!billingid || !user?.employeeid) return;
		let cancelled = false;
		(async () => {
			try {
				const tenantId = company?.tenantId || 1;
				const response = await customFetch(`billing/client/generate/receipt?tenantId=${tenantId}&billingid=${billingid}&employeeid=${user.employeeid}`);
				if (response?.status !== "success" || !response?.data) {
					if (!cancelled) setError(response?.message || "Unable to load billing data");
					return;
				}
				const doc = buildClientInvoicePdf(response.data, await loadLogo());
				if (!cancelled) setPreviewUrl(URL.createObjectURL(doc.output("blob")));
			} catch (e: any) {
				if (!cancelled) setError(e?.message || "Unable to generate invoice");
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [billingid, user?.employeeid, company?.tenantId]);

	if (!billingid) return <div className="p-4">No billing ID provided.</div>;
	if (error) return <div className="p-4 text-danger">{error}</div>;
	if (!previewUrl) return <div className="p-4">Generating invoice…</div>;

	return (
		<div className="d-flex flex-column" style={{ height: "100vh" }}>
			<div className="d-flex gap-2 p-2 border-bottom align-items-center">
				<strong className="me-auto">Invoice INV-{billingid}</strong>
				<a className="btn btn-sm btn-primary" href={previewUrl} download={`INV-${billingid}.pdf`}>
					Download PDF
				</a>
			</div>
			<iframe title="Invoice" src={previewUrl} style={{ flex: 1, border: 0, width: "100%" }} />
		</div>
	);
}
