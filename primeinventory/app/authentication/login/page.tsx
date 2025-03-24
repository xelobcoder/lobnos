"use client";

import { useState } from "react";
import { validateLoginForm } from "../../../components/inventory/UtilLib/serverActions/Authentication";
import { Form, Button, Row, Col } from "react-bootstrap";
import { redirect } from "next/navigation";

export default function AuthenticationLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<{ email?: string[]; password?: string[] }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {

            const formData = { email, password };
            const validationResult = await validateLoginForm(formData);

            if (validationResult?.errors) {
                setErrors(validationResult.errors);
                setIsSubmitting(false);

            } else {
                console.log("Form is valid, proceed with login...");
                // Call API to authenticate the user
                console.log(validationResult);
                setIsSubmitting(false);
                alert(validationResult.message)
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Row className="mx-3">
            <Col xs={12} md={6} lg={3} className="mx-auto bg-white p-3 border  border-secondary-subtle rounded my-lg-5">
                <Form onSubmit={handleSubmit} autoComplete="off">
                    <Form.Group controlId="email" className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            className="custom-input "
                            type="email"
                            placeholder="Enter email"
                            value={email}
                            autoComplete="off"
                            onChange={(e) => setEmail(e.target.value)}
                            isInvalid={!!errors.email}
                        />
                        {errors.email && (
                            <Form.Control.Feedback type="invalid">
                                {errors.email.join(", ")}
                            </Form.Control.Feedback>
                        )}
                    </Form.Group>
                    <Form.Group controlId="password" className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            autoComplete="off"
                            className="custom-input border-2 border-primary"
                            onChange={(e) => setPassword(e.target.value)}
                            isInvalid={!!errors.password}
                        />
                        {errors.password && (
                            <Form.Control.Feedback type="invalid">
                                {errors.password.join(", ")}
                            </Form.Control.Feedback>
                        )}
                    </Form.Group>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={isSubmitting}
                        className="w-100"
                    >
                        {isSubmitting ? "Logging in..." : "Login"}
                    </Button>
                </Form>
            </Col>
        </Row>
    );
}
