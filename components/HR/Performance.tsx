"use client"

import { useState, useEffect } from "react"
import {
	Container,
	Row,
	Col,
	Card,
	Table,
	Button,
	Badge,
	ProgressBar,
	Modal,
	Form,
	Alert,
	Spinner,
} from "react-bootstrap"

interface PerformanceRecord {
	employeeId: string
	name: string
	department: string
	currentRating: number
	lastReview: string
	nextReview: string
	goals: number
	completedGoals: number
	status: string
	reviewType: string
}

interface AlertState {
	show: boolean
	message: string
	variant: "success" | "danger" | "info" | string
}

export default function Performance() {
	const [loading, setLoading] = useState(false)
	const [alert, setAlert] = useState<AlertState>({ show: false, message: "", variant: "success" })
	const [showReviewModal, setShowReviewModal] = useState(false)
	const [performanceData, setPerformanceData] = useState<PerformanceRecord[]>([])
	const [reviewForm, setReviewForm] = useState({
		employeeId: "",
		reviewType: "Annual",
		scheduledDate: "",
		reviewer: "",
		notes: "",
	})

	useEffect(() => {
		fetchPerformanceData()
	}, [])

	const fetchPerformanceData = async () => {
		setLoading(true)
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000))

			const mockData = [
				{
					employeeId: "EMP001",
					name: "John Smith",
					department: "Quality Control",
					currentRating: 4.2,
					lastReview: "2023-12-15",
					nextReview: "2024-06-15",
					goals: 5,
					completedGoals: 3,
					status: "On Track",
					reviewType: "Mid-Year",
				},
				{
					employeeId: "EMP002",
					name: "Sarah Johnson",
					department: "Microbiology",
					currentRating: 4.8,
					lastReview: "2023-11-20",
					nextReview: "2024-05-20",
					goals: 4,
					completedGoals: 4,
					status: "Excellent",
					reviewType: "Annual",
				},
				{
					employeeId: "EMP003",
					name: "Mike Davis",
					department: "Quality Control",
					currentRating: 3.8,
					lastReview: "2023-10-10",
					nextReview: "2024-04-10",
					goals: 6,
					completedGoals: 4,
					status: "Needs Improvement",
					reviewType: "Quarterly",
				},
				{
					employeeId: "EMP004",
					name: "Lisa Brown",
					department: "Chemistry",
					currentRating: 4.5,
					lastReview: "2023-12-01",
					nextReview: "2024-06-01",
					goals: 4,
					completedGoals: 3,
					status: "Good",
					reviewType: "Annual",
				},
			]

			setPerformanceData(mockData)
		} catch (error) {
			showAlert("Failed to fetch performance data", "danger")
		}
		setLoading(false)
	}

	const handleScheduleReview = async (e) => {
		e.preventDefault()
		setLoading(true)

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1500))

			// Update the employee's next review date
			const updatedData = performanceData.map((emp) =>
				emp.employeeId === reviewForm.employeeId
					? { ...emp, nextReview: reviewForm.scheduledDate, status: "Review Scheduled" }
					: emp,
			)

			setPerformanceData(updatedData)
			setShowReviewModal(false)
			setReviewForm({
				employeeId: "",
				reviewType: "Annual",
				scheduledDate: "",
				reviewer: "",
				notes: "",
			})

			showAlert("Performance review scheduled successfully!", "success")
		} catch (error) {
			showAlert("Failed to schedule review", "danger")
		}
		setLoading(false)
	}

	const handleQuickAction = async (employeeId: string, action: string) => {
		setLoading(true)
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 500))

			let message = ""
			let updatedData = [...performanceData]

			switch (action) {
				case "review":
					message = `Performance review initiated for ${employeeId}`
					updatedData = performanceData.map((emp) =>
						emp.employeeId === employeeId ? { ...emp, status: "Under Review" } : emp,
					)
					break
				case "goals":
					message = `Goals management opened for ${employeeId}`
					break
				case "complete":
					message = `Review marked as completed for ${employeeId}`
					updatedData = performanceData.map((emp) =>
						emp.employeeId === employeeId
							? { ...emp, status: "Completed", lastReview: new Date().toISOString().split("T")[0] }
							: emp,
					)
					break
				default:
					message = `Action completed for ${employeeId}`
			}

			setPerformanceData(updatedData)
			showAlert(message, "success")
		} catch (error) {
			showAlert("Failed to perform action", "danger")
		}
		setLoading(false)
	}

	const showAlert = (message, variant) => {
		setAlert({ show: true, message, variant })
		setTimeout(() => setAlert({ show: false, message: "", variant: "success" }), 5000)
	}

	const getStatusColor = (status) => {
		switch (status) {
			case "Excellent":
				return "success"
			case "Good":
				return "primary"
			case "On Track":
				return "info"
			case "Needs Improvement":
				return "warning"
			case "Review Scheduled":
				return "secondary"
			case "Under Review":
				return "warning"
			case "Completed":
				return "success"
			default:
				return "secondary"
		}
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
					<div className="d-flex justify-content-between align-items-center">
						<div>
							<h2 className="mb-0">Performance Management</h2>
							<p className="text-muted">Track employee performance and development</p>
						</div>
						<Button variant="primary" onClick={() => setShowReviewModal(true)} disabled={loading}>
							{loading ? <Spinner size="sm" /> : "Schedule Review"}
						</Button>
					</div>
				</Col>
			</Row>

			<Row className="mb-4">
				<Col md={3}>
					<Card className="text-center">
						<Card.Body>
							<h4 className="text-primary">4.3</h4>
							<p className="mb-0">Average Rating</p>
							<small className="text-muted">Company wide</small>
						</Card.Body>
					</Card>
				</Col>
				<Col md={3}>
					<Card className="text-center">
						<Card.Body>
							<h4 className="text-success">85%</h4>
							<p className="mb-0">Goal Completion</p>
							<small className="text-muted">This quarter</small>
						</Card.Body>
					</Card>
				</Col>
				<Col md={3}>
					<Card className="text-center">
						<Card.Body>
							<h4 className="text-info">12</h4>
							<p className="mb-0">Pending Reviews</p>
							<small className="text-muted">Due this month</small>
						</Card.Body>
					</Card>
				</Col>
				<Col md={3}>
					<Card className="text-center">
						<Card.Body>
							<h4 className="text-warning">8</h4>
							<p className="mb-0">Training Needed</p>
							<small className="text-muted">Skill gaps identified</small>
						</Card.Body>
					</Card>
				</Col>
			</Row>

			<Card>
				<Card.Header>
					<h5 className="mb-0">Performance Overview</h5>
				</Card.Header>
				<Card.Body>
					{loading && performanceData.length === 0 ? (
						<div className="text-center py-4">
							<Spinner animation="border" />
							<p className="mt-2">Loading performance data...</p>
						</div>
					) : (
						<Table responsive hover>
							<thead>
								<tr>
									<th>Employee</th>
									<th>Department</th>
									<th>Current Rating</th>
									<th>Goal Progress</th>
									<th>Last Review</th>
									<th>Next Review</th>
									<th>Status</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{performanceData.map((record) => (
									<tr key={record.employeeId}>
										<td>
											<div>
												<strong>{record.name}</strong>
												<br />
												<small className="text-muted">{record.employeeId}</small>
											</div>
										</td>
										<td>{record.department}</td>
										<td>
											<div className="d-flex align-items-center">
												<span className="me-2">{record.currentRating}/5.0</span>
												<div style={{ width: "60px" }}>
													<ProgressBar
														variant={
															record.currentRating >= 4.5 ? "success" : record.currentRating >= 4.0 ? "info" : "warning"
														}
														now={(record.currentRating / 5) * 100}
														style={{ height: "6px" }}
													/>
												</div>
											</div>
										</td>
										<td>
											<div>
												<small>
													{record.completedGoals}/{record.goals} goals
												</small>
												<ProgressBar
													variant="info"
													now={(record.completedGoals / record.goals) * 100}
													style={{ height: "6px" }}
												/>
											</div>
										</td>
										<td>{record.lastReview}</td>
										<td>{record.nextReview}</td>
										<td>
											<Badge bg={getStatusColor(record.status)}>{record.status}</Badge>
										</td>
										<td>
											<div className="d-flex flex-wrap gap-1">
												<Button
													variant="outline-primary"
													size="sm"
													onClick={() => handleQuickAction(record.employeeId, "review")}
													disabled={loading}
												>
													Review
												</Button>
												<Button
													variant="outline-secondary"
													size="sm"
													onClick={() => handleQuickAction(record.employeeId, "goals")}
													disabled={loading}
												>
													Goals
												</Button>
												{record.status === "Under Review" && (
													<Button
														variant="outline-success"
														size="sm"
														onClick={() => handleQuickAction(record.employeeId, "complete")}
														disabled={loading}
													>
														Complete
													</Button>
												)}
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</Table>
					)}
				</Card.Body>
			</Card>

			{/* Schedule Review Modal */}
			<Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} size="lg">
				<Modal.Header closeButton>
					<Modal.Title>Schedule Performance Review</Modal.Title>
				</Modal.Header>
				<Form onSubmit={handleScheduleReview}>
					<Modal.Body>
						<Row>
							<Col md={6}>
								<Form.Group className="mb-3">
									<Form.Label>Employee</Form.Label>
									<Form.Select
										value={reviewForm.employeeId}
										onChange={(e) => setReviewForm({ ...reviewForm, employeeId: e.target.value })}
										required
									>
										<option value="">Select Employee</option>
										{performanceData.map((emp) => (
											<option key={emp.employeeId} value={emp.employeeId}>
												{emp.name} ({emp.employeeId})
											</option>
										))}
									</Form.Select>
								</Form.Group>
							</Col>
							<Col md={6}>
								<Form.Group className="mb-3">
									<Form.Label>Review Type</Form.Label>
									<Form.Select
										value={reviewForm.reviewType}
										onChange={(e) => setReviewForm({ ...reviewForm, reviewType: e.target.value })}
									>
										<option value="Annual">Annual Review</option>
										<option value="Mid-Year">Mid-Year Review</option>
										<option value="Quarterly">Quarterly Review</option>
										<option value="Probationary">Probationary Review</option>
										<option value="Special">Special Review</option>
									</Form.Select>
								</Form.Group>
							</Col>
						</Row>
						<Row>
							<Col md={6}>
								<Form.Group className="mb-3">
									<Form.Label>Scheduled Date</Form.Label>
									<Form.Control
										type="date"
										value={reviewForm.scheduledDate}
										onChange={(e) => setReviewForm({ ...reviewForm, scheduledDate: e.target.value })}
										min={new Date().toISOString().split("T")[0]}
										required
									/>
								</Form.Group>
							</Col>
							<Col md={6}>
								<Form.Group className="mb-3">
									<Form.Label>Reviewer</Form.Label>
									<Form.Select
										value={reviewForm.reviewer}
										onChange={(e) => setReviewForm({ ...reviewForm, reviewer: e.target.value })}
										required
									>
										<option value="">Select Reviewer</option>
										<option value="Sarah Johnson">Sarah Johnson (Manager)</option>
										<option value="Mike Davis">Mike Davis (Senior Lead)</option>
										<option value="Lisa Brown">Lisa Brown (Department Head)</option>
										<option value="HR Manager">HR Manager</option>
									</Form.Select>
								</Form.Group>
							</Col>
						</Row>
						<Form.Group className="mb-3">
							<Form.Label>Notes</Form.Label>
							<Form.Control
								as="textarea"
								rows={3}
								placeholder="Enter any additional notes or preparation instructions..."
								value={reviewForm.notes}
								onChange={(e) => setReviewForm({ ...reviewForm, notes: e.target.value })}
							/>
						</Form.Group>
						<div className="bg-light p-3 rounded">
							<h6>Review Preparation Checklist:</h6>
							<ul className="mb-0">
								<li>Employee self-assessment form</li>
								<li>Goal achievement documentation</li>
								<li>360-degree feedback (if applicable)</li>
								<li>Performance metrics and KPIs</li>
								<li>Training and development records</li>
							</ul>
						</div>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={() => setShowReviewModal(false)}>
							Cancel
						</Button>
						<Button variant="primary" type="submit" disabled={loading}>
							{loading ? <Spinner size="sm" /> : "Schedule Review"}
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>
		</Container>
	)
}
