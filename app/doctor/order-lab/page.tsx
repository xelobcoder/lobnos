"use client";

import React, { useState } from "react";
import { Container } from "react-bootstrap";
import PatientFiltered from "../../../components/accessories/SectorFileringComponents/CustomerFiltering";
import LabOrdersPanel from "../../../components/doctor/LabOrdersPanel";
import PreviewPatientInformation from "../../../components/petientsComponent/PreviewPatientInformation";

/**
 * Standalone lab ordering — order tests for a patient WITHOUT opening a consultation.
 * The clinician picks a patient, then orders from their own billing-strategy catalogue.
 */
export default function StandaloneLabOrderPage() {
	const [selectedPatient, setSelectedPatient] = useState<{ patientid: number; name?: string } | null>(null);

	const handleSelectedPatient = (selected: any) => {
		if (selected && selected?.patientid) {
			setSelectedPatient({
				patientid: selected.patientid,
				name: [selected.firstname, selected.middlename, selected.lastname].filter(Boolean).join(" ").trim() || undefined,
			});
		}
	};

	return (
		<Container fluid className="py-3">
			<div className="row g-3">
				<div className="col-lg-4 col-xl-3">
					<PatientFiltered isDisabled={false} getSelectedPatient={handleSelectedPatient} />
				</div>
				<div className="col-lg-8 col-xl-9">
					{selectedPatient ? (
						<>
							<div className="mb-2">
								<PreviewPatientInformation patientid={selectedPatient.patientid} compact />
							</div>
							<LabOrdersPanel patientid={selectedPatient.patientid} consultationid={null} />
						</>
					) : (
						<div className="text-muted small py-5 text-center border rounded">
							Select a patient on the left to start ordering lab tests (no consultation needed).
						</div>
					)}
				</div>
			</div>
		</Container>
	);
}
