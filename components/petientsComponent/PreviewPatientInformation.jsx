"use client"
import { useEffect, useState } from "react";
import { customFetch, formatDateOrNA } from "../Auth/customFetch";

export default function PreviewPatientInformation({ patientid }) {
	// Reusable date formatting function

	const [data, setData] = useState({});
	const [isLoading, setLoading] = useState(true);

	useEffect(() => {
		setLoading(true);
		if (patientid) {
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

	if (isLoading) {
		return (
			<div className="heightedBorder p-2 bg-secondary-subtle d-flex justify-content-center" style={{ fontSize: '0.85rem' }}>
				{"<"}Loading Patient Information please ....... {">"}
			</div>
		);
	}

	return (
		<div className="">
			<div style={{ fontSize: '0.85rem' }}>
				<ul className="pls-color list-group m-0  br-5">
					<li className="list-group-item text-capitalize bg-secondary-subtle fw-bold">
						Full Name: {data?.firstname} {data?.middlename} {data?.lastname}
					</li>

					<div className="list-group-item d-flex flex-wrap justify-content-between">
						<span className="text-capitalize">
							Date of Birth: {formatDateOrNA(data?.dob)}
						</span>
						<span className="text-capitalize">Age: {data?.age} {data?.ageType}</span>
					</div>

					<div className="list-group-item d-flex flex-wrap justify-content-between">
						<span className="text-capitalize">Mobile Number: 0{data?.mobile}</span>
						<span className="text-capitalize">Gender: {data?.gender}</span>
					</div>

					<div className="list-group-item d-flex flex-wrap justify-content-between">
						<span className="text-capitalize">Marital Status: {data?.maritalstatus}</span>
						<span className="text-capitalize">Registration Date: {formatDateOrNA(data?.date)}</span>
					</div>
					<li className="list-group-item text-capitalize">Email: {data?.email}</li>
				</ul>
			</div>
		</div>
	);
}
