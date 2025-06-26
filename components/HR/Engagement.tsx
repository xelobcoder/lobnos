"use client"

import { useState } from "react"
import { Container, Row, Col, Card, Button, ProgressBar, Badge, Table, Alert } from "react-bootstrap"

export default function Engagement() {
  const [showSurveyModal, setShowSurveyModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState({ show: false, message: "", variant: "success" })

  const engagementMetrics = {
    overallSatisfaction: 78,
    workLifeBalance: 82,
    careerDevelopment: 65,
    compensation: 71,
    management: 75,
  }

  const surveys = [
    {
      id: "SUR001",
      title: "Annual Employee Satisfaction Survey",
      status: "Active",
      responses: 142,
      totalEmployees: 156,
      endDate: "2024-02-15",
    },
    {
      id: "SUR002",
      title: "Work-Life Balance Assessment",
      status: "Completed",
      responses: 156,
      totalEmployees: 156,
      endDate: "2024-01-31",
    },
  ]

  const recognitions = [
    {
      id: "REC001",
      employee: "Sarah Johnson",
      recognizedBy: "Mike Davis",
      type: "Employee of the Month",
      date: "2024-01-15",
      reason: "Outstanding performance in quality control",
    },
    {
      id: "REC002",
      employee: "John Smith",
      recognizedBy: "Lisa Brown",
      type: "Team Player Award",
      date: "2024-01-10",
      reason: "Excellent collaboration on lab safety initiative",
    },
  ]

  const handleCreateSurvey = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "engagement_survey" }),
      })

      if (response.ok) {
        setAlert({ show: true, message: "Survey created successfully!", variant: "success" })
      }
    } catch (error) {
      setAlert({ show: true, message: "Error creating survey", variant: "danger" })
    } finally {
      setLoading(false)
    }
  }

  const handleRecognizeEmployee = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/recognition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "employee_recognition" }),
      })

      if (response.ok) {
        setAlert({ show: true, message: "Employee recognition submitted!", variant: "success" })
      }
    } catch (error) {
      setAlert({ show: true, message: "Error submitting recognition", variant: "danger" })
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
              <h2 className="mb-0">Employee Engagement</h2>
              <p className="text-muted">Monitor and improve employee satisfaction and engagement</p>
            </div>
            <div>
              <Button variant="success" className="me-2" onClick={handleCreateSurvey} disabled={loading}>
                {loading ? "Creating..." : "Create Survey"}
              </Button>
              <Button variant="primary" onClick={handleRecognizeEmployee} disabled={loading}>
                {loading ? "Processing..." : "Recognize Employee"}
              </Button>
            </div>
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
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Engagement Metrics</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                {Object.entries(engagementMetrics).map(([key, value]) => (
                  <Col md={2} key={key} className="mb-3">
                    <div className="text-center">
                      <h4
                        className={`mb-1 ${value >= 80 ? "text-success" : value >= 70 ? "text-warning" : "text-danger"}`}
                      >
                        {value}%
                      </h4>
                      <p className="mb-2 text-capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</p>
                      <ProgressBar
                        variant={value >= 80 ? "success" : value >= 70 ? "warning" : "danger"}
                        now={value}
                        style={{ height: "6px" }}
                      />
                    </div>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Active Surveys</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Survey ID</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Response Rate</th>
                    <th>End Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {surveys.map((survey) => (
                    <tr key={survey.id}>
                      <td>
                        <strong>{survey.id}</strong>
                      </td>
                      <td>{survey.title}</td>
                      <td>
                        <Badge bg={survey.status === "Active" ? "success" : "secondary"}>{survey.status}</Badge>
                      </td>
                      <td>
                        <div>
                          <span>
                            {survey.responses}/{survey.totalEmployees}
                          </span>
                          <ProgressBar
                            variant="info"
                            now={(survey.responses / survey.totalEmployees) * 100}
                            style={{ height: "4px" }}
                            className="mt-1"
                          />
                        </div>
                      </td>
                      <td>{survey.endDate}</td>
                      <td>
                        <Button variant="outline-primary" size="sm" className="me-1">
                          View Results
                        </Button>
                        {survey.status === "Active" && (
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
        </Col>
        <Col md={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Quick Stats</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Participation Rate</span>
                  <strong>91%</strong>
                </div>
                <ProgressBar variant="success" now={91} style={{ height: "6px" }} />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Retention Rate</span>
                  <strong>94%</strong>
                </div>
                <ProgressBar variant="info" now={94} style={{ height: "6px" }} />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Referral Rate</span>
                  <strong>67%</strong>
                </div>
                <ProgressBar variant="warning" now={67} style={{ height: "6px" }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Recent Recognition</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Recognition ID</th>
                    <th>Employee</th>
                    <th>Recognized By</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Reason</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recognitions.map((recognition) => (
                    <tr key={recognition.id}>
                      <td>
                        <strong>{recognition.id}</strong>
                      </td>
                      <td>{recognition.employee}</td>
                      <td>{recognition.recognizedBy}</td>
                      <td>
                        <Badge bg="success">{recognition.type}</Badge>
                      </td>
                      <td>{recognition.date}</td>
                      <td>{recognition.reason}</td>
                      <td>
                        <Button variant="outline-primary" size="sm">
                          View Details
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
