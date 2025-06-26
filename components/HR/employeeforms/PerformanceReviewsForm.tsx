import React from "react";
import { Form, Button, Row, Col } from "react-bootstrap";

export default function PerformanceReviewsForm() {
  return (
    <Form>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="employee_id">
            <Form.Label>Employee ID</Form.Label>
            <Form.Control type="number" placeholder="Enter employee ID" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="review_period_start">
            <Form.Label>Review Period Start</Form.Label>
            <Form.Control type="date" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="review_period_end">
            <Form.Label>Review Period End</Form.Label>
            <Form.Control type="date" />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="reviewer_name">
            <Form.Label>Reviewer Name</Form.Label>
            <Form.Control type="text" placeholder="Enter reviewer name" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="score">
            <Form.Label>Score</Form.Label>
            <Form.Control type="number" step="0.01" placeholder="e.g. 95.00" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="comments">
            <Form.Label>Comments</Form.Label>
            <Form.Control as="textarea" rows={2} placeholder="Enter comments" />
          </Form.Group>
        </Col>
      </Row>
      <Button variant="primary" type="submit">Submit</Button>
    </Form>
  );
}
