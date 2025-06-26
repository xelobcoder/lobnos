import React from "react";
import { Form, Button, Row, Col } from "react-bootstrap";

export default function AuditLogsForm() {
  return (
    <Form>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="employee_id">
            <Form.Label>Employee ID</Form.Label>
            <Form.Control type="number" placeholder="Enter employee ID" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="action">
            <Form.Label>Action</Form.Label>
            <Form.Control type="text" placeholder="Enter action" />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="timestamp">
            <Form.Label>Timestamp</Form.Label>
            <Form.Control type="datetime-local" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="digital_signature">
            <Form.Label>Digital Signature</Form.Label>
            <Form.Control type="text" placeholder="Enter digital signature" />
          </Form.Group>
        </Col>
      </Row>
      <Button variant="primary" type="submit">Submit</Button>
    </Form>
  );
}
