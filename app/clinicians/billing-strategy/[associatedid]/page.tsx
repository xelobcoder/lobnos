import React from 'react';
import ClinicianBillingModeView from '../../../../components/Clinicians/ClinicianBillingModeView';
import { customFetch } from '../../../../components/Auth/customFetch';
import { boolean } from 'yup';

export default async function ClinicianBillingStrategyPage({
	params,
	searchParams,
}: {
	params: Promise<{ associatedid: number }>;
	searchParams: Promise<{ strategy: string }>;
}) {
	try {
		const { associatedid } = await params;
		const { strategy } = await searchParams;
		if (!associatedid || !strategy) return <h1>Invalid request.</h1>;
		const checkingResponses = await customFetch(`clinicians/billing/${associatedid}/has-strategy`);
		const { hasStrategy } = checkingResponses;
		if (!hasStrategy) {
			return (
				<ClinicianBillingModeView
					clinicianid={associatedid}
					previousRecords={null}
					strategy={strategy}
				/>
			)
		}

		const response = await customFetch(`clinicians/billing/strategies/get/${associatedid}`);

		

		return (
			<div>
				<ClinicianBillingModeView
					clinicianid={associatedid}
					previousRecords={response}
					strategy={strategy}
				/>
			</div>
		);
	} catch (error) {
		return <h1>Error loading clinician billing strategy.</h1>;
	}
}
