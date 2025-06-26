import React from "react";
import { Form, Button, Row, Col } from "react-bootstrap";

export default function EmploymentDocumentsForm() {
  return (
    <Form>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="employee_id">
            <Form.Label>Employee ID</Form.Label>
            <Form.Control type="number" placeholder="Enter employee ID" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="document_type">
            <Form.Label>Document Type</Form.Label>
            <Form.Control type="text" placeholder="Enter document type" />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="document_url">
            <Form.Label>Document URL</Form.Label>
            <Form.Control type="text" placeholder="Enter document URL" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="uploaded_on">
            <Form.Label>Uploaded On</Form.Label>
            <Form.Control type="date" />
          </Form.Group>
        </Col>
      </Row>
      <Button variant="primary" type="submit">Submit</Button>
    </Form>
  );
}
