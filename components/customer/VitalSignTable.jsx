import React from 'react';
import { RiEditLine, RiEyeLine } from '@remixicon/react';
import { getStatusClass, NORMAL_RANGES } from './dataActions/vitalsigns';
import { useRouter } from 'next/navigation';
import style from '../../styles/SmsTemplateList.module.css'

export default function VitalSignTable({ groupedVitalSigns, openModal }) {
	const router = useRouter();

	const getStatusIndicator = (value, range, type = 'normal') => {
		if (!range || !value) return 'table-success';

		const numValue = parseFloat(value);
		if (isNaN(numValue)) return 'table-success';

		if (type === 'bloodPressure') {
			const [systolic, diastolic] = value.split('/').map(Number);
			const systolicNormal = systolic >= range.systolic.min && systolic <= range.systolic.max;
			const diastolicNormal = diastolic >= range.diastolic.min && diastolic <= range.diastolic.max;
			if (systolicNormal && diastolicNormal) return 'table-success';
			if (systolic > 180 || diastolic > 120) return 'table-danger';
			return 'table-warning';
		}

		if (numValue >= range.min && numValue <= range.max) return 'table-success';
		if (type === 'spo2' && numValue < 90) return 'table-danger';
		if (type === 'temperature' && (numValue < 35 || numValue > 40)) return 'table-danger';
		return 'table-warning';
	};

	return (
		<div className={style.tablewrapper}>
			{Object.keys(groupedVitalSigns).map((date, index) => (
				<div key={date}>
					{index > 0 && <hr style={{ border: '1px solid black', margin: '30px 0', borderRadius: '1px' }} />}
					<div style={{
						background: '#e2e8f0',
						color: '#1e293b',
						padding: '14px 18px',
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						marginBottom: '10px',
						borderRadius: '8px',
						border: '1px solid #cbd5e1',
						boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
					}}>
						<h5 style={{ margin: 0, fontSize: '1.1rem' }}>
							📅 {date}
						</h5>
						<button
							style={{
								background: '#00224fcf',
								border: '1px solid #00224fcf',
								color: 'white',
								padding: '6px 12px',
								borderRadius: '4px',
								fontSize: '0.875rem',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								gap: '6px'
							}}
							onClick={() => openModal(date, groupedVitalSigns[date])}
						>
							<RiEyeLine size={16} />
							View Chart
						</button>
					</div>
					<table className={style.table}>
						<thead>
							<tr>
								<th style={{ width: '60px' }}>#</th>
								<th style={{ width: '100px' }}>Time</th>
								<th style={{ width: '140px' }}>Blood Pressure</th>
								<th style={{ width: '80px' }}>Pulse</th>
								<th style={{ width: '80px' }}>SpO2</th>
								<th style={{ width: '100px' }}>Respiration</th>
								<th style={{ width: '100px' }}>Temperature</th>
							</tr>
						</thead>
						<tbody>
							{groupedVitalSigns[date].map((vitalSign, index) => {
								const bpStatus = getStatusIndicator(vitalSign.bp, NORMAL_RANGES.bloodPressure, 'bloodPressure');
								const pulseStatus = getStatusIndicator(vitalSign.pulse, NORMAL_RANGES.pulse);
								const spo2Status = getStatusIndicator(vitalSign.spo2, NORMAL_RANGES.spo2, 'spo2');
								const tempStatus = getStatusIndicator(vitalSign.temperature, NORMAL_RANGES.temperature, 'temperature');

								return (
									<tr key={vitalSign.vitalsignid}>
										<td>
											<span style={{
												background: '#00224fcf',
												color: 'white',
												fontWeight: '600',
												padding: '4px 8px',
												borderRadius: '50%',
												display: 'inline-block',
												minWidth: '28px',
												textAlign: 'center',
												border: '2px solid #2165e3'
											}}>
												{index + 1}
											</span>
										</td>
										<td style={{ fontFamily: 'Monaco, Menlo, monospace', fontWeight: '500' }}>
											{vitalSign.time}
										</td>
										<td className={bpStatus}>
											{vitalSign.bp} mmHg
										</td>
										<td className={pulseStatus}>
											{vitalSign.pulse} bpm
										</td>
										<td className={spo2Status}>
											{vitalSign.spo2}%
										</td>
										<td>
											<span style={{ fontWeight: '500' }}>{vitalSign.respiration} breaths/min</span>
										</td>
										<td className={tempStatus}>
											{vitalSign.temperature}°C
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
