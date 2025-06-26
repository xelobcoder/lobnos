"use client"

import { useEffect, useState } from "react"
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, InputGroup } from "react-bootstrap"

export default function EmployeeManagement() {
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    role: "",
    hireDate: ""
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([])
  const [positions, setPositions] = useState<{ id: number; title: string }[]>([])

  useEffect(() => {
    async function fetchEmployees() {
      setLoading(true)
      try {
        const res = await fetch("/api/employee")
        const data = await res.json()
        if (Array.isArray(data)) {
          setEmployees(data)
        } else {
          setEmployees([])
        }
      } catch (e) {
        setEmployees([])
      } finally {
        setLoading(false)
      }
    }
    fetchEmployees()
  }, [])

  useEffect(() => {
    async function fetchMeta() {
      try {
        const res = await fetch("/api/employee/meta")
        const data = await res.json()
        setDepartments(Array.isArray(data.departments) ? data.departments : [])
        setPositions(Array.isArray(data.positions) ? data.positions : [])
        console.log("Departments:", data.departments)
        console.log("Positions:", data.positions)
      } catch (err) {
        console.error("Failed to fetch meta data", err)
      }
    }
    fetchMeta()
  }, [])

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Accept textarea as well for Form.Control
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSaveEmployee = async () => {
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.success) {
        setShowModal(false)
        setForm({ firstName: "", lastName: "", email: "", phone: "", department: "", role: "", hireDate: "" })
        // Refresh employees
        const res = await fetch("/api/employee")
        const employeesData = await res.json()
        setEmployees(Array.isArray(employeesData) ? employeesData : [])
      } else {
        setError(data.error || "Failed to add employee.")
      }
    } catch (e) {
      setError("Failed to add employee.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-0">Employee Management</h2>
              <p className="text-muted">Manage employee profiles and information</p>
            </div>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              Add New Employee
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>🔍</InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Role</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Hire Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-4">
                    {loading ? "Loading..." : "No employees found."}
                  </td>
                </tr>
              )}
              {filteredEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td>
                    <strong>{employee.id}</strong>
                  </td>
                  <td>{employee.name}</td>
                  <td>{employee.department}</td>
                  <td>{employee.role}</td>
                  <td>
                    <div>
                      <small className="d-block">{employee.email}</small>
                      <small className="text-muted">{employee.phone}</small>
                    </div>
                  </td>
                  <td>
                    <Badge bg={employee.status === "Active" ? "success" : "secondary"}>{employee.status}</Badge>
                  </td>
                  <td>{employee.hireDate}</td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-1">
                      View
                    </Button>
                    <Button variant="outline-secondary" size="sm">
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Employee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <div className="text-danger mb-2">{error}</div>}
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control name="firstName" type="text" placeholder="Enter first name" value={form.firstName} onChange={handleFormChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control name="lastName" type="text" placeholder="Enter last name" value={form.lastName} onChange={handleFormChange} />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control name="email" type="email" placeholder="Enter email" value={form.email} onChange={handleFormChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control name="phone" type="tel" placeholder="Enter phone number" value={form.phone} onChange={handleFormChange} />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Department</Form.Label>
                  <Form.Select name="department" value={form.department} onChange={handleFormChange}>
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select name="role" value={form.role} onChange={handleFormChange}>
                    <option value="">Select Role</option>
                    {positions.map((p) => (
                      <option key={p.id} value={p.title}>{p.title}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Hire Date</Form.Label>
              <Form.Control name="hireDate" type="date" value={form.hireDate} onChange={handleFormChange} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveEmployee} disabled={saving}>
            {saving ? "Saving..." : "Save Employee"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}
