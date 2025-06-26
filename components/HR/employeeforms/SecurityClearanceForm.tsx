import React from "react";
import { Form, Button, Row, Col } from "react-bootstrap";

export default function SecurityClearanceForm() {
  return (
    <Form>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="employee_id">
            <Form.Label>Employee ID</Form.Label>
            <Form.Control type="number" placeholder="Enter employee ID" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="clearance_level">
            <Form.Label>Clearance Level</Form.Label>
            <Form.Control type="text" placeholder="Enter clearance level" />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="badge_id">
            <Form.Label>Badge ID</Form.Label>
            <Form.Control type="text" placeholder="Enter badge ID" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="access_expiry">
            <Form.Label>Access Expiry</Form.Label>
            <Form.Control type="date" />
          </Form.Group>
        </Col>
      </Row>
      <Button variant="primary" type="submit">Submit</Button>
    </Form>
  );
}
