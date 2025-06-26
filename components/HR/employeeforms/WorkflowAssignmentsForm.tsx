import React from "react";
import { Form, Button, Row, Col } from "react-bootstrap";

export default function WorkflowAssignmentsForm() {
  return (
    <Form>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="employee_id">
            <Form.Label>Employee ID</Form.Label>
            <Form.Control type="number" placeholder="Enter employee ID" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="workflow_name">
            <Form.Label>Workflow Name</Form.Label>
            <Form.Control type="text" placeholder="Enter workflow name" />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="instrument_name">
            <Form.Label>Instrument Name</Form.Label>
            <Form.Control type="text" placeholder="Enter instrument name" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="project_name">
            <Form.Label>Project Name</Form.Label>
            <Form.Control type="text" placeholder="Enter project name" />
          </Form.Group>
        </Col>
      </Row>
      <Button variant="primary" type="submit">Submit</Button>
    </Form>
  );
}
