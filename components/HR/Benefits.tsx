"use client"

import { Container, Row, Col, Card, Table, Button, Badge, Alert } from "react-bootstrap"
import { useState } from "react"

export default function Benefits() {
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState({ show: false, message: "", variant: "success" })

  const benefitPlans = [
    {
      type: "Health Insurance",
      plan: "Premium Health Plan",
      coverage: "Employee + Family",
      monthlyPremium: 450,
      employerContribution: 350,
      employeeContribution: 100,
      status: "Active",
    },
    {
      type: "Dental Insurance",
      plan: "Basic Dental Plan",
      coverage: "Employee Only",
      monthlyPremium: 75,
      employerContribution: 60,
      employeeContribution: 15,
      status: "Active",
    },
    {
      type: "Life Insurance",
      plan: "Term Life Insurance",
      coverage: "2x Annual Salary",
      monthlyPremium: 25,
      employerContribution: 25,
      employeeContribution: 0,
      status: "Active",
    },
  ]

  const reimbursements = [
    {
      id: "RB001",
      employee: "John Smith",
      type: "Medical",
      amount: 250,
      submittedDate: "2024-01-15",
      status: "Approved",
      processedDate: "2024-01-18",
    },
    {
      id: "RB002",
      employee: "Sarah Johnson",
      type: "Training",
      amount: 500,
      submittedDate: "2024-01-20",
      status: "Pending",
      processedDate: null,
    },
  ]

  const handleEnrollBenefits = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/benefits/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "enroll" }),
      })

      if (response.ok) {
        setAlert({ show: true, message: "Benefits enrollment initiated!", variant: "success" })
      }
    } catch (error) {
      setAlert({ show: true, message: "Error enrolling in benefits", variant: "danger" })
    } finally {
      setLoading(false)
    }
  }

  const handleApproveReimbursement = async (requestId: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/reimbursements/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      })

      if (response.ok) {
        setAlert({ show: true, message: "Reimbursement approved!", variant: "success" })
      }
    } catch (error) {
      setAlert({ show: true, message: "Error approving reimbursement", variant: "danger" })
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
              <h2 className="mb-0">Benefits Management</h2>
              <p className="text-muted">Manage employee benefits and reimbursements</p>
            </div>
            <Button variant="primary" onClick={handleEnrollBenefits} disabled={loading}>
              {loading ? "Processing..." : "Enroll in Benefits"}
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
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-primary">$28,500</h4>
              <p className="mb-0">Total Benefits Value</p>
              <small className="text-muted">Per employee annually</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-success">98%</h4>
              <p className="mb-0">Enrollment Rate</p>
              <small className="text-muted">Health insurance</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-info">$12,400</h4>
              <p className="mb-0">Reimbursements</p>
              <small className="text-muted">This year</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-warning">15</h4>
              <p className="mb-0">Pending Claims</p>
              <small className="text-muted">Awaiting approval</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Current Benefit Plans</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Benefit Type</th>
                    <th>Plan</th>
                    <th>Coverage</th>
                    <th>Monthly Premium</th>
                    <th>Employer Contribution</th>
                    <th>Employee Contribution</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {benefitPlans.map((benefit, index) => (
                    <tr key={index}>
                      <td>
                        <strong>{benefit.type}</strong>
                      </td>
                      <td>{benefit.plan}</td>
                      <td>{benefit.coverage}</td>
                      <td>${benefit.monthlyPremium}</td>
                      <td>${benefit.employerContribution}</td>
                      <td>${benefit.employeeContribution}</td>
                      <td>
                        <Badge bg="success">{benefit.status}</Badge>
                      </td>
                      <td>
                        <Button variant="outline-primary" size="sm" className="me-1">
                          View
                        </Button>
                        <Button variant="outline-secondary" size="sm">
                          Modify
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
              <h5 className="mb-0">Reimbursement Requests</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Submitted Date</th>
                    <th>Status</th>
                    <th>Processed Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reimbursements.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <strong>{request.id}</strong>
                      </td>
                      <td>{request.employee}</td>
                      <td>{request.type}</td>
                      <td>${request.amount}</td>
                      <td>{request.submittedDate}</td>
                      <td>
                        <Badge bg={request.status === "Approved" ? "success" : "warning"}>{request.status}</Badge>
                      </td>
                      <td>{request.processedDate || "N/A"}</td>
                      <td>
                        <Button variant="outline-primary" size="sm" className="me-1">
                          View
                        </Button>
                        {request.status === "Pending" && (
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleApproveReimbursement(request.id)}
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
    </Container>
  )
}
