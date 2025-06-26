import React, { useCallback, useEffect, useState } from "react";
import { regions, organizationDefaultBasicInfo, customFetch, customPost, validateFormData } from "../Auth/customFetch";
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

    useEffect(() => {
        if (organizationid) {
            setMessage("Update organization basic information");
            getOrganizationData();
            loadOrganizationImage();
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

    const loadOrganizationImage = useCallback(() => {
        const imageUrl = `${process.env.BASEURL}/organization/profile/image?id=${organizationid}`;
        setSelectedImage(imageUrl);
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

        // Pad mobile with 0 if it doesn't start with 0
        let updatedFormValues = { ...formValues };
        const mobileValue = updatedFormValues.mobile ? updatedFormValues.mobile.trim().toString() : '';
        if (mobileValue &&  mobileValue.length === 9 && !mobileValue.startsWith('0')) { 
            updatedFormValues.mobile = mobileValue.padStart(10, '0');
        }
     
        const handleResponseCallBack = (response) => {
            const { status, message } = response;
            if (status === "exist") return toast.warning(message);
            toast.success(message)
        }
        try {
            if (!organizationid) {
                validateFormData(updatedFormValues, false, ["name", "mobile"], "new/organizations", handleResponseCallBack);
            } else {
                const updateInfo = await customPost("organization/update/basic", "PUT", updatedFormValues);
                toast.success(updateInfo?.message);
            }
        } catch (err) {
            toast.error('Something wrong occurred');
        }
    };

    const uploadImageCall = async (file) => {
        if (!file) return;
        try {
            const formData = new FormData();
            formData.append('organizations', file);

            console.log('Uploading image...');
            const response = await fetch(`http://localhost:5000/api/v1/organization/profile/image?id=${organizationid}`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Upload successful:', result);
                return result;
            } else {
                console.error('Upload failed:', response.statusText);
                return null;
            }
        } catch (error) {
            console.error('Error during upload:', error);
            return null;
        }
    }

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImage(URL.createObjectURL(file));
            await uploadImageCall(file);
        }
    };

    const handleDrop = async (event) => {
        event.preventDefault();
        setDragging(false);
        const file = event.dataTransfer.files[0];
        if (file) {
            setSelectedImage(URL.createObjectURL(file));
            await uploadImageCall(file);
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

    if (isloading) return <Loader />;

    return <>
      <Card className="bg-white ">
        <Card.Header >
          <h5 className="mb-0">{message}</h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={onSubmit} autoComplete="off">
            <Row>
              {organizationid && (
                <Col md={4} className="mb-4">
                  <Form.Group>
                    <Form.Label>Upload Image</Form.Label>
                    <div
                      className={`d-flex flex-column align-items-center justify-content-center border border-2 border-secondary rounded-3 bg-light mb-3${dragging ? ' border-primary' : ''}`}
                      style={{ minHeight: 180, cursor: 'pointer' }}
                      onClick={() => document.getElementById('fileInput').click()}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                    >
                      {selectedImage ? (
                        <img src={selectedImage} alt="Preview" className="img-thumbnail" style={{ maxWidth: '100%', maxHeight: 160, borderRadius: 8 }} />
                      ) : (
                        <span className="text-secondary">Drag & drop or click to select an image</span>
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
              )}
              <Col md={organizationid ? 8 : 12}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formName">
                      <Form.Label>Org. name</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type="text"
                          autoComplete="off"
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
                    <Form.Group className="mb-3" controlId="formLocation">
                      <Form.Label>Location</Form.Label>
                      <Form.Control
                        type="text"
                        autoComplete="off"
                        placeholder="Location"
                        name="location"
                        value={formValues.location}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formStreet">
                      <Form.Label>Street name</Form.Label>
                      <Form.Control
                        type="text"
                        autoComplete="off"
                        placeholder="Street name"
                        name="street"
                        value={formValues.street}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formMobile">
                      <Form.Label>Mobile number</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type="tel"
                          autoComplete="off"
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
                    <Form.Group className="mb-3" controlId="formAddress">
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        type="text"
                        autoComplete="off"
                        placeholder="Kalpohin lowcost 30A"
                        name="address"
                        value={formValues.address}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formEmail">
                      <Form.Label>Email address</Form.Label>
                      <Form.Control
                        type="email"
                        autoComplete="off"
                        placeholder="mylab@ymail.com"
                        name="email"
                        value={formValues.email}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formWebsite">
                      <Form.Label>Website</Form.Label>
                      <Form.Control
                        type="url"
                        autoComplete="off"
                        placeholder="mylab.com"
                        name="website"
                        value={formValues.website}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formGpsMapping">
                      <Form.Label>GPS Address</Form.Label>
                      <Form.Control
                        type="text"
                        autoComplete="off"
                        placeholder="NS-1004-383"
                        name="gpsmapping"
                        value={formValues.gpsmapping}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formRegion">
                      <Form.Label>Region</Form.Label>
                      <Form.Select
                        name="region"
                        autoComplete="off"
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
                    <Form.Group className="mb-3" controlId="type">
                      <Form.Label>Type of Organization</Form.Label>
                      <Form.Control
                        as="select"
                        name="type"
                        autoComplete="off"
                        value={formValues.type}
                        onChange={handleChange}
                      >
                        <option value="">Select...</option>
                        <option value="hospital">Hospital</option>
                        <option value="clinic">Clinic</option>
                        <option value="research">Research Facility</option>
                      </Form.Control>
                    </Form.Group>
                  </Col>
                </Row>
                <div className="mt-3">
                  <Button variant="primary" type="submit">
                    {organizationid ? "Update" : "Add"}
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
          <ToastContainer theme="colored" position="top-center" className={'text-sm'} />
        </Card.Body>
      </Card>
    </>;
}
