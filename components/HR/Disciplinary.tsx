"use client"

import { useState } from "react"
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Form, Alert } from "react-bootstrap"

export default function Disciplinary() {
  const [showIncidentModal, setShowIncidentModal] = useState(false)

  const [incidentForm, setIncidentForm] = useState({
    employee: "",
    type: "",
    severity: "",
    date: "",
    description: "",
  })
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState({ show: false, message: "", variant: "success" })

  const incidents = [
    {
      id: "INC001",
      employeeId: "EMP003",
      employeeName: "Mike Davis",
      type: "Safety Violation",
      severity: "Medium",
      date: "2024-01-10",
      description: "Failed to wear proper PPE in lab",
      status: "Under Review",
      actionTaken: null,
    },
    {
      id: "INC002",
      employeeId: "EMP004",
      employeeName: "Lisa Brown",
      type: "Attendance",
      severity: "Low",
      date: "2024-01-08",
      description: "Late arrival without notification",
      status: "Resolved",
      actionTaken: "Verbal Warning",
    },
  ]

  const grievances = [
    {
      id: "GR001",
      employeeId: "EMP005",
      employeeName: "Tom Wilson",
      subject: "Workplace Harassment",
      submittedDate: "2024-01-12",
      status: "Under Investigation",
      priority: "High",
    },
    {
      id: "GR002",
      employeeId: "EMP006",
      employeeName: "Anna Garcia",
      subject: "Unfair Treatment",
      submittedDate: "2024-01-05",
      status: "Resolved",
      priority: "Medium",
    },
  ]

  const handleSubmitIncident = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(incidentForm),
      })

      if (response.ok) {
        setAlert({ show: true, message: "Incident reported successfully!", variant: "success" })
        setShowIncidentModal(false)
        setIncidentForm({ employee: "", type: "", severity: "", date: "", description: "" })
      }
    } catch (error) {
      setAlert({ show: true, message: "Error reporting incident", variant: "danger" })
    } finally {
      setLoading(false)
    }
  }

  const handleResolveIncident = async (incidentId: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/incidents/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidentId }),
      })

      if (response.ok) {
        setAlert({ show: true, message: "Incident resolved!", variant: "success" })
      }
    } catch (error) {
      setAlert({ show: true, message: "Error resolving incident", variant: "danger" })
    } finally {
      setLoading(false)
    }
  }

  const handleCloseGrievance = async (grievanceId: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/grievances/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grievanceId }),
      })

      if (response.ok) {
        setAlert({ show: true, message: "Grievance closed!", variant: "success" })
      }
    } catch (error) {
      setAlert({ show: true, message: "Error closing grievance", variant: "danger" })
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
              <h2 className="mb-0">Disciplinary & Grievance Management</h2>
              <p className="text-muted">Handle workplace incidents and employee grievances</p>
            </div>
            <Button variant="primary" onClick={() => setShowIncidentModal(true)}>
              Report Incident
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
              <h4 className="text-warning">8</h4>
              <p className="mb-0">Open Incidents</p>
              <small className="text-muted">Requiring attention</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-danger">3</h4>
              <p className="mb-0">High Priority</p>
              <small className="text-muted">Urgent cases</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-info">5</h4>
              <p className="mb-0">Grievances</p>
              <small className="text-muted">Under review</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-success">92%</h4>
              <p className="mb-0">Resolution Rate</p>
              <small className="text-muted">This quarter</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Alert variant="warning">
            <Alert.Heading>⚠️ Attention Required</Alert.Heading>
            <p className="mb-0">
              3 high-priority incidents require immediate attention. Please review and take appropriate action.
            </p>
          </Alert>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Recent Incidents</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Incident ID</th>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>Severity</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action Taken</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((incident) => (
                    <tr key={incident.id}>
                      <td>
                        <strong>{incident.id}</strong>
                      </td>
                      <td>
                        <div>
                          <strong>{incident.employeeName}</strong>
                          <br />
                          <small className="text-muted">{incident.employeeId}</small>
                        </div>
                      </td>
                      <td>{incident.type}</td>
                      <td>
                        <Badge
                          bg={
                            incident.severity === "High"
                              ? "danger"
                              : incident.severity === "Medium"
                                ? "warning"
                                : "info"
                          }
                        >
                          {incident.severity}
                        </Badge>
                      </td>
                      <td>{incident.date}</td>
                      <td>
                        <Badge bg={incident.status === "Resolved" ? "success" : "warning"}>{incident.status}</Badge>
                      </td>
                      <td>{incident.actionTaken || "Pending"}</td>
                      <td>
                        <Button variant="outline-primary" size="sm" className="me-1">
                          View
                        </Button>
                        {incident.status === "Under Review" && (
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleResolveIncident(incident.id)}
                            disabled={loading}
                          >
                            {loading ? "Resolving..." : "Resolve"}
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

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Employee Grievances</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Grievance ID</th>
                    <th>Employee</th>
                    <th>Subject</th>
                    <th>Submitted Date</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {grievances.map((grievance) => (
                    <tr key={grievance.id}>
                      <td>
                        <strong>{grievance.id}</strong>
                      </td>
                      <td>
                        <div>
                          <strong>{grievance.employeeName}</strong>
                          <br />
                          <small className="text-muted">{grievance.employeeId}</small>
                        </div>
                      </td>
                      <td>{grievance.subject}</td>
                      <td>{grievance.submittedDate}</td>
                      <td>
                        <Badge
                          bg={
                            grievance.priority === "High"
                              ? "danger"
                              : grievance.priority === "Medium"
                                ? "warning"
                                : "info"
                          }
                        >
                          {grievance.priority}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={grievance.status === "Resolved" ? "success" : "warning"}>{grievance.status}</Badge>
                      </td>
                      <td>
                        <Button variant="outline-primary" size="sm" className="me-1">
                          Review
                        </Button>
                        {grievance.status === "Under Investigation" && (
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleCloseGrievance(grievance.id)}
                            disabled={loading}
                          >
                            {loading ? "Closing..." : "Close"}
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

      <Modal show={showIncidentModal} onHide={() => setShowIncidentModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Report New Incident</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Employee</Form.Label>
                  <Form.Select>
                    <option>Select Employee</option>
                    <option>John Smith (EMP001)</option>
                    <option>Sarah Johnson (EMP002)</option>
                    <option>Mike Davis (EMP003)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Incident Type</Form.Label>
                  <Form.Select>
                    <option>Select Type</option>
                    <option>Safety Violation</option>
                    <option>Attendance</option>
                    <option>Misconduct</option>
                    <option>Policy Violation</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Severity</Form.Label>
                  <Form.Select>
                    <option>Select Severity</option>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date of Incident</Form.Label>
                  <Form.Control type="date" />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={4} placeholder="Provide detailed description of the incident" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowIncidentModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitIncident} disabled={loading}>
            {loading ? "Submitting..." : "Submit Report"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}
