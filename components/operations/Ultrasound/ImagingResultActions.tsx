"use client";
import TableDropdownMenu, { TableDropdown } from '../../accessories/Datatables/TableDropdownMenu';

import { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { RiCheckboxCircleLine, RiDoorClosedFill, RiMoreLine, RiPrinterFill, RiSendPlaneLine } from "@remixicon/react";
import { useApplication } from "../../Auth/useApplicationContext";
import { controlApi } from "../OperationalControlsWorkspace";
import ResultReleaseWorkflowActions from "../Laboratory/ResultReleaseWorkflowActions";
import SingleWorkFlowResultDeliveryModal from "../Laboratory/singleWorkFlowDeliveryResult";
import type { DeliveryItem } from "../Laboratory/resultDeliveryHistory";

type Props = {
	item: DeliveryItem & { testid: number | string; patientid: number | string };
	variant?: "buttons" | "menu";
	onEnter?: () => void;
	entryLabel?: string;
	entryDisabled?: boolean;
	showCompletedActions?: boolean;
	onPrint?: () => void;
};

export default function ImagingResultActions({
	item,
	variant = "buttons",
	onEnter,
	entryLabel = "Enter result",
	entryDisabled = false,
	showCompletedActions = false,
	onPrint,
}: Props) {
	const employeeid = useApplication()?.user?.employeeid;
	const [showDelivery, setShowDelivery] = useState(false);
    const [releaseWorkflow, setReleaseWorkflow] = useState<any>(null);
    const accession = Number(item.ascension_id ?? item.ascensionid);
    const [releaseReload, setReleaseReload] = useState(0);
    useEffect(() => {
        let active = true;
        if (!accession || !employeeid || (variant === "menu" && !showCompletedActions)) return;
        void controlApi(`reports/${accession}/release-preview`).then(data => {
            if (active) setReleaseWorkflow(data.workflow);
        }).catch(() => { if (active) setReleaseWorkflow(null); });
        return () => { active = false; };
    }, [accession, employeeid, releaseReload, variant, showCompletedActions]);
    const releaseActions = <ResultReleaseWorkflowActions ascensionId={accession} patientName=""
        testName="Imaging result" workflow={releaseWorkflow} onUpdated={() => setReleaseReload(value => value + 1)} />;
	const query = new URLSearchParams({
		testid: String(item.testid), patientid: String(item.patientid),
		ascensionid: String(item.ascension_id ?? item.ascensionid), billingid: String(item.billingid),
		service: "imaging",
	});
	const deliveryModal = showDelivery && employeeid && <SingleWorkFlowResultDeliveryModal
		show={showDelivery} onHide={() => setShowDelivery(false)} employeeid={employeeid}
		item={item} workflow="resultDelivery"
		onSuccess={shouldClose => { if (shouldClose !== false) setShowDelivery(false); }} />;

	if (variant === "menu") {
		return (
			<>
				<TableDropdown align="end">
					<Dropdown.Toggle
						as="button"
						type="button"
						className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 text-nowrap"
						aria-label="Ultrasound result actions"
					>
						<RiMoreLine size={16} aria-hidden="true" />
						Actions
					</Dropdown.Toggle>
					<TableDropdownMenu align="end">
                        {showCompletedActions && releaseActions}
						{onEnter && <Dropdown.Item as="button" type="button" disabled={entryDisabled} onClick={onEnter}>
							<RiDoorClosedFill size={16} className="me-2" aria-hidden="true" />{entryLabel}
						</Dropdown.Item>}
						{showCompletedActions && onPrint && <Dropdown.Item as="button" type="button" onClick={onPrint}>
							<RiPrinterFill size={16} className="me-2" aria-hidden="true" />Print result
						</Dropdown.Item>}
						{showCompletedActions && <>
							<Dropdown.Item as="button" type="button" disabled={!employeeid} onClick={() => setShowDelivery(true)}>
								<RiCheckboxCircleLine size={16} className="me-2" aria-hidden="true" />Record result delivery
							</Dropdown.Item>
							<Dropdown.Item as="a" href={`/communications/sms/laboratory-lifecycle-events/sends?${query}`} target="_blank" rel="noopener noreferrer">
								<RiSendPlaneLine size={16} className="me-2" aria-hidden="true" />Send result-ready SMS
							</Dropdown.Item>
						</>}
					</TableDropdownMenu>
				</TableDropdown>
				{deliveryModal}
			</>
		);
	}

	return (
		<>
            <TableDropdown align="end"><Dropdown.Toggle size="sm" variant="outline-primary">Result authorization</Dropdown.Toggle>
                <TableDropdownMenu>{releaseActions}</TableDropdownMenu></TableDropdown>
			<button type="button" className="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1"
				disabled={!employeeid} onClick={() => setShowDelivery(true)}>
				<RiCheckboxCircleLine size={16} aria-hidden="true" />Record result delivery
			</button>
			<a className="btn btn-sm btn-outline-info d-inline-flex align-items-center gap-1"
				href={`/communications/sms/laboratory-lifecycle-events/sends?${query}`} target="_blank" rel="noopener noreferrer">
				<RiSendPlaneLine size={16} aria-hidden="true" />Send result-ready SMS
			</a>
			{deliveryModal}
		</>
	);
}
