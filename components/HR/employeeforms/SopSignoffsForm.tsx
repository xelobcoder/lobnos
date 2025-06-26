import React from "react";
import { Form, Button, Row, Col } from "react-bootstrap";

export default function SopSignoffsForm() {
  return (
    <Form>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="employee_id">
            <Form.Label>Employee ID</Form.Label>
            <Form.Control type="number" placeholder="Enter employee ID" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="sop_id">
            <Form.Label>SOP ID</Form.Label>
            <Form.Control type="text" placeholder="Enter SOP ID" />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="signed_on">
            <Form.Label>Signed On</Form.Label>
            <Form.Control type="date" />
          </Form.Group>
        </Col>
      </Row>
      <Button variant="primary" type="submit">Submit</Button>
    </Form>
  );
}
