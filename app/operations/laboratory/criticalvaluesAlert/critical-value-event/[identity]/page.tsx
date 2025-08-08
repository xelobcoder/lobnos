"use client"
import { useEffect, useState } from 'react'
import { customFetch } from '../../../../../../components/Auth/customFetch';
import { useParams } from 'next/navigation';
import BillingPagePatientInformation from '../../../../../../components/Billing/BillingContextComponents/PersonalInfoView';
import { RiFileList2Line } from "@remixicon/react";
import styles from '../../../../../../styles/SmsTemplateList.module.css'

export default function CRASCENSIONVIEW() {
	const [alert, setAlert] = useState<any>(null);
	const [patientInfo, setPatientInfo] = useState<any>(null);
	const [recordValues, setRecordValues] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const params = useParams();




	useEffect(() => {
		const fetchData = async () => {
			if (!params?.identity) {
				setError('No identity parameter provided');
				setIsLoading(false);
				return;
			}

			try {
				setIsLoading(true);
				const data = await customFetch(`result/criticalvalues/logging/${params.identity}`);
				if (data && typeof data === 'object') {
					setAlert(data.alert || null);
					setPatientInfo(data.patientInfo || null);
					setRecordValues(Array.isArray(data.recordValues) ? data.recordValues : []);
				} else {
					setAlert(null);
					setPatientInfo(null);
					setRecordValues([]);
				}
			} catch (err) {
				setError('Failed to fetch critical value data');
				console.error(err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [params?.identity]);

	if (isLoading) {
		return (
			<div >
				<div>Loading critical value data...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				height: '50vh',
				color: '#d32f2f'
			}}>
				{error}
			</div>
		);
	}

	if (!alert) {
		return (
			<div style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				height: '50vh'
			}}>
				No critical value found
			</div>
		);
	}


	return (
		<div className=" px-0">
			<div className="bg-secondary-subtle rounded-3 shadow-sm p-3 mb-4">
				<BillingPagePatientInformation data={patientInfo} />
			</div>
			<div className="d-flex">
				<div>
					<div className="bg-white rounded-3 shadow-sm p-3 mb-4">
						<h4 className="pls-label mb-3 d-flex align-items-center alert alert-danger">
							<RiFileList2Line size={22} style={{ verticalAlign: "middle", color: "#1976d2", marginRight: 6 }} />
							{alert?.statement}
						</h4>
						<table className={styles.table} >
							<thead className="bg-light">
								<tr>
									<th>Field</th>
									<th>Original Value</th>
									<th>Current Value</th>
								</tr>
							</thead>
							<tbody>
								{Array.isArray(recordValues) && recordValues.length > 0 ? (
									recordValues.map((item, index) => (
										<tr key={index} className='text-sm'>
											<td>{item.field}</td>
											<td>{item.originalvalue}</td>
											<td>{item.value}</td>
										</tr>
									))
								) : (
									<tr>
										<td colSpan={4} className="text-center text-muted">No record values found for this critical value event.</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>+
			</div>

		</div>
	)
}
