"use client"

import { Container, Row, Col, Card, Table, Button, Badge, Alert } from "react-bootstrap"
import { useState } from "react"

export default function Compliance() {
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState({ show: false, message: "", variant: "success" })

  const certifications = [
    {
      employeeId: "EMP001",
      name: "John Smith",
      certification: "Lab Safety Training",
      issueDate: "2023-06-15",
      expiryDate: "2024-06-15",
      status: "Valid",
      daysToExpiry: 45,
    },
    {
      employeeId: "EMP002",
      name: "Sarah Johnson",
      certification: "Bloodborne Pathogens",
      issueDate: "2023-12-01",
      expiryDate: "2024-12-01",
      status: "Valid",
      daysToExpiry: 180,
    },
    {
      employeeId: "EMP003",
      name: "Mike Davis",
      certification: "Chemical Handling",
      issueDate: "2023-01-15",
      expiryDate: "2024-01-15",
      status: "Expired",
      daysToExpiry: -15,
    },
  ]

  const expiringCerts = certifications.filter((cert) => cert.daysToExpiry <= 60 && cert.daysToExpiry > 0)
  const expiredCerts = certifications.filter((cert) => cert.daysToExpiry <= 0)

  const handleScheduleTraining = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/training/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "general_training" }),
      })

      if (response.ok) {
        setAlert({ show: true, message: "Training scheduled successfully!", variant: "success" })
      }
    } catch (error) {
      setAlert({ show: true, message: "Error scheduling training", variant: "danger" })
    } finally {
      setLoading(false)
    }
  }

  const handleRenewCertification = async (employeeId: string, certification: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/certifications/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, certification }),
      })

      if (response.ok) {
        setAlert({ show: true, message: "Certification renewal initiated!", variant: "success" })
      }
    } catch (error) {
      setAlert({ show: true, message: "Error renewing certification", variant: "danger" })
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
              <h2 className="mb-0">Compliance & Certifications</h2>
              <p className="text-muted">Track mandatory training and certifications</p>
            </div>
            <Button variant="primary" onClick={handleScheduleTraining} disabled={loading}>
              {loading ? "Scheduling..." : "Schedule Training"}
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

      {(expiringCerts.length > 0 || expiredCerts.length > 0) && (
        <Row className="mb-4">
          <Col>
            {expiredCerts.length > 0 && (
              <Alert variant="danger">
                <Alert.Heading>⚠️ Expired Certifications</Alert.Heading>
                <p className="mb-0">
                  {expiredCerts.length} certification(s) have expired and require immediate attention.
                </p>
              </Alert>
            )}
            {expiringCerts.length > 0 && (
              <Alert variant="warning">
                <Alert.Heading>🔔 Expiring Soon</Alert.Heading>
                <p className="mb-0">{expiringCerts.length} certification(s) will expire within 60 days.</p>
              </Alert>
            )}
          </Col>
        </Row>
      )}

      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-success">142</h4>
              <p className="mb-0">Valid Certifications</p>
              <small className="text-muted">Currently active</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-warning">{expiringCerts.length}</h4>
              <p className="mb-0">Expiring Soon</p>
              <small className="text-muted">Within 60 days</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-danger">{expiredCerts.length}</h4>
              <p className="mb-0">Expired</p>
              <small className="text-muted">Require renewal</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-info">95%</h4>
              <p className="mb-0">Compliance Rate</p>
              <small className="text-muted">Overall compliance</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <h5 className="mb-0">Certification Tracking</h5>
        </Card.Header>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Certification</th>
                <th>Issue Date</th>
                <th>Expiry Date</th>
                <th>Days to Expiry</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {certifications.map((cert, index) => (
                <tr key={index}>
                  <td>
                    <div>
                      <strong>{cert.name}</strong>
                      <br />
                      <small className="text-muted">{cert.employeeId}</small>
                    </div>
                  </td>
                  <td>{cert.certification}</td>
                  <td>{cert.issueDate}</td>
                  <td>{cert.expiryDate}</td>
                  <td>
                    <span
                      className={
                        cert.daysToExpiry <= 0
                          ? "text-danger"
                          : cert.daysToExpiry <= 60
                            ? "text-warning"
                            : "text-success"
                      }
                    >
                      {cert.daysToExpiry <= 0
                        ? `${Math.abs(cert.daysToExpiry)} days overdue`
                        : `${cert.daysToExpiry} days`}
                    </span>
                  </td>
                  <td>
                    <Badge bg={cert.status === "Valid" ? "success" : "danger"}>{cert.status}</Badge>
                  </td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-1">
                      View
                    </Button>
                    {cert.status === "Expired" || cert.daysToExpiry <= 60 ? (
                      <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={() => handleRenewCertification(cert.employeeId, cert.certification)}
                        disabled={loading}
                      >
                        {loading ? "Processing..." : "Renew"}
                      </Button>
                    ) : (
                      <Button variant="outline-secondary" size="sm">
                        Edit
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  )
}
