import React from "react";
import { Form, Button, Row, Col } from "react-bootstrap";

export default function LoginCredentialsForm() {
  return (
    <Form>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="employee_id">
            <Form.Label>Employee ID</Form.Label>
            <Form.Control type="number" placeholder="Enter employee ID" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" placeholder="Enter password" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="pin">
            <Form.Label>PIN</Form.Label>
            <Form.Control type="number" placeholder="Enter 4-digit PIN" maxLength={4} />
          </Form.Group>
          <Form.Group className="mb-3" controlId="authentication_method">
            <Form.Label>Authentication Method</Form.Label>
            <Form.Control type="text" placeholder="e.g. password, OTP" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="account_status">
            <Form.Label>Account Status</Form.Label>
            <Form.Select>
              <option>Active</option>
              <option>Inactive</option>
              <option>Locked</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3" controlId="activation">
            <Form.Check type="checkbox" label="Activated" />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="refresh_token">
            <Form.Label>Refresh Token</Form.Label>
            <Form.Control type="text" placeholder="Enter refresh token" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="last_login">
            <Form.Label>Last Login</Form.Label>
            <Form.Control type="datetime-local" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="email_authenticated">
            <Form.Check type="checkbox" label="Email Authenticated" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="date_created">
            <Form.Label>Date Created</Form.Label>
            <Form.Control type="date" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="time_created">
            <Form.Label>Time Created</Form.Label>
            <Form.Control type="time" step="0.001" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="updated_on">
            <Form.Label>Updated On</Form.Label>
            <Form.Control type="datetime-local" />
          </Form.Group>
        </Col>
      </Row>
      <Button variant="primary" type="submit">Submit</Button>
    </Form>
  );
}
