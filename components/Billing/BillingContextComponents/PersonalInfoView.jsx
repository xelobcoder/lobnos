import { useEffect, useState } from "react";
import { customFetch } from "../../Auth/customFetch";
import { useSearchParams } from "next/navigation";

export default function BillingPagePatientInformation() {
	const patientid = useSearchParams().get("patientid");
	const [data, setData] = useState({});
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
			<div>
				<div className="text-capitalize text-sm d-lg-flex d-xxl-flex d-sm-block " >
					<div className="d-flex">
						<span className="fw-bold text-uppercase ">
							FullName:
						</span>
						<span>
							{data?.firstname} {data?.middlename} {data.lastname} ({data?.gender ? data?.gender.split("")[0] : ''} {data?.age || ""} {data?.ageType || ""})
						</span>
					</div>
					<div className=" mx-lg-2 mx-xl-2">
						<span className="fw-bold text-uppercase">PatientId:</span>
						<span className="mx-2 ">
							{data?.patientid}
						</span>
					</div>
					<div className="d-flex ">
						<span className="text-uppercase fw-bold">Email:</span>
						<span className="text-lowercase mx-2">{data?.email}</span>
					</div>
				</div>
			</div>
		</section>
	);
}
