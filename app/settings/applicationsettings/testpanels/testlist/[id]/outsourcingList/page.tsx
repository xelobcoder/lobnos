"use client"
import { useParams, useSearchParams } from "next/navigation";
import OutsourcingTab from "../../../../../../../components/settingsComponents/test/tabs/OutsourcingTab";

// Kept for backward-compatible deep links; the in-place hub at testlist/[id] is the primary entry point now.
export default function TestPanelOutSourcingListOrganizationSelection() {
	const searcParams = useSearchParams();
	const params = useParams();
	const testid = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : "";
	const testname = searcParams?.get("testname") || "";

	return (
		<div>
			<h5>{testname}</h5>
			<OutsourcingTab testid={testid} testname={testname} />
		</div>
	);
}
