import React from 'react';
import VitalSignLineChart from './VitalSignLineChart';

export default function VitalSignCharts({ groupedVitalSigns, date, generateChartData }) {
	return (
		<div className='grid-50'>
			<div>
				<VitalSignLineChart
					data={generateChartData(groupedVitalSigns[date], 'temperature')}
					title={`Temperature Trends for ${date}`}
					dataKey="temperature"
					strokeColor="#8884d8"
				/>
			</div>
			<div>
				<VitalSignLineChart
					data={generateChartData(groupedVitalSigns[date], 'pulse')}
					title={`Pulse Trends for ${date}`}
					dataKey="pulse"
					strokeColor="#82ca9d"
				/>
			</div>
			<div>
				<VitalSignLineChart
					data={generateChartData(groupedVitalSigns[date], 'respiration')}
					title={`Respiration Trends for ${date}`}
					dataKey="respiration"
					strokeColor="#ff7300"
				/>
			</div>
			<div>
				<VitalSignLineChart
					data={generateChartData(groupedVitalSigns[date], 'spo2')}
					title={`SpO2 Trends for ${date}`}
					dataKey="spo2"
					strokeColor="#387908"
				/>
			</div>
			<div>
				<VitalSignLineChart
					data={generateChartData(groupedVitalSigns[date], 'bp')}
					title={`Blood Pressure Trends for ${date}`}
					dataKey="bp"
					strokeColor="#8884d8"
				/>
			</div>
		</div>
	);
}
