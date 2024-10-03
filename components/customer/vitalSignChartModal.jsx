import React from 'react';
import { Modal } from 'react-bootstrap';
import VitalSignLineChart from './VitalSignLineChart';


const VitalSignChartModal = ({ show, onHide, vitalSigns, date, generateChartData }) => {
	return (
		<Modal show={show} onHide={onHide} size="fullscreen" centered>
			<Modal.Header closeButton>
				<Modal.Title>Vital Sign Charts for {date}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className="grid-50">
					<div>
						<VitalSignLineChart
							data={generateChartData(vitalSigns, 'temperature')}
							title={`Temperature Trends for ${date}`}
							dataKey="temperature"
							strokeColor="#8884d8"
						/>
					</div>
					<div>
						<VitalSignLineChart
							data={generateChartData(vitalSigns, 'pulse')}
							title={`Pulse Trends for ${date}`}
							dataKey="pulse"
							strokeColor="#82ca9d"
						/>
					</div>
					<div>
						<VitalSignLineChart
							data={generateChartData(vitalSigns, 'respiration')}
							title={`Respiration Trends for ${date}`}
							dataKey="respiration"
							strokeColor="#ff7300"
						/>
					</div>
					<div>
						<VitalSignLineChart
							data={generateChartData(vitalSigns, 'spo2')}
							title={`SpO2 Trends for ${date}`}
							dataKey="spo2"
							strokeColor="#387908"
						/>
					</div>
					<div>
						<VitalSignLineChart
							data={generateChartData(vitalSigns, 'bp')}
							title={`Blood Pressure Trends for ${date}`}
							dataKey="bp"
							strokeColor="#8884d8"
						/>
					</div>
				</div>
			</Modal.Body>
		</Modal>
	);
};

export default VitalSignChartModal;
