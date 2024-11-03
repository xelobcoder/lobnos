import LaboratoryLayout from "../../../components/Layout/LaboratoryLayout";
import LaboratoryAscensionStages from "../../../components/operations/Laboratory/LaboratoryAscensionStages";
import AscentionCompletedTable from "../../../components/operations/Laboratory/CompletedStageTable";
import { LaboratoryStagesProvider } from "../../../components/operations/Laboratory/LaboratoryStagesContext";
import { useApplicationSettings } from "../../../components/Auth/useApplicationContext";


export default function AscensionCompletedStage() {
	const { applicationsettings } = useApplicationSettings();
	const { user } = applicationsettings;
	
	return (
		<LaboratoryLayout>
			<LaboratoryStagesProvider>
				<LaboratoryAscensionStages employeeid={user?.employeeid} ascension_stage={'COMPLETED'} />
				<AscentionCompletedTable />
			</LaboratoryStagesProvider>
		</LaboratoryLayout>
	);
}

