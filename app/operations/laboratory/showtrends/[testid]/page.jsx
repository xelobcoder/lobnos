"use client"
import { useSearchParams } from "next/navigation";
import PatientTrendModalJsx from "../../../../../components/operations/PatientTrendModalJsx/PatientTrendModal";

export default function ShowPatientTestTrends() {
	const testid = useSearchParams()?.get('testid');
	const billingid = useSearchParams()?.get('billingid');
	const patientid = useSearchParams()?.get('patientid');
	const test = useSearchParams()?.get('test');
	const data = { testid, billingid, patientid, test };
	return (
		<PatientTrendModalJsx data={data} />
	)

}