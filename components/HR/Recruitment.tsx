"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, Nav, Alert, Spinner } from "react-bootstrap"

export default function Recruitment() {
  const [showJobModal, setShowJobModal] = useState(false)
  const [showCandidateModal, setShowCandidateModal] = useState(false)
  const [activeTab, setActiveTab] = useState("jobs")
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState({ show: false, message: "", variant: "success" })
  const [jobPostings, setJobPostings] = useState([])
  const [candidates, setCandidates] = useState([])
  const [jobForm, setJobForm] = useState({
    title: "",
    department: "",
    description: "",
    requirements: "",
    salaryMin: "",
    salaryMax: "",
    deadline: "",
    employmentType: "Full-time",
  })
  const [candidateForm, setCandidateForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    experience: "",
    coverLetter: "",
  })

  useEffect(() => {
    fetchJobPostings()
    fetchCandidates()
  }, [])

  const fetchJobPostings = async () => {
    try {
      // Simulate API call
      const mockJobs = [
        {
          id: "JOB001",
          title: "Senior Lab Technician",
          department: "Quality Control",
          status: "Open",
          applicants: 12,
          deadline: "2024-02-15",
          posted: "2024-01-15",
          salaryMin: 50000,
          salaryMax: 65000,
          employmentType: "Full-time",
        },
        {
          id: "JOB002",
          title: "Microbiologist",
          department: "Microbiology",
          status: "Open",
          applicants: 8,
          deadline: "2024-01-30",
          posted: "2024-01-01",
          salaryMin: 45000,
          salaryMax: 60000,
          employmentType: "Full-time",
        },
        {
          id: "JOB003",
          title: "Research Scientist",
          department: "R&D",
          status: "Closed",
          applicants: 15,
          deadline: "2024-01-20",
          posted: "2023-12-20",
          salaryMin: 60000,
          salaryMax: 85000,
          employmentType: "Full-time",
        },
      ]
      setJobPostings(mockJobs)
    } catch (error) {
      showAlert("Failed to fetch job postings", "danger")
    }
  }

  const fetchCandidates = async () => {
    try {
      // Simulate API call
      const mockCandidates = [
        {
          id: "CAN001",
          name: "Alice Wilson",
          position: "Senior Lab Technician",
          status: "Interview Scheduled",
          appliedDate: "2024-01-20",
          experience: "5 years",
          email: "alice.wilson@email.com",
          phone: "+1-555-0301",
        },
        {
          id: "CAN002",
          name: "Bob Martinez",
          position: "Senior Lab Technician",
          status: "Under Review",
          appliedDate: "2024-01-18",
          experience: "3 years",
          email: "bob.martinez@email.com",
          phone: "+1-555-0302",
        },
        {
          id: "CAN003",
          name: "Carol Davis",
          position: "Microbiologist",
          status: "Interviewed",
          appliedDate: "2024-01-15",
          experience: "7 years",
          email: "carol.davis@email.com",
          phone: "+1-555-0303",
        },
      ]
      setCandidates(mockCandidates)
    } catch (error) {
      showAlert("Failed to fetch candidates", "danger")
    }
  }

  const handleJobSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newJob = {
        id: `JOB${String(jobPostings.length + 1).padStart(3, "0")}`,
        title: jobForm.title,
        department: jobForm.department,
        status: "Open",
        applicants: 0,
        deadline: jobForm.deadline,
        posted: new Date().toISOString().split("T")[0],
        salaryMin: Number.parseInt(jobForm.salaryMin),
        salaryMax: Number.parseInt(jobForm.salaryMax),
        employmentType: jobForm.employmentType,
      }

      setJobPostings([...jobPostings, newJob])
      setShowJobModal(false)
      setJobForm({
        title: "",
        department: "",
        description: "",
        requirements: "",
        salaryMin: "",
        salaryMax: "",
        deadline: "",
        employmentType: "Full-time",
      })
      showAlert("Job posting created successfully!", "success")
    } catch (error) {
      showAlert("Failed to create job posting", "danger")
    }
    setLoading(false)
  }

  const handleCandidateSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newCandidate = {
        id: `CAN${String(candidates.length + 1).padStart(3, "0")}`,
        name: `${candidateForm.firstName} ${candidateForm.lastName}`,
        position: candidateForm.position,
        status: "Applied",
        appliedDate: new Date().toISOString().split("T")[0],
        experience: candidateForm.experience,
        email: candidateForm.email,
        phone: candidateForm.phone,
      }

      setCandidates([...candidates, newCandidate])
      setShowCandidateModal(false)
      setCandidateForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        position: "",
        experience: "",
        coverLetter: "",
      })
      showAlert("Candidate application submitted successfully!", "success")
    } catch (error) {
      showAlert("Failed to submit application", "danger")
    }
    setLoading(false)
  }

  const handleJobAction = async (jobId, action) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (action === "close") {
        setJobPostings(jobPostings.map((job) => (job.id === jobId ? { ...job, status: "Closed" } : job)))
        showAlert("Job posting closed successfully", "success")
      } else if (action === "reopen") {
        setJobPostings(jobPostings.map((job) => (job.id === jobId ? { ...job, status: "Open" } : job)))
        showAlert("Job posting reopened successfully", "success")
      }
    } catch (error) {
      showAlert("Failed to update job posting", "danger")
    }
    setLoading(false)
  }

  const handleCandidateAction = async (candidateId, action) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      let newStatus = ""
      let message = ""

      switch (action) {
        case "schedule":
          newStatus = "Interview Scheduled"
          message = "Interview scheduled successfully"
          break
        case "interview":
          newStatus = "Interviewed"
          message = "Candidate marked as interviewed"
          break
        case "offer":
          newStatus = "Offered"
          message = "Job offer sent to candidate"
          break
        case "hire":
          newStatus = "Hired"
          message = "Candidate hired successfully"
          break
        case "reject":
          newStatus = "Rejected"
          message = "Candidate application rejected"
          break
        default:
          newStatus = "Under Review"
          message = "Candidate status updated"
      }

      setCandidates(
        candidates.map((candidate) => (candidate.id === candidateId ? { ...candidate, status: newStatus } : candidate)),
      )
      showAlert(message, "success")
    } catch (error) {
      showAlert("Failed to update candidate status", "danger")
    }
    setLoading(false)
  }

  const showAlert = (message, variant) => {
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
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-0">Recruitment Management</h2>
              <p className="text-muted">Manage job postings and candidate applications</p>
            </div>
            <div>
              <Button variant="success" className="me-2" onClick={() => setShowCandidateModal(true)}>
                Add Candidate
              </Button>
              <Button variant="primary" onClick={() => setShowJobModal(true)}>
                Create Job Posting
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k || "jobs")}>
                <Nav.Item>
                  <Nav.Link eventKey="jobs">Job Postings</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="candidates">Candidates</Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body>
              {activeTab === "jobs" && (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Job ID</th>
                      <th>Title</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Applicants</th>
                      <th>Salary Range</th>
                      <th>Deadline</th>
                      <th>Posted Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobPostings.map((job) => (
                      <tr key={job.id}>
                        <td>
                          <strong>{job.id}</strong>
                        </td>
                        <td>{job.title}</td>
                        <td>{job.department}</td>
                        <td>
                          <Badge bg={job.status === "Open" ? "success" : "secondary"}>{job.status}</Badge>
                        </td>
                        <td>{job.applicants}</td>
                        <td>
                          ${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()}
                        </td>
                        <td>{job.deadline}</td>
                        <td>{job.posted}</td>
                        <td>
                          <Button variant="outline-primary" size="sm" className="me-1">
                            View
                          </Button>
                          <Button variant="outline-secondary" size="sm" className="me-1">
                            Edit
                          </Button>
                          {job.status === "Open" ? (
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => handleJobAction(job.id, "close")}
                              disabled={loading}
                            >
                              {loading ? <Spinner size="sm" /> : "Close"}
                            </Button>
                          ) : (
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleJobAction(job.id, "reopen")}
                              disabled={loading}
                            >
                              {loading ? <Spinner size="sm" /> : "Reopen"}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}

              {activeTab === "candidates" && (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Candidate ID</th>
                      <th>Name</th>
                      <th>Applied Position</th>
                      <th>Status</th>
                      <th>Experience</th>
                      <th>Applied Date</th>
                      <th>Contact</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((candidate) => (
                      <tr key={candidate.id}>
                        <td>
                          <strong>{candidate.id}</strong>
                        </td>
                        <td>{candidate.name}</td>
                        <td>{candidate.position}</td>
                        <td>
                          <Badge
                            bg={
                              candidate.status === "Hired"
                                ? "success"
                                : candidate.status === "Interview Scheduled"
                                  ? "warning"
                                  : candidate.status === "Rejected"
                                    ? "danger"
                                    : "info"
                            }
                          >
                            {candidate.status}
                          </Badge>
                        </td>
                        <td>{candidate.experience}</td>
                        <td>{candidate.appliedDate}</td>
                        <td>
                          <small className="d-block">{candidate.email}</small>
                          <small className="text-muted">{candidate.phone}</small>
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {candidate.status === "Applied" && (
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleCandidateAction(candidate.id, "schedule")}
                                disabled={loading}
                              >
                                Schedule
                              </Button>
                            )}
                            {candidate.status === "Interview Scheduled" && (
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleCandidateAction(candidate.id, "interview")}
                                disabled={loading}
                              >
                                Interviewed
                              </Button>
                            )}
                            {candidate.status === "Interviewed" && (
                              <>
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => handleCandidateAction(candidate.id, "offer")}
                                  disabled={loading}
                                >
                                  Offer
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleCandidateAction(candidate.id, "reject")}
                                  disabled={loading}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {candidate.status === "Offered" && (
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleCandidateAction(candidate.id, "hire")}
                                disabled={loading}
                              >
                                Hire
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
        </Col>
      </Row>

      {/* Job Posting Modal */}
      <Modal show={showJobModal} onHide={() => setShowJobModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create Job Posting</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleJobSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Job Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter job title"
                value={jobForm.title}
                onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                required
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Department</Form.Label>
                  <Form.Select
                    value={jobForm.department}
                    onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Quality Control">Quality Control</option>
                    <option value="Microbiology">Microbiology</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="R&D">Research & Development</option>
                    <option value="Administration">Administration</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Employment Type</Form.Label>
                  <Form.Select
                    value={jobForm.employmentType}
                    onChange={(e) => setJobForm({ ...jobForm, employmentType: e.target.value })}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Minimum Salary</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter minimum salary"
                    value={jobForm.salaryMin}
                    onChange={(e) => setJobForm({ ...jobForm, salaryMin: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Maximum Salary</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter maximum salary"
                    value={jobForm.salaryMax}
                    onChange={(e) => setJobForm({ ...jobForm, salaryMax: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Application Deadline</Form.Label>
              <Form.Control
                type="date"
                value={jobForm.deadline}
                onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Job Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Enter job description"
                value={jobForm.description}
                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Required Qualifications</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter required qualifications"
                value={jobForm.requirements}
                onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowJobModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? <Spinner size="sm" /> : "Post Job"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Candidate Application Modal */}
      <Modal show={showCandidateModal} onHide={() => setShowCandidateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add Candidate Application</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCandidateSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter first name"
                    value={candidateForm.firstName}
                    onChange={(e) => setCandidateForm({ ...candidateForm, firstName: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter last name"
                    value={candidateForm.lastName}
                    onChange={(e) => setCandidateForm({ ...candidateForm, lastName: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={candidateForm.email}
                    onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="Enter phone number"
                    value={candidateForm.phone}
                    onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Applied Position</Form.Label>
                  <Form.Select
                    value={candidateForm.position}
                    onChange={(e) => setCandidateForm({ ...candidateForm, position: e.target.value })}
                    required
                  >
                    <option value="">Select Position</option>
                    <option value="Senior Lab Technician">Senior Lab Technician</option>
                    <option value="Lab Technician">Lab Technician</option>
                    <option value="Microbiologist">Microbiologist</option>
                    <option value="Research Scientist">Research Scientist</option>
                    <option value="Quality Manager">Quality Manager</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Years of Experience</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., 3 years"
                    value={candidateForm.experience}
                    onChange={(e) => setCandidateForm({ ...candidateForm, experience: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Cover Letter</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Enter cover letter or additional notes"
                value={candidateForm.coverLetter}
                onChange={(e) => setCandidateForm({ ...candidateForm, coverLetter: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCandidateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? <Spinner size="sm" /> : "Add Candidate"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  )
}
