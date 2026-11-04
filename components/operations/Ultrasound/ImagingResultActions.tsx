"use client";

import { useState } from "react";
import { RiCheckboxCircleLine, RiSendPlaneLine } from "@remixicon/react";
import { useApplication } from "../../Auth/useApplicationContext";
import SingleWorkFlowResultDeliveryModal from "../Laboratory/singleWorkFlowDeliveryResult";
import type { DeliveryItem } from "../Laboratory/resultDeliveryHistory";

type Props = {
	item: DeliveryItem & { testid: number | string; patientid: number | string };
};

export default function ImagingResultActions({ item }: Props) {
	const employeeid = useApplication()?.user?.employeeid;
	const [showDelivery, setShowDelivery] = useState(false);
	const query = new URLSearchParams({
		testid: String(item.testid), patientid: String(item.patientid),
		ascensionid: String(item.ascension_id ?? item.ascensionid), billingid: String(item.billingid),
		service: "imaging",
	});

	return (
		<>
			<button type="button" className="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1"
				disabled={!employeeid} onClick={() => setShowDelivery(true)}>
				<RiCheckboxCircleLine size={16} aria-hidden="true" />Record result delivery
			</button>
			<a className="btn btn-sm btn-outline-info d-inline-flex align-items-center gap-1"
				href={`/communications/sms/laboratory-lifecycle-events/sends?${query}`} target="_blank" rel="noopener noreferrer">
				<RiSendPlaneLine size={16} aria-hidden="true" />Send result-ready SMS
			</a>
			{showDelivery && employeeid && <SingleWorkFlowResultDeliveryModal
				show={showDelivery} onHide={() => setShowDelivery(false)} employeeid={employeeid}
				item={item} workflow="resultDelivery"
				onSuccess={shouldClose => { if (shouldClose !== false) setShowDelivery(false); }} />}
		</>
	);
}
