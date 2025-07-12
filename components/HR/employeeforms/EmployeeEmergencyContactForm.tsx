import React, { useState } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import { z } from "zod";

const emergencyContactSchema = z.object({
	employeeid: z.string().min(1, "Employee is required"),
	contactname: z.string().min(1, "Contact name is required"),
	relationship: z.string().optional(),
	contactphone: z.string().optional(),
	contactemail: z.string().email("Invalid email").optional(),
});

type EmergencyContactFormData = z.infer<typeof emergencyContactSchema>;
type EmergencyContactFormErrors = Partial<Record<keyof EmergencyContactFormData, string>>;

export default function EmployeeEmergencyContactForm({ employees }: { employees: { employeeid: number, name: string }[] }) {
	const [formData, setFormData] = useState<EmergencyContactFormData>({ employeeid: "", contactname: "", relationship: "", contactphone: "", contactemail: "" });
	const [errors, setErrors] = useState<EmergencyContactFormErrors>({});

	const handleChange: React.ChangeEventHandler<any> = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const result = emergencyContactSchema.safeParse(formData);
		if (!result.success) {
			const fieldErrors: EmergencyContactFormErrors = {};
			result.error.errors.forEach((err) => {
				if (err.path && err.path[0]) fieldErrors[err.path[0] as keyof EmergencyContactFormData] = err.message;
			});
			setErrors(fieldErrors);
		} else {
			setErrors({});
			// Submit logic here
			alert("Emergency contact saved!");
		}
	};

	return (
		<Form onSubmit={handleSubmit}>
			<Row>
				<Col md={6}>
					<Form.Group className="mb-3" controlId="employeeid">
						<Form.Label>Employee</Form.Label>
						<Form.Select name="employeeid" value={formData.employeeid} onChange={handleChange} isInvalid={!!errors.employeeid}>
							<option value="">Select employee</option>
							{employees.map(emp => (
								<option key={emp.employeeid} value={emp.employeeid}>{emp.name}</option>
							))}
						</Form.Select>
						<Form.Control.Feedback type="invalid">{errors.employeeid}</Form.Control.Feedback>
					</Form.Group>
					<Form.Group className="mb-3" controlId="contactname">
						<Form.Label>Contact Name</Form.Label>
						<Form.Control name="contactname" type="text" placeholder="Enter contact name" value={formData.contactname} onChange={handleChange} isInvalid={!!errors.contactname} />
						<Form.Control.Feedback type="invalid">{errors.contactname}</Form.Control.Feedback>
					</Form.Group>
					<Form.Group className="mb-3" controlId="relationship">
						<Form.Label>Relationship</Form.Label>
						<Form.Control name="relationship" type="text" placeholder="Enter relationship" value={formData.relationship || ""} onChange={handleChange} />
					</Form.Group>
				</Col>
				<Col md={6}>
					<Form.Group className="mb-3" controlId="contactphone">
						<Form.Label>Contact Phone</Form.Label>
						<Form.Control name="contactphone" type="text" placeholder="Enter contact phone" value={formData.contactphone || ""} onChange={handleChange} />
					</Form.Group>
					<Form.Group className="mb-3" controlId="contactemail">
						<Form.Label>Contact Email</Form.Label>
						<Form.Control name="contactemail" type="email" placeholder="Enter contact email" value={formData.contactemail || ""} onChange={handleChange} isInvalid={!!errors.contactemail} />
						<Form.Control.Feedback type="invalid">{errors.contactemail}</Form.Control.Feedback>
					</Form.Group>
				</Col>
			</Row>
			<Button variant="primary" type="submit">Save Contact</Button>
		</Form>
	);
}
