"use client";

import React, { useState } from "react";
import { Container } from "react-bootstrap";
import PatientFiltered from "../../../../components/accessories/SectorFileringComponents/CustomerFiltering";
import DrugOrderPanel from "../../../../components/doctor/DrugOrderPanel";
import PreviewPatientInformation from "../../../../components/petientsComponent/PreviewPatientInformation";

/**
 * Standalone drug ordering — send a prescription to the pharmacy for a patient
 * WITHOUT opening a consultation.
 */
export default function StandaloneDrugOrderPage() {
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
							<DrugOrderPanel patientid={selectedPatient.patientid} consultationid={null} />
						</>
					) : (
						<div className="text-muted small py-5 text-center border rounded">
							Select a patient on the left to start ordering drugs (no consultation needed).
						</div>
					)}
				</div>
			</div>
		</Container>
	);
}
