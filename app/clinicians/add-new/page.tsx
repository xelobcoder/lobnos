"use client"
import BasicInformationClinician from "../../../components/Clinicians/BasicInformationClinician";
import ImageUploadClinician from "../../../components/Clinicians/ImageUploadClinician";
import ClinicianAuthenticationView from '../../../components/Clinicians/ClinicianAuthenticationView'

export default function Clinicians() {
	return (
		<div className="d-flex col-12" >
			<div className="col-3">
				<ImageUploadClinician />
			</div>
			<div  className="col-9 mx-2">
				<BasicInformationClinician />
			</div>
		</div>
	);
}
