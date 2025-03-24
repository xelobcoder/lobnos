import React from 'react';
import { Edit } from '@mui/icons-material';
import { getStatusClass, NORMAL_RANGES } from './dataActions/vitalsigns';
import { useRouter } from 'next/navigation';

export default function VitalSignTable({ groupedVitalSigns, openModal }) {
	const router = useRouter();

	return (
		<div className="table-responsive">
			{Object.keys(groupedVitalSigns).map(date => (
				<div key={date}>
					<div className='d-flex justify-content-between'>
						<h5 className="my-3">Date: {date}</h5>
						<button className="btn btn-sm btn-light fw-bold" onClick={() => openModal(date, groupedVitalSigns[date])}>
							View Chart
						</button>
					</div>
					<table className="table table-bordered billing-cart-table ttable">
						<thead>
							<tr>
								<th>SR NO</th>
								<th>Time</th>
								<th>Blood Pressure</th>
								<th>Pulse</th>
								<th>SpO2</th>
								<th>Respiration</th>
								<th>Temperature</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
							{groupedVitalSigns[date].map((vitalSign, index) => {
								const [systolic, diastolic] = vitalSign.bp.split('/').map(Number);


								return (
									<tr key={vitalSign.vitalsignid}>
										<td>{index + 1}</td>
										<td>{vitalSign.time}</td>
										<td className={`${getStatusClass(systolic, NORMAL_RANGES.bloodPressure.systolic)} ${getStatusClass(diastolic, NORMAL_RANGES.bloodPressure.diastolic)}`}>
											{vitalSign.bp}
										</td>
										<td className={getStatusClass(vitalSign.pulse, NORMAL_RANGES.pulse)}>
											{vitalSign.pulse}
										</td>
										<td className={getStatusClass(vitalSign.spo2, NORMAL_RANGES.spo2)}>
											{vitalSign.spo2}
										</td>
										<td>{vitalSign.respiration}</td>
										<td className={getStatusClass(vitalSign.temperature, NORMAL_RANGES.temperature)}>
											{vitalSign.temperature}
										</td>
										<td>
											<button onClick={(ev) => { router.push(`/customers/recordVitalSigns?iNewChart=1&&patientid=2024972&&edit=1&&vsKeyId=${vitalSign.vitalsignid}`)}} className='btn p-0 bg-info-subtle'>
												<Edit />
											</button>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			))}
		</div>
	);
}
