import LaboratoryLayout from "../../../components/Layout/LaboratoryLayout";
import LaboratoryAscensionStages from "../../../components/operations/Laboratory/LaboratoryAscensionStages";
import AscentionCompletedTable from "../../../components/operations/Laboratory/CompletedStageTable";
import { LaboratoryStagesProvider } from "../../../components/operations/Laboratory/LaboratoryStagesContext";
import { useContext } from "react";
import AuthContext from "../../../components/Auth/useAuthentification";

export default function AscensionCompletedStage() {
	const { auth } = useContext(AuthContext);
	return (
		<LaboratoryLayout>
			<LaboratoryStagesProvider>
				<LaboratoryAscensionStages employeeid={auth?.employeeid} ascension_stage={'COMPLETED'} />
				<AscentionCompletedTable />
			</LaboratoryStagesProvider>
		</LaboratoryLayout>
	);
}

