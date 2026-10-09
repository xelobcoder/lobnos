"use client"

import { useApplicationSettings } from "../../../../components/Auth/useApplicationContext";
import LaboratoryAscensionStages from "../../../../components/operations/Laboratory/LaboratoryAscensionStages";
import { LaboratoryStagesProvider } from "../../../../components/operations/Laboratory/LaboratoryStagesContext"
import AscentionCompletedTable  from '../../../../components/operations/Laboratory/CompletedStageTable'


export default function AscensionCompletedStage() {
	const { applicationsettings } = useApplicationSettings();
	const { user, branchid } = applicationsettings;

	return (
		<LaboratoryStagesProvider>
			<LaboratoryAscensionStages clinicianId={undefined} employeeid={user?.employeeid} ascension_stage={'COMPLETED'} branchid={branchid} />
			<AscentionCompletedTable employeeid={user?.employeeid} branchid={branchid} />
		</LaboratoryStagesProvider>
	);
}

