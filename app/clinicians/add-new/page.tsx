"use client"
import BasicInformationClinician from "../../../components/Clinicians/BasicInformationClinician";
import ImageUploadClinician from "../../../components/Clinicians/ImageUploadClinician";
import ClinicianAuthenticationView from '../../../components/Clinicians/ClinicianAuthenticationView'

export default function Clinicians() {
	return (
		<div >
		<div className="col-6">
			<ImageUploadClinician />
		</div>
		<hr />
		<BasicInformationClinician />
		<hr />
		<ClinicianAuthenticationView />
	</div>
	);
}
