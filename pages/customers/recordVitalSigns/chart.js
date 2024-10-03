import { useSearchParams } from "next/navigation"
import FrontDeskLayout from "../../../components/Layout/FrontDeskLayout";
import { useState } from "react";

export default function CustomerVitalScanChartPage() {
	const [vitalRows, setVitalRows] = useState([]);
	const patientid = useSearchParams().get('patientid');
	const vsFromDate = useSearchParams().get("vsFromDate");

	return (
		<FrontDeskLayout>
			<div>
				<h6>Chart</h6>
			</div>
		</FrontDeskLayout>
	)
}