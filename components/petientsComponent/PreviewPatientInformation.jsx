"use client"
import { useEffect, useState } from "react";
import { customFetch, formatDateOrNA } from "../Auth/customFetch";
import { Row, Col } from "react-bootstrap";
import usePatientImage from './usePatientImage';

export default function PreviewPatientInformation({ patientid, compact = false }) {
	const [data, setData] = useState({});
	const [isLoading, setLoading] = useState(true);
	const photo = usePatientImage(Number(patientid));
	const initials = [data?.firstname, data?.lastname].filter(Boolean).map(name => name[0]).join('').toUpperCase() || 'P';
	const fullName = [data?.designation, data?.firstname, data?.middlename, data?.lastname].filter(Boolean).join(' ') || 'N/A';
	const photoStatus = photo.error ? <button type="button" className="btn btn-sm btn-link text-danger p-0" title={photo.error} disabled={photo.loading} onClick={() => { void photo.refresh().catch(() => undefined); }}>Retry patient photo</button> : photo.loading ? <span className="small text-muted">Loading photo...</span> : null;

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

	if (compact) {
		return (
			<div className="border rounded bg-body-tertiary px-3 py-2 d-flex align-items-center justify-content-between flex-wrap gap-2" style={{ fontFamily: 'Candara, sans-serif' }}>
				<div className="d-flex align-items-center gap-2" style={{ minWidth: 260 }}>
					{photo.imageUrl ? <img
						src={photo.imageUrl}
						alt="Patient photo"
						className="rounded-circle border"
						style={{ width: 36, height: 36, objectFit: 'cover' }}
					/> : <span role="img" aria-label="Patient initials" className="rounded-circle border bg-body-secondary d-inline-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 36, height: 36 }}>{initials}</span>}
					<div style={{ minWidth: 0 }}>
						{photoStatus}
						<div className="fw-bold text-truncate">
							{fullName}
						</div>
						<div className="text-muted" style={{ fontSize: '0.85rem' }}>
							ID: {data?.fullpatientid || 'N/A'} • {data?.gender || 'N/A'} • {data?.age ? `${data?.age} ${data?.ageType || 'years'}` : 'N/A'}
						</div>
					</div>
				</div>
				<div className="d-flex align-items-center flex-wrap gap-3" style={{ fontSize: '0.9rem' }}>
					<div><span className="text-muted">Mobile:</span> {data?.mobile ? `0${data?.mobile}` : 'N/A'}</div>
					<div><span className="text-muted">DOB:</span> {formatDateOrNA(data?.dob)}</div>
					<div><span className="text-muted">Registered:</span> {formatDateOrNA(data?.date)}</div>
				</div>
			</div>
		);
	}

	const InfoField = ({ label, value }) => (
		<div className="mb-1" style={{ fontFamily: 'Candara, sans-serif' }}>
			<p style={{ marginBottom: '0' }} className="text-body fs-5">
				<span className="fw-bold">{label}:</span> {value || "N/A"}
			</p>
		</div>
	);

	return (
		<div className="border rounded p-2 bg-body-tertiary" style={{ fontFamily: 'Candara, sans-serif' }}>
			<h6 className="mb-2 text-capitalize fw-bold text-primary" style={{ fontFamily: 'Candara, sans-serif' }}>Patient Information</h6>
			<Row>
				<Col md={4} className="d-flex flex-column align-items-center mb-3 mb-md-0">
					{photo.imageUrl ? <img
						src={photo.imageUrl}
						alt="Patient photo"
						className="rounded-circle border border-3"
						style={{
							width: '150px',
							height: '150px',
							objectFit: 'cover',
							fontFamily: 'Candara, sans-serif'
						}}
					/> : <span role="img" aria-label="Patient initials" className="rounded-circle border border-3 bg-body-secondary d-inline-flex align-items-center justify-content-center fs-1" style={{ width: 150, height: 150 }}>{initials}</span>}
					{photoStatus}
				</Col>
				<Col md={4}>
					<InfoField label="Name" value={fullName} />
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
