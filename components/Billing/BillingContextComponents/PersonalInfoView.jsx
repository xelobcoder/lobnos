import { useEffect, useState } from "react";
import { customFetch } from "../../Auth/customFetch";
import { useSearchParams } from "next/navigation";
import PreviousTransactionSummaryOffCanvasShow from './Lib/PreviousTransactionSummaryOffCanvasShow';
import {
	UserIcon,
	IdCardIcon,
	EmailIcon,
	HistoryIcon,
} from './Lib/Icons'

export default function BillingPagePatientInformation() {
	const patientid = useSearchParams().get("patientid");
	const [data, setData] = useState({});
	const [showPrevious, setShowPrevious] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (patientid) {
			setLoading(true);
			customFetch(`register/personalinformation?patientid=${patientid}`)
				.then((data) => {
					setData(data?.result);
					setLoading(false);
				})
				.catch((err) => {
					setLoading(false);
					setData({});
				});
		}
	}, [patientid]);

	if (loading) return <h5>Loading ...</h5>;

	return (
		<section>
			<div className="d-flex justify-content-between">
				<div className="text-capitalize text-sm d-lg-flex d-xxl-flex d-sm-block">
					<div className="d-flex align-items-center">
						<UserIcon className="me-2" /> {/* Use imported icon */}
						<span className="fw-bold text-uppercase">FullName:</span>
						<span className="ms-2">
							{data?.firstname} {data?.middlename} {data.lastname} ({data?.gender ? data?.gender.split("")[0] : ''} {data?.age || ""} {data?.ageType || ""})
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
				<div>
					<button
						onClick={(ev) => { setShowPrevious(!showPrevious) }}
						className="btn pls-color btn-link d-flex align-items-center"
					>
						<HistoryIcon className="me-2" /> {/* Use imported icon */}
						Actions/View Previous Billing Information
					</button>
				</div>
			</div>
			<PreviousTransactionSummaryOffCanvasShow showPrevious={showPrevious} setShowPrevious={setShowPrevious} />
		</section>
	);
}