import React from "react";
import { Form, Button, Row, Col } from "react-bootstrap";

export default function TrainingRecordsForm() {
  return (
    <Form>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="employee_id">
            <Form.Label>Employee ID</Form.Label>
            <Form.Control type="number" placeholder="Enter employee ID" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="training_name">
            <Form.Label>Training Name</Form.Label>
            <Form.Control type="text" placeholder="Enter training name" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="completion_date">
            <Form.Label>Completion Date</Form.Label>
            <Form.Control type="date" />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="refresher_due_date">
            <Form.Label>Refresher Due Date</Form.Label>
            <Form.Control type="date" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="competency_score">
            <Form.Label>Competency Score</Form.Label>
            <Form.Control type="number" step="0.01" placeholder="e.g. 95.00" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="certification_file_url">
            <Form.Label>Certification File URL</Form.Label>
            <Form.Control type="text" placeholder="Enter file URL" />
          </Form.Group>
        </Col>
      </Row>
      <Button variant="primary" type="submit">Submit</Button>
    </Form>
  );
}
