import LaboratoryAscensionFiltering from "./LaboratoryAscensionFiltering";


export default function LaboratoryAscensionStages({ ascension_stage,employeeid }) {


	return (
		<div>
			<LaboratoryAscensionFiltering ascension_stage={ascension_stage} employeeid={employeeid} />
		</div>
	)
}


