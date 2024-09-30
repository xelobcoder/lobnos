import { useState } from "react";
import LaboratoryAscensionStages from "../../../components/operations/Laboratory/LaboratoryAscensionStages";
import LaboratoryLayout from "../../../components/Layout/LaboratoryLayout";
import AscenstionProcessingTable from "../../../components/operations/Laboratory/ProcessingStageTable";


export default function AscensionProcessingStage() {
	const [collection, setCollection] = useState([]);
	const [isLoading, setLoading] = useState(true);

	const handleProcessing = (item, action) => {
		const { ascensionid } = item;
		setCollection((any) => {
			let prev = [...any];
			const indexOfAscensionId = prev.findIndex((single, index) => single.ascensionid == ascensionid);

			if (indexOfAscensionId >= 0) {

				if (action === "start") {
					prev[indexOfAscensionId]['processingStartDate'] = Date.now();
				} else {
					prev[indexOfAscensionId]['processingEndDate'] = new Date();
				}
			}
			return prev;
		})
	}



	return (<LaboratoryLayout>
		<LaboratoryAscensionStages fnReceiveData={setCollection} setLoading={setLoading} ascension_stage={'PROCESSING'} />
		<AscenstionProcessingTable handleProcessing={handleProcessing} isLoading={isLoading} testCollection={collection} />
	</LaboratoryLayout>)
}