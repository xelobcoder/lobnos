"use client"
import BasicInformationClinician from "../../../components/Clinicians/BasicInformationClinician";
import ImageUploadClinician from "../../../components/Clinicians/ImageUploadClinician";
import ClinicianAuthenticationView from '../../../components/Clinicians/ClinicianAuthenticationView';

export default function Clinicians() {
	return (
		<div className="d-flex flex-column flex-md-row col-12" >
			<div className="col-12 col-md-3">
				<ImageUploadClinician />
			</div>
			<div className="col-12 col-md-9 mx-md-2  mt-md-0 mt-sm-4">
				<BasicInformationClinician />
			</div>
		</div>
	);
}
