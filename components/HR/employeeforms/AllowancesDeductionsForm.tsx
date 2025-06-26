import React from "react";
import { Form, Button, Row, Col } from "react-bootstrap";


export default function AllowancesDeductionsForm() {
    return (
        <>
            <Form className="bg-white ">
                <Row>
                    <Form.Group className="mb-3" controlId="type">
                        <Form.Label>Type</Form.Label>
                        <Form.Select>
                            <option>Allowance</option>
                            <option>Deduction</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="category">
                        <Form.Label>Category</Form.Label>
                        <Form.Control type="text" placeholder="Enter category" />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="amount">
                        <Form.Label>Amount</Form.Label>
                        <Form.Control type="number" step="0.01" placeholder="Enter amount" />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="applicable_month">
                        <Form.Label>Applicable Month</Form.Label>
                        <Form.Control type="month" />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="notes">
                        <Form.Label>Notes</Form.Label>
                        <Form.Control as="textarea" rows={2} placeholder="Enter notes" />
                    </Form.Group>

                </Row>
                <Button variant="primary" type="submit">Submit</Button>
            </Form>
        </>
    );
}
