import {
	UserIcon,
	IdCardIcon,
	EmailIcon,
} from './Lib/Icons'

export default async function BillingPagePatientInformation({data }) {
	return (
		<section>
			<div className="d-flex justify-content-between">
				<div className="text-capitalize text-sm d-lg-flex d-xxl-flex d-sm-block">
					<div className="d-flex align-items-center">
						<UserIcon className="me-2" /> {/* Use imported icon */}
						<span className="fw-bold text-uppercase">FullName:</span>
						<span className="ms-2">
							{data?.firstname} {data?.middlename} {data?.lastname} ({data?.gender ? data?.gender.split("")[0] : ''} {data?.age || ""} {data?.ageType || ""})
						</span>
					</div>
					<div className="mx-lg-2 mx-xl-2 d-flex align-items-center">
						<IdCardIcon className="me-2" /> {/* Use imported icon */}
						<span className="fw-bold text-uppercase">PatientId:</span>
						<span className="mx-2">{data?.patientid}</span>
					</div>
					<div className="d-flex align-items-center">
						<EmailIcon className="me-2" /> {/* Use imported icon */}
						<span className="text-uppercase fw-bold">Email:</span>
						<span className="text-lowercase mx-2">{data?.email}</span>
					</div>
				</div>
			</div>

		</section>
	);
}