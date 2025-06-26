import React from "react";
import { Form, Button, Row, Col } from "react-bootstrap";

export default function PaymentHistoryForm() {
  return (
    <Form>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="employee_id">
            <Form.Label>Employee ID</Form.Label>
            <Form.Control type="number" placeholder="Enter employee ID" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="pay_period_start">
            <Form.Label>Pay Period Start</Form.Label>
            <Form.Control type="date" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="pay_period_end">
            <Form.Label>Pay Period End</Form.Label>
            <Form.Control type="date" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="gross_amount">
            <Form.Label>Gross Amount</Form.Label>
            <Form.Control type="number" step="0.01" placeholder="Enter gross amount" />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="net_amount">
            <Form.Label>Net Amount</Form.Label>
            <Form.Control type="number" step="0.01" placeholder="Enter net amount" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="payment_date">
            <Form.Label>Payment Date</Form.Label>
            <Form.Control type="date" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="payment_method">
            <Form.Label>Payment Method</Form.Label>
            <Form.Control type="text" placeholder="Enter payment method" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="transaction_reference">
            <Form.Label>Transaction Reference</Form.Label>
            <Form.Control type="text" placeholder="Enter transaction reference" />
          </Form.Group>
        </Col>
      </Row>
      <Button variant="primary" type="submit">Submit</Button>
    </Form>
  );
}
