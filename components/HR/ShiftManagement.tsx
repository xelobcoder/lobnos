"use client"

import { useState } from "react"
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Form, Alert } from "react-bootstrap"

export default function ShiftManagement() {
	const [showShiftModal, setShowShiftModal] = useState(false)
	const [loading, setLoading] = useState(false)
	const [alert, setAlert] = useState({ show: false, message: "", variant: "success" })
	const [shiftForm, setShiftForm] = useState({
		name: "",
		startTime: "",
		endTime: "",
		department: "",
	})

	const shifts = [
		{
			id: "SH001",
			name: "Day Shift",
			startTime: "08:00",
			endTime: "16:00",
			employees: 45,
			department: "Quality Control",
		},
		{
			id: "SH002",
			name: "Evening Shift",
			startTime: "16:00",
			endTime: "00:00",
			employees: 25,
			department: "Quality Control",
		},
		{
			id: "SH003",
			name: "Night Shift",
			startTime: "00:00",
			endTime: "08:00",
			employees: 15,
			department: "Quality Control",
		},
	]

	const shiftAssignments = [
		{
			employeeId: "EMP001",
			name: "John Smith",
			shift: "Day Shift",
			date: "2024-01-15",
			status: "Assigned",
		},
		{
			employeeId: "EMP002",
			name: "Sarah Johnson",
			shift: "Evening Shift",
			date: "2024-01-15",
			status: "Swap Requested",
		},
	]

	const handleCreateShift = async () => {
		setLoading(true)
		try {
			const response = await fetch("/api/shifts", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(shiftForm),
			})

			if (response.ok) {
				setAlert({ show: true, message: "Shift created successfully!", variant: "success" })
				setShowShiftModal(false)
				setShiftForm({ name: "", startTime: "", endTime: "", department: "" })
			}
		} catch (error) {
			setAlert({ show: true, message: "Error creating shift", variant: "danger" })
		} finally {
			setLoading(false)
		}
	}

	const handleApproveSwap = async (employeeId: string) => {
		setLoading(true)
		try {
			const response = await fetch("/api/shifts/swap", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ employeeId, action: "approve" }),
			})

			if (response.ok) {
				setAlert({ show: true, message: "Shift swap approved!", variant: "success" })
			}
		} catch (error) {
			setAlert({ show: true, message: "Error approving swap", variant: "danger" })
		} finally {
			setLoading(false)
		}
	}

	return (
		<Container fluid>
			<Row className="mb-4">
				<Col>
					<div className="d-flex justify-content-between align-items-center">
						<div>
							<h2 className="mb-0">Shift Management</h2>
							<p className="text-muted">Manage employee shifts and schedules</p>
						</div>
						<Button variant="primary" onClick={() => setShowShiftModal(true)}>
							Create Shift
						</Button>
					</div>
				</Col>
			</Row>

			{alert.show && (
				<Row className="mb-3">
					<Col>
						<Alert variant={alert.variant} onClose={() => setAlert({ ...alert, show: false })} dismissible>
							{alert.message}
						</Alert>
					</Col>
				</Row>
			)}

			<Row className="mb-4">
				<Col md={4}>
					<Card className="text-center">
						<Card.Body>
							<h4 className="text-primary">85</h4>
							<p className="mb-0">Total Employees</p>
							<small className="text-muted">Across all shifts</small>
						</Card.Body>
					</Card>
				</Col>
				<Col md={4}>
					<Card className="text-center">
						<Card.Body>
							<h4 className="text-success">3</h4>
							<p className="mb-0">Active Shifts</p>
							<small className="text-muted">24/7 coverage</small>
						</Card.Body>
					</Card>
				</Col>
				<Col md={4}>
					<Card className="text-center">
						<Card.Body>
							<h4 className="text-warning">5</h4>
							<p className="mb-0">Swap Requests</p>
							<small className="text-muted">Pending approval</small>
						</Card.Body>
					</Card>
				</Col>
			</Row>

			<Row className="mb-4">
				<Col>
					<Card>
						<Card.Header>
							<h5 className="mb-0">Shift Overview</h5>
						</Card.Header>
						<Card.Body>
							<Table responsive hover>
								<thead>
									<tr>
										<th>Shift ID</th>
										<th>Name</th>
										<th>Time</th>
										<th>Department</th>
										<th>Employees</th>
										<th>Actions</th>
									</tr>
								</thead>
								<tbody>
									{shifts.map((shift) => (
										<tr key={shift.id}>
											<td>
												<strong>{shift.id}</strong>
											</td>
											<td>{shift.name}</td>
											<td>
												{shift.startTime} - {shift.endTime}
											</td>
											<td>{shift.department}</td>
											<td>
												<Badge bg="info">{shift.employees} assigned</Badge>
											</td>
											<td>
												<Button variant="outline-primary" size="sm" className="me-1">
													View
												</Button>
												<Button variant="outline-secondary" size="sm">
													Edit
												</Button>
											</td>
										</tr>
									))}
								</tbody>
							</Table>
						</Card.Body>
					</Card>
				</Col>
			</Row>

			<Row>
				<Col>
					<Card>
						<Card.Header>
							<h5 className="mb-0">Todays Shift Assignments</h5>
						</Card.Header>
						<Card.Body>
							<Table responsive hover>
								<thead>
									<tr>
										<th>Employee ID</th>
										<th>Name</th>
										<th>Assigned Shift</th>
										<th>Date</th>
										<th>Status</th>
										<th>Actions</th>
									</tr>
								</thead>
								<tbody>
									{shiftAssignments.map((assignment, index) => (
										<tr key={index}>
											<td>
												<strong>{assignment.employeeId}</strong>
											</td>
											<td>{assignment.name}</td>
											<td>{assignment.shift}</td>
											<td>{assignment.date}</td>
											<td>
												<Badge bg={assignment.status === "Assigned" ? "success" : "warning"}>{assignment.status}</Badge>
											</td>
											<td>
												<Button variant="outline-primary" size="sm" className="me-1">
													Modify
												</Button>
												{assignment.status === "Swap Requested" && (
													<Button
														variant="outline-success"
														size="sm"
														onClick={() => handleApproveSwap(assignment.employeeId)}
														disabled={loading}
													>
														{loading ? "Approving..." : "Approve"}
													</Button>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</Table>
						</Card.Body>
					</Card>
				</Col>
			</Row>

			<Modal show={showShiftModal} onHide={() => setShowShiftModal(false)}>
				<Modal.Header closeButton>
					<Modal.Title>Create New Shift</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form>
						<Form.Group className="mb-3">
							<Form.Label>Shift Name</Form.Label>
							<Form.Control
								type="text"
								placeholder="Enter shift name"
								value={shiftForm.name}
								onChange={(e) => setShiftForm({ ...shiftForm, name: e.target.value })}
							/>
						</Form.Group>
						<Row>
							<Col md={6}>
								<Form.Group className="mb-3">
									<Form.Label>Start Time</Form.Label>
									<Form.Control type="time" />
								</Form.Group>
							</Col>
							<Col md={6}>
								<Form.Group className="mb-3">
									<Form.Label>End Time</Form.Label>
									<Form.Control type="time" />
								</Form.Group>
							</Col>
						</Row>
						<Form.Group className="mb-3">
							<Form.Label>Department</Form.Label>
							<Form.Select>
								<option>Select Department</option>
								<option>Quality Control</option>
								<option>Microbiology</option>
								<option>Administration</option>
							</Form.Select>
						</Form.Group>
					</Form>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={() => setShowShiftModal(false)}>
						Cancel
					</Button>
					<Button variant="primary" onClick={handleCreateShift} disabled={loading}>
						{loading ? "Creating..." : "Create Shift"}
					</Button>
				</Modal.Footer>
			</Modal>
		</Container>
	)
}
