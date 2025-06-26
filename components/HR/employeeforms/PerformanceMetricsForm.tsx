import React from "react";
import { Form, Button, Row, Col } from "react-bootstrap";

export default function PerformanceMetricsForm() {
  return (
    <Form>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="employee_id">
            <Form.Label>Employee ID</Form.Label>
            <Form.Control type="number" placeholder="Enter employee ID" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="samples_processed">
            <Form.Label>Samples Processed</Form.Label>
            <Form.Control type="number" placeholder="Enter samples processed" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="errors_reported">
            <Form.Label>Errors Reported</Form.Label>
            <Form.Control type="number" placeholder="Enter errors reported" />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="qa_outcomes">
            <Form.Label>QA Outcomes</Form.Label>
            <Form.Control as="textarea" rows={2} placeholder="Describe QA outcomes" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="report_date">
            <Form.Label>Report Date</Form.Label>
            <Form.Control type="date" />
          </Form.Group>
        </Col>
      </Row>
      <Button variant="primary" type="submit">Submit</Button>
    </Form>
  );
}
