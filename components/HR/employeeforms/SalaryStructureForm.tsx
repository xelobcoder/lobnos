'use client'
import React from "react";
import { Form, Button, Row, Col } from "react-bootstrap";

export default function SalaryStructureForm() {
  return (
    <Form>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="employee_id">
            <Form.Label>Employee ID</Form.Label>
            <Form.Control type="number" placeholder="Enter employee ID" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="pay_grade">
            <Form.Label>Pay Grade</Form.Label>
            <Form.Control type="text" placeholder="Enter pay grade" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="base_salary">
            <Form.Label>Base Salary</Form.Label>
            <Form.Control type="number" step="0.01" placeholder="Enter base salary" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="currency">
            <Form.Label>Currency</Form.Label>
            <Form.Control type="text" placeholder="Enter currency (e.g. USD)" />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="payment_frequency">
            <Form.Label>Payment Frequency</Form.Label>
            <Form.Select>
              <option>Monthly</option>
              <option>Biweekly</option>
              <option>Weekly</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3" controlId="tax_deduction_rate">
            <Form.Label>Tax Deduction Rate (%)</Form.Label>
            <Form.Control type="number" step="0.01" placeholder="e.g. 10.00" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="effective_from">
            <Form.Label>Effective From</Form.Label>
            <Form.Control type="date" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="effective_to">
            <Form.Label>Effective To</Form.Label>
            <Form.Control type="date" />
          </Form.Group>
        </Col>
      </Row>
      <Button variant="primary" type="submit">Submit</Button>
    </Form>
  );
}
