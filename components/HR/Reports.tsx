"use client"

import { Container, Row, Col, Card, Button, Table, Form, Badge, Alert } from "react-bootstrap"
import { useState } from "react"

export default function Reports() {
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState({ show: false, message: "", variant: "success" })

  const reportTemplates = [
    {
      id: "RPT001",
      name: "Employee Headcount Report",
      category: "Employee Management",
      frequency: "Monthly",
      lastGenerated: "2024-01-31",
      status: "Active",
    },
    {
      id: "RPT002",
      name: "Payroll Summary Report",
      category: "Payroll",
      frequency: "Monthly",
      lastGenerated: "2024-01-31",
      status: "Active",
    },
    {
      id: "RPT003",
      name: "Attendance Analysis",
      category: "Attendance",
      frequency: "Weekly",
      lastGenerated: "2024-01-28",
      status: "Active",
    },
    {
      id: "RPT004",
      name: "Training Compliance Report",
      category: "Compliance",
      frequency: "Quarterly",
      lastGenerated: "2024-01-01",
      status: "Active",
    },
  ]

  const recentReports = [
    {
      name: "January 2024 Payroll Summary",
      generatedBy: "HR System",
      date: "2024-02-01",
      size: "2.3 MB",
      format: "PDF",
    },
    {
      name: "Weekly Attendance Report",
      generatedBy: "Mike Davis",
      date: "2024-01-29",
      size: "1.8 MB",
      format: "Excel",
    },
    {
      name: "Employee Performance Q4 2023",
      generatedBy: "Lisa Brown",
      date: "2024-01-15",
      size: "3.1 MB",
      format: "PDF",
    },
  ]

  const handleCreateCustomReport = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/reports/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "custom_report" }),
      })

      if (response.ok) {
        setAlert({ show: true, message: "Custom report created successfully!", variant: "success" })
      }
    } catch (error) {
      setAlert({ show: true, message: "Error creating custom report", variant: "danger" })
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReport = async (reportId: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId }),
      })

      if (response.ok) {
        setAlert({ show: true, message: "Report generated successfully!", variant: "success" })
      }
    } catch (error) {
      setAlert({ show: true, message: "Error generating report", variant: "danger" })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadReport = async (reportName: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/reports/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportName }),
      })

      if (response.ok) {
        setAlert({ show: true, message: "Report download started!", variant: "success" })
      }
    } catch (error) {
      setAlert({ show: true, message: "Error downloading report", variant: "danger" })
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
              <h2 className="mb-0">Reports & Analytics</h2>
              <p className="text-muted">Generate and manage HR reports and analytics</p>
            </div>
            <Button variant="primary" onClick={handleCreateCustomReport} disabled={loading}>
              {loading ? "Creating..." : "Create Custom Report"}
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
              <h4 className="text-primary">24</h4>
              <p className="mb-0">Report Templates</p>
              <small className="text-muted">Available templates</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-success">156</h4>
              <p className="mb-0">Reports Generated</p>
              <small className="text-muted">This month</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-info">12</h4>
              <p className="mb-0">Scheduled Reports</p>
              <small className="text-muted">Auto-generated</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-warning">3</h4>
              <p className="mb-0">Custom Reports</p>
              <small className="text-muted">User created</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Report Templates</h5>
                <Form.Select style={{ width: "auto" }}>
                  <option>All Categories</option>
                  <option>Employee Management</option>
                  <option>Payroll</option>
                  <option>Attendance</option>
                  <option>Compliance</option>
                </Form.Select>
              </div>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Report ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Frequency</th>
                    <th>Last Generated</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reportTemplates.map((report) => (
                    <tr key={report.id}>
                      <td>
                        <strong>{report.id}</strong>
                      </td>
                      <td>{report.name}</td>
                      <td>
                        <Badge bg="secondary">{report.category}</Badge>
                      </td>
                      <td>{report.frequency}</td>
                      <td>{report.lastGenerated}</td>
                      <td>
                        <Badge bg="success">{report.status}</Badge>
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1"
                          onClick={() => handleGenerateReport(report.id)}
                          disabled={loading}
                        >
                          {loading ? "Generating..." : "Generate"}
                        </Button>
                        <Button variant="outline-secondary" size="sm" className="me-1">
                          Edit
                        </Button>
                        <Button variant="outline-info" size="sm">
                          Schedule
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
              <h5 className="mb-0">Recent Reports</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Report Name</th>
                    <th>Generated By</th>
                    <th>Date</th>
                    <th>Size</th>
                    <th>Format</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReports.map((report, index) => (
                    <tr key={index}>
                      <td>
                        <strong>{report.name}</strong>
                      </td>
                      <td>{report.generatedBy}</td>
                      <td>{report.date}</td>
                      <td>{report.size}</td>
                      <td>
                        <Badge bg={report.format === "PDF" ? "danger" : "success"}>{report.format}</Badge>
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1"
                          onClick={() => handleDownloadReport(report.name)}
                          disabled={loading}
                        >
                          {loading ? "Downloading..." : "Download"}
                        </Button>
                        <Button variant="outline-secondary" size="sm">
                          Share
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
    </Container>
  )
}
