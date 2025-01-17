import React from 'react'
import ClinicianBillingModeView from '../../../../components/Clinicians/ClinicianBillingModeView'
import { customFetch } from '../../../../components/Auth/customFetch';

export default async function ClinicianBillingStrategyPage({ params }: {
	params: {
		clinicians: number
	}
}) {
	try {
		const { clinicians } = await params;

		if (clinicians) {
			const { hasStrategy } = await customFetch(`clinicians/billing/${clinicians}/has-strategy`);

			if (!hasStrategy) {
				return <ClinicianBillingModeView clinicianid={clinicians} previousRecords={null} />;
			}

			const response = await customFetch(`clinicians/billing/strategies/get/${clinicians}`);

			return (
				<div>
					<ClinicianBillingModeView clinicianid={clinicians} previousRecords={response} />
				</div>
			);
		} else {
			return <h1>Invalid request</h1>;
		}
	} catch (error) {
		console.error("Error fetching data:", error);
		return <h1>Error loading clinician billing strategy.</h1>;
	}
}
