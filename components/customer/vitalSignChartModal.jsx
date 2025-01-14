import React from 'react';
import { Modal } from 'react-bootstrap';
import VitalSignLineChart from './VitalSignLineChart';

const VitalSignChartModal = ({ show, onHide, vitalSigns, date, generateChartData ,size}) => {
	return (
		<Modal show={show} onHide={onHide} size={size} >
			<Modal.Header closeButton className=' bg-body-secondary fw-bold br-0'>
				<Modal.Title>Vital Sign Charts for {date}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className="row">
					<div className="col-12 col-md-6 mb-4">
						<VitalSignLineChart
							data={generateChartData(vitalSigns, 'temperature')}
							title={`Temperature Trends for ${date}`}
							dataKey="temperature"
							strokeColor="#8884d8"
						/>
					</div>
					<div className="col-12 col-md-6 mb-4">
						<VitalSignLineChart
							data={generateChartData(vitalSigns, 'pulse')}
							title={`Pulse Trends for ${date}`}
							dataKey="pulse"
							strokeColor="#82ca9d"
						/>
					</div>
					<div className="col-12 col-md-6 mb-4">
						<VitalSignLineChart
							data={generateChartData(vitalSigns, 'respiration')}
							title={`Respiration Trends for ${date}`}
							dataKey="respiration"
							strokeColor="#ff7300"
						/>
					</div>
					<div className="col-12 col-md-6 mb-4">
						<VitalSignLineChart
							data={generateChartData(vitalSigns, 'spo2')}
							title={`SpO2 Trends for ${date}`}
							dataKey="spo2"
							strokeColor="#387908"
						/>
					</div>
					<div className="col-12 col-md-6 mb-4">
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
