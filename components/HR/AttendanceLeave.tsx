"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, Nav, Alert, Spinner } from "react-bootstrap"

export default function AttendanceLeave() {
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [activeTab, setActiveTab] = useState("attendance")
  type AttendanceRecord = {
    id?: string | number
    employee_id?: string | number
    employeeId?: string | number
    name?: string
    date?: string
    checkIn?: string
    checkOut?: string
    hours?: number | string
    status?: string
    [key: string]: any
  }

  // TODO: Replace with real user context or props
  const currentUser = {
    employeeId: "EMP001",
    name: "John Smith",
  }

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [leaveRequests, setLeaveRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState({ show: false, message: "", variant: "success" })
  const [leaveForm, setLeaveForm] = useState({
    type: "",
    startDate: "",
    endDate: "",
    reason: "",
  })

  useEffect(() => {
    fetchAttendanceRecords()
    fetchLeaveRequests()
  }, [])

  const fetchAttendanceRecords = async () => {
    try {
      const response = await fetch("/api/attendance")
      const result = await response.json()
      if (result.success) {
        setAttendanceRecords(result.data)
      } else {
        setAttendanceRecords([])
      }
    } catch (error) {
      setAttendanceRecords([])
    }
  }

  const fetchLeaveRequests = async () => {
    try {
      const response = await fetch("/api/leave")
      const result = await response.json()
      if (result.success) {
        setLeaveRequests(result.data)
      }
    } catch (error) {
      showAlert("Failed to fetch leave requests", "danger")
    }
  }

  const handleCheckIn = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: currentUser.employeeId,
          action: "checkIn",
        }),
      })
      const result = await response.json()
      if (result.success) {
        showAlert(result.message, "success")
        fetchAttendanceRecords()
      } else {
        showAlert(result.message, "danger")
      }
    } catch (error) {
      showAlert("Failed to check in", "danger")
    }
    setLoading(false)
  }

  const handleCheckOut = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: currentUser.employeeId,
          action: "checkOut",
        }),
      })
      const result = await response.json()
      if (result.success) {
        showAlert(result.message, "success")
        fetchAttendanceRecords()
      } else {
        showAlert(result.message, "danger")
      }
    } catch (error) {
      showAlert("Failed to check out", "danger")
    }
    setLoading(false)
  }

  const handleLeaveSubmit = async (e) => {
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
        fetchLeaveRequests()
      } else {
        showAlert(result.message, "danger")
      }
    } catch (error) {
      showAlert("Failed to submit leave request", "danger")
    }
    setLoading(false)
  }

  const handleLeaveAction = async (leaveId, action) => {
    setLoading(true)
    try {
      const response = await fetch("/api/leave", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: leaveId,
          status: action === "approve" ? "Approved" : "Rejected",
        }),
      })

      const result = await response.json()
      if (result.success) {
        showAlert(result.message, "success")
        fetchLeaveRequests()
      } else {
        showAlert(result.message, "danger")
      }
    } catch (error) {
      showAlert("Failed to update leave request", "danger")
    }
    setLoading(false)
  }

  const showAlert = (message, variant) => {
    setAlert({ show: true, message, variant })
    setTimeout(() => setAlert({ show: false, message: "", variant: "success" }), 5000)
  }

  const getTodayRecord = () => {
    const today = new Date().toISOString().split("T")[0]
    // Use DB field names (employee_id)
    return attendanceRecords.find((record) => (record.employee_id || record.employeeId) === currentUser.employeeId && record.date === today)
  }

  const todayRecord = getTodayRecord()

  // Map DB fields to UI fields for display
  const mappedAttendanceRecords = attendanceRecords.map((rec) => ({
    ...rec,
    checkIn: rec.checkIn || "-",
    checkOut: rec.checkOut || "-",
    hours: rec.hours != null ? rec.hours : "-",
    status: rec.status || "-",
    date: rec.date ? new Date(rec.date).toLocaleDateString() : "-",
  }))

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
              <h2 className="mb-0">Attendance & Leave Management</h2>
              <p className="text-muted">Track employee attendance and manage leave requests</p>
            </div>
            <div>
              <Button
                variant="success"
                className="me-2"
                onClick={handleCheckIn}
                disabled={loading || (todayRecord && todayRecord.checkIn)}
              >
                {loading ? <Spinner size="sm" /> : "Check In"}
              </Button>
              <Button
                variant="warning"
                className="me-2"
                onClick={handleCheckOut}
                disabled={loading || !todayRecord || todayRecord.checkOut}
              >
                {loading ? <Spinner size="sm" /> : "Check Out"}
              </Button>
              <Button variant="primary" onClick={() => setShowLeaveModal(true)}>
                Apply for Leave
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Today's Status Card */}
      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Body>
              <h5>Today's Status</h5>
              {todayRecord ? (
                <Row>
                  <Col md={3}>
                    <strong>Check In:</strong> {todayRecord.checkIn || "Not checked in"}
                  </Col>
                  <Col md={3}>
                    <strong>Check Out:</strong> {todayRecord.checkOut || "Not checked out"}
                  </Col>
                  <Col md={3}>
                    <strong>Hours Worked:</strong> {todayRecord.hours}h
                  </Col>
                  <Col md={3}>
                    <Badge bg="success">{todayRecord.status}</Badge>
                  </Col>
                </Row>
              ) : (
                <p className="text-muted">No attendance record for today. Please check in.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k || "attendance")}>
                <Nav.Item>
                  <Nav.Link eventKey="attendance">Attendance Records</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="leave">Leave Requests</Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body>
              {activeTab === "attendance" && (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>Name</th>
                      <th>Date</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Hours</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mappedAttendanceRecords.map((record, index) => (
                      <tr key={record.id || index}>
                        <td>{record.employee_id}</td>
                        <td>{record.name}</td>
                        <td>{record.date}</td>
                        <td>{record.checkIn}</td>
                        <td>{record.checkOut}</td>
                        <td>{record.hours}</td>
                        <td>
                          <Badge bg={record.status === "Present" ? "success" : "secondary"}>{record.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}

              {activeTab === "leave" && (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Request ID</th>
                      <th>Employee</th>
                      <th>Type</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Days</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveRequests.map((request) => (
                      <tr key={request.id}>
                        <td>
                          <strong>{request.id}</strong>
                        </td>
                        <td>{request.employeeName}</td>
                        <td>{request.type}</td>
                        <td>{request.startDate}</td>
                        <td>{request.endDate}</td>
                        <td>{request.days}</td>
                        <td>
                          <Badge
                            bg={
                              request.status === "Approved"
                                ? "success"
                                : request.status === "Pending"
                                  ? "warning"
                                  : "danger"
                            }
                          >
                            {request.status}
                          </Badge>
                        </td>
                        <td>
                          {request.status === "Pending" && (
                            <>
                              <Button
                                variant="outline-success"
                                size="sm"
                                className="me-1"
                                onClick={() => handleLeaveAction(request.id, "approve")}
                                disabled={loading}
                              >
                                {loading ? <Spinner size="sm" /> : "Approve"}
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleLeaveAction(request.id, "reject")}
                                disabled={loading}
                              >
                                {loading ? <Spinner size="sm" /> : "Reject"}
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
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
                onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
                required
              >
                <option value="">Select leave type</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Vacation">Vacation</option>
                <option value="Personal Leave">Personal Leave</option>
                <option value="Training">Training</option>
              </Form.Select>
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
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
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
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
                placeholder="Enter reason for leave"
                value={leaveForm.reason}
                onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
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
    </Container>
  )
}
