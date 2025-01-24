"use client"
import { useApplicationSettings } from "../../../../components/Auth/useApplicationContext";
import LaboratoryLayout from "../../../../components/Layout/LaboratoryLayout";
import LaboratoryAscensionStages from "../../../../components/operations/Laboratory/LaboratoryAscensionStages";
import { LaboratoryStagesProvider } from "../../../../components/operations/Laboratory/LaboratoryStagesContext";
import AscensionProcessingTable from "../../../../components/operations/Laboratory/ProcessingStageTable";




export default function AscensionCompletedStage() {
	const { applicationsettings } = useApplicationSettings();
	const { user } = applicationsettings;


	return (
		<LaboratoryStagesProvider>
			<LaboratoryAscensionStages employeeid={user?.employeeid} ascension_stage={'PROCESSING'} />
			<AscensionProcessingTable />
		</LaboratoryStagesProvider>
	);
}

