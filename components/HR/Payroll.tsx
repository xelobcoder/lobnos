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
	Form,
	InputGroup,
	Modal,
	Alert,
	Spinner,
} from "react-bootstrap"

interface PayrollRecord {
	employeeId: string
	name: string
	basicSalary: number
	allowances: number
	overtime: number
	bonuses: number
	grossSalary: number
	taxDeduction: number
	insuranceDeduction: number
	otherDeductions: number
	totalDeductions: number
	netSalary: number
	status: "Processed" | "Pending"
	payDate: string
	payPeriod?: string
}

interface PayrollSummary {
	totalPayroll: number
	processedCount: number
	pendingCount: number
	totalDeductions: number
}

interface AlertState {
	show: boolean
	message: string
	variant: "success" | "danger" | "info" | string
}

export default function Payroll() {
	const [loading, setLoading] = useState(false)
	const [alert, setAlert] = useState<AlertState>({ show: false, message: "", variant: "success" })
	const [payrollData, setPayrollData] = useState<PayrollRecord[]>([])
	const [searchTerm, setSearchTerm] = useState("")
	const [showProcessModal, setShowProcessModal] = useState(false)
	const [showPayslipModal, setShowPayslipModal] = useState(false)
	const [selectedEmployee, setSelectedEmployee] = useState<PayrollRecord | null>(null)
	const [payrollSummary, setPayrollSummary] = useState<PayrollSummary>({
		totalPayroll: 0,
		processedCount: 0,
		pendingCount: 0,
		totalDeductions: 0,
	})

	useEffect(() => {
		fetchPayrollData()
	}, [])

	const fetchPayrollData = async () => {
		setLoading(true)
		try {
			const response = await fetch("/api/payslips")
			const result = await response.json()
			if (result.success) {
				setPayrollData(result.data)
			} else {
				setPayrollData([])
			}
		} catch (error) {
			setPayrollData([])
		}
		setLoading(false)
	}

	const handleProcessPayroll = async () => {
		setLoading(true)
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 2000))

			// Update pending records to processed
			const updatedData = payrollData.map((record) =>
				record.status === "Pending"
					? { ...record, status: "Processed" as "Processed", payDate: new Date().toISOString().split("T")[0] }
					: record,
			) as PayrollRecord[]

			setPayrollData(updatedData)
			setShowProcessModal(false)

			// Update summary
			const summary = {
				totalPayroll: updatedData.reduce((sum, record) => sum + record.netSalary, 0),
				processedCount: updatedData.filter((record) => record.status === "Processed").length,
				pendingCount: updatedData.filter((record) => record.status === "Pending").length,
				totalDeductions: updatedData.reduce((sum, record) => sum + record.totalDeductions, 0),
			}
			setPayrollSummary(summary)

			showAlert("Payroll processed successfully for all pending employees!", "success")
		} catch (error) {
			showAlert("Failed to process payroll", "danger")
		}
		setLoading(false)
	}

	const handleGenerateReports = async () => {
		setLoading(true)
		try {
			// Simulate report generation
			await new Promise((resolve) => setTimeout(resolve, 1500))
			showAlert("Payroll reports generated and downloaded successfully!", "success")
		} catch (error) {
			showAlert("Failed to generate reports", "danger")
		}
		setLoading(false)
	}

	const handleViewPayslip = (employee: PayrollRecord) => {
		setSelectedEmployee(employee)
		setShowPayslipModal(true)
	}

	const handleEditPayroll = async (employeeId: string) => {
		setLoading(true)
		try {
			// Simulate edit action
			await new Promise((resolve) => setTimeout(resolve, 500))
			showAlert(`Payroll editing opened for ${employeeId}`, "info")
		} catch (error) {
			showAlert("Failed to open payroll editor", "danger")
		}
		setLoading(false)
	}

	const handleProcessSinglePayroll = async (employeeId: string) => {
		setLoading(true)
		try {
			// Simulate single payroll processing
			await new Promise((resolve) => setTimeout(resolve, 1000))

			const updatedData = payrollData.map((record) =>
				record.employeeId === employeeId
					? { ...record, status: "Processed" as "Processed", payDate: new Date().toISOString().split("T")[0] }
					: record,
			) as PayrollRecord[]

			setPayrollData(updatedData)

			// Update summary
			const summary = {
				totalPayroll: updatedData.reduce((sum, record) => sum + record.netSalary, 0),
				processedCount: updatedData.filter((record) => record.status === "Processed").length,
				pendingCount: updatedData.filter((record) => record.status === "Pending").length,
				totalDeductions: updatedData.reduce((sum, record) => sum + record.totalDeductions, 0),
			}
			setPayrollSummary(summary)

			showAlert(`Payroll processed successfully for ${employeeId}`, "success")
		} catch (error) {
			showAlert("Failed to process individual payroll", "danger")
		}
		setLoading(false)
	}

	const showAlert = (message: string, variant: "success" | "danger" | "info" | string) => {
		setAlert({ show: true, message, variant })
		setTimeout(() => setAlert({ show: false, message: "", variant: "success" }), 5000)
	}

	const filteredPayrollData = payrollData.filter(
		(record) =>
			(record.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
			(record.employeeId?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
	)

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
							<h2 className="mb-0">Payroll Management</h2>
							<p className="text-muted">Manage employee salaries and payroll processing</p>
						</div>
						<div>
							<Button
								variant="success"
								className="me-2"
								onClick={() => setShowProcessModal(true)}
								disabled={loading || payrollSummary.pendingCount === 0}
							>
								{loading ? <Spinner size="sm" /> : "Process Payroll"}
							</Button>
							<Button variant="outline-primary" onClick={handleGenerateReports} disabled={loading}>
								{loading ? <Spinner size="sm" /> : "Generate Reports"}
							</Button>
						</div>
					</div>
				</Col>
			</Row>

			<Row className="mb-4">
				<Col md={3}>
					<Card className="text-center">
						<Card.Body>
							<h4 className="text-primary">${payrollSummary.totalPayroll.toLocaleString()}</h4>
							<p className="mb-0">Total Payroll</p>
							<small className="text-muted">This month</small>
						</Card.Body>
					</Card>
				</Col>
				<Col md={3}>
					<Card className="text-center">
						<Card.Body>
							<h4 className="text-success">{payrollSummary.processedCount}</h4>
							<p className="mb-0">Processed</p>
							<small className="text-muted">Employees paid</small>
						</Card.Body>
					</Card>
				</Col>
				<Col md={3}>
					<Card className="text-center">
						<Card.Body>
							<h4 className="text-warning">{payrollSummary.pendingCount}</h4>
							<p className="mb-0">Pending</p>
							<small className="text-muted">Awaiting processing</small>
						</Card.Body>
					</Card>
				</Col>
				<Col md={3}>
					<Card className="text-center">
						<Card.Body>
							<h4 className="text-info">${payrollSummary.totalDeductions.toLocaleString()}</h4>
							<p className="mb-0">Deductions</p>
							<small className="text-muted">Total deductions</small>
						</Card.Body>
					</Card>
				</Col>
			</Row>

			<Card>
				<Card.Header>
					<Row>
						<Col md={6}>
							<h5 className="mb-0">Payroll Records</h5>
						</Col>
						<Col md={6}>
							<InputGroup>
								<Form.Control
									type="text"
									placeholder="Search employees..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
								<InputGroup.Text>🔍</InputGroup.Text>
							</InputGroup>
						</Col>
					</Row>
				</Card.Header>
				<Card.Body>
					{loading && payrollData.length === 0 ? (
						<div className="text-center py-4">
							<Spinner animation="border" />
							<p className="mt-2">Loading payroll data...</p>
						</div>
					) : (
						<Table responsive hover>
							<thead>
								<tr>
									<th>Employee ID</th>
									<th>Name</th>
									<th>Basic Salary</th>
									<th>Allowances</th>
									<th>Gross Salary</th>
									<th>Deductions</th>
									<th>Net Salary</th>
									<th>Status</th>
									<th>Pay Date</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{filteredPayrollData.map((record) => (
									<tr key={record.employeeId}>
										<td>
											<strong>{record.employeeId}</strong>
										</td>
										<td>{record.name}</td>
										<td>${record.basicSalary.toLocaleString()}</td>
										<td>${record.allowances.toLocaleString()}</td>
										<td>${record.grossSalary.toLocaleString()}</td>
										<td>${record.totalDeductions.toLocaleString()}</td>
										<td>
											<strong>${record.netSalary.toLocaleString()}</strong>
										</td>
										<td>
											<Badge bg={record.status === "Processed" ? "success" : "warning"}>{record.status}</Badge>
										</td>
										<td>{record.payDate}</td>
										<td>
											<div className="d-flex flex-wrap gap-1">
												<Button variant="outline-primary" size="sm" onClick={() => handleViewPayslip(record)}>
													View Slip
												</Button>
												<Button
													variant="outline-secondary"
													size="sm"
													onClick={() => handleEditPayroll(record.employeeId)}
													disabled={loading}
												>
													Edit
												</Button>
												{record.status === "Pending" && (
													<Button
														variant="outline-success"
														size="sm"
														onClick={() => handleProcessSinglePayroll(record.employeeId)}
														disabled={loading}
													>
														{loading ? <Spinner size="sm" /> : "Process"}
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

			{/* Process Payroll Confirmation Modal */}
			<Modal show={showProcessModal} onHide={() => setShowProcessModal(false)}>
				<Modal.Header closeButton>
					<Modal.Title>Process Payroll</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p>Are you sure you want to process payroll for all pending employees?</p>
					<p>
						<strong>{payrollSummary.pendingCount}</strong> employees will be processed.
					</p>
					<p>
						Total amount:{" "}
						<strong>
							$
							{payrollData
								.filter((r) => r.status === "Pending")
								.reduce((sum, r) => sum + r.netSalary, 0)
								.toLocaleString()}
						</strong>
					</p>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={() => setShowProcessModal(false)}>
						Cancel
					</Button>
					<Button variant="success" onClick={handleProcessPayroll} disabled={loading}>
						{loading ? <Spinner size="sm" /> : "Process Payroll"}
					</Button>
				</Modal.Footer>
			</Modal>

			{/* Payslip Modal */}
			<Modal show={showPayslipModal} onHide={() => setShowPayslipModal(false)} size="lg">
				<Modal.Header closeButton>
					<Modal.Title>Payslip - {selectedEmployee?.name}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{selectedEmployee && (
						<div>
							<Row className="mb-3">
								<Col md={6}>
									<strong>Employee ID:</strong> {selectedEmployee.employeeId}
								</Col>
								<Col md={6}>
									<strong>Pay Period:</strong> {selectedEmployee.payPeriod}
								</Col>
							</Row>
							<Row className="mb-3">
								<Col md={6}>
									<strong>Employee Name:</strong> {selectedEmployee.name}
								</Col>
								<Col md={6}>
									<strong>Pay Date:</strong> {selectedEmployee.payDate}
								</Col>
							</Row>

							<hr />

							<h6>Earnings</h6>
							<Table size="sm">
								<tbody>
									<tr>
										<td>Basic Salary</td>
										<td className="text-end">${selectedEmployee.basicSalary.toLocaleString()}</td>
									</tr>
									<tr>
										<td>Allowances</td>
										<td className="text-end">${selectedEmployee.allowances.toLocaleString()}</td>
									</tr>
									<tr>
										<td>Overtime</td>
										<td className="text-end">${selectedEmployee.overtime.toLocaleString()}</td>
									</tr>
									<tr>
										<td>Bonuses</td>
										<td className="text-end">${selectedEmployee.bonuses.toLocaleString()}</td>
									</tr>
									<tr className="table-success">
										<td>
											<strong>Gross Salary</strong>
										</td>
										<td className="text-end">
											<strong>${selectedEmployee.grossSalary.toLocaleString()}</strong>
										</td>
									</tr>
								</tbody>
							</Table>

							<h6>Deductions</h6>
							<Table size="sm">
								<tbody>
									<tr>
										<td>Tax Deduction</td>
										<td className="text-end">${selectedEmployee.taxDeduction.toLocaleString()}</td>
									</tr>
									<tr>
										<td>Insurance</td>
										<td className="text-end">${selectedEmployee.insuranceDeduction.toLocaleString()}</td>
									</tr>
									<tr>
										<td>Other Deductions</td>
										<td className="text-end">${selectedEmployee.otherDeductions.toLocaleString()}</td>
									</tr>
									<tr className="table-danger">
										<td>
											<strong>Total Deductions</strong>
										</td>
										<td className="text-end">
											<strong>${selectedEmployee.totalDeductions.toLocaleString()}</strong>
										</td>
									</tr>
								</tbody>
							</Table>

							<hr />

							<Row>
								<Col>
									<h5 className="text-primary">Net Salary: ${selectedEmployee.netSalary.toLocaleString()}</h5>
								</Col>
							</Row>
						</div>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button variant="outline-primary">Download PDF</Button>
					<Button variant="secondary" onClick={() => setShowPayslipModal(false)}>
						Close
					</Button>
				</Modal.Footer>
			</Modal>
		</Container>
	)
}
