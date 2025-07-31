"use client"
import React, { useEffect, useState } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { customFetch } from '../../../Auth/customFetch';
import {
	RiDeviceLine,
	RiTestTubeLine,
	RiErrorWarningLine,
	RiTimerFlashLine,
	RiCheckboxCircleLine,
	RiErrorWarningFill,
	RiAlertLine
} from '@remixicon/react';



export function QCDashboard() {
	const [dashboardData, setDashboardData] = useState({
		totalDevices: 0,
		activeDevices: 0,
		devicesInMaintenance: 0,
		qcTestsToday: 0,
		outOfRange: 0,
		pendingReviews: 0,
		critical: 0,
		warning: 0,
		unmonitored: 0,
	});
	const [dashboardLoading, setDashboardLoading] = useState(false);
	const [dashboardError, setDashboardError] = useState<string | null>(null);

	const [recentReadings, setRecentReadings] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Fetch dashboard metrics
		const fetchDashboardData = async () => {
			setDashboardLoading(true);
			setDashboardError(null);
			try {
				const data = await customFetch('qc/dashboard');
				if (data && typeof data === 'object') {
					setDashboardData({
						totalDevices: data.totalDevices ?? 0,
						activeDevices: data.activeDevices ?? 0,
						devicesInMaintenance: data.devicesInMaintenance ?? 0,
						qcTestsToday: data.qcTestsToday ?? 0,
						outOfRange: (data.critical ?? 0) + (data.warning ?? 0),
						pendingReviews: data.pendingReviews ?? 0,
						critical: data.critical ?? 0,
						warning: data.warning ?? 0,
						unmonitored: data.unmonitored ?? 0,
					});
				} else {
					setDashboardError('No dashboard data returned from server.');
				}
			} catch (err) {
				setDashboardError('Failed to load dashboard metrics.');
				// eslint-disable-next-line no-console
				console.error('Error loading /api/v1/qc/dashboard:', err);
			} finally {
				setDashboardLoading(false);
			}
		};
		fetchDashboardData();
	}, []);

	useEffect(() => {
		const fetchRecentReadings = async () => {
			setLoading(true);
			setError(null);
			try {
				const data = await customFetch('qc/recent-readings');
				if (Array.isArray(data)) {
					setRecentReadings(data);
				} else {
					setRecentReadings([]);
					setError('No data returned from server.');
				}
			} catch (err) {
				setRecentReadings([]);
				setError('Failed to load recent QC readings.');
				// eslint-disable-next-line no-console
				console.error('Error loading qc/recent-readings:', err);
			} finally {
				setLoading(false);
			}
		};
		fetchRecentReadings();
	}, []);

	const [alerts, setAlerts] = useState<any[]>([]);
	const [alertsLoading, setAlertsLoading] = useState(false);
	const [alertsError, setAlertsError] = useState<string | null>(null);

	useEffect(() => {
		const fetchAlerts = async () => {
			setAlertsLoading(true);
			setAlertsError(null);
			try {
				const data = await customFetch('qc/recent-alert-readings');
				if (Array.isArray(data)) {
					setAlerts(data);
				} else {
					setAlerts([]);
					setAlertsError('No alert data returned from server.');
				}
			} catch (err) {
				setAlerts([]);
				setAlertsError('Failed to load alert readings.');
				// eslint-disable-next-line no-console
				console.error('Error loading qc/recent-alert-readings:', err);
			} finally {
				setAlertsLoading(false);
			}
		};
		fetchAlerts();
	}, []);

	return (
		<div>
			<Row className="g-4">
				<Col md={6} lg={3}>
					<Card>
						<Card.Body>
							<h6><RiDeviceLine size={20} className="me-2 text-primary" />Active Devices</h6>
							<h2>{dashboardLoading ? <span className="spinner-border spinner-border-sm" /> : dashboardData.activeDevices}</h2>
							<div className="small text-muted">
								Total: {dashboardData.totalDevices} <span className="ms-2">Maintenance: {dashboardData.devicesInMaintenance}</span>
							</div>
						</Card.Body>
					</Card>
				</Col>
				<Col md={6} lg={3}>
					<Card>
						<Card.Body>
							<h6><RiTestTubeLine size={20} className="me-2 text-success" />QC Tests Today</h6>
							<h2>{dashboardLoading ? <span className="spinner-border spinner-border-sm" /> : dashboardData.qcTestsToday}</h2>
						</Card.Body>
					</Card>
				</Col>
				<Col md={6} lg={3}>
					<Card>
						<Card.Body>
							<h6><RiErrorWarningLine size={20} className="me-2 text-danger" />Out of Range</h6>
							<h2>{dashboardLoading ? <span className="spinner-border spinner-border-sm" /> : dashboardData.outOfRange}</h2>
							<div className="small text-muted">
								<RiErrorWarningFill size={14} className="text-danger me-1" /> Critical: {dashboardData.critical}
								<RiAlertLine size={14} className="text-warning ms-3 me-1" /> Warning: {dashboardData.warning}
							</div>
						</Card.Body>
					</Card>
				</Col>
				<Col md={6} lg={3}>
					<Card>
						<Card.Body>
							<h6><RiTimerFlashLine size={20} className="me-2 text-warning" />Pending Reviews</h6>
							<h2>{dashboardLoading ? <span className="spinner-border spinner-border-sm" /> : dashboardData.pendingReviews}</h2>
						</Card.Body>
					</Card>
				</Col>
			</Row>
			{dashboardError && <div className="text-danger my-2">{dashboardError}</div>}

			<Row className="mt-4">
				<Col>
					<Card>
						<Card.Body>
							<h5>Recent QC Activities</h5>
							{loading ? (
								<div>Loading...</div>
							) : error ? (
								<div className="text-danger">{error}</div>
							) : (
								<table className="table table-sm">
									<thead>
										<tr>
											<th>Parameter</th>
											<th>Value</th>
											<th>Unit</th>
											<th>Status</th>
											<th>Control Material</th>
											<th>Created At</th>
										</tr>
									</thead>
									<tbody>
										{Array.isArray(recentReadings) && recentReadings.length > 0 && recentReadings.map((reading) => (
											<tr key={reading.id}>
												<td>{reading.parameter_name}</td>
												<td>{reading.value}</td>
												<td>{reading.parameter_unit}</td>
												<td>
													{reading.status === 'normal' && <RiCheckboxCircleLine size={18} className="text-success me-1" />}
													{reading.status === 'critical' && <RiErrorWarningFill size={18} className="text-danger me-1" />}
													{reading.status === 'warning' && <RiAlertLine size={18} className="text-warning me-1" />}
													{reading.status}
												</td>
												<td>{reading.control_material_name}</td>
												<td>{new Date(reading.createdAt).toLocaleString()}</td>
											</tr>
										))}
									</tbody>
								</table>
							)}
						</Card.Body>
					</Card>
				</Col>
				<Col >
					<Card>
						<Card.Body>
							<h5>Alerts</h5>
							{alertsLoading ? (
								<div>Loading...</div>
							) : alertsError ? (
								<div className="text-danger">{alertsError}</div>
							) : (
								<table className="table table-sm">
									<thead>
										<tr>
											<th>Parameter</th>
											<th>Value</th>
											<th>Unit</th>
											<th>Status</th>
											<th>Control Material</th>
											<th>Created At</th>
										</tr>
									</thead>
									<tbody>
										{alerts.map((alert) => (
											<tr key={alert.id}>
												<td>{alert.parameter_name}</td>
												<td>{alert.value}</td>
												<td>{alert.parameter_unit}</td>
												<td>
													{alert.status === 'normal' && <RiCheckboxCircleLine size={18} className="text-success me-1" />}
													{alert.status === 'critical' && <RiErrorWarningFill size={18} className="text-danger me-1" />}
													{alert.status === 'warning' && <RiAlertLine size={18} className="text-warning me-1" />}
													{alert.status}
												</td>
												<td>{alert.control_material_name}</td>
												<td>{new Date(alert.createdAt).toLocaleString()}</td>
											</tr>
										))}
									</tbody>
								</table>
							)}
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</div>
	);
}