
"use client";
import React, { useEffect, useState, use } from "react";
import { customFetch } from "../../../../../components/Auth/customFetch";
import ClinicianBillingModeView from "../../../../../components/Clinicians/ClinicianBillingModeView";
import { PreviousClinicianBillingRecord } from "../../../../../components/Clinicians/dev.type";


export default function ClinicianBillingStrategyPage(props: { params: Promise<{ strategyid: number }> }) {
    const params = use(props.params);
    const { strategyid } = params;
    const [previousRecords, setPreviousRecords] = useState<PreviousClinicianBillingRecord | null>(null);
    const [hasStrategy, setHasStrategy] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
		async function fetchData() {
			if (!strategyid) {
				setError("Invalid request.");
				setLoading(false);
				return;
			}
			try {
				const checkingResponse = await customFetch(`billing/strategies/check/${strategyid}`);
				setHasStrategy(checkingResponse?.hasStrategy ?? false);
				if (!checkingResponse || !checkingResponse.hasStrategy) {
					setPreviousRecords(null);
					setLoading(false);
					return;
				}
				const response = await customFetch(`billing/strategies/${strategyid}`);
				if (typeof response !== "object" || !response) {
					setError("Error loading billing strategy.");
				} else {
					setPreviousRecords(response as PreviousClinicianBillingRecord);
				}
			} catch (err) {
				setError("Error loading billing strategy.");
			} finally {
				setLoading(false);
			}
		}
		fetchData();
	}, [strategyid]);

    if (loading) {
		return <div>Loading...</div>;
	}
    if (error) {
		return <div className="alert alert-danger-subtle text-sm ">{error}</div>;
	}
    return (
		<div>
			<ClinicianBillingModeView
				strategyid={strategyid}
				previousRecords={previousRecords}
			/>
		</div>
	);
}
