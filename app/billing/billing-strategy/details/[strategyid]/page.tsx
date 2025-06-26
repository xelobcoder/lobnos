import { customFetch } from "../../../../../components/Auth/customFetch";
import ClinicianBillingModeView from "../../../../../components/Clinicians/ClinicianBillingModeView";
import { PreviousClinicianBillingRecord } from "../../../../../components/Clinicians/dev.type";


export default async function ClinicianBillingStrategyPage({
	params,
}: {
	params: Promise<{ strategyid: number }>;
}) {
	try {
		const { strategyid } = await params;

		if (!strategyid) {
			return <div className="alert alert-danger-subtle text-sm">Invalid request.</div>;
		}

		const checkingResponse = await customFetch(`billing/strategies/check/${strategyid}`);


		const { hasStrategy } = checkingResponse;
		console.log("Checking response:", checkingResponse);

		if (!checkingResponse || !hasStrategy) {
			return (
				<ClinicianBillingModeView
					strategyid={strategyid}
					previousRecords={null}
				/>
			);
		}

		// Load existing billing strategy
		const response = await customFetch(
			`billing/strategies/${strategyid}`
		);

		if (typeof response !== "object" || !response) {
			return <h1>Error loading billing strategy.</h1>;
		}

		console.log("Loaded billing strategy:", response);

		return (
			<div>
				<ClinicianBillingModeView
					strategyid={strategyid}
					previousRecords={response as PreviousClinicianBillingRecord}
				/>
			</div>
		);
	} catch (error) {
		console.error("Error loading billing strategy:", error);
		return <h1>Error loading billing strategy.</h1>;
	}
}
