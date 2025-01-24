"use client"
import LaboratoryAscensionStages from "../../../../components/operations/Laboratory/LaboratoryAscensionStages";
import AscentionCompletedTable from "../../../../components/operations/Laboratory/CompletedStageTable";
import { LaboratoryStagesProvider } from "../../../../components/operations/Laboratory/LaboratoryStagesContext";
import { useApplicationSettings } from "../../../../components/Auth/useApplicationContext";


export default function AscensionCompletedStage() {
	const { applicationsettings } = useApplicationSettings();
	const { user } = applicationsettings;

	return (
		<LaboratoryStagesProvider>
			<LaboratoryAscensionStages employeeid={user?.employeeid} ascension_stage={'COMPLETED'} />
			<AscentionCompletedTable />
		</LaboratoryStagesProvider>
	);
}

