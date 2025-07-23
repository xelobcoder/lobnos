"use client"
import LaboratoryAscensionStages from "../../../../components/operations/Laboratory/LaboratoryAscensionStages";
import { LaboratoryStagesProvider } from "../../../../components/operations/Laboratory/LaboratoryStagesContext";
import ValidationAscensionTable from "../../../../components/operations/Laboratory/AsensionValidationTable";
import { useApplication } from "../../../../components/Auth/useApplicationContext";


export default function AscensionValidationStage() {
	const applicationsettings = useApplication();
	const user = applicationsettings?.user;
	const branchid = applicationsettings?.branchid;


	return (
		<LaboratoryStagesProvider>
			<LaboratoryAscensionStages employeeid={user?.employeeid} ascension_stage={'VALIDATION'} branchid={branchid} />
			<ValidationAscensionTable employeeid={user?.employeeid} />
		</LaboratoryStagesProvider>
	)
}