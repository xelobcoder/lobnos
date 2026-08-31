import LaboratoryAscensionFiltering from "./LaboratoryAscensionFiltering";


export default function LaboratoryAscensionStages({ ascension_stage,clinicianId, employeeid ,branchid}) {

	return (
		<div>
			<LaboratoryAscensionFiltering ascension_stage={ascension_stage} clinicianId={clinicianId} employeeid={employeeid} branchid={branchid} />
		</div>
	)
}


