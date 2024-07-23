import React, { useCallback, useEffect, useState } from "react";
import { regions, organizationDefaultBasicInfo, handleResponse, customFetch, customPost, validateFormData } from "../Auth/customFetch";
import Loader from "../accessories/Loader";
import { Button, Form, InputGroup, Card, Row, Col } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';

export default function OrganizationBasicForm({ organizationid }) {
    const [data, setData] = useState(organizationDefaultBasicInfo);
    const [message, setMessage] = useState("Add new organization");
    const [isloading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [formValues, setFormValues] = useState(organizationDefaultBasicInfo);
    const [formErrors, setFormErrors] = useState({});
    const [rawfile, setRawFiles] = useState(null);

    useEffect(() => {
        if (organizationid) {
            setMessage("Update organization basic information");
            getOrganizationData();
        }
    }, [organizationid]);

    const getOrganizationData = useCallback(() => {
        setLoading(true);
        customFetch(`organization/basic?id=${organizationid}`)
            .then((response) => {
                const { statusCode, status, result } = response;
                if (statusCode === 200 && status === "success") {
                    setData(result[0]);
                    setFormValues(result[0]);
                }
                setLoading(false);
            })
            .catch(() => {
                setData(organizationDefaultBasicInfo);
                alert("Error getting data;");
                setLoading(false);
            });
    }, [organizationid]);

    const validateFields = (formData) => {
        const errors = {};
        if (!formData.name) {
            errors.name = "Organization name is required";
        }
        if (!formData.mobile) {
            errors.mobile = "Mobile number is required";
        } else if (!/^[0-9]{10}$/.test(formData.mobile)) {
            errors.mobile = "Mobile number must be 10 digits";
        }
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = "Invalid email address";
        }
        if (formData.website && !/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(formData.website)) {
            errors.website = "Invalid URL";
        }
        return errors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues({
            ...formValues,
            [name]: value,
        });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateFields(formValues);
        if (Object.keys(validationErrors).length) {
            setFormErrors(validationErrors);
            return;
        }

        try {
            if (!organizationid) {
                validateFormData(formValues, false, ["name", "mobile"], "new/organizations", handleResponse);
            } else {
                const updateInfo = await customPost("organization/update/basic", "PUT", formValues);
                toast.success(updateInfo?.message);
            }
        } catch (err) {
            toast.error('something wrong occurred');
        }
    };



    const uploadImageCall = async function () {
        if (!selectedImage) return;
        try {
            const formData = new FormData();
            formData.append('organizationImage', file);
            const response = await fetch('/organization/profile/image', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                toast.success('Image uploaded successfully');
            } else {
                toast.error('Failed to upload image');
            }
        } catch (error) {
            toast.error('An error occurred during image upload');
        }
    }

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        setRawFiles(file);
        if (file) {
            setSelectedImage(URL.createObjectURL(file));
        }
    };

    const handleDrop = async (event) => {
        event.preventDefault();
        setDragging(false);
        const file = event.dataTransfer.files[0];
        setRawFiles(file);
        if (file) {
            setSelectedImage(URL.createObjectURL(file));
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        setDragging(false);
    };

    const renderingFormView = () => {
        if (isloading) return <Loader />;
        return (
            <Card className="bg-white p-4">
                <Card.Header className="bg-secondary text-white">
                    <h5>{message}</h5>
                </Card.Header>
                <Card.Body>
                    <Form onSubmit={onSubmit}>
                        <Row>
                            <Col md={4}>
                                {/* Image Upload */}
                                <Form.Group>
                                    <Form.Label>Upload Image</Form.Label>
                                    <div
                                        style={{
                                            height: '300px',
                                            width: '100%',
                                            border: '2px dashed #ddd',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: dragging ? '#f0f0f0' : '#fff',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => document.getElementById('fileInput').click()}
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                    >
                                        {selectedImage ? (
                                            <img src={selectedImage} alt="Preview" style={{ maxHeight: '100%', maxWidth: '100%' }} className="img-thumbnail" />
                                        ) : (
                                            <span>Drag & drop or click to select an image</span>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        id="fileInput"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        style={{ display: 'none' }}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={8}>
                                {/* Form Fields */}
                                <Form.Group className="grid-reg my-2" controlId="formName">
                                    <Form.Label>Org. name</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            className="custom-input"
                                            type="text"
                                            placeholder="Organization name"
                                            name="name"
                                            value={formValues.name}
                                            onChange={handleChange}
                                            isInvalid={!!formErrors.name}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formErrors.name}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="grid-reg my-2" controlId="formLocation">
                                    <Form.Label>Location</Form.Label>
                                    <Form.Control
                                        className="custom-input"
                                        type="text"
                                        placeholder="Location"
                                        name="location"
                                        value={formValues.location}
                                        onChange={handleChange}
                                    />
                                </Form.Group>

                                <Form.Group className="grid-reg my-2" controlId="formStreet">
                                    <Form.Label>Street name</Form.Label>
                                    <Form.Control
                                        className="custom-input"
                                        type="text"
                                        placeholder="Street name"
                                        name="street"
                                        value={formValues.street}
                                        onChange={handleChange}
                                    />
                                </Form.Group>

                                <Form.Group className="grid-reg my-2" controlId="formMobile">
                                    <Form.Label>Mobile number</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            className="custom-input"
                                            type="tel"
                                            minLength={10}
                                            maxLength={10}
                                            inputMode="tel"
                                            placeholder="0595964565"
                                            name="mobile"
                                            value={formValues.mobile}
                                            onChange={handleChange}
                                            isInvalid={!!formErrors.mobile}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formErrors.mobile}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="grid-reg my-2" controlId="formAddress">
                                    <Form.Label>Address</Form.Label>
                                    <Form.Control
                                        className="custom-input"
                                        type="text"
                                        placeholder="Kalpohin lowcost 30A"
                                        name="address"
                                        value={formValues.address}
                                        onChange={handleChange}
                                    />
                                </Form.Group>

                                <Form.Group className="grid-reg my-2" controlId="formEmail">
                                    <Form.Label>Email address</Form.Label>
                                    <Form.Control
                                        className="custom-input"
                                        type="email"
                                        placeholder="mylab@ymail.com"
                                        name="email"
                                        value={formValues.email}
                                        onChange={handleChange}
                                    />
                                </Form.Group>

                                <Form.Group className="grid-reg my-2" controlId="formWebsite">
                                    <Form.Label>Website</Form.Label>
                                    <Form.Control
                                        className="custom-input"
                                        type="text"
                                        placeholder="mylab.com"
                                        name="website"
                                        value={formValues.website}
                                        onChange={handleChange}
                                    />
                                </Form.Group>

                                <Form.Group className="grid-reg my-2" controlId="formGpsMapping">
                                    <Form.Label>GPS Address</Form.Label>
                                    <Form.Control
                                        className="custom-input"
                                        type="text"
                                        placeholder="NS-1004-383"
                                        name="gpsmapping"
                                        value={formValues.gpsmapping}
                                        onChange={handleChange}
                                    />
                                </Form.Group>

                                <Form.Group className="grid-reg my-2" controlId="formRegion">
                                    <Form.Label>Region</Form.Label>
                                    <Form.Select
                                        className="custom-input"
                                        name="region"
                                        value={formValues.region}
                                        onChange={handleChange}
                                    >
                                        {regions.map((region, index) => (
                                            <option key={index} value={region}>
                                                {region}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Button variant="primary" type="submit">
                                    {organizationid ? "Update" : "Add"}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                    <ToastContainer />
                </Card.Body>
            </Card>
        );
    };

    return <>{renderingFormView()}</>;
}
