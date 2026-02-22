"use client"
import { useEffect, useState } from "react";
import { customFetch, formatDateOrNA } from "../Auth/customFetch";
import { Container, Row, Col } from "react-bootstrap";

export default function PreviewPatientInformation({ patientid }) {
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
			<div className="p-3 bg-secondary-subtle d-flex justify-content-center" style={{ fontSize: '0.85rem' }}>
				{"<"}Loading Patient Information please ....... {">"}
			</div>
		);
	}

	const InfoField = ({ label, value }) => (
		<div className="mb-1" style={{ fontFamily: 'Candara, sans-serif' }}>
			<p style={{ fontSize: '0.9rem', marginBottom: '0' }} className="text-dark">
				<span className="fw-bold">{label}:</span> {value || "N/A"}
			</p>
		</div>
	);

	return (
		<div className="border rounded p-2 bg-light" style={{ fontFamily: 'Candara, sans-serif' }}>
			<h6 className="mb-2 text-capitalize fw-bold text-primary" style={{ fontFamily: 'Candara, sans-serif' }}>Patient Information</h6>
			<Row>
				<Col md={4} className="d-flex justify-content-center mb-3 mb-md-0">
					<img
						src={`https://ui-avatars.com/api/?name=${encodeURIComponent(`${data?.firstname || ''} ${data?.lastname || ''}`)}&background=random&size=180`}
						alt="Patient Avatar"
						className="rounded-circle border border-3"
						style={{
							width: '150px',
							height: '150px',
							objectFit: 'cover',
							fontFamily: 'Candara, sans-serif'
						}}
					/>
				</Col>
				<Col md={4}>
					<InfoField label="Full Name" value={`${data?.designation || ''} ${data?.firstname} ${data?.middlename} ${data?.lastname}`.trim()} />
					<InfoField label="Patient ID" value={data?.fullpatientid} />
					<InfoField label="Gender" value={data?.gender} />
					<InfoField label="Age" value={`${data?.age} ${data?.ageType || 'years'}`} />
					<InfoField label="Date of Birth" value={formatDateOrNA(data?.dob)} />
				</Col>
				<Col md={4}>
					<InfoField label="Mobile Number" value={data?.mobile ? `0${data?.mobile}` : "N/A"} />
					<InfoField label="Email" value={data?.email} />
					<InfoField label="Marital Status" value={data?.maritalstatus} />
					<InfoField label="Occupation" value={data?.occupation} />
					<InfoField label="Registration Date" value={formatDateOrNA(data?.date)} />
				</Col>
			</Row>
		</div>
	);
}
