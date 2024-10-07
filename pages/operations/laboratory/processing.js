import LaboratoryLayout from "../../../components/Layout/LaboratoryLayout";
import LaboratoryAscensionStages from "../../../components/operations/Laboratory/LaboratoryAscensionStages";
import AscentionCompletedTable from "../../../components/operations/Laboratory/CompletedStageTable";
import { LaboratoryStagesProvider } from "../../../components/operations/Laboratory/LaboratoryStagesContext";
import AscensionProcessingTable from "../../../components/operations/Laboratory/ProcessingStageTable";

export default function AscensionCompletedStage() {
	return (
		<LaboratoryLayout>
			<LaboratoryStagesProvider>
				<LaboratoryAscensionStages ascension_stage={'PROCESSING'} />
				<AscensionProcessingTable/>
			</LaboratoryStagesProvider>
		</LaboratoryLayout>
	);
}

