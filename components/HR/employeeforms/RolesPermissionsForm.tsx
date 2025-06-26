import React from "react";
import { Form, Button, Row, Col } from "react-bootstrap";

export default function RolesPermissionsForm() {
  return (
    <Form>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="employee_id">
            <Form.Label>Employee ID</Form.Label>
            <Form.Control type="number" placeholder="Enter employee ID" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="role_name">
            <Form.Label>Role Name</Form.Label>
            <Form.Control type="text" placeholder="Enter role name" />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="permissions">
            <Form.Label>Permissions (JSON)</Form.Label>
            <Form.Control as="textarea" rows={3} placeholder='{"read": true, "write": false}' />
          </Form.Group>
          <Form.Group className="mb-3" controlId="access_rights">
            <Form.Label>Access Rights</Form.Label>
            <Form.Control as="textarea" rows={2} placeholder="Describe access rights" />
          </Form.Group>
        </Col>
      </Row>
      <Button variant="primary" type="submit">Submit</Button>
    </Form>
  );
}
