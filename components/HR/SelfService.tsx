"use client"

import { useState, useEffect, ChangeEvent, FormEvent } from "react"
import { Container, Row, Col, Card, Button, Form, Table, Badge, Nav, Alert, Spinner, Modal } from "react-bootstrap"

type AlertState = { show: boolean; message: string; variant: "success" | "danger" | "info" | string }
type EmployeeData = {
	employeeId: string
	name: string
	department?: string
	role?: string
	email?: string
	phone?: string
	address?: string
	[key: string]: any
}
type Payslip = {
	id: string
	month: string
	basicSalary: number
	allowances: number
	deductions: number
	netSalary: number
	status: string
}
type LeaveForm = {
	type: string
	startDate: string
	endDate: string
	reason: string
}

export default function SelfService() {
	const [activeTab, setActiveTab] = useState<string>("profile")
	const [loading, setLoading] = useState<boolean>(false)
	const [alert, setAlert] = useState<AlertState>({ show: false, message: "", variant: "success" })
	const [employeeData, setEmployeeData] = useState<EmployeeData>({ employeeId: "EMP001", name: "John Smith" })
	const [payslips, setPayslips] = useState<Payslip[]>([])
	const [editMode, setEditMode] = useState<boolean>(false)
	const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false)
	const [showTrainingModal, setShowTrainingModal] = useState<boolean>(false)
	const [leaveForm, setLeaveForm] = useState<LeaveForm>({
		type: "",
		startDate: "",
		endDate: "",
		reason: "",
	})

	// Current user
	const currentUser = {
		employeeId: "EMP001",
		name: "John Smith",
	}

	const leaveBalance = {
		vacation: { total: 20, used: 8, remaining: 12 },
		sick: { total: 10, used: 3, remaining: 7 },
		personal: { total: 5, used: 1, remaining: 4 },
	}

	const trainingPrograms = [
		{
			id: 1,
			name: "Lab Safety Refresher",
			description: "Annual mandatory safety training",
			duration: "4 hours",
			deadline: "2024-03-15",
			type: "Mandatory",
			status: "Available",
		},
		{
			id: 2,
			name: "Advanced Quality Control",
			description: "Professional development course",
			duration: "8 hours",
			deadline: "2024-04-30",
			type: "Optional",
			status: "Available",
		},
		{
			id: 3,
			name: "ISO 15189 Update",
			description: "Latest standards and compliance",
			duration: "6 hours",
			deadline: "2024-05-15",
			type: "Mandatory",
			status: "Enrolled",
		},
	]

	useEffect(() => {
		fetchEmployeeProfile()
		fetchPayslips()
	}, [])

	const fetchEmployeeProfile = async () => {
		setLoading(true)
		try {
			const response = await fetch(`/api/employee/profile?employeeId=${currentUser.employeeId}`)
			const result = await response.json()
			if (result.success) {
				setEmployeeData(result.data as EmployeeData)
			} else {
				showAlert("Failed to fetch profile", "danger")
			}
		} catch (error) {
			showAlert("Failed to fetch profile", "danger")
		}
		setLoading(false)
	}

	const fetchPayslips = async () => {
		try {
			const response = await fetch(`/api/payslips?employeeId=${currentUser.employeeId}`)
			const result = await response.json()
			if (result.success) {
				setPayslips(result.data as Payslip[])
			}
		} catch (error) {
			showAlert("Failed to fetch payslips", "danger")
		}
	}

	const handleProfileUpdate = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setLoading(true)

		try {
			const response = await fetch("/api/employee/profile", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...employeeData,
				}),
			})

			const result = await response.json()
			if (result.success) {
				showAlert(result.message, "success")
				setEditMode(false)
			} else {
				showAlert(result.message, "danger")
			}
		} catch (error) {
			showAlert("Failed to update profile", "danger")
		}
		setLoading(false)
	}

	const handleLeaveSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setLoading(true)

		try {
			const response = await fetch("/api/leave", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					employeeId: currentUser.employeeId,
					employeeName: currentUser.name,
					...leaveForm,
				}),
			})

			const result = await response.json()
			if (result.success) {
				showAlert(result.message, "success")
				setShowLeaveModal(false)
				setLeaveForm({ type: "", startDate: "", endDate: "", reason: "" })
			} else {
				showAlert(result.message, "danger")
			}
		} catch (error) {
			showAlert("Failed to submit leave request", "danger")
		}
		setLoading(false)
	}

	const handleDownloadPayslip = async (payslipId: string) => {
		setLoading(true)
		try {
			const response = await fetch("/api/payslips", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					employeeId: currentUser.employeeId,
					payslipId: payslipId,
				}),
			})

			const result = await response.json()
			if (result.success) {
				showAlert(result.message, "success")
				// In a real app, you would trigger the actual download here
			} else {
				showAlert(result.message, "danger")
			}
		} catch (error) {
			showAlert("Failed to download payslip", "danger")
		}
		setLoading(false)
	}

	const handleTrainingEnroll = (trainingId: number) => {
		// Simulate enrollment
		showAlert(`Successfully enrolled in training program`, "success")
	}

	const showAlert = (message: string, variant: string) => {
		setAlert({ show: true, message, variant })
		setTimeout(() => setAlert({ show: false, message: "", variant: "success" }), 5000)
	}

	return (
		<Container fluid>
		{alert.show && (
			<Alert
				variant={alert.variant}
				dismissible
				onClose={() => setAlert({ show: false, message: "", variant: "success" })}
			>
				{alert.message}
			</Alert>
		)}

		<Row className="mb-4">
			<Col>
				<h2 className="mb-0">Employee Self-Service Portal</h2>
				<p className="text-muted">Manage your personal information and requests</p>
			</Col>
		</Row>

		<Row className="mb-4">
			<Col>
				<Card>
					<Card.Header>
						<Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k || "profile")}>
							<Nav.Item>
								<Nav.Link eventKey="profile">Personal Information</Nav.Link>
							</Nav.Item>
							<Nav.Item>
								<Nav.Link eventKey="leave">Leave Management</Nav.Link>
							</Nav.Item>
							<Nav.Item>
								<Nav.Link eventKey="payslips">Payslips</Nav.Link>
							</Nav.Item>
							<Nav.Item>
								<Nav.Link eventKey="training">Training</Nav.Link>
							</Nav.Item>
						</Nav>
					</Card.Header>
					<Card.Body>
						{activeTab === "profile" && (
							<div>
								<div className="d-flex justify-content-between align-items-center mb-3">
									<h5 className="mb-0">Personal Details</h5>
									<Button variant={editMode ? "secondary" : "outline-primary"} onClick={() => setEditMode(!editMode)}>
										{editMode ? "Cancel" : "Edit Profile"}
									</Button>
								</div>
								<Form onSubmit={handleProfileUpdate}>
									<Row>
										<Col md={6}>
											<Form.Group className="mb-3">
												<Form.Label>Full Name</Form.Label>
												<Form.Control
													type="text"
													value={employeeData.name || ""}
													onChange={(e: ChangeEvent<HTMLInputElement>) => setEmployeeData({ ...employeeData, name: e.target.value })}
													disabled={!editMode}
												/>
											</Form.Group>
										</Col>
										<Col md={6}>
											<Form.Group className="mb-3">
												<Form.Label>Employee ID</Form.Label>
												<Form.Control type="text" value={employeeData.employeeId || ""} disabled />
											</Form.Group>
										</Col>
									</Row>
									<Row>
										<Col md={6}>
											<Form.Group className="mb-3">
												<Form.Label>Department</Form.Label>
												<Form.Control type="text" value={employeeData.department || ""} disabled />
											</Form.Group>
										</Col>
										<Col md={6}>
											<Form.Group className="mb-3">
												<Form.Label>Role</Form.Label>
												<Form.Control type="text" value={employeeData.role || ""} disabled />
											</Form.Group>
										</Col>
									</Row>
									<Row>
										<Col md={6}>
											<Form.Group className="mb-3">
												<Form.Label>Email</Form.Label>
												<Form.Control
													type="email"
													value={employeeData.email || ""}
													onChange={(e: ChangeEvent<HTMLInputElement>) => setEmployeeData({ ...employeeData, email: e.target.value })}
													disabled={!editMode}
												/>
											</Form.Group>
										</Col>
										<Col md={6}>
											<Form.Group className="mb-3">
												<Form.Label>Phone</Form.Label>
												<Form.Control
													type="tel"
													value={employeeData.phone || ""}
													onChange={(e: ChangeEvent<HTMLInputElement>) => setEmployeeData({ ...employeeData, phone: e.target.value })}
													disabled={!editMode}
												/>
											</Form.Group>
										</Col>
									</Row>
									<Form.Group className="mb-3">
										<Form.Label>Address</Form.Label>
										<Form.Control
											type="text"
											value={employeeData.address || ""}
											onChange={(e: ChangeEvent<HTMLInputElement>) => setEmployeeData({ ...employeeData, address: e.target.value })}
											disabled={!editMode}
										/>
									</Form.Group>
									{editMode && (
										<Button variant="primary" type="submit" disabled={loading}>
											{loading ? <Spinner size="sm" /> : "Update Information"}
										</Button>
									)}
								</Form>
							</div>
						)}

						{activeTab === "leave" && (
							<Row>
								<Col md={6}>
									<Card className="mb-3">
										<Card.Header>
											<h5 className="mb-0">Leave Balance</h5>
										</Card.Header>
										<Card.Body>
											{Object.entries(leaveBalance).map(([type, balance]) => (
												<div key={type} className="mb-3">
													<div className="d-flex justify-content-between">
														<span className="text-capitalize">{type} Leave</span>
														<span>
															{balance.remaining}/{balance.total} days
														</span>
													</div>
													<div className="progress" style={{ height: "6px" }}>
														<div
															className="progress-bar bg-success"
															style={{ width: `${(balance.remaining / balance.total) * 100}%` }}
														></div>
													</div>
												</div>
											))}
										</Card.Body>
									</Card>
								</Col>
								<Col md={6}>
									<Card>
										<Card.Header className="d-flex justify-content-between align-items-center">
											<h5 className="mb-0">Quick Actions</h5>
										</Card.Header>
										<Card.Body>
											<div className="d-grid gap-2">
												<Button variant="primary" onClick={() => setShowLeaveModal(true)}>
													Apply for Leave
												</Button>
												<Button variant="outline-info" onClick={() => setShowTrainingModal(true)}>
													Browse Training Programs
												</Button>
												<Button variant="outline-success">View Leave History</Button>
											</div>
										</Card.Body>
									</Card>
								</Col>
							</Row>
						)}

						{activeTab === "payslips" && (
							<Table responsive hover>
								<thead>
									<tr>
										<th>Month</th>
										<th>Basic Salary</th>
										<th>Allowances</th>
										<th>Deductions</th>
										<th>Net Salary</th>
										<th>Status</th>
										<th>Actions</th>
									</tr>
								</thead>
								<tbody>
									{payslips.map((payslip) => (
										<tr key={payslip.id}>
											<td>{payslip.month}</td>
											<td>${payslip.basicSalary?.toLocaleString()}</td>
											<td>${payslip.allowances?.toLocaleString()}</td>
											<td>${payslip.deductions?.toLocaleString()}</td>
											<td>
												<strong>${payslip.netSalary?.toLocaleString()}</strong>
											</td>
											<td>
												<Badge bg="success">{payslip.status}</Badge>
											</td>
											<td>
												<Button
													variant="outline-primary"
													size="sm"
													onClick={() => handleDownloadPayslip(payslip.id)}
													disabled={loading}
												>
													{loading ? <Spinner size="sm" /> : "Download PDF"}
												</Button>
											</td>
										</tr>
									))}
								</tbody>
							</Table>
						)}

						{activeTab === "training" && (
							<div>
								<div className="d-flex justify-content-between align-items-center mb-3">
									<h5 className="mb-0">Available Training Programs</h5>
									<Button variant="primary" onClick={() => setShowTrainingModal(true)}>
										Browse All Programs
									</Button>
								</div>
								{trainingPrograms.map((training) => (
									<Card key={training.id} className="mb-3">
										<Card.Body>
											<Row>
												<Col md={8}>
													<h6>{training.name}</h6>
													<p className="text-muted mb-2">{training.description}</p>
													<div className="d-flex gap-3">
														<small>
															<strong>Duration:</strong> {training.duration}
														</small>
														<small>
															<strong>Deadline:</strong> {training.deadline}
														</small>
														<Badge bg={training.type === "Mandatory" ? "warning" : "info"}>{training.type}</Badge>
													</div>
												</Col>
												<Col md={4} className="text-end">
													<div className="mb-2">
														<Badge bg={training.status === "Available" ? "success" : "primary"}>
															{training.status}
														</Badge>
													</div>
													<Button
														variant={training.status === "Available" ? "primary" : "outline-secondary"}
														size="sm"
														disabled={training.status === "Enrolled"}
														onClick={() => handleTrainingEnroll(training.id)}
													>
														{training.status === "Available" ? "Enroll Now" : "Enrolled"}
													</Button>
												</Col>
											</Row>
										</Card.Body>
									</Card>
								))}
							</div>
						)}
					</Card.Body>
				</Card>
			</Col>
		</Row>

		{/* Leave Application Modal */}
		<Modal show={showLeaveModal} onHide={() => setShowLeaveModal(false)}>
			<Modal.Header closeButton>
				<Modal.Title>Apply for Leave</Modal.Title>
			</Modal.Header>
			<Form onSubmit={handleLeaveSubmit}>
				<Modal.Body>
					<Form.Group className="mb-3">
						<Form.Label>Leave Type</Form.Label>
						<Form.Select
							value={leaveForm.type}
							onChange={(e: ChangeEvent<HTMLSelectElement>) => setLeaveForm({ ...leaveForm, type: e.target.value })}
							required
						>
							<option value="">Select leave type</option>
							<option value="Vacation">Vacation</option>
							<option value="Sick Leave">Sick Leave</option>
							<option value="Personal Leave">Personal Leave</option>
						</Form.Select>
					</Form.Group>
					<Row>
						<Col md={6}>
							<Form.Group className="mb-3">
								<Form.Label>Start Date</Form.Label>
								<Form.Control
									type="date"
									value={leaveForm.startDate}
									onChange={(e: ChangeEvent<HTMLInputElement>) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
									required
								/>
							</Form.Group>
						</Col>
						<Col md={6}>
							<Form.Group className="mb-3">
								<Form.Label>End Date</Form.Label>
								<Form.Control
									type="date"
									value={leaveForm.endDate}
									onChange={(e: ChangeEvent<HTMLInputElement>) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
									required
								/>
							</Form.Group>
						</Col>
					</Row>
					<Form.Group className="mb-3">
						<Form.Label>Reason</Form.Label>
						<Form.Control
							as="textarea"
							rows={3}
							value={leaveForm.reason}
							onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
							required
						/>
					</Form.Group>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={() => setShowLeaveModal(false)}>
						Cancel
					</Button>
					<Button variant="primary" type="submit" disabled={loading}>
						{loading ? <Spinner size="sm" /> : "Submit Request"}
					</Button>
				</Modal.Footer>
			</Form>
		</Modal>

		{/* Training Programs Modal */}
		<Modal show={showTrainingModal} onHide={() => setShowTrainingModal(false)} size="lg">
			<Modal.Header closeButton>
				<Modal.Title>Training Programs</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Row>
					{trainingPrograms.map((training) => (
						<Col md={6} key={training.id} className="mb-3">
							<Card>
								<Card.Body>
									<h6>{training.name}</h6>
									<p className="text-muted small">{training.description}</p>
									<div className="d-flex justify-content-between align-items-center">
										<div>
											<Badge bg={training.type === "Mandatory" ? "warning" : "info"} className="me-2">
												{training.type}
											</Badge>
											<small>Duration: {training.duration}</small>
										</div>
										<Button
											variant="primary"
											size="sm"
											disabled={training.status === "Enrolled"}
											onClick={() => handleTrainingEnroll(training.id)}
										>
											{training.status === "Available" ? "Enroll" : "Enrolled"}
										</Button>
									</div>
								</Card.Body>
							</Card>
						</Col>
					))}
				</Row>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={() => setShowTrainingModal(false)}>
					Close
				</Button>
			</Modal.Footer>
		</Modal>
	</Container>
	)
}
