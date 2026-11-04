'use client'
import React, { useEffect, useState } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import { z } from "zod";
import { toast } from 'react-toastify'
import { BranchType } from "../../../app/settings/branches/page";
import { getBranches } from "../../Auth/customFetch";

const employeeSchema = z.object({
    username: z.string().min(1, "Username is required"),
    designation: z.enum(["Mr", "Mrs", "Ms", "Dr", "Prof"]).default("Mr"),
    firstname: z.string().min(1, "First name is required"),
    middlename: z.string().optional(),
    lastname: z.string().min(1, "Last name is required"),
    jobtitle: z.string().optional(),
    department: z.string().optional(),
    email: z.string().email("Invalid email address"),
    mobile: z.string().optional(),
    alternativemobile: z.string().optional(),
    dob: z.string().optional(),
    worklocation: z.string().optional(),
    employmenttype: z.enum(["Full-time", "Part-time", "Contractor", "Intern"]).default("Full-time"),
    startdate: z.string().optional(),
    enddate: z.string().optional(),
    branchid: z.string().optional(),
    imageurl: z.string().optional(),
    ssnitnumber: z.string().optional(),
    taxid: z.string().optional(),
    nationalid: z.string().optional(),
    passportnumber: z.string().optional(),
    gender: z.enum(["Male", "Female", "Other"]).optional(),
    address: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;
type EmployeeFormErrors = Partial<Record<keyof EmployeeFormData, string>>;

export default function EmployeesForm() {
    const [formData, setFormData] = useState<EmployeeFormData>({} as EmployeeFormData);
    const [errors, setErrors] = useState<EmployeeFormErrors>({});
    const [branches, setBranches] = useState<BranchType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        try {
            getBranches(setBranches, null, setLoading);
        } catch (err) {
            toast.error("Failed to fetch branches");
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        const result = employeeSchema.safeParse(formData);
        if (!result.success) {
            const fieldErrors: EmployeeFormErrors = {};
            result.error.errors.forEach((err) => {
                if (err.path && err.path[0]) fieldErrors[err.path[0] as keyof EmployeeFormData] = err.message;
            });
            setErrors(fieldErrors);
        } else {
            setErrors({});

            alert("Form submitted successfully!");
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            {/* Personal Information */}
            <h5 className="mt-3 mb-2">Personal Information</h5>
            <hr />
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="username">
                        <Form.Label>Username</Form.Label>
                        <Form.Control name="username" type="text" placeholder="Enter username" value={formData.username || ""} onChange={handleChange} isInvalid={!!errors.username} />
                        <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="designation">
                        <Form.Label>Designation</Form.Label>
                        <Form.Select name="designation" value={formData.designation || "Mr"} onChange={handleChange} isInvalid={!!errors.designation}>
                            <option>Mr</option>
                            <option>Mrs</option>
                            <option>Ms</option>
                            <option>Dr</option>
                            <option>Prof</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">{errors.designation}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="firstname">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control name="firstname" type="text" placeholder="Enter first name" value={formData.firstname || ""} onChange={handleChange} isInvalid={!!errors.firstname} />
                        <Form.Control.Feedback type="invalid">{errors.firstname}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="middlename">
                        <Form.Label>Middle Name</Form.Label>
                        <Form.Control name="middlename" type="text" placeholder="Enter middle name" value={formData.middlename || ""} onChange={handleChange} />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="lastname">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control name="lastname" type="text" placeholder="Enter last name" value={formData.lastname || ""} onChange={handleChange} isInvalid={!!errors.lastname} />
                        <Form.Control.Feedback type="invalid">{errors.lastname}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="dob">
                        <Form.Label>Date of Birth</Form.Label>
                        <Form.Control name="dob" type="date" value={formData.dob || ""} onChange={handleChange} />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="imageurl">
                        <Form.Label>Image URL</Form.Label>
                        <Form.Control name="imageurl" type="text" placeholder="Enter image URL" value={formData.imageurl || ""} onChange={handleChange} />
                    </Form.Group>
                </Col>
            </Row>
            <hr />
            {/* Contact Information */}
            <h5 className="mt-3 mb-2">Contact Information</h5>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control name="email" type="email" placeholder="Enter email" value={formData.email || ""} onChange={handleChange} isInvalid={!!errors.email} />
                        <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="alternativemobile">
                        <Form.Label>Alternative Mobile</Form.Label>
                        <Form.Control name="alternativemobile" type="text" placeholder="Enter alternative mobile" value={formData.alternativemobile || ""} onChange={handleChange} />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="mobile">
                        <Form.Label>Mobile</Form.Label>
                        <Form.Control name="mobile" type="text" placeholder="Enter mobile number" value={formData.mobile || ""} onChange={handleChange} />
                    </Form.Group>
                </Col>
            </Row>
            <hr />
            {/* Employment Details */}
            <h5 className="mt-3 mb-2">Employment Details</h5>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="jobtitle">
                        <Form.Label>Job Title</Form.Label>
                        <Form.Control name="jobtitle" type="text" placeholder="Enter job title" value={formData.jobtitle || ""} onChange={handleChange} />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="worklocation">
                        <Form.Label>Work Location</Form.Label>
                        <Form.Control name="worklocation" type="text" placeholder="Enter work location" value={formData.worklocation || ""} onChange={handleChange} />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="employmenttype">
                        <Form.Label>Employment Type</Form.Label>
                        <Form.Select name="employmenttype" value={formData.employmenttype || "Full-time"} onChange={handleChange}>
                            <option>Full-time</option>
                            <option>Part-time</option>
                            <option>Contractor</option>
                            <option>Intern</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="startdate">
                        <Form.Label>Start Date</Form.Label>
                        <Form.Control name="startdate" type="date" value={formData.startdate || ""} onChange={handleChange} />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="department">
                        <Form.Label>Department</Form.Label>
                        <Form.Control name="department" type="text" placeholder="Enter department" value={formData.department || ""} onChange={handleChange} />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="enddate">
                        <Form.Label>End Date</Form.Label>
                        <Form.Control name="enddate" type="date" value={formData.enddate || ""} onChange={handleChange} />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="branchid">
                        <Form.Label>Branch ID</Form.Label>
                    {Array.isArray(branches) && branches.length > 0 && (
                            <Form.Select name="branchid" value={formData.branchid || ""} onChange={handleChange}>
                                <option value="">Select Branch</option>
                                {branches.map((branch) => (
                                    <option key={branch.branchid} value={branch.branchid}>
                                        {branch.name}
                                    </option>
                                ))}
                            </Form.Select>
                        )}
                    </Form.Group>
                </Col>
            </Row>
            <hr />
            {/* Identification Numbers */}
            <h5 className="mt-3 mb-2">Identification Numbers</h5>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="ssnitnumber">
                        <Form.Label>SSNIT Number</Form.Label>
                        <Form.Control name="ssnitnumber" type="text" placeholder="Enter SSNIT number" value={formData.ssnitnumber || ""} onChange={handleChange} />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="taxid">
                        <Form.Label>Tax ID</Form.Label>
                        <Form.Control name="taxid" type="text" placeholder="Enter tax ID" value={formData.taxid || ""} onChange={handleChange} />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="nationalid">
                        <Form.Label>National ID</Form.Label>
                        <Form.Control name="nationalid" type="text" placeholder="Enter national ID" value={formData.nationalid || ""} onChange={handleChange} />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="passportnumber">
                        <Form.Label>Passport Number</Form.Label>
                        <Form.Control name="passportnumber" type="text" placeholder="Enter passport number" value={formData.passportnumber || ""} onChange={handleChange} />
                    </Form.Group>
                </Col>
            </Row>
            <hr />
            {/* Additional Information */}
            <h5 className="mt-3 mb-2">Additional Information</h5>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="gender">
                        <Form.Label>Gender</Form.Label>
                        <Form.Select name="gender" value={formData.gender || ""} onChange={handleChange}>
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="address">
                        <Form.Label>Address</Form.Label>
                        <Form.Control name="address" type="text" placeholder="Enter address" value={formData.address || ""} onChange={handleChange} />
                    </Form.Group>
                </Col>
            </Row>
            <Button variant="primary" type="submit">Submit</Button>
        </Form>
    );
}
